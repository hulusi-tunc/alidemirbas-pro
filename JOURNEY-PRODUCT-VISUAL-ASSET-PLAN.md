# JOURNEY-PRODUCT-VISUAL-ASSET-PLAN.md

Visual asset plan for the **Lifecycle Marketing Journey Builder** product page
(`/lab/claude-lifecycle`, `/tr/lab/claude-lifecycle`).

Composition reference: peerbie.com/custom-workflow. Design language: this
project's Portrait-derived system. Content and visual identity: the canonical
journey library itself.

---

## 0. Source of truth — every number and label

Loaded with the repo's own read-only `scripts/dump-canonical.mjs`.

| Fact | Value | Derivation |
|---|---|---|
| Journeys | **255** | `JOURNEYS.length` |
| Categories | **26** | `CATEGORIES.length` |
| Total nodes | **3,186** | sum of `.nodes.length` |
| Node types | **7** | distinct `.kind` |
| action / condition / handoff | 1,131 / 702 / 500 | per-kind counts |
| exit / trigger / wait | 433 / 255 / 164 | per-kind counts |
| **outcome** | **1** | genuinely 1 of 3,186 — reported at true weight, never promoted |
| Rules | 423 + 31 global | `rules`, `globalRules` |
| Category size | 8–10 each | deliberately even; the schema notes each category is "applied in full" |

**Featured journey: `ACQ-01`** — *Anonymous intent → known identity → qualified
entry*, rendered **unmodified**. Chosen because it exercises six of the seven
node kinds in eight nodes: a behavioural trigger with `insufficientAlone`, a
two-armed condition, a wait with both arms and a real timeout reason, an
append-mode action, a second condition, a handoff to `ACQ-05`, and two
non-terminal exits. No larger journey stays legible as a diagram; no smaller
one teaches as much.

**Showcase journeys** (library spread): `ACQ-09`, `ACT-12`, `CON-38`, `TIM-65`,
`OWN-53` — five real journeys, one per category. Five, not six: the spread
highlights its centre card and an even count has no true centre.

Schema fields that carry the page: `trigger.evidence.{requires,
insufficientAlone, source}` · `condition.branches[{label, when, to}]` ·
`wait.{until, timeout:{after, reason}, onEvent, onTimeout,
windowExtendsOnEngagement}` · `action.writes[{field, mode}]` ·
`handoff.{to, on, carries}` · `exit.{state, terminal, reEntry}`.

---

## 1. Node visual system

Seven real kinds, distinguished by **icon + a 3px left rule** — and, for `wait`
alone, a **dashed border**. Not seven saturated fills: the site is a two-hue
system (brand blue + ink) and a rainbow would break it. The rules read as a
scale of how much a node commits you.

| Kind | Rule | Icon | Why |
|---|---|---|---|
| trigger | `primary-600` | Zap | the entry point |
| action | `primary-400` | Play | the system does something |
| condition | `ink-950` | GitBranch | a real fork, drawn with authority |
| wait | `ink-300` + **dashed** | Clock | the only kind that is a pause, not a step |
| handoff | `primary-700` | ArrowRightLeft | ownership leaves this journey |
| exit | `ink-200` | LogOut | end of ownership, deliberately quiet |
| outcome | `ink-400` | Flag | in the schema; legend only |

**Connectors are CSS rules, not SVG paths.** A 1px border on a box between two
nodes in the same column cannot misalign against them — which is what lets these
diagrams survive 375px with no viewBox to fight. Branch labels are real text
pills that **wrap rather than truncate**: branch meaning is the one thing on
this page that may not be abbreviated.

**Accessibility:** every node carries its kind as real text, not only colour or
position; branch meaning is text; decorative rules are `aria-hidden`; the card
flow strips carry an `aria-label` naming the sequence.

---

## 2. The visuals

### VISUAL-J01 — Hero journey canvas
- **Section** 01 Hero · **Teaches** the whole model at a glance
- **Source** ACQ-01, all 8 nodes · **Kinds** trigger, condition, wait, action, handoff, exit
- **Format** node graph with a thin canvas toolbar (real id / category / node count)
- **Method** React + CSS · **Desktop** ~560×620, right column of a 45/55 split
- **Tablet** stacks under the text, full width
- **Mobile** same graph; top-level fork stays side-by-side, the nested wait fork stacks

### VISUAL-J02 — Trigger evidence
- **Section** 03 Story 1 · **Teaches** a journey refuses to start on a weak signal
- **Source** `ACQ-01.trigger.evidence` — 4 `requires`, 3 `insufficientAlone`
- **Format** two facing columns, the right one struck through
- **Method** React + CSS · **Desktop** ~620×420 · **Mobile** columns stack, divider drops

### VISUAL-J03 — The fork, enlarged
- **Section** 04 Story 2 · **Teaches** both arms are named, neither is a dead end
- **Source** `ACQ-01.c.identity` — real labels and the full `when` of each branch
- **Method** React + CSS · **Desktop** ~640×400 · **Mobile** arms stack, labels wrap

### VISUAL-J04 — Wait timeline
- **Section** 05 Story 3 · **Teaches** **time** — the dimension the A/B page has none of
- **Source** `ACQ-01.w.identity` — `until`, `timeout.after`, `timeout.reason`, `windowExtendsOnEngagement: false`
- **Format** a horizontal dashed rail with two named ends, then the two arms as outcomes
- **Method** React + CSS · **Desktop** ~620×420 · **Mobile** rail keeps full width, arms stack

### VISUAL-J05 — Anatomy
- **Section** 06 · **Teaches** the model, labelled, on a real record
- **Source** ACQ-01 again — *deliberately the same journey*: the hero shows it, the anatomy explains it
- **Format** the canvas at full size beside the journey's real name/purpose and the node-type legend with true corpus counts
- **Method** React + CSS · **Desktop** full 1280 split ~1fr/0.75fr · **Mobile** diagram then legend

### VISUAL-J06 — Handoff inspector
- **Section** 07 · **Teaches** a handoff carries a payload — the page's scale change, one node zoomed
- **Source** `ACQ-01.h.qualification` — `to: ACQ-05` (resolved to its real name), `on`, 3 `carries`
- **Method** React + CSS · **Desktop** ~440×320 · **Mobile** full width

### VISUAL-J07 — Library spread
- **Section** 08 · **Teaches** scale + that a journey is a **flow object**
- **Source** 5 real journeys + 6 real category facets
- **Format** cards cropped at the container edge; each carries a **mini node-kind strip** — the clearest separation from the A/B page's cards
- **Method** React + CSS · **Desktop** cropped row, centre card highlighted · **Mobile** scroll-snap rail

### VISUAL-J08/09/10 — How it works, steps 1–3
Three *different* fragments: a category filter list (discovery), a 3-node mini
flow with both branch pills (reading), the node legend (adapting).
React + CSS, ~360×280 each, stacked on mobile.

---

## 3. Format decision

| Visual | React/CSS | Generated image |
|---|---|---|
| VISUAL-J01 … J10 | ✅ all ten | ❌ none |

**No raster/generated illustration is needed, because all major visuals
communicate actual product logic and are better implemented in React/CSS.**
See `JOURNEY-PRODUCT-IMAGE-PROMPTS.md`.

---

## 4. Section rhythm

| # | Section | Tone | Scale |
|---|---|---|---|
| 01 | Hero — text left, journey canvas right | paper + blue wash | large |
| 02 | Scale band | paper | **band** |
| 03 | Triggers | paper | large, text ǀ visual |
| 04 | Branching | soft | large, visual ǀ text |
| 05 | Time | paper | large, text ǀ visual |
| 06 | **Anatomy** | tint | **xl** |
| 07 | **Node inspector** | soft | large, small visual |
| 08 | Library | paper | **xl** |
| 09 | How it works | soft | large |
| 10 | Final CTA (shared) | existing | medium |

---

## 5. Performance

- The page renders **5 showcase journeys**, not 255. Nothing is rendered and
  hidden with CSS.
- `journey-marketing.ts` is **server-only**, like `canonical-view.ts`. The
  canonical graph never reaches the browser bundle.
- **Zero client components added.** Every visual on this page is a server
  component; the only client code is the pre-existing shared `Reveal`, header
  and nav.
- Counts are computed once at module load, not per render.
