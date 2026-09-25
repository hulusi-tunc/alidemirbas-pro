import type { CanonicalJourney, OrchestrationRule } from "./types";

/* CATEGORY 18 - SCHEDULING, APPOINTMENTS, RESERVATIONS & TIME-BOUND COMMITMENTS

   A reservation is the only commitment in this library where both sides have
   to be somewhere at the same moment. That produces two problems nothing
   earlier in the set has.

   The first is contention. Capacity is finite and several people want the same
   piece of it at once, so the answer to "is this available" is true for the
   instant it is computed and can be false by the time anyone acts on it. Every
   journey here that touches capacity re-reads it rather than trusting what the
   requester was shown.

   The second is that the moment arrives whether or not anyone is ready. A
   subscription that is not renewed simply continues in an ambiguous state. A
   ten-o'clock appointment happens at ten, and everything scheduled around it -
   the reminder, the provider allocation, the start job - fires on the clock
   regardless of what has happened to the booking since. So the scheduled jobs
   here are version-aware, and the one at the start of service revalidates
   before it starts anything.

   The chains it keeps apart:

     available      capacity appeared bookable when we looked
     held           it is protected for a bounded moment
     confirmed      two parties owe each other a specific time
     ready          the things the service needs are in place
     attended       the interaction happened
     completed      the service obligation was delivered

   And three ways a booking fails to happen, which are not interchangeable:
   the customer cancelled, the customer did not come, and we could not deliver.
   The last one is where most implementations quietly record the first two. */

export const SCHEDULING_RULES: readonly OrchestrationRule[] = [
  {
    id: "SCH-R1",
    scope: "scheduling",
    rule: "Availability, hold and confirmed reservation are three separate states.",
    because:
      "They protect different amounts of nothing. Availability protects none of it, a hold protects it briefly, and only a confirmation is something either party can rely on.",
  },
  {
    id: "SCH-R2",
    scope: "scheduling",
    rule: "An availability query guarantees no future capacity.",
    because:
      "What is returned is true at the instant it is computed. Under contention it can be false before the page finishes rendering, which is why the reservation re-reads rather than trusting it.",
  },
  {
    id: "SCH-R3",
    scope: "scheduling",
    rule: "Temporary holds expire and release deterministically.",
    because:
      "A hold that outlives its window silently removes capacity nobody owns and nobody can book, and the resource looks full while standing empty.",
  },
  {
    id: "SCH-R4",
    scope: "scheduling",
    rule: "A reservation request revalidates current capacity before it confirms.",
    because:
      "The gap between seeing a slot and requesting it is exactly where two people end up holding one appointment, and only one of them will find out at the door.",
  },
  {
    id: "SCH-R5",
    scope: "scheduling",
    rule: "A confirmed reservation creates an explicit time-bound commitment on both sides.",
    because:
      "It is the point at which the customer arranges their day around it and the provider stops selling the slot. Everything before it is provisional and has to say so.",
  },
  {
    id: "SCH-R6",
    scope: "scheduling",
    rule: "Preparation dependencies never redefine the reservation's truth.",
    because:
      "A missing form is a reason to chase, escalate or contact. Moving or voiding a confirmed time because a prerequisite is late is a booking decision, and belongs to the booking lifecycle.",
  },
  {
    id: "SCH-R7",
    scope: "scheduling",
    rule: "Rescheduling preserves the original reservation until replacement capacity is secured.",
    because:
      "Releasing first leaves the customer with nothing when the replacement does not materialise, and the slot they had is gone by the time anyone notices.",
  },
  {
    id: "SCH-R8",
    scope: "scheduling",
    rule: "Reschedule history stays auditable.",
    because:
      "A reservation that only ever shows its current time cannot answer how many times it moved, which is the first question anyone investigating a service problem asks.",
  },
  {
    id: "SCH-R9",
    scope: "scheduling",
    rule: "Cancellation, no-show and provider cancellation are three distinct states.",
    because:
      "They differ in who failed, what is owed and what the customer is told. Collapsing them charges a fee to someone whose appointment we could not keep.",
  },
  {
    id: "SCH-R10",
    scope: "scheduling",
    rule: "Reservation cancellation and refund or fee decisions are separate lifecycle mechanisms.",
    because:
      "Whether the booking ends and whether money moves are decided by different rules, and a cancellation flow that settles both will get one of them wrong quietly.",
  },
  {
    id: "SCH-R11",
    scope: "scheduling",
    rule: "Scheduled-time jobs are version-aware so cancelled or rescheduled bookings cannot be revived.",
    because:
      "The same discipline SUB-R9, INT-R7 and OPS-R11 apply to queued work. Here the stale job allocates a provider to an appointment nobody has and then records a no-show for it.",
  },
  {
    id: "SCH-R12",
    scope: "scheduling",
    rule: "Check-in, attendance, service start and service completion can be four different states.",
    because:
      "Someone can check in and never be seen, be seen and receive half the service, or receive all of it and have none of that recorded. Each gap is a real operational failure.",
  },
  {
    id: "SCH-R13",
    scope: "scheduling",
    rule: "Partial service preserves the remaining obligation explicitly.",
    because:
      "A half-delivered appointment recorded as complete closes something the customer is still owed, and they discover it rather than being told.",
  },
  {
    id: "SCH-R14",
    scope: "scheduling",
    rule: "A no-show is established only after cancellation, rescheduling and provider-side failure are excluded.",
    because:
      "All three produce the same observable - the appointment did not happen - and only one of them is the customer's doing.",
  },
  {
    id: "SCH-R15",
    scope: "scheduling",
    rule: "Provider-side failure is never attributed to the customer.",
    because:
      "They were available and the service was not. Recording it against them attaches a penalty and a history to behaviour that was correct.",
  },
  {
    id: "SCH-R16",
    scope: "scheduling",
    rule: "Capacity release and reallocation are idempotent.",
    because:
      "Releasing twice returns capacity twice, and the resource is then overbookable by exactly the number of duplicate releases - which surfaces as two people in one room.",
  },
  {
    id: "SCH-R17",
    scope: "scheduling",
    rule: "External booking and provider outcomes use the generic external reconciliation mechanisms rather than local guesses.",
    because:
      "A cancellation we recorded and an external system did not leaves them holding a slot we released, and neither side knows until someone arrives.",
  },
  {
    id: "SCH-R18",
    scope: "scheduling",
    rule: "Financial, entitlement and remedy consequences are handed off rather than implemented inside scheduling journeys.",
    because:
      "A cancellation fee is a financial obligation and a missed service is a remedy question. Deciding either inside a booking flow duplicates rules that already exist and will drift from them.",
  },
];

export const SCHEDULING_JOURNEYS: readonly CanonicalJourney[] = [
  /* ------------------------------------------------------------ SCH-171 */
  {
    id: "SCH-171",
    slug: "availability-query",
    category: "scheduling",
    goal: "scheduling-commitment",
    channels: [],
    name: "Availability query → evaluate capacity → offer valid options",
    shortName: "Availability Evaluation",
    purpose:
      "Produce the options that are genuinely bookable right now, and say plainly that nothing is being held.",
    entity: {
      scope: "the availability request and the schedulable resource or service it asks about",
      note: "The request is a question, not a claim on anything. Nothing it returns is protected between being shown and being requested.",
    },
    distinctFrom: [
      {
        journey: "FUL-142",
        because:
          "FUL-142 asks whether an accepted obligation can be resourced at all. This asks which specific times a resource can be committed to, for a requester who has not committed to anything yet.",
      },
    ],
    entry: "t.requested",
    nodes: [
      {
        id: "t.requested",
        kind: "trigger",
        event: "availability_requested",
        evidence: {
          requires: ["a request for bookable times against an identified resource, service or context"],
          source: "declared",
        },
        next: "c.model",
      },
      {
        id: "c.model",
        kind: "condition",
        asks: "Does an authoritative capacity model exist for this resource and service?",
        branches: [
          {
            label: "It exists",
            when: "capacity, duration, operating window and any lead-time or buffer rules are defined",
            to: "a.evaluate",
          },
          {
            label: "It does not",
            when: "no authoritative capacity model covers this resource",
            to: "a.unknown",
          },
        ],
      },
      {
        id: "a.unknown",
        kind: "action",
        does: "Record that this resource has no authoritative capacity model, and return no options rather than every option. An absent constraint is not an absence of constraint - a resource with nothing configured will otherwise appear infinitely bookable, and the overbooking is discovered by whoever turns up",
        writes: [{ field: "availability_log", mode: "append" }],
        next: "x.no-availability",
      },
      {
        id: "a.evaluate",
        kind: "action",
        does: "Evaluate the authoritative constraints together - the resource's capacity, the service's duration, the location and context, eligibility constraints, existing reservations and holds, the operating window, lead-time rules and any defined buffers. Operating hours are not availability: a clinic open until six with every slot taken has nothing at five",
        next: "a.filter",
      },
      {
        id: "a.filter",
        kind: "action",
        does: "Return only the options currently valid for the requested resource and context, labelled as what they are - what appeared bookable at this instant. Nothing here is held, and under contention any of it can be gone before the requester acts",
        writes: [{ field: "availability_log", mode: "append" }],
        next: "c.any",
      },
      {
        id: "c.any",
        kind: "condition",
        asks: "Did any valid option survive the evaluation?",
        branches: [
          {
            label: "Options exist",
            when: "at least one slot satisfies every constraint",
            to: "x.offered",
          },
          {
            label: "None",
            when: "no slot in the requested window satisfies the constraints",
            to: "a.none",
          },
        ],
      },
      {
        id: "a.none",
        kind: "action",
        does: "Record NO_AVAILABILITY for the requested window, with the constraint that closed it where that can be said without exposing anything it should not",
        writes: [{ field: "availability_log", mode: "append" }],
        next: "c.alternative",
      },
      {
        id: "c.alternative",
        kind: "condition",
        asks: "What does policy offer when the requested window is empty?",
        branches: [
          {
            label: "A different window",
            when: "policy allows offering the nearest valid alternative",
            to: "a.widen",
          },
          {
            label: "A waitlist",
            when: "the resource operates a waitlist for released capacity",
            to: "a.waitlist",
          },
          {
            label: "Nothing further",
            when: "policy offers neither",
            to: "x.no-availability",
          },
        ],
      },
      {
        id: "a.widen",
        kind: "action",
        does: "Offer the nearest valid window, labelled as a different window rather than presented as the one that was asked for. Someone who wanted Tuesday and is shown Friday should be able to see that at a glance",
        writes: [{ field: "availability_log", mode: "append" }],
        next: "x.offered",
      },
      {
        id: "a.waitlist",
        kind: "action",
        does: "Record the requester as waitlisted, which reserves nothing. Waitlisted is not reserved, and someone who believes they hold a place they do not hold will plan their day around it",
        writes: [{ field: "availability_log", mode: "append" }],
        next: "x.waitlisted",
      },
      {
        id: "x.offered",
        kind: "exit",
        state: "valid options offered; no capacity is held by this query",
        terminal: false,
        reEntry:
          "any option shown can be taken by someone else before it is requested. The reservation revalidates against current capacity rather than against what was displayed",
      },
      {
        id: "x.waitlisted",
        kind: "exit",
        state: "waitlisted; nothing is reserved and no time is committed",
        terminal: false,
        reEntry:
          "capacity being released offers the waitlisted requester a chance to book, which is a new request that has to be confirmed like any other",
      },
      {
        id: "x.no-availability",
        kind: "exit",
        state: "NO_AVAILABILITY for the requested resource and window",
        terminal: false,
        reEntry:
          "availability changes constantly as holds expire and reservations cancel. A later query is answered on its own terms rather than from this result",
      },
    ],
    guardrails: [
      "A displayed schedule is not guaranteed availability until a reservation or hold succeeds.",
      "Availability is never inferred from generic operating hours.",
      "Availability is evaluated for the requested resource and context rather than for the service in general.",
    ],
    reusableRule:
      "Availability represents capacity that appears bookable at query time; commitment begins only after that capacity is successfully reserved.",
  },

  /* ------------------------------------------------------------ SCH-172 */
  {
    id: "SCH-172",
    slug: "slot-hold",
    category: "scheduling",
    goal: "scheduling-commitment",
    channels: [],
    name: "Slot hold → reserve temporarily → confirm, expire or release",
    shortName: "Temporary Slot Hold",
    purpose:
      "Protect specific capacity for a bounded moment while a booking is being completed, without pretending it is a booking.",
    entity: {
      scope: "the hold, the capacity it protects and the requester who owns it",
      note: "One hold per requester per slot. A second hold by the same requester consumes the capacity twice and releases at two different times.",
      instanceKey: [
        "hold_id"
      ],
      concurrency: "one-active-per-key"
    },
    distinctFrom: [
      {
        journey: "FUL-143",
        because:
          "FUL-143 allocates a resource to an obligation that already exists. This protects capacity for a commitment that does not exist yet and may never - most holds end in expiry rather than in a booking.",
      },
    ],
    objective: "Protect specific capacity for a bounded moment while a booking is being completed, without pretending it is a booking.",
    eligibility: [
      "a hold granted against real, currently free capacity on an identified slot",
      "no instance of this journey is already open for the the hold",
      "hard gates (GLB-31) allow communication for this purpose"
    ],
    suppressions: [
      {
        "id": "s.g1",
        "label": "CANONICAL_RULE",
        "text": "A hold is not a confirmed reservation."
      },
      {
        "id": "s.g2",
        "label": "CANONICAL_RULE",
        "text": "An expired hold consumes no capacity."
      },
      {
        "id": "s.g3",
        "label": "CANONICAL_RULE",
        "text": "Hold creation and release are both idempotent."
      },
      {
        "id": "s.g4",
        "label": "CANONICAL_RULE",
        "text": "Concurrent holds respect real capacity rather than the capacity each of them assumed."
      }
    ],
    implementation: {
      "attributes": {
        "required": [
          "hold_id",
          "slot_ref",
          "requester_id",
          "expires_at",
          "hold_log"
        ],
        "optional": []
      }
    },
    measurement: {
      "journeyOutcome": {
        "type": "exit",
        "refs": [
          "x.consumed",
          "x.expired",
          "x.released"
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
        "temporary slot hold",
        "slot reservation hold",
        "booking capacity hold",
        "checkout timer for bookings"
      ],
      "useCases": [
        "capacity protected for a bounded moment while a booking is completed",
        "an expired hold consuming nothing"
      ]
    },
    entry: "t.granted",
    nodes: [
      {
        id: "t.granted",
        kind: "trigger",
        event: "temporary_hold_granted",
        evidence: {
          requires: ["a hold granted against real, currently free capacity on an identified slot"],
          insufficientAlone: [
            "a hold requested, which is not a hold granted - under contention two requests can both be made and only one can succeed, and treating the request as the grant overbooks by exactly the number of losers",
          ],
          source: "authoritative",
        },
        next: "c.idempotent",
      },
      {
        id: "c.idempotent",
        kind: "condition",
        asks: "Does a live hold by this requester already cover this slot?",
        branches: [
          {
            label: "One already exists",
            when: "an unexpired hold with the same owner and slot is live",
            to: "a.reuse",
          },
          {
            label: "None",
            when: "no live hold covers it",
            to: "a.create",
          },
        ],
      },
      {
        id: "a.reuse",
        kind: "action",
        does: "Return the existing hold rather than creating a second. A retried booking step produces one hold, not two - two holds against one slot consume twice the capacity and expire at two different moments, so the slot is unbookable long after either of them mattered",
        next: "w.hold",
      },
      {
        id: "a.create",
        kind: "action",
        does: "Create the scoped hold with its id, the resource and slot, the capacity held, the owner, the creation time, the expiry and the booking intent it belongs to. Record HELD. The hold consumes capacity for its duration and creates no commitment - nobody has an appointment, and nothing here should be described to the requester as if they do",
        writes: [{ field: "hold_log", mode: "append" }],
        next: "w.hold",
        idempotencyKey: "hold_id + a.create",
      },
      {
        id: "w.hold",
        kind: "wait",
        until: [
          "booking_confirmed",
          "hold_released",
          "booking_intent_abandoned"
        ],
        onEvent: "c.outcome",
        timeout: {
          "after": {
            "key": "slot_hold.hold",
            "rule": "The hold's expiry.",
            "class": "attribute-bound",
            "required": true
          },
          "reason": "the expiry is the entire point of a hold. Capacity still counted against a lapsed one is capacity nobody can book and nobody owns, and the resource reads as full while standing empty",
          "relativeTo": "attribute",
          "attribute": "expires_at"
        },
        onTimeout: "a.expire",
        windowExtendsOnEngagement: false,
        recheck: "the the hold re-read from the system of record before acting on the timeout",
      },
      {
        id: "c.outcome",
        kind: "condition",
        asks: "What resolved the hold?",
        branches: [
          {
            label: "Confirmed",
            when: "a reservation was confirmed against this hold",
            to: "a.consume",
          },
          {
            label: "Explicitly released",
            when: "the owner or the booking flow released it",
            to: "a.release",
          },
          {
            label: "The intent was abandoned",
            when: "the booking attempt that created it stopped",
            to: "c.still-needed",
          },
        ],
      },
      {
        id: "c.still-needed",
        kind: "condition",
        asks: "Is the held capacity still required by anything live?",
        branches: [
          {
            label: "No longer needed",
            when: "nothing else depends on this capacity being held",
            to: "a.release",
          },
          {
            label: "Still needed",
            when: "another live booking step for the same requester still depends on it",
            to: "w.hold",
          },
        ],
      },
      {
        id: "a.expire",
        kind: "action",
        does: "Release the capacity and record the hold EXPIRED. An expired hold consumes nothing, and the release happens because the clock said so rather than because anyone remembered",
        writes: [{ field: "hold_log", mode: "append" }],
        next: "x.expired",
        idempotencyKey: "hold_id + a.expire",
      },
      {
        id: "a.release",
        kind: "action",
        does: "Release the capacity and record the hold RELEASED. The release is idempotent - releasing an already-released hold changes nothing rather than returning capacity a second time, and the difference between those two behaviours is how many people can be booked into one slot",
        writes: [{ field: "hold_log", mode: "append" }],
        next: "x.released",
        idempotencyKey: "hold_id + a.release",
      },
      {
        id: "a.consume",
        kind: "action",
        does: "Consume the hold into the confirmed reservation, moving the capacity from held to reserved in one step. Releasing first and re-taking opens a window - short, and entirely long enough - in which someone else takes the slot the requester has just paid for",
        writes: [{ field: "hold_log", mode: "append" }],
        next: "x.consumed",
        idempotencyKey: "hold_id + a.consume",
      },
      {
        id: "x.consumed",
        kind: "exit",
        state: "consumed into a confirmed reservation; capacity never passed back through free",
        terminal: false,
        reEntry:
          "the reservation now owns the capacity. A cancellation releases it through the cancellation lifecycle rather than through this hold",
        class: "success",
      },
      {
        id: "x.expired",
        kind: "exit",
        state: "EXPIRED; capacity released and available again",
        terminal: false,
        reEntry:
          "the same requester can take a new hold on the same slot if it is still free, which is a new hold rather than an extension of this one",
        class: "timeout",
      },
      {
        id: "x.released",
        kind: "exit",
        state: "RELEASED; capacity available again",
        terminal: false,
        reEntry:
          "a repeated release against this hold is a no-op rather than a second return of capacity",
        class: "success",
      },
    ],
    guardrails: [
      "A hold is not a confirmed reservation.",
      "An expired hold consumes no capacity.",
      "Hold creation and release are both idempotent.",
      "Concurrent holds respect real capacity rather than the capacity each of them assumed.",
    ],
    reusableRule:
      "A temporary hold protects capacity for a bounded period without creating the full commitment of a confirmed reservation.",
  },

  /* ------------------------------------------------------------ SCH-173 */
  {
    id: "SCH-173",
    slug: "reservation-request",
    category: "scheduling",
    goal: "scheduling-commitment",
    channels: [],
    name: "Reservation request → validate → confirm, reject or pending",
    shortName: "Reservation Validation",
    purpose:
      "Turn a request for a specific time into a commitment both sides can rely on, or say clearly that it did not.",
    entity: {
      scope: "the reservation request, the requester and the resource or service it names",
      note: "One reservation per requester, resource and slot. A retried submission produces the same reservation rather than a second one against the same capacity.",
      instanceKey: [
        "reservation_request_id"
      ],
      concurrency: "one-active-per-key"
    },
    distinctFrom: [
      {
        journey: "FUL-141",
        because:
          "FUL-141 creates a generic fulfillment obligation. This creates a commitment to a specific time on both sides - which is why it revalidates capacity at the moment of confirming and why its failure mode is contention rather than eligibility.",
      },
    ],
    objective: "Turn a request for a specific time into a commitment both sides can rely on, or say clearly that it did not.",
    eligibility: [
      "a request to reserve an identified slot on an identified resource or service",
      "no instance of this journey is already open for the the reservation request",
      "hard gates (GLB-31) allow communication for this purpose"
    ],
    suppressions: [
      {
        "id": "s.g1",
        "label": "CANONICAL_RULE",
        "text": "A request submitted is not a reservation confirmed."
      },
      {
        "id": "s.g2",
        "label": "CANONICAL_RULE",
        "text": "Previously displayed availability may have changed and is revalidated rather than trusted."
      },
      {
        "id": "s.g3",
        "label": "CANONICAL_RULE",
        "text": "A payment attempt alone does not confirm a reservation unless the authoritative booking semantics say so."
      }
    ],
    implementation: {
      "attributes": {
        "required": [
          "reservation_request_id",
          "requester_id",
          "resource_ref",
          "slot_ref",
          "booking_requirements",
          "reservation_log"
        ],
        "optional": []
      }
    },
    measurement: {
      "journeyOutcome": {
        "type": "exit-or-handoff",
        "refs": [
          "x.already",
          "x.lapsed",
          "h.alternative",
          "h.prepare"
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
        "reservation validation",
        "booking request validation",
        "confirm a booking",
        "booking capacity check"
      ],
      "useCases": [
        "a request for a specific time turned into a commitment or clearly not",
        "a pending requirement resolved or lapsed before anything is committed"
      ]
    },
    entry: "t.requested",
    nodes: [
      {
        id: "t.requested",
        kind: "trigger",
        event: "reservation_requested",
        evidence: {
          requires: ["a request to reserve an identified slot on an identified resource or service"],
          insufficientAlone: [
            "a payment attempt for the booking, which funds it without confirming it unless the booking semantics explicitly make payment the confirming act",
            "a slot being held, which protects capacity without committing anyone to anything",
          ],
          source: "declared",
        },
        next: "a.capture",
      },
      {
        id: "a.capture",
        kind: "action",
        does: "Capture the requested slot, the resource or service, the requester, the details the booking requires and the intent behind it",
        writes: [{ field: "reservation_log", mode: "append" }],
        next: "c.duplicate",
        idempotencyKey: "reservation_request_id + a.capture",
      },
      {
        id: "c.duplicate",
        kind: "condition",
        asks: "Does a confirmed reservation already exist for this requester, resource and slot?",
        branches: [
          {
            label: "It exists",
            when: "the same booking is already confirmed",
            to: "x.already",
          },
          {
            label: "None",
            when: "no confirmed reservation covers it",
            to: "a.revalidate",
          },
        ],
      },
      {
        id: "x.already",
        kind: "exit",
        state: "already confirmed; the existing reservation stands and no second one was created",
        terminal: false,
        reEntry:
          "a genuinely different booking is a different request. A resubmitted one resolves here rather than consuming a second slot",
        class: "success",
      },
      {
        id: "a.revalidate",
        kind: "action",
        does: "Re-read the slot's current state rather than trusting what the requester was shown. The availability they saw was true when it was rendered and may not be true now - under contention this is the single most common way two people end up holding one appointment, and only one of them finds out at the door",
        next: "c.capacity",
      },
      {
        id: "c.capacity",
        kind: "condition",
        asks: "Is the capacity still available to this requester?",
        branches: [
          {
            label: "Available",
            when: "the slot is free, or is held by this requester",
            to: "a.validate-req",
          },
          {
            label: "Gone",
            when: "the capacity was taken between the query and the request",
            to: "a.reject",
          },
        ],
      },
      {
        id: "a.reject",
        kind: "action",
        does: "Record the request REJECTED with the reason. What is offered next is current availability rather than the set the requester was originally shown, which by definition contains at least one slot that no longer exists",
        writes: [{ field: "reservation_log", mode: "append" }],
        next: "h.alternative",
        idempotencyKey: "reservation_request_id + a.reject",
      },
      {
        id: "h.alternative",
        kind: "handoff",
        to: "SCH-171",
        on: "a reservation that could not be made against the requested slot",
        carries: [
          "the resource, the service and the window the requester actually wanted",
          "the explicit fact that nothing is held and nothing was committed",
        ],
      },
      {
        id: "a.validate-req",
        kind: "action",
        does: "Validate the requester's eligibility, the details the booking requires and the dependencies its semantics define. Eligibility for a service and availability of a slot are different questions, and passing one says nothing about the other",
        next: "c.requirements",
      },
      {
        id: "c.requirements",
        kind: "condition",
        asks: "What do the booking requirements say?",
        branches: [
          {
            label: "All satisfied",
            when: "eligibility, details and dependencies are all in place",
            to: "a.confirm",
          },
          {
            label: "A further confirmation or dependency is required",
            when: "the booking semantics require an approval, a prepayment or a verification before it can commit",
            to: "a.pending",
          },
          {
            label: "Not met",
            when: "a requirement fails and cannot be satisfied for this request",
            to: "a.reject",
          },
        ],
      },
      {
        id: "a.pending",
        kind: "action",
        does: "Record PENDING_CONFIRMATION with exactly what is outstanding, and keep the capacity protected for as long as the booking semantics allow. Pending is not confirmed and the requester is told which - an appointment someone believes they have and does not have is worse than being asked to wait",
        writes: [{ field: "reservation_log", mode: "append" }],
        next: "w.pending",
        idempotencyKey: "reservation_request_id + a.pending",
      },
      {
        id: "w.pending",
        kind: "wait",
        until: [
          "dependency_resolved",
          "request_withdrawn"
        ],
        onEvent: "c.pending-outcome",
        timeout: {
          "after": {
            "key": "reservation_request.pending",
            "rule": "The pending window the booking semantics allow.",
            "class": "observation-window",
            "required": true
          },
          "reason": "capacity protected indefinitely for a booking that never completes is capacity taken from everyone who would have completed one",
          "relativeTo": "trigger"
        },
        onTimeout: "a.lapse",
        windowExtendsOnEngagement: false,
        recheck: "the the reservation request re-read from the system of record before acting on the timeout",
      },
      {
        id: "c.pending-outcome",
        kind: "condition",
        asks: "How did the pending requirement resolve?",
        branches: [
          {
            label: "Resolved",
            when: "the outstanding confirmation or dependency completed",
            to: "a.confirm",
          },
          {
            label: "Withdrawn",
            when: "the requester withdrew before it resolved",
            to: "a.lapse",
          },
        ],
      },
      {
        id: "a.lapse",
        kind: "action",
        does: "Record the request as lapsed and release any capacity protected for it. The slot returns to availability rather than staying reserved against a booking that never completed",
        writes: [{ field: "reservation_log", mode: "append" }],
        next: "x.lapsed",
        idempotencyKey: "reservation_request_id + a.lapse",
      },
      {
        id: "x.lapsed",
        kind: "exit",
        state: "request lapsed; capacity released and nothing committed",
        terminal: false,
        reEntry:
          "a new request is evaluated against current availability, which may no longer include the slot that was being held",
        class: "timeout",
      },
      {
        id: "a.confirm",
        kind: "action",
        does: "Create the commitment explicitly. Record CONFIRMED_RESERVATION with the slot, the resource, the parties and the terms. This is the point at which two parties owe each other a specific time - the customer arranges their day around it and the provider stops selling the slot - and nothing before it was that",
        writes: [{ field: "reservation_log", mode: "append" }],
        next: "h.prepare",
        idempotencyKey: "reservation_request_id + a.confirm",
      },
      {
        id: "h.prepare",
        kind: "handoff",
        to: "SCH-174",
        on: "a confirmed reservation with time still to run before it",
        carries: [
          "the commitment, its time and the parties",
          "the explicit fact that the time is now fixed and preparation runs alongside it rather than deciding it",
          "a fresh booking_id minted at a.confirm, deterministically derived from reservation_request_id, so SCH-174 can construct its own instance",
        ],
        contract: { requiredFields: ["booking_id"] },
      },
    ],
    guardrails: [
      "A request submitted is not a reservation confirmed.",
      "Previously displayed availability may have changed and is revalidated rather than trusted.",
      "A payment attempt alone does not confirm a reservation unless the authoritative booking semantics say so.",
    ],
    reusableRule:
      "A reservation becomes confirmed only when the requested capacity and all required booking conditions have been authoritatively committed.",
  },

  /* ------------------------------------------------------------ SCH-174 */
  {
    id: "SCH-174",
    slug: "reservation-preparation",
    category: "scheduling",
    goal: "scheduling-commitment",
    channels: [],
    name: "Reservation confirmed → prepare → upcoming or ready",
    shortName: "Reservation Readiness",
    purpose:
      "Get the conditions for a successful service in place, without letting them move the time that was promised.",
    entity: {
      scope: "the confirmed reservation and the preparation running against it",
      note: "The preparation is subordinate to the booking. It can fail, and the booking stays confirmed while somebody decides what to do about it.",
      instanceKey: [
        "booking_id"
      ],
      concurrency: "one-active-per-key"
    },
    objective: "Establish, by the pre-service checkpoint, that every prerequisite of a confirmed reservation is met - escalating what is not to ownership - so that the start-time journey begins from a booking that is actually ready.",
    eligibility: [
      "a reservation is confirmed with its prerequisites defined",
      "the pre-service checkpoint for its service class is defined",
      "no readiness instance is already open for this booking"
    ],
    suppressions: [
      {
        "id": "s.changed",
        "label": "CANONICAL_RULE",
        "text": "A booking that materially changes - moved, reassigned, cancelled - supersedes the open readiness instance; readiness is re-established against the new booking, never carried over."
      },
      {
        "id": "s.silent",
        "label": "CANONICAL_RULE",
        "text": "This journey sends nothing to the customer; prerequisites the customer must meet are prompted by the reminder journey (SCH-266), and what remains unmet at the checkpoint goes to ownership."
      }
    ],
    implementation: {
      "attributes": {
        "required": [
          "booking_id",
          "scheduled_at",
          "prerequisites",
          "checkpoint_lead",
          "provider_id"
        ],
        "optional": [
          "prerequisite_status",
          "owner_id"
        ]
      }
    },
    measurement: {
      "journeyOutcome": {
        "type": "exit-or-handoff",
        "refs": [
          "x.upcoming",
          "x.superseded",
          "h.escalate"
        ]
      },
      "businessOutcome": {
        "event": "prerequisites_completed",
        "unit": "instance",
        "observationScope": {
          "type": "self"
        },
        "window": {
          "type": "until-exit"
        },
        "attribution": "entered-before-event",
        "comparison": "not-applicable"
      },
      "secondary": [
        "booking_materially_changed"
      ],
      "guardrails": [
        "start_on_unready_booking",
        "readiness_carried_over_change"
      ],
      "operational": [
        "confirmed_volume",
        "ready_at_checkpoint_rate",
        "escalation_rate",
        "superseded_rate"
      ]
    },
    discovery: {
      "aliases": [
        "reservation readiness",
        "booking preparation",
        "pre-service checklist",
        "prerequisite tracking",
        "readiness checkpoint"
      ],
      "useCases": [
        "an appointment whose intake forms and access details must be in place before the checkpoint",
        "a reservation whose provider-side prerequisites are tracked to a checkpoint"
      ]
    },
    entry: "t.confirmed",
    nodes: [
      {
        id: "t.confirmed",
        kind: "trigger",
        event: "reservation_confirmed",
        evidence: {
          requires: ["a reservation confirmed with a scheduled time still in the future"],
          insufficientAlone: [
            "a booking requested but not confirmed",
            "a confirmation with no prerequisites defined, which has nothing to make ready",
            "a reminder having been sent, which says nothing about readiness"
          ],
          source: "authoritative",
        },
        next: "a.determine",
      },
      {
        id: "a.determine",
        kind: "action",
        does: "Determine the pre-event requirements this booking actually has - forms, documents, instructions, resource preparation, verification, prepayment, a check-in requirement, provider preparation. Which apply is a property of this service rather than a standard list, and running the standard list asks people for things their appointment does not need",
        writes: [{ field: "preparation_log", mode: "append" }],
        next: "c.existing",
        idempotencyKey: "booking_id + a.determine",
      },
      {
        id: "c.existing",
        kind: "condition",
        asks: "Is each prerequisite already satisfied or already running?",
        branches: [
          {
            label: "Already handled",
            when: "the requirement is satisfied, or a journey against it is already live",
            to: "a.skip",
          },
          {
            label: "Outstanding",
            when: "the requirement is neither satisfied nor in progress",
            to: "a.initiate",
          },
        ],
      },
      {
        id: "a.skip",
        kind: "action",
        does: "Do not repeat it. A verification completed last month is completed, and re-running it opens a second journey against one requirement and asks the customer for something they have already given",
        next: "w.prepare",
      },
      {
        id: "a.initiate",
        kind: "action",
        does: "Initiate each outstanding prerequisite on its own lifecycle. The reservation's time does not move while they run, and none of them owns the booking",
        writes: [{ field: "preparation_log", mode: "append" }],
        next: "w.prepare",
        idempotencyKey: "booking_id + a.initiate",
      },
      {
        id: "w.prepare",
        kind: "wait",
        until: [
          "prerequisites_completed",
          "booking_materially_changed"
        ],
        onEvent: "c.event",
        timeout: {
          "after": {
            "key": "scheduling.readiness_checkpoint",
            "rule": "The checkpoint is the lead the pre-service policy defines ahead of the scheduled time for this service class; what is unmet at the checkpoint is escalated, not waited on further.",
            "class": "reminder-before-attribute",
            "required": true
          },
          "reason": "the checkpoint is the last point at which an unresolved prerequisite can still be acted on. After it, the choice is to proceed unprepared or to disrupt someone's day at short notice",
          "relativeTo": "attribute",
          "attribute": "scheduled_at"
        },
        onTimeout: "c.critical",
        windowExtendsOnEngagement: false,
        recheck: "the booking and each prerequisite re-read at the checkpoint",
      },
      {
        id: "c.event",
        kind: "condition",
        asks: "What resolved the wait?",
        branches: [
          {
            label: "Preparation complete",
            when: "every prerequisite finished before the checkpoint",
            to: "a.ready",
          },
          {
            label: "The booking changed",
            when: "the reservation was rescheduled, cancelled or materially altered",
            to: "x.superseded",
          },
        ],
      },
      {
        id: "x.superseded",
        kind: "exit",
        state: "preparation superseded by a change to the booking",
        terminal: false,
        reEntry:
          "the reschedule or cancellation owns what happens next. Preparation is re-derived against the new booking rather than carried across, because a different time can need different things",
        class: "invalid-state",
      },
      {
        id: "c.critical",
        kind: "condition",
        asks: "Is an unresolved prerequisite critical to delivering the service?",
        branches: [
          {
            label: "Critical",
            when: "the service cannot be delivered properly without it",
            to: "a.at-risk",
          },
          {
            label: "Not critical",
            when: "the service can proceed and the requirement can follow",
            to: "a.ready",
          },
        ],
      },
      {
        id: "a.at-risk",
        kind: "action",
        does: "Record AT_RISK or HOLD according to policy, naming the prerequisite. The confirmed time is not moved here - a preparation failing is a reason to escalate or to contact someone, and moving an appointment is a booking decision that belongs to the reschedule lifecycle",
        writes: [{ field: "preparation_log", mode: "append" }],
        next: "h.escalate",
        idempotencyKey: "booking_id + a.at-risk",
      },
      {
        id: "h.escalate",
        kind: "handoff",
        to: "OWN-55",
        on: "a critical prerequisite unresolved at the pre-service checkpoint",
        carries: [
          "the booking, its time and exactly which prerequisite is missing",
          "the explicit fact that the reservation remains confirmed and no time has been changed",
        ],
      },
      {
        id: "a.ready",
        kind: "action",
        does: "Record READY or UPCOMING with which prerequisites are complete and which are outstanding but not critical. A reminder having been sent is recorded separately from preparation being complete, because the first is something we did and the second is something that happened",
        writes: [{ field: "preparation_log", mode: "append" }],
        next: "x.upcoming",
        idempotencyKey: "booking_id + a.ready",
      },
      {
        id: "x.upcoming",
        kind: "exit",
        state: "READY or UPCOMING; the commitment stands and its conditions are in the state recorded",
        terminal: false,
        reEntry:
          "the revalidation at service time reads the booking's current state rather than this readiness record, which was true when it was written",
        class: "success",
      },
    ],
    guardrails: [
      "A reminder sent is not preparation complete.",
      "Duplicate prerequisite journeys are not created for a requirement already satisfied or running.",
      "Preparation never alters the confirmed time unless the booking rules themselves require it.",
    ],
    reusableRule:
      "A confirmed reservation should preserve the time commitment while independently preparing the conditions required for successful service delivery.",
  },

  /* ------------------------------------------------------------ SCH-175 */
  {
    id: "SCH-175",
    slug: "reschedule",
    category: "scheduling",
    goal: "scheduling-commitment",
    channels: [],
    name: "Reschedule request → recheck availability → move, reject or preserve original",
    shortName: "Reschedule Validation",
    purpose:
      "Move a commitment to a new time without ever leaving the customer holding neither.",
    entity: {
      scope: "the existing reservation and the reschedule request raised against it",
      note: "One reservation throughout, carrying every time it has held. A reschedule is a move recorded on it rather than a cancellation followed by a new booking.",
      instanceKey: [
        "booking_id",
        "reschedule_request_id"
      ],
      concurrency: "one-active-per-key"
    },
    distinctFrom: [
      {
        journey: "SUB-166",
        because:
          "SUB-166 changes the terms of a continuing relationship. This moves one specific occurrence to a different time or resource, and its whole difficulty is contention for the replacement - which terms changes never have.",
      },
    ],
    objective: "Move a commitment to a new time without ever leaving the customer holding neither.",
    eligibility: [
      "an authorized request to move an existing confirmed reservation",
      "no instance of this journey is already open for the the existing reservation and the reschedule request raised against it",
      "hard gates (GLB-31) allow communication for this purpose"
    ],
    suppressions: [
      {
        "id": "s.g1",
        "label": "CANONICAL_RULE",
        "text": "A reschedule requested is not a reschedule completed."
      },
      {
        "id": "s.g2",
        "label": "CANONICAL_RULE",
        "text": "The original slot is never released before the replacement is secured unless policy explicitly requires it."
      },
      {
        "id": "s.g3",
        "label": "CANONICAL_RULE",
        "text": "The historical original time remains auditable."
      }
    ],
    implementation: {
      "attributes": {
        "required": [
          "booking_id",
          "reschedule_request_id",
          "requested_time",
          "replacement_candidate",
          "preparation_requirements",
          "reservation_log"
        ],
        "optional": []
      }
    },
    measurement: {
      "journeyOutcome": {
        "type": "exit-or-handoff",
        "refs": [
          "x.original-stands",
          "x.rescheduled",
          "h.prepare"
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
        "reschedule validation",
        "move a booking",
        "change appointment time",
        "rebooking"
      ],
      "useCases": [
        "a commitment moved without the customer ever holding neither",
        "a replacement lost to contention, leaving the original intact"
      ]
    },
    entry: "t.requested",
    nodes: [
      {
        id: "t.requested",
        kind: "trigger",
        event: "reschedule_requested",
        evidence: {
          requires: ["an authorized request to move an existing confirmed reservation"],
          insufficientAlone: [
            "someone viewing other times, which is looking rather than asking to move",
          ],
          source: "declared",
        },
        next: "a.preserve",
      },
      {
        id: "a.preserve",
        kind: "action",
        does: "Keep the original reservation confirmed and intact while the replacement is evaluated. Releasing it first is the mistake this journey exists to prevent - the customer ends up with no appointment at all, and the slot they had is gone by the time anyone realises the replacement was not available",
        writes: [{ field: "reservation_log", mode: "append" }],
        next: "a.search",
        idempotencyKey: "booking_id + reschedule_request_id + a.preserve",
      },
      {
        id: "a.search",
        kind: "action",
        does: "Search and validate the target availability against current authoritative capacity, for the resource and service the original booking actually requires",
        next: "c.replacement",
      },
      {
        id: "c.replacement",
        kind: "condition",
        asks: "Is a valid replacement available?",
        branches: [
          {
            label: "One exists",
            when: "a slot satisfying the booking's requirements is currently free",
            to: "a.secure",
          },
          {
            label: "None",
            when: "nothing valid is available in the requested window",
            to: "a.no-replacement",
          },
        ],
      },
      {
        id: "a.no-replacement",
        kind: "action",
        does: "Record the reschedule as not possible and leave the original reservation exactly as it was. The customer still has their appointment, which is the position they were in before they asked - and is a far better outcome than the alternative",
        writes: [{ field: "reservation_log", mode: "append" }],
        next: "x.original-stands",
        idempotencyKey: "booking_id + reschedule_request_id + a.no-replacement",
      },
      {
        id: "x.original-stands",
        kind: "exit",
        state: "original reservation preserved unchanged; no move took place",
        terminal: false,
        reEntry:
          "the reschedule can be attempted again against different availability. Cancelling the original is a separate decision the customer makes explicitly",
        class: "failure",
      },
      {
        id: "a.secure",
        kind: "action",
        does: "Secure the new slot under the same scheduling semantics as an original booking - a hold and then a confirmation, or a direct commitment where the resource permits. The replacement has to be genuinely committed before anything is given up",
        next: "c.secured",
      },
      {
        id: "c.secured",
        kind: "condition",
        asks: "Was the replacement actually secured?",
        branches: [
          {
            label: "Secured",
            when: "the new slot is committed to this reservation",
            to: "a.transfer",
          },
          {
            label: "Lost to contention",
            when: "the slot was taken between finding it and securing it",
            to: "a.no-replacement",
          },
        ],
      },
      {
        id: "a.transfer",
        kind: "action",
        does: "Transfer the commitment to the new slot, recording the original time, the new one and the fact that this reservation moved. The original time stays readable - a reservation that only ever shows its current time cannot answer how many times it was moved, which is the first thing anyone investigating a service problem wants to know",
        writes: [{ field: "reservation_log", mode: "append" }],
        next: "a.release-old",
        idempotencyKey: "booking_id + reschedule_request_id + a.transfer",
      },
      {
        id: "a.release-old",
        kind: "action",
        does: "Release the original slot, and only now. Capacity returns to availability at the point the replacement is real, which is the ordering the whole journey exists to enforce",
        writes: [{ field: "reservation_log", mode: "append" }],
        next: "a.reconcile",
        idempotencyKey: "booking_id + reschedule_request_id + a.release-old",
      },
      {
        id: "a.reconcile",
        kind: "action",
        does: "Reconcile everything that pointed at the old time - the resource, the provider, the instructions, the prepayment, the preparation tasks and every queued notification. A reminder still aimed at the original time will fire, and the customer will arrive on the wrong day because of it",
        writes: [
          { field: "reservation_log", mode: "append" },
          { field: "suppressed_sends", mode: "append" },
        ],
        next: "c.prep",
        idempotencyKey: "booking_id + reschedule_request_id + a.reconcile",
      },
      {
        id: "c.prep",
        kind: "condition",
        asks: "Does the new time or resource change what preparation is required?",
        branches: [
          {
            label: "It changes",
            when: "a different provider, location or lead time alters the prerequisites",
            to: "h.prepare",
          },
          {
            label: "Unchanged",
            when: "the same preparation applies and is already in the state it was",
            to: "x.rescheduled",
          },
        ],
      },
      {
        id: "h.prepare",
        kind: "handoff",
        to: "SCH-174",
        on: "a rescheduled booking whose preparation requirements have changed",
        carries: [
          "the new time and resource, and which prerequisites are already satisfied",
          "the explicit instruction not to re-request what the customer has already provided",
        ],
      },
      {
        id: "x.rescheduled",
        kind: "exit",
        state: "moved; the new time is committed and the original is preserved in the record",
        terminal: false,
        reEntry:
          "a further move is a new reschedule against this reservation, and it joins the same history rather than replacing it",
        class: "success",
      },
    ],
    guardrails: [
      "A reschedule requested is not a reschedule completed.",
      "The original slot is never released before the replacement is secured unless policy explicitly requires it.",
      "The historical original time remains auditable.",
    ],
    reusableRule:
      "Rescheduling should preserve the existing commitment until a valid replacement commitment has been successfully established.",
  },

  /* ------------------------------------------------------------ SCH-176 */
  {
    id: "SCH-176",
    slug: "reservation-cancellation",
    category: "scheduling",
    goal: "cancellation-termination",
    channels: [],
    name: "Reservation cancellation → stop commitment → release capacity → reconcile",
    shortName: "Reservation Cancellation Reconciliation",
    purpose:
      "End a future time commitment cleanly, returning the capacity and leaving the money to be decided elsewhere.",
    entity: {
      scope: "the reservation and the cancellation acting on it",
      note: "The reservation survives its own cancellation as a record. A released slot says something about capacity and nothing about whether the appointment existed.",
      instanceKey: [
        "booking_id"
      ],
      concurrency: "one-active-per-key"
    },
    distinctFrom: [
      {
        journey: "FUL-150",
        because:
          "FUL-150 cancels what remains of a generic fulfillment obligation. This ends a specific future time commitment, which releases capacity someone else can use and turns on timing relative to the appointment rather than on remaining scope.",
      },
    ],
    objective: "End a future time commitment cleanly, returning the capacity and leaving the money to be decided elsewhere.",
    eligibility: [
      "an authorized cancellation of a confirmed reservation, taking effect",
      "no instance of this journey is already open for the the reservation and the cancellation acting on it",
      "hard gates (GLB-31) allow communication for this purpose"
    ],
    suppressions: [
      {
        "id": "s.g1",
        "label": "CANONICAL_RULE",
        "text": "A cancellation requested is not a cancellation effective."
      },
      {
        "id": "s.g2",
        "label": "CANONICAL_RULE",
        "text": "A cancellation is not a no-show."
      },
      {
        "id": "s.g3",
        "label": "CANONICAL_RULE",
        "text": "Cancellation never deletes reservation history."
      },
      {
        "id": "s.g4",
        "label": "CANONICAL_RULE",
        "text": "The refund or fee decision belongs to the financial lifecycle rather than to this one."
      }
    ],
    implementation: {
      "attributes": {
        "required": [
          "booking_id",
          "cancellation_log",
          "reservation_log",
          "suppressed_sends"
        ],
        "optional": []
      }
    },
    measurement: {
      "journeyOutcome": {
        "type": "exit-or-handoff",
        "refs": [
          "x.cancelled",
          "h.provider",
          "h.reconcile",
          "h.refund",
          "h.fee"
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
        "reservation cancellation reconciliation",
        "cancel a booking",
        "appointment cancellation",
        "booking cancelled"
      ],
      "useCases": [
        "a future commitment ended cleanly with capacity returned",
        "the refund or fee decided elsewhere"
      ]
    },
    entry: "t.effective",
    nodes: [
      {
        id: "t.effective",
        kind: "trigger",
        event: "reservation_cancellation_effective",
        evidence: {
          requires: ["an authorized cancellation of a confirmed reservation, taking effect"],
          insufficientAlone: [
            "a cancellation requested, which is a request and may be blocked or may be for a later effective time",
            "someone not responding to a reminder, which is silence rather than a cancellation",
          ],
          source: "authoritative",
        },
        next: "a.record",
      },
      {
        id: "a.record",
        kind: "action",
        does: "Record the actor and source, the reason, the effective time, the reservation's state at cancellation, and the timing relative to the scheduled service. The timing is what most cancellation policies turn on, and it has to be recorded at the moment rather than reconstructed afterwards from timestamps that mean something else",
        writes: [{ field: "cancellation_log", mode: "append" }],
        next: "c.actor",
        idempotencyKey: "booking_id + a.record",
      },
      {
        id: "c.actor",
        kind: "condition",
        asks: "Which side cancelled?",
        branches: [
          {
            label: "The customer or requester",
            when: "the cancellation originates from the party who booked",
            to: "a.cancel",
          },
          {
            label: "The provider or resource side",
            when: "the cancellation originates because we cannot deliver",
            to: "h.provider",
          },
        ],
      },
      {
        id: "h.provider",
        kind: "handoff",
        to: "SCH-180",
        on: "a cancellation originating on the provider side",
        carries: [
          "the reservation, the failure and its scope",
          "the explicit instruction that the customer is not recorded as having cancelled and is never classified as a no-show",
        ],
      },
      {
        id: "a.cancel",
        kind: "action",
        does: "Mark the reservation CANCELLED, preserving everything about it - the original booking, the times it held, the preparation that ran. The history is not deleted, because a released slot is capacity returning to the pool and says nothing about whether the appointment ever existed",
        writes: [{ field: "reservation_log", mode: "append" }],
        next: "a.release",
        idempotencyKey: "booking_id + a.cancel",
      },
      {
        id: "a.release",
        kind: "action",
        does: "Release the reserved capacity where the booking semantics permit it. The release is idempotent - an already-released reservation returns capacity once rather than once per attempt, and the difference shows up as two people booked into one room",
        writes: [{ field: "reservation_log", mode: "append" }],
        next: "a.stop",
        idempotencyKey: "booking_id + a.release",
      },
      {
        id: "a.stop",
        kind: "action",
        does: "Stop the obsolete preparation, reminders and check-in actions. A reminder for a cancelled appointment brings someone to a place where nobody is expecting them, which is the most avoidable failure in this whole category",
        writes: [{ field: "suppressed_sends", mode: "append" }],
        next: "c.external",
        idempotencyKey: "booking_id + a.stop",
      },
      {
        id: "c.external",
        kind: "condition",
        asks: "Is an external provider or booking system holding this reservation?",
        branches: [
          {
            label: "It is",
            when: "the slot exists in a system outside our own",
            to: "a.verify-external",
          },
          {
            label: "It is not",
            when: "the reservation is entirely internal",
            to: "c.financial",
          },
        ],
      },
      {
        id: "a.verify-external",
        kind: "action",
        does: "Verify the cancellation actually took effect on the external side. A cancellation we recorded and they did not leaves them holding a slot we have released, and both sides discover it when someone arrives",
        next: "c.verified",
      },
      {
        id: "c.verified",
        kind: "condition",
        asks: "Did the external side confirm the cancellation?",
        branches: [
          {
            label: "Confirmed",
            when: "the external system authoritatively reports it cancelled",
            to: "c.financial",
          },
          {
            label: "Not confirmed",
            when: "the external side is unreachable, silent or still shows it booked",
            to: "h.reconcile",
          },
        ],
      },
      {
        id: "h.reconcile",
        kind: "handoff",
        to: "external:external-status-reconciliation",
        on: "a cancellation the external booking system has not confirmed",
        carries: [
          "the reservation, its external reference and what the external side last reported",
          "the explicit fact that capacity was released locally and may still be held externally",
        ],
        contract: {
          "requiredFields": [
            "booking_id",
            "handed_at",
            "reason"
          ]
        },
      },
      {
        id: "c.financial",
        kind: "condition",
        asks: "Does the cancellation carry a financial consequence?",
        branches: [
          {
            label: "A refund or credit may be due",
            when: "the booking was paid for and the terms may return some or all of it",
            to: "h.refund",
          },
          {
            label: "A cancellation fee applies",
            when: "the terms create a charge given the timing of the cancellation",
            to: "h.fee",
          },
          {
            label: "Neither",
            when: "nothing was paid and the terms create no charge",
            to: "x.cancelled",
          },
        ],
      },
      {
        id: "h.refund",
        kind: "handoff",
        to: "FIN-137",
        on: "a cancelled reservation that was paid for",
        carries: [
          "what was paid, the cancellation timing and the terms that govern it",
          "the explicit fact that this journey ended the booking and decided nothing about whether money is owed",
        ],
      },
      {
        id: "h.fee",
        kind: "handoff",
        to: "FIN-131",
        on: "a cancellation the terms attach a fee to",
        carries: [
          "the fee basis, the cancellation timing and the term that creates it",
          "the explicit fact that no fee amount was invented here - the terms define it or there is no fee",
        ],
      },
      {
        id: "x.cancelled",
        kind: "exit",
        state: "CANCELLED; capacity released, history preserved, nothing owed",
        terminal: false,
        reEntry:
          "a new booking is a new reservation rather than this one resuming, and this cancellation stays part of the record either way",
        class: "success",
      },
    ],
    guardrails: [
      "A cancellation requested is not a cancellation effective.",
      "A cancellation is not a no-show.",
      "Cancellation never deletes reservation history.",
      "The refund or fee decision belongs to the financial lifecycle rather than to this one.",
    ],
    reusableRule:
      "Reservation cancellation ends the future time-bound commitment while independently reconciling released capacity and any resulting financial obligations.",
  },

  /* ------------------------------------------------------------ SCH-177 */
  {
    id: "SCH-177",
    slug: "scheduled-start",
    category: "scheduling",
    goal: "readiness-revalidation",
    channels: [],
    name: "Scheduled time approaches → revalidate → check in, start or exception",
    shortName: "Pre-Service Revalidation",
    purpose:
      "Start a service from what the booking is now, not from a confirmation issued weeks ago.",
    entity: {
      scope: "the confirmed reservation and the occurrence about to begin",
      note: "The scheduled job carries the booking version it was created against. Everything it does begins with comparing that against the booking as it now stands.",
      instanceKey: [
        "booking_id",
        "occurrence_id"
      ],
      concurrency: "one-active-per-key"
    },
    objective: "Start a service from what the booking is at its start time, and establish attendance from evidence rather than from the fact that a reminder went out.",
    eligibility: [
      "the booking's pre-start window has been reached in the booking's own local time",
      "the booking was confirmed and has not been superseded by a later confirmation"
    ],
    suppressions: [
      {
        "id": "s.stale",
        "label": "CANONICAL_RULE",
        "text": "A start that no longer matches authoritative state - cancelled, moved, reassigned - is suppressed: no service is begun and no attendance is recorded against a booking that is not the one the person holds."
      },
      {
        "id": "s.cancelled-inside-window",
        "label": "CANONICAL_RULE",
        "text": "A cancellation arriving inside the start window is a cancellation, not a no-show; it hands to cancellation reconciliation and nothing here treats it as a miss."
      }
    ],
    implementation: {
      "attributes": {
        "required": [
          "booking_id",
          "occurrence_id",
          "person_id",
          "scheduled_at",
          "timezone",
          "provider_id",
          "arrival_evidence_source"
        ],
        "optional": [
          "grace_policy_id"
        ]
      }
    },
    measurement: {
      "journeyOutcome": {
        "type": "exit-or-handoff",
        "refs": [
          "h.attended",
          "h.missed",
          "h.cancelled",
          "h.provider-exception",
          "x.suppressed"
        ]
      },
      "businessOutcome": {
        "event": "attendance_recorded",
        "unit": "instance",
        "observationScope": {
          "type": "self"
        },
        "window": {
          "type": "until-exit"
        },
        "attribution": "entered-before-event",
        "comparison": "not-applicable"
      },
      "guardrails": [
        "service_started_on_stale_booking",
        "attendance_recorded_without_evidence"
      ],
      "operational": [
        "arrival_rate",
        "suppressed_start_rate",
        "cancellation_inside_window_rate",
        "time_from_scheduled_to_arrival"
      ]
    },
    discovery: {
      "aliases": [
        "pre-service check",
        "arrival window",
        "check-in",
        "start-time revalidation"
      ],
      "useCases": [
        "an appointment reaching its start time",
        "a reservation whose arrival must be established before service begins"
      ]
    },
    entry: "t.window",
    nodes: [
      {
        id: "t.window",
        kind: "trigger",
        event: "pre_start_window_reached",
        evidence: {
          requires: ["the defined pre-start or start window for a scheduled occurrence being reached"],
          insufficientAlone: [
            "a reminder having been sent, which says nothing about the start",
            "the scheduled time itself passing - that is the arrival window, not its opening",
            "a provider-side readiness check, which SCH-174 owns"
          ],
          source: "authoritative",
        },
        next: "a.revalidate",
      },
      {
        id: "a.revalidate",
        kind: "action",
        does: "Re-read the booking from authoritative current state - is the reservation still confirmed, is the resource or provider available, are the required prerequisites met, does eligibility still hold where it is required, is there a material operational restriction. The confirmation from three weeks ago is not evidence about now, and this job is running because of a clock rather than because anything was checked",
        next: "c.valid",
      },
      {
        id: "c.valid",
        kind: "condition",
        asks: "Is the reservation still valid?",
        branches: [
          {
            label: "Still confirmed",
            when: "the booking stands as scheduled",
            to: "c.provider",
          },
          {
            label: "Cancelled or rescheduled since",
            when: "the booking has moved or ended since the job was scheduled",
            to: "a.suppress",
          },
        ],
      },
      {
        id: "a.suppress",
        kind: "action",
        does: "Record the scheduled job as suppressed, naming what superseded it. A stale start job revives a cancelled booking, allocates a provider to it, and then produces a no-show for someone who cancelled correctly - three wrong outcomes from one unchecked assumption",
        writes: [
          { field: "reservation_log", mode: "append" },
          { field: "suppressed_sends", mode: "append" },
        ],
        next: "x.suppressed",
        idempotencyKey: "booking_id + occurrence_id + a.suppress",
      },
      {
        id: "x.suppressed",
        kind: "exit",
        state: "stale start suppressed; no service was begun and no attendance state was written",
        terminal: false,
        reEntry:
          "the booking's current version has its own scheduled occurrence, which revalidates on its own terms when it arrives",
        class: "invalid-state",
      },
      {
        id: "c.provider",
        kind: "condition",
        asks: "Can the provider or resource actually deliver?",
        branches: [
          {
            label: "They can",
            when: "the assigned provider and resource are available and able",
            to: "c.prereq",
          },
          {
            label: "They cannot",
            when: "the provider is unavailable, the resource failed, or the location cannot host it",
            to: "h.provider-exception",
          },
        ],
      },
      {
        id: "h.provider-exception",
        kind: "handoff",
        to: "SCH-180",
        on: "a booking that cannot be delivered by its assigned provider or resource",
        carries: [
          "the reservation, its time and what has failed",
          "the explicit instruction that the customer's obligation stands and they are not the cause",
        ],
      },
      {
        id: "c.prereq",
        kind: "condition",
        asks: "Are the critical prerequisites met?",
        branches: [
          {
            label: "Met",
            when: "everything the service requires to start properly is in place",
            to: "a.ready",
          },
          {
            label: "Missing",
            when: "a prerequisite the service cannot proceed without is unresolved",
            to: "a.blocked",
          },
        ],
      },
      {
        id: "a.blocked",
        kind: "action",
        does: "Record the occurrence as blocked at service time with the missing prerequisite, and do not start. Starting a service whose prerequisite is missing produces a partial or invalid delivery, which then needs a remedy - and the customer has spent the appointment either way",
        writes: [{ field: "reservation_log", mode: "append" }],
        next: "h.escalate",
        idempotencyKey: "booking_id + occurrence_id + a.blocked",
      },
      {
        id: "h.escalate",
        kind: "handoff",
        to: "OWN-55",
        on: "a service blocked at its own start time",
        carries: [
          "the booking, the missing prerequisite and the fact that the customer is present or expected",
          "the explicit fact that nothing was started and no attendance outcome was recorded",
        ],
      },
      {
        id: "a.ready",
        kind: "action",
        does: "Record READY_TO_START. The scheduled time arriving is not the service starting - the two are kept apart because everything between them can still fail, and most of what fails in this category fails exactly here",
        writes: [{ field: "reservation_log", mode: "append" }],
        next: "w.arrival",
        idempotencyKey: "booking_id + occurrence_id + a.ready",
      },
      {
        id: "w.arrival",
        kind: "wait",
        until: [
          "attendance_recorded",
          "booking_cancelled"
        ],
        onEvent: "c.arrival",
        timeout: {
          "after": {
            "key": "scheduling.arrival_window",
            "rule": "The arrival window is the tolerance after the scheduled start that the service's own attendance semantics allow. Its end is what turns a late arrival into a miss.",
            "class": "attribute-bound",
            "default": {
              "value": "scheduled_at plus the arrival tolerance policy records",
              "confidence": "high",
              "basis": "attribute-bound"
            },
            "required": false
          },
          "reason": "the arrival window is what makes a missed appointment a fact rather than an assumption. Concluding before it closes records a no-show against someone who is running late and about to walk in",
          "relativeTo": "attribute",
          "attribute": "scheduled_at"
        },
        onTimeout: "h.missed",
        windowExtendsOnEngagement: false,
        recheck: "the booking re-read at the end of the window: still the same commitment, and attendance evidence from the source that records it",
      },
      {
        id: "c.arrival",
        kind: "condition",
        asks: "What happened inside the arrival window?",
        branches: [
          {
            label: "Attended",
            when: "attendance or check-in was authoritatively established",
            to: "h.attended",
          },
          {
            label: "Cancelled inside the window",
            when: "the booking was cancelled after the start window opened",
            to: "h.cancelled",
          },
        ],
      },
      {
        id: "h.attended",
        kind: "handoff",
        to: "SCH-178",
        on: "attendance established for a revalidated booking",
        carries: [
          "the booking, its scope and the prerequisites that were confirmed at start",
          "the explicit fact that attendance says the interaction began and nothing about its outcome",
        ],
      },
      {
        id: "h.cancelled",
        kind: "handoff",
        to: "SCH-176",
        on: "a cancellation arriving inside the start window",
        carries: [
          "the cancellation timing relative to the scheduled service, which is what its terms turn on",
        ],
      },
      {
        id: "h.missed",
        kind: "handoff",
        to: "SCH-179",
        on: "an arrival window closing with no attendance established",
        carries: [
          "the booking, the window that closed and the fact that it was revalidated and the provider was able",
          "the explicit instruction that this is not yet a no-show - the contradicting explanations have not been excluded",
        ],
      },
    ],
    guardrails: [
      "The scheduled time being reached is not the service having started.",
      "Interaction with a reminder is not attendance.",
      "A stale scheduled job never revives a cancelled or rescheduled reservation.",
    ],
    reusableRule:
      "A scheduled commitment should begin only after the reservation and its critical dependencies are revalidated at the time of service.",
  },

  /* ------------------------------------------------------------ SCH-178 */
  {
    id: "SCH-178",
    slug: "service-attendance",
    category: "scheduling",
    goal: "progression-milestone",
    channels: [],
    name: "Attendance or service start → complete, partial or interrupted",
    shortName: "Service Completion",
    purpose:
      "Separate the fact that someone turned up from the question of whether they got what they came for.",
    entity: {
      scope: "the reservation occurrence and the service delivered inside it",
      note: "Attendance is about the occurrence. Completion is about the obligation. One appointment can end with the first true and the second false.",
      instanceKey: [
        "booking_id"
      ],
      concurrency: "one-active-per-key"
    },
    objective: "Separate the fact that someone turned up from the question of whether they got what they came for.",
    eligibility: [
      "attendance or service commencement established authoritatively",
      "no instance of this journey is already open for the the reservation occurrence and the service delivered inside it",
      "hard gates (GLB-31) allow communication for this purpose"
    ],
    suppressions: [
      {
        "id": "s.g1",
        "label": "CANONICAL_RULE",
        "text": "Check-in is not service completed."
      },
      {
        "id": "s.g2",
        "label": "CANONICAL_RULE",
        "text": "Attendance is not a successful outcome."
      },
      {
        "id": "s.g3",
        "label": "CANONICAL_RULE",
        "text": "Partial service is never represented as full completion."
      }
    ],
    implementation: {
      "attributes": {
        "required": [
          "booking_id",
          "occurrence_log"
        ],
        "optional": []
      }
    },
    measurement: {
      "journeyOutcome": {
        "type": "exit-or-handoff",
        "refs": [
          "x.completed",
          "h.reconcile",
          "x.remainder-owed",
          "h.reschedule",
          "h.provider",
          "h.rebook"
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
        "service completion",
        "appointment completed",
        "service delivered",
        "attendance versus outcome"
      ],
      "useCases": [
        "turning up separated from getting what they came for",
        "a partial or interrupted service routed to its remedy or reschedule"
      ]
    },
    entry: "t.started",
    nodes: [
      {
        id: "t.started",
        kind: "trigger",
        event: "service_commencement_established",
        evidence: {
          requires: ["attendance or service commencement established authoritatively"],
          insufficientAlone: [
            "a reminder being opened or clicked, which is interest rather than attendance",
            "arriving at a location, where the booking semantics require a check-in to establish attendance",
          ],
          source: "authoritative",
        },
        next: "a.state",
      },
      {
        id: "a.state",
        kind: "action",
        does: "Record IN_SERVICE or ATTENDED. The interaction is happening and nothing about its outcome is known yet",
        writes: [{ field: "occurrence_log", mode: "append" }],
        next: "a.track",
        idempotencyKey: "booking_id + a.state",
      },
      {
        id: "a.track",
        kind: "action",
        does: "Track the scope actually delivered, where the service has a scope worth tracking. What is recorded is what was delivered rather than the fact that the appointment took place",
        writes: [{ field: "occurrence_log", mode: "append" }],
        next: "w.service",
        idempotencyKey: "booking_id + a.track",
      },
      {
        id: "w.service",
        kind: "wait",
        until: [
          "service_completion_recorded",
          "service_interrupted"
        ],
        onEvent: "c.outcome",
        timeout: {
          "after": {
            "key": "service_attendance.service",
            "rule": "The scheduled duration plus its tolerance.",
            "class": "observation-window",
            "required": true
          },
          "reason": "an occurrence that started and was never concluded is unknown rather than complete, and closing it as complete makes an unfulfilled service invisible to everyone downstream",
          "relativeTo": "trigger"
        },
        onTimeout: "a.unknown",
        windowExtendsOnEngagement: false,
        recheck: "the the reservation occurrence and the service delivered inside it re-read from the system of record before acting on the timeout",
      },
      {
        id: "a.unknown",
        kind: "action",
        does: "Record the occurrence's outcome as unknown - someone attended and what happened afterwards was never recorded. This is not completion, and treating it as completion closes an obligation nobody confirmed was met",
        writes: [{ field: "occurrence_log", mode: "append" }],
        next: "h.reconcile",
        idempotencyKey: "booking_id + a.unknown",
      },
      {
        id: "h.reconcile",
        kind: "handoff",
        to: "external:side-effect-reconciliation",
        on: "an occurrence that began and whose outcome was never established",
        carries: [
          "the booking, the attendance record and the point at which the trail stops",
          "the explicit fact that no completion was recorded and none should be inferred",
        ],
        contract: {
          "requiredFields": [
            "booking_id",
            "handed_at",
            "reason"
          ]
        },
      },
      {
        id: "c.outcome",
        kind: "condition",
        asks: "How did the service end?",
        branches: [
          {
            label: "Fully delivered",
            when: "the whole scheduled service was delivered",
            to: "a.complete",
          },
          {
            label: "Partly delivered",
            when: "some of the scheduled scope was delivered and some was not",
            to: "a.partial",
          },
          {
            label: "Interrupted",
            when: "delivery started and stopped before finishing",
            to: "a.interrupt",
          },
          {
            label: "Could not proceed after arrival",
            when: "the customer was present and the service never began",
            to: "a.could-not",
          },
        ],
      },
      {
        id: "a.complete",
        kind: "action",
        does: "Record COMPLETED. The scheduled obligation was met, which is a different claim from the appointment having happened",
        writes: [{ field: "occurrence_log", mode: "append" }],
        next: "x.completed",
        idempotencyKey: "booking_id + a.complete",
      },
      {
        id: "x.completed",
        kind: "exit",
        state: "COMPLETED; attendance and delivery both established",
        terminal: false,
        reEntry:
          "a problem raised afterwards about what was delivered is a post-completion issue and is assessed on its own terms",
        class: "success",
      },
      {
        id: "a.partial",
        kind: "action",
        does: "Record PARTIALLY_COMPLETED with exactly what was delivered and what remains. Attendance is not a successful outcome, and a half-delivered service recorded as complete closes something the customer is still owed - they will find out, and they will find out later than we could have told them",
        writes: [{ field: "occurrence_log", mode: "append" }],
        next: "x.remainder-owed",
        idempotencyKey: "booking_id + a.partial",
      },
      {
        id: "x.remainder-owed",
        kind: "exit",
        state: "the appointment occurred but the service was delivered only in part; the delivered scope and the remaining obligation are recorded separately, and this is a shortfall rather than a missed service, but no remedy engine in this journey resolves it",
        terminal: false,
        reEntry: "the remaining obligation being resolved is recorded against this occurrence",
        class: "no-action",
      },
      {
        id: "a.interrupt",
        kind: "action",
        does: "Record the interruption with its cause and the point at which delivery stopped",
        writes: [{ field: "occurrence_log", mode: "append" }],
        next: "c.interruption",
        idempotencyKey: "booking_id + a.interrupt",
        attemptBudget: {
          "key": "service_attendance.interrupt_budget",
          "rule": "This loop runs against a budget fixed when the instance opened; when it is spent the instance takes its timeout path (GLB-24).",
          "required": true
        },
      },
      {
        id: "c.interruption",
        kind: "condition",
        asks: "What does the interruption allow?",
        branches: [
          {
            label: "Resuming now",
            when: "the cause cleared and the remaining scope fits inside the occurrence",
            to: "a.resume",
          },
          {
            label: "Another appointment",
            when: "the remaining scope needs a separate scheduled occurrence",
            to: "h.reschedule",
          },
          {
            label: "A remedy",
            when: "the shortfall needs resolving rather than repeating",
            to: "x.remainder-owed",
          },
        ],
      },
      {
        id: "a.resume",
        kind: "action",
        does: "Resume the same occurrence and continue tracking delivered scope. The wait's timeout is the scheduled duration and does not extend, so an occurrence that keeps stopping reaches its limit rather than running indefinitely",
        writes: [{ field: "occurrence_log", mode: "append" }],
        next: "w.service",
        idempotencyKey: "booking_id + a.resume",
      },
      {
        id: "h.reschedule",
        kind: "handoff",
        to: "SCH-175",
        on: "remaining scope needing a further scheduled occurrence",
        carries: [
          "what was delivered in this occurrence and what the next one has to cover",
          "the explicit fact that this occurrence is not a no-show and not a cancellation",
        ],
      },
      {
        id: "a.could-not",
        kind: "action",
        does: "Record that attendance happened and the service did not. This is a different fact from a no-show and from a cancellation - the customer did everything asked of them and left with nothing, which is the outcome most likely to be recorded wrongly and least likely to be forgotten by them",
        writes: [{ field: "occurrence_log", mode: "append" }],
        next: "c.cause",
        idempotencyKey: "booking_id + a.could-not",
      },
      {
        id: "c.cause",
        kind: "condition",
        asks: "Why could it not proceed?",
        branches: [
          {
            label: "The provider or resource side",
            when: "the provider, equipment, location or capacity failed at the point of delivery",
            to: "h.provider",
          },
          {
            label: "Something the customer had to bring",
            when: "a required document, condition or preparation the customer owns was absent",
            to: "h.rebook",
          },
        ],
      },
      {
        id: "h.provider",
        kind: "handoff",
        to: "SCH-180",
        on: "a service that could not proceed for provider-side reasons after the customer arrived",
        carries: [
          "the attendance record, which stands, and what failed on our side",
          "the explicit instruction that the customer is never classified as a no-show for this",
        ],
      },
      {
        id: "h.rebook",
        kind: "handoff",
        to: "SCH-175",
        on: "a service that could not proceed because a customer-side requirement was absent",
        carries: [
          "the attendance record and the requirement that was missing",
          "the explicit fact that they attended, which is what separates this from a no-show",
        ],
      },
    ],
    guardrails: [
      "Check-in is not service completed.",
      "Attendance is not a successful outcome.",
      "Partial service is never represented as full completion.",
    ],
    reusableRule:
      "Attendance establishes that the scheduled interaction occurred; completion depends on the actual service obligation being delivered.",
  },

  /* ------------------------------------------------------------ SCH-179 */
  {
    id: "SCH-179",
    slug: "no-show",
    category: "scheduling",
    goal: "escalation-exception",
    channels: [],
    name: "No-show or missed appointment → validate → rebook, close or consequence",
    shortName: "No-Show Validation",
    purpose:
      "Establish that one confirmed booking did not happen because the customer did not attend, having ruled out every other explanation.",
    entity: {
      scope: "the single reservation occurrence that did not take place",
      note: "One occurrence. Nothing here says anything about the customer's engagement, their history or their relationship - it is a fact about one appointment.",
      instanceKey: [
        "booking_id"
      ],
      concurrency: "one-active-per-key"
    },
    distinctFrom: [
      {
        journey: "RET-22",
        because:
          "RET-22 reads a pattern of expected usage not happening across a relationship. This is the non-occurrence of one specific confirmed booking at one specific time, and it is established by exclusion rather than by observing a trend.",
      },
    ],
    objective: "Establish that one confirmed booking did not happen because the customer did not attend, having ruled out every other explanation.",
    eligibility: [
      "a confirmed occurrence whose service and arrival windows have both closed with no commencement established",
      "no instance of this journey is already open for the the single reservation occurrence that did not take place",
      "hard gates (GLB-31) allow communication for this purpose"
    ],
    suppressions: [
      {
        "id": "s.g1",
        "label": "CANONICAL_RULE",
        "text": "A no-show is never inferred before the relevant service and arrival windows close."
      },
      {
        "id": "s.g2",
        "label": "CANONICAL_RULE",
        "text": "A no-show is not a cancellation."
      },
      {
        "id": "s.g3",
        "label": "CANONICAL_RULE",
        "text": "Fees and penalties are never invented."
      },
      {
        "id": "s.g4",
        "label": "CANONICAL_RULE",
        "text": "A late-arriving attendance event reconciles against the recorded no-show state."
      }
    ],
    implementation: {
      "attributes": {
        "required": [
          "booking_id",
          "occurrence_log",
          "suppressed_sends"
        ],
        "optional": []
      }
    },
    measurement: {
      "journeyOutcome": {
        "type": "exit-or-handoff",
        "refs": [
          "x.suppressed",
          "x.closed",
          "h.provider",
          "h.undefined",
          "h.attended",
          "h.rebook",
          "h.fee"
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
        "no-show validation",
        "missed appointment detection",
        "did not attend",
        "no-show record"
      ],
      "useCases": [
        "a no-show established only after every other explanation is ruled out",
        "a late arrival inside the grace the semantics allow"
      ]
    },
    entry: "t.passed",
    nodes: [
      {
        id: "t.passed",
        kind: "trigger",
        event: "service_window_passed_without_commencement",
        evidence: {
          requires: [
            "a confirmed occurrence whose service and arrival windows have both closed with no commencement established",
          ],
          insufficientAlone: [
            "the scheduled start time having passed, which does not close the arrival window and concludes nothing about someone who is running late",
          ],
          source: "authoritative",
        },
        next: "a.revalidate",
      },
      {
        id: "a.revalidate",
        kind: "action",
        does: "Re-read the reservation's latest events before concluding anything. The missed-appointment job runs on a clock and the booking may have moved under it minutes earlier - this check is the difference between a fact and an accusation",
        next: "c.superseded",
      },
      {
        id: "c.superseded",
        kind: "condition",
        asks: "Was the booking cancelled or rescheduled?",
        branches: [
          {
            label: "It was",
            when: "a cancellation or reschedule exists against this occurrence",
            to: "a.suppress",
          },
          {
            label: "It stands",
            when: "the booking was confirmed and unchanged through its window",
            to: "c.provider",
          },
        ],
      },
      {
        id: "a.suppress",
        kind: "action",
        does: "Suppress the no-show classification entirely. Recording one against someone who cancelled correctly, or who is booked for next Tuesday, attaches a penalty and a history to behaviour that was exactly right - and it is the kind of error people remember and repeat to others",
        writes: [
          { field: "occurrence_log", mode: "append" },
          { field: "suppressed_sends", mode: "append" },
        ],
        next: "x.suppressed",
        idempotencyKey: "booking_id + a.suppress",
      },
      {
        id: "x.suppressed",
        kind: "exit",
        state: "no-show suppressed; the booking was cancelled or moved and nothing is attributed",
        terminal: false,
        reEntry:
          "the rescheduled occurrence has its own window and is assessed on its own terms when it arrives",
        class: "suppression",
      },
      {
        id: "c.provider",
        kind: "condition",
        asks: "Could the provider or resource actually have delivered?",
        branches: [
          {
            label: "They could",
            when: "the provider and resource were available and able throughout the window",
            to: "c.semantics",
          },
          {
            label: "They could not",
            when: "the provider was unavailable, the resource failed or the location could not host it",
            to: "h.provider",
          },
        ],
      },
      {
        id: "h.provider",
        kind: "handoff",
        to: "SCH-180",
        on: "a missed occurrence the provider side could not have delivered",
        carries: [
          "the occurrence and what failed on our side",
          "the explicit instruction that this is a provider failure and not a customer no-show, which decides who bears the consequence",
        ],
      },
      {
        id: "c.semantics",
        kind: "condition",
        asks: "Do the booking's own semantics define what counts as failing to attend?",
        branches: [
          {
            label: "Defined",
            when: "a grace period, a late-arrival rule and any partial-attendance rule are stated",
            to: "c.attended",
          },
          {
            label: "Not defined",
            when: "nothing authoritative states what counts as a no-show for this service",
            to: "h.undefined",
          },
        ],
      },
      {
        id: "h.undefined",
        kind: "handoff",
        to: "DEC-181",
        on: "a missed occurrence with no defined attendance semantics",
        carries: [
          "the booking, the windows that closed and what is known about the customer's side",
          "the explicit fact that no grace period or attendance rule was invented, particularly where a fee would follow from it",
        ],
      },
      {
        id: "c.attended",
        kind: "condition",
        asks: "Did the customer fail to attend under those semantics?",
        branches: [
          {
            label: "They did not attend",
            when: "no arrival occurred inside the grace the semantics allow",
            to: "a.no-show",
          },
          {
            label: "They attended late, within the grace",
            when: "arrival happened inside the allowance the semantics define",
            to: "h.attended",
          },
        ],
      },
      {
        id: "h.attended",
        kind: "handoff",
        to: "SCH-178",
        on: "an arrival inside the grace period the semantics allow",
        carries: [
          "the arrival and how late it was, which may change the deliverable scope",
          "the explicit fact that this is attendance rather than a no-show",
        ],
      },
      {
        id: "a.no-show",
        kind: "action",
        does: "Record NO_SHOW with the semantics it was judged under and the window that closed. This is the non-occurrence of one confirmed booking and nothing more - it is not a statement about the customer's engagement, their loyalty or their relationship, and journeys reading it should not treat it as one",
        writes: [{ field: "occurrence_log", mode: "append" }],
        next: "c.next",
        idempotencyKey: "booking_id + a.no-show",
      },
      {
        id: "c.next",
        kind: "condition",
        asks: "What does policy define as the next action?",
        branches: [
          {
            label: "Rebooking is offered",
            when: "the service is one where missing it means booking again",
            to: "h.rebook",
          },
          {
            label: "A financial consequence applies",
            when: "the terms attach a fee or a forfeit to a missed appointment",
            to: "h.fee",
          },
          {
            label: "Closure",
            when: "policy defines no further action",
            to: "x.closed",
          },
        ],
      },
      {
        id: "h.rebook",
        kind: "handoff",
        to: "SCH-171",
        on: "a missed appointment policy allows to be rebooked",
        carries: [
          "the service and resource the original booking needed",
          "the explicit fact that a new booking is a new commitment and does not undo the missed one",
        ],
      },
      {
        id: "h.fee",
        kind: "handoff",
        to: "FIN-131",
        on: "a no-show the terms attach a charge to",
        carries: [
          "the term that creates the charge and the semantics the no-show was judged under",
          "the explicit fact that no fee was invented here, and that a late attendance event arriving afterwards has to reconcile against this",
        ],
      },
      {
        id: "x.closed",
        kind: "exit",
        state: "NO_SHOW recorded; no consequence beyond the record",
        terminal: false,
        reEntry:
          "an attendance event arriving after this reconciles against the recorded no-show rather than being ignored - a late system update is a reason to correct the record, not evidence that the record was right",
        class: "success",
      },
    ],
    guardrails: [
      "A no-show is never inferred before the relevant service and arrival windows close.",
      "A no-show is not a cancellation.",
      "Fees and penalties are never invented.",
      "A late-arriving attendance event reconciles against the recorded no-show state.",
    ],
    reusableRule:
      "A no-show should be recorded only after excluding cancellation, rescheduling and provider-side failure as explanations for the missed scheduled service.",
  },

  /* ------------------------------------------------------------ SCH-180 */
  {
    id: "SCH-180",
    slug: "provider-cancellation",
    category: "scheduling",
    goal: "recovery-retry",
    channels: ["email", "sms"],
    name: "Provider or resource cancellation → reallocate → reschedule, remedy or cancel",
    shortName: "Booking Reschedule",
    purpose:
      "Recover a commitment we cannot keep, without any of the cost landing on the person who was ready.",
    entity: {
      scope: "the affected reservations and the provider or resource failure behind them",
      note: "The scope is every booking the failure touches. A closed location is not one cancellation, and treating it as one leaves the rest to be discovered by the people who turn up.",
      instanceKey: [
        "booking_id",
        "provider_failure_id"
      ],
      concurrency: "one-active-per-key"
    },
    distinctFrom: [
      {
        journey: "FUL-145",
        because:
          "FUL-145 handles a generic fulfillment exception. This carries the scheduling-specific recovery: the same time with a different provider, a different time with the same commitment, and the rule that the customer is never recorded as the cause.",
      },
    ],
    objective: "Recover a commitment we cannot keep, without any of the cost landing on the person who was ready.",
    eligibility: [
      "a confirmed reservation that can no longer be fulfilled by its assigned provider or resource - unavailability, resource failure, location closure, withdrawn capacity or an operational incident",
      "no instance of this journey is already open for the the affected reservations and the provider or resource failure behind them",
      "hard gates (GLB-31) allow communication for this purpose"
    ],
    suppressions: [
      {
        "id": "s.g1",
        "label": "CANONICAL_RULE",
        "text": "A provider cancellation is not a customer cancellation."
      },
      {
        "id": "s.g2",
        "label": "CANONICAL_RULE",
        "text": "An affected customer is never classified as a no-show."
      },
      {
        "id": "s.g3",
        "label": "CANONICAL_RULE",
        "text": "A replacement must satisfy the service's actual requirements rather than merely being available."
      },
      {
        "id": "s.g4",
        "label": "CANONICAL_RULE",
        "text": "Financial and remedy consequences remain separate lifecycle decisions."
      }
    ],
    contact: {
      "defaultPriority": "service",
      "pressureClass": "service",
      "localCap": {
        "value": {
          "key": "provider_cancellation.touches",
          "rule": "Every touch runs against a budget fixed when the instance opened; the budget is the plan's own length, and no touch is repeated because nothing could tell whether it arrived.",
          "default": {
            "value": 2,
            "confidence": "high",
            "basis": "corpus-rule",
            "applicableWhen": "GLB-24; the graph's own touch count"
          },
          "required": false
        },
        "appliesTo": "all"
      },
      "cooldown": {
        "key": "provider_cancellation.cooldown",
        "rule": "This journey is per the affected reservations and the provider or resource failure behind them; a later instance concerns a different the affected reservations and the provider or resource failure behind them and no cooldown applies between them.",
        "default": {
          "value": "none",
          "confidence": "high",
          "basis": "corpus-rule",
          "applicableWhen": "the entity note: one instance per entity"
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
        },
        {
          "role": "urgent",
          "channels": [
            "sms"
          ],
          "when": "an asserted time bound lies inside the urgent horizon and permission for messages on this channel is recorded"
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
          "stage": "inform",
          "action": "a.inform",
          "prerequisites": [
            "c.replacement",
            "c.notify"
          ],
          "purpose": "Tell them what changed, distinguished from a reschedule because the time did not move.",
          "channelRoles": [
            "persistent",
            "urgent"
          ],
          "mandatory": false,
          "label": "CANONICAL_RULE"
        },
        {
          "id": "t2",
          "stage": "notify-provider-cancel",
          "action": "a.notify-provider-cancel",
          "prerequisites": [
            "c.replacement",
            "c.reschedule"
          ],
          "purpose": "Tell the customer the confirmed commitment can no longer be kept, that the failure is ours and not theirs, and that they are not recorded as having cancelled or missed it.",
          "channelRoles": [
            "persistent",
            "urgent"
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
          "booking_id",
          "provider_failure_id",
          "affected_reservations",
          "replacement_candidates",
          "reschedule_rules",
          "reservation_log"
        ],
        "optional": []
      }
    },
    measurement: {
      "journeyOutcome": {
        "type": "exit-or-handoff",
        "refs": [
          "x.reallocated",
          "x.cancelled-provider",
          "h.reschedule",
          "x.service-obligation-owed",
          "h.financial"
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
        "provider cancellation",
        "appointment cancelled by provider",
        "reallocation",
        "we cannot keep your booking",
        "provider-side reschedule"
      ],
      "useCases": [
        "a commitment we cannot keep recovered without the cost landing on the person who was ready",
        "an equivalent replacement at the same time, told only where it changes something for them"
      ]
    },
    entry: "t.cannot",
    nodes: [
      {
        id: "t.cannot",
        kind: "trigger",
        event: "provider_or_resource_cannot_fulfil",
        evidence: {
          requires: [
            "a confirmed reservation that can no longer be fulfilled by its assigned provider or resource - unavailability, resource failure, location closure, withdrawn capacity or an operational incident",
          ],
          insufficientAlone: [
            "a customer asking to move the booking, which is their reschedule and not our failure",
            "a provider's tentative doubt that has not become an inability",
          ],
          source: "authoritative",
        },
        next: "a.scope",
      },
      {
        id: "a.scope",
        kind: "action",
        does: "Identify every reservation the failure affects, and its scope. A closed location is not one cancellation - treating it as one produces a correct outcome for the booking that raised the alarm and silence for the forty behind it, each of whom finds out at the door",
        writes: [{ field: "occurrence_log", mode: "append" }],
        next: "a.protect",
        idempotencyKey: "booking_id + a.scope",
      },
      {
        id: "a.protect",
        kind: "action",
        does: "Record that the failure is provider-side. Whatever follows, the customer is not marked as having cancelled and is never classified as a no-show - they were available and the service was not, and the record has to say so before anything else touches this booking",
        writes: [{ field: "occurrence_log", mode: "append" }],
        next: "c.replacement",
        idempotencyKey: "booking_id + a.protect",
      },
      {
        id: "c.replacement",
        kind: "condition",
        asks: "Is an equivalent replacement available for the same time?",
        branches: [
          {
            label: "Available and permitted",
            when: "another provider or resource can deliver the booked service at the booked time, and the rules allow substituting",
            to: "a.reallocate",
          },
          {
            label: "Not at this time",
            when: "nothing equivalent is free, or substitution is not permitted for this service",
            to: "c.reschedule",
          },
        ],
      },
      {
        id: "a.reallocate",
        kind: "action",
        does: "Reallocate to the replacement, preserving the commitment and the time. The replacement has to actually satisfy the service's requirements - a different provider who cannot perform the booked service is not a replacement, and substituting one moves the failure from before the appointment to during it",
        writes: [{ field: "reservation_log", mode: "append" }],
        next: "a.release-old",
        idempotencyKey: "booking_id + a.reallocate",
      },
      {
        id: "a.release-old",
        kind: "action",
        does: "Release the obsolete allocation, idempotently. The original resource returns to availability once, whatever number of times the release is attempted",
        writes: [{ field: "reservation_log", mode: "append" }],
        next: "c.notify",
        idempotencyKey: "booking_id + a.release-old",
      },
      {
        id: "c.notify",
        kind: "condition",
        asks: "Does the reallocation change anything the customer needs to know?",
        branches: [
          {
            label: "It does",
            when: "the provider, the location or the preparation is different",
            to: "a.inform",
          },
          {
            label: "It does not",
            when: "nothing visible to the customer changed",
            to: "x.reallocated",
          },
        ],
      },
      {
        id: "a.inform",
        kind: "action",
        does: "Tell them what changed, distinguished from a reschedule because the time did not move. Someone who reads 'your appointment has changed' and assumes the time moved will miss an appointment we successfully saved",
        writes: [{ field: "occurrence_log", mode: "append" }],
        next: "x.reallocated",
        execution: "communication",
        idempotencyKey: "booking_id + a.inform",
      },
      {
        id: "x.reallocated",
        kind: "exit",
        state: "reallocated; the time and the commitment both stand",
        terminal: false,
        reEntry:
          "the booking continues to its scheduled occurrence and revalidates there like any other",
        class: "success",
      },
      {
        id: "c.reschedule",
        kind: "condition",
        asks: "Do the applicable decision rules permit rescheduling this booking?",
        branches: [
          {
            label: "Permitted",
            when: "the service can be delivered at another time and the rules allow moving it",
            to: "h.reschedule",
          },
          {
            label: "Not permitted",
            when: "the service was time-specific, or the rules do not allow it to move",
            to: "a.cancel",
          },
        ],
      },
      {
        id: "h.reschedule",
        kind: "handoff",
        to: "SCH-175",
        on: "a provider-side failure that can be recovered at another time",
        carries: [
          "the original commitment and the requirements a replacement slot has to satisfy",
          "the explicit fact that this move originates on our side, which changes what the customer may be offered and what they may be charged",
        ],
      },
      {
        id: "a.cancel",
        kind: "action",
        does: "Cancel the affected reservation, recorded as provider-side. Provider cancellation and customer cancellation are different terminal states with different consequences, and collapsing them charges a cancellation fee to someone whose appointment we could not keep",
        writes: [{ field: "reservation_log", mode: "append" }],
        next: "a.release-cancel",
        idempotencyKey: "booking_id + a.cancel",
      },
      {
        id: "a.release-cancel",
        kind: "action",
        does: "Release the allocation and stop the obsolete preparation, reminders and check-in actions. A reminder for an appointment we cancelled brings the customer in for a service that has no provider waiting",
        writes: [
          { field: "reservation_log", mode: "append" },
          { field: "suppressed_sends", mode: "append" },
        ],
        next: "a.notify-provider-cancel",
        idempotencyKey: "booking_id + a.release-cancel",
      },
      {
        id: "a.notify-provider-cancel",
        kind: "action",
        does: "Tell the customer the confirmed commitment can no longer be kept, that the failure is ours and not theirs, and that they are not recorded as having cancelled or missed it. Sent before any remedy or refund is worked out - waiting for the consequence means the person finds out their booking is gone from a message about money",
        execution: "communication",
        next: "c.remedy",
        idempotencyKey: "booking_id + a.notify-provider-cancel",
      },
      {
        id: "c.remedy",
        kind: "condition",
        asks: "What does the failure leave to answer for?",
        branches: [
          {
            label: "An unresolved service obligation",
            when: "the customer still needs the service and it has not been delivered",
            to: "x.service-obligation-owed",
          },
          {
            label: "Money to return",
            when: "the booking was paid for or a fee was taken",
            to: "h.financial",
          },
          {
            label: "Neither",
            when: "nothing was owed and nothing was paid",
            to: "x.cancelled-provider",
          },
        ],
      },
      {
        id: "x.service-obligation-owed",
        kind: "exit",
        state: "a service obligation is left unresolved by a provider-side failure; the obligation as it stands and the fact that the customer did nothing wrong are recorded, and the impact of the failure is a separate question from the obligation, but no remedy engine in this journey resolves either",
        terminal: false,
        reEntry: "the obligation being resolved is recorded against this failure's history",
        class: "no-action",
      },
      {
        id: "h.financial",
        kind: "handoff",
        to: "FIN-137",
        on: "a provider-cancelled booking that was paid for",
        carries: [
          "what was paid and the fact that the cancellation was ours",
          "the explicit fact that no cancellation fee applies to a booking the provider could not keep",
          "a fresh refund_request_id, minted at this handoff and deterministically derived from provider_failure_id",
        ],
        contract: { requiredFields: ["refund_request_id"] },
      },
      {
        id: "x.cancelled-provider",
        kind: "exit",
        state: "cancelled on the provider side; recorded as ours, with nothing attributed to the customer",
        terminal: false,
        reEntry:
          "a new booking is a new commitment. This cancellation stays in the record as a provider failure, which is what any later question about the customer's booking history depends on",
        class: "failure",
      },
    ],
    guardrails: [
      "A provider cancellation is not a customer cancellation.",
      "An affected customer is never classified as a no-show.",
      "A replacement must satisfy the service's actual requirements rather than merely being available.",
      "Financial and remedy consequences remain separate lifecycle decisions.",
    ],
    reusableRule:
      "Provider-side inability should preserve the customer's underlying service obligation and attempt recovery before treating the reservation as simply cancelled.",
  },
  {
    id: "SCH-266",
    slug: "appointment-readiness-reminder",
    category: "scheduling",
    goal: "readiness-revalidation",
    channels: ["push", "email", "sms"],
    name: "Appointment approaching → prerequisites and revalidation → ready, reminded or at risk",
    shortName: "Appointment Reminder",
    purpose:
      "Get the customer's side of a confirmed commitment done before the commitment arrives, and send the reminder from what the booking is at that moment rather than from what it was when it was made.",
    entity: {
      scope: "the confirmed booking occurrence plus the prerequisites its customer owes against it",
      note: "One occurrence, one instance. Each occurrence of a recurring commitment revalidates and reminds on its own.",
      instanceKey: [
        "booking_id",
        "occurrence_id"
      ],
      concurrency: "one-active-per-key",
      supersession: {
        "id": "s.supersession",
        "label": "CANONICAL_RULE",
        "text": "A rescheduled occurrence is the same instance re-timed from the new scheduled time. A cancellation or a material change supersedes it; the replacement booking runs its own readiness from its own confirmation."
      }
    },
    distinctFrom: [
      {
        journey: "SCH-174",
        because:
          "SCH-174 prepares the conditions and records a reminder having been sent as somebody else's fact. This journey is that somebody, and it never moves the confirmed time.",
      },
      {
        journey: "SCH-177",
        because:
          "SCH-177 revalidates at the pre-start point in order to start the service. This revalidates at the same point in order to decide whether anything should be sent at all.",
      },
      {
        journey: "SCH-303",
        because:
          "SCH-303 is about whether a conditional reservation survives at all. This is about getting the customer's own side of a commitment done; where both apply, SCH-303 holds the booking and this is suppressed until it does not.",
      },
    ],
    objective: "Get the customer's side of a confirmed commitment done before it arrives, and remind them from what the booking is at the moment of sending.",
    eligibility: [
      "the booking is confirmed in the system of record and its scheduled time is in the future",
      "the customer is contactable for service messages about this booking",
      "no reminder has been sent for this occurrence",
      "hard gates (GLB-31) permit service communication to this person"
    ],
    suppressions: [
      {
        "id": "s.changed",
        "label": "CANONICAL_RULE",
        "text": "Exit on cancellation or material change. A reminder is never built from a stored copy of the booking: every touch re-reads authoritative state first, which is how somebody who cancelled is not told to turn up."
      },
      {
        "id": "s.once",
        "label": "CANONICAL_RULE",
        "text": "One reminder per occurrence. A second reminder sent because nothing could tell whether the first arrived is what teaches people to stop reading them."
      },
      {
        "id": "s.too-close",
        "label": "CANONICAL_RULE",
        "text": "Where the confirmation already falls inside the pre-start window, no prerequisite prompt is sent; the journey goes straight to revalidation and the reminder."
      },
      {
        "id": "s.dedup",
        "label": "CANONICAL_RULE",
        "text": "Deduplicated by booking and occurrence against any reschedule notice (SCH-180) about the same booking."
      },
      {
        "id": "s.hard-gates",
        "label": "CANONICAL_RULE",
        "text": "Hard gates (GLB-31) apply. The service pressure class deduplicates against other service messages about this booking; it does not ration a reminder the person is owed."
      }
    ],
    contact: {
      "defaultPriority": "service",
      "pressureClass": "service",
      "localCap": {
        "value": {
          "key": "scheduling.reminder_touches",
          "rule": "A prerequisite prompt and one reminder per occurrence. The at-risk notice is an obligation to the person and sits outside the cap.",
          "default": {
            "value": 2,
            "confidence": "medium",
            "basis": "corpus-rule",
            "applicableWhen": "GLB-24 and this journey's own guardrail: one reminder per occurrence"
          },
          "required": false
        },
        "appliesTo": "non-mandatory"
      },
      "cooldown": {
        "key": "scheduling.reminder_cooldown",
        "rule": "Per occurrence. The next occurrence of a recurring commitment is its own instance and no cooldown applies between occurrences.",
        "default": {
          "value": "none",
          "confidence": "high",
          "basis": "corpus-rule",
          "applicableWhen": "the entity note: each further occurrence of a recurring commitment is its own instance"
        },
        "required": false
      },
      "competition": {
        "exclusionGroup": "booking-lifecycle",
        "scope": "reservation",
        "precedence": "lowest in the booking-lifecycle group: below the reservation payment reminder (SCH-303), because a reservation that may be released outranks getting its holder ready for it",
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
          "when": "naming an outstanding prerequisite or the final gap left after the last reminder - something to read and act on"
        },
        {
          "role": "low-friction",
          "channels": [
            "push"
          ],
          "when": "the appointment-approaching notice: the time, place and joining route, sent once prerequisites are known"
        },
        {
          "role": "urgent",
          "channels": [
            "sms"
          ],
          "when": "the final reminder, sent a fixed span before the appointment"
        }
      ],
      "fallback": "none",
      "label": "RECOMMENDED_DEFAULT"
    },
    orchestration: {
      "strategy": "deadline-countdown",
      "touches": [
        {
          "id": "t1",
          "stage": "prerequisite-prompt",
          "action": "a.email-missing",
          "prerequisites": [
            "c.prereq1"
          ],
          "purpose": "The outstanding prerequisite and how to complete it, sent only where one is still missing.",
          "channelRoles": [
            "persistent"
          ],
          "destination": {
            "target": "booking-prerequisites",
            "boundTo": "booking_id"
          },
          "mandatory": false,
          "label": "CANONICAL_RULE"
        },
        {
          "id": "t2",
          "stage": "approaching-notice",
          "action": "a.push-approaching",
          "after": "t1",
          "prerequisites": [
            "c.prereq1"
          ],
          "purpose": "The appointment is approaching: the date, time, location or joining route.",
          "channelRoles": [
            "low-friction"
          ],
          "destination": {
            "target": "booking-detail",
            "boundTo": "booking_id"
          },
          "mandatory": true,
          "label": "CANONICAL_RULE"
        },
        {
          "id": "t3",
          "stage": "final-reminder",
          "action": "a.sms-final",
          "gatedBy": "w.24h",
          "prerequisites": [
            "c.still-active"
          ],
          "purpose": "A final reminder sent a fixed span before the appointment, sent only while it is still active.",
          "channelRoles": [
            "urgent"
          ],
          "destination": {
            "target": "booking-detail",
            "boundTo": "booking_id"
          },
          "mandatory": true,
          "label": "CANONICAL_RULE"
        },
        {
          "id": "t4",
          "stage": "final-gap-notice",
          "action": "a.email-final",
          "after": "t3",
          "prerequisites": [
            "c.ready"
          ],
          "purpose": "The one thing still missing and the last point at which it can still be done, sent only where preparation is not yet complete.",
          "channelRoles": [
            "persistent"
          ],
          "destination": {
            "target": "booking-prerequisites",
            "boundTo": "booking_id"
          },
          "mandatory": false,
          "label": "CANONICAL_RULE"
        }
      ],
      "noAction": [
        "s.changed",
        "s.once",
        "s.too-close",
        "s.dedup",
        "s.hard-gates"
      ]
    },
    implementation: {
      "attributes": {
        "required": [
          "booking_id",
          "occurrence_id",
          "person_id",
          "scheduled_at",
          "timezone",
          "location_or_joining_route",
          "prerequisites",
          "provider_id"
        ],
        "optional": [
          "service_type",
          "travel_required",
          "push_token"
        ]
      }
    },
    measurement: {
      "journeyOutcome": {
        "type": "exit",
        "refs": [
          "x.ready",
          "x.not-ready",
          "x.superseded"
        ]
      },
      "businessOutcome": {
        "event": "prerequisites_completed",
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
        "prerequisites_completed"
      ],
      "guardrails": [
        "complaint",
        "reminder_sent_for_cancelled_booking",
        "duplicate_reminder_per_occurrence"
      ],
      "operational": [
        "prompt_sent_rate",
        "not_ready_rate",
        "no_action_rate_by_reason",
        "channel_role_used",
        "time_between_reminder_and_start"
      ]
    },
    discovery: {
      "aliases": [
        "appointment reminder",
        "booking reminder",
        "pre-appointment preparation",
        "reservation reminder",
        "event reminder"
      ],
      "useCases": [
        "a confirmed appointment with forms, documents or payments the customer must complete first",
        "a class, delivery slot or reservation with a joining route to restate",
        "a recurring commitment whose every occurrence needs its own reminder"
      ]
    },
    entry: "t.booking",
    nodes: [
      {
        id: "t.booking",
        kind: "trigger",
        event: "confirmed_booking_with_customer_owed_prerequisites",
        evidence: {
          requires: [
            "a confirmed booking with a scheduled time",
            "at least one prerequisite recorded as outstanding and owned by the customer",
          ],
          insufficientAlone: [
            "a request that has not been confirmed",
            "a prerequisite owned by the provider rather than by the customer",
          ],
          source: "authoritative",
        },
        next: "c.prereq1",
      },
      {
        id: "c.prereq1",
        kind: "condition",
        asks: "Are the prerequisites complete?",
        branches: [
          {
            label: "No",
            when: "at least one prerequisite the customer owes is still outstanding",
            to: "a.email-missing",
          },
          {
            label: "Yes",
            when: "every prerequisite the customer owed is recorded satisfied",
            to: "a.push-approaching",
          },
        ],
      },
      {
        id: "a.email-missing",
        kind: "action",
        does: "Name the outstanding prerequisite, whose it is and how to complete it. Somebody with three things to do has one problem, and splitting it into three makes it look like three systems that do not talk",
        next: "a.push-approaching",
        execution: "communication",
        idempotencyKey: "booking_id + occurrence_id + touch id",
      },
      {
        id: "a.push-approaching",
        kind: "action",
        does: "Say the appointment is approaching, with the date, time, location or joining route",
        next: "w.24h",
        execution: "communication",
        idempotencyKey: "booking_id + occurrence_id + touch id",
      },
      {
        id: "w.24h",
        kind: "wait",
        until: [
          "booking_materially_changed"
        ],
        onEvent: "c.still-active",
        timeout: {
          "after": {
            "key": "scheduling.pre_start_window",
            "rule": "The final reminder is sent a fixed span before the appointment, against the booking as it is at that moment.",
            "class": "reminder-before-attribute",
            "default": {
              "value": "24 hours",
              "confidence": "high",
              "basis": "corpus-rule",
              "applicableWhen": "GLB-24; the cascade's own pace before the final reminder"
            },
            "required": false
          },
          "reason": "the final reminder exists to arrive before the appointment; after it there is nothing left to remind anybody about",
          "relativeTo": "attribute",
          "attribute": "scheduled_at"
        },
        onTimeout: "c.still-active",
        windowExtendsOnEngagement: false,
        recheck: "the booking re-read from authoritative state before the final reminder is built",
      },
      {
        id: "c.still-active",
        kind: "condition",
        asks: "Is the appointment still active?",
        branches: [
          {
            label: "No",
            when: "current state no longer matches the booking this reminder was scheduled against - cancelled, moved or superseded",
            to: "x.superseded",
          },
          {
            label: "Yes",
            when: "the booking is confirmed, at the time recorded, and deliverable",
            to: "a.sms-final",
          },
        ],
      },
      {
        id: "a.sms-final",
        kind: "action",
        does: "Send the final reminder: the time, the place or joining route, and anything still outstanding",
        next: "c.ready",
        execution: "communication",
        idempotencyKey: "booking_id + occurrence_id + touch id",
      },
      {
        id: "c.ready",
        kind: "condition",
        asks: "Is preparation complete?",
        branches: [
          {
            label: "Yes",
            when: "every prerequisite the customer owed is recorded satisfied",
            observes: "prerequisites_completed",
            to: "x.ready",
          },
          {
            label: "No",
            when: "at least one prerequisite the customer owes is still outstanding after the final reminder",
            to: "a.email-final",
          },
        ],
      },
      {
        id: "a.email-final",
        kind: "action",
        does: "Name the one thing still missing and the last point at which it can still be done. The confirmed time is not moved here - a prerequisite failing is a reason to warn somebody, not a reason to rewrite a commitment they have planned around",
        next: "x.not-ready",
        execution: "communication",
        idempotencyKey: "booking_id + occurrence_id + touch id",
      },
      {
        id: "x.ready",
        kind: "exit",
        state: "ready; preparation complete before the appointment",
        terminal: false,
        reEntry: "the next occurrence of a recurring commitment revalidates and reminds on its own",
        class: "success",
      },
      {
        id: "x.not-ready",
        kind: "exit",
        state: "not ready; a prerequisite is still outstanding after the final reminder",
        terminal: false,
        reEntry: "the next occurrence of a recurring commitment revalidates and reminds on its own; this occurrence is not retried",
        class: "failure",
      },
      {
        id: "x.superseded",
        kind: "exit",
        state: "superseded; the booking changed before the final reminder was due",
        terminal: false,
        reEntry: "the booking that replaced it runs its own readiness from its own confirmation",
        class: "invalid-state",
      },
    ],
    guardrails: [
      "Nothing is sent without re-reading the booking at send time. The scheduled job carries the version it was built against, and that version is a claim rather than a fact.",
      "A reminder having been sent is never recorded as preparation being complete.",
      "Interaction with a reminder is not attendance and is not a prerequisite satisfied.",
      "Preparation never moves the confirmed time. A missing prerequisite is named, not rescheduled around.",
      "The final reminder is re-read against the booking immediately before it sends, so a cancelled or moved appointment is never confirmed by mistake.",
    ],
    reusableRule:
      "A reminder is only as true as the moment it is built, so it is built at the moment it is sent.",
  },

  /* ------------------------------------------------------------ SCH-282 */
  {
    id: "SCH-282",
    slug: "availability-searched-no-booking",
    category: "scheduling",
    goal: "scheduling-commitment",
    channels: ["push", "email", "sms"],
    name: "Availability searched, no booking → exact slot, nearest window or waitlist",
    shortName: "Availability Search Abandonment",
    purpose:
      "Follow up an availability question that produced no booking with something that is genuinely bookable now, or with a waitlist place where nothing fits - because what was shown was never held and is probably already gone.",
    entity: {
      scope: "the availability question, the resource and window it asked about, and the absence of any reservation from it",
      note: "The question is not a claim on anything. A second question about a different window is its own instance and never inherits the first one's offer.",
      instanceKey: [
        "person_id",
        "availability_query_id"
      ],
      concurrency: "one-active-per-key"
    },
    distinctFrom: [
      {
        journey: "SCH-171",
        because:
          "SCH-171 answers the question at the moment it is asked and holds nothing. This journey starts only once that answer has produced no booking, and it re-evaluates from scratch rather than reusing what was shown.",
      },
      {
        journey: "SCH-172",
        because:
          "SCH-172 holds capacity for somebody who asked for it. Nothing here is held at any point, and the offer says so.",
      },
      {
        journey: "ACQ-289",
        because:
          "ACQ-289 acts once an unavailable product becomes purchasable again, with the wait on the item rather than on anything the person did. This follows a stated availability enquiry with restorable state the person opened themselves - a specific window they asked for, not a product return to stock.",
      },
    ],
    objective: "Follow up an availability question that produced no booking with something that is genuinely bookable now, or with a waitlist place where nothing fits - because what was shown was never held and is probably already gone.",
    eligibility: [
      "an availability query recorded for a named person against a specific resource and window",
      "no reservation or hold created by that person for that window since",
      "no instance of this journey is already open for the the availability question",
      "hard gates (GLB-31) allow communication for this purpose"
    ],
    suppressions: [
      {
        "id": "s.reevaluated",
        "label": "CANONICAL_RULE",
        "text": "Availability is re-evaluated before the offer is sent. What the query returned was never held and is not evidence of anything now."
      },
      {
        "id": "s.different-window",
        "label": "CANONICAL_RULE",
        "text": "A different window is labelled as a different window, never dressed up as the one that was asked for."
      },
      {
        "id": "s.waitlist-reserves-nothing",
        "label": "CANONICAL_RULE",
        "text": "A waitlist place is stated as reserving nothing, because somebody who believes they hold a place they do not hold plans around it."
      },
      {
        "id": "s.one-offer",
        "label": "CANONICAL_RULE",
        "text": "At most three touches per query, one per channel in sequence - push for the exact slot, then email for the nearest alternative, then SMS for the waitlist - and each only if the query is still unbooked after the one before it."
      },
      {
        "id": "s.bounded-delay",
        "label": "CANONICAL_RULE",
        "text": "The delay before the first touch is bounded and never extended by the person browsing again - a touch that arrives while somebody is still choosing competes with the thing they are choosing."
      },
      {
        "id": "s.contest",
        "label": "CANONICAL_RULE",
        "text": "A checkout recovery, a process recovery, a cart or selection recovery, an open complaint, an open payment recovery or a retention-outreach journey on the same person outranks this journey; its offer is deferred and re-evaluated against current state, not queued blindly (GLB-06). This journey in turn outranks predicted-need replenishment (RET-31), the back-in-stock alert (ACQ-289) and unresolved-interest recovery (ACQ-13), each of which is suppressed for a person this journey holds."
      },
      {
        "id": "s.sunset",
        "label": "CANONICAL_RULE",
        "text":
          "A standing sender-side marketing suppression stops this journey. CON-300 ends marketing contact for somebody who answered none of it, and records that decision as marketing_suppression against our own sending rather than as a withdrawal on the person's consent record - so a purpose-level permission check still reads yes and cannot see it. The suppression is a hard gate under GLB-31, held and released by CON-38, and it covers promotional and lifecycle communication alike: no instance of this journey opens against a suppressed person, and an open instance stands down rather than queueing behind it. Only permission given afresh releases it - not the passing of time, and not a purchase.",
      },
    ],
    contact: {
      "defaultPriority": "promotional",
      "pressureClass": "promotional",
      "localCap": {
        "value": {
          "key": "availability_searched.touches",
          "rule": "Every touch runs against a budget fixed when the instance opened; the budget is the cascade's own length across the three channels, and no touch is repeated because nothing could tell whether it arrived.",
          "default": {
            "value": 3,
            "confidence": "high",
            "basis": "corpus-rule",
            "applicableWhen": "GLB-24; the cascade's own length - the exact slot, the nearest alternative and the waitlist, in sequence"
          },
          "required": false
        },
        "appliesTo": "all"
      },
      "cooldown": {
        "key": "availability_searched.cooldown",
        "rule": "This journey is per the availability question; a later instance concerns a different the availability question and no cooldown applies between them.",
        "default": {
          "value": "none",
          "confidence": "high",
          "basis": "corpus-rule",
          "applicableWhen": "the entity note: one instance per entity"
        },
        "required": false
      },
      "competition": {
        "exclusionGroup": "commerce-recovery",
        "scope": "person",
        "precedence": "below checkout recovery (ACQ-287), the generic process pattern (ACQ-11), the held cart (ACQ-288) and the held selection (ACQ-12) for the same person; above predicted-need replenishment (RET-31), the back-in-stock alert (ACQ-289) and inferred-interest recovery (ACQ-13), because an availability enquiry for a stated window is a question the person actually asked, where a predicted need is computed from history and an inferred interest was never confirmed at all. Where a higher-precedence member holds the person this journey is suppressed for them rather than queued behind it.",
        "onLoss": "suppressed"
      }
    },
    channelStrategy: {
      "roles": [
        {
          "role": "low-friction",
          "channels": [
            "push"
          ],
          "when": "a slot in the exact range originally searched is available again"
        },
        {
          "role": "persistent",
          "channels": [
            "email"
          ],
          "when": "the nearest-alternative offer, which lists more than one slot and has to survive until the person can act on it"
        },
        {
          "role": "urgent",
          "channels": [
            "sms"
          ],
          "when": "the waitlist offer, the last and shortest of the three"
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
          "stage": "exact-slot",
          "action": "a.push-exact",
          "gatedBy": "w.settle",
          "prerequisites": [
            "c.exact-available"
          ],
          "purpose": "Say a slot in the exact range originally searched is available again, with a route back to booking.",
          "channelRoles": [
            "low-friction"
          ],
          "mandatory": false,
          "label": "CANONICAL_RULE",
          "destination": {
            "target": "exact-searched-window",
            "boundTo": "availability_query_id",
            "mustNotClaim": [
              "that the window is held"
            ]
          }
        },
        {
          "id": "t2",
          "stage": "alternative-offer",
          "action": "a.email-alternative",
          "after": "t1",
          "prerequisites": [
            "c.near-available"
          ],
          "purpose": "Offer the nearest bookable alternatives, labelled as different from the window that was asked for, and say they are not held.",
          "channelRoles": [
            "persistent"
          ],
          "mandatory": false,
          "label": "CANONICAL_RULE",
          "destination": {
            "target": "nearest-bookable-window",
            "boundTo": "availability_query_id",
            "mustNotClaim": [
              "that a window is held",
              "that it is the window asked for"
            ]
          }
        },
        {
          "id": "t3",
          "stage": "waitlist",
          "action": "a.waitlist",
          "after": "t2",
          "prerequisites": [
            "c.waitlist-check"
          ],
          "purpose": "Offer a waitlist place and state that it reserves nothing.",
          "channelRoles": [
            "urgent"
          ],
          "mandatory": false,
          "label": "CANONICAL_RULE",
          "destination": {
            "target": "waitlist-place",
            "boundTo": "availability_query_id",
            "mustNotClaim": [
              "that a place is reserved"
            ]
          }
        }
      ],
      "noAction": [
        "s.reevaluated",
        "s.different-window",
        "s.waitlist-reserves-nothing",
        "s.one-offer",
        "s.bounded-delay"
      ]
    },
    implementation: {
      "attributes": {
        "required": [
          "person_id",
          "availability_query_id",
          "resource_ref",
          "requested_window",
          "last_query_at",
          "permission_position"
        ],
        "optional": [
          "push_token",
          "phone_number"
        ]
      }
    },
    measurement: {
      "journeyOutcome": {
        "type": "exit",
        "refs": [
          "x.no-route",
          "x.booked",
          "x.waitlisted",
          "x.nothing",
          "x.waitlist-lapsed"
        ]
      },
      "businessOutcome": {
        "event": "booking_confirmed",
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
        "availability search abandonment",
        "searched but did not book",
        "no availability follow-up",
        "waitlist offer",
        "nearest slot offer"
      ],
      "useCases": [
        "an availability question that produced no booking, answered with something bookable now",
        "a waitlist place stated as reserving nothing"
      ]
    },
    entry: "t.queried",
    nodes: [
      {
        id: "t.queried",
        kind: "trigger",
        event: "availability_query_closed_without_reservation",
        evidence: {
          requires: [
            "an availability query recorded for a named person against a specific resource and window",
            "no reservation or hold created by that person for that window since",
          ],
          insufficientAlone: [
            "a query by somebody who already holds a booking for that window",
            "a browse with no resource or window attached to it",
          ],
          source: "behavioral",
        },
        next: "c.permitted",
      },
      {
        id: "c.permitted",
        kind: "condition",
        asks: "Can this query be attributed to a person we may contact?",
        branches: [
          {
            label: "Identified and permitted",
            when: "the person is known and at least one contact point is valid and permitted for an offer of this kind",
            to: "w.settle",
          },
          {
            label: "Anonymous or not permitted",
            when: "the query cannot be attributed to a person we may contact for this purpose",
            to: "x.no-route",
          },
        ],
      },
      {
        id: "x.no-route",
        kind: "exit",
        state: "no offer made; the query cannot be attributed to a reachable person",
        terminal: false,
        reEntry: "a later query from an identified person qualifies normally",
        class: "no-action",
      },
      {
        id: "w.settle",
        kind: "wait",
        until: [
          "booking_confirmed",
          "availability_lost"
        ],
        onEvent: "c.settled",
        timeout: {
          "after": {
            "key": "availability_searched.settle",
            "rule": "The first touch waits long enough after the query that an unprompted booking has had its chance, and no longer than the question stays live.",
            "class": "recovery-window",
            "default": {
              "value": {
                "min": "1 hour",
                "max": "2 hours"
              },
              "confidence": "high",
              "basis": "corpus-rule",
              "applicableWhen": "GLB-24; the cascade's own pace before the first touch"
            },
            "required": false
          },
          "reason": "a touch that arrives while somebody is still choosing competes with the thing they are choosing, and usually wins nothing",
          "relativeTo": "trigger"
        },
        onTimeout: "c.settled",
        windowExtendsOnEngagement: false,
        recheck: "the the availability question re-read from the system of record before acting on the timeout",
      },
      {
        id: "c.settled",
        kind: "condition",
        asks: "Did they book in this time?",
        branches: [
          {
            label: "Booked unprompted",
            when: "the person reserved or held something for the window themselves",
            to: "x.booked",
          },
          {
            label: "Not yet",
            when: "no reservation or hold by this person is recorded for the window",
            to: "c.exact-available",
          },
        ],
      },
      {
        id: "x.booked",
        kind: "exit",
        state: "booked; no offer was needed",
        terminal: false,
        reEntry: "a later query with no booking behind it starts a new instance",
        class: "success",
      },
      {
        id: "c.exact-available",
        kind: "condition",
        asks: "Is a slot still available in the exact range originally searched?",
        branches: [
          {
            label: "Yes",
            when: "capacity exists in the exact window the query asked about, re-read from the system of record - nothing shown at query time was ever held",
            to: "a.push-exact",
          },
          {
            label: "No",
            when: "the exact window is gone",
            to: "c.near-available",
          },
        ],
      },
      {
        id: "a.push-exact",
        kind: "action",
        does: "Say by push that a slot in the exact time range originally searched is available again, with a direct route back to booking. Claim nothing about the window being held",
        next: "c.push-booked",
        execution: "communication",
        idempotencyKey: "person_id + availability_query_id + a.push-exact",
      },
      {
        id: "c.push-booked",
        kind: "condition",
        asks: "Did they book?",
        branches: [
          {
            label: "Yes",
            when: "an authoritative reservation or hold by this person is recorded for the window",
            to: "x.booked",
          },
          {
            label: "No",
            when: "no such record exists",
            to: "c.near-available",
          },
        ],
      },
      {
        id: "c.near-available",
        kind: "condition",
        asks: "Is there a nearest alternative time?",
        branches: [
          {
            label: "Yes",
            when: "capacity exists close enough to what was asked for that it answers the same need, re-read from the system of record",
            to: "a.email-alternative",
          },
          {
            label: "No",
            when: "no window answers the request",
            to: "c.waitlist-check",
          },
        ],
      },
      {
        id: "a.email-alternative",
        kind: "action",
        does: "Say by email that suitable alternative times exist: two or three alternative slots, labelled as different from the window that was asked for, with a route to book. Say plainly that nothing is held",
        next: "w.respond-email",
        execution: "communication",
        idempotencyKey: "person_id + availability_query_id + a.email-alternative",
      },
      {
        id: "w.respond-email",
        kind: "wait",
        until: [
          "booking_confirmed"
        ],
        onEvent: "x.booked",
        timeout: {
          "after": {
            "key": "availability_searched.respond",
            "rule": "The alternative offer is given a fixed window before the cascade re-reads availability and moves to the waitlist.",
            "class": "response-window",
            "default": {
              "value": "1 day",
              "confidence": "high",
              "basis": "corpus-rule",
              "applicableWhen": "GLB-24; the cascade's own pace before the final touch"
            },
            "required": false
          },
          "reason": "the alternative offer was true at one instant only, and the window closing is what makes a further touch honest rather than a repeat",
          "relativeTo": "previous-touch"
        },
        onTimeout: "c.waitlist-check",
        windowExtendsOnEngagement: false,
        recheck: "the the availability question re-read from the system of record before acting on the timeout",
      },
      {
        id: "c.waitlist-check",
        kind: "condition",
        asks: "Is a waitlist possible?",
        branches: [
          {
            label: "Yes",
            when: "the resource supports a waitlist",
            to: "a.waitlist",
          },
          {
            label: "No",
            when: "there is nothing to put the person on",
            to: "x.nothing",
          },
        ],
      },
      {
        id: "a.waitlist",
        kind: "action",
        does: "Say by SMS that a waitlist place is available, with a short, direct call to action, and state plainly that it reserves nothing. Somebody who believes they hold a place they do not hold will plan around it, and that is a worse outcome than being told there was nothing",
        next: "w.waitlist",
        execution: "communication",
        idempotencyKey: "person_id + availability_query_id + a.waitlist",
      },
      {
        id: "w.waitlist",
        kind: "wait",
        until: [
          "waitlist_place_taken"
        ],
        onEvent: "x.waitlisted",
        timeout: {
          "after": {
            "key": "availability_searched.waitlist",
            "rule": "The validity of the waitlist offer.",
            "class": "observation-window",
            "required": true
          },
          "reason": "an offered place nobody took is not a place held - leaving the offer open would put someone on a list they never agreed to be on",
          "relativeTo": "previous-touch"
        },
        onTimeout: "x.waitlist-lapsed",
        windowExtendsOnEngagement: false,
        recheck: "the the availability question re-read from the system of record before acting on the timeout",
      },
      {
        id: "x.waitlisted",
        kind: "exit",
        state: "waitlisted; nothing is reserved",
        terminal: false,
        reEntry: "capacity reaching the waitlist is that mechanism's business, not a new instance of this one",
        class: "success",
      },
      {
        id: "x.waitlist-lapsed",
        kind: "exit",
        state: "waitlist place offered and not taken",
        terminal: false,
        reEntry: "a new availability query is a new instance; this waitlist place is never re-offered",
        class: "timeout",
      },
      {
        id: "x.nothing",
        kind: "exit",
        state: "nothing to offer; no message sent",
        terminal: false,
        reEntry: "a later query for a window that does have capacity qualifies again",
        class: "no-action",
      },
    ],
    guardrails: [
      "Availability is re-read immediately before each touch. What the query returned was never held and is not evidence of anything now.",
      "A different window is labelled as a different window.",
      "A waitlist place is stated as reserving nothing.",
      "At most three touches per query, one per channel in sequence - push, then email, then SMS - and the cascade ends the moment the query is booked.",
      "The delay before the first touch is bounded and never extended by the person browsing again.",
    ],
    reusableRule:
      "An answer about availability holds nothing, so a cascade built on it re-reads availability immediately before each channel sends, advances only if the query is still unbooked, and ends the moment it is booked or the last channel has been tried.",
  },
  {
    "id": "SCH-303",
    "slug": "reservation-payment-reminder",
    "category": "scheduling",
    "goal": "scheduling-commitment",
    "channels": ["email", "sms", "whatsapp"],
    "name": "Reservation standing on a payment condition → eligibility checked → a rising reminder cascade → kept, released or routed to recovery",
    "shortName": "Reservation Payment Reminder",
    "purpose": "Keep a reservation that is standing only because a payment is still expected, by telling the holder what is outstanding and what the booking terms do about it - and by getting out of the way the moment the payment itself is what went wrong.",
    "objective": "Stop a reservation being released for a reason its holder never heard, and move the money question to payment recovery instead of answering it here.",
    "entity": {
      "scope": "one confirmed reservation whose continued standing depends on a payment its holder still owes",
      "note": "The reservation is the subject and the payment is a condition on it. One instance per reservation: a later reservation by the same person is its own instance, and a second attempt against the same obligation is an event inside the open instance rather than a new one.",
      "instanceKey": [
        "booking_id"
      ],
      "concurrency": "one-active-per-key",
      "supersession": {
        "id": "s.supersession",
        "label": "CANONICAL_RULE",
        "text": "A reservation that is cancelled, moved or re-priced supersedes this instance. The reservation that replaces it runs its own instance from its own terms rather than inheriting this one's clock."
      }
    },
    "eligibility": [
      "a confirmed reservation in the system of record whose continued standing is conditional on a payment its holder still owes",
      "an authoritative due point and release point read from the booking terms rather than inferred from when the reservation was made",
      "the obligation is outstanding rather than satisfied, waived, disputed or of unknown outcome",
      "no instance is already open for this reservation",
      "the holder is contactable for service messages about this reservation, and hard gates (GLB-31) allow it"
    ],
    "suppressions": [
      {
        "id": "s.settled",
        "label": "CANONICAL_RULE",
        "text": "Exit the moment the obligation behind the reservation is satisfied, waived or cancelled by any route. A notice about a payment already made is the failure this journey exists to prevent, and every touch is reached only through a condition that just re-read the obligation."
      },
      {
        "id": "s.superseded",
        "label": "CANONICAL_RULE",
        "text": "A reservation that is cancelled, moved or materially changed ends the instance. Nothing is built from a stored copy of the reservation: the booking and its terms are re-read before every touch, which is how somebody who already cancelled is not told their place is at risk."
      },
      {
        "id": "s.failure-not-ours",
        "label": "CANONICAL_RULE",
        "text": "An attempted payment that actually failed is not a reminder problem. Ownership of the money moves to payment recovery (FIN-134), and this journey stops talking about the payment rather than running alongside it."
      },
      {
        "id": "s.unknown-outcome",
        "label": "CANONICAL_RULE",
        "text": "An attempt whose outcome could not be established is reconciled first (GLB-20). Unknown is not outstanding, and nothing is sent or escalated on it."
      },
      {
        "id": "s.contest",
        "label": "CANONICAL_RULE",
        "text": "This journey holds the highest precedence in the booking-lifecycle group: whether the reservation survives is prior to preparing for it or turning up to it (GLB-06)."
      },
      {
        "id": "s.hard-gates",
        "label": "CANONICAL_RULE",
        "text": "Hard gates (GLB-31) apply. The service pressure class deduplicates this against other service messages about the same reservation; it does not ration a notice the holder is owed before the terms release their place."
      }
    ],
    "contact": {
      "defaultPriority": "service",
      "pressureClass": "service",
      "localCap": {
        "value": {
          "key": "reservation_payment.touches",
          "rule": "Discretionary touches run against a budget fixed when the instance opened. The second reminder and the notice that the reservation was released or confirmed are owed to the holder and sit outside the budget; the first reminder and the last, optional reminder are the touches here there is anything to ration.",
          "default": {
            "value": 2,
            "confidence": "medium",
            "basis": "corpus-rule",
            "applicableWhen": "GLB-24; the graph's own discretionary touch count - the outstanding notice and the last-chance reminder, the two touches this journey may choose not to send"
          },
          "required": false
        },
        "appliesTo": "non-mandatory"
      },
      "cooldown": {
        "key": "reservation_payment.cooldown",
        "rule": "Per reservation. A later reservation by the same person is its own instance and no cooldown applies between reservations.",
        "default": {
          "value": "none",
          "confidence": "high",
          "basis": "corpus-rule",
          "applicableWhen": "the entity note read with GLB-19: a repeated event against the same reservation changes nothing on its second arrival"
        },
        "required": false
      },
      "competition": {
        "exclusionGroup": "booking-lifecycle",
        "scope": "reservation",
        "precedence": "highest in the booking-lifecycle group: above the readiness reminder (SCH-266) - a reservation that may be released outranks anything about preparing for it",
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
          "when": "the notice carries terms and an amount the holder has to be able to return to - the opening reminder, or the closing notice once the outcome is known - or no faster route clears both permission and reachability"
        },
        {
          "role": "urgent",
          "channels": [
            "sms"
          ],
          "when": "the release point the terms assert is coming within reach and permission for service messages on this route is recorded - the notice this journey owes rather than rations"
        },
        {
          "role": "low-friction",
          "channels": [
            "whatsapp"
          ],
          "when": "the discretionary last reminder, sent on a route that still reaches someone who has not acted on either touch before it, with nothing more than a quick route back to the payment"
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
          "stage": "first-reminder",
          "action": "a.remind1",
          "prerequisites": [
            "c.standing",
            "c.sendable1"
          ],
          "purpose": "Shortly after the reservation was created: what is outstanding against it, the point by which the booking terms expect it, and what those terms do if it is not met.",
          "channelRoles": [
            "persistent"
          ],
          "destination": {
            "target": "reservation-payment",
            "boundTo": "booking_id",
            "mustNotClaim": [
              "that the reservation is already released",
              "that the amount or the terms have changed",
              "that the place is held beyond the release point the terms assert"
            ]
          },
          "mandatory": false,
          "label": "CANONICAL_RULE"
        },
        {
          "id": "t2",
          "stage": "second-reminder",
          "action": "a.remind2",
          "after": "t1",
          "gatedBy": "w.remind1",
          "prerequisites": [
            "c.still1",
            "c.sendable2"
          ],
          "purpose": "As the release point the terms assert comes within reach: a short, direct restatement of what is owed and by when, on a faster route than the first reminder.",
          "channelRoles": [
            "urgent"
          ],
          "destination": {
            "target": "reservation-payment",
            "boundTo": "booking_id",
            "mustNotClaim": [
              "that the place is held past the release point",
              "that the terms will be waived",
              "a consequence the booking terms do not actually carry"
            ]
          },
          "mandatory": true,
          "priority": "service-critical",
          "priorityReason": "without it the holder loses a reservation they planned around and never learned was at risk - this is a notice owed before the terms act, not a touch to ration",
          "label": "CANONICAL_RULE"
        },
        {
          "id": "t3",
          "stage": "last-chance-reminder",
          "action": "a.remind3",
          "after": "t2",
          "gatedBy": "w.remind2",
          "prerequisites": [
            "c.still2",
            "c.sendable3"
          ],
          "purpose": "Very shortly before the release point: the reservation detail, the release point itself, and a quick route back to the payment - short and direct, on a route that still reaches someone who has not acted on either earlier touch.",
          "channelRoles": [
            "low-friction"
          ],
          "destination": {
            "target": "reservation-payment",
            "boundTo": "booking_id",
            "mustNotClaim": [
              "that the place is held past the release point",
              "that the terms will be waived",
              "a consequence the booking terms do not actually carry"
            ]
          },
          "mandatory": false,
          "label": "RECOMMENDED_DEFAULT"
        },
        {
          "id": "t4",
          "stage": "release-notice",
          "action": "a.lapse",
          "after": "t3",
          "gatedBy": "w.release",
          "prerequisites": [],
          "purpose": "That the reservation was released and nothing is held, said plainly, with what the record now shows and an optional route to start a new reservation.",
          "channelRoles": [
            "persistent"
          ],
          "destination": {
            "target": "reservation-detail",
            "boundTo": "booking_id",
            "mustNotClaim": [
              "that the reservation can still be kept",
              "that the same time is still available"
            ]
          },
          "mandatory": true,
          "label": "CANONICAL_RULE"
        },
        {
          "id": "t5",
          "stage": "confirmation-notice",
          "action": "a.confirm",
          "after": "t3",
          "gatedBy": "w.release",
          "prerequisites": [
            "c.outcomeFinal"
          ],
          "purpose": "That the obligation is satisfied and the reservation is finalized, with the reservation summary and the payment now on record.",
          "channelRoles": [
            "persistent"
          ],
          "destination": {
            "target": "reservation-detail",
            "boundTo": "booking_id",
            "mustNotClaim": [
              "that anything further is owed on this reservation",
              "a consequence the booking terms do not actually carry"
            ]
          },
          "mandatory": true,
          "label": "CANONICAL_RULE"
        },
        {
          "id": "t6",
          "stage": "availability-lost-notice",
          "action": "a.suggest-alternative",
          "after": "t2",
          "gatedBy": "w.remind2",
          "prerequisites": [
            "c.still2"
          ],
          "purpose": "Where the held slot, date, room or service has itself gone in the meantime: say so plainly and point at an alternative date or option, without holding out the original as still available.",
          "channelRoles": [
            "persistent"
          ],
          "destination": {
            "target": "reservation-detail",
            "boundTo": "booking_id",
            "mustNotClaim": [
              "that the original reservation can still be honored",
              "that an alternative carries the same price or terms unless the terms actually say so"
            ]
          },
          "mandatory": false,
          "label": "RECOMMENDED_DEFAULT"
        }
      ],
      "noAction": [
        "s.settled",
        "s.superseded",
        "s.failure-not-ours",
        "s.unknown-outcome",
        "s.contest",
        "s.hard-gates"
      ]
    },
    "implementation": {
      "attributes": {
        "required": [
          "booking_id",
          "person_id",
          "obligation_id",
          "amount_outstanding",
          "payment_due_at",
          "release_at",
          "reservation_terms"
        ],
        "optional": [
          "scheduled_at",
          "has_active_session",
          "urgent_route_permitted",
          "phone_number"
        ]
      }
    },
    "measurement": {
      "journeyOutcome": {
        "type": "exit-or-handoff",
        "refs": [
          "x.kept",
          "x.released",
          "x.superseded",
          "x.no-action",
          "h.payment-failure"
        ]
      },
      "businessOutcome": {
        "event": "obligation_satisfied",
        "unit": "instance",
        "observationScope": {
          "type": "self"
        },
        "window": {
          "type": "until-exit"
        },
        "attribution": "entered-before-event",
        "comparison": "pre-post"
      },
      "secondary": [],
      "guardrails": [
        "complaint",
        "unsubscribe",
        "message_after_success",
        "notice_sent_for_released_reservation",
        "duplicate_notice_per_reservation"
      ],
      "operational": [
        "entry_volume",
        "exit_distribution",
        "no_action_rate_by_reason",
        "time_to_settlement",
        "handoff_to_payment_recovery_rate"
      ]
    },
    "discovery": {
      "aliases": [
        "reservation payment reminder",
        "deposit reminder",
        "balance due before arrival",
        "booking payment outstanding",
        "hold expiring without payment"
      ],
      "useCases": [
        "a reservation standing on a deposit that has not been paid",
        "a balance owed before a booked date, where the terms release the place if it is not met",
        "an attempted payment that then fails, where the money question belongs to payment recovery"
      ]
    },
    "distinctFrom": [
      {
        "journey": "FIN-134",
        "because": "FIN-134 starts from a payment that failed and works on the obligation until it is discharged. This starts from a reservation that is still standing and works on whether it survives; the moment an attempt actually fails, this journey hands the money over and says nothing more about it."
      },
      {
        "journey": "SCH-266",
        "because": "SCH-266 chases the prerequisites a customer owes so the service can be delivered. What is outstanding here is not a prerequisite for delivery - it is the condition on which the reservation itself continues to exist, and missing it costs the place rather than the preparation."
      },
    ],
    "entry": "t.outstanding",
    "nodes": [
      {
        "id": "t.outstanding",
        "kind": "trigger",
        "event": "reservation_payment_outstanding",
        "evidence": {
          "requires": [
            "a confirmed reservation whose continued standing the booking terms make conditional on a payment",
            "an authoritative obligation recorded against that reservation, still outstanding",
            "a due point and a release point read from the booking terms themselves"
          ],
          "insufficientAlone": [
            "a reservation that is already unconditional, where nothing outstanding can cost the place",
            "an obligation whose attempt outcome could not be established - unknown is reconciled before it is treated as outstanding",
            "a payment that has already been attempted and declined, which is payment recovery's subject rather than this one's",
            "a request that has not yet become a confirmed reservation"
          ],
          "source": "authoritative"
        },
        "next": "c.standing"
      },
      {
        "id": "c.standing",
        "kind": "condition",
        "asks": "Pulling the reservation's own details - the amount pending, the final payment point and the hold duration - is it still standing with the obligation still outstanding, or did the eligibility check already settle it?",
        "branches": [
          {
            "label": "Standing and outstanding",
            "when": "the reservation is confirmed at the time recorded, and the obligation behind it is neither satisfied, waived nor cancelled",
            "to": "c.sendable1"
          },
          {
            "label": "Payment already completed",
            "when": "the obligation is recorded satisfied, waived or cancelled by any route, including one this journey never sent a notice about",
            "observes": "obligation_satisfied",
            "to": "x.kept"
          },
          {
            "label": "Reservation not valid",
            "when": "the reservation was cancelled, moved or materially changed before anything was sent",
            "observes": "booking_materially_changed",
            "to": "x.superseded"
          }
        ]
      },
      {
        "id": "c.sendable1",
        "kind": "condition",
        "asks": "May the first reminder go out?",
        "branches": [
          {
            "label": "Sendable",
            "when": "the send path passes: permission for service communication about this reservation, a deliverable destination, the service pressure class, and no higher-precedence booking-lifecycle journey currently holding this reservation",
            "observes": "send path stages 1-8",
            "to": "a.remind1"
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
        "id": "a.remind1",
        "kind": "action",
        "does": "Say what is still outstanding against this reservation - the reservation detail, the pending amount, the point by which the booking terms expect it, and what those terms do to the reservation if it is not met, with a direct route to pay. The subject is the place they hold, not the money - somebody who reads this as a bill will file it, and somebody who reads it as their reservation being at risk will act on it",
        "execution": "communication",
        "idempotencyKey": "booking_id + a.remind1",
        "writes": [
          {
            "field": "reservation_log",
            "mode": "append"
          }
        ],
        "next": "w.remind1"
      },
      {
        "id": "w.remind1",
        "kind": "wait",
        "until": [
          "obligation_satisfied",
          "authoritative_payment_failure",
          "booking_materially_changed"
        ],
        "onEvent": "c.outcome1",
        "timeout": {
          "after": {
            "key": "reservation_payment.first_reminder_window",
            "rule": "A short fixed span after the first reminder, before the cascade re-reads the obligation and moves on to a faster channel.",
            "class": "response-window",
            "default": {
              "value": {
                "min": "12 hours",
                "max": "24 hours"
              },
              "confidence": "low",
              "basis": "example-only",
              "applicableWhen": "the first reminder already went out"
            },
            "required": false
          },
          "reason": "a first reminder that goes unanswered for its full span is worth escalating to a faster channel rather than repeating the same email",
          "relativeTo": "previous-touch"
        },
        "onTimeout": "c.still1",
        "recheck": "the reservation, its terms and the obligation behind it re-read from the systems that own them: still confirmed, same time, same amount, and whether anything has been paid, before the timeout is acted on",
        "windowExtendsOnEngagement": false
      },
      {
        "id": "c.outcome1",
        "kind": "condition",
        "asks": "What resolved the first wait?",
        "branches": [
          {
            "label": "Reservation kept",
            "when": "the obligation behind the reservation is recorded satisfied, waived or cancelled",
            "observes": "obligation_satisfied",
            "to": "x.kept"
          },
          {
            "label": "The payment itself failed",
            "when": "an attempt was made against this obligation and the payment system stated that it failed",
            "observes": "authoritative_payment_failure",
            "to": "h.payment-failure"
          },
          {
            "label": "Reservation withdrawn",
            "when": "the reservation was cancelled, moved or materially changed",
            "observes": "booking_materially_changed",
            "to": "x.superseded"
          }
        ]
      },
      {
        "id": "a.partial1",
        "kind": "action",
        "does": "Update the amount still outstanding to what the payment record now shows, and continue the reminder cascade for the remainder - stating the new amount and the same final payment point, not the original figure",
        "writes": [
          {
            "field": "amount_outstanding",
            "mode": "set"
          },
          {
            "field": "reservation_log",
            "mode": "append"
          }
        ],
        "idempotencyKey": "booking_id + a.partial1",
        "next": "c.sendable2"
      },
      {
        "id": "a.extend1",
        "kind": "action",
        "does": "Record the granted extension against this reservation's own due point and release point, and continue the cascade against the new dates rather than the original ones",
        "writes": [
          {
            "field": "payment_due_at",
            "mode": "set"
          },
          {
            "field": "release_at",
            "mode": "set"
          },
          {
            "field": "reservation_log",
            "mode": "append"
          }
        ],
        "idempotencyKey": "booking_id + a.extend1",
        "next": "c.sendable2"
      },
      {
        "id": "c.still1",
        "kind": "condition",
        "asks": "Does the reservation still stand as it has just been re-read?",
        "branches": [
          {
            "label": "Still at risk",
            "when": "the reservation is confirmed and the obligation behind it is still outstanding",
            "to": "c.sendable2"
          },
          {
            "label": "Settled in the meantime",
            "when": "the obligation was satisfied, waived or cancelled while the window was open",
            "observes": "obligation_satisfied",
            "to": "x.kept"
          },
          {
            "label": "Withdrawn in the meantime",
            "when": "the reservation was cancelled, moved or materially changed while the window was open",
            "observes": "booking_materially_changed",
            "to": "x.superseded"
          },
          {
            "label": "Partial payment recorded",
            "when": "a payment against the obligation was recorded that does not cover the full amount outstanding",
            "to": "a.partial1"
          },
          {
            "label": "Extension granted",
            "when": "the holder asked for more time before the deadline and the extension was granted against this reservation's own terms",
            "to": "a.extend1"
          }
        ]
      },
      {
        "id": "c.sendable2",
        "kind": "condition",
        "asks": "May the second reminder go out?",
        "branches": [
          {
            "label": "Sendable",
            "when": "the send path passes and no higher-precedence booking-lifecycle journey is holding this reservation; the notice is owed rather than rationed, so the discretionary budget does not stop it",
            "observes": "send path stages 1-8",
            "to": "a.remind2"
          },
          {
            "label": "Suppressed",
            "when": "a hard gate stops it; the gate is recorded as the reason and no route is forced that cannot deliver",
            "observes": "send path stages 1-8",
            "to": "a.record-no-action"
          }
        ]
      },
      {
        "id": "a.remind2",
        "kind": "action",
        "does": "Send a short, direct message saying the reservation will be lost if the payment is not completed, with the final payment point and a direct route to pay. No invented urgency beyond what the terms themselves assert",
        "execution": "communication",
        "idempotencyKey": "booking_id + a.remind2",
        "writes": [
          {
            "field": "reservation_log",
            "mode": "append"
          }
        ],
        "next": "w.remind2"
      },
      {
        "id": "w.remind2",
        "kind": "wait",
        "until": [
          "obligation_satisfied",
          "authoritative_payment_failure",
          "booking_materially_changed"
        ],
        "onEvent": "c.outcome2",
        "timeout": {
          "after": {
            "key": "reservation_payment.due",
            "rule": "The due point the booking terms themselves assert for this reservation. This journey reads that point; it never sets one, and it never treats the moment a reminder happened to go out as the start of a clock.",
            "class": "attribute-bound",
            "required": true
          },
          "reason": "past the due point the reservation is no longer merely outstanding - it is inside the window in which the terms will act, and that is a different thing to say",
          "relativeTo": "attribute",
          "attribute": "payment_due_at"
        },
        "onTimeout": "c.still2",
        "recheck": "the reservation, its terms and the obligation behind it re-read from the systems that own them: still confirmed, same time, same amount, and whether anything has been paid",
        "windowExtendsOnEngagement": false
      },
      {
        "id": "c.outcome2",
        "kind": "condition",
        "asks": "What resolved the second wait?",
        "branches": [
          {
            "label": "Reservation kept",
            "when": "the obligation behind the reservation is recorded satisfied, waived or cancelled",
            "observes": "obligation_satisfied",
            "to": "x.kept"
          },
          {
            "label": "The payment itself failed",
            "when": "an attempt was made against this obligation and the payment system stated that it failed",
            "observes": "authoritative_payment_failure",
            "to": "h.payment-failure"
          },
          {
            "label": "Reservation withdrawn",
            "when": "the reservation was cancelled, moved or materially changed",
            "observes": "booking_materially_changed",
            "to": "x.superseded"
          }
        ]
      },
      {
        "id": "a.partial2",
        "kind": "action",
        "does": "Update the amount still outstanding to what the payment record now shows, and continue the cascade toward the final reminder for the remainder rather than the original figure",
        "writes": [
          {
            "field": "amount_outstanding",
            "mode": "set"
          },
          {
            "field": "reservation_log",
            "mode": "append"
          }
        ],
        "idempotencyKey": "booking_id + a.partial2",
        "next": "c.sendable3"
      },
      {
        "id": "a.extend2",
        "kind": "action",
        "does": "Record the granted extension against this reservation's own due point and release point, and continue the cascade against the new dates rather than the original ones",
        "writes": [
          {
            "field": "payment_due_at",
            "mode": "set"
          },
          {
            "field": "release_at",
            "mode": "set"
          },
          {
            "field": "reservation_log",
            "mode": "append"
          }
        ],
        "idempotencyKey": "booking_id + a.extend2",
        "next": "c.sendable3"
      },
      {
        "id": "c.still2",
        "kind": "condition",
        "asks": "Does the reservation still stand as it has just been re-read?",
        "branches": [
          {
            "label": "Still at risk",
            "when": "the reservation is confirmed and the obligation behind it is still outstanding at the due point",
            "to": "c.sendable3"
          },
          {
            "label": "Settled in the meantime",
            "when": "the obligation was satisfied, waived or cancelled while the window was open",
            "observes": "obligation_satisfied",
            "to": "x.kept"
          },
          {
            "label": "Withdrawn in the meantime",
            "when": "the reservation was cancelled, moved or materially changed while the window was open",
            "observes": "booking_materially_changed",
            "to": "x.superseded"
          },
          {
            "label": "The held slot itself is gone",
            "when": "the terms changed because the specific date, room or service the reservation held is no longer available to hand back to it - filled elsewhere while the window was open",
            "observes": "booking_materially_changed",
            "to": "a.suggest-alternative"
          },
          {
            "label": "Partial payment recorded",
            "when": "a payment against the obligation was recorded that does not cover the full amount outstanding",
            "to": "a.partial2"
          },
          {
            "label": "Extension granted",
            "when": "the holder asked for more time before the deadline and the extension was granted against this reservation's own terms",
            "to": "a.extend2"
          }
        ]
      },
      {
        "id": "a.suggest-alternative",
        "kind": "action",
        "does": "Say plainly that the held slot, date, room or service is no longer available, and point at an alternative date or option rather than leaving the holder to discover it unannounced. Nothing here claims the original reservation can still be honored",
        "execution": "communication",
        "idempotencyKey": "booking_id + a.suggest-alternative",
        "writes": [
          {
            "field": "reservation_log",
            "mode": "append"
          }
        ],
        "next": "x.superseded"
      },
      {
        "id": "c.sendable3",
        "kind": "condition",
        "asks": "May the last-chance reminder go out?",
        "branches": [
          {
            "label": "Sendable",
            "when": "the send path passes, the discretionary budget for this reservation is not spent, and no higher-precedence booking-lifecycle journey is holding this reservation",
            "observes": "send path stages 1-8",
            "to": "a.remind3"
          },
          {
            "label": "Suppressed",
            "when": "a gate stops it or the budget is spent; the gate is recorded as the reason and no route is forced that cannot deliver",
            "observes": "send path stages 1-8",
            "to": "a.record-no-action"
          }
        ]
      },
      {
        "id": "a.remind3",
        "kind": "action",
        "does": "Send one short, direct message that the reservation's window is about to close, with the reservation detail, the final payment point and a quick route back to the payment - nothing more, on a route that still reaches someone who has not acted on either earlier touch",
        "execution": "communication",
        "idempotencyKey": "booking_id + a.remind3",
        "writes": [
          {
            "field": "reservation_log",
            "mode": "append"
          }
        ],
        "next": "w.release"
      },
      {
        "id": "w.release",
        "kind": "wait",
        "until": [
          "obligation_satisfied",
          "authoritative_payment_failure",
          "booking_materially_changed"
        ],
        "onEvent": "c.outcomeFinal",
        "timeout": {
          "after": {
            "key": "reservation_payment.release",
            "rule": "The point at which the booking terms release the reservation back to availability. The terms own that point; this journey reads it and states what happened at it.",
            "class": "attribute-bound",
            "required": true
          },
          "reason": "after the release point there is no reservation left to protect, and the only thing owed to the holder is being told so",
          "relativeTo": "attribute",
          "attribute": "release_at"
        },
        "onTimeout": "a.lapse",
        "recheck": "the reservation and its obligation re-read from the systems that own them, so the outcome at the final payment point is stated only where the record actually shows one",
        "windowExtendsOnEngagement": false
      },
      {
        "id": "c.outcomeFinal",
        "kind": "condition",
        "asks": "At the final payment point, was the payment completed?",
        "branches": [
          {
            "label": "Reservation kept",
            "when": "the obligation behind the reservation is recorded satisfied, waived or cancelled",
            "observes": "obligation_satisfied",
            "to": "a.confirm"
          },
          {
            "label": "The payment itself failed",
            "when": "an attempt was made against this obligation and the payment system stated that it failed",
            "observes": "authoritative_payment_failure",
            "to": "h.payment-failure"
          },
          {
            "label": "Reservation withdrawn",
            "when": "the reservation was cancelled, moved or materially changed",
            "observes": "booking_materially_changed",
            "to": "x.superseded"
          }
        ]
      },
      {
        "id": "a.confirm",
        "kind": "action",
        "does": "Say that the payment was received and the reservation is finalized, with the reservation summary and the payment now on record. This is the moment the reservation stops being conditional on anything",
        "execution": "communication",
        "idempotencyKey": "booking_id + a.confirm",
        "writes": [
          {
            "field": "reservation_log",
            "mode": "append"
          }
        ],
        "next": "x.kept"
      },
      {
        "id": "a.lapse",
        "kind": "action",
        "does": "Say that the reservation was released, that nothing is being held, and what the record now shows, with an optional route to start a new reservation. A place that quietly disappears is discovered on the day by somebody who still believes they have it",
        "execution": "communication",
        "idempotencyKey": "booking_id + a.lapse",
        "writes": [
          {
            "field": "reservation_log",
            "mode": "append"
          }
        ],
        "next": "x.released"
      },
      {
        "id": "a.record-no-action",
        "kind": "action",
        "does": "Record which gate stopped the notice and at which stage, so a reservation that was never warned is a measured outcome rather than a silent absence",
        "writes": [
          {
            "field": "reservation_log",
            "mode": "append"
          }
        ],
        "idempotencyKey": "booking_id + a.record-no-action",
        "next": "x.no-action"
      },
      {
        "id": "h.payment-failure",
        "kind": "handoff",
        "to": "FIN-134",
        "on": "an attempt against this reservation's obligation that the payment system states failed",
        "carries": [
          "the obligation behind the reservation, and that a reservation depends on it",
          "the release point the booking terms assert, which is the consequence recovery has to work inside",
          "what the holder has already been told about the reservation, and when"
        ],
        "suppresses": [
          "every further notice from this journey about the payment"
        ],
        "contract": {
          "requiredFields": [
            "obligation_id",
            "booking_id",
            "amount_outstanding",
            "release_at"
          ]
        }
      },
      {
        "id": "x.kept",
        "kind": "exit",
        "state": "kept; the condition the reservation stood on is satisfied",
        "class": "success",
        "terminal": false,
        "reEntry": "a further conditional payment against this reservation, or a later reservation by the same person, opens its own instance"
      },
      {
        "id": "x.released",
        "kind": "exit",
        "state": "released; the terms took the place back and the holder was told",
        "class": "timeout",
        "terminal": false,
        "reEntry": "a new reservation is a new instance; this one is never revived, because the place it referred to no longer belongs to this holder"
      },
      {
        "id": "x.superseded",
        "kind": "exit",
        "state": "superseded; the reservation was cancelled, moved or materially changed, or the held slot itself was no longer available to hand back to it",
        "class": "invalid-state",
        "terminal": false,
        "reEntry": "the reservation that replaced it, or an alternative the holder books instead, runs its own instance from its own terms"
      },
      {
        "id": "x.no-action",
        "kind": "exit",
        "state": "no notice sent; the gate that stopped it is recorded",
        "class": "no-action",
        "terminal": false,
        "reEntry": "a later reservation by the same person is evaluated on its own gates"
      }
    ],
    "guardrails": [
      "The reservation is the subject and the payment is a condition on it. A journey that starts talking about the money has become a different journey.",
      "The booking terms own the due point and the release point. This journey reads both and never asserts, moves or softens either.",
      "An attempt that actually failed is handed to payment recovery, and this journey stops talking about the payment rather than running beside it.",
      "Nothing is sent without re-reading the reservation and its obligation at send time; the scheduled job carries a claim, not a fact.",
      "The release is stated. A place that disappears in silence is discovered by the holder on the day.",
      "An outcome that could not be established is reconciled before it is treated as outstanding."
    ],
    "reusableRule": "Where a commitment stands on a condition, the journey belongs to the commitment and not to the condition: it says what the terms will do and by when, and it hands the condition's own failure to whoever owns that failure."
  },
];
