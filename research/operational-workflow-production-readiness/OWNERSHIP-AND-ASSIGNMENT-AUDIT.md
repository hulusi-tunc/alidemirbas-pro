# Operational Workflows — ownership and assignment audit

Owner, queue, assignment, claim, concurrency, transfer, release, automation overlap, orphan work —
across the 124. Companion to `OPERATIONAL-WORKFLOWS-AUDIT.md`'s own ownership-related findings.

## The corpus-wide fact this document exists to explain

None of the 124 declare `entity.instanceKey`/`entity.concurrency` (the fields the customer-facing
and Runtime Mechanism rounds already formalized). Every ownership claim in this layer is prose:
"one case per scope," "an owner accepts," "a queue routes to a responsible team." This is not
scored as 124 independent findings — it is recorded once, here, as the layer's own defining fact,
the same way the Runtime Mechanism round's audit recorded the missing `idempotencyKey` field once
rather than 24 times. What varies workflow to workflow is whether the *prose itself* actually
answers who owns the work right now — that is what this document tracks.

## The ownership roles, kept distinct

Per the round's brief, this audit refused to collapse queue / assigned owner / responsible team /
decision authority / approver / executor / observer into one undifferentiated "owner." The
corpus's own best examples already make this separation explicitly:

- **`DEC-181` → `DEC-182` → `DEC-183`** is the cleanest three-step separation in the round:
  `DEC-181` intakes and scopes without claiming ownership (its own `h.assign` handoff carries "no
  review has started and no outcome is implied by the case existing"); `DEC-182` performs the
  actual assignment/claim; `DEC-183` is where review ownership becomes active. This is the round's
  reference pattern for the queue-vs-assigned-vs-active distinction.
- **`CTL-231`/`CTL-232`** separate proposed ownership (a transfer that does not yet disturb the
  entity) from accepted/cutover ownership (`CTL-233`/`CTL-234`) — "proposal without disturbance" is
  the workflow's own phrase for exactly this discipline.
- **`OWN-51`–`60`** (the round's own ownership-domain cluster) consistently distinguish queue-vs-
  named ownership, proposed-vs-active responsibility, and ownership-vs-decision-authority — the
  single best-disciplined 10-workflow cluster in the corpus on this dimension.

## Ambiguous ownership, aggressively flagged (per the round's own instruction)

Twenty-three findings across the corpus, concentrated in two shapes:

**Shape 1 — escalation/reopen chains that skip an explicit claim step.** `DEC-189` and `DEC-190`
both hand a case directly into `DEC-183`'s `authorized_review_begins` trigger with no visible
assignment/claim step — the exact gap `DEC-182`'s own deliberate assigned-vs-accepted split for the
*ordinary* routing case does not have. `CTL-231` has the analogous gap between acceptance and final
assignment (no revalidation), unlike its own sibling `CTL-232`→`CTL-233` chain which explicitly
revalidates before cutover. This is the round's single most instructive contrast: the corpus
already contains the correct pattern (`DEC-182`, `CTL-232`) right next to workflows that skip it
for the escalated/reopened case specifically — worth a company's explicit attention precisely
because the fix pattern already exists elsewhere in the same domain.

**Shape 2 — a consequential decision with a named action but no named actor.** `INC-251`
(investigation ownership while `INCIDENT_CANDIDATE` is open), `INC-255` (no `execution` flag at
all, so the source itself does not say human or automated), `INC-260` (cross-incident comparison
and prevention-priority elevation both unowned), `DOC-211`/`DOC-212` (determine/reuse/waive/
resolve/populate/validate all actor-less), `REM-154` (a task requiring a human to physically
inspect a returned item, with zero queue/assignment/claim semantics anywhere — the round's clearest
instance of this shape, rated `NEEDS_CONTRACT_WORK` on ownership grounds specifically, not a
mapping exercise), `REM-160` (a nontrivial same-vs-distinct-vs-unfinished comparison with no named
role).

## Concurrency: two workers/humans, one work item

Per the round's own scenario ("Agent A opens case, Agent B opens same case, both decide"), most
workflows are genuinely safe by design — a single queue with an implicit single-claim model, or a
deterministic automated decision with no human contention point at all. Two real gaps found:

- **`OWN-52`**: no explicit guard against two concurrent *proposed* assignments existing for the
  same work item (a second `t.assigned` arriving while an existing `w.acceptance` is still
  pending).
- **`DAT-224`**: no entity-level lock/claim on the import job itself against two concurrent
  authorization events for the same change-set version running import execution twice in parallel
  — the per-record identity likely makes this safe if create-if-absent is atomic at the storage
  layer, but the workflow never states this as a requirement.

No instance was found of two humans reaching genuinely *contradictory final decisions* on the same
work instance with no correction mechanism — where consequential decisions exist, either a single
claim/assignment model already prevents the race (the `DEC-181`→`182`→`183` chain) or (per
`AUTHORITY-AND-APPROVAL-AUDIT.md`) the decision authority itself, not concurrency, is the gap.

## Human vs. automation overlap

No workflow in the round declares a universal "human always wins" rule, and none was found where
one is needed — consistent with `GLB-09`'s own explicit permissive-not-automatic principle from the
closed Runtime Mechanism round. Where automation and human ownership genuinely interact
(`ACC-74`'s inbound handoff from the `account-restriction-authority` competition group `OPS-131`
arbitrates), no defect was found in the interaction itself — see
`OPERATIONAL-WORKFLOWS-AUDIT.md`'s cross-layer findings.

## Orphan and unconsumed work

Two genuine orphan-candidates (`REL-99` Entity Split, `INT-120` Dependency Degradation Recovery) —
both well-designed workflows with no traceable real trigger anywhere in the current 284-journey
corpus, investigated rather than assumed. Four unconsumed-but-valid (`REL-97`, `INT-117`, `IDN-83`,
`TIM-70`) — sound design, no confirmed real consumer. Full detail, including every workflow's own
representative caller/receiver ids, is in `CONSUMER-COVERAGE.md`.

## What already works well and should not be redesigned

The `OWN-5x` cluster and the `DEC-181`→`182`→`183` chain are, together, the round's clearest
reference implementations for every ownership distinction this document tracks. A company building
a real implementation contract for ownership/assignment/claim should read those first — the
patterns are already correct; the gap found elsewhere is inconsistent *application* of a pattern
the corpus itself already demonstrates, not a missing concept.
