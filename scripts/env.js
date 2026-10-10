// Loads .env.local (and .env) into process.env for local runs. Vercel supplies these itself in the cloud.
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const fromFile = new Set(); // settings that came from a file, as opposed to the real environment
for (const name of [".env", ".env.local"]) {
  const file = path.join(ROOT, name);
  if (!fs.existsSync(file)) continue;
  for (const line of fs.readFileSync(file, "utf8").split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)$/i);
    if (!m) continue;
    let v = m[2].trim();
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1, -1);
    // A setting already present in the real environment wins over the file. That is how Vercel, tests
    // and one-off commands can override .env without editing it.
    // Between the two files, .env.local (read second) wins over .env.
    if (!(m[1] in process.env) || fromFile.has(m[1])) { process.env[m[1]] = v; fromFile.add(m[1]); }
  }
}
module.exports = { ROOT };

// The built-in local database can only be opened by one program at a time. These commands refuse to
// run while the app is up, instead of pulling the database out from under it.
const net = require("net");
function isRunning(port = Number(process.env.PORT) || 3100) {
  return new Promise((resolve) => {
    const s = net.connect({ port, host: "127.0.0.1" });
    const done = (v) => { s.destroy(); resolve(v); };
    s.setTimeout(800, () => done(false));
    s.on("connect", () => done(true));
    s.on("error", () => done(false));
  });
}
async function requireStopped(what) {
  if (/^postgres(ql)?:\/\//i.test((process.env.DATABASE_URL || "").trim())) return; // Supabase: nothing to protect
  const port = Number(process.env.PORT) || 3100;
  if (await isRunning(port)) {
    console.error(`\nBrandroom is running on port ${port}, and it is using the local database.\n${what} would clash with it.\n\nStop it first (Ctrl+C in the terminal where it runs), then run this again.\n`);
    process.exit(1);
  }
}
module.exports.isRunning = isRunning;
module.exports.requireStopped = requireStopped;
