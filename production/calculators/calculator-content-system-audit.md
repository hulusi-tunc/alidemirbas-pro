# Calculator Content System Audit (Phase 4.5)

Audits the content system Phase 4 built, against the question: *if we
scaled from 13 to 40-77 pages tomorrow, what breaks first?* No new
calculator content was written this phase. See the companion chat
report for the verdict and numbers; this file is the reasoning.

## What would break first (§1)

In order of how much damage it would do before anyone noticed:

1. **The `workedExample` credit was a pattern match on my own habit, not
   a real check.** `TYPE_TO_SLOTS` credited any `formula`-typed section
   with satisfying `workedExample`, because all 12 shipped formula
   sections happened to embed a concrete number. Nothing verified that.
   At 40 pages, a rushed formula section with no embedded number would
   pass silently. **Fixed**: `validate-calculator-content.mjs` now
   mechanically checks that a number from the calculator's own
   `exampleInput`/`exampleOutput`/`examplesByMode` literally appears in
   the relevant section text (rule `worked-example-presence`).
2. **`interpretation` and `benchmark` were never structurally separate.**
   Nothing stopped a future editor from writing "a ROAS above 4x is
   strong" inside an `interpretation` section - the schema had no
   distinct type with a sourcing requirement attached. **Fixed**: added
   a `benchmark` section type to `calculator-content.schema.json` with
   required `value`/`context`/`sourceId` fields, and a validator rule
   that a benchmark section's `sourceId` must resolve in
   `calculator-content-sources.json` or the build fails.
3. **The depth model's `experimentation category → deep` rule is a
   blanket rule that doesn't hold for every member.**
   `test-duration-estimator` was classified deep purely by category
   membership despite being one arithmetic caveat, not genuine
   statistical methodology. **Fixed**: added a documented
   `DEPTH_OVERRIDES` map in `_generate-seo-map.mjs` reclassifying it to
   standard (same pattern already used for the light-family
   `STANDARD_OVERRIDES` list). No content files were touched -
   `test-duration-estimator` has none yet.
4. **Heading repetition is real, measured, and would compound.** "Reading
   the number" appears on 8/13 pages, "The formula" on 5/13. Verdict:
   reviewed as healthy consistency (see §5), not rewritten - but now
   tracked by a validator warning so it's visible automatically as the
   corpus grows instead of requiring another manual grep.
5. **Light-family clustering.** CPC/CPM/CPA/CPL are next in line and are
   nearly identical in shape (cost ÷ count). This is a real forthcoming
   template-risk cluster - see §23.
6. **No i18n-ready field structure.** Content is flat English strings,
   inconsistent with the rest of the site's `{en, tr}` convention used
   everywhere else (CalculatorTool.tsx, catalog.json labels). Not fixed
   this phase - see §26, deliberately deferred rather than migrated
   speculatively.

## Worked example audit (§3)

Formula and worked example are conflated in 12/13 files by design (the
example lives as a sentence inside the `formula` section, per
instruction 11's preference for natural prose over a mechanical
subsection) - only `ctr` uses a standalone `example` type. Both patterns
are legitimate and both are now schema-supported; the real gap wasn't
the pattern, it was that nothing *verified* the embedded example was
actually there (see §1.1, now fixed). `examplesByMode` is correctly the
only multi-mode example mechanism in the catalog, because LTV is the
only calculator with modes anywhere in the 77-entry catalog (confirmed
via the stress test, not assumed) - no backlog exists for a second case.

## Content depth audit (§4)

Word counts across the 13 shipped pages form a clean, *unforced*
gradient: light ~205 words, standard 240-478, deep 667-825. The
three-tier model is doing real work. One miscalibration found and fixed
(§1.3, `test-duration-estimator`). No case was found across the 13
shipped pages or the 64 unwritten specs that needs a fourth tier or
independent editorial/methodology/interpretation dimensions - the single
override mechanism already in place (`DEPTH_OVERRIDES`,
`STANDARD_OVERRIDES`) is sufficient and cheaper than a multi-dimensional
score. **Verdict: keep light/standard/deep, RELAX the blanket
experimentation-category rule** (done).

## Section-order repetition (§5) - healthy consistency, not template risk

Measured, not assumed: `definition→formula→interpretation→common-mistakes`
appears on 4 pages (aov, cac-payback-period, cr, retention-rate);
`definition→formula→comparison-note→interpretation→common-mistakes` on 3
(cac, gross-margin, roas). Both are below the 5-page threshold that
would trigger the existing sequence warning. The two *heading-text*
repeats ("Reading the number" x8, "The formula" x5) are real and are now
tracked (§1.4). Judgment call, made explicitly rather than left
implicit: **this is healthy consistency, not template risk**, because
the prose underneath each shared heading is substantively different
per-metric (verified by reading all 13, not inferred from the headings
alone) - a STANDARD-depth page naturally explains its formula, then
tells the reader how to read the number, then lists mistakes; that shape
recurring is what a coherent content system looks like at this scale.
The finding is worth re-checking once 25-30 more STANDARD pages exist,
which is exactly why the validator rule was added rather than just
noted in this doc.

## Section necessity (§6)

| Type | Classification | Note |
|---|---|---|
| definition | CORE | Often folded into intro on light pages |
| formula | CORE | See §1.1 fix |
| example | CONDITIONAL | Standalone only when a page benefits from a short separate example (ctr); otherwise folds into formula |
| interpretation | CORE | Skippable only on light |
| methodology | SPECIALIZED | Deep/statistical only |
| models | SPECIALIZED | LTV only - no other catalog entry has modes |
| assumptions | SPECIALIZED | Deep/statistical only |
| limitations | SPECIALIZED | Deep only; genuinely distinct from common-mistakes (inherent vs. user error) - not redundant |
| common-mistakes | CORE | Broadly reusable, metric-specific in all 12 uses so far |
| comparison-note | CONDITIONAL | Gated on an actual flagged risk - correct, not manufactured |
| benchmark (new) | CONDITIONAL | Gated on a resolvable source - see §8 |

No type was found redundant with another; no new type is recommended
beyond `benchmark`.

## Interpretation vs. benchmark (§7)

Scanned every non-formula/example/models section body for a number
followed by `%`/`x`/`pts` (a cheap proxy for "might be stating a
threshold"). 8 hits, all inspected by hand:

- 6 are mathematical/structural thresholds, not empirical claims (e.g.
  "NRR exceeds 100% when...", "a ratio above 1x means...") - safe.
- 2 are illustrative hypotheticals in `roas.json`'s interpretation
  section ("a retailer with 70% gross margin can turn a 3x ROAS into
  real profit..."). These are framed as an if/then relationship, not a
  stated benchmark, and don't claim a number is universally good - but
  they're the closest thing to benchmark-adjacent language in the
  batch. Left as-is (the framing is correct and instruction 39 scopes
  content edits to genuine issues, not wording preferences), flagged
  here explicitly so a future editor doesn't have to re-derive the
  judgment call.

**Recommendation, implemented**: `benchmark` is now its own schema type
with required sourcing fields (§1.2), so this ambiguity can't recur by
accident - a genuine numeric claim has to go through the stricter path,
an illustrative hypothetical stays in `interpretation`.

## Benchmark policy (§8)

Recommended structured model (implemented in the schema, not populated):

```
benchmark: { value, range?, context (required), industry?, channel?,
             geography?, period?, sourceId (required), caveat? }
```

Tiering recommendation for future sourcing work:
- **Platform-specific** (e.g. an official Google/Meta benchmark page):
  usable with `sourceId` + `period`, since platforms date-stamp these.
- **Industry research** (a named study with methodology/publication
  date): usable, `sourceDate` and `caveat` should note sample
  size/methodology if the source is thin.
- **Business-model heuristic** (e.g. "3:1 LTV:CAC is a common rule of
  thumb"): usable only with an explicit `caveat` stating it's a
  heuristic, not a measured benchmark, and `context` naming which
  business model it assumes.
- **Universal claims** ("good ROAS is 4x"): not recommended for any
  marketing metric in this catalog - margin/channel/geography variance
  makes a context-free number actively misleading, which is why Phase 4
  avoided all of them.

No benchmark research was performed this phase (out of scope per
instruction 8's explicit "do not turn this into a broad web research
project yet").

## Source policy and freshness (§9-10)

`calculator-content-sources.json`'s current empty-array shape already
supports one-source-to-many-claims and many-sources-to-one-claim (it's
just a flat array with `calculatorId`/`claim` fields per entry - nothing
prevents two entries sharing a `sourceId` root or one claim citing two
entries). No structural change was needed. Freshness recommendation, not
implemented as code (there's nothing to enforce yet with zero sources):

| Claim type | Freshness |
|---|---|
| Mathematical definition / formula | Stable - no expiry |
| Statistical methodology (z-test, power analysis) | Stable, but the citation itself should be a durable reference, not a blog post |
| Platform behavior (e.g. Apple MPP affecting open rate) | Re-check yearly - platforms change this without notice |
| Industry benchmark | Time-sensitive - carry `period`, treat anything >18 months old as due for a refresh pass |
| Advertising benchmark specifically | Most time-sensitive category in this catalog - platform algorithm and auction dynamics shift faster than most industry research cycles |

## FAQ audit (§11)

Kept optional, no min/max. Counts across 13 files: 0 (six pages), 1 (two
pages), 2 (five pages) - not mechanically uniform. All 13 questions
inspected are genuinely distinct from their own page's body sections.

## `comparison-note` decision criteria (§12)

Made explicit rather than left as a per-page judgment call each time:

**Use `comparison-note` when**: the confusion is common (there's a
real, nameable reason two metrics get mixed up), the distinction fits
in 1-2 short paragraphs, and the calculator page should keep primary
keyword ownership (the comparison is secondary to the page's own
intent).

**Use a future comparison page when**: both concepts need substantial
side-by-side explanation (worked examples for both, not just a
definitional contrast), there's genuine decision intent ("which one
should I use"), and SERP intent is clearly comparative rather than
tool-seeking.

Checked against all 5 pairs implemented this batch (ROAS/ROI, CAC/CPA,
the margin trio, CTR/CTOR, Significance/CI): all 5 fit the
`comparison-note` criteria cleanly - none of them needed a dedicated
comparison page instead. The Phase 3 comparison backlog (13 pairs) is
still valid as a future-page list; none of it became redundant with
what Phase 4 shipped.

## Cannibalization re-audit against actual content (§13)

| Pair | Verdict | Note |
|---|---|---|
| ROAS / Marketing ROI | STRONG BOUNDARY | Explicit denominator-difference statement on both intended pages (Marketing ROI has no Phase 4 content yet, but ROAS's comparison-note is unambiguous) |
| CAC / CPA | STRONG BOUNDARY | "every CAC is a CPA, not every CPA is a CAC" - a genuinely sharp rule, not just wording |
| Gross / Contribution / Profit Margin | ACCEPTABLE | Boundary stated clearly in gross-margin.json; the margin trio's full 3-way contrast is intentionally deferred to the comparison backlog page, not crammed in here |
| CTR / CTOR | STRONG BOUNDARY | Both sides state the denominator difference |
| Significance / Confidence Interval | ACCEPTABLE | ab-test.json's comparison-note is clear; confidence-interval-calculator has no Phase 4 content yet, so the boundary is currently one-sided - worth writing the CI page with equal care when it's in scope |
| Retention / Churn | STRONG BOUNDARY | Not a content boundary at all - one page, two output fields, no ambiguity possible |
| NRR / GRR | STRONG BOUNDARY | Same reasoning - one page, both outputs explained together |
| LTV / LTV:CAC / CAC Payback | ACCEPTABLE | Each page correctly routes to the others rather than re-explaining; no page claims to be the complete unit-economics story on its own |

No pair was found TOO BROAD or TOO NARROW. Content implementation did
not accidentally widen any page's keyword ownership beyond what Phase 3
mapped.

## Content quality validator - what it can and can't catch (§14-16)

**Deterministically catchable (implemented this phase)**: missing
worked-example numbers, known generic-prose phrases, repeated headings,
unflagged keyword overlap, sourceless benchmark claims, structural
issues (dup ids, empty sections, placeholder text).

**Not deterministically catchable, needs human review**: whether a
paragraph is *semantically* generic even with metric-specific nouns
swapped in (instruction 16's "CAC gives marketers a useful way to
understand performance" example would pass every regex here - it
contains no filler phrase and even mentions the metric by name, but
says nothing CAC-specific), circular definitions, contradictions
between two sections of the same page, formula-prose mismatches
(content stating a formula that doesn't match `calculator-catalog.json`),
excessive hedging, and awkward keyword insertion. No attempt was made to
build an unreliable heuristic for these - per instruction 14, pretending
regex can fully solve semantic quality would be worse than admitting the
gap. The nearest proxy implemented is the worked-example number check,
which at least ties one class of "generic enough to be about anything"
risk to a verifiable fact.

## Heading and intro audit (§17-18)

Headings: no mechanical `What is X? / How to calculate X / FAQ` pattern
was found - every file's heading set is specific to its own content
(see the full per-file heading dump in this audit's supporting data).
The two repeats found are single shared headings, not a repeated whole
sequence of headings. Intros: all 13 are 1-3 sentences, state what the
calculator computes and what inputs it needs, and none of them read as
educational essays before the tool. No `intro` field is under 20
characters (schema-enforced) or reads as filler.

## `formulaDisplay` separation (§19)

Confirmed clean: `formulaDisplay` (Phase 3) lives in
`calculator-catalog.json` as a plain string, consumed by
`CalculatorTool.tsx` for display only - `calc-registry.ts` (the actual
compute layer) never reads it. Phase 4 content never redefines a
formula; it only *explains* the one already in the catalog.
`CalculatorContent.tsx` (the Phase 4 renderer) has no code path that
could execute or alter calculation logic - it's a pure display
component reading static JSON. No coupling risk found.

## `examplesByMode` backlog (§20)

Confirmed via the stress test: **zero** additional calculators in the
77-entry catalog have `modes` besides LTV. The backlog is empty by
construction, not by oversight. A validator rule to warn "multi-mode
calculator with content but a mode missing an example" was considered
and not built, since there is currently nothing for it to check -
revisit only if a second modes-having calculator is ever added to the
catalog.

## Output-specific interpretation (§21)

Two multi-output calculators shipped this batch (retention-rate: 2
outputs, nrr: 2 outputs) and both used one interpretation section
covering both outputs together, because the outputs are tightly coupled
(churn = 1 - retention; NRR and GRR come from the same four inputs) -
splitting them into `interpretationByOutput` would have meant
explaining the same relationship twice. Three more multi-output
calculators are in the stress-test "special handling" list
(mrr: 3, break-even-point: 3, funnel-analysis-multistep: 3,
confidence-interval-calculator: 3, ab-test: 7) - **recommendation:
decide per-calculator when writing it**, not via a new schema field.
`interpretationByOutput` is not recommended as a general mechanism; the
two shipped multi-output pages show one shared interpretation section
handles tightly-coupled outputs well, and the remaining ones haven't
been written yet to prove they need something different.

## Family-specific defaults (§22)

Rather than 77 individual rules, six family-level defaults, derived
from what actually varied across the 13 shipped pages plus the stress
test:

| Family | Depth default | What it typically needs beyond the base template |
|---|---|---|
| Cost-per-unit (CPC/CPM/CPA/CPL/CPI/CPV) | light | Nothing extra - formula + example is the whole page. See §23 for the repetition risk this creates. |
| Rate/ratio (CTR, CR, retention, churn) | light-to-standard | A denominator-scope note ("which population counts as the denominator") is the single most useful addition beyond the base template |
| Unit economics (CAC, LTV, LTV:CAC, CAC Payback) | standard-to-deep | Cross-links to the other 3 are more valuable than any one page trying to be complete alone |
| Margin/profitability (Gross Margin, Contribution Margin, ROI, ROAS) | standard | A comparison-note is close to mandatory - this family has the most cannibalization risk in the catalog |
| Recurring revenue (MRR, ARR, NRR, GRR) | standard | Multi-output handling (§21) matters more here than anywhere else |
| Experimentation (significance, CI, sample size, MDE) | deep, EXCEPT calculators whose complexity is one caveat rather than genuine methodology (§1.3) | Explicit misinterpretation warnings (the "does NOT mean" pattern used in ab-test.json) are family-defining, not optional |

## Light pages at scale (§23)

Simulated CPC/CPM/CPA/CPL/CPI/CPV/CPE against the current LIGHT
template (`definition, formulaExplanation, howToCalculate,
workedExample, relatedMetrics` required; `interpretation` optional).
**Finding**: the template itself doesn't force unnecessary text - it's
appropriately minimal. **The real risk is cross-page, not within-page**:
CPC, CPM, CPA and CPL are the exact same formula shape (spend ÷ count)
with only the denominator noun changing, so 4 light pages written back
to back risk reading like find-and-replace of each other even with
genuinely distinct prose, simply because the underlying concept has
almost no room to differentiate on. **Recommendation**: when this
family is written, deliberately vary which extra fact each page leads
with (CPC: click fraud/bidding context; CPM: reach-buying context; CPA:
the CPA-vs-CAC boundary already documented in cac.json; CPL: the
lead-quality caveat) rather than a uniform "X ÷ Y" opener four times in
a row - a content-authoring note, not a schema change.

## Deep pages at scale (§24)

Confidence interval, MDE, Bayesian, funnel and any future multi-mode
calculator were checked against the DEEP template. Two findings:
1. Confidence-interval-calculator, MDE and Bayesian genuinely need
   `assumptions`/`limitations` (real statistical caveats) - the template
   fits them as-is.
2. `funnel-analysis-multistep` is classified STANDARD, not deep, but has
   array input and 3 outputs - neither slot template variant (standard
   or deep) has a slot for "explain how the dynamic input format
   works." This is a real structural gap, not solved by changing its
   depth tier (its content isn't methodologically deep, its *input UI*
   is unusual). **Recommendation**: when funnel-analysis-multistep
   (or `multi-variant-test-significance`/`srm-check`, the other two
   array-input calculators) gets content, add one short paragraph
   explaining the input format as part of the `formula` or `definition`
   section rather than adding a new schema slot for a pattern that
   applies to only 3 of 77 calculators.

## Standard pages at scale (§25)

Simulated 20 additional STANDARD calculators from the stress-test list
(open-rate, activation-rate, revenue-per-visitor, contribution-margin,
saas-quick-ratio, cart-abandonment, profit-margin, marketing-roi, etc.).
No case was found needing a subtype (`standard-simple` /
`standard-interpretive` / `standard-multi-output`) - the conditional
`comparisonLinks` rule and the multi-output handling already established
in §21 cover the variation seen. **Verdict: no subtypes needed.**

## Localization readiness (§26-27)

Current architecture is EN-only by field shape (plain strings, not
`{en, tr}` objects), which is inconsistent with the rest of the site
(CalculatorTool.tsx, catalog.json labels all use `{en, tr}`). This is a
real blocker before TR content work starts, but **not fixed
speculatively this phase** - restructuring 13 files' every string field
into `{en: "...", tr: null}` right now wouldn't reduce the actual
translation effort later, only add a mechanical migration step now and
another when TR copy is actually written. Recommendation: do the field
restructuring as the first step *of* the TR phase, not before it.

The TR fallback behavior (`getContent(slug, lang)` returns `undefined`
for any non-`"en"` lang, so `CalculatorDetailPage` renders the existing
minimal TR shell instead of `CalculatorContent`) was re-verified this
phase by re-reading the code path - it is a deliberate `lang !== "en"`
guard in `calc-content.ts`, not an accidental gap, and it is exactly the
"localized content unavailable → minimal localized shell, never inject
EN prose" policy instruction 27 asks for.

## Tool primacy (§28)

Re-read `CalculatorDetailPage`: hero (H1 + intro) → `CalculatorTool`
(inputs, results, its own compact formula/example/related block) →
`CalculatorContent` (Phase 4 sections) → footer. The calculator is the
first interactive element on every one of the 13 pages, above all Phase
4 content, on both desktop and the mobile viewport already checked in
Phase 4's own browser verification. No regression found this phase.

## Search intent satisfaction (§29)

| Page | vs. SEO map |
|---|---|
| All 13 | COMPLETE - primary keyword addressed by the page itself (title/intro/formula), same-page secondary keywords (formula, example, definition) all covered, future-* placement keywords correctly excluded (verified in Phase 4's own qaNotes, spot-checked again this phase) |

No page was found OVER-COVERED (targeting something marked
`future-guide`/`future-glossary`) or UNDER-COVERED (missing a
same-page-placement keyword it should have addressed).

## Metadata audit (§30)

13/13 unique titles, 13/13 unique descriptions (already verified by the
validator). Re-checked for content-promise alignment: no description
promises something the page doesn't deliver (e.g. no description claims
"benchmarks included" on a page with no benchmark section). No
unsupported superlative language ("best", "most accurate") found.

## Category and glossary interaction (§31-32)

No page was found drifting into category-hub territory (e.g. ROAS
staying about ROAS, not becoming a paid-media survey). Glossary-adjacent
terms are referenced but not over-explained: `ab-test.json` mentions
p-values and the null hypothesis in service of explaining *this*
calculator's result, without trying to be the canonical p-value
glossary entry; `sample-size-calculator.json` does the same for
statistical power. Both terms are already in the Phase 3 glossary
backlog (`p-value`, `statistical-power`) - no new glossary candidates
surfaced this phase beyond what Phase 3 already found.

## Comparison interaction (§33)

Checked whether any shipped `comparison-note` already fully answers its
pair's comparison intent, making the Phase 3 backlog entry redundant.
None do - each note explains the *distinction* in 1-2 paragraphs, not a
full side-by-side (pricing/use-case/worked-example comparison), so the
Phase 3 comparison backlog (`roas-vs-roi`, `cac-vs-cpa`,
`margin-types-compared`, `ctr-vs-ctor`,
`significance-vs-confidence-interval`) remains valid future work, not
duplicated by what shipped.

## Verdict

See the chat report for the full A/B/C decision and reasoning. Summary:
the audit found and fixed 3 concrete system issues (worked-example
verification, benchmark/interpretation schema separation, one
depth-model miscalibration) rather than a wholesale rewrite. Nothing
found required touching any of the 13 shipped content files' prose.
