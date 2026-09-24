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
   category is seven journeys drawing the lines between them. RET-21 keeps
   engagement a changing state rather than a label. RET-22 refuses to read
   absence as evidence without a pattern to read it against. RET-23 insists a
   health score name what moved it before anyone is contacted. RET-24 makes
   intervention scale with evidence instead of with account value. RET-27 is
   the whole category in one journey: a good sign is the start of recovery,
   not recovery. RET-29 is the completion side of the intent/completion line
   that RET-28 used to share with it.

   RET-25 is not here. Evaluating a risk signal is a risk and policy
   responsibility rather than a retention one, and it opened on the same event
   as RSK-192, which now owns it.

   RET-26 is not here either (retired 2026-09-24, site owner's request -
   "kaldır"). It was the library's general-purpose service-recovery journey;
   RET-23's h.service branch, its one real inbound handoff, now hands a
   service failure straight to external:operational-resolution instead.

   RET-30 was retired the same day for the same reason. It closed a
   retention offer on its actual outcome - accepted, declined, applied or
   not - rather than on the customer's answer alone. Its one real inbound
   handoff, an alternative offered at the cancellation decision point, was
   absorbed into RET-28's own w.decision before RET-28 itself was retired
   (below).

   RET-28 is not here either (retired 2026-09-24, site owner's request -
   "kaldır"). It was the cancellation-intent decision point: the moment
   someone declares they want to leave, before the decision is final. It had
   no real inbound handoffs of its own. RET-24's h.cancellation, its only
   real caller, now exits as x.cancellation-in-motion instead: cancellation
   intent already on record needs no separate retention track opened.
   RET-29 remains as the completion side of the line RET-28 used to draw
   with it; RET-32's lapse-eligibility window still excludes an account
   still inside its own cancellation save window and cooldown, described in
   RET-32's own terms rather than by naming the journey that used to own it.

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
        does: "Look for evidence around the absence: repeated failures, an unresolved blocker, falling value realisation, negative feedback, narrowing depth or breadth, any exploration of cancellation. Record the miss itself, corroborated or not, so a later miss on the same use case has something to accumulate against - absence is evidence only in aggregate, and an aggregate needs a record to add to",
        writes: [{ field: "corroborating_evidence", mode: "append" }],
        next: "c.corroborated",
        idempotencyKey: "account_id + use_case_id + a.inspect",
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
        idempotencyKey: "account_id + relationship_id + a.decompose",
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
        to: "ACT-17",
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
            "relationship_id",
            "account_id",
            "handed_at",
            "reason"
          ]
        },
      },
      {
        id: "h.service",
        kind: "handoff",
        to: "external:operational-resolution",
        on: "deterioration caused by a service failure on our side",
        carries: ["what failed and when", "whether the customer is still affected"],
        contract: {
          "requiredFields": [
            "relationship_id",
            "account_id",
            "handed_at",
            "reason"
          ]
        },
      },
      {
        id: "h.payment",
        kind: "handoff",
        to: "external:payment-recovery",
        on: "deterioration traced to billing or payment",
        carries: ["the failed payment or dispute", "the entitlement currently at stake"],
        contract: {
          "requiredFields": [
            "relationship_id",
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
            "relationship_id",
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
        idempotencyKey: "account_id + relationship_id + a.diagnostic",
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
    channels: ["email", "in-app", "task"],
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
          "role": "persistent",
          "channels": [
            "email"
          ],
          "when": "the risk is disengagement; the person is not in the product"
        },
        {
          "role": "in-session",
          "channels": [
            "in-app"
          ],
          "when": "the risk is in-product friction; the check-in belongs beside the thing that is failing"
        },
        {
          "role": "human",
          "channels": [
            "task"
          ],
          "when": "the step is carried out by a person - a call, a task, a visit - and recorded as done by them"
        }
      ],
      "fallback": "none",
      "label": "RECOMMENDED_DEFAULT"
    },
    orchestration: {
      "strategy": "human-escalation-ladder",
      "touches": [
        {
          "id": "t-checkin-email",
          "stage": "risk-check-in",
          "action": "a.check-in-email",
          "prerequisites": [
            "c.intent",
            "c.operational",
            "c.priority-clear",
            "c.signal-class"
          ],
          "purpose": "Ask what is going wrong on the channel that reaches someone who has stopped using the product, and give them a route to a person - no offer, no discount.",
          "channelRoles": [
            "persistent"
          ],
          "mandatory": false,
          "label": "CANONICAL_RULE"
        },
        {
          "id": "t-checkin-inapp",
          "stage": "risk-check-in",
          "action": "a.check-in-inapp",
          "prerequisites": [
            "c.intent",
            "c.operational",
            "c.priority-clear",
            "c.signal-class"
          ],
          "purpose": "Ask what is going wrong beside the thing that is failing, in the product, and give them a route to a person - no offer, no discount.",
          "channelRoles": [
            "in-session"
          ],
          "mandatory": false,
          "label": "CANONICAL_RULE"
        },
        {
          "id": "t-owner-task",
          "stage": "owner-task",
          "action": "a.owner-task",
          "gatedBy": "w.response",
          "prerequisites": [
            "c.human"
          ],
          "purpose": "Raise a task for the account owner or customer success, carrying the evidence - including any reply the check-in drew - rather than the score, and suppress automated retention on this relationship so the person is not contradicted by a sequence while they work",
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
          "x.contended",
          "x.monitored",
          "x.recovered",
          "x.cancellation-in-motion",
          "h.resolve-first",
          "h.human"
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
            to: "x.cancellation-in-motion",
          },
          {
            label: "No stated intent",
            when: "the risk is inferred from behaviour and events, and nobody has said anything",
            to: "a.evidence",
          },
        ],
      },
      {
        id: "x.cancellation-in-motion",
        kind: "exit",
        state: "cancellation intent already on record; no separate retention track opened",
        terminal: false,
        reEntry:
          "a lapsed or abandoned cancellation, or a fresh risk signal once the decision resolves, re-opens this evaluation from current evidence",
        class: "no-action",
      },
      {
        id: "a.evidence",
        kind: "action",
        does: "Assemble the signals with their sources and strengths. What matters is whether they corroborate each other, not how many there are - three readings of the same underlying event are one piece of evidence",
        writes: [{ field: "risk_evidence", mode: "append" }],
        next: "c.operational",
        idempotencyKey: "risk_episode_id + account_id + a.evidence",
      },
      {
        id: "c.operational",
        kind: "condition",
        asks: "Is the risk driven by a known operational problem, other than a payment failure already open in payment recovery?",
        branches: [
          {
            label: "Known problem",
            when: "the evidence points at something specific that is broken or unresolved, and it is not a payment failure with an open payment recovery instance on this relationship - that cause already has an owner",
            to: "h.resolve-first",
          },
          {
            label: "No known problem",
            when: "the relationship is deteriorating and nothing identifiable is causing it, or the identifiable cause is a payment failure that payment recovery already owns",
            to: "c.priority-clear",
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
        id: "c.priority-clear",
        kind: "condition",
        asks: "Does a higher-precedence retention-outreach contender already claim this account?",
        branches: [
          {
            label: "Clear",
            when: "no open issue under human ownership (FBK-46) currently claims this account - this journey's own declared precedence is below that, above generic retention intervention",
            to: "c.signal-class",
          },
          {
            label: "Contended",
            when: "an open issue under human ownership already claims this account - sending a check-in, or raising a competing owner-task, would contradict the person already working it rather than corroborate their evidence",
            to: "x.contended",
          },
        ],
      },
      {
        id: "c.signal-class",
        kind: "condition",
        asks: "What kind of risk is this?",
        branches: [
          {
            label: "Disengagement",
            when: "the evidence points at sustained usage decline, falling account-wide adoption, a key stakeholder leaving, or a failed renewal or payment - by definition, the person is not in the product",
            observes: "risk_evidence",
            to: "a.check-in-email",
          },
          {
            label: "In-product friction",
            when: "the evidence points at repeated unresolved blockers, a negative support experience, or explicit dissatisfaction - the risk was generated by something failing inside the product, where the person still is",
            observes: "risk_evidence",
            to: "a.check-in-inapp",
          },
        ],
      },
      {
        id: "a.check-in-email",
        kind: "action",
        does: "Send a check-in naming what we can see going wrong, with a route to a person, on the route that reaches someone who is not in the product. Carries no offer and no discount; this journey never makes one",
        next: "w.response",
        execution: "communication",
        idempotencyKey: "risk_episode_id + account_id + a.check-in-email",
      },
      {
        id: "a.check-in-inapp",
        kind: "action",
        does: "Send a check-in naming what we can see going wrong, with a route to a person, beside the thing that is failing, where the person still is. Carries no offer and no discount; this journey never makes one",
        next: "w.response",
        execution: "communication",
        idempotencyKey: "risk_episode_id + account_id + a.check-in-inapp",
      },
      {
        id: "w.response",
        kind: "wait",
        until: ["relationship_recovered", "explicit_cancellation_intent"],
        onEvent: "c.moved",
        timeout: {
          after: {
            key: "churn_risk.response_window",
            rule: "A bounded window to notice whether the check-in changed anything, before spending a person's attention on a relationship that did not answer.",
            class: "response-window",
            required: true,
          },
          reason: "an unanswered check-in is itself a result - the alternative to acting on that is waiting indefinitely for a reply that may never come",
          relativeTo: "previous-touch",
        },
        onTimeout: "c.human",
        windowExtendsOnEngagement: false,
        recheck: "the relationship state and the cancellation record, re-read from the systems that own them, before the timeout is acted on",
      },
      {
        id: "c.moved",
        kind: "condition",
        asks: "Did the relationship state move?",
        branches: [
          {
            label: "Recovered",
            when: "the relationship measurably recovered",
            observes: "relationship_recovered",
            to: "x.recovered",
          },
          {
            label: "Cancellation declared",
            when: "a cancellation was requested, or a cancel flow entered, while waiting for a response to the check-in",
            observes: "explicit_cancellation_intent",
            to: "x.cancellation-in-motion",
          },
        ],
      },
      {
        id: "x.recovered",
        kind: "exit",
        state: "the relationship recovered; risk cleared without escalation",
        terminal: false,
        reEntry: "a fresh risk evaluation is a new instance if the threshold crosses again",
        class: "success",
      },
      {
        id: "c.human",
        kind: "condition",
        asks: "Does the evidence - including any reply received during the check-in window - now justify a person?",
        branches: [
          {
            label: "Justified",
            when: "the evidence is strong and corroborated, and the relationship warrants the cost of someone's attention",
            to: "a.owner-task",
          },
          {
            label: "Not justified",
            when: "the evidence is real but thin, and a person's attention would be a larger intervention than the signal supports",
            to: "x.monitored",
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
        idempotencyKey: "risk_episode_id + account_id + a.owner-task",
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
            "relationship_id",
            "account_id",
            "handed_at",
            "reason"
          ]
        },
      },
      {
        id: "x.contended",
        kind: "exit",
        state: "another owner already holds this account",
        terminal: false,
        reEntry:
          "that contender resolving re-opens this evaluation from current evidence rather than resuming a stale one",
        class: "suppression",
      },
      {
        id: "x.monitored",
        kind: "exit",
        state: "risk recorded, monitored; nothing further from this evaluation",
        terminal: false,
        reEntry:
          "stronger or fresher evidence re-opens this at a higher level - doing nothing is a legitimate response to weak evidence",
        class: "no-action",
      },
    ],
    guardrails: [
      "A single weak signal never constitutes churn risk. Corroboration between independent signals is what the threshold is measuring.",
      "A high-value customer is not automatically at high risk. Value is what is at stake, not the probability of losing it.",
      "A risk score is not the outcome. It orders attention; it does not decide anything.",
      "The size of the intervention tracks the strength of the evidence. An expensive save offer on thin evidence teaches customers what to do when they want one.",
      "This journey's own owner-task never fires while a higher-precedence retention-outreach contender (an open issue under human ownership, FBK-46) already claims the account - c.priority-clear re-reads that live claim once, before the check-in is sent, rather than trusting declared precedence text alone. c.intent's own cancellation-intent check already covers the other higher-precedence contender: cancellation intent already expressed.",
      "The check-in carries no offer and no discount - this journey never makes one. This journey hands nobody off on the strength of a bare check-in: a reply that neither recovers the relationship nor declares cancellation is additional evidence, read by c.human exactly as a silent timeout would be, never manufactured into a delivered intervention.",
    ],
    reusableRule:
      "Churn intervention should increase only as independent evidence of relationship risk becomes stronger.",
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
        idempotencyKey: "relationship_id + a.invalidate",
      },
      {
        id: "a.termination-state",
        kind: "action",
        does: "Establish when this actually ends: immediately, at the end of the current period, or on a scheduled future date. Everything downstream depends on which, and assuming immediate is how paid entitlement gets revoked early",
        writes: [{ field: "termination_state", mode: "set" }],
        next: "c.access",
        idempotencyKey: "relationship_id + a.termination-state",
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
        idempotencyKey: "relationship_id + a.wind-down",
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

  {
    "id": "RET-31",
    "slug": "predicted-need-replenishment",
    "category": "retention",
    "goal": "recovery-retry",
    "channels": ["push", "email"],
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
        "text": "A process recovery or a selection recovery for the same person outranks this journey; an open complaint, payment recovery or retention-outreach journey suppresses it (GLB-06); so does an open availability enquiry (SCH-282) for the same person."
      },
      {
        "id": "s.incentive",
        "label": "OPTIONAL_STRATEGY",
        "text": "If the company enables an incentive (replenishment.incentive_policy), it appears only on the last enabled touch, once, and its issuance is recorded per person. The library recommends none by default."
      },
      {
        "id": "s.sunset",
        "label": "CANONICAL_RULE",
        "text":
          "A standing sender-side marketing suppression stops this journey. CON-300 ends marketing contact for somebody who answered none of it, and records that decision as marketing_suppression against our own sending rather than as a withdrawal on the person's consent record - so a purpose-level permission check still reads yes and cannot see it. The suppression is a hard gate under GLB-31, held and released by CON-38, and it covers promotional and lifecycle communication alike: no instance of this journey opens against a suppressed person, and an open instance stands down rather than queueing behind it. Only permission given afresh releases it - not the passing of time, and not a purchase.",
      },
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
        "precedence": "below process recovery, selection recovery and the availability enquiry (SCH-282) for the same person - a question the person asked about a stated window outranks a need computed from their history; above the back-in-stock alert (ACQ-289) and inferred-interest recovery (ACQ-13); and above the complementary next offer (RET-294) for the same person - a purchase the person's own history says is due is a stronger claim on the moment than a next step inferred from what they already own. While this journey holds a person, it is suppressed for them rather than queued behind it.",
        "onLoss": "suppressed"
      }
    },
    "channelStrategy": {
      "roles": [
        {
          "role": "low-friction",
          "channels": ["push"],
          "when": "the first prompt is close to the predicted depletion point, a deliverable push destination exists, and the reorder route can be opened directly"
        },
        {
          "role": "persistent",
          "channels": ["email"],
          "when": "otherwise, and always for the post-depletion follow-up where the estimate and reorder context should remain available"
        }
      ],
      "fallback": "none",
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
            "low-friction",
            "persistent"
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
            "persistent"
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
      },
      {
        "journey": "RET-294",
        "because": "This is a purchase the person's own history says is due. RET-294 offers the thing that completes a declared product relationship, matured by ownership rather than computed from a due date - the two never hold the same person for the same purchase at once."
      },
      {
        "journey": "ACQ-289",
        "because": "This is a predicted need computed from the person's own purchase history. ACQ-289 is a back-in-stock alert for a specific item the person asked to be told about - a different signal and a different claim on the moment."
      },
      {
        "journey": "RET-290",
        "because": "This is an ongoing predicted-need cycle that can recur for the life of the relationship. RET-290 is a one-time first-purchase moment that never reopens."
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
    "channels": ["email", "sms"],
    "name": "Paid relationship lapsed → outreach permitted → won back, declined or left alone",
    "shortName": "Lapsed Customer Win-Back",
    "purpose": "Invite a person whose paid relationship ended or went dormant to come back - once, honestly, with whatever has actually changed since they left - after the cancellation's own window has passed and only where the recorded reason and history do not rule it out.",
    "objective": "Win back a formerly paying relationship with a plain invitation that speaks to why they left where that is known, with a long cooldown afterwards; never write to someone whose recorded reason or history says not to.",
    "entity": {
      "scope": "a formerly paying relationship that ended or went dormant under the company's lapse rule and has no active obligation, subscription, open complaint or process",
      "note": "Distinct from a never-paid reactivation (ACT-20) by eligibility - there was a paid relationship - and from a cancellation still in motion by timing: this journey starts only after the cancellation's own save window and cooldown have passed. One instance per relationship and lapse; a long cooldown separates instances.",
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
        "text": "A cancellation still inside its own save window or the cooldown after it is excluded by definition; nothing is sent here."
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
        "label": "CANONICAL_RULE",
        "text": "The comeback discount appears once, on the second and final touch, where win-back incentive policy allows one, and its issuance is recorded per person so it cannot be re-issued on the next lapse."
      },
      {
        "id": "s.sunset",
        "label": "CANONICAL_RULE",
        "text":
          "A standing sender-side marketing suppression stops this journey. CON-300 ends marketing contact for somebody who answered none of it, and records that decision as marketing_suppression against our own sending rather than as a withdrawal on the person's consent record - so a purpose-level permission check still reads yes and cannot see it. The suppression is a hard gate under GLB-31, held and released by CON-38, and it covers promotional and lifecycle communication alike: no instance of this journey opens against a suppressed person, and an open instance stands down rather than queueing behind it. Only permission given afresh releases it - not the passing of time, and not a purchase.",
      },
    ],
    "contact": {
      "defaultPriority": "promotional",
      "pressureClass": "promotional",
      "localCap": {
        "value": {
          "key": "winback.touches",
          "rule": "Every touch runs against a budget fixed when the instance opened; the budget is the cascade's own length - the email invitation and the SMS comeback discount, and nothing after the second.",
          "default": {
            "value": 2,
            "confidence": "high",
            "basis": "corpus-rule",
            "applicableWhen": "GLB-24; the cascade's own length - one invitation and one comeback discount"
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
        "precedence": "any live retention, complaint, risk or payment journey on the account means the relationship is not lapsed and this journey does not run",
        "onLoss": "suppressed"
      }
    },
    "channelStrategy": {
      "roles": [
        {
          "role": "persistent",
          "channels": ["email"],
          "when": "the first invitation, where what changed since they left needs enough context to stand on its own"
        },
        {
          "role": "urgent",
          "channels": ["sms"],
          "when": "the second and final touch, a time-limited comeback discount that needs to be seen before it lapses"
        }
      ],
      "fallback": "none",
      "label": "RECOMMENDED_DEFAULT"
    },
    "orchestration": {
      "strategy": "offer-decide-remind",
      "touches": [
        {
          "id": "t1",
          "stage": "invitation",
          "action": "a.touch1",
          "gatedBy": "w.cooldown30",
          "prerequisites": [
            "c.eligible",
            "c.returned1",
            "c.sendable"
          ],
          "purpose": "A plain invitation to come back: what actually changed since they left where something did, the route back, and nothing invented.",
          "channelRoles": [
            "persistent"
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
          "stage": "comeback-discount",
          "action": "a.touch2",
          "after": "t1",
          "gatedBy": "w.window1",
          "prerequisites": [
            "c.returned2",
            "c.sendable2"
          ],
          "purpose": "One time-limited comeback discount, with a strong call to action and the same route back.",
          "channelRoles": [
            "urgent"
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
          "label": "CANONICAL_RULE"
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
            "a cancellation still inside its save window - that window and its cooldown own it, not this journey",
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
        "next": "w.cooldown30"
      },
      {
        "id": "w.cooldown30",
        "kind": "wait",
        "until": [
          "relationship_repaid",
          "purchase_completed"
        ],
        "onEvent": "x.won",
        "timeout": {
          "after": {
            "key": "winback.cooldown30",
            "rule": "The lapsed relationship is left alone for a fixed period before the first invitation, so outreach never lands on someone who only just left.",
            "class": "observation-window",
            "default": {
              "value": "30 days",
              "confidence": "high",
              "basis": "corpus-rule",
              "applicableWhen": "GLB-24; the cascade's own pace before the first touch"
            },
            "required": false
          },
          "reason": "someone who just lapsed is not yet a win-back candidate; the wait comes before anything is sent",
          "relativeTo": "trigger"
        },
        "onTimeout": "c.returned1",
        "recheck": "the relationship re-read: still lapsed, nothing opened on it, permission still recorded",
        "windowExtendsOnEngagement": false
      },
      {
        "id": "c.returned1",
        "kind": "condition",
        "asks": "Did they become a customer again?",
        "branches": [
          {
            "label": "Yes",
            "when": "an authoritative record shows the relationship repaid or a purchase completed since the lapse",
            "observes": "relationship_repaid, purchase_completed",
            "to": "x.won"
          },
          {
            "label": "No",
            "when": "no such record exists",
            "observes": "relationship record",
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
        "does": "Say by email what actually changed since they left: new features, product improvements, new perks - and the route back. Nothing invented, no terms held that are not held, no discount policy does not enable",
        "execution": "communication",
        "idempotencyKey": "person_id + relationship_id + lapse date + touch id",
        "writes": [
          {
            "field": "winback_log",
            "mode": "append"
          }
        ],
        "next": "w.window1"
      },
      {
        "id": "w.window1",
        "kind": "wait",
        "until": [
          "relationship_repaid",
          "purchase_completed"
        ],
        "onEvent": "x.won",
        "timeout": {
          "after": {
            "key": "winback.window1",
            "rule": "The invitation is given a short fixed window before the cascade re-reads the relationship and moves to the comeback discount.",
            "class": "response-window",
            "default": {
              "value": {
                "min": "3 days",
                "max": "5 days"
              },
              "confidence": "high",
              "basis": "corpus-rule",
              "applicableWhen": "GLB-24; the cascade's own pace between the two touches"
            },
            "required": false
          },
          "reason": "the cascade advances to the discount on a fixed clock, not an open-ended one",
          "relativeTo": "previous-touch"
        },
        "onTimeout": "c.returned2",
        "recheck": "the relationship re-read: still lapsed, nothing opened on it, permission still recorded",
        "windowExtendsOnEngagement": false
      },
      {
        "id": "c.returned2",
        "kind": "condition",
        "asks": "Did they come back?",
        "branches": [
          {
            "label": "Yes",
            "when": "an authoritative record shows the relationship repaid or a purchase completed since the invitation",
            "observes": "relationship_repaid, purchase_completed",
            "to": "x.won"
          },
          {
            "label": "No",
            "when": "no such record exists",
            "observes": "relationship record",
            "to": "c.sendable2"
          }
        ]
      },
      {
        "id": "c.sendable2",
        "kind": "condition",
        "asks": "May the comeback discount go out?",
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
        "does": "Say by SMS about a limited-time comeback discount, with a strong call to action and the same route back, and record the incentive's issuance per person",
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
        "next": "w.offer"
      },
      {
        "id": "w.offer",
        "kind": "wait",
        "until": [
          "relationship_repaid",
          "purchase_completed"
        ],
        "onEvent": "x.won",
        "timeout": {
          "after": {
            "key": "winback.offer_window",
            "rule": "The discount is given the offer's own duration to be acted on, after which the instance closes; there is no third touch.",
            "class": "response-window",
            "default": {
              "value": "7 days",
              "confidence": "low",
              "basis": "example-only"
            },
            "required": false
          },
          "reason": "the discount lapses with the offer; the instance only observes until then",
          "relativeTo": "previous-touch"
        },
        "onTimeout": "c.returned3",
        "recheck": "the relationship re-read from the system of record",
        "windowExtendsOnEngagement": false
      },
      {
        "id": "c.returned3",
        "kind": "condition",
        "asks": "Did they purchase again?",
        "branches": [
          {
            "label": "Yes",
            "when": "an authoritative record shows the relationship repaid or a purchase completed within the offer window",
            "observes": "relationship_repaid, purchase_completed",
            "to": "x.won"
          },
          {
            "label": "No",
            "when": "no such record exists inside the window",
            "observes": "relationship record",
            "to": "x.lapsed"
          }
        ]
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
        "state": "this journey ended; invited and discounted, not returned, left alone for the cooldown",
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
          "phone_number",
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
        "win back",
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
        "journey": "CON-300",
        "because": "CON-300 is not trying to keep anybody: it asks whether marketing contact should continue and takes the answer, offer-free. This journey is the argument for coming back, and it runs on a lapsed paid relationship rather than on unanswered contact - a person can be perfectly engaged with our messages and still lapsed, or still buying and entirely silent on everything we send."
      }
    ],
    "guardrails": [
      "A recorded reason or history that policy lists as excluding outreach is final for the instance.",
      "The invitation says what actually changed or is plain; no change is invented.",
      "The relationship is re-read for a return at three points - before the invitation, before the discount, and after the discount's own offer window - and the cascade ends the moment any of them finds one.",
      "Exactly two touches, email then SMS, then a long cooldown; a person who left, was asked once and offered once has answered.",
      "The comeback discount appears once, on the second and final touch, and is recorded per person so it is never re-issued on the next lapse."
    ],
    "reusableRule": "A lapsed paid relationship is invited back at most twice - an email invitation, then an SMS comeback discount - only where reason, history and permission allow, re-read for a return before each touch and after the last, with a long cooldown afterwards."
  },
  {
    "id": "RET-290",
    "slug": "first-purchase-welcome",
    "category": "retention",
    "goal": "progression-milestone",
    "channels": ["email", "sms"],
    "name": "First purchase completed → repurchase window waited out → returned, converted or ended",
    "shortName": "First-to-Second Purchase",
    "purpose": "Turn a first purchase into a second one: wait out the product's own natural repurchase period, then offer the next purchase honestly, twice, and stop the moment it happens.",
    "objective": "Wait for the product's natural repurchase period, then make at most two honest offers toward a second purchase - an email offer, then an SMS reminder before it lapses - re-reading the purchase record before each and stopping the instant a second purchase is recorded.",
    "entity": {
      "scope": "the new customer relationship - one person, opened by their first purchase",
      "note": "One instance per person, ever, because a relationship is a first one only once. A second purchase inside the window closes the instance as returned rather than opening another.",
      "instanceKey": [
        "person_id"
      ],
      "concurrency": "one-active-per-key",
      "supersession": {
        "id": "s.supersession",
        "label": "CANONICAL_RULE",
        "text": "A second purchase by the same person supersedes this instance: the relationship is no longer a new one and nothing further is sent under this journey."
      }
    },
    "eligibility": [
      "an authoritative purchase record for this person that their own purchase history confirms is their first",
      "the order's own transactional confirmation is owned and sent by the journey whose job that is, not by this one",
      "no earlier instance of this journey exists for this person",
      "purpose-level permission for lifecycle communication is recorded, and hard gates (GLB-31) allow it"
    ],
    "suppressions": [
      {
        "id": "s.transactional",
        "label": "CANONICAL_RULE",
        "text": "This journey never carries the order's confirmation and never competes with it. What the business took on is recorded at the opening of the order, before this journey speaks; this answers only whether a second purchase should be offered, and it waits out the product's own natural repurchase period before asking."
      },
      {
        "id": "s.returned",
        "label": "CANONICAL_RULE",
        "text": "A second purchase by this person closes the instance as returned. An offer sent to somebody who has already come back is the failure this journey exists to prevent, and each offer is reached only through a condition that just re-read the purchase record."
      },
      {
        "id": "s.offer",
        "label": "CANONICAL_RULE",
        "text": "Each offer names only a recommendation and a return offer the business has actually issued and recorded, for the period the business will honour. Where there is none, nothing is promised and nothing is invented to fill the gap."
      },
      {
        "id": "s.permission",
        "label": "CANONICAL_RULE",
        "text": "No touch without purpose-level permission for lifecycle communication and a deliverable destination; absent either, the touch is recorded as a no-action rather than forced onto another route."
      },
      {
        "id": "s.contest",
        "label": "CANONICAL_RULE",
        "text": "A post-purchase follow-up on the same person's order outranks this journey in the post-purchase-welcome group; while it holds the person, this journey's touch is deferred and re-evaluated against current state rather than queued blindly (GLB-06)."
      },
      {
        "id": "s.cancelled",
        "label": "CANONICAL_RULE",
        "text": "A first purchase cancelled or fully reversed before the first offer goes out is not a first purchase; the instance ends without a touch."
      },
      {
        "id": "s.sunset",
        "label": "CANONICAL_RULE",
        "text":
          "A standing sender-side marketing suppression stops this journey. CON-300 ends marketing contact for somebody who answered none of it, and records that decision as marketing_suppression against our own sending rather than as a withdrawal on the person's consent record - so a purpose-level permission check still reads yes and cannot see it. The suppression is a hard gate under GLB-31, held and released by CON-38, and it covers promotional and lifecycle communication alike: no instance of this journey opens against a suppressed person, and an open instance stands down rather than queueing behind it. Only permission given afresh releases it - not the passing of time, and not a purchase.",
      },
    ],
    "contact": {
      "defaultPriority": "lifecycle",
      "pressureClass": "lifecycle",
      "localCap": {
        "value": {
          "key": "first_purchase_welcome.touches",
          "rule": "Both touches run against a budget fixed when the instance opened; the budget is the cascade's own length - an email offer and one SMS reminder - and no touch is repeated because nothing could tell whether it arrived.",
          "default": {
            "value": 2,
            "confidence": "high",
            "basis": "corpus-rule",
            "applicableWhen": "GLB-24; the cascade's own length - one email offer and one SMS reminder"
          },
          "required": false
        },
        "appliesTo": "all"
      },
      "cooldown": {
        "key": "first_purchase_welcome.cooldown",
        "rule": "The instance opens once per person and never reopens, so the cooldown governs only how long the SMS reminder may sit behind the email offer before the ordinary lifecycle journeys take the relationship over.",
        "class": "cooldown",
        "required": true
      },
      "competition": {
        "exclusionGroup": "post-purchase-welcome",
        "scope": "person",
        "precedence": "below the post-purchase follow-up on the same person's order - what somebody is already holding comes before what they might buy next; above every promotional journey addressed to a person whose relationship is this new",
        "onLoss": "suppressed"
      }
    },
    "channelStrategy": {
      "roles": [
        {
          "role": "persistent",
          "channels": ["email"],
          "when": "the first offer, sent once the product's own natural repurchase period has passed"
        },
        {
          "role": "urgent",
          "channels": ["sms"],
          "when": "the second and final touch, a reminder before the limited-time offer lapses"
        }
      ],
      "fallback": "none",
      "label": "RECOMMENDED_DEFAULT"
    },
    "orchestration": {
      "strategy": "offer-decide-remind",
      "touches": [
        {
          "id": "t1",
          "stage": "next-purchase-offer",
          "action": "a.touch1",
          "gatedBy": "w.natural",
          "prerequisites": [
            "c.returned1",
            "c.sendable"
          ],
          "purpose": "A related product or category recommendation based on the first purchase, with a limited-time offer toward the next one. No offer unless the business has issued one.",
          "channelRoles": [
            "persistent"
          ],
          "destination": {
            "target": "next-purchase-offer",
            "boundTo": "person_id",
            "mustNotClaim": [
              "an offer that has not been issued",
              "stock is reserved",
              "the price is held"
            ]
          },
          "mandatory": false,
          "label": "CANONICAL_RULE"
        },
        {
          "id": "t2",
          "stage": "offer-reminder",
          "action": "a.touch2",
          "after": "t1",
          "gatedBy": "w.window1",
          "prerequisites": [
            "c.returned2",
            "c.sendable2"
          ],
          "purpose": "A last call before the same offer lapses - sent only to somebody who has not already come back.",
          "channelRoles": [
            "urgent"
          ],
          "destination": {
            "target": "next-purchase-offer",
            "boundTo": "person_id",
            "mustNotClaim": [
              "an offer that has not been issued",
              "stock is reserved",
              "the price is held"
            ]
          },
          "mandatory": false,
          "label": "CANONICAL_RULE"
        }
      ],
      "noAction": [
        "s.transactional",
        "s.returned",
        "s.offer",
        "s.permission",
        "s.contest",
        "s.cancelled"
      ]
    },
    "entry": "t.first",
    "nodes": [
      {
        "id": "t.first",
        "kind": "trigger",
        "event": "first_purchase_completed",
        "evidence": {
          "requires": [
            "an authoritative purchase record for this person",
            "the person's own purchase history, confirming that no earlier purchase exists for them"
          ],
          "insufficientAlone": [
            "a purchase by somebody who has bought before - that is an ordinary repeat purchase",
            "an order placed but not yet accepted by the system of record",
            "an account created with no purchase behind it",
            "a purchase attributed to an identity that has not resolved to a person, which may well have a history under another one"
          ],
          "source": "authoritative"
        },
        "next": "w.natural"
      },
      {
        "id": "w.natural",
        "kind": "wait",
        "until": [
          "purchase_completed",
          "permission_withdrawn"
        ],
        "onEvent": "c.returned1",
        "timeout": {
          "after": {
            "key": "first_purchase_welcome.natural_repurchase_period",
            "rule": "The first offer waits out the product's own natural repurchase period, so it never lands on somebody who was already going to buy again on their own timeline.",
            "class": "observation-window",
            "required": true
          },
          "reason": "an offer spent before the product's own repurchase point buys nothing that would not have happened anyway",
          "relativeTo": "trigger"
        },
        "onTimeout": "c.returned1",
        "recheck": "the purchase record, the order's own state and the person's permission re-read from the systems that own them",
        "windowExtendsOnEngagement": false
      },
      {
        "id": "c.returned1",
        "kind": "condition",
        "asks": "Did the second purchase happen?",
        "branches": [
          {
            "label": "Yes",
            "when": "an authoritative second purchase by this person is recorded",
            "observes": "purchase_completed",
            "to": "x.returning"
          },
          {
            "label": "Relationship ended",
            "when": "the person withdrew permission, or the first purchase was cancelled or fully reversed",
            "observes": "permission_withdrawn",
            "to": "x.closed"
          },
          {
            "label": "No",
            "when": "the first purchase stands, no second purchase is recorded, and permission for lifecycle communication still holds",
            "observes": "purchase record, permission record",
            "to": "c.sendable"
          }
        ]
      },
      {
        "id": "c.sendable",
        "kind": "condition",
        "asks": "May the offer go out?",
        "branches": [
          {
            "label": "Sendable",
            "when": "the send path passes: permission for lifecycle communication, a deliverable destination, the lifecycle pressure cap, no higher-precedence journey currently holding this person, and the business has an issued recommendation or offer to name",
            "observes": "send path stages 1-8, offer record",
            "to": "a.touch1"
          },
          {
            "label": "Suppressed",
            "when": "a gate stops it, or there is nothing issued to name; the reason is recorded",
            "observes": "send path stages 1-8, offer record",
            "to": "a.record-no-action"
          }
        ]
      },
      {
        "id": "a.touch1",
        "kind": "action",
        "does": "Say by email: a related product or category recommendation based on the first purchase, and a limited-time offer toward the next one. Nothing invented, and nothing sent to somebody who has already bought again.",
        "execution": "communication",
        "idempotencyKey": "person_id + touch id",
        "writes": [
          {
            "field": "welcome_log",
            "mode": "append"
          }
        ],
        "next": "w.window1"
      },
      {
        "id": "w.window1",
        "kind": "wait",
        "until": [
          "purchase_completed",
          "permission_withdrawn"
        ],
        "onEvent": "c.returned2",
        "timeout": {
          "after": {
            "key": "first_purchase_welcome.window1",
            "rule": "The offer is given a short fixed window before the cascade re-reads the purchase record and moves to the SMS reminder.",
            "class": "response-window",
            "default": {
              "value": {
                "min": "3 days",
                "max": "5 days"
              },
              "confidence": "high",
              "basis": "corpus-rule",
              "applicableWhen": "GLB-24; the cascade's own pace between the two touches"
            },
            "required": false
          },
          "reason": "the cascade advances to the reminder on a fixed clock, not an open-ended one",
          "relativeTo": "previous-touch"
        },
        "onTimeout": "c.returned2",
        "recheck": "the person's purchase record and their permission re-read from the systems that own them",
        "windowExtendsOnEngagement": false
      },
      {
        "id": "c.returned2",
        "kind": "condition",
        "asks": "Did the second purchase happen?",
        "branches": [
          {
            "label": "Yes",
            "when": "an authoritative second purchase by this person is recorded",
            "observes": "purchase_completed",
            "to": "x.returning"
          },
          {
            "label": "No",
            "when": "no purchase since the first one is recorded for this person",
            "observes": "purchase record",
            "to": "c.sendable2"
          }
        ]
      },
      {
        "id": "c.sendable2",
        "kind": "condition",
        "asks": "May the reminder go out?",
        "branches": [
          {
            "label": "Sendable",
            "when": "the send path passes, the touch budget is not spent, and the offer named in the first touch is still honoured",
            "observes": "send path stages 1-8, offer record",
            "to": "a.touch2"
          },
          {
            "label": "Suppressed",
            "when": "a gate stops it, or the offer has lapsed; the reason is recorded",
            "observes": "send path stages 1-8, offer record",
            "to": "a.record-no-action"
          }
        ]
      },
      {
        "id": "a.touch2",
        "kind": "action",
        "does": "Say by SMS a last call before the same offer lapses, with the same route to use it. Nothing invented, and nothing sent to somebody who has already bought again.",
        "execution": "communication",
        "idempotencyKey": "person_id + touch id",
        "writes": [
          {
            "field": "welcome_log",
            "mode": "append"
          }
        ],
        "next": "w.offer"
      },
      {
        "id": "w.offer",
        "kind": "wait",
        "until": [
          "purchase_completed",
          "permission_withdrawn"
        ],
        "onEvent": "c.returned3",
        "timeout": {
          "after": {
            "key": "first_purchase_welcome.offer_window",
            "rule": "The reminder is given the offer's own duration to be acted on, after which the instance ends; there is no third touch.",
            "class": "response-window",
            "required": true
          },
          "reason": "the offer lapses with its own window; the instance only observes until then",
          "relativeTo": "previous-touch"
        },
        "onTimeout": "c.returned3",
        "recheck": "the person's purchase record re-read from the system of record",
        "windowExtendsOnEngagement": false
      },
      {
        "id": "c.returned3",
        "kind": "condition",
        "asks": "Did they purchase?",
        "branches": [
          {
            "label": "Yes",
            "when": "an authoritative second purchase by this person is recorded within the offer window",
            "observes": "purchase_completed",
            "to": "x.returning"
          },
          {
            "label": "No",
            "when": "no such record exists inside the window",
            "observes": "purchase record",
            "to": "x.prompted"
          }
        ]
      },
      {
        "id": "a.record-no-action",
        "kind": "action",
        "does": "Record why nothing was sent and at which stage, so no-action is a measured outcome rather than a silent absence",
        "writes": [
          {
            "field": "suppressed_sends",
            "mode": "append"
          }
        ],
        "idempotencyKey": "person_id + touch id",
        "next": "x.no-action"
      },
      {
        "id": "x.returning",
        "kind": "exit",
        "state": "returned; a second purchase is recorded and the relationship is no longer a new one",
        "class": "success",
        "terminal": false,
        "reEntry": "a first purchase happens once per person; the ordinary retention journeys own the relationship from here"
      },
      {
        "id": "x.prompted",
        "kind": "exit",
        "state": "this journey ended; offered and reminded, not returned",
        "class": "timeout",
        "terminal": false,
        "reEntry": "this instance does not reopen; whether the offer is later taken is the ordinary lifecycle's to observe"
      },
      {
        "id": "x.closed",
        "kind": "exit",
        "state": "closed without an offer; the relationship ended or the first purchase did not stand",
        "class": "invalid-state",
        "terminal": false,
        "reEntry": "a reinstated first purchase and a restored permission are re-evaluated against the reinstated record; otherwise nothing reopens"
      },
      {
        "id": "x.no-action",
        "kind": "exit",
        "state": "no touch sent; the reason is recorded",
        "class": "no-action",
        "terminal": false,
        "reEntry": "the instance does not reopen; a person whose offer was suppressed is not offered later as if it were new"
      }
    ],
    "implementation": {
      "attributes": {
        "required": [
          "person_id",
          "first_purchase_id",
          "first_purchase_at",
          "customer_account_destination"
        ],
        "optional": [
          "bounceback_offer_id",
          "offer_honoured_until",
          "email_address",
          "phone_number"
        ]
      }
    },
    "measurement": {
      "journeyOutcome": {
        "type": "exit",
        "refs": [
          "x.returning",
          "x.prompted",
          "x.closed",
          "x.no-action"
        ]
      },
      "businessOutcome": {
        "event": "purchase_completed",
        "unit": "person",
        "observationScope": {
          "type": "self"
        },
        "window": {
          "type": "until-exit"
        },
        "attribution": "touched-before-event",
        "comparison": "persistent-holdout",
        "holdout": {
          "key": "first_purchase_welcome.holdout_share",
          "rule": "A persistent per-person holdout is required: a share of first-time buyers come back without being asked, and without a holdout this journey claims every one of them.",
          "required": true
        }
      },
      "secondary": [
        "permission_withdrawn"
      ],
      "guardrails": [
        "unsubscribe",
        "complaint",
        "message_after_success",
        "bounceback_after_second_purchase",
        "offer_named_without_record"
      ],
      "operational": [
        "entry_volume",
        "welcome_rate",
        "bounceback_rate",
        "no_action_rate_by_reason",
        "second_purchase_rate"
      ]
    },
    "discovery": {
      "aliases": [
        "first purchase bounceback",
        "second purchase prompt",
        "post-purchase repurchase offer",
        "first-to-second purchase nudge"
      ],
      "useCases": [
        "a recent first purchase that has not yet become a second one, once the product's own natural repurchase period has passed"
      ]
    },
    "distinctFrom": [
      {
        "journey": "FUL-291",
        "because": "FUL-291 speaks about the order the person is now holding - how to use it, look after it, or what follows from it. This journey speaks about the relationship that order opened, and it never explains the product."
      },
      {
        "journey": "RET-31",
        "because": "RET-31 prompts a repeat of something the person's own history says is due. Here there is no history yet - one purchase is not a cadence - so the prompt is an offer rather than a prediction."
      },
      {
        "journey": "SUB-296",
        "because": "SUB-296 opens on an enrolment into a loyalty membership and its whole subject is that membership - what it grants and how it is used. This opens on a first purchase and owns the customer relationship that purchase created. Where somebody enrols at the moment they first buy, both are true at once and neither carries the other's message: this journey owns the first-purchase moment and never explains the membership, and SUB-296 owns the membership and never makes the bounceback."
      },
      {
        "journey": "RET-292",
        "because": "RET-292 recognises the anniversary of this journey's own first-purchase date, a year later. This journey is the one-time moment that dates it; RET-292 is the one-time recognition of it, and the two never run at once."
      }
    ],
    "guardrails": [
      "The order's own confirmation is never carried by this journey and never competes with it; the first offer waits out the product's own natural repurchase period.",
      "An offer is never sent to somebody who has already bought again - the purchase record is re-read immediately before each touch and after the last.",
      "An offer is named only where one has actually been issued and recorded, for the period the business will honour.",
      "Exactly two touches, an email offer then an SMS reminder before it lapses; there is no third touch to time."
    ],
    "reusableRule": "A second purchase is offered honestly, twice - an email offer once the product's own repurchase period has passed, then an SMS reminder before it lapses - re-reading the purchase record before each touch and after the last, and stopping the instant a second purchase is recorded."
  },
  {
    "id": "RET-292",
    "slug": "first-purchase-anniversary",
    "category": "retention",
    "goal": "progression-milestone",
    "channels": ["in-app", "push"],
    "name": "First purchase completed → anniversary interval waited → eligibility checked → recognised or not sent",
    "shortName": "First Purchase Anniversary",
    "purpose": "Recognise the anniversary of the date somebody first bought - the relationship's own age, counted from its first transaction and from nothing else - and say so once.",
    "objective": "Mark how long the relationship has lasted, measured from the first purchase, to somebody who is still in it - without attaching anything the record does not carry.",
    "entity": {
      "scope": "the customer relationship dated from its first purchase - one person, one anniversary interval",
      "note": "The entity is the FIRST PURCHASE date and nothing else: not a sign-up date, not a birthday, not the most recent order. One instance per person per anniversary interval, and an interval that passes unsent is closed rather than made up later.",
      "instanceKey": [
        "person_id",
        "anniversary_cycle"
      ],
      "concurrency": "one-active-per-key",
      "supersession": {
        "id": "s.supersession",
        "label": "CANONICAL_RULE",
        "text": "The next anniversary interval supersedes the last: an interval that passed unsent is closed, never sent late and never folded into the following one."
      }
    },
    "eligibility": [
      "a recorded first-purchase date for this person, from which the anniversary interval is computed",
      "the relationship is still open - the account is not closed and the first purchase still stands",
      "no instance is already open for this person and this anniversary interval",
      "purpose-level permission for lifecycle communication is recorded, and hard gates (GLB-31) allow it"
    ],
    "suppressions": [
      {
        "id": "s.interval",
        "label": "CANONICAL_RULE",
        "text": "An anniversary is recognised on its own interval or not at all. An interval that passed without a message is closed; it is never sent late and never merged into the next one."
      },
      {
        "id": "s.date",
        "label": "CANONICAL_RULE",
        "text": "The date is the first purchase and nothing else. A sign-up date, a birthday or a most-recent-order date is a different entity with a different journey, and substituting one for another makes the recognition untrue."
      },
      {
        "id": "s.ended",
        "label": "CANONICAL_RULE",
        "text": "A relationship that has ended is not congratulated on its length. A closed account, a fully reversed first purchase or a withdrawn permission ends the instance without a message."
      },
      {
        "id": "s.permission",
        "label": "CANONICAL_RULE",
        "text": "No message without purpose-level permission for lifecycle communication and a deliverable destination; absent either, it is recorded as a no-action rather than forced onto another route."
      },
      {
        "id": "s.claim",
        "label": "CANONICAL_RULE",
        "text": "The message states only what the record supports - how long the relationship has lasted. It never attaches a reward, a tier or a benefit that has not been issued."
      },
      {
        "id": "s.contest",
        "label": "CANONICAL_RULE",
        "text": "A personal milestone recognition addressed to the same person outranks this one in the date-recognition group; while it holds the person's window this interval is suppressed and closes unsent rather than being queued to arrive after the date it was about."
      },
      {
        "id": "s.sunset",
        "label": "CANONICAL_RULE",
        "text":
          "A standing sender-side marketing suppression stops this journey. CON-300 ends marketing contact for somebody who answered none of it, and records that decision as marketing_suppression against our own sending rather than as a withdrawal on the person's consent record - so a purpose-level permission check still reads yes and cannot see it. The suppression is a hard gate under GLB-31, held and released by CON-38, and it covers promotional and lifecycle communication alike: no instance of this journey opens against a suppressed person, and an open instance stands down rather than queueing behind it. Only permission given afresh releases it - not the passing of time, and not a purchase.",
      },
    ],
    "contact": {
      "defaultPriority": "lifecycle",
      "pressureClass": "lifecycle",
      "localCap": {
        "value": {
          "key": "first_purchase_anniversary.touches",
          "rule": "One recognition per anniversary interval, fixed when the instance opened; there is no follow-up to time and nothing is repeated because nothing could tell whether it arrived.",
          "default": {
            "value": 1,
            "confidence": "high",
            "basis": "corpus-rule",
            "applicableWhen": "GLB-24; the journey's own shape - a single recognition per interval"
          },
          "required": false
        },
        "appliesTo": "all"
      },
      "cooldown": {
        "key": "first_purchase_anniversary.cooldown",
        "rule": "Between one recognition and the next lies a whole anniversary interval; nothing shorter reopens this journey for the same person.",
        "class": "cooldown",
        "required": true
      },
      "competition": {
        "exclusionGroup": "date-recognition",
        "scope": "person",
        "precedence": "below the personal milestone recognition for the same person - the company's own count of how long the relationship has lasted yields to a date the person would call their own; where both fall in the same window this one is suppressed and its interval closes unsent, exactly as an interval that passes unsent always does here",
        "onLoss": "suppressed"
      }
    },
    "channelStrategy": {
      "roles": [
        {
          "role": "in-session",
          "channels": ["in-app"],
          "when": "has_active_app_session is true and the anniversary can be recognised naturally inside the customer account"
        },
        {
          "role": "low-friction",
          "channels": ["push"],
          "when": "there is no active session, push_token is present, and the recognition is complete as a short message with a route back to the account"
        }
      ],
      "fallback": "none",
      "label": "RECOMMENDED_DEFAULT"
    },
    "orchestration": {
      "strategy": "single-notice",
      "touches": [
        {
          "id": "t1",
          "stage": "recognition",
          "action": "a.recognise",
          "prerequisites": [
            "c.eligible"
          ],
          "purpose": "How long this relationship has lasted, counted from the first purchase, said once and, if the person engages with the first notice, said again where they can dwell on it - with nothing attached that the record does not carry.",
          "channelRoles": [
            "low-friction"
          ],
          "destination": {
            "target": "customer-account",
            "boundTo": "person_id",
            "mustNotClaim": [
              "a reward that has not been issued",
              "a tier the account does not hold",
              "a benefit tied to the anniversary that does not exist"
            ]
          },
          "mandatory": false,
          "label": "CANONICAL_RULE"
        },
        {
          "id": "t2",
          "stage": "recognition",
          "action": "a.show-in-app",
          "prerequisites": [
            "c.opened"
          ],
          "purpose": "The same recognition, shown again where the person is already looking, for the person who engaged with the first notice.",
          "channelRoles": [
            "in-session"
          ],
          "destination": {
            "target": "customer-account",
            "boundTo": "person_id",
            "mustNotClaim": [
              "a reward that has not been issued",
              "a tier the account does not hold",
              "a benefit tied to the anniversary that does not exist"
            ]
          },
          "mandatory": false,
          "label": "CANONICAL_RULE"
        }
      ],
      "noAction": [
        "s.interval",
        "s.date",
        "s.ended",
        "s.permission",
        "s.claim",
        "s.contest"
      ]
    },
    "entry": "t.purchase",
    "nodes": [
      {
        "id": "t.purchase",
        "kind": "trigger",
        "event": "first_purchase_completed",
        "evidence": {
          "requires": [
            "an authoritative first-purchase record for this person"
          ],
          "insufficientAlone": [
            "a sign-up or account-creation date, which dates a different relationship entirely",
            "a birthday or any other date about the person rather than about the relationship",
            "a most-recent-order date, which measures recency and not length"
          ],
          "source": "authoritative"
        },
        "next": "w.interval"
      },
      {
        "id": "w.interval",
        "kind": "wait",
        "until": [
          "account_closure_succeeded"
        ],
        "onEvent": "c.eligible",
        "timeout": {
          "after": {
            "key": "first_purchase_anniversary.interval",
            "rule": "The recognition waits for the relationship's own configured anniversary interval to elapse since the first purchase - not sooner, and on no other clock.",
            "class": "attribute-bound",
            "default": {
              "value": "1 year",
              "confidence": "low",
              "basis": "example-only",
              "applicableWhen": "a standard annual recognition cadence",
              "avoidWhen": "a business that defines its own anniversary cycle on a different cadence"
            },
            "required": false
          },
          "reason": "the recognition is timed to the relationship's own configured anniversary interval, counted from the first purchase and from nothing else",
          "relativeTo": "attribute",
          "attribute": "first_purchase_at"
        },
        "onTimeout": "c.eligible",
        "recheck": "the relationship record, first-purchase record and recognition log re-read before acting",
        "windowExtendsOnEngagement": false
      },
      {
        "id": "c.eligible",
        "kind": "condition",
        "asks": "Is this anniversary still ours to recognise?",
        "branches": [
          {
            "label": "Recognise",
            "when": "the relationship is open, the first purchase still stands, this interval has not already been recognised, and the send path passes",
            "observes": "relationship record, first-purchase record, send path stages 1-8",
            "to": "a.recognise"
          },
          {
            "label": "Relationship ended",
            "when": "the account is closed, the first purchase has been fully reversed, or the person withdrew permission for this kind of communication",
            "observes": "relationship record, permission record",
            "to": "x.closed"
          },
          {
            "label": "Not sendable",
            "when": "a send-path gate stops it, or this interval has already been recognised; the reason is recorded",
            "observes": "send path stages 1-8, recognition record",
            "to": "a.record-no-action"
          }
        ]
      },
      {
        "id": "a.recognise",
        "kind": "action",
        "does": "Send a push reminder stating how long the relationship has lasted, counted from the first purchase, and say nothing the record does not support. No reward, tier or benefit unless one has actually been issued.",
        "execution": "communication",
        "idempotencyKey": "person_id + anniversary_cycle",
        "writes": [
          {
            "field": "recognition_log",
            "mode": "append"
          }
        ],
        "next": "c.opened"
      },
      {
        "id": "c.opened",
        "kind": "condition",
        "asks": "Did the person open the app in response to the push?",
        "branches": [
          {
            "label": "Opened",
            "when": "an app session followed the push while the recognition is still current",
            "observes": "app session activity following the push",
            "to": "a.show-in-app"
          },
          {
            "label": "Not opened",
            "when": "no app session followed the push before the recognition window closed",
            "observes": "app session activity following the push",
            "to": "x.recognised"
          }
        ]
      },
      {
        "id": "a.show-in-app",
        "kind": "action",
        "does": "Show the same recognition inside the account - how long the relationship has lasted, counted from the first purchase - now that the person is in a session to see it.",
        "execution": "communication",
        "idempotencyKey": "person_id + anniversary_cycle",
        "next": "x.recognised"
      },
      {
        "id": "a.record-no-action",
        "kind": "action",
        "does": "Record why no recognition was sent and for which interval, so no-action is a measured outcome rather than a silent absence",
        "writes": [
          {
            "field": "suppressed_sends",
            "mode": "append"
          }
        ],
        "idempotencyKey": "person_id + anniversary_cycle",
        "next": "x.no-action"
      },
      {
        "id": "x.recognised",
        "kind": "exit",
        "state": "recognised; the anniversary was marked once for this interval",
        "class": "success",
        "terminal": true,
        "reEntry": "this journey recognises the first-purchase anniversary once, from the first-purchase event that opened it; a merged or restated relationship with a new first-purchase date starts it again from its trigger"
      },
      {
        "id": "x.no-action",
        "kind": "exit",
        "state": "no recognition sent; the reason is recorded",
        "class": "no-action",
        "terminal": true,
        "reEntry": "this journey does not retry this interval; a merged or restated relationship with a new first-purchase date starts it again from its trigger"
      },
      {
        "id": "x.closed",
        "kind": "exit",
        "state": "closed without a message; the relationship this anniversary would have counted has ended",
        "class": "invalid-state",
        "terminal": true,
        "reEntry": "a reopened relationship is dated from its own first purchase and starts this journey again from its trigger"
      }
    ],
    "implementation": {
      "attributes": {
        "required": [
          "person_id",
          "first_purchase_at",
          "anniversary_interval",
          "anniversary_cycle",
          "customer_account_destination"
        ],
        "optional": [
          "relationship_state",
          "push_token",
          "has_active_app_session"
        ]
      }
    },
    "measurement": {
      "journeyOutcome": {
        "type": "exit",
        "refs": [
          "x.closed"
        ]
      },
      "guardrails": [
        "unsubscribe",
        "complaint",
        "recognition_after_relationship_ended",
        "interval_recognised_twice",
        "benefit_named_without_record"
      ],
      "operational": [
        "entry_volume",
        "recognition_rate",
        "no_action_rate_by_reason"
      ]
    },
    "discovery": {
      "aliases": [
        "first purchase anniversary",
        "customer anniversary",
        "relationship anniversary",
        "years as a customer",
        "purchase anniversary recognition"
      ],
      "useCases": [
        "a customer reaching a whole interval measured from their first purchase",
        "a relationship whose length is worth saying out loud without attaching an offer to it"
      ]
    },
    "distinctFrom": [
      {
        "journey": "RET-290",
        "because": "RET-290 works at the start of the relationship and is trying to produce a second purchase. This works on the relationship's age and is trying to produce nothing; the recognition is the whole point."
      },
      {
        "journey": "SUB-163",
        "because": "SUB-163 counts down to an obligation somebody has to act on before a date. An anniversary carries no obligation and no deadline - nothing happens if it is ignored."
      },
      {
        "journey": "RET-295",
        "because": "RET-295 recognises a date that belongs to the person - a birthday they gave us, or a milestone their own record reached. This counts the relationship's length from the first purchase, which is the company's side of it. The two share the date-recognition exclusion group, and this one is the side that yields, so a person never receives both in the same window."
      }
    ],
    "guardrails": [
      "The date is the first purchase; no other date is substituted for it.",
      "An interval that passed without a message is closed, never sent late.",
      "A relationship that has ended is not congratulated on its length.",
      "Nothing is attached that has not been issued - no reward, no tier, no benefit."
    ],
    "reusableRule": "A recognition dated from one specific record states only what that record supports, happens on its own interval or not at all, and is never made up afterwards."
  },
  {
    "id": "RET-294",
    "slug": "complementary-next-offer",
    "category": "retention",
    "goal": "progression-milestone",
    "channels": ["in-app", "push", "email"],
    "name": "Purchase with a declared complement → matured → offered → taken, declined or closed",
    "shortName": "Cross-Sell / Next Best Offer",
    "purpose": "Offer the thing that genuinely completes something the person already owns, once the first thing has had time to be used, and stop the moment they have it.",
    "objective": "Get the complementary next step taken by somebody who already owns the thing it completes - never an accessory proposed to a person still waiting for the product it attaches to.",
    "entity": {
      "scope": "one complementary opportunity - the person, the subject they own, and the declared product relationship that makes the next thing complementary rather than merely similar",
      "note": "One instance per person and owned subject. The offer is bound to a relationship the company has declared between two products, not to resemblance: where that relationship no longer holds, or the person already has the complement, the instance closes rather than substituting a different offer.",
      "instanceKey": [
        "person_id",
        "owned_subject_id"
      ],
      "concurrency": "one-active-per-key",
      "supersession": {
        "id": "s.supersession",
        "label": "CANONICAL_RULE",
        "text": "Acquiring the complement by any route closes the instance; a further purchase of the same owned subject does not open a second one while this instance is open."
      }
    },
    "eligibility": [
      "an authoritative record that this person owns the subject the offer would complete",
      "a relationship between that subject and the complementary product that the company has declared, rather than one inferred from resemblance",
      "the complement is available and permitted for this person, and they do not already have it",
      "no instance is already open for this person and this owned subject",
      "purpose-level permission for commercial communication is recorded, and hard gates (GLB-31) allow it"
    ],
    "suppressions": [
      {
        "id": "s.owned",
        "label": "CANONICAL_RULE",
        "text": "Nothing already owned is offered as a next step. Ownership is re-read immediately before every touch and never trusted from the record that opened the instance."
      },
      {
        "id": "s.relationship",
        "label": "CANONICAL_RULE",
        "text": "The offer rests on a declared relationship between two products. Where no such relationship is recorded, what is left is a resemblance, and a resemblance belongs to the recommendation journey rather than to this one."
      },
      {
        "id": "s.premature",
        "label": "CANONICAL_RULE",
        "text": "Nothing is offered before the thing it completes has plausibly been received and used. An accessory proposed to somebody still waiting for the product it attaches to is the failure this journey exists to prevent."
      },
      {
        "id": "s.segment",
        "label": "RECOMMENDED_DEFAULT",
        "text": "A segment split is made only where the offer itself genuinely differs by segment. Splitting one offer into branches that send the same thing adds a decision the business does not actually have."
      },
      {
        "id": "s.permission",
        "label": "CANONICAL_RULE",
        "text": "No touch without purpose-level permission for commercial communication and a deliverable destination; absent either, the touch is recorded as a no-action rather than forced onto another route."
      },
      {
        "id": "s.contest",
        "label": "CANONICAL_RULE",
        "text": "Predicted-need replenishment (RET-31) outranks this journey for the same person - a purchase the person's own history says is due is a stronger claim on the moment, and this journey is suppressed for them rather than queued behind it."
      },
      {
        "id": "s.sunset",
        "label": "CANONICAL_RULE",
        "text":
          "A standing sender-side marketing suppression stops this journey. CON-300 ends marketing contact for somebody who answered none of it, and records that decision as marketing_suppression against our own sending rather than as a withdrawal on the person's consent record - so a purpose-level permission check still reads yes and cannot see it. The suppression is a hard gate under GLB-31, held and released by CON-38, and it covers promotional and lifecycle communication alike: no instance of this journey opens against a suppressed person, and an open instance stands down rather than queueing behind it. Only permission given afresh releases it - not the passing of time, and not a purchase.",
      },
    ],
    "contact": {
      "defaultPriority": "promotional",
      "pressureClass": "promotional",
      "localCap": {
        "value": {
          "key": "next_offer.touches",
          "rule": "Both touches run against a budget fixed when the instance opened; the budget is the plan's own length - an offer and at most one reminder of it - and no touch is repeated because nothing could tell whether it arrived.",
          "default": {
            "value": 2,
            "confidence": "high",
            "basis": "corpus-rule",
            "applicableWhen": "GLB-24; the plan's own length - an offer and one optional reminder"
          },
          "required": false
        },
        "appliesTo": "all"
      },
      "cooldown": {
        "key": "next_offer.cooldown",
        "rule": "After an offer closes unaccepted, the same complement is not offered again for the same owned subject until the cooldown has passed; acquiring the complement carries no cooldown.",
        "class": "cooldown",
        "required": true
      },
      "competition": "none"
    },
    "channelStrategy": {
      "roles": [
        {
          "role": "in-session",
          "channels": ["in-app"],
          "when": "has_active_app_session is true and the complementary item can be shown beside the owned subject that makes it relevant"
        },
        {
          "role": "low-friction",
          "channels": ["push"],
          "when": "the first offer was not acted on, push_token is present, and complement_destination can open the exact item; use it for the bounded reminder"
        },
        {
          "role": "persistent",
          "channels": ["email"],
          "when": "otherwise, especially when the relationship between the owned subject and the complement needs enough space to explain"
        }
      ],
      "fallback": "none",
      "label": "RECOMMENDED_DEFAULT"
    },
    "orchestration": {
      "strategy": "offer-decide-remind",
      "touches": [
        {
          "id": "t1",
          "stage": "offer",
          "action": "a.offer",
          "gatedBy": "w.maturation",
          "prerequisites": [
            "c.opportunity",
            "c.sendable"
          ],
          "purpose": "The thing that completes what they already own, named against what they own rather than on its own. Nothing about stock, price or a deadline the platform does not enforce.",
          "channelRoles": [
            "in-session",
            "persistent"
          ],
          "destination": {
            "target": "complementary-item",
            "boundTo": "owned_subject_id",
            "mustNotClaim": [
              "stock is reserved",
              "the price is held",
              "a discount applies",
              "that the complement is required to use what they already own"
            ]
          },
          "mandatory": false,
          "label": "CANONICAL_RULE"
        },
        {
          "id": "t2",
          "stage": "reminder",
          "action": "a.remind",
          "after": "t1",
          "gatedBy": "w.response",
          "prerequisites": [
            "c.outcome",
            "c.sendable2"
          ],
          "purpose": "One reminder of the same offer, to somebody who still does not have the complement and has not said they do not want it. Nothing new is added to make it land.",
          "channelRoles": [
            "low-friction",
            "persistent"
          ],
          "destination": {
            "target": "complementary-item",
            "boundTo": "owned_subject_id",
            "mustNotClaim": [
              "stock is reserved",
              "the price is held",
              "a discount applies"
            ]
          },
          "mandatory": false,
          "label": "OPTIONAL_STRATEGY"
        }
      ],
      "noAction": [
        "s.owned",
        "s.relationship",
        "s.premature",
        "s.segment",
        "s.permission",
        "s.contest"
      ]
    },
    "entry": "t.owned",
    "nodes": [
      {
        "id": "t.owned",
        "kind": "trigger",
        "event": "purchase_with_known_complement",
        "evidence": {
          "requires": [
            "an authoritative record that this person owns the subject the offer would complete",
            "a relationship between that subject and a complementary product that the company has declared",
            "the complement's current availability and eligibility for this person"
          ],
          "insufficientAlone": [
            "a purchase with no declared complementary relationship behind it - a resemblance is not a complement",
            "a complement the person already owns",
            "a pairing inferred from what other people bought together, with nothing declared behind it",
            "an order placed but not yet accepted by the system of record"
          ],
          "source": "authoritative"
        },
        "next": "w.maturation"
      },
      {
        "id": "w.maturation",
        "kind": "wait",
        "until": [
          "purchase_completed",
          "permission_withdrawn"
        ],
        "onEvent": "c.opportunity",
        "timeout": {
          "after": {
            "key": "next_offer.maturation",
            "rule": "The offer waits until the thing it completes has plausibly been received and used, so that a complement arrives as a next step rather than as an upsell attached to an order still in transit.",
            "class": "observation-window",
            "required": true
          },
          "reason": "an accessory offered to somebody who has not yet used the product it attaches to interrupts the purchase they already made",
          "relativeTo": "trigger"
        },
        "onTimeout": "c.opportunity",
        "recheck": "ownership of the subject and of the complement, the declared product relationship and the person's permission re-read from the systems that own them",
        "windowExtendsOnEngagement": false
      },
      {
        "id": "c.opportunity",
        "kind": "condition",
        "asks": "Is there still a complementary next step worth offering?",
        "branches": [
          {
            "label": "Opportunity stands",
            "when": "the person still owns the subject, does not have the complement, the declared relationship still holds, and the complement is available and permitted for them",
            "observes": "ownership record, product relationship record, item availability",
            "to": "c.sendable"
          },
          {
            "label": "Already complete",
            "when": "the person has since acquired the complement by any route",
            "observes": "purchase_completed",
            "to": "x.complete"
          },
          {
            "label": "No longer applicable",
            "when": "the declared relationship no longer holds, the complement is unavailable or not permitted for this person, or permission was withdrawn",
            "observes": "permission_withdrawn",
            "to": "x.closed"
          }
        ]
      },
      {
        "id": "c.sendable",
        "kind": "condition",
        "asks": "May the offer go out?",
        "branches": [
          {
            "label": "Sendable",
            "when": "the send path passes: permission for commercial communication, a deliverable destination, the promotional pressure cap, no higher-precedence journey currently holding this person, and no cooldown in force",
            "observes": "send path stages 1-8",
            "to": "a.offer"
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
        "id": "a.offer",
        "kind": "action",
        "does": "Make the offer against what the person already owns: the complement, what it completes, and the route to add it. Claim no reserved stock, no held price, no discount, and never that the complement is required.",
        "execution": "communication",
        "idempotencyKey": "person_id + owned_subject_id + touch id",
        "writes": [
          {
            "field": "offer_log",
            "mode": "append"
          }
        ],
        "next": "w.response"
      },
      {
        "id": "w.response",
        "kind": "wait",
        "until": [
          "purchase_completed",
          "interest_dismissed"
        ],
        "onEvent": "c.outcome",
        "timeout": {
          "after": {
            "key": "next_offer.response_window",
            "rule": "The offer is given a window in which it can be acted on before a single reminder is considered; after that reminder there is nothing further to time.",
            "class": "response-window",
            "required": true
          },
          "reason": "a reminder sent before the offer has had time to be read is a repeat, and one sent long afterwards is a new offer pretending to be a reminder",
          "relativeTo": "previous-touch"
        },
        "onTimeout": "c.outcome",
        "recheck": "ownership of the complement and any dismissal of the offer re-read from the systems that own them",
        "windowExtendsOnEngagement": false
      },
      {
        "id": "c.outcome",
        "kind": "condition",
        "asks": "Was the offer taken?",
        "branches": [
          {
            "label": "Taken",
            "when": "an authoritative purchase of the complement by this person is recorded",
            "observes": "purchase_completed",
            "to": "x.complete"
          },
          {
            "label": "Declined",
            "when": "the person signalled that the complement is not wanted",
            "observes": "interest_dismissed",
            "to": "x.declined"
          },
          {
            "label": "No answer yet",
            "when": "the complement is still not owned and nothing has been declined",
            "observes": "ownership record",
            "to": "c.sendable2"
          }
        ]
      },
      {
        "id": "c.sendable2",
        "kind": "condition",
        "asks": "May the single reminder go out?",
        "branches": [
          {
            "label": "Sendable",
            "when": "the send path passes and the touch budget is not spent",
            "observes": "send path stages 1-8, touch budget",
            "to": "a.remind"
          },
          {
            "label": "Suppressed",
            "when": "a gate stops it or the budget is spent; the reason is recorded",
            "observes": "send path stages 1-8, touch budget",
            "to": "a.record-no-action"
          }
        ]
      },
      {
        "id": "a.remind",
        "kind": "action",
        "does": "Remind once of the same offer against the same owned subject, adding nothing that was not in the first one.",
        "execution": "communication",
        "idempotencyKey": "person_id + owned_subject_id + touch id",
        "writes": [
          {
            "field": "offer_log",
            "mode": "append"
          }
        ],
        "next": "x.offered"
      },
      {
        "id": "a.record-no-action",
        "kind": "action",
        "does": "Record why nothing was sent and at which stage, so no-action is a measured outcome rather than a silent absence",
        "writes": [
          {
            "field": "suppressed_sends",
            "mode": "append"
          }
        ],
        "idempotencyKey": "person_id + owned_subject_id + touch id",
        "next": "x.no-action"
      },
      {
        "id": "x.complete",
        "kind": "exit",
        "state": "complete; the person has the complementary thing the offer was about",
        "class": "success",
        "terminal": false,
        "reEntry": "a different owned subject with its own declared complement opens its own instance"
      },
      {
        "id": "x.declined",
        "kind": "exit",
        "state": "declined; the person said the complement is not wanted",
        "class": "suppression",
        "terminal": false,
        "reEntry": "a different owned subject with its own declared complement opens its own instance; this complement is not offered again"
      },
      {
        "id": "x.offered",
        "kind": "exit",
        "state": "offered and reminded; the plan ran to its end without the complement being taken",
        "class": "timeout",
        "terminal": false,
        "reEntry": "the cooldown governs when the same complement may be offered again for the same subject"
      },
      {
        "id": "x.closed",
        "kind": "exit",
        "state": "closed; the relationship the offer rested on no longer holds",
        "class": "invalid-state",
        "terminal": false,
        "reEntry": "a restored product relationship and a restored permission make the subject eligible again at the next evaluation"
      },
      {
        "id": "x.no-action",
        "kind": "exit",
        "state": "no touch sent; the reason is recorded",
        "class": "no-action",
        "terminal": false,
        "reEntry": "a different owned subject with its own declared complement opens its own instance"
      }
    ],
    "implementation": {
      "attributes": {
        "required": [
          "person_id",
          "owned_subject_id",
          "complement_item_id",
          "product_relationship_id",
          "owned_since",
          "complement_destination"
        ],
        "optional": [
          "complement_availability",
          "permission_state",
          "push_token",
          "email_address",
          "has_active_app_session"
        ]
      }
    },
    "measurement": {
      "journeyOutcome": {
        "type": "exit",
        "refs": [
          "x.complete",
          "x.declined",
          "x.offered",
          "x.closed",
          "x.no-action"
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
          "key": "next_offer.holdout_share",
          "rule": "A persistent per-person holdout is required: people buy the obvious complement to what they own without being asked, and without a holdout this journey claims every one of those purchases.",
          "required": true
        }
      },
      "secondary": [
        "interest_dismissed"
      ],
      "guardrails": [
        "unsubscribe",
        "complaint",
        "message_after_success",
        "offer_for_owned_complement",
        "offer_before_maturation"
      ],
      "operational": [
        "entry_volume",
        "maturation_survival_rate",
        "offer_rate",
        "reminder_rate",
        "no_action_rate_by_reason"
      ]
    },
    "discovery": {
      "aliases": [
        "cross-sell",
        "next best offer",
        "complementary product offer",
        "accessory offer",
        "what goes with what you bought"
      ],
      "useCases": [
        "a product with a declared complementary item its owner does not have",
        "a completed purchase whose natural next step the company can name rather than guess"
      ]
    },
    "distinctFrom": [
      {
        "journey": "RET-31",
        "because": "RET-31 prompts the same purchase again because the first one is running out. This proposes a different thing, and ownership of the first is exactly what makes it relevant."
      },
      {
        "journey": "ACQ-288",
        "because": "ACQ-288 recovers a selection the person made and left behind. Here the purchase completed; nothing is being recovered, and the subject of the offer is something they never selected."
      },
      {
        "journey": "SUB-297",
        "because": "SUB-297 is about a membership the person is enrolled in and a benefit they already hold. This is about a product they already own and a second product that completes it. Neither may borrow the other's authority: a membership benefit is never presented as a complementary product, and a complementary product is never presented as something the membership grants."
      }
    ],
    "guardrails": [
      "The offer rests on a relationship the company has declared between two products, never on resemblance - resemblance belongs to the recommendation journey.",
      "Ownership of the complement is re-read immediately before every touch; nothing already owned is offered.",
      "Nothing is offered before the thing it completes has plausibly been received and used.",
      "A segment split is made only where the offer itself genuinely differs; a split that sends the same thing down two branches is a decision the business does not have.",
      "One offer and at most one reminder, and the reminder adds nothing the offer did not have."
    ],
    "reusableRule": "A complementary offer is bound to a relationship the company has actually declared between two things and to ownership of the first of them, re-read before every touch - which is what keeps it a next step rather than a second guess at what somebody likes."
  },
  {
    "id": "RET-295",
    "slug": "milestone-recognition",
    "category": "retention",
    "goal": "progression-milestone",
    "channels": ["email"],
    "name": "A date belonging to the person recorded → its cycle waited → eligibility checked → recognised or not sent",
    "shortName": "Birthday Journey",
    "purpose": "Recognise a date that belongs to the person themselves - a birthday they told us, or a milestone their own record has reached - and say so once, with nothing attached that has not been issued.",
    "objective": "Mark one date the person would recognise as theirs, to somebody the relationship is still open with, without turning the recognition into an offer and without inventing the date.",
    "entity": {
      "scope": "one recognisable date about the person - the person, the milestone that date marks, and the cycle this occurrence belongs to",
      "note": "The entity is a date the person would call theirs: a birthday they gave us, or a milestone their own record reached. A relationship anniversary is a different entity and belongs to the anniversary journey. One instance per person per milestone cycle, and a cycle that passes unsent is closed rather than made up later.",
      "instanceKey": [
        "person_id",
        "milestone_cycle"
      ],
      "concurrency": "one-active-per-key",
      "supersession": {
        "id": "s.supersession",
        "label": "CANONICAL_RULE",
        "text": "The next cycle of the same milestone supersedes the last: a cycle that passed unsent is closed, never sent late and never folded into the following one."
      }
    },
    "eligibility": [
      "a recorded date for this person that the person themselves supplied, or a milestone their own record has authoritatively reached",
      "the relationship is still open - the account is not closed and the person has not asked to be left alone",
      "no instance is already open for this person and this milestone cycle",
      "purpose-level permission for lifecycle communication is recorded, and hard gates (GLB-31) allow it"
    ],
    "suppressions": [
      {
        "id": "s.cycle",
        "label": "CANONICAL_RULE",
        "text": "A milestone is recognised on its own cycle or not at all. A cycle that passed without a message is closed; it is never sent late and never merged into the next one."
      },
      {
        "id": "s.date",
        "label": "CANONICAL_RULE",
        "text": "The date is one the person would recognise as theirs, taken from what they supplied or from what their own record reached. A guessed birthday, a date inferred from something else, and the relationship's own anniversary are each a different claim, and substituting one for another makes the recognition untrue."
      },
      {
        "id": "s.ended",
        "label": "CANONICAL_RULE",
        "text": "A relationship that has ended is not congratulated. A closed account, a withdrawn permission or a request to be left alone ends the instance without a message."
      },
      {
        "id": "s.claim",
        "label": "CANONICAL_RULE",
        "text": "The message states only what the record supports. It never attaches a reward, a discount, a tier or a benefit that has not been issued, and the recognition is not turned into an offer to make it earn its place."
      },
      {
        "id": "s.permission",
        "label": "CANONICAL_RULE",
        "text": "No message without purpose-level permission for lifecycle communication and a deliverable destination; absent either, it is recorded as a no-action rather than forced onto another route."
      },
      {
        "id": "s.contest",
        "label": "CANONICAL_RULE",
        "text": "Where a higher-precedence journey already holds this person's window, the recognition is suppressed and its cycle closes with it; nothing is queued behind another journey to arrive after the date it was about."
      },
      {
        "id": "s.sunset",
        "label": "CANONICAL_RULE",
        "text":
          "A standing sender-side marketing suppression stops this journey. CON-300 ends marketing contact for somebody who answered none of it, and records that decision as marketing_suppression against our own sending rather than as a withdrawal on the person's consent record - so a purpose-level permission check still reads yes and cannot see it. The suppression is a hard gate under GLB-31, held and released by CON-38, and it covers promotional and lifecycle communication alike: no instance of this journey opens against a suppressed person, and an open instance stands down rather than queueing behind it. Only permission given afresh releases it - not the passing of time, and not a purchase.",
      },
    ],
    "contact": {
      "defaultPriority": "lifecycle",
      "pressureClass": "lifecycle",
      "localCap": {
        "value": {
          "key": "milestone_recognition.touches",
          "rule": "One recognition per milestone cycle, fixed when the instance opened; there is no follow-up to time and nothing is repeated because nothing could tell whether it arrived.",
          "default": {
            "value": 1,
            "confidence": "high",
            "basis": "corpus-rule",
            "applicableWhen": "GLB-24; the journey's own shape - a single recognition per cycle"
          },
          "required": false
        },
        "appliesTo": "all"
      },
      "cooldown": {
        "key": "milestone_recognition.cooldown",
        "rule": "Between one recognition and the next lies a whole milestone cycle; nothing shorter reopens this journey for the same person, and two different milestones falling close together are one recognition, not two.",
        "class": "cooldown",
        "required": true
      },
      "competition": {
        "exclusionGroup": "date-recognition",
        "scope": "person",
        "precedence": "above the first-purchase anniversary for the same person - a date the person would call their own comes before the company's own count of how long the relationship has lasted; while this journey holds the person's window, that one is suppressed for it rather than queued behind it",
        "onLoss": "suppressed"
      }
    },
    "channelStrategy": {
      "roles": [
        {
          "role": "persistent",
          "channels": ["email"],
          "when": "the recognition should be kept rather than glanced at"
        }
      ],
      "fallback": "none",
      "label": "RECOMMENDED_DEFAULT"
    },
    "orchestration": {
      "strategy": "single-notice",
      "touches": [
        {
          "id": "t1",
          "stage": "recognition",
          "action": "a.recognise",
          "prerequisites": [
            "c.date"
          ],
          "purpose": "The date, said plainly and once, to somebody the relationship is still open with - and nothing attached to it that the record does not already carry.",
          "channelRoles": [
            "persistent"
          ],
          "destination": {
            "target": "customer-account",
            "boundTo": "person_id",
            "mustNotClaim": [
              "a reward that has not been issued",
              "a discount the business has not authorised",
              "a tier the account does not hold",
              "a benefit tied to the date that does not exist"
            ]
          },
          "mandatory": false,
          "label": "CANONICAL_RULE"
        }
      ],
      "noAction": [
        "s.cycle",
        "s.date",
        "s.ended",
        "s.claim",
        "s.permission",
        "s.contest"
      ]
    },
    "entry": "t.recorded",
    "nodes": [
      {
        "id": "t.recorded",
        "kind": "trigger",
        "event": "personal_milestone_date_recorded",
        "evidence": {
          "requires": [
            "a date this person supplied about themselves, or a milestone their own record has authoritatively reached, now on file"
          ],
          "insufficientAlone": [
            "a birthday guessed, modelled or bought rather than given by the person",
            "the relationship's own anniversary, which counts the company's side of it and has its own journey",
            "a milestone belonging to a segment rather than to this person's own record"
          ],
          "source": "authoritative"
        },
        "next": "w.cycle"
      },
      {
        "id": "w.cycle",
        "kind": "wait",
        "until": [
          "permission_withdrawn"
        ],
        "onEvent": "c.date",
        "timeout": {
          "after": {
            "key": "milestone_recognition.cycle",
            "rule": "The recognition waits for this milestone's own next cycle to arrive, counted from the date the person supplied or their own record reached - not sooner, and on no other clock.",
            "class": "attribute-bound",
            "default": {
              "value": "1 year",
              "confidence": "low",
              "basis": "example-only",
              "applicableWhen": "a birthday or other yearly-recurring personal milestone",
              "avoidWhen": "a milestone whose own cycle is not annual"
            },
            "required": false
          },
          "reason": "the recognition is timed to the milestone's own cycle, counted from the date on record and from nothing else",
          "relativeTo": "attribute",
          "attribute": "milestone_date"
        },
        "onTimeout": "c.date",
        "recheck": "the milestone record, relationship record and recognition log re-read before acting",
        "windowExtendsOnEngagement": false
      },
      {
        "id": "c.date",
        "kind": "condition",
        "asks": "Is this date still ours to recognise?",
        "branches": [
          {
            "label": "Recognise",
            "when": "the date is one the person supplied or one their own record reached, the relationship is open, this cycle has not already been recognised, and the send path passes - purpose-level permission for lifecycle communication, a deliverable destination, the lifecycle pressure cap, and no higher-precedence journey currently holding this person",
            "observes": "milestone record, relationship record, send path stages 1-8",
            "to": "a.recognise"
          },
          {
            "label": "Relationship ended",
            "when": "the account is closed, the person withdrew permission for this kind of communication, or they asked to be left alone",
            "observes": "permission_withdrawn",
            "to": "x.closed"
          },
          {
            "label": "Cycle already spent",
            "when": "this cycle has already been recognised, or the date has passed and the cycle closed unsent",
            "observes": "recognition record",
            "to": "a.record-no-action"
          },
          {
            "label": "Not sendable",
            "when": "a send-path gate stops it, or a higher-precedence date recognition holds this person's window; the reason is recorded",
            "observes": "send path stages 1-8",
            "to": "a.record-no-action"
          }
        ]
      },
      {
        "id": "a.recognise",
        "kind": "action",
        "does": "Send an email saying the date and what it marks, in the person's own terms, and say nothing the record does not support. No reward, discount, tier or benefit unless one has actually been issued.",
        "execution": "communication",
        "idempotencyKey": "person_id + milestone_cycle",
        "writes": [
          {
            "field": "recognition_log",
            "mode": "append"
          }
        ],
        "next": "x.recognised"
      },
      {
        "id": "a.record-no-action",
        "kind": "action",
        "does": "Record why no recognition was sent and for which cycle, so no-action is a measured outcome rather than a silent absence",
        "writes": [
          {
            "field": "suppressed_sends",
            "mode": "append"
          }
        ],
        "idempotencyKey": "person_id + milestone_cycle",
        "next": "x.no-action"
      },
      {
        "id": "x.recognised",
        "kind": "exit",
        "state": "recognised; the date was marked once for this cycle",
        "class": "success",
        "terminal": true,
        "reEntry": "this journey recognises this milestone's first cycle once, from the record event that opened it; a merged or restated record with a new date, or a genuinely different milestone belonging to this person, starts it again from its trigger"
      },
      {
        "id": "x.closed",
        "kind": "exit",
        "state": "closed without a message; the relationship this recognition would have been addressed to has ended",
        "class": "invalid-state",
        "terminal": true,
        "reEntry": "a reopened relationship with a restored permission and a new record of the date starts this journey again from its trigger; a person who asked to be left alone is not re-entered"
      },
      {
        "id": "x.no-action",
        "kind": "exit",
        "state": "no recognition sent; the reason is recorded",
        "class": "no-action",
        "terminal": true,
        "reEntry": "this journey does not retry this cycle; a merged or restated record with a new date starts it again from its trigger"
      }
    ],
    "implementation": {
      "attributes": {
        "required": [
          "person_id",
          "milestone_date",
          "milestone_kind",
          "milestone_cycle",
          "customer_account_destination"
        ],
        "optional": [
          "relationship_state",
          "email_address"
        ]
      }
    },
    "measurement": {
      "journeyOutcome": {
        "type": "exit",
        "refs": [
          "x.recognised",
          "x.closed",
          "x.no-action"
        ]
      },
      "secondary": [
        "permission_withdrawn"
      ],
      "guardrails": [
        "unsubscribe",
        "complaint",
        "recognition_after_relationship_ended",
        "cycle_recognised_twice",
        "benefit_named_without_record",
        "recognition_sent_off_its_own_date"
      ],
      "operational": [
        "entry_volume",
        "recognition_rate",
        "no_action_rate_by_reason",
        "suppressed_by_higher_precedence_rate"
      ]
    },
    "discovery": {
      "aliases": [
        "birthday message",
        "birthday recognition",
        "milestone recognition",
        "customer milestone",
        "personal milestone greeting"
      ],
      "useCases": [
        "a birthday the person themselves gave the business",
        "a milestone the person's own record has reached and that they would recognise as theirs"
      ]
    },
    "distinctFrom": [
      {
        "journey": "RET-292",
        "because": "RET-292 counts the relationship's own length from the first purchase - the company's side of it. This recognises a date that belongs to the person, which the company holds only because they supplied it or because their own record reached it. The two share an exclusion group so that a person never receives both in the same window."
      },
      {
        "journey": "SUB-299",
        "because": "SUB-299 announces that a membership's standing actually changed, which is a fact about an enrolled relationship. A milestone recognition changes nothing and is deliberately not an announcement of anything the person has newly gained."
      },
      {
        "journey": "RET-294",
        "because": "RET-294 proposes something to buy. This proposes nothing; attaching an offer to it is the specific failure its own guardrails forbid."
      }
    ],
    "guardrails": [
      "The date is one the person supplied or one their own record reached; a guessed or purchased date is not recognised at all.",
      "A cycle that passed without a message is closed, never sent late.",
      "A relationship that has ended is not congratulated.",
      "Nothing is attached that has not been issued - no reward, no discount, no tier, no benefit.",
      "Where the anniversary journey and this one both fall in the same window, only one of them speaks, and which one is decided by the declared precedence rather than by whichever fires first."
    ],
    "reusableRule": "A recognition addressed to the person is only honest if the date came from them or from their own record, and it is only a recognition if nothing is being sold under it."
  },
];
