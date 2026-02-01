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

## Auth
- POST `/auth/login` with `{ email, password }` to get a JWT.
- Use `Authorization: Bearer <token>` for protected routes.
- Admin-only:
  - POST `/users` to create users (admin, receptionist, doctor)
  - GET `/users` to list users
- Any authenticated user:
  - GET `/users/me`

## Seed admin user
- Set `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `ADMIN_NAME` in `.env`.
- Run: `npm run prisma:seed`

## Structure
- `src/config/env.ts` loads `.env` once and exposes `env`.
- `src/helpers/` shared helpers (jwt, password, prisma).
- `src/middlewares/` shared middlewares.
- `src/modules/*` contains `routes`, `controller`, `service`, `db`.
