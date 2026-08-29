# AI-Assisted Web Design Methodology

*Consolidated single-file edition — generated 2026-08-29 from the ten
modules in `design-methodology/`. Those files remain the editable source of
truth; this document is the portable read-through.*

**Purpose.** Produce context-appropriate, coherent, high-quality web design
decisions across different website types while reducing generic AI
convergence, stylistic overreach, composition failure, fabrication, and
uncontrolled inconsistency.

**Optimization order:** appropriateness → clarity → composition → identity →
craft. Novelty is never the objective.

**How to read the evidence tags.** `[PROVEN]` = supported strongly enough to
be a default rule. `[PLAUSIBLE]` = included but an assumption awaiting
validation — never present these as findings. `[OPEN RISK]` = a known way
this system can fail, carrying its mitigation. Rejected ideas appear only in
Part 8 so they cannot re-enter under new wording.

**Provenance.** Assembled from five research steps: a study of Anthropic's
frontend-design guidance across two generations, two community workflows, a
forensic audit of a third-party skill repository, and controlled measurement
against a real codebase where the same page exists in a known-bad and a
known-good state.

---

## Contents

1. [Core Principles](#part-1-core-principles) — The constitution: durable behavioral mechanisms, aesthetic-neutral.
2. [Registers](#part-2-registers) — The switch that decides which rules apply and which reverse.
3. [Reference Analysis & Taste Memory](#part-3-reference-analysis-taste-memory) — How references are dissected, and how preference is stored without becoming law.
4. [Composition Grammar v1](#part-4-composition-grammar-v1) — The 13 named moves — a vocabulary, not a template library.
5. [Visual Direction](#part-5-visual-direction) — Baseline elicitation, direction manifestos, structural fan-out, human selection.
6. [Site Constitution](#part-6-site-constitution) — Three rule layers, the exception protocol, and promotion.
7. [QA — Three-Layer Validation](#part-7-qa-three-layer-validation) — Machine, critique, human; finding classes, iteration scope, exit criteria.
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
shifts; high-altitude rules resolve to the model's modal output. [PROVEN —
observed across Anthropic's skill generations and our own rules.]
**PREVENTS:** brittle prescriptions; vibes-driven regressions to the mode.

### P2 — Behavioral mechanism over aesthetic prescription
**RULE:** Encode quality as mechanisms (schemas, budgets, tests, rituals,
ledgers), not as aesthetic recipes. Aesthetic content may exist only inside
register-conditioned modules or project constitutions, never in core rules.
**WHY:** [PROVEN] Aesthetic prescriptions staled within one generation twice:
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
be able to express the decisions that matter. [PROVEN — named failure modes
outperformed generic warnings in production use.]
**PREVENTS:** unfalsifiable plans; critique that cannot cite anything.

### P7 — Traceability
**RULE:** Every implemented visual value traces to a written source: the
constitution, a page-family rule, a direction manifesto, or a composition
plan. IF a value has no source → it is an undeclared decision; declare it
or remove it.
**WHY:** Traceability is what makes plan-vs-build diffs possible, and those
diffs are a QA layer.
**PREVENTS:** drift between what was decided and what shipped.

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
**WHY:** [PROVEN] Countable constraints are the most reliably obeyed rule
form observed across all studied systems and our own production.
**PREVENTS:** emphasis inflation — the second bold thing killing the first.

### P10 — Human checkpoints before production
**RULE:** A human selects, rejects, or redirects before production
implementation whenever direction is open (see visual-direction.md and
workflow.md for placement and skip conditions). Total rejection of all
directions is valid output: it means the direction space was wrong.
**WHY:** [PROVEN] The human is the taste engine; autonomous end-to-end
pipelines were rejected by the research. Cheap rejection before production
beat expensive refinement after it in every observed case.
**PREVENTS:** polishing the wrong direction; taste laundering.

### P11 — Render is ground truth
**RULE:** No claim about a design is valid until the rendered output was
inspected — at the required widths, with motion settled (trigger all
reveals, return to top, wait, then capture). A conclusion drawn from a
mid-animation screenshot is a conclusion about scroll timing, not the page.
**WHY:** [PROVEN] A confident wrong verdict in this project traced directly
to un-settled animations; the correction is procedural, not attitudinal.
A corollary: the builder's rationale is not evidence that the result works.
Reasons explain intent; only the render shows outcome. A critic who accepts
"here is why I did it" as proof has stopped being a critic.
**PREVENTS:** rubber-stamp critique; false defects; false passes.

### P12 — Composition is a first-class discipline
**RULE:** Every page gets a written composition plan in grammar vocabulary
(composition-grammar.md) before implementation. Composition failures are
named defects with detectors, not matters of taste.
**WHY:** [PROVEN] Composition was the largest absent layer in every studied
system, and the costliest real failure in this project (a page passed every
typographic rule and failed as a page). One composition defect class is
already machine-detectable.
**PREVENTS:** dead canvas; padding-as-composition; document-poured-into-web.

### P13 — Site law and page freedom are separate layers
**RULE:** Maintain three layers (site constitution / page-family rules /
page freedom, see site-constitution.md). An undeclared violation of a
higher layer is a defect regardless of how good the page looks.
**WHY:** Pages designed independently drift into many sites; pages designed
identically collapse into one template. The layer split is the only
mechanism that holds both failure modes off simultaneously.
**PREVENTS:** 40 pages = 40 websites; 40 pages = 1 template.

### P14 — Provenance and the learning lifecycle
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

    CONTENT / USER JOB
    → REGISTER
    → CLIENT / PROJECT BRAND
    → SITE CONSTITUTION
    → PROJECT-SPECIFIC DESIGN LANGUAGE
    → TASTE MEMORY
    → MODEL DEFAULTS

A lower rung may only decide what a higher rung leaves open. **Taste never
produces a design decision on its own; it breaks ties.** IF a decision's
only justification is taste while a higher rung has an answer → the
decision is invalid, regardless of how much the human likes it.
**WHY:** Accumulated preference is real signal, but it is the second-weakest
input in the system — it describes what has pleased before, not what this
content and this visitor need now. Without an explicit ladder, taste
silently outranks register (this is exactly how a house style becomes a
template applied to every brief).
**PREVENTS:** taste-as-style-generator; register override by preference;
the model's defaults masquerading as decisions.

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
| Aesthetic risk budget | Low-to-medium; one signature element |
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
| Aesthetic risk budget | Medium-high, if derived |
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
| Motion budget | Highest; easing quality becomes a QA subject |
| Interaction priority | Atmospheric exploration; the purchase path itself stays conventional |
| Trust requirement | Flawless execution — one cheap detail breaks the illusion |
| Aesthetic risk budget | Highest; **one real risk is expected, not optional** |
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
the page obeys utility rules, the shell obeys marketing rules. [PROVEN in
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
ONE THING NOT TO TAKE  the reference's most characteristic feature that is
                    toxic to this project — named, singular, mandatory
MEASURED EVIDENCE   numbers, not impressions: measures in px/ch, column
                    counts, section heights, screenshots attached
PROVENANCE          who dissected it, when, from what material
REVIEW / EXPIRY     date to re-examine; references stale like rules do
```

Field rules:
- MECHANISMS with no WHERE → delete the entry; unlocated mechanisms are
  guesses.
- ONE THING NOT TO TAKE is mandatory. Every admired reference has a
  signature that would poison the importing project; naming it is the
  card's immune system.
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
lived. [PROVEN as a need; individual moves evidenced; the pairing/conflict
table is inference — PLAUSIBLE.]

**RULE: A page's composition plan names its moves before implementation**
(workflow.md, COMPOSITION PLAN stage). A plan that cannot be written in
this vocabulary is describing a page that has not been composed.

**RULE: Do not plan in ASCII wireframes.** Planning notation constrains the
design space to what the notation can draw; ASCII cannot draw bleed,
overlap, or density, so plans made in it converge to stacked bands.
[PROVEN mechanism, observed across studied systems.] Plan in descriptive
sentences using move names, e.g.: "Hero: full-width anchor (the live
library browser) with bottom bleed; then statement+witness on shifted
ground; index-as-texture for the catalog; one interruption plate for the
single takeaway; density gradient toward the tool."

Move evidence baseline: every move below exists in at least one real,
inspected page (positive or counter-example). No move was invented to
complete the taxonomy.

---

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
- CHECK: anchor bbox ≥ 90% of its container (register-adjusted).

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
- CHECK: element bbox crosses the section clip boundary.

#### 3. Background shift
- PURPOSE: build the seam between sections out of change, not padding.
- INPUT: adjacent sections.
- REGISTER: universal.
- PAIRS: everything.
- CONFLICTS: none.
- OVERUSE: mechanical zebra (alternating every seam regardless of content
  grouping) → the shift stops meaning anything.
- CHECK: **[PROVEN] padding-only seam detector** — adjacent sections with
  >220px combined seam space and identical background = defect. Validated
  3/0/0 against known-bad/known-good/positive-control pages.

#### 4. Measure narrowing
- PURPOSE: mark a register change (prose ↔ working surface) with width.
- INPUT: a genuine content-mode transition.
- REGISTER: universal; law on Editorial/Utility-reading.
- PAIRS: rail+body (5), statement+witness (6).
- CONFLICTS: full-width anchor (1) in the same block.
- OVERUSE: measure zigzag → the page feels unstable.
- CHECK: measured line length in ch within declared bounds per block type.

#### 5. Rail + body
- PURPOSE: separate meta from content; make lists scannable.
- INPUT: real meta (ids, labels, counts) — not invented annotations.
- REGISTER: Utility/Editorial/Portfolio strong; others neutral.
- PAIRS: measure narrowing (4), index-as-texture (7).
- CONFLICTS: statement+witness (6) in the same band (two competing splits).
- OVERUSE: everything railed → the rail stops signifying meta.
- CHECK: rail column ≤ 25% width; rail content in the label register.

#### 6. Statement + witness
- PURPOSE: give a claim its evidence in the same visual field.
- INPUT: a real witness (figure, data, prose that answers the claim). A
  statement without a witness at wide measure IS the dead-canvas failure.
- REGISTER: Marketing/Portfolio/Brand.
- PAIRS: full-width anchor (1), spec plate (11).
- CONFLICTS: rail+body (5) same band.
- OVERUSE: every heading twinned → formula.
- CHECK: dead-canvas geometry v2 [PLAUSIBLE — v1 failed to separate; v2
  (content right-edge percentile vs container) awaits validation].

#### 7. Index as texture
- PURPOSE: let genuine multitude be both content and visual field.
- INPUT: ≥ ~10 real, linked items.
- REGISTER: Utility/Commerce/Portfolio. **Reverses in Brand** (scarcity).
- PAIRS: rail+body (5), repetition+break (9).
- CONFLICTS: the sparse end of density gradient (12).
- OVERUSE: wall — unscannable.
- CHECK: item count + fraction of real hrefs (no dead/placeholder items).

#### 8. Interruption plate
- PURPOSE: stop the reader once, for the single thing worth stopping for.
- INPUT: a page that truly has ONE takeaway.
- REGISTER: universal, budgeted: Editorial (pull-quote tradition),
  Marketing 1, Utility 0–1.
- PAIRS: background shift (3).
- CONFLICTS: bleed (2); a second plate.
- OVERUSE: the second plate destroys the first. [PROVEN in production use.]
- CHECK: high-contrast plate count ≤ 1 per page.

#### 9. Repetition + break
- PURPOSE: regularity builds trust; the single break carries information.
- INPUT: a real series + a genuinely deviant member.
- REGISTER: universal; native to Commerce (badges).
- PAIRS: index-as-texture (7), window-card (10).
- CONFLICTS: none.
- OVERUSE: multiple breaks → the pattern collapses.
- CHECK: exactly one style-deviant child in the repeated grid.

#### 10. Window-card
- PURPOSE: a border earned by structured content behind it.
- INPUT: the card holds more than one content type (figure + label + meta).
  A single label in a box is a fence, not a card. [PROVEN counter-example
  in production: 19 one-name boxes, rejected; and a working bento whose
  every cell holds a real logo + tag + count.]
- REGISTER: Marketing, Utility dashboards.
- PAIRS: repetition+break (9), index-as-texture (7).
- CONFLICTS: boxing open prose (see anti-patterns: card-everything).
- OVERUSE: dashboard disease.
- CHECK: content-node diversity per card > 1.

#### 11. Colophon / spec plate
- PURPOSE: present facts as a record (label–value rows).
- INPUT: real, current values, traceable to source.
- REGISTER: Portfolio/Utility/Marketing.
- PAIRS: statement+witness (6), rail+body (5).
- CONFLICTS: none.
- OVERUSE: every list bureaucratized into a plate.
- CHECK: fabrication lint — every value derivable from repo/source.

#### 12. Density gradient
- PURPOSE: open airy, densify toward the working material (direction
  reverses per register: Brand may stay sparse throughout).
- INPUT: the page has a working surface.
- REGISTER: universal, direction register-set.
- PAIRS: full-width anchor (1), bleed (2), index-as-texture (7).
- CONFLICTS: none.
- OVERUSE: inverse gradient (dense → empty) deflates the page.
- CHECK: sign of the band-occupancy slope across the page.

#### 13. Persistent rail
- PURPOSE: keep context available across a long scroll (TOC, facets,
  summary).
- INPUT: long body + context that is needed continuously.
- REGISTER: Utility-reading/Editorial-longform; unnecessary in Marketing.
- PAIRS: rail+body (5), index-as-texture (7).
- CONFLICTS: bleed (2) — sticky + bleed produces chaos.
- OVERUSE: multiple sticky columns → a page that shudders.
- CHECK: sticky element's viewport share ≤ 30%.

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

**WHAT TO EXTRACT** (then discard the artifact):
1. The modal anchor + composition → **banned combination** in the fan-out
   manifestos that follow.
2. The human's reactions, verbatim → the negative brief.
3. Nothing else. No code survives. The baseline is static, routeless,
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
DISTINCTIVENESS BUDGET where the one risk is spent (or "none", stated)
```

Structural axes: ANCHOR TYPE, INFORMATION HIERARCHY, DENSITY, SECTION
RHYTHM, PAGE SILHOUETTE INTENT.
Surface axes (declared but **never counted as divergence**): color family,
dark/light, font personality, motion flavor.

### Fan-out

- **k = 3 by default.** Two directions under-sample the space; four dilute
  the selection and the budget. [PROVEN utility of structural fan-out at
  k=3 in one real experiment; the exact k is PLAUSIBLE.]
- **Hard condition: every PAIR of directions differs in ANCHOR TYPE and in
  at least three structural axes.**
- IF two manifestos match on anchor + hierarchy + density → regenerate
  before rendering. This is a mechanical diff on the manifestos, and it is
  what prevents fan-out theater ("Direction A = blue, B = green, C = dark
  mode").
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
  a rejected one. [PROVEN: a full 3-direction rejection redirected a real
  project for the cost of three static mocks.]
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

Runs on the built page, headless, at the declared widths. Hard gate: red
here blocks everything downstream.

| Check | What it asserts | Status |
|---|---|---|
| Overflow | `scrollWidth − clientWidth = 0` at every declared width | standard |
| Padding-only seams | no adjacent-section seam with >220px combined space AND identical background | **[PROVEN — validated 3/0/0 on known-bad / known-good / positive-control pages]** |
| Dead-canvas geometry | content right-edge percentile vs container width per band; flags statement-without-witness zones | **[PLAUSIBLE — v1 failed to separate; v2 geometry awaits validation]** |
| Contrast | WCAG ratios on text/ground pairs | standard |
| Focus states | focus-visible present on interactive elements | standard |
| Text measure | line length in ch within the block type's declared bounds | standard |
| Interruption budget | high-contrast plate count ≤ 1 per page | from grammar |
| Placeholder / fake-content lint | no lorem, TODO assets, placeholder strings; numbers traceable to source | from core P5 |
| Reduced motion | `prefers-reduced-motion` respected | standard |
| Absence / density metrics | band-occupancy profile, absence ratio, silhouette variance — reported as signals, thresholds advisory | [PLAUSIBLE] |

Do not pretend all visual quality automates. The battery catches defect
*classes* with geometric signatures; everything else belongs below. When a
metric fails to separate a known-bad from a known-good case, fix or retire
the metric — a wrong detector is worse than none. [This happened once: the
first dead-canvas metric was retired on ground-truth evidence.]

### B. VISUAL CRITIQUE

**Role separation (core P17).** On high-impact pages the critic is a
separate pass from the builder, and the builder's rationale is not admitted
as evidence. The critic reads renders, not reasons. A critique that cites
"the plan says this is the anchor" instead of what the capture shows is
defective. [Strict separate-agent execution PLAUSIBLE; pass separation is
the default.]

Claude inspects **rendered screenshots** — never the code alone, never a
description of the code.

**Capture protocol [PROVEN — a real wrong verdict created this rule]:**
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

The builder may not regenerate anything outside CHANGE. IF a fix appears to
require touching a PROTECT region → stop and renegotiate the scope; do not
silently widen it. After the pass, re-capture and verify that PROTECT
regions are visually unchanged (diff the captures where possible).

### B3. STATE COMPLETENESS

Register- and component-conditional (registers.md). Required wherever the
surface is interactive — UTILITY-interactive, COMMERCE, product application
UI — and for any interactive component elsewhere. **Not** required of static
marketing sections; demanding it there is ceremony.

Where it applies, every interactive surface/component is designed and
verified in each relevant state:

DEFAULT · LOADING · POPULATED · EMPTY · ERROR · DISABLED · FIRST-TIME ·
OVERFLOW (long values, long lists, long text) · HOVER · FOCUS ·
ACTIVE/PRESSED · RESPONSIVE-SCROLL behavior

Rules: a state that cannot occur is marked N/A with the reason (silence is
not coverage); EMPTY and ERROR are designed, not defaulted; FOCUS is never
merely "not removed". **State completeness is part of the definition of
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
6. **Human approval exists** and is recorded in project memory.

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
- STATUS: [PROVEN] 2026-08 — root phenomenon of the whole research arc.

### 2. Token-level anti-generic rules
- SYMPTOM: rules like "avoid font X", "never color Y".
- MECHANISM: banning tokens shifts the distribution to adjacent tokens; the
  replacements become the next recognizable default (observed twice across
  skill generations).
- DETECT: any rule that names a font/color/radius outside a project
  constitution.
- CORRECT: rewrite at mechanism level ("decoration must carry information"),
  or move into a register-conditioned or project-scoped rule.
- STATUS: [PROVEN — REJECTED idea, banned from re-entry] 2026-08.

**Rewrite table** — the form every candidate ban must take before entering
this file. Left column = rejected shapes seen in studied systems.

| Rejected (token-level) | Accepted (mechanism-level) |
|---|---|
| "Do not use Inter." | "Reject typography chosen only because it is the model's default; neutral typography stays valid when the register calls for it." |
| "Purple gradients are banned." | "Reject decoration that carries no information." |
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
- STATUS: [PROVEN] 2026-08 — field case: an anti-generic workflow landed
  inside the exact named default it fled.

### 4. Dead canvas
- SYMPTOM: wide viewport, single left column, right half empty across
  consecutive sections; a document poured into a website.
- MECHANISM: composing prose instead of composing a page; no anchor
  inventory before layout.
- DETECT: dead-canvas geometry [PLAUSIBLE v2]; eye check against full-page
  captures.
- CORRECT: statement+witness or narrow the measure so emptiness reads as
  margin (grammar moves 6, 4).
- STATUS: [PROVEN] 2026-08 — shipped, diagnosed from render, fixed;
  provenance in the reference project (commit a9178b2).

### 5. Padding as composition
- SYMPTOM: 300–600px voids between sections; separation exists only because
  things stopped touching.
- MECHANISM: padding used where a change (ground, measure, columns) should
  do the work.
- DETECT: **padding-only seam detector [PROVEN, 3/0/0].**
- CORRECT: background shift or another seam change (grammar move 3).
- STATUS: [PROVEN] 2026-08, same provenance.

### 6. Border without structural reason
- SYMPTOM: boxes around single labels; fences around words.
- MECHANISM: card as default container instead of earned frame.
- DETECT: content-node diversity per card ≤ 1.
- CORRECT: lists, rows, rails for labels; keep borders for structured
  content (grammar move 10).
- STATUS: [PROVEN] 2026-08 — 19-one-name-boxes case, rejected in review.

### 7. Card-everything
- SYMPTOM: open prose boxed; the reference page reads as a dashboard.
- MECHANISM: uniform containerization as a substitute for hierarchy.
- DETECT: boxed-prose scan; card density per page.
- CORRECT: prose sits open; one edge for the interface, one tint for
  evidence, one plate for the takeaway.
- STATUS: [PROVEN] 2026-08 — production rule predating the methodology.

### 8. Screenshot optimization
- SYMPTOM: quality that exists only in the hero viewport; the rest of the
  scroll is unmade.
- MECHANISM: evaluation biased to what a single capture shows; guidance
  systems trained on screenshot diffs inherit it.
- DETECT: full-height captures mandatory; absence metrics over the whole
  page.
- CORRECT: full-page silhouette in the plan; QA reads the entire scroll.
- STATUS: [PROVEN] 2026-08 — structural bias identified in studied systems.

### 9. Fabricated content and data
- SYMPTOM: invented copy, numbers, testimonials, screenshots, chart images.
- MECHANISM: generation filling material gaps instead of reporting them.
- DETECT: fake-content lint; every number traceable to source; imagery
  provenance.
- CORRECT: stop and report the gap; design with real material or less
  material (core P5).
- CORRECT (expanded): IF content is missing → use an EXPLICIT PLACEHOLDER
  that reads as a placeholder, OR compose so the missing evidence is not
  required. Never a realistic-looking substitute.
- STATUS: [PROVEN — hard ban] 2026-08. Two studied systems instruct
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
- STATUS: [PROVEN as failure; taxonomy PLAUSIBLE] 2026-08.

### 11. Decoration inflation
- SYMPTOM: flourishes, textures, "unnecessary details" doctrine; ornament
  presented as identity.
- MECHANISM: equating distinctiveness with added decoration.
- DETECT: structure-is-information test — each ornament either encodes
  something true or is a defect; excess-decoration check in visual critique.
- CORRECT: cut ornament that carries no information; spend identity budget
  on derived choices.
- STATUS: [PROVEN — REJECTED doctrine, banned from re-entry] 2026-08.

### 12. Fan-out theater
- SYMPTOM: "three directions" that differ in hue, theme darkness, or font
  personality only.
- MECHANISM: sampling k neighbors of the same mode; polish masks structural
  sameness.
- DETECT: manifesto diff — anchor + three structural axes must differ
  pairwise (visual-direction.md); pixels are never the diff target.
- CORRECT: regenerate manifestos before rendering.
- STATUS: [PROVEN as risk; k and axes PLAUSIBLE] 2026-08.

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
- STATUS: [PROVEN] 2026-08 — independent field report, corroborated.

### 15. Optional render validation
- SYMPTOM: "screenshots if your environment supports it"; design claims
  made from code reading.
- MECHANISM: treating the only ground-truth channel as a nicety.
- DETECT: any completed design task without capture artifacts at declared
  widths.
- CORRECT: render inspection is mandatory (core P11); no exceptions,
  including the motion-settle protocol.
- STATUS: [PROVEN] 2026-08 — both by studied systems' failure to require it
  and by a real wrong verdict from a mis-taken screenshot.

### 16. Designing pages independently without site rules
- SYMPTOM: each page locally fine; the site incoherent — or the inverse
  correction, every page identical.
- MECHANISM: absence of the three-layer split; decisions unassigned to a
  layer.
- DETECT: constitution diff per page; undeclared-decision scan.
- CORRECT: site-constitution.md layers; exceptions protocol.
- STATUS: [PROVEN need] 2026-08 — three independent sources agree on
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
| LEARNINGS | real events only: what happened, evidence, what rule changed. Withdrawn conclusions recorded as withdrawals. No ceremonial entries — "nothing learned" is a legitimate outcome and writes nothing | document-learning stage |
| ANTI-PATTERN EVENTS | each time a named anti-pattern fired in this project | on detection |
| TASTE ITEMS + PROFILE | inspiration items and the regenerated cluster profile (reference-analysis.md) | opportunistically; profile on review |
| COMPOSITION MOVE HISTORY | per shipped page: the moves its plan named | after ship |

The LEARNINGS discipline is load-bearing: entries carry provenance
(commit / PR / screenshot) or they do not enter. [PROVEN — provenance-
carrying rules steered production harder than principles.]

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
  strategy. Owns stages 2–10.
- **BUILDER** — implements the approved plan, within declared scope. Owns
  stage 11 and the fix half of 14.
- **VISUAL CRITIC** — judges the render. Does not receive the builder's
  rationale as evidence (qa.md B). Owns stages 12–13 and the verdict half
  of 14.

[PLAUSIBLE] Strict separate-agent execution; the ergonomics are untested.
[PROVEN as a need] The generating pass is the worst judge of its own output.

### Session start / state

**Before anything else in a design session: read `design-memory/STATE.md`**
(project-memory.md). It gives the register, the mode, the stage, and the
next step — which determines which modules to load at all. Update it at
every major decision and every stage transition. Never ask the human for
context STATE.md already holds.

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
- OWNER: HUMAN. [PROVEN — the checkpoint that repeatedly paid for itself.]
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
- OUTPUT: descriptive plan naming grammar moves per section (composition-
  grammar.md). No ASCII wireframes.
- OWNER: CLAUDE.
- SKIP: never — the cheapest insurance in the system (core P12).
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

#### 16. DOCUMENT LEARNING
- INPUT: everything that actually happened.
- OUTPUT: LEARNINGS / EXCEPTIONS / ledger rows in project memory — real
  events only; "nothing learned" writes nothing.
- OWNER: BOTH.
- SKIP: when nothing occurred worth recording (legitimate).
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
| **ROUTINE PAGE** | 1–3, 10–13(+14 if findings), 15, 16(usually empty) | 4–9 | known family, known register, no constitutional impact |
| **UTILITY / COMMERCE FAST PATH** | 1–3, 10–12, light 13, 15 | 4–9; visual exploration minimal by register (distinctiveness budget ≈ 0) | convention-dominant registers |

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
