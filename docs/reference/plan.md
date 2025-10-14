# Thunderdome / NAFSA Judging App — From Zero to Live Contest

> Goal: ship a dead‑simple, bulletproof, live‑scoring web app judges can run on any phone or laptop; public leaderboard updates instantly; low-cost hosting; easy per‑contest spin‑up; portfolio‑worthy polish.

---

## 1) What the email asks for (quick read)
- **NAFSA categories**: Technicality, Aesthetics, Composition.
- **One category per judge**; grand total = sum of the three category scores per skater.
- **Live placements** à la X‑Games/Street League.
- **EU example screenshots** provided for inspiration; we aim cleaner/faster.
- **Mike** (co‑recipient) will weigh in on functionality; we’ll create sane defaults/config so we aren’t blocked.

**Open gaps we’ll close by assumption + switches**
- Scoring scale (default **0–10** with **0.1** increments), allow integers-only toggle.
- **# of runs** per skater per heat (default 2; best-of vs total-of toggle, default **best run counts**).
- Tie‑break rules: highest single category, then next category, then earliest timestamp.
- Divisions (Pro/Am/Junior) & start lists: CSV import + quick manual edit.
- Public displays: **MC/Announcer view**, **Audience leaderboard**, **Judge-only panel**.
- Offline tolerance: judges can score offline for minutes; app queues + syncs when back.

---

## 2) MVP Scope (contest-ready)
**Required**
1. Admin creates event → divisions → heats → judges → skaters (CSV import).
2. Judges each get a **PIN** + a link for their category panel (tiny UI, giant inputs).
3. Scores submit with **client‑generated UUID**; backend is **idempotent**.
4. **Live leaderboard** (per division and overall) over WebSocket; public read-only URL + big-screen mode.
5. **Announcer view** with quick lookup, highlight next skater, lock/unlock scoring per run.
6. **Exports**: CSV of raw scores + placements; optional branded PDF summary.
7. **Safety rails**: lock once heat ends; admin override; full audit trail.

**Nice-to-have (Phase 2)**
- Mobile PWA install (A2HS), **Wake Lock** to keep screen on.
- Stripe pay‑per‑contest (or invoice), theming, sponsor logo ticker.
- Basic telemetry & crash reporting.

---

## 3) UX at a glance
- **Judge Panel (phone)**: pick skater → three giant buttons/inputs for rapid +/- and a submit; confirmation toast; queue badge if offline. No nav, no clutter.
- **Announcer**: next/now/up‑next cards, start/stop run, lock/unlock heat, trigger re‑runs.
- **Leaderboard (public)**: division tabs; rank, name, run scores, total; auto‑animate changes.
- **Admin Wizard**: stepper: Event → Divisions → Heats → Skaters (CSV) → Judges (assign categories) → Go Live.

---

## 4) Data model (SQLite, normalized)
- `event(id, name, date, venue, config_json, created_at)`
- `division(id, event_id, name, order)`
- `heat(id, division_id, name, order, status{scheduled|live|locked})`
- `skater(id, division_id, bib, first_name, last_name, sponsor, notes, order)`
- `judge(id, event_id, name, category{technicality|aesthetics|composition}, pin_hash)`
- `run(id, heat_id, skater_id, run_number, started_at, ended_at, status)`
- `score(id, run_id, judge_id, category, value, client_uuid, created_at, UNIQUE(run_id, judge_id, category))`
- `placement(id, division_id, skater_id, best_run_id, total, rank, tiebreak_json)`
- `audit(id, actor, action, entity, entity_id, data_json, ts)`

**Computed**: totals by best-of runs per config; placements recomputed on score change.

---

## 5) Architecture (lean + cheap)
- **Backend**: Go (Fiber/Gin) + SQLite (**WAL**) + WebSockets. Auth via short‑lived event token + judge PIN.
- **Frontend**: SvelteKit (SSR disabled for judge panel/leaderboard; static where possible).
- **Real-time**: Native WebSocket fan‑out; room per event/division.
- **Deploy**: Docker on Fly.io (1 shared CPU, 256–512MB) + persistent volume; **Litestream** to Backblaze B2 for continuous backup.
- **CDN**: Static assets from Fly + HTTP caching for public views.
- **PWA**: service worker for caching + offline score queue (IndexedDB).

**Why**: familiar stack, minimal cost, sub‑100ms local writes, easy per‑contest scale up.

---

## 6) Security & reliability
- Event code + judge PIN; read‑only public keys for displays.
- Idempotent writes with `client_uuid` + unique constraints.
- Heat locks prevent late edits; admin override logged to `audit`.
- Backups: Litestream continuous + on-demand snapshot pre‑contest.

---

## 7) Pricing / licensing options
- **Open core** (MIT) for portfolio visibility + **paid hosting/support**: $300–$600 per contest (includes 1 event + day‑of support), +$50 per extra division; includes backups and basic analytics.
- Or **volunteer core** + **pay‑per‑spin‑up**: $150 infra + $150 day‑of remote support.
- Keep rights to showcase; simple 1‑page SOW & NDA if needed.

---

## 8) Timeline (fast track)
- **Week 1**: scaffold, DB, admin wizard basics, judge panel v1.
- **Week 2**: real‑time leaderboard, announcer view, exports, deploy to Fly.
- **Week 3**: PWA/offline, polish, test event simulation, docs + runbook.

---

## 9) Next steps checklist (today)
1. Create repo `thunderdome-judging` (monorepo: `/api` Go, `/web` SvelteKit).
2. Drop EU screenshots/drive assets into `/docs/reference/` for later UI polish.
3. Spin a Fly.io app & Backblaze bucket; create `.env.example` (Fly secrets later).
4. Start PR1 below.

---

## 10) Codex PR Task Blocks (golden format)
*(Paste each block into Codex; one PR at a time.)*

### PR1 — repo scaffold & dev env
```
# Working contract
# 1) Make ONLY the changes described below.
# 2) Base branch: main
# 3) Create branch pr1/scaffold

## Changes
- Create monorepo structure:
  - /api (Go 1.22, go.mod, Makefile)
  - /web (SvelteKit + Vite, TypeScript)
  - /infra (docker-compose.dev.yml, Fly.io app templates)
  - /docs (reference/ readme-assets/)
- Add MIT LICENSE, README with quickstart, .editorconfig, .gitignore.
- Docker: multi-service dev (api, web, sqlite volume), hot-reload.

## Acceptance criteria
- `docker compose up` serves web on :5173, api on :8080 (dummy health checks OK).
- CI: lint + build jobs green.
```

### PR2 — DB schema & migrations
```
# Working contract
# 1) Only the changes below.
# 2) Base branch: pr1/scaffold → main
# 3) Create branch pr2/db-schema

## Changes
- Add SQLite schema (migrate.go with goose or sqlc), tables listed in Section 4.
- Implement /api/health, /api/version, /api/events CRUD (admin only).
- Wire WAL mode; add repo interface + sqlc queries for events/divisions/heats/skaters/judges.

## Acceptance
- `make migrate` creates DB; unit tests for event CRUD.
```

### PR3 — Admin wizard (event → live)
```
# Working contract
# Base: main
# Branch: pr3/admin-wizard

## Changes
- /web: admin route `/admin` with stepper (Event, Divisions, Heats, Skaters CSV import, Judges assign).
- /api: endpoints to support wizard; CSV import (firstname, lastname, division, bib, sponsor, order).
- Auth: ephemeral admin token via `.env` for dev; placeholder for event‑scoped admin key.

## Acceptance
- Seed an event from CSV in under 2 minutes; e2e test seeds demo data.
```

### PR4 — Judge auth & panel (dead simple)
```
# Working contract
# Base: main
# Branch: pr4/judge-panel

## Changes
- Judge login with event code + PIN; server returns short‑lived JWT with judge_id & category.
- Minimal panel: pick skater (current heat visible first), input value (buttons + keypad), Submit.
- Client‑side queue (IndexedDB) with UUID per score; resend until 200 OK.
- /api/scores POST idempotent; unique(run_id, judge_id, category).

## Acceptance
- Kill network → submit → restore → auto‑sync; no dupes; toast confirmations.
```

### PR5 — Runs, locks, and announcer tools
```
# Working contract
# Base: main
# Branch: pr5/announcer-runs

## Changes
- /api: start/stop run; heat lock/unlock; recompute placements on change.
- /web: Announcer view: start/stop, show Now/Next/Up‑Next; lock heat.
- Audit entries for lock/unlock and overrides.

## Acceptance
- Can’t submit after lock; override puts audit row.
```

### PR6 — Live leaderboard + public display
```
# Working contract
# Base: main
# Branch: pr6/leaderboard-live

## Changes
- WebSocket hub; topics per event/division.
- Public `/leaderboard/:division` page (auto refresh via WS).
- Animation for rank changes; big-screen mode (fullbleed, 1080p friendly).

## Acceptance
- Score submission updates leaderboard < 300ms locally; visual diff test snapshot.
```

### PR7 — Exports (CSV + PDF)
```
# Working contract
# Base: main
# Branch: pr7/exports

## Changes
- CSV export: raw scores, placements per division.
- Branded PDF summary (wkhtmltopdf or gofpdf) with top 10 + category breakdowns.

## Acceptance
- Golden files compare for CSV; deterministic PDF hash in CI.
```

### PR8 — Configs: scales, decimals, best-of, tie-breakers
```
# Working contract
# Base: main
# Branch: pr8/scoring-config

## Changes
- `event.config_json` stores: scale_min/max, step (0.1), runs_per_skater (2), scoring_mode (best_of vs total_of), tie_break order.
- Admin UI to edit; recalc placements on change.

## Acceptance
- Switching to total-of recomputes ranks correctly in e2e.
```

### PR9 — PWA/offline polish
```
# Working contract
# Base: main
# Branch: pr9/pwa-offline

## Changes
- Service worker, app manifest, icons; Wake Lock on judge panel.
- “Offline x queued” chip; retry with backoff.

## Acceptance
- Lighthouse PWA: installable; offline scoring demo passes.
```

### PR10 — Deploy (Fly.io + Litestream)
```
# Working contract
# Base: main
# Branch: pr10/deploy

## Changes
- Fly.io apps: thunderdome-api, thunderdome-web; volume for /data; health checks.
- Litestream to Backblaze B2; daily snapshot; restore script.
- GitHub Actions: build/push, deploy on tag.

## Acceptance
- Staging URL up; DB survives container restarts; backup visible in B2.
```

### PR11 — Styling & branding
```
# Working contract
# Base: main
# Branch: pr11/brand-ui

## Changes
- Theme: dark-on-dark for judge/announcer; high‑contrast; large touch targets.
- Public leaderboard theme with sponsor strip + logo.

## Acceptance
- AA contrast; mobile tap target ≥ 44px.
```

### PR12 — Roles & hardening
```
# Working contract
# Base: main
# Branch: pr12/roles-hardening

## Changes
- Separate admin, announcer (read + run control), judge (write scores), viewer (read only).
- Rate limiting; input validation; PIN lockout on 10 failures; server metrics.

## Acceptance
- Security unit tests; zap baseline scan clean.
```

### PR13 — Stripe (optional) & runbook
```
# Working contract
# Base: main
# Branch: pr13/payments-docs

## Changes
- (Optional) Simple Stripe Checkout for per‑contest charge.
- Add `RUNBOOK.md`: pre‑contest checklist, day‑of ops, post‑contest export.

## Acceptance
- Dry-run payment in test mode; runbook peer‑tested.
```

---

## 11) Day‑of Ops (excerpt from runbook)
- T‑24h: seed event; print backup start lists; verify backups.
- T‑2h: judge devices on latest build; test a fake heat; check WS latency.
- Post: export CSV + PDF; snapshot DB; send recap link.

---

## 12) What I’ll need from you
- The Drive ZIP (drop into `/docs/reference/`).
- A sample start list CSV (10–20 skaters across 2 divisions).
- Thunderdome logo (SVG/PNG) for leaderboard.
- Decision: pay‑per‑contest vs volunteer core + host fee.

---

*End of plan. Start with PR1.*

