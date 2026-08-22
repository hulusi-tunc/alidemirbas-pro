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
  next: NodeId;
}

/** A real fork. Two branches minimum: a condition with one arm is a filter
    wearing a decision's clothes, and it hides what happens to everyone who
    fails it. */
export interface ConditionNode {
  id: NodeId;
  kind: "condition";
  asks: string;
  branches: readonly { label: string; when: string; to: NodeId }[];
}

/** An asynchronous pause with both arms named. A wait with no timeout strands
    people on an event that may never arrive; a timeout with nowhere to go is
    an exit pretending to be patience. */
export interface WaitNode {
  id: NodeId;
  kind: "wait";
  until: readonly string[];
  onEvent: NodeId;
  timeout: { after: string; reason: string };
  onTimeout: NodeId;
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
}

export type CanonicalNode =
  | TriggerNode | ActionNode | ConditionNode
  | WaitNode | OutcomeNode | ExitNode | HandoffNode;

export interface CanonicalJourney {
  id: string;
  slug: string;
  category: CategoryId;
  name: string;
  purpose: string;
  /** What the journey is about, which is what its exits and suppressions are
      scoped to. A journey about one order does not close because a different
      order was placed. */
  entity: { scope: string; note: string };
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
