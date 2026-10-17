// Read-only knowledge API for other tools (the SEO agent, scripts, other bots).
//
// Authenticated with a key, not a browser session. A key can read brand knowledge and nothing else:
// no writes, and never anything marked internal (locked fields, internal notes, team-only documents).
//
// Keys come from the KB_API_KEYS environment variable:  name:key,name2:key2
// Each key must be at least 24 characters. Name them after what uses them, e.g. "seo-agent".
const crypto = require("crypto");
const { all, one, query } = require("./db");
const { HttpError, clientIp, num } = require("./http");
const throttle = require("./throttle");
const ws = require("./workspace");
const docs = require("./documents");
const storage = require("./storage");
const { hashKey } = require("./libraries");

const MIN_KEY = 24;

function keys() {
  return String(process.env.KB_API_KEYS || "").split(",").map((p) => p.trim()).filter(Boolean).map((p) => {
    const i = p.indexOf(":");
    return i > 0 ? { name: p.slice(0, i).trim(), key: p.slice(i + 1).trim() } : null;
  }).filter((k) => k && k.key.length >= MIN_KEY && !/^(your-|change-me|xxxx)/i.test(k.key));
}

// Compares in constant time, so response timing cannot be used to guess a key.
function needScope(who, scope) {
  if (who.scopes.includes("*") || who.scopes.includes(scope)) return;
  throw new HttpError(403, "This key cannot call that.");
}
const hostOf = (v) => {
  const s = String(v || "").trim().toLowerCase();
  if (!s) return "";
  try { return new URL(/^https?:\/\//.test(s) ? s : "https://" + s).hostname.replace(/^www\./, ""); } catch { return s.replace(/^https?:\/\//, "").replace(/^www\./, "").split("/")[0]; }
};
const normPhone = (v) => {
  const d = String(v || "").replace(/\D/g, "");
  if (d.length === 10) return "91" + d;
  return d;
};
const signSecret = () => {
  const s = (process.env.APP_SECRET || "").trim();
  if (s.length >= 24) return s;
  if (process.env.VERCEL) throw new HttpError(500, "APP_SECRET is not set.");
  return "local-development-only-secret";
};
function signedRefPath(id) {
  const exp = Date.now() + 10 * 60 * 1000;
  const payload = `${id}.${exp}`;
  const sig = crypto.createHmac("sha256", signSecret()).update(payload).digest("base64url");
  return `/api/kb/v1/refs/${id}?exp=${exp}&sig=${sig}`;
}

async function authenticate(req) {
  const list = keys();
  const m = /^Bearer\s+(.+)$/i.exec(req.headers.authorization || "");
  if (!m) throw new HttpError(401, "Send your key as: Authorization: Bearer <key>");
  const ip = "kb:" + clientIp(req);
  if (await throttle.blocked(ip, 20, 600)) throw new HttpError(429, "Too many wrong keys from this address. Wait 10 minutes.");
  const given = Buffer.from(m[1].trim());
  let found = null;
  for (const k of list) {
    const want = Buffer.from(k.key);
    if (want.length === given.length && crypto.timingSafeEqual(want, given)) found = k;
  }
  if (found) return { name: found.name, scopes: ["*"], id: null, prefix: found.name };
  const row = await one("SELECT * FROM api_keys WHERE key_hash = $1", [hashKey(m[1].trim())]);
  if (!row || !row.active || row.revoked_at) {
    if (!list.length && !(await one("SELECT 1 FROM api_keys WHERE active AND revoked_at IS NULL LIMIT 1")))
      throw new HttpError(503, "The knowledge API is switched off. Set KB_API_KEYS, or create a bot key in Settings.");
    await throttle.fail(ip, 600);
    throw new HttpError(401, row && row.revoked_at ? "This key has been revoked." : "That key is not recognised.");
  }
  if (row.expires_at && new Date(row.expires_at).getTime() < Date.now()) throw new HttpError(401, "This key has expired.");
  const recent = await one("SELECT COUNT(*)::int AS n FROM api_access_log WHERE api_key_id = $1 AND created_at > now() - interval '1 minute'", [row.id]);
  if (recent.n >= row.rate_limit_per_min) throw new HttpError(429, "Too many requests. Wait a minute.");
  return { name: row.name, scopes: row.scopes || [], id: row.id, prefix: row.key_prefix };
}

async function touch(who, endpoint, status, error, req) {
  if (!who) return;
  await query(
    "INSERT INTO api_access_log(api_key_id, key_prefix, endpoint, status_code, error, ip) VALUES ($1,$2,$3,$4,$5,$6)",
    [who.id, who.prefix, endpoint, status, error ? String(error).slice(0, 300) : null, clientIp(req).slice(0, 64)]
  ).catch(() => {});
  if (who.id && status !== 401) await query("UPDATE api_keys SET last_used_at = now() WHERE id = $1", [who.id]).catch(() => {});
}

/* ---------- shaping ---------- */
const publicClient = (row) => ws.outClient(row, { withInternal: false });
const aliasesOf = (b) => String(b.fields.aliases || "").split(",").map((x) => x.trim()).filter(Boolean);

const summary = (row) => {
  const b = publicClient(row);
  return {
    slug: b.id, name: b.name, industry: b.industry, location: b.location, status: b.status,
    website: b.fields.website || null, aliases: aliasesOf(b), tagline: b.fields.tagline || null,
    updatedAt: b.updatedAt,
  };
};

async function listClients({ q, website, status }) {
  const rows = await all("SELECT * FROM clients ORDER BY name");
  let out = rows.filter((r) => !status || r.status === status);
  if (website) {
    const want = hostOf(website);
    out = out.filter((r) => hostOf(publicClient(r).fields.website) === want);
  }
  if (q) {
    const needle = String(q).toLowerCase();
    out = out.filter((r) => {
      const b = publicClient(r);
      return [b.name, b.industry, ...aliasesOf(b)].join(" ").toLowerCase().includes(needle);
    });
  }
  return out.map(summary);
}

const hasScope = (who, scope) => !!who && (who.scopes.includes("*") || who.scopes.includes(scope));

async function getClient(slug, { include = "", who = null } = {}) {
  const row = await ws.clientOr404(slug);
  const b = publicClient(row);
  const out = { ...summary(row), colour: b.colour, fields: b.fields };
  const want = new Set(String(include).split(",").map((s) => s.trim()));
  // The shortcut must not hand over more than the key's own scopes allow: examples need "examples",
  // the documents list needs "assets". Anything the key may not see is left out and named in "omitted".
  const omitted = [];
  if (want.has("examples") && !hasScope(who, "examples")) { want.delete("examples"); omitted.push("examples"); }
  if (want.has("documents") && !hasScope(who, "assets")) { want.delete("documents"); omitted.push("documents"); }
  if (omitted.length) out.omitted = omitted;
  if (want.has("examples")) {
    const ex = await all("SELECT platform, language, verdict, body, reason, featured FROM examples WHERE client_id = $1 AND NOT internal ORDER BY featured DESC, created_at DESC", [row.id]);
    out.examples = ex.map((e) => ({ platform: e.platform, language: e.language, verdict: e.verdict, text: e.body, reason: e.reason, featured: e.featured }));
  }
  if (want.has("documents")) out.documents = await listDocuments(row);
  return out;
}

async function listDocuments(row) {
  const d = await all("SELECT * FROM documents WHERE client_id = $1 AND NOT internal ORDER BY created_at DESC", [row.id]);
  return d.map((x) => ({ id: String(x.id), name: x.name, kind: docs.kindOf(x.mime), pages: x.pages, chars: x.chars, readable: x.status === "ready", addedAt: new Date(x.created_at).toISOString() }));
}

async function getDocument(slug, id) {
  const row = await ws.clientOr404(slug);
  const d = await one("SELECT * FROM documents WHERE id = $1 AND client_id = $2 AND NOT internal", [num(id), row.id]);
  if (!d) throw new HttpError(404, "Document not found.");
  return { id: String(d.id), name: d.name, kind: docs.kindOf(d.mime), pages: d.pages, chars: d.chars, readable: d.status === "ready", text: d.status === "ready" ? d.body : "" };
}

/* ---------- search ---------- */
const snippet = (text, needle, radius = 90) => {
  const t = String(text || "").replace(/\s+/g, " ");
  const i = t.toLowerCase().indexOf(needle);
  if (i < 0) return t.slice(0, radius * 2);
  return (i > radius ? "…" : "") + t.slice(Math.max(0, i - radius), i + needle.length + radius) + (i + needle.length + radius < t.length ? "…" : "");
};

async function search(q, { slug, limit = 20 } = {}) {
  const needle = String(q || "").trim().toLowerCase().slice(0, 200);
  const like = `%${needle.replace(/[\\%_]/g, (c) => "\\" + c)}%`; // a typed % or _ matches itself, not "anything"
  if (needle.length < 2) throw new HttpError(400, "Search for at least 2 characters.");
  const clients = (await all("SELECT * FROM clients ORDER BY name")).filter((c) => !slug || c.slug === slug);
  const byId = new Map(clients.map((c) => [String(c.id), c]));
  const hits = [];

  for (const c of clients) {
    const b = publicClient(c);
    for (const [key, value] of Object.entries(b.fields)) {
      if (String(value).toLowerCase().includes(needle)) hits.push({ client: c.slug, clientName: c.name, type: "field", field: key, snippet: snippet(value, needle) });
    }
  }
  if (clients.length) {
    const ids = clients.map((c) => c.id);
    const ex = await all("SELECT client_id, verdict, body FROM examples WHERE NOT internal AND client_id = ANY($1::bigint[]) AND lower(body) LIKE $2 ESCAPE '\\'", [ids, like]);
    for (const e of ex) { const c = byId.get(String(e.client_id)); if (c) hits.push({ client: c.slug, clientName: c.name, type: "example", verdict: e.verdict, snippet: snippet(e.body, needle) }); }
    const dc = await all("SELECT id, client_id, name, body FROM documents WHERE NOT internal AND status = 'ready' AND client_id = ANY($1::bigint[]) AND lower(body) LIKE $2 ESCAPE '\\'", [ids, like]);
    for (const d of dc) { const c = byId.get(String(d.client_id)); if (c) hits.push({ client: c.slug, clientName: c.name, type: "document", documentId: String(d.id), document: d.name, snippet: snippet(d.body, needle) }); }
  }
  return { query: q, count: hits.length, truncated: hits.length > limit, results: hits.slice(0, limit) };
}

const lines = (v) => String(v || "").split(/\n|,/).map((s) => s.trim()).filter(Boolean);
const handlesOf = (v) => lines(v).map((h) => {
  const [platform, handle] = h.includes(":") ? h.split(/:(.*)/s).slice(0, 2) : ["", h];
  return { platform: platform.trim().toLowerCase(), handle: handle.trim().replace(/^@/, "").toLowerCase() };
});

async function qcContext(row, q) {
  const b = publicClient(row);
  const f = b.fields;
  const refs = await all("SELECT * FROM refs WHERE client_id = $1 AND kind IN ('Logo','Logo variant') ORDER BY id DESC", [row.id]);
  const creatives = await all("SELECT * FROM refs WHERE client_id = $1 AND verdict IN ('do','dont') ORDER BY id DESC LIMIT 10", [row.id]);
  const checklist = await all("SELECT title, body, meta FROM agency_items WHERE library = 'qc' AND status = 'approved' ORDER BY title");
  return {
    client: { slug: b.id, name: b.name },
    brand: {
      colours: lines(f.colours), fonts: f.fonts || null, logoRules: f.logoRules || null,
      logoRefs: refs.map((r) => ({ kind: r.kind, title: r.name, url: signedRefPath(r.id) })),
    },
    contact: {
      phones: lines(f.phones).map((display) => ({ display, normalised: normPhone(display) })),
      website: hostOf(f.website) || null,
      handles: handlesOf(f.handles),
      address: f.address || null,
    },
    offers: f.offers || null,
    rules: { wordsToAvoid: lines(f.wordsAvoid), bannedClaims: lines(f.bannedClaims), disclaimer: f.disclaimer || null, compliance: f.compliance || null },
    format: { platform: q.platform || null, rules: f.format || null },
    checklist: checklist.map((c) => ({ category: c.title, check: c.body, severity: (c.meta && c.meta.severity) || "should" })),
    referenceCreatives: creatives.map((r) => ({ verdict: r.verdict, why: r.why, platform: r.platform, url: signedRefPath(r.id), onedriveUrl: r.onedrive_url || null })),
    generatedAt: new Date().toISOString(),
  };
}

async function detectionIndex() {
  const clients = await all("SELECT * FROM clients WHERE status = 'active' ORDER BY name");
  const refs = await all("SELECT * FROM refs ORDER BY id DESC");
  return clients.map((row) => {
    const b = publicClient(row);
    const f = b.fields;
    return {
      slug: b.id, name: b.name, aliases: aliasesOf(b), keywords: lines(f.keywords),
      colours: lines(f.colours), phones: lines(f.phones).map(normPhone).filter(Boolean),
      website: hostOf(f.website) || null, handles: handlesOf(f.handles),
      visualRefs: refs.filter((r) => String(r.client_id) === String(row.id)).map((r) => ({
        id: String(r.id), kind: r.kind, title: r.name, description: r.description, url: signedRefPath(r.id),
      })),
    };
  });
}

function adsContext(row) {
  const f = publicClient(row).fields;
  return { accounts: f.adAccounts || null, budget: f.adBudgets || null, areas: f.adAreas || null, kpis: f.adKpis || null };
}
function seoContext(row) {
  const f = publicClient(row).fields;
  return { keywords: f.seoKeywords || null, competitors: f.seoCompetitors || null, pages: f.sitePages || null, website: hostOf(f.website) || null, handles: handlesOf(f.handles) };
}

/* ---------- routing ---------- */
const INDEX = {
  name: "Brandroom knowledge API",
  version: 1,
  access: "read-only. Internal fields, internal notes, competitor notes and team-only documents are never returned. Onboarding drafts are never returned.",
  auth: "Authorization: Bearer <key>",
  endpoints: {
    "GET /api/kb/v1/clients": "List clients. Scope: clients",
    "GET /api/kb/v1/clients/:slug": "One client's brand knowledge. Scope: clients",
    "GET /api/kb/v1/clients/:slug/context": "Writing bundle. Scope: writing",
    "GET /api/kb/v1/clients/:slug/qc-context": "Quality-check bundle. Scope: qc",
    "GET /api/kb/v1/clients/:slug/ads-context": "Ad targets. Scope: ads",
    "GET /api/kb/v1/clients/:slug/seo-context": "SEO starting list. Scope: seo",
    "GET /api/kb/v1/clients/:slug/reference-creatives": "Do and don't creatives. Scope: examples",
    "GET /api/kb/v1/detection-index": "What a bot needs to recognise a client. Scope: detect",
    "GET /api/kb/v1/agency/:library": "Approved agency items. Scope: agency",
    "GET /api/kb/v1/skills": "Live skills this key may load.",
    "GET /api/kb/v1/skills/:slug": "One live skill. Scope: skill:<slug>",
    "GET /api/kb/v1/search?q=": "Search. Scope: search",
    "POST /api/kb/v1/bot/corrections": "Alias suggestions from a correction. Scope: bot:log",
    "POST /api/kb/v1/bot/usage/reserve": "Reserve AI spend against the monthly cap. Scope: bot:log",
    "POST /api/kb/v1/bot/usage/:id/complete": "Record the real call. Scope: bot:log",
  },
};

async function handle(path, q, req) {
  let who = null;
  try {
    who = await authenticate(req);
    const data = await dispatch(who, path, q);
    await touch(who, path, 200, null, req);
    return data;
  } catch (e) {
    await touch(who, path, e.status || 500, e.message, req);
    throw e;
  }
}

async function dispatch(who, path, q) {
  const rest = path.replace(/^\/api\/kb\/v1\/?/, "").replace(/\/$/, "");
  const parts = rest ? rest.split("/").map(decodeURIComponent) : [];
  if (!parts.length) return { ...INDEX, you: who.name };
  if (parts[0] === "search" && parts.length === 1) { needScope(who, "search"); return search(q.q, { slug: q.client, limit: Math.min(Math.max(+q.limit || 20, 1), 100) }); }
  if (parts[0] === "detection-index") { needScope(who, "detect"); return { clients: await detectionIndex() }; }
  if (parts[0] === "agency" && parts.length === 2) {
    needScope(who, "agency");
    const library = parts[1];
    if (!["qc", "template", "sop", "media"].includes(library)) throw new HttpError(404, "Not found.");
    const rows = await all("SELECT title, body, meta FROM agency_items WHERE library = $1 AND status = 'approved' ORDER BY title", [library]);
    return { items: rows.map((r) => ({ title: r.title, body: r.body, meta: r.meta || {} })) };
  }
  if (parts[0] === "skills") {
    if (parts.length === 1) {
      const rows = await all(`SELECT s.slug, s.name, v.version, v.content_hash, v.approved_at
        FROM skills s JOIN skill_versions v ON v.id = s.live_version_id WHERE v.status = 'approved' ORDER BY s.name`);
      const allowed = rows.filter((r) => who.scopes.includes("*") || who.scopes.includes("skill:" + r.slug) || who.scopes.includes("skill:*"));
      return { skills: allowed.map((r) => ({ slug: r.slug, name: r.name, version: r.version, hash: r.content_hash, approvedAt: r.approved_at })) };
    }
    needScope(who, "skill:" + parts[1]);
    const skill = await one("SELECT * FROM skills WHERE slug = $1", [parts[1]]);
    if (!skill || !skill.live_version_id) throw new HttpError(404, "That skill has no live version.");
    const version = q.version
      ? await one("SELECT * FROM skill_versions WHERE skill_id = $1 AND version = $2 AND status IN ('approved','retired')", [skill.id, Number(q.version)])
      : await one("SELECT * FROM skill_versions WHERE id = $1 AND status = 'approved'", [skill.live_version_id]);
    if (!version) throw new HttpError(404, "That version is not available.");
    return { slug: skill.slug, name: skill.name, version: version.version, hash: version.content_hash, approvedAt: version.approved_at, body: version.body_md };
  }
  if (parts[0] !== "clients") throw new HttpError(404, "Not found. See GET /api/kb/v1 for what is available.");

  needScope(who, "clients");
  if (parts.length === 1) return { clients: await listClients({ q: q.q, website: q.website, status: q.status }) };
  const slug = parts[1];
  if (parts.length === 2) return getClient(slug, { include: q.include, who });
  const row = await ws.clientOr404(slug);
  if (parts[2] === "context" || parts[2] === "writing-context") {
    needScope(who, "writing");
    const platform = ws.PLATFORMS.includes(q.platform) ? q.platform : "Instagram";
    const language = ws.LANGUAGES.includes(q.language) ? q.language : "English";
    return ws.contextFor(row, platform, language);
  }
  if (parts[2] === "qc-context") { needScope(who, "qc"); return qcContext(row, q); }
  if (parts[2] === "ads-context") { needScope(who, "ads"); return adsContext(row); }
  if (parts[2] === "seo-context") { needScope(who, "seo"); return seoContext(row); }
  if (parts[2] === "reference-creatives") {
    needScope(who, "examples");
    const refs = await all("SELECT * FROM refs WHERE client_id = $1 AND verdict IN ('do','dont') ORDER BY id DESC", [row.id]);
    return { creatives: refs.map((r) => ({ verdict: r.verdict, why: r.why, platform: r.platform, url: signedRefPath(r.id), onedriveUrl: r.onedrive_url || null })) };
  }
  if (parts[2] === "documents") {
    needScope(who, "assets");
    if (parts.length === 3) return { documents: await listDocuments(row) };
    if (parts.length === 4) return getDocument(slug, parts[3]);
  }
  throw new HttpError(404, "Not found. See GET /api/kb/v1 for what is available.");
}

async function handlePost(path, body, req) {
  let who = null;
  try {
    who = await authenticate(req);
    needScope(who, "bot:log");
    const rest = path.replace(/^\/api\/kb\/v1\/bot\/?/, "").replace(/\/$/, "");
    const data = rest === "corrections" ? await corrections(body) : await usage(rest, body, who);
    await touch(who, path, 200, null, req);
    return data;
  } catch (e) {
    await touch(who, path, e.status || 500, e.message, req);
    throw e;
  }
}

async function corrections(body) {
  const row = await ws.clientOr404(body.client);
  const terms = Array.isArray(body.terms) ? body.terms.slice(0, 5) : [];
  let added = 0;
  for (const t of terms) {
    const text = String(t.text || "").trim().toLowerCase().slice(0, 60);
    const source = ["filename", "ocr", "message"].includes(t.source) ? t.source : "ocr";
    if (text.length < 2) continue;
    const ins = await query(
      "INSERT INTO alias_suggestions(client_id, suggestion, source) VALUES ($1,$2,$3) ON CONFLICT (client_id, suggestion) DO NOTHING",
      [row.id, text, source]);
    added += ins.rowCount || 0;
  }
  return { ok: true, suggestions: added };
}

async function usage(rest, body, who) {
  if (rest === "usage/reserve") {
    const est = Math.max(0, Number(body.estCostUsd) || 0);
    const capRow = await one("SELECT value FROM settings WHERE key = 'ai_monthly_cap_usd'");
    const cap = Number(capRow?.value) || 25;
    const spent = await one(`SELECT COALESCE(SUM(CASE WHEN status = 'reserved' THEN est_cost_usd ELSE COALESCE(cost_usd, 0) END), 0)::float AS n
      FROM ai_usage_log WHERE created_at >= date_trunc('month', now() AT TIME ZONE 'Asia/Kolkata') AT TIME ZONE 'Asia/Kolkata'`);
    if (Number(spent.n) + est > cap) throw new HttpError(402, "The monthly AI cap has been reached.");
    const row = await one(
      `INSERT INTO ai_usage_log(api_key_id, client_slug, model, purpose, skill_slug, skill_version, est_cost_usd)
       VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING id`,
      [who.id, String(body.client || "").slice(0, 80) || null, String(body.model || "").slice(0, 80), String(body.purpose || "onboarding").slice(0, 40),
        String(body.skill || "").slice(0, 80) || null, Number.isInteger(Number(body.skillVersion)) && Number(body.skillVersion) > 0 ? Number(body.skillVersion) : null, est]);
    return { usageId: String(row.id), spentUsd: Number(spent.n), capUsd: cap };
  }
  const m = /^usage\/(\d+)\/complete$/.exec(rest);
  if (!m) throw new HttpError(404, "Not found.");
  const row = await one("SELECT * FROM ai_usage_log WHERE id = $1 AND status = 'reserved'", [Number(m[1])]);
  if (!row) throw new HttpError(404, "That reservation was not found.");
  const cost = body.ok === false ? 0 : Number(row.est_cost_usd);
  await query("UPDATE ai_usage_log SET status = $2, cost_usd = $3, completed_at = now() WHERE id = $1", [row.id, body.ok === false ? "failed" : "done", cost]);
  return { costUsd: cost };
}

async function sendRef(req, res, pathname, q) {
  const id = Number(pathname.split("/").pop());
  const exp = Number(q.exp);
  const payload = `${id}.${exp}`;
  const sig = crypto.createHmac("sha256", signSecret()).update(payload).digest("base64url");
  const a = Buffer.from(String(q.sig || ""));
  const b = Buffer.from(sig);
  if (!exp || exp < Date.now() || a.length !== b.length || !crypto.timingSafeEqual(a, b)) throw new HttpError(401, "That image link has expired.");
  const r = await one("SELECT * FROM refs WHERE id = $1", [id]);
  if (!r) throw new HttpError(404, "Image not found.");
  const buf = await storage.download(r.path);
  res.writeHead(200, { "content-type": r.mime || "image/webp", "cache-control": "private, max-age=60", "x-content-type-options": "nosniff" });
  res.end(buf);
}

module.exports = { handle, handlePost, sendRef, keys, authenticate, qcContext };
