#!/usr/bin/env bash
# Brings the VPS up to date with GitHub:  sudo /var/www/brandroom/deploy/vps/update.sh
set -euo pipefail
APP=/var/www/brandroom
cd "$APP"
sudo -u brandroom git pull --ff-only
sudo -u brandroom npm ci --omit=dev
systemctl restart brandroom
sleep 2
if curl -fsS http://127.0.0.1:3100/healthz >/dev/null; then
  echo "Updated and running: $(sudo -u brandroom git log --oneline -1)"
else
  echo "The app did not start. See:  journalctl -u brandroom -n 50 --no-pager" >&2
  exit 1
fi
