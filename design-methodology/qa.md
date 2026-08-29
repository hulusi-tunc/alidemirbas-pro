# QA — Three-Layer Validation

Validation is split by what each layer can actually see. Machines assert,
rendered-eye critique names, humans judge. "It looks good" is not a
criterion in any layer, and a page never passes on it.

---

## A. MACHINE QA

Runs on the built page, headless, at the declared widths. **Every check
carries an evidence class, and only two classes gate shipping.**

| Class | Effect |
|---|---|
| **HARD ASSERT** — objectively invalid when failed | blocks completion |
| **VALIDATED PROJECT DETECTOR** — empirically separated known-good/known-bad here | blocks, within its tested scope |
| **HEURISTIC SIGNAL** — useful warning needing interpretation | opens a visual-critique finding |
| **EXPERIMENTAL METRIC** — awaiting validation | informs critique; **never blocks alone** |

### HARD ASSERTS

| Check | Asserts |
|---|---|
| Unintended horizontal overflow | `scrollWidth − clientWidth = 0` at every declared width |
| Contrast | text/ground pairs meet the required WCAG ratio |
| Focus behavior | a visible focus indicator exists on every interactive element |
| Unresolved production placeholder | no `EXPLICIT_PLACEHOLDER` remains at ship (see lint below) |
| Fabricated evidence | none present, at any stage |
| Constitution violation | no undeclared deviation from site law |

### VALIDATED PROJECT DETECTORS

| Check | Status |
|---|---|
| Padding-only seams (>220px combined seam, identical ground) | separated known-bad/known-good/positive-control **3/0/0 in this project**. Valid within tested scope. **Known limitation:** absolute threshold — repeated *identical* same-ground seams just under it pass while showing the same failure (observed in Controlled Experiment 1); a relative form is a candidate revision |

### HEURISTIC SIGNALS

Text measure bounds · interruption-plate count · anchor width share · rail
width share · index item count · sticky viewport share · content-node
diversity per card. Each may open a critique finding; none blocks by itself.

### EXPERIMENTAL METRICS

Dead-canvas geometry v2 · absence ratio thresholds · silhouette variance ·
density-slope thresholds. These inform the critic and **may never block
shipping**. When a metric fails to separate a known-bad from a known-good
case, fix or retire it — a wrong detector is worse than none. [This happened
once: the first dead-canvas metric was retired on ground-truth evidence.]

### Fake-content lint — three verdicts

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

## A2. WEB QUALITY BASELINE

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

## A3. PERFORMANCE & ASSET QUALITY GATE

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

## B. VISUAL CRITIQUE

**Role separation (core P17).** On high-impact pages the critic is a
separate pass from the builder, and the builder's rationale is not admitted
as evidence. The critic reads renders, not reasons. A critique that cites
"the plan says this is the anchor" instead of what the capture shows is
defective. [Strict separate-agent execution PLAUSIBLE; pass separation is
the default.]

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

## B2. FINDING CLASSES AND ITERATION SCOPE

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

## B3. STATE COMPLETENESS

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

## C. HUMAN JUDGMENT

The human owns, and only the human closes:
- final register fit
- taste
- brand truth
- derivation integrity ("is this OUR thing, grown from our material")
- exception approvals (site-constitution.md)
- direction selection (visual-direction.md)

Claude may recommend in these areas; Claude may not close them.

---

## EXIT CRITERIA

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
