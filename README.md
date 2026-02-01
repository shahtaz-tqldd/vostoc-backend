# Vostoc Backend Boilerplate

## Stack
- Node.js + TypeScript + Express
- Prisma + PostgreSQL
- Socket.IO for realtime notifications

## Local dev (without Docker)
1) Copy env: `cp .env.example .env`
2) Install deps: `npm install`
3) Run Postgres locally and set `DATABASE_URL`
4) Generate Prisma client: `npx prisma generate`
5) Run: `npm run dev`

## Docker
- Start: `docker compose up --build`
- Apply migrations (first time):
  - `docker compose exec app npx prisma migrate dev --name init`

## Realtime
- Socket server starts with the HTTP server.
- Join a channel: emit `join` with `appointments` or `dashboard`.
- Events:
  - `appointments:created`
  - `dashboard:updated`
