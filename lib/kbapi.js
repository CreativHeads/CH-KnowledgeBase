// Read-only knowledge API for other tools (the SEO agent, scripts, other bots).
//
// Authenticated with a key, not a browser session. A key can read brand knowledge and nothing else:
// no writes, and never anything marked internal (locked fields, internal notes, team-only documents).
//
// Keys come from the KB_API_KEYS environment variable:  name:key,name2:key2
// Each key must be at least 24 characters. Name them after what uses them, e.g. "seo-agent".
const crypto = require("crypto");
const { all, one } = require("./db");
const { HttpError, clientIp } = require("./http");
const throttle = require("./throttle");
const ws = require("./workspace");
const docs = require("./documents");

const MIN_KEY = 24;

function keys() {
  return String(process.env.KB_API_KEYS || "").split(",").map((p) => p.trim()).filter(Boolean).map((p) => {
    const i = p.indexOf(":");
    return i > 0 ? { name: p.slice(0, i).trim(), key: p.slice(i + 1).trim() } : null;
  }).filter((k) => k && k.key.length >= MIN_KEY && !/^(your-|change-me|xxxx)/i.test(k.key));
}

// Compares in constant time, so response timing cannot be used to guess a key.
async function authenticate(req) {
  const list = keys();
  if (!list.length) throw new HttpError(503, "The knowledge API is switched off. Set KB_API_KEYS to turn it on.");
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
  if (!found) { await throttle.fail(ip, 600); throw new HttpError(401, "That key is not recognised."); }
  return found;
}

/* ---------- shaping ---------- */
const publicClient = (row) => ws.outClient(row, { withInternal: false });
const hostOf = (v) => {
  const s = String(v || "").trim().toLowerCase();
  if (!s) return "";
  try { return new URL(/^https?:\/\//.test(s) ? s : "https://" + s).hostname.replace(/^www\./, ""); } catch { return s.replace(/^www\./, ""); }
};
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

async function getClient(slug, { include = "" } = {}) {
  const row = await ws.clientOr404(slug);
  const b = publicClient(row);
  const out = { ...summary(row), colour: b.colour, fields: b.fields };
  const want = new Set(String(include).split(",").map((s) => s.trim()));
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
  const d = await one("SELECT * FROM documents WHERE id = $1 AND client_id = $2 AND NOT internal", [Number(id), row.id]);
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

/* ---------- routing ---------- */
const INDEX = {
  name: "Brandroom knowledge API",
  version: 1,
  access: "read-only. Internal fields, internal notes and team-only documents are never returned.",
  auth: "Authorization: Bearer <key>",
  endpoints: {
    "GET /api/kb/v1/clients": "List clients. Filters: ?q=name, ?website=example.com, ?status=active",
    "GET /api/kb/v1/clients/:slug": "One client's brand knowledge. Add ?include=examples,documents",
    "GET /api/kb/v1/clients/:slug/context?platform=&language=": "The brand knowledge shaped for writing: fields, approved and rejected examples, document text",
    "GET /api/kb/v1/clients/:slug/documents": "Documents attached to the client",
    "GET /api/kb/v1/clients/:slug/documents/:id": "The text read out of one document",
    "GET /api/kb/v1/search?q=&client=": "Search fields, examples and documents. Optional ?client=slug and ?limit=",
  },
};

async function handle(path, q, req) {
  const who = await authenticate(req);
  const rest = path.replace(/^\/api\/kb\/v1\/?/, "").replace(/\/$/, "");
  const parts = rest ? rest.split("/").map(decodeURIComponent) : [];

  if (!parts.length) return { ...INDEX, you: who.name };
  if (parts[0] === "search" && parts.length === 1) return search(q.q, { slug: q.client, limit: Math.min(Math.max(+q.limit || 20, 1), 100) });
  if (parts[0] !== "clients") throw new HttpError(404, "Not found. See GET /api/kb/v1 for what is available.");

  if (parts.length === 1) return { clients: await listClients({ q: q.q, website: q.website, status: q.status }) };
  const slug = parts[1];
  if (parts.length === 2) return getClient(slug, { include: q.include });
  if (parts[2] === "context" && parts.length === 3) {
    const row = await ws.clientOr404(slug);
    const platform = ws.PLATFORMS.includes(q.platform) ? q.platform : "Instagram";
    const language = ws.LANGUAGES.includes(q.language) ? q.language : "English";
    return ws.contextFor(row, platform, language);
  }
  if (parts[2] === "documents") {
    if (parts.length === 3) return { documents: await listDocuments(await ws.clientOr404(slug)) };
    if (parts.length === 4) return getDocument(slug, parts[3]);
  }
  throw new HttpError(404, "Not found. See GET /api/kb/v1 for what is available.");
}

module.exports = { handle, keys, authenticate };
