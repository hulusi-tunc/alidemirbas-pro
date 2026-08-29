# Visual Direction

How aesthetic direction is explored, compared, and selected — before any
production implementation. Two mechanisms: baseline elicitation (optional,
rule-gated) and manifesto-driven fan-out with a mandatory human checkpoint.

---

## Baseline elicitation

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

## Direction manifesto

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

## Fan-out

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

## Human checkpoint

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
