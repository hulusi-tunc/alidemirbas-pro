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
   entry to setup will take. ACT-14 handles the case where a person is
   struggling and nothing nameable blocks them. ACT-17 (its first-value
   entry) and ACT-16 are the two halves of crossing into activation - what
   the person experiences, and what the system has to stop doing. ACT-17
   owns the arrow to adoption in both its working and its stalled form.

   ACT-12 is not here (retired 2026-09-24, site owner's request - "kaldır").
   It used to walk the entry-to-setup arrow step by step; ACT-11, ACT-13 and
   ACT-20 each used to hand their own edge into it - a clear start, a cleared
   blocker, a return into unfinished setup - and each now stops there as a
   real exit (x.ready, x.unblocked, x.resumed) rather than handing to a
   next-step engine that no longer exists.

   ACT-13 is not here either (retired 2026-09-24, site owner's request -
   "kaldır"). It handled the case where activation was blocked by one named
   thing. It had two real inbound handoffs: ACT-11's h.requirement, which now
   exits as x.blocked instead, and RET-23's h.setup, which is now read by
   RET-23's own h.technical branch instead of a dedicated setup-dependency
   route. ACT-14's own duplicate-ownership check no longer names it.

   ACT-16 exists to invalidate messages and sends nothing itself. */

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
    goal: "routing-assignment",
    channels: ["task"],
    name: "New entry → onboarding route → appropriate path",
    shortName: "Onboarding Route Assignment",
    purpose:
      "Choose the onboarding path from the work actually required to reach value, before any of that work starts.",
    entity: {
      scope: "person, account, subscription or trial - the thing that was entered",
      note: "One entry, one route. A second subscription on the same account is a second instance with its own route, because its setup work is its own.",
      instanceKey: [
        "account_id",
        "onboarding_instance_id"
      ],
      concurrency: "one-active-per-key"
    },
    distinctFrom: [],
    objective: "Choose the onboarding path from the work actually required to reach value, before any of that work starts.",
    eligibility: [
      "a recorded entry: account created, trial started, subscription started, or customer onboarding started",
      "no instance of this journey is already open for the person",
      "hard gates (GLB-31) allow communication for this purpose"
    ],
    suppressions: [
      {
        "id": "s.g1",
        "label": "CANONICAL_RULE",
        "text": "Plan tier is not onboarding complexity. A large customer with simple setup does not need an implementation, and a small one with an integration does."
      },
      {
        "id": "s.g2",
        "label": "CANONICAL_RULE",
        "text": "A high-value account does not automatically get human assistance. Value decides how much the outcome matters, not how much work reaching it takes."
      },
      {
        "id": "s.g3",
        "label": "CANONICAL_RULE",
        "text": "The route follows the setup and use-case actually in front of us, not who the account is."
      }
    ],
    contact: {
      "defaultPriority": "lifecycle",
      "pressureClass": "lifecycle",
      "localCap": {
        "value": {
          "key": "onboarding_route.touches",
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
        "key": "onboarding_route.cooldown",
        "rule": "Route assignment is per onboarding instance; a later entry is its own instance and no cooldown applies.",
        "default": {
          "value": "none",
          "confidence": "high",
          "basis": "corpus-rule",
          "applicableWhen": "the entity note: the thing that was entered"
        },
        "required": false
      },
      "competition": "none"
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
          "stage": "assisted",
          "action": "a.assisted",
          "prerequisites": [
            "c.assisted"
          ],
          "purpose": "Record the assisted route and raise the internal task that gives this onboarding a human owner - the route is a property of the onboarding, carried into every step that follows",
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
        "s.g3"
      ]
    },
    implementation: {
      "attributes": {
        "required": [
          "account_id",
          "onboarding_instance_id",
          "onboarding_context",
          "onboarding_route",
          "setup_required"
        ],
        "optional": []
      }
    },
    measurement: {
      "journeyOutcome": {
        "type": "exit",
        "refs": [
          "x.blocked",
          "x.ready"
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
        "onboarding route assignment",
        "assisted vs self-serve onboarding",
        "onboarding path selection",
        "onboarding triage"
      ],
      "useCases": [
        "a new account whose onboarding path must be chosen from the setup actually required",
        "deciding whether a human owner is needed before onboarding starts"
      ]
    },
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
        idempotencyKey: "account_id + onboarding_instance_id + a.context",
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
        execution: "human",
        idempotencyKey: "account_id + onboarding_instance_id + a.assisted",
      },
      {
        id: "a.self-service",
        kind: "action",
        does: "Record the self-service route, which stays revisable: discovering later that a person is needed is a re-route, not a failure",
        writes: [{ field: "onboarding_route", mode: "set" }],
        next: "c.prerequisite",
        idempotencyKey: "account_id + onboarding_instance_id + a.self-service",
      },
      {
        id: "c.prerequisite",
        kind: "condition",
        asks: "Is a critical prerequisite missing before onboarding can start at all?",
        branches: [
          {
            label: "Blocked at the start",
            when: "something named and mandatory is absent - a verification, an access grant, a required party - and nothing meaningful can proceed without it",
            to: "x.blocked",
          },
          {
            label: "Clear to start",
            when: "no mandatory prerequisite is outstanding; incomplete optional fields do not count",
            to: "x.ready",
          },
        ],
      },
      {
        id: "x.blocked",
        kind: "exit",
        state: "a mandatory prerequisite is missing; onboarding cannot begin until the named requirement exists",
        terminal: false,
        reEntry: "the requirement being resolved re-opens routing from current onboarding context",
        class: "no-action",
      },
      {
        id: "x.ready",
        kind: "exit",
        state: "route chosen, nothing blocking the start; the account is clear to begin setup under its own steam",
        terminal: false,
        reEntry: "a mandatory prerequisite discovered later re-opens this evaluation from current evidence",
        class: "success",
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

  /* ------------------------------------------------------------ ACT-14 */
  {
    id: "ACT-14",
    slug: "struggling-user-assistance",
    category: "activation",
    goal: "relationship-recovery-intervention",
    channels: ["email", "in-app"],
    name: "Struggling user detection → proactive assistance → recovery or exit",
    shortName: "Onboarding Help",
    purpose:
      "Offer help to someone who is visibly trying and not getting anywhere, and stop asking once they have answered.",
    entity: {
      scope: "person or account plus the open onboarding or trial instance",
      note: "The struggle is against this attempt at value. A previous trial that went badly does not qualify anyone here.",
      instanceKey: [
        "account_id",
        "person_id"
      ],
      concurrency: "one-active-per-key"
    },
    objective: "Offer help to someone who is visibly trying and not getting anywhere, and stop asking once they have answered.",
    eligibility: [
      "help-seeking behaviour: repeated help-centre visits, repeated returns to the same setup page, repeated failed integration or setup attempts, or repeated errors",
      "and no activation progress behind it",
      "no instance of this journey is already open for the person or account plus the open onboarding or trial instance",
      "hard gates (GLB-31) allow communication for this purpose"
    ],
    suppressions: [
      {
        "id": "s.g1",
        "label": "CANONICAL_RULE",
        "text": "High activity is not struggling. Someone doing a lot and getting somewhere is the last person to interrupt."
      },
      {
        "id": "s.g2",
        "label": "CANONICAL_RULE",
        "text": "An open support case for the same issue suppresses this entirely. The automated offer is always the one that does not know the current state."
      },
      {
        "id": "s.g3",
        "label": "CANONICAL_RULE",
        "text": "A decline is respected and cooled down. Asking again after being told no is the behaviour this journey is supposed to replace."
      },
      {
        "id": "s.g4",
        "label": "CANONICAL_RULE",
        "text": "The offer is made at most twice: the offer itself, and one final self-service alternative."
      },
    ],
    contact: {
      "defaultPriority": "service",
      "pressureClass": "service",
      "localCap": {
        "value": {
          "key": "struggling_user.touches",
          "rule": "Every touch runs against a budget fixed when the instance opened, counted as the longest path through the plan rather than the node count: the offer, the booking confirmation, one follow-up. The booking confirmation is a requested transactional message, not a nudge, so the nudge budget is 2 and s.g4 is its statement.",
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
        "key": "struggling_user.cooldown",
        "rule": "The cooldown between instances of this journey for the same person or account plus the open onboarding or trial instance, so that a re-qualifying person or account plus the open onboarding or trial instance is tracked but not messaged again inside it.",
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
      "fallback": "none",
      "label": "RECOMMENDED_DEFAULT"
    },
    orchestration: {
      "strategy": "offer-decide-remind",
      "touches": [
        {
          "id": "t1",
          "stage": "offer",
          "action": "a.offer",
          "prerequisites": [
            "c.hard-entry",
            "c.duplicate"
          ],
          "purpose": "Offer help named against the step they keep returning to.",
          "channelRoles": [
            "in-session"
          ],
          "mandatory": false,
          "label": "CANONICAL_RULE",
          "destination": {
            "target": "book-assisted-setup",
            "boundTo": "account_id"
          }
        },
        {
          "id": "t2",
          "stage": "confirm",
          "action": "a.confirm",
          "after": "t1",
          "gatedBy": "w.response",
          "prerequisites": [
            "c.what-happened"
          ],
          "purpose": "Confirm the time, how to join, and the specific problem the session will open with, taken from the step they were stuck on",
          "channelRoles": [
            "persistent"
          ],
          "mandatory": false,
          "label": "CANONICAL_RULE",
          "destination": {
            "target": "assisted-session-details",
            "boundTo": "session_id"
          }
        },
        {
          "id": "t3",
          "stage": "followup",
          "action": "a.followup",
          "after": "t2",
          "gatedBy": "w.session",
          "prerequisites": [
            "c.outcome",
            "c.followup"
          ],
          "purpose": "Send one follow-up tied to what the session actually covered.",
          "channelRoles": [
            "persistent"
          ],
          "mandatory": false,
          "label": "CANONICAL_RULE"
        },
        {
          "id": "t4",
          "stage": "final",
          "action": "a.final",
          "gatedBy": "w.response",
          "prerequisites": [
            "c.final-option"
          ],
          "purpose": "Send one final self-service option and stop.",
          "channelRoles": [
            "persistent"
          ],
          "mandatory": false,
          "label": "CANONICAL_RULE",
          "after": "t1"
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
          "person_id",
          "onboarding_instance_id",
          "stuck_step",
          "open_support_case_ref",
          "decline_cooldown_until"
        ],
        "optional": []
      }
    },
    measurement: {
      "journeyOutcome": {
        "type": "exit-or-handoff",
        "refs": [
          "x.not-eligible",
          "x.defer",
          "x.declined",
          "x.no-outcome",
          "x.normal",
          "h.activated"
        ]
      },
      "businessOutcome": {
        "event": "activation_recorded",
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
        "onboarding help",
        "struggling user rescue",
        "proactive assistance",
        "stuck in setup",
        "assisted setup offer"
      ],
      "useCases": [
        "someone returning to the same setup step repeatedly without progress",
        "a help-centre loop with no activation behind it"
      ]
    },
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
        class: "no-action",
      },
      {
        id: "c.duplicate",
        kind: "condition",
        asks: "Is a person already working this same blocker?",
        branches: [
          {
            label: "A person already has it",
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
        class: "suppression",
      },
      {
        id: "a.offer",
        kind: "action",
        does: "Offer help named against the step they keep returning to. The primary route books assisted setup; the secondary opens the specific guide for that step, for people who would rather not talk to anyone",
        next: "w.response",
        execution: "communication",
        idempotencyKey: "account_id + person_id + a.offer",
      },
      {
        id: "w.response",
        kind: "wait",
        until: [
          "assisted_session_scheduled",
          "activation_recorded",
          "assistance_declined"
        ],
        onEvent: "c.what-happened",
        timeout: {
          "after": {
            "key": "struggling_user.response",
            "rule": "A bounded response window.",
            "class": "response-window",
            "required": true
          },
          "reason": "no answer is an answer, and it does not license asking again in the same terms",
          "relativeTo": "previous-touch"
        },
        onTimeout: "c.final-option",
        windowExtendsOnEngagement: false,
        recheck: "the person or account plus the open onboarding or trial instance re-read from the system of record before acting on the timeout",
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
        class: "no-action",
      },
      {
        id: "a.confirm",
        kind: "action",
        does: "Confirm the time, how to join, and the specific problem the session will open with, taken from the step they were stuck on",
        next: "w.session",
        execution: "communication",
        idempotencyKey: "account_id + person_id + a.confirm",
      },
      {
        id: "w.session",
        kind: "wait",
        until: [
          "assisted_session_outcome_recorded",
          "booking_cancelled"
        ],
        onEvent: "c.outcome",
        timeout: {
          "after": {
            "key": "struggling_user.session",
            "rule": "The scheduled session time plus a short grace period.",
            "class": "observation-window",
            "required": true
          },
          "reason": "a booking with no recorded outcome is not evidence of anything, and waiting longer will not produce one",
          "relativeTo": "previous-touch"
        },
        onTimeout: "x.no-outcome",
        windowExtendsOnEngagement: false,
        recheck: "the person or account plus the open onboarding or trial instance re-read from the system of record before acting on the timeout",
      },
      {
        id: "x.no-outcome",
        kind: "exit",
        state: "no session outcome recorded",
        terminal: false,
        reEntry:
          "the assistance offer is not repeated on this instance; a fresh struggle after the cooldown is a new question",
        class: "timeout",
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
        execution: "communication",
        idempotencyKey: "account_id + person_id + a.followup",
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
        execution: "communication",
        idempotencyKey: "account_id + person_id + a.final",
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
        class: "success",
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

  /* ------------------------------------------------------------ ACT-16 */
  {
    id: "ACT-16",
    slug: "activation-stops-onboarding",
    category: "activation",
    goal: "progression-milestone",
    channels: [],
    name: "Activation achieved → stop onboarding → adoption handoff",
    shortName: "Onboarding Completion Handoff",
    purpose:
      "Make onboarding let go the moment activation is recorded, including the messages it has already queued.",
    entity: {
      scope: "person or account plus the onboarding instance being closed",
      note: "Only this instance closes. Another product's onboarding for the same account is untouched by this activation.",
      instanceKey: [
        "account_id",
        "person_id"
      ],
      concurrency: "one-active-per-key"
    },
    objective: "Make onboarding let go the moment activation is recorded, including the messages it has already queued.",
    eligibility: [
      "the product's own record that core value was produced",
      "no instance of this journey is already open for the person or account plus the onboarding instance being closed",
      "hard gates (GLB-31) allow communication for this purpose"
    ],
    suppressions: [
      {
        "id": "s.g1",
        "label": "CANONICAL_RULE",
        "text": "Activation is never determined by a click on an onboarding email. The message is not the milestone."
      },
      {
        "id": "s.g2",
        "label": "CANONICAL_RULE",
        "text": "Onboarding completion is not product mastery. Closing onboarding says value was produced once, nothing more."
      },
      {
        "id": "s.g3",
        "label": "CANONICAL_RULE",
        "text": "Invalidation reaches queued sends, not only future scheduling. The reminder that arrives after success is the one people remember."
      }
    ],
    implementation: {
      "attributes": {
        "required": [
          "account_id",
          "person_id",
          "onboarding_outcome",
          "suppressed_sends"
        ],
        "optional": []
      }
    },
    measurement: {
      "journeyOutcome": {
        "type": "exit-or-handoff",
        "refs": [
          "x.not-activation",
          "h.adoption"
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
        "onboarding completion",
        "activation achieved",
        "stop onboarding messages",
        "onboarding close-out"
      ],
      "useCases": [
        "core value recorded and every queued onboarding send must be invalidated",
        "a mandatory operational requirement spun off into its own lifecycle at close"
      ]
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
        class: "invalid-state",
      },
      {
        id: "a.complete",
        kind: "action",
        does: "Mark the onboarding objective complete, recording which event satisfied it - so a later question about when this account activated has one answer rather than an inference",
        writes: [{ field: "onboarding_outcome", mode: "append" }],
        next: "a.invalidate",
        idempotencyKey: "account_id + person_id + a.complete",
      },
      {
        id: "a.invalidate",
        kind: "action",
        does: "Invalidate what onboarding still has outstanding: remaining setup reminders, onboarding calls to action, incomplete-step messages that are no longer true, and assistance prompts whose purpose has just disappeared - including everything already queued",
        writes: [{ field: "suppressed_sends", mode: "append" }],
        next: "c.mandatory",
        idempotencyKey: "account_id + person_id + a.invalidate",
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
        idempotencyKey: "account_id + person_id + a.spin-off",
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
          "the use_case_id the activating event implies, minted at this handoff since no use-case concept exists prior to activation",
        ],
        suppresses: [
          "every remaining onboarding action for this instance, queued or scheduled",
        ],
        contract: { requiredFields: ["account_id", "person_id", "use_case_id"] },
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
    goal: "progression-milestone",
    channels: ["in-app", "push", "email"],
    name: "Early adoption → usage depth → habit or stable use",
    shortName: "Adoption Nurture",
    purpose:
      "Carry an account from having produced value once to producing it repeatedly, measured against its own use-case.",
    entity: {
      scope: "person or account plus the product or use-case value comes from",
      note: "Adoption is measured against the use-case that produced first value, not against the product's full surface.",
      instanceKey: [
        "account_id",
        "use_case_id"
      ],
      concurrency: "one-active-per-key"
    },
    objective: "Turn a first activation into repeated value in the same use-case: recognise what was actually produced, point at the one behaviour that would produce more, and stop the moment adoption is stable or stalls.",
    eligibility: [
      "an activation or first value-producing event is recorded for this account in a named use-case",
      "no adoption instance is already open for this account and use-case",
      "the account is not in a terminated or restricted state",
      "hard gates (GLB-31) permit lifecycle communication to the people on the account"
    ],
    suppressions: [
      {
        "id": "s.stable",
        "label": "CANONICAL_RULE",
        "text": "The moment value is produced repeatedly at the rhythm the use-case implies, adoption is stable and nothing further is sent; the lifecycle owner takes the account."
      },
      {
        "id": "s.stall",
        "label": "CANONICAL_RULE",
        "text": "When the observation window closes without repeated value the instance ends without further nurture; a nurture nudge is never sent into a stall."
      },
      {
        "id": "s.nothing-real",
        "label": "CANONICAL_RULE",
        "text": "Recognition names the real thing produced or is not sent; a next action is surfaced only when one genuinely follows from what they did."
      },
      {
        "id": "s.contest",
        "label": "CANONICAL_RULE",
        "text": "A live risk case (RET-24), an open issue under human ownership or a declared cancellation intent on the same account means adoption is not the subject; the touch is deferred and re-evaluated against current state. This journey declares no exclusion group: a contested touch defers and re-evaluates rather than competing for the window."
      },
      {
        "id": "s.permission",
        "label": "CANONICAL_RULE",
        "text": "No touch without permission for lifecycle communication; absent permission is a recorded no-action, never a fallback to another channel."
      },
      {
        "id": "s.sunset",
        "label": "CANONICAL_RULE",
        "text":
          "A standing sender-side marketing suppression stops this journey. CON-300 ends marketing contact for somebody who answered none of it, and records that decision as marketing_suppression against our own sending rather than as a withdrawal on the person's consent record - so a purpose-level permission check still reads yes and cannot see it. The suppression is a hard gate under GLB-31, held and released by CON-38, and it covers promotional and lifecycle communication alike: no instance of this journey opens against a suppressed person, and an open instance stands down rather than queueing behind it. Only permission given afresh releases it - not the passing of time, and not a purchase.",
      },
    ],
    contact: {
      "defaultPriority": "lifecycle",
      "pressureClass": "lifecycle",
      "localCap": {
        "value": {
          "key": "adoption.touches",
          "rule": "Recognition and the nudge that follows run against one budget fixed when the instance opened; a nudge is never repeated because nothing could tell whether it was seen.",
          "default": {
            "value": 2,
            "confidence": "medium",
            "basis": "corpus-rule",
            "applicableWhen": "one recognition and one behaviour nudge across the early-adoption window - the graph's own touch count"
          },
          "required": false
        },
        "appliesTo": "all"
      },
      "cooldown": {
        "key": "adoption.cooldown",
        "rule": "A second activation in the same use-case is the same relationship; a new instance opens only after the previous one has closed and the cooldown has passed.",
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
      "competition": "none"
    },
    channelStrategy: {
      "roles": [
        {
          "role": "in-session",
          "channels": [
            "in-app"
          ],
          "when": "the person is active in the product - the next behaviour is one step away and is best pointed at from inside"
        },
        {
          "role": "low-friction",
          "channels": [
            "push"
          ],
          "when": "no active session, and the behaviour nudge is short enough to land as a push"
        },
        {
          "role": "persistent",
          "channels": [
            "email"
          ],
          "when": "no active session, no push token, or the suggested behaviour has to survive until the person returns"
        }
      ],
      "fallback": "none",
      "label": "RECOMMENDED_DEFAULT"
    },
    orchestration: {
      "strategy": "single-notice",
      "touches": [
        {
          "id": "t0",
          "stage": "recognition",
          "action": "a.recognize-next",
          "prerequisites": [
            "c.next"
          ],
          "purpose": "Acknowledge the specific thing that was produced, in its own terms, and name the one action that follows from it: sharing it, repeating it, extending it. Recognition that names nothing real is worse than silence; the mutually exclusive branch of a message-variant fork, one stage.",
          "channelRoles": [
            "in-session"
          ],
          "mandatory": false,
          "label": "CANONICAL_RULE"
        },
        {
          "id": "t0-only",
          "stage": "recognition",
          "action": "a.recognize-only",
          "prerequisites": [
            "c.next"
          ],
          "purpose": "Acknowledge the specific thing that was produced, in its own terms, and say nothing more - inventing a next step would turn recognition into a pitch. The mutually exclusive branch of t0's message-variant fork, one stage.",
          "channelRoles": [
            "in-session"
          ],
          "mandatory": false,
          "label": "CANONICAL_RULE"
        },
        {
          "id": "t2",
          "stage": "behaviour-nudge",
          "action": "a.next-behavior",
          "after": "t0",
          "prerequisites": [
            "c.stable"
          ],
          "purpose": "Encourage only the next behaviour that would produce more value in this use-case; breadth is never pushed where the value is narrow.",
          "channelRoles": [
            "low-friction"
          ],
          "destination": {
            "target": "next-behaviour-in-context",
            "boundTo": "use_case_id"
          },
          "mandatory": false,
          "label": "RECOMMENDED_DEFAULT"
        }
      ],
      "noAction": [
        "s.stable",
        "s.stall",
        "s.nothing-real",
        "s.contest",
        "s.permission"
      ]
    },
    implementation: {
      "attributes": {
        "required": [
          "account_id",
          "use_case_id",
          "activation_event_id",
          "activated_at",
          "produced_artifact"
        ],
        "optional": [
          "has_active_session",
          "push_token",
          "expected_usage_rhythm",
          "next_behaviour_candidate"
        ]
      }
    },
    measurement: {
      "journeyOutcome": {
        "type": "exit-or-handoff",
        "refs": [
          "h.normal",
          "x.stalled"
        ]
      },
      "businessOutcome": {
        "event": "value_produced",
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
        "unsubscribe",
        "complaint",
        "message_after_success"
      ],
      "operational": [
        "entry_volume",
        "recognition_sent_rate",
        "nudge_count_distribution",
        "time_to_stable",
        "stall_rate"
      ]
    },
    discovery: {
      "aliases": [
        "adoption nurture",
        "feature adoption",
        "first value",
        "milestone recognition",
        "aha moment follow-up",
        "activation follow-up"
      ],
      "useCases": [
        "an account that produced its first real result and should now repeat it",
        "a workspace activated on one use-case whose next valuable behaviour is known"
      ]
    },
    entry: "t.activated",
    nodes: [
      {
        "id": "t.activated",
        "kind": "trigger",
        "event": "core_activation_completed",
        "evidence": {
          "requires": [
            "a recorded activation, with the use-case that produced it - or, where the product defines activation as first value, the first value-producing event itself: a completed workflow, a completed transaction, a published project, a generated report",
            "the artifact or result that was produced, so recognition can name it"
          ],
          "insufficientAlone": [
            "a login, a page view or a completed onboarding checklist - nothing was produced",
            "onboarding steps completed without the activation event itself",
            "an opened or clicked message"
          ],
          "source": "authoritative"
        },
        "next": "c.next"
      },
      {
        "id": "c.next",
        "kind": "condition",
        "asks": "Does a natural next action follow from what they just did?",
        "branches": [
          {
            "label": "Yes",
            "when": "something specific follows from the thing they produced - sharing it, repeating it, extending it",
            "observes": "produced_artifact and the use-case's own next step",
            "to": "a.recognize-next"
          },
          {
            "label": "No",
            "when": "nothing genuinely follows, and inventing a next step would turn recognition into a pitch",
            "observes": "produced_artifact",
            "to": "a.recognize-only"
          }
        ]
      },
      {
        "id": "a.recognize-next",
        "kind": "action",
        "does": "Acknowledge what was actually produced, in the terms of the thing itself, and name the one action that genuinely follows from it - sharing it, repeating it, extending it. Recognition that names nothing real reads as manufactured and devalues the milestones that follow",
        "execution": "communication",
        "idempotencyKey": "account_id + use_case_id + touch id",
        "writes": [
          {
            "field": "adoption_log",
            "mode": "append"
          }
        ],
        "next": "w.observe"
      },
      {
        "id": "a.recognize-only",
        "kind": "action",
        "does": "Acknowledge what was actually produced, in the terms of the thing itself, and say nothing more - inventing a next step would turn recognition into a pitch. Recognition that names nothing real reads as manufactured and devalues the milestones that follow",
        "execution": "communication",
        "idempotencyKey": "account_id + use_case_id + touch id",
        "writes": [
          {
            "field": "adoption_log",
            "mode": "append"
          }
        ],
        "next": "w.observe"
      },
      {
        id: "c.stable",
        kind: "condition",
        asks: "Has adoption become stable?",
        branches: [
          {
            label: "Stable",
            when: "value is being produced repeatedly at the rhythm this use-case implies, without prompting",
            observes: "value-producing usage - how often, how deep, whether success repeats, whether others are involved where the use-case needs them; activity that produces nothing does not count toward it, however much of it there is",
            to: "h.normal",
          },
          {
            label: "Not yet",
            when: "value has been produced but not reliably repeated",
            observes: "value-producing usage - how often, how deep, whether success repeats, whether others are involved where the use-case needs them; activity that produces nothing does not count toward it, however much of it there is",
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
        contract: {
          "requiredFields": [
            "account_id",
            "use_case_id",
            "settled_rhythm",
            "stabilised_at"
          ]
        },
      },
      {
        id: "a.next-behavior",
        kind: "action",
        does: "Identify the next behaviour that would actually produce more value for this use-case, and encourage only that. Breadth is not pursued where the value is narrow - a person who gets everything they need from one workflow is adopted, not under-adopted",
        next: "w.confirm",
        execution: "communication",
        idempotencyKey: "account_id + use_case_id + touch id + observation cycle",
        attemptBudget: {
          "key": "adoption.nudge_budget",
          "rule": "Behaviour nudges run against a budget fixed when the instance opened; when it is spent the instance waits out the observation window silently.",
          "default": {
            "value": 3,
            "confidence": "low",
            "basis": "example-only"
          },
          "required": false
        },
      },
      {
        id: "w.observe",
        kind: "wait",
        until: [
          "value_produced"
        ],
        onEvent: "c.stable",
        timeout: {
          "after": {
            "key": "adoption.observation_window",
            "rule": "The early-adoption window is the product's own intended usage rhythm for this use-case; a weekly product and a twice-a-year product cannot share one, and a shared window reports every seasonal account as failing.",
            "class": "observation-window",
            "required": true
          },
          "reason": "a weekly product and a twice-a-year product cannot share a window, and a shared one would report every seasonal account as failing",
          "relativeTo": "previous-touch"
        },
        onTimeout: "x.stalled",
        windowExtendsOnEngagement: false,
        recheck: "value-producing usage re-read from the product's own record - not activity, not logins",
      },
      {
        id: "w.confirm",
        kind: "wait",
        until: [
          "value_produced"
        ],
        onEvent: "c.stable-after-nudge",
        timeout: {
          "after": {
            "key": "adoption.observation_window",
            "rule": "The early-adoption window is the product's own intended usage rhythm for this use-case; a weekly product and a twice-a-year product cannot share one, and a shared window reports every seasonal account as failing.",
            "class": "observation-window",
            "required": true
          },
          "reason": "the same observation window applies after the nudge as before it - the use-case's rhythm has not changed",
          "relativeTo": "previous-touch"
        },
        onTimeout: "x.stalled",
        windowExtendsOnEngagement: false,
        recheck: "value-producing usage re-read from the product's own record - not activity, not logins",
      },
      {
        id: "c.stable-after-nudge",
        kind: "condition",
        asks: "Is it repeating now?",
        branches: [
          {
            label: "Yes",
            when: "value is being produced repeatedly at the rhythm this use-case implies, following the nudge",
            observes: "value-producing usage - how often, how deep, whether success repeats, whether others are involved where the use-case needs them; activity that produces nothing does not count toward it, however much of it there is",
            to: "h.normal",
          },
          {
            label: "Still not",
            when: "the nudge went out and value still has not repeated, and the nudge budget is not yet spent",
            observes: "value-producing usage - how often, how deep, whether success repeats, whether others are involved where the use-case needs them; activity that produces nothing does not count toward it, however much of it there is",
            to: "a.next-behavior",
          },
        ],
      },
      {
        id: "x.stalled",
        kind: "exit",
        state: "stalled; the early-adoption window passed, before or after the one behaviour nudge, without value repeating",
        class: "failure",
        terminal: false,
        reEntry: "a fresh activation in the same use-case opens its own instance",
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

  /* ------------------------------------------------------------ ACT-20 */
  {
    id: "ACT-20",
    slug: "dormant-non-customer-reactivation",
    category: "activation",
    goal: "relationship-recovery-intervention",
    channels: ["email"],
    name: "Dormant non-customer reactivation → return → re-qualification or exit",
    shortName: "Dormant Lead Reactivation",
    purpose:
      "Make one bounded attempt to restart a relationship that never became a paying one, and judge the result on what the person actually did.",
    entity: {
      scope: "person, lead or inactive non-customer account, in the context that went dormant",
      note: "Dormancy is per context. Someone inactive in one product may be perfectly active in another, and this journey is not about them.",
      instanceKey: [
        "lead_id",
        "context_id"
      ],
      concurrency: "one-active-per-key"
    },
    distinctFrom: [
      {
        journey: "ACQ-07",
        because:
          "Decay retires an intent state that is no longer credible. This tries to restart a relationship that had already started, and it only applies where money never changed hands.",
      },
    ],
    objective: "Make one bounded attempt to restart a relationship that never became a paying one, and judge the result on what the person actually did.",
    eligibility: [
      "a previously engaged relationship that has passed the inactivity threshold defined for this context",
      "no instance of this journey is already open for the person",
      "hard gates (GLB-31) allow communication for this purpose"
    ],
    suppressions: [
      {
        "id": "s.g1",
        "label": "CANONICAL_RULE",
        "text": "Success is a meaningful return, never an open or a click. The message is not the outcome."
      },
      {
        "id": "s.g2",
        "label": "CANONICAL_RULE",
        "text": "Former paying customers are out of scope. Win-back is a different journey with different economics."
      },
      {
        "id": "s.g3",
        "label": "CANONICAL_RULE",
        "text": "Repeated inactivity does not create repeated campaigns. Each attempt needs its own reason."
      },
      {
        "id": "s.sunset",
        "label": "CANONICAL_RULE",
        "text":
          "A standing sender-side marketing suppression stops this journey. CON-300 ends marketing contact for somebody who answered none of it, and records that decision as marketing_suppression against our own sending rather than as a withdrawal on the person's consent record - so a purpose-level permission check still reads yes and cannot see it. The suppression is a hard gate under GLB-31, held and released by CON-38, and it covers promotional and lifecycle communication alike: no instance of this journey opens against a suppressed person, and an open instance stands down rather than queueing behind it. Only permission given afresh releases it - not the passing of time, and not a purchase.",
      },
      {
        "id": "s.onboarding-open",
        "label": "CANONICAL_RULE",
        "text": "An onboarding instance already open for this person is a current lifecycle in motion, not dormancy; this journey does not open while one is open, and an open instance stands down if one opens.",
      },
    ],
    contact: {
      "defaultPriority": "promotional",
      "pressureClass": "promotional",
      "localCap": {
        "value": {
          "key": "dormant_non.touches",
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
        "key": "dormant_non.cooldown",
        "rule": "The cooldown between instances of this journey for the same person, so that a re-qualifying person is tracked but not messaged again inside it.",
        "class": "cooldown",
        "required": true
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
      "fallback": "none",
      "label": "RECOMMENDED_DEFAULT"
    },
    orchestration: {
      "strategy": "single-notice",
      "touches": [
        {
          "id": "t1",
          "stage": "attempt",
          "action": "a.attempt",
          "prerequisites": [
            "c.never-monetized",
            "c.reason"
          ],
          "purpose": "Make one bounded attempt built on the recorded reason.",
          "channelRoles": [
            "persistent"
          ],
          "mandatory": false,
          "label": "CANONICAL_RULE",
          "destination": {
            "target": "return-route-for-reason",
            "boundTo": "context_id",
            "mustNotClaim": [
              "that they have been missed",
              "an offer policy does not enable"
            ]
          }
        }
      ],
      "noAction": [
        "s.g1",
        "s.g2",
        "s.g3",
        "s.onboarding-open"
      ]
    },
    implementation: {
      "attributes": {
        "required": [
          "lead_id",
          "context_id",
          "last_engaged_at",
          "inactivity_threshold",
          "recorded_reason",
          "monetisation_history"
        ],
        "optional": []
      }
    },
    measurement: {
      "journeyOutcome": {
        "type": "exit-or-handoff",
        "refs": [
          "x.winback",
          "x.no-reason",
          "x.engagement-only",
          "x.sunset",
          "x.resumed",
          "h.intent",
          "h.qualify"
        ]
      },
      "businessOutcome": {
        "event": "meaningful_return",
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
        "dormant lead reactivation",
        "reactivation",
        "dormant non-customer",
        "re-engagement (non-customer)",
        "cold lead revival"
      ],
      "useCases": [
        "a trial or lead that engaged, never paid, and went quiet past the product's own rhythm",
        "one bounded attempt built on the recorded reason for the dormancy"
      ]
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
        class: "invalid-state",
      },
      {
        id: "a.reason",
        kind: "action",
        does: "Establish whether there is a credible reason to come back: setup they never finished, an interest they expressed, something now relevant that was not before, a destination left incomplete, or a real change in the product",
        next: "c.reason",
      },
      {
        id: "c.reason",
        kind: "condition",
        asks: "Is there a credible reason to make one attempt?",
        branches: [
          {
            label: "A specific reason exists",
            when: "something specific to come back for - setup never finished, an interest expressed, something now relevant, a real product change",
            to: "a.attempt",
          },
          {
            label: "No specific reason",
            when: "no specific reason exists; dormancy alone is never a reason by itself",
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
        class: "no-action",
      },
      {
        id: "a.attempt",
        kind: "action",
        does: "Make one bounded attempt built on the recorded reason. Not a general note that they have been missed, which says nothing and asks for nothing",
        next: "w.return",
        execution: "communication",
        idempotencyKey: "lead_id + context_id + a.attempt",
      },
      {
        id: "w.return",
        kind: "wait",
        until: [
          "meaningful_return"
        ],
        onEvent: "a.inspect",
        timeout: {
          "after": {
            "key": "dormant_non.return",
            "rule": "The reactivation window.",
            "class": "response-window",
            "required": true
          },
          "reason": "the window is what stops repeated dormancy from turning into a permanent campaign aimed at people who have already stopped answering",
          "relativeTo": "previous-touch"
        },
        onTimeout: "x.sunset",
        windowExtendsOnEngagement: false,
        recheck: "the person re-read from the system of record before acting on the timeout",
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
            to: "x.resumed",
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
        id: "x.resumed",
        kind: "exit",
        state: "returned into unfinished setup; the milestones already completed stand, and the account resumes rather than restarts",
        terminal: false,
        reEntry: "a further return re-reads the same milestone record",
        class: "success",
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
        class: "invalid-state",
      },
      {
        id: "x.sunset",
        kind: "exit",
        state: "reactivation window closed, cooldown in force",
        terminal: false,
        reEntry:
          "only a new reason, not a longer silence; repeated dormancy does not entitle anyone to repeated campaigns",
        class: "timeout",
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
