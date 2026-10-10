// Rebuilds the local copy of the database from the local app's own data.
//
//   npm run reset-local
//
// The local database in .local-db is only a working copy for trying the app on your computer.
// The real data lives in the local app's data folder (and, once you deploy, in Supabase), so
// throwing this copy away and rebuilding it loses nothing.
const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");
const { ROOT, requireStopped } = require("./env");

if (process.env.DATABASE_URL) {
  console.error(`DATABASE_URL is set, so this would rebuild the Supabase database, not a local copy.
Comment it out in .env.local first, or use:  node scripts/migrate.js --yes`);
  process.exit(1);
}

(async () => {
await requireStopped("Rebuilding the database");
const dir = process.env.LOCAL_DB_DIR || path.join(ROOT, ".local-db");
if (fs.existsSync(dir)) {
  fs.rmSync(dir, { recursive: true, force: true });
  console.log("Removed the old local database.");
}

const run = (file, args) => {
  const r = spawnSync(process.execPath, [path.join(ROOT, "scripts", file), ...args], { stdio: "inherit", cwd: ROOT });
  if (r.status !== 0) process.exit(r.status || 1);
};
run("setup.js", []);
run("migrate.js", ["--yes"]);
console.log("Local database rebuilt. Start the app with:  npm run dev\n");
})();
