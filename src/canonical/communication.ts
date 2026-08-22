import type { CanonicalJourney, OrchestrationRule } from "./types";

/* CATEGORY 21 - NOTIFICATIONS, COMMUNICATIONS, DELIVERY & CONTACTABILITY

   This is not campaign orchestration. It is the pipeline every transactional,
   operational and lifecycle message runs through, and the thing that pipeline
   keeps getting wrong is treating one long chain as a single step.

   An event happened. Somebody may be owed something about it. That somebody
   has to be identified, then reached at a destination that still works, on a
   channel permitted for this particular purpose, with content that is still
   true at the moment it goes out, submitted to a provider that may accept it
   and never deliver it, to a recipient who may receive it and never read it.

   Eight places to be wrong, and the two most expensive ones sit at either end.
   At the front, every event generating a message is how people stop reading
   any of them. At the back, provider-accepted recorded as delivered means a
   notice nobody got is closed as done.

   The chain, kept apart:

     event          something happened
     obligation     somebody is owed a message about it
     ready          recipient and a working destination are resolved
     permitted      this channel may carry this purpose
     prepared       a message instance exists
     validated      it is still true, checked immediately before sending
     submitted      a provider has it
     delivered      it reached a destination
     read           somebody opened it - which is still not understood

   And the separations that stop a failure spreading further than it should:
   one destination failing is not a person being unreachable, one channel
   being blocked is not every channel, and retry is bounded rather than
   forever. */

/* Consolidated during review: per-destination contactability is owned by
   CON-36, which is the authoritative channel and destination health lifecycle.
   CMS-208 raises permanent-destination evidence to it rather than keeping a
   second route-health state of its own. */

export const COMMUNICATION_RULES: readonly OrchestrationRule[] = [
  {
    id: "CMS-R1",
    scope: "communication",
    rule: "A business event and a communication obligation are separate entities.",
    because:
      "The event is what happened; the obligation is what somebody is owed about it. One can exist without the other, and merging them makes the message the record of the fact.",
  },
  {
    id: "CMS-R2",
    scope: "communication",
    rule: "Not every event generates communication.",
    because:
      "A system that tells people everything trains them to read nothing, and the one message that mattered arrives in a stream they have already stopped opening.",
  },
  {
    id: "CMS-R3",
    scope: "communication",
    rule: "Recipient identity and destination are resolved independently.",
    because:
      "Who should be told and where they can be reached are different questions. The account owner is often neither the intended recipient nor the one whose address is on file.",
  },
  {
    id: "CMS-R4",
    scope: "communication",
    rule: "Contactability and permission are separate concepts.",
    because:
      "An address that works says nothing about whether it may be used for this purpose, and a permission granted says nothing about whether the address still exists.",
  },
  {
    id: "CMS-R5",
    scope: "communication",
    rule: "Communication purpose determines which permission rules apply.",
    because:
      "Getting the purpose wrong is what suppresses a security alert under a marketing preference, and what sends a promotion down a transactional route.",
  },
  {
    id: "CMS-R6",
    scope: "communication",
    rule: "Channel selection does not create accidental duplicates.",
    because:
      "Sending on every available channel is not thoroughness; it is one event arriving four times, and the recipient reads it as a fault.",
  },
  {
    id: "CMS-R7",
    scope: "communication",
    rule: "Delayed messages are revalidated immediately before sending.",
    because:
      "A message is a claim about the world made when it was written. Between then and the send, the appointment was cancelled and the payment succeeded.",
  },
  {
    id: "CMS-R8",
    scope: "communication",
    rule: "Prepared, sent, delivered and read are four distinct states.",
    because:
      "Each is a different answer to whether the recipient knows. Collapsing them closes obligations that were never met.",
  },
  {
    id: "CMS-R9",
    scope: "communication",
    rule: "Provider acceptance does not prove recipient delivery.",
    because:
      "Acceptance is a fact about the provider's queue. The message can be accepted, held, bounced and discarded without anything reaching anyone.",
  },
  {
    id: "CMS-R10",
    scope: "communication",
    rule: "Unknown send or delivery outcomes are reconciled where a duplicate resend would matter.",
    because:
      "A timeout is not a failure. Resending blindly delivers the same notice twice, and for some notices twice is a different message than once.",
  },
  {
    id: "CMS-R11",
    scope: "communication",
    rule: "Delivery failure is classified by its channel-specific cause.",
    because:
      "A rate limit and a dead address need opposite responses. Treating both as transient produces a retry loop against something that will never exist.",
  },
  {
    id: "CMS-R12",
    scope: "communication",
    rule: "Retry is bounded.",
    because:
      "An unbounded retry schedule looks like a working system from inside and like harassment from the recipient's inbox.",
  },
  {
    id: "CMS-R13",
    scope: "communication",
    rule: "A fallback channel independently satisfies the purpose and permission checks.",
    because:
      "A fallback that skips them delivers a message down a route the recipient declined, and the failure that triggered it becomes the excuse for it.",
  },
  {
    id: "CMS-R14",
    scope: "communication",
    rule: "Contactability is tracked per destination.",
    because:
      "Recording unreachability at the person level loses every other route to them, and the recovery for the one that broke breaks all of them.",
  },
  {
    id: "CMS-R15",
    scope: "communication",
    rule: "One failed destination does not imply global unreachability.",
    because:
      "A hard bounce is a fact about an address. The phone, the device and the in-app account are untouched by it.",
  },
  {
    id: "CMS-R16",
    scope: "communication",
    rule: "Completion semantics come from the actual business requirement.",
    because:
      "Whether a notice is satisfied by an attempt or requires confirmed delivery is a business or legal question, and guessing it closes something unmet or escalates something that was fine.",
  },
  {
    id: "CMS-R17",
    scope: "communication",
    rule: "Stale communication is suppressed rather than delivered for completeness.",
    because:
      "A reminder for a cancelled appointment brings somebody somewhere for nothing, and it costs the credibility of every later message.",
  },
  {
    id: "CMS-R18",
    scope: "communication",
    rule: "Historical sent and delivery records stay auditable and unmutated.",
    because:
      "What was sent is what was sent. Rewriting it to match a corrected fact removes the evidence that the wrong thing ever went out.",
  },
  {
    id: "CMS-R20",
    scope: "communication",
    rule: "Communication state never redefines the underlying business entity's state.",
    because:
      "An undelivered notice does not make the payment unfailed or the appointment uncancelled. The message describes the world and does not constitute it.",
  },
];

export const COMMUNICATION_JOURNEYS: readonly CanonicalJourney[] = [
  /* ------------------------------------------------------------ CMS-201 */
  {
    id: "CMS-201",
    slug: "communication-obligation",
    category: "communication",
    name: "Business event → communication obligation → create or suppress",
    purpose:
      "Decide whether anyone is actually owed a message about what happened, before any message exists.",
    entity: {
      scope: "the business event, the recipient it concerns, and the communication obligation it may create",
      note: "The obligation is a separate entity from the event. It carries its own purpose, its own required outcome and its own relevance window.",
    },
    distinctFrom: [
      {
        journey: "FBK-41",
        because:
          "FBK-41 decides whether it is appropriate to ask somebody for something. This decides whether a business event creates an obligation to tell somebody something - the requirement comes from the event and the rules, not from the recipient's receptiveness.",
      },
    ],
    entry: "t.event",
    nodes: [
      {
        id: "t.event",
        kind: "trigger",
        event: "authoritative_business_event",
        evidence: {
          requires: ["an authoritative business event with an identified recipient it may concern"],
          insufficientAlone: [
            "an event being emitted, which is a fact about the system rather than a requirement to tell anyone",
            "a state field changing, most of which nobody needs to hear about",
          ],
          source: "authoritative",
        },
        next: "a.evaluate",
      },
      {
        id: "a.evaluate",
        kind: "action",
        does: "Evaluate the event type, the recipient, whether a communication requirement actually exists for it, the purpose, the urgency, the entity's current state, any equivalent communication already outstanding, and the applicable communication rules",
        writes: [{ field: "communication_log", mode: "append" }],
        next: "c.required",
      },
      {
        id: "c.required",
        kind: "condition",
        asks: "Does a communication requirement exist for this event and this recipient?",
        branches: [
          {
            label: "It exists",
            when: "a rule, a contract or a defined expectation says this recipient is owed a message about this",
            to: "c.existing",
          },
          {
            label: "None",
            when: "nothing requires telling this recipient about this event",
            to: "a.suppress",
          },
        ],
      },
      {
        id: "a.suppress",
        kind: "action",
        does: "Record that no obligation was created, and why. Every event generating a message is how people learn to ignore all of them, and then the one that mattered arrives in a stream nobody opens",
        writes: [{ field: "communication_log", mode: "append" }],
        next: "x.none",
      },
      {
        id: "x.none",
        kind: "exit",
        state: "no communication obligation; the event stands on its own",
        terminal: false,
        reEntry:
          "a later event may create an obligation on its own terms. This one creating none is a decision recorded rather than a gap",
      },
      {
        id: "c.existing",
        kind: "condition",
        asks: "Is an equivalent communication already outstanding for this recipient?",
        branches: [
          {
            label: "One exists and can absorb this",
            when: "an unresolved obligation covers the same subject and the semantics permit updating it",
            to: "a.reuse",
          },
          {
            label: "None, or it cannot be merged",
            when: "nothing outstanding covers it, or the two are genuinely different messages",
            to: "a.create",
          },
        ],
      },
      {
        id: "a.reuse",
        kind: "action",
        does: "Update the existing obligation rather than creating a second. A duplicate event producing a duplicate message means the recipient is told twice about one thing, and the second telling makes them doubt the first",
        writes: [{ field: "communication_log", mode: "append" }],
        next: "x.reused",
      },
      {
        id: "x.reused",
        kind: "exit",
        state: "folded into the outstanding obligation; no second message was created",
        terminal: false,
        reEntry:
          "if that obligation closes with this event still uncommunicated, the requirement is assessed again on its own terms",
      },
      {
        id: "a.create",
        kind: "action",
        does: "Create the communication obligation with its purpose, its recipient, the outcome it requires and the window in which it stays relevant. The obligation is a separate entity from the event - communication rules describe what happened and never redefine it",
        writes: [{ field: "communication_log", mode: "append" }],
        next: "h.recipient",
      },
      {
        id: "h.recipient",
        kind: "handoff",
        to: "CMS-202",
        on: "a communication obligation created",
        carries: [
          "the obligation, its purpose, its urgency and the outcome it requires",
          "the explicit fact that no recipient has been resolved and no channel has been chosen",
        ],
      },
    ],
    guardrails: [
      "An event occurring is not a message being required.",
      "Communication rules never redefine business truth.",
      "Duplicate events do not create duplicate communication obligations.",
      "A repeated attempt at the same obligation is bounded by the distinct approaches actually available to it. When those are exhausted, sustained non-engagement is a permission question rather than a reason for one more send.",
      "Delivery and engagement patterns may suggest different diagnostic hypotheses about why an attempt did not land - the envelope, the message, or the friction after it. They are hypotheses rather than facts: the rule they support is not to repeat the same intervention blindly, and communication telemetry is never treated as causal proof of any of them."
    ],
    reusableRule:
      "Business events create communication only when an explicit communication requirement exists for the current recipient and state.",
  },

  /* ------------------------------------------------------------ CMS-202 */
  {
    id: "CMS-202",
    slug: "recipient-resolution",
    category: "communication",
    name: "Communication obligation → resolve recipient → ready, hold or fail",
    purpose:
      "Establish who is actually owed this, and where they can currently be reached.",
    entity: {
      scope: "the communication obligation and the recipient with their candidate destinations",
      note: "Two resolutions, in order: who, then where. A destination found without establishing who it belongs to sends a private matter to whoever is on file.",
    },
    entry: "t.created",
    nodes: [
      {
        id: "t.created",
        kind: "trigger",
        event: "communication_obligation_awaiting_recipient",
        evidence: {
          requires: ["a communication obligation with a stated purpose and required outcome"],
          source: "authoritative",
        },
        next: "a.identity",
      },
      {
        id: "a.identity",
        kind: "action",
        does: "Resolve the authoritative recipient identity. The account owner is not always the intended recipient - a workspace notice may be owed to an administrator, a policy notice to a legal contact, and a security alert to the person whose credential it concerns rather than to whoever pays the bill",
        writes: [{ field: "communication_log", mode: "append" }],
        next: "c.resolvable",
      },
      {
        id: "c.resolvable",
        kind: "condition",
        asks: "Is the intended recipient resolvable?",
        branches: [
          {
            label: "Resolved",
            when: "the party the obligation is owed to is authoritatively identified",
            to: "c.role",
          },
          {
            label: "Unresolved",
            when: "who this is owed to cannot be established",
            to: "a.unresolved",
          },
        ],
      },
      {
        id: "a.unresolved",
        kind: "action",
        does: "Record RECIPIENT_UNRESOLVED and send nothing. Falling back to whoever is on the account because nobody else could be found delivers a private matter to the wrong person, and that cannot be undone by a correction",
        writes: [{ field: "communication_log", mode: "append" }],
        next: "x.unresolved",
      },
      {
        id: "x.unresolved",
        kind: "exit",
        state: "RECIPIENT_UNRESOLVED; the obligation stands unmet and nothing was sent",
        terminal: false,
        reEntry:
          "the recipient becoming resolvable reopens the routing. The obligation has not lapsed and has not been met",
      },
      {
        id: "c.role",
        kind: "condition",
        asks: "Does this recipient resolve through a role rather than a named person?",
        branches: [
          {
            label: "Through a role",
            when: "the obligation is owed to whoever holds a position - an administrator, an approver, a compliance contact",
            to: "a.role",
          },
          {
            label: "A named party",
            when: "the obligation is owed to a specific person or entity",
            to: "a.person",
          },
        ],
      },
      {
        id: "a.role",
        kind: "action",
        does: "Resolve the current holder of the role rather than whoever held it when the record was written. A notice sent to last year's administrator is a notice nobody received, and on a shared or team entity that is the normal case rather than the edge one",
        writes: [{ field: "communication_log", mode: "append" }],
        next: "a.destinations",
      },
      {
        id: "a.person",
        kind: "action",
        does: "Resolve the named party as the obligation identifies them",
        next: "a.destinations",
      },
      {
        id: "a.destinations",
        kind: "action",
        does: "Resolve the currently valid destination candidates - email, phone, device, in-app account, workspace or any other supported destination. Currently valid means the destination's own health, not merely its presence: an address in the record that has been hard-bouncing for six months is not a route",
        writes: [{ field: "communication_log", mode: "append" }],
        next: "c.available",
      },
      {
        id: "c.available",
        kind: "condition",
        asks: "Is at least one valid destination available?",
        branches: [
          {
            label: "Available",
            when: "one or more destinations are currently usable",
            to: "c.authorization",
          },
          {
            label: "None",
            when: "no destination for this recipient is currently valid",
            to: "a.no-route",
          },
        ],
      },
      {
        id: "a.no-route",
        kind: "action",
        does: "Record CONTACT_ROUTE_UNAVAILABLE for this recipient. This is a routing fact rather than a statement that the recipient is unreachable in general, and it is scoped to what was actually tried",
        writes: [{ field: "communication_log", mode: "append" }],
        next: "x.no-route",
      },
      {
        id: "x.no-route",
        kind: "exit",
        state: "CONTACT_ROUTE_UNAVAILABLE; the obligation stands unmet",
        terminal: false,
        reEntry:
          "a newly valid destination reopens the routing for this obligation while it is still relevant",
      },
      {
        id: "c.authorization",
        kind: "condition",
        asks: "Does reaching this recipient at these destinations require further verification or authorization?",
        branches: [
          {
            label: "It does",
            when: "the content is sensitive enough that the destination must be verified first",
            to: "a.hold",
          },
          {
            label: "It does not",
            when: "the destinations are already adequate for this content",
            to: "a.ready",
          },
        ],
      },
      {
        id: "a.hold",
        kind: "action",
        does: "Record HOLD naming what is required, and raise the verification through the mechanism that owns it. A notice containing something sensitive is not sent to an unverified destination merely because the destination exists",
        writes: [{ field: "communication_log", mode: "append" }],
        next: "w.authorization",
      },
      {
        id: "w.authorization",
        kind: "wait",
        until: [
          "the required verification or authorization completes",
          "it is refused or cannot be completed",
        ],
        onEvent: "c.auth",
        timeout: {
          after: "the window in which the communication stays relevant",
          reason:
            "a message held past its own relevance is worse than one never sent - it arrives about something that has already resolved",
        },
        onTimeout: "a.no-route",
        windowExtendsOnEngagement: false,
      },
      {
        id: "c.auth",
        kind: "condition",
        asks: "How did the authorization resolve?",
        branches: [
          {
            label: "Completed",
            when: "the destination is now adequate for this content",
            to: "a.ready",
          },
          {
            label: "Refused or impossible",
            when: "the destination cannot be made adequate",
            to: "a.no-route",
          },
        ],
      },
      {
        id: "a.ready",
        kind: "action",
        does: "Record READY_FOR_CHANNEL_SELECTION with the resolved recipient and the destinations that are currently valid for them",
        writes: [{ field: "communication_log", mode: "append" }],
        next: "h.permission",
      },
      {
        id: "h.permission",
        kind: "handoff",
        to: "CMS-203",
        on: "a resolved recipient with usable destinations",
        carries: [
          "the recipient, the candidate destinations and the obligation's purpose",
          "the explicit fact that a destination working is not a destination permitted for this purpose",
        ],
      },
    ],
    guardrails: [
      "An account owner is not always the intended recipient.",
      "A destination is never used merely because it exists historically.",
      "Shared and team entities resolve recipients by current role rather than by stored name.",
      "Where policy marks the data sensitive, a channel that renders externally - a lock screen, a notification preview, a shared device - carries a generic notification and no concrete detail. The specifics live behind the authenticated experience instead.",
      "A destination that is internal work rather than a route to the person - a queue, a task, a sales assignment - is never counted as a way of reaching them.",
    ],
    reusableRule:
      "Communication should proceed only after the intended recipient and a currently valid destination have been authoritatively resolved.",
  },

  /* ------------------------------------------------------------ CMS-203 */
  {
    id: "CMS-203",
    slug: "communication-permission",
    category: "communication",
    name: "Communication purpose → permission and preference check → allow, suppress or alternate",
    purpose:
      "Decide whether a working destination may carry this particular message, given what it is for.",
    entity: {
      scope: "the obligation, the recipient's destinations, and the purpose being evaluated against them",
      note: "This reads permission state and never writes it. Whether somebody has consented is owned elsewhere; whether this purpose may use this channel is decided here.",
    },
    distinctFrom: [
      {
        journey: "CON-35",
        because:
          "CON-35 owns consent and permission as authoritative state, and propagates changes to it. This evaluates that state for one message's actual purpose - it can suppress a channel the recipient has permitted, and permit one they have not, where mandatory-delivery rules say so.",
      },
    ],
    entry: "t.resolved",
    nodes: [
      {
        id: "t.resolved",
        kind: "trigger",
        event: "recipient_and_destinations_resolved",
        evidence: {
          requires: ["a resolved recipient with candidate destinations and an obligation with a purpose"],
          source: "authoritative",
        },
        next: "a.purpose",
      },
      {
        id: "a.purpose",
        kind: "action",
        does: "Classify the communication's purpose - transactional, security, service, a mandatory notice, operational, marketing, or another defined purpose. The purpose decides which permission rules apply, and misclassifying it is what suppresses a security alert under a marketing preference",
        writes: [{ field: "communication_log", mode: "append" }],
        next: "a.evaluate",
      },
      {
        id: "a.evaluate",
        kind: "action",
        does: "Evaluate the applicable permission, consent, channel preference, mandatory-delivery rules and suppression state against that purpose. What is read is the authoritative permission state - this journey evaluates it for one message and never sets it",
        next: "c.rules",
      },
      {
        id: "c.rules",
        kind: "condition",
        asks: "Are the permission rules for this purpose and these channels defined?",
        branches: [
          {
            label: "Defined",
            when: "rules state which channels may carry this purpose, and whether any delivery is mandatory",
            to: "c.per-channel",
          },
          {
            label: "Not defined",
            when: "nothing states whether this purpose may use these channels",
            to: "h.review",
          },
        ],
      },
      {
        id: "h.review",
        kind: "handoff",
        to: "DEC-181",
        on: "a communication purpose with no defined permission rules",
        carries: [
          "the purpose, the recipient's permission state and the channels in question",
          "the explicit fact that no consent requirement was invented in either direction - inventing one either suppresses a notice somebody was owed or sends one they refused",
        ],
      },
      {
        id: "c.per-channel",
        kind: "condition",
        asks: "What does the evaluation leave available?",
        branches: [
          {
            label: "At least one channel is permitted",
            when: "a channel may carry this purpose to this recipient",
            to: "a.candidates",
          },
          {
            label: "The preferred channel is not permitted and the communication is mandatory",
            when: "the recipient's preference closes the usual route and a rule requires delivery anyway",
            to: "a.alternate",
          },
          {
            label: "No permissible route",
            when: "every channel is closed for this purpose",
            to: "a.undeliverable",
          },
        ],
      },
      {
        id: "a.alternate",
        kind: "action",
        does: "Evaluate the alternate routes the mandatory-delivery rules actually permit. Mandatory does not mean any channel will do - it means the rules define which ones survive a preference, and those are the only ones",
        writes: [{ field: "communication_log", mode: "append" }],
        next: "c.alternate",
      },
      {
        id: "c.alternate",
        kind: "condition",
        asks: "Does a permitted alternate exist?",
        branches: [
          {
            label: "One exists",
            when: "the mandatory-delivery rules keep a route open",
            to: "a.candidates",
          },
          {
            label: "None",
            when: "the rules leave no route for this purpose",
            to: "a.undeliverable",
          },
        ],
      },
      {
        id: "a.candidates",
        kind: "action",
        does: "Record the channels permitted for this purpose, each with the rule that permits it. Recording the rule is what makes the send defensible and the suppression explainable",
        writes: [{ field: "communication_log", mode: "append" }],
        next: "h.route",
      },
      {
        id: "h.route",
        kind: "handoff",
        to: "CMS-204",
        on: "at least one channel permitted for this purpose",
        carries: [
          "the permitted channels and the rule permitting each",
          "the purpose and urgency, which decide how many of them are actually needed",
        ],
      },
      {
        id: "a.undeliverable",
        kind: "action",
        does: "Record UNDELIVERABLE_BY_POLICY with the purpose and the rule that closed each route. This is a policy outcome rather than a delivery failure, and recording it as a failure sends it into a retry loop against a rule that will not change",
        writes: [{ field: "communication_log", mode: "append" }],
        next: "c.escalate",
      },
      {
        id: "c.escalate",
        kind: "condition",
        asks: "Does this obligation require escalation when no route is permitted?",
        branches: [
          {
            label: "It does",
            when: "the communication is mandatory or critical and cannot simply be dropped",
            to: "h.escalate",
          },
          {
            label: "It does not",
            when: "an unroutable optional message closes without further action",
            to: "x.undeliverable",
          },
        ],
      },
      {
        id: "h.escalate",
        kind: "handoff",
        to: "CMS-210",
        on: "a mandatory communication with no permitted route",
        carries: [
          "the purpose, the routes evaluated and the rule that closed each one",
          "the explicit fact that this is policy rather than failure, so no retry will resolve it",
        ],
      },
      {
        id: "x.undeliverable",
        kind: "exit",
        state: "UNDELIVERABLE_BY_POLICY; no permitted route for this purpose",
        terminal: false,
        reEntry:
          "a permission change or a new permitted destination reopens routing while the obligation is still relevant",
      },
    ],
    guardrails: [
      "Contactable is not consented for every purpose.",
      "Marketing consent does not control mandatory security notices unless governing rules say so.",
      "Consent requirements are never invented, in either direction.",
      "This journey reads permission state and never writes it.",
      "A requirement to evaluate content-handling policy is not a permission flag. It governs what the message may say and on which surface; it neither grants nor withholds the right to send.",
    ],
    reusableRule:
      "Channel eligibility depends on both technical contactability and whether that channel may be used for the communication's actual purpose.",
  },

  /* ------------------------------------------------------------ CMS-204 */
  {
    id: "CMS-204",
    slug: "channel-selection",
    category: "communication",
    name: "Channel selection → choose route → prepare message",
    purpose:
      "Pick the smallest set of channels that actually satisfies the obligation, and build the message for them.",
    entity: {
      scope: "the obligation and the permitted channels available to it",
      note: "A fallback is a route held in reserve rather than a second send. Multi-channel delivery is a decision somebody makes, never a side effect of several channels being available.",
    },
    entry: "t.permitted",
    nodes: [
      {
        id: "t.permitted",
        kind: "trigger",
        event: "permitted_channels_available",
        evidence: {
          requires: ["one or more channels permitted for this obligation's purpose"],
          source: "authoritative",
        },
        next: "a.evaluate",
      },
      {
        id: "a.evaluate",
        kind: "action",
        does: "Evaluate the purpose, the urgency, the recipient's preferences, each channel's capability, the content's requirements, delivery reliability, the fallback policy, and cost or priority where those are defined",
        next: "a.select",
      },
      {
        id: "a.select",
        kind: "action",
        does: "Select the primary route - the smallest valid set capable of satisfying the obligation. Sending on every available channel is not thoroughness; it is one event arriving four times, and the recipient reads the repetition as a fault in the system",
        writes: [{ field: "communication_log", mode: "append" }],
        next: "c.multi",
      },
      {
        id: "c.multi",
        kind: "condition",
        asks: "Does the obligation genuinely require more than one channel?",
        branches: [
          {
            label: "Explicitly, yes",
            when: "a rule or the obligation's own requirement calls for delivery on more than one channel",
            to: "a.coordinate",
          },
          {
            label: "One route, with a fallback held",
            when: "a single channel satisfies the obligation",
            to: "a.single",
          },
        ],
      },
      {
        id: "a.coordinate",
        kind: "action",
        does: "Create explicitly coordinated deliveries, each aware of the others, so the obligation closes once rather than once per channel. Uncoordinated parallel sends produce an obligation that closes three times and a recipient who is told three times",
        writes: [{ field: "communication_log", mode: "append" }],
        next: "a.prepare",
      },
      {
        id: "a.single",
        kind: "action",
        does: "Record the single primary route and the fallback that would be tried if it fails. The fallback is held in reserve - it is a route for later rather than a second message now",
        writes: [{ field: "communication_log", mode: "append" }],
        next: "a.prepare",
      },
      {
        id: "a.prepare",
        kind: "action",
        does: "Prepare the channel-compatible message instance, referencing the business facts rather than restating them independently. Channel selection never alters the facts - a truncated message says less than the full one, and it must not say something different",
        writes: [{ field: "communication_log", mode: "append" }],
        next: "h.send-ready",
      },
      {
        id: "h.send-ready",
        kind: "handoff",
        to: "CMS-205",
        on: "a prepared message instance on a selected route",
        carries: [
          "the message, its route, and the business state it was built from",
          "the explicit fact that it has not been revalidated - what it claims was true when it was written",
        ],
      },
    ],
    guardrails: [
      "Channel selection never alters business facts.",
      "Multi-channel delivery is intentional rather than incidental.",
      "A fallback channel is not an automatic duplicate send.",
      "A candidate channel has to be inside its own volume cap as well as permitted. A fallback that ignores the cap because the primary failed burns the one route that was still working.",
      "An exemption from a contact-pressure limit exists only where a governing rule defines one for that purpose and channel. Urgency does not create an exemption, and no class is exempt by default.",
      "Internal work destinations are not delivery channels and are skipped when choosing a route to the recipient."
    ],
    reusableRule:
      "Communication routing selects the smallest valid set of channels capable of satisfying the communication obligation.",
  },

  /* ------------------------------------------------------------ CMS-205 */
  {
    id: "CMS-205",
    slug: "send-revalidation",
    category: "communication",
    name: "Message prepared → revalidate state → send or suppress",
    purpose:
      "Check the message is still true immediately before it goes, and stop it if it is not.",
    entity: {
      scope: "the prepared message instance and the business entity it describes",
      note: "The message is a claim about the world made at the moment it was written. This is the only point at which that claim is checked against the world as it now is.",
    },
    entry: "t.ready",
    nodes: [
      {
        id: "t.ready",
        kind: "trigger",
        event: "message_reaches_send_ready",
        evidence: {
          requires: ["a prepared message instance about to be submitted for delivery"],
          source: "authoritative",
        },
        next: "a.reread",
      },
      {
        id: "a.reread",
        kind: "action",
        does: "Re-read the authoritative state the message describes. Between preparation and send the appointment may have been cancelled, the payment may have succeeded and the approval may have been reversed - and each of those turns a helpful message into a damaging one",
        next: "c.valid",
      },
      {
        id: "c.valid",
        kind: "condition",
        asks: "Is the communication still valid?",
        branches: [
          {
            label: "Still valid",
            when: "the reason for the message and its subject both still stand",
            to: "c.content",
          },
          {
            label: "Superseded or resolved",
            when: "the event the message is about has been undone, cancelled or resolved",
            to: "a.suppress",
          },
          {
            label: "The recipient or channel is no longer valid",
            when: "the destination failed or the recipient changed since routing",
            to: "h.reroute",
          },
        ],
      },
      {
        id: "a.suppress",
        kind: "action",
        does: "Suppress the stale message and record why. A reminder for a cancelled appointment brings somebody somewhere for nothing; a payment-failure notice sent after the payment succeeded produces a support contact and costs the credibility of every later notice",
        writes: [
          { field: "communication_log", mode: "append" },
          { field: "suppressed_sends", mode: "append" },
        ],
        next: "x.suppressed",
      },
      {
        id: "x.suppressed",
        kind: "exit",
        state: "stale message suppressed; nothing was sent",
        terminal: false,
        reEntry:
          "the obligation closes as superseded rather than as met. A new event about the same subject creates its own obligation",
      },
      {
        id: "h.reroute",
        kind: "handoff",
        to: "CMS-202",
        on: "a message whose recipient or destination stopped being valid before send",
        carries: [
          "the obligation, still unmet, and what changed about the routing",
          "the explicit fact that nothing was sent, so no duplicate arises from re-resolving",
        ],
      },
      {
        id: "c.content",
        kind: "condition",
        asks: "Does the content depend on data that has changed since preparation?",
        branches: [
          {
            label: "It changed",
            when: "an amount, a date, a status or a name in the message is no longer current",
            to: "a.regenerate",
          },
          {
            label: "Unchanged",
            when: "everything the message states is still current",
            to: "a.send",
          },
        ],
      },
      {
        id: "a.regenerate",
        kind: "action",
        does: "Regenerate the content from current data before sending. Sending a stale amount, date or status is worse than sending nothing, because the recipient acts on it and then has to be told it was wrong",
        writes: [{ field: "communication_log", mode: "append" }],
        next: "a.send",
      },
      {
        id: "a.send",
        kind: "action",
        does: "Record the message as validated at send time, with what was checked and against what version. Historical sent messages are never mutated afterwards - what was sent is what was sent, and rewriting it removes the evidence that a wrong thing went out",
        writes: [{ field: "communication_log", mode: "append" }],
        next: "h.attempt",
      },
      {
        id: "h.attempt",
        kind: "handoff",
        to: "CMS-206",
        on: "a message validated immediately before delivery",
        carries: [
          "the message, its content version and the state it was validated against",
          "the route selected and the fallback held in reserve",
        ],
      },
    ],
    guardrails: [
      "A queued message is not a permanently valid message.",
      "A reminder for a cancelled appointment does not send.",
      "A resolved payment failure does not send as unresolved.",
      "Historical sent messages are never mutated.",
    ],
    reusableRule:
      "Messages should be revalidated immediately before delivery whenever delayed execution could make their content or purpose stale.",
  },

  /* ------------------------------------------------------------ CMS-206 */
  {
    id: "CMS-206",
    slug: "send-attempt",
    category: "communication",
    name: "Send attempt → accepted, failed or unknown",
    purpose:
      "Record what happened when the message was handed to a provider, which is not what happened to the recipient.",
    entity: {
      scope: "the individual delivery attempt, with its provider reference",
      note: "One attempt per submission. Outcomes arriving later correlate to a specific attempt, which is why the attempt is written before its outcome is known.",
    },
    distinctFrom: [
      {
        journey: "CMS-207",
        because:
          "This is the handover to a provider - accepted, refused or unanswered. CMS-207 is what the channel later reports about whether it reached anyone. A message can be accepted and never delivered, and the two states must be separately visible.",
      },
    ],
    entry: "t.submitted",
    nodes: [
      {
        id: "t.submitted",
        kind: "trigger",
        event: "message_submitted_to_provider",
        evidence: {
          requires: ["a validated message submitted to a delivery mechanism or provider"],
          source: "authoritative",
        },
        next: "a.persist",
      },
      {
        id: "a.persist",
        kind: "action",
        does: "Persist the message id, the attempt id, the channel, the provider and its reference, the submission time and the content version reference. The attempt is written before its outcome is known, so an outcome arriving hours later has something to attach to",
        writes: [{ field: "delivery_log", mode: "append" }],
        next: "w.acceptance",
      },
      {
        id: "w.acceptance",
        kind: "wait",
        until: [
          "the provider accepts the submission",
          "the provider reports an immediate authoritative failure",
        ],
        onEvent: "c.outcome",
        timeout: {
          after: "the submission timeout for this channel",
          reason:
            "a provider that neither accepts nor refuses leaves the message in an unknown state, and the question of whether to resend depends on knowing that rather than assuming either answer",
        },
        onTimeout: "a.unknown",
        windowExtendsOnEngagement: false,
      },
      {
        id: "c.outcome",
        kind: "condition",
        asks: "What did the provider do with it?",
        branches: [
          {
            label: "Accepted",
            when: "the provider took the message for delivery",
            to: "a.accepted",
          },
          {
            label: "Refused immediately",
            when: "the provider authoritatively rejected the submission",
            to: "a.failed",
          },
        ],
      },
      {
        id: "a.accepted",
        kind: "action",
        does: "Record SENT and DELIVERY_PENDING. The provider taking the message is a fact about the provider's queue - it can be accepted, held, bounced and discarded without anything reaching anybody",
        writes: [{ field: "delivery_log", mode: "append" }],
        next: "x.pending",
      },
      {
        id: "x.pending",
        kind: "exit",
        state: "SENT and DELIVERY_PENDING; submitted and accepted, delivery not established",
        terminal: false,
        reEntry:
          "the channel's delivery outcome arrives on its own schedule and correlates to this attempt. Nothing here concludes the obligation",
      },
      {
        id: "a.failed",
        kind: "action",
        does: "Record DELIVERY_FAILED with exactly what the provider reported, unclassified. The classification belongs to the recovery journey, which needs the raw reason rather than a summary of it",
        writes: [{ field: "delivery_log", mode: "append" }],
        next: "h.recover",
      },
      {
        id: "h.recover",
        kind: "handoff",
        to: "CMS-208",
        on: "a submission the provider refused, or an unknown outcome where duplicates are harmless",
        carries: [
          "the attempt, the channel and what the provider actually said",
          "the fallback held in reserve and the obligation's remaining relevance window",
        ],
      },
      {
        id: "a.unknown",
        kind: "action",
        does: "Record DELIVERY_UNKNOWN and hold any resend. A timeout is not a failure - the message may well have gone, and resending blindly delivers the same notice twice, which for some notices reads as a different message than once",
        writes: [
          { field: "delivery_log", mode: "append" },
          { field: "suppressed_sends", mode: "append" },
        ],
        next: "c.duplicates",
      },
      {
        id: "c.duplicates",
        kind: "condition",
        asks: "Would a duplicate matter for this communication?",
        branches: [
          {
            label: "It would",
            when: "the message carries a code, a link, a payment instruction or anything a second copy makes ambiguous",
            to: "h.reconcile",
          },
          {
            label: "It would not",
            when: "a repeat is harmless and the message is worth resending on that basis",
            to: "h.recover",
          },
        ],
      },
      {
        id: "h.reconcile",
        kind: "handoff",
        to: "external:external-status-reconciliation",
        on: "an unknown submission outcome where a duplicate would matter",
        carries: [
          "the attempt, its provider reference and everything last known about it",
          "the explicit instruction that no resend happens until the outcome is established",
        ],
        suppresses: ["any resend of this message while its outcome is unknown"],
      },
    ],
    guardrails: [
      "Provider accepted is not delivered.",
      "A timeout is not a send failure.",
      "A blind resend may create duplicate communication.",
    ],
    reusableRule:
      "Submitting a message establishes a delivery attempt, not proof that the recipient received it.",
  },

  /* ------------------------------------------------------------ CMS-207 */
  {
    id: "CMS-207",
    slug: "delivery-outcome",
    category: "communication",
    name: "Delivery outcome → delivered, failed or unknown → update communication",
    purpose:
      "Derive the real delivery state from what the channel reports, attached to the exact attempt it concerns.",
    entity: {
      scope: "the delivery attempt and the outcomes reported against it",
      note: "Outcomes arrive out of order, twice, and late. Each is processed against the attempt it names and against what is already recorded.",
    },
    entry: "t.status",
    nodes: [
      {
        id: "t.status",
        kind: "trigger",
        event: "delivery_status_received",
        evidence: {
          requires: ["a delivery event or status reported by the channel"],
          source: "authoritative",
        },
        next: "a.correlate",
      },
      {
        id: "a.correlate",
        kind: "action",
        does: "Correlate the outcome to the exact delivery attempt it concerns. A status with no attempt to attach to is a status about nothing, and attaching it to the wrong attempt marks a different message delivered",
        writes: [{ field: "delivery_log", mode: "append" }],
        next: "c.correlated",
      },
      {
        id: "c.correlated",
        kind: "condition",
        asks: "Did it correlate to a known attempt?",
        branches: [
          {
            label: "Correlated",
            when: "the outcome names an attempt we hold",
            to: "c.idempotent",
          },
          {
            label: "Uncorrelated",
            when: "the outcome names nothing we recognise",
            to: "h.reconcile",
          },
        ],
      },
      {
        id: "h.reconcile",
        kind: "handoff",
        to: "external:external-status-reconciliation",
        on: "a delivery outcome that could not be correlated or that remains ambiguous",
        carries: [
          "the raw outcome as reported and the attempts it might concern",
          "the explicit instruction that no delivery state is written on a guess about which message it belongs to",
        ],
      },
      {
        id: "c.idempotent",
        kind: "condition",
        asks: "Is this outcome new, repeated, or older than what is already recorded?",
        branches: [
          {
            label: "New and current",
            when: "this outcome advances what is known about the attempt",
            to: "c.outcome",
          },
          {
            label: "Already processed",
            when: "the same outcome has already been applied to this attempt",
            to: "x.duplicate-event",
          },
          {
            label: "Late and weaker",
            when: "it arrives after, and reports less than, what is already established",
            to: "a.late",
          },
        ],
      },
      {
        id: "x.duplicate-event",
        kind: "exit",
        state: "duplicate delivery event ignored; recorded state unchanged",
        terminal: false,
        reEntry:
          "a genuinely new outcome for this attempt is processed on its own terms. Channels repeat webhooks, and repeating the state change with them double-counts every delivery",
      },
      {
        id: "a.late",
        kind: "action",
        does: "Record the late event without overwriting stronger evidence. A bounce arriving after a confirmed delivery does not undo the delivery - unless the channel's semantics explicitly say it does, in which case they say so and the rule is applied rather than assumed",
        writes: [{ field: "delivery_log", mode: "append" }],
        next: "x.late",
      },
      {
        id: "x.late",
        kind: "exit",
        state: "late outcome recorded; stronger delivery evidence preserved",
        terminal: false,
        reEntry:
          "channel semantics that genuinely make a late failure authoritative are applied as a rule rather than by arrival order",
      },
      {
        id: "c.outcome",
        kind: "condition",
        asks: "What does the channel report?",
        branches: [
          {
            label: "Delivered",
            when: "the channel authoritatively reports it reached the destination",
            to: "a.delivered",
          },
          {
            label: "Definitive failure",
            when: "the channel authoritatively reports it did not and will not arrive",
            to: "a.failed",
          },
          {
            label: "Ambiguous",
            when: "the report establishes neither",
            to: "a.unknown",
          },
        ],
      },
      {
        id: "a.delivered",
        kind: "action",
        does: "Record DELIVERED against this attempt. Delivered is not read, and read is not understood - a delivery receipt says the message reached a destination and nothing about anybody having seen it, let alone acted on it",
        writes: [{ field: "delivery_log", mode: "append" }],
        next: "h.obligation",
      },
      {
        id: "h.obligation",
        kind: "handoff",
        to: "CMS-210",
        on: "a confirmed delivery",
        carries: [
          "which attempt delivered, on which channel and when",
          "the explicit fact that delivered is not read, so an obligation requiring comprehension is not met by this",
        ],
      },
      {
        id: "a.failed",
        kind: "action",
        does: "Record DELIVERY_FAILED with the reason exactly as the channel reported it. The reason is what the recovery journey classifies on, and summarising it here loses the distinction between a full mailbox and a dead address",
        writes: [{ field: "delivery_log", mode: "append" }],
        next: "h.recover",
      },
      {
        id: "h.recover",
        kind: "handoff",
        to: "CMS-208",
        on: "an authoritative delivery failure",
        carries: [
          "the failure as the channel reported it, unclassified",
          "the attempt, the channel and the obligation's remaining relevance",
        ],
      },
      {
        id: "a.unknown",
        kind: "action",
        does: "Record DELIVERY_UNKNOWN. Neither delivered nor failed is a real state, and resolving it to whichever is more convenient produces either a closed obligation nobody met or a duplicate nobody needed",
        writes: [{ field: "delivery_log", mode: "append" }],
        next: "h.reconcile",
      },
    ],
    guardrails: [
      "Sent is not delivered.",
      "Delivered is not read.",
      "A late failure does not overwrite stronger authoritative delivery evidence without valid channel semantics.",
      "Repeated delivery events are processed idempotently.",
      "An open or a read can be produced by a privacy proxy or a scanner rather than by a person. It is evidence about the message and never authoritative evidence of intent or outcome.",
    ],
    reusableRule:
      "Communication delivery state should be derived from authoritative channel evidence and correlated to the exact delivery attempt.",
  },

  /* ------------------------------------------------------------ CMS-208 */
  {
    id: "CMS-208",
    slug: "delivery-recovery",
    category: "communication",
    name: "Delivery failure → classify → retry, fallback or stop",
    purpose:
      "Respond to the failure that actually happened, without spreading it wider than the destination it belongs to.",
    entity: {
      scope: "the failed delivery, its channel and the destination it was aimed at",
      note: "The failure belongs to a destination on a channel. It says nothing about the recipient's other destinations, and recording it against the person loses them.",
    },
    distinctFrom: [
      {
        journey: "OPS-124",
        because:
          "OPS-124 is the generic retryable-failure and backoff mechanism. This decides what a communication failure means - whether the address is dead, whether another channel may carry this purpose, and whether the message is even still worth delivering. It uses that retry machinery rather than being it.",
      },
    ],
    entry: "t.failed",
    nodes: [
      {
        id: "t.failed",
        kind: "trigger",
        event: "authoritative_delivery_failure",
        evidence: {
          requires: ["a delivery failure reported authoritatively by the channel or provider"],
          insufficientAlone: [
            "an unknown outcome, which is not a failure and needs reconciling rather than recovering",
          ],
          source: "authoritative",
        },
        next: "a.classify",
      },
      {
        id: "a.classify",
        kind: "action",
        does: "Classify the failure by what the channel actually reported, into an explicit class - TEMPORARY, PROVIDER_FAILURE, RATE_LIMITED, PERMANENT, INVALID_DESTINATION, CHANNEL_RESTRICTED or UNKNOWN. The class decides everything downstream, which is why it is established before anything is retried, and treating them all as transient produces a retry loop against an address that will never exist",
        writes: [{ field: "delivery_log", mode: "append" }],
        next: "c.relevant",
      },
      {
        id: "c.relevant",
        kind: "condition",
        asks: "Is the communication still relevant?",
        branches: [
          {
            label: "Still relevant",
            when: "the reason for the message still stands and its window is open",
            to: "c.class",
          },
          {
            label: "No longer relevant",
            when: "the event it concerns has resolved, or its relevance window has closed",
            to: "a.suppress-recovery",
          },
        ],
      },
      {
        id: "a.suppress-recovery",
        kind: "action",
        does: "Suppress the recovery. Recovering delivery of a message whose reason for existing has passed spends effort arriving at a stale notice, which is the worst of both outcomes",
        writes: [
          { field: "delivery_log", mode: "append" },
          { field: "suppressed_sends", mode: "append" },
        ],
        next: "x.abandoned",
      },
      {
        id: "x.abandoned",
        kind: "exit",
        state: "recovery abandoned; the message was overtaken by events",
        terminal: false,
        reEntry:
          "the obligation closes as superseded rather than as failed. Its subject producing a new event creates a new obligation",
      },
      {
        id: "c.class",
        kind: "condition",
        asks: "What does the failure class call for?",
        branches: [
          {
            label: "Temporary, rate-limited or provider-side",
            when: "the destination is fine and the failure is expected to clear",
            to: "a.retry",
          },
          {
            label: "Permanent for this destination",
            when: "a hard bounce, an invalid address or a dead token",
            to: "a.permanent",
          },
          {
            label: "Restricted on this channel",
            when: "this channel will not carry this content, for a reason a retry does not address",
            to: "c.fallback",
          },
          {
            label: "Unclassifiable",
            when: "the provider gave no class that can be relied on",
            to: "a.cautious",
          },
        ],
      },
      {
        id: "a.cautious",
        kind: "action",
        does: "Treat an unclassifiable failure as temporary but on a smaller budget, and record that the class was unknown. Guessing permanent discards a destination that may work; guessing temporary on the full budget is how an unknown failure becomes an unbounded retry",
        writes: [{ field: "delivery_log", mode: "append" }],
        next: "c.budget",
      },
      {
        id: "a.retry",
        kind: "action",
        does: "Retry on the same channel through the canonical retry mechanism, with backoff, against a budget fixed at the first failure. The budget is set once and does not renew - that is the difference between a retry policy and a loop, and a schedule with no end looks like a working system from inside and like harassment from the recipient's inbox",
        writes: [{ field: "delivery_log", mode: "append" }],
        next: "c.budget",
      },
      {
        id: "c.budget",
        kind: "condition",
        asks: "Does retry budget remain?",
        branches: [
          {
            label: "Budget remains",
            when: "the attempt count and window still permit another try",
            to: "x.retrying",
          },
          {
            label: "The destination's contactability changed underneath the retry",
            when: "the contact point's own state moved while the budget was being spent",
            to: "h.contactability",
          },
          {
            label: "Exhausted",
            when: "the budget fixed at the first failure has been spent",
            to: "c.fallback",
          },
        ],
      },
      {
        id: "x.retrying",
        kind: "exit",
        state: "retrying within budget on the same channel",
        terminal: false,
        reEntry:
          "each retry is a new send attempt with its own outcome, and a failure on it returns here with the budget one lower",
      },
      {
        id: "a.permanent",
        kind: "action",
        does: "Stop futile retries against this destination and raise the contactability evidence. One invalid address invalidates that address and nothing else - the recipient's phone, device and in-app account are untouched by an email that bounced",
        writes: [{ field: "delivery_log", mode: "append" }],
        next: "h.contactability",
      },
      {
        id: "h.contactability",
        kind: "handoff",
        to: "CON-36",
        on: "a failure that is a property of the contact point rather than of the attempt",
        carries: [
          "the failure class, the destination, the channel and the provider's response",
          "the explicit scope: this destination only, with the recipient's other routes unaffected",
          "the explicit fact that this is a deliverability problem and not an opt-out - it says nothing about permission on this channel or any other",
        ],
      },
      {
        id: "c.fallback",
        kind: "condition",
        asks: "Is an alternate channel available?",
        branches: [
          {
            label: "One is available",
            when: "the recipient has another destination on another channel",
            to: "h.fallback",
          },
          {
            label: "None",
            when: "no other channel remains for this recipient",
            to: "h.obligation",
          },
        ],
      },
      {
        id: "h.fallback",
        kind: "handoff",
        to: "CMS-203",
        on: "a failed channel with an alternate destination available",
        carries: [
          "the obligation, its purpose and the channel that has now failed",
          "the explicit requirement that the fallback passes the purpose and permission check on its own terms - a fallback that skips it delivers a message down a route the recipient declined, and the failure becomes the excuse for it",
          "the fact that a permitted alternative allows the move and does not require it - the sending journey still decides whether the message warrants changing channel",
        ],
      },
      {
        id: "h.obligation",
        kind: "handoff",
        to: "CMS-210",
        on: "a failure with no remaining channel to try",
        carries: [
          "every route attempted and how each failed",
          "the explicit fact that this is exhaustion of routes rather than proof the recipient is unreachable in general",
        ],
      },
    ],
    guardrails: [
      "A delivery failure does not mean the user is unreachable everywhere.",
      "Retry is bounded rather than infinite.",
      "A fallback must independently pass the purpose and permission checks.",
      "One invalid address does not invalidate unrelated destinations.",
      "The retry budget is fixed at the first failure and does not renew.",
      "A permanent bounce is a deliverability fact rather than an engagement problem, and is never fed into an engagement or churn model as one.",
      "A failure on one channel says nothing about the permission or the contactability of any other.",
      "A permitted alternative channel allows a move; it does not require one.",
    ],
    reusableRule:
      "Communication recovery should respond to the actual delivery failure while preserving channel-specific contactability and message relevance.",
  },

  /* ------------------------------------------------------------ CMS-210 */
  {
    id: "CMS-210",
    slug: "communication-closure",
    category: "communication",
    name: "Communication outcome → close obligation or escalate unreachable",
    purpose:
      "Close the obligation against what it actually required, and escalate the ones that could not be met.",
    entity: {
      scope: "the communication obligation and every delivery made against it",
      note: "The obligation defines its own required outcome. Some are met by a documented attempt and some only by confirmed delivery, and which applies is not this journey's to decide.",
    },
    entry: "t.outcome",
    nodes: [
      {
        id: "t.outcome",
        kind: "trigger",
        event: "delivery_attempts_reach_meaningful_outcome",
        evidence: {
          requires: ["an obligation whose deliveries have reached a state that could close it"],
          source: "authoritative",
        },
        next: "c.obsolete",
      },
      {
        id: "c.obsolete",
        kind: "condition",
        asks: "Did the communication become obsolete before it was delivered?",
        branches: [
          {
            label: "It did",
            when: "the event it concerns resolved or was undone while delivery was still in progress",
            to: "a.superseded",
          },
          {
            label: "It stands",
            when: "the reason for the message is still real",
            to: "c.requirement",
          },
        ],
      },
      {
        id: "a.superseded",
        kind: "action",
        does: "Close as SUPERSEDED or SUPPRESSED, recording that the obligation ended because its reason did rather than because it was met. The two look identical in a completion count and mean opposite things",
        writes: [{ field: "communication_log", mode: "append" }],
        next: "x.superseded",
      },
      {
        id: "x.superseded",
        kind: "exit",
        state: "closed as superseded; the obligation ended unmet and unneeded",
        terminal: false,
        reEntry:
          "a new event about the same subject creates its own obligation rather than reviving this one",
      },
      {
        id: "c.requirement",
        kind: "condition",
        asks: "What does this obligation require to be satisfied?",
        branches: [
          {
            label: "Confirmed delivery",
            when: "the requirement is that the message actually reached the recipient",
            to: "c.delivered",
          },
          {
            label: "A documented send attempt",
            when: "the requirement is that a message was properly sent, with the record to show it",
            to: "c.attempted",
          },
          {
            label: "Not defined",
            when: "nothing states whether an attempt or a delivery satisfies this notice",
            to: "h.review",
          },
        ],
      },
      {
        id: "h.review",
        kind: "handoff",
        to: "DEC-181",
        on: "an obligation with no defined completion semantics",
        carries: [
          "the obligation, its purpose and every delivery made against it",
          "the explicit fact that no completion standard was invented - guessing closes something unmet or escalates something that was fine, and for a legal notice the difference is the whole point",
        ],
      },
      {
        id: "c.delivered",
        kind: "condition",
        asks: "Is delivery confirmed?",
        branches: [
          {
            label: "Confirmed",
            when: "authoritative channel evidence establishes it arrived",
            to: "a.complete",
          },
          {
            label: "Not confirmed",
            when: "no delivery has been established on any route",
            to: "c.routes",
          },
        ],
      },
      {
        id: "c.attempted",
        kind: "condition",
        asks: "Is a documented send attempt on record?",
        branches: [
          {
            label: "On record",
            when: "a properly validated message was submitted and the attempt is recorded",
            to: "a.complete",
          },
          {
            label: "None succeeded in being made",
            when: "no attempt was ever submitted on any permitted route",
            to: "c.routes",
          },
        ],
      },
      {
        id: "a.complete",
        kind: "action",
        does: "Record COMMUNICATION_COMPLETED against the requirement it actually satisfied, naming which one. Unread is not undelivered, and an obligation met by delivery is met whether or not anybody opened it",
        writes: [{ field: "communication_log", mode: "append" }],
        next: "x.completed",
      },
      {
        id: "x.completed",
        kind: "exit",
        state: "COMMUNICATION_COMPLETED against its stated requirement",
        terminal: false,
        reEntry:
          "a further event about the same subject creates its own obligation. Whether the recipient understood is not something this state claims",
      },
      {
        id: "c.routes",
        kind: "condition",
        asks: "Are all permissible delivery routes exhausted?",
        branches: [
          {
            label: "Routes remain",
            when: "a permitted channel or destination has not yet been tried",
            to: "x.in-progress",
          },
          {
            label: "Exhausted",
            when: "every route permitted for this purpose has been tried and none worked",
            to: "a.unreachable",
          },
        ],
      },
      {
        id: "x.in-progress",
        kind: "exit",
        state: "obligation open; permitted routes remain untried",
        terminal: false,
        reEntry:
          "the remaining routes are attempted and report their own outcomes back here",
      },
      {
        id: "a.unreachable",
        kind: "action",
        does: "Record UNREACHABLE_FOR_PURPOSE. This is scoped to the purpose - every route permitted for this kind of message failed, and the same recipient may be perfectly reachable for something else",
        writes: [{ field: "communication_log", mode: "append" }],
        next: "c.critical",
      },
      {
        id: "c.critical",
        kind: "condition",
        asks: "Is this communication mandatory or critical?",
        branches: [
          {
            label: "It is",
            when: "a rule, a contract or a regulation requires this recipient to be told",
            to: "h.escalate",
          },
          {
            label: "It is not",
            when: "the message was useful rather than required",
            to: "x.unreachable",
          },
        ],
      },
      {
        id: "h.escalate",
        kind: "handoff",
        to: "DEC-181",
        on: "a mandatory communication that could not be delivered by any permitted route",
        carries: [
          "every route attempted, why each failed, and the requirement that makes this mandatory",
          "the explicit fact that more retries will not resolve it - what is needed is a person and an alternate process",
        ],
      },
      {
        id: "x.unreachable",
        kind: "exit",
        state: "UNREACHABLE_FOR_PURPOSE; the obligation closes unmet and recorded as such",
        terminal: false,
        reEntry:
          "a new valid destination for this purpose makes the recipient reachable again, and a later obligation routes normally",
      },
    ],
    guardrails: [
      "Whether a send or a delivery is sufficient is never invented.",
      "Unread is not undelivered.",
      "A critical communication failure escalates rather than retrying endlessly.",
      "An obligation does not close merely because a message object exists.",
    ],
    reusableRule:
      "A communication obligation closes according to its required outcome - attempt, delivery or explicit escalation - not merely because a message object exists.",
  },
];
