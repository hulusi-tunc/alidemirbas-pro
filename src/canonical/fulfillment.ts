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
    channels: [],
    name: "Fulfillment request → validate → accept, reject or hold",
    shortName: "Fulfillment Request Validation",
    purpose:
      "Decide whether we are taking responsibility for delivering something, as a state distinct from having been asked.",
    entity: {
      scope: "the fulfillment request and, once accepted, the obligation it creates",
      note: "Acceptance is where responsibility begins. Before it there is a request; after it there is something we owe, and the two must never be the same record.",
      instanceKey: [
        "request_id"
      ],
      concurrency: "one-active-per-key"
    },
    distinctFrom: [
      {
        journey: "FIN-131",
        because:
          "FIN-131 creates an obligation to pay. This creates an obligation to deliver. They arise from the same event and fail independently - a paid order can be unfulfillable, and a delivered one can go unpaid.",
      },
    ],
    objective: "Decide whether we are taking responsibility for delivering something, as a state distinct from having been asked.",
    eligibility: [
      "a request to deliver an identified item, service or scope to an identified recipient",
      "no instance of this journey is already open for the the fulfillment request and",
      "hard gates (GLB-31) allow communication for this purpose"
    ],
    suppressions: [
      {
        "id": "s.g1",
        "label": "CANONICAL_RULE",
        "text": "A request received is not a request accepted."
      },
      {
        "id": "s.g2",
        "label": "CANONICAL_RULE",
        "text": "Payment success alone does not mean fulfillment was accepted."
      },
      {
        "id": "s.g3",
        "label": "CANONICAL_RULE",
        "text": "An invalid request never creates a hidden fulfillment obligation."
      }
    ],
    implementation: {
      "attributes": {
        "required": [
          "request_id",
          "requested_scope",
          "recipient_id",
          "validity_checks",
          "dependencies",
          "fulfillment_log"
        ],
        "optional": [
          "obligation_id"
        ]
      }
    },
    measurement: {
      "journeyOutcome": {
        "type": "exit-or-handoff",
        "refs": [
          "x.rejected",
          "x.lapsed",
          "h.availability"
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
        "fulfillment request validation",
        "order acceptance",
        "order validation",
        "accept or reject a fulfilment request"
      ],
      "useCases": [
        "deciding whether responsibility for delivering something is taken",
        "a request held on an unresolved dependency until it lapses or clears"
      ]
    },
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
        idempotencyKey: "request_id + a.capture",
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
        idempotencyKey: "request_id + a.reject",
      },
      {
        id: "x.rejected",
        kind: "exit",
        state: "REJECTED; no fulfillment obligation created",
        terminal: false,
        reEntry: "a corrected request is validated on its own terms",
        class: "invalid-state",
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
        idempotencyKey: "request_id + a.hold",
      },
      {
        id: "w.dependency",
        kind: "wait",
        until: [
          "dependency_resolved"
        ],
        onEvent: "a.accept",
        timeout: {
          "after": {
            "key": "fulfillment_request.dependency",
            "rule": "The request's validity window.",
            "class": "observation-window",
            "required": true
          },
          "reason": "a request held indefinitely against an unresolved dependency is neither accepted nor refused, and the requester cannot tell which they have",
          "relativeTo": "trigger"
        },
        onTimeout: "x.lapsed",
        windowExtendsOnEngagement: false,
        recheck: "the the fulfillment request and re-read from the system of record before acting on the timeout",
      },
      {
        id: "x.lapsed",
        kind: "exit",
        state: "request lapsed with its dependency unresolved; no obligation created",
        terminal: false,
        reEntry: "a fresh request is validated against whatever the dependency now looks like",
        class: "timeout",
      },
      {
        id: "a.accept",
        kind: "action",
        does: "Record ACCEPTED and create the fulfillment obligation. This is where responsibility for delivery begins, and everything downstream is owed rather than merely requested",
        writes: [{ field: "fulfillment_log", mode: "append" }],
        next: "h.availability",
        idempotencyKey: "request_id + a.accept",
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
    channels: [],
    name: "Accepted fulfillment → availability check → allocate, backorder or reject",
    shortName: "Fulfillment Allocation",
    purpose:
      "Establish whether the resources to satisfy an accepted obligation actually exist, in the scope and window that would serve it.",
    entity: {
      scope: "the obligation and the resources it requires, at the location and time that would serve this recipient",
      note: "Availability is scoped. Stock in another region, capacity in another week and a specialist in another discipline are all unavailable for this obligation.",
      instanceKey: [
        "obligation_id"
      ],
      concurrency: "one-active-per-key"
    },
    distinctFrom: [
      {
        journey: "FUL-143",
        because:
          "This asks whether something exists. FUL-143 claims it. Between the two, someone else can take it - which is why the reading and the claim are separate steps and the claim is the one that counts.",
      },
    ],
    objective: "Establish whether the resources to satisfy an accepted obligation actually exist, in the scope and window that would serve it.",
    eligibility: [
      "an accepted obligation whose satisfaction requires committing a resource or capacity",
      "no instance of this journey is already open for the the obligation and the resources it requires",
      "hard gates (GLB-31) allow communication for this purpose"
    ],
    suppressions: [
      {
        "id": "s.g1",
        "label": "CANONICAL_RULE",
        "text": "Catalog availability is not allocatable availability."
      },
      {
        "id": "s.g2",
        "label": "CANONICAL_RULE",
        "text": "An accepted order is not allocated inventory."
      },
      {
        "id": "s.g3",
        "label": "CANONICAL_RULE",
        "text": "Concurrent allocation does not oversell - the claim, not the reading, is what commits."
      },
      {
        "id": "s.g4",
        "label": "CANONICAL_RULE",
        "text": "Availability is checked against the scope and time that would actually serve this obligation."
      }
    ],
    implementation: {
      "attributes": {
        "required": [
          "obligation_id",
          "required_resources",
          "location",
          "service_window",
          "partial_policy",
          "fulfillment_log"
        ],
        "optional": []
      }
    },
    measurement: {
      "journeyOutcome": {
        "type": "handoff",
        "refs": [
          "h.unavailable",
          "h.allocate"
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
        "fulfillment allocation",
        "availability check",
        "inventory availability",
        "capacity check"
      ],
      "useCases": [
        "whether allocatable resources exist for an accepted obligation, in its scope and window",
        "partial availability decided against policy rather than assumed"
      ]
    },
    entry: "t.needs-resource",
    nodes: [
      {
        id: "t.needs-resource",
        kind: "trigger",
        event: "accepted_fulfillment_requires_resources",
        evidence: {
          requires: ["an accepted obligation whose satisfaction requires committing a resource or capacity"],
          insufficientAlone: [
            "a catalog availability figure",
            "an order accepted with no resource requirement",
            "a payment succeeding"
          ],
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
        idempotencyKey: "obligation_id + a.evaluate",
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
        idempotencyKey: "obligation_id + a.backorder",
      },
      {
        id: "w.capacity",
        kind: "wait",
        until: [
          "resources_available"
        ],
        onEvent: "c.recheck",
        timeout: {
          "after": {
            "key": "fulfillment_availability.capacity",
            "rule": "The obligation's tolerance window.",
            "class": "observation-window",
            "required": true
          },
          "reason": "an obligation waiting on capacity beyond what it can tolerate has stopped being late and started being unfulfillable, and saying so is better than waiting silently",
          "relativeTo": "trigger"
        },
        onTimeout: "a.unavailable",
        windowExtendsOnEngagement: false,
        recheck: "the the obligation and the resources it requires re-read from the system of record before acting on the timeout",
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
        idempotencyKey: "obligation_id + a.unavailable",
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
    channels: [],
    name: "Resource allocation → reserve → confirm, release or reallocate",
    shortName: "Resource Reservation",
    purpose:
      "Bind specific capacity to one obligation until it is consumed or deliberately let go.",
    entity: {
      scope: "the allocation itself - a link between a specific resource quantity and one fulfillment obligation",
      note: "The allocation belongs to one obligation. Releasing it touches only that link, never a shared resource's other claims.",
      instanceKey: [
        "allocation_id"
      ],
      concurrency: "one-active-per-key"
    },
    objective: "Bind specific capacity to one obligation until it is consumed or deliberately let go.",
    eligibility: [
      "a specific resource identified as the one that will serve a specific obligation",
      "no instance of this journey is already open for the the allocation itself",
      "hard gates (GLB-31) allow communication for this purpose"
    ],
    suppressions: [
      {
        "id": "s.g1",
        "label": "CANONICAL_RULE",
        "text": "Allocation is idempotent."
      },
      {
        "id": "s.g2",
        "label": "CANONICAL_RULE",
        "text": "A cancelled fulfillment does not retain scarce resource."
      },
      {
        "id": "s.g3",
        "label": "CANONICAL_RULE",
        "text": "A release affects only this obligation's allocation, never another's or a shared claim."
      },
      {
        "id": "s.g4",
        "label": "CANONICAL_RULE",
        "text": "A temporary reservation carries an explicit expiry or release condition."
      }
    ],
    implementation: {
      "attributes": {
        "required": [
          "allocation_id",
          "obligation_id",
          "resource_ref",
          "quantity",
          "reservation_expires_at",
          "allocation_log"
        ],
        "optional": []
      }
    },
    measurement: {
      "journeyOutcome": {
        "type": "exit-or-handoff",
        "refs": [
          "x.consumed",
          "x.released",
          "x.expired",
          "h.recheck",
          "h.exception"
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
        "resource reservation",
        "inventory reservation",
        "hold stock for an order",
        "capacity hold"
      ],
      "useCases": [
        "specific capacity bound to one obligation until consumed or released",
        "a temporary reservation expiring unconsumed"
      ]
    },
    entry: "t.selected",
    nodes: [
      {
        id: "t.selected",
        kind: "trigger",
        event: "resource_selected_for_fulfillment",
        evidence: {
          requires: ["a specific resource identified as the one that will serve a specific obligation"],
          insufficientAlone: [
            "a catalog quantity being positive",
            "an order accepted before a specific resource is identified",
            "a reservation request that lost its race for the resource"
          ],
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
        idempotencyKey: "allocation_id + a.reserve",
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
        idempotencyKey: "allocation_id + a.temporary",
      },
      {
        id: "a.allocated",
        kind: "action",
        does: "Record ALLOCATED, held until the obligation consumes it or explicitly releases it",
        writes: [{ field: "allocation_log", mode: "append" }],
        next: "w.allocation",
        idempotencyKey: "allocation_id + a.allocated",
      },
      {
        id: "w.allocation",
        kind: "wait",
        until: [
          "allocation_consumed",
          "fulfillment_cancelled_or_changed",
          "reserved_resource_unavailable"
        ],
        onEvent: "c.event",
        timeout: {
          "after": {
            "key": "resource_allocation.allocation",
            "rule": "The reservation's validity, where it has one.",
            "class": "attribute-bound",
            "required": true
          },
          "reason": "a temporary claim that expires returns the capacity to whoever needs it next, which is the whole reason for making it temporary",
          "relativeTo": "attribute",
          "attribute": "reservation_expires_at"
        },
        onTimeout: "a.expire",
        windowExtendsOnEngagement: false,
        recheck: "the the allocation itself re-read from the system of record before acting on the timeout",
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
        class: "success",
      },
      {
        id: "a.release",
        kind: "action",
        does: "Release the allocation, scoped strictly to this fulfillment's own reservation. A release that reaches a shared resource's other claims takes capacity from obligations that are still going ahead, and those failures appear somewhere else entirely",
        writes: [{ field: "allocation_log", mode: "append" }],
        next: "x.released",
        idempotencyKey: "allocation_id + a.release",
      },
      {
        id: "x.released",
        kind: "exit",
        state: "released; capacity returned, other claims untouched",
        terminal: false,
        reEntry: "the resource is available to whatever claims it next",
        class: "success",
      },
      {
        id: "a.expire",
        kind: "action",
        does: "Expire the temporary reservation and return the capacity, recording that it lapsed rather than being consumed or released - three different endings that mean three different things about the obligation",
        writes: [{ field: "allocation_log", mode: "append" }],
        next: "x.expired",
        idempotencyKey: "allocation_id + a.expire",
      },
      {
        id: "x.expired",
        kind: "exit",
        state: "reservation expired unconsumed; obligation still needs resourcing",
        terminal: false,
        reEntry: "the obligation returns to the availability question with nothing held for it",
        class: "timeout",
      },
      {
        id: "h.exception",
        kind: "handoff",
        to: "FUL-145",
        on: "a reserved resource becoming unavailable before it was consumed",
        carries: [
          "the obligation, the lost resource and what it was going to serve",
          "the rest of the allocation, which is unaffected and still held",
          "a fresh exception_id minted at this handoff, deterministically derived from allocation_id and the lost resource, so FUL-145 can construct its own instance",
        ],
        contract: { requiredFields: ["exception_id"] },
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
    channels: [],
    name: "Fulfillment execution → progress → complete, partial or fail",
    shortName: "Fulfillment Execution",
    purpose:
      "Track what the obligation's scope actually reaches, rather than what an internal step reported.",
    entity: {
      scope: "the fulfillment obligation and the scope of it that has been satisfied",
      note: "Completion is measured in satisfied scope. An internal task finishing is a fact about the task, and the obligation may be entirely, partly or not at all discharged by it.",
      instanceKey: [
        "obligation_id"
      ],
      concurrency: "one-active-per-key"
    },
    distinctFrom: [
      {
        journey: "OPS-130",
        because:
          "OPS-130 asks whether a technical job produced the state it claimed. This runs the operational execution of a real delivery obligation, where the outcome is measured in scope satisfied rather than in a state existing.",
      },
    ],
    objective: "Track what the obligation's scope actually reaches, rather than what an internal step reported.",
    eligibility: [
      "an obligation with its resources allocated, entering execution",
      "no instance of this journey is already open for the the fulfillment obligation and the scope of it that has been satisfied",
      "hard gates (GLB-31) allow communication for this purpose"
    ],
    suppressions: [
      {
        "id": "s.g1",
        "label": "CANONICAL_RULE",
        "text": "An internal task succeeding is not fulfillment completed where the required business outcome has not been confirmed."
      },
      {
        "id": "s.g2",
        "label": "CANONICAL_RULE",
        "text": "Partial fulfillment preserves exactly what remains owed."
      },
      {
        "id": "s.g3",
        "label": "CANONICAL_RULE",
        "text": "The whole obligation is not marked failed when a confirmed scope was successfully completed."
      }
    ],
    implementation: {
      "attributes": {
        "required": [
          "obligation_id",
          "allocated_resources",
          "expected_window",
          "satisfied_scope",
          "remaining_scope",
          "fulfillment_log"
        ],
        "optional": []
      }
    },
    measurement: {
      "journeyOutcome": {
        "type": "exit-or-handoff",
        "refs": [
          "x.partial",
          "h.delay",
          "h.dispatch",
          "h.confirm",
          "h.exception",
          "h.remedy"
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
        "fulfillment execution",
        "order in progress",
        "service delivery progress",
        "execution tracking"
      ],
      "useCases": [
        "what the obligation's scope actually reached, rather than what a step reported",
        "partial fulfilment preserving exactly what remains owed"
      ]
    },
    entry: "t.started",
    nodes: [
      {
        id: "t.started",
        kind: "trigger",
        event: "fulfillment_execution_started",
        evidence: {
          requires: ["an obligation with its resources allocated, entering execution"],
          insufficientAlone: [
            "a task started inside an internal system with no allocation behind it",
            "a dispatch label created",
            "a payment"
          ],
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
        idempotencyKey: "obligation_id + a.in-fulfillment",
      },
      {
        id: "w.execution",
        kind: "wait",
        until: [
          "execution_outcome_reported",
          "fulfillment_exception"
        ],
        onEvent: "c.outcome",
        timeout: {
          "after": {
            "key": "fulfillment_execution.execution",
            "rule": "The expected fulfillment window.",
            "class": "observation-window",
            "required": true
          },
          "reason": "exceeding the window is a timing problem rather than a failure - the obligation is late and still owed",
          "relativeTo": "trigger"
        },
        onTimeout: "h.delay",
        windowExtendsOnEngagement: false,
        recheck: "the the fulfillment obligation and the scope of it that has been satisfied re-read from the system of record before acting on the timeout",
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
        idempotencyKey: "obligation_id + a.fulfilled",
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
          "a fresh dispatch_id minted at this handoff, deterministically derived from obligation_id and the executor it was handed to, so FUL-147 can construct its own instance",
        ],
        contract: { requiredFields: ["dispatch_id"] },
      },
      {
        id: "h.confirm",
        kind: "handoff",
        to: "FUL-149",
        on: "fulfillment whose completion is itself the delivery",
        carries: [
          "the obligation and the scope satisfied",
          "the evidence that it reached the recipient",
          "a fresh delivery_id minted at this handoff, deterministically derived from obligation_id and the confirmed-delivery evidence, so FUL-149 can construct its own instance",
        ],
        contract: { requiredFields: ["obligation_id", "delivery_id"] },
      },
      {
        id: "a.partial",
        kind: "action",
        does: "Record PARTIALLY_FULFILLED and identify exactly what remains owed. The completed scope is preserved - marking the whole obligation failed when a confirmed part succeeded destroys work that was actually done and delivered",
        writes: [{ field: "fulfillment_log", mode: "append" }],
        next: "x.partial",
        idempotencyKey: "obligation_id + a.partial",
      },
      {
        id: "x.partial",
        kind: "exit",
        state: "PARTIALLY_FULFILLED; completed scope preserved and remaining scope explicit",
        terminal: false,
        reEntry:
          "the remaining scope continues its own execution. What was delivered is delivered, and what is owed is stated rather than implied",
        class: "success",
      },
      {
        id: "h.exception",
        kind: "handoff",
        to: "FUL-145",
        on: "a material exception during execution",
        carries: [
          "the exception and the scope it affects",
          "the scope already completed, which the exception does not touch",
          "a fresh exception_id minted at this handoff, deterministically derived from obligation_id and the exception's own scope, so FUL-145 can construct its own instance",
        ],
        contract: { requiredFields: ["exception_id"] },
      },
      {
        id: "a.failed",
        kind: "action",
        does: "Record FAILED_FULFILLMENT for the scope that could not be satisfied, preserving whatever was confirmed complete. The failure is scoped to what actually failed",
        writes: [{ field: "fulfillment_log", mode: "append" }],
        next: "h.remedy",
        idempotencyKey: "obligation_id + a.failed",
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
    channels: [],
    name: "Fulfillment exception → diagnose → recover, substitute or fail",
    shortName: "Fulfillment Exception Recovery",
    purpose:
      "Change only the part of an obligation the operational problem actually touches.",
    entity: {
      scope: "the exception and the scope of the obligation it affects",
      note: "Exceptions are scoped. A damaged unit in a multi-item obligation affects that unit, and the rest continues on its way.",
      instanceKey: [
        "exception_id"
      ],
      concurrency: "one-active-per-key"
    },
    distinctFrom: [
      {
        journey: "FUL-146",
        because:
          "An exception is something going wrong with the ability to fulfill. A delay is the same obligation arriving later. Where an exception only changes timing, it hands to FUL-146 rather than resolving as one.",
      },
    ],
    objective: "Change only the part of an obligation the operational problem actually touches.",
    eligibility: [
      "an operational problem affecting fulfillment: a resource unavailable, a damaged item, a provider unavailable, an incorrect configuration, capacity lost, a destination problem, a dependency failure or a quality failure",
      "no instance of this journey is already open for the the exception and the scope of the obligation it affects",
      "hard gates (GLB-31) allow communication for this purpose"
    ],
    suppressions: [
      {
        "id": "s.g1",
        "label": "CANONICAL_RULE",
        "text": "An exception is not a cancellation."
      },
      {
        "id": "s.g2",
        "label": "CANONICAL_RULE",
        "text": "A substitute is never assumed acceptable where the recipient would care about the difference."
      },
      {
        "id": "s.g3",
        "label": "CANONICAL_RULE",
        "text": "Existing successfully fulfilled scope is preserved through the exception."
      }
    ],
    implementation: {
      "attributes": {
        "required": [
          "exception_id",
          "obligation_id",
          "affected_scope",
          "substitute_candidate",
          "approval_policy",
          "fulfillment_log"
        ],
        "optional": []
      }
    },
    measurement: {
      "journeyOutcome": {
        "type": "handoff",
        "refs": [
          "h.resume",
          "h.delay",
          "h.terminal"
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
        "fulfillment exception recovery",
        "supply exception",
        "damaged item handling",
        "out-of-stock after order"
      ],
      "useCases": [
        "an operational problem changing only the part of the obligation it touches",
        "a substitute offered only with approval where the recipient must choose"
      ]
    },
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
        idempotencyKey: "obligation_id + a.classify",
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
        idempotencyKey: "obligation_id + a.recover",
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
        until: [
          "substitute_approved",
          "substitute_declined"
        ],
        onEvent: "c.approved",
        timeout: {
          "after": {
            "key": "fulfillment_exception.approval",
            "rule": "The approval window.",
            "class": "response-window",
            "required": true
          },
          "reason": "no answer is not consent to substitute - the obligation becomes late rather than becoming something different",
          "relativeTo": "trigger"
        },
        onTimeout: "h.delay",
        windowExtendsOnEngagement: false,
        recheck: "the the exception and the scope of the obligation it affects re-read from the system of record before acting on the timeout",
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
        idempotencyKey: "obligation_id + a.substitute",
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
        idempotencyKey: "obligation_id + a.terminal",
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
    channels: ["email", "sms"],
    name: "Fulfillment delay → recalculate commitment → continue, reschedule or escalate",
    shortName: "Delivery Delay Alert",
    purpose:
      "Hold lateness as its own state, with the original commitment intact behind whatever the new estimate is.",
    entity: {
      scope: "the obligation and its timing commitment, with the history of what was promised",
      note: "Each revised estimate is appended. Overwriting the original hides a repeated slip, which is the pattern that matters more than any single date.",
      instanceKey: [
        "obligation_id"
      ],
      concurrency: "one-active-per-key"
    },
    objective: "Hold lateness as its own state, with the original commitment intact behind whatever the new estimate is.",
    eligibility: [
      "a material slip against the timing this obligation was committed to",
      "no instance of this journey is already open for the the obligation and its timing commitment",
      "hard gates (GLB-31) allow communication for this purpose"
    ],
    suppressions: [
      {
        "id": "s.g1",
        "label": "CANONICAL_RULE",
        "text": "Delayed is not failed."
      },
      {
        "id": "s.g2",
        "label": "CANONICAL_RULE",
        "text": "Dates that will not hold are not promised repeatedly. Where no reliable estimate exists, that is what is said."
      },
      {
        "id": "s.g3",
        "label": "CANONICAL_RULE",
        "text": "A changed ETA preserves the original commitment history."
      },
      {
        "id": "s.g4",
        "label": "CANONICAL_RULE",
        "text": "Communicating a delay does not resolve the operational delay."
      },
      {
        "id": "s.g5",
        "label": "CANONICAL_RULE",
        "text": "Once the obligation is handed to a delivery executor, an in-transit slip on the same obligation is FUL-265's delay-or-tracking state to hold and report; this journey does not open a second, competing delay narrative about a slip FUL-265 is already tracking under its own wait."
      }
    ],
    contact: {
      "defaultPriority": "service",
      "pressureClass": "service",
      "localCap": {
        "value": {
          "key": "fulfillment_delay.touches",
          "rule": "Every touch runs against a budget fixed when the instance opened; the budget is the plan's own length, and no touch is repeated because nothing could tell whether it arrived.",
          "default": {
            "value": 2,
            "confidence": "high",
            "basis": "corpus-rule",
            "applicableWhen": "GLB-24; one delay update and one offer or no-choice update"
          },
          "required": false
        },
        "appliesTo": "all"
      },
      "cooldown": {
        "key": "fulfillment_delay.cooldown",
        "rule": "This journey is per the obligation and its timing commitment; a later instance concerns a different the obligation and its timing commitment and no cooldown applies between them.",
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
      "strategy": "offer-decide-remind",
      "touches": [
        {
          "id": "t1",
          "stage": "delay-update",
          "action": "a.delay-update",
          "prerequisites": [
            "c.estimate",
            "c.recipient-impact"
          ],
          "purpose": "State the original commitment, the current estimate or the explicit fact that there is not a reliable one, and what is still owed.",
          "channelRoles": [
            "persistent",
            "urgent"
          ],
          "mandatory": false,
          "label": "CANONICAL_RULE"
        },
        {
          "id": "t2",
          "stage": "no-choice-update",
          "action": "a.no-choice-update",
          "prerequisites": [
            "c.estimate",
            "c.recipient-impact",
            "c.threshold",
            "c.choice"
          ],
          "purpose": "Say that the delay is beyond what was committed, that no option is currently available to them, and that it is being escalated rather than left.",
          "channelRoles": [
            "persistent",
            "urgent"
          ],
          "mandatory": false,
          "label": "CANONICAL_RULE"
        },
        {
          "id": "t3",
          "stage": "offer",
          "action": "a.offer",
          "prerequisites": [
            "c.estimate",
            "c.recipient-impact",
            "c.threshold",
            "c.choice"
          ],
          "purpose": "Offer the choices that are actually available - wait, reschedule, an alternative, or cancel.",
          "channelRoles": [
            "persistent",
            "urgent"
          ],
          "mandatory": false,
          "label": "CANONICAL_RULE",
          "destination": {
            "target": "delay-choices",
            "boundTo": "obligation_id",
            "mustNotClaim": [
              "a date that will not hold",
              "a choice that cannot be honoured"
            ]
          }
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
          "obligation_id",
          "original_commitment",
          "current_estimate",
          "tolerance",
          "available_choices",
          "fulfillment_log"
        ],
        "optional": []
      }
    },
    measurement: {
      "journeyOutcome": {
        "type": "handoff",
        "refs": [
          "h.resume",
          "h.exception",
          "h.cancel",
          "h.escalate"
        ]
      },
      "businessOutcome": {
        "event": "fulfillment_resumed_or_completed",
        "unit": "instance",
        "observationScope": {
          "type": "self"
        },
        "window": {
          "type": "until-exit"
        },
        "attribution": "touched-before-event",
        "comparison": "not-applicable"
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
        "delivery delay alert",
        "shipping delay notice",
        "late order notification",
        "ETA change",
        "delay with options"
      ],
      "useCases": [
        "a material slip stated with the original commitment intact behind the new estimate",
        "a delay beyond tolerance with real choices - wait, reschedule, an alternative, cancel"
      ]
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
        idempotencyKey: "obligation_id + a.assess",
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
        next: "c.recipient-impact",
        idempotencyKey: "obligation_id + a.update",
      },
      {
        id: "a.no-estimate",
        kind: "action",
        does: "Record that no reliable estimate exists rather than issuing one. Repeatedly promising dates that do not hold costs more trust than admitting the date is unknown, and each broken date makes the next one worth less",
        writes: [{ field: "fulfillment_log", mode: "append" }],
        next: "c.recipient-impact",
        idempotencyKey: "obligation_id + a.no-estimate",
      },
      {
        id: "c.recipient-impact",
        kind: "condition",
        asks: "Does the changed timing alter what the recipient should plan around?",
        branches: [
          {
            label: "It changes their plans",
            when: "the new estimate, or the loss of a reliable one, moves something they arranged their own time or commitments around",
            to: "a.delay-update",
          },
          {
            label: "No material change for them",
            when: "the slip stays inside what they were already told to expect and nothing they arranged moves",
            to: "c.threshold",
          },
        ],
      },
      {
        id: "a.delay-update",
        kind: "action",
        does: "State the original commitment, the current estimate or the explicit fact that there is not a reliable one, and what is still owed. A slip that is real in the record and invisible to the person waiting is the failure this journey exists to prevent - and it stays true inside tolerance, because tolerance is ours, not theirs",
        execution: "communication",
        next: "c.threshold",
        idempotencyKey: "obligation_id + a.delay-update",
      },
      {
        id: "a.no-choice-update",
        kind: "action",
        does: "Say that the delay is beyond what was committed, that no option is currently available to them, and that it is being escalated rather than left. Escalating in silence tells the recipient nothing is happening at the exact moment most is",
        execution: "communication",
        next: "h.escalate",
        idempotencyKey: "obligation_id + a.no-choice-update",
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
            to: "a.no-choice-update",
          },
        ],
      },
      {
        id: "a.offer",
        kind: "action",
        does: "Offer the choices that are actually available - wait, reschedule, an alternative, or cancel. Offering a choice that cannot be honoured is worse than offering none, because it converts a delay into a broken second promise",
        writes: [{ field: "fulfillment_log", mode: "append" }],
        next: "w.decision",
        execution: "communication",
        idempotencyKey: "obligation_id + a.offer",
      },
      {
        id: "w.decision",
        kind: "wait",
        until: [
          "choice_made"
        ],
        onEvent: "c.decision",
        timeout: {
          "after": {
            "key": "fulfillment_delay.decision",
            "rule": "The decision window.",
            "class": "response-window",
            "required": true
          },
          "reason": "no answer means continue waiting - silence is not consent to cancel something someone is still expecting",
          "relativeTo": "previous-touch"
        },
        onTimeout: "w.resume",
        windowExtendsOnEngagement: false,
        recheck: "the the obligation and its timing commitment re-read from the system of record before acting on the timeout",
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
        idempotencyKey: "obligation_id + a.reschedule",
      },
      {
        id: "w.resume",
        kind: "wait",
        until: [
          "fulfillment_resumed_or_completed"
        ],
        onEvent: "h.resume",
        timeout: {
          "after": {
            "key": "fulfillment_delay.resume",
            "rule": "The revised horizon.",
            "class": "observation-window",
            "required": true
          },
          "reason": "a delay that outlives even its revised horizon has stopped being a timing problem, and communicating about it does not resolve it",
          "relativeTo": "trigger"
        },
        onTimeout: "h.escalate",
        windowExtendsOnEngagement: false,
        recheck: "the the obligation and its timing commitment re-read from the system of record before acting on the timeout",
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
    channels: [],
    name: "Dispatch or handoff → track → delivered, failed or unknown",
    shortName: "Delivery Outcome Tracking",
    purpose:
      "Transfer execution to whoever performs the delivery while the obligation stays ours and stays open.",
    entity: {
      scope: "the handoff to a delivery executor, and the obligation behind it",
      note: "Handing something to a carrier transfers who is doing the work. It transfers nothing about who owes the outcome.",
      instanceKey: [
        "dispatch_id"
      ],
      concurrency: "one-active-per-key"
    },
    distinctFrom: [
      {
        journey: "INT-114",
        because:
          "INT-114 is the generic shape of an external operation. This carries delivery semantics that shape has no room for: a recipient who may refuse, an attempt that is not an outcome, and intermediate tracking updates that look like results and are not.",
      },
    ],
    objective: "Transfer execution to whoever performs the delivery while the obligation stays ours and stays open.",
    eligibility: [
      "a prepared item or service passing to a carrier, technician or other delivery executor",
      "no instance of this journey is already open for the the handoff to a delivery executor",
      "hard gates (GLB-31) allow communication for this purpose"
    ],
    suppressions: [
      {
        "id": "s.g1",
        "label": "CANONICAL_RULE",
        "text": "Dispatched is not delivered."
      },
      {
        "id": "s.g2",
        "label": "CANONICAL_RULE",
        "text": "A tracking update is not necessarily a final delivery."
      },
      {
        "id": "s.g3",
        "label": "CANONICAL_RULE",
        "text": "A provider timeout is not a delivery failure."
      },
      {
        "id": "s.g4",
        "label": "CANONICAL_RULE",
        "text": "Duplicate delivery events are idempotent."
      }
    ],
    implementation: {
      "attributes": {
        "required": [
          "dispatch_id",
          "obligation_id",
          "executor",
          "expected_delivery_window",
          "delivery_log"
        ],
        "optional": []
      }
    },
    measurement: {
      "journeyOutcome": {
        "type": "handoff",
        "refs": [
          "h.reconcile",
          "h.confirm",
          "h.failed",
          "h.delay"
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
        "delivery outcome tracking",
        "carrier tracking",
        "dispatch tracking",
        "delivery status"
      ],
      "useCases": [
        "execution transferred to a carrier or technician while the obligation stays ours",
        "an outcome that could not be established, reconciled with the executor"
      ]
    },
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
        idempotencyKey: "dispatch_id + a.persist",
      },
      {
        id: "w.delivery",
        kind: "wait",
        until: [
          "delivery_confirmed",
          "delivery_failed",
          "delivery_delay_reported"
        ],
        onEvent: "c.outcome",
        timeout: {
          "after": {
            "key": "dispatch_and.delivery",
            "rule": "The expected delivery window plus its tolerance.",
            "class": "external-window",
            "required": true
          },
          "reason": "the window closing means we stopped hearing, which is a fact about our visibility rather than about the parcel - and a provider timeout is not a delivery failure",
          "relativeTo": "trigger"
        },
        onTimeout: "a.unknown",
        windowExtendsOnEngagement: false,
        recheck: "the the handoff to a delivery executor re-read from the system of record before acting on the timeout",
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
        idempotencyKey: "dispatch_id + a.unknown",
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
        contract: {
          "requiredFields": [
            "dispatch_id",
            "obligation_id",
            "handed_at",
            "reason"
          ]
        },
      },
      {
        id: "h.confirm",
        kind: "handoff",
        to: "FUL-149",
        on: "an authoritative delivery confirmation",
        carries: [
          "the proof of delivery and when it was recorded",
          "the obligation, which delivery may or may not finish depending on whether acceptance applies",
          "a fresh delivery_id minted at this handoff, deterministically derived from dispatch_id and the delivery confirmation, so FUL-149 can construct its own instance",
        ],
        contract: { requiredFields: ["obligation_id", "delivery_id"] },
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
    channels: ["email", "sms"],
    name: "Delivery attempt failed → reason → retry, correct, alternate or return",
    shortName: "Failed Delivery Recovery",
    purpose:
      "Recover a failed delivery according to why it failed, within a bounded number of attempts.",
    entity: {
      scope: "the individual delivery attempt and the obligation it was serving",
      note: "The obligation survives every failed attempt. What changes is how many attempts remain and what would make the next one work.",
      instanceKey: [
        "delivery_attempt_id"
      ],
      concurrency: "one-active-per-key"
    },
    objective: "Recover a failed delivery according to why it failed, within a bounded number of attempts.",
    eligibility: [
      "a delivery executor confirming an attempt was made and delivery did not occur",
      "no instance of this journey is already open for the the individual delivery attempt and the obligation it was serving",
      "hard gates (GLB-31) allow communication for this purpose"
    ],
    suppressions: [
      {
        "id": "s.g1",
        "label": "CANONICAL_RULE",
        "text": "Attempted is not delivered."
      },
      {
        "id": "s.g2",
        "label": "CANONICAL_RULE",
        "text": "Delivery is not retried indefinitely - the budget is bounded and does not reset."
      },
      {
        "id": "s.g3",
        "label": "CANONICAL_RULE",
        "text": "Refused and unavailable are different outcomes with different consequences."
      },
      {
        "id": "s.g4",
        "label": "CANONICAL_RULE",
        "text": "The failure reason is never invented. What the executor reported is what is acted on."
      }
    ],
    contact: {
      "defaultPriority": "service",
      "pressureClass": "service",
      "localCap": {
        "value": {
          "key": "delivery_attempt.touches",
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
        "key": "delivery_attempt.cooldown",
        "rule": "This journey is per the individual delivery attempt and the obligation it was serving; a later instance concerns a different the individual delivery attempt and the obligation it was serving and no cooldown applies between them.",
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
          "stage": "correct",
          "action": "a.correct",
          "prerequisites": [
            "c.class"
          ],
          "purpose": "Request the exact correction - the address, the access instruction, the contact.",
          "channelRoles": [
            "persistent",
            "urgent"
          ],
          "mandatory": false,
          "label": "CANONICAL_RULE",
          "destination": {
            "target": "delivery-correction",
            "boundTo": "delivery_attempt_id"
          }
        },
        {
          "id": "t2",
          "stage": "offer-route",
          "action": "a.offer-route",
          "prerequisites": [
            "c.class",
            "c.budget",
            "c.alternate"
          ],
          "purpose": "Put the concrete alternatives in front of the recipient - the collection point, the different window, the other executor - and ask which they want, stating that the attempt budget does not reset either way.",
          "channelRoles": [
            "persistent",
            "urgent"
          ],
          "mandatory": false,
          "label": "CANONICAL_RULE",
          "destination": {
            "target": "delivery-alternatives",
            "boundTo": "delivery_attempt_id",
            "mustNotClaim": [
              "an alternative that is not actually available"
            ]
          }
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
          "delivery_attempt_id",
          "obligation_id",
          "failure_reason",
          "attempt_budget",
          "alternative_routes",
          "delivery_log"
        ],
        "optional": []
      }
    },
    measurement: {
      "journeyOutcome": {
        "type": "handoff",
        "refs": [
          "h.retry",
          "h.return",
          "h.exception"
        ]
      },
      "businessOutcome": {
        "event": "delivery_correction_provided",
        "unit": "instance",
        "observationScope": {
          "type": "self"
        },
        "window": {
          "type": "until-exit"
        },
        "attribution": "touched-before-event",
        "comparison": "not-applicable"
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
        "failed delivery recovery",
        "delivery attempt failed",
        "redelivery",
        "missed delivery options",
        "address correction request"
      ],
      "useCases": [
        "a failed attempt recovered by why it failed, within a bounded number of attempts",
        "concrete alternatives put to the recipient instead of a blind reattempt"
      ]
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
        idempotencyKey: "delivery_attempt_id + obligation_id + a.classify",
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
        execution: "communication",
        idempotencyKey: "delivery_attempt_id + obligation_id + a.correct",
      },
      {
        id: "w.correction",
        kind: "wait",
        until: [
          "delivery_correction_provided"
        ],
        onEvent: "c.budget",
        timeout: {
          "after": {
            "key": "delivery_attempt.correction",
            "rule": "The correction is waited for as long as a reattempt inside the bounded policy is still possible; past it the delivery goes to return.",
            "class": "response-window",
            "required": true
          },
          "reason": "an item held indefinitely awaiting information nobody is providing is one that has to go somewhere, and returning it is the honest ending",
          "relativeTo": "previous-touch"
        },
        onTimeout: "h.return",
        windowExtendsOnEngagement: false,
        recheck: "the the individual delivery attempt and the obligation it was serving re-read from the system of record before acting on the timeout",
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
            label: "An alternative is better, and policy authorises it",
            when: "a collection point, a different window or another executor is more likely to succeed, and policy permits the change without asking",
            to: "a.alternate",
          },
          {
            label: "An alternative is better, but it is the recipient's to choose",
            when: "the change would move where or when they must be present, which policy does not let us decide for them",
            to: "a.offer-route",
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
        does: "Use the authorised alternative route, recorded as a change of route rather than a new obligation. Reached either because policy permits the change or because the recipient chose it - the authority exists before the route moves",
        writes: [{ field: "delivery_log", mode: "append" }],
        next: "h.retry",
        idempotencyKey: "delivery_attempt_id + obligation_id + a.alternate",
      },
      {
        id: "a.offer-route",
        kind: "action",
        does: "Put the concrete alternatives in front of the recipient - the collection point, the different window, the other executor - and ask which they want, stating that the attempt budget does not reset either way. Moving where somebody has to be, without asking, is a decision taken on their behalf",
        execution: "communication",
        next: "w.route-choice",
        idempotencyKey: "delivery_attempt_id + obligation_id + a.offer-route",
      },
      {
        id: "w.route-choice",
        kind: "wait",
        until: [
          "delivery_alternative_selected",
          "delivery_alternatives_declined"
        ],
        onEvent: "c.route-answer",
        timeout: {
          "after": {
            "key": "delivery_attempt.route_choice",
            "rule": "The choice of alternative is waited for as long as a reattempt inside the bounded policy is still possible; an unanswered choice reattempts the same route.",
            "class": "response-window",
            "required": true
          },
          "reason": "an offer of a slot or a collection point stops being true once it is gone, and holding the obligation open against a stale offer is worse than reattempting the route we already have",
          "relativeTo": "previous-touch"
        },
        onTimeout: "a.reattempt",
        windowExtendsOnEngagement: false,
        recheck: "the the individual delivery attempt and the obligation it was serving re-read from the system of record before acting on the timeout",
      },
      {
        id: "c.route-answer",
        kind: "condition",
        asks: "What did the recipient say?",
        branches: [
          {
            label: "Selected an alternative",
            when: "they named one of the offered routes",
            to: "a.alternate",
          },
          {
            label: "Declined all of them",
            when: "none of the offered routes works for them and they said so",
            to: "h.return",
          },
        ],
      },
      {
        id: "a.reattempt",
        kind: "action",
        does: "Schedule the bounded reattempt, against the remaining attempt budget rather than a fresh one",
        writes: [{ field: "delivery_log", mode: "append" }],
        next: "h.retry",
        idempotencyKey: "delivery_attempt_id + obligation_id + a.reattempt",
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
          "the obligation, which is unresolved rather than discharged - and any financial consequence, which is a separate lifecycle - obligation_id stands in for REM-151's order_id",
          "a fresh issue_id, minted at this handoff and deterministically derived from delivery_attempt_id - FUL-148 has no issue concept of its own, so REM-151's instance is opened here rather than carried",
        ],
        contract: { requiredFields: ["issue_id", "order_id"] },
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
    channels: [],
    name: "Delivery confirmation → acceptance or issue window → finalize",
    shortName: "Delivery Acceptance Finalization",
    purpose:
      "Separate arriving from being agreed to have arrived correctly, wherever that difference has business meaning.",
    entity: {
      scope: "the delivered fulfillment and the recipient whose acceptance may still be required",
      note: "Proof of delivery stays attached to the delivery record. Finalisation is a later state and does not supersede the evidence that produced it.",
      instanceKey: [
        "obligation_id",
        "delivery_id"
      ],
      concurrency: "one-active-per-key"
    },
    objective: "Separate arriving from being agreed to have arrived correctly, wherever that difference has business meaning.",
    eligibility: [
      "an authoritative confirmation that the recipient has what was owed",
      "no instance of this journey is already open for the the delivered fulfillment and the recipient whose acceptance may still be required",
      "hard gates (GLB-31) allow communication for this purpose"
    ],
    suppressions: [
      {
        "id": "s.g1",
        "label": "CANONICAL_RULE",
        "text": "Delivered is not accepted where acceptance is contractually meaningful."
      },
      {
        "id": "s.g2",
        "label": "CANONICAL_RULE",
        "text": "No acceptance window is invented beyond what policy defines."
      },
      {
        "id": "s.g3",
        "label": "CANONICAL_RULE",
        "text": "Proof of delivery remains attached to the delivery history."
      },
      {
        "id": "s.g4",
        "label": "CANONICAL_RULE",
        "text": "Finalisation does not erase later rights that policy independently provides."
      }
    ],
    implementation: {
      "attributes": {
        "required": [
          "obligation_id",
          "delivery_id",
          "acceptance_required",
          "acceptance_window_ends_at",
          "issue_window_ends_at",
          "proof_of_delivery",
          "delivery_log"
        ],
        "optional": []
      }
    },
    measurement: {
      "journeyOutcome": {
        "type": "exit-or-handoff",
        "refs": [
          "x.finalized",
          "h.issue"
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
        "delivery acceptance finalization",
        "proof of delivery",
        "acceptance window",
        "post-delivery issue window"
      ],
      "useCases": [
        "arriving separated from being agreed to have arrived correctly",
        "an issue raised inside a valid post-delivery window, routed to recovery"
      ]
    },
    entry: "t.delivered",
    nodes: [
      {
        id: "t.delivered",
        kind: "trigger",
        event: "authoritative_delivery_completion",
        evidence: {
          requires: ["an authoritative confirmation that the recipient has what was owed"],
          insufficientAlone: [
            "a carrier scan that is not a completion",
            "a dispatch",
            "an internal task closing"
          ],
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
        idempotencyKey: "obligation_id + delivery_id + a.record",
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
        until: [
          "delivery_accepted",
          "delivery_issue_raised"
        ],
        onEvent: "c.response",
        timeout: {
          "after": {
            "key": "delivery_acceptance.acceptance",
            "rule": "The acceptance deadline defined by the contract or policy.",
            "class": "attribute-bound",
            "required": true
          },
          "reason": "deemed acceptance after a stated period is a policy position; inventing one where none exists closes an obligation the counterparty never agreed was finished",
          "relativeTo": "attribute",
          "attribute": "acceptance_window_ends_at"
        },
        onTimeout: "a.finalize",
        windowExtendsOnEngagement: false,
        recheck: "the the delivered fulfillment and the recipient whose acceptance may still be required re-read from the system of record before acting on the timeout",
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
        until: [
          "delivery_issue_raised"
        ],
        onEvent: "h.issue",
        timeout: {
          "after": {
            "key": "delivery_acceptance.window",
            "rule": "The issue window closing.",
            "class": "attribute-bound",
            "required": true
          },
          "reason": "the window ending without an issue is the ordinary path to completion, and no acceptance window is invented beyond what policy defines",
          "relativeTo": "attribute",
          "attribute": "issue_window_ends_at"
        },
        onTimeout: "a.finalize",
        windowExtendsOnEngagement: false,
        recheck: "the the delivered fulfillment and the recipient whose acceptance may still be required re-read from the system of record before acting on the timeout",
      },
      {
        id: "h.issue",
        kind: "handoff",
        to: "REM-151",
        on: "an issue raised within a valid post-delivery window",
        carries: [
          "the delivery record and its proof",
          "what the recipient says is wrong, in their words",
          "a fresh issue_id minted at this handoff, deterministically derived from obligation_id + delivery_id and the raised issue, so REM-151 can construct its own instance",
        ],
        contract: { requiredFields: ["obligation_id", "issue_id"] },
      },
      {
        id: "a.finalize",
        kind: "action",
        does: "Record FINALIZED. This closes the fulfillment relationship and does not erase rights that policy independently provides afterwards - a warranty, a statutory return period or a service guarantee all survive finalisation and are not what this state was measuring",
        writes: [{ field: "fulfillment_log", mode: "append" }],
        next: "x.finalized",
        idempotencyKey: "obligation_id + delivery_id + a.finalize",
      },
      {
        id: "x.finalized",
        kind: "exit",
        state: "FINALIZED; the obligation is discharged and the remaining scope is zero",
        terminal: false,
        reEntry:
          "later rights that policy provides independently are exercised on their own terms and do not reopen this state",
        class: "success",
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
    channels: [],
    name: "Fulfillment cancellation → stop future work → release resources → reconcile",
    shortName: "Fulfillment Cancellation Reconciliation",
    purpose:
      "Stop what remains of an obligation while keeping everything that already happened.",
    entity: {
      scope: "the obligation, split into what is completed, what is in progress and what has not started",
      note: "The three scopes are treated separately throughout. Collapsing them either discards delivered work or cancels nothing at all.",
      instanceKey: [
        "obligation_id"
      ],
      concurrency: "one-active-per-key"
    },
    distinctFrom: [
      {
        journey: "FIN-137",
        because:
          "Stopping a delivery and returning money are different decisions with different authority. Coupling them either refunds what was delivered or delivers what was refunded, and this journey hands the financial question to the lifecycle that owns it.",
      },
    ],
    objective: "Stop what remains of an obligation while keeping everything that already happened.",
    eligibility: [
      "an authoritative cancellation that has taken effect on the obligation",
      "no instance of this journey is already open for the the obligation",
      "hard gates (GLB-31) allow communication for this purpose"
    ],
    suppressions: [
      {
        "id": "s.g1",
        "label": "CANONICAL_RULE",
        "text": "A cancellation requested is not a cancellation."
      },
      {
        "id": "s.g2",
        "label": "CANONICAL_RULE",
        "text": "A cancellation for fraud, compliance or manual review suppresses recovery outreach entirely. The reason it was cancelled is the reason not to chase it."
      },
      {
        "id": "s.g3",
        "label": "CANONICAL_RULE",
        "text": "Recovery is scoped to the specific obligation that was cancelled. A later unrelated purchase does not close it, and counting one as a recovery overstates what the intervention did."
      },
      {
        "id": "s.g4",
        "label": "CANONICAL_RULE",
        "text": "Cancellation does not erase completed fulfillment history."
      },
      {
        "id": "s.g5",
        "label": "CANONICAL_RULE",
        "text": "Resource release affects only unused allocation belonging to this obligation."
      },
      {
        "id": "s.g6",
        "label": "CANONICAL_RULE",
        "text": "A financial refund is a separate lifecycle with its own decision."
      }
    ],
    implementation: {
      "attributes": {
        "required": [
          "obligation_id",
          "fulfillment_log",
          "suppressed_sends",
          "allocation_log",
          "delivery_log"
        ],
        "optional": []
      }
    },
    measurement: {
      "journeyOutcome": {
        "type": "exit-or-handoff",
        "refs": [
          "x.cancelled",
          "h.financial"
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
        "fulfillment cancellation reconciliation",
        "order cancellation",
        "cancel an order in progress",
        "stop remaining fulfilment"
      ],
      "useCases": [
        "what remains of an obligation stopped while everything that happened is kept",
        "a cancellation with a financial consequence handed to refund"
      ]
    },
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
        idempotencyKey: "obligation_id + a.record",
      },
      {
        id: "a.stop",
        kind: "action",
        does: "Stop the future work that can still be stopped, scoped to the unstarted portion and whatever in-progress work can be halted safely",
        writes: [{ field: "suppressed_sends", mode: "append" }],
        next: "a.release",
        idempotencyKey: "obligation_id + a.stop",
      },
      {
        id: "a.release",
        kind: "action",
        does: "Release the allocations and reservations this obligation no longer needs, scoped strictly to its own. A release that reaches a shared allocation or another obligation's claim takes capacity from work that is still going ahead",
        writes: [{ field: "allocation_log", mode: "append" }],
        next: "c.completed",
        idempotencyKey: "obligation_id + a.release",
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
        idempotencyKey: "obligation_id + a.preserve",
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
        idempotencyKey: "obligation_id + a.intercept",
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
        idempotencyKey: "obligation_id + a.verify",
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
        class: "success",
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
  {
    id: "FUL-265",
    slug: "dispatch-to-acceptance",
    category: "fulfillment",
    goal: "delivery-confirmation",
    channels: ["email", "sms"],
    name: "Dispatch → tracking → delivered → accepted or issue raised",
    shortName: "Delivery Tracking",
    purpose:
      "Carry the recipient from the moment execution left our hands to the moment they agree the obligation was discharged correctly - because arriving and being agreed to have arrived correctly are two different facts, and only one of them has a recipient as its source.",
    entity: {
      scope: "the dispatched obligation, its recipient, and the acceptance window running against it",
      note: "One dispatch, one instance. A re-dispatch after a failure is a new instance and does not inherit the first one's acceptance window.",
      instanceKey: [
        "obligation_id",
        "person_id"
      ],
      concurrency: "one-active-per-key"
    },
    distinctFrom: [
      {
        journey: "FUL-147",
        because:
          "FUL-147 holds the obligation open while an executor performs it and reconciles whatever the executor reports. This is what the recipient is told across that same period, and it sends nothing the executor has not authoritatively reported.",
      },
      {
        journey: "FUL-149",
        because:
          "FUL-149 decides whether acceptance is contractually meaningful and records finalisation. This is the request for that acceptance and the deadline enforced in front of the person who owes it.",
      },
    ],
    objective: "Carry the recipient from the moment execution left our hands to the moment they agree the obligation was discharged correctly - because arriving and being agreed to have arrived correctly are two different facts, and only one of them has a recipient as its source.",
    eligibility: [
      "an authoritative dispatch record naming the executor and the destination",
      "a recipient with a permitted route for a service notice",
      "no instance of this journey is already open for the the dispatched obligation",
      "hard gates (GLB-31) allow communication for this purpose"
    ],
    suppressions: [
      {
        "id": "s.g1",
        "label": "CANONICAL_RULE",
        "text": "Dispatched is not delivered, and delivered is not accepted. Each is told at the point it becomes true and never before."
      },
      {
        "id": "s.g2",
        "label": "CANONICAL_RULE",
        "text": "An intermediate tracking movement is never reported as an outcome."
      },
      {
        "id": "s.g3",
        "label": "CANONICAL_RULE",
        "text": "No acceptance window is invented beyond what policy defines; where none exists, nothing is asked for."
      },
      {
        "id": "s.g4",
        "label": "CANONICAL_RULE",
        "text": "An executor gone quiet is reported as unknown, not as failure."
      },
      {
        "id": "s.g5",
        "label": "CANONICAL_RULE",
        "text": "Acceptance by agreement and acceptance by expiry stay separable forever."
      },
      {
        "id": "s.g6",
        "label": "CANONICAL_RULE",
        "text": "A pre-dispatch slip against the original commitment is FUL-146's delay narrative, not this journey's; this journey's own tracking begins at dispatch and reports what the executor authoritatively confirms from there."
      }
    ],
    contact: {
      "defaultPriority": "service",
      "pressureClass": "service",
      "localCap": {
        "value": {
          "key": "dispatch_to.touches",
          "rule": "Every touch runs against a budget fixed when the instance opened; the budget is the plan's own length, and no touch is repeated because nothing could tell whether it arrived.",
          "default": {
            "value": 3,
            "confidence": "high",
            "basis": "corpus-rule",
            "applicableWhen": "GLB-24; a dispatch notice, an arrival or non-arrival notice, and an acceptance request"
          },
          "required": false
        },
        "appliesTo": "all"
      },
      "cooldown": {
        "key": "dispatch_to.cooldown",
        "rule": "This journey is per the dispatched obligation; a later instance concerns a different the dispatched obligation and no cooldown applies between them.",
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
      "strategy": "offer-decide-remind",
      "touches": [
        {
          "id": "t1",
          "stage": "dispatch",
          "action": "a.dispatch",
          "prerequisites": [],
          "purpose": "Say it is on its way, with the expected window and whatever reference genuinely follows it.",
          "channelRoles": [
            "persistent",
            "urgent"
          ],
          "mandatory": false,
          "label": "CANONICAL_RULE"
        },
        {
          "id": "t2",
          "stage": "no-arrival",
          "action": "a.no-arrival",
          "after": "t1",
          "gatedBy": "w.delivery",
          "prerequisites": [],
          "purpose": "Tell them it has not arrived and say which of the two it is - a confirmed failure, or an executor we have lost sight of.",
          "channelRoles": [
            "persistent",
            "urgent"
          ],
          "mandatory": false,
          "label": "CANONICAL_RULE"
        },
        {
          "id": "t3",
          "stage": "arrived",
          "action": "a.arrived",
          "gatedBy": "w.delivery",
          "prerequisites": [
            "c.delivery"
          ],
          "purpose": "Confirm it arrived and what the evidence for that is.",
          "channelRoles": [
            "persistent",
            "urgent"
          ],
          "mandatory": false,
          "label": "CANONICAL_RULE",
          "after": "t1"
        },
        {
          "id": "t4",
          "stage": "accept-request",
          "action": "a.accept-request",
          "after": "t3",
          "prerequisites": [
            "c.acceptance"
          ],
          "purpose": "Ask them to confirm it arrived correctly or to raise an issue, and name the date after which it is treated as accepted.",
          "channelRoles": [
            "persistent",
            "urgent"
          ],
          "mandatory": false,
          "label": "CANONICAL_RULE",
          "destination": {
            "target": "accept-or-raise-issue",
            "boundTo": "obligation_id",
            "mustNotClaim": [
              "an acceptance window policy does not define"
            ]
          }
        }
      ],
      "noAction": [
        "s.g1",
        "s.g2",
        "s.g3",
        "s.g4",
        "s.g5"
      ]
    },
    implementation: {
      "attributes": {
        "required": [
          "obligation_id",
          "person_id",
          "executor",
          "expected_window",
          "tracking_reference",
          "acceptance_window_ends_at"
        ],
        "optional": []
      }
    },
    measurement: {
      "journeyOutcome": {
        "type": "exit-or-handoff",
        "refs": [
          "x.unresolved",
          "x.delivered",
          "x.accepted",
          "x.finalized",
          "h.issue"
        ]
      },
      "businessOutcome": {
        "event": "delivery_accepted",
        "unit": "instance",
        "observationScope": {
          "type": "self"
        },
        "window": {
          "type": "until-exit"
        },
        "attribution": "touched-before-event",
        "comparison": "not-applicable"
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
        "delivery tracking",
        "shipping notification",
        "order shipped",
        "out for delivery",
        "delivery confirmation and acceptance"
      ],
      "useCases": [
        "the recipient carried from dispatch to agreed acceptance",
        "a non-arrival stated as what it is: a confirmed failure or an executor lost sight of"
      ]
    },
    entry: "t.dispatched",
    nodes: [
      {
        id: "t.dispatched",
        kind: "trigger",
        event: "obligation_handed_to_delivery_executor",
        evidence: {
          requires: [
            "an authoritative dispatch record naming the executor and the destination",
            "a recipient with a permitted route for a service notice",
          ],
          insufficientAlone: [
            "a preparation or packing status",
            "a label or reference created with nothing handed over behind it",
          ],
          source: "authoritative",
        },
        next: "a.dispatch",
      },
      {
        id: "a.dispatch",
        kind: "action",
        does: "Say it is on its way, with the expected window and whatever reference genuinely follows it. Where no reference exists, say so rather than inventing one - a link that resolves to nothing costs more than an honest absence",
        next: "w.delivery",
        execution: "communication",
        idempotencyKey: "obligation_id + person_id + a.dispatch",
      },
      {
        id: "w.delivery",
        kind: "wait",
        until: [
          "delivery_confirmed",
          "delivery_failed",
          "delivery_delay_reported"
        ],
        onEvent: "c.delivery",
        timeout: {
          "after": {
            "key": "dispatch_to.delivery",
            "rule": "The executor's own expected window, from the dispatch record; its passing without an authoritative report is a non-arrival to be reconciled, never assumed delivered.",
            "class": "external-window",
            "required": true
          },
          "reason": "an executor that has gone quiet is not an outcome, and the recipient is the person who notices first",
          "relativeTo": "previous-touch"
        },
        onTimeout: "a.no-arrival",
        windowExtendsOnEngagement: false,
        recheck: "the the dispatched obligation re-read from the system of record before acting on the timeout",
      },
      {
        id: "c.delivery",
        kind: "condition",
        asks: "What did the executor authoritatively report?",
        branches: [
          {
            label: "Delivered",
            when: "a final delivery confirmation exists, not an intermediate tracking movement",
            to: "a.arrived",
          },
          {
            label: "Not delivered",
            when: "a confirmed failure, or a window that has passed with no final outcome",
            to: "a.no-arrival",
          },
        ],
      },
      {
        id: "a.no-arrival",
        kind: "action",
        does: "Tell them it has not arrived and say which of the two it is - a confirmed failure, or an executor we have lost sight of. Calling an unknown a failure produces a replacement that then arrives alongside the original",
        next: "x.unresolved",
        execution: "communication",
        idempotencyKey: "obligation_id + person_id + a.no-arrival",
      },
      {
        id: "x.unresolved",
        kind: "handoff",
        to: "FUL-148",
        on: "a confirmed non-arrival, or an executor gone quiet long enough that the obligation needs active recovery rather than a further wait",
        carries: [
          "the failure classification told to the recipient - confirmed failure or executor lost sight of - which becomes FUL-148's failure_reason",
          "the dispatch and tracking history, so recovery does not start from nothing",
          "a fresh delivery_attempt_id, minted at this handoff and deterministically derived from obligation_id and the dispatch record - FUL-265 tracks by obligation and person, not by attempt, so FUL-148's per-attempt instance is opened here rather than carried",
        ],
        contract: { requiredFields: ["delivery_attempt_id", "obligation_id", "failure_reason"] },
      },
      {
        id: "a.arrived",
        kind: "action",
        does: "Confirm it arrived and what the evidence for that is. Proof of delivery is a fact about the executor, and stating it is what lets the recipient contradict it while the memory is fresh",
        next: "c.acceptance",
        execution: "communication",
        idempotencyKey: "obligation_id + person_id + a.arrived",
      },
      {
        id: "c.acceptance",
        kind: "condition",
        asks: "Does acceptance carry any consequence here?",
        branches: [
          {
            label: "Acceptance is meaningful",
            when: "policy defines an acceptance or issue window with something turning on it",
            to: "a.accept-request",
          },
          {
            label: "Delivery is the end of it",
            when: "no acceptance window is defined, so there is nothing to ask for",
            to: "x.delivered",
          },
        ],
      },
      {
        id: "x.delivered",
        kind: "exit",
        state: "delivered; no acceptance was required",
        terminal: true,
        reEntry: "a later obligation to the same recipient is a new instance",
        class: "success",
      },
      {
        id: "a.accept-request",
        kind: "action",
        does: "Ask them to confirm it arrived correctly or to raise an issue, and name the date after which it is treated as accepted. Stating that date is what makes silence mean something they chose rather than something done to them",
        next: "w.acceptance",
        execution: "communication",
        idempotencyKey: "obligation_id + person_id + a.accept-request",
      },
      {
        id: "w.acceptance",
        kind: "wait",
        until: [
          "delivery_accepted",
          "delivery_issue_raised"
        ],
        onEvent: "c.response",
        timeout: {
          "after": {
            "key": "dispatch_to.acceptance",
            "rule": "The acceptance window policy defines.",
            "class": "attribute-bound",
            "required": true
          },
          "reason": "an acceptance window with no end leaves the obligation open forever and the recipient unaware it was ever theirs to close",
          "relativeTo": "attribute",
          "attribute": "acceptance_window_ends_at"
        },
        onTimeout: "a.finalize",
        windowExtendsOnEngagement: false,
        recheck: "the the dispatched obligation re-read from the system of record before acting on the timeout",
      },
      {
        id: "c.response",
        kind: "condition",
        asks: "What did the recipient say?",
        branches: [
          {
            label: "Accepted",
            when: "the recipient explicitly confirmed it arrived correctly",
            to: "x.accepted",
          },
          {
            label: "Issue raised",
            when: "the recipient says what arrived is wrong, incomplete or damaged",
            to: "h.issue",
          },
        ],
      },
      {
        id: "h.issue",
        kind: "handoff",
        to: "FUL-149",
        on: "a delivered obligation the recipient has raised an issue against inside its acceptance window",
        carries: [
          "the delivery evidence and when acceptance was requested",
          "what the recipient says is wrong and when they said it",
        ],
      },
      {
        id: "x.accepted",
        kind: "exit",
        state: "accepted by the recipient",
        terminal: true,
        reEntry: "rights policy independently provides afterwards do not run through here",
        class: "success",
      },
      {
        id: "a.finalize",
        kind: "action",
        does: "Record acceptance by expiry, kept distinguishable from acceptance by agreement. One is the recipient saying it was right; the other is nobody saying anything, and a report that cannot tell them apart is reporting satisfaction it does not have",
        next: "x.finalized",
        idempotencyKey: "obligation_id + person_id + a.finalize",
      },
      {
        id: "x.finalized",
        kind: "exit",
        state: "finalised on expiry of the acceptance window, with no explicit acceptance",
        terminal: false,
        reEntry: "an issue raised later runs on whatever right policy independently provides, not on this window",
        class: "timeout",
      },
    ],
    guardrails: [
      "Dispatched is not delivered, and delivered is not accepted. Each is told at the point it becomes true and never before.",
      "An intermediate tracking movement is never reported as an outcome.",
      "No acceptance window is invented beyond what policy defines; where none exists, nothing is asked for.",
      "An executor gone quiet is reported as unknown, not as failure.",
      "Acceptance by agreement and acceptance by expiry stay separable forever.",
    ],
    reusableRule:
      "Delivery is a fact about the executor; acceptance is a fact only the recipient can supply, and the deadline is what makes their silence readable.",
  },
  {
    id: "FUL-276",
    slug: "substitution-offer",
    category: "fulfillment",
    goal: "recovery-retry",
    channels: ["email", "sms"],
    name: "Substitution required → offer alternative → accepted, declined or lapsed",
    shortName: "Substitution Approval",
    purpose:
      "Put a defined alternative in front of the person the obligation was made to, with a real decline path and a stated deadline, so that nothing different is ever supplied on the assumption they would not have minded.",
    entity: {
      scope: "the affected scope of the obligation and the single alternative offered against it",
      note: "The offer covers the affected scope only. Everything already fulfilled stays fulfilled, and a second exception on the same obligation is its own instance.",
      instanceKey: [
        "obligation_id",
        "substitution_offer_id"
      ],
      concurrency: "one-active-per-key"
    },
    distinctFrom: [
      {
        journey: "FUL-145",
        because:
          "FUL-145 diagnoses the exception, scopes it and decides that a defined alternative exists. This journey is the offer put to the recipient, and it starts only once that decision has been taken.",
      },
    ],
    objective: "Put a defined alternative in front of the person the obligation was made to, with a real decline path and a stated deadline, so that nothing different is ever supplied on the assumption they would not have minded.",
    eligibility: [
      "an authoritative exception recorded against a named scope of the obligation",
      "a specific alternative identified and actually available",
      "the difference between what was promised and what would be supplied instead",
      "no instance of this journey is already open for the the affected scope of the obligation and the single alternative offered against it",
      "hard gates (GLB-31) allow communication for this purpose"
    ],
    suppressions: [
      {
        "id": "s.g1",
        "label": "CANONICAL_RULE",
        "text": "Nothing different is supplied on the strength of silence. Only an explicit acceptance moves the obligation."
      },
      {
        "id": "s.g2",
        "label": "CANONICAL_RULE",
        "text": "The decline path sits in the same message as the accept path and costs the same effort to take."
      },
      {
        "id": "s.g3",
        "label": "CANONICAL_RULE",
        "text": "A decline is not a cancellation. The affected scope remains open and owed."
      },
      {
        "id": "s.g4",
        "label": "CANONICAL_RULE",
        "text": "Scope already fulfilled is untouched. The offer covers only what the exception actually affects."
      },
      {
        "id": "s.g5",
        "label": "CANONICAL_RULE",
        "text": "One reminder before the window closes, never two."
      }
    ],
    contact: {
      "defaultPriority": "service",
      "pressureClass": "service",
      "localCap": {
        "value": {
          "key": "substitution_offer.touches",
          "rule": "Every touch runs against a budget fixed when the instance opened; the budget is the plan's own length, and no touch is repeated because nothing could tell whether it arrived.",
          "default": {
            "value": 3,
            "confidence": "high",
            "basis": "corpus-rule",
            "applicableWhen": "GLB-24; an offer, one reminder and one closing message"
          },
          "required": false
        },
        "appliesTo": "all"
      },
      "cooldown": {
        "key": "substitution_offer.cooldown",
        "rule": "This journey is per the affected scope of the obligation and the single alternative offered against it; a later instance concerns a different the affected scope of the obligation and the single alternative offered against it and no cooldown applies between them.",
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
      "strategy": "offer-decide-remind",
      "touches": [
        {
          "id": "t1",
          "stage": "offer",
          "action": "a.offer",
          "prerequisites": [
            "c.reachable"
          ],
          "purpose": "State what cannot be supplied, name the one alternative and the difference in plain terms, and give explicit accept and decline paths with the date the offer ends.",
          "channelRoles": [
            "persistent",
            "urgent"
          ],
          "mandatory": false,
          "label": "CANONICAL_RULE",
          "destination": {
            "target": "accept-or-decline-substitute",
            "boundTo": "substitution_offer_id",
            "mustNotClaim": [
              "that silence means acceptance"
            ]
          }
        },
        {
          "id": "t2",
          "stage": "remind",
          "action": "a.remind",
          "after": "t1",
          "gatedBy": "w.decision",
          "prerequisites": [],
          "purpose": "Send one reminder naming the same alternative, the same two paths and the exact date the offer closes.",
          "channelRoles": [
            "persistent",
            "urgent"
          ],
          "mandatory": false,
          "label": "CANONICAL_RULE",
          "destination": {
            "target": "accept-or-decline-substitute",
            "boundTo": "substitution_offer_id",
            "mustNotClaim": [
              "a moved closing date"
            ]
          }
        },
        {
          "id": "t3",
          "stage": "confirm-accept",
          "action": "a.confirm-accept",
          "gatedBy": "w.decision",
          "prerequisites": [
            "c.answer"
          ],
          "purpose": "Confirm what will now be supplied, on what terms, and what is unchanged about the rest of the obligation.",
          "channelRoles": [
            "persistent",
            "urgent"
          ],
          "mandatory": false,
          "label": "CANONICAL_RULE"
        },
        {
          "id": "t4",
          "stage": "confirm-decline",
          "action": "a.confirm-decline",
          "gatedBy": "w.decision",
          "prerequisites": [
            "c.answer"
          ],
          "purpose": "Confirm the decline, say that the obligation stays open and unfulfilled for the affected scope, and name what happens to it next.",
          "channelRoles": [
            "persistent",
            "urgent"
          ],
          "mandatory": false,
          "label": "CANONICAL_RULE"
        },
        {
          "id": "t5",
          "stage": "lapse",
          "action": "a.lapse",
          "gatedBy": "w.final",
          "prerequisites": [],
          "purpose": "Close the offer, release the alternative and say plainly that nothing was substituted and the affected scope is still open.",
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
        "s.g4",
        "s.g5"
      ]
    },
    implementation: {
      "attributes": {
        "required": [
          "obligation_id",
          "substitution_offer_id",
          "affected_scope",
          "alternative",
          "difference_statement",
          "offer_closes_at"
        ],
        "optional": []
      }
    },
    measurement: {
      "journeyOutcome": {
        "type": "exit-or-handoff",
        "refs": [
          "x.accepted",
          "x.declined",
          "x.lapsed",
          "h.unreachable"
        ]
      },
      "businessOutcome": {
        "event": "substitute_approved",
        "unit": "instance",
        "observationScope": {
          "type": "self"
        },
        "window": {
          "type": "until-exit"
        },
        "attribution": "touched-before-event",
        "comparison": "not-applicable"
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
        "substitution approval",
        "substitute item offer",
        "replacement item consent",
        "out-of-stock substitution"
      ],
      "useCases": [
        "a defined alternative put to the person with a real decline path and a stated deadline",
        "nothing different ever supplied on the strength of silence"
      ]
    },
    entry: "t.substitute",
    nodes: [
      {
        id: "t.substitute",
        kind: "trigger",
        event: "substitution_required_with_defined_alternative",
        evidence: {
          requires: [
            "an authoritative exception recorded against a named scope of the obligation",
            "a specific alternative identified and actually available",
            "the difference between what was promised and what would be supplied instead",
          ],
          insufficientAlone: [
            "a delay with no alternative identified",
            "a supply warning that has not yet touched this obligation",
          ],
          source: "authoritative",
        },
        next: "c.reachable",
      },
      {
        id: "c.reachable",
        kind: "condition",
        asks: "Is there a permitted route that reaches them in time to decide?",
        branches: [
          {
            label: "Reachable",
            when: "at least one contact point is valid, permitted for a service notice of this kind, and arrives inside the decision window",
            to: "a.offer",
          },
          {
            label: "Unreachable",
            when: "no permitted route would arrive before the window would have to close",
            to: "h.unreachable",
          },
        ],
      },
      {
        id: "h.unreachable",
        kind: "handoff",
        to: "CON-36",
        on: "a substitution offer that cannot be delivered on any permitted route before its window closes",
        carries: [
          "the affected scope, the alternative and the decision window",
          "which routes were tried and why each was closed",
        ],
      },
      {
        id: "a.offer",
        kind: "action",
        does: "State what cannot be supplied, name the one alternative and the difference in plain terms, and give explicit accept and decline paths with the date the offer ends. A decline route harder to find than the accept route is not a choice",
        next: "w.decision",
        execution: "communication",
        idempotencyKey: "obligation_id + a.offer",
      },
      {
        id: "w.decision",
        kind: "wait",
        until: [
          "substitute_approved",
          "substitute_declined"
        ],
        onEvent: "c.answer",
        timeout: {
          "after": {
            "key": "substitution_offer.decision",
            "rule": "The point in the window at which one reminder can still be acted on.",
            "class": "reminder-before-attribute",
            "required": true
          },
          "reason": "the alternative is held against this offer and cannot be held for a decision nobody is making",
          "relativeTo": "attribute",
          "attribute": "offer_closes_at"
        },
        onTimeout: "a.remind",
        windowExtendsOnEngagement: false,
        recheck: "the the affected scope of the obligation and the single alternative offered against it re-read from the system of record before acting on the timeout",
      },
      {
        id: "c.answer",
        kind: "condition",
        asks: "What came back?",
        branches: [
          {
            label: "Accepted",
            when: "the recipient explicitly accepted the alternative",
            to: "a.confirm-accept",
          },
          {
            label: "Declined",
            when: "the recipient explicitly declined it",
            to: "a.confirm-decline",
          },
        ],
      },
      {
        id: "a.remind",
        kind: "action",
        does: "Send one reminder naming the same alternative, the same two paths and the exact date the offer closes. There is no second reminder - a choice nobody wanted to make is not made easier by being asked again",
        next: "w.final",
        execution: "communication",
        idempotencyKey: "obligation_id + a.remind",
      },
      {
        id: "w.final",
        kind: "wait",
        until: [
          "substitute_approved",
          "substitute_declined"
        ],
        onEvent: "c.answer",
        timeout: {
          "after": {
            "key": "substitution_offer.final",
            "rule": "After the reminder the offer stays open until its stated closing date and no longer; silence at that date lapses it and nothing is substituted.",
            "class": "attribute-bound",
            "required": true
          },
          "reason": "the held alternative is released when the window closes, which is the only reason the window exists",
          "relativeTo": "attribute",
          "attribute": "offer_closes_at"
        },
        onTimeout: "a.lapse",
        windowExtendsOnEngagement: false,
        recheck: "the the affected scope of the obligation and the single alternative offered against it re-read from the system of record before acting on the timeout",
      },
      {
        id: "a.confirm-accept",
        kind: "action",
        does: "Confirm what will now be supplied, on what terms, and what is unchanged about the rest of the obligation. Accepting a substitute creates a new promise, and it is stated as one rather than treated as the old one continuing",
        next: "x.accepted",
        execution: "communication",
        idempotencyKey: "obligation_id + a.confirm-accept",
      },
      {
        id: "x.accepted",
        kind: "exit",
        state: "alternative accepted and confirmed",
        terminal: false,
        reEntry: "a further exception on the same obligation is a new instance with its own offer",
        class: "success",
      },
      {
        id: "a.confirm-decline",
        kind: "action",
        does: "Confirm the decline, say that the obligation stays open and unfulfilled for the affected scope, and name what happens to it next. A decline is not a cancellation and must never be recorded as one",
        next: "x.declined",
        execution: "communication",
        idempotencyKey: "obligation_id + a.confirm-decline",
      },
      {
        id: "x.declined",
        kind: "exit",
        state: "alternative declined, affected scope still owed",
        terminal: false,
        reEntry: "a different alternative found later is a new offer",
        class: "failure",
      },
      {
        id: "a.lapse",
        kind: "action",
        does: "Close the offer, release the alternative and say plainly that nothing was substituted and the affected scope is still open. Silence at the end of a window gets read as agreement, which is exactly what a substitution must never rest on",
        next: "x.lapsed",
        execution: "communication",
        idempotencyKey: "obligation_id + a.lapse",
      },
      {
        id: "x.lapsed",
        kind: "exit",
        state: "offer lapsed undecided, affected scope still open",
        terminal: false,
        reEntry: "a new alternative identified later starts a new offer",
        class: "timeout",
      },
    ],
    guardrails: [
      "Nothing different is supplied on the strength of silence. Only an explicit acceptance moves the obligation.",
      "The decline path sits in the same message as the accept path and costs the same effort to take.",
      "A decline is not a cancellation. The affected scope remains open and owed.",
      "Scope already fulfilled is untouched. The offer covers only what the exception actually affects.",
      "One reminder before the window closes, never two.",
    ],
    reusableRule:
      "A substitute is only a substitute if the person it was offered to could have said no.",
  },
];
