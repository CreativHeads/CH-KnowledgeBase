// Slows down guessing. Counts live in the database, not in memory, because a serverless site runs as
// many short-lived copies that cannot see each other's memory.
const { query, one } = require("./db");

const secs = "($2::int * interval '1 second')";

// Databases made before this table existed get it the first time it is needed, so adding the
// protection never depends on someone remembering to run a setup step.
let ready = null;
const ensure = () => (ready ??= (async () => {
  await query(`CREATE TABLE IF NOT EXISTS login_attempts (
    key text PRIMARY KEY, n integer NOT NULL DEFAULT 0, window_start timestamptz NOT NULL DEFAULT now())`);
  await query("ALTER TABLE login_attempts ENABLE ROW LEVEL SECURITY");
})().catch((e) => { ready = null; throw e; }));

// True when this key has already used up its attempts in the current window.
async function blocked(key, max, windowSec) {
  await ensure();
  const r = await one(`SELECT n FROM login_attempts WHERE key = $1 AND window_start > now() - ${secs}`, [key, windowSec]);
  return !!r && r.n >= max;
}

// Records one failed attempt. The window restarts when the old one has run out.
async function fail(key, windowSec) {
  await ensure();
  await query(
    `INSERT INTO login_attempts(key, n, window_start) VALUES ($1, 1, now())
     ON CONFLICT (key) DO UPDATE SET
       n = CASE WHEN login_attempts.window_start < now() - ${secs} THEN 1 ELSE login_attempts.n + 1 END,
       window_start = CASE WHEN login_attempts.window_start < now() - ${secs} THEN now() ELSE login_attempts.window_start END`,
    [key, windowSec]);
  if (Math.random() < 0.05) await query("DELETE FROM login_attempts WHERE window_start < now() - interval '1 day'").catch(() => {});
}

const clear = async (key) => { await ensure(); await query("DELETE FROM login_attempts WHERE key = $1", [key]); };

module.exports = { blocked, fail, clear };
