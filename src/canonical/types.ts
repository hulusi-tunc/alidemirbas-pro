/* The canonical lifecycle library.

   This is a library of state machines, not a library of campaigns. A journey
   earns its place here by solving a lifecycle problem no other journey solves
   - a different state, transition, dependency, failure, timeout, handoff or
   business consequence. Two flows that differ only by sector, channel or
   entity are one journey with a different subject, and they are not both in
   here.

   Three things follow from that, and they shape the schema below.

   First, a journey is a graph, not a sequence. "Wait until the event or the
   SLA, whichever comes first, and go somewhere different depending on which"
   cannot be expressed as a list of steps with a branch column - it needs real
   edges. Every node names its own successors.

   Second, there is no message copy in here. What a person is told is a
   downstream concern of whatever renders these; what the machine does is the
   concern of this layer. A node says "send education matched to the reason
   they entered", never the subject line.

   Third, the distinctions the library exists to protect are written into the
   schema rather than left to prose. `source: "authoritative"` versus
   `"behavioral"` is how "a click is not a conversion" stops being advice and
   starts being a field. `writes.mode: "append"` is how "do not overwrite the
   reason history" survives an implementation. `windowExtendsOnEngagement` is
   how "engagement does not reset the nurture clock" stays true after someone
   ships a change. */

/** Categories arrive one at a time and each is applied in full. */
export type CategoryId =
  | "acquisition"
  | "activation"
  | "retention"
  | "consent"
  | "feedback"
  | "ownership"
  | "time"
  | "access"
  | "identity"
  | "structure"
  | "terminal"
  | "integration"
  | "processing"
  | "financial"
  | "fulfillment"
  | "remedy"
  | "subscription"
  | "scheduling"
  | "decision"
  | "risk"
  | "communication"
  | "document"
  | "data"
  | "control"
  | "rollout"
  | "incident";

/** An execution channel a journey's outbound communication can run on.

    This vocabulary is not invented here: it is the channel set the retired
    CRM Journey Archive carried on its own 90 journeys, preserved verbatim
    apart from `inapp` -> `in-app` for readability. `sales` and `task` are in
    it deliberately - they are how that archive expressed the two routes that
    reach a person rather than a device, and dropping them would lose the
    distinction between "a salesperson picks this up" and "a queue item is
    created for someone to work".

    A journey declares the channels its own communication can legitimately
    use. It is a constraint, not a runtime choice: which one a given send
    actually takes is still decided by the canonical send path (see
    `sendPathOrder`, where channel routing is stage 9 of 11, after purpose,
    permission and contactability). A journey whose work is entirely internal
    carries an empty array, and that is a statement rather than a gap. */
export type ChannelId =
  | "email"
  | "sms"
  | "push"
  | "in-app"
  | "whatsapp"
  | "sales"
  | "task";

/** The single primary discovery filter: what problem a journey solves, not
    which domain it lives in. Derived from a full semantic re-audit of all
    255 journeys (see production/journey-goal-vocabulary-audit for the
    methodology and the id -> goal migration matrix) - each journey's own
    node graph and purpose were read individually and matched against "what
    would a practitioner be trying to solve", never inferred from keywords in
    the name or purpose text at runtime. Every journey carries exactly one:
    Goal is a single-select discovery filter, not a multi-label tag. */
export type GoalId =
  | "eligibility-qualification"
  | "recovery-retry"
  | "escalation-exception"
  | "delivery-confirmation"
  | "suspension-restoration"
  | "progression-milestone"
  | "reconciliation-correction"
  | "access-entitlement-change"
  | "cancellation-termination"
  | "decision-approval"
  | "data-integrity"
  | "scheduling-commitment"
  | "expiry-renewal"
  | "ownership-transfer"
  | "compensation-remedy"
  | "change-versioning"
  | "routing-assignment"
  | "relationship-recovery-intervention"
  | "consent-permission"
  | "risk-compliance"
  | "identity-verification"
  | "relationship-hierarchy-structure"
  | "merge-consolidation"
  | "root-cause-diagnostic-correlation"
  | "health-risk-signal-scoring"
  | "readiness-revalidation";

/** A journey id that was consolidated into another during review and is no
    longer canonical. Kept only so existing references resolve; never counted
    as a journey and never a valid handoff target. */
export type MergedJourneyId = "CON-37" | "CMS-209" | "CTL-239" | "CTL-240" | "RET-25";

/** The scope two journeys have to share before they are competing at all.
    Sharing the key is not enough - they compete only on the same instance of
    it, so a journey that owns order A leaves order B alone. A deployment's own
    scopes (a route, a course, a policy, a ticket) resolve to one of these
    rather than extending the list, because the resolution rules are written
    against these and nothing else. */
export type CompetitionScope =
  | "person"
  | "account"
  | "subscription"
  | "order"
  | "order-item"
  | "cart"
  | "product"
  | "reservation"
  | "topic"
  | "communication-purpose";

/** What happens to a journey that loses. Which one applies is a property of
    the losing journey rather than of the contest: a journey holding a real
    obligation pauses, one whose reason has been overtaken is superseded, and
    one that is simply not the right thing to say now is suppressed. */
export type LosingJourneyState = "suppressed" | "paused" | "superseded" | "exit";

/** Declared only where a journey genuinely competes with another for ownership
    of the same scope instance. Most journeys never do and carry nothing here -
    an empty field is the normal case, not an omission. */
export interface JourneyCompetition {
  scope: CompetitionScope;
  /** The named set of journeys that cannot speak at the same time as this one
      on the same scope instance. Membership is declared rather than inferred
      from similarity. */
  exclusionGroup: string;
  /** Where the governing policy places this journey when it resolves the
      group. The text names the policy's own ordering; no numeric rank is
      invented here, and equal standing is not a tie to be broken locally. */
  precedence: string;
  onLoss: LosingJourneyState;
}

/** What happens to a send that reaches a channel outside its delivery window.
    Which one applies is a property of the channel and the purpose together,
    declared by policy rather than inferred from urgency. */
export type DeliveryWindowOutcome =
  | "queue-until-allowed"
  | "drop-if-stale"
  | "bypass-if-exempt";

/** The three kinds of contact-pressure limit. They differ in exactly one
    thing: whether a higher-authority journey may proceed on capacity a
    lower-priority one has already consumed. */
export type ContactPressureCapClass =
  | "hard"
  | "soft-contact-pressure"
  | "journey-or-class";

/** One ordered stage of the send path. The order exists so that the same rule
    set cannot produce different answers by being evaluated in a different
    sequence. */
export interface SendPathStage {
  step: number;
  stage: string;
  /** The global rules or canonical journeys that own this stage. */
  owner: readonly string[];
}

/** A rule that belongs to no category. Promoted only where the same
    orchestration problem appears in at least two independent categories, the
    principle carries no domain business semantics, and it describes safety
    across journeys rather than the behaviour of any one of them.

    Global rules are not journeys. They carry no journey id, they do not appear
    in JOURNEYS, and they do not change the canonical journey count. */
export interface GlobalOrchestrationRule {
  id: string;
  scope: "global";
  name: string;
  /** What goes wrong when the rule is absent. */
  problem: string;
  rule: string;
  /** The categories this was promoted from or applies to. Two is the minimum
      that justifies promotion at all. */
  appliesTo: readonly CategoryId[];
  /** Boundaries, exceptions, and the local specializations that remain. */
  notes?: string;
}

/** Where a fact came from, which decides what it is allowed to conclude.

    `authoritative` is a system of record stating a business fact: the order
    exists, the subscription started, the opportunity is closed lost. Only
    these may be treated as outcomes.

    `declared` is the person telling us something directly - a submitted form,
    a chosen option, a stated requirement. Strong evidence of intent, and
    never by itself evidence of permission.

    `behavioral` is observed action. It carries real evidence of intent and
    real ambiguity with it, and its strength depends on repetition and
    freshness.

    `inferred` is a model's opinion. It may prioritise work; it may not
    conclude an outcome, resolve an identity, or remove a right. */
export type SignalSource = "authoritative" | "declared" | "behavioral" | "inferred";

export type NodeId = string;

/* ─────────────────────────── vNext primitives ───────────────────────────
   Added at Gate 1 of the vNext migration (see JOURNEY_VNEXT_ARCHITECTURE.md
   §F and ARCHITECTURE_PATCH_0_5.md). Every vNext field on a node or a
   journey is optional so the un-migrated corpus keeps compiling; the
   validator treats the same fields as required the moment a journey
   declares `measurement`, which is the migration marker. */

/** How a statement is to be read. Nothing numeric may sit inside a
    CANONICAL_RULE - the validator refuses a number with a unit there. */
export type Label = "CANONICAL_RULE" | "RECOMMENDED_DEFAULT" | "CONFIG_REQUIRED" | "OPTIONAL_STRATEGY";

/** A sentence whose classification matters: suppressions, supersession,
    and any strategy statement a company may switch off. */
export interface RuleStatement {
  id: string;
  label: Label;
  text: string;
}

/** Where a recommended value comes from. `published-benchmark` needs a
    citation and is unused until one exists in the repository; `example-only`
    renders as an example and never as a recommendation. */
export type DefaultBasis = "corpus-rule" | "attribute-bound" | "example-only" | "published-benchmark";

/** Time is relative to something; the class says what. Business context is
    not a class - it goes in `default.applicableWhen`. */
export type TimingClass =
  | "attribute-bound"
  | "reminder-before-attribute"
  | "response-window"
  | "recovery-window"
  | "decision-sla"
  | "observation-window"
  | "cooldown"
  | "backoff"
  | "external-window";

/** A value the adopting company supplies, with what the library can say
    about it: `rule` is the CANONICAL_RULE the value serves (never a number),
    `default` is a RECOMMENDED_DEFAULT, `required: true` is CONFIG_REQUIRED. */
export interface Config<T = string> {
  key: string;
  rule: string;
  class?: TimingClass;
  default?: {
    value: T | { min: T; max: T };
    confidence: "high" | "medium" | "low";
    basis: DefaultBasis;
    citation?: string;
    applicableWhen?: string;
    avoidWhen?: string;
  };
  required: boolean;
}

/** One entry in the semantic-event registry (events.ts). Triggers, waits and
    measurement reference registry ids; the adopting company maps its own
    event names onto the meaning. `commonMappings` are examples only. */
export interface SemanticEvent {
  id: string;
  meaning: string;
  source: SignalSource;
  entity: string;
  commonMappings?: readonly string[];
}
export type SemanticEventRef = string;

export type PriorityClass =
  | "security"
  | "transactional"
  | "service-critical"
  | "service"
  | "retention"
  | "lifecycle"
  | "promotional";
export type PressureClass = "none" | "service" | "lifecycle" | "promotional";
export type ChannelRole = "in-session" | "low-friction" | "persistent" | "urgent" | "human";
export type ExitClass = "success" | "invalid-state" | "suppression" | "timeout" | "failure" | "no-action";
export type Capability =
  | "delayed-execution"
  | "event-cancellation"
  | "attribute-date-wait"
  | "consent-lookup"
  | "contactability-lookup"
  | "frequency-counter"
  | "deep-link-binding"
  | "human-task-queue"
  | "holdout-assignment"
  | "idempotent-send";
/** Derived only - never authored. See surface.ts. */
export type Surface = "customer" | "mechanism" | "operational";

/** One communication in the practitioner's touch plan. Every touch REFERENCES
    graph nodes; timing is read from the referenced wait and never restated.
    `channelRoles` is ORDERED: the first role whose strategy `when` holds is
    used - channel selection inside one touch, which is neither touch
    progression (the touch order) nor delivery fallback (channelStrategy.fallback). */
export interface Touch {
  id: string;
  stage: string;
  action: NodeId;
  /** The touch this one follows in the plan. Absent = the touch is reached
      from the entry (a first touch, or an alternative first touch on another
      branch). Progression is this reference, never array position. */
  after?: string;
  gatedBy?: NodeId;
  prerequisites: readonly NodeId[];
  purpose: string;
  channelRoles: readonly ChannelRole[];
  destination?: { target: string; boundTo: string; mustNotClaim?: readonly string[] };
  /** Exempt from pressure caps and from a non-mandatory local cap; never from
      hard gates, deduplication, authoritative recheck or idempotency. */
  mandatory: boolean;
  priority?: PriorityClass;
  priorityReason?: string;
  label: Label;
}

export interface ChannelStrategy {
  roles: readonly { role: ChannelRole; channels: readonly ChannelId[]; when: string }[];
  /** DELIVERY recovery for the same touch after a delivery failure - not the next touch. */
  fallback: "next-eligible-role" | "same-role-other-channel" | "none";
  simultaneous?: { allowed: true; reason: string };
  label: Label;
}

export type OrchestrationStrategy =
  | "single-notice"
  | "notice-then-confirm"
  | "progressive-recovery"
  | "deadline-countdown"
  | "offer-decide-remind"
  | "two-party-confirmation"
  | "human-escalation-ladder";

export interface Orchestration {
  strategy: OrchestrationStrategy;
  touches: readonly Touch[];
  /** Ids of suppressions/eligibility items under which this journey legitimately sends nothing. */
  noAction: readonly string[];
}

export interface Measurement {
  /** Did THIS journey complete its own responsibility. Always self-scoped. */
  journeyOutcome: { type: "exit" | "handoff" | "exit-or-handoff" | "event"; refs: readonly string[] };
  /** The customer/business event we ultimately care about, which may be
      recorded downstream through an explicitly declared handoff chain. */
  businessOutcome?: {
    event: SemanticEventRef;
    unit: "instance" | "person";
    observationScope: { type: "self" } | { type: "handoff-chain"; journeys: readonly string[] };
    window: { type: "until-exit" } | { type: "through-handoff"; until: SemanticEventRef } | Config;
    attribution: "entered-before-event" | "touched-before-event";
    comparison: "persistent-holdout" | "pre-post" | "none" | "not-applicable";
    holdout?: Config<number>;
  };
  secondary?: readonly SemanticEventRef[];
  guardrails: readonly string[];
  operational: readonly string[];
}

/** A practitioner-facing specialisation of a generic canonical journey. It may
    override Config keys and channelStrategy.roles only - never nodes, touches
    or exits; if it needs those, it is a separate canonical journey. */
export interface Preset {
  id: string;
  name: string;
  applicableWhen: RuleStatement;
  overrides: Readonly<Record<string, unknown>>;
  destination?: string;
  aliases: readonly string[];
}

/** Where a journey starts, and what it refuses to start on. `insufficientAlone`
    is the load-bearing half: most bad lifecycle automation is a journey that
    fired on one weak signal. */
export interface TriggerNode {
  id: NodeId;
  kind: "trigger";
  event: string;
  evidence: {
    requires: readonly string[];
    /** Signals that look like this trigger and are not it. */
    insufficientAlone?: readonly string[];
    source: SignalSource;
  };
  next: NodeId;
}

/** Something the system does that is not a decision and not a wait. `writes`
    records what state it changes, and `"append"` marks the fields where
    history has to survive - a reason, an ownership change, a decision trail.
    Overwriting those is the failure this field exists to prevent. */
export interface ActionNode {
  id: NodeId;
  kind: "action";
  does: string;
  writes?: readonly { field: string; mode: "append" | "set" }[];
  /** vNext: required by the validator on actions with an external side effect. */
  idempotencyKey?: string;
  /** vNext: required on the action that re-enters a loop. */
  attemptBudget?: Config<number>;
  next: NodeId;
  /** What this action's own effect is on the world outside the system.
      Omitted is the ordinary case and means an internal state or data
      operation - 1,048 of the library's 1,232 actions. `communication`
      marks an action whose effect is a message reaching a recipient, and is
      what lets the canvas draw it as such instead of defaulting every action
      to Internal; `human` marks one that puts work in front of a person.

      Explicit, because the alternative is guessing from the prose, and the
      prose is deliberately channel-agnostic. Which channel a communication
      action takes is not recorded here - the journey's own `channels` names
      the permitted set, and the send path chooses within it. */
  execution?: "communication" | "human";
}

/** A real fork. Two branches minimum: a condition with one arm is a filter
    wearing a decision's clothes, and it hides what happens to everyone who
    fails it. */
export interface ConditionNode {
  id: NodeId;
  kind: "condition";
  asks: string;
  /** vNext `observes`: the attribute or event the test reads. */
  branches: readonly { label: string; when: string; observes?: string; to: NodeId }[];
}

/** An asynchronous pause with both arms named. A wait with no timeout strands
    people on an event that may never arrive; a timeout with nowhere to go is
    an exit pretending to be patience. */
export interface WaitNode {
  id: NodeId;
  kind: "wait";
  /** Registry event ids on migrated journeys (they ARE the cancellation
      events); prose on un-migrated ones. */
  until: readonly string[];
  onEvent: NodeId;
  /** vNext: `after` becomes a Config with a timing class; `relativeTo` says
      what the clock starts from, `attribute` names the stored moment. */
  timeout: {
    after: string | Config;
    reason: string;
    relativeTo?: "trigger" | "previous-touch" | "attribute";
    attribute?: string;
  };
  onTimeout: NodeId;
  /** vNext: the authoritative state re-read before acting on timeout. */
  recheck?: string;
  /** Whether activity during the wait pushes the deadline back. Almost always
      false: a bounded window that any engagement extends is not bounded. */
  windowExtendsOnEngagement: boolean;
}

/** A named business state reached mid-journey, worth recording even though the
    journey continues past it. */
export interface OutcomeNode {
  id: NodeId;
  kind: "outcome";
  state: string;
  means: string;
  next: NodeId;
}

/** The end of this journey's ownership. `terminal: true` means the state
    itself forbids re-entry (a structural mismatch cannot become a fit);
    everything else names the condition under which a new instance may start,
    so that "we stopped" is never confused with "never again". */
export interface ExitNode {
  id: NodeId;
  kind: "exit";
  state: string;
  /** vNext: which kind of ending this is. */
  class?: ExitClass;
  terminal: boolean;
  reEntry: string;
}

/** Ownership moving to another lifecycle. `carries` is what must survive the
    boundary; `suppresses` is what must stop before it - a handoff that leaves
    the old journey's queued sends alive delivers the superseded state anyway. */
export interface HandoffNode {
  id: NodeId;
  kind: "handoff";
  /** A canonical journey id, or `external:<lifecycle>` for a destination a
      later category will define. */
  to: string;
  on: string;
  carries: readonly string[];
  suppresses?: readonly string[];
  /** vNext: what the receiving side needs, machine-readable. */
  contract?: { requiredFields: readonly string[] };
}

export type CanonicalNode =
  | TriggerNode | ActionNode | ConditionNode
  | WaitNode | OutcomeNode | ExitNode | HandoffNode;

export interface CanonicalJourney {
  id: string;
  slug: string;
  category: CategoryId;
  /** What problem this journey solves, as a single primary value - see
      GoalId. Explicit canonical metadata, not derived at runtime. */
  goal: GoalId;
  /** The execution channels this journey's own communication may run on -
      see ChannelId. Explicit canonical metadata on every journey, never
      inferred from node text; `[]` where the journey does no outbound
      communication at all. */
  channels: readonly ChannelId[];
  name: string;
  /** A short, plain-language label for the same journey, for readers who
      are not reading a state machine.

      `name` is the canonical form and stays authoritative: it states the
      shape of the graph ("State -> transition -> outcome"), which is what a
      practitioner needs on the detail page and what the slug was derived
      from. `shortName` is what a list card and a page title show instead,
      so the library is scannable without decoding a transition arrow.

      It must be TRUE to the journey, not a marketing name reached for
      because it sounds familiar: TIM-61 is "Deadline Tracking" and not
      "Deadline Reminder" precisely because its own reusable rule says a
      deadline governs an obligation "rather than merely schedule
      communication around a date", and CMS-206 is "Send Attempt Status"
      rather than anything with "Delivery" in it because its rule is that
      submitting a message is not proof the recipient received it.

      Required on every journey, and unique across the library - the
      validator enforces both. It started optional while only the 87
      communication journeys had one; all 281 are named now, so a new
      journey without one is an omission rather than a stage. */
  shortName: string;
  purpose: string;
  /** vNext: the business behaviour this journey exists to cause or protect. */
  objective?: string;
  /** What the journey is about, which is what its exits and suppressions are
      scoped to. A journey about one order does not close because a different
      order was placed. vNext adds the machine-readable instance model. */
  entity: {
    scope: string;
    note: string;
    instanceKey?: readonly string[];
    concurrency?: "one-active-per-key" | "many";
    supersession?: RuleStatement;
  };
  /** vNext: what must be true at entry; may cite global gates by id. */
  eligibility?: readonly string[];
  /** vNext: who must never enter or must exit - typed so the label is enforced. */
  suppressions?: readonly RuleStatement[];
  /** vNext, customer communicating journeys only. */
  contact?: {
    defaultPriority: PriorityClass;
    pressureClass: PressureClass;
    localCap: { value: Config<number>; appliesTo: "non-mandatory" | "all" };
    cooldown: Config;
    competition: JourneyCompetition | "none";
  };
  channelStrategy?: ChannelStrategy;
  orchestration?: Orchestration;
  /** vNext: attributes the company must supply; events and the base
      capability set are derived from the graph, never authored. */
  implementation?: {
    attributes: { required: readonly string[]; optional?: readonly string[] };
    capabilities?: readonly Capability[];
  };
  /** vNext: the migration marker - a journey that declares measurement is
      held to every vNext rule as an error rather than a warning. */
  measurement?: Measurement;
  discovery?: { aliases: readonly string[]; useCases: readonly string[]; presets?: readonly Preset[] };
  /** Why this is not the neighbouring journey. Written where the two would
      otherwise look like variations of each other. */
  distinctFrom?: readonly { journey: string; because: string }[];
  entry: NodeId;
  nodes: readonly CanonicalNode[];
  /** Conditions that end this journey's ownership wherever it currently sits.
      A preemption names one specific event; `competition` names a standing
      contest resolved by policy. A journey can carry either, both or neither. */
  preemptedBy?: readonly { event: string; then: string }[];
  /** Set only where this journey competes with another for ownership of the
      same scope instance. See the GLB-01..GLB-10 competition rules. */
  competition?: JourneyCompetition;
  guardrails: readonly string[];
  reusableRule: string;
}

/** A rule that belongs to no single journey. Anything true across a category
    lives here instead of being copied into ten node graphs, where the tenth
    copy is the one that drifts. */
export interface OrchestrationRule {
  id: string;
  scope: CategoryId | "global";
  rule: string;
  because: string;
}
