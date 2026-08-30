# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Commands

```bash
npm run dev                 # next dev on :3000 (see .claude/launch.json)
npm run build               # plain `next build` — no prebuild hook, no validator runs
npm run lint                # eslint; 6 pre-existing warnings in production/, 0 errors
npx tsc --noEmit            # typecheck; currently clean
```

There is **no test framework**. Correctness is enforced by validator scripts, and by
Playwright/Puppeteer QA harnesses that are not wired into CI. Only four validators are npm
scripts; the rest must be run by hand with `node`:

```bash
npm run validate:canonical            # journey graph invariants — the real gate for src/canonical/
npm run dump:canonical                # regenerates production/canonical-dump.json
npm run validate:journey-production   # asserts production/ artifacts against frozen baselines
npm run validate:seo                  # title/description corpus + cannibalization clustering

node seo/seo-validator.mjs            # 20 SEO contract checks
node search/search-validator.mjs      # 34 checks — REBUILDS the 6 search index files as a side effect
node search/build-search-index.mjs    # rebuild search index only
node search/run-query-fixtures.mjs    # query relevance fixtures
node production/calculators/validate-calculators.mjs
node production/calculators/validate-calculator-content.mjs
node production/calculators/validate-calculator-seo.mjs
node production/calculators/test-calculators.mjs
```

**Known-failing today, from pre-existing drift — not from your change:**

- `npm run validate:journey-production` fails checks 1 and 30. They hardcode `255` journeys /
  `3186` nodes, but the live library is `281` / `3524`. Baselines live at
  `production/validate-journey-production.mjs:34` and `:251-262` and are edited by hand.
- `node seo/seo-validator.mjs` fails check 14. It expects `43` calculator content files; there
  are `19`, matching the 19 live slugs.

`npm run validate:canonical` and `npm run validate:seo` pass. Re-run a validator before and
after your change so you can tell your failures from the inherited ones.

## Architecture

### Every page exists twice — there is no `[lang]` segment

`src/app/(en)/<path>/page.tsx` and `src/app/tr/<path>/page.tsx` are duplicated folders with two
independent root layouts and **no shared `src/app/layout.tsx`**. Each tree declares its own
`<html lang>` at build time, which is what keeps the site free of the dynamic `headers()` API
and fully prerenderable. Shipping a page in one locale only is the default failure mode here.

Both page files are thin wrappers — a `metadata` export plus a shared component from
`src/components/` taking a `lang: Lang` prop. All copy lives in one dictionary,
`src/lib/content.ts` (1200 lines, `copy.en` / `copy.tr`); there is no i18n library and no
`dictionaries/` folder.

Dynamic routes keep the two locales in lockstep through a shared `*Routes.tsx` module that
exports both a metadata factory and a page component — `CalculatorRoutes.tsx`,
`JourneyRoutes.tsx`, `AbTestRoutes.tsx`. The route files stay ~15-line shells.

**Adding a bilingual page:** shared component in `src/components/` → `en`/`tr` keys in
`copy` → both route files with `alternates: pageAlternates("/<path>", lang)` → add the path to
the hand-maintained `routes` array in `src/app/sitemap.ts`.

Four routes are EN-only by design: `blog/[slug]`, `experiment-a`, `experiment-b`,
`qa-canvas-sweep/[id]`. `src/lib/blog.ts` returns `[]` for any non-`en` lang.

### Invariants that look like bugs and are not

- **`[...catchall]/page.tsx` in both trees just calls `notFound()`.** With two root layouts there
  is no app-root fallback, so an unmatched URL would render Next's generic 404 instead of the
  tree's own locale-correct `not-found.tsx`. The catch-all makes "unknown path" a real match.
- **The site is `noindex` sitewide** (`robots: { index: false, follow: false }` in both root
  layouts) while `src/app/robots.ts` deliberately *allows* crawling. A crawler must fetch a page
  to read its noindex tag. Do not "fix" this by adding a `Disallow`.
- **Every route must prerender.** After `next build` every route should be `○` or `●`. The only
  legitimate `ƒ` entries are the two `[...catchall]` routes and `/qa-canvas-sweep/[id]`.
- **`src/lib/seo.ts` is 22 lines and owns every canonical and hreflang pair.** `pageAlternates`
  takes the **EN path, no trailing slash** (`""` for home); the `/tr` twin is derived.

### Canonical journey library — the largest subsystem

`src/canonical/` is **hand-authored TypeScript**: `types.ts` plus 26 flat domain files, each
exporting exactly `<DOMAIN>_JOURNEYS` and `<DOMAIN>_RULES`, aggregated by `index.ts`. A journey
is a **graph, not a sequence** — an `entry` node plus nodes that name their own successors.
Currently 281 journeys / 3524 nodes / 5 merged (retired) ids.

Data flows **`src/canonical/index.ts` → `src/lib/canonical-view.ts` → pages**. That adapter is the
only bridge and it is **server-only**: `JOURNEY_ROWS` and the preview thumbnails are computed
once at module load. Importing `@/canonical` or `@/lib/canonical-view` from a `"use client"`
file ships 281 node graphs to the browser — client components take shaped props and import
only *types*. `journey-preview.ts` deliberately reuses `layoutJourneyCanvas` from
`journey-canvas-layout.ts` so a card thumbnail and its detail canvas can never disagree; do not
add a second layout engine.

`npm run validate:canonical` parses those `.ts` files **as text** and evals the literals — it
never sees your types. So keep `export const <DOMAIN>_JOURNEYS = [...]` at top level, and
register any new domain file in the `FILES` array of **both** `scripts/validate-canonical.mjs`
and `scripts/dump-canonical.mjs`. It enforces roughly 25 hard invariants: exactly one trigger
which must equal `entry`, every node reachable, at least one reachable exit-or-handoff, every
condition ≥ 2 branches, every wait with timeout and explicit `windowExtendsOnEngagement`, every
exit with `reEntry`, and `channels` that must be *backed* by an action carrying
`execution: "communication" | "human"` — it errors in both directions.

Merged ids are addressable but are not journeys: they get a slug, render the survivor's detail,
are forced `noindex` with a canonical pointing at the survivor, and are excluded from the
sitemap. `src/lib/journey-marketing.ts` hard-references 6 journey ids and **throws at module
load** if any is removed.

The `/lab/journeys` routes use a parallel `@modal` slot with an intercepting `(.)[slug]` route:
a client-side navigation from the list overlays a modal, while a hard load of the same URL falls
through to the full page (`@modal/default.tsx` returns `null`). Both shapes are built from the
same `resolveDetailSlug()` result.

### Calculators are registered in six places

A calculator slug must be added to all of: the spec tuples in
`production/calculators/_generate-catalog.mjs` (then regenerate — never hand-edit
`calculator-catalog.json`); `LIVE_CALCULATOR_SLUGS` **and** `LIBRARY_GROUP` in
`src/lib/calc-catalog.ts` (a missing group silently falls back to `revenue-unit-economics`);
`REGISTRY` in `src/lib/calc-registry.ts`; a content JSON at
`production/calculators/content/{slug}.json`; the static import map `CONTENT_BY_SLUG` in
`src/lib/calc-content.ts`; and the hand-mirrored slug lists in the two calculator validators.
Routes and the sitemap need no change — both derive from `ALL_TOOL_SLUGS`.

Calculator **UI** is bilingual but the **editorial content is EN-only** — `getContent(slug, "tr")`
returns `undefined` and the TR page falls back to English prose inside a Turkish shell.

### Where content actually lives

No MDX anywhere. Blog posts are a TS array in `src/lib/blog-posts.ts` (5, EN-only). A/B tests are
a frozen 211-record `src/data/ab-tests.json` owned by an upstream repo, read through three
server-only view models. Lab/skill projects are authored **only** in `copy[lang].lab.projects` in
`src/lib/content.ts`; `src/lib/skill-catalog.ts` is a typed accessor that adds no content.

### Design tokens

`src/app/globals.css` is a ~1380-line design constitution — a Tailwind v4 `@theme` block holding
the neutral/ink/primary ramps, the type ramp, the radius scale, and motion durations, each with
the reasoning written inline. Read the comment before changing a token; several are guardrails
(`--font-serif` is aliased to the sans so the `font-serif` utility cannot produce a serif).
Per `AGENTS.md`, design work loads the `ali-web-design` skill first, never restyles
`SiteHeader`/`SiteFooter` as part of a page change, and never puts a fabricated number on a page.

## Generated vs authored

`src/` is the only runtime source of truth. **Nothing in `src/` imports `seo/*.json` or
`production/*seo-metadata.json`** — those are audit artifacts, so editing a contract JSON changes
nothing that ships.

Generated and git-tracked (a stale artifact shows up as a visible diff):
`production/canonical-dump.json` (`npm run dump:canonical`); the `production/journey-*.json`
model, built by the Python scripts in `production/` which must be run **with `production/` as the
working directory**; the six `search/search-index*.json` / `search-facets` / `search-relations` /
`search-aliases` files (`node search/build-search-index.mjs`); and the `*-report.json` files the
validators write.

Hand-authored: everything in `src/`, every contract JSON in `seo/` and `search/`, and the
validators themselves. Several validators and the search index generator **hardcode corpus
counts** (`211` ab-tests, `255` journeys, `43` calculators, `5` blog posts, `520` search docs), so
adding a record fails them until those constants are updated in lockstep. `build-search-index.mjs`
also duplicates the goal taxonomy from `src/lib/journey-taxonomy.ts` by hand — plain Node cannot
resolve the `@/` alias, and the copy must be kept in sync manually.

Rebuild the search index after any corpus change. `src/app/api/search/route.ts` must consume it
via **static JSON imports, never `fs` reads** — Next's file tracer cannot see through a
dynamically built path, so an `fs` read is not included in the Vercel serverless bundle.

## QA harnesses

`qa/journey-canvas/*` uses **Playwright via hardcoded absolute Linux paths**
(`/opt/node22/...`, `/opt/pw-browsers/chromium`) and expects the app on **port 4022**. Those paths
do not exist on macOS and Playwright is not in `node_modules` — only `puppeteer-core` is. Editing
the two constants is a prerequisite for running them here. `link-integrity.mjs` is pure data and
runs anywhere.

```bash
npm run build && npx next start -p 4022
node qa/journey-canvas/qa-gate.mjs          # fast 19-check gate over a 39-journey fixture

ENABLE_QA_CANVAS_SWEEP=1 npx next start -p 4022   # required for the sweep + perf scripts
node qa/journey-canvas/full-sweep-255.mjs   # ~15-20 min, pre-ship only
```

The env flag gates `/qa-canvas-sweep/[id]` and is checked against the literal string `"1"`.
Reports are written to `/tmp/`. `scripts/shot.mjs` is separate: puppeteer-core against the local
Chrome app, `OUT=<dir> node scripts/shot.mjs [url]`, defaulting to port **5182**. Three workflows,
three different ports (dev 3000, shots 5182, journey QA 4022).

## Root-level markdown

The many capitalized `.md` files at the repo root (`DESIGN-MIGRATION-PLAN.md`, `EXPERIMENT-1.md`,
`*-HANDOFF.md`, `*-AUDIT.md`) are design handoffs, audits and frozen experiment dossiers. Most
state explicitly that nothing was implemented. Treat them as background, not as a spec to follow,
unless the current task references one.
