import type { CanonicalJourney, OrchestrationRule } from "./types";

/* CATEGORY 3 - ENGAGEMENT, HEALTH, RETENTION & CHURN PREVENTION

   Six words get used interchangeably in retention work and mean six different
   things:

     ACTIVITY      something happened
     ENGAGEMENT    something meaningful happened, at the rate it should
     HEALTH        the relationship is producing what it was bought for
     CHURN RISK    several independent things say it may end
     CHURN INTENT  someone has said they want it to end
     CHURN         it ended

   Every collapse between two of them produces a specific failure, and this
   category is nine journeys drawing the lines between them. RET-21 keeps
   engagement a changing state rather than a label. RET-22 refuses to read
   absence as evidence without a pattern to read it against. RET-23 insists a
   health score name what moved it before anyone is contacted. RET-24 makes
   intervention scale with evidence instead of with account value. RET-26 stops
   compensation being the default apology. RET-27 is the whole category in one
   journey: a good sign is the start of recovery, not recovery. RET-28 and
   RET-29 are the two sides of the intent/completion line, and RET-30 makes an
   intervention finish only when its actual outcome is known.

   RET-25 is not here. Evaluating a risk signal is a risk and policy
   responsibility rather than a retention one, and it opened on the same event
   as RSK-192, which now owns it.

   Almost everything here can conclude that nothing should be sent. That is
   not a gap in the category, it is most of the point of it. */

export const RETENTION_RULES: readonly OrchestrationRule[] = [
  {
    id: "RET-R1",
    scope: "retention",
    rule: "Activity, engagement, health, churn risk and churn are five separate concepts and are never used as proxies for one another.",
    because:
      "They are ordered by how hard each is to measure, so the cheap one always stands in for the expensive one unless that substitution is forbidden outright.",
  },
  {
    id: "RET-R2",
    scope: "retention",
    rule: "Inactivity is evaluated against the expected usage cadence of the relationship, never against a fixed interval.",
    because:
      "A universal no-login-for-N-days rule reports every episodic and seasonal customer as failing, and the resulting noise trains everyone to ignore the alert.",
  },
  {
    id: "RET-R3",
    scope: "retention",
    rule: "Risk scores and risk signals are evidence. They are not the business decision, and nothing is enforced on a score alone.",
    because:
      "A score is a compression of evidence, and acting on the compression rather than the evidence means nobody can say afterwards what actually happened.",
  },
  {
    id: "RET-R4",
    scope: "retention",
    rule: "A known operational problem is resolved before any promotional retention tactic is used.",
    because:
      "A discount offered to someone whose integration is broken answers a question they did not ask and confirms that nobody read the ticket.",
  },
  {
    id: "RET-R5",
    scope: "retention",
    rule: "Recovery passes through an observation state. One positive event opens it; sustained behaviour closes it.",
    because:
      "Declaring recovery on the first good signal is how a relapse becomes invisible - the state says recovered, so nothing is watching when it goes wrong again.",
  },
  {
    id: "RET-R6",
    scope: "retention",
    rule: "Cancellation intent and cancellation completion are separate states and never share an event.",
    because:
      "Treating intent as completion writes off customers who were still deciding; treating completion as intent keeps selling to people who have already left.",
  },
  {
    id: "RET-R7",
    scope: "retention",
    rule: "A completed cancellation immediately invalidates every incompatible retention action, including sends already queued.",
    because:
      "The save offer that arrives after the cancellation went through is the last thing the relationship produces, and it is the one that gets screenshotted.",
  },
  {
    id: "RET-R8",
    scope: "retention",
    rule: "Cancellation, account closure and data deletion are three independent lifecycle states with three separate triggers.",
    because:
      "Collapsing them destroys data someone still has a right to, or keeps data someone has asked to have removed. Both failures are irreversible and only one of them is visible.",
  },
  {
    id: "RET-R9",
    scope: "retention",
    rule: "Where a person or an open case is already resolving the underlying problem, duplicate automated intervention on it is suppressed.",
    because:
      "The automated track is always the one working from stale state, so it contradicts the human one in front of the customer at the worst possible moment.",
  },
  {
    id: "RET-R10",
    scope: "retention",
    rule: "Retention interventions are bounded in number and complete only on an explicit outcome.",
    because:
      "An intervention with no defined end repeats until someone leaves, which converts a retention programme into a reason to go.",
  },
  {
    id: "RET-R11",
    scope: "retention",
    rule: "A declared cancellation reason stays auditable and is never silently replaced by an inferred one.",
    because:
      "The declared reason is the only direct evidence of why someone left; overwriting it with a model's guess destroys the one input that could have improved the product.",
  },
  {
    id: "RET-R12",
    scope: "retention",
    rule: "Every risk, health and recovery state is scoped to the person, account, subscription or entity it was observed on.",
    because:
      "One failing subscription does not make an account unhealthy, and treating it as though it does suppresses messaging the rest of the relationship still needs.",
  },
];

export const RETENTION_JOURNEYS: readonly CanonicalJourney[] = [
  /* ------------------------------------------------------------ RET-21 */
  {
    id: "RET-21",
    slug: "engagement-state-reclassification",
    category: "retention",
    goal: "health-risk-signal-scoring",
    channels: [],
    name: "Engagement state change → reclassify → appropriate lifecycle",
    shortName: "Engagement Reclassification",
    purpose:
      "Hold engagement as a state that moves in both directions, and decide separately whether a movement is worth acting on.",
    entity: {
      scope: "person or account, per product or service relationship",
      note: "Engagement is per relationship. Someone quiet in one product and heavy in another has two states, not an average.",
      instanceKey: [
        "account_id",
        "relationship_id"
      ],
      concurrency: "one-active-per-key"
    },
    distinctFrom: [
      {
        journey: "RET-22",
        because:
          "This reacts to a state that has already been recalculated. RET-22 reacts to one specific expected thing not happening, which may or may not move the state at all.",
      },
    ],
    objective: "Hold engagement as a state that moves in both directions, and decide separately whether a movement is worth acting on.",
    eligibility: [
      "a recalculated engagement state - HIGH, NORMAL, DECLINING, LOW or DORMANT - that differs from the one on record",
      "computed from meaningful usage, frequency, recency, depth, value-producing actions, the expected cadence and the maturity of the relationship",
      "no instance of this journey is already open for the person or account",
      "hard gates (GLB-31) allow communication for this purpose"
    ],
    suppressions: [
      {
        "id": "s.g1",
        "label": "CANONICAL_RULE",
        "text": "A raw session count is not engagement. Someone opening the product daily and producing nothing is not more engaged than someone producing something monthly."
      },
      {
        "id": "s.g2",
        "label": "CANONICAL_RULE",
        "text": "Email opens are not relationship health. They measure the message."
      },
      {
        "id": "s.g3",
        "label": "CANONICAL_RULE",
        "text": "Expected engagement varies by product and use-case, so the state is always computed against this relationship's own cadence."
      }
    ],
    implementation: {
      "attributes": {
        "required": [
          "account_id",
          "relationship_id",
          "engagement_state_history",
          "suppressed_sends"
        ],
        "optional": []
      }
    },
    measurement: {
      "journeyOutcome": {
        "type": "exit-or-handoff",
        "refs": [
          "x.updated",
          "h.health"
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
        "engagement reclassification",
        "engagement scoring",
        "engagement state",
        "engagement decline detection"
      ],
      "useCases": [
        "an engagement state recomputed from real usage, moving in both directions",
        "deciding separately whether a movement is worth acting on"
      ]
    },
    entry: "t.changed",
    nodes: [
      {
        id: "t.changed",
        kind: "trigger",
        event: "engagement_state_materially_changed",
        evidence: {
          requires: [
            "a recalculated engagement state - HIGH, NORMAL, DECLINING, LOW or DORMANT - that differs from the one on record",
            "computed from meaningful usage, frequency, recency, depth, value-producing actions, the expected cadence and the maturity of the relationship",
          ],
          insufficientAlone: [
            "a raw session count",
            "email opens or clicks",
            "a login streak with nothing produced behind it",
          ],
          source: "behavioral",
        },
        next: "a.evaluate",
      },
      {
        id: "a.evaluate",
        kind: "action",
        does: "Evaluate the new state against what this relationship's own cadence predicts, rather than against a shared benchmark - the same monthly rhythm is healthy in one product and alarming in another",
        writes: [{ field: "engagement_state_history", mode: "append" }],
        next: "c.direction",
        idempotencyKey: "account_id + relationship_id + a.evaluate",
      },
      {
        id: "c.direction",
        kind: "condition",
        asks: "Which way did the state move?",
        branches: [
          {
            label: "Improved",
            when: "the new state is stronger than the one it replaces",
            to: "a.improved",
          },
          {
            label: "Deteriorated",
            when: "the new state is weaker than the one it replaces",
            to: "c.expected",
          },
        ],
      },
      {
        id: "a.improved",
        kind: "action",
        does: "Record the improvement and suppress the interventions that existed only because of the weaker state, including any already queued - a re-engagement nudge sent to someone who has already re-engaged is the clearest evidence that nothing was watching",
        writes: [{ field: "suppressed_sends", mode: "append" }],
        next: "x.updated",
        idempotencyKey: "account_id + relationship_id + a.improved",
      },
      {
        id: "c.expected",
        kind: "condition",
        asks: "Is the decline expected for this relationship, or anomalous?",
        branches: [
          {
            label: "Expected",
            when: "the pattern is known - seasonal, episodic, a project that ended, a cadence this account has always had",
            to: "x.updated",
          },
          {
            label: "Anomalous",
            when: "the decline departs from what this relationship's own history predicts",
            to: "c.intervention",
          },
        ],
      },
      {
        id: "c.intervention",
        kind: "condition",
        asks: "Does the anomaly warrant a meaningful intervention?",
        branches: [
          {
            label: "Worth acting on",
            when: "the decline is large enough, or corroborated enough, to be worth diagnosing",
            to: "h.health",
          },
          {
            label: "State update only",
            when: "the movement is real but small, and acting on it would cost more attention than it is worth",
            to: "x.updated",
          },
        ],
      },
      {
        id: "h.health",
        kind: "handoff",
        to: "RET-23",
        on: "an anomalous engagement decline worth diagnosing",
        carries: [
          "which dimensions moved and by how much, so the diagnosis starts from evidence rather than from a score",
          "the expected cadence the decline was judged against",
        ],
      },
      {
        id: "x.updated",
        kind: "exit",
        state: "engagement state updated, nothing triggered",
        terminal: false,
        reEntry:
          "the next material change re-opens this; most passes through this journey correctly end here, having changed a state and sent nothing",
        class: "success",
      },
    ],
    guardrails: [
      "A raw session count is not engagement. Someone opening the product daily and producing nothing is not more engaged than someone producing something monthly.",
      "Email opens are not relationship health. They measure the message.",
      "Expected engagement varies by product and use-case, so the state is always computed against this relationship's own cadence.",
    ],
    reusableRule:
      "Engagement should be modeled as a changing relationship state based on meaningful behavior rather than communication activity alone.",
  },

  /* ------------------------------------------------------------ RET-22 */
  {
    id: "RET-22",
    slug: "expected-usage-miss-context-check",
    category: "retention",
    goal: "health-risk-signal-scoring",
    channels: [],
    name: "Expected usage miss → context check → observe or intervene",
    shortName: "Usage Gap Assessment",
    purpose:
      "Read a missed usage expectation as evidence only where an expectation genuinely existed, and only where something else corroborates it.",
    entity: {
      scope: "person or account plus the product or use-case the expectation belongs to",
      note: "Expectations differ by role inside the same account. An administrator who logs in monthly and an analyst who logs in daily are not measured against one pattern.",
      instanceKey: [
        "account_id",
        "use_case_id"
      ],
      concurrency: "one-active-per-key"
    },
    objective: "Read a missed usage expectation as evidence only where an expectation genuinely existed, and only where something else corroborates it.",
    eligibility: [
      "a usage expectation that was actually established for this relationship and role, and was not met",
      "no instance of this journey is already open for the person or account plus the product or use",
      "hard gates (GLB-31) allow communication for this purpose"
    ],
    suppressions: [
      {
        "id": "s.g1",
        "label": "CANONICAL_RULE",
        "text": "No login for seven days is not a universal churn rule. It is a rule about one product's cadence and it does not travel."
      },
      {
        "id": "s.g2",
        "label": "CANONICAL_RULE",
        "text": "Different roles in the same account carry different usage expectations, and are measured separately."
      },
      {
        "id": "s.g3",
        "label": "CANONICAL_RULE",
        "text": "Absence is evidence only relative to an expectation that actually existed. Where none did, nothing was missed."
      }
    ],
    implementation: {
      "attributes": {
        "required": [
          "account_id",
          "use_case_id",
          "expected_pattern",
          "last_usage_at",
          "corroborating_evidence"
        ],
        "optional": []
      }
    },
    measurement: {
      "journeyOutcome": {
        "type": "exit-or-handoff",
        "refs": [
          "x.normal-quiet",
          "x.observe",
          "h.health"
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
        "usage gap assessment",
        "usage drop",
        "missed usage milestone",
        "inactivity check",
        "expected cadence miss"
      ],
      "useCases": [
        "a missed usage rhythm read against the pattern this relationship actually had",
        "a quiet period that is normal for the use-case and sends nothing"
      ]
    },
    entry: "t.missed",
    nodes: [
      {
        id: "t.missed",
        kind: "trigger",
        event: "expected_usage_milestone_or_cadence_missed",
        evidence: {
          requires: [
            "a usage expectation that was actually established for this relationship and role, and was not met",
          ],
          insufficientAlone: [
            "a fixed no-activity-for-N-days rule applied without an expected pattern behind it",
            "one missed period in a rhythm that has always been irregular",
          ],
          source: "behavioral",
        },
        next: "a.compare",
      },
      {
        id: "a.compare",
        kind: "action",
        does: "Compare the actual behaviour with the pattern expected for this use-case and this role, not with an account-wide or product-wide average",
        next: "c.episodic",
      },
      {
        id: "c.episodic",
        kind: "condition",
        asks: "Is this usage naturally episodic or seasonal?",
        branches: [
          {
            label: "Episodic or seasonal",
            when: "the product is used in bursts, around events, or at intervals that make a quiet period normal",
            to: "x.normal-quiet",
          },
          {
            label: "Continuous expectation",
            when: "this relationship genuinely predicted usage that did not happen",
            to: "a.inspect",
          },
        ],
      },
      {
        id: "x.normal-quiet",
        kind: "exit",
        state: "quiet period within the normal pattern; observation continues, nothing sent",
        terminal: false,
        reEntry:
          "a miss that departs from the episodic pattern itself - a season skipped, an event cycle missed - re-opens this properly",
        class: "no-action",
      },
      {
        id: "a.inspect",
        kind: "action",
        does: "Look for evidence around the absence: repeated failures, an unresolved blocker, falling value realisation, negative feedback, narrowing depth or breadth, any exploration of cancellation",
        next: "c.corroborated",
      },
      {
        id: "c.corroborated",
        kind: "condition",
        asks: "Does other negative evidence exist alongside the absence?",
        branches: [
          {
            label: "Corroborated",
            when: "at least one independent negative signal accompanies the missed usage",
            to: "h.health",
          },
          {
            label: "Absence only",
            when: "nothing but the missing activity itself",
            to: "x.observe",
          },
        ],
      },
      {
        id: "x.observe",
        kind: "exit",
        state: "observation state; a miss with nothing behind it is not risk",
        terminal: false,
        reEntry:
          "a second miss, or any corroborating signal, re-opens this - absence accumulates into evidence, it does not start as evidence",
        class: "no-action",
      },
      {
        id: "h.health",
        kind: "handoff",
        to: "RET-23",
        on: "a missed expectation corroborated by other negative evidence",
        carries: [
          "the expectation that was missed and what it was based on",
          "the corroborating signals, which are the starting point of the diagnosis",
        ],
      },
    ],
    guardrails: [
      "No login for seven days is not a universal churn rule. It is a rule about one product's cadence and it does not travel.",
      "Different roles in the same account carry different usage expectations, and are measured separately.",
      "Absence is evidence only relative to an expectation that actually existed. Where none did, nothing was missed.",
    ],
    reusableRule:
      "Missing expected usage becomes meaningful only when evaluated against the relationship's normal value cadence.",
  },

  /* ------------------------------------------------------------ RET-23 */
  {
    id: "RET-23",
    slug: "health-deterioration-diagnosis",
    category: "retention",
    goal: "relationship-recovery-intervention",
    channels: [],
    name: "Health deterioration → diagnose cause → recovery route",
    shortName: "Health Deterioration Diagnosis",
    purpose:
      "Send a deteriorating relationship to the mechanism that is actually breaking it, and never to a generic retention campaign in its place.",
    entity: {
      scope: "person, account, subscription or customer relationship - whichever the health state is held against",
      note: "One failing subscription does not make the account unhealthy. The diagnosis and every route out of it stay at the level the deterioration was observed.",
      instanceKey: [
        "account_id",
        "relationship_id"
      ],
      concurrency: "one-active-per-key"
    },
    distinctFrom: [
      {
        journey: "RET-24",
        because:
          "This asks what is wrong. RET-24 asks how much is wrong and how hard to push back, and it can run on a relationship whose cause is already known and being fixed.",
      },
    ],
    objective: "Send a deteriorating relationship to the mechanism that is actually breaking it, and never to a generic retention campaign in its place.",
    eligibility: [
      "a health state or score crossing a meaningful threshold, together with the underlying evidence that moved it",
      "no instance of this journey is already open for the person",
      "hard gates (GLB-31) allow communication for this purpose"
    ],
    suppressions: [
      {
        "id": "s.g1",
        "label": "CANONICAL_RULE",
        "text": "A health score on its own is not a reason to contact anyone. The evidence behind it is."
      },
      {
        "id": "s.g2",
        "label": "CANONICAL_RULE",
        "text": "A composite score has to say which input moved it. One that cannot be decomposed cannot be routed on, and routing on it anyway sends every cause the same message."
      },
      {
        "id": "s.g3",
        "label": "CANONICAL_RULE",
        "text": "A marketing incentive is not the default recovery. It is the response to exactly one cause, and only where policy supports it."
      }
    ],
    implementation: {
      "attributes": {
        "required": [
          "account_id",
          "relationship_id",
          "health_state",
          "score_inputs",
          "health_evidence"
        ],
        "optional": []
      }
    },
    measurement: {
      "journeyOutcome": {
        "type": "exit-or-handoff",
        "refs": [
          "x.need-changed",
          "x.cause-found",
          "x.unexplained",
          "h.adoption",
          "h.setup",
          "h.technical",
          "h.service",
          "h.payment",
          "h.ownership",
          "h.recovery"
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
        "health deterioration diagnosis",
        "churn risk diagnosis",
        "account health drop",
        "health score decline routing"
      ],
      "useCases": [
        "a health score crossing a threshold, routed to the mechanism that moved it",
        "a deterioration that turns out to be a changed need rather than a failure"
      ]
    },
    entry: "t.deteriorated",
    nodes: [
      {
        id: "t.deteriorated",
        kind: "trigger",
        event: "health_state_crossed_deterioration_threshold",
        evidence: {
          requires: [
            "a health state or score crossing a meaningful threshold, together with the underlying evidence that moved it",
          ],
          insufficientAlone: [
            "a composite score that cannot be decomposed into what moved it",
            "a threshold crossing driven entirely by a change in how the score is calculated",
          ],
          source: "authoritative",
        },
        next: "a.decompose",
      },
      {
        id: "a.decompose",
        kind: "action",
        does: "Break the deterioration into the evidence that produced it. A score that cannot say which input moved cannot be routed on, and routing on it anyway is how every cause ends up receiving the same message",
        writes: [{ field: "health_evidence", mode: "append" }],
        next: "c.cause",
        idempotencyKey: "subscription_id + account_id + a.decompose",
      },
      {
        id: "c.cause",
        kind: "condition",
        asks: "Is a dominant cause identifiable, and which?",
        branches: [
          {
            label: "Adoption declined",
            when: "value-producing usage fell away with no other blocker behind it",
            to: "h.adoption",
          },
          {
            label: "Setup dependency missing",
            when: "something required was never completed or has since broken",
            to: "h.setup",
          },
          {
            label: "Technical issue or support friction",
            when: "an unresolved fault, or repeated difficulty getting help with one",
            to: "h.technical",
          },
          {
            label: "Service failure",
            when: "we failed to deliver something we said we would",
            to: "h.service",
          },
          {
            label: "Billing or payment problem",
            when: "the deterioration traces to a payment that failed or a billing dispute",
            to: "h.payment",
          },
          {
            label: "Ownership or relationship change",
            when: "the person the relationship ran through has changed or left",
            to: "h.ownership",
          },
          {
            label: "Business need changed",
            when: "nothing broke; what they needed the product for is no longer what they need",
            to: "x.need-changed",
          },
          {
            label: "No dominant cause",
            when: "engagement fell with no identifiable blocker behind it",
            to: "a.diagnostic",
          },
        ],
      },
      {
        id: "h.adoption",
        kind: "handoff",
        to: "ACT-18",
        on: "deterioration driven by adoption falling away",
        carries: ["the usage pattern that stopped", "the expected pattern it was measured against"],
      },
      {
        id: "h.setup",
        kind: "handoff",
        to: "ACT-13",
        on: "deterioration traced to a missing or broken setup dependency",
        carries: ["the named dependency", "what it is blocking now that it was not blocking before"],
      },
      {
        id: "h.technical",
        kind: "handoff",
        to: "external:human-in-the-loop-lifecycle",
        on: "an unresolved technical issue or repeated support friction",
        carries: ["the issue and its history", "the health impact it has already had"],
        suppresses: ["promotional retention messaging while the fault is open"],
        contract: {
          "requiredFields": [
            "subscription_id",
            "account_id",
            "handed_at",
            "reason"
          ]
        },
      },
      {
        id: "h.service",
        kind: "handoff",
        to: "RET-26",
        on: "deterioration caused by a service failure on our side",
        carries: ["what failed and when", "whether the customer is still affected"],
      },
      {
        id: "h.payment",
        kind: "handoff",
        to: "external:payment-recovery",
        on: "deterioration traced to billing or payment",
        carries: ["the failed payment or dispute", "the entitlement currently at stake"],
        contract: {
          "requiredFields": [
            "subscription_id",
            "account_id",
            "handed_at",
            "reason"
          ]
        },
      },
      {
        id: "h.ownership",
        kind: "handoff",
        to: "external:relationship-ownership-reconciliation",
        on: "the person the relationship ran through changing or leaving",
        carries: [
          "who left and what they held",
          "the fact that the account may be healthy and simply unrepresented, which reads identically in the data",
        ],
        contract: {
          "requiredFields": [
            "subscription_id",
            "account_id",
            "handed_at",
            "reason"
          ]
        },
      },
      {
        id: "x.need-changed",
        kind: "exit",
        state: "health fell because the need changed; nothing is broken",
        terminal: false,
        reEntry:
          "a new need, or a return of the old one, re-opens this - a relationship winding down because it is finished is not a failure to recover from",
        class: "success",
      },
      {
        id: "a.diagnostic",
        kind: "action",
        does: "Open a bounded diagnostic: observe, and where appropriate ask. No incentive is attached, because an incentive offered before the cause is known teaches us nothing about the cause",
        next: "w.diagnostic",
        idempotencyKey: "subscription_id + account_id + a.diagnostic",
      },
      {
        id: "w.diagnostic",
        kind: "wait",
        until: [
          "cause_identified",
          "health_recovered"
        ],
        onEvent: "c.diagnostic-result",
        timeout: {
          "after": {
            "key": "health_deterioration.diagnostic",
            "rule": "A bounded diagnostic window.",
            "class": "observation-window",
            "required": true
          },
          "reason": "a diagnosis that has not arrived will not arrive by waiting longer, and the relationship should not sit in an open investigation indefinitely",
          "relativeTo": "trigger"
        },
        onTimeout: "x.unexplained",
        windowExtendsOnEngagement: false,
        recheck: "the person re-read from the system of record before acting on the timeout",
      },
      {
        id: "c.diagnostic-result",
        kind: "condition",
        asks: "What did the diagnostic window produce?",
        branches: [
          {
            label: "A cause",
            when: "evidence now points at something specific",
            to: "x.cause-found",
          },
          {
            label: "Recovery",
            when: "health improved without intervention",
            to: "h.recovery",
          },
        ],
      },
      {
        id: "x.cause-found",
        kind: "exit",
        state: "cause identified during the diagnostic window",
        terminal: false,
        reEntry:
          "the identified cause opens a new instance and routes on the first pass, which keeps the routing decision in one place rather than duplicating it inside the diagnostic",
        class: "success",
      },
      {
        id: "h.recovery",
        kind: "handoff",
        to: "RET-27",
        on: "health improving during the diagnostic window",
        carries: [
          "what deteriorated and what improved",
          "the fact that nothing was done, which makes the improvement worth watching rather than trusting",
        ],
      },
      {
        id: "x.unexplained",
        kind: "exit",
        state: "deterioration real, cause not found; lower-frequency monitoring",
        terminal: false,
        reEntry:
          "further deterioration or a corroborating signal re-opens this; an unexplained decline is watched rather than treated",
        class: "timeout",
      },
    ],
    guardrails: [
      "A health score on its own is not a reason to contact anyone. The evidence behind it is.",
      "A composite score has to say which input moved it. One that cannot be decomposed cannot be routed on, and routing on it anyway sends every cause the same message.",
      "A marketing incentive is not the default recovery. It is the response to exactly one cause, and only where policy supports it.",
    ],
    reusableRule:
      "Health deterioration should route to the mechanism causing the deterioration rather than trigger a generic retention campaign.",
  },

  /* ------------------------------------------------------------ RET-24 */
  {
    id: "RET-24",
    slug: "churn-risk-escalation",
    category: "retention",
    goal: "relationship-recovery-intervention",
    channels: ["task"],
    name: "Churn risk escalation → evidence → intervention priority",
    shortName: "Churn Risk Escalation",
    purpose:
      "Decide how hard to push back on a relationship at risk, in proportion to how much independent evidence there actually is.",
    entity: {
      scope: "customer, account or subscription relationship",
      note: "Risk is held where the evidence was observed. A risky subscription inside a healthy account is a risky subscription.",
      instanceKey: [
        "account_id",
        "risk_episode_id"
      ],
      concurrency: "one-active-per-key"
    },
    objective: "Decide how hard to push back on a relationship at risk, in proportion to how much independent evidence there actually is.",
    eligibility: [
      "several independent churn-relevant signals crossing a defined threshold together: sustained meaningful usage decline, a failed renewal or payment, a negative support experience, repeated unresolved blockers, explicit dissatisfaction, exploration of cancellation, a key stakeholder leaving, falling account-wide adoption",
      "no instance of this journey is already open for the customer",
      "hard gates (GLB-31) allow communication for this purpose"
    ],
    suppressions: [
      {
        "id": "s.g1",
        "label": "CANONICAL_RULE",
        "text": "A single weak signal never constitutes churn risk. Corroboration between independent signals is what the threshold is measuring."
      },
      {
        "id": "s.g2",
        "label": "CANONICAL_RULE",
        "text": "A high-value customer is not automatically at high risk. Value is what is at stake, not the probability of losing it."
      },
      {
        "id": "s.g3",
        "label": "CANONICAL_RULE",
        "text": "A risk score is not the outcome. It orders attention; it does not decide anything."
      },
      {
        "id": "s.g4",
        "label": "CANONICAL_RULE",
        "text": "The size of the intervention tracks the strength of the evidence. An expensive save offer on thin evidence teaches customers what to do when they want one."
      }
    ],
    contact: {
      "defaultPriority": "retention",
      "pressureClass": "none",
      "localCap": {
        "value": {
          "key": "churn_risk.touches",
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
        "key": "churn_risk.cooldown",
        "rule": "Escalation is per risk episode; the same episode re-crossing the threshold is the same instance and a later episode is its own.",
        "default": {
          "value": "none",
          "confidence": "high",
          "basis": "corpus-rule"
        },
        "required": false
      },
      "competition": {
        "exclusionGroup": "retention-outreach",
        "scope": "account",
        "precedence": "below an open issue under human ownership and below a declared cancellation intent on the same account, above generic retention intervention",
        "onLoss": "suppressed"
      }
    },
    channelStrategy: {
      "roles": [
        {
          "role": "human",
          "channels": [
            "task"
          ],
          "when": "the step is carried out by a person - a call, a task, a visit - and recorded as done by them"
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
          "stage": "owner-task",
          "action": "a.owner-task",
          "prerequisites": [
            "c.intent",
            "c.operational",
            "c.human"
          ],
          "purpose": "Raise a task for the account owner or customer success, carrying the evidence rather than the score, and suppress automated retention on this relationship so the person is not contradicted by a sequence while they work",
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
        "s.g4"
      ]
    },
    implementation: {
      "attributes": {
        "required": [
          "account_id",
          "risk_episode_id",
          "risk_evidence",
          "cancellation_intent_ref",
          "operational_cause_ref",
          "retention_ownership"
        ],
        "optional": []
      }
    },
    measurement: {
      "journeyOutcome": {
        "type": "exit-or-handoff",
        "refs": [
          "x.monitor",
          "h.cancellation",
          "h.resolve-first",
          "h.human",
          "h.intervention"
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
        "churn risk escalation",
        "churn risk",
        "at-risk account escalation",
        "customer success alert",
        "churn prevention (risk)"
      ],
      "useCases": [
        "several independent risk signals crossing a threshold on one account",
        "deciding between a person, an automated intervention, or watching"
      ]
    },
    entry: "t.threshold",
    nodes: [
      {
        id: "t.threshold",
        kind: "trigger",
        event: "churn_risk_threshold_crossed",
        evidence: {
          requires: [
            "several independent churn-relevant signals crossing a defined threshold together: sustained meaningful usage decline, a failed renewal or payment, a negative support experience, repeated unresolved blockers, explicit dissatisfaction, exploration of cancellation, a key stakeholder leaving, falling account-wide adoption",
          ],
          insufficientAlone: [
            "a single weak signal",
            "high account value, which describes what is at stake rather than the likelihood of losing it",
            "a risk score with no decomposable evidence behind it",
          ],
          source: "authoritative",
        },
        next: "c.intent",
      },
      {
        id: "c.intent",
        kind: "condition",
        asks: "Has explicit cancellation intent already been expressed?",
        branches: [
          {
            label: "Already cancelling",
            when: "a cancellation has been requested or a cancel flow entered",
            to: "h.cancellation",
          },
          {
            label: "No stated intent",
            when: "the risk is inferred from behaviour and events, and nobody has said anything",
            to: "a.evidence",
          },
        ],
      },
      {
        id: "h.cancellation",
        kind: "handoff",
        to: "RET-28",
        on: "cancellation intent already on record when risk escalates",
        carries: [
          "the risk evidence, which is context for the conversation rather than a second conversation",
        ],
        suppresses: [
          "any separate retention track for this relationship while the cancellation decision is live",
        ],
      },
      {
        id: "a.evidence",
        kind: "action",
        does: "Assemble the signals with their sources and strengths. What matters is whether they corroborate each other, not how many there are - three readings of the same underlying event are one piece of evidence",
        writes: [{ field: "risk_evidence", mode: "append" }],
        next: "c.operational",
        idempotencyKey: "subscription_id + account_id + a.evidence",
      },
      {
        id: "c.operational",
        kind: "condition",
        asks: "Is the risk driven by a known operational problem?",
        branches: [
          {
            label: "Known problem",
            when: "the evidence points at something specific that is broken or unresolved",
            to: "h.resolve-first",
          },
          {
            label: "No known problem",
            when: "the relationship is deteriorating and nothing identifiable is causing it",
            to: "c.human",
          },
        ],
      },
      {
        id: "h.resolve-first",
        kind: "handoff",
        to: "RET-23",
        on: "risk with an identifiable operational cause",
        carries: [
          "the risk evidence and which part of it names the problem",
          "the fact that this is already at risk level, so the cause-specific recovery knows what is at stake",
        ],
        suppresses: ["promotional retention offers on this relationship until the problem is resolved"],
      },
      {
        id: "c.human",
        kind: "condition",
        asks: "Does the evidence justify a person?",
        branches: [
          {
            label: "Justified",
            when: "the evidence is strong and corroborated, and the relationship warrants the cost of someone's attention",
            to: "a.owner-task",
          },
          {
            label: "Not justified",
            when: "the evidence is real but thin, and putting a person on it would be a larger intervention than the signal supports",
            to: "c.automated",
          },
        ],
      },
      {
        id: "a.owner-task",
        kind: "action",
        does: "Raise a task for the account owner or customer success, carrying the evidence rather than the score, and suppress automated retention on this relationship so the person is not contradicted by a sequence while they work",
        writes: [
          { field: "retention_ownership", mode: "set" },
          { field: "suppressed_sends", mode: "append" },
        ],
        next: "h.human",
        execution: "human",
        idempotencyKey: "subscription_id + account_id + a.owner-task",
      },
      {
        id: "h.human",
        kind: "handoff",
        to: "external:human-in-the-loop-lifecycle",
        on: "risk strong enough to justify a person",
        carries: [
          "the assembled evidence, so the first conversation is informed",
          "what has already been sent, so it is not repeated in person",
        ],
        contract: {
          "requiredFields": [
            "subscription_id",
            "account_id",
            "handed_at",
            "reason"
          ]
        },
      },
      {
        id: "c.automated",
        kind: "condition",
        asks: "Is a proportionate automated recovery available?",
        branches: [
          {
            label: "Available",
            when: "something exists that matches the evidence at this strength",
            to: "h.intervention",
          },
          {
            label: "Nothing proportionate",
            when: "the only available responses are larger than the evidence justifies",
            to: "x.monitor",
          },
        ],
      },
      {
        id: "h.intervention",
        kind: "handoff",
        to: "RET-30",
        on: "a proportionate automated retention intervention being delivered",
        carries: ["the evidence it was chosen against", "the risk state at the time it was sent"],
      },
      {
        id: "x.monitor",
        kind: "exit",
        state: "risk recorded, nothing proportionate to do",
        terminal: false,
        reEntry:
          "stronger or fresher evidence re-opens this at a higher level - doing nothing is a legitimate response to weak evidence, and doing something disproportionate is not",
        class: "no-action",
      },
    ],
    guardrails: [
      "A single weak signal never constitutes churn risk. Corroboration between independent signals is what the threshold is measuring.",
      "A high-value customer is not automatically at high risk. Value is what is at stake, not the probability of losing it.",
      "A risk score is not the outcome. It orders attention; it does not decide anything.",
      "The size of the intervention tracks the strength of the evidence. An expensive save offer on thin evidence teaches customers what to do when they want one.",
    ],
    reusableRule:
      "Churn intervention should increase only as independent evidence of relationship risk becomes stronger.",
  },

  /* ------------------------------------------------------------ RET-26 */
  {
    id: "RET-26",
    slug: "negative-experience-recovery",
    category: "retention",
    goal: "compensation-remedy",
    channels: ["email", "push"],
    name: "Negative experience → recovery eligibility → appropriate response",
    shortName: "Service Recovery",
    purpose:
      "Match the response to what actually failed, whether it is fixed, and whether a remedy is genuinely owed.",
    entity: {
      scope: "person or account plus the experience or service entity that failed",
      note: "The recovery belongs to the failure. A second unrelated failure is a second instance, and one apology does not cover both.",
      instanceKey: [
        "person_id",
        "failure_ref"
      ],
      concurrency: "one-active-per-key"
    },
    objective: "After an authoritative service failure, say what failed, what was done and what prevents it recurring - once, only when it is useful, only after the failure is resolved, and only where no other process already owns it; route anything owed to remedy.",
    eligibility: [
      "an authoritative record of a negative experience or service failure attributable to this person and an experience entity",
      "no other recovery process is already handling the same failure",
      "the underlying issue is resolved - nothing is said about a failure that is still ongoing",
      "hard gates (GLB-31) permit service communication"
    ],
    suppressions: [
      {
        "id": "s.duplicate",
        "label": "CANONICAL_RULE",
        "text": "Another recovery process already handling this failure owns it; this instance defers and nothing is sent."
      },
      {
        "id": "s.unresolved",
        "label": "CANONICAL_RULE",
        "text": "While the underlying issue is still broken the operational owner has it; a recovery message before the fix is a promise the journey cannot keep."
      },
      {
        "id": "s.not-useful",
        "label": "CANONICAL_RULE",
        "text": "A recovery communication is sent only where it is useful to the person - a failure they noticed or were affected by; a silent fix of something they never saw stays silent."
      },
      {
        "id": "s.compensation",
        "label": "CANONICAL_RULE",
        "text": "Where policy and impact support compensation the remedy journey (REM-159) owns it; no discount is offered here standing in for an explanation."
      },
      {
        "id": "s.permission",
        "label": "CANONICAL_RULE",
        "text": "Hard gates apply; pressure caps do not, because this is service communication about something that happened to the person."
      }
    ],
    contact: {
      "defaultPriority": "service",
      "pressureClass": "service",
      "localCap": {
        "value": {
          "key": "service_recovery.touches",
          "rule": "One acknowledgement per failure; a second message about the same failure is a second failure.",
          "default": {
            "value": 1,
            "confidence": "high",
            "basis": "corpus-rule",
            "applicableWhen": "the graph reaches at most one acknowledgement per instance"
          },
          "required": false
        },
        "appliesTo": "all"
      },
      "cooldown": {
        "key": "service_recovery.cooldown",
        "rule": "Recovery is per failure; a later failure is its own instance and no cooldown applies between failures, though repeated failures are themselves evidence for the relationship's health.",
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
          "when": "the acknowledgement should be something the person can keep - what failed, what was done, what prevents it - which is the default"
        },
        {
          "role": "low-friction",
          "channels": [
            "push"
          ],
          "when": "the failure happened inside the app, the person is active there, and the acknowledgement is short"
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
          "stage": "acknowledgement",
          "action": "a.acknowledge",
          "prerequisites": [
            "c.duplicate",
            "c.resolved",
            "c.useful",
            "c.compensation"
          ],
          "purpose": "Say what failed, what was done about it, and what stops it happening again. No discount standing in for an explanation.",
          "channelRoles": [
            "persistent",
            "low-friction"
          ],
          "mandatory": false,
          "label": "CANONICAL_RULE"
        }
      ],
      "noAction": [
        "s.duplicate",
        "s.unresolved",
        "s.not-useful",
        "s.compensation",
        "s.permission"
      ]
    },
    implementation: {
      "attributes": {
        "required": [
          "person_id",
          "failure_ref",
          "experience_ref",
          "failed_at",
          "impact",
          "resolution_status",
          "resolved_at"
        ],
        "optional": [
          "open_recovery_process_ref",
          "compensation_policy_id",
          "has_active_app_session"
        ]
      }
    },
    measurement: {
      "journeyOutcome": {
        "type": "exit-or-handoff",
        "refs": [
          "x.acknowledged",
          "x.silent",
          "x.defer",
          "h.operational",
          "h.compensation"
        ]
      },
      "secondary": [],
      "guardrails": [
        "complaint",
        "support_contact_within_24h",
        "message_before_resolution",
        "discount_offered_here"
      ],
      "operational": [
        "entry_volume",
        "duplicate_defer_rate",
        "unresolved_handoff_rate",
        "acknowledgement_rate",
        "compensation_handoff_rate"
      ]
    },
    discovery: {
      "aliases": [
        "service recovery",
        "service failure apology",
        "incident follow-up",
        "experience recovery",
        "failed delivery follow-up",
        "outage follow-up"
      ],
      "useCases": [
        "a delivery that failed and was later completed",
        "an outage or error that affected this person and has been fixed",
        "a service appointment that went wrong and was put right"
      ]
    },
    entry: "t.negative",
    nodes: [
      {
        id: "t.negative",
        kind: "trigger",
        event: "authoritative_negative_experience",
        evidence: {
          requires: [
            "a recorded failure: a service failure, a failed fulfilment, a confirmed disruption, a failed critical action, or severe support dissatisfaction",
          ],
          insufficientAlone: [
            "negative feedback on its own, which reports an experience rather than confirming a failure",
            "a low survey score with no incident behind it",
          ],
          source: "authoritative",
        },
        next: "a.assess",
      },
      {
        id: "a.assess",
        kind: "action",
        does: "Establish what failed, what it cost the customer, whether it has been resolved, whether they are still affected, and whether some other process is already handling it",
        writes: [{ field: "failure_record", mode: "append" }],
        next: "c.duplicate",
      },
      {
        id: "c.duplicate",
        kind: "condition",
        asks: "Is another recovery process already handling this failure?",
        branches: [
          {
            label: "Already handled",
            when: "an open case, an assigned owner or another recovery journey covers the same incident",
            to: "x.defer",
          },
          {
            label: "Nobody on it",
            when: "no existing process covers it",
            to: "c.resolved",
          },
        ],
      },
      {
        id: "x.defer",
        kind: "exit",
        state: "deferred to the process already handling it",
        terminal: false,
        reEntry:
          "if that process closes with the customer still affected, this re-opens - two apologies from two systems is worse than one, because it proves neither knew about the other",
        class: "suppression",
      },
      {
        id: "c.resolved",
        kind: "condition",
        asks: "Is the underlying issue still unresolved?",
        branches: [
          {
            label: "Still broken",
            when: "the customer remains affected",
            to: "h.operational",
          },
          {
            label: "Resolved",
            when: "the failure is over and the customer is no longer affected",
            to: "c.useful",
          },
        ],
      },
      {
        id: "h.operational",
        kind: "handoff",
        to: "external:operational-resolution",
        on: "a failure that is still ongoing",
        carries: ["what failed and who is affected", "the fact that no recovery message has been sent yet"],
        suppresses: [
          "apology and compensation messaging until the thing being apologised for has stopped happening",
        ],
        contract: {
          "requiredFields": [
            "failure_ref",
            "experience_ref",
            "person_id",
            "impact",
            "detected_at"
          ]
        },
      },
      {
        id: "c.useful",
        kind: "condition",
        asks: "Is a recovery communication actually useful here?",
        branches: [
          {
            label: "Useful",
            when: "the customer noticed, or would want to know it was handled",
            to: "c.compensation",
          },
          {
            label: "Not useful",
            when: "the failure was resolved before it reached them - raising it now creates the concern it would be apologising for",
            to: "x.silent",
          },
        ],
      },
      {
        id: "x.silent",
        kind: "exit",
        state: "resolved without contact",
        terminal: false,
        reEntry: "a recurrence, or any sign they did notice, re-opens this",
        class: "no-action",
      },
      {
        id: "c.compensation",
        kind: "condition",
        asks: "Does policy and the actual impact support compensation?",
        branches: [
          {
            label: "Owed",
            when: "the impact and the policy both support a remedy",
            to: "h.compensation",
          },
          {
            label: "Not owed",
            when: "the failure was real but no remedy is justified - which is most failures",
            to: "a.acknowledge",
          },
        ],
      },
      {
        id: "h.compensation",
        kind: "handoff",
        to: "REM-159",
        on: "a remedy that policy and impact both support",
        carries: ["the failure and its assessed impact", "what has already been said to the customer"],
      },
      {
        id: "a.acknowledge",
        kind: "action",
        does: "Say what failed, what was done about it, and what stops it happening again. No discount standing in for an explanation - a remedy offered instead of an account of what went wrong reads as buying silence",
        next: "x.acknowledged",
        execution: "communication",
        idempotencyKey: "person_id + failure_ref + touch id",
      },
      {
        id: "x.acknowledged",
        kind: "exit",
        state: "failure acknowledged, no remedy owed",
        terminal: false,
        reEntry: "a recurrence changes the assessment, and repetition is itself part of the impact",
        class: "success",
      },
    ],
    guardrails: [
      "Negative feedback is not a confirmed service failure. One is a report of an experience, the other is a record of something going wrong.",
      "A discount is not a default apology. Compensation follows impact and policy, not the awkwardness of the conversation.",
      "An existing support case suppresses this entirely. A parallel recovery journey contradicts the person already handling it.",
    ],
    reusableRule:
      "Service recovery should reflect the actual failure, current resolution state and justified remedy rather than use compensation as a default response.",
  },

  /* ------------------------------------------------------------ RET-27 */
  {
    id: "RET-27",
    slug: "recovery-observation-buffer",
    category: "retention",
    goal: "relationship-recovery-intervention",
    channels: [],
    name: "Recovery signal → observation buffer → stable or relapse",
    shortName: "Recovery Stability Check",
    purpose:
      "Keep the distance between a good sign and an actual recovery, so a relapse is still being watched for when it happens.",
    entity: {
      scope: "person or account plus the health or risk context that deteriorated",
      note: "Recovery is judged in the context that fell. Improvement somewhere else is not recovery here.",
      instanceKey: [
        "account_id",
        "person_id"
      ],
      concurrency: "one-active-per-key"
    },
    distinctFrom: [
      {
        journey: "RET-21",
        because:
          "An improving engagement state is one input to this. RET-21 updates a state; this decides whether an improvement should be believed yet, which is a different question with a waiting period in it.",
      },
    ],
    objective: "Keep the distance between a good sign and an actual recovery, so a relapse is still being watched for when it happens.",
    eligibility: [
      "a positive behaviour in a context that had deteriorated or received a recovery intervention",
      "no instance of this journey is already open for the person or account plus the health or risk context that deteriorated",
      "hard gates (GLB-31) allow communication for this purpose"
    ],
    suppressions: [
      {
        "id": "s.g1",
        "label": "CANONICAL_RULE",
        "text": "One login is not recovery. It is the event that starts watching for one."
      },
      {
        "id": "s.g2",
        "label": "CANONICAL_RULE",
        "text": "One payment attempt may not be payment recovery. An attempt and a restored payment relationship are different facts."
      },
      {
        "id": "s.g3",
        "label": "CANONICAL_RULE",
        "text": "The observation window is set from the use-case. A window that fits a daily product declares a quarterly one recovered before anything has been proven."
      },
      {
        "id": "s.g4",
        "label": "CANONICAL_RULE",
        "text": "Recovery observation delays declaring the relationship stably recovered. It does not by itself require communication to be suppressed: an authoritative event - a purchase, a completed renewal, an explicit request to stay - can immediately end an inactivity or reactivation restriction and return the person to normal current-state orchestration while this journey is still observing. Operational eligibility restored and health confidently stable are different conclusions with different evidence."
      }
    ],
    implementation: {
      "attributes": {
        "required": [
          "account_id",
          "person_id",
          "recovery_state_history",
          "suppressed_sends"
        ],
        "optional": []
      }
    },
    measurement: {
      "journeyOutcome": {
        "type": "handoff",
        "refs": [
          "h.rediagnose",
          "h.normal"
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
        "recovery stability check",
        "recovery observation",
        "relapse watch",
        "post-recovery monitoring"
      ],
      "useCases": [
        "a good sign after deterioration that is watched before it counts as recovery",
        "a relapse inside the stability window sent back to diagnosis"
      ]
    },
    entry: "t.positive",
    nodes: [
      {
        id: "t.positive",
        kind: "trigger",
        event: "positive_signal_after_deterioration",
        evidence: {
          requires: [
            "a positive behaviour in a context that had deteriorated or received a recovery intervention",
          ],
          insufficientAlone: [
            "a single login",
            "a single payment attempt, which is an attempt rather than a restored payment relationship",
            "an opened or clicked message",
          ],
          source: "behavioral",
        },
        next: "a.mark",
      },
      {
        id: "a.mark",
        kind: "action",
        does: "Record RECOVERY_OBSERVED, explicitly not RECOVERED. The whole journey is the distance between those two states, and writing the second one here would remove the reason it exists",
        writes: [{ field: "recovery_state_history", mode: "append" }],
        next: "w.stability",
        idempotencyKey: "account_id + person_id + a.mark",
      },
      {
        id: "w.stability",
        kind: "wait",
        until: [
          "deterioration_signal_returns"
        ],
        onEvent: "a.relapse",
        timeout: {
          "after": {
            "key": "recovery_observation.stability",
            "rule": "The stability window appropriate to this use-case and this kind of deterioration.",
            "class": "observation-window",
            "required": true
          },
          "reason": "surviving the window without relapse is the evidence, so the timeout is the success path rather than the failure one - a payment relationship and a usage pattern need different windows to prove the same thing",
          "relativeTo": "trigger"
        },
        onTimeout: "a.stable",
        windowExtendsOnEngagement: false,
        recheck: "the person or account plus the health or risk context that deteriorated re-read from the system of record before acting on the timeout",
      },
      {
        id: "a.relapse",
        kind: "action",
        does: "Record the relapse, keeping the observed improvement in the history rather than erasing it - that something briefly worked is part of the diagnosis, not noise",
        writes: [{ field: "recovery_state_history", mode: "append" }],
        next: "h.rediagnose",
        idempotencyKey: "account_id + person_id + a.relapse",
      },
      {
        id: "h.rediagnose",
        kind: "handoff",
        to: "RET-23",
        on: "deterioration returning inside the stability window",
        carries: [
          "what improved, for how long, and what brought it back",
          "the fact that this is a relapse rather than a first occurrence, which usually changes the answer",
        ],
      },
      {
        id: "a.stable",
        kind: "action",
        does: "Record RECOVERED and suppress the recovery interventions still pending, including any queued - a save message arriving after a relationship has genuinely stabilised reopens a question the customer had stopped asking",
        writes: [
          { field: "recovery_state_history", mode: "append" },
          { field: "suppressed_sends", mode: "append" },
        ],
        next: "h.normal",
        idempotencyKey: "account_id + person_id + a.stable",
      },
      {
        id: "h.normal",
        kind: "handoff",
        to: "external:customer-lifecycle",
        on: "recovery sustained through the stability window",
        carries: [
          "what had deteriorated and what restored it",
          "the fact that this relationship has recovered once, which is context for the next time it does not",
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
    ],
    guardrails: [
      "One login is not recovery. It is the event that starts watching for one.",
      "One payment attempt may not be payment recovery. An attempt and a restored payment relationship are different facts.",
      "The observation window is set from the use-case. A window that fits a daily product declares a quarterly one recovered before anything has been proven.",
      "Recovery observation delays declaring the relationship stably recovered. It does not by itself require communication to be suppressed: an authoritative event - a purchase, a completed renewal, an explicit request to stay - can immediately end an inactivity or reactivation restriction and return the person to normal current-state orchestration while this journey is still observing. Operational eligibility restored and health confidently stable are different conclusions with different evidence.",
    ],
    reusableRule:
      "A positive signal begins recovery observation; stable recovery requires evidence that the improvement persists.",
  },

  /* ------------------------------------------------------------ RET-28 */
  {
    id: "RET-28",
    slug: "cancellation-intent-decision-point",
    category: "retention",
    goal: "cancellation-termination",
    channels: ["email", "in-app"],
    name: "Cancellation intent → understand state → save or proceed",
    shortName: "Cancellation Save",
    purpose:
      "Treat stated intent to leave as a decision point where a genuinely relevant alternative may be offered, and never as an obstacle course.",
    entity: {
      scope: "the subscription, membership or service relationship being cancelled",
      note: "Intent is against one relationship. Cancelling one subscription says nothing about the others an account holds.",
      instanceKey: [
        "person_id",
        "relationship_id",
        "intent_id"
      ],
      concurrency: "one-active-per-key"
    },
    distinctFrom: [
      {
        journey: "RET-29",
        because:
          "This runs while the decision is still reversible and the person is still deciding. RET-29 runs after it is made, and the two must never share an event.",
      },
    ],
    objective: "At the moment a person declares they want to cancel, learn why if that is useful, offer one genuine alternative if one matches the reason, and let them decide - with the cancellation path fully open at every step.",
    eligibility: [
      "an explicit cancellation intent is declared by the person - in the product, by message or by phone",
      "the relationship is active and cancellable by this person",
      "no save instance is already open for this intent",
      "hard gates (GLB-31) permit service communication"
    ],
    suppressions: [
      {
        "id": "s.path",
        "label": "CANONICAL_RULE",
        "text": "The cancellation path is never obstructed: the question and the offer sit beside it, never in front of it, and no contest with another journey delays the cancellation itself."
      },
      {
        "id": "s.once",
        "label": "CANONICAL_RULE",
        "text": "The reason is asked once and the alternative is offered once; a second ask or a second offer is pressure on a decision already being made."
      },
      {
        "id": "s.no-genuine",
        "label": "CANONICAL_RULE",
        "text": "No offer is made where nothing genuinely matches the reason; the person proceeds to decide without one."
      },
      {
        "id": "s.decided",
        "label": "CANONICAL_RULE",
        "text": "A confirmed cancellation goes to execution and nothing further is sent by this journey; an abandoned flow leaves the relationship unchanged and silent."
      },
      {
        "id": "s.contest",
        "label": "CANONICAL_RULE",
        "text": "A declared intent outranks inferred risk on the same account; only the offer step yields to an open issue under human ownership (GLB-06)."
      }
    ],
    contact: {
      "defaultPriority": "retention",
      "pressureClass": "lifecycle",
      "localCap": {
        "value": {
          "key": "cancellation_save.touches",
          "rule": "One question and one offer at most, both at the decision point; the plan has nothing after the decision.",
          "default": {
            "value": 2,
            "confidence": "high",
            "basis": "corpus-rule",
            "applicableWhen": "the graph reaches at most one ask and one offer per intent"
          },
          "required": false
        },
        "appliesTo": "all"
      },
      "cooldown": {
        "key": "cancellation_save.cooldown",
        "rule": "The same intent re-expressed inside the intent window is the same instance; a new intent after a lapsed one is a new instance and the question is not repeated inside the cooldown.",
        "class": "cooldown",
        "default": {
          "value": {
            "min": "30 days",
            "max": "90 days"
          },
          "confidence": "low",
          "basis": "example-only"
        },
        "required": false
      },
      "competition": {
        "exclusionGroup": "retention-outreach",
        "scope": "account",
        "precedence": "above risk-driven escalation and offer follow-up on the same account - a declared intent to leave outranks an inferred risk. Only the offer step ever yields; the cancellation path itself is never obstructed by any contest",
        "onLoss": "suppressed"
      }
    },
    channelStrategy: {
      "roles": [
        {
          "role": "in-session",
          "channels": [
            "in-app"
          ],
          "when": "the intent was declared inside the product - the question and the offer are put beside the cancellation step the person is on"
        },
        {
          "role": "persistent",
          "channels": [
            "email"
          ],
          "when": "the intent was declared outside the product, by message or by phone, and the question or offer has to reach the person where they are"
        }
      ],
      "fallback": "same-role-other-channel",
      "label": "RECOMMENDED_DEFAULT"
    },
    orchestration: {
      "strategy": "offer-decide-remind",
      "touches": [
        {
          "id": "t-ask",
          "stage": "reason-ask",
          "action": "a.ask",
          "prerequisites": [
            "c.reason",
            "c.ask"
          ],
          "purpose": "Ask once why, with the cancellation path fully open beside the question. The question is never a step that has to be passed.",
          "destination": { "target": "reason-question-beside-cancel-step", "boundTo": "intent_id", "mustNotClaim": ["that answering is required to cancel"] },
          "channelRoles": [
            "in-session",
            "persistent"
          ],
          "mandatory": false,
          "label": "CANONICAL_RULE"
        },
        {
          "id": "t-offer",
          "stage": "alternative-offer",
          "action": "a.offer",
          "prerequisites": [
            "c.resolution"
          ],
          "purpose": "Offer the one alternative that matches the reason, once, alongside an unobstructed route to continue cancelling.",
          "channelRoles": [
            "in-session",
            "persistent"
          ],
          "destination": {
            "target": "alternative-with-cancel-route",
            "boundTo": "intent_id",
            "mustNotClaim": [
              "that cancelling is harder than it is",
              "an alternative that does not match the reason"
            ]
          },
          "mandatory": false,
          "label": "CANONICAL_RULE"
        }
      ],
      "noAction": [
        "s.path",
        "s.once",
        "s.no-genuine",
        "s.decided",
        "s.contest"
      ]
    },
    implementation: {
      "attributes": {
        "required": [
          "person_id",
          "relationship_id",
          "intent_id",
          "declared_at",
          "declared_via",
          "holdings",
          "effective_date_if_cancelled"
        ],
        "optional": [
          "declared_reason",
          "alternatives_catalogue",
          "has_active_session"
        ]
      }
    },
    measurement: {
      "journeyOutcome": {
        "type": "exit-or-handoff",
        "refs": [
          "h.intervention",
          "h.execute",
          "x.lapsed"
        ]
      },
      "businessOutcome": {
        "event": "cancellation_flow_abandoned",
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
      "secondary": [
        "cancellation_reason_given"
      ],
      "guardrails": [
        "complaint",
        "cancel_path_obstructed",
        "second_offer_sent",
        "support_contact_within_24h"
      ],
      "operational": [
        "intent_volume",
        "reason_asked_rate",
        "reason_given_rate",
        "offer_rate",
        "decision_distribution"
      ]
    },
    discovery: {
      "aliases": [
        "cancellation save",
        "cancel flow",
        "churn prevention (declared intent)",
        "save offer",
        "cancellation intercept",
        "exit survey"
      ],
      "useCases": [
        "a subscriber who clicks cancel and is asked once why",
        "a member who tells support they are leaving and is offered the one alternative that fits"
      ]
    },
    entry: "t.intent",
    nodes: [
      {
        id: "t.intent",
        kind: "trigger",
        event: "explicit_cancellation_intent",
        evidence: {
          requires: [
            "an explicit act: a cancel flow entered, a cancellation requested while still reversible, or a cancellation asked for through a person",
          ],
          insufficientAlone: [
            "viewing the billing page",
            "a pricing question to support",
            "declining usage, which is a signal about risk and not a statement of intent",
          ],
          source: "declared",
        },
        next: "a.context",
      },
      {
        id: "a.context",
        kind: "action",
        does: "Read what they currently hold, what cancelling would end, and when it would take effect - so anything said next is about their actual relationship rather than a generic one",
        next: "c.reason",
      },
      {
        id: "c.reason",
        kind: "condition",
        asks: "Is a declared reason available?",
        branches: [
          {
            label: "Declared",
            when: "the person has stated a reason",
            to: "a.record-reason",
          },
          {
            label: "Not declared",
            when: "no reason has been given",
            to: "c.ask",
          },
        ],
      },
      {
        id: "c.ask",
        kind: "condition",
        asks: "Is asking for a reason useful and appropriate here?",
        branches: [
          {
            label: "Worth asking",
            when: "the answer would change what is offered, and asking does not delay the cancellation",
            to: "a.ask",
          },
          {
            label: "Not worth asking",
            when: "the answer would change nothing, or asking would function as friction",
            to: "a.no-reason",
          },
        ],
      },
      {
        id: "a.ask",
        kind: "action",
        does: "Ask once, with the cancellation path fully open beside the question. The question is never a step that has to be passed to leave - a reason obtained that way is not information, it is a toll",
        next: "w.answer",
        execution: "communication",
        idempotencyKey: "intent_id + touch id",
      },
      {
        id: "w.answer",
        kind: "wait",
        until: [
          "cancellation_reason_given",
          "cancellation_confirmed",
          "cancellation_flow_abandoned"
        ],
        onEvent: "c.answered",
        timeout: {
          "after": {
            "key": "cancellation_save.answer_window",
            "rule": "The question is open only while the person is at the point where it was put; when they leave that point, unanswered is the answer.",
            "class": "attribute-bound",
            "default": {
              "value": "the end of the session or conversation in which the question was put",
              "confidence": "high",
              "basis": "attribute-bound"
            },
            "required": false
          },
          "reason": "a reason is useful only while the choice it informs is still open - an unanswered question is itself an answer, and chasing it is what turns a question into a toll",
          "relativeTo": "previous-touch"
        },
        onTimeout: "a.no-reason",
        windowExtendsOnEngagement: false,
        recheck: "the intent re-read: still open, not confirmed, not abandoned",
      },
      {
        id: "c.answered",
        kind: "condition",
        asks: "What came back?",
        branches: [
          { label: "A reason", when: "the person stated a reason", to: "a.record-reason" },
          {
            label: "They decided meanwhile",
            when: "the cancellation was confirmed or abandoned while the question was still open",
            to: "c.decision",
          },
        ],
      },
      {
        id: "a.record-reason",
        kind: "action",
        does: "Record the reason with its source among PRICE, LOW_USAGE, MISSING_VALUE, TECHNICAL_PROBLEM, SERVICE_ISSUE, TEMPORARY_NEED, SWITCHING or OTHER. A reason inferred later never overwrites one that was declared",
        writes: [{ field: "cancellation_reason_history", mode: "append" }],
        next: "c.resolution",
        idempotencyKey: "intent_id + reason",
      },
      {
        id: "a.no-reason",
        kind: "action",
        does: "Proceed without a reason and record that none was given. An inferred reason may be stored, but never in the field that holds declared ones",
        writes: [{ field: "cancellation_reason_history", mode: "append" }],
        next: "c.resolution",
      },
      {
        id: "c.resolution",
        kind: "condition",
        asks: "Does a legitimate resolution exist for this reason?",
        branches: [
          {
            label: "A real alternative",
            when: "something genuinely addresses the stated reason - technical help for a technical problem, a plan change or pause for cost or temporary need, education for unrealised value, service recovery for a service failure",
            to: "a.offer",
          },
          {
            label: "Nothing genuine",
            when: "no alternative actually answers the reason, or no reason was given to answer",
            to: "w.decision",
          },
        ],
      },
      {
        id: "a.offer",
        kind: "action",
        does: "Offer the alternative that matches the reason, once, alongside an unobstructed path to continue cancelling. A discount appears only where the reason is price and policy supports it - offering one for a technical fault answers the wrong question and reveals that nobody read the reason",
        next: "h.intervention",
        execution: "communication",
        idempotencyKey: "intent_id + touch id",
      },
      {
        id: "h.intervention",
        kind: "handoff",
        to: "RET-30",
        on: "a retention alternative offered at the decision point",
        carries: [
          "the declared reason and the alternative chosen against it",
          "the cancellation episode this belongs to, so a decline is remembered inside it",
        ],
      },
      {
        id: "w.decision",
        kind: "wait",
        until: [
          "cancellation_confirmed",
          "cancellation_flow_abandoned"
        ],
        onEvent: "c.decision",
        timeout: {
          "after": {
            "key": "cancellation_save.intent_window",
            "rule": "An intent stays meaningful for a bounded period; past it, an unconfirmed cancellation is a lapsed intent and the relationship stands unchanged.",
            "class": "observation-window",
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
          "reason": "an intent neither confirmed nor withdrawn is not a standing invitation to keep raising it",
          "relativeTo": "trigger"
        },
        onTimeout: "x.lapsed",
        windowExtendsOnEngagement: false,
        recheck: "the relationship re-read: still active, no cancellation executed elsewhere",
      },
      {
        id: "c.decision",
        kind: "condition",
        asks: "What did they decide?",
        branches: [
          {
            label: "Confirmed",
            when: "the cancellation was carried through",
            to: "h.execute",
          },
          {
            label: "Abandoned",
            when: "they left the flow with the relationship intact",
            to: "x.lapsed",
          },
        ],
      },
      {
        id: "h.execute",
        kind: "handoff",
        to: "SUB-167",
        on: "cancellation confirmed by the customer",
        carries: [
          "the declared reason, which belongs to the record of why this relationship ended",
          "what was offered, if anything, and what was declined",
        ],
      },
      {
        id: "x.lapsed",
        kind: "exit",
        state: "intent expressed, not carried through; relationship unchanged",
        terminal: false,
        reEntry:
          "a fresh expression of intent opens a new episode, and the earlier one is context - repeatedly approaching cancellation is itself evidence RET-24 should be reading",
        class: "timeout",
      },
    ],
    guardrails: [
      "Cancellation intent is not cancellation. Nothing downstream may treat this journey's trigger as an ending.",
      "No dark patterns. Every alternative is offered beside an unobstructed path to leave, never in front of one.",
      "A save attempt is bounded by the authoritative renewal or cancellation timing it is competing with, and never contradicts it. An offer that runs past the date it was trying to protect arrives after the decision it was for.",
      "The cancellation path is never made longer to create room for a save attempt.",
      "A discount only where the declared reason and policy both support it. Elsewhere it is an answer to a question nobody asked.",
      "A reason is asked for at most once, and never as a condition of leaving.",
    ],
    reusableRule:
      "Cancellation intent is a decision point where relevant alternatives may be offered without obstructing the user's ability to leave.",
  },

  /* ------------------------------------------------------------ RET-29 */
  {
    id: "RET-29",
    slug: "cancellation-completed-wind-down",
    category: "retention",
    goal: "cancellation-termination",
    channels: [],
    name: "Cancellation completed → stop retention → resolve remaining relationship",
    shortName: "Cancellation Wind-Down",
    purpose:
      "End retention ownership the moment cancellation is real, and manage what is still outstanding without pretending the relationship is either fully over or still winnable.",
    entity: {
      scope: "the subscription, membership or service relationship that ended",
      note: "Only this relationship ends. Other subscriptions, the account itself and the person's data are three separate things with three separate lifecycles.",
      instanceKey: [
        "relationship_id"
      ],
      concurrency: "one-active-per-key"
    },
    objective: "End retention ownership the moment cancellation is real, and manage what is still outstanding without pretending the relationship is either fully over or still winnable.",
    eligibility: [
      "the system of record showing the cancellation as executed",
      "no instance of this journey is already open for the the subscription",
      "hard gates (GLB-31) allow communication for this purpose"
    ],
    suppressions: [
      {
        "id": "s.g1",
        "label": "CANONICAL_RULE",
        "text": "Cancellation is not data deletion. Nothing here removes anything."
      },
      {
        "id": "s.g2",
        "label": "CANONICAL_RULE",
        "text": "Cancellation is not account closure. The account survives the subscription that ended."
      },
      {
        "id": "s.g3",
        "label": "CANONICAL_RULE",
        "text": "An end-of-period cancellation does not revoke paid entitlement early unless policy says so. They have paid for the remainder."
      },
      {
        "id": "s.g4",
        "label": "CANONICAL_RULE",
        "text": "Invalidation runs before anything else, because everything else can wait and a save offer cannot be un-sent."
      }
    ],
    implementation: {
      "attributes": {
        "required": [
          "relationship_id",
          "cancellation_executed_at",
          "effective_end_at",
          "outstanding_obligations",
          "termination_state"
        ],
        "optional": []
      }
    },
    measurement: {
      "journeyOutcome": {
        "type": "exit-or-handoff",
        "refs": [
          "x.former",
          "x.wind-down",
          "h.obligations"
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
        "cancellation wind-down",
        "post-cancellation",
        "stop retention after cancellation",
        "cancelled relationship close-out"
      ],
      "useCases": [
        "retention ownership ended the moment a cancellation is executed",
        "obligations outstanding after cancellation handed to their owner"
      ]
    },
    entry: "t.completed",
    nodes: [
      {
        id: "t.completed",
        kind: "trigger",
        event: "authoritative_cancellation_completed",
        evidence: {
          requires: ["the system of record showing the cancellation as executed"],
          insufficientAlone: [
            "a cancel flow entered",
            "a cancellation request that is still reversible",
            "a stated intention to cancel",
          ],
          source: "authoritative",
        },
        next: "a.invalidate",
      },
      {
        id: "a.invalidate",
        kind: "action",
        does: "Invalidate save offers, renewal prompts, cancellation reminders, retention tasks and promotional actions that are now incompatible - including everything already queued. This runs first, before anything else is worked out, because the cost of it running late is a save offer arriving after someone has already gone",
        writes: [{ field: "suppressed_sends", mode: "append" }],
        next: "a.termination-state",
        idempotencyKey: "subscription_id + relationship_id + a.invalidate",
      },
      {
        id: "a.termination-state",
        kind: "action",
        does: "Establish when this actually ends: immediately, at the end of the current period, or on a scheduled future date. Everything downstream depends on which, and assuming immediate is how paid entitlement gets revoked early",
        writes: [{ field: "termination_state", mode: "set" }],
        next: "c.access",
        idempotencyKey: "subscription_id + relationship_id + a.termination-state",
      },
      {
        id: "c.access",
        kind: "condition",
        asks: "Does service or access remain temporarily active?",
        branches: [
          {
            label: "Still active",
            when: "the cancellation takes effect at period end or on a future date",
            to: "a.wind-down",
          },
          {
            label: "Ended now",
            when: "the cancellation took effect immediately",
            to: "c.obligations",
          },
        ],
      },
      {
        id: "a.wind-down",
        kind: "action",
        does: "Hold the relationship in a defined wind-down state with its end date. Paid entitlement is not revoked before that date unless policy explicitly says otherwise - someone who cancelled has still paid for the rest of the term, and taking it early converts a neutral ending into a grievance",
        writes: [{ field: "termination_state", mode: "set" }],
        next: "c.obligations",
        idempotencyKey: "subscription_id + relationship_id + a.wind-down",
      },
      {
        id: "c.obligations",
        kind: "condition",
        asks: "Do open obligations remain on either side?",
        branches: [
          {
            label: "Something outstanding",
            when: "a final invoice, a refund, a return, a data export, equipment to come back, or an open support issue",
            to: "h.obligations",
          },
          {
            label: "Nothing outstanding",
            when: "neither side owes the other anything further",
            to: "c.ended",
          },
        ],
      },
      {
        id: "h.obligations",
        kind: "handoff",
        to: "external:obligation-resolution",
        on: "obligations outstanding after cancellation",
        carries: [
          "each outstanding obligation and which side owes it",
          "the termination state, since some obligations only fall due at the end date",
        ],
        contract: {
          "requiredFields": [
            "subscription_id",
            "relationship_id",
            "handed_at",
            "reason"
          ]
        },
      },
      {
        id: "c.ended",
        kind: "condition",
        asks: "Has the relationship fully ended?",
        branches: [
          {
            label: "Fully ended",
            when: "the end date has passed and nothing is outstanding",
            to: "x.former",
          },
          {
            label: "Still winding down",
            when: "the end date is in the future",
            to: "x.wind-down",
          },
        ],
      },
      {
        id: "x.former",
        kind: "exit",
        state: "former customer; relationship ended, account and data untouched",
        terminal: false,
        reEntry:
          "returning is a new relationship handled by win-back, not by reviving this one. Closing the account and deleting the data are two further states with their own triggers, and neither of them happened here",
        class: "success",
      },
      {
        id: "x.wind-down",
        kind: "exit",
        state: "cancelled, in wind-down until the end date",
        terminal: false,
        reEntry:
          "reversal before the end date is possible and is its own event; the wind-down state exists precisely so that window is representable rather than collapsed into an ending",
        class: "success",
      },
    ],
    guardrails: [
      "Cancellation is not data deletion. Nothing here removes anything.",
      "Cancellation is not account closure. The account survives the subscription that ended.",
      "An end-of-period cancellation does not revoke paid entitlement early unless policy says so. They have paid for the remainder.",
      "Invalidation runs before anything else, because everything else can wait and a save offer cannot be un-sent.",
    ],
    reusableRule:
      "Once cancellation is confirmed, retention ownership ends and orchestration shifts to termination and remaining-obligation management.",
  },

  /* ------------------------------------------------------------ RET-30 */
  {
    id: "RET-30",
    slug: "retention-intervention-outcome",
    category: "retention",
    goal: "reconciliation-correction",
    channels: ["email", "in-app"],
    name: "Retention intervention → outcome → suppress, escalate or exit",
    shortName: "Retention Offer Follow-Up",
    purpose:
      "Close a retention attempt on what actually happened to the relationship, and stop the same offer being made twice.",
    entity: {
      scope: "the customer, account or subscription plus the retention episode the intervention belongs to",
      note: "The episode is the unit. A declined offer is declined for this episode, which is what makes remembering it possible.",
      instanceKey: [
        "account_id",
        "retention_episode_id"
      ],
      concurrency: "one-active-per-key"
    },
    distinctFrom: [
      {
        journey: "RET-27",
        because:
          "This asks whether the intervention worked. RET-27 asks whether the improvement lasts, and takes over once this one has a positive answer.",
      },
    ],
    objective: "Close a retention attempt on what actually happened to the relationship, and stop the same offer being made twice.",
    eligibility: [
      "a defined intervention actually delivered: a plan alternative, a pause option, a support resolution, human outreach, or an approved save offer",
      "no instance of this journey is already open for the the customer",
      "hard gates (GLB-31) allow communication for this purpose"
    ],
    suppressions: [
      {
        "id": "s.g1",
        "label": "CANONICAL_RULE",
        "text": "An accepted offer is not an applied one. Retention is recorded from the relationship state, never from the customer's answer."
      },
      {
        "id": "s.g2",
        "label": "CANONICAL_RULE",
        "text": "A declined offer is remembered for the whole cancellation episode, not just for the message that carried it."
      },
      {
        "id": "s.g3",
        "label": "CANONICAL_RULE",
        "text": "The attempt is bounded: the intervention, and at most one follow-up."
      },
      {
        "id": "s.g4",
        "label": "CANONICAL_RULE",
        "text": "An operational failure to apply an accepted offer is never recorded as a retention success."
      }
    ],
    contact: {
      "defaultPriority": "lifecycle",
      "pressureClass": "lifecycle",
      "localCap": {
        "value": {
          "key": "retention_intervention.touches",
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
        "key": "retention_intervention.cooldown",
        "rule": "The cooldown between instances of this journey for the same the customer, so that a re-qualifying the customer is tracked but not messaged again inside it.",
        "class": "cooldown",
        "required": true
      },
      "competition": {
        "exclusionGroup": "retention-outreach",
        "scope": "account",
        "precedence": "lowest in the group - any live risk case or open issue on the same account outranks it",
        "onLoss": "suppressed"
      }
    },
    channelStrategy: {
      "roles": [
        {
          "role": "persistent",
          "channels": [
            "email"
          ],
          "when": "the message has to be kept and survive until the person can act on it"
        },
        {
          "role": "in-session",
          "channels": [
            "in-app"
          ],
          "when": "the person is active in the product and the action is taken there"
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
          "stage": "followup",
          "action": "a.followup",
          "gatedBy": "w.outcome",
          "prerequisites": [
            "c.followup"
          ],
          "purpose": "Send one follow-up and stop.",
          "channelRoles": [
            "persistent",
            "in-session"
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
          "account_id",
          "retention_episode_id",
          "intervention_delivered",
          "offer_status",
          "retention_episode_history"
        ],
        "optional": []
      }
    },
    measurement: {
      "journeyOutcome": {
        "type": "exit-or-handoff",
        "refs": [
          "x.declined",
          "x.cooldown",
          "h.observe",
          "h.fix",
          "h.proceed"
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
        "event": "relationship_recovered",
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
        "retention offer follow-up",
        "save offer outcome",
        "retention intervention outcome",
        "offer acceptance tracking"
      ],
      "useCases": [
        "a plan alternative or pause offered and its outcome closed on what actually happened",
        "one follow-up after an unanswered offer, then stop"
      ]
    },
    entry: "t.delivered",
    nodes: [
      {
        id: "t.delivered",
        kind: "trigger",
        event: "retention_intervention_delivered",
        evidence: {
          requires: [
            "a defined intervention actually delivered: a plan alternative, a pause option, a support resolution, human outreach, or an approved save offer",
          ],
          insufficientAlone: ["an intervention scheduled but not yet delivered"],
          source: "authoritative",
        },
        next: "w.outcome",
      },
      {
        id: "w.outcome",
        kind: "wait",
        until: [
          "retention_offer_accepted",
          "retention_offer_declined",
          "relationship_recovered",
          "intervention_failed"
        ],
        onEvent: "c.outcome",
        timeout: {
          "after": {
            "key": "retention_intervention.outcome",
            "rule": "A bounded decision window.",
            "class": "response-window",
            "required": true
          },
          "reason": "an unanswered offer is a result, and the alternative to accepting that is asking again until someone leaves",
          "relativeTo": "trigger"
        },
        onTimeout: "c.followup",
        windowExtendsOnEngagement: false,
        recheck: "the the customer re-read from the system of record before acting on the timeout",
      },
      {
        id: "c.outcome",
        kind: "condition",
        asks: "What happened to the intervention?",
        branches: [
          { label: "Accepted", when: "the customer took what was offered", to: "a.verify" },
          {
            label: "Declined",
            when: "the customer explicitly turned it down",
            to: "a.record-decline",
          },
          {
            label: "Recovered without answering",
            when: "the relationship improved but nobody responded to the offer itself",
            to: "h.observe",
          },
          {
            label: "Failed to execute",
            when: "the intervention was accepted or attempted and did not actually apply",
            to: "h.fix",
          },
        ],
      },
      {
        id: "a.verify",
        kind: "action",
        does: "Verify against the system of record that the relationship actually changed - the plan changed, the pause is active, the issue is closed, the subscription is retained. Acceptance is a customer saying yes; application is the state having moved, and the gap between them is where retention numbers go wrong",
        next: "c.applied",
        idempotencyKey: "subscription_id + account_id + a.verify",
      },
      {
        id: "c.applied",
        kind: "condition",
        asks: "Did the state actually change?",
        branches: [
          {
            label: "Applied",
            when: "the authoritative record shows the change",
            to: "h.observe",
          },
          {
            label: "Accepted but not applied",
            when: "the customer agreed and the change did not take effect",
            to: "h.fix",
          },
        ],
      },
      {
        id: "h.observe",
        kind: "handoff",
        to: "RET-27",
        on: "a retention outcome that looks positive",
        carries: [
          "what was accepted and what actually changed",
          "the fact that this is one positive event, which is why it goes to observation rather than to a recovered state",
        ],
      },
      {
        id: "h.fix",
        kind: "handoff",
        to: "external:operational-resolution",
        on: "an intervention that did not apply",
        carries: [
          "what was agreed and what failed to happen",
          "the explicit fact that retention has not succeeded, however the customer answered",
        ],
        suppresses: ["any recording of this as a retained relationship until the change actually applies"],
        contract: {
          "requiredFields": [
            "subscription_id",
            "account_id",
            "handed_at",
            "reason"
          ]
        },
      },
      {
        id: "a.record-decline",
        kind: "action",
        does: "Record the decline against this cancellation episode, so the same offer is not made again inside it. Repeating a declined offer is the behaviour that makes a save attempt read as an obstacle",
        writes: [{ field: "retention_episode_history", mode: "append" }],
        next: "c.proceed",
        idempotencyKey: "subscription_id + account_id + a.record-decline",
      },
      {
        id: "c.proceed",
        kind: "condition",
        asks: "Is a cancellation still in progress?",
        branches: [
          {
            label: "Still cancelling",
            when: "the customer declined and is continuing to leave",
            to: "h.proceed",
          },
          {
            label: "No cancellation underway",
            when: "the offer was declined but nothing is being cancelled",
            to: "x.declined",
          },
        ],
      },
      {
        id: "h.proceed",
        kind: "handoff",
        to: "SUB-167",
        on: "a declined save offer with cancellation continuing",
        carries: ["what was offered and declined", "the declared reason it was chosen against"],
      },
      {
        id: "x.declined",
        kind: "exit",
        state: "intervention declined, relationship intact",
        terminal: false,
        reEntry:
          "a new episode with new evidence may justify a different intervention; the declined one is not re-sent inside this episode",
        class: "no-action",
      },
      {
        id: "c.followup",
        kind: "condition",
        asks: "With no response, is one bounded follow-up justified?",
        branches: [
          {
            label: "Justified",
            when: "the offer is time-limited or its terms were plausibly not understood",
            to: "a.followup",
          },
          {
            label: "Not justified",
            when: "silence is a clear enough answer and repeating it adds only pressure",
            to: "x.cooldown",
          },
        ],
      },
      {
        id: "a.followup",
        kind: "action",
        does: "Send one follow-up and stop. There is no second, whatever the value of the relationship",
        next: "x.cooldown",
        execution: "communication",
        idempotencyKey: "subscription_id + account_id + a.followup",
      },
      {
        id: "x.cooldown",
        kind: "exit",
        state: "no response; episode closed, cooldown in force",
        terminal: false,
        reEntry:
          "a new episode may open on new evidence, and this intervention is not repeated within the cooldown",
        class: "timeout",
      },
    ],
    guardrails: [
      "An accepted offer is not an applied one. Retention is recorded from the relationship state, never from the customer's answer.",
      "A declined offer is remembered for the whole cancellation episode, not just for the message that carried it.",
      "The attempt is bounded: the intervention, and at most one follow-up.",
      "An operational failure to apply an accepted offer is never recorded as a retention success.",
    ],
    reusableRule:
      "Retention intervention is complete only when its business outcome is known, and unsuccessful interventions should not loop indefinitely.",
  },
  {
    "id": "RET-31",
    "slug": "predicted-need-replenishment",
    "category": "retention",
    "goal": "recovery-retry",
    "channels": [
      "email",
      "push",
      "in-app"
    ],
    "name": "Depletion predicted → replenishment prompted before it → replenished, dismissed or lapsed",
    "shortName": "Predicted Need Replenishment",
    "purpose": "Prompt a person to replenish a consumable or recurring-use item shortly before its usable period is predicted to end, stating the prediction as an estimate, and stop the moment they buy, dismiss, or the cycle passes.",
    "objective": "Get the replenishment made before the need bites, with the prediction stated honestly as an estimate and a direct route to reorder; never prompt a need already met, dismissed, or covered by a subscription.",
    "entity": {
      "scope": "the predicted need - one consumable or recurring-use item, or a category the person buys on a cadence, whose usable period is computed from their own purchase and the item's usable life",
      "note": "One instance per need and prediction cycle. The prediction is inferred from the person's own purchases and the item's usable period, never from a category average alone; a dismissal mutes the need for this cycle and the next prediction opens a new instance. An active subscription or auto-replenishment for the need means no instance at all.",
      "instanceKey": [
        "person_id",
        "need_key"
      ],
      "concurrency": "one-active-per-key",
      "supersession": {
        "id": "s.supersession",
        "label": "CANONICAL_RULE",
        "text": "A purchase of the need, by any channel, closes the instance as replenished; a newer prediction for the same need does not open a second instance while one is open."
      }
    },
    "eligibility": [
      "a prior purchase of the need by this person, with a usable period the company can compute for it",
      "no newer purchase of the need since the one the prediction is based on",
      "no active subscription or auto-replenishment covering the need",
      "no dismissal recorded for the need in this prediction cycle",
      "purpose-level permission for commercial communication is recorded, and hard gates (GLB-31) allow it"
    ],
    "suppressions": [
      {
        "id": "s.replenished",
        "label": "CANONICAL_RULE",
        "text": "Exit the moment a purchase of the need is recorded by any channel; every touch re-reads purchases first."
      },
      {
        "id": "s.dismissed",
        "label": "CANONICAL_RULE",
        "text": "A dismissal - not needed, already have it, stop reminding - mutes the need for this cycle and nothing further is sent; a dismissal that asks for no more prompts mutes the need key until the person changes it."
      },
      {
        "id": "s.subscription",
        "label": "CANONICAL_RULE",
        "text": "An active subscription or auto-replenishment for the need sends nothing; the prompt would ask for a purchase already arranged."
      },
      {
        "id": "s.estimate",
        "label": "CANONICAL_RULE",
        "text": "The prediction is stated as an estimate from their own purchase history, never as a fact about what they have left."
      },
      {
        "id": "s.permission",
        "label": "CANONICAL_RULE",
        "text": "No touch without purpose-level permission for commercial communication; absent permission is a recorded no-action."
      },
      {
        "id": "s.contest",
        "label": "CANONICAL_RULE",
        "text": "A process recovery or a selection recovery for the same person outranks this journey; an open complaint, payment recovery or retention-outreach journey suppresses it (GLB-06)."
      },
      {
        "id": "s.incentive",
        "label": "OPTIONAL_STRATEGY",
        "text": "If the company enables an incentive (replenishment.incentive_policy), it appears only on the last enabled touch, once, and its issuance is recorded per person. The library recommends none by default."
      }
    ],
    "contact": {
      "defaultPriority": "promotional",
      "pressureClass": "promotional",
      "localCap": {
        "value": {
          "key": "replenishment.touches",
          "rule": "Every touch runs against a budget fixed when the instance opened; the budget is the plan's own length, and no touch is repeated because nothing could tell whether it arrived.",
          "default": {
            "value": 2,
            "confidence": "medium",
            "basis": "corpus-rule",
            "applicableWhen": "GLB-24; the plan has a lead prompt and one follow-up"
          },
          "required": false
        },
        "appliesTo": "all"
      },
      "cooldown": {
        "key": "replenishment.cooldown",
        "rule": "A lapsed or dismissed instance is not re-prompted inside the same prediction cycle; the next predicted depletion for the need opens the next instance.",
        "class": "cooldown",
        "default": {
          "value": "until the next predicted depletion for the same need",
          "confidence": "high",
          "basis": "corpus-rule",
          "applicableWhen": "the entity note: one instance per need and prediction cycle"
        },
        "required": false
      },
      "competition": {
        "exclusionGroup": "commerce-recovery",
        "scope": "person",
        "precedence": "below process recovery and selection recovery for the same person; above interest recovery",
        "onLoss": "suppressed"
      }
    },
    "channelStrategy": {
      "roles": [
        {
          "role": "persistent",
          "channels": [
            "email"
          ],
          "when": "the prompt should carry the item, the estimate and the reorder route and survive until the person can act - the default for a prompt sent days ahead of a need"
        },
        {
          "role": "low-friction",
          "channels": [
            "push",
            "in-app"
          ],
          "when": "an app session or a valid push token exists and the reorder route is a single step from the notification"
        }
      ],
      "fallback": "same-role-other-channel",
      "label": "RECOMMENDED_DEFAULT"
    },
    "orchestration": {
      "strategy": "deadline-countdown",
      "touches": [
        {
          "id": "t1",
          "stage": "lead-prompt",
          "action": "a.touch1",
          "gatedBy": "w.lead",
          "prerequisites": [
            "c.state",
            "c.sendable"
          ],
          "purpose": "The item, the estimated point at which it runs out - stated as an estimate from their own purchases - and the route to reorder. Nothing about stock or price that the system does not assert.",
          "channelRoles": [
            "persistent",
            "low-friction"
          ],
          "destination": {
            "target": "reorder",
            "boundTo": "need_key",
            "mustNotClaim": [
              "how much they have left",
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
          "gatedBy": "w.window",
          "prerequisites": [
            "c.outcome",
            "c.sendable2"
          ],
          "purpose": "One follow-up after the estimated depletion has passed unmet, with the same reorder route and no invented urgency.",
          "channelRoles": [
            "persistent",
            "low-friction"
          ],
          "destination": {
            "target": "reorder",
            "boundTo": "need_key",
            "mustNotClaim": [
              "how much they have left",
              "stock is reserved",
              "the price is held"
            ]
          },
          "mandatory": false,
          "label": "RECOMMENDED_DEFAULT"
        }
      ],
      "noAction": [
        "s.replenished",
        "s.dismissed",
        "s.subscription",
        "s.estimate",
        "s.permission",
        "s.contest"
      ]
    },
    "entry": "t.predicted",
    "nodes": [
      {
        "id": "t.predicted",
        "kind": "trigger",
        "event": "expected_depletion_approaching",
        "evidence": {
          "requires": [
            "a prior purchase of the need by this person, with its date and quantity",
            "a usable period for the item, from which the expected depletion date is computed",
            "the computed expected depletion date and the prediction cycle it belongs to"
          ],
          "insufficientAlone": [
            "a category average with no purchase by this person behind it",
            "a purchase covered by an active subscription or auto-replenishment",
            "a need dismissed in this prediction cycle",
            "a newer purchase of the need since the one the prediction rests on"
          ],
          "source": "inferred"
        },
        "next": "c.eligible"
      },
      {
        "id": "c.eligible",
        "kind": "condition",
        "asks": "Is there a need to prompt, and may we?",
        "branches": [
          {
            "label": "Eligible",
            "when": "no newer purchase, no subscription, no dismissal this cycle, no open instance, and commercial permission recorded",
            "observes": "purchase record, subscription record, dismissal record, permission record",
            "to": "a.open"
          },
          {
            "label": "Already met",
            "when": "a newer purchase of the need exists",
            "observes": "purchase_completed",
            "to": "x.replenished"
          },
          {
            "label": "Not eligible",
            "when": "a subscription covers it, it was dismissed this cycle, permission is absent, or an instance is open - the reason is recorded",
            "observes": "subscription record, dismissal record, permission record",
            "to": "a.record-no-action"
          }
        ]
      },
      {
        "id": "a.open",
        "kind": "action",
        "does": "Open the instance against the need and the prediction cycle, recording the expected depletion date the prompt will be timed against",
        "writes": [
          {
            "field": "replenishment_log",
            "mode": "append"
          }
        ],
        "idempotencyKey": "person_id + need_key + prediction cycle",
        "next": "w.lead"
      },
      {
        "id": "w.lead",
        "kind": "wait",
        "until": [
          "purchase_completed",
          "replenishment_need_dismissed"
        ],
        "onEvent": "c.state",
        "timeout": {
          "after": {
            "key": "replenishment.lead_time",
            "rule": "The prompt is timed a lead period before the expected depletion - long enough for a reorder to arrive before the need bites, short enough that the estimate still means something.",
            "class": "reminder-before-attribute",
            "default": {
              "value": {
                "min": "3 days",
                "max": "7 days"
              },
              "confidence": "low",
              "basis": "example-only",
              "applicableWhen": "delivered goods with a delivery lead time of days",
              "avoidWhen": "items bought in person the same day - a shorter lead is honest"
            },
            "required": false
          },
          "reason": "a prompt long before the need is noise and a prompt after it is late; the lead period is the delivery lead time plus a margin",
          "relativeTo": "attribute",
          "attribute": "expected_depletion_at"
        },
        "onTimeout": "c.state",
        "recheck": "purchases, subscriptions and dismissals for the need re-read from the system of record; the expected depletion date recomputed from the latest purchase",
        "windowExtendsOnEngagement": false
      },
      {
        "id": "c.state",
        "kind": "condition",
        "asks": "At the lead point, is the need still unmet?",
        "branches": [
          {
            "label": "Still unmet",
            "when": "no purchase, no subscription and no dismissal since the instance opened",
            "observes": "purchase and dismissal records",
            "to": "c.sendable"
          },
          {
            "label": "Replenished",
            "when": "a purchase of the need is recorded",
            "observes": "purchase_completed",
            "to": "x.replenished"
          },
          {
            "label": "Dismissed",
            "when": "the person dismissed the need",
            "observes": "replenishment_need_dismissed",
            "to": "x.dismissed"
          }
        ]
      },
      {
        "id": "c.sendable",
        "kind": "condition",
        "asks": "May the lead prompt go out?",
        "branches": [
          {
            "label": "Sendable",
            "when": "the send path passes: permission for commercial communication, a deliverable destination, the promotional pressure cap, no higher-precedence contest on the person, and no cooldown in force",
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
        "does": "Record why nothing was sent and against which need, so no-action is a measured outcome rather than a silent absence",
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
        "does": "Name the item, say when it is estimated to run out and that this is an estimate from their own purchases, and give the route to reorder. Claim nothing about what they have left, no reserved stock, no held price, no discount",
        "execution": "communication",
        "idempotencyKey": "person_id + need_key + prediction cycle + touch id",
        "writes": [
          {
            "field": "replenishment_log",
            "mode": "append"
          }
        ],
        "next": "w.window"
      },
      {
        "id": "w.window",
        "kind": "wait",
        "until": [
          "purchase_completed",
          "replenishment_need_dismissed"
        ],
        "onEvent": "c.outcome",
        "timeout": {
          "after": {
            "key": "replenishment.follow_margin",
            "rule": "The follow-up waits until the expected depletion has passed by a margin, so that it is sent to a need that is by then plausibly real and not to one still ahead.",
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
          "reason": "a follow-up before the estimated depletion is a repeat of the first prompt; after it, the need is plausibly present",
          "relativeTo": "attribute",
          "attribute": "expected_depletion_at"
        },
        "onTimeout": "c.outcome",
        "recheck": "purchases, subscriptions and dismissals for the need re-read from the system of record",
        "windowExtendsOnEngagement": false
      },
      {
        "id": "c.outcome",
        "kind": "condition",
        "asks": "After the estimated depletion, what happened?",
        "branches": [
          {
            "label": "Replenished",
            "when": "a purchase of the need is recorded",
            "observes": "purchase_completed",
            "to": "x.replenished"
          },
          {
            "label": "Dismissed",
            "when": "the person dismissed the need",
            "observes": "replenishment_need_dismissed",
            "to": "x.dismissed"
          },
          {
            "label": "Still unmet",
            "when": "nothing has changed",
            "observes": "purchase and dismissal records",
            "to": "c.sendable2"
          }
        ]
      },
      {
        "id": "c.sendable2",
        "kind": "condition",
        "asks": "May the follow-up go out?",
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
        "does": "Say once that the estimated point has passed and give the same reorder route. No invented urgency, and no incentive unless policy enables one for the last touch",
        "execution": "communication",
        "idempotencyKey": "person_id + need_key + prediction cycle + touch id",
        "writes": [
          {
            "field": "replenishment_log",
            "mode": "append"
          }
        ],
        "next": "w.final"
      },
      {
        "id": "w.final",
        "kind": "wait",
        "until": [
          "purchase_completed",
          "replenishment_need_dismissed"
        ],
        "onEvent": "c.final",
        "timeout": {
          "after": {
            "key": "replenishment.lifetime",
            "rule": "After the follow-up the instance stays open only to observe a replenishment or a dismissal; then it lapses and the next prediction cycle is the next chance.",
            "class": "observation-window",
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
          "reason": "there is no third prompt to time; the instance only observes",
          "relativeTo": "previous-touch"
        },
        "onTimeout": "x.lapsed",
        "recheck": "purchases and dismissals for the need re-read from the system of record",
        "windowExtendsOnEngagement": false
      },
      {
        "id": "c.final",
        "kind": "condition",
        "asks": "What ended the observation?",
        "branches": [
          {
            "label": "Replenished",
            "when": "a purchase of the need is recorded",
            "observes": "purchase_completed",
            "to": "x.replenished"
          },
          {
            "label": "Dismissed",
            "when": "the person dismissed the need",
            "observes": "replenishment_need_dismissed",
            "to": "x.dismissed"
          }
        ]
      },
      {
        "id": "x.replenished",
        "kind": "exit",
        "state": "replenished; a purchase of the need is recorded",
        "class": "success",
        "terminal": false,
        "reEntry": "the next prediction cycle, computed from this purchase, opens the next instance"
      },
      {
        "id": "x.dismissed",
        "kind": "exit",
        "state": "dismissed by the person; the need is muted for this cycle",
        "class": "suppression",
        "terminal": false,
        "reEntry": "the next prediction cycle opens a new instance unless the dismissal asked for no more prompts"
      },
      {
        "id": "x.no-action",
        "kind": "exit",
        "state": "no prompt sent; the reason is recorded",
        "class": "no-action",
        "terminal": false,
        "reEntry": "the next prediction cycle opens a new instance"
      },
      {
        "id": "x.lapsed",
        "kind": "exit",
        "state": "prompted, neither replenished nor dismissed; nothing further this cycle",
        "class": "timeout",
        "terminal": false,
        "reEntry": "the next prediction cycle opens a new instance"
      }
    ],
    "implementation": {
      "attributes": {
        "required": [
          "person_id",
          "need_key",
          "last_purchase_at",
          "last_purchase_quantity",
          "usable_period",
          "expected_depletion_at",
          "prediction_cycle",
          "reorder_destination"
        ],
        "optional": [
          "subscription_status",
          "dismissal_status",
          "has_active_app_session",
          "delivery_lead_time"
        ]
      }
    },
    "measurement": {
      "journeyOutcome": {
        "type": "exit",
        "refs": [
          "x.replenished",
          "x.dismissed",
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
          "key": "replenishment.holdout_share",
          "rule": "A persistent per-person holdout is required: people replenish consumables on their own cadence, and without a holdout the journey claims every reorder that followed a prompt.",
          "default": {
            "value": 10,
            "confidence": "low",
            "basis": "example-only"
          },
          "required": false
        }
      },
      "secondary": [
        "replenishment_need_dismissed"
      ],
      "guardrails": [
        "unsubscribe",
        "complaint",
        "message_after_success",
        "prompt_after_dismissal",
        "prediction_error_reported",
        "incentive_issued"
      ],
      "operational": [
        "entry_volume",
        "no_action_rate_by_reason",
        "lead_prompt_rate",
        "follow_up_rate",
        "dismissal_rate",
        "prediction_error_distribution"
      ]
    },
    "discovery": {
      "aliases": [
        "replenishment reminder",
        "reorder reminder",
        "running-low reminder",
        "consumable refill reminder",
        "repurchase reminder",
        "predicted next purchase"
      ],
      "useCases": [
        "a consumable bought on a cadence whose usable period is ending",
        "a category the person repurchases predictably, prompted before the next expected purchase"
      ],
      "presets": [
        {
          "id": "predicted-next-purchase",
          "name": "Predicted Next Purchase",
          "applicableWhen": {
            "id": "p.next-purchase",
            "label": "CANONICAL_RULE",
            "text": "The need is predicted from the person's own purchase cadence in a category rather than from a single item's usable period; the machine is the same and the estimate is stated as one."
          },
          "overrides": {
            "replenishment.lead_time": {
              "min": "5 days",
              "max": "10 days"
            }
          },
          "destination": "the category reorder route",
          "aliases": [
            "predicted next purchase",
            "next order reminder",
            "repeat purchase prompt",
            "cadence reminder"
          ]
        }
      ]
    },
    "distinctFrom": [
      {
        "journey": "ACQ-13",
        "because": "ACQ-13 works from observed attention. A predicted need rests on a purchase the person made and a usable period, with no attention observed at all."
      },
      {
        "journey": "RET-32",
        "because": "RET-32 addresses a relationship that ended. A predicted need addresses an active buyer whose next purchase is due."
      }
    ],
    "guardrails": [
      "The prediction is an estimate from the person's own purchases and is stated as one; nothing is claimed about what they have left.",
      "A dismissal is honoured for the cycle, and a dismissal asking for no more prompts is honoured until the person changes it.",
      "A subscription or auto-replenishment for the need means no prompt at all.",
      "Opens and clicks change nothing; only purchase and dismissal events move the state."
    ],
    "reusableRule": "A predicted need is prompted once before its estimated point and at most once after it, against the person's own purchase record re-read before each touch, with the estimate stated as an estimate."
  },
  {
    "id": "RET-32",
    "slug": "lapsed-customer-win-back",
    "category": "retention",
    "goal": "recovery-retry",
    "channels": [
      "email",
      "push"
    ],
    "name": "Paid relationship lapsed → outreach permitted → won back, declined or left alone",
    "shortName": "Lapsed Customer Win-Back",
    "purpose": "Invite a person whose paid relationship ended or went dormant to come back - once, honestly, with whatever has actually changed since they left - after the cancellation's own window has passed and only where the recorded reason and history do not rule it out.",
    "objective": "Win back a formerly paying relationship with a plain invitation that speaks to why they left where that is known, with a long cooldown afterwards; never write to someone whose recorded reason or history says not to.",
    "entity": {
      "scope": "a formerly paying relationship that ended or went dormant under the company's lapse rule and has no active obligation, subscription, open complaint or process",
      "note": "Distinct from a never-paid reactivation (ACT-20) by eligibility - there was a paid relationship - and from a cancellation in motion (RET-28) by timing: this journey starts only after the cancellation's own save window and cooldown have passed. One instance per relationship and lapse; a long cooldown separates instances.",
      "instanceKey": [
        "person_id",
        "relationship_id"
      ],
      "concurrency": "one-active-per-key",
      "supersession": {
        "id": "s.supersession",
        "label": "CANONICAL_RULE",
        "text": "A repaid relationship - a new paid term, a purchase, a reactivated subscription - closes the instance as won; a new lapse after that is a new instance, subject to the cooldown."
      }
    },
    "eligibility": [
      "the relationship was paid - at least one completed paid term or purchase on it",
      "it ended or went dormant under the company's lapse rule, and the cancellation's own save window and cooldown have passed",
      "no active obligation, subscription, open complaint, payment recovery or process exists on the relationship",
      "the recorded cancellation reason is not one policy lists as excluding outreach, and the refund and dispute history does not exclude it",
      "purpose-level permission for commercial communication is recorded and was not withdrawn at cancellation, and hard gates (GLB-31) allow it"
    ],
    "suppressions": [
      {
        "id": "s.recent",
        "label": "CANONICAL_RULE",
        "text": "A cancellation still inside its own save window or the cooldown after it is Cancellation Save's territory (RET-28); nothing is sent here."
      },
      {
        "id": "s.reason",
        "label": "CANONICAL_RULE",
        "text": "A recorded cancellation reason that policy lists as excluding outreach - closed business, bereavement, relocation out of service, an unresolved complaint - sends nothing and is recorded as no-action."
      },
      {
        "id": "s.history",
        "label": "CANONICAL_RULE",
        "text": "A refund, dispute or chargeback history that policy lists as excluding commercial outreach sends nothing."
      },
      {
        "id": "s.open",
        "label": "CANONICAL_RULE",
        "text": "Any open obligation, complaint, payment recovery or active relationship means the relationship is not lapsed; the instance closes as no-action."
      },
      {
        "id": "s.permission",
        "label": "CANONICAL_RULE",
        "text": "Permission withdrawn at or after cancellation is final for this journey; absent permission is a recorded no-action, never a fallback to another channel."
      },
      {
        "id": "s.honest",
        "label": "CANONICAL_RULE",
        "text": "The invitation says what actually changed since they left where something did, and is a plain invitation where nothing did; no change is invented to have something to say."
      },
      {
        "id": "s.incentive",
        "label": "OPTIONAL_STRATEGY",
        "text": "If the company enables a win-back incentive (winback.incentive_policy), it appears only on the last enabled touch, once, and its issuance is recorded per person so it cannot be re-issued on the next lapse."
      }
    ],
    "contact": {
      "defaultPriority": "promotional",
      "pressureClass": "promotional",
      "localCap": {
        "value": {
          "key": "winback.touches",
          "rule": "Every touch runs against a budget fixed when the instance opened; the budget is the plan's own length, and the second touch exists only where the company enables it.",
          "default": {
            "value": 2,
            "confidence": "medium",
            "basis": "corpus-rule",
            "applicableWhen": "GLB-24; one invitation and one optional follow-up"
          },
          "required": false
        },
        "appliesTo": "all"
      },
      "cooldown": {
        "key": "winback.cooldown",
        "rule": "A relationship that did not come back is left alone for a long cooldown before any further win-back instance; a person who left and was asked once has answered.",
        "class": "cooldown",
        "default": {
          "value": {
            "min": "180 days",
            "max": "365 days"
          },
          "confidence": "low",
          "basis": "example-only",
          "applicableWhen": "subscription and membership relationships",
          "avoidWhen": "seasonal relationships, where the cooldown is the season"
        },
        "required": false
      },
      "competition": {
        "exclusionGroup": "retention-outreach",
        "scope": "account",
        "precedence": "lowest in the group - any live retention, complaint, risk or payment journey on the account means the relationship is not lapsed and this journey does not run",
        "onLoss": "suppressed"
      }
    },
    "channelStrategy": {
      "roles": [
        {
          "role": "persistent",
          "channels": [
            "email"
          ],
          "when": "the invitation should say what changed and carry the route back, and survive until the person reads it - the default for someone who is not in the product"
        },
        {
          "role": "low-friction",
          "channels": [
            "push"
          ],
          "when": "a valid push token still exists on a device the person kept the app on, and the route back is a single step"
        }
      ],
      "fallback": "same-role-other-channel",
      "label": "RECOMMENDED_DEFAULT"
    },
    "orchestration": {
      "strategy": "offer-decide-remind",
      "touches": [
        {
          "id": "t1",
          "stage": "invitation",
          "action": "a.touch1",
          "prerequisites": [
            "c.eligible",
            "c.basis",
            "c.sendable"
          ],
          "purpose": "A plain invitation to come back: what actually changed since they left where something did, the route back, and nothing invented.",
          "channelRoles": [
            "persistent",
            "low-friction"
          ],
          "destination": {
            "target": "return-route",
            "boundTo": "relationship_id",
            "mustNotClaim": [
              "a change that did not happen",
              "that their previous terms are held",
              "a discount policy does not enable"
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
          "gatedBy": "w.response",
          "prerequisites": [
            "c.second",
            "c.sendable2"
          ],
          "purpose": "One follow-up, only where the company enables it and there is something honest to add - an incentive policy enables, or a further change - with the same route back.",
          "channelRoles": [
            "persistent",
            "low-friction"
          ],
          "destination": {
            "target": "return-route",
            "boundTo": "relationship_id",
            "mustNotClaim": [
              "a change that did not happen",
              "that their previous terms are held"
            ]
          },
          "mandatory": false,
          "label": "OPTIONAL_STRATEGY"
        }
      ],
      "noAction": [
        "s.recent",
        "s.reason",
        "s.history",
        "s.open",
        "s.permission",
        "s.honest"
      ]
    },
    "entry": "t.lapsed",
    "nodes": [
      {
        "id": "t.lapsed",
        "kind": "trigger",
        "event": "lapsed_customer_detected",
        "evidence": {
          "requires": [
            "a relationship record showing at least one completed paid term or purchase",
            "the relationship ended or went dormant under the company's lapse rule, with the date",
            "the recorded cancellation reason where one exists, and the refund and dispute history",
            "that the cancellation's own save window and cooldown have passed"
          ],
          "insufficientAlone": [
            "low usage on an active relationship - that is usage-drop territory, not a lapse",
            "a cancellation still inside its save window - Cancellation Save (RET-28) owns it",
            "a lapse caused by an unpaid obligation that is still open - payment recovery owns it",
            "a trial or free relationship that never paid - reactivation (ACT-20) owns it"
          ],
          "source": "authoritative"
        },
        "next": "c.eligible"
      },
      {
        "id": "c.eligible",
        "kind": "condition",
        "asks": "Is this relationship one we may write to about coming back?",
        "branches": [
          {
            "label": "Eligible",
            "when": "paid before, lapsed past the cancellation's own window, nothing open on it, a reason and history that do not exclude outreach, permission recorded and not withdrawn",
            "observes": "relationship record, cancellation reason, refund and dispute history, permission record",
            "to": "a.open"
          },
          {
            "label": "Excluded",
            "when": "the reason, the history, something open, or absent permission rules it out - the reason is recorded",
            "observes": "cancellation reason, refund and dispute history, open items, permission record",
            "to": "a.record-no-action"
          }
        ]
      },
      {
        "id": "a.open",
        "kind": "action",
        "does": "Open the win-back instance against the relationship and this lapse, recording the cancellation reason it will speak to and the date the cooldown will be counted from",
        "writes": [
          {
            "field": "winback_log",
            "mode": "append"
          }
        ],
        "idempotencyKey": "person_id + relationship_id + lapse date",
        "next": "c.basis"
      },
      {
        "id": "c.basis",
        "kind": "condition",
        "asks": "What can the invitation honestly say?",
        "branches": [
          {
            "label": "Something changed that speaks to why they left",
            "when": "a recorded change since the lapse addresses the recorded reason - a fixed problem, a changed plan, a restored feature",
            "observes": "cancellation reason, change record",
            "to": "c.sendable"
          },
          {
            "label": "Nothing specific",
            "when": "no recorded change speaks to the reason, or no reason was recorded - the invitation is plain",
            "observes": "cancellation reason, change record",
            "to": "c.sendable"
          }
        ]
      },
      {
        "id": "c.sendable",
        "kind": "condition",
        "asks": "May the invitation go out?",
        "branches": [
          {
            "label": "Sendable",
            "when": "the send path passes: permission for commercial communication, a deliverable destination, the promotional pressure cap, no higher-precedence contest on the account, and no win-back cooldown in force",
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
        "does": "Record why nothing was sent - an excluding reason, history, something open, no permission, or a gate on the send path - so no-action is a measured outcome",
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
        "does": "Invite them back plainly: what actually changed since they left where something did, and the route back. Nothing invented, no terms held that are not held, no discount policy does not enable",
        "execution": "communication",
        "idempotencyKey": "person_id + relationship_id + lapse date + touch id",
        "writes": [
          {
            "field": "winback_log",
            "mode": "append"
          }
        ],
        "next": "w.response"
      },
      {
        "id": "w.response",
        "kind": "wait",
        "until": [
          "relationship_repaid",
          "purchase_completed"
        ],
        "onEvent": "x.won",
        "timeout": {
          "after": {
            "key": "winback.response_window",
            "rule": "The invitation is given time to be acted on in the person's own time; a follow-up inside that time is pressure on someone who already left once.",
            "class": "response-window",
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
          "reason": "someone who left is not in a hurry to return; the window is weeks, not days",
          "relativeTo": "previous-touch"
        },
        "onTimeout": "c.second",
        "recheck": "the relationship re-read: still lapsed, nothing opened on it, permission still recorded",
        "windowExtendsOnEngagement": false
      },
      {
        "id": "c.second",
        "kind": "condition",
        "asks": "Is a follow-up enabled, and is there something honest to add?",
        "branches": [
          {
            "label": "Enabled with something to add",
            "when": "the company has enabled the follow-up (winback.follow_up_enabled) and either an incentive policy enables an offer for the last touch or a further change is recorded",
            "observes": "winback.follow_up_enabled, winback.incentive_policy, change record",
            "to": "c.sendable2"
          },
          {
            "label": "Not enabled, or nothing to add",
            "when": "the follow-up is disabled, or there is nothing honest to say beyond the invitation already sent",
            "observes": "winback.follow_up_enabled, change record",
            "to": "x.lapsed"
          }
        ]
      },
      {
        "id": "c.sendable2",
        "kind": "condition",
        "asks": "May the follow-up go out?",
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
        "does": "Say once what is being added - the enabled incentive, or the further change - with the same route back, and record the incentive's issuance per person where one is issued",
        "execution": "communication",
        "idempotencyKey": "person_id + relationship_id + lapse date + touch id",
        "writes": [
          {
            "field": "winback_log",
            "mode": "append"
          },
          {
            "field": "incentive_issuance",
            "mode": "append"
          }
        ],
        "next": "w.final"
      },
      {
        "id": "w.final",
        "kind": "wait",
        "until": [
          "relationship_repaid",
          "purchase_completed"
        ],
        "onEvent": "x.won",
        "timeout": {
          "after": {
            "key": "winback.lifetime",
            "rule": "After the follow-up the instance stays open only to observe a return; then it lapses and the long cooldown starts.",
            "class": "observation-window",
            "default": {
              "value": {
                "min": "30 days",
                "max": "60 days"
              },
              "confidence": "low",
              "basis": "example-only"
            },
            "required": false
          },
          "reason": "there is no third touch; the instance only observes",
          "relativeTo": "previous-touch"
        },
        "onTimeout": "x.lapsed",
        "recheck": "the relationship re-read from the system of record",
        "windowExtendsOnEngagement": false
      },
      {
        "id": "x.won",
        "kind": "exit",
        "state": "won back; the relationship is repaid",
        "class": "success",
        "terminal": false,
        "reEntry": "a later lapse is a new instance, subject to the cooldown counted from this lapse"
      },
      {
        "id": "x.no-action",
        "kind": "exit",
        "state": "no invitation sent; the excluding reason or gate is recorded",
        "class": "no-action",
        "terminal": false,
        "reEntry": "an excluding reason or history is re-evaluated only when it changes; a gate on the send path is re-evaluated at the next lapse"
      },
      {
        "id": "x.lapsed",
        "kind": "exit",
        "state": "invited, not returned; left alone for the cooldown",
        "class": "timeout",
        "terminal": false,
        "reEntry": "no further win-back instance until the cooldown has passed"
      }
    ],
    "implementation": {
      "attributes": {
        "required": [
          "person_id",
          "relationship_id",
          "paid_terms_or_purchases",
          "lapsed_at",
          "lapse_rule",
          "cancellation_reason",
          "refund_dispute_history",
          "return_destination"
        ],
        "optional": [
          "change_record_since_lapse",
          "has_push_token",
          "previous_plan",
          "winback_incentive_eligibility"
        ]
      }
    },
    "measurement": {
      "journeyOutcome": {
        "type": "exit",
        "refs": [
          "x.won",
          "x.no-action",
          "x.lapsed"
        ]
      },
      "businessOutcome": {
        "event": "relationship_repaid",
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
          "key": "winback.holdout_share",
          "rule": "A persistent holdout is required: lapsed customers return on their own, and without a holdout the journey claims every return that followed an invitation; the holdout is the only honest measure of an incentive's cost.",
          "default": {
            "value": 10,
            "confidence": "low",
            "basis": "example-only"
          },
          "required": false
        }
      },
      "secondary": [
        "purchase_completed"
      ],
      "guardrails": [
        "unsubscribe",
        "complaint",
        "message_after_success",
        "outreach_on_excluded_reason",
        "incentive_issued",
        "incentive_reissued_same_person"
      ],
      "operational": [
        "entry_volume",
        "exclusion_rate_by_reason",
        "invitation_rate",
        "follow_up_rate",
        "return_rate",
        "time_to_return"
      ]
    },
    "discovery": {
      "aliases": [
        "win-back",
        "winback campaign",
        "lapsed customer reactivation",
        "churned customer recovery",
        "come-back offer",
        "former customer outreach",
        "lapsed subscriber win-back"
      ],
      "useCases": [
        "a subscription that ended months ago with a reason that does not rule out outreach",
        "a customer who stopped buying past the company's lapse rule and has nothing open"
      ]
    },
    "distinctFrom": [
      {
        "journey": "ACT-20",
        "because": "ACT-20 reactivates a relationship that never paid. This addresses one that did, which changes the eligibility, the economics and what the invitation may honestly say."
      },
      {
        "journey": "RET-28",
        "because": "RET-28 acts at the moment of cancellation intent, inside the cancellation's own window. This starts only after that window and its cooldown have passed."
      }
    ],
    "guardrails": [
      "A recorded reason or history that policy lists as excluding outreach is final for the instance.",
      "The invitation says what actually changed or is plain; no change is invented.",
      "One invitation, one optional follow-up, then a long cooldown; a person who left and was asked once has answered.",
      "An incentive, where enabled, appears once on the last enabled touch and is recorded per person so it is never re-issued on the next lapse."
    ],
    "reusableRule": "A lapsed paid relationship is invited back at most twice, only after its cancellation's own window has passed and only where reason, history and permission allow, with whatever honestly changed and a long cooldown afterwards."
  },
];
