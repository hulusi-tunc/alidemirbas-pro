# QA — Three-Layer Validation

Validation is split by what each layer can actually see. Machines assert,
rendered-eye critique names, humans judge. "It looks good" is not a
criterion in any layer, and a page never passes on it.

---

## A. MACHINE QA

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

## B. VISUAL CRITIQUE

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
6. **Human approval exists** and is recorded in project memory.

One validated pass through this gate beats three speculative ones. A page
that fails any criterion is not "mostly done"; it is open.
