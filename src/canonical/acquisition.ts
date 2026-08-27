import type { CanonicalJourney, OrchestrationRule } from "./types";

/* CATEGORY 1 - ACQUISITION, INTENT & QUALIFICATION

   Ten state machines for people who have not fully entered a product or
   customer lifecycle yet. What they have in common is that none of them can
   assume the four things acquisition automation usually conflates: that a
   visitor has an identity, that an identity carries permission, that interest
   is qualification, and that qualification is permanent.

   Each of those is a separate state here, and most of the journeys below
   exist because the transition between two of them is genuinely hard:
   anonymous to known (ACQ-01), interest to destination (ACQ-02), lower intent
   to higher (ACQ-03), machine decision to human decision (ACQ-04),
   qualification in one direction to qualification in the other (ACQ-05).

   None of these send a campaign. Several send nothing at all - ACQ-03 and
   ACQ-08 exist to stop messages rather than start them, which is exactly the
   kind of journey a campaign-shaped library cannot hold. */

export const ACQUISITION_RULES: readonly OrchestrationRule[] = [
  {
    id: "ACQ-R1",
    scope: "acquisition",
    rule: "Anonymous identity, known identity, permission, qualification and conversion are five separate states, and reaching one never implies another.",
    because:
      "Every collapse between two of them produces a specific, familiar failure: merging strangers on a shared device, mailing someone who only filled in a support form, treating a lead as a pipeline number, treating a click as revenue.",
  },
  {
    id: "ACQ-R2",
    scope: "acquisition",
    rule: "An intent signal carries both a strength and a freshness, and neither alone qualifies it. A single weak signal cannot escalate anyone, and a strong signal stops counting once it is stale.",
    because:
      "Intent that is recorded without decay turns one pricing visit two years ago into a permanent high-intent flag, and everything downstream inherits that lie.",
  },
  {
    id: "ACQ-R3",
    scope: "acquisition",
    rule: "A higher-priority lifecycle state suppresses lower-priority acquisition messaging, and the suppression has to reach sends that are already queued.",
    because:
      "A handoff that only stops future scheduling still delivers the superseded journey's next message, which is the one moment the person notices the seam.",
  },
  {
    id: "ACQ-R4",
    scope: "acquisition",
    rule: "A commercial destination is reached when the system of record says so. Engagement with a message about the destination is not the destination.",
    because:
      "Clicks and landing-page visits are the cheapest signals to instrument and the easiest to mistake for outcomes, so the substitution happens by default unless it is forbidden by default.",
  },
  {
    id: "ACQ-R5",
    scope: "acquisition",
    rule: "Entity scope is preserved: an outcome on one order, application or opportunity resolves only the journeys about that entity.",
    because:
      "Person-scoped success closes journeys that were never about the thing that happened - a second order is not recovery of a cancelled first one.",
  },
  {
    id: "ACQ-R6",
    scope: "acquisition",
    rule: "Qualification and disqualification reasons are appended, never overwritten. The current state is readable together with how it got there.",
    because:
      "Routing in this category depends on why a state changed, so a state without its reason history cannot be routed on at all - and 'not now' silently becomes 'never'.",
  },
  {
    id: "ACQ-R7",
    scope: "acquisition",
    rule: "Acquisition and nurture journeys are bounded. The window is fixed when someone enters it, and engagement inside the window does not extend it.",
    because:
      "A clock that any interaction resets makes the most engaged unconverted people the most heavily messaged, which is where perpetual nurture actually comes from.",
  },
  {
    id: "ACQ-R8",
    scope: "acquisition",
    rule: "Existing customer state outranks acquisition state. Where the two disagree about who someone is, the customer record wins.",
    because:
      "Acquisition data is fragmentary by nature; continuing to pursue someone who has already bought is the failure that reads as the company not knowing its own customers.",
  },
];

export const ACQUISITION_JOURNEYS: readonly CanonicalJourney[] = [
  /* ------------------------------------------------------------ ACQ-01 */
  {
    id: "ACQ-01",
    slug: "anonymous-intent-to-qualified-entry",
    category: "acquisition",
    goal: "eligibility-qualification",
    name: "Anonymous intent → known identity → qualified entry",
    purpose:
      "Carry a meaningful but anonymous intent signal through identity resolution without inventing an identity, and decide lifecycle entry as a question separate from having resolved one.",
    entity: {
      scope: "anonymous_profile, reconciled onto person or account",
      note: "The subject changes identity mid-journey, which is the whole problem: the pre-identity history has to survive the transition rather than being replaced by the known profile.",
    },
    distinctFrom: [
      {
        journey: "ACQ-02",
        because:
          "ACQ-02 starts from something the person declared. Here nothing has been declared, so identity and permission both have to be established rather than read.",
      },
    ],
    entry: "t.threshold",
    nodes: [
      {
        id: "t.threshold",
        kind: "trigger",
        event: "anonymous_intent_threshold_reached",
        evidence: {
          requires: [
            "repeated visits to high-intent pages",
            "interaction with pricing",
            "product or configuration exploration",
            "a meaningful return after a first session",
          ],
          insufficientAlone: [
            "a single page view",
            "one session with no return",
            "an ad click that landed and bounced",
          ],
          source: "behavioral",
        },
        next: "c.identity",
      },
      {
        id: "c.identity",
        kind: "condition",
        asks: "Is a deterministic known identity available for this anonymous profile?",
        branches: [
          {
            label: "Deterministic identity",
            when: "the visitor authenticated, submitted a first-party identifier, or followed a signed link that maps to exactly one known profile",
            to: "a.reconcile",
          },
          {
            label: "Probabilistic only",
            when: "only device, network or similarity signals are available, which can describe more than one person",
            to: "w.identity",
          },
        ],
      },
      {
        id: "w.identity",
        kind: "wait",
        until: ["deterministic_identity_resolved"],
        onEvent: "a.reconcile",
        timeout: {
          after: "the freshness window of the signals that opened the profile",
          reason:
            "anonymous intent goes stale like any other evidence, and an unresolved profile is not held open indefinitely waiting for a name",
        },
        onTimeout: "x.stale",
        windowExtendsOnEngagement: false,
      },
      {
        id: "x.stale",
        kind: "exit",
        state: "anonymous, intent stale, no identity claimed",
        terminal: false,
        reEntry:
          "a fresh crossing of the intent threshold opens a new instance; nothing was merged and no permission was implied by waiting",
      },
      {
        id: "a.reconcile",
        kind: "action",
        does: "Reconcile the anonymous behavioural history onto the known profile, keeping the pre-identity record readable alongside it rather than replacing it, and record which method resolved the identity",
        writes: [{ field: "identity_resolution_history", mode: "append" }],
        next: "c.eligible",
      },
      {
        id: "c.eligible",
        kind: "condition",
        asks: "Is the now-known profile eligible to enter a lifecycle?",
        branches: [
          {
            label: "Eligible",
            when: "the candidate lifecycle's eligibility rules pass on the reconciled profile and a lawful basis exists for what that lifecycle would do",
            to: "h.qualification",
          },
          {
            label: "Not eligible",
            when: "eligibility fails, or no lawful basis exists to communicate - including the ordinary case where identity was resolved but permission never given",
            to: "x.known-only",
          },
        ],
      },
      {
        id: "h.qualification",
        kind: "handoff",
        to: "ACQ-05",
        on: "a known, eligible profile entering qualification for the first time",
        carries: [
          "the reconciled intent history, including the pre-identity portion",
          "which signals crossed the threshold and when",
          "the identity resolution method, so a later dispute can be traced",
        ],
      },
      {
        id: "x.known-only",
        kind: "exit",
        state: "known profile, no lifecycle entered",
        terminal: false,
        reEntry:
          "ACQ-06 re-evaluates eligibility when the underlying data changes; becoming known does not start nurture by itself",
      },
    ],
    guardrails: [
      "Anonymous behaviour is not consent. Resolving an identity does not create permission to contact it.",
      "Identities are merged on deterministic signals only. A probabilistic match is a guess, and a wrong merge writes one person's history onto another.",
      "Becoming known is not the same as becoming eligible, and neither is a reason to start messaging.",
    ],
    reusableRule: "Identity resolution and lifecycle eligibility are separate decisions.",
  },

  /* ------------------------------------------------------------ ACQ-02 */
  {
    id: "ACQ-02",
    slug: "captured-interest-to-destination",
    category: "acquisition",
    goal: "routing-assignment",
    name: "Captured interest → qualification → appropriate destination",
    purpose:
      "Route first-party interest to the destination its own content justifies, instead of treating every capture as either a sales lead or a subscriber.",
    entity: {
      scope: "lead, resolved onto person or account",
      note: "Scoped to the specific capture and what it asked for; a second, different request from the same person is a second instance with its own destination.",
    },
    distinctFrom: [
      {
        journey: "ACQ-09",
        because:
          "This journey decides where interest goes. ACQ-09 is one of the places it can go, and owns the bounded window that follows - keeping both here would put the same window in two state machines.",
      },
    ],
    entry: "t.captured",
    nodes: [
      {
        id: "t.captured",
        kind: "trigger",
        event: "first_party_interest_captured",
        evidence: {
          requires: [
            "a first-party submission: a form, a content request, a contact request, or an equivalent deliberate act",
          ],
          insufficientAlone: ["an ad click", "a page visit", "an email open"],
          source: "declared",
        },
        next: "a.record",
      },
      {
        id: "a.record",
        kind: "action",
        does: "Record the capture source, the context the person declared, and the intent it evidences - each stored separately from any permission, which is recorded as its own fact and only where it was actually given",
        writes: [{ field: "capture_record", mode: "append" }],
        next: "c.ready",
      },
      {
        id: "c.ready",
        kind: "condition",
        asks: "Does the captured interest already name a destination this person is ready for?",
        branches: [
          {
            label: "Destination named and enterable",
            when: "the declared request maps to a destination that can be entered now - a trial, a sales conversation, a quote, a booking, an application, an onboarding",
            to: "h.destination",
          },
          {
            label: "Interest without a destination",
            when: "the interest is genuine but names no destination, or names one whose readiness is unproven",
            to: "c.disqualifier",
          },
        ],
      },
      {
        id: "h.destination",
        kind: "handoff",
        to: "external:destination-lifecycle",
        on: "a declared request that maps to an enterable destination",
        carries: [
          "the capture source and the declared context",
          "the specific destination requested, so the receiving lifecycle does not re-ask",
          "the permission state exactly as captured, including its absence",
        ],
      },
      {
        id: "c.disqualifier",
        kind: "condition",
        asks: "Does a disqualifying condition apply to this lead?",
        branches: [
          {
            label: "Disqualified",
            when: "an authoritative rule rules it out - outside the served market, a competitor, an invalid contact, or already an active customer for this scope",
            to: "h.reason",
          },
          {
            label: "No disqualifier",
            when: "the lead is legitimate, simply not ready for any destination yet",
            to: "h.education",
          },
        ],
      },
      {
        id: "h.reason",
        kind: "handoff",
        to: "ACQ-05",
        on: "a disqualifying condition found at capture",
        carries: [
          "the disqualification reason, which decides whether this is terminal or temporary",
          "the capture record, so a later re-entry can tell what was known at the time",
        ],
      },
      {
        id: "h.education",
        kind: "handoff",
        to: "ACQ-09",
        on: "legitimate interest with no destination it is ready for",
        carries: [
          "the reason the person entered, which is what the education has to answer",
          "the declared context",
          "the permission state as captured - ACQ-09 checks it before anything is sent",
        ],
      },
    ],
    guardrails: [
      "A captured lead is not a sales-qualified lead. Capture records interest; qualification is a separate decision with its own state.",
      "A submitted form is not marketing consent unless permission was explicitly given in it. The submission and the permission are two facts, and only one of them may have happened.",
      "Not every lead needs a sales handoff. A destination is chosen from what the person asked for, not from what the pipeline wants.",
    ],
    reusableRule:
      "Captured interest should be routed according to demonstrated or declared readiness rather than treated as conversion.",
  },

  /* ------------------------------------------------------------ ACQ-03 */
  {
    id: "ACQ-03",
    slug: "intent-escalation-handoff",
    category: "acquisition",
    goal: "progression-milestone",
    name: "Intent escalation → higher-intent journey handoff",
    purpose:
      "Move ownership when someone in a low-intent lifecycle does something that no longer fits it, and make sure the journey being left behind actually goes quiet.",
    entity: {
      scope: "person plus the entity the new intent is about",
      note: "Escalation is about a subject. Configuring one product does not escalate the journeys about a different one.",
    },
    distinctFrom: [
      {
        journey: "ACQ-08",
        because:
          "ACQ-08 fires when a destination has been reached and acquisition is finished. This fires while everything is still in progress and only the ranking has changed.",
      },
    ],
    entry: "t.crossed",
    nodes: [
      {
        id: "t.crossed",
        kind: "trigger",
        event: "intent_threshold_crossed",
        evidence: {
          requires: [
            "an act materially stronger than the one that placed the person in their current journey: pricing after content, configuration after browsing, starting a quote after general interest",
          ],
          insufficientAlone: ["one email click", "one page view", "one return session"],
          source: "behavioral",
        },
        next: "c.strength",
      },
      {
        id: "c.strength",
        kind: "condition",
        asks: "Is the signal strong enough to be a real escalation rather than noise?",
        branches: [
          {
            label: "Real escalation",
            when: "a strong-evidence act, or a repeated moderate one, and fresh enough to describe the present",
            to: "a.resolve",
          },
          {
            label: "Noise",
            when: "a single weak signal, or a strong one that has already gone stale",
            to: "x.unchanged",
          },
        ],
      },
      {
        id: "x.unchanged",
        kind: "exit",
        state: "no ownership change",
        terminal: false,
        reEntry: "a later, stronger or repeated signal opens a new instance",
      },
      {
        id: "a.resolve",
        kind: "action",
        does: "Resolve which journey currently owns this person for this entity, and which lifecycle the new intent belongs to",
        next: "c.higher",
      },
      {
        id: "c.higher",
        kind: "condition",
        asks: "Does a higher-priority journey exist for the new intent?",
        branches: [
          {
            label: "Higher-priority journey exists",
            when: "the new intent maps to a lifecycle that outranks the current owner",
            to: "a.suppress",
          },
          {
            label: "None higher",
            when: "the current journey already represents the strongest intent on record for this entity",
            to: "x.retained",
          },
        ],
      },
      {
        id: "a.suppress",
        kind: "action",
        does: "Stop the outgoing journey's queued and in-flight sends before the handoff completes, so nothing written for the superseded state can still arrive after it",
        writes: [{ field: "suppressed_sends", mode: "append" }],
        next: "h.escalate",
      },
      {
        id: "h.escalate",
        kind: "handoff",
        to: "external:higher-intent-lifecycle",
        on: "intent materially increased for this entity",
        carries: [
          "the escalating signal and its strength",
          "what the superseded journey had already communicated, so the new one does not repeat or contradict it",
          "the entity the intent is about",
        ],
        suppresses: [
          "queued reminders of the superseded journey",
          "its scheduled retries",
          "lower-intent calls to action already prepared",
        ],
      },
      {
        id: "x.retained",
        kind: "exit",
        state: "current journey retains ownership",
        terminal: false,
        reEntry: "a further escalation re-opens the question; nothing about the current journey changed",
      },
    ],
    guardrails: [
      "One weak engagement signal is not high intent, and escalating on it moves ownership to a lifecycle the person has not earned.",
      "Suppression happens before the handoff, not after. A handoff that leaves queued sends alive delivers the state the person just left.",
      "Escalation carries context forward. Starting the higher-intent journey from zero makes the person repeat themselves.",
    ],
    reusableRule:
      "When user intent materially increases, journey ownership should move to the lifecycle that best represents the new state.",
  },

  /* ------------------------------------------------------------ ACQ-04 */
  {
    id: "ACQ-04",
    slug: "high-intent-human-or-automated-route",
    category: "acquisition",
    goal: "escalation-exception",
    name: "High-intent action → qualification → human or automated route",
    purpose:
      "Decide, after a commercially serious act, whether the next step needs a person's judgement or can continue automatically - and resolve what already exists before creating anything.",
    entity: {
      scope: "lead, opportunity or account",
      note: "The dedup step is the entity work: a second request against an open opportunity updates that opportunity rather than opening a rival one.",
    },
    distinctFrom: [
      {
        journey: "ACQ-05",
        because:
          "ACQ-05 reacts to a qualification state that has already changed. This one runs at the moment of the act, before any state has been decided, and its output is a routing decision rather than a state.",
      },
    ],
    competition: {
      scope: "product",
      exclusionGroup: "purchase-intent",
      precedence:
        "above browse and decay, below a reached commercial destination",
      onLoss: "superseded",
    },
    entry: "t.high-intent",
    nodes: [
      {
        id: "t.high-intent",
        kind: "trigger",
        event: "high_intent_commercial_action",
        evidence: {
          requires: [
            "a pricing request, an enterprise contact request, a completed quote, a sales-qualified submission, or a high-value application",
          ],
          insufficientAlone: [
            "viewing a pricing page without requesting anything",
            "opening a sales email",
          ],
          source: "declared",
        },
        next: "a.resolve",
      },
      {
        id: "a.resolve",
        kind: "action",
        does: "Resolve the existing account and any open opportunity before creating anything, so a repeated or duplicated request updates what exists instead of opening a second record against the same person",
        writes: [{ field: "commercial_entity_link", mode: "set" }],
        next: "c.converted",
      },
      {
        id: "c.converted",
        kind: "condition",
        asks: "Has this account already reached the destination this action would pursue?",
        branches: [
          {
            label: "Already there",
            when: "the system of record shows the destination state already reached for this entity scope",
            to: "h.reached",
          },
          {
            label: "Not yet",
            when: "no destination state exists for this scope",
            to: "c.human",
          },
        ],
      },
      {
        id: "h.reached",
        kind: "handoff",
        to: "ACQ-08",
        on: "a high-intent action arriving after the destination was already reached",
        carries: [
          "the destination entity that already exists",
          "the action that arrived late, which is worth keeping as a signal even though it changes nothing",
        ],
      },
      {
        id: "c.human",
        kind: "condition",
        asks: "Does this action need human judgement?",
        branches: [
          {
            label: "Human judgement required",
            when: "value, complexity, contract terms, or the request itself asks for a person",
            to: "a.assign",
          },
          {
            label: "Automated continuation is sufficient",
            when: "the request is self-serve and unambiguous, and a person would add latency without adding judgement",
            to: "h.automated",
          },
        ],
      },
      {
        id: "a.assign",
        kind: "action",
        does: "Create or update the internal commercial entity, assign an owner, and raise a task carrying the evidence that justified it - ownership changes are appended so the trail of who held it survives",
        writes: [
          { field: "opportunity", mode: "set" },
          { field: "ownership_history", mode: "append" },
        ],
        next: "h.human",
      },
      {
        id: "h.human",
        kind: "handoff",
        to: "external:human-in-the-loop-lifecycle",
        on: "an assigned owner now holding the next step",
        carries: [
          "the opportunity and its assigned owner",
          "the evidence of intent, so the first human contact is not a discovery call about what they already told us",
          "an SLA for the first human response, which the receiving lifecycle enforces",
        ],
        suppresses: [
          "automated commercial follow-up on this entity while a person holds it",
        ],
      },
      {
        id: "h.automated",
        kind: "handoff",
        to: "external:automated-continuation",
        on: "a self-serve request that needs no human judgement",
        carries: ["the request and its context", "the resolved account link"],
      },
    ],
    preemptedBy: [
      {
        event: "destination reached for this entity while the journey is in flight",
        then: "ACQ-08 takes ownership and this journey's remaining steps are suppressed",
      },
    ],
    guardrails: [
      "High intent is not an automatic sales call. The human route is a decision with a real alternative, not the default dressed as one.",
      "An open opportunity is updated, never duplicated. Two records for one pursuit produce two people contacting the same account.",
      "An already-converted account does not receive acquisition communication, whatever the intent signal says.",
    ],
    reusableRule:
      "High intent should change orchestration according to the amount of human judgment required.",
  },

  /* ------------------------------------------------------------ ACQ-05 */
  {
    id: "ACQ-05",
    slug: "qualification-state-change-routing",
    category: "acquisition",
    goal: "eligibility-qualification",
    name: "Qualification state change → route, re-route or exit",
    purpose:
      "Treat qualification as a reversible state whose routing depends on why it changed, rather than a label applied once and trusted afterwards.",
    entity: {
      scope: "lead, account or opportunity",
      note: "Qualification is held per commercial relationship. The same person can be qualified for one offering and not another.",
    },
    distinctFrom: [
      {
        journey: "ACQ-10",
        because:
          "ACQ-10 handles a decision the other side made. This handles a decision our own qualification made, which can be reversed by new information without anyone changing their mind.",
      },
    ],
    entry: "t.changed",
    nodes: [
      {
        id: "t.changed",
        kind: "trigger",
        event: "qualification_state_changed",
        evidence: {
          requires: [
            "an authoritative transition between UNQUALIFIED, QUALIFYING, QUALIFIED, DISQUALIFIED and RECYCLE_ELIGIBLE, carrying the reason it changed",
          ],
          insufficientAlone: ["a score crossing a threshold with no reason recorded against it"],
          source: "authoritative",
        },
        next: "a.read",
      },
      {
        id: "a.read",
        kind: "action",
        does: "Read the new state together with the reason it changed, and append both to the qualification history - the previous state and its reason stay readable, because the next routing decision depends on them",
        writes: [{ field: "qualification_history", mode: "append" }],
        next: "c.state",
      },
      {
        id: "c.state",
        kind: "condition",
        asks: "What is the new qualification state?",
        branches: [
          { label: "QUALIFIED", when: "the account meets the bar for a commercial destination", to: "h.destination" },
          { label: "QUALIFYING", when: "evidence is being gathered and no conclusion has been reached", to: "x.in-progress" },
          { label: "UNQUALIFIED", when: "the bar is not met and no disqualifying fact was found", to: "x.not-yet" },
          { label: "DISQUALIFIED", when: "a specific fact rules the account out", to: "c.why" },
          { label: "RECYCLE_ELIGIBLE", when: "a previous negative state has a known route back", to: "w.recycle" },
        ],
      },
      {
        id: "h.destination",
        kind: "handoff",
        to: "external:commercial-destination",
        on: "qualification reaching QUALIFIED",
        carries: [
          "the qualification history, including anything that previously disqualified this account and was resolved",
          "the entity the qualification applies to",
        ],
      },
      {
        id: "x.in-progress",
        kind: "exit",
        state: "qualifying, no commercial escalation yet",
        terminal: false,
        reEntry: "the next authoritative state change opens a new instance",
      },
      {
        id: "x.not-yet",
        kind: "exit",
        state: "unqualified, nothing ruling it out",
        terminal: false,
        reEntry: "new evidence can move this to QUALIFYING without anything having to be undone first",
      },
      {
        id: "c.why",
        kind: "condition",
        asks: "Why was it disqualified?",
        branches: [
          {
            label: "Terminal mismatch",
            when: "the account can never be served - outside the market permanently, structurally not a fit, or prohibited",
            to: "x.terminal",
          },
          {
            label: "Timing",
            when: "the fit is right and the moment is wrong",
            to: "a.mark-recycle",
          },
          {
            label: "Missing requirement",
            when: "a specific requirement is unmet and could be met later",
            to: "w.requirement",
          },
          {
            label: "Duplicate or existing relationship",
            when: "the record duplicates an account that already exists, or the relationship is already held elsewhere",
            to: "h.merge",
          },
        ],
      },
      {
        id: "x.terminal",
        kind: "exit",
        state: "disqualified, terminal mismatch",
        terminal: true,
        reEntry:
          "none from this reason - only a change in what we serve, which is a change to the rule rather than to the account",
      },
      {
        id: "a.mark-recycle",
        kind: "action",
        does: "Record RECYCLE_ELIGIBLE with the timing reason and the condition or date that would make it worth revisiting, so the return is tied to something real rather than to a cadence",
        writes: [{ field: "qualification_history", mode: "append" }],
        next: "w.recycle",
      },
      {
        id: "w.recycle",
        kind: "wait",
        until: ["the recorded re-entry condition or date is met"],
        onEvent: "a.requalify",
        timeout: {
          after: "the recycle horizon recorded alongside the reason",
          reason:
            "a recycle condition that never arrives is a dead record held open; the horizon closes it honestly rather than leaving it pending",
        },
        onTimeout: "x.recycle-expired",
        windowExtendsOnEngagement: false,
      },
      {
        id: "a.requalify",
        kind: "action",
        does: "Move the state to QUALIFYING with the recycle reason attached, which is itself an authoritative state change and opens a new instance of this journey",
        writes: [{ field: "qualification_history", mode: "append" }],
        next: "x.recycled",
      },
      {
        id: "x.recycled",
        kind: "exit",
        state: "re-entered qualification",
        terminal: false,
        reEntry: "already re-entered; the new instance owns what follows",
      },
      {
        id: "x.recycle-expired",
        kind: "exit",
        state: "recycle horizon passed without the condition being met",
        terminal: false,
        reEntry: "a new inbound signal can start qualification again from the beginning, with the old history intact",
      },
      {
        id: "w.requirement",
        kind: "wait",
        until: ["the named requirement is satisfied"],
        onEvent: "a.requalify",
        timeout: {
          after: "the validity horizon of the requirement",
          reason: "an unmet requirement with no deadline keeps an account in a state that is neither pursued nor closed",
        },
        onTimeout: "x.requirement-lapsed",
        windowExtendsOnEngagement: false,
      },
      {
        id: "x.requirement-lapsed",
        kind: "exit",
        state: "disqualified, requirement never met",
        terminal: false,
        reEntry: "satisfying the requirement later is a new authoritative state change and re-enters normally",
      },
      {
        id: "h.merge",
        kind: "handoff",
        to: "external:account-master-data",
        on: "a duplicate or already-held relationship",
        carries: [
          "both records and which one is authoritative",
          "the qualification history of each, so merging does not destroy the older reason trail",
        ],
        suppresses: ["acquisition messaging on the duplicate record"],
      },
    ],
    guardrails: [
      "Disqualified is not permanently dead unless the reason is terminal. Four reasons arrive at the same label and only one of them ends anything.",
      "A qualification state is never written without its reason, and never overwrites the reason that came before it.",
      "A recycle is tied to a condition or a date that was actually recorded. Where none exists, no follow-up schedule is invented to stand in for one.",
    ],
    reusableRule:
      "Qualification is a reversible business state whose routing depends on why the state changed.",
  },

  /* ------------------------------------------------------------ ACQ-06 */
  {
    id: "ACQ-06",
    slug: "dynamic-eligibility-consequence",
    category: "acquisition",
    goal: "eligibility-qualification",
    name: "Dynamic eligibility → eligible or ineligible → consequence",
    purpose:
      "Re-decide eligibility as the underlying data changes, and separate what it forbids next from what it does not undo.",
    entity: {
      scope: "person, account or the business entity the rule is about",
      note: "Eligibility is evaluated per rule and per entity; losing it for one programme says nothing about another.",
    },
    distinctFrom: [
      {
        journey: "ACQ-05",
        because:
          "Qualification asks whether we want this relationship. Eligibility asks whether the rules permit a specific action, which can flip repeatedly while qualification never moves.",
      },
    ],
    entry: "t.evaluated",
    nodes: [
      {
        id: "t.evaluated",
        kind: "trigger",
        event: "eligibility_inputs_changed_or_reevaluated",
        evidence: {
          requires: [
            "a change in data an eligibility rule reads, or a scheduled re-evaluation of that rule",
          ],
          source: "authoritative",
        },
        next: "a.evaluate",
      },
      {
        id: "a.evaluate",
        kind: "action",
        does: "Evaluate the authoritative rules and record which rule produced the result and on what input, so the answer can be explained and contested later",
        writes: [{ field: "eligibility_decisions", mode: "append" }],
        next: "c.eligible",
      },
      {
        id: "c.eligible",
        kind: "condition",
        asks: "Is the entity eligible now?",
        branches: [
          { label: "Eligible", when: "every rule in scope passes on the current data", to: "o.permitted" },
          { label: "Not eligible", when: "at least one rule fails, and the failing rule is recorded", to: "c.commitment" },
        ],
      },
      {
        id: "o.permitted",
        kind: "outcome",
        state: "eligible for new actions under this rule",
        means:
          "new actions covered by the rule may proceed. It does not mean the capability is available to offer, and it does not mean an entitlement has been granted - those are two further steps, each with their own state",
        next: "x.eligible",
      },
      {
        id: "x.eligible",
        kind: "exit",
        state: "eligible, recorded with the rule that decided it",
        terminal: false,
        reEntry: "any change to the inputs re-opens the evaluation",
      },
      {
        id: "c.commitment",
        kind: "condition",
        asks: "Does an existing commitment or an already-granted entitlement depend on this eligibility?",
        branches: [
          {
            label: "Commitment exists",
            when: "something already promised, granted, contracted or in flight relies on the eligibility that just failed",
            to: "a.reconcile",
          },
          {
            label: "Nothing outstanding",
            when: "the eligibility governed only future actions",
            to: "a.block",
          },
        ],
      },
      {
        id: "a.reconcile",
        kind: "action",
        does: "Flag the existing commitment for its own reconciliation, naming the rule and the reason that changed - this journey does not cancel, reduce or reverse anything already granted",
        writes: [{ field: "commitment_review_queue", mode: "append" }],
        next: "h.reconcile",
      },
      {
        id: "h.reconcile",
        kind: "handoff",
        to: "external:commitment-reconciliation",
        on: "eligibility lost while an obligation is outstanding",
        carries: [
          "the failing rule and the input that changed",
          "the commitment in question and when it was granted",
          "the fact that no automatic cancellation has been applied",
        ],
      },
      {
        id: "a.block",
        kind: "action",
        does: "Prevent new actions the rule now forbids, naming the rule in the block so the reason travels with the refusal instead of surfacing as an unexplained failure",
        writes: [{ field: "eligibility_decisions", mode: "append" }],
        next: "x.ineligible",
      },
      {
        id: "x.ineligible",
        kind: "exit",
        state: "ineligible for new actions, nothing outstanding reversed",
        terminal: false,
        reEntry: "restored eligibility is an ordinary re-evaluation and needs no special case",
      },
    ],
    guardrails: [
      "Eligibility is not availability. Being permitted to have something says nothing about whether it can currently be supplied.",
      "Eligibility is not an entitlement already granted. Losing the first does not retract the second.",
      "A future eligibility loss does not automatically invalidate an existing obligation; the obligation is reconciled on its own terms.",
      "Every eligibility result names the rule and the input that produced it. A bare no cannot be explained, appealed or debugged.",
    ],
    reusableRule:
      "Eligibility determines whether a new action may occur; existing commitments require separate reconciliation.",
  },

  /* ------------------------------------------------------------ ACQ-07 */
  {
    id: "ACQ-07",
    slug: "intent-decay-cooldown",
    category: "acquisition",
    goal: "expiry-renewal",
    name: "Intent decay → de-prioritise → cooldown or exit",
    purpose:
      "Let a recorded high-intent state expire when the evidence behind it goes stale, instead of pursuing someone on the strength of something they did once.",
    entity: {
      scope: "person plus the intent context that was recorded",
      note: "Decay is per intent context. A stale interest in one product does not lower the intent recorded against another.",
    },
    distinctFrom: [
      {
        journey: "ACQ-10",
        because:
          "Nobody said no here. Decay is the absence of continuing evidence, and it must not be recorded as a decision the person never made.",
      },
    ],
    competition: {
      scope: "product",
      exclusionGroup: "purchase-intent",
      precedence:
        "lowest in the group - any live intent journey on the same product outranks it",
      onLoss: "exit",
    },
    entry: "t.stale",
    nodes: [
      {
        id: "t.stale",
        kind: "trigger",
        event: "intent_freshness_threshold_passed",
        evidence: {
          requires: [
            "a recorded qualified or high-intent state whose supporting evidence is now older than the freshness window for that signal type",
          ],
          source: "behavioral",
        },
        next: "a.weigh",
      },
      {
        id: "a.weigh",
        kind: "action",
        does: "Weigh the time since the last meaningful signal, any behaviour since that contradicts it, whatever progress was made toward the destination, and the relationship state underneath",
        next: "c.credible",
      },
      {
        id: "c.credible",
        kind: "condition",
        asks: "Is the recorded intent still credible?",
        branches: [
          {
            label: "Still credible",
            when: "recent behaviour continues to support it, or real progress toward the destination is under way",
            to: "x.unchanged",
          },
          {
            label: "No longer credible",
            when: "the evidence is stale or contradicted, and nothing progressed",
            to: "a.downgrade",
          },
        ],
      },
      {
        id: "x.unchanged",
        kind: "exit",
        state: "intent state maintained",
        terminal: false,
        reEntry: "the next freshness threshold re-opens the question",
      },
      {
        id: "a.downgrade",
        kind: "action",
        does: "Lower the intent classification to what the evidence now supports, and record why. Marketing permission is untouched: intent that decayed is not consent that was withdrawn, and the two are stored separately for exactly this moment",
        writes: [{ field: "intent_history", mode: "append" }],
        next: "a.suppress",
      },
      {
        id: "a.suppress",
        kind: "action",
        does: "Stop follow-up written for the higher intent, including anything already queued at that priority",
        writes: [{ field: "suppressed_sends", mode: "append" }],
        next: "c.relationship",
      },
      {
        id: "c.relationship",
        kind: "condition",
        asks: "What relationship exists underneath the decayed intent?",
        branches: [
          {
            label: "Existing customer",
            when: "the person or account already holds a live product or service relationship",
            to: "h.customer",
          },
          { label: "Not a customer", when: "no live relationship exists", to: "w.cooldown" },
        ],
      },
      {
        id: "h.customer",
        kind: "handoff",
        to: "external:customer-lifecycle",
        on: "decayed acquisition intent over a live customer relationship",
        carries: ["the decayed intent and its history", "the fact that no negative decision was recorded"],
        suppresses: ["acquisition-priority follow-up for this person"],
      },
      {
        id: "w.cooldown",
        kind: "wait",
        until: ["a new strong intent signal"],
        onEvent: "h.re-escalate",
        timeout: {
          after: "the cooldown horizon for this intent context",
          reason: "a cooldown with no end is a permanent hold under a friendlier name",
        },
        onTimeout: "x.cooled",
        windowExtendsOnEngagement: false,
      },
      {
        id: "h.re-escalate",
        kind: "handoff",
        to: "ACQ-03",
        on: "a new strong signal arriving during cooldown",
        carries: ["the new signal", "the decayed history, so the escalation is not mistaken for a first-time interest"],
      },
      {
        id: "x.cooled",
        kind: "exit",
        state: "intent expired, permission unchanged, no decision recorded",
        terminal: false,
        reEntry: "a new strong signal establishes a new intent state from scratch",
      },
    ],
    guardrails: [
      "An old pricing visit does not create a permanent high-intent flag. Evidence expires whether or not anything replaces it.",
      "Intent decay does not change marketing permission. Consent was given deliberately and is only withdrawn deliberately.",
      "Decay is not a decline. Nothing here writes a negative outcome against a person who simply went quiet.",
      "A new strong signal can establish a new intent state; the decayed one does not have to be argued away first.",
    ],
    reusableRule: "Intent should decay when the evidence supporting it becomes stale.",
  },

  /* ------------------------------------------------------------ ACQ-08 */
  {
    id: "ACQ-08",
    slug: "destination-reached-acquisition-suppression",
    category: "acquisition",
    goal: "progression-milestone",
    name: "Commercial destination reached → acquisition suppression → lifecycle handoff",
    purpose:
      "Make acquisition give up ownership the moment the outcome it existed to cause is recorded, and stop what it has already queued.",
    entity: {
      scope: "person or account plus the destination entity",
      note: "The whole journey turns on this scope. The order, subscription, booking or application that completed is what gets closed out - not everything the person was ever in.",
    },
    distinctFrom: [
      {
        journey: "ACQ-03",
        because:
          "Escalation re-ranks journeys that are all still live. This one ends a class of them, because the objective they shared has been met.",
      },
    ],
    competition: {
      scope: "product",
      exclusionGroup: "purchase-intent",
      precedence:
        "highest in the group - a reached commercial destination ends every intent journey on the same product",
      onLoss: "exit",
    },
    entry: "t.destination",
    nodes: [
      {
        id: "t.destination",
        kind: "trigger",
        event: "authoritative_destination_event",
        evidence: {
          requires: [
            "a recorded business fact: trial started, subscription started, purchase completed, booking confirmed, application submitted, or an opportunity created where that is the destination",
          ],
          insufficientAlone: [
            "an email click",
            "a landing page visit",
            "a form view",
            "a checkout that was started but not completed",
          ],
          source: "authoritative",
        },
        next: "c.authoritative",
      },
      {
        id: "c.authoritative",
        kind: "condition",
        asks: "Did the event come from the system of record for that destination?",
        branches: [
          {
            label: "Authoritative",
            when: "the destination system recorded the fact",
            to: "a.scope",
          },
          {
            label: "Proxy only",
            when: "the signal describes engagement or navigation rather than a recorded business fact",
            to: "x.not-conversion",
          },
        ],
      },
      {
        id: "x.not-conversion",
        kind: "exit",
        state: "no destination recorded, nothing suppressed",
        terminal: false,
        reEntry:
          "the real event, if it happens, arrives from the system of record and opens a proper instance",
      },
      {
        id: "a.scope",
        kind: "action",
        does: "Resolve the entity the destination belongs to - the order, subscription, booking or application - so that everything after this is scoped to it",
        writes: [{ field: "destination_entity", mode: "set" }],
        next: "a.identify",
      },
      {
        id: "a.identify",
        kind: "action",
        does: "Identify the acquisition journeys whose objective this event has just made obsolete for that entity scope, and only those - journeys about a different entity are untouched",
        next: "a.suppress",
      },
      {
        id: "a.suppress",
        kind: "action",
        does: "Suppress their queued reminders, scheduled retries, lower-intent calls to action and stale promotional steps before the next send window opens",
        writes: [{ field: "suppressed_sends", mode: "append" }],
        next: "h.next",
      },
      {
        id: "h.next",
        kind: "handoff",
        to: "external:next-lifecycle",
        on: "the destination state being recorded",
        carries: [
          "the destination entity",
          "which acquisition journeys were closed and why, so the receiving lifecycle knows what was already said",
          "the intent history that led here",
        ],
        suppresses: [
          "every acquisition journey scoped to this destination entity",
          "their queued and in-flight sends",
        ],
      },
    ],
    guardrails: [
      "An email click is not a conversion. A landing page visit is not a conversion. Only the system of record decides that the destination was reached.",
      "Suppression is scoped to the entity: one order completing does not close the journeys about a different order.",
      "Suppression reaches sends that are already queued, not only future scheduling.",
    ],
    reusableRule:
      "Once the destination state is reached, acquisition orchestration must relinquish ownership to the next lifecycle.",
  },

  /* ------------------------------------------------------------ ACQ-09 */
  {
    id: "ACQ-09",
    slug: "bounded-education-progress-or-sunset",
    category: "acquisition",
    goal: "progression-milestone",
    name: "Researching lead → bounded education → progress or sunset",
    purpose:
      "Give a legitimate but not-yet-ready lead a window of useful education that ends whether or not it worked.",
    entity: {
      scope: "lead or person, held against the reason they entered",
      note: "The entry reason is the subject: education answers the question they arrived with, and when the window closes it closes for that reason rather than for the person forever.",
    },
    distinctFrom: [
      {
        journey: "ACQ-07",
        because:
          "Decay retires an intent state that has gone stale. This spends a deliberately fixed window trying to advance one, and only then closes it.",
      },
    ],
    entry: "t.not-ready",
    nodes: [
      {
        id: "t.not-ready",
        kind: "trigger",
        event: "valid_lead_not_destination_ready",
        evidence: {
          requires: [
            "a captured lead with a recorded entry reason and no destination it is ready for",
          ],
          source: "declared",
        },
        next: "c.basis",
      },
      {
        id: "c.basis",
        kind: "condition",
        asks: "Is there explicit permission and a lawful basis for this kind of communication?",
        branches: [
          {
            label: "Basis exists",
            when: "permission was given and covers education of this kind",
            to: "a.educate",
          },
          {
            label: "No basis",
            when: "the capture carried no permission, or the basis does not cover this - the ordinary case, since submitting a form is not consent",
            to: "x.no-basis",
          },
        ],
      },
      {
        id: "x.no-basis",
        kind: "exit",
        state: "held, no nurture started",
        terminal: false,
        reEntry:
          "permission given later re-opens this normally; the capture itself never counted as consent and nothing was sent in the meantime",
      },
      {
        id: "a.educate",
        kind: "action",
        does: "Send education matched to the reason the person actually entered - not a generic sequence, and not sales pressure repeated at intervals",
        next: "w.window",
      },
      {
        id: "w.window",
        kind: "wait",
        until: ["a meaningful progression signal"],
        onEvent: "h.progressed",
        timeout: {
          after: "the bounded nurture window fixed when the lead entered",
          reason:
            "the window is what makes this nurture rather than a permanent messaging state, and it is set once at entry",
        },
        onTimeout: "a.sunset",
        windowExtendsOnEngagement: false,
      },
      {
        id: "h.progressed",
        kind: "handoff",
        to: "ACQ-03",
        on: "a progression signal strong enough to change what this person needs",
        carries: [
          "the entry reason and what education was already sent, so the next journey does not restate it",
          "the progression signal itself",
        ],
      },
      {
        id: "a.sunset",
        kind: "action",
        does: "Close the window and record that it ended without progression, which is a fact about this attempt rather than a judgement about the person",
        writes: [{ field: "nurture_history", mode: "append" }],
        next: "x.sunset",
      },
      {
        id: "x.sunset",
        kind: "exit",
        state: "nurture window closed without progression",
        terminal: false,
        reEntry:
          "a new inbound signal or a newly declared request can open a new window; immediate re-entry into the same education is suppressed",
      },
    ],
    guardrails: [
      "Nurture does not run forever. The window is bounded at entry and it closes on time.",
      "Engagement inside the window does not extend it. Opening the emails is not progress toward the destination.",
      "Education answers the reason the person entered. A generic sequence sent to everyone is the thing this journey exists instead of.",
      "No permission, no nurture. The capture is not the consent.",
    ],
    reusableRule:
      "Nurture should bridge a temporary readiness gap, not become a permanent messaging state.",
  },

  /* ------------------------------------------------------------ ACQ-10 */
  {
    id: "ACQ-10",
    slug: "commercial-decline-reason-routing",
    category: "acquisition",
    goal: "eligibility-qualification",
    name: "Explicit commercial decline → reason → terminal, cooldown or recycle",
    purpose:
      "Route a negative commercial outcome by its cause rather than filing every one of them under lost.",
    entity: {
      scope: "lead, opportunity or account",
      note: "The decline belongs to the opportunity it was given about. A different opportunity with the same account is not declined by it.",
    },
    distinctFrom: [
      {
        journey: "ACQ-07",
        because:
          "Someone decided something here. Where the recorded reason turns out to be silence rather than a decision, this journey hands it to decay instead of treating it as one.",
      },
    ],
    entry: "t.decline",
    nodes: [
      {
        id: "t.decline",
        kind: "trigger",
        event: "explicit_decline_or_authoritative_lost_outcome",
        evidence: {
          requires: [
            "a decline stated by the person or account, or a lost outcome recorded in the system of record",
          ],
          insufficientAlone: ["silence", "a missed meeting", "an unanswered email"],
          source: "authoritative",
        },
        next: "a.capture",
      },
      {
        id: "a.capture",
        kind: "action",
        does: "Capture the reason against the opportunity and append it to the decline history, leaving earlier reasons readable - a second loss for a different reason is two facts, not a correction of the first",
        writes: [{ field: "decline_history", mode: "append" }],
        next: "c.reason",
      },
      {
        id: "c.reason",
        kind: "condition",
        asks: "Which reason family applies?",
        branches: [
          { label: "NOT_FIT", when: "the mismatch is structural and will not change", to: "x.terminal" },
          { label: "TIMING", when: "right fit, wrong moment", to: "c.reentry" },
          { label: "NO_PRIORITY", when: "real fit, no current mandate to act", to: "c.reentry" },
          { label: "PROCUREMENT_BLOCK", when: "a process or policy obstacle rather than a judgement about us", to: "c.reentry" },
          { label: "PRICE", when: "the value case did not clear the price at this moment", to: "c.reentry" },
          { label: "COMPETITOR", when: "another supplier was chosen, which has a term and therefore an end", to: "c.reentry" },
          {
            label: "NO_RESPONSE",
            when: "the opportunity was closed for silence, which nobody actually decided",
            to: "h.decay",
          },
          { label: "OTHER", when: "the reason is unclassified and cannot be routed as recorded", to: "h.classify" },
        ],
      },
      {
        id: "x.terminal",
        kind: "exit",
        state: "declined, terminal mismatch",
        terminal: true,
        reEntry:
          "none from this reason - what would have to change is what we sell, not what this account decided",
      },
      {
        id: "h.decay",
        kind: "handoff",
        to: "ACQ-07",
        on: "an opportunity closed for silence rather than for a decision",
        carries: [
          "the fact that no decision was made, so nothing downstream reads this as a refusal",
          "the intent history, which is now the stale evidence decay is about",
        ],
      },
      {
        id: "h.classify",
        kind: "handoff",
        to: "DEC-181",
        on: "a decline recorded as OTHER",
        carries: ["the opportunity and whatever was written in place of a reason"],
        suppresses: ["automatic re-entry until the reason is classified"],
      },
      {
        id: "c.reentry",
        kind: "condition",
        asks: "Is a re-entry event, date or condition actually known?",
        branches: [
          {
            label: "Known",
            when: "a contract end, a budget cycle, a project date or a named condition was recorded with the decline",
            to: "w.reentry",
          },
          {
            label: "Not known",
            when: "the reason is temporary but nothing was recorded that would say when to return",
            to: "x.cooldown",
          },
        ],
      },
      {
        id: "w.reentry",
        kind: "wait",
        until: ["the recorded re-entry event or date"],
        onEvent: "h.requalify",
        timeout: {
          after: "the horizon recorded alongside the reason",
          reason: "a re-entry condition that never arrives closes rather than waiting indefinitely",
        },
        onTimeout: "x.cooldown",
        windowExtendsOnEngagement: false,
      },
      {
        id: "h.requalify",
        kind: "handoff",
        to: "ACQ-05",
        on: "the recorded re-entry condition being met",
        carries: [
          "the decline history, so the new attempt starts knowing what was said before",
          "the condition that was met",
        ],
      },
      {
        id: "x.cooldown",
        kind: "exit",
        state: "declined, recycle-eligible, nothing scheduled",
        terminal: false,
        reEntry:
          "a new inbound signal, or a re-entry condition recorded later; no cadence is invented to fill the silence",
      },
    ],
    guardrails: [
      "The lost reason history is preserved. Routing depends on it, so overwriting it destroys the ability to route at all.",
      "Not now is not never. Only a terminal reason ends acquisition permanently.",
      "A declined opportunity is not swept into generic marketing as a consolation.",
      "Where no re-entry condition was recorded, none is invented. The absence of a date is not an invitation to pick one.",
    ],
    reusableRule:
      "Negative commercial outcomes should determine future eligibility according to their cause, not merely their LOST label.",
  },
];
