# Thunderdome / NAFSA Judging App — From Zero to Live Contest

> Goal: ship a dead‑simple, bulletproof, live‑scoring web app judges can run on any phone or laptop; public leaderboard updates instantly; low-cost hosting; easy per‑contest spin‑up; portfolio‑worthy polish.

---

## 1) What the email asks for (quick read)

* **NAFSA categories**: Technicality, Aesthetics, Composition.
* **One category per judge**; grand total = sum of the three category scores per skater.
* **Live placements** à la X‑Games/Street League.
* **EU example screenshots** provided for inspiration; we aim cleaner/faster.
* **Mike** (co‑recipient) will weigh in on functionality; we’ll create sane defaults/config so we aren’t blocked.

**Open gaps we’ll close by assumption + switches**

* Scoring scale (default **0–10** with **0.1** increments), allow integers-only toggle.
* **# of runs** per skater per heat (default 2; best-of vs total-of toggle, default **best run counts**).
* Tie‑break rules: highest single category, then next category, then earliest timestamp.
* Divisions (Pro/Am/Junior) & start lists: CSV import + quick manual edit.
* Public displays: **MC/Announcer view**, **Audience leaderboard**, **Judge-only panel**.
* Offline tolerance: judges can score offline for minutes; app queues + syncs when back.

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

* Mobile PWA install (A2HS), **Wake Lock** to keep screen on.
* Stripe pay‑per‑contest (or invoice), theming, sponsor logo ticker.
* Basic telemetry & crash reporting.

---

## 3) UX at a glance

* **Judge Panel (phone)**: pick skater → three giant buttons/inputs for rapid +/- and a submit; confirmation toast; queue badge if offline. No nav, no clutter.
* **Announcer**: next/now/up‑next cards, start/stop run, lock/unlock heat, trigger re‑runs.
* **Leaderboard (public)**: division tabs; rank, name, run scores, total; auto‑animate changes.
* **Admin Wizard**: stepper: Event → Divisions → Heats → Skaters (CSV) → Judges (assign categories) → Go Live.

---

## 4) Data model (Relational, normalized — Prisma)

* `event(id, name, date, venue, config_json, created_at)`
* `division(id, event_id, name, order)`
* `heat(id, division_id, name, order, status{scheduled|live|locked})`
* `skater(id, division_id, bib, first_name, last_name, sponsor, notes, order)`
* `judge(id, event_id, name, category{technicality|aesthetics|composition}, pin_hash)`
* `run(id, heat_id, skater_id, run_number, started_at, ended_at, status)`
* `score(id, run_id, judge_id, category, value, client_uuid, created_at, UNIQUE(run_id, judge_id, category))`
* `placement(id, division_id, skater_id, best_run_id, total, rank, tiebreak_json)`
* `audit(id, actor, action, entity, entity_id, data_json, ts)`

**Computed**: totals by best-of runs per config; placements recomputed on score change.

---

## 5) Architecture (cloud‑first + venue fallback)

* **Frontend:** React (**Next.js**, TypeScript).
* **API:** Node 20 (**Fastify**) + **Socket.IO** for real-time updates.
* **ORM:** **Prisma** with **two schemas** (Postgres for prod/staging, SQLite for venue mode).
* **Database:**

  * **Postgres** (Supabase/Neon) for production and staging.
  * **SQLite** for "Emergency Venue Mode" (optional) when running entirely on a laptop.
* **Hosting:** Web on Vercel (or Netlify); API on Fly/Railway/home server; DB on managed Postgres.
* **Real-time:** Socket.IO rooms per event/division; API emits on score writes.
* **Deploy:** CI builds Docker for API; Vercel deploy for web; migrations via Prisma on release.
* **PWA (later):** service worker + wake lock (optional; not required for cloud-only).

**Why:** maximizes hiring signal (React/Node/Postgres), but preserves a zero‑internet fallback with minimal extra setup.

---

## 6) NAFSA 2024 rubric (from Holden/Mike email + screenshots)

> Primary categories (one judge each): **Technicality, Aesthetics, Composition**. Category total = sum of the sub‑criteria below (deductions subtract), floored at 0. Event config may tweak caps/weights.

### Category: Technicality

* **Trick Level (sum of tricks)** — quick‑add buttons per trick:

  * Very Easy **1**, Easy **2**, Simple **3**, Basic **4**, Intermediate **5**, Hard **6**, Very Hard **7**, Advanced **8**.
  * **Special**: **9–12** each (**pure judge discretion**: judge picks 9, 10, 11, or 12). The paper sheet says “Don’t tally, write value”; our UI records each per‑trick value.

### Category: Aesthetics

* **Stability Deductions (cap 40)**: per‑incident −2 points each for: Arm flailing, Toe drags, Shaky legs, Hesitation in rail, Adjustment in pogo, Hesitation (generic). *We cap total deduction at 40.*
* **Balanced Trick Selection (0–20)**: **count of landed tricks** in the run (judge discretion). Points: 1→**0**, 2→**5**, 3→**10**, 4→**15**, **5+→20** (cap at 5).
* **Original & Rare Tricks/Combos (0–20)**: **judge discretion**; count distinct tricks or combos considered original/rare. Points: 0× **0**, 1× **5**, 2× **10**, 3× **15**, 4× **20** (cap at 4). *Belongs to Aesthetics only.*
* **Harmony With Music (0–20)**: freeform judge score; rubric text: “The run synchronized with the music.”

### Category: Composition

* **Composition checklist (0–25)**: 5 items × **5** each (Run planned; Avoids unnecessary/uncontrolled movement; Variety of speeds; Variety of patterns; Unique transitions between tricks). Checkbox = +5.
* **Flow Breaks (max 25, start from 25)**: perfect run **25** then subtract incidents: 1 foot down **−1** each; 2 feet down **−2** each; Slam or loss of board **−3** each; Draws attention to mistake with foot down **−4** each. Floor at **0**.
* **Use of Space (0–20)**: radio — Partial **5**, <½ **10**, <¾ **15**, Full floor **20**.
* **Overall Flow (0–30)**: freeform judge score.

### Totals & caps

* **Technicality**: open‑ended sum of tricks (we’ll display running total).
* **Aesthetics**: add positives (0–60) minus Stability (0–40), floor 0.
* **Composition**: Composition 0–25 + Flow Breaks 0–25 + Use of Space 0–20 + Overall 0–30 = **0–100**.
* **Grand total** per run = Technicality + Aesthetics + Composition.
* **Runs format (default)**: **2 runs, Best‑of**. Configurable to **Total‑of** in event settings.
* **Tie‑break (default order)**: **Composition** (higher wins) → **Aesthetics** → **Technicality** → **earliest finalized timestamp** → **alphabetical last name** as deterministic fallback. Admin can reorder in advanced settings.

---

## 7) Euro app takeaways (Login, Menu, Scoring) → what we’ll keep/twist

**Screens reviewed:** `Login`, `Main Menu`, `Scoring Composition and Style`, `Scoring Footwork`, `Scoring Technicality`, `Scoring Variety and Music`.

**Keep / adapt**

* **Big, single‑purpose CTAs** and large tap targets. We’ll keep an oversized primary button style.
* **Greeting with judge’s name** after login. We’ll show *Event • Division • Heat* + judge category tag (e.g., “Aesthetics”).
* **Bottom action bar** with **Submit** prominent and **Undo** available.

**Fix / improve**

* **No raw IP / insecure TLS**: require HTTPS + custom domain; HSTS; no IP address URLs.
* **Skip the menu for judges**: after login, **land directly on the scoring panel** for the current heat/skater. A tiny header can link to Scoreboard.
* **Role‑based home**: Judges see only “Score now” (default) and “Scoreboard (read‑only)”. Admin/Announcer see management/reporting.
* **Avoid generic sliders**: replace with **discrete controls** aligned to NAFSA:

  * Technicality → grid of quick‑add trick chips **1–8** and **9–12** (Special), visible running total, per‑trick undo.
  * Aesthetics → counters (−2 incidents, cap 40), radios for 0/5/10/15/20 scales, numeric/slider only for Harmony (0–20).
  * Composition → 5 checklist toggles (+5 each), Flow Breaks counters (start 25; subtract 1/2/3/4 with floor 0), Use of Space radios, numeric Overall (0–30).
* **Judge cannot select Rider/Run/Phase** (seen in Euro). Those are set by **Announcer tools** to prevent scoring the wrong skater/run. Emergency override is admin‑only and audited.
* **Persistent context header** on judge panel: *Rider • Division • Heat • Run N/Phase* so they always know whom they’re scoring.
* **Manual score insert** exposed as **Admin override** only, with audit entry; judges never see it.

**Reports mapping (from Euro buttons)**

* **Scoreboard** → our `/leaderboard/:division` (public read‑only).
* **Detailed/Run/Summary reports** → admin/announcer pages with print CSS:

  * **Detailed**: per‑skater breakdown (category subtotals + rubric details).
  * **Run**: run‑level table (by heat) with per‑judge entries.
  * **Summary**: final placements per division.

---

## 6) Security & reliability

* Short‑lived JWTs; event code + judge PIN for panel access.
* Idempotent writes with `client_uuid` + unique constraints.
* Heat locks prevent late edits; admin override logged to `audit`.
* Backups: provider snapshots for Postgres; for venue mode, copy SQLite DB file pre/post contest.
* Rate limits on scoring endpoints; input validation (Zod) at the edge and server.

---

## 7) Pricing / licensing / licensing options

* **Open core** (MIT) for portfolio visibility + **paid hosting/support**: $300–$600 per contest (includes 1 event + day‑of support), +$50 per extra division; includes backups and basic analytics.
* Or **volunteer core** + **pay‑per‑spin‑up**: $150 infra + $150 day‑of remote support.
* Keep rights to showcase; simple 1‑page SOW & NDA if needed.

---

## 8) Timeline (fast track)

* **Week 1**: scaffold, DB, admin wizard basics, judge panel v1.
* **Week 2**: real‑time leaderboard, announcer view, exports, deploy to Fly.
* **Week 3**: PWA/offline, polish, test event simulation, docs + runbook.

---

## 9) Next steps checklist (today)

1. ✅ `/docs/reference` committed to `main` (done).
2. Proceed to **PR1 — scaffold + tooling + baseline tests**. PR1 already includes: repo root `.gitignore`, deploy stubs (`vercel.json`, `fly.toml.example`), and the README top story. **Do not** create any real cloud projects yet; actual provider setup happens in **PR10 (Deploy)**.

---

## 10) Codex PR Task Blocks (React/Node/Postgres primary, SQLite venue fallback)

*(Paste each block into Codex; one PR at a time.)*

### PR1 — scaffold + tooling + baseline tests

```
# Working contract
# 1) Make ONLY the changes described below.
# 2) Base branch: main
# 3) Create branch pr1-reactnode/scaffold

## Changes
- Monorepo with pnpm workspaces:
  - /web → Next.js (TS) with placeholder routes: /admin, /judge, /leaderboard
  - /api → Fastify + Socket.IO; routes: GET /health, WS namespace /ws (no-op)
  - /prisma → schema.pg.prisma (provider postgresql, empty models for now)
  - /infra → docker-compose.dev.yml (web+api) and deploy templates (Vercel for web, Fly for api)
- Tooling: ESLint, Prettier, TypeScript strict; Vitest configured for web+api; Testing Library for web
- CI (GitHub Actions): install pnpm, lint, typecheck, build, run unit tests for web+api
- Root .env.example with DATABASE_URL, JWT_SECRET, NEXT_PUBLIC_API_URL, NEXT_PUBLIC_WS_URL
- **Root `.gitignore`** for Node/Next/Prisma/OS artifacts and `/data/*.db`.
- **Assets scaffolding**: create `/web/public/branding/` (empty) and stub `docs/sample_startlist.csv` (headers only); add a README note describing expected assets (logo optional, sample CSV path).
- **README.md top block (paste at top):**
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

- **Make references machine‑readable for Codex** (so it doesn’t have to “see” images/PDFs):
  - Create `/docs/reference/requirements.md` and include the **NAFSA 2024 rubric** from Section 6 (copy the bullets as-is), plus roles, flows, and CSV headers.
  - Create `/docs/reference/ui-notes.md` with bullet notes guiding judge/announcer/leaderboard UIs.
  - Create `/docs/api/openapi.yaml` with placeholder OpenAPI 3.1 file (info + empty paths) so later PRs fill it in.

## Acceptance
- `pnpm dev` runs web on :3000 and api on :8080; `/api/health` → `{ ok: true }`.
- CI green (lint, typecheck, unit tests run).
- README present with story top block; `/web/public/branding/` exists; `docs/sample_startlist.csv` stub exists.
- The following docs exist and contain initial content: `docs/reference/requirements.md`, `docs/reference/ui-notes.md`, `docs/api/openapi.yaml` (placeholder).
```

### PR2 — Prisma schema + Postgres wiring

```
# Working contract
# Base: main
# Branch: pr2-schema-pg

## Changes
- Define Prisma models for Section 4 (events, divisions, heats, skaters, judges, runs, scores, placements, audit).
- Add repository layer and seed script for demo data.
- Add migrations; `pnpm db:migrate:pg` applies in dev; CI uses `prisma migrate diff` to validate.
- Add API endpoints: /events CRUD (admin), /divisions, /heats basic list.
- Add initial API integration tests with Supertest against Postgres (Testcontainers or services).

## Acceptance
- `pnpm db:migrate:pg` succeeds; seed script loads demo event.
- API integration tests pass in CI using Postgres.
```

### PR2.5 — SQLite venue mode (fallback profile)

```
# Working contract
# Base: main
# Branch: pr2-5-venue-mode

## Changes
- Add /prisma/schema.sqlite.prisma (provider sqlite) mirroring the Postgres models.
- Add `infra/venue.compose.yml` to run api + (optional web) + SQLite or local Postgres.
- Scripts:
  - `prisma:gen:pg`, `prisma:gen:sqlite`
  - `db:migrate:pg`, `db:migrate:sqlite`
  - `dev:venue` → generates SQLite client and brings up venue compose
- README: "Emergency Venue Mode" quickstart.

## Acceptance
- `pnpm dev:venue` brings up the stack on localhost; health OK; migrations apply for SQLite.
```

### PR3 — Admin wizard (seed an event fast)

```
# Working contract
# Base: main
# Branch: pr3-admin-wizard

## Changes
- /web: `/admin` stepper (Event, Divisions, Heats, Skaters CSV import, Judges assign).
- Event step captures **runs settings**: `runs.count` (default 2) and `runs.format` (`best_of` default, `total_of` optional). Shows the default **tie-break order** (read-only here; editable later in PR8 advanced config).
- /api: endpoints to support wizard; CSV import (firstname, lastname, division, bib, sponsor, order).
- Auth: ephemeral admin key from env for dev; event-scoped admin key placeholder.
- **CSV sample asset**: finalize the CSV schema and commit `docs/sample_startlist.csv` (10–20 rows across 2 divisions) used by e2e.
- E2E smoke test (Playwright): seed event from CSV under 2 minutes.

## Acceptance
- Demo CSV (in /docs) imports and event becomes usable; e2e passes in CI.
- Creating an event sets `runs.count=2`, `runs.format=best_of` by default and displays the default tie-break order.
```

### PR4 — Judge auth & panel (dead simple)

```
# Working contract
# Base: main
# Branch: pr4-judge-panel

## Changes
- Judge login (event code + PIN) → short-lived JWT with judge_id & category.
- **Direct-to-scoring flow**: after login, redirect to `/judge/current` (current heat/skater). Small header shows Event • Division • Heat • Run/Phase and a link to read-only leaderboard.
- **Judge cannot pick rider/run/phase**; those come from the announcer’s control state. Add an admin-only emergency override dialog.
- Judge Panel VERSION A (numeric): keypad +/- input, Submit.
- Fixed bottom action bar: **Submit** primary, **Undo last** secondary, **Reset** behind long-press to avoid fat-finger.
- Client retry-until-ACK; /api/scores POST idempotent; unique(run_id, judge_id, category).
- Contract tests (Zod) for request/response payloads.

## Acceptance
- After auth, judge lands on scoring without a menu; context bar shows rider & run.
- Judge cannot change rider/run; override is admin-only with audit entry.
- Manual smoke: submit updates DB; Playwright test covers login → direct scoring → submit.
```

### PR4.5 — NAFSA rubric inputs (quick-adds, counters, deductions)

```
# Working contract
# Base: main
# Branch: pr4-5-nafsa-rubric

## Changes
- Add **VERSION B (rubric)** judge panel for category-specific inputs derived from Section 6:
  - **Technicality**: grid of quick-add chips for +1,+2,+3,+4,+5,+6,+7,+8 and +9/+10/+11/+12 (Special). Show per-trick list with undo; display running Technicality total at top.
  - **Aesthetics**: counters for Stability (-2 each, capped 40), radios for Balanced Trick Group (0/5/10/15/20), radios for Original & Rare (0/5/10/15/20), numeric or slider for Harmony (0–20).
  - **Composition**: 5 checkboxes (×5), Flow Breaks counters (start at 25 then subtract 1/2/3/4 each; floor 0), Use of Space radios (5/10/15/20), numeric for Overall (0–30).
- Compute **category total** client‑side and send to API along with **`score_detail_json`** (breakdown).
- API validates rubric totals server‑side (pure function library + unit tests) and stores `score.detail_json`.
- **UI decisions from Euro app**: persistent bottom Submit; **Undo last**; avoid generic sliders except Harmony/Overall; ensure ≥44px tap targets; keep-screen-awake toggle (behind flag).
- Admin setting to select **Scoring Mode** per event: `numeric_only` (PR4) or `nafsa_2024_rubric` (this PR). Default to rubric.

## Acceptance
- Given sample inputs from docs, client and server compute identical totals.
- E2E: judge submits using rubric UI and leaderboard reflects computed total.
- Accessibility snapshot confirms large controls; no menu interstitial after login.
```

### PR5 — Runs, locks, and announcer tools

```
# Working contract
# Base: main
# Branch: pr5-announcer

## Changes
- Announcer dashboard: pick division → select heat → choose current **Rider** & **Run** (Run 1/Run 2, Qualifiers/Finals) and **Start/Stop** a run.
- Lock/unlock heat; on lock, judge inputs disabled; override produces audit entry.
- Announcer sets “current context” that all judge panels follow in real time.
- On run start, optional 60/90s timer visible to announcer and (tiny) on judge panel.
- Integration tests for lock/override behavior; unit test ensures judges never submit for a non-current rider.

## Acceptance
- During a run, judges see the same rider/run context; attempting to change context is impossible.
- Submissions after lock are rejected; audit row appears on override.
```

### PR6 — Live leaderboard + real-time

```
# Working contract
# Base: main
# Branch: pr6-leaderboard

## Changes
- Socket.IO hub; rooms per event/division.
- `/leaderboard/:division` page with animated rank changes; big-screen mode (1080p friendly) and read-only public URL.
- Visual snapshot tests for the leaderboard.

## Acceptance
- Score submit updates leaderboard in < 1s on dev; snapshot tests pass.
```

### PR6.5 — Reports (Detailed, Run, Summary)

```
# Working contract
# Base: main
# Branch: pr6-5-reports

## Changes
- Add admin/announcer-only routes:
  - `/reports/detailed` — per-skater breakdown (category subtotals + rubric detail_json).
  - `/reports/run` — run-level table grouped by heat, with per-judge scores and timestamps.
  - `/reports/summary` — final placements per division with tie-break notes.
- Print CSS and “export to PDF” via browser.

## Acceptance
- Role-guarded navigation: judges cannot access these pages.
- Each report loads under 500ms with seeded demo data.
```

### PR7 — Exports (CSV + PDF)

```
# Working contract
# Base: main
# Branch: pr7-exports

## Changes
- CSV export: raw scores + placements per division.
- PDF summary (e.g., pdfkit) with top 10 + category breakdowns.
- **Branding**: if `/web/public/branding/thunderdome.(svg|png)` exists, render logo in PDF header; otherwise fall back to text title.
- Golden-file tests for CSV; deterministic PDF hash test.

## Acceptance
- Exports match golden files in CI.
- PDF export verified in two modes: with logo asset present and with no logo present (fallback text header).
```

### PR8 — Scoring config & tie-breakers

```
# Working contract
# Base: main
# Branch: pr8-scoring-config

## Changes
- `event.config_json` formalizes **rubric, caps, runs, and tie-breaks**:
  - `mode`: `nafsa_2024_rubric` | `numeric_only`
  - `runs`: { count: 2, format: `best_of` | `total_of` }
  - `technicality`: { allow_special_9_12: true }
  - `aesthetics`: { stability_cap: 40, balanced_selection_points: [0,5,10,15,20], rare_original_points: [0,5,10,15,20], harmony_max: 20 }
  - `composition`: { checklist_items: 5, flow_breaks_start: 25, flow_break_weights: [1,2,3,4], use_of_space_points: [5,10,15,20], overall_max: 30 }
  - `tiebreak`: { order: ["composition_total","aesthetics_total","technicality_total","finalized_at","name_alpha"] }
- Admin **Advanced Config** UI to edit caps/points, switch `runs.format`, `runs.count`, and **reorder** `tiebreak.order` via drag‑handle.
- Recalc placements live on config change.
- Property-based tests (fast-check) for rubric functions (monotonicity, caps honored, floors at 0) and for tie-break ordering stability.

## Acceptance
- Switching between `best_of` and `total_of` yields expected ranks on a seeded fixture.
- Changing tie-break order changes placements deterministically (snapshot of rank ordering updated in CI).
```

### PR9 — Security & resilience

```
# Working contract
# Base: main
# Branch: pr9-security

## Changes
- Rate limiting; PIN lockout after 10 failures; server metrics.
- Input validation with Zod; shared types across web/api.
- Basic k6 smoke test script for scoring endpoint.

## Acceptance
- Security tests pass; k6 smoke meets SLO (p95 < 200ms locally).
```

### PR10 — Deploy (Vercel/Fly + Supabase/Neon)

```
# Working contract
# Base: main
# Branch: pr10-deploy

## Changes
- Vercel config for web; Fly.io (or Railway) for API with health checks.
- Postgres connection (Supabase/Neon); migrations on deploy.
- **Branding doc**: document brand asset path (`/web/public/branding/`) and optional `BRAND_LOGO` env or config value used by public views/exports.
- GitHub Actions: build & deploy on tags; env secrets documented.

## Acceptance
- Staging URLs live; basic auth secrets set; smoke e2e hits staging in CI.
```

### PR11 — Styling & branding

```
# Working contract
# Base: main
# Branch: pr11-brand

## Changes
- High-contrast theme; large touch targets; sponsor/logo strip on leaderboard.
- **Branding assets**: wire optional event logo from `/web/public/branding/thunderdome.(svg|png)` into leaderboard & announcer views; sponsor strip component reads from config.
- Accessibility checks (axe) pass; AA contrast.

## Acceptance
- Mobile tap targets ≥ 44px; a11y tests green.
- UI verified with and without logo asset present.
```

### PR12 — Payments (optional) & README story + Runbook

```
# Working contract
# Base: main
# Branch: pr12-payments-readme

## Changes
- (Optional) Stripe Checkout for per‑contest charge.
- Add README sections: the story (paper → live), tech choices, tradeoffs, ops modes.
- **Sales docs**: add `/docs/sales/` with pricing one‑pager and SOW draft.
- Add `RUNBOOK.md`: pre‑contest checklist, day‑of ops, post‑contest export.

## Acceptance
- Test-mode Stripe payment works; docs reviewed.
```

### PR13 — Test suite hardening

```
# Working contract
# Base: main
# Branch: pr13-tests-hardening

## Changes
- Expand Playwright e2e (full judge → leaderboard flow); add fixtures.
- Add Testcontainers matrix jobs (Postgres & SQLite) in CI.
- Coverage thresholds enforced (80% statements).

## Acceptance
- Matrix CI green; coverage gates pass.
```

*(golden format)*
*(Paste each block into Codex; one PR at a time.)*

## 11) README: Story & Stack Rationale — moved into PR1 (see PR1 README.md top block content).

---

## 12) Testing & QA strategy (always-on)

* **Unit tests**: Vitest for web & api; Testing Library for React components.
* **API integration**: Supertest + Testcontainers (Postgres) with Prisma migrations.
* **E2E**: Playwright scripts for admin seeding, judge scoring, announcer lock, leaderboard updates; runs in CI against local services.
* **Contracts**: Zod schemas shared between web and api.
* **Property-based**: fast-check for scoring/tie-break correctness.
* **Visual**: Playwright screenshot snapshots for leaderboard.
* **Load (light)**: k6 smoke for scoring endpoint.
* **Coverage**: 80% statements minimum; report uploaded in CI.

---

## 13) Day‑of Ops (excerpt from runbook)

* T‑24h: seed event; print backup start lists; verify backups.
* T‑2h: judge devices on latest build; test a fake heat; check WS latency.
* If no internet: run `pnpm dev:venue` and announce laptop IP to judges.
* Post: export CSV + PDF; snapshot DB; send recap link.

---

---

*End of plan. Start with PR1.*
