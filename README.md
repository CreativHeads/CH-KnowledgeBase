# Brandroom

CreativHeads' brand knowledgebase: every client's voice, facts, documents and examples in one place.
Other tools, such as the SEO site, read it through a read-only API.

Runs on **Vercel** (the site) and **Supabase** (database and files).

| Guide | What it covers |
|---|---|
| [VPS.md](VPS.md) | Run it on your own Hostinger VPS instead, with Nginx and systemd |
| [DEPLOY.md](DEPLOY.md) | GitHub → Supabase → Vercel → `brandroom.creativheads.com`, step by step |
| [SECURITY.md](SECURITY.md) | What protects the site, and what to do if a key leaks |

---

## Run it on your own computer

You need Node.js 22 or newer.

```bash
npm install
npm run dev
```

Open **http://localhost:3100** and sign in.

With no `DATABASE_URL` set, it uses a small built-in database stored in `.local-db`, and keeps files in
`.local-files`. Nothing else to install. The first page load takes 10–20 seconds while that database wakes up.

Stop it with **Ctrl+C**, not by closing the window, so the database closes properly.

| Command | What it does |
|---|---|
| `npm run dev` | Start the site on port 3100 |
| `npm run setup` | Create the tables (safe to run again) |
| `npm run reset-local` | Throw away the local copy and rebuild it. Refuses to run while the site is up |
| `node scripts/migrate.js --yes` | One-time copy of the older app's brand data into this database |

If it says "The local database could not be opened", run `npm run reset-local`.

## Settings

Copy `.env.example` to `.env` and fill it in. `.env` is ignored by git. The full list, and where to find each
value, is in [DEPLOY.md](DEPLOY.md). On Vercel the same names go in **Settings → Environment Variables**.

## What is in the folder

```
api/index.js        the whole API, as one Vercel function
lib/                sign-in, people, documents, storage, the knowledge API
public/             the screens (plain files, no build step)
schema.sql          the database tables
scripts/            running locally, setting up the database, migrating data
vercel.json         routing and browser security headers
```

## Who can do what

| | Admin | Head | Staff |
|---|---|---|---|
| View brand knowledge | ✓ | ✓ | ✓ |
| See internal notes, locked fields, team-only documents | ✓ | ✓ | |
| Edit clients, documents, images, examples | ✓ | ✓ | |
| Add, edit and remove people | ✓ | | |

## Documents

Each client has a **Documents** tab. The words inside a PDF, text, Markdown or CSV file are read out on
upload and kept with the brand. Files can be up to 3 MB each, which is Vercel's upload limit. A scanned PDF
holds pictures of text, so nothing can be read from it, and the screen says so. **Team only** keeps a
document out of the writing context and out of reach of Staff.

## Knowledge API

The SEO site reads brand knowledge from here over a **read-only** API. It never receives internal notes,
locked fields, team-only documents or internal examples.

**1. Make a key** (any long random text, at least 24 characters), one per tool:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**2. Switch it on.** Add a line to `.env`, and to Vercel's environment variables:

```
KB_API_KEYS=seo-agent:the-key-you-made
```

**3. The tool calls it** with the key in a header:

```bash
curl "https://brandroom.creativheads.com/api/kb/v1/clients?website=example.com" \
  -H "Authorization: Bearer the-key-you-made"
```

| Call | What it gives |
|---|---|
| `GET /api/kb/v1/clients?website=example.com` | The client that owns a website |
| `GET /api/kb/v1/clients/:slug?include=examples,documents` | Everything written down about a brand |
| `GET /api/kb/v1/clients/:slug/context` | Brand knowledge, examples and document text, ready to hand to a model |
| `GET /api/kb/v1/clients/:slug/documents/:id` | The full text of one document |
| `GET /api/kb/v1/search?q=…` | Search across every brand's fields, examples and documents |

Remove a key from `KB_API_KEYS` and redeploy to cut that tool off. Give each tool its own key.
