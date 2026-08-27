import type { CanonicalJourney, OrchestrationRule } from "./types";

/* CATEGORY 15 - ORDERS, FULFILLMENT, DELIVERY & SERVICE COMPLETION

   The distance between someone asking for a thing and actually having it.

   The category is domain-neutral. A parcel, an appointment, an installation,
   a professional engagement, a provisioning request and a document all pass
   through the same states, because the states describe an obligation to
   deliver rather than the thing being delivered.

   What makes this category distinct from the financial one next to it is that
   money and delivery are two obligations against the same event, and they
   fail independently. A payment can succeed against an order that can never
   be fulfilled; an order can be delivered against a payment that later
   reverses. Treating either as evidence about the other is the error that
   produces both the undelivered paid order and the delivered unpaid one.

   Six separations carry the weight:

     requested    someone asked
     accepted     we took responsibility for delivering
     fulfillable  the resources to deliver it are committed
     fulfilled    the obligation's scope is satisfied
     dispatched   it is with whoever performs the delivery
     delivered    it arrived
     accepted     the recipient agrees it arrived correctly

   Every arrow between those can fail on its own, and three of them are
   routinely collapsed: accepted read as fulfillable, dispatched read as
   delivered, and delivered read as finished. Each collapse produces a state
   nobody can act on, because the system believes something it has no evidence
   for.

   The category's other spine is partiality. Almost every terminal state here
   can be partial, and FUL-R18 requires each of them to say what remains owed
   - zero, some, replaced, cancelled or unknown. An obligation that ends
   without stating its remainder is one nobody can finish. */

export const FULFILLMENT_RULES: readonly OrchestrationRule[] = [
  {
    id: "FUL-R1",
    scope: "fulfillment",
    rule: "Request, acceptance, availability, allocation, fulfillment and delivery are six separate states.",
    because:
      "Each is a different commitment, and the ones most often collapsed - accepted with fulfillable, dispatched with delivered - are exactly the ones a customer experiences as a promise that was never real.",
  },
  {
    id: "FUL-R2",
    scope: "fulfillment",
    rule: "Acceptance creates an obligation only when the authoritative acceptance criteria are met.",
    because:
      "An obligation created from an unvalidated request is one nobody is working and nobody knows exists, and it surfaces when the customer asks where their order is.",
  },
  {
    id: "FUL-R3",
    scope: "fulfillment",
    rule: "Availability and allocation stay separate wherever resources can be consumed concurrently.",
    because:
      "Availability is a reading taken at a moment. Allocation is a claim. Treating the reading as the claim is how two orders are both promised the last unit.",
  },
  {
    id: "FUL-R4",
    scope: "fulfillment",
    rule: "Allocation and release operations are idempotent.",
    because:
      "A retried allocation that consumes twice oversells without anyone overselling anything, and a retried release returns capacity that was never held.",
  },
  {
    id: "FUL-R5",
    scope: "fulfillment",
    rule: "Partial fulfillment preserves both the completed scope and the remaining scope explicitly.",
    because:
      "Marking a partly-delivered obligation as failed destroys work that was actually done; marking it complete abandons what is still owed. Only carrying both is correct.",
  },
  {
    id: "FUL-R6",
    scope: "fulfillment",
    rule: "Fulfillment exception, delay and terminal failure are three different states.",
    because:
      "One says something went wrong, one says it will be later, and one says it will not happen. Collapsing them either cancels recoverable work or leaves failed work looking merely late.",
  },
  {
    id: "FUL-R7",
    scope: "fulfillment",
    rule: "A delay changes expected timing and does not mean failure.",
    because:
      "An obligation that is late is still owed. Treating lateness as failure releases the resources and closes the obligation the customer is still waiting on.",
  },
  {
    id: "FUL-R8",
    scope: "fulfillment",
    rule: "Substitution or alternative fulfillment respects the approval or choice the policy requires.",
    because:
      "A substitute is a different thing from what was promised. Deciding on the recipient's behalf that it is acceptable is a decision only they can make.",
  },
  {
    id: "FUL-R9",
    scope: "fulfillment",
    rule: "Dispatch and delivery completion are separate states.",
    because:
      "Handing something to a carrier transfers execution and nothing else. The obligation stays ours and stays unresolved until an authoritative outcome exists.",
  },
  {
    id: "FUL-R10",
    scope: "fulfillment",
    rule: "A delivery attempt and a successful delivery are separate outcomes.",
    because:
      "An attempt tells you a van arrived. Whether anything was handed over is a different fact, and the two are reported through the same channel by systems that blur them.",
  },
  {
    id: "FUL-R11",
    scope: "fulfillment",
    rule: "An unknown delivery outcome is reconciled before any unsafe re-execution.",
    because:
      "Re-sending against an unknown produces two of the thing, one of which nobody is expecting and nobody will pay for.",
  },
  {
    id: "FUL-R12",
    scope: "fulfillment",
    rule: "Delivered and accepted stay separate wherever the business semantics require it.",
    because:
      "Where acceptance is contractually meaningful, treating arrival as agreement closes an obligation the counterparty has not agreed is finished.",
  },
  {
    id: "FUL-R13",
    scope: "fulfillment",
    rule: "Cancellation stops only the remaining work and preserves the completed scope.",
    because:
      "Work already delivered happened. A cancellation that erases it produces a record nobody can reconcile against what the customer actually received.",
  },
  {
    id: "FUL-R15",
    scope: "fulfillment",
    rule: "Resource release happens when the resource is no longer required and never touches unrelated or shared allocations.",
    because:
      "A release scoped too widely takes capacity away from obligations that are still going ahead, and those failures appear somewhere else entirely.",
  },
  {
    id: "FUL-R16",
    scope: "fulfillment",
    rule: "Existing fulfillment obligations survive ownership, integration and timing changes unless explicitly resolved.",
    because:
      "The obligation was made to someone outside the organisation. Which team owns it, which system carries it and when it is expected are all our concerns and none of them discharge it.",
  },
  {
    id: "FUL-R17",
    scope: "fulfillment",
    rule: "A stale fulfillment job or event never overwrites newer cancellation, reallocation or completion state.",
    because:
      "Fulfillment events arrive from warehouses, carriers and field systems on their own schedules, so without a version check the most recent decision is the one most likely to be undone.",
  },
  {
    id: "FUL-R18",
    scope: "fulfillment",
    rule: "Every fulfillment terminal state states the remaining obligation explicitly: zero, partial, replaced, cancelled or unresolved.",
    because:
      "An obligation that ends without saying what is left is one nobody can finish, and the remainder is discovered by the person who was waiting for it.",
  },
];

export const FULFILLMENT_JOURNEYS: readonly CanonicalJourney[] = [
  /* ------------------------------------------------------------ FUL-141 */
  {
    id: "FUL-141",
    slug: "fulfillment-request-acceptance",
    category: "fulfillment",
    goal: "eligibility-qualification",
    name: "Fulfillment request → validate → accept, reject or hold",
    purpose:
      "Decide whether we are taking responsibility for delivering something, as a state distinct from having been asked.",
    entity: {
      scope: "the fulfillment request and, once accepted, the obligation it creates",
      note: "Acceptance is where responsibility begins. Before it there is a request; after it there is something we owe, and the two must never be the same record.",
    },
    distinctFrom: [
      {
        journey: "FIN-131",
        because:
          "FIN-131 creates an obligation to pay. This creates an obligation to deliver. They arise from the same event and fail independently - a paid order can be unfulfillable, and a delivered one can go unpaid.",
      },
    ],
    entry: "t.submitted",
    nodes: [
      {
        id: "t.submitted",
        kind: "trigger",
        event: "fulfillment_request_submitted",
        evidence: {
          requires: ["a request to deliver an identified item, service or scope to an identified recipient"],
          insufficientAlone: [
            "a payment succeeding, which discharges a financial obligation and does not by itself create a fulfillment one",
            "an item placed in a basket or a slot browsed",
          ],
          source: "authoritative",
        },
        next: "a.capture",
      },
      {
        id: "a.capture",
        kind: "action",
        does: "Capture the request id, the item or service, the quantity or scope, the recipient, the destination or context, the requested timing, the related transaction or contract, and the submission time",
        writes: [{ field: "fulfillment_log", mode: "append" }],
        next: "a.validate",
      },
      {
        id: "a.validate",
        kind: "action",
        does: "Validate the minimum fulfillment requirements - that what is asked for exists as something we deliver, that the destination is serviceable, that the requester may ask for it, and that the scope is coherent",
        next: "c.valid",
      },
      {
        id: "c.valid",
        kind: "condition",
        asks: "Is the request valid?",
        branches: [
          {
            label: "Valid",
            when: "it passes the minimum requirements for us to consider taking it on",
            to: "c.dependency",
          },
          {
            label: "Invalid",
            when: "it fails a requirement in a way no dependency will resolve",
            to: "a.reject",
          },
        ],
      },
      {
        id: "a.reject",
        kind: "action",
        does: "Record REJECTED with the specific reason. No obligation is created - a hidden obligation behind a rejected request is one nobody is working and nobody knows exists, and it surfaces when the customer asks where their order is",
        writes: [{ field: "fulfillment_log", mode: "append" }],
        next: "x.rejected",
      },
      {
        id: "x.rejected",
        kind: "exit",
        state: "REJECTED; no fulfillment obligation created",
        terminal: false,
        reEntry: "a corrected request is validated on its own terms",
      },
      {
        id: "c.dependency",
        kind: "condition",
        asks: "Is an additional dependency unresolved?",
        branches: [
          {
            label: "Something outstanding",
            when: "a prerequisite, an approval, a document or a confirmation is required before we can take responsibility",
            to: "a.hold",
          },
          {
            label: "Nothing outstanding",
            when: "everything required to accept is present",
            to: "a.accept",
          },
        ],
      },
      {
        id: "a.hold",
        kind: "action",
        does: "Record HOLD / PENDING_REQUIREMENT, naming the specific dependency. A held request is not an accepted one and creates no obligation while it waits",
        writes: [{ field: "fulfillment_log", mode: "append" }],
        next: "w.dependency",
      },
      {
        id: "w.dependency",
        kind: "wait",
        until: ["the named dependency resolves"],
        onEvent: "a.accept",
        timeout: {
          after: "the request's validity window",
          reason:
            "a request held indefinitely against an unresolved dependency is neither accepted nor refused, and the requester cannot tell which they have",
        },
        onTimeout: "x.lapsed",
        windowExtendsOnEngagement: false,
      },
      {
        id: "x.lapsed",
        kind: "exit",
        state: "request lapsed with its dependency unresolved; no obligation created",
        terminal: false,
        reEntry: "a fresh request is validated against whatever the dependency now looks like",
      },
      {
        id: "a.accept",
        kind: "action",
        does: "Record ACCEPTED and create the fulfillment obligation. This is where responsibility for delivery begins, and everything downstream is owed rather than merely requested",
        writes: [{ field: "fulfillment_log", mode: "append" }],
        next: "h.availability",
      },
      {
        id: "h.availability",
        kind: "handoff",
        to: "FUL-142",
        on: "an accepted obligation requiring resources to satisfy it",
        carries: [
          "the obligation, its scope and its requested timing",
          "the explicit fact that nothing has been reserved - acceptance is a promise, not a claim on capacity",
        ],
      },
    ],
    guardrails: [
      "A request received is not a request accepted.",
      "Payment success alone does not mean fulfillment was accepted.",
      "An invalid request never creates a hidden fulfillment obligation.",
    ],
    reusableRule:
      "A fulfillment obligation begins only after the request has passed the conditions required for the business to accept responsibility for delivery.",
  },

  /* ------------------------------------------------------------ FUL-142 */
  {
    id: "FUL-142",
    slug: "fulfillment-availability",
    category: "fulfillment",
    goal: "scheduling-commitment",
    name: "Accepted fulfillment → availability check → allocate, backorder or reject",
    purpose:
      "Establish whether the resources to satisfy an accepted obligation actually exist, in the scope and window that would serve it.",
    entity: {
      scope: "the obligation and the resources it requires, at the location and time that would serve this recipient",
      note: "Availability is scoped. Stock in another region, capacity in another week and a specialist in another discipline are all unavailable for this obligation.",
    },
    distinctFrom: [
      {
        journey: "FUL-143",
        because:
          "This asks whether something exists. FUL-143 claims it. Between the two, someone else can take it - which is why the reading and the claim are separate steps and the claim is the one that counts.",
      },
    ],
    entry: "t.needs-resource",
    nodes: [
      {
        id: "t.needs-resource",
        kind: "trigger",
        event: "accepted_fulfillment_requires_resources",
        evidence: {
          requires: ["an accepted obligation whose satisfaction requires committing a resource or capacity"],
          source: "authoritative",
        },
        next: "a.evaluate",
      },
      {
        id: "a.evaluate",
        kind: "action",
        does: "Evaluate authoritative availability against the relevant scope and time - the location that would serve this destination, the window that would meet this timing, the capability this service needs. Catalog availability is a statement about what we sell; allocatable availability is a statement about what can be committed to this obligation now",
        writes: [{ field: "fulfillment_log", mode: "append" }],
        next: "c.availability",
      },
      {
        id: "c.availability",
        kind: "condition",
        asks: "What is actually available for this obligation?",
        branches: [
          {
            label: "Fully available",
            when: "everything the obligation needs can be committed in the right scope and window",
            to: "h.allocate",
          },
          {
            label: "Partially available",
            when: "some of the scope can be committed and some cannot",
            to: "c.partial",
          },
          {
            label: "Temporarily unavailable",
            when: "the resource is expected to return within a window the obligation can tolerate",
            to: "a.backorder",
          },
          {
            label: "Cannot be fulfilled",
            when: "the resource will not be available within any window this obligation tolerates",
            to: "a.unavailable",
          },
        ],
      },
      {
        id: "c.partial",
        kind: "condition",
        asks: "Does policy permit partial fulfillment of this obligation?",
        branches: [
          {
            label: "Partial permitted",
            when: "the scope divides and delivering part of it is useful to the recipient",
            to: "h.allocate",
          },
          {
            label: "All or nothing",
            when: "the scope does not divide, or a partial delivery would not serve the recipient",
            to: "a.backorder",
          },
        ],
      },
      {
        id: "a.backorder",
        kind: "action",
        does: "Record BACKORDER / WAITING_CAPACITY, naming exactly what is missing and what would resolve it. The obligation stands - it is waiting on capacity rather than failing",
        writes: [{ field: "fulfillment_log", mode: "append" }],
        next: "w.capacity",
      },
      {
        id: "w.capacity",
        kind: "wait",
        until: ["the required resources become available"],
        onEvent: "c.recheck",
        timeout: {
          after: "the obligation's tolerance window",
          reason:
            "an obligation waiting on capacity beyond what it can tolerate has stopped being late and started being unfulfillable, and saying so is better than waiting silently",
        },
        onTimeout: "a.unavailable",
        windowExtendsOnEngagement: false,
      },
      {
        id: "c.recheck",
        kind: "condition",
        asks: "With capacity returned, can the obligation now be served?",
        branches: [
          {
            label: "Now available",
            when: "the returned capacity covers what this obligation needs in its scope and window",
            to: "h.allocate",
          },
          {
            label: "Still short",
            when: "what returned does not cover this obligation, or was taken by another",
            to: "a.unavailable",
          },
        ],
      },
      {
        id: "a.unavailable",
        kind: "action",
        does: "Record FULFILLMENT_UNAVAILABLE with what could not be sourced and why",
        writes: [{ field: "fulfillment_log", mode: "append" }],
        next: "h.unavailable",
      },
      {
        id: "h.unavailable",
        kind: "handoff",
        to: "FUL-150",
        on: "an obligation that cannot be resourced",
        carries: [
          "the obligation and what could not be sourced",
          "the explicit fact that nothing has been allocated, so there is nothing to release - and that any financial consequence is a separate lifecycle",
        ],
      },
      {
        id: "h.allocate",
        kind: "handoff",
        to: "FUL-143",
        on: "resources existing that can serve this obligation",
        carries: [
          "the obligation, the scope to be committed and the resources identified",
          "the explicit fact that availability was read and not yet claimed",
        ],
      },
    ],
    guardrails: [
      "Catalog availability is not allocatable availability.",
      "An accepted order is not allocated inventory.",
      "Concurrent allocation does not oversell - the claim, not the reading, is what commits.",
      "Availability is checked against the scope and time that would actually serve this obligation.",
    ],
    reusableRule:
      "Accepted demand becomes fulfillable only after the resources required to satisfy it have been authoritatively allocated or reserved.",
  },

  /* ------------------------------------------------------------ FUL-143 */
  {
    id: "FUL-143",
    slug: "resource-allocation",
    category: "fulfillment",
    goal: "scheduling-commitment",
    name: "Resource allocation → reserve → confirm, release or reallocate",
    purpose:
      "Bind specific capacity to one obligation until it is consumed or deliberately let go.",
    entity: {
      scope: "the allocation itself - a link between a specific resource quantity and one fulfillment obligation",
      note: "The allocation belongs to one obligation. Releasing it touches only that link, never a shared resource's other claims.",
    },
    entry: "t.selected",
    nodes: [
      {
        id: "t.selected",
        kind: "trigger",
        event: "resource_selected_for_fulfillment",
        evidence: {
          requires: ["a specific resource identified as the one that will serve a specific obligation"],
          source: "authoritative",
        },
        next: "a.reserve",
      },
      {
        id: "a.reserve",
        kind: "action",
        does: "Create the allocation idempotently, storing the resource id, the quantity or capacity, the fulfillment it belongs to, the reservation time, its validity and its status. Idempotency is what stops a retried allocation consuming the resource twice - which is how a system oversells without anyone overselling anything",
        writes: [{ field: "allocation_log", mode: "append" }],
        next: "c.confirmed",
      },
      {
        id: "c.confirmed",
        kind: "condition",
        asks: "Was the reservation confirmed?",
        branches: [
          {
            label: "Confirmed",
            when: "the resource system accepted the claim",
            to: "c.temporary",
          },
          {
            label: "Lost to another claim",
            when: "the resource went between the availability reading and this reservation",
            to: "h.recheck",
          },
        ],
      },
      {
        id: "h.recheck",
        kind: "handoff",
        to: "FUL-142",
        on: "a reservation losing a race for a resource that had appeared available",
        carries: [
          "the obligation and what it still needs",
          "the fact that this is the concurrency the availability check cannot prevent, which is why the claim rather than the reading is what commits",
        ],
      },
      {
        id: "c.temporary",
        kind: "condition",
        asks: "Is this reservation temporary?",
        branches: [
          {
            label: "Temporary",
            when: "the claim expires unless consumed within a window",
            to: "a.temporary",
          },
          {
            label: "Held until consumed or released",
            when: "the claim stands until the obligation uses it or gives it up",
            to: "a.allocated",
          },
        ],
      },
      {
        id: "a.temporary",
        kind: "action",
        does: "Record ALLOCATED with an explicit expiry or release condition. A reservation with no stated end holds scarce capacity against an obligation that may never consume it, and nobody discovers it until the capacity is needed",
        writes: [{ field: "allocation_log", mode: "append" }],
        next: "w.allocation",
      },
      {
        id: "a.allocated",
        kind: "action",
        does: "Record ALLOCATED, held until the obligation consumes it or explicitly releases it",
        writes: [{ field: "allocation_log", mode: "append" }],
        next: "w.allocation",
      },
      {
        id: "w.allocation",
        kind: "wait",
        until: [
          "the fulfillment consumes the allocation",
          "the fulfillment is cancelled or its scope changes",
          "the reserved resource becomes unavailable",
        ],
        onEvent: "c.event",
        timeout: {
          after: "the reservation's validity, where it has one",
          reason:
            "a temporary claim that expires returns the capacity to whoever needs it next, which is the whole reason for making it temporary",
        },
        onTimeout: "a.expire",
        windowExtendsOnEngagement: false,
      },
      {
        id: "c.event",
        kind: "condition",
        asks: "What happened to the allocation?",
        branches: [
          {
            label: "Consumed",
            when: "the fulfillment used it",
            to: "x.consumed",
          },
          {
            label: "No longer required",
            when: "the fulfillment was cancelled, or its scope changed so this resource is not needed",
            to: "a.release",
          },
          {
            label: "The resource itself became unavailable",
            when: "what was reserved is damaged, withdrawn or otherwise gone",
            to: "h.exception",
          },
        ],
      },
      {
        id: "x.consumed",
        kind: "exit",
        state: "allocation consumed by the fulfillment it was made for",
        terminal: false,
        reEntry: "a further resource need on the same obligation is its own allocation",
      },
      {
        id: "a.release",
        kind: "action",
        does: "Release the allocation, scoped strictly to this fulfillment's own reservation. A release that reaches a shared resource's other claims takes capacity from obligations that are still going ahead, and those failures appear somewhere else entirely",
        writes: [{ field: "allocation_log", mode: "append" }],
        next: "x.released",
      },
      {
        id: "x.released",
        kind: "exit",
        state: "released; capacity returned, other claims untouched",
        terminal: false,
        reEntry: "the resource is available to whatever claims it next",
      },
      {
        id: "a.expire",
        kind: "action",
        does: "Expire the temporary reservation and return the capacity, recording that it lapsed rather than being consumed or released - three different endings that mean three different things about the obligation",
        writes: [{ field: "allocation_log", mode: "append" }],
        next: "x.expired",
      },
      {
        id: "x.expired",
        kind: "exit",
        state: "reservation expired unconsumed; obligation still needs resourcing",
        terminal: false,
        reEntry: "the obligation returns to the availability question with nothing held for it",
      },
      {
        id: "h.exception",
        kind: "handoff",
        to: "FUL-145",
        on: "a reserved resource becoming unavailable before it was consumed",
        carries: [
          "the obligation, the lost resource and what it was going to serve",
          "the rest of the allocation, which is unaffected and still held",
        ],
      },
    ],
    guardrails: [
      "Allocation is idempotent.",
      "A cancelled fulfillment does not retain scarce resource.",
      "A release affects only this obligation's allocation, never another's or a shared claim.",
      "A temporary reservation carries an explicit expiry or release condition.",
    ],
    reusableRule:
      "Resource allocation creates a scoped commitment between available capacity and a specific fulfillment obligation until that commitment is consumed or explicitly released.",
  },

  /* ------------------------------------------------------------ FUL-144 */
  {
    id: "FUL-144",
    slug: "fulfillment-execution",
    category: "fulfillment",
    goal: "progression-milestone",
    name: "Fulfillment execution → progress → complete, partial or fail",
    purpose:
      "Track what the obligation's scope actually reaches, rather than what an internal step reported.",
    entity: {
      scope: "the fulfillment obligation and the scope of it that has been satisfied",
      note: "Completion is measured in satisfied scope. An internal task finishing is a fact about the task, and the obligation may be entirely, partly or not at all discharged by it.",
    },
    distinctFrom: [
      {
        journey: "OPS-130",
        because:
          "OPS-130 asks whether a technical job produced the state it claimed. This runs the operational execution of a real delivery obligation, where the outcome is measured in scope satisfied rather than in a state existing.",
      },
    ],
    entry: "t.started",
    nodes: [
      {
        id: "t.started",
        kind: "trigger",
        event: "fulfillment_execution_started",
        evidence: {
          requires: ["an obligation with its resources allocated, entering execution"],
          source: "authoritative",
        },
        next: "a.in-fulfillment",
      },
      {
        id: "a.in-fulfillment",
        kind: "action",
        does: "Record IN_FULFILLMENT and begin tracking meaningful progress where the obligation's scope requires it",
        writes: [{ field: "fulfillment_log", mode: "append" }],
        next: "w.execution",
      },
      {
        id: "w.execution",
        kind: "wait",
        until: ["execution reports an outcome", "a material exception occurs"],
        onEvent: "c.outcome",
        timeout: {
          after: "the expected fulfillment window",
          reason:
            "exceeding the window is a timing problem rather than a failure - the obligation is late and still owed",
        },
        onTimeout: "h.delay",
        windowExtendsOnEngagement: false,
      },
      {
        id: "h.delay",
        kind: "handoff",
        to: "FUL-146",
        on: "fulfillment exceeding its expected window",
        carries: [
          "the obligation, its original commitment and the scope completed so far",
          "the explicit fact that this is delayed rather than failed",
        ],
      },
      {
        id: "c.outcome",
        kind: "condition",
        asks: "What did execution reach?",
        branches: [
          {
            label: "The entire obligation",
            when: "every part of the scope is satisfied",
            to: "a.fulfilled",
          },
          {
            label: "Part of it",
            when: "some of the scope is satisfied and some remains",
            to: "a.partial",
          },
          {
            label: "A recoverable exception",
            when: "something went wrong that may not change what is ultimately delivered",
            to: "h.exception",
          },
          {
            label: "Terminal inability",
            when: "the remaining scope cannot be satisfied at all",
            to: "a.failed",
          },
        ],
      },
      {
        id: "a.fulfilled",
        kind: "action",
        does: "Record FULFILLED - meaning the obligation's scope is satisfied, not that an internal task returned success. Where the business outcome the task was meant to produce has not been confirmed, the task finishing is not fulfillment",
        writes: [{ field: "fulfillment_log", mode: "append" }],
        next: "c.dispatch",
      },
      {
        id: "c.dispatch",
        kind: "condition",
        asks: "Does completion require handing this to a delivery mechanism?",
        branches: [
          {
            label: "Requires dispatch",
            when: "a carrier, technician or other executor has to take it to the recipient",
            to: "h.dispatch",
          },
          {
            label: "Delivered in place",
            when: "satisfying the scope is itself the delivery - a digital service, an in-place provisioning, a completed on-site engagement",
            to: "h.confirm",
          },
        ],
      },
      {
        id: "h.dispatch",
        kind: "handoff",
        to: "FUL-147",
        on: "a prepared item or service passing to a delivery executor",
        carries: [
          "the obligation, the recipient and the destination",
          "the explicit fact that dispatch transfers execution and not the obligation - it stays ours and stays unresolved",
        ],
      },
      {
        id: "h.confirm",
        kind: "handoff",
        to: "FUL-149",
        on: "fulfillment whose completion is itself the delivery",
        carries: ["the obligation and the scope satisfied", "the evidence that it reached the recipient"],
      },
      {
        id: "a.partial",
        kind: "action",
        does: "Record PARTIALLY_FULFILLED and identify exactly what remains owed. The completed scope is preserved - marking the whole obligation failed when a confirmed part succeeded destroys work that was actually done and delivered",
        writes: [{ field: "fulfillment_log", mode: "append" }],
        next: "x.partial",
      },
      {
        id: "x.partial",
        kind: "exit",
        state: "PARTIALLY_FULFILLED; completed scope preserved and remaining scope explicit",
        terminal: false,
        reEntry:
          "the remaining scope continues its own execution. What was delivered is delivered, and what is owed is stated rather than implied",
      },
      {
        id: "h.exception",
        kind: "handoff",
        to: "FUL-145",
        on: "a material exception during execution",
        carries: [
          "the exception and the scope it affects",
          "the scope already completed, which the exception does not touch",
        ],
      },
      {
        id: "a.failed",
        kind: "action",
        does: "Record FAILED_FULFILLMENT for the scope that could not be satisfied, preserving whatever was confirmed complete. The failure is scoped to what actually failed",
        writes: [{ field: "fulfillment_log", mode: "append" }],
        next: "h.remedy",
      },
      {
        id: "h.remedy",
        kind: "handoff",
        to: "FUL-150",
        on: "a scope that cannot be fulfilled",
        carries: [
          "the failed scope and the completed scope, separately",
          "the explicit fact that any financial consequence is a separate lifecycle",
        ],
      },
    ],
    guardrails: [
      "An internal task succeeding is not fulfillment completed where the required business outcome has not been confirmed.",
      "Partial fulfillment preserves exactly what remains owed.",
      "The whole obligation is not marked failed when a confirmed scope was successfully completed.",
    ],
    reusableRule:
      "Fulfillment completion should represent the actual satisfied scope of the obligation rather than the completion of an internal processing step.",
  },

  /* ------------------------------------------------------------ FUL-145 */
  {
    id: "FUL-145",
    slug: "fulfillment-exception",
    category: "fulfillment",
    goal: "recovery-retry",
    name: "Fulfillment exception → diagnose → recover, substitute or fail",
    purpose:
      "Change only the part of an obligation the operational problem actually touches.",
    entity: {
      scope: "the exception and the scope of the obligation it affects",
      note: "Exceptions are scoped. A damaged unit in a multi-item obligation affects that unit, and the rest continues on its way.",
    },
    distinctFrom: [
      {
        journey: "FUL-146",
        because:
          "An exception is something going wrong with the ability to fulfill. A delay is the same obligation arriving later. Where an exception only changes timing, it hands to FUL-146 rather than resolving as one.",
      },
    ],
    entry: "t.exception",
    nodes: [
      {
        id: "t.exception",
        kind: "trigger",
        event: "material_fulfillment_exception",
        evidence: {
          requires: [
            "an operational problem affecting fulfillment: a resource unavailable, a damaged item, a provider unavailable, an incorrect configuration, capacity lost, a destination problem, a dependency failure or a quality failure",
          ],
          insufficientAlone: [
            "a delay on its own, which changes timing rather than the ability to fulfill",
          ],
          source: "authoritative",
        },
        next: "a.classify",
      },
      {
        id: "a.classify",
        kind: "action",
        does: "Classify the exception and the scope it actually affects. A damaged unit in a multi-item obligation affects that unit - the rest of the obligation is untouched and stays on its way, and an exception is not a cancellation of everything around it",
        writes: [{ field: "fulfillment_log", mode: "append" }],
        next: "c.route",
      },
      {
        id: "c.route",
        kind: "condition",
        asks: "What can resolve it?",
        branches: [
          {
            label: "Recoverable without changing the promise",
            when: "the same outcome can still be delivered at the same time",
            to: "a.recover",
          },
          {
            label: "A substitute exists",
            when: "something different could satisfy the obligation",
            to: "c.approval",
          },
          {
            label: "Only the timing changes",
            when: "the promised outcome stands and will arrive later",
            to: "h.delay",
          },
          {
            label: "The obligation cannot be satisfied",
            when: "no recovery, substitute or later date resolves it",
            to: "a.terminal",
          },
        ],
      },
      {
        id: "a.recover",
        kind: "action",
        does: "Recover and resume. The promised outcome and timing both stand, and nothing about the obligation changes",
        writes: [{ field: "fulfillment_log", mode: "append" }],
        next: "h.resume",
      },
      {
        id: "c.approval",
        kind: "condition",
        asks: "Does substituting require approval or a choice?",
        branches: [
          {
            label: "Approval required",
            when: "the substitute differs in a way the recipient would care about",
            to: "w.approval",
          },
          {
            label: "Policy permits it automatically",
            when: "policy defines this substitution as equivalent and pre-approved",
            to: "a.substitute",
          },
        ],
      },
      {
        id: "w.approval",
        kind: "wait",
        until: ["the substitute is approved", "the substitute is declined"],
        onEvent: "c.approved",
        timeout: {
          after: "the approval window",
          reason:
            "no answer is not consent to substitute - the obligation becomes late rather than becoming something different",
        },
        onTimeout: "h.delay",
        windowExtendsOnEngagement: false,
      },
      {
        id: "c.approved",
        kind: "condition",
        asks: "Was the substitute accepted?",
        branches: [
          { label: "Approved", when: "the recipient or the business accepted it", to: "a.substitute" },
          {
            label: "Declined",
            when: "the substitute was refused and nothing else resolves the exception",
            to: "a.terminal",
          },
        ],
      },
      {
        id: "a.substitute",
        kind: "action",
        does: "Apply the substitution, recording what was promised and what is being delivered instead. The obligation is replaced rather than reduced, and its remaining scope is stated in the substitute's terms",
        writes: [{ field: "fulfillment_log", mode: "append" }],
        next: "h.resume",
      },
      {
        id: "h.resume",
        kind: "handoff",
        to: "FUL-144",
        on: "an exception resolved with the obligation continuing",
        carries: [
          "the resolved exception and what changed, if anything",
          "the scope already completed, which the exception never touched",
        ],
      },
      {
        id: "h.delay",
        kind: "handoff",
        to: "FUL-146",
        on: "an exception that changes only when the obligation is met",
        carries: ["the cause and the affected scope", "the original commitment, unchanged in substance"],
      },
      {
        id: "a.terminal",
        kind: "action",
        does: "Record the obligation as unsatisfiable for the affected scope, preserving everything already completed",
        writes: [{ field: "fulfillment_log", mode: "append" }],
        next: "h.terminal",
      },
      {
        id: "h.terminal",
        kind: "handoff",
        to: "FUL-150",
        on: "an exception that ends the affected scope of the obligation",
        carries: [
          "the affected scope and the reason it cannot be satisfied",
          "the completed scope, separately, so cancellation does not reach it",
        ],
      },
    ],
    guardrails: [
      "An exception is not a cancellation.",
      "A substitute is never assumed acceptable where the recipient would care about the difference.",
      "Existing successfully fulfilled scope is preserved through the exception.",
    ],
    reusableRule:
      "Fulfillment exceptions should change only the part of the obligation affected by the actual operational problem.",
  },

  /* ------------------------------------------------------------ FUL-146 */
  {
    id: "FUL-146",
    slug: "fulfillment-delay",
    category: "fulfillment",
    goal: "scheduling-commitment",
    name: "Fulfillment delay → recalculate commitment → continue, reschedule or escalate",
    purpose:
      "Hold lateness as its own state, with the original commitment intact behind whatever the new estimate is.",
    entity: {
      scope: "the obligation and its timing commitment, with the history of what was promised",
      note: "Each revised estimate is appended. Overwriting the original hides a repeated slip, which is the pattern that matters more than any single date.",
    },
    entry: "t.slip",
    nodes: [
      {
        id: "t.slip",
        kind: "trigger",
        event: "expected_fulfillment_timing_slipped",
        evidence: {
          requires: ["a material slip against the timing this obligation was committed to"],
          insufficientAlone: [
            "a slip within the tolerance the commitment already allows",
          ],
          source: "authoritative",
        },
        next: "a.assess",
      },
      {
        id: "a.assess",
        kind: "action",
        does: "Determine the original commitment, the current estimate, the cause, the affected scope and the impact, and record DELAYED. Delayed is a change to timing and not a failure - the obligation is still owed and nothing downstream may treat it as gone",
        writes: [{ field: "fulfillment_log", mode: "append" }],
        next: "c.estimate",
      },
      {
        id: "c.estimate",
        kind: "condition",
        asks: "Is there a reliable new completion estimate?",
        branches: [
          {
            label: "A reliable estimate",
            when: "the cause is understood well enough to predict when it clears",
            to: "a.update",
          },
          {
            label: "No reliable estimate",
            when: "the cause is not understood well enough to name a date that will hold",
            to: "a.no-estimate",
          },
        ],
      },
      {
        id: "a.update",
        kind: "action",
        does: "Update the expected timing, appending to the commitment history. The original commitment is preserved - what was promised and what it became are two facts, and keeping both is the only way a repeated slip becomes visible",
        writes: [{ field: "fulfillment_log", mode: "append" }],
        next: "c.threshold",
      },
      {
        id: "a.no-estimate",
        kind: "action",
        does: "Record that no reliable estimate exists rather than issuing one. Repeatedly promising dates that do not hold costs more trust than admitting the date is unknown, and each broken date makes the next one worth less",
        writes: [{ field: "fulfillment_log", mode: "append" }],
        next: "c.threshold",
      },
      {
        id: "c.threshold",
        kind: "condition",
        asks: "Does the delay exceed the acceptable threshold?",
        branches: [
          {
            label: "Within tolerance",
            when: "the new timing is still inside what the commitment or policy accepts",
            to: "w.resume",
          },
          {
            label: "Beyond tolerance",
            when: "the delay has passed what the commitment or policy accepts",
            to: "c.choice",
          },
        ],
      },
      {
        id: "c.choice",
        kind: "condition",
        asks: "Does the counterparty have a decision to make?",
        branches: [
          {
            label: "They choose",
            when: "real options exist and the choice between them is theirs",
            to: "a.offer",
          },
          {
            label: "Nothing to offer",
            when: "no option exists that they could meaningfully choose between",
            to: "h.escalate",
          },
        ],
      },
      {
        id: "a.offer",
        kind: "action",
        does: "Offer the choices that are actually available - wait, reschedule, an alternative, or cancel. Offering a choice that cannot be honoured is worse than offering none, because it converts a delay into a broken second promise",
        writes: [{ field: "fulfillment_log", mode: "append" }],
        next: "w.decision",
      },
      {
        id: "w.decision",
        kind: "wait",
        until: ["a choice is made"],
        onEvent: "c.decision",
        timeout: {
          after: "the decision window",
          reason:
            "no answer means continue waiting - silence is not consent to cancel something someone is still expecting",
        },
        onTimeout: "w.resume",
        windowExtendsOnEngagement: false,
      },
      {
        id: "c.decision",
        kind: "condition",
        asks: "What did they choose?",
        branches: [
          { label: "Wait", when: "they accept the revised timing", to: "w.resume" },
          { label: "Reschedule", when: "they want a different date or window", to: "a.reschedule" },
          {
            label: "An alternative",
            when: "they would take something different instead",
            to: "h.exception",
          },
          { label: "Cancel", when: "they no longer want it", to: "h.cancel" },
        ],
      },
      {
        id: "a.reschedule",
        kind: "action",
        does: "Record the rescheduled commitment, appended to the history rather than replacing what came before it",
        writes: [{ field: "fulfillment_log", mode: "append" }],
        next: "w.resume",
      },
      {
        id: "w.resume",
        kind: "wait",
        until: ["fulfillment resumes or completes"],
        onEvent: "h.resume",
        timeout: {
          after: "the revised horizon",
          reason:
            "a delay that outlives even its revised horizon has stopped being a timing problem, and communicating about it does not resolve it",
        },
        onTimeout: "h.escalate",
        windowExtendsOnEngagement: false,
      },
      {
        id: "h.resume",
        kind: "handoff",
        to: "FUL-144",
        on: "a delayed obligation resuming",
        carries: [
          "the current commitment and the history of what preceded it",
          "the scope already completed, which the delay never touched",
        ],
      },
      {
        id: "h.exception",
        kind: "handoff",
        to: "FUL-145",
        on: "a counterparty choosing an alternative over waiting",
        carries: ["the alternative they chose", "the obligation as it currently stands"],
      },
      {
        id: "h.cancel",
        kind: "handoff",
        to: "FUL-150",
        on: "a counterparty cancelling rather than waiting",
        carries: [
          "the completed and remaining scope, separately",
          "the delay history, which is the reason and belongs in the record",
        ],
      },
      {
        id: "h.escalate",
        kind: "handoff",
        to: "OWN-55",
        on: "a delay beyond tolerance with nothing to offer, or outliving its revised horizon",
        carries: [
          "the original commitment, every revision and the cause",
          "the fact that communicating about the delay has not resolved the operational problem behind it",
        ],
      },
    ],
    guardrails: [
      "Delayed is not failed.",
      "Dates that will not hold are not promised repeatedly. Where no reliable estimate exists, that is what is said.",
      "A changed ETA preserves the original commitment history.",
      "Communicating a delay does not resolve the operational delay.",
    ],
    reusableRule:
      "A fulfillment delay changes the expected timing of an unresolved obligation without pretending the obligation has failed or disappeared.",
  },

  /* ------------------------------------------------------------ FUL-147 */
  {
    id: "FUL-147",
    slug: "dispatch-and-delivery-tracking",
    category: "fulfillment",
    goal: "delivery-confirmation",
    name: "Dispatch or handoff → track → delivered, failed or unknown",
    purpose:
      "Transfer execution to whoever performs the delivery while the obligation stays ours and stays open.",
    entity: {
      scope: "the handoff to a delivery executor, and the obligation behind it",
      note: "Handing something to a carrier transfers who is doing the work. It transfers nothing about who owes the outcome.",
    },
    distinctFrom: [
      {
        journey: "INT-114",
        because:
          "INT-114 is the generic shape of an external operation. This carries delivery semantics that shape has no room for: a recipient who may refuse, an attempt that is not an outcome, and intermediate tracking updates that look like results and are not.",
      },
    ],
    entry: "t.handoff",
    nodes: [
      {
        id: "t.handoff",
        kind: "trigger",
        event: "fulfillment_handed_to_delivery_executor",
        evidence: {
          requires: ["a prepared item or service passing to a carrier, technician or other delivery executor"],
          insufficientAlone: [
            "a label printed or a job created, which prepares a dispatch rather than performing one",
          ],
          source: "authoritative",
        },
        next: "a.persist",
      },
      {
        id: "a.persist",
        kind: "action",
        does: "Persist the handoff id, the executor, the recipient and destination, the handoff time, the tracking reference where one exists, and the expected delivery window. Record IN_DELIVERY - dispatched is not delivered, and the obligation stays unresolved throughout",
        writes: [{ field: "delivery_log", mode: "append" }],
        next: "w.delivery",
      },
      {
        id: "w.delivery",
        kind: "wait",
        until: [
          "an authoritative delivery confirmation",
          "a confirmed delivery failure",
          "a meaningful delay reported by the executor",
        ],
        onEvent: "c.outcome",
        timeout: {
          after: "the expected delivery window plus its tolerance",
          reason:
            "the window closing means we stopped hearing, which is a fact about our visibility rather than about the parcel - and a provider timeout is not a delivery failure",
        },
        onTimeout: "a.unknown",
        windowExtendsOnEngagement: false,
      },
      {
        id: "c.outcome",
        kind: "condition",
        asks: "What was reported?",
        branches: [
          {
            label: "Delivered",
            when: "the executor authoritatively confirms the recipient has it",
            to: "h.confirm",
          },
          {
            label: "Attempt failed",
            when: "the executor confirms an attempt was made and delivery did not happen",
            to: "h.failed",
          },
          {
            label: "Delayed",
            when: "the executor reports the delivery will be later than the window",
            to: "h.delay",
          },
        ],
      },
      {
        id: "a.unknown",
        kind: "action",
        does: "Record DELIVERY_UNKNOWN. An intermediate tracking update is not a final outcome, and an executor going quiet says nothing about where the item is. Nothing is re-executed while this is unknown, because re-sending against an unknown produces two of the thing",
        writes: [
          { field: "delivery_log", mode: "append" },
          { field: "suppressed_sends", mode: "append" },
        ],
        next: "h.reconcile",
      },
      {
        id: "h.reconcile",
        kind: "handoff",
        to: "external:external-status-reconciliation",
        on: "a delivery whose outcome could not be established",
        carries: [
          "the handoff, the tracking reference and everything the executor last reported",
          "the explicit fact that this is unknown rather than failed, and that nothing is being re-sent",
        ],
        suppresses: ["any re-dispatch of this obligation until its true state is established"],
      },
      {
        id: "h.confirm",
        kind: "handoff",
        to: "FUL-149",
        on: "an authoritative delivery confirmation",
        carries: [
          "the proof of delivery and when it was recorded",
          "the obligation, which delivery may or may not finish depending on whether acceptance applies",
        ],
      },
      {
        id: "h.failed",
        kind: "handoff",
        to: "FUL-148",
        on: "a confirmed failed delivery attempt",
        carries: [
          "the failure as the executor reported it, unclassified",
          "the obligation, which the failed attempt does not discharge",
        ],
      },
      {
        id: "h.delay",
        kind: "handoff",
        to: "FUL-146",
        on: "the executor reporting the delivery will be later",
        carries: ["the revised expectation and its cause", "the original delivery commitment"],
      },
    ],
    guardrails: [
      "Dispatched is not delivered.",
      "A tracking update is not necessarily a final delivery.",
      "A provider timeout is not a delivery failure.",
      "Duplicate delivery events are idempotent.",
    ],
    reusableRule:
      "Handoff transfers execution to a delivery mechanism but the fulfillment remains unresolved until an authoritative delivery outcome exists.",
  },

  /* ------------------------------------------------------------ FUL-148 */
  {
    id: "FUL-148",
    slug: "delivery-attempt-failure",
    category: "fulfillment",
    goal: "recovery-retry",
    name: "Delivery attempt failed → reason → retry, correct, alternate or return",
    purpose:
      "Recover a failed delivery according to why it failed, within a bounded number of attempts.",
    entity: {
      scope: "the individual delivery attempt and the obligation it was serving",
      note: "The obligation survives every failed attempt. What changes is how many attempts remain and what would make the next one work.",
    },
    entry: "t.failed",
    nodes: [
      {
        id: "t.failed",
        kind: "trigger",
        event: "authoritative_delivery_attempt_failure",
        evidence: {
          requires: ["a delivery executor confirming an attempt was made and delivery did not occur"],
          insufficientAlone: [
            "a tracking status that has not advanced, which is silence rather than a failure",
          ],
          source: "authoritative",
        },
        next: "a.classify",
      },
      {
        id: "a.classify",
        kind: "action",
        does: "Classify the failure into the class the executor actually reported. Refused and unavailable are different outcomes - one is a decision by the recipient and the other is an absence, and treating the first as the second keeps redelivering to someone who has already said no",
        writes: [{ field: "delivery_log", mode: "append" }],
        next: "c.class",
      },
      {
        id: "c.class",
        kind: "condition",
        asks: "What kind of failure was it?",
        branches: [
          {
            label: "Correctable information needed",
            when: "the destination is wrong, or access to it is blocked in a way information would resolve",
            to: "a.correct",
          },
          {
            label: "A reattempt is safe",
            when: "the recipient was unavailable, the time window was missed, or the executor itself failed",
            to: "c.budget",
          },
          {
            label: "The recipient refused it",
            when: "someone with authority to refuse did so",
            to: "h.return",
          },
          {
            label: "Damaged",
            when: "what arrived is not what should have been delivered",
            to: "h.exception",
          },
          {
            label: "No usable reason given",
            when: "the executor reported a failure that cannot be turned into an action",
            to: "c.budget",
          },
        ],
      },
      {
        id: "a.correct",
        kind: "action",
        does: "Request the exact correction - the address, the access instruction, the contact. Naming what is missing is what makes it fixable, and a generic notice that delivery failed sends the recipient to guess",
        writes: [{ field: "delivery_log", mode: "append" }],
        next: "w.correction",
      },
      {
        id: "w.correction",
        kind: "wait",
        until: ["the correction is provided"],
        onEvent: "c.budget",
        timeout: {
          after: "the correction window",
          reason:
            "an item held indefinitely awaiting information nobody is providing is one that has to go somewhere, and returning it is the honest ending",
        },
        onTimeout: "h.return",
        windowExtendsOnEngagement: false,
      },
      {
        id: "c.budget",
        kind: "condition",
        asks: "Is a reattempt available within the bounded policy?",
        branches: [
          {
            label: "Attempts remain",
            when: "the policy's attempt limit has not been reached",
            to: "c.alternate",
          },
          {
            label: "Exhausted",
            when: "the attempt limit is reached",
            to: "h.return",
          },
        ],
      },
      {
        id: "c.alternate",
        kind: "condition",
        asks: "Would an alternative route serve better than another attempt at the same one?",
        branches: [
          {
            label: "An alternative is better",
            when: "a collection point, a different window or another executor is more likely to succeed, and policy or the recipient's choice permits it",
            to: "a.alternate",
          },
          {
            label: "Reattempt the same route",
            when: "the original route remains the best option",
            to: "a.reattempt",
          },
        ],
      },
      {
        id: "a.alternate",
        kind: "action",
        does: "Use the alternative route according to policy or the recipient's choice, recorded as a change of route rather than a new obligation",
        writes: [{ field: "delivery_log", mode: "append" }],
        next: "h.retry",
      },
      {
        id: "a.reattempt",
        kind: "action",
        does: "Schedule the bounded reattempt, against the remaining attempt budget rather than a fresh one",
        writes: [{ field: "delivery_log", mode: "append" }],
        next: "h.retry",
      },
      {
        id: "h.retry",
        kind: "handoff",
        to: "FUL-147",
        on: "a further delivery attempt being dispatched",
        carries: [
          "the attempt history and the remaining budget, which does not reset",
          "whatever correction or route change was applied",
        ],
      },
      {
        id: "h.return",
        kind: "handoff",
        to: "REM-151",
        on: "a delivery that cannot be completed - refused, uncorrectable, or out of attempts",
        carries: [
          "the failure classification and the full attempt history",
          "the obligation, which is unresolved rather than discharged - and any financial consequence, which is a separate lifecycle",
        ],
      },
      {
        id: "h.exception",
        kind: "handoff",
        to: "FUL-145",
        on: "an item that arrived damaged",
        carries: [
          "what was damaged and the scope it affects",
          "the fact that this is a fulfillment problem rather than a delivery one - the delivery worked and the thing delivered did not",
        ],
      },
    ],
    guardrails: [
      "Attempted is not delivered.",
      "Delivery is not retried indefinitely - the budget is bounded and does not reset.",
      "Refused and unavailable are different outcomes with different consequences.",
      "The failure reason is never invented. What the executor reported is what is acted on.",
    ],
    reusableRule:
      "Failed delivery attempts should recover according to the reason delivery failed while preserving the original fulfillment obligation until its terminal outcome is known.",
  },

  /* ------------------------------------------------------------ FUL-149 */
  {
    id: "FUL-149",
    slug: "delivery-acceptance-finalization",
    category: "fulfillment",
    goal: "delivery-confirmation",
    name: "Delivery confirmation → acceptance or issue window → finalize",
    purpose:
      "Separate arriving from being agreed to have arrived correctly, wherever that difference has business meaning.",
    entity: {
      scope: "the delivered fulfillment and the recipient whose acceptance may still be required",
      note: "Proof of delivery stays attached to the delivery record. Finalisation is a later state and does not supersede the evidence that produced it.",
    },
    entry: "t.delivered",
    nodes: [
      {
        id: "t.delivered",
        kind: "trigger",
        event: "authoritative_delivery_completion",
        evidence: {
          requires: ["an authoritative confirmation that the recipient has what was owed"],
          source: "authoritative",
        },
        next: "a.record",
      },
      {
        id: "a.record",
        kind: "action",
        does: "Record DELIVERED with the proof of delivery, which stays attached to the delivery history rather than being superseded by whatever finalisation follows",
        writes: [{ field: "delivery_log", mode: "append" }],
        next: "c.acceptance",
      },
      {
        id: "c.acceptance",
        kind: "condition",
        asks: "Does this fulfillment require explicit acceptance?",
        branches: [
          {
            label: "Acceptance required",
            when: "the contract or the nature of the work means the recipient has to agree it is correct",
            to: "w.acceptance",
          },
          {
            label: "No acceptance required",
            when: "delivery itself discharges the obligation",
            to: "c.window",
          },
        ],
      },
      {
        id: "w.acceptance",
        kind: "wait",
        until: ["the recipient accepts", "the recipient raises an issue"],
        onEvent: "c.response",
        timeout: {
          after: "the acceptance deadline defined by the contract or policy",
          reason:
            "deemed acceptance after a stated period is a policy position; inventing one where none exists closes an obligation the counterparty never agreed was finished",
        },
        onTimeout: "a.finalize",
        windowExtendsOnEngagement: false,
      },
      {
        id: "c.response",
        kind: "condition",
        asks: "What did the recipient do?",
        branches: [
          { label: "Accepted", when: "they confirmed it is correct", to: "a.finalize" },
          { label: "Raised an issue", when: "they say something is wrong with it", to: "h.issue" },
        ],
      },
      {
        id: "c.window",
        kind: "condition",
        asks: "Does policy define a post-delivery issue window?",
        branches: [
          {
            label: "A window exists",
            when: "policy gives the recipient a defined period to raise a problem",
            to: "w.window",
          },
          {
            label: "No window defined",
            when: "policy defines completion at delivery",
            to: "a.finalize",
          },
        ],
      },
      {
        id: "w.window",
        kind: "wait",
        until: ["an issue is raised"],
        onEvent: "h.issue",
        timeout: {
          after: "the issue window closing",
          reason:
            "the window ending without an issue is the ordinary path to completion, and no acceptance window is invented beyond what policy defines",
        },
        onTimeout: "a.finalize",
        windowExtendsOnEngagement: false,
      },
      {
        id: "h.issue",
        kind: "handoff",
        to: "REM-151",
        on: "an issue raised within a valid post-delivery window",
        carries: [
          "the delivery record and its proof",
          "what the recipient says is wrong, in their words",
        ],
      },
      {
        id: "a.finalize",
        kind: "action",
        does: "Record FINALIZED. This closes the fulfillment relationship and does not erase rights that policy independently provides afterwards - a warranty, a statutory return period or a service guarantee all survive finalisation and are not what this state was measuring",
        writes: [{ field: "fulfillment_log", mode: "append" }],
        next: "x.finalized",
      },
      {
        id: "x.finalized",
        kind: "exit",
        state: "FINALIZED; the obligation is discharged and the remaining scope is zero",
        terminal: false,
        reEntry:
          "later rights that policy provides independently are exercised on their own terms and do not reopen this state",
      },
    ],
    guardrails: [
      "Delivered is not accepted where acceptance is contractually meaningful.",
      "No acceptance window is invented beyond what policy defines.",
      "Proof of delivery remains attached to the delivery history.",
      "Finalisation does not erase later rights that policy independently provides.",
    ],
    reusableRule:
      "Delivery establishes receipt; final fulfillment completion may additionally depend on acceptance or a defined post-delivery resolution window.",
  },

  /* ------------------------------------------------------------ FUL-150 */
  {
    id: "FUL-150",
    slug: "fulfillment-cancellation",
    category: "fulfillment",
    goal: "cancellation-termination",
    name: "Fulfillment cancellation → stop future work → release resources → reconcile",
    purpose:
      "Stop what remains of an obligation while keeping everything that already happened.",
    entity: {
      scope: "the obligation, split into what is completed, what is in progress and what has not started",
      note: "The three scopes are treated separately throughout. Collapsing them either discards delivered work or cancels nothing at all.",
    },
    distinctFrom: [
      {
        journey: "FIN-137",
        because:
          "Stopping a delivery and returning money are different decisions with different authority. Coupling them either refunds what was delivered or delivers what was refunded, and this journey hands the financial question to the lifecycle that owns it.",
      },
    ],
    entry: "t.effective",
    nodes: [
      {
        id: "t.effective",
        kind: "trigger",
        event: "fulfillment_cancellation_effective",
        evidence: {
          requires: ["an authoritative cancellation that has taken effect on the obligation"],
          insufficientAlone: [
            "a cancellation requested, which is an intent until it becomes effective",
          ],
          source: "authoritative",
        },
        next: "a.record",
      },
      {
        id: "a.record",
        kind: "action",
        does: "Record the cancellation source, the reason, the effective time, and the three scopes separately - what is completed, what is in progress and what has not started. They are treated differently throughout, and collapsing them either discards delivered work or cancels nothing at all",
        writes: [{ field: "fulfillment_log", mode: "append" }],
        next: "a.stop",
      },
      {
        id: "a.stop",
        kind: "action",
        does: "Stop the future work that can still be stopped, scoped to the unstarted portion and whatever in-progress work can be halted safely",
        writes: [{ field: "suppressed_sends", mode: "append" }],
        next: "a.release",
      },
      {
        id: "a.release",
        kind: "action",
        does: "Release the allocations and reservations this obligation no longer needs, scoped strictly to its own. A release that reaches a shared allocation or another obligation's claim takes capacity from work that is still going ahead",
        writes: [{ field: "allocation_log", mode: "append" }],
        next: "c.completed",
      },
      {
        id: "c.completed",
        kind: "condition",
        asks: "Has any scope already been completed?",
        branches: [
          {
            label: "Some was completed",
            when: "part of the obligation was satisfied before the cancellation took effect",
            to: "a.preserve",
          },
          {
            label: "Nothing completed",
            when: "no scope was satisfied",
            to: "c.dispatched",
          },
        ],
      },
      {
        id: "a.preserve",
        kind: "action",
        does: "Preserve the completed scope. Cancellation stops what remains; it does not pretend what was delivered never happened, and a record that erases it cannot be reconciled against what the recipient actually has",
        writes: [{ field: "fulfillment_log", mode: "append" }],
        next: "c.dispatched",
      },
      {
        id: "c.dispatched",
        kind: "condition",
        asks: "Has any of it already been handed to a delivery executor?",
        branches: [
          {
            label: "Already dispatched",
            when: "something is with a carrier or executor and may still arrive",
            to: "a.intercept",
          },
          {
            label: "Nothing dispatched",
            when: "nothing left our hands",
            to: "c.external",
          },
        ],
      },
      {
        id: "a.intercept",
        kind: "action",
        does: "Determine and initiate the intercept or return path where one is supported. Where it is not, the item completes its delivery and the return happens afterwards - a cancellation does not reach into a van, and pretending it does leaves an unexpected delivery nobody has recorded",
        writes: [{ field: "delivery_log", mode: "append" }],
        next: "c.external",
      },
      {
        id: "c.external",
        kind: "condition",
        asks: "Is an external dependency involved in the cancellation?",
        branches: [
          {
            label: "External party involved",
            when: "a supplier, executor or provider has to act for the cancellation to be real",
            to: "a.verify",
          },
          {
            label: "Internal only",
            when: "nothing outside our systems needs to change",
            to: "c.financial",
          },
        ],
      },
      {
        id: "a.verify",
        kind: "action",
        does: "Verify the cancellation actually took effect at the external party rather than assuming it did. A cancellation accepted by our system and not by theirs still produces the thing we cancelled",
        writes: [{ field: "fulfillment_log", mode: "append" }],
        next: "c.financial",
      },
      {
        id: "c.financial",
        kind: "condition",
        asks: "Does the cancellation carry a financial consequence?",
        branches: [
          {
            label: "Money is involved",
            when: "something was paid for scope that will not now be delivered, or a charge applies to the cancellation itself",
            to: "h.financial",
          },
          {
            label: "No financial consequence",
            when: "nothing was paid, or what was paid matches what was delivered",
            to: "x.cancelled",
          },
        ],
      },
      {
        id: "h.financial",
        kind: "handoff",
        to: "FIN-137",
        on: "a cancellation with a financial consequence",
        carries: [
          "the completed scope and the cancelled scope, separately, so the refund decision is made against what was actually not delivered",
          "the explicit fact that this journey has not decided whether a refund is owed",
        ],
      },
      {
        id: "x.cancelled",
        kind: "exit",
        state: "cancelled; remaining obligation stopped, completed scope preserved",
        terminal: false,
        reEntry:
          "the remaining obligation is explicitly zero for the cancelled scope and unchanged for whatever was delivered. A new request for the same thing is a new obligation",
      },
    ],
    guardrails: [
      "A cancellation requested is not a cancellation.",
      "A cancellation for fraud, compliance or manual review suppresses recovery outreach entirely. The reason it was cancelled is the reason not to chase it.",
      "Recovery is scoped to the specific obligation that was cancelled. A later unrelated purchase does not close it, and counting one as a recovery overstates what the intervention did.",
      "Cancellation does not erase completed fulfillment history.",
      "Resource release affects only unused allocation belonging to this obligation.",
      "A financial refund is a separate lifecycle with its own decision.",
    ],
    reusableRule:
      "Fulfillment cancellation stops the remaining obligation while preserving and reconciling any work or side effects that already occurred.",
  },
];
