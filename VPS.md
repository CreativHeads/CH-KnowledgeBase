# Running Brandroom on your Hostinger VPS (`kb.creativheads.com`)

This puts the same app that runs on Vercel onto your own VPS. The database and files stay in Supabase, so
your data does not move and nothing is lost. Your other site on the VPS is not touched: this adds one more
name, and Caddy sends each name to the right app.

```
https://kb.creativheads.com  →  Caddy (on the VPS)  →  Brandroom (Node, 127.0.0.1:3100)  →  Supabase
```

`brandroom.creativheads.com` can stay on Vercel at the same time. Both talk to the same database.

Time needed: about 30 minutes. You only copy and paste.

---

## The fast way: one installer

On the VPS terminal (step 0 below), run these two lines. The installer does steps 2 to 8 for you: it installs Node,
gets the code, asks for your keys (typed hidden), starts the app, adds `kb.creativheads.com` to Caddy, and tells
you the one DNS record to create. It is safe to run again, and it backs up your Caddyfile first and puts it back
if the check fails.

```bash
curl -fsSL https://raw.githubusercontent.com/CreativHeads/CH-KnowledgeBase/main/deploy/vps/install.sh -o /tmp/brandroom-install.sh
sudo bash /tmp/brandroom-install.sh
```

The rest of this page is the same thing done by hand, and the troubleshooting.

---

## 0. Open a terminal on the VPS

hPanel → **VPS** → your server → **Browser terminal** (or connect with SSH). Log in as a user that can use `sudo`.

All commands below are run there. Lines starting with `#` are only comments.

## 1. Check what is already on the VPS

```bash
cat /etc/os-release | head -2           # should say Ubuntu or Debian
sudo ss -ltnp | grep -E ':(80|443|3100)'
systemctl is-active caddy nginx apache2 2>/dev/null
docker ps --format '{{.Names}}  {{.Ports}}' 2>/dev/null | head
```

From outside, your VPS (**187.126.125.145**, where pulse, cue and takeboard already point) answers on ports 80 and 443
with **Caddy**. So this guide uses **Caddy** (steps 6 and 8). Caddy is simpler than Nginx: it gets the HTTPS
certificate by itself. **Do not install Nginx or certbot** here, because they would fight Caddy for ports 80 and 443.

- If the output of those commands shows Caddy running as a normal service (`caddy  active`): continue.
- If Caddy runs **inside Docker** (`docker ps` lists a caddy, traefik or similar container): send me the output
  of those commands. The proxy step is different and I do not want to break your other apps.
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

The code comes from GitHub (the repository is public, so no key is needed):

```bash
sudo -u brandroom git clone https://github.com/CreativHeads/CH-KnowledgeBase.git /var/www/brandroom
cd /var/www/brandroom && sudo -u brandroom npm ci --omit=dev
```

If you ever make the repository private, give the VPS **read-only** access with a deploy key instead:

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

## 6. Caddy: send `kb.creativheads.com` to the app

Open Caddy's config file (usually `/etc/caddy/Caddyfile`) and **add this block at the end**. Leave everything
that is already there as it is:

```
kb.creativheads.com {
	encode gzip zstd
	request_body {
		max_size 8MB
	}
	reverse_proxy 127.0.0.1:3100 {
		header_up X-Forwarded-For {remote_host}
		header_up X-Real-IP {remote_host}
		transport http {
			read_timeout 120s
		}
	}
}
```

The same text is in `deploy/vps/Caddyfile.snippet`. Then check and reload:

```bash
sudo nano /etc/caddy/Caddyfile
sudo caddy validate --config /etc/caddy/Caddyfile      # must say: Valid configuration
sudo systemctl reload caddy
```

Your other sites keep working. (If you use **Nginx** on some other server, `deploy/vps/nginx-kb.conf` is the
equivalent, with `certbot` for HTTPS.)

## 7. DNS: point the name at the VPS

This is the step that makes `kb.creativheads.com` exist at all. Right now it has **no DNS record**, so browsers say
"This site can't be reached".

1. hPanel → **Domains → creativheads.com → DNS records**.
2. If there is an old `kb` record, **delete it** (a name cannot have a CNAME and an A record together).
3. Add:

| Type | Name | Points to | TTL |
|---|---|---|---|
| **A** | `kb` | **187.126.125.145** (this VPS; confirm it in hPanel → VPS → Overview) | 300 |

4. Wait 5–30 minutes. Check: `dig +short kb.creativheads.com` (on the VPS) prints `187.126.125.145`.

## 8. HTTPS

With Caddy there is nothing to run. Once the DNS record above works, Caddy asks Let's Encrypt for the certificate
on the first visit and renews it by itself. Watch it happen with:

```bash
sudo journalctl -u caddy -n 30 --no-pager | grep -i -E "certificate|obtain|error"
```

Open **https://kb.creativheads.com**. The sign-in page should load with a padlock. Make sure ports **80** and **443**
are open in hPanel → VPS → **Firewall**; Caddy needs port 80 once to prove the name is yours.

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
  `sudo journalctl -u caddy -n 50 --no-pager` (Caddy).

---

## If you already installed Nginx or ran certbot

Caddy owns ports 80 and 443, so Nginx cannot start next to it, and a failed Nginx can leave Caddy's ports in a
confusing state. Undo it, then use steps 6–8 above:

```bash
sudo systemctl disable --now nginx 2>/dev/null
sudo rm -f /etc/nginx/conf.d/kb.creativheads.com.conf
sudo systemctl restart caddy
sudo ss -ltnp | grep -E ':(80|443)\b'        # only caddy should be listed
```

## One command that shows me everything

If something still does not work, run this and send me the whole output (it has no secrets):

```bash
echo "== app";  systemctl is-active brandroom; curl -s http://127.0.0.1:3100/healthz; echo
echo "== ports"; sudo ss -ltnp | grep -E ':(80|443|3100)\b'
echo "== web servers"; systemctl is-active caddy nginx apache2 2>/dev/null
echo "== caddy block"; sudo grep -n -A12 "kb.creativheads.com" /etc/caddy/Caddyfile
echo "== caddy log"; sudo journalctl -u caddy -n 20 --no-pager
echo "== app log"; sudo journalctl -u brandroom -n 20 --no-pager
echo "== dns"; dig +short kb.creativheads.com
```
