/**
 * Implementation-contract model for a Runtime Mechanism — reusable execution infrastructure that
 * journeys and lifecycle states depend on to run orchestration safely (routing, send eligibility,
 * delivery attempt handling, retries, deduplication, suppression, revalidation, provider-status
 * interpretation, concurrency control, recovery), but which is not itself a customer lifecycle
 * state and not a business workflow.
 *
 * LAYERING (unchanged from the two customer-facing rounds — `../journey-production-readiness/
 * implementation-contract.schema.ts`, `../lifecycle-state-production-readiness/
 * lifecycle-state-contract.schema.ts`): Canonical Mechanism (the hand-authored graph in
 * `src/canonical/communication.ts` / `consent.ts` / `processing.ts`) -> Implementation Contract
 * (this file's shape, one per mechanism) -> Company Mapping (a specific company's queueing
 * infrastructure, lease/lock primitive, backoff policy values) -> Platform Implementation. This
 * file is the second layer only. It never names a database technology, a lock primitive, a retry
 * count, or a timeout duration — those are exactly the "do not invent" list this round's audit
 * brief names, and a `required: true` field or a missing `attemptIdentity.provenance` is the
 * correct output when the canonical graph itself does not resolve one.
 *
 * WHY A THIRD SCHEMA, NOT A REUSE OF EITHER EARLIER ONE: audited into shape against all 24
 * mechanisms (`RUNTIME-MECHANISMS-AUDIT.md`), not designed by search-and-replace from either
 * customer-facing schema. The earlier two schemas answer "what lifecycle state is true and who
 * may say so" (`stateAuthority`, `reEntry`, `terminality`) — a question a stateless execution
 * primitive does not raise, because a mechanism has no lifecycle state of its own to be true or
 * re-entered. This schema instead asks "how is a decision executed safely under retries,
 * duplicate events, concurrent callers, stale snapshots, partial failure, and downstream outage" —
 * six sections exist here that exist in neither earlier schema (`sideEffectBoundary`,
 * `idempotency`, `concurrency`, `freshness`, `retry`, `unknownOutcome`) because the corpus audit
 * found these are the actual, recurring, load-bearing distinctions the 24 mechanisms make in
 * their own prose, not schema categories invented from the brief's checklist. Four sections carry
 * over largely unchanged in shape because the underlying question is genuinely the same for a
 * mechanism as for a journey or a state: `inputContract`/`outputContract` (reuse `RequiredDatum`'s
 * shape from the two earlier schemas), `handoffs` (identical vocabulary on purpose — a mechanism
 * and a journey describe a handoff boundary the same way), `observability`, `gaps`/`testScenarios`.
 * Deliberately dropped: `stateAuthority`, `instance.dedupePolicy`, `reEntry`, `conflict` (renamed
 * and narrowed to `conflictArbitration` — see below) — a mechanism's own instance identity is
 * "the request/attempt it is currently executing," not a durable customer-facing entity, so the
 * two earlier schemas' entity-instance model does not transfer.
 */

export type SideEffectClass =
  | "reads-only"
  | "decides-only"
  | "writes-internal-state"
  | "creates-task-or-obligation"
  | "submits-to-provider"
  | "transfers-ownership"
  | "creates-lifecycle-instance"
  | "suppresses-queued-work";

export interface SideEffectBoundary {
  classes: readonly SideEffectClass[];
  /** True where a node named "send"/"route"/"assign"/"execute"/"apply" is, on inspection, only
      validating or preparing rather than performing the irreversible effect its name implies —
      the semantic-truth-not-node-name check the audit brief requires. Absent when the node names
      in this mechanism already match what they do. */
  namingMismatch?: string;
}

export type AttemptIdentityProvenance =
  | "caller-supplied"
  | "self-minted-on-entry"
  | "correlated-to-prior-attempt"
  | "undeclared";

export interface IdempotencyContract {
  /** What makes a retried invocation of this mechanism safe: "same result returned",
      "existing attempt resolved", "duplicate ignored", "state re-read", "safe new attempt under
      an attempt identity" — quoted or closely paraphrased from the mechanism's own prose, never
      invented. */
  retryBehavior: string;
  attemptIdentity: {
    /** The field(s) that scope one attempt, where the canonical graph names them explicitly
        (e.g. "attempt_id + provider reference"). Empty when the graph relies on prose reasoning
        only without naming a field — which is itself the finding this section exists to surface. */
    fields: readonly string[];
    provenance: AttemptIdentityProvenance;
  };
  /** "operation idempotency" and "attempt identity" are not always the same question (per the
      audit brief) — this records whether the mechanism's own idempotency claim rests on a
      structural field (an `idempotencyKey`/`attemptBudget` on an ActionNode, which the schema
      already supports and zero of the 24 mechanisms currently use) or on prose alone. */
  structurallyDeclared: boolean;
}

export type ConcurrencyPrimitive =
  | "none-required"
  | "lease"
  | "lock"
  | "compare-and-set"
  | "optimistic-version-check"
  | "instance-affinity"
  | "authoritative-re-read";

export interface ConcurrencyContract {
  primitive: ConcurrencyPrimitive;
  /** The race this mechanism's own prose or graph explicitly reasons about (two workers, two
      journey instances, a race against a callback) — not a scenario invented for this audit. */
  raceAddressed?: string;
}

export interface FreshnessContract {
  /** True where this mechanism re-reads authoritative current state before a consequential
      action, rather than trusting a queued/scheduled snapshot — the house rule the silent-state
      round formalized as `WaitNode.recheck`; several of these 24 mechanisms implement the
      identical rule as a dedicated pipeline stage rather than a convention. */
  revalidatesBeforeExecution: boolean;
  /** What specifically gets re-checked, in this mechanism's own words. */
  checks?: readonly string[];
}

export type FailureClass = "retryable" | "non-retryable" | "unknown" | "requires-reconciliation";

export interface RetryContract {
  /** Whether this mechanism performs its own retry loop, delegates to another mechanism's, or
      does not retry at all. */
  ownsRetryLoop: boolean;
  /** The mechanism id this one hands off to for actual retry execution, if any — flagging where
      a mechanism's own prose claims delegation (a `distinctFrom` statement) that its graph does
      not structurally show is exactly this section's job. */
  delegatesTo?: string;
  failureClasses: readonly FailureClass[];
  budgetDurable: boolean;
  revalidatesBeforeRetry: boolean;
}

export interface UnknownOutcomeContract {
  /** Whether an indeterminate/unknown execution result (connection dropped, ack lost, provider
      timeout) is handled explicitly rather than defaulted to a blind retry or a false success. */
  handled: boolean;
  /** The exit/handoff/state name this mechanism uses for it, in its own vocabulary
      (UNKNOWN, DELIVERY_UNKNOWN, RECONCILIATION_REQUIRED, ...). */
  vocabulary?: string;
  reconciliationTarget?: string;
}

export interface OrderingContract {
  required: boolean;
  /** What ordering guarantee this mechanism needs and how it gets it, in its own words
      (version check, timestamp comparison, causal sequencing) — never a prescribed infrastructure. */
  mechanism?: string;
}

export interface VersioningContract {
  /** Whether queued/scheduled work bound to this mechanism can outlive the journey/policy/config
      version that created it, and if so which strategy applies. */
  applicable: boolean;
  strategy?: "bind-at-scheduling" | "re-evaluate-at-execution" | "cancel-and-regenerate" | "undeclared";
}

export interface InputRequirement {
  field: string;
  required: boolean;
  /** Where this input's value is established before this mechanism can run — a prior mechanism,
      an authoritative system, a caller-supplied context. Absent (undeclared) is itself a finding. */
  provenance?: string;
}

export type OutputClass =
  | "decision"
  | "normalized-state"
  | "route"
  | "execution-attempt"
  | "ownership-transfer"
  | "retry-schedule"
  | "suppression-result"
  | "failure-classification"
  | "provider-status"
  | "persisted-mutation"
  | "handoff-context";

export interface OutputContract {
  classes: readonly OutputClass[];
  /** The caller-visible branches this mechanism's own exits/handoffs distinguish — success,
      no-op, deferred, retryable-failure, terminal-failure, unknown, conflict, superseded. Not
      every mechanism needs every branch; this lists the ones its own graph actually has. */
  distinguishableOutcomes: readonly string[];
  /** True where at least one caller-visible branch exists only as prose (a `does` or `state`
      string) with no distinct exit/handoff node a caller could branch on mechanically. */
  proseOnlyOutcome?: boolean;
}

export interface HandoffContractRef {
  node: string;
  target: string;
  requiredContext: readonly string[];
  ownershipTransfer: boolean;
  suppressSource: boolean;
}

export interface ConflictArbitrationRef {
  /** Whether this mechanism enforces journey-declared conflict/exclusivity metadata
      (`exclusionGroup`, `precedence`, `competition`) deterministically at runtime. False for all
      24 as audited — recorded per-mechanism rather than only once, so the gap is visible on every
      mechanism it could plausibly belong to, not buried in a single cross-cutting note. */
  enforcesJourneyCompetition: boolean;
  note?: string;
}

export interface ObservabilityModel {
  /** What a production operator can determine from this mechanism's own data model: which
      mechanism ran, for which instance, why, using which input/version, what decision, what side
      effect was attempted, what attempt/idempotency key, what dependency responded, retried,
      suppressed, superseded, current owner. Recorded as free text per field the mechanism's own
      writes actually answer; "not recorded" for one this round found missing. */
  whatRan: string;
  forWhichInstance: string;
  decisionBasis: string;
  sideEffectAttempted: string;
  attemptIdentity: string;
  dependencyResponse?: string;
  retriedSuppressedSuperseded?: string;
  currentOwner?: string;
}

export type ReadinessVerdict = "READY" | "READY_WITH_MAPPING" | "NEEDS_CONTRACT_WORK" | "NEEDS_RUNTIME_CHANGE";

export type GapArea =
  | "input-contract" | "output-contract" | "side-effect-boundary" | "idempotency" | "concurrency"
  | "freshness" | "retry" | "unknown-outcome" | "timeout-cancellation" | "ordering" | "versioning"
  | "conflict-arbitration" | "ownership" | "observability" | "composability" | "consumer-coverage"
  | "caller-callee-contract";

export interface GapFinding {
  priority: "P0" | "P1" | "P2";
  area: GapArea;
  finding: string;
}

export type TestScenarioKind =
  | "happy-path" | "duplicate-invocation" | "concurrent-invocation" | "stale-state"
  | "dependency-retryable-failure" | "dependency-terminal-failure" | "unknown-outcome"
  | "late-callback" | "cancellation-race" | "supersession" | "version-change" | "partial-failure";

export interface TestScenario {
  kind: TestScenarioKind;
  given: string;
  expect: string;
}

export interface ConsumerRef {
  id: string;
  /** "handoff" (a structural handoff node targets this mechanism), "event-trigger" (this
      mechanism's own trigger event is presumably emitted by callers not structurally traceable in
      the canonical graph), or "prose-reference" (named only in a distinctFrom/note, not a real
      consumption relationship). */
  kind: "handoff" | "event-trigger" | "prose-reference";
}

export interface RuntimeMechanismContract {
  id: string;
  shortName: string;
  responsibility: string;
  readiness: ReadinessVerdict;
  readinessWhy: string;
  inputContract: readonly InputRequirement[];
  outputContract: OutputContract;
  sideEffectBoundary: SideEffectBoundary;
  idempotency: IdempotencyContract;
  concurrency: ConcurrencyContract;
  freshness: FreshnessContract;
  retry?: RetryContract;
  unknownOutcome?: UnknownOutcomeContract;
  ordering?: OrderingContract;
  versioning?: VersioningContract;
  conflictArbitration?: ConflictArbitrationRef;
  handoffs: readonly HandoffContractRef[];
  observability: ObservabilityModel;
  consumers: readonly ConsumerRef[];
  testScenarios: readonly TestScenario[];
  gaps: readonly GapFinding[];
}

export type RuntimeMechanismContractSet = readonly RuntimeMechanismContract[];
