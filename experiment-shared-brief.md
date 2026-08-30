# FROZEN EXPERIMENT BRIEF — "Inside the Canonical Journey Library"

This brief is the single shared input for two independent implementations.
It contains content, constraints, and real data sources. It deliberately
contains **no layout, composition, or visual-structure advice**. How the
page is composed is entirely the implementer's decision.

## The page

A standalone explainer page about the Canonical Journey Library — the
open-source library of lifecycle journeys that lives at `/lab/journeys` on
this site. The page presents what the library is, what a journey is made
of, how large and how structured the corpus is, what holds it together,
the principles it was built on, and how to explore it.

- Route: the file path you were assigned (an unlinked, standalone route).
- English only. Statically rendered. No site header/footer — render `<main>`
  content only.
- REGISTER: product marketing (the page presents a real Lab project to a
  visitor deciding whether to explore it). It is not a utility page and not
  a transaction page.

## Real data sources — import, do not copy numbers by hand

All figures shown on the page MUST come from these live exports (server
component; all are importable in a page.tsx):

- `@/lib/canonical-view`: `CANONICAL_COUNT` (journeys), `CATEGORY_COUNT`,
  `RULE_COUNT`, `GLOBAL_RULE_COUNT`, `JOURNEY_ROWS` (id, name, slug, goal,
  category, categoryTitle, nodeCount, channels, preview), `withCanonicalCount()`
- `@/lib/journey-marketing`: `NODE_KIND_COUNTS` (real per-kind node totals),
  `JOURNEY_CATEGORY_COUNTS` (real per-category journey counts), `JOURNEY_SCALE`
- `@/lib/journey-taxonomy`: `GOALS` (26 goal ids), `GOAL_LABEL`
- `@/components/ui/JourneyTopologyPreview`: renders a real journey's
  topology from `JOURNEY_ROWS[i].preview` — these are the library's real
  figures and may be used as page imagery.

**Fabrication is prohibited.** No invented numbers, testimonials, quotes,
screenshots, or chart images. If a fact is not derivable from the exports
above or the copy below, it does not appear on the page.

## Copy (fixed — use these texts verbatim; you choose only where they sit)

- TITLE: `Inside the Canonical Journey Library`
- DEK: use `withCanonicalCount("A library of {count} reusable lifecycle
  journeys across {categories} categories, held together by {rules}
  orchestration rules — each entry is a graph, not a sequence.")`
- S-WHAT heading `What it is`, body: `Every journey in the library is an
  entity state machine: it describes how one thing — a subscription, a
  consent record, an incident, a delivery — moves through its lifecycle.
  The library is domain-neutral by construction, so the same journey
  serves an e-commerce order and an insurance claim without rewriting.`
- S-ANATOMY heading `The anatomy of a journey`, body: `Seven node kinds are
  the entire vocabulary. A trigger starts the journey from a real signal. A
  condition branches it. A wait holds it — and every wait resolves both
  ways, on event and on timeout. An action does the work. A handoff
  transfers the entity to another journey. An outcome ends it with a
  result; an exit ends it without one. Nothing else exists, which is what
  keeps 281 graphs readable.` (the number in this sentence must be rendered
  from `CANONICAL_COUNT`, not typed)
- S-SCALE heading `The shape of the corpus`, body: `The corpus is not
  evenly distributed, and the skew is informative: lifecycle work clusters
  where entities change state most often.`
- S-RULES heading `What holds it together`, body: `Journeys do not run in
  isolation. Orchestration rules describe how they hand off, suppress and
  wake each other; global rules apply to every journey at once. Retired
  journey ids do not 404 — each one resolves into the journey that
  absorbed it.`
- S-PRINCIPLES heading `Three positions the corpus takes`, items (verbatim):
  1. `Graphs, not sequences. A journey is where it forks, what each arm
     means, and what happens when a wait runs out — not a numbered list of
     steps.`
  2. `Entity state machines, not one customer timeline. 281 independent
     lifecycles beat one mythical funnel.` (render the number live)
  3. `Domain-neutral by construction. Nothing in a journey names an
     industry; the same machine runs wherever the entity exists.`
- S-EXPLORE heading `Explore it`, body: `The full library is searchable
  and filterable by goal.` CTA text: `Open the library` → link `/lab/journeys`.

You MAY additionally surface real data from the listed exports (category
counts, node-kind counts, goal labels, example journeys with their real
names/ids/previews) wherever your design calls for it. You may write short
functional microcopy (labels, captions) but no new claims.

## Constraints (site constitution — identical for both branches)

- Tokens: existing Tailwind theme only — `bg-paper`/`bg-paper-soft` grounds,
  `ink-*` ramp, `line-*` rules, `blue-*`/`primary-*` reserved for functional
  accents (links, one CTA). Type: the site's existing sans + `font-mono`;
  existing scale utilities (`text-display-xl`, `clamp()` pairs) available.
- Available container widths: `.altor-container` (1248px), or explicit
  `max-w-[1120px]` / `max-w-[760px]` / `max-w-[46ch]` — your choice where.
- At most one `bg-ink-950` dark plate on the page (site law).
- No scroll-triggered animation, no `Reveal` — the page renders static.
- No new dependencies. One self-contained `page.tsx` (plus co-located
  helper components in the same file if needed). Do not modify any shared
  component or any file outside your assigned route.
- Must pass `npx tsc --noEmit`. Responsive at 1440 / 834 / 390 with no
  horizontal overflow.
- Do not read, imitate, or reference the other experiment branch's files.
