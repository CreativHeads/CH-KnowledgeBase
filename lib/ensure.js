// Applies schema.sql once per process. Every statement in it is safe to run again.
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const { exec, one, query } = require("./db");

const SKILLS = [
  ["caption-writing", "Caption writing", "caption", "Caption Bot", "How to write an on-brand caption for one platform."],
  ["qc-check-scoring", "QC check scoring", "qc", "Quality Check", "How to run the QC checklist and score the result."],
  ["client-detection", "Client detection", "detection", "Quality Check", "How to recognise the client from a creative."],
  ["compression-dispatch", "Compression and dispatch", "dispatch", "Dispatch", "How to compress a file and send it, including the _LQ name."],
  ["asset-filing", "Asset filing", "filing", "Asset", "How to file a finished asset in the client OneDrive folder."],
  ["reminders", "Reminders", "reminders", "Reminder", "How to group and time the daily reminder list."],
  ["ad-alerts", "Ad alerts", "ads", "Ad Alert", "How to alert on a CPC spike, overspend or a stopped ad."],
  ["seo-tasks", "SEO tasks", "seo", "SEO Studio", "How to turn the SEO library into the next SEO tasks."],
];

const skillBody = (name, purpose) => `## Purpose
${purpose}

## When to use
At the start of a job that needs this skill. Load the live approved version.

## Inputs
The KB bundles named for this skill. Client facts come from the KB, never from this skill.

## Steps
1. Load the KB bundles this skill names.
2. Follow the checklist for this job. Use the client's own rules where they differ from an agency default.
3. Write the result in the output format below.

## Output format
A short result a person can review. Do not post or publish anything.

## Checks and don'ts
Do not include keys, passwords or client data in this skill.
Do not invent claims, prices or approvals.

## Examples
A generic example only. Replace nothing here with a real client.
`;

let pending = null;

async function ensure() {
  if (!pending) pending = run().catch((e) => { pending = null; throw e; });
  return pending;
}

async function run() {
  const sql = fs.readFileSync(path.join(__dirname, "..", "schema.sql"), "utf8");
  const i = sql.indexOf("-- v2.1:");
  if (i < 0) throw new Error("schema.sql is missing the v2.1 section.");
  const slice = sql.slice(i);
  // Once this version of the schema has been applied, later cold starts skip the many setup statements.
  const version = crypto.createHash("sha256").update(slice).update(JSON.stringify(SKILLS)).digest("hex").slice(0, 16);
  const done = await one("SELECT value FROM settings WHERE key = 'schema_version'").catch(() => null);
  if (done && done.value === version) return;
  await exec(slice);
  for (const [slug, name, category, usedBy, purpose] of SKILLS) {
    const existing = await one("SELECT id FROM skills WHERE slug = $1", [slug]);
    if (existing) continue;
    const body = skillBody(name, purpose);
    const hash = crypto.createHash("sha256").update(body).digest("hex");
    const skill = await one(
      "INSERT INTO skills(slug, name, category, description, used_by) VALUES ($1,$2,$3,$4,$5) RETURNING id",
      [slug, name, category, purpose, usedBy]);
    await query(
      `INSERT INTO skill_versions(skill_id, version, body_md, change_note, status, content_hash)
       VALUES ($1, 1, $2, 'First draft', 'draft', $3)`,
      [skill.id, body, hash]);
  }
  await query("INSERT INTO settings(key, value) VALUES ('schema_version', $1::jsonb) ON CONFLICT (key) DO UPDATE SET value = excluded.value", [JSON.stringify(version)]);
}

module.exports = { ensure, SKILLS };
