# Silent Lifecycle States — observability audit

A silent state has no message-send log to point at when someone asks why it did what it did — the
entire justification for its existence has to live in its own data model. This document checks
each of the 64 states against six questions a company's support, ops, or engineering team will
ask in production, and lists every state this audit found unable to answer one of them from its
own declared attributes.

## The six questions

1. **Why is this active?** — what evidence or event opened the instance.
2. **Since when?** — when it entered, or when the fact it represents became true.
3. **Because of what?** — the specific input, rule, or decision that produced the current value,
   not just that a decision was made.
4. **Owned by whom?** — who (or what system) currently has the next action, wherever that is a
   human decision rather than a deterministic rule.
5. **Until when?** — when it will time out, escalate, or otherwise stop waiting, wherever it waits
   at all.
6. **Superseded by what?** — what specifically overtook it, wherever a later fact can invalidate
   an earlier one.

## Corpus-wide baseline: strong

Every one of the 64 states writes an append-only log on its state-changing actions (63 of 64 —
see the one exception below), which answers questions 1–3 adequately in the overwhelming majority
of states: `entitlement_log`, `suspension_log`, `relationship_log`, `occurrence_log`, and their
siblings all retain which action fired, in what order, on every write. 36 of 64 states declare at
least one wait with an attribute-bound or policy-bound timeout, which answers question 5
wherever the state actually waits. This baseline is not itself a finding — it is the reason the
gaps below are worth calling out specifically, against a corpus that mostly gets this right.

## States unable to answer "why is this active?" / "because of what?"

- **RET-22** (Usage Gap Assessment) — the one state in the entire corpus where **no action writes
  anything at all**. `a.compare` and `a.inspect` are both pure reads. This is a P1 finding
  (see below) because it is not just a logging gap: RET-22's own re-entry model explicitly says
  "absence accumulates into evidence, it does not start as evidence," which requires something
  to persist between instances — and nothing does.
- **CON-33** (Preference Recalculation) — `a.adapt` is a state-changing action with neither a
  writes entry nor an idempotencyKey; a company cannot tell an adaptation happened at all from
  this state's own data model, only infer it from downstream effects.
- **ACQ-03** (Intent Escalation Handoff) — the pass/fail *result* of `c.strength`'s
  noise-vs-real judgment is recorded, but the specific evidence that produced the judgment is not
  retained anywhere — a company debugging "why did this person escalate" has the outcome, not the
  reasoning trail.

## States unable to answer "since when?"

- **REL-100** (Orphan Relationship Recovery) — no structured field distinct from the append log
  answers "how long has this been orphaned"; the log has to be parsed rather than read.
- **IDN-89** (Identity Attribute Update) — `s.g3` depends on propagation carrying `origin` and
  `version` so a stale, late-arriving update can be discarded correctly, but neither field is a
  declared attribute — the rule the corpus states exists has no data to answer "which version is
  this, and is it older than what we already have."

## States unable to answer "owned by whom?"

Every state with an actual human-decision point — a review, an approval — should name who is
deciding. Three states have one and do not:

- **ACC-78** (Access Suspension) — `c.review`'s extend/lift/escalate decision names no
  reviewer/owner field.
- **IDN-88** (Account Recovery Verification) — `h.review` names no reviewer field (the same
  pattern as ACC-78, independently found).
- **FUL-145** (Fulfillment Exception Recovery) — `w.approval` names no approver field.

One further state is worth naming even though it did not surface a human-decision point: **FBK-50**
(Relationship State Reassessment) has an exit literally named `x.owned` that itself names no
owner field — a naming mismatch worth fixing regardless of whether the "owner" here is a person
or a downstream system.

Every other state in the corpus either has no human-decision point (the overwhelming majority —
deterministic routing throughout) or, where ownership transfers to another journey via a handoff,
correctly treats "owned by whom" as answered by the receiving journey's own contract rather than
needing a field here.

## States unable to answer "until when?"

- **REL-91** (Relationship Validation) — `x.pending` (evidence outstanding) has no wait node,
  timeout, or SLA at all. A relationship can sit `PENDING_EVIDENCE` indefinitely with nothing to
  escalate it — unlike its structurally analogous sibling, REL-100's orphan state, which has an
  explicit `resolution_sla`.

Every other wait-bearing state in the corpus (36 of 64) correctly answers this question via a
`ConfigRef`-shaped timeout; the 28 states with no wait node at all resolve synchronously and the
question does not apply to them.

## States unable to answer "superseded by what?" — a corpus-wide, minor pattern

No state in the corpus models `supersededBy` as a **structured field** — every instance of
supersession this audit found (SCH-174's `s.changed`, SCH-177's `a.suppress`, SCH-179's
`a.suppress`, SUB-168's `s.g2`, TRM-105's `x.cancelled`) names what superseded it as free text
inside an append-log entry, never as a queryable pointer to the superseding event or instance. This
is a real, systemic gap, but a minor one (P2-level, not separately re-raised per state in
`LIFECYCLE-STATES-AUDIT.md` since it is uniform rather than a per-state finding worth repeating 5
times) — a company implementing any of these states can answer "was this superseded" from the log,
but cannot answer "superseded by *which specific instance*" without parsing prose.

## Recommended minimum production observability contract

Based on what this audit found working well and what it found missing, a silent state's
implementation contract should require, at minimum:

1. An append-only log field, written on every state-changing action (already the corpus-wide
   norm — 63 of 64 states already do this).
2. For any state with a human-decision point: a named `reviewer`/`owner` field, populated at the
   moment the decision opens, not just at the moment it resolves.
3. For any state whose own re-entry semantics depend on accumulating evidence across instances
   (RET-22's pattern): an explicit, declared field for that accumulation — never left to be
   inferred from the presence or absence of prior log entries.
4. For any state carrying a version or "which one is current" claim across a propagation or
   correction boundary (IDN-89's pattern): explicit `origin` and `version` fields, not just a
   canonical rule asserting they exist.
5. Where a state can be superseded, a structured pointer to the superseding instance or event —
   not just a prose note in the log — wherever the volume of instances makes "which one superseded
   this" a real operational question (this is a should, not a must: the corpus's current
   free-text approach is adequate at low volume and the gap above is intentionally scored P2
   rather than P0/P1).

## Cross-reference

`lifecycle-state-contracts.json`'s `observability` object (`enteredBy`, `evidenceRefs`,
`currentOwner`, `expiresAt`) is mechanically derived per state from each state's own `writes` and
`waits` declarations; the qualitative gaps above (the actual audit judgment — which states are
missing a reviewer field, which have no persistence at all) come from the narrative review in
`LIFECYCLE-STATES-AUDIT.md` and are the authoritative source. The JSON's `observability.currentOwner`
field is not populated for any of the 64 states in this generation, since deciding *which* field
name would represent a genuine reviewer/owner attribute is exactly the contract-layer work this
round's `NEEDS_CONTRACT_WORK` verdicts on ACC-78, IDN-88, and FUL-145 are flagging as outstanding
— populating it today would mean inventing a value the canonical graph does not supply, which this
round's methodology (see the schema's own top-of-file comment) explicitly avoids.
