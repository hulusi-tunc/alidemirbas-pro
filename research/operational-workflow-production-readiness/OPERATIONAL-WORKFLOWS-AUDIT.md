# Operational Workflows — production readiness audit

Scope: journey/state/mechanism layers agree a company must actually perform some work. This round
asks the fourth and final question in the production-readiness program: when a journey hands work
to an operational process, who inside a real company owns it now, how does it get done safely, and
how does its result reliably reach back to the lifecycle system that depended on it? **This round
is audit only.** Nothing in `src/`, `production/`, `scripts/`, `seo/`, or `search/` is touched.

## Corpus confirmation — 124, derived from current source

The operational surface is everything `src/canonical/surface.ts`'s `surfaceOf()` returns
`"operational"` for: not in `MECHANISM_IDS` (25), not sending a message channel, and not a
customer-category journey with a customer-worded entity (the silent-lifecycle-state rule). Applying
that rule directly against the current 284-journey corpus (not a hardcoded list) yields exactly
**124**, across 17 domain categories: `ownership` (10), `integration` (10), `risk` (10), `data`
(10), `rollout` (10), `decision` (9), `incident` (9), `control` (8), `access` (7), `document` (7),
`time` (6), `terminal` (6), `financial` (6), `remedy` (6), `structure` (5), `identity` (3),
`subscription` (1), `scheduling` (1).

**Zero leakage, confirmed by direct computation, not assumption:** none of the 124 appear in the 68
message-sending or 3 human-routing Customer Journey lists (`ACQ-04`, `ACT-11`, `RET-24` — the three
human-routing-only journeys the round's brief specifically named — are all customer-category, not
operational, and none of the 124 collide with them); none in the 64 true Silent Lifecycle State
list (`surface === "customer" && sends === false && routesToHuman === false`); none in the 25
Runtime Mechanism list. `68 + 3 + 64 + 25 + 124 = 284`, exact, matching the corpus total the prior
round confirmed. **This round does not confuse `customer-silent` (the validator's own coarse
`sends === false` bucket, 67) with true Silent Lifecycle States (64, the refined count excluding
the 3 human-routing-only journeys)** — the prior round's own correction stands; the 124 operational
workflows are entirely disjoint from both readings of "silent."

## Method

124 workflows, batched by domain cluster into 8 independent audits (15–19 workflows each,
`ownership`+`structure`; `integration`+`subscription`+`scheduling`; `risk`+`identity`;
`data`+`time`; `rollout`+`terminal`; `decision`+`control`; `incident`+`access`;
`document`+`financial`+`remedy`), each reading every workflow's full structured source — trigger
evidence, every action's `does`/`writes`/`idempotencyKey`, every condition's `asks`/branches, every
wait's `until`/`timeout`/`recheck`, every handoff's `carries`/`contract`, every exit's `reEntry`,
`guardrails`, `reusableRule`, `distinctFrom`, and a corpus-wide consumer scan (every other journey
in the full 284-journey corpus whose own text references it) — against one shared methodology
covering all 19 contract areas the round's brief names: work identity, ownership, assignment/queue,
human claim/concurrency, required data, evidence, decision authority, approval, idempotency,
SLA/deadline, escalation, cancellation/supersession, freshness before decision, human-vs-automation
ownership, completion (technical vs. business), result/feedback, handoff provenance,
correction/reopen, and terminality vs. the underlying obligation. Full detail per workflow is
below; this document's own front matter is the aggregate.

## Executive summary

Zero canonical files were touched. 124 workflows audited, 124 contracts produced
(`operational-workflow-contracts.json`), one contract each, verified 1:1 against the corpus. The
operational layer is markedly less uniform than the three closed layers: it was authored earliest
and predates the `entity.instanceKey`/`ActionNode.idempotencyKey` structural conventions the
customer-facing and runtime rounds already formalized — every workflow's idempotency/ownership/
authority claim here is prose, not a declared field, which this round records honestly as a
corpus-wide pattern (see below) rather than 124 duplicate findings. Despite that, the underlying
design quality is genuinely strong in most domains: `OPS-130`'s technical-vs-business-completion
discipline, freshness-before-execution, and honest "policy not invented" restraint recur throughout
as house rules the original authors already followed without a validator to enforce them. The real
production risk concentrates in a specific, nameable set of places, not diffusely across all 124.

## Readiness distribution

| Verdict | Count | % |
|---|---|---|
| READY | 0 | 0% |
| READY_WITH_MAPPING | 88 | 71% |
| NEEDS_CONTRACT_WORK | 33 | 27% |
| NEEDS_CANONICAL_CHANGE | 3 | 2% |

Zero `READY` verdicts is itself an honest finding, not an omission: `READY` requires only trivial
system wiring beyond the canonical semantics, and every one of the 124 — even the best-designed —
needs a company to supply at least a queue/team mapping, an SLA value, or a named decision
authority the canonical source correctly leaves as policy. That is exactly what
`READY_WITH_MAPPING` is for, and 88 of 124 (71%) reach it cleanly.

## P0 / P1 / P2 totals

| Priority | Count |
|---|---|
| P0 | 11 |
| P1 | 75 |
| P2 | 100 |
| **Total findings** | **186** |

(From `operational-workflow-contracts.json`'s own `gaps` arrays — matches `READINESS-MATRIX.md`'s
totals line, generated by the same script.) 11 P0s across 124 workflows (population-wide P0 rate
~9%) is a materially higher concentration than the Runtime Mechanism round's own 1-in-25 — expected,
since this layer's whole subject is exactly the risks the brief's own P0 examples name (no owner,
contradictory concurrent decisions, duplicate financial/manual effects, closure without completion
proof, undefined approval authority, unconstructible handoffs, stale-work execution after
supersession, escalation dropping ownership) and none of those risks has a Runtime Mechanism
equivalent to have already absorbed them.

## Top 20 findings

1. **`DEC-181` (Decision Request), the corpus's single general escalation sink, has an entry-
   contract mismatch for its own load-bearing role.** Roughly 30+ real senders hand off into it —
   Runtime Mechanisms (`OPS-131`'s own genuine-precedence-tie escalation), other Operational
   Workflows (`CTL-231`, `CTL-238`, `REL-95`–`99`, `DAT-222/223/226/228/229/230`, `RSK-191`–`200`,
   `DOC-212`–`220`, `INT-115`–`119`, `SUB-163`–`169`, `FIN-137`, `REM-152/154/159`, `TIM-67`, and
   others) — but its own intake schema (`a.capture`'s `requester` field, `c.valid`'s requester-
   standing check, `w.info`'s interactive wait for the requester to supply information or withdraw)
   is written entirely for a human/customer-submitted request. It has no distinguished path for a
   mechanism- or workflow-sourced referral with no requester to validate standing for and no
   interactive party to wait on. **P0, and a cross-layer finding**: this is the same `DEC-181` the
   closed Runtime Mechanism round already relies on as `OPS-131`'s own escalation target for
   genuine precedence ties, and as `CMS-203`/`CMS-210`'s undefined-policy escalation target — this
   round finds the receiving side of that dependency was never actually built for what its senders
   carry.
2. **Two genuine concurrent-duplicate-effect P0s**, both confirmed against raw source:
   `RSK-192` (Risk Case Creation)'s `a.case` has no idempotency/create-if-absent guard despite its
   own entity note requiring one case per correlated risk; `RSK-198` (Policy Exception Consumption)
   has a check-then-act single-use-exception race with no declared atomicity — two concurrent
   invocations could both pass validity and both apply the override before either is marked
   consumed.
3. **`SUB-164` (Renewal Execution)** has no `idempotencyKey`/`attemptBudget` on the actions that
   raise the financial obligation or create the new subscription term — a duplicate
   `renewal_authorized_for_execution` event has nothing stopping a second financial obligation or a
   second term from being created for one renewal cycle.
4. **`OWN-56` (Approval Request) never addresses self-approval**, even though its own stated
   purpose is "keep approving separate from doing" — nothing in the graph stops a requester from
   approving their own request, directly contradicting the workflow's own text.
5. **Three genuine canonical-graph defects, not contract gaps** — the round's own
   `NEEDS_CANONICAL_CHANGE` verdicts, none manufactured to pad findings: `INC-258` (Incident
   Closure Reconciliation) is structurally reachable via its investigate-first path with zero
   mitigations ever applied, a state neither of its two closure branches can resolve; `CTL-232`
   (Ownership Transfer Validation) has one of its two real paths into `CTL-234` (ownership cutover)
   skip the revalidation `CTL-234`'s own declared trigger evidence requires — stale work can
   execute after being superseded; `DAT-228` (Cutover Stabilization) preserves rollback-window data
   "so nothing is lost" that no handoff or workflow anywhere actually consumes, unlike its sibling
   forward-correction path which explicitly hands off to `DAT-230`.
6. **Undefined decision authority for irreversible choices recurs across domains**: `RLT-247`
   (Rollback Decision) names no authority for a choice its own text calls irreversible-if-wrong;
   `TRM-101` (Entity Merge) names no authority for authorizing a merge at all, let alone the
   elevated bar it itself requires for irreversible identity consolidation; a related "generic
   authority" gap (says "authorized by" without ever naming who) recurs across the `TRM-10x`
   cluster generally.
7. **`REM-154` (Physical Return Inspection) is the one workflow in the round requiring a human to
   physically act on an item with zero queue/assignment/claim semantics defined anywhere** — an
   ownership gap, not a mapping exercise, unlike every other workflow in its own domain cluster.
8. **A systemic, corpus-wide idempotency pattern, not 40 independent findings**: idempotency is the
   single largest gap area (40 of 186 findings) and the dominant reason is structural, not
   per-workflow carelessness — none of the 124 use `entity.instanceKey`/`ActionNode.idempotencyKey`
   /`attemptBudget` (the conventions the customer-facing and Runtime Mechanism rounds already
   formalized); every duplicate-prevention claim here is prose (dedupe checks, "one case per X"
   guardrails) rather than a declared field. Most instances are honest P2 documentation notes
   ("predates the convention"); the P0/P1-severity instances (`RSK-192`, `RSK-198`, `SUB-164`, and
   a further ~15 P1s) are the ones where the prose guard is itself absent or incomplete, not merely
   undeclared.
9. **Ownership ambiguity is the round's second-largest gap area (23 findings)**, concentrated in
   escalation-loop workflows that hand a case directly into a downstream review trigger with no
   explicit accept/claim step (`DEC-189`, `DEC-190` both skip it reaching into `DEC-183`; `CTL-231`
   skips revalidation between acceptance and final assignment) — contrasted against `DEC-182`'s and
   `CTL-232`'s own carefully separated assigned-vs-accepted models for the analogous problem,
   which are this round's reference implementations for the pattern.
10. **A genuine cross-journey handoff mismatch**: `RLT-250` (a completed rollout's late-regression
    handler) routes into `RLT-246` (Rollout Pause), but `RLT-246`'s own actions (freeze cohort
    expansion, resume via `RLT-245`) assume an in-progress rollout with cohorts left to work
    through — semantics that don't fit a rollout `RLT-250` itself describes as already complete.
    Flagged as a paired finding on both journeys, not a single-sided defect.
11. **7 boundary-classification candidates**, all low/medium confidence, none reclassified this
    round: `REL-95`, `REL-96`, `RSK-198`, `IDN-86`, `ACC-75` read as deterministic, human-free
    state machines that may actually be Runtime Mechanism shaped; `ACC-76` reads as a status
    representation (Silent Lifecycle State shaped) rather than work to be done. See
    `BOUNDARY-CLASSIFICATION-AUDIT.md`.
12. **2 orphan-candidates, 4 unconsumed-but-valid, 35 event-driven, 83 active** in consumer
    coverage — a healthier ratio than raw zero-consumer counts alone would suggest, once each
    zero-handoff-consumer case is actually investigated per the round's own "zero consumers does
    not automatically mean orphaned" instruction. `REL-99` (Entity Split) and `INT-120` (Dependency
    Degradation Recovery) are the two genuine orphan-candidates — both well-designed workflows with
    no traceable real trigger anywhere in the current 284-journey corpus.
13. **`FIN-135`'s handoff into `OPS-125` (Runtime Mechanism, Work Deduplication) reads correctly** —
    `logical_operation_key` is present in both `carries` and `contract.requiredFields`, confirming
    the prior round's own repair of this exact boundary is intact. A positive cross-layer
    confirmation, not a new finding.
14. **`ACC-74` receives a real inbound handoff from `ACC-78`**, the Customer Journey half of the
    `account-restriction-authority` competition group `OPS-131` arbitrates — the one place this
    round found the closed Runtime Mechanism and Customer Journey layers touching the operational
    one directly. No defect found in the handoff itself; noted as the one concrete instance of
    "does an Operational Workflow taking ownership interact with `OPS-131` competition ownership,"
    worth a company's own attention when it builds the adoption wiring the Runtime Mechanism round
    already flagged as `OPS-131`'s own open P2.
15. **`REL-95`/`REL-96` (parent-state propagation/aggregation) are fully deterministic, human-free
    mechanisms where virtually every ownership/assignment/evidence/approval dimension is N/A by
    nature, not by gap** — read together with finding 11, these are the round's clearest boundary-
    candidate evidence, not merely well-mapped operational workflows.
16. **`DOC-213`/`DOC-217` both require "authority to issue/change established" in their own trigger
    evidence, but nothing in the document domain cluster — including `DOC-212`'s own handoff into
    `DOC-213` — actually supplies or names that authorization**, an entry-contract gap at the
    issuance boundary rated `NEEDS_CONTRACT_WORK` for both.
17. **`TIM-70`'s and several other workflows' completion sections directly cite `OPS-130`'s own
    technical-vs-business-completion principle by name** — the strongest, most consistently-applied
    reference pattern this round found, on par with the Runtime Mechanism round's own `CMS-207`
    idempotent-consumer citation pattern.
18. **`TRM-110`'s completion statement for partial deletion failure ("never represented as
    complete... the most consequential false report in this library") is arguably the strongest
    single completion-discipline statement in the entire three-round-plus-this-one program.**
19. **The financial domain (`FIN-132`–`140`) is the round's strongest cluster**: idempotency-first
    design (key persisted before submission), `UNKNOWN` treated as a first-class non-failure state
    that suppresses replacement payments/refunds, and freshness-before-decision correctly applied
    (a late success reconciled against current balance, never the stale snapshot) — zero P0s, zero
    P1s in the entire 6-workflow cluster.
20. **A second recurring, corpus-wide "other"-tagged pattern, distinct from finding 8**: a Config/
    policy value is referenced by name in a workflow's own text but its actual source/duration is
    left undeclared — correctly not invented, but flagged consistently across `OWN-51/57/58`,
    `INT-114/117`, `SCH-171`, and others as honest, low-risk mapping dependencies a company must
    resolve before implementation, not defects in the canonical source.

## Recurring patterns

- **Idempotency is prose-only corpus-wide (40 findings, the largest gap area)** — see finding 8.
  This is the round's single most consequential systemic finding, structurally identical in shape
  to the Runtime Mechanism round's own pre-repair idempotency finding, but here spanning 124
  workflows that predate the schema convention entirely rather than 8 of 24 that named the concept
  without declaring it.
- **Ownership ambiguity clusters in escalation/reopen chains**, not in first-pass entry — see
  finding 9. The pattern is narrow and nameable, not diffuse: workflows that skip an explicit
  accept/claim step when handing a case into a downstream review trigger.
- **Undefined decision authority for irreversible actions** — see finding 6. Recurs specifically
  where a workflow's own text already calls the action irreversible or elevated-risk, meaning the
  authors already knew the bar was high; they simply left "authorized by" unnamed.
- **"Predates the `entity.instanceKey` convention" is the single most common P2**, honestly
  distinguished throughout from a genuine idempotency defect — the round did not let corpus-age
  explain away the 11 P0s and dozens of P1s where the underlying duplicate-prevention guard is
  itself missing or incomplete, not merely undeclared as a structured field.
- **Config/policy values referenced but undeclared, correctly never invented** — see finding 20.
  The house rule against inventing SLA/retry/approval-count values held throughout all 124; where a
  workflow needed one it does not have, every batch reported an honest gap rather than a fabricated
  default.

## Domain-cluster quality

| Domain | Workflows | READY_WITH_MAPPING | NEEDS_CONTRACT_WORK | NEEDS_CANONICAL_CHANGE | P0 | P1 |
|---|---|---|---|---|---|---|
| financial | 6 | 6 | 0 | 0 | 0 | 0 |
| access | 7 | 7 | 0 | 0 | 0 | 1 |
| integration | 10 | 10 | 0 | 0 | 0 | 4 |
| time | 6 | 6 | 0 | 0 | 0 | 1 |
| ownership | 10 | 9 | 1 | 0 | 1 | 7 |
| structure | 5 | 4 | 1 | 0 | 0 | 3 |
| risk | 10 | 7 | 3 | 0 | 2 | 7 |
| identity | 3 | 2 | 1 | 0 | 0 | 3 |
| data | 10 | 7 | 2 | 1 | 2 | 7 |
| remedy | 6 | 4 | 2 | 0 | 0 | 3 |
| document | 7 | 4 | 3 | 0 | 0 | 7 |
| decision | 9 | 5 | 4 | 0 | 1 | 6 |
| rollout | 10 | 5 | 5 | 0 | 1 | 8 |
| subscription | 1 | 1 | 0 | 0 | 1 | 0 |
| scheduling | 1 | 1 | 0 | 0 | 0 | 0 |
| control | 8 | 4 | 3 | 1 | 1 | 3 |
| terminal | 6 | 2 | 4 | 0 | 1 | 9 |
| incident | 9 | 4 | 4 | 1 | 1 | 6 |

`financial`, `access`, `integration`, and `time` are the round's cleanest domains (zero-or-near-zero
findings above P2). `terminal`, `rollout`, `decision`, `document`, and `incident` carry most of the
round's real work, concentrated in the specific findings named above rather than spread evenly.

## Cross-layer findings

- **`DEC-181` (Operational Workflow, this layer) — genuine entry-contract mismatch with `OPS-131`
  (Runtime Mechanism, closed layer) as one of its senders.** Reported here, not silently fixed and
  not modifying `OPS-131`, per the round's own instruction. `OPS-131`'s own escalation contract is
  unchanged and still correctly describes handing off to `DEC-181` for a genuine precedence tie —
  the defect is entirely on `DEC-181`'s own receiving side, which this round's layer owns.
- **`FIN-135` → `OPS-125` (Runtime Mechanism) confirmed intact.** Positive confirmation, not a new
  finding — the prior round's own repair holds.
- **`ACC-74` → `ACC-78`/`IDN-90`/`OPS-131` (`account-restriction-authority` competition group).**
  The one concrete instance this round found of an Operational Workflow interacting with `OPS-131`
  competition ownership; no defect in the handoff itself, but it is the live example a company
  should use when building `OPS-131`'s own already-disclosed adoption wiring.
- **Technical-vs-business completion (`OPS-130`, closed layer) is cited by name, correctly, across
  multiple operational workflows** (`TIM-70`, others) — the principle transferred cleanly across
  the boundary rather than needing re-derivation.
- **No defect was found requiring a change to any closed layer.** Every cross-layer touchpoint
  either confirmed a prior repair intact or identified the defect as belonging entirely to this
  round's own layer.

## All 124 workflows, individually

## ACC-72 — Entitlement Provisioning

READINESS: READY_WITH_MAPPING

WHY:
The core distinctions this workflow exists to hold are all made explicitly and correctly: grant ≠ provisioned, provisioning-success ≠ availability, and the retry budget is fixed at first failure rather than renewing indefinitely. A company mainly needs to map the provisioning system(s), the verification mechanism, and the SLA/budget values themselves (all correctly left undeclared rather than invented).

RESPONSIBILITY:
Turns a granted entitlement into a working capability: provisions the underlying resource, verifies actual reachability where that matters (not just API success), retries transient failures against a fixed budget, and escalates when provisioning cannot complete automatically.

INSTANCE:
Work instance is the entitlement plus the resource/capability being provisioned for it (entity.scope). entity.note states 'one provisioning run per entitlement, keyed idempotently,' but this predates the corpus's later instanceKey/concurrency convention (used elsewhere in this same file, e.g. ACC-71/78/79/261/263) — no entity.instanceKey or concurrency value is actually declared here, and the idempotent keying is asserted only in prose, not as a structured ActionNode.idempotencyKey.

ENTRY:
Trigger entitlement_granted, evidence.source authoritative, requiring a GRANTED entitlement with a scope implying a resource — precise.

OWNERSHIP:
Fully automated until failure: no action carries execution:'human'. Ownership only becomes a named human concern via h.escalate → OWN-55 once retries are exhausted or the failure is permanent — an appropriate automation-first design for a technical provisioning step, not an ambiguity.

ASSIGNMENT / QUEUE:
N/A while automated; OWN-55 is the escalation target on failure (not audited here — outside this batch).

DATA:
The entitlement's scope (implying the resource to provision) is the sole required input, with provenance being the authoritative GRANTED record itself.

EVIDENCE:
N/A — this is a provisioning/verification action, not an evidentiary review.

AUTHORITY / APPROVAL:
N/A — no approval gate; c.verify-needed and c.available are technical-state checks, not discretionary approvals.

IDEMPOTENCY:
Prose-only: 'keyed so that a redelivered event provisions once' (a.provision) and 'retries are bounded by a budget fixed at the first failure' (a.retry) are both guardrail-level statements without a corresponding structured entity.instanceKey/ActionNode.idempotencyKey/attemptBudget in this workflow's own nodes — a genuine, honest mapping gap (this workflow predates that structured convention) rather than a defect in the intent.

SLA / TIME:
w.provision's timeout is 'the provisioning SLA' (undeclared value, correctly not invented) with onTimeout explicitly routed through the same failure-classification logic as an active failure ('silence is not success') rather than assumed success.

ESCALATION:
h.escalate → OWN-55 fires only when retrying won't help or the budget is spent, carrying what's been attempted and the fact the customer holds a valid right they can't yet use — ownership and urgency are both explicit in the carried payload.

CANCELLATION / SUPERSESSION:
x.active's reEntry states a later scope change re-opens provisioning for the delta only, not the whole entitlement — correctly avoids re-provisioning what already works.

HANDOFFS:
- h.recovery → external:access-recovery: carries ["the entitlement, the provisioning result and what verification actually found","the fact that the grant is valid, so this is an access fault rather than an entitlement question"]
- h.escalate → OWN-55: carries ["the entitlement and what has been attempted","the fact that the customer holds a valid right they currently cannot use"]

COMPLETION:
ACTIVE explicitly requires the right to be 'granted, provisioned and usable' — a precise three-part completion contract that does not let provisioning-API-success alone stand in for the customer actually being able to use the thing.

RESULT / FEEDBACK:
ACC-71 is a real handoff consumer of this workflow's downstream state (per this workflow's own consumers[]).

CORRECTION / REOPEN:
N/A beyond the scope-change reEntry already noted — there's no separate 'wrong decision' to correct in a provisioning action.

OBSERVABILITY / AUDIT:
provisioning_log records each state transition (PROVISIONING, retry, verification, ACTIVE) — sufficient trail for a real operator to see what was attempted and why it escalated, if it did.

CONSUMER COVERAGE:
Classification: active. consumers[] lists ACC-71 with a real viaHandoff (h.provision) carrying the entitlement's scope and validity, plus the explicit fact nothing is provisioned yet.

TEST CASES:
- [duplicate-creation] Given: the entitlement_granted event is redelivered → Expect: provisioning is keyed so the redelivery provisions once, not twice — though the spec asserts this only in prose, without a structured idempotency key on this action
- [completion] Given: provisioning succeeds but the holder still can't reach the capability → Expect: the entitlement is not marked ACTIVE; it hands off to access-recovery instead

GAPS:
- P2 (idempotency): Idempotent provisioning and the fixed retry budget are asserted only in guardrail prose, not as a structured entity.instanceKey/ActionNode.idempotencyKey/attemptBudget — a mapping gap consistent with this workflow predating that convention, not a designed defect.

---

## ACC-73 — Entitlement Recalculation

READINESS: READY_WITH_MAPPING

WHY:
Delta-only application is the right design and is enforced structurally, not just in prose ('a capability present in both scopes is not touched at all'). The separation between 'stop future access' and 'cancel an existing obligation' as two different decisions made by two different journeys (this one and h.loss's receiver) is exactly the discipline this round rewards. The one real edge case (see gaps) is narrow rather than blocking.

RESPONSIBILITY:
On any authoritative change to an entitlement's basis, computes only the delta between old and new scope and applies it — expanding newly granted capabilities without touching what already works, and reducing future access only, routing to reconciliation when live commitments depend on what's being removed.

INSTANCE:
Work instance is the entitlement whose basis changed, keyed conceptually by the delta itself ('the delta is the unit of work,' entity.note) rather than by re-applying the full new scope. No instanceKey/concurrency formally declared.

ENTRY:
Trigger entitlement_basis_changed, evidence.source authoritative, covering plan/role/contract/benefit/quantity/coverage changes — broad but consistently 'authoritative,' not inferred.

OWNERSHIP:
Fully automated; no execution:'human' anywhere. Appropriate for a pure recalculation/application step with no discretionary judgment beyond the two condition checks, both of which are policy-derived rather than a human call.

ASSIGNMENT / QUEUE:
N/A — no queue routing in this workflow.

DATA:
Previous scope, new scope, and effective time are the three required inputs to derive the delta — clearly named and sufficient.

EVIDENCE:
N/A — not an evidentiary review; c.direction and c.commitments are deterministic checks against the entitlement's own before/after state and known commitments.

AUTHORITY / APPROVAL:
N/A — no approval gate; scope recalculation and delta application follow directly from the authoritative basis change already given.

IDEMPOTENCY:
Guardrail states 'the delta is applied idempotently, so a redelivered change does not reprovision or re-revoke,' again asserted only in prose (no instanceKey/idempotencyKey structurally present) — same honest, convention-predates-this-workflow gap as ACC-72.

SLA / TIME:
N/A — no wait/timeout nodes; this is a synchronous recalculation.

ESCALATION:
N/A as a distinct mechanic — h.loss → ACC-74 is a routing decision (live commitments block a clean reduction), not an escalation per se.

CANCELLATION / SUPERSESSION:
N/A directly — this workflow doesn't cancel anything itself; it explicitly separates 'stop future access' (its own job) from 'cancel an existing obligation' (deferred to ACC-74/commitment reconciliation).

HANDOFFS:
- h.loss → ACC-74: carries ["the capabilities being removed and their effective time","the commitments that depend on them, which are reconciled separately rather than cancelled by the scope change"]

COMPLETION:
x.applied's state description ('delta applied; unchanged capabilities untouched') is precise and matches the entity.note's stated purpose exactly — a clean, verifiable completion contract for what this workflow is actually responsible for.

RESULT / FEEDBACK:
REL-92, REL-94, SUB-164, and SUB-166 are all real handoff consumers per this workflow's own consumers[] — a wide, well-used downstream footprint across relationship and subscription domains.

CORRECTION / REOPEN:
x.applied's reEntry states a further basis change is compared against the new (already-applied) scope — correct incremental-delta semantics on repeated changes.

OBSERVABILITY / AUDIT:
entitlement_log records the comparison and the delta actually applied — adequate for reconstructing what changed and why.

CONSUMER COVERAGE:
Classification: active. consumers[] shows four real handoff consumers (REL-92, REL-94, SUB-164, SUB-166) all constructing their own entry from this workflow's h.entitlement carries.

TEST CASES:
- [handoff] Given: a scope reduction removes a capability with a live commitment resting on it → Expect: the reduction and the commitments are handed to ACC-74 together, with nothing cancelled by this workflow itself
- [duplicate-creation] Given: the same basis-change event is redelivered → Expect: the delta is applied idempotently and not reprovisioned/re-revoked a second time

GAPS:
- P1 (other): c.direction has only two branches — 'expanded only' (requires ≥1 addition) and 'reduced, or mixed' (requires ≥1 removal). A basis change whose recomputed delta is genuinely empty (nothing added, nothing removed — e.g. a purely administrative amendment) satisfies neither branch's condition, leaving that case's routing undefined.
- P2 (idempotency): Idempotent delta application is asserted only in guardrail prose, not as a structured instanceKey/idempotencyKey.

---

## ACC-74 — Entitlement Revocation

READINESS: READY_WITH_MAPPING

WHY:
The scoping discipline is precise (a lost role doesn't revoke rights held on a different basis) and the historical-record guardrail is explicit and repeated ('losing a right does not mean it was never held'). Effective-time determination (immediate vs. period-end vs. future date) is called out as consequential and handled as a distinct first step rather than assumed. This is a clean, mappable workflow with no structural defect.

RESPONSIBILITY:
When a right ends, determines the effective time, stops future use of the affected capabilities (scoped to this entitlement alone, idempotently), and routes surviving commitments to reconciliation and any provisioned resource to deprovisioning — while explicitly preserving the historical record that the right was once validly held.

INSTANCE:
Work instance is the entitlement that ended plus the resources/commitments that depended on it (entity.scope). Revocation 'stays scoped to this entitlement' — a real scoping discipline, though no instanceKey/concurrency is formally declared (predates the convention used two ids over in this same file, ACC-78/79).

ENTRY:
Trigger entitlement_no_longer_valid, evidence.source authoritative, covering plan downgrade, contract termination, role removal, benefit expiry, eligibility-linked revocation, or policy decision — broad and consistently authoritative.

OWNERSHIP:
Fully automated; no execution:'human'. Appropriate — this is a deterministic application of an already-authoritative ending, not a discretionary decision.

ASSIGNMENT / QUEUE:
N/A — no queue routing.

DATA:
The effective time of loss and the specific capabilities affected (scoped to this entitlement) are the required inputs, both explicitly computed rather than assumed.

EVIDENCE:
N/A — not an evidentiary review; this workflow applies an already-authoritative ending.

AUTHORITY / APPROVAL:
N/A — no approval gate; the ending itself was already authorized upstream (a plan downgrade, contract termination, etc.).

IDEMPOTENCY:
Guardrail: 'stopping future use is idempotent' — prose-only, no structured instanceKey/idempotencyKey on a.stop-future itself (same convention gap as ACC-72/73).

SLA / TIME:
N/A — no wait/timeout nodes; synchronous application.

ESCALATION:
N/A as a distinct mechanic — h.reconcile and h.deprovision are routing decisions based on state (commitments/provisioned resources present), not escalations.

CANCELLATION / SUPERSESSION:
Explicitly separated: 'existing commitments are reconciled separately and are never cancelled automatically by the loss' — this workflow stops future use only, and defers the cancel-or-honor decision on existing commitments entirely to external:commitment-reconciliation.

HANDOFFS:
- h.reconcile → external:commitment-reconciliation: carries ["each commitment and when it was created relative to the loss","the explicit fact that nothing has been cancelled - the reconciliation decides that on its own terms"]
- h.deprovision → ACC-80: carries ["the resource and the effective loss time","the fact that removal is a capability question and not a data-deletion authorisation"]

COMPLETION:
x.revoked's state ('future use revoked; history and commitments intact') is a precise, narrow completion contract — it does not claim commitments are resolved or resources removed, both of which are explicitly deferred elsewhere.

RESULT / FEEDBACK:
ACC-73 (h.loss) and, notably, ACC-78 (h.terminate) are real handoff sources feeding this workflow per its own consumers[]; ACC-80 and CTL-237 reference it only via prose (viaDistinctFrom).

CORRECTION / REOPEN:
x.revoked's reEntry states the right may be granted again 'on a new basis,' explicitly as a new entitlement rather than a revival of this one — clean episode identity, no silent resurrection.

OBSERVABILITY / AUDIT:
entitlement_log records the effective-time determination and the stop-future-use action — sufficient for reconstructing when and why access ended.

CONSUMER COVERAGE:
Classification: active. consumers[] shows two real handoff sources: ACC-73 (h.loss, a scope reduction with dependent commitments) and ACC-78 (h.terminate, carrying 'the suspension history and the terminal decision' plus 'the entitlement now ending'). ACC-78 is the Customer Journey named in this round's cross-batch note as competing with IDN-90 under exclusionGroup 'account-restriction-authority,' arbitrated by OPS-131 — none of which are audited here. ACC-74 is simply the downstream receiver once that contest resolves to termination; its own entry evidence ('an authoritative end to a right') is satisfied by what ACC-78's handoff carries, so no defect is introduced by the relationship, only a cross-domain dependency worth a company's attention when mapping who triggers ACC-74.

TEST CASES:
- [handoff] Given: an entitlement ends with a confirmed reservation or open transaction still live under it → Expect: the commitment is handed to external:commitment-reconciliation with nothing pre-cancelled, rather than this workflow deciding the commitment's fate itself
- [correction] Given: a customer is granted the same right again later → Expect: it is provisioned as a new entitlement, not a revival of the revoked one

GAPS:
- P2 (idempotency): Idempotent stop-future-use is asserted only in guardrail prose, no structured instanceKey/idempotencyKey (consistent with ACC-72/73's convention gap).

---

## ACC-75 — Access Authorization

READINESS: READY_WITH_MAPPING

WHY:
The decision logic is exactly right for a runtime authorization check: entitlement ≠ permission-for-every-action, authentication ≠ authorization, and a cached ALLOW is explicitly re-checked against critical state rather than trusted indefinitely. Every denial carries a reason category, which is the minimum needed for the decision to be debuggable or appealable. The main mapping work is wiring the actual policy engine and state sources this evaluates against.

RESPONSIBILITY:
Decides, at the moment of a protected-action attempt, whether the current actor/action/resource combination is authorized — never treating authentication or product-level entitlement as sufficient by itself, re-checking cached decisions against current critical state, and requiring a reason category on every denial.

INSTANCE:
Work instance is the individual access request — one actor, one action, one resource (entity.scope) — explicitly non-durable: 'the decision belongs to the request... the next attempt is decided again.' No instanceKey/concurrency is declared, and arguably none is needed since this is a stateless per-request evaluation rather than a persisting case.

ENTRY:
Trigger protected_action_attempted, evidence.source authoritative, with explicit insufficientAlone guards against 'successful authentication' and 'holding an entitlement to the product' being mistaken for authorization by themselves.

OWNERSHIP:
N/A in the case/queue sense — there is no persisting work item to own; the 'decision authority' is the policy evaluation itself (a.evaluate), and the workflow correctly never conflates this with a human approver.

ASSIGNMENT / QUEUE:
N/A — this is a stateless per-attempt decision, not a routed work item.

DATA:
Identity, entitlement, role/permission, resource scope, current security state, and the policy requirements for this specific action — a complete, named evaluation input set.

EVIDENCE:
N/A — not a human evidentiary review; a.evaluate is a real-time policy evaluation against current system state.

AUTHORITY / APPROVAL:
N/A in the human-approval sense — 'decision authority' here is the policy engine evaluating at execution time, which the workflow's own distinctFrom entry (vs. OWN-56, a business approval taken in advance) makes explicit and correct.

IDEMPOTENCY:
N/A — read-only decision with no durable side effect to duplicate; idempotency doesn't apply to a per-attempt ALLOW/DENY evaluation.

SLA / TIME:
N/A — no wait/timeout; this is a synchronous, real-time decision.

ESCALATION:
N/A as a distinct mechanic — h.stepup → IDN-86 (assurance-level shortfall) is a routing branch, not an escalation; it preserves the pending request so it resumes rather than being retyped, which is the right design.

CANCELLATION / SUPERSESSION:
N/A — nothing here is cancellable; each attempt is its own decision, explicitly never inherited from the prior one ('allowing one action never authorises the following one').

HANDOFFS:
- h.stepup → IDN-86: carries ["the pending request, so it can resume rather than be retyped","the assurance level required and why this action requires it"]

COMPLETION:
ALLOW/DENY are both immediately final for the attempt in question, with DENY additionally requiring a reason category — a precise completion contract with no ambiguity about what 'done' means here.

RESULT / FEEDBACK:
IDN-86 is a real, two-way handoff partner (this workflow's h.stepup out, IDN-86's h.resume back in); IDN-85 references this workflow only in prose (viaDistinctFrom).

CORRECTION / REOPEN:
N/A — there's no case to reopen; 'the next attempt is decided again' by design, which is the correct non-persistence for this kind of check.

OBSERVABILITY / AUDIT:
authorization_log records denials with their reason category — the minimum needed to debug or contest a DENY; ALLOW outcomes are not separately logged in the dump's shown writes, which is a minor observability note for a company implementing audit requirements around successful access as well as denied.

CONSUMER COVERAGE:
Classification: active. consumers[] lists IDN-86 with a real, reciprocal viaHandoff (h.resume) — the step-up round trip is a genuine two-way handoff relationship, not a one-shot dependency.

BOUNDARY CANDIDATE:
Suspected correct surface: runtime-mechanism (confidence: medium). This workflow has no persisting work instance, no queue, no human decision point, and its own entity.note says the decision belongs to a single stateless attempt re-evaluated fresh each time — the same shape as the closed Runtime Mechanism round's real-time authorization/arbitration checks, rather than a durable operational work item with ownership and completion semantics. Impact if changed: If reclassified, this workflow's audit dimensions (ownership, assignment, queue, completion) would mostly resolve to N/A by design rather than by gap, which is exactly what's observed here — the current classification doesn't create an incorrect audit outcome, but a company mapping 'operational workflows' to a work-queue system would be mapping something that was never meant to sit in one.

TEST CASES:
- [stale-work] Given: a previously cached authorization exists but a critical state has since changed → Expect: the cached decision is re-checked against current state rather than trusted as-is
- [escalation] Given: conditions are met except for an assurance level this action requires → Expect: the request is preserved and handed to IDN-86 for step-up rather than denied outright or silently allowed

GAPS:
- P2 (other): ALLOW outcomes have no declared log write in this workflow's own action nodes (only a.deny writes to authorization_log) — worth confirming during mapping that successful-access auditability is covered elsewhere rather than assumed absent by design.

---

## ACC-76 — Credential Lifecycle

READINESS: READY_WITH_MAPPING

WHY:
The credential-vs-entitlement separation is stated and enforced throughout ('a credential can be valid while the entitlement behind it has lapsed, and revoked while that entitlement is perfectly live'), and a.revalidate's re-read-before-expiring step is a genuine, correctly-implemented freshness check against exactly the failure mode it names (an extension undone by an older timer). Four distinct, well-labeled terminal-ish exits (unactivated / replaced / expired / superseded) avoid collapsing meaningfully different histories into one generic 'ended' state.

RESPONSIBILITY:
Runs an individual credential's own validity lifecycle (issued → activated-or-lapsed → active → expired/replaced/revoked) independently of the entitlement it represents, re-reading the credential's current version before expiring it so a later extension or replacement is never silently undone by a stale timer.

INSTANCE:
Work instance is the individual credential — its id, owner, scope, and validity (entity.scope) — explicitly stated as having 'its own' lifecycle distinct from the entitlement. No instanceKey/concurrency formally declared (predates the convention; contrast ACC-78/79 in the same file, which do declare it).

ENTRY:
Trigger credential_issued, evidence.source authoritative, requiring an owner, scope, and validity at issuance — precise.

OWNERSHIP:
Fully automated state-machine progression; no execution:'human' anywhere in this workflow. Appropriate given the workflow is tracking an artifact's own validity state rather than making a discretionary human decision — the one real decision point (revocation) is explicitly handed off to ACC-77 rather than decided here.

ASSIGNMENT / QUEUE:
N/A — no queue routing; state transitions are automatic against time and events (activation, revocation, replacement).

DATA:
Credential id, owner, scope, issue time, validity, and whether activation is required — a complete initial-state input set.

EVIDENCE:
N/A — not an evidentiary review; state transitions are driven by time and authoritative events (activation, revocation, replacement), not judgment calls.

AUTHORITY / APPROVAL:
N/A — no approval gate; the only consequential decision (revoke) is explicitly deferred to ACC-77's own entry conditions rather than decided in this workflow.

IDEMPOTENCY:
N/A/undeclared structurally as a formal key, but a.revalidate's re-read-before-expiring behavior is itself a real (if informal) safeguard against a stale-timer race — arguably more concretely specified than the prose-only idempotency claims in ACC-72/73/74.

SLA / TIME:
w.activation ('the activation window') and w.life ('the credential's validity end') both have named, per-credential timeout bases rather than invented fixed durations — correctly deferred to policy/the credential's own stated validity.

ESCALATION:
N/A as a distinct mechanic — revocation and replacement are routing/handoff events (to ACC-77), not escalations in the sense of unresolved work needing attention.

CANCELLATION / SUPERSESSION:
Distinct, well-separated terminal states for four different histories: x.unactivated (never claimed), x.replaced (superseded by a new artifact), x.expired (ended after real use), x.superseded (an expiry that got overtaken by an extension/replacement) — this is a genuinely careful terminality design that avoids conflating 'never used' with 'used and done.'

HANDOFFS:
- h.revoke → ACC-77: carries ["the credential, its scope and its owner","the revocation reason"]

COMPLETION:
Each of the four exits states precisely what ended the credential's life and what that implies for reactivation (never, for all four) — completion is unambiguous and doesn't overclaim (e.g., x.expired explicitly notes the underlying entitlement may still be valid, so a new credential — not a revival — is the right next step).

RESULT / FEEDBACK:
ACC-77 is a real, reciprocal handoff partner (this workflow's h.revoke out, ACC-77's h.new back in for the replacement's own lifecycle) — a genuine two-way relationship.

CORRECTION / REOPEN:
N/A in the sense of 'reopening' a specific credential — every exit explicitly forecloses reactivation of that artifact; a 'correction' here always takes the form of issuing a new credential, which is the intended pattern, not a gap.

OBSERVABILITY / AUDIT:
credential_log distinguishes unactivated-expiry from active-expiry from replacement from revocation — a genuinely useful audit trail for investigating credential history later.

CONSUMER COVERAGE:
Classification: active. consumers[] lists ACC-77 with a real viaHandoff (h.new) — the new credential and the one it replaces, plus the revocation reason as part of the new artifact's history.

BOUNDARY CANDIDATE:
Suspected correct surface: silent-lifecycle-state (confidence: low). This workflow has no human decision point, no queue, and no discretionary judgment anywhere in it — it is a pure time-and-event-driven state machine tracking an artifact's own validity, the same shape as the closed Silent Lifecycle States round's subjects, rather than a work item a team is actively executing. Impact if changed: Low — the audit dimensions here already resolve mostly to 'N/A, automated state tracking' rather than to a defect, so reclassification wouldn't change any finding, only which round's rubric it's compared against.

TEST CASES:
- [stale-work] Given: a credential's validity was extended or replaced after its expiry timer was set → Expect: a.revalidate re-reads the current version before expiring, so the extension is not undone by the older timer
- [handoff] Given: a credential is revoked → Expect: ACC-77 receives the credential, its scope/owner, and the revocation reason, and any issued replacement re-enters this same lifecycle as a new artifact

GAPS:
- none recorded

---

## ACC-77 — Credential Revocation

READINESS: READY_WITH_MAPPING

WHY:
The two hardest properties of a revocation workflow are both handled correctly: revocation happens ahead of everything else already queued ('an artifact invalidated at ten o'clock must not still authorise a request queued at one minute to'), and scope is deliberately narrow by default ('one credential compromise does not automatically revoke unrelated credentials unless policy requires it') with an explicit warning that over-revoking on suspicion becomes its own incident. Replacement is always a new identifier, never a reactivation, which keeps the revocation verifiable.

RESPONSIBILITY:
Immediately revokes affected credentials on an authoritative compromise/reset/removal requirement — scoped only to what's actually implicated, taking precedence over any queued in-flight access action — then routes to identity verification or straight to issuing a replacement, which is always a new artifact rather than a reactivation.

INSTANCE:
Work instance is the specific credentials affected plus their owner (entity.scope) — 'scope is the whole question,' per the entity.note, correctly treating scope determination as the workflow's central judgment rather than an afterthought. No instanceKey/concurrency declared.

ENTRY:
Trigger authoritative_revocation_requirement, evidence.source authoritative, covering suspected/confirmed compromise, manual revoke, password/security reset, device removal, access termination, or token invalidation — broad but consistently authoritative.

OWNERSHIP:
Fully automated; no execution:'human'. Given the emphasis on speed ('takes precedence over everything else') this is appropriate — a human-gated revocation would undercut the very property the workflow is designed to guarantee.

ASSIGNMENT / QUEUE:
N/A — no queue routing for the revocation itself; c.verification routes to IDN-85 only when replacement (not the revocation) requires re-establishing identity/control.

DATA:
The revocation reason and the credential's scope/owner are the required inputs; a.scope explicitly determines which credentials are actually affected rather than assuming a blast radius.

EVIDENCE:
N/A — not an evidentiary review; scoping and revocation act on an already-authoritative requirement, not evidence being weighed.

AUTHORITY / APPROVAL:
N/A — no approval gate; revocation is immediate by design, and replacement eligibility (c.replacement) is a policy/entitlement check, not a discretionary approval.

IDEMPOTENCY:
N/A/undeclared structurally; the workflow's own emphasis is on ordering (revocation precedence) rather than duplicate-prevention, and revoking an already-revoked credential is a safe no-op by nature, not a distinct duplicate-work risk.

SLA / TIME:
N/A — no wait/timeout nodes; revocation and invalidation of in-flight refresh/activation are immediate.

ESCALATION:
N/A as a distinct mechanic — this workflow doesn't escalate; it routes to verification (IDN-85) or reissuance (ACC-76) based on policy.

CANCELLATION / SUPERSESSION:
a.invalidate explicitly cancels in-flight refresh/activation tied to the revoked credential ('nothing in flight can bring one back after it has been withdrawn') — a real, correctly-scoped 'stop future work' action; there is no completed external effect to reverse here since revocation itself is the action.

HANDOFFS:
- h.verify → IDN-85: carries ["the revocation reason, which sets how strong the verification has to be","the fact that the old credential is already revoked and stays revoked whatever the verification concludes"]
- h.new → ACC-76: carries ["the new credential and the credential it replaces","the revocation reason, which is part of the new artifact's history"]

COMPLETION:
x.no-access's state ('revoked; no replacement issued') is precise, and its reEntry correctly frames a future credential as requiring entitlement and authorization to be re-established from scratch — 'a different journey and not a continuation of this one,' which is the right episode boundary.

RESULT / FEEDBACK:
ACC-76 is a real, reciprocal handoff partner (h.new in, h.revoke back out per ACC-76's own consumers[]) — the two workflows form a genuine loop for reissuance.

CORRECTION / REOPEN:
N/A for the revoked artifact itself (never reactivated); 'reopening' access always takes the form of a fresh entitlement/authorization path, which is stated explicitly rather than left implicit.

OBSERVABILITY / AUDIT:
credential_log records the scoping decision, the revocation, and (if issued) the replacement — sufficient to reconstruct what was revoked, why, and what came after.

CONSUMER COVERAGE:
Classification: active. consumers[] lists ACC-76 with a real viaHandoff (h.revoke) carrying the credential, its scope/owner, and the revocation reason — this workflow's own entry requirements are directly satisfied by it.

TEST CASES:
- [cancellation] Given: an activation or refresh request is already queued when a credential is revoked → Expect: a.invalidate cancels it — the revocation takes precedence and nothing in flight can reactivate the credential
- [handoff] Given: a replacement is permitted but the revocation reason means identity/control must be re-established first → Expect: IDN-85 receives the revocation reason and required verification strength before any replacement is issued

GAPS:
- none recorded

---

## ACC-80 — Deprovisioning Reconciliation

READINESS: READY_WITH_MAPPING

WHY:
Dependency-checking-before-removal is the core discipline this workflow exists for, and it's handled with four distinct, well-separated branches (shared-with-live-entitlement / commitment-must-complete / special-process-required / nothing-depends), each routed correctly. 'Deprovisioning does not delete historical or audit data' is stated as a guardrail and enforced structurally by never routing a.deprovision toward anything but the capability itself. The retry/verify/escalate pattern mirrors ACC-72's, appropriately reused rather than reinvented.

RESPONSIBILITY:
Removes a no-longer-authorized technical capability only after checking for live dependencies (shared entitlements, in-progress commitments, required export/handover processes), verifies actual removal where the access consequence matters, and retries or escalates failures against a fixed budget — never deleting historical or audit data as a side effect.

INSTANCE:
Work instance is the provisioned resource/capability plus the entitlement whose end triggered its removal (entity.scope), with an explicit note that 'the resource is the entity, not the entitlement' since a shared resource can outlive any single right to it. No instanceKey/concurrency formally declared.

ENTRY:
Trigger deprovisioning_requirement, evidence.source authoritative, covering entitlement end/account closure/role removal/contract termination/explicit resource removal — with an explicit insufficientAlone guard that mere non-use is not authorization to remove anything.

OWNERSHIP:
Fully automated; no execution:'human'. Appropriate for a technical removal action; human ownership only enters via h.escalate → OWN-55 on unrecoverable failure, and via h.special → external:data-transfer-or-termination when a defined process (export/handover) must run first.

ASSIGNMENT / QUEUE:
N/A while automated; OWN-55 is the escalation target on failure.

DATA:
The provisioned resources affected and which are shared with a still-entitled holder — explicitly checked before any removal, correctly treating 'shared' as a first-class case rather than an edge condition.

EVIDENCE:
N/A — not an evidentiary review; dependency-checking is a deterministic query against current entitlement/commitment state.

AUTHORITY / APPROVAL:
N/A — no discretionary approval gate; removal proceeds once dependencies are cleared, per policy, not per a human sign-off.

IDEMPOTENCY:
Guardrail: 'deprovisioning is idempotent, so a retry completes a partial removal rather than restarting it' — again prose-only relative to a formal instanceKey/idempotencyKey, consistent with ACC-72/73/74's convention gap, but the intent (retry-completes rather than retry-restarts) is more specific than a bare idempotency claim.

SLA / TIME:
w.dependency ('the horizon appropriate to the dependent commitment') and w.deprovision ('the deprovisioning SLA') are both named without invented values, with onTimeout in both cases escalating to OWN-55 rather than assuming the dependency cleared or the removal succeeded — correct 'silence is not success' discipline, explicitly stated for w.deprovision.

ESCALATION:
h.escalate → OWN-55 fires on either a dependency that never clears or a removal that permanently fails/exhausts its retry budget, carrying what's been attempted and — critically — whether the capability is believed still reachable, which correctly sets urgency rather than treating every escalation the same.

CANCELLATION / SUPERSESSION:
x.retain is explicitly non-terminal and reEntry-eligible once the last dependent entitlement ends — removal isn't abandoned, just deferred, and taking the resource now would incorrectly affect other still-entitled holders.

HANDOFFS:
- h.special → external:data-transfer-or-termination: carries ["the resource and what has to happen before it can go","the fact that the capability is already unauthorised even though the resource remains"]
- h.escalate → OWN-55: carries ["the resource, what was attempted, and how long it has been unauthorised","whether the capability is believed to still be reachable, which is what makes this urgent rather than administrative"]

COMPLETION:
x.removed's state ('capability removed; records and audit data untouched') is precise and directly enforces the historical-data guardrail as part of the completion contract itself, not just as separate prose.

RESULT / FEEDBACK:
ACC-74 is the real handoff source (h.deprovision) per this workflow's own consumers[].

CORRECTION / REOPEN:
x.removed's reEntry states re-provisioning follows a new entitlement rather than an undo, and deleting retained data is explicitly a separate lifecycle with its own authorization — clean episode/lifecycle separation.

OBSERVABILITY / AUDIT:
deprovisioning_log records the dependency check outcome, the removal attempt(s), and verification — sufficient for reconstructing whether and when a capability was actually removed.

CONSUMER COVERAGE:
Classification: active. consumers[] lists ACC-74 with a real viaHandoff (h.deprovision) carrying the resource and effective loss time, matching this workflow's own trigger requirements.

TEST CASES:
- [concurrent-claim] Given: a resource is shared and another holder is still entitled to it → Expect: the resource is retained, not removed, even though the triggering entitlement has ended
- [stale-work] Given: a dependent commitment never completes within its horizon → Expect: escalation fires rather than the deprovisioning request waiting indefinitely with an unauthorized capability potentially still live

GAPS:
- P2 (idempotency): Idempotent, resume-not-restart retry behavior is asserted only in guardrail prose, no structured instanceKey/idempotencyKey (consistent with the other ACC-7x workflows in this batch).

---

## CTL-231 — Ownership Assignment

READINESS: NEEDS_CONTRACT_WORK

WHY:
Entry validation and non-inference discipline are excellent, and the accept/decline claim dance mirrors DEC-182's careful pattern. But unlike its own sibling transfer chain (CTL-232→CTL-233), this workflow goes straight from acceptance to final assignment with no revalidation of the entity's current ownership state — a real gap for exactly the scenario (acceptance may arrive well after the offer) that its sibling workflow was explicitly built to guard against.

RESPONSIBILITY:
Establishes an accountable controller (owner) for an ownable entity by an explicit, authorized act — never inferred from access level, admin role, or entity-creation history — with acceptance required where ownership carries obligations.

INSTANCE:
Scope = the ownable entity and the ownership relationship being created on it; entity.note is explicit ownership is a created relationship, never derived from role/permission/history. No instanceKey declared (predates the convention, noted honestly).

ENTRY:
Trigger ownership_assignment_requested explicitly excludes the two most common false-positive entries: holding the highest access role, and having created the entity — a precise, well-guarded entry contract.

OWNERSHIP:
The core establishment mechanism, and does it carefully: c.supports (can this entity even have an owner) → c.authority (does the assigner hold the right) → c.eligible (can this party hold it) → c.configuration (would this breach a separation/limit rule) → c.acceptance (must the proposed owner agree) → a.assign (explicit record of who assigned, on what authority, when, and what for). Whether an authorized assigner may name themselves as the new owner (self-assignment) is not addressed either way — neither permitted nor blocked — which is an honest silence to flag rather than a defect, since the workflow's own purpose doesn't inherently forbid it.

ASSIGNMENT / QUEUE:
N/A — direct 1:1 assignment, not queue-routed.

DATA:
Entity, proposed owner, assigning party — all request-supplied with explicit provenance checks at each condition.

EVIDENCE:
N/A — authority/eligibility validation, not evidence review.

AUTHORITY / APPROVAL:
c.authority requires an existing owner, a governance rule, or a defined authority — never inferred; c.configuration explicitly blocks a prohibited resulting ownership shape rather than allowing it to land and be discovered by audit later.

IDEMPOTENCY:
w.acceptance models the accept/decline wait correctly (existing ownership unchanged meanwhile), but c.accepted → a.assign proceeds directly to the final write with no revalidation of the entity's current ownership state after acceptance arrives — confirmed in the raw source (control.ts lines 381-424). If two assignment proposals were concurrently pending for the same entity and both are later accepted, nothing here re-checks that the entity's ownership state is still what it was at validation time before either one commits, unlike CTL-232→CTL-233's explicit propose-then-revalidate-before-execute pattern for the analogous transfer case.

SLA / TIME:
w.acceptance's timeout traces to 'the acceptance window the assignment allows' — not invented.

ESCALATION:
h.review→DEC-181 for a prohibited configuration — this is one of the DEC-181 callers with a genuinely natural requester (the assigning party who attempted the blocked assignment), so it fits DEC-181's intake model comparatively well.

CANCELLATION / SUPERSESSION:
x.not-ownable / x.rejected / x.declined / x.lapsed all explicitly leave the existing ownership state unchanged — clean, non-destructive validation failures.

HANDOFFS:
- h.review → DEC-181: carries ["the proposed assignment and the constraint it breaches","the explicit fact that the existing ownership state is unchanged and nothing was assigned"]

COMPLETION:
x.assigned is a clear, explicit completion ('ownership assigned and recorded with its authority'), correctly deferring any later change of owner to the separate transfer lifecycle rather than a second assignment over the top.

RESULT / FEEDBACK:
N/A — no downstream workflow consumer; trigger and outcome are directly request/response.

CORRECTION / REOPEN:
A wrong assignment is corrected via the transfer lifecycle, not by reopening this workflow — appropriate separation of concerns.

OBSERVABILITY / AUDIT:
Who assigned, on what authority, when, and what the owner is accountable for are all explicitly recorded — a strong audit basis for later disputes.

CONSUMER COVERAGE:
Classification: event-driven. No workflow hands off into CTL-231 (consumers: []); the trigger is a direct, authoritative external request (an admin/API action), matching the CMS-201/CON-34/OPS-121 event-driven pattern, not an orphan.

TEST CASES:
- [concurrent-claim] Given: Two assignment proposals for the same entity are both pending acceptance and both are accepted → Expect: The entity's current ownership state is revalidated before either commits, so a stale or conflicting assignment cannot silently finalize
- [self-approval] Given: An authorized assigning party names themselves as the proposed owner → Expect: Policy determines whether this is permitted; the workflow does not silently allow or silently block it without a stated rule

GAPS:
- P1 (idempotency): c.accepted proceeds directly to a.assign with no revalidation of the entity's current ownership state after the acceptance wait, unlike the CTL-232→CTL-233 transfer chain's explicit propose-then-revalidate-before-execute pattern for the same class of problem (an offer accepted after a delay).
- P2 (authority-approval): Self-assignment (assigner naming themselves as proposed owner) is neither explicitly permitted nor blocked.

---

## CTL-232 — Ownership Transfer Validation

READINESS: NEEDS_CANONICAL_CHANGE

WHY:
The 'proposal without disturbance' discipline is excellent, but this workflow has two different paths into CTL-234 (ownership cutover) and only one of them performs the revalidation CTL-234's own declared trigger evidence requires. When c.acceptance decides acceptance is not required, h.execute hands straight to CTL-234 with only the original request-time validation — no freshness-before-execution check — even though CTL-234's trigger explicitly requires 'a transfer revalidated and authorized against the entity's current state'. This is a required operation missing from one of two paths into an ownership-changing action, not merely an implementation-mapping gap.

RESPONSIBILITY:
Validates and proposes a future controller for an entity without disturbing the current one — the current owner remains fully authoritative until a later, separate cutover step actually moves control.

INSTANCE:
Scope = the entity, current owner, proposed owner, and the transfer request between them; entity.note is explicit the request is a proposal and the current owner is unaffected by its mere existence.

ENTRY:
Trigger ownership_transfer_requested is a direct, explicit proposal request.

OWNERSHIP:
a.preserve explicitly records the current owner remains authoritative throughout — avoids the classic 'entity briefly ownerless during a pending transfer' bug.

ASSIGNMENT / QUEUE:
N/A.

DATA:
Entity, current owner, proposed owner, requester, scope, conditions — all captured explicitly at a.capture.

EVIDENCE:
N/A.

AUTHORITY / APPROVAL:
c.authority, c.eligible, c.transferable are three explicit negative gates (requester's right to initiate, recipient's eligibility, entity's transferability/holds) before a proposal can even become pending — thorough.

IDEMPOTENCY:
Whether two concurrently-pending transfer proposals for the same entity are themselves a problem is handled acceptably by design — CTL-233 later catches staleness/supersession at acceptance time. The real defect is narrower and sharper: the 'no acceptance required' branch (c.acceptance → h.execute) skips revalidation entirely before executing, so a transfer could cut over against an entity state that has since changed, with nothing to catch it.

SLA / TIME:
N/A within this workflow — pending acceptance is a resting exit (x.pending); CTL-233 handles whenever the accept event eventually arrives.

ESCALATION:
N/A.

CANCELLATION / SUPERSESSION:
x.rejected and x.pending both leave the current owner unaffected. The capability to withdraw a pending request is asserted in a.pending's prose ('the request can be withdrawn by them at any point before it completes') but has no corresponding condition, exit, or handoff node in the graph (confirmed against the raw source) — withdrawal is not a distinguishable, modeled state.

HANDOFFS:
- h.execute → CTL-234: carries ["the entity, the current owner, the proposed owner and the transfer scope","the explicit fact that ownership has not moved - the cutover establishes the new owner before touching the old one"]

COMPLETION:
N/A here — this workflow only validates and proposes; actual completion is CTL-234's cutover.

RESULT / FEEDBACK:
N/A.

CORRECTION / REOPEN:
A rejected or stale proposal requires a fresh request; no in-place mutation.

OBSERVABILITY / AUDIT:
Capture, authority/eligibility/transferability checks, and pending/rejected outcomes are each logged.

CONSUMER COVERAGE:
Classification: active. CTL-235 references this workflow only via distinctFrom prose; CTL-238 (h.transfer) is a real handoff sender whose payload fits well because CTL-232's own c.authority check already accommodates 'a governance rule' as the authorizing basis, not only an existing owner's explicit permission.

TEST CASES:
- [stale-work] Given: A transfer that does not require recipient acceptance is validated, and the entity's state changes before h.execute is actually processed by CTL-234 → Expect: CTL-234 should refuse to execute against a target that no longer matches what was validated — but as specified, no revalidation step exists on this path to catch it
- [cancellation] Given: The current owner wants to withdraw a pending transfer request before it completes → Expect: A modeled state (condition/exit/handoff) exists for withdrawal, not just a prose assertion that it is possible

GAPS:
- P0 (other): The 'acceptance not required' path (c.acceptance → h.execute) hands off to CTL-234 with no revalidation step, even though CTL-234's own declared trigger evidence requires 'a transfer revalidated and authorized against the entity's current state' — this is a missing required operation on one of the two real paths into an ownership-changing execution, i.e. stale work can execute after being superseded.
- P2 (other): Withdrawal of a pending transfer request is asserted in prose (a.pending's does-text) but has no corresponding node in the graph.

---

## CTL-233 — Ownership Transfer Execution

READINESS: READY_WITH_MAPPING

WHY:
This is the strongest freshness-before-execution implementation in the batch — it re-checks every assumption the original proposal made, binds acceptance to an exact request version, and never conflates 'expired' with 'rejected'. No gaps found.

RESPONSIBILITY:
Checks, at the moment a proposed owner actually accepts a transfer, whether the transfer proposed earlier still holds against the entity's current state before authorizing the cutover.

INSTANCE:
Scope = the transfer request and the acceptance made against its specific version; entity.note is explicit that acceptance binds to a request version, and the entity/owner/recipient's eligibility can all have moved since.

ENTRY:
Trigger proposed_owner_accepts_transfer is the recipient's own acceptance action — an external/authoritative event, not a workflow handoff (confirmed: CTL-232 has no handoff node targeting CTL-233).

OWNERSHIP:
The current owner remains authoritative until cutover; this workflow only authorizes execution, deferring the actual ownership change to CTL-234.

ASSIGNMENT / QUEUE:
N/A.

DATA:
Transfer request version, acceptance, and revalidated state — all explicit.

EVIDENCE:
N/A.

AUTHORITY / APPROVAL:
N/A directly — authority was already validated at CTL-232; this re-confirms it still holds.

IDEMPOTENCY:
a.authorize binds the authorization to the exact request version before proceeding — a clean version-bound, optimistic-concurrency-style guard against acting on a stale acceptance.

SLA / TIME:
c.deadline checks the acceptance window against the window the original request allowed — not invented.

ESCALATION:
N/A.

CANCELLATION / SUPERSESSION:
x.expired and x.stale are both explicitly non-destructive of current ownership, and both correctly avoid conflating 'the window lapsed' or 'the request was superseded' with 'the recipient was rejected'.

HANDOFFS:
- h.execute → CTL-234: carries ["the transfer request version, the acceptance and the revalidation that supported it","the explicit fact that the current owner is still the owner until the cutover establishes the new one"]

COMPLETION:
Correctly distinguishes acceptance from completion: 'nothing has moved, the cutover is where control actually changes hands'.

RESULT / FEEDBACK:
CTL-234 receives a fully self-sufficient, freshly-revalidated authorization.

CORRECTION / REOPEN:
Stale/expired outcomes require a fresh CTL-232 request; nothing is silently retried against the old one.

OBSERVABILITY / AUDIT:
Revalidation outcome, staleness/ineligibility reason, and authorization are each logged.

CONSUMER COVERAGE:
Classification: event-driven. No workflow hands off into CTL-233 (CTL-232 references it only via distinctFrom prose); the trigger is the proposed owner's own accept action, a legitimate external initiator, not an orphan.

TEST CASES:
- [stale-work] Given: An acceptance arrives against a transfer request that has since been superseded or whose entity has changed → Expect: a.stale refuses to authorize execution rather than trusting the original snapshot
- [completion] Given: Acceptance arrives inside the window and every assumption still holds → Expect: a.authorize binds to the exact request version and hands off to CTL-234

GAPS:
- none recorded

---

## CTL-234 — Ownership Cutover

READINESS: NEEDS_CONTRACT_WORK

WHY:
The new-owner-first, verify-before-touching-old-owner sequencing is the correct and well-articulated safety property, and history/reference reconciliation is thorough. But this workflow has no guard of its own against two overlapping cutovers for the same entity, and it is the receiving end of the CTL-232 revalidation gap flagged there.

RESPONSIBILITY:
Actually moves control from one party to another, establishing and verifying the new owner before touching the old one, so the entity is never left uncontrolled in between; reconciles the old owner's relationship per policy and preserves historical attribution.

INSTANCE:
Scope = the entity and both ownership relationships during the change; entity.note names the creation/reconciliation ordering itself as the safety property.

ENTRY:
Trigger ownership_transfer_authorized_for_execution requires 'a transfer revalidated and authorized against the entity's current state' — genuinely satisfied by the CTL-233 path, but not by CTL-232's direct 'acceptance not required' path (see CTL-232's finding); this workflow itself has no way to detect that a given authorization it receives was never actually revalidated.

OWNERSHIP:
a.new-first establishes the new owner relationship, then a.verify-new confirms it actually resolves and is exercisable ('created is not effective') before c.verified gates whether to proceed to reconcile-old or abort — this is a careful, explicitly-sequenced ownership transfer with no window where the entity is genuinely uncontrolled.

ASSIGNMENT / QUEUE:
N/A.

DATA:
Entity, current/new owner, transfer scope, revalidation basis — assumed complete when the sender did its job (CTL-233's path).

EVIDENCE:
N/A.

AUTHORITY / APPROVAL:
N/A — authority was established upstream; this workflow executes, not decides.

IDEMPOTENCY:
a.verify-new's create-then-verify pattern is a good idempotent-ish discipline, but no instanceKey/idempotencyKey guards against two overlapping cutover executions for the same entity running concurrently (e.g. one legitimately authorized via CTL-233, and a second stale one that slipped through CTL-232's unrevalidated path) — nothing here checks 'is a cutover already in progress for this entity' before a.new-first proceeds.

SLA / TIME:
N/A — no waits.

ESCALATION:
N/A.

CANCELLATION / SUPERSESSION:
x.aborted leaves the previous owner 'entirely unchanged' when the new relationship fails to verify — explicitly avoids the worse failure mode of a half-downgraded old owner with no valid new one.

HANDOFFS:
- h.reconcile → OWN-54: carries ["the previous and current owner, the moment of change, and how the previous owner's relationship was reconciled","the explicit fact that the transfer is already effective, so no further acceptance step applies","the explicit instruction that historical attribution is already preserved and must not be revisited"]

COMPLETION:
A genuinely business-complete definition: new owner verified authoritative, old owner reconciled per policy, references updated, history preserved — not merely 'a record was written'.

RESULT / FEEDBACK:
OWN-54 receives a complete, self-sufficient reconciliation payload.

CORRECTION / REOPEN:
An aborted cutover is retried via a fresh authorized transfer; no in-place correction.

OBSERVABILITY / AUDIT:
New-owner establishment, verification result, reconciliation choice, and reference updates are each logged; historical attribution is explicitly preserved as performed.

CONSUMER COVERAGE:
Classification: active. CTL-232 (h.execute, unrevalidated on the no-acceptance path — see CTL-232 for the root-cause finding) and CTL-233 (h.execute, fully revalidated) are the two real handoff senders; only CTL-233's payload actually satisfies this workflow's own stated trigger requirement.

TEST CASES:
- [concurrent-claim] Given: Two authorized transfers for the same entity reach this workflow close together → Expect: Only one cutover proceeds at a time for a given entity; the second is rejected or queued rather than both racing to establish a new owner
- [cancellation] Given: The new ownership relationship fails to verify as authoritative → Expect: a.abort leaves the previous owner entirely unchanged, with no partial downgrade

GAPS:
- P1 (idempotency): No guard here checks whether a cutover is already in progress for the same entity before a.new-first proceeds, compounding the risk from CTL-232's unrevalidated 'acceptance not required' path.

---

## CTL-235 — Delegation Authorization

READINESS: NEEDS_CONTRACT_WORK

WHY:
Scope-bounding, non-exceedance, and explicit redelegation handling are all excellent. But unlike its sibling CTL-231 (ownership assignment), this workflow has no consent/acceptance step for the delegate at all — authority can be imposed on a party who was never asked whether they want it.

RESPONSIBILITY:
Grants bounded authority to act on an owner's behalf, strictly within what the delegator themselves holds, without changing underlying ownership and without assuming a redelegation right from silence.

INSTANCE:
Scope = the delegation, delegator, delegate, and target entity; entity.note is explicit ownership does not change and the delegator retains and can revoke the borrowed authority.

ENTRY:
Trigger delegation_requested is a direct, explicit request.

OWNERSHIP:
N/A for entity ownership (explicitly unaffected); for delegated authority itself, this workflow establishes it via a.grant, but with no equivalent of CTL-231's c.acceptance branch — there is no point in this graph where the delegate is asked whether they will accept the delegation before a.grant records DELEGATED and a.capabilities actually raises their access.

ASSIGNMENT / QUEUE:
N/A — direct grant, not queue-routed.

DATA:
Scope, actions permitted, duration, target entity, delegator authority, delegate eligibility, redelegation semantics — comprehensive.

EVIDENCE:
N/A.

AUTHORITY / APPROVAL:
c.delegator explicitly bounds delegated authority to what the delegator holds ('delegated authority can never exceed the delegator's') and c.redelegation requires the right to pass authority on to be explicitly stated, never assumed from silence — both textbook.

IDEMPOTENCY:
No check for an existing overlapping active delegation to the same delegate over the same scope before granting a new one.

SLA / TIME:
c.temporary correctly hands time-bounded delegations to CTL-236 and leaves permanent ones (x.granted) without an invented expiry.

ESCALATION:
N/A.

CANCELLATION / SUPERSESSION:
x.rejected and x.granted are both clean; revocation is explicitly deferred to CTL-237's own lifecycle, and a wider scope is a new delegation rather than an edit.

HANDOFFS:
- h.temporary → CTL-236: carries ["the delegation, its boundary and the version this boundary applies to","the explicit fact that the expiry must check the current delegation version rather than the one it was scheduled against"]

COMPLETION:
a.capabilities explicitly separates 'what the delegate is authorized to do' (this record) from 'what the delegate can actually do' (the access mechanism), naming the two-sources-of-truth risk directly — strong discipline.

RESULT / FEEDBACK:
N/A — no downstream workflow consumer beyond CTL-236 for the temporary case.

CORRECTION / REOPEN:
N/A.

OBSERVABILITY / AUDIT:
Scope, duration, authority basis, redelegation decision, and capability-raising are each logged.

CONSUMER COVERAGE:
Classification: event-driven. No workflow hands off into CTL-235 (consumers: []); the trigger is the delegator's own direct request, a legitimate external initiator, not an orphan.

TEST CASES:
- [approval] Given: A delegator grants authority to a party who does not want to hold it → Expect: The delegate has an explicit opportunity to decline before capabilities are raised on their behalf, mirroring CTL-231's acceptance branch for ownership assignment
- [duplicate-creation] Given: A second delegation request targets a scope already actively delegated to the same delegate → Expect: The overlap is detected and reconciled rather than producing two concurrent, possibly conflicting delegation records

GAPS:
- P1 (authority-approval): No consent/acceptance step exists for the delegate before authority is granted and capabilities raised, unlike CTL-231's explicit 'must the proposed owner accept?' branch for the structurally analogous ownership-assignment case.
- P2 (idempotency): No check for an existing overlapping active delegation before granting a new one.

---

## CTL-236 — Temporary Delegation Expiry

READINESS: READY_WITH_MAPPING

WHY:
Version-aware revalidation at the boundary, proactive stand-down on supersession, and reactive suppression of a stale expiry job together form a genuinely double-defended, well-designed mechanism. No material gaps found.

RESPONSIBILITY:
Ends a time-bounded delegation at its boundary, but only after confirming the scheduled expiry still targets the current version of that delegation — defending explicitly against a classic stale-scheduled-job bug.

INSTANCE:
Scope = the time-bounded delegation and the version the expiry was scheduled against; entity.note explicitly names 'a delegation extended, narrowed or replaced since is a different delegation, and expiring the old one ends the wrong thing' as the risk being defended against.

ENTRY:
Trigger delegation_has_validity_boundary matches CTL-235's h.temporary payload.

OWNERSHIP:
N/A — delegation-derived authority, not entity ownership.

ASSIGNMENT / QUEUE:
N/A.

DATA:
Boundary and the delegation version the expiry job was scheduled against.

EVIDENCE:
N/A.

AUTHORITY / APPROVAL:
c.extension requires an explicit authorized extension before deferring expiry — never auto-renews.

IDEMPOTENCY:
a.superseded (proactive, at replacement time) and a.suppress (reactive, at the scheduled boundary) form a double defense against the exact stale-job bug named in entity.note — a genuinely strong instance of freshness-before-execution, the third such implementation in this batch (alongside DEC-185 and CTL-233).

SLA / TIME:
w.boundary's timeout is the delegation's own declared boundary — the normal, expected outcome, not an invented duration.

ESCALATION:
N/A.

CANCELLATION / SUPERSESSION:
x.superseded / x.suppressed / x.extended all preserve original history explicitly; extension is recorded as a new record referencing the original rather than editing its dates.

HANDOFFS:
- h.reconcile → CTL-237: carries ["the delegation, its scope and the moment it ended","the explicit instruction to remove only what this delegation granted, leaving anything the delegate holds in their own right"]
- h.revoke → CTL-237: carries ["the revoking authority and the moment it took effect","the same instruction: only delegation-derived authority is removed"]

COMPLETION:
Correctly defers actual capability removal to CTL-237; this workflow's own completion is 'boundary correctly reached (or stood down) against the current version'.

RESULT / FEEDBACK:
CTL-237 receives everything it needs (delegation, scope, moment) without re-derivation.

CORRECTION / REOPEN:
Extension is append-only (new record referencing the original); nothing is edited in place.

OBSERVABILITY / AUDIT:
Boundary, version, supersession/suppression/extension decisions are each logged.

CONSUMER COVERAGE:
Classification: active. CTL-235 (h.temporary) is the sole real, well-matched handoff sender.

TEST CASES:
- [stale-work] Given: A scheduled expiry job fires for a delegation that was extended, narrowed, or replaced since it was scheduled → Expect: a.suppress stands the stale job down rather than ending the current, valid delegation
- [escalation] Given: The delegation is revoked early, before its boundary → Expect: h.revoke routes to CTL-237 with the revoking authority and the moment it took effect

GAPS:
- none recorded

---

## CTL-237 — Delegation Revocation

READINESS: READY_WITH_MAPPING

WHY:
The recalculate-from-current-truth approach to partial revocation directly and correctly solves the classic 'revoke role, accidentally strip independent access' bug, and history/attribution are explicitly preserved. Only a minor entry-contract documentation gap.

RESPONSIBILITY:
Removes exactly the authority a delegate holds because of a specific delegation, recalculated from their current total access rather than subtracted from a remembered snapshot, so independently-held rights are never accidentally stripped.

INSTANCE:
Scope = the delegation and the capabilities that exist because of it; entity.note is explicit the delegate may hold rights from several sources and only delegation-derived ones are in scope.

ENTRY:
Trigger delegation_revocation_authorized requires either an authorized revocation or an unextended boundary — this matches CTL-236's two handoffs cleanly, but does not explicitly enumerate the third real path this workflow actually has (OWN-54 handing off when the delegator's own underlying authority ends, cascading to their delegations); the carried payload is sufficient even though the trigger's own requires-list doesn't name that scenario.

OWNERSHIP:
N/A — delegated authority removal, not entity ownership; correctly scoped as execution, not decision.

ASSIGNMENT / QUEUE:
N/A.

DATA:
Delegation id, revoking authority, moment of effect.

EVIDENCE:
N/A.

AUTHORITY / APPROVAL:
N/A — revocation authority is presumed already established by the trigger; this workflow executes it.

IDEMPOTENCY:
a.recalculate rebuilds 'what remains' from the delegate's current total access through the access mechanism rather than subtracting a remembered delta — this is itself a form of safe-to-rerun, effectively-once-at-logical-operation-level idempotency (recomputing from current truth), a genuinely elegant solution to the round's duplicate/partial-removal concern.

SLA / TIME:
N/A — no waits.

ESCALATION:
N/A.

CANCELLATION / SUPERSESSION:
N/A — this workflow is itself the revocation mechanism.

HANDOFFS:
- h.work → OWN-54: carries ["the outstanding work and the authority it was assigned under","the explicit fact that the work does not evaporate because the authority behind it did - it needs reassigning or resolving on its own terms"]

COMPLETION:
x.revoked is clean and complete: delegation-derived authority removed, independent rights preserved, history intact with original attribution unchanged.

RESULT / FEEDBACK:
OWN-54 receives outstanding work and the authority it was assigned under, without ambiguity.

CORRECTION / REOPEN:
A fresh delegation to the same party is explicitly a new grant, not a reactivation of this one.

OBSERVABILITY / AUDIT:
Mark, derive, recalculate, preserve, and audit steps are each logged; delegated actions remain attributed as performed.

CONSUMER COVERAGE:
Classification: active. CTL-236 (h.reconcile, h.revoke) and OWN-54 (h.delegations) are both real, well-matched handoff senders.

TEST CASES:
- [handoff] Given: A delegate holds both delegation-derived and independently-granted rights over the same entity when the delegation is revoked → Expect: Only the delegation-derived rights are removed; independent rights are explicitly preserved and recorded as such
- [handoff] Given: Active work is assigned to the delegate under the revoked delegation → Expect: h.work routes it to OWN-54 rather than letting it silently disappear

GAPS:
- P2 (consumer-coverage): OWN-54's real handoff into this workflow (delegator's own authority ending, cascading to their delegations) is not explicitly enumerated in this workflow's own trigger.requires text, even though the carried payload is functionally sufficient.

---

## CTL-238 — Ownership Recovery

READINESS: READY_WITH_MAPPING

WHY:
This is the strongest governance-discipline workflow in the batch: it explicitly forecloses the most dangerous real-world failure mode (silently reassigning an inactive-but-valid owner's entity, or opportunistically granting control to whoever asks). Only minor mapping gaps remain.

RESPONSIBILITY:
Holds an entity safely when its owner cannot exercise valid control, distinguishing temporary unavailability from permanent invalidity, and routes to whatever governance mechanism (succession, emergency control, or an explicit ownerless state) is actually defined — never promoting the nearest administrator by default.

INSTANCE:
Scope = the entity and its ownership state while the owner cannot exercise control; entity.note is explicit the owner remains owner throughout unless a defined governance process says otherwise.

ENTRY:
Trigger owner_becomes_unavailable_or_invalid requires authoritative evidence and explicitly excludes both 'inactivity' ('an owner who has not appeared for a year is still the owner') and 'somebody else asking for control on the grounds the owner is gone' — this is precise, well-guarded entry validation that forecloses the most obvious opportunistic-takeover failure mode.

OWNERSHIP:
a.protect holds the entity 'rather than reassigned meanwhile' when the condition is temporary; a.succession routes to a defined process rather than selecting a new owner itself; a.emergency applies only a governance-defined mechanism with its own scope and review point, explicitly refusing an open-ended emergency grant; a.ownerless names OWNERLESS_PENDING explicitly rather than leaving a dangling invalid owner pointer. Every branch explicitly refuses to invent a replacement ('arbitrarily promoting the highest-privileged administrator... is a security model standing in for a governance decision').

ASSIGNMENT / QUEUE:
N/A.

DATA:
Authoritative evidence of unavailability/invalidity/incapacity/governance determination — clearly sourced.

EVIDENCE:
c.nature explicitly routes 'not determinable' to DEC-181 rather than forcing a temporary/permanent guess — correctly avoids forcing an indeterminate outcome into either bucket.

AUTHORITY / APPROVAL:
N/A directly — this workflow triages to the correct governance mechanism rather than deciding ownership itself.

IDEMPOTENCY:
No explicit dedup for a duplicate unavailability signal firing this workflow twice for the same entity, but the actions themselves (protect/succeed/emergency/ownerless) are largely safe to re-assert; real risk is deferred to and covered by DEC-181's own dedup where escalation occurs.

SLA / TIME:
No wait/timeout node exists inside this workflow for how long a 'temporary' protection can persist before being re-assessed — that determination is entirely deferred to IDN-88's own lifecycle (outside this batch), which needs confirming to have its own re-check back into this workflow, or an entity could remain 'temporarily' protected indefinitely with no automatic re-escalation to a permanent-succession assessment.

ESCALATION:
h.review→DEC-181 fires for 'not determinable' nature and for 'must not remain ownerless but no process is defined' — this is one of the concrete examples supporting DEC-181's own P0 finding: there is no natural human requester here (this is a governance-gap referral, not an approval request), and DEC-181's requester-centric intake model (a.capture, c.valid's requester-standing check) does not map cleanly onto it.

CANCELLATION / SUPERSESSION:
N/A directly modeled here beyond the ownerless-pending state itself.

HANDOFFS:
- h.recovery → IDN-88: carries ["the entity, its protected state and what the owner must prove to resume control","the explicit fact that ownership has not changed and no replacement has been selected"]
- h.transfer → CTL-232: carries ["the entity, the governance rule under which the succession proceeds and the nominated party","the explicit fact that the transfer runs its own validation - succession nominates, it does not assign"]
- h.review → DEC-181: carries ["the entity, the owner's condition and what governance does and does not provide","the explicit fact that no replacement owner was selected and no administrator was promoted by default"]

COMPLETION:
x.ownerless (OWNERLESS_PENDING) is a deliberately visible, named state rather than a silently broken owner pointer; other paths correctly defer actual resolution to the downstream workflow they hand to.

RESULT / FEEDBACK:
N/A — no downstream workflow consumer of this workflow's own output beyond its own handoffs.

CORRECTION / REOPEN:
N/A.

OBSERVABILITY / AUDIT:
Assessment, protection, succession/emergency choice, and ownerless-pending are each explicitly logged.

CONSUMER COVERAGE:
Classification: event-driven. No workflow hands off into CTL-238 (consumers: []); the trigger is a direct authoritative signal (departure/invalidity/incapacity/governance determination), a legitimate external initiator, not an orphan.

TEST CASES:
- [cancellation] Given: The owner is inactive but has not been authoritatively determined unavailable or invalid → Expect: The entity is not reassigned — inactivity alone is explicitly insufficient
- [handoff] Given: Neither a succession process nor an emergency-controller mechanism is defined, and the entity cannot remain ownerless → Expect: h.review escalates to DEC-181 rather than promoting an administrator by default
- [reopen] Given: A temporarily-protected entity's owner unavailability persists well beyond what 'temporary' should reasonably mean → Expect: Some mechanism (in this workflow or in IDN-88) re-assesses toward a permanent/succession determination rather than holding 'protected' indefinitely with no re-check

GAPS:
- P2 (sla-escalation): No wait/timeout exists in this workflow's own graph to re-assess a 'temporary' protection that never resolves; this is entirely deferred to IDN-88 (outside this batch), which needs confirming to have its own re-entry back into this workflow.

---

## DAT-221 — Data Parsing

READINESS: READY_WITH_MAPPING

WHY:
The format-then-structure gate, the staging/production separation, and the 'nothing touched until parsed' guarantee are all explicit and internally consistent. Only pipeline wiring (which system performs capture/parse, log storage) remains; there is no human decision anywhere in this workflow.

RESPONSIBILITY:
Take a submitted dataset/file/payload, check its format is one the target can read, and parse it into a staging representation held apart from production, or reject it before anything is read.

INSTANCE:
Work instance is 'the intake' — one submission, scoped to 'the intake and the source artifact or dataset it carries'. No instanceKey/concurrency is declared (predates the convention). Duplicate policy is explicit but permissive: a resubmission is defined as 'a new intake, assessed on its own terms' rather than being deduped against a prior attempt — two near-simultaneous submissions of the same underlying file become two independent intakes with no collision check.

ENTRY:
Trigger dataset_submitted_for_intake, authoritative, requires a submitted/available dataset; insufficientAlone correctly excludes a file mid-upload. Entry is precise and system-detected, not human-declared.

OWNERSHIP:
Fully automated — every action (capture, parse, reject-format, parse-failed, parsed) is unmarked (no execution:"human"/"communication" anywhere in this workflow). There is no queue, assigned owner, or team; the 'owner' is the parsing pipeline itself.

ASSIGNMENT / QUEUE:
N/A — no human queue or routing; single automated pipeline stage.

DATA:
Intake id, source, submitting actor/system, receipt time, declared type, expected schema/version 'where known', and target context — all captured at a.capture with clear provenance (the submission itself).

EVIDENCE:
N/A — structural parsing is deterministic, not an evidentiary judgment.

AUTHORITY / APPROVAL:
N/A — reject/parse-fail are deterministic outcomes of format/structure checks, no approval step.

IDEMPOTENCY:
Not addressed inside this workflow: actions only append to intake_log, no idempotencyKey declared, and by design a resubmission is treated as a brand-new intake rather than deduped — so duplicate-submission collision (two uploads of the same artifact racing) is unaddressed here and would need to be handled upstream or mapped explicitly.

SLA / TIME:
N/A — no wait nodes, synchronous/system-paced by design.

ESCALATION:
N/A — no escalation path; both failure exits simply await a fresh, corrected resubmission.

CANCELLATION / SUPERSESSION:
N/A — each parse either completes or fails atomically ('never partially mutated'); nothing to cancel mid-flight.

HANDOFFS:
- h.validate → DAT-222: carries ["the staging representation, the declared type and the target context","the explicit fact that nothing has been validated and no production state has been touched"]

COMPLETION:
No local success-exit node exists — the successful path flows straight into the h.validate handoff rather than a terminal state of its own. Only the two failure paths (x.rejected, x.parse-failed) are named exits, both explicitly non-terminal.

RESULT / FEEDBACK:
N/A — this is the corpus entry point for data intake; nothing downstream reports back into it.

CORRECTION / REOPEN:
No in-place correction concept: any resubmission, corrected or not, is a fresh, independently-assessed intake. Consistent with the 'nothing touched' guarantee.

OBSERVABILITY / AUDIT:
intake_log append at every step, including submitting actor/time on capture and actionable diagnostics on both rejection paths — adequate for a pipeline stage.

CONSUMER COVERAGE:
Classification: event-driven. consumers: [] in the dump — DAT-221 is the corpus's data-intake entry point, triggered by an external submission event rather than by another canonical workflow's handoff, which is the expected shape for an entry point, not an orphan.

TEST CASES:
- [duplicate-creation] Given: two submissions of the same underlying file arrive close together → Expect: both become independent intakes; no dedup exists in this workflow, so a company relying on this alone will process the file twice
- [missing-evidence] Given: a partial upload still being written appears in the intake location → Expect: not treated as a valid submission per insufficientAlone
- [handoff] Given: a payload parses successfully → Expect: h.validate carries staging representation + type + target context, satisfying DAT-222's own entry requirement

GAPS:
- P2 (other): No instanceKey/concurrency declared — honestly attributable to predating the convention, not a unique defect.
- P2 (idempotency): No collision/dedup policy for two near-simultaneous submissions of the same artifact; each becomes its own intake by explicit design, which may be intentional but should be mapped if unwanted.

---

## DAT-222 — Data Validation

READINESS: READY_WITH_MAPPING

WHY:
The classification and acceptance-semantics logic is precise, and ambiguous values or undefined semantics are correctly escalated rather than guessed. The main open point is that the graph never shows how a DEC-181 decision on an escalated case re-enters validation — worth mapping explicitly rather than assuming an automatic resume.

RESPONSIBILITY:
Validate a parsed dataset against schema and business rules, classify records VALID/INVALID/AMBIGUOUS, apply the import's atomic-or-partial acceptance semantics, and route what it cannot safely decide to a human decision authority.

INSTANCE:
Scope is 'the parsed dataset and the target's schema and business rules'; no instanceKey declared. One validation pass per triggering parse; the workflow does not state what happens if the same parsed intake is re-triggered for validation twice (re-validation idempotency is asserted only by the fact that validation itself doesn't mutate the target).

ENTRY:
Trigger input_successfully_parsed, authoritative, requires a parsed staging representation against an identified target — matches DAT-221's own h.validate carry exactly, and DAT-225's h.revalidate carry (corrected records only).

OWNERSHIP:
Fully automated classification and routing; the only human touchpoint is via the two DEC-181 handoffs (h.resolve for ambiguous records, h.review for undefined acceptance semantics) — ownership genuinely transfers to DEC-181's decision-request case for those two situations, not resolved locally.

ASSIGNMENT / QUEUE:
N/A within DAT-222 itself; DEC-181 (a named queue-owning decision hub, 'one open case per unresolved decision scope') owns routing once escalated.

DATA:
Required fields, types, identifiers, references, allowed values, business invariants, scope, version compatibility, duplicate semantics — comprehensive and clearly sourced from the parsed staging representation and the target's own schema/rules.

EVIDENCE:
Per-record classification is a deterministic rule evaluation (system inference), correctly NOT silently coerced when genuinely ambiguous — the guardrail 'ambiguous values are never silently coerced' is honored structurally via the c.ambiguous branch, not just asserted in prose.

AUTHORITY / APPROVAL:
DAT-222 never decides ambiguous/undefined-semantics cases itself — both defer to DEC-181, the generic decision authority. No self-approval risk: the workflow that discovers the ambiguity is not the one resolving it.

IDEMPOTENCY:
No idempotencyKey declared on any action (append-only intake_log writes); re-running validation doesn't mutate the target so risk is low, but this is asserted by absence of mutation rather than a declared idempotent-write mechanism.

SLA / TIME:
N/A — no wait nodes or timeouts in this workflow; SLA lives with DEC-181 once escalated.

ESCALATION:
Single-hop escalation to DEC-181 for both ambiguous records and undefined semantics; no loop risk inside DAT-222 itself.

CANCELLATION / SUPERSESSION:
N/A — no in-flight cancellable work; reject-all is a deterministic outcome of atomic semantics.

HANDOFFS:
- h.resolve → DEC-181: carries ["the ambiguous records, and for each the readings it could take","the explicit fact that nothing was coerced and no mutation has occurred"]
- h.review → DEC-181: carries ["the valid and invalid scope as classified","the explicit fact that no acceptance semantics were assumed - guessing produces a partly-loaded target nobody chose and nobody can identify afterwards"]
- h.preview → DAT-223: carries ["the validated scope as a versioned change set, and the quarantined scope separately","the explicit fact that validity is not authorization - nothing has been approved to mutate anything"]

COMPLETION:
Two shapes: reject-all reaches x.rejected (non-terminal, re-entry = new intake); accept flows straight into h.preview with no local success-exit node (same funnel pattern as DAT-221). Quarantine has no distinct exit/state of its own — quarantined records are folded into a.accept's forward flow rather than surfaced as a separately named outcome.

RESULT / FEEDBACK:
DAT-223 consumes the accepted result correctly. There is no modeled node in DAT-222 for a DEC-181 decision coming back — once escalated, the graph doesn't show validation resuming; this is consistent with handoffs elsewhere in the corpus being one-way control transfers rather than callbacks, but a company should not assume an automatic return path exists here.

CORRECTION / REOPEN:
x.rejected re-entry is explicitly a fresh intake and fresh validation, never a reopen of the rejected pass.

OBSERVABILITY / AUDIT:
intake_log appends at every action, including per-record classification — reasonable for tracing what happened to any given record.

CONSUMER COVERAGE:
Classification: active. Two real handoff consumers: DAT-221 (h.validate) and DAT-225 (h.revalidate, corrected records only, explicitly excluding the successful scope) — both carry a staging/corrected representation satisfying t.parsed's evidence requirement. Minor provenance nuance: DAT-225's corrected records go straight to DAT-222 without an explicit re-run of DAT-221's structural parse step, implicitly assuming the correction is already structurally well-formed.

TEST CASES:
- [missing-evidence] Given: a value or mapping could resolve two different ways → Expect: halted and routed to DEC-181 rather than coerced
- [approval] Given: an import's atomic-vs-partial acceptance semantics are not defined anywhere → Expect: routed to DEC-181 rather than a default (e.g. assuming atomic) being assumed
- [handoff] Given: a change set is accepted → Expect: h.preview carries the versioned scope + quarantined scope + 'not yet authorized' flag, matching DAT-223's entry

GAPS:
- P1 (handoff-provenance): No node models how a DEC-181 decision on an escalated ambiguous-record or undefined-semantics case re-enters (or finally resolves) validation; a company must define this binding explicitly rather than assume the graph implies a callback.
- P2 (completion): Quarantine has no distinct exit/state node — it rides inside a.accept's forward path rather than being a separately auditable outcome.
- P2 (other): No instanceKey/concurrency declared.

---

## DAT-223 — Data Change Approval

READINESS: READY_WITH_MAPPING

WHY:
Three-tier authority (unattended-if-routine / requester-confirmation-if-within-threshold / DEC-181-if-crossing-threshold) is well separated, and freshness is explicitly re-checked (a.recheck/c.still/a.regenerate) before execution — a strong, correctly-applied freshness-before-execution pattern. Only the threshold policy and the confirmation-window duration need mapping to real values.

RESPONSIBILITY:
Compute and present the actual delta a validated change set would apply, gate it through the right tier of authority based on threshold, re-verify the delta is still current before executing, and expire unconfirmed changes rather than letting a stale preview auto-apply.

INSTANCE:
Scope is 'the validated change set and the target state it would mutate'; no instanceKey. Confirmation binds explicitly to the specific change-set version, not the import in general — re-computed deltas require re-confirmation (a.regenerate → a.present again), so a stale confirmation can never carry over to a different mutation.

ENTRY:
Trigger validated_change_set_ready_to_mutate, authoritative, requires a validated change set with identified target scope; insufficientAlone correctly excludes an unvalidated set or a read-only one. Matches DAT-222's h.preview carry precisely.

OWNERSHIP:
Three distinct authority tiers, not collapsed: routine-and-authorized-unattended changes skip human confirmation entirely (c.confirmation 'It does not' → straight to h.execute); within-threshold changes are confirmed by the requesting party (a.present is the one action in this whole batch explicitly marked execution:"human"); threshold-crossing changes are decided by DEC-181, a distinct authority from the requester. Requester self-approval is only permitted for the low-risk tier the workflow itself defines as sufficient — it cannot self-approve a threshold-crossing change.

ASSIGNMENT / QUEUE:
channels: ["task"] — confirmation/decision work is task-routed; DEC-181 owns its own queue for the escalated tier.

DATA:
The computed delta (creates/updates/deletes/conflicts/unchanged/relationship changes/downstream effects), with destructive changes surfaced explicitly rather than folded into an aggregate count.

EVIDENCE:
N/A — this is an approval/confirmation workflow, not an investigative one; the 'evidence' is the delta itself, which the workflow takes pains to make complete and non-misleading.

AUTHORITY / APPROVAL:
Explicit self-approval discipline: requester confirmation is only sufficient below a stated risk/destructiveness/policy threshold; crossing it requires DEC-181, a distinct decision authority. Confirmation is version-bound (a.present binds to the exact change-set version), so a later-regenerated delta requires a fresh confirmation rather than inheriting the old one.

IDEMPOTENCY:
h.execute carries the exact confirmed change-set version and authorization bound to that version, so DAT-224 'can refuse to apply anything else' — correct version-locking on the handoff.

SLA / TIME:
w.confirm times out after 'the window this change set remains valid against the target' → a.expired → x.expired. The duration itself is not a number (correctly, per house rule) but is also not tied to a named captured field the way, e.g., TIM-66's review-date is — an implementer has nothing concrete to map the window to.

ESCALATION:
N/A — no escalation loop; threshold routing to DEC-181 happens once, upfront, not as an escalation from a prior tier.

CANCELLATION / SUPERSESSION:
a.rejected records rejection + reason, applies nothing; x.rejected and x.expired are both non-terminal, and re-entry for either is explicitly a fresh validation + fresh preview, not a resubmission of the same one — the stale preview can never silently be revived.

HANDOFFS:
- h.decide → DEC-181: carries ["the delta as it would actually apply, with the destructive scope named separately from the total","the change-set version, so the decision binds to this mutation rather than to the import in general"]
- h.execute → DAT-224: carries ["the exact change-set version that was previewed and confirmed","the authorization, bound to that version, so execution can refuse to apply anything else"]

COMPLETION:
N/A in the approval sense — this workflow's 'done' state is simply handing off an authorized mutation; actual completion is DAT-224's to prove.

RESULT / FEEDBACK:
DAT-224 is the real consumer of the authorized outcome; DEC-181 is the consumer of a threshold-crossing decision request.

CORRECTION / REOPEN:
N/A — no correction step; rejection and expiry both point forward to a fresh validation/preview rather than reopening this one.

OBSERVABILITY / AUDIT:
intake_log appends at delta computation, surfacing, presentation, rejection, recheck, regeneration, and expiry — a fairly complete trail of what was shown and when.

CONSUMER COVERAGE:
Classification: active. DAT-222 is the sole, well-formed handoff consumer via h.preview, matching DAT-223's own trigger requirement exactly.

TEST CASES:
- [self-approval] Given: a change crosses the destructiveness/scope threshold → Expect: routed to DEC-181, not confirmable by the requesting party alone
- [stale-work] Given: the target moves after the delta was presented but before confirmation → Expect: a.recheck/c.still detects it and a.regenerate presents a fresh delta requiring fresh confirmation
- [handoff] Given: a change set is confirmed and re-verified current → Expect: h.execute carries the exact version + bound authorization to DAT-224

GAPS:
- P2 (sla-escalation): The confirmation window's duration is referenced only as 'the window this change set remains valid against the target' with no named captured field to map it to, unlike comparable timeouts elsewhere in this batch (e.g. TIM-66's recorded expiry/review date).

---

## DAT-224 — Import Execution

READINESS: READY_WITH_MAPPING

WHY:
Outcome handling (applied/partial/rollback-clean/rollback-incomplete) is comprehensive and correctly treats 'unknown' per-record outcomes as their own category routed to recovery/reconciliation rather than forced into success or failure. The idempotency mechanism that is this workflow's whole reason for existing is asserted only in prose, never captured as a structured field — worth mapping precisely.

RESPONSIBILITY:
Apply a frozen, validated change set to production idempotently at record grain, recording every record's outcome, and route mixed or ambiguous results onward rather than silently classifying the whole run as success or failure.

INSTANCE:
Scope is 'the import job and the frozen change set it applies'; no instanceKey declared. Per-record operation identity ('derived from the change set and the record') is the stated duplicate-prevention mechanism, but it exists only as prose in a.identity's does text — no idempotencyKey is set on any action node in the raw source (verified: zero idempotencyKey/attemptBudget/execution fields anywhere in data.ts's DAT-224 block).

ENTRY:
Trigger import_authorized_for_execution, authoritative, requires a confirmed change set with authorization bound to its version — matches DAT-223's h.execute carry.

OWNERSHIP:
Fully automated — no execution:"human" marker anywhere in this workflow; it is a pure execution job with no queue or named team.

ASSIGNMENT / QUEUE:
N/A — no human routing.

DATA:
Frozen input/change-set version (a.freeze), stable per-record operation identity (a.identity), per-record outcome taxonomy (created/updated/unchanged/skipped/failed/unknown).

EVIDENCE:
N/A — not a review workflow; per-record outcomes are direct system observation of the apply operation itself.

AUTHORITY / APPROVAL:
N/A — authorization already happened upstream (DAT-223); this workflow only executes what was already authorized and version-bound.

IDEMPOTENCY:
The guardrail 'a retry never duplicates created records' is real and load-bearing, backed by a described stable per-record identity — but it is expressed entirely in prose (does text), never as a declared idempotencyKey/attemptBudget attribute on the action nodes, unlike the schema explicitly supports. A company implementing this has to invent the concrete key shape themselves.

SLA / TIME:
N/A — no wait nodes; execution is synchronous/system-paced.

ESCALATION:
N/A — no escalation path within this workflow; unresolved outcomes route to DAT-225 (recovery) or external reconciliation, not to a human escalation tier.

CANCELLATION / SUPERSESSION:
Rollback undoes only this operation's own mutations ('anything that happened to those records from another source in the meantime is not this import's to revert') — correctly scoped, not a blanket revert.

HANDOFFS:
- h.recover → DAT-225: carries ["the per-record outcomes, and which of them are confirmed successful","the frozen change-set version and the stable operation identities, so any retry targets the same operations"]
- h.reconcile → external:external-status-reconciliation: carries ["which mutations were reverted, which were not, and which are unknown","the explicit instruction that the import is not re-run until the target's actual state is established"]

COMPLETION:
x.applied and x.rolled-back are both explicitly non-terminal: x.applied's re-entry states an error discovered later is 'a transformation error with its own correction path' (DAT-230) rather than a re-run of this import — a clean technical-completion-is-not-immune-to-later-error distinction, matching the OPS-130 precedent (technical completion is recorded per-record; a later-discovered problem is a different obligation with its own path, not a reopening of this one).

RESULT / FEEDBACK:
Consumed by DAT-225 (mixed outcomes) and, for unresolvable rollback state, by external reconciliation — both real, well-formed.

CORRECTION / REOPEN:
A corrected dataset is explicitly 'a new import', never a re-run of the failed one; the failed attempt stays in the record.

OBSERVABILITY / AUDIT:
import_log appends at freeze/identity/apply/applied/partial/rollback, with per-record execution history explicitly required so the import 'can be audited, corrected or partially undone'.

CONSUMER COVERAGE:
Classification: active. DAT-223 is the sole, well-formed handoff consumer via h.execute, matching DAT-224's own entry exactly.

TEST CASES:
- [duplicate-creation] Given: a partly-failed import is retried → Expect: stable per-record identity prevents duplicating records that already succeeded (mechanism asserted in prose, not a declared field)
- [escalation] Given: an import completes with a mix of successful and unresolved records → Expect: h.recover routes to DAT-225 with the confirmed-successful subset protected
- [completion] Given: atomic semantics and a required mutation fails → Expect: a.rollback reverts only this operation's own mutations; incomplete/uncertain rollback routes to external reconciliation with re-execution suppressed

GAPS:
- P2 (idempotency): The per-record stable-identity mechanism central to this workflow's own guardrail is asserted only in prose (does text), never captured as a structured idempotencyKey — worth naming as a validator-opportunity candidate for the coordinator, not for implementation here.
- P1 (ownership): No stated protection against two concurrent authorization events for the same change-set version running import execution twice in parallel (a race between two triggers, not a sequential retry) — the per-record identity likely makes this safe if create-if-absent is atomic at the storage layer, but the workflow never states this, and no entity-level lock/claim on the import job itself is declared.

---

## DAT-225 — Partial Import Recovery

READINESS: NEEDS_CONTRACT_WORK

WHY:
The partition/protect/hold-unknown discipline is excellent and the completion contract correctly reports a shortfall rather than papering over it (matching the OPS-130 technical-vs-business-completion precedent). But the retry budget that gates a.close is referenced only as prose ('the attempts allowed for this import') with no Config/attemptBudget field anywhere in the source, and closing unresolved records as permanently unrecovered has no stated decision authority — both are consequential gaps a company cannot safely implement around without inventing values.

RESPONSIBILITY:
After an import completes with mixed per-record outcomes, protect the already-successful scope from any re-touch, hold genuinely unknown outcomes out of replay pending reconciliation, and route the rest to a technical retry, a data correction, or an honestly-recorded 'unrecovered' close.

INSTANCE:
Scope is 'the partially applied import and the per-record outcomes it produced'; no instanceKey. Per the task's carried-over context: this workflow explicitly declines to reuse OPS-126 (the Runtime Mechanism round's composite-job checkpoint/retry pattern) because DAT-225 operates at record grain against live production data, where 'a retry can create a duplicate row, a correction can silently alter a record that was already right, and the unresolved scope has to stay linked to the original import' — a materially different risk profile than a composite async job. This is DAT-225's own stated reasoning, not a re-derivation.

ENTRY:
Trigger import_completed_with_mixed_outcomes, authoritative, requires an import with per-record outcomes including at least one unresolved record — matches DAT-224's h.recover carry.

OWNERSHIP:
Fully automated: partition/protect/hold-unknown/retry/correct/close are all system decisions driven by the partition classification, with no execution:"human" marker and no named team or queue anywhere in this workflow.

ASSIGNMENT / QUEUE:
N/A — no human routing declared.

DATA:
Per-record outcomes (successful/retryable-failure/data-failure/unknown/skipped), frozen change-set version, stable per-record operation identities carried from the originating import.

EVIDENCE:
N/A — not a review workflow; outcome partitioning is a direct read of the prior execution's own recorded results.

AUTHORITY / APPROVAL:
No decision authority is named for c.route's own choices (technical retry vs. data correction vs. nothing recoverable) or for a.close's decision to permanently record a scope as unrecovered — unlike sibling workflows in this same file (DAT-222, DAT-223, DAT-226, DAT-229, DAT-230), which all route genuinely undecidable or consequential cases to DEC-181, DAT-225 has no equivalent escalation for 'should we give up on this record'.

IDEMPOTENCY:
Retry uses 'the same stable operation identity so a record that actually succeeded is not created a second time' — sound reasoning, but exactly like DAT-224, expressed only in prose, with no idempotencyKey field. The successful scope is explicitly excluded from replay entirely (not re-read/re-validated/re-applied), which is the strongest protection here.

SLA / TIME:
c.budget ('Does retry budget remain?') gates the retry-vs-close decision but the retry count itself is never declared anywhere in the source — not as a number (correctly, per house rule) and not even as a named Config/policy attribute the way TIM-66 ties its timeout to 'the exception's recorded expiry'. This is the sharpest concrete finding in this batch: a decision-gating value with literally no declared source.

ESCALATION:
N/A in the classic sense — no priority/owner escalation; c.route and c.budget route directly to retry, correction, or close without an intermediate escalation tier.

CANCELLATION / SUPERSESSION:
N/A — no in-flight work to cancel; retry/correct/close are terminal-per-record decisions on already-completed execution attempts.

HANDOFFS:
- h.reconcile → external:external-status-reconciliation: carries ["the unknown records, their stable operation identities and everything last known about them","the explicit instruction that no replay touches this scope until each record's actual state is known"]
- h.revalidate → DAT-222: carries ["the corrected records only, and the link to the import they are correcting","the explicit fact that the successful scope is excluded and must not be revalidated or reapplied"]

COMPLETION:
x.unrecovered explicitly preserves the successful scope and records the unresolved scope as unrecovered with per-record reasons — 'an import reported as done with a silent shortfall is worse than one reported as failed'. This correctly does not equate 'recovery workflow closed' with 'all submitted data landed', matching the OPS-130 precedent by name.

RESULT / FEEDBACK:
Consumed by DAT-224 (the originating import) via h.recover; itself hands corrected records back into DAT-222 and unknowns to external reconciliation.

CORRECTION / REOPEN:
x.unrecovered's re-entry is explicitly a fresh submission linked to the original import — traceable, not a silent reopen.

OBSERVABILITY / AUDIT:
import_log (and suppressed_sends for the unknown-hold step) capture partition, protection, retry, correction and closure — reasonably complete.

CONSUMER COVERAGE:
Classification: active. DAT-224 is the sole, well-formed handoff consumer via h.recover, matching DAT-225's own entry exactly.

TEST CASES:
- [duplicate-creation] Given: the unresolved scope is retried → Expect: the successful scope is never re-read, re-validated or re-applied
- [missing-evidence] Given: a record's application outcome is neither a confirmed success nor a confirmed failure → Expect: held out of any replay and routed to external reconciliation rather than guessed
- [escalation] Given: retry budget is exhausted → Expect: routed to a.close and recorded as unrecovered with per-record reasons, without any named decision authority reviewing the close

GAPS:
- P1 (sla-escalation): The retry budget gating c.budget/a.close is referenced only as 'the attempts allowed for this import' with no Config/attemptBudget field or named policy source anywhere in the canonical source — an implementer has nothing to map to, not even a vague pointer.
- P1 (authority-approval): Permanently closing unresolved, submitter-owned data as 'unrecovered' (a.close) has no stated decision authority or human review gate, unlike this same file's other consequential branches (all of which route to DEC-181).
- P2 (other): No instanceKey/concurrency declared.

---

## DAT-226 — Migration Readiness Validation

READINESS: READY_WITH_MAPPING

WHY:
The three-part readiness gate (unmapped states / semantic gap / undefined authority) is thorough and consistently escalates instead of assuming a default. The one real gap is that DAT-227's own entry requires 'an authority model AND an authorized run', but this workflow only ever produces the authority model (via c.authority) — no distinct 'authorize this run' action or fact exists anywhere in its graph, so a company must define who grants execution authorization separately.

RESPONSIBILITY:
Prove, before anything is moved, that every source state maps to a target representation, that the mapping preserves business meaning (not just fields), and that transitional authority during the migration is explicitly defined — halting rather than guessing on any of the three.

INSTANCE:
Scope is 'the migration, the source population and the target model'; no instanceKey. Readiness is explicitly a property of the mapping against the whole source population, not a sample — 'the states that break a migration are the rare ones, and a sample chosen for being typical excludes them by construction'.

ENTRY:
Trigger migration_planned, authoritative, requires a defined migration with identified source population and target model.

OWNERSHIP:
Fully automated definition/testing steps; all three failure modes (blocked mapping, semantic gap, no transitional authority) route to the same single decision hub, DEC-181 — consistent authority pattern across this whole file.

ASSIGNMENT / QUEUE:
N/A within this workflow; DEC-181 owns the escalated case queue.

DATA:
Migration scope, source of truth, target representation, field/state mappings, identifier strategy, relationship mappings, unsupported states, transformation rules, cutover model.

EVIDENCE:
N/A — not a review workflow; the checks (unmapped states, semantic equivalence, authority definition) are direct evaluations of the migration design itself.

AUTHORITY / APPROVAL:
c.authority explicitly checks whether the design states which system is authoritative during transition, and halts to DEC-181 rather than assuming a default (e.g. 'source stays authoritative until told otherwise') if not — correct discipline against inventing an authority default for something the source is explicit must never be assumed.

IDEMPOTENCY:
N/A — this is a design-time validation, not a mutating operation.

SLA / TIME:
N/A — no wait nodes.

ESCALATION:
N/A — single-hop escalation to DEC-181 for any of the three failure modes, no loop.

CANCELLATION / SUPERSESSION:
N/A — nothing is in flight to cancel; this is a pass/fail readiness check.

HANDOFFS:
- h.design → DEC-181: carries ["the specific gap - the unmapped states with their record counts, the semantics the target cannot carry, or the undefined authority model","the explicit fact that nothing has been migrated and no mapping was assumed to fill the gap"]
- h.execute → DAT-227: carries ["the mapping, the transformation rules and the identifier strategy","the explicit fact that a proven mapping is not a verified population - what arrives still has to be checked"]

COMPLETION:
No local exit node exists at all (exits: []) — this workflow is a pure funnel: every path either escalates to DEC-181 or hands off forward to DAT-227.

RESULT / FEEDBACK:
DAT-227 is the real consumer of a ready migration; DEC-181 is the consumer of any of the three gap types.

CORRECTION / REOPEN:
N/A — no terminal state of its own to reopen; a blocked migration is resolved via DEC-181, not via a re-entry into this workflow.

OBSERVABILITY / AUDIT:
migration_log appends at define/test/blocked/semantic-gap/no-authority/ready, naming counts and specific gaps rather than aggregate totals.

CONSUMER COVERAGE:
Classification: event-driven. consumers: [] — DAT-226 is triggered by an external migration-planning event, not by another canonical workflow's handoff; a reasonable entry point rather than an orphan.

TEST CASES:
- [missing-evidence] Given: a source state occurring in the population has no target mapping → Expect: blocked and routed to DEC-181 with the record counts named, not silently dropped
- [approval] Given: the migration design does not state which system is authoritative during the transition → Expect: halted (a.no-authority) rather than a default authority being assumed
- [handoff] Given: mapping and authority are both proven → Expect: h.execute hands DAT-227 the mapping/rules/identifier strategy — but not a distinct execution-authorization fact DAT-227's own entry names as required

GAPS:
- P1 (handoff-provenance): DAT-227's trigger evidence requires 'a migration recorded ready, with an authority model and an authorized run', but DAT-226 only ever produces the authority model (via c.authority) — no action or fact in this graph represents a distinct execution-authorization event. A company must map who/what actually authorizes the run, separate from readiness itself, or risk treating MIGRATION_READY as automatically sufficient to execute.

---

## DAT-227 — Migration Verification

READINESS: READY_WITH_MAPPING

WHY:
Verification explicitly checks entity counts, identity continuity, relationship integrity, financial totals, entitlement consistency and referential integrity, and treats an unevaluable check as a genuine third outcome rather than a pass — a correct application of the unknown-outcome discipline. The rollback/audit-window duration is referenced only as 'the plan defines', which is honestly undeclared rather than invented, but leaves the migration plan itself unmodeled anywhere in canonical scope.

RESPONSIBILITY:
Freeze the exact source scope, copy and transform it into the target, and verify the invariants that actually carry business meaning (not just row counts) before declaring the population ready to cut over — routing any failed or unverifiable check to reconciliation rather than treating 'unverifiable' as 'passed'.

INSTANCE:
Scope is 'the migration run, the frozen source scope and the target population it produced'; no instanceKey. The source scope is explicitly frozen at a.freeze so what is verified afterward is 'what was actually taken, rather than the source as it has become since' — a clean freshness discipline applied to the input rather than the decision.

ENTRY:
Trigger migration_execution_authorized, authoritative, requires a migration recorded ready with an authority model and an authorized run (see DAT-226's gap above for where the 'authorized run' fact is actually supposed to originate).

OWNERSHIP:
Fully automated copy/transform/verify pipeline; no execution:"human" marker anywhere, no queue or team.

ASSIGNMENT / QUEUE:
N/A.

DATA:
Frozen source scope + count, target outcomes, transform failures, relationship failures (tracked separately from transform failures since 'a record that arrives detached looks perfectly healthy on its own'), unknown outcomes.

EVIDENCE:
N/A in the review-workflow sense — but the invariant list is a genuine, named evidentiary standard: 'rows copied is not migration correct... count equality is the weakest possible check'.

AUTHORITY / APPROVAL:
N/A — verification itself is deterministic; only the reconcile branch (failed/unevaluable invariant) hands off to a downstream recovery workflow, not to an approval step.

IDEMPOTENCY:
N/A explicitly declared, but the frozen-scope discipline (a.freeze) is the functional equivalent of pinning inputs before a re-runnable operation.

SLA / TIME:
Source retention 'for the rollback and audit window the plan defines' — again honestly undeclared as a number, but also not tied to any named field in this workflow the way some TIM workflows tie their timeouts to a captured value; the migration plan itself is referenced by DAT-226, DAT-227 and DAT-228 alike but never modeled as a canonical object.

ESCALATION:
N/A — a single-hop handoff to DAT-230 for any failed/unevaluable invariant, no loop.

CANCELLATION / SUPERSESSION:
N/A — this is a one-shot copy+verify; nothing to cancel mid-verification is described.

HANDOFFS:
- h.reconcile → DAT-230: carries ["the failing or unevaluable invariant, its scope and the frozen source it was checked against","the explicit fact that no cutover has occurred, so the source is still authoritative"]
- h.cutover → DAT-228: carries ["the verified population, the invariants that were checked and the source still held","the explicit fact that a verified copy is not a cutover - the source is still the system that answers"]

COMPLETION:
No local exit node exists (exits: []) — another pure funnel, consistent with DAT-226's shape.

RESULT / FEEDBACK:
DAT-226 is a real, well-formed handoff sender (viaHandoff h.execute) and is also named in this workflow's own distinctFrom prose — a coherent, doubly-linked design-then-verify pair.

CORRECTION / REOPEN:
N/A — no local terminal state; failed verification routes forward to DAT-230 rather than looping back into this workflow.

OBSERVABILITY / AUDIT:
migration_log appends at freeze/copy/verify/discrepancy/unverifiable/verified, naming which invariant failed, by how much, and against which scope — good, avoids aggregate-total obscurity.

CONSUMER COVERAGE:
Classification: active. DAT-226 is the sole, well-formed handoff consumer via h.execute, and is also named reciprocally in DAT-227's own distinctFrom prose.

TEST CASES:
- [missing-evidence] Given: an invariant check cannot be run against the migrated population at all → Expect: recorded as unverifiable and routed to DAT-230, never silently treated as passed
- [handoff] Given: verification succeeds → Expect: h.cutover carries the verified population + checked invariants + retained source to DAT-228, explicitly not claiming cutover has occurred
- [escalation] Given: an invariant fails → Expect: the specific failing invariant, its magnitude and scope are named and routed to DAT-230 rather than reported as an aggregate failure

GAPS:
- P2 (sla-escalation): The rollback/audit-retention window is deferred to 'the plan defines' with the migration plan itself never modeled as a canonical object — a cross-cutting mapping task shared with DAT-226/DAT-228, worth noting once rather than three times.
- P1 (handoff-provenance): Inherits DAT-226's gap: this workflow's own trigger requires an 'authorized run' fact that DAT-226 never produces as a distinct output.

---

## DAT-228 — Cutover Stabilization

READINESS: NEEDS_CANONICAL_CHANGE

WHY:
The authority-switch discipline itself (single-authoritative-system, rollback-defined-before-relying-on-it, timeout-as-success on the observation window) is the strongest-reasoned logic in the batch. But a.rollback's own does-text asserts an action — preserving the target's cutover-window writes 'so nothing written there is simply lost' — that has no consuming handoff or workflow anywhere in the graph, unlike the parallel forward-correction path which explicitly hands off to DAT-230 via h.correct. This is a named action whose promised outcome has nowhere to go, which is closer to a missing required operation than a mapping gap.

RESPONSIBILITY:
Switch which system is authoritative exactly once, with a pre-defined rollback path, controlled dual-authority prevention during the switch, an observation window before declaring stability, and a rollback-vs-forward-correction decision once live writes are at stake.

INSTANCE:
Scope is 'the migration, the source system or state, and the target that would replace it'; no instanceKey. 'Exactly one side is authoritative at any moment. Dual authority is the failure this journey exists to prevent, not a transitional convenience' — a strong, explicit single-instance invariant even without a formal instanceKey.

ENTRY:
Trigger verified_target_ready_for_cutover, authoritative, requires a verified migrated population with invariants checked; insufficientAlone correctly excludes 'a migration copy completing' alone — matches DAT-227's h.cutover carry.

OWNERSHIP:
Fully automated authority-switch mechanics; c.rollback-defined and c.recovery are system-evaluated decisions, not human ones, though the underlying rollback-window/plan values are presumably set by a human migration owner upstream (out of this workflow's scope).

ASSIGNMENT / QUEUE:
N/A — no human routing declared within this workflow.

DATA:
Cutover boundary (scope/moment/write-control method), write-control state, observed critical-failure signal, rollback plan capability, dependent-state recalculation.

EVIDENCE:
N/A — not a review workflow; 'critical failure detected' is a direct system observation, not adjudicated evidence.

AUTHORITY / APPROVAL:
c.rollback-defined explicitly halts to DEC-181 if rollback semantics aren't defined before cutover, rather than proceeding and discovering there's no way back mid-incident — a correct, load-bearing gate.

IDEMPOTENCY:
N/A in the mutation-retry sense — this is a one-time authority switch, not a re-runnable record-level operation; a.apply-equivalent duplicate concerns don't apply here.

SLA / TIME:
w.observe times out after 'the observation window the plan defines' → a.stable. Unusually and correctly, timeout here is the intended, successful outcome ('passing it without a critical failure is the intended outcome and is what makes the cutover stable') — not a failure/escalation path, which is worth citing as a deliberately correct design rather than a defect.

ESCALATION:
N/A in the classic sense; c.recovery routes directly to rollback or forward correction based on what has already happened, not via an escalation tier.

CANCELLATION / SUPERSESSION:
Rollback explicitly records everything the target accepted during the cutover window 'so nothing written there is simply lost' — but that recorded data has no defined downstream consumer or reconciliation path (see gap below), unlike the forward-correction branch which names DAT-230 explicitly.

HANDOFFS:
- h.decide → DEC-181: carries ["the verified target and what is known about reversibility","the explicit fact that relying on an undefined rollback means discovering during an incident that there is no way back"]
- h.correct → DAT-230: carries ["what failed, what the target has accepted since the switch, and which invariants are currently violated","the explicit fact that the target is authoritative, so the correction runs against live state rather than against a staging copy"]

COMPLETION:
x.authoritative (TARGET_AUTHORITATIVE) is a genuine completion — the point 'at which the old system stops being the answer to anything', explicitly distinguished from mere copy-completion. x.rolled-back is non-terminal with re-entry text gesturing at reconciliation 'on its own terms' — but no named handoff backs that reconciliation the way the forward path names DAT-230.

RESULT / FEEDBACK:
DAT-227 is the sole real handoff sender (h.cutover); this workflow itself sends onward to DEC-181 or DAT-230 depending on path.

CORRECTION / REOPEN:
Post-stabilization problems are corrected forward against the live target (implied, consistent with the corpus's general reEntry-prose pattern rather than an explicit handoff edge, which is standard elsewhere in this batch and not itself a gap).

OBSERVABILITY / AUDIT:
migration_log appends at boundary/control-writes/switch/rollback/forward/stable — good coverage of the switch mechanics themselves.

CONSUMER COVERAGE:
Classification: active. DAT-227 is the sole, well-formed handoff consumer via h.cutover, and is also named reciprocally in DAT-228's own distinctFrom-style relationship (viaDistinctFrom: true).

TEST CASES:
- [approval] Given: cutover is proposed with no defined rollback semantics → Expect: halted to DEC-181 before the authority switch happens, not discovered mid-incident
- [cancellation] Given: the target has taken live writes that a rollback would discard → Expect: forward correction (a.forward) is chosen over rollback, and routed to DAT-230
- [reopen] Given: a rollback is executed after the target accepted cutover-window writes → Expect: those writes are recorded as preserved, but no workflow or handoff actually reconciles them

GAPS:
- P0 (handoff-provenance): a.rollback's own does-text commits to preserving the target's cutover-window writes for reconciliation, but no handoff or workflow anywhere in this graph consumes that preserved data — unlike the parallel forward-correction path, which explicitly names DAT-230. A rollback can silently strand live business writes with no defined path to recover them, which is exactly the 'reverse a completed effect' hazard this workflow's own guardrails warn against.

---

## DAT-229 — Historical Backfill

READINESS: NEEDS_CONTRACT_WORK

WHY:
The window-bounding and side-effect-suppression discipline is strong and correctly escalates when the suppression list isn't defined. But a.reconcile-current is described in its own prose as 'a deliberate correction with consequences somebody has to own — not a side effect of a data load nobody reviewed', yet the graph routes straight into it as an unmarked, unowned action with no execution:"human" marker and no handoff to any decision authority — a direct, named contradiction between the workflow's own stated intent and what the graph actually models, matching the P0 pattern 'approval authority is undefined for a consequential decision'.

RESPONSIBILITY:
Fill a defined, bounded gap in historical data while suppressing the real-time side effects those events would have triggered had they happened live, and deliberately reconciling any bearing on current authoritative state rather than letting the load silently recompute it.

INSTANCE:
Scope is 'the backfill, its defined window, and the target records inside it'; no instanceKey. 'The window is exact. A backfill without a bounded scope is an unbounded rewrite that nobody can verify closed anything' — a strong bounding discipline even without a formal key.

ENTRY:
Trigger historical_gap_identified, authoritative, requires an identified missing window or scope in a historical dataset.

OWNERSHIP:
Mostly automated (define/suppress/load/verify), with one critical exception: a.reconcile-current, which its own does-text frames as requiring deliberate human ownership of consequences ('a balance that should have been different for six months... somebody has to own') but which is modeled as an unmarked automated action with no handoff to DEC-181 or any other authority, unlike the parallel c.side-effects gate which correctly escalates when undefined.

ASSIGNMENT / QUEUE:
N/A as modeled — though the a.reconcile-current gap above means a company should map an explicit approver here even though the graph doesn't name one.

DATA:
Missing window/scope, source, target records, business purpose, and — critically — which real-time side effects to suppress vs. preserve.

EVIDENCE:
N/A — this is a data-repair workflow, not an investigative one; the 'evidence' is the identified gap itself.

AUTHORITY / APPROVAL:
c.side-effects correctly halts to DEC-181 if the suppression list is undefined, before any load happens — good discipline. But a.reconcile-current, arguably the more consequential of the two judgment points (it can change a balance, entitlement, or status that is currently authoritative), has no equivalent gate at all.

IDEMPOTENCY:
a.load is explicitly keyed so re-running the backfill 'fills the same gap rather than doubling it', and historical timestamps are explicitly preserved rather than restamped — sound, though again prose-only, not a declared idempotencyKey.

SLA / TIME:
N/A — no wait nodes.

ESCALATION:
Single-hop escalation to DEC-181 for undefined suppression policy; no equivalent path exists for the reconcile-current decision (see gap above).

CANCELLATION / SUPERSESSION:
N/A — this is a bounded, one-shot repair; nothing described as cancellable mid-flight.

HANDOFFS:
- h.review → DEC-181: carries ["the window, the scope and the effects the historical events would originally have triggered","the explicit fact that nothing was inferred from the data - getting this wrong sends real messages to real people about things that happened months ago"]
- h.reconcile → DAT-230: carries ["the intended window, what was actually written and where the duplicates or gaps are","the explicit fact that the load was idempotent by key, so the discrepancy is in the scope rather than in repeated application"]

COMPLETION:
x.backfilled explicitly confirms historical timestamps preserved and obsolete side effects suppressed — a real completion contract, not just 'load finished'.

RESULT / FEEDBACK:
DAT-230 consumes a backfill that didn't close cleanly; DEC-181 consumes an undefined-suppression case.

CORRECTION / REOPEN:
A further gap is explicitly its own backfill with its own window; re-running this one fills the same gap rather than doubling it.

OBSERVABILITY / AUDIT:
backfill_log (and suppressed_sends) appends at define/suppress/load/reconcile-current/verify — reasonable trail, though the reconcile-current step's decision-maker is not identifiable from the audit trail as modeled.

CONSUMER COVERAGE:
Classification: event-driven. consumers: [] — DAT-229 is triggered by an identified-gap event, presumably from an internal audit/detection process rather than a canonical handoff; a reasonable entry point.

TEST CASES:
- [approval] Given: no suppression list is defined for a backfill's real-time side effects → Expect: routed to DEC-181 rather than a default (send everything, or suppress everything) being assumed
- [correction] Given: a backfilled event bears on current authoritative state (a balance, status, entitlement, or count) → Expect: reconciled deliberately, decision by decision — but the graph names no decision authority for this, contradicting its own stated intent
- [handoff] Given: the backfill does not close its window cleanly (duplicates or gaps remain) → Expect: routed to DAT-230 with the intended window, what was actually written, and where the discrepancy is

GAPS:
- P0 (authority-approval): a.reconcile-current is described in its own prose as a consequential correction 'somebody has to own', but is modeled as an unowned, unmarked automated action with no handoff to DEC-181 or any decision authority — a direct contradiction between the workflow's stated intent and its actual graph, matching the P0 pattern of undefined approval authority for a consequential decision.
- P2 (handoff-provenance): DAT-230's entry evidence names 'an import, migration or bulk transformation' as the source of wrong data; a backfill isn't explicitly one of those three, a minor vocabulary gap worth tightening.
- P2 (other): No instanceKey/concurrency declared.

---

## DAT-230 — Transformation Error Recovery

READINESS: READY_WITH_MAPPING

WHY:
The decision tree correctly separates 'can we determine the right values' from 'have legitimate later changes happened' from 'did this produce downstream consequences', escalating to DEC-181 exactly where the source itself says the choice is genuinely undeterminable — a strong, disciplined pattern. The one real gap is the absence of any stated protection against two concurrent instances opening over overlapping affected-record scopes.

RESPONSIBILITY:
Given a discovered wrong data mutation, determine whether legitimate later changes overlap the affected scope, choose a deterministic correction, a scoped rollback, or a roll-forward reconciliation accordingly, always preserving the erroneous operation in history, and hand off any downstream consequences to a separate remedy process.

INSTANCE:
Scope is 'the erroneous data change operation and the records it affected'; no instanceKey. This is the corpus's shared reconciliation hub for data workflows — receiving from DAT-227, DAT-228 and DAT-229 alike (confirmed by consumers).

ENTRY:
Trigger material_transformation_error_discovered, authoritative, requires evidence an import/migration/transformation produced wrong data — matches all three upstream carries.

OWNERSHIP:
Fully automated decision tree, with two genuinely undecidable branches (no determinable correction/rollback; unclear authority to choose between roll-forward and rollback) both routed to DEC-181 rather than guessed.

ASSIGNMENT / QUEUE:
N/A within this workflow; DEC-181 owns the escalated-case queue.

DATA:
The erroneous operation and its version, affected scope, original values, current values, downstream side effects, and — decisively — the legitimate changes that have happened to those records since ('that last one decides everything that follows').

EVIDENCE:
N/A in the review sense — the 'evidence' is the identify step's own determination of subsequent legitimate change, which correctly gates every downstream branch.

AUTHORITY / APPROVAL:
Both genuinely undecidable situations (no determinable correction/rollback path; unclear authority when correcting or reverting would each override someone's legitimate work) correctly escalate to DEC-181 rather than the workflow guessing.

IDEMPOTENCY:
N/A directly — this is a decision/correction-routing workflow, not itself a retryable mutation; a.correct explicitly creates a new operation with its own identity and lineage rather than editing in place.

SLA / TIME:
N/A — no wait nodes.

ESCALATION:
N/A in the loop sense — h.decide is a single-hop escalation for genuinely undeterminable cases, no A→B→A pattern.

CANCELLATION / SUPERSESSION:
a.rollback explicitly reverts 'only this operation's own scope', not everything created since; a.roll-forward explicitly avoids restoring an old snapshot over legitimate later work — both correctly separate 'undo the wrong mutation' from 'discard everything that happened after it'.

HANDOFFS:
- h.decide → DEC-181: carries ["the erroneous operation, the affected scope, what has legitimately changed since and the options considered","the explicit fact that no snapshot was restored and nothing was overwritten while this is decided"]
- h.remedy → REM-157: carries ["what acted on the wrong values, when, and what the corrected values are","the explicit fact that the data is corrected and the consequences are not - those are their own obligation"]

COMPLETION:
x.corrected preserves the erroneous operation alongside its correction rather than rewriting history — 'the wrong transformation happened, and a record showing only the corrected state cannot explain why anything downstream acted on the wrong one'. This is the OPS-130 precedent applied precisely: the data being corrected is not the same as the consequences being resolved, and the two are explicitly routed separately.

RESULT / FEEDBACK:
REM-157 consumes downstream-consequence remediation; DEC-181 consumes genuinely undeterminable correction/authority cases.

CORRECTION / REOPEN:
A further error in the same lineage is explicitly assessed with this correction as part of its history — nothing is removed, so lineage stays intact for any future correction.

OBSERVABILITY / AUDIT:
correction_log appends at identify/correct/rollback/roll-forward/preserve — the preserve step specifically exists to keep the audit trail honest about what was wrong and for how long.

CONSUMER COVERAGE:
Classification: active. Three real handoff consumers — DAT-227 (h.reconcile), DAT-228 (h.correct), DAT-229 (h.reconcile) — all carrying evidence that satisfies DAT-230's own entry requirement; this is the shared reconciliation hub for the whole data-workflow file.

TEST CASES:
- [correction] Given: the right values can be deterministically derived from source and error, with no subsequent legitimate changes → Expect: a.correct creates a new, lineage-linked correction rather than editing the record in place
- [escalation] Given: correcting or reverting would each override someone's legitimate later work and the authority to choose is unclear → Expect: routed to DEC-181 rather than the workflow choosing
- [handoff] Given: the erroneous data already produced downstream consequences (messages sent, decisions made) → Expect: routed to REM-157; the data correction itself does not claim to resolve those consequences

GAPS:
- P1 (consumer-coverage): No stated concurrency protection for two instances of this workflow opening over overlapping affected-record scopes at the same time (e.g. two people reporting overlapping bad-data incidents) — unlike DEC-181 itself, which explicitly states 'one open case per unresolved decision scope', DAT-230 has no equivalent guarantee, so two concurrent instances could independently choose different, conflicting corrections (one rollback, one roll-forward) over the same records.

---

## DEC-181 — Decision Request

READINESS: NEEDS_CONTRACT_WORK

WHY:
The core intake logic (dedupe, validity, deterministic-policy filter, scope statement) is precise and well-guarded. But this workflow is the corpus's general escalation sink — dozens of Runtime Mechanisms and Operational Workflows (OPS-131, CTL-231, CTL-238, REL-95/96/97/99/100, DAT-222/223/226/228/229/230, RSK-191..200, DOC-212..220, INT-115..119, SUB-163..169, FIN-137, REM-152/154/159, TIM-67, and others) hand off into it — and its own intake schema (a.capture's 'requester' field, c.valid's 'requester standing' check, w.info's wait for the requester to 'supply information' or 'withdraw') is written entirely in the vocabulary of a human/customer-submitted approval request. It has no distinguished path for a mechanism- or operational-workflow-sourced referral (a precedence tie, an undefined atomicity, an ownerless-governance gap, an ambiguous data merge) where there is no requester to validate standing for, and no interactive party able to supply missing information or withdraw.

RESPONSIBILITY:
Front-door intake for any case genuinely requiring authorized human judgment: validates the request, dedupes against an open case over the same scope, filters out cases policy could already decide, and opens a scoped case handed to DEC-182 for assignment.

INSTANCE:
Scope = the decision request and the business entity/state it concerns. No entity.instanceKey is declared (this workflow predates that convention, noted honestly rather than as a defect); identity is instead enforced procedurally via c.duplicate ('does an open case already cover this scope'), with one open case per unresolved scope and a second request linked rather than opened in parallel.

ENTRY:
Trigger authorized_decision_required is authoritative and precisely scoped ('an action or state that cannot proceed without an authorized judgment'), explicitly excluding two common false positives (system uncertainty that is really a missing rule; a request being merely unusual). Entry is authoritative for the human/requester-shaped case. For the ~30 mechanism/operational senders, entry is only loosely precise: their handoffs carry a well-formed scope and reason but not a 'requester', 'requested action', or 'authority the decision requires' in the shape a.capture expects.

OWNERSHIP:
This workflow deliberately does not establish review ownership itself — h.assign to DEC-182 carries 'no review has started and no outcome is implied by the case existing', and DEC-182 is where a claimed owner is actually established. That separation is clean and correct.

ASSIGNMENT / QUEUE:
N/A — a.route determines the review route (decision type + required authority) but DEC-182 performs the actual assignment/claim.

DATA:
a.capture's field list (request id, decision type, target entity, requester, requested action, decision scope, submission time, required authority, supporting context) is explicit and well-provenanced for a human-submitted request. For a mechanism-sourced referral, several of those fields (requester, requested action) have no natural value and must be filled by convention (e.g. 'the escalating workflow') that the source never states.

EVIDENCE:
N/A — this is an intake/triage workflow; evidence evaluation is DEC-183's job. c.valid's target/action/requester checks are identity validation, not evidence review.

AUTHORITY / APPROVAL:
N/A here by design — c.deterministic explicitly exists to keep policy-decidable actions out of the human-judgment queue in the first place, which is good discipline, not a gap.

IDEMPOTENCY:
c.duplicate/a.link is the intended de-dup guard, but nothing in the dump shows an idempotencyKey or an atomic claim on a.create; two requests over the same scope arriving concurrently could both read 'no open case' before either writes one, opening two cases despite the workflow's own explicit guardrail against exactly that.

SLA / TIME:
w.info's timeout honestly traces to 'the window policy allows an unopened request to wait' rather than an invented duration; onTimeout correctly treats the unopened lapse as 'not a rejection'.

ESCALATION:
N/A — no escalation node in this workflow; escalation is DEC-189's responsibility once a case exists.

CANCELLATION / SUPERSESSION:
x.lapsed (withdrawn/timed out before a case existed) and x.linked (folded into an existing case) are both correctly non-terminal with honest reEntry semantics; neither is treated as a decision.

HANDOFFS:
- h.invalid → external:requesting-process: carries ["which of the target, the action or the requester's standing failed to hold up","that nobody decided this - it was rejected by the process, and a corrected request is a new request"]
- h.direct → external:operational-resolution: carries ["the requested action and the rule that decides it","the explicit fact that no decision case was opened, so nothing is waiting on a reviewer"]
- h.assign → DEC-182: carries ["the case, its explicit scope and the authority the decision requires","the explicit fact that no review has started and no outcome is implied by the case existing"]

COMPLETION:
Correctly never claims a business decision here — this workflow's own 'completion' is 'validly triaged and routed', explicitly distinct from an actual decision being made (mirrors the OPS-130 discipline even though this workflow predates the vNext contract).

RESULT / FEEDBACK:
Outbound signal is typed (h.invalid / h.direct / h.assign) rather than free text, so downstream doesn't have to parse prose for the three outcomes it actually produces.

CORRECTION / REOPEN:
x.linked's reEntry ('if that case closes with the scope still unresolved, a new request is assessed on its own terms') avoids silently inheriting a closed case's fate — good.

OBSERVABILITY / AUDIT:
decision_log append at every action gives a reasonably complete who/what/when trail for the triage decision itself.

CONSUMER COVERAGE:
Classification: active. Extremely heavy caller list (~50 senders) confirms this is the corpus's genuine general escalation sink, matching its load-bearing role — but the callers are not homogeneous: some (DEC-188's h.renew, CTL-231's h.review) carry a natural named requester and fit the intake model cleanly, while others (OPS-131, CTL-238, most DAT-2xx/RSK-1xx) are governance/mechanism referrals with no requester at all, which is the basis of the P0 finding above.

TEST CASES:
- [duplicate-creation] Given: Two requests over the same decision scope submitted within the same instant, before either has written a case → Expect: Exactly one open case is created for that scope; the second is linked to it — not two parallel cases, per the explicit guardrail
- [handoff] Given: OPS-131 hands off a genuine precedence-tie arbitration (exclusion_group + scope_instance_id, no human requester, no 'requested action') → Expect: DEC-181 can validate and open a scoped case without a requester field blocking c.valid or forcing a spurious a.invalid/pending-info outcome
- [missing-evidence] Given: A mechanism-sourced referral (e.g. DAT-226 migration gap) is judged incomplete by c.info and enters w.info → Expect: The referral does not silently lapse for want of an interactive party able to 'supply information' or 'withdraw' — either the sender itself can satisfy the wait, or this path does not apply to mechanism-sourced referrals

GAPS:
- P0 (handoff-provenance): a.capture/c.valid's requester-standing model and w.info's requester-interactive wait are undefined for the large class of mechanism/operational callers (OPS-131, CTL-231, CTL-238, REL-9x, DAT-2xx, RSK-1xx, etc.) that have no human requester — a handoff receiver instance cannot always be reliably constructed from what those senders actually carry.
- P1 (idempotency): No declared instanceKey/idempotencyKey/atomic-claim on the scope-dedupe (c.duplicate → a.create) despite an explicit guardrail that a second request over an open scope must never produce a parallel case.
- P2 (other): h.invalid targets 'external:requesting-process', a name suited to an external/customer submitter; no consumer record shows an internal mechanism sender receiving or handling that bounce-back.

---

## DEC-182 — Review Assignment

READINESS: READY_WITH_MAPPING

WHY:
Assignment, claim-vs-assigned, deadline-preservation-through-reassignment, and bounded reassignment are all explicit and correctly distinguished. Only mapping-level gaps remain.

RESPONSIBILITY:
Puts an opened decision case in front of an actor who actually holds the required authority, and makes acceptance of ownership an explicit, claimed act rather than an inferred one.

INSTANCE:
Scope = the decision case and the reviewer/authority holding it; entity.note is explicit that the deadline belongs to the case and survives every reassignment. No instanceKey, but the (case, holder) pair is unambiguous.

ENTRY:
Trigger decision_case_requires_ownership is authoritative and matches DEC-181's h.assign payload (case, explicit scope, required authority) exactly; insufficientAlone correctly excludes a case still within its deliberation window and OWN-51's unrelated work-routing.

OWNERSHIP:
Exemplary two-step model: a.assign records ASSIGNED (offer) distinctly from a.ready recording REVIEW_READY (accepted) — guardrail 'Assigned is not reviewed' is enforced structurally via w.accept, not just asserted. This is the single active-owner claim mechanism the rest of the DEC-1xx family should be held to.

ASSIGNMENT / QUEUE:
a.eligible routes strictly by authority level required by the decision type, explicitly rejecting 'availability is not eligibility' — routing criteria are precise, not convenience-based.

DATA:
N/A beyond what DEC-181 already captured; assignment adds reviewer identity and authority basis.

EVIDENCE:
N/A — no evidence evaluation happens here.

AUTHORITY / APPROVAL:
N/A for approval itself; authority-matching for eligibility is the whole point of this workflow and is handled well (c.authority gates on required authority level, not on who is merely free).

IDEMPOTENCY:
Sequential single-owner design prevents double-assignment by construction; no idempotencyKey is shown on a.assign/a.reassign, so a retried assignment write could duplicate a decision_log entry, but this is a low-risk audit-trail nicety rather than a correctness blocker.

SLA / TIME:
w.accept's timeout traces to 'the assignment SLA' (a named policy, not an invented number); onTimeout a.sla explicitly records that only the acceptance is late, not the underlying decision deadline.

ESCALATION:
c.reassign is explicitly bounded ('within the reassignment budget' / 'as many times as the model permits') and routes to DEC-189 rather than looping when authority is unavailable — but the bound itself is referenced only in prose ('the model permits'), with no visible Config field in this workflow's own nodes (unlike its waits, which do name a policy). Worth a mapping note that a company needs to locate/define that bound explicitly.

CANCELLATION / SUPERSESSION:
x.withdrawn correctly releases the assignment and states nothing was decided, distinct from a decline.

HANDOFFS:
- h.review → DEC-183: carries ["the case, its scope, its evidence and the deadline that has travelled with it","the explicit fact that ownership is not review - the state changes again when work actually starts"]
- h.escalate → DEC-189: carries ["the case, every assignment attempted and why each failed","the original deadline, which the escalation preserves rather than restarts"]

COMPLETION:
Correctly stops at 'an owner has agreed to it' — explicitly not a decision, matching the OPS-130 discipline by name in its own guardrail text.

RESULT / FEEDBACK:
Typed handoffs (h.review / h.escalate) carry deadline and history forward without re-derivation.

CORRECTION / REOPEN:
N/A — no decision exists yet to correct.

OBSERVABILITY / AUDIT:
decision_log append at ASSIGNED, SLA-exceeded, REASSIGNED and REVIEW_READY gives a clean ownership-change trail.

CONSUMER COVERAGE:
Classification: active. DEC-181 (h.assign), DEC-183 (h.reassign on mid-review conflict), DEC-189 (h.return with direction) are all real handoff senders whose carries match this workflow's entry model well.

TEST CASES:
- [concurrent-claim] Given: An assignment sits unaccepted past the assignment SLA → Expect: a.sla records the SLA breach (not the case's own deadline) and routes to bounded reassignment, never leaving the case silently 'assigned' forever
- [escalation] Given: No eligible reviewer exists at the required authority level, or the reassignment budget is exhausted → Expect: Case escalates to DEC-189 carrying every assignment attempted and the original (unchanged) deadline

GAPS:
- P2 (sla-escalation): The 'reassignment budget'/'escalation levels the model permits' is referenced only in prose, with no visible Config field in this workflow's own nodes (contrast with its wait's explicit 'assignment SLA' reference) — a company needs to locate where that bound is actually declared.
- P2 (idempotency): No idempotencyKey shown on a.assign/a.reassign; a retried write could duplicate an audit-log entry (not a correctness blocker, but worth mapping).

---

## DEC-183 — Evidence Review

READINESS: READY_WITH_MAPPING

WHY:
This is the strongest authority-discipline node in the batch — it correctly separates assigned-reviewer from decision-authority, and hard-constraint from named-exception, and never lets a review silently override a policy it cannot override. One real SLA gap keeps it out of READY.

RESPONSIBILITY:
The actual judgment step: an owning reviewer evaluates authoritative evidence within their authorized scope and hard-policy constraints, and produces exactly one of approve/partial/reject or an escalation/reassignment/info-request.

INSTANCE:
Scope = the decision case and this particular review instance against it; entity.note explicitly allows several review instances across reassignments/reopenings, none replacing the last — a clean append-only instance model even without a formal instanceKey.

ENTRY:
Trigger authorized_review_begins is precisely distinguished from 'assigned' and from 'opened in an interface' — matches DEC-182's REVIEW_READY handoff.

OWNERSHIP:
c.conflict lets a reviewer step back mid-review (a.step-back→h.reassign to DEC-182) rather than deciding while conflicted — 'a decision made by a conflicted reviewer is worse than no decision' is exactly the right discipline. c.authority further distinguishes 'assigned to review' from 'authorized to decide this' (h.escalate to DEC-189 if beyond scope) — this workflow does not conflate assignment with authority.

ASSIGNMENT / QUEUE:
N/A — already assigned upstream by DEC-182.

DATA:
Authoritative evidence only; 'an absent document is absent, and a reviewer's sense of what it probably said is not a substitute for it' is stated explicitly.

EVIDENCE:
Distinguishes only 'authoritative evidence' as evaluable; does not further split supporting/customer-provided/behavioral-signal tiers, but the guardrail against inventing or assuming missing evidence is explicit and strong.

AUTHORITY / APPROVAL:
The best-specified authority handling in the batch: c.hard-policy separates 'hard constraint, no exception authority' (a.constrained — decide within it) from 'hard constraint, exception authority held' (a.exception — record the exception AND the authority for it AND the constraint displaced) from 'no hard constraint' (ordinary judgment). Self-approval/conflict-of-interest is folded generically into c.conflict rather than named as its own category — acceptable given the source doesn't split it out, but worth noting for mapping.

IDEMPOTENCY:
N/A — decision production, not duplicate-prone creation; multiple review instances are explicitly allowed and append-only rather than overwritten.

SLA / TIME:
This workflow declares no wait/timeout node of its own — once REVIEW_READY becomes UNDER_REVIEW, nothing here re-checks how long the review itself is taking against the case's (preserved) deadline. Compare to DEC-189, which explicitly enforces the case deadline with its own wait at the escalated level — DEC-183 has no equivalent guard at the base review level.

ESCALATION:
h.escalate→DEC-189 on authority-beyond-scope, preserving evidence and assessment already made.

CANCELLATION / SUPERSESSION:
N/A — no exit nodes at all in this workflow; every path resolves into a handoff (reassign/escalate/info/approved/partial/rejected), so nothing dangles.

HANDOFFS:
- h.reassign → DEC-182: carries ["the case, the evidence gathered so far and the reason this reviewer stepped back","the original deadline, and the explicit fact that no decision was made"]
- h.escalate → DEC-189: carries ["the evidence and the assessment reached so far, which the escalation preserves","the specific authority the decision requires, so the escalation goes somewhere rather than upward in general"]
- h.info → DEC-184: carries ["the exact requirement the decision turns on, and why","everything the review has already established, which is preserved rather than discarded"]
- h.approved → DEC-185: carries ["the decision, its maker, its scope, its conditions and its validity where one applies","the explicit fact that approving authorizes an action and performs none of it"]
- h.partial → DEC-187: carries ["which scope was approved and which was refused, separately and explicitly","the basis for each, so the partition can be explained rather than reconstructed"]
- h.rejected → DEC-186: carries ["the reason and its category, the maker, the time and the affected scope","the explicit fact that this is an authorized business outcome rather than a failure"]

COMPLETION:
Correctly produces no completion of its own — 'a review started is not an approval' — the actual decision is the typed handoff itself, deferring business completion entirely to DEC-185/186/187, matching the OPS-130 precedent.

RESULT / FEEDBACK:
Approved/partial/rejected are distinct typed handoffs, not a free-text status the receiver must parse.

CORRECTION / REOPEN:
N/A within this workflow — reopening/correction is DEC-190's responsibility.

OBSERVABILITY / AUDIT:
UNDER_REVIEW timestamp+reviewer, evaluation, conflict, constraint/exception, and decision are each separately logged — a complete review trail.

CONSUMER COVERAGE:
Classification: active. DEC-182 (h.review), DEC-184 (h.resume), DEC-189 (h.decide), DEC-190 (h.review) are real handoff senders; DOC-215 references this workflow only via distinctFrom prose, not a real handoff.

TEST CASES:
- [self-approval] Given: A conflict of interest (including a reviewer being the requester) surfaces mid-review → Expect: a.step-back records it and hands to DEC-182 for reassignment rather than letting the review proceed
- [approval] Given: A hard policy constraint applies and the reviewer holds no exception authority → Expect: a.constrained decides within the constraint rather than silently overriding it
- [escalation] Given: The decision needs an authority level the current reviewer does not hold → Expect: h.escalate to DEC-189 preserves the evidence and assessment already made

GAPS:
- P1 (sla-escalation): No wait/timeout node inside this workflow enforces the case's own deadline once a reviewer has accepted and begun UNDER_REVIEW — a stalled reviewer who has claimed the case has no automatic escalation trigger from within this workflow itself (contrast with DEC-189's explicit deadline-bound wait at the escalated level).
- P2 (other): Self-approval/conflict-of-interest is not named as its own category, only folded into a generic conflict check — plausible but not explicit.

---

## DEC-185 — Approval Execution Validation

READINESS: READY_WITH_MAPPING

WHY:
This is the cleanest single implementation of freshness-before-execution in the batch and correctly refuses to let approval-granted stand in for approval-still-valid. Fully automated, no human ownership ambiguity, no gaps found beyond mapping.

RESPONSIBILITY:
The freshness gate between an approval being granted and its authorized action actually executing: re-reads the target's current state, honors any attached conditions, and hands the exact authorized scope to the owning execution lifecycle.

INSTANCE:
Scope = the approved decision and the target action; entity.note explicitly splits 'approval complete' from 'action not yet started' as two separate facts.

ENTRY:
Trigger decision_approved matches DEC-183's h.approved payload exactly (decision, maker, scope, conditions, validity).

OWNERSHIP:
N/A in the human sense — fully automated (no channels, no execution:human tags); the 'owner' here is the execution lifecycle's own logic, correctly deferred to at h.execute.

ASSIGNMENT / QUEUE:
N/A.

DATA:
Decision, maker, scope, time, conditions, validity period — all sourced from the upstream approval record.

EVIDENCE:
N/A — not a review; a freshness/validity check.

AUTHORITY / APPROVAL:
The central mechanism (a.revalidate: 're-read the target's current state before executing... executing it against a target that has since changed applies an authorization to something nobody authorized') is a textbook, explicitly-worded implementation of freshness-before-execution — worth citing as the reference example for this dimension in this batch.

IDEMPOTENCY:
h.execute explicitly states 'execution is not complete until that lifecycle says it is' — correctly refuses to conflate 'approval handed off' with 'action performed' (same discipline as CMS-206's provider-accepted-is-not-delivered rule). Actual execution idempotency is appropriately deferred to the target lifecycle, out of scope here.

SLA / TIME:
w.conditions' timeout traces to 'the approval's validity period, or the bounded window policy' — not invented.

ESCALATION:
N/A — routes to re-review (DEC-190) or validity-check (DEC-188) rather than authority escalation.

CANCELLATION / SUPERSESSION:
x.invalidated and x.expired are both explicit, non-destructive of the original decision record, and both correctly distinguish 'approval invalidated/expired' from 'request rejected' — matches dimension 12's stop-future-work vs reverse-completed-effect split cleanly (nothing has executed yet in either branch).

HANDOFFS:
- h.validity → DEC-188: carries ["the approval, its scope, its conditions and the target version it was granted against","the explicit fact that the gap between decision and use is where a stale approval mutates state nobody authorized"]
- h.re-review → DEC-190: carries ["the original decision, preserved, and exactly what has changed since","the explicit fact that nothing was executed and the original approval was not edited"]
- h.execute → external:operational-resolution: carries ["the exact authorized scope, and the canonical lifecycle that owns the action - the payment, the access grant, the fulfillment, the entitlement change or the account change","the explicit instruction that the approval does not replace that lifecycle's own validation, and that execution is not complete until that lifecycle says it is"]

COMPLETION:
Correctly distinguishes 'approval confirmed valid and handed off' from 'action completed' — completion is explicitly the target lifecycle's to declare.

RESULT / FEEDBACK:
OWN-56/OWN-57 receive the approved version identifier explicitly so an internal approval is never confused with an external counterparty's acceptance — a nice explicit anti-conflation in the carried payload.

CORRECTION / REOPEN:
Reopening is routed to DEC-190 rather than DEC-185 rewriting anything itself.

OBSERVABILITY / AUDIT:
Decision, maker, scope, conditions, validity, and every re-validation outcome (hold/invalidate/await/expire) are logged.

CONSUMER COVERAGE:
Classification: active. OWN-56, OWN-57 (h.execute) and DEC-183 (sender, h.approved) are real, well-matched consumers; DEC-187 is referenced only via distinctFrom prose.

TEST CASES:
- [stale-work] Given: The target changes materially between approval and intended execution → Expect: a.hold or a.invalidate fires depending on the decision's own semantics — execution never proceeds against the changed target
- [completion] Given: An unconditional, unchanged, in-scope approval reaches execution → Expect: h.execute hands the exact scope to the owning lifecycle, with execution-complete explicitly deferred to that lifecycle

GAPS:
- none recorded

---

## DEC-186 — Rejection Resolution

READINESS: READY_WITH_MAPPING

WHY:
Every downstream path is explicitly conditioned on policy actually defining it; nothing is defaulted to 'yes'. Fully automated classification with no ambiguity found.

RESPONSIBILITY:
Treats an authorized rejection as a genuine business outcome and routes it to whichever of remediation, reapplication, appeal, or plain closure policy actually defines — never inventing any of those rights.

INSTANCE:
Scope = the decision case and the rejection issued against it; entity.note is explicit that a rejection closes a decision, not a relationship.

ENTRY:
Trigger authorized_rejection_issued matches DEC-183's h.rejected payload; explicitly excludes a technical processing failure, which belongs in a different queue.

OWNERSHIP:
N/A — fully automated policy application after the human decision (already made in DEC-183); no ownership question remains.

ASSIGNMENT / QUEUE:
N/A.

DATA:
Reason, category, maker, time, scope — sourced from the upstream rejection.

EVIDENCE:
N/A.

AUTHORITY / APPROVAL:
N/A — no new approval authority exercised; this only classifies the already-made rejection's downstream path.

IDEMPOTENCY:
Guardrail 'Rejected requests are never automatically resubmitted' avoids duplicate-decision risk; correctable/reapplicable paths explicitly open a new, linked case rather than mutating this one.

SLA / TIME:
N/A — no waiting state in this workflow; it is a terminal-outcome classifier.

ESCALATION:
N/A — appeal is a policy-granted separate lifecycle (FBK-47), not an authority escalation.

CANCELLATION / SUPERSESSION:
x.remediable / x.reapply / x.closed are all correctly non-destructive of the rejection record, each with distinct, honest reEntry semantics (linked new request vs. genuinely new case vs. no path).

HANDOFFS:
- h.appeal → FBK-47: carries ["the decision, its reason, its maker and the evidence it was made on","the explicit fact that the appeal reviews the decision and does not re-run it as a fresh request"]

COMPLETION:
CLOSED_REJECTED is a genuine, explicit terminal authorized outcome — correctly labeled a business outcome, not a failure.

RESULT / FEEDBACK:
Three distinct reEntry-bearing exits plus one handoff give the receiver (requester-facing surface) an unambiguous next step rather than a bare 'rejected' string.

CORRECTION / REOPEN:
Handled via explicitly-new, linked cases (correctable/reapply) or via FBK-47's own appeal lifecycle — no in-place rewriting.

OBSERVABILITY / AUDIT:
Full reason/category/maker/time/scope and remediation-or-reapplication terms are logged and kept readable.

CONSUMER COVERAGE:
Classification: active. DEC-183 is the sole real handoff sender; RSK-194 and DEC-267 reference this workflow only via distinctFrom prose.

TEST CASES:
- [correction] Given: Policy defines a correctable remediation path for the rejection reason → Expect: a.remediate states exactly what would have to change, drawn from policy
- [reopen] Given: No remediation or reapplication right is defined and no appeal right applies → Expect: a.close records CLOSED_REJECTED as terminal, with no invented path forward

GAPS:
- none recorded

---

## DEC-187 — Partial Approval Resolution

READINESS: NEEDS_CONTRACT_WORK

WHY:
The partition, dedupe, and 'keep the unresolved part visibly open' logic is excellent and directly addresses the terminality-vs-obligation risk this round cares about. But its escalation handoff for undefined atomicity omits a field its own receiver (DEC-189) explicitly needs.

RESPONSIBILITY:
Partitions a partially-approved request's scope explicitly, ensures no piece of the original request lands unanswered, dedupes shared side effects across the split, and either executes the approved partition or holds the whole action where it cannot be split.

INSTANCE:
Scope = the decision case and the partitions of its requested scope; entity.note requires every part of the original scope to land in exactly one partition.

ENTRY:
Trigger decision_partially_approved matches DEC-183's h.partial payload.

OWNERSHIP:
N/A — fully automated (no channels, no human execution tags); ownership questions were already resolved upstream in DEC-183.

ASSIGNMENT / QUEUE:
N/A.

DATA:
Partitioned scope with basis recorded per-partition (not as one combined note) — explicit so a later audit can attribute the right exception to the right slice.

EVIDENCE:
N/A.

AUTHORITY / APPROVAL:
N/A — approval authority already exercised upstream; this workflow only executes/routes what was decided.

IDEMPOTENCY:
a.dedupe explicitly runs any shared side effect once for the approved scope only — a well-specified duplicate-charge/duplicate-notify guard; h.execute additionally 'suppresses' any execution touching the rejected/unresolved scope, an explicit and correct guard against partial-execution leakage.

SLA / TIME:
N/A — no waits declared.

ESCALATION:
h.undefined→DEC-189 fires when atomicity is undefined, but its carried payload ('the partitions and the action they would apply to' + the fact that no atomicity was assumed) does not include the case's original deadline — while DEC-189's own a.preserve and w.decision both explicitly operate on 'the case's original deadline, preserved rather than restarted'. A receiver that must preserve a deadline it was never given cannot honor its own stated contract for this specific caller.

CANCELLATION / SUPERSESSION:
x.held (whole action held when atomic) explicitly forbids assembling the action from partial approvals made at different times — re-evaluated as one when the rest resolves. Strong discipline.

HANDOFFS:
- h.undefined → DEC-189: carries ["the partitions and the action they would apply to","the explicit fact that no atomicity was assumed - whether a thing can be half-done is a property of the thing, and guessing it is how half-provisioned accounts and partly fulfilled contracts appear"]
- h.execute → external:operational-resolution: carries ["only the approved scope, stated explicitly, and the canonical lifecycle that owns the action","the rejected scope, stated explicitly as something that must not be executed - a reviewer refused it, and it travelling in the same request is not authorization"]

COMPLETION:
a.keep-active explicitly prevents closing a partially-approved case as fully decided while any scope remains open — directly names the exact terminality failure mode this round is watching for ('the requester assumes it was refused - which is a rejection nobody made').

RESULT / FEEDBACK:
Approved/rejected/pending partitions are each explicitly and separately labeled, not merged into one ambiguous status.

CORRECTION / REOPEN:
N/A — reopening the whole action is handled by re-evaluating once the remaining scope resolves (per x.held's reEntry).

OBSERVABILITY / AUDIT:
Per-partition basis, dedupe action, and atomicity determination are all separately logged.

CONSUMER COVERAGE:
Classification: active. DEC-183 (h.partial) is the sole real handoff sender; DEC-185 references this workflow only via distinctFrom prose.

TEST CASES:
- [completion] Given: Part of the request is approved and part remains pending review → Expect: a.keep-active keeps the case open rather than closing it as though fully decided
- [duplicate-creation] Given: The approved scope shares a side effect (charge/provisioning/notification) with the rejected/pending scope → Expect: a.dedupe runs it exactly once, for the approved scope only
- [handoff] Given: The action's atomicity is undefined and h.undefined fires to DEC-189 → Expect: DEC-189 can still honor 'preserve the original deadline' even though this handoff does not carry one

GAPS:
- P1 (handoff-provenance): h.undefined→DEC-189 does not carry the case's original deadline, but DEC-189's own preserve/timeout logic explicitly depends on receiving one — the receiver's stated contract cannot be honored for this specific caller.

---

## DEC-188 — Approval Expiry Revalidation

READINESS: READY_WITH_MAPPING

WHY:
This is the batch's cleanest idempotency implementation (single-use consumption is checked and refused explicitly, with the refusal itself audited) and its time/expiry handling never invents a bound. No gaps found.

RESPONSIBILITY:
Answers, at each attempted use, whether an approval is still usable — in time, in target state, and in single-use consumption count — without inventing an expiry, a rejection framing, or a reuse allowance the source doesn't define.

INSTANCE:
Scope = the approval decision and the boundaries it was granted within; entity.note is explicit that validity is assessed at each use, not carried as a static flag.

ENTRY:
Trigger approval_validity_evaluation_required matches DEC-185's h.validity payload.

OWNERSHIP:
N/A — fully automated validity gate, no human execution tags.

ASSIGNMENT / QUEUE:
N/A.

DATA:
Valid-from/until, target version/state, conditions, and single-use consumption flag — all explicit inputs.

EVIDENCE:
N/A.

AUTHORITY / APPROVAL:
N/A — a validity check, not a new approval decision.

IDEMPOTENCY:
The reference implementation in this batch: c.consumed/a.reused explicitly refuses and records a second use of a single-use approval, framed exactly as the round's own vocabulary demands ('the same failure as a duplicate payment with a signature on it').

SLA / TIME:
a.no-expiry honestly records 'no expiry' rather than assigning one when none was granted — directly matches the house rule against inventing SLAs.

ESCALATION:
N/A — re-decision paths (DEC-190 re-review, DEC-181 renew) rather than authority escalation.

CANCELLATION / SUPERSESSION:
x.consumed / x.usable / x.expired are all precise and non-punitive; renewal explicitly routes through DEC-181 as a new decision request, never as an extension of the lapsed approval.

HANDOFFS:
- h.re-review → DEC-190: carries ["the original approval, preserved, and what has changed in the target since","the explicit fact that nothing was executed and the approval was not edited"]
- h.renew → DEC-181: carries ["the expired approval and the decision it recorded, as context for the new one","the explicit fact that this is a new decision request against the current target rather than an extension of the old approval"]

COMPLETION:
Correctly certifies validity at a point in time only; actual execution/use completion is the calling lifecycle's (DEC-185/external) to declare.

RESULT / FEEDBACK:
DEC-185 receives a clear usable/expired/re-review signal, not a flag it has to interpret.

CORRECTION / REOPEN:
Expired is explicitly not equated with rejected; re-seeking is a new decision, never a silent reopening of the lapsed one.

OBSERVABILITY / AUDIT:
Every evaluation, reuse attempt, and expiry/no-expiry determination is logged.

CONSUMER COVERAGE:
Classification: active. DEC-185 (h.validity) is the sole real handoff sender, with a well-matched payload.

TEST CASES:
- [duplicate-creation] Given: A single-use approval is presented for use a second time → Expect: a.reused refuses execution and records the reuse attempt rather than silently permitting it
- [stale-work] Given: A time-valid approval's target has moved beyond the context it was granted against → Expect: a.needs-review routes to DEC-190 rather than treating time-validity alone as sufficient

GAPS:
- none recorded

---

## DEC-189 — Decision Escalation

READINESS: NEEDS_CONTRACT_WORK

WHY:
Escalation-reason recording, evidence preservation, bounded escalation levels, and deadline-preservation are all well specified. But unlike its sibling DEC-182 (ordinary assignment), this workflow has no explicit ownership-claim step at the escalated level, and it received a handoff from DEC-187 that cannot satisfy its own stated deadline-preservation contract.

RESPONSIBILITY:
Moves an already-open decision case to a different or higher authority able to actually resolve it, preserving all prior evidence, review history, and the original deadline, without pretending guidance is a decision.

INSTANCE:
Scope = the decision case and the escalation acting on it; entity.note is explicit the case is one case throughout — escalation changes who holds it, not its identity.

ENTRY:
Trigger escalation_criterion_satisfied requires a defined criterion (authority threshold, policy exception, material risk, reviewer conflict, complexity, SLA governance, disagreement) and explicitly excludes 'a case being difficult' as insufficient alone.

OWNERSHIP:
a.route routes to the eligible authority and goes directly to w.decision (decide / need-info / return-with-direction) with no intervening accept/decline/claim step — unlike DEC-182, which treats 'assigned' and 'accepted' as two distinct, necessary states precisely to prevent an SLA breach from hiding in that gap ('Assigned is not reviewed'). DEC-189 does the same routing operation at an escalated level but has no equivalent claim gate, and its own h.decide hands directly into DEC-183's 'authorized_review_begins' trigger — which itself distinguishes 'assigned' from 'begun' — without ever showing that the escalated authority explicitly accepted ownership.

ASSIGNMENT / QUEUE:
Eligible authority is determined by 'escalation levels the model actually defines' — bounded, but (like DEC-182's reassignment budget) referenced only in prose with no visible Config in this workflow's own nodes.

DATA:
Escalation reason, preserved evidence, review history, and original deadline are all carried forward explicitly (a.preserve).

EVIDENCE:
N/A directly — evidence is preserved and forwarded, not re-evaluated here (that happens once DEC-183 re-fires at the escalated level).

AUTHORITY / APPROVAL:
'Escalated is not approved' is enforced structurally: a.return distinguishes guidance given from a decision made, and the returned case is explicitly not attributed a decision at the escalated level.

IDEMPOTENCY:
N/A — a case-relocation operation, not a creation-prone one.

SLA / TIME:
w.decision's timeout is explicitly 'the case's original deadline, preserved rather than restarted' — onTimeout correctly reframes an overrunning escalation as an ownership problem (h.governance→OWN-55) rather than silently looping.

ESCALATION:
c.authority's 'None' branch stops at x.no-authority rather than looping indefinitely — escalation is genuinely bounded, satisfying the house rule against unbounded A→B→A loops.

CANCELLATION / SUPERSESSION:
N/A — the case is not cancelled here, only relocated.

HANDOFFS:
- h.decide → DEC-183: carries ["every piece of evidence and every prior assessment, preserved","the specific authority now holding it, which still acts only within what it was granted"]
- h.info → DEC-184: carries ["the requirement the escalated authority identified","the review history from both levels, so nothing is asked for twice"]
- h.return → DEC-182: carries ["the direction given and the authority that gave it","the original deadline, still unchanged, and the explicit fact that no decision was made at the escalated level"]
- h.governance → OWN-55: carries ["the case, every level it has passed through and how long each held it","the explicit fact that this is now an ownership problem rather than a decision problem"]

COMPLETION:
Correctly never completes a decision itself, only relocates authority over it.

RESULT / FEEDBACK:
Typed outbound handoffs (decide/info/return/governance) are specific, not a generic 'escalated' status.

CORRECTION / REOPEN:
N/A.

OBSERVABILITY / AUDIT:
Escalation reason, preserved history, routing, and return-with-direction are each logged.

CONSUMER COVERAGE:
Classification: active. DEC-182 (h.escalate), DEC-183 (h.escalate), DEC-184 (h.escalate, outside this batch), and DEC-187 (h.undefined, with the deadline gap above) are the real handoff senders.

TEST CASES:
- [escalation] Given: No eligible higher/different authority exists at all → Expect: x.no-authority stops the case visibly rather than circulating it
- [stale-work] Given: The case outlives its original (preserved) deadline while escalated → Expect: h.governance routes to OWN-55 as an ownership problem, not a silently expired decision
- [handoff] Given: A case is routed to an escalated authority → Expect: Ownership at that level is explicitly claimed (accepted), not merely inferred from being routed to, before DEC-183's 'review begins' event fires

GAPS:
- P1 (ownership): No explicit accept/claim step exists between a.route and w.decision (or before h.decide fires DEC-183's 'authorized_review_begins'), unlike DEC-182's deliberate assigned-vs-accepted split for the identical routing problem at the ordinary authority level.
- P1 (handoff-provenance): The h.undefined handoff received from DEC-187 does not carry an original deadline, which this workflow's own a.preserve/w.decision logic explicitly requires to honor its stated behavior.

---

## DEC-190 — Decision Re-Review

READINESS: NEEDS_CONTRACT_WORK

WHY:
Materiality assessment, immutable history, and executed-consequence handling are all excellent and directly quote the round's own house rules. The one real gap is shared with DEC-189: reopening hands straight into DEC-183's 'review begins' trigger with no visible assignment/claim step in between.

RESPONSIBILITY:
Lets an already-made decision be reconsidered when a genuinely material event bears on it, without ever editing the original record, and separates 'stop future work' from 'reverse an already-executed effect'.

INSTANCE:
Scope = the existing decision and the event challenging it; entity.note is explicit the original decision is immutable and a new decision supersedes it as a later record, never in place.

ENTRY:
Trigger decision_challenged_or_superseded requires a genuinely material event and explicitly excludes 'the requester disagreeing' (routed to appeal instead) and 'new information that mostly just confirms' — this precise exclusion is the strongest anti-reopen-thrash discipline in the batch ('reopening for each arriving fact produces a case that never closes').

OWNERSHIP:
c.authority checks reconsideration authority and scope match before reopening — but when authorized and reopened, h.review hands directly into DEC-183's 'authorized_review_begins' trigger with no assignment/claim step shown, the same pattern flagged in DEC-189. It is unclear whether the original reviewer's ownership silently carries forward or a fresh DEC-182 cycle is implicitly expected.

ASSIGNMENT / QUEUE:
N/A within this workflow's own graph.

DATA:
Original decision, the challenging event, and (where executed) what was executed and when — all explicit.

EVIDENCE:
N/A directly — a.assess judges materiality at a high level rather than itemizing evidence types.

AUTHORITY / APPROVAL:
c.authority explicitly gates reconsideration on both authority and same-scope, avoiding both 'anyone can reopen' and scope creep into a.new-case when the question differs.

IDEMPOTENCY:
a.retain explicitly avoids opening a duplicate review when the challenge doesn't hold up — 'No duplicate review is opened' is stated directly.

SLA / TIME:
N/A — no waits in this workflow's own graph; it is a triage-then-handoff step.

ESCALATION:
N/A — this is reconsideration triage, not authority escalation.

CANCELLATION / SUPERSESSION:
x.retained and x.not-authorized both leave the original decision untouched with distinct, honest reEntry semantics. c.reversible cleanly separates 'executed consequences need correcting now' (h.correct→REM-157) from 'they stand pending the new decision' (h.review) — exactly the stop-future-work-vs-reverse-completed-effect split this round asks for, done by name.

HANDOFFS:
- h.new → DEC-181: carries ["the prior decision and its evidence, as linked context rather than as the scope","the explicit fact that the prior decision stands and is not superseded by this one being opened"]
- h.correct → REM-157: carries ["what was executed, on whose authority and when","the explicit fact that changing the decision record does not undo any of it - the correction is its own lifecycle with its own outcome"]
- h.review → DEC-183: carries ["the original decision, preserved, and everything that has changed since","whether the original was executed, so the new decision is made knowing what already exists in the world"]

COMPLETION:
Never completes a decision itself; retains, opens a new linked case, or reopens and hands onward — correctly deferred.

RESULT / FEEDBACK:
DEC-185 and DEC-188 both receive well-matched re-review triggers (original decision preserved + what changed).

CORRECTION / REOPEN:
This workflow effectively is the correction/reopen mechanism for the whole DEC-1xx family, and does it well: immutable history, explicit supersession, and a distinct executed-consequences correction path.

OBSERVABILITY / AUDIT:
Preservation, assessment, retain/reopen/new-case, and executed-note are each separately logged.

CONSUMER COVERAGE:
Classification: active. DEC-185 (h.re-review) and DEC-188 (h.re-review) are both real, well-matched handoff senders.

TEST CASES:
- [reopen] Given: New evidence arrives that mostly confirms the original decision → Expect: a.retain keeps the original decision and records it was reconsidered, without opening a duplicate review
- [correction] Given: The original decision was already executed and the execution itself was wrong (error or upstream correction) → Expect: h.correct routes to REM-157 as a separate correction lifecycle — the decision record itself is never edited in place
- [reopen] Given: Reconsideration is authorized over the same scope and the case reopens → Expect: Ownership of the reopened review is explicitly claimed before DEC-183's review-begins event fires, not merely inferred from routing

GAPS:
- P1 (ownership): h.review hands directly into DEC-183's 'authorized_review_begins' trigger with no visible assignment/claim step, the same gap flagged in DEC-189 — unclear whether reopening silently carries forward the prior reviewer's ownership or requires a fresh DEC-182 cycle.

---

## DOC-211 — Document Requirement Resolution

READINESS: NEEDS_CONTRACT_WORK

WHY:
The decision logic (reuse/waive/create) is sound and the reusableRule is precise, but the create path has no instanceKey/idempotencyKey to stop the same requirement being fulfilled twice by concurrent triggers, the waiver 'authority' is never named even abstractly, and the reuse/waive exits are silent (log-only) with no signal back to the requiring process.

RESPONSIBILITY:
Decides, at the point a business process reaches a document requirement, whether an existing valid artifact satisfies it, whether a rule waives it, or whether a new document obligation must be created.

INSTANCE:
No entity.instanceKey declared (pre-instanceKey convention). Identity is implied by entity.scope as the tuple of (business process instance, requirement type+purpose+parties+validity) — the note is explicit that reuse is only valid against all four, not the type alone, which is a good de-facto identity definition even without a formal key.

ENTRY:
Authoritative event process_reaches_document_requirement, with an explicit insufficientAlone guard ('a process step occurring' is not enough). Precise as an entry condition; does not name which system/step raises it.

OWNERSHIP:
No actor is named anywhere in the workflow — determine/reuse/waive/create are all impersonal 'does' text. It is unclear whether this is meant to run fully automated (plausible, given it's pure record-matching) or requires a document-domain reviewer for the waiver call in particular ('an authority explicitly excuses'). This ambiguity is the workflow's central gap.

ASSIGNMENT / QUEUE:
N/A — no queue or routing is modeled; if a human is meant to authorize a waiver, no queue/role receives that request.

DATA:
Type, purpose, parties, required data and validity requirements are all named as required inputs to a.determine; reasonably complete for the decision it makes.

EVIDENCE:
N/A — this is a match/no-match determination against existing records, not a review of external evidence.

AUTHORITY / APPROVAL:
The waiver path assumes 'an authorized rule or authority' already exists and only records it; the workflow does not itself grant waiver authority to anyone, which is appropriate, but no pointer to where that authority is defined is given.

IDEMPOTENCY:
No idempotencyKey on a.create (or any action). If the same requirement is reached twice (e.g., two process branches, or DOC-218/DOC-219 both re-raising a requirement for the same lapsed document), nothing in this workflow stops two document obligations being created for one requirement.

SLA / TIME:
N/A — no waits in this workflow.

ESCALATION:
N/A — no escalation path defined; undefined-authority or ambiguous-match cases are not routed anywhere (contrast with DOC-212/216/217/218/219, which all route undefined cases to DEC-181).

CANCELLATION / SUPERSESSION:
Reuse and waiver exits both define reEntry: an expiring/revoked reused artifact or a new instance of the same requirement reopens assessment fresh rather than trusting the old decision — good non-terminal design.

HANDOFFS:
- h.draft → DOC-212: carries ["the artifact type, its purpose, the parties and the data it needs","the validity requirements, which decide what makes it complete rather than merely rendered"]

COMPLETION:
For the create path, completion is implicitly handed off (there is no local terminal state, work continues in DOC-212). For reuse/waive, 'completion' is only a document_log append; there is no explicit signal that the requiring business process can read to know the requirement is settled.

RESULT / FEEDBACK:
Weak: x.reused and x.waived are local exits with no handoff back to the originating process. A process that reached this requirement has no defined way to be told the outcome other than re-reading document_log.

CORRECTION / REOPEN:
Handled via reEntry semantics on both non-terminal exits — an expiring reused artifact or revoked one reopens the requirement fresh, and a waiver's scope is instance-bound so a different instance is assessed on its own terms. Sound.

OBSERVABILITY / AUDIT:
Every action appends to document_log, but the log entries as specified carry no actor/authority field, so 'who decided to waive this' is not reconstructable from what's declared.

CONSUMER COVERAGE:
Classification: active. DOC-218 (h.new, expired document) and DOC-219 (h.new, revoked document) both send real handoffs into this workflow with carries that match its entry needs; likely many other unlisted corpus journeys also trigger it directly as 'a process reaches a document requirement.'

TEST CASES:
- [duplicate-creation] Given: the same document requirement is reached twice concurrently (e.g. two branches of the same process, or two independent expiry/revocation handoffs) → Expect: at most one document obligation is created for the requirement; the second reaches c.existing and finds the first as an existing (draft/issued) artifact rather than creating a duplicate
- [handoff] Given: a.create fires h.draft into DOC-212 → Expect: DOC-212's entry contract (type + required contents) is fully constructible from what h.draft carries
- [reopen] Given: an artifact previously used to satisfy this requirement (x.reused) later expires or is revoked → Expect: the requirement is reassessed fresh rather than assumed still satisfied

GAPS:
- P1 (idempotency): No instanceKey/idempotencyKey on the create path; two concurrent triggers for the same requirement can both create a document obligation.
- P1 (ownership): No actor is named for determine/reuse/waive/create, and the waiver 'authority' is never even abstractly identified — an implementer cannot tell if a human gate is required.
- P2 (result-feedback): Reuse/waive exits are log-only with no handoff back to the requiring process to signal the requirement is settled.

---

## DOC-212 — Document Readiness Validation

READINESS: READY_WITH_MAPPING

WHY:
The completeness/validity logic is exhaustive and explicit about never inventing missing data, the blocked/wait/abandon path has a real timeout traced to the requiring process's own window, and undefined-timing cases are routed to DEC-181 rather than guessed. Only role/system mapping (who or what resolves/validates) remains open.

RESPONSIBILITY:
Populates a document draft from authoritative sources, validates completeness/consistency, and declares it READY_TO_ISSUE or BLOCKED — the boundary between 'a file was generated' and 'the content can be defended.'

INSTANCE:
No instanceKey; identity is the draft plus its declared source entities (entity.note: each field carries its source and version). Concurrency is not addressed — if DOC-211 allows two concurrent creates for one requirement (see DOC-211 gap), two drafts could exist for the same requirement with no cross-check here.

ENTRY:
document_generation_begins, authoritative, requires a defined document obligation with required contents — precise, and it is exactly what DOC-211's h.draft supplies.

OWNERSHIP:
No actor named for resolve/populate/validate; plausibly automated (field population from 'authoritative sources'), but validation includes judgment-adjacent checks (party identities, internal consistency) that could require a person. Not stated either way.

ASSIGNMENT / QUEUE:
N/A — no queue modeled; if a human must resolve BLOCKED/MISSING_REQUIREMENT, no queue receives it (it only enters w.data until an external event resolves it or the window lapses).

DATA:
Every field is required to be resolved from an authoritative source with the source and version recorded — strong provenance requirement, explicitly the guardrail against inventing content.

EVIDENCE:
N/A in the review sense — 'evidence' here is source-field provenance (source + version), which a.validate checks; this is a data-integrity check rather than a human evidentiary review.

AUTHORITY / APPROVAL:
N/A here by design — readiness (this workflow) is explicitly kept separate from authorization to issue, which DOC-213 requires as its own entry condition.

IDEMPOTENCY:
No idempotencyKey on the write actions; not a duplicate-creation risk in isolation (one draft, sequential population), but see DOC-211 concern about two drafts existing for one requirement.

SLA / TIME:
w.data has an explicit timeout tied to 'the window the requiring process allows for the artifact' — honestly sourced as an external Config rather than an invented duration.

ESCALATION:
On timeout, routes to h.review → DEC-181 rather than blocking forever or guessing completion — good discipline.

CANCELLATION / SUPERSESSION:
c.data 'withdrawn' branch → a.abandon preserves the record that a draft was started and why it stopped; x.abandoned reEntry correctly notes that repopulating the same draft would use stale-as-of-then sources rather than current ones, so a fresh draft is required.

HANDOFFS:
- h.review → DEC-181: carries ["the document, the missing element and the source that should have supplied it","the explicit fact that nothing was invented to complete it and nothing was issued"]
- h.issue → DOC-213: carries ["the validated contents and the source version each field came from","the explicit fact that the draft is still editable and nothing is yet authoritative"]

COMPLETION:
READY_TO_ISSUE is explicitly distinguished from 'a file was rendered' (a.ready's own text) — a clean, named completion contract that does not conflate rendering success with actual readiness.

RESULT / FEEDBACK:
Handoff-only (h.issue / h.review); no local exit besides x.abandoned, so the readiness outcome is always explicitly propagated forward rather than left implicit.

CORRECTION / REOPEN:
A blocked draft can resume populate on new data (c.data 'the data arrived' → a.populate) without restarting from scratch — good, avoids penalizing a slow-arriving field with a full redo.

OBSERVABILITY / AUDIT:
document_log records BLOCKED/MISSING_REQUIREMENT naming exactly what's absent and READY_TO_ISSUE separately from rendering — good semantic granularity for later audit.

CONSUMER COVERAGE:
Classification: active. DOC-211's h.draft is the confirmed real sender, and its carries match this workflow's entry contract exactly.

TEST CASES:
- [missing-evidence] Given: a required field's source cannot be resolved at generation time → Expect: BLOCKED/MISSING_REQUIREMENT is recorded naming the exact missing element; no plausible value is substituted
- [handoff] Given: a validated draft reaches h.issue → Expect: DOC-213 can construct its own entry from what's carried, except for the separately-required issuance authority, which must come from elsewhere
- [cancellation] Given: the document requirement is withdrawn while the draft is blocked and waiting on data → Expect: the draft is recorded abandoned, not silently deleted, and re-population from stale sources is not attempted

GAPS:
- P1 (ownership): resolve/populate/validate have no named actor; validation includes judgment-adjacent checks that may need a human, which is not stated either way.
- P2 (handoff-provenance): h.issue does not carry (and nothing here supplies) the 'authority to issue' that DOC-213's own entry contract separately requires.

---

## DOC-213 — Document Issuance

READINESS: NEEDS_CONTRACT_WORK

WHY:
The freeze/immutability logic and the issued-vs-effective distinction are both sound, but the entry contract requires 'the authority to issue it established' and no workflow in this batch — including the one real sender, DOC-212 — supplies or even names where that authorization comes from. An implementer cannot construct a valid entry into this workflow without inventing an authorization mechanism.

RESPONSIBILITY:
Freezes a validated draft into an immutable, identifiable issued version, and separately records whether the document's own terms make it effective immediately.

INSTANCE:
No instanceKey; identity is the document id + version id created by a.version. Clear once created; the gap is upstream of that (see entry).

ENTRY:
document_authorized_for_issuance, authoritative, explicitly requires 'a validated draft with the authority to issue it established' and explicitly states a validated draft alone is insufficient. The workflow is honest about needing this, but nothing in the DOC-21x cluster produces the authorization half of that pair — it may be supplied by a corpus journey outside this batch, but that cannot be confirmed here.

OWNERSHIP:
No actor named for a.version/a.freeze; 'the issuer' is recorded as a field but never assigned a role or defined as distinct from whoever authorized issuance.

ASSIGNMENT / QUEUE:
N/A — no queue modeled.

DATA:
Document id, version id, issue time, issuer, parties, content hash/reference, source context, and effective semantics (where defined) — a complete capture set for a frozen version.

EVIDENCE:
N/A — this is a freeze/state operation, not an evidentiary review.

AUTHORITY / APPROVAL:
This is the central gap: the workflow requires issuance authority to exist but neither defines who may grant it, nor receives it as a carried field on its one confirmed inbound handoff (DOC-212's h.issue). Cannot confirm whether self-approval is structurally possible because the approval step itself is undeclared.

IDEMPOTENCY:
N/A for the freeze action itself (a single version, created once by definition); no risk of duplicate issuance is visible within this workflow's own graph.

SLA / TIME:
N/A — no waits.

ESCALATION:
N/A — no escalation path; there is no branch for 'authority not established' because the trigger itself requires it be already true.

CANCELLATION / SUPERSESSION:
x.issued reEntry is correct and strict: any later change goes through the amendment lifecycle (DOC-217) rather than reopening or editing this version — matches the domain's core invariant.

HANDOFFS:
- h.effective → DOC-216: carries ["the issued version, its identifier and the semantics that make it effective","the explicit fact that effectiveness is still validated rather than assumed from issuance"]

COMPLETION:
ISSUED and immutable is a clean, well-scoped completion state, explicitly decoupled from 'effective' (a.not-effective is its own named outcome, not an error state) — a good example of not conflating adjacent states.

RESULT / FEEDBACK:
Propagates correctly onward to DOC-216 when effective-on-issue; x.issued (not-effective) is a legitimate terminal-for-now state with its own reEntry rather than a dead end.

CORRECTION / REOPEN:
N/A — an issued version is never reopened by design; correction is exclusively via DOC-217's successor mechanism.

OBSERVABILITY / AUDIT:
document_log captures issuer, time, hash/reference and semantics — adequate, except it never captures who/what authorized issuance, which is the same gap as above.

CONSUMER COVERAGE:
Classification: active. DOC-212's h.issue is the confirmed real sender; its carries satisfy the 'validated draft' half of the entry requirement but not the 'authority established' half.

TEST CASES:
- [handoff] Given: DOC-212 hands off a validated, ready draft → Expect: this workflow can determine whether issuance is actually authorized without inventing that authorization — currently it cannot, since neither the trigger's own definition nor the one real inbound handoff supplies it
- [completion] Given: a document whose own terms make it effective without signature → Expect: it is recorded ISSUED and immediately routed to DOC-216 for effectiveness validation rather than assumed effective here

GAPS:
- P1 (authority-approval): Entry requires 'authority to issue established' but no producer of that authorization is defined or carried by the one confirmed inbound handoff (DOC-212). Cannot confirm this is resolved elsewhere in the full 284-journey corpus from this batch alone.

---

## DOC-216 — Document Effectiveness Validation

READINESS: READY_WITH_MAPPING

WHY:
This is one of the strongest workflows in the batch: it explicitly re-reads current standing at the effective moment (c.still) before firing a.effective, correctly separates 'effective' from whatever it triggers downstream, and routes genuinely undefined effectiveness rules to DEC-181 rather than assuming. Only role/system mapping remains (who verifies signer authority, what the downstream activation system is).

RESPONSIBILITY:
Determines when a completed (signed, or self-effective) document actually starts having effect — which may be immediate, date-based, condition-based, or undefined — and re-validates the document's standing at that moment before declaring it effective.

INSTANCE:
No instanceKey; identity is the completed document version plus the effect it is to have. Scope note correctly separates 'this document is effective' from 'what it causes elsewhere,' which is its own lifecycle.

ENTRY:
document_completion_established, authoritative, requires either full valid signatures against one version or an issue-without-signature completion — precise and matches what DOC-213's h.effective supplies for the latter case; DOC-215 (customer surface) supplies the signature-completion case.

OWNERSHIP:
No actor named for validate/revalidate; signer-authority checking ('each signer held the authority they signed under') implies an external authority table, not defined here.

ASSIGNMENT / QUEUE:
N/A — no queue modeled.

DATA:
Signatures, versions signed against, signer authority, applicable conditions, and effective date — complete for the decision made.

EVIDENCE:
Signatures are the authoritative evidence; the workflow explicitly treats a signature against the wrong version, or by an unauthorized signer, as invalidating completion (a.invalid) rather than silently accepting it — good evidentiary discipline.

AUTHORITY / APPROVAL:
N/A as a grant-decision (nothing here approves anything); it is a validation of already-made signature authority, which is appropriately treated as input rather than re-decided.

IDEMPOTENCY:
N/A — this is a one-time-per-version validation, not a repeatable side-effecting action.

SLA / TIME:
Two explicit waits: w.effective (until the effective date, or earlier supersession/revocation) and w.condition (until a dependency resolves or becomes unsatisfiable), each with a timeout traced to the document's own effective date or 'the window the document or its process allows' — honestly sourced, not invented.

ESCALATION:
Undefined effectiveness rules (c.timing 'the rules do not define effectiveness') route to h.review → DEC-181 rather than assuming immediate or never — a direct, correctly-applied instance of never inventing legal/business effectiveness.

CANCELLATION / SUPERSESSION:
a.revalidate + c.still is exactly the freshness-before-decision check this round asks for: at the effective moment, it re-checks whether the version is still current, superseded, or revoked before committing to EFFECTIVE, routing to a.void if something replaced it first.

HANDOFFS:
- h.reconcile → DOC-220: carries ["the signatures, the versions each was made against, and the version claimed as current","the explicit fact that nothing has been made effective and nothing was corrected by overwriting"]
- h.review → DEC-181: carries ["the document, its signatures and what its terms do and do not say","the explicit fact that no legal or business effectiveness was invented - assuming it starts obligations nobody agreed to start"]
- h.downstream → external:operational-resolution: carries ["the effective version, its moment and its scope","the explicit fact that the receiving lifecycle activates on its own conditions - the contract is not the relationship, and a document being effective is evidence rather than activation"]

COMPLETION:
EFFECTIVE is explicitly the document's own state, separate from what it causes elsewhere — a clean instance of not conflating a document event with a business outcome (the same discipline the round asks for under 'terminality vs. the underlying obligation').

RESULT / FEEDBACK:
c.downstream correctly branches: only documents whose effect creates or changes business state elsewhere are hand off further (h.downstream); a purely self-contained effective document exits locally (x.effective) without a manufactured downstream signal.

CORRECTION / REOPEN:
x.not-effective explicitly preserves the signed record as history even though it never took effect — nothing is deleted, and a successor document runs its own effectiveness fresh rather than reusing this one's history.

OBSERVABILITY / AUDIT:
document_log captures validation failures by exact cause (wrong version / unauthorized signer), pending states with named dependency, and the effective moment with what made it so — strong semantic detail for audit.

CONSUMER COVERAGE:
Classification: active. DOC-213 (operational) and DOC-215 (customer) both send real handoffs matching this workflow's entry; DOC-286 references it only via distinctFrom prose.

TEST CASES:
- [stale-work] Given: a document reaches its effective date but was superseded or revoked in the meantime → Expect: a.revalidate/c.still catches this and routes to a.void rather than declaring it effective on stale standing
- [missing-evidence] Given: a signature is against the wrong version or by an unauthorized signer → Expect: completion is recorded as not established (a.invalid), naming exactly what fails, rather than treated as complete
- [escalation] Given: the document type's effectiveness rules are undefined → Expect: routed to DEC-181 rather than assumed effective-on-completion or never-effective

GAPS:
- P2 (other): Signer-authority verification is assumed available from an external table; not itself modeled or mapped here.

---

## DOC-217 — Document Versioning

READINESS: NEEDS_CONTRACT_WORK

WHY:
The lineage/prospective-application logic is sound, but the entry contract has the same undischarged 'authority established' hand-wave as DOC-213, with zero confirmed real senders in this batch (only a prose distinctFrom reference from DOC-219), and it is not stated whether a new draft created here is re-validated through DOC-212's readiness contract or bypasses it.

RESPONSIBILITY:
Turns an authorized document change into a traceable successor (new version or amendment), preserves the base version untouched, and applies the successor's terms only from its own effective conditions once it becomes authoritative.

INSTANCE:
No instanceKey; identity is the lineage itself (entity.note: 'a version without a recorded base and authority is an unrelated file that happens to share a name') — a good identity definition even without a formal key.

ENTRY:
authorized_document_change_required, authoritative, explicitly insufficient from 'an error being noticed' alone — precise in stating what's needed, but silent on who authorizes a change and how that authorization reaches this workflow.

OWNERSHIP:
No actor named for identify/new-version/amendment/lineage; who decides new-version vs. amendment (c.form) is not assigned to a role.

ASSIGNMENT / QUEUE:
N/A — no queue modeled.

DATA:
Base version, changed scope, authority for the change, effective semantics, and affected parties — complete as a spec, but 'authority for the change' is asserted as an input rather than sourced.

EVIDENCE:
N/A — this is a change-construction workflow, not an evidentiary review.

AUTHORITY / APPROVAL:
Same structural gap as DOC-213: the trigger requires authority to be already established, but no source for it is defined here or confirmed via a real inbound handoff.

IDEMPOTENCY:
No idempotencyKey on a.new-version/a.amendment; if the same change is triggered twice, nothing here prevents two competing successor drafts against the same base.

SLA / TIME:
w.approval has an explicit timeout tied to 'the window the change process allows,' with onTimeout → a.abandoned — honestly sourced, and the guardrail text explicitly names the risk being prevented ('a successor stuck in progress leaves two versions in play').

ESCALATION:
Undefined effective-timing (c.timing 'not defined') routes to h.review → DEC-181 rather than guessing — consistent with the domain's pattern.

CANCELLATION / SUPERSESSION:
a.abandoned leaves the base version 'unmarked' — explicitly avoiding a superseded-flag set in anticipation of a successor that never arrived. Good discipline against a state that would mislead readers of the base document.

HANDOFFS:
- h.review → DEC-181: carries ["the base, the successor and what the change does and does not state","the explicit fact that no effective date was assumed, so neither version has been made to govern anything it may not"]

COMPLETION:
x.superseded and x.unchanged are both clearly defined completion states, but 'successor authoritative going forward' (x.superseded) does not itself route through DOC-213's issuance freeze — it's unclear whether issuance already happened earlier in w.approval or is assumed to have happened silently.

RESULT / FEEDBACK:
Weak: no handoff is declared from the successful path (x.superseded) to any downstream consumer; contrast with DOC-211/212/213/216, which all declare an explicit forward handoff on their success path.

CORRECTION / REOPEN:
x.unchanged reEntry correctly allows a fresh attempt as a new successor against whatever version is current then, rather than resurrecting the abandoned one.

OBSERVABILITY / AUDIT:
document_log entries name lineage, authority and what changed — good, modulo the missing actor/authority source noted above.

CONSUMER COVERAGE:
Classification: event-driven. Zero confirmed handoff senders in this batch (DOC-219 references it only in prose via distinctFrom); the trigger event (an authorized change decision) is plausibly raised by change-management processes elsewhere in the corpus, so this is not necessarily an orphan, but it cannot be confirmed reachable from this batch alone.

TEST CASES:
- [duplicate-creation] Given: the same authorized change is triggered twice before the first successor resolves → Expect: a second successor draft is not created against the same base without being reconciled against the in-flight one
- [handoff] Given: a successor completes validation and is marked authoritative (x.superseded) → Expect: there is a defined path connecting this to DOC-213's issuance/freeze step, rather than an implicit assumption that issuance already happened
- [escalation] Given: a change process's window elapses before the successor completes → Expect: the change is recorded abandoned and the base version is left explicitly unmarked

GAPS:
- P1 (authority-approval): Same undischarged 'authority established' entry requirement as DOC-213, with no confirmed real sender for this workflow in this batch.
- P1 (handoff-provenance): No outbound handoff exists from the success path (x.superseded) to DOC-213 or any other consumer — the connection from 'successor authoritative' to actual issuance/propagation is undeclared.
- P2 (idempotency): No idempotencyKey on new-version/amendment creation; a repeated trigger for the same change could spawn competing successors.

---

## DOC-218 — Document Expiry Resolution

READINESS: READY_WITH_MAPPING

WHY:
Excellent discipline throughout: no expiry is invented where none is defined, dependent-process impact is scoped to what genuinely needs current validity rather than blanket-blocking, and the 'rules do not say what happens after expiry' case is explicitly escalated rather than guessed either direction. Only mapping (which processes/systems are the 'dependents') remains.

RESPONSIBILITY:
Handles a time-limited document reaching its defined expiry: determines which current/future processes actually depend on it, ends only that future reliance, and raises a replacement requirement only where rules mandate one.

INSTANCE:
No instanceKey; identity is the time-limited document itself. Concurrency is not addressed if the same document's expiry is evaluated twice (e.g., a scheduler re-firing) — see the P1 gap noted below at the DOC-211 boundary.

ENTRY:
document_validity_reaches_expiry, authoritative — a time-based system event, precise and not requiring external interpretation.

OWNERSHIP:
No actor named for dependents/expire/require-new/continue/block-future; plausibly a fully automated expiry-scanning process given the mechanical nature of the decisions, but not stated.

ASSIGNMENT / QUEUE:
N/A — no queue modeled.

DATA:
The document, its governing expiry rule, and the set of dependent processes — sufficient for the decisions made.

EVIDENCE:
N/A — determination is against defined rules and dependency records, not human evidence review.

AUTHORITY / APPROVAL:
N/A — no approval decision is made here; blocking/continuation follows whatever the governing rules already state.

IDEMPOTENCY:
No idempotencyKey on a.require-new; if expiry evaluation runs twice for the same document, it could raise two 'new document requirement' handoffs into DOC-211, which itself has no dedupe for concurrent requirement creation (see DOC-211 finding) — this is a real cross-workflow duplicate-creation path.

SLA / TIME:
N/A — no waits; the trigger is itself the deadline event.

ESCALATION:
c.continue's 'the rules do not say' branch routes to h.review → DEC-181 rather than defaulting to either stop-everything or continue-everything — directly matches the guardrail text about guessing being worse than either wrong answer.

CANCELLATION / SUPERSESSION:
N/A in the traditional sense — expiry is time-based, not a decision to cancel; x.no-expiry correctly routes any 'someone withdrew it' or 'something replaced it' scenario to revocation (DOC-219) or amendment (DOC-217) instead, keeping the three mechanisms distinct.

HANDOFFS:
- h.new → DOC-211: carries ["the expired artifact, its type, scope and parties","the explicit fact that the expired document remains a valid historical record of the period it covered"]
- h.review → DEC-181: carries ["the expired artifact and every process depending on it","the explicit fact that no blocking or continuation was assumed - guessing either stops work nobody stopped or continues work nobody authorized"]

COMPLETION:
All three non-no-expiry exits (x.expired-continuing, x.expired-blocking) are honestly non-terminal status states, not a business-obligation-resolved claim — consistent with expiry being a document state rather than a case closure.

RESULT / FEEDBACK:
N/A beyond the two handoffs described; this workflow does not need to report back to a requesting party since it is not itself a request-driven case.

CORRECTION / REOPEN:
x.no-expiry reEntry correctly notes that later withdrawal or replacement runs through revocation/amendment respectively, not through this workflow being re-entered.

OBSERVABILITY / AUDIT:
document_log distinguishes EXPIRED from LOST-reliance-blocking vs continuing, and records exactly which future actions are blocked — good granularity.

CONSUMER COVERAGE:
Classification: event-driven. No confirmed handoff senders in this batch; the trigger (a document reaching a defined expiry) is plausibly raised by an automated expiry-monitoring process, which is the expected shape for this kind of entry point rather than a defect.

TEST CASES:
- [duplicate-creation] Given: expiry evaluation for the same document runs twice (e.g. scheduler re-fire) → Expect: at most one 'new document requirement' handoff reaches DOC-211 for this expiry — currently unguarded
- [escalation] Given: governing rules do not state what happens to dependent processes after expiry → Expect: routed to DEC-181 rather than defaulted to block-everything or continue-everything

GAPS:
- P1 (idempotency): No idempotencyKey on a.require-new; combined with DOC-211's own lack of create-side dedupe, a repeated expiry evaluation can raise duplicate document requirements.

---

## DOC-219 — Document Revocation Reconciliation

READINESS: READY_WITH_MAPPING

WHY:
Strong scope discipline (a.scoped explicitly limits blast radius to what the revocation names) and explicit non-inference of retroactivity (a.no-retro is a named, deliberate outcome, not a fallback). Only the revoking authority's identity needs mapping.

RESPONSIBILITY:
Records an authority's decision to withdraw a document, applies exactly the revocation's own stated scope (not wider), and applies retroactive consequences only where the revocation explicitly states them.

INSTANCE:
No instanceKey; identity is the revoked document version plus the specific revocation acting on it. Entity note is explicit that the revocation's scope, not the whole document, is the true unit of effect.

ENTRY:
authoritative_revocation_occurs, authoritative, with two explicit insufficientAlone guards (expiry is not revocation; a successor being issued is not revocation) — precise and correctly distinguishes this from the two adjacent DOC lifecycles.

OWNERSHIP:
No actor named for record/state/dependents/block/scoped/retro/no-retro; 'an authority entitled to make it' is required by the trigger's evidence.requires but never named even abstractly (legal, compliance, contract owner).

ASSIGNMENT / QUEUE:
N/A — no queue modeled.

DATA:
Revoked version, authority, reason and category, revocation time, and the revocation's own effective/scope/retroactivity semantics — complete for the decisions made.

EVIDENCE:
N/A — this processes an already-made authoritative revocation decision rather than evaluating evidence toward one.

AUTHORITY / APPROVAL:
The revocation decision itself is asserted as already authoritative (made outside this workflow); this workflow only applies it faithfully to its stated scope, which is the correct division of responsibility — but the authority role is never named, which is a mapping gap rather than a logic gap.

IDEMPOTENCY:
N/A for the state-recording actions (single revocation, single record); h.new → DOC-211 carries the same cross-workflow duplicate-creation exposure noted for DOC-218, since DOC-211 has no create-side dedupe.

SLA / TIME:
N/A — no waits; revocation is immediate given an authoritative event.

ESCALATION:
N/A — no undefined-rules escalation path exists here, unlike its DOC-216/217/218 siblings; if the revocation's own scope statement is ambiguous, there is no declared fallback to DEC-181. This is a minor inconsistency with the domain's own established pattern.

CANCELLATION / SUPERSESSION:
x.revoked reEntry correctly treats a later withdrawal or narrowing of the revocation itself as a further authoritative act recorded on top, never as clearing the original record — consistent history preservation.

HANDOFFS:
- h.new → DOC-211: carries ["the revoked artifact, its scope and the reason it was withdrawn","the explicit fact that the replacement is a new artifact rather than a reissue of the revoked one"]

COMPLETION:
REVOKED is a clean, well-scoped completion state, explicitly preserving history rather than deleting it (a.state's own text: 'deleting it destroys the explanation for actions that were entirely correct at the time').

RESULT / FEEDBACK:
Propagates correctly to DOC-211 when replacement is required; x.revoked is a legitimate terminal-for-now state otherwise.

CORRECTION / REOPEN:
Handled via reEntry on x.revoked as described above — a further authoritative act layers on top rather than mutating history.

OBSERVABILITY / AUDIT:
document_log captures reason, category, scope and retroactive consequence explicitly — strong audit detail.

CONSUMER COVERAGE:
Classification: event-driven. No confirmed handoff senders in this batch (DOC-218 references it only via distinctFrom prose); the trigger is plausibly raised by a legal/compliance/authority action elsewhere in the corpus.

TEST CASES:
- [handoff] Given: a revocation that still requires a replacement artifact → Expect: h.new supplies DOC-211 everything it needs, including the explicit non-reissue fact
- [correction] Given: a revocation is itself later narrowed or withdrawn by the authority → Expect: this is recorded as a new authoritative act on top of the original revocation, not as an edit erasing it

GAPS:
- P2 (sla-escalation): Unlike its DOC-216/217/218 siblings, there is no declared escalation path for an ambiguous or self-contradictory revocation scope statement.
- P2 (ownership): The revoking 'authority' is required by the trigger but never named even abstractly.

---

## FIN-132 — Payment Outcome Resolution

READINESS: READY_WITH_MAPPING

WHY:
This is a model for the round's idempotency expectations: the idempotency key is persisted before submission, an ambiguous outcome window is treated as genuinely unknown (never blindly retried), and replacement payments are explicitly suppressed while unknown. Only provider/system mapping remains.

RESPONSIBILITY:
Tracks a single payment attempt from initiation through an authoritative success/failure/unknown outcome, routing to the correct downstream financial workflow for each case.

INSTANCE:
entity.scope is explicitly 'the individual payment attempt, keyed by its own idempotency key and provider reference' — a clear, explicit identity, one of the few in this batch with a real key concept even without a formal instanceKey field.

ENTRY:
payment_attempt_initiated, authoritative, with two explicit insufficientAlone guards (a button click, an HTTP success) — precise and correctly distinguishes UI-level events from an authoritative payment-system acceptance.

OWNERSHIP:
No human owner is named or needed — this is a fully automated payment state machine by design (purpose: 'keep initiating and knowing what happened as separate states'); N/A is the honest answer here, not a gap.

ASSIGNMENT / QUEUE:
N/A — automated processing, no queue.

DATA:
Attempt id, amount, currency, method reference, target obligation, provider reference, idempotency key, initiation time — complete.

EVIDENCE:
N/A — outcome is established by the authoritative payment system, not evaluated evidence.

AUTHORITY / APPROVAL:
N/A — no approval decision occurs in this workflow.

IDEMPOTENCY:
Strong: the idempotency key is persisted before submission specifically so a later retry or reconciliation is safe — explicitly stated as the reason for the ordering, not an incidental detail.

SLA / TIME:
w.outcome has an explicit timeout ('the payment outcome window') with onTimeout → h.unknown rather than assuming failure — the guardrail text is explicit that a timeout is not a failed payment.

ESCALATION:
On ambiguous outcome, escalates to FIN-135 with replacement-payment suppression until true state is established — a clean escalation that changes automation behavior (suppression) rather than leaving it running blind.

CANCELLATION / SUPERSESSION:
N/A — a payment attempt is not cancelled from within this workflow; a new attempt against the same obligation is its own instance with its own key.

HANDOFFS:
- h.satisfy → FIN-136: carries ["the attempt, its amount and its currency","the idempotency key, so the obligation records it exactly once"]
- h.capture → FIN-133: carries ["the authorization, its expiry and the obligation behind it","the explicit fact that funds are reserved rather than taken"]
- h.failure → FIN-134: carries ["the failure as the provider actually reported it, unclassified","the obligation, which the failure does not change"]
- h.unknown → FIN-135: carries ["the provider reference and the idempotency key needed to ask what actually happened","the explicit fact that this is unknown rather than failed"]

COMPLETION:
N/A locally — this workflow has no terminal exit of its own (exits: []); every path resolves via a handoff to the domain-appropriate next workflow, which is an appropriate router shape.

RESULT / FEEDBACK:
All four outcomes are routed to a distinct, outcome-specific consumer, so a receiver never has to parse ambiguous prose to know which case occurred.

CORRECTION / REOPEN:
N/A — handled entirely by the receiving workflows (FIN-133/134/135/136).

OBSERVABILITY / AUDIT:
payment_log records the attempt with its idempotency key and provider reference from the start, which is exactly what a later audit or reconciliation needs to ask the provider about a specific operation.

CONSUMER COVERAGE:
Classification: event-driven. No confirmed handoff sender in this batch (FIN-131 references it only via distinctFrom prose); payment initiation is plausibly triggered directly by checkout/customer-journey surfaces elsewhere in the corpus.

TEST CASES:
- [duplicate-creation] Given: a retry is attempted after the outcome window has already lapsed once → Expect: no new payment attempt is silently initiated while the original remains unknown; suppression holds until FIN-135 establishes the true state
- [handoff] Given: an outcome requiring capture → Expect: h.capture supplies FIN-133 with the authorization, its expiry and the target obligation, matching FIN-133's entry contract

GAPS:
- none recorded

---

## FIN-133 — Payment Settlement Lifecycle

READINESS: READY_WITH_MAPPING

WHY:
The three-state separation (authorized/captured/settled) is explicit and enforced structurally, not just in prose, and both waits have honestly-sourced timeouts routing to expiry or reconciliation rather than an invented deadline. Only provider/system mapping remains.

RESPONSIBILITY:
Models the real commitment states of money after authorization — reserved, captured, settled or released/expired — so an irreversible outcome is never granted against funds that have only been reserved or requested, not received.

INSTANCE:
entity.scope is the payment transaction across authorization/capture/settlement; identity is inherited from the upstream FIN-132 attempt (no separate instanceKey declared here).

ENTRY:
payment_authorization_succeeded, authoritative, requiring a confirmed authorization with its own validity window — precise and matches what FIN-132's h.capture supplies.

OWNERSHIP:
N/A — automated financial state machine, consistent with FIN-132; no human decision point exists in this graph.

ASSIGNMENT / QUEUE:
N/A.

DATA:
Authorization, capture and settlement records with their own timing — complete for the states modeled.

EVIDENCE:
N/A — states are established by the payment provider, not by human-evaluated evidence.

AUTHORITY / APPROVAL:
N/A — no approval decision occurs here.

IDEMPOTENCY:
Inherits the idempotency key carried in from FIN-132's h.capture; the capture/settlement request actions themselves are not shown with their own explicit idempotencyKey field, though the risk is low since each is a single state transition per authorization. Minor documentation gap rather than a live duplicate-effect risk.

SLA / TIME:
w.capture times out at the authorization's own validity window → a.expired; w.settle times out at 'the settlement window' → h.reconcile — both honestly sourced, neither invented.

ESCALATION:
A failed/absent settlement escalates to FIN-140 (reconciliation) rather than being silently retried — correct, treats a settlement mismatch as a reconciliation problem, not a payment retry problem (explicitly stated in the wait's own reason text).

CANCELLATION / SUPERSESSION:
a.released explicitly restores the obligation to outstanding rather than treating a cancelled authorization as a resolved one — correct separation of 'reservation returned' from 'obligation satisfied.'

HANDOFFS:
- h.satisfy → FIN-136: carries ["the transaction, its amount and its currency","the obligation it applies to"]
- h.reconcile → FIN-140: carries ["the capture record and what settlement was expected","the obligation, which has not been satisfied by a capture that did not settle"]

COMPLETION:
Captured is explicitly not equated with settled, and settled is explicitly not equated with the obligation being resolved by this workflow (that's FIN-136's job) — a clean, non-conflated completion boundary.

RESULT / FEEDBACK:
Both outcomes (satisfied, reconcile) are routed to distinct, outcome-appropriate consumers.

CORRECTION / REOPEN:
N/A — corrections to a settlement mismatch are FIN-140's responsibility, correctly deferred rather than duplicated here.

OBSERVABILITY / AUDIT:
payment_log distinguishes AUTHORIZED / RELEASED / EXPIRED / CAPTURED / SETTLEMENT_PENDING as separate named states — good granularity for later audit.

CONSUMER COVERAGE:
Classification: active. FIN-132's h.capture is the confirmed real sender, carrying the authorization, expiry, and obligation exactly as this workflow's entry requires.

TEST CASES:
- [stale-work] Given: an authorization expires before capture is requested → Expect: the reservation is released and the obligation remains outstanding, rather than an outcome being granted against expired funds
- [escalation] Given: settlement fails or never arrives within the settlement window → Expect: routed to FIN-140 for reconciliation rather than retried as if it were an ordinary payment failure

GAPS:
- P2 (idempotency): Capture/settlement request actions do not carry their own explicit idempotencyKey field distinct from the inherited attempt key; low risk but undocumented.

---

## FIN-135 — Unknown Payment Reconciliation

READINESS: READY_WITH_MAPPING

WHY:
Textbook unknown-state handling: unknown is never treated as failed, replacement attempts are suppressed for the duration, a late success is reconciled against the obligation's current balance rather than its balance at attempt time, and bounded reconciliation rounds escalate to a named external owner rather than retrying indefinitely.

RESPONSIBILITY:
Establishes the true outcome of a single payment attempt whose result was lost (timeout, dropped connection, incomplete callback), suppressing any replacement payment until the provider's authoritative answer arrives or bounded reconciliation is exhausted.

INSTANCE:
entity.scope is explicitly 'the single payment attempt whose outcome could not be established,' keyed by the same provider reference + idempotency key carried from FIN-132 — clear identity.

ENTRY:
payment_outcome_undeterminable, authoritative, requiring a genuine unresolvable event (timeout, interrupted connection, incomplete callback) — precise, matches FIN-132's h.unknown exactly.

OWNERSHIP:
N/A for the automated query/reconcile steps; external:finance-ownership is named as the human escalation point once bounded rounds are exhausted — an appropriately abstract role, not invented as a specific team.

ASSIGNMENT / QUEUE:
N/A until escalation, at which point it hands to the named external role rather than a modeled queue.

DATA:
Provider reference, idempotency key, amount, target obligation, last known state — complete and exactly what's needed to query the provider.

EVIDENCE:
The provider's own authoritative answer is the only evidence accepted; a customer's second attempt during the unknown window is treated as a correlation signal (routed to OPS-125), not as evidence of the first attempt's outcome — correct handling.

AUTHORITY / APPROVAL:
N/A — no approval decision; this workflow only discovers and applies an already-authoritative provider answer.

IDEMPOTENCY:
Strong: a.apply-once explicitly reconciles a late success against the obligation's current balance ('the balance moved while this was in flight') rather than blindly applying it against a stale snapshot — this is the freshness-before-decision discipline done correctly for a financial apply.

SLA / TIME:
w.reconcile times out at 'the reconciliation round window' → c.bounded, which checks a policy-defined round limit rather than inventing a retry count — matches the house rule against inventing numeric bounds.

ESCALATION:
c.bounded 'rounds exhausted' → h.manual (external:finance-ownership) is a correctly bounded escalation, not an infinite retry loop.

CANCELLATION / SUPERSESSION:
N/A — nothing here is cancelled; the workflow's entire purpose is determining what already happened.

HANDOFFS:
- h.satisfy → FIN-136: carries ["the attempt and its idempotency key","the fact that this arrived late, so the current balance is what it applies against"]
- h.failure → FIN-134: carries ["the confirmed failure and its reason","the obligation, still outstanding"]
- h.dedupe → OPS-125: carries ["logical_operation_key - this payment's own stable attempt identifier, the same value on both the first and second attempt - which is what OPS-125 compares against, not either attempt's own payment-provider reference","both attempts, their identifiers and the unresolved state of the first","the duplicate-charge risk, which is what makes correlation mandatory here rather than optimisation"]
- h.manual → external:finance-ownership: carries ["everything known about the attempt and every query made","the obligation and the customer, both of whom are waiting on an answer nobody has"]

COMPLETION:
No local exits — this workflow resolves exclusively via handoff to the outcome-appropriate consumer, an appropriate router shape given its purpose is purely to determine an outcome, not to hold state.

RESULT / FEEDBACK:
Each of the three possible findings (succeeded / failed / duplicate-attempt-arrived) is routed to a distinct consumer with the fact that this arrived late or via reconciliation explicitly carried — a receiver never has to infer this from prose.

CORRECTION / REOPEN:
N/A — this workflow itself is the correction mechanism for an earlier attempt; it does not reopen a prior closed instance.

OBSERVABILITY / AUDIT:
payment_log records PAYMENT_UNKNOWN immediately, then every query made, then the final outcome — a complete trail of what was tried before an answer was found.

CONSUMER COVERAGE:
Classification: active. FIN-132's h.unknown is the confirmed real sender. Verified per task instructions: the h.dedupe handoff to OPS-125 correctly declares logical_operation_key in both carries and contract.requiredFields, and the carries text explicitly explains why OPS-125 compares against that key rather than either attempt's own provider reference — this reads as correctly fixed and consistent with the Runtime Mechanism round's repair; no new issue found here.

TEST CASES:
- [duplicate-creation] Given: the customer retries payment while the original attempt's outcome is still unknown → Expect: the retry is correlated via logical_operation_key and handed to OPS-125 for deduplication, not charged independently
- [handoff] Given: the provider confirms a late success → Expect: the success is applied exactly once and reconciled against the obligation's current balance, not its balance at the time of the original attempt
- [escalation] Given: bounded reconciliation rounds are exhausted with no answer → Expect: escalated to external finance ownership rather than retried again or defaulted to failed

GAPS:
- none recorded

---

## FIN-138 — Refund Execution Verification

READINESS: READY_WITH_MAPPING

WHY:
Strong two-sided duplicate protection (a stable operation identity against duplicate refunds, suppression against replaying an unknown-outcome refund) and an explicit partial-refund state that carries the remaining refundable amount forward rather than leaving it implicit. Only provider/system mapping remains.

RESPONSIBILITY:
Executes an already-approved refund and independently confirms the funds actually returned, keeping 'approved' and 'refunded' as distinct, separately-verified states.

INSTANCE:
entity.scope is the approved refund plus the original transaction it targets; entity.note is explicit that a refund is a new financial event, not an edit to the original — good identity framing even without a formal instanceKey.

ENTRY:
refund_authorized_for_execution, authoritative, requiring an approved refund for a stated amount against a stated transaction — precise, and matches what FIN-137's h.execute supplies.

OWNERSHIP:
N/A for the execute/reconcile/verify steps — automated by design; the approval that authorizes this workflow's entry happens upstream (FIN-137 or REM-159/159's own compensation flow), correctly out of scope here.

ASSIGNMENT / QUEUE:
N/A.

DATA:
Approved amount, currency, original transaction — complete for execution.

EVIDENCE:
N/A — provider confirmation is the sole evidence, not evaluated by a human.

AUTHORITY / APPROVAL:
N/A here by design — this workflow only executes an already-approved refund; approval authority and any self-approval question belong to the upstream approving workflow, not this one.

IDEMPOTENCY:
Strong: submission occurs 'under a stable operation identity' explicitly to stop a retry or redelivered response producing a second refund; a.unknown explicitly suppresses replay for the same reason, in the same terms as the payment-side unknown handling.

SLA / TIME:
w.outcome times out at 'the refund outcome window' → a.unknown, honestly framed as 'a provider accepting the request is not the customer's funds having returned' — the exact FIN-132 discipline applied symmetrically to money moving the other direction.

ESCALATION:
c.retry is explicitly bounded ('the retry budget is spent') → h.reconcile(FIN-140) rather than retried indefinitely — no invented count, a policy-gated budget.

CANCELLATION / SUPERSESSION:
N/A — a refund in progress is not cancelled from within this workflow; it either completes, partially completes, or is handed to reconciliation.

HANDOFFS:
- h.reconcile → FIN-140: carries ["the approved refund, the original transaction and every attempt made","the customer's position, which is that a refund was approved and they have not received it"]

COMPLETION:
REFUNDED requires independent confirmation of the funds' actual return, not just the provider accepting the request — a clean instance of the round's 'provider accepted ≠ delivered' discipline.

RESULT / FEEDBACK:
x.refunded and x.partial are both explicit, distinguishable states; the partial state names exactly what remains owed rather than leaving it implicit.

CORRECTION / REOPEN:
x.refunded reEntry correctly treats any further refund against the same transaction as its own new request with its own approval, not a reopening of this one.

OBSERVABILITY / AUDIT:
refund_log records REFUND_PENDING, REFUNDED, partial amounts, and unknown-with-suppression states distinctly — good granularity.

CONSUMER COVERAGE:
Classification: active. FIN-137's h.execute is the confirmed real sender, carrying the approved amount, currency and original transaction plus the explicit 'nothing has moved yet' fact — matches this workflow's entry precisely.

TEST CASES:
- [duplicate-creation] Given: a refund request is retried or its response is redelivered → Expect: the stable operation identity prevents a second refund from being created
- [completion] Given: the provider accepts a refund request → Expect: REFUNDED is not recorded until the funds' actual return is independently confirmed
- [escalation] Given: a refund fails and the retry budget is exhausted → Expect: handed to FIN-140 for reconciliation rather than retried further

GAPS:
- none recorded

---

## FIN-139 — Financial Dispute Reconciliation

READINESS: READY_WITH_MAPPING

WHY:
Correctly refuses to treat an opened dispute as either fraud confirmed or a loss, submits before a deadline it treats as more decisive than the merits, and lets a genuinely undecided dispute stay UNKNOWN/PENDING rather than being forced to a resolution. Needs mapping of who internally prepares evidence and what threshold routes to risk assessment.

RESPONSIBILITY:
Runs a transaction-level dispute or chargeback through the external authority (card scheme/regulator) that actually adjudicates it, treating our role as representation rather than decision, and reconciles the financial position once — and however — that authority decides.

INSTANCE:
No instanceKey; identity is the dispute and the specific transaction it contests. Entity note correctly identifies the external authority, not this workflow, as the decision-maker.

ENTRY:
financial_dispute_opened, authoritative, with an explicit insufficientAlone guard (a customer complaint is not a dispute until raised with the body that can reverse the charge) — precise.

OWNERSHIP:
No internal actor is named for evidence collection/submission; 'our part is representation, not decision' is stated for the adjudication itself, which is correct, but who prepares the representation is unmapped.

ASSIGNMENT / QUEUE:
N/A — no internal queue is modeled for evidence preparation, though a real deployment would need one given the deadline sensitivity.

DATA:
Dispute id, transaction, amount, reason category, opened date, response deadline, external authority — complete.

EVIDENCE:
Evidence requirements are explicitly deferred to the authority's own category rules ('which the authority defines rather than we do') — correct, avoids inventing evidentiary standards the scheme doesn't require.

AUTHORITY / APPROVAL:
The decision authority is explicitly external (the card scheme/regulator); this workflow correctly never treats itself as deciding the dispute, and the outcome (WON/LOST/PARTIAL/WITHDRAWN) is accepted as given rather than second-guessed.

IDEMPOTENCY:
N/A — a dispute is a single external case; no duplicate-creation risk is present in this graph.

SLA / TIME:
The response deadline is externally supplied by the authority, not invented; a.submit explicitly treats missing it as more consequential than the merits of the case ('a deadline missed is usually decided against us regardless of what the evidence would have shown').

ESCALATION:
N/A in the traditional sense — there is no internal escalation ladder because the decision belongs entirely to an external authority; w.decision's timeout goes to x.pending (an honest unresolved state) rather than an internal escalation.

CANCELLATION / SUPERSESSION:
N/A — a chargeback cannot be cancelled by us once opened; WITHDRAWN is handled as the claimant's own action, correctly distinct from a decision in our favor.

HANDOFFS:
- h.risk → RSK-192: carries ["the dispute and its outcome","the explicit fact that a dispute is not a finding of wrongdoing - it is a signal to be evaluated, and most of them are not what they look like"]

COMPLETION:
x.reconciled requires the financial balance and related obligation actually adjusted per the outcome (won/lost/partial/withdrawn each specified distinctly), with the dispute's own history preserved regardless of outcome — a genuine business-completion check, not just 'case closed.'

RESULT / FEEDBACK:
c.relationship correctly separates 'financial only' (no further action) from 'warrants a relationship/risk assessment' rather than always escalating or never escalating.

CORRECTION / REOPEN:
x.reconciled reEntry correctly treats a further dispute on the same transaction as its own new instance with its own deadline, not a reopening.

OBSERVABILITY / AUDIT:
dispute_log records the reason category, deadline, evidence submitted, and the outcome without overwriting what was claimed and when — good history preservation even after resolution.

CONSUMER COVERAGE:
Classification: event-driven. No confirmed handoff senders; a dispute/chargeback is opened by an external card scheme or regulator, which is the expected external trigger shape for this entry point, not a defect.

TEST CASES:
- [escalation] Given: the authority does not decide within its own decision horizon → Expect: the dispute remains UNKNOWN/PENDING rather than being defaulted to won or lost
- [completion] Given: the authority returns LOST → Expect: funds are reversed and whatever the dispute discharged is reopened, with the dispute's own submission history preserved rather than overwritten

GAPS:
- P2 (ownership): No internal role or queue is named for evidence preparation/submission ahead of the authority's deadline.

---

## FIN-140 — Financial Reconciliation

READINESS: READY_WITH_MAPPING

WHY:
One of the strongest workflows in the batch: it never deletes inconvenient history, never treats the newest record as automatically correct, applies corrections idempotently as new explanatory records, explicitly refuses to net across currencies, and reports an uncovered mismatch honestly rather than inventing accounting treatment.

RESPONSIBILITY:
Explains and corrects a detected mismatch across financial records (payment/obligation/refund/settlement) through an explicit, policy-governed, auditable adjustment, or reports it plainly as unresolved when no accounting policy covers it.

INSTANCE:
entity.scope is explicitly the set of disagreeing records across systems (transactions, obligations, refunds, settlement state together) — a genuinely multi-record identity, correctly distinguished from FIN-135's single-attempt identity.

ENTRY:
material_financial_mismatch_detected, authoritative, with a precise enumerated list of qualifying mismatches (succeeded payment with obligation still open, refund completed with unchanged balance, provider/local settlement mismatch, duplicate charge, missing transaction, incorrect partial balance) — unusually precise for an entry contract.

OWNERSHIP:
No actor named for collect/compare/correct/verify; who actually applies a.correct (an automated job vs. a finance operator) is unmapped, though the correction itself is described as idempotent and explicit either way.

ASSIGNMENT / QUEUE:
N/A — no queue modeled; external:finance-ownership receives unresolved cases at h.finance.

DATA:
Records from every relevant system, not just the one that raised the alarm — explicitly required, preventing a one-sided reconciliation.

EVIDENCE:
Cross-system authoritative records are the evidence; currency mismatches are explicitly treated as a context error rather than a discrepancy to net, preventing a confidently-wrong balance.

AUTHORITY / APPROVAL:
c.policy gates every correction on an existing accounting policy covering it; 'not covered' routes to a.unresolved rather than inventing a treatment — correct authority discipline (policy is the authority, not the operator's judgment).

IDEMPOTENCY:
Explicit: 'apply the correction idempotently as an explicit adjustment, preserving the adjustment history' — a new record explains the difference, the original is never edited or deleted.

SLA / TIME:
w.provider times out at 'the reconciliation window' → a.unresolved, honestly framed ('waiting past the window turns it into a permanent [unreliable balance]') rather than an invented duration.

ESCALATION:
Any case that can't be safely resolved (ambiguous records, uncovered policy, still-unbalanced after correction) routes to h.finance → external:finance-ownership rather than being forced closed.

CANCELLATION / SUPERSESSION:
N/A — reconciliation doesn't cancel anything; it corrects or reports.

HANDOFFS:
- h.finance → external:finance-ownership: carries ["every record collected, with its source, amount, currency and timestamp","the difference itself, and the invariant it breaks"]

COMPLETION:
x.reconciled requires every invariant to actually hold after the adjustment (c.balanced), not merely that a correction was applied — a genuine business-completion check rather than a 'correction attempted' claim.

RESULT / FEEDBACK:
N/A beyond h.finance — this workflow is itself the terminal reconciliation point for the financial domain's failure paths (fed by FIN-133 and FIN-138) rather than something with further downstream consumers.

CORRECTION / REOPEN:
x.reconciled reEntry correctly treats a further mismatch on the same records as its own new reconciliation, with the prior adjustment remaining in history.

OBSERVABILITY / AUDIT:
reconciliation_log preserves every record collected, the comparison made, the correction applied and the invariant check — a complete, explicit audit trail with no destructive overwrite anywhere in the graph.

CONSUMER COVERAGE:
Classification: active. FIN-133 and FIN-138 both send real h.reconcile handoffs matching this workflow's entry needs; FIN-135 references it only via distinctFrom prose, correctly distinguishing single-attempt-unknown from multi-record-mismatch.

TEST CASES:
- [correction] Given: records across systems disagree but the authoritative data determines what's true → Expect: a new explicit adjustment record is created; the original disagreeing records are preserved, not deleted or edited
- [missing-evidence] Given: no accounting policy covers the kind of difference found → Expect: recorded as FINANCIAL_RECONCILIATION_REQUIRED naming exactly what disagrees, rather than a treatment being invented
- [escalation] Given: a correction is applied but the state still does not balance → Expect: escalated to finance ownership rather than declared reconciled

GAPS:
- P2 (ownership): No actor named for collect/compare/correct/verify; unclear whether corrections are system-applied or require a finance operator's action.

---

## IDN-82 — Verification Dependency Resolution

READINESS: READY_WITH_MAPPING

WHY:
This is a well-specified workflow: the SLA is correctly sourced from the blocked process's own deadline rather than a fixed value, the three-way timeout outcome (expire/escalate/hold) avoids forcing a single default, and completion explicitly distinguishes 'verification satisfied' from 'process actually free to proceed' — a clean OPS-130-style application. Only a minor duplicate-initiation edge case is unaddressed.

RESPONSIBILITY:
Hold a verification requirement as its own state, blocking only the specific process that needs it, reusing existing valid verification where possible, and releasing the block only after the process's other requirements are rechecked.

INSTANCE:
No instanceKey (predates convention). Entity note is explicit and strong: 'One instance per requirement per blocked process. The same verification can unblock two processes and is not requested twice for them.'

ENTRY:
Trigger t.blocked (process_requires_verification), authoritative, requiring a named process plus a specific verification at a stated scope — explicitly rejects 'a general wish for higher identity confidence with no process waiting on it.'

OWNERSHIP:
Automated dependency tracking; deadline-overrun escalation hands accountability to OWN-55 by name — a genuine, named ownership-escalation mechanism rather than an invented team, which is the correct discipline this round asks for.

ASSIGNMENT / QUEUE:
N/A — dependency-gate logic; escalates ownership questions to OWN-55 rather than routing to an internal queue.

DATA:
a.record captures blocked process, verification needed, scope, assurance, reason, and deadline — explicitly avoids becoming 'a standing request for identity documents.'

EVIDENCE:
N/A — the verification's own evidentiary quality is explicitly deferred to the verification mechanism itself ('this journey owns only the dependency and the resumption').

AUTHORITY / APPROVAL:
N/A — no approval decision is made here; c.existing is a reuse check, not a judgment call.

IDEMPOTENCY:
c.existing correctly avoids duplicate verification requests when a currently-valid one already covers the requirement. Not addressed: two different blocked processes needing the same requirement concurrently could both call a.initiate before either sees the other's in-flight (not-yet-complete) verification — lower severity, likely mitigated by the underlying verification mechanism's own dedup.

SLA / TIME:
w.verification timeout explicitly sources from 'the deadline of the blocked process, or its SLA' rather than a fixed value, with the reasoning stated directly in-node: 'a blocked payment and a blocked profile update do not deserve the same patience.' A strong, correctly-scoped SLA example.

ESCALATION:
c.timeout offers three genuine outcomes (expire/escalate/hold) rather than forcing one default across very different blocked-process types — good unknown-outcome discipline.

CANCELLATION / SUPERSESSION:
No explicit cancel; x.expired models natural lapse, and x.held is explicitly recorded as held 'rather than left looking like an unnoticed stall.'

HANDOFFS:
- h.failure → IDN-84: carries ["the failure and the blocked process behind it","the deadline the process is running against, which the failure handling does not reset"]
- h.escalate → OWN-55: carries ["the blocked process, the requirement and what has been attempted"]

COMPLETION:
x.resumed vs. x.still-blocked is the clearest OPS-130-style completion discipline in this batch, stated almost verbatim in-node: 'verification succeeding does not guarantee the process will [succeed]... pretending this unblocked everything is how a customer is told twice that they are done.'

RESULT / FEEDBACK:
REL-91 and TRM-109 are both real, verified inbound handoff senders; RSK-195 references it only in prose (and, per RSK-195's own findings, that prose relationship isn't backed by a structural handoff on either side — noted there as the primary location for that gap).

CORRECTION / REOPEN:
x.expired / x.held / x.still-blocked all carry explicit reentry text; a new attempt opens its own dependency rather than reusing a lapsed one.

OBSERVABILITY / AUDIT:
verification_dependency_log entries at each transition — solid.

CONSUMER COVERAGE:
Classification: active. REL-91 and TRM-109 are real, carries-verified inbound handoff consumers; RSK-195 references it only via unbacked prose.

TEST CASES:
- [handoff] Given: an existing valid verification already covers the requirement at the required scope → Expect: it is reused and recorded as reused, not re-requested
- [completion] Given: verification succeeds but another requirement lapsed while it ran → Expect: x.still-blocked is reported honestly rather than claiming the process is now free to proceed
- [escalation] Given: the blocked process's deadline passes with verification still pending → Expect: expire, escalate to OWN-55, or hold visibly — depending on how the process matters, never a silent stall

GAPS:
- P2 (idempotency): No explicit dedup guard against two blocked processes concurrently triggering duplicate in-flight verification requests for the same requirement before either completes.
- P2 (handoff-provenance): RSK-195's claimed use of this mechanism (per its own distinctFrom prose) is not backed by a real handoff on either side — see RSK-195's findings for the primary write-up of this gap.

---

## IDN-83 — Document Verification

READINESS: READY_WITH_MAPPING

WHY:
Internal logic is sound and disciplined — correction rounds are policy-bounded rather than infinite, replacements supersede rather than delete history, and multi-requirement identity is explicitly kept separable. The one open question — no confirmed real consumer anywhere in the corpus for what reads as reusable evidence-validation infrastructure — is a traceability gap, not a defect in the workflow's own logic.

RESPONSIBILITY:
Keep 'a document was submitted' and 'a requirement was satisfied' as separate facts, validating a submission against exactly the specific requirement it was offered for, with acceptance never transferring to a different requirement.

INSTANCE:
No instanceKey (predates convention). Entity note is explicit: 'Acceptance is per requirement. The same document may satisfy one requirement and fail another with different acceptance rules, and both results are true at once.'

ENTRY:
Trigger t.submitted (document_submitted), authoritative, requiring a document submitted against an identified requirement — explicitly distinguishes 'uploaded' (a transfer) from 'submitted against' something.

OWNERSHIP:
a.validate is modeled as an inline (non-handoff) action, with no execution type declared and no field distinguishing automated system validation from human back-office review — a real company must map which this is at implementation. The workflow does correctly route exhausted-correction cases to DEC-181 for human judgment.

ASSIGNMENT / QUEUE:
N/A — automated pipeline with a policy-bounded correction loop and a single DEC-181 escalation.

DATA:
a.record and a.validate scope precisely to what the specific requirement cares about (type, ownership match, readability, completeness, validity dates, required fields, integrity/authenticity) — not a generic document check.

EVIDENCE:
Valid/correctable/invalid is a genuine three-way outcome, not forced into a binary — correctable failures name specifically what would fix them.

AUTHORITY / APPROVAL:
h.review → DEC-181 only after correction rounds are exhausted, and explicitly questions whether 'the requirement itself... may be the thing that is wrong rather than the documents' — a mature discipline against assuming the submitter is always at fault.

IDEMPOTENCY:
c.rounds bounds correction attempts against 'the policy limit' — deferred, not invented, matching the house rule against inventing a numeric retry count. No dedup guard against the same document being submitted twice concurrently for the same requirement (low severity).

SLA / TIME:
w.replacement timeout = 'the requirement's deadline, or this document's own validity end' — correctly conditional. onTimeout → x.expired, an honest lapse state rather than a silent failure.

ESCALATION:
c.rounds' policy-bounded limit routing to a person (DEC-181) rather than an automatic rejection is exactly the discipline this round's escalation-loop guidance calls for.

CANCELLATION / SUPERSESSION:
a.supersede explicitly links a replacement to the original and preserves both the original submission and its validation history — 'superseded rather than deleted... part of the record.'

HANDOFFS:
- h.review → DEC-181: carries ["every submission and why each was not accepted","the requirement itself, which may be the thing that is wrong rather than the documents"]

COMPLETION:
x.accepted is explicitly scoped ('ACCEPTED for the stated requirement') and never transferable — a fresh submission against a different requirement is assessed independently, matching the entity note precisely.

RESULT / FEEDBACK:
No real handoff consumers and no prose cross-references anywhere in this batch's dump, despite this reading as reusable evidence-validation infrastructure (comparable in role to IDN-82's collection mechanism). Given the internal design is sound and 'document_submitted against an identified requirement' plausibly has real callers elsewhere in the system (onboarding, KYC, dispute evidence) not captured by this dump, this is classified unconsumed-but-valid rather than orphan.

CORRECTION / REOPEN:
x.rejected / x.expired reentries are both explicit: a different document may be submitted without reassessing the rejected one unchanged; a new submission opens fresh with full history attached.

OBSERVABILITY / AUDIT:
document_log entries throughout, with explicit preservation through supersession — a strong trail, including the reason for every rejection.

CONSUMER COVERAGE:
Classification: unconsumed-but-valid. Empty consumers array (no real handoff, no prose reference) despite sound internal design — the OPS-126 precedent applies: design is sound, no confirmed real consumer in this corpus slice, plausibly wired to real callers outside this dump's visibility.

TEST CASES:
- [missing-evidence] Given: something specific but fixable is wrong with the submission → Expect: CORRECTION_REQUIRED names exactly what's wrong and what would fix it, rather than a bare rejection
- [escalation] Given: repeated corrections still fail to produce an acceptable document within the policy-defined round limit → Expect: hands to DEC-181, considering whether the requirement itself is the problem
- [correction] Given: a replacement document is submitted → Expect: the original stays readable and linked, not deleted, and validation history is preserved

GAPS:
- P1 (consumer-coverage): Zero corpus consumers — no journey in this dump hands a document submission into IDN-83, despite the entry contract requiring a caller-supplied 'identified requirement.' A real caller almost certainly exists in the actual system (compliance, onboarding, dispute evidence), but nothing wires it in this batch's data, so the entry contract can't be independently verified as satisfiable.
- P2 (other): a.validate's execution authority (automated system check vs. human back-office review) isn't declared — an expected implementation-mapping detail, not a contract defect.
- P2 (idempotency): No dedup guard against the same document being submitted twice concurrently for the same requirement.

---

## IDN-86 — Step-Up Authentication

READINESS: NEEDS_CONTRACT_WORK

WHY:
The freshness-before-execution discipline (a.revalidate re-checking authorization after the challenge rather than trusting the pre-challenge snapshot) is exactly right and explicitly reasoned in-node. But two verified structural gaps block safe implementation: a.revalidate — the single most consequential decision in the journey — has no declared log write anywhere in the source, and the sole resume handoff (h.resume) unconditionally targets ACC-75 even though IDN-85 is confirmed as a second, independent real caller into this workflow with no visible resumption path of its own.

RESPONSIBILITY:
Raise identity assurance for a sensitive action, scoped to that action only, then explicitly revalidate the action's own authorization before anything runs — a passed challenge never itself authorizes execution.

INSTANCE:
No instanceKey (predates convention). Entity note is explicit: 'The step-up is scoped to the action that required it. Raising assurance once does not open every sensitive action for the rest of the session' — good discipline against assurance leakage.

ENTRY:
Trigger t.stepup (action_requires_higher_assurance), authoritative, with concrete examples (sensitive account change, high-risk transaction, credential change, privileged action, unusual security context).

OWNERSHIP:
Fully automated preserve→initiate→wait→revalidate→resume-or-block pipeline; zero human ownership, zero DEC-181 handoff anywhere. This reads as a runtime authentication-gate mechanism rather than human-executed operational work (see boundary candidate).

ASSIGNMENT / QUEUE:
N/A — purely mechanical control flow.

DATA:
a.preserve captures the requested action's full context so it resumes rather than being reconstructed from memory — good UX/data discipline, though the preservation write is the only logged step in the entire journey (see audit gap).

EVIDENCE:
N/A — a technical assurance gate, not an evidentiary review.

AUTHORITY / APPROVAL:
N/A — no human approval; 'authorised' is a policy re-check (c.still), not a decision made here.

IDEMPOTENCY:
No idempotencyKey; two concurrent step-up challenges for the same pending action aren't explicitly guarded against, though the worst case (a redundant second challenge) is low severity, not a correctness break.

SLA / TIME:
w.stepup timeout = 'the step-up window' — deferred to policy. onTimeout → x.blocked, explicitly the fail-safe outcome ('needs no further decision').

ESCALATION:
N/A — no ladder; fails closed on timeout or failed challenge.

CANCELLATION / SUPERSESSION:
a.revalidate is the standout discipline in this journey: 'Passing a challenge raises identity assurance and authorises nothing — the entitlement, the resource or the policy can all have moved while the challenge was in front of the person.' Textbook freshness-before-execution, matching this round's own required vocabulary exactly. x.no-longer correctly refuses to run the stale action even after a successful challenge.

HANDOFFS:
- h.resume → ACC-75: carries ["the preserved action context and the raised assurance level","the fact that authorization is being decided now rather than inherited from before the challenge"]

COMPLETION:
x.blocked / x.no-longer are both correctly non-executing outcomes — the guardrail 'step-up success does not automatically execute the stale action' is honored structurally, not just stated.

RESULT / FEEDBACK:
ACC-75 and IDN-85 are both confirmed real senders per the dump's consumers array, but only ACC-75 has a confirmed return path via h.resume. IDN-85's own resumption contract is unverifiable from this batch.

CORRECTION / REOPEN:
x.blocked / x.no-longer reentries are both explicit: a fresh attempt issues a fresh step-up, with nothing queued to execute later, and the action is 'decided again' on its own terms.

OBSERVABILITY / AUDIT:
Verified directly against src/canonical/identity.ts: a.preserve is the only action in this journey with a `writes` field (authentication_log, append). a.initiate and a.revalidate both have no `writes` at all — meaning the safety-critical decision of whether a raised-assurance action is still authorized (c.still, driven by a.revalidate) leaves no audit record of what was checked or why. This is a genuine gap for the single most consequential step in the workflow.

CONSUMER COVERAGE:
Classification: active. ACC-75 and IDN-85 are both confirmed real inbound handoff senders per the dump, but only ACC-75 has a matching outbound resume path in IDN-86's own handoffs — IDN-85's receiver contract is unverifiable from this batch.

BOUNDARY CANDIDATE:
Suspected correct surface: runtime-mechanism (confidence: medium). Zero human ownership, zero queue, zero DEC-181 handoff — an entirely mechanical challenge/revalidate/resume control flow, closer in shape to an authentication gate than human-executed operational work. Impact if changed: Low for the required fixes (the audit and handoff gaps need addressing regardless of which round owns this workflow).

TEST CASES:
- [stale-work] Given: the step-up succeeds but the action's authorization conditions changed during the challenge → Expect: x.no-longer — the action does not run, and this decision needs an audit record it currently lacks
- [handoff] Given: IDN-85 (not ACC-75) originates the step-up requirement → Expect: unclear from source whether resumption reaches back to the IDN-85 caller or only to ACC-75
- [completion] Given: the step-up challenge fails or times out → Expect: x.blocked — the safe, fail-closed default, needing no further decision

GAPS:
- P1 (result-feedback): The sole resume handoff (h.resume) unconditionally targets ACC-75, but IDN-85 is a confirmed second real sender into this workflow with no visible resumption path of its own — a real implementer cannot construct IDN-85's receiver contract from what IDN-86 actually models.
- P1 (other): Verified against raw source: a.revalidate (the check of whether the requested action is still authorised after the challenge) has no `writes` field at all — the single most consequential decision in this journey produces no audit record of what was checked or why it passed or failed.
- P2 (idempotency): No explicit guard against two concurrent step-up challenges being issued for the same pending action.

---

## INC-251 — Incident Confirmation

READINESS: NEEDS_CONTRACT_WORK

WHY:
The correlation and evidence-classification logic is careful (explicit insufficientAlone guards against alert-volume and coincidence), but nobody is named as owning the INCIDENT_CANDIDATE while w.investigate is open, and nothing in the workflow prevents two independent correlation runs over overlapping-but-not-identical failure sets from opening two candidates for the same emerging incident.

RESPONSIBILITY:
Turns a correlated cluster of failures into an INCIDENT_CANDIDATE, investigates whether they share a cause, and either confirms an incident (handing off to INC-252) or rejects the correlation and lets the individual cases continue independently.

INSTANCE:
Work instance is the incident candidate plus its linked set of individual failure cases (entity.scope). No entity.instanceKey or concurrency policy is declared — this workflow predates that convention, so identity is only implied by 'the candidate' and the correlated entity set, not keyed formally.

ENTRY:
Trigger event correlated_failures_exceed_incident_threshold, evidence.source 'inferred' — entry is honestly self-described as inferred (a monitoring/correlation judgment), not authoritative fact. The 'meaningful correlation threshold' is named but its value is deliberately undeclared (policy-derived), which is correct per the house rule against inventing numbers, but a company still has to locate that policy before this is operable.

OWNERSHIP:
No queue or role is named for who runs a.correlate or resolves w.investigate. INCIDENT_CANDIDATE is a real state (guardrail: 'stops a hunch becoming a status-page announcement') but the workflow never says whose job it is to work the candidate before evidence resolves it — command/ownership is only assigned downstream, in INC-252, after confirmation.

ASSIGNMENT / QUEUE:
N/A — workflow never routes the candidate to a named queue or role before confirmation.

DATA:
Correlation dimensions (time, service/dependency, region, version, provider, resource cohort, failure signature, shared infrastructure) are named explicitly. Provenance of the underlying failure signals themselves (which monitoring/alerting system emits them) is implied, not stated.

EVIDENCE:
System-inference/behavioral-signal evidence: correlating dimensions matching (or not) across failures. The workflow explicitly guards against two forms of weak evidence being treated as sufficient (alert-volume spike; simultaneity alone) — good discipline distinguishing correlation from causation.

AUTHORITY / APPROVAL:
N/A — this is a diagnostic classification, not an approval gate; c.evidence is a judgment call with no named decision authority (see ownership).

IDEMPOTENCY:
No entity.instanceKey or ActionNode.idempotencyKey is declared on a.correlate/a.candidate/a.confirm (schema supports both; unused here). Duplicate-candidate prevention rests entirely on guardrail prose ('multiple failures are not automatically one incident'), which does not by itself stop two concurrent correlation passes over overlapping failure sets from each creating an INCIDENT_CANDIDATE.

SLA / TIME:
w.investigate has a named timeout attribute ('the candidate investigation window') with no numeric value given — honestly undeclared rather than invented. onTimeout falls through to a.reject (auto-closes as independent), which is a safe default but is a silent close, not an escalation.

ESCALATION:
N/A in this workflow — there is no escalation node; the timeout path leads to a.reject (closure), not to a named human decision-maker.

CANCELLATION / SUPERSESSION:
x.independent is explicitly non-terminal and re-enterable on further correlated evidence — rejecting now does not foreclose a later confirmed incident. No live work is 'cancelled' since the individual cases were never absorbed (guardrail preserves them throughout).

HANDOFFS:
- h.severity → INC-252: carries ["the correlating evidence and every individual affected entity, still linked and still holding its own case","the explicit fact that a shared cause is asserted and not yet known"]

COMPLETION:
There is no local 'incident confirmed' exit — confirmation is a handoff, not a terminal state of this workflow, which correctly reflects that INC-251's own job (deciding shared-cause-or-not) is what's actually complete, not the incident itself.

RESULT / FEEDBACK:
INC-252 is the only real consumer and can act on the carried evidence without re-deriving it from prose.

CORRECTION / REOPEN:
x.independent's reEntry clause explicitly allows a later confirmation on better evidence — correction is a live path, not a dead end.

OBSERVABILITY / AUDIT:
Every action appends to incident_log, giving a timeline of the correlation and its evidence, but the log never records who (if anyone) held the candidate during investigation — there is no ownership event to audit.

CONSUMER COVERAGE:
Classification: event-driven. consumers[] lists only INC-260 via prose distinctFrom (no viaHandoff) — nothing hands off *into* INC-251. Its own trigger is an inferred, monitoring-emitted event (correlated_failures_exceed_incident_threshold), the same shape as the corpus's other detection-entry points, so zero handoff consumers here is expected, not orphaning.

TEST CASES:
- [duplicate-creation] Given: two overlapping-but-not-identical failure clusters cross the correlation threshold within the same window → Expect: the workflow's own semantics do not prevent two INCIDENT_CANDIDATE records opening for what is really one emerging incident; a real implementation needs a claim/dedupe key this spec does not provide
- [stale-work] Given: w.investigate reaches its timeout with evidence still ambiguous → Expect: the candidate auto-rejects into x.independent rather than escalating to a human for a judgment call

GAPS:
- P1 (ownership): No owner/queue is named for the INCIDENT_CANDIDATE while w.investigate is open; investigation accountability is undefined until confirmation hands off to INC-252.
- P1 (idempotency): No instanceKey/idempotencyKey is declared for candidate creation, so nothing in the canonical spec stops two correlation runs over overlapping failure sets from opening duplicate candidates for the same emerging incident.
- P2 (sla-escalation): Investigation-window timeout silently rejects rather than escalating to a person for a final call — may be intentional (fail toward 'no incident'), but the spec doesn't say so explicitly.

---

## INC-252 — Incident Escalation

READINESS: READY_WITH_MAPPING

WHY:
Ownership is the strongest part of this round's batch here: a.command explicitly assigns incident command as execution:'human' and the entity.note is explicit that incident ownership and individual case ownership are separate and neither absorbs the other. Severity is anchored to impact, not event volume, and blast radius re-derivation before routing (c.expansion) is a real freshness check. A company mainly needs to map the 'operating model' the assignment defers to.

RESPONSIBILITY:
Takes a confirmed incident and establishes affected scope, actual-impact-based severity, and accountable operational command, re-deriving blast radius as it grows before routing to containment or investigation.

INSTANCE:
Work instance is the confirmed incident plus its blast radius and command assignment (entity.scope). No instanceKey/concurrency declared — predates the convention; identity is 'the confirmed incident' as handed off from INC-251.

ENTRY:
Trigger incident_confirmed, evidence.source 'authoritative', requiring a confirmed incident with correlating evidence and affected entities — precise and matches what INC-251 actually carries. insufficientAlone correctly excludes an unconfirmed alert or a single failed request.

OWNERSHIP:
a.command assigns incident ownership/command 'according to the operating model' (execution: human) and records it separately from case owners. This is a genuine transfer-of-ownership event with an explicit non-absorption rule — the strongest ownership statement in this batch. 'According to the operating model' is deferred to policy the source doesn't itself define (honest gap, not a defect).

ASSIGNMENT / QUEUE:
Routing criterion is the operating model (on-call/incident-command rotation implied, never named as a company-specific team) — abstract role only, as the methodology requires.

DATA:
Affected systems/capabilities/regions/customers/accounts/dependencies, start time, current impact, business criticality — a complete, named input set for the scoping action.

EVIDENCE:
System-inference (actual operational impact) is the basis for severity, with an explicit guardrail that event count is not evidence of severity — a real behavioral-inference-vs-authoritative distinction, correctly kept explicit rather than silently conflated.

AUTHORITY / APPROVAL:
N/A — no approval gate; command assignment is an ownership act, not an approval decision.

IDEMPOTENCY:
No instanceKey/idempotencyKey declared (predates convention); nothing in this workflow re-executes destructively, so duplicate-command-assignment risk is low but unproven structurally.

SLA / TIME:
N/A — no wait/timeout nodes in this workflow; it runs straight through to a handoff or the resolved-early exit.

ESCALATION:
N/A as a distinct escalation mechanic within this workflow — command assignment and blast-radius re-derivation (c.expansion) are the closest analogs, and both are handled explicitly (severity is re-derived, not just widened silently).

CANCELLATION / SUPERSESSION:
x.resolved-early is non-terminal and preserves the incident/evidence rather than deleting it — a self-resolving incident is recorded as having happened, not discarded.

HANDOFFS:
- h.mitigate → INC-253: carries ["the blast radius, the severity and the capabilities currently affected","the incident ownership, and the separate case ownerships that continue alongside it"]
- h.investigate → INC-255: carries ["the correlating evidence, the timeline and the affected cohort","the explicit fact that no mitigation has been applied, so the system is in its failed state rather than a modified one"]

COMPLETION:
This workflow's own completion is 'command established and routed' — it correctly does not claim the incident itself is resolved; x.resolved-early is the only local terminal-feeling state and it explicitly preserves the incident rather than closing it.

RESULT / FEEDBACK:
Both INC-253 and INC-255 are real, constructible handoff consumers; the routing decision (c.route) determines which one is invoked, and both branches carry what their own triggers require.

CORRECTION / REOPEN:
x.resolved-early's reEntry treats a later recurrence as a pattern against this record, not a fresh unrelated event — correction/reopen semantics are sound.

OBSERVABILITY / AUDIT:
incident_log captures scope, severity and command assignment as distinct entries — a real operator could reconstruct who was put in command and why the severity was set as it was.

CONSUMER COVERAGE:
Classification: active. consumers[] lists INC-251 with a real viaHandoff (h.severity) carrying exactly what this workflow's trigger requires.

TEST CASES:
- [escalation] Given: affected scope grows after the incident is already scoped and severity set → Expect: c.expansion re-derives severity from the new blast radius rather than routing on the stale one
- [handoff] Given: the incident needs immediate containment → Expect: h.mitigate carries current scope/severity/capabilities and the separate case-ownership fact, satisfying INC-253's trigger

GAPS:
- P2 (other): 'The operating model' that a.command assigns against is never itself defined in canonical source — a real implementation must map an actual on-call/command rotation to this node.

---

## INC-253 — Incident Containment

READINESS: NEEDS_CONTRACT_WORK

WHY:
The mitigation-vs-resolution discipline is exemplary (MITIGATED is explicitly not RESOLVED, every mitigation is recorded with its removal condition, the candidate search is guaranteed to terminate by list-exhaustion rather than a time or count limit). But the single most consequential judgment in the workflow — c.safe, 'is this mitigation safe to apply' — has no named decision authority and no execution:'human' flag, despite the guardrail text itself warning this is 'usually applied under pressure' and can make things worse than the original failure.

RESPONSIBILITY:
Searches a finite list of candidate mitigations, rejects unsafe ones, applies a safe one as an explicitly temporary workaround (never conflating mitigated with resolved), and routes to user communication and/or root-cause recovery.

INSTANCE:
Work instance is the incident plus the set of mitigations applied against it (entity.scope). No instanceKey/concurrency declared (predates convention); ownership of the incident itself is inherited from INC-252's command assignment, carried in via the handoff rather than re-established here.

ENTRY:
Trigger active_incident_requires_impact_reduction, evidence.source authoritative, requiring an active incident with ongoing reducible impact — precise, and matches what INC-252's h.mitigate carries.

OWNERSHIP:
Not re-assigned locally — the entity.note explains incident command (from INC-252) continues to run the systemic response while case owners keep their own obligations; this workflow operates under that inherited authority rather than declaring a new owner, which is consistent rather than a gap by itself.

ASSIGNMENT / QUEUE:
N/A — no queue routing in this workflow; it executes under the incident command already assigned upstream.

DATA:
Candidate mitigation list (feature disable, traffic shift, capacity increase, alternate provider, rate limiting, manual fallback, degraded mode, pausing unsafe operations) — a concrete, bounded option set with a guaranteed 'each rejected option is struck from the list' termination property.

EVIDENCE:
N/A — this is an action/decision workflow, not an evidentiary review; c.safe and c.sufficient are risk judgments, not evidence evaluations against a record.

AUTHORITY / APPROVAL:
Consequential and undefined: c.safe decides whether a mitigation's secondary effects are 'understood and acceptable' with no named approver and no execution:'human' tag anywhere in the workflow, despite the guardrail explicitly describing this as a high-stakes call made under pressure. A company implementing this has to invent who is allowed to say yes.

IDEMPOTENCY:
No instanceKey/idempotencyKey declared (predates convention); mitigation application is described in prose as scoped and reversible-by-condition, but not keyed against redelivery of the trigger event.

SLA / TIME:
N/A — no wait/timeout nodes; the workflow is a synchronous search-and-apply loop.

ESCALATION:
N/A as a distinct mechanic — a.no-mitigation is the closest analog (an honest 'nothing safe is available' outcome that hands straight to recovery rather than looping).

CANCELLATION / SUPERSESSION:
x.mitigated is explicitly non-terminal, reEntry describes the mitigation failing or impact regrowing as bringing the incident back to this workflow — mitigations are framed as reversible/temporary throughout, matching the entity.note.

HANDOFFS:
- h.communicate → INC-254: carries ["what is now available, what is still affected, and any safe workaround","the explicit fact that the state is mitigated rather than resolved, so the message does not claim a fix"]
- h.recovery → INC-256: carries ["the mitigations attempted, what each achieved and what remains affected","the explicit fact that containment is insufficient, so the corrective action is now the only path to reducing impact"]

COMPLETION:
MITIGATED is recorded as an explicit non-outcome relative to resolution (guardrail: 'mitigated is not resolved') — a genuinely disciplined completion contract that does not let a technical success (mitigation applied) stand in for the real obligation (cause fixed).

RESULT / FEEDBACK:
INC-252 (as the source of h.mitigate) and INC-257 (feeding back on relapse via h.active) are both real, constructible consumers.

CORRECTION / REOPEN:
A failed/insufficient mitigation routes back into the same search (c.sufficient → h.recovery, or reEntry from x.mitigated) rather than silently standing as done — correction is structurally present.

OBSERVABILITY / AUDIT:
incident_log entries record each rejected option and why, plus the applied mitigation's removal condition — a real operator could reconstruct the search, but not who approved the risk judgment, since none is recorded as an approver identity.

CONSUMER COVERAGE:
Classification: active. consumers[] shows two real handoff consumers: INC-252 (h.mitigate, feeding this workflow) and INC-257 (h.active, returning a relapsed incident here) — both carry what this workflow's trigger requires.

TEST CASES:
- [approval] Given: a candidate mitigation with real secondary-effect risk reaches c.safe → Expect: no named authority is defined to make that call — a company must assign one before this is safely executable
- [completion] Given: a mitigation is applied and holds → Expect: the incident is recorded MITIGATED, explicitly not RESOLVED, and stays open pending cause investigation

GAPS:
- P1 (authority-approval): c.safe (accept-or-reject a mitigation's secondary risk) has no named decision authority and no execution:'human' flag, despite the workflow's own prose describing it as a high-stakes call typically made under pressure.

---

## INC-255 — Root Cause Investigation

READINESS: NEEDS_CONTRACT_WORK

WHY:
The epistemic discipline is genuinely strong (correlation-is-not-causation is enforced at the branch level; 'unexplained' is a first-class, non-invented outcome rather than a forced guess; restoration and understanding are explicitly allowed to proceed independently). But every action in this workflow — including forming and testing hypotheses, which is squarely human judgment in most real incident-response practice — carries no execution flag at all, unlike INC-252's and INC-259's explicit execution:'human' tags elsewhere in the same file. A company cannot tell from this source whether root-cause work here is meant to be run by an engineer or an automated diagnostic system.

RESPONSIBILITY:
Runs a bounded hypothesis-test loop against collected incident evidence, rejecting hypotheses that don't explain the whole incident, recording an honest 'unexplained' outcome when the list is exhausted, and defining corrective action separate from any mitigation already holding the impact down.

INSTANCE:
Work instance is the incident plus its open causal investigation (entity.scope). Hypotheses are explicitly 'a finite list, tested one at a time' with rejections recorded so a later investigator doesn't retest them — a real (if informal) work-tracking discipline, though no instanceKey/concurrency is declared.

ENTRY:
Trigger incident_requires_causal_investigation, evidence.source authoritative, requiring a confirmed incident whose cause isn't established — precise, and correctly distinguishes 'has a trigger' (what set it off) from 'has a cause' (what made it possible).

OWNERSHIP:
Undeclared. Unlike INC-252 (a.command, execution:human) and INC-259 (a.review/a.assign/a.reopen-action, all execution:human), none of a.collect/a.hypothesise/a.test/a.reject/a.unexplained/a.confirmed/a.corrective carry an execution flag — the schema's own convention (execution?: 'communication'|'human', else implicitly automated/system) leaves this workflow reading as fully automated by omission, which does not match how root-cause investigation is normally staffed.

ASSIGNMENT / QUEUE:
N/A as declared — no queue/role is named; this is exactly the gap flagged under ownership.

DATA:
Timeline, logs/evidence, change history, dependency state, affected cohort, failure signatures, and mitigation effects — mitigation outcome is explicitly treated as evidence about the cause, a genuinely useful detail.

EVIDENCE:
Hypothesis-testing against the full evidence set, with an explicit standard: a hypothesis must explain the failure, its timing, its cohort, and its behavior under mitigation — not just the easiest-to-spot symptom. Rejections are recorded with reasons (guardrail against re-litigating a dismissed hypothesis).

AUTHORITY / APPROVAL:
Undefined for who confirms ROOT_CAUSE_CONFIRMED or signs off on 'unexplained' — c.supported and c.remaining are judgment calls with no named authority, compounding the ownership gap above.

IDEMPOTENCY:
N/A/undeclared — no instanceKey/idempotencyKey; this is a diagnostic workflow with no durable external side effects to duplicate.

SLA / TIME:
N/A — no wait/timeout nodes; the loop runs synchronously through hypotheses until one is confirmed or the list is exhausted.

ESCALATION:
N/A as a distinct mechanic in this workflow; h.review → DEC-181 on an unexplained incident is the closest analog and is handled as a real handoff, not a silent drop.

CANCELLATION / SUPERSESSION:
N/A — no exits/reopenable states are declared in this workflow (nodeCount shows zero exit kind); both terminal paths are handoffs (h.review, h.recovery).

HANDOFFS:
- h.review → DEC-181: carries ["every hypothesis tested and why each was rejected","the explicit fact that no cause was assigned - the incident is recorded as unexplained rather than closed against a guess"]
- h.recovery → INC-256: carries ["the confirmed cause, the evidence for it and the corrective action it implies","the mitigations currently in place, which the corrective action may make removable"]

COMPLETION:
'Unexplained' is treated as a legitimate, recorded completion state rather than forced into a false-positive root cause — matches the round's unknown-outcome discipline directly (dimension 20).

RESULT / FEEDBACK:
INC-252 is the real, constructible handoff consumer (h.investigate); DEC-181 and INC-256 are this workflow's own downstream consumers of its output.

CORRECTION / REOPEN:
N/A explicitly declared — no local reopen path; a later recurrence would presumably re-trigger causal investigation from scratch via INC-260's recurrence detection rather than reopening this specific run.

OBSERVABILITY / AUDIT:
incident_log records each hypothesis, its test, and its rejection reason — a genuinely good audit trail for a diagnostic process, though it never records who (or what) performed the diagnosis.

CONSUMER COVERAGE:
Classification: active. consumers[] lists INC-252 with a real viaHandoff (h.investigate), carrying the correlating evidence, timeline and cohort this workflow's trigger requires.

TEST CASES:
- [handoff] Given: every hypothesis within the investigation's bounds is tested and rejected → Expect: the incident is recorded unexplained and handed to DEC-181 rather than attributed to the least-bad remaining candidate
- [completion] Given: a hypothesis is confirmed → Expect: corrective action is defined separately from whatever mitigation currently holds the impact down; service restoration is not required to be blocked on this

GAPS:
- P1 (ownership): No action in this workflow carries an execution flag, so the source itself does not say whether hypothesis formation/testing is done by a human investigator or an automated system — a real implementation cannot route this work without inventing that answer.

---

## INC-256 — Service Recovery Verification

READINESS: READY_WITH_MAPPING

WHY:
This is one of the best-specified workflows in the batch: 'a recovery command succeeding is not service restored' is enforced structurally (c.applied and c.restored are separate steps), partial restoration stays explicit and keeps the incident open rather than being reported as success, and an unknown execution outcome explicitly suppresses further recovery action rather than risking a second cause stacked on an unconfirmed first attempt. The finite attempt list (a.next) gives a real termination guarantee without inventing a numeric retry cap.

RESPONSIBILITY:
Executes a corrective action from a finite, ordered list, verifies restoration against the actually-affected population (not the command's own return code), and routes to observation, escalation, or reconciliation depending on outcome — including an explicit unknown-outcome path that suppresses further recovery attempts.

INSTANCE:
Work instance is the incident, the specific recovery action in flight, and the capability it targets (entity.scope). Attempts progress through 'the response's defined list' rather than repeating — a genuine bounded-attempt discipline, though no instanceKey/concurrency is formally declared.

ENTRY:
Trigger recovery_action_authorized, evidence.source authoritative, requiring an authorized corrective/recovery action against an active incident — precise and correctly excludes an unauthorized ad hoc action.

OWNERSHIP:
Not re-declared locally; operates under the incident command established in INC-252/carried through INC-253 or INC-255. No new ownership ambiguity is introduced here.

ASSIGNMENT / QUEUE:
N/A — this is an execution/verification workflow, not one that routes to a queue.

DATA:
The corrective action itself plus its target scope; verification data required is explicit and appropriately broad (service availability, error rates, critical transactions, business functions, dependency health, and specifically the recovery of the cohort actually affected) — this directly forecloses the 'one successful synthetic check' failure mode named in the guardrails.

EVIDENCE:
Behavioral/system evidence from the affected population is explicitly required over the action's own self-reported success — a clean authoritative-vs-inferred distinction (action succeeded is not evidence users are unblocked).

AUTHORITY / APPROVAL:
N/A — no approval gate; this is verification, not a discretionary decision (c.restored classifies an observed state, it doesn't authorize an action).

IDEMPOTENCY:
No instanceKey/idempotencyKey declared (predates convention), but a.unknown explicitly holds further attempts and writes to suppressed_sends specifically because 'applying a second recovery action on top of one that may have landed is how an incident gets a second cause' — the intent is structurally sound even without a formal key.

SLA / TIME:
w.outcome has a named timeout ('the action's execution window') with the reason explicit (unknown outcome vs assumed failure) and onTimeout correctly routes to a.unknown rather than silently retrying — no numeric SLA is invented.

ESCALATION:
h.escalate → external:human-in-the-loop-lifecycle fires only once the defined action list is exhausted; ownership isn't dropped (the incident 'remains active' per the carried payload) and any partial restoration is named rather than counted as a win.

CANCELLATION / SUPERSESSION:
N/A explicitly — recovery actions are attempted in sequence to exhaustion or success; there's no separate cancel/supersede path here (that lives in the incident-level workflows around this one).

HANDOFFS:
- h.reconcile → external:external-status-reconciliation: carries ["the action, the scope it targeted and everything last known about its effect","the explicit instruction that no further recovery action is applied until this one's effect is known"]
- h.escalate → external:human-in-the-loop-lifecycle: carries ["every action attempted, what each achieved and the scope still affected","the explicit fact that the incident remains active and any partial restoration is named rather than counted as recovery"]
- h.observe → INC-257: carries ["what was verified, across which cohort and against which functions","the explicit fact that this is a first good signal rather than a stable recovery"]

COMPLETION:
RECOVERY_OBSERVED is explicitly framed as a first signal, not a stable outcome ('not that it will still be working in an hour, which is the next question and a different one') — a precise, non-overclaiming completion contract that correctly hands the 'is it actually stable' question to INC-257.

RESULT / FEEDBACK:
INC-257 receives a constructible handoff; the external reconciliation and human-in-the-loop targets are outside this batch's scope but are named with clear carried payloads.

CORRECTION / REOPEN:
N/A within this workflow's own boundary — a failed/unknown outcome routes forward (reconcile or escalate) rather than reopening a prior state; that's appropriate since this workflow doesn't own a closable case itself.

OBSERVABILITY / AUDIT:
incident_log plus suppressed_sends together record what was attempted, its outcome class, and any suppression of further action — good minimum auditability for a recovery attempt.

CONSUMER COVERAGE:
Classification: active. consumers[] lists INC-253 (h.recovery, containment insufficient) and INC-255 (h.recovery, confirmed cause with corrective action) as real handoff sources feeding this workflow.

TEST CASES:
- [stale-work] Given: an executed recovery action's outcome cannot be confirmed within its execution window → Expect: the outcome is recorded UNKNOWN and further recovery actions are suppressed rather than a second action being layered on an unconfirmed first one
- [completion] Given: verification shows only part of the affected population recovered → Expect: the incident stays active with the unresolved scope explicitly named, rather than being reported as recovered

GAPS:
- none recorded

---

## INC-257 — Recovery Stability Monitoring

READINESS: READY_WITH_MAPPING

WHY:
This workflow correctly implements the 'buffer before declaring healthy' pattern the corpus already uses elsewhere (explicitly cross-referenced to RET-27's relationship-recovery buffering as the same discipline applied to a shared operational failure). Relapse reopens the same incident (not a fresh one), which preserves the pattern-recognition value the guardrails call out, and coincidental new failures during the window are explicitly kept from making the incident 'unfalsifiable.'

RESPONSIBILITY:
Holds a recovered incident in observation for a window sized to the incident's own character, distinguishing a genuine relapse of the same failure (which reopens the same incident) from an unrelated new failure (assessed separately), and only declares STABLE_RECOVERY once the window elapses without recurrence.

INSTANCE:
Work instance is the incident under observation plus its window (entity.scope). No instanceKey/concurrency declared. The observation window itself is explicitly not a fixed/standard duration — it's derived per-incident from manifestation time, path frequency, and cause-vs-symptom character, which is honest rather than invented, though it does mean two different incidents get incomparable window lengths by design.

ENTRY:
Trigger material_recovery_observed, evidence.source authoritative, requiring verified restoration across the affected population — correctly distinguishes the signal (population-level verification) from what produced it (a recovery action completing), matching INC-256's own discipline.

OWNERSHIP:
Not re-declared; continues under the incident's existing command. No ambiguity introduced here specifically.

ASSIGNMENT / QUEUE:
N/A — no queue routing; this is a wait-and-classify workflow.

DATA:
The incident's own recovery characteristics (manifestation time, path frequency, cause-vs-symptom) feed the window; during the wait, the relevant data is whether the incident's own failure signature recurs vs. an unrelated new failure appears.

EVIDENCE:
System/behavioral evidence: recurrence of the incident's own signature (relapse) vs. an unrelated failure (kept separate) — c.relapse's two branches are a clean, evidence-grounded distinction.

AUTHORITY / APPROVAL:
N/A — no approval step; window-sizing and relapse classification are system judgments, not discretionary human sign-offs, and nothing here elevates that to a gap since neither carries irreversible consequence beyond routing.

IDEMPOTENCY:
N/A/undeclared structurally; the workflow doesn't create durable external effects that need dedup — it's a wait-and-classify state.

SLA / TIME:
w.observe's timeout is explicitly 'the observation window set for this incident' (per-incident, not a fixed corpus-wide value) with onTimeout correctly routing to a.stable — matches the house rule against inventing a universal duration.

ESCALATION:
N/A as a distinct mechanic — relapse (h.active back to INC-253) is the closest analog and is handled as a real handoff carrying the relapse signature and 'evidence the confirmed cause was incomplete', not a bare re-trigger.

CANCELLATION / SUPERSESSION:
x.separate is non-terminal; an unrelated failure raised during observation continues its own assessment, and reEntry allows later correlation on real evidence if the two do turn out to share a cause — no forced merge, no lost thread.

HANDOFFS:
- h.active → INC-253: carries ["the recovery that was applied, how long it held and the signature of the relapse","the explicit fact that this is the same incident recurring, which is evidence the confirmed cause was incomplete"]
- h.resolve → INC-258: carries ["what was observed, over what window and across which cohort","the mitigations still in place, which the resolution has to remove or formalize rather than leave running"]

COMPLETION:
STABLE_RECOVERY explicitly records what was observed and for how long, and the record is stated to inform the next similar incident's window — completion here is evidence-based, not just 'time elapsed.'

RESULT / FEEDBACK:
INC-256 is the real handoff source (h.observe); INC-253 and INC-258 are the real downstream consumers of this workflow's two outcomes.

CORRECTION / REOPEN:
A relapse explicitly resumes 'this incident' rather than opening a new one — the reEntry text is explicit that this is deliberate so the recurrence pattern stays visible, a strong correction-vs-new-episode judgment.

OBSERVABILITY / AUDIT:
incident_log records the observation window's basis, what appeared during it, and the final classification — sufficient for an operator to see why the window was sized as it was and what ended it.

CONSUMER COVERAGE:
Classification: active. consumers[] lists INC-256 with a real viaHandoff (h.observe) carrying the verified-restoration evidence this workflow's trigger requires.

TEST CASES:
- [reopen] Given: the same failure signature returns during the observation window → Expect: the original incident is returned to ACTIVE (not a new incident opened) and handed to INC-253
- [completion] Given: the observation window elapses with no recurrence → Expect: STABLE_RECOVERY is recorded with what was observed and over what window, and the incident proceeds to INC-258

GAPS:
- none recorded

---

## INC-258 — Incident Closure Reconciliation

READINESS: NEEDS_CANONICAL_CHANGE

WHY:
Most of the workflow is well-built (temporary mitigations cannot silently become permanent controls; detached cases are explicitly not closed by the incident closing; obligations and post-incident review are routed rather than dropped). But c.mitigations ('What happens to the temporary mitigations?') has only two branches — 'safe to remove' and 'should become permanent' — and the graph is structurally reachable via INC-252→h.investigate→INC-255→h.recovery→INC-256→h.observe→INC-257→h.resolve→INC-258 without ever passing through INC-253, meaning an incident can arrive here having applied zero mitigations. Neither branch's 'when' clause is satisfiable in that case, which is a missing decision branch for a reachable state, not a hypothetical one.

RESPONSIBILITY:
Closes the shared systemic incident (stopping emergency operations, resolving temporary mitigations to removed-or-formalized, detaching still-open individual cases to continue on their own, and routing residual obligations and review-eligible incidents onward) while explicitly not treating incident resolution as resolving every entity-level consequence.

INSTANCE:
Work instance is the incident plus every linked case and obligation still attached to it (entity.scope). No instanceKey/concurrency declared.

ENTRY:
Trigger incident_resolution_criteria_satisfied, evidence.source authoritative, requiring a stable recovery *and* the incident's own resolution criteria met — correctly distinguishes 'service restored' (one criterion) from 'resolved' (all of them).

OWNERSHIP:
Not re-declared; presumably still the incident command from INC-252, now closing out. No new ambiguity beyond the missing-branch issue above.

ASSIGNMENT / QUEUE:
N/A — no queue routing in this closure workflow.

DATA:
Timeline, mitigations, decisions taken, resolution criteria — the record a.resolve preserves is explicitly the input the post-incident review and future-recurrence comparisons will use.

EVIDENCE:
N/A for this workflow's core purpose — it's a closure/reconciliation process, not an evidentiary review (that's INC-255's and INC-259's job).

AUTHORITY / APPROVAL:
c.mitigations decides whether a temporary control becomes a permanent formalized change (a.formalize) — a real, semi-irreversible decision with no named approver, though this is secondary to the missing-branch defect above.

IDEMPOTENCY:
N/A/undeclared structurally; no durable redelivery concern is described for this workflow's actions.

SLA / TIME:
N/A — no wait/timeout nodes; this workflow runs synchronously through its condition chain to an exit or handoff.

ESCALATION:
N/A as a distinct mechanic in this workflow.

CANCELLATION / SUPERSESSION:
x.resolved is explicitly non-terminal, with reEntry stating a later recurrence is correlated against this closed record — closure doesn't foreclose reopening the *question* even though the incident record stands.

HANDOFFS:
- h.remedy → REM-157: carries ["the obligations, their affected scope and what created them","the explicit fact that the incident is resolved and these are not - they run on their own lifecycle at their own pace"]
- h.review → INC-259: carries ["the timeline, the mitigations, the decisions and the root cause where one was confirmed","the detached cases and surviving obligations, which are part of the incident's real cost"]

COMPLETION:
RESOLVED is explicitly a statement about the shared cause only — the entity.note and guardrails are unusually clear that entity-level obligations are not closed by this, matching the OPS-130 precedent (technical/systemic completion is not business completion) directly and by name-worthy analogy.

RESULT / FEEDBACK:
INC-257 is the real handoff source (h.resolve); REM-157 and INC-259 are real downstream consumers of this workflow's outputs.

CORRECTION / REOPEN:
reEntry on x.resolved explicitly treats later recurrence as evidence against this closed record rather than silently rewriting it — sound correction semantics for the incident-level record.

OBSERVABILITY / AUDIT:
incident_log preserves the full timeline and every decision taken during closure — a real reviewer could reconstruct what was removed, formalized, detached, and routed onward.

CONSUMER COVERAGE:
Classification: active. consumers[] lists INC-257 with a real viaHandoff (h.resolve) carrying the stable-recovery evidence and outstanding-mitigation state this workflow's trigger and c.mitigations both need.

TEST CASES:
- [completion] Given: an incident reaches closure via the investigation-first path (INC-255→INC-256→INC-257) having never applied any mitigation in INC-253 → Expect: c.mitigations has no branch whose condition is satisfiable — the canonical graph needs a third branch ('no mitigations were applied') to avoid an implementer inventing behavior here
- [correction] Given: the same systemic weakness later recurs after this incident closed → Expect: the recurrence is compared against this preserved record rather than assessed from nothing

GAPS:
- P0 (other): c.mitigations ('what happens to the temporary mitigations') has exactly two branches (remove-safely / formalize-as-permanent), both of which require at least one mitigation to have existed. The graph is structurally reachable with zero mitigations applied (via the investigate-first path through INC-255/256/257, bypassing INC-253 entirely), leaving that reachable state with no defined outcome — a missing decision branch per this round's own NEEDS_CANONICAL_CHANGE criteria.
- P1 (authority-approval): Formalizing a temporary mitigation as a permanent change (a.formalize) has no named approver despite being a durable, semi-irreversible operational decision.

---

## INC-259 — Post-Incident Review

READINESS: READY_WITH_MAPPING

WHY:
This is the best-owned workflow in the batch: a.review, a.assign, and a.reopen-action are all explicitly execution:'human', assignment carries named owners and deadlines (not just a task list), 'no corrective work required' is a legitimate first-class recorded outcome, and effectiveness is verified against the actual risk condition rather than accepted on the owner's say-so. The escalation path (deadline slip → OWN-55) keeps the risk visible rather than letting prevention work silently die.

RESPONSIBILITY:
Reviews a resolved, review-eligible incident end to end, identifies evidence-backed corrective/preventive work, assigns it to named owners with deadlines, verifies completed work actually reduced the risk (not just that a document was published), and escalates work that slips past its deadline.

INSTANCE:
Work instance is the resolved incident's review plus the corrective-action items it produces (entity.scope). The entity.note is explicit that 'the review's output is owned work with deadlines' and a published document is not itself the deliverable — a real completion-contract statement, though no instanceKey/concurrency is formally declared.

ENTRY:
Trigger incident_qualifies_for_review, evidence.source authoritative, requiring a resolved incident meeting a policy-defined review threshold — correctly excludes both an incident that didn't meet the threshold and an ad hoc request for review outside policy.

OWNERSHIP:
a.assign explicitly assigns owners and deadlines per corrective action (execution: human) — real, per-item ownership transfer, not a single blanket assignment. a.reopen-action returns ineffective work to its existing owner (also human) rather than reassigning silently.

ASSIGNMENT / QUEUE:
Assignment is per-action to named owners (abstract — 'owners', not a specific team) with deadlines; the workflow doesn't itself define a queue mechanism beyond that, which is appropriate for its scope.

DATA:
Timeline, detection, response, root cause, blast radius, mitigations, communication, recovery, control failures, near misses — a comprehensive, named review-input set, explicitly framed as examining the system/response rather than blaming a person.

EVIDENCE:
Human-note/system evidence: the review's findings must be traceable to something the incident actually revealed ('an action nobody can trace to something the incident revealed is a good idea rather than a finding') — a clean guard against scope creep in corrective work.

AUTHORITY / APPROVAL:
Abandonment of a corrective action requires recording 'on whose authority' (a.abandoned) — an explicit authority trace, though the authority itself is not further specified (who is allowed to authorize abandonment is left to policy, honestly not invented here).

IDEMPOTENCY:
N/A/undeclared structurally — no durable redelivery concern is described; this is a human workflow tracking discrete review outputs, not a repeatable technical action.

SLA / TIME:
w.corrective's timeout is explicitly 'the deadlines assigned to the corrective actions' (per-item, policy-set, not invented) with onTimeout escalating to OWN-55 rather than silently lapsing — good discipline against prevention work quietly dying.

ESCALATION:
h.escalate → OWN-55 fires when corrective work outlives its assigned deadline, carrying the outstanding actions, their owners, and the incident of origin, plus the explicit fact that the risk is still present — ownership of the risk stays visible rather than resetting silently.

CANCELLATION / SUPERSESSION:
a.abandoned explicitly records what was dropped and on whose authority — abandonment is a recorded decision, not a silent disappearance, which is exactly the discipline the guardrail calls for ('silently abandoned prevention work is the reason the same incident recurs').

HANDOFFS:
- h.escalate → OWN-55: carries ["the outstanding actions, their owners and the incident they came from","the explicit fact that the risk the incident revealed is still present"]

COMPLETION:
Verification is explicit that a completed action item is not itself risk reduction ('an action item created is not a risk reduced... what is checked is whether the condition that produced the incident can still produce it') — a direct, named application of the OPS-130 technical-vs-business-completion distinction to prevention work specifically.

RESULT / FEEDBACK:
INC-258 is the real handoff source (h.review); OWN-55 is the real downstream consumer on deadline slippage.

CORRECTION / REOPEN:
a.reopen-action explicitly returns ineffective work to its owner with what verification found, rather than closing it as done — a genuine correction loop with a stated reason.

OBSERVABILITY / AUDIT:
incident_log records the review's findings, each action's owner/deadline, abandonment authority, and verification outcome — a complete audit trail for who committed to what and whether it worked.

CONSUMER COVERAGE:
Classification: active. consumers[] lists INC-258 with a real viaHandoff (h.review) carrying the full timeline, decisions, and detached-cases/obligations this workflow's review scope requires.

TEST CASES:
- [completion] Given: an assigned corrective action is claimed complete → Expect: it is verified against whether the incident's originating condition can still occur, not accepted on the claim alone
- [escalation] Given: a corrective action's deadline passes without completion → Expect: it escalates to OWN-55 with the risk explicitly still present, rather than the deadline silently lapsing
- [correction] Given: verification shows completed work did not reduce the risk → Expect: the action returns to its owner with the verification finding, rather than being closed as done

GAPS:
- none recorded

---

## INC-260 — Recurring Incident Prevention

READINESS: NEEDS_CONTRACT_WORK

WHY:
The comparison discipline is sound (guardrails explicitly forbid inferring a shared cause from occurrence count or a repeated alert name, matching this round's own house rules almost verbatim), and the unknown-outcome path (inconclusive comparison → DEC-181) avoids forcing a false pattern. But neither a.compare (the cross-incident causal comparison) nor a.elevate (raising a standing prevention program's priority — a resourcing decision) carries any execution flag or named decision authority, despite a.elevate being exactly the kind of consequential, cross-team prioritization call this round flags as needing an authority answer.

RESPONSIBILITY:
Compares materially similar incidents across time by cause (not by alert name or count) to detect a shared systemic weakness, elevating prevention priority when one is found and reopening a prior remediation's assumptions when it demonstrably didn't hold.

INSTANCE:
Work instance is 'the family of materially similar incidents' and the weakness they may share (entity.scope) — an unusual, multi-incident unit of work with no instanceKey/concurrency declared and no stated rule for how many incidents must exist before this workflow is even invoked (left to the trigger's own 'defined window or context', which is honestly named as undeclared).

ENTRY:
Trigger materially_similar_incidents_recur, evidence.source 'inferred', explicitly insufficient on a repeated alert name alone or a raised incident count alone — a precise, well-guarded entry condition.

OWNERSHIP:
Undeclared for who runs a.compare or who has authority to elevate a prevention program's priority (a.elevate) — no queue, role, or execution flag anywhere in this workflow.

ASSIGNMENT / QUEUE:
N/A as declared — no queue routing; see ownership gap.

DATA:
Root causes, affected systems, failure modes, mitigations, recovery actions, corrective actions, and any unfinished prevention work across the compared incidents — explicitly compared on causes, not symptoms ('two incidents that both presented as elevated latency can have nothing else in common').

EVIDENCE:
System-inference evidence (cross-incident cause comparison); the explicit 'not determinable from the evidence' branch is a genuine unknown-outcome path rather than a forced binary.

AUTHORITY / APPROVAL:
Undefined — elevating a prevention program's priority and reassessing a previous remediation's assumptions (a.reassess) are both consequential, resourcing-adjacent decisions with no named authority.

IDEMPOTENCY:
N/A/undeclared structurally; no durable redelivery concern is described.

SLA / TIME:
N/A — no wait/timeout nodes; this workflow runs synchronously to an exit or handoff.

ESCALATION:
N/A as a distinct mechanic — h.reassess and h.review (both to DEC-181) are the closest analogs and are handled as real handoffs, not silent drops.

CANCELLATION / SUPERSESSION:
x.separate is non-terminal, with reEntry explicitly allowing a later, evidence-based correlation of the same incidents if they turn out to share a cause after all — no forced permanent split.

HANDOFFS:
- h.review → DEC-181: carries ["the incidents compared, their causes where confirmed and where they were not","the explicit fact that no shared root cause was inferred from the count - inferring one from repetition is exactly the mistake this journey exists to prevent"]
- h.reassess → DEC-181: carries ["the previous corrective work, what it assumed and what the recurrence shows about that assumption","the explicit fact that increasing customer messaging is not the response to recurrence - the prevention strategy is what has to change"]

COMPLETION:
x.elevated explicitly states re-entry is measured 'against the elevated programme rather than raising the priority again, so the escalation means something the first time' — a real, stated anti-inflation discipline for repeated escalation.

RESULT / FEEDBACK:
DEC-181 is the real downstream consumer for both terminal paths; this workflow itself has no handoff consumers feeding it (see consumerNote).

CORRECTION / REOPEN:
a.reassess explicitly reopens a previous remediation's assumptions rather than re-running the same fix — correction is structurally present and well-reasoned ('a fix that was applied and did not hold means the diagnosis was wrong').

OBSERVABILITY / AUDIT:
incident_log records the comparison, its outcome, and (on elevation) the reasoning — sufficient trail for a later reviewer, though it never records who ran the comparison or who has authority over the elevation.

CONSUMER COVERAGE:
Classification: event-driven. consumers[] is empty. The trigger (materially_similar_incidents_recur, source 'inferred') is the same shape as an automated pattern-detection/analytics process scanning closed incidents over time — plausibly externally emitted, so this reads as event-driven rather than an orphan; no other canonical workflow hands a case into it.

TEST CASES:
- [escalation] Given: confirmed causes across multiple incidents point to one underlying condition → Expect: prevention priority is elevated and, if remediation was previously attempted for this weakness, the prior remediation's assumptions are explicitly reopened rather than the same fix being repeated
- [missing-evidence] Given: incidents look similar but lack confirmed causes or the comparison is inconclusive → Expect: the pattern is handed to DEC-181 rather than a shared cause being inferred from the occurrence count

GAPS:
- P1 (ownership): Neither the cross-incident causal comparison (a.compare) nor the prevention-priority elevation decision (a.elevate) has a named executor or decision authority — the latter is a real resourcing/prioritization call with no owner specified.

---

## INT-111 — Integration Activation

READINESS: READY_WITH_MAPPING

WHY:
Ownership of the *decision* (auth vs. scope vs. capability failure) is precise and each failure state names its own remediation entry point. What's missing is only the mapping layer: which team configures a given provider, and what system executes the probe safely. No canonical ambiguity found.

RESPONSIBILITY:
Take a requested integration connection from credential capture through auth, scope validation and a non-destructive capability probe, and only then mark it ACTIVE.

INSTANCE:
Work instance = one integration connection attempt, scoped per provider per configuration ("One connection per configured integration... neither inherits the other's validation"). No `entity.instanceKey` or `concurrency` is declared anywhere in this workflow's source (predates that convention) — the de-facto identity is implied by entity.scope/note rather than a declared key, and that should be reported honestly rather than treated as a mechanism-round-style defect.

ENTRY:
Authoritative: `integration_connection_requested`, explicitly requiring a real request against an identified provider. Evidence excludes a merely-saved credential or a provider picked from a list — a precise, non-hand-waved entry contract.

OWNERSHIP:
Single implicit owner across the whole linear pipeline (configure → auth → scope → validate → activate); the dump names no distinct human/team/queue, so ownership is 'whoever is running setup' — reasonable for a synchronous configuration flow with no wait nodes, but the workflow itself never states who that is (person configuring vs. an automated onboarding job).

ASSIGNMENT / QUEUE:
N/A — linear, no queue/routing; a single actor runs the connect-and-validate sequence to completion.

DATA:
Connection parameters the provider requires (a.configure), then auth result, granted scopes and probe outcome are all produced internally by the workflow's own steps — no external/unsourced data is assumed.

EVIDENCE:
This is a validation, not a review, but it has an evidence discipline worth naming: 'validated capabilities' (what the probe actually proved) are recorded as authoritative and distinguished explicitly from 'configured capabilities' (what was merely requested) at a.activate — the workflow enforces the exact anti-pattern (activating on the strength of the ask, not the proof) it is designed to catch.

AUTHORITY / APPROVAL:
N/A — no approval step; every branch is an automated pass/fail gate, not a human decision.

IDEMPOTENCY:
No `idempotencyKey`/`attemptBudget` declared on any action, and none needed at this granularity — each action (`a.configure`/`a.scopes`/`a.validate`/`a.activate`) runs once per linear pass with no retries modeled; duplicate-connection prevention is structural (a new request is definitionally a separate connection per entity.note) rather than key-based.

SLA / TIME:
N/A — no waits, timeouts, or Config objects anywhere in this workflow; it is synchronous end-to-end.

ESCALATION:
N/A — no escalation path; every failure branch is a terminal-for-now exit with reEntry instructions, not an escalation.

CANCELLATION / SUPERSESSION:
Failure exits are non-terminal and cleanly re-enterable (x.auth-failed re-enters at start, x.insufficient/x.failed re-enter at their own stage) with an explicit guarantee that nothing partial is left active — good supersession discipline even without a formal cancel action.

HANDOFFS:
N/A — no outbound handoffs

COMPLETION:
Completion (x.active) requires the probe to have confirmed the capability works, and activation records what was *validated* rather than what was *configured* — a genuinely strong completion contract that avoids OPS-130's 'technical vs business completion' failure by construction.

RESULT / FEEDBACK:
No outbound handoff exists from INT-111 itself (`handoffs: []`). The one real cross-workflow relationship in the dump runs the other way: INT-278 (customer surface) has its own handoff node (h.diagnose) that targets INT-111, so a customer-facing diagnosis flow can hand a failed attempt back into activation with the prior context and which stages already passed. Downstream awareness of the ACTIVE state itself is by exit-state name only.

CORRECTION / REOPEN:
Every non-active exit is explicitly re-enterable at the correct stage (start / configuration / validation) rather than forcing a full restart — this is a well-designed correction path for a setup flow.

OBSERVABILITY / AUDIT:
Every action appends to `integration_log`, giving a stage-by-stage audit trail (configure→auth→scope→validate→activate) with each failure's specific cause (auth vs. scope vs. capability) distinguishable in the log — adequate for a real operator to reconstruct what happened.

CONSUMER COVERAGE:
Classification: active. INT-278 (customer surface) is the sole consumer and it is a real inbound handoff: INT-278 has a handoff node (h.diagnose) whose target is INT-111, carrying the failed attempt's provider/context and which validation stages already passed. INT-111 is the receiver here — a re-entry point a customer-facing diagnosis flow hands back into — not the sender; INT-278 also names INT-111 in its own distinctFrom clause.

TEST CASES:
- [completion] Given: authentication and scope succeed but the capability probe fails → Expect: exit is x.failed ("authenticated and scoped, not operational"), not ACTIVE — validated capability, not configured capability, gates activation
- [handoff] Given: an activated connection whose provider later revokes a scope → Expect: the change is out of this workflow's scope and is explicitly routed to INT-112 per x.active's reEntry note, not re-litigated here
- [reopen] Given: x.insufficient exit due to a missing scope → Expect: re-entry names the missing scope specifically so remediation is targeted rather than a generic reconnect

GAPS:
- P2 (other): No entity.instanceKey/concurrency declared (pre-dates the convention) — a company implementing this needs to define what uniquely identifies a connection attempt (e.g., provider + config draft id) themselves; not a defect, just unmapped.
- P2 (ownership): No named role/queue for 'who runs integration setup' (human admin vs. automated onboarding); acceptable for a synchronous flow but worth mapping explicitly.

---

## INT-112 — Integration Authorization Revalidation

READINESS: READY_WITH_MAPPING

WHY:
The decision tree (fully functional / partially functional / unusable) is exhaustive and each branch has a correctly scoped effect (degrade only what depended on the lost scope). The one real gap is stated on its own terms: cache invalidation guards against a stale-credential replay but the workflow never names who/what triggers or owns the revalidation compute step — acceptable to map, not a contract defect.

RESPONSIBILITY:
Whenever an integration's authorization materially changes (token refresh, scope reduction, revocation, service-account change), revalidate exactly what capability is still available rather than assuming valid credentials mean unchanged access.

INSTANCE:
Work instance = one authorization-change event against one integration connection, scoped explicitly to 'the connection and the authorization that changed' — degradation is capability-scoped, not connection-wide (entity.note is explicit: 'treating the whole connection as broken is its own outage'). No instanceKey/concurrency declared.

ENTRY:
Authoritative: `integration_authorization_changed`, requiring one of a named closed set (token refresh, credential rotation, scope reduction, revocation, service-account change) — precise, not hand-waved.

OWNERSHIP:
Implicit single owner runs invalidate→revalidate→(degrade→suppress); no named team. On the unusable branch, ownership transfers via h.failure to INT-116, which does explicitly take over (confirmed by INT-116's own consumer entry referencing INT-112's h.failure).

ASSIGNMENT / QUEUE:
N/A — no queue; a single automated revalidation runs per authorization-change event.

DATA:
Revalidation needs the new authorization state and the set of capabilities the integration actually uses (implicit prerequisite from a.revalidate's own text) — not sourced explicitly in the dump, worth mapping to wherever the 'capabilities this integration uses' registry lives.

EVIDENCE:
N/A — pass/fail is determined against the provider's own live authorization response, not a review with mixed evidence sources.

AUTHORITY / APPROVAL:
N/A — fully automated revalidation, no approval gate.

IDEMPOTENCY:
a.invalidate-cache is explicitly there to defeat a specific duplicate/stale-work hazard: 'a queued retry holding a credential that has since been rotated away must not succeed on it.' No idempotencyKey is declared on the durable-write actions (a.degrade/a.suppress append to integration_log/suppressed_sends), which is consistent with these being append-only observational writes rather than side-effecting creates — no P0 gap here.

SLA / TIME:
N/A — no wait/timeout nodes in this workflow; it resolves synchronously per authorization-change event.

ESCALATION:
N/A — no escalation path in this workflow itself; unusable authorization hands off structurally (not escalates) to INT-116.

CANCELLATION / SUPERSESSION:
a.invalidate-cache is itself a supersession guard: it explicitly prevents a stale credential from 'coming back through a retry.' No separate cancellation concept applies since there's no open work item to cancel, only a state to recompute.

HANDOFFS:
- h.failure → INT-116: carries ["what was revoked and when","any external operations already submitted and still unresolved, which the authorization change does not resolve"]

COMPLETION:
x.active and x.degraded are both legitimate completions of *this* workflow's own scope (revalidation performed, state accurately reflects capability), not a claim that the integration is fully healthy — correctly distinguished per guardrail #1 ('a successful token refresh does not mean the integration is fully healthy').

RESULT / FEEDBACK:
Downstream, INT-269 (customer surface) is a plain consumer with no handoff node — likely reads the resulting ACTIVE/DEGRADED state rather than receiving a structured handoff; this is fine for a status read but the dump gives no contract for how INT-269 knows to check.

CORRECTION / REOPEN:
x.degraded reEntry states restored scope revalidates and lifts degradation per-capability — this is a live re-evaluation, not a one-way state, and is the correct behavior (no need for a distinct 'reopen').

OBSERVABILITY / AUDIT:
integration_log appended at every action step; suppressed_sends appended when operations are actually suppressed — enough to reconstruct which capabilities were disabled and when.

CONSUMER COVERAGE:
Classification: event-driven. Two consumers in the dump, neither via a real inbound handoff (viaHandoff empty for both): INT-111 (viaDistinctFrom: false — a plain prose mention only, matching INT-111's own exit text that authorization changes route to INT-112) and INT-269 (customer surface, viaDistinctFrom: true — INT-269's own distinctFrom clause names INT-112). With zero handoff-carrying consumers but an authoritative, provider-emitted trigger (`integration_authorization_changed`), this reads as event-driven rather than orphan-candidate.

TEST CASES:
- [duplicate-creation] Given: a retry queued before a credential rotation is dequeued after the rotation → Expect: a.invalidate-cache has already invalidated the cached authorization so the retry cannot succeed on the old credential
- [handoff] Given: authorization revoked entirely, with unresolved external operations already submitted → Expect: h.failure to INT-116 carries the unresolved operations explicitly, since the authorization change itself does not resolve them
- [escalation] Given: scope reduced so only some capabilities are affected → Expect: only the dependent capabilities go DEGRADED via a.degrade/a.suppress; unaffected capabilities keep operating

GAPS:
- P2 (ownership): No named actor/system owns 'run the revalidation'; reasonable to assume it's automated on the authoritative event, but the workflow doesn't say so explicitly.
- P2 (other): No instanceKey/concurrency for the authorization-change work unit; predates the convention.

---

## INT-113 — Integration Health Recovery

READINESS: READY_WITH_MAPPING

WHY:
Scoping discipline (per-capability, not whole-integration) and the 'recovery is revalidated, not trusted' rule are both explicit and enforced structurally. Escalation on SLA timeout to OWN-55 is a real, named path. The only mapping gap is what 'the operational SLA for this integration' actually resolves to per integration — correctly left undeclared rather than invented.

RESPONSIBILITY:
Classify a crossed health threshold to the actual affected capability, retry safely where possible, degrade precisely, and revalidate before declaring recovery — never trusting a metric returning to normal at face value.

INSTANCE:
Work instance = one health-degradation episode against one integration, scoped per capability ('assessed per capability rather than as a whole'). No instanceKey/concurrency declared; a fresh threshold crossing is explicitly a new, separately-assessed instance per exit reEntry text.

ENTRY:
Behavioral evidence source: a threshold crossed over a defined window (elevated error rate, repeated timeouts, partial failure, latency, auth instability, declared provider degradation). Explicitly insufficient alone: one transient error, one timeout, one slow response — a genuinely precise threshold-vs-noise distinction, not hand-waved.

OWNERSHIP:
Implicit automated owner runs classify→(backoff|degrade)→wait→(restore|escalate). On SLA timeout it hands off to OWN-55 (an owner-role escalation target) — this is the one place a human/team is actually named as taking over, and it's a real transfer via h.escalate, not just a notification.

ASSIGNMENT / QUEUE:
N/A until h.escalate fires; at that point OWN-55 is the named escalation target (an operational-ownership workflow, not detailed here).

DATA:
Health evidence (error rate/timeouts/latency/etc.) is assumed available from wherever health is being monitored — the workflow doesn't say what produces the health signal, which is reasonable to treat as instrumentation outside this workflow's scope.

EVIDENCE:
Evidence is explicitly behavioral (trigger.evidence.source: 'behavioral') and the workflow is careful not to let behavioral evidence become an unreviewed authoritative conclusion: a.restore 'revalidates the degraded capabilities before restoring them' rather than trusting the metric — this is exactly the 'behavioral inference silently becoming authoritative' failure mode called out in the brief, and it is avoided by design.

AUTHORITY / APPROVAL:
N/A — no human approval gate; recovery is machine-revalidated, not approved.

IDEMPOTENCY:
a.backoff is explicitly scoped to 'only for operations where retrying is safe' and states unsafe (side-effecting) operations are not retried on a health signal alone since 'their safety depends on an idempotency key and a known outcome, neither of which a health metric provides' — this is a correct, self-aware idempotency boundary rather than a gap.

SLA / TIME:
w.health times out 'after: the operational SLA for this integration' — an honestly-declared Config reference to a per-integration SLA that must be mapped, not a fabricated duration. onTimeout correctly routes to h.escalate rather than silently continuing to wait.

ESCALATION:
h.escalate → OWN-55 fires only on the wait timeout (SLA exceeded with neither recovery nor further worsening) and carries the affected capabilities and how long they've been degraded — a real escalation with named receiving owner, not a loop; no return path back to this workflow is declared, which is fine since escalation to OWN-55 is a genuine handoff, not a round-trip.

CANCELLATION / SUPERSESSION:
N/A — no cancellable work item exists here; a further threshold crossing is treated as its own fresh assessment per x.recovered reEntry, not a supersession of an old one.

HANDOFFS:
- h.failure → INT-116: carries ["the affected scope and the evidence that established it","which capabilities were still working, so the failure stays scoped to what actually failed"]
- h.escalate → OWN-55: carries ["the affected capabilities and how long they have been degraded"]

COMPLETION:
x.recovered requires capabilities to be revalidated before being re-enabled — a real completion proof, not merely 'the metric moved.' This directly matches OPS-130's precedent (technical signal ≠ business completion) applied to health.

RESULT / FEEDBACK:
INT-113 itself has zero inbound handoff consumers — INT-111, INT-116 and INT-117 all appear in its own consumers array with viaHandoff empty, referencing it only via distinctFrom prose. Separately, in the other direction, INT-113's own outbound h.failure handoff to INT-116 is confirmed real by INT-116's own consumers entry (which lists INT-113 with a populated viaHandoff) — that is INT-113 sending, not being consumed.

CORRECTION / REOPEN:
N/A — no human decision to correct; x.recovered reEntry states a further crossing is assessed on its own window, which is the correct 'new episode, not reopen' behavior.

OBSERVABILITY / AUDIT:
integration_health_log appended at every action — classify/backoff/degrade/restore all logged, giving a reconstructable timeline of scope, retries, degradation, and recovery evidence.

CONSUMER COVERAGE:
Classification: event-driven. All three listed relationships (INT-111, INT-116, INT-117) are distinctFrom-prose-only in INT-113's own consumers array (viaHandoff empty for each) — nobody sends a handoff into INT-113. Its own outbound handoffs (h.failure→INT-116, h.escalate→OWN-55) run the opposite direction and are a separate fact, independently confirmed by INT-116's own consumers entry. With a behavioral, monitoring-emitted trigger and no inbound handoff senders, this reads as event-driven.

TEST CASES:
- [completion] Given: health metric returns to nominal range → Expect: a.restore revalidates affected capabilities before x.recovered — a metric alone does not re-enable a degraded capability
- [escalation] Given: degradation neither clears nor worsens before the operational SLA elapses → Expect: w.health timeout fires onTimeout: h.escalate to OWN-55, carrying affected capabilities and duration
- [handoff] Given: degradation reaches the whole integration (not just some capabilities) → Expect: c.nature routes directly to h.failure → INT-116 rather than attempting a scoped degrade

GAPS:
- P1 (sla-escalation): 'the operational SLA for this integration' is referenced but its Config/policy source is not shown in this workflow's own nodes — must be mapped per integration before implementation; correctly not fabricated here, but flagged since it's load-bearing for the only escalation path.
- P2 (ownership): OWN-55 is the escalation target but this workflow declares no path back (does completing OWN-55's work resume health monitoring, or is this a one-way notification?) — worth mapping OWN-55's own contract, not a defect of INT-113 itself.

---

## INT-114 — External Request Reconciliation

READINESS: READY_WITH_MAPPING

WHY:
This is one of the cleanest workflows in the batch: identifiers are recorded before submission (so retries are safe by construction), a 200-response is explicitly not treated as completion, and timeout is explicitly not treated as failure. The only mapping work is wiring the actual `external:external-status-reconciliation` provider-side lookup and the per-operation outcome window.

RESPONSIBILITY:
Treat 'submitted to a provider' and 'business operation completed' as separate states for any external call, and let a genuinely unresolved outcome stay explicitly UNKNOWN rather than being guessed at.

INSTANCE:
Work instance = one external operation, keyed by 'its own correlation and idempotency identifiers,' explicitly recorded before submission ('generating them after a failure is too late to help with that failure') — this is a de-facto instanceKey even without the formal field name, and the concurrency intent (safe retry) is stated in prose rather than declared as a formal `concurrency` value.

ENTRY:
Authoritative: `external_operation_submitted` — an operation actually sent to a provider on behalf of a business action. Precise, no hand-waving.

OWNERSHIP:
This workflow owns the operation strictly from submission to outcome; entity.distinctFrom vs INT-115 is explicit and non-overlapping ('This owns the operation from submission until an outcome exists. INT-115 owns what happens to local state once one does'). Ownership handoff to INT-115 is exact: fires only once 'an authoritative outcome exists.'

ASSIGNMENT / QUEUE:
N/A — no human queue; this is a machine-owned request/response lifecycle.

DATA:
Operation id, provider request id, action requested, target entity, submission time, idempotency key — all listed explicitly as what a.persist records, with clear provenance (generated/recorded at submission time, not reconstructed later).

EVIDENCE:
N/A — not a review workflow; 'evidence' here is the provider's own response classification (authoritative final outcome vs. accepted-not-completed), which the condition c.immediate handles directly.

AUTHORITY / APPROVAL:
N/A — no approval step.

IDEMPOTENCY:
This is the strongest idempotency story in the batch: idempotency key recorded before submission specifically so a retry after ambiguity is safe; h.status-check explicitly suppresses any further retry of this operation until true state is established, preventing a second attempt from executing concurrently with reconciliation.

SLA / TIME:
w.outcome times out 'after: the operation's outcome window' with an honest reason ('the window ending means we stopped hearing... rather than about the provider's work') — a declared, not-invented Config reference; onTimeout correctly routes to a.unknown rather than to a failure state.

ESCALATION:
N/A — no escalation node in this workflow; ambiguity routes to reconciliation (h.status-check), which is a lateral handoff to establish truth, not a priority/ownership escalation.

CANCELLATION / SUPERSESSION:
h.status-check explicitly suppresses retries while status is being resolved — this is a 'stop future duplicate work' guard, correctly not conflated with reversing the original external submission (which may or may not have executed at the provider — genuinely unknown until resolved).

HANDOFFS:
- h.status-check → external:external-status-reconciliation: carries ["the operation and provider request identifiers needed to ask the provider what actually happened","the idempotency key, so that whatever is established can be acted on without re-submitting","the explicit fact that the outcome is unknown rather than failed"]
- h.reconcile → INT-115: carries ["the outcome and the correlation identifiers it arrived with","what local state expected, so the reconciliation can tell agreement from conflict"]

COMPLETION:
This workflow itself has no terminal exit node (`exits: []` in the dump) — it only ever hands off, either to reconciliation-for-outcome-not-yet-known (h.status-check) or to INT-115 once an outcome exists (h.reconcile). That is a deliberate design (the operation's lifecycle continues in INT-115), not a missing completion contract, but it means 'is this operation done' can only be answered by following the handoff chain — worth naming as a mapping note for anyone building a single-screen operation status view.

RESULT / FEEDBACK:
FIN-132 (financial) and FUL-147 (fulfillment, customer surface) are listed as consumers via distinctFrom prose only — no structured handoff from INT-114 to them directly; they likely consume INT-115's post-reconciliation state rather than this workflow's own output.

CORRECTION / REOPEN:
N/A — no human decision here to correct; a genuinely unknown outcome is handed to reconciliation rather than silently resolved either way.

OBSERVABILITY / AUDIT:
external_operation_log appended on persist and on unknown-outcome — captures submission identifiers and the unknown-vs-failed distinction, sufficient for later reconciliation to trust the record.

CONSUMER COVERAGE:
Classification: event-driven. INT-114's own consumers array lists only FIN-132 and FUL-147, both distinctFrom-prose-only (viaHandoff empty). INT-115 does not appear there — it is the receiver of INT-114's own outbound h.reconcile handoff, not a sender into INT-114; that direction is confirmed separately by INT-115's own consumers entry, which lists INT-114 with a populated viaHandoff matching h.reconcile's payload. With zero inbound handoff senders but a broad, plausibly-external-triggered event (any business action submitting to a provider), event-driven fits better than orphan-candidate.

TEST CASES:
- [duplicate-creation] Given: a retry is attempted while the outcome window is still open and unresolved → Expect: the retry is not safe to fire blindly per guardrail; correlation/idempotency identifiers exist specifically so a later retry (if ever attempted) doesn't duplicate the external effect
- [handoff] Given: the outcome window closes with no authoritative result → Expect: a.unknown records UNKNOWN (not failed) and h.status-check hands to reconciliation with retries explicitly suppressed
- [completion] Given: provider returns a 200 acknowledging receipt only → Expect: c.immediate treats this as 'accepted, not completed' and moves to w.outcome rather than treating the 200 as done

GAPS:
- P1 (handoff-provenance): This workflow has no terminal exit (`exits: []`) — an operator or downstream system asking 'is this specific external operation finished' cannot get an answer from this workflow alone and must follow the handoff into INT-115; worth documenting explicitly as intentional so implementers don't add a false terminal state here.
- P2 (other): 'the operation's outcome window' Config is referenced but its actual duration/source is undeclared here — correctly not invented, but must be mapped per external operation type.

---

## INT-115 — External Outcome Reconciliation

READINESS: READY_WITH_MAPPING

WHY:
This is the most carefully specified reconciliation workflow in the batch: four distinct local-state relationships (expected/already-applied/conflicting/superseded) are each routed differently, duplicates are explicitly harmless, and uncorrelated events are never applied to a best-guess entity. Escalation targets (DEC-181 for uncorrelated, INT-119 for conflicts) are both real, confirmed handoffs.

RESPONSIBILITY:
Correlate an authoritative external outcome to the right operation and entity, and apply it to local state only if it's still current — treating stale-but-valid history, duplicates, conflicts, and superseded state as four genuinely different outcomes rather than collapsing them.

INSTANCE:
Work instance = one external outcome event being reconciled against 'the external operation the outcome refers to, and the local entity it would change' — correlation is explicitly first-class ('An outcome applied to the wrong entity is a worse failure than one that arrives late'). No instanceKey/concurrency declared.

ENTRY:
Authoritative: `authoritative_external_outcome`; explicitly excludes a mere acknowledgement or a provider-labeled-intermediate status as sufficient.

OWNERSHIP:
Automated, single-pass ownership: correlate → branch on local state → apply/record-history/escalate. No named human role in the base path; DEC-181 (uncorrelated) and INT-119 (conflict) take ownership of their respective exception branches via real handoffs.

ASSIGNMENT / QUEUE:
N/A — no queue; a single reconciliation pass per outcome event.

DATA:
Correlation/idempotency identifiers 'recorded at submission' (i.e., by INT-114) are the required input — provenance is explicit and traceable to the upstream workflow rather than assumed.

EVIDENCE:
N/A — not a review; the 'evidence' evaluated is the correlation match and current local state, both structurally determined rather than judged.

AUTHORITY / APPROVAL:
N/A — no approval; DEC-181 is a decision workflow for genuinely uncorrelated events, but that's a routing decision, not an approval of this workflow's own action.

IDEMPOTENCY:
Best idempotency treatment in the batch: a.apply is explicitly 'applied idempotently, so that the same outcome arriving again produces no second effect,' and x.duplicate is a first-class exit for 'already applied' rather than an error state — 'a redelivered webhook resolves here and does nothing.'

SLA / TIME:
N/A — no wait/timeout nodes; reconciliation is a synchronous correlate-and-branch operation.

ESCALATION:
N/A in the priority/reassignment sense — h.review and h.conflict are handoffs to different responsible workflows for genuinely different problem types (uncorrelated vs. conflicting), not an escalation ladder within this workflow.

CANCELLATION / SUPERSESSION:
c.local's 'Belongs to a superseded operation or version' branch is exactly this dimension done right: an outcome for state local has since moved past is recorded as history (a.history) without mutating current state, explicitly to avoid 'overwrit[ing] a newer decision with an older one.'

HANDOFFS:
- h.review → DEC-181: carries ["the event as received, unmodified","the explicit fact that it has not been applied to a best-guess entity"]
- h.conflict → INT-119: carries ["both values, their timestamps, their versions and their provenance","the fact that neither has been chosen, because the provider being external does not automatically make it authoritative for this field"]

COMPLETION:
Three distinct, correctly-differentiated completions: x.duplicate (already applied, no-op), x.historical (recorded, current state unchanged), x.applied (state actually changed) — this workflow does not conflate 'processed' with 'changed,' a real strength.

RESULT / FEEDBACK:
INT-114 is the confirmed upstream sender (via h.reconcile into this workflow) — the consumer direction runs the other way for INT-115 itself; no further downstream consumer of INT-115's own state changes is declared in this dump.

CORRECTION / REOPEN:
x.applied reEntry states a further outcome on the same operation is 'correlated and assessed on its own' — correct incremental handling, not a blind reopen; a conflicting later outcome would route through c.local again rather than silently overwrite.

OBSERVABILITY / AUDIT:
external_operation_log appended at correlate/history/apply — captures correlation result and which of the four paths was taken, sufficient to reconstruct why a given outcome did or didn't change state.

CONSUMER COVERAGE:
Classification: active. INT-114 is the confirmed real handoff sender into this workflow (h.reconcile) — listed correctly in the dump as a consumer-direction entry with viaHandoff populated and matching payload.

TEST CASES:
- [duplicate-creation] Given: the same webhook is redelivered by the provider → Expect: c.local resolves 'Already applied' → x.duplicate; no second effect
- [handoff] Given: local state holds something incompatible with the incoming outcome → Expect: h.conflict → INT-119, carrying both values with timestamps/versions/provenance and no value pre-chosen
- [stale-work] Given: the outcome refers to an operation/version local state has since superseded → Expect: c.relevant routes to a.history — recorded, current state unchanged, not overwritten
- [completion] Given: an event cannot be correlated to any known operation → Expect: h.review → DEC-181 with the event unmodified; never applied to a best-guess entity

GAPS:
- none recorded

---

## INT-116 — Integration Failure Recovery

READINESS: READY_WITH_MAPPING

WHY:
Scoping ('unrelated integrations, and unrelated capabilities within this one, stay as they were'), preservation of in-flight unknowns, and a genuine recoverable/not-recoverable fork with two different real handoff targets are all present and correct. The only mapping items are the failure-tolerance-window Config and who performs manual resolution during w.restore.

RESPONSIBILITY:
When an integration fails outright, stop sending into it (scoped to what actually failed), preserve any operations left in flight with unknown outcomes, diagnose, and either restore or hand off as terminal — without ever retrying or declaring failed the operations it cannot see the result of.

INSTANCE:
Work instance = one failed integration or capability and the set of dependent operations blocked by it — entity.note is explicit that failure is scoped, not connection-wide. No instanceKey/concurrency declared.

ENTRY:
Authoritative: `integration_failure_condition`, defined as a closed set (permanent auth failure, provider unavailable beyond tolerance, required capability unavailable, invalid connection, persistent operational failure) — precise.

OWNERSHIP:
Automated mark→stop→(preserve)→diagnose pipeline with no named human owner in the base path. On non-recoverable failure, DEC-181 takes over (h.terminal); on tolerance-exceeded, OWN-55 takes over (h.escalate). Both are real ownership transfers with distinct triggers, not overlapping.

ASSIGNMENT / QUEUE:
N/A in the base path; DEC-181 and OWN-55 are the two possible downstream owners depending on recoverability vs. duration.

DATA:
Failure cause classification (a.diagnose) and the set of pending unresolved operations (a.preserve) are the key data; both are produced by this workflow's own steps rather than assumed external inputs.

EVIDENCE:
N/A — not a review workflow; recoverability is a diagnostic classification, not evidence-weighing.

AUTHORITY / APPROVAL:
N/A — no approval gate; 'a manual resolution is recorded' is mentioned as one path to clear w.restore but the workflow doesn't specify who performs or authorizes it.

IDEMPOTENCY:
a.preserve is the single most important idempotency-adjacent guarantee in this batch: pending operations are 'neither retried nor marked failed' because 'a connection failing is not evidence about an operation it already received' — this directly prevents the double-execution hazard the whole INT-114/INT-115 pair exists to guard against.

SLA / TIME:
w.restore times out 'after: the failure tolerance window' with an honest, undeclared-duration reason — correctly left as a Config to be mapped, onTimeout routes to h.escalate (not silently continuing).

ESCALATION:
h.escalate → OWN-55 fires only on tolerance-window timeout, carrying duration and dependents — real escalation with a named receiving role. No loop back into this workflow is declared, avoiding an A→B→A pattern.

CANCELLATION / SUPERSESSION:
Failed-but-recoverable state does not cancel/discard pending operations — it holds them (a.preserve) pending an authoritative outcome established elsewhere; genuinely irrecoverable failure hands the unresolved operations forward via h.terminal rather than silently dropping them ('the unresolved operations, which still need an answer regardless of the integration's future').

HANDOFFS:
- h.reconnect → INT-118: carries ["the outage window, which is what the backfill needs to size the gap","the operations preserved as unresolved, which reconnection does not resolve"]
- h.terminal → DEC-181: carries ["the cause and the capabilities now permanently unavailable","the unresolved operations, which still need an answer regardless of the integration's future"]
- h.escalate → OWN-55: carries ["how long the integration has been failed and what depends on it"]

COMPLETION:
This workflow has no terminal exit (`exits: []`) — like INT-114, its lifecycle only ever continues via handoff (to INT-118 on recovery, DEC-181 on terminal failure, or OWN-55 on escalation); worth flagging the same way as a deliberate design, not a missing state.

RESULT / FEEDBACK:
INT-112, INT-113, INT-120, and INT-269 all reference this workflow; INT-112 and INT-113 do so via confirmed real handoffs (h.failure) that this workflow's own trigger (`integration_failure_condition`) is built to receive.

CORRECTION / REOPEN:
N/A — no human decision made within this workflow to correct; reconnection is handled downstream by INT-118, and terminal failure is a one-way handoff to DEC-181.

OBSERVABILITY / AUDIT:
integration_log, suppressed_sends, and external_operation_log are all appended across the different actions — gives a clear trail of what was marked failed, what was suppressed, and what was preserved as unresolved.

CONSUMER COVERAGE:
Classification: active. INT-112 and INT-113 are confirmed real handoff senders (h.failure) matching this workflow's own trigger. INT-120 references via distinctFrom prose only. INT-269 (customer) references via distinctFrom prose only.

TEST CASES:
- [stale-work] Given: operations were submitted before the failure and never reached an authoritative outcome → Expect: a.preserve keeps them unresolved with correlation/idempotency context intact — neither retried nor marked failed
- [handoff] Given: the integration becomes operational again → Expect: h.reconnect → INT-118 carries the outage window and the still-unresolved operations, which reconnection alone does not resolve
- [escalation] Given: the failure outlives the failure tolerance window with no resolution → Expect: h.escalate → OWN-55, carrying duration and dependents; the original failure state is not silently cleared by the timeout

GAPS:
- P2 (completion): No terminal exit node in this workflow (`exits: []`) — 'is this failure resolved' can only be answered by tracing the handoff chain into INT-118/DEC-181/OWN-55; worth documenting as intentional.
- P2 (ownership): 'a manual resolution is recorded' (in w.restore's until-list) names no role/authority for who performs that manual resolution.

---

## INT-117 — Integration Work Hold

READINESS: READY_WITH_MAPPING

WHY:
The per-item classification (SAFE_TO_QUEUE/TIME_SENSITIVE/REQUIRES_REVALIDATION/CANNOT_DELAY), the explicit exclusion of mere slowness/backlog from this workflow's scope, and the deliberate controlled-drain-not-burst design are all strong, specific canonical decisions. Mapping work is limited to the hold-horizon Config and who performs 'discard or cancel... recording the reason' authority.

RESPONSIBILITY:
For work genuinely blocked by a failed (not merely slow) integration, classify each blocked item individually, hold what can safely wait with its original deadline intact, and drain the backlog in a controlled way on recovery rather than all at once.

INSTANCE:
Work instance = the individual blocked work item (not the integration as a whole) — entity.note is explicit: 'Each item is classified separately.' No instanceKey/concurrency declared, but the per-item scoping is functionally the identity unit.

ENTRY:
Authoritative: `work_blocked_by_failed_integration`, requiring both a FAILED/DISCONNECTED integration and valid dependent work — explicitly excludes 'slow, lagging or backlogged while still working' (a named different problem, deliberately unhandled here) and 'an elevated error rate that has not crossed a failure condition.' Very precise boundary.

OWNERSHIP:
Automated classify→hold/alternate pipeline; DEC-181 takes ownership for CANNOT_DELAY items via h.alternate. No queue/human owner named for the base hold path — 'held' work sits without an assigned owner beyond the implicit system managing the queue.

ASSIGNMENT / QUEUE:
The 'queue' here is the blocked-work hold list itself, not a human work queue; classification determines routing (hold vs. immediate alternate-path handoff) but no claim/assignment semantics are declared for held items since no human acts on them individually.

DATA:
Original context, entity version, and idempotency key are explicitly preserved per held item (a.hold) — this is exactly the provenance discipline the brief asks for, not merely mentioned in prose.

EVIDENCE:
N/A — not a review workflow; classification is a policy-driven categorization, not evidence-weighing.

AUTHORITY / APPROVAL:
N/A — no approval gate; a.stale's 'discard or cancel... recording the reason' is an automated policy action with no named human authority, worth flagging as a mapping item given it's a consequential, non-reversible action.

IDEMPOTENCY:
Held items retain 'their original context, entity version and idempotency key' explicitly — and a.revalidate re-checks each item against current state before draining, which correctly treats 'queued' as not automatically still valid ('a queued instruction written against the old world is not automatically still correct'). Good idempotency-adjacent freshness discipline.

SLA / TIME:
w.restore times out 'after: the hold horizon' with the guardrail explicitly naming the failure mode it prevents: 'a queue with no horizon is an infinite retry loop with a friendlier name.' Correctly undeclared numeric value, but the concept and its necessity are stated, not invented.

ESCALATION:
N/A — no escalation-to-a-person path in this workflow; CANNOT_DELAY items go to DEC-181 (a decision workflow) rather than being escalated up a management chain.

CANCELLATION / SUPERSESSION:
Explicit and well-designed: a.stale discards/cancels work whose 'state it was written against has moved' or that expired past the hold horizon, always with an audited reason ('Silently dropping it and silently sending it are both worse than saying which happened and why') — this is a strong, correctly-distinguished supersession/cancellation model, and x.discarded's reEntry correctly frames a later request as a new item, not a revival of the old one.

HANDOFFS:
- h.alternate → DEC-181: carries ["the work, its deadline and what it was blocked on","the fact that it has not been queued, so nobody assumes it will go out on recovery"]

COMPLETION:
x.resumed requires items to be revalidated against current state and drained in a controlled manner before being considered resumed — again correctly distinguishing 'sent' from 'still valid to send.' x.discarded is a distinct, equally legitimate completion (work correctly abandoned, not silently lost).

RESULT / FEEDBACK:
OPS-122 is the only consumer entry, and it is prose-only (distinctFrom/mechanism-surface reference, no viaHandoff) — no structured downstream consumer of this workflow's own resumed/discarded outcomes is declared.

CORRECTION / REOPEN:
x.discarded reEntry is explicit that 'whatever the work was for may be requested again on current state, which is a new item rather than this one revived' — correct non-reopen semantics.

OBSERVABILITY / AUDIT:
blocked_work_log appended across classify/hold/revalidate/drain/stale — a full per-item audit trail including the discard reason.

CONSUMER COVERAGE:
Classification: unconsumed-but-valid. Only consumer entry is OPS-122 (mechanism surface, distinctFrom prose only, no handoff) — no structured downstream consumer holds this workflow's resumed/discarded outcome. Design is sound (this is the OPS-126-style precedent per the brief) — the trigger is authoritative and system-detected, so it's not orphaned, just not yet consumed by a named receiver in this corpus slice.

TEST CASES:
- [stale-work] Given: a held item's underlying state moved on while the integration was down → Expect: a.revalidate against current state routes to a.stale rather than draining it as-is
- [escalation] Given: held work exceeds the hold horizon with the integration still down → Expect: w.restore timeout fires onTimeout: a.stale, discarding with an audited reason rather than holding indefinitely
- [handoff] Given: a blocked item is classified CANNOT_DELAY → Expect: h.alternate → DEC-181 carries the deadline and the explicit fact that it has not been queued for later automatic send

GAPS:
- P1 (authority-approval): a.stale ('discard or cancel the work as stale') is a consequential, non-reversible action performed with no named human authority or approval gate — worth mapping who/what is allowed to execute it, especially for CANNOT_DELAY-adjacent items near the hold horizon.
- P2 (other): 'the hold horizon' Config is referenced but undeclared in value/source — correctly not invented, needs per-workflow-type mapping.

---

## INT-118 — Integration Backfill Reconciliation

READINESS: READY_WITH_MAPPING

WHY:
This is a genuinely sophisticated workflow: the outage window is a first-class unit of work, the 'still actionable vs. superseded' fork correctly prevents replaying obsolete customer communication, and a.reconcile explicitly does not trust the backfilled events to self-verify. Both post-backfill failure modes (values disagree, gap unrecoverable) have real, distinct handoffs.

RESPONSIBILITY:
After an outage, close the specific gap it created — fetch what was missed, deduplicate against what already arrived, apply only what's still currently actionable, and verify against the authoritative source rather than trusting the backfilled events to add up correctly on their own.

INSTANCE:
Work instance = the outage window itself, explicitly named as the unit of work ('Without a measured gap the backfill either misses events or refetches everything, and neither can be verified'). No instanceKey/concurrency declared, but the window-as-identity design is unusually precise for this round.

ENTRY:
Authoritative: `integration_operational_again`, with an explicit and important carve-out: 'reconnected and up to date are different states' — connection restoration alone is insufficient evidence that backfill is complete or even needed; this correctly frames the trigger as the start of a process, not its completion.

OWNERSHIP:
Fully automated pipeline (window→fetch→dedupe→(process|history)→reconcile→verify) with no human owner in the base path. Genuine handoffs on failure: INT-119 for value conflicts, OWN-55 for an unrecoverable gap.

ASSIGNMENT / QUEUE:
N/A — no queue; runs once per reconnection event against its own outage window.

DATA:
The outage window boundaries (a.window) are the load-bearing input and are computed by this workflow itself, not assumed externally provided — good provenance. Correlation identifiers for dedupe are inherited from whatever emitted the original events.

EVIDENCE:
N/A — not a human review; 'evidence' here is the authoritative source used at a.reconcile/a.verify to check the backfill's own conclusions.

AUTHORITY / APPROVAL:
N/A — fully automated; no approval gate for applying backfilled state.

IDEMPOTENCY:
a.dedupe is explicit: 'A duplicate arriving through backfill has to be exactly as harmless as one arriving through a webhook' — directly reuses the same idempotency discipline as INT-115's real-time path rather than inventing a parallel backfill-specific one, which is exactly the house rule the brief asks for.

SLA / TIME:
N/A — no wait/timeout node in this workflow; it runs synchronously to completion or to one of its failure handoffs once triggered.

ESCALATION:
h.escalate → OWN-55 fires when 'part of the window is unrecoverable from the provider,' carrying the unrecoverable window and the explicit fact that the integration is 'operational but not synchronized' — a real, distinct-from-conflict escalation with clear framing for the receiver.

CANCELLATION / SUPERSESSION:
a.history is the correct supersession handling: an event whose described state 'current state has moved past' is recorded as history without acting on it, explicitly to prevent 'a week of held onboarding messages delivered at once' — this directly matches guardrail #2 ('a historical event does not trigger obsolete customer communication') and is enforced structurally, not just documented.

HANDOFFS:
- h.conflict → INT-119: carries ["both values with their timestamps, versions and provenance","the outage window, which is context for which side is more likely to be stale"]
- h.escalate → OWN-55: carries ["the window that remains unrecoverable and what it may contain","the explicit fact that the integration is operational but not synchronized"]

COMPLETION:
x.synchronized requires verification against the authoritative source showing 'no known synchronization gap remains' — this is a strong completion bar, not merely 'we replayed the events we found'; a.reconcile explicitly does not assume the backfilled events 'add up' to the authoritative truth.

RESULT / FEEDBACK:
OPS-129 and DAT-229 (operational) and DOC-220 (customer) reference this workflow via distinctFrom prose only, not structured handoffs — no confirmed downstream consumer of the x.synchronized state itself in this dump.

CORRECTION / REOPEN:
x.synchronized reEntry states 'a further outage opens its own window' — correctly treats each outage as its own episode rather than reopening a prior backfill.

OBSERVABILITY / AUDIT:
backfill_log appended at every action (window/fetch/dedupe/process/history/reconcile/verify) — a genuinely complete trail of what was fetched, what was applied vs. treated as history, and the final verification result.

CONSUMER COVERAGE:
Classification: active. INT-116 is the confirmed real sender into this workflow (h.reconnect), matching this workflow's own trigger and required inputs (outage window, unresolved operations). OPS-129, DOC-220, DAT-229 are all distinctFrom-prose-only, not structured consumers.

TEST CASES:
- [duplicate-creation] Given: a backfilled event was already processed via the live webhook path before the outage was detected → Expect: a.dedupe treats it as harmless, same as a live duplicate
- [stale-work] Given: a backfilled event describes state current state has since moved past → Expect: c.actionable routes to a.history — recorded, not acted on, preventing obsolete communication
- [handoff] Given: post-backfill verification finds local and authoritative values disagree → Expect: h.conflict → INT-119, carrying both values with provenance and the outage window as staleness context
- [escalation] Given: part of the outage window cannot be recovered from the provider at all → Expect: h.escalate → OWN-55 with the explicit 'operational but not synchronized' fact rather than silently marking the integration healthy

GAPS:
- P2 (result-feedback): No structured consumer of x.synchronized is declared (OPS-129/DAT-229/DOC-220 are prose-only references) — anything downstream that needs to know 'backfill for this outage is done' has no declared handoff contract to read it from.

---

## INT-119 — Synchronization Conflict Resolution

READINESS: READY_WITH_MAPPING

WHY:
The refusal to treat 'newest timestamp' as authority, the per-field authority model, and the explicit hold-rather-than-guess fallback are all strong, well-reasoned canonical decisions with a real escalation path on timeout. Mapping work is limited to actually defining the authority rules per entity/field and the conflict-resolution SLA — exactly the kind of company-specific policy this round expects to be mapped, not invented.

RESPONSIBILITY:
Resolve a cross-system value disagreement using an explicit, possibly per-field, authority rule — and hold the mutation rather than guess (e.g. via last-write-wins) when no rule settles it.

INSTANCE:
Work instance = one detected cross-system inconsistency, scoped to 'the synchronized entity and the specific fields in disagreement' — entity.note explicitly supports per-field authority (billing owns plan, identity owns email). No instanceKey/concurrency declared.

ENTRY:
Authoritative: `cross_system_inconsistency_detected`; explicitly excludes 'a system that has not yet received a change still propagating within its expected window' as a false-positive trigger — correctly distinguishes real conflict from normal propagation lag.

OWNERSHIP:
Automated collect→branch(single-authority/per-field/none)→propagate pipeline. On 'cannot be determined safely,' the mutation is held (a.conflict-state) pending w.resolution, with DEC-181 taking ownership only on SLA timeout via h.review.

ASSIGNMENT / QUEUE:
N/A — no human queue in the base resolvable path; DEC-181 is the named decision-authority destination once automation cannot resolve it.

DATA:
Each system's value, timestamp, version, provenance, and the applicable authority rule are all explicitly collected at a.collect before any decision — good, complete input specification with provenance stated.

EVIDENCE:
This is effectively an evidence-weighing workflow even though framed as 'sync': multiple system-of-record values are the evidence, and the guardrail is explicit that recency (timestamp) is not treated as authoritative evidence on its own ('A timestamp alone is not authority - clocks disagree, and write order is not the order decisions were made') — a real, well-articulated anti-pattern avoidance.

AUTHORITY / APPROVAL:
Authority here is a data/system-of-record concept rather than a human approval, and the workflow is precise about who/what may 'decide': a single defined authoritative system, or a per-field rule — and explicitly refuses to let 'making the sync succeed' (i.e., picking whichever system wrote last) stand in for a real decision when no rule applies.

IDEMPOTENCY:
a.propagate is explicit that the resolved state is propagated 'idempotently, carrying origin and version so the correction is not read as a new change by the system receiving it' — this directly targets and prevents the escalation-loop-style hazard called out in the brief ('two systems correct each other indefinitely and the conflict becomes traffic').

SLA / TIME:
w.resolution times out 'after: the conflict resolution SLA' with the reason explicit that a held mutation means a stopped business process — correctly undeclared numeric value, onTimeout routes to h.review rather than continuing to hold indefinitely.

ESCALATION:
h.review → DEC-181 fires only after SLA timeout on an undetermined-authority conflict, carrying every value with source/version/provenance and which mutations are being held and what that blocks — precise, receiver-usable payload; no loop back into this workflow that could create a ping-pong.

CANCELLATION / SUPERSESSION:
N/A — no separate cancellable work item; a.conflict-state's 'hold' is itself the correct non-guessing response, and x.reconciled reEntry treats a fresh divergence on the same entity as its own new assessment (with prior resolution in the record) rather than reopening.

HANDOFFS:
- h.review → DEC-181: carries ["every value with its source, version and provenance","which mutations are being held, and what that is blocking"]

COMPLETION:
x.reconciled requires the conflict to be 'resolved by rule and propagated idempotently' — resolution is rule-based and the propagation guarantee (origin/version tagging) is stated as part of what makes the completion durable, not merely 'a value was picked.'

RESULT / FEEDBACK:
This workflow is itself the confirmed receiver of handoffs from INT-115 (h.conflict) and INT-118 (h.conflict) — both dump entries confirm the carried payload matches what c.authority needs. No downstream consumer of x.reconciled itself is declared in this dump slice.

CORRECTION / REOPEN:
x.reconciled reEntry explicitly treats a further divergence on the same entity as a fresh, independently-assessed conflict, 'with this resolution in the record' — correct non-overwritten-history behavior.

OBSERVABILITY / AUDIT:
sync_conflict_log appended at every action (collect/reconcile-to-source/per-field/conflict-state/propagate) — captures which authority path was taken and why, plus what was held when unresolved.

CONSUMER COVERAGE:
Classification: active. INT-115 and INT-118 are both confirmed real handoff senders (h.conflict) whose carried payloads match this workflow's a.collect input needs exactly.

TEST CASES:
- [handoff] Given: two systems disagree and no authority rule covers the field → Expect: a.conflict-state holds the mutation (SYNC_CONFLICT) rather than picking whichever value wrote last
- [escalation] Given: the conflict remains unresolved past the conflict resolution SLA → Expect: w.resolution timeout fires h.review → DEC-181 with full value/provenance context and what's being blocked
- [completion] Given: authority is per-field (billing owns plan, identity owns email) → Expect: a.per-field applies each field's own rule rather than one rule across the whole entity

GAPS:
- P1 (authority-approval): The per-field/single-system authority rules themselves are not defined in this workflow (correctly, per house rules) — a company must map an actual authority-rule table per entity/field before this workflow is safely implementable; without it, c.authority's three branches have no concrete criteria to route on.

---

## INT-120 — Dependency Degradation Recovery

READINESS: READY_WITH_MAPPING

WHY:
The scope-then-choose (degrade/alternate/block) decision tree is complete and each branch is correctly conservative about not converting 'unknown' into 'failed.' The alternate-path branch correctly checks whether the primary submission already happened before ever trying a second path, directly preventing a duplicate external effect.

RESPONSIBILITY:
When a critical external dependency (not our own integration to it) goes down, degrade only the capability that actually needs it — or use a defined alternate path — without ever claiming a user action failed while its outcome is genuinely unknown.

INSTANCE:
Work instance = one dependency-unavailability episode, scoped to 'the external dependency and each capability that depends on it' — entity.note is explicit that scope is the whole decision ('Failing the product because one provider is down is a self-inflicted outage larger than the one being responded to'). No instanceKey/concurrency declared.

ENTRY:
Authoritative: `critical_external_dependency_unavailable`, explicitly excluding 'a single failed call, which is an error rather than an outage' as insufficient — a precise threshold.

OWNERSHIP:
Automated scope→(degrade|alternate|block)→wait→revalidate pipeline, no named human owner in the base path. h.escalate → OWN-55 is the only ownership transfer, firing on a timed-out recovery wait.

ASSIGNMENT / QUEUE:
N/A — no queue; OWN-55 is the sole named escalation destination.

DATA:
Which capabilities depend on the unavailable provider (a.scope) and whether the operation already reached the primary provider (c.submitted) are the two decision-critical data points, both computed internally rather than assumed as external input.

EVIDENCE:
N/A — not a review workflow; branching is on system state (dependency availability, submission status), not human-weighed evidence.

AUTHORITY / APPROVAL:
N/A — fully automated; no approval gate.

IDEMPOTENCY:
This is a strong, explicit idempotency guard: c.submitted checks whether the operation already reached the primary provider *before* trying an alternate path, specifically to prevent 'one payment becomes two' if the alternate path fires while the primary's outcome is still unknown (x.no-alternate exit exists precisely to hold this case). a.alternate is explicitly given 'its own correlation and idempotency identifiers,' distinct from the primary attempt's.

SLA / TIME:
w.recovery times out 'after: the operational escalation point' with the reason explicit that continuing to wait past that point 'belongs to a person' — an honestly undeclared duration, correctly deferred to policy/human judgment at that point rather than to an invented number.

ESCALATION:
h.escalate → OWN-55 fires on recovery-wait timeout, carrying which capabilities are degraded/blocked and for how long, plus explicitly 'the operations held with unknown outcomes, which nobody has resolved either way' — this last clause is a genuinely important detail: the escalation payload itself flags the unresolved-unknowns risk rather than letting it silently persist.

CANCELLATION / SUPERSESSION:
a.block explicitly preserves state rather than claims a failure: 'a provider outage is not evidence that the user's action failed, and recording it as failed converts our blindness into their result' — this is a precise, well-stated guard against the exact 'unknown treated as failed' anti-pattern the brief calls out (house rule: never treat unresolved as failed).

HANDOFFS:
- h.escalate → OWN-55: carries ["which capabilities are degraded or blocked and for how long","the operations held with unknown outcomes, which nobody has resolved either way"]

COMPLETION:
x.restored requires 'pending actions were revalidated' before being considered restored — a.revalidate is explicit that some actions 'may have completed at the provider while we could not see them, and resuming without checking is how a retry becomes a duplicate.' This is a strong, idempotency-aware completion bar, not a bare 'the dependency came back' claim.

RESULT / FEEDBACK:
This workflow has zero declared consumers in the dump (`consumers: []`) — no other workflow in the 284-journey corpus references it, and it has no outbound handoff other than the OWN-55 escalation.

CORRECTION / REOPEN:
x.restored reEntry states 'a further outage is scoped on its own terms' — each dependency outage is treated as an independent episode, not a reopen of a prior one.

OBSERVABILITY / AUDIT:
dependency_log appended across scope/degrade/alternate/block/revalidate — gives a reconstructable trail of what was degraded, whether an alternate was used, and revalidation results.

CONSUMER COVERAGE:
Classification: orphan-candidate. `consumers` is an empty array — no other workflow in the corpus references INT-120 via handoff or distinctFrom prose. Per the brief's own distinction, this could be event-driven (the trigger event is plausibly emitted by external dependency monitoring, an authoritative/external source) rather than a true orphan, but reporting it as orphan-candidate is the more honest default absent any corroborating consumer text — flagging for coordinator judgment rather than asserting either way with confidence.

TEST CASES:
- [duplicate-creation] Given: the operation already reached the primary provider before the alternate path is considered → Expect: c.submitted routes to x.no-alternate rather than a.alternate, since firing a second path risks a duplicate external effect while the first outcome is unknown
- [completion] Given: the dependency recovers with several actions that were pending during the outage → Expect: a.revalidate checks each before resuming, since some may have already completed at the provider invisibly
- [escalation] Given: degradation/blocking outlives the operational escalation point → Expect: h.escalate → OWN-55, explicitly flagging any operations still held with unknown outcomes

GAPS:
- P2 (consumer-coverage): Zero declared consumers anywhere in the 284-journey corpus (`consumers: []`) — this is a real orphan-candidate flag per the brief's own criteria, though the trigger (`critical_external_dependency_unavailable`) is plausibly emitted by external monitoring, which weighs toward event-driven rather than truly unused; worth confirming with the coordinator which classification this round intends.

---

## OWN-51 — Task Assignment

READINESS: READY_WITH_MAPPING

WHY:
Ownership states (queue vs named owner) are cleanly separated via c.named, duplicate-routing is explicitly guarded (c.existing), and the fallback path is not invented. What remains is mapping-level: the actual routing rule set, the fallback queue identity, and the acceptance SLA are policy pointers, not gaps in the graph.

RESPONSIBILITY:
Routes a new work item into the smallest valid responsibility scope (owner, team, or queue) using policy-defined routing inputs; falls back to a named fallback/shared queue when no route resolves, without inventing priority logic.

INSTANCE:
Work item = one instance (case/lead/opportunity/task/request per entity.scope). No explicit entity.instanceKey declared (predates the convention) -- identity is implied by "one item, one active routing." Duplicate policy: c.existing explicitly prevents a duplicate routing event from creating a second active owner ("resolves here rather than producing a rival assignment - unless a multi-owner model is explicitly defined").

ENTRY:
Authoritative trigger work_item_requiring_responsibility -- a work item created/becoming actionable that requires someone responsible. Explicitly excludes drafts and reference-only records. Precise, not hand-waved.

OWNERSHIP:
Two ownership shapes recorded explicitly: queue ownership (x.queued, "the queue itself carries responsibility") and named ownership (routed to OWN-52 for acceptance). Entering this workflow does not itself grant ACTIVE ownership -- OWN-52 does. c.existing prevents two owners from a duplicate event.

ASSIGNMENT / QUEUE:
Routing inputs are named (work type, geography, expertise, existing relationship, workload, priority, entitlement, language, segment) but the actual rule mapping those inputs to a team/queue is policy. Fallback queue is "the fallback or shared queue the policy names" -- the specific queue identity is a mapping item.

DATA:
a.inputs gathers routing inputs from the item/account; provenance for each (workload, entitlement, existing relationship) is not specified -- a company must define where each is read from.

EVIDENCE:
N/A -- this is a routing decision, not a review/investigation.

AUTHORITY / APPROVAL:
N/A -- no approval step; c.route/c.named are deterministic policy lookups, not human authority decisions.

IDEMPOTENCY:
c.existing is the create-if-absent guard for the ownership record. a.route/a.fallback append to routing_log with the resolving inputs recorded. No explicit ActionNode idempotencyKey/attemptBudget is shown on a.route or a.fallback.

SLA / TIME:
No wait/timeout declared in this workflow itself (waits: []); the acceptance SLA is referenced only via the handoff to OWN-52 ("any SLA already running, since assignment does not start the clock") -- correctly deferred rather than duplicated here.

ESCALATION:
N/A -- no escalation node; unresolved routing goes to a.fallback (visible manual routing), not an escalation ladder.

CANCELLATION / SUPERSESSION:
N/A -- not addressed; what happens if the item is cancelled before routing completes is not covered (minor).

HANDOFFS:
- h.assign → OWN-52: carries ["the routing decision and the inputs behind it","any SLA already running, since assignment does not start the clock"]

COMPLETION:
Thin by design: exits at x.already-owned, x.queued, or hands off via h.assign -- appropriate for a routing step where "complete" means "a queue/owner is recorded," not a business outcome.

RESULT / FEEDBACK:
N/A -- upstream of a decision; nothing to report back except the routing record itself.

CORRECTION / REOPEN:
A genuine ownership change later is explicitly OWN-54's job, not a re-route (x.already-owned's reEntry). A wrongly-routed item re-enters via OWN-52's own h.reroute rejection path.

OBSERVABILITY / AUDIT:
routing_log records the resolved inputs behind every route and fallback decision -- "a route that is consistently wrong can be found." Good baseline auditability.

CONSUMER COVERAGE:
Classification: active. Real handoff consumer OWN-52 (h.assign, carries what OWN-52's entry needs). Prose-only references from REL-100 and DEC-182. Two workflows (FBK-46, TIM-62) hand INTO OWN-51 via their own h.orphan nodes, confirming OWN-51 is a genuine re-entry point for orphaned/overdue work.

TEST CASES:
- [duplicate-creation] Given: Two routing events fire for the same unowned work item in close succession. → Expect: c.existing detects the active assignment on the second event and resolves to x.already-owned rather than producing a rival owner.
- [handoff] Given: c.named resolves 'Named owner required' and h.assign fires into OWN-52. → Expect: The carried payload (routing decision + inputs, running SLA) satisfies OWN-52's t.assigned entry evidence requirement of a specific named person.
- [missing-evidence] Given: No routing rule covers the item's inputs. → Expect: a.fallback places it in the named fallback/shared queue and records that no route resolved, inventing no priority order.

GAPS:
- P2 (other): The fallback/shared queue identity and the acceptance SLA duration are named only as policy pointers with no default -- pure mapping work, correctly deferred by the source.
- P1 (idempotency): No explicit ActionNode idempotencyKey is shown on a.route/a.fallback; c.existing is a business-logic dedupe read rather than an atomic claim, so two near-simultaneous routing events on the same unowned item are not mechanically guarded against a race.

---

## OWN-52 — Assignment Acceptance

READINESS: READY_WITH_MAPPING

WHY:
Ownership states are crisply separated, rejection reasons are captured and fed back to OWN-51 to prevent repeat mis-routing, invalidation of un-accepted queued actions is explicit, and the SLA timeout branches to a real policy choice (escalate vs reassign). The missing pieces (acceptance SLA duration, which work types require acceptance) are policy mapping, not graph gaps.

RESPONSIBILITY:
Separates "proposed responsibility" (ASSIGNED) from "accepted responsibility" (ACTIVE_OWNERSHIP), with an optional acceptance step, an SLA-bound wait, and reroute/escalate paths on rejection/timeout.

INSTANCE:
entity.scope = "the work item plus this specific assignment of it" -- each assignment is its own record (the instanceKey-equivalent identity); a rejected assignment and the reassignment that follows are two separate records, deliberately kept as two facts.

ENTRY:
Authoritative trigger work_assigned_to_named_owner -- a named-person assignment, explicitly not satisfied by notification delivery or queue-view appearance. Precise.

OWNERSHIP:
ASSIGNED (proposed) vs ACTIVE_OWNERSHIP (accepted) are explicitly separate recorded states via a.proposed/a.active, never collapsed. c.required allows some work types to skip acceptance (assignment = ownership directly). Guardrail: "reassignment invalidates the previous owner's pending actions."

ASSIGNMENT / QUEUE:
N/A -- this workflow does not route; it processes an assignment that already named an owner (OWN-51's job).

DATA:
t.assigned requires "an assignment naming a specific person" -- data provenance is the OWN-51 handoff. No additional invented fields.

EVIDENCE:
N/A -- not a review/investigation workflow.

AUTHORITY / APPROVAL:
N/A -- acceptance is a binary participation decision by the assignee, not an approval-authority decision.

IDEMPOTENCY:
No explicit ActionNode idempotencyKey on a.proposed/a.active. Relies on OWN-51's upstream c.existing to prevent a duplicate ASSIGNED record for the same item; OWN-52 itself does not declare a guard against two concurrent w.acceptance instances if two assignment events land for the same item.

SLA / TIME:
w.acceptance times out "after: the acceptance SLA for this work type" -- a named per-work-type policy value, not invented; onTimeout branches into c.sla (escalate or reassign) rather than defaulting to acceptance.

ESCALATION:
c.sla branches to h.escalate (OWN-55) or a.invalidate -> h.reroute (OWN-51) per policy. Escalation retains "who it was assigned to and when" plus the running SLA -- the old assignment isn't silently dropped.

CANCELLATION / SUPERSESSION:
Rejection triggers a.reason (capture) -> a.invalidate (suppress queued sends) -> h.reroute. Reassignment explicitly "invalidates the previous owner's pending actions rather than leaving them to fire under an ownership that ended" (guardrail).

HANDOFFS:
- h.reroute → OWN-51: carries ["the rejection reason, so routing does not resolve to the same owner again","the SLA already running, which reassignment does not restart"]
- h.escalate → OWN-55: carries ["who it was assigned to and when","the work's own SLA, which has been running throughout"]
- h.context → OWN-53: carries ["the assignment and how it was reached","everything the owner will need to actually continue"]

COMPLETION:
"Complete" = reaching ACTIVE_OWNERSHIP (a.active) or a terminal reroute/escalate handoff. No standalone exit nodes (exits: []) -- every path terminates via a handoff, a reasonable design for a pure state-transition workflow.

RESULT / FEEDBACK:
Rejection reason explicitly propagates back to OWN-51 "so routing does not resolve to the same owner again" -- a structured field, not free-text prose the receiver must parse.

CORRECTION / REOPEN:
A rejected assignment's rejection reason is retained even after reroute -- "the first is routing information worth keeping" (guardrail), so the correction record persists for future audits.

OBSERVABILITY / AUDIT:
assignment_log records ASSIGNED, rejection reason, and ACTIVE_OWNERSHIP append-only; suppressed_sends tracks invalidated actions. Sufficient to reconstruct who was offered what and when.

CONSUMER COVERAGE:
Classification: active. Real consumers OWN-51 (via OWN-51's own h.assign feeding this workflow) and OWN-53 (via this workflow's own h.context, also prose-referenced).

TEST CASES:
- [concurrent-claim] Given: Two assignment events for the same item land before the first w.acceptance resolves. → Expect: No explicit guard is declared -- worth confirming a company's implementation rejects or merges the second before it produces a second ASSIGNED record.
- [escalation] Given: w.acceptance times out with no response. → Expect: c.sla branches to h.escalate (policy escalates) or a.invalidate/h.reroute (policy reassigns) -- never a silent default to acceptance.
- [handoff] Given: Acceptance completes and h.context fires into OWN-53. → Expect: The carried assignment + context needed satisfies OWN-53's t.effective entry (a valid assignment on an entity with existing state).

GAPS:
- P1 (ownership): No explicit guard against two concurrent proposed assignments existing for the same work item (e.g., a second t.assigned arriving while an existing w.acceptance is still pending).
- P2 (sla-escalation): The per-work-type acceptance SLA duration is a policy value, correctly left undeclared -- mapping only.

---

## OWN-53 — Ownership Context Transfer

READINESS: READY_WITH_MAPPING

WHY:
Clear separation from OWN-52 (accepting responsibility vs. being able to discharge it), an explicit data-minimization step, and an optional acknowledgement wait with an explicit escalation path on timeout. Missing: the acknowledgement window duration and which items count as "critical" are named as policy pointers, not invented -- mapping work.

RESPONSIBILITY:
Once an ownership assignment is effective, assembles and transfers the operational context (open obligations, deadlines, decisions, history) the new owner needs to actually continue the work, minimizing sensitive data exposure and optionally requiring acknowledgement.

INSTANCE:
entity.scope = "the business entity plus the owner now responsible for it." No instanceKey declared; the instance is implicitly the (entity, ownership-effective-event) pair -- "the next ownership change opens its own transfer" (exit reEntry).

ENTRY:
Authoritative trigger owner_assignment_became_effective -- requires a valid assignment on an entity with existing state. Precise; fires once ownership is effective (distinct from OWN-52's acceptance step per its own distinctFrom note).

OWNERSHIP:
Does not adjudicate who owns (OWN-52 does) -- operationalizes an already-effective ownership by transferring context so the stated owner can actually act. Assumes t.effective's authority rather than re-deciding it.

ASSIGNMENT / QUEUE:
N/A -- no routing; the receiver is already the named/effective owner from upstream.

DATA:
a.assemble names required inputs precisely: current state, open obligations, deadlines, decisions taken, history behind those decisions, pending dependencies, promises made. a.minimise then filters to proportionate content.

EVIDENCE:
N/A -- not a review/decision workflow; what would be "evidence" here is context, addressed under data.

AUTHORITY / APPROVAL:
N/A -- no approval; only an optional acknowledgement, a participatory confirmation rather than a decision-authority act.

IDEMPOTENCY:
No explicit idempotencyKey; a repeated t.effective event for the same assignment could re-run a.assemble/a.minimise redundantly -- not addressed, though lower-risk than a duplicate work-creation action.

SLA / TIME:
w.ack timeout is "a bounded acknowledgement window" -- explicitly named as bounded, duration deferred to policy (correctly, not invented).

ESCALATION:
onTimeout -> h.escalate (OWN-55) carrying what was not acknowledged and the still-running deadlines. Single-level, no loop risk (no further escalation node inside OWN-53 itself).

CANCELLATION / SUPERSESSION:
N/A -- the interaction between two overlapping transfers to the same entity (if ownership changes again before this transfer completes) is not addressed (minor gap).

HANDOFFS:
- h.escalate → OWN-55: carries ["what was not acknowledged and what depends on it","the deadlines still running, which acknowledgement was never going to pause"]

COMPLETION:
x.working ("owner working from current state with inherited context") is the completion state -- reasonable: the job (make context available, optionally confirmed) is complete once the owner has started, whether or not acknowledgement was required.

RESULT / FEEDBACK:
N/A -- no consumer needs a decision outcome from this workflow beyond the escalation path.

CORRECTION / REOPEN:
"The next ownership change opens its own transfer" -- no reopen concept needed since this is per-event, not a persistent case.

OBSERVABILITY / AUDIT:
ownership_chain gets an append record via a.start; acknowledgement (or its absence) is tracked implicitly through the wait/escalate path. a.assemble and a.minimise themselves write nothing (see gap).

CONSUMER COVERAGE:
Classification: active. Consumed by OWN-52 (via OWN-52's own h.context node) and OWN-54 (via OWN-54's own h.context node) -- both real handoff senders, confirming OWN-53 is the shared post-ownership-change context-transfer step for both the acceptance path and the explicit transfer path.

TEST CASES:
- [handoff] Given: Critical items go unacknowledged past the window. → Expect: h.escalate fires into OWN-55 carrying what was not acknowledged and the unpaused deadlines.
- [completion] Given: Acknowledgement is not required for this work type. → Expect: c.ack routes directly to a.start and x.working without a wait.

GAPS:
- P2 (other): a.assemble and a.minimise both have empty writes -- the context-assembly and minimization decisions themselves aren't logged (only a.start's ownership_chain append is), so an auditor can't see exactly what was assembled vs. filtered out for proportionality.
- P2 (sla-escalation): Acknowledgement window duration and 'critical item' criteria are policy pointers -- correctly deferred, mapping only.

---

## OWN-54 — Ownership Transfer

READINESS: READY_WITH_MAPPING

WHY:
One of the most carefully specified workflows in the batch -- explicit entity-vs-personal classification per dependent item, a non-rewriting-of-history guardrail baked directly into the write action's own prose, a named fallback-owner path plus an explicit no-fallback escalation, and revalidation (not blind carry-forward) of pending actions whose authority basis changed. Remaining gaps are policy-value mapping plus one real idempotency ambiguity.

RESPONSIBILITY:
Moves responsibility for an active entity between owners on an authoritative ownership-change event -- inventories every owner-dependent obligation, decides per-item whether it follows the entity or the person, preserves historical attribution, and never silently orphans the entity on failure.

INSTANCE:
entity.scope = "the business entity, its previous owner and its next one" (three-party record). No instanceKey field, but the append-only ownership_chain is effectively the durable instance ledger -- each transfer event is its own chain entry, "who was responsible at the time."

ENTRY:
Authoritative trigger authoritative_ownership_change -- explicitly excludes an unapproved change request and an owner-unavailability event (which routes to OWN-55 instead). Precise and well-bounded against neighboring workflows.

OWNERSHIP:
The most rigorous ownership handling in the batch: a.record appends the new owner to the chain while explicitly preserving historical attribution of past actions/decisions/payments/documents/approvals to whoever performed them (not the new owner). c.acceptance/c.result/c.failed handle a declining incoming owner, with a.fallback or h.escalate -- never a null owner (explicit guardrail "work is never silently orphaned").

ASSIGNMENT / QUEUE:
N/A -- this is a change to an already-identified next owner, not a routing decision.

DATA:
a.inventory enumerates required data comprehensively (tasks, commitments, deadlines, live escalations, follow-ups, pending decisions, access, pending approvals, notifications, billing/admin contacts, assigned work, delegations, external representations) -- thorough, no invented fields.

EVIDENCE:
N/A -- not a review workflow, though a.record/a.inventory produce audit evidence as a byproduct.

AUTHORITY / APPROVAL:
c.pending-authority explicitly identifies pending actions "authorised only by the previous ownership state" and routes them to a.revalidate-pending (hold + revalidate) rather than blindly executing or cancelling -- correctly treats "assigned/acting" as distinct from "had authority to approve."

IDEMPOTENCY:
No explicit ActionNode idempotencyKey on a.record/a.dependent/etc. Durable writes are append-only (ownership_chain, obligation_transfer_log), safer against duplicate-processing than overwrites, but a duplicate/re-delivered t.change event for the same transfer is not explicitly deduplicated at entry.

SLA / TIME:
w.acceptance timeout is "the transfer acceptance window" (named policy value, not invented); onTimeout -> c.failed (fallback-or-escalate), never a silent default-accept.

ESCALATION:
c.failed -> a.fallback (if named) or h.escalate -> OWN-55 (if not) -- carries "the entity, its open obligations and their unchanged deadlines" plus the explicit fact "it currently has no valid owner - which is a state, not an empty field." No loop risk (single terminal branch).

CANCELLATION / SUPERSESSION:
a.invalidate suppresses clearly-unauthorized queued actions from the previous owner; items that "may still be valid are... held and revalidated once the transfer completes" (a.revalidate-pending) -- a careful three-way split (kill / hold-and-revalidate / let-proceed) rather than a blunt cancel-everything.

HANDOFFS:
- h.delegations → CTL-237: carries ["the delegations, their scope and the authority they were granted from","the explicit fact that a delegation cannot outlive the authority it borrowed, and that only delegation-derived rights are removed"]
- h.escalate → OWN-55: carries ["the entity, its open obligations and their unchanged deadlines","the explicit fact that it currently has no valid owner - which is a state, not an empty field"]
- h.context → OWN-53: carries ["the full obligation inventory with original deadlines intact","the ownership chain, so the new owner can see what was decided before they arrived"]

COMPLETION:
No standalone exits array (exits: []) -- every path terminates in a handoff (h.delegations, h.escalate, or h.context); "done" is always defined by what the receiving workflow does next, appropriate for a pure transfer mechanism.

RESULT / FEEDBACK:
Both success (h.context, carrying the ownership chain "so the new owner can see what was decided before they arrived") and failure (h.escalate, explicit "no valid owner" state) propagate structured, non-prose outcomes.

CORRECTION / REOPEN:
N/A in the reopen sense (not a decision that gets appealed) -- but historical attribution preservation is itself the correction-safety mechanism preventing retroactive rewriting.

OBSERVABILITY / AUDIT:
Extremely strong -- ownership_chain, obligation_transfer_log, and suppressed_sends are all append-only, and each action's own does text explains the audit rationale inline. One of the best-documented workflows in the batch.

CONSUMER COVERAGE:
Classification: active. Real handoff consumers: OWN-55 (h.transfer), REL-92 (h.ownership, customer surface), CTL-234 (h.reconcile), CTL-237 (h.work). Plus prose-only references from OWN-51, OWN-60, TRM-105. Well-consumed across both operational and customer surfaces.

TEST CASES:
- [handoff] Given: Transfer completes successfully and h.context fires into OWN-53. → Expect: The carried ownership chain + obligation inventory satisfies OWN-53's t.effective entry requirement of 'existing state'.
- [escalation] Given: The incoming owner declines and no fallback owner is defined by policy. → Expect: c.failed routes to h.escalate -> OWN-55 rather than leaving the entity ownerless.
- [duplicate-creation] Given: The authoritative ownership-change event is re-delivered. → Expect: No explicit entry-level dedupe guard is declared -- worth confirming a company's implementation does not double-append the ownership chain.

GAPS:
- P1 (idempotency): No explicit dedupe/idempotencyKey guard against a re-delivered authoritative_ownership_change event re-running the entire transfer (re-appending a duplicate ownership_chain entry, re-invalidating already-invalidated actions).
- P2 (other): The OWN-54 <-> CTL-237 relationship (this workflow hands delegations to CTL-237 via h.delegations; CTL-237 also hands outstanding work back via its own node) is legitimate but should be documented explicitly as a cycle so an implementer doesn't mistake it for a provenance error.

---

## OWN-55 — Ownership Escalation

READINESS: READY_WITH_MAPPING

WHY:
This is the batch's central hub -- roughly 30 workflows hand off into it -- and its own logic is disciplined: an explicit "escalation is not abandonment" default, a bounded ladder walked once per level, and an explicit rule that an exhausted ladder produces an internal exception with no customer communication by itself. The main real risk is that a single generic two-branch resolution outcome must somehow cover wildly different sender domains -- a mapping risk, not a graph defect.

RESPONSIBILITY:
Moves a blocked/SLA-breached work item to the policy-defined escalation ladder for a decision or support, without transferring ownership unless policy explicitly says escalation moves ownership, and closes an exhausted ladder as an internal operational exception with no customer-facing message.

INSTANCE:
entity.scope = "the work item plus its ownership chain." No instanceKey; "escalated" is a state layered onto whatever the underlying instance already is (task, obligation, incident, etc.) -- reasonable given OWN-55 is a shared mechanism consumed by roughly 30 different domains, each with its own upstream instance identity.

ENTRY:
Authoritative trigger escalation_condition_met, explicitly bounded (SLA breached/at risk, authority limit reached, severity threshold crossed, a blocker the owner cannot clear, repeated failed resolution, or an explicit requirement) and explicitly excludes "an owner finding the work difficult" and "elapsed time with no defined SLA behind it" -- a strong, non-hand-waved entry contract.

OWNERSHIP:
Central discipline: c.transfers explicitly asks whether escalating "transfers ownership, or asks for a decision," and a.support explicitly records that "the original owner remains responsible... Escalating is not putting the work down." Directly implements the round's human/automation-ownership discipline and is a strong example of not inventing a universal "escalation reassigns" rule.

ASSIGNMENT / QUEUE:
c.destination checks whether policy defines a valid destination for this specific escalation condition; if not, h.no-path -> DEC-181, rather than picking an arbitrary destination.

DATA:
a.capture records "why it is escalating and the current context" -- sufficient for the receiver to decide without re-discovering the case, per its own stated purpose.

EVIDENCE:
N/A -- routing/support-request rather than an evidentiary review; the underlying case's own evidence travels via a.capture's context capture but isn't itself evaluated here.

AUTHORITY / APPROVAL:
Decision authority sits entirely with the escalation target (the higher-authority level), not with OWN-55 itself -- OWN-55 is a router/tracker and correctly does not claim decision authority for itself.

IDEMPOTENCY:
a.next-level explicitly guards against a loop: "the ladder is walked once - a loop that keeps re-escalating to the same place is how an unresolvable case stays busy without moving," and c.further checks for an unused level before escalating again -- a genuine, source-stated bound satisfying the house rule against inventing a numeric limit.

SLA / TIME:
w.resolution timeout is "the escalation SLA at this level" -- a per-level policy value, correctly not a single invented global number.

ESCALATION:
This IS the escalation mechanism; recursively, on its own timeout it walks c.further -> a.next-level, or (ladder exhausted) -> h.exhausted -> DEC-181, explicitly with "no customer-facing message" per its own guardrail.

CANCELLATION / SUPERSESSION:
N/A -- not addressed; what happens if the underlying work item is separately cancelled/superseded while escalation is in flight isn't covered (minor real gap).

HANDOFFS:
- h.no-path → DEC-181: carries ["the escalation reason and everything gathered","the fact that no path was invented to route it, which is why a person is being asked"]
- h.transfer → OWN-54: carries ["the escalation reason as the transfer reason","the open obligations, whose deadlines the transfer does not reset"]
- h.exhausted → DEC-181: carries ["every level tried, when, and what came back","the original blocker, still unresolved"]

COMPLETION:
x.returned ("blocker cleared; the original owner continues" -- "nothing is handed back, because nothing was handed over") and x.closed ("resolved at the escalated level") are both well-specified, cleanly distinguishing "blocker cleared, original owner still has the underlying work" from "escalated authority closed the underlying work outright" -- a correct application of the technical-completion-vs-business-completion (OPS-130) discipline: x.returned does NOT claim the underlying work is done.

RESULT / FEEDBACK:
Both exits are structured (returned vs. closed), letting the large number of upstream consumers distinguish "unblocked, continue your own workflow" from "resolved, your case is done at this level" without parsing prose.

CORRECTION / REOPEN:
x.closed's reEntry: "a recurrence is a new escalation, judged with this one in the history" -- explicitly a new episode, not a silent reopen of the same instance.

OBSERVABILITY / AUDIT:
escalation_log records why, level, and what the higher authority produced (append-only) -- sufficient minimum audit trail.

CONSUMER COVERAGE:
Classification: active. By far the highest-fan-in workflow in the batch -- real handoff consumers from OWN-52/53/54/56/57/58 plus roughly two dozen customer- and mechanism-surface workflows (TIM-61/62, ACC-72/78/80, IDN-82/84, REL-100, TRM-102/103/105/106/107/108/110, INT-113/116/118/120, OPS-122/123/127/129, FIN-137, FUL-146, REM-152/156/159/160, SUB-163/170, SCH-174/177, DEC-189, INC-259). This is the corpus's shared escalation backbone.

TEST CASES:
- [escalation] Given: w.resolution times out and a further ladder level exists. → Expect: c.further routes to a.next-level rather than re-escalating to the same destination, per the source's own once-per-level rule.
- [handoff] Given: Policy says escalating genuinely moves ownership. → Expect: c.transfers routes to h.transfer -> OWN-54, carrying the escalation reason as the transfer reason and the open obligations with unchanged deadlines.
- [completion] Given: The higher authority clears the blocker without closing the underlying work. → Expect: c.resolved routes to x.returned, and the original owner -- not a new one -- continues; nothing is treated as handed over.

GAPS:
- P1 (sla-escalation): With roughly 30 distinct domains converging on the same generic two-branch resolution outcome (unblocked-continues / resolved-outright), a company implementing this must ensure every sender-specific meaning of 'resolved outright' maps correctly back through this shared vocabulary -- a real mapping risk given the fan-in, even though the graph itself is sound.
- P2 (other): No explicit handling of the underlying work item being cancelled/superseded while an escalation on it is still in flight.

---

## OWN-56 — Approval Request

READINESS: NEEDS_CONTRACT_WORK

WHY:
Version-binding, the three-outcome branching, and the never-default-to-yes SLA design are all sound and mapping-only. But the workflow's own purpose is explicitly "keep approving separate from doing," yet nothing in the graph establishes that the approver must be someone other than the requester -- self-approval is structurally possible and would violate the workflow's own stated purpose, a missing authority-contract element rather than a policy value to supply at mapping time.

RESPONSIBILITY:
Binds a single approval decision to the exact reviewed version of a subject; keeps "requested" and "approved" as distinct states, and ensures rejection/changes-requested both close the request against that version rather than letting a later revision be silently deemed approved.

INSTANCE:
entity.scope = "the approval request, bound to one specific version of the subject" -- the version binding IS the identity; an approval "attached to an entity rather than a version authorises whatever that entity becomes afterwards" is explicitly named as the failure mode this avoids.

ENTRY:
Authoritative trigger approval_required_request_ready, requiring "an identifiable subject version," explicitly excluding a still-being-edited draft with no stable version. Precise.

OWNERSHIP:
Distinguishes reviewer/decision-authority from requester in principle, but does not structurally enforce that distinction (see authorityApproval). PENDING_REVIEW is a distinct explicit state that nothing downstream may act on.

ASSIGNMENT / QUEUE:
N/A -- routing to a specific reviewer/authority isn't modeled here (presumably upstream or fixed by policy) -- reasonable scope boundary.

DATA:
The subject version identifier is the core required datum; no additional invented fields.

EVIDENCE:
N/A -- a decision/approval workflow rather than an investigation; what's "reviewed" is the subject itself, not external evidence.

AUTHORITY / APPROVAL:
The core gap. Self-approval is not addressed either way -- no guardrail states the requester can or cannot approve their own request. Given this workflow's own stated purpose is specifically "keep approving separate from doing," a requester approving their own request would violate that purpose while nothing in the graph structurally prevents it. Single/multiple approval is correctly deferred to OWN-57. Rejection is terminal for the version (h.rejected -> OWN-59).

IDEMPOTENCY:
a.create is the create-if-absent-equivalent for PENDING_REVIEW; no explicit idempotencyKey declared, and no guard shown against two approval requests being created for the same (subject, version) pair.

SLA / TIME:
w.review timeout is "the approval SLA" (named policy value); onTimeout -> c.sla -> escalate (OWN-55) or expire (x.expired), matching the explicit guardrail against a default yes.

ESCALATION:
h.escalate -> OWN-55 on an unreviewed approval past SLA, carrying the request/version and elapsed time -- standard, well-formed escalation into the shared hub.

CANCELLATION / SUPERSESSION:
x.revision ("changes requested; this request closed against this version... A revised subject is a different version and needs its own request") is effectively a supersession-by-new-version model, cleanly implemented.

HANDOFFS:
- h.execute → DEC-185: carries ["the approved version identifier, which execution must check it is still acting on","the approval record, so an internal yes is not confused with an external acceptance"]
- h.rejected → OWN-59: carries ["the rejection reason","the exact version rejected, which must not later execute"]
- h.escalate → OWN-55: carries ["the request and the version awaiting review","how long it has been waiting"]

COMPLETION:
APPROVED (a.approved) explicitly authorizes only "that version and nothing else" -- tightly scoped to the reviewed version, directly implementing the OPS-130-style discipline that approval-recorded is not execution-happened.

RESULT / FEEDBACK:
Three structured outcomes (APPROVED/REJECTED/CHANGES_REQUESTED) propagate cleanly to three different downstream consumers without prose-parsing.

CORRECTION / REOPEN:
x.expired ("the expiry authorises nothing, which is the point of expiring rather than defaulting") and x.revision both explicitly permit a fresh request rather than silently resurrecting the old one.

OBSERVABILITY / AUDIT:
approval_log append-only records creation, decision (with who/when for a.approved), and closure -- good minimum trail.

CONSUMER COVERAGE:
Classification: active. Real handoff consumers OWN-59 (h.resubmit, a genuine revision re-entering) and OWN-60 (h.reapprove, an authority-change-driven re-approval) both correctly re-enter at OWN-56 rather than inventing a parallel path. Also consumed by TIM-66 and prose-only by ACC-75.

TEST CASES:
- [self-approval] Given: The requester of an approval-required request is also the only available reviewer. → Expect: No guardrail addresses this; a company implementing this literally must add an explicit requester != approver check to preserve the workflow's own stated purpose.
- [duplicate-creation] Given: Two approval requests are created concurrently for the same subject version. → Expect: No guard is declared -- a race could produce two independent outcomes for the same version.
- [handoff] Given: A.approved fires h.execute into DEC-185. → Expect: The carried version id + approval record lets execution confirm it is still acting on the approved version, distinct from any external acceptance.

GAPS:
- P0 (authority-approval): The workflow never states whether the requester may be the same person as the approver. Given its own stated purpose is specifically to keep approving separate from doing, and nothing in the graph structurally prevents a requester from approving their own request, this is a genuine correctness-relevant gap for a company implementing this literally.
- P1 (idempotency): No explicit guard against two concurrent PENDING_REVIEW requests existing for the same (subject, version) -- a race could produce two independent approval outcomes for the same version.

---

## OWN-57 — Multi-Party Approval

READINESS: READY_WITH_MAPPING

WHY:
The strongest anti-hand-waving workflow in the batch: aggregation policy AND independence rules must both be explicitly defined before proceeding (both branch to h.undefined otherwise), and a.check-independence/c.independent explicitly catch "the same person approving through two roles" as a named failure mode. The only gap is that the governing policy itself is entirely external -- appropriately so, as pure mapping.

RESPONSIBILITY:
Aggregates several genuinely independent approval decisions against a single policy-defined threshold/graph (parallel/sequential/quorum/etc.), refusing to proceed if no policy defines how to combine them, and explicitly detects when "multiple decisions" collapse to one authority counted twice.

INSTANCE:
entity.scope = "the approval package, the action and subject version it authorises, and each authority's individual decision" -- each individual decision is its own record; the package aggregates but never replaces them (explicit guardrail).

ENTRY:
Authoritative trigger multi_party_approval_ready, explicitly requiring "more than one independent authority," and explicitly stating that "several people holding administrative access" is NOT sufficient evidence (each can act alone is not the same as a multi-party requirement) -- a precise, well-guarded entry contract.

OWNERSHIP:
N/A in the routing sense -- decision authority here is explicitly plural and policy-defined; the workflow's own job is aggregation, not deciding who owns the underlying work.

ASSIGNMENT / QUEUE:
N/A -- approvers are presumably identified by the policy graph (a.graph), not routed by this workflow.

DATA:
Bound to "the exact action and subject version" from creation (a.graph); a.rebind explicitly re-evaluates already-collected decisions if the action/version changes underneath the package, discarding stale ones -- a strong freshness-before-decision implementation.

EVIDENCE:
N/A -- decisions themselves are the unit under aggregation, not external evidence.

AUTHORITY / APPROVAL:
The centerpiece. c.aggregate distinguishes blocking-rejection / changes-requested / action-or-version-changed / threshold-satisfied as four genuinely different states. a.check-independence + c.independent explicitly guard against double-counting one authority -- a named, source-stated defense against the most common failure mode of n-of-m rules.

IDEMPOTENCY:
a.short records "the threshold was not genuinely met" and returns to waiting rather than silently re-counting -- a semantic dedupe rather than a mechanical key. No explicit ActionNode idempotencyKey shown for a.authorize itself.

SLA / TIME:
w.decisions timeout is "the approval SLA for the package" (policy value); onTimeout -> h.escalate (OWN-55) -- "a partial decision set is not an authorisation, and waiting longer does not turn it into one."

ESCALATION:
h.escalate -> OWN-55 carrying "which decisions are outstanding and from whom" plus elapsed time -- standard, well-formed.

CANCELLATION / SUPERSESSION:
a.rebind explicitly handles the subject/action changing mid-flight by discarding stale decisions and re-collecting rather than blindly carrying forward or restarting from zero -- genuinely careful supersession-of-partial-state handling.

HANDOFFS:
- h.undefined → DEC-181: carries ["the request, the version and the approvers involved","the explicit fact that no majority, quorum, unanimity, threshold or tie-break rule was assumed in order to proceed, and that no assumption was made about which authorities count as independent - without that, one person approving through two roles satisfies a two-person rule and nobody can see that they did"]
- h.escalate → OWN-55: carries ["which decisions are outstanding and from whom","how long the package has been open"]
- h.execute → DEC-185: carries ["the authorised version and the decision set behind it","the fact that this is internal authorisation, which is not a counterparty's acceptance of anything"]

COMPLETION:
AUTHORIZED (a.authorize) explicitly records "which decisions satisfied which part of the policy, which authority each came from and the exact action and version they authorised -- so that what authorised this can be reconstructed without inferring it." A textbook completion contract.

RESULT / FEEDBACK:
x.blocked and x.revision are both structured, non-terminal exits allowing resubmission where policy permits; h.execute is the success path.

CORRECTION / REOPEN:
x.revision's reEntry ("retained decisions carried forward") explicitly distinguishes retained vs. re-opened decisions per a.revalidate's own logic -- decisions unaffected by a revision are not asked to re-approve ("approval fatigue" is explicitly named as the failure this avoids).

OBSERVABILITY / AUDIT:
approval_log records the policy used, each authority's independence-checked decision, and full authorization rationale -- strong.

CONSUMER COVERAGE:
Classification: event-driven. consumers lists only OWN-56 (prose-only, viaDistinctFrom, no real handoff). No workflow in this batch shows a real handoff into OWN-57, but its trigger (an authoritative request that a rule requires more than one independent authority to approve) is plausibly raised by whatever request/change process needs multi-party approval -- treated as event-driven rather than orphan-candidate given the well-specified, plausible entry event.

TEST CASES:
- [approval] Given: The required decision set resolves, but two counted decisions trace to the same authority under two roles. → Expect: a.check-independence catches it via c.independent, and a.short records the shortfall instead of falsely authorizing.
- [stale-work] Given: The action or subject version changes while decisions are still being collected. → Expect: a.rebind re-evaluates already-collected decisions against the new version and discards those that no longer apply.
- [handoff] Given: No aggregation or independence policy is defined for the decision. → Expect: h.undefined fires to DEC-181, suppressing any execution that depends on the (non-existent) authorisation.

GAPS:
- P2 (other): The governing policy itself (n-of-m thresholds, sequencing, tie-breaks, independence definitions) is, by design, entirely external to the graph -- correctly deferred as mapping work, but the single largest implementation dependency for this workflow.
- P2 (idempotency): No explicit key preventing a duplicate a.authorize write if c.independent is re-evaluated twice on an already-satisfied threshold (low risk given the state is terminal once written).

---

## OWN-58 — Re-Approval Request

READINESS: READY_WITH_MAPPING

WHY:
The scoping discipline throughout is exemplary -- invalidates only affected approvals, holds only affected execution, requests re-approval only from affected authorities. Materiality itself is correctly policy-derived rather than invented, with an explicit stop when undefined.

RESPONSIBILITY:
Detects a material change to an already-approved-but-not-yet-executed subject, invalidates only the approvals whose decision basis the change actually touches, holds only the affected in-flight execution, and requests re-approval scoped to the affected authorities.

INSTANCE:
entity.scope = "the approved subject, its version history and the approvals bound to those versions" -- version-binding (shared with OWN-56/57) is what makes the materiality comparison answerable at all, as explicitly stated.

ENTRY:
Authoritative trigger approved_subject_changed_before_execution, explicitly excluding a cosmetic change and a change made after execution ("a new subject rather than a changed one") -- precise, well-bounded against post-execution changes.

OWNERSHIP:
N/A in the routing sense; this concerns approval validity, not work ownership.

ASSIGNMENT / QUEUE:
N/A.

DATA:
a.compare requires the approved version + current version; the compared dimensions (value, scope, quantity, discount, destination, risk profile, commercial terms, critical configuration, "something none of those cover") are named without over-specifying which are material (correctly deferred to c.material policy).

EVIDENCE:
N/A -- a version diff, not external evidence.

AUTHORITY / APPROVAL:
c.material asks whether the change is material to the specific approval's decision basis -- approvals not resting on the changed part are explicitly left untouched (a.identify: "invalidating everything on every material change teaches approvers that re-approval is routine, which is how it stops being read") -- a genuinely good anti-approval-fatigue design decision, cited with its own reasoning.

IDEMPOTENCY:
No explicit idempotencyKey; a.invalidate/a.hold/a.request are append-only log actions. Given each t.changed event presumably corresponds to a distinct version transition, duplicate-processing risk is lower than in workflows creating new case records.

SLA / TIME:
w.reapproval timeout is "the re-approval SLA" (policy value); onTimeout -> h.escalate -- "held execution is not free... so an unanswered re-approval escalates rather than waiting indefinitely."

ESCALATION:
h.escalate -> OWN-55, carrying "what is held and why" plus outstanding authorities -- clean, standard.

CANCELLATION / SUPERSESSION:
a.hold explicitly scopes to "only the affected part - holding everything because one term changed is the same error as invalidating every approval." c.unsafe correctly checks whether anything is actually in-flight before holding.

HANDOFFS:
- h.undefined → DEC-181: carries ["both versions and the difference between them","the existing approvals, held rather than either invalidated or trusted"]
- h.escalate → OWN-55: carries ["what is held and why","which authorities are outstanding"]
- h.rejected → OWN-59: carries ["the rejection reason and the version rejected","the previously approved version, which is still in the history and may be the thing to return to"]

COMPLETION:
x.still-valid ("existing approval remains valid" -- the ordinary "not material" outcome) and x.resumed ("current version approved; held execution may resume") are both clear; x.resumed's reEntry notes further changes compare against the newly approved version, avoiding drift back to the original baseline.

RESULT / FEEDBACK:
Structured outcomes only (still-valid / resumed / rejected-via-OWN-59) -- no prose parsing required downstream.

CORRECTION / REOPEN:
"The approval history is preserved. A superseded approval is recorded as superseded, not removed" (guardrail) -- directly implements the round's append-correction discipline.

OBSERVABILITY / AUDIT:
approval_log records comparison results, which approvals were invalidated and why, hold/release, and re-approval outcome -- strong.

CONSUMER COVERAGE:
Classification: event-driven. consumers lists only DEC-190 (prose-only, viaDistinctFrom, no real handoff). No workflow in this batch is shown sending a real handoff into OWN-58, but its trigger (a change to an already-approved subject before execution) is plausibly raised by whatever system detects the edit -- treated as event-driven.

TEST CASES:
- [approval] Given: A material change touches only some of the approvals already given. → Expect: a.identify scopes invalidation to those approvals whose decision basis actually changed, leaving unrelated approvals intact.
- [escalation] Given: Re-approval remains outstanding past the SLA with execution held. → Expect: h.escalate fires to OWN-55 carrying what is held and which authorities remain outstanding, never silently releasing the hold.
- [correction] Given: A re-approval is rejected. → Expect: h.rejected fires to OWN-59 carrying both the rejected version and the previously approved version still in history, in case reverting is the right path.

GAPS:
- P1 (idempotency): No explicit guard against two overlapping t.changed events for the same subject processing concurrently, which could produce two parallel invalidate/hold/request sequences against the same approval set.
- P2 (other): Materiality itself is, correctly, entirely policy-defined with an explicit stop (h.undefined) when missing -- pure mapping dependency, not a defect.

---

## OWN-59 — Approval Re-Entry

READINESS: READY_WITH_MAPPING

WHY:
The rejected-version permanent block (a.block) is explicit and well-reasoned, c.changed explicitly distinguishes a real revision from an unchanged resubmission, and the revision window timeout produces expiry rather than silent abandonment or silent auto-resubmit. Policy-gated terminality (c.revisable) is correctly not invented.

RESPONSIBILITY:
Governs whether and how a rejected approval can come back -- captures the rejection reason against the exact rejected version, permanently blocks that version from executing, and requires a revision that materially addresses the rejection (not a repeat resubmission) before allowing re-entry into approval.

INSTANCE:
entity.scope = "the rejected approval request and the exact subject version it rejected" -- version-scoped rejection is the identity; "a later version is a different subject and is judged on its own; this one stays rejected permanently."

ENTRY:
Authoritative trigger approval_rejected -- a recorded rejection against a specific request/version. Simple and precise; this is the receiving end of OWN-56's and OWN-58's h.rejected.

OWNERSHIP:
N/A in the routing sense -- no work-ownership question; this is about approval-state validity.

ASSIGNMENT / QUEUE:
N/A.

DATA:
Rejection reason (from upstream) plus the exact rejected version -- both required and both supplied by the sending workflow's carries; no invented fields.

EVIDENCE:
N/A.

AUTHORITY / APPROVAL:
c.revisable is explicitly policy-gated ("a structural ineligibility, a prohibition, a decision that is not revisable" -> x.terminal) -- no default revision path assumed where policy forbids one.

IDEMPOTENCY:
a.block explicitly exists to prevent the rejected version being re-executed later -- a direct, source-stated duplicate-execution guard, one of the clearer idempotency-adjacent controls in the batch even though it's not phrased as an idempotencyKey.

SLA / TIME:
w.revision timeout is "the revision window" (policy value); onTimeout -> x.expired, "a rejected request left open indefinitely is a commitment nobody is tracking" -- correctly bounded, not left open forever.

ESCALATION:
N/A -- no escalation node; unresolved revision windows expire rather than escalate, a deliberate design choice since a rejection isn't itself an SLA-bearing obligation requiring escalation, only a lapsing revision opportunity.

CANCELLATION / SUPERSESSION:
x.unchanged ("resubmission refused; nothing material changed" -- explicitly prevents "approval becoming a queue people learn to clear rather than read") is a strong anti-rubber-stamp control.

HANDOFFS:
- h.resubmit → OWN-56: carries ["the new version and its link to the rejected one","the original rejection reason, so the review is of the correction rather than of the subject from scratch"]

COMPLETION:
x.terminal ("rejected, no revision path" -- the only terminal: true exit) vs. x.expired/x.unchanged (both non-terminal, allowing future genuinely-new requests) -- correctly-scoped terminality: only a policy-defined structural rejection is permanently closed.

RESULT / FEEDBACK:
N/A -- no downstream consumer needs a result beyond the resubmission handoff itself; it's an intermediate gate.

CORRECTION / REOPEN:
Central to this workflow's purpose. x.expired and x.unchanged both explicitly permit "a genuinely new request... with this rejection in its history" -- reopening is always a new request/episode, never a silent revival of the terminally-blocked version.

OBSERVABILITY / AUDIT:
approval_log records the rejection reason, the block, and (if applicable) the new linked version -- sufficient to reconstruct the full rejection-to-resubmission chain.

CONSUMER COVERAGE:
Classification: active. Real handoff consumers OWN-56 (via its own h.rejected) and OWN-58 (via its own h.rejected) both feed into OWN-59 as the shared rejection-handling path for two different approval workflows -- a legitimate shared mechanism, not a duplicate. Also prose-referenced by DEC-186.

TEST CASES:
- [reopen] Given: The revision window expires unrevised. → Expect: x.expired closes this request, but a genuinely new request may be raised later carrying this rejection in its history.
- [duplicate-creation] Given: Someone attempts to execute the rejected version after rejection. → Expect: a.block has already marked it not executable, preventing exactly this failure mode.
- [handoff] Given: A revision materially addresses the rejection. → Expect: h.resubmit fires to OWN-56 carrying the new version, its link to the rejected one, and the original rejection reason.

GAPS:
- none recorded

---

## OWN-60 — Approval Owner Update

READINESS: READY_WITH_MAPPING

WHY:
Cleanly distinguishes ownership-of-work (OWN-54) from authority-to-decide (this workflow) per its own distinctFrom note. Explicit default that completed decisions "remain valid" unless policy specifically says the authority change invalidates them, and an explicit "no valid authority currently exists" state that blocks rather than silently proceeding.

RESPONSIBILITY:
When decision authority itself changes (an approver leaving, a role change, a revoked delegation, an altered approval limit), re-evaluates pending decisions for reassignment and completed decisions for retention/invalidation strictly per policy -- never blindly transferring or discarding either.

INSTANCE:
entity.scope = "the decision process plus the authority holders whose scope changed" -- pending and completed decisions are explicitly inventoried and treated separately, the correct instance model for a change that fans out over however many decisions the changed authority touches.

ENTRY:
Authoritative trigger decision_authority_changed, explicitly excluding "an approver being temporarily unavailable" (a routing question, not an authority change) and "a change to who does the work" (OWN-54's) -- precise, well-differentiated boundary.

OWNERSHIP:
N/A in the work-ownership sense (explicitly the point of the distinctFrom note) -- this concerns who may decide, addressed under authorityApproval.

ASSIGNMENT / QUEUE:
c.valid-exists checks whether a valid alternative authority exists before a.reassign; if none, h.no-authority -> DEC-181 rather than leaving the decision silently pending or auto-approving.

DATA:
a.inventory requires pending decisions, completed decisions, running deadlines, and "the exact scope of authority that changed" -- explicitly notes the scope determines the affected set ("a lowered approval limit affects a different set from a departure"), a genuinely nuanced data requirement.

EVIDENCE:
N/A.

AUTHORITY / APPROVAL:
This is the whole workflow. Two clean guardrails: (1) "An approver's departure does not automatically invalidate every historical approval they gave" -- completed decisions default to remaining valid; (2) "A new authority does not inherit the ability to alter completed decisions outside what policy grants them." c.completed's three branches (remain-valid / revalidation-required / policy-unclear->h.policy) never default to either blanket outcome without a stated rule.

IDEMPOTENCY:
No explicit ActionNode idempotencyKey; a.reassign/a.revalidate write append-only to authority_change_log. A duplicate/re-delivered t.authority event for the same change is not explicitly deduped, similar to OWN-54's gap -- moderate, given these are lower-frequency organizational events.

SLA / TIME:
N/A -- no wait/timeout declared in this workflow (waits: []); every path resolves synchronously to reassignment, retention, revalidation, or an escalation handoff. Honestly reported as absent rather than assumed.

ESCALATION:
h.no-authority and h.policy both -> DEC-181 (policy-exception routing, not OWN-55) -- reasonable, since these are "no rule covers this" cases requiring a policy ruling. h.reapprove -> OWN-56 routes decisions invalidated by an authority change back into ordinary re-approval, correctly preserving "the original request history and its SLA, neither of which the authority change resets."

CANCELLATION / SUPERSESSION:
a.invalidate suppresses queued decisions "the former authority is no longer entitled to do" -- but a.reassign preserves "the original request, the exact version under review and the deadline," so the underlying request survives the authority change intact.

HANDOFFS:
- h.no-authority → DEC-181: carries ["the pending decisions and their unchanged deadlines","the explicit fact that execution requiring this approval remains blocked, rather than proceeding because nobody can say no"]
- h.reapprove → OWN-56: carries ["the unchanged subject version, which is what makes this a re-approval rather than a revision","the original request history and its SLA, neither of which the authority change resets"]
- h.policy → DEC-181: carries ["the completed decisions in question and who made them","the fact that they have been neither retained nor invalidated pending a ruling"]

COMPLETION:
x.retained ("completed decisions retained; pending ones reassigned where needed" -- the single named exit) explicitly states "an approver leaving does not retroactively unapprove what they approved while they held the authority to approve it" -- a clean, correctly-scoped completion statement.

RESULT / FEEDBACK:
N/A -- no external consumer needs a result beyond the reapprove/no-authority/policy handoffs themselves; internal bookkeeping workflow.

CORRECTION / REOPEN:
h.policy explicitly holds completed decisions "neither retained nor invalidated pending a ruling" rather than guessing -- a genuine indeterminate-outcome path, not forced into either bucket.

OBSERVABILITY / AUDIT:
authority_change_log records the inventory, invalidation, reassignment, and revalidation decisions with rationale in each action's own does text -- solid.

CONSUMER COVERAGE:
Classification: active. Real handoff consumer OWN-56 (via this workflow's own h.reapprove) and prose-referenced by OWN-54. Also a real handoff SENDER TO OWN-60 shown from REL-94 (customer surface, via REL-94's own h.authority node) -- confirming OWN-60 is a genuine re-entry point triggered by customer-relationship-driven authority/capability changes, not just internal org changes.

TEST CASES:
- [approval] Given: Authority changes and completed decisions exist under the old authority. → Expect: c.completed defaults to x.retained unless policy specifically requires revalidation for this kind of change.
- [escalation] Given: A pending decision is stranded and no valid alternative authority exists. → Expect: h.no-authority fires to DEC-181, and execution requiring this approval stays blocked rather than proceeding.
- [handoff] Given: Decisions are invalidated by the authority change rather than a subject revision. → Expect: h.reapprove fires to OWN-56 carrying the unchanged subject version and the original request history/SLA.

GAPS:
- P1 (idempotency): No explicit guard against a duplicate/re-delivered decision_authority_changed event re-running the full inventory/invalidate/reassign/revalidate sequence a second time.
- P2 (sla-escalation): No timeout/wait is declared at all -- honestly appropriate given every branch resolves synchronously, but worth confirming with a company that no case exists where a reassigned pending decision needs its own acceptance wait (that loop appears handled entirely by re-entering OWN-52/OWN-56 downstream).

---

## REL-95 — Parent State Propagation

READINESS: READY_WITH_MAPPING

WHY:
The core discipline (classify each child individually, never one verdict for a whole collection) is stated as both the purpose and a guardrail and directly implemented in a.classify's own text. Propagation with no defined model correctly refuses to run (h.undefined) rather than assuming inheritance. The main real risk is a missing idempotency guard for a mechanism whose consequences can be destructive-adjacent.

RESPONSIBILITY:
When a parent entity's state materially changes, classifies each child individually against an explicit dependency model and propagates the consequence only to genuinely dependent children -- never a blanket "parent state applies to all children" rule.

INSTANCE:
entity.scope = "the parent whose state changed, and each child evaluated individually against the dependency model" -- instance is (parent-state-change-event, child) pairs, each independently classified; no shared verdict for the collection.

ENTRY:
Authoritative trigger parent_state_materially_changed -- named concrete examples (organisation suspended, master account closed, contract state changed, parent resource disabled). Precise.

OWNERSHIP:
N/A -- this is an automated cascading-state mechanism, not a human work item; no queue, no claim, no approver (see boundaryCandidate).

ASSIGNMENT / QUEUE:
N/A -- automated propagation, no human queue.

DATA:
Requires the dependency model itself (which child states follow which parent states) -- explicitly required as a precondition (c.model), not inferred.

EVIDENCE:
N/A.

AUTHORITY / APPROVAL:
N/A -- no human decision point; propagation is a deterministic policy application, not a judgment call.

IDEMPOTENCY:
a.propagate records "what propagated, to which children, and under which rule" -- but no explicit idempotencyKey is declared, and no guard against the same parent-state-change event being re-delivered and re-propagating (potentially re-applying the same consequence twice) is shown. Meaningful given propagation can include destructive-adjacent actions (suspension, disablement).

SLA / TIME:
N/A -- no wait/timeout in this workflow (waits: []); propagation is synchronous. Honestly absent, not invented.

ESCALATION:
N/A -- no escalation node; the only "hold" path is h.reconcile for children with open obligations, which is a routing decision, not an SLA escalation.

CANCELLATION / SUPERSESSION:
N/A -- not addressed; what happens if the parent's state reverts while propagation to children is still resolving isn't covered by this workflow.

HANDOFFS:
- h.undefined → DEC-181: carries ["the parent change and the children that would be affected under a naive inheritance","the explicit fact that nothing was propagated, because inheritance was not assumed"]
- h.reconcile → external:commitment-reconciliation: carries ["the obligation and the propagation being held for it","the explicit fact that nothing destructive has been applied to that child yet"]

COMPLETION:
x.preserved (child stands independently, parent change doesn't reach it) and x.propagated (consequence applied, scoped and recorded) are both clear and structurally sound.

RESULT / FEEDBACK:
N/A -- no downstream corpus consumer is shown; propagation_log is the only record.

CORRECTION / REOPEN:
x.preserved's reEntry explicitly notes "a parent change that the model does make this child follow is evaluated when it happens" -- re-evaluation per-event, not a static one-time judgment.

OBSERVABILITY / AUDIT:
propagation_log records classification and the specific rule that produced each propagation ("propagation that cannot say which rule produced it cannot be reviewed, reversed or explained" -- stated directly in a.propagate's own text). Strong.

CONSUMER COVERAGE:
Classification: event-driven. consumers: [] -- no workflow in this batch shows a handoff or prose reference into REL-95, but the trigger (organisation suspended, master account closed, contract state changed, parent resource disabled) is a plausible authoritative system event most likely emitted by the corpus's terminal/structure workflows, even though none is confirmed in this dump -- treated as event-driven rather than orphan-candidate, though worth a second look given REL-95's sibling REL-96 is at least referenced by REL-95 itself while nothing references REL-95.

BOUNDARY CANDIDATE:
Suspected correct surface: runtime-mechanism (confidence: medium). The entire workflow is a deterministic, policy-driven state-cascade with no human owner, no queue, no approval, and no SLA -- every ownership/assignment/evidence/approval dimension is N/A by nature, and the guardrails read like a mechanism's dedupe/scope-limiting rules rather than operational work. It classifies and applies rather than routing work to a person. Impact if changed: If reclassified, its readiness dimensions would correctly collapse to N/A across the board rather than reading as gaps in an operational workflow, and it would be evaluated against the Runtime Mechanism round's freshness/idempotency bar instead.

TEST CASES:
- [cancellation] Given: A dependent child holds an open obligation that the propagated consequence would destroy. → Expect: h.reconcile holds the propagation for that child, applying nothing destructive yet.
- [duplicate-creation] Given: The same parent-state-change event is delivered twice. → Expect: No explicit guard is declared -- worth confirming a company's implementation does not re-apply the same consequence to already-propagated children.

GAPS:
- P1 (idempotency): No explicit guard against the same parent_state_materially_changed event being processed twice and re-applying (or re-attempting) the same consequence to already-propagated children -- meaningful given propagation can include destructive-adjacent actions like disabling/suspending.
- P2 (handoff-provenance): h.reconcile targets external:commitment-reconciliation, a sink outside the 284-journey corpus -- legitimate design, but a company must independently define that external contract.

---

## REL-96 — Parent State Aggregation

READINESS: READY_WITH_MAPPING

WHY:
The recompute-from-source (not increment-from-event) design is explicitly the mechanism that prevents drift, aggregation semantics are required to be policy-defined with an explicit refusal (h.undefined) otherwise, and the "one child's state does not automatically become the parent's" guardrail is directly enforced by c.criteria. A tight, minimal (8-node) workflow with essentially no ambiguity.

RESPONSIBILITY:
Recomputes a parent entity's derived state from its authoritative children using an explicit aggregation policy (ANY/ALL/majority/threshold) on every relevant child-state change, rather than incrementally nudging the parent from the single event that arrived.

INSTANCE:
entity.scope = "the parent and the full collection of children the policy reads" -- recomputed as a whole each time, so there's no per-event partial-state instance to track; the aggregate is stateless-recomputable by design.

ENTRY:
Authoritative trigger child_state_changed, explicitly scoped to "a child state that the parent's aggregation policy reads" and explicitly insufficient alone if "no policy makes the parent depend on it" -- precise, self-limiting.

OWNERSHIP:
N/A -- deterministic derivation, no human owner (same boundary observation as REL-95).

ASSIGNMENT / QUEUE:
N/A.

DATA:
Requires the full authoritative children collection plus the aggregation policy; no invented fields.

EVIDENCE:
N/A.

AUTHORITY / APPROVAL:
N/A -- no human decision.

IDEMPOTENCY:
a.recompute is naturally idempotent by construction -- "recomputed from source... can be rebuilt at any moment" means re-running it on a duplicate/re-delivered child-change event produces the same result rather than double-applying an increment. A genuinely strong, source-stated idempotency property worth citing positively.

SLA / TIME:
N/A -- no wait/timeout (waits: []); synchronous recomputation.

ESCALATION:
N/A -- no escalation path; nothing here can be "stuck" since every run recomputes fully.

CANCELLATION / SUPERSESSION:
N/A -- not applicable to a stateless recompute.

HANDOFFS:
- h.undefined → DEC-181: carries ["the parent, the children and the change that arrived","the explicit fact that no ANY, ALL, majority or threshold rule was assumed in order to produce a parent state"]

COMPLETION:
x.updated (aggregate moved, parent state updated, recording which children + which policy) and x.retained ("the ordinary outcome") are both clear; x.retained's own text explicitly frames it as the common case, avoiding treating "recomputed" as inherently newsworthy.

RESULT / FEEDBACK:
N/A -- no corpus consumer is shown; the parent's derived state itself is presumably read directly by whatever displays/uses it.

CORRECTION / REOPEN:
x.updated's reEntry ("the next relevant child change recomputes it again from source") -- no reopen concept needed given full recompute semantics.

OBSERVABILITY / AUDIT:
aggregation_log records which children and which policy produced each transition -- sufficient minimum.

CONSUMER COVERAGE:
Classification: active. Real consumer REL-95 (prose-only distinctFrom, explicitly cross-referencing the "opposite direction" relationship -- "REL-96 derives upward... neither is the inverse of the other"). No real handoff either direction.

BOUNDARY CANDIDATE:
Suspected correct surface: runtime-mechanism (confidence: medium). Same shape as REL-95: a deterministic, policy-driven recomputation with zero human touchpoints, explicit idempotency-by-recompute-from-source, and no ownership/SLA/escalation dimension that isn't N/A by nature -- this reads as infrastructure for keeping derived state consistent, not an operational workflow a team executes. Impact if changed: Its readiness profile is dominated by N/A entries not because of missing contract work but because the work itself has no human-facing shape; worth confirming this and REL-95 are intentionally modeled as 'operational' rather than 'runtime mechanism' surfaces.

TEST CASES:
- [duplicate-creation] Given: The same child-state-changed event is delivered twice. → Expect: a.recompute derives the aggregate from source both times, producing the same result rather than double-applying an increment -- idempotent by construction.
- [handoff] Given: No aggregation policy is defined for the parent state. → Expect: h.undefined fires to DEC-181, and no ANY/ALL/majority/threshold rule is assumed to produce a parent state.

GAPS:
- P2 (other): This workflow is, by its own nature, entirely deterministic infrastructure -- every dimension a human-ownership-focused round normally checks for (queue, approver, SLA, escalation) is genuinely N/A rather than missing; flagged under boundaryCandidate rather than as a contract gap.

---

## REL-97 — Duplicate Entity Assessment

READINESS: READY_WITH_MAPPING

WHY:
The assess-vs-authorize separation is the workflow's entire purpose and is repeated at both the guardrail and handoff level ("this journey has assessed and not authorised"). Evidence strength is explicitly graded, and the default on ambiguous evidence is keep-separate (reversible) rather than merge (usually irreversible) -- a well-reasoned default direction.

RESPONSIBILITY:
Assesses whether a candidate set of records represents one entity, routing the outcome to keep-separate / link (REL-98) / merge (TRM-101) / manual review (DEC-181) -- explicitly without itself authorizing any consolidation.

INSTANCE:
entity.scope = "the candidate set of records suspected of representing one entity" -- explicitly a set, not a pair, because "a pairwise answer can be internally inconsistent" (three records suspected of being one person assessed together) -- a genuinely sophisticated instance model most duplicate-detection designs miss.

ENTRY:
Inferred-source trigger potential_duplicate_detected -- the only inferred-source trigger in this batch. The insufficientAlone list is explicit and appropriately skeptical (same name, same postcode, similar spelling). Honestly reported as inferred rather than treated as authoritative.

OWNERSHIP:
N/A -- this is an assessment/routing step, not a work-ownership question; no queue, no claim.

ASSIGNMENT / QUEUE:
N/A.

DATA:
a.evidence names required inputs precisely (verified identifiers, authoritative external IDs, declared ownership, verified contact points, business identifiers, relationship history) -- good provenance discipline, explicitly noting shared contact points are NOT proof by themselves.

EVIDENCE:
The strongest evidence-handling in the batch. Distinguishes authoritative (verified identifiers/external IDs) from supporting/behavioral (shared contact points, similar spelling) explicitly, and c.assessment's four branches map cleanly onto evidence strength. Behavioral inference does NOT silently become authoritative -- ambiguous evidence routes to review instead.

AUTHORITY / APPROVAL:
N/A within this workflow -- the actual merge authorization (with its own evidence bar) is explicitly deferred to whatever consumes h.merge (TRM-101); this workflow only assesses and routes.

IDEMPOTENCY:
No explicit idempotencyKey; a.evidence's writes are append-only to duplicate_assessment_log. Given the candidate set can be re-evaluated over time (x.separate's reEntry: "stronger evidence later re-opens the assessment"), repeated assessments across time are explicitly expected and not a duplicate-processing problem.

SLA / TIME:
N/A -- no wait/timeout (waits: []); assessment resolves synchronously to one of four immediate outcomes.

ESCALATION:
N/A -- no escalation node; h.review -> DEC-181 is a routing decision for ambiguous cases, not an SLA-driven escalation.

CANCELLATION / SUPERSESSION:
N/A -- not directly applicable; x.separate's reEntry allows the assessment to be reopened with stronger evidence later, closer to a re-assessment than a cancellation.

HANDOFFS:
- h.link → REL-98: carries ["both records and the evidence of the relationship between them","the explicit finding that they are not the same entity, so the link does not drift toward being treated as one"]
- h.merge → TRM-101: carries ["the full evidence set and the confidence it establishes","the explicit fact that this journey has assessed and not authorised - detecting a duplicate is not permission to merge it, and the merge mechanism applies its own evidence requirements before consolidating anything"]
- h.review → DEC-181: carries ["the candidate set, the evidence and what specifically is ambiguous about it","what each record currently holds, which is what makes a wrong merge expensive"]

COMPLETION:
x.separate (KEEP_SEPARATE) is the only local terminal exit; the other three outcomes (link/merge/review) are all handoffs -- "complete" for those is defined downstream, appropriate given this workflow's explicit non-authorizing purpose.

RESULT / FEEDBACK:
The four-way outcome (separate/link/merge-candidate/ambiguous) is structured and unambiguous for each downstream receiver.

CORRECTION / REOPEN:
x.separate's reEntry explicitly supports reopening with new evidence -- "keeping two records apart is reversible; merging them usually is not, which is why this is the default when the evidence does not carry" -- a clearly stated, well-reasoned default-to-reversible policy.

OBSERVABILITY / AUDIT:
duplicate_assessment_log records evidence strength and the assessment outcome -- sufficient for reconstructing why a set was judged separate/linked/merge-candidate/ambiguous.

CONSUMER COVERAGE:
Classification: unconsumed-but-valid. consumers: [] -- no workflow in this batch shows a handoff into REL-97, though its trigger (potential_duplicate_detected, explicitly inferred-source) is plausibly raised by a matching/detection mechanism outside this batch's visibility. REL-98's own consumer entry confirms REL-97 as a real sender (REL-98 lists REL-97 as a consumer via REL-97's own h.link node), so this reads as unconsumed-but-valid rather than orphan -- the design stands ready for whatever detection mechanism raises the trigger.

TEST CASES:
- [missing-evidence] Given: The evidence is suggestive but incomplete, or the records carry state that would be risky to consolidate wrongly. → Expect: c.assessment routes to h.review -> DEC-181 rather than defaulting to either merge or separate.
- [reopen] Given: A set was previously judged KEEP_SEPARATE and stronger evidence later emerges. → Expect: x.separate's reEntry explicitly permits reopening the assessment against the new evidence.
- [handoff] Given: The evidence supports consolidation and looks safe. → Expect: h.merge fires to TRM-101, explicitly not itself authorizing anything -- TRM-101 applies its own evidence bar before consolidating.

GAPS:
- none recorded

---

## REL-98 — Entity Linking

READINESS: READY_WITH_MAPPING

WHY:
"Linked is not merged" is enforced at three separate points (semantics definition, share scoping, and an active a.block step catching downstream propagation attempts) rather than stated once and assumed. Default is "nothing shared" when semantics don't name anything -- a safe, opt-in default direction.

RESPONSIBILITY:
Records that two entities are related and lets only explicitly-permitted context cross between them, actively blocking anything that attempts to propagate consent/entitlement/credentials/access across the link as though it were a merge.

INSTANCE:
entity.scope = "the link itself, plus the two entities it connects" -- the link is explicitly "a third record about them, not a step toward becoming one," a clean, explicit instance identity separate from either entity.

ENTRY:
Authoritative trigger cross_entity_link_established, explicitly distinguishing a link from a duplicate match ("a question about whether they are one entity rather than evidence that they are two related ones") -- precise, correctly bounded against REL-97's territory.

OWNERSHIP:
N/A -- no work-ownership question; each entity independently "keeps its own lifecycle state and history" (guardrail), explicitly not touched by the link.

ASSIGNMENT / QUEUE:
N/A.

DATA:
a.semantics requires the link's meaning to be explicitly defined (household, related accounts, linked profiles, business relationship, cross-product connection) before any sharing decision -- data-minimization by construction (undefined semantics = nothing shared).

EVIDENCE:
N/A -- no review/decision; consumed entirely as "relationship type," not evaluated evidence.

AUTHORITY / APPROVAL:
N/A -- no approval; this is a structural/data-model action, not a decision.

IDEMPOTENCY:
No explicit idempotencyKey; the actions (a.semantics, a.share, a.independence, a.block) are largely read/write of link metadata rather than instance-creating actions in the create-if-absent sense -- lower risk given the link record presumably already exists by the time t.link fires.

SLA / TIME:
N/A -- no wait/timeout (waits: []); fully synchronous.

ESCALATION:
N/A -- no escalation node.

CANCELLATION / SUPERSESSION:
The exit's reEntry explicitly notes "the link's semantics may be changed, and the link may be ended, but neither turns it into a merge" -- link lifecycle changes are acknowledged but not detailed as a separate workflow step here, correctly since consolidating is "a separate decision with separate evidence."

HANDOFFS:
N/A — no outbound handoffs

COMPLETION:
x.linked ("linked; two entities, two lifecycles, defined shared context") is the single, clear completion state.

RESULT / FEEDBACK:
N/A -- no downstream corpus consumer needs a result from this workflow; it establishes durable link state that other processes presumably read directly.

CORRECTION / REOPEN:
N/A -- no reopen concept; a link is a durable relationship record, not a case that closes and reopens (its "correction" is a semantics change or ending the link, acknowledged in the exit's reEntry text).

OBSERVABILITY / AUDIT:
link_log records semantics definition, what was shared, and any blocked propagation attempt -- a.block specifically creates an auditable record of an attempted violation, valuable beyond the ordinary happy path.

CONSUMER COVERAGE:
Classification: active. Real handoff consumer REL-97 (via REL-97's own h.link node, "both records and the evidence of the relationship... not the same entity"), matching this workflow's own entry precisely. Also prose-referenced by REL-91 (customer surface) and REL-99 (distinctFrom).

TEST CASES:
- [cancellation] Given: A downstream process attempts to carry consent, entitlement, credentials or access across the link. → Expect: a.block stops the propagation and records the attempt, rather than letting the link silently behave as a merge.

GAPS:
- P2 (other): a.share and a.independence both have empty writes in the dump (only a.semantics and a.block write to link_log) -- the actual set of context shared per this specific link isn't itself logged as a discrete append, only inferable from the semantics definition.

---

## REL-99 — Entity Split

READINESS: NEEDS_CONTRACT_WORK

WHY:
The non-transferable-item discipline is a standout feature -- explicitly named as "the category that gets missed" with its own dedicated action, and ambiguous state is explicitly held for review rather than defaulted. But for an operation the workflow's own guardrails describe as high-stakes and effectively irreversible, there is no correction path if an item is later found misclassified, and no idempotency guard against a re-delivered split event -- both compound into a real production risk rather than pure mapping.

RESPONSIBILITY:
Separates state currently held under one entity into multiple resulting entities on an authoritative split requirement -- classifying every piece of prior state as entity-specific / shared / non-transferable / ambiguous, never blindly duplicating consent, entitlements, credentials or financial obligations, and preserving (not rewriting) pre-split history.

INSTANCE:
entity.scope = "the source entity and the entities that result from the split" -- "the source entity's history remains the source entity's history. The resulting records inherit allocations, not a rewritten past" -- a precise instance-identity statement distinguishing the split event from the entities it produces.

ENTRY:
Authoritative trigger entity_split_required -- "an authoritative requirement to separate state currently held under one entity." Simple and precise, though notably terse compared to other triggers in this batch: no insufficientAlone list, and the authority behind the requirement isn't named (see gap).

OWNERSHIP:
N/A in the human-ownership sense -- this is a data-restructuring mechanism; a.non-transferable addresses "who keeps what" for non-transferable rights, closer to entitlement/obligation allocation than work ownership.

ASSIGNMENT / QUEUE:
N/A.

DATA:
a.basis requires "the split basis" (what distinguishes the resulting entities) as an explicit precondition before classification can proceed -- correctly sequenced, preventing "a series of individual guesses."

EVIDENCE:
N/A.

AUTHORITY / APPROVAL:
N/A -- no human decision point beyond the unaddressed authority behind the initial split requirement itself (see entry gap).

IDEMPOTENCY:
No explicit idempotencyKey; a.allocate/a.reference/a.non-transferable are append-only split_log writes per classified item. No guard against a duplicate/re-delivered t.split event re-running the entire split -- a real gap given the workflow's own explicit warning that "two copies of one shared history diverge the first time either is edited," i.e., it is itself sensitive to exactly the kind of divergence a duplicate run would cause.

SLA / TIME:
N/A -- no wait/timeout (waits: []); fully synchronous classification-and-allocation.

ESCALATION:
N/A -- no escalation node; h.review -> DEC-181 handles ambiguous items via routing, not SLA-driven escalation.

CANCELLATION / SUPERSESSION:
N/A -- not addressed; what happens if the split is later found to be wrong (items misclassified) isn't covered. The audit-trail guardrail implies a wrong split would need correcting via a new event rather than an in-place edit, but this isn't modeled explicitly.

HANDOFFS:
- h.review → DEC-181: carries ["the item, the split basis, and why attribution failed","the fact that it is held unresolved rather than assigned to whichever record was created first"]

COMPLETION:
x.split ("entities separated; current state reconstructed, prior history preserved as it happened") is the single completion state; a.audit (immediately preceding it) is explicit that recording the basis and rationale is a discrete, required step.

RESULT / FEEDBACK:
N/A -- no downstream corpus consumer is shown (consumers: []); resulting entities presumably re-enter the corpus's ordinary lifecycle independently.

CORRECTION / REOPEN:
x.split's reEntry ("a further split is assessed against whichever [entity] requires it") covers a subsequent split, but not a correction of this split if items were misclassified -- the same gap viewed from the reopen angle.

OBSERVABILITY / AUDIT:
split_log records the basis, per-item classification and allocation, and the final audit entry -- strong per-item traceability given the classify-then-allocate design.

CONSUMER COVERAGE:
Classification: orphan-candidate. consumers: [] -- no workflow in the corpus hands off into REL-99 or references it in prose, and unlike REL-95 (whose trigger is plausibly emitted by well-known account/contract lifecycle events), entity_split_required's authoritative source is not named or evidenced anywhere in this batch's data, making it harder to independently confirm this is genuinely event-driven versus simply unreferenced -- worth flagging directly, though the workflow's own design is sound.

TEST CASES:
- [correction] Given: An item is discovered post-split to have been misclassified (e.g., wrongly duplicated as if transferable). → Expect: No explicit correction path exists in this workflow -- a company must define one, since history is preserved rather than rewritten and the split is not modeled as reversible.
- [duplicate-creation] Given: The entity_split_required event is re-delivered for an already-split entity. → Expect: No explicit guard is declared -- worth confirming a company's implementation does not re-run classify/allocate against a source entity that no longer holds the original combined state.
- [completion] Given: Every classified item resolves to allocate/reference/non-transferable with none left ambiguous. → Expect: a.audit records the split occurred, when, and on what basis, and x.split is reached with history preserved, not rewritten.

GAPS:
- P1 (correction-reopen): No explicit path exists for correcting a completed split if an item was misclassified. Given the workflow's own guardrails treat entity splits as effectively irreversible in the ordinary case (history preserved, not rewritten), a company implementing this needs an explicit correction mechanism this workflow doesn't provide or point to.
- P1 (idempotency): No explicit guard against a duplicate/re-delivered entity_split_required event re-running the classify/allocate sequence against a source entity that has already been split -- given the workflow's own stated sensitivity to divergence from duplication, this is a meaningful gap.
- P2 (other): The trigger's evidence has no insufficientAlone list (unlike most other workflows in this batch), and the authority behind 'an authoritative requirement to separate state' isn't named -- a minor precision gap relative to its neighbors.

---

## REM-153 — Return Transit Resolution

READINESS: READY_WITH_MAPPING

WHY:
Correctly refuses to issue a return-dependent outcome from a tracking number alone, and both waits distinguish 'genuinely not returned' (expired, customer keeps the item) from 'don't know yet' (unknown, suppress and escalate) rather than collapsing them. Only carrier/logistics-role mapping remains.

RESPONSIBILITY:
Tracks whether an authorized return actually makes it back to the business, holding IN_RETURN_TRANSIT and RETURN_UNKNOWN as real, distinct states rather than assuming a carrier's acceptance is the same as receipt.

INSTANCE:
No instanceKey; identity is the return authorization plus the resource traveling under it (a tracking reference is captured where one exists, but is explicitly not treated as sufficient on its own).

ENTRY:
return_authorization_active, authoritative, requiring an active authorization with scope and validity — precise, matches what REM-152's h.transit (a customer-surface handoff) supplies.

OWNERSHIP:
No actor named for define/transit/unknown/exception/expired; the workflow is largely a passive tracker of carrier/return-channel events rather than a task a person actively works, so automated tracking is plausible but not stated.

ASSIGNMENT / QUEUE:
N/A for the tracking states; external:external-status-reconciliation receives unresolved cases.

DATA:
Return method, destination, scope/quantity, authorization validity, tracking reference (where it exists) — complete.

EVIDENCE:
Carrier/channel reports are the evidence; explicitly distinguished from actual physical receipt ('a carrier accepting the parcel is not the resource having returned to us').

AUTHORITY / APPROVAL:
N/A — no approval decision occurs in this tracking workflow.

IDEMPOTENCY:
N/A for the tracking-state writes themselves; the downstream risk (a return-dependent remedy issued twice) is explicitly guarded against by suppression at a.unknown, which is the right control point.

SLA / TIME:
w.return times out at the authorization's own validity → a.expired; w.receipt times out at 'the expected transit window plus its tolerance' → a.unknown — both honestly sourced from policy, not invented.

ESCALATION:
a.unknown suppresses any return-dependent outcome and routes to external:external-status-reconciliation — correctly treats an unlocatable return as neither arrived nor lost, avoiding both a wrongly-issued remedy and a wrongly-refused customer.

CANCELLATION / SUPERSESSION:
x.expired correctly separates 'nothing came back, authorization lapsed' from any judgment about the underlying obligation, explicitly deferring 'whether another remedy remains available' as a separate question.

HANDOFFS:
- h.reconcile → external:external-status-reconciliation: carries ["the authorisation, the tracking reference and everything the carrier last reported","the explicit instruction that no return-dependent remedy is issued until this is settled"]
- h.inspect → REM-154: carries ["what was authorised and what physically arrived","the explicit fact that received is not accepted - the conditions have not been checked"]

COMPLETION:
There is no local exit for successful receipt — arrival routes directly to REM-154 rather than being marked complete here, correctly reflecting that receipt alone doesn't resolve anything yet (inspection does).

RESULT / FEEDBACK:
The two outcome paths (inspect vs. reconcile) are clearly distinct and each carries what the receiver needs without requiring prose parsing.

CORRECTION / REOPEN:
x.expired reEntry correctly treats a fresh return request as assessed on its own eligibility, and notes the original obligation (if unresolved) remains so rather than being silently closed by the expiry.

OBSERVABILITY / AUDIT:
return_log distinguishes AUTHORIZED / IN_RETURN_TRANSIT / RETURN_UNKNOWN / LOST-or-EXCEPTION / EXPIRED_UNUSED as separate named states with the risk-bearing party recorded for exceptions — good detail.

CONSUMER COVERAGE:
Classification: active. REM-152 (customer surface) sends a real h.transit handoff carrying the authorized scope/method/validity; TIM-268 references it only via distinctFrom prose.

TEST CASES:
- [missing-evidence] Given: a return has neither arrived nor been reported lost within the expected transit window plus tolerance → Expect: recorded RETURN_UNKNOWN with any return-dependent remedy suppressed, rather than treated as lost or as received
- [handoff] Given: a returned resource arrives → Expect: REM-154 receives exactly what was authorized and what physically arrived, with the explicit 'received is not accepted' fact
- [cancellation] Given: the return authorization lapses with nothing returned → Expect: the customer keeps the item and the underlying obligation, if unresolved, remains open as its own separate question

GAPS:
- P2 (ownership): No actor named for the tracking/exception-handling steps; likely automated, but not stated.

---

## REM-154 — Return Inspection

READINESS: NEEDS_CONTRACT_WORK

WHY:
The receipt-vs-acceptance separation and the undefined-criteria escalation are both correctly designed, but this workflow requires a human to physically inspect a returned item and there is no queue, assignment, claim, or concurrency semantics defined anywhere for that task — a materially larger gap here than in the mostly-automated document/financial workflows, because a physical inspection cannot happen without someone being notified and claiming it.

RESPONSIBILITY:
Physically judges a returned item against its authorized conditions (identity, quantity, condition, completeness, scope), recording receipt as a fact independent of the inspection's accept/reject/partial outcome.

INSTANCE:
No instanceKey; identity is the returned resource as received plus the return case it arrived under. Entity note correctly separates physical receipt (a fact) from inspection outcome (a judgment).

ENTRY:
returned_resource_received, authoritative, requiring a resource received against an authorization — precise, matches REM-153's h.inspect exactly.

OWNERSHIP:
No queue, role, or team is named for who performs a.inspect; unlike REM-159 (which at least names FIN-137/ACC-71/OWN-55 as destinations) or DOC's DEC-181 pattern, there is no equivalent decision-authority or inspector role named here at all.

ASSIGNMENT / QUEUE:
N/A is not honest here — this is exactly the kind of manual physical task that should route to a queue/role, and none is modeled. This is a genuine gap, not an inapplicable dimension.

DATA:
Identity, quantity, condition, completeness, included components, authorized scope, and integrity where relevant — complete as an inspection checklist.

EVIDENCE:
Physical inspection is the evidence, correctly distinguished by kind from a customer's own claim about the return's condition — good, though who performs and records that inspection is unaddressed.

AUTHORITY / APPROVAL:
N/A as an approval per se — inspection is a judgment against policy criteria, not an approval decision; when criteria are undefined, correctly routed to DEC-181 rather than judged ad hoc.

IDEMPOTENCY:
No dedupe is modeled against the same physical item being scanned/recorded as received twice (e.g. a duplicate warehouse event); low-severity but unaddressed.

SLA / TIME:
N/A — no waits are declared; a real deployment would need an SLA for how long inspection can sit unclaimed, which is undeclared here.

ESCALATION:
c.criteria 'not defined' → h.undefined(DEC-181) is a good, explicit escalation avoiding an invented acceptance standard — consistent with the DOC domain's DEC-181 pattern.

CANCELLATION / SUPERSESSION:
N/A — nothing here is cancelled; inspection either proceeds or is escalated for undefined criteria.

HANDOFFS:
- h.undefined → DEC-181: carries ["what arrived and what was authorised","the explicit fact that no acceptance standard was invented in order to judge it"]
- h.remedy → REM-157: carries ["the accepted and rejected scope, separately","what we are physically holding and what has to happen to it, which the remedy decision now covers"]

COMPLETION:
RETURN_ACCEPTED / PARTIALLY_ACCEPTED / RETURN_REJECTED_AFTER_RECEIPT are all clean, named states; critically, the rejected case explicitly retains the receipt record ('we still physically hold the thing'), avoiding the failure mode where a rejected return disappears from tracking.

RESULT / FEEDBACK:
All three outcomes route through the same h.remedy handoff with the accepted/rejected scope explicit, so REM-157 never has to infer disposition from prose.

CORRECTION / REOPEN:
N/A — this workflow doesn't itself define reopening; a wrongly-judged inspection would need to be corrected through whatever process manages REM-157's downstream remedy decision, which is out of this workflow's scope.

OBSERVABILITY / AUDIT:
return_log records the receipt fact independently of the inspection outcome — good, prevents a rejected item from silently vanishing from the record.

CONSUMER COVERAGE:
Classification: active. REM-153's h.inspect is the confirmed real sender, carrying exactly what this workflow's entry needs.

TEST CASES:
- [concurrent-claim] Given: a returned item sits in an unowned inspection queue → Expect: a defined mechanism exists for someone to claim and be accountable for inspecting it — currently undefined
- [missing-evidence] Given: no policy defines acceptance criteria for this kind of return → Expect: escalated to DEC-181 rather than judged against an invented standard
- [handoff] Given: an item is partially acceptable → Expect: REM-157 receives the accepted and rejected scope named separately, not merged

GAPS:
- P1 (ownership): No queue, role, or claim mechanism is defined for who performs the physical inspection — a genuine gap for a task that requires a human to act on a physical item, not merely a mapping exercise.
- P2 (idempotency): No dedupe against the same physical item being recorded as received more than once.

---

## REM-155 — Replacement Fulfillment

READINESS: NEEDS_CONTRACT_WORK

WHY:
The no-recharge and lineage-preservation guardrails are sound and both waits are properly bounded, but unlike REM-159 (which explicitly checks for prior compensation on the same impact before authorizing more), this workflow has no equivalent check for whether a replacement has already been authorized for the same defect, leaving a real duplicate-shipment/duplicate-effect risk if the workflow is triggered twice for one defect.

RESPONSIBILITY:
Delivers a second fulfillment against the same obligation to resolve a specific identified defect, linking it to the original so it is never billed for or scoped as a fresh order.

INSTANCE:
No instanceKey; identity is the replacement case, explicitly linking the original fulfillment to the new one (entity.note: without the link the replacement looks like a new order and the original defect disappears from the record).

ENTRY:
replacement_remedy_authorized, authoritative, requiring a replacement already authorized as the remedy for an identified defect — precise, though the authorizing decision itself happens upstream.

OWNERSHIP:
No actor named for link/scope/no-charge; automated fulfillment routing is plausible given the mechanical nature, but not stated.

ASSIGNMENT / QUEUE:
N/A — no queue modeled; if a replacement resource isn't available, w.availability is a passive wait rather than a routed task.

DATA:
Original fulfillment, the specific defect, replacement scope (identical vs. accepted equivalent) — complete for the decision made.

EVIDENCE:
N/A — replacement scope is determined from the recorded defect, not from a separate evidentiary review (that presumably already happened in whatever workflow chose the remedy).

AUTHORITY / APPROVAL:
N/A here by design — authorization for the replacement is asserted as already established by the trigger; this workflow only executes it.

IDEMPOTENCY:
Gap: no check exists for whether a replacement has already been authorized/created for the same original-fulfillment-plus-defect pair before a.link proceeds, unlike REM-159's explicit c.duplicate check for compensation against the same impact.

SLA / TIME:
w.availability times out at 'the tolerable wait for this remedy' → h.alternative; w.replacement times out at 'the remedy deadline' → h.alternative — both honestly sourced from policy, not invented.

ESCALATION:
Both non-charge-related failure paths (unavailable, failed/cancelled) route to h.alternative → REM-157, correctly returning to the decision authority rather than silently giving up or retrying blindly.

CANCELLATION / SUPERSESSION:
N/A — no explicit cancellation path is modeled for an in-flight replacement that the customer no longer wants; this is a plausible but unaddressed gap (P2, since it's a real-world scenario not covered by any branch).

HANDOFFS:
- h.verify → REM-158: carries ["the replacement and the original defect it was meant to resolve","the explicit fact that delivered is not yet resolved - whether it satisfied the obligation is the next question"]
- h.alternative → REM-157: carries ["why the replacement could not be completed","the unresolved obligation, unchanged, and whatever remedies remain available for it"]

COMPLETION:
There is no local exit for a successfully delivered replacement — it hands to REM-158 for outcome verification, correctly deferring 'did this actually resolve the obligation' rather than declaring success at delivery.

RESULT / FEEDBACK:
Both outcomes (delivered, failed/unavailable) route to distinct, purpose-appropriate consumers.

CORRECTION / REOPEN:
N/A — reopening after a replacement fails is REM-158's/REM-157's responsibility, correctly deferred.

OBSERVABILITY / AUDIT:
remedy_log records the link, scope, and no-charge decision explicitly, preserving the original fulfillment's history untouched.

CONSUMER COVERAGE:
Classification: active. REM-157 (customer surface) sends a real h.replacement handoff carrying the original fulfillment, defect, and required scope; REM-156 references it only via distinctFrom prose.

TEST CASES:
- [duplicate-creation] Given: a replacement is authorized twice for the same original defect (e.g. a duplicate approval upstream) → Expect: the second authorization is detected against the existing linked replacement case rather than creating a second shipment — currently unguarded
- [handoff] Given: a replacement is delivered → Expect: REM-158 receives the replacement and the original defect with the explicit fact that delivery is not yet resolution
- [cancellation] Given: a customer no longer wants an in-flight replacement → Expect: N/A — no cancellation path is modeled for this real-world scenario

GAPS:
- P1 (idempotency): No check for a prior replacement already authorized against the same original-fulfillment-plus-defect pair, unlike REM-159's explicit duplicate-compensation check.
- P2 (other): No cancellation/supersession path exists for an in-flight replacement the customer no longer wants.

---

## REM-158 — Remedy Outcome Verification

READINESS: READY_WITH_MAPPING

WHY:
This is the batch's clearest application of the technical-completion-is-not-business-completion precedent (echoing OPS-130): a.resolve explicitly closes the issue because the obligation is satisfied, not because a task is marked complete, and the three-way completed/partly/not-resolved branch avoids forcing an ambiguous outcome into a binary. Only role/system mapping remains.

RESPONSIBILITY:
Checks that a remedy's actual business outcome (replacement delivered, correction verified, refund confirmed, service repeated) satisfied the original obligation — never that the internal task recording the remedy was marked done.

INSTANCE:
No instanceKey; identity is the remedy plus the issue it was chosen to resolve — entity.note explicitly separates these as two things, since 'a replacement can arrive and still be wrong.'

ENTRY:
remedy_execution_started, authoritative, with an explicit insufficientAlone guard ('a remedy approved... performs none of it') — precise, correctly distinguishes authorization from execution.

OWNERSHIP:
No actor named for track/unknown/resolve/remaining; this is fundamentally an outcome-monitoring function rather than a task a person actively performs, so N/A is a reasonable reading, though who is notified on 'not resolved' is unaddressed.

ASSIGNMENT / QUEUE:
N/A — outcome tracking, not a claimed task; h.continue/h.alternative route back to REM-157 for a new remedy decision, which presumably has its own queue.

DATA:
The remedy's actual business outcome and the original obligation it targets — complete for the check performed.

EVIDENCE:
The business outcome itself is the evidence (delivery confirmation, correction verification, refund confirmation) — explicitly never the internal task-completion flag, which is the workflow's central discipline.

AUTHORITY / APPROVAL:
N/A — no approval decision; this is a verification function.

IDEMPOTENCY:
a.unknown explicitly suppresses any second remedy while the first's outcome is unestablished, with the same rationale as the financial-domain unknown handling ('the second one is usually money or goods that have already gone out').

SLA / TIME:
w.remedy times out at 'the remedy window' → a.unknown, honestly sourced, not invented.

ESCALATION:
c.resolved's three-way branch (resolved / partly resolved / not resolved) routes non-fully-resolved outcomes to h.continue → REM-157 for a fresh remedy decision rather than looping or silently accepting partial completion as done.

CANCELLATION / SUPERSESSION:
N/A — nothing is cancelled here; a failed remedy routes to h.alternative for a different remedy choice.

HANDOFFS:
- h.reconcile → external:external-status-reconciliation: carries ["the remedy, its identifiers and everything last known about it","the explicit instruction that no second remedy is issued until this is settled"]
- h.continue → REM-157: carries ["what the remedy did achieve and what remains owed","the fact that this remedy has already been tried, which usually changes which one is chosen next"]
- h.alternative → REM-157: carries ["why it failed","the unresolved obligation and the remedies still available"]

COMPLETION:
RESOLVED explicitly requires the obligation the issue named to be satisfied, directly citing the same discipline as OPS-130's technical-vs-business-completion precedent — the strongest completion contract in this batch.

RESULT / FEEDBACK:
All outcomes are routed to distinct consumers (REM-155, REM-156 customer-surface, REM-160) with exactly what each needs, per the consumers array.

CORRECTION / REOPEN:
x.resolved reEntry explicitly treats a later report about the same thing as assessed for recurrence (REM-160) rather than a fresh problem — good linkage to the recurrence-assessment workflow.

OBSERVABILITY / AUDIT:
remedy_log tracks the business outcome (not the internal task) at every step, with remaining obligation stated explicitly when only partly resolved.

CONSUMER COVERAGE:
Classification: active. REM-155 (h.verify), REM-156 (h.verify, customer surface) and REM-160 (h.resume) all send real handoffs matching this workflow's entry, confirming it as an actively-used shared verification point across the remedy domain.

TEST CASES:
- [completion] Given: a remedy's internal task is marked done → Expect: the issue is not closed until the remedy's actual business outcome is independently confirmed to satisfy the obligation
- [escalation] Given: a remedy completes but the obligation remains partly or fully outstanding → Expect: routed back to REM-157 for a further remedy decision rather than accepted as resolved
- [reopen] Given: a later report concerns the same previously-resolved obligation → Expect: assessed for recurrence via REM-160 rather than treated as an unrelated fresh issue

GAPS:
- none recorded

---

## REM-159 — Compensation Eligibility

READINESS: READY_WITH_MAPPING

WHY:
Strong duplicate-compensation check (c.duplicate) that the sibling remedy workflows lack, correct three-way form routing (financial/entitlement/operational) to the domain-appropriate handler, and an explicit delivery-verification step distinguishing authorized from actually-applied. Only mapping (which policy engine, who resolves undefined-policy cases) remains.

RESPONSIBILITY:
Decides, separately from whatever remedy fixes the underlying problem, whether the impact or inconvenience of a failure independently warrants compensation, and confirms it actually reached the customer rather than merely being authorized.

INSTANCE:
No instanceKey; identity is the compensation case plus the impact/experience that prompted it, explicitly independent of whatever remedy is also in progress.

ENTRY:
compensation_consideration_appropriate, authoritative, with two explicit insufficientAlone guards (an issue existing is not itself grounds; a customer asking is not itself grounds) — precise, correctly refuses to treat a bare request as sufficient.

OWNERSHIP:
No actor named for assess/authorize/verify; policy is the decision authority (c.policy), correctly not left to ad hoc operator judgment.

ASSIGNMENT / QUEUE:
N/A — no queue modeled; escalation on non-delivery goes to OWN-55.

DATA:
Reason, impact, existing/in-progress remedy, policy-defined eligibility — complete for the decision.

EVIDENCE:
N/A in the review sense — eligibility is policy-matched against recorded impact, not evaluated evidence.

AUTHORITY / APPROVAL:
Policy is the sole authority (c.policy/c.eligible); undefined policy routes to DEC-181 rather than an invented amount or rule — correct, and the amount/form themselves are explicitly policy-defined rather than discretionary.

IDEMPOTENCY:
Strong and unique in this remedy sub-batch: c.duplicate explicitly checks whether compensation has already been granted for this exact impact before proceeding, routing to x.already if so — this is the check REM-155 lacks for replacements.

SLA / TIME:
w.delivery times out at 'the delivery window' → h.escalate, honestly sourced, explicitly framed as worse to leave undelivered than to have never offered it.

ESCALATION:
Undelivered authorized compensation escalates to OWN-55 rather than being left as a silently-stale authorization — correct, treats 'authorized' and 'delivered' as genuinely different states needing separate proof.

CANCELLATION / SUPERSESSION:
N/A — compensation once delivered is not reversed within this workflow; a further distinct impact is assessed on its own (x.none/x.already reEntry).

HANDOFFS:
- h.undefined → DEC-181: carries ["the impact and what remedy is already under way","the explicit fact that no amount or rule was invented in order to decide it"]
- h.financial → FIN-137: carries ["the authorised amount and its basis","the explicit fact that this is compensation for impact rather than a refund of what was paid, which are different things against the same transaction"]
- h.entitlement → ACC-71: carries ["the entitlement being granted, its scope and its validity","the compensation case, so the grant can be traced to what it was for"]
- h.escalate → OWN-55: carries ["what was authorised, when, and what has not arrived"]

COMPLETION:
x.delivered explicitly requires the compensation to be verified as reaching the recipient, not merely authorized — and explicitly notes that delivering compensation does not settle whether the underlying obligation was resolved (a clean non-conflation).

RESULT / FEEDBACK:
RET-26 (customer surface) receives a real handoff carrying the failure's assessed impact — confirms this workflow's output is genuinely consumed downstream.

CORRECTION / REOPEN:
x.already and x.none reEntry both correctly scope to this specific impact; a worsening impact or a failed remedy may reopen the assessment, but a second grant for the same impact is explicitly treated as a duplicate, not a gesture.

OBSERVABILITY / AUDIT:
compensation_log records the reason, impact, policy basis, form, and delivery verification distinctly — good detail for later audit of why compensation was or wasn't granted.

CONSUMER COVERAGE:
Classification: active. RET-26 (customer surface) sends a real h.compensation handoff matching this workflow's entry.

TEST CASES:
- [self-approval] Given: N/A — house rule against inventing four-eyes rules where the source doesn't require them; no approval-hierarchy is stated for who authorizes compensation, so self-approval risk cannot be confirmed or ruled out from this dump → Expect: N/A
- [duplicate-creation] Given: compensation is considered twice for the same impact → Expect: the second consideration finds the existing grant via c.duplicate and exits x.already rather than granting a second one
- [completion] Given: compensation is authorized in financial form → Expect: it is not recorded delivered until independently verified as applied, not merely authorized
- [escalation] Given: authorized compensation is not delivered within the delivery window → Expect: escalated to OWN-55 rather than left as a stale, undelivered authorization

GAPS:
- P2 (authority-approval): No approval hierarchy is stated for who authorizes compensation, so whether self-approval is structurally possible cannot be confirmed from this workflow alone.

---

## REM-160 — Remedy Recurrence Assessment

READINESS: READY_WITH_MAPPING

WHY:
The three-way classification directly matches its own stated risk ('assuming any one of them is how a case is duplicated, buried, or reopened for the wrong reason'), the recurrence count is explicitly barred from being treated as automatic fault or entitlement, and diagnosis-failure vs. execution-failure are correctly routed differently. Needs mapping of who performs the comparison judgment.

RESPONSIBILITY:
Classifies a problem reported after a prior remedy as a genuine recurrence of the same defect, a distinct new problem, or an unfinished remedy that never actually completed — three outcomes that must not be collapsed into each other.

INSTANCE:
No instanceKey; identity is the previously resolved issue plus the new report made against it — entity.note is explicit about the three possible relationships.

ENTRY:
problem_reported_after_remedy, source declared (not authoritative) — a customer/agent report, correctly treated as weaker evidence than the workflows around it, which is exactly why a.compare exists to convert it into an authoritative classification before acting.

OWNERSHIP:
No actor named for a.compare's judgment call (same defect vs. distinct vs. never-completed); this is a nontrivial comparison a person likely needs to make, and no role is named for it.

ASSIGNMENT / QUEUE:
N/A — no queue modeled for who performs the comparison.

DATA:
The new report and the original issue's fulfillment/scope/defect — sufficient for the comparison.

EVIDENCE:
The declared report is explicitly treated as a starting point requiring comparison, not an authoritative classification on its own — correct evidentiary discipline for a self-reported trigger.

AUTHORITY / APPROVAL:
N/A — no approval decision; this is a classification function.

IDEMPOTENCY:
N/A for classification itself; a.new correctly creates a genuinely new issue only for a distinct problem, avoiding forcing an unrelated complaint into an existing case's history.

SLA / TIME:
N/A — no waits are declared.

ESCALATION:
c.diagnosis correctly separates 'the remedy was applied correctly and it still recurred' (→ h.escalate/OWN-55, implying the diagnosis itself was wrong) from 'the previous attempt failed in execution' (→ h.remedy/REM-157, a fresh attempt at the same diagnosis) — avoids repeating a failed diagnosis blindly.

CANCELLATION / SUPERSESSION:
N/A — nothing here is cancelled; the three relationship branches each lead to an appropriate next step rather than a dead end.

HANDOFFS:
- h.new → REM-151: carries ["the new report and the prior context where it helps","the explicit fact that this is not a recurrence, so the prior remedy history does not colour the assessment"]
- h.resume → REM-158: carries ["the remedy and what was supposed to have happened","the explicit fact that this is an unfinished remedy rather than a new issue, so no duplicate is created"]
- h.escalate → OWN-55: carries ["every remedy attempted and its outcome","the fact that repeating the same remedy without reassessing the cause produces the same failure at greater cost"]
- h.remedy → REM-157: carries ["the recalculated obligation and every remedy already tried","which of them failed in execution, which is what makes a repeat worth attempting"]

COMPLETION:
N/A directly — this workflow's job is classification and routing, not resolution; completion belongs to whichever downstream workflow the classification routes to.

RESULT / FEEDBACK:
Each of the three relationships routes to a distinct, purpose-appropriate consumer with the comparison result explicit, so no receiver has to re-derive 'is this a recurrence' from prose.

CORRECTION / REOPEN:
a.reopen explicitly preserves every previous remedy attempt and its outcome when reopening the original issue, and the reopen count is explicitly framed as diagnostic input rather than an automatic conclusion about fault.

OBSERVABILITY / AUDIT:
issue_log preserves the comparison result, the reopened history, and the recalculated obligation — good detail; the recurrence count itself is recorded but explicitly not treated as dispositive.

CONSUMER COVERAGE:
Classification: event-driven. No confirmed handoff senders; the trigger is a declared customer/agent report, which is the expected external entry shape for this kind of post-remedy complaint intake.

TEST CASES:
- [reopen] Given: the same defect on the same scope is reported again → Expect: the original issue is reopened with every previous remedy attempt preserved, not treated as a fresh unrelated issue
- [duplicate-creation] Given: a customer describes a genuinely distinct new problem using similar words to a prior complaint → Expect: a new issue is created rather than forced into the existing case's history
- [escalation] Given: a remedy was applied correctly and the problem still recurred → Expect: routed to escalate the diagnosis (OWN-55) rather than retrying the same remedy again

GAPS:
- P1 (ownership): No role is named for the same-vs-distinct-vs-unfinished comparison judgment, which is a nontrivial decision that materially changes downstream routing.

---

## RLT-241 — Change Eligibility

READINESS: NEEDS_CONTRACT_WORK

WHY:
The eligible/excluded/pending decision logic itself is precise and per-target (not entity-type-inferred). But the exclusion re-entry path names no event that actually re-triggers evaluation when the excluding constraint clears, and no action carries an idempotencyKey/attemptBudget for repeated evaluation of the same target-change pair.

RESPONSIBILITY:
Per-target eligibility evaluation for a released change: decides EXCLUDED / PENDING_REQUIREMENT / READY_FOR_CHANGE before any preparation work starts.

INSTANCE:
Scope is the change/version crossed with each individual target; no entity.instanceKey declared (this journey predates that convention). Concurrency of two evaluations for the same target+change pair is not addressed.

ENTRY:
t.available (`change_available_for_controlled_application`), authoritative, explicitly distinguishes availability from eligibility (`a version being published... makes it available and eligible for nothing`). Precise.

OWNERSHIP:
Fully automated; no human role is named or implied anywhere in this journey — appropriate for a rules evaluation, but worth stating explicitly rather than leaving silent.

ASSIGNMENT / QUEUE:
N/A — automated evaluation, no queue or routing.

DATA:
Supported version, device/resource compatibility, account configuration, dependencies, prerequisites, policy eligibility, environment, capacity, prior state — all named, sourced from `the change and target` rather than the generic entity type.

EVIDENCE:
N/A — this is a rules evaluation against system state, not a human review of evidence.

AUTHORITY / APPROVAL:
N/A — no approval gate; eligibility is rule-derived, not a human decision.

IDEMPOTENCY:
No idempotencyKey/attemptBudget on any action; re-running evaluation for the same target re-appends rollout_log entries with no stated dedupe. Low risk since it's a read-mostly append-log, but undeclared.

SLA / TIME:
N/A — no waits in this journey.

ESCALATION:
N/A — no escalation path; unmet prerequisites route directly to RLT-242 for resolution rather than escalating within this journey.

CANCELLATION / SUPERSESSION:
N/A — no cancellation concept in a pure eligibility check.

HANDOFFS:
- h.prepare → RLT-242: carries ["the target, the change version and its eligibility basis","any outstanding prerequisites by name, so preparation resolves specific blockers rather than running a generic checklist"]

COMPLETION:
x.excluded is the only true exit and is explicitly non-terminal (re-eval on constraint change). The eligible/pending paths never exit locally — they always hand off, correctly treating 'eligible' as a decision, not a completion.

RESULT / FEEDBACK:
RLT-242 is the real consumer (confirmed via viaHandoff). RLT-279 (customer journey) references this only in prose (distinctFrom), not a real handoff consumer.

CORRECTION / REOPEN:
x.excluded's reEntry says the excluding constraint clearing 'makes the target eligible again, and it is re-evaluated rather than assumed still excluded' — correct intent, but no event or poller is named that actually fires that re-evaluation.

OBSERVABILITY / AUDIT:
rollout_log appended at every action with the specific reason (EXCLUDED with cause, PENDING_REQUIREMENT naming the exact prerequisite, READY_FOR_CHANGE) — strong per-decision auditability.

CONSUMER COVERAGE:
Classification: event-driven. Zero real handoff consumers into RLT-241 exist in the dump (RLT-279 only references it in prose). The trigger `change_available_for_controlled_application` is plausibly emitted by an external release/deployment-management system, matching the round's event-driven precedent shape.

TEST CASES:
- [handoff] Given: a target evaluated READY_FOR_CHANGE with named outstanding prerequisites → Expect: RLT-242 receives the target, change version, eligibility basis and the exact named prerequisites — not a generic checklist trigger
- [reopen] Given: an EXCLUDED target's disqualifying constraint (e.g. a policy restriction) is lifted → Expect: the target is re-evaluated against current eligibility rules rather than remaining EXCLUDED indefinitely — but no concrete trigger event is defined for this
- [missing-evidence] Given: a target's compatibility cannot be determined from any governing system → Expect: the target is not defaulted to eligible or ineligible from the entity type alone; the specific unknown is what should surface

GAPS:
- P1 (correction-reopen): The excluded-target re-entry path has no named triggering event or process — 'the constraint... changing makes the target eligible again' but nothing says what detects that change and re-fires evaluation.
- P2 (idempotency): No idempotencyKey/attemptBudget declared on any action; repeated evaluation delivery for the same target+change is not explicitly guarded, though the append-only log makes the practical risk low.

---

## RLT-242 — Change Readiness

READINESS: NEEDS_CONTRACT_WORK

WHY:
The readiness logic correctly avoids a generic checklist and handles obsolescence/window-expiry well, but the workflow never names who is responsible for actually clearing a named blocker (a.hold), who grants a 'required approval' prerequisite when that's the blocking type, and the handoff to RLT-243 doesn't explicitly carry the scheduled execution time/window that RLT-243's own trigger requires.

RESPONSIBILITY:
Determines and drives the change-specific preparation (backup, capacity, config, dependency, approval, etc.) an eligible target needs before it can safely receive the change.

INSTANCE:
Scope is the target crossed with the preparation this specific change requires of it; no instanceKey declared. Concurrency of two preparation cycles for the same target under different changes is not addressed.

ENTRY:
t.eligible (`target_eligible_for_planned_change`), authoritative, sourced from RLT-241's own h.prepare handoff — confirmed match.

OWNERSHIP:
No human or system role is named as responsible for clearing a named blocker once a.hold records it — the workflow identifies and names blockers precisely but doesn't say who acts on them (admin readiness, backup completion, approval-granting are all listed as possible blocker types with no owner).

ASSIGNMENT / QUEUE:
Not named — flagged rather than treated as N/A, since 'required approval' and 'administrator readiness' as prerequisite types imply a human party who is never identified.

DATA:
Backup, resource capacity, configuration, pre-download, dependency upgrade, maintenance window, user/admin readiness, required approval — enumerated per change+target rather than a standard checklist. Good.

EVIDENCE:
N/A — technical dependency status, not a human evidentiary review.

AUTHORITY / APPROVAL:
'A required approval' is listed as a possible prerequisite type but no approving authority is named anywhere in this journey — the same generic-authority gap recurs across most of this batch's terminal/rollout journeys.

IDEMPOTENCY:
No idempotencyKey/attemptBudget declared; the wait/recheck cycle (w.dependencies → c.outcome) is re-entrant by construction (re-evaluates c.critical) which mitigates most double-action risk.

SLA / TIME:
w.dependencies timeout = 'the schedule window this change allows for preparation' — honestly traced to the change's own schedule concept, not invented.

ESCALATION:
No escalation on a stuck blocker before window expiry — onTimeout simply records window-expired and returns the target to visible-unprepared state, deferring to population-level handling (RLT-245/249) rather than escalating the specific blocker to a person.

CANCELLATION / SUPERSESSION:
a.obsolete handles the change being superseded mid-preparation correctly (abandons prep, sends target back to eligibility evaluation for the current change) — clean, no stale-preparation risk.

HANDOFFS:
- h.schedule → RLT-243: carries ["the target, the change version and the dependency state as it stands now","the explicit fact that this readiness is a snapshot, to be revalidated at the moment of execution"]

COMPLETION:
a.ready records CHANGE_READY with an explicit guardrail that readiness ≠ applied — good discipline; but as above, this workflow never exits on the ready path, it hands off immediately.

RESULT / FEEDBACK:
RLT-241 confirmed as the real sending journey (h.prepare). RLT-279 (customer journey) is a real consumer via h.resume, notifying the holder when a blocker clears — a genuine bidirectional relationship (RLT-242 informs the customer-facing journey on resolution).

CORRECTION / REOPEN:
x.obsolete and x.not-ready both provide honest, non-terminal re-entry semantics with no silent state loss.

OBSERVABILITY / AUDIT:
rollout_log at every step with specific reasons (named blockers on hold, CHANGE_READY, obsolete/expired) — good.

CONSUMER COVERAGE:
Classification: active. Two confirmed real handoff senders: RLT-241 (h.prepare, eligible target arriving) and RLT-279 (h.resume, a customer-side blocker clearing resumes preparation).

TEST CASES:
- [handoff] Given: a target completes preparation and is handed to RLT-243 → Expect: RLT-243 can actually schedule it — but the carried data does not name a schedule time/window, only 'dependency state as it stands now'
- [escalation] Given: a named blocker (e.g. required approval) sits unresolved through the whole preparation window → Expect: the window expires and the target is marked not-ready and visible — no explicit notification to whoever should have granted the approval
- [cancellation] Given: the change is superseded by a newer version while a target is mid-preparation → Expect: preparation is abandoned and the target re-enters eligibility evaluation for the current change rather than continuing to prep for the old one

GAPS:
- P1 (ownership): No role/system is named as responsible for clearing a named blocker (backup, admin readiness, required approval) once a.hold records it — the blocker is precisely named but nobody is assigned to act on it.
- P1 (handoff-provenance): h.schedule's carries do not explicitly include a scheduled execution time/window, which RLT-243's own trigger.evidence.requires names as a prerequisite for entry.
- P1 (authority-approval): 'Required approval' is a named prerequisite type with no approving authority identified anywhere in the journey.

---

## RLT-243 — Scheduled Change Revalidation

READINESS: READY_WITH_MAPPING

WHY:
This is a clean, well-reasoned freshness-before-execution implementation — exactly the discipline the round's freshness dimension asks for. Cancel/supersede/suppress are all handled distinctly with correct re-entry semantics and no stale revival risk. The only real gap (undefined approval authority) is inherited from upstream, not original to this journey.

RESPONSIBILITY:
Holds a scheduled change intention and, at the execution moment, re-checks every assumption (eligibility, state, dependencies, currency, approval, incident hold) before authorizing an actual attempt.

INSTANCE:
Scope is the scheduled change crossed with the target; the schedule record itself functions as the instance, explicitly described as a set of assumptions kept only to detect drift, never to act on directly.

ENTRY:
t.scheduled (`change_receives_scheduled_execution_window`), authoritative, requires a prepared target with a scheduled time/window. Real sender: RLT-242 (h.schedule) — though see RLT-242's own flagged gap about whether the schedule window is actually carried.

OWNERSHIP:
Fully automated; no human role required for the wait/revalidate/execute-or-suppress cycle, which is appropriate for a freshness check.

ASSIGNMENT / QUEUE:
N/A — automated, no queue.

DATA:
At revalidation: eligibility, version/state, dependencies, currency of the change, required approval, and any incident/change hold — a thorough 'what is checked is now' list.

EVIDENCE:
The revalidation IS the evidence-gathering step; it explicitly re-reads authoritative current state rather than trusting the stored schedule assumptions — a textbook freshness-before-execution example, citable as the reference pattern for this round.

AUTHORITY / APPROVAL:
c.valid re-checks 'any required approval' as one dimension of validity, but (inherited from RLT-242) no approving authority is named for what that approval actually is.

IDEMPOTENCY:
Not the concern of this journey — it authorizes an attempt but performs nothing itself (explicitly: 'the revalidation authorizes the attempt rather than performing it'); execution idempotency is RLT-244's job.

SLA / TIME:
w.window timeout = 'the scheduled execution window' — this is the intended normal path (reaching the window IS the trigger for revalidation), not a failure timeout. Honestly framed.

ESCALATION:
N/A — no escalation; stale conditions are handled by suppression and clean re-entry, not escalation.

CANCELLATION / SUPERSESSION:
Excellent: a.cancel and a.superseded both stand down cleanly with suppressed_sends recorded, and a.suppress catches drift discovered only at the execution moment. All three explicitly guard against reviving a stale schedule.

HANDOFFS:
- h.execute → RLT-244: carries ["the target, the change version and the state it was revalidated against","the explicit fact that nothing has been applied - the revalidation authorizes the attempt rather than performing it"]

COMPLETION:
No terminal exit for the valid path — it always hands off to RLT-244. The three exits (cancelled/superseded/suppressed) are all interruption paths, correctly non-terminal with reentry as a fresh eligibility question rather than a schedule revival.

RESULT / FEEDBACK:
RLT-242 confirmed sender; RLT-244 confirmed receiver — both directions verified.

CORRECTION / REOPEN:
All three exits explicitly route any later attempt through fresh eligibility evaluation rather than reviving the stale schedule — strong discipline, directly matching the guardrail 'a cancelled target is never revived by a stale change job.'

OBSERVABILITY / AUDIT:
rollout_log and suppressed_sends both written with the specific reason for suppression — good.

CONSUMER COVERAGE:
Classification: active. RLT-242 is the confirmed real sender via h.schedule; RLT-244 references this journey only in prose (distinctFrom) as the receiving side of h.execute is defined on RLT-243's own handoffs list, correctly.

TEST CASES:
- [stale-work] Given: a target's dependency state moved between scheduling and the execution window → Expect: a.suppress fires, naming exactly what changed, and no attempt is made — the target is re-evaluated fresh rather than executed on stale assumptions
- [cancellation] Given: the target is cancelled or made ineligible before the execution window arrives → Expect: the schedule stands down; a later change evaluates the target's eligibility fresh rather than reviving this schedule

GAPS:
- P2 (authority-approval): Approval re-validation is checked structurally (c.valid) but the approving authority itself is never named anywhere upstream — inherited gap, not original to this journey.

---

## RLT-244 — Change Execution Verification

READINESS: READY_WITH_MAPPING

WHY:
This is the strongest-specified journey in the rollout set: explicit stable operation identity for retry-safety, an explicit accepted/applied/verified three-tier distinction, and correct never-retry-on-unknown discipline. No P0/P1 gaps found; only minor mapping items remain.

RESPONSIBILITY:
Executes an authorized change against one target and establishes — via actual state verification, not command return codes — whether the target reached its intended state.

INSTANCE:
Scope is one change execution against one target. The operation 'carries a stable identity, so a retry re-applies the same change rather than a second one' — functionally an instanceKey even without the literal field name, stated explicitly and honestly.

ENTRY:
t.begins (`authorized_change_execution_begins`), authoritative, requires a revalidated, authorized target — matches RLT-243's h.execute precisely.

OWNERSHIP:
Fully automated execution and verification. Ambiguous or failed outcomes hand off ownership cleanly and explicitly (to external reconciliation or to RLT-249) rather than looping indefinitely.

ASSIGNMENT / QUEUE:
N/A — automated.

DATA:
Change version and stable operation identity for execution; version/configuration/behaviour for verification. All sourced from the target's actual reported state.

EVIDENCE:
Verification reads the target's actual version, configuration and behaviour rather than trusting the command's return code — the clearest embodiment in this batch of 'accepted ≠ applied ≠ verified.'

AUTHORITY / APPROVAL:
N/A — authorization already established upstream by RLT-243; this journey executes an already-authorized attempt.

IDEMPOTENCY:
Explicit and strong: a.applying creates a 'stable operation identity... so a retry re-applies the same change rather than performing a second one'; a.execute runs 'idempotently... through the canonical async and reliability primitives.' a.unknown explicitly holds any retry on timeout rather than retrying blind — correctly matches the house rule against retrying after an unknown outcome.

SLA / TIME:
w.result timeout = 'the execution timeout for this change and target class' — honestly sourced to a per-class concept, not an invented number.

ESCALATION:
Unknown outcomes go to external status reconciliation with retry explicitly suppressed; confirmed failures and state mismatches both route to RLT-249 for target-scoped recovery. Clean three-way split (unknown / failed / mismatch-vs-verified).

CANCELLATION / SUPERSESSION:
N/A within this journey — cancellation/supersession is RLT-243's responsibility before authorization; once here, execution proceeds or fails.

HANDOFFS:
- h.reconcile → external:external-status-reconciliation: carries ["the target, the change version, the operation identity and everything last known","the explicit instruction that no retry is attempted until the target's actual state is established"]
- h.target-failure → RLT-249: carries ["the target, what it reported and the state it is actually in","the explicit fact that this is one target's outcome - whether it is systemic is a separate question with separate evidence"]

COMPLETION:
Only exit is x.verified (CHANGE_APPLIED_VERIFIED), reached solely after actual-state verification passes — explicitly not equated with 'healthy' (that's reserved for rollout-scope observation in RLT-245/250). A precise, three-tier completion contract.

RESULT / FEEDBACK:
RLT-243 confirmed real sender. Downstream rollout-scope health observation (RLT-245/250) presumably aggregates verified outcomes rather than receiving a per-target handoff — reasonable design for a scale-out fan-in, not a gap.

CORRECTION / REOPEN:
x.verified's reEntry correctly treats a later regression as a health signal at rollout scope, not an execution failure — appropriately scoped.

OBSERVABILITY / AUDIT:
rollout_log at every one of the three tiers (APPLYING/VERIFYING/VERIFIED, or the failure/unknown/mismatch equivalents) plus suppressed_sends on unknown outcomes — thorough.

CONSUMER COVERAGE:
Classification: active. RLT-243 is the confirmed real sender via h.execute.

TEST CASES:
- [duplicate-creation] Given: a retry is issued after a timeout whose outcome is unknown → Expect: the retry is held rather than re-applied, because the change may already have taken effect and a second application is not idempotent for firmware/schema-class changes in practice
- [completion] Given: the target accepts and applies the change but ends up in a different state than intended → Expect: this is recorded as a mismatch and routed to RLT-249 as a target failure — not silently counted as verified

GAPS:
- P2 (result-feedback): No explicit handoff carries per-target verified outcomes forward to RLT-245/250's cohort health observation; presumably read as aggregate telemetry rather than an explicit handoff — worth confirming during implementation mapping.

---

## RLT-245 — Staged Rollout Expansion

READINESS: READY_WITH_MAPPING

WHY:
Strong evidence discipline throughout (elapsed time and silence are both explicitly rejected as evidence; gates are written before deployment). The one real production concern — how a post-completion regression handed back via RLT-246 actually resumes here — is more RLT-246/RLT-250's defect than this journey's own.

RESPONSIBILITY:
Progresses a change through a finite, pre-defined cohort list, expanding to the next cohort only when the previous one clears its pre-written health gate.

INSTANCE:
Scope is the rollout, its population, and the finite cohort list it progresses through — the cohort list itself functions as the bounding instance. No instanceKey literal; concurrency of two staged rollouts for the same population is not addressed.

ENTRY:
t.approved (`change_approved_for_staged_rollout`), authoritative. Cold-start is plausibly external (an approval process outside the corpus); a real internal re-entry also exists via RLT-246's h.resume for the pause-resolved-healthy path.

OWNERSHIP:
No human role is named for day-to-day cohort deployment/gate evaluation — implied to be a controller process. When cohort rules are undefined, ownership explicitly transfers to DEC-181 (h.review) rather than proceeding on an assumed default — good discipline.

ASSIGNMENT / QUEUE:
N/A — no queue; escalates to DEC-181 only when rules are genuinely undefined.

DATA:
Cohort order and health gate criteria — required to be explicit and written 'before deployment,' with an explicit guardrail against writing gates after the fact.

EVIDENCE:
Distinguishes elapsed time from actual evidence explicitly: 'a cohort that produced no traffic produced no information' and 'a rollout never expands merely because no alert fired' — directly matches the round's absence-of-signal discipline.

AUTHORITY / APPROVAL:
h.review → DEC-181 is the closest approval gate (for undefined cohort/gate rules); otherwise gate evaluation is rule-based against pre-written criteria, which avoids a self-approval risk since criteria predate the result.

IDEMPOTENCY:
a.deploy consumes one entry from the finite cohort list per pass, guaranteeing termination rather than cycling — a real anti-loop guarantee, though not classic idempotency; no explicit dedupe on a retriggered deploy of the same cohort.

SLA / TIME:
w.evidence timeout = 'the maximum observation window for this cohort,' honestly sourced. onTimeout routes back to c.sufficient (re-asks whether enough evidence existed) rather than assuming pass or fail — correct.

ESCALATION:
h.pause → RLT-246 on gate failure is real and well-provenanced.

CANCELLATION / SUPERSESSION:
Not handled within this journey (deferred correctly to RLT-246/downstream abandon logic) — N/A here.

HANDOFFS:
- h.review → DEC-181: carries ["the change, the population and what is and is not defined about progression","the explicit fact that implicit cohorts mean nobody can say who is next or why, and an implicit gate is a judgment made under pressure by whoever is watching"]
- h.pause → RLT-246: carries ["which gate dimension failed, on what evidence, and across which cohort","the changed and unchanged populations as they currently stand"]
- h.complete → RLT-250: carries ["the changed population, the exception targets and the gates each cohort passed","the explicit fact that reaching the population is not stability - the regressions that matter tend to surface later"]

COMPLETION:
a.complete records the planned population reached — but hands to RLT-250 for stability observation rather than treating this as final completion, correctly separating coverage from stability.

RESULT / FEEDBACK:
RLT-250 confirmed real consumer via h.complete. RLT-246 both sends into (h.resume) and receives from (h.pause) this journey — a genuine, intentional pause/resume cycle, not a defect.

CORRECTION / REOPEN:
x.holding's reentry is explicitly a no-op-safe state: 'nothing was reverted and nothing expanded' while waiting for more evidence or a redefined gate.

OBSERVABILITY / AUDIT:
rollout_log throughout with specific reasons at each cohort transition.

CONSUMER COVERAGE:
Classification: active. RLT-246 is a confirmed real sender (h.resume, pause resolved healthy) as well as a confirmed real receiver (h.pause). Initial cold-start entry is plausibly external/event-driven on top of that.

TEST CASES:
- [escalation] Given: a cohort clears its observation window with too little traffic to judge the gate → Expect: HOLD is recorded rather than expanding on the absence of an alert
- [handoff] Given: every cohort in the list deploys and passes its gate → Expect: RLT-250 receives the changed population, exception targets, and the gates each cohort passed — with an explicit note that reaching the population is not yet stability

GAPS:
- P2 (consumer-coverage): Concurrency of two staged rollouts against overlapping target populations is not addressed.

---

## RLT-246 — Rollout Pause Resolution

READINESS: NEEDS_CONTRACT_WORK

WHY:
The in-progress pause case (gate failure or systemic target pattern) is handled with real rigor — paused-is-not-failed, no blind auto-revert of healthy targets, honest partial-unwind reporting. But the journey is also the handoff target for RLT-250's late-regression-on-a-completed-rollout case, and its own actions (a.freeze: 'stop new cohort expansion'; h.resume back to RLT-245's cohort-progression logic) assume an in-progress rollout with cohorts left to freeze or resume — semantics that don't fit a rollout that has already reached 100% of its planned population.

RESPONSIBILITY:
Freezes further cohort expansion when a rollout is paused, preserves the changed/unchanged populations exactly, diagnoses the cause, and routes to resume, rollback, or abandonment.

INSTANCE:
Scope is the rollout plus the changed/unchanged populations 'preserved exactly' at the moment of pause — a strong snapshot-instance concept, no literal instanceKey.

ENTRY:
t.pause (`rollout_pause_triggered`), authoritative, with three confirmed real senders: RLT-245 (gate failure), RLT-249 (systemic target pattern), RLT-250 (late post-completion regression). The trigger is precise about WHAT constitutes a pause but does not differentiate HOW to handle a pause arising from an already-complete rollout versus one still mid-progression.

OWNERSHIP:
a.diagnose is the pivotal step but no role is named as responsible for performing it — acceptable as an unmapped role (SRE/release engineering implied) rather than a hard defect.

ASSIGNMENT / QUEUE:
N/A named explicitly in source.

DATA:
Health evidence and failure signature, sourced from the triggering handoff (RLT-245/RLT-249/RLT-250 each carry what's needed for their own case).

EVIDENCE:
a.diagnose is explicitly scoped to whether the changed population is safe where it stands, distinct from whether the change itself is good — a real, useful distinction the journey states outright.

AUTHORITY / APPROVAL:
c.outcome's three branches (resolve-without-rollback / unsafe-rollback / abandon) share one decision node with no separate authority named for 'abandon,' which is a materially different (business-impact) call than a technical rollback-vs-continue determination.

IDEMPOTENCY:
N/A structurally — state-preservation and diagnosis rather than a duplicate-creation-prone action.

SLA / TIME:
No waits declared in this journey at all — a pause has no self-contained time bound of its own; nothing forces a decision if diagnosis stalls, unlike TRM-102's explicit SLA-driven escalation for a comparable held state.

ESCALATION:
h.rollback → RLT-247 for unsafe targets is clean, but there is no timeout-driven escalation if the pause simply sits undiagnosed.

CANCELLATION / SUPERSESSION:
Excellent, explicit discipline: 'abandoning a rollout is not reverting it... a population that took the change successfully may well stay on it' — a clean, correct non-conflation of stopping future work versus reversing a completed effect.

HANDOFFS:
- h.resume → RLT-245: carries ["the current health evidence and the cohort the rollout stopped at","the explicit fact that progression resumes from the preserved position rather than restarting"]
- h.rollback → RLT-247: carries ["the affected scope, the failure evidence and the changed population as preserved","the explicit fact that a rollback decision has not been made - whether reverting is the right recovery is the next question"]

COMPLETION:
Only x.abandoned is a true exit; healthy/unsafe outcomes hand off rather than terminate locally, consistent with the batch's general pattern.

RESULT / FEEDBACK:
RLT-245 and RLT-249 are both confirmed real senders; RLT-245 is also a confirmed real receiver, correctly closing the pause/resume loop for the in-progress case.

CORRECTION / REOPEN:
x.abandoned's reEntry is honest about the resulting version heterogeneity ('the population is now split across versions deliberately, and that split is visible').

OBSERVABILITY / AUDIT:
rollout_log at every step — good.

CONSUMER COVERAGE:
Classification: active. Three confirmed real senders: RLT-245 (h.pause), RLT-249 (h.rollout), RLT-250 (h.reopen) — the last of which is the source of the flagged semantic mismatch.

TEST CASES:
- [escalation] Given: a late material regression surfaces after RLT-250 already recorded the rollout as CHANGE_STABLE → Expect: RLT-246 is invoked to freeze/preserve/diagnose, but there is no in-progress cohort expansion to freeze and no cohort position to resume via RLT-245 — the workflow's own semantics don't cleanly fit this entry path
- [cancellation] Given: diagnosis determines the changed targets are healthy after the pause cause is resolved → Expect: resumption revalidates current health rather than trusting the pre-pause reading, and progression continues from the preserved cohort position — valid only when a cohort position actually exists to resume from

GAPS:
- P1 (other): RLT-250 hands a post-completion late regression to RLT-246, but RLT-246's own actions (freeze expansion, resume cohort progression via RLT-245) assume an in-progress rollout with cohorts left — there is no branch that skips the freeze/resume-progression semantics for an already-complete population and routes straight to a rollback/retain decision.
- P1 (authority-approval): The decision to 'abandon' a rollout (a business call) and the decision to 'rollback' (a technical call) are both produced by the same undifferentiated diagnosis step with no distinct named authority for each.
- P2 (sla-escalation): No timeout is declared on the pause itself; an undiagnosed pause has no self-contained escalation trigger.

---

## RLT-247 — Rollback Decision

READINESS: NEEDS_CONTRACT_WORK

WHY:
The decision logic (irreversibility check, scoped-vs-full rollback capability) is precise and well-reasoned, but the journey's own text stresses this choice is irreversible if wrong ('a rollback across a migrated schema cannot be undone by rolling forward again') while naming no human authority who signs off on it — the decision is entirely condition-driven with no named approval checkpoint for a call the journey itself describes as high-stakes.

RESPONSIBILITY:
Decides, once a failure threshold is reached, whether rolling back is actually safer than continuing forward — checking irreversibility boundaries and scoped-rollback feasibility before anyone begins reverting anything.

INSTANCE:
Scope is the failing rollout/change and the targets it affects — a coherent decision unit, no literal instanceKey.

ENTRY:
t.threshold (`change_failure_threshold_reached`), authoritative, explicitly insufficient-alone for a single target failing ('a target-scope problem until the evidence says otherwise') — precise, guards against premature escalation. Real sender: RLT-246 (h.rollback), confirmed.

OWNERSHIP:
a.determine (assessing rollback capability/irreversibility) has no named role — an unmapped technical function, acceptable to note as a mapping gap on its own, but compounded by the missing approval authority below.

ASSIGNMENT / QUEUE:
N/A.

DATA:
Known-good prior state, rollback capability, irreversible side effects, data/schema compatibility, forward-recovery option, affected scope — thorough.

EVIDENCE:
N/A in the human-review sense; the irreversibility/capability determination itself functions as the decision's evidentiary basis.

AUTHORITY / APPROVAL:
No human sign-off is named for choosing rollback vs. forward-recovery despite the journey's own explicit framing of this as a high-stakes, direction-irreversible-if-wrong choice — a P0-grade gap given the stated stakes.

IDEMPOTENCY:
N/A for this decision node — execution's idempotency is RLT-248's responsibility.

SLA / TIME:
N/A — no waits; this is a synchronous decision.

ESCALATION:
N/A — no escalation path modeled if the decision stalls.

CANCELLATION / SUPERSESSION:
N/A explicitly.

HANDOFFS:
- h.rollback → RLT-248: carries ["the known-good state, the exact scope to revert and the boundary the rollback must not cross","the explicit fact that the rollback must be verified - a successful command is not a restored system"]
- h.forward → external:operational-resolution: carries ["the failure, the affected scope and the boundary that makes rollback unavailable","the explicit fact that the failed change stays in place and its history is preserved, so forward remediation works from a known position"]

COMPLETION:
No local exits at all — the journey always concludes via handoff, correctly matching its 'decide, don't act' purpose (explicitly distinguished from RLT-248, which performs and verifies).

RESULT / FEEDBACK:
RLT-246 confirmed real sender.

CORRECTION / REOPEN:
N/A — not applicable to a stateless decision node.

OBSERVABILITY / AUDIT:
rollout_log at each action — adequate.

CONSUMER COVERAGE:
Classification: active. RLT-246 is the confirmed real sender via h.rollback.

TEST CASES:
- [approval] Given: a change has crossed an irreversible boundary (schema migration) and the failure threshold is reached → Expect: rollback is refused (forward-only) and the boundary that was crossed is named — but no human authority is recorded as having made or reviewed this determination
- [self-approval] Given: the same automated process that detected the failure also determines rollback safety and routes the recovery → Expect: there is structurally no independent check on a decision the journey itself calls irreversible if chosen wrongly

GAPS:
- P0 (authority-approval): No decision authority is named for choosing rollback versus forward-recovery, despite the journey's own explicit statement that choosing wrong here is irreversible in the other direction ('a rollback across a migrated schema cannot be undone by rolling forward again').

---

## RLT-248 — Rollback Verification

READINESS: READY_WITH_MAPPING

WHY:
One of the strongest-specified journeys in the batch: explicit retry-safe operation identity, correct timeout-is-not-failure discipline, and an exemplary technical-completion-vs-business-completion statement ('rollback complete is not the deployment never having happened'). No P0/P1 gaps found.

RESPONSIBILITY:
Applies a known-good state to the targets in a rollback's scope and proves — via actual verification, not command success — that they are stable there, while preserving the failed change as permanent history.

INSTANCE:
Scope is the rollback operation and the targets it reverts; 'stable operation identity' is used explicitly so a retried rollback reverts once rather than twice.

ENTRY:
t.authorized (`rollback_authorized`), authoritative, requires a known-good state and defined scope. Real sender: RLT-247 (h.rollback), confirmed.

OWNERSHIP:
Fully automated execution/verification; every failure mode (unknown, failed, partial, unrecoverable) hands ownership off explicitly and externally rather than looping — clean.

ASSIGNMENT / QUEUE:
N/A.

DATA:
Known-good state, scope, and the boundary the rollback must not cross — all from RLT-247's handoff.

EVIDENCE:
a.verify checks target state, service/functionality, dependency compatibility, health metrics, and leftover artifacts — matching RLT-244's 'accepted ≠ working' discipline, applied here with the sharp observation that 'rollbacks fail on exactly the dependency and data-shape problems that made them necessary.'

AUTHORITY / APPROVAL:
N/A — authorization already established by RLT-247; this journey executes.

IDEMPOTENCY:
Explicit and strong: 'stable operation identity so a retried rollback reverts once rather than twice,' matching RLT-244's pattern precisely.

SLA / TIME:
w.rollback timeout = 'the rollback window,' honestly sourced; onTimeout → a.unknown, not failure — correctly avoids conflating timeout with failure.

ESCALATION:
h.manual → external:human-in-the-loop-lifecycle for failed/partial rollback, explicitly stating no further automated attempt is made against a population in an unknown or split state — the right automation-stops-on-ambiguity call.

CANCELLATION / SUPERSESSION:
N/A within this journey (it is itself the corrective action).

HANDOFFS:
- h.reconcile → external:external-status-reconciliation: carries ["the scope, the known-good state and what each target last reported","the explicit instruction that nothing further is applied until the population's actual version distribution is known"]
- h.forward → external:operational-resolution: carries ["what was restored, what cannot be, and the legitimate data or commitments that must not be overwritten","the explicit fact that forward remediation is now the path and the failed change remains in the history"]
- h.manual → external:human-in-the-loop-lifecycle: carries ["the exact version distribution across the affected population","the explicit fact that no further automated attempt is being made against a population in an unknown or split state"]

COMPLETION:
x.verified (ROLLED_BACK_VERIFIED) requires actual post-rollback stability verification and explicitly preserves the failed change in history — a clear, citable technical-vs-business-completion statement.

RESULT / FEEDBACK:
RLT-247 confirmed real sender; terminal for this recovery chain (no further downstream handoff needed post-verification).

CORRECTION / REOPEN:
x.verified's reEntry explicitly requires a corrected change to be 'a new rollout with its own eligibility' — a genuinely new episode, not a silent retry of the same change.

OBSERVABILITY / AUDIT:
rollout_log and suppressed_sends both written with specific reasons — thorough.

CONSUMER COVERAGE:
Classification: active. RLT-247 is the confirmed real sender via h.rollback.

TEST CASES:
- [duplicate-creation] Given: a rollback command is retried after a transient failure → Expect: the same stable operation identity is reused so the target is reverted once, not twice
- [completion] Given: the rollback command succeeds but post-rollback verification finds the service unhealthy → Expect: this is not recorded as ROLLED_BACK_VERIFIED — the command succeeding is explicitly distinguished from the system actually working
- [reopen] Given: a corrected version of the failed change is later prepared → Expect: it is evaluated as a new rollout with its own eligibility, with the earlier failure part of what its gates are set against — not a silent retry

GAPS:
- P2 (other): No specific role/queue is named for h.manual's human-in-the-loop-lifecycle handoff (which team handles a failed or split-state rollback) — a mapping item.

---

## RLT-249 — Target Change Recovery

READINESS: READY_WITH_MAPPING

WHY:
Evidence-based promotion to rollout scope ('promotion happens on pattern evidence rather than on failure count') is exemplary and directly matches the round's own anti-count-based-promotion discipline. Idempotent, bounded retry is well specified. No P0/P1 gaps found.

RESPONSIBILITY:
Recovers a single target that failed to take a change — diagnosing, bounded-retrying, or accepting it as a named exception — while watching for evidence that the failure is actually systemic across targets.

INSTANCE:
Scope is the individual target and its failed attempt, target-scope by default; promotion to rollout scope happens only on pattern evidence, not failure count. No literal instanceKey.

ENTRY:
t.failed (`individual_target_change_failed`), authoritative. Real sender: RLT-244 (h.target-failure), confirmed.

OWNERSHIP:
Fully automated diagnosis/retry/promotion; a.must-upgrade correctly hands ownership to external:human-in-the-loop-lifecycle once automation is exhausted and the target cannot safely stay behind.

ASSIGNMENT / QUEUE:
N/A named within this journey; the human-in-the-loop queue lives outside its scope.

DATA:
Compatibility, offline/unreachable status, local configuration, resource shortage, corrupt state, dependency mismatch — thorough diagnosis inputs.

EVIDENCE:
c.systemic explicitly requires 'the same signature, cause or class' across multiple targets before promotion — a direct, correct application of the round's evidence-of-pattern-over-failure-count discipline.

AUTHORITY / APPROVAL:
N/A — rule/evidence-driven at target scope, appropriately no human gate needed for reversible, bounded retries.

IDEMPOTENCY:
Explicit: a.retry uses 'the same operation identity so a change that actually applied is not applied twice' — consistent with RLT-244/RLT-248's vocabulary.

SLA / TIME:
c.budget checks whether 'retry budget remains' — a bounded concept named without inventing a specific numeric count, correctly deferring the actual number to policy.

ESCALATION:
h.rollout → RLT-246 on confirmed pattern evidence — correctly differentiated from RLT-245's cohort-gate pathway, both converging on the same centralized pause-resolution journey.

CANCELLATION / SUPERSESSION:
a.exception is a deliberate, explicitly visible 'give up gracefully at target scope' outcome (matches the guardrail 'the exception population remains observable and countable') — good anti-silent-omission discipline, echoing the same theme in RLT-241 and RLT-250.

HANDOFFS:
- h.rollout → RLT-246: carries ["the shared failure signature and the targets exhibiting it","the explicit fact that this reached rollout scope through evidence of a pattern rather than through a count of failures"]
- h.remediate → external:human-in-the-loop-lifecycle: carries ["the target, its diagnosis and why remaining on the previous version is not acceptable","the explicit fact that automated attempts are exhausted and the rollout itself is unaffected"]

COMPLETION:
Two exits: x.retrying (bounded, explicitly non-terminal, budget decrements each pass) and x.exception (TARGET_EXCEPTION, explicitly visible and countable, not silently dropped).

RESULT / FEEDBACK:
RLT-244 confirmed real sender.

CORRECTION / REOPEN:
x.exception's reEntry explicitly guarantees the target is 'picked up by this change or the next one rather than staying behind permanently' — good non-abandonment guarantee. x.retrying's bounded loop is well-specified with no infinite-retry risk.

OBSERVABILITY / AUDIT:
rollout_log throughout — good.

CONSUMER COVERAGE:
Classification: active. RLT-244 is the confirmed real sender via h.target-failure.

TEST CASES:
- [escalation] Given: the same failure signature appears on forty different targets → Expect: this is promoted from a target problem to a rollout problem (h.rollout to RLT-246) rather than handled as forty separate individual retries
- [duplicate-creation] Given: a retry is issued for a target whose earlier attempt may have actually applied → Expect: the same operation identity is reused so the change is not applied twice
- [cancellation] Given: retry budget is exhausted and the target cannot safely stay on the previous version → Expect: the target is flagged as must-upgrade and handed to a human-in-the-loop process, with automated attempts explicitly exhausted rather than looping

GAPS:
- P2 (other): No specific role/queue is named for h.remediate's human-in-the-loop-lifecycle handoff.

---

## RLT-250 — Change Stability Review

READINESS: NEEDS_CONTRACT_WORK

WHY:
The completion/stability separation is exemplary and the retention discipline is sound, but a late material regression is routed (h.reopen) to RLT-246 — whose own actions assume an in-progress rollout with cohorts to freeze/resume, a mismatch this journey's own text implicitly acknowledges ('the rollout is complete, so pausing expansion is not the remedy'). No authority is named for judging whether a regression is 'material.'

RESPONSIBILITY:
Watches a change that has reached its full planned population for a defined observation window, converting deployment coverage into an actual stability claim, and retains the previous version until recovery and audit needs are satisfied.

INSTANCE:
Scope is the completed rollout, the changed population, and the named exception targets. Explicitly distinguishes completion from stability as different claims — a real strength.

ENTRY:
t.reached (`planned_population_reached_changed_state`), authoritative, explicitly insufficient-alone for a dashboard reporting complete ('reports coverage rather than health') — directly names the exact anti-pattern this round cares about. Real sender: RLT-245 (h.complete), confirmed.

OWNERSHIP:
No role is named for judging whether a regression found during observation is 'material' (c.regression: correctness/availability/business-outcome impact vs. noise/known-issue) — this classification call has no named decision authority.

ASSIGNMENT / QUEUE:
N/A named explicitly.

DATA:
Regression signals and critical failure evidence during the observation window.

EVIDENCE:
Explicitly distinguishes coverage-reporting from health-evidence throughout — one of the clearest statements of this distinction in the batch, directly citable.

AUTHORITY / APPROVAL:
c.deprecate requires 'the recovery and audit retention... is satisfied' before the previous version can be deprecated, but no role is named as confirming that audit retention requirement is actually met — a minor mapping gap.

IDEMPOTENCY:
N/A — observation/decision workflow, not a duplicate-creation-prone action.

SLA / TIME:
w.observe timeout = 'the post-change observation window,' honestly sourced; onTimeout → a.stable, treating silence during a live-serving observation window as meaningful absence-of-regression evidence — a materially different and correctly-reasoned epistemic situation from RLT-245's under-trafficked-cohort concern, not a contradiction of it.

ESCALATION:
h.reopen → RLT-246 on a material late regression — this is the flagged mismatch (see gaps).

CANCELLATION / SUPERSESSION:
a.retain is a deliberate delayed-cleanup pattern ('late is exactly when rollbacks are actually needed') rather than a cancellation — well-reasoned.

HANDOFFS:
- h.reopen → RLT-246: carries ["the regression, when it appeared and across which part of the changed population","the explicit fact that the rollout is complete, so pausing expansion is not the remedy - the question is what to do with a population that already has it"]
- h.deprecate → external:termination-lifecycle: carries ["the version, the confirmation that no target runs it and that retention is satisfied","the change lineage, which stays auditable regardless of whether the artifact is retired"]

COMPLETION:
x.stable (CHANGE_STABLE) explicitly names the exception population alongside it rather than omitting it — the third recurrence in this batch of the same 'named exception, not silent omission' discipline (also seen in RLT-241 and RLT-249), worth noting as a consistent cross-journey strength.

RESULT / FEEDBACK:
RLT-245 confirmed real sender via h.complete.

CORRECTION / REOPEN:
x.stable's reEntry allows the previous version to retire on its own terms and a later regression to reopen recovery against a population that 'still has somewhere to go back to' — good intent, undermined in practice by the target-semantics mismatch noted above.

OBSERVABILITY / AUDIT:
rollout_log throughout — good.

CONSUMER COVERAGE:
Classification: active. RLT-245 is the confirmed real sender via h.complete.

TEST CASES:
- [escalation] Given: a material regression surfaces after CHANGE_STABLE was already recorded → Expect: RLT-246 is invoked via h.reopen, but RLT-246's freeze-expansion / resume-cohort-progression semantics don't map cleanly onto a rollout with no remaining cohorts to freeze or resume
- [completion] Given: the observation window elapses with no material regression → Expect: CHANGE_STABLE is recorded with the exception population explicitly named alongside it, not omitted from the count

GAPS:
- P1 (handoff-provenance): h.reopen routes a post-completion late regression to RLT-246, whose own action set (freeze new cohort expansion, resume cohort progression via RLT-245) does not fit a rollout that has already reached its full planned population — see the paired finding under RLT-246.
- P1 (authority-approval): No role is named for judging whether a late regression is 'material' — the classification determines whether the previous version stays retained and recovery reopens, a consequential call with no named decision authority.

---

## RSK-191 — Policy Evaluation

READINESS: READY_WITH_MAPPING

WHY:
The evaluation logic is complete and disciplined: version determinability is checked before evaluation, non-deterministic outcomes are explicitly routed to DEC-181 rather than guessed, and both pass and block are recorded auditably. A company mainly needs to wire the policy-version source and the decision-point call sites; no canonical logic gap blocks safe implementation.

RESPONSIBILITY:
Decide whether one specific action is permitted under the policy version that actually governs it, at decision time — not a risk score, not a standing clearance.

INSTANCE:
No instanceKey declared (predates the convention). Implied identity per entity.note: one evaluation per (action, actor/entity, decision point) — 'a question about this action rather than a standing judgment about the entity.' Not a durable case; each protected action gets its own point-in-time evaluation.

ENTRY:
Trigger t.point (protected_action_reaches_policy_decision_point), source authoritative. Entry is precise: requires an action policy actually governs, arriving at its decision point; explicitly rejects a risk score as insufficient alone. Entry is authoritative, not inferred or hand-waved.

OWNERSHIP:
The automated policy engine owns the evaluation outright. Ownership only transfers when the version can't be determined or the rules produce no deterministic outcome — both route to DEC-181 (h.review) as the sole named decision authority. No human touches the pass/block path.

ASSIGNMENT / QUEUE:
N/A — no queue; a synchronous rule evaluation, not routed work.

DATA:
Applicable policy set is derived from action, entity, context, effective time and jurisdiction/domain against current authoritative state — well-sourced. No data is only-in-prose or unconstructable.

EVIDENCE:
N/A — this is rule application against declared facts, not an evidentiary review; guardrails explicitly bar substituting a risk score for a rule check.

AUTHORITY / APPROVAL:
No approval step; decision authority is the deterministic policy engine itself for pass/block, and DEC-181 for anything the rules don't determine. No self-approval risk — the requester of the protected action has no role in evaluating it.

IDEMPOTENCY:
No idempotencyKey on any action, and none is declared for the whole batch. Low real risk here: every action only appends to policy_log and this isn't durable work creation — a re-run produces a duplicate log line, not a duplicate business effect. Worth noting, not blocking.

SLA / TIME:
N/A — no wait nodes; the evaluation is synchronous at the decision point.

ESCALATION:
N/A — single non-looping handoff to DEC-181 on undetermined version or non-deterministic outcome; no ladder, no loop risk.

CANCELLATION / SUPERSESSION:
N/A — nothing durable to cancel. x.block itself is not a standing sanction: reEntry states the same action is evaluable again once the requirement is met or an exception (RSK-198) is granted.

HANDOFFS:
- h.review → DEC-181: carries ["the action, the policy set considered and exactly where the rules stopped","the explicit fact that no outcome was invented and nothing has been refused"]

COMPLETION:
x.pass / x.block are both explicitly non-standing per-action outcomes (reEntry text says so directly) — the workflow does not conflate 'this action passed' with any broader clearance, correctly avoiding an OPS-130-style overclaim.

RESULT / FEEDBACK:
Consumed synchronously by whatever code path reached the decision point; no async result-propagation step is needed for pass/block. The undetermined path hands a clean, unambiguous record to DEC-181 rather than reporting a fabricated rejection.

CORRECTION / REOPEN:
Not applicable to pass; block explicitly reopens (re-evaluable) once the requirement is met or an exception is granted — never a permanent mark.

OBSERVABILITY / AUDIT:
Every path appends to policy_log with the version evaluated and, for blocks, the specific rule and requirement that failed — solid minimum audit trail (what was checked, by which version, with what result).

CONSUMER COVERAGE:
Classification: event-driven. Zero real handoff consumers in the dump (RSK-200 references it only via prose distinctFrom). The trigger event (protected_action_reaches_policy_decision_point) is plausibly emitted broadly by any protected-action code path system-wide, matching the CMS-201/CON-34/OPS-121 event-driven precedent rather than an orphan.

BOUNDARY CANDIDATE:
Suspected correct surface: runtime-mechanism (confidence: medium). Zero human ownership, zero queue, a fully synchronous deterministic gate with only a single escape hatch to DEC-181 — the shape matches the closed Runtime Mechanism round's typical entries more than a human-executed operational workflow. Impact if changed: Low — reclassification wouldn't change the required implementation semantics, only which round's checklist it's graded against.

TEST CASES:
- [handoff] Given: the governing policy version cannot be determined for the action's effective time → Expect: no evaluation occurs; the action, policy set considered, and the explicit 'nothing invented' fact hand off to DEC-181 rather than defaulting to the current version
- [completion] Given: the applicable rules permit the action → Expect: POLICY_PASS is recorded with the version evaluated; the pass does not carry forward as a standing clearance for a later action
- [handoff] Given: the rules produce no deterministic outcome (neither pass nor an explicit block condition) → Expect: REVIEW_REQUIRED is recorded (not a rejection) and hands to DEC-181

GAPS:
- P2 (idempotency): No idempotencyKey declared on any action; acceptable here since every action is append-only logging with no durable work creation, but worth confirming at implementation that concurrent re-evaluations of the same action can't race on the log in a way that obscures which record is authoritative.
- P2 (handoff-provenance): DEC-181's own required-fields contract isn't visible in this batch, so h.review's carries can't be independently confirmed sufficient.

---

## RSK-192 — Risk Evidence Assessment

READINESS: NEEDS_CONTRACT_WORK

WHY:
The evidentiary discipline (model output ≠ fact, monitoring ≠ restriction, proportionality) is exemplary. But the workflow's own entity note states its central invariant — 'one case per correlated risk' — and nothing in a.case enforces that: there's no declared idempotencyKey or atomic create-if-absent semantics preventing two concurrent signals about the same underlying risk from opening two separate case records, which could then reach contradictory conclusions (one clears while the other restricts) about the same evidence.

RESPONSIBILITY:
Correlate a risk signal against authoritative context and turn it into a state change no larger than the evidence supports — clear, monitor, or open a case — without assuming a signal is confirmed misconduct.

INSTANCE:
No instanceKey (predates convention). Implied identity per entity.note: one case per correlated risk, scoped to what the evidence is actually about (a flagged transaction stays a flagged transaction, not a flagged customer) — accumulating signals rather than opening a new case per signal.

ENTRY:
Trigger t.signal (risk_signal_received), source inferred. Requires a meaningful signal plus a recorded source (detection/monitoring/model/external/dispute) — explicitly insufficient alone: unusual behaviour or a single threshold crossing. Entry is precise about what does NOT qualify.

OWNERSHIP:
Fully automated correlation and routing; no named team owns an open case during MONITOR. Consequential decisions (material threshold → restriction, or → DEC-181 for judgment) are policy- or evidence-derived, not human-assigned. Who is accountable for a case sitting in the monitor wait isn't stated — reasonable for an automated evidence-accumulation state, but worth flagging under this round's 'flag ambiguous ownership aggressively' instruction.

ASSIGNMENT / QUEUE:
N/A — no queue; evidence-driven condition routing, escalating to DEC-181/RSK-193 only via handoff.

DATA:
a.correlate uses actor history, state of the concerned entity, other live signals, and what the signal measures — well-sourced from authoritative context, with the model output explicitly demoted to 'an estimate about a person, never a fact.'

EVIDENCE:
Strong discipline: distinguishes context that explains a signal away (a.clear) from evidence that merely fails to reach a threshold (a.monitor) from evidence crossing a defined threshold (a.case). Guardrails explicitly bar collapsing monitoring into restriction on one weak signal.

AUTHORITY / APPROVAL:
c.route allows a fully automated 'scoped precautionary restriction' (h.restrict) when evidence is material enough, with no separate human sign-off required for that path — only judgment-dependent cases go to DEC-181. This is policy-derived authority, consistent with RSK-193 downstream re-checking authority before applying the restriction, so it isn't a bare gap, but it means RSK-192 itself never independently confirms an authority for the automatic-restriction branch.

IDEMPOTENCY:
The central defect: a.case (case creation) has no idempotencyKey and no stated atomic create-if-absent check against an already-open case for the same scope, despite the entity note's explicit 'one case per correlated risk' invariant. Two concurrent signals about the same risk could fragment into two cases with independently reachable, potentially contradictory outcomes.

SLA / TIME:
w.monitor timeout = 'the monitoring horizon defined for this signal type' — correctly deferred to policy, not invented. onTimeout → x.monitored-out, avoiding an indefinite open question.

ESCALATION:
Monitor → case escalation happens on accumulated evidence crossing a threshold (c.monitored), not on elapsed time; no loop risk. Escalation to DEC-181 (h.review) is a single clean handoff.

CANCELLATION / SUPERSESSION:
No explicit cancel action; a.clear-monitored explicitly releases the monitoring state and anything suppressed while it was open, while keeping the case and its signals readable — good 'stop future work, don't erase history' discipline.

HANDOFFS:
- h.restrict → RSK-193: carries ["the correlated evidence, its provenance and the specific scope the risk touches","the explicit fact that this is evidence rather than confirmed misconduct, which bounds how wide the restriction may be"]
- h.review → DEC-181: carries ["the full evidence and its provenance, so the reviewer sees what the model saw","the explicit fact that nothing has been restricted and no conclusion has been drawn about the actor"]

COMPLETION:
RSK-192's own job is 'correlate and route,' not 'resolve the risk' — its purpose statement makes this explicit. CLEAR/MONITOR outcomes are correctly scoped as 'nothing was restricted,' and case/restrict/review handoffs correctly defer actual resolution downstream (OPS-130 discipline respected: technical routing decision here is not confused with business resolution, which happens in RSK-193/DEC-181).

RESULT / FEEDBACK:
FIN-139 is a confirmed real, well-formed inbound consumer (dispute outcomes as risk signals). RSK-194, RSK-199, INC-251 reference it only in prose (distinctFrom), not via handoff.

CORRECTION / REOPEN:
x.cleared / x.cleared-monitored / x.monitored-out all explicitly non-conviction: reentry text repeatedly states a later signal is judged fresh, with the prior record as context rather than a finding against the actor.

OBSERVABILITY / AUDIT:
risk_log appended at every transition, including the reason for a clear; suppressed_sends explicitly recorded when a monitored case clears and releases held communications. Solid trail, though no field records who/what confirmed a threshold crossing (system-only vs. human-reviewed) beyond the trigger's own source label.

CONSUMER COVERAGE:
Classification: active. FIN-139 is a real, verified inbound handoff consumer (dispute outcomes routed in as risk signals, matching RSK-192's own trigger evidence requirements). RSK-194/RSK-199/INC-251 are prose-only cross-references.

TEST CASES:
- [duplicate-creation] Given: two correlated risk signals about the same actor/transaction arrive concurrently before either resolves → Expect: one case accumulates both signals; the workflow does not open two independent case records that could reach contradictory conclusions
- [handoff] Given: combined evidence crosses a material threshold → Expect: RSK-193 receives the correlated evidence, its provenance, and the explicit fact that this is evidence rather than confirmed misconduct
- [escalation] Given: a monitored signal's horizon passes with no threshold reached → Expect: the state does not persist against the actor; a recurrence is assessed fresh

GAPS:
- P0 (idempotency): a.case has no idempotencyKey or atomic create-if-absent check against an already-open case for the same evidence scope, directly contradicting the entity note's own 'one case per correlated risk' invariant and risking two active cases reaching contradictory decisions.
- P2 (ownership): No named accountability for a case sitting in MONITOR — reasonable for an automated accumulation state, but worth confirming during implementation whether periodic review of long-monitored cases needs an owner.

---

## RSK-193 — Risk Restriction Management

READINESS: READY_WITH_MAPPING

WHY:
Authority is gated before any restriction is applied, minimum-scope discipline is explicit, restoration is rebuilt from current entitlements rather than a stale snapshot, and terminal vs. temporary states are kept distinct. The one real gap — no stated coordination when multiple risk sources restrict the same capability concurrently — is a mapping-level concern for a company's case-management layer, not a logic defect.

RESPONSIBILITY:
Apply the smallest restriction the correlated risk evidence justifies, scoped to the specific capability or action implicated, and hold a stated path back to release.

INSTANCE:
No instanceKey (predates convention). Implied identity: the risk case paired with the specific capability/action restricted (entity.note explicitly separates 'why' — owned by risk — from 'what is switched off' — owned by the access lifecycle).

ENTRY:
Trigger t.threshold (risk_threshold_requiring_intervention_reached), authoritative, arriving via handoff from RSK-192, RSK-194, or RSK-200 (all three verified consistent in carries). Entry is precise and always authoritative-sourced.

OWNERSHIP:
c.authority gates whether a policy or granted authority actually covers restricting this scope before anything is applied — if not, hands to DEC-181 rather than assuming authority. No named team owns a restriction while open beyond that gate; resolution (release/terminal/review) is state-driven via w.resolution, not human-queued.

ASSIGNMENT / QUEUE:
N/A — no queue; state-machine restriction lifecycle, escalating to DEC-181 only when authority is absent or judgment is needed.

DATA:
a.scope determines risk scope, implicated capability, authority, and duration/review condition up front — a restriction with no stated release condition is explicitly treated as a defect to avoid ('becomes permanent by nobody's decision').

EVIDENCE:
N/A — evidence was already established by the upstream signal/violation workflow; RSK-193 acts on it rather than independently gathering it.

AUTHORITY / APPROVAL:
c.authority is a genuine gate, not a rubber stamp — 'not established' routes to DEC-181 rather than proceeding. h.terminal explicitly requires 'an authorized decision' for anything ending the relationship or capability permanently.

IDEMPOTENCY:
No idempotencyKey on a.apply/a.release, but each is a single state transition on an already-identified case+capability instance, not new-work creation — lower risk than RSK-192/RSK-198's creation-time gaps.

SLA / TIME:
w.resolution timeout = 'the review condition or maximum restriction duration policy defines' — correctly deferred, not invented. onTimeout → h.review, directly preventing the guardrail-named failure mode ('a restriction nobody revisits becomes a termination without a decision').

ESCALATION:
Timeout and unauthorized-restriction both route cleanly to DEC-181; no loop, no priority-bump semantics needed given the single-step handoff design.

CANCELLATION / SUPERSESSION:
a.release explicitly rebuilds restoration 'from current entitlements rather than from a snapshot taken when the restriction went on' — correct discipline against restoring something that expired underneath the restriction. h.terminal preserves restriction history rather than replacing it with the outcome.

HANDOFFS:
- h.review → DEC-181: carries ["the evidence, its provenance and the restriction currently in force","the explicit fact that this is a temporary state rather than an adverse finding, and that no conclusion about the actor has been reached"]
- h.terminal → external:termination-lifecycle: carries ["the decision, its authority and the evidence it was made on","the explicit fact that the restriction history and its basis are preserved rather than replaced by the outcome"]

COMPLETION:
x.released explicitly ties closure to 'what cleared it' being recorded — the case doesn't close on a bare timer or an assumption, only on an actual clearing event or authorized decision.

RESULT / FEEDBACK:
Real, verified consumers: RSK-192, RSK-194, RSK-200 all hand off in with matching carries. RSK-196 and the customer-surface RSK-273 reference it only in prose.

CORRECTION / REOPEN:
x.released reEntry explicitly treats new evidence as a new assessment, with the prior clearing record as context that stops the same evidence being re-litigated.

OBSERVABILITY / AUDIT:
risk_log entries at every transition — scope, authority basis, minimum restriction chosen, resolution outcome. A real operator could reconstruct why a restriction exists and what would lift it.

CONSUMER COVERAGE:
Classification: active. RSK-192, RSK-194, and RSK-200 are all real, carries-verified inbound handoff senders; RSK-196 and RSK-273 reference it only via prose distinctFrom.

TEST CASES:
- [concurrent-claim] Given: two independent risk cases (e.g. RSK-192 and RSK-194) both target the same capability on the same entity around the same time → Expect: the workflow does not silently let one instance's release lift protection the other instance still requires — not addressed explicitly in source
- [escalation] Given: no authority covers restricting this scope → Expect: hands to DEC-181 rather than applying the restriction anyway
- [completion] Given: the restriction clears → Expect: release rebuilds capability restoration from current entitlements, not from what was true when the restriction was applied

GAPS:
- P1 (consumer-coverage): No stated mechanism to detect or coordinate an already-active restriction on the same capability/entity when a second risk case (from RSK-192, RSK-194, or RSK-200) independently reaches the same capability — release from one instance could interact unpredictably with a still-open second instance.

---

## RSK-194 — Policy Violation Validation

READINESS: READY_WITH_MAPPING

WHY:
Version-effective-time discipline is unusually careful (retroactive application requires an explicit governing rule, never a default), consequence is sourced from policy rather than invented, and severity classification explicitly resists treating ordinary misconfiguration as misconduct. The remaining gaps are about who/what authoritatively confirms remediation and duplicate-detection dedup — real but mapping-level, not logic defects.

RESPONSIBILITY:
Establish whether an identifiable rule was actually breached, against the policy version that governed the action at the time, before any consequence follows — detection alone is never treated as confirmation.

INSTANCE:
No instanceKey (predates convention). Implied identity per entity.note: the violation case, the entity/action it concerns, AND the policy version it's judged under — version is explicitly part of the identity, not a side attribute.

ENTRY:
Trigger t.detected (potential_policy_violation_detected), source inferred. Requires an action/state appearing to breach an identifiable policy; explicitly insufficient alone: a risk signal or an unusual pattern with no rule behind it.

OWNERSHIP:
Automated identify→evaluate→classify pipeline; DEC-181 owns judgment only where consequence, version, or remediation-outcome isn't determinable from policy. No named owner for a case sitting in w.remediation — who confirms 'the entity is back within the applicable rule' (c.remediated) isn't specified as system-verified vs. self-attested vs. human-reviewed.

ASSIGNMENT / QUEUE:
N/A — no queue; policy-derived routing to remediation/restriction/termination/review.

DATA:
a.identify captures policy, effective version, action, evidence, and affected scope up front — thorough and correctly scoped to what the version was at the time of the action, not the current version by default.

EVIDENCE:
Strong discipline: detection (inferred) is explicitly distinguished from confirmation (c.confirmed evaluates evidence against the applicable version); classification acknowledges most violations are configuration or misunderstanding rather than intent, directly guarding against over-penalizing.

AUTHORITY / APPROVAL:
c.consequence sources the response (remediate/restrict/terminate/review) strictly from what governing policy defines, with an explicit 'authorized judgment' fallback to DEC-181 when policy is silent — no invented default consequence. h.terminal requires the policy to explicitly attach a terminal consequence.

IDEMPOTENCY:
No idempotencyKey on violation-case creation; if two detection sources flag the same underlying violation, nothing in the graph prevents two independently-judged cases for one violation (lower severity than RSK-192's case-fragmentation risk since a P1, not P0 — consequences here are remediation/restriction decisions, not a duplicated financial effect, but could still produce conflicting remediation demands).

SLA / TIME:
w.remediation timeout = 'the remediation deadline the policy defines' — correctly deferred. onTimeout → h.review, avoiding an indefinitely-open unresolved violation.

ESCALATION:
Failed remediation routes automatically to h.restrict (policy-derived, since the remediation requirement itself came from policy, not judgment) rather than back to DEC-181 — a reasonable, non-looping design. Undetermined version/consequence/remediation-outcome cases route cleanly to DEC-181.

CANCELLATION / SUPERSESSION:
x.cleared / x.resolved both allow reentry; a recurrence explicitly opens 'a new case linked to this one' rather than reopening or silently rewriting the original — correct episode discipline.

HANDOFFS:
- h.restrict → RSK-193: carries ["the rule, its version, the evidence and the scope actually affected","the explicit fact that this is a rule breached rather than misconduct established, which bounds the restriction"]
- h.review → DEC-181: carries ["the policy, the evidence and exactly where the rules stopped short of a consequence","the explicit fact that no consequence was invented from outside the policy"]
- h.terminal → external:termination-lifecycle: carries ["the rule, its version, the evidence and the specific provision requiring termination","the full violation history, preserved rather than replaced by the outcome"]

COMPLETION:
x.resolved explicitly preserves the violation history even after remediation ('a pattern of the same violation is worth seeing') — correctly distinguishes 'this instance remediated' from 'no risk of recurrence,' an OPS-130-consistent completion discipline.

RESULT / FEEDBACK:
DEC-267 (customer surface) and RSK-192 reference RSK-194 only in prose; no real inbound handoff consumer is present in this batch.

CORRECTION / REOPEN:
Recurrence is modeled as a new linked case, not a reopen of the closed one — preserves the first record while making repetition visible.

OBSERVABILITY / AUDIT:
policy_log entries capture policy/version/action/evidence/scope, classification reasoning, and remediation terms — a real operator could reconstruct the full basis for any consequence.

CONSUMER COVERAGE:
Classification: event-driven. No real handoff consumers in the dump; DEC-267 and RSK-192 reference it only via prose. The trigger (potential_policy_violation_detected) is plausibly emitted by a detection/monitoring subsystem outside the modeled journey graph — matching the event-driven precedent rather than orphan.

TEST CASES:
- [handoff] Given: the evidence does not establish a breach of the applicable version → Expect: no violation is recorded (x.cleared), not a soft rejection
- [duplicate-creation] Given: two detection sources flag the same underlying violation concurrently → Expect: not addressed in source — risk of two independently-judged cases for one violation
- [escalation] Given: remediation fails to bring the entity back into compliance → Expect: routes to h.restrict directly, since the remediation requirement itself was policy-derived rather than a judgment call

GAPS:
- P1 (authority-approval): c.remediated ('did the remediation resolve the violation') has no stated authority — whether confirmation is automated/system-verified, self-attested, or requires a human check isn't specified, despite this being the gate that determines whether a violation closes cleanly or escalates to restriction.
- P2 (idempotency): No dedup guard against two detection sources opening independent cases for the same underlying violation.

---

## RSK-195 — Compliance Requirement Verification

READINESS: READY_WITH_MAPPING

WHY:
The core discipline is sound: evidence reuse before re-asking, scoped blocking rather than blanket suspension, and no invented deadline consequences (undefined outcomes explicitly go to DEC-181). The one real structural gap is that the workflow's own stated relationship to IDN-82 (the verification-collection mechanism it says it 'uses') is never actually modeled as a handoff in either direction — a real but implementation-mapping-level fix.

RESPONSIBILITY:
Hold one mandatory compliance requirement as its own state, reusing existing valid evidence where possible, and blocking only the specific process that actually depends on it — never a general suspension.

INSTANCE:
No instanceKey (predates convention). Implied identity: the compliance requirement paired with the specific dependent process (entity.note: satisfied is scoped to purpose and validity, never transfers to a different requirement).

ENTRY:
Trigger t.necessary (compliance_requirement_becomes_necessary), authoritative, requires 'an applicable compliance requirement that a specific process cannot proceed without' — explicitly distinguished from generic onboarding data collection.

OWNERSHIP:
Automated define→reuse/initiate→satisfied/cannot pipeline; c.dependent and c.deadline both defer the consequence to what governing rules actually say, escalating to DEC-181 rather than defaulting when rules are silent. No named owner for the requirement while a dependent process sits blocked.

ASSIGNMENT / QUEUE:
N/A — no queue; rule-driven blocking with DEC-181 as the sole escalation path.

DATA:
a.define scopes the requirement to exactly what the process needs, explicitly rejecting 'collect everything available' as a data grab that creates unplanned retention obligations.

EVIDENCE:
c.existing correctly checks for currently-valid held evidence before requesting anything new, avoiding the guardrail-named failure mode of re-asking for what's already held.

AUTHORITY / APPROVAL:
c.dependent / c.deadline both source the block/close/review consequence strictly from what 'governing rules say' — no default is chosen when rules are silent, correctly routing to DEC-181 instead.

IDEMPOTENCY:
No idempotencyKey; two concurrent triggers for the same requirement+process pair aren't explicitly deduplicated, though the low-frequency nature of compliance-requirement triggers makes this a lower-severity gap.

SLA / TIME:
w.requirement timeout = 'the deadline the requirement defines, where one exists' — explicitly conditional rather than invented. onTimeout → c.deadline, which itself defers to policy before assuming any consequence.

ESCALATION:
Both c.deadline and c.dependent explicitly avoid defaulting when rules don't state a consequence, routing to DEC-181 instead — strong discipline against inventing a default.

CANCELLATION / SUPERSESSION:
x.blocked / x.closed both carry explicit reentry semantics (block releases + dependent process revalidates; closed process gets a fresh attempt assessed on current terms) — no silent resume assumed.

HANDOFFS:
- h.resume → external:operational-resolution: carries ["the requirement, its scope and its validity period","the explicit instruction that the dependent process revalidates on its own terms - this requirement clearing does not make it otherwise valid"]
- h.review → DEC-181: carries ["the requirement, what was attempted and the process depending on it","the explicit fact that no blocking or closure consequence was invented"]

COMPLETION:
'Satisfied' is explicitly scoped ('the same evidence does not satisfy a different requirement') and completion of the requirement is correctly kept distinct from completion of the dependent process — h.resume's carries explicitly say the dependent process must revalidate rather than assume it's now valid.

RESULT / FEEDBACK:
DOC-211 references it only in prose (distinctFrom); no real inbound or outbound handoff consumer is confirmed in this batch beyond the unmodeled IDN-82 relationship noted above.

CORRECTION / REOPEN:
x.closed reEntry explicitly treats a later attempt as fresh, unencumbered by the prior closure — correct discipline against a stale mark persisting.

OBSERVABILITY / AUDIT:
compliance_log entries capture the requirement definition, reuse decisions, satisfaction basis, and block/close reasoning — solid.

CONSUMER COVERAGE:
Classification: event-driven. DOC-211 references it only via prose. The trigger (compliance_requirement_becomes_necessary) is plausibly emitted broadly by many onboarding/product processes across the system rather than by one specific journey, consistent with an event-driven entry point.

TEST CASES:
- [handoff] Given: existing authoritative evidence already covers this requirement within its validity → Expect: the requirement is marked satisfied and reused; nothing is re-requested
- [handoff] Given: the requirement cannot be met and governing rules define no consequence for the dependent process → Expect: hands to DEC-181 rather than defaulting to block or close
- [completion] Given: the requirement is satisfied and the dependent process resumes → Expect: the dependent process revalidates its own other requirements rather than being assumed fully valid

GAPS:
- P1 (handoff-provenance): RSK-195's own distinctFrom prose claims it delegates verification collection to IDN-82, but no handoff node in either journey's structured graph actually connects them — a.initiate's transition to w.requirement doesn't name what raises or resolves it. A real implementer cannot construct this integration from the canonical data alone.
- P2 (idempotency): No dedup guard against duplicate concurrent triggers for the same requirement+process pair.

---

## RSK-196 — Compliance Hold Resolution

READINESS: READY_WITH_MAPPING

WHY:
The hold/resume discipline is careful — deadlines aren't silently reset, commitments made before the hold keep being honored, and resumption rebuilds from current entitlements rather than restoring a snapshot. The genuine open questions are ownership during an open hold and coordination if a second, independent hold is concurrently active on the same entity — both real but not logic-breaking.

RESPONSIBILITY:
Pause only the operations a compliance or policy question makes unsafe, preserve existing commitments and deadlines underneath the hold, and resume from current state rather than a stale snapshot once it resolves.

INSTANCE:
No instanceKey (predates convention). Implied identity: entity.scope names 'the entity or process on hold, and the hold acting on it' — one hold instance per applied authority, with the underlying entity's obligations continuing to exist independently underneath it.

ENTRY:
Trigger t.applied (policy_or_compliance_hold_applied), authoritative, requiring 'an authoritative policy or compliance hold, with an authority behind it' — unlike RSK-193, authority is asserted at entry (part of the trigger's own evidence requirement) rather than separately gated by a condition node; a reasonable design choice given holds are described as already-authorized when they arrive.

OWNERSHIP:
Fully automated record→pause→preserve→deadlines pipeline. No team or role is named as accountable for an open hold beyond the automated resolution watch (w.hold) and the DEC-181 escalation on timeout or judgment-need — worth flagging per this round's instruction to surface ambiguous ownership aggressively, even where the flow itself is sound.

ASSIGNMENT / QUEUE:
N/A — no queue; state-driven hold lifecycle.

DATA:
a.record captures reason, scope, authority, effective time, affected/allowed operations, and resolution condition — explicit rejection of a hold with no stated way out.

EVIDENCE:
N/A — RSK-196 applies an already-authoritative hold; it doesn't independently weigh evidence for or against applying it.

AUTHORITY / APPROVAL:
Authority for the hold itself is asserted at trigger entry (required evidence); DEC-181 is the fallback authority for review or terminal-outcome decisions during the hold's life.

IDEMPOTENCY:
No idempotencyKey on a.pause/a.resume; two independent authorities applying separate holds on the same entity concurrently isn't addressed — see cancellation/supersession gap below.

SLA / TIME:
w.hold timeout = 'the maximum hold duration policy defines' — correctly deferred, not invented. onTimeout → h.review, directly preventing the named failure mode ('an indefinite hold is a termination without a decision').

ESCALATION:
Timeout and judgment-needed both route cleanly to DEC-181; no loop.

CANCELLATION / SUPERSESSION:
a.revalidate explicitly re-reads current state before resuming, correctly avoiding restoration of anything that expired underneath the hold. However, it is not stated whether a.revalidate also checks for a second, independently-applied hold still in force on the same entity before resuming operations — if two concurrent compliance holds exist, resuming one could inadvertently lift protection the other still requires. h.terminal correctly preserves commitments as 'resolved rather than erased.'

HANDOFFS:
- h.review → DEC-181: carries ["the hold, its reason, its age and what has and has not been resolved","the explicit fact that a hold is not a rejection and nothing adverse has been decided"]
- h.terminal → external:termination-lifecycle: carries ["the outcome, its authority and the hold record that preceded it","the commitments preserved during the hold, which the termination resolves rather than erases"]

COMPLETION:
x.resumed explicitly 'resumed at what is currently valid' rather than restoring a snapshot — correct OPS-130-consistent discipline distinguishing 'hold lifted' from 'everything restored exactly as before.'

RESULT / FEEDBACK:
No consumers at all — zero real handoff senders/receivers and zero prose cross-references anywhere in the 284-journey corpus per this dump.

CORRECTION / REOPEN:
reEntry explicitly treats a further policy question as a new hold with its own scope and resolution condition; the prior hold record stays in the audit trail as something applied and answered.

OBSERVABILITY / AUDIT:
compliance_log entries at every transition — reason, authority, effective time, what's resolved — a solid trail.

CONSUMER COVERAGE:
Classification: event-driven. Zero real or prose consumers found anywhere in the corpus dump for this id. The trigger (policy_or_compliance_hold_applied, source: authoritative) is consistent with an external compliance/legal authority applying the hold directly rather than via a modeled journey handoff, which is why this is classified event-driven rather than orphan-candidate.

TEST CASES:
- [concurrent-claim] Given: two independent compliance holds are applied to the same entity around the same time → Expect: not explicitly addressed — a.revalidate's current-state re-read may or may not account for a second still-active hold before resuming operations
- [escalation] Given: the maximum hold duration passes with no resolution → Expect: hands to DEC-181 for review rather than remaining silently open
- [completion] Given: the hold's resolution condition is met → Expect: operations resume rebuilt from current entitlements, not from a snapshot taken when the hold was applied

GAPS:
- P1 (ownership): No team/role is named as accountable for an entity while a compliance hold is open, beyond the automated timeout watch — flagged per this round's instruction to surface ambiguous ownership even in an otherwise sound automated flow.
- P1 (sla-escalation): No stated coordination for two independently-applied holds active on the same entity concurrently; a.revalidate's current-state check doesn't explicitly confirm no other hold is still in force before resuming.
- P2 (consumer-coverage): Zero corpus consumers of any kind (unusual for this batch) — a plausible external/authoritative trigger source justifies event-driven classification over orphan, but this is worth a documentation pass.

---

## RSK-197 — Policy Exception Review

READINESS: READY_WITH_MAPPING

WHY:
Standing, scope, and rule-existence checks all happen before any grant; 'requested' is never conflated with 'granted'; and a.granted explicitly refuses to produce a general permission by always naming rule and scope. This is one of the tightest workflows in the batch, with only a minor duplicate-request concern worth mapping.

RESPONSIBILITY:
Establish whether a controlled deviation from a named rule, over a stated scope, may even be sought by this requester — and if the answer needs judgment, hand it to the decision engine rather than guess.

INSTANCE:
No instanceKey (predates convention). Implied identity per entity.note: the exception request bound to a specific policy, action, or entity — one that names neither rule nor scope is explicitly treated as an invalid general permission, not a legitimate exception.

ENTRY:
Trigger t.requested (policy_exception_requested), source declared (requester-declared, not authoritative or inferred). Explicitly distinguishes a genuine exception request from a policy block having merely occurred (insufficient alone) — good discipline against conflating enforcement with a request to set enforcement aside.

OWNERSHIP:
c.exceptions-allowed and c.requester gate standing before anything else happens; a deterministic rule (a.evaluate) or DEC-181 (a.judgment) makes the actual grant/refuse decision — never the requester. No self-approval structural risk, since the decision is always external to the requester by design.

ASSIGNMENT / QUEUE:
N/A — no queue; a linear validate-then-decide pipeline.

DATA:
a.capture records policy, exception, scope, reason, requester, duration/window, and supporting evidence — thorough.

EVIDENCE:
N/A for the deterministic-rule branch (rule-based, not evidentiary weighing); evidence for judgment-required cases is captured and handed intact to DEC-181.

AUTHORITY / APPROVAL:
No self-approval path exists: decisions are made either by a deterministic policy rule or by DEC-181, never by the requester. a.granted explicitly records exactly which rule is displaced, over what scope, for how long, avoiding a general-permission leak.

IDEMPOTENCY:
No idempotencyKey; a requester submitting duplicate concurrent requests for the same rule+scope isn't deduplicated — low severity given requester-declared entry makes this more a UX/waste concern than a correctness risk.

SLA / TIME:
N/A — no wait nodes; judgment cases pass synchronously to DEC-181, whose own SLA is out of this batch's scope.

ESCALATION:
N/A — no escalation ladder within the journey; a single clean pass-through to DEC-181 for silent-policy or judgment-needed cases.

CANCELLATION / SUPERSESSION:
x.no-exception-path / x.invalid / x.rejected are all correctly non-terminal with distinct reentry semantics — notably, x.invalid explicitly separates 'not assessed on the merits' (standing defect) from x.rejected's 'assessed and refused' (merits defect), never conflating the two.

HANDOFFS:
- h.review → DEC-181: carries ["the rule, the deviation proposed and the fact that the policy is silent on whether it admits exceptions","the explicit fact that no exception authority was inferred from that silence - an authority nobody wrote down is not one this journey can find"]
- h.decide → DEC-181: carries ["the rule concerned, the exact scope proposed, the reason and the supporting evidence","the explicit fact that an exception overrides one decision within a scope and does not disable the rule, so the decision is about that scope rather than about the rule"]
- h.apply → RSK-198: carries ["the rule displaced, the scope, the validity and the usage semantics","the explicit fact that being granted is not being applied - the override happens per action, within scope, and only while the exception is live"]

COMPLETION:
A granted exception is not itself an exit node — it hands off to RSK-198 (h.apply) rather than terminating here, correctly distinguishing 'exception approved' (this workflow's completion) from 'exception applied/used' (RSK-198's job), an explicit OPS-130-consistent split that the two workflows' own distinctFrom text names directly.

RESULT / FEEDBACK:
RSK-198 is the real downstream recipient of a granted exception (verified via RSK-197's own h.apply handoff); RSK-198 also references RSK-197 in prose distinctFrom.

CORRECTION / REOPEN:
x.rejected reEntry explicitly concerns the request rather than the requester (a fresh request is assessable once the unmet condition is satisfied); x.invalid reEntry explicitly allows the same exception sought by someone with standing to be assessed on its merits.

OBSERVABILITY / AUDIT:
exception_log entries capture rule, scope, reason, requester, and evidence at every step — solid trail for later audit or appeal.

CONSUMER COVERAGE:
Classification: event-driven. No real inbound handoff consumer — entry is requester-declared, consistent with an external/declared trigger. RSK-198 is the real downstream recipient via RSK-197's own outbound h.apply handoff, and separately references RSK-197 in prose.

TEST CASES:
- [self-approval] Given: the requester also proposes the exception outcome → Expect: not structurally possible — decisions are always made by a deterministic rule or DEC-181, never the requester
- [handoff] Given: an exception is granted → Expect: hands to RSK-198 with the rule displaced, scope, validity, and usage semantics — the grant itself does not apply anything
- [approval] Given: policy is silent on whether this rule admits exceptions at all → Expect: hands to DEC-181 rather than defaulting to allow or forbid

GAPS:
- P2 (idempotency): No dedup guard against a requester submitting duplicate concurrent requests for the same rule+scope.

---

## RSK-198 — Policy Exception Lifecycle

READINESS: NEEDS_CONTRACT_WORK

WHY:
The single-use consumption discipline is explicit in prose ('any later invocation is refused rather than quietly honoured') but the check-then-consume sequence (c.applicable 'Valid' → a.override → c.single → a.consume) is not declared atomic anywhere in the graph. Two concurrent invocations of a single-use exception could both pass the validity check before either marks it consumed, applying the override twice — a direct match to this round's P0 'same effect can execute twice' pattern.

RESPONSIBILITY:
Enforce that a granted exception overrides policy only for the exact action, scope, and validity it was authorized for, at the moment it's invoked — and stops overriding the instant it should.

INSTANCE:
No instanceKey field, but the entity note gives an unusually clear identity statement for this batch: 'The exception is one record; each use is an event on it. Validity is asked at each use rather than set once when it was granted.'

ENTRY:
Trigger t.authorized (exception_becomes_authorized), authoritative, arriving via RSK-197's h.apply handoff — verified matching carries.

OWNERSHIP:
Entirely mechanical: record→bound/unbound→wait-for-use→override/no-override/consumed→expire/revoke, with zero handoffs anywhere in the graph (handoffs: []). No human or queue touches any path — this is closer to runtime infrastructure than human-executed operational work (see boundary candidate).

ASSIGNMENT / QUEUE:
N/A — fully automated enforcement, confirmed zero handoffs.

DATA:
a.record captures id, displaced rule, scope, authority, valid-from/until, conditions, and usage semantics — thorough.

EVIDENCE:
N/A — a runtime validity check, not an evidentiary review.

AUTHORITY / APPROVAL:
Authority was already established by RSK-197; RSK-198 only re-checks current validity per invocation, correctly not re-litigating the original grant decision.

IDEMPOTENCY:
The central gap: single-use consumption relies on 'not yet consumed' (c.applicable) being checked before a.override applies the deviation, then c.single routes to a.consume afterward — three separate nodes with no stated atomicity between the check and the mark. A race between two concurrent invocations of the same single-use exception is not ruled out by the source. This directly parallels the mechanism-round's atomic-claim requirement for exactly this kind of check-then-act sequence.

SLA / TIME:
w.use timeout = 'the exception's valid-until, or the review point set for an unbounded exception' — correctly conditional. onTimeout → a.expire, which explicitly stops override 'including in work already queued carrying its id' — strong discipline against stale-exception execution.

ESCALATION:
N/A — no escalation ladder; deliberately mechanical enforcement with no human review path even for out-of-scope invocation attempts (a reasonable design choice, not a gap, given the guardrail against exception leakage).

CANCELLATION / SUPERSESSION:
a.revoke explicitly does not undo overrides already validly applied ('those happened under an authorization that existed at the time') — correctly separates stopping future use from reversing completed effects. a.expire shows the same discipline for the timeout path.

HANDOFFS:
N/A — no outbound handoffs

COMPLETION:
x.consumed / x.expired / x.revoked are all clearly specified; x.expired reEntry explicitly treats renewal as 'a new grant... assessed on current circumstances rather than extended from this one' — no silent extension.

RESULT / FEEDBACK:
Sole real consumer is RSK-197 (verified h.apply handoff). No consumer is modeled for the expiry/revocation outcomes themselves.

CORRECTION / REOPEN:
reEntry explicitly defers 'whether the prior uses need correcting' to a separate lifecycle rather than inventing a correction mechanism here — appropriately scoped.

OBSERVABILITY / AUDIT:
exception_log entries at every transition (recorded/bounded/unbounded/no-override/override/consumed/expire/revoke) — one of the most complete audit trails in this batch.

CONSUMER COVERAGE:
Classification: active. RSK-197 is the sole, verified real consumer via its own h.apply handoff with matching carries.

BOUNDARY CANDIDATE:
Suspected correct surface: runtime-mechanism (confidence: medium). Zero handoffs, zero human/queue ownership anywhere in the graph, and a purely mechanical validity/consumption state machine over an authorization token — the shape matches a lease/token-lifecycle mechanism more than human-executed operational work. Impact if changed: Low for implementation semantics (the idempotency gap needs fixing regardless of which round owns it); moderate for how this round's checklist should weight ownership/queue dimensions that genuinely don't apply here.

TEST CASES:
- [duplicate-creation] Given: two concurrent invocations of a single-use exception arrive before either is marked consumed → Expect: only one override should apply and the second should be refused as already-consumed — not guaranteed by the current check-then-consume sequence
- [stale-work] Given: the exception's valid-until passes while an action carrying its id is still queued → Expect: the queued action's override is stopped, not honored, per a.expire's explicit discipline
- [cancellation] Given: an authority revokes the exception before it expires → Expect: future override stops immediately; overrides already validly applied are preserved, not rewritten

GAPS:
- P0 (idempotency): The validity check (c.applicable) and the consumption mark (a.consume, reached via a.override → c.single) are three separate nodes with no declared atomicity. A concurrent double-invocation of a single-use exception could both pass validation and both apply the override before either is marked consumed — the same effect executing twice.

---

## RSK-199 — Limit Enforcement

READINESS: READY_WITH_MAPPING

WHY:
This is one of the strongest-specified workflows in the batch: usage is recorded atomically with the allowance check (explicitly named as the fix for the classic check-then-apply race), a limit is never silently increased, and a stale or unauthoritative usage figure routes to reconciliation rather than either blocking or allowing blindly. No P0/P1 defect was found.

RESPONSIBILITY:
Treat a limit or quota being reached as the limit working as designed — never as abuse — while giving the constrained action a real, authorized path forward (wait for reset, seek an increase, or accept the limit).

INSTANCE:
No instanceKey (predates convention). Implied identity per entity.note: 'One limit, one measurement window, one authoritative count' — explicitly single-source-of-truth, avoiding a locally-derived shadow count.

ENTRY:
Trigger t.threshold (limit_threshold_reached_or_would_be_exceeded), authoritative, requiring a proposed action measured against a defined limit.

OWNERSHIP:
Fully automated allow/block decision; DEC-181 owns the increase authority (h.increase) and undefined-reset judgment (h.review) exclusively — the workflow itself never silently grants more capacity, per its own guardrail.

ASSIGNMENT / QUEUE:
N/A — no queue; a mechanical gate with two named escalation paths to DEC-181.

DATA:
a.determine captures limit type, current usage, limit amount, window, reset semantics, scope, and the authoritative source of the count — explicitly checked for authoritativeness (c.source) before being trusted.

EVIDENCE:
N/A — not an evidentiary review; a defined-threshold check against an authoritative count.

AUTHORITY / APPROVAL:
h.increase is the sole path to more capacity and is explicitly gated to DEC-181 — 'a limit is never silently increased' is enforced structurally, not just stated as a guardrail.

IDEMPOTENCY:
a.allow explicitly states usage is recorded 'atomically with the allowance, so two concurrent actions cannot each see room only one of them has' — a textbook, explicitly-named atomic-claim implementation, directly matching the mechanism round's own vocabulary. Strong positive example.

SLA / TIME:
w.reset timeout = 'the expected reset point plus its tolerance' — reasonably deferred to policy. onTimeout → h.reconcile rather than either indefinitely blocking or silently resetting.

ESCALATION:
c.source routes a derived/stale/disagreeing usage figure to h.reconcile rather than acting on an unverified count — 'no block is applied on a count that has not been established' is a strong, explicitly-stated discipline.

CANCELLATION / SUPERSESSION:
N/A — no open case to cancel; each evaluation is a point-in-time gate, and x.blocked is a stable, non-punitive, non-terminal state.

HANDOFFS:
- h.reconcile → external:external-status-reconciliation: carries ["the limit, the figure held and where it came from","the explicit instruction that no block is applied on a count that has not been established - refusing someone on a wrong number is worse than a late decision"]
- h.increase → DEC-181: carries ["the limit, the current usage, the window and what is being asked for","the explicit fact that a limit is never silently raised - an unrecorded increase is a control removed with no decision and no authority behind it"]
- h.review → DEC-181: carries ["the limit, the window and the usage held against it","the explicit fact that no reset period was invented - telling someone to try again tomorrow when nothing resets tomorrow is worse than telling them nothing"]

COMPLETION:
x.within / x.reset / x.blocked are all correctly scoped to exactly what happened (allowed-and-recorded, window-reset, or no-route-in-this-window) with no overclaim.

RESULT / FEEDBACK:
RSK-273 (customer surface) references it only in prose; no real inbound handoff consumer in this batch.

CORRECTION / REOPEN:
x.blocked reEntry explicitly requires 'an authorized change to the limit, or a new window' — never a silent auto-retry.

OBSERVABILITY / AUDIT:
limit_log entries at every step — type, usage, limit, window, source, and outcome all recorded.

CONSUMER COVERAGE:
Classification: event-driven. RSK-273 references it only via prose. The trigger is plausibly emitted at any proposed action reaching a limit gate across the system, consistent with a broad event-driven entry point.

TEST CASES:
- [concurrent-claim] Given: two actions are proposed simultaneously near the limit boundary → Expect: usage is recorded atomically with the allowance decision so at most one sees room the other consumed
- [escalation] Given: the usage count is derived, stale, or disagrees with the authoritative source → Expect: routes to reconciliation rather than blocking or allowing on an unverified number
- [handoff] Given: more capacity is genuinely warranted → Expect: requires an explicit DEC-181-authorized increase; the limit is never silently raised

GAPS:
- P2 (other): Predates the instanceKey convention like the rest of this batch — noted honestly, not treated as a defect given the point-in-time nature of the check.

---

## RSK-200 — Risk State Recalculation

READINESS: NEEDS_CONTRACT_WORK

WHY:
The staleness/freshness discipline here is exemplary — c.newer explicitly suppresses a stale evaluation job rather than letting it overwrite a newer decision, and completed actions are structurally protected from retroactive invalidation. But the entity's own scope statement names both 'the change' and 'the work it actually touches' as a single identity without clarifying whether the durable unit is per-change (with internal fan-out) or per (change, affected-item) pair — an implementer cannot safely build completion tracking, dedup, or partial-failure recovery for the fan-out without that decision being made for them.

RESPONSIBILITY:
Propagate a policy or risk-state change only to the current or future work it actually reaches, leaving completed actions and their historical validity alone, and never letting a stale evaluation overwrite a newer decision.

INSTANCE:
No instanceKey. Entity.scope names 'the policy or risk state change and the work it actually touches' as one scope, but a.identify enumerates a set of affected items and a.pending re-evaluates them 'item by item' — the dump does not clarify whether the durable work instance is the change itself (with internal fan-out) or each (change, item) pair. This is a genuine, unresolved ambiguity, not a convention gap.

ENTRY:
Trigger t.changed (policy_or_risk_state_changed), authoritative, with a precise enumeration of qualifying changes (policy version, cleared risk case, moved threshold, changed compliance requirement, revoked exception, new authoritative classification).

OWNERSHIP:
Fully automated fan-out and re-evaluation; DEC-181 owns only undefined effective-time semantics. No described mechanism confirms that every item a.identify determined was affected actually completed its re-evaluation — a partial-failure/completion-tracking gap distinct from (and additional to) the well-handled per-item staleness check.

ASSIGNMENT / QUEUE:
N/A — no queue; automated propagation.

DATA:
a.identify explicitly scopes to 'active and future work the change actually touches,' guarding against a policy update that 'restarts every existing journey' — good blast-radius discipline.

EVIDENCE:
N/A — not an evidentiary review; propagates an already-authoritative change.

AUTHORITY / APPROVAL:
c.temporal's 'semantics are not defined' branch explicitly refuses to default either prospective-only or retroactive application, routing to DEC-181 instead — an unusually mature discipline, explicitly reasoned in the node text ('defaulting either way is wrong for about half of all changes').

IDEMPOTENCY:
c.newer / a.suppress is an explicit, well-implemented optimistic-version check: a queued evaluation carrying an older policy version is suppressed rather than allowed to overwrite a decision already made under a newer one — directly matches the guardrail and the mechanism-round's freshness-before-execution vocabulary. Strong positive example, worth citing.

SLA / TIME:
N/A — no wait nodes; the propagation runs synchronously off the triggering change.

ESCALATION:
h.review for undefined effective-time semantics is a single clean handoff, no loop risk.

CANCELLATION / SUPERSESSION:
a.preserve explicitly protects completed actions from being retroactively invalidated by a new policy ('a new rule does not make everybody retroactively non-compliant') — strong, directly-cited discipline matching the guardrail set.

HANDOFFS:
- h.restore → ACC-79: carries ["the restriction being lifted and the change that removed its basis","the explicit instruction that restoration is rebuilt from current entitlements - a cleared risk does not restore an entitlement that expired independently while the restriction was in force"]
- h.restrict → RSK-193: carries ["the new authority, its effective time and the specific scope it reaches","the explicit fact that this is a current-state consequence and says nothing about actions completed under the previous rule"]
- h.review → DEC-181: carries ["the change, the work it would touch and what is not stated about its reach","the explicit fact that no default was chosen - whether a change reaches work in flight is a decision, and defaulting either way is wrong for about half of all changes"]

COMPLETION:
Per-item outcomes (x.suppressed / x.unchanged) are well-specified, but because the durable work-instance boundary is itself ambiguous (see instance section), there is no single graph exit representing 'this change finished propagating to everything it touches' — an implementer would have to invent that boundary.

RESULT / FEEDBACK:
Zero consumers of any kind (no real handoff, no prose cross-reference) anywhere in the corpus dump for this id.

CORRECTION / REOPEN:
x.unchanged explicitly records the non-change as evidence the change was considered, not missed — a genuinely strong audit-discipline example many systems skip.

OBSERVABILITY / AUDIT:
policy_log entries at every step, including the deliberate non-event (x.unchanged) — a strong trail, undermined only by the lack of a fan-out-completion record discussed above.

CONSUMER COVERAGE:
Classification: event-driven. No real or prose consumers anywhere in the dump. The trigger is plausibly emitted internally by many other risk/policy workflows in this same file (RSK-192 clearing, RSK-197/198 exceptions, RSK-195 requirement changes) rather than by one specific journey handoff.

TEST CASES:
- [stale-work] Given: a queued re-evaluation job carries an older policy version than one already applied to the same work → Expect: the stale job is suppressed and recorded; the newer decision stands
- [completion] Given: a change is identified as affecting a set of pending items → Expect: not modeled in source — no exit or record confirms that every identified item's re-evaluation actually completed
- [handoff] Given: the change removes the basis for a current restriction → Expect: restoration hands to ACC-79 rebuilt from current entitlements, not from what was true when the restriction was applied

GAPS:
- P1 (other): The durable work-instance boundary is ambiguous: entity.scope names the change and the affected work as one identity, but a.identify/a.pending's item-by-item language implies fan-out to multiple sub-instances. An implementer must invent this boundary to build completion tracking or dedup, which the round's own framing treats as unsafe.
- P1 (completion): No described mechanism confirms exhaustive completion of the fan-out — whether every item a.identify determined was affected actually finished re-evaluation, as distinct from the well-handled per-item staleness (c.newer/a.suppress) check.
- P2 (consumer-coverage): Zero corpus consumers of any kind, though a plausible broad internal trigger (any policy/risk-state change) argues for event-driven rather than orphan classification.

---

## SCH-171 — Availability Evaluation

READINESS: READY_WITH_MAPPING

WHY:
This workflow's central discipline — a displayed option is not a reservation, and evaluating against operating hours alone is explicitly insufficient — is enforced structurally by treating x.offered as non-binding by design, and by refusing to fabricate availability when no capacity model exists at all (a.unknown). Mapping work is limited to which resources have capacity models and what the alternative-offer policy actually allows per resource.

RESPONSIBILITY:
Answer 'what times are bookable right now' against a resource's authoritative capacity model, offering only currently-valid options and being explicit that nothing shown is held or committed.

INSTANCE:
Work instance = one availability request, explicitly scoped as 'a question, not a claim on anything' — entity.note states 'Nothing it returns is protected between being shown and being requested,' which is itself the concurrency policy (no reservation of any kind is made by this workflow). No instanceKey/concurrency field declared, appropriately so since there's no work item to hold identity for beyond the stateless query itself.

ENTRY:
Declared (not authoritative) evidence source: 'a request for bookable times against an identified resource, service or context' — this is the one workflow in the batch whose trigger.evidence.source is 'declared' rather than 'authoritative' or 'behavioral,' correctly reflecting that an availability query is itself just a request, not a fact needing independent verification.

OWNERSHIP:
No ownership transfer occurs at all — this is a pure read/evaluate/respond workflow with no work item that persists past the response. 'Ownership' in the traditional sense doesn't apply; the closest concept is which system holds the authoritative capacity model being queried.

ASSIGNMENT / QUEUE:
N/A — no queue; this is a synchronous query-response evaluation with no persisted work item.

DATA:
Capacity, service duration, location/context, eligibility constraints, existing reservations and holds, operating window, lead-time rules, and buffers are all named explicitly as required inputs to a.evaluate — a genuinely complete list, not a hand-waved 'check availability.'

EVIDENCE:
N/A in the review sense, but worth naming: a.unknown's design is itself an evidence discipline — 'an absent constraint is not an absence of constraint,' i.e., missing capacity data must never be silently treated as infinite availability. This is a real and important guard against a specific failure mode (overbooking discovered only when someone arrives).

AUTHORITY / APPROVAL:
N/A — no approval; this is a query evaluation, not a decision requiring authority.

IDEMPOTENCY:
N/A — a pure read operation with no durable write beyond an availability_log append; re-running the same query produces a freshly-evaluated (and possibly different) answer by design, since nothing is held between evaluations.

SLA / TIME:
N/A — no wait/timeout nodes; this is a synchronous request/response workflow.

ESCALATION:
N/A — no escalation path; NO_AVAILABILITY is a legitimate terminal-for-now answer, not a failure requiring escalation.

CANCELLATION / SUPERSESSION:
N/A — nothing is created or held by this workflow to cancel or supersede; every exit explicitly states nothing is reserved (x.offered, x.waitlisted, x.no-availability all say so directly).

HANDOFFS:
N/A — no outbound handoffs

COMPLETION:
There is no persistent 'completion' concept here in the OPS-130 sense — the three exits (offered/waitlisted/no-availability) are each a complete and correct answer to the query as posed, and each explicitly documents that nothing is held between the response and any future booking action.

RESULT / FEEDBACK:
SCH-173 and SCH-179 both hand off into this workflow (h.alternative and h.rebook respectively, confirmed present in `src/canonical/scheduling.ts` targeting SCH-171) when their own flows need a fresh availability read after an original slot fell through or was missed — both carry forward the explicit 'nothing is held/committed' fact from their own prior state, which is the piece of context SCH-171 needs to answer cleanly rather than re-deriving it.

CORRECTION / REOPEN:
x.offered's reEntry is explicit and important: 'any option shown can be taken by someone else before it is requested. The reservation revalidates against current capacity rather than against what was displayed' — this correctly requires freshness-before-decision at the actual booking step, not trust in this query's snapshot.

OBSERVABILITY / AUDIT:
availability_log appended at filter/none/widen/waitlist steps — gives a record of what was offered and under what constraint, though a.evaluate itself has no explicit log write (silent evaluation step, not directly an audit gap since a.filter's append captures the result).

CONSUMER COVERAGE:
Classification: active. SCH-173, SCH-179 and SCH-282 all list SCH-171 as a source. SCH-173 and SCH-179 each have a real inbound handoff node targeting SCH-171 (h.alternative, h.rebook respectively) — confirmed present in `src/canonical/scheduling.ts` on the consumers' own side, not SCH-171's (SCH-171 itself has no outbound handoffs, consistent with `handoffs: []`). SCH-282 references via distinctFrom prose only.

TEST CASES:
- [stale-work] Given: an option is displayed to a requester and then taken by someone else before they book → Expect: per x.offered's reEntry, the actual reservation attempt revalidates against current capacity rather than trusting this query's snapshot
- [missing-evidence] Given: no authoritative capacity model exists for the requested resource → Expect: a.unknown returns no options and records the absence explicitly, rather than treating an unconfigured resource as infinitely available
- [handoff] Given: the requested window has no availability and policy allows offering an alternative → Expect: a.widen offers the nearest valid window, explicitly labeled as different from what was asked for

GAPS:
- P2 (other): 'policy allows offering the nearest valid alternative' / 'the resource operates a waitlist' (c.alternative) are both referenced as existing policy without the policy source being named — reasonable to leave unmapped here, but worth flagging as company-specific configuration.

---

## SUB-164 — Renewal Execution

READINESS: READY_WITH_MAPPING

WHY:
The workflow correctly separates decision (SUB-163) from execution, keeps ownership of the new term through the financial dependency rather than handing it away mid-flight, and preserves full term history on every path including failure. The financial-dependency ownership model (raise-and-wait rather than hand off) is a real, well-thought-out design; the main mapping work is which dependency types apply per relationship and the recovery-window/start-date SLAs.

RESPONSIBILITY:
Once a renewal is authorized, actually satisfy what the new term requires (payment, eligibility, verification, resource availability as applicable) and only then create and activate the new term — while never overwriting the previous term's own record.

INSTANCE:
Work instance = one renewal execution operation and the prospective new term it would create, scoped explicitly as 'the renewal operation and the new term it would create' — entity.note is explicit that the new term is a genuinely new record, never overwriting the previous term's dates/price/scope. No instanceKey/concurrency declared.

ENTRY:
Authoritative: `renewal_authorized_for_execution`, requiring 'a renewal decided or scheduled, with the new term's dates and terms' — explicitly distinguishes eligibility (permits the decision) from the decision itself as insufficient entry evidence. Confirmed as a real inbound handoff from SUB-163 (h.execute, carrying the decision and the explicit fact the new term doesn't exist yet and its requirements are untested) — precise entry contract.

OWNERSHIP:
This is the standout ownership design in the batch: 'This journey keeps ownership of the new term and waits for [the financial] outcome rather than handing the term away — otherwise a failed payment leaves a renewal nobody is holding.' Ownership does not transfer to the financial lifecycle merely because a financial obligation was raised; it transfers only on genuine terminal outcomes (payment failure → SUB-165, non-renewal → SUB-170, scope change → ACC-73).

ASSIGNMENT / QUEUE:
N/A — no human queue for renewal execution itself; it is an automated dependency-driven pipeline.

DATA:
New term's dates and terms are carried in from SUB-163's decision; which dependencies apply (payment/eligibility/verification/resource availability) are read 'from the relationship's own terms' rather than assumed to always be payment — a.dependencies is explicit that 'assuming payment is the only one renews contracts whose eligibility has lapsed,' a real anti-pattern avoidance.

EVIDENCE:
N/A — not a review workflow; dependency resolution is a binary authoritative pass/fail per dependency type, not weighed evidence.

AUTHORITY / APPROVAL:
N/A — no approval step within execution itself; the authorization to renew already happened upstream in SUB-163 and is treated as given at entry.

IDEMPOTENCY:
No idempotencyKey/attemptBudget declared on actions in this workflow's dump entry, but the design achieves duplicate-prevention structurally: the new term is only ever created once (a.new-term → a.activate-term, single path) after all-dependencies-satisfied, and w.dependencies' onTimeout routes back to the classification (c.blocker) rather than retrying a.financial blindly — worth flagging as a genuine gap since a repeated authorization event (e.g. a duplicate SUB-163 handoff) could in principle attempt a second a.financial raise without a declared key to prevent it.

SLA / TIME:
Two distinct, honestly-scoped timeouts: w.dependencies times out 'at the last point the new term could still start on time' (a business-deadline concept, not an arbitrary duration) and correctly routes to c.blocker rather than silently failing; w.recovery times out 'after: the recovery window the governing terms allow,' explicitly framed as a business-defined window ('the terms define how long a relationship may sit between terms') rather than an invented duration.

ESCALATION:
No priority/owner escalation exists; instead there are three distinct terminal-ish handoffs depending on cause (payment failure → SUB-165, scope change → ACC-73, non-renewal → SUB-170) — this is routing-by-cause rather than escalation-by-urgency, which is appropriate for this workflow's shape and correctly avoids inventing an escalation ladder the source doesn't have.

CANCELLATION / SUPERSESSION:
The previous term is explicitly never overwritten regardless of outcome ('The previous term keeps its dates, its price and its scope... that is what any later question about the relationship is asked against') — this is the correct non-destructive supersession model; a.new-term creates the new term as an additive record alongside, not a replacement.

HANDOFFS:
- h.payment-failure → SUB-165: carries ["the relationship, the renewal and the failed obligation","the explicit fact that the previous term's history is intact and the relationship has not terminated"]
- h.entitlement → ACC-73: carries ["the delta between the previous term's scope and the new one","the effective date, so nothing is added or removed before the new term actually starts"]
- h.non-renewal → SUB-170: carries ["the reason the renewal could not complete","every previous term, intact, and whatever obligations were created while they ran"]

COMPLETION:
x.renewed ('NEW_TERM_ACTIVE; the previous term is preserved in full') is a strong completion bar because it requires all authoritative dependencies to have actually resolved (not merely been raised) before the term is created — directly matching OPS-130's technical-vs-business-completion precedent (a payment attempt or scheduled renewal is explicitly not treated as done per the guardrails).

RESULT / FEEDBACK:
SUB-165 is listed as a consumer with h.complete carrying back 'how the obligation was resolved and when' and the relationship's state through recovery — this confirms a bidirectional relationship: SUB-164 hands off to SUB-165 on payment failure, and SUB-165 hands back to SUB-164 (a.new-term, presumably) once the obligation is eventually resolved, letting the renewal resume from a known position rather than a gap. This bidirectional pairing is coherent but worth naming explicitly as a two-way contract, not a one-way handoff.

CORRECTION / REOPEN:
A failed dependency correctly does not corrupt the relationship: c.blocker's three branches (payment-failure/recoverable-non-financial/cannot-complete) each preserve full term history; a.pending explicitly records 'exactly which dependency is missing' so 'pending with no cause becomes a relationship that quietly stops renewing' is avoided.

OBSERVABILITY / AUDIT:
renewal_log and relationship_log both appended across the workflow's actions — captures the dependency-raising, pending-cause, and new-term-creation events distinctly, giving an auditable record of why a renewal did or didn't complete.

CONSUMER COVERAGE:
Classification: active. SUB-163 is the confirmed authoritative sender (h.execute) and SUB-165 is both a receiver (h.payment-failure) and a confirmed return-sender (h.complete) — a genuine bidirectional pairing, both directions receiver-constructible from the carried fields shown.

TEST CASES:
- [duplicate-creation] Given: SUB-163 sends a second renewal-authorized-for-execution event for the same renewal before the first completes → Expect: no declared idempotencyKey guards a.financial from raising a second financial obligation for the same renewal — flagged as a gap
- [completion] Given: the financial obligation is raised but not yet paid → Expect: a payment attempt/scheduling is explicitly not renewal completion per the guardrails — x.renewed only fires once the obligation is authoritatively satisfied
- [handoff] Given: a payment fails authoritatively → Expect: h.payment-failure → SUB-165 carries the relationship and explicitly states the previous term's history is intact and the relationship has not terminated
- [feedback] Given: SUB-165 eventually resolves the failed obligation (late payment succeeds, for example) → Expect: h.complete carries the resolution back to SUB-164 so the new term starts from the relationship's actual state through the recovery, not from a gap

GAPS:
- P0 (idempotency): No idempotencyKey/attemptBudget is declared on a.financial (raising the financial obligation) or a.new-term (creating the new term) — if the authoritative renewal-authorized-for-execution event is ever delivered twice for the same renewal (a duplicate SUB-163 handoff, a retried event), nothing in this workflow's own nodes prevents raising a second financial obligation or creating a second new term for the same renewal cycle.
- P2 (sla-escalation): 'the last point at which the new term could still start on time' and 'the recovery window the governing terms allow' are both referenced but undeclared as concrete durations — correctly left to per-relationship policy, but must be mapped before implementation.

---

## TIM-64 — Expiry Validation

READINESS: READY_WITH_MAPPING

WHY:
This is a clean, correctly-applied freshness-before-execution pattern with entity-specific consequences correctly kept separate from expiry itself ('expired is not revoked'). Idempotency and version-binding are asserted only in prose rather than a structured field, which is a batch-wide pattern in this file rather than a defect unique to TIM-64.

RESPONSIBILITY:
When a scheduled expiry timer fires, re-read the entity's current authoritative version before applying anything, so a timer scheduled against a stale version cannot override a later extension or fire against an entity that already moved on.

INSTANCE:
Scope is 'the time-bound entity and the specific version of it the timer was scheduled against'; no instanceKey declared (confirmed absent in the raw source for this id). 'The version binding is the point. A timer scheduled against one version firing against another is the defining failure of scheduled work.'

ENTRY:
Trigger expiry_time_reached, authoritative, requires an authoritative expiry moment arriving for a time-bound entity.

OWNERSHIP:
Fully automated — no execution:"human" or "communication" marker anywhere in this workflow (confirmed: zero such markers in the TIM-64 block); this is a pure system timer-firing mechanism.

ASSIGNMENT / QUEUE:
N/A — no human routing.

DATA:
The entity's current authoritative version at the moment of firing (a.reread), compared against what the timer expected.

EVIDENCE:
N/A — not a review workflow; the state check is a direct read of current authoritative state.

AUTHORITY / APPROVAL:
N/A — no approval step; expiry, extension-adoption and consequence-application are all deterministic given the current state.

IDEMPOTENCY:
'The transition is applied idempotently, so a redelivered job cannot expire it twice' is stated as a guardrail and repeated in a.expire's does text, but is not backed by a declared idempotencyKey field — consistent with every other workflow in this batch, prose-only.

SLA / TIME:
N/A as a duration — there is no wait node in this workflow; it fires at the (externally scheduled) expiry moment itself.

ESCALATION:
N/A — no escalation tier; a later authoritative extension simply supersedes this timer (a.extension), and an already-moved entity is suppressed as stale (x.stale).

CANCELLATION / SUPERSESSION:
An older scheduled expiry never overrides a later extension — the extension is adopted and this timer invalidated. An entity that already moved on (renewed/replaced) suppresses this expiry entirely rather than double-applying it.

HANDOFFS:
- h.post → TIM-69: carries ["the expired entity and the consequences applied","its validity history, which is what any later re-entry is judged against"]

COMPLETION:
x.stale and x.rescheduled are both explicitly non-terminal suppression/supersession outcomes, not failures; a.expire's own completion is captured via h.post to TIM-69 rather than a local exit node for the successful-expiry path.

RESULT / FEEDBACK:
TIM-69 is the real consumer of a successful expiry; three customer-surface journeys (TIM-61, TIM-63, TIM-65) also consume this workflow's output per the dump, though those are outside this batch to verify directly.

CORRECTION / REOPEN:
N/A — stale/rescheduled outcomes both explicitly defer to whatever the entity's current expiry now is, rather than reopening this specific timer.

OBSERVABILITY / AUDIT:
expiry_log appends at reread/extension/expire/consequences (with suppressed_sends also logged on extension-adoption) — adequate trail of what the timer found and did.

CONSUMER COVERAGE:
Classification: active. Real handoff consumers named in the dump: TIM-61, TIM-63, TIM-65 (all customer-surface, outside this batch); TIM-70 is named reciprocally via viaDistinctFrom only (TIM-70 explicitly calls out TIM-64 as its specific-case counterpart to its own general mechanism), with no direct handoff traffic between them, which is expected — they are complementary layers, not duplicates.

TEST CASES:
- [stale-work] Given: the entity was already renewed or replaced by the time the timer fires → Expect: suppressed as stale (x.stale) rather than expiring an entity that has already moved on
- [duplicate-creation] Given: the same expiry job is redelivered → Expect: applies the transition at most once per the stated idempotent-transition guardrail
- [handoff] Given: an entity genuinely expires → Expect: h.post carries the expired entity, applied consequences, and validity history to TIM-69

GAPS:
- P2 (idempotency): The idempotent-transition guarantee is asserted only in prose, not backed by a declared idempotencyKey field — a batch-wide pattern, not unique to this workflow.
- P2 (other): No instanceKey/concurrency declared.

---

## TIM-66 — Temporary Exception Expiry

READINESS: READY_WITH_MAPPING

WHY:
The core discipline — an exception with no end date is treated as an unapproved policy change, extensions are separately-recorded and countable rather than absorbed, and 'permanent' requires a distinct approval rather than repeated extension — is exactly right and well-reasoned. The countability guarantee this workflow leans on is directly undermined by having no declared instanceKey, which is a sharper gap here than the generic 'predates the convention' note applies elsewhere, since this workflow's own guardrail explicitly depends on countable per-grant identity.

RESPONSIBILITY:
Record a temporary exception with its authorizing party, scope and end/review date; revert to standard state if not authoritatively extended by the review point; and route a case for becoming permanent through an approval workflow rather than another extension.

INSTANCE:
Scope is 'the exception itself — its scope, the authority that granted it and the state it departs from'; no instanceKey declared. 'Each grant and each extension is its own record... only separate records make that countable' — a strong identity discipline stated in prose that has no concrete key structure to back it.

ENTRY:
Trigger temporary_exception_granted, authoritative, requires an exception granted by someone with authority to grant it against a standing policy/state; insufficientAlone correctly excludes unrecorded configuration drift with no authority behind it.

OWNERSHIP:
Fully automated recording/extension/reversion; the granting authority itself acts upstream of this workflow (captured as a fact, not exercised within it).

ASSIGNMENT / QUEUE:
N/A — no human routing within this workflow; OWN-56 owns the formalization path.

DATA:
Exception type, authorizer, reason, scope, start, and expiry-or-review date — all captured at grant time, with the review/expiry date doing double duty as the timeout source.

EVIDENCE:
N/A — this is a policy-tracking workflow, not a review one.

AUTHORITY / APPROVAL:
c.expiry only adopts an extension if it comes from 'someone with authority', on the record — no silent default extension. Formalizing an exception into permanent policy is explicitly routed through OWN-56's approval rather than handled as 'just another extension', preventing scope creep via repeated renewal.

IDEMPOTENCY:
N/A directly — recording/extending/reverting are each distinct, non-duplicative append operations rather than retryable mutations.

SLA / TIME:
w.exception times out at 'the exception's recorded expiry or review date' → c.expiry (checks for an authoritative extension before reverting) — a well-specified, concretely-sourced timeout tied directly to a.record's own captured field, one of the cleaner examples in this batch.

ESCALATION:
N/A in the classic sense — resolution routes directly to revert, extend, or formalize based on what's on the record, no priority/owner escalation tier.

CANCELLATION / SUPERSESSION:
Reverting explicitly marks the exception 'as no longer usable, so a stale process cannot keep relying on an exception that has ended' — a real supersession guarantee, not just a log entry.

HANDOFFS:
- h.formalize → OWN-56: carries ["the exception, its authority and how long it ran","the fact that formalising it is a permanent change and belongs in an approval rather than in another extension"]

COMPLETION:
x.extended and x.reverted are both non-terminal; extension is explicitly a new instance with its own new review date, keeping the extension count visible rather than hidden inside one long-running record.

RESULT / FEEDBACK:
OWN-56 is the real consumer of a should-become-permanent case; no other consumer is recorded.

CORRECTION / REOPEN:
A new exception is explicitly granted on its own authority and reason — not a reopening of a reverted one.

OBSERVABILITY / AUDIT:
exception_log appends at record/extend/revert — sufficient to reconstruct the grant/extension chain if the missing instanceKey is mapped to a concrete structure.

CONSUMER COVERAGE:
Classification: event-driven. consumers: [] — TIM-66 is triggered by an external exception-granting event/authority, not by another canonical workflow's handoff; a reasonable entry point.

TEST CASES:
- [escalation] Given: the review point arrives with no authoritative extension on record → Expect: reverted to standard state, not silently kept alive
- [approval] Given: an exception should become permanent policy → Expect: routed to OWN-56 for approval rather than extended indefinitely
- [handoff] Given: an exception is extended repeatedly over time → Expect: each extension is its own linked, countable record rather than absorbed into the original

GAPS:
- P1 (other): The extension-countability guarantee this workflow's own guardrail depends on ('extension history is preserved and countable... an exception extended repeatedly is visible as one') has no declared instanceKey or concrete key structure (e.g. exception id + extension sequence) — this is more load-bearing here than the generic 'predates the convention' note, since the workflow's own stated purpose requires exactly this.

---

## TIM-67 — Temporary State Expiry

READINESS: READY_WITH_MAPPING

WHY:
The unbounded-state gate (escalating rather than accepting a temporary state with no defined ending) and the revalidate-before-restore step (checking the previous state still exists AND the entity is still eligible AND the granting authority hasn't ended) are both correctly applied freshness-before-decision discipline, covering more failure modes than most workflows in this batch bother to name explicitly.

RESPONSIBILITY:
Give any time-bound state (temporary access, restriction, role, allocation, or configuration) a defined, explicit ending, and revalidate the entity's current eligibility and the previous state's continued existence before restoring anything, rather than assuming the pre-temporary state is still safe to return to.

INSTANCE:
Scope is 'the entity plus the temporary state placed on it'; no instanceKey. Deliberately generic — access, restriction, role, allocation and configuration all 'share this shape, and each carries its own exit rule', making this a reusable pattern rather than a single business process.

ENTRY:
Trigger temporary_state_entered, authoritative, requires an entity entering a state intended to end.

OWNERSHIP:
Fully automated; no execution marker anywhere in this workflow.

ASSIGNMENT / QUEUE:
N/A — no human routing; DEC-181 owns the unbounded-state escalation, ACQ-06 owns the no-longer-valid-to-restore case.

DATA:
The temporary state, when it took effect, when/how it ends, and the state it would return to — all captured at a.define.

EVIDENCE:
N/A — not a review workflow.

AUTHORITY / APPROVAL:
c.bounded halts to DEC-181 rather than silently accepting an unbounded temporary state — 'a temporary state without an expiry or exit condition is raised rather than created', a genuinely correct application of the 'never let unmanaged permanence happen by default' rule.

IDEMPOTENCY:
N/A directly — this is a state-transition workflow rather than a retryable mutation; a.revalidate is explicitly read-only (no writes declared), consistent with the house rule of not requiring idempotency on read-only steps.

SLA / TIME:
w.exception... (w.temporary) times out at 'the recorded expiry' → a.lapsed — 'expiry is the backstop for a condition that may never be met' — concretely sourced to a.define's own captured value.

ESCALATION:
N/A in the classic sense — c.restore routes directly to restore or to ACQ-06 based on current validity, no priority/owner escalation tier.

CANCELLATION / SUPERSESSION:
Early-exit and expiry-lapse are explicitly recorded as different facts about the same entity ('a temporary access revoked early and one that lapsed are different facts') — a real distinction preserved rather than collapsed.

HANDOFFS:
- h.unbounded → DEC-181: carries ["the entity and the state placed on it","the fact that a time-bound state with no exit rule is an unmanaged permanent state, which is why this is raised rather than accepted"]
- h.reevaluate → ACQ-06: carries ["the entity, the temporary state that ended and how it ended","the previous state, which is recorded as unavailable rather than silently applied"]

COMPLETION:
x.restored is the sole named exit — a temporary state that lapses or ends early always resolves to either a successful restore or an explicit unavailable-for-restore escalation, never a silent default application.

RESULT / FEEDBACK:
DEC-181 consumes unbounded-state cases; ACQ-06 consumes no-longer-valid-to-restore cases.

CORRECTION / REOPEN:
A further temporary state carries its own independent ending — no implicit chaining or reopening of a prior one.

OBSERVABILITY / AUDIT:
temporary_state_log appends at define/early/lapsed/restore — clearly distinguishes how the state ended (early vs. lapsed), which the audit trail explicitly needs.

CONSUMER COVERAGE:
Classification: event-driven. Only prose-only (viaDistinctFrom) references appear in the dump — TIM-65 and TIM-66 both name this workflow in their own distinctFrom entries with no actual handoff traffic, consistent with TIM-67 being a generic, broadly-triggered mechanism rather than a single pipeline stage.

TEST CASES:
- [approval] Given: a temporary state is created with no expiry or exit condition defined → Expect: raised to DEC-181 rather than silently accepted as an unmanaged permanent state
- [stale-work] Given: the previous state or the entity's eligibility for it has changed by the time restoration is attempted → Expect: routed to ACQ-06 as unavailable rather than restored blindly
- [completion] Given: the exit condition is met before expiry → Expect: recorded distinctly as an early end, not conflated with a lapse

GAPS:
- P2 (other): No instanceKey/concurrency declared.
- P2 (other): Conceptual overlap with TIM-70 (a similarly general, reusable time-based validation mechanism) is not cross-referenced from this workflow's own distinctFrom, though on inspection the two are complementary layers (this governs a temporary state's exit/restore semantics; TIM-70 governs any scheduled future write's re-validation at execution time) rather than duplicates — worth a documentation cross-reference, not a defect.

---

## TIM-68 — State Reversal

READINESS: READY_WITH_MAPPING

WHY:
This is one of the most disciplined workflows in the batch: it gates on irreversible side effects before attempting any restore, evaluates every dependent piece of state on its own current validity rather than assuming a wholesale restore is safe, explicitly records partial restoration as partial, and treats window-timeout as the normal, successful outcome rather than a failure.

RESPONSIBILITY:
Within a defined reversal window, undo a transition by restoring only what remains independently valid — never blindly resurrecting withdrawn consent, revoked credentials, expired tokens, or cancelled integrations — and route to forward correction rather than reversal wherever an effect already executed irreversibly.

INSTANCE:
Scope is 'the transition itself — what changed, when, and which of its side effects have already run'; no instanceKey. The side-effect list captured at a.record is explicitly what 'makes a later reversal decidable... without it, reversing is a guess'.

ENTRY:
Trigger reversible_transition_occurred, authoritative, requires a transition policy defines as reversible with a reversal window; insufficientAlone correctly excludes 'a change someone regrets, where no reversal policy exists'.

OWNERSHIP:
Fully automated; no execution marker anywhere in this workflow.

ASSIGNMENT / QUEUE:
N/A — no human routing; REM-157 owns the forward-correction path when reversal is unsafe.

DATA:
Previous state, new state, reversal eligibility, deadline, and — the decisive input — which side effects have already executed.

EVIDENCE:
N/A — not a review workflow; irreversibility is a direct system determination (money moved / message sent / external system told / physical action).

AUTHORITY / APPROVAL:
N/A — no approval step; the reversal-vs-forward-correction choice is a deterministic consequence of what has already executed, not a discretionary decision.

IDEMPOTENCY:
N/A directly — this is a one-shot state reversal, not a retryable mutation.

SLA / TIME:
w.window times out at 'the reversal deadline' (concretely sourced to a.record's own captured deadline) → x.settled — correctly treated as the ordinary, successful outcome ('the window closing is the ordinary outcome, and after it the new state is simply the state'), not an error.

ESCALATION:
N/A — no escalation tier; c.safe routes directly to restore or forward-correction based on what has already happened.

CANCELLATION / SUPERSESSION:
This IS the cancellation/supersession discipline done right: restoring the primary state explicitly does not cascade into re-granting consent, restoring revoked credentials, reviving expired tokens, or reactivating cancelled integrations — each is judged on its own current validity, avoiding the 'restoring an entity wholesale resurrects things that ended for reasons this reversal never addressed' failure mode this whole methodology round is watching for.

HANDOFFS:
- h.forward → REM-157: carries ["the side effects that already ran and cannot be undone","the state the requester expected to return to, which correction has to reach forward rather than backward"]

COMPLETION:
x.restored (fully restored) and x.partial (partially restored, explicitly recorded as partial rather than presented as though nothing had happened) are both real, distinct completion states — the partial case names what didn't come back rather than hiding it inside an apparent success.

RESULT / FEEDBACK:
REM-157 consumes the forward-correction path when reversal is unsafe.

CORRECTION / REOPEN:
x.settled's re-entry is explicitly a new transition with its own new reversal window, not an undo of the settled one.

OBSERVABILITY / AUDIT:
reversal_log appends at record/restore/recalculate — captures what was found, what was restored, and what was recalculated.

CONSUMER COVERAGE:
Classification: event-driven. ACC-79 (customer surface, access category) names this workflow only via viaDistinctFrom, with no real handoff traffic recorded — consistent with TIM-68 being a generic, broadly-invocable mechanism rather than a single pipeline's own step.

TEST CASES:
- [cancellation] Given: money has already moved or a message has already gone out as a result of the original transition → Expect: routed to REM-157 for forward correction rather than attempting to reverse an already-executed effect
- [reopen] Given: the reversal window closes with no reversal requested → Expect: settled as the normal outcome (x.settled), not an error or an escalation
- [completion] Given: some but not all dependent state can validly return → Expect: recorded as x.partial, explicitly naming what did not come back

GAPS:
- P2 (other): No instanceKey/concurrency declared.

---

## TIM-69 — Expired State Re-Entry

READINESS: READY_WITH_MAPPING

WHY:
The four-way routing is precise, and the terminal branch (x.terminal) is a genuinely, honestly declared dead end with an explicit 'none' re-entry rather than a soft non-terminal exit dressed up as final — a correct application of terminality discipline, not a defect. Replacement correctly keeps the expired entity as distinct, addressable history rather than merging it with its successor.

RESPONSIBILITY:
Decide, for an expired entity, which real business mechanism actually restores validity — direct renewal, requalification against conditions that must be demonstrated again, replacement by a distinct new entity, or a genuinely terminal 'no route back' — rather than editing the expiry away.

INSTANCE:
Scope is 'the expired entity, kept distinct from any replacement created for it'; no instanceKey. 'The expired entity and its replacement are two objects... merging them destroys both' — a strong identity discipline, though the actual linking mechanism between the two (e.g. a predecessor/successor reference) is asserted in prose without naming a concrete field.

ENTRY:
Trigger re_entry_attempted_or_available, authoritative, requires an action attempted against an expired entity or an opportunity to restore it arising.

OWNERSHIP:
Fully automated routing (a.consequence is explicitly read-only, no writes); no human execution marker anywhere in this workflow.

ASSIGNMENT / QUEUE:
N/A — no human routing; external:renewal-lifecycle and ACQ-05 own the renewal/requalification mechanisms themselves.

DATA:
What expiry actually did to this entity (suspend/invalidate/end-relationship — each routed differently), which mechanism restores validity, and the previous qualification history where requalification applies.

EVIDENCE:
N/A — not a review workflow; a.consequence is a direct lookup of the entity's own expiry semantics.

AUTHORITY / APPROVAL:
N/A — routing is deterministic given the entity's expiry type and the governing system's supported mechanism, not a discretionary decision within this workflow.

IDEMPOTENCY:
N/A directly — a.replace creates a new, distinctly-identified entity rather than mutating the expired one, avoiding any ambiguity about what changed.

SLA / TIME:
N/A — no wait nodes.

ESCALATION:
N/A — c.route is a single deterministic four-way branch, no escalation tier.

CANCELLATION / SUPERSESSION:
N/A — expired-state routing doesn't cancel or supersede anything in flight; it decides how (or whether) to move forward from a settled expired state.

HANDOFFS:
- h.renew → external:renewal-lifecycle: carries ["the entity and its expired validity period","the fact that renewal creates a new validity rather than deleting the gap"]
- h.requalify → ACQ-05: carries ["what expired and why it needs requalification","the previous qualification history, which is context rather than a shortcut"]

COMPLETION:
x.replaced retains the expired entity as distinct history while issuing a new, separately-tracked replacement. x.terminal is a genuinely terminal state with no re-entry path — a correctly-declared dead end distinguishing 'prohibited by design' from every other non-terminal outcome in this batch.

RESULT / FEEDBACK:
external:renewal-lifecycle and ACQ-05 are the real consumers of the two restorable routes.

CORRECTION / REOPEN:
N/A for x.terminal by design; for x.replaced, the replacement 'carries its own validity and its own expiry' — a fresh instance, not a reopening of the expired one.

OBSERVABILITY / AUDIT:
expiry_log appends at replace; the expired validity period itself is explicitly preserved as 'the gap during which nothing was valid is itself a fact'.

CONSUMER COVERAGE:
Classification: active. TIM-64 is a real, well-formed handoff consumer via h.post, matching this workflow's own entry contract; TIM-281 (outside this batch) references it via viaDistinctFrom only.

TEST CASES:
- [reopen] Given: the governing system supports renewing the expired entity in place → Expect: routed to external:renewal-lifecycle rather than the expiry being edited away directly
- [completion] Given: the expired entity cannot become valid and a new one must be issued → Expect: the expired entity is retained as distinct historical record, not merged with or overwritten by the replacement
- [cancellation] Given: the expiry was terminal by design with no restoring mechanism → Expect: x.terminal, with no re-entry path — a genuine dead end, not left open

GAPS:
- P2 (other): No instanceKey/concurrency declared.
- P2 (handoff-provenance): The mechanism keeping the expired entity and its replacement distinguishable-but-linked is asserted in prose without naming a concrete field (e.g. a predecessor/successor reference).

---

## TIM-70 — Scheduled Transition Validation

READINESS: READY_WITH_MAPPING

WHY:
This is the strongest-designed workflow in the batch: it closes the cancel/replace race explicitly ('a replacement that leaves the original alive applies both, in whichever order the scheduler happens to run them'), re-validates both version-match AND whether the underlying reasoning still holds (not just the version), and treats duplicate redelivery as the expected normal case rather than an error.

RESPONSIBILITY:
The general mechanism behind any future-scheduled state transition: persist the entity's expected version at schedule time, invalidate the job cleanly on cancellation or replacement, and re-validate the entity's current version against what was expected at execution time before applying anything — absorbing redelivery and detecting supersession or changed assumptions rather than blindly firing.

INSTANCE:
Scope is 'the scheduled transition plus the target entity and the version it expected to find'; no instanceKey. 'The expected version is the mechanism. Without it, execution has no way to tell whether the world moved underneath the schedule' — the clearest statement of the freshness-before-execution rationale anywhere in this batch.

ENTRY:
Trigger future_transition_scheduled, authoritative, requires a state transition scheduled for a future moment against a specific entity.

OWNERSHIP:
Fully automated scheduler-and-validator mechanism; no execution marker anywhere in this workflow.

ASSIGNMENT / QUEUE:
N/A — no human routing; external:rescheduling-decision owns the changed-assumptions escalation.

DATA:
Target entity, expected state/version, target state, effective time, and the reason it was scheduled — persisted at a.persist specifically so execution-time comparison is possible at all.

EVIDENCE:
N/A — not a review workflow; c.valid is a direct comparison of expected vs. current version.

AUTHORITY / APPROVAL:
N/A — no approval step within this workflow; c.valid's 'assumptions changed' branch escalates to an external rescheduling decision rather than the workflow re-deciding for itself.

IDEMPOTENCY:
a.apply is explicitly applied 'idempotently, keyed so that a redelivery of the same job cannot apply it twice', and c.duplicate checks whether the transition already applied before attempting it again — x.already ('duplicate execution absorbed') states plainly 'schedulers retry by design, so absorbing a redelivery is the normal case rather than an error path', a textbook at-least-once-with-idempotent-handling pattern. As with the rest of this file, the mechanism is prose-only, not a declared idempotencyKey field.

SLA / TIME:
w.effective waits for cancellation or replacement, timing out at 'the effective moment' itself → a.reread — the wait is watching for withdrawal before the scheduled moment arrives, not a business SLA in the usual sense.

ESCALATION:
N/A in the classic sense — c.valid routes directly to apply, supersession-suppression, or external rescheduling based on what execution-time finds, no priority/owner escalation tier.

CANCELLATION / SUPERSESSION:
a.invalidate explicitly ensures 'a cancelled or replaced schedule must not still fire'; c.valid's 'superseded' branch explicitly ensures 'an old schedule never overwrites a newer decision, whichever of the two the scheduler happens to reach first' — both race conditions this pattern exists to prevent are named and closed.

HANDOFFS:
- h.recalculate → external:rescheduling-decision: carries ["the original schedule, its reason and the version it expected","the entity's actual current state, so the decision is made again rather than applied blindly"]

COMPLETION:
Four distinct, named exits — cancelled, superseded, already-applied, applied — each with its own reEntry guidance; no outcome is collapsed into another, and none is silently treated as success when it is not.

RESULT / FEEDBACK:
external:rescheduling-decision is the real consumer of the changed-assumptions case; no canonical-workflow consumer is recorded, consistent with this being a general mechanism other workflows use the pattern from rather than literally call.

CORRECTION / REOPEN:
A replacing schedule runs as its own independent instance; a further scheduled change is explicitly 'its own intention with its own validation'.

OBSERVABILITY / AUDIT:
scheduled_transition_log appends at persist/invalidate/apply — captures the expected-vs-actual comparison that is this mechanism's whole point.

CONSUMER COVERAGE:
Classification: unconsumed-but-valid. consumers: [] despite this workflow's own distinctFrom explicitly claiming broad reuse ('every other scheduled change... runs through it'). No canonical workflow shows a formal handoff edge into TIM-70, which most plausibly means other workflows (e.g. TIM-64) independently reimplement the same pattern for their specific case rather than literally invoking this one — sound design, matching the OPS-126 precedent for a mechanism with no confirmed real handoff consumer.

TEST CASES:
- [duplicate-creation] Given: the same scheduled job is redelivered after already applying → Expect: absorbed via x.already as the normal case, not applied twice and not treated as an error
- [stale-work] Given: a newer authoritative change has already moved the entity past what the schedule expected → Expect: suppressed as superseded (x.superseded) rather than applied over the newer state
- [escalation] Given: the entity is still in a comparable state but the reasoning behind the schedule no longer holds → Expect: routed to external:rescheduling-decision rather than applied on stale reasoning

GAPS:
- P2 (other): No instanceKey/concurrency declared.
- P2 (consumer-coverage): Being a general, reusable mechanism, a company must explicitly wire every future-transition-scheduling caller in their system to route execution through this validation step — an expected but real mapping/integration task.

---

## TRM-101 — Entity Merge

READINESS: NEEDS_CONTRACT_WORK

WHY:
The consolidation logic itself is exemplary — per-state-type authority rules instead of blanket newest-wins, an explicit higher evidence bar for irreversible merges, and a thorough post-merge verification set. But the journey never names WHO holds the 'authority' that authorizes a merge (especially at the higher bar irreversibility requires), which is a P0-grade gap for a decision this consequential, and there is no explicit correction/unmerge path for a merge later found wrong.

RESPONSIBILITY:
Consolidates two or more representations of one identity into a canonical record, only after every dependent state type (consent, entitlements, obligations, active journeys, etc.) has been reconciled under its own authority rule.

INSTANCE:
The merge operation is explicitly its own auditable entity — source IDs, canonical target, basis, authorizing authority, and every conflict decision — functioning as a genuine instanceKey-equivalent even without the literal field. Concurrency of two merge operations touching overlapping source entities is not addressed.

ENTRY:
t.authorized (`merge_explicitly_authorized`), authoritative, with an explicit and strong insufficient-alone list (duplicate detection, high match score, an assessment concluding probable sameness — none of these alone authorize a merge). Real sender: REL-97 (h.merge), whose own carries explicitly state 'this journey has assessed and not authorised' — a clean, well-designed separation of assessment from authorization.

OWNERSHIP:
'The authority that authorised it' is recorded but never concretely named (role, system, or approval tier) anywhere in the journey — especially significant given the explicit higher bar required for irreversible merges.

ASSIGNMENT / QUEUE:
N/A — single-shot orchestration once authorized, not queue-routed.

DATA:
Identity attributes, consent, preferences, contact points, entitlements, purchases, subscriptions, support cases, opportunities, credentials, active journeys, open obligations, relationships — an unusually thorough and well-typed inventory, each type explicitly answering to its own authority rule rather than one blanket rule.

EVIDENCE:
Distinguishes a reversible-merge evidence bar from a materially higher irreversible-merge bar ('verified identifiers or authoritative external IDs... at the standard an unrecoverable decision demands') — precise for the irreversible case; the reversible-case bar is comparatively unspecified.

AUTHORITY / APPROVAL:
The core gap: no role/system is named as holding 'the authority' to authorize a merge, especially the elevated bar an irreversible merge requires.

IDEMPOTENCY:
No explicit idempotencyKey; the merge-operation record functions as a de facto single durable identity for the whole process, though re-authorization of the same merge twice is not addressed.

SLA / TIME:
N/A — no waits declared in this journey; conflict-driven delay is deferred entirely to TRM-102.

ESCALATION:
Conflicts are correctly deferred to TRM-102 (h.conflict) rather than resolved in place.

CANCELLATION / SUPERSESSION:
x.insufficient allows reentry with stronger evidence or a reversible architecture rather than forcing an irreversible merge on inadequate evidence — good. No explicit path to cancel an authorized-but-not-yet-executed merge, though the flow is effectively atomic (evaluate → consolidate → verify), making this acceptable.

HANDOFFS:
- h.conflict → TRM-102: carries ["the merge operation, the inventory and exactly which state conflicts","the fact that nothing has been consolidated yet, so the conflict is decided before rather than after"]

COMPLETION:
x.merged is reached only after c.verified passes a thorough business-level check (no lost obligation, no widened permission, no duplicated entitlement, no surviving duplicate active journey, source history traceable) — a strong completion contract that goes well beyond 'the operation ran.' A verification failure routes back to h.conflict (TRM-102) rather than a silent hard-fail.

RESULT / FEEDBACK:
REL-97 confirmed real sender. No downstream handoff consumes x.merged directly — presumably a system-of-record write read by other systems, acceptable for a terminal-domain journey.

CORRECTION / REOPEN:
x.merged's reEntry correctly requires a further duplicate candidate to be assessed on its own new evidence rather than silently re-triggering. However, there is no explicit path to reverse ('unmerge') a merge later discovered to be wrong, even though the pre-merge reversibility check (c.reversible) implies some merges are architecturally undoable — the undo mechanism itself is never described.

OBSERVABILITY / AUDIT:
merge_log appended at every step, explicitly including 'every conflict decision as it is made' — one of the strongest audit trails in the batch.

CONSUMER COVERAGE:
Classification: active. REL-97 is the confirmed real sender via h.merge; TRM-104 references this journey only in prose (distinctFrom).

TEST CASES:
- [self-approval] Given: the same automated process that produced a high match score also authorizes the merge → Expect: structurally this cannot happen — a duplicate detection or match score is explicitly insufficient alone to authorize; but WHO does authorize is never named
- [approval] Given: an irreversible merge is proposed → Expect: evidence must meet the higher bar named for irreversible operations — but no named authority reviews or confirms that bar was actually met
- [reopen] Given: a completed merge is later discovered to have consolidated two genuinely distinct identities → Expect: no explicit unmerge/reversal path is defined, even for merges the pre-merge check classified as architecturally reversible

GAPS:
- P0 (authority-approval): No role or system is named as holding the authority to authorize a merge, particularly at the elevated evidence bar the journey itself requires for irreversible merges.
- P1 (correction-reopen): No unmerge/reversal workflow is referenced for a merge later found to be wrong, despite the pre-merge reversibility check implying some merges are architecturally undoable.
- P2 (other): Concurrency of two merge operations touching overlapping source entities is not addressed.

---

## TRM-102 — Merge Conflict Resolution

READINESS: NEEDS_CONTRACT_WORK

WHY:
The fail-safe discipline is genuinely strong — no default-to-most-permissive, ambiguous identity halts the whole merge, and partial unwind limits are recorded rather than assumed away. But between conflict detection and SLA-driven escalation there is no named owner for actually resolving a conflict, and there's no explicit handoff back into TRM-101 to resume consolidation once a conflict resolves.

RESPONSIBILITY:
Classifies and resolves state that two merge sources hold incompatibly, failing safe (holding or aborting) wherever resolving would require inventing an authority the system doesn't have.

INSTANCE:
Scope is the merge operation plus the specific conflicting state — the conflict attaches to particular state, not the whole merge, explicitly stated. No literal instanceKey.

ENTRY:
t.conflict (`critical_merge_conflict_detected`), authoritative, precisely enumerated conflict types (identity, permission, ownership, obligation, credential). Real sender: TRM-101 exclusively (h.conflict), confirmed.

OWNERSHIP:
Between conflict detection and SLA expiry, no role is named as responsible for producing 'an authoritative or manual resolution' — the wait explicitly allows for manual resolution but never says who performs it, only that the escalation safety net (OWN-55) exists if the SLA runs out.

ASSIGNMENT / QUEUE:
Not named — flagged rather than N/A, since 'manual resolution' is an expected outcome with no queue/role attached to it.

DATA:
The specific conflicting state pairs across sources — clear.

EVIDENCE:
The applied policy rule (when one exists) functions as the decision's evidentiary basis; when no rule exists, the conflict itself becomes the recorded MERGE_CONFLICT state pending manual resolution.

AUTHORITY / APPROVAL:
a.resolve applies a deterministic policy rule when one exists — fine. When none exists (a.conflict-state), no authority is named until the SLA-driven escalation to OWN-55 fires — the same ownership gap as above, viewed from the authority angle.

IDEMPOTENCY:
N/A structurally for this decision node; re-detection of the same conflict on a retriggered event is not addressed (minor).

SLA / TIME:
w.resolution timeout = 'the conflict resolution SLA,' honestly sourced to a named policy concept rather than an invented number.

ESCALATION:
h.escalate → OWN-55 on SLA expiry is a real, clearly-triggered escalation, explicitly justified: 'a merge held in conflict leaves two records in a half-consolidated state, which is worse than either outcome and worth escalating rather than waiting out.'

CANCELLATION / SUPERSESSION:
a.abort explicitly unwinds partial consolidation 'where that is possible' and records precisely what could not be unwound — an honest, correct separation of stopping future work from reversing completed effects.

HANDOFFS:
- h.escalate → OWN-55: carries ["the conflict, its domain and what has been consolidated so far","the fact that the records are currently in a partially reconciled state, which is nobody's intended end state"]

COMPLETION:
Three outcomes: x.resolved (merge may complete), x.aborted (sources stay separate), x.partial (conflicted state left explicitly marked separate). None of these three exits carries an explicit handoff back to TRM-101 to actually resume consolidation — the loop-back is implicit, not modeled.

RESULT / FEEDBACK:
How x.resolved actually resumes TRM-101's a.consolidate step is not modeled as a handoff anywhere in this journey — a real result-feedback gap given TRM-101 is a separate journey, not a subroutine call.

CORRECTION / REOPEN:
x.aborted's reEntry correctly requires new evidence for any future merge attempt rather than a silent retry.

OBSERVABILITY / AUDIT:
merge_log at every step — good.

CONSUMER COVERAGE:
Classification: active. TRM-101 is the confirmed real (and only) sender via h.conflict.

TEST CASES:
- [concurrent-claim] Given: a conflict has no deterministic policy rule and enters manual resolution → Expect: someone with authority actually resolves it — but no role or queue is named as responsible before the SLA expires
- [handoff] Given: a conflict resolves (x.resolved) → Expect: TRM-101's consolidation actually resumes — but no handoff back to TRM-101 is modeled anywhere in this journey
- [cancellation] Given: a merge is aborted after partial consolidation had already occurred → Expect: whatever can be unwound is unwound, and what cannot be is recorded precisely rather than left ambiguous

GAPS:
- P1 (ownership): No role/queue is named as responsible for producing a manual conflict resolution before the SLA-driven escalation to OWN-55 fires.
- P1 (handoff-provenance): No explicit handoff models the return path from a resolved (or partially reconciled) conflict back into TRM-101's consolidation — the loop-back between these two journeys is implicit.

---

## TRM-103 — Account Consolidation

READINESS: NEEDS_CONTRACT_WORK

WHY:
The identity/account boundary discipline is a real strength (explicitly refuses to proceed if any part requires treating two people as one, and recalculates rather than unions permissions to avoid privilege escalation). But the authorizing authority is never named, and resource transfer actions carry no explicit idempotency guarantee despite being durable, retryable, state-changing operations.

RESPONSIBILITY:
Unifies business account structure across multiple accounts — transferring or referencing resources, reconciling obligations, and recalculating permissions — while every member's individual identity stays untouched.

INSTANCE:
Scope is the accounts being consolidated and the resulting canonical structure — 'accounts consolidate, people do not' is explicit. No literal instanceKey; concurrency of two consolidations touching overlapping accounts is not addressed.

ENTRY:
t.authorized (`account_consolidation_authorized`), authoritative, with an explicit insufficient-alone list (shared domain, billing address, or administrator alone do not authorize consolidation) — strong entry precision.

OWNERSHIP:
'The authority' that authorized consolidation is unnamed, the same generic-authority pattern seen across TRM-101/TRM-104.

ASSIGNMENT / QUEUE:
N/A — single-shot orchestration.

DATA:
Members, roles, contracts, subscriptions, resources, entitlements, billing relationships, open cases, ownership, active obligations — thorough inventory.

EVIDENCE:
N/A — this is an authorized structural change, not an evidentiary review.

AUTHORITY / APPROVAL:
Same generic-authority gap as above. Positively: c.identities correctly rejects (x.not-here) and refuses to proceed if any part of the consolidation would require treating two people as one — good boundary discipline that prevents this journey from silently absorbing TRM-101's responsibility.

IDEMPOTENCY:
a.transfer and a.reference carry no idempotencyKey or dedupe mechanism; a retried consolidation attempt could plausibly double-transfer a resource — unlike RLT-244/RLT-248/RLT-249's explicit stable-operation-identity pattern, this journey does not name an equivalent guarantee for a durable, state-changing action.

SLA / TIME:
N/A — no waits declared.

ESCALATION:
h.escalate → OWN-55 on verification failure (duplicated entitlement, lost obligation, widened access, orphaned resource) — consistent with the pattern used elsewhere in this batch.

CANCELLATION / SUPERSESSION:
N/A directly modeled; x.not-here acts as a clean 'reject, don't proceed' rather than a mid-flight cancellation.

HANDOFFS:
- h.reconcile → external:commitment-reconciliation: carries ["each obligation, its source account and what makes them incompatible","the explicit fact that nothing has been cancelled by the consolidation"]
- h.escalate → OWN-55: carries ["which check failed and on what","the consolidated structure as it currently stands, which is not the intended end state"]

COMPLETION:
x.consolidated is reached only after c.verified checks no duplicated entitlement, no lost obligation, no widened access, and no orphaned resource — mirrors TRM-101's completion discipline well, correctly distinguishing 'consolidated' from 'identity merged.'

RESULT / FEEDBACK:
TRM-101 references this journey only in prose (distinctFrom); no confirmed real consumer of TRM-103's output via handoff — acceptable for a system-of-record structural change.

CORRECTION / REOPEN:
x.consolidated's reEntry only covers a further consolidation being assessed against the resulting structure; no explicit 'un-consolidate' or correction path exists for a consolidation later found to be wrong.

OBSERVABILITY / AUDIT:
consolidation_log at every step — good.

CONSUMER COVERAGE:
Classification: event-driven. No real handoff sender exists in the dump (TRM-101 only references this in prose). `account_consolidation_authorized` is plausibly emitted by an external business-structure/account-management authority.

TEST CASES:
- [duplicate-creation] Given: a consolidation attempt is retried after a partial failure → Expect: resources are not transferred a second time — but no idempotencyKey or dedupe mechanism is named to guarantee this
- [escalation] Given: post-consolidation verification finds a duplicated entitlement or widened access → Expect: this is escalated to OWN-55 rather than reported as a successful consolidation

GAPS:
- P1 (authority-approval): No role or system is named as holding the authority to authorize an account consolidation.
- P1 (idempotency): Resource transfer/reference actions carry no idempotencyKey or dedupe guarantee despite being durable, state-changing operations — a retried consolidation could double-transfer a resource.
- P2 (correction-reopen): No un-consolidate or correction path exists for a consolidation later found to be wrong.

---

## TRM-104 — Primary Relationship Transfer

READINESS: READY_WITH_MAPPING

WHY:
The scoping discipline is excellent — an explicit list of what the relationship governs, an explicit exclusion list for what stays with the dependent, and a strong atomicity guarantee ('the dependent is never left between two primaries'). The one real gap is the unnamed authorizing authority, common to this whole terminal-domain cluster.

RESPONSIBILITY:
Moves a dependent entity to a new primary, transferring only the dependencies the primary relationship itself governs while explicitly protecting the dependent's own independently-held permission and consent.

INSTANCE:
Scope is the dependent entity, its outgoing primary, and its incoming primary — a clear scope triple, no literal instanceKey.

ENTRY:
t.transfer (`primary_relationship_transfer_authorized`), authoritative, requires the dependent, outgoing primary and incoming primary all named.

OWNERSHIP:
Same generic-authority gap as the rest of this cluster: WHO authorizes the transfer is never named.

ASSIGNMENT / QUEUE:
N/A.

DATA:
What the primary relationship governs (rights, notifications, responsibilities, billing, access, ownership, open obligations) is explicitly enumerated, with an explicit carve-out for what the dependent holds independently — a real strength that guards against over-transfer.

EVIDENCE:
N/A.

AUTHORITY / APPROVAL:
c.valid checks the incoming primary's eligibility/entitlement, but who verifies that is unnamed (same pattern). Positively, c.independent explicitly protects the dependent's own consent/permission from being overwritten by the incoming primary's state — tested directly against 'a dependent who opted out does not become opted in because their primary is.'

IDEMPOTENCY:
No idempotencyKey/dedupe named for a.transfer; lower risk than a bulk resource transfer given this is typically a single relationship change, but still undeclared.

SLA / TIME:
N/A — no waits.

ESCALATION:
h.orphan → REL-100 when verification finds zero or two primary relationships — a real safety net enforcing the exactly-one-primary invariant.

CANCELLATION / SUPERSESSION:
x.rejected leaves the existing primary relationship standing with no orphan window — explicit: 'the dependent is never left between two primaries while the question is open.' Strong atomicity.

HANDOFFS:
- h.orphan → REL-100: carries ["the dependent, what was transferred and what it now lacks","its inherited obligations and their unchanged deadlines"]

COMPLETION:
x.transferred is reached only after c.verified confirms exactly one valid primary (not zero, not two) — a clear invariant-based completion contract.

RESULT / FEEDBACK:
CTL-234 references this journey only in prose (distinctFrom); no confirmed real consumer of the transfer's output via handoff — acceptable for a system-of-record relationship change.

CORRECTION / REOPEN:
Both exits have sensible, non-ambiguous reentry (a different incoming primary validated fresh; a further transfer validated against the current primary).

OBSERVABILITY / AUDIT:
primary_transfer_log at every step — good.

CONSUMER COVERAGE:
Classification: event-driven. No real handoff sender exists in the dump (CTL-234 only references this in prose). `primary_relationship_transfer_authorized` is plausibly emitted by an external account/relationship-management authority.

TEST CASES:
- [handoff] Given: a transfer completes and verification finds the dependent now holds two valid primaries → Expect: this is escalated to REL-100 as an orphan/multi-primary condition rather than silently accepted
- [completion] Given: the dependent held permission or consent independently of the outgoing primary → Expect: that state is preserved through the transfer rather than inherited or overwritten from the incoming primary

GAPS:
- P1 (authority-approval): No role or system is named as holding the authority to authorize a primary relationship transfer.
- P2 (idempotency): No idempotencyKey/dedupe is named for the transfer action itself.

---

## TRM-109 — Data Deletion Validation

READINESS: NEEDS_CONTRACT_WORK

WHY:
The scoping discipline is excellent — explicit refusal to invent retention rules where policy is silent, explicit rejection of account closure/unsubscribe/cancellation as equivalent to a deletion request. The gaps are a missing explicit approval checkpoint before irreversible execution beyond automated classification, and no treatment of concurrent overlapping deletion requests for the same subject.

RESPONSIBILITY:
Scopes and classifies a data deletion request against governing policy and retention obligations, deciding exactly what may be deleted, what must be retained and why, before any actual deletion executes.

INSTANCE:
Scope is the data subject, this specific deletion request, and its named data scope. Concurrency of two overlapping deletion requests for the same subject is not addressed — a real concern for a legally-deadlined process.

ENTRY:
t.request (`data_deletion_requested`), authoritative, with an explicit and strong insufficient-alone list (account closure, subscription cancellation, and unsubscribe are all explicitly NOT a deletion request) — directly guards against a common real-world conflation.

OWNERSHIP:
c.authority requires the requester's identity/authority to be established (h.verify → IDN-82 if not) before anything proceeds — good discipline. After that, scope/classification work is implicitly system-owned, with MANUAL_REVIEW routed explicitly to DEC-181 for anything automation can't classify.

ASSIGNMENT / QUEUE:
N/A for the automated path; DEC-181 handles the escalated/manual-review case.

DATA:
Scope, jurisdiction, policy context, in-scope systems and data classes — clear, sourced from the request plus governing policy.

EVIDENCE:
N/A in the review-evidence sense — this is a classification (DELETABLE / RETAIN_REQUIRED / DEPENDENCY_BLOCKED / ALREADY_DELETED / MANUAL_REVIEW) against policy, not an adjudication of external evidence.

AUTHORITY / APPROVAL:
a.retain explicitly refuses to invent a retention rule where policy is silent — excellent, directly matching the round's house rule. However, h.execute proceeds to actual deletion once data is classified DELETABLE with no separate named human approval step before an irreversible action, beyond the MANUAL_REVIEW safety net for cases automation can't classify.

IDEMPOTENCY:
N/A for this journey (a classification/validation step, not itself a duplicate-creation-prone execution — that's TRM-110's job).

SLA / TIME:
w.dependency timeout = 'the request's SLA,' honestly tied to a legal-deadline concept; onTimeout routes to h.review (DEC-181) rather than proceeding blind — good.

ESCALATION:
h.review → DEC-181 for both MANUAL_REVIEW classification and dependency-timeout cases — a consistent escalation path.

CANCELLATION / SUPERSESSION:
N/A — not addressed either way in source for a deletion request once validated.

HANDOFFS:
- h.verify → IDN-82: carries ["the request and the verification it is blocked on","the request's own deadline, which the verification does not reset"]
- h.execute → TRM-110: carries ["the exact scope approved, per system and data class","what is being retained and under which obligation, so execution does not remove it"]
- h.review → DEC-181: carries ["the request, its deadline and what specifically is unresolved","the retention obligations already identified"]

COMPLETION:
x.nothing (nothing in scope to delete) is the only local exit; the main deletable path hands off to TRM-110 rather than completing here — correctly separates scoping/validation from actual execution.

RESULT / FEEDBACK:
TRM-275 (a customer-facing journey) references this only in prose (distinctFrom), not a confirmed real consumer via handoff — no explicit notification handoff exists for the x.nothing outcome specifically.

CORRECTION / REOPEN:
x.nothing's reEntry allows data arriving later within the same scope to be assessed against this request 'where the policy allows' — reasonably policy-gated.

OBSERVABILITY / AUDIT:
deletion_request_log at every step including per-item classification — strong, well-suited to compliance needs.

CONSUMER COVERAGE:
Classification: event-driven. No real handoff sender exists in the dump (TRM-275 only references this in prose). `data_deletion_requested` is plausibly emitted by an external privacy/DSAR intake system or support channel.

TEST CASES:
- [missing-evidence] Given: an account closure or unsubscribe request arrives → Expect: this is not treated as a data deletion request — the two are explicitly distinct triggers with different requirements
- [approval] Given: data is classified DELETABLE and no dependency blocks it → Expect: it proceeds to TRM-110 for execution — with no separate named human approval step beyond the automated classification itself
- [escalation] Given: a dependency blocking deletion has not cleared by the request's SLA → Expect: this routes to manual review (DEC-181) rather than continuing to wait past a likely legal deadline

GAPS:
- P1 (authority-approval): No separate named human approval exists before an irreversible deletion executes, beyond automated classification and the MANUAL_REVIEW safety net for cases automation cannot classify.
- P1 (consumer-coverage): Concurrency of two overlapping deletion requests for the same subject is not addressed, despite the legally-deadlined and irreversible nature of the work.
- P2 (result-feedback): No handoff notifies the requester on the x.nothing (nothing to delete) outcome specifically.

---

## TRM-110 — Data Deletion Reconciliation

READINESS: READY_WITH_MAPPING

WHY:
This is the strongest completion-contract statement in the batch — 'never represented as complete... the most consequential false report in this library' for a partial deletion failure — paired with explicit, correct idempotency treatment naming the exact real-world failure mode (a stale sync job silently recreating deleted data). The one real production gap is the absence of a stated policy for a copy discovered after VERIFIED_COMPLETE was already recorded.

RESPONSIBILITY:
Propagates an approved deletion scope through every affected system, keyed to prevent double-execution and downstream sync from recreating deleted data, and verifies every system actually reached its required terminal state before declaring completion.

INSTANCE:
Scope is the deletion job and each affected system's operation individually — explicitly 'each system's operation has its own type and its own terminal state,' a strong per-(job, system) instance concept even without a literal instanceKey field.

ENTRY:
t.approved (`data_approved_for_deletion`), authoritative, requiring an approved scope per system and data class from a validated request — matches TRM-109's h.execute carries precisely, confirmed in both directions.

OWNERSHIP:
Fully automated propagation; ownership transfers explicitly and cleanly to OWN-55 on escalation (retry budget exhausted or non-clearing failure).

ASSIGNMENT / QUEUE:
N/A — automated per-system propagation.

DATA:
Approved scope per system/data class — already validated upstream by TRM-109, a clean separation of what-to-delete (TRM-109) from execute-and-verify (TRM-110).

EVIDENCE:
N/A — execution/propagation and verification, not an adjudication of external evidence.

AUTHORITY / APPROVAL:
N/A — approval already established upstream; this journey executes an already-approved scope.

IDEMPOTENCY:
Excellent and explicit: 'execute idempotently, keyed so a redelivered job does not repeat an operation, and so that nothing propagates back through downstream synchronisation to recreate what was just removed' — directly names and guards against the exact real bug pattern (a sync job restoring a profile after deletion). a.retry explicitly retries 'outstanding operations only... so a partially completed deletion is completed rather than restarted.'

SLA / TIME:
w.confirmations timeout = 'the deletion SLA,' honestly sourced; explicitly treats silence as not confirmation ('silence from a system is not confirmation') — correctly avoids conflating no-response with success, matching the round's provider-accepted-≠-delivered discipline applied here to system silence.

ESCALATION:
c.retry checks 'the budget fixed at the first failure' (a bounded concept, no invented number) before escalating to OWN-55; h.escalate's `suppresses` field explicitly blocks any representation of the deletion as complete while a target remains — an excellent, explicit guard against false-complete reporting.

CANCELLATION / SUPERSESSION:
N/A — deletion execution is not addressed as cancellable mid-flight, reasonable given the legal-deadline framing.

HANDOFFS:
- h.escalate → OWN-55: carries ["which systems remain outstanding and what was attempted","the request's deadline, which is often a legal one and does not move because a system did not respond"]

COMPLETION:
x.complete (VERIFIED_COMPLETE) is reached only when every in-scope target reaches its required terminal state; a.partial is explicitly and strongly never represented as complete. This is the clearest, most forceful technical-vs-business-completion statement in the entire batch and should be treated as this round's reference pattern alongside OPS-130.

RESULT / FEEDBACK:
TRM-109 confirmed as the real sender, matching its own h.execute expectations exactly. No further downstream handoff is needed post-verification — the system-of-record write is the natural terminal point for this domain.

CORRECTION / REOPEN:
x.complete's reEntry correctly treats a later request covering different scope as its own new job rather than reopening this one. However, the journey only handles a new copy discovered 'while the request was running' (mid-execution) — it states no policy for a copy surfacing after VERIFIED_COMPLETE was already recorded (e.g. a backup restore reintroducing deleted data weeks later), which is exactly the 'late evidence should not silently reopen... unless policy says so' scenario, but here no policy is stated either way.

OBSERVABILITY / AUDIT:
deletion_job_log throughout, thorough and precise per system and per operation.

CONSUMER COVERAGE:
Classification: active. TRM-109 is the confirmed real sender via h.execute.

TEST CASES:
- [duplicate-creation] Given: a deletion job is redelivered after already succeeding → Expect: the keyed idempotent execution does not repeat the operation, and downstream sync does not recreate what was removed
- [completion] Given: every required system except one confirms deletion → Expect: the deletion is recorded as PARTIAL_DELETION_FAILURE, never represented as complete, until the outstanding system is retried and confirmed or the case is escalated
- [reopen] Given: a further copy of the deleted data is discovered after VERIFIED_COMPLETE was already recorded → Expect: no stated policy exists for this case — the journey only addresses copies discovered while the request was still running

GAPS:
- P1 (correction-reopen): No stated policy exists for a copy of deleted data discovered after VERIFIED_COMPLETE was already recorded — only mid-execution discovery (c.new-copy) is handled.

---

