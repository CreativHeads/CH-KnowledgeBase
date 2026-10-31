// The production server for your own machine (a VPS). It does what Vercel does for this app: serves the files in
// /public, sends everything under /api to the one handler, and adds the same security headers.
// It listens on 127.0.0.1 only. Nginx sits in front of it, handles HTTPS, and forwards requests here.
//   Start:  npm start
const http = require("http");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const { ROOT } = require("./env");

const handler = require(path.join(ROOT, "api", "index.js"));
const db = require(path.join(ROOT, "lib", "db.js"));
const PUB = path.join(ROOT, "public");
const PORT = Number(process.env.PORT) || 3100;
const HOST = process.env.HOST || "127.0.0.1";

// The security headers are defined once, in vercel.json, and used here too. Online they include HSTS.
const RULES = (JSON.parse(fs.readFileSync(path.join(ROOT, "vercel.json"), "utf8")).headers || [])
  .map((h) => ({ re: new RegExp("^" + h.source + "$"), headers: h.headers }));
const addSecurityHeaders = (res, pathname) => {
  for (const r of RULES) if (r.re.test(pathname)) for (const h of r.headers) res.setHeader(h.key, h.value);
};

const MIME = {
  ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".mjs": "text/javascript; charset=utf-8", ".css": "text/css; charset=utf-8",
  ".svg": "image/svg+xml", ".png": "image/png", ".jpg": "image/jpeg", ".webp": "image/webp", ".ico": "image/x-icon", ".json": "application/json",
  ".wasm": "application/wasm", ".pfb": "application/octet-stream", ".ttf": "font/ttf",
};

// One small read of the file's own details gives a tag the browser can check, so unchanged files are not sent again.
function serveFile(req, res, file) {
  let stat;
  try { stat = fs.statSync(file); } catch { return false; }
  if (!stat.isFile()) return false;
  const etag = `"${crypto.createHash("sha1").update(`${stat.size}-${stat.mtimeMs}`).digest("hex").slice(0, 20)}"`;
  const type = MIME[path.extname(file).toLowerCase()] || "application/octet-stream";
  const headers = { "content-type": type, etag, "cache-control": "no-cache", "last-modified": stat.mtime.toUTCString() };
  if (req.headers["if-none-match"] === etag) { res.writeHead(304, headers); res.end(); return true; }
  res.writeHead(200, { ...headers, "content-length": stat.size });
  if (req.method === "HEAD") { res.end(); return true; }
  fs.createReadStream(file).on("error", () => res.destroy()).pipe(res);
  return true;
}

const server = http.createServer(async (req, res) => {
  let url;
  try { url = new URL(req.url, "http://localhost"); } catch { res.writeHead(400); return res.end(); }
  addSecurityHeaders(res, url.pathname);

  if (url.pathname === "/healthz") { res.writeHead(200, { "content-type": "text/plain", "cache-control": "no-store" }); return res.end("ok"); }
  if (url.pathname.startsWith("/api/")) return handler(req, res);

  if (!["GET", "HEAD"].includes(req.method)) { res.writeHead(405, { allow: "GET, HEAD" }); return res.end(); }
  let rel;
  try { rel = decodeURIComponent(url.pathname); } catch { res.writeHead(400); return res.end(); }
  // Only real files inside /public are served. Hidden files and anything that climbs out of the folder are refused.
  const file = path.join(PUB, rel === "/" ? "index.html" : rel);
  const inside = file === PUB || file.startsWith(PUB + path.sep);
  const hidden = rel.split("/").some((p) => p.startsWith("."));
  if (hidden) { res.writeHead(404, { "content-type": "text/plain" }); return res.end("Not found"); }
  if (inside && serveFile(req, res, file)) return;
  // A page address in the app (like /#clients) is handled by the app itself; a missing file is a plain 404.
  if (path.extname(rel)) { res.writeHead(404, { "content-type": "text/plain" }); return res.end("Not found"); }
  if (!serveFile(req, res, path.join(PUB, "index.html"))) { res.writeHead(500); res.end(); }
});

// A slow or half-open connection must not be able to hold the server open.
server.headersTimeout = 15000;
server.requestTimeout = 120000;
server.keepAliveTimeout = 65000;   // longer than Nginx's, so Nginx never reuses a connection this side has closed

server.on("error", (e) => {
  console.error(e.code === "EADDRINUSE" ? `Port ${PORT} is already in use.` : e.message);
  process.exit(1);
});
server.listen(PORT, HOST, () => {
  console.log(`Brandroom is running on http://${HOST}:${PORT}`);
  console.log(`Database: ${db.kind === "local" ? "built-in local database (not for production)" : "Postgres (Supabase)"}`);
});

process.on("unhandledRejection", (e) => console.error("unhandled rejection:", e?.message || e));
process.on("uncaughtException", (e) => { console.error("uncaught exception:", e?.message || e); });

// A restart or a stop finishes the requests in flight first.
let closing = false;
for (const sig of ["SIGINT", "SIGTERM"]) process.on(sig, () => {
  if (closing) return;
  closing = true;
  console.log("Stopping…");
  server.close(async () => { try { await db.end(); } catch {} process.exit(0); });
  setTimeout(() => process.exit(0), 10000).unref();
});
