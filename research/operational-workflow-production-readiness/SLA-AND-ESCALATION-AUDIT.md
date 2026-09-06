# Operational Workflows — SLA and escalation audit

Time source, `ConfigRef`s, SLA, deadline, escalation, ownership effects, loops, ageing,
retry/review windows — across the 124.

> **POST-REPAIR UPDATE (2026-09-04):** No canonical SLA/escalation topology changed this round —
> the 16 SLA/time-configuration gaps and the escalation-ownership findings this document catalogs
> were confirmed not to be among the 11 true P0s and were left as documented, honest mapping-time
> dependencies (no duration was invented). `DEC-183`'s deadline-enforcement gap was checked and
> confirmed non-P0 this round. The one escalation-adjacent P0 that *was* fixed, `INC-258`'s
> closure-without-mitigation defect, is a completion/closure topology fix, not an SLA/escalation
> one — see `COMPLETION-AND-FEEDBACK-AUDIT.md`'s own update note and `CANONICAL-CHANGES.md`.

## The house rule held: zero invented durations

Every operational time concept in the corpus traces to a named policy pointer, an authoritative
deadline attribute, or an explicit "correctly left undeclared" mapping note — never a fabricated
number. 16 SLA/time findings, and every one of them is the *honest* version of a gap (a real Config
value referenced by name with no source shown), never a case where this round found or would have
been tempted to invent one:

- `OWN-52`/`OWN-53`: per-work-type acceptance SLA duration and acknowledgement-window duration are
  policy values, correctly left undeclared — mapping only, not a defect.
- `SUB-164`: "the last point at which the new term could still start on time" and "the recovery
  window the governing terms allow" are both referenced but undeclared as concrete durations.
- `INT-113`: "the operational SLA for this integration" is referenced but its Config/policy source
  is not shown in this workflow's own nodes.
- `DAT-223`: the confirmation window's duration is referenced only as "the window this change set
  remains valid against the target," with no named captured field to map it to.
- `DAT-225`: the retry budget gating `c.budget`/`a.close` is referenced only as "the attempts
  allowed for this import" with no `Config`/`attemptBudget` field anywhere — the same structural
  gap the Runtime Mechanism round's own repair closed for the 25 mechanisms, still open here.
- `DAT-227`: the rollback/audit-retention window is deferred to "the plan defines," with the
  migration plan itself never modeled as a canonical object — a cross-cutting mapping dependency,
  not a per-workflow defect.
- `DEC-182`: the "reassignment budget"/"escalation levels the model permits" is referenced only in
  prose, with no visible `Config` field — contrasted against sibling workflows in the same domain
  that do declare one, worth a company's attention as an inconsistency, not a missing concept.

## Work age vs. business deadline vs. customer-visible promise — kept distinct

The corpus is generally careful about this distinction. `DEC-183` is the one workflow this round
found where the distinction *breaks down in practice*: no wait/timeout node inside the workflow
enforces the case's own deadline once a reviewer has accepted and begun `UNDER_REVIEW` — a stalled
reviewer who has already claimed the case has no structural mechanism forcing the deadline to bite,
even though the deadline concept itself is correctly modeled elsewhere in the same workflow.

## Escalation semantics: what actually changes

Per the round's own instruction not to treat all escalation as ownership transfer, this audit
checked each escalation for what specifically changes (priority / new owner / added reviewer /
manager visibility / specialist handoff / external escalation) rather than assuming transfer by
default. The corpus does this well in most cases — `DEC-189`/`DEC-190`'s gap (flagged in
`OWNERSHIP-AND-ASSIGNMENT-AUDIT.md`) is specifically that ownership effects are *unstated* at the
escalation/reopen boundary, not that they're wrongly assumed to transfer.

## Escalation loops

No unbounded ping-pong (A escalates to B, B returns to A, A escalates again indefinitely) was found
anywhere in the 124 — the round's own instruction not to invent a numeric limit where the source
doesn't require one held throughout, and no workflow needed one: every multi-hop escalation chain
found (`DEC-187`→`DEC-189`, the `INC-25x` chain) terminates or converges rather than looping
unboundedly. The one genuine defect adjacent to this concern is a data-loss issue at a loop
boundary, not a loop-termination issue: `DEC-187`'s `h.undefined`→`DEC-189` handoff does not carry
the case's original deadline, which `DEC-189`'s own `a.preserve`/`w.decision` logic explicitly
depends on receiving to honor it correctly — reported in full in `HANDOFF-AND-CHAIN-AUDIT.md`.

## Ageing and SLA breach without escalation

- `RLT-246`: no timeout is declared on the pause itself — an undiagnosed pause has no
  self-contained escalation trigger, meaning a paused rollout can age indefinitely with nothing in
  this workflow's own graph forcing a re-check.
- `CTL-238`: no wait/timeout exists in this workflow's own graph to re-assess a "temporary"
  protection that never resolves — entirely deferred to `IDN-88` (outside this round's batches),
  which a company must confirm actually closes the loop.
- `INC-251`: the investigation-window timeout silently rejects rather than escalating to a person
  for a final call — may be intentional (fail toward "no incident"), but the specification doesn't
  say so explicitly, leaving the choice ambiguous rather than deliberate.

## Concurrent holds and coordination

`RSK-196`: no stated coordination for two independently-applied compliance holds active on the same
entity concurrently; `a.revalidate`'s current-state check doesn't explicitly confirm no other hold
is also in effect before releasing. A real but narrow gap — most workflows in the corpus that touch
a shared entity do check current state before a consequential release; this is the one instance
found where the check doesn't explicitly account for a second, independent hold.

## What already works well

`RLT-243`/`RLT-244` and `TIM-68`/`TIM-70` are this round's cleanest freshness-and-timing
implementations — revalidation before consequential execution, and deadline semantics that
correctly distinguish work-age from the underlying business promise. `OWN-55`'s ladder-escalation
discipline (roughly 30 domains converging on the same generic two-branch outcome without losing
per-domain distinctions) is the round's reference pattern for a shared escalation primitive serving
many different callers correctly — the same shape `DEC-181`'s own entry-contract gap (see
`OPERATIONAL-WORKFLOWS-AUDIT.md`'s top findings) shows what happens when that discipline is
missing.
