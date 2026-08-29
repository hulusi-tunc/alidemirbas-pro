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
- STATUS: [OBSERVED] 2026-08 — the root phenomenon across all studied systems; a mechanism account, not a controlled measurement.

## 2. Token-level anti-generic rules
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
| "Fake dashboards / fake analytics charts are banned." | Already covered at mechanism level by #9 (fabricated evidence) — an invented chart is fabricated evidentiary material regardless of how it's styled; the failure is the invention, not the dashboard shape. |
| "Generic icon grids are banned." | "Reject equal-weight repeated containers when the content has hierarchy the layout is hiding" (same rewrite as "never use three cards," above) — an icon grid is this pattern's most common instance, not a separate rule. |
| "Excessive glassmorphism / floating UI is banned." | "An ornamental or expressive element must carry a defensible function appropriate to the register" (see #11) — a blur or a floating panel is a technique; ban the technique used without function, not the technique. |
| "Rounded rectangles are the default; stop using them." | "The border-and-radius language is a site-constitution decision (site-constitution.md Layer 1), derived once per project — not a default inherited from habit, and not banned by fiat either." |
| "'Modern' means Inter + purple gradient; 'tech' means dark + neon." | These are named look-clusters, recorded below as distribution-aware warnings — never rewritten into a ban, because banning the specific pairing only shifts the mode to an adjacent one (the mechanism this table exists to interrupt). |

Named look-clusters may still be recorded as **distribution-aware warnings**
(what the model currently over-produces, dated) — never as universal bans.

**Current dated warnings** (revisit at the cadence stated at the top of this
file; a warning that has stopped being the modal output should retire, not
persist by inertia):

- 2026-08: warm cream + serif display + terracotta accent, presented as "the
  premium look."
- 2026-08: near-black ground + a single acid-green or vermilion accent,
  presented as "the tech look."
- 2026-08: Inter or a small set of "safe" geometric sans faces defaulted to
  without a register-driven reason.
- 2026-08: purple-to-blue gradient hero on white, presented as "the modern
  SaaS look."
- 2026-08: heavy glassmorphism / floating panels used as decoration rather
  than to signal an actual layering relationship in the interface.

## 3. Costume distinctiveness
- SYMPTOM: a strong "identity" that has no traceable relation to the
  subject; physical metaphors applied to unrelated products.
- MECHANISM: distinctiveness sampled from the model's distribution of
  distinctive looks, instead of derived from material.
- DETECT: swap test; derivation chain missing from the manifesto.
- CORRECT: rebuild identity from the content inventory; if the subject's
  world is thin, spend less budget rather than borrowing a world.
- STATUS: [OBSERVED] 2026-08 — one documented field case: an anti-generic workflow landed inside the exact named default it fled.

## 4. Dead canvas
- SYMPTOM: wide viewport, single left column, right half empty across
  consecutive sections; a document poured into a website.
- MECHANISM: composing prose instead of composing a page; no anchor
  inventory before layout.
- DETECT: dead-canvas geometry [PLAUSIBLE v2]; eye check against full-page
  captures.
- CORRECT: statement+witness or narrow the measure so emptiness reads as
  margin (grammar moves 6, 4).
- STATUS: [VALIDATED IN PROJECT] 2026-08 — shipped, diagnosed from render, fixed; provenance in this project (commit a9178b2).

## 5. Padding as composition
- SYMPTOM: 300–600px voids between sections; separation exists only because
  things stopped touching.
- MECHANISM: padding used where a change (ground, measure, columns) should
  do the work.
- DETECT: **padding-only seam detector — VALIDATED PROJECT DETECTOR, 3/0/0 within tested scope** (qa.md carries its known threshold limitation).
- CORRECT: background shift or another seam change (grammar move 3).
- STATUS: [VALIDATED IN PROJECT] 2026-08, same provenance.

## 6. Border without structural reason
- SYMPTOM: boxes around single labels; fences around words.
- MECHANISM: card as default container instead of earned frame.
- DETECT: content-node diversity per card ≤ 1.
- CORRECT: lists, rows, rails for labels; keep borders for structured
  content (grammar move 10).
- STATUS: [VALIDATED IN PROJECT] 2026-08 — the 19-one-name-boxes case, rejected in review; and a working bento counter-example.

## 7. Card-everything
- SYMPTOM: open prose boxed; the reference page reads as a dashboard.
- MECHANISM: uniform containerization as a substitute for hierarchy.
- DETECT: boxed-prose scan; card density per page.
- CORRECT: prose sits open; one edge for the interface, one tint for
  evidence, one plate for the takeaway.
- STATUS: [OBSERVED] 2026-08 — a production rule predating the methodology, held across many pages.

## 8. Screenshot optimization
- SYMPTOM: quality that exists only in the hero viewport; the rest of the
  scroll is unmade.
- MECHANISM: evaluation biased to what a single capture shows; guidance
  systems trained on screenshot diffs inherit it.
- DETECT: full-height captures mandatory; absence metrics over the whole
  page.
- CORRECT: full-page silhouette in the plan; QA reads the entire scroll.
- STATUS: [OBSERVED] 2026-08 — a structural evaluation bias identified in studied systems.

## 9. Fabricated evidence
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

## 10. Register blindness
- SYMPTOM: one visual philosophy applied to every site type; drama on a
  calculator, template SaaS on a brand.
- MECHANISM: rules written unconditionally on axes that reverse by register.
- DETECT: any decision touching a reversal-matrix axis without a declared
  register.
- CORRECT: classify register first (registers.md); condition the rule.
- STATUS: [OBSERVED as a failure mode; the register taxonomy itself is PLAUSIBLE] 2026-08.

## 11. Decoration inflation
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

## 12. Fan-out theater
- SYMPTOM: "three directions" that differ in hue, theme darkness, or font
  personality only.
- MECHANISM: sampling k neighbors of the same mode; polish masks structural
  sameness.
- DETECT: manifesto diff — anchor + three structural axes must differ
  pairwise (visual-direction.md); pixels are never the diff target.
- CORRECT: regenerate manifestos before rendering.
- STATUS: [OBSERVED as a risk; k, the axis list and the distance rule are PLAUSIBLE] 2026-08.

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

## 13b. Taste-driven convergence
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

## 14. Copied scaffolds across projects
- SYMPTOM: new project starts from the previous project's design files;
  "every project looks like the last site I made".
- MECHANISM: reuse of derived identity outside the material it was derived
  from.
- DETECT: cross-project diff of constitutions; convergence audit.
- CORRECT: mechanisms and process transfer; identity re-derives per project.
- STATUS: [OBSERVED] 2026-08 — one independent field report, corroborated by our own reasoning; not tested here.

## 15. Optional render validation
- SYMPTOM: "screenshots if your environment supports it"; design claims
  made from code reading.
- MECHANISM: treating the only ground-truth channel as a nicety.
- DETECT: any completed design task without capture artifacts at declared
  widths.
- CORRECT: render inspection is mandatory (core P11); no exceptions,
  including the motion-settle protocol.
- STATUS: [VALIDATED IN PROJECT] 2026-08 — a real wrong verdict here came from a mis-taken screenshot; [OBSERVED] studied systems left render validation optional.

## 16. Designing pages independently without site rules
- SYMPTOM: each page locally fine; the site incoherent — or the inverse
  correction, every page identical.
- MECHANISM: absence of the three-layer split; decisions unassigned to a
  layer.
- DETECT: constitution diff per page; undeclared-decision scan.
- CORRECT: site-constitution.md layers; exceptions protocol.
- STATUS: [OBSERVED need] 2026-08 — three independent sources agree on
  project language; the layer split is this system's formalization.

---

## Archive

(empty — nothing retired yet; retirements land here with date and reason)
