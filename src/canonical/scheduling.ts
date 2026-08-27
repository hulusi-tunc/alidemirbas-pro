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
    purpose:
      "Protect specific capacity for a bounded moment while a booking is being completed, without pretending it is a booking.",
    entity: {
      scope: "the hold, the capacity it protects and the requester who owns it",
      note: "One hold per requester per slot. A second hold by the same requester consumes the capacity twice and releases at two different times.",
    },
    distinctFrom: [
      {
        journey: "FUL-143",
        because:
          "FUL-143 allocates a resource to an obligation that already exists. This protects capacity for a commitment that does not exist yet and may never - most holds end in expiry rather than in a booking.",
      },
    ],
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
      },
      {
        id: "w.hold",
        kind: "wait",
        until: [
          "the booking is confirmed against this hold",
          "the hold is explicitly released",
          "the booking intent is abandoned",
        ],
        onEvent: "c.outcome",
        timeout: {
          after: "the hold's expiry",
          reason:
            "the expiry is the entire point of a hold. Capacity still counted against a lapsed one is capacity nobody can book and nobody owns, and the resource reads as full while standing empty",
        },
        onTimeout: "a.expire",
        windowExtendsOnEngagement: false,
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
      },
      {
        id: "a.release",
        kind: "action",
        does: "Release the capacity and record the hold RELEASED. The release is idempotent - releasing an already-released hold changes nothing rather than returning capacity a second time, and the difference between those two behaviours is how many people can be booked into one slot",
        writes: [{ field: "hold_log", mode: "append" }],
        next: "x.released",
      },
      {
        id: "a.consume",
        kind: "action",
        does: "Consume the hold into the confirmed reservation, moving the capacity from held to reserved in one step. Releasing first and re-taking opens a window - short, and entirely long enough - in which someone else takes the slot the requester has just paid for",
        writes: [{ field: "hold_log", mode: "append" }],
        next: "x.consumed",
      },
      {
        id: "x.consumed",
        kind: "exit",
        state: "consumed into a confirmed reservation; capacity never passed back through free",
        terminal: false,
        reEntry:
          "the reservation now owns the capacity. A cancellation releases it through the cancellation lifecycle rather than through this hold",
      },
      {
        id: "x.expired",
        kind: "exit",
        state: "EXPIRED; capacity released and available again",
        terminal: false,
        reEntry:
          "the same requester can take a new hold on the same slot if it is still free, which is a new hold rather than an extension of this one",
      },
      {
        id: "x.released",
        kind: "exit",
        state: "RELEASED; capacity available again",
        terminal: false,
        reEntry:
          "a repeated release against this hold is a no-op rather than a second return of capacity",
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
    purpose:
      "Turn a request for a specific time into a commitment both sides can rely on, or say clearly that it did not.",
    entity: {
      scope: "the reservation request, the requester and the resource or service it names",
      note: "One reservation per requester, resource and slot. A retried submission produces the same reservation rather than a second one against the same capacity.",
    },
    distinctFrom: [
      {
        journey: "FUL-141",
        because:
          "FUL-141 creates a generic fulfillment obligation. This creates a commitment to a specific time on both sides - which is why it revalidates capacity at the moment of confirming and why its failure mode is contention rather than eligibility.",
      },
    ],
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
      },
      {
        id: "w.pending",
        kind: "wait",
        until: [
          "the outstanding confirmation or dependency resolves",
          "the request is withdrawn",
        ],
        onEvent: "c.pending-outcome",
        timeout: {
          after: "the pending window the booking semantics allow",
          reason:
            "capacity protected indefinitely for a booking that never completes is capacity taken from everyone who would have completed one",
        },
        onTimeout: "a.lapse",
        windowExtendsOnEngagement: false,
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
      },
      {
        id: "x.lapsed",
        kind: "exit",
        state: "request lapsed; capacity released and nothing committed",
        terminal: false,
        reEntry:
          "a new request is evaluated against current availability, which may no longer include the slot that was being held",
      },
      {
        id: "a.confirm",
        kind: "action",
        does: "Create the commitment explicitly. Record CONFIRMED_RESERVATION with the slot, the resource, the parties and the terms. This is the point at which two parties owe each other a specific time - the customer arranges their day around it and the provider stops selling the slot - and nothing before it was that",
        writes: [{ field: "reservation_log", mode: "append" }],
        next: "h.prepare",
      },
      {
        id: "h.prepare",
        kind: "handoff",
        to: "SCH-174",
        on: "a confirmed reservation with time still to run before it",
        carries: [
          "the commitment, its time and the parties",
          "the explicit fact that the time is now fixed and preparation runs alongside it rather than deciding it",
        ],
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
    purpose:
      "Get the conditions for a successful service in place, without letting them move the time that was promised.",
    entity: {
      scope: "the confirmed reservation and the preparation running against it",
      note: "The preparation is subordinate to the booking. It can fail, and the booking stays confirmed while somebody decides what to do about it.",
    },
    entry: "t.confirmed",
    nodes: [
      {
        id: "t.confirmed",
        kind: "trigger",
        event: "reservation_confirmed",
        evidence: {
          requires: ["a reservation confirmed with a scheduled time still in the future"],
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
      },
      {
        id: "w.prepare",
        kind: "wait",
        until: [
          "every prerequisite completes",
          "the booking materially changes",
        ],
        onEvent: "c.event",
        timeout: {
          after: "the pre-service checkpoint policy defines ahead of the scheduled time",
          reason:
            "the checkpoint is the last point at which an unresolved prerequisite can still be acted on. After it, the choice is to proceed unprepared or to disrupt someone's day at short notice",
        },
        onTimeout: "c.critical",
        windowExtendsOnEngagement: false,
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
      },
      {
        id: "x.upcoming",
        kind: "exit",
        state: "READY or UPCOMING; the commitment stands and its conditions are in the state recorded",
        terminal: false,
        reEntry:
          "the revalidation at service time reads the booking's current state rather than this readiness record, which was true when it was written",
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
    purpose:
      "Move a commitment to a new time without ever leaving the customer holding neither.",
    entity: {
      scope: "the existing reservation and the reschedule request raised against it",
      note: "One reservation throughout, carrying every time it has held. A reschedule is a move recorded on it rather than a cancellation followed by a new booking.",
    },
    distinctFrom: [
      {
        journey: "SUB-166",
        because:
          "SUB-166 changes the terms of a continuing relationship. This moves one specific occurrence to a different time or resource, and its whole difficulty is contention for the replacement - which terms changes never have.",
      },
    ],
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
      },
      {
        id: "x.original-stands",
        kind: "exit",
        state: "original reservation preserved unchanged; no move took place",
        terminal: false,
        reEntry:
          "the reschedule can be attempted again against different availability. Cancelling the original is a separate decision the customer makes explicitly",
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
      },
      {
        id: "a.release-old",
        kind: "action",
        does: "Release the original slot, and only now. Capacity returns to availability at the point the replacement is real, which is the ordering the whole journey exists to enforce",
        writes: [{ field: "reservation_log", mode: "append" }],
        next: "a.reconcile",
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
    purpose:
      "End a future time commitment cleanly, returning the capacity and leaving the money to be decided elsewhere.",
    entity: {
      scope: "the reservation and the cancellation acting on it",
      note: "The reservation survives its own cancellation as a record. A released slot says something about capacity and nothing about whether the appointment existed.",
    },
    distinctFrom: [
      {
        journey: "FUL-150",
        because:
          "FUL-150 cancels what remains of a generic fulfillment obligation. This ends a specific future time commitment, which releases capacity someone else can use and turns on timing relative to the appointment rather than on remaining scope.",
      },
    ],
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
      },
      {
        id: "a.release",
        kind: "action",
        does: "Release the reserved capacity where the booking semantics permit it. The release is idempotent - an already-released reservation returns capacity once rather than once per attempt, and the difference shows up as two people booked into one room",
        writes: [{ field: "reservation_log", mode: "append" }],
        next: "a.stop",
      },
      {
        id: "a.stop",
        kind: "action",
        does: "Stop the obsolete preparation, reminders and check-in actions. A reminder for a cancelled appointment brings someone to a place where nobody is expecting them, which is the most avoidable failure in this whole category",
        writes: [{ field: "suppressed_sends", mode: "append" }],
        next: "c.external",
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
    purpose:
      "Start a service from what the booking is now, not from a confirmation issued weeks ago.",
    entity: {
      scope: "the confirmed reservation and the occurrence about to begin",
      note: "The scheduled job carries the booking version it was created against. Everything it does begins with comparing that against the booking as it now stands.",
    },
    entry: "t.window",
    nodes: [
      {
        id: "t.window",
        kind: "trigger",
        event: "pre_start_window_reached",
        evidence: {
          requires: ["the defined pre-start or start window for a scheduled occurrence being reached"],
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
      },
      {
        id: "x.suppressed",
        kind: "exit",
        state: "stale start suppressed; no service was begun and no attendance state was written",
        terminal: false,
        reEntry:
          "the booking's current version has its own scheduled occurrence, which revalidates on its own terms when it arrives",
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
      },
      {
        id: "w.arrival",
        kind: "wait",
        until: [
          "attendance or check-in is authoritatively established",
          "the reservation is cancelled inside the window",
        ],
        onEvent: "c.arrival",
        timeout: {
          after: "the arrival window policy defines",
          reason:
            "the arrival window is what makes a missed appointment a fact rather than an assumption. Concluding before it closes records a no-show against someone who is running late and about to walk in",
        },
        onTimeout: "h.missed",
        windowExtendsOnEngagement: false,
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
    purpose:
      "Separate the fact that someone turned up from the question of whether they got what they came for.",
    entity: {
      scope: "the reservation occurrence and the service delivered inside it",
      note: "Attendance is about the occurrence. Completion is about the obligation. One appointment can end with the first true and the second false.",
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
      },
      {
        id: "a.track",
        kind: "action",
        does: "Track the scope actually delivered, where the service has a scope worth tracking. What is recorded is what was delivered rather than the fact that the appointment took place",
        writes: [{ field: "occurrence_log", mode: "append" }],
        next: "w.service",
      },
      {
        id: "w.service",
        kind: "wait",
        until: ["the service completes", "the service is interrupted"],
        onEvent: "c.outcome",
        timeout: {
          after: "the scheduled duration plus its tolerance",
          reason:
            "an occurrence that started and was never concluded is unknown rather than complete, and closing it as complete makes an unfulfilled service invisible to everyone downstream",
        },
        onTimeout: "a.unknown",
        windowExtendsOnEngagement: false,
      },
      {
        id: "a.unknown",
        kind: "action",
        does: "Record the occurrence's outcome as unknown - someone attended and what happened afterwards was never recorded. This is not completion, and treating it as completion closes an obligation nobody confirmed was met",
        writes: [{ field: "occurrence_log", mode: "append" }],
        next: "h.reconcile",
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
      },
      {
        id: "x.completed",
        kind: "exit",
        state: "COMPLETED; attendance and delivery both established",
        terminal: false,
        reEntry:
          "a problem raised afterwards about what was delivered is a post-completion issue and is assessed on its own terms",
      },
      {
        id: "a.partial",
        kind: "action",
        does: "Record PARTIALLY_COMPLETED with exactly what was delivered and what remains. Attendance is not a successful outcome, and a half-delivered service recorded as complete closes something the customer is still owed - they will find out, and they will find out later than we could have told them",
        writes: [{ field: "occurrence_log", mode: "append" }],
        next: "h.remainder",
      },
      {
        id: "h.remainder",
        kind: "handoff",
        to: "REM-157",
        on: "a scheduled service delivered only in part",
        carries: [
          "the delivered scope and the remaining obligation, separately",
          "the explicit fact that the appointment occurred, so this is a shortfall rather than a missed service",
        ],
      },
      {
        id: "a.interrupt",
        kind: "action",
        does: "Record the interruption with its cause and the point at which delivery stopped",
        writes: [{ field: "occurrence_log", mode: "append" }],
        next: "c.interruption",
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
            to: "h.remainder",
          },
        ],
      },
      {
        id: "a.resume",
        kind: "action",
        does: "Resume the same occurrence and continue tracking delivered scope. The wait's timeout is the scheduled duration and does not extend, so an occurrence that keeps stopping reaches its limit rather than running indefinitely",
        writes: [{ field: "occurrence_log", mode: "append" }],
        next: "w.service",
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
    purpose:
      "Establish that one confirmed booking did not happen because the customer did not attend, having ruled out every other explanation.",
    entity: {
      scope: "the single reservation occurrence that did not take place",
      note: "One occurrence. Nothing here says anything about the customer's engagement, their history or their relationship - it is a fact about one appointment.",
    },
    distinctFrom: [
      {
        journey: "RET-22",
        because:
          "RET-22 reads a pattern of expected usage not happening across a relationship. This is the non-occurrence of one specific confirmed booking at one specific time, and it is established by exclusion rather than by observing a trend.",
      },
    ],
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
      },
      {
        id: "x.suppressed",
        kind: "exit",
        state: "no-show suppressed; the booking was cancelled or moved and nothing is attributed",
        terminal: false,
        reEntry:
          "the rescheduled occurrence has its own window and is assessed on its own terms when it arrives",
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
    purpose:
      "Recover a commitment we cannot keep, without any of the cost landing on the person who was ready.",
    entity: {
      scope: "the affected reservations and the provider or resource failure behind them",
      note: "The scope is every booking the failure touches. A closed location is not one cancellation, and treating it as one leaves the rest to be discovered by the people who turn up.",
    },
    distinctFrom: [
      {
        journey: "FUL-145",
        because:
          "FUL-145 handles a generic fulfillment exception. This carries the scheduling-specific recovery: the same time with a different provider, a different time with the same commitment, and the rule that the customer is never recorded as the cause.",
      },
    ],
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
      },
      {
        id: "a.protect",
        kind: "action",
        does: "Record that the failure is provider-side. Whatever follows, the customer is not marked as having cancelled and is never classified as a no-show - they were available and the service was not, and the record has to say so before anything else touches this booking",
        writes: [{ field: "occurrence_log", mode: "append" }],
        next: "c.replacement",
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
      },
      {
        id: "a.release-old",
        kind: "action",
        does: "Release the obsolete allocation, idempotently. The original resource returns to availability once, whatever number of times the release is attempted",
        writes: [{ field: "reservation_log", mode: "append" }],
        next: "c.notify",
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
      },
      {
        id: "x.reallocated",
        kind: "exit",
        state: "reallocated; the time and the commitment both stand",
        terminal: false,
        reEntry:
          "the booking continues to its scheduled occurrence and revalidates there like any other",
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
      },
      {
        id: "a.release-cancel",
        kind: "action",
        does: "Release the allocation and stop the obsolete preparation, reminders and check-in actions. A reminder for an appointment we cancelled brings the customer in for a service that has no provider waiting",
        writes: [
          { field: "reservation_log", mode: "append" },
          { field: "suppressed_sends", mode: "append" },
        ],
        next: "c.remedy",
      },
      {
        id: "c.remedy",
        kind: "condition",
        asks: "What does the failure leave to answer for?",
        branches: [
          {
            label: "An unresolved service obligation",
            when: "the customer still needs the service and it has not been delivered",
            to: "h.remedy",
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
        id: "h.remedy",
        kind: "handoff",
        to: "REM-157",
        on: "a service obligation left unresolved by a provider-side failure",
        carries: [
          "the obligation as it stands and the fact that the customer did nothing wrong",
          "the explicit fact that the impact of the failure is a separate question from the obligation, and compensation is decided on its own terms",
        ],
      },
      {
        id: "h.financial",
        kind: "handoff",
        to: "FIN-137",
        on: "a provider-cancelled booking that was paid for",
        carries: [
          "what was paid and the fact that the cancellation was ours",
          "the explicit fact that no cancellation fee applies to a booking the provider could not keep",
        ],
      },
      {
        id: "x.cancelled-provider",
        kind: "exit",
        state: "cancelled on the provider side; recorded as ours, with nothing attributed to the customer",
        terminal: false,
        reEntry:
          "a new booking is a new commitment. This cancellation stays in the record as a provider failure, which is what any later question about the customer's booking history depends on",
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
    channels: ["email", "sms", "in-app"],
    name: "Appointment approaching → prerequisites and revalidation → ready, reminded or at risk",
    purpose:
      "Get the customer's side of a confirmed commitment done before the commitment arrives, and send the reminder from what the booking is at that moment rather than from what it was when it was made.",
    entity: {
      scope: "the confirmed booking occurrence plus the prerequisites its customer owes against it",
      note: "One occurrence, one instance. Each occurrence of a recurring commitment revalidates and reminds on its own.",
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
    ],
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
        next: "c.time",
      },
      {
        id: "c.time",
        kind: "condition",
        asks: "Is there enough time left for a prompt to be worth sending?",
        branches: [
          {
            label: "Time remains",
            when: "the scheduled time is far enough out that an outstanding prerequisite could still be completed",
            to: "a.prompt",
          },
          {
            label: "Too close to prompt",
            when: "the booking is already inside its pre-start window",
            to: "a.revalidate",
          },
        ],
      },
      {
        id: "a.prompt",
        kind: "action",
        does: "Name every outstanding prerequisite, whose it is and the point by which it has to be done, in one message rather than one message per requirement. Somebody with three things to do has one problem, and splitting it into three makes it look like three systems that do not talk",
        next: "w.prereq",
        execution: "communication",
      },
      {
        id: "w.prereq",
        kind: "wait",
        until: [
          "every customer-owed prerequisite is recorded complete",
          "the booking is cancelled, moved or materially changed",
        ],
        onEvent: "c.prereq",
        timeout: {
          after: "the pre-start window for this kind of booking",
          reason: "the pre-start point is where the booking is read again, and anything sent past it is about a commitment that may no longer exist",
        },
        onTimeout: "a.revalidate",
        windowExtendsOnEngagement: false,
      },
      {
        id: "c.prereq",
        kind: "condition",
        asks: "What resolved the wait?",
        branches: [
          {
            label: "All complete",
            when: "every prerequisite the customer owed is recorded satisfied",
            to: "w.prestart",
          },
          {
            label: "Booking changed",
            when: "the booking was cancelled, moved or materially changed",
            to: "x.superseded",
          },
        ],
      },
      {
        id: "w.prestart",
        kind: "wait",
        until: [
          "the booking is cancelled or moved",
        ],
        onEvent: "a.revalidate",
        timeout: {
          after: "the pre-start window for this kind of booking",
          reason: "the reminder exists to arrive before the commitment; after it there is nothing left to remind anybody about",
        },
        onTimeout: "a.revalidate",
        windowExtendsOnEngagement: false,
      },
      {
        id: "a.revalidate",
        kind: "action",
        does: "Re-read the booking from authoritative current state before anything is sent - still confirmed, same time, same provider, and which prerequisites are outstanding now. A reminder generated from the booking as it was is how somebody who cancelled correctly gets told to turn up",
        next: "c.valid",
      },
      {
        id: "c.valid",
        kind: "condition",
        asks: "Does the booking still stand as it was just read?",
        branches: [
          {
            label: "Still valid",
            when: "the booking is confirmed, at the time recorded, and deliverable",
            to: "c.critical",
          },
          {
            label: "Cancelled, moved or superseded",
            when: "current state no longer matches the booking this reminder was scheduled against",
            to: "x.superseded",
          },
        ],
      },
      {
        id: "c.critical",
        kind: "condition",
        asks: "Is anything outstanding that would stop the service happening?",
        branches: [
          {
            label: "Critical prerequisite missing",
            when: "a requirement the service cannot be delivered without is still not satisfied",
            to: "a.at-risk",
          },
          {
            label: "Nothing critical outstanding",
            when: "everything blocking is done, whatever remains is not blocking",
            to: "a.remind",
          },
        ],
      },
      {
        id: "a.at-risk",
        kind: "action",
        does: "Send the reminder and name the one thing that will stop this going ahead, with the last point at which it can still be done. The confirmed time is not moved here - a prerequisite failing is a reason to warn somebody, not a reason to rewrite a commitment they have planned around",
        next: "h.at-risk",
        execution: "communication",
      },
      {
        id: "h.at-risk",
        kind: "handoff",
        to: "SCH-174",
        on: "a booking reaching its pre-start point with a critical prerequisite still outstanding",
        carries: [
          "which prerequisite is missing and when it was last prompted",
          "that the customer has been told, and what they were told",
        ],
      },
      {
        id: "a.remind",
        kind: "action",
        does: "Remind them of the time, the place or joining route, and anything still outstanding that does not block it. One reminder per occurrence - a second one sent because nothing could tell that the first arrived is how people stop reading them",
        next: "x.reminded",
        execution: "communication",
      },
      {
        id: "x.reminded",
        kind: "exit",
        state: "reminded against a revalidated booking",
        terminal: false,
        reEntry: "each further occurrence of a recurring commitment is its own instance",
      },
      {
        id: "x.superseded",
        kind: "exit",
        state: "superseded; the booking changed before the reminder was due",
        terminal: false,
        reEntry: "the booking that replaced it runs its own readiness from its own confirmation",
      },
    ],
    guardrails: [
      "Nothing is sent without re-reading the booking at send time. The scheduled job carries the version it was built against, and that version is a claim rather than a fact.",
      "A reminder having been sent is never recorded as preparation being complete.",
      "Interaction with a reminder is not attendance and is not a prerequisite satisfied.",
      "Preparation never moves the confirmed time. A failing condition escalates; it does not reschedule.",
      "One reminder per occurrence, and outstanding requirements are named together rather than one message each.",
    ],
    reusableRule:
      "A reminder is only as true as the moment it is built, so it is built at the moment it is sent.",
  },
  {
    id: "SCH-277",
    slug: "reservation-outcome-notice",
    category: "scheduling",
    goal: "scheduling-commitment",
    channels: ["email", "sms"],
    name: "Reservation requested → validate capacity → confirm, re-offer or lapse",
    purpose:
      "Tell the requester whether the specific time they asked for is now a commitment, and where it is not, offer the nearest time that actually exists - because the availability they were shown earlier was a picture and never a hold.",
    entity: {
      scope: "the reservation request, the requester, and the resource and slot it names",
      note: "One instance per request. A retried submission is the same request rather than a second claim on the same capacity.",
    },
    distinctFrom: [
      {
        journey: "SCH-173",
        because:
          "SCH-173 revalidates capacity and decides whether a commitment exists. This journey carries that outcome to the requester and never states a confirmation the booking record does not hold.",
      },
    ],
    entry: "t.requested",
    nodes: [
      {
        id: "t.requested",
        kind: "trigger",
        event: "reservation_request_recorded",
        evidence: {
          requires: [
            "a reservation request recorded against a named requester, resource and slot",
            "a permitted contact point for a booking notice",
          ],
          insufficientAlone: [
            "availability being searched or displayed",
            "a slot held inside a session that was never submitted",
          ],
          source: "authoritative",
        },
        next: "a.received",
      },
      {
        id: "a.received",
        kind: "action",
        does: "Acknowledge the request and say explicitly that it is not yet a commitment, naming when the outcome will come. The gap between asking for a time and holding it is where every double-booking dispute begins",
        next: "w.outcome",
        execution: "communication",
      },
      {
        id: "w.outcome",
        kind: "wait",
        until: [
          "the request is committed against current capacity",
          "the request is rejected for want of capacity or eligibility",
        ],
        onEvent: "c.outcome",
        timeout: {
          after: "the period the booking semantics allow a request to stay unresolved",
          reason: "an unresolved request sits against capacity other requesters can see, and it cannot sit there indefinitely",
        },
        onTimeout: "a.lapse",
        windowExtendsOnEngagement: false,
      },
      {
        id: "c.outcome",
        kind: "condition",
        asks: "What did revalidation decide?",
        branches: [
          {
            label: "Committed",
            when: "the capacity was committed and a confirmed reservation now exists",
            to: "a.confirm",
          },
          {
            label: "Gone, but something near",
            when: "the slot was no longer available when it was re-read, and current availability holds something close enough to be worth offering",
            to: "a.reoffer",
          },
          {
            label: "Gone, nothing near",
            when: "the slot was no longer available and nothing in current availability is a genuine alternative",
            to: "a.decline",
          },
        ],
      },
      {
        id: "a.confirm",
        kind: "action",
        does: "State the committed slot, the resource and the terms concretely - the date, the time, the place, what is needed on arrival. A confirmation that does not restate the specifics is not something the requester can act on a month later",
        next: "x.confirmed",
        execution: "communication",
      },
      {
        id: "x.confirmed",
        kind: "exit",
        state: "committed and stated to the requester",
        terminal: false,
        reEntry: "a change or cancellation to this commitment is its own instance; a further request is a new one",
      },
      {
        id: "a.reoffer",
        kind: "action",
        does: "Say the requested time is gone, name the slots available now, and give a deadline for choosing. What is offered is current availability and never the set they were originally shown, which by definition contains one slot that no longer exists",
        next: "w.choice",
        execution: "communication",
      },
      {
        id: "w.choice",
        kind: "wait",
        until: [
          "one of the offered slots is requested",
          "every offered slot is declined",
        ],
        onEvent: "c.choice",
        timeout: {
          after: "the stated deadline for choosing",
          reason: "the offered slots stay visible to everyone else and are not held while one requester decides",
        },
        onTimeout: "x.lapsed",
        windowExtendsOnEngagement: false,
      },
      {
        id: "c.choice",
        kind: "condition",
        asks: "Did they take one of them?",
        branches: [
          {
            label: "Took a slot",
            when: "the requester asked for one of the slots that were offered",
            to: "h.rebook",
          },
          {
            label: "Declined all",
            when: "the requester declined every alternative offered",
            to: "x.declined",
          },
        ],
      },
      {
        id: "h.rebook",
        kind: "handoff",
        to: "SCH-173",
        on: "a requester choosing one of the alternative slots offered to them",
        carries: [
          "the original request and why it could not be met",
          "the slot chosen and when it was offered",
        ],
      },
      {
        id: "x.declined",
        kind: "exit",
        state: "no commitment made, requester informed",
        terminal: false,
        reEntry: "a fresh request for a different time enters as a new instance",
      },
      {
        id: "a.decline",
        kind: "action",
        does: "Say plainly that the time could not be committed, that nothing is being held, and when capacity of this kind is next expected. A rejection with no next horizon sends the requester somewhere else rather than back to the calendar",
        next: "x.declined",
        execution: "communication",
      },
      {
        id: "a.lapse",
        kind: "action",
        does: "Close the request as lapsed and say that nothing is held and nothing was booked. Requesters read silence as confirmation, which is the most expensive assumption in scheduling",
        next: "x.lapsed",
        execution: "communication",
      },
      {
        id: "x.lapsed",
        kind: "exit",
        state: "request lapsed unresolved, nothing held",
        terminal: false,
        reEntry: "a fresh request starts the sequence again",
      },
    ],
    guardrails: [
      "A request acknowledged is never worded as a request confirmed.",
      "What is offered after a failure is current availability, never the set the requester was originally shown.",
      "Nothing is described as held unless the booking semantics actually hold it.",
      "A lapse is stated. Silence after a request is read as a commitment.",
      "The confirmation restates the concrete slot every time. A reference is not a time and a place.",
    ],
    reusableRule:
      "Availability shown is a picture and a confirmation is a promise, and the requester must never have to guess which one they were sent.",
  },
  {
    id: "SCH-280",
    slug: "no-show-rebooking",
    category: "scheduling",
    goal: "scheduling-commitment",
    channels: ["email", "sms"],
    name: "No-show confirmed → validate the miss → rebook or close",
    purpose:
      "Offer a way back to somebody whose booking did not happen, having first established that the miss was theirs and not ours - because a rebooking prompt sent over our own failure is an accusation.",
    entity: {
      scope: "the single booking occurrence that did not take place",
      note: "One occurrence. This says nothing about the person's history or standing - it is a fact about one booking, and a second miss is its own instance.",
    },
    distinctFrom: [
      {
        journey: "SCH-179",
        because:
          "SCH-179 establishes and records the no-show and decides what consequence policy attaches. This journey is what the customer is told, it never creates the record, and it runs only where policy attached rebooking rather than a consequence.",
      },
      {
        journey: "SCH-177",
        because:
          "SCH-177 runs as the time approaches and is about getting somebody there. This starts only once the window has closed with nobody there.",
      },
    ],
    entry: "t.no-show",
    nodes: [
      {
        id: "t.no-show",
        kind: "trigger",
        event: "no_show_recorded_against_booking",
        evidence: {
          requires: [
            "a no-show authoritatively recorded against one confirmed booking",
            "the semantics it was judged under and the window that closed",
            "policy naming rebooking rather than a fee as what follows",
          ],
          insufficientAlone: [
            "a service window that has passed with no attendance event yet recorded",
            "a provider running late",
            "a booking with no arrival semantics defined",
          ],
          source: "authoritative",
        },
        next: "a.reread",
      },
      {
        id: "a.reread",
        kind: "action",
        does: "Re-read the booking's latest events before anything leaves the building. Attendance and cancellation events land late, and the gap between the record being written and the message being sent is exactly where a correct cancellation gets treated as a miss",
        next: "c.superseded",
      },
      {
        id: "c.superseded",
        kind: "condition",
        asks: "Did the booking genuinely not happen?",
        branches: [
          {
            label: "Superseded or reconciled",
            when: "a cancellation, a reschedule or a late attendance event has landed since the no-show was recorded",
            to: "x.suppressed",
          },
          {
            label: "Genuinely missed",
            when: "the record still stands after the re-read",
            to: "c.provider",
          },
        ],
      },
      {
        id: "x.suppressed",
        kind: "exit",
        state: "nothing sent; the booking was moved, cancelled or attended after all",
        terminal: false,
        reEntry: "a later booking that is genuinely missed is its own instance",
      },
      {
        id: "c.provider",
        kind: "condition",
        asks: "Could the provider or resource actually have delivered?",
        branches: [
          {
            label: "Deliverable",
            when: "the provider and the resource were available and able to deliver for the whole window",
            to: "c.rebookable",
          },
          {
            label: "Our side failed",
            when: "the provider, the resource or the location could not have delivered the booking as confirmed",
            to: "h.provider",
          },
        ],
      },
      {
        id: "h.provider",
        kind: "handoff",
        to: "SCH-180",
        on: "a missed booking the provider or resource could not have delivered",
        carries: [
          "the window that closed and what was already said to the customer about it",
          "the evidence that delivery was not possible on our side",
        ],
      },
      {
        id: "c.rebookable",
        kind: "condition",
        asks: "Is there anything to offer?",
        branches: [
          {
            label: "Rebooking available",
            when: "the same commitment can still be met and capacity for it exists",
            to: "a.offer",
          },
          {
            label: "Nothing to rebook onto",
            when: "the commitment has lapsed, the entitlement behind it has gone, or no capacity remains",
            to: "a.acknowledge",
          },
        ],
      },
      {
        id: "a.acknowledge",
        kind: "action",
        does: "State plainly that the booking did not happen and what that means, with no rebooking prompt attached because there is nothing to book. An offer with nothing behind it costs more trust than saying nothing would",
        next: "x.closed",
        execution: "communication",
      },
      {
        id: "a.offer",
        kind: "action",
        does: "Say that the booking was missed as a fact, without penalty language, and give the single route to a new one with the date that route closes. Attaching blame to the miss makes rebooking a confession, and people do not book to confess",
        next: "w.rebook",
        execution: "communication",
      },
      {
        id: "w.rebook",
        kind: "wait",
        until: [
          "a new booking is created for the same commitment",
          "the customer declines a further booking",
        ],
        onEvent: "c.outcome",
        timeout: {
          after: "the rebooking window stated in the offer",
          reason: "the stated window is the whole content of the offer, and letting it pass silently makes what was said untrue",
        },
        onTimeout: "x.closed",
        windowExtendsOnEngagement: false,
      },
      {
        id: "c.outcome",
        kind: "condition",
        asks: "How did the offer resolve?",
        branches: [
          {
            label: "Rebooked",
            when: "a new booking exists against the same commitment",
            to: "x.rebooked",
          },
          {
            label: "Declined",
            when: "the customer said they do not want another booking",
            to: "x.closed",
          },
        ],
      },
      {
        id: "x.rebooked",
        kind: "exit",
        state: "rebooked",
        terminal: false,
        reEntry: "the new booking has its own lifecycle and a later miss enters here again",
      },
      {
        id: "x.closed",
        kind: "exit",
        state: "closed with no rebooking",
        terminal: false,
        reEntry: "a request from the customer later reopens booking through the ordinary route, not through this one",
      },
    ],
    guardrails: [
      "The record is re-read immediately before sending. A message about a miss is the one thing that cannot be sent on stale state.",
      "Provider-side failure is ruled out before the customer is told anything about a miss.",
      "No blame, no penalty language, no history. This is one booking.",
      "One offer, not a sequence. Somebody who missed once is not pursued.",
    ],
    reusableRule:
      "Before telling somebody they missed something, prove it was not us who missed it.",
  },
  {
    id: "SCH-282",
    slug: "availability-searched-no-booking",
    category: "scheduling",
    goal: "scheduling-commitment",
    channels: ["email", "push"],
    name: "Availability searched, no booking → nearest window or waitlist",
    purpose:
      "Follow up an availability question that produced no booking with something that is genuinely bookable now, or with a waitlist place where nothing fits - because what was shown was never held and is probably already gone.",
    entity: {
      scope: "the availability question, the resource and window it asked about, and the absence of any reservation from it",
      note: "The question is not a claim on anything. A second question about a different window is its own instance and never inherits the first one's offer.",
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
    ],
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
        asks: "May an unprompted offer be sent to this person at all?",
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
      },
      {
        id: "w.settle",
        kind: "wait",
        until: [
          "a reservation or hold is created by this person for the requested window",
          "the requested window is taken or withdrawn",
        ],
        onEvent: "c.settled",
        timeout: {
          after: "a short bounded delay, long enough that the person is no longer in the product deciding",
          reason: "an offer that arrives while somebody is still choosing competes with the thing they are choosing, and usually wins nothing",
        },
        onTimeout: "a.recheck",
        windowExtendsOnEngagement: false,
      },
      {
        id: "c.settled",
        kind: "condition",
        asks: "What ended the delay?",
        branches: [
          {
            label: "Booked unprompted",
            when: "the person reserved or held something for the window themselves",
            to: "x.booked",
          },
          {
            label: "Window gone",
            when: "the window they asked about was taken or withdrawn before they acted",
            to: "a.recheck",
          },
        ],
      },
      {
        id: "x.booked",
        kind: "exit",
        state: "booked; no offer was needed",
        terminal: false,
        reEntry: "a later query with no booking behind it starts a new instance",
      },
      {
        id: "a.recheck",
        kind: "action",
        does: "Re-evaluate what is genuinely bookable now rather than reusing what the query returned. Nothing shown at query time was ever held, and an offer of a window that has since gone costs more than sending nothing would",
        next: "c.options",
      },
      {
        id: "c.options",
        kind: "condition",
        asks: "What is actually available now?",
        branches: [
          {
            label: "A near window is bookable",
            when: "capacity exists close enough to what was asked for that it answers the same need",
            to: "a.offer",
          },
          {
            label: "Nothing fits, waitlist exists",
            when: "no window answers the request and the resource supports a waitlist",
            to: "a.waitlist",
          },
          {
            label: "Nothing fits, no waitlist",
            when: "no window answers the request and there is nothing to put the person on",
            to: "x.nothing",
          },
        ],
      },
      {
        id: "a.offer",
        kind: "action",
        does: "Offer the nearest bookable window, labelled as a different window rather than dressed up as the one that was asked for, and say that it is not held. Somebody who wanted one day and is shown another should see that at a glance, not discover it at the point of booking",
        next: "w.respond",
        execution: "communication",
      },
      {
        id: "a.waitlist",
        kind: "action",
        does: "Offer a waitlist place and state that it reserves nothing. Somebody who believes they hold a place they do not hold will plan around it, and that is a worse outcome than being told there was nothing",
        next: "x.waitlisted",
        execution: "communication",
      },
      {
        id: "x.waitlisted",
        kind: "exit",
        state: "waitlisted; nothing is reserved",
        terminal: false,
        reEntry: "capacity reaching the waitlist is that mechanism's business, not a new instance of this one",
      },
      {
        id: "x.nothing",
        kind: "exit",
        state: "nothing to offer; no message sent",
        terminal: false,
        reEntry: "a later query for a window that does have capacity qualifies again",
      },
      {
        id: "w.respond",
        kind: "wait",
        until: [
          "a reservation is created for the offered window",
        ],
        onEvent: "x.booked",
        timeout: {
          after: "the validity of the offered window",
          reason: "the offer was true at one instant only, and the window closing is what makes a second offer a different journey rather than a repeat",
        },
        onTimeout: "x.lapsed",
        windowExtendsOnEngagement: false,
      },
      {
        id: "x.lapsed",
        kind: "exit",
        state: "offer made and not taken",
        terminal: false,
        reEntry: "a new availability query is a new instance; this one is never re-offered",
      },
    ],
    guardrails: [
      "Availability is re-evaluated before the offer is sent. What the query returned was never held and is not evidence of anything now.",
      "A different window is labelled as a different window.",
      "A waitlist place is stated as reserving nothing.",
      "One offer per query. A second offer for the same request is pressure rather than help.",
      "The delay before the offer is bounded and never extended by the person browsing again.",
    ],
    reusableRule:
      "An answer about availability holds nothing, so anything sent afterwards has to be re-checked before it is offered.",
  },
];
