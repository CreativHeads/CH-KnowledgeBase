#!/usr/bin/env bash
# Installs Brandroom on a VPS that already serves other sites with Caddy. Safe to run again.
#
# It adds one new app and one new site block. It does not touch your other apps: your Caddyfile is backed up
# first, checked before it is applied, and put back if the check fails.
#
#   curl -fsSL https://raw.githubusercontent.com/CreativHeads/CH-KnowledgeBase/main/deploy/vps/install.sh -o /tmp/brandroom-install.sh
#   sudo bash /tmp/brandroom-install.sh
#
# It asks for your keys (typed hidden, never shown, never sent anywhere except into /etc/brandroom.env).
set -euo pipefail

DOMAIN="${DOMAIN:-kb.creativheads.com}"
REPO="${REPO:-https://github.com/CreativHeads/CH-KnowledgeBase.git}"
APP="${APP:-/var/www/brandroom}"
PORT="${PORT:-3100}"
ENVF="${ENVF:-/etc/brandroom.env}"
CADDYFILE="${CADDYFILE:-/etc/caddy/Caddyfile}"

say() { printf '\n\033[1m== %s\033[0m\n' "$*"; }
ok()  { printf '   \033[32m✓\033[0m %s\n' "$*"; }
die() { printf '\n\033[31mSTOP: %s\033[0m\n' "$*" >&2; exit 1; }

[ "$(id -u)" = 0 ] || die "Run it with sudo:  sudo bash /tmp/brandroom-install.sh"
command -v apt-get >/dev/null || die "This installer is for Ubuntu or Debian."

# ---------------------------------------------------------------- 1
say "1/8  Checking the server"
command -v caddy >/dev/null || die "Caddy was not found. Send me the output of:  sudo ss -ltnp | grep -E ':(80|443)\\b'  and  docker ps"
[ -f "$CADDYFILE" ] || die "No Caddyfile at $CADDYFILE (Caddy may be running in Docker). Send me the output of:  docker ps"
if ss -ltn | grep -q ":$PORT " && ! systemctl is-active --quiet brandroom; then
  die "Port $PORT is used by something else. Run again with another port:  sudo PORT=3200 bash /tmp/brandroom-install.sh"
fi
ok "Caddy found, port $PORT is free"

# ---------------------------------------------------------------- 2
say "2/8  Node 22 and Git"
apt-get update -qq
apt-get install -y -qq git curl ca-certificates openssl >/dev/null
if ! command -v node >/dev/null || [ "$(node -p 'process.versions.node.split(".")[0]')" -lt 22 ]; then
  curl -fsSL https://deb.nodesource.com/setup_22.x | bash - >/dev/null
  apt-get install -y -qq nodejs >/dev/null
fi
ok "node $(node -v)"

# ---------------------------------------------------------------- 3
say "3/8  The app's own user and the code"
id brandroom >/dev/null 2>&1 || useradd --system --create-home --shell /usr/sbin/nologin brandroom
mkdir -p "$APP" && chown brandroom:brandroom "$APP"
if [ -d "$APP/.git" ]; then
  runuser -u brandroom -- git -C "$APP" pull --ff-only -q
else
  runuser -u brandroom -- git clone -q "$REPO" "$APP"
fi
runuser -u brandroom -- bash -c "cd '$APP' && npm ci --omit=dev --no-audit --no-fund --silent"
ok "code at $APP ($(runuser -u brandroom -- git -C "$APP" log --oneline -1))"

# ---------------------------------------------------------------- 4
say "4/8  Settings and keys"
touch "$ENVF"
setvar() {            # setvar NAME VALUE  (replaces the line, or adds it)
  local tmp; tmp="$(mktemp)"
  grep -v "^$1=" "$ENVF" > "$tmp" || true
  printf '%s=%s\n' "$1" "$2" >> "$tmp"
  cat "$tmp" > "$ENVF"; rm -f "$tmp"
}
have() { grep -q "^$1=." "$ENVF"; }
ask() {               # ask NAME "what it is" [secret|plain] [required|optional]
  local name="$1" label="$2" mode="${3:-secret}" need="${4:-required}" val="${!1:-}"
  if have "$name"; then ok "$name is already set"; return; fi
  if [ -z "$val" ]; then
    [ -t 0 ] || [ -r /dev/tty ] || die "$name is missing and there is no terminal to ask in."
    while :; do
      if [ "$mode" = secret ]; then read -r -s -p "   $label: " val </dev/tty; echo; else read -r -p "   $label: " val </dev/tty; fi
      [ -n "$val" ] || [ "$need" = optional ] && break
      echo "   This one is required."
    done
  fi
  [ -n "$val" ] && setvar "$name" "$val" && ok "$name saved"
  return 0
}
echo "   Paste the same values you use in Vercel (Project → Settings → Environment Variables)."
echo "   Typing is hidden for secrets. Press Enter to skip an optional one."
setvar APP_URL "https://$DOMAIN"
have SUPABASE_BUCKET || setvar SUPABASE_BUCKET "brand-refs"
ask DATABASE_URL          "DATABASE_URL (Supabase connection string)"  secret required
ask SUPABASE_URL          "SUPABASE_URL"                               plain  required
ask SUPABASE_SERVICE_KEY  "SUPABASE_SERVICE_KEY"                       secret required
ask OPENAI_API_KEY        "OPENAI_API_KEY"                             secret optional
ask OPENAI_MODEL          "OPENAI_MODEL (for example gpt-4o)"          plain  optional
ask KB_API_KEYS           "KB_API_KEYS (name:key, for the SEO app)"    secret optional
have APP_SECRET || { setvar APP_SECRET "$(openssl rand -hex 32)"; ok "APP_SECRET made for this server"; }
chown root:brandroom "$ENVF"; chmod 640 "$ENVF"

# ---------------------------------------------------------------- 5
say "5/8  Starting the app (kept running, restarted after a crash or a reboot)"
sed "s/^Environment=PORT=.*/Environment=PORT=$PORT/; s#/var/www/brandroom#$APP#g" "$APP/deploy/vps/brandroom.service" > /etc/systemd/system/brandroom.service
systemctl daemon-reload
systemctl enable brandroom >/dev/null 2>&1
systemctl restart brandroom
for i in $(seq 1 25); do curl -fsS "http://127.0.0.1:$PORT/healthz" >/dev/null 2>&1 && break; sleep 1; done
curl -fsS "http://127.0.0.1:$PORT/healthz" >/dev/null 2>&1 || { journalctl -u brandroom -n 30 --no-pager; die "The app did not start. The log is above; send it to me."; }
ok "the app is up on 127.0.0.1:$PORT"

# ---------------------------------------------------------------- 6
say "6/8  Checking it can reach the database"
PUB="$(curl -fsS "http://127.0.0.1:$PORT/api/br/public" || true)"
echo "$PUB" | grep -q '"appName":"Brandroom"' || { journalctl -u brandroom -n 30 --no-pager; die "The app runs but cannot use the database. Check DATABASE_URL in $ENVF, then:  sudo systemctl restart brandroom"; }
ok "database answers"

# ---------------------------------------------------------------- 7
say "7/8  Adding $DOMAIN to Caddy"
if grep -qE "^[[:space:]]*$DOMAIN[[:space:],{]|^[[:space:]]*$DOMAIN\$" "$CADDYFILE"; then
  ok "$DOMAIN is already in $CADDYFILE (left as it is)"
else
  BACKUP="$CADDYFILE.bak-$(date +%Y%m%d-%H%M%S)"
  cp -p "$CADDYFILE" "$BACKUP"
  {
    printf '\n# Brandroom (added by install.sh)\n'
    sed "s/3100/$PORT/; s/kb.creativheads.com/$DOMAIN/" "$APP/deploy/vps/Caddyfile.snippet" | grep -v '^# '
  } >> "$CADDYFILE"
  if caddy validate --config "$CADDYFILE" --adapter caddyfile >/dev/null 2>&1; then
    systemctl reload caddy
    ok "Caddy reloaded (backup of the old file: $BACKUP)"
  else
    cp -p "$BACKUP" "$CADDYFILE"
    caddy validate --config "$CADDYFILE" --adapter caddyfile 2>&1 | tail -5 || true
    die "Caddy did not accept the new block, so your Caddyfile was put back exactly as it was."
  fi
fi

# ---------------------------------------------------------------- 8
say "8/8  Last check: the name"
IP="$(curl -4 -fsS -m 8 https://api.ipify.org 2>/dev/null || hostname -I | awk '{print $1}')"
SEEN="$(getent ahostsv4 "$DOMAIN" 2>/dev/null | awk '{print $1; exit}' || true)"
if [ "$SEEN" = "$IP" ]; then
  ok "$DOMAIN already points at this server ($IP). Caddy now gets the certificate by itself."
else
  printf '   \033[33m!\033[0m %s does not point here yet (it shows: %s).\n' "$DOMAIN" "${SEEN:-nothing}"
  printf '     In Hostinger → Domains → creativheads.com → DNS records, add:\n'
  printf '       Type A   Name kb   Points to %s   TTL 300\n' "$IP"
  printf '     Delete any old "kb" record first. Caddy gets the HTTPS certificate by itself a few minutes later.\n'
fi
printf '\nDone. Then open https://%s\n' "$DOMAIN"
printf 'Watch the certificate:  sudo journalctl -u caddy -n 30 --no-pager | grep -i -E "certificate|obtain|error"\n'
printf 'Update later:           sudo %s/deploy/vps/update.sh\n' "$APP"
