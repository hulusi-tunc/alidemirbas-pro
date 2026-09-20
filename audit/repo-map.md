# Repo map — the 51-journey refactor

Phase 2 discovery, rewritten for this refactor (it previously described the
73-journey audit). Every path below was opened, not inferred from a naming
convention. Where a thing does **not** exist, that is stated — an assumed file
is worse than a missing one.

The one-line orientation: **canonical data → one adapter → pages**, with a
publishing gate in the middle and a display-graph transform on the way to the
canvas. Nothing renders from canonical directly.

```
src/canonical/*.ts ──► src/lib/public-corpus.ts ──► src/lib/canonical-view.ts ──► pages
   (hand-authored)        (WHAT is public)            (the only adapter)
                                                            │
                                                            ▼
                                              src/lib/journey-canvas-layout.ts
                                              (display graph + ELK)  ──► JourneyCanvas
```

---

## 1. Canonical journey definitions

| path | what it is |
|---|---|
| `src/canonical/*.ts` | 26 hand-authored domain files, each exporting `<DOMAIN>_JOURNEYS` and `<DOMAIN>_RULES`; `types.ts` holds the schema; `index.ts` aggregates |
| `src/canonical/surface.ts` | derives a journey's product surface (customer / mechanism / operational) from its own facts |
| `src/canonical/events.ts` | **generated** event registry (`scripts/build-event-registry.mjs`) |
| `src/canonical/config-text.ts` | turns a `Config` into the sentence a reader sees — the source of the `"(configure <key>)"` wrapper |
| `production/canonical-dump.json` | **generated** machine-readable export (`npm run dump:canonical`). Read this for analysis; plain Node cannot import the TS |

A journey is a **graph, not a sequence**: an `entry` node plus nodes naming
their own successors. Node kinds: `trigger`, `action`, `condition`, `wait`,
`outcome`, `exit`, `handoff`. An action's `execution` is `communication`,
`human`, or unset (internal).

**Corpus size today:** 286 journeys / 3728 nodes / 8 merged ids.

## 2. Registries — what is public

| path | role |
|---|---|
| `src/lib/public-corpus.ts` | **the gate.** `EXCLUDED_FROM_PUBLIC` (22 ids) + `PUBLIC_LIBRARY_IDS` (51 ids) + a module-load assertion that they partition the library exactly |
| `scripts/public-scope.mjs` | parses those two lists out of the TS as text, so plain-Node scripts share one source |
| `production/surface-assignment.json` | **generated** per-journey surface + `excludedFromPublic`, for scripts that cannot import TS |

Layering, which matters: the **Operational Workflows archive** is a *rule*
(`surface !== "operational"`, 124 journeys); the **51-journey scope** is a
*list*, because no honest predicate reproduces it. Both are applied by
`isPublicJourney`.

`isLibraryJourney` = public AND customer surface AND (sends OR routes to a
person) → `LIBRARY_JOURNEYS`, which is the 51.

## 3. The adapter

`src/lib/canonical-view.ts` (~800 lines) is the **only** bridge, and is
**server-only**. Client components take shaped props and import types only —
importing it from a `"use client"` file would ship all 286 graphs to the
browser.

Things in it this refactor touches:

- `nodeView()` — canonical node → `FlowNode` (`headline`, `detail`, `meta`,
  `edges`, `execution`, `exitClass`, `channelPriority`, `channelPlan`, …)
- `publicChannels()` — filters a journey's channels to the five customer
  channels; `sales`/`task` never reach a badge
- `externalTargetName()` — humanizes `external:sales-assignment`
- `splitExitState()` — cuts an exit state at its first real boundary
- `JOURNEY_ROWS` / `LIBRARY_ROWS` / `LIBRARY_COUNT` — computed once at module load
- `surfaceKeyOf()` — throws if an operational row reaches a public listing

## 4. Display graph + layout

`src/lib/journey-canvas-layout.ts` owns two things: the **display graph** and
the **ELK graph**. The canonical shape is never rewritten.

Five transforms, all generic, none branching on a journey id:

| transform | what it collapses |
|---|---|
| per-parent terminal instancing | a shared exit/handoff drawn once beside each branch (`x.converted@c.state`) |
| `collapsibleRouters` | a channel-selecting action into the send it selects for |
| `collapsibleGates` | a send-path permission gate whose short arm records why nothing was sent |
| `absorbableBookkeeping` | a pass-through internal action that writes only journal fields |
| `collapsibleWaitFollowers` | a wait into the one condition it exclusively feeds |

`representedSteps()` is the traceability half: every collapsed node is listed
in the detail panel under *Represented canonical steps*.

`SIZE` reserves a slot per kind; `sizeOf()` is the only content-aware sizing
(currently one case). **Measure card heights with the slot released to
`height: auto`** — the canvas is CSS-transformed, so `getBoundingClientRect`
returns zoomed values and will report every card as overflowing.

## 5. Renderer

| path | role |
|---|---|
| `src/components/JourneyCanvas.tsx` | the canvas island: pan/zoom, `JourneyWorld` (cards + edges), detail panel wiring. `"use client"` |
| `src/components/ui/JourneyCanvasNodes.tsx` | **the card kit** — one component per kind, `cardSummary()` text budget, `CARD_TEXT` labels |
| `src/components/ui/NodeDetailPanel.tsx` | the drawer; one panel renders any kind |
| `src/components/ui/JourneyMiniMap.tsx` | the card thumbnail — renders the *same* `JourneyWorld`, so preview and canvas cannot disagree |
| `src/components/ui/JourneyNodeFigure.tsx` | a single card, for documentation figures |
| `src/lib/journey-preview.ts` | topology thumbnail, consumes the same `CanvasLayout` |

Edge rendering, arrowheads and label chips live in `JourneyCanvas.tsx`; label
width is estimated by `estimatedLabelWidth` in the layout module — **two
literals in two files for one chip**, which is a known open item.

## 6. Detail page

`JourneyRoutes.tsx` exports both the metadata factory and the page component;
the two route files (`src/app/(en)/lab/journeys/[slug]`, `src/app/tr/...`) are
~15-line shells. A parallel `@modal` slot with an intercepting `(.)[slug]`
route overlays a modal on client-side navigation.

Page composition: `JourneyDetailShell` → `JourneyDetailHeader` (category,
title, purpose, **channel pills**, goal) → `JourneyInfo` / `JourneyDetailBody`
→ `JourneyCanvas`. Technical detail sits in a collapsible panel.

## 7. Localization

**No i18n library, no `dictionaries/`.** Two mechanisms:

1. `src/lib/content.ts` — one dictionary, `copy.en` / `copy.tr`, for UI chrome.
2. `src/lib/journey-tr-overrides.ts` — journey *content* in Turkish: a
   structural regex layer applied to every node, plus an `OVERRIDES` table
   keyed journey → node. `trHandoffHeadline` resolves a handoff's TR name;
   `EXTERNAL_TARGET_TR` names the nine out-of-corpus destinations.

Every page exists twice — `src/app/(en)/…` and `src/app/tr/…`, two independent
root layouts, **no shared `src/app/layout.tsx`**. Shipping a page in one locale
only is the default failure mode.

## 8. Sitemap, search, related

| path | note |
|---|---|
| `src/app/sitemap.ts` | hand-maintained `routes` array + `JOURNEY_ROWS`/`PRESET_ROWS` — journey routes derive, so scope changes need no edit here |
| `search/build-search-index.mjs` | filters on `surface !== operational` **and** `!excludedFromPublic`; duplicates the goal taxonomy by hand (plain Node cannot resolve `@/`) |
| `search/search-index*.json` | **generated, git-tracked** — a stale one is a visible diff |
| `src/app/api/search/route.ts` | must use **static JSON imports, never `fs`** — the file tracer cannot see a dynamic path |

Cross-journey links: every `href` a detail page builds goes through
`isPublicJourneyId`. A non-public target renders as **the target's name in
text**, never a link. 50 such references exist from the 51 — expected, not a
defect.

## 9. Validation

| command | what it gates |
|---|---|
| `npm run validate:canonical` | ~25 graph invariants. **Channels must be backed by an action, in both directions** — this is why `task` cannot simply be deleted from a journey that raises one |
| `node scripts/validate-public-scope.mjs` | 15 checks: the 51/22 partition, channel taxonomy, search/surface artifacts, no renderer hack, terminal states, bounded waits |
| `node audit/canvas-hygiene.mjs` | against a real render: no config key, no sequence number, no namespaced id, no silent message card |
| `node audit/guard-display.mjs` | against a real render: exits drawn, handoffs drawn, condition branches kept, canonical hashes unchanged |
| `node audit/measure-display.mjs` | display node counts, long cards, locale leaks |
| `npm run validate:journey-production` | production artifacts against frozen baselines |
| `npm run validate:seo` | title/description corpus |

**There is no test framework.** Correctness is these scripts plus the build.

## 10. Known-stale and known-open

- `CLAUDE.md` still says the library is 73 / 21 categories and the corpus is
  284 / 3690. Both are stale: the library is **51**, the corpus **286 / 3728**.
- `npm run lint` has **1 pre-existing error** in `src/components/ui/MobileNav.tsx:78`
  (`react-hooks/set-state-in-effect`), unrelated to this work, not build-failing.
- `SIZE.exit` is sized 68 but the worst Turkish exit wants 103 in a 200px slot —
  a partial fix, documented at the definition.
- Branch-label width is defined in two places with different values.
- `qa/journey-canvas/*` hardcodes Linux paths and port 4022; only
  `link-integrity.mjs` runs anywhere.

## 11. Risks for the remaining phases

1. **`validate:canonical`'s channel rule is bidirectional.** Any Phase 21 edit
   that adds or removes a communication action must move the journey's
   `channels` in the same commit, or the build fails.
2. **`journey-marketing.ts` throws at module load** if any of `ACQ-01`,
   `ACQ-09`, `ACT-12`, `CON-38`, `TIM-65` is removed. Two of those are in the 51.
3. **Handoff targets must exist.** A canonical deletion breaks the validator —
   which is why the 22 excluded journeys stay in `src/canonical/`.
4. **Generated files are git-tracked.** After any corpus change, regenerate the
   dump, the surface assignment, the search index and the audit manifest, or the
   diff carries a stale artifact.
5. **TR overrides are keyed by node id.** Renaming or adding canonical nodes
   silently drops their Turkish text back to English.
