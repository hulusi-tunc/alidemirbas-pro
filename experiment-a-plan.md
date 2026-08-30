# Experiment A — Design plan: "Inside the Canonical Journey Library"

## Read of the problem

This is a product-marketing explainer for a data artifact. The strongest
asset the page owns is that every number and every picture can be *real* —
the corpus itself is the proof. So the design principle is: **the data is
the decoration**. No abstract illustration; every visual moment is a live
figure (a real journey topology, real per-kind counts, the real category
distribution, the real goal vocabulary). Tone: quiet, editorial, confident
— generous whitespace on `bg-paper`, mono for anything that is *data*
(ids, counts, kickers), sans for argument.

## Hierarchy and flow

The narrative order the copy already implies: what it is → what one is
made of → what the whole corpus looks like → what binds it → what it
believes → go explore. I keep that order; the page reads as one argument.

1. **Hero** (`.altor-container`, generous top padding). Mono kicker
   ("Lab · open source"), `text-display-xl` title, dek from
   `withCanonicalCount` at `text-xl` in `ink-500`, capped ~46ch. Below, a
   four-up stat row (journeys / categories / nodes / rules) in mono with
   hairline separators — real exports, first proof on screen. Then the
   hero image: one real journey rendered by `JourneyTopologyPreview`
   inside a framed `bg-paper-soft` card (its viewBox is 1000×440, so it
   sits naturally as a wide band), captioned with the journey's real id,
   name and node count in mono — chosen deterministically as the largest
   graph in the library, because "our most complex entry, still legible"
   is the page's best opening claim.

2. **What it is.** Text section, `max-w-[760px]`, small mono section
   index ("01") + `text-h2-fluid` heading, body at readable measure.
   All five text sections share this heading grammar so the page feels
   ruled rather than assembled.

3. **The anatomy of a journey.** Body copy first (with the 281 rendered
   from `CANONICAL_COUNT` mid-sentence), then the payoff: a 7-tile grid
   of the node kinds. Each tile = kind name, one-line role (lifted
   directly from the fixed body copy, so no new claims), and the real
   corpus count from `NODE_KIND_COUNTS` in mono. Order: the vocabulary's
   teaching order (trigger → condition → wait → action → handoff →
   outcome → exit), counts looked up. Grid: 1 col at 390, 2 at 834,
   4+3 at 1440 (an uneven last row is honest — seven kinds, not eight).

4. **The shape of the corpus.** The skew *is* the content, so show it:
   a horizontal bar list of all categories from
   `JOURNEY_CATEGORY_COUNTS` (already sorted heaviest-first). Each row:
   category title, thin `ink-900` bar scaled to the max count, mono
   count. Pure HTML/CSS bars — no chart image, fully static, collapses
   perfectly at 390. Two-column split at desktop: heading + body on the
   left (sticky feel without JS — just aligned top), bars on the right.

5. **What holds it together.** Copy plus two mono figures set large
   (`RULE_COUNT` orchestration rules, `GLOBAL_RULE_COUNT` global rules)
   as a compact side-by-side pair — this section stays quiet; it's
   connective tissue, not a second hero.

6. **Three positions.** The verbatim principles as three numbered
   columns (1 col mobile → 3 at desktop), oversized mono numerals in
   `ink-200`, first sentence of each item bolded as its de-facto title
   (the copy is written that way). Principle 2's count rendered live.

7. **Explore — the one `bg-ink-950` plate.** Saved for the exit so the
   page ends on its highest-contrast moment. Inside: heading, body, the
   26 real goal labels as small bordered mono chips (`line-inverse`
   borders, `ink-300` text) — literal evidence of "filterable by goal" —
   and the single functional-accent CTA: a `bg-primary-600` button
   "Open the library" → `/lab/journeys`.

## Responsive & discipline

One accent use (the CTA; inline links if any use `ink-brand`). One dark
plate. No animation, no client components — everything is a server
component; `JourneyTopologyPreview` is presentational SVG. Widths:
`.altor-container` shell, `max-w-[760px]` prose, full-shell width for
the bar chart/tile grid. All grids collapse to one column by 390; bars
and chips wrap; nothing fixed-width, so no horizontal overflow.
Metadata: simple title/description; static render falls out of having
no dynamic APIs.
