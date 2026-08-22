import type {
  CanonicalJourney,
  CategoryId,
  GlobalOrchestrationRule,
  MergedJourneyId,
  OrchestrationRule,
} from "./types";
import { GLOBAL_RULES } from "./global";
import { ACQUISITION_JOURNEYS, ACQUISITION_RULES } from "./acquisition";
import { ACTIVATION_JOURNEYS, ACTIVATION_RULES } from "./activation";
import { RETENTION_JOURNEYS, RETENTION_RULES } from "./retention";
import { CONSENT_JOURNEYS, CONSENT_RULES } from "./consent";
import { FEEDBACK_JOURNEYS, FEEDBACK_RULES } from "./feedback";
import { OWNERSHIP_JOURNEYS, OWNERSHIP_RULES } from "./ownership";
import { TIME_JOURNEYS, TIME_RULES } from "./time";
import { ACCESS_JOURNEYS, ACCESS_RULES } from "./access";
import { IDENTITY_JOURNEYS, IDENTITY_RULES } from "./identity";
import { STRUCTURE_JOURNEYS, STRUCTURE_RULES } from "./structure";
import { TERMINAL_JOURNEYS, TERMINAL_RULES } from "./terminal";
import { INTEGRATION_JOURNEYS, INTEGRATION_RULES } from "./integration";
import { PROCESSING_JOURNEYS, PROCESSING_RULES } from "./processing";
import { FINANCIAL_JOURNEYS, FINANCIAL_RULES } from "./financial";
import { FULFILLMENT_JOURNEYS, FULFILLMENT_RULES } from "./fulfillment";
import { REMEDY_JOURNEYS, REMEDY_RULES } from "./remedy";
import { SUBSCRIPTION_JOURNEYS, SUBSCRIPTION_RULES } from "./subscription";
import { SCHEDULING_JOURNEYS, SCHEDULING_RULES } from "./scheduling";
import { DECISION_JOURNEYS, DECISION_RULES } from "./decision";
import { RISK_JOURNEYS, RISK_RULES } from "./risk";
import { COMMUNICATION_JOURNEYS, COMMUNICATION_RULES } from "./communication";
import { DOCUMENT_JOURNEYS, DOCUMENT_RULES } from "./document";
import { DATA_JOURNEYS, DATA_RULES } from "./data";
import { CONTROL_JOURNEYS, CONTROL_RULES } from "./control";
import { ROLLOUT_JOURNEYS, ROLLOUT_RULES } from "./rollout";
import { INCIDENT_JOURNEYS, INCIDENT_RULES } from "./incident";

export * from "./types";

/* The registry.

   Categories are applied one at a time and each one lands here in full. The
   registry is deliberately thin: it aggregates, it does not reinterpret. A
   journey means what its own node graph says, and nothing here overrides it.

   `EXTERNAL_TARGETS` is the honest part. Category 1 hands off to lifecycles
   that later categories will define, and until they do, those handoffs point
   at names rather than at journeys. Listing them here means an unresolved
   destination is visible as a known gap instead of surfacing later as a
   broken reference. */

export interface Category {
  id: CategoryId;
  title: string;
  purpose: string;
  journeys: readonly CanonicalJourney[];
  rules: readonly OrchestrationRule[];
}

export const CATEGORIES: readonly Category[] = [
  {
    id: "acquisition",
    title: "Acquisition, intent & qualification",
    purpose:
      "State machines for people who have not fully entered a product or customer lifecycle yet: what their intent currently supports, whether they are identifiable, whether they are qualified, and who owns them next.",
    journeys: ACQUISITION_JOURNEYS,
    rules: ACQUISITION_RULES,
  },
  {
    id: "activation",
    title: "Activation, onboarding & early value",
    purpose:
      "State machines for the distance between entering something and getting value from it repeatedly: entry, setup, activation, first value and adoption, kept as five states rather than one.",
    journeys: ACTIVATION_JOURNEYS,
    rules: ACTIVATION_RULES,
  },
  {
    id: "retention",
    title: "Engagement, health, retention & churn prevention",
    purpose:
      "State machines that keep activity, engagement, health, churn risk, churn intent and churn as six separate things - and that let most evaluations correctly conclude nothing should be sent.",
    journeys: RETENTION_JOURNEYS,
    rules: RETENTION_RULES,
  },
  {
    id: "consent",
    title: "Consent, preferences, communication & contactability",
    purpose:
      "State machines separating whether we may contact someone from how they would like it done, from whether the channel can technically reach them, from whether the message arrived - and failing closed when two systems disagree.",
    journeys: CONSENT_JOURNEYS,
    rules: CONSENT_RULES,
  },
  {
    id: "feedback",
    title: "Feedback, advocacy, referral & relationship signals",
    purpose:
      "State machines holding apart what someone told us from what we are entitled to conclude: asked from received, a bad experience from a confirmed fault, a good one from an advocate, and a contribution from permission to publish it.",
    journeys: FEEDBACK_JOURNEYS,
    rules: FEEDBACK_RULES,
  },
  {
    id: "ownership",
    title: "Ownership, assignment, approval & decision authority",
    purpose:
      "State machines separating routed from assigned from accepted from active, and requested from reviewed from approved from authorised from executed - refusing to invent a quorum or a materiality rule where no policy defines one.",
    journeys: OWNERSHIP_JOURNEYS,
    rules: OWNERSHIP_RULES,
  },
  {
    id: "time",
    title: "Time, deadlines, expiry & temporary states",
    purpose:
      "State machines for the states time changes rather than the messages it schedules - keeping a reminder date apart from a deadline, expiring apart from expired, grace apart from active, and revalidating every timer against the present before it acts.",
    journeys: TIME_JOURNEYS,
    rules: TIME_RULES,
  },
  {
    id: "access",
    title: "Access, entitlement, credentials & capability",
    purpose:
      "State machines separating eligible from entitled from provisioned from available from authorised from credentialed - and keeping expired apart from revoked, suspended apart from terminated, deprovisioning apart from deletion.",
    journeys: ACCESS_JOURNEYS,
    rules: ACCESS_RULES,
  },
  {
    id: "identity",
    title: "Identity, verification, authentication & account integrity",
    purpose:
      "State machines separating identified from verified from authenticated from authorised, binding every verification to the claim it checked, and keeping a security signal apart from a finding.",
    journeys: IDENTITY_JOURNEYS,
    rules: IDENTITY_RULES,
  },
  {
    id: "structure",
    title: "Account structure, identity relationships & entity reconciliation",
    purpose:
      "State machines for how entities relate: linked kept apart from merged, parent state from child state, detection from consolidation - and refusing to propagate or aggregate without an explicit rule.",
    journeys: STRUCTURE_JOURNEYS,
    rules: STRUCTURE_RULES,
  },
  {
    id: "terminal",
    title: "Entity merge, account closure, data lifecycle & terminal states",
    purpose:
      "State machines for the operations that cannot be taken back - keeping subscription cancellation, account closure, data deletion and terminal relationship state as four independent transitions, and failing safe wherever consolidating or destroying would require an authority the system does not have.",
    journeys: TERMINAL_JOURNEYS,
    rules: TERMINAL_RULES,
  },
  {
    id: "integration",
    title: "Integrations, synchronization, external systems & data consistency",
    purpose:
      "State machines for the far side of a network boundary, where the state is routinely unknown - keeping submission apart from completion, reconnection apart from synchronization, and refusing to convert silence into a finding.",
    journeys: INTEGRATION_JOURNEYS,
    rules: INTEGRATION_RULES,
  },
  {
    id: "processing",
    title: "Processing, queues, async work & operational reliability",
    purpose:
      "State machines for whether our own system finishes what it accepted - keeping accepted apart from completed, technical success apart from business outcome, and refusing to replay into an unknown side effect.",
    journeys: PROCESSING_JOURNEYS,
    rules: PROCESSING_RULES,
  },
  {
    id: "financial",
    title: "Transactions, payments, billing & financial outcomes",
    purpose:
      "Domain-neutral state machines for money moving - obligation apart from attempt, authorized apart from captured apart from settled, and an UNKNOWN state whose safe response is to investigate rather than charge again.",
    journeys: FINANCIAL_JOURNEYS,
    rules: FINANCIAL_RULES,
  },
  {
    id: "fulfillment",
    title: "Orders, fulfillment, delivery & service completion",
    purpose:
      "Domain-neutral state machines for the distance between asking for something and having it - requested apart from accepted, accepted apart from fulfillable, dispatched apart from delivered, and every terminal state stating what remains owed.",
    journeys: FULFILLMENT_JOURNEYS,
    rules: FULFILLMENT_RULES,
  },
  {
    id: "remedy",
    title: "Returns, remedies, corrections & post-completion recovery",
    purpose:
      "Domain-neutral state machines for what happens when what was delivered was wrong - the unresolved obligation established before the remedy is chosen, the remedy verified against the obligation rather than against its own task, and compensation kept beside the fix rather than substituted for it.",
    journeys: REMEDY_JOURNEYS,
    rules: REMEDY_RULES,
  },
  {
    id: "subscription",
    title: "Subscriptions, contracts, renewals & continuing relationships",
    purpose:
      "Domain-neutral state machines for relationships that run on terms - created apart from active, eligible apart from decided apart from executed, requested apart from scheduled apart from ended, and every scheduled state re-derived at its effective time from what is authoritative then.",
    journeys: SUBSCRIPTION_JOURNEYS,
    rules: SUBSCRIPTION_RULES,
  },
  {
    id: "scheduling",
    title: "Scheduling, appointments, reservations & time-bound commitments",
    purpose:
      "Domain-neutral state machines for commitments to a specific moment - available apart from held apart from confirmed, attended apart from completed, and the three ways an appointment fails to happen kept apart because only one of them is the customer's doing.",
    journeys: SCHEDULING_JOURNEYS,
    rules: SCHEDULING_RULES,
  },
  {
    id: "decision",
    title: "Approvals, decisions, reviews & human-in-the-loop work",
    purpose:
      "Domain-neutral state machines for judgment held open until an authority closes it - requested apart from assigned apart from under review apart from decided apart from executed, with approvals bounded by time, target state and count rather than standing forever.",
    journeys: DECISION_JOURNEYS,
    rules: DECISION_RULES,
  },
  {
    id: "risk",
    title: "Risk, policy, compliance & exception management",
    purpose:
      "Domain-neutral state machines for the controls that stop things - signal apart from finding, block apart from violation, violation apart from intent, restriction no wider than the evidence justifies, and every stopped state carrying the condition that would release it.",
    journeys: RISK_JOURNEYS,
    rules: RISK_RULES,
  },
  {
    id: "communication",
    title: "Notifications, communications, delivery & contactability",
    purpose:
      "Domain-neutral state machines for telling somebody something - event apart from obligation, obligation apart from message, submitted apart from delivered apart from read, and every stale message stopped at the last moment rather than sent for completeness.",
    journeys: COMMUNICATION_JOURNEYS,
    rules: COMMUNICATION_RULES,
  },
  {
    id: "document",
    title: "Documents, records, signatures & versioned artifacts",
    purpose:
      "Domain-neutral state machines for artifacts whose value is that they do not change - draft apart from issued, issued apart from signed, signed apart from effective, changes as successors rather than edits, and conflicts explained rather than tidied away.",
    journeys: DOCUMENT_JOURNEYS,
    rules: DOCUMENT_RULES,
  },
  {
    id: "data",
    title: "Data change, import, migration & state transformation",
    purpose:
      "Domain-neutral state machines for changing or moving a dataset safely - received apart from parsed apart from validated apart from applied, migration apart from cutover, backfill apart from replay, and rollback as undoing one operation rather than everything since.",
    journeys: DATA_JOURNEYS,
    rules: DATA_RULES,
  },
  {
    id: "control",
    title: "Ownership, delegation, transfer & multi-party control",
    purpose:
      "Domain-neutral state machines for who is accountable for an entity - ownership apart from access, requested apart from accepted apart from cut over, delegation as borrowed authority that ends, and ownership changes that update the present without rewriting who did what.",
    journeys: CONTROL_JOURNEYS,
    rules: CONTROL_RULES,
  },
  {
    id: "rollout",
    title: "Deployment, rollout, change & version transitions",
    purpose:
      "Domain-neutral state machines for applying a change to a population - available apart from eligible apart from ready apart from applied apart from verified, expansion gated on evidence rather than elapsed time, and rollback as a decision before it is an execution.",
    journeys: ROLLOUT_JOURNEYS,
    rules: ROLLOUT_RULES,
  },
  {
    id: "incident",
    title: "Incidents, service disruption, operations & recovery",
    purpose:
      "Domain-neutral state machines for a failure several entities share - anomaly apart from incident, mitigated apart from recovered apart from restored apart from stable apart from resolved, and closure that leaves every individual case and obligation still open.",
    journeys: INCIDENT_JOURNEYS,
    rules: INCIDENT_RULES,
  },
];

export const JOURNEYS: readonly CanonicalJourney[] = CATEGORIES.flatMap((c) => c.journeys);
export const RULES: readonly OrchestrationRule[] = CATEGORIES.flatMap((c) => c.rules);

/* The rules that belong to no category. Promoted only where the same
   orchestration problem appears in at least two independent categories and
   carries no domain business semantics. They are re-exported here so there is
   one registry to read, and kept in their own array so nothing can mistake
   them for journeys or fold them into a category's count. */
export { GLOBAL_RULES };

/** Every rule the library holds, category and global together. */
export const ALL_RULES: readonly (OrchestrationRule | GlobalOrchestrationRule)[] = [
  ...RULES,
  ...GLOBAL_RULES,
];

/** Journeys that declare a standing contest for ownership of a scope. Most do
    not, and an empty competition field is a statement rather than a gap. */
export const COMPETING_JOURNEYS: readonly CanonicalJourney[] = JOURNEYS.filter(
  (j) => j.competition !== undefined,
);

/* Consolidation redirects. Four journeys turned out to claim the same
   mechanism as another, and each was merged into the survivor rather than
   left as a second authority over one event. Their ids stay here so existing
   references resolve, and they are deliberately not journeys: JOURNEYS does
   not contain them, and the validator rejects any handoff or distinctFrom
   that still points at one. */
export const MERGED_INTO: Readonly<Record<MergedJourneyId, string>> = {
  "CON-37": "CMS-208",
  "CMS-209": "CON-36",
  "CTL-239": "OWN-57",
  "CTL-240": "OWN-54",
};

/** Follows a consolidation redirect, so a stored id from before the merge
    still reaches the journey that now owns the mechanism. */
export const resolveJourneyId = (id: string): string =>
  MERGED_INTO[id as MergedJourneyId] ?? id;

export const byId = (id: string): CanonicalJourney | undefined => {
  const resolved = resolveJourneyId(id);
  return JOURNEYS.find((j) => j.id === resolved);
};

/** Handoff destinations that no category defines yet. Each is a promise a
    later category has to keep. */
export const EXTERNAL_TARGETS: readonly string[] = Array.from(
  new Set(
    JOURNEYS.flatMap((j) =>
      j.nodes
        .filter((n) => n.kind === "handoff")
        .map((n) => (n as { to: string }).to)
        .filter((to) => to.startsWith("external:")),
    ),
  ),
).sort();
