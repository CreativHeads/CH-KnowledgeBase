// Documents attached to a client. On upload the text is read out of the file and saved, so the
// Caption Bot can use the facts inside it. The file itself is kept in storage for people to open.
const { all, one, query } = require("./db");
const { HttpError } = require("./http");

// Vercel refuses request bodies over about 4.5 MB, and base64 adds a third, so the file itself
// has to stay under roughly 3 MB.
const MAX_BYTES = 3 * 1024 * 1024;
const MAX_TEXT = 120_000;        // stored per document
const CONTEXT_BUDGET = 6_000;    // characters of document text handed to the bot per caption

const TYPES = {
  "application/pdf": "PDF",
  "text/plain": "Text",
  "text/markdown": "Markdown",
  "text/csv": "CSV",
};
// A file's own first bytes say what it is. The type a browser reports can be made up, so check both.
function sniff(mime, buf) {
  const b = buf;
  if (mime === "application/pdf") return b.length > 5 && b.subarray(0, 5).toString("latin1") === "%PDF-";
  if (mime === "image/png") return b.length > 8 && b[0] === 0x89 && b.subarray(1, 4).toString("latin1") === "PNG";
  if (mime === "image/jpeg") return b.length > 3 && b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff;
  if (mime === "image/webp") return b.length > 12 && b.subarray(0, 4).toString("latin1") === "RIFF" && b.subarray(8, 12).toString("latin1") === "WEBP";
  if (mime.startsWith("text/")) return !b.subarray(0, 8192).includes(0); // real text has no zero bytes
  return false;
}

const kindOf = (mime) => TYPES[mime] || "File";

const tidy = (s) => String(s || "").replace(/\r/g, "").replace(/[ \t]+\n/g, "\n").replace(/\n{3,}/g, "\n\n").replace(/[ \t]{2,}/g, " ").trim();

// Pulls the words out of a file. Scanned PDFs hold pictures of text, not text, so they come back empty.
async function extract(buffer, mime) {
  if (mime === "application/pdf") {
    const { PDFParse } = require("pdf-parse");
    let parser;
    try {
      parser = new PDFParse({ data: new Uint8Array(buffer) });
      const r = await parser.getText();
      return { text: tidy(r.text).slice(0, MAX_TEXT), pages: r.total ?? null };
    } finally {
      try { await parser?.destroy?.(); } catch {}
    }
  }
  return { text: tidy(buffer.toString("utf8")).slice(0, MAX_TEXT), pages: null };
}

async function add({ client, name, mime, buffer, path, actor }) {
  let text = "", pages = null, status = "ready", note = "";
  try {
    const r = await extract(buffer, mime);
    text = r.text; pages = r.pages;
    if (!text) {
      status = "no_text";
      note = mime === "application/pdf"
        ? "This PDF holds pictures of text, so nothing could be read from it. The file is saved, but the bot cannot use it."
        : "No text could be read from this file.";
    }
  } catch (e) {
    status = "failed";
    note = "This file could not be read: " + String(e.message).slice(0, 140);
  }
  const row = await one(
    `INSERT INTO documents(client_id, name, mime, size, path, body, chars, pages, status, note, added_by)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) RETURNING *`,
    [client.id, name, mime, buffer.length, path, text, text.length, pages, status, note, actor.id]);
  return row;
}

const out = (d, slug) => ({
  id: String(d.id), clientId: slug, name: d.name, kind: kindOf(d.mime), mime: d.mime,
  size: d.size, chars: d.chars, pages: d.pages, status: d.status, note: d.note,
  internal: d.internal, createdAt: new Date(d.created_at).toISOString(),
});

const listFor = async (clientId) => all("SELECT * FROM documents WHERE client_id = $1 ORDER BY created_at DESC", [clientId]);

// What the bot is allowed to read: the newest documents first, trimmed to a sensible size so one
// long PDF cannot crowd out the rest of the brand context.
async function forContext(clientId) {
  const rows = await all(
    `SELECT name, body, chars FROM documents
      WHERE client_id = $1 AND NOT internal AND status = 'ready' AND chars > 0
      ORDER BY created_at DESC`, [clientId]);
  const picked = [];
  let left = CONTEXT_BUDGET;
  for (const r of rows) {
    if (left <= 200) break;
    const share = Math.min(r.body.length, left);
    picked.push({ name: r.name, text: r.body.slice(0, share) + (share < r.body.length ? "\n…(continues)" : "") });
    left -= share;
  }
  return picked;
}

async function setInternal(id, internal, actor) {
  const d = await one("SELECT * FROM documents WHERE id = $1", [Number(id)]);
  if (!d) throw new HttpError(404, "Document not found.");
  await query("UPDATE documents SET internal = $1 WHERE id = $2", [!!internal, d.id]);
  return d;
}
async function remove(id) {
  const d = await one("SELECT * FROM documents WHERE id = $1", [Number(id)]);
  if (!d) return null;
  await query("DELETE FROM documents WHERE id = $1", [d.id]);
  return d;
}

module.exports = { sniff, MAX_BYTES, MAX_TEXT, CONTEXT_BUDGET, TYPES, kindOf, extract, add, out, listFor, forContext, setInternal, remove };
