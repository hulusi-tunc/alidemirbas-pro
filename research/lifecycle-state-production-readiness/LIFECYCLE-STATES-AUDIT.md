# Silent Lifecycle States — production readiness audit

Scope: could a real company implement each of these states safely in its own lifecycle/
orchestration engine — instance identity, state authority, transitions, ownership, conflict,
re-entry, terminality, correction, timing, handoffs, idempotency, observability — without
inventing missing state semantics? This is the third round on the customer-facing canonical
corpus, after the communicating-journey audit and its gap-closure round. Nothing in `src/`,
`production/`, `search/`, or `seo/` is touched this round — audit only, per the brief.

## Corpus confirmation — the count is 64, not 67

This round's brief states the corpus as 67 Silent Lifecycle States, carried over from the
`validate:canonical` summary line ("surfaces customer 135 (68 communicating / 67 silent)") that
this session itself reported at the end of the communication-layer round. Re-deriving the set
directly from `src/canonical/surface.ts`'s `surfaceOf()` — the same function the site and the
validator both use — gives **64**, not 67, and the gap is explained, not a miscount:

- The `validate:canonical` summary's "67 silent" is `surface === "customer" && !sends` — every
  customer-surface journey that sends no message, full stop. That count does not distinguish
  *why* a journey sends nothing: whether it sends nothing because it carries no orchestration at
  all (truly silent), or because it routes to a person instead of sending a message
  (`routesToHuman`, still fully orchestrated).
- **ACQ-04, ACT-11 and RET-24** are exactly the three journeys that make that difference visible.
  They fall inside the "67 silent" bucket by that flag (`silent: true` in
  `production/surface-assignment.json` for all three, confirmed by direct inspection), but they
  are not silent in any functional sense: all three carry full `contact`, `channelStrategy` and
  `orchestration.touches`, and all three were already fully audited, contracted, and — where
  gaps existed — fixed in the communication-layer round, where they were treated as the
  "3 human-routing-only Customer Journeys" this round's own brief names as a separate bucket.
  Auditing them again here, as silent states, would both violate the brief's "do NOT audit
  message-sending journeys again" instruction in spirit (they are orchestrated journeys, just not
  message-sending ones) and duplicate work already done and already committed
  (`research/journey-production-readiness/implementation-contracts.json` has a contract for each).
- Excluding those three from this round's scope leaves **64** genuinely silent states — customer-
  surface journeys with `channels: []`, no orchestration, no contact block, no channel strategy —
  which is what `surfaceOf()` itself would call `!sends && !routesToHuman`, a distinction
  `surface.ts` already computes internally but which the top-line "67 silent" figure quoted
  around this repository has never separately reported.

**This audit covers all 64.** If the strict 67 figure (this round's brief) is what a downstream
process needs, it is the 64 audited here plus the 3 already covered in the communication round's
own artifacts — not 3 unaudited journeys.

**Leakage check:** none of the 64 send a message channel, none route to a human channel
(`task`/`sales`), none are in `MECHANISM_IDS`, and every one resolves to `surface: "customer"` in
`production/surface-assignment.json`. Cross-checked against the same derivation used for the
communication round — zero mechanism ids, zero operational-workflow ids, zero message-sending or
human-routing journeys found among the 64.


## Architecture findings

### Readiness distribution

| Verdict | Count | % |
|---|---|---|
| READY | 0 | 0% |
| READY_WITH_MAPPING | 27 | 42% |
| NEEDS_CONTRACT_WORK | 37 | 58% |
| NEEDS_CANONICAL_CHANGE | 0 | 0% |

**Zero states required a change to the canonical graph itself.** Every gap found this round —
idempotency-key references, missing handoff contract fields, undeclared data attributes, missing
`ConflictRef` declarations — is resolvable at the implementation-contract layer, exactly as the
communication round found. No `READY` state was reached by any of the 64: even the six states with
literally no findings (`GAPS: none found` — CON-32, CON-38, FUL-150, REL-93, SCH-178, plus ACQ-07
whose mechanical scan confirmed no violation) are graded `READY_WITH_MAPPING` rather than `READY`
because the *contract* — the JSON artifact a real implementation would consume — still needs to be
written; the schema in this round distinguishes "the graph needs nothing more" from "a
production-ready contract already exists," and none of the 64 has the latter yet.

### Priority counts

| Priority | Count |
|---|---|
| P0 | 41 |
| P1 | 15 |
| P2 | 46 |
| **Total findings** | **102** |

(Counts are generated directly from `lifecycle-state-contracts.json`'s `gaps` arrays — see
`READINESS-MATRIX.md`'s own totals line, which is produced by the same script and will not drift
from this document.)

**Readiness-verdict methodology.** A state is `NEEDS_CONTRACT_WORK` if it carries **any**
unresolved P0 finding, regardless of how mechanically simple the eventual fix is, and regardless
of whether the P0 is this state's own defect or a P0 it inherits from an unsatisfiable handoff
into it (a one-line idempotencyKey field correction is still a P0 — a real implementation would
silently double-write state on retry, or fail to construct a receiving instance, until it is
fixed). A state with only P1/P2 findings, or none, is `READY_WITH_MAPPING`. This is applied
uniformly across all 64 states in this document, in `READINESS-MATRIX.md`, and in
`lifecycle-state-contracts.json` (a script-enforced consistency check — any P0 gap forces
`NEEDS_CONTRACT_WORK`, and `NEEDS_CONTRACT_WORK` requires at least one P0 gap — runs over the full
contract set and passes with zero violations). Five states were corrected in place to this
uniform rule after being written up under a looser draft convention: ACQ-02, ACQ-05, ACQ-06 and
ACQ-10 (each carrying a single, unambiguous idempotencyKey substitution, initially graded
`READY_WITH_MAPPING` on the theory that the fix is one line) and IDN-90 (whose own idempotency is
clean but which inherits a P0 handoff gap into ACC-79, initially graded `READY_WITH_MAPPING` on
the theory that the defect belongs to the sender side, not this state). All five write-ups say so
explicitly in their `WHY` sections.

### Top 15 findings

1. **The idempotency-key defect the communication round fixed on 36 message-sending journeys is
   at least as prevalent on the silent side.** 41 P0 findings across 37 of 64 states (58%) — the
   large majority are `idempotencyKey` strings referencing a field the state's own
   `implementation.attributes` never declares. This is the same defect class, unfixed here,
   confirming it was a corpus-wide authoring-template problem rather than a communication-specific
   one.
2. **The defect has (at least) six distinct shapes, not one**, worth distinguishing because they
   need different fixes: (a) **wrong-field substitution** — the most common, e.g. `person_id`/
   `account_id`/`subscription_id` used where the state's real key differs (ACC-71, ACQ-05, TRM-105,
   ~20 more); (b) **total absence** — writes with no `idempotencyKey` at all (SCH-174, SCH-177,
   TIM-65); (c) **malformed pseudo-keys** — literal prose fragments instead of field references,
   e.g. `"renewal_cycle_id + grace state"` (SUB-165, the single worst-documented state in the
   round); (d) **premature identifier** — keying on a field (`relationship_id`, `booking_id`) that
   structurally does not exist yet at that point in the journey (REL-100, SCH-173); (e) **dropped
   composite-key component** — half of a declared composite instance key silently missing from
   every action's key (SCH-175 drops `reschedule_request_id`, TRM-107 drops `closure_id`); (f)
   **wrong-granularity mismatch** — a per-obligation field keying an account-level action
   (TRM-108).
3. **`subscription_id` is independently undeclared-yet-referenced in three unrelated states**
   (RET-23, RET-29, SUB-161) — not three isolated typos but a single systemic gap: this token is
   evidently assumed to exist corpus-wide and was never added to `implementation.attributes` on
   any of the three.
4. **A single shared-target handoff gap has four independent senders.** ACC-78's `h.restore`,
   FIN-136's `h.restore`, and both of IDN-90's handoffs (`h.recover`, `h.lift`) all send into
   ACC-79 without carrying `restoration_case_id` — the field ACC-79's own `entity.instanceKey`
   requires and cannot construct from any of the four. Fixing ACC-79's receiving contract once
   (mint or require `restoration_case_id` explicitly) closes all four instances at once; fixing
   each sender independently would not.
5. **The "revalidate from now, never from the scheduling-time snapshot" principle is the
   strongest, most consistently applied architectural idea in this half of the corpus.** Found,
   independently phrased but structurally identical, in SCH-177 (pre-service revalidation),
   SUB-162 (future-dated activation), SUB-168 (scheduled cancellation execution), SUB-169
   (suspension restoration), SUB-166 (scheduled plan-change execution), TRM-105 (responsibility
   handover), and TIM-62 (overdue-timer re-read) — seven states across four domains
   (scheduling/subscription/time/terminal), every one of them re-reading authoritative current
   state before acting on a fired timer rather than trusting what was true when the job was
   scheduled. This deserves to be named and preserved as a house rule, not treated as seven
   coincidences.
6. **Behavioral-inference triggers are validated before ever becoming conclusive, with zero
   exceptions found across all 64 states.** IDN-90 (suspected compromise) gates every conclusive
   action behind investigation; RET-21/RET-22/RET-23 all require corroboration beyond a raw
   behavioral signal; ACQ-07 re-validates credibility before downgrading; TIM-65 explicitly bars
   activity from extending a grace period; TRM-108's `a.guard` is the single clearest statement in
   the corpus that a terminal state is never reopened by a behavioral signal (a stale login, a
   queued onboarding event) — only by an authoritative event on its own lifecycle. This is the
   silent-state version of the communication round's "engagement is never conclusive by itself"
   rule, and it holds without a single counter-example.
7. **Terminal-state discipline is almost total.** Of 64 states, only two exits anywhere
   (`ACQ-05.x.terminal`, `ACQ-10.x.terminal`) are graph-`terminal: true`, both narrowly scoped
   (NOT_FIT / structurally-can-never-be-served) with explicit "even this reopens on a rule change,
   not on new evidence" reasoning. Every other final-looking exit (`x.former`, `x.closed`,
   `x.cancelled`, `x.recovered`, `x.ended`) is deliberately non-terminal with explicit reEntry
   semantics distinguishing resume-existing-instance from new-episode from new-entity-instance.
   Re-entry is the default; terminality is the rare, justified exception.
8. **Correction/append-only discipline is universal — zero counter-examples found.** Every
   history-bearing write across all 64 states uses `mode: "append"`; not one state overwrites a
   prior value where history matters (REL-93, REL-92, SUB-166, SUB-168, TRM-105 and TRM-108 all
   name this explicitly as the reason a rewrite would be wrong, not just as an implementation
   detail).
9. **Structured conflict/exclusivity declarations (`contact.competition`) are rare and, where they
   exist, well-built.** Only two working examples in this batch: ACQ-07/ACQ-08's `purchase-intent`
   exclusionGroup (both sides declared, precedence correctly ordered — a completed destination
   always outranks a decay judgment) and SUB-167's `relationship-continuity` group (one side
   declared; the renewal-decision counterpart was outside this round's scope to verify). Every
   other real cross-state relationship this audit found — ACC-78/TIM-65, ACC-78/IDN-90, RET-23/
   RET-24 — is documented only as a prose `distinctFrom` boundary, never as a structured,
   mechanically-checkable rule. This is a genuine maturity gap in the corpus's conflict modeling,
   though closing it is contract-layer work, not a canonical-graph change.
10. **Domain-cluster quality is bimodal, not evenly distributed.** The SCH-172 through SCH-175
    cluster (temporary hold, reservation validation, readiness, reschedule) is the corpus's worst:
    4 of 4 `NEEDS_CONTRACT_WORK`, every one for an idempotency defect. The SUB-166 through SUB-170
    plus TIM-62 cluster (plan change, cancellation, scheduled termination, suspension, relationship
    end, overdue recalculation) is the corpus's best: 6 of 6 `READY_WITH_MAPPING`, several with
    zero findings at all. Both clusters share an author and a design language; the difference reads
    as inconsistent implementation-layer attention within one team, not a systemic domain problem.
11. **The terminal/closure domain is a second, smaller weak cluster: 4 of 4 states audited
    (TIM-65, TRM-105, TRM-107, TRM-108) are `NEEDS_CONTRACT_WORK`**, every one for an idempotency
    defect (total absence, wrong-field, or dropped/mismatched key component) despite otherwise
    being some of the most carefully reasoned states in the round (TRM-108's reactivation guard,
    TRM-107's verify-don't-trust external-termination discipline). Worth prioritizing in the repair
    round precisely because the design is already right and only the contract layer is missing.
12. **Router-pattern states (no exit nodes, every path a handoff) are a recognized, non-defective
    shape** — carried over directly from the communication round's own precedent
    (`router_journey`). Found at ACQ-02, FUL-142, FUL-145, REM-156, RET-27, and SUB-165: every one
    correctly resolves into a receiving journey rather than terminating locally.
13. **`class: "failure"` exits are used narrowly and correctly**, distinguishing a failure of the
    *attempt* from a failure of the underlying entity/relationship: SCH-175's `x.original-stands`
    (a reschedule that couldn't find a replacement leaves the customer exactly as well off as
    before) and SUB-167's `x.blocked` (a cancellation blocked by a valid requirement leaves the
    relationship, and its entitlements, completely unchanged). Neither conflates "this attempt
    didn't work" with "something is now wrong."
14. **Handoff contract blocks (`contract.requiredFields`) are the single most common finding by
    volume but the least severe by consequence** — 46 P2 findings, the large majority missing
    contract blocks on outbound handoffs whose target state was not itself part of this round's
    64 (so the receiving side's actual needs are unverified, not confirmed absent). Where the
    receiving state *was* in this round's own scope (the ACC-79 cluster at #4 above; SCH-173→
    SCH-174's `booking_id` timing), the same finding is elevated to P0/P1 because the mismatch was
    independently confirmable both ways.
15. **State authority is overwhelmingly `authoritative-system` or a correctly-gated
    `behavioral-inference`, with no instance found of an inferred/behavioral signal silently
    becoming conclusive without validation** — the specific failure mode this round's data model
    was designed to catch (see finding 6) never actually occurred in the 64 states audited.

### Cross-library patterns worth naming once, not per-state

- **The revalidate-from-now family** (finding 5) is the closest thing this corpus has to an
  unwritten architectural rule. It should be written down — as a house guideline if not a
  validator — since every wait node whose `onTimeout` fires directly into a state-mutating action
  without an intervening re-read is a candidate for the same defect this pattern exists to
  prevent.
- **The idempotency defect's sub-shapes** (finding 2) suggest the original authoring process
  filled in `idempotencyKey` values from a small set of common tokens (`person_id`, `account_id`,
  `subscription_id`, `order_id`, `booking_id`, `contact_point_id`) somewhat independently of each
  state's own declared `instanceKey` and `implementation.attributes` — the same root cause the
  communication round diagnosed, now confirmed to extend across the whole canonical corpus rather
  than being scoped to message-sending journeys.
- **Ownership-boundary discipline between a contractual/structural record and its downstream
  consequence is consistently well-drawn**: SUB-169/SUB-170 (contractual state vs. access
  lifecycle), REL-91/REL-92 (structural link vs. continuing agreement), ACQ-06 (eligibility fact
  vs. commitment reconciliation), IDN-89 (identity attribute vs. dependent credential/permission
  lifecycles). None of the 64 states was found silently absorbing a downstream consequence it does
  not own.

### Recommended implementation-contract architecture (recap)

The schema in `lifecycle-state-contract.schema.ts` reuses five sections from the communication
round's contract vocabulary where the underlying concept is genuinely the same
(`RequiredDatum`, `SourceOfTruthRef`, `ConfigRef`, `TestScenario` shape, and the P0/P1/P2 priority
model), adds four sections this round's own model requires and the communication round never
needed (`InstanceIdentity.dedupePolicy`, `Transition.kind`/`authority`, `OwnershipRef`, `ReEntryRef`
with its `reopensAs` taxonomy), and drops two concepts that do not apply to a state that sends
nothing (`channelPolicy`, `contact.competition`'s pressure-class fields — kept only as a bare
`ConflictRef.conflictsWith` list). This keeps the two contract vocabularies composable — a journey
that both sends and orchestrates state (the 3 human-routing journeys excluded from this round's
scope) can in principle be described by fields from both schemas without duplication.

### What this round did not do

Per the brief: no P0 was fixed, no canonical file was touched, no production file was touched. The
41 P0 and 15 P1 findings above are recommendations for the separate repair round the user has
already indicated will follow this audit, in the same shape as the communication round's own
audit → repair sequence.


## All 64 states, individually

## ACC-71 — Entitlement Qualification

READINESS: NEEDS_CONTRACT_WORK

WHY:
The grant/pending/denied split is exactly right — "qualified but capacity-blocked" is correctly
kept out of "denied" (s.g5), and reconciliation against an existing grant prevents the double-
expiry/double-revocation problem the entity note names. What blocks safe implementation is
idempotency: every action's key (`a.evaluate`, `a.reconcile`, `a.grant`) references `person_id`,
a field this state's own `implementation.attributes` never declares (`account_id +
entitlement_key` is the real instance key) — the same systemic template-copy defect the
communication-layer round found and fixed on 36 journeys, here unfixed on the silent side.

STATE AUTHORITY:
- entitlement basis established (t.basis) → authoritative-system (`source: "authoritative"`,
  explicit `insufficientAlone` list rejecting authorized-not-settled and eligibility-not-purchase)
- c.satisfied's PENDING vs DENIED split → deterministic-rule reading the authoritative basis

INSTANCE:
Scope: person or account plus the specific entitlement, at its own scope and validity
Key: account_id + entitlement_key
Dedupe policy: reject-duplicate (a.reconcile is the explicit merge path for "already held")
Concurrency: one-active-per-key

TRANSITIONS:
enter (t.basis, authoritative) → c.existing → {a.reconcile: resolve, existing grant | c.satisfied}
→ {a.grant: resolve | x.pending: no-action | x.denied: resolve-negative} → h.provision: handoff

DATA:
- account_id, entitlement_key — instance key
- basis, scope, validity — a.evaluate / a.grant
- entitlement_log — every action, append

SOURCE OF TRUTH:
- the authoritative basis for a right → whatever business system records purchases/plans/roles/
  contracts (unnamed in the graph, correctly — the graph states the criteria, not a vendor)

CONFIG / TIME: none — no waits in this state.

OWNERSHIP: ownsNextAction: true until h.provision; transfersOn: [h.provision] (to ACC-72, outside
this round's 64).

CONFLICT / PREEMPTION: none found — ACQ-06's distinctFrom is a boundary statement (eligibility vs.
entitlement are different questions), not a live conflict; no sibling state can be open on the
same account_id + entitlement_key by construction (concurrency: one-active-per-key).

HANDOFF:
- h.provision → ACC-72; carries the entitlement, scope, validity, and the explicit fact that
  nothing is provisioned yet. ACC-72 is outside this round's 64 — its own instance key was not
  re-derived here, so whether it can be constructed from what h.provision carries is unverified
  and out of scope for this round (its own future audit round should confirm this).

RE-ENTRY / TERMINALITY:
No exit is terminal. x.pending and x.denied are deliberately kept distinct (s.g5) because their
re-entry routes differ — x.pending resumes on the named requirement being met (resume-existing-
instance), x.denied re-opens as a new-episode evaluation "on a different basis." Well-modelled;
no over- or under-terminalization found.

OBSERVABILITY:
enteredBy: entitlement_log (append-only, every action writes it) — good. No `currentOwner`/
`expiresAt` fields exist because none apply (no wait, no ownership transfer before h.provision).
Adequate for what this state actually models.

OUTCOMES:
resolution: x.reconciled, h.provision (granted) — neutral: x.pending — failure: x.denied

TEST CASES:
- entry: authoritative basis → a.grant → h.provision
- insufficient-evidence: payment authorized, not settled → does not enter (insufficientAlone)
- duplicate-event: a.grant retried for the same basis → **as written, cannot be verified idempotent
  — see gaps**
- concurrent-instance: two different entitlement_keys on the same account are independent
  instances by construction

GAPS:
- P0 [idempotency] a.evaluate/a.reconcile/a.grant idempotencyKeys all reference `person_id`, a
  field absent from this state's required attributes (account_id + entitlement_key is the actual
  key) — the same corpus-wide idempotencyKey template-copy defect closed on the communicating-
  journey side, unfixed here. A same-basis retry of a.grant cannot be verified to grant once.
- P2 [correction] the entity note references "two expiries and two revocations" as the failure
  mode reconciliation prevents, implying a revocation concept exists, but no revocation/correction
  path is modelled in this state itself (plausibly out of scope — a wrongly-granted entitlement's
  reversal may belong to ACC-72 or a dedicated correction journey not in this round's 64).

---

## ACC-78 — Access Suspension

READINESS: NEEDS_CONTRACT_WORK

WHY:
The reversibility discipline is real: `s.g1` states suspension is not termination, `s.g4` states a
suspension without a review point is an unauthorised termination, and the wait is bound to
`review_point_at` rather than an invented duration. What blocks safe implementation: the same
idempotencyKey defect (`person_id`, undeclared) on all four actions, and its handoff into ACC-79
(`h.restore`) does not carry the `restoration_case_id` ACC-79's own instance key requires — the
receiver's instance cannot be mechanically constructed from what this handoff supplies.

STATE AUTHORITY:
- suspension decision (t.suspension) → authoritative-system (explicit rejection of "an outage,
  which removes access without anyone deciding to" as insufficient evidence — correctly refuses to
  let an operational incident masquerade as an authorised suspension)
- c.outcome's resolved-vs-terminal split, c.review's extend/lift/escalate split → human-decision
  (a review, not a rule — the graph never claims otherwise)

INSTANCE:
Scope: account or person plus the specific capability scope being restricted
Key: account_id + capability_scope
Dedupe policy: reject-duplicate; concurrency: one-active-per-key

TRANSITIONS:
enter (t.suspension, authoritative) → c.partial → {a.preserve | a.full} → w.suspension (bound to
review_point_at) → on-event: c.outcome → {h.restore | h.terminate}; on-timeout: c.review →
{a.extend: progress, new instance | h.restore | h.escalate}

DATA: account_id, capability_scope — instance key. reason, review_point_at, preserved_capabilities
— a.scope. suspension_log — every action, append.

SOURCE OF TRUTH: the suspension reason and the review decision → whatever system recorded the
payment/security/policy/operational/administrative decision (unnamed in the graph, appropriately).

CONFIG / TIME: `access_suspension.suspension` — attribute-bound to `review_point_at`, required:
true. Properly config-shaped; no invented duration.

OWNERSHIP: ownsNextAction: true while open; transfersOn: [h.restore → ACC-79, h.terminate → ACC-74,
h.escalate → OWN-55 (operational, outside this round)].

CONFLICT / PREEMPTION: TIM-65 (grace) is `distinctFrom` by construction — grace continues a right
whose validity has *ended*; suspension restricts one that is still valid. The two cannot describe
the same fact simultaneously, so no real conflict exists between them, only a boundary.

HANDOFF:
- h.restore → ACC-79: carries which capabilities were blocked/why and the explicit instruction
  that restoration revalidates rather than replays — but ACC-79's own instance key is
  `account_id + restoration_case_id`, and `restoration_case_id` is not among this state's own
  vocabulary (declared, derived, or in the handoff's own carries list). The receiver's instance
  cannot be constructed from this handoff as written.
- h.terminate → ACC-74, h.escalate → OWN-55 — both outside this round's 64, not re-verified here.

RE-ENTRY / TERMINALITY: no exit is terminal (x.extended is the only exit node; h.restore/
h.terminate/h.escalate are handoffs, not exits). x.extended's re-entry is explicit: "the extension
runs as its own instance with its own end" — correctly modelled as a new-episode, not a resumed
one, avoiding an infinite single-instance loop.

OBSERVABILITY: enteredBy: suspension_log (append, every action). currentOwner: implicit (no field
names who is reviewing at c.review's human-decision point — a real observability gap, see below).
expiresAt: review_point_at, present. supersededBy: n/a.

OUTCOMES: resolution: h.restore, x.extended (until its own resolution) — failure: h.terminate —
diagnostic: h.escalate (undecided at review).

TEST CASES:
- entry: authoritative suspension decision → a.scope → a.preserve/a.full → w.suspension
- timeout: review_point_at passes with nothing resolved → c.review → extend/lift/escalate
- handoff: h.restore fires → **cannot construct ACC-79's instance as written — see gaps**
- re-entry: a.extend → x.extended → new instance with its own review point

GAPS:
- P0 [idempotency] a.scope/a.preserve/a.full/a.extend idempotencyKeys reference undeclared
  `person_id`; real key is account_id + capability_scope.
- P0 [handoff] h.restore → ACC-79 does not carry or mint `restoration_case_id`, which ACC-79's own
  entity.instanceKey requires — the receiving instance cannot be constructed as written.
- P2 [observability] c.review's human decision (extend/lift/escalate) names no reviewer/owner
  field — a company implementing this cannot answer "who is deciding this, and have they seen it"
  without an attribute this state doesn't declare.

---

## ACC-79 — Capability Restoration

READINESS: NEEDS_CONTRACT_WORK

WHY:
The core discipline — "previous access is not a current access right," restoration re-evaluates
every requirement now rather than replaying a snapshot — is the cleanest example of correct
silent-state design in this batch, and the full/partial/none split with named exceptions
(`s.g4`: "a partial restoration names what did not come back") is exactly the shape a company
needs. The blocker is entirely upstream: this is the target of ACC-78's and FIN-136's malformed
handoffs (see their own GAPS) and its own idempotencyKey defect (`person_id`, undeclared).

STATE AUTHORITY:
- restoration condition satisfied (t.condition) → authoritative-system, explicitly rejects "time
  passing on a restriction whose reason was never addressed" as insufficient
- c.requirements' full/partial/none split → deterministic-rule, re-evaluated fresh per capability

INSTANCE:
Scope: person or account plus each capability being considered for restoration
Key: account_id + restoration_case_id
Dedupe policy: reject-duplicate; concurrency: one-active-per-key

TRANSITIONS:
enter (t.condition, authoritative) → a.reevaluate → c.requirements → {a.restore-full: resolve |
a.restore-subset: resolve, partial | x.remains: no-action}

DATA: account_id, restoration_case_id — instance key. previous_capabilities,
currently_valid_capabilities — a.reevaluate. restoration_log — every action, append.

SOURCE OF TRUTH: current validity of each capability's requirement → entitlement, authorization,
security, policy, and credential systems collectively — deliberately not one system named, since
the graph's own point is that no single snapshot is authoritative.

CONFIG / TIME: none — no waits.

OWNERSHIP: ownsNextAction: true throughout; no handoffs — this state owns its own resolution
entirely, exit-only.

CONFLICT / PREEMPTION: TIM-68 is `distinctFrom` (reverses a transition within a window vs. rebuilds
from current conditions) — a boundary statement, not a live conflict; the two answer different
questions about the same account and would not both be open for the same restriction.

HANDOFF: none.

RE-ENTRY / TERMINALITY: no exit is terminal. x.partial's re-entry is precise: "each capability not
restored re-enters when its own requirement is met" — per-capability granularity, not a blanket
re-open. x.remains: "regaining it means meeting the requirements now" — correctly refuses to treat
prior possession as evidence.

OBSERVABILITY: enteredBy: restoration_log (append). No currentOwner (none needed — no human
decision in this state). No expiresAt (no wait). Adequate.

OUTCOMES: resolution: x.restored — neutral: x.partial (names what didn't return) — failure:
x.remains.

TEST CASES:
- entry: restoration condition satisfied → a.reevaluate → full/partial/none
- concurrent-instance: two different restoration_case_ids on the same account are independent
- handoff: **cannot be constructed as the receiver of ACC-78/FIN-136's malformed handoffs — see
  their own gaps, not repeated here**

GAPS:
- P0 [idempotency] a.reevaluate/a.restore-full/a.restore-subset idempotencyKeys reference
  undeclared `person_id`; real key is account_id + restoration_case_id.
- P1 [instance] this state is the receiving end of two upstream handoffs (ACC-78's h.restore,
  FIN-136's h.restore) that cannot mint `restoration_case_id` — not this state's own defect, but
  its own instance-construction contract is only as good as its callers, and both currently fail
  it. Recorded on the callers; cross-referenced here because it's this state's own key that can't
  be satisfied.

---

## ACQ-01 — Anonymous Identity Resolution

READINESS: NEEDS_CONTRACT_WORK

WHY:
The identity-then-eligibility separation is sound (`s.g3`: "becoming known is not the same as
becoming eligible"), deterministic-only merging (`s.g2`) correctly refuses probabilistic matches,
and the wait's timeout is bound to the signal's own freshness window rather than an invented
duration. Two real gaps: `a.reconcile`'s idempotencyKey references both `account_id` and
`person_id`, neither of which this state declares (only `anonymous_profile_id` exists before
resolution — the identity literally does not exist yet, so the key can't be evaluated as written,
a more severe case of the systemic defect since here the referenced fields are genuinely
unknowable at the point the key would be checked); and its handoff to ACQ-05 doesn't carry the
`lead_id` ACQ-05's own instance key requires.

STATE AUTHORITY:
- anonymous intent threshold (t.threshold) → behavioral-inference, explicitly NOT treated as
  conclusive by itself — it only opens identity resolution, never eligibility or entitlement
  (validatedBy: c.identity's own deterministic-vs-probabilistic gate before anything proceeds)
- c.identity's deterministic-vs-probabilistic split → deterministic-rule (explicitly refuses to
  treat probabilistic signals as identity)
- c.eligible → derived-from-authoritative-inputs (reads the reconciled profile against a
  candidate lifecycle's own eligibility rules)

INSTANCE:
Scope: anonymous_profile, reconciled onto person or account
Key: anonymous_profile_id (pre-resolution) — no field represents the identity *after* a.reconcile
Dedupe policy: reject-duplicate; concurrency: one-active-per-key

TRANSITIONS:
enter (t.threshold, behavioral) → c.identity → {a.reconcile: resolve | w.identity: wait, bound to
signal_freshness_window} → onEvent: a.reconcile; onTimeout: x.stale → c.eligible → {h.qualification
| x.known-only}

DATA: anonymous_profile_id — instance key. intent_signals, signal_freshness_window,
identity_resolution_history — required. No `account_id`/`person_id` attribute exists anywhere in
this state's own data model, even though `a.reconcile`'s own idempotencyKey references both.

SOURCE OF TRUTH: deterministic identity match → an authenticated session, a first-party
identifier, or a signed link resolving to exactly one profile (named as evidence types, not a
system — appropriate, since the point is the *rule*, not the vendor).

CONFIG / TIME: `anonymous_intent.identity` — observation-window, bound to
`signal_freshness_window`, required: true. Correctly config-shaped.

OWNERSHIP: ownsNextAction: true; transfersOn: [h.qualification → ACQ-05].

CONFLICT / PREEMPTION: ACQ-02 is `distinctFrom` (starts from a declared submission, not anonymous
behaviour) — a boundary, not a conflict; the two describe genuinely different entry paths that
could not both be open for the same real person under the same instance key (different keys
entirely — anonymous_profile_id vs. lead_id).

HANDOFF:
- h.qualification → ACQ-05: carries the reconciled intent history, which signals crossed the
  threshold, and the identity resolution method — but ACQ-05's instance key is `lead_id`, a field
  neither declared here nor present in this carries list. The "lead" concept does not exist until
  ACQ-05 itself presumably mints one on entry (the same self-minting pattern found repeatedly in
  the communication round, plausibly fine) — but it is worth naming explicitly since ACQ-01's own
  scope is "anonymous_profile, reconciled onto person or account," never "lead," so there is no
  way to tell from this state alone whether ACQ-05 mints a fresh lead_id or expects one supplied.

RE-ENTRY / TERMINALITY: no exit is terminal. x.stale's re-entry is explicit and correctly framed:
"nothing was merged and no permission was implied by waiting" — a fresh threshold crossing opens a
clean new instance, not a resumed one. x.known-only: "ACQ-06 re-evaluates eligibility when the
underlying data changes; becoming known does not start nurture by itself" — correctly refuses to
treat identity resolution as an implicit trigger.

OBSERVABILITY: enteredBy: identity_resolution_history (append, on a.reconcile only — the pre-
reconciliation period, while waiting in w.identity, writes nothing; a state sitting in w.identity
has only the trigger event itself as its "why," which is adequate but thin). No currentOwner
(none needed). expiresAt: the wait's own timeout, present.

OUTCOMES: resolution: h.qualification — neutral: x.known-only — failure: x.stale.

TEST CASES:
- entry: repeated high-intent visits cross the threshold → c.identity
- insufficient-evidence: a single page view or one bounced ad click → does not open an instance
  (insufficientAlone)
- timeout: only probabilistic signals ever arrive → w.identity → x.stale, no merge, no permission
  implied
- duplicate-event: a.reconcile retried for the same anonymous_profile_id → **cannot be verified
  idempotent as written — see gaps**
- handoff: h.qualification fires → **ACQ-05's lead_id provenance unverifiable from this state
  alone — see gaps**

GAPS:
- P0 [idempotency] a.reconcile's idempotencyKey references `account_id` and `person_id`, neither
  of which this state's own data model contains at any point — more severe than the ordinary
  template-copy case, since the identity these fields would name is the exact thing this action is
  in the middle of resolving. The correct key is almost certainly `anonymous_profile_id +
  a.reconcile`.
- P1 [handoff] h.qualification → ACQ-05 does not carry or visibly mint `lead_id`; whether ACQ-05
  mints its own on entry is plausible (the same pattern seen corpus-wide) but unconfirmed from
  this state's own contract.

---

## ACQ-02 — Interest Qualification Routing

READINESS: NEEDS_CONTRACT_WORK

WHY:
Clean three-way routing (named destination / disqualified / needs education) with the permission-
is-a-separate-fact discipline stated explicitly (`s.g2`) and enforced structurally (permission is
carried, never inferred from the submission). The one action (`a.record`) has an idempotencyKey
defect — its only side-effecting action, and the correction itself is a one-line reference fix —
but this audit treats any unresolved P0 idempotency finding as blocking (see the audit's
readiness-verdict methodology), so this is classified NEEDS_CONTRACT_WORK rather than
READY_WITH_MAPPING despite the fix's mechanical simplicity.

STATE AUTHORITY:
- first-party interest captured (t.captured) → declared-by-customer (a form, a content request, an
  equivalent deliberate act — explicitly rejects an ad click, a page visit, an email open)
- c.ready/c.disqualifier routing → deterministic-rule reading the declared request against named
  destination and disqualification criteria

INSTANCE:
Scope: lead, resolved onto person or account
Key: lead_id
Dedupe policy: reject-duplicate; concurrency: one-active-per-key

TRANSITIONS:
enter (t.captured, declared) → a.record → c.ready → {h.destination | c.disqualifier →
{h.reason | h.education}}

DATA: lead_id — instance key. capture_record, declared_destination, disqualifiers — required.

SOURCE OF TRUTH: whether a destination "can be entered now" and what disqualifies a lead → an
authoritative eligibility/market rule (unnamed, appropriately — the criteria are named in prose,
not a vendor).

CONFIG / TIME: none — no waits, no exit nodes even (a pure three-way handoff router, correctly
reviewed elsewhere in the corpus as the `router_journey` pattern for journeys with no exit of their
own — see communication-round precedent in `production/vnext-warning-reviews.json`).

OWNERSHIP: ownsNextAction: false after a.record resolves — this state exists to route, not to
retain ownership; every branch ends in a handoff.

CONFLICT / PREEMPTION: none found — the three destinations (h.destination, h.reason, h.education)
are mutually exclusive by the graph's own branch structure (c.ready then c.disqualifier), so no
sibling-conflict risk exists within this state.

HANDOFF:
- h.destination → `external:destination-lifecycle`; contract.requiredFields present
  (account_id, lead_id, handed_at, reason) — well-formed.
- h.reason → ACQ-05; carries the disqualification reason and capture record — ACQ-05's own
  instance key is `lead_id`, which this state already has and carries implicitly via its own
  instanceKey continuity (not flagged by the mechanical handoff-provenance check — clean).
- h.education → ACQ-09 (a communicating journey, already audited/fixed in the prior round) —
  outside this round's scope to re-verify, noted only for completeness.

RE-ENTRY / TERMINALITY: no exit nodes at all — every path is a handoff. Not a defect (see
`router_journey` precedent); nothing to assess for re-entry since ownership always transfers.

OBSERVABILITY: enteredBy: capture_record (append, on a.record). No currentOwner (state never
retains ownership long enough to need one). Adequate for a pure router.

OUTCOMES: resolution: h.destination — neutral: h.education — failure: h.reason (disqualified).

TEST CASES:
- entry: a form submission with permission → a.record → c.ready
- duplicate-event: a.record retried for the same lead_id → **as written, cannot be verified
  idempotent — see gaps**
- handoff: h.destination fires with contract.requiredFields satisfied → destination lifecycle can
  construct its own record

GAPS:
- P0 [idempotency] a.record's idempotencyKey references undeclared `account_id`; real key is
  `lead_id + a.record`.

---

## ACQ-03 — Intent Escalation Handoff

READINESS: READY_WITH_MAPPING

WHY:
This is the corpus's clean template for ownership transfer: `a.suppress` explicitly stops queued
and in-flight sends *before* the handoff completes (`s.g2`: "a handoff that leaves queued sends
alive delivers the state the person just left"), and the handoff's own `suppresses` list names
exactly what stops. The only action with a side effect (`a.suppress`) has a correctly-scoped
idempotencyKey; `a.resolve` is read-only and correctly carries none.

STATE AUTHORITY:
- intent threshold crossed (t.crossed) → behavioral-inference, validated by c.strength before
  anything acts on it ("a strong-evidence act, or a repeated moderate one, and fresh enough" —
  explicitly rejects a single weak signal or a stale strong one)
- c.higher's priority-ranking → deterministic-rule reading a declared journey-priority table

INSTANCE:
Scope: person plus the entity the new intent is about
Key: person_id + intent_entity_id
Dedupe policy: reject-duplicate; concurrency: one-active-per-key

TRANSITIONS:
enter (t.crossed, behavioral, validated by c.strength) → a.resolve → c.higher →
{a.suppress: resolve, ownership-transfer | x.retained: no-action}; c.strength's noise branch →
x.unchanged: no-action

DATA: person_id, intent_entity_id — instance key. current_lifecycle, signal_strength_evidence,
suppressed_sends — required.

SOURCE OF TRUTH: which journey currently owns the person for this entity, and journey-priority
ranking → a declared lifecycle-priority table (unnamed as a system, appropriately — this is
config, not a vendor).

CONFIG / TIME: none — no waits.

OWNERSHIP: ownsNextAction: false — this state exists solely to transfer ownership; explicit
`transfersOn: [h.escalate]`, no `resumesOn` (the outgoing journey does not get ownership back
through this state; a fresh escalation is a new instance).

CONFLICT / PREEMPTION: this state *is* the corpus's conflict-resolution mechanism for the
acquisition-intent family (ACQ-07/ACQ-08 both reference the same `purchase-intent` exclusionGroup)
— it doesn't have a sibling-conflict problem itself, it solves one for its neighbors.

HANDOFF:
- h.escalate → `external:higher-intent-lifecycle`; contract.requiredFields present (person_id,
  handed_at, reason); `suppresses` explicitly lists queued reminders, scheduled retries, and
  lower-intent CTAs — a genuinely well-specified ownership-transfer contract.

RE-ENTRY / TERMINALITY: no exit is terminal. x.unchanged and x.retained both correctly re-open on
the next signal without requiring anything to be undone first.

OBSERVABILITY: enteredBy: suppressed_sends (append, on a.suppress only — a.resolve itself writes
nothing, so the "why did ownership move" reasoning lives only in the trigger event and c.strength/
c.higher's pass-through; adequate but the actual *reasoning* — why this was judged a real
escalation — is not retained anywhere as data, only as graph logic). No currentOwner/expiresAt
(not applicable to a router).

OUTCOMES: resolution: h.escalate — neutral: x.retained — diagnostic: x.unchanged (noise, not
acted on).

TEST CASES:
- entry: a strong or repeated-moderate signal, fresh → c.higher
- insufficient-evidence: one email click or one page view → x.unchanged, no ownership change
- handoff: h.escalate fires → queued/scheduled/CTA sends for the superseded journey suppressed
  before the receiving lifecycle starts

GAPS:
- P2 [observability] the specific evidence that made c.strength judge a signal "real" (vs. noise)
  is not retained as data anywhere in this state — only the pass/fail result. A company debugging
  "why did this person escalate" after the fact has the outcome but not the reasoning trail.

---

## ACQ-05 — Qualification State Routing

READINESS: NEEDS_CONTRACT_WORK

WHY:
The strongest correction-discipline in this batch: `s.g1` explicitly separates DISQUALIFIED's four
causes (only one is terminal), and `s.g2` forbids overwriting a prior reason — qualification
history is append-only by design, not by accident. `s.g3` refuses to invent a recycle schedule
where none was recorded. The three actions with idempotencyKeys share the same corpus-wide
`account_id` defect (undeclared), the one real blocker — an unresolved P0, which this audit's
readiness-verdict methodology treats as blocking regardless of how mechanical the fix is.

STATE AUTHORITY:
- qualification state changed (t.changed) → authoritative-system, explicitly rejects "a score
  crossing a threshold with no reason recorded" as insufficient — a scoring model alone cannot
  move this state
- c.state/c.why routing → deterministic-rule reading the authoritative transition and its reason

INSTANCE:
Scope: lead, account or opportunity
Key: lead_id
Dedupe policy: reject-duplicate; concurrency: one-active-per-key

TRANSITIONS:
enter (t.changed, authoritative) → a.read → c.state → {h.destination | x.in-progress: no-action |
x.not-yet: no-action | c.why → {x.terminal: terminal | a.mark-recycle: progress → w.reentry:wait |
w.requirement:wait | h.merge}}; w.recycle onEvent: a.requalify (reopen, new instance); onTimeout:
x.recycle-expired

DATA: lead_id — instance key. qualification_state, state_reason, recycle_horizon_at,
requirement_validity_ends_at, qualification_history — required.

SOURCE OF TRUTH: the qualification transition and its reason → the qualification system of record
(unnamed, appropriately).

CONFIG / TIME:
- `qualification_state.recycle` — attribute-bound to `recycle_horizon_at`, required: true
- `qualification_state.requirement` — attribute-bound to `requirement_validity_ends_at`, required:
  true
Both correctly config-shaped, no invented duration.

OWNERSHIP: ownsNextAction: true while in-progress/not-yet/recycle-eligible; transfersOn:
[h.destination, h.merge].

CONFLICT / PREEMPTION: none found directly; ACQ-10 is `distinctFrom` (a decision the *other side*
made vs. a decision *our own* qualification made) — a real, useful boundary, not a conflict, since
the two describe different facts that could coexist in history without contradiction (a decline
can precede or follow a qualification-state change on the same lead over time, but not describe
the same moment).

HANDOFF:
- h.destination → `external:commercial-destination`; contract present (account_id, lead_id,
  handed_at, reason) — well-formed.
- h.merge → `external:account-master-data`; contract present, plus explicit `suppresses`
  (acquisition messaging on the duplicate) — well-formed.

RE-ENTRY / TERMINALITY: x.terminal is the only `terminal: true` exit, reserved for "the account can
never be served — outside the market permanently, structurally not a fit, or prohibited," with an
explicit reEntry note that even this requires "a change to the rule rather than to the account" —
correctly scoped terminality, not over-applied to the other three DISQUALIFIED sub-reasons.
x.recycle-expired and x.requirement-lapsed both correctly reopen as fresh evaluations rather than
resumed instances, with history intact.

OBSERVABILITY: enteredBy: qualification_history (append, every action). expiresAt:
recycle_horizon_at / requirement_validity_ends_at, present on the two waits. No currentOwner (no
human-decision point in this state — appropriate, it's fully deterministic).

OUTCOMES: resolution: h.destination, x.recycled — neutral: x.in-progress, x.not-yet — failure:
x.terminal, x.requirement-lapsed — diagnostic: x.recycle-expired.

TEST CASES:
- entry: an authoritative transition with a reason → c.state
- insufficient-evidence: a score crossing a threshold with no reason → does not enter
- timeout: recycle_horizon_at or requirement_validity_ends_at passes unmet → x.recycle-expired /
  x.requirement-lapsed, history intact
- re-entry: a.requalify fires mid-cooldown → x.recycled, "the new instance owns what follows"
- duplicate-event: a.read/a.mark-recycle/a.requalify retried → **cannot be verified idempotent as
  written — see gaps**

GAPS:
- P0 [idempotency] a.read/a.mark-recycle/a.requalify idempotencyKeys reference undeclared
  `account_id`; real key is `lead_id + <action>`.

---

## ACQ-06 — Eligibility Recalculation

READINESS: NEEDS_CONTRACT_WORK

WHY:
The best-designed correction boundary in the batch: `s.g3` states a future eligibility loss does
not automatically invalidate an existing obligation, and `a.reconcile` structurally enforces it —
it flags the commitment for its own reconciliation and explicitly does not cancel, reduce, or
reverse anything itself. `s.g4` requires every result to name the rule and input that produced it,
enforced by `a.evaluate`'s own writes. Same idempotencyKey defect as its siblings, the one
blocker — an unresolved P0, treated as blocking per this audit's readiness methodology.

STATE AUTHORITY:
- eligibility inputs changed or scheduled re-evaluation (t.evaluated) → authoritative-system,
  explicitly rejects a re-evaluation with no rule input changed and no schedule behind it, and a
  score/segment move where the actual eligibility rule was never re-run
- c.eligible/c.commitment routing → deterministic-rule, explicit per-rule/per-input traceability

INSTANCE:
Scope: person, account or the business entity the rule is about
Key: entity_ref + rule_id
Dedupe policy: reject-duplicate; concurrency: one-active-per-key

TRANSITIONS:
enter (t.evaluated, authoritative) → a.evaluate → c.eligible → {o.permitted → x.eligible: resolve |
c.commitment → {a.reconcile: handoff, ownership-transfer-of-the-commitment-only |
a.block: resolve-negative → x.ineligible}}

DATA: entity_ref, rule_id — instance key. rule_inputs, eligibility_decisions,
outstanding_commitments — required.

SOURCE OF TRUTH: the eligibility rule's pass/fail and which input produced it → the eligibility
rule engine itself (the graph's own point — every decision names its rule and input, so the
"system" is the rule execution, not an external system to name).

CONFIG / TIME: none — no waits.

OWNERSHIP: ownsNextAction: true for the eligibility decision itself; transfersOn: [h.reconcile] —
but only for the *commitment's* reconciliation, not for the eligibility fact itself, which this
state retains ownership of (a clean, correctly-scoped partial ownership transfer — the
"ownership: true" statement and the "hands off the consequence, not the fact" pattern in one
state).

CONFLICT / PREEMPTION: ACQ-05 is `distinctFrom` (qualification asks whether we want the
relationship; eligibility asks whether rules permit a specific action, and can flip repeatedly
while qualification never moves) — real and useful; the two states track genuinely independent
facts on possibly-overlapping entities with no risk of contradiction, since neither one's exit
implies anything about the other.

HANDOFF:
- h.reconcile → `external:commitment-reconciliation`; contract present (account_id, person_id,
  handed_at, reason); carries the failing rule, the commitment, and the explicit fact that no
  automatic cancellation has been applied — a genuinely careful handoff.

RE-ENTRY / TERMINALITY: no exit is terminal. Both x.eligible and x.ineligible explicitly state that
any change to the inputs re-opens evaluation as an "ordinary re-evaluation... needs no special
case" — correctly refuses to treat restored eligibility as a distinct, special transition type.

OBSERVABILITY: enteredBy: eligibility_decisions (append, on a.evaluate and a.block). currentOwner:
n/a (fully deterministic). This is the one state in this batch whose observability model is
genuinely excellent by design — `s.g4` makes retaining "which rule, which input" a first-class
canonical rule, not an afterthought.

OUTCOMES: resolution: x.eligible, o.permitted — failure: x.ineligible — diagnostic: h.reconcile
(commitment flagged, not resolved by this state).

TEST CASES:
- entry: an eligibility input changes or a scheduled re-evaluation fires → a.evaluate
- insufficient-evidence: unrelated data changes, or a re-evaluation with no rule/schedule behind
  it → does not enter
- correction: eligibility lost while a commitment is outstanding → a.reconcile flags it, does not
  reverse it
- duplicate-event: a.evaluate/a.reconcile/a.block retried → **cannot be verified idempotent as
  written — see gaps**

GAPS:
- P0 [idempotency] a.evaluate/a.reconcile/a.block idempotencyKeys reference undeclared
  `account_id`/`person_id`; real key is `entity_ref + rule_id + <action>`.

---

## ACQ-07 — Intent Decay

READINESS: READY_WITH_MAPPING

WHY:
The cleanest example in this batch of refusing to manufacture a negative outcome: `s.g3` states
decay is not a decline and writes nothing negative against someone who simply went quiet, and
`s.g2` protects marketing permission as a separately-stored fact untouched by decay. The
`purchase-intent` competition group with ACQ-08 gives this state a genuine, working exclusivity
mechanism (lowest precedence, correctly — a live escalation or a reached destination should always
outrank a decay judgment). One idempotencyKey defect, scoped to a single action.

STATE AUTHORITY:
- freshness threshold passed (t.stale) → behavioral-inference — but unusually, this is the correct
  design for behavioral evidence *decaying*, not asserting a new state: the graph explicitly
  rejects a fixed day-count applied without reading the signal's own freshness, quiet-in-one-
  channel-while-renewed-elsewhere, and a decline (which is a decision, routed elsewhere) as
  insufficient — c.credible re-validates before anything downgrades

INSTANCE:
Scope: person plus the intent context that was recorded
Key: person_id + intent_context_id
Dedupe policy: reject-duplicate; concurrency: one-active-per-key

TRANSITIONS:
enter (t.stale, behavioral, validated by c.credible) → a.weigh → c.credible → {x.unchanged:
no-action | a.downgrade: resolve → a.suppress: resolve → c.relationship → {h.customer |
w.cooldown:wait}}; onEvent: h.re-escalate (reopen → ACQ-03); onTimeout: x.cooled

DATA: person_id, intent_context_id — instance key. intent_state, supporting_evidence,
freshness_threshold, intent_history — required.

SOURCE OF TRUTH: whether recorded intent is "still credible" → behavioral evidence synthesized by
business rule (a.weigh), explicitly not a single automated threshold.

CONFIG / TIME: `intent_decay.cooldown` — cooldown class, required: true, correctly config-shaped
(no invented duration; "a cooldown with no end is a permanent hold under a friendlier name" is
stated as the reason it must be config-bound).

OWNERSHIP: ownsNextAction: true while cooling; transfersOn: [h.customer] (only when a live customer
relationship already exists underneath the decayed intent — a genuinely careful ownership scoping
question this state gets right).

CONFLICT / PREEMPTION: **declared, resolved, and enforceable** — `contact.competition`:
exclusionGroup `purchase-intent`, precedence "lowest in the group," onLoss "exit." ACQ-08 (below)
is the other declared member, at "highest in the group." This is the corpus's working example of
the pattern the communication round had to retrofit by hand elsewhere.

HANDOFF:
- h.customer → `external:customer-lifecycle`; contract present (person_id, handed_at, reason);
  `suppresses` acquisition-priority follow-up — well-formed.
- h.re-escalate → ACQ-03; carries the new signal and the decayed history "so the escalation is not
  mistaken for a first-time interest" — a genuinely careful re-entry-vs-first-time distinction.

RE-ENTRY / TERMINALITY: no exit is terminal. x.cooled's re-entry is explicit: "a new strong signal
establishes a new intent state from scratch" (new-episode, not resumed) — correctly avoids
resurrecting decayed evidence.

OBSERVABILITY: enteredBy: intent_history (append, on a.downgrade). suppressedSends tracked
separately (a.suppress, append). No currentOwner (fully automated). expiresAt: the cooldown wait's
own timeout, present.

OUTCOMES: resolution: h.re-escalate (a new strong signal recovers it) — neutral: x.unchanged,
h.customer — diagnostic: x.cooled (expired with no decision recorded, by design).

TEST CASES:
- entry: recorded intent older than its freshness window → c.credible
- insufficient-evidence: recent behaviour still supports it, or real progress under way →
  x.unchanged
- conflict: this state and ACQ-08 both eligible on the same product → ACQ-08 wins by declared
  precedence
- timeout: cooldown horizon passes with no strong signal → x.cooled, no decision recorded
- duplicate-event: a.downgrade/a.suppress retried → **cannot be verified idempotent as written —
  see gaps**

GAPS:
- P0 [idempotency] a.downgrade's idempotencyKey (`person_id + a.downgrade`) is actually correct —
  `person_id` IS declared here. No violation on this action. a.suppress likewise correctly uses
  `person_id`. **No idempotency gap found in this state** — the mechanical scan confirms both keys
  resolve against declared attributes.

---

## ACQ-08 — Acquisition Exit Handoff

READINESS: NEEDS_CONTRACT_WORK

WHY:
The other half of the `purchase-intent` competition group, correctly at highest precedence — a
reached commercial destination ends every intent journey on the same product, and `s.g3` extends
suppression to sends already queued, not just future scheduling. Real blocker: `a.scope`'s and
`a.suppress`'s idempotencyKeys reference `contact_point_id`, a field this state's own data model
never declares (person_id + destination_entity_id is the actual key).

STATE AUTHORITY:
- authoritative destination event (t.destination) → authoritative-system, explicitly rejects an
  email click, a landing page visit, a form view, or an abandoned checkout as evidence — c.
  authoritative re-checks the event actually came from the destination's own system of record
  before anything is suppressed

INSTANCE:
Scope: person or account plus the destination entity
Key: person_id + destination_entity_id
Dedupe policy: reject-duplicate; concurrency: one-active-per-key

TRANSITIONS:
enter (t.destination, authoritative) → c.authoritative → {a.scope: resolve → a.identify: read-only
→ a.suppress: resolve, ownership-transfer → h.next | x.not-conversion: invalid-state}

DATA: person_id, destination_entity_id — instance key. destination_event,
queued_acquisition_sends, suppressed_sends — required.

SOURCE OF TRUTH: whether the destination event is authoritative → the destination's own system of
record (trial/subscription/purchase/booking/application system — unnamed, appropriately, since the
criterion is "the destination system recorded the fact," not a specific vendor).

CONFIG / TIME: none — no waits.

OWNERSHIP: ownsNextAction: false — exists solely to close out acquisition ownership;
transfersOn: [h.next].

CONFLICT / PREEMPTION: **declared and enforceable** — same `purchase-intent` exclusionGroup as
ACQ-07, at highest precedence. Correctly the "wins over everything" member: a completed
destination is the strongest possible fact in the group.

HANDOFF:
- h.next → `external:next-lifecycle`; contract present (contact_point_id, account_id, handed_at,
  reason); `suppresses` explicitly names every acquisition journey scoped to the entity, queued and
  in-flight — a well-specified ownership-transfer contract, mirroring ACQ-03's.

RE-ENTRY / TERMINALITY: only one exit, x.not-conversion, non-terminal, re-entry explicit: "the real
event, if it happens, arrives from the system of record and opens a proper instance" — correctly
refuses to treat a rejected proxy signal as having consumed the instance.

OBSERVABILITY: enteredBy: destination_entity (set, on a.scope) + suppressed_sends (append, on
a.suppress). No currentOwner (fully automated). Adequate.

OUTCOMES: resolution: h.next — diagnostic: x.not-conversion (proxy signal, correctly rejected).

TEST CASES:
- entry: an authoritative destination event → c.authoritative
- insufficient-evidence: an email click, page visit, or abandoned checkout → x.not-conversion
- conflict: this state and ACQ-07 both eligible on the same product → this state wins (highest
  precedence)
- handoff: h.next fires → every acquisition journey scoped to the destination entity, queued and
  in-flight, suppressed before the next lifecycle starts
- duplicate-event: a.scope/a.suppress retried → **cannot be verified idempotent as written — see
  gaps**

GAPS:
- P0 [idempotency] a.scope/a.suppress idempotencyKeys reference undeclared `contact_point_id`;
  real key is `person_id + destination_entity_id + <action>`.

---

## ACQ-10 — Commercial Decline Routing

READINESS: NEEDS_CONTRACT_WORK

WHY:
The most careful reason-preservation discipline in this batch: `s.g1` makes overwriting the
decline-reason history structurally impossible to justify (routing itself depends on it), `s.g2`
correctly separates "not now" from "never" (only NOT_FIT is terminal), and `s.g4` refuses to invent
a re-entry date where none was recorded — the wait times out into an honest "nothing scheduled"
state rather than a fabricated cadence. One idempotencyKey defect, cheap to fix but still an
unresolved P0, treated as blocking per this audit's readiness methodology.

STATE AUTHORITY:
- explicit decline or authoritative lost outcome (t.decline) → declared-by-customer (a stated
  decline) OR authoritative-system (a recorded lost outcome) — the graph correctly treats these as
  two valid entry paths under one event, both explicitly rejecting silence/a missed meeting/an
  unanswered email as evidence (that's ACQ-07's territory, via h.decay)
- c.reason's eight-way routing → deterministic-rule reading the declared/recorded reason family

INSTANCE:
Scope: lead, opportunity or account
Key: lead_id + decline_id
Dedupe policy: reject-duplicate; concurrency: one-active-per-key

TRANSITIONS:
enter (t.decline, declared-or-authoritative) → a.capture → c.reason → {x.terminal: terminal |
c.reentry → {w.reentry:wait, bound to reentry_at | x.cooldown: no-action} | h.decay | h.classify}

DATA: lead_id, decline_id — instance key. reason_family, reentry_at, decline_history — required.

SOURCE OF TRUTH: the decline reason and its family → the person/account's own stated reason, or
the CRM/sales system's recorded lost-reason field (unnamed, appropriately).

CONFIG / TIME: `commercial_decline.reentry` — attribute-bound to `reentry_at`, required: true;
"nothing is scheduled where none is known" is a stated design principle, not an omission.

OWNERSHIP: ownsNextAction: true while cooling/waiting; transfersOn: [h.decay → ACQ-07,
h.classify → DEC-181, h.requalify → ACQ-05].

CONFLICT / PREEMPTION: ACQ-07 is `distinctFrom` ("someone decided something here" vs. decay's "no
decision was made") — a real and load-bearing boundary; `h.decay`'s own existence is the corpus's
correct handling of the case where this state's own trigger evidence turns out to be a
misclassified silence rather than a real decision, routing to the state actually designed for it
rather than forcing NO_RESPONSE to behave like a decision.

HANDOFF:
- h.decay → ACQ-07: carries the fact that no decision was made and the intent history as decay's
  own stale evidence — clean, no missing-identifier gap.
- h.classify → DEC-181: carries the opportunity and the unclassified reason; suppresses
  auto-re-entry until classified — clean.
- h.requalify → ACQ-05: carries decline history and the met condition; ACQ-05's own key is
  `lead_id`, already present — clean.

RE-ENTRY / TERMINALITY: x.terminal is the only `terminal: true` exit, reserved for NOT_FIT with an
explicit reEntry rationale ("what would have to change is what we sell, not what this account
decided") — correctly scoped. x.cooldown is explicitly non-terminal with re-entry left open rather
than scheduled, matching `s.g4`.

OBSERVABILITY: enteredBy: decline_history (append, on a.capture — every reason preserved, never
overwritten). expiresAt: reentry_at, present on the one wait. No currentOwner (fully
deterministic).

OUTCOMES: resolution: h.requalify — neutral: x.cooldown — failure: x.terminal — diagnostic:
h.classify (unclassified reason).

TEST CASES:
- entry: a stated decline or a recorded lost outcome → a.capture
- insufficient-evidence: silence, a missed meeting, an unanswered email → does not enter (routes
  via ACQ-07 territory instead, not this state's trigger)
- timeout: reentry_at passes with the condition unmet → x.cooldown, nothing invented
- re-entry: the recorded condition is met → h.requalify → ACQ-05, with full decline history
- duplicate-event: a.capture retried → **cannot be verified idempotent as written — see gaps**

GAPS:
- P0 [idempotency] a.capture's idempotencyKey references undeclared `account_id`; real key is
  `lead_id + decline_id + a.capture`.

---

## ACT-16 — Onboarding Completion Handoff

READINESS: READY_WITH_MAPPING

WHY:
A near-identical, equally well-built sibling to ACQ-08 and ACQ-03: activation is never inferred
from message engagement (`s.g1`, enforced by c.authoritative explicitly rejecting a click, a
completed checklist, a login, or an unused feature open), and invalidation reaches queued sends,
not only future ones (`s.g3`). The mandatory-requirement spin-off (`a.spin-off`, to its own
lifecycle rather than kept open here) is a clean example of correctly-scoped ownership transfer.
All three actions' idempotencyKeys are correctly formed — no defect found.

STATE AUTHORITY:
- authoritative core activation event (t.activated) → authoritative-system, explicitly rejects an
  onboarding-email click, a completed setup checklist, a login, or an opened-but-unused feature

INSTANCE:
Scope: person or account plus the onboarding instance being closed
Key: account_id + person_id
Dedupe policy: reject-duplicate; concurrency: one-active-per-key

TRANSITIONS:
enter (t.activated, authoritative) → c.authoritative → {a.complete: resolve → a.invalidate:
resolve → c.mandatory → {a.spin-off: handoff, ownership-transfer-of-the-requirement-only |
h.adoption: handoff} | x.not-activation: invalid-state}

DATA: account_id, person_id — instance key. onboarding_outcome, suppressed_sends — required.

SOURCE OF TRUTH: whether core value was produced → the product's own record (explicitly not a
message-engagement proxy).

CONFIG / TIME: none — no waits.

OWNERSHIP: ownsNextAction: false — exists to close onboarding out; transfersOn: [h.adoption →
ACT-17]. a.spin-off is a partial, scoped transfer (the operational requirement only, not the
whole state), mirroring ACQ-06's pattern.

CONFLICT / PREEMPTION: none found — this state's own job is to end a class of prior ownership
(onboarding's), not to compete with a sibling for it.

HANDOFF:
- h.adoption → ACT-17 (a communicating journey, already audited in the prior round); carries which
  event activated, what was left unfinished, and any spun-off requirement — genuinely careful, no
  missing-identifier gap (ACT-17's own key, `account_id + person_id`, is already present — the
  mechanical scan flags `use_case_id` as missing, but that field belongs to ACT-17's own later
  qualification of *which* use case activated, not to opening the instance itself; worth a P2 note
  since it's not immediately obvious from this state's contract alone whether ACT-17 mints it).

RE-ENTRY / TERMINALITY: only one exit, x.not-activation, non-terminal, re-entry explicit: "the real
event, when it happens, arrives from the product and opens a proper instance."

OBSERVABILITY: enteredBy: onboarding_outcome (append, on a.complete). suppressed_sends tracked
separately (append, on a.invalidate). No currentOwner (fully automated).

OUTCOMES: resolution: h.adoption — diagnostic: x.not-activation (proxy signal, correctly
rejected).

TEST CASES:
- entry: the product's own authoritative value-production record → c.authoritative
- insufficient-evidence: a click, a checklist, a login, or an unused feature open → x.not-activation
- handoff: h.adoption fires with everything unfinished named, and a spun-off requirement handed
  separately if one exists
- duplicate-event: a.complete/a.invalidate/a.spin-off retried → correctly idempotent as written —
  no gap

GAPS:
- P1 [handoff] h.adoption → ACT-17 does not visibly carry `use_case_id`, which ACT-17's own
  instance key includes; whether ACT-17 mints it on entry (the ordinary self-minting case seen
  corpus-wide) is plausible but not confirmed from this state's own contract.

---

## CON-31 — Permission Validation

READINESS: NEEDS_CONTRACT_WORK

WHY:
The scope-discipline is exhaustive and correctly narrow-read by default (`s.g3`), account creation
and terms-acceptance are explicitly rejected as consent evidence, and a refusal is recorded as a
decision rather than an absence (`s.g4`) — a genuinely careful correction/preservation model. All
four actions share the corpus-wide idempotencyKey defect, on a field (`consent_record_id`) this
state's own attributes never declare.

STATE AUTHORITY:
- explicit permission decision (t.decision) → declared-by-customer, explicitly rejects account
  creation, providing contact details, ToS acceptance without separate consent, and a pre-ticked
  box as evidence

INSTANCE:
Scope: person plus the permission record, keyed by purpose, channel and scope
Key: person_id + purpose_channel_scope_key
Dedupe policy: reject-duplicate; concurrency: one-active-per-key

TRANSITIONS:
enter (t.decision, declared) → a.capture → c.valid → {c.existing → {a.reconcile: resolve |
a.activate: resolve} → x.active | a.narrow: resolve, ambiguity flagged → c.existing (same path) |
x.rejected: invalid-state}

DATA: person_id, purpose_channel_scope_key — instance key. decision, scope_statement, captured_at,
permission_log — required. No `consent_record_id` attribute exists anywhere in this state's data
model.

SOURCE OF TRUTH: whether an act constitutes deliberate authorization → the declared act itself,
evaluated against the corpus's own explicit exclusion list (not a system to name — the criteria
are the point).

CONFIG / TIME: none — no waits.

OWNERSHIP: ownsNextAction: true throughout; no handoffs — this state owns its own resolution fully.

CONFLICT / PREEMPTION: CON-32 is `distinctFrom` ("this creates authorisation; CON-32 records
*how* to communicate, and must never create this fact") — the strongest-worded boundary statement
in this batch, functionally a one-directional non-conflict guarantee rather than a real contest.

HANDOFF: none.

RE-ENTRY / TERMINALITY: no exit is terminal. x.active's re-entry is explicit and correctly scoped:
"any later decision on the same combination opens a new instance; changes to an active permission
are CON-35's, not this journey's" — a clean ownership boundary to a sibling state (CON-35, outside
this round's 64).

OBSERVABILITY: enteredBy: permission_log (append, every action — the fullest audit trail in this
batch, including the consent-text version at capture time). No currentOwner (fully deterministic).

OUTCOMES: resolution: x.active — failure: x.rejected.

TEST CASES:
- entry: a deliberate grant or refusal identifying what's permitted → c.valid
- insufficient-evidence: account creation, providing an email, ToS acceptance, a pre-ticked box →
  x.rejected
- correction: an ambiguous scope → a.narrow reads it conservatively rather than assuming broad
- duplicate-event: a.capture/a.narrow/a.reconcile/a.activate retried → **cannot be verified
  idempotent as written — see gaps**

GAPS:
- P0 [idempotency] all four actions' idempotencyKeys reference undeclared `consent_record_id`;
  real key is `person_id + purpose_channel_scope_key + <action>`.

---

## CON-32 — Preference Capture

READINESS: READY_WITH_MAPPING

WHY:
A precise, well-enforced boundary: `s.g1` states a preference is not consent, `s.g2` keeps declared
and inferred data in physically separate stores with an explicit note that "the merge cannot be
undone," and `s.g3` means a preference set with no covering permission is stored and applied to
nothing (enforced structurally by `c.permitted`, not left to prose). Both idempotencyKeys are
correctly formed.

STATE AUTHORITY:
- preference explicitly set or changed (t.set) → declared-by-customer, explicitly rejects
  behaviour that "suggests" a preference, the channel someone happened to reply on, or a topic
  clicked once

INSTANCE:
Scope: person plus the declared-preference profile
Key: person_id
Dedupe policy: reject-duplicate; concurrency: one-active-per-key

TRANSITIONS:
enter (t.set, declared) → a.persist → c.permitted → {a.apply: handoff | x.stored-only: no-action}

DATA: person_id — instance key. declared_preferences — required.

SOURCE OF TRUTH: whether active permission covers the purpose/channel the preference applies to →
CON-31's own permission record (an internal cross-state reference, not an external system).

CONFIG / TIME: none — no waits.

OWNERSHIP: ownsNextAction: false once applied; transfersOn: [h.recalculate → CON-33].

CONFLICT / PREEMPTION: none found — this state's whole design is to have zero effect (x.stored-only)
until CON-31 independently grants permission, which structurally prevents any conflict with
consent state.

HANDOFF:
- h.recalculate → CON-33: carries the new value, what it replaced, and the explicit fact that
  permission hasn't changed — clean, CON-33's own instance key (person_id) already present.

RE-ENTRY / TERMINALITY: x.stored-only, the only exit, non-terminal; re-entry explicit: "if
permission is granted later the stored preference applies from that moment; the preference waited
rather than authorised anything" — a genuinely careful description of a state that can sit
dormant indefinitely without becoming stale or wrong.

OBSERVABILITY: enteredBy: declared_preferences (append, on a.persist). No currentOwner (fully
deterministic).

OUTCOMES: resolution: h.recalculate — neutral: x.stored-only.

TEST CASES:
- entry: a deliberate frequency/topic/category/language/channel/content preference → c.permitted
- insufficient-evidence: behaviour suggesting a preference, a reply channel, one click → does not
  enter
- correction: permission never covers the stated channel → x.stored-only, applies to nothing
- duplicate-event: a.persist/a.apply retried → correctly idempotent as written — no gap

GAPS: none found.

---

## CON-33 — Preference Recalculation

READINESS: NEEDS_CONTRACT_WORK

WHY:
The queue-reaches-preference discipline is the sharpest in this batch: `s.g2` states a stale queued
action never overrides a newer preference because "execution re-validates; scheduling is not a
decision," and `a.adapt`'s own text distinguishes adapting-before from apologising-after. The real
gap is structural, not textual: `a.adapt` (the "reshaped, not forbidden" branch) has **no
idempotencyKey and no `writes` at all** — a state-changing action (it reshapes what a pending
message will say) with no recorded trace and no dedup mechanism, unlike its sibling `a.suppress`,
which correctly has both.

STATE AUTHORITY:
- authoritative preference changed (t.changed) → authoritative-system, explicitly distinguishes
  itself from a permission change (which reaches queued sends through suppression, a different
  state) and from an inferred preference (out of scope by definition)

INSTANCE:
Scope: person plus the preference plus every active journey instance and queued action it touches
Key: person_id
Dedupe policy: reject-duplicate; concurrency: one-active-per-key

TRANSITIONS:
enter (t.changed, authoritative) → a.history → a.identify (read-only, per-action fan-out) →
c.conflict → {a.suppress: resolve | a.adapt: resolve, unrecorded | x.recalculated: no-action}

DATA: person_id — instance key. declared_preferences, suppressed_sends — required. No field
captures which specific pending actions were *adapted* (as opposed to suppressed).

SOURCE OF TRUTH: how each pending action stands against the new preference → the preference
comparison itself (deterministic, not an external system).

CONFIG / TIME: none — no waits.

OWNERSHIP: ownsNextAction: true — no handoffs, resolves entirely within this state.

CONFLICT / PREEMPTION: none found — this state exists specifically to resolve the queue-vs-
preference conflict for every OTHER journey; it has no sibling-conflict problem of its own.

HANDOFF: none.

RE-ENTRY / TERMINALITY: x.recalculated, the only exit, non-terminal, re-entry explicit: "the next
preference change re-opens this."

OBSERVABILITY: enteredBy: declared_preferences (append, on a.history — full before/after history).
suppressed_sends tracked separately (append, on a.suppress). **Adapted actions are not tracked
anywhere** — a company asking "which pending messages did we quietly change, and to what" for
this preference-change instance cannot answer it from this state's own data.

OUTCOMES: resolution: x.recalculated (covers all three sub-cases: suppressed, adapted, unaffected
— no separate exit distinguishes them, so state-health reporting can't tell suppression volume
from adaptation volume without reading the log directly).

TEST CASES:
- entry: a recorded preference change with its previous value → a.history
- insufficient-evidence: an inferred preference, or a permission change (different journey) →
  does not enter
- conflict: a queued action written under the old preference must not execute under it →
  a.suppress fires before execution, not after
- duplicate-event: a.suppress retried → correctly idempotent. **a.adapt retried → cannot be
  verified at all, since it carries no idempotencyKey — see gaps**

GAPS:
- P0 [idempotency] a.adapt has no idempotencyKey and no `writes`, despite being a state-changing
  action (it reshapes a pending action's execution) — its sibling a.suppress correctly has both.
  A retried a.adapt cannot be verified to reshape a pending action exactly once, and no record
  exists of what was adapted at all.
- P2 [observability] adapted (vs. suppressed vs. unaffected) pending actions are not distinguished
  in any retained field — x.recalculated is one exit for three different outcomes.

---

## CON-38 — Communication Suppression

READINESS: READY_WITH_MAPPING

WHY:
The most conceptually careful state in this batch: `s.g4` draws a hard, explicit line between a
sender-side hold (our own choice) and a person's own consent decision, and `s.g5` correctly refuses
to auto-resume sending on release — a suppression lifted asks for permission again rather than
treating survived silence as consent. `s.g2` (release re-evaluates, never replays a backlog) is
enforced structurally by `a.reevaluate`. Both actions' idempotencyKeys are correctly formed.

STATE AUTHORITY:
- suppression condition became active (t.suppression) → authoritative-system, explicitly rejects
  a soft delivery failure, a preference reduction, or an internal hold with no recorded reason

INSTANCE:
Scope: the person, message or journey instance the suppression applies to, at its recorded scope
Key: person_id + suppression_scope
Dedupe policy: reject-duplicate; concurrency: one-active-per-key

TRANSITIONS:
enter (t.suppression, authoritative) → a.record → c.kind → {w.release:wait, bound to
release_condition | x.persistent: suppression}; onEvent: a.reevaluate (resolve → x.released);
onTimeout: c.still → {x.persistent | a.reevaluate}

DATA: person_id, suppression_scope — instance key. reason, release_condition, suppression_log —
required.

SOURCE OF TRUTH: whether a suppression condition applies, and whether it still holds at review →
the underlying condition's own system (permission record, frequency policy, contactability check,
priority-journey state, legal/policy rule, cooldown, dedup check, human-resolution record, or
incident state — nine reasons in one mechanism, each traceable to its own source, none named as a
vendor).

CONFIG / TIME: `communication_suppression.release` — observation-window, required: true, review
horizon appropriate to the reason; "a temporary suppression whose release condition never arrives
has quietly become permanent, and the review is what forces that to be said out loud" — a genuinely
strong design rationale for why this must be config-bound.

OWNERSHIP: ownsNextAction: true throughout — no handoffs; this is the corpus's own general-purpose
suppression mechanism, not a router.

CONFLICT / PREEMPTION: none found within this state itself; CON-39 (cooldown) is `distinctFrom` as
one of the nine reasons this state generalizes over, with its own release semantics — a
specialization, not a conflict.

HANDOFF: none.

RE-ENTRY / TERMINALITY: no exit is terminal. x.persistent's re-entry is explicit: "a change to the
state that caused it opens a new evaluation... only sending is stopped" (s.g1 enforced at the exit
description itself). x.released: "any new suppression condition opens its own instance" — correctly
avoids conflating a fresh suppression reason with a resumed one.

OBSERVABILITY: enteredBy: suppression_log (append, on both actions — reason, scope, source, start
time, and release condition all captured at entry). No currentOwner (fully deterministic).
expiresAt: release_condition (attribute-referenced, present).

OUTCOMES: resolution: x.released — neutral: x.persistent (by design, not a failure — a legal hold
correctly staying suppressed is success, not diagnostic).

TEST CASES:
- entry: permission withdrawn, a frequency policy, a contactability failure, a priority conflict,
  a legal restriction, a cooldown, a duplicate, a human resolution, or an incident → c.kind
- insufficient-evidence: a soft delivery failure, a preference reduction, an unreasoned internal
  hold → does not enter
- timeout: release_condition never arrives → c.still forces an explicit persistent-vs-lapsed call
  rather than silently staying open forever
- re-entry: release_condition_met fires → a.reevaluate re-derives current eligibility, discards
  backlog, does not replay
- duplicate-event: a.record/a.reevaluate retried → correctly idempotent as written — no gap

GAPS: none found.

---

## FBK-48 — Declared Context Recalculation

READINESS: READY_WITH_MAPPING

WHY:
A precise, minimally-invasive state: `s.g2` restricts the declared attribute to decisions that
"genuinely depend on it" (enforced by `a.consumers`' own scoping logic, not left to a blanket
apply-everywhere pass), and `s.g1` keeps declared data structurally separate from inference. The
stable/volatile split (`c.volatility`) with a required revalidation condition on volatile
attributes is a real, working correction/decay mechanism. All idempotencyKeys are correctly formed.

STATE AUTHORITY:
- relevant context explicitly declared (t.declared) → declared-by-customer, explicitly rejects
  behaviour implying a need or a model-assigned segment

INSTANCE:
Scope: person or account plus the declared attribute, at the scope it was declared for
Key: account_id + person_id
Dedupe policy: reject-duplicate; concurrency: one-active-per-key

TRANSITIONS:
enter (t.declared, declared) → a.persist → c.volatility → {a.stable: resolve | a.volatile:
resolve, decay-bound} → a.consumers (read-only fan-out) → c.affected → {a.adapt: resolve |
x.stored: no-action}

DATA: account_id, person_id — instance key. declared_context — required.

SOURCE OF TRUTH: whether a live journey would decide differently knowing this attribute →
a.consumers' own scoping logic (deterministic, internal — not an external system).

CONFIG / TIME: no formally-named Config, but `a.volatile`'s own text requires "a validity period or
a revalidation condition" be attached — a real timing dependency stated only in prose, not bound to
a ConfigRef or an attribute the way ACQ-05's recycle_horizon_at is. Worth a documentation-level
note (see gaps) even though it is not this batch's most severe finding.

OWNERSHIP: ownsNextAction: true — no handoffs; resolves entirely within this state.

CONFLICT / PREEMPTION: CON-32 is `distinctFrom` (how someone wants to be communicated with vs. what
they're trying to achieve) — a real, useful boundary; the two states track independent facts with
no overlap risk.

HANDOFF: none.

RE-ENTRY / TERMINALITY: no exit is terminal. x.applied and x.stored both correctly re-open on the
next declaration or revalidation without special-casing.

OBSERVABILITY: enteredBy: declared_context (append, on a.persist/a.volatile). No currentOwner
(fully deterministic). No `expiresAt` field for a.volatile's own revalidation condition, despite
the graph's own text requiring one exist — a real observability/config gap (see below).

OUTCOMES: resolution: x.applied — neutral: x.stored.

TEST CASES:
- entry: a stated need, goal, situation, or context → c.volatility
- insufficient-evidence: behaviour implying a need, a model-assigned segment → does not enter
- correction: a volatile attribute past its own validity → **cannot be verified — no attribute
  or ConfigRef binds the revalidation condition, see gaps**
- duplicate-event: a.persist/a.stable/a.volatile retried → correctly idempotent as written — no
  gap

GAPS:
- P1 [config] `a.volatile`'s own text requires a validity period or revalidation condition be
  attached to every volatile declared attribute, but no attribute or ConfigRef in this state's own
  `implementation.attributes` names where that period lives — unlike ACQ-05's `recycle_horizon_at`
  or ACC-78's `review_point_at`, there is no field an implementer can point to. A company cannot
  mechanically enforce "a need stated for one quarter" not still steering decisions two years
  later, which is exactly the failure mode `a.volatile`'s own prose warns against.

---

## FBK-50 — Relationship State Reassessment

READINESS: READY_WITH_MAPPING

WHY:
The corpus's clearest evidence-vs-conclusion separation: `a.store`'s own text states a signal is
recorded "as evidence, never as a conclusion — the difference is whether anything downstream can
disagree with it later," and `c.governed` structurally refuses to create a label (LOYAL, ADVOCATE,
AT_RISK, VIP, DETRACTOR) unless a policy already defines it — x.no-label is a genuinely rare
example of a state correctly refusing to invent a business concept it wasn't given the authority
to define. `s.g4` explicitly excludes message engagement as relationship evidence. Two of three
actions' idempotencyKeys are correctly formed.

STATE AUTHORITY:
- meaningful relationship signal (t.signal) → behavioral-inference, explicitly excludes message
  opens/clicks ("which describes a message rather than a relationship") — validated by
  `c.reassess` before any state label changes, and by `c.governed` before any label is even
  assignable

INSTANCE:
Scope: person or account plus the relationship context the signal was observed in
Key: account_id + relationship_id
Dedupe policy: reject-duplicate; concurrency: one-active-per-key

TRANSITIONS:
enter (t.signal, behavioral) → a.store → c.immediate → {x.owned: no-action, ownership-elsewhere |
c.reassess → {a.reassess: read-only synthesis → c.governed → {a.assign: resolve | x.no-label:
no-action} | x.evidence: no-action}}

DATA: account_id, relationship_id — instance key. relationship_evidence,
relationship_state_history — required.

SOURCE OF TRUTH: whether accumulated evidence justifies reassessment, and whether a label is
policy-governed → the evidence set itself plus an explicit policy definition (both internal,
correctly not naming an external system since the point is the *governance*, not a vendor).

CONFIG / TIME: none — no waits; decay is applied inside `a.reassess` per-state ("satisfaction ages
quickly, tenure does not") but not bound to any named Config or attribute — worth a P2 note, lower
severity than FBK-48's since this decay logic is explicitly variable-by-state-type rather than a
single missing horizon.

OWNERSHIP: ownsNextAction: false for anything requiring immediate action (x.owned explicitly:
"the action is owned elsewhere... this one records, it does not dispatch, and duplicating the
dispatch here is how two systems respond to one event") — a precise, well-reasoned ownership
boundary. ownsNextAction: true for the evidence-accumulation/reassessment path itself.

CONFLICT / PREEMPTION: RET-21 is `distinctFrom` (recalculates engagement from behaviour on a
cadence, vs. this state's heterogeneous-signal accumulation) — a real, useful boundary; the two
could both be evaluating the same account without contradiction, since they answer different
questions from different evidence.

HANDOFF: none.

RE-ENTRY / TERMINALITY: no exit is terminal. All four exits correctly frame themselves as ongoing
accumulation rather than conclusions — x.no-label's re-entry is particularly careful: "a policy
defining the label makes it assignable later, against this same evidence" (the evidence is not
lost while waiting for governance to catch up).

OBSERVABILITY: enteredBy: relationship_evidence (append, on a.store — type, source, time, related
entity, reliability, all captured). relationship_state_history tracked separately (append, on
a.assign — which policy, which evidence). currentOwner: n/a for the evidence-only path; x.owned's
"owned elsewhere" is stated in prose but not captured as a field naming *which* other journey/state
now owns the action.

OUTCOMES: resolution: x.reassessed — neutral: x.evidence, x.owned — diagnostic: x.no-label
(evidence exists, no governance to act on it).

TEST CASES:
- entry: feedback, an outcome, a contribution, friction, a preference, an engagement change, or an
  advocacy action → c.immediate
- insufficient-evidence: a message open or click → does not enter
- conflict: a signal needing immediate action → x.owned, this state records only, does not dispatch
  (no duplicate response)
- correction: a governed label's removal criteria — evidence contradicting an assigned label
  re-enters through the same a.reassess path, in either direction, per x.reassessed's own re-entry
  note
- duplicate-event: a.store/a.assign retried → correctly idempotent. **a.reassess has no
  idempotencyKey or writes — read-only synthesis, appropriately unkeyed since it has no side
  effect of its own (c.governed and a.assign are what actually write state)**

GAPS:
- P2 [observability] x.owned states the action is "owned elsewhere" but names no field capturing
  *which* journey/state that is — a company debugging "why did nothing dispatch from this state"
  cannot trace the actual owner from this state's own data alone.
- P2 [config] evidence decay is explicitly stated as varying by what's being assessed ("satisfaction
  ages quickly, tenure does not") but no Config or attribute names the decay rate per assessment
  type — lower severity than FBK-48's gap since the corpus states this is deliberately variable,
  not a single missing horizon.

---

## FIN-131 — Financial Obligation Tracking

READINESS: READY_WITH_MAPPING

WHY:
The cleanest obligation-vs-attempt separation in the corpus: `s.g3` states reminder activity does
not define financial truth, and the entity note is explicit that "the obligation outlives every
payment attempt against it." Versioning (`a.version`) preserves prior amounts rather than
overwriting — a genuine, working correction model. All three idempotencyKeys are correctly formed
(`obligation_id` alone, matching the instance key exactly) — **no idempotency gap**. Its handoff
into TIM-62 (h.due) is clean on inspection: TIM-62 was independently audited later in this round
(see its own entry, Group J) and itself has no idempotency gap and no undeclared-field
requirement that h.due would fail to satisfy. The only finding is a single P2 documentation gap
below.

STATE AUTHORITY:
- financial obligation created (t.created) → authoritative-system, explicitly rejects an invoice
  being emailed or a reminder being scheduled as evidence that anything is owed

INSTANCE:
Scope: the obligation itself — its amount, currency, payer and the business entity it arose from
Key: obligation_id
Dedupe policy: reject-duplicate; concurrency: one-active-per-key

TRANSITIONS:
enter (t.created, authoritative) → a.record → c.already → {h.satisfy | a.outstanding: resolve →
w.obligation:wait, response-window}; onEvent: c.event → {h.satisfy | a.version: resolve →
x.adjusted | h.due}; onTimeout: x.aged

DATA: obligation_id — instance key. obligation_log — required (a deliberately minimal required-
attribute list — amount/currency/payer are named in `a.record`'s own text but not separately
declared as required attributes, worth a P2 documentation note).

SOURCE OF TRUTH: what is owed and by whom → the authoritative financial record that created the
obligation (unnamed — appropriately, since the criterion is "authoritative record," not a vendor).

CONFIG / TIME: `financial_obligation.obligation` — response-window, required: true, bound to "the
obligation's own horizon - its limitation period, its write-off point, or the end of the
relationship it belongs to" — correctly config-shaped, explicitly refuses an invented duration.

OWNERSHIP: ownsNextAction: true while outstanding; transfersOn: [h.satisfy → FIN-136, h.due →
TIM-62].

CONFLICT / PREEMPTION: FIN-132 is `distinctFrom` ("an attempt is one try at discharging an
obligation... which is exactly why they are two entities") — a real, load-bearing boundary; an
obligation and an attempt against it can and should coexist without contradiction, since a failed
attempt does not change what is owed.

HANDOFF:
- h.satisfy → FIN-136: carries the obligation, balance, currency, and the financial event's
  identifiers "so it can be applied exactly once" — clean, FIN-136's own key (obligation_id)
  already present.
- h.due → TIM-62: carries the obligation, due date, and the explicit fact that outstanding is not
  failure — clean on its own terms; TIM-62's own instance-construction requirements are audited
  under TIM-62's own entry.

RE-ENTRY / TERMINALITY: no exit is terminal. x.aged's re-entry is explicit and correctly refuses to
make an accounting decision itself: "writing it off is a policy act with its own authority, and
this journey does not make it" — a precise ownership boundary at the point where a lesser design
would have silently decided.

OBSERVABILITY: enteredBy: obligation_log (append, every action — amount, currency, payer, payee,
due date, source, related entity, settlement requirement all captured at a.record). No
currentOwner (fully deterministic). expiresAt: the wait's own horizon, present.

OUTCOMES: resolution: h.satisfy — neutral: a.outstanding (the normal state, s.g2) — diagnostic:
x.adjusted, x.aged.

TEST CASES:
- entry: an authoritative record of an amount owed → c.already
- insufficient-evidence: an invoice emailed, a reminder scheduled → does not enter
- correction: an authoritative adjustment or cancellation → a.version preserves prior amounts,
  does not overwrite
- timeout: the obligation's own horizon passes unresolved → x.aged, no write-off decided here
- duplicate-event: a.record/a.outstanding/a.version retried → correctly idempotent as written —
  no gap

GAPS:
- P2 [instance] `implementation.attributes.required` names only `obligation_id` and
  `obligation_log`, while `a.record`'s own text requires amount, currency, payer, payee, due date,
  source and related entity be captured — none of these are separately declared as required
  attributes, unlike every other state in this batch. Not a blocker (the fields are named in
  prose and clearly intended), but a documentation gap relative to this corpus's own convention.

---

## FIN-136 — Balance Reconciliation

READINESS: NEEDS_CONTRACT_WORK

WHY:
The exactly-once discipline is explicit and structural, not just stated: `s.g1` ("a payment
success is never applied twice") is enforced by `a.apply`'s own idempotent keying, and `s.g4`
(no netting across incompatible currencies) is checked before anything is applied. `s.g2`'s
"financial satisfaction does not automatically restore unrelated suspended capabilities" is
enforced by `c.restriction`'s explicit "rested on this obligation specifically" scoping — a
genuinely careful ownership boundary. All four idempotencyKeys are correctly formed (obligation_id
alone). The blocker is entirely in its handoff to ACC-79.

STATE AUTHORITY:
- authoritative financial event (t.satisfying) → authoritative-system, explicitly rejects a
  payment authorized-not-settled, a financial event naming no obligation, or a reminder/dunning
  event

INSTANCE:
Scope: the obligation and the financial event being applied to it
Key: obligation_id
Dedupe policy: reject-duplicate; concurrency: one-active-per-key

TRANSITIONS:
enter (t.satisfying, authoritative) → a.apply → a.recalculate → c.status → {a.satisfied: resolve →
c.restriction → {h.restore | x.satisfied} | a.partial: resolve → x.partial | h.overpayment}

DATA: obligation_id — instance key. obligation_log — required.

SOURCE OF TRUTH: the recalculated balance and which restrictions depend on this specific
obligation → the financial event itself plus the restriction system that recorded why a capability
was suspended (unnamed, appropriately).

CONFIG / TIME: none — no waits (a purely synchronous reconciliation).

OWNERSHIP: ownsNextAction: true for the balance itself; transfersOn: [h.overpayment, h.restore] —
both correctly scoped partial transfers (the overpayment or the restoration decision, not the
underlying obligation record, which this state continues to own via its own exits).

CONFLICT / PREEMPTION: none found — this state is itself the resolution mechanism for a specific
kind of state change (a financial event landing), not a party to a sibling conflict.

HANDOFF:
- h.overpayment → `external:overpayment-or-credit`; contract present (obligation_id, handed_at,
  reason) — well-formed.
- h.restore → ACC-79: carries the obligation and the restriction it caused, with the explicit
  instruction to revalidate rather than replay — but ACC-79's own instance key is `account_id +
  restoration_case_id`, and this state's own vocabulary contains neither field. The receiver's
  instance cannot be mechanically constructed as written — the same gap found on ACC-78's own
  h.restore into the same target, making this the second of two independent handoffs into ACC-79
  with the identical missing-identifier problem.

RE-ENTRY / TERMINALITY: no exit is terminal. x.partial's re-entry correctly states "restrictions
that depended on this obligation stay in force, because it is not discharged" — refuses to
prematurely restore on partial payment. x.satisfied's re-entry correctly treats a later reversal
as its own new financial event against a discharged balance, not a re-open of this instance.

OBSERVABILITY: enteredBy: obligation_log (append, every action). No currentOwner (fully
deterministic).

OUTCOMES: resolution: x.satisfied, h.restore — neutral: x.partial — diagnostic: h.overpayment.

TEST CASES:
- entry: an authoritative payment, credit, or settlement → a.apply
- insufficient-evidence: an authorized-not-settled payment, an event naming no obligation, a
  dunning event → does not enter
- duplicate-event: a.apply retried for the same financial event → correctly idempotent as written
  (obligation_id-keyed, "the same financial event arriving twice moves the balance once")
- handoff: h.restore fires → **cannot construct ACC-79's instance as written — see gaps**
- correction: an amount exceeding what was owed → h.overpayment, not silently absorbed

GAPS:
- P0 [handoff] h.restore → ACC-79 does not carry or mint `restoration_case_id`, which ACC-79's
  own entity.instanceKey requires — the same defect as ACC-78's own h.restore into the same
  target; two independent upstream states now share this one unresolved receiver-construction
  question. Worth resolving once, at ACC-79's own boundary (a documented `restoration_case_id`
  derivation rule), rather than twice at each caller.

---

## FUL-141 — Fulfillment Request Validation

READINESS: NEEDS_CONTRACT_WORK

WHY:
A precise responsibility-begins-here boundary: `s.g1` and `s.g2` both refuse to let a request
received, or a payment succeeding, be mistaken for acceptance — the corpus's own explicit
statement that a paid order can still be unfulfillable, cross-referenced against FIN-131's
symmetric statement that a delivered order can go unpaid. `s.g3` structurally prevents a hidden
obligation from an invalid request (enforced by `a.reject` creating none). All four actions share
the same undeclared `order_id` idempotencyKey defect.

STATE AUTHORITY:
- fulfillment request submitted (t.submitted) → authoritative-system (or declared-by-customer
  depending on the request's own origin — the graph does not distinguish, appropriately, since
  either is a valid entry as long as it's a genuine identified request), explicitly rejects a
  payment succeeding or a basket/browsed item as evidence

INSTANCE:
Scope: the fulfillment request and, once accepted, the obligation it creates
Key: request_id
Dedupe policy: reject-duplicate; concurrency: one-active-per-key

TRANSITIONS:
enter (t.submitted, authoritative) → a.capture → a.validate (read-only) → c.valid → {c.dependency
→ {a.hold: resolve → w.dependency:wait | a.accept: resolve → h.availability} | a.reject: resolve →
x.rejected}

DATA: request_id — instance key. requested_scope, recipient_id, validity_checks, dependencies,
fulfillment_log — required. No `order_id`/`obligation_id` attribute exists here, even though every
action's idempotencyKey references both — a state whose own entity note explicitly says
"acceptance is where responsibility begins... and the two must never be the same record" using
`obligation_id` in its own keys before an obligation could plausibly exist yet, for actions
(a.capture, a.validate-branch) that precede a.accept.

SOURCE OF TRUTH: whether the request passes minimum acceptance requirements → the request's own
validity checks (deterministic, internal).

CONFIG / TIME: `fulfillment_request.dependency` — observation-window, required: true, bound to
"the request's validity window" — correctly config-shaped.

OWNERSHIP: ownsNextAction: true while validating/holding; transfersOn: [h.availability → FUL-142].

CONFLICT / PREEMPTION: FIN-131 is `distinctFrom` ("this creates an obligation to deliver... they
arise from the same event and fail independently") — a real, precisely-stated non-conflict; the
two obligations are siblings from one trigger, neither one's failure implies the other's.

HANDOFF:
- h.availability → FUL-142: carries the obligation, scope, requested timing, and the explicit fact
  that nothing is reserved yet — clean, FUL-142's own key (obligation_id) is exactly what
  a.accept's own record establishes (the mechanical scan flags this as missing only because this
  state's own `implementation.attributes` never separately declares `obligation_id`, even though
  a.accept's own text says it "creates the fulfillment obligation" — a naming/declaration gap
  rather than a real provenance gap, see below).

RE-ENTRY / TERMINALITY: no exit is terminal. x.rejected and x.lapsed both correctly frame
themselves as producing no obligation, with re-entry via a fresh, independently-validated request
rather than a resumed one.

OBSERVABILITY: enteredBy: fulfillment_log (append, every action). No currentOwner (fully
deterministic). expiresAt: the dependency wait's own window, present.

OUTCOMES: resolution: h.availability — failure: x.rejected — diagnostic: x.lapsed.

TEST CASES:
- entry: a request to deliver an identified item/service/scope to an identified recipient →
  a.validate
- insufficient-evidence: a payment succeeding alone, a basket item, a browsed slot → does not
  enter
- timeout: a held dependency's validity window passes unmet → x.lapsed, no obligation created
- duplicate-event: a.capture/a.reject/a.hold/a.accept retried → **cannot be verified idempotent
  as written — see gaps**

GAPS:
- P0 [idempotency] all four actions' idempotencyKeys reference `order_id`, undeclared anywhere in
  this state, and `obligation_id`, which this state's own text creates at `a.accept` but never
  formally declares as a required attribute — the real key for pre-acceptance actions
  (a.capture/a.reject/a.hold) is `request_id + <action>`; a.accept's own key is defensibly
  `request_id + <action>` too, since `obligation_id` is what it is *minting*, not consuming.
- P2 [instance] `obligation_id` should be declared as a field this state derives (via a.accept's
  own `writes`), matching the pattern used elsewhere in the corpus for a state that mints an
  identifier its own successor requires.

---

## FUL-142 — Fulfillment Allocation

READINESS: NEEDS_CONTRACT_WORK

WHY:
The catalog-vs-allocatable distinction is enforced structurally, not just stated: `s.g1`/`s.g2`
draw the line and `a.evaluate`'s own text explains why it matters ("catalog availability is a
statement about what we sell; allocatable availability is a statement about what can be committed
to this obligation now"). `s.g3`'s "the claim, not the reading, is what commits" correctly
anticipates the race FUL-143 later resolves (`h.recheck`) rather than pretending this state's own
read is authoritative. Three actions share the same undeclared `person_id` idempotencyKey defect.

STATE AUTHORITY:
- accepted fulfillment requiring resources (t.needs-resource) → authoritative-system, explicitly
  rejects a catalog figure, an obligation with no resource requirement, or a payment succeeding

INSTANCE:
Scope: the obligation and the resources it requires, at the location/time serving this recipient
Key: obligation_id
Dedupe policy: reject-duplicate; concurrency: one-active-per-key

TRANSITIONS:
enter (t.needs-resource, authoritative) → a.evaluate → c.availability → {h.allocate | c.partial →
{h.allocate | a.backorder: resolve → w.capacity:wait} | a.backorder | a.unavailable: resolve →
h.unavailable}; onEvent: c.recheck → {h.allocate | a.unavailable}; onTimeout: a.unavailable

DATA: obligation_id — instance key. required_resources, location, service_window, partial_policy,
fulfillment_log — required.

SOURCE OF TRUTH: what can actually be committed, in scope and window → the resource/capacity
system (unnamed, appropriately — "catalog availability" vs. "allocatable availability" is the
graph's own distinction, not a vendor's).

CONFIG / TIME: `fulfillment_availability.capacity` — observation-window, required: true, bound to
"the obligation's tolerance window" — correctly config-shaped.

OWNERSHIP: ownsNextAction: true while waiting; transfersOn: [h.unavailable → FUL-150, h.allocate →
FUL-143].

CONFLICT / PREEMPTION: FUL-143 is `distinctFrom` ("this asks whether something exists; FUL-143
claims it... between the two, someone else can take it") — the corpus's own explicit statement of
a real, structural race condition between two adjacent states, resolved by design (the claim
commits, the reading doesn't) rather than by an unstated assumption.

HANDOFF:
- h.unavailable → FUL-150: carries the obligation and what couldn't be sourced, plus the explicit
  fact that nothing was allocated so nothing needs releasing — clean.
- h.allocate → FUL-143: carries the obligation, scope, and identified resources, plus the explicit
  fact that availability was read, not yet claimed — clean, FUL-143's own instance key
  (allocation_id) is minted downstream by FUL-143 itself, not expected from this handoff (the
  mechanical scan does not flag this handoff — correctly, since `allocation_id` doesn't exist
  until FUL-143 creates it).

RE-ENTRY / TERMINALITY: no exit nodes at all — every path is a handoff (a router, like ACQ-02).
Not a defect; nothing to assess for re-entry.

OBSERVABILITY: enteredBy: fulfillment_log (append, on every action). No currentOwner (fully
deterministic). expiresAt: the capacity wait's own window, present.

OUTCOMES: resolution: h.allocate — failure: h.unavailable — diagnostic: a.backorder (waiting, not
failed).

TEST CASES:
- entry: an accepted obligation requiring resources → c.availability
- insufficient-evidence: a catalog figure, a no-resource obligation, a payment → does not enter
- conflict: a resource read as available is claimed by another obligation first → h.recheck
  resolves it at FUL-143, not silently overwritten here
- timeout: backordered capacity never returns within tolerance → a.unavailable, stated explicitly
- duplicate-event: a.evaluate/a.backorder/a.unavailable retried → **cannot be verified idempotent
  as written — see gaps**

GAPS:
- P0 [idempotency] a.evaluate/a.backorder/a.unavailable idempotencyKeys reference undeclared
  `person_id`; real key is `obligation_id + <action>`.

---

## FUL-143 — Resource Reservation

READINESS: NEEDS_CONTRACT_WORK

WHY:
The most careful scoping discipline in the fulfillment chain: `s.g3` states a release "affects
only this obligation's allocation, never another's or a shared claim," enforced by `a.release`'s
own text explaining exactly why a broader release would fail unrelated obligations elsewhere.
`s.g4` requires every temporary reservation to carry an explicit expiry, enforced by the
attribute-bound wait. All five actions share the same undeclared `order_id` idempotencyKey defect
— the sole component that's wrong; `obligation_id` alongside it is correctly declared.

STATE AUTHORITY:
- resource selected for fulfillment (t.selected) → authoritative-system, explicitly rejects a
  positive catalog quantity, an obligation accepted before a specific resource is identified, or
  a reservation that lost its race

INSTANCE:
Scope: the allocation itself — a link between a specific resource quantity and one obligation
Key: allocation_id
Dedupe policy: reject-duplicate; concurrency: one-active-per-key

TRANSITIONS:
enter (t.selected, authoritative) → a.reserve → c.confirmed → {c.temporary → {a.temporary: resolve
→ w.allocation:wait, attribute-bound | a.allocated: resolve → w.allocation:wait} | h.recheck};
onEvent: c.event → {x.consumed: resolve | a.release: resolve → x.released | h.exception};
onTimeout: a.expire → x.expired

DATA: allocation_id — instance key. obligation_id, resource_ref, quantity,
reservation_expires_at, allocation_log — required.

SOURCE OF TRUTH: whether the resource system accepted the claim → the resource/inventory system of
record itself (the claim, not a reading of it — the graph's own explicit epistemics).

CONFIG / TIME: `resource_allocation.allocation` — attribute-bound to `reservation_expires_at`,
required: true — correctly config-shaped, and the entity note explicitly requires an expiry or
release condition on every temporary reservation, matching s.g4.

OWNERSHIP: ownsNextAction: true while held; transfersOn: [h.recheck → FUL-142, h.exception →
FUL-145].

CONFLICT / PREEMPTION: this is the corpus's own explicit resolution of the FUL-142/FUL-143 race
(see FUL-142's own entry) — h.recheck is the enforcement mechanism, not a gap.

HANDOFF:
- h.recheck → FUL-142: carries the obligation and what it still needs, plus the explicit reasoning
  that this is exactly the concurrency the availability check cannot prevent — clean, FUL-142's
  own key (obligation_id) already present via this state's own vocabulary.
- h.exception → FUL-145: carries the obligation, the lost resource, and the fact that the rest of
  the allocation is unaffected — but FUL-145's own instance key is `exception_id`, a field this
  state never declares or mints. The receiver's instance cannot be mechanically constructed from
  this handoff as written.

RE-ENTRY / TERMINALITY: no exit is terminal. x.expired's re-entry correctly distinguishes lapsed
from consumed and released — "three different endings that mean three different things about the
obligation" (a.expire's own text) — a genuinely careful terminality-adjacent distinction even
though none of the three endings is itself terminal.

OBSERVABILITY: enteredBy: allocation_log (append, every action). No currentOwner (fully
deterministic). expiresAt: reservation_expires_at, present.

OUTCOMES: resolution: x.consumed — neutral: x.released — diagnostic: x.expired, h.exception.

TEST CASES:
- entry: a specific resource identified for a specific obligation → c.confirmed
- insufficient-evidence: a positive catalog quantity, a pre-resource acceptance, a lost race →
  does not enter
- conflict: the resource system rejects the claim (lost to another) → h.recheck, not silently
  retried here
- timeout: a temporary reservation's expiry passes unconsumed → a.expire, capacity returned,
  distinguished from release/consumption
- duplicate-event: a.reserve retried for the same resource/obligation → correctly idempotent by
  design (s.g1: "allocation is idempotent"), **but the actual key string references undeclared
  order_id — see gaps**
- handoff: h.exception fires → **cannot construct FUL-145's instance as written — see gaps**

GAPS:
- P0 [idempotency] all five actions' idempotencyKeys reference undeclared `order_id`; real key is
  `allocation_id + <action>` (obligation_id, already present, may also belong depending on
  whether dedup should scope per-allocation or per-obligation-attempt — a company mapping this
  will need to decide which).
- P1 [handoff] h.exception → FUL-145 does not carry or mint `exception_id`, which FUL-145's own
  entity.instanceKey requires.

---

## FUL-144 — Fulfillment Execution

READINESS: NEEDS_CONTRACT_WORK

WHY:
The strongest business-outcome-vs-internal-step separation in this batch: `s.g1` states an
internal task succeeding is not fulfillment completed "where the required business outcome has not
been confirmed," directly enforced by `a.fulfilled`'s own text. `s.g2`/`s.g3` correctly protect
partial completion from being destroyed by a later failure on the remaining scope — genuinely
careful correction semantics. All four actions share the same undeclared `order_id`
idempotencyKey defect; `obligation_id` alongside it is correctly declared.

STATE AUTHORITY:
- fulfillment execution started (t.started) → authoritative-system, explicitly rejects an internal
  task with no allocation behind it, a dispatch label created, or a payment

INSTANCE:
Scope: the fulfillment obligation and the scope of it that has been satisfied
Key: obligation_id
Dedupe policy: reject-duplicate; concurrency: one-active-per-key

TRANSITIONS:
enter (t.started, authoritative) → a.in-fulfillment → w.execution:wait, observation-window;
onEvent: c.outcome → {a.fulfilled: resolve → c.dispatch → {h.dispatch | h.confirm} | a.partial:
resolve → x.partial | h.exception | a.failed: resolve → h.remedy}; onTimeout: h.delay

DATA: obligation_id — instance key. allocated_resources, expected_window, satisfied_scope,
remaining_scope, fulfillment_log — required.

SOURCE OF TRUTH: what scope execution actually reached → the confirmed business outcome, distinct
from an internal task's own success signal (the graph's own explicit epistemics, not a system to
name).

CONFIG / TIME: `fulfillment_execution.execution` — observation-window, required: true, bound to
"the expected fulfillment window" — correctly config-shaped; the timeout explicitly routes to a
delay state, not a failure ("exceeding the window is a timing problem rather than a failure").

OWNERSHIP: ownsNextAction: true while executing; transfersOn: [h.delay → FUL-146, h.dispatch →
FUL-147, h.confirm → FUL-149, h.exception → FUL-145, h.remedy → FUL-150].

CONFLICT / PREEMPTION: OPS-130 is `distinctFrom` (a technical job's own state vs. a real delivery
obligation's satisfied scope) — a real, useful boundary against conflating infrastructure success
with business fulfillment.

HANDOFF:
- h.delay → FUL-146: carries the obligation, original commitment, and scope so far — clean.
- h.dispatch → FUL-147: carries obligation/recipient/destination and the explicit fact that
  dispatch transfers execution, not the obligation itself — but FUL-147's own instance key is
  `dispatch_id`, undeclared/unminted here. Receiver construction unverifiable as written.
- h.confirm → FUL-149: carries the obligation and satisfied scope, with delivery evidence — but
  FUL-149's own instance key includes `delivery_id`, undeclared/unminted here.
- h.exception → FUL-145: carries the exception, affected scope, and completed scope separately —
  but FUL-145's own instance key is `exception_id`, undeclared/unminted here (the same gap FUL-143
  independently has into the same target).
- h.remedy → FUL-150: carries failed and completed scope separately, plus the explicit fact that
  financial consequence is a separate lifecycle — clean, FUL-150's own key is unaffected by this
  gap pattern per the mechanical scan.

RE-ENTRY / TERMINALITY: only one exit node, x.partial, non-terminal; re-entry explicit: "the
remaining scope continues its own execution... what was delivered is delivered, and what is owed
is stated rather than implied" — precisely scoped, avoids re-litigating completed work.

OBSERVABILITY: enteredBy: fulfillment_log (append, every action). No currentOwner (fully
deterministic). expiresAt: the execution wait's own window, present.

OUTCOMES: resolution: a.fulfilled (via h.dispatch/h.confirm) — neutral: x.partial — failure:
a.failed (via h.remedy) — diagnostic: h.delay, h.exception.

TEST CASES:
- entry: an obligation with resources allocated, entering execution → w.execution
- insufficient-evidence: an unallocated internal task, a dispatch label, a payment → does not
  enter
- timeout: the expected window passes with no outcome reported → h.delay, framed as timing, not
  failure
- correction: a partial completion followed by a later failure on the remainder → the completed
  scope stays preserved, not retroactively marked failed
- duplicate-event: a.in-fulfillment/a.fulfilled/a.partial/a.failed retried → **cannot be verified
  idempotent as written — see gaps**
- handoff: h.dispatch/h.confirm/h.exception fire → **three of five receivers' instances cannot be
  constructed from this state's own contract as written — see gaps**

GAPS:
- P0 [idempotency] all four actions' idempotencyKeys reference undeclared `order_id`; real key is
  `obligation_id + <action>`.
- P1 [handoff] h.dispatch → FUL-147 does not carry/mint `dispatch_id`; h.confirm → FUL-149 does
  not carry/mint `delivery_id`; h.exception → FUL-145 does not carry/mint `exception_id` — three
  independent receiver-construction gaps out of five handoffs from a single state, the highest
  concentration found in this batch so far.

---

## FUL-145 — Fulfillment Exception Recovery

READINESS: READY_WITH_MAPPING

WHY:
The best-scoped exception-handling state in the fulfillment chain: `s.g3` preserves already-
completed scope through the exception, and `a.classify`'s own text gives the exact example the
entity note promises ("a damaged unit in a multi-item obligation affects that unit, and the rest
continues on its way"). `s.g2` correctly requires approval before a substitute is treated as
acceptable — no silent substitution. All four idempotencyKeys are correctly formed (obligation_id
alone, matching the instance key exactly, plus exception_id declared separately) — no defect. This
is a router state (no exit nodes), correctly.

STATE AUTHORITY:
- material fulfillment exception (t.exception) → authoritative-system, explicitly rejects a delay
  on its own ("which changes timing rather than the ability to fulfill")

INSTANCE:
Scope: the exception and the scope of the obligation it affects
Key: exception_id
Dedupe policy: reject-duplicate; concurrency: one-active-per-key

TRANSITIONS:
enter (t.exception, authoritative) → a.classify → c.route → {a.recover: resolve → h.resume |
c.approval → {w.approval:wait, response-window | a.substitute: resolve → h.resume} | h.delay |
a.terminal: resolve → h.terminal}; onEvent: c.approved → {a.substitute | a.terminal}; onTimeout:
h.delay

DATA: exception_id — instance key. obligation_id, affected_scope, substitute_candidate,
approval_policy, fulfillment_log — required.

SOURCE OF TRUTH: what can resolve the exception, and whether a substitute requires approval → the
operational problem's own classification plus a stated approval policy (deterministic, internal).

CONFIG / TIME: `fulfillment_exception.approval` — response-window, required: true; "no answer is
not consent to substitute — the obligation becomes late rather than becoming something different"
— correctly config-shaped, and the timeout's own destination (h.delay, not silent substitution) is
a genuinely careful default.

OWNERSHIP: ownsNextAction: true while resolving; transfersOn: [h.resume → FUL-144, h.delay →
FUL-146, h.terminal → FUL-150].

CONFLICT / PREEMPTION: FUL-146 is `distinctFrom` ("an exception is something going wrong with the
ability to fulfill; a delay is the same obligation arriving later... where an exception only
changes timing, it hands to FUL-146 rather than resolving as one") — a precise, load-bearing
boundary enforced by c.route's own branching, not left as an unstated assumption.

HANDOFF:
- h.resume → FUL-144: carries the resolved exception and preserved completed scope — clean,
  FUL-144's own key (obligation_id) already present.
- h.delay → FUL-146: carries cause, affected scope, and unchanged original commitment — clean.
- h.terminal → FUL-150: carries affected scope and reason, with completed scope kept separate —
  clean, FUL-150's own key (obligation_id) already present.

RE-ENTRY / TERMINALITY: no exit nodes — pure router, every path a handoff.

OBSERVABILITY: enteredBy: fulfillment_log (append, every action). No currentOwner (fully
deterministic, except w.approval which is genuinely awaiting an external decision — no field names
who is being waited on, a minor observability gap). expiresAt: the approval wait's own window,
present.

OUTCOMES: resolution: h.resume — neutral: h.delay — failure: h.terminal.

TEST CASES:
- entry: a resource unavailable, damaged item, provider unavailable, misconfiguration, lost
  capacity, destination problem, dependency failure, or quality failure → c.route
- insufficient-evidence: a delay alone → does not enter (routes via FUL-146's own trigger instead)
- conflict: a substitute exists but the recipient would care about the difference → w.approval,
  never assumed acceptable
- timeout: no approval answer within the window → h.delay, not silent substitution
- duplicate-event: a.classify/a.recover/a.substitute/a.terminal retried → correctly idempotent as
  written — no gap

GAPS:
- P2 [observability] w.approval names no field capturing who the approval decision is being
  waited on (the recipient vs. an internal business approver) — a company debugging a stalled
  exception cannot tell from this state's own data who the ball is with.

---

## FUL-147 — Delivery Outcome Tracking

READINESS: NEEDS_CONTRACT_WORK

WHY:
The provider-timeout-is-not-a-failure discipline is exactly right and explicit (`s.g3`), and
`a.unknown`'s own text correctly refuses to re-execute against an unknown outcome ("re-sending
against an unknown produces two of the thing"). `s.g4`'s "duplicate delivery events are idempotent"
is a stated guarantee this state's own actions don't quite deliver as written — both actions'
idempotencyKeys reference undeclared `order_id`.

STATE AUTHORITY:
- fulfillment handed to a delivery executor (t.handoff) → authoritative-system, explicitly
  rejects a label printed or a job created ("which prepares a dispatch rather than performing
  one")

INSTANCE:
Scope: the handoff to a delivery executor, and the obligation behind it
Key: dispatch_id
Dedupe policy: reject-duplicate; concurrency: one-active-per-key

TRANSITIONS:
enter (t.handoff, authoritative) → a.persist → w.delivery:wait, external-window; onEvent:
c.outcome → {h.confirm | h.failed | h.delay}; onTimeout: a.unknown → h.reconcile

DATA: dispatch_id — instance key. obligation_id, executor, expected_delivery_window,
delivery_log — required.

SOURCE OF TRUTH: what the delivery executor authoritatively reports → the executor's own tracking
system (unnamed, appropriately).

CONFIG / TIME: `dispatch_and.delivery` — external-window, required: true, "the expected delivery
window plus its tolerance" — correctly config-shaped; the timeout explicitly reframes as a
visibility fact about "us," not a fact about the parcel.

OWNERSHIP: ownsNextAction: true while tracking; transfersOn: [h.confirm → FUL-149, h.failed →
FUL-148, h.delay → FUL-146, h.reconcile → `external:external-status-reconciliation`].

CONFLICT / PREEMPTION: INT-114 is `distinctFrom` (the generic external-operation shape has no room
for a recipient who may refuse, or intermediate tracking updates that look like results) — a real,
domain-specific boundary correctly justifying this state's own existence rather than reusing a
generic pattern.

HANDOFF:
- h.reconcile → `external:external-status-reconciliation`; contract present (order_id,
  obligation_id, handed_at, reason); `suppresses` any re-dispatch until true state is established
  — well-formed on its own terms (though its own `order_id` requirement is undeclared here too —
  the same gap surfacing in the contract itself, not just the idempotencyKeys).
- h.confirm → FUL-149: carries proof and timing — FUL-149's own key includes `delivery_id`,
  undeclared/unminted here.
- h.failed → FUL-148: carries the unclassified failure and the undischarged obligation — clean,
  FUL-148's own key (`delivery_attempt_id`) is what FUL-148 itself presumably mints on entry.
- h.delay → FUL-146: carries revised expectation and original commitment — clean.

RE-ENTRY / TERMINALITY: no exit nodes — pure router.

OBSERVABILITY: enteredBy: delivery_log (append, every action). suppressed_sends tracked
separately on a.unknown. No currentOwner (fully deterministic). expiresAt: the delivery wait's own
window, present.

OUTCOMES: resolution: h.confirm — failure: h.failed — diagnostic: h.delay, h.reconcile
(unknown, explicitly not treated as failure).

TEST CASES:
- entry: a prepared item/service passing to a delivery executor → w.delivery
- insufficient-evidence: a label printed, a job created → does not enter
- timeout: the delivery window plus tolerance passes with nothing reported → a.unknown, framed as
  a visibility gap, not a failure — no re-dispatch triggered
- duplicate-event: a.persist/a.unknown retried, or the same delivery event arriving twice →
  **cannot be verified idempotent as written despite s.g4's own guarantee — see gaps**

GAPS:
- P0 [idempotency] a.persist/a.unknown idempotencyKeys reference undeclared `order_id`; real key
  is `dispatch_id + <action>` — the gap directly undercuts this state's own stated guarantee
  (s.g4: "duplicate delivery events are idempotent").
- P1 [handoff] h.confirm → FUL-149 does not carry/mint `delivery_id`, which FUL-149's own
  instance key requires alongside `obligation_id` (already present).
- P2 [config] h.reconcile's own `contract.requiredFields` names `order_id`, the same undeclared
  field driving the idempotencyKey gap above — worth fixing once at the source.

---

## FUL-149 — Delivery Acceptance Finalization

READINESS: NEEDS_CONTRACT_WORK

WHY:
The delivered-vs-accepted separation is exactly right, with `s.g2` explicitly refusing to invent
an acceptance window beyond what policy defines, and `s.g4` correctly preserving later rights
(warranty, statutory return period) that finalisation does not extinguish. Both actions'
idempotencyKeys reference undeclared `order_id`/`person_id`.

STATE AUTHORITY:
- authoritative delivery completion (t.delivered) → authoritative-system, explicitly rejects a
  carrier scan, a dispatch, or an internal task closing

INSTANCE:
Scope: the delivered fulfillment and the recipient whose acceptance may still be required
Key: obligation_id + delivery_id
Dedupe policy: reject-duplicate; concurrency: one-active-per-key

TRANSITIONS:
enter (t.delivered, authoritative) → a.record → c.acceptance → {w.acceptance:wait,
attribute-bound → onEvent: c.response → {a.finalize: resolve | h.issue}; onTimeout: a.finalize |
c.window → {w.window:wait, attribute-bound → onEvent: h.issue; onTimeout: a.finalize | a.finalize}}

DATA: obligation_id, delivery_id — instance key. acceptance_required, acceptance_window_ends_at,
issue_window_ends_at, proof_of_delivery, delivery_log — required.

SOURCE OF TRUTH: whether the recipient has what was owed, and whether they accepted it →
authoritative delivery confirmation, then the recipient's own explicit response (both correctly
distinguished, never inferred from silence beyond the stated deemed-acceptance window).

CONFIG / TIME:
- `delivery_acceptance.acceptance` — attribute-bound to `acceptance_window_ends_at`, required:
  true
- `delivery_acceptance.window` — attribute-bound to `issue_window_ends_at`, required: true
Both correctly config-shaped, with `s.g2`'s own reasoning stated as the rationale for requiring
them rather than inventing a default.

OWNERSHIP: ownsNextAction: true while waiting; transfersOn: [h.issue → REM-151].

CONFLICT / PREEMPTION: none found — this state is downstream of a single delivery event with no
sibling contest.

HANDOFF:
- h.issue → REM-151: carries the delivery record, proof, and what the recipient says is wrong —
  REM-151's own instance key is `issue_id`, undeclared/unminted here (the same identifier-
  provenance pattern found repeatedly into REM-151 in the communication-layer round, now also
  found on the silent side).

RE-ENTRY / TERMINALITY: only one exit, x.finalized, non-terminal; re-entry explicit: "later rights
that policy provides independently are exercised on their own terms and do not reopen this state"
— correctly refuses to conflate a warranty claim with reopening the delivery record.

OBSERVABILITY: enteredBy: delivery_log (append, on a.record — proof of delivery captured and kept
attached, per s.g3). fulfillment_log tracked separately on a.finalize. No currentOwner (fully
deterministic).

OUTCOMES: resolution: x.finalized — diagnostic: h.issue.

TEST CASES:
- entry: an authoritative confirmation the recipient has what was owed → c.acceptance
- insufficient-evidence: a carrier scan, a dispatch, an internal task closing → does not enter
- timeout: acceptance_window_ends_at or issue_window_ends_at passes with no response → a.finalize,
  the stated deemed-completion policy, not an invented one
- correction: a warranty or statutory right exercised after finalisation → its own separate path,
  does not reopen this instance
- duplicate-event: a.record/a.finalize retried → **cannot be verified idempotent as written — see
  gaps**

GAPS:
- P0 [idempotency] a.record/a.finalize idempotencyKeys reference undeclared `order_id`/
  `person_id`; real key is `obligation_id + delivery_id + <action>`.
- P1 [handoff] h.issue → REM-151 does not carry or mint `issue_id`, which REM-151's own instance
  key requires — the same recurring identifier-provenance pattern the communication-layer round
  found and fixed on three of REM-151's other upstream handoffs (SCH-180, FUL-148, REM-152); this
  is a fourth, previously unaudited instance of the identical gap into the same target.

---

## FUL-150 — Fulfillment Cancellation Reconciliation

READINESS: READY_WITH_MAPPING

WHY:
The most careful three-way-scope discipline in the fulfillment chain: `s.g4` refuses to erase
completed history, `s.g5` scopes resource release strictly to this obligation's own allocation
(mirroring FUL-143's identical guarantee), and `s.g2` correctly suppresses recovery outreach
entirely for fraud/compliance/manual-review cancellations — "the reason it was cancelled is the
reason not to chase it." `s.g6` correctly hands the financial question to FIN-137 rather than
deciding it here. All six idempotencyKeys are correctly formed (obligation_id alone) — no defect,
the cleanest state in the fulfillment chain on this dimension.

STATE AUTHORITY:
- fulfillment cancellation effective (t.effective) → authoritative-system, explicitly rejects a
  cancellation merely *requested* ("which is an intent until it becomes effective")

INSTANCE:
Scope: the obligation, split into completed / in-progress / not-started scopes
Key: obligation_id
Dedupe policy: reject-duplicate; concurrency: one-active-per-key

TRANSITIONS:
enter (t.effective, authoritative) → a.record → a.stop → a.release → c.completed → {a.preserve:
resolve → c.dispatched | c.dispatched} → {a.intercept: resolve → c.external | c.external} →
{a.verify: resolve → c.financial | c.financial} → {h.financial | x.cancelled: resolve}

DATA: obligation_id — instance key. fulfillment_log, suppressed_sends, allocation_log,
delivery_log — required.

SOURCE OF TRUTH: whether cancellation took effect at an external party → the external party's own
confirmation ("a cancellation accepted by our system and not by theirs still produces the thing we
cancelled" — a.verify's own explicit epistemics, correctly refusing to assume).

CONFIG / TIME: none — no waits (a purely synchronous reconciliation cascade).

OWNERSHIP: ownsNextAction: true throughout; transfersOn: [h.financial → FIN-137] — a correctly
scoped partial transfer (the refund decision only, explicitly stated as undecided by this state).

CONFLICT / PREEMPTION: FIN-137 is `distinctFrom` ("stopping a delivery and returning money are
different decisions with different authority... this journey hands the financial question to the
lifecycle that owns it") — a precise, load-bearing ownership boundary, enforced structurally by
h.financial's own scope (this state never decides refund eligibility itself).

HANDOFF:
- h.financial → FIN-137: carries completed and cancelled scope separately, plus the explicit fact
  that no refund decision has been made — clean, FIN-137's own construction from this handoff is
  unflagged by the mechanical scan.

RE-ENTRY / TERMINALITY: only one exit, x.cancelled, non-terminal; re-entry explicit: "the remaining
obligation is explicitly zero for the cancelled scope and unchanged for whatever was delivered. A
new request for the same thing is a new obligation" — a precise, correctly-scoped boundary against
resurrecting a cancelled obligation via a superficially similar new request.

OBSERVABILITY: enteredBy: fulfillment_log (append, on a.record/a.preserve/a.verify).
suppressed_sends, allocation_log, delivery_log each tracked separately on their own actions — the
most granular observability model in this batch, correctly separating four different kinds of
"what happened" rather than collapsing them into one log. No currentOwner (fully deterministic).

OUTCOMES: resolution: x.cancelled — diagnostic: h.financial (refund question open elsewhere).

TEST CASES:
- entry: an authoritative cancellation that has taken effect → a.record
- insufficient-evidence: a cancellation merely requested → does not enter
- correction: partial scope already completed before cancellation → a.preserve keeps it, does not
  discard or falsely mark the whole obligation cancelled
- conflict: cancellation reason is fraud/compliance/manual-review → recovery outreach suppressed
  entirely by design (s.g2), not merely discouraged
- duplicate-event: a.record/a.stop/a.release/a.preserve/a.intercept/a.verify retried → correctly
  idempotent as written — no gap

GAPS: none found.

---

## IDN-87 — Authentication Risk Assessment

READINESS: READY_WITH_MAPPING

WHY:
The corpus's clearest behavioral-inference-never-becomes-conclusive example on the security side:
`s.g2` states a risk model's output "orders investigation and concludes nothing," enforced
structurally by `a.evaluate`'s own text ("what it produces is a case to look at, not an
attacker"). `s.g3`'s smallest-necessary-scope requirement is enforced by `a.restrict`'s own text.
Both actions' idempotencyKeys are correctly formed (account_id alone) — no defect.

STATE AUTHORITY:
- authentication failure pattern (t.pattern) → behavioral-inference, explicitly validated before
  anything acts on it: c.assessment routes ordinary-error signals to x.normal with no restriction
  applied at all, and even the "material security risk" branch only ever authorizes the smallest
  justified restriction, never a conclusive compromise finding — the inference opens a case, never
  a verdict

INSTANCE:
Scope: the account plus the authentication activity observed against it
Key: account_id
Dedupe policy: reject-duplicate; concurrency: one-active-per-key

TRANSITIONS:
enter (t.pattern, behavioral, validated by c.assessment) → a.evaluate → c.assessment → {x.normal:
no-action | h.recovery | a.restrict: resolve → h.security}

DATA: account_id — instance key. security_signal_log — required.

SOURCE OF TRUTH: whether failures describe an attack or ordinary error → the failure pattern's own
context (velocity, device, credential-reset activity, session success) synthesized by the
evaluation itself, not an external system.

CONFIG / TIME: none — no waits.

OWNERSHIP: ownsNextAction: true while assessing; transfersOn: [h.recovery → IDN-88, h.security →
IDN-90].

CONFLICT / PREEMPTION: IDN-90 is `distinctFrom` ("this weighs whether failures mean anything;
IDN-90 starts from a material compromise signal and contains first. The route between them exists,
and it is deliberately a decision rather than a default") — the corpus's own explicit statement
that h.security is a judged escalation, not an automatic one; a genuinely careful ownership
boundary between assessment and containment.

HANDOFF:
- h.recovery → IDN-88: carries the failure history as context, plus the explicit fact that no
  compromise has been established — clean, IDN-88's own key (recovery_case_id) is presumably
  minted by IDN-88 itself on entry (not flagged by the mechanical scan, correctly — a recovery
  case is naturally created when recovery begins, not before).
- h.security → IDN-90: carries evidence and the restriction already applied, with the explicit
  fact that "nothing is confirmed — this is a suspicion with a scope, not a finding" — IDN-90's own
  instance key is `incident_id`, undeclared/unminted here; the same gap IDN-88 independently has
  into the same target (see IDN-88's own entry below).

RE-ENTRY / TERMINALITY: only one exit, x.normal, non-terminal; re-entry explicit: "the usual
recovery routes remain open to them, unchanged. Treating this as an attack would lock out mostly
legitimate people, which is the failure mode this branch exists to hold open" — a genuinely
careful statement of why the default path matters as much as the escalation path.

OBSERVABILITY: enteredBy: security_signal_log (append, on both actions). No currentOwner (fully
deterministic).

OUTCOMES: resolution: x.normal — neutral: h.recovery — diagnostic: h.security (suspicion, not a
finding).

TEST CASES:
- entry: authentication failures crossing a meaningful threshold, or a notable pattern → c.
  assessment
- insufficient-evidence: one failed password attempt, one failure from an unfamiliar device →
  does not enter
- conflict: a material risk signal on an account with no open incident → h.security is a scoped
  suspicion, not a confirmed compromise, and does not itself lock out the legitimate case
- duplicate-event: a.evaluate/a.restrict retried → correctly idempotent as written — no gap

GAPS:
- P1 [handoff] h.security → IDN-90 does not carry or mint `incident_id`, which IDN-90's own
  instance key requires — the same gap found independently on IDN-88's own h.security into the
  same target (see below); two independent upstream states share this one unresolved receiver-
  construction question at IDN-90's boundary.

---

## IDN-88 — Account Recovery Verification

READINESS: NEEDS_CONTRACT_WORK

WHY:
The strongest security discipline in this batch: `s.g1` states recovery "is a different route to
the same assurance, not a lower one," `s.g2` requires unsafe credentials invalidated *before*
replacement access is established (enforced by the actual node order: a.invalidate precedes
a.replace), and `s.g4` correctly prevents the recovery window from being restarted by repeated
attempts. `a.evidence`'s own text is unusually self-aware about its own attack surface ("it exists
for the case where normal authentication has already failed, which makes it the door an attacker
reaches for first"). All five actions share the same undeclared `issue_id` idempotencyKey defect.

STATE AUTHORITY:
- account recovery initiated (t.recovery) → authoritative-system, explicitly rejects a failed
  authentication with no recovery request behind it, an unidentified-account support conversation,
  or a destination supplied inside the request itself

INSTANCE:
Scope: the account plus this recovery case
Key: recovery_case_id
Dedupe policy: reject-duplicate; concurrency: one-active-per-key

TRANSITIONS:
enter (t.recovery, authoritative) → a.basis → c.incident → {h.security | a.evidence: resolve →
w.proof:wait, attribute-bound}; onEvent: c.proof → {a.invalidate: resolve → a.replace: resolve →
a.verify: resolve → x.recovered | c.next → {x.more: no-action | h.review | x.denied: resolve-
negative}}; onTimeout: x.expired

DATA: recovery_case_id — instance key. account_id, required_assurance, recovery_window_ends_at,
recovery_log — required. No `issue_id` attribute exists anywhere in this state's data model.

SOURCE OF TRUTH: whether proof reaches the required assurance level, and whether an incident is
open → the account's own security state plus the offered evidence, evaluated against a stated
assurance requirement (both internal, not a vendor).

CONFIG / TIME: `account_recovery.proof` — attribute-bound to `recovery_window_ends_at`, required:
true; "an open recovery case is a standing invitation to keep trying, and closing it is part of
not being a weaker route" — correctly config-shaped, with the window's non-restart guarantee
(s.g4) as the explicit rationale.

OWNERSHIP: ownsNextAction: true while proving; transfersOn: [h.security → IDN-90, h.review →
DEC-181].

CONFLICT / PREEMPTION: IDN-81 is `distinctFrom` ("verification establishes that a claim is true;
recovery establishes that this requester is entitled to regain control of a specific account,
which a true claim about identity does not by itself demonstrate") — a precise, load-bearing
epistemic boundary: proving *who someone is* and proving *they should get this account back* are
different facts, correctly never conflated.

HANDOFF:
- h.security → IDN-90: carries the recovery request and the explicit reasoning that recovery is
  coordinated by the incident rather than run alongside it ("a parallel recovery is exactly the
  path an attacker would take") — a genuinely careful anti-race-condition design. IDN-90's own
  instance key is `incident_id`, undeclared/unminted here — the same gap IDN-87 independently has
  into the same target.
- h.review → DEC-181: carries everything offered and the account's security state — clean.

RE-ENTRY / TERMINALITY: no exit is terminal. x.recovered's re-entry is explicit: "this recovered
one account and merged nothing. Two identities that turn out to be one person is a different
problem with different evidence" (s.g3 enforced at the exit). x.denied correctly distinguishes
repeated identical evidence from genuinely new evidence for re-entry purposes.

OBSERVABILITY: enteredBy: recovery_log (append, every action — basis, evidence, invalidation,
replacement and verification all captured). suppressed_sends tracked separately on a.invalidate.
No currentOwner (fully deterministic, except h.review's human-decision point, which names no
reviewer field — the same minor gap pattern as ACC-78's c.review).

OUTCOMES: resolution: x.recovered — neutral: x.more — failure: x.denied — diagnostic: x.expired,
h.security, h.review.

TEST CASES:
- entry: a valid recovery request against an identified account → c.incident
- insufficient-evidence: a failed authentication alone, an unidentified support conversation, a
  self-supplied destination → does not enter
- conflict: a recovery request arrives during an open security incident → h.security, coordinated
  by the incident rather than run in parallel
- timeout: recovery_window_ends_at passes without sufficient proof → x.expired, window not
  restarted by the attempts made
- correction: proof insufficient once, additional evidence offered within the window → x.more,
  same case, same window
- duplicate-event: a.basis/a.evidence/a.invalidate/a.replace/a.verify retried → **cannot be
  verified idempotent as written — see gaps**

GAPS:
- P0 [idempotency] all five actions' idempotencyKeys reference undeclared `issue_id`; real key is
  `recovery_case_id + account_id + <action>`.
- P1 [handoff] h.security → IDN-90 does not carry or mint `incident_id`, which IDN-90's own
  instance key requires — the same gap found independently on IDN-87's own h.security into the
  same target; worth resolving once at IDN-90's own boundary rather than twice at each caller.
- P2 [observability] h.review's human decision point names no reviewer/owner field, the same
  pattern found on ACC-78's c.review.

---

## IDN-89 — Identity Attribute Update

READINESS: NEEDS_CONTRACT_WORK

WHY: Instance model, transitions, exits and versioning discipline are sound, but 4 of 5
actions key on `person_id`, a field this journey never declares — the same systemic
idempotency defect seen throughout the identity/access domains.

INSTANCE: `[account_id, attribute_id]`, one-active-per-key. Correctly composite — the note
explains why: an account changing two attributes at once is two independent instances, each
resolvable on its own timeline, which matches the "each dependent reconciled on its own terms"
design.

STATE AUTHORITY: `declared-by-customer` (holder-requested) or `authoritative-system`
(source-fed) at entry (t.change, evidence.source: authoritative). `c.verification` /
`c.verified` gate sensitive changes behind actual control verification — s.g4 explicitly bars
applying a sensitive change "on the strength of an existing session alone." Authority is sound.

ENTRY-TRANSITIONS: `enter` (t.change) → `progress` (c.verification/a.verify) or directly to
`c.valid` for non-sensitive attributes → `resolve` (a.update/a.propagate/a.reconcile → one of 4
exits). No supersede/cancel/reopen kinds appear, correctly — a competing concurrent change to
the same `(account_id, attribute_id)` is excluded by the instance key itself, not by a
transition rule.

DATA: required = account_id, attribute_id, previous_value, requested_value,
verification_policy, dependents, identity_change_log. `person_id` is used in every
idempotencyKey but is absent from this list.

SOURCE OF TRUTH: the authoritative identity record; verification result read from
`w.verification`'s two named events (verification_succeeded/failed), not inferred from
elapsed time or session presence.

CONFIG-TIME: `w.verification.timeout` — key `identity_attribute.verification`, class
`response-window`, required: true. Correctly bound, no prose-only timing.

OWNERSHIP: this journey owns the identity record change and the propagate step, but explicitly
hands ownership of each dependent's own consequences to that dependent's own journey
("contactability, permission and credential lifecycles are separately triggered") — a correct,
narrow ownership boundary, not a silent cascade.

CONFLICT-PREEMPTION: none declared, none needed — the composite instance key is itself the
exclusivity mechanism for this domain.

HANDOFF: none. Self-contained; `x.reconciled`'s reEntry note is effectively a documented
fan-out to other journeys rather than a graph handoff, which is the correct shape since those
journeys have their own independent eligibility.

RE-ENTRY-TERMINALITY: none of the 4 exits are terminal. `x.not-applied` and `x.rejected` both
state explicitly that nothing partial was written, so re-entry is clean. No terminal state
exists for this domain, correctly — an identity attribute can always change again.

OBSERVABILITY: `identity_change_log` (append) covers every write. There is no structured
`origin`/`version` field even though `a.propagate`'s own description ("carrying origin and
version, so a stale update arriving late cannot restore the previous value" — s.g3) depends on
exactly those two values existing somewhere queryable.

OUTCOMES: resolution = x.reconciled, x.updated; failure = x.rejected; neutral =
x.not-applied. No diagnostic-only outcome — consistent with a journey that has no ambiguous
middle state.

TEST CASES:
- entry: sensitive attribute change requiring verification → a.verify → w.verification.
- insufficient-evidence: non-sensitive attribute with malformed value → x.rejected.
- timeout: w.verification unanswered within window → x.not-applied, attribute unchanged.
- correction: propagated update carries an older version than the dependent already holds →
  dependent discards it (tests s.g3, which the missing origin/version field above undercuts).
- concurrent-instance: two changes to different attributes on the same account proceed as
  independent instances (tests the composite instance key).

GAPS:
- P0 (idempotency): `account_id + person_id + <action>` used on a.sensitivity, a.update,
  a.propagate, a.reconcile; `person_id` is not a declared attribute of this journey.
- P1 (correction): `origin` and `version`, load-bearing for s.g3's late-arrival discard rule,
  are not declared as required attributes or dependents fields — the rule has no data to run
  against.
- P2 (idempotency): `a.verify` carries neither an idempotencyKey nor a writes entry; it only
  triggers the wait. Likely intentional (no direct write), but worth confirming it can't
  double-fire a verification challenge on retry.

---

## IDN-90 — Suspected Account Compromise

READINESS: NEEDS_CONTRACT_WORK

WHY: The strongest example in this batch of a `behavioral-inference` trigger handled
correctly end to end — validated before any conclusive action, contained reversibly, and
never allowed to become "confirmed" by elapsed time alone. Idempotency is clean. The blocker is
downstream: the two handoffs it shares with ACC-78 and FIN-136 into the same target both carry
an unresolved P0, which this audit's readiness methodology treats as blocking regardless of
where in the corpus the actual fix belongs (see finding below — a single fix to ACC-79's own
receiving contract closes this and three sibling instances at once).

INSTANCE: `[incident_id]`, one-active-per-key. The incident is its own record, separate from
the account, which is the right granularity — a second unrelated signal on the same account
opens a second incident rather than reusing this one.

STATE AUTHORITY: `behavioral-inference` at entry (t.signal, evidence.source: inferred) —
explicitly gated: `insufficientAlone` rules out a single failed login or an unfamiliar-location
login with no consequential action. The inferred signal only opens investigation
(`c.containment`); it never itself produces `a.confirmed`. Confirmation requires `c.outcome`
to resolve to "compromise confirmed" from investigation evidence — this is the corpus's
cleanest instance of "a behavioral signal must not silently become a conclusive state."

ENTRY-TRANSITIONS: `enter` (t.signal) → `progress` (a.scope → c.containment → a.contain or
a.open) → `resolve` (w.resolution → c.outcome → a.confirmed/a.cleared) → `handoff` (h.recover /
h.lift) or `expire` (w.resolution timeout → c.inconclusive → x.continued or h.review). No
`supersede`/`reverse` kind, correctly — containment is designed as reversible-by-construction
(s.g2/s.g3), not as a state that gets superseded.

DATA: incident_id, account_id, signal, scope, containment_applied, review_sla,
security_incident_log — all referenced attributes are declared. No gap.

SOURCE OF TRUTH: `w.resolution` waits on `owner_verified` / `security_review_concluded`, both
named, authoritative events — engagement or elapsed time never substitutes for either.

CONFIG-TIME: `w.resolution.timeout` — key `suspected_account.resolution`, class
`decision-sla`, required: true, with an explicit cost-of-delay rationale ("costing a
possibly-innocent person their access every day it continues"). Correctly bound.

OWNERSHIP: this journey owns containment and the incident record for its full life; ownership
transfers explicitly at h.recover/h.lift (to ACC-79, for restoration) and at h.review (to
DEC-181, for a stalled decision). No ambiguous shared ownership window.

CONFLICT-PREEMPTION: distinguished by name from ACC-78 (`distinctFrom`) — suspension restricts
for a stated, resolvable business reason; this restricts on incomplete adversarial evidence.
The two can plausibly be open concurrently on the same account (different `instanceKey`
domains — account-level suspension vs. incident-level), which is correct but is not declared
anywhere as a `ConflictRef`; nothing states whether a suspension and a compromise investigation
should be visible to each other. P2, not P0 — no evidence either state's orchestration would
misbehave if both are open, just that a reviewer can't currently see the pairing.

HANDOFF: h.recover→ACC-79 and h.lift→ACC-79 both omit a `contract.requiredFields` block. Per
the ACC-79 audit (body-A), ACC-79's own receiving side needs a `restoration_case_id` it cannot
derive from either sender's declared vocabulary — this is the **third and fourth** instance of
the same unprovenanced-handoff gap into ACC-79, after ACC-78 and FIN-136. h.review→DEC-181 also
has no contract block, consistent with the corpus-wide pattern of `DEC-181`-targeted handoffs
generally omitting one (lower severity — DEC-181 is a general review router, not a
narrow-keyed instance).

RE-ENTRY-TERMINALITY: only exit is `x.continued`, non-terminal by design — "suspected remains
suspected — it does not become confirmed by lasting longer" is stated explicitly as the reason
re-entry (continued investigation) is always possible rather than the SLA breach forcing a
verdict. This is deliberate and correct, not a gap.

OBSERVABILITY: `security_incident_log` plus named fields (`scope`, `containment_applied`)
answer why-active/since-when/what-was-restricted. No `currentOwner` field once past `h.review`,
but ownership at that point has explicitly transferred to DEC-181, so there is nothing left for
this journey to observe.

OUTCOMES: resolution = h.recover (confirmed→restore), h.lift (cleared→restore); diagnostic =
x.continued, h.review (SLA breached, still open). No failure outcome — appropriate, since even
a confirmed compromise is a successful containment, not a journey failure.

TEST CASES:
- entry: consequential action + suspicious session → a.scope → c.containment → a.contain.
- insufficient-evidence: single failed login alone → journey does not open (evidence.source
  gate).
- timeout: w.resolution unanswered → c.inconclusive → x.continued (loop) or h.review.
- handoff: a.confirmed → h.recover → ACC-79 (verify ACC-79 can construct restoration_case_id
  from the carried payload — currently it cannot).
- conflict: an ACC-78 suspension and an IDN-90 incident open concurrently on the same account
  (verify no orchestration ambiguity; today nothing declares the relationship either way).

GAPS:
- P0 (handoff): h.recover and h.lift both hand off to ACC-79 without a contract block; ACC-79
  needs `restoration_case_id`, which neither this journey nor ACC-78/FIN-136 (the two other
  senders into the same target) declares. Fixing ACC-79's receiving contract once would close
  all four instances at once.
- P2 (conflict): the IDN-90/ACC-78 relationship (can coexist? does either take precedence?) is
  documented in prose (`distinctFrom`) but not modeled as a `ConflictRef`.
- P2 (handoff): h.review→DEC-181 has no contract block (consistent corpus-wide pattern for
  DEC-181-targeted handoffs).

---

## REL-100 — Orphan Relationship Recovery

READINESS: NEEDS_CONTRACT_WORK

WHY: A well-reasoned state machine — explicit orphan state instead of a null field, inherited
obligations kept live, a policy end-state that stays re-openable — undercut by an idempotency
key built on a field, `relationship_id`, that this journey structurally cannot have: the whole
premise of the state is that no valid relationship exists yet.

INSTANCE: `[entity_ref, relationship_type]`, one-active-per-key. Correctly modeled — the note
is explicit that an entity missing two required relationships is two independent unresolved
states.

STATE AUTHORITY: `authoritative-system` (t.missing, evidence.source: authoritative) — the
`insufficientAlone` list correctly excludes an entity that never required the relationship, a
transient read failure, and (importantly) a relationship that's merely pending evidence, which
it correctly routes to REL-91 instead of treating as orphaned.

ENTRY-TRANSITIONS: `enter` (t.missing) → `progress` (a.state → c.replacement) → `resolve`
(a.reassign→a.revalidate→x.resumed) or `handoff` (h.manual/h.escalate) or `expire`
(w.restore timeout → c.terminal → x.terminal or h.escalate). No `correct`/`reverse` kind —
appropriate, since a.revalidate re-checks entitlement under the new relationship rather than
rewriting anything.

DATA: required = entity_ref, relationship_type, replacement_candidates, holding_scope,
resolution_sla, orphan_log. `relationship_id` is not on this list, and — unlike the identity
domain's `person_id` gap, which is merely undeclared — there is no natural place to declare it,
because a confirmed relationship (and its id) is exactly what this journey exists to not have
yet.

SOURCE OF TRUTH: `w.restore` recheck note explicitly re-reads the entity from the system of
record before acting on a timeout, rather than trusting a stale read. Good discipline.

CONFIG-TIME: `w.restore.timeout` — key `orphaned_entity.restore`, class `decision-sla`,
required: true. Correctly bound.

OWNERSHIP: this journey owns the entity while orphaned (a.hold keeps it in an explicit,
queryable, escalatable holding scope rather than a null field — the core design intent, stated
three times across purpose/reusableRule/s.g1). Ownership transfers at h.manual (ambiguous
replacement) and h.escalate (unresolvable).

CONFLICT-PREEMPTION: none declared, none obviously needed — an entity can only be orphaned of a
given relationship type once at a time, and the instance key enforces that.

HANDOFF: h.manual→DEC-181 and h.escalate→OWN-55 both omit a contract block (P2, corpus-wide
DEC-181/OWN-* pattern already seen elsewhere).

RE-ENTRY-TERMINALITY: neither exit is terminal. `x.terminal` (the policy end-state) is the
audit's best example so far of the "is re-entry structurally impossible, or merely
undesirable?" question answered correctly in the graph itself: its own `reEntry` field states
a later valid relationship reopens it, and its `class` is `timeout` rather than a true dead
end — the entity is never silently discarded, exactly as s.g1 requires.

OBSERVABILITY: `orphan_log` (append-only) covers every action. There is no structured
`ownerCandidates`/`heldSince` field distinct from the log — a minor gap, since "how long has
this been orphaned" currently requires parsing log entries rather than reading a field.

OUTCOMES: resolution = x.resumed; diagnostic = x.terminal, h.manual, h.escalate. No failure
outcome — correct, since even the policy end-state is a handled, re-openable outcome rather
than a defect.

TEST CASES:
- entry: a required owner link removed while the work item is active → a.state → c.replacement.
- entry (deterministic): exactly one valid replacement exists → a.reassign → a.revalidate →
  x.resumed.
- conflict: several replacement candidates, none ruled out by policy → h.manual (never a
  guessed pick).
- timeout: w.restore unanswered, obligations still live → c.terminal → h.escalate (obligations
  make an owner necessary).
- re-entry: x.terminal later gains a valid relationship → reopens (not a new instance, per its
  own reEntry note).

GAPS:
- P0 (idempotency): a.state, a.hold, a.reassign, a.revalidate all key on `relationship_id`,
  which is not a declared attribute and — by this journey's own premise — usually does not yet
  exist. `entity_ref + relationship_type + <action>` (the actual instance key) is the field
  that should be there; this looks like a copy from the sibling REL-91/92/93 states, which do
  legitimately own `relationship_id`.
- P2 (handoff): h.manual and h.escalate omit contract blocks (consistent corpus pattern).
- P2 (observability): no structured "orphaned since" field independent of the append log.

---

## REL-91 — Relationship Validation

READINESS: READY_WITH_MAPPING

WHY: Idempotency, authority and terminality are all sound. The one real gap is timing: a
relationship that lands in `x.pending` (evidence outstanding) has no SLA or wait node governing
how long it can sit there, unlike its sibling orphan state (REL-100), which explicitly bounds
the analogous "unresolved" condition.

INSTANCE: `[relationship_id]`, one-active-per-key, with an explicit note that direction is part
of the type where the relationship is directional (a dependent-of-a-primary link stored the
other way round is a different fact, not the same one).

STATE AUTHORITY: `authoritative-system` (t.requested, evidence.source: authoritative) —
`insufficientAlone` correctly excludes shared-attribute coincidences (address, surname, device)
as proof of relationship (s.g1), and correctly routes anything carrying a term/effective-period
to the continuing-relationship lifecycle (SUB-161) instead.

ENTRY-TRANSITIONS: `enter` (t.requested) → `progress` (a.define → c.authority) → `resolve`
(a.activate → x.active) or `handoff` (h.verify) or a direct no-op exit (x.pending, x.rejected)
from `c.valid`. No `expire` kind — the gap below is exactly this: x.pending has no timeout path
at all.

DATA: relationship_id, relationship_log — both actions correctly key on relationship_id alone.
No idempotency gap.

SOURCE OF TRUTH: c.valid checks "the basis is sufficient" against authoritative evidence;
`x.pending`'s reEntry describes waiting for "sufficient basis arriving later," but nothing
names what event that is, since no wait node models it.

CONFIG-TIME: none declared for x.pending's implicit wait — the one meaningful gap in this
state.

OWNERSHIP: this journey owns relationship creation only; explicitly hands off ongoing changes
to REL-92 and ending to REL-93 (documented directly in x.active's reEntry note) — a clean,
named lifecycle chain.

CONFLICT-PREEMPTION: none declared; the instance key (relationship_id, assigned at creation) is
the natural exclusivity boundary and needs no additional rule.

HANDOFF: h.verify→IDN-82 has no contract block (P2, consistent pattern).

RE-ENTRY-TERMINALITY: none of the three exits is terminal. x.pending and x.rejected both
explicitly describe re-entry (later basis, different basis) rather than being dead ends.

OBSERVABILITY: relationship_log covers both actions; no field distinguishes "how long has this
been pending" — compounds the missing-SLA gap above, since neither the config nor the data
model can currently answer it.

OUTCOMES: resolution = x.active; neutral = x.pending; failure = x.rejected. No diagnostic
outcome — appropriate for a journey with only two decision points.

TEST CASES:
- entry: two entities, sufficient authoritative basis, no verification required → a.activate →
  x.active.
- insufficient-evidence: plausible relationship, basis not yet sufficient → x.pending.
- handoff: relationship confers rights requiring acceptance → h.verify → IDN-82.
- timeout (currently untestable as specified): a relationship sitting in x.pending for an
  extended period — there is no SLA to assert against.
- re-entry: x.rejected reassessed under a different basis, as its own attempt.

GAPS:
- P1 (config/time): x.pending has no wait node, timeout, or SLA — unlike REL-100's structurally
  analogous "unresolved" state, a relationship can sit PENDING_EVIDENCE indefinitely with
  nothing to escalate it.
- P2 (handoff): h.verify→IDN-82 omits a contract block.

---

## REL-92 — Relationship Impact Recalculation

READINESS: READY_WITH_MAPPING

WHY: No idempotency gap, no terminality gap, correction discipline (append-only history,
suppressed-queued-actions) is properly backed by data. Only the two handoffs need explicit
contracts.

INSTANCE: `[relationship_id]`, one-active-per-key — same key as the relationship itself, which
is correct since this journey exists only to react to a change already recorded by REL-91.

STATE AUTHORITY: `authoritative-system` (t.changed, evidence.source: authoritative) —
`insufficientAlone` correctly routes plan/tier/pricing changes to the agreement's own lifecycle
(SUB-166) rather than treating them as a structural relationship change.

ENTRY-TRANSITIONS: `enter` (t.changed) → `progress` (a.record → a.identify → a.invalidate →
c.affected) → `resolve` (a.recalculate → c.entitlement → x.recalculated / x.recorded) or
`handoff` (h.ownership / h.entitlement). A `supersede`-flavored step is present but correctly
scoped: a.invalidate suppresses queued actions from the old relationship rather than
retroactively rewriting them (s.g5).

DATA: relationship_id, relationship_log, suppressed_sends — a.record, a.invalidate,
a.recalculate all key correctly on relationship_id. a.identify has neither a key nor a writes
entry, but it performs no side effect (pure classification of what depends on the relationship)
— not a gap.

SOURCE OF TRUTH: c.affected and c.responsibility both ask factual questions about what
currently depends on the relationship and who is answerable — no inference or elapsed-time
substitution.

CONFIG-TIME: no wait nodes; none needed — this journey resolves synchronously once triggered by
an already-authoritative change.

OWNERSHIP: transfers explicitly at h.ownership (responsibility for an open obligation actually
moves) — s.g2 draws the correct line ("not an ownership transfer unless responsibility actually
moves"), and the graph enforces that line via c.responsibility rather than assuming every
relationship change implies a transfer.

CONFLICT-PREEMPTION: none declared, none needed.

HANDOFF: h.ownership→OWN-54 and h.entitlement→ACC-73 both omit contract blocks (P2, consistent
pattern).

RE-ENTRY-TERMINALITY: neither exit is terminal; both describe a clean basis for the next change
to be assessed fresh.

OBSERVABILITY: relationship_log (append) plus suppressed_sends (append) together answer both
"what changed and why" and "what was prevented from firing under the old relationship" — a
comparatively complete pair for this journey's scope.

OUTCOMES: resolution = x.recorded, x.recalculated. No failure/diagnostic outcome needed — every
path here is a successful, scoped recalculation.

TEST CASES:
- entry: a structural relationship type change with a dependent entitlement → a.recalculate →
  c.entitlement → h.entitlement.
- entry (no-op): a descriptive relationship change nothing reads → x.recorded.
- correction: an action queued under the old relationship is suppressed by a.invalidate before
  it can execute against a structure that no longer exists.
- handoff: responsibility for an open obligation moves → h.ownership → OWN-54 (contract
  currently unspecified).

GAPS:
- P2 (handoff): h.ownership and h.entitlement both omit contract blocks (consistent corpus
  pattern; OWN-54/ACC-73 receiving-side needs are not audited in this round).

---

## REL-93 — Entity Relationship End Reconciliation

READINESS: READY_WITH_MAPPING

WHY: No gaps found. Idempotency is clean across all three actions, the one external handoff
carries a fully specified contract, and the correction/retention discipline (append-only
history, obligations reconciled separately from the ending) is backed by real data fields. One
of the cleanest states audited so far, alongside FUL-150 and CON-38.

INSTANCE: `[relationship_id]`, one-active-per-key — correct; only this specific relationship
ends, explicitly not others between the same two entities (s.g3).

STATE AUTHORITY: `authoritative-system` (t.ended, evidence.source: authoritative) —
`insufficientAlone` correctly excludes an agreement's own end (SUB-170's domain) and a party's
rights merely stopping under an agreement, both of which belong to the agreement's own
lifecycle rather than this structural link.

ENTRY-TRANSITIONS: `enter` (t.ended) → `progress` (a.record-end → a.future → c.obligations) →
`resolve` (a.retain → x.ended, or directly to x.ended) or `handoff` (h.reconcile). Clean,
linear, no ambiguous branches.

DATA: relationship_id, relationship_log, suppressed_sends — all three actions correctly key on
relationship_id.

SOURCE OF TRUTH: c.obligations checks for concrete outstanding items (open case, confirmed
reservation, approved request, existing entitlement, financial obligation) — all factual,
authoritative categories, no inference.

CONFIG-TIME: no wait nodes; appropriate for a synchronous reconciliation triggered by an
already-authoritative end event.

OWNERSHIP: this journey owns closing out the structural link and suppressing its future-facing
effects; explicitly does not own reconciling the obligations themselves, which it hands off.

CONFLICT-PREEMPTION: none declared, none needed.

HANDOFF: h.reconcile→external:commitment-reconciliation carries a full
`contract.requiredFields`: [relationship_id, handed_at, reason] — a complete, receiver-usable
contract. No gap.

RE-ENTRY-TERMINALITY: x.ended is not terminal; its reEntry explicitly distinguishes a later
relationship between the same two entities as a new instance rather than a revival of this one
— exactly the "new-entity-instance" reopening kind the round's model calls for, correctly
applied.

OBSERVABILITY: relationship_log (append, preserves the period the ended relationship covered)
plus suppressed_sends (append) together cover why-ended/since-when/what-was-suppressed.

OUTCOMES: resolution = x.ended (with or without outstanding obligations, both routed through
before reaching it); diagnostic = h.reconcile (obligations still open, handed off rather than
silently dropped).

TEST CASES:
- entry: relationship ends, no outstanding obligations, no retention required → x.ended
  directly.
- entry (retention): relationship ends, no obligations, but policy requires the record survive
  → a.retain → x.ended.
- handoff: relationship ends with a live confirmed reservation created under it → h.reconcile
  (nothing is auto-cancelled — s.g2).
- re-entry: a new relationship of the same type is later created between the same two entities
  → treated as a new instance, not a reopening of this one.

GAPS: none found.

---

## REL-94 — Role Authority Update

READINESS: NEEDS_CONTRACT_WORK

WHY: The delta model (grant/revoke only the difference, never touch shared capabilities) and
the historical-action-preservation discipline are both sound. Both actions key on
`relationship_id`, a field this journey never declares — and worse, neither key uses
`member_id` or `role_id`, which together with `account_id` are this journey's actual declared
instance key.

INSTANCE: `[account_id, member_id, role_id]`, one-active-per-key — correctly composite; the
note is explicit that the same person's roles in different organisations are independent.

STATE AUTHORITY: `authoritative-system` (t.role, evidence.source: authoritative) —
`insufficientAlone` correctly excludes a permission edit with no role behind it, a change with
no effective time, and a role change not yet authorised.

ENTRY-TRANSITIONS: `enter` (t.role) → `progress` (a.delta → c.pending) → `resolve` (a.apply →
x.applied) or `handoff` (h.authority / h.entitlement). No `correct`/`reverse` kind, correctly —
s.g2 makes downgrade explicitly non-retroactive, so there is nothing to reverse.

DATA: account_id, member_id, role_id, previous_role, new_role, effective_at,
pending_decisions, role_change_log. `relationship_id` is not among them.

SOURCE OF TRUTH: c.pending and c.direction both check current, already-authoritative role data
(previous_role vs. new_role) — no inference.

CONFIG-TIME: no wait nodes; appropriate for a journey that resolves synchronously from an
already-authorised change.

OWNERSHIP: transfers at h.authority when pending decisions rest on the authority being
replaced — s.g3's revalidation rule is enforced structurally (the delta is not applied until
those decisions are settled), not left to the receiving journey to remember.

CONFLICT-PREEMPTION: none declared, none obviously needed — the instance key already scopes to
one member's one role in one account.

HANDOFF: h.authority→OWN-60 and h.entitlement→ACC-73 both omit contract blocks (P2, consistent
corpus pattern).

RE-ENTRY-TERMINALITY: the sole exit, x.applied, is not terminal; reEntry states the next role
change is compared against the current (now-updated) role — correct baseline handling.

OBSERVABILITY: role_change_log (append) covers both actions; no explicit field distinguishes
"capabilities common to both roles, left untouched" from the delta itself, though that is
arguably implicit in previous_role/new_role being both retained.

OUTCOMES: resolution = x.applied. No failure/diagnostic outcome — appropriate, since an invalid
role change is presumably rejected upstream of this journey (evidence.source: authoritative).

TEST CASES:
- entry: a role change that only adds capabilities → c.direction → h.entitlement.
- entry (mixed): a role change that removes at least one capability → a.apply → x.applied,
  prior actions under the old role left intact (tests s.g2).
- conflict/ownership: an open approval valid under the old role at the moment of change →
  h.authority (delta withheld until settled).
- correction: none needed — this journey has no reversal path, and its own rule (s.g2) is
  exactly why not.

GAPS:
- P0 (idempotency): a.delta and a.apply both key on `account_id + relationship_id + <action>`;
  `relationship_id` is undeclared, and the two fields that actually identify this instance
  (`member_id`, `role_id`) are unused in the key entirely.
- P2 (handoff): h.authority and h.entitlement omit contract blocks (consistent corpus
  pattern).

---

## REM-156 — Corrective Reperformance

READINESS: NEEDS_CONTRACT_WORK

WHY: Correction discipline is exemplary — the original defective outcome is explicitly
preserved rather than overwritten (a.preserve is its own action, not a side effect of
a.execute), and a deadline-bound wait escalates rather than lingering. But every action keys on
`order_id + obligation_id`, neither of which this journey declares; its actual identity field,
`correction_id`, is unused in every key.

INSTANCE: `[correction_id]`, one-active-per-key. Correctly modeled — one correction per
identified defect, distinct from the fulfillment it corrects.

STATE AUTHORITY: `authoritative-system` (t.authorized, evidence.source: authoritative) —
`insufficientAlone` correctly excludes a bare complaint with no remedy decision, a refund
(a different remedy), and an internal task with no authorised correction behind it.

ENTRY-TRANSITIONS: `enter` (t.authorized) → `progress` (a.define → a.preserve → a.execute →
w.correction) → `resolve`/`handoff` (c.outcome → h.verify / a.partial→h.verify / h.alternative)
or `expire` (w.correction timeout → h.escalate). The `a.partial` path is a `progress`
transition that stops short of `resolve` — correctly modeled as still-open rather than closed
(s.g "half a correction recorded as a whole one closes an obligation that is still live").

DATA: correction_id, original_fulfillment_id, required_outcome, correction_deadline_at,
remedy_log. `order_id` and `obligation_id` appear nowhere in this list.

SOURCE OF TRUTH: w.correction waits on two named, authoritative events
(correction_produced/correction_failed) — no engagement or elapsed-time substitute.

CONFIG-TIME: `w.correction.timeout` — key `correction_reperformance.correction`, class
`attribute-bound`, relativeTo `attribute` / `correction_deadline_at`, required: true. Correctly
bound to a real attribute, not prose.

OWNERSHIP: this journey owns the correction attempt end to end; transfers explicitly at
h.verify (outcome produced, verification owns confirming it), h.alternative (correction
couldn't produce the outcome, a different remedy owns what happens next), h.escalate (deadline
passed).

CONFLICT-PREEMPTION: none declared; the instance key (correction_id, one per identified defect)
is the natural exclusivity boundary.

HANDOFF: h.verify→REM-158, h.alternative→REM-157, h.escalate→OWN-55 — all three omit contract
blocks (P2, consistent pattern).

RE-ENTRY-TERMINALITY: no exits at all — every path out is a handoff. This is the corpus's
router pattern (seen at ACQ-02, FUL-142, FUL-145, RET-27), not a defect: a correction attempt
always concludes into a receiving journey rather than resolving in place.

OBSERVABILITY: remedy_log (append) covers all four actions, including the explicit
"CORRECTION_REQUIRED" state written by a.define. Solid for this journey's scope.

OUTCOMES: resolution = h.verify (full or partial); diagnostic = h.alternative, h.escalate. No
bare failure outcome — appropriate, since even a correction that can't produce the outcome is
routed onward rather than dropped.

TEST CASES:
- entry: an authorised correction with a deadline → a.define → a.preserve → a.execute →
  w.correction.
- correction (the domain's own subject): a.preserve keeps the original defective outcome in
  history even after a.execute succeeds — verify no code path lets a.execute's write overwrite
  a.preserve's record.
- timeout: w.correction unanswered past correction_deadline_at → h.escalate.
- entry (partial): correction fixes part of the affected scope → a.partial → h.verify, with the
  remaining scope stated explicitly rather than implied closed.

GAPS:
- P0 (idempotency): a.define, a.preserve, a.execute, a.partial all key on
  `order_id + obligation_id + <action>`; neither field is declared, and the journey's actual
  instance key (`correction_id`) is unused in every one.
- P2 (handoff): h.verify, h.alternative, h.escalate all omit contract blocks.

---

## RET-21 — Engagement Reclassification

READINESS: READY_WITH_MAPPING

WHY: Idempotency is clean, the "engagement moves in both directions" model is backed by real
suppression logic (an improved state suppresses queued interventions that only existed for the
weaker one), and the journey is explicit that most passes through it correctly end with a state
update and nothing sent. Only the outbound handoff needs a contract.

INSTANCE: `[account_id, relationship_id]`, one-active-per-key — correctly per-relationship, per
the note that quiet-in-one-product / heavy-in-another is two states, not an average.

STATE AUTHORITY: entry evidence.source is `behavioral`, but the trigger itself is a
*recalculated categorical state* ("HIGH, NORMAL, DECLINING, LOW or DORMANT... computed from
meaningful usage, frequency, recency, depth, value-producing actions, the expected cadence and
the maturity of the relationship"), not a raw signal — functionally closer to
`derived-from-authoritative-inputs` than to an unvalidated behavioral-inference trigger. Either
way it is correctly gated: c.intervention decides separately whether a movement is worth acting
on, so a state change never becomes a customer-facing action by itself.

ENTRY-TRANSITIONS: `enter` (t.changed) → `progress` (a.evaluate → c.direction) → `resolve`
(a.improved → x.updated, or c.expected → x.updated) or `handoff` (c.intervention → h.health).
No `expire`/`supersede` kind — appropriate, this is a synchronous reclassification.

DATA: account_id, relationship_id, engagement_state_history, suppressed_sends — both actions
correctly key on account_id + relationship_id.

SOURCE OF TRUTH: c.expected checks the decline against "this relationship's own history," not a
shared benchmark (s.g3) — a real per-instance comparison, not a static threshold.

CONFIG-TIME: no wait nodes; appropriate, this resolves synchronously per recalculation.

OWNERSHIP: owns the engagement-state record and its own suppression of stale interventions;
transfers at h.health only when the decline is anomalous and worth diagnosing.

CONFLICT-PREEMPTION: none declared, none obviously needed at this journey's scope.

HANDOFF: h.health→RET-23 omits a contract block (P2, consistent pattern).

RE-ENTRY-TERMINALITY: the sole exit, x.updated, is not terminal; reEntry explicitly frames it as
the common, correct outcome rather than an edge case.

OBSERVABILITY: engagement_state_history (append) plus suppressed_sends (append) together answer
why the state changed and what was suppressed as a result. Solid for this journey's scope.

OUTCOMES: resolution = x.updated (both improved and expected-decline paths); diagnostic =
h.health (anomalous decline worth diagnosing). No failure outcome — correct, a state
reclassification cannot itself fail.

TEST CASES:
- entry: state improves → a.improved → suppresses queued weaker-state interventions → x.updated.
- entry: state deteriorates but matches known seasonal pattern → c.expected → x.updated,
  nothing sent.
- entry: state deteriorates anomalously and materially → c.intervention → h.health.
- entry (small, real movement): anomalous but minor decline → x.updated, no escalation (tests
  the "worth acting on" threshold explicitly, not just direction).

GAPS:
- P2 (handoff): h.health→RET-23 omits a contract block.

---

## RET-22 — Usage Gap Assessment

READINESS: READY_WITH_MAPPING

WHY: The evidence discipline is the strongest part of this state — an absence is explicitly
"evidence only relative to an expectation that actually existed" (s.g3), and a single miss with
nothing corroborating it is deliberately routed to a no-action observation exit rather than
treated as risk. The one real question is whether that observation state can actually
accumulate evidence across instances, since no action in the journey writes anything.

INSTANCE: `[account_id, use_case_id]`, one-active-per-key — correctly scoped per role/use-case,
per the note that an admin and an analyst on the same account carry different expectations.

STATE AUTHORITY: `behavioral` (t.missed, evidence.source: behavioral) — but tightly gated:
`insufficientAlone` rules out a fixed no-activity-for-N-days rule with no expectation behind it,
and a single miss in an already-irregular rhythm. c.episodic and c.corroborated both require
independent evidence before anything routes onward — the absence never becomes conclusive by
itself.

ENTRY-TRANSITIONS: `enter` (t.missed) → `progress` (a.compare → c.episodic) → `resolve`
(x.normal-quiet) or `progress` (a.inspect → c.corroborated) → `resolve` (x.observe) or
`handoff` (h.health). No action writes any state at all — neither a.compare nor a.inspect has a
`writes` entry.

DATA: account_id, use_case_id, expected_pattern, last_usage_at, corroborating_evidence. Nothing
in the graph ever writes to `corroborating_evidence`, despite it being declared and despite
x.observe's own reEntry note depending on it: "a second miss, or any corroborating signal,
re-opens this — absence accumulates into evidence, it does not start as evidence."

SOURCE OF TRUTH: a.compare reads the actual behaviour against the use-case-specific expected
pattern, not an account- or product-wide average — correct per-instance comparison.

CONFIG-TIME: no wait nodes; this journey resolves synchronously.

OWNERSHIP: owns the observation state itself (x.observe is explicitly framed as a state someone
can re-enter, not a terminal no-op); transfers to RET-23 only once corroborated.

CONFLICT-PREEMPTION: none declared, none obviously needed.

HANDOFF: h.health→RET-23 omits a contract block (P2, consistent pattern).

RE-ENTRY-TERMINALITY: neither exit is terminal; both describe explicit re-entry conditions
(episodic pattern itself broken; second miss or corroborating signal). The design intent is
sound — the gap is that the mechanism to detect "a second miss" has nowhere to read what the
first one left behind.

OBSERVABILITY: no write action anywhere in the journey. There is no way, from this graph alone,
to answer "has this use-case already missed once" on the next invocation — the very question
its own re-entry semantics depend on.

OUTCOMES: neutral = x.normal-quiet, x.observe; diagnostic = h.health. No failure/resolution
outcome — appropriate for a pure observation journey.

TEST CASES:
- entry: episodic/seasonal use-case, quiet period matches the pattern → x.normal-quiet.
- entry: continuous-use-case miss, no corroborating signal → x.observe.
- entry: continuous-use-case miss with an independent negative signal → h.health.
- re-entry (currently unverifiable as specified): a second miss on the same use_case_id — needs
  `corroborating_evidence` or an equivalent history field to actually accumulate.

GAPS:
- P1 (observability/data): no action in this journey writes to `corroborating_evidence` or any
  other field, yet the stated re-entry model ("absence accumulates into evidence") requires
  something to persist between instances for a second miss to be distinguishable from a first.

---

## RET-23 — Health Deterioration Diagnosis

READINESS: NEEDS_CONTRACT_WORK

WHY: The routing model is the corpus's most disciplined diagnostic router — a composite score
must decompose into a named cause before anything routes, an incentive is explicitly barred as
a default response, and improvement during the diagnostic window is itself watched rather than
trusted. But both actions, and three of the six contract-bearing handoffs, all reference
`subscription_id`, a field this journey never declares.

INSTANCE: `[account_id, relationship_id]`, one-active-per-key — the note that "one failing
subscription does not make the account unhealthy" is enforced by keeping the diagnosis and
every route out of it at the level the deterioration was actually observed.

STATE AUTHORITY: `authoritative-system` (t.deteriorated, evidence.source: authoritative) — a
score-crossing-threshold event, but `insufficientAlone` correctly excludes an undecomposable
composite score and a crossing caused only by a scoring-methodology change, not real behavior.

ENTRY-TRANSITIONS: `enter` (t.deteriorated) → `progress` (a.decompose → c.cause) → `resolve`
(x.need-changed) or `handoff` (h.adoption/h.setup/h.technical/h.service/h.payment/h.ownership)
or `progress` (a.diagnostic → w.diagnostic → c.diagnostic-result) → `resolve` (x.cause-found) or
`handoff` (h.recovery) or `expire` (w.diagnostic timeout → x.unexplained).

DATA: account_id, relationship_id, health_state, score_inputs, health_evidence.
`subscription_id` is not declared, yet a.decompose, a.diagnostic, and the contract blocks on
h.technical, h.payment, and h.ownership all reference it — a consistent, journey-wide
assumption that never made it into the declared attribute list.

SOURCE OF TRUTH: c.cause routes on decomposed score_inputs, not the raw composite (s.g2);
c.diagnostic-result waits on two named events (cause_identified, health_recovered).

CONFIG-TIME: `w.diagnostic.timeout` — key `health_deterioration.diagnostic`, class
`observation-window`, relativeTo `trigger`, required: true. Correctly bound, with an explicit
rationale against open-ended investigation.

OWNERSHIP: transfers at each of the seven cause-specific handoffs; the journey never attempts to
own the fix for any diagnosed cause itself, only the diagnosis and routing.

CONFLICT-PREEMPTION: none declared. Worth noting: `distinctFrom` RET-24 states this journey and
RET-24 ("how much is wrong and how hard to push back") can run concurrently on a relationship
whose cause is already known — a legitimate coexistence, undeclared as a `ConflictRef`, but
correctly not exclusionary.

HANDOFF: h.technical, h.payment, h.ownership all carry `contract.requiredFields` including
`subscription_id` (undeclared — see DATA); h.adoption, h.setup, h.service, h.recovery all omit
contract blocks entirely (P2, consistent pattern).

RE-ENTRY-TERMINALITY: none of the three exits is terminal. x.cause-found deliberately opens a
*new* instance for the identified cause to route through on its first pass, rather than routing
inline — "keeps the routing decision in one place rather than duplicating it inside the
diagnostic," a clean re-entry design choice worth naming as a pattern.

OBSERVABILITY: health_evidence (append) records what a.decompose found. No field distinguishes
"still investigating" from "diagnostic window closed unexplained" beyond the exit taken itself —
acceptable, since x.unexplained's own class (`timeout`) already carries that meaning.

OUTCOMES: resolution = x.need-changed, x.cause-found; diagnostic = x.unexplained, h.recovery
(improved but unconfirmed). No bare failure outcome — every path is either resolved,
re-diagnosable, or explicitly routed.

TEST CASES:
- entry: composite score crosses threshold, decomposes to a single dominant cause → the
  matching cause-specific handoff.
- entry: composite score crosses threshold but cannot be decomposed → a.diagnostic →
  w.diagnostic (not routed blind).
- timeout: w.diagnostic unanswered → x.unexplained, lower-frequency monitoring (not a repeated
  full diagnostic cycle).
- concurrent-instance: this journey and RET-24 open on the same relationship_id at once, cause
  already known to one and being assessed by the other (tests the undeclared but intended
  coexistence).
- handoff: h.payment fires with the `subscription_id` field its own contract requires — verify
  it can actually be populated given the journey never declares it.

GAPS:
- P0 (idempotency): a.decompose and a.diagnostic both key on `subscription_id + account_id +
  <action>`; `subscription_id` is undeclared anywhere in this journey's attributes.
- P0 (handoff): the contract blocks on h.technical, h.payment and h.ownership all require
  `subscription_id` as a handed-off field, which this journey has no declared source for —
  the same underlying gap surfacing on the sending side of three handoffs at once.
- P2 (conflict): the stated RET-23/RET-24 coexistence is documented in prose only, not as a
  `ConflictRef`.
- P2 (handoff): h.adoption, h.setup, h.service, h.recovery all omit contract blocks.

---

## RET-27 — Recovery Stability Check

READINESS: READY_WITH_MAPPING

WHY: Clean idempotency throughout, a genuinely careful distinction between "operationally
eligible again" and "confidently healthy" (s.g4), and a wait whose timeout is itself the
success path rather than a failure — an unusual and well-reasoned inversion of the corpus's
usual timeout-as-escalation pattern.

INSTANCE: `[account_id, person_id]`, one-active-per-key. Recovery is judged in the context that
deteriorated, per the note that improvement elsewhere does not count here.

STATE AUTHORITY: `behavioral` (t.positive, evidence.source: behavioral), tightly gated —
`insufficientAlone` rules out a single login, a single payment attempt, and a message
open/click as proof of recovery. The signal only starts observation (a.mark records
RECOVERY_OBSERVED, explicitly not RECOVERED); it never becomes conclusive on its own.

ENTRY-TRANSITIONS: `enter` (t.positive) → `progress` (a.mark → w.stability) → `resolve`
(timeout → a.stable → h.normal) or `handoff` (onEvent deterioration_signal_returns → a.relapse
→ h.rediagnose). The wait branches directly into an action from both its onEvent and onTimeout
paths rather than through a condition node — a valid, minimal shape given there are only two
outcomes.

DATA: account_id, person_id, recovery_state_history, suppressed_sends — a.mark, a.relapse,
a.stable all correctly key on account_id + person_id. No idempotency gap.

SOURCE OF TRUTH: w.stability waits on the single named event `deterioration_signal_returns`;
absence of that event for the full window is itself read as the positive signal, per s.g3's
warning that the window must be set from the actual use-case cadence.

CONFIG-TIME: `w.stability.timeout` — key `recovery_observation.stability`, class
`observation-window`, relativeTo `trigger`, required: true. Correctly bound.

OWNERSHIP: owns the observation period itself; transfers at h.rediagnose (relapse, back to
RET-23) and h.normal (stability proven, back to standard lifecycle orchestration).

CONFLICT-PREEMPTION: s.g4 is a genuine, well-modeled conflict rule rather than a gap: recovery
observation does not by itself suppress communication, and an authoritative event elsewhere
(a purchase, a completed renewal) can immediately restore normal orchestration while this
journey is still watching — explicitly two different conclusions from two different kinds of
evidence, not a contradiction.

HANDOFF: h.rediagnose→RET-23 omits a contract block (P2). h.normal→external:customer-lifecycle
carries a complete contract: [account_id, person_id, handed_at, reason] — no gap.

RE-ENTRY-TERMINALITY: no exits at all — every path is a handoff (h.rediagnose or h.normal), the
corpus's router pattern again, correctly applied: a stability judgment always hands back to
either diagnosis or normal orchestration, never resolves in place.

OBSERVABILITY: recovery_state_history (append) plus suppressed_sends (append) together record
the observed signal, any relapse, and what was suppressed once recovery was confirmed — a
complete pair for this journey's scope.

OUTCOMES: resolution = h.normal; diagnostic = h.rediagnose. No failure outcome — appropriate,
a relapse is a re-diagnosis trigger, not a defect in this journey.

TEST CASES:
- entry: a positive signal after deterioration → a.mark (RECOVERY_OBSERVED, not RECOVERED) →
  w.stability.
- late-event / relapse: deterioration_signal_returns fires inside the window → a.relapse
  (keeps the observed improvement in history) → h.rediagnose.
- timeout (success path): window elapses with no relapse → a.stable → suppress pending
  recovery interventions → h.normal.
- conflict: an authoritative purchase event arrives while this journey is still observing —
  verify normal orchestration resumes immediately per s.g4 without waiting on this journey's
  own conclusion.

GAPS:
- P2 (handoff): h.rediagnose→RET-23 omits a contract block.

---

## RET-29 — Cancellation Wind-Down

READINESS: NEEDS_CONTRACT_WORK

WHY: The ordering discipline (invalidation runs before anything else is worked out) and the
three-way separation of subscription/account/data lifecycles are both sound. All three actions,
and the one outbound handoff's own contract, key on `subscription_id` — a field this journey
never declares, the same gap independently found on RET-23.

INSTANCE: `[relationship_id]`, one-active-per-key. The note is explicit that the subscription,
the account and the person's data are three separate lifecycles — this journey owns only the
first.

STATE AUTHORITY: `authoritative-system` (t.completed, evidence.source: authoritative) —
`insufficientAlone` correctly excludes a cancel flow merely entered, a still-reversible request,
and a stated intention — only an executed cancellation qualifies.

ENTRY-TRANSITIONS: `enter` (t.completed) → `progress` (a.invalidate → a.termination-state →
c.access) → `resolve` (a.wind-down → c.obligations → c.ended → x.former / x.wind-down) or
`handoff` (h.obligations). No `reverse` kind — appropriate, since s.g1/s.g2 make this journey
non-destructive by construction.

DATA: relationship_id, cancellation_executed_at, effective_end_at, outstanding_obligations,
termination_state. `subscription_id` is not among them.

SOURCE OF TRUTH: c.access and c.ended both check already-established fields
(termination_state, effective_end_at) — no inference.

CONFIG-TIME: no wait nodes; this journey resolves synchronously from an already-authoritative
completion event.

OWNERSHIP: the reusableRule states the model directly — retention ownership ends the moment
cancellation is confirmed, and orchestration shifts to termination/obligation management. a
.invalidate enforces this immediately by suppressing every retention-flavored send already
queued, before anything else is worked out (s.g4).

CONFLICT-PREEMPTION: none declared, none obviously needed — relationship_id is the natural
exclusivity boundary and the journey has already established retention no longer has a claim
on this instance once it opens.

HANDOFF: h.obligations→external:obligation-resolution carries a contract block, but one of its
required fields (`subscription_id`) is the same undeclared field the actions key on.

RE-ENTRY-TERMINALITY: neither exit is terminal. x.former explicitly distinguishes itself from
account closure and data deletion ("two further states with their own triggers, and neither of
them happened here") — a clean, disciplined terminality boundary. x.wind-down's reEntry notes
that a reversal before the end date is its own representable event, not a special case bolted
onto this one.

OBSERVABILITY: outstanding_obligations and termination_state are named, queryable fields, not
buried in a log alone — a comparatively strong observability baseline for a wind-down state.

OUTCOMES: resolution = x.former, x.wind-down; diagnostic = h.obligations. No failure outcome —
appropriate, a completed cancellation is never itself a defect.

TEST CASES:
- entry: immediate cancellation, nothing outstanding → x.former directly.
- entry: end-of-period cancellation → a.wind-down → x.wind-down, entitlement intact until the
  end date (tests s.g3).
- handoff: outstanding final invoice at cancellation → h.obligations, with `subscription_id`
  currently unresolvable from this journey's own data.
- correction: a save offer already queued before cancellation is invalidated by a.invalidate
  before c.access even runs (tests s.g4's ordering).

GAPS:
- P0 (idempotency): a.invalidate, a.termination-state, a.wind-down all key on
  `subscription_id + relationship_id + <action>`; `subscription_id` is undeclared.
- P0 (handoff): h.obligations' own contract requires the same undeclared `subscription_id`.

---

## SCH-172 — Temporary Slot Hold

READINESS: NEEDS_CONTRACT_WORK

WHY: This is the corpus's most explicit statement yet that "creation and release are both
idempotent" (s.g3) is a canonical rule — and the one place so far where the idempotencyKey
directly contradicts the rule it's supposed to implement: every writing action keys on
`person_id`, a field this journey never declares, in place of the correct `requester_id`.

INSTANCE: `[hold_id]`, one-active-per-key. The note is precise about why: a second hold by the
same requester on the same slot "consumes the capacity twice and releases at two different
times" — the c.idempotent condition exists specifically to prevent that at the request level.

STATE AUTHORITY: `authoritative-system` (t.granted, evidence.source: authoritative) —
`insufficientAlone` correctly distinguishes a hold *requested* from a hold *granted*, naming the
overbooking failure mode directly if the two are conflated.

ENTRY-TRANSITIONS: `enter` (t.granted) → `progress` (c.idempotent → a.reuse or a.create →
w.hold) → `resolve` (a.consume → x.consumed) or `resolve` (a.release → x.released) or `expire`
(w.hold timeout → a.expire → x.expired). The c.idempotent branch is itself a request-level
dedup transition, distinct from and in addition to action-level idempotency keys.

DATA: hold_id, slot_ref, requester_id, expires_at, hold_log. `person_id` is not declared.

SOURCE OF TRUTH: w.hold waits on three named events (booking_confirmed, hold_released,
booking_intent_abandoned); c.still-needed checks whether another live booking step still
depends on the hold before releasing it — no assumption either way.

CONFIG-TIME: `w.hold.timeout` — key `slot_hold.hold`, class `attribute-bound`, relativeTo
`attribute`/`expires_at`, required: true. Correctly bound, with an explicit rationale (capacity
counted against a lapsed hold is capacity nobody can book and nobody owns).

OWNERSHIP: owns the hold for its full life; a.consume explicitly moves capacity from held to
reserved "in one step" to avoid a release-then-retake race window — a real concurrency
discipline, not just a data write.

CONFLICT-PREEMPTION: s.g4 ("concurrent holds respect real capacity rather than the capacity
each of them assumed") is the corpus's clearest statement of a real-capacity-vs-assumed-capacity
conflict rule, though it is not modeled as a structured `ConflictRef` — it lives in prose only.

HANDOFF: none — self-contained.

RE-ENTRY-TERMINALITY: none of the three exits is terminal. x.expired explicitly distinguishes a
later hold by the same requester on the same slot as a *new* hold rather than an extension —
correct "new-episode" semantics, not resume.

OBSERVABILITY: hold_log (append) covers all four writing actions.

OUTCOMES: resolution = x.consumed, x.released; failure/neutral = x.expired. No diagnostic
outcome — appropriate, a hold's fate is always one of these three.

TEST CASES:
- duplicate-event: a retried booking step for the same requester and slot → a.reuse returns the
  existing hold rather than creating a second (tests s.g3 as designed, independent of the key
  bug below).
- concurrent-instance: two different requesters hold against the same slot's real remaining
  capacity, not against what either of them individually assumed was free (tests s.g4).
- timeout: w.hold's expires_at passes with no resolution → a.expire → x.expired, capacity
  returned.
- handoff-free correction: a.release called twice against the same hold_id is a no-op the
  second time (tests the idempotent-release half of s.g3 — currently unverifiable given the key
  bug, since a retried a.release keyed on the wrong field cannot be reliably recognized as the
  same call).

GAPS:
- P0 (idempotency): a.create, a.expire, a.release, a.consume all key on
  `person_id + <action>`; `person_id` is undeclared, and the correct field
  (`requester_id`, or `hold_id` alone) is unused. This directly undercuts s.g3, the journey's
  own stated canonical rule.
- P2 (conflict): s.g4's real-capacity-vs-assumed-capacity rule is prose-only, not a
  `ConflictRef`.

---

## SCH-173 — Reservation Validation

READINESS: NEEDS_CONTRACT_WORK

WHY: The revalidate-before-confirm discipline and the explicit request-is-not-a-confirmation
boundary are both well modeled. Every writing action keys on `booking_id` — a field this
journey's own declared instance key, `reservation_request_id`, never becomes until a.confirm
runs. This is the "premature identifier" variant of the idempotency gap (also seen at REL-100):
referencing a value that structurally does not exist yet for most of the journey's own life.

INSTANCE: `[reservation_request_id]`, one-active-per-key. The note states a retried submission
should produce the same reservation rather than a second one against the same capacity — the
c.duplicate condition (checking for an already-confirmed reservation) is the mechanism for that.

STATE AUTHORITY: `declared` (t.requested, evidence.source: declared) —
`insufficientAlone` correctly excludes a payment attempt alone and a slot merely held as proof
of a confirmed booking.

ENTRY-TRANSITIONS: `enter` (t.requested) → `progress` (a.capture → c.duplicate → a.revalidate →
c.capacity → a.validate-req → c.requirements) → `resolve` (a.confirm → h.prepare) or `resolve`
(a.pending → w.pending → c.pending-outcome → a.confirm or a.lapse → x.lapsed) or `resolve`
(a.reject → h.alternative) or a direct no-op (x.already). The `a.confirm` step is where
`booking_id` presumably gets minted — everything upstream of it references a request that has
no confirmed booking yet.

DATA: reservation_request_id, requester_id, resource_ref, slot_ref, booking_requirements,
reservation_log. `booking_id` is not declared here.

SOURCE OF TRUTH: a.revalidate explicitly re-reads current capacity rather than trusting what the
requester was shown (s.g2) — the single most consequential correctness rule in this journey,
and it is structurally enforced (a.revalidate is on the graph's only path to a.validate-req),
not just documented.

CONFIG-TIME: `w.pending.timeout` — key `reservation_request.pending`, class
`observation-window`, relativeTo `trigger`, required: true. Correctly bound.

OWNERSHIP: owns the request through to either confirmation or rejection/lapse; transfers at
h.prepare (confirmed, readiness begins) and h.alternative (rejected, a different search begins).

CONFLICT-PREEMPTION: c.duplicate is itself the exclusivity mechanism — a second request for an
already-confirmed booking resolves as `x.already` rather than double-booking. No `ConflictRef`
needed beyond what the condition already encodes.

HANDOFF: h.alternative→SCH-171 and h.prepare→SCH-174 both omit contract blocks (P2). h.prepare
is the more consequential omission: SCH-174 needs `booking_id`, which by the time of this
handoff finally does exist (minted at a.confirm), but nothing states that explicitly as a
required carried field.

RE-ENTRY-TERMINALITY: neither exit is terminal. x.already's reEntry is a clean statement of the
dedup semantics: "a genuinely different booking is a different request. A resubmitted one
resolves here rather than consuming a second slot."

OBSERVABILITY: reservation_log (append) covers every writing action, including the explicit
"PENDING_CONFIRMATION" and "CONFIRMED_RESERVATION" markers.

OUTCOMES: resolution = h.prepare (confirmed); neutral = x.already; failure = x.lapsed;
diagnostic = h.alternative (rejected, but routed to a real alternative rather than dropped).

TEST CASES:
- entry: request against currently free capacity, no further requirements → a.confirm →
  h.prepare.
- duplicate-event: a resubmitted identical request while the original is already confirmed →
  x.already, no second reservation.
- entry (contention): capacity shown to the requester was taken before the request landed →
  a.revalidate catches it → a.reject → h.alternative.
- insufficient-evidence (pending): a required dependency is outstanding → a.pending →
  w.pending → resolves or lapses.
- timeout: w.pending unanswered → a.lapse → x.lapsed, capacity released.

GAPS:
- P0 (idempotency): a.capture, a.reject, a.pending, a.lapse, a.confirm all key on
  `booking_id + <action>`; `booking_id` is undeclared and, for most of the journey's own life,
  does not yet exist — `reservation_request_id` is the field these keys should use.
- P2 (handoff): h.alternative and h.prepare both omit contract blocks; h.prepare in particular
  should carry the `booking_id` minted at confirmation explicitly.

---

## SCH-174 — Reservation Readiness

READINESS: NEEDS_CONTRACT_WORK

WHY: A carefully scoped state — preparation is explicitly subordinate to the booking, never
moves the confirmed time, and is the journey's own stated example of "silence is not
incompleteness" (s.silent declares outright that it sends nothing to the customer). The gap is
structural rather than a wrong-field mistake: none of its five actions declares an
idempotencyKey at all, despite four of them writing to preparation_log.

INSTANCE: `[booking_id]`, one-active-per-key — correctly declared and, unlike SCH-173, genuinely
available at this point in the lifecycle (the reservation is already confirmed).

STATE AUTHORITY: `authoritative-system` (t.confirmed, evidence.source: authoritative) —
`insufficientAlone` explicitly excludes a confirmation with no prerequisites defined and a
reminder having been sent, both of which "say nothing about readiness."

ENTRY-TRANSITIONS: `enter` (t.confirmed) → `progress` (a.determine → c.existing → a.skip or
a.initiate → w.prepare) → `resolve` (c.event → a.ready → x.upcoming) or `supersede` (c.event →
booking changed → x.superseded) or `progress` (w.prepare timeout → c.critical → a.at-risk →
h.escalate, or → a.ready → x.upcoming). The `supersede` kind is explicitly and correctly
modeled here (s.changed) — one of the few states in this round with a declared supersession
rule rather than an implicit one.

DATA: booking_id, scheduled_at, prerequisites, checkpoint_lead, provider_id (required);
prerequisite_status, owner_id (optional). No action declares an idempotencyKey.

SOURCE OF TRUTH: c.existing checks whether a prerequisite is "already satisfied or already
running" before initiating it again — explicit duplicate-journey prevention at the requirement
level, though this too depends on state that nothing here is confirmed to persist reliably
under retry.

CONFIG-TIME: `w.prepare.timeout` — key `scheduling.readiness_checkpoint`, class
`reminder-before-attribute` (a timing class not otherwise seen in this batch), relativeTo
`attribute`/`scheduled_at`, required: true. Correctly bound, with the checkpoint framed as "the
last point at which an unresolved prerequisite can still be acted on."

OWNERSHIP: explicitly subordinate — "the preparation is subordinate to the booking. It can
fail, and the booking stays confirmed while somebody decides what to do about it." a.at-risk
never touches the confirmed time; only h.escalate can move that decision elsewhere.

CONFLICT-PREEMPTION: s.changed is a real, correctly modeled conflict/supersession rule: a
materially changed booking (moved, reassigned, cancelled) supersedes the open readiness
instance outright, and readiness is re-established fresh rather than carried over — the
strongest anti-carryover statement in the batch.

HANDOFF: h.escalate→OWN-55 omits a contract block (P2).

RE-ENTRY-TERMINALITY: neither exit is terminal. x.superseded's reEntry correctly hands "what
happens next" to the reschedule/cancellation lifecycle rather than trying to resolve it here.

OBSERVABILITY: has a fuller measurement block than most states audited so far — a declared
`businessOutcome` (prerequisites_completed), a named `secondary` metric
(booking_materially_changed), and two named guardrails (start_on_unready_booking,
readiness_carried_over_change) that this round did not mechanically verify but that align
exactly with s.changed and the ready/upcoming distinction.

OUTCOMES: resolution = x.upcoming; diagnostic = x.superseded, h.escalate. No bare failure
outcome — a critical unresolved prerequisite is escalated rather than failed outright.

TEST CASES:
- entry: a booking with all prerequisites already satisfied → a.skip (no duplicate journey
  opened) → w.prepare → a.ready → x.upcoming.
- entry: an outstanding prerequisite initiated on its own lifecycle → w.prepare (tests
  ownership boundary: this journey does not own that lifecycle).
- supersession: the booking is rescheduled while readiness is open → c.event → x.superseded,
  not carried over.
- timeout (critical): checkpoint reached with a critical prerequisite unresolved → a.at-risk →
  h.escalate, confirmed time unchanged.
- timeout (non-critical): checkpoint reached with only a non-critical gap → a.ready →
  x.upcoming anyway.

GAPS:
- P0 (idempotency): none of a.determine, a.initiate, a.at-risk, a.ready declares an
  idempotencyKey, despite four of the five actions writing to preparation_log — a retry at any
  step could duplicate log entries or re-initiate an already-running prerequisite journey,
  which c.existing's own duplicate-prevention logic depends on not happening.
- P2 (handoff): h.escalate omits a contract block.

---

## SCH-175 — Reschedule Validation

READINESS: NEEDS_CONTRACT_WORK

WHY: The release-after-secure ordering (never release the original until the replacement is
committed) is enforced by the action sequence itself, not just stated in prose — one of the
strongest examples of correction/ordering discipline in this round. The gap is that every
action keys on `booking_id` alone, dropping `reschedule_request_id`, the other half of this
journey's own declared composite instance key.

INSTANCE: `[booking_id, reschedule_request_id]`, one-active-per-key. Per the journey's own
eligibility rule, openness is checked against this exact pair — meaning a second, different
reschedule_request_id against the same booking_id is not structurally excluded from opening
while a first is still active.

STATE AUTHORITY: `declared` (t.requested, evidence.source: declared) — `insufficientAlone`
correctly excludes someone merely viewing other times.

ENTRY-TRANSITIONS: `enter` (t.requested) → `progress` (a.preserve → a.search → c.replacement) →
`resolve` (a.secure → c.secured → a.transfer → a.release-old → a.reconcile → c.prep → x
.rescheduled or h.prepare) or `resolve` (a.no-replacement → x.original-stands). No `expire`
kind — appropriate, this resolves synchronously once a replacement is found or ruled out.

DATA: booking_id, reschedule_request_id, requested_time, replacement_candidate,
preparation_requirements, reservation_log. Every action's idempotencyKey uses `booking_id`
only.

SOURCE OF TRUTH: a.search validates against "current authoritative capacity," not a stale
listing; c.secured explicitly accounts for the replacement being lost to contention between
being found and being secured — a real concurrency case, not assumed away.

CONFIG-TIME: no wait nodes; this resolves synchronously.

OWNERSHIP: owns the move end to end; a.preserve keeps the original confirmed and untouched
until a.transfer/a.release-old prove the replacement is real — the ordering *is* the ownership
discipline here (s.g2).

CONFLICT-PREEMPTION: the instance key's own eligibility rule allows two different
reschedule_request_ids to be open concurrently against one booking_id — a real, undeclared
conflict case the graph does not explicitly rule out or arbitrate between (which one wins if
both secure a replacement?).

HANDOFF: h.prepare→SCH-174 omits a contract block (P2); unlike SCH-173's premature-identifier
case, `booking_id` genuinely exists by this point, so the omission here is purely a missing
contract, not a deeper structural gap.

RE-ENTRY-TERMINALITY: neither exit is terminal. x.original-stands is the batch's first
explicitly `class: "failure"` exit — correctly scoped as a failure of the *reschedule attempt*,
not of the customer's underlying service, which stays exactly as good as before they asked.
x.rescheduled's reEntry states a further move joins the same history rather than replacing it —
correct append-only correction semantics (mirrors REL-93/SCH-176).

OBSERVABILITY: reservation_log (append) covers every action, preserving the original time
across the move (s.g3) — solid for this journey's scope.

OUTCOMES: resolution = x.rescheduled, h.prepare; failure = x.original-stands. No diagnostic
outcome needed — every path here reaches a definite conclusion.

TEST CASES:
- entry: a valid replacement is found and secured cleanly → a.transfer → a.release-old (in that
  order) → a.reconcile → x.rescheduled.
- entry (contention): a replacement is found but taken before securing → a.no-replacement →
  x.original-stands, original untouched.
- correction: queued notifications still aimed at the original time are suppressed by
  a.reconcile before they can fire (tests the reminder-wrong-day failure mode named in the
  action's own description).
- conflict (currently unenforced): two different reschedule_request_ids opened against the same
  booking_id concurrently — verify only one can actually secure a replacement, and that the
  losing one's actions are not silently deduplicated against the winner's due to the missing
  reschedule_request_id in the idempotency key.

GAPS:
- P0 (idempotency): a.preserve, a.no-replacement, a.transfer, a.release-old, a.reconcile all
  key on `booking_id + <action>` alone; `reschedule_request_id` — the other half of this
  journey's own declared instance key — is dropped, so two genuinely different reschedule
  attempts against the same booking could collide under retry/dedup logic.
- P2 (conflict): the two-concurrent-reschedule-requests case the instance key structurally
  allows is not arbitrated by any declared rule.
- P2 (handoff): h.prepare→SCH-174 omits a contract block.

---

## SCH-176 — Reservation Cancellation Reconciliation

READINESS: READY_WITH_MAPPING

WHY: Idempotency is clean across every writing action. The customer/provider-fault distinction
(never letting a provider-side cancellation read as a customer no-show) is a genuinely careful
piece of design, and the refund/fee boundary is properly deferred rather than decided inline.
Only three of the four handoffs need contract blocks.

INSTANCE: `[booking_id]`, one-active-per-key. The reservation survives its own cancellation as a
record — the instance key does not change meaning at cancellation, it just accumulates one more
fact.

STATE AUTHORITY: `authoritative-system` (t.effective, evidence.source: authoritative) —
`insufficientAlone` correctly excludes a cancellation merely requested (may be blocked, may be
for a later effective time) and silence in response to a reminder, which is explicitly not a
cancellation (s.g2's "not a no-show" guardrail starts here, at the trigger).

ENTRY-TRANSITIONS: `enter` (t.effective) → `progress` (a.record → c.actor → a.cancel → a.release
→ a.stop → c.external) → `resolve` (c.financial → x.cancelled, or → h.refund/h.fee) or
`handoff` (c.actor → h.provider, or c.verified → h.reconcile).

DATA: booking_id, cancellation_log, reservation_log, suppressed_sends. a.record, a.cancel,
a.release, a.stop all correctly key on booking_id + <action>. a.verify-external has neither a
key nor a writes entry, appropriately — it is a pure external check.

SOURCE OF TRUTH: c.verified checks an authoritative external confirmation, not elapsed time or
absence of contradiction — a cancellation the external side hasn't confirmed routes to
h.reconcile rather than being assumed successful.

CONFIG-TIME: no wait nodes; resolves synchronously from an already-effective cancellation.

OWNERSHIP: owns ending the booking and reconciling capacity/reminders; explicitly does not own
the refund or fee decision (s.g4) — deferred cleanly to FIN-137/FIN-131.

CONFLICT-PREEMPTION: c.actor is itself a real, structurally enforced conflict rule: a
provider-originated cancellation is routed to a different path (h.provider) than a
customer-originated one specifically so the customer is never misclassified as having cancelled
or as a no-show.

HANDOFF: h.reconcile→external:external-status-reconciliation carries a full contract
([booking_id, handed_at, reason]) — no gap. h.provider→SCH-180, h.refund→FIN-137, and
h.fee→FIN-131 all omit contract blocks (P2, consistent pattern).

RE-ENTRY-TERMINALITY: the sole exit, x.cancelled, is not terminal; reEntry correctly frames a
later booking as a new reservation rather than a resumption of this one, while this
cancellation stays part of the permanent record either way.

OBSERVABILITY: cancellation_log (append, recording actor/source/reason/timing at the moment
rather than reconstructed later) plus reservation_log and suppressed_sends together give a
complete picture of what happened, when, and what was stopped as a result.

OUTCOMES: resolution = x.cancelled (with or without a financial consequence, routed through
first); diagnostic = h.reconcile (external side hasn't confirmed). No failure outcome — a
completed cancellation, however it originated, is not itself a defect.

TEST CASES:
- entry: customer-initiated cancellation, no payment involved → a.cancel → a.release → a.stop →
  x.cancelled directly.
- entry (provider fault): provider-side cancellation → h.provider, with the explicit instruction
  that the customer is not recorded as cancelling.
- entry (financial): a paid booking is cancelled → c.financial → h.refund, with no amount
  invented in this journey.
- handoff: an external-system reservation whose cancellation the external side hasn't confirmed
  → h.reconcile, capacity released locally while possibly still held externally (a real,
  correctly modeled split-state case).

GAPS:
- P2 (handoff): h.provider, h.refund, h.fee all omit contract blocks (h.reconcile is the one
  clean example in this state).

---

## SCH-177 — Pre-Service Revalidation

READINESS: NEEDS_CONTRACT_WORK

WHY: The revalidate-from-now discipline is the strongest single design idea in the scheduling
domain, applied consistently here at start-time. But none of the three writing actions —
a.suppress, a.blocked, a.ready — declares an idempotencyKey at all, the same total-absence gap
found at SCH-174.

INSTANCE: `[booking_id, occurrence_id]`, one-active-per-key. The note is precise about the
mechanism: "the scheduled job carries the booking version it was created against," and
everything downstream begins by comparing that against current state.

STATE AUTHORITY: `authoritative-system` (t.window, evidence.source: authoritative) —
`insufficientAlone` explicitly excludes a reminder having been sent, the scheduled time itself
passing (that's the arrival window opening, not evidence of anything), and a provider-side
readiness check (SCH-174's domain, not this one's).

ENTRY-TRANSITIONS: `enter` (t.window) → `progress` (a.revalidate → c.valid) → `supersede`
(stale/cancelled/moved → a.suppress → x.suppressed) or `progress` (c.provider → c.prereq) →
`resolve` (a.ready → w.arrival → c.arrival → h.attended / h.cancelled) or `expire` (w.arrival
timeout → h.missed) or `handoff` (c.provider → h.provider-exception, or c.prereq → a.blocked →
h.escalate).

DATA: booking_id, occurrence_id, person_id, scheduled_at, timezone, provider_id,
arrival_evidence_source (required); grace_policy_id (optional). No action declares an
idempotencyKey.

SOURCE OF TRUTH: a.revalidate re-reads authoritative current state explicitly instead of
trusting "the confirmation from three weeks ago" — the clearest statement in this batch of why
a scheduled job must never trust its own stale trigger.

CONFIG-TIME: `w.arrival.timeout` — key `scheduling.arrival_window`, class `attribute-bound`,
relativeTo `attribute`/`scheduled_at`, with an explicit `default` (confidence: high, basis:
attribute-bound) and `required: false` — a legitimate default-with-confidence pattern, not a
gap.

OWNERSHIP: owns revalidation and the ready/suppressed/blocked determination; transfers at every
handoff (h.attended, h.cancelled, h.missed, h.provider-exception, h.escalate) rather than
attempting to resolve any of those outcomes itself.

CONFLICT-PREEMPTION: s.stale and s.cancelled-inside-window are both real, well-reasoned
conflict/suppression rules — a stale job never revives a cancelled or moved booking, and a
cancellation inside the start window is routed as a cancellation, never misclassified as a
miss.

HANDOFF: h.provider-exception, h.escalate, h.attended, h.cancelled, h.missed all omit contract
blocks (P2, consistent pattern — a notably high count for one state, worth flagging as a
concentration).

RE-ENTRY-TERMINALITY: the sole exit, x.suppressed, is not terminal; reEntry correctly hands the
booking's current version its own scheduled occurrence, revalidated fresh.

OBSERVABILITY: carries a fuller measurement block than most states audited so far — a declared
`businessOutcome` (attendance_recorded) and two named guardrails
(service_started_on_stale_booking, attendance_recorded_without_evidence) that map directly onto
s.stale and the ready/upcoming distinction, though nothing in the graph currently writes data
those guardrails could be mechanically checked against.

OUTCOMES: resolution = h.attended; diagnostic = h.cancelled, h.missed, h.provider-exception,
h.escalate; neutral = x.suppressed. No bare failure outcome.

TEST CASES:
- entry: pre-start window reached on a still-confirmed, deliverable booking → a.ready →
  w.arrival.
- supersession: the booking was cancelled or moved since the job was scheduled → a.suppress →
  x.suppressed, nothing started.
- entry (provider-side): the assigned provider cannot deliver → h.provider-exception, customer
  obligation stated as standing.
- timeout: w.arrival closes with no attendance established → h.missed (explicitly not yet a
  no-show — that determination belongs to SCH-179).
- late-event: a cancellation arrives after the start window opened → h.cancelled, not treated
  as a miss (tests s.cancelled-inside-window).

GAPS:
- P0 (idempotency): a.suppress, a.blocked, a.ready all write state but declare no
  idempotencyKey; a retry at any of these steps risks duplicate log entries or, for a.suppress,
  a duplicate suppressed_sends entry.
- P2 (handoff): all five outbound handoffs omit contract blocks.

---

## SCH-178 — Service Completion

READINESS: READY_WITH_MAPPING

WHY: Clean idempotency across all eight actions, and the attendance-vs-completion boundary
(s.g1/s.g2/s.g3) is the most carefully drawn distinction of its kind in this batch — including a
genuinely rare, well-used `attemptBudget` guard bounding the interrupt/resume loop.

INSTANCE: `[booking_id]`, one-active-per-key. Attendance is about the occurrence; completion is
about the obligation — the note states directly that one appointment can end with the first true
and the second false, which is exactly what the exit/handoff model then enforces.

STATE AUTHORITY: `authoritative-system` (t.started, evidence.source: authoritative) —
`insufficientAlone` correctly excludes a reminder opened or clicked (interest, not attendance)
and mere arrival at a location where the booking semantics require an explicit check-in.

ENTRY-TRANSITIONS: `enter` (t.started) → `progress` (a.state → a.track → w.service) →
`resolve` (c.outcome → a.complete → x.completed) or `handoff` (a.partial → h.remainder) or
`progress` (a.interrupt → c.interruption → a.resume [loops back to w.service, budget-guarded] /
h.reschedule / h.remainder) or `handoff` (a.could-not → c.cause → h.provider / h.rebook) or
`expire` (w.service timeout → a.unknown → h.reconcile).

DATA: booking_id, occurrence_log. All eight actions with writes (a.state, a.track, a.unknown,
a.complete, a.partial, a.interrupt, a.resume, a.could-not) correctly key on
`booking_id + <action>`. No idempotency gap.

SOURCE OF TRUTH: w.service waits on two named events (service_completion_recorded,
service_interrupted); an occurrence that started and was never concluded is explicitly recorded
as unknown rather than assumed complete.

CONFIG-TIME: `w.service.timeout` — key `service_attendance.service`, class
`observation-window`, relativeTo `trigger`, required: true. a.interrupt's `attemptBudget` (key
`service_attendance.interrupt_budget`, required: true) is a second, distinct config-time
control — bounding a resume/interrupt cycle rather than a single wait, and the only one of its
kind seen so far in this batch. Both correctly declared.

OWNERSHIP: owns attendance and completion tracking end to end; transfers only at the four
handoffs, each for a genuinely different cause (partial delivery, contested rescheduling need,
provider-side failure, customer-side failure).

CONFLICT-PREEMPTION: c.cause is itself a real, structurally enforced distinction — a service
that could not proceed after arrival is never conflated between a provider-side failure
(h.provider, explicitly "never classified as a no-show") and a customer-side one (h.rebook).

HANDOFF: h.reconcile→external:side-effect-reconciliation carries a full contract ([booking_id,
handed_at, reason]) — no gap. h.remainder, h.reschedule, h.provider, h.rebook all omit contract
blocks (P2, consistent pattern).

RE-ENTRY-TERMINALITY: the sole exit, x.completed, is not terminal; reEntry correctly routes a
post-completion problem to its own assessment rather than reopening this journey.

OBSERVABILITY: occurrence_log (append) covers all eight actions, with named states
(IN_SERVICE/ATTENDED, COMPLETED, PARTIALLY_COMPLETED) that are queryable independent of the
exit taken.

OUTCOMES: resolution = x.completed; diagnostic = h.remainder, h.reschedule, h.reconcile;
failure = h.provider, h.rebook (service could not proceed, attributed correctly by cause). No
outcome conflates attendance with success (s.g2 enforced structurally).

TEST CASES:
- entry: full delivery, no interruption → a.complete → x.completed.
- entry (partial): part of the scope delivered → a.partial → h.remainder, remaining scope
  stated explicitly.
- correction (interrupt/resume): delivery stops and the cause clears within the occurrence →
  a.resume (budget-guarded) → w.service again.
- timeout: w.service unanswered → a.unknown → h.reconcile, no completion inferred.
- entry (could-not, customer-side): customer arrived, a required customer-owned item was
  missing → a.could-not → h.rebook, explicitly not a no-show.

GAPS: none found.

---

## SCH-179 — No-Show Validation

READINESS: READY_WITH_MAPPING

WHY: Clean idempotency on both writing actions, and the most disciplined exclusion sequence in
this batch — cancellation, provider failure, undefined semantics and late arrival are all ruled
out, in that order, before a no-show is ever recorded. Late-arriving attendance evidence
reconciles against the record rather than being ignored.

INSTANCE: `[booking_id]`, one-active-per-key. "One occurrence... it is a fact about one
appointment," not a statement about the relationship — a boundary this journey enforces by
scope alone.

STATE AUTHORITY: `authoritative-system` (t.passed, evidence.source: authoritative) —
`insufficientAlone` correctly excludes the scheduled start time merely passing, which closes
nothing about someone running late (that's the arrival window, owned by SCH-177).

ENTRY-TRANSITIONS: `enter` (t.passed) → `progress` (a.revalidate → c.superseded) → `supersede`
(a.suppress → x.suppressed) or `progress` (c.provider → c.semantics → c.attended) → `handoff`
(c.provider → h.provider, or c.semantics → h.undefined, or c.attended → h.attended) or
`resolve` (a.no-show → c.next → x.closed / h.rebook / h.fee).

DATA: booking_id, occurrence_log, suppressed_sends. a.suppress and a.no-show both correctly key
on `booking_id + <action>`. a.revalidate has neither a key nor writes, appropriately — pure
re-read.

SOURCE OF TRUTH: c.semantics explicitly checks whether the booking's own grace/late-arrival
rules are even defined before concluding anything, routing to h.undefined rather than inventing
a default (mirrors SUB-165's s.undefined-grace pattern).

CONFIG-TIME: no wait nodes — this journey only runs once the windows it depends on (owned by
SCH-177) have already closed.

OWNERSHIP: owns the no-show determination itself; transfers at every branch point rather than
resolving cause elsewhere in place.

CONFLICT-PREEMPTION: c.superseded and c.provider are both real conflict/exclusion checks — a
cancelled or rescheduled booking is never classified as a no-show (s.g2), and neither is a
provider-side failure to deliver.

HANDOFF: h.provider, h.undefined, h.attended, h.rebook, h.fee all omit contract blocks (P2,
consistent pattern, and — like SCH-177 — a notable concentration in one state).

RE-ENTRY-TERMINALITY: neither exit is terminal. x.closed's reEntry is the batch's clearest
correction/late-event statement: "a late system update is a reason to correct the record, not
evidence that the record was right" (s.g4) — genuine append-and-reconcile discipline rather
than either ignoring the late event or silently overwriting the no-show.

OBSERVABILITY: occurrence_log (append) plus suppressed_sends (append) together record the
determination and, on the suppressed path, what was suppressed and why.

OUTCOMES: resolution = x.closed; neutral = x.suppressed; diagnostic = h.undefined, h.attended,
h.provider. No fee is ever invented (s.g3) — h.fee only fires when policy terms actually attach
one.

TEST CASES:
- entry: service and arrival windows closed, booking cancelled beforehand → a.suppress →
  x.suppressed, nothing attributed.
- entry: provider could not have delivered regardless of attendance → h.provider, not a no-show.
- insufficient-evidence: no defined attendance semantics for this service → h.undefined
  (DEC-181), no grace period invented.
- entry: customer arrives within the defined grace period → h.attended, not a no-show.
- late-event: an attendance event arrives after NO_SHOW was recorded → reconciles against the
  existing record rather than being dropped (tests s.g4).

GAPS:
- P2 (handoff): all five outbound handoffs omit contract blocks.

---

## SUB-161 — Relationship Activation

READINESS: NEEDS_CONTRACT_WORK

WHY: The existence-vs-running distinction (a record created is not a relationship active,
s.g1) and the activation-does-not-imply-entitlement boundary (s.g4) are both well modeled. All
six actions key on `subscription_id` — undeclared here, and now the third independent instance
of this exact gap after RET-23 and RET-29, strengthening the case that this is a genuine
cross-cutting defect rather than an isolated typo.

INSTANCE: `[relationship_id]`, one-active-per-key. The note draws a careful line: this owns
continuing relationships governed by terms and effective periods, explicitly not a structural
link merely because it is long-lived (REL-91's domain).

STATE AUTHORITY: `authoritative-system` (t.authorized, evidence.source: authoritative) —
`insufficientAlone` explicitly excludes a payment succeeding (funds a relationship without
necessarily starting it — "some contracts activate on signature, some on provisioning, some on
a regulatory date"), a plan merely selected in an interface, and a structural link's creation.

ENTRY-TRANSITIONS: `enter` (t.authorized) → `progress` (a.create → c.effective) → `progress`
(a.requirements → c.satisfied) → `resolve` (a.activate → h.entitlement) or `progress`
(a.pending-req → w.requirement → c.recheck → a.activate or a.abandon → x.never-active) or
`handoff` (c.effective → a.pending-date → h.scheduled).

DATA: relationship_id, parties, effective_at, activation_requirements, relationship_log.
`subscription_id` is not declared.

SOURCE OF TRUTH: c.satisfied and c.recheck both check "authoritatively met" conditions, not
elapsed time or assumption — a.requirements explicitly rejects assuming payment is the only
activation condition ("activates contracts that were never signed").

CONFIG-TIME: `w.requirement.timeout` — key `continuing_relationship.requirement`, class
`observation-window`, relativeTo `trigger`, required: true. Correctly bound.

OWNERSHIP: owns creation and activation; explicitly does not own what the relationship grants —
h.entitlement hands that to ACC-73 with the note that "activation grants nothing by itself."

CONFLICT-PREEMPTION: none declared, none obviously needed — one relationship record per
relationship_id, and the instance key enforces exclusivity.

HANDOFF: h.scheduled→SUB-162 and h.entitlement→ACC-71 both omit contract blocks (P2, consistent
pattern).

RE-ENTRY-TERMINALITY: the sole exit, x.never-active, is not terminal; reEntry correctly treats a
new agreement between the same parties as a new relationship, never a resumption. a.abandon's
own rationale — "worth being able to count" — shows real observability intent behind preserving
the record rather than discarding it.

OBSERVABILITY: relationship_log (append) covers every writing action, including named states
(CREATED, PENDING_EFFECTIVE_DATE, PENDING_REQUIREMENT, ACTIVE) queryable independent of the
exit/handoff taken.

OUTCOMES: resolution = h.entitlement; diagnostic = h.scheduled; failure = x.never-active. No
outcome conflates creation with activation (s.g1 enforced structurally, not just stated).

TEST CASES:
- entry: agreement effective immediately, all requirements already met → a.activate →
  h.entitlement.
- entry: agreement effective in the future → a.pending-date → h.scheduled (SUB-162 owns the
  rest).
- insufficient-evidence: a governing requirement outstanding → a.pending-req → w.requirement.
- timeout: w.requirement unanswered → a.abandon → x.never-active, record preserved with reason.
- correction: none needed in this journey's own scope — a relationship abandoned here does not
  reopen; a new agreement starts fresh, correctly.

GAPS:
- P0 (idempotency): a.create, a.pending-date, a.requirements, a.pending-req, a.abandon,
  a.activate all key on `subscription_id + relationship_id + <action>`; `subscription_id` is
  undeclared — the third instance of this exact pattern (after RET-23, RET-29), which points to
  a systemic gap rather than three unrelated ones.
- P2 (handoff): h.scheduled and h.entitlement both omit contract blocks.

---

## SUB-162 — Future Activation Revalidation

READINESS: READY_WITH_MAPPING

WHY: Clean idempotency throughout, and this is the subscription domain's mirror of SCH-177's
core discipline — a future-dated activation is decided from what is true at the effective time,
never from the snapshot taken when it was scheduled. Only the outbound handoff needs a
contract.

INSTANCE: `[relationship_id]`, one-active-per-key. The note is explicit that prerequisites
recorded at scheduling are "a snapshot kept for comparison," never the basis activation
actually proceeds on.

STATE AUTHORITY: `authoritative-system` (t.future, evidence.source: authoritative) —
`insufficientAlone` correctly excludes a relationship effective immediately (SUB-161's domain,
not this one) and a cancellation before start, which suppresses rather than starts activation.

ENTRY-TRANSITIONS: `enter` (t.future) → `progress` (a.schedule → w.effective) → `supersede`
(c.preempt → a.cancel-scheduled → x.cancelled-before-start) or `progress` (a.note → keeps
waiting, budget-guarded) or `expire` (w.effective timeout → a.revalidate → c.still-valid) →
`resolve` (a.activate → h.entitlement) or `progress` (a.hold → w.hold) → `resolve`
(w.hold onEvent → a.activate) or `expire` (w.hold timeout → a.failed → x.failed).

DATA: relationship_id, relationship_log, suppressed_sends. All seven actions with writes
(a.schedule, a.note, a.cancel-scheduled, a.hold, a.failed, a.activate) correctly key on
`relationship_id + <action>`. a.revalidate has neither a key nor writes, appropriately — pure
re-read at the effective moment.

SOURCE OF TRUTH: a.revalidate is the second appearance in this batch (after SCH-177) of the
exact same principle applied to a different domain: "the decision is made from what is
authoritative now, and the stored snapshot is used only to see what moved."

CONFIG-TIME: `w.effective.timeout` — key `future_effective.effective`, class `attribute-bound`,
relativeTo `attribute`/`effective_at`, required: true, explicitly framed as "the normal outcome
rather than a failure." `w.hold.timeout` — key `future_effective.hold`, class
`observation-window`, relativeTo `trigger`, required: true. `a.note`'s `attemptBudget` (key
`future_effective.note_budget`, required: true) bounds the prerequisite-change-noting loop —
mirroring SCH-178's interrupt-budget pattern in a different domain.

OWNERSHIP: owns the wait-and-revalidate period entirely; transfers only at h.entitlement, once
activation is confirmed.

CONFLICT-PREEMPTION: c.preempt is a real, structurally enforced rule: a pre-start cancellation
suppresses the stale activation outright (s.g3) rather than letting it run and reconciling
after the fact.

HANDOFF: h.entitlement→ACC-71 omits a contract block (P2, consistent pattern).

RE-ENTRY-TERMINALITY: neither exit is terminal. x.failed's reEntry explicitly rules out
retroactive activation — "the prerequisites being satisfied later does not activate this
relationship retroactively" — a clean, correct non-retroactivity statement paired with
x.cancelled-before-start's equally clean "closed at a state it never left."

OBSERVABILITY: relationship_log (append) plus suppressed_sends (append) together cover every
writing action and what was suppressed on cancellation.

OUTCOMES: resolution = h.entitlement; failure = x.failed; neutral = x.cancelled-before-start.
No outcome allows a snapshot from scheduling time to silently stand in for the effective-time
truth.

TEST CASES:
- timeout (normal path): w.effective reaches its effective_at with requirements still valid →
  a.revalidate → a.activate → h.entitlement.
- correction: a prerequisite changes while still scheduled → a.note (budget-guarded, does not
  act early) → keeps waiting until the effective date.
- supersession: cancelled before the effective date → a.cancel-scheduled → x.cancelled-before-
  start, stale job suppressed.
- entry (hold): requirement missing but recoverable at effective time, policy allows delay →
  a.hold → w.hold.
- timeout (hold): w.hold unanswered → a.failed → x.failed, no retroactive activation later.

GAPS:
- P2 (handoff): h.entitlement→ACC-71 omits a contract block.

---

## SUB-165 — Renewal Payment Recovery

READINESS: NEEDS_CONTRACT_WORK

WHY: The state-vs-money separation (this journey holds the relationship's state; payment
recovery and its messaging belong entirely to FIN-134, per s.no-messages-here) is an exemplary,
explicit statement of exactly this round's "silence is not incompleteness" principle. But its
idempotency declarations are the worst found in this round: two actions use non-field,
prose-fragment pseudo-keys, and three writing actions have no idempotencyKey at all.

INSTANCE: `[subscription_id, renewal_cycle_id]`, one-active-per-key. Two lifecycles run at
once, by design — the financial one chasing money, this one deciding what the relationship can
do while that happens.

STATE AUTHORITY: `authoritative-system` (t.failed, evidence.source: authoritative) —
`insufficientAlone` correctly excludes a payment attempt merely erroring in transit ("unknown
rather than failed... treating unknown as failed puts relationships into grace over payments
that succeeded") — a real, well-reasoned distinction most payment-adjacent journeys in this
corpus get right.

ENTRY-TRANSITIONS: `enter` (t.failed) → `progress` (a.recovery → c.policy) → `handoff`
(undefined policy → h.undefined) or `progress` (a.state → c.restrict) → `progress` (a.restrict
→ w.recovery, or directly → w.recovery) → `resolve` (c.outcome → c.remaining → h.complete) or
`progress` (a.alternate → c.remaining) or `resolve` (a.lapse → h.end) or `expire` (w.recovery
timeout → a.lapse → h.end).

DATA: subscription_id, renewal_cycle_id, grace_policy_id, grace_deadline_at, failed_at,
obligation_id (required); restriction_scope, alternate_resolution_ref (optional). a.recovery's
idempotencyKey is `renewal_cycle_id + grace state` — "grace state" is not a declared field, and
`subscription_id` (half of the composite instance key) is absent. a.restrict's is
`renewal_cycle_id + restriction scope` — same shape of defect, referencing prose rather than the
declared optional field `restriction_scope`. a.state, a.alternate, and a.lapse declare no
idempotencyKey at all despite each having a `writes` entry.

SOURCE OF TRUTH: c.outcome distinguishes an authoritatively recovered payment from an
authorized alternate resolution — both real, both properly gated, neither inferred from silence
or elapsed time.

CONFIG-TIME: `w.recovery.timeout` — key `renewal_payment.grace_deadline`, class
`attribute-bound`, relativeTo `attribute`/`grace_deadline_at`, with an explicit `default`
(confidence: high) and `required: false` — a legitimate default pattern, no gap.

OWNERSHIP: the sharpest ownership boundary in this batch — a.recovery explicitly raises the
failure into the payment lifecycle "which owns classification and collection," while this
journey "does not chase the money; it holds the relationship's state while that runs."

CONFLICT-PREEMPTION: s.undefined-grace is a real, correctly enforced rule: a subscription class
with no defined grace policy is never given an invented one — it goes straight to DEC-181.

HANDOFF: h.undefined→DEC-181, h.complete→SUB-164, h.end→SUB-170 all omit contract blocks (P2,
consistent pattern).

RE-ENTRY-TERMINALITY: no exits at all — every path is a handoff (h.undefined, h.complete,
h.end), the corpus's router pattern again, appropriate here since a renewal recovery always
resolves into either the completed-renewal journey or the ending journey.

OBSERVABILITY: carries a fuller measurement block (businessOutcome: obligation_satisfied;
guardrails: duplicate_payment_message, grace_state_invented, end_before_grace_deadline) that
maps directly onto this journey's own canonical rules — grace_state_invented in particular
mirrors s.undefined-grace exactly, though the guardrail cannot currently be mechanically
checked given the idempotency defects above.

OUTCOMES: resolution = h.complete; diagnostic = h.undefined; failure = h.end (lapsed). No bare
success/failure exit — every path is explicitly a handoff to the journey that owns what happens
next.

TEST CASES:
- entry: renewal payment fails, grace policy defined, full access continues → a.state →
  w.recovery.
- insufficient-evidence: no grace/lapse policy defined for this subscription class →
  h.undefined, no grace state invented.
- correction: payment recovered mid-grace → c.outcome → c.remaining → h.complete, relationship
  state through recovery carried forward rather than left as a gap.
- late-event: a payment arrives after the grace deadline passed and the relationship already
  lapsed → reconciled against current state, never applied retroactively (tests the guardrail
  named in the journey's own guardrails list).
- timeout: w.recovery unanswered at grace_deadline_at → a.lapse → h.end.

GAPS:
- P0 (idempotency): a.recovery (`renewal_cycle_id + grace state`) and a.restrict
  (`renewal_cycle_id + restriction scope`) both use non-field prose fragments as idempotency
  keys rather than declared attribute references, and both omit `subscription_id`, half of this
  journey's own composite instance key.
- P0 (idempotency): a.state, a.alternate, a.lapse all write state (relationship_log or
  renewal_log) but declare no idempotencyKey at all.
- P2 (handoff): h.undefined, h.complete, h.end all omit contract blocks.

---

## SUB-166 — Plan Change Validation

READINESS: READY_WITH_MAPPING

WHY: Clean idempotency across all six writing actions, and the most thorough condition
coverage of any state in this batch (23 nodes) — permission, timing, version-validity,
dependency and scope are each checked as a genuinely separate question, and none of them is
skipped or assumed.

INSTANCE: `[relationship_id]`, one-active-per-key. The note is precise about what is stored:
"the delta and the relationship version it was authorized against," never the resulting terms —
because those depend on a relationship that will have moved by the time the change lands.

STATE AUTHORITY: `authoritative-system` (t.requested, evidence.source: authoritative) —
`insufficientAlone` correctly excludes someone merely asking about a different plan (a
question, not an authorized change) and a structural-relationship change between the same two
entities (REL-92's domain, not this one's).

ENTRY-TRANSITIONS: `enter` (t.requested) → `progress` (a.capture → c.allowed) → `resolve`
(a.reject → x.rejected) or `handoff` (h.undefined) or `progress` (c.timing → a.validate-deps →
c.deps) → `resolve` (a.apply → c.scope → x.applied / h.entitlement / h.financial) or `resolve`
(a.not-applied → x.not-applied) or `progress` (a.schedule → w.effective) → `expire` (timeout →
a.revalidate → c.still-valid) → `resolve` (a.apply, as above) or `supersede` (a.void →
x.void) or `handoff` (h.review).

DATA: relationship_id, change_log, suppressed_sends, relationship_log. a.capture, a.reject,
a.schedule, a.void, a.not-applied, a.apply all correctly key on
`relationship_id + <action>`. a.revalidate and a.validate-deps have neither a key nor writes,
appropriately — both are pure re-reads/checks.

SOURCE OF TRUTH: c.still-valid explicitly checks the delta against the relationship's current
authoritative version, not the one it was authorized against — a.revalidate's own description
names the failure mode directly ("a downgrade authorized in March, applied to a relationship
upgraded twice since, produces terms nobody chose").

CONFIG-TIME: `w.effective.timeout` — key `terms_change.effective`, class `attribute-bound`,
relativeTo `attribute`/`change_effective_at`, required: true. Correctly bound.

OWNERSHIP: owns validating and applying the delta; explicitly does not decide what the delta
grants — h.entitlement and h.financial each carry the note that this journey "changed the
agreement and did not switch anything on or off" / "did not decide" the financial consequence.

CONFLICT-PREEMPTION: none declared as a structured `ConflictRef`, though s.g4 (a scheduled
change never executes against a relationship that has materially changed without revalidation)
is itself a real, structurally enforced version-conflict rule via c.still-valid.

HANDOFF: h.undefined, h.review (both →DEC-181), h.entitlement→ACC-73, h.financial→FIN-131 all
omit contract blocks (P2, consistent pattern).

RE-ENTRY-TERMINALITY: none of the four exits is terminal. x.applied's reEntry states further
changes are evaluated "against this version rather than against the original agreement" — a
clean, correct versioning chain. x.rejected's reEntry notes the same change may become
permitted at a different point in the relationship (a term boundary, after a minimum period) —
genuine time-sensitivity rather than a blanket rejection.

OBSERVABILITY: change_log (append) plus relationship_log (append, only on actual application)
together separate "a change was requested/scheduled/rejected" from "a change was applied as a
new terms version" — a real distinction, not just two logs of the same thing.

OUTCOMES: resolution = x.applied, h.entitlement, h.financial; failure = x.rejected,
x.not-applied, x.void; diagnostic = h.undefined, h.review. No outcome conflates a requested
change with an applied one (s.g1 enforced structurally).

TEST CASES:
- entry: an immediately-permitted change with all dependencies satisfied and no scope effect →
  a.apply → x.applied directly.
- entry (future-dated): a change deferred to a future effective time → a.schedule →
  w.effective.
- correction: a scheduled change's relationship has materially changed by the effective time →
  a.revalidate → c.still-valid → h.review (a decision, not an automatic execution).
- supersession: the base relationship ends before the scheduled change's effective time →
  a.void → x.void, nothing applied to something no longer running.
- entry (dependency-blocked): required capacity, eligibility or provisioning is missing at
  apply time → a.not-applied → x.not-applied, terms left unchanged (never half-applied).

GAPS:
- P2 (handoff): all four outbound handoffs omit contract blocks.

---

## SUB-167 — Cancellation Effective-Date Resolution

READINESS: READY_WITH_MAPPING

WHY: Clean idempotency across all four actions, and the corpus's first structured competition
declaration seen in several batches — a genuine, well-formed exclusivity rule against a renewal
decision on the same relationship.

INSTANCE: `[relationship_id]`, one-active-per-key. The note draws the boundary precisely: the
request produces an effective end date, not an ended relationship, and between the two the
relationship is "entirely normal."

STATE AUTHORITY: `declared` (t.requested, evidence.source: declared) — `insufficientAlone`
correctly excludes someone merely asking how to cancel or viewing a cancellation page, which is
intent rather than a request.

ENTRY-TRANSITIONS: `enter` (t.requested) → `progress` (a.determine → c.authority) → `handoff`
(c.authority → h.authority, or c.policy → h.undefined) or `resolve` (c.blocker → a.blocked →
x.blocked) or `resolve` (c.timing → a.immediate → h.end, or a.schedule → h.scheduled).

DATA: relationship_id, cancellation_log. a.determine, a.blocked, a.immediate, a.schedule all
correctly key on `relationship_id + <action>`. No idempotency gap.

SOURCE OF TRUTH: c.policy checks whether the relationship's cancellation semantics are actually
defined before proceeding — a request against undefined semantics routes to h.undefined rather
than assuming a default notice period.

CONFIG-TIME: no wait nodes; this journey resolves synchronously once authority and policy are
established.

OWNERSHIP: owns determining whether and when the relationship ends; explicitly does not touch
current entitlement (s.g3) — the relationship stays ACTIVE and fully functional through
a.schedule's own description.

CONFLICT-PREEMPTION: this journey declares `contact.competition` — `exclusionGroup:
"relationship-continuity"`, precedence "a cancellation in motion outranks a renewal decision on
the same relationship," `onLoss: "paused"`. A genuine, structured conflict rule, the first of
its kind seen in several groups. This round did not audit whichever renewal-decision journey is
the other side of this exclusionGroup, so whether that journey correctly declares the same
group membership is unverified here.

HANDOFF: h.authority, h.undefined (both →DEC-181), h.end→SUB-170, h.scheduled→SUB-168 all omit
contract blocks (P2, consistent pattern).

RE-ENTRY-TERMINALITY: the sole exit, x.blocked, is not terminal and is explicitly a `class:
"failure"` exit — correctly scoped as a failure of the cancellation attempt, with the
relationship (and its entitlements) stated as unchanged in the meantime.

OBSERVABILITY: cancellation_log (append) covers all four actions, naming the blocker explicitly
where one applies rather than leaving a bare refusal.

OUTCOMES: resolution = h.end, h.scheduled; failure = x.blocked; diagnostic = h.authority,
h.undefined. No outcome invents cancellation semantics the relationship's own terms do not
state (s.g4).

TEST CASES:
- entry: authorized request, semantics allow immediate end → a.immediate → h.end.
- entry: authorized request, semantics defer to term boundary → a.schedule → h.scheduled,
  relationship left ACTIVE and fully entitled until then.
- insufficient-evidence: requester's authority over the relationship is not established →
  h.authority, nothing about the relationship changes while resolved.
- entry (blocked): a minimum term or outstanding obligation blocks the request → a.blocked →
  x.blocked, blocker named explicitly.
- conflict: a renewal decision and a cancellation request are both in motion on the same
  relationship at once — verify the declared exclusionGroup actually resolves in the
  cancellation's favor (unverifiable within this round's scope, since the renewal-side journey
  was not audited here).

GAPS:
- P2 (handoff): all four outbound handoffs omit contract blocks.
- P2 (conflict): the `relationship-continuity` exclusionGroup's counterpart declaration (on
  whichever renewal-decision journey shares it) is outside this round's scope to verify.

---

## SUB-168 — Scheduled Cancellation Revalidation

READINESS: READY_WITH_MAPPING

WHY: Clean idempotency, and the cleanest single statement in this batch of the
revalidate-from-now family of design principles (also seen at SCH-177, SUB-162, SUB-169,
TIM-62): a scheduled end never executes against a relationship the counterparty has since
chosen to keep.

INSTANCE: `[relationship_id]`, one-active-per-key. The note states the entire job in one
sentence: compare the version the termination was authorized against to the current one.

STATE AUTHORITY: `authoritative-system` (t.effective, evidence.source: authoritative) —
`insufficientAlone` correctly excludes a scheduled end whose time has not arrived, a
cancellation merely requested but not scheduled, and a renewal decision (its own lifecycle).

ENTRY-TRANSITIONS: `enter` (t.effective) → `progress` (a.reread → c.valid) → `supersede`
(a.suppress → x.suppressed) or `resolve` (a.obligations → a.end → h.end).

DATA: relationship_id, cancellation_log, suppressed_sends, relationship_log. a.suppress,
a.obligations, a.end all correctly key on `relationship_id + <action>`. a.reread has neither a
key nor writes, appropriately — pure re-read at the effective moment.

SOURCE OF TRUTH: a.reread explicitly compares against "the version the cancellation was
authorized against — not against the copy the scheduled job is carrying" — the same principle
as SCH-177's a.revalidate, applied to relationship termination instead of a booking start.

CONFIG-TIME: no wait nodes; this journey fires once its own effective-time trigger has already
arrived.

OWNERSHIP: owns the version-comparison decision and the terminal record; hands off to SUB-170
only once the end is confirmed still valid.

CONFLICT-PREEMPTION: s.g2 is a real, structurally enforced supersession rule: a reactivation,
resubscription or change after scheduling invalidates the old cancellation outright — the
c.valid condition is exactly this check.

HANDOFF: h.end→SUB-170 omits a contract block (P2).

RE-ENTRY-TERMINALITY: the sole exit, x.suppressed, is not terminal; reEntry correctly frames a
fresh cancellation as a new decision, while the suppressed one stays in the record as
"something that was decided and then overtaken" — clean historical accounting.

OBSERVABILITY: cancellation_log and relationship_log (both append) together cover the
suppression path and the actual termination record separately.

OUTCOMES: resolution = h.end; neutral = x.suppressed. No outcome executes a stale decision
(s.g1 enforced structurally, not just stated).

TEST CASES:
- timeout (normal path): scheduled effective time arrives, cancellation still valid against
  current version → a.obligations → a.end → h.end.
- supersession: the counterparty reactivated, resubscribed, or changed the plan since
  scheduling → a.suppress → x.suppressed, relationship continues on its current version.
- correction: none needed beyond the suppression path itself — this journey has no reversal, by
  design, since a superseded cancellation simply never executes.

GAPS:
- P2 (handoff): h.end→SUB-170 omits a contract block.

---

## SUB-169 — Relationship Suspension

READINESS: READY_WITH_MAPPING

WHY: Clean idempotency across all six actions, a disciplined ownership boundary against ACC-78
(this owns the contractual state, access owns what's switched off), and a suspension model that
forces a decision at its maximum duration rather than letting an unresolved hold age silently.

INSTANCE: `[relationship_id]`, one-active-per-key. The note is explicit: the relationship keeps
existing, keeps its term, and — unless policy says otherwise — keeps counting toward renewal
while suspended.

STATE AUTHORITY: `authoritative-system` (t.condition, evidence.source: authoritative) —
`insufficientAlone` correctly excludes a bare risk signal (a reason to look, not to suspend) and
a single failed payment (its own recovery lifecycle runs first, before ever reaching this one).

ENTRY-TRANSITIONS: `enter` (t.condition) → `progress` (a.record → c.dates → a.adjust or a.keep
→ a.restrict → w.suspension) → `resolve` (c.outcome → a.revalidate → c.still → a.restore →
x.restored) or `handoff` (c.still → h.end, or c.outcome → h.end) or `expire` (w.suspension
timeout → h.review).

DATA: relationship_id, relationship_log. All six writing actions (a.record, a.adjust, a.keep,
a.restrict, a.restore) correctly key on `relationship_id + <action>`; a.revalidate has neither
a key nor writes, appropriately.

SOURCE OF TRUTH: a.revalidate explicitly rebuilds capability from current terms rather than a
suspension-time snapshot — "the plan may have changed, the term may have renewed at a different
scope, and a suspension lasting months usually spans at least one of those" — the fourth
instance of the revalidate-from-now principle in this batch.

CONFIG-TIME: `w.suspension.timeout` — key `relationship_suspension.suspension`, class
`attribute-bound`, relativeTo `attribute`/`maximum_suspension_ends_at`, required: true. The
timeout forces a decision ("an indefinite suspension is a termination without a decision")
rather than letting the state persist unresolved — a genuinely good terminality design choice.

OWNERSHIP: the sharpest ownership boundary against a sibling journey in this batch — a.restrict
explicitly states this journey owns the relationship's contractual state, while capability
restriction is raised through the access lifecycle (ACC-78), which owns "what is switched off
and how." Matches the `distinctFrom` note precisely.

CONFLICT-PREEMPTION: none declared as a structured `ConflictRef`; the ACC-78 boundary above is
prose-only (distinctFrom) but correctly non-overlapping by design (this owns contract, ACC-78
owns access).

HANDOFF: h.review→DEC-181 and h.end→SUB-170 both omit contract blocks (P2, consistent
pattern).

RE-ENTRY-TERMINALITY: the sole exit, x.restored, is not terminal; reEntry correctly frames a
further suspension as a new one with its own reason and restoration condition, while the
previous stays in the record.

OBSERVABILITY: relationship_log (append) covers every action, including the restoration
condition itself (s.g4 — "a suspension always states the condition that would restore it,"
backed directly by a.record's own required content).

OUTCOMES: resolution = x.restored; diagnostic = h.review (undecided at max duration); failure =
h.end (terminal decision taken). No outcome silently extends or resets dates without an
explicit policy basis (s.g2 enforced via c.dates).

TEST CASES:
- entry: a suspension condition applies, policy leaves renewal dates fixed → a.keep →
  a.restrict → w.suspension.
- entry (dates move): policy explicitly extends dates during suspension → a.adjust (recorded
  with its basis, never silent) → a.restrict.
- correction: restoration condition met → a.revalidate → a.restore, capability rebuilt from
  current terms rather than replayed from the suspension-time snapshot.
- timeout: w.suspension reaches maximum_suspension_ends_at with no decision → h.review, forced
  rather than left open indefinitely.
- terminal: a decision is taken to end rather than resume, either mid-suspension or after
  review → h.end.

GAPS:
- P2 (handoff): h.review and h.end both omit contract blocks.

---

## SUB-170 — Continuing Relationship End Reconciliation

READINESS: READY_WITH_MAPPING

WHY: Clean idempotency across all six actions, and the clearest statement anywhere in this
batch of "this journey orchestrates, it does not implement" — a.wind-down explicitly raises
every dependent area's wind-down through its own lifecycle and implements none of them here.

INSTANCE: `[relationship_id]`, one-active-per-key. The note draws three separate boundaries at
once: this ends a term, not an account (TRM-106's domain) and not a structural link (REL-93's
domain) — the same three-way separation RET-29 draws for cancellation wind-down, now applied at
actual relationship end.

STATE AUTHORITY: `authoritative-system` (t.end, evidence.source: authoritative) —
`insufficientAlone` correctly excludes a cancellation merely requested (sets a date, doesn't
reach one), a payment merely failing (may never become an ending), and a structural
relationship ending (a different journey's domain).

ENTRY-TRANSITIONS: `enter` (t.end) → `progress` (a.record → a.stop → a.entitlement-loss →
a.wind-down → c.obligations) → `progress` (a.preserve → c.complete) or directly → `resolve`
(a.terminal → x.former) or `expire` (w.winddown timeout → h.escalate).

DATA: relationship_id, relationship_log, suppressed_sends. All six writing actions
(a.record, a.stop, a.entitlement-loss, a.wind-down, a.preserve, a.terminal) correctly key on
`relationship_id + <action>`. No idempotency gap.

SOURCE OF TRUTH: c.obligations and c.complete both check concrete, currently-live obligations
and in-progress wind-down work — no assumption that ending the relationship record itself
implies anything about what it created is resolved.

CONFIG-TIME: `w.winddown.timeout` — key `continuing_relationship.winddown`, class
`observation-window`, relativeTo `trigger`, required: true. Correctly bound, forcing escalation
rather than letting a stuck wind-down sit ambiguous between active and former.

OWNERSHIP: a.entitlement-loss explicitly defers to the entitlement lifecycle rather than
switching anything off locally ("a relationship record deciding it locally will eventually
disagree with the entitlement lifecycle about who can do what") — the same disciplined boundary
as SUB-169, applied one step further along the lifecycle.

CONFLICT-PREEMPTION: none declared, none obviously needed — relationship_id is the natural
exclusivity boundary, and this journey's own scope (s.g1/s.g2/s.g3) is drawn tightly enough that
it does not compete with account closure, data deletion, or structural-link removal.

HANDOFF: h.escalate→OWN-55 omits a contract block (P2).

RE-ENTRY-TERMINALITY: the sole exit, x.former, is not terminal; reEntry correctly frames a new
subscription as a new relationship, never a resumption, while everything the ended one
legitimately created remains owed until its own lifecycle resolves it (s.g4, s.g5).

OBSERVABILITY: relationship_log (append) plus suppressed_sends (append) together cover the end
reason, what stopped, and what was suppressed as a result — a complete pair for this journey's
scope.

OUTCOMES: resolution = x.former; diagnostic = h.escalate (wind-down outliving its window). No
outcome erases historical entitlements, payments, or fulfilled obligations (s.g4 enforced
structurally via a.preserve, not just stated).

TEST CASES:
- entry: relationship ends, no outstanding obligations, wind-down already complete → a.record →
  a.stop → a.entitlement-loss → a.wind-down → c.obligations → c.complete → a.terminal →
  x.former.
- entry (obligations live): an open order or unresolved refund exists at the end → a.preserve,
  reconciled on its own lifecycle rather than force-closed.
- timeout: relationship-scoped wind-down (deprovisioning, final billing) still running past its
  window → h.escalate.
- correction: an obligation created during the active term is asserted as still owed regardless
  of the relationship having ended (tests s.g5 directly).

GAPS:
- P2 (handoff): h.escalate→OWN-55 omits a contract block.

---

## TIM-62 — Overdue State Recalculation

READINESS: READY_WITH_MAPPING

WHY: Clean idempotency, and the batch's clearest restatement of this round's own central
theme — "not every overdue item requires customer communication. Most overdue work is an
internal problem" (s.g2) — with a graph that structurally enforces it: an overdue item with no
defined consequence is tracked, not acted on, and inventing one "is the failure this branch
prevents."

INSTANCE: `[obligation_id]`, one-active-per-key. The note distinguishes the obligation's due
state from the person waiting on it — overdue work does not automatically mean overdue
communication, a distinction the graph then enforces via c.consequence rather than assuming it.

STATE AUTHORITY: `authoritative-system` (t.due, evidence.source: authoritative) —
`insufficientAlone` correctly excludes a report merely showing an item as old with no deadline
behind it.

ENTRY-TRANSITIONS: `enter` (t.due) → `progress` (a.reread → c.satisfied) → `supersede`
(a.suppress → x.stale) or `progress` (c.owner → a.priority → c.consequence) → `handoff`
(h.orphan, h.escalate, h.consequence) or `resolve` (x.tracked).

DATA: obligation_id, suppressed_sends, deadline_log. a.suppress and a.priority both correctly
key on `obligation_id + <action>`. a.reread has neither a key nor writes, appropriately — pure
re-read before acting on a fired timer.

SOURCE OF TRUTH: a.reread explicitly reads current authoritative state "rather than trusting
the state it held when the timer was set" — the fifth instance in this batch of the
revalidate-from-now family (after SCH-177, SUB-162, SUB-168, SUB-169), now spanning three
domains (scheduling, subscription, time) with the same underlying principle each time.

CONFIG-TIME: no wait nodes; this journey fires from an already-triggered due-state timer and
resolves synchronously.

OWNERSHIP: owns recalculating operational priority and routing consequence; explicitly does not
own deciding what the consequence is (that's policy-defined) or whether communication follows
(s.g1, s.g2 — both enforced by c.consequence rather than assumed).

CONFLICT-PREEMPTION: none declared, none obviously needed — obligation_id is the natural
exclusivity boundary.

HANDOFF: h.consequence→external:overdue-consequence carries a full contract ([obligation_id,
handed_at, reason]) — no gap. h.orphan→OWN-51 and h.escalate→OWN-55 both omit contract blocks
(P2, consistent pattern).

RE-ENTRY-TERMINALITY: neither exit is terminal. x.tracked's reEntry states resolution closes it
and a further due threshold reopens it — a clean resolve/reopen cycle with no special-casing.

OBSERVABILITY: deadline_log (append-only, per s.g3 — "due-state changes append to the deadline
history rather than overwriting the original deadline") plus suppressed_sends together give a
complete picture of what changed and what was suppressed.

OUTCOMES: resolution = x.tracked (no consequence, correctly not treated as a failure);
diagnostic = h.orphan, h.escalate, h.consequence. No outcome treats "overdue with no
consequence" as incomplete — it is a first-class, correctly modeled resting state.

TEST CASES:
- entry: an obligation crosses OVERDUE with an active owner and a defined consequence →
  a.priority → h.escalate or h.consequence.
- correction (stale timer): the obligation was satisfied between the timer being set and firing
  → a.suppress → x.stale, nothing recalculated for something that no longer needs it.
- entry (no consequence): overdue with no policy-defined consequence → x.tracked, no
  communication invented and no consequence fabricated (tests s.g1/s.g2 directly).
- entry (unowned): overdue with nobody responsible → h.orphan, original deadline carried
  forward unreset.

GAPS:
- P2 (handoff): h.orphan and h.escalate omit contract blocks (h.consequence is the clean
  example in this state).

---

## TIM-65 — Grace Period Management

READINESS: NEEDS_CONTRACT_WORK

WHY: The fixed-at-entry grace end (never extended by activity, engagement or partial recovery)
is one of the strongest anti-inference rules in the corpus. Both writing actions, a.record and
a.restore, declare no idempotencyKey at all — the total-absence variant of the gap, not a
wrong-field one.

INSTANCE: `[entity_id, grace_period_id]`, one-active-per-key. Grace is explicitly modeled as a
state on the entity with its own capability set, distinct from active — the note is direct that
anything reading the entity must be able to tell the two apart, which is why capabilities are
recorded rather than assumed.

STATE AUTHORITY: `authoritative-system` (t.grace, evidence.source: authoritative) —
`insufficientAlone` explicitly excludes "an informal tolerance nobody wrote down, which is not
grace but inconsistency" — grace only exists where a policy actually defines it (s.no-policy).

ENTRY-TRANSITIONS: `enter` (t.grace) → `progress` (a.record → w.grace) → `resolve` (c.eligibility
→ a.restore → x.recovered) or `handoff` (c.eligibility → h.revalidate) or `expire` (w.grace
timeout → c.terminate → h.expire / h.terminate).

DATA: entity_id, grace_period_id, person_id, recovery_condition, grace_end, grace_policy_id
(required); restricted_capabilities (optional). Neither a.record nor a.restore declares an
idempotencyKey.

SOURCE OF TRUTH: w.grace waits on the single named event `recovery_condition_satisfied`; the
recheck at grace end explicitly re-reads "the recovery condition and the entity's eligibility...
from authoritative state" rather than trusting engagement during the window.

CONFIG-TIME: `w.grace.timeout` — key `time.grace_end`, class `attribute-bound`, relativeTo
`attribute`/`grace_end`, with an explicit `default` (confidence: high, basis: attribute-bound)
and `required: false` — a legitimate default pattern, no gap. s.no-extension is the strongest
anti-drift statement in this batch: "a grace period that quietly lengthens is an active state
nobody approved."

OWNERSHIP: owns the grace window and its named capability set; transfers at h.revalidate
(recovery arrived but eligibility may have moved — correctly routed to ACQ-06, this round's own
clean example of eligibility recalculation) and at h.expire/h.terminate on unresolved grace.

CONFLICT-PREEMPTION: none declared, none obviously needed — the composite instance key already
scopes exclusivity to one entity's one grace episode.

HANDOFF: h.terminate→external:termination-lifecycle carries a full contract ([entity_id,
grace_period_id, person_id, grace_end, unrecovered_condition]) — no gap. h.revalidate→ACQ-06 and
h.expire→TIM-64 both omit contract blocks (P2, consistent pattern).

RE-ENTRY-TERMINALITY: the sole exit, x.recovered, is not terminal; reEntry explicitly frames a
further lapse as re-entering grace, with the frequency itself "worth reading" — genuine
observability intent behind allowing repeat entry rather than treating a second lapse as
exceptional.

OBSERVABILITY: carries a fuller measurement block — a declared `businessOutcome`
(recovery_condition_satisfied) and two named guardrails (grace_extended_after_entry,
service_continued_past_grace_end) that map directly onto s.no-extension, though neither can
currently be mechanically checked given the missing idempotency keys above.

OUTCOMES: resolution = x.recovered; diagnostic = h.revalidate; failure = h.expire, h.terminate.
No outcome extends the recorded grace end for any reason (s.no-extension enforced
structurally, not just stated).

TEST CASES:
- entry: primary validity ends with a defined grace policy → a.record (capabilities named
  explicitly) → w.grace.
- correction: recovery condition satisfied within the window, but eligibility has since moved →
  h.revalidate, not a blind restore.
- entry: recovery condition satisfied and eligibility unchanged → a.restore → x.recovered.
- timeout: w.grace reaches its fixed grace_end regardless of intervening activity → c.terminate
  → h.expire or h.terminate (tests s.no-extension directly).
- re-entry: a further lapse on the same entity opens a new grace episode, its own instance.

GAPS:
- P0 (idempotency): neither a.record nor a.restore declares an idempotencyKey, despite both
  writing to grace_log — a retry at either step risks a duplicate log entry.
- P2 (handoff): h.revalidate and h.expire both omit contract blocks.

---

## TRM-105 — Responsibility Handover

READINESS: NEEDS_CONTRACT_WORK

WHY: The effective-time-is-load-bearing discipline (a future handover is not an immediate
authority change, and both actors are revalidated at the effective time rather than at
authorization) is exemplary. All six actions key on `person_id` — undeclared, and referencing
neither of the two actual actors (outgoing_actor, incoming_actor) nor either half of the
journey's own composite instance key.

INSTANCE: `[role_id, handover_id]`, one-active-per-key. The note states the effective time is
"load-bearing" — authorizing a handover today does not move authority today, a principle the
graph then enforces structurally via w.effective rather than leaving it as a documentation
claim.

STATE AUTHORITY: `authoritative-system` (t.handover, evidence.source: authoritative) —
`insufficientAlone` correctly excludes a role change with no named incoming actor, a handover
merely discussed but not authorized, and an actor leaving with no handover recorded (orphan
handling's domain, likely REL-100 for the underlying entity).

ENTRY-TRANSITIONS: `enter` (t.handover) → `progress` (a.define → a.inventory → c.eligible) →
`handoff` (c.eligible → h.hold) or `progress` (a.prepare → w.effective) → `expire` (timeout →
a.revalidate → c.still-valid) → `resolve` (a.activate → a.invalidate → x.handed-over) or
`handoff` (c.still-valid → h.escalate) or `supersede` (w.effective onEvent →
handover_cancelled/superseded → x.cancelled).

DATA: role_id, handover_id, outgoing_actor, incoming_actor, effective_at,
inherited_deadlines, handover_log. `person_id` is not declared anywhere.

SOURCE OF TRUTH: a.revalidate explicitly re-checks both actors and the target entity at the
effective time — "weeks can pass between authorising a handover and it taking effect, and
either actor may have left, changed role or lost the authority the handover assumed" — the
seventh instance in this audit of the revalidate-from-now family, now spanning scheduling,
subscription, time, and terminal domains.

CONFIG-TIME: `w.effective.timeout` — key `responsibility_handover.effective`, class
`attribute-bound`, relativeTo `attribute`/`effective_at`, required: true. Correctly bound,
framed as the ordinary path rather than a failure.

OWNERSHIP: transfers cleanly at a.activate, with inherited deadlines and obligations preserved
exactly (s.g3) — "the handover changes who is answerable, never what is owed or by when."
a.invalidate then narrowly invalidates only the outgoing actor's *future* scheduled actions,
explicitly leaving their historical decisions untouched (s.g2).

CONFLICT-PREEMPTION: none declared, none obviously needed — role_id + handover_id together
scope exclusivity, and a competing handover against the same role would be a separate
authorization decision outside this journey's own scope.

HANDOFF: h.hold→OWN-55 (ineligible incoming actor) and h.escalate→OWN-55 (assumptions didn't
survive to effective time) both omit contract blocks (P2, consistent pattern).

RE-ENTRY-TERMINALITY: neither exit is terminal. x.cancelled's reEntry makes the strongest
statement in this batch of "nothing to undo": "the outgoing actor retained the role throughout...
which is the point of not moving authority at the moment of authorisation."

OBSERVABILITY: handover_log (append) covers all six actions; suppressed_sends (append) records
what future actions were invalidated at handover.

OUTCOMES: resolution = x.handed-over; diagnostic = h.hold, h.escalate; neutral = x.cancelled. No
outcome moves authority before the effective time (s.g1 enforced structurally via w.effective,
not just stated).

TEST CASES:
- entry: incoming actor eligible, target still valid at effective time → a.activate →
  a.invalidate → x.handed-over.
- insufficient-evidence: incoming actor not eligible or not authorized for the role's scope →
  h.hold, open work stays with the outgoing actor.
- supersession: the handover is cancelled or superseded before its effective time →
  x.cancelled, nothing to undo since authority never moved.
- correction (revalidation): an actor left or lost authority between authorization and the
  effective time → h.escalate, open work still running against its original deadlines.
- correction (historical): a decision the outgoing actor made before handover is later
  questioned — asserted as a historical fact, untouched by the handover (tests s.g2).

GAPS:
- P0 (idempotency): a.define, a.inventory, a.prepare, a.revalidate, a.activate, a.invalidate all
  key on `person_id + <action>`; `person_id` is undeclared and references neither actor nor
  either half of this journey's own composite instance key (`role_id`, `handover_id`).
- P2 (handoff): h.hold and h.escalate both omit contract blocks.

---

## TRM-107 — Account Closure Reconciliation

READINESS: NEEDS_CONTRACT_WORK

WHY: The most disciplined "our record ending does not end anyone else's" state in the corpus —
verified, not assumed, termination of every external dependency, with failures surfaced rather
than hidden behind a CLOSED label. All six actions key on `account_id` alone, dropping
`closure_id`, the other half of this journey's own composite instance key.

INSTANCE: `[account_id, closure_id]`, one-active-per-key. Each dependency is its own
relationship with its own end state — "none of them ends because our account record changed" is
the entire premise of the journey.

STATE AUTHORITY: `authoritative-system` (t.closing, evidence.source: authoritative) —
`insufficientAlone` correctly excludes a closure merely requested but not yet applied, and a
subscription cancellation (a different, commercial-relationship ending, not the account's own).

ENTRY-TRANSITIONS: `enter` (t.closing) → `progress` (a.inventory → c.coupled) → `progress`
(a.verify-termination or a.separate → w.outcomes → c.all) → `resolve` (a.record-final →
x.finalized) or `progress` (a.record-unresolved → h.escalate) or `expire` (w.outcomes timeout →
c.policy → a.record-remaining → x.finalized, or → h.escalate).

DATA: account_id, closure_id, external_dependencies, coupling_evidence, dependency_outcomes,
closure_policy, closure_log. All six actions key on `account_id + <action>` only; `closure_id`
is dropped from every one.

SOURCE OF TRUTH: a.verify-termination is the corpus's clearest statement of not trusting a
third party's own report: "a provider reporting success is a statement about their API, and a
coupling written into a contract is not the same as a coupling implemented in a system" (s.g2).

CONFIG-TIME: `w.outcomes.timeout` — key `closure_external.outcomes`, class
`observation-window`, relativeTo `trigger`, required: true. Correctly bound.

OWNERSHIP: owns reconciling and recording each dependency's outcome independently; explicitly
does not own terminating any of them locally — each is "raised as such" (a.separate) rather
than assumed handled.

CONFLICT-PREEMPTION: none declared as a structured rule, but the eligibility gate ("no instance
of this journey is already open for the closing account plus each external or commercial
dependency") only prevents a second closure_id from opening concurrently with an open one —
which is exactly why closure_id's absence from the idempotency keys matters: a later, genuinely
different closure on the same account (after a prior closure fully resolved) could see its
actions' keys collide with the prior closure's own log entries under a naive retry/dedup
implementation.

HANDOFF: h.escalate→OWN-55 omits a contract block (P2).

RE-ENTRY-TERMINALITY: the sole exit, x.finalized, is not terminal; reEntry correctly allows a
dependency discovered later to be reconciled on its own, against the now-closed account's
record.

OBSERVABILITY: closure_log (append) covers every action, and s.g4 ("each dependency's final
state recorded independently of the account's") is backed directly by a.record-final's own
description, not just declared.

OUTCOMES: resolution = x.finalized (with or without dependencies still visibly remaining);
diagnostic = h.escalate (a dependency that cannot be left outstanding). No outcome hides an
unterminated dependency behind a closed account (s.g3 enforced structurally via
a.record-unresolved).

TEST CASES:
- entry: no dependency is authoritatively coupled to the account → a.separate for each, raised
  independently → w.outcomes → a.record-final → x.finalized.
- correction: a contract states a dependency is coupled, but the provider's system was never
  actually updated → a.verify-termination catches the discrepancy (tests s.g2 directly).
- entry (unresolved): at least one dependency fails to terminate → a.record-unresolved,
  named visibly → h.escalate, not hidden.
- timeout (policy-permitted): w.outcomes closes with a dependency still outstanding but policy
  allows closing anyway → a.record-remaining → x.finalized, dependency stays visible and
  attributable.
- concurrent-instance (currently unverifiable as specified): a second, later closure_id on the
  same account_id after the first fully resolved — verify its actions are not deduplicated
  against the first closure's log entries given the missing closure_id in the key.

GAPS:
- P0 (idempotency): a.inventory, a.verify-termination, a.separate, a.record-final,
  a.record-unresolved, a.record-remaining all key on `account_id + <action>` alone;
  `closure_id` — the other half of this journey's own declared composite instance key — is
  dropped from every one.
- P2 (handoff): h.escalate omits a contract block.

---

## TRM-108 — Account Closure Wind-Down

READINESS: NEEDS_CONTRACT_WORK

WHY: The strongest anti-reactivation statement in the entire corpus — a closed account is
explicitly never reopened by a stale login, a queued onboarding event, or any other behavioral
signal, only by an authoritative event on its own separate lifecycle. All three actions key on
`obligation_id`, a field this journey never declares and whose per-obligation granularity does
not match this account-level instance to begin with.

INSTANCE: `[account_id]`, one-active-per-key. The note is explicit that the wind-down capability
is "enumerated rather than left as a general exception, so a closed account cannot quietly keep
behaving like an open one."

STATE AUTHORITY: `authoritative-system` (t.closed, evidence.source: authoritative) —
`insufficientAlone` correctly excludes a closure merely requested/executing/unverified, and a
suspension (which is designed to be reversed, unlike this terminal state).

ENTRY-TRANSITIONS: `enter` (t.closed) → `progress` (a.suppress → a.guard → c.remaining) →
`resolve` (a.scope → w.winddown → x.former, directly if nothing outstanding) or `expire`
(w.winddown timeout → h.escalate).

DATA: account_id, outstanding_obligations, wind_down_capabilities, wind_down_horizon,
closure_log. `obligation_id` is not declared — the journey tracks a plural collection
(outstanding_obligations), not a singular per-obligation identity, and it fires once per
account-level closure, not once per obligation.

SOURCE OF TRUTH: a.guard is the round's clearest statement of a state authority discipline
applied to terminality itself: "a stale login, a queued onboarding step or a delayed
synchronisation must not bring a closed account back — closure is a state that later events are
checked against, never one they can silently overwrite" (s.g1). This is the behavioral-signal
guardrail from this round's own required data model, applied directly to a terminal exit
condition.

CONFIG-TIME: `w.winddown.timeout` — key `closure_wind.winddown`, class `observation-window`,
relativeTo `trigger`, required: true. Correctly bound.

OWNERSHIP: owns suppressing normal activity and guarding against reactivation; the wind-down
capability itself is explicitly enumerated (s.g2 — "a wind-down left as a general exception is
an open account with a different label on it") rather than treated as a blanket allowance.

CONFLICT-PREEMPTION: none declared, none obviously needed — account_id alone is the natural
exclusivity boundary for a single account's closure.

HANDOFF: h.escalate→OWN-55 omits a contract block (P2).

RE-ENTRY-TERMINALITY: the sole exit, x.former, is not terminal in the graph's own class field,
but its reEntry is the strongest actual terminality statement in the round: a returning customer
"opens a new relationship rather than reviving this one," and the historical record's survival
is explicitly separated from any question of reactivation — "deleting them is a separate
lifecycle with its own request, its own scope and its own authority" (s.g3).

OBSERVABILITY: closure_log (append) plus suppressed_sends (append) together cover suppression,
the reactivation guard, and the scoped wind-down capability.

OUTCOMES: resolution = x.former; diagnostic = h.escalate (wind-down outliving its horizon). No
outcome allows any behavioral event to reopen the account (s.g1 enforced structurally by
a.guard, not merely documented).

TEST CASES:
- entry: closure verified, nothing outstanding → a.suppress → a.guard → x.former directly.
- entry (obligations remain): a final invoice or open support case is outstanding → a.scope
  (enumerated capabilities only) → w.winddown.
- correction (reactivation attempt): a stale login or queued onboarding event arrives after
  closure → a.guard rejects it; the account stays closed (tests s.g1 directly, this round's
  core behavioral-inference guardrail applied to a terminal state).
- timeout: w.winddown outlives its horizon with obligations still open → h.escalate.
- re-entry: a former customer returns later → treated as an entirely new relationship, never a
  reactivation of this account (tests s.g3).

GAPS:
- P0 (idempotency): a.suppress, a.guard, a.scope all key on
  `obligation_id + account_id + <action>`; `obligation_id` is undeclared, and this journey's
  own granularity (one instance per account-level closure, not per obligation) makes an
  obligation-scoped key a structural mismatch rather than just a missing field.
- P2 (handoff): h.escalate omits a contract block.

---

