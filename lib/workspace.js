// Reading and writing the workspace: clients, examples, reference images, documents and activity.
const { all, one, query } = require("./db");
const { HttpError } = require("./http");
const { canEdit } = require("./auth");

// The field keys the Brandroom screens use. Anything else sent by a browser is ignored.
const KEYS = [
  "about", "website", "tone", "adjectives", "soundsLike", "doesNotSoundLike", "dos", "donts",
  "audience", "personas", "products", "usps", "tagline", "messages", "validity",
  "wordsUse", "wordsAvoid", "primaryLanguage", "languageNotes", "hashtags", "bannedHashtags",
  "cta", "emoji", "platforms", "maxLength", "format", "compliance", "disclaimer", "seasonal",
  "contacts", "approvals", "assets", "aliases", "keywords", "colours", "logoRules", "internalNotes",
  "phones", "handles", "address", "fonts", "bannedClaims", "onedriveFolder", "businessType",
  "offers", "approvalGroup", "approvalTurnaround", "adAccounts", "adBudgets", "adAreas", "adKpis",
  "seoKeywords", "seoCompetitors", "sitePages", "competitors",
];
const KEYSET = new Set(KEYS);
const PLATFORMS = ["Instagram", "Facebook", "LinkedIn", "YouTube", "WhatsApp", "Website"];
const LANGUAGES = ["English", "Malayalam", "Manglish"];
const PALETTE = ["#3d6251", "#786b93", "#ad645f", "#4f6f8f", "#8a6a3f", "#526bc4", "#3f7d7a", "#9a5b7c"];

const iso = (d) => (d ? new Date(d).toISOString() : new Date(0).toISOString());
const slugify = (s) => String(s).toLowerCase().normalize("NFKD").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 60) || "client";
const clean = (v, max = 12000) => String(v ?? "").slice(0, max).trim();

// Who or what set each field: a person, or the AI (with where it read it). People who cannot edit never see
// the values that were replaced, or anything about fields kept private.
function metaFor(c, withInternal) {
  const raw = c.field_meta || {};
  if (withInternal) return raw;
  const hidden = new Set(["internalNotes", "competitors", ...(c.internal_fields || [])]);
  const out = {};
  for (const [k, v] of Object.entries(raw)) if (!hidden.has(k)) { const { previous, alt, ...rest } = v || {}; out[k] = rest; }
  return out;
}

const outClient = (c, { withInternal = true } = {}) => {
  const fields = { ...(c.fields || {}) };
  if (!withInternal) { delete fields.internalNotes; delete fields.competitors; for (const k of c.internal_fields || []) delete fields[k]; }
  return {
    id: c.slug, dbId: Number(c.id), name: c.name, industry: c.industry || "", location: c.location || "",
    lead: c.lead || "", colour: c.colour || PALETTE[Number(c.id) % PALETTE.length], status: c.status,
    fields, internalFields: c.internal_fields || [], meta: metaFor(c, withInternal), updatedAt: iso(c.updated_at),
  };
};

async function logActivity(actor, clientId, body) {
  await query("INSERT INTO activity(client_id, user_id, actor, body) VALUES ($1,$2,$3,$4)",
    [clientId || null, actor?.id || null, actor?.name || "Workspace admin", clean(body, 300)]).catch(() => {});
}


async function workspace(user, { config = {} } = {}) {
  const editor = canEdit(user);
  const [cs, exs, rfs, docs, acts, team, sugg] = await Promise.all([
    all("SELECT * FROM clients ORDER BY updated_at DESC"),
    all("SELECT * FROM examples ORDER BY created_at DESC, id DESC"),
    all("SELECT * FROM refs ORDER BY id DESC"),
    all("SELECT * FROM documents ORDER BY created_at DESC"),
    all("SELECT * FROM activity ORDER BY created_at DESC LIMIT 40"),
    all("SELECT id, name, role FROM users WHERE active ORDER BY role = 'admin' DESC, name"),
    editor ? all("SELECT s.id, s.suggestion, s.source, c.slug FROM alias_suggestions s JOIN clients c ON c.id = s.client_id WHERE s.status = 'pending' ORDER BY s.created_at DESC LIMIT 40") : [],
  ]);
  const slug = new Map(cs.map((c) => [String(c.id), c.slug]));
  const sl = (id) => slug.get(String(id)) || null;

  return {
    clients: cs.map((c) => outClient(c, { withInternal: editor })),
    examples: exs.filter((e) => sl(e.client_id) && (editor || !e.internal)).map((e) => ({
      id: String(e.id), clientId: sl(e.client_id), platform: e.platform, language: e.language,
      verdict: e.verdict, text: e.body, reason: e.reason || "", featured: e.featured, internal: e.internal, createdAt: iso(e.created_at),
    })),
    refs: rfs.filter((r) => sl(r.client_id)).map((r) => ({
      id: String(r.id), clientId: sl(r.client_id), kind: r.kind, name: r.name, description: r.description || "",
      verdict: r.verdict || "", why: r.why || "", onedriveUrl: r.onedrive_url || "", platform: r.platform || "",
      postedOn: r.posted_on ? String(r.posted_on).slice(0, 10) : "", createdAt: iso(r.created_at),
    })),
    documents: docs.filter((d) => sl(d.client_id) && (editor || !d.internal)).map((d) => require("./documents").out(d, sl(d.client_id))),
    activities: acts.map((a) => ({ id: String(a.id), text: a.body, actor: a.actor, createdAt: iso(a.created_at) })),
    team: team.map((t) => ({ id: Number(t.id), name: t.name || "Team member", role: t.role })),
    suggestions: (sugg || []).map((s) => ({ id: String(s.id), clientId: s.slug, suggestion: s.suggestion, source: s.source })),
    me: { id: Number(user.id), name: user.name || user.email, email: user.email, role: user.role, canEdit: editor, isAdmin: user.role === "admin" },
    connections: config.connections || {},
    config,
  };
}

/* ---------- clients ---------- */
async function findClient(slugOrId) {
  if (!slugOrId) return null;
  return one("SELECT * FROM clients WHERE slug = $1", [String(slugOrId)]);
}
async function clientOr404(slugOrId) {
  const c = await findClient(slugOrId);
  if (!c) throw new HttpError(404, "Client not found.");
  return c;
}

// A field a person changed is marked as theirs and counts as reviewed. A field they cleared loses its tag.
function humanMeta(existing, fields) {
  const meta = { ...(existing.field_meta || {}) };
  const before = existing.fields || {};
  const now = new Date().toISOString();
  for (const k of new Set([...Object.keys(before), ...Object.keys(fields)])) {
    if (String(before[k] ?? "") === String(fields[k] ?? "")) continue;
    if (String(fields[k] ?? "")) meta[k] = { by: "human", at: now, reviewed: true }; else delete meta[k];
  }
  return meta;
}

async function saveClient(body, actor) {
  const name = clean(body.name, 100);
  if (!name) throw new HttpError(400, "Enter the client name.");

  const fields = {};
  for (const [k, v] of Object.entries(body.fields || {})) if (KEYSET.has(k)) { const t = clean(v); if (t) fields[k] = t; }
  const internal = [...new Set((Array.isArray(body.internalFields) ? body.internalFields : []).filter((k) => KEYSET.has(k)))];
  const industry = clean(body.industry, 100);
  const location = clean(body.location, 100);
  const lead = clean(body.lead, 80);
  const colour = /^#[0-9a-f]{6}$/i.test(body.colour || "") ? body.colour : null;
  const status = body.status === "archived" ? "archived" : "active";

  const existing = await findClient(body.id);
  if (existing) {
    if (existing.status !== status && actor.role !== "admin") throw new HttpError(403, "Only an admin can archive or restore a client.");
    if (name.toLowerCase() !== existing.name.toLowerCase() && await one("SELECT 1 FROM clients WHERE lower(name) = lower($1) AND id <> $2", [name, existing.id]))
      throw new HttpError(400, "A client with that name already exists.");
    const row = await one(
      `UPDATE clients SET name=$1, industry=$2, location=$3, lead=$4, colour=COALESCE($5, colour), status=$6,
         fields=$7::jsonb, internal_fields=$8::jsonb, updated_at=now(), updated_by=$9, field_meta=$11::jsonb WHERE id=$10 RETURNING *`,
      [name, industry, location, lead, colour, status, JSON.stringify(fields), JSON.stringify(internal), actor.id, existing.id, JSON.stringify(humanMeta(existing, fields))]);
    const changed = JSON.stringify(existing.fields) !== JSON.stringify(fields);
    await logActivity(actor, row.id, changed ? `Updated ${name}'s brand knowledge.` : `Updated ${name}'s details.`);
    return outClient(row);
  }

  if (await one("SELECT 1 FROM clients WHERE lower(name) = lower($1)", [name])) throw new HttpError(400, "A client with that name already exists.");
  let slug = slugify(name);
  for (let n = 2; await one("SELECT 1 FROM clients WHERE slug = $1", [slug]); n++) slug = `${slugify(name)}-${n}`;
  const row = await one(
    `INSERT INTO clients(slug, name, industry, location, lead, colour, status, fields, internal_fields, updated_by)
     VALUES ($1,$2,$3,$4,$5,COALESCE($6,'#526bc4'),$7,$8::jsonb,$9::jsonb,$10) RETURNING *`,
    [slug, name, industry, location, lead, colour, status, JSON.stringify(fields), JSON.stringify(internal.length ? internal : ["internalNotes", "competitors"]), actor.id]);
  await logActivity(actor, row.id, `Added ${name} to the workspace.`);
  return outClient(row);
}

/* ---------- examples ---------- */
async function saveExample(e, actor) {
  const c = await clientOr404(e.clientId);
  const text = clean(e.text, 5000);
  if (!text) throw new HttpError(400, "Add the caption text.");
  const verdict = e.verdict === "rejected" ? "rejected" : "approved";
  const reason = clean(e.reason, 2000);
  if (verdict === "rejected" && !reason) throw new HttpError(400, "Say why it was rejected.");
  const platform = PLATFORMS.includes(e.platform) ? e.platform : "Instagram";
  const language = LANGUAGES.includes(e.language) ? e.language : "English";
  const featured = !!e.featured;

  const existing = /^\d+$/.test(String(e.id || "")) ? await one("SELECT * FROM examples WHERE id = $1", [Number(e.id)]) : null;
  if (existing) {
    await query("UPDATE examples SET client_id=$1, platform=$2, language=$3, verdict=$4, body=$5, reason=$6, featured=$7 WHERE id=$8",
      [c.id, platform, language, verdict, text, reason, featured, existing.id]);
    if (existing.featured !== featured) await logActivity(actor, c.id, `${featured ? "Featured" : "Unfeatured"} an example for ${c.name}.`);
  } else {
    await query("INSERT INTO examples(client_id, platform, language, verdict, body, reason, featured, added_by) VALUES ($1,$2,$3,$4,$5,$6,$7,$8)",
      [c.id, platform, language, verdict, text, reason, featured, actor.id]);
    await logActivity(actor, c.id, `Added ${verdict === "approved" ? "an approved" : "a rejected"} example for ${c.name}.`);
  }
  await query("UPDATE clients SET updated_at = now() WHERE id = $1", [c.id]);
}

/* ---------- the context the bot may see ---------- */
function bundle(c, examples, platform, language, documents = []) {
  const b = outClient(c);
  const brand = Object.fromEntries(Object.entries(b.fields).filter(([k]) => k !== "internalNotes" && !b.internalFields.includes(k)));
  const out = { client: b.name, platform, language, brand, examples: examples.map((e) => ({ verdict: e.verdict, text: e.body, reason: e.reason || "" })) };
  if (documents.length) out.documents = documents;
  return out;
}
// The exact context used when writing, documents included. Both the Caption Bot and the
// "Writing context" tab read this, so what you see is what the bot sees.
async function contextFor(c, platform, language) {
  const [examples, documents] = await Promise.all([
    all("SELECT verdict, body, reason FROM examples WHERE client_id = $1 AND NOT internal ORDER BY featured DESC, created_at DESC LIMIT 8", [c.id]),
    require("./documents").forContext(c.id),
  ]);
  return bundle(c, examples, platform, language, documents);
}

module.exports = {
  KEYS, KEYSET, PLATFORMS, LANGUAGES, slugify, outClient, workspace, findClient, clientOr404,
  saveClient, saveExample, logActivity, bundle, contextFor,
};
