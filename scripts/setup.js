// Creates the tables in Supabase and shows what is there.  Run:  npm run setup
// You can also run schema.sql by hand in the Supabase SQL editor; this does the same thing.
require("./env");
const fs = require("fs");
const path = require("path");
const { ROOT, requireStopped } = require("./env");
const { query, exec, all, one, end, kind, localDir } = require("../lib/db");

(async () => {
  await requireStopped("Setting up the tables");
  console.log(kind === "local" ? `Using the built-in local database in ${localDir}` : "Using the Supabase database in DATABASE_URL");
  console.log("Creating tables (safe to run again)…");
  await exec(fs.readFileSync(path.join(ROOT, "schema.sql"), "utf8"));

  const tables = await all(`SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name`);
  console.log("Tables: " + tables.map((t) => t.table_name).join(", "));

  const counts = {};
  for (const t of ["users", "clients", "examples", "refs", "documents", "activity"]) {
    counts[t] = (await one(`SELECT COUNT(*)::int AS n FROM ${t}`)).n;
  }
  console.log("Rows:   " + Object.entries(counts).map(([k, v]) => `${k}=${v}`).join("  "));

  if (!counts.users) {
    console.log(`\nNo people yet. Either:
  · run  node scripts/migrate.js --yes  to bring your current accounts and brand knowledge across, or
  · sign in with Microsoft — the first person to sign in becomes the admin.`);
  }
  console.log("\nReady.\n");
  await end();
})().catch(async (e) => { console.error("\nSetup stopped:", e.message); try { await end(); } catch {} process.exit(1); });
