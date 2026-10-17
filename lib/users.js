// People who can sign in. Admin only. The rules here exist so the workspace can never be left
// without anyone able to manage it.
const { all, one, query } = require("./db");
const { HttpError, num } = require("./http");
const { hashPassword } = require("./auth");
const { logActivity } = require("./workspace");

const ROLES = ["admin", "head", "staff"];
const emailOk = (e) => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(e);

const out = (u, me) => ({
  id: Number(u.id), name: u.name || "", email: u.email, role: u.role, active: u.active,
  hasPassword: !!u.pass_hash, lastSeenAt: u.last_seen_at ? new Date(u.last_seen_at).toISOString() : null,
  createdAt: new Date(u.created_at).toISOString(), isMe: me ? Number(u.id) === Number(me.id) : false,
});

async function list(me) {
  const rows = await all("SELECT * FROM users ORDER BY active DESC, role = 'admin' DESC, lower(coalesce(name, email))");
  return rows.map((u) => out(u, me));
}

const activeAdmins = async (exceptId = null) =>
  (await one("SELECT COUNT(*)::int AS n FROM users WHERE role = 'admin' AND active AND id <> $1", [exceptId ?? 0])).n;

function checkPassword(pw) {
  if (pw == null || pw === "") return null;
  if (String(pw).length < 8) throw new HttpError(400, "A password needs at least 8 characters.");
  if (String(pw).length > 200) throw new HttpError(400, "That password is too long.");
  return String(pw);
}

async function create(b, actor) {
  const email = String(b.email || "").toLowerCase().trim();
  const name = String(b.name || "").trim().slice(0, 100);
  if (!emailOk(email)) throw new HttpError(400, "Enter a valid email address.");
  if (!name) throw new HttpError(400, "Enter the person's name.");
  if (!ROLES.includes(b.role)) throw new HttpError(400, "Choose a role.");
  if (await one("SELECT 1 FROM users WHERE lower(email) = $1", [email])) throw new HttpError(400, "Someone with that email already exists.");
  const pw = checkPassword(b.password);
  const row = await one(
    "INSERT INTO users(email, name, role, pass_hash) VALUES ($1,$2,$3,$4) RETURNING *",
    [email, name, b.role, pw ? hashPassword(pw) : null]);
  await logActivity(actor, null, `Added ${name} as ${b.role === "admin" ? "an admin" : "a " + b.role}.`);
  return out(row, actor);
}

async function update(id, b, actor) {
  const u = await one("SELECT * FROM users WHERE id = $1", [num(id)]);
  if (!u) throw new HttpError(404, "Person not found.");
  const self = Number(u.id) === Number(actor.id);

  const name = b.name !== undefined ? String(b.name).trim().slice(0, 100) : u.name;
  if (!name) throw new HttpError(400, "Enter the person's name.");
  const role = b.role !== undefined ? b.role : u.role;
  if (!ROLES.includes(role)) throw new HttpError(400, "Choose a role.");
  const active = b.active !== undefined ? !!b.active : u.active;
  const pw = checkPassword(b.password);

  const losesAdmin = u.role === "admin" && u.active && (role !== "admin" || !active);
  if (losesAdmin) {
    if (self) throw new HttpError(400, "You can't remove your own admin access. Ask another admin to do it.");
    if ((await activeAdmins(u.id)) < 1) throw new HttpError(400, "There must always be at least one active admin.");
  }
  if (self && !active) throw new HttpError(400, "You can't switch off your own account.");

  const row = await one(
    `UPDATE users SET name = $1, role = $2, active = $3, pass_hash = COALESCE($4, pass_hash) WHERE id = $5 RETURNING *`,
    [name, role, active, pw ? hashPassword(pw) : null, u.id]);

  // Anything that should take effect straight away ends their current sign-ins.
  if (!active && u.active) await query("DELETE FROM sessions WHERE user_id = $1", [u.id]);
  if (pw && !self) await query("DELETE FROM sessions WHERE user_id = $1", [u.id]); // a new password signs them out everywhere else

  const bits = [];
  if (role !== u.role) bits.push(`changed ${name}'s role to ${role}`);
  if (active !== u.active) bits.push(`${active ? "switched on" : "switched off"} ${name}'s account`);
  if (pw) bits.push(`reset ${name}'s password`);
  if (name !== u.name && !bits.length) bits.push(`renamed ${u.name || u.email} to ${name}`);
  if (bits.length) await logActivity(actor, null, bits[0][0].toUpperCase() + bits.join(", ").slice(1) + ".");
  return out(row, actor);
}

async function remove(id, actor) {
  const u = await one("SELECT * FROM users WHERE id = $1", [num(id)]);
  if (!u) return { ok: true };
  if (Number(u.id) === Number(actor.id)) throw new HttpError(400, "You can't delete your own account.");
  if (u.role === "admin" && u.active && (await activeAdmins(u.id)) < 1) throw new HttpError(400, "There must always be at least one active admin.");
  await query("DELETE FROM users WHERE id = $1", [u.id]); // sessions go with them; their past work stays, unattributed
  await logActivity(actor, null, `Removed ${u.name || u.email}.`);
  return { ok: true };
}

module.exports = { ROLES, list, create, update, remove };
