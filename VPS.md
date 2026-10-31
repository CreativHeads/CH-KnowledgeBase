# Running Brandroom on your Hostinger VPS (`kb.creativheads.com`)

This puts the same app that runs on Vercel onto your own VPS. The database and files stay in Supabase, so
your data does not move and nothing is lost. Your other site on the VPS is not touched: this adds one more
name, and Nginx sends each name to the right app.

```
https://kb.creativheads.com  →  Nginx (on the VPS)  →  Brandroom (Node, 127.0.0.1:3100)  →  Supabase
```

`brandroom.creativheads.com` can stay on Vercel at the same time. Both talk to the same database.

Time needed: about 30 minutes. You only copy and paste.

---

## 0. Open a terminal on the VPS

hPanel → **VPS** → your server → **Browser terminal** (or connect with SSH). Log in as a user that can use `sudo`.

All commands below are run there. Lines starting with `#` are only comments.

## 1. Check what is already on the VPS

```bash
cat /etc/os-release | head -2           # should say Ubuntu or Debian
sudo ss -ltnp | grep -E ':(80|443|3100)\b'
```

- If port **80/443** show `nginx`, continue: this guide is written for Nginx.
- If they show `apache2`, `httpd`, `litespeed` or `docker-proxy`, **stop and send me that line.** The steps
  for the proxy part are different, and I do not want to break your existing site.
- If port **3100** is already used by something, tell me, and we pick another port.

## 2. Install Node 22 and Git

```bash
sudo apt-get update
sudo apt-get install -y git curl
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt-get install -y nodejs
node -v          # must say v22.x
```

## 3. Create the app's own user and get the code

```bash
sudo useradd --system --create-home --shell /usr/sbin/nologin brandroom
sudo mkdir -p /var/www/brandroom && sudo chown brandroom:brandroom /var/www/brandroom
```

The code comes from GitHub. If the repository is private, give the VPS **read-only** access with a deploy key:

```bash
sudo -u brandroom mkdir -p -m 700 /home/brandroom/.ssh
sudo -u brandroom ssh-keygen -t ed25519 -N "" -f /home/brandroom/.ssh/id_ed25519
sudo cat /home/brandroom/.ssh/id_ed25519.pub
```

Copy the line it prints. On GitHub: repository **CreativHeads/CH-KnowledgeBase → Settings → Deploy keys → Add
deploy key**, paste it, leave **Allow write access unticked**, save. Then:

```bash
sudo -u brandroom ssh-keyscan github.com | sudo -u brandroom tee /home/brandroom/.ssh/known_hosts >/dev/null
sudo -u brandroom git clone git@github.com:CreativHeads/CH-KnowledgeBase.git /var/www/brandroom
cd /var/www/brandroom && sudo -u brandroom npm ci --omit=dev
```

## 4. Settings and secrets

```bash
sudo cp /var/www/brandroom/deploy/vps/brandroom.env.example /etc/brandroom.env
sudo chown root:brandroom /etc/brandroom.env && sudo chmod 640 /etc/brandroom.env
sudo nano /etc/brandroom.env
```

Fill in the same values you use in Vercel (**Vercel → Project → Settings → Environment Variables**).
Do **not** paste secrets into chat. The important ones:

| Setting | Value |
|---|---|
| `APP_URL` | `https://kb.creativheads.com` (no slash at the end) |
| `APP_SECRET` | the same as Vercel (at least 24 characters) |
| `DATABASE_URL` | the same Supabase connection string as Vercel |
| `SUPABASE_URL`, `SUPABASE_SERVICE_KEY`, `SUPABASE_BUCKET` | the same as Vercel |
| `OPENAI_API_KEY`, `OPENAI_MODEL` | the same as Vercel |
| `KB_API_KEYS` | the same as Vercel (the SEO app keeps its key) |

In nano: save with **Ctrl+O**, Enter; leave with **Ctrl+X**.

A quick test that it starts (stop it with **Ctrl+C** after it prints the line):

```bash
sudo -u brandroom bash -c 'set -a; . /etc/brandroom.env; set +a; export TRUST_PROXY=1 PORT=3100; cd /var/www/brandroom && node scripts/server.js'
```

It should print `Brandroom is running on http://127.0.0.1:3100` and `Database: Postgres (Supabase)`.
If it says **built-in local database**, `DATABASE_URL` is empty: fix `/etc/brandroom.env`.

## 5. Keep it running (starts on boot, restarts if it stops)

```bash
sudo cp /var/www/brandroom/deploy/vps/brandroom.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable --now brandroom
sleep 2 && curl -s http://127.0.0.1:3100/healthz        # prints: ok
```

If it does not print `ok`: `sudo journalctl -u brandroom -n 50 --no-pager` shows why.

## 6. Nginx: send `kb.creativheads.com` to the app

```bash
sudo cp /var/www/brandroom/deploy/vps/nginx-kb.conf /etc/nginx/conf.d/kb.creativheads.com.conf
sudo nginx -t && sudo systemctl reload nginx
```

`nginx -t` must say `syntax is ok` and `test is successful` before you reload. Your other site keeps working.

## 7. DNS: point the name at the VPS

1. hPanel → **VPS → Overview**: copy the VPS's **IPv4 address**.
2. hPanel → **Domains → creativheads.com → DNS records**.
3. If there is an old `kb` record (Vercel's `CNAME`), **delete it**: a name cannot have both a CNAME and an A record.
4. Add:

| Type | Name | Points to | TTL |
|---|---|---|---|
| **A** | `kb` | the VPS IPv4 address | 300 |

5. Wait 5–30 minutes. Check from the VPS: `dig +short kb.creativheads.com` should print the VPS's address.

## 8. HTTPS certificate (free, renews by itself)

Only after the DNS check above shows the right address:

```bash
sudo apt-get install -y certbot python3-certbot-nginx
sudo certbot --nginx -d kb.creativheads.com --redirect -m YOUR-EMAIL --agree-tos --no-eff-email
```

Put **your own email** in place of `YOUR-EMAIL` (Let's Encrypt uses it only for expiry warnings). Open
**https://kb.creativheads.com**. The sign-in page should load with a padlock.

Make sure the VPS firewall allows web traffic: in hPanel → VPS → **Firewall**, allow TCP **80** and **443**
(and `sudo ufw status` should not be blocking them if `ufw` is on).

## 9. Updating later

After a change is pushed to GitHub, on the VPS run:

```bash
sudo /var/www/brandroom/deploy/vps/update.sh
```

It pulls the new code, installs what changed, restarts, and checks the app answered. Users keep their sign-in.

---

## Check that it worked

```bash
curl -sI https://kb.creativheads.com | head -12
```

You should see `HTTP/2 200` and the security headers `strict-transport-security`, `content-security-policy`,
`x-frame-options` and `x-content-type-options`. Then sign in in the browser and open a client.

## Things to know

- **Sign-in is per address.** Everyone signs in once on the new address.
- **Both addresses at once.** If `brandroom.creativheads.com` stays on Vercel, both work, with the same data. Whatever
  is in the SEO app's address setting decides which one it uses; point it at the VPS one if you retire Vercel.
- **Backups.** Your data is in Supabase (use its backups). The only thing on the VPS worth keeping is `/etc/brandroom.env`.
- **Limits are higher here.** There is no 60-second limit and no 4.5 MB request limit, but the app still sends large
  files in pieces, which works the same everywhere.
- **Keep the VPS itself safe:** use SSH keys instead of passwords, `sudo apt-get install -y unattended-upgrades`,
  and keep only ports 22, 80 and 443 open.
- **If something breaks:** `sudo journalctl -u brandroom -n 100 --no-pager` (the app) and
  `sudo tail -n 50 /var/log/nginx/error.log` (Nginx).
