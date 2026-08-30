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
