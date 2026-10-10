# Security

## What protects the site

| Risk | Protection |
|---|---|
| Guessing passwords | 8 wrong tries per email and 40 per address in 10 minutes, then locked for the rest of the window. Counted in the database, so it holds across every copy of the site |
| Learning which emails have accounts | A wrong email and a wrong password take the same time and give the same answer |
| Guessing an API key | 20 wrong keys per address in 10 minutes, then blocked. Keys are compared in constant time |
| Stolen session cookie | HttpOnly, Secure and SameSite. Sessions last 14 days, and ending them is immediate: switching a person off or deleting them signs them out |
| Forged requests from another website | Every change needs a header a foreign site cannot send, and cookies are SameSite |
| Staff seeing team-only material | Checked on the server, not just hidden on screen. Internal notes, locked fields, team-only documents and internal examples are never sent to Staff |
| Fake files | A file's first bytes must match its claimed type (PDF, PNG, JPEG, WebP, or real text) |
| Injected script on a page | A strict Content-Security-Policy: only the site's own scripts run, no inline scripts, no outside resources |
| Clickjacking, sniffing, snooping | X-Frame-Options, nosniff, HSTS, a locked-down Permissions-Policy and Referrer-Policy |
| Database access from a browser | Every table has row-level security on and no public policy. Only the site's server can read or write, using the service key |
| Leaking how the site is built | Unexpected errors show a plain message to the person. The detail goes to Vercel's logs |
| Locking everyone out | The last active admin can't be removed, and you can't demote, switch off or delete yourself |
| Public site running on a guessable secret | On Vercel, a missing or short `APP_SECRET` is a hard error, not a quiet fallback |
| Known flaws in packages | `npm audit` is clean, and Dependabot proposes updates weekly |

## Keep these out of GitHub, chats and documents

These all live only in `.env` on your computer and in Vercel's environment variables:

- `SUPABASE_SERVICE_KEY` — can read and change everything in the database and storage
- `DATABASE_URL` — contains the database password
- `MS_CLIENT_SECRET`, `APP_SECRET`, `KB_API_KEYS`

`.gitignore` already blocks `.env`, `.env.*`, keys, certificates and local data. Before every first push,
run `git status` and read the list.

## If a key leaks

Treat it as leaked the moment it was pasted anywhere public, even if you deleted it a minute later.

| Key | What to do |
|---|---|
| `KB_API_KEYS` entry | Make a new one, change it in Vercel and in SEO Studio, redeploy. The old one stops working at once |
| `SUPABASE_SERVICE_KEY` | Supabase → Project Settings → API → reset the `service_role` key. Put the new one in Vercel and redeploy |
| Database password | Supabase → Project Settings → Database → reset the password. Update `DATABASE_URL` in Vercel and redeploy |
| `MS_CLIENT_SECRET` | Azure → your app → Certificates & secrets → add a new secret, delete the old one. Update Vercel |
| `APP_SECRET` | Change it in Vercel and redeploy. Anyone mid-way through a Microsoft sign-in will just try again |
| A person's password | An admin sets a new one under Settings → People & roles. That also signs them out everywhere |
| A key already pushed to GitHub | Rotate it first, as above. Removing it from the files is not enough, because it stays in the history |

## Good habits

- Give each tool its own API key, so you can cut one off without touching the others.
- Use **Switch off** for someone who leaves, rather than deleting, if you want to keep a record of what they did.
- Keep the repository **private**.
- Turn on two-step verification for GitHub, Vercel, Supabase and Hostinger. Anyone who gets into those accounts can reach the site.
