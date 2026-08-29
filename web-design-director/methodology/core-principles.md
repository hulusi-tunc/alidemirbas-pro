# Core Principles

The constitution of this methodology. Every other module must obey these; a
rule elsewhere that contradicts a principle here is a bug in that module.
This file is aesthetic-neutral by design: it contains no fonts, no colors,
no layout advice. It contains the behavioral mechanisms that survived when
the aesthetic advice around them staled.

## Evidence status vocabulary

Every claim in this methodology carries one of these. The system must obey
its own evidence standard: a useful heuristic is not automatically proven,
and an experimentally useful threshold is not automatically a hard gate.

- **[PROVEN]** — the evidence supports this exact claim at this exact scope.
- **[VALIDATED IN PROJECT]** — tested against this project's real cases
  (usually a known-good / known-bad pair). Valid within tested scope; not a
  universal law.
- **[OBSERVED]** — seen repeatedly across sources or sessions, uncontrolled.
- **[PLAUSIBLE]** — a reasonable system hypothesis; experiment pending.
- **[OPEN RISK]** — a known way this can fail, carrying its mitigation.

Evidence for a weaker claim may never be used to support a stronger one.

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
shifts; high-altitude rules resolve to the model's modal output.
[OBSERVED — across two generations of one vendor's guidance and our own
rule-writing; not a controlled comparison.]
**PREVENTS:** brittle prescriptions; vibes-driven regressions to the mode.

## P2 — Behavioral mechanism over aesthetic prescription
**RULE:** Encode quality as mechanisms (schemas, budgets, tests, rituals,
ledgers), not as aesthetic recipes. Aesthetic content may exist only inside
register-conditioned modules or project constitutions, never in core rules.
**WHY:** [OBSERVED — two documented cases] Aesthetic prescriptions staled
within one generation twice:
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
be able to express the decisions that matter. [VALIDATED IN PROJECT — named
failure modes steered behavior in this project's production use; not measured
against a control.]
**PREVENTS:** unfalsifiable plans; critique that cannot cite anything.

## P7 — Traceability of material decisions
**RULE:** Every **material design decision** traces to a written source:
project truth, the constitution, a page-family rule, an approved direction,
the composition plan, or an explicit implementation constraint. Implementation
minutiae that merely instantiate an approved token or system need no
individual justification.

Requires traceability: a new container width · a new type role · a new colour
role · an unusual section structure · a composition exception · a new anchor
treatment · a new motion behavior.

Does not: an inherited spacing token · an existing radius token · an ordinary
flex gap · any implementation detail that does not change design intent.

**WHY:** Traceability makes plan-vs-build diffs possible, and those diffs are
a QA layer. The purpose is accountability, not bureaucracy — demanding prose
for every CSS value produces compliance theatre and buries the decisions that
actually mattered.
**PREVENTS:** drift between what was decided and what shipped; and, in its
narrowed form, the documentation overhead that would make the system unusable
on routine work.

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
**WHY:** [OBSERVED] Countable constraints were the most reliably obeyed rule
form across all studied systems and our own production. Budgets are also
**permission, not quota**: a budget of one signature never obliges spending
it (see registers.md).
**PREVENTS:** emphasis inflation — the second bold thing killing the first.

## P10 — Human checkpoints before production
**RULE:** A human selects, rejects, or redirects before production
implementation whenever direction is open (see visual-direction.md and
workflow.md for placement and skip conditions). Total rejection of all
directions is valid output: it means the direction space was wrong.
**WHY:** [VALIDATED IN PROJECT] A full three-direction rejection redirected
real work here for the cost of three static mocks. [OBSERVED] across studied
workflows: autonomous end-to-end pipelines removed the taste engine from the
loop.
**PREVENTS:** polishing the wrong direction; taste laundering.

## P11 — Render is ground truth
**RULE:** No claim about a design is valid until the rendered output was
inspected — at the required widths, with motion settled (trigger all
reveals, return to top, wait, then capture). A conclusion drawn from a
mid-animation screenshot is a conclusion about scroll timing, not the page.
**WHY:** [VALIDATED IN PROJECT] A confident wrong verdict here traced
directly to un-settled animations; the correction is procedural, not attitudinal.
A corollary: the builder's rationale is not evidence that the result works.
Reasons explain intent; only the render shows outcome. A critic who accepts
"here is why I did it" as proof has stopped being a critic.
**PREVENTS:** rubber-stamp critique; false defects; false passes.

## P12a — Composition is a first-class discipline
**RULE:** Significant pages require an **explicit written composition plan**
before implementation. Composition failures are named defects with
detectors, not matters of taste.
**WHY:** [VALIDATED IN PROJECT] Composition was the largest absent layer in
every studied system, and the costliest real failure here: a page satisfied
every typographic rule and failed as a page. One composition defect class
(padding-only seams) separated known-bad from known-good cases mechanically.
**PREVENTS:** dead canvas; padding-as-composition; document-poured-into-web.

## P12b — The grammar vocabulary is the default method, not a proven one
**RULE:** Composition plans use the vocabulary in composition-grammar.md by
default, because named moves are diffable and checkable. **Do not claim that
mandatory grammar vocabulary improves visual quality.**
**WHY:** [PLAUSIBLE — PENDING CONTROLLED EXPERIMENT] Grammar planning may
improve planning quality, consistency and traceability. A controlled A/B
experiment testing exactly this claim is running and unrevealed at the time
of writing; its result promotes or demotes this principle. Until then the
vocabulary is an experimental default, not scientific fact — and P12a stands
on its own without it.
**PREVENTS:** an unvalidated method hardening into doctrine — the failure
this whole methodology was built to avoid.

## P13 — Site law and page freedom are separate layers
**RULE:** Maintain three layers (site constitution / page-family rules /
page freedom, see site-constitution.md). An undeclared violation of a
higher layer is a defect regardless of how good the page looks.
**WHY:** [OBSERVED] Pages designed independently drift into many sites;
pages designed identically collapse into one template. The layer split is the only
mechanism that holds both failure modes off simultaneously.
**PREVENTS:** 40 pages = 40 websites; 40 pages = 1 template.

## P14 — Provenance and the learning lifecycle
**RULE:** Project-specific rules and anti-patterns carry their origin: what
happened, where (commit/PR/screenshot), and when. Rules are dated,
reviewed on a cadence, and retired to an archive with a reason — never
silently deleted, never kept forever by inertia. Withdrawn conclusions are
recorded as withdrawals, not erased.
**WHY:** [VALIDATED IN PROJECT] Incident-backed rules steered behavior harder than
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

## P16 — Evidence precedence
**RULE:** When two inputs disagree, resolve in this fixed order:

**Tier 0 — outside anyone's authority.** Not rungs, because nothing on the
ladder can outrank them and no approval can waive them:

    FACTUAL TRUTH  ·  ACCESSIBILITY FLOOR  ·  INTEGRITY (no fabricated evidence)

A brief cannot commission a falsehood; a client cannot approve an
inaccessible control; taste cannot license invented proof.

**The ladder** — resolves every remaining conflict, top wins:

     1  EXPLICIT BRIEF / NON-NEGOTIABLE HUMAN REQUIREMENTS
     2  USER JOB
     3  REGISTER REQUIREMENTS
     4  CLIENT / PROJECT BRAND
     5  SITE CONSTITUTION
     6  APPROVED PROJECT DESIGN LANGUAGE
     7  PAGE-FAMILY RULES
     8  CURRENT PAGE CONTENT
     9  REFERENCE MECHANISMS
    10  TASTE MEMORY
    11  MODEL DEFAULTS

A lower rung may only decide what a higher rung leaves open — with **one
procedural exception**: rung 8 (current page content) may win against rungs
5–7 through the recorded exception protocol (site-constitution.md), because a
measurable content requirement is the only legitimate reason to break site
law. That route is explicit, dated and approved; it is not a silent override,
and it does not exist for any other rung.

This is the methodology's single conflict-resolution hierarchy. If another
module appears to imply a different order, that module is wrong and is
reconciled to this one. **Taste never
produces a design decision on its own; it breaks ties.** IF a decision's
only justification is taste while a higher rung has an answer → the
decision is invalid, regardless of how much the human likes it.
**WHY:** Accumulated preference is real signal, but it is the second-weakest
input in the system — it describes what has pleased before, not what this
content and this visitor need now. Without an explicit ladder, taste
silently outranks register (this is exactly how a house style becomes a
template applied to every brief).
**Explicit human direction is not taste.** A stated project requirement sits
at the TOP of the ladder; accumulated preference sits near the bottom. Never
conflate them.

**Human exceptions.** A human may deliberately approve an exception against a
design heuristic. The exception must be explicit, dated, scoped and recorded
(site-constitution.md). Human approval does **not** make factual falsehood,
inaccessible behavior, or fabricated evidence valid — those are outside the
scope of anyone's approval.
**PREVENTS:** taste-as-style-generator; register override by preference;
the model's defaults masquerading as decisions; and the opposite error of
treating an explicit client requirement as if it were a mere preference.

## P17 — Generation and approval are different passes
**RULE:** On high-impact work, the pass that produces a design is not the
pass that approves it. Roles: DESIGN DIRECTOR (register, direction,
composition strategy) → BUILDER (implements the approved plan) → VISUAL
CRITIC (judges the render, without access to the builder's defence as
evidence). [Role separation is the default for high-impact pages; strict
separate-agent execution is PLAUSIBLE — the ergonomic form is still being
tested.]
**WHY:** A reasoning pass that just committed to a decision is the worst
available judge of it. Separation is what converts self-critique from an
attitude into a structure.
**PREVENTS:** self-approval; defending decisions instead of reading renders.

## P18 — Change scope is declared before iteration
**RULE:** Every refinement pass declares CHANGE (areas allowed to change)
and PROTECT (areas that must not). Anything working stays working; a
builder may not regenerate unrelated regions "while in there".
**WHY:** Unscoped iteration is the main way AI refinement destroys ground it
had already won — the fix lands, three approved things silently move.
**PREVENTS:** regression during refinement; infinite polish loops.

## P19 — Technical complexity requires a traceable reason
**RULE:** A stack, framework, dependency, or backend earns its place by
tracing to a specific requirement (technical-fit.md), the same way a visual
decision traces to material (P7). For an existing project, default to its
established architecture; for greenfield, default to the simplest
architecture that genuinely satisfies the requirements.
**WHY:** [OBSERVED — a named risk this system did not previously guard
against] Complexity added because it is fashionable, rather than because a
requirement needs it, is the technical-layer twin of costume distinctiveness
(#3 in anti-patterns.md) — sampled from what's currently popular to build
with, not derived from what this project actually needs.
**PREVENTS:** unnecessary frameworks, dependencies, and backend complexity
entering a build with no traceable justification.

## P20 — Verify only what the environment can actually verify, and say which
**RULE:** Before claiming a capability (render capture, deployment,
external fetch, image generation, persistent storage across sessions),
check it cheaply rather than assuming either that it exists or that it
doesn't (environment-awareness.md). Report exactly what was verified and
what could not be, in every case.
**WHY:** [OBSERVED — real friction in this system's own development] Both
assumption directions cause real harm: assuming a capability is absent when
it's present wastes it; assuming it's present when it's absent produces an
unverified completion claim, which P11 already treats as a hard failure
when the missing verification is a render — this principle generalizes that
same discipline to every other environment-dependent capability.
**PREVENTS:** unverified completion claims dressed as confidence; needless
refusal of capabilities the environment actually has.
