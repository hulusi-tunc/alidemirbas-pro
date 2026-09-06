# Operational Workflows — archived corpus

**Status:** removed from the public website on 2026-09-05. **Intentionally preserved
for future reuse.** This is an archive, not a deletion: no Operational Workflows source
content was lost, and the live, authoritative source remains in the repository.

## What this corpus is

The Canonical Journey Library (`src/canonical/`) is one hand-authored graph of 284
lifecycle journeys. Each journey's *product surface* is derived, never authored, by the
rule in `src/canonical/surface.ts`: `mechanism` (runtime machinery), `customer`
(sends a message, or is a customer-worded silent state), and `operational` — everything
else: work items, decisions, documents, change sets, integrations, rollouts, incidents,
risk cases. The internal work a business does to keep a promise once it's made.

| | |
|---|---|
| Journeys | **124** (of 284 canonical) |
| Nodes | 1,605 (of 3,690) |
| Categories touched | 18 of 26 — three are *wholly* operational: `control`, `data`, `ownership` |
| Retired ids resolving into it | 3 — `CTL-239 → OWN-57`, `CTL-240 → OWN-54`, `RET-25 → RSK-192` |
| Inbound references from public journeys | 113 from 67 customer/mechanism journeys to 41 targets: 78 handoff edges (from 54 journeys to 23 targets) plus 35 `distinctFrom` cross-references |
| Orchestration rules naming an operational id | 3 |
| Public label | "Operations" (EN) / "Operasyon" (TR) |

## Original route

- Hub: `/lab/operational-workflows` and `/tr/lab/operational-workflows` — the fourth of the
  library's four surface pages, alongside `/lab/customer-journeys`, `/lab/lifecycle-states`,
  `/lab/runtime-mechanisms`.
- Detail pages: `/lab/journeys/<slug>` and `/tr/lab/journeys/<slug>` for each of the 124,
  plus the modal-intercepted `(.)[slug]` variant from the library list.
- Also reachable via: the journeys hub's "Operations" pills (hero, library spread, final
  band), the primary-surface split card, the gallery's surface link row, the sitemap, the
  search index (124 documents + 3 merged-id aliases), and cross-journey links from
  customer/mechanism detail pages (handoff edges, practitioner "stops when" handoffs,
  `distinctFrom` rows).

All of these are gone from the public site. Every URL above now 404s through the tree's
own `not-found.tsx`; none is in the sitemap or the search index; no built page links to
any of them (verified by scanning all 1,207 generated HTML files).

## Why it was removed from the public site

Product decision, 2026-09-05: the Operational Workflows surface is no longer part of the
public website. It is retained in full because the corpus is a real engineering asset
(see `research/operational-workflow-production-readiness/` for the production-readiness
audit that closed its P0s) and because it is structurally load-bearing for the customer
journeys that remain public — see the next section.

## Why the source files were NOT moved — and what "archived" means here

The 124 journeys cannot be physically detached from `src/canonical/` without corrupting
the journeys that stayed public:

- 54 customer and mechanism journeys **hand off into** operational journeys (78 handoff
  edges, 23 distinct targets — e.g. `ACQ-10 → DEC-181`, `FBK-46 → OWN-51`); counting the 35
  `distinctFrom` cross-references as well, 67 public journeys reference 41 operational ones. The canonical
  validator (`npm run validate:canonical`) requires every handoff target to exist.
- 3 orchestration rules and 3 merged-id redirects name operational ids.
- The records are interleaved across 18 of the 26 domain files; only 3 files are wholly
  operational.

So the archive is implemented **at the publishing boundary**: the canonical graph stays
whole as the engineering source of truth, and the website stops projecting one surface of
it. The single gate is `src/lib/public-corpus.ts` (`isPublicJourney` = "surface is not
`operational`"), read by everything public — rows and counts, static route params, the
sitemap, cross-journey link construction, and (via `production/surface-assignment.json`,
the validator-written projection of the same rule) the search-index builder.

Consequences that are by design:

- **Handoffs into archived journeys still render** on public detail pages — as the target's
  name and id in plain text, never as a link. The customer journey still says what it hands
  to; it just doesn't link into the archive.
- `npm run validate:canonical` still reports the full graph (284 journeys, 124 operational).
  That is correct: the canonical corpus is unchanged.
- `production/*.json` artifacts (`journey-view-model.json`, `journey-seo-metadata.json`,
  `journey-manifest.json`, `surface-assignment.json`, …) still describe all 284 and are
  still frozen by `npm run validate:journey-production`. They describe the canonical
  corpus, not the public projection. In particular `journey-seo-metadata.json` marks the
  124 as `sitemap: true` per the *canonical* SEO contract; the live sitemap excludes them
  via the public gate. This divergence is deliberate and documented rather than resolved by
  mutating a frozen baseline.

## How the data is structured

### `operational-workflows.json` — the corpus, verbatim

The primary artifact. Top level:

| Key | Contents |
|---|---|
| `records` | The 124 full canonical journey objects, byte-for-byte from `production/canonical-dump.json` (the validator-generated JSON projection of the TypeScript source). Every field: `id`, `slug`, `name`/`shortName`, `category`, `purpose`, `entity`, `channels`, `goal`, `guardrails`, `reusableRule`, `distinctFrom`, `competition`, `nodes` (the full graph — trigger/condition/wait/action/outcome/exit/handoff), and the vNext contract fields where present (`eligibility`, `suppressions`, `implementation`, `measurement`, `discovery`, …). |
| `surfaceAssignment` | The 124 rows from `production/surface-assignment.json`, each with the `reason` the rule placed it on this surface. |
| `sourceMap` | For every id: the authoritative TypeScript file under `src/canonical/` and the line of its `id:` field. **The TS literal in that file is the original format and the source of truth**; this JSON is its faithful export. |
| `viewModel` | The 124 records from `production/journey-view-model.json` (the production read model: identity, entry, graph, relationships, governance, derived). |
| `seoMetadata` | The 124 rows from `production/journey-seo-metadata.json`. |
| `mergedIdsResolvingHere` | The 3 retired-id contract records whose survivor is in this corpus. |
| `inboundReferencesFromPublicJourneys` | The 113 references (handoff nodes and `distinctFrom` entries) that public journeys still make into this corpus — the concrete reason the source could not be moved. |
| `surfaceRule` / `totals` | The rule text and the counts above. |

### `taxonomy/operational-work-type.ts`

The surface's own secondary discovery filter ("Type": reviews & decisions / account &
access / service & fulfillment / systems & reliability), a practitioner-facing grouping of
the 18 categories present. Moved here verbatim from `src/lib/` — it had exactly one
consumer, the gallery's Operations-only filter.

### `site-copy.json`

Every string `src/lib/content.ts` carried for the surface, EN and TR, verbatim: surface
label, blurb, page title and intro, the hub's "Operations" CTA, the Type filter's labels,
and the pre-archive wording of the two hub sentences that were reworded to stop describing
a surface that is no longer there.

### `routes/page.en.tsx`, `routes/page.tr.tsx`

The two deleted route shells (`src/app/(en)/lab/operational-workflows/page.tsx`,
`src/app/tr/lab/operational-workflows/page.tsx`), verbatim. They will not typecheck
against today's `SurfaceKey` — that is expected; `archive/` is excluded from `tsconfig.json`
and ESLint for exactly this reason (the same treatment the repo already gives `reference/`).

### `qa/qa-gate-fixture.operational.json`

The 19 entries of `qa/journey-canvas/qa-gate.mjs`'s 39-journey regression fixture that are
operational. The harness now lists them under `ARCHIVED_JOURNEYS` and only drives public
routes; the renderer still covers them through the env-gated `/qa-canvas-sweep/<id>` route
(`ENABLE_QA_CANVAS_SWEEP=1`), which reads the whole graph.

### Related material left in place (not duplicated here)

- `research/operational-workflow-production-readiness/` — the production-readiness audit,
  contracts and fixes applied to this corpus (2026-09-04). Research, never public.
- `research/journey-library-user-taxonomy-audit.md` — the audit that named the surface
  "Operations".
- `src/canonical/*.ts` — the authoritative source (see `sourceMap`).

## Restoring the surface to the public site

1. `src/lib/public-corpus.ts` — make `isPublicJourney` return `true` (or delete the module
   and its imports).
2. `src/lib/canonical-view.ts` — re-add `"operational-workflows"` to `SurfaceKey`,
   `SURFACE_KEYS`, `SURFACE_PATH`, `SURFACE_ROWS`, and the fallthrough in `surfaceKeyOf`.
3. `src/lib/content.ts` — restore the strings from `site-copy.json` (EN + TR).
4. Restore `routes/page.en.tsx` → `src/app/(en)/lab/operational-workflows/page.tsx` and
   `routes/page.tr.tsx` → `src/app/tr/lab/operational-workflows/page.tsx`; restore
   `taxonomy/operational-work-type.ts` → `src/lib/` and the gallery's Type filter.
5. `search/build-search-index.mjs` — drop the `publicJourneyIds` filter; rebuild the index
   (`node search/build-search-index.mjs`) and revert the four `expectedAbsent` fixtures in
   `search/search-query-fixtures.json` to their previous assertions (recorded in each
   fixture's `reason`).
6. `seo/canonical-contract.json` — fold `archivedAliases` back into `aliasBehavior`.
7. Rebuild. Nothing else knows the surface ever left.

## Inventory of the public-site removal (2026-09-05)

Removed from the public site: the hub route (EN + TR); 124 detail routes (EN + TR, page
and modal variants); 3 retired-id redirect routes whose survivors are archived
(`ret-25`, `ctl-239`, `ctl-240`); the surface from `SurfaceKey`/`SURFACE_PATH` and thus from
the gallery's surface switch, the hub's split card, and 3 hub CTA pills; 124 search
documents and 3 merged-id search aliases; all sitemap entries; every cross-journey link
into the corpus (handoff edges, practitioner handoffs, `distinctFrom`); the Operations-only
"Type" filter; and the EN/TR copy for all of the above. Public counts changed from 284
journeys / 26 categories to 160 / 23.
