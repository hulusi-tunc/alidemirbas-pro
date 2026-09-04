# Cross-library integration audit — result and feedback propagation

Governing brief Parts 12–14. Audit only; nothing under `src/`, `production/`, `scripts/`, `seo/`,
`search/` was touched. Grounded in `research/cross-library-integration-readiness/relationship-graph.json`
(548 edges — 522 handoff, 22 competition, 4 preemption), `production/canonical-dump.json` (284
journeys, read structurally via a extraction script, not by hand-scanning), and the two prior
Operational Workflow audits (`COMPLETION-AND-FEEDBACK-AUDIT.md`, `HANDOFF-AND-CHAIN-AUDIT.md`,
`CONSUMER-COVERAGE.md`) as a baseline this round tests against the *cross-layer* question rather
than re-deriving.

## Method

1. Recomputed each journey's product surface from `src/canonical/surface.ts`'s own rule (matches
   the relationship graph's own surface tags exactly: 124 operational / 68 customer-communicating /
   64 customer-silent / 25 mechanism / 3 customer-human-routing — the corpus's documented counts).
2. Built a directed handoff graph from all 522 `handoff` edges and ran forward reachability from
   every one of the 124 Operational Workflows, asking: within 6 hops, does *any* handoff chain
   starting here reach a customer-silent, customer-communicating, or customer-human-routing
   surface? This operationalizes Part 14's "trapped result" question at corpus scale, ahead of
   reading source.
3. For every candidate this surfaced, read the actual node graph on both ends in
   `production/canonical-dump.json` and quoted the relevant text below — no finding in this
   document rests on the graph shape alone.

## Part 12 — wait/handoff vocabulary match

`WaitNode.until` is typed `readonly string[]` with the comment "Registry event ids on migrated
journeys (they ARE the cancellation events); prose on un-migrated ones." Across 226 wait nodes /
434 `until` entries, **274/434 (63%) resolve exactly against `src/canonical/events.ts`'s 456-entry
registry**; the remaining 160 are un-migrated prose, exactly as the type comment describes — not a
defect, a documented migration boundary.

**The corpus's own mitigation for name-drift is `recheck`, and it works.** A large share of
`until` values referencing an event with no in-corpus `trigger` node producing it (167 distinct
registry ids) are not orphaned consumers — they are legitimately external, behavioral, or
declared facts (`purchase_completed`, `booking_confirmed`, `signer_signed`) that no canonical
journey is supposed to "produce" as its own trigger. The registry's own `source` field (behavioral
/ declared / authoritative) already distinguishes these, and every trigger node's local
`evidence.source` in the dump matches the registry's `source` for the same event id **with zero
mismatches** (`0/284` triggers) — expected, since the registry is generated *from* the trigger
entries per `events.ts`'s own header comment, but confirms the generated layer has no internal
drift to find.

The genuinely interesting pattern is deliberate, generic event reuse, safely re-grounded per
consumer via `recheck` rather than a shared payload contract:

- `obligation_satisfied` (registry entity: "the obligation") is waited on by `TIM-61`, `TIM-268`,
  `FIN-131`, `FIN-134` (twice), and `SUB-165` — a payment obligation, a subscription-recovery
  obligation, and a generic deadline obligation, genuinely different entities. Each wait carries
  its **own** `recheck` clause that re-reads the actual state from that journey's own system of
  record rather than trusting a shared event payload — e.g. `SUB-165.w.recovery`: *"the obligation
  and the subscription re-read: paid, resolved otherwise, or still outstanding at the deadline"*.
  This is the correct pattern for reusing one semantic name across domains without the "same name,
  different meaning" failure Part 15 warns about, and it is applied consistently everywhere this
  event id is used — cite as the reference pattern.

**Genuine gap found: `REM-157`'s idempotency key cannot be constructed by three of its ten senders.**
`REM-157` (Remedy Confirmation) is the corpus's remedy-decision hub — receiving `h.remedy`/
`h.alternative`/`h.continue`/`h.correct`/`h.forward`/`h.remainder` handoffs from ten different
Operational Workflows and two customer-silent journeys. Its own entry evidence requires *"a
confirmed issue with an unresolved obligation and no remedy yet selected"*, and its first action,
`a.obligation`, carries `idempotencyKey: "obligation_id + issue_id + a.obligation"` — an explicit
schema dependency on an `issue_id`. Cross-checking each sender's own `entity.scope` against that
requirement:

- `REM-158` ("the remedy and **the issue** it was chosen to resolve") and `REM-160` ("the
  previously resolved **issue** and the new report") both structurally carry an issue concept —
  fine.
- `TIM-68` (State Reversal — entity scope: *"the transition itself"*), `DEC-190` (Decision
  Re-Review — *"the existing decision and the event challenging it"*), and `DAT-230`
  (Transformation Error Recovery — *"the erroneous data change operation and the records it
  affected"*) have **no issue concept anywhere in their own entity model.** Their `carries` text
  (`"the side effects that already ran and cannot be undone"`, `"what was executed, on whose
  authority and when"`, `"what acted on the wrong values, when, and what the corrected values
  are"`) never names or implies an `issue_id` — because none of these three are complaint-driven;
  they are internal corrective workflows with no customer issue behind them at all.

This is the same underlying architecture pattern already flagged as a P0 for `DEC-181` in
`HANDOFF-AND-CHAIN-AUDIT.md` (a hub whose entry contract is shaped for one caller class receiving
traffic from a structurally different class) — and the corpus already contains the correct fix,
applied inconsistently. A twelfth `REM-157` sender, `DOC-220` (Document Conflict Review), hits the
identical situation — its own `h.remedy` handoff comment reads verbatim: *"a fresh issue_id, minted
at this handoff and deterministically derived from conflict_id — DOC-220 has no issue concept of
its own, so REM-157's instance is opened here rather than carried"* — and it declares
`contract.requiredFields: ["issue_id", "obligation_id"]` on that handoff node. That is exactly the
missing piece for `TIM-68`/`DEC-190`/`DAT-230`, none of which mint a fresh `issue_id` or declare a
`contract.requiredFields` at all (checked their raw handoff nodes directly — `contract: None` on
all three, versus `DOC-220`'s populated one). The corpus's own established solution for "sender has
no issue concept" exists, is proven correct by `DOC-220`'s use of it, and simply was not applied to
the other three senders in the identical situation. **P1** — upgraded from a plausible gap to a
confirmed inconsistency against the corpus's own proven pattern, though still non-consequential
enough (no downstream consumer is shown depending on `issue_id` matching a prior complaint) to stay
below the P0 tier reserved for lost business results.

## Part 13 — technical-vs-business completion across layers

`OPS-130` (Business Outcome Verification) is the corpus's own stated arbiter for this distinction
system-wide: *"Technical processing is complete only at the infrastructure layer; business
completion requires confirmation of the state the work was intended to create."* Grep-confirmed:
its own `guardrails` are the correct set (*"No exception thrown is not business success,"* *"A job
reporting SUCCESS does not close a user or business obligation when the required state was not
produced,"* *"An outcome still pending asynchronously stays pending"*), and its `a.verify` /
`c.confirmed` split — Confirmed → `a.business-complete`; Missing or conflicting → `x.reconciliation`
(`RECONCILIATION_REQUIRED`); Still pending → `w.pending` → timeout → `x.reconciliation` — is
correctly built and matches `RUNTIME-MECHANISMS-AUDIT.md`'s own `READY_WITH_MAPPING` verdict.

### Finding 1 (P0) — `OPS-130`'s own exception exit is a confirmed corpus-wide dead end

The task brief flagged `OPS-130` as showing in-degree 2 / out-degree 0 in the relationship graph
and asked whether that is correct terminal behavior or a trapped-result problem. Read against the
actual source: **it is a trapped-result problem, but only on the exception path.**

- `x.complete` and `x.business-complete` (the two success exits) being out-degree-0 is
  architecturally sound — they are the corpus's own closing statement that the obligation the work
  existed to serve is now satisfied; nothing downstream needs to consume a plain success signal
  beyond what already happened.
- `x.reconciliation` (`RECONCILIATION_REQUIRED`) is a different case. Its own `reEntry` text says
  the exit exists specifically *"so that gap is visible rather than reported as done"* — i.e. it is
  designed as a signal something else is supposed to act on. But:
  - No `handoff` node exists anywhere in `OPS-130`'s graph — visibility ends at the exit state.
  - `RECONCILIATION_REQUIRED` does not appear as a `trigger.event`, a `wait.until` value, or a
    `measurement` event reference anywhere in the other 283 journeys (checked exhaustively against
    the full node/measurement extraction). The only two other corpus occurrences of
    "RECONCILIATION_REQUIRED"-shaped exits are `DOCUMENT_RECONCILIATION_REQUIRED` (`DOC-220`) and
    `FINANCIAL_RECONCILIATION_REQUIRED` (`FIN-140`) — each domain-local, neither the same event,
    neither consumed by `OPS-130` or vice versa.
  - `OPS-130`'s two real callers, `OPS-121` (h.verify) and `OPS-124` (h.verify), both hand off *in*
    "on technical completion being reported" — the graph confirms `OPS-130` genuinely has in-degree
    2 and, for the one outcome that matters most (technical success, business state missing),
    out-degree exactly 0.

This means: a job can report SUCCESS, `OPS-130` can correctly detect that the business state it
was supposed to produce never appeared, record `RECONCILIATION_REQUIRED` to `work_log` — and
nothing in the 284-journey corpus is wired to notice. `OPS-130`'s own reference-quality principle
("SUCCESS does not close the obligation") is enforced right up to the point where enforcement
would require reaching another party, and stops there. This is the single most important finding
in this document: the corpus's own canonical arbiter for the technical/business distinction is
itself missing the propagation step its own guardrail promises. **P0** — a business result that can
be silently lost is exactly the brief's top severity class, and this is the mechanism the entire
corpus is supposed to route through for exactly that failure mode.

### Finding 2 (P1) — a customer-initiated action's result never returns across the rollout domain

Traced via the reachability sweep: of 124 Operational Workflows, **20 have no handoff path to any
customer-silent/communicating/human-routing surface within 6 hops** (`ACC-73`, `ACC-75`, `CTL-232`,
`CTL-233`, `CTL-235`, `CTL-236`, `FIN-138`, `FIN-140`, `IDN-86`, `INT-111`, `REL-98`, `RLT-241`
through `RLT-248`, `RSK-198`, `SCH-171`, `TIM-70`). Most are legitimately internal machinery with no
customer counterpart to report to (ownership/delegation control, availability re-evaluation,
reconciliation sinks) — exactly the false-positive class the brief warns against forcing into a
finding. One is not:

`RLT-279` (Upgrade Blocker Reminder) is the *only* customer-facing journey anywhere in the rollout
domain (`rollout.ts`, `RLT-241`–`RLT-250`, `RLT-279`). Its purpose: *"Tell the holder of a blocked
target the one specific thing standing between it and the change... while there is still enough of
the preparation window left for them to clear it."* When the holder clears the blocker, `RLT-279`'s
`h.resume` hands off into `RLT-242` (Change Readiness) *"a named prerequisite cleared by the holder
inside the preparation window"* — and `RLT-279`'s own graph ends there. Its only other exits are
`x.held`, `x.moot`, and `x.unprepared` — all about the *preparation window itself*, none about
whether the change the holder unblocked actually landed.

Following the chain forward from `RLT-242` through the full rollout machinery (`h.schedule` →
`RLT-243` → `h.execute` → `RLT-244` → verification/failure branches → `RLT-245`–`RLT-250`'s
staged-rollout, pause, rollback, and reopen logic) — every one of the chain's 19 internal handoff
edges targets another Operational Workflow or an `EXTERNAL:*` placeholder
(`external-status-reconciliation`, `operational-resolution`, `human-in-the-loop-lifecycle`,
`termination-lifecycle`). **None targets `RLT-279` or any other customer surface.** `RLT-244`
(Change Execution Verification) and `RLT-248` (Rollback Verification) are the very workflows
`COMPLETION-AND-FEEDBACK-AUDIT.md` already praises as the rollout domain's own strongest instances
of the technical-vs-business discipline ("accepted/applied/verified split," "rollback-verified-not-
just-commanded discipline") — the completion discipline is real, but its result is architecturally
unreachable by the one customer who took an action to enable it. A holder who clears a blocker has
no way, anywhere in this corpus, to learn whether the change that depended on their action
succeeded, paused, or was rolled back. **P1** — not a lost payment or an irreversible action taken
on wrong authority, but a customer-initiated action whose downstream business result (including a
rollback — a `RLT-247`-classified irreversible-choice outcome) is completely silent to the person
who caused it.

### Finding 3 (works well) — `FIN-132`/`FIN-133`/`FIN-135` → `FIN-136`

Confirms `COMPLETION-AND-FEEDBACK-AUDIT.md`'s existing verdict from the cross-layer angle. All
three payment-outcome workflows hand off into `FIN-136` (Balance Reconciliation) only on a settled
outcome — `FIN-132`: *"a payment succeeding against an obligation"*; `FIN-133`: *"funds having
completed the movement this system treats as authoritative"*; `FIN-135`: *"a late-confirmed
payment success."* `FIN-136`'s own trigger evidence explicitly excludes the premature case:
`insufficientAlone: ["a payment authorised but not settled", ...]`. No other journey in the corpus
independently declares a payment-completion trigger (checked all 284 trigger events for
`payment`/`purchase`/`obligation` — only `FIN-132`–`135` and `SUB-165`, which chains off `FIN-134`'s
own failure signal, ever do). Single, consistent source of truth, correctly gated end to end.

### Finding 4 (works well) — `INC-253` → `INC-254`, mitigated vs. resolved done correctly

`INC-253.h.communicate` → `INC-254` (customer-communicating) carries *"the explicit fact that the
state is mitigated rather than resolved, so the message does not claim a fix"* — the exact
technical-completion-vs-business-completion wording discipline Part 13 asks about, applied at the
one boundary where getting it wrong would put a false "fixed" claim in front of a customer. Cite as
the incident domain's own reference instance alongside `FIN-132`–`140`.

## Part 14 — trapped or orphaned operational results

Cross-checked the reachability sweep and the flagship findings above against
`operational-workflow-contracts.json`'s `resultFeedback`/`consumerClassification` fields (the
CONSUMER-COVERAGE.md index) rather than re-deriving from zero, per the brief's instruction — that
document's classification is *within-Operational-Workflow* (does another canonical workflow
consume this one's handoff), and it holds up on every entry checked. What it does not — and was not
built to — answer is whether an "active"/well-consumed chain ever actually surfaces past the
operational layer. Two entries illustrate the gap between "has a real consumer" and "reaches
anyone who needs the result":

- `RLT-242`'s own `resultFeedback` entry (existing document) describes *"a genuine bidirectional
  relationship (RLT-242 informs the [holder]...)"* — but the relationship graph shows only one
  direction: `RLT-279.h.resume → RLT-242`. No edge runs `RLT-242 → RLT-279`, and, per Finding 2
  above, no edge exists from anywhere in the rollout chain back to `RLT-279` either. The existing
  document's own characterization of this relationship as informing the holder does not hold up
  against the graph — worth a correction in that document, not just this one.
- `REL-98` (Entity Linking): `resultFeedback` reads *"no downstream corpus consumer needs a result
  from this workflow; it establishes durable link state that other processes presumably read
  directly."* Consistent with `unconsumed-but-valid`-style reasoning applied elsewhere in the
  corpus (the `OPS-126`/`TIM-70`/`IDN-83` precedent) — a state-store pattern, not a result that
  needs delivering. No new finding; cited as a correctly-classified non-issue.

### `OPS-130`'s trapped result (Part 13, Finding 1) is this section's headline instance

Restated in this section's own terms: `OPS-130`'s `x.reconciliation` exit is an Operational
Workflow-facing Runtime Mechanism outcome that is **operationally trapped by the corpus's own
definition** — it completes (records `RECONCILIATION_REQUIRED` to `work_log`), and nothing in the
corpus consumes it as an event, a handoff, or a `measurement` reference. Counted once here, not
duplicated as a second finding.

### No other genuinely trapped operational result found beyond what the prior round already catalogued

Sampling `INT-116` (no terminal exit — already P1 in `COMPLETION-AND-FEEDBACK-AUDIT.md`), `INT-118`
(no structured consumer of its own completion signal — already documented), and `DAT-222`
(quarantine has no distinct exit — already documented) against the cross-layer question specifically
confirms the prior round's classification: all three are genuinely incomplete on their own terms,
none of them additionally reveal a *new* cross-layer propagation failure beyond what's already
filed. Reported here as confirmation, not re-filed as new findings.

## Findings summary

| ID | Finding | Layer boundary | Severity |
|---|---|---|---|
| RF-1 | `OPS-130.x.reconciliation` (`RECONCILIATION_REQUIRED`) has zero consumers anywhere in the corpus — no handoff, no event, no measurement reference. The corpus's own technical/business-completion arbiter cannot propagate the one outcome its guardrail exists to catch. | Runtime Mechanism → (nothing) | **P0** |
| RF-2 | The rollout domain (`RLT-241`–`RLT-250`) never hands a result back to `RLT-279`, its only customer-facing journey — a holder who clears a blocker cannot learn whether the change succeeded, paused, or rolled back. | Operational → Customer (silent) | **P1** |
| RF-3 | `REM-157`'s `idempotencyKey` (`obligation_id + issue_id`) cannot be constructed from three senders (`TIM-68`, `DEC-190`, `DAT-230`) with no issue concept in their own entity model — while a twelfth sender, `DOC-220`, already proves the correct fix (mint a fresh `issue_id`, declare `contract.requiredFields`) and simply wasn't applied to the other three. | Operational → Operational/Customer (communicating) | **P1** |
| RF-4 | `CONSUMER-COVERAGE.md`'s `RLT-242` `resultFeedback` note describes a "bidirectional" relationship with `RLT-279` that the graph does not actually show — worth a correction in that document. | Documentation accuracy | **P2** |
| RF-5 (works well) | `FIN-132`/`133`/`135` → `FIN-136` is a single, consistently-gated payment source of truth with no competing trigger anywhere in the corpus. | Operational → Customer (silent) | reference pattern |
| RF-6 (works well) | `INC-253` → `INC-254` explicitly distinguishes mitigated from resolved in the customer-facing handoff payload itself. | Operational → Customer (communicating) | reference pattern |
| RF-7 (works well) | Generic event names shared across domains (`obligation_satisfied`, etc.) are safely re-grounded per consumer via each wait node's own `recheck` clause rather than a trusted shared payload — the correct mitigation for the "same name, different meaning" risk. | corpus-wide | reference pattern |

**Totals: 1 P0, 2 P1, 1 P2, 3 reference-pattern citations.**
