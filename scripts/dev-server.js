// Runs the same code Vercel runs, on your own computer: static files from /public, everything
// under /api through the one function. Start it with:  npm run dev
const http = require("http");
const fs = require("fs");
const path = require("path");
const { ROOT } = require("./env");

const handler = require(path.join(ROOT, "api", "index.js"));
const db = require(path.join(ROOT, "lib", "db.js"));
const storage = require(path.join(ROOT, "lib", "storage.js"));
const PUB = path.join(ROOT, "public");

// Send the same security headers Vercel sends (they are defined once, in vercel.json), so what you
// try locally is what runs online. HSTS is skipped here because local addresses are plain http.
const RULES = (JSON.parse(fs.readFileSync(path.join(ROOT, "vercel.json"), "utf8")).headers || [])
  .map((h) => ({ re: new RegExp("^" + h.source + "$"), headers: h.headers.filter((x) => x.key !== "Strict-Transport-Security") }));
const addSecurityHeaders = (res, pathname) => {
  for (const r of RULES) if (r.re.test(pathname)) for (const h of r.headers) res.setHeader(h.key, h.value);
};
const PORT = Number(process.env.PORT) || 3100;
const MIME = { ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".mjs": "text/javascript; charset=utf-8", ".css": "text/css; charset=utf-8", ".svg": "image/svg+xml", ".png": "image/png", ".jpg": "image/jpeg", ".webp": "image/webp", ".ico": "image/x-icon", ".json": "application/json" };

http.createServer(async (req, res) => {
  const url = new URL(req.url, "http://localhost");
  addSecurityHeaders(res, url.pathname);
  if (url.pathname.startsWith("/api/")) return handler(req, res);

  let file = path.join(PUB, url.pathname === "/" ? "index.html" : decodeURIComponent(url.pathname));
  if (!file.startsWith(PUB) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) file = path.join(PUB, "index.html");
  res.writeHead(200, { "content-type": MIME[path.extname(file)] || "application/octet-stream", "cache-control": "no-cache" });
  fs.createReadStream(file).on("error", () => res.end()).pipe(res);
}).on("error", (e) => {
  if (e.code === "EADDRINUSE") console.error(`
Port ${PORT} is already in use. Brandroom is probably already running.
Open http://localhost:${PORT}, or stop the other copy first (Ctrl+C in its terminal).
`);
  else console.error(e.message);
  process.exit(1);
}).listen(PORT, () => {
  console.log(`\n  Brandroom (cloud build) → http://localhost:${PORT}`);
  console.log(`  Database: ${db.kind === "local" ? "built-in local database (.local-db)" : "Supabase, from DATABASE_URL"}`);
  console.log(`  Storage:  ${storage.remote() ? "Supabase Storage" : "local folder (.local-files)"}`);
  console.log("");
});

// Close the database properly on Ctrl+C, so the next start is clean.
let closing = false;
for (const sig of ["SIGINT", "SIGTERM"]) process.on(sig, async () => {
  if (closing) return;
  closing = true;
  try { await db.end(); } catch {}
  process.exit(0);
});
