#!/usr/bin/env bash
set -euo pipefail

if command -v docker >/dev/null 2>&1 && command -v docker compose >/dev/null 2>&1; then
  docker compose up --build
  exit 0
fi

if command -v npm >/dev/null 2>&1; then
  if [ ! -f .env ] && [ -f .env.example ]; then
    cp .env.example .env
  fi
  npm install
  npx prisma generate
  npm run dev
  exit 0
fi

echo "Neither docker compose nor npm found. Install Docker or Node.js." >&2
exit 1
