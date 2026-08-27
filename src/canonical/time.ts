import type { CanonicalJourney, OrchestrationRule } from "./types";

/* CATEGORY 7 - TIME, DEADLINES, EXPIRY & TEMPORARY STATES

   Time is in this library only where it changes a business state. A date that
   schedules a message is a campaign setting; a date after which someone loses
   access is a lifecycle mechanism, and only the second kind is here.

   The category is built on one asymmetry. Every other trigger in this library
   is something that happened - a purchase, a decision, a signal. A timer is
   something that was *predicted* to happen, recorded at a moment that has now
   passed. By the time it fires, the world it was written against may be gone:
   the obligation was met, the entity was renewed, someone extended it, a newer
   change superseded it, or the same job already ran.

   So almost every journey here opens the same way - re-read the authoritative
   current state before acting on what the timer remembers. TIM-64 and TIM-70
   exist almost entirely for that step. It is the difference between a schedule
   and a decision.

   The separations the category protects:

     a reminder date        is not   a business deadline
     a deadline reached     is not   an outcome
     expiring               is not   expired
     expired                is not   revoked
     grace                  is not   active
     temporary              is not   permanent, unless nobody wrote an ending

   The last one is the quietest failure in the whole library: a temporary state
   with no exit rule is a permanent state that nobody decided to create. */

export const TIME_RULES: readonly OrchestrationRule[] = [
  {
    id: "TIM-R1",
    scope: "time",
    rule: "Time passing is not a business outcome unless the governing state machine explicitly defines it as one.",
    because:
      "A timer firing proves only that a clock advanced. Reading it as failure, expiry or consent converts an absence of information into a decision nobody made.",
  },
  {
    id: "TIM-R2",
    scope: "time",
    rule: "Deadline, due state, expiry, grace and temporary state are five separate concepts.",
    because:
      "They share a date field and nothing else. Collapsing them produces systems where a missed deadline revokes access and an expiry is treated as a reminder.",
  },
  {
    id: "TIM-R3",
    scope: "time",
    rule: "Expiring and expired are separate states, and nothing acts on the first as though it were the second.",
    because:
      "The whole value of a pre-expiry window is that the outcome can still change. A system that treats them alike has no window, only an early notification of a decision already taken.",
  },
  {
    id: "TIM-R4",
    scope: "time",
    rule: "Every scheduled future transition re-reads the authoritative current state at execution time.",
    because:
      "The schedule was written against a version of the world that no longer has to exist. Execution is the only moment at which that can be checked, and skipping it is what makes stale automation.",
  },
  {
    id: "TIM-R5",
    scope: "time",
    rule: "An older timer never overwrites a newer authoritative change or extension.",
    because:
      "Jobs fire in the order they were scheduled, not the order decisions were made, so without this the most recent decision is the one most likely to be undone.",
  },
  {
    id: "TIM-R6",
    scope: "time",
    rule: "A temporary state carries an explicit expiry or an explicit exit condition.",
    because:
      "A time-bound state with no ending is an unmanaged permanent state, and it is invisible precisely because everyone remembers granting it as temporary.",
  },
  {
    id: "TIM-R7",
    scope: "time",
    rule: "Grace is a degraded continuity state, not a normal active one, and it names which capabilities continue.",
    because:
      "A grace period that behaves identically to active has no purpose except to delay a decision, and nobody downstream can tell which one an entity is actually in.",
  },
  {
    id: "TIM-R8",
    scope: "time",
    rule: "A reversal restores only what is independently still valid. It does not rewind the side effects of the original transition.",
    because:
      "Restoring an entity wholesale resurrects withdrawn consent, revoked credentials and cancelled integrations, each of which ended for its own reason that reversal never addressed.",
  },
  {
    id: "TIM-R9",
    scope: "time",
    rule: "An expired entity re-enters through renewal, replacement or requalification - never by editing the expiry away.",
    because:
      "Moving a timestamp makes the entity active without making it valid, and it destroys the record of the period during which it was not.",
  },
  {
    id: "TIM-R10",
    scope: "time",
    rule: "Completing an obligation invalidates the reminders and escalations queued against it.",
    because:
      "The nudge that arrives after someone has already done the thing is the most reliable signal a customer gets that nothing is watching.",
  },
  {
    id: "TIM-R11",
    scope: "time",
    rule: "Timezone and authoritative timestamp semantics are explicit wherever they change a business outcome.",
    because:
      "A deadline at midnight is a different deadline in two places, and the ambiguity only surfaces in the cases where it cost someone something.",
  },
  {
    id: "TIM-R12",
    scope: "time",
    rule: "Timer-driven actions are idempotent. A redelivered job applies its transition once or not at all.",
    because:
      "Schedulers retry by design, so an action that is not idempotent is not a bug that might happen - it is one waiting for its first redelivery.",
  },
  {
    id: "TIM-R13",
    scope: "time",
    rule: "An extension or renewal supersedes the expiry actions scheduled under the previous validity.",
    because:
      "Without it the extension is granted and the old expiry still fires, which is worse than never having extended anything.",
  },
  {
    id: "TIM-R14",
    scope: "time",
    rule: "A scheduled action does not replay once its underlying obligation has already been resolved.",
    because:
      "The obligation is the thing the schedule existed to serve; once it is met the job is not early or late, it is meaningless.",
  },
];

export const TIME_JOURNEYS: readonly CanonicalJourney[] = [
  /* ------------------------------------------------------------ TIM-61 */
  {
    id: "TIM-61",
    slug: "deadline-tracking",
    category: "time",
    goal: "escalation-exception",
    name: "Deadline created → track → complete, escalate or expire",
    purpose:
      "Let a deadline govern the state of one obligation, rather than schedule messages around a date.",
    entity: {
      scope: "the obligation the deadline is attached to - a task, request, case or application",
      note: "The deadline belongs to the obligation. Two obligations sharing a date are two deadlines, and one being met says nothing about the other.",
    },
    distinctFrom: [
      {
        journey: "TIM-63",
        because:
          "A deadline is a moment by which something must be done. An expiry is a moment at which something stops being valid. The first can pass with the obligation intact; the second cannot.",
      },
    ],
    entry: "t.deadline",
    nodes: [
      {
        id: "t.deadline",
        kind: "trigger",
        event: "authoritative_deadline_assigned",
        evidence: {
          requires: [
            "a deadline assigned to a specific obligation by a system or rule entitled to set one",
          ],
          insufficientAlone: [
            "a reminder date configured in a messaging tool, which schedules communication rather than governing an obligation",
            "an internal target with no consequence attached to missing it",
          ],
          source: "authoritative",
        },
        next: "a.store",
      },
      {
        id: "a.store",
        kind: "action",
        does: "Store the deadline with its timezone where that changes the answer, its source, the obligation it governs, its owner, and what would count as completion. The completion condition is the load-bearing part - a deadline that cannot say what would satisfy it can only ever measure elapsed time",
        writes: [{ field: "deadline_log", mode: "append" }],
        next: "w.tracking",
      },
      {
        id: "w.tracking",
        kind: "wait",
        until: ["the obligation is completed", "a defined pre-deadline threshold is reached"],
        onEvent: "c.what",
        timeout: {
          after: "the deadline itself",
          reason:
            "the deadline is an absolute point, so this wait is bounded by it however many thresholds sit inside",
        },
        onTimeout: "c.consequence",
        windowExtendsOnEngagement: false,
      },
      {
        id: "c.what",
        kind: "condition",
        asks: "Which happened?",
        branches: [
          {
            label: "Completed",
            when: "the completion condition recorded with the deadline is satisfied",
            to: "a.satisfied",
          },
          {
            label: "Pre-deadline threshold",
            when: "a defined point before the deadline was reached with the obligation still open",
            to: "c.useful",
          },
        ],
      },
      {
        id: "a.satisfied",
        kind: "action",
        does: "Mark the obligation satisfied and invalidate every reminder and escalation still queued against it. A completed obligation is never reopened by a stale deadline job, which is the specific way a finished thing comes back to life",
        writes: [
          { field: "deadline_log", mode: "append" },
          { field: "suppressed_sends", mode: "append" },
        ],
        next: "x.satisfied",
      },
      {
        id: "x.satisfied",
        kind: "exit",
        state: "obligation satisfied before its deadline",
        terminal: false,
        reEntry: "a new obligation carries its own deadline; this one is closed",
      },
      {
        id: "c.useful",
        kind: "condition",
        asks: "Is a pre-deadline reminder useful here, and does policy define one?",
        branches: [
          {
            label: "Send it",
            when: "policy defines a reminder at this threshold and the recipient can still act on it",
            to: "a.remind",
          },
          {
            label: "Nothing to send",
            when: "no reminder is defined, or nobody can do anything differently on hearing it",
            to: "w.tracking",
          },
        ],
      },
      {
        id: "a.remind",
        kind: "action",
        does: "Send the reminder defined for this threshold. The reminder schedule is not the deadline and does not move it - a deadline nobody was reminded about is still the deadline",
        next: "w.tracking",
      },
      {
        id: "c.consequence",
        kind: "condition",
        asks: "The deadline passed with the obligation open - what does the governing rule say happens?",
        branches: [
          {
            label: "OVERDUE",
            when: "the obligation survives its deadline and changes operational state",
            to: "h.overdue",
          },
          {
            label: "ESCALATED",
            when: "the rule raises it rather than changing the obligation itself",
            to: "h.escalate",
          },
          {
            label: "EXPIRED",
            when: "the obligation itself ceases to be valid at the deadline",
            to: "h.expired",
          },
          {
            label: "FAILED",
            when: "the rule explicitly defines missing this deadline as failure",
            to: "x.failed",
          },
          {
            label: "STILL_VALID",
            when: "the deadline was a target and passing it changes nothing about the obligation",
            to: "x.still-valid",
          },
        ],
      },
      {
        id: "h.overdue",
        kind: "handoff",
        to: "TIM-62",
        on: "an obligation surviving its deadline",
        carries: ["the obligation and its original deadline history", "the owner it was assigned to"],
      },
      {
        id: "h.escalate",
        kind: "handoff",
        to: "OWN-55",
        on: "a deadline whose governing rule escalates rather than changing the obligation",
        carries: ["the obligation, its deadline and how long it has been open"],
      },
      {
        id: "h.expired",
        kind: "handoff",
        to: "TIM-64",
        on: "a deadline at which the obligation itself ceases to be valid",
        carries: ["the obligation and the validity period now ending"],
      },
      {
        id: "x.failed",
        kind: "exit",
        state: "obligation failed at its deadline, as the rule defines",
        terminal: false,
        reEntry:
          "a new attempt is a new obligation with its own deadline; this one records that it was not met",
      },
      {
        id: "x.still-valid",
        kind: "exit",
        state: "deadline passed, obligation unchanged",
        terminal: false,
        reEntry:
          "the obligation continues under whatever governs it - time passing did not decide anything here, which is the ordinary case and not an omission",
      },
    ],
    guardrails: [
      "A deadline being reached is not failure unless the governing rule says so. Five different outcomes are available and only one of them is failure.",
      "The reminder schedule is not the deadline. Moving a reminder does not move the obligation.",
      "A completed obligation is not reopened by a stale deadline job.",
      "Timezone is recorded wherever it changes which day the deadline falls on.",
    ],
    reusableRule:
      "A deadline should govern the state of a specific obligation rather than merely schedule communication around a date.",
  },

  /* ------------------------------------------------------------ TIM-62 */
  {
    id: "TIM-62",
    slug: "due-state-change",
    category: "time",
    goal: "escalation-exception",
    name: "Due-state change → recalculate priority → resolve or escalate",
    purpose:
      "Change what an unresolved obligation costs operationally when it becomes due or overdue, rather than only announcing that it has.",
    entity: {
      scope: "the obligation or work item whose due state changed",
      note: "Due state is a property of the obligation, not of the person waiting on it. Overdue work does not automatically mean overdue communication.",
    },
    entry: "t.due",
    nodes: [
      {
        id: "t.due",
        kind: "trigger",
        event: "due_state_changed",
        evidence: {
          requires: ["an obligation entering DUE_SOON, DUE or OVERDUE against a real deadline"],
          insufficientAlone: [
            "a report showing an item as old, with no deadline behind it",
          ],
          source: "authoritative",
        },
        next: "a.reread",
      },
      {
        id: "a.reread",
        kind: "action",
        does: "Read the obligation's current authoritative state now, rather than trusting the state it held when the timer was set",
        next: "c.satisfied",
      },
      {
        id: "c.satisfied",
        kind: "condition",
        asks: "Has the obligation already been satisfied?",
        branches: [
          {
            label: "Already done",
            when: "it was completed between the timer being set and firing",
            to: "a.suppress",
          },
          {
            label: "Still open",
            when: "the obligation genuinely remains unresolved",
            to: "c.owner",
          },
        ],
      },
      {
        id: "a.suppress",
        kind: "action",
        does: "Suppress the stale due-state action. Becoming overdue changes nothing about an obligation that no longer exists",
        writes: [{ field: "suppressed_sends", mode: "append" }],
        next: "x.stale",
      },
      {
        id: "x.stale",
        kind: "exit",
        state: "stale due-state action suppressed",
        terminal: false,
        reEntry: "a genuinely open obligation crossing a due threshold enters properly",
      },
      {
        id: "c.owner",
        kind: "condition",
        asks: "Does this obligation have an owner?",
        branches: [
          {
            label: "Owned",
            when: "an active owner is responsible for it",
            to: "a.priority",
          },
          {
            label: "Unowned",
            when: "no active owner holds it - which is why it went overdue",
            to: "h.orphan",
          },
        ],
      },
      {
        id: "h.orphan",
        kind: "handoff",
        to: "OWN-51",
        on: "an overdue obligation with nobody responsible for it",
        carries: [
          "the obligation and how long it has been overdue",
          "the original deadline, which the routing does not reset",
        ],
      },
      {
        id: "a.priority",
        kind: "action",
        does: "Recalculate the obligation's operational priority, and notify only where a notification would change what someone does. The original deadline history is appended to rather than overwritten - what it was due by and what it became are two facts",
        writes: [{ field: "deadline_log", mode: "append" }],
        next: "c.consequence",
      },
      {
        id: "c.consequence",
        kind: "condition",
        asks: "Is a consequence defined for this obligation being overdue?",
        branches: [
          {
            label: "Escalation",
            when: "policy raises it to a level able to resolve it",
            to: "h.escalate",
          },
          {
            label: "Restriction or failure",
            when: "policy applies a defined operational consequence to the entity itself",
            to: "h.consequence",
          },
          {
            label: "None defined",
            when: "the obligation is simply overdue and no consequence attaches to that",
            to: "x.tracked",
          },
        ],
      },
      {
        id: "h.escalate",
        kind: "handoff",
        to: "OWN-55",
        on: "an overdue obligation whose policy escalates it",
        carries: ["the obligation, its owner and its elapsed overdue time"],
      },
      {
        id: "h.consequence",
        kind: "handoff",
        to: "external:overdue-consequence",
        on: "an overdue obligation carrying a defined operational consequence",
        carries: ["the obligation and the consequence its policy specifies"],
      },
      {
        id: "x.tracked",
        kind: "exit",
        state: "overdue and tracked; no consequence defined",
        terminal: false,
        reEntry:
          "resolution closes it and a further due threshold re-opens it. An overdue item with no defined consequence is a reporting fact, and inventing a consequence to have something to do with it is the failure this branch prevents",
      },
    ],
    guardrails: [
      "The overdue state and its consequences are business-defined. Where no consequence exists, the item is tracked rather than acted on.",
      "Not every overdue item requires customer communication. Most overdue work is an internal problem.",
      "Due-state changes append to the deadline history rather than overwriting the original deadline.",
    ],
    reusableRule:
      "Becoming overdue changes the operational state of an unresolved obligation only when the underlying obligation still exists.",
  },

  /* ------------------------------------------------------------ TIM-63 */
  {
    id: "TIM-63",
    slug: "pre-expiry-window",
    category: "time",
    goal: "expiry-renewal",
    name: "Expiry approaching → eligibility check → renew, complete or let expire",
    purpose:
      "Use the window before an expiry only where acting inside it could actually change what happens.",
    entity: {
      scope: "the time-bound entity approaching expiry - a subscription, document, entitlement, credential, approval, reservation, benefit or agreement",
      note: "One window per entity. A person holding three expiring credentials has three windows, and renewing one closes only its own.",
    },
    distinctFrom: [
      {
        journey: "TIM-64",
        because:
          "This runs while the outcome can still change. TIM-64 runs at the moment it stops being able to. Keeping them apart is what makes expiring and expired different states rather than the same one announced twice.",
      },
    ],
    entry: "t.window",
    nodes: [
      {
        id: "t.window",
        kind: "trigger",
        event: "pre_expiry_window_entered",
        evidence: {
          requires: [
            "a time-bound entity entering a pre-expiry window whose length reflects how long acting on it actually takes",
          ],
          insufficientAlone: [
            "a fixed interval applied to every entity type regardless of what renewal involves",
          ],
          source: "authoritative",
        },
        next: "a.reread",
      },
      {
        id: "a.reread",
        kind: "action",
        does: "Re-read the entity's current state. The window opened on a schedule, and the entity may have been renewed, replaced or completed since that schedule was written",
        next: "c.already",
      },
      {
        id: "c.already",
        kind: "condition",
        asks: "Has it already been renewed, replaced or completed?",
        branches: [
          {
            label: "Already resolved",
            when: "the entity is no longer heading toward this expiry",
            to: "x.suppressed",
          },
          {
            label: "Still expiring",
            when: "the expiry still applies",
            to: "c.action",
          },
        ],
      },
      {
        id: "x.suppressed",
        kind: "exit",
        state: "pre-expiry journey suppressed; nothing is expiring",
        terminal: false,
        reEntry: "the replacement entity has its own expiry and its own window",
      },
      {
        id: "c.action",
        kind: "condition",
        asks: "Is an action available that would materially change the outcome?",
        branches: [
          {
            label: "Action available",
            when: "renewal, completion or replacement is possible and someone can carry it out",
            to: "a.actor",
          },
          {
            label: "Nothing can be done",
            when: "the expiry will happen regardless - no renewal exists, or the decision is not the holder's to make",
            to: "c.informational",
          },
        ],
      },
      {
        id: "a.actor",
        kind: "action",
        does: "Establish who is responsible for acting and what the action actually is. A pre-expiry message addressed to someone who cannot perform the renewal is a notification pretending to be a call to action",
        next: "w.resolution",
      },
      {
        id: "c.informational",
        kind: "condition",
        asks: "Is telling anyone useful even though nothing can be done?",
        branches: [
          {
            label: "Worth saying",
            when: "the holder needs to plan around it, or would otherwise be surprised",
            to: "a.inform",
          },
          {
            label: "Not worth saying",
            when: "nobody gains anything from knowing earlier",
            to: "x.silent",
          },
        ],
      },
      {
        id: "a.inform",
        kind: "action",
        does: "Say what will happen and when, with no call to action attached - because there is no action. A prompt to act where acting is impossible is worse than silence",
        next: "w.resolution",
      },
      {
        id: "x.silent",
        kind: "exit",
        state: "expiring, nothing to do and nothing worth saying",
        terminal: false,
        reEntry: "the expiry itself is handled at the moment it arrives",
      },
      {
        id: "w.resolution",
        kind: "wait",
        until: ["renewed", "completed", "replaced"],
        onEvent: "a.invalidate",
        timeout: {
          after: "the expiry moment",
          reason:
            "the window closes at the expiry by definition; what happens then belongs to the expiry journey rather than to this one",
        },
        onTimeout: "h.expiry",
        windowExtendsOnEngagement: false,
      },
      {
        id: "a.invalidate",
        kind: "action",
        does: "Invalidate the expiry actions queued against the old validity, so a renewal granted today is not undone by an expiry scheduled yesterday",
        writes: [{ field: "suppressed_sends", mode: "append" }],
        next: "h.resolved",
      },
      {
        id: "h.resolved",
        kind: "handoff",
        to: "external:renewal-lifecycle",
        on: "an entity resolved before its expiry",
        carries: [
          "the entity and its new validity period",
          "the old expiry, now invalidated, so nothing downstream still holds it",
        ],
        suppresses: ["every expiry action scheduled under the previous validity"],
      },
      {
        id: "h.expiry",
        kind: "handoff",
        to: "TIM-64",
        on: "the window closing without resolution",
        carries: ["the entity and what was attempted during the window"],
      },
    ],
    guardrails: [
      "Expiring is not expired. Nothing in this journey applies an expiry consequence.",
      "No expiry reminder is sent where no action is possible or useful. A prompt to act on something nobody can act on teaches people to ignore the ones that matter.",
      "The pre-expiry window reflects how long the action genuinely takes, not a shared default.",
    ],
    reusableRule:
      "Pre-expiry orchestration should exist only when action before expiry can materially change the outcome.",
  },

  /* ------------------------------------------------------------ TIM-64 */
  {
    id: "TIM-64",
    slug: "expiry-execution",
    category: "time",
    goal: "expiry-renewal",
    name: "Expiry reached → validate current state → expire, extend or replace",
    purpose:
      "Check what the entity actually is at the moment the expiry fires, before applying anything the timer was written to apply.",
    entity: {
      scope: "the time-bound entity and the specific version of it the timer was scheduled against",
      note: "The version binding is the point. A timer scheduled against one version firing against another is the defining failure of scheduled work.",
    },
    entry: "t.reached",
    nodes: [
      {
        id: "t.reached",
        kind: "trigger",
        event: "expiry_time_reached",
        evidence: {
          requires: ["an authoritative expiry moment arriving for a time-bound entity"],
          source: "authoritative",
        },
        next: "a.reread",
      },
      {
        id: "a.reread",
        kind: "action",
        does: "Re-read the entity's current authoritative version at this moment. The timer holds the expiry that was true when it was written, which is not necessarily the expiry that is true now",
        next: "c.state",
      },
      {
        id: "c.state",
        kind: "condition",
        asks: "What does the entity's current version say?",
        branches: [
          {
            label: "Already renewed or replaced",
            when: "the entity moved on and this expiry no longer describes it",
            to: "x.stale",
          },
          {
            label: "A later extension exists",
            when: "an authoritative extension moved the expiry past this moment",
            to: "a.extension",
          },
          {
            label: "Still valid, expiry applies",
            when: "the current version still carries this expiry",
            to: "a.expire",
          },
        ],
      },
      {
        id: "x.stale",
        kind: "exit",
        state: "stale expiry suppressed; the entity had already moved",
        terminal: false,
        reEntry: "the entity's current expiry, whatever it now is, has its own execution",
      },
      {
        id: "a.extension",
        kind: "action",
        does: "Adopt the new authoritative expiry and invalidate this one. An older timer never overrides a later extension - the extension was a decision and the timer is only a memory of an earlier one",
        writes: [
          { field: "expiry_log", mode: "append" },
          { field: "suppressed_sends", mode: "append" },
        ],
        next: "x.rescheduled",
      },
      {
        id: "x.rescheduled",
        kind: "exit",
        state: "expiry superseded by an extension",
        terminal: false,
        reEntry: "the new expiry executes on its own terms when it arrives",
      },
      {
        id: "a.expire",
        kind: "action",
        does: "Transition the entity to EXPIRED, keeping the record of the period during which it was valid. Expired is a new state on the same entity, not the erasure of the old one. The transition is applied idempotently, so a redelivered job cannot expire it twice",
        writes: [{ field: "expiry_log", mode: "append" }],
        next: "a.consequences",
      },
      {
        id: "a.consequences",
        kind: "action",
        does: "Apply the consequences defined for this entity type - access ending, a reservation released, a benefit becoming unavailable, a credential invalid, renewal no longer possible, requalification required. The consequence belongs to the entity rather than to expiry in general, and expiring is not the same as revoking",
        writes: [{ field: "expiry_log", mode: "append" }],
        next: "h.post",
      },
      {
        id: "h.post",
        kind: "handoff",
        to: "TIM-69",
        on: "an entity having expired",
        carries: [
          "the expired entity and the consequences applied",
          "its validity history, which is what any later re-entry is judged against",
        ],
      },
    ],
    guardrails: [
      "An old scheduled expiry never overrides a later extension.",
      "The expired state preserves the previous validity history rather than replacing it.",
      "Expiry consequences are entity-specific. Expired is not revoked, and neither is a synonym for the other.",
      "The transition is idempotent; a redelivered job applies it once or not at all.",
    ],
    reusableRule:
      "Expiry must be evaluated against the entity's current authoritative version at the moment the transition executes.",
  },

  /* ------------------------------------------------------------ TIM-65 */
  {
    id: "TIM-65",
    slug: "grace-period",
    category: "time",
    goal: "suspension-restoration",
    name: "Grace period entry → temporary continuity → recover or terminate",
    purpose:
      "Keep limited continuity while something recoverable is unresolved, without pretending the normal active state still exists.",
    entity: {
      scope: "the subscription, account, entitlement or obligation whose primary validity ended",
      note: "Grace is a state on the entity, with its own capability set. Anything reading the entity has to be able to tell grace from active, which is why the capabilities are recorded rather than assumed.",
    },
    distinctFrom: [
      {
        journey: "TIM-67",
        because:
          "Grace is a specific degraded continuity after validity ends, with a recovery condition. TIM-67 is the generic mechanism for any temporary state, most of which are not degradations of anything.",
      },
    ],
    entry: "t.grace",
    nodes: [
      {
        id: "t.grace",
        kind: "trigger",
        event: "primary_validity_ended_with_grace_policy",
        evidence: {
          requires: [
            "primary validity ending, and a grace policy that applies to this entity type",
          ],
          insufficientAlone: [
            "an informal tolerance nobody wrote down, which is not grace but inconsistency",
          ],
          source: "authoritative",
        },
        next: "a.record",
      },
      {
        id: "a.record",
        kind: "action",
        does: "Record the grace start, its end, the reason, the recovery condition, and explicitly which capabilities continue and which are restricted. A grace state that does not say what still works is indistinguishable from active, which removes the only reason to have named it",
        writes: [{ field: "grace_log", mode: "append" }],
        next: "w.grace",
      },
      {
        id: "w.grace",
        kind: "wait",
        until: ["the recovery condition is satisfied"],
        onEvent: "c.eligibility",
        timeout: {
          after: "the grace end recorded at entry",
          reason:
            "grace is bounded at the moment it is granted and does not extend itself - a grace period that quietly lengthens is an active state nobody approved",
        },
        onTimeout: "c.terminate",
        windowExtendsOnEngagement: false,
      },
      {
        id: "c.eligibility",
        kind: "condition",
        asks: "Is the entity still eligible for the active state it would return to?",
        branches: [
          {
            label: "Still eligible",
            when: "the conditions for the active state hold as they did before",
            to: "a.restore",
          },
          {
            label: "Eligibility has moved",
            when: "something changed during grace - a rule, a limit, an entitlement, a status",
            to: "h.revalidate",
          },
        ],
      },
      {
        id: "a.restore",
        kind: "action",
        does: "Restore the active state and lift the grace restrictions, recording that recovery happened within the window",
        writes: [{ field: "grace_log", mode: "append" }],
        next: "x.recovered",
      },
      {
        id: "x.recovered",
        kind: "exit",
        state: "recovered within grace; active state restored",
        terminal: false,
        reEntry:
          "a further lapse enters grace again, and the history of how often that happens is itself worth reading",
      },
      {
        id: "h.revalidate",
        kind: "handoff",
        to: "ACQ-06",
        on: "recovery arriving after eligibility may have changed",
        carries: [
          "the entity, its grace history and the state it would return to",
          "the explicit fact that recovery has not blindly restored anything",
        ],
      },
      {
        id: "c.terminate",
        kind: "condition",
        asks: "Grace ended unresolved - what does policy do?",
        branches: [
          {
            label: "The entity expires",
            when: "the time-bound entity itself ceases to be valid",
            to: "h.expire",
          },
          {
            label: "Access or the relationship ends",
            when: "policy terminates or further restricts rather than expiring an entity",
            to: "h.terminate",
          },
        ],
      },
      {
        id: "h.expire",
        kind: "handoff",
        to: "TIM-64",
        on: "grace ending with the entity due to expire",
        carries: ["the entity, its original validity and the grace period that followed it"],
      },
      {
        id: "h.terminate",
        kind: "handoff",
        to: "external:termination-lifecycle",
        on: "grace ending with access or the relationship ending",
        carries: [
          "what was allowed during grace and what is ending now",
          "the recovery condition that was never met",
        ],
      },
    ],
    guardrails: [
      "Grace is not fully active. Anything reading the entity can tell which state it is in.",
      "Which capabilities continue during grace is recorded explicitly, not inferred.",
      "A grace period does not extend itself. Its end is fixed when it is granted.",
      "Recovery rechecks current eligibility rather than blindly restoring the previous state.",
    ],
    reusableRule:
      "Grace periods preserve limited continuity while a recoverable condition remains unresolved, without pretending the normal active state still exists.",
  },

  /* ------------------------------------------------------------ TIM-66 */
  {
    id: "TIM-66",
    slug: "temporary-exception",
    category: "time",
    goal: "escalation-exception",
    name: "Temporary exception → validity window → revert or formalise",
    purpose:
      "Stop an exception granted for a reason from becoming a permanent state nobody remembers deciding on.",
    entity: {
      scope: "the exception itself - its scope, the authority that granted it and the state it departs from",
      note: "Each grant and each extension is its own record. An exception extended four times is a different fact from one granted once, and only separate records make that countable.",
    },
    distinctFrom: [
      {
        journey: "TIM-67",
        because:
          "An exception departs from a standing policy and carries an authority who granted it. A temporary state is a lifecycle position; it does not necessarily contradict anything.",
      },
    ],
    entry: "t.granted",
    nodes: [
      {
        id: "t.granted",
        kind: "trigger",
        event: "temporary_exception_granted",
        evidence: {
          requires: [
            "an exception granted by someone with authority to grant it, against a standing policy or state",
          ],
          insufficientAlone: [
            "a setting that differs from policy with no recorded authority behind it, which is configuration drift rather than an exception",
          ],
          source: "authoritative",
        },
        next: "a.record",
      },
      {
        id: "a.record",
        kind: "action",
        does: "Record the exception type, who authorised it, the reason, its scope, when it starts, and when it expires or is reviewed. An exception with no end date is a policy change that nobody approved as one",
        writes: [{ field: "exception_log", mode: "append" }],
        next: "w.exception",
      },
      {
        id: "w.exception",
        kind: "wait",
        until: [
          "the condition that justified the exception is resolved",
          "a permanent decision is made about it",
        ],
        onEvent: "c.resolution",
        timeout: {
          after: "the exception's recorded expiry or review date",
          reason:
            "the review is the mechanism - an exception that is never revisited is the one that becomes permanent by default",
        },
        onTimeout: "c.expiry",
        windowExtendsOnEngagement: false,
      },
      {
        id: "c.resolution",
        kind: "condition",
        asks: "What resolved it?",
        branches: [
          {
            label: "No longer required",
            when: "the condition that justified the exception has gone",
            to: "a.revert",
          },
          {
            label: "Should become permanent",
            when: "the exception turned out to describe how things should work",
            to: "h.formalize",
          },
        ],
      },
      {
        id: "h.formalize",
        kind: "handoff",
        to: "OWN-56",
        on: "an exception that should become the rule",
        carries: [
          "the exception, its authority and how long it ran",
          "the fact that formalising it is a permanent change and belongs in an approval rather than in another extension",
        ],
      },
      {
        id: "c.expiry",
        kind: "condition",
        asks: "At the review point, does an authoritative extension exist?",
        branches: [
          {
            label: "Extended",
            when: "someone with authority extended it, on the record",
            to: "a.extend",
          },
          {
            label: "Not extended",
            when: "no extension exists",
            to: "a.revert",
          },
        ],
      },
      {
        id: "a.extend",
        kind: "action",
        does: "Adopt the extension as its own record, appended to the extension history, and close this instance. Each extension is counted separately rather than absorbed into one long-running exception - the count is what makes a temporary state that has run for two years visible as one",
        writes: [{ field: "exception_log", mode: "append" }],
        next: "x.extended",
      },
      {
        id: "x.extended",
        kind: "exit",
        state: "exception extended; a new window opens as its own instance",
        terminal: false,
        reEntry:
          "the extension is a new instance with a new review date, so the number of extensions is countable rather than hidden inside a single record",
      },
      {
        id: "a.revert",
        kind: "action",
        does: "Revert to the standard state and mark the exception as no longer usable, so a stale process cannot keep relying on an exception that has ended",
        writes: [{ field: "exception_log", mode: "append" }],
        next: "x.reverted",
      },
      {
        id: "x.reverted",
        kind: "exit",
        state: "exception ended; standard state restored",
        terminal: false,
        reEntry: "a new exception is granted on its own authority and its own reason",
      },
    ],
    guardrails: [
      "A temporary exception is not indefinite permission. Its end is recorded when it is granted.",
      "Extension history is preserved and countable. An exception extended repeatedly is visible as one.",
      "An expired exception cannot be relied on by a stale process.",
      "Making an exception permanent goes through approval, not through another extension.",
    ],
    reusableRule:
      "Temporary exceptions require explicit scope and exit conditions so that exceptional access or policy does not silently become permanent.",
  },

  /* ------------------------------------------------------------ TIM-67 */
  {
    id: "TIM-67",
    slug: "temporary-state-lifecycle",
    category: "time",
    goal: "suspension-restoration",
    name: "Temporary state → explicit expiry → restore or transition",
    purpose:
      "Give any time-bound state a defined ending, and revalidate before returning anything to what it was.",
    entity: {
      scope: "the entity plus the temporary state placed on it",
      note: "Temporary access, a temporary restriction, a temporary role, a temporary allocation or configuration all share this shape, and each carries its own exit rule.",
    },
    entry: "t.temporary",
    nodes: [
      {
        id: "t.temporary",
        kind: "trigger",
        event: "temporary_state_entered",
        evidence: {
          requires: ["an entity entering a state that is intended to end"],
          source: "authoritative",
        },
        next: "c.bounded",
      },
      {
        id: "c.bounded",
        kind: "condition",
        asks: "Does the temporary state carry an explicit expiry or an explicit exit condition?",
        branches: [
          {
            label: "Bounded",
            when: "an expiry time or a condition that ends it is defined",
            to: "a.define",
          },
          {
            label: "Unbounded",
            when: "nothing says how or when it ends",
            to: "h.unbounded",
          },
        ],
      },
      {
        id: "h.unbounded",
        kind: "handoff",
        to: "DEC-181",
        on: "a temporary state created with no ending",
        carries: [
          "the entity and the state placed on it",
          "the fact that a time-bound state with no exit rule is an unmanaged permanent state, which is why this is raised rather than accepted",
        ],
      },
      {
        id: "a.define",
        kind: "action",
        does: "Record the temporary state, when it took effect, when it expires or what ends it, and the state it would return to",
        writes: [{ field: "temporary_state_log", mode: "append" }],
        next: "w.temporary",
      },
      {
        id: "w.temporary",
        kind: "wait",
        until: ["the exit condition is satisfied"],
        onEvent: "a.early",
        timeout: {
          after: "the recorded expiry",
          reason:
            "expiry is the backstop for a condition that may never be met; without it the state has no ending at all",
        },
        onTimeout: "a.lapsed",
        windowExtendsOnEngagement: false,
      },
      {
        id: "a.early",
        kind: "action",
        does: "Record that the state ended by its exit condition rather than by expiry. A temporary access revoked early and one that lapsed are different facts about the same entity",
        writes: [{ field: "temporary_state_log", mode: "append" }],
        next: "a.revalidate",
      },
      {
        id: "a.lapsed",
        kind: "action",
        does: "Record that the state ended by reaching its expiry with the exit condition unmet",
        writes: [{ field: "temporary_state_log", mode: "append" }],
        next: "a.revalidate",
      },
      {
        id: "a.revalidate",
        kind: "action",
        does: "Re-read the entity's current version before returning it anywhere. The state it was going to return to may no longer exist, the entity may no longer be eligible for it, and the authority that granted the original may have ended during the temporary period",
        next: "c.restore",
      },
      {
        id: "c.restore",
        kind: "condition",
        asks: "Is the previous state still valid to return to?",
        branches: [
          {
            label: "Still valid",
            when: "the previous state exists and the entity is still eligible for it",
            to: "a.restore",
          },
          {
            label: "No longer valid",
            when: "the previous state is gone, or eligibility for it has changed",
            to: "h.reevaluate",
          },
        ],
      },
      {
        id: "a.restore",
        kind: "action",
        does: "Restore the previous state and clear the temporary one",
        writes: [{ field: "temporary_state_log", mode: "append" }],
        next: "x.restored",
      },
      {
        id: "x.restored",
        kind: "exit",
        state: "temporary state ended; previous state restored",
        terminal: false,
        reEntry: "a further temporary state carries its own ending",
      },
      {
        id: "h.reevaluate",
        kind: "handoff",
        to: "ACQ-06",
        on: "a temporary state ending with no valid state to return to",
        carries: [
          "the entity, the temporary state that ended and how it ended",
          "the previous state, which is recorded as unavailable rather than silently applied",
        ],
      },
    ],
    guardrails: [
      "A temporary state without an expiry or an exit condition is raised rather than created. That is the state this journey exists to prevent.",
      "The previous state is not assumed safe to restore. Eligibility and authority can both change during the temporary period.",
      "How the state ended - early or by expiry - is recorded, because the two mean different things about the entity.",
    ],
    reusableRule:
      "Temporary states must define how they end; time-bound state without an exit rule is an unmanaged permanent state.",
  },

  /* ------------------------------------------------------------ TIM-68 */
  {
    id: "TIM-68",
    slug: "reversal-window",
    category: "time",
    goal: "suspension-restoration",
    name: "Reversible state → reversal window → confirm or restore",
    purpose:
      "Undo a transition within its window while restoring only what is independently still valid.",
    entity: {
      scope: "the transition itself - what changed, when, and which of its side effects have already run",
      note: "The side-effect list is what makes a later reversal decidable. Without it, reversing is a guess about what the original transition set in motion.",
    },
    entry: "t.reversible",
    nodes: [
      {
        id: "t.reversible",
        kind: "trigger",
        event: "reversible_transition_occurred",
        evidence: {
          requires: ["a transition that policy defines as reversible, with a reversal window"],
          insufficientAlone: [
            "a change someone regrets, where no reversal policy exists",
          ],
          source: "authoritative",
        },
        next: "a.record",
      },
      {
        id: "a.record",
        kind: "action",
        does: "Record the previous state, the new state, whether reversal is eligible, its deadline, and which side effects have already executed. That last list is the one that matters - a reversal decided without it either restores too little or promises too much",
        writes: [{ field: "reversal_log", mode: "append" }],
        next: "w.window",
      },
      {
        id: "w.window",
        kind: "wait",
        until: ["a reversal is requested"],
        onEvent: "c.safe",
        timeout: {
          after: "the reversal deadline",
          reason:
            "the window closing is the ordinary outcome, and after it the new state is simply the state",
        },
        onTimeout: "x.settled",
        windowExtendsOnEngagement: false,
      },
      {
        id: "x.settled",
        kind: "exit",
        state: "reversal window closed; the new state is now the normal state",
        terminal: false,
        reEntry:
          "changing it now is a new transition with its own reversal window, not an undo of this one",
      },
      {
        id: "c.safe",
        kind: "condition",
        asks: "Have irreversible side effects already occurred?",
        branches: [
          {
            label: "Something cannot be undone",
            when: "money moved, a message went out, an external system was told, a physical action happened",
            to: "h.forward",
          },
          {
            label: "Nothing irreversible",
            when: "everything the transition did can be safely unwound",
            to: "a.restore",
          },
        ],
      },
      {
        id: "h.forward",
        kind: "handoff",
        to: "REM-157",
        on: "a reversal request against a transition with irreversible effects",
        carries: [
          "the side effects that already ran and cannot be undone",
          "the state the requester expected to return to, which correction has to reach forward rather than backward",
        ],
      },
      {
        id: "a.restore",
        kind: "action",
        does: "Restore the previous state, and only the previous state. Consent that was withdrawn, credentials that were revoked, tokens that expired, integrations that were cancelled and journeys that were queued and are now obsolete are each judged on their own current validity. Reversing a transition does not rewind the world around it, and restoring an entity wholesale resurrects things that ended for reasons this reversal never addressed",
        writes: [{ field: "reversal_log", mode: "append" }],
        next: "a.recalculate",
      },
      {
        id: "a.recalculate",
        kind: "action",
        does: "Recalculate the dependent state against what is actually valid now, rather than replaying what was valid before the transition",
        next: "c.partial",
      },
      {
        id: "c.partial",
        kind: "condition",
        asks: "Could every dependent state be restored?",
        branches: [
          {
            label: "Fully restored",
            when: "the previous state and everything depending on it are valid again",
            to: "x.restored",
          },
          {
            label: "Partially restored",
            when: "the primary state is back and some dependent state could not validly return",
            to: "x.partial",
          },
        ],
      },
      {
        id: "x.restored",
        kind: "exit",
        state: "transition reversed; previous state fully restored",
        terminal: false,
        reEntry: "a further transition on this entity carries its own window",
      },
      {
        id: "x.partial",
        kind: "exit",
        state: "partially restored; some dependent state did not validly return",
        terminal: false,
        reEntry:
          "recorded as partial rather than presented as though nothing had happened - what did not come back is nameable, which is the only way anyone can ask for it",
      },
    ],
    guardrails: [
      "Restoring an entity does not automatically restore withdrawn consent, revoked credentials, expired tokens, cancelled integrations or obsolete queued journeys. Each is evaluated on its own current validity.",
      "Where irreversible side effects have run, the route is forward correction or compensation rather than restoration.",
      "A partial restoration is recorded as partial.",
    ],
    reusableRule:
      "State reversal restores only what remains valid and reversible; it does not rewind every side effect created by the original transition.",
  },

  /* ------------------------------------------------------------ TIM-69 */
  {
    id: "TIM-69",
    slug: "post-expiry-re-entry",
    category: "time",
    goal: "eligibility-qualification",
    name: "Expired state → re-entry eligibility → renew, requalify or remain expired",
    purpose:
      "Decide how something expired can become valid again, through the mechanism that actually restores validity rather than by editing the expiry away.",
    entity: {
      scope: "the expired entity, kept distinct from any replacement created for it",
      note: "The expired entity and its replacement are two objects. That a credential was valid until March and that a credential is valid now are different facts, and merging them destroys both.",
    },
    entry: "t.reentry",
    nodes: [
      {
        id: "t.reentry",
        kind: "trigger",
        event: "re_entry_attempted_or_available",
        evidence: {
          requires: [
            "an action attempted against an expired entity, or an opportunity to restore it arising",
          ],
          source: "authoritative",
        },
        next: "a.consequence",
      },
      {
        id: "a.consequence",
        kind: "action",
        does: "Establish what expiry actually did to this entity. Some expiries suspend, some invalidate, some end a relationship outright, and the route back differs for each - reading them all as the same lapse is what produces a renewal flow that cannot renew anything",
        next: "c.route",
      },
      {
        id: "c.route",
        kind: "condition",
        asks: "Which mechanism restores validity here?",
        branches: [
          {
            label: "Direct renewal",
            when: "the governing system supports renewing this entity in place",
            to: "h.renew",
          },
          {
            label: "Requalification",
            when: "validity depends on conditions that must be demonstrated again",
            to: "h.requalify",
          },
          {
            label: "Replacement",
            when: "the expired entity cannot become valid and a new one has to be issued",
            to: "a.replace",
          },
          {
            label: "Prohibited",
            when: "nothing restores validity - the expiry was terminal by design",
            to: "x.terminal",
          },
        ],
      },
      {
        id: "h.renew",
        kind: "handoff",
        to: "external:renewal-lifecycle",
        on: "an expired entity the governing system can renew in place",
        carries: [
          "the entity and its expired validity period",
          "the fact that renewal creates a new validity rather than deleting the gap",
        ],
      },
      {
        id: "h.requalify",
        kind: "handoff",
        to: "ACQ-05",
        on: "validity depending on conditions that have to be demonstrated again",
        carries: [
          "what expired and why it needs requalification",
          "the previous qualification history, which is context rather than a shortcut",
        ],
      },
      {
        id: "a.replace",
        kind: "action",
        does: "Create the replacement entity and keep the expired one as a distinct historical record. The two stay separately addressable, because questions asked later are about one or the other and almost never about both",
        writes: [{ field: "expiry_log", mode: "append" }],
        next: "x.replaced",
      },
      {
        id: "x.replaced",
        kind: "exit",
        state: "replacement issued; expired entity retained as history",
        terminal: false,
        reEntry: "the replacement carries its own validity and its own expiry",
      },
      {
        id: "x.terminal",
        kind: "exit",
        state: "expired, no route back",
        terminal: true,
        reEntry:
          "none - what would have to change is the rule or the entity's circumstances, and either produces a new entity rather than reviving this one",
      },
    ],
    guardrails: [
      "An expired entity is not made active by editing its expiry timestamp, unless the governing system explicitly supports extension as a mechanism.",
      "The expired entity and its replacement remain distinguishable.",
      "The expired validity period is preserved. The gap during which nothing was valid is itself a fact.",
    ],
    reusableRule:
      "Re-entry after expiry should follow the business mechanism that restores validity rather than silently undoing the expiry.",
  },

  /* ------------------------------------------------------------ TIM-70 */
  {
    id: "TIM-70",
    slug: "scheduled-transition-execution",
    category: "time",
    goal: "scheduling-commitment",
    name: "Scheduled future transition → validate at execution → apply, cancel or recalculate",
    purpose:
      "Treat a scheduled transition as an intention recorded in the past, and check it against the present before applying it.",
    entity: {
      scope: "the scheduled transition plus the target entity and the version it expected to find",
      note: "The expected version is the mechanism. Without it, execution has no way to tell whether the world moved underneath the schedule.",
    },
    distinctFrom: [
      {
        journey: "TIM-64",
        because:
          "An expiry is one specific scheduled transition with entity-specific consequences. This is the general mechanism, and every other scheduled change - a plan change at period end, a future cancellation, a scheduled restriction - runs through it.",
      },
    ],
    entry: "t.scheduled",
    nodes: [
      {
        id: "t.scheduled",
        kind: "trigger",
        event: "future_transition_scheduled",
        evidence: {
          requires: [
            "a state transition scheduled for a future moment against a specific entity",
          ],
          source: "authoritative",
        },
        next: "a.persist",
      },
      {
        id: "a.persist",
        kind: "action",
        does: "Persist the target entity, the state and version it is expected to be in, the target state, when it takes effect, and why it was scheduled. Recording the expected version is what makes execution-time validation possible at all - without it there is nothing to compare the present against",
        writes: [{ field: "scheduled_transition_log", mode: "append" }],
        next: "w.effective",
      },
      {
        id: "w.effective",
        kind: "wait",
        until: ["the schedule is cancelled", "the schedule is replaced by a newer one"],
        onEvent: "a.invalidate",
        timeout: {
          after: "the effective moment",
          reason:
            "reaching the effective time is the ordinary path; the wait is watching for the schedule being withdrawn before it gets there",
        },
        onTimeout: "a.reread",
        windowExtendsOnEngagement: false,
      },
      {
        id: "a.invalidate",
        kind: "action",
        does: "Invalidate this job. A cancelled or replaced schedule must not still fire - a replacement that leaves the original alive applies both, in whichever order the scheduler happens to run them",
        writes: [
          { field: "scheduled_transition_log", mode: "append" },
          { field: "suppressed_sends", mode: "append" },
        ],
        next: "x.cancelled",
      },
      {
        id: "x.cancelled",
        kind: "exit",
        state: "schedule cancelled or replaced before its effective moment",
        terminal: false,
        reEntry: "the replacing schedule, if there is one, runs as its own instance",
      },
      {
        id: "a.reread",
        kind: "action",
        does: "Re-read the entity's authoritative current state and version. The schedule is an intention recorded in the past, and this is the only moment at which it can be checked against the present",
        next: "c.valid",
      },
      {
        id: "c.valid",
        kind: "condition",
        asks: "Does the entity still match what the schedule expected?",
        branches: [
          {
            label: "Matches",
            when: "the current version is the one the transition was written against",
            to: "c.duplicate",
          },
          {
            label: "Superseded",
            when: "a newer authoritative change has already moved the entity past this",
            to: "x.superseded",
          },
          {
            label: "Assumptions changed",
            when: "the entity still exists in a comparable state but the reasoning behind the schedule no longer holds",
            to: "h.recalculate",
          },
        ],
      },
      {
        id: "x.superseded",
        kind: "exit",
        state: "stale transition suppressed; a newer change already applied",
        terminal: false,
        reEntry:
          "an old schedule never overwrites a newer decision, whichever of the two the scheduler happens to reach first",
      },
      {
        id: "h.recalculate",
        kind: "handoff",
        to: "external:rescheduling-decision",
        on: "a schedule whose underlying assumptions no longer hold",
        carries: [
          "the original schedule, its reason and the version it expected",
          "the entity's actual current state, so the decision is made again rather than applied blindly",
        ],
      },
      {
        id: "c.duplicate",
        kind: "condition",
        asks: "Has this transition already been applied?",
        branches: [
          {
            label: "Already applied",
            when: "a previous delivery of this same job already made the change",
            to: "x.already",
          },
          {
            label: "Not yet applied",
            when: "the transition has not run",
            to: "a.apply",
          },
        ],
      },
      {
        id: "x.already",
        kind: "exit",
        state: "duplicate execution absorbed",
        terminal: false,
        reEntry:
          "schedulers retry by design, so absorbing a redelivery is the normal case rather than an error path",
      },
      {
        id: "a.apply",
        kind: "action",
        does: "Apply the transition idempotently, keyed so that a redelivery of the same job cannot apply it twice",
        writes: [{ field: "scheduled_transition_log", mode: "append" }],
        next: "x.applied",
      },
      {
        id: "x.applied",
        kind: "exit",
        state: "scheduled transition applied against a validated current state",
        terminal: false,
        reEntry: "a further scheduled change is its own intention with its own validation",
      },
    ],
    guardrails: [
      "Every scheduled action validates at execution time rather than trusting the state it was written against.",
      "An old scheduled transition never overwrites a newer authoritative change.",
      "Cancelling or replacing a schedule invalidates the original job rather than leaving both alive.",
      "Duplicate execution applies the transition once. Redelivery is expected, not exceptional.",
    ],
    reusableRule:
      "Future transitions are intentions, not guaranteed outcomes; their validity must be rechecked when execution time arrives.",
  },
];
