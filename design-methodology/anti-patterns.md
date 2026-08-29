# Anti-Patterns

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

## 1. Distributional defaulting
- SYMPTOM: the design is a set of individually defensible, collectively
  characterless choices; it could be any site.
- MECHANISM: sampling regresses to the modal answer on every axis left
  unnamed by context.
- DETECT: swap test (would this identity fit another site unchanged?);
  baseline comparison where one exists.
- CORRECT: derive from project material (core P4); name the unnamed axes.
- STATUS: [PROVEN] 2026-08 — root phenomenon of the whole research arc.

## 2. Token-level anti-generic rules
- SYMPTOM: rules like "avoid font X", "never color Y".
- MECHANISM: banning tokens shifts the distribution to adjacent tokens; the
  replacements become the next recognizable default (observed twice across
  skill generations).
- DETECT: any rule that names a font/color/radius outside a project
  constitution.
- CORRECT: rewrite at mechanism level ("decoration must carry information"),
  or move into a register-conditioned or project-scoped rule.
- STATUS: [PROVEN — REJECTED idea, banned from re-entry] 2026-08.

## 3. Costume distinctiveness
- SYMPTOM: a strong "identity" that has no traceable relation to the
  subject; physical metaphors applied to unrelated products.
- MECHANISM: distinctiveness sampled from the model's distribution of
  distinctive looks, instead of derived from material.
- DETECT: swap test; derivation chain missing from the manifesto.
- CORRECT: rebuild identity from the content inventory; if the subject's
  world is thin, spend less budget rather than borrowing a world.
- STATUS: [PROVEN] 2026-08 — field case: an anti-generic workflow landed
  inside the exact named default it fled.

## 4. Dead canvas
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

## 5. Padding as composition
- SYMPTOM: 300–600px voids between sections; separation exists only because
  things stopped touching.
- MECHANISM: padding used where a change (ground, measure, columns) should
  do the work.
- DETECT: **padding-only seam detector [PROVEN, 3/0/0].**
- CORRECT: background shift or another seam change (grammar move 3).
- STATUS: [PROVEN] 2026-08, same provenance.

## 6. Border without structural reason
- SYMPTOM: boxes around single labels; fences around words.
- MECHANISM: card as default container instead of earned frame.
- DETECT: content-node diversity per card ≤ 1.
- CORRECT: lists, rows, rails for labels; keep borders for structured
  content (grammar move 10).
- STATUS: [PROVEN] 2026-08 — 19-one-name-boxes case, rejected in review.

## 7. Card-everything
- SYMPTOM: open prose boxed; the reference page reads as a dashboard.
- MECHANISM: uniform containerization as a substitute for hierarchy.
- DETECT: boxed-prose scan; card density per page.
- CORRECT: prose sits open; one edge for the interface, one tint for
  evidence, one plate for the takeaway.
- STATUS: [PROVEN] 2026-08 — production rule predating the methodology.

## 8. Screenshot optimization
- SYMPTOM: quality that exists only in the hero viewport; the rest of the
  scroll is unmade.
- MECHANISM: evaluation biased to what a single capture shows; guidance
  systems trained on screenshot diffs inherit it.
- DETECT: full-height captures mandatory; absence metrics over the whole
  page.
- CORRECT: full-page silhouette in the plan; QA reads the entire scroll.
- STATUS: [PROVEN] 2026-08 — structural bias identified in studied systems.

## 9. Fabricated content and data
- SYMPTOM: invented copy, numbers, testimonials, screenshots, chart images.
- MECHANISM: generation filling material gaps instead of reporting them.
- DETECT: fake-content lint; every number traceable to source; imagery
  provenance.
- CORRECT: stop and report the gap; design with real material or less
  material (core P5).
- STATUS: [PROVEN — hard ban] 2026-08. Note: one studied workflow
  explicitly instructs inventing copy; that instruction is REJECTED here
  and must not re-enter.

## 10. Register blindness
- SYMPTOM: one visual philosophy applied to every site type; drama on a
  calculator, template SaaS on a brand.
- MECHANISM: rules written unconditionally on axes that reverse by register.
- DETECT: any decision touching a reversal-matrix axis without a declared
  register.
- CORRECT: classify register first (registers.md); condition the rule.
- STATUS: [PROVEN as failure; taxonomy PLAUSIBLE] 2026-08.

## 11. Decoration inflation
- SYMPTOM: flourishes, textures, "unnecessary details" doctrine; ornament
  presented as identity.
- MECHANISM: equating distinctiveness with added decoration.
- DETECT: structure-is-information test — each ornament either encodes
  something true or is a defect; excess-decoration check in visual critique.
- CORRECT: cut ornament that carries no information; spend identity budget
  on derived choices.
- STATUS: [PROVEN — REJECTED doctrine, banned from re-entry] 2026-08.

## 12. Fan-out theater
- SYMPTOM: "three directions" that differ in hue, theme darkness, or font
  personality only.
- MECHANISM: sampling k neighbors of the same mode; polish masks structural
  sameness.
- DETECT: manifesto diff — anchor + three structural axes must differ
  pairwise (visual-direction.md); pixels are never the diff target.
- CORRECT: regenerate manifestos before rendering.
- STATUS: [PROVEN as risk; k and axes PLAUSIBLE] 2026-08.

## 13. Second-order convergence
- SYMPTOM: the anti-generic system's own outputs converge; the house
  vocabulary hardens into the next template.
- MECHANISM: any finite named vocabulary (including this grammar) reshapes
  the distribution toward itself.
- DETECT: project-to-project convergence audit (project-memory.md).
- CORRECT: flagged mechanisms get one forced-avoidance direction in the
  next fan-out; conscious reuse allowed after review.
- STATUS: [OPEN RISK — mechanism designed, untested against ourselves]
  2026-08.

## 14. Copied scaffolds across projects
- SYMPTOM: new project starts from the previous project's design files;
  "every project looks like the last site I made".
- MECHANISM: reuse of derived identity outside the material it was derived
  from.
- DETECT: cross-project diff of constitutions; convergence audit.
- CORRECT: mechanisms and process transfer; identity re-derives per project.
- STATUS: [PROVEN] 2026-08 — independent field report, corroborated.

## 15. Optional render validation
- SYMPTOM: "screenshots if your environment supports it"; design claims
  made from code reading.
- MECHANISM: treating the only ground-truth channel as a nicety.
- DETECT: any completed design task without capture artifacts at declared
  widths.
- CORRECT: render inspection is mandatory (core P11); no exceptions,
  including the motion-settle protocol.
- STATUS: [PROVEN] 2026-08 — both by studied systems' failure to require it
  and by a real wrong verdict from a mis-taken screenshot.

## 16. Designing pages independently without site rules
- SYMPTOM: each page locally fine; the site incoherent — or the inverse
  correction, every page identical.
- MECHANISM: absence of the three-layer split; decisions unassigned to a
  layer.
- DETECT: constitution diff per page; undeclared-decision scan.
- CORRECT: site-constitution.md layers; exceptions protocol.
- STATUS: [PROVEN need] 2026-08 — three independent sources agree on
  project language; the layer split is this system's formalization.

---

## Archive

(empty — nothing retired yet; retirements land here with date and reason)
