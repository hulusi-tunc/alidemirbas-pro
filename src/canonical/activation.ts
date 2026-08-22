import type { CanonicalJourney, OrchestrationRule } from "./types";

/* CATEGORY 2 - ACTIVATION, ONBOARDING & EARLY VALUE

   What happens between entering something and getting anything out of it.

   The category exists because four states get collapsed into one word more
   often than any others in lifecycle work:

     ENTRY      an account, trial or subscription exists
     SETUP      the work needed before the thing can produce value is done
     ACTIVATION the thing has produced value once, for real
     ADOPTION   it keeps producing value, repeatedly

   Each arrow between those is a different problem, and each of the journeys
   here owns exactly one of them. ACT-11 decides how much work the arrow from
   entry to setup will take. ACT-12 walks it. ACT-13 handles the case where it
   is blocked by one named thing. ACT-14 handles the case where it is not
   blocked by anything nameable and the person is simply struggling. ACT-15
   and ACT-16 are the two halves of crossing into activation - what the person
   experiences, and what the system has to stop doing. ACT-17 and ACT-18 own
   the arrow to adoption in its working and failing forms.

   Two of these send nothing. ACT-16 exists to invalidate messages, and ACT-13
   spends most of its life waiting on something that is not a message at all. */

export const ACTIVATION_RULES: readonly OrchestrationRule[] = [
  {
    id: "ACT-R1",
    scope: "activation",
    rule: "Entry, setup, activation, first value and adoption are five separate states. Reaching one never implies the next.",
    because:
      "Each collapse has its own failure. Treating entry as activation congratulates people who have done nothing; treating setup as value measures our own checklist; treating one use as adoption declares a habit after a single instance.",
  },
  {
    id: "ACT-R2",
    scope: "activation",
    rule: "Activation is defined by an authoritative event in which the product produced value, and by nothing else.",
    because:
      "Every cheaper definition is available first - a login, a completed checklist, a clicked email - so without this rule one of them becomes the definition by default, and every downstream number inherits it.",
  },
  {
    id: "ACT-R3",
    scope: "activation",
    rule: "Onboarding responds to progress, not to elapsed time. A fixed day-one, day-three, day-seven schedule is not onboarding.",
    because:
      "A calendar sequence tells someone who finished on day one to finish, and tells someone stuck on step two about step five. Both are the same bug: the message was chosen before the state was read.",
  },
  {
    id: "ACT-R4",
    scope: "activation",
    rule: "Once activation occurs, every onboarding action still pending is invalidated, including sends already queued.",
    because:
      "The setup reminder that arrives after the person has already succeeded is the single most expensive message in this category - it says plainly that nothing was watching.",
  },
  {
    id: "ACT-R5",
    scope: "activation",
    rule: "Assistance is offered on evidence of effort without progress. Activity volume alone never triggers it.",
    because:
      "Heavy usage with real progress looks identical to heavy usage with none if only the count is read, and the first group is exactly who should not be interrupted.",
  },
  {
    id: "ACT-R6",
    scope: "activation",
    rule: "A declared role or use-case and a behaviourally inferred one are stored separately and stay distinguishable.",
    because:
      "Inference written into the field that holds declared answers cannot be told apart from something the person actually said, and the mistake is unrecoverable once it is written.",
  },
  {
    id: "ACT-R7",
    scope: "activation",
    rule: "Adoption expectations follow the intended usage pattern of the product. Absence of use is only a signal against a pattern that predicted use.",
    because:
      "A tool used twice a year is not stalling in month three, and a stall model built on a daily product will report every seasonal user as failing.",
  },
  {
    id: "ACT-R8",
    scope: "activation",
    rule: "Onboarding and adoption journeys carry explicit exits and handoffs. Neither is allowed to be open-ended.",
    because:
      "Without a stated end, an onboarding that never activates simply keeps running, and the person stays in a state the business has already stopped believing in.",
  },
  {
    id: "ACT-R9",
    scope: "activation",
    rule: "Where a person or an open support case is already working the same blocker, automated rescue for that blocker is suppressed.",
    because:
      "Two channels chasing one problem contradict each other in front of the customer, and the automated one is always the one that does not know the current state.",
  },
  {
    id: "ACT-R10",
    scope: "activation",
    rule: "Engagement with a message is never activation and never adoption. Opens and clicks measure the message.",
    because:
      "It is the same substitution ACQ-R4 forbids on the acquisition side, and it reappears here because the events that would prove real activation are the harder ones to instrument.",
  },
];

export const ACTIVATION_JOURNEYS: readonly CanonicalJourney[] = [
  /* ------------------------------------------------------------ ACT-11 */
  {
    id: "ACT-11",
    slug: "onboarding-route-selection",
    category: "activation",
    name: "New entry → onboarding route → appropriate path",
    purpose:
      "Choose the onboarding path from the work actually required to reach value, before any of that work starts.",
    entity: {
      scope: "person, account, subscription or trial - the thing that was entered",
      note: "One entry, one route. A second subscription on the same account is a second instance with its own route, because its setup work is its own.",
    },
    distinctFrom: [
      {
        journey: "ACT-19",
        because:
          "This routes on the work required, which is usually readable from the account itself. ACT-19 fires only where a named role or use-case is missing and the answer would change the path.",
      },
    ],
    entry: "t.entry",
    nodes: [
      {
        id: "t.entry",
        kind: "trigger",
        event: "authoritative_lifecycle_entry",
        evidence: {
          requires: [
            "a recorded entry: account created, trial started, subscription started, or customer onboarding started",
          ],
          insufficientAlone: [
            "a signup form submitted but not completed",
            "an invitation sent but not accepted",
          ],
          source: "authoritative",
        },
        next: "a.context",
      },
      {
        id: "a.context",
        kind: "action",
        does: "Read the onboarding context: the declared goal, the role, the product or use-case, the setup complexity, the account or organisation type, any implementation requirement, and any stated need for assistance. Plan tier is not read as a proxy for any of these",
        writes: [{ field: "onboarding_context", mode: "set" }],
        next: "c.assisted",
      },
      {
        id: "c.assisted",
        kind: "condition",
        asks: "Does reaching value here require assisted onboarding?",
        branches: [
          {
            label: "Assisted",
            when: "the setup work genuinely needs a person: an implementation, a migration, a configuration the account cannot complete alone, or an explicit request for help",
            to: "a.assisted",
          },
          {
            label: "Self-service",
            when: "the setup work is within what the account can complete on its own, whatever its value or plan",
            to: "a.self-service",
          },
        ],
      },
      {
        id: "a.assisted",
        kind: "action",
        does: "Record the assisted route and raise the internal task that gives this onboarding a human owner - the route is a property of the onboarding, carried into every step that follows",
        writes: [{ field: "onboarding_route", mode: "set" }],
        next: "c.prerequisite",
      },
      {
        id: "a.self-service",
        kind: "action",
        does: "Record the self-service route, which stays revisable: discovering later that a person is needed is a re-route, not a failure",
        writes: [{ field: "onboarding_route", mode: "set" }],
        next: "c.prerequisite",
      },
      {
        id: "c.prerequisite",
        kind: "condition",
        asks: "Is a critical prerequisite missing before onboarding can start at all?",
        branches: [
          {
            label: "Blocked at the start",
            when: "something named and mandatory is absent - a verification, an access grant, a required party - and nothing meaningful can proceed without it",
            to: "h.requirement",
          },
          {
            label: "Clear to start",
            when: "no mandatory prerequisite is outstanding; incomplete optional fields do not count",
            to: "h.progress",
          },
        ],
      },
      {
        id: "h.requirement",
        kind: "handoff",
        to: "ACT-13",
        on: "a mandatory prerequisite missing before onboarding can begin",
        carries: [
          "the named requirement, not a general sense that setup is unfinished",
          "the chosen route, since who resolves the requirement depends on it",
          "the onboarding context already gathered",
        ],
      },
      {
        id: "h.progress",
        kind: "handoff",
        to: "ACT-12",
        on: "a route chosen and nothing blocking the start",
        carries: [
          "the chosen route and why it was chosen",
          "the onboarding context, so the first step does not re-ask what was already known",
        ],
      },
    ],
    guardrails: [
      "Plan tier is not onboarding complexity. A large customer with simple setup does not need an implementation, and a small one with an integration does.",
      "A high-value account does not automatically get human assistance. Value decides how much the outcome matters, not how much work reaching it takes.",
      "The route follows the setup and use-case actually in front of us, not who the account is.",
    ],
    reusableRule:
      "Onboarding should be routed according to the work required to reach value, not merely according to who entered.",
  },

  /* ------------------------------------------------------------ ACT-12 */
  {
    id: "ACT-12",
    slug: "onboarding-progress-next-step",
    category: "activation",
    name: "Onboarding progress → next best setup step → activation",
    purpose:
      "Advance onboarding from the state the setup record actually reports, one useful step at a time, until activation or the window ends.",
    entity: {
      scope: "person or account plus the onboarding instance",
      note: "Progress is held against the instance. A second onboarding for a different product does not inherit the first one's completed steps.",
    },
    competition: {
      scope: "person",
      exclusionGroup: "lifecycle-stage",
      precedence:
        "below the authoritative activation event, which supersedes it wherever it sits",
      onLoss: "superseded",
    },
    entry: "t.active",
    nodes: [
      {
        id: "t.active",
        kind: "trigger",
        event: "onboarding_active_without_activation",
        evidence: {
          requires: [
            "an onboarding instance that is open and an activation event that has not been recorded",
          ],
          source: "authoritative",
        },
        next: "a.read",
      },
      {
        id: "a.read",
        kind: "action",
        does: "Read which setup milestones are complete and which remain, from the product's own record of what was done rather than from what was sent or opened",
        next: "c.next-step",
      },
      {
        id: "c.next-step",
        kind: "condition",
        asks: "Is there a critical next step still outstanding?",
        branches: [
          {
            label: "A step remains",
            when: "at least one incomplete milestone stands between this account and value",
            to: "a.surface",
          },
          {
            label: "Nothing critical left",
            when: "the setup work is done and what remains is whether value has actually been produced",
            to: "c.ready",
          },
        ],
      },
      {
        id: "a.surface",
        kind: "action",
        does: "Surface the single most useful next action. A completed step is never suggested again, and an order is imposed only where one step genuinely depends on another - elsewhere the person picks",
        next: "w.progress",
      },
      {
        id: "c.ready",
        kind: "condition",
        asks: "Has activation actually been achieved?",
        branches: [
          {
            label: "Activated",
            when: "the authoritative activation event has been recorded",
            to: "h.activated",
          },
          {
            label: "Setup complete, value not yet produced",
            when: "every milestone is done and no activation event exists - the checklist finished and the product has still not done anything for them",
            to: "w.progress",
          },
        ],
      },
      {
        id: "w.progress",
        kind: "wait",
        until: ["a setup milestone completes", "the authoritative activation event"],
        onEvent: "c.what-happened",
        timeout: {
          after: "the step-level interval appropriate to the remaining work",
          reason:
            "the wait is for the person to act; when nothing happens the state is re-read rather than the same message being repeated",
        },
        onTimeout: "c.window",
        windowExtendsOnEngagement: false,
      },
      {
        id: "c.what-happened",
        kind: "condition",
        asks: "Which event arrived?",
        branches: [
          { label: "Activation", when: "the authoritative activation event was recorded", to: "h.activated" },
          {
            label: "A setup milestone",
            when: "progress was made but value has not been produced yet",
            to: "a.read",
          },
        ],
      },
      {
        id: "c.window",
        kind: "condition",
        asks: "Is the onboarding window still open?",
        branches: [
          {
            label: "Still open",
            when: "the window fixed at entry has not expired",
            to: "a.read",
          },
          {
            label: "Closed",
            when: "the window has expired without activation",
            to: "x.window-closed",
          },
        ],
      },
      {
        id: "h.activated",
        kind: "handoff",
        to: "ACT-16",
        on: "the authoritative activation event",
        carries: [
          "which event satisfied activation",
          "what onboarding still had outstanding, so the right things get invalidated rather than all of them",
        ],
      },
      {
        id: "x.window-closed",
        kind: "exit",
        state: "onboarding window closed without activation",
        terminal: false,
        reEntry:
          "a later setup or activation event re-opens this normally; the completed milestones are kept, so a return does not start from the beginning",
      },
    ],
    preemptedBy: [
      {
        event: "the authoritative activation event, from anywhere",
        then: "ACT-16 takes ownership and invalidates whatever this journey still had pending",
      },
      {
        event: "a named requirement blocking activation",
        then: "ACT-13 owns the blocker; generic next-step messaging stops until it is resolved",
      },
    ],
    guardrails: [
      "A completed step is never suggested again. Reading the setup record rather than the send history is what makes that true.",
      "Step order is enforced only where a real dependency exists. Imposed sequence turns optional work into a blocker.",
      "A finished checklist is not activation. Setup being complete and the product having produced value are two different facts, and this journey can reach the first without the second.",
    ],
    reusableRule:
      "Onboarding communication should respond to actual progress rather than elapsed time alone.",
  },

  /* ------------------------------------------------------------ ACT-13 */
  {
    id: "ACT-13",
    slug: "activation-blocker-resolution",
    category: "activation",
    name: "Missing activation requirement → resolve blocker → resume",
    purpose:
      "Aim the whole journey at one named missing thing, and resume onboarding once it exists.",
    entity: {
      scope: "the blocking requirement, held against the account or onboarding instance",
      note: "One instance per requirement. Two blockers are two instances, because they may be resolved by different people at different times.",
    },
    distinctFrom: [
      {
        journey: "ACT-14",
        because:
          "Here the obstacle has a name and resolving it is the whole job. ACT-14 is for the case where nothing specific is missing and the person is still not getting anywhere.",
      },
    ],
    entry: "t.blocked",
    nodes: [
      {
        id: "t.blocked",
        kind: "trigger",
        event: "activation_blocked_by_named_requirement",
        evidence: {
          requires: [
            "a specific unmet requirement: an integration not connected, a required configuration absent, a verification incomplete, a required person not yet present, a mandatory setup step unfinished",
          ],
          insufficientAlone: [
            "an incomplete optional field",
            "a profile that is not filled in",
            "a general sense that setup is unfinished",
          ],
          source: "authoritative",
        },
        next: "a.identify",
      },
      {
        id: "a.identify",
        kind: "action",
        does: "Identify the exact requirement and what it is blocking, so everything downstream can name it rather than describe setup in general",
        writes: [{ field: "blocking_requirement", mode: "set" }],
        next: "c.blocking",
      },
      {
        id: "c.blocking",
        kind: "condition",
        asks: "Does this requirement actually block activation?",
        branches: [
          {
            label: "Genuinely blocking",
            when: "activation cannot occur while it is unmet",
            to: "c.self-resolvable",
          },
          {
            label: "Incomplete but not blocking",
            when: "the field or step is missing and value can still be produced without it",
            to: "x.not-blocking",
          },
        ],
      },
      {
        id: "x.not-blocking",
        kind: "exit",
        state: "not a blocker; ordinary onboarding continues",
        terminal: false,
        reEntry:
          "if the same requirement later becomes mandatory, it enters as a real blocker; presenting it as one now would teach people to ignore the ones that matter",
      },
      {
        id: "c.self-resolvable",
        kind: "condition",
        asks: "Can this account resolve the requirement directly?",
        branches: [
          {
            label: "Yes, directly",
            when: "the account holds the access, the information and the permission needed",
            to: "a.specific-action",
          },
          {
            label: "No, it depends on someone else",
            when: "it needs another team, an internal process, a third party, or a person who has not joined yet",
            to: "a.route-dependency",
          },
        ],
      },
      {
        id: "a.specific-action",
        kind: "action",
        does: "Give the one specific action that clears this requirement, named as the thing it is - never a general prompt to finish setup, which tells someone who is already blocked nothing they did not know",
        next: "w.resolve",
      },
      {
        id: "a.route-dependency",
        kind: "action",
        does: "Raise the requirement with whoever can actually resolve it, carrying what is blocked and why. Ownership of the resume stays here, so the account is not handed away and forgotten",
        writes: [{ field: "dependency_requests", mode: "append" }],
        next: "w.resolve",
      },
      {
        id: "w.resolve",
        kind: "wait",
        until: ["the named requirement is satisfied"],
        onEvent: "a.stop-reminders",
        timeout: {
          after: "the resolution horizon appropriate to this requirement",
          reason:
            "requirements resolved by third parties and requirements resolved in a settings screen do not deserve the same patience",
        },
        onTimeout: "c.unresolved",
        windowExtendsOnEngagement: false,
      },
      {
        id: "a.stop-reminders",
        kind: "action",
        does: "Stop every reminder about this requirement immediately, including any already queued - a nudge about something the person has just finished is the clearest possible signal that nothing was watching",
        writes: [{ field: "suppressed_sends", mode: "append" }],
        next: "c.next-blocker",
      },
      {
        id: "c.next-blocker",
        kind: "condition",
        asks: "With this requirement met, is activation now reachable?",
        branches: [
          {
            label: "Reachable",
            when: "no other mandatory requirement is outstanding",
            to: "h.resume",
          },
          {
            label: "Another requirement is blocking",
            when: "clearing this one revealed a second mandatory requirement",
            to: "x.next-blocker",
          },
        ],
      },
      {
        id: "h.resume",
        kind: "handoff",
        to: "ACT-12",
        on: "the blocker cleared and activation reachable again",
        carries: [
          "which requirement was resolved and how long it took",
          "the setup state as it now stands, so onboarding resumes rather than restarts",
        ],
      },
      {
        id: "x.next-blocker",
        kind: "exit",
        state: "resolved; a further requirement now blocks",
        terminal: false,
        reEntry:
          "the next requirement opens its own instance, named on its own terms - stacking them into one message is how a specific blocker turns back into generic setup pressure",
      },
      {
        id: "c.unresolved",
        kind: "condition",
        asks: "What does this unresolved requirement warrant?",
        branches: [
          {
            label: "Escalate to a person",
            when: "the requirement matters enough to the outcome that a human should now own it",
            to: "h.escalate",
          },
          {
            label: "An alternate route exists",
            when: "value can be reached by a different path that does not need this requirement",
            to: "h.reroute",
          },
          {
            label: "No route",
            when: "the requirement is mandatory and neither resolvable nor avoidable",
            to: "x.blocked",
          },
        ],
      },
      {
        id: "h.escalate",
        kind: "handoff",
        to: "external:human-in-the-loop-lifecycle",
        on: "a blocker outliving its resolution horizon",
        carries: [
          "the requirement, who was asked, and what has already been tried",
          "what activation is waiting on, so the person picking it up starts informed",
        ],
        suppresses: ["automated reminders about this requirement while a person holds it"],
      },
      {
        id: "h.reroute",
        kind: "handoff",
        to: "ACT-11",
        on: "an alternate path to value that does not require the blocked thing",
        carries: ["the requirement that could not be met", "the setup state already reached"],
      },
      {
        id: "x.blocked",
        kind: "exit",
        state: "activation blocked, no route available",
        terminal: false,
        reEntry:
          "the requirement becoming satisfiable later re-opens this; nothing is repeatedly asked for in the meantime",
      },
    ],
    guardrails: [
      "No generic finish-your-setup messaging. The requirement is named, or this journey has nothing to say.",
      "A missing field that does not block activation is not presented as a blocker. Doing so trains people to discount the real ones.",
      "The moment the requirement is met, its reminders stop, including any already scheduled.",
    ],
    reusableRule:
      "When activation is blocked, orchestration should target the actual dependency rather than increase generic onboarding pressure.",
  },

  /* ------------------------------------------------------------ ACT-14 */
  {
    id: "ACT-14",
    slug: "struggling-user-assistance",
    category: "activation",
    name: "Struggling user detection → proactive assistance → recovery or exit",
    purpose:
      "Offer help to someone who is visibly trying and not getting anywhere, and stop asking once they have answered.",
    entity: {
      scope: "person or account plus the open onboarding or trial instance",
      note: "The struggle is against this attempt at value. A previous trial that went badly does not qualify anyone here.",
    },
    distinctFrom: [
      {
        journey: "ACT-13",
        because:
          "ACT-13 has a named requirement to clear. Here the evidence is effort without progress and no single thing to point at, which is why the offer is help rather than an instruction.",
      },
    ],
    entry: "t.struggling",
    nodes: [
      {
        id: "t.struggling",
        kind: "trigger",
        event: "help_seeking_without_activation_progress",
        evidence: {
          requires: [
            "help-seeking behaviour: repeated help-centre visits, repeated returns to the same setup page, repeated failed integration or setup attempts, or repeated errors",
            "and no activation progress behind it",
          ],
          insufficientAlone: [
            "a high session count on its own",
            "a single help-centre visit",
            "heavy usage that is making real progress",
          ],
          source: "behavioral",
        },
        next: "c.hard-entry",
      },
      {
        id: "c.hard-entry",
        kind: "condition",
        asks: "Are the hard entry conditions met?",
        branches: [
          {
            label: "Eligible",
            when: "the onboarding or trial is still open and core activation has not been recorded",
            to: "c.duplicate",
          },
          {
            label: "Not eligible",
            when: "the instance has closed, or activation already happened - in which case the help-seeking is about something else",
            to: "x.not-eligible",
          },
        ],
      },
      {
        id: "x.not-eligible",
        kind: "exit",
        state: "not in scope for rescue",
        terminal: false,
        reEntry: "a later struggle inside an open, unactivated instance qualifies normally",
      },
      {
        id: "c.duplicate",
        kind: "condition",
        asks: "Is a person already working this same blocker?",
        branches: [
          {
            label: "Already handled",
            when: "an open support case or an assigned human owner covers the same issue",
            to: "x.defer",
          },
          {
            label: "Nobody on it",
            when: "no open case or owner covers it",
            to: "a.offer",
          },
        ],
      },
      {
        id: "x.defer",
        kind: "exit",
        state: "deferred to the person already handling it",
        terminal: false,
        reEntry:
          "if that case closes with the struggle unresolved, this qualifies again - two channels chasing one problem is worse than one slow channel",
      },
      {
        id: "a.offer",
        kind: "action",
        does: "Offer help named against the step they keep returning to. The primary route books assisted setup; the secondary opens the specific guide for that step, for people who would rather not talk to anyone",
        next: "w.response",
      },
      {
        id: "w.response",
        kind: "wait",
        until: [
          "assistance is scheduled",
          "the authoritative activation event",
          "assistance is explicitly declined",
        ],
        onEvent: "c.what-happened",
        timeout: {
          after: "a bounded response window",
          reason: "no answer is an answer, and it does not license asking again in the same terms",
        },
        onTimeout: "c.final-option",
        windowExtendsOnEngagement: false,
      },
      {
        id: "c.what-happened",
        kind: "condition",
        asks: "What did they do?",
        branches: [
          { label: "Booked", when: "an assisted session was scheduled", to: "a.confirm" },
          {
            label: "Solved it themselves",
            when: "the activation event was recorded without any session",
            to: "h.activated",
          },
          {
            label: "Declined",
            when: "the offer was explicitly turned down",
            to: "x.declined",
          },
        ],
      },
      {
        id: "x.declined",
        kind: "exit",
        state: "assistance declined, cooldown in force",
        terminal: false,
        reEntry:
          "a new struggle after the cooldown may qualify again; the same offer is not re-sent to someone who has already said no to it",
      },
      {
        id: "a.confirm",
        kind: "action",
        does: "Confirm the time, how to join, and the specific problem the session will open with, taken from the step they were stuck on",
        next: "w.session",
      },
      {
        id: "w.session",
        kind: "wait",
        until: ["the session outcome is recorded", "the booking is cancelled"],
        onEvent: "c.outcome",
        timeout: {
          after: "the scheduled session time plus a short grace period",
          reason:
            "a booking with no recorded outcome is not evidence of anything, and waiting longer will not produce one",
        },
        onTimeout: "x.no-outcome",
        windowExtendsOnEngagement: false,
      },
      {
        id: "x.no-outcome",
        kind: "exit",
        state: "no session outcome recorded",
        terminal: false,
        reEntry:
          "the assistance offer is not repeated on this instance; a fresh struggle after the cooldown is a new question",
      },
      {
        id: "c.outcome",
        kind: "condition",
        asks: "Did activation follow the assistance?",
        branches: [
          {
            label: "Activated",
            when: "the authoritative activation event was recorded after the session",
            to: "h.activated",
          },
          {
            label: "Still not activated",
            when: "the session happened and value still has not been produced",
            to: "c.followup",
          },
        ],
      },
      {
        id: "c.followup",
        kind: "condition",
        asks: "Is there one genuinely useful follow-up left?",
        branches: [
          {
            label: "Yes",
            when: "the session surfaced a specific remaining action worth naming",
            to: "a.followup",
          },
          {
            label: "No",
            when: "nothing specific came out of it, and a follow-up would only restate the offer",
            to: "x.normal",
          },
        ],
      },
      {
        id: "a.followup",
        kind: "action",
        does: "Send one follow-up tied to what the session actually covered. There is no second one, and no further request for a call",
        next: "x.normal",
      },
      {
        id: "c.final-option",
        kind: "condition",
        asks: "With no response, is one final self-service option worth sending?",
        branches: [
          {
            label: "Worth one",
            when: "a specific guide exists for the step they were stuck on",
            to: "a.final",
          },
          {
            label: "Not worth it",
            when: "nothing specific exists to point at, and a general nudge would just repeat the offer",
            to: "x.normal",
          },
        ],
      },
      {
        id: "a.final",
        kind: "action",
        does: "Send one final self-service option and stop. The call is not asked for a third time",
        next: "x.normal",
      },
      {
        id: "h.activated",
        kind: "handoff",
        to: "ACT-16",
        on: "activation reached, with or without the session",
        carries: [
          "whether assistance was involved, which is worth knowing about this account later",
          "the struggle that preceded it",
        ],
      },
      {
        id: "x.normal",
        kind: "exit",
        state: "rescue attempt closed, ordinary lifecycle resumes",
        terminal: false,
        reEntry: "a new struggle in an open, unactivated instance after the cooldown",
      },
    ],
    guardrails: [
      "High activity is not struggling. Someone doing a lot and getting somewhere is the last person to interrupt.",
      "An open support case for the same issue suppresses this entirely. The automated offer is always the one that does not know the current state.",
      "A decline is respected and cooled down. Asking again after being told no is the behaviour this journey is supposed to replace.",
      "The offer is made at most twice: the offer itself, and one final self-service alternative.",
    ],
    reusableRule:
      "Proactive assistance should require evidence of effort without progress, not activity alone.",
  },

  /* ------------------------------------------------------------ ACT-15 */
  {
    id: "ACT-15",
    slug: "first-value-milestone",
    category: "activation",
    name: "First value milestone → recognition → next meaningful action",
    purpose:
      "Mark the moment the product first did something real for this person, and point at whatever naturally follows from it.",
    entity: {
      scope: "person or account plus the product or service context the value was produced in",
      note: "First value is per context. A first report in one workspace is not first value in another the same account also holds.",
    },
    distinctFrom: [
      {
        journey: "ACT-16",
        because:
          "The same event can drive both, and they do opposite work. ACT-16 stops what onboarding still had queued; this one speaks to the person about what they just did.",
      },
    ],
    entry: "t.first-value",
    nodes: [
      {
        id: "t.first-value",
        kind: "trigger",
        event: "authoritative_first_value_event",
        evidence: {
          requires: [
            "a recorded first: a completed workflow, a completed transaction, a published project, a generated report, a successful collaboration, or whatever this product's equivalent is",
          ],
          insufficientAlone: [
            "a login",
            "a page view",
            "a completed onboarding checklist",
            "an opened or clicked message",
          ],
          source: "authoritative",
        },
        next: "a.recognize",
      },
      {
        id: "a.recognize",
        kind: "action",
        does: "Acknowledge what was actually produced, in the terms of the thing itself. Recognition that names nothing real is the failure mode here - it reads as manufactured, and it devalues the milestones that follow",
        next: "c.next",
      },
      {
        id: "c.next",
        kind: "condition",
        asks: "Does a natural next action follow from what they just did?",
        branches: [
          {
            label: "Yes",
            when: "something specific follows from the thing they produced - sharing it, repeating it, extending it",
            to: "a.surface",
          },
          {
            label: "No",
            when: "nothing genuinely follows, and inventing a next step would turn recognition into a pitch",
            to: "h.adoption",
          },
        ],
      },
      {
        id: "a.surface",
        kind: "action",
        does: "Surface one relevant next action, drawn from what they produced rather than from the product's feature list",
        next: "h.adoption",
      },
      {
        id: "h.adoption",
        kind: "handoff",
        to: "ACT-17",
        on: "first value produced",
        carries: [
          "what the first value actually was, which is the use-case adoption should now be measured against",
          "whether a next action was surfaced, so it is not immediately repeated",
        ],
      },
    ],
    guardrails: [
      "A login is not first value. A page view is not first value. The product has to have produced something.",
      "Recognition names the real thing or is not sent. Celebration with nothing behind it costs more than silence.",
      "The milestone has to matter to the person, not only to our funnel. A step that is significant only internally is not a milestone to congratulate anyone for.",
    ],
    reusableRule:
      "The first-value milestone marks the transition from learning how to use something to receiving value from it.",
  },

  /* ------------------------------------------------------------ ACT-16 */
  {
    id: "ACT-16",
    slug: "activation-stops-onboarding",
    category: "activation",
    name: "Activation achieved → stop onboarding → adoption handoff",
    purpose:
      "Make onboarding let go the moment activation is recorded, including the messages it has already queued.",
    entity: {
      scope: "person or account plus the onboarding instance being closed",
      note: "Only this instance closes. Another product's onboarding for the same account is untouched by this activation.",
    },
    entry: "t.activated",
    nodes: [
      {
        id: "t.activated",
        kind: "trigger",
        event: "authoritative_core_activation_event",
        evidence: {
          requires: ["the product's own record that core value was produced"],
          insufficientAlone: [
            "a click on an onboarding email",
            "a completed setup checklist",
            "a login",
            "a feature opened but not used to any end",
          ],
          source: "authoritative",
        },
        next: "c.authoritative",
      },
      {
        id: "c.authoritative",
        kind: "condition",
        asks: "Did this come from the product's record of value produced?",
        branches: [
          {
            label: "Authoritative",
            when: "the product recorded the value-producing event",
            to: "a.complete",
          },
          {
            label: "Proxy",
            when: "the signal describes engagement with a message or navigation inside the product",
            to: "x.not-activation",
          },
        ],
      },
      {
        id: "x.not-activation",
        kind: "exit",
        state: "no activation recorded; onboarding continues untouched",
        terminal: false,
        reEntry: "the real event, when it happens, arrives from the product and opens a proper instance",
      },
      {
        id: "a.complete",
        kind: "action",
        does: "Mark the onboarding objective complete, recording which event satisfied it - so a later question about when this account activated has one answer rather than an inference",
        writes: [{ field: "onboarding_outcome", mode: "append" }],
        next: "a.invalidate",
      },
      {
        id: "a.invalidate",
        kind: "action",
        does: "Invalidate what onboarding still has outstanding: remaining setup reminders, onboarding calls to action, incomplete-step messages that are no longer true, and assistance prompts whose purpose has just disappeared - including everything already queued",
        writes: [{ field: "suppressed_sends", mode: "append" }],
        next: "c.mandatory",
      },
      {
        id: "c.mandatory",
        kind: "condition",
        asks: "Does a mandatory operational requirement remain outstanding?",
        branches: [
          {
            label: "Something still required",
            when: "an operational obligation is unmet - a verification, a billing detail, a compliance step - none of which blocked value but all of which still have to happen",
            to: "a.spin-off",
          },
          {
            label: "Nothing outstanding",
            when: "no obligation remains beyond ordinary use",
            to: "h.adoption",
          },
        ],
      },
      {
        id: "a.spin-off",
        kind: "action",
        does: "Hand the outstanding operational requirement to its own lifecycle. It does not keep onboarding open, and onboarding does not keep messaging on its behalf",
        next: "h.adoption",
      },
      {
        id: "h.adoption",
        kind: "handoff",
        to: "ACT-17",
        on: "activation recorded and onboarding closed",
        carries: [
          "which event activated the account",
          "what was left unfinished, since activation is not mastery and adoption may still need it",
          "any operational requirement spun off separately",
        ],
        suppresses: [
          "every remaining onboarding action for this instance, queued or scheduled",
        ],
      },
    ],
    guardrails: [
      "Activation is never determined by a click on an onboarding email. The message is not the milestone.",
      "Onboarding completion is not product mastery. Closing onboarding says value was produced once, nothing more.",
      "Invalidation reaches queued sends, not only future scheduling. The reminder that arrives after success is the one people remember.",
    ],
    reusableRule:
      "Once activation occurs, onboarding should relinquish ownership instead of continuing its original sequence.",
  },

  /* ------------------------------------------------------------ ACT-17 */
  {
    id: "ACT-17",
    slug: "early-adoption-to-stable-use",
    category: "activation",
    name: "Early adoption → usage depth → habit or stable use",
    purpose:
      "Carry an account from having produced value once to producing it repeatedly, measured against its own use-case.",
    entity: {
      scope: "person or account plus the product or use-case value comes from",
      note: "Adoption is measured against the use-case that produced first value, not against the product's full surface.",
    },
    distinctFrom: [
      {
        journey: "ACT-12",
        because:
          "Onboarding gets someone to value once. This is about the second, fifth and twentieth time, where the obstacle is habit rather than setup.",
      },
    ],
    entry: "t.activated",
    nodes: [
      {
        id: "t.activated",
        kind: "trigger",
        event: "core_activation_completed",
        evidence: {
          requires: ["a recorded activation, with the use-case that produced it"],
          source: "authoritative",
        },
        next: "a.measure",
      },
      {
        id: "a.measure",
        kind: "action",
        does: "Read adoption from value-producing usage - how often, how deep, whether success repeats, whether others are involved where the use-case needs them. Activity that produces nothing does not count toward it, however much of it there is",
        next: "c.stable",
      },
      {
        id: "c.stable",
        kind: "condition",
        asks: "Has adoption become stable?",
        branches: [
          {
            label: "Stable",
            when: "value is being produced repeatedly at the rhythm this use-case implies, without prompting",
            to: "h.normal",
          },
          {
            label: "Not yet",
            when: "value has been produced but not reliably repeated",
            to: "a.next-behavior",
          },
        ],
      },
      {
        id: "h.normal",
        kind: "handoff",
        to: "external:customer-lifecycle",
        on: "adoption stabilising",
        carries: [
          "the use-case that adoption settled around, which is what any later health or expansion judgement should read",
          "the rhythm it settled at, so a change in it later means something",
        ],
      },
      {
        id: "a.next-behavior",
        kind: "action",
        does: "Identify the next behaviour that would actually produce more value for this use-case, and encourage only that. Breadth is not pursued where the value is narrow - a person who gets everything they need from one workflow is adopted, not under-adopted",
        next: "w.observe",
      },
      {
        id: "w.observe",
        kind: "wait",
        until: ["a further value-producing usage event"],
        onEvent: "a.measure",
        timeout: {
          after: "the early-adoption window, set from this product's own intended usage rhythm",
          reason:
            "a weekly product and a twice-a-year product cannot share a window, and a shared one would report every seasonal account as failing",
        },
        onTimeout: "h.stall",
        windowExtendsOnEngagement: false,
      },
      {
        id: "h.stall",
        kind: "handoff",
        to: "ACT-18",
        on: "the early-adoption window passing without repeated value",
        carries: [
          "what was produced and when it stopped",
          "the expected pattern it was measured against, so the stall is diagnosed rather than assumed",
        ],
      },
    ],
    guardrails: [
      "More feature usage is not better adoption. The measure is repeated value, not surface covered.",
      "Breadth is not forced where value is narrow. Pushing a satisfied single-workflow user toward features they do not need makes the product feel heavier, not stickier.",
      "Vanity activity does not inflate the adoption state. Logins, opened dashboards and idle sessions are excluded by construction, not filtered out afterwards.",
    ],
    reusableRule:
      "Adoption should measure repeated value-producing behavior, not raw product activity.",
  },

  /* ------------------------------------------------------------ ACT-18 */
  {
    id: "ACT-18",
    slug: "adoption-stall-diagnosis",
    category: "activation",
    name: "Adoption stall → diagnose missing value → recover or re-route",
    purpose:
      "Work out why value stopped recurring before doing anything about it, including the case where nothing is wrong.",
    entity: {
      scope: "person or account plus the product or use-case that stalled",
      note: "A stall in one use-case is not a stall in the account. Others it holds may be perfectly healthy.",
    },
    distinctFrom: [
      {
        journey: "ACT-14",
        because:
          "ACT-14 is pre-activation and triggered by help-seeking. This is post-activation and triggered by silence, where the most common correct answer is that nothing is wrong.",
      },
    ],
    entry: "t.stall",
    nodes: [
      {
        id: "t.stall",
        kind: "trigger",
        event: "expected_adoption_pattern_not_met",
        evidence: {
          requires: [
            "an activated account failing to progress against the usage pattern this product actually intends",
          ],
          insufficientAlone: [
            "a gap that is normal for an episodic or seasonal product",
            "a drop in logins with value still being produced",
          ],
          source: "behavioral",
        },
        next: "a.diagnose",
      },
      {
        id: "a.diagnose",
        kind: "action",
        does: "Work out what the evidence actually shows: setup that was never finished, an integration that is missing, no clear next use-case, collaborators who never joined, value that simply never repeated, a technical blocker - or a use-case that is finished and needs nothing further",
        next: "c.type",
      },
      {
        id: "c.type",
        kind: "condition",
        asks: "What does the evidence show?",
        branches: [
          {
            label: "Recoverable blocker",
            when: "something specific is in the way: unfinished setup, a missing integration, an unclear next use-case, collaborators who never arrived",
            to: "a.recover",
          },
          {
            label: "Needs a person",
            when: "a technical problem that will not be solved by a message",
            to: "h.assistance",
          },
          {
            label: "Need genuinely met",
            when: "the use-case was completed and there is nothing further to do - the account got what it came for",
            to: "x.satisfied",
          },
          {
            label: "No evidence of a problem",
            when: "usage looks light against a generic expectation but nothing indicates anything is wrong",
            to: "x.no-intervention",
          },
        ],
      },
      {
        id: "x.satisfied",
        kind: "exit",
        state: "use-case complete; the need was met, not abandoned",
        terminal: false,
        reEntry:
          "a new use-case, or the same need arising again, opens adoption normally - this account did not fail, it finished",
      },
      {
        id: "a.recover",
        kind: "action",
        does: "Address the diagnosed blocker specifically. Not more encouragement, not a re-run of onboarding - the thing the diagnosis actually named",
        next: "w.recover",
      },
      {
        id: "w.recover",
        kind: "wait",
        until: ["a meaningful recovery event: value produced again in this use-case"],
        onEvent: "h.adoption",
        timeout: {
          after: "a bounded recovery window, again drawn from the product's intended rhythm",
          reason: "a recovery attempt that has not worked does not work better repeated",
        },
        onTimeout: "h.monitor",
        windowExtendsOnEngagement: false,
      },
      {
        id: "h.adoption",
        kind: "handoff",
        to: "ACT-17",
        on: "value produced again after recovery",
        carries: ["what the blocker was and what cleared it", "the recovered usage pattern"],
      },
      {
        id: "h.monitor",
        kind: "handoff",
        to: "external:health-monitoring",
        on: "a recovery window closing without value returning",
        carries: [
          "the diagnosis and what was tried",
          "the fact that this is reduced usage, not a churn decision - nobody has said anything",
        ],
        suppresses: ["adoption-frequency messaging for this use-case"],
      },
      {
        id: "h.assistance",
        kind: "handoff",
        to: "external:human-in-the-loop-lifecycle",
        on: "a technical blocker that needs a person",
        carries: ["the diagnosis", "what the account was trying to do when it stopped"],
      },
      {
        id: "x.no-intervention",
        kind: "exit",
        state: "no problem found; nothing sent",
        terminal: false,
        reEntry:
          "real evidence of a stall later re-opens this - the absence of a finding is a finding, and manufacturing an intervention from it is the failure this branch exists to prevent",
      },
    ],
    guardrails: [
      "Reduced usage is not churn risk. It is reduced usage, and the difference is a diagnosis nobody has made yet.",
      "Seasonal and episodic products carry their own expectations. A gap that is normal for the product is not a stall.",
      "Where no problem can be found, nothing is sent. An intervention invented to fill a dashboard gap is worse than the gap.",
    ],
    reusableRule:
      "Adoption recovery should diagnose why expected value stopped recurring before prescribing more engagement.",
  },

  /* ------------------------------------------------------------ ACT-19 */
  {
    id: "ACT-19",
    slug: "role-use-case-discovery",
    category: "activation",
    name: "Role or use-case discovery → relevant onboarding adaptation",
    purpose:
      "Get the one piece of context onboarding needs to choose a path, only when not having it would actually change that path.",
    entity: {
      scope: "person or account plus the onboarding context being decided",
      note: "The declared value belongs to the context it was given for; a different product's onboarding asks its own question rather than reusing this answer.",
    },
    entry: "t.needed",
    nodes: [
      {
        id: "t.needed",
        kind: "trigger",
        event: "onboarding_needs_named_role_or_use_case",
        evidence: {
          requires: [
            "an onboarding decision that depends on a named role or use-case, with no reliable value available for it",
          ],
          source: "authoritative",
        },
        next: "c.declared",
      },
      {
        id: "c.declared",
        kind: "condition",
        asks: "Does a reliable declared value already exist?",
        branches: [
          {
            label: "Already declared",
            when: "the person has stated it before and the answer is still current",
            to: "a.reuse",
          },
          {
            label: "Not declared",
            when: "nothing declared exists - only behaviour, which is not the same thing and is not stored as if it were",
            to: "c.material",
          },
        ],
      },
      {
        id: "a.reuse",
        kind: "action",
        does: "Use the existing declared value and record that it was reused rather than re-asked - asking again for something already given is its own small failure",
        next: "a.adapt",
      },
      {
        id: "c.material",
        kind: "condition",
        asks: "Would the answer materially change the path to value?",
        branches: [
          {
            label: "Yes",
            when: "different answers lead to genuinely different setup, examples or first actions",
            to: "a.ask",
          },
          {
            label: "No",
            when: "the path is the same whatever they answer - the question would be collected and never used",
            to: "x.dont-ask",
          },
        ],
      },
      {
        id: "x.dont-ask",
        kind: "exit",
        state: "not asked; onboarding proceeds unchanged",
        terminal: false,
        reEntry:
          "if a later decision genuinely turns on the answer, it is asked then - each question earns its place at the moment it is needed",
      },
      {
        id: "a.ask",
        kind: "action",
        does: "Ask one lightweight question covering only what the implementation will actually consume. Onboarding does not become a questionnaire on the way to the thing the person came for",
        next: "w.answer",
      },
      {
        id: "w.answer",
        kind: "wait",
        until: ["the question is answered"],
        onEvent: "a.persist",
        timeout: {
          after: "a short window - this is a question in the middle of someone's setup, not a survey",
          reason: "an unanswered question must not hold up the path to value",
        },
        onTimeout: "a.default",
        windowExtendsOnEngagement: false,
      },
      {
        id: "a.persist",
        kind: "action",
        does: "Persist the declared value with its source and the time it was given, in a field that only ever holds declared answers. Behavioural inference lives in its own field and is never written here - once the two are mixed, nothing downstream can tell what the person actually said",
        writes: [{ field: "declared_context", mode: "append" }],
        next: "a.adapt",
      },
      {
        id: "a.default",
        kind: "action",
        does: "Continue on a documented default path and record that no declared value exists. The default is not written into the declared field as though someone had chosen it",
        next: "h.progress",
      },
      {
        id: "a.adapt",
        kind: "action",
        does: "Adapt the recommended setup, the examples, the next action and the education to the declared context - which is the only reason the question was worth asking",
        next: "h.progress",
      },
      {
        id: "h.progress",
        kind: "handoff",
        to: "ACT-12",
        on: "the onboarding path resolved, adapted or defaulted",
        carries: [
          "the declared value with its source, or the explicit fact that there is none",
          "which adaptations were applied, so they are not applied twice",
        ],
      },
    ],
    guardrails: [
      "Behavioural inference is never stored as a declared preference. They are different fields with different confidence, and merging them cannot be undone.",
      "Nothing is asked that the implementation will not use. A question collected and ignored costs attention and returns nothing.",
      "Onboarding does not become a questionnaire. One question, asked where the answer changes the path.",
    ],
    reusableRule:
      "Ask for onboarding context only when the answer materially changes the path to value.",
  },

  /* ------------------------------------------------------------ ACT-20 */
  {
    id: "ACT-20",
    slug: "dormant-non-customer-reactivation",
    category: "activation",
    name: "Dormant non-customer reactivation → return → re-qualification or exit",
    purpose:
      "Make one bounded attempt to restart a relationship that never became a paying one, and judge the result on what the person actually did.",
    entity: {
      scope: "person, lead or inactive non-customer account, in the context that went dormant",
      note: "Dormancy is per context. Someone inactive in one product may be perfectly active in another, and this journey is not about them.",
    },
    distinctFrom: [
      {
        journey: "ACQ-07",
        because:
          "Decay retires an intent state that is no longer credible. This tries to restart a relationship that had already started, and it only applies where money never changed hands.",
      },
    ],
    competition: {
      scope: "person",
      exclusionGroup: "lifecycle-stage",
      precedence:
        "lowest in the group - any current lifecycle on the same person outranks reactivation",
      onLoss: "exit",
    },
    entry: "t.dormant",
    nodes: [
      {
        id: "t.dormant",
        kind: "trigger",
        event: "engaged_non_customer_became_dormant",
        evidence: {
          requires: [
            "a previously engaged relationship that has passed the inactivity threshold defined for this context",
          ],
          insufficientAlone: [
            "a gap that is normal for how often this product is used",
            "quiet in one channel while the person is active elsewhere",
          ],
          source: "behavioral",
        },
        next: "c.never-monetized",
      },
      {
        id: "c.never-monetized",
        kind: "condition",
        asks: "Has this relationship ever been monetised in this context?",
        branches: [
          {
            label: "Never paid",
            when: "no customer or paid relationship exists or has existed for this context",
            to: "a.reason",
          },
          {
            label: "Was a paying customer",
            when: "a monetised relationship exists or once existed",
            to: "x.winback",
          },
        ],
      },
      {
        id: "x.winback",
        kind: "exit",
        state: "out of scope; belongs to win-back",
        terminal: true,
        reEntry:
          "none here - restoring a relationship that was once paid for is a different problem with different economics and a different message, and treating it as reactivation gets both wrong",
      },
      {
        id: "a.reason",
        kind: "action",
        does: "Establish whether there is a credible reason to come back: setup they never finished, an interest they expressed, something now relevant that was not before, a destination left incomplete, or a real change in the product",
        next: "c.worth-it",
      },
      {
        id: "c.worth-it",
        kind: "condition",
        asks: "Is there a credible reason, and is this person still eligible and contactable?",
        branches: [
          {
            label: "Worth one attempt",
            when: "a specific reason exists and permission and eligibility both hold",
            to: "a.attempt",
          },
          {
            label: "Not worth it",
            when: "no specific reason exists, or permission or eligibility has lapsed",
            to: "x.no-reason",
          },
        ],
      },
      {
        id: "x.no-reason",
        kind: "exit",
        state: "dormant, no credible reason to re-engage",
        terminal: false,
        reEntry:
          "a genuine change - in the product, in their circumstances, in what they asked for - can create a reason later; dormancy alone never becomes one by lasting longer",
      },
      {
        id: "a.attempt",
        kind: "action",
        does: "Make one bounded attempt built on the recorded reason. Not a general note that they have been missed, which says nothing and asks for nothing",
        next: "w.return",
      },
      {
        id: "w.return",
        kind: "wait",
        until: ["a meaningful return: activity in the product or movement in the funnel"],
        onEvent: "a.inspect",
        timeout: {
          after: "the reactivation window",
          reason:
            "the window is what stops repeated dormancy from turning into a permanent campaign aimed at people who have already stopped answering",
        },
        onTimeout: "x.sunset",
        windowExtendsOnEngagement: false,
      },
      {
        id: "a.inspect",
        kind: "action",
        does: "Inspect what actually happened before declaring anything. Opening the message is not returning; the question is whether any real state moved",
        next: "c.state",
      },
      {
        id: "c.state",
        kind: "condition",
        asks: "What state did they actually return into?",
        branches: [
          {
            label: "Unfinished onboarding",
            when: "an onboarding instance is open and setup resumed",
            to: "h.onboarding",
          },
          {
            label: "Renewed commercial intent",
            when: "behaviour shows intent stronger than what is currently recorded",
            to: "h.intent",
          },
          {
            label: "No current qualification",
            when: "they are back but nothing on record says whether they are qualified for anything now",
            to: "h.qualify",
          },
          {
            label: "Signal did not survive inspection",
            when: "what looked like a return turns out to be engagement with the message and nothing more",
            to: "x.engagement-only",
          },
        ],
      },
      {
        id: "h.onboarding",
        kind: "handoff",
        to: "ACT-12",
        on: "a return into unfinished setup",
        carries: [
          "the milestones already completed, so they resume rather than restart",
          "the reason they were re-engaged",
        ],
      },
      {
        id: "h.intent",
        kind: "handoff",
        to: "ACQ-03",
        on: "a return carrying stronger intent than the record holds",
        carries: ["the new signal", "the dormancy, so this is not read as a first-time interest"],
      },
      {
        id: "h.qualify",
        kind: "handoff",
        to: "ACQ-05",
        on: "a return with no current qualification on record",
        carries: ["the earlier history and why it lapsed", "what brought them back"],
      },
      {
        id: "x.engagement-only",
        kind: "exit",
        state: "engagement only; nothing reactivated",
        terminal: false,
        reEntry:
          "the window continues to its end if it has not expired; a click is not recorded as a return, because doing so would make this journey report its own message as a result",
      },
      {
        id: "x.sunset",
        kind: "exit",
        state: "reactivation window closed, cooldown in force",
        terminal: false,
        reEntry:
          "only a new reason, not a longer silence; repeated dormancy does not entitle anyone to repeated campaigns",
      },
    ],
    guardrails: [
      "Success is a meaningful return, never an open or a click. The message is not the outcome.",
      "Former paying customers are out of scope. Win-back is a different journey with different economics.",
      "Repeated inactivity does not create repeated campaigns. Each attempt needs its own reason.",
    ],
    reusableRule:
      "Reactivation restores meaningful activity in a dormant non-customer relationship; it does not restore a previously monetized relationship.",
  },
];
