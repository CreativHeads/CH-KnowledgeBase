# Putting Brandroom online: GitHub → Supabase → Vercel → brandroom.creativheads.com

Follow the steps in order. Each one says how to tell it worked.
Allow about 45 minutes the first time. Most of it is waiting on dashboards.

You will end up with:

```
https://brandroom.creativheads.com   →   Vercel (the site)   →   Supabase (database + files)
```

Keep two things open in a notepad as you go. You will be copying values between sites:
the **Supabase** values (step 2) and the **Vercel address** (step 3).

---

## 1. Put the code on GitHub

Push **only the `brandroom-cloud` folder**, as its own repository. Not the whole `CH KnowledgeBase`
folder, which also holds the SEO app and your data.

1. On github.com, click **New repository**. Name it `brandroom`. Choose **Private**. Do not tick
   "Add a README".
2. In a terminal:

```bash
cd "C:\Users\ADMIN\Desktop\CH KnowledgeBase\brandroom-cloud"
git init
git add .
git status
```

3. **Read the list `git status` prints before going on.** It must NOT contain `.env`, `.local-db`,
   `.local-files` or `node_modules`. If you see any of them, stop and tell me.
4. Then:

```bash
git commit -m "Brandroom"
git branch -M main
git remote add origin https://github.com/YOUR-NAME/brandroom.git
git push -u origin main
```

**It worked when** the files appear on the GitHub page and there is no `.env` among them.

---

## 2. Supabase: the database and file storage

1. At **supabase.com** → **New project**. Name it `brandroom`.
   Choose the region **Mumbai (ap-south-1)**, which is the closest to you.
   Set a database password and **save it**. You cannot read it back later.
2. Wait about 2 minutes for the project to finish setting up.
3. **Storage → New bucket.** Name it exactly `brand-refs`. Leave **Public bucket OFF**.
4. Collect these values into your notepad:

| What | Where to find it |
|---|---|
| `DATABASE_URL` | Click **Connect** at the top → **Transaction pooler** → copy the string. It ends in `:6543/postgres`. Replace `[YOUR-PASSWORD]` in it with your database password. |
| `SUPABASE_URL` | **Project Settings → API → Project URL** |
| `SUPABASE_SERVICE_KEY` | **Project Settings → API → `service_role` key** (click Reveal) |

> The `service_role` key can read and change everything. It goes only into Vercel's settings and your
> own `.env`. Never into GitHub, a chat, or a document.

> **Use the Transaction pooler string (port 6543), not the "Direct connection".** The direct one
> fails on Vercel.

### Create the tables and move your data

Put the three values into `brandroom-cloud/.env` on your computer (add the lines, or replace them if
they are there already):

```
DATABASE_URL=...
SUPABASE_URL=...
SUPABASE_SERVICE_KEY=...
SUPABASE_BUCKET=brand-refs
```

Stop Brandroom if it is running (Ctrl+C). Then:

```bash
cd "C:\Users\ADMIN\Desktop\CH KnowledgeBase\brandroom-cloud"
npm run setup
node scripts/migrate.js --yes
```

**It worked when** setup prints the table list and `migrate` prints your clients, examples and
reference images. In Supabase, **Table Editor → clients** shows White Stone.

> While `DATABASE_URL` is in `.env`, your local `npm run dev` talks to Supabase, not the local copy.
> To go back to the local copy, put a `#` in front of the `DATABASE_URL` line.

---

## 3. Vercel: the site

1. At **vercel.com** → **Add New → Project** → **Import** your `brandroom` repository
   (connect your GitHub account when it asks).
2. Leave **Framework Preset** as **Other**. Leave every build setting empty.
3. Open **Environment Variables** and add these. Copy the values from your `.env`.

| Name | Value |
|---|---|
| `DATABASE_URL` | the Transaction pooler string |
| `SUPABASE_URL` | your Project URL |
| `SUPABASE_SERVICE_KEY` | your service_role key |
| `SUPABASE_BUCKET` | `brand-refs` |
| `APP_SECRET` | **required.** Long random text, at least 24 characters. The site refuses to run without it. Make one with `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` |
| `APP_URL` | `https://brandroom.creativheads.com` |
| `KB_API_KEYS` | the same line as in your `.env`, for example `seo-agent:the-key` |
| `MS_TENANT_ID`, `MS_CLIENT_ID`, `MS_CLIENT_SECRET` | add after step 6 |
| `MS_ALLOWED_DOMAIN` | `creativheads.com` |
| `MS_DEFAULT_ROLE` | `staff` |

4. Click **Deploy**. It takes about a minute.

**It worked when** Vercel shows a `something.vercel.app` address and opening it shows the Brandroom
sign-in page. Sign in with your usual admin email and password. Your clients should be there.

If the page loads but sign-in or data fails, open **Vercel → your project → Logs**. The most common
cause is a typo in `DATABASE_URL`.

---

## 4. Hostinger: make `brandroom.creativheads.com`

A subdomain is just one extra DNS record. **Nothing about your main site or email changes.**

### 4a. Tell Vercel about the name first
1. Vercel → your project → **Settings → Domains → Add**.
2. Type `brandroom.creativheads.com` and click **Add**.
3. Vercel shows a record to create. It will look like:

| Type | Name | Value |
|---|---|---|
| CNAME | `brandroom` | a value Vercel shows, such as `cname.vercel-dns.com` |

**Copy the value Vercel shows you.** Newer projects get a project-specific value, so do not type the
one above from memory.

### 4b. Create the record in Hostinger
1. Log in to **hpanel.hostinger.com** → **Domains** → click **creativheads.com** → **DNS / Nameservers**
   → **DNS records**.
2. **Check first:** look through the existing records for anything with the name `brandroom`
   (an `A`, `AAAA` or `CNAME`). **Delete it**, because a name cannot have a CNAME and another
   record at the same time.
3. Add a record:

| Field | Value |
|---|---|
| Type | **CNAME** |
| Name | `brandroom` (only `brandroom`, not `brandroom.creativheads.com`) |
| Points to / Target | the value Vercel showed you |
| TTL | `300` (or leave the default) |

4. Save.

> This only works if creativheads.com uses **Hostinger's nameservers**. On the same DNS screen, check
> that the nameservers are `ns1.dns-parking.com` and `ns2.dns-parking.com`. If the domain's nameservers
> point somewhere else (Cloudflare, for example), add the record there instead.

### 4c. Wait, then check
1. DNS usually takes 5–30 minutes, and rarely a few hours.
2. Back in Vercel → **Settings → Domains**. It shows **Valid Configuration** when ready, then issues the
   HTTPS certificate by itself, which takes about a minute.
3. Open **https://brandroom.creativheads.com**.

**It worked when** the Brandroom sign-in loads there with a padlock.

If Vercel keeps saying "Invalid Configuration" after an hour, check the record name is exactly `brandroom`
and that no older `brandroom` record is still there.

---

## 5. Connect the SEO app to the live address

In SEO Studio → **Settings → Integrations → Knowledgebase**:

- Change the URL to `https://brandroom.creativheads.com/api/kb/v1`
- Keep the same key (it must match `KB_API_KEYS` in Vercel)
- Click **Test connection**

**It worked when** it says Connected and lists your brands.

---

## 6. Microsoft sign-in (optional, do it last)

Needs the real address from step 4, so it comes after.

1. **portal.azure.com → Microsoft Entra ID → App registrations → New registration**
   - Name: `Brandroom`
   - Supported account types: **Accounts in this organizational directory only**
   - Redirect URI → **Web** → `https://brandroom.creativheads.com/api/auth/microsoft/callback`
2. On the overview page copy the **Application (client) ID** and **Directory (tenant) ID**.
3. **Certificates & secrets → New client secret.** Copy the **Value** straight away. It is shown once.
4. Add `MS_TENANT_ID`, `MS_CLIENT_ID` and `MS_CLIENT_SECRET` to Vercel → Settings → Environment
   Variables, then **Deployments → ⋯ → Redeploy**.

**It worked when** the sign-in page shows a **Sign in with Microsoft** button, and it signs you in.
The first person to sign in with Microsoft who is not already in the people list becomes an
**admin** only if the list is empty. Otherwise they join as **staff**.

Your email and password sign-in keeps working as a backup.

---

## Updating the site later

Change the code, then:

```bash
git add .
git commit -m "What you changed"
git push
```

Vercel redeploys on its own within a minute. Database changes in `schema.sql` need
`npm run setup` run once against Supabase (with `DATABASE_URL` set).

---

## If something goes wrong

| What you see | Cause | Fix |
|---|---|---|
| Sign-in page loads, then "Something went wrong" | Wrong `DATABASE_URL` | Check it is the **Transaction pooler** string with the password filled in |
| Images do not show | Bucket name or service key | Bucket must be exactly `brand-refs`; check `SUPABASE_SERVICE_KEY` |
| "Redirect URI does not match" on Microsoft sign-in | `APP_URL` or the Azure URI differs | Both must be `https://brandroom.creativheads.com` exactly, with no trailing slash |
| Domain stuck on "Invalid Configuration" | Old `brandroom` record, or wrong value | Delete other `brandroom` records; paste the exact value Vercel shows |
| SEO Studio says it cannot connect | `KB_API_KEYS` missing in Vercel | Add it and redeploy |
| Uploading a document fails | File over 3 MB | Vercel's upload limit. Use a smaller file |
