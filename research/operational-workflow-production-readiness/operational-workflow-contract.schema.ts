/**
 * Implementation-contract model for an Operational Workflow — internal work a real company's
 * team, queue, specialist, approver, or back-office process must actually perform for a lifecycle
 * promise to become true. Not customer communication, not a lifecycle state, not runtime plumbing.
 *
 * LAYERING (unchanged from the three closed rounds — `../journey-production-readiness/
 * implementation-contract.schema.ts`, `../lifecycle-state-production-readiness/
 * lifecycle-state-contract.schema.ts`, `../runtime-mechanism-production-readiness/
 * runtime-mechanism-contract.schema.ts`): Canonical Workflow (the hand-authored graph in
 * `src/canonical/*.ts`) -> Implementation Contract (this file's shape, one per workflow) ->
 * Company Mapping (a specific company's teams, queues, systems, SLA values, approval authorities)
 * -> Platform Implementation. This file is the second layer only. It never names a company-
 * specific team, a vendor, or a numeric SLA/deadline/approval-count — a `required: true` `ConfigRef`
 * or an honestly-empty field is the correct output when the canonical graph itself does not
 * resolve one, never a placeholder value.
 *
 * WHY A FOURTH SCHEMA, NOT A REUSE OF ANY EARLIER ONE: audited into shape against all 124
 * Operational Workflows (`OPERATIONAL-WORKFLOWS-AUDIT.md`), not designed by search-and-replace
 * from an earlier round's schema. `ownership`, `assignment`, `evidence`, `authorityApproval`,
 * `escalation`, `completion`, `resultFeedback`, and `correctionReopen` exist here because the
 * corpus audit found these are the actual, recurring, load-bearing distinctions the 124 workflows
 * make in their own prose, and because the underlying production risk this round audits —
 * ownership ambiguity, undefined decision authority, duplicate manual/financial effects, a task
 * closing without proof of business completion — has no equivalent in a message-sending journey, a
 * silent lifecycle state, or a stateless runtime mechanism. Reused verbatim from earlier schemas,
 * for the same reason those two schemas reused each other's field names — a workflow and a journey
 * or a state or a mechanism that hand off to each other should describe the boundary in identical
 * vocabulary, not four dialects: `HandoffContractRef`, `TestScenario`, `ReadinessVerdict` ("READY" |
 * "READY_WITH_MAPPING" | "NEEDS_CONTRACT_WORK" | "NEEDS_CANONICAL_CHANGE", identical literal values
 * to both earlier customer-facing schemas), `GapFinding`.
 *
 * Deliberately dropped: `stateAuthority`'s full transition-graph model (`Transition`,
 * `TransitionKind`) — a workflow's graph already IS its own transition record via
 * `nodes`/`handoffs`/`exits` in `src/canonical/*.ts`; duplicating it here would be a second,
 * divergent copy of the same information, exactly the anti-pattern Part 5 of the runtime-mechanism
 * round's own brief warned against ("do not copy canonical rules manually into runtime-specific
 * configuration"). `channelStrategy`/`contact`/pressure-class concepts — out of scope by
 * definition; a workflow that owns customer channel orchestration is a boundary-classification
 * finding (see `boundaryCandidate`), not something this schema should have a field for.
 *
 * WHY MOST SECTIONS ARE NARRATIVE STRINGS, NOT NESTED TYPED ARRAYS: the earlier three schemas
 * could structure `requiredData`/`sourceOfTruth`/`configRefs` as arrays because those rounds
 * audited a small enough corpus (24, then 64/68/71) to hand-populate genuinely structured fields
 * per entry. This round covers 124 workflows across 17 domains with real prose variety in how each
 * one states ownership, evidence, and authority — forcing that prose into a rigid nested-array
 * shape here would mean either re-deriving structure the audit did not actually establish per
 * field, or padding it to look more machine-checkable than it is. The few fields that genuinely
 * are structured in the underlying `src/canonical/*.ts` source (`handoffs`, via each node's own
 * `to`/`carries`/`contract`) stay structured; the rest — `entry`, `ownership`, `assignmentQueue`,
 * `requiredData`, `evidence`, `authorityApproval`, `idempotency`, `slaTime`, `escalation`,
 * `cancellationSupersession`, `completion`, `resultFeedback`, `correctionReopen`, `observability`
 * — are narrative, grounded directly in the workflow's own `does`/`asks`/`guardrails`/
 * `reusableRule` text, matching the per-workflow markdown template `OPERATIONAL-WORKFLOWS-AUDIT.md`
 * actually uses. `testScenarios`, `gaps`, `consumers`, and `boundaryCandidate` stay structured
 * because they are genuinely enumerable, machine-checkable findings, not prose explanations.
 */

// ---------------------------------------------------------------- shared, reused vocabulary

export type ReadinessVerdict = "READY" | "READY_WITH_MAPPING" | "NEEDS_CONTRACT_WORK" | "NEEDS_CANONICAL_CHANGE";

export type HandoffContractRef = {
  node: string;
  target: string;
  requiredContext: readonly string[];
  ownershipTransfer: boolean;
  suppressSource: boolean;
  /** Whether the target's own declared entry requirements are actually satisfied by what this
      handoff carries — the round's own "can the receiver instance be constructed" test. */
  receiverConstructible: boolean;
};

export type ConsumerClassification = "active" | "event-driven" | "unconsumed-but-valid" | "orphan-candidate" | "duplicate-candidate";

export interface ConsumerRef {
  id: string;
  kind: "handoff" | "prose-reference";
}

export type TestScenarioKind =
  | "duplicate-creation" | "concurrent-claim" | "stale-work" | "missing-evidence" | "approval"
  | "self-approval" | "escalation" | "handoff" | "completion" | "feedback" | "cancellation"
  | "correction" | "reopen";

export interface TestScenario {
  kind: TestScenarioKind;
  given: string;
  expect: string;
}

export type GapArea =
  | "ownership" | "assignment" | "evidence" | "authority-approval" | "idempotency"
  | "sla-escalation" | "cancellation-supersession" | "completion" | "result-feedback"
  | "handoff-provenance" | "correction-reopen" | "observability" | "consumer-coverage"
  | "boundary" | "canonical-graph" | "other";

export interface GapFinding {
  priority: "P0" | "P1" | "P2";
  area: GapArea;
  finding: string;
}

export type SuspectedSurface = "customer-journey" | "silent-lifecycle-state" | "runtime-mechanism" | "duplicate-of-another-workflow";

export interface BoundaryCandidate {
  suspectedCorrectSurface: SuspectedSurface;
  why: string;
  impact: string;
  confidence: "low" | "medium" | "high";
}

// ---------------------------------------------------------------- the contract itself

export interface OperationalWorkflowContract {
  id: string;
  shortName: string;
  responsibility: string;
  readiness: ReadinessVerdict;
  readinessWhy: string;

  /** Work instance identity, key, and concurrency/duplicate policy — narrative because
      `entity.instanceKey` is declared on almost none of the 124 (they predate that convention;
      see OWNERSHIP-AND-ASSIGNMENT-AUDIT.md), so the identity is usually stated in `entity.scope`/
      `entity.note` prose rather than a structured key array. */
  instance: string;
  /** Why the work item exists — journey handoff / silent-state handoff / runtime escalation /
      human-created case / external event / policy exception / failure condition — and whether
      entry is authoritative, inferred, requested, escalated, or policy-derived. Free text because
      the honest answer is frequently a specific mixture the enum alone would flatten. */
  entry: string;

  /** The round's central dimension. Distinguishes queue vs. assigned owner vs. responsible team
      vs. decision authority vs. approver vs. executor vs. observer in prose rather than forcing
      them into fields most workflows do not cleanly populate — see
      OWNERSHIP-AND-ASSIGNMENT-AUDIT.md for the corpus-wide structured rollup this document's own
      "ambiguous ownership" findings feed. */
  ownership: string;
  assignmentQueue: string;
  requiredData: string;
  evidence: string;
  authorityApproval: string;
  idempotency: string;
  slaTime: string;
  escalation: string;
  cancellationSupersession: string;
  handoffs: readonly HandoffContractRef[];
  /** What proves the work is actually complete, distinguishing the operator's own technical
      task-closure from the underlying business obligation's resolution wherever the workflow's
      own text draws that distinction (OPS-130's own precedent: never assumed equal). Narrative,
      not a two-field struct — the audit records one judgment per workflow, not a mechanically
      forced technical/business split every workflow's own text doesn't actually make. */
  completion: string;
  resultFeedback: string;
  correctionReopen: string;
  observability: string;

  consumers: readonly ConsumerRef[];
  consumerClassification: ConsumerClassification;
  consumerNote: string;

  boundaryCandidate: BoundaryCandidate | null;

  testScenarios: readonly TestScenario[];
  gaps: readonly GapFinding[];
}

export type OperationalWorkflowContractSet = readonly OperationalWorkflowContract[];
