# Operational Workflows — handoff and chain audit

Workflow-to-workflow chains, receiver construction, cycles, duplicate work, ownership transfer,
downstream result expectations — across the 124's 236 total handoff edges.

## Method and its limit, stated up front

A mechanical check (does a handoff's `carries` text plausibly cover a receiver's declared
`contract.requiredFields`) was run against all 236 handoffs and found zero flagged — not because
every handoff is provably sound, but because almost none of the 124 declare
`contract.requiredFields` at all (the structural convention the customer-facing and Runtime
Mechanism rounds already use). This is the same corpus-wide pattern
`OWNERSHIP-AND-ASSIGNMENT-AUDIT.md` records for `entity.instanceKey` — recorded once here, not as
236 individual non-findings. The real handoff-provenance findings below come from reading each
handoff's `carries` text against the receiver's own stated entry requirements directly, per
workflow, which is what actually surfaced the 19 genuine gaps in this dimension.

## Genuine receiver-construction gaps

- **`DEC-181` (P0, the round's most consequential handoff-provenance finding)**: its own
  `a.capture`/`c.valid` requester-standing model and `w.info`'s requester-interactive wait are
  undefined for the large class of mechanism/operational callers (`OPS-131`, `CTL-231`, `CTL-238`,
  `REL-95`–`99`, `DAT-222/223/226/228/229/230`, `RSK-191`–`200`, `DOC-212`–`220`, `INT-115`–`119`,
  `SUB-163`–`169`, `FIN-137`, `REM-152/154/159`, `TIM-67`, and others) — the receiving workflow
  cannot always construct a valid case from what these senders actually carry, because it expects a
  human requester field none of them naturally has. Full detail in `OPERATIONAL-WORKFLOWS-AUDIT.md`
  finding 1.
- **`INT-114`**: no terminal exit (`exits: []`) — an operator or downstream system asking "is this
  specific external operation finished" cannot get an answer purely from this workflow's own graph.
- **`RSK-195`**: its own `distinctFrom` prose claims it delegates verification collection to
  `IDN-82`, but no handoff node in either journey's structured graph actually connects them — the
  relationship exists only as narrative, not as a real dependency a company could implement against
  (`IDN-82`'s own findings note the identical gap from the receiving side).
- **`DAT-222`**: no node models how a `DEC-181` decision on an escalated ambiguous-record case
  re-enters or finally resolves validation — a company must define this re-entry path itself.
- **`DOC-212`**: `h.issue` does not carry (and nothing here supplies) the "authority to issue" that
  `DOC-213`'s own entry contract separately requires — the paired finding detailed in
  `AUTHORITY-AND-APPROVAL-AUDIT.md`.
- **`DEC-187`/`DEC-189`**: `h.undefined`→`DEC-189` does not carry the case's original deadline, but
  `DEC-189`'s own `a.preserve`/`w.decision` logic explicitly depends on receiving one to honor it —
  a real data-loss gap at an escalation-chain boundary, not merely a documentation nicety.

## Cross-workflow chain findings

- **`RLT-250` ↔ `RLT-246`, a genuine semantic mismatch (paired finding, not single-sided)**:
  `RLT-250`'s late-regression handoff routes into `RLT-246` (Rollout Pause), but `RLT-246`'s own
  action set (freeze cohort expansion, resume via `RLT-245`) assumes an in-progress rollout with
  cohorts left to work through — semantics that don't fit a rollout `RLT-250` itself describes as
  already complete. A company implementing this chain literally would build a "pause" action that
  has nothing left to pause.
- **`DAT-226` → `DAT-227`, an incomplete producer/consumer contract**: `DAT-227`'s trigger evidence
  requires "a migration recorded ready, with an authority model and an authorized run," but
  `DAT-226` only ever produces the authority model — the "authorized run" fact `DAT-227` also
  requires is never produced anywhere in this chain as a distinct output.
- **`TRM-102` → `TRM-101`, a missing loop-back**: no explicit handoff models the return path from a
  resolved (or partially reconciled) conflict back into `TRM-101`'s consolidation — the loop between
  these two journeys is directional only in the graph, even though the workflows' own prose implies
  a genuine back-and-forth.
- **`RSK-193`**: no stated mechanism to detect or coordinate an already-active restriction on the
  same capability/entity when a second risk case (from `RSK-192`, `RSK-194`, or `RSK-200`)
  independently reaches the same conclusion — three separate risk-detection paths can converge on
  one entity with no coordination between them.

## Duplicate case creation across chains

No instance of a genuine duplicate-work-creation chain (workflow A and workflow B both able to
independently open the same logical case with no shared identity between them) was found beyond
what is already captured as an idempotency finding on the originating workflow itself — see
`OWNERSHIP-AND-ASSIGNMENT-AUDIT.md`'s idempotency discussion. The cross-workflow risk this
document's own brief asked about (`RSK-193`, above) is a *coordination* gap between independently-
valid parallel detections, not a duplicate-creation defect in any single workflow.

## Unbounded escalation loops

None found — see `SLA-AND-ESCALATION-AUDIT.md`'s own escalation-loop section for the full
treatment; every multi-hop chain checked terminates or converges.

## What already works well

`FIN-135`'s handoff into `OPS-125` (confirmed intact, see `OPERATIONAL-WORKFLOWS-AUDIT.md`'s
cross-layer findings) and the `DEC-181`→`182`→`183` chain (correctly designed for the ordinary
human-submitted case, per `OWNERSHIP-AND-ASSIGNMENT-AUDIT.md`) are this round's reference
implementations for a well-constructed multi-hop chain — the defects found above are localized to
specific boundaries, not evidence the corpus's chaining discipline is generally weak.
