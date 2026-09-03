# Silent Lifecycle States — handoff and re-entry audit

124 handoff edges and 108 exit nodes across the 64 states. This document covers receiver-side
construction (can the target actually build its own instance from what it's handed), ownership
transfer, late-event handling, the reopen-vs-new-episode taxonomy, terminal-state discipline, the
correction path, and cycle risk.

## Receiver-side construction: the headline finding was clustering, not scatter

**Round 2 update: 14 of these 15 findings are closed.** Round 1 found 15 of the 124 handoffs
(5 P0, 10 P1) carrying a provenance gap — the target's own declared instance key or
contract-required field not present in what the sender's `carries`/`contract` supplied — and the
important structural fact was that they collapsed into just 4 distinct receiving targets, not 15
independent problems. The repair round fixed the sink, not the senders, exactly as recommended
below, for 3 of those 4 clusters outright and half of the fourth:

| Receiving state | Missing field | Senders (this round's 64, plus cross-round where noted) | Count | Status after round 2 |
|---|---|---|---|---|
| **ACC-79** (Capability Restoration) | `restoration_case_id` | ACC-78 (`h.restore`), FIN-136 (`h.restore`), IDN-90 (`h.recover`), IDN-90 (`h.lift`) | 4 | **Fixed, all 4** — one minting convention documented once in ACC-79's own `entity.note`, applied identically by all four senders |
| **IDN-90** (Suspected Account Compromise) | `incident_id` | IDN-87 (`h.security`), IDN-88 (`h.security`) | 2 | **Fixed, 1 of 2** — IDN-88 now resolves `incident_id` via the account's already-open IDN-90 instance; IDN-87 carried no P0 in round 1 and was deliberately left for a follow-up pass rather than expanding this round's fix scope to a second journey (remaining P1, see `LIFECYCLE-STATES-AUDIT.md`'s IDN-87 entry) |
| **FUL-145** (Fulfillment Exception Recovery) | `exception_id` | FUL-143 (`h.exception`), FUL-144 (`h.exception`) | 2 | **Fixed, both** — each handoff now mints `exception_id` deterministically at the handoff |
| **FUL-149** (Delivery Acceptance Finalization) | `delivery_id` | FUL-144 (`h.confirm`), FUL-147 (`h.confirm`) | 2 | **Fixed, both** — each handoff now mints `delivery_id` deterministically at the handoff |
| REM-151 (outside this round's 64 — a communication-round journey) | `issue_id` | FUL-149 (`h.issue`) — a fourth cumulative instance of the same pattern into this target, counting the three found in the communication round | 1 (this round) | **Fixed** — `h.issue` now mints `issue_id` at the handoff |
| ACQ-05 | `lead_id` | ACQ-01 (`h.qualification`) | 1 | **Fixed** — `h.qualification` now mints a fresh `lead_id`, deterministically derived from the reconciled profile's own account/person identity |
| ACT-17 (outside this round's 64) | `use_case_id` | ACT-16 (`h.adoption`) | 1 | **Fixed** — `h.adoption` now mints `use_case_id` explicitly at the handoff |
| RET-23 / RET-29 (self-contained, not a receiver-clustering case) | `subscription_id` | Each journey's own contract references a field it never declares itself — a sender-side gap, not a receiver-provenance gap | 2 | **Fixed, both** — idempotencyKeys and handoff contracts now key on each journey's own declared instance key (`account_id + relationship_id` for RET-23, `relationship_id` for RET-29) instead of the undeclared `subscription_id` |

**The one remaining gap (IDN-87's `h.security` → IDN-90) is the deliberate exception, not an
oversight.** IDN-87 carried no P0 in round 1 (it was already `READY_WITH_MAPPING`), and this
round's own scope discipline — fix P0s, extend to a P1 only when it is the identical defect
inside the *same* journey as a P0 just fixed — argued against widening the fix into a second
journey on a P1-only basis. The convention IDN-88 now uses (resolve `incident_id` via the
account's already-open IDN-90 instance) is proven and ready to apply to IDN-87 in a follow-up
pass.

Original recommendation, now executed for 3.5 of 4 clusters: **fix the clustering receiver, not
each sender.** Adding `restoration_case_id` resolution to ACC-79's own receiving contract (one
minting convention, documented once) resolved 4 findings at once; the same approach resolved
IDN-90 (partially), FUL-145, and FUL-149 without requiring four separate, uncoordinated sender
changes that risked inventing four different shapes for the same missing field.

## Ownership transfer

Every one of the 124 handoffs is modeled as a full ownership transfer (`ownershipTransfer: true`
in `lifecycle-state-contracts.json` — this round found no partial-transfer handoff shaped
differently from a full one, unlike two states that model a genuinely *partial* transfer through
a dedicated action rather than the handoff mechanism itself: ACQ-06's `a.reconcile` transfers only
the flagged commitment's reconciliation, retaining the eligibility fact itself; ACT-16's
`a.spin-off` transfers only a mandatory sub-requirement, retaining onboarding closure). 33 of the
124 handoffs (27%) explicitly suppress queued or in-flight work as part of the transfer
(`suppresses` populated) — the strongest examples are ACQ-03 and ACQ-08, whose `suppresses` lists
name queued reminders, scheduled retries, and lower-priority CTAs by category rather than leaving
suppression to be inferred.

## Late-event handling

Explicit late-event reconciliation — an event arriving after a state has already concluded,
correctly reconciled against the existing record rather than ignored or blindly overwriting it —
is modeled in a minority of states but every instance found is handled correctly:

- **SCH-179** (`s.g4`): a late attendance event after `NO_SHOW` was recorded reconciles against
  the record rather than being dropped — "a late system update is a reason to correct the record,
  not evidence that the record was right."
- **IDN-89** (`s.g3`): propagation carries origin and version specifically so a stale update
  arriving late cannot restore a previous value — round 1 found the `origin`/`version` fields the
  rule depends on were not declared attributes (a P1 finding on IDN-89 itself); round 2 declared
  them (`change_origin`, `change_version`).
- **SUB-165**: a payment arriving after the grace deadline reconciles against current relationship
  state, never applied retroactively (backed by a named guardrail, `end_before_grace_deadline`).
- **REL-93** / **SUB-170**: neither state's ending erases or contradicts what a later-discovered
  obligation legitimately created during the active period is owed.

No state was found mishandling a late event once one was checked for; the one gap found (IDN-89 —
the late-event rule had no data to run against, not that the rule was wrong) is closed as of
round 2.

## Reopen taxonomy: re-entry is the overwhelming default

Of 108 exit nodes across the corpus, **only 2 are graph-`terminal: true`** — `ACQ-05.x.terminal`
and `ACQ-10.x.terminal`, both narrowly scoped (a lead/account structurally cannot be served, ever)
and both carry an explicit note that even this requires a *rule* to change, never new evidence
about the same account. The other 106 are all re-enterable, and this audit classified how each
one's own `reEntry` text describes reopening:

| Reopens as | Count | % of non-terminal exits |
|---|---|---|
| `new-episode` | 79 | 75% |
| `new-entity-instance` | 14 | 13% |
| `resume-existing-instance` | 9 | 8% |
| `correction` | 3 | 3% |
| `recalculation` | 1 | 1% |

(Classification is mechanical, by keyword match against each exit's own `reEntry` prose — see
`build/build-contracts.mjs`'s `reopensAsFromText` — so treat the exact split as directionally
representative rather than independently re-verified per exit; the underlying prose itself was
read for every state during this audit.)

The dominant shape (`new-episode`, 75%) reflects the corpus's own consistent discipline: a further
occurrence of the same trigger — another decline, another suspension, another orphaned
relationship — is treated as its own instance with its own history, never as resuming or
overwriting the one that just closed. The `new-entity-instance` group (13%) is concentrated in the
structural-vs-continuing-relationship domain (REL-93, SUB-170, SCH-176, TRM-108 all explicitly
state a later relationship/booking/account is a *new* one, never a revival). `resume-existing-
instance` (8%) is reserved for genuinely paused-not-ended states (REL-91's `x.pending`, SCH-172's
`x.expired` — a live requester can retry against the same slot). The single `recalculation` case
(FBK-48-family states) and three `correction` cases are the smallest categories, matching the
round's own finding that most re-entry is a fresh episode, not a correction of the prior one.

## Terminal-state discipline

The two true terminal exits are the corpus's *narrowest* possible terminality, not its broadest:

- **ACQ-05.x.terminal**: reserved for "the account can never be served — outside the market
  permanently, structurally not a fit, or prohibited," with an explicit note that even this
  requires "a change to the rule rather than to the account."
- **ACQ-10.x.terminal**: reserved for `NOT_FIT`, with the same rationale — "what would have to
  change is what we sell, not what this account decided."

Every other final-sounding state name in the corpus — `x.former`, `x.closed`, `x.cancelled`,
`x.ended`, `x.recovered`, `x.terminal` (REL-100's *policy* end-state, which is **not**
graph-terminal despite the name) — is deliberately kept open. TRM-108's own reasoning is the
sharpest statement of why: "deleting them is a separate lifecycle with its own request, its own
scope and its own authority" — terminality of a *relationship* is never conflated with deletion of
a *record*.

## The correction path

Append-only correction is universal: every history-bearing write across all 64 states uses
`mode: "append"`, and six states name the reasoning explicitly rather than leaving it implicit
(REL-92, REL-93, SUB-166, SUB-168, TRM-105, TRM-108). Where a state models an actual reversal
rather than a fresh append, it is narrow and explicit, never a blanket "undo":

- **ACQ-06**'s `a.reconcile` flags a commitment for its own reconciliation and explicitly never
  cancels, reduces, or reverses it directly.
- **REM-156** (Corrective Reperformance) is the one state whose entire purpose is correction, and
  its `a.preserve` step exists specifically so the original incorrect outcome is never rewritten
  as though it had always been right.
- **IDN-90**'s `s.g4` explicitly routes unauthorized financial/business actions to their own
  dispute lifecycles rather than reversing them from inside a security incident.

No state was found silently rewriting history where a correction was called for; the one
correction-adjacent P1 gap in the corpus (IDN-89's undeclared `origin`/`version` fields, load-
bearing for `s.g3`'s late-arrival discard rule) was a data gap, not a design gap — the rule itself
was always right — and is closed as of round 2: `change_origin` and `change_version` are now
declared required attributes.

## Cycle risk

Two explicit loop-budget guards were found, both well-placed and both the only examples of their
kind in the corpus:

- **SCH-178**'s `a.interrupt` carries an `attemptBudget` bounding the interrupt/resume cycle so an
  occurrence that keeps stopping reaches a limit rather than looping indefinitely.
- **SUB-162**'s `a.note` carries an `attemptBudget` bounding the prerequisite-change-noting loop
  during a future-dated activation's wait.

No unbounded cycle was found elsewhere in the corpus — every other wait-then-reassess shape
(SCH-177, SUB-168, SUB-169, TRM-105, TIM-62's revalidate-from-now family) resolves in a single pass
per fired timer rather than looping, so a bounded-budget guard was not needed there. The two guards
found are correctly scoped to the two states whose own shape (repeated interruption; repeated
prerequisite changes over a long future-dated wait) could otherwise cycle.

## Cross-reference

Per-handoff detail (`node`, `target`, `requiredContext`, `ownershipTransfer`, `suppressSource`)
and per-exit detail (`exit`, `terminal`, `reopensAs`, `reopenEvent`) are both machine-readable in
`lifecycle-state-contracts.json`'s `handoffs` and `reEntry` arrays for all 64 states.
