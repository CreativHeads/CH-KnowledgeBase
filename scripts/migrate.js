// Copies the brand knowledge out of the local app's SQLite database into Supabase.
// Safe to run again: it replaces what it put there last time.
//
//   node scripts/migrate.js --yes            move everything
//   node scripts/migrate.js --yes --no-images   skip the reference images
require("./env");
const fs = require("fs");
const path = require("path");
const { ROOT, requireStopped } = require("./env");

const LOCAL = path.join(ROOT, "..");
const args = new Set(process.argv.slice(2));
if (!args.has("--yes")) {
  console.log(`This copies brand knowledge from ${path.join(LOCAL, "data", "seo.db")} into the Supabase database
(or the built-in local one), replacing anything already there.

Nothing in the local app is changed. Run it again with --yes when you are ready:

   node scripts/migrate.js --yes
`);
  process.exit(0);
}

// The local app's own code does the flattening, so the hosted copy matches what you see today.
process.env.DATA_DIR = process.env.LOCAL_DATA_DIR || path.join(LOCAL, "data");
const ckb = require(path.join(LOCAL, "lib", "ckb.js"));
const brandroom = require(path.join(LOCAL, "lib", "brandroom.js"));
const sqlite = require(path.join(LOCAL, "lib", "db.js"));
const { query, one, all, end, kind, localDir } = require("../lib/db");
const storage = require("../lib/storage");

const NOUN = {
  clients: "brand knowledge", examples: "examples", faqs: "FAQs", offerings: "products", offers: "offers",
  personas: "audiences", key_messages: "key messages", platform_rules: "platform rules", seasonal_events: "festivals & seasons",
  languages: "languages", contacts: "contacts", assets: "asset links", client_visual_refs: "reference images",
  client_internal_notes: "internal notes", testimonials: "testimonials", campaigns: "campaigns", competitors: "competitors",
  social_accounts: "social accounts", content_pillars: "content pillars", settings: "settings",
};
function activityLine(r) {
  const who = r.client || "the workspace";
  if (r.table_name === "brandbook") return `Downloaded the PDF brand guide for ${who}.`;
  if (r.action === "seo-create") return `Set up SEO for ${who}.`;
  if (r.action === "seo-sync") return `Synced ${who} with SEO.`;
  const noun = NOUN[r.table_name] || String(r.table_name || "").replace(/_/g, " ");
  if (r.action === "insert") return `Added ${noun} for ${who}.`;
  if (r.action === "delete") return `Removed ${noun} from ${who}.`;
  return `Updated ${who}'s ${noun}.`;
}

(async () => {
  await requireStopped("Copying data in");
  const report = [];
  console.log("Reading the local database…");

  const localUsers = sqlite.all("SELECT * FROM users WHERE role IN ('admin','head','staff') AND active=1 ORDER BY id");
  const localClients = sqlite.all("SELECT id FROM ck_clients ORDER BY id").map((r) => brandroom.toBrand(ckb.findClient(r.id)));

  console.log("Clearing the hosted tables…");
  await query("TRUNCATE activity, documents, refs, examples, clients, sessions RESTART IDENTITY CASCADE");

  /* users (keeps the password hashes, so existing sign-ins still work) */
  const userIdByLocal = new Map();
  for (const u of localUsers) {
    const row = await one(
      `INSERT INTO users(email, name, role, pass_hash, active) VALUES ($1,$2,$3,$4,true)
       ON CONFLICT (email) DO UPDATE SET name = excluded.name, role = excluded.role, pass_hash = COALESCE(users.pass_hash, excluded.pass_hash)
       RETURNING id`,
      [String(u.email).toLowerCase(), u.name || u.email, u.role, u.pass_hash]);
    userIdByLocal.set(u.id, row.id);
  }
  report.push(`${localUsers.length} people`);

  /* clients */
  const clientIdBySlug = new Map();
  for (const c of localClients) {
    const row = await one(
      `INSERT INTO clients(slug, name, industry, location, lead, colour, status, fields, internal_fields, created_at, updated_at, updated_by)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8::jsonb,$9::jsonb, now(), $10, $11) RETURNING id`,
      [c.id, c.name, c.industry, c.location, c.lead, c.colour, c.status,
       JSON.stringify(c.fields), JSON.stringify(c.internalFields), c.updatedAt, userIdByLocal.get(1) || null]);
    clientIdBySlug.set(c.id, row.id);
  }
  report.push(`${localClients.length} clients`);

  /* examples */
  let exCount = 0;
  for (const e of sqlite.all("SELECT * FROM ck_examples ORDER BY id")) {
    const c = ckb.findClient(e.client_id);
    const id = c && clientIdBySlug.get(c.slug);
    if (!id) continue;
    const platform = String(e.platform || "instagram").replace(/_/g, " ").replace(/\b\w/g, (x) => x.toUpperCase())
      .replace("Linkedin", "LinkedIn").replace("Youtube", "YouTube").replace("Whatsapp", "WhatsApp");
    await query(
      `INSERT INTO examples(client_id, platform, language, verdict, body, reason, featured, internal, created_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8, to_timestamp($9/1000.0))`,
      [id, ["Instagram", "Facebook", "LinkedIn", "YouTube", "WhatsApp"].includes(platform) ? platform : "Instagram",
       e.language || "English", e.verdict === "rejected" ? "rejected" : "approved", e.body || "",
       (e.verdict === "rejected" ? e.rejection_reason : e.performance_notes) || "", !!e.is_featured, !!e.is_internal, e.created_at || Date.now()]);
    exCount++;
  }
  report.push(`${exCount} caption examples`);

  /* activity history, from the local audit log */
  let actCount = 0;
  const seen = new Set();
  const auditRows = sqlite.all(
    `SELECT a.at, a.action, a.table_name, a.client_id, c.name client, u.name actor
       FROM ck_audit a LEFT JOIN ck_clients c ON c.id = a.client_id LEFT JOIN users u ON u.id = a.actor_id
      ORDER BY a.id DESC LIMIT 400`);
  for (const r of auditRows) {
    const day = new Date(r.at).toDateString();
    const key = [r.actor, r.client_id, r.table_name, r.action, day].join("|");
    if (seen.has(key)) continue;
    seen.add(key);
    const c = r.client_id ? ckb.findClient(r.client_id) : null;
    await query("INSERT INTO activity(client_id, actor, body, created_at) VALUES ($1,$2,$3, to_timestamp($4/1000.0))",
      [(c && clientIdBySlug.get(c.slug)) || null, r.actor || "Workspace admin", activityLine(r), r.at]);
    if (++actCount >= 60) break;
  }
  report.push(`${actCount} activity entries`);

  /* reference images */
  let imgCount = 0, imgSkipped = 0;
  if (!args.has("--no-images")) {
    if (!storage.configured()) {
      console.log("  (SUPABASE_URL / SUPABASE_SERVICE_KEY not set, so images were skipped)");
      imgSkipped = sqlite.get("SELECT COUNT(*) n FROM ck_visual_refs").n;
    } else {
      for (const r of sqlite.all("SELECT * FROM ck_visual_refs WHERE is_active=1 ORDER BY id")) {
        const c = ckb.findClient(r.client_id);
        const id = c && clientIdBySlug.get(c.slug);
        const file = path.join(process.env.DATA_DIR, "visual-refs", r.file);
        if (!id || !fs.existsSync(file)) { imgSkipped++; continue; }
        const buf = fs.readFileSync(file);
        const dest = `${c.slug}/${path.basename(r.file)}`;
        await storage.upload(dest, buf, r.mime || "image/jpeg");
        const kind = { logo: "Logo", product: "Product", packaging: "Packaging", location: "Location", store_front: "Location" }[r.kind] || "Reference";
        await query(
          `INSERT INTO refs(client_id, kind, name, description, path, mime, size, created_at)
           VALUES ($1,$2,$3,$4,$5,$6,$7, to_timestamp($8/1000.0))`,
          [id, kind, r.title || "Reference", r.ai_description || "", dest, r.mime || "image/jpeg", buf.length, r.created_at || Date.now()]);
        imgCount++;
      }
    }
  }
  report.push(`${imgCount} reference images${imgSkipped ? ` (${imgSkipped} skipped)` : ""}`);

  console.log(`\nCopied into ${kind === "local" ? "the local database" : "Supabase"}:`);
  for (const line of report) console.log("  · " + line);
  console.log("\nThe local app was not changed.\n");
  await end();
})().catch(async (e) => { console.error("\nMigration stopped:", e.message); try { await end(); } catch {} process.exit(1); });
