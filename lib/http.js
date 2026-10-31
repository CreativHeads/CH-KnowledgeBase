// Small request/response helpers shared by the API handler.
class HttpError extends Error { constructor(status, message) { super(message); this.status = status; } }

const json = (res, status, data) => {
  res.statusCode = status;
  res.setHeader("content-type", "application/json; charset=utf-8");
  res.setHeader("cache-control", "no-store");
  res.end(JSON.stringify(data));
};

// Small by default. Routes that take file uploads ask for more.
async function readBody(req, limit = 1e6) {
  if (req.body && typeof req.body === "object" && !Buffer.isBuffer(req.body)) return req.body; // Vercel already parsed it
  let size = 0; const chunks = [];
  for await (const c of req) { size += c.length; if (size > limit) throw new HttpError(413, "That is too much data for one request."); chunks.push(c); }
  const raw = Buffer.concat(chunks).toString("utf8").trim();
  if (!raw) return {};
  try { return JSON.parse(raw); } catch { throw new HttpError(400, "The request was not valid JSON."); }
}

const cookies = (req) => Object.fromEntries(
  (req.headers.cookie || "").split(";").map((c) => { const i = c.indexOf("="); return i < 0 ? null : [c.slice(0, i).trim(), decodeURIComponent(c.slice(i + 1).trim())]; }).filter(Boolean)
);

// True when the app runs online: on Vercel, or on your own server behind Nginx (TRUST_PROXY=1). Online, secrets are
// mandatory, cookies are HTTPS-only, and the address Nginx reports is trusted.
const hosted = () => !!(process.env.VERCEL || process.env.TRUST_PROXY === "1");

function setCookie(res, name, value, { maxAge = null, httpOnly = true } = {}) {
  // Secure cookies on anything served over HTTPS (Vercel, or an https APP_URL).
  const secure = hosted() || /^https:/i.test(process.env.APP_URL || "") ? "; Secure" : "";
  const parts = [`${name}=${encodeURIComponent(value)}`, "Path=/", "SameSite=Lax"];
  if (httpOnly) parts.push("HttpOnly");
  if (maxAge != null) parts.push(`Max-Age=${maxAge}`);
  const prev = res.getHeader("set-cookie");
  const line = parts.join("; ") + secure;
  res.setHeader("set-cookie", prev ? [].concat(prev, line) : [line]);
}
const clearCookie = (res, name) => setCookie(res, name, "", { maxAge: 0 });

// The caller's address, for slowing down guessing. On Vercel the platform sets x-forwarded-for itself, and on your own
// server Nginx overwrites it with the real address, so its first entry is the real client. Anywhere else, only the
// connection itself can be trusted.
function clientIp(req) {
  if (hosted()) {
    const first = String(req.headers["x-forwarded-for"] || "").split(",")[0].trim();
    if (first) return first;
  }
  return req.socket?.remoteAddress || "unknown";
}

// A numeric id from a URL or body. Anything else becomes -1, which matches no row, instead of crashing the query.
const num = (v) => { const n = Number(v); return Number.isSafeInteger(n) && n > 0 ? n : -1; };

module.exports = { hosted, num, HttpError, json, readBody, cookies, setCookie, clearCookie, clientIp };
