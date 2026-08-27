import type { CanonicalJourney, OrchestrationRule } from "./types";

/* CATEGORY 5 - FEEDBACK, ADVOCACY, REFERRAL & RELATIONSHIP SIGNALS

   What someone tells us, and what we are entitled to conclude from it.

   The category is built around a chain of things that look like each other
   and are not:

     asked        we requested feedback
     received     they gave it
     understood   we know what it means operationally
     acted on     something changed because of it
     closed       we told them, if we said we would

   And a second chain on the positive side:

     satisfied    they had a good experience
     evidence     that is one data point about the relationship
     eligible     the relationship justifies asking them for something
     willing      they agreed to give it
     permitted    we may use what they gave us publicly

   Almost every failure in this area is a jump across one of those arrows.
   Non-response read as dissatisfaction. A low score read as a confirmed
   fault. A high score read as a testimonial. A submitted quote read as
   permission to publish it. Each of those is one journey here, and the
   journey exists mainly to hold the two states apart.

   FBK-50 sits underneath the rest: signals accumulate as evidence, and a
   label like ADVOCATE or AT_RISK is only ever created by a policy that
   defined it, never by a single event that happened to arrive. */

export const FEEDBACK_RULES: readonly OrchestrationRule[] = [
  {
    id: "FBK-R1",
    scope: "feedback",
    rule: "Feedback requested, feedback received and feedback resolved are three separate states.",
    because:
      "Collapsing the first two makes non-response into a data point it is not; collapsing the last two closes loops with the person still waiting to hear back.",
  },
  {
    id: "FBK-R2",
    scope: "feedback",
    rule: "Negative feedback never automatically creates a confirmed service failure.",
    because:
      "A report of a bad experience and a record of something going wrong are different evidence, and treating the first as the second manufactures faults that operations then has to disprove.",
  },
  {
    id: "FBK-R3",
    scope: "feedback",
    rule: "Positive feedback never automatically creates advocacy permission.",
    because:
      "Telling us something went well is not agreeing to be quoted, referenced or published, and the gap between those is where most advocacy programmes lose people's trust.",
  },
  {
    id: "FBK-R4",
    scope: "feedback",
    rule: "An advocacy request requires credible positive relationship evidence and the absence of a conflicting unresolved issue.",
    because:
      "Asking for a review while a complaint is open reads as not knowing who you are talking to, and it costs more than the review was worth.",
  },
  {
    id: "FBK-R5",
    scope: "feedback",
    rule: "An operational obligation created by feedback carries an owner and an explicit closure condition.",
    because:
      "Feedback that generates work without ownership generates the appearance of responsiveness and nothing else.",
  },
  {
    id: "FBK-R6",
    scope: "feedback",
    rule: "An appeal preserves the original decision. Nothing is edited in place while a review is running.",
    because:
      "The original decision is the thing under review; overwriting it means the review has no subject and no record of what was actually appealed.",
  },
  {
    id: "FBK-R7",
    scope: "feedback",
    rule: "Declared data and inferred data stay distinguishable, and inference never writes into a declared field.",
    because:
      "The same rule as ACT-R6 and CON-R4, arriving from a third direction - the merge is cheap to perform, unrecoverable afterwards, and always happens by accident.",
  },
  {
    id: "FBK-R8",
    scope: "feedback",
    rule: "Missing critical data and progressive profiling are different mechanisms. Critical data blocks a named process; profiling improves a future decision and blocks nothing.",
    because:
      "Dressing profiling as a blocker teaches people that our requests are not real, which means the genuine blockers get ignored too.",
  },
  {
    id: "FBK-R9",
    scope: "feedback",
    rule: "Relationship signals stay scoped to the entity they were observed on and carry the time they occurred.",
    because:
      "Without scope, one bad experience colours an entire account; without time, evidence from two years ago is weighed the same as evidence from yesterday.",
  },
  {
    id: "FBK-R10",
    scope: "feedback",
    rule: "An existing issue or case suppresses duplicate recovery workflows for the same underlying problem.",
    because:
      "The same rule as RET-R9 and ACT-R9. It appears in three categories because three different systems can each independently decide to help.",
  },
  {
    id: "FBK-R11",
    scope: "feedback",
    rule: "Communication engagement is never substituted for relationship evidence.",
    because:
      "Opens and clicks are abundant and cheap, relationship evidence is scarce and expensive, and any model that accepts both will fill up with the first.",
  },
  {
    id: "FBK-R12",
    scope: "feedback",
    rule: "No advocacy contribution is publicly reused because someone submitted it. Publication and reuse permission is captured separately, as its own permission record.",
    because:
      "Submitting a testimonial is a gift to us; publishing it is a use of their name and words, and the second requires an authorisation the first did not give.",
  },
];

export const FEEDBACK_JOURNEYS: readonly CanonicalJourney[] = [
  /* ------------------------------------------------------------ FBK-41 */
  {
    id: "FBK-41",
    slug: "feedback-eligibility",
    category: "feedback",
    goal: "eligibility-qualification",
    name: "Feedback eligibility → ask, suppress or delay",
    purpose:
      "Decide whether asking is appropriate at all, and hold the gap between asking and hearing back as a real state.",
    entity: {
      scope: "person or account plus the specific experience being asked about",
      note: "Eligibility is per experience. Having answered about a delivery last week says nothing about whether to ask about a support case today.",
    },
    distinctFrom: [
      {
        journey: "FBK-43",
        because:
          "This ends when a request has been made or refused. FBK-43 begins only if something actually comes back, and most requests do not produce one.",
      },
    ],
    competition: {
      scope: "communication-purpose",
      exclusionGroup: "outbound-ask",
      precedence:
        "policy orders satisfaction and advocacy asks against each other; neither is assumed to outrank the other",
      onLoss: "suppressed",
    },
    entry: "t.moment",
    nodes: [
      {
        id: "t.moment",
        kind: "trigger",
        event: "potential_feedback_moment",
        evidence: {
          requires: [
            "an experience reaching a point worth asking about: a transaction completed, a service interaction finished, an onboarding milestone reached, a support case resolved, a meaningful usage milestone",
          ],
          insufficientAlone: [
            "a transaction started",
            "a ticket closed by an agent while the customer is still describing the problem",
            "an elapsed interval with no experience behind it",
          ],
          source: "authoritative",
        },
        next: "c.complete",
      },
      {
        id: "c.complete",
        kind: "condition",
        asks: "Is the experience actually complete from the person's side?",
        branches: [
          {
            label: "Complete",
            when: "the thing being asked about has finished for them, not only for us",
            to: "c.open-issue",
          },
          {
            label: "Not yet",
            when: "it is still in progress - the order has not arrived, the work is not finished",
            to: "w.completion",
          },
        ],
      },
      {
        id: "w.completion",
        kind: "wait",
        until: ["the experience completes"],
        onEvent: "c.open-issue",
        timeout: {
          after: "the horizon by which this kind of experience should have completed",
          reason:
            "an experience that never completed is not one to ask about; the right response to it is elsewhere, not a survey",
        },
        onTimeout: "x.never-completed",
        windowExtendsOnEngagement: false,
      },
      {
        id: "x.never-completed",
        kind: "exit",
        state: "experience never completed; nothing asked",
        terminal: false,
        reEntry: "a later completion opens a new instance",
      },
      {
        id: "c.open-issue",
        kind: "condition",
        asks: "Is there an unresolved issue in this context?",
        branches: [
          {
            label: "Unresolved",
            when: "the person still has an open problem here - judged on the evidence, not on whether a ticket is marked closed",
            to: "x.deferred",
          },
          {
            label: "Nothing open",
            when: "no outstanding problem in this context",
            to: "c.recent",
          },
        ],
      },
      {
        id: "x.deferred",
        kind: "exit",
        state: "deferred; resolution owns this before satisfaction does",
        terminal: false,
        reEntry:
          "once the issue is genuinely resolved this becomes eligible again - asking how we did while it is still broken measures our own latency and reads as indifference",
      },
      {
        id: "c.recent",
        kind: "condition",
        asks: "Has feedback already been collected for this context recently?",
        branches: [
          {
            label: "Already asked",
            when: "a recent request or response covers the same experience",
            to: "x.duplicate",
          },
          {
            label: "Not yet",
            when: "nothing recent covers it",
            to: "c.moment",
          },
        ],
      },
      {
        id: "x.duplicate",
        kind: "exit",
        state: "suppressed as a duplicate ask",
        terminal: false,
        reEntry: "a genuinely different experience is a different context and is asked about on its own terms",
      },
      {
        id: "c.moment",
        kind: "condition",
        asks: "Is this an appropriate moment, within the bound on how often this person is asked anything?",
        branches: [
          {
            label: "Appropriate",
            when: "the timing fits the experience and the overall ask budget has room",
            to: "a.request",
          },
          {
            label: "Not now",
            when: "the timing is wrong, or this person has been asked enough recently across every context",
            to: "x.not-now",
          },
        ],
      },
      {
        id: "x.not-now",
        kind: "exit",
        state: "eligible in principle, not asked",
        terminal: false,
        reEntry:
          "the next moment for this experience, if one exists - the request is not queued to fire the moment the budget clears",
      },
      {
        id: "a.request",
        kind: "action",
        does: "Request feedback about this specific experience, in terms the person would recognise as being about the thing that just happened",
        writes: [{ field: "feedback_request_log", mode: "append" }],
        next: "w.response",
      },
      {
        id: "w.response",
        kind: "wait",
        until: ["feedback is submitted"],
        onEvent: "x.received",
        timeout: {
          after: "a bounded response window",
          reason:
            "the request is not repeated when it expires; one ask about one experience is the whole budget",
        },
        onTimeout: "x.no-response",
        windowExtendsOnEngagement: false,
      },
      {
        id: "x.received",
        kind: "exit",
        state: "feedback received; FBK-43 owns what it means",
        terminal: false,
        reEntry: "this journey's job ended at the ask; what came back has its own lifecycle",
      },
      {
        id: "x.no-response",
        kind: "exit",
        state: "asked, no response",
        terminal: false,
        reEntry:
          "a future experience may be asked about; nothing here is recorded as a signal, because silence is not dissatisfaction and nothing downstream may read it as one",
      },
    ],
    guardrails: [
      "A transaction started is not an experience completed. The thing being asked about has to have finished for the person, not for us.",
      "A ticket marked closed does not prove the person's issue is resolved. Where the evidence disagrees with the ticket, the evidence decides.",
      "Feedback pressure is bounded across all contexts, not per survey. Someone who has answered three times this month has answered enough.",
      "No response is not a negative signal. It is no signal, and it is recorded as one.",
      "An interaction that ended in escalation, in an unresolved failure, or in a lost commercial decision is excluded from being asked rather than merely deferred. Asking somebody to rate an experience that failed and was handed away compounds it, and the answer says more about the failure than about anything the survey is measuring.",
    ],
    reusableRule:
      "Feedback should be requested only when the underlying experience is sufficiently complete and no higher-priority unresolved state makes the request inappropriate.",
  },

  /* ------------------------------------------------------------ FBK-42 */
  {
    id: "FBK-42",
    slug: "advocacy-eligibility",
    category: "feedback",
    goal: "eligibility-qualification",
    name: "Advocacy eligibility → ask, delay or suppress",
    purpose:
      "Ask someone to vouch for us only where the relationship has actually earned it, and keep public reuse a separate permission.",
    entity: {
      scope: "person or account plus the relationship context the advocacy would be about",
      note: "Advocacy is about a relationship, not a transaction. What is being asked for is their reputation attached to ours.",
    },
    distinctFrom: [
      {
        journey: "FBK-45",
        because:
          "FBK-45 reacts to one positive signal arriving. This weighs the accumulated relationship and decides whether it can carry a request - most positive signals do not reach it.",
      },
    ],
    competition: {
      scope: "communication-purpose",
      exclusionGroup: "outbound-ask",
      precedence:
        "policy orders satisfaction and advocacy asks against each other; neither is assumed to outrank the other",
      onLoss: "suppressed",
    },
    entry: "t.opportunity",
    nodes: [
      {
        id: "t.opportunity",
        kind: "trigger",
        event: "potential_advocacy_opportunity",
        evidence: {
          requires: [
            "a moment where an advocacy request would be contextually sensible, against a relationship with positive evidence behind it",
          ],
          insufficientAlone: [
            "a single login",
            "a completed purchase",
            "one high survey score",
            "a positive reply to a support agent",
          ],
          source: "behavioral",
        },
        next: "c.negative",
      },
      {
        id: "c.negative",
        kind: "condition",
        asks: "Is there an open negative issue anywhere in this relationship?",
        branches: [
          {
            label: "Something open",
            when: "an unresolved complaint, issue or dispute exists",
            to: "x.suppressed",
          },
          {
            label: "Nothing open",
            when: "no outstanding negative state",
            to: "a.evaluate",
          },
        ],
      },
      {
        id: "x.suppressed",
        kind: "exit",
        state: "suppressed while something is unresolved",
        terminal: false,
        reEntry:
          "resolution makes this eligible again - and a recovery that then held is itself strong evidence, so the wait is not lost",
      },
      {
        id: "a.evaluate",
        kind: "action",
        does: "Weigh the accumulated positive evidence: outcomes actually achieved, value realised repeatedly, positive feedback, meaningful tenure, a recovery that afterwards held, contributions offered without being asked. The set is what matters, not the most recent item in it",
        next: "c.sufficient",
      },
      {
        id: "c.sufficient",
        kind: "condition",
        asks: "Is the evidence sufficient to justify asking?",
        branches: [
          {
            label: "Sufficient",
            when: "the relationship carries enough independent positive evidence to bear a request",
            to: "c.type",
          },
          {
            label: "Not yet",
            when: "the evidence is real but thin - a good experience is not yet a relationship",
            to: "x.delay",
          },
        ],
      },
      {
        id: "x.delay",
        kind: "exit",
        state: "not yet eligible; evidence may accumulate",
        terminal: false,
        reEntry: "further positive evidence re-opens this without anything having to be undone",
      },
      {
        id: "c.type",
        kind: "condition",
        asks: "What size of request does this evidence support?",
        branches: [
          {
            label: "Low commitment",
            when: "a rating or a review - a few minutes, their words, their choice of where",
            to: "a.ask-light",
          },
          {
            label: "High commitment",
            when: "a testimonial, a case study, a reference call - their name and reputation attached to ours, and usually reusable",
            to: "a.ask-heavy",
          },
        ],
      },
      {
        id: "a.ask-light",
        kind: "action",
        does: "Make the small ask, once, with no follow-up sequence behind it",
        next: "w.response",
      },
      {
        id: "a.ask-heavy",
        kind: "action",
        does: "Make the substantial ask, stating plainly what would be used, where, and that agreeing to contribute is separate from agreeing to publication - because it is, and discovering that later is how a supporter becomes a complaint",
        next: "w.response",
      },
      {
        id: "w.response",
        kind: "wait",
        until: ["the advocacy action is taken", "the request is declined"],
        onEvent: "c.outcome",
        timeout: {
          after: "a bounded response window",
          reason: "an unanswered favour is not asked again; the relationship is worth more than the review",
        },
        onTimeout: "x.no-response",
        windowExtendsOnEngagement: false,
      },
      {
        id: "c.outcome",
        kind: "condition",
        asks: "What came back?",
        branches: [
          {
            label: "Contributed, for public reuse",
            when: "they provided something we intend to publish, quote or reference",
            to: "h.permission",
          },
          {
            label: "Contributed, no public reuse",
            when: "they provided something that stays internal",
            to: "x.contributed",
          },
          {
            label: "Declined",
            when: "they said no",
            to: "x.declined",
          },
        ],
      },
      {
        id: "h.permission",
        kind: "handoff",
        to: "CON-31",
        on: "an intention to publicly reuse something someone contributed",
        carries: [
          "what would be used, where, and for how long - which is the scope the permission has to cover",
          "the contribution itself, held unpublished until that permission exists",
        ],
      },
      {
        id: "x.contributed",
        kind: "exit",
        state: "contributed for internal use",
        terminal: false,
        reEntry:
          "any later intention to publish it is a new permission question, not an extension of this one",
      },
      {
        id: "x.declined",
        kind: "exit",
        state: "declined; cooldown in force",
        terminal: false,
        reEntry:
          "materially stronger evidence after the cooldown may justify a different request; the same one is not repeated",
      },
      {
        id: "x.no-response",
        kind: "exit",
        state: "no response; nothing inferred",
        terminal: false,
        reEntry:
          "silence on a favour is not a decline and not a signal about the relationship - it is simply not an answer",
      },
    ],
    guardrails: [
      "A single login is not advocacy eligibility, and neither is a completed purchase.",
      "A high score does not create a permanent advocate state. It is one piece of evidence with a date on it.",
      "An advocacy reward is granted only after the referral clears whatever integrity check governs it. A reward paid before that check funds exactly the behaviour the check exists to catch.",
      "The ask is placed at a moment the person is succeeding, never inside a failure or error state. Asking somebody to recommend us while something is visibly broken for them produces the wrong answer and remembers it.",
      "Contributing is not permission to publish. The second is captured as its own permission record with its own scope.",
      "An open negative issue suppresses this entirely, whatever the positive evidence says.",
    ],
    reusableRule:
      "Advocacy requests should follow demonstrated relationship value rather than arbitrary lifecycle timing.",
  },

  /* ------------------------------------------------------------ FBK-43 */
  {
    id: "FBK-43",
    slug: "feedback-routing-and-loop-closure",
    category: "feedback",
    goal: "escalation-exception",
    name: "Feedback received → classify → route → close the loop",
    purpose:
      "Get feedback to the process that can act on it, and keep the record open until anything promised in return has actually happened.",
    entity: {
      scope: "the feedback record, linked to the person and the experience it is about",
      note: "The feedback record and any issue it produces are separate entities with separate lifecycles. One can close while the other is still open, and conflating them loses the loop.",
    },
    entry: "t.received",
    nodes: [
      {
        id: "t.received",
        kind: "trigger",
        event: "feedback_received",
        evidence: {
          requires: ["feedback submitted through any channel, attributable to a person and an experience"],
          source: "declared",
        },
        next: "a.persist",
      },
      {
        id: "a.persist",
        kind: "action",
        does: "Persist the record with its id, source, related entity, timestamp and any sentiment or category the person themselves selected - together with what they actually wrote, kept verbatim. Everything after this is our interpretation and is stored beside their words, never over them",
        writes: [{ field: "feedback_log", mode: "append" }],
        next: "a.classify",
      },
      {
        id: "a.classify",
        kind: "action",
        does: "Classify the operational meaning as PRAISE, PRODUCT_FEEDBACK, SERVICE_ISSUE, SUPPORT_NEED, COMPLAINT, GENERAL_COMMENT or UNKNOWN, in its own field. A classification is a routing decision, not a finding about what went wrong",
        writes: [{ field: "feedback_log", mode: "append" }],
        next: "c.route",
      },
      {
        id: "c.route",
        kind: "condition",
        asks: "What does this mean operationally?",
        branches: [
          { label: "PRAISE", when: "positive, with substance behind it", to: "h.positive" },
          {
            label: "SERVICE_ISSUE or COMPLAINT",
            when: "something went wrong, or is alleged to have",
            to: "h.negative",
          },
          {
            label: "SUPPORT_NEED",
            when: "they need help with something rather than reporting a fault",
            to: "a.obligation",
          },
          {
            label: "PRODUCT_FEEDBACK",
            when: "an observation about the product that creates no obligation to this individual",
            to: "a.product",
          },
          {
            label: "GENERAL_COMMENT",
            when: "worth keeping, nothing to do",
            to: "c.acknowledge",
          },
          {
            label: "UNKNOWN",
            when: "the meaning cannot be established reliably enough to route",
            to: "h.triage",
          },
        ],
      },
      {
        id: "h.positive",
        kind: "handoff",
        to: "FBK-45",
        on: "credible positive feedback",
        carries: ["the record and the experience it is about", "whatever they volunteered beyond the score"],
      },
      {
        id: "h.negative",
        kind: "handoff",
        to: "FBK-44",
        on: "feedback describing something that went wrong",
        carries: [
          "the record and their own words",
          "the classification, marked as an interpretation rather than a finding",
        ],
      },
      {
        id: "h.triage",
        kind: "handoff",
        to: "DEC-181",
        on: "feedback that cannot be classified reliably",
        carries: ["the record, unclassified, so a person reads what was written rather than a guess about it"],
      },
      {
        id: "a.product",
        kind: "action",
        does: "Pass it to product intake as evidence. Nothing is owed to this individual in return, and nothing is promised to them",
        next: "c.promise",
      },
      {
        id: "a.obligation",
        kind: "action",
        does: "Create the work item in the owning process. From here the issue has its own lifecycle and its own owner; this record stays open independently, because the issue closing and the person hearing back are two different events",
        writes: [{ field: "feedback_log", mode: "append" }],
        next: "w.outcome",
      },
      {
        id: "w.outcome",
        kind: "wait",
        until: ["the operational outcome is recorded against the work item"],
        onEvent: "c.promise",
        timeout: {
          after: "the obligation's own SLA",
          reason:
            "the feedback record does not close because the work took too long - it stays open and says so",
        },
        onTimeout: "x.open",
        windowExtendsOnEngagement: false,
      },
      {
        id: "x.open",
        kind: "exit",
        state: "obligation outstanding; loop not closed",
        terminal: false,
        reEntry:
          "the outcome arriving later re-opens this to close the loop; the issue's own journey owns the escalation, and nothing here pretends the record is finished",
      },
      {
        id: "c.promise",
        kind: "condition",
        asks: "Was a follow-up promised to the person?",
        branches: [
          {
            label: "Promised",
            when: "they were told they would hear back",
            to: "w.followup",
          },
          {
            label: "Nothing promised",
            when: "no commitment was made to them",
            to: "x.closed",
          },
        ],
      },
      {
        id: "w.followup",
        kind: "wait",
        until: ["the promised follow-up is delivered"],
        onEvent: "x.closed",
        timeout: {
          after: "the window in which the promise still means anything",
          reason:
            "an unkept promise to someone who took the time to tell us something is worse than never having asked, so it escalates rather than expiring",
        },
        onTimeout: "h.promise",
        windowExtendsOnEngagement: false,
      },
      {
        id: "h.promise",
        kind: "handoff",
        to: "DEC-181",
        on: "a promised follow-up that did not happen",
        carries: ["what was promised, when, and what has happened operationally since"],
      },
      {
        id: "c.acknowledge",
        kind: "condition",
        asks: "Is an acknowledgement appropriate?",
        branches: [
          {
            label: "Worth acknowledging",
            when: "they addressed us directly and would expect some response",
            to: "a.acknowledge",
          },
          {
            label: "Not needed",
            when: "an acknowledgement would be noise",
            to: "x.stored",
          },
        ],
      },
      {
        id: "a.acknowledge",
        kind: "action",
        does: "Acknowledge specifically enough that it is clear a person could have read it",
        next: "x.stored",
      },
      {
        id: "x.stored",
        kind: "exit",
        state: "stored; nothing owed",
        terminal: false,
        reEntry: "the record contributes to relationship evidence and needs nothing further",
      },
      {
        id: "x.closed",
        kind: "exit",
        state: "loop closed",
        terminal: false,
        reEntry: "further feedback about the same experience opens its own record",
      },
    ],
    guardrails: [
      "Negative sentiment is not a confirmed root cause. The classification routes the feedback; it does not diagnose anything.",
      "The classification never overwrites what the person wrote. Their words and our interpretation are stored side by side.",
      "The feedback record and the issue it produced remain separate entities. Closing the issue does not close the loop with the person.",
    ],
    reusableRule:
      "Feedback becomes operationally useful only when its meaning is routed to the process capable of acting on it.",
  },

  /* ------------------------------------------------------------ FBK-44 */
  {
    id: "FBK-44",
    slug: "negative-feedback-issue-check",
    category: "feedback",
    goal: "escalation-exception",
    name: "Negative feedback → issue check → resolve, acknowledge or escalate",
    purpose:
      "Find out whether an unresolved obligation actually exists before anything that looks like recovery starts.",
    entity: {
      scope: "the feedback plus the service or experience entity it describes",
      note: "Scoped to what they complained about. A bad experience with one order is not an account-level failure.",
    },
    distinctFrom: [
      {
        journey: "RET-26",
        because:
          "RET-26 starts from a recorded failure and asks what response is owed. This starts from someone's account of an experience and asks whether a failure exists at all - which most often it does not.",
      },
    ],
    entry: "t.negative",
    nodes: [
      {
        id: "t.negative",
        kind: "trigger",
        event: "material_negative_feedback",
        evidence: {
          requires: ["negative feedback with enough substance to identify what it is about"],
          insufficientAlone: [
            "a low score with no description",
            "dissatisfaction with no identifiable referent",
          ],
          source: "declared",
        },
        next: "c.existing",
      },
      {
        id: "c.existing",
        kind: "condition",
        asks: "Does an open issue or case already cover this?",
        branches: [
          {
            label: "Already open",
            when: "an existing case covers the same underlying problem",
            to: "a.attach",
          },
          {
            label: "Nothing open",
            when: "no existing case covers it",
            to: "a.assess",
          },
        ],
      },
      {
        id: "a.attach",
        kind: "action",
        does: "Attach the feedback to the existing case as further context. No second case is created and no parallel recovery is started - the resolution already running owns this",
        writes: [{ field: "issue_context_log", mode: "append" }],
        next: "x.attached",
      },
      {
        id: "x.attached",
        kind: "exit",
        state: "attached to the existing case",
        terminal: false,
        reEntry:
          "if that case closes and the person is still dissatisfied, that is new feedback about a new state and enters properly",
      },
      {
        id: "a.assess",
        kind: "action",
        does: "Establish whether what they described is an actionable operational issue, or an experience we did not meet. Both are real; only one of them creates an obligation, and inventing the obligation to have somewhere to route to is the failure this step exists to prevent",
        next: "c.actionable",
      },
      {
        id: "c.actionable",
        kind: "condition",
        asks: "Is there an actionable operational issue?",
        branches: [
          {
            label: "Actionable",
            when: "something identifiable is wrong and can be worked on",
            to: "c.severity",
          },
          {
            label: "Not actionable",
            when: "the experience was poor without anything specific having failed - a mismatch of expectation, a product that is not for them, a decision they disagree with",
            to: "a.acknowledge",
          },
        ],
      },
      {
        id: "a.acknowledge",
        kind: "action",
        does: "Acknowledge what they said and record it as relationship evidence. No fault is manufactured, no compensation is offered as a substitute for having nothing to fix",
        writes: [{ field: "feedback_log", mode: "append" }],
        next: "x.acknowledged",
      },
      {
        id: "x.acknowledged",
        kind: "exit",
        state: "heard, nothing to fix",
        terminal: false,
        reEntry: "repetition of the same complaint is itself evidence and is assessed differently",
      },
      {
        id: "c.severity",
        kind: "condition",
        asks: "Do the escalation criteria apply?",
        branches: [
          {
            label: "Severe",
            when: "policy defines this as requiring escalation on severity, harm, or the parties involved",
            to: "a.escalate",
          },
          {
            label: "Ordinary",
            when: "actionable, at the normal level",
            to: "h.issue",
          },
        ],
      },
      {
        id: "a.escalate",
        kind: "action",
        does: "Apply the policy escalation and mark the severity on the issue, so that the ownership and SLA it inherits are the escalated ones rather than the default",
        writes: [{ field: "issue_context_log", mode: "append" }],
        next: "h.issue",
      },
      {
        id: "h.issue",
        kind: "handoff",
        to: "FBK-46",
        on: "an actionable issue arising from feedback",
        carries: [
          "the person's own account of it, unedited",
          "the severity and whether policy escalation was applied",
          "the link back to the feedback record, which stays open independently",
        ],
      },
    ],
    guardrails: [
      "A low score alone does not prove a specific failure. It reports an experience.",
      "Not every negative signal creates a case. Duplicating cases from feedback that describes an existing problem is how one issue becomes five.",
      "Compensation is not the default outcome, and it is not decided here at all.",
    ],
    reusableRule:
      "Negative feedback should first determine whether a real unresolved obligation exists before triggering recovery actions.",
  },

  /* ------------------------------------------------------------ FBK-45 */
  {
    id: "FBK-45",
    slug: "positive-feedback-recognition",
    category: "feedback",
    goal: "eligibility-qualification",
    name: "Positive feedback → recognition → advocacy opportunity",
    purpose:
      "Record a good experience as evidence and acknowledge it, without turning the person into an advocate by arithmetic.",
    entity: {
      scope: "the feedback plus the person or account it came from",
      note: "Positive feedback is evidence attached to a moment. It is not a property of the person, and it expires like any other evidence.",
    },
    entry: "t.positive",
    nodes: [
      {
        id: "t.positive",
        kind: "trigger",
        event: "credible_positive_feedback",
        evidence: {
          requires: ["positive feedback with enough substance to be about something"],
          insufficientAlone: [
            "a high score with nothing written",
            "a positive reply in a support thread, which is politeness rather than evaluation",
          ],
          source: "declared",
        },
        next: "a.persist",
      },
      {
        id: "a.persist",
        kind: "action",
        does: "Store it as one dated, scoped piece of positive relationship evidence. Not a label, not a state, not an advocate flag - a fact about a moment, which is all it is",
        writes: [{ field: "relationship_evidence", mode: "append" }],
        next: "c.recognition",
      },
      {
        id: "c.recognition",
        kind: "condition",
        asks: "Is recognition appropriate?",
        branches: [
          {
            label: "Worth acknowledging",
            when: "they said something specific and a genuine reply is possible",
            to: "a.acknowledge",
          },
          {
            label: "Not needed",
            when: "acknowledging a score would be an automated thank-you for an automated answer",
            to: "c.contribution",
          },
        ],
      },
      {
        id: "a.acknowledge",
        kind: "action",
        does: "Acknowledge the specific thing they said. A generic thank-you sent in response to praise is worse than silence, because it proves nobody read it",
        next: "c.contribution",
      },
      {
        id: "c.contribution",
        kind: "condition",
        asks: "Did they volunteer something reusable - a written review, a quote, a story?",
        branches: [
          {
            label: "Volunteered something",
            when: "they provided content beyond an answer to our question",
            to: "h.contribution",
          },
          {
            label: "Just feedback",
            when: "they answered and nothing more",
            to: "c.eligible",
          },
        ],
      },
      {
        id: "h.contribution",
        kind: "handoff",
        to: "external:advocacy-contribution",
        on: "a reusable contribution offered voluntarily",
        carries: [
          "the contribution as given",
          "the explicit fact that offering it is not permission to publish it, which has to be captured separately before anything is used",
        ],
      },
      {
        id: "c.eligible",
        kind: "condition",
        asks: "Does the relationship now meet advocacy eligibility?",
        branches: [
          {
            label: "Eligible",
            when: "this evidence, together with what already existed, is enough to justify asking for something",
            to: "h.advocacy",
          },
          {
            label: "Not eligible",
            when: "this is one good signal and the relationship has not accumulated more",
            to: "x.evidence",
          },
        ],
      },
      {
        id: "h.advocacy",
        kind: "handoff",
        to: "FBK-42",
        on: "positive evidence reaching the advocacy threshold",
        carries: ["the evidence set, not only the latest item", "the context the positive experience was in"],
      },
      {
        id: "x.evidence",
        kind: "exit",
        state: "recorded as evidence; no advocate state created",
        terminal: false,
        reEntry:
          "further positive evidence may reach the threshold later; nothing about this feedback needs undoing for that to happen",
      },
    ],
    guardrails: [
      "Positive feedback is not consent to publish, and it is not testimonial permission.",
      "A high NPS or CSAT score does not create a permanent advocate state. Evidence has a date and decays.",
      "Recognition is specific or it is not sent.",
    ],
    reusableRule:
      "Positive feedback is evidence of relationship value; advocacy requires an additional eligibility and permission decision.",
  },

  /* ------------------------------------------------------------ FBK-46 */
  {
    id: "FBK-46",
    slug: "issue-ownership-and-closure",
    category: "feedback",
    goal: "escalation-exception",
    name: "Complaint or issue created → ownership → resolution → confirmation",
    purpose:
      "Hold an actionable issue as an open obligation with a named owner until both the fix and the closure condition are satisfied.",
    entity: {
      scope: "the issue or complaint itself",
      note: "The issue is its own entity. The feedback that produced it, the person it affects and the case are three separate records, and the issue closing does not close the other two.",
    },
    competition: {
      scope: "account",
      exclusionGroup: "retention-outreach",
      precedence:
        "an open issue under human ownership outranks automated retention and satisfaction outreach on the same account",
      onLoss: "paused",
    },
    entry: "t.created",
    nodes: [
      {
        id: "t.created",
        kind: "trigger",
        event: "actionable_issue_created",
        evidence: {
          requires: ["a formally created issue with a type, a severity and a related entity"],
          source: "authoritative",
        },
        next: "a.capture",
      },
      {
        id: "a.capture",
        kind: "action",
        does: "Capture the issue type, severity, related entity, SLA and source. Duplicates against the same underlying problem are reconciled here rather than worked twice",
        writes: [{ field: "issue_log", mode: "append" }],
        next: "c.owner",
      },
      {
        id: "c.owner",
        kind: "condition",
        asks: "Is the correct owner known?",
        branches: [
          {
            label: "Known",
            when: "the issue type and entity identify who owns it",
            to: "a.assign",
          },
          {
            label: "Unknown",
            when: "no owner can be determined from the issue itself",
            to: "h.orphan",
          },
        ],
      },
      {
        id: "h.orphan",
        kind: "handoff",
        to: "OWN-51",
        on: "an issue with no determinable owner",
        carries: [
          "the issue and everything known about it",
          "the fact that its SLA is already running, so assignment is not the start of the clock",
        ],
      },
      {
        id: "a.assign",
        kind: "action",
        does: "Assign the owner and record the assignment, appended - who held an issue and when is part of its resolution history",
        writes: [{ field: "issue_log", mode: "append" }],
        next: "w.resolution",
      },
      {
        id: "w.resolution",
        kind: "wait",
        until: ["the operational fix is completed"],
        onEvent: "c.confirmation",
        timeout: {
          after: "the SLA threshold for this severity",
          reason:
            "the SLA passing is an event to act on rather than a reason to stop - the obligation does not expire because we were slow",
        },
        onTimeout: "a.escalate",
        windowExtendsOnEngagement: false,
      },
      {
        id: "a.escalate",
        kind: "action",
        does: "Escalate one level: notify, then involve the team or manager, then reassign into a priority queue. Nothing customer-facing is sent because of this - an internal delay is our problem, not new information for them",
        writes: [{ field: "issue_log", mode: "append" }],
        next: "c.levels",
      },
      {
        id: "c.levels",
        kind: "condition",
        asks: "Are the escalation levels exhausted?",
        branches: [
          {
            label: "Levels remain",
            when: "a further level of escalation exists",
            to: "w.resolution",
          },
          {
            label: "Exhausted",
            when: "the ladder has been walked and the issue is still open",
            to: "h.escalate",
          },
        ],
      },
      {
        id: "h.escalate",
        kind: "handoff",
        to: "external:human-in-the-loop-lifecycle",
        on: "an issue outliving its escalation ladder",
        carries: ["the full history: owners, escalations, elapsed time", "what is still unresolved"],
      },
      {
        id: "c.confirmation",
        kind: "condition",
        asks: "Does closure require the person to confirm?",
        branches: [
          {
            label: "Confirmation required",
            when: "the fix is only verifiable from their side, or policy requires their agreement",
            to: "w.confirm",
          },
          {
            label: "Not required",
            when: "the fix is verifiable operationally and policy allows closure on it",
            to: "a.close",
          },
        ],
      },
      {
        id: "w.confirm",
        kind: "wait",
        until: ["the person confirms it is resolved", "the person says it is not"],
        onEvent: "c.confirmed",
        timeout: {
          after: "the bounded closure window defined by policy",
          reason:
            "an issue cannot stay open indefinitely waiting for someone who has moved on, but closing it silently would record something that was never verified",
        },
        onTimeout: "a.close-unconfirmed",
        windowExtendsOnEngagement: false,
      },
      {
        id: "c.confirmed",
        kind: "condition",
        asks: "What did they say?",
        branches: [
          { label: "Resolved", when: "they confirmed the fix worked", to: "a.close" },
          {
            label: "Still not right",
            when: "they say the problem persists - the internal task completed and their issue did not",
            to: "w.resolution",
          },
        ],
      },
      {
        id: "a.close",
        kind: "action",
        does: "Close the issue, preserving the full resolution history: what was wrong, who owned it, what was done, when, and that the person confirmed it",
        writes: [{ field: "issue_log", mode: "append" }],
        next: "x.closed",
      },
      {
        id: "a.close-unconfirmed",
        kind: "action",
        does: "Close under the bounded closure rule, recording explicitly that the fix completed and the person never confirmed. Confirmed and unconfirmed closures are different facts and are never written the same way",
        writes: [{ field: "issue_log", mode: "append" }],
        next: "x.closed-unconfirmed",
      },
      {
        id: "x.closed",
        kind: "exit",
        state: "resolved and confirmed",
        terminal: false,
        reEntry: "the same problem recurring is a new issue, linked to this one rather than reopening it",
      },
      {
        id: "x.closed-unconfirmed",
        kind: "exit",
        state: "fixed operationally, never confirmed",
        terminal: false,
        reEntry:
          "any later contact about the same problem enters knowing this was never verified, which is why the distinction is recorded",
      },
    ],
    guardrails: [
      "An internal task completed does not mean the person's issue is resolved. Where confirmation is required, the two are separate events.",
      "Severity decides whether anything else is suppressed. A critical or safety issue silences other messaging to this person; a standard one does not, and suppressing everything for every complaint costs more than it protects.",
      "An unresolved issue may pause optional contact pressure for a defined period, and the period has a stated end rather than lasting until somebody notices. Its length comes from policy; recovery and support communication continues throughout.",
      "Closing preserves the resolution history rather than replacing the issue with a status.",
      "Duplicate complaints about one underlying problem are reconciled rather than worked in parallel.",
      "An SLA breach escalates internally and produces nothing customer-facing.",
    ],
    reusableRule:
      "An actionable complaint remains an open obligation until its required resolution and closure conditions are satisfied.",
  },

  /* ------------------------------------------------------------ FBK-47 */
  {
    id: "FBK-47",
    slug: "appeal-and-dispute-review",
    category: "feedback",
    goal: "decision-approval",
    name: "Appeal or dispute → evidence review → uphold, reverse or modify",
    purpose:
      "Review a decision that has already been made, without erasing it while the review is running.",
    entity: {
      scope: "the appeal, linked to the original decision it disputes",
      note: "Two entities throughout: the decision and the appeal against it. Both survive whatever the review concludes.",
    },
    distinctFrom: [
      {
        journey: "FBK-46",
        because:
          "An issue is something that went wrong. An appeal contests something we did on purpose, which means the subject under review is our own decision and it has to remain intact to be reviewable.",
      },
    ],
    entry: "t.appeal",
    nodes: [
      {
        id: "t.appeal",
        kind: "trigger",
        event: "appeal_or_dispute_submitted",
        evidence: {
          requires: ["a submission contesting an identifiable prior decision"],
          insufficientAlone: [
            "dissatisfaction with an outcome that names no decision",
            "a complaint about how a decision was communicated rather than about the decision",
          ],
          source: "declared",
        },
        next: "a.link",
      },
      {
        id: "a.link",
        kind: "action",
        does: "Link the appeal to the original decision and capture the reason, the evidence submitted, when it arrived and any deadline. The original decision is not modified by an appeal existing against it",
        writes: [{ field: "appeal_log", mode: "append" }],
        next: "c.eligible",
      },
      {
        id: "c.eligible",
        kind: "condition",
        asks: "Is the appeal eligible for review?",
        branches: [
          {
            label: "Eligible",
            when: "it contests a reviewable decision, within any applicable window, from someone entitled to contest it",
            to: "c.hold",
          },
          {
            label: "Not eligible",
            when: "out of time, not a reviewable decision, or brought by someone with no standing",
            to: "a.reject",
          },
        ],
      },
      {
        id: "a.reject",
        kind: "action",
        does: "Decline the appeal with the actual reason and whatever process does apply. A rejection that does not say why is the thing that produces the next complaint",
        writes: [{ field: "appeal_log", mode: "append" }],
        next: "x.rejected",
      },
      {
        id: "x.rejected",
        kind: "exit",
        state: "appeal not eligible; original decision unchanged",
        terminal: false,
        reEntry: "a differently grounded appeal, or new evidence, is assessed on its own terms",
      },
      {
        id: "c.hold",
        kind: "condition",
        asks: "Does policy require the original decision to be held while the review runs?",
        branches: [
          {
            label: "Hold required",
            when: "policy suspends the effect of the decision pending review",
            to: "a.hold",
          },
          {
            label: "No hold",
            when: "the decision remains in effect during review, which is the default",
            to: "w.review",
          },
        ],
      },
      {
        id: "a.hold",
        kind: "action",
        does: "Suspend the effect of the decision, recorded as a hold rather than as a reversal. Suspended and overturned are different states, and writing one as the other pre-decides the review",
        writes: [{ field: "appeal_log", mode: "append" }],
        next: "w.review",
      },
      {
        id: "w.review",
        kind: "wait",
        until: ["the review reaches a conclusion"],
        onEvent: "c.outcome",
        timeout: {
          after: "the review deadline",
          reason:
            "a deadline passing is not a decision, and letting an appeal expire unheard is the outcome most likely to be challenged elsewhere",
        },
        onTimeout: "h.deadline",
        windowExtendsOnEngagement: false,
      },
      {
        id: "h.deadline",
        kind: "handoff",
        to: "DEC-181",
        on: "a review deadline passing without a conclusion",
        carries: [
          "the appeal, the original decision and everything gathered",
          "the fact that no outcome has been reached, so nothing downstream records one",
        ],
      },
      {
        id: "c.outcome",
        kind: "condition",
        asks: "What did the review conclude?",
        branches: [
          { label: "UPHELD", when: "the original decision stands", to: "a.apply" },
          { label: "REVERSED", when: "the original decision was wrong", to: "a.apply" },
          { label: "MODIFIED", when: "the decision stands in part", to: "a.apply" },
          {
            label: "MORE_INFORMATION_REQUIRED",
            when: "the review cannot conclude on what it has",
            to: "w.more-info",
          },
        ],
      },
      {
        id: "w.more-info",
        kind: "wait",
        until: ["the requested information arrives"],
        onEvent: "w.review",
        timeout: {
          after: "the remaining time before the appeal deadline",
          reason: "requesting more information does not extend the deadline it sits inside",
        },
        onTimeout: "h.deadline",
        windowExtendsOnEngagement: false,
      },
      {
        id: "a.apply",
        kind: "action",
        does: "Update the effective business state to match the conclusion - upheld leaves the decision standing, reversed replaces its effect, modified supersedes it in part. In every case the original decision, the appeal and the review outcome all remain readable; nothing is edited in place, because the record of what was decided and then changed is the point of having an appeal process at all",
        writes: [{ field: "appeal_log", mode: "append" }],
        next: "x.concluded",
      },
      {
        id: "x.concluded",
        kind: "exit",
        state: "review concluded; original decision and outcome both preserved",
        terminal: false,
        reEntry:
          "a further appeal, where the process allows one, contests this outcome rather than the original decision",
      },
    ],
    guardrails: [
      "The original decision is never deleted or edited in place. It is the subject of the review.",
      "An open appeal does not reverse anything by itself. Only an explicit policy hold suspends the decision, and a hold is not a reversal.",
      "Who may review, and their independence from the original decision, is defined by policy rather than by this journey.",
    ],
    reusableRule:
      "An appeal creates a review of an existing decision; it does not erase the original decision before the review concludes.",
  },

  /* ------------------------------------------------------------ FBK-48 */
  {
    id: "FBK-48",
    slug: "declared-context-recalculation",
    category: "feedback",
    goal: "data-integrity",
    name: "Declared need or preference signal → persist → recalculate relevant experience",
    purpose:
      "Let something a person has told us about their situation reach the decisions that actually depend on it, and nothing else.",
    entity: {
      scope: "person or account plus the declared attribute, at the scope it was declared for",
      note: "A declared attribute belongs to the context it was given in. A goal stated for one product is not a goal for another.",
    },
    distinctFrom: [
      {
        journey: "CON-32",
        because:
          "CON-32 records how someone wants to be communicated with. This records what they are trying to achieve, which shapes product and journey decisions rather than message delivery.",
      },
    ],
    entry: "t.declared",
    nodes: [
      {
        id: "t.declared",
        kind: "trigger",
        event: "relevant_context_explicitly_declared",
        evidence: {
          requires: ["the person stating a need, goal, situation or context relevant to what we do"],
          insufficientAlone: [
            "behaviour implying a need",
            "a segment they were placed in by a model",
          ],
          source: "declared",
        },
        next: "a.persist",
      },
      {
        id: "a.persist",
        kind: "action",
        does: "Persist the value with its source, the time and the scope it applies to, in the store that holds declared answers. Inference is never written here and never overwrites what is - the same separation ACT-19 and CON-32 both depend on",
        writes: [{ field: "declared_context", mode: "append" }],
        next: "c.volatility",
      },
      {
        id: "c.volatility",
        kind: "condition",
        asks: "Is this attribute stable or volatile?",
        branches: [
          {
            label: "Stable",
            when: "it describes something that does not usually change - a role, an industry, a structural constraint",
            to: "a.stable",
          },
          {
            label: "Volatile",
            when: "it describes a current situation - a project, a season, a temporary goal",
            to: "a.volatile",
          },
        ],
      },
      {
        id: "a.stable",
        kind: "action",
        does: "Record it with a long validity and no scheduled revalidation",
        next: "a.consumers",
      },
      {
        id: "a.volatile",
        kind: "action",
        does: "Attach a validity period or a revalidation condition. A need stated for one quarter and still steering decisions two years later is worse than never having asked, because it is wrong with the authority of something the person actually said",
        writes: [{ field: "declared_context", mode: "append" }],
        next: "a.consumers",
      },
      {
        id: "a.consumers",
        kind: "action",
        does: "Identify the active and future journeys whose decisions genuinely depend on this attribute - not everything that could reference it, only what would decide differently because of it",
        next: "c.affected",
      },
      {
        id: "c.affected",
        kind: "condition",
        asks: "Is anything currently running materially affected?",
        branches: [
          {
            label: "Affected",
            when: "a live journey would make a different decision knowing this",
            to: "a.adapt",
          },
          {
            label: "Nothing affected",
            when: "nothing running depends on it, whatever it might inform later",
            to: "x.stored",
          },
        ],
      },
      {
        id: "a.adapt",
        kind: "action",
        does: "Adapt the future actions of those journeys. Delivered messages are not revisited",
        next: "x.applied",
      },
      {
        id: "x.applied",
        kind: "exit",
        state: "declared context stored and applied where it changes a decision",
        terminal: false,
        reEntry: "a change or a revalidation of the same attribute opens a new instance",
      },
      {
        id: "x.stored",
        kind: "exit",
        state: "stored; no orchestration triggered",
        terminal: false,
        reEntry:
          "a future decision that depends on it reads it then - an attribute that changes nothing today is still worth holding",
      },
    ],
    guardrails: [
      "Declared data is never overwritten by behavioural inference.",
      "The attribute is used only where a decision genuinely depends on it. Personalisation that references something for the sake of referencing it reveals the mechanism.",
      "A need or preference signal is not permission to communicate.",
    ],
    reusableRule:
      "Declared relationship context should influence only the decisions that genuinely depend on it.",
  },

  /* ------------------------------------------------------------ FBK-49 */
  {
    id: "FBK-49",
    slug: "missing-critical-data",
    category: "feedback",
    goal: "recovery-retry",
    name: "Missing critical data → request or resolve → resume",
    purpose:
      "Treat a genuinely blocking data gap as a named dependency, and keep it distinct from wanting to know more about someone.",
    entity: {
      scope: "the business entity that is blocked plus the specific missing requirement",
      note: "One instance per missing requirement per blocked process. Two gaps are two dependencies, resolvable by different people at different times.",
    },
    distinctFrom: [
      {
        journey: "ACT-13",
        because:
          "ACT-13 is scoped to activation specifically and owns resuming onboarding. This applies to any named process, most of which have nothing to do with onboarding.",
      },
    ],
    entry: "t.blocked",
    nodes: [
      {
        id: "t.blocked",
        kind: "trigger",
        event: "required_data_missing_and_blocking",
        evidence: {
          requires: [
            "a named business process that cannot safely proceed, and the specific field, document or value it is waiting on",
          ],
          insufficientAlone: [
            "a profile field that would be useful to have",
            "data that would improve a future decision while blocking nothing today",
          ],
          source: "authoritative",
        },
        next: "a.identify",
      },
      {
        id: "a.identify",
        kind: "action",
        does: "Identify the exact missing item and the named process it blocks. A request that cannot name what it unblocks is progressive profiling wearing a blocker's clothes, and the two must not be confusable",
        writes: [{ field: "blocking_requirement_log", mode: "append" }],
        next: "c.authoritative",
      },
      {
        id: "c.authoritative",
        kind: "condition",
        asks: "Can an authoritative source supply this without asking anyone?",
        branches: [
          {
            label: "We already have it",
            when: "an authoritative system holds it, or it can be derived or reconciled from what we hold",
            to: "a.retrieve",
          },
          {
            label: "It has to be provided",
            when: "no system holds it and someone has to supply it",
            to: "a.request",
          },
        ],
      },
      {
        id: "a.retrieve",
        kind: "action",
        does: "Retrieve and reconcile it. Asking someone for what we already hold authoritatively is the fastest way to demonstrate that we do not know our own records",
        next: "c.valid",
      },
      {
        id: "a.request",
        kind: "action",
        does: "Request it from the actor who can actually provide it - which is often not the customer - stating what it unblocks, so the request is answerable rather than merely received",
        next: "w.received",
      },
      {
        id: "w.received",
        kind: "wait",
        until: ["the data arrives"],
        onEvent: "c.valid",
        timeout: {
          after: "the SLA of the process being blocked",
          reason:
            "how long to wait is a property of what is blocked, not of the request - a blocked payment and a blocked report do not deserve the same patience",
        },
        onTimeout: "c.criticality",
        windowExtendsOnEngagement: false,
      },
      {
        id: "c.valid",
        kind: "condition",
        asks: "Is what we now have valid?",
        branches: [
          {
            label: "Valid",
            when: "it satisfies the requirement",
            to: "a.persist",
          },
          {
            label: "Invalid or incomplete",
            when: "what arrived does not satisfy the requirement",
            to: "c.criticality",
          },
        ],
      },
      {
        id: "a.persist",
        kind: "action",
        does: "Persist it and re-evaluate the blocked process, which resumes because its dependency is satisfied rather than because it was told to",
        writes: [{ field: "blocking_requirement_log", mode: "append" }],
        next: "x.resumed",
      },
      {
        id: "x.resumed",
        kind: "exit",
        state: "requirement satisfied; the blocked process is free to continue",
        terminal: false,
        reEntry: "a further missing requirement is its own dependency with its own instance",
      },
      {
        id: "c.criticality",
        kind: "condition",
        asks: "Given how critical the blocked process is, what now?",
        branches: [
          {
            label: "Critical enough for a person",
            when: "the process matters enough that someone should own getting this resolved",
            to: "h.escalate",
          },
          {
            label: "An alternate route exists",
            when: "the process can proceed by a path that does not require this item",
            to: "x.alternate",
          },
          {
            label: "Not worth pursuing further",
            when: "the blocked process can wait or be abandoned without harm",
            to: "x.abandoned",
          },
        ],
      },
      {
        id: "h.escalate",
        kind: "handoff",
        to: "external:human-in-the-loop-lifecycle",
        on: "a critical dependency that requesting did not resolve",
        carries: [
          "the missing item, who was asked, and what is blocked",
          "what has already been tried, so the person does not repeat the request that failed",
        ],
      },
      {
        id: "x.alternate",
        kind: "exit",
        state: "blocked process proceeding by a route that does not need this",
        terminal: false,
        reEntry: "if the alternate route later requires it after all, that is a new dependency",
      },
      {
        id: "x.abandoned",
        kind: "exit",
        state: "requirement unmet; the blocked process stays blocked and says so",
        terminal: false,
        reEntry:
          "the item arriving later re-opens this normally; it is not re-requested repeatedly in the meantime",
      },
    ],
    guardrails: [
      "Nice-to-have profile data is not a critical requirement, and asking for it as though it were teaches people that our requests are negotiable.",
      "Nothing is requested that an authoritative system already holds.",
      "Every request names the process it unblocks. A request that cannot is progressive profiling and belongs elsewhere.",
    ],
    reusableRule:
      "Critical data should be requested only when a named process cannot safely proceed without it.",
  },

  /* ------------------------------------------------------------ FBK-50 */
  {
    id: "FBK-50",
    slug: "relationship-evidence-accumulation",
    category: "feedback",
    goal: "health-risk-signal-scoring",
    name: "Relationship signal → evidence accumulation → state reassessment",
    purpose:
      "Accumulate signals as dated evidence, and let a relationship label exist only where a policy defined what it means.",
    entity: {
      scope: "person or account plus the relationship context the signal was observed in",
      note: "Signals are scoped and dated. Without scope one bad experience colours everything; without a date, evidence from years ago outvotes evidence from this week.",
    },
    distinctFrom: [
      {
        journey: "RET-21",
        because:
          "RET-21 recalculates engagement from behaviour on a defined cadence. This accumulates heterogeneous signals - feedback, outcomes, friction, contributions - and only reassesses a state where the evidence justifies it.",
      },
    ],
    entry: "t.signal",
    nodes: [
      {
        id: "t.signal",
        kind: "trigger",
        event: "meaningful_relationship_signal",
        evidence: {
          requires: [
            "a signal that says something about the relationship: positive or negative feedback, a successful outcome, a repeated contribution, support friction, a declared preference, an engagement change, an advocacy action",
          ],
          insufficientAlone: [
            "an open or a click, which describes a message rather than a relationship",
          ],
          source: "behavioral",
        },
        next: "a.store",
      },
      {
        id: "a.store",
        kind: "action",
        does: "Store the signal with its type, source, time, related entity and how reliable it is. It is stored as evidence, never as a conclusion - the difference is whether anything downstream can disagree with it later",
        writes: [{ field: "relationship_evidence", mode: "append" }],
        next: "c.immediate",
      },
      {
        id: "c.immediate",
        kind: "condition",
        asks: "Does this signal need immediate operational action?",
        branches: [
          {
            label: "Needs action",
            when: "something has to happen now - a complaint, a failure, a request",
            to: "x.owned",
          },
          {
            label: "Evidence only",
            when: "it says something about the relationship without requiring anything to be done",
            to: "c.reassess",
          },
        ],
      },
      {
        id: "x.owned",
        kind: "exit",
        state: "recorded as evidence; the action is owned elsewhere",
        terminal: false,
        reEntry:
          "the journey that owns the action is triggered by the same signal independently - this one records, it does not dispatch, and duplicating the dispatch here is how two systems respond to one event",
      },
      {
        id: "c.reassess",
        kind: "condition",
        asks: "Does the accumulated evidence justify reassessing a relationship state?",
        branches: [
          {
            label: "Worth reassessing",
            when: "enough has changed across the evidence set that the current state may no longer be right",
            to: "a.reassess",
          },
          {
            label: "State stands",
            when: "one more signal consistent with what is already recorded",
            to: "x.evidence",
          },
        ],
      },
      {
        id: "x.evidence",
        kind: "exit",
        state: "evidence recorded; state unchanged",
        terminal: false,
        reEntry: "the next signal is weighed against a slightly larger set",
      },
      {
        id: "a.reassess",
        kind: "action",
        does: "Re-evaluate against the whole current evidence set, applying the decay the state being assessed requires. How fast evidence stops counting depends on what is being judged: satisfaction ages quickly, tenure does not",
        next: "c.governed",
      },
      {
        id: "c.governed",
        kind: "condition",
        asks: "Is the state being assigned one a policy has actually defined?",
        branches: [
          {
            label: "Governed",
            when: "a policy defines what this label means, what evidence establishes it, and what removes it",
            to: "a.assign",
          },
          {
            label: "Undefined",
            when: "the label would be created here for the first time - LOYAL, ADVOCATE, AT_RISK, VIP, DETRACTOR and everything like them",
            to: "x.no-label",
          },
        ],
      },
      {
        id: "a.assign",
        kind: "action",
        does: "Assign the state, recording which policy defines it and which evidence satisfied it, so it can be explained, disputed and removed by the same route it was created by",
        writes: [{ field: "relationship_state_history", mode: "append" }],
        next: "x.reassessed",
      },
      {
        id: "x.reassessed",
        kind: "exit",
        state: "relationship state reassessed against the current evidence set",
        terminal: false,
        reEntry: "further signals may move it again, in either direction",
      },
      {
        id: "x.no-label",
        kind: "exit",
        state: "evidence recorded; no label created",
        terminal: false,
        reEntry:
          "a policy defining the label makes it assignable later, against this same evidence - a label nobody defined is one nobody can dispute, remove, or explain to the person carrying it",
      },
    ],
    guardrails: [
      "One signal does not silently create a permanent label. LOYAL, ADVOCATE, AT_RISK, VIP and DETRACTOR exist only where a policy defines what they mean and what removes them.",
      "Evidence decays, and how fast depends on what is being assessed rather than on a single global rule.",
      "Signals stay scoped to the entity they were observed on.",
      "Communication engagement is not relationship evidence and does not enter this store.",
    ],
    reusableRule:
      "Relationship states should emerge from appropriate evidence over time rather than from isolated behavioral or feedback events.",
  },
];
