// Agency libraries, the skills library, bot API keys and alias suggestions.
const crypto = require("crypto");
const { all, one, query } = require("./db");
const { HttpError, num } = require("./http");

const AGENCY = {
  qc: "QC checklist",
  template: "Templates",
  sop: "Process SOPs",
  media: "Music and stock",
};
const HEADINGS = ["## Purpose", "## When to use", "## Inputs", "## Steps", "## Output format", "## Checks and don'ts", "## Examples"];
const SCOPES = ["clients", "brand", "writing", "qc", "contacts", "assets", "examples", "detect", "search", "bot:log", "ads", "seo", "agency"];

const clean = (v, max = 20000) => String(v ?? "").slice(0, max).trim();
const iso = (d) => (d ? new Date(d).toISOString() : null);

function assertSkillBody(body) {
  for (const h of HEADINGS) if (!body.includes(h)) throw new HttpError(400, `Add the heading “${h.replace("## ", "")}”.`);
  if (/chkb_[A-Za-z0-9_-]{8,}|sk-ant-|sk-[A-Za-z0-9]{16,}/.test(body)) throw new HttpError(400, "A skill cannot contain a key or a password.");
}

function outAgency(r) {
  return {
    id: String(r.id), library: r.library, title: r.title, body: r.body, meta: r.meta || {},
    status: r.status, updatedAt: iso(r.updated_at), approvedAt: iso(r.approved_at),
  };
}
function outSkill(s, versions, reviews) {
  const live = versions.find((v) => String(v.id) === String(s.live_version_id));
  return {
    id: String(s.id), slug: s.slug, name: s.name, category: s.category, description: s.description, usedBy: s.used_by,
    liveVersion: live ? live.version : null,
    versions: versions.map((v) => ({
      id: String(v.id), version: v.version, status: v.status, body: v.body_md, changeNote: v.change_note,
      hash: v.content_hash, createdAt: iso(v.created_at), approvedAt: iso(v.approved_at),
      reviews: reviews.filter((r) => String(r.version_id) === String(v.id)).map((r) => ({
        decision: r.decision, comment: r.comment, at: iso(r.created_at),
      })),
    })),
  };
}

async function listAgency() {
  const rows = await all("SELECT * FROM agency_items ORDER BY library, title");
  return rows.map(outAgency);
}

async function saveAgency(body, user) {
  const library = AGENCY[body.library] ? body.library : null;
  if (!library) throw new HttpError(400, "Choose a library.");
  const title = clean(body.title, 160);
  const text = clean(body.body, 20000);
  if (!title || !text) throw new HttpError(400, "Add a title and the text.");
  if (/chkb_[A-Za-z0-9_-]{8,}|sk-ant-/.test(text)) throw new HttpError(400, "This text looks like a key. Take it out.");
  const existing = /^\d+$/.test(String(body.id || "")) ? await one("SELECT * FROM agency_items WHERE id = $1", [Number(body.id)]) : null;
  if (existing) {
    const row = await one(
      `UPDATE agency_items SET title=$1, body=$2, status='draft', approved_by=NULL, approved_at=NULL, updated_by=$3, updated_at=now()
       WHERE id=$4 RETURNING *`,
      [title, text, user.id, existing.id]);
    return outAgency(row);
  }
  const row = await one(
    `INSERT INTO agency_items(library, title, body, updated_by) VALUES ($1,$2,$3,$4) RETURNING *`,
    [library, title, text, user.id]);
  return outAgency(row);
}

async function approveAgency(id, user) {
  const row = await one(
    `UPDATE agency_items SET status='approved', approved_by=$2, approved_at=now(), updated_at=now() WHERE id=$1 RETURNING *`,
    [num(id), user.id]);
  if (!row) throw new HttpError(404, "That item was not found.");
  return outAgency(row);
}

async function removeAgency(id) {
  await query("DELETE FROM agency_items WHERE id = $1", [num(id)]);
  return { ok: true };
}

async function listSkills() {
  const [skills, versions, reviews] = await Promise.all([
    all("SELECT * FROM skills ORDER BY name"),
    all("SELECT * FROM skill_versions ORDER BY skill_id, version"),
    all("SELECT * FROM skill_reviews ORDER BY created_at"),
  ]);
  return skills.map((s) => outSkill(s, versions.filter((v) => String(v.skill_id) === String(s.id)), reviews));
}

async function saveSkillVersion(body, user) {
  const slug = clean(body.slug, 60);
  const skill = await one("SELECT * FROM skills WHERE slug = $1", [slug]);
  if (!skill) throw new HttpError(404, "That skill was not found.");
  const text = clean(body.body, 30000);
  assertSkillBody(text);
  const note = clean(body.changeNote, 300);
  const hash = crypto.createHash("sha256").update(text).digest("hex");
  const draft = await one("SELECT * FROM skill_versions WHERE skill_id = $1 AND status = 'draft' ORDER BY version DESC LIMIT 1", [skill.id]);
  if (draft) {
    await query("UPDATE skill_versions SET body_md=$1, change_note=$2, content_hash=$3, drafted_by=$4 WHERE id=$5",
      [text, note || draft.change_note, hash, user.id, draft.id]);
  } else {
    const next = await one("SELECT COALESCE(MAX(version), 0)::int AS n FROM skill_versions WHERE skill_id = $1", [skill.id]);
    await query(
      `INSERT INTO skill_versions(skill_id, version, body_md, change_note, content_hash, drafted_by) VALUES ($1,$2,$3,$4,$5,$6)`,
      [skill.id, next.n + 1, text, note || "Updated draft", hash, user.id]);
  }
  await query("UPDATE skills SET updated_at = now() WHERE id = $1", [skill.id]);
  return { ok: true };
}

async function reviewSkill(body, user) {
  const version = await one("SELECT * FROM skill_versions WHERE id = $1", [Number(body.versionId)]);
  if (!version) throw new HttpError(404, "That version was not found.");
  if (version.status === "approved" || version.status === "retired") throw new HttpError(400, "An approved version cannot be edited. Start a new draft.");
  const decision = body.decision === "approve" ? "approve" : "request_changes";
  await query("INSERT INTO skill_reviews(version_id, user_id, decision, comment) VALUES ($1,$2,$3,$4)",
    [version.id, user.id, decision, clean(body.comment, 1000)]);
  if (version.status === "draft") await query("UPDATE skill_versions SET status = 'in_review' WHERE id = $1", [version.id]);
  return { ok: true };
}

async function publishSkill(body, user) {
  const version = await one("SELECT * FROM skill_versions WHERE id = $1", [Number(body.versionId)]);
  if (!version) throw new HttpError(404, "That version was not found.");
  if (version.status === "retired") throw new HttpError(400, "Use rollback to bring an older version back.");
  const reviews = await all("SELECT * FROM skill_reviews WHERE version_id = $1 AND decision = 'approve'", [version.id]);
  if (!reviews.length && !body.onBehalf) throw new HttpError(400, "A reviewer has to approve this version first. An admin can record that review.");
  if (!reviews.length && body.onBehalf) {
    await query("INSERT INTO skill_reviews(version_id, user_id, decision, comment) VALUES ($1,$2,'approve',$3)",
      [version.id, user.id, clean(body.comment, 1000) || "Recorded by admin on behalf of the reviewer."]);
  }
  await query("UPDATE skill_versions SET status = 'retired' WHERE skill_id = $1 AND status = 'approved' AND id <> $2", [version.skill_id, version.id]);
  await query("UPDATE skill_versions SET status = 'approved', approved_by = $2, approved_at = now() WHERE id = $1", [version.id, user.id]);
  await query("UPDATE skills SET live_version_id = $1, updated_at = now() WHERE id = $2", [version.id, version.skill_id]);
  return { ok: true };
}

async function rollbackSkill(versionId, user) {
  const version = await one("SELECT * FROM skill_versions WHERE id = $1", [Number(versionId)]);
  if (!version || (version.status !== "approved" && version.status !== "retired")) throw new HttpError(400, "Only an approved version can be published again.");
  await query("UPDATE skill_versions SET status = 'retired' WHERE skill_id = $1 AND status = 'approved'", [version.skill_id]);
  await query("UPDATE skill_versions SET status = 'approved', approved_by = $2, approved_at = now() WHERE id = $1", [version.id, user.id]);
  await query("UPDATE skills SET live_version_id = $1, updated_at = now() WHERE id = $2", [version.id, version.skill_id]);
  return { ok: true };
}

function hashKey(key) { return crypto.createHash("sha256").update(key).digest("hex"); }

async function listKeys() {
  const rows = await all("SELECT id, name, key_prefix, scopes, all_clients, rate_limit_per_min, expires_at, active, revoked_at, last_used_at, created_at FROM api_keys ORDER BY created_at DESC");
  return rows.map((r) => ({
    id: String(r.id), name: r.name, prefix: r.key_prefix, scopes: r.scopes || [],
    rate: r.rate_limit_per_min, expiresAt: iso(r.expires_at), active: r.active && !r.revoked_at,
    lastUsedAt: iso(r.last_used_at), createdAt: iso(r.created_at),
  }));
}

async function createKey(body, user) {
  const name = clean(body.name, 80);
  if (!name) throw new HttpError(400, "Name the key after the bot that will use it.");
  const scopes = [...new Set((Array.isArray(body.scopes) ? body.scopes : []).map((s) => String(s).trim()).filter(Boolean))];
  for (const s of scopes) {
    if (SCOPES.includes(s) || /^skill:[a-z0-9-]+$/.test(s)) continue;
    throw new HttpError(400, "Unknown scope: " + s);
  }
  if (!scopes.length) throw new HttpError(400, "Choose at least one scope.");
  const days = Math.min(365, Math.max(1, Number(body.days) || 365));
  const raw = "chkb_" + crypto.randomBytes(32).toString("base64url");
  const row = await one(
    `INSERT INTO api_keys(name, key_prefix, key_hash, scopes, rate_limit_per_min, expires_at, created_by)
     VALUES ($1,$2,$3,$4,60, now() + ($5::int * interval '1 day'), $6) RETURNING id, key_prefix`,
    [name, raw.slice(0, 12), hashKey(raw), scopes, days, user.id]);
  return { id: String(row.id), prefix: row.key_prefix, key: raw, scopes, expiresInDays: days };
}

async function revokeKey(id) {
  await query("UPDATE api_keys SET active = false, revoked_at = now() WHERE id = $1", [num(id)]);
  return { ok: true };
}

async function suggestionsFor(clientId) {
  return (await all("SELECT * FROM alias_suggestions WHERE client_id = $1 AND status = 'pending' ORDER BY created_at DESC", [clientId]))
    .map((r) => ({ id: String(r.id), suggestion: r.suggestion, source: r.source }));
}

async function decideSuggestion(id, accept, user) {
  const row = await one("SELECT * FROM alias_suggestions WHERE id = $1 AND status = 'pending'", [num(id)]);
  if (!row) throw new HttpError(404, "That suggestion was already decided.");
  await query("UPDATE alias_suggestions SET status = $2, decided_by = $3 WHERE id = $1", [row.id, accept ? "accepted" : "rejected", user.id]);
  if (accept) {
    const c = await one("SELECT fields FROM clients WHERE id = $1", [row.client_id]);
    const fields = { ...(c.fields || {}) };
    const have = String(fields.aliases || "").split(",").map((s) => s.trim()).filter(Boolean);
    if (!have.some((a) => a.toLowerCase() === row.suggestion.toLowerCase())) have.push(row.suggestion);
    fields.aliases = have.join(", ");
    await query("UPDATE clients SET fields = $2::jsonb, updated_at = now() WHERE id = $1", [row.client_id, JSON.stringify(fields)]);
  }
  return { ok: true };
}

module.exports = {
  AGENCY, SCOPES, listAgency, saveAgency, approveAgency, removeAgency,
  listSkills, saveSkillVersion, reviewSkill, publishSkill, rollbackSkill,
  listKeys, createKey, revokeKey, hashKey, suggestionsFor, decideSuggestion,
};
