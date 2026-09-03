# Fixes Applied — Silent Lifecycle States, round 2 (repair)

Closes every P0 the round-1 audit (`LIFECYCLE-STATES-AUDIT.md`) found across the 64 Silent
Lifecycle States: 41 P0 findings on 37 states, all fixed directly in `src/canonical/*.ts`,
verified against each journey's own declared `entity.instanceKey` / `implementation.attributes`
(never against the audit's wording alone), and re-derived into
`research/lifecycle-state-production-readiness/lifecycle-state-contracts.json` and
`READINESS-MATRIX.md` from the fixed source. `npm run validate:canonical` passes with 0 errors
throughout; see `VALIDATOR-COVERAGE.md` for the three new validators added to keep these defect
shapes from recurring, and the "FINAL VALIDATION" section at the bottom of this file for the full
suite run at the end.

## Corpus

Unchanged from round 1: 64 genuinely silent Customer Journeys (`surface === "customer" && !sends
&& !routesToHuman`, derived, not hand-listed), 68 message-sending Customer Journeys and 3
human-routing-only ones (ACQ-04, ACT-11, RET-24) both untouched this round, 24 Runtime Mechanisms
and 124 Operational Workflows both untouched this round. Re-dumping the 64 ids from current
source after every fix in this round confirms the set is exactly the same 64 — no topology
change added or removed a state.

## P0 items, by defect shape

Round 1 found the corpus-wide idempotency defect had (at least) six distinct shapes needing
different fixes. All 41 P0s fall into these six shapes plus one handoff-provenance cluster;
grouping by shape (as the communication round's own `FIXES-APPLIED.md` did) is more useful than
41 near-identical flat entries — each state's own `idempotencyKey`/handoff change is still named
individually below.

### Shape 1 — wrong-field substitution (majority of the 41)

**Before:** `idempotencyKey` referenced a field the journey's own `implementation.attributes`
never declares — `person_id`, `account_id`, `subscription_id`, `contact_point_id`, or
`obligation_id` used in place of the journey's real, declared instance-scoping field(s), almost
certainly copy-pasted from a different journey's authoring template (the same root cause the
communication round diagnosed on 36 message-sending journeys — see that round's own
`FIXES-APPLIED.md` — now confirmed to extend to the silent side of the corpus too).

**Root cause:** the field named in the idempotencyKey string was never cross-checked against the
journey's own `entity.instanceKey` at authoring time.

**After:** every key rewritten to the journey's own declared instance key, one journey at a time,
each verified by reading `entity.instanceKey` directly before editing (not inferred from the
audit's prose, per this round's own "verify every proposed fix against source" instruction):

- **ACC-71** (`account_id + entitlement_key`): `a.evaluate`, `a.reconcile`, `a.grant`.
- **ACC-78** (`account_id + capability_scope`): `a.scope`, `a.preserve`, `a.full`, `a.extend`.
- **ACC-79** (`account_id + restoration_case_id`): `a.reevaluate`, `a.restore-full`,
  `a.restore-subset`.
- **ACQ-01** (`anonymous_profile_id`): `a.reconcile`.
- **ACQ-02** (`lead_id`): `a.record`.
- **ACQ-05** (`lead_id`): `a.read`, `a.mark-recycle`, `a.requalify`.
- **ACQ-06** (`entity_ref + rule_id`): `a.evaluate`, `a.reconcile`, `a.block`.
- **ACQ-08** (`person_id + destination_entity_id`): `a.scope`, `a.suppress` (its `h.next`
  handoff contract corrected to match, a bonus fix beyond the original finding — the same
  undeclared `contact_point_id` also appeared there).
- **ACQ-10** (`lead_id + decline_id`): `a.capture`.
- **CON-31** (declared consent instance key): `a.capture`, `a.narrow`, `a.reconcile`,
  `a.activate`.
- **FIN-136**: idempotencyKeys were already correct in round 1 (P0 here was handoff-only — see
  Identifier provenance below).
- **FUL-141** (`order_id`): `a.capture`, `a.reject`, `a.hold`, `a.accept`.
- **FUL-142** (`order_id`): `a.evaluate`, `a.backorder`, `a.unavailable`.
- **FUL-143** (`order_id`): `a.reserve`, `a.temporary`, `a.allocated`, `a.release`, `a.expire`.
- **FUL-144** (`order_id`): `a.in-fulfillment`, `a.fulfilled`, `a.partial`, `a.failed`.
- **FUL-147** (`order_id`): `a.persist`, `a.unknown`.
- **FUL-149** (`order_id + delivery_id`): `a.record`, `a.finalize`.
- **IDN-88** (`issue_id`): all five writing actions.
- **IDN-89** (`account_id + attribute_id`): `a.sensitivity`, `a.update`, `a.propagate`,
  `a.reconcile`.
- **IDN-90** (`incident_id + account_id`): `a.scope`, `a.contain`, `a.open`, `a.confirmed`,
  `a.cleared`.
- **RET-23** (`account_id + relationship_id`): `a.decompose`, `a.diagnostic`, plus the
  `h.technical`/`h.payment`/`h.ownership` contract blocks, all of which shared the same
  undeclared `subscription_id`.
- **RET-29** (`relationship_id` — dropping the undeclared `subscription_id` entirely, not
  substituting it, since `relationship_id` alone is this journey's actual instance key):
  `a.invalidate`, `a.termination-state`, `a.wind-down`, plus `h.obligations`' own contract.
- **REL-94** (`account_id + member_id + role_id`): `a.delta`, `a.apply`.
- **REM-156** (`correction_id`): `a.define`, `a.preserve`, `a.execute`, `a.partial`.
- **SUB-161** (`relationship_id` — again dropping the undeclared `subscription_id`, the third
  independent instance of this exact token appearing where it was never declared, after RET-23
  and RET-29): all six writing actions.
- **CON-33**: idempotencyKey substitution did not apply — see Shape 2 (total absence).

**Contract change:** none — every fix is an `idempotencyKey`/handoff-`contract.requiredFields`
string correction inside an existing action/handoff node; no node added, removed, or rewired.

**Validator/test:** `scripts/vnext-rules.mjs`'s pre-existing `idempotency_field_undeclared`
Validator A now errors for every customer-surface vNext journey (`isCustomer && vnext`, widened
from `orchestrated && vnext` — see `VALIDATOR-COVERAGE.md`), so these 25+ corrected keys are
now enforced going forward, not just fixed once. `npm run validate:canonical`: 0 errors.

### Shape 2 — total absence of an idempotencyKey (SCH-174, SCH-177, TIM-65, CON-33)

**Before:** the writing action declared no `idempotencyKey` at all — not a wrong reference, an
absent one.

**Root cause:** these four actions were the only ones in their respective journeys not carrying
the field, suggesting an authoring omission rather than a template-copy error.

**After:**
- **SCH-174** (`booking_id`): `a.determine`, `a.initiate`, `a.at-risk`, `a.ready` all now
  declare `idempotencyKey`.
- **SCH-177** (`booking_id + occurrence_id`): `a.suppress`, `a.blocked`, `a.ready`.
- **TIM-65** (`entity_id + grace_period_id`): `a.record`, `a.restore`.
- **CON-33** (`person_id`): `a.adapt` — which also gained a `writes` entry
  (`adapted_sends`, append) it previously lacked entirely, closing the matching P2
  observability gap in the same edit (it is now tracked as data, not just inferable from
  downstream effects).

**Contract change:** none.

**Validator/test:** the new **Validator C** (`state_write_without_idempotency`,
`scripts/vnext-rules.mjs`) errors on any writing action in a silent state (`isCustomer &&
!orchestrated`) with no `idempotencyKey` — a total-absence check the pre-existing
`idempotency_field_undeclared` rule could not catch (it only flags a *wrong* reference, not a
*missing* one). See `VALIDATOR-COVERAGE.md`.

### Shape 3 — malformed pseudo-keys (SUB-165)

**Before:** `a.recovery` and `a.restrict` used literal prose fragments as their
`idempotencyKey` value — `"renewal_cycle_id + grace state"` and `"renewal_cycle_id +
restriction scope"` — neither a real field reference, and both omitting `subscription_id`, half
of this journey's declared composite instance key (`subscription_id + renewal_cycle_id`).

**Root cause:** the two keys were hand-written as descriptive phrases rather than field
references, the single worst-documented state in the round per the original audit.

**After:** both rewritten to `subscription_id + renewal_cycle_id + a.recovery` /
`subscription_id + renewal_cycle_id + a.restrict`, matching the journey's own declared
`entity.instanceKey` exactly. `a.state`, `a.alternate`, `a.lapse` — which declared no
idempotencyKey at all (a second, distinct defect in the same journey, Shape 2) — now also carry
the same composite key.

**Contract change:** none.

**Validator/test:** Validator A (malformed-reference detection) plus Validator C
(total-absence detection) together now cover both defects found in this one journey.

### Shape 4 — premature identifier (REL-100, SCH-173)

**Before:** the `idempotencyKey` referenced a field (`relationship_id`, `booking_id`) that, by
the journey's own stated premise, structurally does not exist yet for most of the journey's own
life — REL-100 exists specifically because no `relationship_id` has been assigned; SCH-173 exists
specifically before a `booking_id` is minted at confirmation.

**Root cause:** the same template-copy pattern as Shape 1, but here the substituted field is not
merely undeclared — it is a field this journey's own design guarantees does not yet exist,
making the defect a design contradiction, not just a missing declaration.

**After:**
- **REL-100** (`entity_ref + relationship_type` — the identifiers the journey's own premise
  guarantees exist): `a.state`, `a.hold`, `a.reassign`, `a.revalidate`.
- **SCH-173** (`reservation_request_id` — the identifier that actually exists for this
  journey's whole life): `a.capture`, `a.reject`, `a.pending`, `a.lapse`, `a.confirm`.

**Contract change:** none.

**Validator/test:** Validator A. `npm run validate:canonical`: 0 errors on both journeys.

### Shape 5 — dropped composite-key component (SCH-175, TRM-107)

**Before:** the journey's own declared `entity.instanceKey` is a composite (two fields), but
every action's `idempotencyKey` used only one half.

**Root cause:** authoring omission — the composite nature of the instance key was not carried
through consistently from the entity declaration into every action.

**After:**
- **SCH-175** (`booking_id + reschedule_request_id`, restoring the dropped
  `reschedule_request_id` half): `a.preserve`, `a.no-replacement`, `a.transfer`,
  `a.release-old`, `a.reconcile`.
- **TRM-107** (`account_id + closure_id`, restoring the dropped `closure_id` half):
  `a.inventory`, `a.verify-termination`, `a.separate`, `a.record-final`, `a.record-unresolved`,
  `a.record-remaining`.

**Contract change:** none — a review-only **Validator D**
(`composite_instance_key_component_missing`) was added to flag this shape going forward without
ever hard-erroring (see below and `VALIDATOR-COVERAGE.md` for why it stays warn-only).

**Validator/test:** Validator A (single-field defects) plus the new Validator D
(composite-specific, warn-only review signal). `npm run validate:canonical`: 0 errors.

### Shape 6 — wrong-granularity mismatch (TRM-108)

**Before:** all three writing actions keyed on `obligation_id + account_id`, but TRM-108's own
declared `entity.instanceKey` is `account_id` alone — one instance per account-level closure,
not one per obligation. `obligation_id` was not merely undeclared; it was the wrong granularity
entirely for this journey's own concurrency model.

**Root cause:** the field was carried over from a per-obligation sibling journey without
checking that TRM-108 itself operates at a coarser (account-level) granularity.

**After:** `a.suppress`, `a.guard`, `a.scope` now key on `account_id` alone — the field is
dropped, not replaced, since this journey never needs per-obligation resolution.

**Contract change:** none.

**Validator/test:** Validator A. `npm run validate:canonical`: 0 errors.

## Systemic repairs

### Idempotency

All six shapes above are one systemic defect class — the same corpus-wide authoring-template
problem the communication round found on 36 message-sending journeys, confirmed this round to
extend to the silent side (37 of 64 states, 58%). Closed at the source (every key now reads
against the journey's own declared instance key) and enforced going forward by Validator A
(widened scope) plus the two new validators (C: total absence, D: composite-component
omission, review-only).

### Identifier provenance — "fix the sink, not the source"

Round 1's finding #4: **a single shared-target handoff gap has four independent senders.**
ACC-78's `h.restore`, FIN-136's `h.restore`, and both of IDN-90's handoffs (`h.recover`,
`h.lift`) all sent into ACC-79 without carrying `restoration_case_id` — the field ACC-79's own
`entity.instanceKey` requires and could not construct from any of the four.

**Fix applied at the sink, once, then propagated identically to every sender** — per the round's
explicit instruction to prefer fixing the receiving contract over patching each caller:

- **ACC-79**'s own `entity.note` now documents the minting convention explicitly:
  `restoration_case_id` is minted by whichever journey initiates eligibility for restoration — a
  suspension ending, a balance reconciling, a security incident clearing — deterministically
  from that journey's own instance identity, carried explicitly in its handoff's
  `contract.requiredFields`.
- **ACC-78**'s `h.restore` now mints `restoration_case_id` deterministically from
  `account_id + capability_scope + this suspension's own review outcome`.
- **FIN-136**'s `h.restore` now mints both `account_id` (resolved from the obligation record's
  own payer/account scope, per FIN-131's own entity note establishing that concept) and
  `restoration_case_id` (derived from `obligation_id` and the restriction it caused) — FIN-136
  itself never declares `account_id`, so this was the one case in the cluster needing two
  fields resolved, not one.
- **IDN-90**'s `h.recover` and `h.lift` each now mint `restoration_case_id` from `incident_id`
  and their own outcome (confirmed-compromise / cleared, respectively).

All four now carry `contract: { requiredFields: [..., "restoration_case_id"] }`, and ACC-79's
own P0 (idempotencyKeys, Shape 1 above) closes the receiving side. One documented convention,
applied identically four times — not four different ad hoc schemes.

**The same pattern, applied to three more clusters, all closed:**

- **FUL-145** (missing `exception_id`): FUL-143's and FUL-144's `h.exception` both now mint
  `exception_id` at the handoff.
- **FUL-149** (missing `delivery_id`): FUL-144's and FUL-147's `h.confirm` both now mint
  `delivery_id` at the handoff (FUL-147's `h.reconcile` contract, which referenced the same
  undeclared `order_id`, was corrected in the same pass).
- **REM-151** (missing `issue_id`, outside this round's 64 — a communication-round journey, the
  fourth cumulative sender into this target counting the three the communication round already
  found): FUL-149's `h.issue` now mints `issue_id` at the handoff.

**Two single-sender provenance gaps, also closed:** ACQ-01's `h.qualification` now mints a
fresh `lead_id` for ACQ-05, deterministically derived from the reconciled profile's own
account/person identity; ACT-16's `h.adoption` now mints `use_case_id` explicitly for ACT-17
instead of leaving it implicit.

**One deliberately not closed: IDN-87's `h.security` → IDN-90 (`incident_id`).** IDN-88's
identical handoff into the same target is fixed (resolves `incident_id` via the account's
already-open IDN-90 instance). IDN-87 carried no P0 in round 1 — it was already
`READY_WITH_MAPPING` — and this round's own scope discipline (fix P0s; extend to a P1 only when
it is the identical defect *inside the same journey* as a P0 just fixed) argued against widening
the fix into a second journey on a P1-only basis. The convention is proven and ready to apply to
IDN-87 in a follow-up pass; it remains IDN-87's one documented P1.

**Never blindly promoted:** Validator B (`handoff_identifier_unprovenanced`) stays warn-only,
corpus-wide, exactly as the communication round decided and this round's brief explicitly
reaffirmed — a structural check cannot tell a legitimate self-minting target from a genuine gap
reliably enough to hard-error.

### Fresh-state revalidation

Round 1's finding #5 named the "revalidate from now, never from the scheduling-time snapshot"
principle as the strongest architectural idea in this half of the corpus — found independently
in SCH-177, SUB-162, SUB-168, SUB-169, SUB-166, TRM-105, and TIM-62. It was already fully
present in the graph (every one of those states re-reads authoritative current state before
acting on a fired timer) — the gap was that it was an unenforced convention, not a mechanical
rule. Formalized this round as **Validator E** (`wait_no_recheck_before_mutation`,
`scripts/vnext-rules.mjs`), built on the corpus's own pre-existing `WaitNode.recheck` field
rather than inventing a new one: every wait whose `onTimeout` reaches a state-mutating action
without a `recheck` declaration is now flagged. See `VALIDATOR-COVERAGE.md` for severity and
false-positive-rate reasoning.

### Conflict/exclusivity

Round 1's finding #9: only two working structured `contact.competition` examples existed
(`purchase-intent`: ACQ-07/ACQ-08; `relationship-continuity`: SUB-167, one-sided). Every other
real cross-state relationship — including ACC-78/IDN-90 — was prose-only.

**ACC-78/IDN-90 formalized, the one genuine structured conflict this round found grounds to
close** (both states already in this round's 64, both already stated the relationship in prose,
the precedence question — a security incident is more urgent than a business-reason suspension —
was already explicit in both states' own text, not invented for this fix):

- **IDN-90** gained `competition: { scope: "account", exclusionGroup:
  "account-restriction-authority", precedence: "highest in the group", onLoss: "paused" }`.
- **ACC-78** gained the matching `competition` block, `precedence: "lower than a
  suspected-compromise investigation (IDN-90)"`, `onLoss: "paused"`.

Both pass the corpus-wide `competition_group_of_one` / `competition_scope_split` /
`competition_incomplete` / `competition_onloss` checks in `scripts/vnext-rules.mjs` (pre-existing
rules, unmodified — they now have a third passing group to validate, not a new rule).

**Not formalized, deliberately: RET-23/RET-24.** RET-24 sits outside this round's 64; declaring
RET-23's own side of an exclusion group without the counterpart's actual precedence value would
mean inventing half a company-specific policy this round has no grounds to set. Left as RET-23's
one remaining P2, per the brief's explicit "never invent company-specific policy values."

## Additional P1 repairs

Fixed only where the P1 shares the exact root cause of a P0 just fixed in the same journey (per
the brief's Part 15 — never as a separate expansion of scope):

- **RET-22**: `a.inspect` gained a `writes` entry (`corroborating_evidence`, append) and an
  idempotencyKey — it previously wrote nothing at all, the one state in the corpus where no
  action wrote anything, which directly broke its own stated re-entry model ("absence
  accumulates into evidence, it does not start as evidence" requires something to persist
  between instances).
- **IDN-89**: `change_origin` and `change_version` are now declared required attributes —
  load-bearing for `s.g3`'s late-arrival-discard rule, which previously had no data to run
  against. Fixed alongside the same journey's Shape-1 idempotency P0.
- **ACQ-08**: `h.next`'s own contract block, which referenced the same undeclared
  `contact_point_id` as the P0 idempotencyKeys, corrected in the same pass.
- **ACT-16**: `h.adoption` now mints `use_case_id` explicitly (see Identifier provenance above)
  — ACT-16 itself carried no P0 (its own idempotencyKeys were already clean), so this is a
  standalone P1 fix, included because it is the identical, already-proven minting-convention
  pattern applied elsewhere this round, not a new pattern invented for it.
- **FUL-141**: `obligation_id`, used but never formally declared, is now a declared optional
  attribute — closing the matching P2 alongside the P0 idempotency fix in the same journey.
- **FUL-147**: `h.reconcile`'s own contract, sharing the P0's undeclared `order_id`, corrected
  in the same pass.

## Remaining known non-blocking gaps

Deliberately not fixed — none block P0=0, and each has a stated reason:

- **REL-91** — `x.pending` has no wait node, timeout, or SLA. Fixing this would mean adding a
  new wait node and rewiring `c.valid`'s branch: a canonical-graph topology change, which this
  round's DO-NOT list forbids making merely to satisfy implementation tooling. Remains REL-91's
  one P1.
- **FBK-48** — `a.volatile`'s revalidation condition has no bound attribute or `ConfigRef`
  despite the graph's own text requiring one. Binding a real `Config` here would mean inventing
  a company-specific timing value this round has no grounds to set. Remains FBK-48's one P1.
- **IDN-87** — see Identifier provenance above: the one deliberately-deferred handoff-provenance
  P1, left for a follow-up pass rather than widening this round's fix scope to a second journey.
- **42 P2 findings**, overwhelmingly missing `contract.requiredFields` blocks on handoffs whose
  target sits outside this round's 64 (so the receiving side's actual needs are unverified, not
  confirmed absent) plus a handful of observability gaps (no named reviewer/owner field on
  ACC-78's `c.review`, IDN-88's `h.review`, FUL-145's `w.approval`; FBK-50's `x.owned` naming
  mismatch) and one remaining conflict gap (RET-23/RET-24, above). None of these is a P0/P1 by
  this round's own methodology, and per the brief's explicit instruction this round does not
  drive P1/P2 to zero — see `READINESS-MATRIX.md` for the full per-state list.

## FINAL VALIDATION

Run after every fix batch and again at the end of the round:

- `npm run validate:canonical` — 0 errors, 0 unreviewed vNext warnings (67 new warnings surfaced
  by the two new corpus-wide validators — Validator C on journeys outside this round's 64,
  Validator D everywhere — were each individually reviewed and recorded in
  `production/vnext-warning-reviews.json`, not blanket-suppressed).
- `npm run validate:journey-production` — passes.
- `npm run validate:seo` — passes (pre-existing, unaffected by this round's changes).
- `npx tsc --noEmit` — clean.
- `npm run lint` — unchanged pre-existing warning count in `production/`, 0 errors.
- `npm run build` — succeeds, every route still prerenders.
- `node <build/validate-contracts.mjs>` (this round's own contract validator, scratch-only, not
  an npm script — mirrors the schema in `lifecycle-state-contract.schema.ts`) — 64/64 contracts
  structurally valid, 0 with a P0 gap and `readiness !== NEEDS_CONTRACT_WORK` mismatch, 0 with
  `NEEDS_CONTRACT_WORK` and no P0 gap.

`git diff` categorization: canonical-graph changes are zero beyond the two `competition` blocks
(metadata on existing nodes — no node or edge added, removed, or rewired); implementation
metadata changes are the idempotencyKeys, handoff carries/contracts, new declared attributes,
and the two competition blocks, all inside `src/canonical/*.ts`; validator changes are confined
to `scripts/vnext-rules.mjs` (three new validators, one severity widening); research-artifact
changes are this file, `VALIDATOR-COVERAGE.md`, and the mechanical/targeted updates to the eight
round-1 deliverables in this directory.
