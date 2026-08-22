/* Historical/reference only.
   Not canonical runtime truth.
   Numeric defaults and legacy policy examples must not be imported into
   canonical orchestration.

   This is the send-time orchestration module of the CRM Journey Archive that
   src/canonical replaced. It is kept because the HTML semantic-loss audit
   proved it carries real configuration evidence - a worked example of what a
   deployment's own policy layer looks like once the canonical rules are bound
   to it: quiet-hour windows per channel, per-class and per-channel frequency
   caps, a priority ladder, a service-recovery pause duration, an exclusion
   scope vocabulary.

   Every mechanism in here that belonged in the library has been promoted to a
   canonical global rule (GLB-27 delivery windows, GLB-28 cap classes, GLB-29
   send-path order, GLB-30 scope-aware exits, GLB-31 scoped safety gates) or to
   a journey guardrail. What remains below is the numbers, and the numbers were
   deliberately left out of canonical: 20:00, 22:00, the Sunday rule, the 24h
   priority override and the 30-day recovery pause are one deployment's policy,
   not doctrine.

   Nothing imports this file. It is excluded from the build in tsconfig.json.
   If you find yourself wanting to import it, the thing you want is either a
   GLB rule or a config value that belongs in your own policy layer.

   Two behaviours in here were considered and intentionally NOT carried over,
   because canonical is more precise rather than because they were forgotten:
   the blanket "marketing_consent_revoked / account_closed / user_ineligible
   terminate every journey" hard exits, and the blanket reading of the six
   hard-suppression conditions. Both are replaced by GLB-30 and GLB-31, which
   scope the consequence by purpose, entity and journey instead. */

/* Global journey orchestration.

   A journey can be internally sensible and still be the wrong thing to send.
   The same person can be eligible for browse abandonment, price drop, cart
   abandonment and winback in the same hour. Resolving that inside each
   journey means seventy copies of the same rule, drifting apart - which is
   what the archive did before: six journeys separately wrote "runs alongside
   a buffer so it never overlaps with win-back". This module is the one place
   that answers "which journey, on which channel, right now", and the journey
   data only declares what it is.

   Send path:
     user -> eligible journeys -> hard suppression -> priority resolution
          -> mutual exclusion -> frequency cap -> channel eligibility -> send

   The defaults here are lifted from rules the archive already stated in prose,
   not invented: SMS quiet hours 20:00-10:00 with no Sunday sends (stated in
   four journeys), push and WhatsApp queued rather than dropped during
   22:00-09:00, marketing paused 14-30 days after an unresolved complaint, and
   churn prevention held apart from win-back by an observation buffer. Where
   the archive prescribes no number - the per-window send caps - the value is
   left as configuration instead of being presented as a rule. */

/* ------------------------------------------------- reusable design rules

   Patterns that came out of building the archive and now apply to every
   journey in it, written down once here instead of being rediscovered per
   flow. The validator enforces the ones that are mechanically checkable.

   EVENT-OR-TIMEOUT. A wait that is really waiting for something - a demo to
   be booked, an order to be reordered, a conversation to be assigned - must
   name both arms: the event, and how long we wait before giving up. The
   archive writes these as "Wait N days, or until X - whichever comes first".
   A bare "wait until X" on an event that may never happen is a journey that
   silently strands people.

   SLA FALLBACK. The timeout arm needs somewhere to go. An assignment or
   resolution deadline that passes is a state change (escalate, reassign,
   close), not a reason to stop rendering.

   RESOLUTION BEFORE SURVEY. Satisfaction is asked after a resolved or closed
   event, never while the problem is open. Surveying an unresolved case
   measures our own latency and reads as indifference.

   ENGAGEMENT DIAGNOSIS, NOT REPETITION. A non-response is a diagnosis, and
   the fix differs by where it failed: no open is an envelope problem
   (subject, sender, timing), an open with no click is a message problem
   (offer framing, hierarchy, creative), a click with no conversion is a
   friction or offer problem. Resending the same thing treats all three as
   the same. Note the deliberate asymmetry with the next rule: open is weak
   enough that it may diagnose, but never decide.

   OPEN IS NOT INTENT. Mail privacy protection fires opens the recipient
   never made. Open may be a fallback signal for switching channel; a
   decision that matters - suppression, escalation, a paid offer - waits for
   a click, a visit, a purchase, an attendance, a resolution.

   SUNSET IS NOT UNSUBSCRIBE. Pausing someone for inactivity is our decision
   about our own sending; unsubscribing is theirs about their consent. They
   are stored separately, and returning activity makes someone eligible for a
   re-permission ask, never for automatic resubscription.

   SUCCESS STOPS THE SEQUENCE. The event a journey exists to cause ends it -
   see exitEvents and handoffEvents. A reorder prompt after the reorder is
   the most expensive kind of message.

   STATE TRANSITION CHANGES OWNERSHIP. Moving forward a lifecycle stage
   suppresses the journeys belonging to the stage just left, before priority
   is considered - see `lifecycleStage` and `supersededByStage`. Once an
   opportunity is won, "would you like a demo?" is not a mistimed message, it
   is the wrong owner still talking.

   AN INTERNAL TASK IS NOT A CUSTOMER OUTCOME. Where a decision needs a human,
   the journey creates the internal task, waits for completion or the SLA, and
   then reads the recorded outcome - it does not send a customer message in
   place of the human step. Task completion only says the workflow may move
   again; what it moves to depends on the outcome, and an expired SLA is an
   operational exception rather than implied customer intent. The `task`
   channel exists for exactly these steps and never reaches a customer.

   ENTITY, NOT PERSON. Where a journey is about a thing - an order, a product,
   a help topic - both its exclusion and its success event are scoped to that
   thing. An unrelated second order is not recovery of the cancelled first. */

/* --------------------------------------------------- engagement decay

   A second axis from LifecycleStage, not a replacement for it. LifecycleStage
   is where someone sits in the funnel and only moves forward; EngagementStage
   is how warm the relationship currently is, and it moves both ways. A
   `retention`-tier journey and this axis answer different questions - stage
   says which journeys are even in play, decay says how much room is left
   before the answer becomes "none of them, gently."

   Decay is a ladder, not a cliff: active -> cooling -> dormant, each step
   thinning the archive's own communication (see #21's sunset doctrine) before
   the last step - sunset - stops it. New meaningful evidence at any point
   invalidates the ladder position outright rather than nudging it back one
   step; see the restoration doctrine below.

   This module deliberately does not compute the stage - what counts as
   "meaningful activity" and how long a step takes to decay varies by product
   cadence (a daily SaaS tool and a twice-a-year purchase cannot share a
   window), so the recalculation is caller-defined the same way exclusionKey's
   entityId is caller-resolved. What's fixed here is the vocabulary and the
   one rule that makes it worth having a name: new evidence wins outright. */
export type EngagementStage = "active" | "cooling" | "dormant";

export const ENGAGEMENT_DECAY_ORDER: Record<EngagementStage, number> = {
  active: 0,
  cooling: 1,
  dormant: 2,
};

/** True stale-state invalidation, not a one-step recovery: real evidence
    (a purchase, meaningful product use, an explicit "keep me subscribed")
    resets straight to `active`, it does not walk the ladder back down one
    rung the way it walked up. A dormant user who buys once is not "cooling"
    for a probation period - they are active, and every pending decay-driven
    process (a queued sunset step, a scheduled dormant reminder) reading a
    stale stage has to be cancelled, not merely outranked. */
export type RestorativeEvidence = "purchase" | "product_activity" | "explicit_opt_in";
export const RESTORED_STAGE: EngagementStage = "active";

/* -------------------------------------------------- escalation ladder

   The timeout half of EVENT-OR-TIMEOUT (see the design notes above) needs
   somewhere to go, and "somewhere" is rarely one flat step. An unassigned
   conversation, a stalled sales task, an unresolved complaint all follow the
   same shape once the first deadline passes: tell the current owner, then
   their team, then force a reassignment - never straight to a customer-facing
   message, because an internal delay is an operations problem, not new
   information about what the customer wants.

   Numbers, not names, because callers already have their own owner/team/
   reassignment concepts; this just orders them. Like FrequencyPolicy's caps,
   the interval between levels is configuration the archive doesn't prescribe
   a number for, not doctrine. */
export type EscalationLevel = 1 | 2 | 3; // 1 owner reminder, 2 team/manager, 3 reassignment or critical queue

/** A timeout reaching its next escalation level is a real event to act on,
    not just a stop condition - see #54's doctrine. Escalating past level 3
    is a policy question (page someone? drop it?) the archive leaves to the
    caller, same as an unresolved frequency cap or an unset exclusionScope. */
export function nextEscalationLevel(current: EscalationLevel): EscalationLevel | null {
  return current < 3 ? ((current + 1) as EscalationLevel) : null;
}

/* ------------------------------------------------------------------ shape */

/** `sales` and `task` are not sends. They are work handed to a person or a
    team, and they are in this list because a journey step can legitimately be
    one - but nothing routes a customer message through them, and they are
    skipped when picking a channel to reach someone on. */
export type Channel = "email" | "push" | "sms" | "inapp" | "whatsapp" | "sales" | "task";

export const CHANNELS: readonly Channel[] = ["email", "push", "sms", "inapp", "whatsapp", "sales", "task"];

/** Channels that reach the customer. The rest are internal work. */
export const CUSTOMER_CHANNELS: readonly Channel[] = ["email", "push", "sms", "inapp", "whatsapp"];

/** Lower number wins when two journeys want the same person at the same time. */
export type PriorityTier =
  | "transactional"
  | "risk-service"
  | "checkout-abandonment"
  | "cart-intent"
  | "triggered-info"
  | "activation"
  | "retention"
  | "winback"
  | "expansion"
  | "browse-discovery"
  | "promotional";

export const PRIORITY_ORDER: Record<PriorityTier, number> = {
  transactional: 0,
  "risk-service": 1,
  "checkout-abandonment": 2,
  "cart-intent": 3,
  "triggered-info": 4,
  activation: 5,
  retention: 6,
  winback: 7,
  expansion: 8,
  "browse-discovery": 9,
  promotional: 10,
};

/** What business outcome the journey is chasing. Grouping only - it does not
    itself suppress anything; that is what `ExclusionGroup` is for. */
export type JourneyFamily =
  | "commerce-intent"
  | "post-purchase"
  | "lifecycle-start"
  | "revenue-growth"
  | "retention-risk"
  | "win-back"
  | "engagement";

/** Journeys sharing the same exclusion group AND the same resolved exclusion
    key cannot run together. Same group alone is NOT enough - the key is what
    `ExclusionScope` resolves to, so two product-scoped journeys about
    different products never conflict (see `exclusionKey` / `conflicts`, which
    is what `resolveJourney` actually calls). As someone moves down the funnel
    the lower-intent journey stops: browse yields to cart, cart yields to
    checkout. Churn prevention yields to win-back only after the observation
    buffer, never at the same time. */
export type ExclusionGroup =
  | "purchase-intent-ladder"
  | "retention-ladder"
  | "conversion-window"
  | "post-purchase-followup"
  | "soft-engagement"
  /** Everything chasing one unresolved problem: a help-centre follow-up, a
      content-feedback recovery. Two of these about the same topic are one
      conversation, not two. */
  | "support-resolution";

/** What unit of "thing" two journeys in the same ExclusionGroup actually
    compete over. `"user"` (the default when a journey declares none) is the
    whole-person conflict this module started with: cart abandonment and
    price drop would suppress each other outright. That is too coarse for
    journeys whose subject is a specific product, cart, order or route -
    cart abandonment for a pair of shoes has nothing to do with a genuine
    price drop on an unrelated wishlist item, and treating them as the same
    competition costs a real message. A non-"user" scope says the conflict
    only applies to the SAME entity: two `"product"`-scoped journeys only
    exclude each other when `exclusionKey` resolves to the same product id.

    This is deliberately assigned per journey, not blanket-applied to every
    grouped journey - most of retention-ladder, soft-engagement and
    conversion-window are correctly person-wide (a churn-prevention flow
    should hold off ALL other retention-tier messaging for that person, not
    just messaging about one subscription), so they are left at the "user"
    default on purpose. See journeys.ts for which journeys declare which
    scope and why. */
export type ExclusionScope =
  | "user" | "product" | "cart" | "order" | "route"
  | "subscription" | "course" | "account"
  /** A help-centre topic or article - two follow-ups about the same problem
      compete, two about unrelated problems do not. */
  | "topic";

/** Where in the relationship a journey belongs. A person occupies one stage
    at a time, and moving forward changes who owns the conversation: once an
    opportunity is won, "would you like a demo?" is not a slightly mistimed
    message, it is the wrong owner still talking. Journeys that leave this
    unset are stage-agnostic - a payment failure or a help-centre follow-up is
    right at any stage - and are never suppressed by a transition. */
export type LifecycleStage =
  | "prospect"
  | "trial"
  | "onboarding"
  | "adoption"
  | "expansion"
  | "advocacy";

/** Order is the whole point: anything earlier than where the person actually
    is has lost ownership. */
export const STAGE_ORDER: Record<LifecycleStage, number> = {
  prospect: 0,
  trial: 1,
  onboarding: 2,
  adoption: 3,
  expansion: 4,
  advocacy: 5,
};

/** Marketing obeys the cap and quiet hours; operational does not. A delayed
    flight or a suspension date is not promotional pressure. */
export type CommunicationClass = "marketing" | "operational";

export type FrequencyClass =
  | "high-intent-triggered"
  | "lifecycle-activation"
  | "standard-promotional"
  /** Unprompted service follow-ups - "did that help?", "still stuck?". Not
      promotional, so it does not belong on the promotional cadence, but not
      exempt either: asking twice is worse than not asking, which is why this
      is the one class with a monthly ceiling. */
  | "support-follow-up"
  | "service-critical";

/** The orchestration facts a journey declares about itself. `Journey` in
    journeys.ts is its descriptive fields intersected with this. */
export type JourneyOrchestration = {
  priority: PriorityTier;
  family: JourneyFamily;
  /** null when the journey genuinely competes with nothing. */
  exclusionGroup: ExclusionGroup | null;
  /** Only meaningful when exclusionGroup is set. null/omitted behaves as
      "user" - see ExclusionScope above. */
  exclusionScope?: ExclusionScope | null;
  /** Optional. Set only where the journey genuinely belongs to one stage of
      the relationship; see LifecycleStage and `supersededByStage`. */
  lifecycleStage?: LifecycleStage | null;
  communicationClass: CommunicationClass;
  frequencyClass: FrequencyClass;
  /** Events that make continuing this journey unnecessary, wrong or annoying,
      and that do NOT also start a different journey. exitEvents[0] is the
      primary success exit. The global hard exits are not repeated here - see
      GLOBAL_HARD_EXITS. A handoff already implies an exit (see `exitsOn`
      below), so an event never appears in both this array and
      `handoffEvents` - that would be two sources of truth for one fact. */
  exitEvents: readonly string[];
  /** event -> slug of the journey that becomes eligible instead. Ending THIS
      journey is implicit in a handoff; do not also list the event in
      `exitEvents`. */
  handoffEvents: Readonly<Record<string, string>>;
  /** True when messaging in this journey can touch sensitive personal data
      (health status, a medical program, a diagnosis-adjacent detail) closely
      enough that using it in personalization is a policy call, not an
      engineering one - who may see what, on which surface, under which
      consent. The journey still runs; this just means its copy has to stay
      generic ("a new goal is underway") rather than specific ("30 days into
      your recovery program") until that policy exists. Not a suppression
      flag - orchestration does not read this field. */
  requiresSensitiveDataPolicy?: boolean;
};

/** The minimum an orchestration decision needs to know about a journey.
    `triggeredAt` and `active` are optional - when omitted, ties break on
    array order alone, which is still deterministic but caller-defined.
    `entityId` is the runtime value `exclusionScope` names - the product id,
    cart id, route key, etc. for THIS eligibility check. The static archive
    carries none of these; a real caller resolves one per candidate when it
    builds this list. */
type Candidate = JourneyOrchestration & {
  slug: string;
  channels: readonly Channel[];
  triggeredAt?: number;
  active?: boolean;
  entityId?: string;
};

/** The key two candidates must share to actually be in competition: the
    exclusion group plus the subject they are both about.

    The scope name is deliberately NOT in the key. Scope says how to *resolve*
    the subject, it is not part of that subject's identity - keying on it
    would mean a cart-scoped journey and a product-scoped journey could never
    conflict even when the caller resolves both to the same item, which is
    structurally worse than the person-wide behaviour it replaced. Making the
    conflict expressible is the caller's job: two journeys that should
    compete over the same thing must resolve `entityId` to the same value.

    No entityId falls back to the person-wide key. That is the conservative
    direction - until a real id is wired in, everything in the group keeps
    excluding everything else, exactly as before scopes existed - and it is
    why this static archive, which carries no entity ids, behaves identically
    to the pre-scope version rather than silently letting more sends through. */
export function exclusionKey(c: Candidate): string | null {
  if (!c.exclusionGroup) return null;
  const scope = c.exclusionScope ?? "user";
  if (scope === "user" || !c.entityId) return `${c.exclusionGroup}:user`;
  return `${c.exclusionGroup}:${c.entityId}`;
}

/** Do these two genuinely compete for the same send? Same group, same scope,
    and - once scope narrows past "user" - the same entity. A `"product"`
    journey about shoe A and one about jacket B never conflict even though
    both sit in purchase-intent-ladder. */
export function conflicts(a: Candidate, b: Candidate): boolean {
  const ka = exclusionKey(a);
  const kb = exclusionKey(b);
  return ka != null && ka === kb;
}

/* ------------------------------------------------- global hard suppression */

/** Checked before anything else, for every journey, every time. A journey
    never restates these; if it did, the seventieth copy would be the one that
    was forgotten. */
export const GLOBAL_HARD_EXITS = [
  "marketing_consent_revoked",
  "account_closed",
  "user_ineligible",
] as const;

export type HardSuppression =
  | "no_marketing_consent"
  | "account_closed"
  | "legally_ineligible"
  | "fraud_or_security_hold"
  | "open_critical_issue"
  | "service_recovery_pause";

/* ----------------------------------------------------------------- policy */

export type QuietHours = {
  /** Local hour the window opens and closes; 22 to 9 means 22:00-09:00. */
  from: number;
  to: number;
  /** Queue until the window lifts rather than dropping the send. */
  queue: boolean;
  /** 0 = Sunday, matching Date#getDay. */
  blockedDays: readonly number[];
};

/** Grounded in the archive's own prose. Email carries no quiet hours in any
    journey, so it gets none here either. `sales` is a human handoff, not a
    send, so it is out of scope. */
export const DEFAULT_QUIET_HOURS: Partial<Record<Channel, QuietHours>> = {
  sms: { from: 20, to: 10, queue: false, blockedDays: [0] },
  push: { from: 22, to: 9, queue: true, blockedDays: [] },
  whatsapp: { from: 22, to: 9, queue: true, blockedDays: [] },
  inapp: { from: 22, to: 9, queue: true, blockedDays: [] },
};

export type FrequencyPolicy = {
  /** Caps per frequency class. The archive prescribes no numbers, so these are
      configuration, not doctrine - tune per brand and per market. */
  byClass: Record<FrequencyClass, { maxPer24h: number; maxPer7d: number; maxPer30d?: number } | null>;
  /** Caps that apply per channel regardless of which journey is sending. */
  byChannel: Partial<Record<Channel, { maxPer24h: number; maxPer7d: number }>>;
  /** How long marketing stays paused after an unresolved service complaint.
      Two journeys state 14-30 days; the conservative end is the default. */
  serviceRecoveryPauseDays: number;
  /** A higher-priority journey may take over from a lower one inside this
      window rather than waiting for the cap to clear - the point of priority
      is that cart abandonment beats a browse reminder sent an hour ago. */
  priorityOverrideWithinHours: number;
};

export const DEFAULT_FREQUENCY_POLICY: FrequencyPolicy = {
  byClass: {
    "high-intent-triggered": { maxPer24h: 2, maxPer7d: 5 },
    // Procedural setup nudges (activate a card, finish onboarding), not a
    // sales cadence - a slightly looser cap than standard-promotional, since
    // missing a real setup step costs more than the extra send does.
    "lifecycle-activation": { maxPer24h: 2, maxPer7d: 4 },
    "standard-promotional": { maxPer24h: 1, maxPer7d: 3 },
    // One unprompted "can we help?" a month, per person. The 30-day ceiling
    // is the point of the class: the 24h/7d numbers alone would still allow
    // a steady drip of them.
    "support-follow-up": { maxPer24h: 1, maxPer7d: 1, maxPer30d: 1 },
    "service-critical": null, // excluded from the marketing cap by design
  },
  byChannel: {
    sms: { maxPer24h: 1, maxPer7d: 2 },
    whatsapp: { maxPer24h: 1, maxPer7d: 2 },
  },
  serviceRecoveryPauseDays: 30,
  priorityOverrideWithinHours: 24,
};

/* ------------------------------------------------------------- user state */

export type SendRecord = {
  channel: Channel;
  frequencyClass: FrequencyClass;
  /** Epoch milliseconds. */
  at: number;
};

export type UserState = {
  marketingConsent: boolean;
  accountClosed: boolean;
  legallyIneligible: boolean;
  fraudOrSecurityHold: boolean;
  openCriticalIssue: boolean;
  /** Epoch ms of an unresolved complaint that paused marketing, if any. */
  serviceRecoveryStartedAt?: number;
  /** Where this person actually is in the relationship. Undefined means
      unknown, which suppresses nothing - see `supersededByStage`. */
  lifecycleStage?: LifecycleStage;
  channelConsent: Partial<Record<Channel, boolean>>;
  reachableOn: Partial<Record<Channel, boolean>>;
  recentSends: readonly SendRecord[];
};

export type SendContext = {
  /** Epoch ms. */
  now: number;
  /** The user's local hour, 0-23 - not the server's. */
  localHour: number;
  /** 0 = Sunday. */
  localDay: number;
  policy?: FrequencyPolicy;
  quietHours?: Partial<Record<Channel, QuietHours>>;
};

/* --------------------------------------------------------------- 1. entry */

/** Can this user be in any marketing journey at all? Operational journeys
    answer to consent for their channel but not to the marketing gate: a
    suspension notice is not a promotion. */
export function hardSuppressions(user: UserState, journey?: Candidate, now = Date.now()): HardSuppression[] {
  const found: HardSuppression[] = [];
  const marketing = !journey || journey.communicationClass === "marketing";
  if (marketing && !user.marketingConsent) found.push("no_marketing_consent");
  if (user.accountClosed) found.push("account_closed");
  if (user.legallyIneligible) found.push("legally_ineligible");
  if (user.fraudOrSecurityHold) found.push("fraud_or_security_hold");
  if (marketing && user.openCriticalIssue) found.push("open_critical_issue");
  if (marketing && user.serviceRecoveryStartedAt != null) {
    const days = (now - user.serviceRecoveryStartedAt) / 86_400_000;
    if (days < DEFAULT_FREQUENCY_POLICY.serviceRecoveryPauseDays) found.push("service_recovery_pause");
  }
  return found;
}

export function isEligible(journey: Candidate, user: UserState, now = Date.now()): boolean {
  return hardSuppressions(user, journey, now).length === 0;
}

/** Has this journey lost ownership? A journey pinned to a stage the person
    has already moved past is not merely mistimed - it is the previous owner
    still talking. Journeys with no stage are stage-agnostic and never fail
    this. `currentStage` undefined means we do not know where they are, and an
    unknown stage suppresses nothing. */
export function supersededByStage(journey: Candidate, currentStage?: LifecycleStage): boolean {
  if (!journey.lifecycleStage || !currentStage) return false;
  return STAGE_ORDER[journey.lifecycleStage] < STAGE_ORDER[currentStage];
}

/* ---------------------------------------------------------------- 2. exit */

/** Does this event end the journey? Global hard exits end every journey; a
    handoff event ends this one on its way to starting the target, so it
    counts here too even though it is not repeated in `exitEvents`. */
export function exitsOn(journey: Candidate, event: string): boolean {
  return (
    (GLOBAL_HARD_EXITS as readonly string[]).includes(event) ||
    journey.exitEvents.includes(event) ||
    event in journey.handoffEvents
  );
}

/* ------------------------------------------------------------- 3+4. arbitrate */

export type Resolution = {
  winner: Candidate | null;
  suppressed: { slug: string; reason: "hard_suppression" | "stage_superseded" | "lower_priority" | "excluded_by"; by?: string }[];
};

/** Two candidates at the same priority tier - who wins. An exact triggered
    event outranks a standing lifecycle state first (the whole reason
    high-intent-triggered exists as its own frequency class is that it is a
    sharper signal than "this account has been eligible for a while"); then
    recency of the triggering event, so a fresher signal can interrupt a
    stale one; then whichever journey the person is already partway through,
    since restarting one they are mid-flow in is worse than not sending the
    other; below that there is no more real signal to break the tie on, so
    array order decides - `Array#sort` is stable, so this is deterministic,
    just caller-defined rather than policy-defined. */
function compareTies(a: Candidate, b: Candidate): number {
  const aTriggered = a.frequencyClass === "high-intent-triggered";
  const bTriggered = b.frequencyClass === "high-intent-triggered";
  if (aTriggered !== bTriggered) return aTriggered ? -1 : 1;
  if (a.triggeredAt != null && b.triggeredAt != null && a.triggeredAt !== b.triggeredAt) {
    return b.triggeredAt - a.triggeredAt;
  }
  if (a.active !== b.active) return a.active ? -1 : 1;
  return 0;
}

/** Which single journey gets this person right now. Hard suppression first,
    then priority (ties broken by `compareTies`), then mutual exclusion
    inside the winner's group and scope (see `conflicts`). */
export function resolveJourney(
  candidates: readonly Candidate[],
  user: UserState,
  now = Date.now(),
): Resolution {
  const suppressed: Resolution["suppressed"] = [];
  const live = candidates.filter((c) => {
    if (!isEligible(c, user, now)) {
      suppressed.push({ slug: c.slug, reason: "hard_suppression" });
      return false;
    }
    // A stage transition changes ownership before priority is even considered:
    // the previous stage's journey does not get to compete, however urgent it
    // thinks it is.
    if (supersededByStage(c, user.lifecycleStage)) {
      suppressed.push({ slug: c.slug, reason: "stage_superseded" });
      return false;
    }
    return true;
  });
  if (live.length === 0) return { winner: null, suppressed };

  const ranked = [...live].sort((a, b) => {
    const byPriority = PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority];
    return byPriority !== 0 ? byPriority : compareTies(a, b);
  });
  const winner = ranked[0];

  for (const c of ranked.slice(1)) {
    if (conflicts(c, winner)) {
      suppressed.push({ slug: c.slug, reason: "excluded_by", by: winner.slug });
    } else {
      suppressed.push({ slug: c.slug, reason: "lower_priority", by: winner.slug });
    }
  }
  return { winner, suppressed };
}

/* ----------------------------------------------------------------- 5. send */

export type SendDecision = { ok: true } | { ok: false; reason: SendBlockReason; retryAfterQuietHours?: boolean };

export type SendBlockReason =
  | HardSuppression
  | "channel_not_supported"
  | "no_channel_consent"
  | "not_reachable"
  | "quiet_hours"
  | "frequency_cap_class"
  | "frequency_cap_channel";

function inQuietHours(q: QuietHours, hour: number, day: number): boolean {
  if (q.blockedDays.includes(day)) return true;
  return q.from <= q.to ? hour >= q.from && hour < q.to : hour >= q.from || hour < q.to;
}

function countSince(sends: readonly SendRecord[], since: number, match: (s: SendRecord) => boolean): number {
  return sends.filter((s) => s.at >= since && match(s)).length;
}

/** The class that actually governs a send: the step's own override when it
    declares one, otherwise the journey default. This is the whole resolution
    order, and it is the only one - a step inherits from nowhere else. Every
    gate that varies by class (quiet hours, the marketing frequency cap, the
    service-critical exemption from both) reads what this returns rather than
    `journey.communicationClass` directly, which is what stops a journey's
    exemption leaking onto a step that shouldn't have it. */
export function effectiveCommunicationClass(
  journey: { communicationClass: CommunicationClass },
  step?: { commClass?: CommunicationClass },
): CommunicationClass {
  return step?.commClass ?? journey.communicationClass;
}

/** Can we send this journey on this channel to this user right now? Every gate
    in the send path, in order, with the first failure named.

    Pass the actual step being sent, not just the journey: a journey can
    genuinely mix classes. ecom-recovery-01 opens with a real service-critical
    question and closes with an ordinary marketing nudge back to the
    catalogue; ota-pretrip-01 is operational end to end except its one upsell
    step. Resolving the class per step is what keeps that closing nudge inside
    the marketing cap and quiet hours instead of inheriting the
    service-critical exemption meant for the message that opened the journey. */
export function canSend(
  journey: Candidate,
  channel: Channel,
  user: UserState,
  ctx: SendContext,
  step?: { commClass?: CommunicationClass },
): SendDecision {
  const effectiveClass = effectiveCommunicationClass(journey, step);

  const hard = hardSuppressions(user, { ...journey, communicationClass: effectiveClass }, ctx.now);
  if (hard.length > 0) return { ok: false, reason: hard[0] };

  if (!journey.channels.includes(channel)) return { ok: false, reason: "channel_not_supported" };
  if (!user.channelConsent[channel]) return { ok: false, reason: "no_channel_consent" };
  if (!user.reachableOn[channel]) return { ok: false, reason: "not_reachable" };

  const quiet = (ctx.quietHours ?? DEFAULT_QUIET_HOURS)[channel];
  if (quiet && effectiveClass === "marketing" && inQuietHours(quiet, ctx.localHour, ctx.localDay)) {
    return { ok: false, reason: "quiet_hours", retryAfterQuietHours: quiet.queue };
  }

  const policy = ctx.policy ?? DEFAULT_FREQUENCY_POLICY;
  const day = ctx.now - 86_400_000;
  const week = ctx.now - 7 * 86_400_000;

  const classCap = policy.byClass[journey.frequencyClass];
  if (classCap) {
    const sameClass = (s: SendRecord) => s.frequencyClass === journey.frequencyClass;
    const month = ctx.now - 30 * 86_400_000;
    if (
      countSince(user.recentSends, day, sameClass) >= classCap.maxPer24h ||
      countSince(user.recentSends, week, sameClass) >= classCap.maxPer7d ||
      (classCap.maxPer30d != null && countSince(user.recentSends, month, sameClass) >= classCap.maxPer30d)
    ) {
      return { ok: false, reason: "frequency_cap_class" };
    }
  }

  const channelCap = policy.byChannel[channel];
  if (channelCap && effectiveClass === "marketing") {
    const sameChannel = (s: SendRecord) => s.channel === channel;
    if (
      countSince(user.recentSends, day, sameChannel) >= channelCap.maxPer24h ||
      countSince(user.recentSends, week, sameChannel) >= channelCap.maxPer7d
    ) {
      return { ok: false, reason: "frequency_cap_channel" };
    }
  }

  return { ok: true };
}

/** The first channel this journey supports that the user can actually be
    reached on right now. Order is the journey's own declared order, so a
    journey states its own preference instead of inheriting a global one. */
export function firstSendableChannel(
  journey: Candidate,
  user: UserState,
  ctx: SendContext,
  step?: { commClass?: CommunicationClass },
): Channel | null {
  for (const c of journey.channels) {
    if (!CUSTOMER_CHANNELS.includes(c)) continue; // internal work, not a send
    if (canSend(journey, c, user, ctx, step).ok) return c;
  }
  return null;
}

/* ------------------------------------------------------------- 6. handoff */

/** Does this event hand the person to a different journey? */
export function handoffFor(journey: Candidate, event: string): string | null {
  return journey.handoffEvents[event] ?? null;
}
