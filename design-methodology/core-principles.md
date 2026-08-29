# Core Principles

The constitution of this methodology. Every other module must obey these; a
rule elsewhere that contradicts a principle here is a bug in that module.
This file is aesthetic-neutral by design: it contains no fonts, no colors,
no layout advice. It contains the behavioral mechanisms that survived when
the aesthetic advice around them staled.

Purpose of the whole system, in priority order:
**appropriateness → clarity → composition → identity → craft.**
Novelty is never the objective; it is an occasional side effect of deriving
identity from real material.

---

## P1 — Decision altitude
**RULE:** Write every design rule at mid-altitude: name the axis, give the
direction, leave the value to context. IF a rule dictates literal values
(hex codes, named fonts) outside an established constitution → rewrite it.
IF a rule is an adjective ("beautiful", "premium") with no operational
definition → rewrite it or delete it.
**WHY:** Low-altitude rules execute without judgment and break when context
shifts; high-altitude rules resolve to the model's modal output. [PROVEN —
observed across Anthropic's skill generations and our own rules.]
**PREVENTS:** brittle prescriptions; vibes-driven regressions to the mode.

## P2 — Behavioral mechanism over aesthetic prescription
**RULE:** Encode quality as mechanisms (schemas, budgets, tests, rituals,
ledgers), not as aesthetic recipes. Aesthetic content may exist only inside
register-conditioned modules or project constitutions, never in core rules.
**WHY:** [PROVEN] Aesthetic prescriptions staled within one generation twice:
Anthropic's blog recipes became its own skill's named anti-patterns, and a
community workflow's "escape from generic" landed pixel-adjacent to the
named default it fled. The mechanisms around those recipes did not stale.
**PREVENTS:** the system becoming next year's recognizable AI aesthetic.

## P3 — Register before art direction
**RULE:** No visual decision before the register is classified and stated
(see registers.md). IF a task arrives mid-flight without a declared
register → stop and declare it first.
**WHY:** Several core rules reverse by register (density, whitespace,
distinctiveness, convention). A rule applied without register is a coin
flip. [Taxonomy PLAUSIBLE; the reversals themselves are evidenced.]
**PREVENTS:** register mismatch — the single most expensive cascade failure.
[OPEN RISK: misclassification cascades; mitigated by declaration + human
veto at the first checkpoint.]

## P4 — Derive identity; never apply it
**RULE:** Visual identity must be traceable to the project's own material —
its subject, data, artifacts, vocabulary, or physical world. Swap test: IF
the identity could be moved onto an unrelated site unchanged → it is
costume; reject it.
**WHY:** Applied identity is sampled from the model's distribution of
"distinctive looks" and converges. Derived identity cannot converge across
projects because the source material differs.
**PREVENTS:** costume distinctiveness; theming.

## P5 — Real material before visual material
**RULE:** Inventory the real material (content, data, screenshots,
interfaces, numbers) before composing. IF required material does not exist →
say so and stop; never fabricate content, data, imagery, metrics, or
testimonials. A stale real number is a defect; verify rather than repeat.
**WHY:** Fabrication destroys trust in every register and is unrecoverable
in portfolio/commerce/utility. Pages composed without material inventory
become prose poured into columns.
**PREVENTS:** fabrication; dead canvas born from having nothing to place.

## P6 — Decisions are named and written
**RULE:** Plans, directions, and critiques use named vocabulary (register
names, composition moves, failure modes) and exist as written artifacts —
never only in thinking. IF a decision was made but not written → it was not
made.
**WHY:** Unnamed things cannot be checked; unwritten things cannot be
diffed. The planning notation shapes the output space, so the notation must
be able to express the decisions that matter. [PROVEN — named failure modes
outperformed generic warnings in production use.]
**PREVENTS:** unfalsifiable plans; critique that cannot cite anything.

## P7 — Traceability
**RULE:** Every implemented visual value traces to a written source: the
constitution, a page-family rule, a direction manifesto, or a composition
plan. IF a value has no source → it is an undeclared decision; declare it
or remove it.
**WHY:** Traceability is what makes plan-vs-build diffs possible, and those
diffs are a QA layer.
**PREVENTS:** drift between what was decided and what shipped.

## P8 — Commitment devices
**RULE:** At every declared decision point, state the choice and the reason
in one line ("Register: UTILITY-interactive, because the visitor arrives
with inputs and leaves with a number"). State what changed and why after
every revision.
**WHY:** Stating forces committing; silent choices regress to the mode.
**PREVENTS:** vibes-selection hidden inside generation.

## P9 — Budgets and quotas
**RULE:** Scarce devices are counted, not encouraged: interruption plates
(≤1/page), aesthetic risks (register-budgeted, see registers.md), fan-out
directions (k=3 default). IF a countable budget is exceeded → mechanical QA
fails the page.
**WHY:** [PROVEN] Countable constraints are the most reliably obeyed rule
form observed across all studied systems and our own production.
**PREVENTS:** emphasis inflation — the second bold thing killing the first.

## P10 — Human checkpoints before production
**RULE:** A human selects, rejects, or redirects before production
implementation whenever direction is open (see visual-direction.md and
workflow.md for placement and skip conditions). Total rejection of all
directions is valid output: it means the direction space was wrong.
**WHY:** [PROVEN] The human is the taste engine; autonomous end-to-end
pipelines were rejected by the research. Cheap rejection before production
beat expensive refinement after it in every observed case.
**PREVENTS:** polishing the wrong direction; taste laundering.

## P11 — Render is ground truth
**RULE:** No claim about a design is valid until the rendered output was
inspected — at the required widths, with motion settled (trigger all
reveals, return to top, wait, then capture). A conclusion drawn from a
mid-animation screenshot is a conclusion about scroll timing, not the page.
**WHY:** [PROVEN] A confident wrong verdict in this project traced directly
to un-settled animations; the correction is procedural, not attitudinal.
**PREVENTS:** rubber-stamp critique; false defects; false passes.

## P12 — Composition is a first-class discipline
**RULE:** Every page gets a written composition plan in grammar vocabulary
(composition-grammar.md) before implementation. Composition failures are
named defects with detectors, not matters of taste.
**WHY:** [PROVEN] Composition was the largest absent layer in every studied
system, and the costliest real failure in this project (a page passed every
typographic rule and failed as a page). One composition defect class is
already machine-detectable.
**PREVENTS:** dead canvas; padding-as-composition; document-poured-into-web.

## P13 — Site law and page freedom are separate layers
**RULE:** Maintain three layers (site constitution / page-family rules /
page freedom, see site-constitution.md). An undeclared violation of a
higher layer is a defect regardless of how good the page looks.
**WHY:** Pages designed independently drift into many sites; pages designed
identically collapse into one template. The layer split is the only
mechanism that holds both failure modes off simultaneously.
**PREVENTS:** 40 pages = 40 websites; 40 pages = 1 template.

## P14 — Provenance and the learning lifecycle
**RULE:** Project-specific rules and anti-patterns carry their origin: what
happened, where (commit/PR/screenshot), and when. Rules are dated,
reviewed on a cadence, and retired to an archive with a reason — never
silently deleted, never kept forever by inertia. Withdrawn conclusions are
recorded as withdrawals, not erased.
**WHY:** [PROVEN] Incident-backed rules steered behavior harder than
principles in production. Undated rule lists staled within a generation in
every studied system.
**PREVENTS:** rule rot; the eternal blacklist; repeating undocumented
mistakes.

## P15 — Second-order convergence awareness
**RULE:** Assume this methodology's own vocabulary can become its own
template. Log direction manifests to the project ledger; run the
project-to-project convergence audit (project-memory.md); when repetition
is flagged, force one direction in the next fan-out to avoid the repeated
mechanism. Conscious reuse after review is allowed; unconscious repetition
is not.
**WHY:** [OPEN RISK — the system has not yet been tested against itself.]
Every anti-generic system studied became a recognizable aesthetic within
one generation.
**PREVENTS:** the house style hardening into the next mode.
