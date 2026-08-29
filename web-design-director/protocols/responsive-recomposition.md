# Responsive Recomposition

Promotes qa.md's existing principle — "mobile RE-composition, not mere
reflow" — from a slogan into a procedure. Reducing responsive design to
"desktop grid → fewer columns → one column" is itself a named failure this
protocol exists to stop.

## For every major section, decide six things

| Decision | Question |
|---|---|
| **PRESERVE** | What must retain its prominence at every width — the same visual weight, not just present but present *loudly*? |
| **REFLOW** | What changes order or layout, but keeps the same content and the same importance? |
| **COMPRESS** | What can become denser (tighter type scale, tighter spacing) without losing legibility or meaning? |
| **DISCLOSE** | What can become progressive/interactive at narrow widths — collapsed by default, available on demand — where it was static at wide widths? |
| **REPLACE** | What needs a genuinely different, mobile-specific representation (a table that becomes a card list, a hover reveal that becomes a tap target)? |
| **REMOVE** | What is genuinely nonessential at this width — true removal, not merely hidden-but-still-loaded? |

Every section gets an answer to at least one of these, stated, not left
implicit. A section whose answer to all six is "nothing changes" is a
legitimate answer for a section that is already width-independent (a single
centered statement, for instance) — but it should be a stated conclusion,
not a silent default from never having asked.

## What this replaces

The failure mode this protocol exists to name: a grid that goes
4-columns → 2-columns → 1-column with nothing else changing is REFLOW
applied to everything and every other decision skipped by default. That is
not wrong in every case (some content genuinely just reflows), but it
should be the *result of asking the six questions*, not the only question
ever asked.

## Verification

**RULE: verify at the actual declared viewport widths, and at the
intermediate widths where a section's behavior might break between them**
(qa.md A's capture protocol already sets the default declared widths —
1440/834/390 — this protocol adds: check the transition zones between them
too, not just the three fixed points, wherever a section's layout genuinely
changes shape rather than merely scaling).

**RULE: "responsive" is not trustworthy merely because the builder says
it is** (core P11's render-is-ground-truth applied specifically here) — the
same render-inspection requirement that governs every other design claim
governs this one. No responsive claim is valid without a capture at the
width in question.

## Output

A short per-section table (the six-column header above, filled in) belongs
in the composition plan or in DESIGN.md for any page whose responsive
behavior is non-trivial. A page whose sections are simple enough that this
would be pure ceremony may skip it and say so (workflow.md's scale-down
rule) — but the skip is a stated decision, the same as everywhere else in
this system.
