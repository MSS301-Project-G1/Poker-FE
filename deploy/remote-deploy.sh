#!/usr/bin/env bash
# Runs on the VPS; GitHub Actions calls it after copying the build to /srv/poker-fe/releases/<tag>:
#   bash deploy/remote-deploy.sh <tag>
# Points the site at that release, installs deploy/Caddyfile when it changed, and keeps the
# last few releases so a rollback is just pointing `current` back at one of them.
set -euo pipefail

TAG="${1:?usage: remote-deploy.sh <tag>}"
APP_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SITE_DIR="/srv/poker-fe"
RELEASE="$SITE_DIR/releases/$TAG"
KEEP_RELEASES=5
CADDYFILE="/etc/caddy/Caddyfile"

if [ ! -f "$RELEASE/index.html" ]; then
  echo "::error::$RELEASE/index.html not found"
  exit 1
fi
touch "$RELEASE"

# Rename a new symlink over the old one, so no request ever sees a half-switched site.
ln -sfn "releases/$TAG" "$SITE_DIR/current.tmp"
mv -T "$SITE_DIR/current.tmp" "$SITE_DIR/current"
echo "==> Serving release $TAG"

if ! sudo cmp -s "$APP_DIR/deploy/Caddyfile" "$CADDYFILE"; then
  sudo caddy validate --config "$APP_DIR/deploy/Caddyfile" --adapter caddyfile
  sudo cp "$APP_DIR/deploy/Caddyfile" "$CADDYFILE"
  sudo systemctl reload caddy
  echo "==> Caddy config updated"
fi

# Newest releases first; the one being served is never removed.
ls -1t "$SITE_DIR/releases" | tail -n +"$((KEEP_RELEASES + 1))" | while read -r old; do
  if [ "$old" != "$TAG" ]; then rm -rf "${SITE_DIR:?}/releases/$old"; fi
done
echo "==> Frontend $TAG is live ✅"
