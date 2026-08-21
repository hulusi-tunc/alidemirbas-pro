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

/* ------------------------------------------------------------------ shape */

export type Channel = "email" | "push" | "sms" | "inapp" | "whatsapp" | "sales";

export const CHANNELS: readonly Channel[] = ["email", "push", "sms", "inapp", "whatsapp", "sales"];

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

/** Journeys in the same group must never run simultaneously for one person -
    at the granularity `ExclusionScope` says. As someone moves down the funnel
    the lower-intent journey stops: browse yields to cart, cart yields to
    checkout. Churn prevention yields to win-back only after the observation
    buffer, never at the same time. */
export type ExclusionGroup =
  | "purchase-intent-ladder"
  | "retention-ladder"
  | "conversion-window"
  | "post-purchase-followup"
  | "soft-engagement";

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
export type ExclusionScope = "user" | "product" | "cart" | "order" | "route" | "subscription" | "course" | "account";

/** Marketing obeys the cap and quiet hours; operational does not. A delayed
    flight or a suspension date is not promotional pressure. */
export type CommunicationClass = "marketing" | "operational";

export type FrequencyClass =
  | "high-intent-triggered"
  | "lifecycle-activation"
  | "standard-promotional"
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

/** The key two candidates must share to actually be in competition. Same
    group and same scope is not enough by itself - at any scope narrower than
    "user" they also need the same entityId, which the caller supplies (see
    Candidate.entityId above); no entityId falls back to the group+scope pair
    alone, which is equivalent to "user" scoping until a real id is wired
    in - conservative, not silently permissive. */
export function exclusionKey(c: Candidate): string | null {
  if (!c.exclusionGroup) return null;
  const scope = c.exclusionScope ?? "user";
  if (scope === "user") return `${c.exclusionGroup}:user`;
  return `${c.exclusionGroup}:${scope}:${c.entityId ?? ""}`;
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
  byClass: Record<FrequencyClass, { maxPer24h: number; maxPer7d: number } | null>;
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
  suppressed: { slug: string; reason: "hard_suppression" | "lower_priority" | "excluded_by" ; by?: string }[];
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
    if (isEligible(c, user, now)) return true;
    suppressed.push({ slug: c.slug, reason: "hard_suppression" });
    return false;
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

/** Can we send this journey on this channel to this user right now? Every gate
    in the send path, in order, with the first failure named.

    `stepClass` is a per-step override of `journey.communicationClass` - most
    steps don't need one (the journey default is correct for them), but a
    journey can genuinely mix classes: ecom-recovery-01 opens with a real
    service-critical question and closes with an ordinary marketing nudge
    back to the catalogue, and ota-pretrip-01 is operational end to end
    except for its one upsell step. Passing the step's own class here, not
    the journey's, is what keeps that ordinary closing nudge inside the
    marketing cap and quiet hours instead of inheriting the service-critical
    exemption meant for the question that opened the journey. */
export function canSend(
  journey: Candidate,
  channel: Channel,
  user: UserState,
  ctx: SendContext,
  stepClass?: CommunicationClass,
): SendDecision {
  const effectiveClass = stepClass ?? journey.communicationClass;

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
    if (
      countSince(user.recentSends, day, sameClass) >= classCap.maxPer24h ||
      countSince(user.recentSends, week, sameClass) >= classCap.maxPer7d
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
): Channel | null {
  for (const c of journey.channels) {
    if (c === "sales") continue; // a human handoff, not a send
    if (canSend(journey, c, user, ctx).ok) return c;
  }
  return null;
}

/* ------------------------------------------------------------- 6. handoff */

/** Does this event hand the person to a different journey? */
export function handoffFor(journey: Candidate, event: string): string | null {
  return journey.handoffEvents[event] ?? null;
}
