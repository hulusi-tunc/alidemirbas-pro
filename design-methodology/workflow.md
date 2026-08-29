# Workflow

The executable orchestrator. This is the only module that sequences the
others. Stages run in order; a stage with a met SKIP CONDITION is skipped
*by declaration* ("skipping BASELINE: existing language"), never silently.

The system must scale down: a routine calculator page must not pay a
premium-brand homepage's ceremony. Modes at the end of this file set which
stages run.

---

## Roles (core P17)

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

## Session start / state

**IF `design-memory/STATE.md` exists** → read it before any methodology
module. It gives the register, the mode, the stage and the next step, which
determines which modules to load at all.

**IF it does not exist** (greenfield, or a project that has never used this
system) → run BRIEF → initial REGISTER declaration → **initialize STATE.md**
→ continue. Never invent prior project state, and never treat a missing file
as an error.

Update STATE.md at every major decision and every stage transition. Never ask
the human for context STATE.md already holds.

## Stages

### 1. BRIEF
- INPUT: the request, in whatever form it arrives.
- OUTPUT: the working brief; unknowns listed.
- OWNER: HUMAN provides, CLAUDE restates.
- SKIP: never.
- FAILURE: proceeding on an unstated assumption without declaring it.
- NEXT: 2.

### 2. REGISTER
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

### 3. REAL MATERIAL / CONTENT INVENTORY
- INPUT: repo, data, copy, assets, product access.
- OUTPUT: inventory + candidate anchors ("the most characteristic real
  thing this page owns"); gaps named. May revise stage 2 (short loop back).
- OWNER: CLAUDE.
- SKIP: never — it is cheap and everything downstream stands on it (core
  P5).
- FAILURE: empty inventory answered with fabrication instead of "material
  missing, here is what I need".
- NEXT: 4 (or 5/9 per mode).

### 4. BASELINE (optional)
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

### 5. REFERENCE ANALYSIS (optional)
- INPUT: admired references (human-picked) + register.
- OUTPUT: Reference Cards (reference-analysis.md).
- OWNER: BOTH — human selects references, Claude dissects.
- SKIP: project language + sufficient card store already exist.
- FAILURE: surface import; cards without transfer conditions.
- NEXT: 6.

### 6. DIRECTION MANIFESTOS (optional)
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

### 7. FAN-OUT RENDER (optional)
- INPUT: manifestos.
- OUTPUT: k static, routeless mocks with manifesto summaries attached.
- OWNER: CLAUDE.
- SKIP: with 6.
- FAILURE: production-grade builds at exploration stage; polish masking
  structure.
- NEXT: 8.

### 8. HUMAN SELECTION
- INPUT: renders + manifesto summaries (structure visible beside pixels).
- OUTPUT: SELECT / REJECT ALL / HYBRID (+ notes). Total rejection = the
  direction space was wrong → back to 6 with new axes, not refinement.
- OWNER: HUMAN. [VALIDATED IN PROJECT — the checkpoint that paid for itself, including via an informative total rejection.]
- SKIP: only when 6–7 were skipped.
- FAILURE: treating rejection as indecision; selecting on polish (mitigated
  by manifesto-beside-render presentation).
- NEXT: 9.

### 9. PROJECT LANGUAGE / CONSTITUTION UPDATE
- INPUT: selected manifesto (greenfield) or existing constitution.
- OUTPUT: first constitution instance, or an amendment, or "no change" —
  written to project memory.
- OWNER: BOTH — Claude drafts, human ratifies.
- SKIP: routine page with zero constitutional impact ("no change" is still
  one recorded line).
- FAILURE: producing a style guide without generative rules; amending
  silently.
- NEXT: 10.

### 10. COMPOSITION PLAN
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

### 11. IMPLEMENTATION
- INPUT: plan + constitution.
- OUTPUT: built page; every visual value traceable (core P7).
- OWNER: CLAUDE.
- SKIP: never (when the task is a page).
- FAILURE: plan-build drift; undeclared decisions.
- NEXT: 12.

### 12. MACHINE QA
- INPUT: built page at declared widths.
- OUTPUT: battery report (qa.md A). Red = hard stop back to 11.
- OWNER: MACHINE.
- SKIP: never.
- FAILURE: proceeding on red; trusting a metric that failed ground truth
  (retire it instead).
- NEXT: 13.

### 13. VISUAL CRITIQUE
- INPUT: settled-motion captures at declared widths (qa.md B protocol).
- OUTPUT: named findings, each citing a failure mode and location; or a
  which-modes-were-checked statement when clean.
- OWNER: CLAUDE.
- SKIP: never.
- FAILURE: rubber stamp ("looks good"); unnamed findings ("bland");
  mid-animation captures.
- NEXT: 14 if findings, else 15.

### 14. REFINEMENT
- INPUT: findings.
- OUTPUT: fixes + re-captures; loop 12→13 until exit criteria (qa.md).
- OWNER: CLAUDE.
- SKIP: no findings.
- FAILURE: endless loop (each pass must close named findings, not reopen
  taste); premature exit with open findings.
- NEXT: 15.

### 15. HUMAN APPROVAL
- INPUT: the page + QA record + declared exceptions.
- OUTPUT: recorded approval, or redirection (back to the right stage).
- OWNER: HUMAN.
- SKIP: never for shipped pages.
- FAILURE: approval assumed from silence.
- NEXT: 16.

### 16. DOCUMENT LEARNING (conditional in **every** mode)
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

## Build-with / check-with pairing

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

## Modes

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

## Module loading (lean by mode)

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
