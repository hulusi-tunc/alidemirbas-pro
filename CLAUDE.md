# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Commands

```bash
npm run dev                 # next dev on :3000 (see .claude/launch.json)
npm run build               # plain `next build` — no prebuild hook, no validator runs
npm run lint                # eslint; 1 pre-existing ERROR (MobileNav.tsx:78) + 27 warnings
npx tsc --noEmit            # typecheck; currently clean
```

There is **no test framework**. Correctness is enforced by validator scripts, and by
Playwright/Puppeteer QA harnesses that are not wired into CI. Only four validators are npm
scripts; the rest must be run by hand with `node`:

```bash
npm run validate:canonical            # journey graph invariants + vNext rules — the real gate for src/canonical/
node scripts/surface-assignment.mjs   # production/surface-assignment.json (customer / mechanism / operational)
node scripts/build-event-registry.mjs # regenerates src/canonical/events.ts from scripts/event-curation.json
# RETIRED (2026-09-21) - these three write retired snapshots that NOTHING reads.
# They refuse to write without --retired-regenerate. Their numbers (135 customer
# journeys / 68 communicating) are deliberately NOT kept in step with the corpus,
# and no validation expects them to match 69/90/303. audit/retired-artifacts.md.
node scripts/vnext-readiness.mjs [out] # RETIRED - VNEXT_CUSTOMER_READINESS.json
node scripts/vnext-recipes.mjs        # RETIRED - production/vnext-recipes.md
node scripts/vnext-changelog.mjs      # RETIRED - VNEXT_MIGRATION_CHANGELOG.md
npm run dump:canonical                # regenerates production/canonical-dump.json
npm run validate:journey-production   # asserts production/ artifacts against frozen baselines
npm run validate:seo                  # title/description corpus + cannibalization clustering

node scripts/sunset-suppression-evidence.mjs  # every promotional/lifecycle journey
                                      # READS the sender-side suppression CON-300 writes.
                                      # Exits 1 if a new one does not - which is the whole
                                      # point: a cross-journey state is only enforced where
                                      # the journeys it binds read it, and CON-300 shipped
                                      # once with a writer and no readers at all.
node scripts/validate-public-scope.mjs # 15 checks: the 69/21 partition, channel taxonomy, search
                                      # and surface artifacts free of excluded ids, no renderer
                                      # hack, every journey terminal, every wait bounded

node seo/seo-validator.mjs            # 20 SEO contract checks
node search/search-validator.mjs      # 34 checks — REBUILDS the 6 search index files as a side effect
node search/build-search-index.mjs    # rebuild search index only
node search/run-query-fixtures.mjs    # query relevance fixtures
node production/calculators/validate-calculators.mjs
node production/calculators/validate-calculator-content.mjs
node production/calculators/validate-calculator-seo.mjs
node production/calculators/test-calculators.mjs
```

Three gates run against a REAL RENDER rather than against source, so they need
`npm run build && npx next start -p 4511` first. They are the only things that prove a display
rule reaches the page:

```bash
node audit/guard-display.mjs 4511     # G1 exits drawn · G2 handoffs drawn · G3 condition branches
                                      # kept · G4 canonical hashes unchanged · G5 some ending is
                                      # drawn · G6 a hidden condition matches the one gate shape
node audit/canvas-hygiene.mjs 4511    # no config key · no sequence number · no namespaced id ·
                                      # no silent message card, on every card in both locales
node audit/measure-display.mjs after 4511   # display node counts, long cards, LOCALE LEAKS
node audit/locale-sweep.mjs 4511      # English prose on every PUBLIC TR ROUTE — /tr, /tr/lab,
                                      # the library landing page, the three surfaces and every
                                      # journey detail page (derived from sitemap.xml). Plain
                                      # `fetch`, no puppeteer, seconds not minutes. Same detector
                                      # as measure-display (2+ distinct English function words in
                                      # one text node), but over the WHOLE page rather than
                                      # `[data-canvas-node-id]` — which is how the TR journey
                                      # library landing page and all three surface galleries
                                      # shipped English prose with every gate green. Prints
                                      # `route | text`, exits non-zero on any finding. Its
                                      # allowlist and its two reported-not-failed exclusions (the
                                      # Info tiles' canonical fields, the practitioner `<details>`)
                                      # are explained in `audit/locale-sweep-notes.md`.
node audit/preset-locale.mjs [port]   # Turkish for every PRACTITIONER PRESET (canonical
                                      # `discovery.presets`; 8 today). The sweep above CANNOT
                                      # see these: a two-word chip ("Browse Abandonment") never
                                      # reaches its two-function-word threshold, and the
                                      # `applicableWhen` sentence is a `discovery` field, which
                                      # it reports as the known Info-tab gap rather than failing
                                      # on. So this one compares the PAGE AGAINST THE SOURCE
                                      # DATA instead of sniffing for English-looking words: every
                                      # preset in production/canonical-dump.json must have an
                                      # entry in `PRESET_TR` (src/lib/journey-tr-overrides.ts,
                                      # closed in both directions), and with a port it also
                                      # asserts the rendered TR routes carry the Turkish and not
                                      # the English, the gallery's RSC props carry it too (its
                                      # preset cards are client-rendered), and the EN routes are
                                      # untouched. Data-only without a port. Notes and before/
                                      # after evidence: `audit/preset-localization-notes.md`.
```

**Run `audit/guard-display.mjs` BEFORE `audit/build-manifest.mjs`.** The manifest rewrites
`audit/canonical-baseline.json`, which is exactly what G4 compares against — run it first and G4
compares the new corpus to a baseline built from the new corpus, reporting "no drift" whatever
changed. `audit/checkpoint.md` carries the full ordered loop and an order-independent cross-check.

**Known-failing today, from pre-existing drift — not from your change:**

- `node seo/seo-validator.mjs` fails check 14. It expects `43` calculator content files; there
  are `19`, matching the 19 live slugs.
- `node search/search-validator.mjs` fails checks 30 and 31, and `node search/run-query-fixtures.mjs`
  fails 9 fixtures. All of them expect calculator documents (MDE, CTOR, cart-abandonment, ...) that
  left the live catalog when it went from 43 to 19; the index is rebuilt from the 19 live files.
  (Four fixtures — `CTL-239`, `CTL-240`, `RET-25`, `risk signal correlation` — are `expectedAbsent`
  assertions since the Operational Workflows archive: the archived journey must NOT surface. They
  pass; they are not among the 9.)
- `production/build_seo_metadata.py` needs the A/B canon from another repository; it falls back to
  `src/data/ab-tests.json` for ids. **Do not run it to "fix" the drift.**
  `production/journey-seo-metadata.json` holds 286 journey records against a 303 corpus, and
  `validate:seo`'s check 2 asserts exactly 286 - so the file and its validator agree and the gate
  is green. Regenerating it makes check 2 fail. It is a frozen audit dataset that nothing in
  `src/` imports, kept deliberately: `audit/retired-artifacts.md` records the consumer audit and
  the three ways forward.

`npm run validate:canonical`, `npm run validate:journey-production` and `npm run validate:seo`
pass. Re-run a validator before and after your change so you can tell your failures from the
inherited ones.

## Architecture

### Every page exists twice — there is no `[lang]` segment

`src/app/(en)/<path>/page.tsx` and `src/app/tr/<path>/page.tsx` are duplicated folders with two
independent root layouts and **no shared `src/app/layout.tsx`**. Each tree declares its own
`<html lang>` at build time, which is what keeps the site free of the dynamic `headers()` API
and fully prerenderable. Shipping a page in one locale only is the default failure mode here.

Both page files are thin wrappers — a `metadata` export plus a shared component from
`src/components/` taking a `lang: Lang` prop. All copy lives in one dictionary,
`src/lib/content.ts` (~1650 lines, `copy.en` / `copy.tr`); there is no i18n library and no
`dictionaries/` folder.

Dynamic routes keep the two locales in lockstep through a shared `*Routes.tsx` module that
exports both a metadata factory and a page component — `CalculatorRoutes.tsx`,
`JourneyRoutes.tsx`, `AbTestRoutes.tsx`. The route files stay ~15-line shells.

**Adding a bilingual page:** shared component in `src/components/` → `en`/`tr` keys in
`copy` → both route files with `alternates: pageAlternates("/<path>", lang)` → add the path to
the hand-maintained `routes` array in `src/app/sitemap.ts`.

Three routes are EN-only by design: `experiment-a`, `experiment-b`, `qa-canvas-sweep/[id]`.
`blog/[slug]` used to be a fourth (`src/lib/blog.ts`'s `getAllBlogPosts` returned `[]` for any
non-`en` lang) until every post got a real `tr` translation (`blog-posts.ts`'s per-post `tr`
field) and its own `src/app/tr/blog/[slug]/page.tsx` route.

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
Currently 303 journeys / 3959 nodes / 8 merged (retired) ids.

**vNext (Customer Journeys).** Every customer-surface journey carries the vNext contract
(`eligibility`, `suppressions`, `implementation`, `measurement`, `discovery`; communicating ones
also `contact`, `channelStrategy`, `orchestration`). The presence of `measurement` is the
migration marker and turns the vNext validator rules from warnings into errors for that
journey. Waits carry a `Config` (`required: true`, or a default with `confidence` and an honest
`basis`), `until` values are registry ids from the generated `src/canonical/events.ts`, and every
exit has a `class`. Warnings on vNext journeys must be fixed or recorded in
`production/vnext-warning-reviews.json`; the validator counts unreviewed ones. Product
surfaces are read per journey by `src/canonical/surface.ts` (customer journeys / lifecycle
states / runtime mechanisms / operational workflows) and rendered by `SURFACE_ROWS` in
`src/lib/canonical-view.ts`; presets (`discovery.presets`) are their own URLs under
`/lab/journeys/<preset-id>` and open the parent's practitioner view (`src/lib/practitioner-view.ts`).
See `JOURNEY_VNEXT_ARCHITECTURE.md`, `ARCHITECTURE_PATCH_0_5.md` and `VNEXT_MIGRATION_REPORT.md`.

Data flows **`src/canonical/index.ts` → `src/lib/canonical-view.ts` → pages**. That adapter is the
only bridge and it is **server-only**: `JOURNEY_ROWS` and the preview thumbnails are computed
once at module load. Importing `@/canonical` or `@/lib/canonical-view` from a `"use client"`
file ships all 303 journey graphs (3959 nodes) to the browser — client components take shaped props and import
only *types*. The canvas layout engine is ELK (`elkjs`, `src/lib/journey-canvas-layout.ts`):
asynchronous and server-only - `layoutJourneyCanvas()` runs in async server components and
the client `JourneyCanvas` takes the finished `layout` as a prop; `canonical-view.ts` awaits
it at module load for the thumbnails (top-level await, so a plain `tsx` run of that module
needs an ESM bundle). It lays out a DISPLAY graph in which a shared exit/handoff is drawn once
per parent (`x.converted@c.state`, keyed by `layoutId`, opened by `canonicalNodeId`); the
canonical graph is untouched. `journey-preview.ts` consumes the same `CanvasLayout` so a card
thumbnail and its detail canvas can never disagree; do not add a second layout engine.

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
sitemap. `src/lib/journey-marketing.ts` hard-references 5 journey ids (the featured `ACQ-01` plus 4 showcase
cards) and **throws at module load** if any is removed. Three of the five (`ACQ-01`, `CON-38`, `TIM-65`)
are public but are silent lifecycle states, not library journeys.

**The public site projects THREE of the four surfaces (since 2026-09-05).** The Operational
Workflows surface (`/lab/operational-workflows`, 124 journeys) was removed from the public
website and archived under `archive/operational-workflows/` — read its README before touching
anything surface-related. The canonical graph's operational half is UNCHANGED (`validate:canonical`
still reports `operational 124`) because 54 public journeys hand off into operational ones (78 handoff
edges to 23 targets; 67 public journeys reference 41 of them once `distinctFrom` rows are counted) and
the validator requires every handoff target to exist. The archive is enforced at the publishing
boundary by one predicate, `src/lib/public-corpus.ts` (`isPublicJourney` = surface is not
`operational`): `JOURNEY_ROWS`, `ALL_DETAIL_SLUGS`, `MERGED_REDIRECTS` (5 of 8 — the 3 whose
survivor is archived are not public routes), the sitemap, and every cross-journey `href` the
detail pages build all read it.

**The library's stated size is 69 journeys / 18 categories** (product decision, 2026-09-20 —
`audit/public-journey-scope.md`; the seventeen additions of Phases 25–33 took it 52 → 69,
id map in `audit/new-journey-id-map.md`, per-batch notes in `audit/batch-{b,c,d}-notes.md`). This is a SECOND gate stacked on the Operational Workflows
archive, and it is a different KIND of gate: the archive is a rule (`surface !== operational`)
because it follows from facts a journey states about itself, while these 21 are excluded because
of what the product is for. So `EXCLUDED_FROM_PUBLIC` is an explicit id list in
`public-corpus.ts`, asserted at module load against the derived library — a canonical edit that
moves a journey across the surface line fails the build with the ids named rather than quietly
publishing 68 or 70.
`LIBRARY_JOURNEYS` (`public-corpus.ts`, `isLibraryJourney` = public AND customer AND sends-or-routes-
to-a-person) feeds `LIBRARY_COUNT`/`LIBRARY_CATEGORY_COUNT`/`LIBRARY_ROWS` in `canonical-view.ts`,
`withLibraryCount()` (the only `{count}`/`{categories}` filler — it THROWS on a `{rules}` token; no
public page states a rule count), and `journey-marketing.ts`'s `JOURNEY_SCALE`/category counts. The
158 public journeys are still routed, and the two supporting surfaces state their own counts on their
own pages (64 lifecycle states, 25 runtime mechanisms) — but a headline, project card, metadata
description or stat strip that says "the library" means 69/18. Never type a corpus number into copy;
`lab.page.intro` is a template shipped as a client prop and is not rendered by the gallery.
A handoff into an archived journey renders as the target's name in text, never a link.
`search/build-search-index.mjs` applies the same rule through `production/surface-assignment.json`.
`surfaceKeyOf` throws if an operational row ever reaches a public listing. `archive/` is excluded
from `tsconfig.json` and ESLint (same treatment as `reference/`) so its verbatim route snapshots
stay byte-for-byte.

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

`src/app/globals.css` is a ~1650-line design constitution — a Tailwind v4 `@theme` block holding
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
validators themselves. `archive/` is preserved-but-retired repository content (currently the
Operational Workflows corpus): a verbatim export plus the removed route shells, taxonomy and copy,
with a README explaining structure and restoration. Nothing in the build imports from it. Several validators and the search index generator **hardcode corpus
counts** (`211` ab-tests, `303` journeys, `3959` nodes, `8` merged ids, `43` calculators, `5` blog posts,
and `seo/seo-validator.mjs` check 18's journey view-model length), so
adding a record fails them until those constants are updated in lockstep. Those `303`/`8` are the
CANONICAL corpus and stay correct after the Operational Workflows archive; the PUBLIC corpus is
158 routed journeys / 5 public merged redirects, and the stated LIBRARY is 69 journeys / 18
categories. The 69 is the one number here that is NOT derived — it is the id list above — but it is
never typed into copy either: pages read `LIBRARY_COUNT`, and the list and the derived library are
asserted equal at module load. `search/build-search-index.mjs` derives the same 69/18 for the
library's lab-product card from `production/surface-assignment.json`, whose rows carry
`excludedFromPublic` so every plain-Node script drops the same 21. That flag has to be in the
filter: leaving it out is how the card came to advertise 82/21 on a public page. `build-search-index.mjs`
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
