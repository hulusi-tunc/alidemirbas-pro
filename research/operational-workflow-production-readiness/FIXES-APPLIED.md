# Operational Workflows — production-readiness gap closure (repair round, 2026-09-04)

Corpus: 124 Operational Workflows, re-derived from `src/canonical/surface.ts`'s `surfaceOf()`
against the current 284-journey corpus (unchanged: still 124, zero leakage). This round repaired
every one of the 11 confirmed P0s directly in canonical source, added 2 regression validators,
normalized idempotency/ownership/authority conventions on the repaired workflows to match the
vocabulary the three closed layers already use, and regenerated all 124 implementation contracts
from the corrected source.

**P0: 11 → 0. NEEDS_CANONICAL_CHANGE: 3 → 0.** See `READINESS-MATRIX.md` for the full post-repair
matrix and `CANONICAL-CHANGES.md` for the 4 canonical graph topology changes in isolation.

---

## P0 register (source-grounded, re-derived from `operational-workflow-contracts.json` directly,
not copied from the governing brief's own summarized list)

### 1. `DEC-181` — entry contract assumed human/customer origin; ~30 real senders are not

- **Before:** `a.capture`, `c.valid`, and `c.info` were written entirely for a human/customer
  submitted request — a `requester` field, a requester-standing check, and an interactive
  missing-information wait with no distinguished path for a Runtime Mechanism or Operational
  Workflow referral with no requester to validate standing for and no interactive party to wait on.
- **Root cause:** the entry contract never distinguished request origin (human/customer vs.
  internal referral) from requesting actor / referring mechanism / decision subject / authority /
  reason-evidence — a single implicit assumption baked into a shared intake used by ~30 senders.
- **After:** `entity.instanceKey: ["request_id"]`, `concurrency: "one-active-per-key"`. Exactly one
  reusable structural distinction (human/customer-originated vs. internally-referred) threaded
  through `a.capture` (does-text broadened, `idempotencyKey: "request_id + a.capture"`), `c.valid`
  (both branches broadened), and `c.info` (split from 2 to 3 branches: Complete → `a.create`;
  Missing/human-customer → `a.pending-info`; Missing/internal-referral → new
  `a.return-to-referrer` → new exit `x.returned`). `h.invalid` and `h.assign` carries broadened;
  `h.assign` gained `contract.requiredFields: ["request_id"]`. 2 new guardrails.
- **Repair layer:** canonical graph change (2 new nodes: `a.return-to-referrer`, `x.returned`) +
  implementation-contract metadata (instanceKey, idempotencyKey, broadened text).
- **Validator:** `validate-canonical.mjs`'s existing `handoff_identifier_unprovenanced` rule now
  correctly resolves via 8 documented review entries in `production/vnext-warning-reviews.json`
  (the "self-minted-by-receiver" case — `request_id` is minted by `a.capture` on entry, so no
  sender can structurally carry it beforehand).
- **Regression test:** human-originated request; customer-originated request; Runtime Mechanism
  referral; Operational Workflow referral (incl. `OPS-131`); duplicate referral (idempotency);
  invalid/unauthorized origin; receiver instance identity; missing-info-internal-referral routes to
  `a.return-to-referrer`/`x.returned` distinct from missing-info-human/customer routing to
  `a.pending-info`.
- **Cross-layer note:** `OPS-131` (Runtime Mechanism, closed layer) is one of DEC-181's senders;
  verified via its own `h.escalate` carries (`exclusion_group`, `scope_instance_id`, `contenders`,
  precedence text) to need no change, since `request_id` is self-minted downstream. **`OPS-131` was
  not modified.**

### 2. `RSK-192` — case creation has no create-if-absent guard

- **Before:** `a.case` created a case with no idempotency/atomicity guard, despite the entity's own
  note requiring one case per correlated risk subject.
- **Root cause:** missing atomic create-if-absent semantics on the entry action.
- **After:** `entity.instanceKey: ["risk_subject_id"]`, `concurrency: "one-active-per-key"`.
  `a.case` does-text rewritten to atomic create-if-absent semantics; `idempotencyKey:
  "risk_subject_id + a.case"`. New guardrail.
- **Repair layer:** implementation-contract metadata only (no graph topology change).
- **Validator:** new `durable_work_without_idempotency` now sees a declared key on this action and
  does not flag it.
- **Regression test:** concurrent/duplicate invocation for the same `risk_subject_id` resolves to
  exactly one case, not two.

### 3. `RSK-198` — check-then-act race between override applicability and exception consumption

- **Before:** `c.applicable → a.override → c.single → a.consume` had no atomicity guard; two
  concurrent invocations could both pass the applicability check before either consumed the
  exception, allowing double-use of a single-use exception.
- **Root cause:** a multi-node check-then-act sequence with no serialization boundary.
- **After:** `entity.instanceKey: ["exception_id"]`, `concurrency: "one-active-per-key"` —
  structurally serializes the whole check-then-act sequence per `exception_id` without adding new
  nodes. `a.override` gains `idempotencyKey: "exception_id + invocation + a.override"`; `a.consume`
  does-text rewritten for atomic consumption, `idempotencyKey: "exception_id + a.consume"`. New
  guardrail.
- **Repair layer:** implementation-contract metadata only (entity-level concurrency declaration
  closes the race; no graph topology change).
- **Validator:** `durable_work_without_idempotency` no longer flags `a.consume`.
- **Regression test:** concurrent invocation for the same `exception_id` results in exactly one
  consumption, not two.

### 4. `SUB-164` — duplicate financial obligation / new-term creation

- **Before:** `a.financial` (raises the financial obligation) and `a.new-term` (creates the new
  subscription term) had no `idempotencyKey`/`attemptBudget` — a duplicate
  `renewal_authorized_for_execution` event (e.g. a retried `SUB-163` handoff) could raise a second
  financial obligation or create a second new term for the same renewal cycle.
- **Root cause:** missing instance identity and idempotency identity on the two consequential
  actions.
- **After:** `entity.instanceKey: ["renewal_cycle_id"]` (renamed from an initial `renewal_id` to
  match `SUB-163`'s own pre-existing `renewal_cycle_id` vocabulary — 11 occurrences renamed),
  `concurrency: "one-active-per-key"`. `a.financial`: `idempotencyKey: "renewal_cycle_id +
  a.financial"`. `a.new-term`: `idempotencyKey: "renewal_cycle_id + a.new-term"`. New guardrail.
  `SUB-163`'s own `h.execute` handoff into `SUB-164` updated: `carries` now names
  `renewal_cycle_id` explicitly, and gained `contract.requiredFields: ["renewal_cycle_id"]`.
- **Repair layer:** implementation-contract metadata + a small handoff-contract fix on the sender
  side (`SUB-163`) to match the renamed field — the smallest correct layer, since `SUB-163` already
  tracked the same identity under that name.
- **Validator:** `durable_work_without_idempotency` no longer flags either action.
- **Regression test:** the same logical renewal-authorized-for-execution request delivered twice
  for the same `renewal_cycle_id` produces exactly one obligation and one term; a different,
  legitimately separate `renewal_cycle_id` for the same relationship produces its own independent
  obligation/term (the fix does not collapse legitimately separate renewal cycles).

### 5. `OWN-56` — self-approval never addressed

- **Before:** the workflow's own stated purpose is "keep approving separate from doing," but
  nothing in `c.outcome`'s branching prevented a requester from approving their own request.
- **Root cause:** missing requester-vs-approver distinction on the decision condition — a
  workflow-local requirement already implied by `OWN-56`'s own semantics, not a generic
  library-wide four-eyes rule.
- **After:** `entity.instanceKey: ["request_id"]`, `concurrency: "one-active-per-key"`. `c.outcome`
  gains a new branch, "Self-approval attempted" (acting reviewer identity == this request's own
  requester identity) → `h.rejected` (reused, not duplicated), inserted before the APPROVED branch;
  the APPROVED branch's own condition now requires reviewer != requester. `h.rejected`'s `on`/
  `carries` broadened to cover both the ordinary-rejection and self-approval-blocked cases.
  `a.create`: `idempotencyKey: "request_id + a.create"`. `a.approved`: `idempotencyKey: "request_id
  + a.approved"`. New guardrail.
- **Repair layer:** canonical graph change (1 new branch on an existing condition node, zero new
  nodes — reuses the existing `h.rejected` target).
- **Validator:** `durable_work_without_idempotency` no longer flags `a.create`/`a.approved`.
- **Regression test:** a different, authorized approver → allowed (APPROVED fires); the requester
  attempting to approve their own request → rejected (routes to `h.rejected`); reassignment of the
  request to a new reviewer does not erase the original requester identity the check compares
  against.

### 6. `INC-258` — closure reachable with zero mitigation ever applied

- **Before:** `c.mitigations` had 2 branches, both implicitly assuming at least one mitigation had
  been applied; the reachable "no mitigation ever applied" state fell through unnamed, so an
  incident could reach a successfully-closed state having never been mitigated — contradicting the
  workflow's own purpose.
- **Root cause:** a missing decision-outcome branch, not a missing label — genuinely required a
  new node for the missing branch to route to.
- **After:** `entity.instanceKey: ["incident_id"]`, `concurrency: "one-active-per-key"`.
  `c.mitigations` gains a 3rd branch, "None were ever applied" → new `a.no-mitigations` (rejoins
  the existing flow at `c.cases` — no separate closure path). The existing 2 branches' `when` text
  tightened to explicitly require "at least one temporary mitigation was applied." `a.resolve`:
  `idempotencyKey: "incident_id + a.resolve"`. New guardrail.
- **Repair layer:** canonical graph change (1 new node: `a.no-mitigations`).
- **Validator:** `durable_work_without_idempotency` no longer flags `a.resolve`.
- **Regression test:** an incident with zero mitigations ever applied reaches `c.mitigations`,
  takes the new branch to `a.no-mitigations`, and is routed through the same `c.cases` scrutiny as
  every other outcome — no path reaches a successfully-resolved closure without that scrutiny;
  every pre-existing valid branch (mitigated / cannot-mitigate / superseded / external-resolution)
  is preserved unchanged.

### 7. `CTL-232` — one path into `CTL-234` revalidates, one skips it

- **Before:** `c.acceptance`'s "It is not [required]" branch routed straight to `h.execute`,
  skipping the revalidation the "acceptance required" branch performs (via `CTL-233`) before
  executing — violating `CTL-234`'s own `t.authorized` trigger, which requires "a transfer
  revalidated and authorized against the entity's current state."
- **Root cause:** an inconsistent freshness invariant across two paths into the same downstream
  trigger.
- **After:** `entity.instanceKey: ["transfer_request_id"]`, `concurrency: "one-active-per-key"`.
  `c.acceptance`'s "It is not" branch now routes to new `a.revalidate` (`idempotencyKey:
  "transfer_request_id + a.revalidate"`) → new `c.revalidated` ("It holds" → `h.execute`; "It no
  longer holds" → the existing `a.reject`, reused). Modeled on the sibling workflow `CTL-233`'s own
  established revalidate → condition → branch pattern, scaled down by reusing the existing reject
  target. `h.execute`'s `on`/`carries` updated to note revalidation occurred. New guardrail.
- **Repair layer:** canonical graph change (2 new nodes: `a.revalidate`, `c.revalidated`).
- **Regression test:** state changes after entry but before execution, on the "acceptance not
  required" path — `a.revalidate`/`c.revalidated` catches the staleness and routes to `a.reject`,
  so neither path can act from stale state; the "acceptance required" path continues unchanged via
  `CTL-233`.

### 8. `DAT-228` — rollback data preserved but never consumed

- **Before:** `a.rollback`'s `next` pointed straight to the terminal exit `x.rolled-back`, even
  though the action's own text claimed the target's cutover-window writes were "recorded for
  reconciliation" — nothing ever consumed that preserved data; the rollback capability existed only
  descriptively.
- **Root cause:** a missing consumer for genuinely preserved data, requiring a real decision node
  (clean vs. conflicting reconciliation), not a metadata annotation.
- **After:** `entity.instanceKey: ["migration_id"]`, `concurrency: "one-active-per-key"`.
  `a.rollback` → new `a.reconcile-preserved` (mints/uses `rollback_snapshot_id`, `idempotencyKey:
  "rollback_snapshot_id + a.reconcile-preserved"`) → new `c.reconciled` ("Cleanly" →
  `x.rolled-back`, reused, now only reached post-reconciliation; "Genuine conflict" → new
  `h.decide-conflict`, handoff to `DEC-181` carrying the snapshot id + preserved writes + the
  source's independent changes since). `a.rollback` gained `idempotencyKey: "migration_id +
  a.rollback"`. `x.rolled-back`'s state text updated from "recorded for reconciliation"
  (aspirational) to "reconciled against it" (now true). New guardrail.
- **Repair layer:** canonical graph change (3 new nodes: `a.reconcile-preserved`, `c.reconciled`,
  `h.decide-conflict`).
- **Regression test:** rollback data is captured with a snapshot id at rollback time; a rollback
  event invokes reconciliation; `c.reconciled` branches to a clean rejoin or a conflict handoff to
  `DEC-181`; the original migration record is never overwritten, only appended to / reconciled
  against — append-only history preserved throughout.

### 9. `RLT-247` — no declared authority for an irreversible recovery decision

- **Before:** `a.determine`'s own text calls the decision irreversible-if-wrong, but no authority
  was declared for who may make it.
- **Root cause:** undeclared mandatory decision authority for a P0-tier irreversible effect.
- **After:** `entity.instanceKey: ["change_id"]`, `concurrency: "one-active-per-key"`. `a.determine`
  does-text rewritten to require an "authorized recovery-decision role" (an abstract, structural
  role name — not an invented company-specific team), gained `execution: "human"` and
  `idempotencyKey: "change_id + a.determine"`. `channels` changed `[] → ["task"]` (required because
  `execution: "human"` needs a declared channel — pre-existing `human_action_without_channel`
  validator). New guardrail.
- **Repair layer:** implementation-contract metadata (no graph topology change).
- **Regression test:** the action cannot complete without the declared authority role acting; the
  work now surfaces as an assignable human task on the `task` channel.

### 10. `TRM-101` — no declared authority for an irreversible identity merge

- **Before:** `a.operation`'s own elevated-bar irreversibility requirement had no named authority to
  exercise it; `c.evidence`'s branches did not require an explicit elevated-bar authority exercise.
- **Root cause:** same class as `RLT-247` — undeclared mandatory decision authority for an
  irreversible effect.
- **After:** `entity.instanceKey: ["merge_operation_id"]`, `concurrency: "one-active-per-key"`.
  `t.authorized`'s `evidence.requires` now names an "authorized identity-consolidation role"
  explicitly. `a.operation` does-text updated, gained `execution: "human"` and `idempotencyKey:
  "merge_operation_id + a.operation"`. `c.evidence`'s both branches' `when` text updated to require
  an explicit elevated-bar exercise of authority. `channels` changed `[] → ["task"]`. The workflow's
  pre-existing irreversible-merge-authority guardrail was judged sufficient and left unchanged (the
  fix tightened existing text/conditions rather than adding a new guardrail).
- **Repair layer:** implementation-contract metadata (no graph topology change).
- **Regression test:** the merge action cannot complete without the declared authority role
  exercising the elevated bar; the work surfaces as an assignable human task on the `task` channel.

### 11. (Not P0, verified) `TRM-103`, `TRM-104`, `TRM-109`, `REM-154` — confirmed P1, deliberately
    unrepaired this round

Re-derivation of the P0 register directly from `operational-workflow-contracts.json` (rather than
trusting the governing brief's own summarized list) confirmed these four are genuine P1s, not P0s.
Per the brief's own "do not force P1 to zero" instruction, none was repaired this round. `REM-154`'s
queue/claim gap in particular was checked against the "repair only if production-blocking or
directly adjacent to a P0 root cause" instruction and found to be neither.

---

## Canonical graph repairs (4 total — 1 more than the audit's original 3, justified per Part 29)

`DAT-228`, `CTL-232`, `INC-258` (the audit's original 3 `NEEDS_CANONICAL_CHANGE` items) plus
`DEC-181` (proven necessary while repairing Part 2, not originally flagged `NEEDS_CANONICAL_CHANGE`
— its missing-info-for-internal-referral routing gap could not be closed without a new branch and
two new nodes). Full before/after/why-metadata-was-insufficient/regression-test detail for all 4:
see `CANONICAL-CHANGES.md`. Net effect: 284 journeys / **3682 nodes** (was 3674) / 423 rules / 31
global rules / 8 merged ids — `production/validate-journey-production.mjs` check 30's baseline was
updated to match.

---

## Systemic repairs

### Idempotency

11 of the 11 P0-repaired workflows now declare `entity.instanceKey`/`entity.concurrency` and
`ActionNode.idempotencyKey` on their consequential actions, adopting the exact vocabulary the three
closed layers (Customer Journeys, Silent Lifecycle States, Runtime Mechanisms) already established
— no fifth incompatible convention was introduced. This narrows the corpus-wide count of
operational workflows lacking the convention from 124 to 113. The new
`durable_work_without_idempotency` validator (WARNING) now covers the remaining gap corpus-wide
(570 current findings — see `VALIDATOR-COVERAGE.md` for why this is large-but-intentionally-broad
and WARNING-not-ERROR). No arbitrary keys were sprinkled onto read-only review/evaluation nodes —
only actions that append to durable fields were touched.

### Ownership / assignment

`OWN-56`'s self-approval gap is the only ownership-family P0; fixed as described above. The
escalation/reopen ownership-loss pattern the audit found in `DEC-189`/`DEC-190`/`CTL-231`
(contrasted with `DEC-182`/`CTL-233`'s better pattern) was confirmed non-P0 and left unrepaired
this round, per the brief's own instruction to extract the reusable principle for future rounds
rather than force every adjacent P1 to zero. `CTL-232`'s own fix (item 7 above) is itself now a
second reference-quality instance of the "revalidate before consequential execution" ownership
discipline, alongside `CTL-233`.

### Authority / approval

`RLT-247` and `TRM-101` (items 9–10 above) are the two genuine P0s in this family; both fixed by
declaring an abstract, structural authority role (never a company-specific team name). The other
22 authority/approval findings the audit catalogs were left unrepaired — none required a canonical
change, and repairing them would have required inventing company policy (approval thresholds,
named teams, jurisdiction-specific authority) the brief explicitly forbids inventing.

### Completion / feedback

`INC-258` (item 6) is the completion-family P0; fixed via canonical graph change. `RSK-200`,
`INT-116`, `DAT-222` (completion gaps) and `IDN-86`, `INT-118`, `RLT-244` (result-propagation
gaps) were reviewed per Part 21 and confirmed non-P0; left unrepaired rather than manufacturing
downstream consumers that don't exist in the current corpus.

### SLA / escalation

No SLA/escalation-family P0 was confirmed in the re-derived register. `DEC-183`'s deadline
enforcement was checked per Part 20 and confirmed non-P0 this round. The 16 SLA/time-configuration
gaps the audit catalogs remain honest, undeclared policy references — no duration was invented.

---

## Additional P1 repairs made incidentally

- `SUB-163`'s `h.execute` handoff into `SUB-164` (renamed field + declared `contract.requiredFields`)
  — required to keep `SUB-164`'s own P0 fix receiver-constructible; not itself a separately-tracked
  P0, but a direct dependency of item 4 above.
- 8 `handoff_identifier_unprovenanced` warnings on `DEC-181`'s other senders (`FBK-47`, `IDN-84`,
  `REL-100`, `FIN-137`, `REM-152`, `SUB-163`, `SUB-167`×2, `SUB-169`) resolved via documented
  review entries rather than left as unreviewed warnings — a direct consequence of item 1's
  `instanceKey` addition, not independent findings.

No other P1s beyond these direct dependencies of the 11 P0 fixes were repaired this round, per the
brief's explicit "do NOT turn every P1 into production metadata" instruction.

---

## Boundary candidates — left unchanged (all 7)

`REL-95`, `REL-96`, `RSK-191`, `RSK-198`, `IDN-86`, `ACC-75`, `ACC-76` — none reclassified. `RSK-198`
specifically was repaired *as an operational workflow* (concurrency semantics are legitimate for
Operational Workflows per the brief) rather than treated as a reason to reclassify it as a Runtime
Mechanism. See `BOUNDARY-CLASSIFICATION-AUDIT.md`'s own post-repair update note.

## Orphan candidates — left unchanged

`REL-99`, `INT-120` — neither deleted nor reclassified; both retain at least one outbound handoff
of their own, so the new `workflow_result_unconsumed` validator (which requires zero outbound AND
zero inbound) correctly does not flag either. See `CONSUMER-COVERAGE.md`.

## Remaining non-blocking gaps

- `TRM-103`, `TRM-104`, `TRM-109` — confirmed P1 authority-adjacent findings in the terminal
  cluster's "generic authority" pattern; not repaired, per "do not force P1 to zero."
- `REM-154` — confirmed P1 queue/claim gap; not repaired, confirmed neither production-blocking
  nor directly adjacent to a P0 root cause.
- The remaining 74 P1s and 99 P2s across the corpus (173 total findings post-repair, down from 186
  pre-repair) are genuine mapping-time policy dependencies — SLA values, team/queue names, approval
  thresholds, config references — that the canonical source correctly leaves undeclared. This is
  the expected healthy end state (`READY_WITH_MAPPING`, not `READY`), not a shortfall.

---

## Schema review (Part 30)

`operational-workflow-contract.schema.ts` was reviewed against all 11 repairs; **no field was
added or changed.** Every repair's new canonical-source concepts (`entity.instanceKey`,
`entity.concurrency`, `ActionNode.idempotencyKey`, `HandoffNode.contract.requiredFields`) are
canonical-graph-level fields already covered by the schema's existing narrative `instance`/
`idempotency`/`handoffs` sections — describing them required no new structured field, only updated
prose in the regenerated contracts. No repair surfaced a reusable concept missing from the schema.

## Final validation status

| Check | Result |
|---|---|
| `npm run validate:canonical` | 0 errors, 0 unreviewed vNext warnings, 284 journeys / 3682 nodes / operational 124 |
| `npm run validate:journey-production` | PASS (30/30, including the updated 3682-node baseline) |
| `npm run validate:seo` | PASS (0 errors, 67 pre-existing warnings) |
| `npx tsc --noEmit` | clean |
| `npm run lint` | 1 pre-existing error (`MobileNav.tsx`, unrelated to this round — confirmed present before this round's changes via `git stash`) + 13 pre-existing warnings; 0 new issues |
| `npm run build` | clean; only `[...catchall]` (both locales) and `/qa-canvas-sweep/[id]` are `ƒ`, as required |
| `node scripts/surface-assignment.mjs` | operational 124, unchanged |
| `node search/build-search-index.mjs` | 525 documents, rebuilt clean |
| `production/*.py` pipeline | all 8 scripts rerun clean from `production/` as CWD |

See the session's final response for the full 18-point summary, commit hash, and complete artifact
path list.
