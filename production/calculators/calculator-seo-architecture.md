# Calculator SEO Architecture & Keyword Mapping (Phase 3)

Search-intent architecture for all 77 catalog calculators. No SEO copy
was written; no routes were added. See `FINAL REPORT` (chat) for
coverage numbers - this file is the "why" behind the structural
decisions, matching `calculator-architecture.md`'s role for Phase 1-2.

## Methodology

`_generate-seo-map.mjs` follows the same generate-from-data-plus-
curated-overrides pattern as `_generate-catalog.mjs`: a programmatic
baseline (formula/example/definition secondary keywords, derived from
each calculator's own name and aliases - already in `calculator-catalog.json`,
never re-typed) plus hand-authored judgment layered on top
(comparison backlog, cannibalization risk pairs, glossary backlog,
category strategy, a short list of manual keyword extras for
calculators whose query space is unusually distinctive). This keeps the
77 records internally consistent instead of hand-typed and drifting,
and means most of the map is auditable back to source data rather than
asserted.

## Content depth: a family rule, not 77 judgments

The brief's own worked examples (CTR/CPC/CPM → light; CAC/ROAS/AOV/Churn
→ standard; LTV/sample size/CI/significance/duration → deep) generalize
cleanly to a 4-line rule: calculators with `modes` or in the
`experimentation` category are deep; members of the `cost-per-unit` and
`rate-ratio` formula families are light by default; everything else is
standard. Eight light-family members got a manual bump to standard
where the metric carries real interpretation nuance despite the simple
formula (`open-rate` - Apple MPP inflation, `ctor` - commonly confused
with CTR, `dau-mau-stickiness`, `cpe` - "engagement" has no fixed
definition, `share-of-voice`, `refund-rate`, `field-abandonment-rate`,
`exit-rate` - each already flagged with a `calculator-educational`
classification or an explicit validation-rule caveat in Phase 1).
Result: 45 standard / 23 light / 9 deep.

**Deliberate non-decision:** merged-variant count (how many aliases fold
into a calculator - `cr` absorbs 16, `nrr` absorbs 4) was tested as a
depth signal and rejected. A calculator absorbing many aliases needs a
*broader keyword set*, not necessarily more *conceptual* explanation -
conflating the two would have pushed `cr` to "deep" despite being one
of the simplest formulas in the catalog. Breadth and depth are tracked
as separate axes: `secondaryKeywords.length` vs. `contentDepth`.

## SEO priority: reused, not re-invented

`seoPriority` (A/B/C/D) maps directly from Phase 1's P0-P3 usefulness
tier. A second, independently-reasoned score was considered and
rejected as exactly the "fake precision" this phase is told to avoid -
Phase 1's priority already weighed recognizability and usefulness, the
two biggest inputs any SEO priority model would use anyway.

## Cannibalization audit

Two tiers, kept structurally separate:

1. **Alias pairs (58, verified programmatically)** - every
   `duplicate-variant` candidate from Phase 1 that folds into a live
   catalog entry. Zero risk *by construction*: only one URL exists, so
   there is nothing to cannibalize. Listed in
   `calculator-cannibalization-report.json.aliasPairsAlreadyMerged` for
   completeness, not because they need attention.
2. **Named collisions (10, hand-classified)** - the brief's own worked
   examples, where TWO separate URLs exist and could compete. 6 are
   real `cannibalization-risk` pairs needing explicit differentiation
   language in Phase 4 copy (ROAS/Marketing ROI, CAC/CPA, the two
   margin pairs, CTR/CTOR, A/B Significance/Confidence Interval); the
   rest are `adjacent-intent` or `no-issue` - different enough that
   internal linking, not content boundaries, is the right tool.

Three brief-named "collisions" don't appear as pairs at all because
they were resolved in Phase 1-2, not Phase 3: **Retention vs. Churn**
(one page, `churnRate` is a second output field), **MRR vs. ARR** (one
page, `arr` is a derived output), **NRR vs. GRR** (one page, `grr` is a
derived output). A comparison page for any of these would just
re-explain the calculator that already explains both numbers -
exactly the manufactured redundancy instruction 18 warns against.

## Glossary and comparison backlogs

19 glossary candidates (8 from Phase 1's own `glossary`-classified
research + 11 new terms that only surfaced while mapping query intent -
attribution window, assisted conversion, cohort, statistical power,
p-value, etc.) and 13 comparison pages. Both are backlogs, not routes.
The margin comparison is deliberately **one three-way page**
(`margin-types-compared`: Gross vs. Contribution vs. Profit) rather
than three separate pairwise pages, since all three compete for
essentially the same "which margin calculator do I want" intent.

## Category strategy

No category routes were built (unchanged from Phase 2 §7). Verdict per
category is in `calculator-category-strategy.json`; the short version:
`advertising` (14 calculators), `ecommerce` (14), `saas` (11) and
`experimentation` (8) are the strongest future-hub candidates on
calculator count + audience coherence; `acquisition` (2) and
`unit-economics` (4) are explicitly `not-needed` - too thin, and
unit-economics' four calculators are already the most cross-linked
group in the catalog, which does the hub's job better than a page with
four links would.

## Localization strategy

No blind translation happened this phase (per instruction 13). Every
SEO record carries a `localizationStatus` block flagging four fields as
`tr-missing`: calculator `name`, `formulaPlainEnglish`, the worked
`example`, and page `metadata`. This is a structural flag, not new
Turkish copy - Phase 1's English-only authoring (documented in
`calculator-architecture.md`'s open questions) still stands; Phase 3
just makes the gap machine-checkable instead of a prose note.

## `formulaDisplay` (instruction 14) - implemented, not just designed

Six catalog formulas use notation (`^`, `±`, `|`, subscripts, brackets)
that `CalculatorTool.tsx`'s runtime auto-prettifier correctly declines
to touch, falling back to a raw string
(`z = (p2 - p1) / SE(pooled)`, etc.). Rather than leave this as a Phase
4 TODO, an optional `formulaDisplay` field was added to
`calculator-catalog.json` (via `_generate-catalog.mjs`'s
`FORMULA_DISPLAY` lookup, schema-validated) with a hand-written,
editorially-controlled replacement for exactly those six:
`ab-test-significance`, `confidence-interval-calculator`,
`sample-size-calculator`, `minimum-detectable-effect`,
`bayesian-probability-to-beat`, `funnel-analysis-multistep`. `CalculatorTool.tsx`
now prefers `formulaDisplay` over the runtime prettifier whenever it's
present. Verified live: `/calculators/ab-test` now shows "z-score =
(Variant rate − Control rate) ÷ Standard error" instead of the raw
formula string.

## `examplesByMode` (instruction 15) - implemented for its one live case

LTV is the only *implemented* calculator with `modes`. Phase 2's
mode-switcher hid the worked example entirely on non-default modes
(no example ≠ a wrong example, but still a gap). Phase 3 replaces that
workaround with real per-mode examples in `calculator-catalog.json`
(`examplesByMode.simple` / `.margin-adjusted` / `.mobile-arpdau`) -
using the exact numbers `test-calculators.mjs` already verifies against
`calc-registry.ts`'s `ltv()` function, not invented for this doc.
`CalculatorTool.tsx` now shows the correct example for whichever mode
is selected; verified live: switching to "Mobile (ARPDAU-based)" now
shows `arpdau: 0.2, avgLifetimeDays: 400 → ltv: 80.00` instead of no
example at all.

## First Phase 4 content batch (13 calculators)

| Slug | Why selected |
|---|---|
| `cr` | Highest keyword surface in the catalog (16 folded aliases) - the single highest-leverage page to write well. |
| `roas` | P0, high-comparison-value (`roas-vs-roi`), the catalog's most recognizable metric. |
| `ctr` | Light-depth counterpoint to `cr` - proves the content-slot system doesn't force uniform page length. |
| `cac` | P0, feeds `ltv-cac-ratio` and `cac-payback-period`, cannibalization-risk pair with CPA needs real differentiation copy. |
| `ltv` | The one live multi-mode calculator - the page that most tests whether the content architecture (slots, per-mode examples, formulaDisplay) actually works end to end. |
| `ltv-cac-ratio` | Combines two Phase-4-batch calculators' outputs; natural internal-link anchor. |
| `cac-payback-period` | Standard-depth unit-economics page with a documented common-mistake (margin adjustment) worth writing well early. |
| `aov` | Light e-commerce anchor, high recognizability, pairs with `cr`/`revenue-per-visitor` internal links. |
| `gross-margin` | One vertex of the three-way margin comparison backlog - can't ship that comparison page without this one written first. |
| `retention-rate` | Dual-output (retention + churn) lifecycle anchor, P0. |
| `nrr` | SaaS anchor, dual-output (NRR + GRR), deep-ish content needs a real test case. |
| `ab-test-significance` | Deep/experimentation anchor, highest-stakes calculator to get interpretation copy right (a wrong "what does this mean" reads as bad advice). |
| `sample-size-calculator` | Pairs with `ab-test-significance` for a coherent experimentation content cluster; already resolved the relative-MDE ambiguity in Phase 2, so the formula story is settled. |

Selection favors breadth of page *type* (light/standard/deep, single-
and multi-output, single- and multi-mode) over easiest-first, per
instruction 20.

## Open decisions (not guessed)

1. **Turkish content strategy** - translate `formulaPlainEnglish`/examples
   per calculator, or ship EN-only for the new batch with a visible
   "EN only" flag? Not decided; `localizationStatus` just tracks the gap.
2. **Comparison-page URL structure** - `/calculators/roas-vs-roi` as a
   sibling of the calculator routes, or a separate `/compare/` prefix?
   Not decided; the backlog only names the concept.
3. **Glossary route structure** - same open question as comparisons,
   one level earlier (no glossary route exists at all yet).
4. **`margin-types-compared`'s three-way format** - is a 3-way
   comparison page a pattern worth reusing elsewhere, or a one-off? No
   other 3+-way collision was found in this audit, so no precedent
   exists yet either way.
