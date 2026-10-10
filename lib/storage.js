// Reference images. On Vercel they live in a private Supabase Storage bucket; when you run the
// app on your own computer without Supabase, they go in brandroom-cloud/.local-files instead.
// Either way the browser never reaches them directly: every image is served through
// /api/br/refs/:id/file, which checks the session first.
const fs = require("fs");
const path = require("path");
const { HttpError } = require("./http");

const base = () => (process.env.SUPABASE_URL || "").replace(/\/$/, "");
const key = () => process.env.SUPABASE_SERVICE_KEY || "";
const bucket = () => process.env.SUPABASE_BUCKET || "brand-refs";
const remote = () => !!(base() && key());
const configured = () => true; // local disk is always available as a fallback

const LOCAL_DIR = path.resolve(process.env.LOCAL_FILES_DIR || path.join(__dirname, "..", ".local-files"));
const safe = (p) => {
  const full = path.resolve(LOCAL_DIR, p.replace(/\\/g, "/"));
  // Never let a stored path climb out of the files folder.
  if (full !== LOCAL_DIR && !full.startsWith(LOCAL_DIR + path.sep)) throw new HttpError(400, "Bad file path.");
  return full;
};
const headers = () => ({ Authorization: `Bearer ${key()}`, apikey: key() });
const objectUrl = (p) => `${base()}/storage/v1/object/${bucket()}/${p.split("/").map(encodeURIComponent).join("/")}`;

async function upload(p, buffer, mime) {
  if (!remote()) {
    const file = safe(p);
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, buffer);
    return p;
  }
  const r = await fetch(objectUrl(p), {
    method: "POST",
    headers: { ...headers(), "content-type": mime, "cache-control": "3600", "x-upsert": "true" },
    body: buffer,
  });
  if (!r.ok) throw new HttpError(502, "Could not save the image: " + (await r.text()).slice(0, 200));
  return p;
}

async function download(p) {
  if (!remote()) {
    const file = safe(p);
    if (!fs.existsSync(file)) throw new HttpError(404, "That image is missing.");
    return fs.readFileSync(file);
  }
  const r = await fetch(objectUrl(p), { headers: headers() });
  if (!r.ok) throw new HttpError(r.status === 404 ? 404 : 502, "Could not load that image.");
  return Buffer.from(await r.arrayBuffer());
}

async function remove(p) {
  if (!remote()) { try { fs.unlinkSync(safe(p)); } catch {} return; }
  await fetch(objectUrl(p), { method: "DELETE", headers: headers() }).catch(() => {});
}

module.exports = { configured, remote, upload, download, remove, bucket, LOCAL_DIR };
