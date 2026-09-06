/**
 * Implementation-contract model for a Silent Lifecycle State — a customer-lifecycle graph that
 * changes what the system should or should not do, but sends no customer-facing message itself.
 *
 * LAYERING (unchanged from the communication round's model, `../journey-production-readiness/
 * implementation-contract.schema.ts`): Canonical State (the hand-authored graph in
 * `src/canonical/*.ts`) -> Implementation Contract (this file's shape, one per state) -> Company
 * Mapping (a specific company's event names, system-of-record ids, policy values) -> Platform
 * Implementation (the actual lifecycle/orchestration engine). This file is the second layer only.
 * It never names a vendor and never invents a numeric value — a `required: true` Config or a
 * missing `sourceOfTruth` system name is the correct output when the canonical graph itself does
 * not resolve one, not a placeholder value.
 *
 * WHY A SEPARATE SCHEMA, NOT A REUSE OF THE COMMUNICATION ONE: audited into shape against all 64
 * genuinely silent states (see the corpus-count note in LIFECYCLE-STATES-AUDIT.md for why the
 * corpus is 64, not the 67 named in this round's brief), not designed from the communication
 * schema by search-and-replace. Four sections do not exist there because they answer questions a
 * message-sending journey does not raise the same way: `stateAuthority` (who may say this state is
 * true — irrelevant to a journey whose exit is itself the observable fact), `transitions`
 * (structured because a silent state's whole value *is* its transition graph, not a touch plan
 * layered on top of one), `ownership` (a silent state can be true while a different journey holds
 * next-action — a distinction a communicating journey's own orchestration already settles by
 * definition), and `observability` (a company must be able to explain a silent state in production
 * without a message-send log to point at). Five sections carry over unchanged in shape because the
 * underlying question is identical for both layers: `instance`, `requiredData`, `sourceOfTruth`,
 * `configRefs`, `handoffs` — reusing the identical field names there is deliberate, not
 * coincidental, so a state and a journey that hand off to each other describe the boundary in the
 * same vocabulary. `channelPolicy` and `contact`/pressure-class concepts are dropped entirely —
 * out of scope by definition for something that sends nothing.
 */

export type StateAuthority =
  | "authoritative-system"
  | "deterministic-rule"
  | "human-decision"
  | "declared-by-customer"
  | "derived-from-authoritative-inputs"
  | "behavioral-inference";

export interface AuthorityRef {
  /** What this authority statement is about — one state, one condition, or one transition. */
  decision: string;
  authority: StateAuthority;
  /** Populated only for "behavioral-inference": what validates the inference before it is treated
      as conclusive, or "none — validated nowhere" when the canonical graph does not gate it. A
      behavioral signal may open investigation or priority; it must never silently become a
      concluded state. */
  validatedBy?: string;
}

export interface InstanceIdentity {
  scope: string;
  key: readonly string[];
  dedupePolicy: "reject-duplicate" | "supersede-open" | "merge-into-open" | "allow-concurrent";
  concurrencyNote?: string;
}

export interface RequiredDatum {
  field: string;
  required: boolean;
  usedBy: string;
}

export interface SourceOfTruthRef {
  decision: string;
  systemKind: string;
  /** Present and true only where the decision could plausibly be confused with a message-
      engagement signal (open/click/view) — most silent-state decisions have nothing to do with
      messaging at all, in which case this field is omitted rather than forced to a vacuous true. */
  engagementIsEvidenceOnly?: boolean;
}

export interface ConfigRef {
  key: string;
  meaning: string;
  basis: "business policy" | "expected user rhythm" | "operational SLA" | "legal requirement" | "platform constraint";
  timingClass?: string;
  required: boolean;
}

export type TransitionKind = "enter" | "progress" | "resolve" | "expire" | "supersede" | "cancel" | "reverse" | "correct" | "handoff" | "reopen";

export interface Transition {
  /** Node id this transition leaves from — omitted for the entry transition. */
  from?: string;
  to: string;
  kind: TransitionKind;
  /** The authoritative event, condition, or decision that causes this transition — never prose
      alone; if the canonical graph only has prose here, that is itself the finding (see gaps). */
  causedBy: string;
  authority: StateAuthority;
  /** Data or a prior transition this one depends on, if any. */
  requires?: readonly string[];
}

export interface OwnershipRef {
  /** Whether this state's own orchestration owns the next action, or is evidence/context another
      journey acts on. */
  ownsNextAction: boolean;
  /** Handoffs (node ids) that transfer ownership out. */
  transfersOn?: readonly string[];
  /** Events or conditions that would resume ownership here after a transfer, if any. */
  resumesOn?: readonly string[];
}

export interface ConflictRef {
  statement: string;
  /** Other state or journey ids this can conflict with. */
  conflictsWith: readonly string[];
}

export interface HandoffContractRef {
  node: string;
  target: string;
  requiredContext: readonly string[];
  ownershipTransfer: boolean;
  suppressSource: boolean;
}

export interface ReEntryRef {
  exit: string;
  terminal: boolean;
  /** Present only when non-terminal: what event reopens it, and into what shape. */
  reopensAs?: "resume-existing-instance" | "new-episode" | "new-entity-instance" | "recalculation" | "correction";
  reopenEvent?: string;
  /** Whether the reopened instance is checked against a stale/late version of the closing event. */
  lateEventGuard?: string;
}

export interface ObservabilityModel {
  /** What retains why the state entered — an attribute, a log field, or "none" when this round
      found nothing retaining it. */
  enteredBy: string;
  evidenceRefs?: readonly string[];
  currentOwner?: string;
  expiresAt?: string;
  supersededBy?: string;
}

export interface StateOutcomes {
  resolution: readonly string[];
  neutral: readonly string[];
  failure: readonly string[];
  diagnostic: readonly string[];
}

export type TestScenarioKind =
  | "entry" | "insufficient-evidence" | "duplicate-event" | "concurrent-instance" | "supersession"
  | "timeout" | "late-event" | "re-entry" | "correction" | "handoff" | "conflict";

export interface TestScenario {
  kind: TestScenarioKind;
  given: string;
  expect: string;
}

export type ReadinessVerdict = "READY" | "READY_WITH_MAPPING" | "NEEDS_CONTRACT_WORK" | "NEEDS_CANONICAL_CHANGE";

export type GapArea =
  | "authority" | "instance" | "transition" | "ownership" | "conflict" | "re-entry" | "terminality"
  | "correction" | "config" | "handoff" | "idempotency" | "observability" | "outcome" | "test"
  | "canonical-graph";

export interface GapFinding {
  priority: "P0" | "P1" | "P2";
  area: GapArea;
  finding: string;
}

export interface LifecycleStateContract {
  id: string;
  shortName: string;
  readiness: ReadinessVerdict;
  readinessWhy: string;
  stateAuthority: readonly AuthorityRef[];
  instance: InstanceIdentity;
  requiredData: readonly RequiredDatum[];
  sourceOfTruth: readonly SourceOfTruthRef[];
  configRefs: readonly ConfigRef[];
  transitions: readonly Transition[];
  ownership: OwnershipRef;
  conflict: readonly ConflictRef[];
  handoffs: readonly HandoffContractRef[];
  reEntry: readonly ReEntryRef[];
  observability: ObservabilityModel;
  outcomes: StateOutcomes;
  testScenarios: readonly TestScenario[];
  gaps: readonly GapFinding[];
}

export type LifecycleStateContractSet = readonly LifecycleStateContract[];
