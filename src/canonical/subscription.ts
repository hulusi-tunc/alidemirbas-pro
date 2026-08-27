import type { CanonicalJourney, OrchestrationRule } from "./types";

/* CATEGORY 17 - SUBSCRIPTIONS, CONTRACTS, RENEWALS & CONTINUING RELATIONSHIPS

   Everything before this category was a transaction: something asked for,
   something delivered, and a state that eventually stops moving. A continuing
   relationship never stops moving. It has a term, and the term ends, and then
   either it does not exist or it exists again on new conditions.

   That produces a problem the earlier categories never had: almost every state
   here is scheduled before it is true. A renewal is decided in October and
   happens in January. A downgrade is requested today and applies at the next
   cycle. A cancellation is submitted in March for an end date in June. Between
   the decision and the execution, the thing being decided about keeps changing.

   So the recurring move in this category is: store the decision as a delta
   against a version, and re-derive at the effective time from what is
   authoritative then. Never from what was true when the schedule was written.
   Four journeys here exist mostly to enforce that - SUB-162, SUB-166, SUB-168
   and the revalidation inside SUB-169.

   The chains it keeps apart:

     created        the agreement exists on paper
     effective      its start date has arrived
     active         its activation conditions were met
     entitled       and this particular right is one it grants

     eligible       the terms permit a renewal
     decided        someone or something chose it
     executed       the new term's requirements were met
     new term       the new term is running

     requested      they asked to stop
     scheduled      an end date exists
     ended          the date arrived and the cancellation was still valid
     wound down     what was owed has been resolved

   And one that is not a chain: suspended sits beside all of it. A suspended
   relationship has not ended, has not been cancelled, and is still counting
   toward its own renewal unless policy says otherwise. */

export const SUBSCRIPTION_RULES: readonly OrchestrationRule[] = [
  {
    id: "SUB-R1",
    scope: "subscription",
    rule: "Continuing relationship creation and activation are separate states.",
    because:
      "An agreement can exist for months before it starts, and can exist forever without ever starting if a condition it depends on is never met.",
  },
  {
    id: "SUB-R2",
    scope: "subscription",
    rule: "Future-effective activation revalidates its prerequisites at execution time.",
    because:
      "Everything the activation depends on can change between the schedule and the date. A job that fires on stored assumptions activates a relationship the parties no longer have.",
  },
  {
    id: "SUB-R3",
    scope: "subscription",
    rule: "An active relationship and an entitlement are related and separate.",
    because:
      "Active says the agreement is running. Entitled says this specific right is one it grants. Reading the first as the second is how a basic plan gets enterprise features.",
  },
  {
    id: "SUB-R4",
    scope: "subscription",
    rule: "Renewal eligibility, renewal decision and renewal execution are three separate stages.",
    because:
      "Each fails on its own. Eligible and undecided, decided and unpaid, and paid but not yet started are three different situations that need three different things said about them.",
  },
  {
    id: "SUB-R5",
    scope: "subscription",
    rule: "Each renewal term preserves the previous term's history.",
    because:
      "Overwriting the old term's dates and price with the new ones means last quarter's invoice no longer matches any terms the system knows about.",
  },
  {
    id: "SUB-R6",
    scope: "subscription",
    rule: "Renewal payment failure is not automatic relationship termination.",
    because:
      "A card expiring is the most common failure in this category and the least meaningful. Terminating on it ends relationships over an event the counterparty would fix in thirty seconds if told.",
  },
  {
    id: "SUB-R7",
    scope: "subscription",
    rule: "Grace and lapse semantics come from governing policy and are never invented.",
    because:
      "An invented grace period either cuts off someone who was entitled to continue, or keeps serving someone who was not. Both are found later, by the wrong person.",
  },
  {
    id: "SUB-R8",
    scope: "subscription",
    rule: "Plan and terms changes are effective-time aware and are applied as deltas.",
    because:
      "Storing the resulting terms freezes an answer computed against a relationship that will have changed by the time it lands. Storing the delta lets it be recomputed against what is actually there.",
  },
  {
    id: "SUB-R9",
    scope: "subscription",
    rule: "Scheduled changes are version-aware and suppress stale execution.",
    because:
      "The same discipline INT-R7 and OPS-R11 apply to queued work, arriving here where the stale action changes what someone pays and what they can use.",
  },
  {
    id: "SUB-R10",
    scope: "subscription",
    rule: "Cancellation request, scheduled cancellation and effective relationship end are separate states.",
    because:
      "The gap between them is often months, and during it the relationship is fully active. Collapsing them cuts service off at the moment someone asks about stopping.",
  },
  {
    id: "SUB-R11",
    scope: "subscription",
    rule: "End-of-term cancellation preserves current-term validity until the effective end.",
    because:
      "The term was paid for. Ending access early bills someone for a period they cannot use, which converts a clean exit into a refund claim.",
  },
  {
    id: "SUB-R12",
    scope: "subscription",
    rule: "Suspension and cancellation are separate lifecycle mechanisms.",
    because:
      "Suspension is reversible and the relationship survives it. Treating one as the other either ends something recoverable or leaves something ended still counting toward renewal.",
  },
  {
    id: "SUB-R13",
    scope: "subscription",
    rule: "Restoration from suspension rebuilds current valid capability rather than replaying a stored snapshot.",
    because:
      "The same restore-from-snapshot ban ACC-R13 and IDN-R12 state, and here the snapshot is usually months old and describes a plan the relationship no longer has.",
  },
  {
    id: "SUB-R14",
    scope: "subscription",
    rule: "Relationship end, account closure and data deletion are three independent lifecycle events.",
    because:
      "A former customer usually keeps an account, and almost always keeps records that have to be retained. Chaining these treats leaving a plan as asking to be erased.",
  },
  {
    id: "SUB-R15",
    scope: "subscription",
    rule: "Relationship end hands off entitlement loss and deprovisioning rather than reimplementing them.",
    because:
      "Which rights survive an ending is a property of the entitlements. A relationship record deciding it locally will disagree with the entitlement lifecycle, and one of them will be wrong.",
  },
  {
    id: "SUB-R16",
    scope: "subscription",
    rule: "Financial, fulfillment, dispute and remedy obligations can survive relationship termination.",
    because:
      "An order placed while it was active is still owed, a refund still due is still due, and a dispute still open is still open. Ending stops future rights, not existing commitments.",
  },
  {
    id: "SUB-R17",
    scope: "subscription",
    rule: "Historical terms, renewals, suspensions and cancellation decisions stay auditable.",
    because:
      "This is the category where someone eventually asks what they agreed to and when. A record that only holds the current terms cannot answer it.",
  },
  {
    id: "SUB-R18",
    scope: "subscription",
    rule: "Late payments and stale scheduled events are reconciled against the current relationship version before they change state.",
    because:
      "A payment arriving after a lapse does not retroactively renew a term that never started, and a cancellation firing after a resubscription ends the wrong relationship.",
  },
];

export const SUBSCRIPTION_JOURNEYS: readonly CanonicalJourney[] = [
  /* ------------------------------------------------------------ SUB-161 */
  {
    id: "SUB-161",
    slug: "continuing-relationship-creation",
    category: "subscription",
    goal: "eligibility-qualification",
    channels: [],
    name: "Continuing relationship created → validate → activate or pending",
    purpose:
      "Keep the existence of a continuing agreement apart from the moment it actually starts running.",
    entity: {
      scope:
        "the continuing relationship record - a subscription, contract, membership, policy, licence or service agreement",
      note: "One record per relationship, carrying every term it has ever run under. Terms are versions inside it rather than replacements of it. This category owns continuing relationships governed by terms and effective periods, with the lifecycle semantics that follow from them. It does not own a structural link between entities merely because that link is long-lived - that is REL-91.",
    },
    distinctFrom: [
      {
        journey: "REL-91",
        because:
          "REL-91 links two entities: a person to an organisation, a parent account to a child, a representative to the entity they act for. Such a link has no term, nothing to renew and nothing to lapse. What is created here has all three, and it is frequently attached to a link REL-91 created rather than replacing it.",
      },
    ],
    entry: "t.authorized",
    nodes: [
      {
        id: "t.authorized",
        kind: "trigger",
        event: "continuing_relationship_creation_authorized",
        evidence: {
          requires: [
            "an authorised agreement to enter a continuing relationship, with parties, scope and a term",
          ],
          insufficientAlone: [
            "a payment succeeding, which funds a relationship without being what starts it - some contracts activate on signature, some on provisioning, some on a regulatory date",
            "a plan being selected in an interface",
            "a structural link being created between two entities, which connects them without agreeing a term",
          ],
          source: "authoritative",
        },
        next: "a.create",
      },
      {
        id: "a.create",
        kind: "action",
        does: "Create the relationship record. Capture the relationship id, the parties, the product or service scope, the start and effective date, the term, the renewal model, the reference to its financial terms, the basis on which it grants entitlements, and its status. Record CREATED - the agreement exists and nothing is running",
        writes: [{ field: "relationship_log", mode: "append" }],
        next: "c.effective",
      },
      {
        id: "c.effective",
        kind: "condition",
        asks: "Is it effective immediately?",
        branches: [
          {
            label: "Effective now",
            when: "the effective date is now or has passed",
            to: "a.requirements",
          },
          {
            label: "Effective later",
            when: "the effective date is in the future",
            to: "a.pending-date",
          },
        ],
      },
      {
        id: "a.pending-date",
        kind: "action",
        does: "Record PENDING_EFFECTIVE_DATE. Nothing is granted and nothing is billed against a relationship that has not started",
        writes: [{ field: "relationship_log", mode: "append" }],
        next: "h.scheduled",
      },
      {
        id: "h.scheduled",
        kind: "handoff",
        to: "SUB-162",
        on: "a relationship created with a future effective start",
        carries: [
          "the relationship, its effective date and the activation requirements as they stand today",
          "the explicit fact that today's requirements are a snapshot for comparison and not the basis on which it will activate",
        ],
      },
      {
        id: "a.requirements",
        kind: "action",
        does: "Determine the activation requirements that actually govern this relationship - payment, verification, contract execution, a provisioning prerequisite, a regulatory condition. Which of them apply is a property of this agreement rather than a universal list, and assuming payment is the only one activates contracts that were never signed",
        next: "c.satisfied",
      },
      {
        id: "c.satisfied",
        kind: "condition",
        asks: "Are the required dependencies satisfied?",
        branches: [
          {
            label: "All satisfied",
            when: "every governing activation condition is authoritatively met",
            to: "a.activate",
          },
          {
            label: "Something outstanding",
            when: "at least one governing condition is not met",
            to: "a.pending-req",
          },
        ],
      },
      {
        id: "a.pending-req",
        kind: "action",
        does: "Record PENDING_REQUIREMENT, naming which requirement is outstanding. A relationship stuck as pending with no stated reason is indistinguishable from one that is simply broken",
        writes: [{ field: "relationship_log", mode: "append" }],
        next: "w.requirement",
      },
      {
        id: "w.requirement",
        kind: "wait",
        until: ["the outstanding requirements are satisfied", "the agreement is withdrawn before starting"],
        onEvent: "c.recheck",
        timeout: {
          after: "the window policy allows a created but unstarted relationship to remain open",
          reason:
            "a relationship that never activates is not a relationship, and leaving it pending indefinitely holds resources and reporting against something that will never begin",
        },
        onTimeout: "a.abandon",
        windowExtendsOnEngagement: false,
      },
      {
        id: "c.recheck",
        kind: "condition",
        asks: "What resolved the wait?",
        branches: [
          {
            label: "Requirements met",
            when: "the outstanding conditions are now authoritatively satisfied",
            to: "a.activate",
          },
          {
            label: "Withdrawn",
            when: "the agreement was withdrawn before it started",
            to: "a.abandon",
          },
        ],
      },
      {
        id: "a.abandon",
        kind: "action",
        does: "Record the relationship as never activated, preserving the record and the reason. It existed and did not start, which is a different thing from never having been created and is worth being able to count",
        writes: [{ field: "relationship_log", mode: "append" }],
        next: "x.never-active",
      },
      {
        id: "x.never-active",
        kind: "exit",
        state: "created and never activated; no entitlement was ever granted",
        terminal: false,
        reEntry:
          "a new agreement between the same parties is a new relationship rather than this one resuming, and it starts from its own conditions",
      },
      {
        id: "a.activate",
        kind: "action",
        does: "Record ACTIVE with the effective date and what satisfied each requirement. Active describes the agreement running - it does not describe what the agreement grants. Every entitlement comes from the relationship's stated entitlement basis, so that a relationship being active is never mistaken for entitlement to everything",
        writes: [{ field: "relationship_log", mode: "append" }],
        next: "h.entitlement",
      },
      {
        id: "h.entitlement",
        kind: "handoff",
        to: "ACC-71",
        on: "an active continuing relationship whose entitlements now need qualifying",
        carries: [
          "the relationship's entitlement basis, its scope and its term",
          "the explicit fact that activation grants nothing by itself - each entitlement qualifies on its own terms",
        ],
      },
    ],
    guardrails: [
      "A record created is not a relationship active.",
      "Payment success alone does not define every contract's activation.",
      "A structural link is not an agreement. A person belonging to an organisation, or one account being the parent of another, is a relationship with no term to run, and it belongs to the entity-structure lifecycle rather than here.",
      "No entitlement is granted before the authoritative effective conditions are met.",
    ],
    reusableRule:
      "A continuing relationship becomes active only when its effective date and required activation conditions have been satisfied.",
  },

  /* ------------------------------------------------------------ SUB-162 */
  {
    id: "SUB-162",
    slug: "future-effective-activation",
    category: "subscription",
    goal: "scheduling-commitment",
    channels: [],
    name: "Future effective start → wait → revalidate → activate or abort",
    purpose:
      "Activate a future-dated relationship from what is true at the effective time, not from what was true when it was scheduled.",
    entity: {
      scope: "the future-dated continuing relationship and its scheduled activation",
      note: "The prerequisites recorded at scheduling are a snapshot kept for comparison. They are never the basis on which activation proceeds.",
    },
    entry: "t.future",
    nodes: [
      {
        id: "t.future",
        kind: "trigger",
        event: "relationship_created_with_future_start",
        evidence: {
          requires: ["a created relationship whose effective start is in the future"],
          source: "authoritative",
        },
        next: "a.schedule",
      },
      {
        id: "a.schedule",
        kind: "action",
        does: "Record SCHEDULED with the effective time and the prerequisites as they stand today. What is stored is a snapshot for comparison later - a future agreement is not a currently active relationship, and nothing it would grant exists yet",
        writes: [{ field: "relationship_log", mode: "append" }],
        next: "w.effective",
      },
      {
        id: "w.effective",
        kind: "wait",
        until: [
          "the relationship is cancelled before it starts",
          "a material prerequisite changes",
        ],
        onEvent: "c.preempt",
        timeout: {
          after: "the effective time",
          reason:
            "reaching the effective time is what this wait exists for. It is the normal outcome rather than a failure, and it is the point at which everything is checked again",
        },
        onTimeout: "a.revalidate",
        windowExtendsOnEngagement: false,
      },
      {
        id: "c.preempt",
        kind: "condition",
        asks: "What happened before the effective time?",
        branches: [
          {
            label: "Cancelled before start",
            when: "the agreement was cancelled while still scheduled",
            to: "a.cancel-scheduled",
          },
          {
            label: "A prerequisite changed",
            when: "something activation depends on moved, in either direction",
            to: "a.note",
          },
        ],
      },
      {
        id: "a.note",
        kind: "action",
        does: "Record the change against the scheduled activation and keep waiting, rather than acting on it now. A prerequisite that lapsed in March may be back in order by the June start date, and failing the activation three months early answers a question nobody has asked yet. The wait's timeout is a fixed calendar point, so returning to it cannot extend it",
        writes: [{ field: "relationship_log", mode: "append" }],
        next: "w.effective",
      },
      {
        id: "a.cancel-scheduled",
        kind: "action",
        does: "Record CANCELLED_BEFORE_START and suppress the scheduled activation. A pre-start cancellation that leaves the job in place activates something nobody has any more, bills for it, and is discovered by the person receiving the invoice",
        writes: [
          { field: "relationship_log", mode: "append" },
          { field: "suppressed_sends", mode: "append" },
        ],
        next: "x.cancelled-before-start",
      },
      {
        id: "x.cancelled-before-start",
        kind: "exit",
        state: "cancelled before it started; never active and never billed",
        terminal: false,
        reEntry:
          "a new agreement is a new relationship. This one is closed at a state it never left",
      },
      {
        id: "a.revalidate",
        kind: "action",
        does: "Re-read the relationship's current state at the effective time - is the agreement still valid, is the financial state what activation requires, does eligibility still hold, is the verification still current, are the dependencies still in place. The decision is made from what is authoritative now, and the stored snapshot is used only to see what moved",
        next: "c.still-valid",
      },
      {
        id: "c.still-valid",
        kind: "condition",
        asks: "Do the requirements still hold?",
        branches: [
          {
            label: "Still satisfied",
            when: "everything activation depends on is authoritatively in place",
            to: "a.activate",
          },
          {
            label: "Recoverable, and policy permits a hold",
            when: "something is missing that could still be supplied, and the governing terms allow a delayed start",
            to: "a.hold",
          },
          {
            label: "No longer satisfied",
            when: "a governing condition has failed and policy does not permit waiting",
            to: "a.failed",
          },
        ],
      },
      {
        id: "a.hold",
        kind: "action",
        does: "Record HOLD with exactly what is missing and what would clear it. The relationship has reached its start date without starting, which is a state worth naming rather than leaving as an activation that silently did not happen",
        writes: [{ field: "relationship_log", mode: "append" }],
        next: "w.hold",
      },
      {
        id: "w.hold",
        kind: "wait",
        until: ["the missing prerequisite is satisfied"],
        onEvent: "a.activate",
        timeout: {
          after: "the hold window the governing terms allow",
          reason:
            "a relationship held past its own start date indefinitely has effectively failed to activate, and saying so is better than an open hold that ages quietly",
        },
        onTimeout: "a.failed",
        windowExtendsOnEngagement: false,
      },
      {
        id: "a.failed",
        kind: "action",
        does: "Record FAILED_ACTIVATION or CANCELLED, according to which the governing policy defines for this failure. The two mean different things to the counterparty and the policy chooses between them - the distinction is not invented here",
        writes: [{ field: "relationship_log", mode: "append" }],
        next: "x.failed",
      },
      {
        id: "x.failed",
        kind: "exit",
        state: "reached its effective date and did not activate",
        terminal: false,
        reEntry:
          "the prerequisites being satisfied later does not activate this relationship retroactively. A new agreement is created if the parties still want one",
      },
      {
        id: "a.activate",
        kind: "action",
        does: "Record ACTIVE from the effective date, with what was true at the moment of activation rather than at the moment of scheduling",
        writes: [{ field: "relationship_log", mode: "append" }],
        next: "h.entitlement",
      },
      {
        id: "h.entitlement",
        kind: "handoff",
        to: "ACC-71",
        on: "a future-dated relationship activating at its effective time",
        carries: [
          "the relationship's entitlement basis and its term",
          "the fact that its entitlements are qualified now, against current terms, and not against what was scheduled",
        ],
      },
    ],
    guardrails: [
      "A future agreement is not a currently active relationship.",
      "A scheduled activation never executes blindly if its prerequisites changed.",
      "A pre-start cancellation suppresses the stale activation job.",
    ],
    reusableRule:
      "Future-dated relationships should activate from current valid state at the effective time rather than from assumptions made when they were scheduled.",
  },

  /* ------------------------------------------------------------ SUB-163 */
  {
    id: "SUB-163",
    slug: "renewal-decision",
    category: "subscription",
    goal: "eligibility-qualification",
    channels: ["email", "in-app", "push", "sms"],
    name: "Renewal window → eligibility → renew, non-renew or review",
    purpose:
      "Reach a decision about the next term, as a decision - separate from anything that makes the next term real.",
    entity: {
      scope: "the continuing relationship and the renewal cycle currently open on it",
      note: "One renewal cycle per term boundary. A relationship renewed eight times has eight cycles in its history, each with what was decided and why.",
    },
    distinctFrom: [
      {
        journey: "SUB-164",
        because:
          "This produces a decision. SUB-164 makes the new term exist, which depends on payment, confirmation and eligibility that this journey does not touch. A relationship can be decided-to-renew and still not renew.",
      },
    ],
    competition: {
      scope: "subscription",
      exclusionGroup: "relationship-continuity",
      precedence:
        "below a cancellation in motion and below an active risk state on the same relationship",
      onLoss: "suppressed",
    },
    entry: "t.window",
    nodes: [
      {
        id: "t.window",
        kind: "trigger",
        event: "renewal_decision_window_opens",
        evidence: {
          requires: [
            "a relationship whose term end is inside the renewal decision window its governing terms define",
          ],
          insufficientAlone: [
            "a renewal reminder having been sent, which is a communication and not a decision window opening",
          ],
          source: "authoritative",
        },
        next: "a.evaluate",
      },
      {
        id: "a.evaluate",
        kind: "action",
        does: "Evaluate renewal eligibility, the renewal model, the relationship's current state, the notice the terms require, the pricing and terms that would apply, any outstanding blockers, and whether the counterparty has to decide at all",
        writes: [{ field: "renewal_log", mode: "append" }],
        next: "c.notice",
      },
      {
        id: "c.notice",
        kind: "condition",
        asks: "Are the renewal terms and required notice period defined?",
        branches: [
          {
            label: "Defined",
            when: "the governing terms state the notice period, the renewal model and the terms that would apply",
            to: "c.blockers",
          },
          {
            label: "Not defined",
            when: "the notice period or the renewing terms are not stated anywhere authoritative",
            to: "h.undefined",
          },
        ],
      },
      {
        id: "h.undefined",
        kind: "handoff",
        to: "DEC-181",
        on: "a renewal window with no defined notice period or renewing terms",
        carries: [
          "the relationship, its term end and what the terms do say",
          "the explicit fact that no notice period or price was invented in order to proceed",
        ],
      },
      {
        id: "c.blockers",
        kind: "condition",
        asks: "Does an outstanding blocker prevent the renewal from being decided?",
        branches: [
          {
            label: "Blocked",
            when: "an unresolved obligation, dispute or eligibility problem stands in the way",
            to: "a.review",
          },
          {
            label: "Clear",
            when: "nothing outstanding prevents a decision",
            to: "c.model",
          },
        ],
      },
      {
        id: "c.model",
        kind: "condition",
        asks: "What does the renewal model require?",
        branches: [
          {
            label: "Auto-renew, requirements met",
            when: "the terms renew automatically and every condition for that is satisfied",
            to: "a.decided",
          },
          {
            label: "An explicit decision",
            when: "the terms require the counterparty to choose",
            to: "a.request",
          },
          {
            label: "Review first",
            when: "the terms require an internal decision before renewal can be offered",
            to: "a.review",
          },
        ],
      },
      {
        id: "a.request",
        kind: "action",
        does: "Put the renewal decision to whoever holds it, with the terms that would apply. Asking is not deciding - a renewal notice sent is a communication, and treating the send as the answer renews relationships nobody agreed to",
        writes: [{ field: "renewal_log", mode: "append" }],
        next: "w.decision",
        execution: "communication",
      },
      {
        id: "w.decision",
        kind: "wait",
        until: ["an authorized renewal decision is recorded"],
        onEvent: "c.decision",
        timeout: {
          after: "the last point at which the required notice period still allows a decision",
          reason:
            "the notice period is what makes the deadline real - past it, the terms themselves determine what happens, and pretending the decision is still open misrepresents the relationship",
        },
        onTimeout: "a.default",
        windowExtendsOnEngagement: false,
      },
      {
        id: "a.default",
        kind: "action",
        does: "Apply what the governing terms define as the outcome when no decision is made - which for some renewal models is renewal and for others is non-renewal. Record that no decision was made rather than recording a decision, because someone who did not answer did not agree",
        writes: [{ field: "renewal_log", mode: "append" }],
        next: "c.decision",
      },
      {
        id: "c.decision",
        kind: "condition",
        asks: "What is the outcome for the next term?",
        branches: [
          {
            label: "Renew",
            when: "the decision, or the terms' default, is to continue",
            to: "a.decided",
          },
          {
            label: "Do not renew",
            when: "the decision, or the terms' default, is to let the term end",
            to: "a.non-renew",
          },
        ],
      },
      {
        id: "a.review",
        kind: "action",
        does: "Record RENEWAL_REVIEW with what has to be settled. The relationship stays active on its current term throughout - a renewal under review is not a relationship in trouble",
        writes: [{ field: "renewal_log", mode: "append" }],
        next: "w.review",
      },
      {
        id: "w.review",
        kind: "wait",
        until: ["the review concludes with an authorized decision"],
        onEvent: "c.decision",
        timeout: {
          after: "the notice deadline",
          reason:
            "a review that outlives the notice period has removed the counterparty's ability to plan, whichever way it eventually goes",
        },
        onTimeout: "h.escalate",
        windowExtendsOnEngagement: false,
      },
      {
        id: "h.escalate",
        kind: "handoff",
        to: "OWN-55",
        on: "a renewal review outliving the notice period",
        carries: ["the relationship, its term end and what the review is waiting on"],
      },
      {
        id: "a.decided",
        kind: "action",
        does: "Record the renewal as decided, with the new term's dates and the terms that would apply. Decided is not renewed - the new term does not exist until its own requirements have been met, and a relationship can sit here and still lapse",
        writes: [{ field: "renewal_log", mode: "append" }],
        next: "h.execute",
      },
      {
        id: "h.execute",
        kind: "handoff",
        to: "SUB-164",
        on: "a renewal decided and ready for execution",
        carries: [
          "the decision, the new term's dates and its terms",
          "the explicit fact that the new term does not yet exist and its requirements have not been tested",
        ],
      },
      {
        id: "a.non-renew",
        kind: "action",
        does: "Record NON_RENEWING with the effective end being the current term's end. The relationship is still active and still governed by its current term - non-renewing is a decision about the next term and says nothing about this one",
        writes: [{ field: "renewal_log", mode: "append" }],
        next: "h.scheduled-end",
      },
      {
        id: "h.scheduled-end",
        kind: "handoff",
        to: "SUB-168",
        on: "a non-renewal scheduling an end at the current term's end",
        carries: [
          "the effective end date and the relationship version the decision was made against",
          "the explicit fact that a later renewal, resubscription or plan change supersedes this and must suppress it",
        ],
      },
    ],
    guardrails: [
      "Renewal eligible is not renewed.",
      "A renewal communication is not a renewal decision.",
      "Renewal notice periods and renewing terms are never invented.",
      "A relationship under renewal review stays active on its current term.",
      "A relationship with a cancellation already in motion, or with an active risk state, is not sent a routine renewal message. The lifecycle that already owns the person takes precedence, and a renewal reminder arriving during a cancellation reads as a system that is not paying attention.",
    ],
    reusableRule:
      "Renewal is a new term decision governed by the current relationship state and applicable renewal rules.",
  },

  /* ------------------------------------------------------------ SUB-164 */
  {
    id: "SUB-164",
    slug: "renewal-execution",
    category: "subscription",
    goal: "expiry-renewal",
    channels: [],
    name: "Renewal execution → financial and dependency check → new term active",
    purpose: "Make the new term exist, once the things it depends on have actually happened.",
    entity: {
      scope: "the renewal operation and the new term it would create",
      note: "The new term is created as a new term. The previous one keeps its dates, its price and its scope, because that is what any later question about the relationship is asked against.",
    },
    distinctFrom: [
      {
        journey: "SUB-163",
        because:
          "SUB-163 decides. This executes, and it is where renewals actually fail - on payment, on eligibility that moved, on a resource that is no longer available. A decision is not a term.",
      },
    ],
    entry: "t.authorized",
    nodes: [
      {
        id: "t.authorized",
        kind: "trigger",
        event: "renewal_authorized_for_execution",
        evidence: {
          requires: ["a renewal decided or scheduled, with the new term's dates and terms"],
          insufficientAlone: [
            "a renewal being eligible, which permits the decision rather than being it",
          ],
          source: "authoritative",
        },
        next: "a.dependencies",
      },
      {
        id: "a.dependencies",
        kind: "action",
        does: "Determine what the new term actually requires - payment, contract confirmation, updated eligibility, required verification, resource availability. Which of these apply comes from the relationship's own terms, and assuming payment is the only one renews contracts whose eligibility has lapsed",
        next: "c.financial",
      },
      {
        id: "c.financial",
        kind: "condition",
        asks: "Does the new term require a financial event?",
        branches: [
          {
            label: "It does",
            when: "the renewal carries a charge, a commitment or a financial obligation",
            to: "a.financial",
          },
          {
            label: "It does not",
            when: "the new term carries no financial requirement, or one already satisfied",
            to: "w.dependencies",
          },
        ],
      },
      {
        id: "a.financial",
        kind: "action",
        does: "Raise the renewal's financial obligation through the financial lifecycle, which owns whether it is created, due and satisfied. This journey keeps ownership of the new term and waits for that outcome rather than handing the term away - otherwise a failed payment leaves a renewal nobody is holding",
        writes: [{ field: "renewal_log", mode: "append" }],
        next: "w.dependencies",
      },
      {
        id: "w.dependencies",
        kind: "wait",
        until: [
          "every renewal dependency resolves successfully",
          "a renewal dependency fails authoritatively",
        ],
        onEvent: "c.resolved",
        timeout: {
          after: "the last point at which the new term could still start on time",
          reason:
            "a renewal that has not completed by its own start date has left the relationship between terms, which is a state that has to be named rather than waited through",
        },
        onTimeout: "c.blocker",
        windowExtendsOnEngagement: false,
      },
      {
        id: "c.resolved",
        kind: "condition",
        asks: "How did the dependencies resolve?",
        branches: [
          {
            label: "All satisfied",
            when: "every authoritative requirement for the new term is met",
            to: "a.new-term",
          },
          {
            label: "Something failed",
            when: "a dependency failed authoritatively",
            to: "c.blocker",
          },
        ],
      },
      {
        id: "c.blocker",
        kind: "condition",
        asks: "What is blocking the new term?",
        branches: [
          {
            label: "The renewal payment failed",
            when: "the financial requirement failed authoritatively",
            to: "h.payment-failure",
          },
          {
            label: "Recoverable, and not financial",
            when: "a non-financial dependency is missing and could still be supplied",
            to: "a.pending",
          },
          {
            label: "Cannot complete",
            when: "the new term cannot be created under any available resolution",
            to: "a.failed",
          },
        ],
      },
      {
        id: "h.payment-failure",
        kind: "handoff",
        to: "SUB-165",
        on: "a renewal blocked by an authoritative payment failure",
        carries: [
          "the relationship, the renewal and the failed obligation",
          "the explicit fact that the previous term's history is intact and the relationship has not terminated",
        ],
      },
      {
        id: "a.pending",
        kind: "action",
        does: "Record RENEWAL_PENDING with exactly which dependency is missing. Pending with a named cause can be acted on; pending with no cause becomes a relationship that quietly stops renewing",
        writes: [{ field: "renewal_log", mode: "append" }],
        next: "w.recovery",
      },
      {
        id: "w.recovery",
        kind: "wait",
        until: ["the blocking dependency clears"],
        onEvent: "a.new-term",
        timeout: {
          after: "the recovery window the governing terms allow",
          reason:
            "the terms define how long a relationship may sit between terms, and exceeding it is a non-renewal whether or not anyone says so",
        },
        onTimeout: "a.failed",
        windowExtendsOnEngagement: false,
      },
      {
        id: "a.new-term",
        kind: "action",
        does: "Create the new term as a new term, with its own dates, price and scope, and leave the previous term intact. Overwriting the old term's dates with the new ones erases that the relationship ran at a different price for a different period, which is the exact record anyone auditing a renewal is looking for",
        writes: [{ field: "relationship_log", mode: "append" }],
        next: "a.activate-term",
      },
      {
        id: "a.activate-term",
        kind: "action",
        does: "Record the new term ACTIVE from its start date. The relationship now has two terms in its history and one of them is running",
        writes: [{ field: "relationship_log", mode: "append" }],
        next: "c.scope",
      },
      {
        id: "c.scope",
        kind: "condition",
        asks: "Does the new term change the entitlement scope?",
        branches: [
          {
            label: "It changes",
            when: "the renewing terms grant more, less or different rights than the previous term",
            to: "h.entitlement",
          },
          {
            label: "Unchanged",
            when: "the new term grants exactly what the previous one did",
            to: "x.renewed",
          },
        ],
      },
      {
        id: "h.entitlement",
        kind: "handoff",
        to: "ACC-73",
        on: "a new term whose scope differs from the previous one",
        carries: [
          "the delta between the previous term's scope and the new one",
          "the effective date, so nothing is added or removed before the new term actually starts",
        ],
      },
      {
        id: "x.renewed",
        kind: "exit",
        state: "NEW_TERM_ACTIVE; the previous term is preserved in full",
        terminal: false,
        reEntry:
          "the next renewal window opens against this term and is a new cycle with its own decision and its own record",
      },
      {
        id: "a.failed",
        kind: "action",
        does: "Record the renewal as failed, with what prevented it. The relationship reaches its term end without a new term, which is a non-renewal reached by failure rather than by decision - and the two are worth distinguishing when someone asks why a customer left",
        writes: [{ field: "renewal_log", mode: "append" }],
        next: "h.non-renewal",
      },
      {
        id: "h.non-renewal",
        kind: "handoff",
        to: "SUB-170",
        on: "a term ending with no new term created",
        carries: [
          "the reason the renewal could not complete",
          "every previous term, intact, and whatever obligations were created while they ran",
        ],
      },
    ],
    guardrails: [
      "A renewal scheduled is not a renewal completed.",
      "A payment attempt is not renewal completion.",
      "The previous term is never overwritten with the new term's dates.",
    ],
    reusableRule:
      "A renewal becomes effective only after the requirements for the new term have actually been satisfied.",
  },

  /* ------------------------------------------------------------ SUB-165 */
  {
    id: "SUB-165",
    slug: "renewal-payment-failure",
    category: "subscription",
    goal: "expiry-renewal",
    channels: [],
    name: "Renewal payment failure → grace or recover → renew or lapse",
    purpose:
      "Decide what the relationship does while a failed renewal payment is being chased, without ending it by reflex.",
    entity: {
      scope: "the continuing relationship and the renewal obligation whose payment failed",
      note: "Two lifecycles running at once. The financial one is chasing money; this one is deciding what the counterparty can do in the meantime.",
    },
    distinctFrom: [
      {
        journey: "FIN-134",
        because:
          "FIN-134 classifies the payment failure and tries to collect. This decides what the relationship is while that happens - in grace, restricted, pending or lapsing - which is a question about the contract rather than about the money.",
      },
    ],
    entry: "t.failed",
    nodes: [
      {
        id: "t.failed",
        kind: "trigger",
        event: "renewal_payment_failed",
        evidence: {
          requires: ["an authoritative failure of a payment a renewal depends on"],
          insufficientAlone: [
            "a payment attempt erroring in transit, which is unknown rather than failed - and treating unknown as failed puts relationships into grace over payments that succeeded",
          ],
          source: "authoritative",
        },
        next: "a.recovery",
      },
      {
        id: "a.recovery",
        kind: "action",
        does: "Raise the failure into the payment recovery lifecycle, which owns classification and collection. This journey does not chase the money; it holds the relationship's state while that runs, which is why it does not hand the relationship away",
        writes: [{ field: "renewal_log", mode: "append" }],
        next: "c.policy",
      },
      {
        id: "c.policy",
        kind: "condition",
        asks: "Does governing policy define grace or lapse semantics for this relationship?",
        branches: [
          {
            label: "Defined",
            when: "policy states what state the relationship takes during recovery, what access it keeps and how long",
            to: "a.state",
          },
          {
            label: "Not defined",
            when: "no policy covers what happens between a failed renewal payment and a lapse",
            to: "h.undefined",
          },
        ],
      },
      {
        id: "h.undefined",
        kind: "handoff",
        to: "DEC-181",
        on: "a failed renewal payment with no defined grace or lapse semantics",
        carries: [
          "the relationship, the failed obligation and the recovery already under way",
          "the explicit fact that no grace period was invented - inventing one either cuts off someone entitled to continue or serves someone who is not",
        ],
      },
      {
        id: "a.state",
        kind: "action",
        does: "Apply the relationship state policy defines during recovery - ACTIVE_IN_GRACE, RENEWAL_PENDING, RESTRICTED or LAPSE_PENDING. What the counterparty keeps access to follows from that state and from policy, never from a default of leaving everything running or switching everything off",
        writes: [{ field: "relationship_log", mode: "append" }],
        next: "c.restrict",
      },
      {
        id: "c.restrict",
        kind: "condition",
        asks: "Does the recovery state restrict capability?",
        branches: [
          {
            label: "It restricts",
            when: "policy limits what the relationship can be used for during recovery",
            to: "a.restrict",
          },
          {
            label: "Full access continues",
            when: "policy keeps the relationship fully usable through the grace period",
            to: "w.recovery",
          },
        ],
      },
      {
        id: "a.restrict",
        kind: "action",
        does: "Raise the restriction through the access lifecycle, with the scope policy defines. What is switched off and how is owned there; what the relationship's contractual state is remains owned here",
        writes: [{ field: "relationship_log", mode: "append" }],
        next: "w.recovery",
      },
      {
        id: "w.recovery",
        kind: "wait",
        until: [
          "the payment is recovered",
          "an authorized alternate resolution is agreed",
        ],
        onEvent: "c.outcome",
        timeout: {
          after: "the grace deadline policy defines",
          reason:
            "the grace period is policy's own answer to how long this may run. Extending it is a decision nobody made, and shortening it takes back something the counterparty was granted",
        },
        onTimeout: "a.lapse",
        windowExtendsOnEngagement: false,
      },
      {
        id: "c.outcome",
        kind: "condition",
        asks: "How was the obligation resolved?",
        branches: [
          {
            label: "The payment was recovered",
            when: "the original obligation was satisfied authoritatively",
            to: "c.remaining",
          },
          {
            label: "An alternate resolution was authorized",
            when: "a different method, a partial arrangement or a waiver settled it",
            to: "a.alternate",
          },
        ],
      },
      {
        id: "a.alternate",
        kind: "action",
        does: "Record how the obligation was resolved other than by the original payment. The renewal proceeds on that basis and the record says which basis, because a term that renewed on a waiver is not the same fact as one that renewed on a payment",
        writes: [{ field: "renewal_log", mode: "append" }],
        next: "c.remaining",
      },
      {
        id: "c.remaining",
        kind: "condition",
        asks: "Are the remaining renewal requirements still valid?",
        branches: [
          {
            label: "Still valid",
            when: "eligibility, verification and the other new-term requirements still hold",
            to: "h.complete",
          },
          {
            label: "No longer valid",
            when: "something else the new term needed has lapsed while the payment was being recovered",
            to: "a.lapse",
          },
        ],
      },
      {
        id: "h.complete",
        kind: "handoff",
        to: "SUB-164",
        on: "a recovered renewal obligation with its other requirements intact",
        carries: [
          "how the obligation was resolved and when",
          "the relationship's state through the recovery, so the new term starts from a known position rather than from a gap",
        ],
      },
      {
        id: "a.lapse",
        kind: "action",
        does: "Record the outcome this relationship's own semantics define - LAPSED, EXPIRED or NON_RENEWED. These are different words for genuinely different things, and which one applies changes what the counterparty is told and what they can do next",
        writes: [{ field: "relationship_log", mode: "append" }],
        next: "h.end",
      },
      {
        id: "h.end",
        kind: "handoff",
        to: "SUB-170",
        on: "a renewal that lapsed after its recovery window closed",
        carries: [
          "the lapse reason and the term that ended",
          "the explicit instruction that a payment arriving after this point is reconciled against the relationship's current state rather than treated as having renewed a term that never started",
        ],
      },
    ],
    guardrails: [
      "A payment failure is not immediate termination.",
      "Grace periods are never invented.",
      "Access during grace follows governing policy rather than a default in either direction.",
      "A late payment is reconciled against the current relationship state, never applied retroactively.",
    ],
    reusableRule:
      "Renewal payment failure creates a recovery problem while the continuing relationship follows its defined grace or lapse semantics.",
  },

  /* ------------------------------------------------------------ SUB-166 */
  {
    id: "SUB-166",
    slug: "terms-change",
    category: "subscription",
    goal: "change-versioning",
    channels: [],
    name: "Plan or terms change request → validate → schedule, apply or reject",
    purpose:
      "Apply an authorized change to a running relationship at the right time, as a delta against whatever is actually there then.",
    entity: {
      scope: "the continuing relationship and the change request raised against it",
      note: "The request stores a delta and the relationship version it was authorized against. It never stores the resulting terms, because those depend on a relationship that will have moved. What changes here is what a term-bearing continuing relationship is authorized to run under. It does not own a change to the structural link between the entities merely because the same two parties are involved - that is REL-92.",
    },
    distinctFrom: [
      {
        journey: "ACC-73",
        because:
          "This changes the commercial relationship - the plan, the tier, the scope, the contractual terms. ACC-73 applies whatever entitlement delta results. One is what was agreed; the other is what is switched on.",
      },
      {
        journey: "REL-92",
        because:
          "This changes the authorized terms a continuing relationship runs under. REL-92 changes what the structural relationship between the entities means. A tier change leaves the person exactly as related to the organisation as they were, and a membership type changing leaves the plan exactly as it was priced.",
      },
    ],
    entry: "t.requested",
    nodes: [
      {
        id: "t.requested",
        kind: "trigger",
        event: "relationship_change_requested",
        evidence: {
          requires: [
            "an authorized request to change a running term-bearing relationship's plan, tier, scope or terms",
          ],
          insufficientAlone: [
            "someone asking about a different plan, which is a question rather than an authorized change",
            "a structural relationship between the entities changing type or state, which changes how they are related rather than what was agreed",
          ],
          source: "authoritative",
        },
        next: "a.capture",
      },
      {
        id: "a.capture",
        kind: "action",
        does: "Capture the current terms, the requested terms, the requested effective time, the scope delta and the reference to its financial impact. What is stored is the delta and the relationship version it was authorized against",
        writes: [{ field: "change_log", mode: "append" }],
        next: "c.allowed",
      },
      {
        id: "c.allowed",
        kind: "condition",
        asks: "Do the governing terms permit this change?",
        branches: [
          {
            label: "Permitted",
            when: "the terms allow a change of this kind at this point in the relationship",
            to: "c.timing",
          },
          {
            label: "Not permitted",
            when: "the terms rule it out - a minimum term, a locked tier, a contractual restriction",
            to: "a.reject",
          },
          {
            label: "The terms do not say",
            when: "nothing authoritative states whether this change is permitted",
            to: "h.undefined",
          },
        ],
      },
      {
        id: "h.undefined",
        kind: "handoff",
        to: "DEC-181",
        on: "a change request the governing terms do not address",
        carries: [
          "the current terms, the requested delta and what the terms do cover",
          "the explicit fact that no permission was inferred from the terms' silence",
        ],
      },
      {
        id: "a.reject",
        kind: "action",
        does: "Record the change as rejected, naming the term that rules it out. The relationship continues unchanged on its current terms",
        writes: [{ field: "change_log", mode: "append" }],
        next: "x.rejected",
      },
      {
        id: "x.rejected",
        kind: "exit",
        state: "change rejected; the current terms stand",
        terminal: false,
        reEntry:
          "the same change may become permitted at a different point in the relationship - at a term boundary, or after a minimum period - and is requested again then",
      },
      {
        id: "c.timing",
        kind: "condition",
        asks: "When does the change take effect?",
        branches: [
          {
            label: "Immediately",
            when: "the terms allow it now and the request asks for now",
            to: "a.validate-deps",
          },
          {
            label: "At a future effective time or the next cycle",
            when: "the terms defer it, or the request asks for a later date",
            to: "a.schedule",
          },
        ],
      },
      {
        id: "a.schedule",
        kind: "action",
        does: "Record SCHEDULED_CHANGE with the delta, the effective time and the relationship version it was authorized against. The delta is stored rather than the resulting terms, because what those terms would be depends on the relationship as it stands when the change lands",
        writes: [{ field: "change_log", mode: "append" }],
        next: "w.effective",
      },
      {
        id: "w.effective",
        kind: "wait",
        until: [
          "the relationship ends before the change lands",
          "the change is withdrawn",
        ],
        onEvent: "a.void",
        timeout: {
          after: "the change's effective time",
          reason:
            "reaching the effective time is what the wait exists for, and it is the point at which the delta is checked against the relationship rather than applied to it",
        },
        onTimeout: "a.revalidate",
        windowExtendsOnEngagement: false,
      },
      {
        id: "a.void",
        kind: "action",
        does: "Record the scheduled change as void, with why. A downgrade scheduled against a relationship that has since ended has nothing to apply to, and firing it anyway writes terms onto something that is no longer running",
        writes: [
          { field: "change_log", mode: "append" },
          { field: "suppressed_sends", mode: "append" },
        ],
        next: "x.void",
      },
      {
        id: "x.void",
        kind: "exit",
        state: "scheduled change voided before it took effect",
        terminal: false,
        reEntry:
          "the change can be requested again against whatever relationship exists now, and is evaluated on those terms",
      },
      {
        id: "a.revalidate",
        kind: "action",
        does: "Re-read the relationship at the effective time and check the delta still makes sense against it. A downgrade authorized in March, applied to a relationship upgraded twice since, produces terms nobody chose and an invoice nobody expects",
        next: "c.still-valid",
      },
      {
        id: "c.still-valid",
        kind: "condition",
        asks: "Does the delta still apply to the relationship as it now stands?",
        branches: [
          {
            label: "Still applies",
            when: "the relationship is on the version the change was authorized against, or the delta is unambiguous against the current one",
            to: "a.validate-deps",
          },
          {
            label: "Superseded",
            when: "the relationship has changed in a way that makes the delta ambiguous or contradictory",
            to: "h.review",
          },
        ],
      },
      {
        id: "h.review",
        kind: "handoff",
        to: "DEC-181",
        on: "a scheduled change whose base terms no longer exist",
        carries: [
          "the delta as authorized, the version it was authorized against and the relationship's current version",
          "the explicit fact that resolving the two is a decision rather than an execution, and no substitute terms were chosen here",
        ],
      },
      {
        id: "a.validate-deps",
        kind: "action",
        does: "Validate what the change requires - availability, eligibility, financial capacity, provisioning capability. A tier the relationship is not eligible for and a resource that cannot be supplied both stop the change at the same point",
        next: "c.deps",
      },
      {
        id: "c.deps",
        kind: "condition",
        asks: "Are the change's dependencies satisfied?",
        branches: [
          {
            label: "Satisfied",
            when: "everything the new terms require is in place",
            to: "a.apply",
          },
          {
            label: "Not satisfied",
            when: "a dependency the change needs is missing",
            to: "a.not-applied",
          },
        ],
      },
      {
        id: "a.not-applied",
        kind: "action",
        does: "Record the change as not applied, naming the dependency that blocked it, and leave the current terms in force. A half-applied change - new price, old scope - is worse than no change at all",
        writes: [{ field: "change_log", mode: "append" }],
        next: "x.not-applied",
      },
      {
        id: "x.not-applied",
        kind: "exit",
        state: "change not applied; the current terms remain in force unchanged",
        terminal: false,
        reEntry:
          "the change can be requested again once the blocking dependency is available",
      },
      {
        id: "a.apply",
        kind: "action",
        does: "Apply the delta as a new terms version, dated from its effective time. The prior terms stay in the record with the period they governed - rewriting them means last month's invoice no longer matches any terms the system holds",
        writes: [{ field: "relationship_log", mode: "append" }],
        next: "c.scope",
      },
      {
        id: "c.scope",
        kind: "condition",
        asks: "What does the applied delta touch?",
        branches: [
          {
            label: "The entitlement scope",
            when: "the change adds, removes or alters what the relationship grants",
            to: "h.entitlement",
          },
          {
            label: "Financial terms only",
            when: "the change alters price, billing or commitment without changing scope",
            to: "h.financial",
          },
          {
            label: "Neither",
            when: "the change alters administrative or contractual detail with no scope or financial effect",
            to: "x.applied",
          },
        ],
      },
      {
        id: "h.entitlement",
        kind: "handoff",
        to: "ACC-73",
        on: "an applied change that alters entitlement scope",
        carries: [
          "the scope delta and its effective time",
          "the explicit fact that this journey changed the agreement and did not switch anything on or off",
        ],
      },
      {
        id: "h.financial",
        kind: "handoff",
        to: "FIN-131",
        on: "an applied change with a financial consequence",
        carries: [
          "the financial delta, its effective time and the period it applies from",
          "the previous terms and the period they governed, so proration is calculated against what was actually in force",
        ],
      },
      {
        id: "x.applied",
        kind: "exit",
        state: "change applied as a new terms version; prior terms preserved",
        terminal: false,
        reEntry:
          "further changes are new requests evaluated against this version rather than against the original agreement",
      },
    ],
    guardrails: [
      "A change requested is not a change applied.",
      "Historical terms are never rewritten.",
      "A structural link changing type or state is not a plan or terms change merely because the same entities are involved.",
      "A scheduled upgrade or downgrade never executes against a relationship that has ended or materially changed without revalidation.",
    ],
    reusableRule:
      "Continuing relationship changes should apply an authorized delta at the correct effective time while preserving prior term history.",
  },

  /* ------------------------------------------------------------ SUB-167 */
  {
    id: "SUB-167",
    slug: "cancellation-request",
    category: "subscription",
    goal: "cancellation-termination",
    channels: [],
    name: "Cancellation request → determine effective end → schedule or cancel now",
    purpose:
      "Establish whether and when a relationship will end, while the current term keeps running until it does.",
    entity: {
      scope: "the continuing relationship and the cancellation request raised against it",
      note: "The request produces an effective end date. It does not produce an ended relationship, and between the two the relationship is entirely normal.",
    },
    distinctFrom: [
      {
        journey: "SUB-168",
        because:
          "This decides that the relationship will end and when. SUB-168 checks, at that date, whether the decision still applies to the relationship as it then is - which is a different question with a different failure mode.",
      },
    ],
    competition: {
      scope: "subscription",
      exclusionGroup: "relationship-continuity",
      precedence:
        "a cancellation in motion outranks a renewal decision on the same relationship",
      onLoss: "paused",
    },
    entry: "t.requested",
    nodes: [
      {
        id: "t.requested",
        kind: "trigger",
        event: "cancellation_requested",
        evidence: {
          requires: ["an authorized request to end a continuing relationship"],
          insufficientAlone: [
            "someone asking how to cancel, or viewing a cancellation page, which is intent rather than a request",
          ],
          source: "declared",
        },
        next: "a.determine",
      },
      {
        id: "a.determine",
        kind: "action",
        does: "Determine who holds the authority, the current term and state, what the relationship's cancellation semantics actually say, the effective end those semantics produce, and the obligations that already exist and will outlive it",
        writes: [{ field: "cancellation_log", mode: "append" }],
        next: "c.authority",
      },
      {
        id: "c.authority",
        kind: "condition",
        asks: "Does the requester hold the authority to cancel this relationship?",
        branches: [
          {
            label: "Authorized",
            when: "the requester is a party or holds the delegated right to end it",
            to: "c.policy",
          },
          {
            label: "Not established",
            when: "the requester's authority over this relationship is unclear or absent",
            to: "h.authority",
          },
        ],
      },
      {
        id: "h.authority",
        kind: "handoff",
        to: "DEC-181",
        on: "a cancellation requested by someone whose authority is not established",
        carries: [
          "the request, the requester and the relationship's parties",
          "the explicit fact that nothing about the relationship changed while this is resolved",
        ],
      },
      {
        id: "c.policy",
        kind: "condition",
        asks: "Are the relationship's cancellation semantics defined?",
        branches: [
          {
            label: "Defined",
            when: "the terms state when cancellation takes effect, what notice applies and what survives it",
            to: "c.blocker",
          },
          {
            label: "Not defined",
            when: "nothing authoritative states how this relationship ends",
            to: "h.undefined",
          },
        ],
      },
      {
        id: "h.undefined",
        kind: "handoff",
        to: "DEC-181",
        on: "a cancellation request against a relationship with no defined cancellation semantics",
        carries: [
          "the request, the current term and what the terms do say",
          "the explicit fact that no notice period or effective end was invented",
        ],
      },
      {
        id: "c.blocker",
        kind: "condition",
        asks: "Does a valid requirement block the cancellation?",
        branches: [
          {
            label: "Blocked",
            when: "a minimum term, an outstanding obligation or a regulatory notice stands in the way",
            to: "a.blocked",
          },
          {
            label: "Clear",
            when: "nothing valid prevents the relationship from ending",
            to: "c.timing",
          },
        ],
      },
      {
        id: "a.blocked",
        kind: "action",
        does: "Record the blocker explicitly, with what would clear it and when. A cancellation refused without a stated reason becomes a complaint, and then a dispute, over something that was usually a date the counterparty could have waited for",
        writes: [{ field: "cancellation_log", mode: "append" }],
        next: "x.blocked",
      },
      {
        id: "x.blocked",
        kind: "exit",
        state: "cancellation blocked; the relationship continues unchanged and the request stands",
        terminal: false,
        reEntry:
          "the request proceeds once the blocker clears. Nothing about the relationship changed in the meantime, including its entitlements",
      },
      {
        id: "c.timing",
        kind: "condition",
        asks: "When does the relationship end?",
        branches: [
          {
            label: "Immediately",
            when: "the semantics permit an immediate end and that is what was requested",
            to: "a.immediate",
          },
          {
            label: "At the end of the current term",
            when: "the semantics defer the end to the term boundary",
            to: "a.schedule",
          },
        ],
      },
      {
        id: "a.immediate",
        kind: "action",
        does: "Record the effective end as now, under the semantics that permit it, together with what remains owed on both sides",
        writes: [{ field: "cancellation_log", mode: "append" }],
        next: "h.end",
      },
      {
        id: "h.end",
        kind: "handoff",
        to: "SUB-170",
        on: "a cancellation taking effect immediately",
        carries: [
          "the effective end, the reason and the authority",
          "the obligations created while the relationship was active, which end with it only if their own terms say so",
        ],
      },
      {
        id: "a.schedule",
        kind: "action",
        does: "Record NON_RENEWING or CANCELLATION_SCHEDULED with the effective end, and leave the relationship ACTIVE. The current term keeps running and every entitlement it grants keeps working until that date - cutting access at the moment of request bills someone for a period they cannot use, and turns a clean exit into a refund claim",
        writes: [{ field: "cancellation_log", mode: "append" }],
        next: "h.scheduled",
      },
      {
        id: "h.scheduled",
        kind: "handoff",
        to: "SUB-168",
        on: "a cancellation scheduled for a future effective end",
        carries: [
          "the effective end and the relationship version the cancellation was authorized against",
          "the explicit fact that the relationship is fully active until then, and that a later renewal, change or resubscription supersedes this",
        ],
      },
    ],
    guardrails: [
      "A cancellation requested is not a relationship cancelled.",
      "Non-renewing is not currently inactive.",
      "Current entitlement is never ended early when the cancellation is end-of-term.",
      "Cancellation semantics are never invented.",
    ],
    reusableRule:
      "Cancellation determines whether and when a continuing relationship will end; the relationship remains governed by its current term until that effective end occurs.",
  },

  /* ------------------------------------------------------------ SUB-168 */
  {
    id: "SUB-168",
    slug: "scheduled-termination",
    category: "subscription",
    goal: "cancellation-termination",
    channels: [],
    name: "Scheduled cancellation → revalidate at effective time → end or preserve",
    purpose:
      "Stop a scheduled end from executing against a relationship the counterparty has since chosen to keep.",
    entity: {
      scope: "the continuing relationship and the scheduled termination standing against it",
      note: "The termination carries the relationship version it was authorized against. Comparing that version against the current one is the whole job.",
    },
    distinctFrom: [
      {
        journey: "SUB-167",
        because:
          "SUB-167 decides the end. This is the guard between that decision and its execution, months later, against a relationship that may have been renewed, upgraded or resubscribed in between.",
      },
    ],
    entry: "t.effective",
    nodes: [
      {
        id: "t.effective",
        kind: "trigger",
        event: "scheduled_cancellation_effective_time_reached",
        evidence: {
          requires: ["a scheduled termination whose effective time has arrived"],
          source: "authoritative",
        },
        next: "a.reread",
      },
      {
        id: "a.reread",
        kind: "action",
        does: "Re-read the relationship from its authoritative current state, including its version. What is compared is the relationship as it is now against the version the cancellation was authorized against - not against the copy the scheduled job is carrying",
        next: "c.valid",
      },
      {
        id: "c.valid",
        kind: "condition",
        asks: "Is the cancellation still valid against the relationship's current version?",
        branches: [
          {
            label: "Still valid",
            when: "nothing since the scheduling has superseded the decision to end",
            to: "a.obligations",
          },
          {
            label: "Superseded",
            when: "a reactivation, resubscription, plan change or later renewal decision has overtaken it",
            to: "a.suppress",
          },
        ],
      },
      {
        id: "a.suppress",
        kind: "action",
        does: "Record the scheduled termination as suppressed, naming what superseded it. Executing it would end a relationship the counterparty has since chosen to keep, and they would find out by losing access to something they had just paid for",
        writes: [
          { field: "cancellation_log", mode: "append" },
          { field: "suppressed_sends", mode: "append" },
        ],
        next: "x.suppressed",
      },
      {
        id: "x.suppressed",
        kind: "exit",
        state: "stale termination suppressed; the relationship continues on its current version",
        terminal: false,
        reEntry:
          "a fresh cancellation against the current relationship is a new decision with its own effective end. The suppressed one stays in the record as something that was decided and then overtaken",
      },
      {
        id: "a.obligations",
        kind: "action",
        does: "Determine what remains owed at the end - open fulfillment, unbilled usage, outstanding payments, commitments made while the relationship was active. This is established before the end rather than discovered after it",
        writes: [{ field: "cancellation_log", mode: "append" }],
        next: "a.end",
      },
      {
        id: "a.end",
        kind: "action",
        does: "Record the terminal state the relationship's semantics define - ENDED, CANCELLED or EXPIRED. The whole history stays: every term, every renewal, every suspension and every price it ran at. A termination that deletes the relationship removes the answer to every question anyone will later ask about it",
        writes: [{ field: "relationship_log", mode: "append" }],
        next: "h.end",
      },
      {
        id: "h.end",
        kind: "handoff",
        to: "SUB-170",
        on: "a scheduled termination executing against a still-valid cancellation",
        carries: [
          "the end reason, the effective end and the final term",
          "the obligations identified as surviving the end, each to be resolved on its own lifecycle",
        ],
      },
    ],
    guardrails: [
      "A scheduled cancellation is version-aware.",
      "A reactivation, resubscription or change after scheduling invalidates the old cancellation.",
      "Termination never deletes relationship history.",
    ],
    reusableRule:
      "Scheduled termination should execute only if the cancellation remains valid against the relationship's current authoritative version.",
  },

  /* ------------------------------------------------------------ SUB-169 */
  {
    id: "SUB-169",
    slug: "relationship-suspension",
    category: "subscription",
    goal: "suspension-restoration",
    channels: [],
    name: "Suspension or hold → restrict relationship → restore or end",
    purpose:
      "Hold a relationship in a state where it cannot operate normally and has not ended.",
    entity: {
      scope: "the continuing relationship and the suspension standing against it",
      note: "The relationship keeps existing, keeps its term and, unless policy says otherwise, keeps counting toward its own renewal.",
    },
    distinctFrom: [
      {
        journey: "ACC-78",
        because:
          "This is the commercial relationship's suspension state. ACC-78 is what happens to capability and access as a result. A relationship can be suspended for reasons that restrict nothing, and access can be suspended without the contract changing at all.",
      },
    ],
    entry: "t.condition",
    nodes: [
      {
        id: "t.condition",
        kind: "trigger",
        event: "relationship_suspension_condition",
        evidence: {
          requires: [
            "an authoritative suspension or hold condition - financial, administrative, security, eligibility, operational or otherwise policy-defined",
          ],
          insufficientAlone: [
            "a risk signal, which is a reason to look rather than a decision to suspend",
            "a single failed payment, which has its own recovery lifecycle before it reaches this one",
          ],
          source: "authoritative",
        },
        next: "a.record",
      },
      {
        id: "a.record",
        kind: "action",
        does: "Record the reason, the scope, the effective time, what behaviour remains allowed, and the condition that would restore it. A suspension with no stated restoration condition has no way out, and becomes a termination nobody decided and nobody can point to",
        writes: [{ field: "relationship_log", mode: "append" }],
        next: "c.dates",
      },
      {
        id: "c.dates",
        kind: "condition",
        asks: "Does governing policy move the renewal or end dates during suspension?",
        branches: [
          {
            label: "Policy moves them",
            when: "the terms explicitly extend or pause the relationship's dates while suspended",
            to: "a.adjust",
          },
          {
            label: "Policy leaves them",
            when: "the terms say nothing about pausing, or explicitly keep the dates fixed",
            to: "a.keep",
          },
        ],
      },
      {
        id: "a.adjust",
        kind: "action",
        does: "Apply the adjustment policy defines, recording it as an adjustment with its basis rather than silently editing the term. The dates moved because a rule moved them, and the record has to say which rule",
        writes: [{ field: "relationship_log", mode: "append" }],
        next: "a.restrict",
      },
      {
        id: "a.keep",
        kind: "action",
        does: "Leave the renewal and end dates where they are. Silently pushing them out extends a relationship nobody agreed to extend, and it surfaces months later as a charge the counterparty did not expect on a date they did not know about",
        writes: [{ field: "relationship_log", mode: "append" }],
        next: "a.restrict",
      },
      {
        id: "a.restrict",
        kind: "action",
        does: "Record SUSPENDED and raise whatever capability restriction the suspension calls for through the access lifecycle, which owns what is switched off and how. This journey owns the relationship's contractual state; suspended is not cancelled, and the relationship survives this entirely",
        writes: [{ field: "relationship_log", mode: "append" }],
        next: "w.suspension",
      },
      {
        id: "w.suspension",
        kind: "wait",
        until: [
          "the suspension reason is resolved",
          "a terminal decision is taken on the relationship",
        ],
        onEvent: "c.outcome",
        timeout: {
          after: "the maximum suspension duration policy defines",
          reason:
            "an indefinite suspension is a termination without a decision. Reaching the limit forces the question rather than letting the relationship sit unusable and un-ended",
        },
        onTimeout: "h.review",
        windowExtendsOnEngagement: false,
      },
      {
        id: "h.review",
        kind: "handoff",
        to: "DEC-181",
        on: "a suspension reaching its maximum duration undecided",
        carries: [
          "the suspension reason, its age and the restoration condition that was never met",
          "the explicit fact that the relationship was neither restored nor ended, and one of the two now has to be chosen",
        ],
      },
      {
        id: "c.outcome",
        kind: "condition",
        asks: "How did the suspension resolve?",
        branches: [
          {
            label: "The reason was resolved",
            when: "the stated restoration condition is authoritatively met",
            to: "a.revalidate",
          },
          {
            label: "A terminal decision was taken",
            when: "the relationship is to end rather than resume",
            to: "h.end",
          },
        ],
      },
      {
        id: "a.revalidate",
        kind: "action",
        does: "Re-read the relationship's current terms and rebuild capability from them. Restoring from a snapshot taken at suspension gives back an entitlement the relationship may no longer include - the plan may have changed, the term may have renewed at a different scope, and a suspension lasting months usually spans at least one of those",
        next: "c.still",
      },
      {
        id: "c.still",
        kind: "condition",
        asks: "Does the relationship still exist and still support restoration?",
        branches: [
          {
            label: "It does",
            when: "the relationship is intact and its current terms support resuming",
            to: "a.restore",
          },
          {
            label: "It does not",
            when: "the relationship ended, lapsed or expired while suspended",
            to: "h.end",
          },
        ],
      },
      {
        id: "a.restore",
        kind: "action",
        does: "Record ACTIVE again and raise the capability restoration through the access lifecycle, built from the relationship's current terms rather than from what it held before",
        writes: [{ field: "relationship_log", mode: "append" }],
        next: "x.restored",
      },
      {
        id: "x.restored",
        kind: "exit",
        state: "restored to ACTIVE on current terms",
        terminal: false,
        reEntry:
          "a further suspension is a new suspension with its own reason and its own restoration condition. The previous one stays in the record",
      },
      {
        id: "h.end",
        kind: "handoff",
        to: "SUB-170",
        on: "a suspended relationship that will not resume",
        carries: [
          "the suspension reason and how it resolved into an ending",
          "the relationship's full history, which the end preserves rather than replaces",
        ],
      },
    ],
    guardrails: [
      "Suspended is not cancelled.",
      "A suspension never silently resets renewal or end dates unless governing policy explicitly does so.",
      "Restoration uses current terms rather than a historical snapshot.",
      "A suspension always states the condition that would restore it.",
    ],
    reusableRule:
      "Suspension temporarily limits a continuing relationship without ending it, while restoration depends on current valid relationship state.",
  },

  /* ------------------------------------------------------------ SUB-170 */
  {
    id: "SUB-170",
    slug: "continuing-relationship-end",
    category: "subscription",
    goal: "cancellation-termination",
    channels: [],
    name: "Relationship end → final reconciliation → former or expired state",
    purpose:
      "Stop what the relationship was granting, while everything it created keeps its own lifecycle.",
    entity: {
      scope: "the ended continuing relationship and the state that depended on it",
      note: "The relationship record survives its own ending. The end is a state it reaches, not a deletion of what it was. What ends here is a term. The structural links between the same parties are untouched by it, and removing one of those is a separate decision owned by REL-93.",
    },
    distinctFrom: [
      {
        journey: "TRM-106",
        because:
          "A subscription, contract or membership ends here. TRM-106 closes the account relationship entirely. Most people who leave a plan keep their account, and chaining the two treats cancelling a subscription as asking to be removed.",
      },
      {
        journey: "REL-93",
        because:
          "REL-93 ends a structural link between two entities, and what stops is what depended on the link existing. This ends a term, and what stops is what the term was granting. Someone can leave an organisation while the subscription they paid for personally keeps running, and a policy can expire while the person stays exactly as related to the organisation as before.",
      },
    ],
    entry: "t.end",
    nodes: [
      {
        id: "t.end",
        kind: "trigger",
        event: "relationship_end_effective",
        evidence: {
          requires: [
            "an authoritative end of a term-bearing continuing relationship taking effect, by cancellation, non-renewal, expiry, termination or lapse",
          ],
          insufficientAlone: [
            "a cancellation requested, which sets a date rather than reaching one",
            "a payment failing, which may or may not ever become an ending",
            "a structural relationship between the parties ending, which removes a link rather than a term",
          ],
          source: "authoritative",
        },
        next: "a.record",
      },
      {
        id: "a.record",
        kind: "action",
        does: "Record the end reason, the effective end, the final term and the authority that ended it. Which of the five causes it was is kept - cancelled, not renewed, expired, terminated and lapsed mean different things to whoever reads this afterwards, and to what the counterparty can do next",
        writes: [{ field: "relationship_log", mode: "append" }],
        next: "a.stop",
      },
      {
        id: "a.stop",
        kind: "action",
        does: "Stop future relationship-dependent activity - scheduled renewals, recurring deliveries, upcoming charges, queued relationship-scoped communications. What stops is the future. Nothing already delivered or already owed is touched",
        writes: [
          { field: "relationship_log", mode: "append" },
          { field: "suppressed_sends", mode: "append" },
        ],
        next: "a.entitlement-loss",
      },
      {
        id: "a.entitlement-loss",
        kind: "action",
        does: "Raise the entitlement withdrawal through the entitlement lifecycle rather than switching anything off here. Which rights survive an ending and which do not is a property of the entitlements themselves, and a relationship record deciding it locally will eventually disagree with the entitlement lifecycle about who can do what",
        writes: [{ field: "relationship_log", mode: "append" }],
        next: "a.wind-down",
      },
      {
        id: "a.wind-down",
        kind: "action",
        does: "Raise the wind-down each dependent area needs - deprovisioning, final billing, any refund or credit due, open fulfillment, and data retention where it applies. Each runs on its own lifecycle and reaches its own conclusion; none of them is implemented here",
        writes: [{ field: "relationship_log", mode: "append" }],
        next: "c.obligations",
      },
      {
        id: "c.obligations",
        kind: "condition",
        asks: "Do valid obligations created while the relationship was active remain?",
        branches: [
          {
            label: "They remain",
            when: "open orders, unpaid amounts, refunds due, disputes or remedies created during the term are still live",
            to: "a.preserve",
          },
          {
            label: "Nothing remains",
            when: "everything created during the term has already resolved",
            to: "c.complete",
          },
        ],
      },
      {
        id: "a.preserve",
        kind: "action",
        does: "Preserve those obligations and let them resolve on their own lifecycles. An order placed while the subscription was live is still owed, a refund still due is still due, and a dispute still open is still open. Ending stops future rights, and does not cancel commitments already made in either direction",
        writes: [{ field: "relationship_log", mode: "append" }],
        next: "c.complete",
      },
      {
        id: "c.complete",
        kind: "condition",
        asks: "Are the relationship-specific operational obligations complete?",
        branches: [
          {
            label: "Complete",
            when: "the wind-down this relationship itself required has finished",
            to: "a.terminal",
          },
          {
            label: "Still running",
            when: "deprovisioning, final billing or another relationship-scoped wind-down is still in progress",
            to: "w.winddown",
          },
        ],
      },
      {
        id: "w.winddown",
        kind: "wait",
        until: ["the relationship-specific wind-down completes"],
        onEvent: "a.terminal",
        timeout: {
          after: "the wind-down window",
          reason:
            "a relationship stuck mid-wind-down is neither active nor former, and everything downstream that asks which one it is gets no answer",
        },
        onTimeout: "h.escalate",
        windowExtendsOnEngagement: false,
      },
      {
        id: "h.escalate",
        kind: "handoff",
        to: "OWN-55",
        on: "a relationship wind-down outliving its window",
        carries: ["the ended relationship and which parts of the wind-down have not completed"],
      },
      {
        id: "a.terminal",
        kind: "action",
        does: "Record the terminal relationship state its own semantics define - FORMER, EXPIRED or TERMINATED. This is the relationship ending. It is not the account closing and it is not the data being deleted; both of those are separate decisions, with their own authority and their own lifecycles, and neither follows from this one",
        writes: [{ field: "relationship_log", mode: "append" }],
        next: "x.former",
      },
      {
        id: "x.former",
        kind: "exit",
        state: "FORMER, EXPIRED or TERMINATED; the account, the history and the surviving obligations all stand",
        terminal: false,
        reEntry:
          "a new subscription, contract or membership is a new relationship rather than this one resuming. Its history remains readable, and everything it legitimately created during its term remains owed until its own lifecycle resolves it",
      },
    ],
    guardrails: [
      "A relationship ending is not an account closure.",
      "A relationship ending is not data deletion.",
      "A relationship ending is not the removal of a structural link. The parties can stay exactly as connected as they were, and unlinking them is a decision nobody made here.",
      "A relationship ending never erases historical entitlements, payments or fulfilled obligations.",
      "Commitments created while active are reconciled separately and can outlive the relationship.",
    ],
    reusableRule:
      "Ending a continuing relationship stops future relationship-dependent rights and obligations while preserving and resolving commitments legitimately created during the active term.",
  },
  {
    id: "SUB-262",
    slug: "cancellation-wind-down-notice",
    category: "subscription",
    goal: "cancellation-termination",
    channels: ["email", "in-app"],
    name: "Cancellation confirmed → wind-down window → access ends or customer returns",
    purpose:
      "Carry somebody through the period between deciding to leave and actually losing access, so the end date is never a surprise and returning stays possible right up to it.",
    entity: {
      scope: "the cancelled relationship plus its effective end date",
      note: "The wind-down belongs to this cancellation. A second cancellation after a reactivation is a new instance with its own window.",
    },
    distinctFrom: [
      {
        journey: "RET-28",
        because:
          "RET-28 runs before the decision and may offer an alternative. This starts once cancellation is confirmed, and never re-litigates it.",
      },
      {
        journey: "SUB-167",
        because:
          "SUB-167 establishes whether and when the relationship ends. This is what the customer is told across that window.",
      },
    ],
    entry: "t.cancelled",
    nodes: [
      {
        id: "t.cancelled",
        kind: "trigger",
        event: "cancellation_confirmed",
        evidence: {
          requires: [
            "an authoritative cancellation recorded against the relationship",
            "an effective end date",
          ],
          insufficientAlone: [
            "a stated intention to cancel",
            "a failed payment",
            "a support conversation about leaving",
          ],
          source: "authoritative",
        },
        next: "a.confirm",
      },
      {
        id: "a.confirm",
        kind: "action",
        does: "Confirm the cancellation, the exact date access ends, and what remains available until then. Paid-for access is not cut short because somebody cancelled early, and saying so is what stops the immediate 'have I lost it already' contact",
        next: "c.window",
        execution: "communication",
      },
      {
        id: "c.window",
        kind: "condition",
        asks: "Is there a meaningful window before access ends?",
        branches: [
          {
            label: "Window remains",
            when: "the effective end date is far enough out that a reminder before it would still be useful",
            to: "w.window",
          },
          {
            label: "Ends immediately",
            when: "access ends at once or too soon for a further message to arrive in time",
            to: "c.obligations",
          },
        ],
      },
      {
        id: "w.window",
        kind: "wait",
        until: [
          "the cancellation is withdrawn",
          "the effective end date is reached",
        ],
        onEvent: "c.withdrawn",
        timeout: {
          after: "the effective end date",
          reason: "the window closing is the event this journey exists to mark",
        },
        onTimeout: "a.ending",
        windowExtendsOnEngagement: false,
      },
      {
        id: "c.withdrawn",
        kind: "condition",
        asks: "Did they withdraw the cancellation?",
        branches: [
          {
            label: "Withdrawn",
            when: "an authoritative reactivation or withdrawal is recorded before the end date",
            to: "x.returned",
          },
          {
            label: "Still ending",
            when: "the relationship is still due to end",
            to: "a.ending",
          },
        ],
      },
      {
        id: "x.returned",
        kind: "exit",
        state: "cancellation withdrawn, relationship continues",
        terminal: false,
        reEntry: "a later cancellation starts a new wind-down",
      },
      {
        id: "a.ending",
        kind: "action",
        does: "Say that access ends shortly and what will and will not survive it - exports, history, outstanding obligations. This is information the person needs whether or not they intend to come back",
        next: "c.obligations",
        execution: "communication",
      },
      {
        id: "c.obligations",
        kind: "condition",
        asks: "Does anything outlive the relationship?",
        branches: [
          {
            label: "Obligations remain",
            when: "an outstanding balance, a return, a retention period or an external subscription survives the end date",
            to: "h.obligations",
          },
          {
            label: "Nothing outstanding",
            when: "the relationship ends cleanly",
            to: "x.ended",
          },
        ],
      },
      {
        id: "h.obligations",
        kind: "handoff",
        to: "SUB-170",
        on: "a cancelled relationship with obligations that continue past its end",
        carries: [
          "the end date and what was already communicated about it",
          "which obligations survive and who owns each",
        ],
      },
      {
        id: "x.ended",
        kind: "exit",
        state: "ended with nothing outstanding",
        terminal: false,
        reEntry: "a former customer returning enters through acquisition or reactivation, not here",
      },
    ],
    guardrails: [
      "The cancellation is never re-litigated. A save attempt after the decision is a different journey and belongs before this one.",
      "Paid-for access runs to its end date. Cancelling early does not shorten it.",
      "The end date is stated in the first message and never moves silently.",
      "Withdrawal exits the journey immediately - a reminder that access is ending, sent to somebody who has just stayed, is worse than sending nothing.",
    ],
    reusableRule:
      "The period between deciding to leave and leaving is still a relationship, and it is the one where being told the truth matters most.",
  },
];
