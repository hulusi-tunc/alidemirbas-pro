# Runtime Mechanisms — consumer coverage

For each of the 24: known consumers, consumer surface, representative caller ids, and whether a
possible duplicate mechanism or a missing runtime primitive shows up in its reference graph.
Nothing in this document was deleted or changed — audit only, per the round's brief.

## Method and its limits, stated up front

Two consumer signals were checked: **structural handoffs** (a `handoff` node elsewhere in the
283-journey corpus whose `to` field names this mechanism — a real, traceable dependency) and
**prose references** (this mechanism's id appearing in another journey's `distinctFrom` text or
elsewhere in its prose — usually a boundary statement explaining a *difference*, not a
consumption relationship, and read that way throughout this document). A third, real consumption
path exists that neither signal can trace: **event-name matching** — several of the 24 are entered
via a named trigger event (`authoritative_business_event`, `frequency_preference_changed`,
`worker_unavailable_while_owning_work`, ...) that is presumably emitted by some other part of the
system whenever the right condition occurs, but the canonical corpus does not model "which
journey's own node emits this event," so this path is invisible to both signals above. Where a
mechanism's only real consumers are event-triggers, this document says so explicitly rather than
reporting a false zero.

## Per-mechanism table

| Mechanism | Handoff consumers | Prose-only references | Consumer surface |
|---|---|---|---|
| CMS-201 | none | none | event-trigger only (authoritative_business_event) |
| CMS-202 | CON-36, CMS-201, CMS-205 | — | internal pipeline (3 senders) |
| CMS-203 | CMS-202, CMS-208 | — | internal pipeline (2 senders) |
| CMS-204 | CMS-203 | — | internal pipeline (1 sender) |
| CMS-205 | CMS-204 | — | internal pipeline (1 sender) |
| CMS-206 | CMS-205 | — | internal pipeline (1 sender) |
| CMS-207 | none | CMS-206 (distinctFrom) | event-trigger only (delivery_status_received, a provider webhook) |
| CMS-208 | CMS-206, CMS-207, DOC-214 | — | internal pipeline + 1 cross-domain sender (DOC-214) |
| CMS-210 | CMS-203, CMS-207, CMS-208 | — | internal pipeline (3 senders) |
| CON-34 | none | CON-283 (distinctFrom only, not a dependency) | event-trigger only (frequency_preference_changed) — **fully isolated** |
| CON-35 | none | CON-31, CON-36, CON-40, CMS-203 (all distinctFrom/prose) | event-trigger only (authoritative_permission_change) |
| CON-36 | ACC-261, FUL-276, CMS-208 | CON-272 (distinctFrom) | event-trigger entry (channel_contactability_materially_changed) + 3 confirmed senders |
| CON-39 | none | CON-38 (distinctFrom) | event-trigger only (cooldown_triggering_event) |
| CON-40 | CON-35 | INT-119 (distinctFrom) | 1 confirmed sender (CON-35, on convergence failure) |
| OPS-121 | none | DAT-224 (distinctFrom) | event-trigger only (asynchronous_work_accepted) — **domain root** |
| OPS-122 | OPS-121 | — | 1 confirmed sender |
| OPS-123 | OPS-121 | — | 1 confirmed sender |
| OPS-124 | OPS-121, OPS-126 | OPS-127, FIN-134, CMS-208 (all distinctFrom) | 2 confirmed senders + 1 unconfirmed structural claim (CMS-208) |
| OPS-125 | FIN-135 | — | 1 confirmed sender |
| OPS-126 | none | DAT-225 (distinctFrom, explicitly declining to use it) | **no confirmed real consumer** |
| OPS-127 | OPS-121, OPS-124 | — | 2 confirmed senders |
| OPS-128 | none | none | event-trigger only (worker_unavailable_while_owning_work) |
| OPS-129 | OPS-122 | — | 1 confirmed sender |
| OPS-130 | OPS-121, OPS-124 | FUL-144 (distinctFrom) | 2 confirmed senders |

## Zero-consumer mechanisms, individually assessed

Eight mechanisms show zero *handoff* consumers. Assessed individually, per Part 28's explicit ask,
rather than treated as one finding:

- **CMS-201, CMS-207, CON-35, OPS-121, OPS-128** — all five are event-triggered entry points where
  the triggering event is authoritative and external to the canonical corpus (a business event, a
  provider webhook, a permission-system change, a work-acceptance call, a worker heartbeat). This
  is the expected, correct shape for reusable infrastructure: nothing else in the corpus should
  "hand off" into an entry point that is itself the front door. **Not a gap.**
- **CON-39** — same event-triggered shape (`cooldown_triggering_event`), but its own eligibility
  requirements name specific triggering scenarios ("a recent service recovery, a critical external
  alert, an explicit decline, unusually dense recent communication, a sensitive interaction, or a
  recent retention attempt") that read as things another journey's own logic would detect and
  raise — plausibly the same invisible-to-both-signals gap as CMS-201/CON-35, not a defect, but
  worth a closer look in a repair round to confirm at least one real emitter exists somewhere.
- **CON-34** — the one mechanism with zero consumers **and** zero outbound handoffs. Its only
  cross-reference anywhere in the corpus (`CON-283`) is a `distinctFrom` boundary statement, not a
  dependency. This is architecturally different from the event-triggered group above: an
  event-triggered entry point still *does* something downstream (it hands off to the next stage);
  CON-34 both receives nothing traceable and sends nothing. **Worth flagging directly**: either a
  real emitter and a real downstream consequence exist that this audit's method cannot see, or
  this mechanism is not currently wired into anything.
- **OPS-126** — zero handoff consumers, and its one prose reference (`DAT-225`) is explicit about
  *not* using it ("This works at record grain against production data... the unresolved scope has
  to stay linked to the original import" — describing why DAT-225 has its own comparable-but-
  distinct mechanism rather than delegating to OPS-126). **The strongest zero-real-demand candidate
  in the round.** The design itself (never replay successful children, honest escalation on
  undefined aggregation policy) is sound and would likely serve real composite/batch/fan-out work
  correctly if such work existed in the corpus — this reads as infrastructure built ahead of
  confirmed demand, not a broken mechanism.

## Possible duplicate mechanism

**CMS-208 / OPS-124**, detailed fully in `RETRY-AND-FAILURE-AUDIT.md`. CMS-208's own prose claims
it delegates retry execution to OPS-124; its graph shows a fully self-contained retry loop with no
structural handoff into OPS-124 anywhere. Recorded here as the round's one confirmed instance of
"possible duplicate mechanism, or possible mismatched documentation" — not resolved by this audit,
flagged for a repair round to settle by reading the two mechanisms' actual implementation intent.

No other pair among the 24 showed comparable overlap. `OPS-123` (stalled-work detection) and
`OPS-128` (worker-failure recovery) sit close together conceptually (both reason about whether an
in-flight job can be safely reclaimed) but their own `distinctFrom`-shaped scoping is clean in
substance even where it is not written as an explicit `distinctFrom` block: OPS-123 is triggered by
a progress-threshold breach on work whose owner is still nominally alive; OPS-128 is triggered by
the owning worker itself becoming unavailable. Different trigger, different evidence, no
duplication found.

## Customer/state semantics that appear to require a runtime primitive that does not exist

One confirmed instance, already the round's top architectural finding: **conflict/exclusivity
arbitration.** Seven customer-facing journeys declare structured `competition` blocks
(`exclusionGroup`/`precedence`/`onLoss`) expecting some runtime primitive to arbitrate between
them deterministically when both are open; none of the 24 mechanisms does this. Full detail in
`CONCURRENCY-AND-ORDERING-AUDIT.md`.

A second, narrower candidate surfaced during this scan but does not rise to the same level:
**cross-domain retry-budget sharing.** `CMS-208` (a communication-specific retry loop) and
`OPS-124` (the generic engine) both exist; if a repair round confirms they are meant to be one
shared primitive rather than two independent ones, that is a contract-clarification fix (see
`RETRY-AND-FAILURE-AUDIT.md`), not evidence of a missing third mechanism.
