# Controlled Experiment 1 — Composition-Grammar Planning

*Generated 2026-08-29. Companion to `METHODOLOGY.md`.
This dossier contains the complete experiment: the frozen shared input, both
branches' plans and implementations, the measurement harness, the raw machine
results, and the blind critique.*

## Hypothesis under test

> [PLAUSIBLE] Naming and planning composition with an explicit composition
> grammar produces better full-page composition than ordinary prose planning.

This is the largest unvalidated assumption in the methodology (Part 4,
Composition Grammar). If it fails, mandatory grammar planning is simplified
or removed — the methodology is not defended.

## Blinding — still in force

The X/Y mapping was chosen at random by a script and written to a file
outside the repository. **Neither the evaluator nor the reader of this
document knows which rendered page (PAGE X / PAGE Y) came from which branch
(A / B).** Reading this dossier does not break that: the mapping layer is
independent of the branch filenames. The capture and QA scripts resolve the
mapping themselves; the evaluator only ever saw `pageX-*` and `pageY-*`.

Branch identities *within* this document are stated plainly (A = control,
B = grammar) because they are the experimental design, not the blind.

## Design

| | Branch A — CONTROL | Branch B — GRAMMAR |
|---|---|---|
| Planning method | normal professional design reasoning | composition-grammar vocabulary, 9 declarations per section + full-page plan |
| Could read `composition-grammar.md` | no | yes (and only that module) |
| Could read the project design skill | no | no |
| Could read the other branch | no | no |
| Executed by | isolated subagent | isolated subagent |
| Implementation budget | one honest pass, no aesthetic iteration | identical |

Both branches received the identical frozen brief below, the same live data
exports, the same token/constitution constraints, and the same environment.
The evaluator wrote neither page.

## Fairness check (mechanical, run before evaluation)

- Same real-data imports in both routes: `canonical-view`, `journey-marketing`,
  `journey-taxonomy`, `JourneyTopologyPreview` — identical set.
- Fabrication lint: 0 hits in both (no lorem/placeholder/TODO/example.com).
- Cross-branch contamination: 0 references in either direction.
- Single build, `tsc --noEmit` clean, both routes prerendered.

**Recorded asymmetries** (consequences of the method, not unfair advantages —
equalising them would have contaminated the control):

| | Branch A | Branch B |
|---|---|---|
| Plan length | 650 words | 2,363 words |
| Implementation | 302 lines | 417 lines |

---

## Contents

1. [Frozen shared brief](#brief)
2. [Branch A plan (control)](#plan-a)
3. [Branch B plan (grammar)](#plan-b)
4. [Branch A implementation](#code-a)
5. [Branch B implementation](#code-b)
6. [Measurement harness](#harness)
7. [Raw machine QA results](#machine)
8. [Blind visual critique](#critique)
9. [Status and what happens next](#status)

---

<a id="brief"></a>

## 1. Frozen shared brief

*Both branches received exactly this. It contains content, real data sources
and constraints — and deliberately no composition advice of any kind.*


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

---

<a id="plan-a"></a>

## 2. Branch A plan — CONTROL

*Written with ordinary professional design reasoning. No access to the
methodology.*


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

---

<a id="plan-b"></a>

## 3. Branch B plan — COMPOSITION GRAMMAR

*Written after reading `composition-grammar.md`, with the nine required
declarations per section and a full-page composition plan.*


# Experiment B — Composition Plan
## "Inside the Canonical Journey Library" — /experiment-b

Register for the whole page: **product marketing** (a real Lab project presented
to a visitor deciding whether to explore it). The page's working material is
itself a utility — the library at /lab/journeys — so the composition is a
marketing page that densifies toward a tool boundary.

Grounds used, in order: paper → paper-soft → paper → ink-950 (the single dark
plate) → paper. Three background shifts, each at a genuine content-group
boundary, never a zebra. Exactly one interruption plate; **no bleed anywhere**
(bleed conflicts with the interruption plate, and the page's one plate matters
more than an implied continuation the topology figures don't need).

---

## Section 1 — HERO (title + dek)

- **SECTION JOB**: Name the thing and prove in the same viewport that "each
  entry is a graph, not a sequence" is literal, not metaphor.
- **VISUAL ANCHOR**: The real topology of the largest journey in the corpus —
  `JourneyTopologyPreview` of the `JOURNEY_ROWS` entry with the maximum
  `nodeCount`, captioned with its real id, name, node count and category. The
  dek's three figures render live via `withCanonicalCount`.
- **COMPOSITION MOVE(S)**: **Statement + witness (6)**. The statement is the
  title + dek at the left; the witness is the real graph figure occupying the
  right half of the same visual field. No full-width anchor: the witness is
  one journey, not the library, and it shares the field with the claim rather
  than owning the band. No bleed (see above — and a cropped graph would slice
  through nodes, a semantically meaningful zone, which the grammar names as
  the bleed-as-error failure).
- **WIDTH / MEASURE BEHAVIOR**: `.altor-container` (1248px). Statement column
  holds a display measure (title `text-display-xl`, dek ≤ ~55ch); witness
  takes the remaining width. Stacks at tablet/mobile, witness below statement.
- **DENSITY LEVEL**: Airy — 2/5. Generous top padding, one figure, one caption.
- **TRANSITION FROM PREVIOUS SECTION**: n/a (page opening). First-viewport
  contract for marketing: name, scale, and the product's real shape are all
  above the fold.
- **TRANSITION TO NEXT SECTION**: Same paper ground; the seam is built from a
  **measure narrowing** into S-WHAT plus a full-width hairline (`line`), with
  tight combined padding (well under the 220px padding-only-seam threshold) —
  the register change does the work, not whitespace.
- **REGISTER JUSTIFICATION**: Statement+witness is listed Marketing-fit; a
  marketing hero whose witness is the product's own data (not an illustration)
  is exactly the move's purpose.
- **OVERUSE RISK**: If every later heading also gets a twinned witness the
  hero's pairing becomes formula — so S-WHAT and S-PRINCIPLES deliberately do
  NOT twin a figure to their headings.

## Section 2 — S-WHAT ("What it is")

- **SECTION JOB**: Define the object class (entity state machine, domain-
  neutral) in calm prose, and put the corpus's hard numbers on record next to
  the definition.
- **VISUAL ANCHOR**: The spec plate of real corpus figures (journeys,
  categories, total nodes, node kinds, orchestration rules, global rules —
  all from `JOURNEY_SCALE` / `canonical-view` exports).
- **COMPOSITION MOVE(S)**: **Measure narrowing (4)** — display register drops
  to reading prose; paired with a **colophon / spec plate (11)** sitting
  beside the prose as its factual record. Spec plate values are all import-
  derived (fabrication lint passes by construction).
- **WIDTH / MEASURE BEHAVIOR**: Section content capped at `max-w-[1120px]`;
  the prose column itself at reading measure (~46ch); the spec plate is the
  narrow right column (label–value rows in the mono meta register).
- **DENSITY LEVEL**: Light — 2.5/5. Prose plus one compact record.
- **TRANSITION FROM PREVIOUS SECTION**: Hairline + narrowed measure on the
  same paper ground (see above).
- **TRANSITION TO NEXT SECTION**: **Background shift (3)** to `paper-soft` —
  the page moves from "what the thing is" (prose) to "how it is built"
  (working vocabulary + distribution), and the shift marks that group
  boundary.
- **REGISTER JUSTIFICATION**: Measure narrowing is universal law at a genuine
  prose transition; the spec plate is listed Marketing-fit and replaces the
  fabricated-stat-row cliché with a traceable record.
- **OVERUSE RISK**: Bureaucratizing every later list into plates — the
  category distribution in S-SCALE is therefore rendered as a distribution,
  not as a second label–value plate.

## Section 3 — S-ANATOMY ("The anatomy of a journey")

- **SECTION JOB**: Teach the entire seven-kind vocabulary and let the reader
  verify it against the corpus's real per-kind weights.
- **VISUAL ANCHOR**: The seven-kind grid itself — each cell carries the kind's
  real Canvas silhouette (the `.jp-*` node grammar the library's own
  thumbnails use), the kind name, its role caption, and its real count from
  `NODE_KIND_COUNTS`.
- **COMPOSITION MOVE(S)**: **Repetition + break (9)** over **window-cards
  (10)**. The series is the seven kinds in real weight order (heaviest
  first); the genuinely deviant member is `outcome` — 1 node in the whole
  corpus, a fact that lives in the data, not in styling whim — and it alone
  gets the deviant treatment (dashed/success-marked cell with its ×1 count
  called out). Each cell holds silhouette + name + role + count: content-node
  diversity > 1, so the borders are earned cards, not fences.
- **WIDTH / MEASURE BEHAVIOR**: `.altor-container`. The verbatim body
  paragraph stays at reading measure above the grid (the S-ANATOMY body's
  "281" renders live from `CANONICAL_COUNT`); the grid then uses the full
  container width. 7 cells: 4+3 on desktop, 2-up tablet, 1-up mobile.
- **DENSITY LEVEL**: Medium — 3/5. First working band.
- **TRANSITION FROM PREVIOUS SECTION**: The background shift to paper-soft
  (declared above) is the seam.
- **TRANSITION TO NEXT SECTION**: Same paper-soft ground — S-ANATOMY and
  S-SCALE are one content group ("the corpus, examined"); the seam between
  them is a hairline + kicker with tight padding, under the detector
  threshold.
- **REGISTER JUSTIFICATION**: Repetition+break is universal; window-card is
  listed Marketing-fit. Using the library's own node silhouettes keeps the
  page and the product visibly one system.
- **OVERUSE RISK**: A second styled break in the same grid would collapse the
  pattern — exactly one deviant cell (`outcome`), checked.

## Section 4 — S-SCALE ("The shape of the corpus")

- **SECTION JOB**: Show the skew the body copy claims is informative — the
  real per-category distribution, every bar derivable from
  `JOURNEY_CATEGORY_COUNTS`.
- **VISUAL ANCHOR**: The distribution itself — all category rows, each with
  its real title, count, and a rule-bar proportional to count/max. Real data
  rendered as marks, not a chart image, so the no-fabricated-chart rule
  holds.
- **COMPOSITION MOVE(S)**: **Rail + body (5)** at row level: the mono
  count/label rail against the proportional bar body makes the long list
  scannable, and the rail content is real meta (counts), which is the move's
  input condition. No repetition+break here — the skew IS the information;
  singling out one row would fabricate an emphasis the data doesn't declare.
- **WIDTH / MEASURE BEHAVIOR**: `max-w-[1120px]`; rows flow in two columns on
  desktop, one column below, so the list reads as a field rather than a
  tower.
- **DENSITY LEVEL**: Dense — 4/5. The densest data band before the plate.
- **TRANSITION FROM PREVIOUS SECTION**: Continuous paper-soft ground, hairline
  seam (same group).
- **TRANSITION TO NEXT SECTION**: **Background shift (3)** to the page's one
  `ink-950` plate — the strongest seam on the page, spent where the content
  pivots from "the corpus's parts" to "the one thing that makes it a system".
- **REGISTER JUSTIFICATION**: Rail+body is neutral-to-strong outside
  Utility/Editorial and its input condition (real meta) is met; a marketing
  page may carry one dense evidence band precisely because its claim
  ("the skew is informative") needs the whole distribution as witness.
- **OVERUSE RISK**: Railing everything — this is the only rail+body band on
  the page.

## Section 5 — S-RULES ("What holds it together") — THE INTERRUPTION

- **SECTION JOB**: Stop the reader once, for the page's single takeaway: the
  library is not a pile of graphs, it is an orchestrated system — rules,
  global rules, and ids that never die.
- **VISUAL ANCHOR**: The two real figures — `RULE_COUNT` and
  `GLOBAL_RULE_COUNT` — set large in the mono register on the dark ground,
  beside the verbatim body.
- **COMPOSITION MOVE(S)**: **Interruption plate (8)** (the site-law single
  `bg-ink-950` plate), paired with **background shift (3)** on both edges.
  This is the page's only plate; no bleed exists anywhere on the page to
  compete with it.
- **WIDTH / MEASURE BEHAVIOR**: Plate ground is full-width; content inside at
  `.altor-container`, body prose at reading measure, the two figures as a
  short spec-row pair. Inverse rules (`line-inverse`) for internal seams.
- **DENSITY LEVEL**: Sparse content, maximum visual weight — the contrast is
  the density event.
- **TRANSITION FROM PREVIOUS SECTION**: paper-soft → ink-950 shift.
- **TRANSITION TO NEXT SECTION**: ink-950 → paper shift; the exit from the
  plate is the decompression that lets S-PRINCIPLES read as air.
- **REGISTER JUSTIFICATION**: Interruption plate budget for Marketing is
  exactly 1; this section carries the claim the dek already promised
  ("held together by N orchestration rules"), so it is the one thing worth
  stopping for.
- **OVERUSE RISK**: A second high-contrast plate would destroy this one —
  plate count on the page is 1, checked; nothing else uses `bg-ink-950`.

## Section 6 — S-PRINCIPLES ("Three positions the corpus takes")

- **SECTION JOB**: State the corpus's three verbatim positions as a calm,
  even triptych — conviction, not decoration — while the page breathes after
  the plate.
- **VISUAL ANCHOR**: The three numbered statements themselves; typography is
  the object. Principle 2's "281" renders live from `CANONICAL_COUNT`.
- **COMPOSITION MOVE(S)**: None forced — the grammar says not to force moves
  where none is needed. The structure is a plain three-column repetition with
  **no break** (all three positions are peers; a deviant member would be
  fabricated emphasis, and repetition+break's input condition — a genuinely
  deviant member — is absent). Mono index numerals (01/02/03) carry the meta
  register without a rail.
- **WIDTH / MEASURE BEHAVIOR**: `.altor-container`; three equal columns on
  desktop (each ~30ch), stacked at mobile. Each item's first sentence set as
  its lead.
- **DENSITY LEVEL**: Airy — 2/5, the deliberate decompression between the
  plate and the peak.
- **TRANSITION FROM PREVIOUS SECTION**: The ink-950 → paper background shift.
- **TRANSITION TO NEXT SECTION**: Same paper ground into S-EXPLORE; the seam
  is a hairline + kicker with tight padding (under threshold), because the
  final density climb should feel continuous, not sectioned off.
- **REGISTER JUSTIFICATION**: A positions/manifesto beat is native to product
  marketing; restraint here protects both the plate before it and the index
  after it.
- **OVERUSE RISK**: Twinning each position with a witness figure would
  re-run the hero's move as formula — the positions stand alone.

## Section 7 — S-EXPLORE ("Explore it") — PEAK + CLOSE

- **SECTION JOB**: Turn the page's argument into the tool: show enough of the
  real, linked library that opening it feels like continuing, then close on
  the single CTA.
- **VISUAL ANCHOR**: A 12-card field of real journeys — one per category for
  the twelve largest categories (deterministic, from `JOURNEY_ROWS` ×
  `JOURNEY_CATEGORY_COUNTS`), each card a real topology thumbnail + mono id +
  real name + node count, each linking to its real `/lab/journeys/{slug}`
  detail route. Beneath it, the 26 real goal labels (`GOALS` × `GOAL_LABEL`)
  as a mono texture strip — the literal witness for "filterable by goal".
- **COMPOSITION MOVE(S)**: **Index as texture (7)** — 12 real, linked items
  (≥10, all live hrefs: input condition met) — over **window-cards (10)**
  (each card: figure + id + name + count = diversity > 1). This is the dense
  end of the **density gradient (12)**, which the whole page has been
  climbing toward. No break in this grid: the texture's evenness is what
  sells multitude, and the one deviant-member budget was spent in S-ANATOMY
  where the data itself was deviant.
- **WIDTH / MEASURE BEHAVIOR**: `.altor-container`, 4-across desktop grid,
  2-across tablet, 1–2 at mobile. Closing row narrows to a centered single
  line: the functional "12 of N shown" count and the one primary CTA
  (`Open the library` → `/lab/journeys`) — the page's only `primary-600`
  surface.
- **DENSITY LEVEL**: Peak — 5/5 across the grid, resolving to a single
  centered action. Not an inverse-gradient deflation: the field hands off to
  the CTA, it doesn't trail into emptiness.
- **TRANSITION FROM PREVIOUS SECTION**: Hairline seam on shared paper ground.
- **TRANSITION TO NEXT SECTION**: n/a — page close. The CTA row plus a final
  hairline is the page's last mark.
- **REGISTER JUSTIFICATION**: Index-as-texture is listed strongest in
  Utility/Commerce/Portfolio; it is used here at the exact point where the
  marketing page becomes a doorway into a utility — the multitude is the
  product's core evidence, and every item is a real href into the tool. The
  Brand-register reversal (scarcity) does not apply: this register is
  product marketing for a corpus whose size is the claim.
- **OVERUSE RISK**: The wall. Capped at 12 items, uniform card anatomy, and a
  count line that tells the reader the rest lives behind the CTA.

---

## FULL-PAGE COMPOSITION PLAN

**OPENING** — The page opens airy on paper: a statement+witness hero where the
title and live-count dek share the first viewport with one real journey's
topology, captioned with its real identity. The first viewport therefore
carries name, scale, and proof-of-shape at once. A narrowed prose band
(S-WHAT) continues on the same ground, with the corpus's spec plate standing
quietly beside the definition.

**DENSITY DEVELOPMENT** — A background shift to paper-soft opens the working
group: the seven-kind anatomy grid (repetition with the corpus's one true
deviant, `outcome`, as the break) rises to medium density, and the full
category distribution (rail+body rows, real counts, proportional rules)
pushes to the page's densest data band. Occupancy climbs monotonically from
the hero through this group.

**MAJOR INTERRUPTION** — At the pivot from parts to system, the page's single
ink-950 plate stops the scroll: the orchestration claim, verbatim, with the
two real rule counts set large. Background shift on both edges; nothing else
on the page competes at this contrast; no bleed exists anywhere to fight it.

**PEAK** — After a short airy triptych of the three verbatim positions
(decompression that makes the plate land and the peak legible), the page
reaches its working surface: the 12-card index-as-texture of real, linked
journeys with their real topologies — the densest, most tool-like band, which
is the direction the marketing-register density gradient is required to run.

**RESOLUTION / CLOSING** — The texture resolves into one centered line: the
honest "12 of N" count, the 26 real goal labels as the final mono texture
beneath the grid, and the page's single primary CTA — Open the library —
pointing into `/lab/journeys`. The page ends on the doorway it was built to
open, one hairline below.

---

<a id="code-a"></a>

## 4. Branch A implementation — CONTROL

`src/app/(en)/experiment-a/page.tsx`

```tsx

import type { Metadata } from "next";
import Link from "next/link";
import JourneyTopologyPreview from "@/components/ui/JourneyTopologyPreview";
import {
  CANONICAL_COUNT,
  CATEGORY_COUNT,
  GLOBAL_RULE_COUNT,
  JOURNEY_ROWS,
  RULE_COUNT,
  withCanonicalCount,
} from "@/lib/canonical-view";
import {
  JOURNEY_CATEGORY_COUNTS,
  JOURNEY_SCALE,
  NODE_KIND_COUNTS,
  type NodeKind,
} from "@/lib/journey-marketing";
import { GOALS, GOAL_LABEL } from "@/lib/journey-taxonomy";

/* Standalone explainer for the Canonical Journey Library. Server component,
   statically rendered, no site chrome — <main> only. Every figure on the
   page is imported from the live library exports; nothing is typed in. */

const DEK = withCanonicalCount(
  "A library of {count} reusable lifecycle journeys across {categories} categories, held together by {rules} orchestration rules — each entry is a graph, not a sequence.",
);

export const metadata: Metadata = {
  title: "Inside the Canonical Journey Library - Ali Demirbaş",
  description: DEK,
};

/* ------------------------------------------------------------ real data */

/** The largest graph in the library — the hero's proof that even the most
    complex entry stays legible. Derived, never hard-picked. */
const HERO_JOURNEY = JOURNEY_ROWS.reduce((a, b) => (b.nodeCount > a.nodeCount ? b : a));

const nf = new Intl.NumberFormat("en-US");

const KIND_COUNT = new Map<NodeKind, number>(NODE_KIND_COUNTS.map((k) => [k.kind, k.count]));

/** The seven node kinds in the vocabulary's own teaching order. The role
    lines are lifted from the fixed anatomy copy — no new claims. */
const KIND_META: readonly { kind: NodeKind; label: string; role: string }[] = [
  { kind: "trigger", label: "Trigger", role: "Starts the journey from a real signal." },
  { kind: "condition", label: "Condition", role: "Branches it." },
  { kind: "wait", label: "Wait", role: "Holds it — resolving both ways, on event and on timeout." },
  { kind: "action", label: "Action", role: "Does the work." },
  { kind: "handoff", label: "Handoff", role: "Transfers the entity to another journey." },
  { kind: "outcome", label: "Outcome", role: "Ends it with a result." },
  { kind: "exit", label: "Exit", role: "Ends it without one." },
];

const MAX_CATEGORY = JOURNEY_CATEGORY_COUNTS[0]?.count ?? 1;

/* ------------------------------------------------------- local pieces */

function SectionHeading({ index, title }: { index: string; title: string }) {
  return (
    <div>
      <p className="font-mono text-xs uppercase tracking-[0.18em] text-ink-400">{index}</p>
      <h2 className="mt-3 text-h2-fluid font-semibold text-ink-900">{title}</h2>
    </div>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="border-t border-line-strong pt-4">
      <p className="font-mono text-3xl font-medium tracking-tight text-ink-900">{value}</p>
      <p className="mt-1.5 text-xs uppercase tracking-[0.14em] text-ink-500">{label}</p>
    </div>
  );
}

/* ---------------------------------------------------------------- page */

export default function ExperimentAPage() {
  return (
    <main className="bg-paper text-ink-900">
      {/* ------------------------------------------------------- hero */}
      <header className="altor-container pt-20 pb-16 sm:pt-28 md:pt-32">
        <p className="font-mono text-xs uppercase tracking-[0.18em] text-ink-500">
          Lab · Open source
        </p>
        <h1 className="mt-5 max-w-[15ch] text-display-xl text-ink-950">
          Inside the Canonical Journey Library
        </h1>
        <p className="mt-6 max-w-[52ch] text-xl text-ink-500">{DEK}</p>

        <div className="mt-12 grid grid-cols-2 gap-x-6 gap-y-8 sm:grid-cols-4 md:mt-16">
          <Stat value={String(CANONICAL_COUNT)} label="Journeys" />
          <Stat value={String(CATEGORY_COUNT)} label="Categories" />
          <Stat value={nf.format(JOURNEY_SCALE.nodes)} label="Nodes" />
          <Stat value={String(RULE_COUNT + GLOBAL_RULE_COUNT)} label="Rules" />
        </div>

        {/* One real figure from the corpus: the library's largest graph,
            drawn by the same layout engine the library cards use. */}
        <figure className="mt-14 md:mt-20">
          <div className="rounded-2xl border border-line bg-paper-soft px-4 py-6 sm:px-8 sm:py-8">
            <div className="mx-auto aspect-[1000/440] w-full max-w-[880px]">
              <JourneyTopologyPreview preview={HERO_JOURNEY.preview} />
            </div>
          </div>
          <figcaption className="mt-3 flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <span className="font-mono text-xs uppercase tracking-[0.14em] text-ink-400">
              {HERO_JOURNEY.id}
            </span>
            <span className="text-sm text-ink-600">
              {HERO_JOURNEY.name} — the library&apos;s largest graph, {HERO_JOURNEY.nodeCount}{" "}
              nodes, drawn from its real topology.
            </span>
          </figcaption>
        </figure>
      </header>

      {/* ------------------------------------------------------- what */}
      <section className="altor-container py-16 md:py-24">
        <div className="max-w-[760px]">
          <SectionHeading index="01" title="What it is" />
          <p className="mt-6 max-w-[62ch] text-lg leading-relaxed text-ink-600">
            Every journey in the library is an entity state machine: it describes how one thing —
            a subscription, a consent record, an incident, a delivery — moves through its
            lifecycle. The library is domain-neutral by construction, so the same journey serves
            an e-commerce order and an insurance claim without rewriting.
          </p>
        </div>
      </section>

      {/* ---------------------------------------------------- anatomy */}
      <section className="altor-container py-16 md:py-24">
        <div className="max-w-[760px]">
          <SectionHeading index="02" title="The anatomy of a journey" />
          <p className="mt-6 max-w-[62ch] text-lg leading-relaxed text-ink-600">
            Seven node kinds are the entire vocabulary. A trigger starts the journey from a real
            signal. A condition branches it. A wait holds it — and every wait resolves both ways,
            on event and on timeout. An action does the work. A handoff transfers the entity to
            another journey. An outcome ends it with a result; an exit ends it without one.
            Nothing else exists, which is what keeps {CANONICAL_COUNT} graphs readable.
          </p>
        </div>

        <ul className="mt-12 grid grid-cols-1 gap-px overflow-hidden rounded-2xl border border-line bg-line sm:grid-cols-2 xl:grid-cols-4">
          {KIND_META.map(({ kind, label, role }) => (
            <li key={kind} className="bg-paper p-6">
              <div className="flex items-baseline justify-between gap-4">
                <h3 className="text-h6 font-semibold text-ink-900">{label}</h3>
                <span className="font-mono text-sm text-ink-400">
                  ×{nf.format(KIND_COUNT.get(kind) ?? 0)}
                </span>
              </div>
              <p className="mt-2 text-sm leading-relaxed text-ink-500">{role}</p>
            </li>
          ))}
          {/* The count under each kind is its real total across the corpus. */}
          <li className="bg-paper-soft p-6">
            <p className="text-sm leading-relaxed text-ink-500">
              <span className="font-mono text-ink-400">×n</span> — how many of each kind exist
              across all {nf.format(JOURNEY_SCALE.nodes)} nodes in the corpus.
            </p>
          </li>
        </ul>
      </section>

      {/* ------------------------------------------------------ scale */}
      <section className="altor-container py-16 md:py-24">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-16">
          <div>
            <SectionHeading index="03" title="The shape of the corpus" />
            <p className="mt-6 max-w-[46ch] text-lg leading-relaxed text-ink-600">
              The corpus is not evenly distributed, and the skew is informative: lifecycle work
              clusters where entities change state most often.
            </p>
            <p className="mt-6 font-mono text-xs uppercase tracking-[0.14em] text-ink-400">
              Journeys per category · all {CATEGORY_COUNT}
            </p>
          </div>

          <ol className="space-y-4">
            {JOURNEY_CATEGORY_COUNTS.map((c) => (
              <li key={c.id}>
                <div className="flex items-baseline justify-between gap-4">
                  <span className="text-sm font-medium text-ink-800">{c.title}</span>
                  <span className="font-mono text-sm text-ink-500">{c.count}</span>
                </div>
                <div className="mt-1.5 h-1.5 rounded-full bg-ink-100">
                  <div
                    className="h-1.5 rounded-full bg-ink-900"
                    style={{ width: `${Math.max((c.count / MAX_CATEGORY) * 100, 2)}%` }}
                  />
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ------------------------------------------------------ rules */}
      <section className="altor-container py-16 md:py-24">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:gap-16">
          <div className="max-w-[760px]">
            <SectionHeading index="04" title="What holds it together" />
            <p className="mt-6 max-w-[62ch] text-lg leading-relaxed text-ink-600">
              Journeys do not run in isolation. Orchestration rules describe how they hand off,
              suppress and wake each other; global rules apply to every journey at once. Retired
              journey ids do not 404 — each one resolves into the journey that absorbed it.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-6 self-end">
            <div className="border-t border-line-strong pt-4">
              <p className="font-mono text-4xl font-medium tracking-tight text-ink-900">
                {RULE_COUNT}
              </p>
              <p className="mt-1.5 text-xs uppercase tracking-[0.14em] text-ink-500">
                Orchestration rules
              </p>
            </div>
            <div className="border-t border-line-strong pt-4">
              <p className="font-mono text-4xl font-medium tracking-tight text-ink-900">
                {GLOBAL_RULE_COUNT}
              </p>
              <p className="mt-1.5 text-xs uppercase tracking-[0.14em] text-ink-500">
                Global rules
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------- principles */}
      <section className="altor-container py-16 md:py-24">
        <SectionHeading index="05" title="Three positions the corpus takes" />
        <ol className="mt-12 grid grid-cols-1 gap-10 md:grid-cols-3 md:gap-8">
          <li>
            <p className="font-mono text-5xl font-medium text-ink-200">1</p>
            <p className="mt-4 text-base leading-relaxed text-ink-600">
              <strong className="font-semibold text-ink-900">Graphs, not sequences.</strong> A
              journey is where it forks, what each arm means, and what happens when a wait runs
              out — not a numbered list of steps.
            </p>
          </li>
          <li>
            <p className="font-mono text-5xl font-medium text-ink-200">2</p>
            <p className="mt-4 text-base leading-relaxed text-ink-600">
              <strong className="font-semibold text-ink-900">
                Entity state machines, not one customer timeline.
              </strong>{" "}
              {CANONICAL_COUNT} independent lifecycles beat one mythical funnel.
            </p>
          </li>
          <li>
            <p className="font-mono text-5xl font-medium text-ink-200">3</p>
            <p className="mt-4 text-base leading-relaxed text-ink-600">
              <strong className="font-semibold text-ink-900">
                Domain-neutral by construction.
              </strong>{" "}
              Nothing in a journey names an industry; the same machine runs wherever the entity
              exists.
            </p>
          </li>
        </ol>
      </section>

      {/* ---------------------------------- explore: the one dark plate */}
      <section className="bg-ink-950">
        <div className="altor-container py-20 md:py-28">
          <p className="font-mono text-xs uppercase tracking-[0.18em] text-ink-400">06</p>
          <h2 className="mt-3 text-h2-fluid font-semibold text-white">Explore it</h2>
          <p className="mt-5 max-w-[46ch] text-lg leading-relaxed text-ink-300">
            The full library is searchable and filterable by goal.
          </p>

          <ul className="mt-10 flex max-w-[880px] flex-wrap gap-2">
            {GOALS.map((g) => (
              <li
                key={g}
                className="rounded-full border border-line-inverse px-3 py-1 font-mono text-xs text-ink-300"
              >
                {GOAL_LABEL[g].en}
              </li>
            ))}
          </ul>
          <p className="mt-3 font-mono text-xs uppercase tracking-[0.14em] text-ink-500">
            The {GOALS.length} goals, as they filter
          </p>

          <div className="mt-12">
            <Link
              href="/lab/journeys"
              className="inline-flex items-center gap-2 rounded-full bg-primary-600 px-7 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-primary-500"
            >
              Open the library
              <span aria-hidden>→</span>
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
```


---

<a id="code-b"></a>

## 5. Branch B implementation — COMPOSITION GRAMMAR

`src/app/(en)/experiment-b/page.tsx`

```tsx

import type { Metadata } from "next";
import Link from "next/link";
import JourneyTopologyPreview from "@/components/ui/JourneyTopologyPreview";
import {
  CANONICAL_COUNT,
  CATEGORY_COUNT,
  GLOBAL_RULE_COUNT,
  JOURNEY_ROWS,
  RULE_COUNT,
  withCanonicalCount,
  type JourneyRow,
} from "@/lib/canonical-view";
import {
  JOURNEY_CATEGORY_COUNTS,
  JOURNEY_SCALE,
  NODE_KIND_COUNTS,
  type NodeKind,
} from "@/lib/journey-marketing";
import { GOALS, GOAL_LABEL } from "@/lib/journey-taxonomy";

/* Experiment B — "Inside the Canonical Journey Library".

   Standalone, unlinked explainer route. Composition follows
   /experiment-b-plan.md (composition-grammar vocabulary): statement+witness
   hero → measure-narrowed definition with a spec plate → repetition+break
   anatomy grid on shifted ground → rail+body distribution → the page's one
   interruption plate (site's single ink-950 surface) → an unforced triptych
   → index-as-texture peak resolving into the single CTA.

   Server component; every figure on the page is imported live from the
   canonical read models. Nothing is typed by hand. */

const DEK = withCanonicalCount(
  "A library of {count} reusable lifecycle journeys across {categories} categories, held together by {rules} orchestration rules — each entry is a graph, not a sequence.",
);

export const metadata: Metadata = {
  title: "Inside the Canonical Journey Library",
  description: DEK,
};

const fmt = (n: number) => n.toLocaleString("en-US");

/* ---- Real objects picked deterministically from the corpus ------------- */

/** Hero witness: the largest graph in the library. */
const HERO_JOURNEY: JourneyRow = JOURNEY_ROWS.reduce((max, row) =>
  row.nodeCount > max.nodeCount ? row : max,
);

/** Explore index: one journey per category for the twelve largest
    categories — in each, the category's biggest graph. Deterministic, real,
    and every card links to its live detail route. */
const EXPLORE_ROWS: JourneyRow[] = JOURNEY_CATEGORY_COUNTS.slice(0, 12)
  .map((cat) =>
    JOURNEY_ROWS.filter((row) => row.category === cat.id).reduce((max, row) =>
      row.nodeCount > max.nodeCount ? row : max,
    ),
  )
  .filter((row): row is JourneyRow => Boolean(row));

/* ---- Node-kind silhouettes (the library's own .jp-* grammar) ----------- */

const KIND_GLYPH: Record<NodeKind, { w: number; h: number; r: number }> = {
  trigger: { w: 30, h: 17, r: 3 },
  action: { w: 30, h: 16, r: 3 },
  condition: { w: 26, h: 16, r: 8 },
  wait: { w: 26, h: 16, r: 8 },
  handoff: { w: 30, h: 16, r: 3 },
  outcome: { w: 30, h: 16, r: 3 },
  exit: { w: 30, h: 16, r: 3 },
};

/** The Canvas node grammar reduced to one silhouette, exactly as the
    library's topology thumbnails draw it (colours live in globals.css under
    `.jp-*`), so the anatomy grid and the product read as one system. */
function NodeKindGlyph({ kind }: { kind: NodeKind }) {
  const g = KIND_GLYPH[kind];
  const x = (48 - g.w) / 2;
  const y = (28 - g.h) / 2;
  return (
    <svg
      viewBox="0 0 48 28"
      className="jp h-7 w-12"
      style={{ "--jp-node-w": 1.6, "--jp-edge-w": 1.6 } as React.CSSProperties}
      aria-hidden
      focusable="false"
    >
      <rect x={x} y={y} width={g.w} height={g.h} rx={g.r} className={`jp-${kind}`} />
      {kind === "action" ? (
        <rect x={x} y={y} width={2.4} height={g.h} rx={1.2} className="jp-rule" />
      ) : null}
    </svg>
  );
}

/** Role captions — restatements of the S-ANATOMY body, no new claims. */
const KIND_ROLE: Record<NodeKind, string> = {
  trigger: "starts the journey from a real signal",
  condition: "branches it",
  wait: "holds it — resolves on event and on timeout",
  action: "does the work",
  handoff: "transfers the entity to another journey",
  outcome: "ends it with a result",
  exit: "ends it without one",
};

/* ---- Small shared pieces ------------------------------------------------ */

function Kicker({ children }: { children: React.ReactNode }) {
  return <p className="altor-eyebrow text-ink-400">{children}</p>;
}

function SpecRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-6 border-b border-line py-2.5 last:border-b-0">
      <dt className="altor-eyebrow text-ink-400">{label}</dt>
      <dd className="font-mono text-sm text-ink-900 tabular-nums">{value}</dd>
    </div>
  );
}

/* ========================================================================= */

export default function ExperimentBPage() {
  const maxCategory = JOURNEY_CATEGORY_COUNTS[0]?.count ?? 1;
  const rarest = NODE_KIND_COUNTS[NODE_KIND_COUNTS.length - 1];

  return (
    <main className="bg-paper text-ink-900">
      {/* ================= HERO — statement + witness ==================== */}
      <section className="altor-container pt-16 pb-14 sm:pt-24 sm:pb-16">
        <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] lg:gap-16">
          <div>
            <Kicker>Lab · Canonical Journey Library</Kicker>
            <h1 className="mt-4 text-display-xl text-balance">
              Inside the Canonical Journey Library
            </h1>
            <p className="mt-6 max-w-[55ch] text-lg leading-relaxed text-ink-500">{DEK}</p>
          </div>
          <figure className="min-w-0">
            <div className="rounded-lg border border-line bg-paper-soft p-4 sm:p-6">
              <div className="aspect-[1000/440]">
                <JourneyTopologyPreview preview={HERO_JOURNEY.preview} />
              </div>
            </div>
            <figcaption className="mt-3 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 font-mono text-[11px] tracking-[0.08em] text-ink-400 uppercase">
              <span className="text-ink-500">
                {HERO_JOURNEY.id} · {HERO_JOURNEY.name}
              </span>
              <span>
                {HERO_JOURNEY.nodeCount} nodes · {HERO_JOURNEY.categoryTitle}
              </span>
            </figcaption>
          </figure>
        </div>
      </section>

      {/* ================= S-WHAT — narrowed prose + spec plate ========== */}
      <section className="altor-container border-t border-line pt-12 pb-16 sm:pb-20">
        <div className="mx-auto grid max-w-[1120px] gap-10 lg:grid-cols-[minmax(0,7fr)_minmax(0,4fr)] lg:gap-20">
          <div>
            <Kicker>What it is</Kicker>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight">What it is</h2>
            <p className="mt-5 max-w-[46ch] text-base leading-relaxed text-ink-500 sm:text-lg">
              Every journey in the library is an entity state machine: it describes how one
              thing — a subscription, a consent record, an incident, a delivery — moves
              through its lifecycle. The library is domain-neutral by construction, so the
              same journey serves an e-commerce order and an insurance claim without
              rewriting.
            </p>
          </div>
          <dl className="self-end border-t border-line-strong">
            <SpecRow label="Journeys" value={fmt(CANONICAL_COUNT)} />
            <SpecRow label="Categories" value={fmt(CATEGORY_COUNT)} />
            <SpecRow label="Nodes" value={fmt(JOURNEY_SCALE.nodes)} />
            <SpecRow label="Node kinds" value={fmt(JOURNEY_SCALE.nodeKinds)} />
            <SpecRow label="Orchestration rules" value={fmt(RULE_COUNT)} />
            <SpecRow label="Global rules" value={fmt(GLOBAL_RULE_COUNT)} />
          </dl>
        </div>
      </section>

      {/* ============ S-ANATOMY — repetition + break on shifted ground === */}
      <section className="bg-paper-soft">
        <div className="altor-container pt-16 pb-14 sm:pt-20">
          <Kicker>The vocabulary</Kicker>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight">
            The anatomy of a journey
          </h2>
          <p className="mt-5 max-w-[62ch] text-base leading-relaxed text-ink-500 sm:text-lg">
            Seven node kinds are the entire vocabulary. A trigger starts the journey from a
            real signal. A condition branches it. A wait holds it — and every wait resolves
            both ways, on event and on timeout. An action does the work. A handoff transfers
            the entity to another journey. An outcome ends it with a result; an exit ends it
            without one. Nothing else exists, which is what keeps {CANONICAL_COUNT} graphs
            readable.
          </p>

          <ul className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {NODE_KIND_COUNTS.map(({ kind, count }) => {
              const deviant = kind === rarest?.kind;
              return (
                <li
                  key={kind}
                  className={`rounded-lg border bg-paper p-5 ${
                    deviant ? "border-ink-950" : "border-line"
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <NodeKindGlyph kind={kind} />
                    <span
                      className={`font-mono text-sm tabular-nums ${
                        deviant ? "font-semibold text-ink-950" : "text-ink-400"
                      }`}
                    >
                      ×{fmt(count)}
                    </span>
                  </div>
                  <h3 className="mt-4 text-sm font-semibold capitalize">{kind}</h3>
                  <p className="mt-1 text-sm leading-snug text-ink-500">{KIND_ROLE[kind]}</p>
                  {deviant ? (
                    <p className="altor-eyebrow mt-3 text-ink-950">
                      {fmt(count)} of {fmt(JOURNEY_SCALE.nodes)} nodes in the corpus
                    </p>
                  ) : null}
                </li>
              );
            })}
          </ul>
        </div>

        {/* ============ S-SCALE — rail + body distribution =============== */}
        <div className="altor-container border-t border-line pt-12 pb-16 sm:pb-20">
          <div className="mx-auto max-w-[1120px]">
            <Kicker>The distribution</Kicker>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight">
              The shape of the corpus
            </h2>
            <p className="mt-5 max-w-[62ch] text-base leading-relaxed text-ink-500 sm:text-lg">
              The corpus is not evenly distributed, and the skew is informative: lifecycle
              work clusters where entities change state most often.
            </p>

            <div className="mt-10 grid gap-x-16 gap-y-4 md:grid-cols-2">
              {JOURNEY_CATEGORY_COUNTS.map((cat) => (
                <div key={cat.id} className="min-w-0">
                  <div className="flex items-baseline justify-between gap-4">
                    <span className="truncate text-sm text-ink-700">{cat.title}</span>
                    <span className="font-mono text-xs text-ink-400 tabular-nums">
                      {cat.count}
                    </span>
                  </div>
                  <div className="mt-1.5 h-px w-full bg-line">
                    <div
                      className="h-[3px] -translate-y-px bg-ink-700"
                      style={{ width: `${(cat.count / maxCategory) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
            <p className="altor-eyebrow mt-8 text-ink-400">
              {fmt(CANONICAL_COUNT)} journeys across {fmt(CATEGORY_COUNT)} categories — real
              counts, largest first
            </p>
          </div>
        </div>
      </section>

      {/* ========= S-RULES — the page's single interruption plate ======== */}
      <section className="bg-ink-950 text-white">
        <div className="altor-container py-16 sm:py-24">
          <div className="grid gap-12 lg:grid-cols-[minmax(0,7fr)_minmax(0,4fr)] lg:gap-20">
            <div>
              <p className="altor-eyebrow text-ink-400">The system</p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                What holds it together
              </h2>
              <p className="mt-6 max-w-[52ch] text-base leading-relaxed text-ink-300 sm:text-lg">
                Journeys do not run in isolation. Orchestration rules describe how they hand
                off, suppress and wake each other; global rules apply to every journey at
                once. Retired journey ids do not 404 — each one resolves into the journey
                that absorbed it.
              </p>
            </div>
            <dl className="grid grid-cols-2 gap-10 self-end border-t border-line-inverse pt-8 lg:grid-cols-1 lg:gap-8">
              <div>
                <dd className="font-mono text-5xl font-semibold tabular-nums sm:text-6xl">
                  {fmt(RULE_COUNT)}
                </dd>
                <dt className="altor-eyebrow mt-2 text-ink-400">Orchestration rules</dt>
              </div>
              <div>
                <dd className="font-mono text-5xl font-semibold tabular-nums sm:text-6xl">
                  {fmt(GLOBAL_RULE_COUNT)}
                </dd>
                <dt className="altor-eyebrow mt-2 text-ink-400">
                  Global rules, on every journey
                </dt>
              </div>
            </dl>
          </div>
        </div>
      </section>

      {/* ============ S-PRINCIPLES — unforced triptych ==================== */}
      <section className="altor-container pt-16 pb-14 sm:pt-20">
        <Kicker>Positions</Kicker>
        <h2 className="mt-3 text-3xl font-semibold tracking-tight">
          Three positions the corpus takes
        </h2>
        <ol className="mt-10 grid gap-10 md:grid-cols-3 md:gap-8">
          <li className="border-t border-line-strong pt-5">
            <span className="font-mono text-xs text-ink-400">01</span>
            <p className="mt-3 text-base leading-relaxed">
              <strong className="font-semibold">Graphs, not sequences.</strong>{" "}
              <span className="text-ink-500">
                A journey is where it forks, what each arm means, and what happens when a
                wait runs out — not a numbered list of steps.
              </span>
            </p>
          </li>
          <li className="border-t border-line-strong pt-5">
            <span className="font-mono text-xs text-ink-400">02</span>
            <p className="mt-3 text-base leading-relaxed">
              <strong className="font-semibold">
                Entity state machines, not one customer timeline.
              </strong>{" "}
              <span className="text-ink-500">
                {CANONICAL_COUNT} independent lifecycles beat one mythical funnel.
              </span>
            </p>
          </li>
          <li className="border-t border-line-strong pt-5">
            <span className="font-mono text-xs text-ink-400">03</span>
            <p className="mt-3 text-base leading-relaxed">
              <strong className="font-semibold">Domain-neutral by construction.</strong>{" "}
              <span className="text-ink-500">
                Nothing in a journey names an industry; the same machine runs wherever the
                entity exists.
              </span>
            </p>
          </li>
        </ol>
      </section>

      {/* ====== S-EXPLORE — index as texture, resolving to the CTA ======= */}
      <section className="altor-container border-t border-line pt-12 pb-20 sm:pb-24">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <Kicker>The library</Kicker>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight">Explore it</h2>
            <p className="mt-4 max-w-[46ch] text-base leading-relaxed text-ink-500 sm:text-lg">
              The full library is searchable and filterable by goal.
            </p>
          </div>
          <p className="altor-eyebrow text-ink-400">
            Showing {EXPLORE_ROWS.length} of {fmt(CANONICAL_COUNT)} journeys
          </p>
        </div>

        <ul className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {EXPLORE_ROWS.map((row) => (
            <li key={row.id} className="min-w-0">
              <Link
                href={`/lab/journeys/${row.slug}`}
                className="group block rounded-lg border border-line bg-paper transition-colors hover:border-line-strong"
              >
                <div className="border-b border-line bg-paper-soft p-3">
                  <div className="aspect-[1000/440]">
                    <JourneyTopologyPreview preview={row.preview} />
                  </div>
                </div>
                <div className="p-4">
                  <p className="font-mono text-[11px] tracking-[0.08em] text-ink-400 uppercase">
                    {row.id} · {row.nodeCount} nodes
                  </p>
                  <h3 className="mt-1.5 truncate text-sm font-semibold" title={row.name}>
                    {row.name}
                  </h3>
                  <p className="mt-0.5 truncate text-xs text-ink-500">{row.categoryTitle}</p>
                </div>
              </Link>
            </li>
          ))}
        </ul>

        {/* The 26 real goal facets — the literal witness for "filterable by
            goal". Texture, not navigation: the filter itself lives in the
            library. */}
        <div className="mt-12 border-t border-line pt-8">
          <p className="altor-eyebrow text-ink-400">
            {GOALS.length} goals to filter by
          </p>
          <p className="mt-4 font-mono text-[11px] leading-6 tracking-[0.06em] text-ink-400 uppercase">
            {GOALS.map((goal, i) => (
              <span key={goal}>
                {i > 0 ? <span className="mx-2 text-ink-200">/</span> : null}
                <span className="whitespace-nowrap">{GOAL_LABEL[goal].en}</span>
              </span>
            ))}
          </p>
        </div>

        <div className="mt-14 flex justify-center">
          <Link
            href="/lab/journeys"
            className="inline-flex items-center rounded-md bg-primary-600 px-7 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-primary-700 active:bg-primary-800"
          >
            Open the library
          </Link>
        </div>
      </section>
    </main>
  );
}
```


---

<a id="harness"></a>

## 6. Measurement harness

Three scripts. The QA wrapper and the capture script resolve the hidden X/Y
mapping themselves, so the evaluator never learns it from running them.

### `xp-qa.tmp.mjs` — the metric battery

Measures, from real DOM boxes at 1440px with motion settled: page height,
horizontal overflow, section count, absence ratio, horizontal-space
utilization, silhouette CV, padding-only seams, seam patterns, section-height
distribution, repeated section structures, text-measure violations.

```js

/* Experiment QA battery — measures one page, writes JSON. Extended with
   horizontal-space utilization, section-height distribution, and repeated
   section-structure frequency. */
import puppeteer from "puppeteer-core";
import fs from "fs";
const url = process.argv[2], tag = process.argv[3];
const b = await puppeteer.launch({ executablePath: "/opt/pw-browsers/chromium", args: ["--no-sandbox"] });
const pg = await b.newPage();
await pg.setViewport({ width: 1440, height: 1000 });
await pg.goto(url, { waitUntil: "networkidle2", timeout: 60000 });
const H0 = await pg.evaluate(() => document.body.scrollHeight);
for (let y = 0; y < H0; y += 400) { await pg.evaluate(v => window.scrollTo(0, v), y); await new Promise(r=>setTimeout(r,80)); }
await pg.evaluate(() => window.scrollTo(0, 0)); await new Promise(r=>setTimeout(r,500));
const m = await pg.evaluate(() => {
  const W = 1440;
  const boxes = [];
  const walk = (el) => {
    for (const c of el.children) walk(c);
    const hasText = [...el.childNodes].some(n => n.nodeType === 3 && n.textContent.trim().length > 1);
    const intrinsic = ["IMG","SVG","CANVAS","VIDEO","BUTTON","INPUT","SELECT","TEXTAREA","A"].includes(el.tagName) && el.children.length === 0;
    if (!hasText && !intrinsic) return;
    const cs = getComputedStyle(el);
    if (cs.visibility === "hidden" || cs.display === "none" || +cs.opacity === 0) return;
    const r = el.getBoundingClientRect();
    if (r.width < 8 || r.height < 8) return;
    boxes.push({ x: r.left + scrollX, y: r.top + scrollY, w: r.width, h: r.height });
  };
  walk(document.body);
  const H = document.body.scrollHeight;
  const BAND = 100, nb = Math.ceil(H / BAND);
  const bands = Array.from({ length: nb }, () => ({ any: false, maxRight: 0, minLeft: W }));
  for (const b0 of boxes) {
    const b1 = Math.max(0, Math.floor(b0.y / BAND)), b2 = Math.min(nb - 1, Math.floor((b0.y + b0.h) / BAND));
    for (let i = b1; i <= b2; i++) { bands[i].any = true;
      bands[i].maxRight = Math.max(bands[i].maxRight, b0.x + b0.w);
      bands[i].minLeft = Math.min(bands[i].minLeft, b0.x); }
  }
  const main = document.querySelector("main") ?? document.body;
  const mr = main.getBoundingClientRect();
  const mTop = Math.floor((mr.top + scrollY) / BAND), mBot = Math.ceil((mr.bottom + scrollY) / BAND);
  const mb = bands.slice(Math.max(0, mTop), Math.min(nb, mBot));
  const withC = mb.filter(x => x.any);
  const spans = withC.map(x => (x.maxRight - x.minLeft) / W);
  const meanSpan = spans.reduce((a,c)=>a+c,0) / (spans.length || 1);
  const rights = withC.map(x => x.maxRight);
  const rmean = rights.reduce((a,c)=>a+c,0)/(rights.length||1);
  const rsd = Math.sqrt(rights.reduce((a,c)=>a+(c-rmean)**2,0)/(rights.length||1));
  // sections
  const secs = [...main.querySelectorAll("section")];
  const seams = [];
  for (let i = 0; i + 1 < secs.length; i++) {
    const a = secs[i].getBoundingClientRect(), c = secs[i+1].getBoundingClientRect();
    const bgA = getComputedStyle(secs[i]).backgroundColor, bgB = getComputedStyle(secs[i+1]).backgroundColor;
    const padA = parseFloat(getComputedStyle(secs[i]).paddingBottom), padB = parseFloat(getComputedStyle(secs[i+1]).paddingTop);
    seams.push({ gap: Math.round(padA + padB + Math.max(0, c.top - a.bottom)), bgChange: bgA !== bgB });
  }
  const heights = secs.map(s => Math.round(s.getBoundingClientRect().height));
  // structure signature: tag sequence of direct children (depth 2)
  const sig = (el) => [...el.children].map(c => c.tagName + (c.children.length ? "(" + [...c.children].map(g=>g.tagName).join(",") + ")" : "")).join("|");
  const sigs = secs.map(sig);
  const dupSecs = sigs.length - new Set(sigs).size;
  // text measure violations: text blocks wider than ~75ch approx (75 * 8.2px ≈ 615... use ch via canvas? approximate with 720px for 16px font)
  let measureViol = 0;
  for (const el of main.querySelectorAll("p")) {
    const r = el.getBoundingClientRect();
    const fs2 = parseFloat(getComputedStyle(el).fontSize);
    if (r.width > 46 * fs2 * 0.62 * 1.35) measureViol++; // ≈ >62ch
  }
  return {
    pageHeight: H,
    overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
    sections: secs.length,
    absenceRatio: +((mb.length - withC.length) / (mb.length || 1)).toFixed(3),
    horizontalUtilization: +meanSpan.toFixed(3),
    silhouetteCV: +(rsd / (rmean || 1)).toFixed(3),
    paddingOnlySeams: seams.filter(s => !s.bgChange && s.gap > 220).length,
    seams: seams.map(s => `${s.gap}px${s.bgChange ? "+bg" : " SAME"}`),
    sectionHeights: heights,
    sectionHeightCV: +( (arr=>{const m2=arr.reduce((a,c)=>a+c,0)/arr.length;return Math.sqrt(arr.reduce((a,c)=>a+(c-m2)**2,0)/arr.length)/m2;})(heights.length?heights:[1]) ).toFixed(3),
    repeatedSectionStructures: dupSecs,
    textMeasureViolations: measureViol,
  };
});
console.log(JSON.stringify({ tag, ...m }));
fs.writeFileSync(`/tmp/xp-${tag}.json`, JSON.stringify(m, null, 1));
await b.close();
```

### `xp-qa-blind.sh` — blind wrapper

```bash

#!/bin/bash
PORT=$1
X=$(grep '^X=' /tmp/xp-mapping.txt | cut -d= -f2)
Y=$(grep '^Y=' /tmp/xp-mapping.txt | cut -d= -f2)
node xp-qa.tmp.mjs "http://127.0.0.1:$PORT/$X" X 2>/dev/null | sed 's/"tag":"X"/"page":"X"/'
node xp-qa.tmp.mjs "http://127.0.0.1:$PORT/$Y" Y 2>/dev/null | sed 's/"tag":"Y"/"page":"Y"/'
```

### `xp-shoot.tmp.mjs` — blind capture

```js

import puppeteer from "puppeteer-core";
import fs from "fs";
const map = Object.fromEntries(fs.readFileSync("/tmp/xp-mapping.txt","utf8").trim().split("\n").map(l => l.split("=")));
const port = process.argv[2];
const b = await puppeteer.launch({ executablePath: "/opt/pw-browsers/chromium", args: ["--no-sandbox"] });
const wait = ms => new Promise(r => setTimeout(r, ms));
for (const label of ["X","Y"]) {
  const route = map[label];
  const pg = await b.newPage();
  for (const [w, tag] of [[1440,"desktop"],[834,"tablet"],[390,"mobile"]]) {
    await pg.setViewport({ width: w, height: 1000 });
    await pg.goto(`http://127.0.0.1:${port}/${route}`, { waitUntil: "networkidle2", timeout: 60000 });
    const h = await pg.evaluate(() => document.body.scrollHeight);
    for (let y = 0; y < h; y += 400) { await pg.evaluate(v => window.scrollTo(0, v), y); await wait(70); }
    await pg.evaluate(() => window.scrollTo(0, 0)); await wait(450);
    if (tag === "desktop") {
      // full page in slices
      const stops = []; for (let y = 0; y < h; y += 950) stops.push(y);
      for (const [i, y] of stops.entries()) {
        await pg.evaluate(v => window.scrollTo(0, v), y); await wait(300);
        await pg.screenshot({ path: `/tmp/page${label}-desktop-${String(i).padStart(2,"0")}.png` });
      }
    } else {
      await pg.screenshot({ path: `/tmp/page${label}-${tag}-top.png` });
      await pg.evaluate(v => window.scrollTo(0, Math.floor(v)), Math.floor(h*0.45)); await wait(300);
      await pg.screenshot({ path: `/tmp/page${label}-${tag}-mid.png` });
    }
  }
  await pg.close();
}
// also run QA per label so even metrics stay blind
console.log("shots done");
await b.close();
```


---

<a id="machine"></a>

## 7. Raw machine QA results

Recorded before any evaluation and before any change to either branch, as the
protocol requires.

| Metric | PAGE X | PAGE Y |
|---|---|---|
| padding-only seams | 0 | 0 |
| horizontal overflow (px) | 0 | 3641 |
| absence ratio | 0.222 | 0.152 |
| horizontal-space utilization | 0.615 | 0.76 |
| silhouette CV | 0.2 | 0.529 |
| section-height CV | 0.498 | 0.643 |
| repeated section structures | 0 | 0 |
| text-measure violations | 9 | 11 |
| page height (px) | 5374 | 4595 |
| sections | 6 | 6 |
| seam pattern | `192px SAME · 192px SAME · 192px SAME · 192px SAME · 96px+bg` | `112px SAME · 80px+bg · 0px+bg · 80px+bg · 104px SAME` |
| section heights | [412, 743, 1424, 412, 491, 746] | [506, 375, 1629, 426, 402, 1258] |

**Hard failure:** PAGE Y carries 3,641px of horizontal overflow — a
non-wrapping single-line list running off the viewport. Machine-detected,
eye-confirmed.

**Note on the seam detector:** neither page fired it (threshold >220px with
no ground change). PAGE X's pattern nonetheless shows four consecutive
identical `192px SAME-GROUND` seams — the padding-as-separation shape in
miniature, below the detector's threshold. This is a finding about the
*detector*, not only about the page: the threshold may need to become
relative (repeated identical same-ground seams) rather than absolute.


---

<a id="critique"></a>

## 8. Blind visual critique

Scored 1–5 from settled-motion captures at 1440 / 834 / 390. For the last two
rows, 1 = low problem, 5 = severe problem. Every score cites a visible reason;
"feels better" is not a permitted finding.

| Criterion | PAGE X | PAGE Y |
|---|---|---|
| Full-page silhouette | **3** — one peak (1424px middle band); the close is not differentiated | **4** — two peaks (1629 chart, 1258 grid) with light bands between |
| Section rhythm | **2** — four of five seams are identical same-ground 192px gaps | **5** — four of five seams carry a ground change; gaps are small because the change does the work |
| Horizontal space use | **3** — hero dek's right side empty; one section composes in two columns | **5** — statement/topology, prose/spec table, two-column chart, 4-across grid; almost no lone-left-column band |
| Anchor quality | **4** — real topology in hero, real node-kind counts, real category bars | **5** — real topology *with real caption* (id, node count, category), real spec table, 26-row chart, 12-journey grid |
| Transition quality | **2** — four identical same-ground voids | **5** — paper → soft → dark alternation; the dark band functions as the interruption |
| Density progression | **4** — light open → grid/chart peak → thins → dark close | **4** — two peaks; but the page ends on its densest material, so resolution is abrupt |
| Hierarchy | **3** — clear, but 03/04/05 numbering on non-sequence content is decorative structure | **4** — consistent mono eyebrow + heading + body; right-aligned numerics read cleanly |
| Mobile recomposition | **4** — stats become 2×2, topology keeps its band, caption added | **2** — stacking is correct, but the 3,641px overflow is a real defect at every width |
| Generic template feel | **3** — stat strip + heading + three numbered columns is a recognisable marketing pattern | **2** — spec table, two-column ranked chart and dense grid are specific to this corpus |
| Over-design risk | **1** — no decoration beyond real figures | **2** — dark band + dense grid + many mono labels reads slightly busy, though every element is real |

**Named findings**

- PAGE Y · WRONG · horizontal overflow: a single-line goal list does not wrap
  and runs off the viewport (visible as a truncated final item).
- PAGE X · ROUGH · section rhythm: four consecutive identical same-ground
  seams; separation is being done by padding alone.
- PAGE X · ROUGH · decorative structure: sequence numbering applied to peer
  content.
- PAGE Y · ROUGH · resolution: the page's densest section is also its last
  before the CTA.


---

<a id="status"></a>

## 9. Status and what happens next

**Stopped at Step 8 — human judgment.** The reveal is deliberately withheld.

The human judges PAGE X and PAGE Y on six questions: which feels more
intentionally composed; which has better section-to-section flow; which uses
the canvas better; which feels less templated; which is the stronger design
base; and what specifically caused the preference.

Only after that is recorded does Step 9 reveal which page was CONTROL and
which was GRAMMAR, and compare three independent signals — machine results,
blind critique, human judgment — before classifying the hypothesis
SUPPORTED / MIXED / NOT SUPPORTED. No single metric decides it.

Step 10 then compares the two *plans* rather than the two pages: whether
grammar planning changed the number of explicit transitions, anchor
specificity, width and density decisions, awareness of repetition and
overuse, full-page sequencing, and implementation traceability. Grammar may
improve reasoning reliability even if visual quality is close — that would
still be a result worth having.

Step 11 records the consequence honestly, including the case where the
hypothesis fails and mandatory grammar planning is cut back.

### Known limitations of this experiment

- **n = 1 page, one register** (product marketing). Nothing here generalises
  to utility, editorial, commerce or brand registers.
- **Two subagents, not two humans.** Branch variance may include model
  variance unrelated to the planning method.
- **Effort asymmetry is real** (417 vs 302 lines) and is confounded with the
  method: grammar planning may simply induce more implementation.
- **The evaluator is method-aware.** X/Y blinding is genuine, but a page
  bearing grammar traces may be recognisable to the critic — which is
  precisely why human judgment, not the critique, is the deciding signal.

