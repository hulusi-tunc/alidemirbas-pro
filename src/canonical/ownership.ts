import type { CanonicalJourney, OrchestrationRule } from "./types";

/* CATEGORY 6 - OWNERSHIP, ASSIGNMENT, APPROVAL & DECISION AUTHORITY

   Who is responsible for a thing, and who is allowed to decide about it.

   Two chains, and almost every failure in this area is a jump across one arrow
   in one of them.

   Responsibility:
     routed      the work reached the right queue
     assigned    a named person was proposed
     accepted    they took it
     active      they are actually working it

   Authority:
     requested   someone asked for a decision
     reviewed    someone with authority looked at a specific version
     approved    they said yes to that version
     authorized  the governing policy says the required decision set is complete
     executed    the thing actually happened

   The jumps are cheap to make and expensive to discover. Assigned read as
   accepted leaves work nobody is doing. Approved read as authorized executes
   on one signature where policy needed three. Approved read as executed
   records an outcome that never occurred. And an approval that names no
   version quietly authorises whatever the subject later becomes, which is the
   one failure in this category that is invisible until it matters.

   Two rules here are refusals rather than mechanisms. OWN-57 will not infer a
   quorum, and OWN-58 will not infer materiality. Where the governing policy is
   silent, both stop and say so, because a guessed decision rule is
   indistinguishable from a real one right up until it is challenged. */

export const OWNERSHIP_RULES: readonly OrchestrationRule[] = [
  {
    id: "OWN-R1",
    scope: "ownership",
    rule: "Routing, assignment, acceptance and active ownership are four separate states.",
    because:
      "Work that is routed but unassigned, or assigned but unaccepted, looks owned in every report and is being done by nobody.",
  },
  {
    id: "OWN-R2",
    scope: "ownership",
    rule: "An ownership change preserves open obligations, deadlines and the historical owner chain.",
    because:
      "The obligation was made to someone outside the organisation; who holds it internally is our concern and not a reason for it to change.",
  },
  {
    id: "OWN-R3",
    scope: "ownership",
    rule: "Transferring ownership never resets an inherited commitment or its clock.",
    because:
      "A deadline that restarts on reassignment converts an internal handover into an external delay, and makes reassignment the cheapest way to buy time.",
  },
  {
    id: "OWN-R4",
    scope: "ownership",
    rule: "Owner and approver are separate roles unless a policy explicitly says one person holds both.",
    because:
      "Collapsing them removes the review from the process while leaving its record intact, which is worse than having no approval step at all.",
  },
  {
    id: "OWN-R5",
    scope: "ownership",
    rule: "An approval request references the exact subject version reviewed.",
    because:
      "An approval bound to an entity rather than a version silently authorises everything that entity later becomes, and nothing in the record shows when the authorisation stopped matching what was approved.",
  },
  {
    id: "OWN-R6",
    scope: "ownership",
    rule: "Approval is not execution. Authorisation permits an action; it does not perform it or record it as done.",
    because:
      "Systems that mark approved work as complete report a pipeline that has been authorised rather than one that has happened.",
  },
  {
    id: "OWN-R7",
    scope: "ownership",
    rule: "A material change invalidates only the approvals whose decision basis is no longer true.",
    because:
      "Invalidating everything on every edit trains people to approve without reading, which is the same outcome as having no approvals.",
  },
  {
    id: "OWN-R8",
    scope: "ownership",
    rule: "Multi-party approval aggregation comes from the governing policy. Majority, unanimity, quorum and tie-breaks are never inferred.",
    because:
      "An invented decision rule is indistinguishable from a real one until it is challenged, and by then it has been authorising things for months.",
  },
  {
    id: "OWN-R9",
    scope: "ownership",
    rule: "A rejected request re-enters approval only through an explicit revision path, and only where policy permits one.",
    because:
      "Without it, rejection becomes a retry loop: the same version resubmitted until an approver stops reading.",
  },
  {
    id: "OWN-R10",
    scope: "ownership",
    rule: "Escalation and ownership transfer are different operations and are not assumed to accompany each other.",
    because:
      "Treating every escalation as a handover lets the original owner put a case down by raising it, which is the opposite of what escalation is for.",
  },
  {
    id: "OWN-R11",
    scope: "ownership",
    rule: "Actions queued by a former owner or approver do not execute once that authority has ended.",
    because:
      "The message that arrives from someone who is no longer responsible is the visible half of a stale-authority bug, and the invisible half is whatever it committed us to.",
  },
  {
    id: "OWN-R12",
    scope: "ownership",
    rule: "A missing owner or authority is an explicit state, never a null field, wherever active responsibility is required.",
    because:
      "Null is unqueryable and unescalatable. Work with no owner has to be findable as work with no owner.",
  },
  {
    id: "OWN-R13",
    scope: "ownership",
    rule: "Owner, approver and decision records stay auditable. Nothing in the chain is overwritten in place.",
    because:
      "Who was responsible, who decided, and on what version, are the only questions that get asked after something goes wrong.",
  },
  {
    id: "OWN-R14",
    scope: "ownership",
    rule: "Internal approval establishes internal authorisation only. It does not establish that a counterparty has accepted anything.",
    because:
      "The two are separated by an act nobody on our side controls, and treating an internal yes as a done deal is how forecasts and commitments diverge.",
  },
];

export const OWNERSHIP_JOURNEYS: readonly CanonicalJourney[] = [
  /* ------------------------------------------------------------ OWN-51 */
  {
    id: "OWN-51",
    slug: "work-routing-to-responsibility",
    category: "ownership",
    goal: "routing-assignment",
    channels: ["task"],
    name: "Work created → routing → assignment",
    purpose:
      "Get new work into the smallest responsibility scope that is genuinely valid, and refuse to invent one where the policy is silent.",
    entity: {
      scope: "the individual work item - a case, lead, opportunity, task or request",
      note: "One item, one active routing. A duplicate routing event is not a second assignment, and treating it as one produces two people doing the same work differently.",
    },
    distinctFrom: [
      {
        journey: "OWN-52",
        because:
          "This decides where the work belongs. OWN-52 decides whether the person it landed on has taken it, which is a different state and frequently a different answer.",
      },
    ],
    entry: "t.created",
    nodes: [
      {
        id: "t.created",
        kind: "trigger",
        event: "work_item_requiring_responsibility",
        evidence: {
          requires: [
            "a work item created or becoming actionable, of a type that requires someone to be responsible for it",
          ],
          insufficientAlone: [
            "a draft not yet submitted",
            "a record created for reference with nothing to be done about it",
          ],
          source: "authoritative",
        },
        next: "c.existing",
      },
      {
        id: "c.existing",
        kind: "condition",
        asks: "Does this item already have an active owner or queue?",
        branches: [
          {
            label: "Already owned",
            when: "an active assignment exists on this item",
            to: "x.already-owned",
          },
          {
            label: "Unowned",
            when: "no active assignment exists",
            to: "a.inputs",
          },
        ],
      },
      {
        id: "x.already-owned",
        kind: "exit",
        state: "already owned; no second owner created",
        terminal: false,
        reEntry:
          "a genuine ownership change is OWN-54's, not a re-route. A duplicate routing event resolves here rather than producing a rival assignment - unless a multi-owner model is explicitly defined for this work type, which is a policy statement rather than an assumption",
      },
      {
        id: "a.inputs",
        kind: "action",
        does: "Gather the routing inputs the policy actually uses: work type, geography, expertise, existing account relationship, current workload, priority, entitlement, language, business segment",
        next: "c.route",
      },
      {
        id: "c.route",
        kind: "condition",
        asks: "Does a deterministic valid route exist for this item?",
        branches: [
          {
            label: "Route determined",
            when: "the routing rules resolve to a specific owner, team or queue",
            to: "a.route",
          },
          {
            label: "No route",
            when: "the rules do not resolve, or no rule covers this case",
            to: "a.fallback",
          },
        ],
      },
      {
        id: "a.fallback",
        kind: "action",
        does: "Place the item in the fallback or shared queue the policy names, or raise it for manual routing, recording that no route resolved. No ordering or priority is invented here - where the policy is silent the work waits visibly rather than being sorted by a rule nobody wrote and nobody can review",
        writes: [{ field: "routing_log", mode: "append" }],
        next: "x.queued",
        execution: "human",
      },
      {
        id: "a.route",
        kind: "action",
        does: "Route to the resolved owner, team or queue, recording which inputs produced the decision - a routing that cannot explain itself cannot be corrected when it is systematically wrong",
        writes: [{ field: "routing_log", mode: "append" }],
        next: "c.named",
        execution: "human",
      },
      {
        id: "c.named",
        kind: "condition",
        asks: "Does this work need a named owner now?",
        branches: [
          {
            label: "Named owner required",
            when: "the work cannot proceed, or its SLA cannot run, without a specific person responsible",
            to: "h.assign",
          },
          {
            label: "Queue ownership is enough",
            when: "the queue itself carries responsibility until the work reaches the point where a person picks it up",
            to: "x.queued",
          },
        ],
      },
      {
        id: "h.assign",
        kind: "handoff",
        to: "OWN-52",
        on: "work needing a named owner",
        carries: [
          "the routing decision and the inputs behind it",
          "any SLA already running, since assignment does not start the clock",
        ],
      },
      {
        id: "x.queued",
        kind: "exit",
        state: "queue ownership; no named owner yet",
        terminal: false,
        reEntry:
          "reaching the point where a person is required opens assignment; the queue is an owner, recorded as one rather than as an empty field",
      },
    ],
    guardrails: [
      "Where the routing rule is unknown, no priority logic is invented to stand in for it. The item goes to the fallback and says why.",
      "The assignment reason and its inputs are preserved, so a route that is consistently wrong can be found.",
      "One item does not acquire two active owners from duplicate routing events, unless a multi-owner model is explicitly defined for that work type.",
    ],
    reusableRule:
      "Work should enter the smallest valid responsibility scope before execution begins.",
  },

  /* ------------------------------------------------------------ OWN-52 */
  {
    id: "OWN-52",
    slug: "assignment-to-accepted-responsibility",
    category: "ownership",
    goal: "routing-assignment",
    channels: [],
    name: "Assignment → acceptance → active responsibility",
    purpose:
      "Keep proposed responsibility and accepted responsibility as different states, so work nobody has taken is visible as such.",
    entity: {
      scope: "the work item plus this specific assignment of it",
      note: "Each assignment is its own record. A rejected one and the reassignment that follows are two facts, and the first is routing information worth keeping.",
    },
    entry: "t.assigned",
    nodes: [
      {
        id: "t.assigned",
        kind: "trigger",
        event: "work_assigned_to_named_owner",
        evidence: {
          requires: ["an assignment naming a specific person as proposed owner"],
          insufficientAlone: [
            "a notification delivered to that person, which is delivery and not agreement",
            "the item appearing in their queue view",
          ],
          source: "authoritative",
        },
        next: "a.proposed",
      },
      {
        id: "a.proposed",
        kind: "action",
        does: "Record the state as ASSIGNED - proposed responsibility. Nothing that requires an active owner may proceed on this state, which is the entire reason it is distinct from the next one",
        writes: [{ field: "assignment_log", mode: "append" }],
        next: "c.required",
      },
      {
        id: "c.required",
        kind: "condition",
        asks: "Does this work type require explicit acceptance?",
        branches: [
          {
            label: "Acceptance required",
            when: "policy or the nature of the work means responsibility has to be taken rather than allocated",
            to: "w.acceptance",
          },
          {
            label: "Assignment is sufficient",
            when: "policy allocates this work type directly, and the owner is responsible on assignment",
            to: "a.active",
          },
        ],
      },
      {
        id: "w.acceptance",
        kind: "wait",
        until: ["the owner accepts", "the owner rejects"],
        onEvent: "c.response",
        timeout: {
          after: "the acceptance SLA for this work type",
          reason:
            "an assignment nobody has answered is not owned, and letting it sit unanswered is how work becomes invisible while appearing allocated",
        },
        onTimeout: "c.sla",
        windowExtendsOnEngagement: false,
      },
      {
        id: "c.response",
        kind: "condition",
        asks: "What did the proposed owner do?",
        branches: [
          { label: "Accepted", when: "they took responsibility", to: "a.active" },
          { label: "Rejected", when: "they declined it", to: "a.reason" },
        ],
      },
      {
        id: "a.reason",
        kind: "action",
        does: "Capture why it was rejected. The reason is routing information - wrong expertise, wrong region, conflict of interest, capacity - and it is what stops the next route repeating the mistake",
        writes: [{ field: "assignment_log", mode: "append" }],
        next: "a.invalidate",
      },
      {
        id: "a.invalidate",
        kind: "action",
        does: "Invalidate anything the un-accepted assignment queued, so nothing goes out under an ownership that was never taken",
        writes: [{ field: "suppressed_sends", mode: "append" }],
        next: "h.reroute",
      },
      {
        id: "h.reroute",
        kind: "handoff",
        to: "OWN-51",
        on: "an assignment that was not taken",
        carries: [
          "the rejection reason, so routing does not resolve to the same owner again",
          "the SLA already running, which reassignment does not restart",
        ],
      },
      {
        id: "c.sla",
        kind: "condition",
        asks: "With the acceptance SLA passed, what does policy do?",
        branches: [
          {
            label: "Escalate",
            when: "policy raises unanswered assignments rather than moving them",
            to: "h.escalate",
          },
          {
            label: "Reassign",
            when: "policy reroutes an assignment that was not answered in time",
            to: "a.invalidate",
          },
        ],
      },
      {
        id: "h.escalate",
        kind: "handoff",
        to: "OWN-55",
        on: "an assignment unanswered past its SLA",
        carries: ["who it was assigned to and when", "the work's own SLA, which has been running throughout"],
      },
      {
        id: "a.active",
        kind: "action",
        does: "Record ACTIVE_OWNERSHIP. From here the owner is answerable for the work, and the distinction from ASSIGNED is what makes that statement true rather than assumed",
        writes: [{ field: "assignment_log", mode: "append" }],
        next: "h.context",
      },
      {
        id: "h.context",
        kind: "handoff",
        to: "OWN-53",
        on: "responsibility becoming active",
        carries: ["the assignment and how it was reached", "everything the owner will need to actually continue"],
      },
    ],
    guardrails: [
      "Assigned is not accepted. A report counting assignments as owned work is counting proposals.",
      "A notification delivered to an owner is not responsibility accepted. Delivery is a fact about a message.",
      "Reassignment invalidates the previous owner's pending actions rather than leaving them to fire under an ownership that ended.",
    ],
    reusableRule:
      "Assignment creates proposed responsibility; acceptance establishes active responsibility when acceptance is required.",
  },

  /* ------------------------------------------------------------ OWN-53 */
  {
    id: "OWN-53",
    slug: "ownership-context-transfer",
    category: "ownership",
    goal: "ownership-transfer",
    channels: [],
    name: "Owner assignment → context transfer → work start",
    purpose:
      "Give a new owner what they need to continue an existing obligation, rather than an entity with their name on it.",
    entity: {
      scope: "the business entity plus the owner now responsible for it",
      note: "The entity's history belongs to the entity, not to whoever currently holds it. Ownership changes what the record points at, never what it contains.",
    },
    distinctFrom: [
      {
        journey: "OWN-52",
        because:
          "OWN-52 establishes that someone has taken responsibility. This establishes that they can actually discharge it, which fails independently and more quietly.",
      },
    ],
    entry: "t.effective",
    nodes: [
      {
        id: "t.effective",
        kind: "trigger",
        event: "owner_assignment_became_effective",
        evidence: {
          requires: ["a valid ownership assignment taking effect on an entity with existing state"],
          source: "authoritative",
        },
        next: "a.assemble",
      },
      {
        id: "a.assemble",
        kind: "action",
        does: "Assemble what the owner needs to continue: the current state, the open obligations, the deadlines running against them, decisions already taken, the history bearing on those decisions, pending dependencies, and anything promised to anyone",
        next: "c.sensitive",
      },
      {
        id: "c.sensitive",
        kind: "condition",
        asks: "Does that context include sensitive data this owner does not need?",
        branches: [
          {
            label: "More than needed",
            when: "the history contains personal, health, financial or confidential detail beyond what the work requires",
            to: "a.minimise",
          },
          {
            label: "Proportionate",
            when: "the context is what the work requires and no more",
            to: "c.ack",
          },
        ],
      },
      {
        id: "a.minimise",
        kind: "action",
        does: "Transfer what the work requires and no more. A handover is not a reason to widen who can see something, and the fact that it moved with the case is not a justification anyone will accept later",
        next: "c.ack",
      },
      {
        id: "c.ack",
        kind: "condition",
        asks: "Does policy require the owner to acknowledge critical items?",
        branches: [
          {
            label: "Acknowledgement required",
            when: "there are commitments or deadlines whose transfer has to be confirmed rather than assumed",
            to: "w.ack",
          },
          {
            label: "Not required",
            when: "the context transfers without a confirmation step",
            to: "a.start",
          },
        ],
      },
      {
        id: "w.ack",
        kind: "wait",
        until: ["the owner acknowledges the critical items"],
        onEvent: "a.start",
        timeout: {
          after: "a bounded acknowledgement window",
          reason:
            "unacknowledged critical context is the state in which a deadline is missed by someone who did not know it existed",
        },
        onTimeout: "h.escalate",
        windowExtendsOnEngagement: false,
      },
      {
        id: "h.escalate",
        kind: "handoff",
        to: "OWN-55",
        on: "critical context left unacknowledged",
        carries: [
          "what was not acknowledged and what depends on it",
          "the deadlines still running, which acknowledgement was never going to pause",
        ],
      },
      {
        id: "a.start",
        kind: "action",
        does: "The owner begins from the current authoritative state. The entity's lifecycle is not restarted, its history is not cleared, and the previous owners remain in the chain - a new owner is a continuation, not a first contact",
        writes: [{ field: "ownership_chain", mode: "append" }],
        next: "x.working",
      },
      {
        id: "x.working",
        kind: "exit",
        state: "owner working from current state with inherited context",
        terminal: false,
        reEntry: "the next ownership change opens its own transfer",
      },
    ],
    guardrails: [
      "A new owner does not restart the lifecycle. The obligation is older than their involvement in it.",
      "Assignment appends to the ownership chain rather than overwriting who held it before.",
      "Context transfer is proportionate. Sensitive detail does not travel simply because it was attached to the case.",
    ],
    reusableRule:
      "Ownership becomes operationally useful only when the new owner inherits the context required to continue the existing obligation.",
  },

  /* ------------------------------------------------------------ OWN-54 */
  {
    id: "OWN-54",
    slug: "ownership-change-obligation-transfer",
    category: "ownership",
    goal: "ownership-transfer",
    channels: ["task"],
    name: "Ownership change → transfer obligations → continue",
    purpose:
      "Move responsibility for an active entity without losing anything that was already owed, without letting the clock restart, and without rewriting who did what before the change.",
    entity: {
      scope: "the business entity, its previous owner and its next one",
      note: "Three parties in the record. The chain is what makes it possible to say who was responsible at the time something did or did not happen.",
    },
    entry: "t.change",
    nodes: [
      {
        id: "t.change",
        kind: "trigger",
        event: "authoritative_ownership_change",
        evidence: {
          requires: ["a recorded change of owner on an entity with active obligations"],
          source: "authoritative",
        },
        next: "a.record",
      },
      {
        id: "a.record",
        kind: "action",
        does: "Record the previous owner, the next owner, the reason and the effective time, appended to the ownership chain",
        writes: [{ field: "ownership_chain", mode: "append" }],
        next: "a.history",
      },
      {
        id: "a.history",
        kind: "action",
        does: "Leave every historical action, decision, payment, document, approval and obligation attributed exactly as it occurred. This is done first rather than last, because everything after it is tempted to rewrite it - and a new owner appearing as the author of last year's approvals produces a record that is not merely wrong but actively misleading to anyone auditing it",
        writes: [{ field: "ownership_chain", mode: "append" }],
        next: "a.inventory",
      },
      {
        id: "a.inventory",
        kind: "action",
        does: "Identify everything still open and everything that depends on who the owner is: tasks, commitments, deadlines, live escalations, follow-ups promised to people, decisions pending, access, responsibilities, pending approvals, notifications, billing and administrative contacts, assigned work, delegations and external representations. Every deadline carries across unchanged - a commitment made to someone outside the organisation does not move because we moved who holds it internally",
        writes: [{ field: "obligation_transfer_log", mode: "append" }],
        next: "a.invalidate",
      },
      {
        id: "a.invalidate",
        kind: "action",
        does: "Invalidate the previous owner's queued actions that they are clearly no longer authorised to take. An action scheduled under an ownership that has ended and delivered afterwards comes from someone who is not responsible any more, and neither the recipient nor the new owner will know that. Actions that may still be valid are not invalidated here - they are held and revalidated once the transfer completes",
        writes: [{ field: "suppressed_sends", mode: "append" }],
        next: "c.acceptance",
      },
      {
        id: "c.acceptance",
        kind: "condition",
        asks: "Does the incoming owner have to accept the transfer?",
        branches: [
          {
            label: "Acceptance required",
            when: "policy requires the new owner to take it rather than receive it",
            to: "w.acceptance",
          },
          {
            label: "Transfer is effective directly",
            when: "policy moves ownership without a confirmation step, or the cutover has already completed elsewhere",
            to: "a.dependent",
          },
        ],
      },
      {
        id: "w.acceptance",
        kind: "wait",
        until: ["the incoming owner accepts", "the incoming owner declines"],
        onEvent: "c.result",
        timeout: {
          after: "the transfer acceptance window",
          reason:
            "an unanswered transfer leaves the entity between two owners, which is the one state in which nobody is responsible while the record says somebody is",
        },
        onTimeout: "c.failed",
        windowExtendsOnEngagement: false,
      },
      {
        id: "c.result",
        kind: "condition",
        asks: "Did the incoming owner take it?",
        branches: [
          { label: "Accepted", when: "they accepted the transfer", to: "a.dependent" },
          { label: "Declined", when: "they declined it", to: "c.failed" },
        ],
      },
      {
        id: "c.failed",
        kind: "condition",
        asks: "The transfer did not complete - what does policy provide?",
        branches: [
          {
            label: "A fallback owner",
            when: "policy names a fallback for failed transfers",
            to: "a.fallback",
          },
          {
            label: "No fallback",
            when: "no fallback is defined",
            to: "h.escalate",
          },
        ],
      },
      {
        id: "a.fallback",
        kind: "action",
        does: "Assign the fallback owner and record that the intended transfer failed, so the fallback is visible as a fallback rather than as the original plan",
        writes: [{ field: "ownership_chain", mode: "append" }],
        next: "a.dependent",
        execution: "human",
      },
      {
        id: "a.dependent",
        kind: "action",
        does: "Take each owner-dependent item from the inventory in turn - access, responsibilities, pending approvals, notifications, billing and administrative contacts, assigned work, delegations, external representations - and establish what it actually attaches to",
        writes: [{ field: "obligation_transfer_log", mode: "append" }],
        next: "c.entity-vs-owner",
      },
      {
        id: "c.entity-vs-owner",
        kind: "condition",
        asks: "Does this dependency belong to the entity or to the person who owned it?",
        branches: [
          {
            label: "To the entity",
            when: "it exists because the entity has an owner rather than because of who that owner was",
            to: "a.follow",
          },
          {
            label: "To the previous owner personally",
            when: "it is theirs - a personal commitment, a personal obligation, an individually held right",
            to: "a.preserve-personal",
          },
        ],
      },
      {
        id: "a.follow",
        kind: "action",
        does: "Move it to the current owner. A billing contact, an administrative notification and an escalation path follow whoever is accountable now, because that is what they were always pointing at",
        writes: [{ field: "obligation_transfer_log", mode: "append" }],
        next: "c.pending-authority",
      },
      {
        id: "a.preserve-personal",
        kind: "action",
        does: "Leave it with the previous owner. Contracts, payments and obligations frequently belong to the entity rather than to its owner, and just as frequently the reverse - each is evaluated rather than moved by default, because moving one wrongly transfers a liability nobody agreed to take on",
        writes: [{ field: "obligation_transfer_log", mode: "append" }],
        next: "c.pending-authority",
      },
      {
        id: "c.pending-authority",
        kind: "condition",
        asks: "Is any pending action authorised only by the previous ownership state?",
        branches: [
          {
            label: "There is",
            when: "an approval, an instruction or a scheduled change rests on the previous owner's authority",
            to: "a.revalidate-pending",
          },
          {
            label: "There is not",
            when: "nothing outstanding depends on who the owner was",
            to: "c.delegations",
          },
        ],
      },
      {
        id: "a.revalidate-pending",
        kind: "action",
        does: "Hold it and revalidate before execution. An action approved by somebody who is no longer the owner is an authorisation whose basis has gone, and executing it applies a decision the current owner never made and may not have made",
        writes: [{ field: "obligation_transfer_log", mode: "append" }],
        next: "c.delegations",
      },
      {
        id: "c.delegations",
        kind: "condition",
        asks: "Does any delegation depend on the previous owner's authority?",
        branches: [
          {
            label: "One or more do",
            when: "delegations were granted by the previous owner out of authority they no longer hold",
            to: "h.delegations",
          },
          {
            label: "None",
            when: "no live delegation derives from the previous owner",
            to: "h.context",
          },
        ],
      },
      {
        id: "h.delegations",
        kind: "handoff",
        to: "CTL-237",
        on: "delegations derived from an authority that has changed hands",
        carries: [
          "the delegations, their scope and the authority they were granted from",
          "the explicit fact that a delegation cannot outlive the authority it borrowed, and that only delegation-derived rights are removed",
        ],
      },
      {
        id: "h.escalate",
        kind: "handoff",
        to: "OWN-55",
        on: "a transfer that failed with no fallback",
        carries: [
          "the entity, its open obligations and their unchanged deadlines",
          "the explicit fact that it currently has no valid owner - which is a state, not an empty field",
        ],
      },
      {
        id: "h.context",
        kind: "handoff",
        to: "OWN-53",
        on: "ownership successfully moved",
        carries: [
          "the full obligation inventory with original deadlines intact",
          "the ownership chain, so the new owner can see what was decided before they arrived",
        ],
        suppresses: ["every action still queued under the previous ownership"],
      },
    ],
    guardrails: [
      "A transfer never resets an inherited deadline or commitment. Only an explicit renegotiation of the obligation itself does that, and that is a different event with a different record.",
      "Stale actions from the former owner do not execute after the transfer.",
      "The historical owner chain is preserved in full.",
      "Work is never silently orphaned. A failed transfer escalates rather than leaving a null owner.",
      "An ownership change is not a rewrite of historical attribution: past actions, decisions, payments, documents and approvals stay attributed to whoever performed them.",
      "Pending responsibilities are never transferred blindly; each is evaluated for whether it follows the entity or the person.",
      "Contracts and financial obligations may belong to the entity rather than to its owner and are evaluated separately.",
    ],
    reusableRule:
      "Ownership changes who is responsible for an obligation; they do not create a new obligation or reset its history.",
  },

  /* ------------------------------------------------------------ OWN-55 */
  {
    id: "OWN-55",
    slug: "responsibility-escalation",
    category: "ownership",
    goal: "escalation-exception",
    channels: ["task"],
    name: "Responsibility escalation → higher authority → resolution or return",
    purpose:
      "Move a blocker up to the level that can clear it, without the original owner putting the work down by raising it.",
    entity: {
      scope: "the work item plus its ownership chain",
      note: "Escalation attaches to the chain rather than replacing it. Who escalated, to whom, and whether ownership moved are three separate facts.",
    },
    distinctFrom: [
      {
        journey: "OWN-54",
        because:
          "Escalation is usually a request for a decision, not a handover. Where it does move ownership, it hands to OWN-54 to do that properly rather than doing it as a side effect.",
      },
    ],
    entry: "t.escalation",
    nodes: [
      {
        id: "t.escalation",
        kind: "trigger",
        event: "escalation_condition_met",
        evidence: {
          requires: [
            "a defined escalation condition: an SLA breached or at risk, an authority limit reached, a severity threshold crossed, a blocker the owner cannot clear, repeated failed resolution, or an explicit requirement to escalate",
          ],
          insufficientAlone: [
            "an owner finding the work difficult",
            "elapsed time with no defined SLA behind it",
          ],
          source: "authoritative",
        },
        next: "a.capture",
      },
      {
        id: "a.capture",
        kind: "action",
        does: "Capture why it is escalating and the current context, so the higher authority is deciding rather than re-discovering the case",
        writes: [{ field: "escalation_log", mode: "append" }],
        next: "c.destination",
      },
      {
        id: "c.destination",
        kind: "condition",
        asks: "Does policy define a valid escalation destination for this?",
        branches: [
          {
            label: "Defined",
            when: "an escalation path exists for this work type and condition",
            to: "c.transfers",
          },
          {
            label: "Undefined",
            when: "no escalation path covers this case",
            to: "h.no-path",
          },
        ],
      },
      {
        id: "h.no-path",
        kind: "handoff",
        to: "DEC-181",
        on: "an escalation with no defined destination",
        carries: [
          "the escalation reason and everything gathered",
          "the fact that no path was invented to route it, which is why a person is being asked",
        ],
      },
      {
        id: "c.transfers",
        kind: "condition",
        asks: "Does escalating transfer ownership, or ask for a decision?",
        branches: [
          {
            label: "Ownership moves",
            when: "policy says the higher authority takes the work rather than advising on it",
            to: "h.transfer",
          },
          {
            label: "Decision or support only",
            when: "the original owner stays responsible and needs a decision, an authority, or help",
            to: "a.support",
          },
        ],
      },
      {
        id: "h.transfer",
        kind: "handoff",
        to: "OWN-54",
        on: "an escalation that genuinely moves ownership",
        carries: [
          "the escalation reason as the transfer reason",
          "the open obligations, whose deadlines the transfer does not reset",
        ],
      },
      {
        id: "a.support",
        kind: "action",
        does: "Record that the original owner remains responsible while the higher authority is asked for a decision or support. Escalating is not putting the work down, and the record has to say so or the case falls between two people who each believe the other has it",
        writes: [{ field: "escalation_log", mode: "append" }],
        next: "w.resolution",
      },
      {
        id: "w.resolution",
        kind: "wait",
        until: ["a decision is provided", "the blocker is resolved"],
        onEvent: "c.resolved",
        timeout: {
          after: "the escalation SLA at this level",
          reason:
            "an escalation that produces nothing is itself a blocker, and it is the one the original owner cannot escalate around",
        },
        onTimeout: "c.further",
        windowExtendsOnEngagement: false,
      },
      {
        id: "c.resolved",
        kind: "condition",
        asks: "What did the higher authority produce?",
        branches: [
          {
            label: "Unblocked, work continues",
            when: "the decision or support clears the blocker and the work goes on",
            to: "x.returned",
          },
          {
            label: "Resolved outright",
            when: "the higher authority's decision closes the work itself",
            to: "x.closed",
          },
        ],
      },
      {
        id: "x.returned",
        kind: "exit",
        state: "blocker cleared; the original owner continues",
        terminal: false,
        reEntry:
          "nothing is handed back, because nothing was handed over - the owner has been responsible throughout and now has what they were missing",
      },
      {
        id: "x.closed",
        kind: "exit",
        state: "resolved at the escalated level",
        terminal: false,
        reEntry: "a recurrence is a new escalation, judged with this one in the history",
      },
      {
        id: "c.further",
        kind: "condition",
        asks: "Is there a further escalation level that has not been used?",
        branches: [
          {
            label: "Level remains",
            when: "the policy's ladder has another rung",
            to: "a.next-level",
          },
          {
            label: "Ladder exhausted",
            when: "every defined level has been tried",
            to: "h.exhausted",
          },
        ],
      },
      {
        id: "a.next-level",
        kind: "action",
        does: "Escalate one level further and record the level. The ladder is walked once - a loop that keeps re-escalating to the same place is how an unresolvable case stays busy without moving",
        writes: [{ field: "escalation_log", mode: "append" }],
        next: "w.resolution",
        execution: "human",
      },
      {
        id: "h.exhausted",
        kind: "handoff",
        to: "DEC-181",
        on: "work outliving the whole escalation ladder",
        carries: [
          "every level tried, when, and what came back",
          "the original blocker, still unresolved",
        ],
      },
    ],
    guardrails: [
      "Escalation is not abandonment. Unless ownership explicitly transfers, the original owner remains responsible throughout.",
      "The escalation path comes from policy. Where none is defined, none is invented.",
      "Repeated escalation is bounded by the ladder rather than by patience.",
      "An exhausted ladder closes as an operational exception with no customer-facing message. The person on the other end of the work is owed an outcome from whoever picks it up, not a notification that our escalation ran out.",
      "Escalation is an internal operational state throughout. Reaching a level creates no customer communication by itself; a message goes out only where a separate communication obligation exists for it, and an internal delay is not news about what the customer wants."
    ],
    reusableRule:
      "Escalation moves unresolved work to the level capable of resolving the specific blocker without losing existing responsibility context.",
  },

  /* ------------------------------------------------------------ OWN-56 */
  {
    id: "OWN-56",
    slug: "approval-request-review",
    category: "ownership",
    goal: "decision-approval",
    channels: ["task"],
    name: "Approval request → review → approve, reject or request changes",
    purpose:
      "Bind an approval to the exact version reviewed, and keep approving separate from doing.",
    entity: {
      scope: "the approval request, bound to one specific version of the subject",
      note: "The version binding is the mechanism. An approval attached to an entity rather than a version authorises whatever that entity becomes afterwards.",
    },
    distinctFrom: [
      {
        journey: "OWN-57",
        because:
          "This is one decision by one authority. OWN-57 exists because combining several decisions requires an aggregation policy that this journey never has to consult.",
      },
    ],
    entry: "t.ready",
    nodes: [
      {
        id: "t.ready",
        kind: "trigger",
        event: "approval_required_request_ready",
        evidence: {
          requires: ["a request of a type requiring approval, with an identifiable subject version"],
          insufficientAlone: ["a draft still being edited, which has no stable version to review"],
          source: "authoritative",
        },
        next: "a.create",
      },
      {
        id: "a.create",
        kind: "action",
        does: "Create the approval request bound to the exact version of the subject under review, and record the state as PENDING_REVIEW. Requested is not approved, and until this resolves nothing downstream may act as though it were",
        writes: [{ field: "approval_log", mode: "append" }],
        next: "w.review",
        execution: "human",
      },
      {
        id: "w.review",
        kind: "wait",
        until: ["approved", "rejected", "changes requested"],
        onEvent: "c.outcome",
        timeout: {
          after: "the approval SLA",
          reason:
            "nothing is approved by the passage of time, so the deadline produces an escalation or an expiry and never a default yes",
        },
        onTimeout: "c.sla",
        windowExtendsOnEngagement: false,
      },
      {
        id: "c.outcome",
        kind: "condition",
        asks: "What did the reviewer decide?",
        branches: [
          { label: "APPROVED", when: "the reviewed version is approved", to: "a.approved" },
          { label: "REJECTED", when: "the reviewed version is rejected", to: "h.rejected" },
          {
            label: "CHANGES_REQUESTED",
            when: "the reviewer wants a different version",
            to: "a.changes",
          },
        ],
      },
      {
        id: "a.approved",
        kind: "action",
        does: "Record the approval against the exact version reviewed, with who approved it and when. This authorises that version and nothing else",
        writes: [{ field: "approval_log", mode: "append" }],
        next: "h.execute",
      },
      {
        id: "h.execute",
        kind: "handoff",
        to: "DEC-185",
        on: "an approved version becoming authorised to proceed",
        carries: [
          "the approved version identifier, which execution must check it is still acting on",
          "the approval record, so an internal yes is not confused with an external acceptance",
        ],
      },
      {
        id: "h.rejected",
        kind: "handoff",
        to: "OWN-59",
        on: "a rejected approval outcome",
        carries: ["the rejection reason", "the exact version rejected, which must not later execute"],
      },
      {
        id: "a.changes",
        kind: "action",
        does: "Close this request against this version. A revised subject is a different version and needs its own request - carrying this one forward would approve something nobody read",
        writes: [{ field: "approval_log", mode: "append" }],
        next: "x.revision",
      },
      {
        id: "x.revision",
        kind: "exit",
        state: "changes requested; this request closed against this version",
        terminal: false,
        reEntry:
          "a revised version submits a new request. This one does not approve it, whatever the revision turns out to contain",
      },
      {
        id: "c.sla",
        kind: "condition",
        asks: "With the approval SLA passed, what does policy do?",
        branches: [
          {
            label: "Escalate",
            when: "policy escalates unreviewed approvals to a higher or alternative authority",
            to: "h.escalate",
          },
          {
            label: "Expire",
            when: "policy expires the request rather than escalating it",
            to: "x.expired",
          },
        ],
      },
      {
        id: "h.escalate",
        kind: "handoff",
        to: "OWN-55",
        on: "an approval left unreviewed past its SLA",
        carries: ["the request and the version awaiting review", "how long it has been waiting"],
      },
      {
        id: "x.expired",
        kind: "exit",
        state: "expired unreviewed; nothing approved",
        terminal: false,
        reEntry:
          "a new request may be raised against the same or a newer version - the expiry authorises nothing, which is the point of expiring rather than defaulting",
      },
    ],
    guardrails: [
      "Requested is not approved. The pending state exists so nothing can quietly proceed on the request itself.",
      "Approval is not execution. It authorises an action that still has to happen and be recorded separately.",
      "The approval names the exact version reviewed. An approval without a version is an authorisation with no boundary.",
    ],
    reusableRule:
      "Approval authorizes a specific reviewed state; it should not silently authorize materially different future states.",
  },

  /* ------------------------------------------------------------ OWN-57 */
  {
    id: "OWN-57",
    slug: "multi-party-approval-aggregation",
    category: "ownership",
    goal: "decision-approval",
    channels: [],
    name: "Multi-party approval → aggregate required decisions → authorised or blocked",
    purpose:
      "Combine several genuinely independent approval decisions strictly according to the governing policy, and refuse to proceed where no policy defines how.",
    entity: {
      scope: "the approval package, the action and subject version it authorises, and each authority's individual decision",
      note: "Each decision is its own record against its own version. Aggregation reads them; it never replaces them. Several people holding access is not multi-party authorization - the requirement is that distinct authorities approve the same specific thing.",
    },
    entry: "t.ready",
    nodes: [
      {
        id: "t.ready",
        kind: "trigger",
        event: "multi_party_approval_ready",
        evidence: {
          requires: ["a request that a rule requires more than one independent authority to authorise, with an identifiable action and subject version"],
          insufficientAlone: [
            "several people holding administrative access, which means each of them can act alone",
          ],
          source: "authoritative",
        },
        next: "c.policy",
      },
      {
        id: "c.policy",
        kind: "condition",
        asks: "Is the aggregation policy defined for this decision?",
        branches: [
          {
            label: "Defined",
            when: "policy states who must decide, in what order if any, what threshold applies, and what constitutes a complete decision set",
            to: "c.independence",
          },
          {
            label: "Not defined",
            when: "no policy states how these decisions combine",
            to: "h.undefined",
          },
        ],
      },
      {
        id: "h.undefined",
        kind: "handoff",
        to: "DEC-181",
        on: "multi-party approval with no governing aggregation policy",
        carries: [
          "the request, the version and the approvers involved",
          "the explicit fact that no majority, quorum, unanimity, threshold or tie-break rule was assumed in order to proceed, and that no assumption was made about which authorities count as independent - without that, one person approving through two roles satisfies a two-person rule and nobody can see that they did",
        ],
        suppresses: ["any execution that depends on this authorisation"],
      },
      {
        id: "c.independence",
        kind: "condition",
        asks: "Are the independence rules between the required authorities defined?",
        branches: [
          {
            label: "Defined",
            when: "the policy states what makes two authorities distinct for this decision",
            to: "a.graph",
          },
          {
            label: "Not defined",
            when: "nothing states what independence means here",
            to: "h.undefined",
          },
        ],
      },
      {
        id: "a.graph",
        kind: "action",
        does: "Build the approval graph from the policy - parallel, sequential, or whatever structure it defines - together with the threshold the policy sets, and bind the package to the exact action and subject version it authorises. Record which policy defined it, so the aggregation can be explained and audited rather than merely trusted",
        writes: [{ field: "approval_log", mode: "append" }],
        next: "w.decisions",
      },
      {
        id: "w.decisions",
        kind: "wait",
        until: [
          "the required decision set resolves",
          "a blocking rejection arrives",
          "changes are requested by any approver",
          "the action or subject version changes underneath the package",
        ],
        onEvent: "c.aggregate",
        timeout: {
          after: "the approval SLA for the package",
          reason:
            "a partial decision set is not an authorisation, and waiting longer does not turn it into one",
        },
        onTimeout: "h.escalate",
        windowExtendsOnEngagement: false,
      },
      {
        id: "h.escalate",
        kind: "handoff",
        to: "OWN-55",
        on: "a decision set left incomplete past its SLA",
        carries: ["which decisions are outstanding and from whom", "how long the package has been open"],
      },
      {
        id: "c.aggregate",
        kind: "condition",
        asks: "What does the policy say about the decisions received?",
        branches: [
          {
            label: "Blocking rejection",
            when: "a rejection that the policy defines as blocking has been recorded",
            to: "a.blocked",
          },
          {
            label: "Changes requested",
            when: "an approver requires a different version",
            to: "a.revalidate",
          },
          {
            label: "The action or version changed underneath the package",
            when: "what is being authorised is no longer what the collected decisions were given against",
            to: "a.rebind",
          },
          {
            label: "Required set satisfied",
            when: "the policy's threshold and condition for a complete decision set are met",
            to: "a.check-independence",
          },
        ],
      },
      {
        id: "a.rebind",
        kind: "action",
        does: "Re-evaluate the collected decisions against the changed action and version, and discard any that no longer apply. Approvals bind to a version - an approval given for one amount does not carry to a larger one, and carrying it forward is how a threshold gets met for something nobody approved",
        writes: [{ field: "approval_log", mode: "append" }],
        next: "w.decisions",
      },
      {
        id: "a.check-independence",
        kind: "action",
        does: "Verify each counted decision came from a genuinely distinct authority under the policy's independence rules. The same person approving through two roles is one authority counted twice, and it is by far the most common way a two-person rule is satisfied by one person",
        next: "c.independent",
      },
      {
        id: "c.independent",
        kind: "condition",
        asks: "Are the counted decisions genuinely independent?",
        branches: [
          {
            label: "Independent",
            when: "each counted decision comes from a distinct authority under the policy's rules",
            to: "a.authorize",
          },
          {
            label: "Not independent",
            when: "two or more counted decisions resolve to the same authority",
            to: "a.short",
          },
        ],
      },
      {
        id: "a.short",
        kind: "action",
        does: "Record that the threshold was not genuinely met, naming the duplicate authority, and keep waiting. The count looked satisfied and was not, and saying which decisions collapsed is what lets somebody find a genuinely independent approver rather than re-reading the same one",
        writes: [{ field: "approval_log", mode: "append" }],
        next: "w.decisions",
      },
      {
        id: "a.blocked",
        kind: "action",
        does: "Record the authorisation as blocked, naming the rejection that blocked it. One approval among several is never read as approval by all required parties",
        writes: [{ field: "approval_log", mode: "append" }],
        next: "x.blocked",
      },
      {
        id: "x.blocked",
        kind: "exit",
        state: "authorisation blocked by a decision the policy treats as blocking",
        terminal: false,
        reEntry:
          "a revised version may be submitted where the policy permits it; the blocking decision stays in the record either way",
      },
      {
        id: "a.revalidate",
        kind: "action",
        does: "Identify which decisions already given the revision actually invalidates. Only those are re-opened - an approver whose basis has not changed is not asked to approve the same thing twice, which is how approval fatigue starts",
        writes: [{ field: "approval_log", mode: "append" }],
        next: "x.revision",
      },
      {
        id: "x.revision",
        kind: "exit",
        state: "revision required; affected decisions re-opened, unaffected ones retained",
        terminal: false,
        reEntry: "the revised version enters as its own package with the retained decisions carried forward",
      },
      {
        id: "a.authorize",
        kind: "action",
        does: "Record AUTHORIZED, naming which decisions satisfied which part of the policy, which authority each came from and the exact action and version they authorised - so that what authorised this can be reconstructed without inferring it, and so a changed action needs the threshold met again",
        writes: [{ field: "approval_log", mode: "append" }],
        next: "h.execute",
      },
      {
        id: "h.execute",
        kind: "handoff",
        to: "DEC-185",
        on: "the governing policy's decision set being satisfied",
        carries: [
          "the authorised version and the decision set behind it",
          "the fact that this is internal authorisation, which is not a counterparty's acceptance of anything",
        ],
      },
    ],
    guardrails: [
      "Aggregation logic comes from the governing policy. Majority, unanimity, quorum, tie-breaks and any n-of-m rule are never inferred, and where none is defined the journey stops rather than choosing one.",
      "One approval is not approval by all required parties.",
      "Sequential dependencies are respected where the policy defines them.",
      "A materially revised subject re-opens the decisions whose basis it changed, and only those.",
      "Multiple administrators are not multi-party authorization.",
      "The same authority is never counted twice where independence is required.",
      "Collected decisions bind to the same action and version; a changed action re-opens the threshold.",
    ],
    reusableRule:
      "Multi-party authorization is complete only when the governing decision policy says the required decision set has been satisfied.",
  },

  /* ------------------------------------------------------------ OWN-58 */
  {
    id: "OWN-58",
    slug: "material-change-after-approval",
    category: "ownership",
    goal: "decision-approval",
    channels: ["task"],
    name: "Material change after approval → impact check → re-approval or continue",
    purpose:
      "Work out whether an approval still covers what the subject has become, and re-open only the decisions whose basis stopped being true.",
    entity: {
      scope: "the approved subject, its version history and the approvals bound to those versions",
      note: "Approvals are bound to versions, which is what makes this question answerable at all. Without the binding there is nothing to compare the current state against.",
    },
    entry: "t.changed",
    nodes: [
      {
        id: "t.changed",
        kind: "trigger",
        event: "approved_subject_changed_before_execution",
        evidence: {
          requires: [
            "a change to a subject that already carries an approval, before that approval has been fully executed or the work completed",
          ],
          source: "authoritative",
        },
        next: "a.compare",
      },
      {
        id: "a.compare",
        kind: "action",
        does: "Compare the approved version with the current one and establish exactly what changed - value, scope, quantity, discount, destination, risk profile, commercial terms, a critical configuration, or something none of those cover",
        writes: [{ field: "approval_log", mode: "append" }],
        next: "c.policy",
      },
      {
        id: "c.policy",
        kind: "condition",
        asks: "Does policy define what counts as material for this subject?",
        branches: [
          {
            label: "Defined",
            when: "a materiality rule exists for this kind of subject and change",
            to: "c.material",
          },
          {
            label: "Not defined",
            when: "no rule says whether this change matters",
            to: "h.undefined",
          },
        ],
      },
      {
        id: "h.undefined",
        kind: "handoff",
        to: "DEC-181",
        on: "a change whose materiality no policy defines",
        carries: [
          "both versions and the difference between them",
          "the existing approvals, held rather than either invalidated or trusted",
        ],
        suppresses: ["execution of the affected parts while materiality is undetermined"],
      },
      {
        id: "c.material",
        kind: "condition",
        asks: "Is the change material to the basis on which approval was given?",
        branches: [
          {
            label: "Not material",
            when: "the change does not touch anything the approval decision rested on",
            to: "x.still-valid",
          },
          {
            label: "Material",
            when: "the change alters something an approver relied on",
            to: "a.identify",
          },
        ],
      },
      {
        id: "x.still-valid",
        kind: "exit",
        state: "existing approval remains valid",
        terminal: false,
        reEntry:
          "a further change is compared against the same approved version - minor edits accumulating into a material difference is exactly what this comparison is for",
      },
      {
        id: "a.identify",
        kind: "action",
        does: "Identify which approvals rested on the part that changed. An unrelated approval on the same subject is untouched - invalidating everything on every material change teaches approvers that re-approval is routine, which is how it stops being read",
        writes: [{ field: "approval_log", mode: "append" }],
        next: "a.invalidate",
      },
      {
        id: "a.invalidate",
        kind: "action",
        does: "Invalidate those approvals, keeping them in the history as approvals that were validly given and then superseded. The original decision is not deleted; it stops applying",
        writes: [{ field: "approval_log", mode: "append" }],
        next: "c.unsafe",
      },
      {
        id: "c.unsafe",
        kind: "condition",
        asks: "Is execution pending that would now proceed without valid approval?",
        branches: [
          {
            label: "Unsafe execution pending",
            when: "something is scheduled or in flight that the invalidated approval was authorising",
            to: "a.hold",
          },
          {
            label: "Nothing in flight",
            when: "no execution depends on the invalidated approvals yet",
            to: "a.request",
          },
        ],
      },
      {
        id: "a.hold",
        kind: "action",
        does: "Hold the affected execution. Only the affected part - holding everything because one term changed is the same error as invalidating every approval",
        writes: [{ field: "suppressed_sends", mode: "append" }],
        next: "a.request",
      },
      {
        id: "a.request",
        kind: "action",
        does: "Request re-approval, scoped to the authorities whose basis actually changed rather than to everyone who approved the original",
        writes: [{ field: "approval_log", mode: "append" }],
        next: "w.reapproval",
        execution: "human",
      },
      {
        id: "w.reapproval",
        kind: "wait",
        until: ["the required re-approvals resolve"],
        onEvent: "c.reapproved",
        timeout: {
          after: "the re-approval SLA",
          reason:
            "held execution is not free - it is a commitment sitting still - so an unanswered re-approval escalates rather than waiting indefinitely",
        },
        onTimeout: "h.escalate",
        windowExtendsOnEngagement: false,
      },
      {
        id: "h.escalate",
        kind: "handoff",
        to: "OWN-55",
        on: "re-approval left outstanding past its SLA with execution held",
        carries: ["what is held and why", "which authorities are outstanding"],
      },
      {
        id: "c.reapproved",
        kind: "condition",
        asks: "Was the changed version approved?",
        branches: [
          {
            label: "Re-approved",
            when: "the required authorities approved the current version",
            to: "x.resumed",
          },
          {
            label: "Not approved",
            when: "the changed version was rejected",
            to: "h.rejected",
          },
        ],
      },
      {
        id: "x.resumed",
        kind: "exit",
        state: "current version approved; held execution may resume",
        terminal: false,
        reEntry: "any further change is compared against this newly approved version",
      },
      {
        id: "h.rejected",
        kind: "handoff",
        to: "OWN-59",
        on: "a changed version failing re-approval",
        carries: [
          "the rejection reason and the version rejected",
          "the previously approved version, which is still in the history and may be the thing to return to",
        ],
      },
    ],
    guardrails: [
      "A minor edit does not reset every approval. Only those whose decision basis stopped being true are invalidated.",
      "Materiality is defined by policy, not decided here. Where no rule exists the journey stops and asks.",
      "The approval history is preserved. A superseded approval is recorded as superseded, not removed.",
      "Re-approval is scoped to the affected authority wherever the policy allows it.",
    ],
    reusableRule:
      "Material changes should invalidate only the approvals whose original decision assumptions are no longer true.",
  },

  /* ------------------------------------------------------------ OWN-59 */
  {
    id: "OWN-59",
    slug: "rejected-approval-revision-path",
    category: "ownership",
    goal: "decision-approval",
    channels: [],
    name: "Approval rejected → revision eligibility → resubmit or close",
    purpose:
      "Keep rejection from being either a dead end by default or a retry loop, and make sure a rejected version cannot quietly execute later.",
    entity: {
      scope: "the rejected approval request and the exact subject version it rejected",
      note: "The rejection belongs to a version. A later version is a different subject and is judged on its own; this one stays rejected permanently.",
    },
    entry: "t.rejected",
    nodes: [
      {
        id: "t.rejected",
        kind: "trigger",
        event: "approval_rejected",
        evidence: {
          requires: ["a recorded rejection against a specific approval request and subject version"],
          source: "authoritative",
        },
        next: "a.capture",
      },
      {
        id: "a.capture",
        kind: "action",
        does: "Capture the rejection reason against the exact version rejected, appended. The history of what was rejected and why is what makes an unchanged resubmission recognisable as one",
        writes: [{ field: "approval_log", mode: "append" }],
        next: "a.block",
      },
      {
        id: "a.block",
        kind: "action",
        does: "Mark the rejected version as not executable. A rejected version executing later because something downstream read the subject and not the decision is the quietest failure in this category and the hardest to notice afterwards",
        writes: [{ field: "approval_log", mode: "append" }],
        next: "c.revisable",
      },
      {
        id: "c.revisable",
        kind: "condition",
        asks: "Does policy allow this to be revised and resubmitted?",
        branches: [
          {
            label: "Revision permitted",
            when: "policy provides a revision path for this rejection reason",
            to: "a.correction",
          },
          {
            label: "Terminal",
            when: "the rejection reason ends it - a structural ineligibility, a prohibition, a decision that is not revisable",
            to: "x.terminal",
          },
        ],
      },
      {
        id: "x.terminal",
        kind: "exit",
        state: "rejected, no revision path",
        terminal: true,
        reEntry:
          "none - what would have to change is the rule or the circumstances, and either of those produces a new request rather than a revision of this one",
      },
      {
        id: "a.correction",
        kind: "action",
        does: "Identify what would actually have to change, taken from the rejection reason rather than left to the requester to guess",
        next: "w.revision",
      },
      {
        id: "w.revision",
        kind: "wait",
        until: ["the subject is revised"],
        onEvent: "c.changed",
        timeout: {
          after: "the revision window",
          reason:
            "a rejected request left open indefinitely is a commitment nobody is tracking and a queue entry nobody will clear",
        },
        onTimeout: "x.expired",
        windowExtendsOnEngagement: false,
      },
      {
        id: "x.expired",
        kind: "exit",
        state: "revision window closed; request expired",
        terminal: false,
        reEntry: "a genuinely new request may be raised later, with this rejection in its history",
      },
      {
        id: "c.changed",
        kind: "condition",
        asks: "Does the revision materially address what was rejected?",
        branches: [
          {
            label: "Addressed",
            when: "the revision changes what the rejection was about",
            to: "a.version",
          },
          {
            label: "Unchanged in substance",
            when: "the same version, or a change that does not touch the rejection reason",
            to: "x.unchanged",
          },
        ],
      },
      {
        id: "x.unchanged",
        kind: "exit",
        state: "resubmission refused; nothing material changed",
        terminal: false,
        reEntry:
          "a real revision re-opens this. Sending the same thing back is not a revision, and letting it through is how approval becomes a queue people learn to clear rather than read",
      },
      {
        id: "a.version",
        kind: "action",
        does: "Create the new reviewable version, linked to the rejected one and its reason, so the reviewer can see what was asked for and what changed",
        writes: [{ field: "approval_log", mode: "append" }],
        next: "h.resubmit",
      },
      {
        id: "h.resubmit",
        kind: "handoff",
        to: "OWN-56",
        on: "a genuine revision of a rejected subject",
        carries: [
          "the new version and its link to the rejected one",
          "the original rejection reason, so the review is of the correction rather than of the subject from scratch",
        ],
      },
    ],
    guardrails: [
      "A rejected version is marked unexecutable and never runs later.",
      "An unchanged resubmission is refused. Repetition is not a revision.",
      "The rejection history is preserved and travels with the revised version.",
    ],
    reusableRule:
      "A rejected decision can re-enter approval only through a valid revision path when policy permits it.",
  },

  /* ------------------------------------------------------------ OWN-60 */
  {
    id: "OWN-60",
    slug: "decision-authority-change",
    category: "ownership",
    goal: "decision-approval",
    channels: ["task"],
    name: "Decision authority change → revalidate pending decisions → transfer or continue",
    purpose:
      "Re-evaluate decisions against who is actually authorised now, without unapproving history or blindly moving what is pending.",
    entity: {
      scope: "the decision process plus the authority holders whose scope changed",
      note: "Pending decisions and completed ones are affected differently by the same event, which is why they are inventoried separately here.",
    },
    distinctFrom: [
      {
        journey: "OWN-54",
        because:
          "Ownership is who does the work; authority is who may decide. They change independently, and an approver leaving does not move a case any more than a case moving changes who may approve it.",
      },
    ],
    entry: "t.authority",
    nodes: [
      {
        id: "t.authority",
        kind: "trigger",
        event: "decision_authority_changed",
        evidence: {
          requires: [
            "a change to who holds decision authority: an approver leaving, a role change, authority revoked, organisational responsibility moving, an approval limit changing, or a delegation beginning or ending",
          ],
          source: "authoritative",
        },
        next: "a.inventory",
      },
      {
        id: "a.inventory",
        kind: "action",
        does: "Identify what this touches: decisions still pending, decisions already made, deadlines running, and the exact scope of authority that changed. The scope matters - a lowered approval limit affects a different set from a departure",
        writes: [{ field: "authority_change_log", mode: "append" }],
        next: "a.invalidate",
      },
      {
        id: "a.invalidate",
        kind: "action",
        does: "Invalidate anything queued that the former authority is no longer entitled to do, so a decision does not arrive from someone who has stopped being able to make it",
        writes: [{ field: "suppressed_sends", mode: "append" }],
        next: "c.pending",
      },
      {
        id: "c.pending",
        kind: "condition",
        asks: "Are pending decisions now sitting with an authority that is no longer valid?",
        branches: [
          {
            label: "Pending decisions stranded",
            when: "at least one open decision is assigned to an authority that can no longer make it",
            to: "c.valid-exists",
          },
          {
            label: "Nothing pending affected",
            when: "no open decision depends on the changed authority",
            to: "c.completed",
          },
        ],
      },
      {
        id: "c.valid-exists",
        kind: "condition",
        asks: "Does a valid alternative authority exist?",
        branches: [
          {
            label: "Valid authority available",
            when: "someone else holds the authority within the required scope",
            to: "a.reassign",
          },
          {
            label: "None",
            when: "no valid authority currently exists for this decision",
            to: "h.no-authority",
          },
        ],
      },
      {
        id: "a.reassign",
        kind: "action",
        does: "Reassign the pending decision, preserving the original request, the exact version under review and the deadline. The clock does not restart because we changed who is reading it - the requester's wait is not reset by our reorganisation",
        writes: [{ field: "authority_change_log", mode: "append" }],
        next: "c.completed",
        execution: "human",
      },
      {
        id: "h.no-authority",
        kind: "handoff",
        to: "DEC-181",
        on: "a decision with no currently valid authority",
        carries: [
          "the pending decisions and their unchanged deadlines",
          "the explicit fact that execution requiring this approval remains blocked, rather than proceeding because nobody can say no",
        ],
        suppresses: ["any execution that depends on the missing authorisation"],
      },
      {
        id: "c.completed",
        kind: "condition",
        asks: "Do decisions already made remain valid under the governing policy?",
        branches: [
          {
            label: "Remain valid",
            when: "policy holds that a decision validly made stays made - the ordinary case",
            to: "x.retained",
          },
          {
            label: "Revalidation required",
            when: "policy specifies that this kind of authority change invalidates decisions already given",
            to: "a.revalidate",
          },
          {
            label: "Policy unclear",
            when: "no rule states whether these decisions survive the change",
            to: "h.policy",
          },
        ],
      },
      {
        id: "x.retained",
        kind: "exit",
        state: "completed decisions retained; pending ones reassigned where needed",
        terminal: false,
        reEntry:
          "an approver leaving does not retroactively unapprove what they approved while they held the authority to approve it",
      },
      {
        id: "a.revalidate",
        kind: "action",
        does: "Identify which completed decisions this change actually invalidates, and only those. A new authority does not inherit the ability to reopen decisions outside their scope simply by arriving",
        writes: [{ field: "authority_change_log", mode: "append" }],
        next: "h.reapprove",
      },
      {
        id: "h.reapprove",
        kind: "handoff",
        to: "OWN-56",
        on: "decisions invalidated by an authority change rather than by a change to the subject",
        carries: [
          "the unchanged subject version, which is what makes this a re-approval rather than a revision",
          "the original request history and its SLA, neither of which the authority change resets",
        ],
      },
      {
        id: "h.policy",
        kind: "handoff",
        to: "DEC-181",
        on: "an authority change whose effect on completed decisions no policy defines",
        carries: [
          "the completed decisions in question and who made them",
          "the fact that they have been neither retained nor invalidated pending a ruling",
        ],
      },
    ],
    guardrails: [
      "An approver's departure does not automatically invalidate every historical approval they gave.",
      "A new authority does not inherit the ability to alter completed decisions outside what policy grants them.",
      "An authority change does not reset the original request history or its SLA unless policy explicitly says so.",
      "Where no valid authority exists, execution requiring approval stays blocked rather than proceeding because nobody is left to refuse it.",
    ],
    reusableRule:
      "When decision authority changes, pending and completed decisions must be re-evaluated according to authority validity rather than blindly transferred or discarded.",
  },
];
