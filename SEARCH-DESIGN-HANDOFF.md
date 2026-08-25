# Search / Discovery Design Handoff

Semantic and behavioral requirements only — no pixels, no layout, no component names. The `search/` data and logic layer is design-ready; this is what a designer/implementer needs to know before drawing or building anything. Every claim below is backed by a file in `search/` (or `seo/`) that carries the full real numbers and reasoning — this document summarizes, it doesn't replace them.

## DATA AVAILABLE

Five real result types, 520 searchable documents total (see `search/search-coverage-report.json` for the full source-vs-searchable audit):

| Type | Searchable count | Source of truth |
|---|---|---|
| `calculator` | 43 (of 77 full catalog — 34 not yet live) | `production/calculators/content/*.json` |
| `ab-test` | 211 | `src/data/ab-tests.json` |
| `journey` | 255 (of 260 — 5 merged/retired ids resolve via alias to a survivor, never their own document) | `production/journey-view-model.json` |
| `lab-product` | 6 (3 link on-site, 3 link off-site) | `src/lib/content.ts` |
| `blog-article` | 5 | `src/lib/blog-posts.ts` |

Every document guarantees `title`, `summary` (1-2 sentences), `type`, `url`, `canonical` — see `search/search-document.schema.json` / `search-document.types.ts` for the full contract. Type-specific fields beyond that (never forced onto types they don't apply to — Part 2's "no forced universal fields"): `metric` (calculator/ab-test), `surface` (ab-test only), `journeyRelationRefs` (journey only — see RELATED CONTENT below). A card never needs `searchText` (internal matching field, not display copy, up to 2000 chars).

16 document-level **aliases** (`search/search-aliases.json`) — guaranteed 1:1 name variants (e.g. "customer acquisition cost" → the CAC calculator, or a retired journey id → its survivor), every one source-derived and disclosed with its provenance. 8 corpus/type-scoped **synonyms** (`search/search-synonyms.json`) — softer, potentially-not-identical equivalences (e.g. CTR ↔ "Click-Through Rate"), kept deliberately separate from aliases; 7 candidate pairs were tested and explicitly rejected (e.g. MRR ≠ ARR) rather than silently assumed.

**Related content**: `search/search-relations.json` gives every calculator (43/43) and blog post (5/5) full, explicit, source-backed related items already. Journeys got a real upgrade this round — `journeyRelationRefs` (handoffs + distinctFrom, sourced from journey-view-model.json's own `relationships` field) now covers 89% of journeys (227/255) with real "what happens next" edges — prepared, available data, **not yet wired into a published "Related Journeys" recommendation** (see `search/search-related-content-readiness-report.json`). Ab-tests have no explicit relatedness source field in `src/data/ab-tests.json` — only shared-category matching (104/211), a real source-data limitation, not a missing SearchDocument field.

## SEARCH BEHAVIOR

Query normalization (`search/query-normalization-contract.json`, fully tested, not just specified): lowercase, NFD-diacritic-strip, punctuation/slash/hyphen all become token breaks, Turkish `ı` gets an explicit ASCII fold (the other 5 Turkish letters already fold via standard Unicode decomposition — verified empirically, not assumed). `"DAU/MAU"`, `"DAU-MAU"`, `"dau mau"` all tokenize identically. `"check-out"` does **not** automatically match `"checkout"` — a disclosed, zero-real-impact gap, not silently wrong.

Alias resolution happens before ranking — a query matching an alias string resolves straight to its one target document (`aliasResolved` in the search() response), never producing a duplicate/competing result.

## RANKING

Deterministic, IDF-weighted scoring (`search/search-ranking-contract.json` + `search/headless-search-prototype.mjs`) — tested against the real 520-document corpus, not just written theoretically. A generic token that appears on many documents (e.g. "calculator", or a KPI label like "CTA" shared by dozens of ab-tests) is dampened relative to a rare, specific one — this was a real bug fixed this round: `metric`-field matches weren't IDF-dampened like title/keyword matches, letting a generic shared KPI-label token outrank a document whose own text was a near-verbatim match. Fixed and re-verified.

Content-type balancing prevents one type from silently taking all 10 top slots on a genuinely cross-corpus query, without forcing diversity where none honestly exists (verified: "pricing" and "onboarding" have zero real cross-type matches in this corpus — an all-one-type result there is the correct, honest answer).

**70 ranking fixtures** (`search/search-query-fixtures.json`) across exact-title, acronym, broad-concept, find-example/find-journey, metric/synonym-expansion, surface, mixed-intent, merged-journey-id, lab-product, blog, **tr-query**, **partial-word**, and **ambiguous-query** categories — 67 pass, 3 are disclosed, tested known gaps (no fuzzy/typo matching implemented by design; prefix-matching only anchors at the start of a title string). One finding disclosed rather than hidden: a Turkish-language query whose exact answer document has an English title still loses some ranking ground to generic same-token matches — narrowed by this round's IDF fix, not fully eliminated; see that fixture's own `reason` field for the full analysis.

## FILTERS

9 real facet dimensions with computed counts (`search/search-facets.json`): `type`, `normalizedCategory`, `surface`, `funnelStage`, `businessObjective`, `metric`, `tags`, plus each corpus's own native `category`. **Semantics** (`search/search-facet-combination-contract.json`): OR within one facet, AND across different facets — the standard convention. Most facet dimensions are single-valued per document; `metric` and `tags` are genuinely multi-valued (up to 5 and 11 values on one document respectively) and still use OR-within-facet by default.

**Zero-result combinations are real and common** — computed directly: 38/55 type×normalizedCategory pairs, 56/70 type×surface pairs, 17/25 type×funnelStage pairs, and 74/105 type×businessObjective pairs are genuinely zero (e.g. `surface` is almost entirely ab-test-only). The data-layer recommendation is **contextual/dynamic facet counts** — recompute each facet's available values against the currently-filtered set, not the full 520-document corpus, so a filter combination that would return 0 is never presented as freely selectable. `businessObjective`'s `review-required` bucket is ~42% of all documents (the taxonomy was built for journeys, not ab-test/calculator titles) — don't design this facet assuming even distribution.

## RESULT MODES

Both "ranked" (one flat relevance-ordered list) and "grouped" (partitioned by type, each group internally keeping its own relevance order, group order = order of first appearance in the ranked list) are mechanical projections of the exact same `search()` output — see `search/search-result-modes-contract.json`. Neither re-ranks anything; picking one over the other (or offering both) is a free design choice with zero data cost either way.

## STATES

Six distinct states, each with a deterministic trigger condition (`search/search-empty-states-contract.json`) — not one generic "no results":

1. **Empty query** — nothing typed yet, distinct from a search that returned nothing.
2. **No results** — a valid query, zero matches (real example: "calclator", "joruney" typos).
3. **Filtered no results** — the unfiltered query has matches, the active filter combination doesn't (see FILTERS above).
4. **Partial results** — an alias resolved the query to a different document than literally typed (e.g. a merged journey id) — a disclosure state, not an apology state; `search()`'s own `aliasResolved` field flags it directly.
5. **Invalid query** — pure punctuation or a query that normalizes to zero tokens.
6. **Very broad query** — hits the result cap with more than 6-of-one-type in the top 10 (e.g. "conversion", "checkout").

Any optional suggestion content for these states must come from real, deterministic, already-indexed data — never fabricated at runtime by an LLM or any non-deterministic process. Where no safe source exists, showing nothing is the correct, honest fallback.

## ACCESSIBILITY

Standard WAI-ARIA Combobox-with-Listbox pattern (`search/search-accessibility-contract.json`) — not invented for this project. Focus moves to the input on open, returns to the trigger element on close (the most commonly-missed requirement for overlay search UIs). Arrow keys move `aria-activedescendant`, not real DOM focus, so typing keeps working while browsing results. Escape clears the query on first press, closes on the second (or first, if already empty). A live region announces result count and each of the 6 STATES above with distinct wording. Every facet control must be independently keyboard-reachable — none of this is implementation-specific.

## ANALYTICS

6 events, GA4/GTM-shaped, contract only — no implementation exists yet anywhere in this codebase (verified: zero gtag/dataLayer/GTM references in `src/`): `site_search_open`, `site_search`, `site_search_result_click`, `site_search_filter`, `site_search_no_results`, `site_search_close` — full parameter list in `search/search-analytics-contract.json`. **Privacy finding**: raw typed query text can contain PII (a user's own name, etc.) even though the corpus itself has none — the contract recommends sending the already-computed **normalized** query string instead of the raw one, which preserves the real analytical value (finding corpus/synonym gaps) while removing capitalization/spacing that could make a query identifiable, at zero extra engineering cost (the pipeline already computes it).

## PERFORMANCE

Real, measured numbers, not estimates (`search/search-performance-report.json`): `search-index.json` (full, 520 docs) is **1141 KB raw / 150 KB gzip / 118 KB brotli**; `search-index-light.json` (same 520 docs, `searchText`/`source` dropped) is **735 KB raw / 89 KB gzip / 70 KB brotli**. Average document size ~1.8 KB. **Recommendation: lazy-loaded static client-side** — fetch `search-index-light.json` only when the search surface actually opens, not on every page load. At this corpus's real scale (520 documents), a server round-trip's own latency likely costs more perceived time than a one-time ~70-90 KB fetch, and no external paid search service (Algolia/Elastic/etc.) is remotely justified. Not a forced architecture change — a future implementation may choose server-side or hybrid if a real, then-current reason favors it (e.g. the corpus growing an order of magnitude).

## SEO / SEARCH SEPARATION

This search index is not Google's index (`search/search-seo-separation-contract.json`). If an internal results page (e.g. `/search?q=...`) is ever built, it **must default to NOINDEX** (`robots: { index: false, follow: true }` — the exact, already-proven mechanism this codebase uses for the 5 noindex journey-merged pages, reused here rather than reinvented), must never be added to `sitemap.ts`, and internal links must always point at a document's own real canonical URL — never at a `/search?q=...` URL that happens to resolve to it. This is the existing SEO round's own decision, applied here, not re-decided.

---

## DESIGN FREEDOM

What a designer/implementer can change **without** touching any file in `search/`:

- Modal, command-palette, or full dedicated page.
- Card layout, row layout, typography, icons, spacing, color, motion.
- Ranked list vs. grouped-by-type presentation (both are free — see RESULT MODES).
- Facet presentation: chips, dropdowns, an accordion, a sidebar, a bottom sheet; which of the 9 facet dimensions a first version even exposes (launching with only `type` + `normalizedCategory` and adding more later is fine).
- Empty/loading/no-result state copy and visual treatment (the 6 *states* themselves are fixed; the words and pixels are not).
- Whether/how related-content slots render (0-6 items per document, per `search/search-relations.json` — design for the honest range, not a guaranteed minimum).
- Analytics event *firing UI* (button placement, etc.) — the 6 event names/parameters are fixed, the triggering interactions' visual form is not.

## DESIGN MUST NOT CHANGE

What is data/logic-layer, not implementation detail — changing any of these means re-opening this contract, not a local UI tweak:

- `SearchDocument` field semantics and the alias/synonym boundary (`search/search-document.schema.json`, `search-aliases.json`, `search-synonyms.json`).
- The ranking algorithm's scoring logic and weights (`search/search-ranking-contract.json`) — tune only by re-testing against the 70 real fixtures, never by feel.
- Canonical URLs and the merged-journey alias-resolution behavior (never surface a retired journey id as its own result).
- Facet dimension meaning and AND/OR combination semantics (`search/search-facet-combination-contract.json`).
- Analytics event names/parameters and the normalized-query privacy decision (`search/search-analytics-contract.json`).
- The accessibility interaction contract (focus management, keyboard mapping, ARIA roles/live-region behavior — `search/search-accessibility-contract.json`) — visual styling is free, the underlying behavior is not.
- The SEO/search separation rule (a results page defaults to NOINDEX, never added to the sitemap).
