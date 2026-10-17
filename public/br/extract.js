// Reads the text out of a very large file on the person's own computer, so only the words are sent to the
// server. The file is read in slices, never loaded whole, so a 500 MB PDF does not fill the browser's memory.
export const MAX_CHARS = 600000;

const tidy = (s) => String(s || "").replace(/\r/g, "").replace(/[ \t]+\n/g, "\n").replace(/\n{3,}/g, "\n\n").replace(/[ \t]{2,}/g, " ").trim();
const ENT = { "&amp;": "&", "&lt;": "<", "&gt;": ">", "&quot;": '"', "&apos;": "'" };
const decode = (s) => s.replace(/&(amp|lt|gt|quot|apos);|&#(\d+);|&#x([0-9a-f]+);/gi, (m, n, d, h) => ENT[m.toLowerCase()] ?? String.fromCodePoint(d ? +d : parseInt(h, 16)));
const bytes = async (file, a, b) => new Uint8Array(await file.slice(a, b).arrayBuffer());

/* ---- Word and PowerPoint: zip files holding XML ---- */
async function zipEntries(file) {
  const tailLen = Math.min(file.size, 70000);
  const tail = await bytes(file, file.size - tailLen, file.size);
  const tv = new DataView(tail.buffer);
  let e = -1;
  for (let i = tail.length - 22; i >= 0; i--) if (tv.getUint32(i, true) === 0x06054b50) { e = i; break; }
  if (e < 0) throw new Error("That does not look like a Word or PowerPoint file.");
  const count = tv.getUint16(e + 10, true), cdSize = tv.getUint32(e + 12, true), cdOff = tv.getUint32(e + 16, true);
  if (count > 5000 || cdSize > 20e6) throw new Error("That file is not supported.");
  const cd = await bytes(file, cdOff, cdOff + cdSize);
  const v = new DataView(cd.buffer);
  const out = []; let p = 0;
  for (let i = 0; i < count; i++) {
    if (p + 46 > cd.length || v.getUint32(p, true) !== 0x02014b50) throw new Error("That file is damaged.");
    const n = v.getUint16(p + 28, true), x = v.getUint16(p + 30, true), c = v.getUint16(p + 32, true);
    out.push({ name: new TextDecoder().decode(cd.subarray(p + 46, p + 46 + n)), method: v.getUint16(p + 10, true), csize: v.getUint32(p + 20, true), usize: v.getUint32(p + 24, true), offset: v.getUint32(p + 42, true) });
    p += 46 + n + x + c;
  }
  return out;
}
async function readEntry(file, e) {
  if (e.usize > 60e6) throw new Error("A part of that file is too large to read here.");
  const lh = new DataView((await bytes(file, e.offset, e.offset + 30)).buffer);
  const start = e.offset + 30 + lh.getUint16(26, true) + lh.getUint16(28, true);
  const raw = file.slice(start, start + e.csize);
  if (e.method === 0) return raw.text();
  if (e.method !== 8) throw new Error("That file uses a compression this reader does not support.");
  return new Response(raw.stream().pipeThrough(new DecompressionStream("deflate-raw"))).text();
}
async function officeText(file, kind) {
  const parts = await zipEntries(file);
  const num = (n) => Number(n.match(/(\d+)\.xml$/)[1]);
  if (kind === "docx") {
    const main = parts.find((p) => p.name === "word/document.xml");
    if (!main) throw new Error("That does not look like a Word file.");
    const xml = await readEntry(file, main);
    return decode(xml.replace(/<w:tab\b[^>]*\/>/g, "\t").replace(/<w:(br|cr)\b[^>]*\/>/g, "\n").replace(/<\/w:p>/g, "\n").replace(/<\/w:tc>/g, "\t").replace(/<[^>]+>/g, ""));
  }
  const slides = parts.filter((p) => /^ppt\/slides\/slide\d+\.xml$/.test(p.name)).sort((a, b) => num(a.name) - num(b.name));
  if (!slides.length) throw new Error("That does not look like a PowerPoint file.");
  let text = "";
  for (let i = 0; i < slides.length && text.length < MAX_CHARS; i++) {
    const xml = await readEntry(file, slides[i]);
    text += `Slide ${i + 1}\n` + decode(xml.replace(/<\/a:p>/g, "\n").replace(/<a:br\b[^>]*\/>/g, "\n").replace(/<[^>]+>/g, "")) + "\n\n";
  }
  return text;
}

/* ---- PDF, with the pdf.js reader shipped in /br/vendor ---- */
async function pdfText(file, { pdfUrl = "/br/vendor/pdf.min.mjs", workerUrl = "/br/vendor/pdf.worker.min.mjs", onProgress } = {}) {
  const pdfjs = await import(pdfUrl);
  if (workerUrl) pdfjs.GlobalWorkerOptions.workerSrc = workerUrl;
  const head = await bytes(file, 0, Math.min(file.size, 131072));
  const transport = new pdfjs.PDFDataRangeTransport(file.size, head);
  transport.requestDataRange = (begin, end) => { file.slice(begin, end).arrayBuffer().then((b) => transport.onDataRange(begin, new Uint8Array(b))); };
  const doc = await pdfjs.getDocument({ range: transport, disableStream: true, disableAutoFetch: true, isEvalSupported: false, disableFontFace: true, standardFontDataUrl: "/br/vendor/standard_fonts/", wasmUrl: "/br/vendor/wasm/" }).promise;
  let text = "";
  try {
    for (let i = 1; i <= doc.numPages && text.length < MAX_CHARS; i++) {
      const page = await doc.getPage(i);
      const tc = await page.getTextContent();
      text += tc.items.map((t) => t.str + (t.hasEOL ? "\n" : "")).join("") + "\n\n";
      page.cleanup();
      onProgress?.(`Reading page ${i} of ${doc.numPages}…`);
    }
  } finally { try { await doc.destroy(); } catch {} }
  return { text, pages: doc.numPages };
}

// Scanned PDFs hold pictures, not text. Draws the first pages as images so the AI can read them.
export async function renderPages(file, { max = 12, width = 1400, pdfUrl = "/br/vendor/pdf.min.mjs", workerUrl = "/br/vendor/pdf.worker.min.mjs", onProgress } = {}) {
  const pdfjs = await import(pdfUrl);
  if (workerUrl) pdfjs.GlobalWorkerOptions.workerSrc = workerUrl;
  const head = await bytes(file, 0, Math.min(file.size, 131072));
  const transport = new pdfjs.PDFDataRangeTransport(file.size, head);
  transport.requestDataRange = (begin, end) => { file.slice(begin, end).arrayBuffer().then((b) => transport.onDataRange(begin, new Uint8Array(b))); };
  const doc = await pdfjs.getDocument({ range: transport, disableStream: true, disableAutoFetch: true, isEvalSupported: false, disableFontFace: true, standardFontDataUrl: "/br/vendor/standard_fonts/", wasmUrl: "/br/vendor/wasm/" }).promise;
  const out = [];
  try {
    const n = Math.min(doc.numPages, max);
    for (let i = 1; i <= n; i++) {
      onProgress?.(`Preparing page ${i} of ${n}…`);
      const page = await doc.getPage(i);
      const base = page.getViewport({ scale: 1 });
      const viewport = page.getViewport({ scale: Math.min(3, width / base.width) });
      const cv = document.createElement("canvas"); cv.width = Math.round(viewport.width); cv.height = Math.round(viewport.height);
      await page.render({ canvasContext: cv.getContext("2d"), viewport }).promise;
      const blob = await new Promise((r) => cv.toBlob(r, "image/jpeg", 0.72));
      const data = await new Promise((res, rej) => { const fr = new FileReader(); fr.onload = () => res(String(fr.result).split(",")[1]); fr.onerror = rej; fr.readAsDataURL(blob); });
      out.push({ mime: "image/jpeg", data, page: i });
      page.cleanup();
    }
    return { pages: out, total: doc.numPages };
  } finally { try { await doc.destroy(); } catch {} }
}

// Returns { text, truncated }. Throws a plain-English error when the file can't be read.
export async function extractLocal(file, opts = {}) {
  const name = file.name.toLowerCase();
  let text, pages = null;
  if (name.endsWith(".pdf")) ({ text, pages } = await pdfText(file, opts));
  else if (name.endsWith(".docx")) text = await officeText(file, "docx");
  else if (name.endsWith(".pptx")) text = await officeText(file, "pptx");
  else if (/\.(txt|md|csv)$/.test(name)) text = await file.slice(0, 8e6).text();
  else throw new Error("Large files can be PDF, Word, PowerPoint, text or CSV.");
  text = tidy(text);
  if (!text) throw Object.assign(new Error("No text could be read from this file. If it is a scan, it holds only pictures of text."), { noText: true, pages });
  return { text: text.slice(0, MAX_CHARS), truncated: text.length > MAX_CHARS, pages };
}
