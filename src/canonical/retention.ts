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
   category is ten journeys drawing the nine lines. RET-21 keeps engagement a
   changing state rather than a label. RET-22 refuses to read absence as
   evidence without a pattern to read it against. RET-23 insists a health score
   name what moved it before anyone is contacted. RET-24 makes intervention
   scale with evidence instead of with account value. RET-25 holds a risk
   signal as a question rather than a verdict. RET-26 stops compensation being
   the default apology. RET-27 is the whole category in one journey: a good
   sign is the start of recovery, not recovery. RET-28 and RET-29 are the two
   sides of the intent/completion line, and RET-30 makes an intervention
   finish only when its actual outcome is known.

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
    name: "Engagement state change → reclassify → appropriate lifecycle",
    purpose:
      "Hold engagement as a state that moves in both directions, and decide separately whether a movement is worth acting on.",
    entity: {
      scope: "person or account, per product or service relationship",
      note: "Engagement is per relationship. Someone quiet in one product and heavy in another has two states, not an average.",
    },
    distinctFrom: [
      {
        journey: "RET-22",
        because:
          "This reacts to a state that has already been recalculated. RET-22 reacts to one specific expected thing not happening, which may or may not move the state at all.",
      },
    ],
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
    name: "Expected usage miss → context check → observe or intervene",
    purpose:
      "Read a missed usage expectation as evidence only where an expectation genuinely existed, and only where something else corroborates it.",
    entity: {
      scope: "person or account plus the product or use-case the expectation belongs to",
      note: "Expectations differ by role inside the same account. An administrator who logs in monthly and an analyst who logs in daily are not measured against one pattern.",
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
    name: "Health deterioration → diagnose cause → recovery route",
    purpose:
      "Send a deteriorating relationship to the mechanism that is actually breaking it, and never to a generic retention campaign in its place.",
    entity: {
      scope: "person, account, subscription or customer relationship - whichever the health state is held against",
      note: "One failing subscription does not make the account unhealthy. The diagnosis and every route out of it stay at the level the deterioration was observed.",
    },
    distinctFrom: [
      {
        journey: "RET-24",
        because:
          "This asks what is wrong. RET-24 asks how much is wrong and how hard to push back, and it can run on a relationship whose cause is already known and being fixed.",
      },
    ],
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
      },
      {
        id: "x.need-changed",
        kind: "exit",
        state: "health fell because the need changed; nothing is broken",
        terminal: false,
        reEntry:
          "a new need, or a return of the old one, re-opens this - a relationship winding down because it is finished is not a failure to recover from",
      },
      {
        id: "a.diagnostic",
        kind: "action",
        does: "Open a bounded diagnostic: observe, and where appropriate ask. No incentive is attached, because an incentive offered before the cause is known teaches us nothing about the cause",
        next: "w.diagnostic",
      },
      {
        id: "w.diagnostic",
        kind: "wait",
        until: ["a cause becomes identifiable", "health recovers on its own"],
        onEvent: "c.diagnostic-result",
        timeout: {
          after: "a bounded diagnostic window",
          reason:
            "a diagnosis that has not arrived will not arrive by waiting longer, and the relationship should not sit in an open investigation indefinitely",
        },
        onTimeout: "x.unexplained",
        windowExtendsOnEngagement: false,
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
    name: "Churn risk escalation → evidence → intervention priority",
    purpose:
      "Decide how hard to push back on a relationship at risk, in proportion to how much independent evidence there actually is.",
    entity: {
      scope: "customer, account or subscription relationship",
      note: "Risk is held where the evidence was observed. A risky subscription inside a healthy account is a risky subscription.",
    },
    competition: {
      scope: "account",
      exclusionGroup: "retention-outreach",
      precedence:
        "below an open issue under human ownership, above generic retention intervention",
      onLoss: "suppressed",
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

  /* ------------------------------------------------------------ RET-25 */
  {
    id: "RET-25",
    slug: "risk-signal-validation",
    category: "retention",
    name: "Risk signal → validate → observe or escalate",
    purpose:
      "Hold a risk, fraud or anomaly signal as a state that has to be evaluated, and keep the evaluation separate from any enforcement.",
    entity: {
      scope: "the person, account, transaction or entity the signal was raised against",
      note: "The signal belongs to what it was observed on. A flagged transaction is a flagged transaction, and treating it as a flagged customer is how one anomaly becomes a permanent mark.",
    },
    distinctFrom: [
      {
        journey: "RET-24",
        because:
          "RET-24 weighs evidence about whether a relationship will end. This weighs whether a signal is true at all, and it deliberately stops short of the restriction a true one might justify.",
      },
    ],
    entry: "t.signal",
    nodes: [
      {
        id: "t.signal",
        kind: "trigger",
        event: "material_risk_signal_detected",
        evidence: {
          requires: [
            "a signal material enough to be worth evaluating, from detection, monitoring, a model, or a report",
          ],
          insufficientAlone: [
            "an anomaly with no severity or confidence attached",
            "a threshold crossing produced by a change in the detection rule rather than in behaviour",
          ],
          source: "inferred",
        },
        next: "a.record",
      },
      {
        id: "a.record",
        kind: "action",
        does: "Record the signal type, its source, the time, the entity it was raised against, and its confidence or severity where those exist. The record is appended, so a signal later cleared remains readable - what was suspected and when is itself a fact worth keeping",
        writes: [{ field: "risk_signal_log", mode: "append" }],
        next: "c.reliable",
      },
      {
        id: "c.reliable",
        kind: "condition",
        asks: "Is the signal reliable enough to act on?",
        branches: [
          {
            label: "Reliable",
            when: "the source and confidence are strong enough that acting is defensible",
            to: "c.severity",
          },
          {
            label: "Not yet",
            when: "the signal is real but too weak or too ambiguous to justify anything on its own",
            to: "a.gather",
          },
        ],
      },
      {
        id: "a.gather",
        kind: "action",
        does: "Seek corroborating or contradicting evidence. Nothing is restricted while this runs - the point of the state is that the question is open",
        next: "w.evidence",
      },
      {
        id: "w.evidence",
        kind: "wait",
        until: ["corroborating evidence arrives", "contradicting evidence arrives"],
        onEvent: "c.evidence",
        timeout: {
          after: "a bounded evidence window",
          reason:
            "a signal that never reaches reliability is not held open forever against the entity it was raised on",
        },
        onTimeout: "x.insufficient",
        windowExtendsOnEngagement: false,
      },
      {
        id: "c.evidence",
        kind: "condition",
        asks: "What did the evidence show?",
        branches: [
          { label: "Corroborated", when: "the signal now stands up", to: "c.severity" },
          { label: "Contradicted", when: "the evidence says it was benign", to: "a.clear" },
        ],
      },
      {
        id: "x.insufficient",
        kind: "exit",
        state: "signal never reached reliability; retained as history, no action taken",
        terminal: false,
        reEntry:
          "a stronger signal on the same entity re-opens this, and the earlier one is part of what it is judged against",
      },
      {
        id: "c.severity",
        kind: "condition",
        asks: "Does the severity warrant an immediate precautionary restriction?",
        branches: [
          {
            label: "Restriction warranted",
            when: "the potential harm of waiting exceeds the cost of restricting before the question is settled",
            to: "h.hold",
          },
          {
            label: "Monitoring is enough",
            when: "the signal is credible but nothing needs to be prevented while it is verified",
            to: "w.monitor",
          },
        ],
      },
      {
        id: "h.hold",
        kind: "handoff",
        to: "RSK-193",
        on: "severity warranting precautionary restriction",
        carries: [
          "the signal, its confidence and everything gathered",
          "the explicit fact that no determination has been made - the restriction is precautionary and this journey has not judged anything",
        ],
      },
      {
        id: "w.monitor",
        kind: "wait",
        until: [
          "the signal resolves as false or benign",
          "the signal escalates in severity",
          "verification completes",
        ],
        onEvent: "c.resolution",
        timeout: {
          after: "the monitoring horizon for this signal type",
          reason: "an open risk state with no resolution is its own kind of harm to the entity carrying it",
        },
        onTimeout: "x.monitored-out",
        windowExtendsOnEngagement: false,
      },
      {
        id: "c.resolution",
        kind: "condition",
        asks: "How did it resolve?",
        branches: [
          { label: "False or benign", when: "the signal did not hold up", to: "a.clear" },
          {
            label: "Escalated",
            when: "severity rose to where restriction is now warranted",
            to: "h.hold",
          },
          {
            label: "Genuine, no restriction warranted",
            when: "verified as real but not requiring anything to be prevented",
            to: "x.confirmed",
          },
        ],
      },
      {
        id: "a.clear",
        kind: "action",
        does: "Clear the risk state and suppress the interventions that existed only because of it. The signal itself stays in the log - clearing a suspicion is not the same as never having had one, and the difference matters if it recurs",
        writes: [
          { field: "risk_signal_log", mode: "append" },
          { field: "suppressed_sends", mode: "append" },
        ],
        next: "x.cleared",
      },
      {
        id: "x.cleared",
        kind: "exit",
        state: "signal cleared; risk state removed, history retained",
        terminal: false,
        reEntry: "a new signal is evaluated on its own merits, with the cleared one as context rather than as a mark",
      },
      {
        id: "x.confirmed",
        kind: "exit",
        state: "signal confirmed, no restriction warranted",
        terminal: false,
        reEntry: "escalation in severity re-opens this at the restriction question",
      },
      {
        id: "x.monitored-out",
        kind: "exit",
        state: "monitoring horizon passed without resolution",
        terminal: false,
        reEntry:
          "the state does not persist indefinitely on the entity; a recurrence is evaluated fresh, informed by the log",
      },
    ],
    guardrails: [
      "A risk signal is not guilt. The state it creates is a question, and the journey ends without answering it more often than not.",
      "An anomaly is not fraud. Unusual and wrong are different findings with different evidence.",
      "A model score is not an authoritative decision unless it has been explicitly governed as one, which is a decision made outside this journey.",
      "A signal later cleared stays auditable. Erasing it removes the ability to tell a first occurrence from a fifth.",
      "This journey does not restrict anything. Where restriction is warranted it hands to a journey whose job that is.",
    ],
    reusableRule:
      "Risk detection establishes a state requiring evaluation; it does not itself establish the final business judgment.",
  },

  /* ------------------------------------------------------------ RET-26 */
  {
    id: "RET-26",
    slug: "negative-experience-recovery",
    category: "retention",
    name: "Negative experience → recovery eligibility → appropriate response",
    purpose:
      "Match the response to what actually failed, whether it is fixed, and whether a remedy is genuinely owed.",
    entity: {
      scope: "person or account plus the experience or service entity that failed",
      note: "The recovery belongs to the failure. A second unrelated failure is a second instance, and one apology does not cover both.",
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
      },
      {
        id: "x.acknowledged",
        kind: "exit",
        state: "failure acknowledged, no remedy owed",
        terminal: false,
        reEntry: "a recurrence changes the assessment, and repetition is itself part of the impact",
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
    name: "Recovery signal → observation buffer → stable or relapse",
    purpose:
      "Keep the distance between a good sign and an actual recovery, so a relapse is still being watched for when it happens.",
    entity: {
      scope: "person or account plus the health or risk context that deteriorated",
      note: "Recovery is judged in the context that fell. Improvement somewhere else is not recovery here.",
    },
    distinctFrom: [
      {
        journey: "RET-21",
        because:
          "An improving engagement state is one input to this. RET-21 updates a state; this decides whether an improvement should be believed yet, which is a different question with a waiting period in it.",
      },
    ],
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
      },
      {
        id: "w.stability",
        kind: "wait",
        until: ["the deterioration signal returns"],
        onEvent: "a.relapse",
        timeout: {
          after: "the stability window appropriate to this use-case and this kind of deterioration",
          reason:
            "surviving the window without relapse is the evidence, so the timeout is the success path rather than the failure one - a payment relationship and a usage pattern need different windows to prove the same thing",
        },
        onTimeout: "a.stable",
        windowExtendsOnEngagement: false,
      },
      {
        id: "a.relapse",
        kind: "action",
        does: "Record the relapse, keeping the observed improvement in the history rather than erasing it - that something briefly worked is part of the diagnosis, not noise",
        writes: [{ field: "recovery_state_history", mode: "append" }],
        next: "h.rediagnose",
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
    name: "Cancellation intent → understand state → save or proceed",
    purpose:
      "Treat stated intent to leave as a decision point where a genuinely relevant alternative may be offered, and never as an obstacle course.",
    entity: {
      scope: "the subscription, membership or service relationship being cancelled",
      note: "Intent is against one relationship. Cancelling one subscription says nothing about the others an account holds.",
    },
    distinctFrom: [
      {
        journey: "RET-29",
        because:
          "This runs while the decision is still reversible and the person is still deciding. RET-29 runs after it is made, and the two must never share an event.",
      },
    ],
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
        next: "a.record-reason",
      },
      {
        id: "a.record-reason",
        kind: "action",
        does: "Record the reason with its source among PRICE, LOW_USAGE, MISSING_VALUE, TECHNICAL_PROBLEM, SERVICE_ISSUE, TEMPORARY_NEED, SWITCHING or OTHER. A reason inferred later never overwrites one that was declared",
        writes: [{ field: "cancellation_reason_history", mode: "append" }],
        next: "c.resolution",
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
        until: ["cancellation is confirmed", "the cancellation flow is abandoned"],
        onEvent: "c.decision",
        timeout: {
          after: "the period in which the intent remains meaningful",
          reason:
            "an intent neither confirmed nor withdrawn is not a standing invitation to keep raising it",
        },
        onTimeout: "x.lapsed",
        windowExtendsOnEngagement: false,
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
    name: "Cancellation completed → stop retention → resolve remaining relationship",
    purpose:
      "End retention ownership the moment cancellation is real, and manage what is still outstanding without pretending the relationship is either fully over or still winnable.",
    entity: {
      scope: "the subscription, membership or service relationship that ended",
      note: "Only this relationship ends. Other subscriptions, the account itself and the person's data are three separate things with three separate lifecycles.",
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
      },
      {
        id: "a.termination-state",
        kind: "action",
        does: "Establish when this actually ends: immediately, at the end of the current period, or on a scheduled future date. Everything downstream depends on which, and assuming immediate is how paid entitlement gets revoked early",
        writes: [{ field: "termination_state", mode: "set" }],
        next: "c.access",
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
      },
      {
        id: "x.wind-down",
        kind: "exit",
        state: "cancelled, in wind-down until the end date",
        terminal: false,
        reEntry:
          "reversal before the end date is possible and is its own event; the wind-down state exists precisely so that window is representable rather than collapsed into an ending",
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
    name: "Retention intervention → outcome → suppress, escalate or exit",
    purpose:
      "Close a retention attempt on what actually happened to the relationship, and stop the same offer being made twice.",
    entity: {
      scope: "the customer, account or subscription plus the retention episode the intervention belongs to",
      note: "The episode is the unit. A declined offer is declined for this episode, which is what makes remembering it possible.",
    },
    distinctFrom: [
      {
        journey: "RET-27",
        because:
          "This asks whether the intervention worked. RET-27 asks whether the improvement lasts, and takes over once this one has a positive answer.",
      },
    ],
    competition: {
      scope: "account",
      exclusionGroup: "retention-outreach",
      precedence:
        "lowest in the group - any live risk case or open issue on the same account outranks it",
      onLoss: "suppressed",
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
          "the offer is accepted",
          "the offer is explicitly declined",
          "the relationship recovers without an explicit answer",
          "the intervention fails to execute",
        ],
        onEvent: "c.outcome",
        timeout: {
          after: "a bounded decision window",
          reason:
            "an unanswered offer is a result, and the alternative to accepting that is asking again until someone leaves",
        },
        onTimeout: "c.followup",
        windowExtendsOnEngagement: false,
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
      },
      {
        id: "a.record-decline",
        kind: "action",
        does: "Record the decline against this cancellation episode, so the same offer is not made again inside it. Repeating a declined offer is the behaviour that makes a save attempt read as an obstacle",
        writes: [{ field: "retention_episode_history", mode: "append" }],
        next: "c.proceed",
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
      },
      {
        id: "x.cooldown",
        kind: "exit",
        state: "no response; episode closed, cooldown in force",
        terminal: false,
        reEntry:
          "a new episode may open on new evidence, and this intervention is not repeated within the cooldown",
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
];
