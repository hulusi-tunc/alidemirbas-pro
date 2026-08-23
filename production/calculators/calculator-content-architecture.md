# Calculator Content Architecture (Phase 4)

Editorial content for the 13 approved calculators. See `FINAL REPORT`
(chat) for coverage/QA numbers - this file is the "why" behind the
structural decisions, matching the role of the Phase 1-3 architecture
docs.

## Data model

`production/calculators/content/{slug}.json`, one file per calculator
(not one giant JSON - 13 focused files are easier to review and diff
than one large array, and match the repo's existing one-file-per-record
convention where record count is small). Shape:

```
{ calculatorId, slug, contentDepth, intro,
  sections: [{ id, type, heading, body? | items? | models? }],
  faq: [{ id, q, a }],
  seo: { seoTitle, seoDescription, canonicalPath, index, follow },
  qaStatus, qaNotes }
```

`calculator-content.schema.json` validates the shape;
`validate-calculator-content.mjs` validates everything schema can't
(coverage, cross-file uniqueness, slot fulfillment, similarity).

## Rendering: additive, not a redesign

`src/lib/calc-content.ts` (server-only, EN content statically imported)
feeds `src/components/CalculatorContent.tsx` (plain server component,
no client JS - FAQ uses native `<details>/<summary>`, accessible without
scripting). Wired into `CalculatorRoutes.tsx`'s existing
`CalculatorDetailPage`:

```
Hero (existing)          - now uses content.intro when present
CalculatorTool (existing) - unchanged, stays primary, own formula/example/related block
CalculatorContent (new)   - renders below the calculator, sections then FAQ
```

The tool's own compact formula/example/related-calculators block (Phase
2) is left untouched and still renders for every one of the 34 live
calculators. Phase 4 content is a second, richer layer *below* it for
just these 13 - deliberately additive so nothing about the other 21
live calculators' pages changed, and so a mistake in content data can't
break the calculation engine.

## Reconciling Phase 3's slot vocabulary with Phase 4's section types

Phase 3's `calculator-content-slots.json` required-slot names
(`formulaExplanation`, `howToCalculate`, `workedExample`, `commonMistakes`,
`comparisonLinks`, …) don't match Phase 4's actual section `type` values
one-to-one, because instruction 11 explicitly asks for examples to be
written as a natural sentence inside the formula explanation rather than
a separate mechanical "Worked Example" subsection. `validate-calculator-content.mjs`
carries an explicit mapping (`TYPE_TO_SLOTS`) reconciling the two: a
`formula`-typed section credits both `formulaExplanation` and
`workedExample`, since every one of this batch's formula sections
genuinely does embed a concrete number inline; a `models`-typed section
(LTV only) credits `methodology`/`assumptions`/`formulaExplanation`/
`workedExample` at once, since each mode's block does all of that per
mode; an `assumptions`-typed section also credits `methodology`, since
for these calculators explaining the assumptions *is* explaining the
method. `relatedMetrics` is always considered satisfied - it's rendered
by the existing Phase 2 UI element regardless of content, so a content
file never needs a section for it. This mapping is validator logic, not
a workaround: it reflects how the 13 files were actually written, not a
loophole to hide gaps (the validator caught 15 genuine gaps against the
naive one-to-one mapping before this reconciliation, and all 15 were
either fixed with real content or resolved by correcting a mistyped
section - see the validation report history in this doc's companion
chat report).

One deliberate rule change beyond the mapping: `comparisonLinks` is only
required when Phase 3's own SEO map (`calculator-seo-map.json`) flagged
a `cannibalizationRisks` entry for that slug. Requiring a comparison
note on every standard/deep page regardless of whether there's an
actual boundary to defend would have forced fabricated content on pages
like `aov` and `retention-rate` that have nothing to disambiguate -
exactly what instruction 4/28 warn against.

## Benchmark policy in practice

Every benchmark-flavored secondary keyword Phase 3 flagged (`average
roas`, `what is a good cac`, `average retention rate`, …) was reviewed
per calculator and *not* answered with a number. `calculator-content-sources.json`
is deliberately empty - not because sourcing wasn't attempted, but
because no Tier 1/2 source was available in this pass and instruction 8
is explicit that the right move without one is to explain interpretation
without a number, not to invent one. Every content file's `qaNotes`
states which benchmark-intent keyword was reviewed and left untargeted.

## `cr`'s alias consolidation, applied to prose

`cr` absorbs 16 folded aliases (Phase 1/3). The content does not give
each alias its own subsection - it states once, in the definition
section, that checkout/lead/install/signup conversion rates are the
same equation with different labels, then moves on. This is the direct
prose consequence of Phase 1's consolidation decision, not a new Phase 4
call.

## `ltv`'s per-mode content

Each of the three modes gets its own explanation, formula, and worked
example inside one `models`-typed section, using the exact
`examplesByMode` values Phase 3 added to `calculator-catalog.json`
(themselves the same numbers `test-calculators.mjs` verifies). The
content explicitly states that a more complex model is not automatically
more accurate (instruction 12) - each model is framed by what data it
needs and what decision it's meant to feed, not ranked.

## Statistical pages (`ab-test`, `sample-size-calculator`)

Both went through an extra pass specifically checking the two banned
misreadings (instruction 13): neither file states or implies "a p-value
of 0.05 means 95% probability the variant is better," and neither states
or implies "significance proves causation." `ab-test`'s content adds an
explicit comparison-note against the confidence-interval calculator
(the one real cannibalization risk Phase 3 flagged for this page) and
mentions the Bayesian alternative conceptually, without linking to it -
that calculator (`bayesian-probability-to-beat`) isn't implemented yet
(P2, outside the 34-calculator live batch), so a clickable link would
be a dead one. `sample-size-calculator`'s MDE convention (relative, not
absolute) is stated using the exact same wording Phase 2's
`calc-registry.ts` already resolved it with - not re-derived
independently for this content pass.

## What was intentionally NOT done

No benchmark database, no glossary pages, no comparison pages, no
category pages, no Journey/A-B Test cross-links, no Turkish long-form
content, no visual redesign, no content for the remaining 64 calculator
specs. See the chat FINAL REPORT for the explicit confirmation list.
