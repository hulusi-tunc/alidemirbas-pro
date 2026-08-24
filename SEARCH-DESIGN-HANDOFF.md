# Search / Discovery Design Handoff

Semantic requirements only — no pixels, no layout, no component names. The data layer (`search/`) is production-ready; this is what the designer needs to know about it before drawing anything.

## 1. Result types that exist

Five, each with real, distinct content behind it:

| Type | Count | What a result actually is |
|---|---|---|
| `calculator` | 43 | A live, interactive tool page with a formula and a result |
| `ab-test` | 211 | An experiment idea: a question, a hypothesis, a KPI, guardrails |
| `journey` | 255 | A lifecycle state machine (trigger → nodes → exits), not a linear article |
| `lab-product` | 6 | A project — 3 link to real on-site pages, 3 link off-site (GitHub, numerspace.com) |
| `blog-article` | 5 | A long-form article with sections |

There is no `about`/`stack`/`contact` result type — those static nav pages are deliberately excluded from search (see `search/search-taxonomy.json`'s own `excludedFromSearch` note: they're always one click away in global nav, so a search result pointing at them adds nothing a nav click doesn't already give).

## 2. Minimum fields a result card needs

Every result, regardless of type, guarantees: `title`, `summary` (1-2 sentences, already short), `type`, `url`. That's enough for a bare-minimum card. Beyond that, per type:

- **calculator**: has `metric` (its own name/acronym) — worth showing if the card design wants a quick "what number does this give you" hint.
- **ab-test**: has `category` (e.g. "Cart & Checkout") and `surface` (e.g. "checkout") — a card showing "AB-001 · Cart & Checkout" alongside the title is a real, sourced pattern already used on the live page itself.
- **journey**: has `category`/`categoryTitle` and an `id` (e.g. "ACC-71") that's part of the title string already.
- **lab-product**: has `external: true/false` — the card needs *some* visual cue that 3 of the 6 results leave the site (opens GitHub / numerspace.com) vs. 3 stay on-site. Not prescribing how, just flagging that the distinction is real and matters (a user shouldn't be surprised to land on an external domain).
- **blog-article**: has no extra fields beyond the shared ones — a plain title + summary card is enough.

A card should never need `searchText` (it's the internal matching field, not display copy — often 500-2000 characters, not meant to be read as-is).

## 3. Facets that exist today (real, computed counts)

See `search/search-facets.json` for the actual numbers. Filterable dimensions with real document counts behind every value:

- `type` (5 values, the table above)
- `normalizedCategory` (11 shared values, cross-corpus — e.g. "cart-and-checkout" covers calculator + ab-test + journey documents together)
- `surface` (14 values, ab-test only)
- `funnelStage` (5 values, journey-only in practice, though not exclusively)
- `businessObjective` (21 values — flagged: `review-required` is currently the single largest bucket at ~42% of documents, since the taxonomy it's drawn from was designed for journeys and doesn't classify ab-test/calculator titles as precisely — see the final report's own note on this. Don't design this facet as if every value bucket is equally populated/reliable.)
- `metric` (calculator/ab-test only — many distinct values, several with only 1-2 documents; `search-facets.json` flags these `lowUtility: true`)

A facet value with `lowUtility: true` (≤2 documents) is real, not a bug — just not worth a prominent filter chip at this corpus size. Fine to fold into an "other" bucket or omit from a compact filter UI; the data itself stays available for a "show all" expansion.

## 4. Empty states

Three genuinely different empty-state situations, not one generic "no results":

1. **Zero matches at all** — a query that hits nothing. Real, will happen (see the misspelling fixtures in `search/search-query-fixtures.json` — "calclator", "joruney" currently return nothing, since no fuzzy-matching is implemented; see §8 below).
2. **A merged-journey lookup** — a query that resolves via `search/search-aliases.json` to a survivor document. This is NOT an empty state, but it IS a state worth designing for explicitly: the result the user gets is for a *different* id than they typed (e.g. searching "RET-25" returns the "risk-signal" journey, not a "RET-25" result). A one-line "RET-25 was merged into RSK-192" note near that result (the exact copy the live journey page itself already shows) avoids confusing the user about why their exact query didn't produce an exact-named result.
3. **A query resolved to only one type** — not an empty state at all, just a single-type result list (see §5). Don't force a "no results in other categories" message here; it's simply not always a diverse-corpus query, and inventing an apology for that would be worse than saying nothing.

## 5. Mixed result lists are real and expected

A single query legitimately returns calculators, ab-tests, journeys, lab-products and blog-articles all at once (e.g. "conversion", "checkout" — verified against the real corpus, see `search/search-query-fixtures.json`'s broad-concept fixtures). The ranking contract (`search/search-ranking-contract.json`) includes a soft diversity rule so one type can't accidentally monopolize all 10 slots on a genuinely cross-corpus query — but it won't force diversity where none exists (e.g. "pricing" and "onboarding" verified to have zero real cross-type matches in this corpus; an all-one-type result list there is the honest answer, not a bug).

## 6. Type grouping — possible, not required by the data

Nothing in the data model prevents a grouped-by-type layout ("Calculators", "A/B Tests", "Journeys" as separate sections) instead of one flat ranked list. Both are supportable from the same `search-index.json` + ranking output; this is purely a design call, not a data constraint.

## 7. Related-content slots

`search/search-relations.json` gives every document with a real relation a `relatedPrimary` (0-3 items, score ≥ 1.0, usually from an explicit source like the calculator catalog's own `relatedCalculators` or a blog post's own `related[]` links) and `relatedSecondary` (0-3 items, score 0.3-1.0, computed from shared category/metric overlap). 181 of 520 documents have at least one relation edge — the other 339 (mostly ab-tests and journeys with no strong category/metric overlap to anything) legitimately have none. Design a related-content slot that can render 0-6 items, not one that assumes at least 1 always exists — and don't fabricate a "related" section on a document that has none; an absent slot is the honest state there.

Each related item carries its own `reasons[]` (e.g. `["shared-category", "shared-metric"]`) — worth surfacing as a short "why this" hint if the design has room (e.g. "same category" chip), but not required.

## 8. Mobile / payload constraints

- `search/search-index.json` (full, includes `searchText` + `source` provenance) is **1.03 MB**.
- `search/search-index-light.json` (same 520 documents, `searchText`/`source` dropped) is **636 KB**.
- Both are almost certainly too large to ship to a mobile client as a single static download for client-side search. See `search/search-manifest.json`'s own `sizeReport` for exact per-document sizes (average ~2 KB, max documented there). This is a real constraint the eventual implementation needs to solve — server-side search (an API endpoint over this same index) is the straightforward answer; a client-side approach would need real pagination/chunking, not just shipping `search-index-light.json` wholesale to a phone. Not solved in this round (would be an implementation decision, out of scope for a data-layer round) — flagged so it isn't a surprise later.

## 9. Typo tolerance — contract only, not implemented

No fuzzy-matching library was added (explicitly out of scope this round — "dependency eklemeden"). The documented contract for a future implementation:

- Case-insensitive, diacritic-stripped (already implemented in `search/headless-search-prototype.mjs`'s `normalize()` — "İstanbul" and "istanbul" already match).
- Punctuation/hyphen/slash-tolerant (already implemented — "DAU/MAU", "DAU-MAU", "DAU MAU" already normalize to the same tokens).
- Turkish characters (ç, ş, ğ, ı, ö, ü) are NOT currently folded to their ASCII equivalents — only combining diacritics are stripped (NFD normalization). A future implementation should decide whether "sıcak"/"sicak" should match (currently they don't).
- Acronym/spelling variants ("A/B Test" / "AB Test" / "a b test") are handled via `search/search-synonyms.json`, not fuzzy matching — already working.
- Genuine misspellings ("calclator", "converion", "joruney") are the one real gap — `search/search-query-fixtures.json` documents this explicitly (2 fixtures marked as known gaps, not silently passing). A future implementation needs either a small edit-distance check or an external search service's built-in typo tolerance to close this; this round intentionally does not add either.

## 10. What this round does NOT include (by design, not oversight)

No search UI, no search box, no results page, no facet chips, no external search service (Algolia/Elastic/Meilisearch), no new npm dependency. The prototype (`search/headless-search-prototype.mjs`) is a CLI/module proof that the ranking contract is implementable deterministically — call it with `search(query)` and it returns ranked, explained results as plain data; it's not meant to run in a browser as-is.
