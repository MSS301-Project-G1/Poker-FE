#!/usr/bin/env bash
# Runs on the VPS; GitHub Actions calls it after pushing the image to GHCR:
#   printf '%s' "$TOKEN" | GHCR_USER=<user> bash deploy/remote-deploy.sh <image-tag>
# The registry token arrives on stdin so it never appears in the process list.
set -euo pipefail

TAG="${1:?usage: remote-deploy.sh <image-tag>}"
APP_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$APP_DIR"

# Poker-BE's deploy script reloads nginx in the containers of this project.
PROJECT="poker-fe"
BE_NETWORK="poker_default"
LOCAL_URL="http://127.0.0.1:3000/"
COMPOSE=(docker compose -p "$PROJECT" -f compose.yml -f deploy/compose.prod.yml)

if ! docker network inspect "$BE_NETWORK" >/dev/null 2>&1; then
  echo "::error::Docker network $BE_NETWORK not found. Deploy Poker-BE first."
  exit 1
fi

docker login ghcr.io -u "${GHCR_USER:?GHCR_USER is not set}" --password-stdin >/dev/null
trap 'docker logout ghcr.io >/dev/null 2>&1 || true' EXIT

echo "==> Pulling image ($TAG)"
IMAGE_TAG="$TAG" "${COMPOSE[@]}" pull --quiet web

# Generated file: lets manual `docker compose` commands on the VPS use the same project and image.
printf 'COMPOSE_PROJECT_NAME=%s\nIMAGE_TAG=%s\n' "$PROJECT" "$TAG" > .env

echo "==> Starting nginx"
"${COMPOSE[@]}" up -d --no-build web

for _ in $(seq 1 20); do
  if curl -fsS --max-time 3 -o /dev/null "$LOCAL_URL"; then
    docker image prune -af --filter "until=168h" >/dev/null
    echo "==> Frontend $TAG is up ✅"
    exit 0
  fi
  sleep 1
done

echo "::error::The frontend does not respond on $LOCAL_URL"
"${COMPOSE[@]}" logs --tail 40 web || true
exit 1
