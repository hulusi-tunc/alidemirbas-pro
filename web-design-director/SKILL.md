---
name: web-design-director
description: >
  A reusable AI web-design methodology and orchestrator. Use for any task
  that designs, redesigns, builds, edits, reviews, or ships a web page,
  section, or component — across personal sites, portfolios, SaaS/product
  sites, editorial sites, utility/tool sites, brand sites, marketing sites,
  and commerce sites. Encodes mechanisms (registers, workflow stages, QA
  layers, project memory) rather than a fixed aesthetic; the visual identity
  is always derived from the project's own material, never applied from
  this file.
---

# Web Design Director

This file is an **orchestrator**, not a manual. It decides mode, reads
project state, and loads only what the current mode and workflow mode
actually need. The reasoning lives in the modules below; read this file to
find which one applies, not to find the answer itself.

## Step 0 — read state, before anything else

**IF `design-memory/STATE.md` (or the project's `PROJECT_STATE.md`
instance) exists** → read it before loading any module below. It names the
register, the current mode, the current workflow stage, and the next step.

**IF it does not exist** → this is a greenfield project or one that has
never used this system. Initialize it from `templates/PROJECT_STATE.md`
after the first BRIEF + REGISTER declaration (`methodology/workflow.md`).
Never invent prior state; never treat a missing file as an error.

## Step 1 — declare the mode

Every task gets one of six modes before any action:
**DISCOVER · DESIGN · BUILD · EDIT · QA · SHIP** — see `methodology/modes.md`
for what each licenses and forbids, and for the three specific failure
modes (DESIGN→BUILD, QA→mutation, EDIT→redesign) this exists to stop. State
the mode in one line, the same as any other declared decision.

## Step 2 — declare the workflow mode and load its module set

`methodology/workflow.md`'s own Modes table sets how much process a task
deserves — **GREENFIELD / EXISTING DESIGN LANGUAGE / ROUTINE PAGE /
UTILITY-COMMERCE FAST PATH** — and which of the sixteen stages actually run.
This is a different axis from the mode declared in Step 1; both apply
together.

| Mode 1 (this file's) | Loads at minimum |
|---|---|
| DISCOVER | `core-principles.md` · `workflow.md` stages 1–3 · `registers.md` |
| DESIGN | + `visual-material-strategy.md` · `reference-analysis.md` (if referencing) · `visual-direction.md` · `composition-grammar.md` |
| BUILD | + `site-constitution.md` · `technical-fit.md` · `../protocols/structural-donor.md` (if importing a component) |
| EDIT | `core-principles.md` P18 · `qa.md` B2 · `../protocols/correct-protect.md` — deliberately minimal; a scoped correction does not need the full stack |
| QA | `qa.md` (all sections relevant to what's being checked) · `../protocols/responsive-recomposition.md` (if responsive is in scope) |
| SHIP | `../protocols/pre-post-deploy-qa.md` · `environment-awareness.md` |

Routine and fast-path work stays cheap by design (`workflow.md`'s own
scale-down rule): a five-minute local spacing fix is an EDIT-mode task using
three files, not sixteen stages.

## The modules

| File | What it decides |
|---|---|
| `methodology/core-principles.md` | The eighteen behavioral mechanisms every other module obeys; aesthetic-neutral by design |
| `methodology/modes.md` | The DISCOVER…SHIP permission gate |
| `methodology/workflow.md` | The sixteen-stage sequence, its skip conditions, and the four scale-down modes |
| `methodology/registers.md` | Which design rules apply and which reverse, by site/page type |
| `methodology/visual-material-strategy.md` | What category of real material carries the visual experience |
| `methodology/reference-analysis.md` | How to dissect a reference without copying its skin |
| `methodology/visual-direction.md` | Baseline elicitation, manifesto fan-out, the human selection checkpoint |
| `methodology/composition-grammar.md` | The named vocabulary for composing a *selected* direction into sections — does not choose the direction itself |
| `methodology/site-constitution.md` | The three-layer split (global / family / page) that keeps many pages coherent without becoming one template |
| `methodology/technical-fit.md` | Stack/framework/complexity justification, before implementation |
| `methodology/environment-awareness.md` | What this environment can actually verify, checked rather than assumed |
| `methodology/qa.md` | Three-layer validation (machine / critique / human), evidence-classed |
| `methodology/anti-patterns.md` | Named failure modes with detection and correction, dated and provenance-carrying |
| `methodology/project-memory.md` | What persists per project, and the cross-project convergence audit |
| `protocols/structural-donor.md` | Importing a third-party component without importing its design system |
| `protocols/correct-protect.md` | Scoping a refinement pass so it can't regress approved work |
| `protocols/responsive-recomposition.md` | The PRESERVE/REFLOW/COMPRESS/DISCLOSE/REPLACE/REMOVE decision per section |
| `protocols/pre-post-deploy-qa.md` | The gate before deploy and the verification after it |
| `templates/CONTEXT.md` / `COPY.md` / `DESIGN.md` / `PROJECT_STATE.md` | The four persistent artifacts a project accumulates |

## What this file will not do

It will not pick a palette, a typeface, a radius, or a "premium" look for
you — that is precisely the class of decision `core-principles.md` P2 and
`anti-patterns.md` #2 forbid encoding here. Every visual value this system
produces traces to a specific project's real material, run through the
modules above. `examples/` shows one full worked instance; it is an
example, not this file's default output.
