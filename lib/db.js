// The database. Two ways to run, same SQL:
//   · DATABASE_URL set  → Supabase Postgres (what Vercel uses). Point it at the transaction pooler.
//   · DATABASE_URL unset → an embedded Postgres kept in brandroom-cloud/.local-db, so the app
//     runs on your own computer with nothing to install and no password to remember.
const path = require("path");

const url = (process.env.DATABASE_URL || "").trim();
const useServer = /^postgres(ql)?:\/\//i.test(url);
const LOCAL_DIR = process.env.LOCAL_DB_DIR || path.join(__dirname, "..", ".local-db");

let driver = global.__brandroomDb;

if (!driver && useServer) {
  const { Pool } = require("pg");
  // Supabase needs TLS but serves a certificate the default root list does not cover.
  const ssl = /supabase|pooler/i.test(url) || process.env.PGSSL === "require" ? { rejectUnauthorized: false } : undefined;
  const pool = new Pool({ connectionString: url, ssl, max: 2, idleTimeoutMillis: 10_000, connectionTimeoutMillis: 15_000 });
  pool.on("error", (e) => console.error("postgres pool", e.message));
  driver = {
    kind: "supabase",
    query: (text, params) => pool.query(text, params),
    exec: (sql) => pool.query(sql),
    async tx(fn) {
      const c = await pool.connect();
      try { await c.query("BEGIN"); const r = await fn({ query: (t, p) => c.query(t, p) }); await c.query("COMMIT"); return r; }
      catch (e) { try { await c.query("ROLLBACK"); } catch {} throw e; }
      finally { c.release(); }
    },
    end: () => pool.end(),
  };
}

if (!driver) {
  let ready = null;
  const open = () => (ready ??= (async () => {
    let PGlite;
    // Named indirectly so the hosting build does not pack this 25 MB local-only package.
    const pkg = "@electric-sql/" + "pglite";
    try { ({ PGlite } = require(pkg)); }
    catch { throw new Error("No DATABASE_URL is set, and the local database package is missing. Run: npm install"); }
    // Closing the window without stopping the server leaves a lock file behind, and the database
    // then refuses to start. Only this app ever opens this folder, so a leftover lock is always stale.
    try {
      const fs = require("fs");
      const lock = path.join(LOCAL_DIR, "postmaster.pid");
      if (fs.existsSync(lock)) fs.unlinkSync(lock);
    } catch {}
    try {
      return await PGlite.create({ dataDir: LOCAL_DIR });
    } catch (e) {
      ready = null; // let a later call try again
      throw new Error("The local database could not be opened. It is only a working copy, so rebuild it with:  npm run reset-local");
    }
  })());
  driver = {
    kind: "local",
    dir: LOCAL_DIR,
    query: async (text, params) => (await open()).query(text, params || []),
    exec: async (sql) => (await open()).exec(sql),
    async tx(fn) {
      const db = await open();
      try { await db.exec("BEGIN"); const r = await fn({ query: (t, p) => db.query(t, p || []) }); await db.exec("COMMIT"); return r; }
      catch (e) { try { await db.exec("ROLLBACK"); } catch {} throw e; }
    },
    end: async () => { const db = await open(); await db.close(); },
  };
}
global.__brandroomDb = driver;

const query = (text, params = []) => driver.query(text, params);
const all = async (text, params = []) => (await driver.query(text, params)).rows;
const one = async (text, params = []) => (await driver.query(text, params)).rows[0] || null;

module.exports = { query, all, one, exec: driver.exec, tx: driver.tx, end: driver.end, kind: driver.kind, localDir: driver.dir || null };
