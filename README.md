### Story — Why this exists
Thunderdome freestyle contests were judged on **paper** while I was simultaneously **streaming the event**. With ~100 skaters, that led to delays, transcription errors, and zero visibility for the audience. I built this app so judges can score from **any phone**, the **leaderboard updates live**, and results are exported instantly. The project is intentionally **production‑style** (not a toy): real‑time updates, locks & audit trail, CSV import/export, and a practical day‑of runbook. It’s designed to be **cheap to host** and easy to spin up for each contest.


### Why this stack (hire‑signal + pragmatism)
- **React (Next.js, TS):** industry‑standard front end; fast developer velocity; rich ecosystem.
- **Node (Fastify) + Socket.IO:** lightweight, fast JSON API with reliable WebSockets and room fan‑out per event/division.
- **Prisma ORM:** type‑safe models, straightforward migrations, and **portability** between Postgres and SQLite.
- **Postgres (prod/staging):** robust transactions, indexing, roles; easy managed hosting.
- **SQLite (Emergency Venue Mode):** single‑file DB enables running the whole system on a laptop if the venue has no internet.
- **Hosting:** Web on Vercel (free tier is great), API on Fly/Railway/home server, DB on managed Postgres. Costs stay near zero for dev and low for events.


### Ops modes
- **Cloud‑first (default):** Vercel → Web, Fly/Railway → API, Supabase/Neon → Postgres.
- **Emergency Venue Mode:** one compose profile starts API + DB locally; judges connect to the laptop’s IP via venue Wi‑Fi or a phone hotspot.

# thunderdome-judging

Monorepo scaffold for the Thunderdome judging platform. It includes the Next.js web app, Fastify API, Prisma schema workspace, and supporting infra + documentation.

## Getting started

1. Install [pnpm](https://pnpm.io).
2. Install dependencies:
   ```bash
   pnpm install
   ```
3. Copy `.env.example` to `.env` and fill in secrets. For local overrides, also copy `api/.env.example` → `api/.env` and `web/.env.local.example` → `web/.env.local`.
4. Start the dev servers (web at :3000, API defaults to :8888):
   ```bash
   pnpm dev
   ```

   The API reads `PORT` from `api/.env`. Change it (for example, `PORT=9999`) and restart to move the server without touching code. When testing from another device on your LAN, point `NEXT_PUBLIC_API_URL`/`NEXT_PUBLIC_WS_URL` in `web/.env.local` at your host IP (for example, `http://192.168.0.160:8888`).

### Useful scripts

- `pnpm lint` – run linting for web and API workspaces.
- `pnpm typecheck` – run TypeScript in strict mode for both apps.
- `pnpm build` – build the Next.js and Fastify projects.
- `pnpm test` – execute Vitest suites across workspaces.

## Assets

- Place optional branding assets (logos, icons) under `web/public/branding/`.
- Sample start list CSV lives at `docs/sample_startlist.csv`; replace with actual rosters before import.

## Documentation

- Requirements, UI notes, and API references live in `/docs`.
- Deployment and local infra scaffolding live in `/infra`.
