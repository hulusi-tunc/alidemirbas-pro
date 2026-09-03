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
    channels: [],
    name: "Anonymous intent → known identity → qualified entry",
    shortName: "Anonymous Identity Resolution",
    purpose:
      "Carry a meaningful but anonymous intent signal through identity resolution without inventing an identity, and decide lifecycle entry as a question separate from having resolved one.",
    entity: {
      scope: "anonymous_profile, reconciled onto person or account",
      note: "The subject changes identity mid-journey, which is the whole problem: the pre-identity history has to survive the transition rather than being replaced by the known profile.",
      instanceKey: [
        "anonymous_profile_id"
      ],
      concurrency: "one-active-per-key"
    },
    distinctFrom: [
      {
        journey: "ACQ-02",
        because:
          "ACQ-02 starts from something the person declared. Here nothing has been declared, so identity and permission both have to be established rather than read.",
      },
    ],
    objective: "Carry a meaningful but anonymous intent signal through identity resolution without inventing an identity, and decide lifecycle entry as a question separate from having resolved one.",
    eligibility: [
      "repeated visits to high-intent pages",
      "interaction with pricing",
      "product or configuration exploration",
      "a meaningful return after a first session",
      "no instance of this journey is already open for the anonymous_profile",
      "hard gates (GLB-31) allow communication for this purpose"
    ],
    suppressions: [
      {
        "id": "s.g1",
        "label": "CANONICAL_RULE",
        "text": "Anonymous behaviour is not consent. Resolving an identity does not create permission to contact it."
      },
      {
        "id": "s.g2",
        "label": "CANONICAL_RULE",
        "text": "Identities are merged on deterministic signals only. A probabilistic match is a guess, and a wrong merge writes one person's history onto another."
      },
      {
        "id": "s.g3",
        "label": "CANONICAL_RULE",
        "text": "Becoming known is not the same as becoming eligible, and neither is a reason to start messaging."
      }
    ],
    implementation: {
      "attributes": {
        "required": [
          "anonymous_profile_id",
          "intent_signals",
          "signal_freshness_window",
          "identity_resolution_history"
        ],
        "optional": []
      }
    },
    measurement: {
      "journeyOutcome": {
        "type": "exit-or-handoff",
        "refs": [
          "x.stale",
          "x.known-only",
          "h.qualification"
        ]
      },
      "secondary": [],
      "guardrails": [
        "state_written_on_stale_entity"
      ],
      "operational": [
        "entry_volume",
        "exit_distribution",
        "no_action_rate_by_reason",
        "time_to_exit"
      ]
    },
    discovery: {
      "aliases": [
        "anonymous identity resolution",
        "anonymous visitor intent",
        "identity stitching",
        "known-visitor resolution"
      ],
      "useCases": [
        "an anonymous visitor whose repeated high-intent behaviour deserves resolution without inventing an identity",
        "deciding lifecycle entry separately from becoming known"
      ]
    },
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
        until: [
          "deterministic_identity_resolved"
        ],
        onEvent: "a.reconcile",
        timeout: {
          "after": {
            "key": "anonymous_intent.identity",
            "rule": "The freshness window of the signals that opened the profile.",
            "class": "observation-window",
            "required": true
          },
          "reason": "anonymous intent goes stale like any other evidence, and an unresolved profile is not held open indefinitely waiting for a name",
          "relativeTo": "trigger"
        },
        onTimeout: "x.stale",
        windowExtendsOnEngagement: false,
        recheck: "the anonymous_profile re-read from the system of record before acting on the timeout",
      },
      {
        id: "x.stale",
        kind: "exit",
        state: "anonymous, intent stale, no identity claimed",
        terminal: false,
        reEntry:
          "a fresh crossing of the intent threshold opens a new instance; nothing was merged and no permission was implied by waiting",
        class: "timeout",
      },
      {
        id: "a.reconcile",
        kind: "action",
        does: "Reconcile the anonymous behavioural history onto the known profile, keeping the pre-identity record readable alongside it rather than replacing it, and record which method resolved the identity",
        writes: [{ field: "identity_resolution_history", mode: "append" }],
        next: "c.eligible",
        idempotencyKey: "anonymous_profile_id + a.reconcile",
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
          "a fresh lead_id, minted at this handoff from the reconciled profile's own account/person identity, since no lead concept exists prior to this point",
        ],
      },
      {
        id: "x.known-only",
        kind: "exit",
        state: "known profile, no lifecycle entered",
        terminal: false,
        reEntry:
          "ACQ-06 re-evaluates eligibility when the underlying data changes; becoming known does not start nurture by itself",
        class: "success",
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
    channels: [],
    name: "Captured interest → qualification → appropriate destination",
    shortName: "Interest Qualification Routing",
    purpose:
      "Route first-party interest to the destination its own content justifies, instead of treating every capture as either a sales lead or a subscriber.",
    entity: {
      scope: "lead, resolved onto person or account",
      note: "Scoped to the specific capture and what it asked for; a second, different request from the same person is a second instance with its own destination.",
      instanceKey: [
        "lead_id"
      ],
      concurrency: "one-active-per-key"
    },
    distinctFrom: [
      {
        journey: "ACQ-09",
        because:
          "This journey decides where interest goes. ACQ-09 is one of the places it can go, and owns the bounded window that follows - keeping both here would put the same window in two state machines.",
      },
    ],
    objective: "Route first-party interest to the destination its own content justifies, instead of treating every capture as either a sales lead or a subscriber.",
    eligibility: [
      "a first-party submission: a form, a content request, a contact request, or an equivalent deliberate act",
      "no instance of this journey is already open for the lead",
      "hard gates (GLB-31) allow communication for this purpose"
    ],
    suppressions: [
      {
        "id": "s.g1",
        "label": "CANONICAL_RULE",
        "text": "A captured lead is not a sales-qualified lead. Capture records interest; qualification is a separate decision with its own state."
      },
      {
        "id": "s.g2",
        "label": "CANONICAL_RULE",
        "text": "A submitted form is not marketing consent unless permission was explicitly given in it. The submission and the permission are two facts, and only one of them may have happened."
      },
      {
        "id": "s.g3",
        "label": "CANONICAL_RULE",
        "text": "Not every lead needs a sales handoff. A destination is chosen from what the person asked for, not from what the pipeline wants."
      }
    ],
    implementation: {
      "attributes": {
        "required": [
          "lead_id",
          "capture_record",
          "declared_destination",
          "disqualifiers"
        ],
        "optional": []
      }
    },
    measurement: {
      "journeyOutcome": {
        "type": "handoff",
        "refs": [
          "h.destination",
          "h.reason",
          "h.education"
        ]
      },
      "secondary": [],
      "guardrails": [
        "state_written_on_stale_entity"
      ],
      "operational": [
        "entry_volume",
        "exit_distribution",
        "no_action_rate_by_reason",
        "time_to_exit"
      ]
    },
    discovery: {
      "aliases": [
        "interest qualification routing",
        "lead routing",
        "form submission routing",
        "inbound interest triage"
      ],
      "useCases": [
        "a form or content request that names its own destination",
        "interest with no destination it is ready for, routed to education"
      ]
    },
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
        idempotencyKey: "lead_id + a.record",
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
        contract: {
          "requiredFields": [
            "account_id",
            "lead_id",
            "handed_at",
            "reason"
          ]
        },
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
    channels: [],
    name: "Intent escalation → higher-intent journey handoff",
    shortName: "Intent Escalation Handoff",
    purpose:
      "Move ownership when someone in a low-intent lifecycle does something that no longer fits it, and make sure the journey being left behind actually goes quiet.",
    entity: {
      scope: "person plus the entity the new intent is about",
      note: "Escalation is about a subject. Configuring one product does not escalate the journeys about a different one.",
      instanceKey: [
        "person_id",
        "intent_entity_id"
      ],
      concurrency: "one-active-per-key"
    },
    distinctFrom: [
      {
        journey: "ACQ-08",
        because:
          "ACQ-08 fires when a destination has been reached and acquisition is finished. This fires while everything is still in progress and only the ranking has changed.",
      },
    ],
    objective: "Move ownership when someone in a low-intent lifecycle does something that no longer fits it, and make sure the journey being left behind actually goes quiet.",
    eligibility: [
      "an act materially stronger than the one that placed the person in their current journey: pricing after content, configuration after browsing, starting a quote after general interest",
      "no instance of this journey is already open for the person plus the entity the new intent is about",
      "hard gates (GLB-31) allow communication for this purpose"
    ],
    suppressions: [
      {
        "id": "s.g1",
        "label": "CANONICAL_RULE",
        "text": "One weak engagement signal is not high intent, and escalating on it moves ownership to a lifecycle the person has not earned."
      },
      {
        "id": "s.g2",
        "label": "CANONICAL_RULE",
        "text": "Suppression happens before the handoff, not after. A handoff that leaves queued sends alive delivers the state the person just left."
      },
      {
        "id": "s.g3",
        "label": "CANONICAL_RULE",
        "text": "Escalation carries context forward. Starting the higher-intent journey from zero makes the person repeat themselves."
      }
    ],
    implementation: {
      "attributes": {
        "required": [
          "person_id",
          "intent_entity_id",
          "current_lifecycle",
          "signal_strength_evidence",
          "suppressed_sends"
        ],
        "optional": []
      }
    },
    measurement: {
      "journeyOutcome": {
        "type": "exit-or-handoff",
        "refs": [
          "x.unchanged",
          "x.retained",
          "h.escalate"
        ]
      },
      "secondary": [],
      "guardrails": [
        "state_written_on_stale_entity"
      ],
      "operational": [
        "entry_volume",
        "exit_distribution",
        "no_action_rate_by_reason",
        "time_to_exit"
      ]
    },
    discovery: {
      "aliases": [
        "intent escalation",
        "intent upgrade",
        "lifecycle escalation",
        "higher-intent handoff"
      ],
      "useCases": [
        "a nurture lead who requests pricing and must leave nurture immediately",
        "making the lower-intent journey go quiet before the higher one starts"
      ]
    },
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
        class: "no-action",
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
        idempotencyKey: "person_id + a.suppress",
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
        contract: {
          "requiredFields": [
            "person_id",
            "handed_at",
            "reason"
          ]
        },
      },
      {
        id: "x.retained",
        kind: "exit",
        state: "current journey retains ownership",
        terminal: false,
        reEntry: "a further escalation re-opens the question; nothing about the current journey changed",
        class: "success",
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
    channels: ["sales", "task"],
    name: "High-intent action → qualification → human or automated route",
    shortName: "High-Intent Lead Routing",
    purpose:
      "Decide, after a commercially serious act, whether the next step needs a person's judgement or can continue automatically - and resolve what already exists before creating anything.",
    entity: {
      scope: "lead, opportunity or account",
      note: "The dedup step is the entity work: a second request against an open opportunity updates that opportunity rather than opening a rival one.",
      instanceKey: [
        "lead_id"
      ],
      concurrency: "one-active-per-key"
    },
    distinctFrom: [
      {
        journey: "ACQ-05",
        because:
          "ACQ-05 reacts to a qualification state that has already changed. This one runs at the moment of the act, before any state has been decided, and its output is a routing decision rather than a state.",
      },
    ],
    objective: "Decide, after a commercially serious act, whether the next step needs a person's judgement or can continue automatically - and resolve what already exists before creating anything.",
    eligibility: [
      "a pricing request, an enterprise contact request, a completed quote, a sales-qualified submission, or a high-value application",
      "no instance of this journey is already open for the lead",
      "hard gates (GLB-31) allow communication for this purpose"
    ],
    suppressions: [
      {
        "id": "s.g1",
        "label": "CANONICAL_RULE",
        "text": "High intent is not an automatic sales call. The human route is a decision with a real alternative, not the default dressed as one."
      },
      {
        "id": "s.g2",
        "label": "CANONICAL_RULE",
        "text": "An open opportunity is updated, never duplicated. Two records for one pursuit produce two people contacting the same account."
      },
      {
        "id": "s.g3",
        "label": "CANONICAL_RULE",
        "text": "An already-converted account does not receive acquisition communication, whatever the intent signal says."
      },
      {
        "id": "s.p1",
        "label": "CANONICAL_RULE",
        "text": "Destination reached for this entity while the journey is in flight: ACQ-08 takes ownership and this journey's remaining steps are suppressed"
      }
    ],
    contact: {
      "defaultPriority": "service",
      "pressureClass": "none",
      "localCap": {
        "value": {
          "key": "high_intent.touches",
          "rule": "Every touch runs against a budget fixed when the instance opened; the budget is the plan's own length, and no touch is repeated because nothing could tell whether it arrived.",
          "default": {
            "value": 1,
            "confidence": "high",
            "basis": "corpus-rule",
            "applicableWhen": "GLB-24; the graph's own touch count"
          },
          "required": false
        },
        "appliesTo": "all"
      },
      "cooldown": {
        "key": "high_intent.cooldown",
        "rule": "Routing is per high-intent action; an open opportunity is updated, never duplicated, and no cooldown applies between actions.",
        "default": {
          "value": "none",
          "confidence": "high",
          "basis": "corpus-rule"
        },
        "required": false
      },
      "competition": {
        "exclusionGroup": "purchase-intent",
        "scope": "product",
        "precedence": "above browse and decay, below a reached commercial destination",
        "onLoss": "superseded"
      }
    },
    channelStrategy: {
      "roles": [
        {
          "role": "human",
          "channels": [
            "sales",
            "task"
          ],
          "when": "the next step needs a person's judgement - an owner is assigned and a task raised with the evidence"
        }
      ],
      "fallback": "same-role-other-channel",
      "label": "RECOMMENDED_DEFAULT"
    },
    orchestration: {
      "strategy": "single-notice",
      "touches": [
        {
          "id": "t1",
          "stage": "assign",
          "action": "a.assign",
          "prerequisites": [
            "c.converted",
            "c.human"
          ],
          "purpose": "Create or update the internal commercial entity, assign an owner, and raise a task carrying the evidence that justified it - ownership changes are appended so the trail of who held it survives",
          "channelRoles": [
            "human"
          ],
          "mandatory": false,
          "label": "CANONICAL_RULE"
        }
      ],
      "noAction": [
        "s.g1",
        "s.g2",
        "s.g3",
        "s.p1"
      ]
    },
    implementation: {
      "attributes": {
        "required": [
          "lead_id",
          "account_id",
          "commercial_entity_link",
          "opportunity",
          "ownership_history",
          "destination_reached"
        ],
        "optional": []
      }
    },
    measurement: {
      "journeyOutcome": {
        "type": "handoff",
        "refs": [
          "h.reached",
          "h.human",
          "h.automated"
        ]
      },
      "secondary": [],
      "guardrails": [
        "complaint",
        "message_after_success",
        "unsubscribe"
      ],
      "operational": [
        "entry_volume",
        "exit_distribution",
        "no_action_rate_by_reason",
        "time_to_exit"
      ]
    },
    discovery: {
      "aliases": [
        "high-intent lead routing",
        "sales handoff",
        "MQL to SQL routing",
        "demo request routing",
        "lead assignment"
      ],
      "useCases": [
        "a pricing or enterprise contact request that needs an owner",
        "a self-serve request that continues automatically without a person"
      ]
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
        idempotencyKey: "account_id + lead_id + a.resolve",
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
        execution: "human",
        idempotencyKey: "account_id + lead_id + a.assign",
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
        contract: {
          "requiredFields": [
            "account_id",
            "lead_id",
            "handed_at",
            "reason"
          ]
        },
      },
      {
        id: "h.automated",
        kind: "handoff",
        to: "external:automated-continuation",
        on: "a self-serve request that needs no human judgement",
        carries: ["the request and its context", "the resolved account link"],
        contract: {
          "requiredFields": [
            "account_id",
            "lead_id",
            "handed_at",
            "reason"
          ]
        },
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
    channels: [],
    name: "Qualification state change → route, re-route or exit",
    shortName: "Qualification State Routing",
    purpose:
      "Treat qualification as a reversible state whose routing depends on why it changed, rather than a label applied once and trusted afterwards.",
    entity: {
      scope: "lead, account or opportunity",
      note: "Qualification is held per commercial relationship. The same person can be qualified for one offering and not another.",
      instanceKey: [
        "lead_id"
      ],
      concurrency: "one-active-per-key"
    },
    distinctFrom: [
      {
        journey: "ACQ-10",
        because:
          "ACQ-10 handles a decision the other side made. This handles a decision our own qualification made, which can be reversed by new information without anyone changing their mind.",
      },
    ],
    objective: "Treat qualification as a reversible state whose routing depends on why it changed, rather than a label applied once and trusted afterwards.",
    eligibility: [
      "an authoritative transition between UNQUALIFIED, QUALIFYING, QUALIFIED, DISQUALIFIED and RECYCLE_ELIGIBLE, carrying the reason it changed",
      "no instance of this journey is already open for the lead",
      "hard gates (GLB-31) allow communication for this purpose"
    ],
    suppressions: [
      {
        "id": "s.g1",
        "label": "CANONICAL_RULE",
        "text": "Disqualified is not permanently dead unless the reason is terminal. Four reasons arrive at the same label and only one of them ends anything."
      },
      {
        "id": "s.g2",
        "label": "CANONICAL_RULE",
        "text": "A qualification state is never written without its reason, and never overwrites the reason that came before it."
      },
      {
        "id": "s.g3",
        "label": "CANONICAL_RULE",
        "text": "A recycle is tied to a condition or a date that was actually recorded. Where none exists, no follow-up schedule is invented to stand in for one."
      }
    ],
    implementation: {
      "attributes": {
        "required": [
          "lead_id",
          "qualification_state",
          "state_reason",
          "recycle_horizon_at",
          "requirement_validity_ends_at",
          "qualification_history"
        ],
        "optional": []
      }
    },
    measurement: {
      "journeyOutcome": {
        "type": "exit-or-handoff",
        "refs": [
          "x.in-progress",
          "x.not-yet",
          "x.terminal",
          "x.recycled",
          "x.recycle-expired",
          "x.requirement-lapsed",
          "h.destination",
          "h.merge"
        ]
      },
      "secondary": [],
      "guardrails": [
        "state_written_on_stale_entity"
      ],
      "operational": [
        "entry_volume",
        "exit_distribution",
        "no_action_rate_by_reason",
        "time_to_exit"
      ]
    },
    discovery: {
      "aliases": [
        "qualification state routing",
        "lead qualification",
        "MQL and SQL state",
        "disqualification routing",
        "lead recycling"
      ],
      "useCases": [
        "a lead disqualified for timing that should re-enter on a recorded date",
        "a qualification reached and routed to its commercial destination"
      ]
    },
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
        idempotencyKey: "lead_id + a.read",
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
        contract: {
          "requiredFields": [
            "account_id",
            "lead_id",
            "handed_at",
            "reason"
          ]
        },
      },
      {
        id: "x.in-progress",
        kind: "exit",
        state: "qualifying, no commercial escalation yet",
        terminal: false,
        reEntry: "the next authoritative state change opens a new instance",
        class: "no-action",
      },
      {
        id: "x.not-yet",
        kind: "exit",
        state: "unqualified, nothing ruling it out",
        terminal: false,
        reEntry: "new evidence can move this to QUALIFYING without anything having to be undone first",
        class: "no-action",
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
        class: "invalid-state",
      },
      {
        id: "a.mark-recycle",
        kind: "action",
        does: "Record RECYCLE_ELIGIBLE with the timing reason and the condition or date that would make it worth revisiting, so the return is tied to something real rather than to a cadence",
        writes: [{ field: "qualification_history", mode: "append" }],
        next: "w.recycle",
        idempotencyKey: "lead_id + a.mark-recycle",
      },
      {
        id: "w.recycle",
        kind: "wait",
        until: [
          "reentry_condition_met"
        ],
        onEvent: "a.requalify",
        timeout: {
          "after": {
            "key": "qualification_state.recycle",
            "rule": "A recycle is tied to the condition or date recorded alongside the reason; the wait ends at that recorded horizon and nothing invents one.",
            "class": "attribute-bound",
            "required": true
          },
          "reason": "a recycle condition that never arrives is a dead record held open; the horizon closes it honestly rather than leaving it pending",
          "relativeTo": "attribute",
          "attribute": "recycle_horizon_at"
        },
        onTimeout: "x.recycle-expired",
        windowExtendsOnEngagement: false,
        recheck: "the lead re-read from the system of record before acting on the timeout",
      },
      {
        id: "a.requalify",
        kind: "action",
        does: "Move the state to QUALIFYING with the recycle reason attached, which is itself an authoritative state change and opens a new instance of this journey",
        writes: [{ field: "qualification_history", mode: "append" }],
        next: "x.recycled",
        idempotencyKey: "lead_id + a.requalify",
      },
      {
        id: "x.recycled",
        kind: "exit",
        state: "re-entered qualification",
        terminal: false,
        reEntry: "already re-entered; the new instance owns what follows",
        class: "success",
      },
      {
        id: "x.recycle-expired",
        kind: "exit",
        state: "recycle horizon passed without the condition being met",
        terminal: false,
        reEntry: "a new inbound signal can start qualification again from the beginning, with the old history intact",
        class: "timeout",
      },
      {
        id: "w.requirement",
        kind: "wait",
        until: [
          "named_requirement_satisfied"
        ],
        onEvent: "a.requalify",
        timeout: {
          "after": {
            "key": "qualification_state.requirement",
            "rule": "The validity horizon of the requirement.",
            "class": "attribute-bound",
            "required": true
          },
          "reason": "an unmet requirement with no deadline keeps an account in a state that is neither pursued nor closed",
          "relativeTo": "attribute",
          "attribute": "requirement_validity_ends_at"
        },
        onTimeout: "x.requirement-lapsed",
        windowExtendsOnEngagement: false,
        recheck: "the lead re-read from the system of record before acting on the timeout",
      },
      {
        id: "x.requirement-lapsed",
        kind: "exit",
        state: "disqualified, requirement never met",
        terminal: false,
        reEntry: "satisfying the requirement later is a new authoritative state change and re-enters normally",
        class: "timeout",
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
        contract: {
          "requiredFields": [
            "account_id",
            "lead_id",
            "handed_at",
            "reason"
          ]
        },
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
    channels: [],
    name: "Dynamic eligibility → eligible or ineligible → consequence",
    shortName: "Eligibility Recalculation",
    purpose:
      "Re-decide eligibility as the underlying data changes, and separate what it forbids next from what it does not undo.",
    entity: {
      scope: "person, account or the business entity the rule is about",
      note: "Eligibility is evaluated per rule and per entity; losing it for one programme says nothing about another.",
      instanceKey: [
        "entity_ref",
        "rule_id"
      ],
      concurrency: "one-active-per-key"
    },
    distinctFrom: [
      {
        journey: "ACQ-05",
        because:
          "Qualification asks whether we want this relationship. Eligibility asks whether the rules permit a specific action, which can flip repeatedly while qualification never moves.",
      },
    ],
    objective: "Re-decide eligibility as the underlying data changes, and separate what it forbids next from what it does not undo.",
    eligibility: [
      "a change in data an eligibility rule reads, or a scheduled re-evaluation of that rule",
      "no instance of this journey is already open for the person",
      "hard gates (GLB-31) allow communication for this purpose"
    ],
    suppressions: [
      {
        "id": "s.g1",
        "label": "CANONICAL_RULE",
        "text": "Eligibility is not availability. Being permitted to have something says nothing about whether it can currently be supplied."
      },
      {
        "id": "s.g2",
        "label": "CANONICAL_RULE",
        "text": "Eligibility is not an entitlement already granted. Losing the first does not retract the second."
      },
      {
        "id": "s.g3",
        "label": "CANONICAL_RULE",
        "text": "A future eligibility loss does not automatically invalidate an existing obligation; the obligation is reconciled on its own terms."
      },
      {
        "id": "s.g4",
        "label": "CANONICAL_RULE",
        "text": "Every eligibility result names the rule and the input that produced it. A bare no cannot be explained, appealed or debugged."
      }
    ],
    implementation: {
      "attributes": {
        "required": [
          "entity_ref",
          "rule_id",
          "rule_inputs",
          "eligibility_decisions",
          "outstanding_commitments"
        ],
        "optional": []
      }
    },
    measurement: {
      "journeyOutcome": {
        "type": "exit-or-handoff",
        "refs": [
          "x.eligible",
          "x.ineligible",
          "h.reconcile"
        ]
      },
      "secondary": [],
      "guardrails": [
        "state_written_on_stale_entity"
      ],
      "operational": [
        "entry_volume",
        "exit_distribution",
        "no_action_rate_by_reason",
        "time_to_exit"
      ]
    },
    discovery: {
      "aliases": [
        "eligibility recalculation",
        "dynamic eligibility",
        "eligibility rule re-evaluation",
        "entitlement eligibility check"
      ],
      "useCases": [
        "an offer eligibility that changes when the data behind it changes",
        "eligibility lost while a granted entitlement or commitment still stands"
      ]
    },
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
          insufficientAlone: [
            "a change in data that no eligibility rule reads",
            "a re-evaluation with no rule input changed and no schedule behind it",
            "a score or segment moving without the rule that decides eligibility being re-run"
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
        idempotencyKey: "entity_ref + rule_id + a.evaluate",
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
        class: "success",
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
        idempotencyKey: "entity_ref + rule_id + a.reconcile",
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
        contract: {
          "requiredFields": [
            "account_id",
            "person_id",
            "handed_at",
            "reason"
          ]
        },
      },
      {
        id: "a.block",
        kind: "action",
        does: "Prevent new actions the rule now forbids, naming the rule in the block so the reason travels with the refusal instead of surfacing as an unexplained failure",
        writes: [{ field: "eligibility_decisions", mode: "append" }],
        next: "x.ineligible",
        idempotencyKey: "entity_ref + rule_id + a.block",
      },
      {
        id: "x.ineligible",
        kind: "exit",
        state: "ineligible for new actions, nothing outstanding reversed",
        terminal: false,
        reEntry: "restored eligibility is an ordinary re-evaluation and needs no special case",
        class: "success",
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
    channels: [],
    name: "Intent decay → de-prioritise → cooldown or exit",
    shortName: "Intent Decay",
    purpose:
      "Let a recorded high-intent state expire when the evidence behind it goes stale, instead of pursuing someone on the strength of something they did once.",
    entity: {
      scope: "person plus the intent context that was recorded",
      note: "Decay is per intent context. A stale interest in one product does not lower the intent recorded against another.",
      instanceKey: [
        "person_id",
        "intent_context_id"
      ],
      concurrency: "one-active-per-key"
    },
    distinctFrom: [
      {
        journey: "ACQ-10",
        because:
          "Nobody said no here. Decay is the absence of continuing evidence, and it must not be recorded as a decision the person never made.",
      },
    ],
    objective: "Let a recorded high-intent state expire when the evidence behind it goes stale, instead of pursuing someone on the strength of something they did once.",
    eligibility: [
      "a recorded qualified or high-intent state whose supporting evidence is now older than the freshness window for that signal type",
      "no instance of this journey is already open for the person plus the intent context that was recorded",
      "hard gates (GLB-31) allow communication for this purpose"
    ],
    suppressions: [
      {
        "id": "s.g1",
        "label": "CANONICAL_RULE",
        "text": "An old pricing visit does not create a permanent high-intent flag. Evidence expires whether or not anything replaces it."
      },
      {
        "id": "s.g2",
        "label": "CANONICAL_RULE",
        "text": "Intent decay does not change marketing permission. Consent was given deliberately and is only withdrawn deliberately."
      },
      {
        "id": "s.g3",
        "label": "CANONICAL_RULE",
        "text": "Decay is not a decline. Nothing here writes a negative outcome against a person who simply went quiet."
      },
      {
        "id": "s.g4",
        "label": "CANONICAL_RULE",
        "text": "A new strong signal can establish a new intent state; the decayed one does not have to be argued away first."
      }
    ],
    implementation: {
      "attributes": {
        "required": [
          "person_id",
          "intent_context_id",
          "intent_state",
          "supporting_evidence",
          "freshness_threshold",
          "intent_history"
        ],
        "optional": []
      }
    },
    measurement: {
      "journeyOutcome": {
        "type": "exit-or-handoff",
        "refs": [
          "x.unchanged",
          "x.cooled",
          "h.customer",
          "h.re-escalate"
        ]
      },
      "secondary": [],
      "guardrails": [
        "state_written_on_stale_entity"
      ],
      "operational": [
        "entry_volume",
        "exit_distribution",
        "no_action_rate_by_reason",
        "time_to_exit"
      ]
    },
    discovery: {
      "aliases": [
        "intent decay",
        "lead decay",
        "intent expiry",
        "stale intent de-prioritisation"
      ],
      "useCases": [
        "a pricing visit months ago that still marks someone as high intent",
        "letting intent expire without writing a negative outcome"
      ]
    },
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
          insufficientAlone: [
            "a fixed number of days since a signal, applied without reading the signal's own freshness",
            "quiet in one channel while intent is being renewed elsewhere",
            "a decline, which is a decision and belongs to decline routing"
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
        class: "no-action",
      },
      {
        id: "a.downgrade",
        kind: "action",
        does: "Lower the intent classification to what the evidence now supports, and record why. Marketing permission is untouched: intent that decayed is not consent that was withdrawn, and the two are stored separately for exactly this moment",
        writes: [{ field: "intent_history", mode: "append" }],
        next: "a.suppress",
        idempotencyKey: "person_id + a.downgrade",
      },
      {
        id: "a.suppress",
        kind: "action",
        does: "Stop follow-up written for the higher intent, including anything already queued at that priority",
        writes: [{ field: "suppressed_sends", mode: "append" }],
        next: "c.relationship",
        idempotencyKey: "person_id + a.suppress",
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
        contract: {
          "requiredFields": [
            "person_id",
            "handed_at",
            "reason"
          ]
        },
      },
      {
        id: "w.cooldown",
        kind: "wait",
        until: [
          "strong_intent_signal"
        ],
        onEvent: "h.re-escalate",
        timeout: {
          "after": {
            "key": "intent_decay.cooldown",
            "rule": "The cooldown horizon for this intent context; a new strong signal inside it re-escalates, and its end closes the decayed intent with no decision recorded.",
            "class": "cooldown",
            "required": true
          },
          "reason": "a cooldown with no end is a permanent hold under a friendlier name",
          "relativeTo": "trigger"
        },
        onTimeout: "x.cooled",
        windowExtendsOnEngagement: false,
        recheck: "the person plus the intent context that was recorded re-read from the system of record before acting on the timeout",
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
        class: "timeout",
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
    channels: [],
    name: "Commercial destination reached → acquisition suppression → lifecycle handoff",
    shortName: "Acquisition Exit Handoff",
    purpose:
      "Make acquisition give up ownership the moment the outcome it existed to cause is recorded, and stop what it has already queued.",
    entity: {
      scope: "person or account plus the destination entity",
      note: "The whole journey turns on this scope. The order, subscription, booking or application that completed is what gets closed out - not everything the person was ever in.",
      instanceKey: [
        "person_id",
        "destination_entity_id"
      ],
      concurrency: "one-active-per-key"
    },
    distinctFrom: [
      {
        journey: "ACQ-03",
        because:
          "Escalation re-ranks journeys that are all still live. This one ends a class of them, because the objective they shared has been met.",
      },
    ],
    objective: "Make acquisition give up ownership the moment the outcome it existed to cause is recorded, and stop what it has already queued.",
    eligibility: [
      "a recorded business fact: trial started, subscription started, purchase completed, booking confirmed, application submitted, or an opportunity created where that is the destination",
      "no instance of this journey is already open for the person or account plus the destination entity",
      "hard gates (GLB-31) allow communication for this purpose"
    ],
    suppressions: [
      {
        "id": "s.g1",
        "label": "CANONICAL_RULE",
        "text": "An email click is not a conversion. A landing page visit is not a conversion. Only the system of record decides that the destination was reached."
      },
      {
        "id": "s.g2",
        "label": "CANONICAL_RULE",
        "text": "Suppression is scoped to the entity: one order completing does not close the journeys about a different order."
      },
      {
        "id": "s.g3",
        "label": "CANONICAL_RULE",
        "text": "Suppression reaches sends that are already queued, not only future scheduling."
      }
    ],
    implementation: {
      "attributes": {
        "required": [
          "person_id",
          "destination_entity_id",
          "destination_event",
          "queued_acquisition_sends",
          "suppressed_sends"
        ],
        "optional": []
      }
    },
    measurement: {
      "journeyOutcome": {
        "type": "exit-or-handoff",
        "refs": [
          "x.not-conversion",
          "h.next"
        ]
      },
      "secondary": [],
      "guardrails": [
        "state_written_on_stale_entity"
      ],
      "operational": [
        "entry_volume",
        "exit_distribution",
        "no_action_rate_by_reason",
        "time_to_exit"
      ]
    },
    discovery: {
      "aliases": [
        "acquisition exit",
        "conversion handoff",
        "acquisition suppression on conversion",
        "stop marketing on purchase"
      ],
      "useCases": [
        "a purchase or trial start that must stop every queued acquisition send",
        "scoping the suppression to the entity that converted"
      ]
    },
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
        class: "invalid-state",
      },
      {
        id: "a.scope",
        kind: "action",
        does: "Resolve the entity the destination belongs to - the order, subscription, booking or application - so that everything after this is scoped to it",
        writes: [{ field: "destination_entity", mode: "set" }],
        next: "a.identify",
        idempotencyKey: "person_id + destination_entity_id + a.scope",
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
        idempotencyKey: "person_id + destination_entity_id + a.suppress",
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
        contract: {
          "requiredFields": [
            "person_id",
            "destination_entity_id",
            "handed_at",
            "reason"
          ]
        },
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
    channels: ["email", "in-app"],
    name: "Researching lead → bounded education → progress or sunset",
    shortName: "Lead Nurture",
    purpose:
      "Give a legitimate but not-yet-ready lead a window of useful education that ends whether or not it worked.",
    entity: {
      scope: "lead or person, held against the reason they entered",
      note: "The entry reason is the subject: education answers the question they arrived with, and when the window closes it closes for that reason rather than for the person forever.",
      instanceKey: [
        "lead_id"
      ],
      concurrency: "one-active-per-key"
    },
    distinctFrom: [
      {
        journey: "ACQ-07",
        because:
          "Decay retires an intent state that has gone stale. This spends a deliberately fixed window trying to advance one, and only then closes it.",
      },
    ],
    objective: "Give a legitimate but not-yet-ready lead a window of useful education that ends whether or not it worked.",
    eligibility: [
      "a captured lead with a recorded entry reason and no destination it is ready for",
      "no instance of this journey is already open for the lead or person",
      "hard gates (GLB-31) allow communication for this purpose"
    ],
    suppressions: [
      {
        "id": "s.g1",
        "label": "CANONICAL_RULE",
        "text": "Nurture does not run forever. The window is bounded at entry and it closes on time."
      },
      {
        "id": "s.g2",
        "label": "CANONICAL_RULE",
        "text": "Engagement inside the window does not extend it. Opening the emails is not progress toward the destination."
      },
      {
        "id": "s.g3",
        "label": "CANONICAL_RULE",
        "text": "Education answers the reason the person entered. A generic sequence sent to everyone is the thing this journey exists instead of."
      },
      {
        "id": "s.g4",
        "label": "CANONICAL_RULE",
        "text": "No permission, no nurture. The capture is not the consent."
      }
    ],
    contact: {
      "defaultPriority": "promotional",
      "pressureClass": "promotional",
      "localCap": {
        "value": {
          "key": "bounded_education.touches",
          "rule": "The number of educational touches inside the bounded window is fixed when the lead enters and is never extended by engagement inside it.",
          "required": true
        },
        "appliesTo": "all"
      },
      "cooldown": {
        "key": "bounded_education.cooldown",
        "rule": "The cooldown between instances of this journey for the same lead or person, so that a re-qualifying lead or person is tracked but not messaged again inside it.",
        "class": "cooldown",
        "required": true
      },
      "competition": "none"
    },
    channelStrategy: {
      "roles": [
        {
          "role": "in-session",
          "channels": [
            "in-app"
          ],
          "when": "the person is active in the product and the action is taken there"
        },
        {
          "role": "persistent",
          "channels": [
            "email"
          ],
          "when": "no active session - the message has to be kept and survive until the person returns to act on it"
        }
      ],
      "fallback": "same-role-other-channel",
      "label": "RECOMMENDED_DEFAULT"
    },
    orchestration: {
      "strategy": "single-notice",
      "touches": [
        {
          "id": "t1",
          "stage": "educate",
          "action": "a.educate",
          "prerequisites": [
            "c.basis"
          ],
          "purpose": "Send education matched to the reason the person actually entered - not a generic sequence, and not sales pressure repeated at intervals",
          "channelRoles": [
            "in-session",
            "persistent"
          ],
          "mandatory": false,
          "label": "CANONICAL_RULE"
        }
      ],
      "noAction": [
        "s.g1",
        "s.g2",
        "s.g3",
        "s.g4"
      ]
    },
    implementation: {
      "attributes": {
        "required": [
          "lead_id",
          "person_id",
          "entry_reason",
          "permission_position",
          "window_ends_at",
          "nurture_history"
        ],
        "optional": []
      }
    },
    measurement: {
      "journeyOutcome": {
        "type": "exit-or-handoff",
        "refs": [
          "x.no-basis",
          "x.permission-ended",
          "x.unreachable",
          "x.sunset",
          "h.progressed"
        ]
      },
      "businessOutcome": {
        "event": "nurture_progression_signal",
        "unit": "instance",
        "observationScope": {
          "type": "self"
        },
        "window": {
          "type": "until-exit"
        },
        "attribution": "touched-before-event",
        "comparison": "pre-post"
      },
      "secondary": [],
      "guardrails": [
        "complaint",
        "message_after_success",
        "unsubscribe"
      ],
      "operational": [
        "entry_volume",
        "exit_distribution",
        "no_action_rate_by_reason",
        "time_to_exit"
      ]
    },
    discovery: {
      "aliases": [
        "lead nurture",
        "nurture sequence",
        "drip education",
        "researching lead nurture",
        "top-of-funnel nurture"
      ],
      "useCases": [
        "a lead with a recorded reason for entering and no destination it is ready for",
        "education that answers that reason and ends on a fixed window"
      ]
    },
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
          insufficientAlone: [
            "a lead that is ready for a destination and simply has not been routed yet, which is ACQ-04's case",
            "a submission with no permission for ongoing contact recorded against it",
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
        class: "no-action",
      },
      {
        id: "a.educate",
        kind: "action",
        does: "Send education matched to the reason the person actually entered - not a generic sequence, and not sales pressure repeated at intervals",
        next: "w.window",
        execution: "communication",
        idempotencyKey: "lead_id + person_id + a.educate",
      },
      {
        id: "w.window",
        kind: "wait",
        until: [
          "nurture_progression_signal",
          "permission_withdrawn",
          "contactability_lost"
        ],
        onEvent: "c.window-event",
        timeout: {
          "after": {
            "key": "bounded_education.window",
            "rule": "The bounded nurture window is fixed when the lead enters and ends whether or not the education worked; engagement inside it does not extend it.",
            "class": "observation-window",
            "required": true
          },
          "reason": "the window is what makes this nurture rather than a permanent messaging state, and it is set once at entry",
          "relativeTo": "trigger"
        },
        onTimeout: "a.sunset",
        windowExtendsOnEngagement: false,
        recheck: "the lead or person re-read from the system of record before acting on the timeout",
      },
      {
        id: "c.window-event",
        kind: "condition",
        asks: "What ended the wait?",
        branches: [
          {
            label: "They progressed",
            when: "a meaningful progression signal arrived",
            to: "h.progressed",
          },
          {
            label: "Permission withdrawn",
            when: "the lawful basis or permission this nurture relied on no longer covers it",
            to: "a.stop-permission",
          },
          {
            label: "Route lost",
            when: "no permitted destination for this person is deliverable any more",
            to: "a.stop-contactability",
          },
        ],
      },
      {
        id: "a.stop-permission",
        kind: "action",
        does: "Invalidate the nurture already queued against this instance and append the reason. A window that only ends on progression or its own clock keeps sending after the permission it depended on has gone",
        next: "x.permission-ended",
      },
      {
        id: "a.stop-contactability",
        kind: "action",
        does: "Stop this nurture route without recording it as disengagement. A destination that stopped working says nothing about whether the person is still interested, and filing route failure as a lack of interest loses a lead twice",
        next: "x.unreachable",
      },
      {
        id: "x.permission-ended",
        kind: "exit",
        state: "nurture stopped; permission no longer covers it",
        terminal: false,
        reEntry: "a new valid permission plus a new qualifying reason starts a new window",
        class: "suppression",
      },
      {
        id: "x.unreachable",
        kind: "exit",
        state: "nurture stopped; no permitted route is deliverable",
        terminal: false,
        reEntry: "a repaired or newly permitted route, while the entry reason is still live, resumes nurture",
        class: "suppression",
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
        idempotencyKey: "lead_id + person_id + a.sunset",
      },
      {
        id: "x.sunset",
        kind: "exit",
        state: "nurture window closed without progression",
        terminal: false,
        reEntry:
          "a new inbound signal or a newly declared request can open a new window; immediate re-entry into the same education is suppressed",
        class: "timeout",
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
    channels: [],
    name: "Explicit commercial decline → reason → terminal, cooldown or recycle",
    shortName: "Commercial Decline Routing",
    purpose:
      "Route a negative commercial outcome by its cause rather than filing every one of them under lost.",
    entity: {
      scope: "lead, opportunity or account",
      note: "The decline belongs to the opportunity it was given about. A different opportunity with the same account is not declined by it.",
      instanceKey: [
        "lead_id",
        "decline_id"
      ],
      concurrency: "one-active-per-key"
    },
    distinctFrom: [
      {
        journey: "ACQ-07",
        because:
          "Someone decided something here. Where the recorded reason turns out to be silence rather than a decision, this journey hands it to decay instead of treating it as one.",
      },
    ],
    objective: "Route a negative commercial outcome by its cause rather than filing every one of them under lost.",
    eligibility: [
      "a decline stated by the person or account, or a lost outcome recorded in the system of record",
      "no instance of this journey is already open for the lead",
      "hard gates (GLB-31) allow communication for this purpose"
    ],
    suppressions: [
      {
        "id": "s.g1",
        "label": "CANONICAL_RULE",
        "text": "The lost reason history is preserved. Routing depends on it, so overwriting it destroys the ability to route at all."
      },
      {
        "id": "s.g2",
        "label": "CANONICAL_RULE",
        "text": "Not now is not never. Only a terminal reason ends acquisition permanently."
      },
      {
        "id": "s.g3",
        "label": "CANONICAL_RULE",
        "text": "A declined opportunity is not swept into generic marketing as a consolation."
      },
      {
        "id": "s.g4",
        "label": "CANONICAL_RULE",
        "text": "Where no re-entry condition was recorded, none is invented. The absence of a date is not an invitation to pick one."
      }
    ],
    implementation: {
      "attributes": {
        "required": [
          "lead_id",
          "decline_id",
          "reason_family",
          "reentry_at",
          "decline_history"
        ],
        "optional": []
      }
    },
    measurement: {
      "journeyOutcome": {
        "type": "exit-or-handoff",
        "refs": [
          "x.terminal",
          "x.cooldown",
          "h.decay",
          "h.classify",
          "h.requalify"
        ]
      },
      "secondary": [],
      "guardrails": [
        "state_written_on_stale_entity"
      ],
      "operational": [
        "entry_volume",
        "exit_distribution",
        "no_action_rate_by_reason",
        "time_to_exit"
      ]
    },
    discovery: {
      "aliases": [
        "commercial decline routing",
        "closed-lost routing",
        "lost reason handling",
        "closed-lost recycling"
      ],
      "useCases": [
        "a declined opportunity whose reason says when to try again",
        "a loss for silence routed to intent decay rather than filed as lost"
      ]
    },
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
        idempotencyKey: "lead_id + decline_id + a.capture",
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
        class: "invalid-state",
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
        until: [
          "reentry_condition_met"
        ],
        onEvent: "h.requalify",
        timeout: {
          "after": {
            "key": "commercial_decline.reentry",
            "rule": "The re-entry wait ends at the event, date or condition recorded alongside the reason; nothing is scheduled where none is known.",
            "class": "attribute-bound",
            "required": true
          },
          "reason": "a re-entry condition that never arrives closes rather than waiting indefinitely",
          "relativeTo": "attribute",
          "attribute": "reentry_at"
        },
        onTimeout: "x.cooldown",
        windowExtendsOnEngagement: false,
        recheck: "the lead re-read from the system of record before acting on the timeout",
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
        class: "no-action",
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
  {
    id: "ACQ-285",
    slug: "captured-interest-first-touch",
    category: "acquisition",
    goal: "routing-assignment",
    channels: ["email"],
    name: "Captured interest → readiness check → destination-appropriate first touch",
    shortName: "New Lead Welcome",
    purpose:
      "Answer a declared interest with the thing that interest actually asked for, and carry it onward only as far as what the person said about themselves justifies.",
    entity: {
      scope: "the individual capture and what it asked for, resolved onto a person",
      note: "One capture, one destination. A second, different request from the same person is its own instance and is not considered answered by what the first one produced.",
      instanceKey: [
        "capture_id"
      ],
      concurrency: "one-active-per-key"
    },
    distinctFrom: [
      {
        journey: "ACQ-02",
        because:
          "ACQ-02 decides which destination a capture justifies and records that decision with its own state. This journey is what the person receives once that decision exists, and it invents no destination of its own.",
      },
    ],
    objective: "Answer a declared interest with the thing that interest actually asked for, and carry it onward only as far as what the person said about themselves justifies.",
    eligibility: [
      "a first-party capture recorded with the context the person declared",
      "a contact point the person gave in that capture",
      "the permission position recorded as its own fact, separate from the submission",
      "no instance of this journey is already open for the the individual capture and what it asked for",
      "hard gates (GLB-31) allow communication for this purpose"
    ],
    suppressions: [
      {
        "id": "s.g1",
        "label": "CANONICAL_RULE",
        "text": "A capture records interest, not a decision. Nothing downstream treats it as one."
      },
      {
        "id": "s.g2",
        "label": "CANONICAL_RULE",
        "text": "The submission and the permission are two facts, and only one of them may have happened."
      },
      {
        "id": "s.g3",
        "label": "CANONICAL_RULE",
        "text": "Not every capture earns a person. The destination comes from what was declared, not from what the pipeline is short of."
      },
      {
        "id": "s.g4",
        "label": "CANONICAL_RULE",
        "text": "A bounded sequence states its end when it opens and stops there, whether or not anything came of it."
      }
    ],
    contact: {
      "defaultPriority": "promotional",
      "pressureClass": "promotional",
      "localCap": {
        "value": {
          "key": "captured_interest.touches",
          "rule": "Every touch runs against a budget fixed when the instance opened; the budget is the plan's own length, and no touch is repeated because nothing could tell whether it arrived.",
          "default": {
            "value": 3,
            "confidence": "high",
            "basis": "corpus-rule",
            "applicableWhen": "GLB-24; the graph's own touch count"
          },
          "required": false
        },
        "appliesTo": "all"
      },
      "cooldown": {
        "key": "captured_interest.cooldown",
        "rule": "Fulfilment is per capture; a further capture is its own instance and no cooldown applies between captures.",
        "default": {
          "value": "none",
          "confidence": "high",
          "basis": "corpus-rule"
        },
        "required": false
      },
      "competition": "none"
    },
    channelStrategy: {
      "roles": [
        {
          "role": "persistent",
          "channels": [
            "email"
          ],
          "when": "the message has to be kept and survive until the person can act on it"
        }
      ],
      "fallback": "same-role-other-channel",
      "label": "RECOMMENDED_DEFAULT"
    },
    orchestration: {
      "strategy": "notice-then-confirm",
      "touches": [
        {
          "id": "t1",
          "stage": "first-touch",
          "action": "a.first-touch",
          "prerequisites": [
            "c.email-route",
            "c.declared"
          ],
          "purpose": "Send what they asked for and say that a person will follow up, naming when.",
          "channelRoles": [
            "persistent"
          ],
          "mandatory": false,
          "label": "CANONICAL_RULE"
        },
        {
          "id": "t2",
          "stage": "deliver",
          "action": "a.deliver",
          "prerequisites": [
            "c.email-route",
            "c.declared"
          ],
          "purpose": "Send exactly what the capture asked for, once, and nothing the person did not ask for alongside it.",
          "channelRoles": [
            "persistent"
          ],
          "mandatory": false,
          "label": "CANONICAL_RULE"
        },
        {
          "id": "t3",
          "stage": "nurture",
          "action": "a.nurture",
          "after": "t2",
          "prerequisites": [
            "c.email-route",
            "c.declared",
            "c.permission"
          ],
          "purpose": "Open a bounded sequence on the subject they declared, and state where it ends when it opens.",
          "channelRoles": [
            "persistent"
          ],
          "mandatory": false,
          "label": "CANONICAL_RULE",
          "destination": {
            "target": "declared-subject-content",
            "boundTo": "capture_id",
            "mustNotClaim": [
              "a sequence with no stated end"
            ]
          }
        }
      ],
      "noAction": [
        "s.g1",
        "s.g2",
        "s.g3",
        "s.g4"
      ]
    },
    implementation: {
      "attributes": {
        "required": [
          "capture_id",
          "person_id",
          "declared_request",
          "contact_point",
          "permission_position",
          "sequence_length"
        ],
        "optional": []
      }
    },
    measurement: {
      "journeyOutcome": {
        "type": "exit-or-handoff",
        "refs": [
          "x.no-delivery-route",
          "x.stopped",
          "x.sunset",
          "x.delivered",
          "h.person"
        ]
      },
      "secondary": [],
      "guardrails": [
        "complaint",
        "message_after_success",
        "unsubscribe"
      ],
      "operational": [
        "entry_volume",
        "exit_distribution",
        "no_action_rate_by_reason",
        "time_to_exit"
      ],
      "businessOutcome": {
        "event": "destination_declared",
        "unit": "instance",
        "observationScope": {
          "type": "self"
        },
        "window": {
          "type": "until-exit"
        },
        "attribution": "touched-before-event",
        "comparison": "pre-post"
      }
    },
    discovery: {
      "aliases": [
        "new lead welcome",
        "welcome email",
        "lead capture fulfilment",
        "content download delivery",
        "welcome sequence"
      ],
      "useCases": [
        "a content request answered with exactly what was asked for",
        "a request to talk to a person, answered once and handed to sales"
      ]
    },
    entry: "t.captured",
    nodes: [
      {
        id: "t.captured",
        kind: "trigger",
        event: "first_party_interest_captured",
        evidence: {
          requires: [
            "a first-party capture recorded with the context the person declared",
            "a contact point the person gave in that capture",
            "the permission position recorded as its own fact, separate from the submission",
          ],
          insufficientAlone: [
            "a session or a page view with no declaration in it",
            "a contact point obtained from a third party",
            "a submitted form read as permission because it was submitted",
          ],
          source: "declared",
        },
        next: "c.email-route",
      },
      {
        id: "c.email-route",
        kind: "condition",
        asks: "Is the destination they supplied actually usable for this?",
        branches: [
          {
            label: "Usable",
            when: "the supplied destination is valid, deliverable and permitted for fulfilling what was asked for",
            to: "c.declared",
          },
          {
            label: "Not usable",
            when: "no valid deliverable destination was supplied, or it is not permitted for this fulfilment",
            to: "c.declared-no-route",
          },
        ],
      },
      {
        id: "c.declared-no-route",
        kind: "condition",
        asks: "What did they ask for, given we cannot deliver to them?",
        branches: [
          {
            label: "Asked for a person",
            when: "the request was for contact rather than for material",
            to: "h.person",
          },
          {
            label: "Asked for the material",
            when: "the request was for something we would have sent, and there is nowhere to send it",
            to: "x.no-delivery-route",
          },
        ],
      },
      {
        id: "x.no-delivery-route",
        kind: "exit",
        state: "captured with nothing deliverable; the request was not fulfilled",
        terminal: false,
        reEntry: "a valid permitted destination, supplied later, makes the same request fulfillable",
        class: "failure",
      },
      {
        id: "c.declared",
        kind: "condition",
        asks: "What did the person actually declare?",
        branches: [
          {
            label: "Asked for a person",
            when: "the capture states a request only a person can answer - a conversation, a price for their own situation, an assessment",
            to: "a.first-touch",
          },
          {
            label: "Asked for the material",
            when: "the capture asks for a document, an access or a notification and names no person-led request",
            to: "a.deliver",
          },
        ],
      },
      {
        id: "a.first-touch",
        kind: "action",
        does: "Send what they asked for and say that a person will follow up, naming when. A promised follow-up with no time on it reads as a queue rather than an answer, and the person starts again elsewhere",
        next: "h.person",
        execution: "communication",
        idempotencyKey: "person_id + a.first-touch",
      },
      {
        id: "h.person",
        kind: "handoff",
        to: "external:sales-assignment",
        on: "a captured interest whose declared request can only be answered by a person",
        carries: [
          "what the person declared and asked for, in their own terms",
          "what was already sent to them and when",
          "the permission facts recorded, and what they do and do not cover",
        ],
        contract: {
          "requiredFields": [
            "person_id",
            "handed_at",
            "reason"
          ]
        },
      },
      {
        id: "a.deliver",
        kind: "action",
        does: "Send exactly what the capture asked for, once, and nothing the person did not ask for alongside it. Fulfilment travels on the request; everything past it travels on permission, and the two must not be posted together",
        next: "c.permission",
        execution: "communication",
        idempotencyKey: "person_id + a.deliver",
      },
      {
        id: "c.permission",
        kind: "condition",
        asks: "Is there permission to continue past fulfilment?",
        branches: [
          {
            label: "Permitted",
            when: "a permission covering ongoing contact was given in the capture and recorded as its own fact",
            to: "a.nurture",
          },
          {
            label: "Fulfilment only",
            when: "nothing beyond the single requested delivery was permitted",
            to: "x.delivered",
          },
        ],
      },
      {
        id: "a.nurture",
        kind: "action",
        does: "Open a bounded sequence on the subject they declared, and state where it ends when it opens. A sequence with no stated end is a subscription nobody agreed to, and it is remembered as one",
        next: "w.nurture",
        execution: "communication",
        idempotencyKey: "person_id + a.nurture",
      },
      {
        id: "w.nurture",
        kind: "wait",
        until: [
          "destination_declared",
          "permission_withdrawn"
        ],
        onEvent: "c.progressed",
        timeout: {
          "after": {
            "key": "captured_interest.nurture",
            "rule": "The stated length of the bounded sequence.",
            "class": "observation-window",
            "required": true
          },
          "reason": "the end was stated when the sequence opened, and moving it silently is what turns interest into complaint",
          "relativeTo": "previous-touch"
        },
        onTimeout: "x.sunset",
        windowExtendsOnEngagement: false,
        recheck: "the the individual capture and what it asked for re-read from the system of record before acting on the timeout",
      },
      {
        id: "c.progressed",
        kind: "condition",
        asks: "What ended the sequence?",
        branches: [
          {
            label: "Readiness declared",
            when: "the person did something that names a destination they are now ready for",
            to: "h.person",
          },
          {
            label: "Stopped",
            when: "the person withdrew permission or asked to stop",
            to: "x.stopped",
          },
        ],
      },
      {
        id: "x.stopped",
        kind: "exit",
        state: "stopped at the person's request",
        terminal: true,
        reEntry: "a later capture carrying its own permission is a new instance; this one is never resumed",
        class: "suppression",
      },
      {
        id: "x.sunset",
        kind: "exit",
        state: "sequence ended, no destination declared",
        terminal: false,
        reEntry: "a later capture from the same person is its own instance with its own destination",
        class: "timeout",
      },
      {
        id: "x.delivered",
        kind: "exit",
        state: "fulfilled, no continuing contact permitted",
        terminal: false,
        reEntry: "a later capture that carries a permission opens the bounded path",
        class: "success",
      },
    ],
    guardrails: [
      "A capture records interest, not a decision. Nothing downstream treats it as one.",
      "The submission and the permission are two facts, and only one of them may have happened.",
      "Not every capture earns a person. The destination comes from what was declared, not from what the pipeline is short of.",
      "A bounded sequence states its end when it opens and stops there, whether or not anything came of it.",
    ],
    reusableRule:
      "What somebody asked for is the entire mandate for the first message, and everything after it needs a permission of its own.",
  },
  {
    "id": "ACQ-11",
    "slug": "abandoned-process-recovery",
    "category": "acquisition",
    "goal": "recovery-retry",
    "channels": [
      "email",
      "push",
      "in-app",
      "sms"
    ],
    "name": "Process started → abandonment confirmed → recovered, superseded or lapsed",
    "shortName": "Abandoned Process Recovery",
    "purpose": "Return a person to a resumable process they started and did not complete - a checkout, an application, a quote, a registration - while it is still resumable, without ever asserting a state the system does not hold.",
    "objective": "Bring the person back to the specific unfinished process and let them complete it; never claim reserved stock, a held price or a discount the system does not assert.",
    "entity": {
      "scope": "the logical process - the basket-and-checkout, application, quote or registration the person is trying to complete - not the platform's identifier for it",
      "note": "One instance per logical process. A platform that rotates its process id when the same basket resumes still has one process, and the company's mapping resolves the new id to the open instance rather than opening a second. Two different baskets are two processes; whether they may both be pursued is the supersession statement below.",
      "instanceKey": [
        "person_id",
        "logical_process_id"
      ],
      "concurrency": "one-active-per-key",
      "supersession": {
        "id": "s.supersession",
        "label": "RECOMMENDED_DEFAULT",
        "text": "A new logical process for the same person supersedes an open instance - two recovery sequences to one person about two baskets is the duplicate-communication failure. A company whose processes are genuinely independent (a marketplace, a B2B account with separate buyers) sets concurrency to many and lets the person-level pressure cap protect the person."
      }
    },
    "eligibility": [
      "the identity behind the process resolves to a person we may contact",
      "the process is still resumable in the system of record, with at least one item and a resume destination",
      "no recovery instance is already open for this logical process",
      "no payment failure is recorded on the process - a failed payment is FIN-134's, not abandonment",
      "purpose-level permission for commercial recovery communication is recorded, and hard gates (GLB-31) allow it"
    ],
    "suppressions": [
      {
        "id": "s.completed",
        "label": "CANONICAL_RULE",
        "text": "Exit the moment the process completes by any channel - in the product, in a store, by phone. A recovery message about a completed process is the failure this journey exists to prevent, and every touch re-reads the process first."
      },
      {
        "id": "s.invalid",
        "label": "CANONICAL_RULE",
        "text": "Exit when the process is cancelled by the person, expired by the platform, or emptied. Nothing is sent about a process the person cannot return to."
      },
      {
        "id": "s.payment",
        "label": "CANONICAL_RULE",
        "text": "A payment failure on the process hands the instance to payment failure recovery (FIN-134). The two never message the same person about the same process."
      },
      {
        "id": "s.permission",
        "label": "CANONICAL_RULE",
        "text": "No touch without purpose-level permission for commercial recovery communication; absent permission is a recorded no-action, never a fallback to another channel."
      },
      {
        "id": "s.contest",
        "label": "CANONICAL_RULE",
        "text": "An open retention-outreach journey, an open complaint or an open payment recovery on the same account outranks this journey; its touch is deferred and re-evaluated against current state, not queued blindly (GLB-06)."
      },
      {
        "id": "s.superseded",
        "label": "RECOMMENDED_DEFAULT",
        "text": "A newer logical process for the same person supersedes this instance (see the entity's supersession statement)."
      },
      {
        "id": "s.cooldown",
        "label": "RECOMMENDED_DEFAULT",
        "text": "A new process opened inside the cooldown after a lapsed or suppressed instance enters, is tracked, and sends nothing."
      },
      {
        "id": "s.incentive",
        "label": "OPTIONAL_STRATEGY",
        "text": "If the company enables an incentive (recovery.incentive_policy), it appears only on the last enabled touch, once, and its issuance is recorded per person so it cannot be re-issued on the next process. The library recommends none by default: an incentive on the first touch teaches abandonment."
      }
    ],
    "contact": {
      "defaultPriority": "promotional",
      "pressureClass": "promotional",
      "localCap": {
        "value": {
          "key": "recovery.touches",
          "rule": "Every touch runs against a budget fixed when the instance opened; the budget is the plan's own length, and no touch is repeated because nothing could tell whether it arrived.",
          "default": {
            "value": 3,
            "confidence": "medium",
            "basis": "corpus-rule",
            "applicableWhen": "GLB-24; two touches when the final notice is disabled"
          },
          "required": false
        },
        "appliesTo": "all"
      },
      "cooldown": {
        "key": "recovery.cooldown",
        "rule": "After a lapsed or suppressed instance, a new process by the same person is tracked but not messaged until the cooldown has passed. A completed process carries no cooldown.",
        "class": "cooldown",
        "default": {
          "value": {
            "min": "7 days",
            "max": "30 days"
          },
          "confidence": "low",
          "basis": "example-only",
          "applicableWhen": "repeat abandoners on considered purchases",
          "avoidWhen": "high-frequency replenishment purchases, where a short cooldown is honest"
        },
        "required": false
      },
      "competition": { "exclusionGroup": "commerce-recovery", "scope": "person", "precedence": "highest in the group - a process in motion outranks a held selection, an inferred interest or a predicted need for the same person" , "onLoss": "suppressed" }
    },
    "channelStrategy": {
      "roles": [
        {
          "role": "low-friction",
          "channels": [
            "push",
            "in-app"
          ],
          "when": "an app session or a valid push token exists for this person - the intent is minutes old and a nudge back beats content"
        },
        {
          "role": "persistent",
          "channels": [
            "email"
          ],
          "when": "no low-friction route exists, or the touch has to carry the items and survive until the person can act"
        },
        {
          "role": "urgent",
          "channels": [
            "sms"
          ],
          "when": "explicit commercial SMS permission exists and the process carries an asserted time-bound element - an expiry, a hold, a delivery cut-off"
        }
      ],
      "fallback": "same-role-other-channel",
      "label": "RECOMMENDED_DEFAULT"
    },
    "orchestration": {
      "strategy": "progressive-recovery",
      "touches": [
        {
          "id": "t1",
          "stage": "initial-recovery",
          "action": "a.touch1",
          "gatedBy": "w.abandon",
          "prerequisites": [
            "c.state",
            "c.sendable"
          ],
          "purpose": "The process is still open; here are the items; here is the link that reopens this exact process with its state restored. Nothing the system does not assert.",
          "channelRoles": [
            "low-friction",
            "persistent"
          ],
          "destination": {
            "target": "process-resume",
            "boundTo": "logical_process_id",
            "mustNotClaim": [
              "stock is reserved",
              "the price is held",
              "a discount applies"
            ]
          },
          "mandatory": false,
          "label": "CANONICAL_RULE"
        },
        {
          "id": "t2",
          "stage": "follow-up",
          "action": "a.touch2",
          "after": "t1",
          "gatedBy": "w.second",
          "prerequisites": [
            "c.state2",
            "c.sendable2"
          ],
          "purpose": "Address the likely blocker - shipping, returns, trust, a route to ask a question - with the same link. Still nothing the system does not assert.",
          "channelRoles": [
            "persistent",
            "low-friction"
          ],
          "destination": {
            "target": "process-resume",
            "boundTo": "logical_process_id",
            "mustNotClaim": [
              "stock is reserved",
              "the price is held",
              "a discount applies"
            ]
          },
          "mandatory": false,
          "label": "CANONICAL_RULE"
        },
        {
          "id": "t3",
          "stage": "final-notice",
          "action": "a.touch3",
          "after": "t2",
          "gatedBy": "w.final",
          "prerequisites": [
            "c.state3",
            "c.final-enabled"
          ],
          "purpose": "The last honest statement: the process closes at its real expiry, and here is the link. No urgency the system does not assert.",
          "channelRoles": [
            "persistent",
            "urgent"
          ],
          "destination": {
            "target": "process-resume",
            "boundTo": "logical_process_id",
            "mustNotClaim": [
              "an expiry the platform does not enforce",
              "stock is reserved",
              "the price is held"
            ]
          },
          "mandatory": false,
          "label": "OPTIONAL_STRATEGY"
        }
      ],
      "noAction": [
        "s.completed",
        "s.invalid",
        "s.payment",
        "s.permission",
        "s.contest",
        "s.superseded",
        "s.cooldown"
      ]
    },
    "entry": "t.started",
    "nodes": [
      {
        "id": "t.started",
        "kind": "trigger",
        "event": "process_started",
        "evidence": {
          "requires": [
            "an authoritative record that a resumable process opened for this person",
            "at least one item in the process",
            "a resumable state and a resume destination",
            "the time of the last activity on the process"
          ],
          "insufficientAlone": [
            "a cart page view",
            "an item added without entering the process - that is a recorded selection, Abandoned Selection Recovery's subject",
            "a process with no items",
            "a process already completed, cancelled or expired"
          ],
          "source": "authoritative"
        },
        "next": "c.eligible"
      },
      {
        "id": "c.eligible",
        "kind": "condition",
        "asks": "Can this process be recovered for this person at all?",
        "branches": [
          {
            "label": "Eligible",
            "when": "the identity resolves to a contactable person, the process is resumable with items and a destination, no instance is open for it, no payment failure is recorded on it, and commercial recovery permission is recorded",
            "observes": "process state, identity resolution, permission record",
            "to": "a.open"
          },
          {
            "label": "Not eligible",
            "when": "any of those fails - the reason is recorded as the no-action reason",
            "observes": "process state, identity resolution, permission record",
            "to": "x.no-action"
          }
        ]
      },
      {
        "id": "a.open",
        "kind": "action",
        "does": "Open the recovery instance against the logical process and start the abandonment clock from the last activity on it, not from when it opened. Activity before the first touch moves the clock; nothing after the first touch extends any window",
        "writes": [
          {
            "field": "recovery_log",
            "mode": "append"
          }
        ],
        "idempotencyKey": "logical_process_id",
        "next": "w.abandon"
      },
      {
        "id": "w.abandon",
        "kind": "wait",
        "until": [
          "process_completed",
          "process_cancelled",
          "process_expired",
          "items_removed_all",
          "payment_failed"
        ],
        "onEvent": "c.state",
        "timeout": {
          "after": {
            "key": "recovery.first_check",
            "rule": "The first check waits long enough after the last activity that the person has actually left the process rather than paused inside it, and no longer than the intent stays fresh.",
            "class": "recovery-window",
            "default": {
              "value": {
                "min": "30 minutes",
                "max": "60 minutes"
              },
              "confidence": "low",
              "basis": "example-only",
              "applicableWhen": "considered purchases and multi-step applications",
              "avoidWhen": "impulse baskets and single-step processes, where a shorter first check is honest"
            },
            "required": false
          },
          "reason": "a person still inside the process is not abandoning it; the clock runs from their last activity so that pausing is not punished",
          "relativeTo": "attribute",
          "attribute": "last_activity_at"
        },
        "onTimeout": "c.state",
        "recheck": "the process re-read from the system of record: still resumable, items still present, no order placed, no payment failure",
        "windowExtendsOnEngagement": false
      },
      {
        "id": "c.state",
        "kind": "condition",
        "asks": "What is the process now?",
        "branches": [
          {
            "label": "Still resumable",
            "when": "the process is open with items and a resume destination and no order has been placed against it",
            "observes": "process state",
            "to": "c.sendable"
          },
          {
            "label": "Completed",
            "when": "an order or completion is recorded against the process by any channel",
            "observes": "process_completed",
            "to": "x.converted"
          },
          {
            "label": "Cancelled, expired or emptied",
            "when": "the person cancelled it, the platform expired it, or every item was removed",
            "observes": "process state",
            "to": "x.invalid"
          },
          {
            "label": "Superseded",
            "when": "a newer logical process exists for the same person and the supersession rule applies",
            "observes": "newer process for person",
            "to": "x.superseded"
          },
          {
            "label": "Payment failed",
            "when": "a payment failure is recorded against this process",
            "observes": "payment_failed",
            "to": "h.payment"
          }
        ]
      },
      {
        "id": "c.sendable",
        "kind": "condition",
        "asks": "May the first touch go out?",
        "branches": [
          {
            "label": "Sendable",
            "when": "the send path passes: permission for commercial recovery, a deliverable destination, the promotional pressure cap, no higher-precedence contest on the account, and no cooldown in force",
            "observes": "send path stages 1-8",
            "to": "a.touch1"
          },
          {
            "label": "Suppressed",
            "when": "a gate stops it; the gate is recorded as the reason",
            "observes": "send path stages 1-8",
            "to": "a.record-no-action"
          }
        ]
      },
      {
        "id": "a.record-no-action",
        "kind": "action",
        "does": "Record which gate stopped the touch and against which process, so no-action is a measured outcome rather than a silent absence",
        "writes": [
          {
            "field": "suppressed_sends",
            "mode": "append"
          }
        ],
        "next": "x.no-action"
      },
      {
        "id": "a.touch1",
        "kind": "action",
        "does": "Say the process is still open, show the items as they are now, and give the link that reopens this exact process with its state restored. Claim nothing the system does not assert - no reserved stock, no held price, no discount",
        "execution": "communication",
        "idempotencyKey": "logical_process_id + touch id",
        "writes": [
          {
            "field": "recovery_log",
            "mode": "append"
          }
        ],
        "next": "w.second"
      },
      {
        "id": "w.second",
        "kind": "wait",
        "until": [
          "process_resumed",
          "process_completed",
          "process_cancelled",
          "process_expired",
          "items_removed_all",
          "payment_failed"
        ],
        "onEvent": "c.state2",
        "timeout": {
          "after": {
            "key": "recovery.second_check",
            "rule": "The second check comes after the person has had a chance to act on the first touch in their own time, and before the process stops being resumable.",
            "class": "recovery-window",
            "default": {
              "value": {
                "min": "20 hours",
                "max": "28 hours"
              },
              "confidence": "low",
              "basis": "example-only",
              "avoidWhen": "perishable or time-boxed processes - the second check is the resumable window minus a margin"
            },
            "required": false
          },
          "reason": "a second touch inside the same hour is pressure, not help; a second touch after the process has expired is noise",
          "relativeTo": "previous-touch"
        },
        "onTimeout": "c.state2",
        "recheck": "the process re-read from the system of record, plus whether the person resumed it since the first touch",
        "windowExtendsOnEngagement": false
      },
      {
        "id": "c.state2",
        "kind": "condition",
        "asks": "What is the process now, and did they come back?",
        "branches": [
          {
            "label": "Completed",
            "when": "an order or completion is recorded against the process",
            "observes": "process_completed",
            "to": "x.converted"
          },
          {
            "label": "Cancelled, expired or emptied",
            "when": "the process can no longer be returned to",
            "observes": "process state",
            "to": "x.invalid"
          },
          {
            "label": "Superseded",
            "when": "a newer logical process exists for the same person and the supersession rule applies",
            "observes": "newer process for person",
            "to": "x.superseded"
          },
          {
            "label": "Payment failed",
            "when": "a payment failure is recorded against this process",
            "observes": "payment_failed",
            "to": "h.payment"
          },
          {
            "label": "Resumed, still open",
            "when": "an authenticated session touched the process since the first touch and it is still open - the person is deciding, not forgetting",
            "observes": "process_resumed since last touch",
            "to": "a.note-return"
          },
          {
            "label": "Still open, not resumed",
            "when": "the process is open and untouched since the first touch",
            "observes": "process state",
            "to": "c.sendable2"
          }
        ]
      },
      {
        "id": "a.note-return",
        "kind": "action",
        "does": "Record the return and re-arm one further wait from the new last activity. A person who came back and left again is deciding; the second touch is held once, not skipped and not hurried",
        "writes": [
          {
            "field": "recovery_log",
            "mode": "append"
          }
        ],
        "attemptBudget": {
          "key": "recovery.resume_rearms",
          "rule": "A return re-arms the wait a bounded number of times; the budget is fixed when the instance opens and does not renew on activity.",
          "default": {
            "value": 1,
            "confidence": "medium",
            "basis": "corpus-rule",
            "applicableWhen": "GLB-24: every retry, reminder and re-request runs against a budget fixed when it started"
          },
          "required": false
        },
        "next": "w.resumed"
      },
      {
        "id": "w.resumed",
        "kind": "wait",
        "until": [
          "process_completed",
          "process_cancelled",
          "process_expired",
          "items_removed_all",
          "payment_failed"
        ],
        "onEvent": "c.state2",
        "timeout": {
          "after": {
            "key": "recovery.first_check",
            "rule": "After a return, the same first-check interval runs again from the new last activity.",
            "class": "recovery-window",
            "default": {
              "value": {
                "min": "30 minutes",
                "max": "60 minutes"
              },
              "confidence": "low",
              "basis": "example-only",
              "applicableWhen": "the same value as the first check"
            },
            "required": false
          },
          "reason": "the person is inside the process again; the same patience applies as before the first touch",
          "relativeTo": "attribute",
          "attribute": "last_activity_at"
        },
        "onTimeout": "c.state2",
        "recheck": "the process re-read from the system of record",
        "windowExtendsOnEngagement": false
      },
      {
        "id": "c.sendable2",
        "kind": "condition",
        "asks": "May the second touch go out?",
        "branches": [
          {
            "label": "Sendable",
            "when": "the send path passes and the touch budget is not spent",
            "observes": "send path stages 1-8, touch budget",
            "to": "a.touch2"
          },
          {
            "label": "Suppressed",
            "when": "a gate stops it; the gate is recorded",
            "observes": "send path stages 1-8",
            "to": "a.record-no-action"
          }
        ]
      },
      {
        "id": "a.touch2",
        "kind": "action",
        "does": "Address the likely blocker - shipping, returns, trust, a route to ask a question - with the same link back into the process. Still nothing the system does not assert",
        "execution": "communication",
        "idempotencyKey": "logical_process_id + touch id",
        "writes": [
          {
            "field": "recovery_log",
            "mode": "append"
          }
        ],
        "next": "w.final"
      },
      {
        "id": "w.final",
        "kind": "wait",
        "until": [
          "process_completed",
          "process_cancelled",
          "process_expired",
          "items_removed_all",
          "payment_failed"
        ],
        "onEvent": "c.state3",
        "timeout": {
          "after": {
            "key": "recovery.lifetime",
            "rule": "The recovery lifetime ends before the platform's own resumable lifetime, so the last touch never points at a process that has already closed.",
            "class": "recovery-window",
            "default": {
              "value": {
                "min": "3 days",
                "max": "7 days"
              },
              "confidence": "low",
              "basis": "example-only",
              "avoidWhen": "the platform's resumable lifetime is shorter - the lifetime is that, minus a margin"
            },
            "required": false
          },
          "reason": "an unfinished process stops being an intent and becomes a record; pursuing it past that point is pressure",
          "relativeTo": "trigger"
        },
        "onTimeout": "c.state3",
        "recheck": "the process re-read from the system of record, and whether the platform asserts an expiry",
        "windowExtendsOnEngagement": false
      },
      {
        "id": "c.state3",
        "kind": "condition",
        "asks": "At the end of the recovery lifetime, what is the process?",
        "branches": [
          {
            "label": "Completed",
            "when": "an order or completion is recorded against the process",
            "observes": "process_completed",
            "to": "x.converted"
          },
          {
            "label": "Cancelled, expired or emptied",
            "when": "the process can no longer be returned to",
            "observes": "process state",
            "to": "x.invalid"
          },
          {
            "label": "Superseded",
            "when": "a newer logical process exists for the same person and the supersession rule applies",
            "observes": "newer process for person",
            "to": "x.superseded"
          },
          {
            "label": "Payment failed",
            "when": "a payment failure is recorded against this process",
            "observes": "payment_failed",
            "to": "h.payment"
          },
          {
            "label": "Still open",
            "when": "the process is open and resumable",
            "observes": "process state",
            "to": "c.final-enabled"
          }
        ]
      },
      {
        "id": "c.final-enabled",
        "kind": "condition",
        "asks": "Is a final notice enabled, and is there a real expiry to name?",
        "branches": [
          {
            "label": "Enabled, expiry asserted",
            "when": "the company has enabled the final notice (recovery.final_notice_enabled), the platform asserts an expiry for this process, and the send path passes",
            "observes": "recovery.final_notice_enabled, expires_at, send path",
            "to": "a.touch3"
          },
          {
            "label": "Disabled, or no honest expiry",
            "when": "the final notice is disabled, or no expiry is asserted that the notice could truthfully name",
            "observes": "recovery.final_notice_enabled, expires_at",
            "to": "x.lapsed"
          }
        ]
      },
      {
        "id": "a.touch3",
        "kind": "action",
        "does": "Say, once, that the process closes at its real expiry and give the link. No urgency the system does not assert, and no incentive unless policy enables one for the last touch",
        "execution": "communication",
        "idempotencyKey": "logical_process_id + touch id",
        "writes": [
          {
            "field": "recovery_log",
            "mode": "append"
          }
        ],
        "next": "w.close"
      },
      {
        "id": "w.close",
        "kind": "wait",
        "until": [
          "process_completed",
          "process_cancelled",
          "process_expired",
          "items_removed_all",
          "payment_failed"
        ],
        "onEvent": "c.close",
        "timeout": {
          "after": {
            "key": "recovery.process_expiry",
            "rule": "The final wait ends when the platform's own expiry does; nothing is sent after it.",
            "class": "attribute-bound",
            "default": {
              "value": "expires_at as asserted by the platform",
              "confidence": "high",
              "basis": "attribute-bound"
            },
            "required": false
          },
          "reason": "after the final notice the only remaining question is whether the process completed before it closed",
          "relativeTo": "attribute",
          "attribute": "expires_at"
        },
        "onTimeout": "x.lapsed",
        "recheck": "the process re-read from the system of record at its expiry",
        "windowExtendsOnEngagement": false
      },
      {
        "id": "c.close",
        "kind": "condition",
        "asks": "What ended the final wait?",
        "branches": [
          {
            "label": "Completed",
            "when": "an order or completion is recorded against the process",
            "observes": "process_completed",
            "to": "x.converted"
          },
          {
            "label": "Payment failed",
            "when": "a payment failure is recorded against this process",
            "observes": "payment_failed",
            "to": "h.payment"
          },
          {
            "label": "Closed unfinished",
            "when": "the process was cancelled, expired or emptied",
            "observes": "process state",
            "to": "x.invalid"
          }
        ]
      },
      {
        "id": "x.converted",
        "kind": "exit",
        "state": "completed; the process reached its end",
        "class": "success",
        "terminal": false,
        "reEntry": "a new logical process is a new instance; this one is closed as converted"
      },
      {
        "id": "x.invalid",
        "kind": "exit",
        "state": "closed unfinished - cancelled, expired or emptied; nothing further is sent",
        "class": "invalid-state",
        "terminal": false,
        "reEntry": "a new logical process is a new instance"
      },
      {
        "id": "x.superseded",
        "kind": "exit",
        "state": "superseded by a newer process for the same person",
        "class": "suppression",
        "terminal": false,
        "reEntry": "none for this process; the newer process owns recovery"
      },
      {
        "id": "x.no-action",
        "kind": "exit",
        "state": "no touch sent; the gate that stopped it is recorded",
        "class": "no-action",
        "terminal": false,
        "reEntry": "a new logical process is a new instance, subject to the cooldown when this one lapsed or was suppressed"
      },
      {
        "id": "x.lapsed",
        "kind": "exit",
        "state": "recovery lifetime passed with the process still open; nothing further is sent",
        "class": "timeout",
        "terminal": false,
        "reEntry": "a new logical process is a new instance, and enters silently while the cooldown runs"
      },
      {
        "id": "h.payment",
        "kind": "handoff",
        "to": "FIN-134",
        "on": "a payment failure recorded against the process - a failed payment is not abandonment",
        "carries": [
          "the logical process and its items",
          "the obligation the failed attempt was against",
          "that recovery communication about the process stops here"
        ],
        "suppresses": [
          "every queued recovery touch for this process"
        ],
        "contract": {
          "requiredFields": [
            "logical_process_id",
            "person_id",
            "obligation_id",
            "failed_at"
          ]
        }
      }
    ],
    "implementation": {
      "attributes": {
        "required": [
          "logical_process_id",
          "person_id",
          "items",
          "started_at",
          "last_activity_at",
          "resume_destination"
        ],
        "optional": [
          "expires_at",
          "value",
          "currency",
          "category",
          "has_active_app_session",
          "hold_expires_at",
          "delivery_cutoff_at"
        ]
      }
    },
    "measurement": {
      "journeyOutcome": {
        "type": "exit-or-handoff",
        "refs": [
          "x.converted",
          "x.invalid",
          "x.superseded",
          "x.no-action",
          "x.lapsed",
          "h.payment"
        ]
      },
      "businessOutcome": {
        "event": "process_completed",
        "unit": "instance",
        "observationScope": {
          "type": "self"
        },
        "window": {
          "type": "until-exit"
        },
        "attribution": "touched-before-event",
        "comparison": "persistent-holdout",
        "holdout": {
          "key": "recovery.holdout_share",
          "rule": "A persistent per-person holdout is required: people who abandon a process complete it on their own often enough that a treated-only measurement cannot tell the journey's effect from theirs.",
          "default": {
            "value": 10,
            "confidence": "low",
            "basis": "example-only",
            "applicableWhen": "enough volume that the holdout reaches significance in a reasonable period"
          },
          "required": false
        }
      },
      "secondary": [
        "process_resumed"
      ],
      "guardrails": [
        "unsubscribe",
        "complaint",
        "message_after_success",
        "incentive_issued",
        "support_contact_within_24h"
      ],
      "operational": [
        "entry_volume",
        "no_action_rate_by_reason",
        "channel_role_used_t1",
        "branch_distribution",
        "resume_rearm_rate"
      ]
    },
    "discovery": {
      "aliases": [
        "checkout abandonment",
        "abandoned checkout",
        "checkout recovery",
        "begin checkout recovery",
        "abandoned application",
        "abandoned quote",
        "incomplete registration"
      ],
      "useCases": [
        "a started checkout with items that has gone quiet",
        "an application, quote or registration left part-way through with state the person can return to"
      ],
      "presets": [
        {
          "id": "checkout-abandonment",
          "name": "Checkout Abandonment",
          "applicableWhen": {
            "id": "p.checkout",
            "label": "CANONICAL_RULE",
            "text": "The resumable process is a checkout with a basket: it has items, a resume destination and, usually, a platform-asserted expiry."
          },
          "overrides": {},
          "destination": "checkout-session",
          "aliases": [
            "cart recovery (checkout stage)",
            "abandoned cart checkout",
            "checkout abandonment",
            "begin checkout recovery"
          ]
        },
        {
          "id": "quote-abandonment",
          "name": "Quote Abandonment",
          "applicableWhen": {
            "id": "p.quote",
            "label": "CANONICAL_RULE",
            "text": "The resumable process is a quote or proposal the person configured and did not accept; it has a resume destination and an expiry the quoting system asserts."
          },
          "overrides": {
            "recovery.first_check": {
              "min": "4 hours",
              "max": "24 hours"
            }
          },
          "destination": "the quote",
          "aliases": [
            "quote abandonment",
            "abandoned quote",
            "quote follow-up",
            "unaccepted proposal"
          ]
        },
        {
          "id": "application-abandonment",
          "name": "Application Abandonment",
          "applicableWhen": {
            "id": "p.application",
            "label": "CANONICAL_RULE",
            "text": "The resumable process is a multi-step application with saved state; a hard submission deadline, where one exists, is owned by deadline reminder (TIM-61) through handoff, not by this recovery."
          },
          "overrides": {
            "recovery.first_check": {
              "min": "4 hours",
              "max": "24 hours"
            }
          },
          "destination": "the application",
          "aliases": [
            "application abandonment",
            "incomplete application",
            "abandoned form",
            "application follow-up"
          ]
        },
        {
          "id": "incomplete-registration",
          "name": "Incomplete Registration",
          "applicableWhen": {
            "id": "p.registration",
            "label": "CANONICAL_RULE",
            "text": "The resumable process is a registration or sign-up left part-way; identity verification, where required, is handed to verification (IDN-81) and never re-asked here."
          },
          "overrides": {
            "recovery.first_check": {
              "min": "1 hour",
              "max": "4 hours"
            }
          },
          "destination": "the registration step",
          "aliases": [
            "incomplete registration",
            "abandoned sign-up",
            "registration follow-up",
            "unfinished account setup"
          ]
        }
      ]
    },
    "distinctFrom": [
      {
        "journey": "ACQ-08",
        "because": "ACQ-08 makes acquisition give up ownership the moment a destination is reached. This journey pursues one specific unfinished process and gives up when it completes, closes or is superseded."
      },
      {
        "journey": "SCH-282",
        "because": "SCH-282 follows an availability enquiry that holds nothing. A process has state the person can return to, which is what makes recovery honest."
      }
    ],
    "guardrails": [
      "Nothing is claimed that the system does not assert: no reserved stock, no held price, no discount, no expiry the platform does not enforce.",
      "Opens and clicks are engagement evidence and change nothing; only process events move the state.",
      "The clock runs from last activity before the first touch and from the previous touch after it; no window extends on engagement.",
      "A link into an expired process resolves to the person's current basket or an honest closed-process page, never a dead end.",
      "An incentive, where enabled, appears once and only on the last enabled touch."
    ],
    "reusableRule": "An abandoned process is recovered against its own current state, re-read before every touch, with a bounded plan fixed at entry - never against a snapshot of what the person once had in it."
  },
  {
    "id": "ACQ-12",
    "slug": "abandoned-selection-recovery",
    "category": "acquisition",
    "goal": "recovery-retry",
    "channels": [
      "email",
      "push",
      "in-app"
    ],
    "name": "Selection recorded → held without a process → recovered, carried into a process, cleared or lapsed",
    "shortName": "Abandoned Selection Recovery",
    "purpose": "Return a person to items they selected - a cart, a basket, a saved list - and did not carry into a process, while the selection still stands and the items are still available, without asserting a state the system does not hold.",
    "objective": "Bring the person back to the selection as it currently stands and let them act on it; never claim reserved stock, a held price or a discount the system does not assert, and never present an item the platform says is unavailable.",
    "entity": {
      "scope": "the recorded selection - the set of items a person put in a cart, basket or saved list - which has no process state and no expiry of its own",
      "note": "A selection is not a process: nothing is in motion, nothing expires, and the person can return to it or not. That is why this journey has no final notice - there is no honest deadline to name. When the person carries the selection into a process, the process owns recovery from that moment.",
      "instanceKey": [
        "person_id",
        "selection_id"
      ],
      "concurrency": "one-active-per-key",
      "supersession": {
        "id": "s.supersession",
        "label": "CANONICAL_RULE",
        "text": "A process started from the selection supersedes this instance: Abandoned Process Recovery owns the person from that moment, and every queued touch here is suppressed."
      }
    },
    "eligibility": [
      "the identity behind the selection resolves to a person we may contact",
      "the selection holds at least one item the platform currently asserts as available",
      "the selection has not been carried into a process, and no process is open for its items",
      "no recovery instance is already open for this selection",
      "purpose-level permission for commercial recovery communication is recorded, and hard gates (GLB-31) allow it"
    ],
    "suppressions": [
      {
        "id": "s.converted",
        "label": "CANONICAL_RULE",
        "text": "Exit the moment an order including any item from the selection is recorded by any channel; every touch re-reads the selection first."
      },
      {
        "id": "s.process",
        "label": "CANONICAL_RULE",
        "text": "A process started from the selection hands the instance to Abandoned Process Recovery (ACQ-11); the two never message the same person about the same items."
      },
      {
        "id": "s.cleared",
        "label": "CANONICAL_RULE",
        "text": "Exit when the person clears the selection or every item becomes unavailable; nothing is sent about items the person cannot act on."
      },
      {
        "id": "s.unavailable-shown",
        "label": "CANONICAL_RULE",
        "text": "An item the platform asserts as unavailable is never shown in a touch; a touch about a selection shows only what can still be acted on."
      },
      {
        "id": "s.permission",
        "label": "CANONICAL_RULE",
        "text": "No touch without purpose-level permission for commercial recovery communication; absent permission is a recorded no-action, never a fallback to another channel."
      },
      {
        "id": "s.contest",
        "label": "CANONICAL_RULE",
        "text": "A process recovery, an open complaint, an open payment recovery or a retention-outreach journey on the same person outranks this journey; its touch is deferred and re-evaluated against current state (GLB-06)."
      },
      {
        "id": "s.cooldown",
        "label": "RECOMMENDED_DEFAULT",
        "text": "A new selection made inside the cooldown after a lapsed or suppressed instance enters, is tracked, and sends nothing."
      },
      {
        "id": "s.incentive",
        "label": "OPTIONAL_STRATEGY",
        "text": "If the company enables an incentive (selection.incentive_policy), it appears only on the last enabled touch, once, and its issuance is recorded per person. The library recommends none by default."
      }
    ],
    "contact": {
      "defaultPriority": "promotional",
      "pressureClass": "promotional",
      "localCap": {
        "value": {
          "key": "selection.touches",
          "rule": "Every touch runs against a budget fixed when the instance opened; the budget is the plan's own length, and no touch is repeated because nothing could tell whether it arrived.",
          "default": {
            "value": 2,
            "confidence": "medium",
            "basis": "corpus-rule",
            "applicableWhen": "GLB-24; the plan has two touches and no final notice"
          },
          "required": false
        },
        "appliesTo": "all"
      },
      "cooldown": {
        "key": "selection.cooldown",
        "rule": "After a lapsed or suppressed instance, a new selection by the same person is tracked but not messaged until the cooldown has passed. A converted selection carries no cooldown.",
        "class": "cooldown",
        "default": {
          "value": {
            "min": "14 days",
            "max": "30 days"
          },
          "confidence": "low",
          "basis": "example-only",
          "avoidWhen": "high-frequency replenishment purchases, where a short cooldown is honest"
        },
        "required": false
      },
      "competition": {
        "exclusionGroup": "commerce-recovery",
        "scope": "person",
        "precedence": "below process recovery - a process in motion outranks a held selection; above interest recovery and predicted-need replenishment for the same person"
      , "onLoss": "suppressed" }
    },
    "channelStrategy": {
      "roles": [
        {
          "role": "low-friction",
          "channels": [
            "push",
            "in-app"
          ],
          "when": "an app session or a valid push token exists for this person - the selection is recent and a nudge back beats content"
        },
        {
          "role": "persistent",
          "channels": [
            "email"
          ],
          "when": "no low-friction route exists, or the touch has to carry the items as they stand and survive until the person can act"
        }
      ],
      "fallback": "same-role-other-channel",
      "label": "RECOMMENDED_DEFAULT"
    },
    "orchestration": {
      "strategy": "progressive-recovery",
      "touches": [
        {
          "id": "t1",
          "stage": "initial-recovery",
          "action": "a.touch1",
          "gatedBy": "w.settle",
          "prerequisites": [
            "c.state",
            "c.availability",
            "c.sendable"
          ],
          "purpose": "The selection as it currently stands - only the items still available - and the link that reopens it. Nothing the system does not assert.",
          "channelRoles": [
            "low-friction",
            "persistent"
          ],
          "destination": {
            "target": "selection-resume",
            "boundTo": "selection_id",
            "mustNotClaim": [
              "stock is reserved",
              "the price is held",
              "a discount applies",
              "an expiry"
            ]
          },
          "mandatory": false,
          "label": "CANONICAL_RULE"
        },
        {
          "id": "t2",
          "stage": "follow-up",
          "action": "a.touch2",
          "after": "t1",
          "gatedBy": "w.second",
          "prerequisites": [
            "c.state2",
            "c.sendable2"
          ],
          "purpose": "The selection again, with any genuine change the platform asserts on an item still held - a restored availability, a changed price - and the same link. No urgency the system does not assert.",
          "channelRoles": [
            "persistent",
            "low-friction"
          ],
          "destination": {
            "target": "selection-resume",
            "boundTo": "selection_id",
            "mustNotClaim": [
              "stock is reserved",
              "the price is held",
              "a discount applies",
              "an expiry"
            ]
          },
          "mandatory": false,
          "label": "RECOMMENDED_DEFAULT"
        }
      ],
      "noAction": [
        "s.converted",
        "s.process",
        "s.cleared",
        "s.unavailable-shown",
        "s.permission",
        "s.contest",
        "s.cooldown"
      ]
    },
    "entry": "t.selected",
    "nodes": [
      {
        "id": "t.selected",
        "kind": "trigger",
        "event": "selection_recorded",
        "evidence": {
          "requires": [
            "an authoritative record that one or more items were placed in a selection for this person",
            "the items, their current availability and current price as the platform asserts them",
            "the time of the last activity on the selection"
          ],
          "insufficientAlone": [
            "a product view - that is Unresolved Interest Recovery's subject",
            "an item added and removed inside the same session",
            "a selection already carried into a process - that is Abandoned Process Recovery's subject",
            "a selection whose every item the platform asserts as unavailable"
          ],
          "source": "authoritative"
        },
        "next": "c.eligible"
      },
      {
        "id": "c.eligible",
        "kind": "condition",
        "asks": "Can this selection be recovered for this person at all?",
        "branches": [
          {
            "label": "Eligible",
            "when": "the identity resolves to a contactable person, at least one item is available, no process is open for the items, no instance is open for this selection, and commercial recovery permission is recorded",
            "observes": "selection state, identity resolution, permission record",
            "to": "a.open"
          },
          {
            "label": "Not eligible",
            "when": "any of those fails - the reason is recorded as the no-action reason",
            "observes": "selection state, identity resolution, permission record",
            "to": "x.no-action"
          }
        ]
      },
      {
        "id": "a.open",
        "kind": "action",
        "does": "Open the recovery instance against the selection and start the clock from the last activity on it. Activity before the first touch moves the clock; nothing after the first touch extends any window",
        "writes": [
          {
            "field": "recovery_log",
            "mode": "append"
          }
        ],
        "idempotencyKey": "selection_id",
        "next": "w.settle"
      },
      {
        "id": "w.settle",
        "kind": "wait",
        "until": [
          "selection_converted",
          "selection_cleared",
          "process_started",
          "selection_changed"
        ],
        "onEvent": "c.state",
        "timeout": {
          "after": {
            "key": "selection.first_check",
            "rule": "The first check waits long enough after the last selection activity that the person has actually left rather than paused, and no longer than the selection is likely to be remembered.",
            "class": "recovery-window",
            "default": {
              "value": {
                "min": "1 hour",
                "max": "4 hours"
              },
              "confidence": "low",
              "basis": "example-only",
              "applicableWhen": "a shopping cart",
              "avoidWhen": "a saved list, where a much longer first check is honest - see the Saved Item Reminder preset"
            },
            "required": false
          },
          "reason": "a person still adding to a selection is not abandoning it; the clock runs from their last activity",
          "relativeTo": "attribute",
          "attribute": "last_selection_activity_at"
        },
        "onTimeout": "c.state",
        "recheck": "the selection re-read from the system of record: items present, each item's availability and price as the platform asserts them, no order placed, no process opened",
        "windowExtendsOnEngagement": false
      },
      {
        "id": "c.state",
        "kind": "condition",
        "asks": "What is the selection now?",
        "branches": [
          {
            "label": "Converted",
            "when": "an order including any item from the selection is recorded",
            "observes": "selection_converted",
            "to": "x.converted"
          },
          {
            "label": "Cleared",
            "when": "the person removed every item or deleted the selection",
            "observes": "selection_cleared",
            "to": "x.invalid"
          },
          {
            "label": "Carried into a process",
            "when": "a process was started from the selection",
            "observes": "process_started",
            "to": "h.process"
          },
          {
            "label": "Changed, still held",
            "when": "an item was added or removed and at least one remains - the person is still deciding",
            "observes": "selection_changed",
            "to": "a.rearm"
          },
          {
            "label": "Still held",
            "when": "the selection stands as it was",
            "observes": "selection state",
            "to": "c.availability"
          }
        ]
      },
      {
        "id": "a.rearm",
        "kind": "action",
        "does": "Record the change and re-arm the first wait from the new last activity, a bounded number of times. A person still editing a selection is deciding, not forgetting",
        "writes": [
          {
            "field": "recovery_log",
            "mode": "append"
          }
        ],
        "attemptBudget": {
          "key": "selection.change_rearms",
          "rule": "A change re-arms the wait a bounded number of times; the budget is fixed when the instance opens and does not renew on activity.",
          "default": {
            "value": 2,
            "confidence": "medium",
            "basis": "corpus-rule",
            "applicableWhen": "GLB-24: every retry, reminder and re-request runs against a budget fixed when it started"
          },
          "required": false
        },
        "next": "w.settle"
      },
      {
        "id": "c.availability",
        "kind": "condition",
        "asks": "Can any of it still be acted on?",
        "branches": [
          {
            "label": "At least one item available",
            "when": "the platform asserts at least one selected item as available",
            "observes": "item availability",
            "to": "c.sendable"
          },
          {
            "label": "Nothing available",
            "when": "the platform asserts every selected item as unavailable",
            "observes": "item_unavailable",
            "to": "x.unavailable"
          }
        ]
      },
      {
        "id": "c.sendable",
        "kind": "condition",
        "asks": "May the first touch go out?",
        "branches": [
          {
            "label": "Sendable",
            "when": "the send path passes: permission for commercial recovery, a deliverable destination, the promotional pressure cap, no higher-precedence contest on the person, and no cooldown in force",
            "observes": "send path stages 1-8",
            "to": "a.touch1"
          },
          {
            "label": "Suppressed",
            "when": "a gate stops it; the gate is recorded as the reason",
            "observes": "send path stages 1-8",
            "to": "a.record-no-action"
          }
        ]
      },
      {
        "id": "a.record-no-action",
        "kind": "action",
        "does": "Record which gate stopped the touch and against which selection, so no-action is a measured outcome rather than a silent absence",
        "writes": [
          {
            "field": "suppressed_sends",
            "mode": "append"
          }
        ],
        "next": "x.no-action"
      },
      {
        "id": "a.touch1",
        "kind": "action",
        "does": "Show the selection as it stands now - only the items the platform asserts as available - and give the link that reopens it. Claim nothing the system does not assert: no reserved stock, no held price, no discount, no expiry",
        "execution": "communication",
        "idempotencyKey": "selection_id + touch id",
        "writes": [
          {
            "field": "recovery_log",
            "mode": "append"
          }
        ],
        "next": "w.second"
      },
      {
        "id": "w.second",
        "kind": "wait",
        "until": [
          "selection_converted",
          "selection_cleared",
          "process_started",
          "item_unavailable",
          "price_changed"
        ],
        "onEvent": "c.state2",
        "timeout": {
          "after": {
            "key": "selection.second_check",
            "rule": "The second check comes after the person has had time to act on the first touch in their own time, and before the selection stops being something they remember.",
            "class": "recovery-window",
            "default": {
              "value": {
                "min": "2 days",
                "max": "4 days"
              },
              "confidence": "low",
              "basis": "example-only"
            },
            "required": false
          },
          "reason": "a second touch inside the same day is pressure, not help",
          "relativeTo": "previous-touch"
        },
        "onTimeout": "c.state2",
        "recheck": "the selection re-read from the system of record, plus whether any held item changed in availability or price since the first touch",
        "windowExtendsOnEngagement": false
      },
      {
        "id": "c.state2",
        "kind": "condition",
        "asks": "What is the selection now, and did anything about it change?",
        "branches": [
          {
            "label": "Converted",
            "when": "an order including any item from the selection is recorded",
            "observes": "selection_converted",
            "to": "x.converted"
          },
          {
            "label": "Cleared",
            "when": "the person removed every item or deleted the selection",
            "observes": "selection_cleared",
            "to": "x.invalid"
          },
          {
            "label": "Carried into a process",
            "when": "a process was started from the selection",
            "observes": "process_started",
            "to": "h.process"
          },
          {
            "label": "Nothing available",
            "when": "the platform now asserts every selected item as unavailable",
            "observes": "item_unavailable",
            "to": "x.unavailable"
          },
          {
            "label": "Still held",
            "when": "at least one item is still held and available, changed or not",
            "observes": "selection state, price_changed, item_unavailable",
            "to": "c.sendable2"
          }
        ]
      },
      {
        "id": "c.sendable2",
        "kind": "condition",
        "asks": "May the second touch go out?",
        "branches": [
          {
            "label": "Sendable",
            "when": "the send path passes and the touch budget is not spent",
            "observes": "send path stages 1-8, touch budget",
            "to": "a.touch2"
          },
          {
            "label": "Suppressed",
            "when": "a gate stops it; the gate is recorded",
            "observes": "send path stages 1-8",
            "to": "a.record-no-action"
          }
        ]
      },
      {
        "id": "a.touch2",
        "kind": "action",
        "does": "Show the selection again with any genuine change the platform asserts on a held item - availability restored, price changed - and the same link. No urgency the system does not assert, and no incentive unless policy enables one for the last touch",
        "execution": "communication",
        "idempotencyKey": "selection_id + touch id",
        "writes": [
          {
            "field": "recovery_log",
            "mode": "append"
          }
        ],
        "next": "w.final"
      },
      {
        "id": "w.final",
        "kind": "wait",
        "until": [
          "selection_converted",
          "selection_cleared",
          "process_started"
        ],
        "onEvent": "c.state3",
        "timeout": {
          "after": {
            "key": "selection.lifetime",
            "rule": "The recovery lifetime is the period in which a held selection is still an intent rather than a record; past it nothing further is sent.",
            "class": "recovery-window",
            "default": {
              "value": {
                "min": "7 days",
                "max": "14 days"
              },
              "confidence": "low",
              "basis": "example-only"
            },
            "required": false
          },
          "reason": "a selection nobody returns to stops being an intent; pursuing it past that point is pressure",
          "relativeTo": "trigger"
        },
        "onTimeout": "c.state3",
        "recheck": "the selection re-read from the system of record at the end of the lifetime",
        "windowExtendsOnEngagement": false
      },
      {
        "id": "c.state3",
        "kind": "condition",
        "asks": "At the end of the recovery lifetime, what is the selection?",
        "branches": [
          {
            "label": "Converted",
            "when": "an order including any item from the selection is recorded",
            "observes": "selection_converted",
            "to": "x.converted"
          },
          {
            "label": "Cleared",
            "when": "the person removed every item or deleted the selection",
            "observes": "selection_cleared",
            "to": "x.invalid"
          },
          {
            "label": "Carried into a process",
            "when": "a process was started from the selection",
            "observes": "process_started",
            "to": "h.process"
          },
          {
            "label": "Still held",
            "when": "the selection stands; nothing further is sent",
            "observes": "selection state",
            "to": "x.lapsed"
          }
        ]
      },
      {
        "id": "x.converted",
        "kind": "exit",
        "state": "converted; an order including a selected item is recorded",
        "class": "success",
        "terminal": false,
        "reEntry": "a new selection is a new instance; this one is closed as converted"
      },
      {
        "id": "x.invalid",
        "kind": "exit",
        "state": "cleared by the person; nothing further is sent",
        "class": "invalid-state",
        "terminal": false,
        "reEntry": "a new selection is a new instance"
      },
      {
        "id": "x.unavailable",
        "kind": "exit",
        "state": "every selected item unavailable; nothing is sent about items that cannot be acted on",
        "class": "invalid-state",
        "terminal": false,
        "reEntry": "availability restored is an authoritative event for a later availability journey, not a re-entry here"
      },
      {
        "id": "x.no-action",
        "kind": "exit",
        "state": "no touch sent; the gate that stopped it is recorded",
        "class": "no-action",
        "terminal": false,
        "reEntry": "a new selection is a new instance, subject to the cooldown when this one lapsed or was suppressed"
      },
      {
        "id": "x.lapsed",
        "kind": "exit",
        "state": "recovery lifetime passed with the selection still held; nothing further is sent",
        "class": "timeout",
        "terminal": false,
        "reEntry": "a new selection is a new instance, and enters silently while the cooldown runs"
      },
      {
        "id": "h.process",
        "kind": "handoff",
        "to": "ACQ-11",
        "on": "a process started from the selection - the process owns recovery from that moment",
        "carries": [
          "the selection and its items",
          "the recovery touches already sent for the selection, so the process plan counts them against the person"
        ],
        "suppresses": [
          "every queued recovery touch for this selection"
        ],
        "contract": {
          "requiredFields": [
            "selection_id",
            "person_id",
            "logical_process_id",
            "touches_sent"
          ]
        }
      }
    ],
    "implementation": {
      "attributes": {
        "required": [
          "selection_id",
          "person_id",
          "items",
          "last_selection_activity_at",
          "resume_destination"
        ],
        "optional": [
          "value",
          "currency",
          "category",
          "has_active_app_session",
          "item_availability",
          "item_prices"
        ]
      }
    },
    "measurement": {
      "journeyOutcome": {
        "type": "exit-or-handoff",
        "refs": [
          "x.converted",
          "x.invalid",
          "x.unavailable",
          "x.no-action",
          "x.lapsed",
          "h.process"
        ]
      },
      "businessOutcome": {
        "event": "selection_converted",
        "unit": "instance",
        "observationScope": {
          "type": "self"
        },
        "window": {
          "type": "until-exit"
        },
        "attribution": "touched-before-event",
        "comparison": "persistent-holdout",
        "holdout": {
          "key": "selection.holdout_share",
          "rule": "A persistent per-person holdout is required: people who leave a selection return to it on their own often enough that a treated-only measurement cannot tell the journey's effect from theirs.",
          "default": {
            "value": 10,
            "confidence": "low",
            "basis": "example-only"
          },
          "required": false
        }
      },
      "secondary": [
        "process_started"
      ],
      "guardrails": [
        "unsubscribe",
        "complaint",
        "message_after_success",
        "unavailable_item_shown",
        "incentive_issued"
      ],
      "operational": [
        "entry_volume",
        "no_action_rate_by_reason",
        "channel_role_used_t1",
        "change_rearm_rate",
        "process_handoff_rate"
      ]
    },
    "discovery": {
      "aliases": [
        "cart abandonment",
        "abandoned cart",
        "add-to-cart abandonment",
        "basket reminder",
        "saved item reminder",
        "wishlist reminder",
        "abandoned basket"
      ],
      "useCases": [
        "items placed in a cart and left without starting checkout",
        "a saved list or wishlist the person has not returned to"
      ],
      "presets": [
        {
          "id": "cart-abandonment",
          "name": "Cart Abandonment",
          "applicableWhen": {
            "id": "p.cart",
            "label": "CANONICAL_RULE",
            "text": "The selection is a shopping cart or basket the person filled without starting checkout; the platform asserts item availability and price."
          },
          "overrides": {},
          "destination": "the cart",
          "aliases": [
            "cart abandonment",
            "abandoned cart",
            "abandoned basket",
            "add-to-cart abandonment"
          ]
        },
        {
          "id": "saved-item-reminder",
          "name": "Saved Item Reminder",
          "applicableWhen": {
            "id": "p.saved",
            "label": "CANONICAL_RULE",
            "text": "The selection is a saved list or wishlist: a declared interest with no purchase intent asserted, so the first check is much later and a change on a saved item is the honest reason to write."
          },
          "overrides": {
            "selection.first_check": {
              "min": "3 days",
              "max": "7 days"
            },
            "selection.lifetime": {
              "min": "14 days",
              "max": "30 days"
            }
          },
          "destination": "the saved list",
          "aliases": [
            "saved item reminder",
            "wishlist reminder",
            "saved for later",
            "favourites reminder"
          ]
        }
      ]
    },
    "distinctFrom": [
      {
        "journey": "ACQ-11",
        "because": "ACQ-11 pursues a process with state, an expiry and a resume destination. A selection has no process state and no expiry, which is why this journey never names a deadline and hands over the moment a process starts."
      },
      {
        "journey": "ACQ-13",
        "because": "ACQ-13 works from inferred attention. A selection is a recorded fact the person created, and the touch can show it back to them."
      }
    ],
    "guardrails": [
      "Nothing is claimed that the system does not assert: no reserved stock, no held price, no discount, no expiry.",
      "An unavailable item is never shown; a selection with nothing available exits silently.",
      "Opens and clicks are engagement evidence and change nothing; only selection, order and process events move the state.",
      "A process started from the selection hands over immediately; two recoveries never run against the same items."
    ],
    "reusableRule": "A held selection is recovered against its own current state - items, availability, price - re-read before every touch, with no deadline invented for something that has none."
  },
  {
    "id": "ACQ-13",
    "slug": "unresolved-interest-recovery",
    "category": "acquisition",
    "goal": "recovery-retry",
    "channels": [
      "email",
      "push",
      "in-app"
    ],
    "name": "Interest inferred → qualified → resolved into a selection or purchase, or left alone",
    "shortName": "Unresolved Interest Recovery",
    "purpose": "Follow up qualified, unresolved attention to an item, category or search - browsing that ended in neither a selection nor a process - with at most one touch, and record no-action as the normal outcome whenever the attention does not qualify.",
    "objective": "Bring a person whose attention qualified as interest back to the thing they looked at, once, without asserting stock, price or intent the system does not hold; and leave alone everyone whose attention did not qualify.",
    "entity": {
      "scope": "an inferred interest - a person's repeated, recent, attributed attention to one item, category or search that ended in neither a selection nor a process",
      "note": "The trigger is behavioural, not authoritative: nothing was recorded by the person, so a qualification step stands between the signal and any instance. Most signals do not qualify, and no-action is the common outcome by design. One instance per person and interest key; a new key is a new interest.",
      "instanceKey": [
        "person_id",
        "interest_key"
      ],
      "concurrency": "one-active-per-key",
      "supersession": {
        "id": "s.supersession",
        "label": "CANONICAL_RULE",
        "text": "A selection or a process for the same items supersedes the interest: the selection or process journey owns the person from that moment, and the interest instance closes as resolved."
      }
    },
    "eligibility": [
      "the attention is attributed to a person we may contact - not a bot, not an unattributed session",
      "the attention meets the company's qualification rule (interest.qualification_rule): repeated, recent, and on something the person could act on",
      "no selection, order or process exists for the item or category since the attention",
      "the item or category is currently available as the platform asserts it",
      "no interest instance is already open for this person and interest key",
      "purpose-level permission for commercial recovery communication is recorded, and hard gates (GLB-31) allow it"
    ],
    "suppressions": [
      {
        "id": "s.not-qualified",
        "label": "CANONICAL_RULE",
        "text": "Attention that does not meet the qualification rule is recorded as no-action and nothing is sent; a single view is never a reason to write."
      },
      {
        "id": "s.resolved",
        "label": "CANONICAL_RULE",
        "text": "Exit the moment the person records a selection, starts a process or completes a purchase for the item or category; every touch re-reads this first."
      },
      {
        "id": "s.already-held",
        "label": "CANONICAL_RULE",
        "text": "Attention to something the person already holds - an item already bought, a plan already on - is not interest and sends nothing."
      },
      {
        "id": "s.permission",
        "label": "CANONICAL_RULE",
        "text": "No touch without purpose-level permission for commercial recovery communication; absent permission is a recorded no-action."
      },
      {
        "id": "s.contest",
        "label": "CANONICAL_RULE",
        "text": "This journey is lowest in the commerce-recovery group: a process recovery, a selection recovery or a predicted-need replenishment for the same person suppresses it, as does any open complaint, payment recovery or retention-outreach journey (GLB-06)."
      },
      {
        "id": "s.cooldown",
        "label": "RECOMMENDED_DEFAULT",
        "text": "A new interest inside the cooldown after a lapsed or suppressed instance is tracked and sends nothing; the same interest key re-qualifying inside the cooldown is the same interest."
      }
    ],
    "contact": {
      "defaultPriority": "promotional",
      "pressureClass": "promotional",
      "localCap": {
        "value": {
          "key": "interest.touches",
          "rule": "One touch per qualified interest; the plan has no second touch because nothing the person did asked for one.",
          "default": {
            "value": 1,
            "confidence": "high",
            "basis": "corpus-rule",
            "applicableWhen": "the graph reaches at most one touch per instance"
          },
          "required": false
        },
        "appliesTo": "all"
      },
      "cooldown": {
        "key": "interest.cooldown",
        "rule": "After a lapsed or suppressed instance, a new interest by the same person is tracked but not messaged until the cooldown has passed. A resolved interest carries no cooldown.",
        "class": "cooldown",
        "default": {
          "value": {
            "min": "14 days",
            "max": "30 days"
          },
          "confidence": "low",
          "basis": "example-only"
        },
        "required": false
      },
      "competition": {
        "exclusionGroup": "commerce-recovery",
        "scope": "person",
        "precedence": "lowest in the group - a process in motion, a held selection and a predicted need all outrank an inferred interest for the same person"
      , "onLoss": "suppressed" }
    },
    "channelStrategy": {
      "roles": [
        {
          "role": "low-friction",
          "channels": [
            "push",
            "in-app"
          ],
          "when": "an app session or a valid push token exists for this person - the attention is recent and a route back beats content"
        },
        {
          "role": "persistent",
          "channels": [
            "email"
          ],
          "when": "no low-friction route exists, or the touch has to carry the thing looked at and survive until the person can act"
        }
      ],
      "fallback": "same-role-other-channel",
      "label": "RECOMMENDED_DEFAULT"
    },
    "orchestration": {
      "strategy": "single-notice",
      "touches": [
        {
          "id": "t1",
          "stage": "recovery",
          "action": "a.touch1",
          "gatedBy": "w.settle",
          "prerequisites": [
            "c.state",
            "c.sendable"
          ],
          "purpose": "The thing they looked at, as it stands now, and a route back to it. Nothing about stock, price or intent that the system does not assert.",
          "channelRoles": [
            "low-friction",
            "persistent"
          ],
          "destination": {
            "target": "interest-subject",
            "boundTo": "interest_key",
            "mustNotClaim": [
              "stock is reserved",
              "the price is held",
              "a discount applies",
              "that they meant to buy it"
            ]
          },
          "mandatory": false,
          "label": "RECOMMENDED_DEFAULT"
        }
      ],
      "noAction": [
        "s.not-qualified",
        "s.resolved",
        "s.already-held",
        "s.permission",
        "s.contest",
        "s.cooldown"
      ]
    },
    "entry": "t.interest",
    "nodes": [
      {
        "id": "t.interest",
        "kind": "trigger",
        "event": "interest_signal_recorded",
        "evidence": {
          "requires": [
            "attributed attention to one item, category or search, with its timestamps",
            "the qualification rule's inputs: how often, how recently, and whether a selection or process followed",
            "the subject's current availability as the platform asserts it"
          ],
          "insufficientAlone": [
            "a single page view",
            "attention inside a session that ended in a selection or a process - those journeys own it",
            "an unattributed or automated session",
            "attention to something the person already holds"
          ],
          "source": "behavioral"
        },
        "next": "c.qualify"
      },
      {
        "id": "c.qualify",
        "kind": "condition",
        "asks": "Does this attention qualify as interest, and is it still unresolved?",
        "branches": [
          {
            "label": "Qualified and unresolved",
            "when": "the qualification rule is met, no selection, order or process followed, the subject is available, permission is recorded and no instance is open",
            "observes": "interest signal, selection and process records, availability, permission record",
            "to": "a.open"
          },
          {
            "label": "Already resolved",
            "when": "a selection, order or process for the subject exists since the attention",
            "observes": "selection and process records",
            "to": "x.resolved"
          },
          {
            "label": "Does not qualify",
            "when": "the rule is not met, the subject is unavailable or already held, or permission is absent - the reason is recorded",
            "observes": "qualification rule, availability, permission record",
            "to": "a.record-no-action"
          }
        ]
      },
      {
        "id": "a.open",
        "kind": "action",
        "does": "Open the interest instance against the person and interest key and start the clock from the last attention. Further attention before the touch moves the clock; nothing after it extends any window",
        "writes": [
          {
            "field": "recovery_log",
            "mode": "append"
          }
        ],
        "idempotencyKey": "person_id + interest_key",
        "next": "w.settle"
      },
      {
        "id": "w.settle",
        "kind": "wait",
        "until": [
          "selection_recorded",
          "process_started",
          "purchase_completed"
        ],
        "onEvent": "x.resolved",
        "timeout": {
          "after": {
            "key": "interest.settle_window",
            "rule": "The touch waits long enough after the last attention that the person has actually left the subject rather than paused on it, and no longer than the attention stays fresh.",
            "class": "recovery-window",
            "default": {
              "value": {
                "min": "12 hours",
                "max": "48 hours"
              },
              "confidence": "low",
              "basis": "example-only",
              "avoidWhen": "a subject with its own short availability, where the settle window is that minus a margin"
            },
            "required": false
          },
          "reason": "attention that is still going on is not unresolved; the clock runs from the last of it",
          "relativeTo": "attribute",
          "attribute": "last_interest_at"
        },
        "onTimeout": "c.state",
        "recheck": "the interest re-read: still no selection, order or process for the subject; the subject still available; the person still contactable",
        "windowExtendsOnEngagement": false
      },
      {
        "id": "c.state",
        "kind": "condition",
        "asks": "Is the interest still unresolved, and is its subject still there?",
        "branches": [
          {
            "label": "Unresolved, subject available",
            "when": "no selection, order or process followed and the platform asserts the subject as available",
            "observes": "selection and process records, availability",
            "to": "c.sendable"
          },
          {
            "label": "Resolved meanwhile",
            "when": "a selection, order or process for the subject was recorded",
            "observes": "selection_recorded, process_started, purchase_completed",
            "to": "x.resolved"
          },
          {
            "label": "Subject gone",
            "when": "the platform now asserts the subject as unavailable",
            "observes": "availability",
            "to": "x.unavailable"
          }
        ]
      },
      {
        "id": "c.sendable",
        "kind": "condition",
        "asks": "May the touch go out?",
        "branches": [
          {
            "label": "Sendable",
            "when": "the send path passes: permission for commercial recovery, a deliverable destination, the promotional pressure cap, no higher-precedence contest on the person, and no cooldown in force",
            "observes": "send path stages 1-8",
            "to": "a.touch1"
          },
          {
            "label": "Suppressed",
            "when": "a gate stops it; the gate is recorded as the reason",
            "observes": "send path stages 1-8",
            "to": "a.record-no-action"
          }
        ]
      },
      {
        "id": "a.record-no-action",
        "kind": "action",
        "does": "Record why nothing was sent - not qualified, unavailable, already held, no permission, or a gate on the send path - so that no-action, the common outcome here, is a measured one",
        "writes": [
          {
            "field": "suppressed_sends",
            "mode": "append"
          }
        ],
        "next": "x.no-action"
      },
      {
        "id": "a.touch1",
        "kind": "action",
        "does": "Show the thing they looked at as it stands now and give a route back to it. Claim nothing the system does not assert: no reserved stock, no held price, no discount, and no assumption about what they meant",
        "execution": "communication",
        "idempotencyKey": "person_id + interest_key + touch id",
        "writes": [
          {
            "field": "recovery_log",
            "mode": "append"
          }
        ],
        "next": "w.after"
      },
      {
        "id": "w.after",
        "kind": "wait",
        "until": [
          "selection_recorded",
          "process_started",
          "purchase_completed"
        ],
        "onEvent": "x.resolved",
        "timeout": {
          "after": {
            "key": "interest.lifetime",
            "rule": "After the one touch the instance stays open only long enough to observe a resolution; then it lapses and nothing further is sent.",
            "class": "observation-window",
            "default": {
              "value": {
                "min": "3 days",
                "max": "7 days"
              },
              "confidence": "low",
              "basis": "example-only"
            },
            "required": false
          },
          "reason": "the only remaining question is whether the interest resolved; there is no second touch to time",
          "relativeTo": "previous-touch"
        },
        "onTimeout": "x.lapsed",
        "recheck": "selection, order and process records re-read for the subject",
        "windowExtendsOnEngagement": false
      },
      {
        "id": "x.resolved",
        "kind": "exit",
        "state": "resolved; a selection, process or purchase for the subject is recorded and its own journey owns it",
        "class": "success",
        "terminal": false,
        "reEntry": "a new interest key is a new interest"
      },
      {
        "id": "x.unavailable",
        "kind": "exit",
        "state": "the subject became unavailable; nothing is sent about something the person cannot act on",
        "class": "invalid-state",
        "terminal": false,
        "reEntry": "a new interest key is a new interest"
      },
      {
        "id": "x.no-action",
        "kind": "exit",
        "state": "no touch sent; the reason is recorded - the common outcome of this journey",
        "class": "no-action",
        "terminal": false,
        "reEntry": "the same interest key re-qualifying inside the cooldown is the same interest; a new key is a new interest"
      },
      {
        "id": "x.lapsed",
        "kind": "exit",
        "state": "touched once, not resolved; nothing further is sent",
        "class": "timeout",
        "terminal": false,
        "reEntry": "a new interest key is a new interest, and enters silently while the cooldown runs"
      }
    ],
    "implementation": {
      "attributes": {
        "required": [
          "person_id",
          "interest_key",
          "subject_type",
          "subject_ref",
          "last_interest_at",
          "attention_count",
          "resume_destination"
        ],
        "optional": [
          "category",
          "has_active_app_session",
          "subject_availability",
          "query_text"
        ]
      }
    },
    "measurement": {
      "journeyOutcome": {
        "type": "exit",
        "refs": [
          "x.resolved",
          "x.unavailable",
          "x.no-action",
          "x.lapsed"
        ]
      },
      "businessOutcome": {
        "event": "purchase_completed",
        "unit": "instance",
        "observationScope": {
          "type": "self"
        },
        "window": {
          "type": "until-exit"
        },
        "attribution": "touched-before-event",
        "comparison": "persistent-holdout",
        "holdout": {
          "key": "interest.holdout_share",
          "rule": "A persistent per-person holdout is required: people who browse buy on their own far more often than a touch changes, and without a holdout the journey claims every purchase that followed a view.",
          "default": {
            "value": 10,
            "confidence": "low",
            "basis": "example-only"
          },
          "required": false
        }
      },
      "secondary": [
        "selection_recorded",
        "process_started"
      ],
      "guardrails": [
        "unsubscribe",
        "complaint",
        "message_after_success",
        "touch_on_unqualified_interest"
      ],
      "operational": [
        "signal_volume",
        "qualification_rate",
        "no_action_rate_by_reason",
        "touch_rate",
        "resolution_by_type"
      ]
    },
    "discovery": {
      "aliases": [
        "browse abandonment",
        "product view abandonment",
        "search abandonment",
        "browse recovery",
        "viewed but not added",
        "category interest follow-up"
      ],
      "useCases": [
        "repeated views of one product with no add to cart",
        "a category browsed across sessions with no selection",
        "a repeated search that never led to a selection"
      ],
      "presets": [
        {
          "id": "browse-abandonment",
          "name": "Browse Abandonment",
          "applicableWhen": {
            "id": "p.browse",
            "label": "CANONICAL_RULE",
            "text": "The subject is a category or listing the person browsed repeatedly; the touch points back at the category, never at an item the person did not single out."
          },
          "overrides": {},
          "destination": "the category or listing",
          "aliases": [
            "browse abandonment",
            "category abandonment",
            "browse recovery"
          ]
        },
        {
          "id": "product-view-abandonment",
          "name": "Product View Abandonment",
          "applicableWhen": {
            "id": "p.product",
            "label": "CANONICAL_RULE",
            "text": "The subject is one item viewed repeatedly; the touch shows that item as it stands and its current availability as the platform asserts it."
          },
          "overrides": {
            "interest.settle_window": {
              "min": "6 hours",
              "max": "24 hours"
            }
          },
          "destination": "the item",
          "aliases": [
            "product view abandonment",
            "viewed product reminder",
            "viewed but not added"
          ]
        },
        {
          "id": "search-abandonment",
          "name": "Search Abandonment",
          "applicableWhen": {
            "id": "p.search",
            "label": "CANONICAL_RULE",
            "text": "The subject is a repeated search that led to no selection; the touch points back at the results as they stand. An availability enquiry that holds something is SCH-282's, not this."
          },
          "overrides": {},
          "destination": "the search results",
          "aliases": [
            "search abandonment",
            "abandoned search",
            "search follow-up"
          ]
        }
      ]
    },
    "distinctFrom": [
      {
        "journey": "ACQ-12",
        "because": "ACQ-12 works from a selection the person recorded. Interest is inferred from attention, which is why a qualification step stands before any instance and no-action is the common outcome."
      },
      {
        "journey": "SCH-282",
        "because": "SCH-282 follows an availability enquiry with restorable state. A search here holds nothing; it is attention, not an enquiry."
      }
    ],
    "guardrails": [
      "A single view is never a reason to write; the qualification rule stands between every signal and every instance.",
      "Nothing is asserted about stock, price or what the person meant.",
      "One touch, then observation; there is no second touch because nothing the person did asked for one.",
      "A selection or process for the subject hands ownership to its own journey immediately."
    ],
    "reusableRule": "Inferred interest is acted on only after it qualifies against a stated rule and is re-read as still unresolved; the touch shows the subject as it stands and nothing more, and no-action is the outcome that is measured most."
  },
];
