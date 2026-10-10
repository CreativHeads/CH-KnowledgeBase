// Sign-in: Microsoft 365 (Entra ID) as the main route, with an email + password fallback
// so an admin can always get in. Sessions live in the database, so any serverless instance sees them.
const crypto = require("crypto");
const { all, one, query } = require("./db");
const { HttpError, cookies, setCookie, clearCookie, clientIp } = require("./http");
const throttle = require("./throttle");

const COOKIE = "br_sid";
const STATE_COOKIE = "br_oidc";
const DAYS = 14;

// A value still left as the example placeholder counts as not filled in, so the app never
// offers a sign-in button that cannot work.
const placeholder = (v) => !v || /^(your-|change-me|xxxx)/i.test(v) || v.includes("YOUR-");
const env = (k, d = "") => { const v = (process.env[k] || "").trim(); return placeholder(v) ? d : v; };
const msConfigured = () => !!(env("MS_CLIENT_ID") && env("MS_CLIENT_SECRET") && env("MS_TENANT_ID"));
// Signs the short-lived Microsoft sign-in cookie. A public site must never run on a guessable secret,
// so on Vercel a missing or short one is an error rather than a quiet fallback.
const secret = () => {
  const s = env("APP_SECRET");
  if (s.length >= 24) return s;
  if (process.env.VERCEL) throw new HttpError(500, "APP_SECRET is not set (at least 24 characters). Add it in Vercel's environment variables.");
  return "local-development-only-secret";
};

const sign = (v) => crypto.createHmac("sha256", secret()).update(v).digest("base64url");
const b64 = (o) => Buffer.from(JSON.stringify(o)).toString("base64url");
const unb64 = (s) => JSON.parse(Buffer.from(s, "base64url").toString("utf8"));

function baseUrl(req) {
  const fixed = env("APP_URL");
  if (fixed) return fixed.replace(/\/$/, "");
  const host = req.headers["x-forwarded-host"] || req.headers.host;
  const proto = req.headers["x-forwarded-proto"] || "https";
  return `${proto}://${host}`;
}
const redirectUri = (req) => `${baseUrl(req)}/api/auth/microsoft/callback`;

/* ---------- passwords (same scrypt format as the local app, so existing passwords work) ---------- */
const hashPassword = (pw) => { const salt = crypto.randomBytes(16); return `scrypt$${salt.toString("hex")}$${crypto.scryptSync(pw, salt, 64).toString("hex")}`; };
function checkPassword(pw, stored) {
  const [, s, h] = String(stored || "").split("$");
  if (!s || !h) return false;
  const calc = crypto.scryptSync(pw, Buffer.from(s, "hex"), 64);
  const want = Buffer.from(h, "hex");
  return calc.length === want.length && crypto.timingSafeEqual(calc, want);
}

/* ---------- sessions ---------- */
async function startSession(res, userId) {
  const token = crypto.randomBytes(32).toString("hex");
  await query("DELETE FROM sessions WHERE expires < now()").catch(() => {}); // tidy up as we go
  await query("INSERT INTO sessions(token, user_id, expires) VALUES ($1,$2, now() + interval '14 days')", [token, userId]);
  setCookie(res, COOKIE, token, { maxAge: DAYS * 86400 });
  return { ok: true };
}
async function sessionUser(req) {
  const t = cookies(req)[COOKIE];
  if (!t) return null;
  const u = await one(
    `SELECT u.* FROM sessions s JOIN users u ON u.id = s.user_id
      WHERE s.token = $1 AND s.expires > now() AND u.active`, [t]);
  return u || null;
}
async function endSession(req, res) {
  const t = cookies(req)[COOKIE];
  if (t) await query("DELETE FROM sessions WHERE token = $1", [t]);
  clearCookie(res, COOKIE);
}

// A stand-in hash, so a wrong email costs the same time as a wrong password. Without it, response
// speed would tell an attacker which emails have accounts.
const DUMMY_HASH = hashPassword("not-a-real-password");

// 8 wrong tries per email and 40 per address, per 10 minutes. Kept in the database so every serverless
// copy of the site sees the same count.
async function loginWithPassword(req, res, email, password) {
  const key = "login:" + String(email || "").toLowerCase().trim().slice(0, 200);
  const ip = "ip:" + clientIp(req);
  if ((await throttle.blocked(key, 8, 600)) || (await throttle.blocked(ip, 40, 600)))
    throw new HttpError(429, "Too many attempts. Wait 10 minutes and try again.");

  const pw = String(password || "");
  const u = pw.length <= 200 ? await one("SELECT * FROM users WHERE lower(email) = $1 AND active", [key.slice(6)]) : null;
  const ok = pw.length <= 200 && checkPassword(pw, u?.pass_hash || DUMMY_HASH) && !!u?.pass_hash;
  if (!u || !ok) {
    await throttle.fail(key, 600);
    await throttle.fail(ip, 600);
    throw new HttpError(401, "Wrong email or password.");
  }
  await throttle.clear(key);
  await query("UPDATE users SET last_seen_at = now() WHERE id = $1", [u.id]);
  return startSession(res, u.id);
}

/* ---------- Microsoft 365 ---------- */
// The state and nonce travel in a short-lived signed cookie, so no server memory is needed.
function microsoftStart(req, res) {
  if (!msConfigured()) throw new HttpError(503, "Microsoft sign-in is not set up yet.");
  const state = crypto.randomBytes(16).toString("hex");
  const nonce = crypto.randomBytes(16).toString("hex");
  const payload = b64({ state, nonce, at: Date.now() });
  setCookie(res, STATE_COOKIE, `${payload}.${sign(payload)}`, { maxAge: 900 });
  const p = new URLSearchParams({
    client_id: env("MS_CLIENT_ID"), response_type: "code", redirect_uri: redirectUri(req),
    response_mode: "query", scope: "openid profile email", state, nonce, prompt: "select_account",
  });
  return `https://login.microsoftonline.com/${encodeURIComponent(env("MS_TENANT_ID", "organizations"))}/oauth2/v2.0/authorize?${p}`;
}

async function microsoftFinish(req, res, code, state) {
  const raw = cookies(req)[STATE_COOKIE] || "";
  clearCookie(res, STATE_COOKIE);
  const [payload, mac] = raw.split(".");
  if (!payload || !mac || sign(payload) !== mac) throw new HttpError(400, "Sign-in expired. Try again.");
  const st = unb64(payload);
  if (Date.now() - st.at > 15 * 60e3) throw new HttpError(400, "Sign-in expired. Try again.");
  if (!state || state !== st.state) throw new HttpError(400, "Sign-in check failed. Try again.");

  const r = await fetch(`https://login.microsoftonline.com/${encodeURIComponent(env("MS_TENANT_ID", "organizations"))}/oauth2/v2.0/token`, {
    method: "POST", headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ client_id: env("MS_CLIENT_ID"), client_secret: env("MS_CLIENT_SECRET"), code, redirect_uri: redirectUri(req), grant_type: "authorization_code", scope: "openid profile email" }),
  });
  const d = await r.json().catch(() => ({}));
  if (!r.ok) throw new HttpError(401, "Microsoft sign-in failed: " + String(d.error_description || d.error || r.status).split("\r")[0]);

  const claims = JSON.parse(Buffer.from(String(d.id_token).split(".")[1], "base64url").toString("utf8"));
  if (claims.nonce !== st.nonce) throw new HttpError(400, "Sign-in check failed. Try again.");
  if (claims.aud !== env("MS_CLIENT_ID")) throw new HttpError(400, "That sign-in was for a different app.");
  const tenant = env("MS_TENANT_ID");
  if (tenant && !["common", "organizations"].includes(tenant) && claims.tid !== tenant) throw new HttpError(403, "That Microsoft account belongs to a different organisation.");

  const email = String(claims.email || claims.preferred_username || claims.upn || "").toLowerCase().trim();
  if (!/^[^@\s]+@[^@\s]+$/.test(email)) throw new HttpError(400, "That Microsoft account has no email address.");

  let u = await one("SELECT * FROM users WHERE lower(email) = $1", [email]);
  if (u && !u.active) throw new HttpError(403, "That account has been switched off. Ask an admin.");
  if (!u) {
    const domain = env("MS_ALLOWED_DOMAIN").toLowerCase();
    if (domain && !email.endsWith("@" + domain.replace(/^@/, ""))) throw new HttpError(403, `Only ${domain} accounts can use this workspace.`);
    const first = !(await one("SELECT 1 FROM users LIMIT 1"));
    const role = first ? "admin" : ["admin", "head", "staff"].includes(env("MS_DEFAULT_ROLE")) ? env("MS_DEFAULT_ROLE") : "staff";
    u = await one("INSERT INTO users(email, name, role) VALUES ($1,$2,$3) RETURNING *", [email, claims.name || email, role]);
  } else if (claims.name && claims.name !== u.name) {
    await query("UPDATE users SET name = $1 WHERE id = $2", [claims.name, u.id]);
  }
  await query("UPDATE users SET last_seen_at = now() WHERE id = $1", [u.id]);
  await startSession(res, u.id);
  return u;
}

const canEdit = (u) => !!u && ["admin", "head"].includes(u.role);
function need(u) { if (!u) throw new HttpError(401, "Please sign in."); return u; }
function needEditor(u) { need(u); if (!canEdit(u)) throw new HttpError(403, "Only admins and heads can change brand knowledge. Staff can view it."); return u; }
function needAdmin(u) { need(u); if (u.role !== "admin") throw new HttpError(403, "Only an admin can do that."); return u; }

module.exports = {
  COOKIE, msConfigured, baseUrl, redirectUri, hashPassword, checkPassword,
  startSession, sessionUser, endSession, loginWithPassword, microsoftStart, microsoftFinish,
  canEdit, need, needEditor, needAdmin, all, one, query,
};
