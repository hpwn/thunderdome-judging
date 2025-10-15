# Functional requirements

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

## Roles

- **Administrator**: configure events, manage judges, import/export start lists and results, oversee scoring locks and audit trails.
- **Judge**: score assigned category per run, finalize runs, flag anomalies.
- **Announcer / MC**: monitor live leaderboard, queue up skaters, announce standings.
- **Audience**: view public leaderboard and heat progress (read-only access).

## Core flows

1. **Event setup**: Admin creates contest, defines divisions/heats, assigns judges, uploads start list CSV.
2. **Pre-event checks**: Admin verifies API/web health, tests scoring connectivity, and distributes judge logins.
3. **Live judging**: Judges enter trick data per run, leaderboard updates in real time, announcer monitors changes.
4. **Score lock & review**: After runs complete, admin locks scores, reviews audit trail, and resolves tie-breakers as needed.
5. **Results export**: Admin exports final standings CSV/PDF and shares with organizers.

## CSV headers

Use the following headers for start list imports:

```
division,heat,skater_first_name,skater_last_name,country,run_order
```
