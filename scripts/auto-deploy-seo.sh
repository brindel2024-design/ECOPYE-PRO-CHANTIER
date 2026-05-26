#!/usr/bin/env bash
set -euo pipefail

APP_DIR="/opt/ECOPYE-PRO-CHANTIER"
LOG_PREFIX="[ecopye-auto-deploy]"

cd "$APP_DIR"

if [[ -n "$(git status --porcelain)" ]]; then
  echo "$LOG_PREFIX deploiement ignore : modifications locales detectees."
  git status --short --branch
  exit 1
fi

git fetch origin master

LOCAL_REV="$(git rev-parse HEAD)"
REMOTE_REV="$(git rev-parse origin/master)"

if [[ "$LOCAL_REV" == "$REMOTE_REV" ]]; then
  echo "$LOG_PREFIX aucune mise a jour."
  exit 0
fi

git merge --ff-only origin/master
npm ci
npm run build
pm2 reload ecopye-pro

echo "$LOG_PREFIX mise en ligne terminee : $REMOTE_REV"
