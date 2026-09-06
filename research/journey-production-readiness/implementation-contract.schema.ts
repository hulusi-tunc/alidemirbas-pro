/* Implementation Contract — research artifact, NOT wired into production.

   Proposes the shape of an `implementation` layer that sits BESIDE a
   canonical journey (src/canonical/*.ts) without polluting the canonical
   graph: the answers a company needs before they can build the journey on
   their own stack. See COMMUNICATING-CUSTOMER-JOURNEYS-AUDIT.md for the
   audit this schema was derived from — every field here maps to a
   requirement observed across the 71 orchestration-bearing Customer
   Journeys, not to a theoretical taxonomy authored first and fitted after.

   The layering this file protects:

     Canonical Journey        the reusable state machine (src/canonical/)
           ↓
     Implementation Contract  what a company must PROVIDE/CONFIGURE (this file)
           ↓
     Company Mapping          that company's own events/fields/systems/teams
           ↓
     Platform Implementation  vendor-specific (Braze, Insider, Salesforce, ...)

   Every field describes a REQUIREMENT, never a VALUE: `resolutionWindow:
   ConfigRef` states that a window must be configured and what governs it,
   never "48h". A value belongs three layers down, in Company Mapping. */

/** The canonical evidence class a trigger's semantic event carries
    (src/canonical/types.ts SignalSource) — the contract restates it here so
    a reader does not have to cross-reference the canonical file to know
    whether the trigger event is a fact of record or an inference. */
export type SourceType = "authoritative" | "declared" | "behavioral" | "inferred";

export interface TriggerContract {
  /** The registry event id (src/canonical/events.ts) that instantiates the journey. */
  canonicalEvent: string;
  sourceType: SourceType;
  /** What the company's own system must establish before this fires — plain
      requirements, not field names ("a resumable process exists with at
      least one item and a resume destination"). */
  requiredEvidence: string[];
  /** Named proxies the canonical trigger explicitly rules out (from
      trigger.evidence.insufficientAlone) — carried forward because an
      implementer who does not see this list will wire the wrong event. */
  insufficientEvidence: string[];
}

/** What makes one journey instance ONE instance. The single most common
    real-world defect this audit found: a graph that is otherwise correct
    but whose instance boundary an implementer has to guess. */
export interface InstanceIdentity {
  /** The business object an instance is scoped to, in plain words — never
      the platform's own identifier for it. */
  scope: string;
  /** The company fields whose combination must be unique per open
      instance — described as roles ("person + the specific obligation"),
      not as invented universal field names. */
  key: string[];
  /** What happens when a new trigger fires while an instance for the same
      key is already open. */
  dedupePolicy: "reject-duplicate" | "supersede-open" | "merge-into-open" | "allow-concurrent";
  /** Only present when concurrency is not simply one-active-per-key —
      states the condition under which more than one instance may
      legitimately be open (e.g. "two different baskets for one person"). */
  concurrencyNote?: string;
}

export interface RequiredDatum {
  /** The company attribute the graph actually reads — from
      implementation.attributes.required/optional and the conditions/waits
      that consume it, never a generic CRM-field laundry list. */
  field: string;
  required: boolean;
  /** Which node(s) or decision consume it, so an implementer can trace the
      requirement back to the graph rather than take it on faith. */
  usedBy: string;
}

export interface SourceOfTruthRef {
  /** The decision this authority governs, in plain words. */
  decision: string;
  /** The KIND of system that must be authoritative — never a vendor name
      ("payment/billing system of record", not "Stripe"). */
  systemKind: string;
  /** True where the graph explicitly treats a message interaction (open,
      click, view) as evidence only and never as this decision's outcome —
      the field exists so "message interaction ≠ business state" is a
      structural assertion an implementer cannot silently violate. */
  engagementIsEvidenceOnly: boolean;
}

export interface ConfigRef {
  /** Matches the canonical Config.key on the journey (src/canonical/types.ts). */
  key: string;
  meaning: string;
  basis: "business policy" | "expected user rhythm" | "operational SLA" | "legal requirement" | "platform constraint";
  /** The canonical TimingClass, when the config gates a wait. */
  timingClass?: string;
  required: boolean;
}

/** Channel eligibility for ONE communication or human action — never for
    the journey as a whole. A journey-level `channels: [...]` array answers
    "which channels does this journey ever use"; it cannot answer "which
    channel does THIS message use, and why" — which is the question that
    actually blocks implementation. */
export interface ChannelPolicyRule {
  /** Node id of the governing action. */
  action: string;
  /** Ordered: first eligible role wins, matching the canonical
      channelRoles/channelStrategy ordering — not an unordered set. */
  eligible: string[];
  preferredWhen?: string;
  fallback?: string[];
  urgency: "low" | "normal" | "high";
  requiresPermission: boolean;
  requiresContactability: boolean;
}

export interface HandoffContractRef {
  /** Node id of the handoff. */
  node: string;
  /** Journey id, or an `external:` conceptual target. */
  target: string;
  /** What the receiving journey needs and would otherwise have to
      re-resolve — drawn from the canonical `carries` list plus anything
      the audit found missing from it. */
  requiredContext: string[];
  ownershipTransfer: boolean;
  /** True where the handoff must suppress the source journey's own
      remaining queued actions (from Suppressions/`suppresses`). */
  suppressSource: boolean;
}

/** Engagement signals (open/click/view) belong ONLY in `diagnostic` — this
    is a structural rule, not a convention, so a reviewer can grep for a
    violation instead of re-reading every journey to check. */
export interface OutcomeContract {
  primary: string[];
  secondary: string[];
  neutral: string[];
  failure: string[];
  diagnostic: string[];
}

export type TestScenarioKind =
  | "happy-path"
  | "alternate-branch"
  | "timeout"
  | "late-event"
  | "duplicate-trigger"
  | "superseding-state"
  | "permission-loss"
  | "contactability-loss"
  | "human-ownership"
  | "idempotency";

export interface TestScenario {
  kind: TestScenarioKind;
  given: string;
  expect: string;
}

export type ReadinessVerdict = "READY" | "READY_WITH_MAPPING" | "NEEDS_CONTRACT_WORK" | "NEEDS_CANONICAL_CHANGE";

export type GapArea =
  | "instance" | "events" | "data" | "source-of-truth" | "config"
  | "channel" | "suppression" | "handoff" | "outcome" | "test" | "canonical-graph";

export interface GapFinding {
  priority: "P0" | "P1" | "P2";
  area: GapArea;
  finding: string;
}

export interface ImplementationContract {
  id: string;
  shortName: string;
  readiness: ReadinessVerdict;
  readinessWhy: string;
  trigger: TriggerContract;
  instance: InstanceIdentity;
  requiredData: RequiredDatum[];
  sourceOfTruth: SourceOfTruthRef[];
  configRefs: ConfigRef[];
  channelPolicy: ChannelPolicyRule[];
  /** Real conflicts only — never populated mechanically for every journey.
      `conflictsWith` names sibling journey ids from the conflict audit. */
  suppression: { statement: string; conflictsWith: string[] }[];
  handoffs: HandoffContractRef[];
  outcomes: OutcomeContract;
  testScenarios: TestScenario[];
  gaps: GapFinding[];
}

export type ImplementationContractSet = readonly ImplementationContract[];
