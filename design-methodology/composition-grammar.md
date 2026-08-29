# Composition Grammar v1

A vocabulary, **not a template library**. No page must use any particular
move; every page must NAME its moves. The grammar exists so that
composition can be planned, diffed, and checked — the layer every studied
system left to the model's prior, and where the costliest real failures
lived. [VALIDATED IN PROJECT as a need; individual moves are OBSERVED; the
pairing/conflict table is inference — PLAUSIBLE. That composition must be
planned is core P12a; that THIS vocabulary improves outcomes is P12b and is
under controlled test.]

**RULE: A page's composition plan names its moves before implementation**
(workflow.md, COMPOSITION PLAN stage). Every named move carries one of three
labels:

- **KNOWN MOVE** — already in this file.
- **PROJECT-SPECIFIC MOVE** — a deliberate composition decision that works in
  this project, named and described, but not claimed as universal.
- **CANDIDATE GRAMMAR MOVE** — a recurring, evidenced move that may later be
  proposed for the shared grammar (with provenance, per core P14).

A page may use zero, one, or many KNOWN moves. **A composition that is not in
this vocabulary is not thereby invalid** — it is unnamed, and unnamed means
unexamined, not wrong. The grammar exists to make composition discussable,
diffable and testable; it does not constrain all future composition to
thirteen patterns. Treating it as a closed world would contradict core P15
(second-order convergence) and would make this file the very template the
methodology exists to prevent.

**RULE: Do not plan in ASCII wireframes.** Planning notation constrains the
design space to what the notation can draw; ASCII cannot draw bleed,
overlap, or density, so plans made in it converge to stacked bands.
[OBSERVED mechanism across studied systems.] Plan in descriptive
sentences using move names, e.g.: "Hero: full-width anchor (the live
library browser) with bottom bleed; then statement+witness on shifted
ground; index-as-texture for the catalog; one interruption plate for the
single takeaway; density gradient toward the tool."

Move evidence baseline: every move below exists in at least one real,
inspected page (positive or counter-example) — status **[OBSERVED]** unless
noted otherwise. No move was invented to complete the taxonomy, and no move
is claimed as universally correct or mandatory.

---

## How to read the MECHANICAL CHECK values

Every numeric value below is classified by evidence strength (core status
vocabulary). Machine QA's hard gate applies only to HARD ASSERTS and
explicitly promoted VALIDATED detectors (qa.md).

| Class | Meaning | Effect on shipping |
|---|---|---|
| **HARD ASSERT** | objectively invalid when failed | blocks |
| **VALIDATED PROJECT DETECTOR** | empirically separated known-good/known-bad here | blocks, within tested scope |
| **HEURISTIC SIGNAL** | useful warning needing visual interpretation | opens a critique finding |
| **EXPERIMENTAL METRIC** | awaiting validation | informs critique; never blocks alone |

The numbers below (90% anchor width, 25% rail width, ~10 index items, one
interruption plate, one repetition break, content-node diversity >1, 30%
sticky share) are **HEURISTIC SIGNALS with working values** — reasonable
starting points, not measured optima. They look precise, and that precision
is not itself evidence. Tune per project; record the tuning.

## The moves

Each: PURPOSE · INPUT CONDITION · REGISTER FIT · PAIRS WITH · CONFLICTS ·
OVERUSE FAILURE · MECHANICAL CHECK.

### 1. Full-width anchor
- PURPOSE: prove the section's claim with the real object itself.
- INPUT: a real object that earns the width (interface, figure, dataset).
- REGISTER: Marketing/Brand/Portfolio at container width; **in Utility the
  move survives but the width reverses** — the anchor is the tool at
  reading measure.
- PAIRS: bleed (2), density gradient (12).
- CONFLICTS: measure narrowing (4) in the same block; adjacent to
  interruption plate (8).
- OVERUSE: every section anchored → nothing is the anchor.
- CHECK: HEURISTIC SIGNAL — anchor bbox ≥ 90% of its container (register-adjusted).

### 2. Bleed
- PURPOSE: state that the object is larger than the viewport; imply
  continuation.
- INPUT: a full-width anchor whose crop line lands on a semantically empty
  zone. IF the crop hits a meaningful feature (a face, a control) → the
  bleed reads as an error, not a continuation. [Evidenced by a failed
  variant.]
- REGISTER: Marketing/Brand. Utility: never (cropped UI reads as a bug).
  Reading surfaces: never.
- PAIRS: full-width anchor (1), density gradient (12).
- CONFLICTS: interruption plate (8) — two interruptions compete.
- OVERUSE: nothing ever seen whole → loss-of-control feeling.
- CHECK: HEURISTIC SIGNAL — element bbox crosses the section clip boundary.

### 3. Background shift
- PURPOSE: build the seam between sections out of change, not padding.
- INPUT: adjacent sections.
- REGISTER: universal.
- PAIRS: everything.
- CONFLICTS: none.
- OVERUSE: mechanical zebra (alternating every seam regardless of content
  grouping) → the shift stops meaning anything.
- CHECK: **VALIDATED PROJECT DETECTOR** — padding-only seam detector:
  adjacent sections with >220px combined seam space and identical background.
  Separated known-bad / known-good / positive-control 3/0/0 in this project.
  Valid within that tested scope, not a universal law. **Known limitation:**
  the threshold is absolute, so a page with repeated *identical* same-ground
  seams just under it passes while showing the same failure — observed during
  Controlled Experiment 1. A relative form (repeated identical same-ground
  seams) is a candidate revision.

### 4. Measure narrowing
- PURPOSE: mark a register change (prose ↔ working surface) with width.
- INPUT: a genuine content-mode transition.
- REGISTER: universal; law on Editorial/Utility-reading.
- PAIRS: rail+body (5), statement+witness (6).
- CONFLICTS: full-width anchor (1) in the same block.
- OVERUSE: measure zigzag → the page feels unstable.
- CHECK: HEURISTIC SIGNAL — measured line length in ch within declared bounds per block type.

### 5. Rail + body
- PURPOSE: separate meta from content; make lists scannable.
- INPUT: real meta (ids, labels, counts) — not invented annotations.
- REGISTER: Utility/Editorial/Portfolio strong; others neutral.
- PAIRS: measure narrowing (4), index-as-texture (7).
- CONFLICTS: statement+witness (6) in the same band (two competing splits).
- OVERUSE: everything railed → the rail stops signifying meta.
- CHECK: HEURISTIC SIGNAL — rail column ≤ 25% width; rail content in the label register.

### 6. Statement + witness
- PURPOSE: give a claim its evidence in the same visual field.
- INPUT: a real witness (figure, data, prose that answers the claim). A
  statement without a witness at wide measure IS the dead-canvas failure.
- REGISTER: Marketing/Portfolio/Brand.
- PAIRS: full-width anchor (1), spec plate (11).
- CONFLICTS: rail+body (5) same band.
- OVERUSE: every heading twinned → formula.
- CHECK: EXPERIMENTAL METRIC — dead-canvas geometry v2 (content right-edge
  percentile vs container). v1 failed to separate and was retired; v2 awaits
  validation and never blocks shipping alone. It flags *candidates*; only the
  critic decides whether emptiness has a readable compositional function
  (qa.md, dead canvas vs intentional negative space).

### 7. Index as texture
- PURPOSE: let genuine multitude be both content and visual field.
- INPUT: ≥ ~10 real, linked items.
- REGISTER: Utility/Commerce/Portfolio. **Reverses in Brand** (scarcity).
- PAIRS: rail+body (5), repetition+break (9).
- CONFLICTS: the sparse end of density gradient (12).
- OVERUSE: wall — unscannable.
- CHECK: HEURISTIC SIGNAL — item count + fraction of real hrefs (no dead/placeholder items).

### 8. Interruption plate
- PURPOSE: stop the reader once, for the single thing worth stopping for.
- INPUT: a page that truly has ONE takeaway.
- REGISTER: universal, budgeted: Editorial (pull-quote tradition),
  Marketing 1, Utility 0–1.
- PAIRS: background shift (3).
- CONFLICTS: bleed (2); a second plate.
- OVERUSE: the second plate destroys the first. [OBSERVED in production use.]
- CHECK: HEURISTIC SIGNAL — high-contrast plate count ≤ 1 per page. A budget, not a quota: zero is legitimate.

### 9. Repetition + break
- PURPOSE: regularity builds trust; the single break carries information.
- INPUT: a real series + a genuinely deviant member.
- REGISTER: universal; native to Commerce (badges).
- PAIRS: index-as-texture (7), window-card (10).
- CONFLICTS: none.
- OVERUSE: multiple breaks → the pattern collapses.
- CHECK: HEURISTIC SIGNAL — one style-deviant child in the repeated grid; zero is also valid, the move is optional.

### 10. Window-card
- PURPOSE: a border earned by structured content behind it.
- INPUT: the card holds more than one content type (figure + label + meta).
  A single label in a box is a fence, not a card. [VALIDATED IN PROJECT counter-example
  in production: 19 one-name boxes, rejected; and a working bento whose
  every cell holds a real logo + tag + count.]
- REGISTER: Marketing, Utility dashboards.
- PAIRS: repetition+break (9), index-as-texture (7).
- CONFLICTS: boxing open prose (see anti-patterns: card-everything).
- OVERUSE: dashboard disease.
- CHECK: HEURISTIC SIGNAL — content-node diversity per card > 1.

### 11. Colophon / spec plate
- PURPOSE: present facts as a record (label–value rows).
- INPUT: real, current values, traceable to source.
- REGISTER: Portfolio/Utility/Marketing.
- PAIRS: statement+witness (6), rail+body (5).
- CONFLICTS: none.
- OVERUSE: every list bureaucratized into a plate.
- CHECK: HARD ASSERT — fabrication lint — every value derivable from repo/source.

### 12. Density gradient
- PURPOSE: open airy, densify toward the working material (direction
  reverses per register: Brand may stay sparse throughout).
- INPUT: the page has a working surface.
- REGISTER: universal, direction register-set.
- PAIRS: full-width anchor (1), bleed (2), index-as-texture (7).
- CONFLICTS: none.
- OVERUSE: inverse gradient (dense → empty) deflates the page.
- CHECK: EXPERIMENTAL METRIC — sign of the band-occupancy slope across the page.

### 13. Persistent rail
- PURPOSE: keep context available across a long scroll (TOC, facets,
  summary).
- INPUT: long body + context that is needed continuously.
- REGISTER: Utility-reading/Editorial-longform; unnecessary in Marketing.
- PAIRS: rail+body (5), index-as-texture (7).
- CONFLICTS: bleed (2) — sticky + bleed produces chaos.
- OVERUSE: multiple sticky columns → a page that shudders.
- CHECK: HEURISTIC SIGNAL — sticky element's viewport share ≤ 30%.

---

## MISSING GRAMMAR

Known absent, deliberately not invented (core P2 — unevidenced vocabulary
entries are convergence seeds):

- **Full-page silhouette / open–close rhythm.** How a page opens, breathes,
  and ends as a single shape. No named moves yet; the silhouette-variance
  metric exists but no vocabulary hangs on it.
- **First-viewport contract.** What must be true above the fold per
  register. Currently handled implicitly by anchor choice.
- **Imagery-led composition for Brand registers.** The grammar is strongest
  where our evidence lives (utility/marketing/portfolio pages); brand-grade
  image-led moves await real brand-register work.

IF work in these areas produces a recurring, evidenced pattern → propose it
as a move with provenance; do not add it before then.
