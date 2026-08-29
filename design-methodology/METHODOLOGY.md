# AI-Assisted Web Design Methodology

*Consolidated single-file edition — regenerated 2026-08-29 from the ten
modules in `design-methodology/`. Those files remain the editable source of
truth; this document is the portable read-through.*

**Purpose.** Produce context-appropriate, coherent, high-quality web design
decisions across different website types while reducing generic AI
convergence, stylistic overreach, composition failure, fabrication, and
uncontrolled inconsistency.

**Optimization order:** appropriateness → clarity → composition → identity →
craft. Novelty is never the objective — and no rule here may force it.

**Evidence statuses.** `[PROVEN]` supports this exact claim at this exact
scope · `[VALIDATED IN PROJECT]` tested against this project's real cases,
valid within that scope · `[OBSERVED]` seen repeatedly, uncontrolled ·
`[PLAUSIBLE]` hypothesis, experiment pending · `[OPEN RISK]` known failure
mode with its mitigation. Evidence for a weaker claim never supports a
stronger one. Rejected ideas appear only in Part 8.

**Conflict resolution.** One hierarchy governs the whole system: a Tier 0 of
non-negotiables (factual truth, accessibility floor, integrity) that no
approval can waive, then an eleven-rung ladder from explicit brief down to
model defaults (Part 1, P16). Any module that seems to imply a different
order is wrong and is reconciled to that one.

**Status.** Post-audit corrective pass complete; frozen for validation. The
composition-grammar hypothesis (P12b) is under controlled experiment and its
result is not yet applied.

---

## Contents

1. [Core Principles](#part-1-core-principles) — The constitution: durable behavioral mechanisms, aesthetic-neutral.
2. [Registers](#part-2-registers) — The switch that decides which rules apply and which reverse.
3. [Reference Analysis & Taste Memory](#part-3-reference-analysis-taste-memory) — How references are dissected, and how preference is stored without becoming law.
4. [Composition Grammar v1](#part-4-composition-grammar-v1) — An open vocabulary of 13 named moves — not a closed design language.
5. [Visual Direction](#part-5-visual-direction) — Baseline elicitation, direction manifestos, structural fan-out, human selection.
6. [Site Constitution](#part-6-site-constitution) — Three rule layers, the exception protocol, and promotion.
7. [QA — Three-Layer Validation](#part-7-qa-three-layer-validation) — Machine, critique, human; evidence-classed checks, quality floors, exit criteria.
8. [Anti-Patterns](#part-8-anti-patterns) — Versioned behavior bans with detection and correction.
9. [Project Memory](#part-9-project-memory) — What persists, STATE.md, and the convergence audit.
10. [Workflow](#part-10-workflow) — The orchestrator: roles, 16 stages, 4 modes, module loading.

---

<a id="part-1-core-principles"></a>

## Part 1 — Core Principles

*Source module: `core-principles.md`*

The constitution of this methodology. Every other module must obey these; a
rule elsewhere that contradicts a principle here is a bug in that module.
This file is aesthetic-neutral by design: it contains no fonts, no colors,
no layout advice. It contains the behavioral mechanisms that survived when
the aesthetic advice around them staled.

### Evidence status vocabulary

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

### P1 — Decision altitude
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

### P2 — Behavioral mechanism over aesthetic prescription
**RULE:** Encode quality as mechanisms (schemas, budgets, tests, rituals,
ledgers), not as aesthetic recipes. Aesthetic content may exist only inside
register-conditioned modules or project constitutions, never in core rules.
**WHY:** [OBSERVED — two documented cases] Aesthetic prescriptions staled
within one generation twice:
Anthropic's blog recipes became its own skill's named anti-patterns, and a
community workflow's "escape from generic" landed pixel-adjacent to the
named default it fled. The mechanisms around those recipes did not stale.
**PREVENTS:** the system becoming next year's recognizable AI aesthetic.

### P3 — Register before art direction
**RULE:** No visual decision before the register is classified and stated
(see registers.md). IF a task arrives mid-flight without a declared
register → stop and declare it first.
**WHY:** Several core rules reverse by register (density, whitespace,
distinctiveness, convention). A rule applied without register is a coin
flip. [Taxonomy PLAUSIBLE; the reversals themselves are evidenced.]
**PREVENTS:** register mismatch — the single most expensive cascade failure.
[OPEN RISK: misclassification cascades; mitigated by declaration + human
veto at the first checkpoint.]

### P4 — Derive identity; never apply it
**RULE:** Visual identity must be traceable to the project's own material —
its subject, data, artifacts, vocabulary, or physical world. Swap test: IF
the identity could be moved onto an unrelated site unchanged → it is
costume; reject it.
**WHY:** Applied identity is sampled from the model's distribution of
"distinctive looks" and converges. Derived identity cannot converge across
projects because the source material differs.
**PREVENTS:** costume distinctiveness; theming.

### P5 — Real material before visual material
**RULE:** Inventory the real material (content, data, screenshots,
interfaces, numbers) before composing. IF required material does not exist →
say so and stop; never fabricate content, data, imagery, metrics, or
testimonials. A stale real number is a defect; verify rather than repeat.
**WHY:** Fabrication destroys trust in every register and is unrecoverable
in portfolio/commerce/utility. Pages composed without material inventory
become prose poured into columns.
**PREVENTS:** fabrication; dead canvas born from having nothing to place.

### P6 — Decisions are named and written
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

### P7 — Traceability of material decisions
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

### P8 — Commitment devices
**RULE:** At every declared decision point, state the choice and the reason
in one line ("Register: UTILITY-interactive, because the visitor arrives
with inputs and leaves with a number"). State what changed and why after
every revision.
**WHY:** Stating forces committing; silent choices regress to the mode.
**PREVENTS:** vibes-selection hidden inside generation.

### P9 — Budgets and quotas
**RULE:** Scarce devices are counted, not encouraged: interruption plates
(≤1/page), aesthetic risks (register-budgeted, see registers.md), fan-out
directions (k=3 default). IF a countable budget is exceeded → mechanical QA
fails the page.
**WHY:** [OBSERVED] Countable constraints were the most reliably obeyed rule
form across all studied systems and our own production. Budgets are also
**permission, not quota**: a budget of one signature never obliges spending
it (see registers.md).
**PREVENTS:** emphasis inflation — the second bold thing killing the first.

### P10 — Human checkpoints before production
**RULE:** A human selects, rejects, or redirects before production
implementation whenever direction is open (see visual-direction.md and
workflow.md for placement and skip conditions). Total rejection of all
directions is valid output: it means the direction space was wrong.
**WHY:** [VALIDATED IN PROJECT] A full three-direction rejection redirected
real work here for the cost of three static mocks. [OBSERVED] across studied
workflows: autonomous end-to-end pipelines removed the taste engine from the
loop.
**PREVENTS:** polishing the wrong direction; taste laundering.

### P11 — Render is ground truth
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

### P12a — Composition is a first-class discipline
**RULE:** Significant pages require an **explicit written composition plan**
before implementation. Composition failures are named defects with
detectors, not matters of taste.
**WHY:** [VALIDATED IN PROJECT] Composition was the largest absent layer in
every studied system, and the costliest real failure here: a page satisfied
every typographic rule and failed as a page. One composition defect class
(padding-only seams) separated known-bad from known-good cases mechanically.
**PREVENTS:** dead canvas; padding-as-composition; document-poured-into-web.

### P12b — The grammar vocabulary is the default method, not a proven one
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

### P13 — Site law and page freedom are separate layers
**RULE:** Maintain three layers (site constitution / page-family rules /
page freedom, see site-constitution.md). An undeclared violation of a
higher layer is a defect regardless of how good the page looks.
**WHY:** [OBSERVED] Pages designed independently drift into many sites;
pages designed identically collapse into one template. The layer split is the only
mechanism that holds both failure modes off simultaneously.
**PREVENTS:** 40 pages = 40 websites; 40 pages = 1 template.

### P14 — Provenance and the learning lifecycle
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

### P15 — Second-order convergence awareness
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

### P16 — Evidence precedence
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

### P17 — Generation and approval are different passes
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

### P18 — Change scope is declared before iteration
**RULE:** Every refinement pass declares CHANGE (areas allowed to change)
and PROTECT (areas that must not). Anything working stays working; a
builder may not regenerate unrelated regions "while in there".
**WHY:** Unscoped iteration is the main way AI refinement destroys ground it
had already won — the fix lands, three approved things silently move.
**PREVENTS:** regression during refinement; infinite polish loops.

---

<a id="part-2-registers"></a>

## Part 2 — Registers

*Source module: `registers.md`*

[PLAUSIBLE] The taxonomy below is logically forced by the reversal matrix
but has not been validated end-to-end across real projects in every
register. Treat classifications as declared assumptions open to correction,
not as ground truth.

A register is not an audience description. It is the switch that decides
which design rules apply, which reverse, and how large the risk budget is.

**Every budget in this file is a ceiling, never a floor.** A register that
permits a larger aesthetic risk does not require one; a register with a
distinctiveness budget of zero forbids spending, but no register anywhere
*obliges* an aesthetic device. Turning a tendency into a mandatory treatment
is the same error as a token-level ban, arriving from the opposite side.
**No visual decision is valid before a register is declared** (core P3).

Six registers. UTILITY carries two sub-modes because eleven of its thirteen
behaviors are identical across tools and documentation; the two that differ
(composition, interaction priority) are set by the sub-mode.

---

### UTILITY (sub-modes: interactive · reading)

| Attribute | Behavior |
|---|---|
| Primary user job | Arrive with an input, leave with an answer or a completed task |
| Primary design job | Remove every obstacle between arrival and answer |
| Emotional register | Dependable calm; excitement is subtracted here, not added |
| Information density | High — hiding information is a cost; emptiness delays the answer |
| Convention / distinctiveness | Convention wins. Familiarity is usability. Distinctiveness budget ≈ 0 |
| Typography behavior | Self-effacing; carries hierarchy, never voice |
| Composition behavior | The anchor is the tool/answer itself, at reading measure. *interactive*: density gradient toward the working surface. *reading*: measure and rhythm are law; persistent rail for context |
| Imagery behavior | Explanatory and real only; decorative imagery lowers trust |
| Motion budget | ≈0; state feedback only |
| Interaction priority | Highest — states, forms, error paths are the body of the work. *reading*: navigation and search instead |
| Trust requirement | Correctness + consistency; one wrong number kills the page |
| Aesthetic risk budget | ≈0 |
| Common failure mode | Dressing the tool in marketing dramaturgy |

### PRODUCT MARKETING

| Attribute | Behavior |
|---|---|
| Primary user job | Evaluate a product for a later decision |
| Primary design job | Pair every claim with a witness — real product material beside every assertion |
| Emotional register | Competent, alive, unexaggerated |
| Information density | Medium; dense in proof, sparse in ornament |
| Convention / distinctiveness | Convention in structure, distinctiveness in identity; medium budget |
| Typography behavior | May carry expression but never outranks the claim |
| Composition behavior | Full-width anchors and bleed are the native language; no section is text-only |
| Imagery behavior | Real product material mandatory; evidence, not atmosphere |
| Motion budget | Medium; one orchestrated moment is legitimate |
| Interaction priority | CTA journey + section navigation |
| Trust requirement | Built through specificity: real screens, real numbers, real names |
| Aesthetic risk budget | Low-to-medium; up to one signature element — a ceiling, not a requirement |
| Common failure mode | A wall of unwitnessed claims; whimsy aimed at a trust-critical buyer |

### EDITORIAL

| Attribute | Behavior |
|---|---|
| Primary user job | Read — surrender attention voluntarily |
| Primary design job | Sustain reading: measure, rhythm, and pacing are law |
| Emotional register | Authority plus the publication's own voice |
| Information density | Low-to-medium on reading surfaces; high on index surfaces |
| Convention / distinctiveness | Strong template + per-story art direction. Distinctiveness lives in the template, not per page |
| Typography behavior | Highest typographic responsibility; readability craft first, expression second |
| Composition behavior | Stable symmetric body; interruption (pull-quote) is a budgeted tradition; figure interleave |
| Imagery behavior | Image direction is first-class work, decided per story |
| Motion budget | Low; anything that interrupts reading is debt |
| Interaction priority | Flow between pieces (next story, related) |
| Trust requirement | Consistency and editing discipline |
| Aesthetic risk budget | Medium-high at template design time; low at page execution time |
| Common failure mode | Redesigning every issue; ornamental body text without measure |

### PORTFOLIO / PERSONAL

| Attribute | Behavior |
|---|---|
| Primary user job | Judge a person through their work |
| Primary design job | Stage the work itself as evidence; the site is the first sample of its owner's judgment |
| Emotional register | Character and competence at once |
| Information density | Variable: dense where the work is, spacious where the narrative is |
| Convention / distinctiveness | High distinctiveness budget — but it must be **derived** from the person's real work (core P4) |
| Typography behavior | May carry identity; **recedes when the work is visual** (a photography portfolio anchors on images, not type) |
| Composition behavior | Anchors are real work artifacts; index-as-texture for bodies of work |
| Imagery behavior | The imagery *is* the work; fabrication is fatal |
| Motion budget | Medium; one moment in service of character |
| Interaction priority | Exploration + the contact path |
| Trust requirement | Honesty; one inflated number poisons the whole site |
| Aesthetic risk budget | Medium-high **if derived** from the person's real work; zero is valid when the work itself carries the identity |
| Common failure mode | Talking *about* the work instead of showing it (this is where dead canvas lives) |

### PREMIUM BRAND

| Attribute | Behavior |
|---|---|
| Primary user job | Feel and remember; purchase happens later or elsewhere |
| Primary design job | Build perceived value through staging; exploration is part of the job |
| Emotional register | Desire + the sense of craft |
| Information density | **Low — scarcity signals value** (full reversal of commerce/utility) |
| Convention / distinctiveness | Highest distinctiveness budget; convention reads as commodity |
| Typography behavior | The most legitimate place to spend the budget on type: it is part of the emotional signal |
| Composition behavior | Few elements, large imagery, wide space; bleed and asymmetry are native |
| Imagery behavior | First-class and non-negotiable in quality. IF real assets of sufficient quality do not exist → say so; do not generate substitutes |
| Motion budget | Highest available; easing quality becomes a QA subject. A ceiling, not an obligation |
| Interaction priority | Atmospheric exploration; the purchase path itself stays conventional |
| Trust requirement | Flawless execution — one cheap detail breaks the illusion |
| Aesthetic risk budget | **Highest available** — this register may legitimately spend more of it than any other. It is permission, not a quota: no risk, signature, asymmetry, type treatment or motion moment is mandatory. If the material is already distinctive, restraint may be the stronger art direction |
| Common failure mode | Atmosphere without craft precision ("cheap luxury") |

### COMMERCE (listing / product detail / checkout)

| Attribute | Behavior |
|---|---|
| Primary user job | Evaluate and buy — money is on the table now |
| Primary design job | Present decision information completely, comparably, reliably |
| Emotional register | Trust + efficiency; surprise is the enemy |
| Information density | High — abundance sells (the inverse of premium brand) |
| Convention / distinctiveness | Convention near-absolute: gallery/price/cart patterns are learned behavior; identity survives at accent level |
| Typography behavior | Price/variant/state hierarchy outranks everything |
| Composition behavior | Dense module sequences; repetition + break (badges) is the native move |
| Imagery behavior | Product imagery is decision data; accuracy is a legal-grade requirement |
| Motion budget | Low; state and gallery only |
| Interaction priority | Variant selection, stock, cart; error states cost money |
| Trust requirement | Highest and most concrete: returns, shipping, secure payment |
| Aesthetic risk budget | ≈0 on transaction surfaces |
| Common failure mode | A brand-site cosplay PDP — pruning decision info for atmosphere |

---

### Register classification procedure

Infer from the brief. Do not interrogate the user when the brief suffices.

1. **What did the visitor come here to do?** get an answer / complete a task
   (UTILITY) · evaluate for purchase (MARKETING or COMMERCE) · read
   (EDITORIAL) · judge a person (PORTFOLIO) · feel a brand (BRAND)
2. **What does success look like ~60 seconds in?** task done · demo booked ·
   still reading · contact made · item in cart · brand remembered
3. **Relationship to money:** now (COMMERCE) · later (MARKETING, BRAND) ·
   none (UTILITY, EDITORIAL, PORTFOLIO)

Default behavior: **infer → state the classification with the one-line
reason and the nearest alternative considered → proceed.** The human
corrects if wrong. Ask a question ONLY when the three answers conflict and
the hybrid rule below cannot resolve them.

**Hybrid rule:** PAGE register may differ from SITE SHELL register. The
page's register comes from its content; the shell's from the site. A
calculator inside a marketing site is a UTILITY page in a MARKETING shell —
the page obeys utility rules, the shell obeys marketing rules. [VALIDATED IN PROJECT —
production: calculator pages inside a marketing site work exactly this way.]

---

### State completeness by register

Which registers owe the interactive-state coverage defined in qa.md B3.
This is component-conditional too: a register marked "not required" still
owes coverage for any genuinely interactive component it contains.

| Register | State completeness |
|---|---|
| UTILITY-interactive | **Required** — states are the body of the work, not an edge case |
| COMMERCE | **Required** — error and empty states cost money directly |
| Product application UI (inside any register) | **Required** |
| UTILITY-reading | Required for search/nav/TOC components only |
| PRODUCT MARKETING | Not required for static sections; required for forms, pricing toggles, demos |
| EDITORIAL | Not required for reading surfaces; required for search/filters |
| PORTFOLIO | Not required for static sections; required for contact forms and filters |
| PREMIUM BRAND | Not required for atmospheric sections; required on any purchase or enquiry path |

### Reversal matrix

Rules that change sign across registers. A rule from this table may never
be written unconditionally anywhere in the system.

| Axis | Reversal |
|---|---|
| Density | COMMERCE/UTILITY: abundance = competence · BRAND: scarcity = value |
| Whitespace | BRAND: value signal · UTILITY: information cost · EDITORIAL: pacing |
| Distinctiveness | BRAND/PORTFOLIO: adds value · UTILITY/COMMERCE: subtracts task clarity and trust |
| Convention | UTILITY/COMMERCE: usability · BRAND: commodity smell |
| Animation | BRAND: produces emotion · UTILITY: state feedback only — same tool, opposite job |
| Anchor width | MARKETING/BRAND: full container · UTILITY: the tool at reading measure |
| Typography expressiveness | BRAND/EDITORIAL-template: budgeted expression · UTILITY/COMMERCE: hierarchy only · PORTFOLIO: recedes when work is visual |
| Navigation novelty | BRAND/PORTFOLIO: tolerable where exploration is the job · UTILITY/COMMERCE/reading: forbidden |
| Decoration | BRAND/PORTFOLIO: only when derived from subject · elsewhere: defect (see anti-patterns: decoration inflation) |

IF a design decision touches one of these axes and no register is declared
→ that is a blocking defect, not a style choice.

---

<a id="part-3-reference-analysis-taste-memory"></a>

## Part 3 — Reference Analysis & Taste Memory

*Source module: `reference-analysis.md`*

References exist to be **dissected, not copied**. The unit of transfer is a
mechanism; the unit of contamination is a surface. Every studied workflow
that skipped this distinction either copied skins (superficial mimicry) or
bypassed references entirely and converged anyway.

[PLAUSIBLE] Reference Cards are repeatable — i.e., two different operators
dissecting the same site would produce interchangeable cards. One card has
been produced under this format and the surface/mechanism split held; the
two-operator test has not been run.

---

### SURFACE vs MECHANISM

**SURFACE** — what the reference *looks like*. Palette, typefaces, radius,
texture, gradients, shadows, iconography style, specific spacing values.
Surfaces are register- and brand-bound; imported, they read as costume.

**MECHANISM** — what the reference *does structurally*, independent of its
skin. Examples: anchor choice ("no section is text-only"), bleed, density
transitions, asymmetry, section interruption, narrow→wide measure shifts,
statement→witness pairing, repetition→break, persistent context rails.
Mechanisms transfer across skins when the register conditions match.

**RULE: Never import a surface decision because it is visually attractive.**
Attraction is precisely the signal that you are responding to the skin.
IF a surface element seems essential → identify the mechanism underneath it
and import that instead; the surface gets re-derived from your own project
material (core P4).

**RULE: A mechanism entry must state why it works in its original register
and under which conditions it transfers.** A mechanism without transfer
conditions is a surface wearing a mechanism's name.

---

### The Reference Card

One card per reference. Cards live in project memory (project-memory.md)
and are consulted at direction-manifesto time (visual-direction.md).

```
REFERENCE CARD — <site / page / period>
IDENTITY            what it is, when captured, which pages examined
REGISTER            its register + sub-mode, in this taxonomy's terms
WHY SELECTED        who chose it and for what quality (one line, named)
MECHANISMS          named structural moves, each with WHERE it appears
                    and WHY it works in this register
SURFACE             the skin, listed explicitly so it is visible…
SURFACE QUARANTINE  …and explicitly marked DO-NOT-IMPORT
TRANSFER CONDITIONS which registers/page-families each mechanism moves to,
                    and which it must not
TRANSFER RISK /     mandatory field, but a valid value may be: a named toxic
DO-NOT-TAKE         surface or mechanism · a condition under which the
                    reference stops transferring · or "none identified after
                    review". The operator must show transfer risk was
                    considered; inventing a flaw to satisfy the form is worse
                    than recording that none was found
MEASURED EVIDENCE   numbers, not impressions: measures in px/ch, column
                    counts, section heights, screenshots attached
PROVENANCE          who dissected it, when, from what material
REVIEW / EXPIRY     date to re-examine; references stale like rules do
```

Field rules:
- MECHANISMS with no WHERE → delete the entry; unlocated mechanisms are
  guesses.
- TRANSFER RISK / DO-NOT-TAKE is a mandatory field with an honest empty
  value. Most admired references carry a signature that would poison the
  importing project, and naming it is the card's immune system — but a
  forced criticism is noise, and "none identified after review" is a real
  finding when it is true.
- MEASURED EVIDENCE beats adjectives. "Generous spacing" is not evidence;
  "text measure 68ch, section padding 96px, 11 sections over 8987px" is.
- A card whose TRANSFER CONDITIONS cannot be written is blocked on register
  vocabulary — classify the reference's register first.

### Lifecycle

- Cards are created during the REFERENCE ANALYSIS stage (workflow.md) or
  opportunistically when the human shares an admired site.
- Cards are consulted, never pasted: direction manifestos may cite card
  mechanisms; they may not cite card surfaces.
- Cards expire. On expiry: re-verify against the live reference; renew,
  amend, or archive with a reason (core P14).
- IF multiple cards in the store share the same mechanism list → the store
  itself is converging; diversify sources before the next project
  (project-memory.md convergence audit applies to the card store too).

---

## Taste Memory

A second, weaker layer beside Reference Cards. **Taste memory is not design
law** (core P16: it sits second-from-bottom in the precedence ladder, above
only model defaults). It records what this human repeatedly responds to, so
that preference becomes visible and reviewable instead of invisible and
assumed.

Reference Card vs Taste Memory:
- A **Reference Card** is a deliberate dissection of a chosen reference,
  produced during a project stage, consulted when writing manifestos.
- A **Taste Memory item** is an opportunistic capture — something the human
  saved, liked, or disliked, in or out of project context. Cheap to record,
  weak in authority, valuable in aggregate.

### Inspiration item format

```
TASTE ITEM — <short name>
DATE
SOURCE                url / file / screenshot / "seen in <context>"
TYPE                  site · page · component · motion · type · layout · other
TAGS                  free tags for clustering
HUMAN WORDS (VERBATIM)  the human's own explanation, unedited
ANALYSIS              Claude's reading — kept separate from the words above
TRANSFERABLE MECHANISM  the structural move, if any (may be "none")
SURFACE FEATURES      the skin, listed so it stays visible as skin
REGISTER              the source's register, in registers.md terms
POSITIVE / NEGATIVE   liked or disliked — negatives are equally valuable
STATUS                active · superseded · retired
SCORE (optional)      strength of the reaction, if the human gave one
```

**The human's verbatim words are the highest-value field.** Never overwrite
them with Claude's interpretation, never "clean them up", never summarise
them away. ANALYSIS is a separate field precisely so the two are never
conflated: the human's "this feels like it respects my time" and Claude's
"low density, high measure discipline" are different kinds of evidence, and
only the first is primary.

A NEGATIVE item is recorded with the same care as a positive one. What
someone reliably dislikes constrains the space faster than what they like.

### Synthesis

Individual items → recurring preference clusters → a provisional taste
profile.

- **Cluster** when ≥3 items share a mechanism or a tag with the same
  polarity. Name the cluster in mechanism terms, not surface terms.
- **Provisional taste profile** = the current set of clusters, dated, each
  with the item ids behind it. It is provisional by construction and is
  regenerated, never hand-edited.
- The profile may be consulted at manifesto time as a tie-breaker only
  (core P16). A manifesto may not cite taste as its reason for an anchor,
  a hierarchy, or a density decision — those come from content and register.

### Taste decay

Preferences age. Every item and cluster carries a review date; on review it
is renewed, superseded, or retired with a reason (core P14).

[PLAUSIBLE] Working defaults, explicitly not scientific truth: review items
at ~90 days; weight recent items above older ones when clustering; retire an
item that has not been reinforced across two consecutive reviews. These
numbers are placeholders awaiting evidence — do not present them as
findings, and do not import another system's half-life as if it were one.

### Taste and convergence

Taste memory feeds the convergence audit (project-memory.md). A preference
that keeps winning is exactly how an unconscious house style forms — the
audit's response is one forced-alternative direction, never a ban.

---

<a id="part-4-composition-grammar-v1"></a>

## Part 4 — Composition Grammar v1

*Source module: `composition-grammar.md`*

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

### How to read the MECHANICAL CHECK values

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

### The moves

Each: PURPOSE · INPUT CONDITION · REGISTER FIT · PAIRS WITH · CONFLICTS ·
OVERUSE FAILURE · MECHANICAL CHECK.

#### 1. Full-width anchor
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

#### 2. Bleed
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

#### 3. Background shift
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

#### 4. Measure narrowing
- PURPOSE: mark a register change (prose ↔ working surface) with width.
- INPUT: a genuine content-mode transition.
- REGISTER: universal; law on Editorial/Utility-reading.
- PAIRS: rail+body (5), statement+witness (6).
- CONFLICTS: full-width anchor (1) in the same block.
- OVERUSE: measure zigzag → the page feels unstable.
- CHECK: HEURISTIC SIGNAL — measured line length in ch within declared bounds per block type.

#### 5. Rail + body
- PURPOSE: separate meta from content; make lists scannable.
- INPUT: real meta (ids, labels, counts) — not invented annotations.
- REGISTER: Utility/Editorial/Portfolio strong; others neutral.
- PAIRS: measure narrowing (4), index-as-texture (7).
- CONFLICTS: statement+witness (6) in the same band (two competing splits).
- OVERUSE: everything railed → the rail stops signifying meta.
- CHECK: HEURISTIC SIGNAL — rail column ≤ 25% width; rail content in the label register.

#### 6. Statement + witness
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

#### 7. Index as texture
- PURPOSE: let genuine multitude be both content and visual field.
- INPUT: ≥ ~10 real, linked items.
- REGISTER: Utility/Commerce/Portfolio. **Reverses in Brand** (scarcity).
- PAIRS: rail+body (5), repetition+break (9).
- CONFLICTS: the sparse end of density gradient (12).
- OVERUSE: wall — unscannable.
- CHECK: HEURISTIC SIGNAL — item count + fraction of real hrefs (no dead/placeholder items).

#### 8. Interruption plate
- PURPOSE: stop the reader once, for the single thing worth stopping for.
- INPUT: a page that truly has ONE takeaway.
- REGISTER: universal, budgeted: Editorial (pull-quote tradition),
  Marketing 1, Utility 0–1.
- PAIRS: background shift (3).
- CONFLICTS: bleed (2); a second plate.
- OVERUSE: the second plate destroys the first. [OBSERVED in production use.]
- CHECK: HEURISTIC SIGNAL — high-contrast plate count ≤ 1 per page. A budget, not a quota: zero is legitimate.

#### 9. Repetition + break
- PURPOSE: regularity builds trust; the single break carries information.
- INPUT: a real series + a genuinely deviant member.
- REGISTER: universal; native to Commerce (badges).
- PAIRS: index-as-texture (7), window-card (10).
- CONFLICTS: none.
- OVERUSE: multiple breaks → the pattern collapses.
- CHECK: HEURISTIC SIGNAL — one style-deviant child in the repeated grid; zero is also valid, the move is optional.

#### 10. Window-card
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

#### 11. Colophon / spec plate
- PURPOSE: present facts as a record (label–value rows).
- INPUT: real, current values, traceable to source.
- REGISTER: Portfolio/Utility/Marketing.
- PAIRS: statement+witness (6), rail+body (5).
- CONFLICTS: none.
- OVERUSE: every list bureaucratized into a plate.
- CHECK: HARD ASSERT — fabrication lint — every value derivable from repo/source.

#### 12. Density gradient
- PURPOSE: open airy, densify toward the working material (direction
  reverses per register: Brand may stay sparse throughout).
- INPUT: the page has a working surface.
- REGISTER: universal, direction register-set.
- PAIRS: full-width anchor (1), bleed (2), index-as-texture (7).
- CONFLICTS: none.
- OVERUSE: inverse gradient (dense → empty) deflates the page.
- CHECK: EXPERIMENTAL METRIC — sign of the band-occupancy slope across the page.

#### 13. Persistent rail
- PURPOSE: keep context available across a long scroll (TOC, facets,
  summary).
- INPUT: long body + context that is needed continuously.
- REGISTER: Utility-reading/Editorial-longform; unnecessary in Marketing.
- PAIRS: rail+body (5), index-as-texture (7).
- CONFLICTS: bleed (2) — sticky + bleed produces chaos.
- OVERUSE: multiple sticky columns → a page that shudders.
- CHECK: HEURISTIC SIGNAL — sticky element's viewport share ≤ 30%.

---

### MISSING GRAMMAR

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

---

<a id="part-5-visual-direction"></a>

## Part 5 — Visual Direction

*Source module: `visual-direction.md`*

How aesthetic direction is explored, compared, and selected — before any
production implementation. Two mechanisms: baseline elicitation (optional,
rule-gated) and manifesto-driven fan-out with a mandatory human checkpoint.

---

### Baseline elicitation

Render the model's modal answer on purpose, as a **negative exhibit**.
It is never Direction 0, never a candidate, never implementation.

**WHEN TO USE** [PLAUSIBLE — one field report + one experimental analog]:
- Greenfield project (no design language exists) AND the register is not
  convention-dominant.
- A new page-family inside an existing site whose modal treatment is
  unknown.
- The human's taste has not yet been elicited (new working relationship) —
  people react to a concrete wrong thing more precisely than they choose
  among abstract right things.

**WHEN TO SKIP:**
- A strong project language + existing page-family: **the language is
  already the anti-baseline.**
- Convention-dominant registers (UTILITY, COMMERCE transaction surfaces):
  the modal answer is largely the *correct* answer there; there is nothing
  to escape, so the baseline is waste. (The baseline technique is itself
  register-conditional — no mechanism in this system is exempt from the
  reversal matrix.)

**WHAT TO EXTRACT** (then discard the artifact). Extract *failure
mechanisms*, not the mere fact that the model produced something:

1. **What is generic because it ignores project material** — the parts that
   would be identical for any brief. These become negative constraints.
2. **What is structurally weak** — named composition failures (dead canvas,
   padding-only seams, unearned borders). These become negative constraints.
3. **What the human specifically rejects**, verbatim → the negative brief.
4. **What may actually be correct** because the register or a convention
   calls for it. **Modal is not synonymous with wrong.** A convention-dominant
   register's modal answer is often the right answer; marking it "banned"
   because the model reached it first would force novelty, and novelty is
   never this system's objective.

Only identified failure mechanisms become constraints. There is no rule of
the form "the model used this, therefore we must not."

Nothing else is extracted. No code survives. The baseline is static, routeless,
   timeboxed, and presented under the label "the default we are escaping."

**Anchoring mitigation:** show the baseline after labeling it, never as the
first of the candidates; keep its fidelity visibly lower than the
directions'.

---

### Direction manifesto

Every direction DECLARES its structure **before rendering**. The manifesto
is the unit that gets diffed — pixels are not.

```
DIRECTION MANIFESTO — <name>
ANCHOR TYPE            which real object carries the page
INFORMATION HIERARCHY  what speaks first, second, third
DENSITY                declared band (per register vocabulary)
SECTION RHYTHM         how sections alternate (ground/measure/columns)
PAGE SILHOUETTE INTENT how the page opens, peaks, and ends
TYPOGRAPHY ROLE        carrier of identity / carrier of hierarchy only
IMAGERY ROLE           evidence / subject / absent — and why
INTERACTION MODEL      what the visitor does on this page
DISTINCTIVENESS BUDGET where budget is spent, or "none" — stated either way
```

Structural axes: ANCHOR TYPE, INFORMATION HIERARCHY, DENSITY, SECTION
RHYTHM, PAGE SILHOUETTE INTENT.
Surface axes (declared but **never counted as divergence**): color family,
dark/light, font personality, motion flavor.

### Fan-out

- **k = 3 by default.** Two directions under-sample the space; four dilute
  the selection and the budget. [VALIDATED IN PROJECT — structural fan-out at
  k=3 produced a useful outcome once, including an informative total
  rejection; the exact k is PLAUSIBLE.]

**Divergence rule — minimum structural distance.** Directions must diverge
meaningfully across **at least three structural axes**:

  anchor choice / anchor treatment · information hierarchy · density ·
  section rhythm · page silhouette · interaction model · content sequencing

**ANCHOR TYPE is the highest-value axis but is not universally mandatory.**
IF the content truth strongly implies one anchor — the page genuinely owns a
single obvious object — then keep the anchor fixed and diverge through
treatment, hierarchy, sequencing, rhythm, density or silhouette. Forcing
three different anchors onto content that has one would manufacture fake
diversity, which is the same failure as fan-out theatre wearing the opposite
costume.

- **Surface changes never count** toward divergence: colour family,
  dark/light, font personality, motion flavour.
- IF two manifestos fail the three-axis distance → regenerate before
  rendering. The diff runs on the manifestos, never on pixels.
- **Held fixed across all directions:** project truth (brand tokens, voice),
  content truth (real material only), site constitution, and every
  convention the register marks as required. Divergence never spends from
  these accounts — three directions must not be three different brands.
- Directions render as low-cost static mocks, not production code.

### Human checkpoint

Directions are shown **before production implementation**, each with its
manifesto summary beside the render — so the human selects structure, not
polish.

The human may:
- **SELECT** one direction (optionally with notes),
- **REJECT ALL** — valid and valuable output: it means the direction space
  was wrong, and the correct next step is new manifestos, not refinement of
  a rejected one. [VALIDATED IN PROJECT: a full three-direction rejection
  redirected real work for the cost of three static mocks.]
- **REQUEST HYBRID** — name which axes come from which direction; a hybrid
  gets its own manifesto before implementation.

The selected manifesto becomes an input to the constitution/amendment stage
and the standard the build is later diffed against (qa.md).

---

<a id="part-6-site-constitution"></a>

## Part 6 — Site Constitution

*Source module: `site-constitution.md`*

The mechanism that prevents both failure poles at once: 40 pages that look
like 40 websites, and 40 pages that look like one template. Exactly three
layers; every design decision belongs to one of them, and an undeclared
violation of a higher layer is a defect regardless of how the page looks
(core P13).

---

### Layer 1 — GLOBAL / SITE CONSTITUTION
Decisions every page inherits without renegotiation.

| Element | Constitutional content |
|---|---|
| Typography | Families, roles, scale; label register (the meta/eyebrow treatment) |
| Color | Token ramps; which color is functional vs identity; accessibility floor |
| Spacing | The spacing scale (not per-page values) |
| Container widths | The set of legal measures (prose / document / working / landing) |
| Navigation | Structure and behavior — **never restyled as part of a page change** |
| Footer | Same protection as navigation |
| Controls / buttons | Variants, states, interaction behavior |
| Border / radius | The one border-and-radius language |
| Imagery | Honesty rules (real material only); sourcing constraints |
| Motion | Easing/duration vocabulary; reduced-motion floor |
| Copy register | Voice, casing, naming consistency rules |

### Layer 2 — PAGE-FAMILY RULES
Decisions shared by a family (detail pages, index pages, product pages…).

| Element | Family content |
|---|---|
| Composition | The family's skeleton: section sequence template |
| Anchors | The family's anchor TYPE norm (each page picks its instance) |
| Density | The family's density band (register-derived) |
| Grammar subset | The family's house moves from composition-grammar.md |
| Background transitions | The family's seam pattern |
| Page transitions | How pages of this family connect (prev/next, related) |

### Layer 3 — PAGE-SPECIFIC FREEDOM
What each page decides alone, inside the bands above.

- Anchor **instance** (which real object, per its own content inventory)
- Section order within the family skeleton
- One budgeted one-off grammar move
- Density position within the family band
- Ground alternation pattern across its own seams
- Its single interruption plate — or none

IF a decision cannot be located in one of the three layers → it is
undeclared; declare it (usually Layer 3) or remove it.

---

### EXCEPTION PROTOCOL

A page may violate a higher-layer rule ONLY when the reason is an
**identifiable content requirement** — a property of the content, not a
preference.

- Acceptable: "The 281-item index cannot remain scannable under the
  standard card grid." [This is a real, shipped exception in the reference
  project.]
- Not acceptable: "A serif looks nicer here."

Test: IF the justification names a measurable content property that breaks
under the rule → proceed to record. IF it names taste → denied; route the
desire through visual-direction.md instead (maybe the *rule* is wrong — that
is an amendment discussion, not a page exception).

Every exception is recorded in project memory with:

```
EXCEPTION — <date>
PAGE            route
RULE BROKEN     layer + rule, verbatim
CONTENT REASON  the measurable property
RENDER EVIDENCE screenshot(s) of the exception working
HUMAN APPROVAL  who approved, when
```

Silent exceptions are defects even when the result is good: they rot the
constitution's authority and hide future promotions.

### PROMOTION

[PLAUSIBLE — thresholds are working values, not measured optima.]

- An exception reused successfully on **2–3 different pages** OR adopted
  once by **explicit owner decision** is promoted: to a page-family rule if
  family-scoped, to the global constitution if universal.
- Promotion carries its provenance chain (the original exception records).
- The demoted old rule is archived with a reason, not deleted (core P14).
- Reference precedent: a labeling treatment invented on one detail page,
  reused across the family, then promoted into the sitewide label register —
  the promotion path this protocol formalizes.

---

<a id="part-7-qa-three-layer-validation"></a>

## Part 7 — QA — Three-Layer Validation

*Source module: `qa.md`*

Validation is split by what each layer can actually see. Machines assert,
rendered-eye critique names, humans judge. "It looks good" is not a
criterion in any layer, and a page never passes on it.

---

### A. MACHINE QA

Runs on the built page, headless, at the declared widths. **Every check
carries an evidence class, and only two classes gate shipping.**

| Class | Effect |
|---|---|
| **HARD ASSERT** — objectively invalid when failed | blocks completion |
| **VALIDATED PROJECT DETECTOR** — empirically separated known-good/known-bad here | blocks, within its tested scope |
| **HEURISTIC SIGNAL** — useful warning needing interpretation | opens a visual-critique finding |
| **EXPERIMENTAL METRIC** — awaiting validation | informs critique; **never blocks alone** |

#### HARD ASSERTS

| Check | Asserts |
|---|---|
| Unintended horizontal overflow | `scrollWidth − clientWidth = 0` at every declared width |
| Contrast | text/ground pairs meet the required WCAG ratio |
| Focus behavior | a visible focus indicator exists on every interactive element |
| Unresolved production placeholder | no `EXPLICIT_PLACEHOLDER` remains at ship (see lint below) |
| Fabricated evidence | none present, at any stage |
| Constitution violation | no undeclared deviation from site law |

#### VALIDATED PROJECT DETECTORS

| Check | Status |
|---|---|
| Padding-only seams (>220px combined seam, identical ground) | separated known-bad/known-good/positive-control **3/0/0 in this project**. Valid within tested scope. **Known limitation:** absolute threshold — repeated *identical* same-ground seams just under it pass while showing the same failure (observed in Controlled Experiment 1); a relative form is a candidate revision |

#### HEURISTIC SIGNALS

Text measure bounds · interruption-plate count · anchor width share · rail
width share · index item count · sticky viewport share · content-node
diversity per card. Each may open a critique finding; none blocks by itself.

#### EXPERIMENTAL METRICS

Dead-canvas geometry v2 · absence ratio thresholds · silhouette variance ·
density-slope thresholds. These inform the critic and **may never block
shipping**. When a metric fails to separate a known-bad from a known-good
case, fix or retire it — a wrong detector is worse than none. [This happened
once: the first dead-canvas metric was retired on ground-truth evidence.]

#### Fake-content lint — three verdicts

| Verdict | Meaning | Exploration | Ship |
|---|---|---|---|
| `REAL_VERIFIED_CONTENT` | traceable to repo or a read source | allowed | allowed |
| `EXPLICIT_PLACEHOLDER` | visibly marked as a placeholder, never presented as evidence | **allowed** | **blocks** |
| `FABRICATED_EVIDENCE` | realistic-looking invented evidentiary material | **hard failure** | **hard failure** |

The lint must distinguish these three. A placeholder that reads as a
placeholder is a legitimate exploration tool; a placeholder that reads as
real data is fabrication regardless of intent (anti-patterns #9).

Do not pretend all visual quality automates. The battery catches defect
*classes* with geometric signatures; everything else belongs below.

### A2. WEB QUALITY BASELINE

Register-independent floor. Its purpose is narrow: prevent a visually strong
page from being called complete while basic web usability is broken. Use
established objective standards (WCAG and platform guidance) where they
exist; **do not invent thresholds**.

- Semantic structure: headings form a real outline; landmarks present.
- Keyboard operability: every interactive element reachable and operable.
- Focus order: follows the visual/reading order.
- Visible focus: present and not suppressed.
- Forms where applicable: labelled controls; errors identified in text, not
  colour alone.
- Alt-text strategy: informative images described; decorative images
  explicitly empty.
- Touch targets: adequate size and spacing per platform guidance.
- Zoom / reflow: content survives text zoom and narrow reflow without loss.
- Contrast: meets the required ratio (also a HARD ASSERT above).
- Reduced motion: honoured.
- Responsive behavior: no unintended overflow at any declared width.

This is a floor, not an accessibility curriculum. Failures here are HARD
ASSERTS where objectively testable, otherwise named critique findings.

### A3. PERFORMANCE & ASSET QUALITY GATE

High-end visual design also fails through implementation weight. Findings
are **proportional to project and register**; do not invent universal KB
budgets unless the project sets them.

- Responsive image sizing: correct dimensions served for the display size.
- Asset compression: no uncompressed or wildly oversized media.
- Font payload: no avoidable weights/subsets shipped.
- Layout shift: no obvious shift caused by media or font loading.
- Motion/render cost: animation does not degrade interaction.
- Autoplay and heavy media: justified by the register and controllable.

**Premium Brand is not permission for unnecessary performance damage.** A
register with the largest motion and imagery budget carries the largest
obligation to spend it competently.

### B. VISUAL CRITIQUE

**Role separation (core P17).** On high-impact pages the critic is a separate
pass from the builder. [Strict separate-agent execution PLAUSIBLE; pass
separation is the default.]

The critic evaluates: **rendered evidence** · the requirements · the direction
manifesto · the composition plan · the constitution · the machine-QA results.

The critic does **not** accept "I did this because…" from the builder as
proof that the result works. **Intent is not evidence; the rendered outcome
is evidence.** A rationale may explain what was attempted and may be checked
against the render — it may never substitute for it. A critique that cites
"the plan says this is the anchor" instead of what the capture shows is
defective and is returned.

Claude inspects **rendered screenshots** — never the code alone, never a
description of the code.

**Capture protocol [VALIDATED IN PROJECT — a real wrong verdict created this rule]:**
1. Build and serve; open at each declared width (default 1440 / 834 / 390).
2. **Settle motion first:** scroll the full height in steps, return to top,
   wait; only then capture. Reveal-style animations photographed mid-flight
   read as faded text and empty boxes.
3. Capture the full page in overlapping viewports; read them as a reader,
   not as a diff.

**Checks:** section rhythm · hierarchy legibility · full-page silhouette ·
mobile RE-composition (not mere reflow) · reference-mechanism fidelity
(against the cited cards) · direction-manifesto fidelity (against the
selected manifesto) · excess decoration · motion timing · the named
composition failure modes (anti-patterns.md).

**Register-conditional emphasis** (registers.md sets which layer works
hardest): PREMIUM BRAND adds a craft-precision pass — easing curves, motion
timing, asset quality, alignment at the pixel level — because flawless
execution IS that register's trust requirement; UTILITY adds interaction-
state coverage (error, empty, loading, disabled) as first-class critique
subjects; EDITORIAL adds reading-measure and rhythm checks at body-text
priority. A register's emphasis layer failing = an open finding, same as
any other.

**Dead canvas vs intentional negative space.** These are different things
and only the critic can tell them apart:

- **DEAD CANVAS** — space that exists because the layout has no compositional
  job for the area.
- **INTENTIONAL NEGATIVE SPACE** — space performing a readable role:
  hierarchy, pacing, focus, anticipation, isolation, or brand staging.

Emptiness is not a defect merely because the geometry is empty. Detectors
flag *candidates*; they never infer intent. The critic decides whether the
emptiness has a readable compositional function — and must say which function
when ruling it intentional. This distinction matters most in PREMIUM BRAND
and image-led PORTFOLIO work, where scarcity is the register's own signal.

**Finding validity rule:** every finding names its failure mode and its
location. "Bland", "off", "needs polish" are invalid findings — a critique
containing one is returned as defective. A critique with zero findings must
state which named modes were checked and found absent.

### B2. FINDING CLASSES AND ITERATION SCOPE

Every finding is classified, because different classes get different
treatment and only one of them licenses a rewrite:

| Class | Meaning | Treatment |
|---|---|---|
| **WRONG** | Clearly incorrect; violates a rule, a plan, or a fact | Must change |
| **MISSING** | A required element, state, behavior or composition function is absent | Must be added |
| **ROUGH** | The underlying decision is defensible; the execution is weak | Refine in place — do not re-decide |
| **CORRECT — PROTECT** | Working; must survive the next pass unchanged | Named explicitly, so it can be protected |

**CORRECT — PROTECT is mandatory, not optional.** A critique that lists only
problems hands the builder an unbounded licence.

**ITERATION SCOPE (core P18).** Every refinement pass opens with an explicit
scope statement:

```
CHANGE:  <regions/aspects allowed to change this pass>
PROTECT: <regions/aspects that must not change>
```

Deriving the scope: from the findings, **identify what is wrong** (WRONG /
MISSING / ROUGH) and **identify what already works** (CORRECT — PROTECT);
CHANGE covers only the former, PROTECT covers the latter. Then modify only
that scope, re-render, and verify **both** the correction and the protected
regions.

The builder may not regenerate anything outside CHANGE. IF a fix appears to
require touching a PROTECT region → stop and renegotiate the scope; do not
silently widen it. After the pass, re-capture and verify that PROTECT regions
are visually unchanged (diff the captures where possible).

**Critique is not permission for redesign.** A finding licenses a bounded
correction, never a fresh attempt at the whole page. IF the critique
concludes the direction itself is wrong → that is not a refinement; it goes
back to the human checkpoint (workflow.md stage 8), because changing
direction after production is a decision only a person makes.

### B3. STATE COMPLETENESS

Register- and component-conditional (registers.md). Required wherever the
surface is interactive — UTILITY-interactive, COMMERCE, product application
UI — and for any interactive component elsewhere. **Not** required of static
marketing sections; demanding it there is ceremony.

Where it applies, every interactive surface/component is designed and
verified in each relevant state:

**Interaction / data states:** DEFAULT · LOADING · POPULATED · EMPTY ·
ERROR · SUCCESS · DISABLED · FIRST-TIME · HOVER · FOCUS · ACTIVE/PRESSED

**Content-extreme states:** LONG-CONTENT (long values, long lists, wrapped
labels) · SHORT-CONTENT (one item, empty-ish but valid data)

**Viewport states:** desktop · mobile · tablet **where the composition
materially changes** (if tablet is only a reflow of desktop, say so and skip
it) · scroll behavior where anything is sticky or revealed

Rules: **coverage is conditional and explicit.** A state that cannot occur
for a component is marked N/A with the reason — silence is not coverage, and
demanding meaningless states (a hover state for a static paragraph, a loading
state for a server-rendered list) is ceremony, not rigour. EMPTY and ERROR
are designed, not defaulted; FOCUS is never merely "not removed". **State completeness is part of the definition of
done for interactive surfaces** — see EXIT CRITERIA.

### C. HUMAN JUDGMENT

The human owns, and only the human closes:
- final register fit
- taste
- brand truth
- derivation integrity ("is this OUR thing, grown from our material")
- exception approvals (site-constitution.md)
- direction selection (visual-direction.md)

Claude may recommend in these areas; Claude may not close them.

---

### EXIT CRITERIA

A page is complete ONLY when all of the following are true:

1. **Machine QA green.** No red check; advisory metrics reported.
2. **No undeclared constitution violation.** Constitution diff clean, or
   every deviation exists as a recorded exception.
3. **Manifesto/build diff acceptable.** The build honors the selected
   direction manifesto and the composition plan; every divergence is
   declared with a reason.
4. **Visual critique closed.** Zero unresolved named findings — resolved
   means fixed and re-shot, or explicitly accepted by the human with the
   acceptance recorded.
5. **State completeness satisfied** where it applies (B3): every relevant
   state designed and verified, or marked N/A with a reason.
6. **Web quality baseline met** (A2), and performance findings (A3) either
   resolved or explicitly accepted.
7. **Human approval exists** and is recorded in project memory.

No experimental metric appears in this list, and none may block a page on its
own — an unvalidated number must never become a gate.

One validated pass through this gate beats three speculative ones. A page
that fails any criterion is not "mostly done"; it is open.

---

<a id="part-8-anti-patterns"></a>

## Part 8 — Anti-Patterns

*Source module: `anti-patterns.md`*

v1 — created from Research Steps 1–5. **Review cadence: 12 months or on
first contradicting evidence, whichever comes first.** Entries are dated
and carry status; retired entries move to an archive section with a
reason — this file must not become an eternal blacklist. (The precedent:
one generation's aesthetic recipes became the next generation's named
defaults in the very system we studied. Undated lists rot.)

These are **behavior and failure-mode bans, not aesthetic trend bans.**
Rejected research ideas live here so they cannot re-enter the methodology
under new wording.

Format: SYMPTOM · MECHANISM · DETECT · CORRECT · STATUS.

---

### 1. Distributional defaulting
- SYMPTOM: the design is a set of individually defensible, collectively
  characterless choices; it could be any site.
- MECHANISM: sampling regresses to the modal answer on every axis left
  unnamed by context.
- DETECT: swap test (would this identity fit another site unchanged?);
  baseline comparison where one exists.
- CORRECT: derive from project material (core P4); name the unnamed axes.
- STATUS: [OBSERVED] 2026-08 — the root phenomenon across all studied systems; a mechanism account, not a controlled measurement.

### 2. Token-level anti-generic rules
- SYMPTOM: rules like "avoid font X", "never color Y".
- MECHANISM: banning tokens shifts the distribution to adjacent tokens; the
  replacements become the next recognizable default (observed twice across
  skill generations).
- DETECT: any rule that names a font/color/radius outside a project
  constitution.
- CORRECT: rewrite at mechanism level ("decoration must carry information"),
  or move into a register-conditioned or project-scoped rule.
- STATUS: [REJECTED — policy decision, banned from re-entry] 2026-08. The
  supporting evidence is [OBSERVED] (two staling generations); the ban itself
  is a choice, not an empirical finding.

**Rewrite table** — the form every candidate ban must take before entering
this file. Left column = rejected shapes seen in studied systems.

| Rejected (token-level) | Accepted (mechanism-level) |
|---|---|
| "Do not use Inter." | "Reject typography chosen only because it is the model's default; neutral typography stays valid when the register calls for it." |
| "Purple gradients are banned." | "An ornamental or expressive element must carry a defensible function appropriate to the register (see #11)." |
| "Every page needs an unusual display font." | "Spend the register's distinctiveness budget where the content gives it something to say." |
| "Never use three cards." | "Reject equal-weight repeated containers when the content has hierarchy the layout is hiding." |
| "Break the grid once per page." | "Break an established structural rule only when the break communicates hierarchy, continuation, emphasis, or content behavior." |
| "Every page needs a memorable visual trick." | "One signature is a budget, not a requirement; registers with a ≈0 risk budget spend none." |
| "Asymmetry is better." | "Asymmetry is register-conditional (see reversal matrix); reading surfaces prefer stability." |
| "Luxury means serif and whitespace." | "Premium brand may spend more budget on typography and space because exploration and emotional signalling are part of the user job." |

Named look-clusters may still be recorded as **distribution-aware warnings**
(what the model currently over-produces, dated) — never as universal bans.

### 3. Costume distinctiveness
- SYMPTOM: a strong "identity" that has no traceable relation to the
  subject; physical metaphors applied to unrelated products.
- MECHANISM: distinctiveness sampled from the model's distribution of
  distinctive looks, instead of derived from material.
- DETECT: swap test; derivation chain missing from the manifesto.
- CORRECT: rebuild identity from the content inventory; if the subject's
  world is thin, spend less budget rather than borrowing a world.
- STATUS: [OBSERVED] 2026-08 — one documented field case: an anti-generic workflow landed inside the exact named default it fled.

### 4. Dead canvas
- SYMPTOM: wide viewport, single left column, right half empty across
  consecutive sections; a document poured into a website.
- MECHANISM: composing prose instead of composing a page; no anchor
  inventory before layout.
- DETECT: dead-canvas geometry [PLAUSIBLE v2]; eye check against full-page
  captures.
- CORRECT: statement+witness or narrow the measure so emptiness reads as
  margin (grammar moves 6, 4).
- STATUS: [VALIDATED IN PROJECT] 2026-08 — shipped, diagnosed from render, fixed; provenance in this project (commit a9178b2).

### 5. Padding as composition
- SYMPTOM: 300–600px voids between sections; separation exists only because
  things stopped touching.
- MECHANISM: padding used where a change (ground, measure, columns) should
  do the work.
- DETECT: **padding-only seam detector — VALIDATED PROJECT DETECTOR, 3/0/0 within tested scope** (qa.md carries its known threshold limitation).
- CORRECT: background shift or another seam change (grammar move 3).
- STATUS: [VALIDATED IN PROJECT] 2026-08, same provenance.

### 6. Border without structural reason
- SYMPTOM: boxes around single labels; fences around words.
- MECHANISM: card as default container instead of earned frame.
- DETECT: content-node diversity per card ≤ 1.
- CORRECT: lists, rows, rails for labels; keep borders for structured
  content (grammar move 10).
- STATUS: [VALIDATED IN PROJECT] 2026-08 — the 19-one-name-boxes case, rejected in review; and a working bento counter-example.

### 7. Card-everything
- SYMPTOM: open prose boxed; the reference page reads as a dashboard.
- MECHANISM: uniform containerization as a substitute for hierarchy.
- DETECT: boxed-prose scan; card density per page.
- CORRECT: prose sits open; one edge for the interface, one tint for
  evidence, one plate for the takeaway.
- STATUS: [OBSERVED] 2026-08 — a production rule predating the methodology, held across many pages.

### 8. Screenshot optimization
- SYMPTOM: quality that exists only in the hero viewport; the rest of the
  scroll is unmade.
- MECHANISM: evaluation biased to what a single capture shows; guidance
  systems trained on screenshot diffs inherit it.
- DETECT: full-height captures mandatory; absence metrics over the whole
  page.
- CORRECT: full-page silhouette in the plan; QA reads the entire scroll.
- STATUS: [OBSERVED] 2026-08 — a structural evaluation bias identified in studied systems.

### 9. Fabricated evidence
**Scope, precisely.** The ban covers EVIDENTIARY MATERIAL, not all generated
imagery.

**EVIDENTIARY MATERIAL — never invented, never realistically fabricated, at
any stage:** metrics · customer numbers · testimonials · logos · product
screenshots · product results · case-study outcomes · business facts ·
photographs presented as documentary reality.

**EXPRESSIVE / SYNTHETIC MATERIAL — may be created** when the brief calls for
it, its synthetic nature is not deceptive, it suits the register, and it is
not presented as evidence of real product, customer or business performance:
illustration · abstract imagery · decorative artwork · generated texture ·
fictional visual metaphor · intentionally synthetic campaign imagery.

So: "never fabricate evidence" is absolute. "Never generate imagery" was an
overbroad reading and is withdrawn — it would have made whole registers
(brand, editorial) impossible to serve.

- SYMPTOM: invented metrics, testimonials, fake product screenshots, charts
  presenting invented data; or synthetic imagery passed off as documentary.
- MECHANISM: generation filling *evidentiary* gaps instead of reporting them.
- DETECT: fake-content lint; every number traceable to source; imagery
  provenance.
- CORRECT: stop and report the gap; design with real material or less
  material (core P5).
- CORRECT — the four legal responses to missing evidentiary content, in the
  order to try them:
  1. **Preserve** what already exists — do not replace real content with
     invented content to make a layout tidier.
  2. **Request or source** the missing material, naming exactly what is
     needed. Saying "I need the real figure" is a valid deliverable.
  3. **Design around the absence** — compose so the missing evidence is not
     required by the layout.
  4. **Use an explicit placeholder** that visibly reads as a placeholder and
     is never presented as a claim.
  Never a realistic-looking substitute. **A placeholder must never silently
  become a factual claim** — the moment it reads as real, it is fabrication,
  whatever it was called when it was written.
- PLACEHOLDER LIFECYCLE: explicit placeholders are **legal during
  exploration and mockup**, and a **blocking defect at ship** (qa.md lint,
  three verdicts). Fabricated evidence is forbidden at every stage.
- STATUS: [HARD BAN — an integrity rule, not an empirical claim; it does not
  need evidence and cannot be outvoted by it] 2026-08. Two studied systems instruct
  otherwise and both are REJECTED here and barred from re-entry: one
  instructs inventing copy when the brief lacks it; another instructs
  "if real data is unavailable, write realistic data". **Realistic-looking
  invented evidence is still fabrication** — the realism is what makes it
  worse, not better. The ban covers metrics, customer counts, testimonials,
  logos, screenshots, product results, case-study outcomes, and business
  facts.

### 10. Register blindness
- SYMPTOM: one visual philosophy applied to every site type; drama on a
  calculator, template SaaS on a brand.
- MECHANISM: rules written unconditionally on axes that reverse by register.
- DETECT: any decision touching a reversal-matrix axis without a declared
  register.
- CORRECT: classify register first (registers.md); condition the rule.
- STATUS: [OBSERVED as a failure mode; the register taxonomy itself is PLAUSIBLE] 2026-08.

### 11. Decoration inflation
- SYMPTOM: flourishes, textures, "unnecessary details" doctrine; ornament
  presented as identity.
- MECHANISM: equating distinctiveness with added decoration.
- DETECT: **function test.** An ornamental or expressive element must carry a
  defensible FUNCTION appropriate to its register. Valid functions include:
  information · hierarchy · interaction affordance · brand meaning ·
  emotional staging · material or subject reference · pacing.
  IF its only justification is "it makes the page look more designed" →
  reject it.
  (The earlier form of this rule read "decoration must carry information",
  which was too narrow: it would have outlawed legitimate brand and editorial
  art direction whose function is emotional staging or subject reference.)
- CORRECT: cut ornament with no defensible function; spend identity budget
  on derived choices.
- STATUS: [REJECTED — policy decision, banned from re-entry] 2026-08.
  Evidence for the underlying failure is [OBSERVED].

### 12. Fan-out theater
- SYMPTOM: "three directions" that differ in hue, theme darkness, or font
  personality only.
- MECHANISM: sampling k neighbors of the same mode; polish masks structural
  sameness.
- DETECT: manifesto diff — anchor + three structural axes must differ
  pairwise (visual-direction.md); pixels are never the diff target.
- CORRECT: regenerate manifestos before rendering.
- STATUS: [OBSERVED as a risk; k, the axis list and the distance rule are PLAUSIBLE] 2026-08.

### 13. Second-order convergence
- SYMPTOM: the anti-generic system's own outputs converge; the house
  vocabulary hardens into the next template.
- MECHANISM: any finite named vocabulary (including this grammar) reshapes
  the distribution toward itself.
- DETECT: project-to-project convergence audit (project-memory.md).
- CORRECT: flagged mechanisms get one forced-avoidance direction in the
  next fan-out; conscious reuse allowed after review.
- STATUS: [OPEN RISK — mechanism designed, untested against ourselves]
  2026-08.

### 13b. Taste-driven convergence
- SYMPTOM: recent projects all solved by the same mechanism, each time
  because "we like it".
- MECHANISM: accumulated preference outranking content and register —
  invisible because it feels like judgment rather than habit.
- DETECT: taste-cluster dominance flag (project-memory.md); precedence
  audit — any decision whose only justification is taste while a higher
  rung had an answer (core P16).
- CORRECT: one forced-alternative direction in the next fan-out; the
  preferred mechanism may still win, consciously. Never banned.
- STATUS: [PLAUSIBLE] 2026-08 — mechanism designed, not yet observed in a
  multi-project ledger.

### 14. Copied scaffolds across projects
- SYMPTOM: new project starts from the previous project's design files;
  "every project looks like the last site I made".
- MECHANISM: reuse of derived identity outside the material it was derived
  from.
- DETECT: cross-project diff of constitutions; convergence audit.
- CORRECT: mechanisms and process transfer; identity re-derives per project.
- STATUS: [OBSERVED] 2026-08 — one independent field report, corroborated by our own reasoning; not tested here.

### 15. Optional render validation
- SYMPTOM: "screenshots if your environment supports it"; design claims
  made from code reading.
- MECHANISM: treating the only ground-truth channel as a nicety.
- DETECT: any completed design task without capture artifacts at declared
  widths.
- CORRECT: render inspection is mandatory (core P11); no exceptions,
  including the motion-settle protocol.
- STATUS: [VALIDATED IN PROJECT] 2026-08 — a real wrong verdict here came from a mis-taken screenshot; [OBSERVED] studied systems left render validation optional.

### 16. Designing pages independently without site rules
- SYMPTOM: each page locally fine; the site incoherent — or the inverse
  correction, every page identical.
- MECHANISM: absence of the three-layer split; decisions unassigned to a
  layer.
- DETECT: constitution diff per page; undeclared-decision scan.
- CORRECT: site-constitution.md layers; exceptions protocol.
- STATUS: [OBSERVED need] 2026-08 — three independent sources agree on
  project language; the layer split is this system's formalization.

---

### Archive

(empty — nothing retired yet; retirements land here with date and reason)

---

<a id="part-9-project-memory"></a>

## Part 9 — Project Memory

*Source module: `project-memory.md`*

Design decisions must outlive the session (core P14). This module defines
what is stored per project, and the cross-project audit that keeps the
methodology from converging on itself (core P15).

Storage shape: one directory per project (e.g. `design-memory/`), plain
files, append-mostly. Records are dated; nothing is silently deleted.

---

### What a project stores

| Record | Content | Written when |
|---|---|---|
| REGISTER DECISION | register + sub-mode + hybrid split, one-line reason, who confirmed | classification stage |
| SITE CONSTITUTION | the three-layer document (site-constitution.md instance) | after first direction selection; amended thereafter |
| PAGE-FAMILY RULES | per-family skeletons, anchor norms, density bands | as families emerge |
| REFERENCE CARDS | full cards per reference-analysis.md | reference stage |
| DIRECTION MANIFESTOS | every manifesto rendered, marked selected / rejected / hybrid-source | fan-out + selection |
| REJECTED DIRECTIONS | kept, with the human's stated reason — rejections are data | selection |
| EXCEPTIONS | the exception records per site-constitution.md | on approval |
| QA FAILURES | machine-QA reds and named critique findings that reached the human, with resolution | QA stages |
| LEARNINGS | real events only: what happened, evidence, what rule changed. Withdrawn conclusions recorded as withdrawals. No ceremonial entries — "nothing learned" writes nothing. Conditional in **every** mode, including the fast path (workflow.md stage 16) | when a trigger fires |
| ANTI-PATTERN EVENTS | each time a named anti-pattern fired in this project | on detection |
| TASTE ITEMS + PROFILE | inspiration items and the regenerated cluster profile (reference-analysis.md) | opportunistically; profile on review |
| COMPOSITION MOVE HISTORY | per shipped page: the moves its plan named | after ship |

The LEARNINGS discipline is load-bearing: entries carry provenance
(commit / PR / screenshot) or they do not enter. [VALIDATED IN PROJECT —
provenance-carrying rules steered production harder than abstract ones here.]

---

### design-memory/STATE.md — the resume pointer

A single small file, distinct from the structured records above. **It is a
resume pointer, not a knowledge dump**; detailed memory stays in its own
artifacts. Its entire responsibility:

```
PROJECT
CURRENT REGISTER              (+ sub-mode, hybrid split)
CURRENT WORKFLOW MODE
CURRENT STAGE                 (workflow.md stage number/name)
LATEST APPROVED DIRECTION     (manifesto id + date)
ACTIVE ARTIFACTS              paths to the constitution, plans, cards in play
DECISIONS SINCE LAST SESSION  append-only, dated one-liners
OPEN ISSUES                   unresolved named findings, blocked questions
NEXT STEP                     the single next action
```

Protocol:
- **At the start of a design session: read STATE.md first**, before any
  methodology module. It says which modules the current mode even needs.
- **At every major decision or stage transition: update STATE.md.**
- DECISIONS SINCE LAST SESSION is append-safe — add, never rewrite history.
- The human must never have to re-explain context that STATE.md already
  holds. IF Claude asks about something recorded there → that is a defect
  in the reading protocol, not a question for the human.

### Project-to-project convergence audit

[PLAUSIBLE — thresholds are working values; the audit has not yet run
against a real multi-project ledger.]

**Ledger:** every shipped page/project appends a structured row:
anchor type · composition moves used · hero structure · font families ·
palette architecture (structure, not hex) · physical metaphor if any ·
motion pattern · signature element class.

**Cadence:** every N projects (default 3) or quarterly, whichever first.

**Flags** (computed over the last N ledger rows):
- same ANCHOR TYPE in > 60% of pages
- same FONT FAMILY PAIRING in ≥ 3 consecutive projects
- same HERO STRUCTURE in ≥ 3 consecutive projects (silhouette metric makes
  this partially computable)
- same PHYSICAL METAPHOR CATEGORY reused
- same SIGNATURE ELEMENT CLASS reused
- same PALETTE ARCHITECTURE in ≥ 3 consecutive projects
- REFERENCE CARD STORE sharing one mechanism list across most cards
- **TASTE CLUSTER DOMINANCE**: one taste cluster's mechanism decides
  directions across most recent projects. Repeated human preference is
  itself a convergence vector — the most invisible one, because it feels
  like judgment rather than habit. Flagging it does **not** ban it.

**Response rule — conscious reuse, not forced novelty:**
IF a flag fires → the next project's fan-out MUST include at least one
direction that avoids the flagged mechanism. The flagged mechanism may
still win — after the human sees the alternative. The audit's job is to
convert unconscious repetition into conscious reuse, never to make projects
weird on principle.

**Audit of the auditor:** the grammar and this audit are themselves subject
to core P15. IF audit flags fire repeatedly on grammar-level moves, the
question escalates from "rotate the direction" to "has the vocabulary
itself become the template" — that is a methodology review, recorded in
LEARNINGS.

---

<a id="part-10-workflow"></a>

## Part 10 — Workflow

*Source module: `workflow.md`*

The executable orchestrator. This is the only module that sequences the
others. Stages run in order; a stage with a met SKIP CONDITION is skipped
*by declaration* ("skipping BASELINE: existing language"), never silently.

The system must scale down: a routine calculator page must not pay a
premium-brand homepage's ceremony. Modes at the end of this file set which
stages run.

---

### Roles (core P17)

Three roles, which may be three passes by one operator or three separate
agents. Scale with impact: high-impact pages get real separation, routine
pages may collapse DIRECTOR and BUILDER but **never** collapse BUILDER and
CRITIC.

- **DESIGN DIRECTOR** — register, direction architecture, composition
  strategy. Coordinates and prepares stages 2–7 and 10.
- **HUMAN** — owns stage 8 (direction selection), ratifies constitutional
  decisions in stage 9, and owns stage 15 (final approval).
- **BUILDER** — owns stage 11 and the implementation side of stage 14.
- **MACHINE** — owns stage 12 assertions.
- **VISUAL CRITIC** — consumes stage 12 results, owns stage 13, and owns the
  critique/verdict side of stage 14. Does not receive the builder's rationale
  as evidence (qa.md B).
- **BOTH** — stage 16 learning, where applicable.

Human decisions are never folded into an agent-role summary: stages 8, 9
(ratification) and 15 belong to a person, and no role above may close them.

[PLAUSIBLE] Strict separate-agent execution; the ergonomics are untested.
[OBSERVED as a need] The generating pass is the worst judge of its own output.

### Session start / state

**IF `design-memory/STATE.md` exists** → read it before any methodology
module. It gives the register, the mode, the stage and the next step, which
determines which modules to load at all.

**IF it does not exist** (greenfield, or a project that has never used this
system) → run BRIEF → initial REGISTER declaration → **initialize STATE.md**
→ continue. Never invent prior project state, and never treat a missing file
as an error.

Update STATE.md at every major decision and every stage transition. Never ask
the human for context STATE.md already holds.

### Stages

#### 1. BRIEF
- INPUT: the request, in whatever form it arrives.
- OUTPUT: the working brief; unknowns listed.
- OWNER: HUMAN provides, CLAUDE restates.
- SKIP: never.
- FAILURE: proceeding on an unstated assumption without declaring it.
- NEXT: 2.

#### 2. REGISTER
- INPUT: brief.
- OUTPUT: declared register + sub-mode + hybrid split (page vs shell), with
  one-line reason (registers.md three-question procedure).
- OWNER: CLAUDE declares, HUMAN may veto (this is the cheapest veto in the
  whole system — [OPEN RISK: misclassification cascades through everything
  downstream; the declaration line exists so the human can catch it early]).
- SKIP: never. In an existing project with a recorded register: one
  confirmation line.
- FAILURE: silent classification; interrogating the user when the brief
  suffices.
- NEXT: 3.

#### 3. REAL MATERIAL / CONTENT INVENTORY
- INPUT: repo, data, copy, assets, product access.
- OUTPUT: inventory + candidate anchors ("the most characteristic real
  thing this page owns"); gaps named. May revise stage 2 (short loop back).
- OWNER: CLAUDE.
- SKIP: never — it is cheap and everything downstream stands on it (core
  P5).
- FAILURE: empty inventory answered with fabrication instead of "material
  missing, here is what I need".
- NEXT: 4 (or 5/9 per mode).

#### 4. BASELINE (optional)
- INPUT: brief + register.
- OUTPUT: negative exhibit + extracted modal combination (banned in
  manifestos) + verbatim human reactions.
- OWNER: CLAUDE renders, HUMAN reacts.
- SKIP: existing language + existing page family; OR convention-dominant
  register (UTILITY, COMMERCE transaction surfaces) — the mode is roughly
  correct there, nothing to escape. (visual-direction.md) [PLAUSIBLE]
- FAILURE: baseline leaking into implementation; baseline presented as a
  candidate.
- NEXT: 5.

#### 5. REFERENCE ANALYSIS (optional)
- INPUT: admired references (human-picked) + register.
- OUTPUT: Reference Cards (reference-analysis.md).
- OWNER: BOTH — human selects references, Claude dissects.
- SKIP: project language + sufficient card store already exist.
- FAILURE: surface import; cards without transfer conditions.
- NEXT: 6.

#### 6. DIRECTION MANIFESTOS (optional)
- INPUT: register, inventory, cards, constitution (if any), banned modal
  combination (if baseline ran).
- OUTPUT: k manifestos, mechanically diffed for structural divergence
  (visual-direction.md).
- OWNER: CLAUDE.
- SKIP: routine page inside an existing family (family skeleton already
  answers the structural questions).
- FAILURE: fan-out theater — manifestos matching on anchor+hierarchy+
  density; caught by the diff, regenerate before rendering.
- NEXT: 7.

#### 7. FAN-OUT RENDER (optional)
- INPUT: manifestos.
- OUTPUT: k static, routeless mocks with manifesto summaries attached.
- OWNER: CLAUDE.
- SKIP: with 6.
- FAILURE: production-grade builds at exploration stage; polish masking
  structure.
- NEXT: 8.

#### 8. HUMAN SELECTION
- INPUT: renders + manifesto summaries (structure visible beside pixels).
- OUTPUT: SELECT / REJECT ALL / HYBRID (+ notes). Total rejection = the
  direction space was wrong → back to 6 with new axes, not refinement.
- OWNER: HUMAN. [VALIDATED IN PROJECT — the checkpoint that paid for itself, including via an informative total rejection.]
- SKIP: only when 6–7 were skipped.
- FAILURE: treating rejection as indecision; selecting on polish (mitigated
  by manifesto-beside-render presentation).
- NEXT: 9.

#### 9. PROJECT LANGUAGE / CONSTITUTION UPDATE
- INPUT: selected manifesto (greenfield) or existing constitution.
- OUTPUT: first constitution instance, or an amendment, or "no change" —
  written to project memory.
- OWNER: BOTH — Claude drafts, human ratifies.
- SKIP: routine page with zero constitutional impact ("no change" is still
  one recorded line).
- FAILURE: producing a style guide without generative rules; amending
  silently.
- NEXT: 10.

#### 10. COMPOSITION PLAN
- INPUT: page content inventory + constitution + family rules.
- OUTPUT: an **explicit composition plan** (required, core P12a), naming its
  moves per section. The grammar vocabulary is the **default method** and
  each named move is labelled KNOWN / PROJECT-SPECIFIC / CANDIDATE
  (composition-grammar.md); a move outside the vocabulary is named and
  described, not rejected. No ASCII wireframes.
- OWNER: CLAUDE.
- SKIP: never — the cheapest insurance in the system (core P12a).
- FAILURE: plans that cannot cite moves (uncomposed pages headed to code);
  the dead-canvas class is caught HERE or expensively later.
- NEXT: 11.

#### 11. IMPLEMENTATION
- INPUT: plan + constitution.
- OUTPUT: built page; every visual value traceable (core P7).
- OWNER: CLAUDE.
- SKIP: never (when the task is a page).
- FAILURE: plan-build drift; undeclared decisions.
- NEXT: 12.

#### 12. MACHINE QA
- INPUT: built page at declared widths.
- OUTPUT: battery report (qa.md A). Red = hard stop back to 11.
- OWNER: MACHINE.
- SKIP: never.
- FAILURE: proceeding on red; trusting a metric that failed ground truth
  (retire it instead).
- NEXT: 13.

#### 13. VISUAL CRITIQUE
- INPUT: settled-motion captures at declared widths (qa.md B protocol).
- OUTPUT: named findings, each citing a failure mode and location; or a
  which-modes-were-checked statement when clean.
- OWNER: CLAUDE.
- SKIP: never.
- FAILURE: rubber stamp ("looks good"); unnamed findings ("bland");
  mid-animation captures.
- NEXT: 14 if findings, else 15.

#### 14. REFINEMENT
- INPUT: findings.
- OUTPUT: fixes + re-captures; loop 12→13 until exit criteria (qa.md).
- OWNER: CLAUDE.
- SKIP: no findings.
- FAILURE: endless loop (each pass must close named findings, not reopen
  taste); premature exit with open findings.
- NEXT: 15.

#### 15. HUMAN APPROVAL
- INPUT: the page + QA record + declared exceptions.
- OUTPUT: recorded approval, or redirection (back to the right stage).
- OWNER: HUMAN.
- SKIP: never for shipped pages.
- FAILURE: approval assumed from silence.
- NEXT: 16.

#### 16. DOCUMENT LEARNING (conditional in **every** mode)
- INPUT: everything that actually happened.
- OUTPUT: LEARNINGS / EXCEPTIONS / ledger rows in project memory — real
  events only.
- OWNER: BOTH.
- RUN IT only if at least one of these occurred: a new failure mode appeared ·
  a detector was contradicted · an exception was approved · a rule changed ·
  a meaningful human preference was learned · a conclusion was withdrawn.
- SKIP: otherwise — and write nothing at all. The fast path avoids ceremony,
  **not** real learning: a fast-path task that contradicts a detector still
  records it.
- FAILURE: ceremonial entries; unrecorded withdrawals.
- NEXT: done.

---

### Build-with / check-with pairing

Constructive and adversarial passes are paired, and the check is matched to
the thing built. **Do not create review ceremony where the risk is trivial.**

| Built | Checked with |
|---|---|
| Visual direction | Convergence audit (project-memory.md) + manifesto divergence diff |
| Composition plan | Composition grammar conditions + named failure modes |
| UI implementation | Machine QA battery (qa.md A) |
| Motion | Reduced-motion + motion-sensitivity behavior |
| Responsive design | Mobile RE-composition, not reflow |
| Interactive screen | State completeness (qa.md B3) |
| Final page | Independent visual critique (qa.md B, critic role) |

IF a check does not match what was built → it is ceremony; drop it. IF a
built thing has no matching check → that is a gap; name it rather than
passing silently.

### Modes

| Mode | Runs | Skips | When |
|---|---|---|---|
| **GREENFIELD** | all 16 | — (4 still register-gated) | no design language exists |
| **EXISTING DESIGN LANGUAGE** | 1–3, 9(consult), 10–16 | 4; 5–8 unless a NEW page family is being created | project constitution exists |
| **ROUTINE PAGE** | 1–3, 10–13(+14 if findings), 15, **16 if triggered** | 4–9 | known family, known register, no constitutional impact |
| **UTILITY / COMMERCE FAST PATH** | 1–3, 10–12, light 13, 15, **16 if triggered** | 4–9; visual exploration minimal by register (distinctiveness budget ≈ 0) | convention-dominant registers |

Scale-down rule: IF a task qualifies for a lighter mode → use it and say
so. Ceremony beyond the mode is cost, not rigor. IF mid-task the work
outgrows its mode (a "routine" page turns out to need a new family) →
declare the mode change and enter the missing stages; do not smuggle
discovery into implementation.

### Module loading (lean by mode)

The ten modules are a knowledge base, not a preamble. Load only what the
mode needs; routine work must stay cheap.

| Mode | Loads |
|---|---|
| UTILITY / COMMERCE FAST PATH | core-principles · registers · composition-grammar · qa · STATE.md |
| ROUTINE PAGE | + site-constitution (family rules), anti-patterns |
| EXISTING DESIGN LANGUAGE | + project-memory, visual-direction (only when creating a new page family) |
| GREENFIELD / PREMIUM BRAND | potentially all ten |

Taste memory and fan-out analysis are **not** loaded on the fast path
unless a tie genuinely needs breaking. The eventual executable skill is a
thin orchestrator over these modules — it decides mode, reads STATE.md,
loads the mode's set, and nothing more.
