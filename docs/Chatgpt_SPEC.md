# SPEC — Geo Mini Games (Next.js + Supabase)

## 0. One-line summary
A lightweight web game with 3 core modes:
1) **Find a country on a 3D globe**
2) **Find capitals + click capital position on a 2D country map**
3) **Order countries by population**  
Optional: **LLM-based country recommendation quiz**.

---

## 1. Fit with the recommended stack
### ✅ Good fit
- **Next.js (App Router)**: UI + server routes/server actions in one repo.
- **Supabase**: Postgres + Auth + Storage + Row Level Security (RLS) for score storage and optional accounts.
- **Tailwind + shadcn/ui**: fast, clean UI for quiz/cards/modals and search/select inputs.
- **Prisma/Drizzle**: type-safe DB access + migrations (optional; you can start with Supabase SQL + generated types).

### Main technical “hard parts” (still manageable)
- **Accurate click-picking on 3D globe** and **2D map click validation**.
- Recommendation: use a globe lib that already supports polygon picking to avoid writing complex raycasting/picking logic.

---

## 2. Goals / Non-goals
### Goals
- MVP playable with clear scoring + fail conditions.
- Minimal ops: Vercel + Supabase only.
- Deterministic correctness checks (no “client-only trust” for scoring).

### Non-goals (MVP)
- Multiplayer / realtime.
- Anti-cheat beyond server validation + basic rate limiting.
- Full analytics pipeline.

---

## 3. Tech stack (final)
### Core
- **Next.js 15+** (App Router), **TypeScript**
- **Tailwind CSS**, **shadcn/ui**
- **Supabase** (Postgres, Auth, Storage, RLS)
- Deploy: **Vercel**

### Maps / Interaction
Choose 1 for globe:
- **Option G1 (recommended): react-globe.gl**
  - Pros: polygon rendering + click events are easier
  - Cons: bundle size, limited customization vs raw three
- **Option G2: react-three-fiber + three**
  - Pros: maximum control
  - Cons: you must implement country picking (harder)

2D map:
- Render **country GeoJSON** to SVG/canvas (e.g., `d3-geo` or a lightweight renderer)

Drag ordering (population game):
- **@dnd-kit/core** (simple, modern)

Validation:
- **zod** for server input validation

Optional LLM mode:
- A provider abstraction (OpenAI/Anthropic/Gemini/etc.) using server-only env keys

---

## 4. Data requirements (must-have)
To avoid calling external APIs during gameplay, ship static datasets in-repo.

### 4.1 Country canonical dataset (single source of truth)
Create `data/countries.json`:
- `iso2`, `iso3`
- `name_en`, `name_ko` (optional)
- `capital_name`
- `capital_lat`, `capital_lng`
- `population` (latest available in your dataset snapshot)
- `bbox` (optional; for quick map zoom)
- `geometries` reference key (to GeoJSON feature ID)

### 4.2 GeoJSON
- `data/world_countries.geojson` (for 3D polygons picking)
- `data/countries/{iso3}.geojson` (for 2D map per selected country; can be generated at build time)

> Note: For MVP, it’s fine to store a reduced-resolution GeoJSON to keep bundle size down.

### 4.3 Build-time processing (recommended)
A small script (Node) that:
- ingests raw GeoJSON
- normalizes feature IDs to ISO3
- generates per-country GeoJSON files
- validates that every country has: capital coords + population

---

## 5. Product UX (routes/pages)
### Public pages
- `/` — Landing: mode selection + “Start”
- `/play/a1` — Mode A Level 1: 3D globe country click
- `/play/a2` — Mode A Level 2: capital quiz + country selection + 2D click
- `/play/b1` — Mode B Level 1: 3-country population ordering
- `/play/b2` — Mode B Level 2: 5-country population ordering
- `/ai` (optional) — Mode C: questionnaire + result

### Optional
- `/profile` — show best scores, recent runs (only if Auth enabled)

---

## 6. Game rules (authoritative)
All scoring and attempt counting must be computed **server-side**.

### 6.1 Mode A — Find a country on the globe
#### Level 1 (A1)
- UI shows a **country name** (e.g., “Chile”)
- Player rotates globe and clicks a country
- Server checks: clicked ISO3 == target ISO3
- Scoring:
  - +10 points per correct answer
  - attempts reset after correct answer
- Fail condition:
  - **3 wrong attempts on the same question ⇒ run ends**
- Loop condition:
  - Continue generating next target until run ends or player exits

#### Level 2 (A2)
- UI shows a **capital name** (e.g., “Santiago”)
- Step 1: Player chooses the country the capital belongs to (searchable select)
  - Correct ⇒ proceed to Step 2
  - Wrong ⇒ counts as attempt (up to 3)
- Step 2: Show 2D map of that country; player clicks the capital location
  - Validation: click is within distance threshold of capital coordinate
- Scoring:
  - Step 1 correct: +5
  - Step 2 correct: +10
- Fail condition:
  - 3 wrong attempts across step1/step2 for that question ⇒ run ends

**Distance threshold (MVP)**:
- 2D map click considered correct if within **X km** of capital (default X=50km; configurable)
- Use haversine distance on server.

### 6.2 Mode B — Population ordering
#### Level 1 (B1)
- Show 3 country cards
- Player orders from **highest population → lowest**
- Server checks using canonical population dataset snapshot
- Scoring:
  - Correct: +10
  - Wrong: +0 (or -2; choose one)
- Continue with a new set

#### Level 2 (B2)
- Same, but 5 countries
- Scoring can be +20 if desired

### 6.3 Mode C — AI Country Recommendation (optional)
- 8–12 multiple-choice questions
- Convert answers to structured JSON
- Call LLM provider (cheapest model) to return:
  - Top 3 countries
  - Reasons
  - Optional fit score (0–100)

**Important**: This mode should not be required for the game to function.

---

## 7. System design (minimal)
### 7.1 Server-first validation
The client never decides correctness. Client sends:
- chosen ISO3
- click coordinate (lat/lng) where relevant
- run ID + question ID (server-generated)

Server returns:
- correct/incorrect
- new score
- remaining attempts
- next question payload (if continuing)

### 7.2 Session model
Support 2 modes:
1) **Anonymous runs** (default, no login)
2) **Optional logged-in runs** (Supabase Auth)

Anonymous:
- `run_id` stored in httpOnly cookie or localStorage (cookie preferred)
- server routes use `run_id` to update run state

Logged-in:
- `user_id` from Supabase session
- RLS allows reading/writing only your own runs

---

## 8. Database schema (Supabase / Postgres)
> Keep it minimal. You can add more later.

### 8.1 Tables
#### `runs`
- `id` (uuid, pk)
- `user_id` (uuid, nullable)
- `mode` (text: 'A1'|'A2'|'B1'|'B2'|'C')
- `status` (text: 'active'|'ended')
- `score` (int, default 0)
- `attempts_left` (int, default 3)
- `current_question` (jsonb) — server-generated state payload
- `created_at`, `ended_at`

#### `run_events` (optional, for audit/debug)
- `id` uuid pk
- `run_id` uuid fk
- `event_type` text ('ANSWER'|'WRONG'|'CORRECT'|'END')
- `payload` jsonb
- `created_at`

#### `ai_results` (optional)
- `id` uuid pk
- `user_id` uuid nullable
- `answers` jsonb
- `result` jsonb (top3, reasons, scores)
- `created_at`

### 8.2 RLS policies (if Auth enabled)
- `runs`: users can `select/insert/update` only rows where `user_id = auth.uid()`
- `ai_results`: same rule
- Anonymous runs: either store in DB without RLS (not recommended) or store only in server memory/cookie (recommended for MVP).
  - Practical MVP approach:
    - Anonymous runs stored in DB with a random `anon_key` stored in httpOnly cookie; RLS checks `anon_key` via a Postgres function is advanced.
    - Simplest: allow anonymous runs but **do not persist** them in DB; only persist for logged-in users.

**Recommendation (MVP)**:
- Anonymous runs: store run state in **server-side (db) without persistence** or short-lived storage.
- Logged-in runs: persist in DB with RLS.

---

## 9. API / Server Actions (contract)
All endpoints validate input with zod.

### 9.1 Start run
- `POST /api/run/start`
Request:
```json
{ "mode": "A1" }
```
Response:
```json
{ "runId": "uuid", "score": 0, "attemptsLeft": 3, "question": { ... } }
```

### 9.2 Submit answer (Mode A1)
- `POST /api/run/a1/answer`
Request:
```json
{ "runId": "uuid", "targetIso3": "CHL", "clickedIso3": "ARG" }
```
Response:
```json
{ "correct": false, "score": 0, "attemptsLeft": 2, "question": { ...same target... } }
```

### 9.3 Submit answer (Mode A2 step1)
- `POST /api/run/a2/country`
Request:
```json
{ "runId": "uuid", "capitalName": "Santiago", "pickedIso3": "CHL" }
```

### 9.4 Submit answer (Mode A2 step2 click)
- `POST /api/run/a2/click`
Request:
```json
{ "runId": "uuid", "iso3": "CHL", "clickLat": -33.45, "clickLng": -70.66 }
```

### 9.5 Submit ordering (Mode B1/B2)
- `POST /api/run/b/order`
Request:
```json
{ "runId": "uuid", "mode": "B1", "orderedIso3": ["USA","CHN","JPN"] }
```

### 9.6 AI Recommend (optional)
- `POST /api/ai/recommend`
Request:
```json
{ "answers": { "q1": "A", "q2": "C", "...": "B" }, "provider": "openai" }
```
Response:
```json
{ "top3": [...], "reasons": [...], "scores": [92, 80, 74] }
```

---

## 10. Question generation logic (server)
### Common rules
- Use `countries.json` as the only truth.
- Avoid repeats in the same run (keep a set in `current_question` state).
- Difficulty progression is optional; keep it random for MVP.

### A1 generation
- pick random target ISO3 from allowed set (exclude tiny territories if you want)
- question payload:
```json
{ "type":"A1", "targetIso3":"CHL", "targetName":"Chile" }
```

### A2 generation
- pick random ISO3 that has capital coords and country geojson
- payload:
```json
{ "type":"A2", "iso3":"CHL", "capitalName":"Santiago", "step":"pickCountry" }
```

### B1/B2 generation
- pick N distinct countries
- payload:
```json
{ "type":"B", "mode":"B1", "items":[{"iso3":"USA","name":"United States"}, ...] }
```

---

## 11. UI/UX details (minimum)
### Shared UI
- Header: score, attempts left, “End run” button
- Toast for correct/incorrect
- Result modal at end of run

### A1 globe UI
- Black background, centered globe canvas
- “Country name” shown as big text
- On click:
  - highlight clicked country for 500ms
  - send to server

### A2 UI
- Capital name shown
- Step 1: searchable select (shadcn `Command` + `Popover`)
- Step 2: 2D map with click marker + zoom/pan optional

### B1/B2 UI
- Cards with country name + (optional flag)
- Drag to reorder (dnd-kit) or use up/down buttons
- Submit button triggers server check

### Optional: accessibility
- keyboard reorder alternative for B mode

---

## 12. LLM provider abstraction (optional)
### Requirements
- provider selectable via env / config
- cheapest model preferred
- server-only keys

### Interface
```ts
export interface LlmProvider {
  name: string;
  recommendCountry(input: QuizInput): Promise<QuizOutput>;
}
```

### Safety / cost controls
- hard limit: 1 request per run
- cache identical answer payloads (hash) for 24h (optional)

---

## 13. Repo structure (suggested)
```
/app
  /(public)
  /play/a1
  /play/a2
  /play/b1
  /play/b2
  /ai
  /api
    /run/start
    /run/a1/answer
    /run/a2/country
    /run/a2/click
    /run/b/order
    /ai/recommend
/components
  GlobeCanvas.tsx
  CountryMap2D.tsx
  PopulationOrderBoard.tsx
  ScoreHeader.tsx
/lib
  datasets/
    countries.ts
    geo.ts
  game/
    generators.ts
    validators.ts
  supabase/
    client.ts
    server.ts
/data
  countries.json
  world_countries.geojson
  countries/
    CHL.geojson
/scripts
  build-geo.ts
```

---

## 14. Implementation milestones (Cursor-friendly)
### Milestone 1 — Skeleton
- Next.js + Tailwind + shadcn/ui
- Home + mode routes
- `countries.json` loader + simple server API `/api/run/start`

### Milestone 2 — Mode B (fastest to ship)
- B1 UI + dnd-kit reorder
- `/api/run/b/order` server check
- scoring + end run

### Milestone 3 — Mode A2
- Step1 select country + server check
- 2D map rendering + click validation via haversine

### Milestone 4 — Mode A1 globe
- Integrate globe library
- Country polygon click mapping to ISO3
- Server validation + scoring

### Milestone 5 — Optional AI mode
- questionnaire UI
- provider abstraction + env config
- result rendering

---

## 15. Acceptance criteria (MVP)
- A1: Clicking correct country increments score; 3 wrong attempts ends run.
- A2: Correct country selection unlocks 2D map; correct click validated by distance threshold.
- B1/B2: Ordering validated server-side and score updates.
- Deployment: runs on Vercel with Supabase configured.
- No secret keys exposed to client.

---

## 16. Open decisions (defaults to proceed)
- Globe implementation: **react-globe.gl** for MVP
- Anonymous runs persistence: **no DB persistence** (only in-memory/cookie); DB persistence only for logged-in users later
- Scoring constants: as defined above; can be tuned later
