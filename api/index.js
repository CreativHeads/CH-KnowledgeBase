// The whole Brandroom API, as one Vercel function. Static files are served from /public.
const crypto = require("crypto");
const { HttpError, json, readBody } = require("../lib/http");
const auth = require("../lib/auth");
const ws = require("../lib/workspace");
const storage = require("../lib/storage");
const docs = require("../lib/documents");
const kbapi = require("../lib/kbapi");
const users = require("../lib/users");
const { all, one, query } = require("../lib/db");

const routes = [];
const route = (method, pattern, handler) =>
  routes.push({ method, re: new RegExp("^" + pattern.replace(/:(\w+)/g, "(?<$1>[^/]+)") + "/?$"), handler });

/* ---------- sign-in ---------- */
route("GET", "/api/br/public", async () => ({
  appName: "Brandroom",
  microsoft: auth.msConfigured(),
  passwords: !!(await one("SELECT 1 FROM users WHERE pass_hash IS NOT NULL AND active LIMIT 1")),
}));

route("POST", "/api/login", async ({ req, res }) => {
  const b = await readBody(req);
  return auth.loginWithPassword(req, res, b.email, b.password);
});
route("POST", "/api/logout", async ({ req, res }) => { await auth.endSession(req, res); return { ok: true }; });

route("GET", "/api/auth/microsoft", ({ req, res }) => {
  res.writeHead(302, { location: auth.microsoftStart(req, res) });
  res.end();
});
route("GET", "/api/auth/microsoft/callback", async ({ req, res, q }) => {
  const fail = (m) => { res.writeHead(302, { location: "/#error=" + encodeURIComponent(m) }); res.end(); };
  if (q.error) return fail(q.error_description || q.error);
  try { await auth.microsoftFinish(req, res, q.code, q.state); }
  catch (e) { return fail(e.message); }
  res.writeHead(302, { location: "/" });
  res.end();
});

/* ---------- workspace ---------- */
const config = () => ({
  refBase: "/api/br/refs/",
  microsoft: auth.msConfigured(),
  cloud: true,
  seoUrl: process.env.SEO_URL || "",
  connections: {
    microsoft: auth.msConfigured(),
    storage: storage.configured(),
    teams: false,
    api: kbapi.keys().length > 0,
  },
});

route("GET", "/api/br/workspace", async ({ user }) => {
  auth.need(user);
  return ws.workspace(user, { config: config() });
});

route("POST", "/api/br/workspace", async ({ req, user }) => {
  auth.need(user);
  const b = await readBody(req);
  switch (b.action) {
    case "client.save": {
      auth.needEditor(user);
      return { client: await ws.saveClient(b.client || {}, user) };
    }
    case "example.save": {
      auth.needEditor(user);
      await ws.saveExample(b.example || {}, user);
      return { ok: true };
    }
    default:
      throw new HttpError(400, "Unknown action.");
  }
});

/* ---------- reference images ---------- */
route("POST", "/api/br/media", async ({ req, user }) => {
  auth.needEditor(user);
  const b = await readBody(req, 3.5e6);
  const c = await ws.clientOr404(b.clientId);
  if (!/^image\/(jpeg|png|webp)$/.test(b.mime || "")) throw new HttpError(400, "Use a JPEG, PNG or WebP image.");
  const buf = Buffer.from(String(b.data || ""), "base64");
  if (!buf.length || buf.length > 2.2e6) throw new HttpError(400, "Images must be under 2 MB (the app shrinks them to 1024px first).");
  if (!docs.sniff(b.mime, buf)) throw new HttpError(400, "That file is not really an image of the type it claims.");

  const kind = ["Logo", "Product", "Packaging", "Location", "Reference"].includes(b.kind) ? b.kind : "Reference";
  const ext = b.mime.split("/")[1].replace("jpeg", "jpg");
  const path = `${c.slug}/${crypto.randomUUID()}.${ext}`;
  await storage.upload(path, buf, b.mime);

  const name = String(b.name || "Reference").replace(/\.[a-z0-9]{2,5}$/i, "").slice(0, 120) || "Reference";
  const row = await one(
    `INSERT INTO refs(client_id, kind, name, description, path, mime, size) VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING id`,
    [c.id, kind, name, String(b.description || "").slice(0, 600), path, b.mime, buf.length]);
  await query("UPDATE clients SET updated_at = now() WHERE id = $1", [c.id]);
  await ws.logActivity(user, c.id, `Added a reference image for ${c.name}.`);
  return { id: String(row.id) };
});

route("GET", "/api/br/refs/:id/file", async ({ res, user, p }) => {
  auth.need(user);
  const r = await one("SELECT * FROM refs WHERE id = $1", [Number(p.id)]);
  if (!r) throw new HttpError(404, "Image not found.");
  const buf = await storage.download(r.path);
  res.writeHead(200, { "content-type": r.mime, "cache-control": "private, max-age=600", "x-content-type-options": "nosniff" });
  res.end(buf);
});

route("DELETE", "/api/br/refs/:id", async ({ user, p }) => {
  auth.needEditor(user);
  const r = await one("SELECT * FROM refs WHERE id = $1", [Number(p.id)]);
  if (!r) return { ok: true };
  await query("DELETE FROM refs WHERE id = $1", [r.id]);
  await storage.remove(r.path);
  return { ok: true };
});

/* ---------- people (admin only) ---------- */
route("GET", "/api/br/users", async ({ user }) => {
  auth.needAdmin(user);
  return { users: await users.list(user), roles: users.ROLES };
});
route("POST", "/api/br/users", async ({ req, user }) => {
  auth.needAdmin(user);
  return { user: await users.create(await readBody(req), user) };
});
route("POST", "/api/br/users/:id", async ({ req, user, p }) => {
  auth.needAdmin(user);
  return { user: await users.update(p.id, await readBody(req), user) };
});
route("DELETE", "/api/br/users/:id", async ({ user, p }) => {
  auth.needAdmin(user);
  return users.remove(p.id, user);
});

/* ---------- documents: read on upload, then used as brand knowledge ---------- */
route("POST", "/api/br/documents", async ({ req, user }) => {
  auth.needEditor(user);
  const b = await readBody(req, 5e6);
  const c = await ws.clientOr404(b.clientId);
  const mime = String(b.mime || "").split(";")[0];
  if (!docs.TYPES[mime]) throw new HttpError(400, "Use a PDF, or a plain text, Markdown or CSV file.");
  const buf = Buffer.from(String(b.data || ""), "base64");
  if (!buf.length) throw new HttpError(400, "That file came through empty.");
  if (!docs.sniff(mime, buf)) throw new HttpError(400, "That file is not really a " + docs.TYPES[mime] + " file.");
  if (buf.length > docs.MAX_BYTES) throw new HttpError(413, `Files need to be under ${Math.floor(docs.MAX_BYTES / 1024 / 1024)} MB.`);

  const name = String(b.name || "Document").slice(0, 160) || "Document";
  const ext = (name.match(/\.[a-z0-9]{1,5}$/i) || [""])[0] || "";
  const path = `${c.slug}/docs/${crypto.randomUUID()}${ext}`;
  await storage.upload(path, buf, mime);

  const row = await docs.add({ client: c, name, mime, buffer: buf, path, actor: user });
  await query("UPDATE clients SET updated_at = now() WHERE id = $1", [c.id]);
  await ws.logActivity(user, c.id, `Added the document “${name}” to ${c.name}.`);
  return { document: docs.out(row, c.slug) };
});

route("GET", "/api/br/documents/:id/file", async ({ res, user, p }) => {
  auth.need(user);
  const d = await one("SELECT * FROM documents WHERE id = $1", [Number(p.id)]);
  if (!d || (d.internal && !auth.canEdit(user))) throw new HttpError(404, "Document not found."); // same answer as "no such file", so its existence is not revealed
  const buf = await storage.download(d.path);
  res.writeHead(200, {
    "content-type": d.mime,
    "content-disposition": `inline; filename="${d.name.replace(/[^\w.\- ]+/g, "_")}"`,
    "cache-control": "private, max-age=600", "x-content-type-options": "nosniff",
  });
  res.end(buf);
});

route("POST", "/api/br/documents/:id", async ({ req, user, p }) => {
  auth.needEditor(user);
  const b = await readBody(req);
  const d = await docs.setInternal(p.id, !!b.internal, user);
  const c = await one("SELECT slug, name FROM clients WHERE id = $1", [d.client_id]);
  await ws.logActivity(user, d.client_id, `${b.internal ? "Hid" : "Shared"} the document “${d.name}” ${b.internal ? "from" : "with"} the Caption Bot.`);
  return { ok: true, clientId: c?.slug };
});

route("DELETE", "/api/br/documents/:id", async ({ user, p }) => {
  auth.needEditor(user);
  const d = await docs.remove(p.id);
  if (d) { await storage.remove(d.path); await ws.logActivity(user, d.client_id, `Removed the document “${d.name}”.`); }
  return { ok: true };
});

/* What the bot actually reads, documents included. Shown in the Writing context tab. */
route("GET", "/api/br/context", async ({ user, q }) => {
  auth.need(user);
  const c = await ws.clientOr404(q.client);
  const platform = ws.PLATFORMS.includes(q.platform) ? q.platform : "Instagram";
  const language = ws.LANGUAGES.includes(q.language) ? q.language : "English";
  return ws.contextFor(c, platform, language);
});

/* ---------- dispatch ---------- */
module.exports = async (req, res) => {
  let pathname = "";
  try {
    const url = new URL(req.url, "http://localhost");
    try { pathname = decodeURIComponent(url.pathname); } catch { throw new HttpError(400, "That address is not valid."); }

    // The read-only knowledge API for other tools. It uses a key, not a browser session.
    if (pathname === "/api/kb/v1" || pathname.startsWith("/api/kb/v1/")) {
      if (req.method !== "GET") throw new HttpError(405, "The knowledge API is read-only.");
      return json(res, 200, await kbapi.handle(pathname, Object.fromEntries(url.searchParams), req));
    }
    // Cookies are SameSite=Lax, and the app adds this header, so a form posted from another site cannot act for you.
    if (!["GET", "HEAD"].includes(req.method) && req.headers["x-requested-with"] !== "app")
      throw new HttpError(403, "Blocked request.");

    for (const r of routes) {
      if (r.method !== req.method) continue;
      const m = pathname.match(r.re);
      if (!m) continue;
      const user = await auth.sessionUser(req);
      const out = await r.handler({ req, res, user, p: m.groups || {}, q: Object.fromEntries(url.searchParams) });
      if (!res.writableEnded && !res.headersSent) json(res, 200, out ?? { ok: true });
      return;
    }
    throw new HttpError(404, "Not found.");
  } catch (e) {
    const status = e.status >= 400 && e.status < 600 ? e.status : 500;
    // Only errors we raised on purpose are shown to the person. Anything else (a database message,
    // a stack trace) could reveal how the site is built, so it goes to the log and they get a plain line.
    if (status === 500) console.error(req.method, pathname, e);
    const message = e instanceof HttpError ? e.message : "Something went wrong. Please try again.";
    if (!res.headersSent) json(res, status, { error: message });
    else res.end();
  }
};
module.exports.routes = routes;
