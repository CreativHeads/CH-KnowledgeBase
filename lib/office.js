// Reads the text out of Word (.docx) and PowerPoint (.pptx) files. Both are zip files holding XML, so this
// needs no extra packages. Everything is capped, because a file sent by a stranger must never be able
// to use up the server's memory (a "zip bomb" is a tiny file that unpacks to gigabytes).
const zlib = require("zlib");

const DOCX = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
const PPTX = "application/vnd.openxmlformats-officedocument.presentationml.presentation";

const MAX_ENTRY = 15 * 1024 * 1024;   // largest single unpacked part
const MAX_TOTAL = 40 * 1024 * 1024;   // everything unpacked from one file
const MAX_ENTRIES = 2000;

// The list of parts inside a zip, from its table of contents at the end of the file.
function listZip(buf) {
  const eocd = buf.lastIndexOf(Buffer.from([0x50, 0x4b, 0x05, 0x06]));
  if (eocd < 0 || eocd + 22 > buf.length) return null;
  const count = buf.readUInt16LE(eocd + 10);
  let p = buf.readUInt32LE(eocd + 16);
  if (count > MAX_ENTRIES) return null;
  const out = [];
  for (let i = 0; i < count; i++) {
    if (p + 46 > buf.length || buf.readUInt32LE(p) !== 0x02014b50) return null;
    const nlen = buf.readUInt16LE(p + 28), elen = buf.readUInt16LE(p + 30), clen = buf.readUInt16LE(p + 32);
    if (p + 46 + nlen > buf.length) return null;
    out.push({
      name: buf.toString("utf8", p + 46, p + 46 + nlen),
      method: buf.readUInt16LE(p + 10), csize: buf.readUInt32LE(p + 20), usize: buf.readUInt32LE(p + 24), offset: buf.readUInt32LE(p + 42),
    });
    p += 46 + nlen + elen + clen;
  }
  return out;
}

function readEntry(buf, e) {
  if (e.usize > MAX_ENTRY) throw new Error("That file is too large once unpacked.");
  const lh = e.offset;
  if (lh + 30 > buf.length || buf.readUInt32LE(lh) !== 0x04034b50) throw new Error("That file is damaged.");
  const start = lh + 30 + buf.readUInt16LE(lh + 26) + buf.readUInt16LE(lh + 28);
  const data = buf.subarray(start, start + e.csize);
  if (e.method === 0) return data;
  if (e.method === 8) return zlib.inflateRawSync(data, { maxOutputLength: MAX_ENTRY });
  throw new Error("That file uses a compression this reader does not support.");
}

const ENT = { "&amp;": "&", "&lt;": "<", "&gt;": ">", "&quot;": '"', "&apos;": "'" };
const decode = (s) => s.replace(/&(amp|lt|gt|quot|apos);|&#(\d+);|&#x([0-9a-f]+);/gi, (m, n, d, h) => ENT[m.toLowerCase()] ?? String.fromCodePoint(d ? +d : parseInt(h, 16)));

// Word: paragraphs become lines, tabs and line breaks are kept, every other tag is dropped.
function docxText(xml) {
  return decode(xml
    .replace(/<w:tab\b[^>]*\/>/g, "\t").replace(/<w:(br|cr)\b[^>]*\/>/g, "\n")
    .replace(/<\/w:p>/g, "\n").replace(/<\/w:tc>/g, "\t")
    .replace(/<[^>]+>/g, ""));
}
// PowerPoint: the text of each slide sits in <a:t> pieces, one paragraph per <a:p>.
function pptxText(xml) {
  return decode(xml.replace(/<\/a:p>/g, "\n").replace(/<a:br\b[^>]*\/>/g, "\n").replace(/<[^>]+>/g, ""));
}

function extractOffice(buf, mime) {
  const parts = listZip(buf);
  if (!parts) throw new Error("That does not look like a Word or PowerPoint file.");
  let total = 0;
  const read = (e) => { total += e.usize; if (total > MAX_TOTAL) throw new Error("That file is too large once unpacked."); return readEntry(buf, e).toString("utf8"); };
  if (mime === DOCX) {
    const main = parts.find((p) => p.name === "word/document.xml");
    if (!main) throw new Error("That does not look like a Word file.");
    return { text: docxText(read(main)), pages: null };
  }
  const slides = parts.filter((p) => /^ppt\/slides\/slide\d+\.xml$/.test(p.name))
    .sort((a, b) => Number(a.name.match(/(\d+)\.xml$/)[1]) - Number(b.name.match(/(\d+)\.xml$/)[1]));
  if (!slides.length) throw new Error("That does not look like a PowerPoint file.");
  const text = slides.map((s, i) => `Slide ${i + 1}\n${pptxText(read(s))}`).join("\n\n");
  return { text, pages: slides.length };
}

// True when the bytes really are a zip that holds the part a Word or PowerPoint file must have.
function looksOffice(buf, mime) {
  if (buf.length < 30 || buf.readUInt32LE(0) !== 0x04034b50) return false;
  const parts = listZip(buf);
  if (!parts) return false;
  return mime === DOCX ? parts.some((p) => p.name === "word/document.xml") : parts.some((p) => /^ppt\/slides\/slide\d+\.xml$/.test(p.name));
}

module.exports = { DOCX, PPTX, extractOffice, looksOffice };
