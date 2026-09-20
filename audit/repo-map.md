# Repo Map

Discovery pass for the 73-journey display/presentation audit. Every entry below
was verified against the working tree at `1d2e929`, not assumed from prior
sessions — the starting hints were all still correct, and the one architectural
question they did not answer (is there a display overlay layer?) is answered
"no, none exists yet".

## Journey Sources

- **Format: hand-authored TypeScript.** Not JSON, not YAML, not generated.
  `src/canonical/` holds `types.ts` plus 26 flat domain files (`acquisition.ts`,
  `retention.ts`, …), each exporting exactly `<DOMAIN>_JOURNEYS` and
  `<DOMAIN>_RULES` as top-level `export const` array literals.
- `src/canonical/index.ts` aggregates them into `CATEGORIES` (26 categories,
  each carrying `id`, `title`, `titleTr`, `purpose`, `descriptionTr`,
  `journeys`, `rules`).
- Object keys inside the domain files are currently written JSON-style
  (`"id": "ACQ-11"`), which is still a legal TS object literal — the validator
  parses these files **as text** and evals the literals, so the shape of the
  `export const` matters more than the key style.
- **Generated mirror:** `production/canonical-dump.json` (`npm run
  dump:canonical`) is a git-tracked JSON projection of the same corpus. Safe to
  read for analysis; not the source of truth.
- **Surface assignment:** `production/surface-assignment.json` carries
  `{ id, surface, sends, routesToHuman }` per journey — the join used to
  compute which journeys are public vs library.

## Canonical Schema

- `src/canonical/types.ts` (626 lines). `CanonicalJourney` = base fields
  (`id`, `slug`, `category`, `goal`, `channels`, `name`, `shortName`,
  `purpose`, `entity`, `guardrails`, `reusableRule`, `distinctFrom`,
  `entry`, `nodes`) **plus** optional vNext fields (`objective`,
  `eligibility`, `suppressions`, `contact`, `channelStrategy`,
  `orchestration`, `implementation`, `measurement`, `discovery`).
- `measurement` is the **vNext migration marker** — its presence turns vNext
  validator rules from warnings into errors and is what
  `practitionerView()` gates on.
- Node kinds: `trigger | action | condition | wait | outcome | exit | handoff`.
  Relevant per-kind fields for display work:
  - `trigger`: `event`, `evidence.{requires, insufficientAlone, source}`, `next`
  - `action`: `does`, `execution?: "communication" | "human"` (absent = internal),
    `writes`, `idempotencyKey`, `attemptBudget`, `next`
  - `condition`: `asks`, `branches[] { label, when, observes, to }`
  - `wait`: `until[]`, `onEvent`, `onTimeout`, `timeout.{after, reason,
    relativeTo, attribute}`, `recheck`, `windowExtendsOnEngagement`
  - `exit`: `state`, `class: ExitClass`, `terminal`, `reEntry`
  - `handoff`: `to`, `on`, `carries[]`, `suppresses[]`, `contract`
- `ExitClass` is authored data and is already load-bearing for display
  (`success` drives the green exit capsule; `no-action` drives the gate
  collapse added in #9).
- `Orchestration.touches[]` carries `{ id, stage, action, after?, gatedBy?,
  prerequisites[], purpose, channelRoles[], destination, mandatory, label }`
  — the touch plan, joined to action nodes by `Touch.action`.

## Display/View Layer

- **`src/lib/canonical-view.ts` (821 lines) is the only bridge**, server-only.
  `CanonicalJourney` → `FlowNode[]` / `JourneyDetail`.
  - `nodeView()` projects one canonical node to one `FlowNode`
    (`headline`, `detail`, `meta`, `edges`, plus per-kind extras).
  - `flowNodesOf()` adds derived, mechanical fields: `channelPriority`
    (prose-detected), `touchStage` (from `touches[].stage`), `channelPlan`
    (from `touches[].channelRoles` × `channelStrategy.roles`).
  - `splitExitState()` shortens an exit's `state` to its lead clause.
  - `JOURNEY_ROWS` and the card thumbnails are computed **once at module
    load** (top-level `await` on the ELK layout), so importing this module
    from a `"use client"` file would ship all 286 graphs to the browser.
- **There is NO display overlay / presentation-metadata layer today.**
  Searched for `displayOverlay`, `DisplayOverlay`, `display-overlay`,
  presentation metadata: zero hits in `src/`. All display simplification so
  far lives in two places only: derived `FlowNode` fields (above) and the
  display-graph transform (below). Phase 2.1 Level 2 would be net-new.

## Layout Engine

- **ELK** (`elkjs`, `elk.bundled.js`) — layered / DOWN / ORTHOGONAL, in
  `src/lib/journey-canvas-layout.ts` (662 lines). Not Dagre, not custom.
- **A display graph layer DOES exist here**, and it is the sanctioned place
  to transform canonical structure for drawing. `buildDisplayGraph()`
  currently performs four transforms, all generic (no journey/node id
  lookups):
  1. **Shared-terminal instancing** — an `exit`/`handoff`/`outcome` with ≥2
     parents is drawn once per parent (`x.converted@c.state`), keeping
     `canonicalNodeId` for the detail panel.
  2. **`collapsibleRouters`** — a channel-selecting action feeding one
     communication/human action draws no box; its edges pass through.
  3. **`collapsibleGates`** — a binary condition whose short branch reaches
     an exit of class `no-action` (through ≤1 bookkeeping hop) draws no box.
  4. **Twin-route merge** — a wait whose event and timeout arms land on the
     same node draws one line carrying both labels.
  Plus a post-collapse **unreachable prune**.
- `SIZE` is a per-kind card footprint table; spacing/options in
  `ROOT_OPTIONS`. Layouts are cached per structural signature.
- **No manual coordinates anywhere** — ELK's own x/y/bendpoints are copied
  through in `readBack()`.

## Renderer & Node Components

- **`src/components/JourneyCanvas.tsx` (908 lines)** — the client island.
  Takes the finished `layout` as a prop (never lays out in the browser).
  Owns pan/zoom, LOD (`data-lod=far`), edge rendering (rounded bends, halos,
  hover route tracing — recent work by Hulusi), and node selection.
- **`src/components/ui/JourneyCanvasNodes.tsx` (585 lines)** — one exported
  card per kind: `TriggerCard`, `ActionCard` (dispatches to
  `CommunicationCard` / `RouterCard` / plain internal), `ConditionCard`,
  `WaitCard`, `ExitCard`, `HandoffCard`, `OutcomeCard`. Shared helpers:
  `humanize`, `waitLabel`, `actionTitle`, `ChannelPriorityRow`, `CARD_TEXT`
  (the bilingual chrome dictionary), `KIND`/`FAR`/`ACCENT` token maps.
- `src/lib/journey-preview.ts` builds card thumbnails from the **same**
  `CanvasLayout`, so a thumbnail and its detail canvas cannot disagree.

## Detail Panel

- **`src/components/ui/NodeDetailPanel.tsx`** — opened by clicking a card.
  Receives the `FlowNode` plus, for a collapsed router, the router's own
  `FlowNode` via `collapsedRouter` (rendered as "Channel priority" +
  "Routing logic"). This is the existing precedent for Phase 2.2's
  "represented canonical steps" contract — it already proves a collapsed
  visual node can keep full traceability.
- `JourneyCanvas.tsx` computes `collapsedRouterOf` and threads it in.
  **Nothing equivalent exists yet for `collapsibleGates`** — the gate's
  question and its no-action outcome are currently not surfaced anywhere in
  the panel. Gap to close in Phase 3.

## Detail Page Template

- `src/components/JourneyRoutes.tsx` — `JourneyFullPage` (Info/Canvas tabs via
  `JourneyDetailShell`) and `JourneyModalPage` (intercepted `(.)[slug]`).
- `src/components/JourneyInfo.tsx` — hero (category, title, purpose, goal +
  channel chips) then canvas preview + Shape tile.
- `src/components/JourneyDetailBody.tsx` — the single body for every journey:
  canvas, then the notes tiles (Reusable rule / Entity / Guardrails /
  Distinct from / Competes / Pre-empted by), then — only when
  `detail.practitioner` exists — the full `PractitionerView` write-up inside
  a native `<details>` disclosure closed by default.
- **The Phase-5 "detail page standard" is already implemented** (PR #7): the
  long technical sections are behind "Technical details" / "Teknik detaylar".
  Phase 5 needs to verify it, not build it.
- `src/components/PractitionerView.tsx` renders the technical sections from
  `src/lib/practitioner-view.ts`'s projection (null for non-vNext journeys).

## Localization

- **No i18n library, no `dictionaries/` folder.** Two mechanisms:
  1. **UI chrome** — one dictionary, `src/lib/content.ts` (1613 lines),
     `copy.en` / `copy.tr`. Canvas card chrome additionally lives in
     `CARD_TEXT` inside `JourneyCanvasNodes.tsx`, and channel/goal names in
     `journey-channels.ts` / `journey-taxonomy.ts`.
  2. **Canonical prose** — `src/lib/journey-tr-overrides.ts` (~3600 lines),
     a two-layer localizer: a *structural* layer applied to every node
     (edge labels, `meta` prefixes, category titles, wait-detail wrappers)
     and a *content* `OVERRIDES` table keyed by journey id → node id →
     `{ headline, detail, edges[] }`, covering the public corpus.
- **Routing:** every page exists twice (`src/app/(en)/…` and `src/app/tr/…`),
  no `[lang]` segment. `localizedJourneyDetail(detail, lang)` is the single
  entry point; it returns `detail` untouched for any lang but `tr`.
- Canonical ids and event ids are deliberately **not** translated.

## Build / Lint / Typecheck / Tests

| Purpose | Command | Notes |
|---|---|---|
| Build | `npm run build` | plain `next build`, no prebuild hook |
| Typecheck | `npx tsc --noEmit` | currently clean |
| Lint | `npm run lint` | eslint; 1 pre-existing error (`MobileNav.tsx`) + 12 warnings, unrelated |
| Canonical gate | `npm run validate:canonical` | ~25 hard invariants + vNext rules; the real gate for `src/canonical/` |
| Production artifacts | `npm run validate:journey-production` | 30 checks against frozen baselines |
| SEO | `npm run validate:seo` | title/description corpus + cannibalization |
| Dump | `npm run dump:canonical` | regenerates `production/canonical-dump.json` |

- **There is no test framework** (no jest/vitest). Correctness is enforced by
  the validators above plus the QA harnesses below.

## Visual Validation

- `qa/journey-canvas/` — Playwright-based harnesses expecting the app on
  **port 4022**: `qa-gate.mjs` (fast 19-check gate over a 39-journey
  fixture), `full-sweep-255.mjs` (~15-20 min), `viewport-sweep.mjs`,
  `responsive-integration-smoke.mjs`, `a11y-test.mjs`, `perf-test.mjs`,
  `drawer-audit.mjs`, `link-integrity.mjs` (pure data, runs anywhere).
- **Caveat:** these reference `/opt/node22/...` and Playwright, which is not
  in `node_modules` — only `puppeteer-core` is. Chromium *is* available at
  `/opt/pw-browsers/chromium`.
- **What actually works here:** `puppeteer-core` against a local
  `next start`, which is what this session has been using for DOM extraction
  and screenshots. `scripts/shot.mjs` is the existing screenshot helper
  (port 5182 by default).
- `ENABLE_QA_CANVAS_SWEEP=1` gates the `/qa-canvas-sweep/[id]` route used by
  the sweep harnesses.

## Git State

- Working tree **clean** at discovery time.
- HEAD = `1d2e929` "Canvas: collapse permission gates, name the touch's real
  channels (#9)", which is also `origin/main`.
- **Shared repository — a second author (Hulusi) is actively committing to the
  same canvas files.** Recent commits touch `JourneyCanvas.tsx` and
  `journey-canvas-layout.ts`. Any work here must build on top of current
  `main`, never revert or rewrite their changes.
- Vercel deploys are blocked for commits authored by that collaborator
  (Hobby-plan restriction); commits landed through a PR merge under the
  project owner's account deploy normally.

## Risks / Unknowns

1. **Concurrent authorship.** Hulusi edits the same renderer/layout files.
   Mitigation: re-fetch before every batch, keep changes additive, never
   force-push, prefer new functions over rewriting existing ones.
2. **No display overlay layer exists.** Phase 2.1 Level 2 means introducing a
   new concept. Preference per the brief is Level 1 (generic transforms)
   wherever the semantics carry it — the three transforms already shipped
   prove that route works, so Level 2 should stay a last resort for shapes
   that genuinely cannot be detected structurally.
3. **`canonical-view.ts` top-level `await`** means plain `tsx`/`node` cannot
   import it without an ESM bundle. Corpus analysis therefore reads
   `production/canonical-dump.json`; *display* counts must come from a real
   render (puppeteer against `next start`), not a re-implementation, or the
   two will drift.
4. **Playwright harnesses are unrunnable as-written** (paths + missing dep).
   Visual validation will use `puppeteer-core` + `next start` rather than
   repairing them, to avoid widening scope.
5. **TR content overrides are hand-authored per node**, so a display change
   that alters which node is drawn can silently change which translated
   string appears. Locale validation must run against the rendered TR page,
   not the override table.
6. **Pre-existing lint error** in `MobileNav.tsx` is unrelated and must not
   be counted as a regression.
