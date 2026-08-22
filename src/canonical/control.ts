import type { CanonicalJourney, OrchestrationRule } from "./types";

/* CATEGORY 24 - OWNERSHIP, DELEGATION, TRANSFER & MULTI-PARTY CONTROL

   Access answers what you can do. Ownership answers who is accountable for
   this thing. They are routinely stored in the same table and treated as the
   same fact, which is how the person with the most permissions quietly becomes
   the person the system thinks owns the company's workspace.

   They come apart in every direction. An administrator can usually do
   everything an owner can do and is not the owner. An owner can be locked out
   and still be the owner. A delegate can act with the owner's authority and
   hold none of it themselves. Two people with full access are not two owners,
   and they are not multi-party control either.

   The transitions are where it gets expensive, because each has a gap in the
   middle that somebody tries to close by shortening it:

     requested      somebody proposed a new controller
     accepted       the proposed controller agreed
     authorized     it is still valid against the entity as it now is
     cut over       the new owner is established and the old one reconciled

   Removing the old owner at the first of those leaves the entity ownerless for
   however long the invitation goes unanswered. Skipping the third transfers an
   entity that has changed hands twice since the invitation was sent.

   And one rule that runs through all of it: ownership changes are prospective.
   The previous owner did what they did, and reattributing it to whoever holds
   the entity now produces a record in which somebody appears to have acted
   before they had any relationship with it at all. */

/* Consolidated during review: multi-party authorization and post-change
   dependent-state reconciliation are owned by OWN-57 and OWN-54. Both were
   duplicated here and were merged into the ownership category rather than
   left as a second authority over the same event. The rules below still
   state the doctrine for this domain; the state machines live there. */

export const CONTROL_RULES: readonly OrchestrationRule[] = [
  {
    id: "CTL-R1",
    scope: "control",
    rule: "Ownership, access, entitlement and administration are four separate concepts.",
    because:
      "They are stored together and mean different things. Accountability, capability, right and role each fail differently, and only one of them says who answers for the entity.",
  },
  {
    id: "CTL-R2",
    scope: "control",
    rule: "The highest access level is never assumed to be ownership.",
    because:
      "An administrator can usually do everything an owner can do. Inferring ownership from permissions hands the entity to whoever happened to be granted the most.",
  },
  {
    id: "CTL-R3",
    scope: "control",
    rule: "Ownership assignment requires explicit authority and is explicitly recorded.",
    because:
      "Ownership that was never assigned by anybody cannot be defended, revoked or transferred, because there is no act to point at.",
  },
  {
    id: "CTL-R4",
    scope: "control",
    rule: "Transfer request, acceptance and cutover are three separate stages.",
    because:
      "Months can pass between them, and the entity changes underneath. Each stage answers a question the previous one could not.",
  },
  {
    id: "CTL-R5",
    scope: "control",
    rule: "Existing ownership remains authoritative until the transfer completes.",
    because:
      "Revoking the current owner when the invitation goes out leaves the entity ownerless for as long as nobody answers, which is often forever.",
  },
  {
    id: "CTL-R6",
    scope: "control",
    rule: "New ownership is established before old ownership is removed where continuous ownership is required.",
    because:
      "The ordering is the whole safety property. Reversed, a failed cutover produces exactly the ownerless entity the transfer was meant to avoid.",
  },
  {
    id: "CTL-R7",
    scope: "control",
    rule: "Historical actions remain attributed to the actor who performed them.",
    because:
      "Reattributing them to the current owner produces a record in which somebody took actions before they had any relationship with the entity.",
  },
  {
    id: "CTL-R8",
    scope: "control",
    rule: "Delegation and ownership transfer are distinct mechanisms.",
    because:
      "A delegate acts with the owner's authority and holds none of it. Treating delegation as transfer moves accountability nobody moved.",
  },
  {
    id: "CTL-R9",
    scope: "control",
    rule: "Delegated authority is scope-bounded.",
    because:
      "An unbounded delegation is an ownership transfer with a different name, and the delegator usually did not intend one.",
  },
  {
    id: "CTL-R10",
    scope: "control",
    rule: "Delegation cannot exceed the delegator's own authority.",
    because:
      "A delegation broader than what the delegator holds manufactures authority out of a form, and it will be exercised before anybody notices.",
  },
  {
    id: "CTL-R11",
    scope: "control",
    rule: "Temporary delegation requires explicit expiry semantics.",
    because:
      "Delegated authority that outlives its reason is authority nobody is watching, held by somebody who has usually stopped thinking about it.",
  },
  {
    id: "CTL-R12",
    scope: "control",
    rule: "Revoking a delegation removes only delegation-derived authority.",
    because:
      "A delegate who was already an administrator keeps being one. Removing everything locks somebody out of rights they held independently.",
  },
  {
    id: "CTL-R13",
    scope: "control",
    rule: "Owner unavailability does not justify arbitrary reassignment.",
    because:
      "Inactive is not invalid. Promoting the highest-privileged administrator gives the entity to whoever had the most access, which is a security model rather than a governance decision.",
  },
  {
    id: "CTL-R14",
    scope: "control",
    rule: "Ownership recovery follows defined governance authority.",
    because:
      "Who may replace an owner is a question with a real answer somewhere - a contract, a policy, a succession rule - and the system inventing one overrides it.",
  },
  {
    id: "CTL-R15",
    scope: "control",
    rule: "Multi-party control is explicit authorization semantics rather than several users with access.",
    because:
      "Two administrators are two people who can each act alone. Multi-party control is a requirement that distinct authorities approve the same specific thing.",
  },
  {
    id: "CTL-R16",
    scope: "control",
    rule: "Multi-party approvals bind to the same action and version.",
    because:
      "An approval collected for one scope does not carry to a larger one, and a threshold assembled across versions was never met for any of them.",
  },
  {
    id: "CTL-R17",
    scope: "control",
    rule: "Ownership changes require downstream state reconciliation.",
    because:
      "Notifications, billing contacts, approvals and assigned work all point at an owner. Left alone, they point at somebody who no longer holds the entity.",
  },
  {
    id: "CTL-R18",
    scope: "control",
    rule: "Pending owner-authorized actions are revalidated after an ownership change.",
    because:
      "An action approved by somebody who is no longer the owner is an authorization whose basis has gone, and executing it applies a decision the current owner never made.",
  },
  {
    id: "CTL-R19",
    scope: "control",
    rule: "Derived capabilities reuse the existing access and entitlement mechanisms.",
    because:
      "What a delegate can actually do is an entitlement question. Implementing it inside delegation produces two sources of truth for one door.",
  },
  {
    id: "CTL-R20",
    scope: "control",
    rule: "Ownership and delegation histories stay auditable.",
    because:
      "Who controlled this, when, and on whose authority is the question every dispute about an entity eventually reduces to.",
  },
];

export const CONTROL_JOURNEYS: readonly CanonicalJourney[] = [
  /* ------------------------------------------------------------ CTL-231 */
  {
    id: "CTL-231",
    slug: "ownership-assignment",
    category: "control",
    name: "Ownership assignment → validate authority → assign or reject",
    purpose:
      "Establish an accountable controller for an entity, by an explicit act rather than by inference.",
    entity: {
      scope: "the ownable entity and the ownership relationship being created on it",
      note: "Ownership is a relationship somebody created. It is never derived from a role, a permission level or being the first account to touch the entity.",
    },
    distinctFrom: [
      {
        journey: "ACC-71",
        because:
          "ACC-71 qualifies an entitlement - what somebody may do. This establishes who is accountable for the entity itself. An administrator can hold every entitlement the owner holds and still not be the party answerable for it.",
      },
    ],
    entry: "t.requested",
    nodes: [
      {
        id: "t.requested",
        kind: "trigger",
        event: "ownership_assignment_requested",
        evidence: {
          requires: ["a request to assign ownership of an identified entity to an identified party"],
          insufficientAlone: [
            "somebody holding the highest access role, which is a permission level and not an assignment",
            "somebody having created the entity, which is a fact about history rather than a standing accountability",
          ],
          source: "authoritative",
        },
        next: "a.validate",
      },
      {
        id: "a.validate",
        kind: "action",
        does: "Validate that the entity supports ownership at all, that the assigning party holds the authority to assign it, the proposed owner's identity, their eligibility, the existing ownership state, and whether acceptance is required",
        writes: [{ field: "ownership_log", mode: "append" }],
        next: "c.supports",
      },
      {
        id: "c.supports",
        kind: "condition",
        asks: "Does this entity support an ownership relationship?",
        branches: [
          {
            label: "It does",
            when: "the entity type has an accountable controller as part of its model",
            to: "c.authority",
          },
          {
            label: "It does not",
            when: "the entity has access and administration but no ownership concept",
            to: "a.not-ownable",
          },
        ],
      },
      {
        id: "a.not-ownable",
        kind: "action",
        does: "Record that this entity has no ownership relationship to assign. Not everything has an owner, and inventing one creates an accountability nobody granted and nobody can be held to",
        writes: [{ field: "ownership_log", mode: "append" }],
        next: "x.not-ownable",
      },
      {
        id: "x.not-ownable",
        kind: "exit",
        state: "entity does not support ownership; nothing assigned",
        terminal: false,
        reEntry:
          "the entity's model gaining an ownership concept makes assignment possible. Access and administration continue to be governed on their own terms",
      },
      {
        id: "c.authority",
        kind: "condition",
        asks: "Does the assigning party hold the authority to assign this?",
        branches: [
          {
            label: "They do",
            when: "an existing owner, a governance rule or a defined authority permits it",
            to: "c.eligible",
          },
          {
            label: "They do not",
            when: "nothing establishes their right to assign ownership of this entity",
            to: "a.reject",
          },
        ],
      },
      {
        id: "a.reject",
        kind: "action",
        does: "Record the assignment rejected, naming what failed. Access permission is not ownership, and the highest access role is not the owner - an administrator can do everything an owner can do and is still not the party accountable for the entity",
        writes: [{ field: "ownership_log", mode: "append" }],
        next: "x.rejected",
      },
      {
        id: "x.rejected",
        kind: "exit",
        state: "assignment rejected; existing ownership state unchanged",
        terminal: false,
        reEntry:
          "an assignment by an authorized party, or by an eligible proposed owner, is assessed on its own terms",
      },
      {
        id: "c.eligible",
        kind: "condition",
        asks: "Is the proposed owner eligible to hold this?",
        branches: [
          {
            label: "Eligible",
            when: "the party meets whatever the entity requires of an owner",
            to: "c.configuration",
          },
          {
            label: "Not eligible",
            when: "the party cannot hold ownership of this entity",
            to: "a.reject",
          },
        ],
      },
      {
        id: "c.configuration",
        kind: "condition",
        asks: "Would this assignment create a prohibited ownership configuration?",
        branches: [
          {
            label: "It would not",
            when: "the resulting ownership state is one the entity's rules permit",
            to: "c.acceptance",
          },
          {
            label: "It would",
            when: "the result would breach a separation, a limit or a governance constraint",
            to: "a.blocked",
          },
        ],
      },
      {
        id: "a.blocked",
        kind: "action",
        does: "Block the assignment and record the configuration it would have produced. A prohibited ownership arrangement created by accident is usually discovered by an audit rather than by the people it affects",
        writes: [{ field: "ownership_log", mode: "append" }],
        next: "h.review",
      },
      {
        id: "h.review",
        kind: "handoff",
        to: "DEC-181",
        on: "an assignment that would create a prohibited ownership configuration",
        carries: [
          "the proposed assignment and the constraint it breaches",
          "the explicit fact that the existing ownership state is unchanged and nothing was assigned",
        ],
      },
      {
        id: "c.acceptance",
        kind: "condition",
        asks: "Must the proposed owner accept?",
        branches: [
          {
            label: "They must",
            when: "ownership carries obligations the party has to take on knowingly",
            to: "a.pending-acceptance",
          },
          {
            label: "They need not",
            when: "the assignment is within what the assigning authority may do unilaterally",
            to: "a.assign",
          },
        ],
      },
      {
        id: "a.pending-acceptance",
        kind: "action",
        does: "Record the assignment as awaiting acceptance. Nobody owns the entity on the strength of an unanswered invitation, and any existing ownership continues unchanged meanwhile",
        writes: [{ field: "ownership_log", mode: "append" }],
        next: "w.acceptance",
      },
      {
        id: "w.acceptance",
        kind: "wait",
        until: ["the proposed owner accepts", "the proposed owner declines"],
        onEvent: "c.accepted",
        timeout: {
          after: "the acceptance window the assignment allows",
          reason:
            "an unanswered assignment left open indefinitely leaves an entity in a state where two parties each believe the other is accountable for it",
        },
        onTimeout: "a.lapsed",
        windowExtendsOnEngagement: false,
      },
      {
        id: "c.accepted",
        kind: "condition",
        asks: "What did the proposed owner do?",
        branches: [
          { label: "Accepted", when: "they took on the ownership", to: "a.assign" },
          { label: "Declined", when: "they refused it", to: "a.declined" },
        ],
      },
      {
        id: "a.declined",
        kind: "action",
        does: "Record the assignment declined. The entity's existing ownership state is untouched, and the decline is a fact worth keeping rather than a failure to retry",
        writes: [{ field: "ownership_log", mode: "append" }],
        next: "x.declined",
      },
      {
        id: "x.declined",
        kind: "exit",
        state: "assignment declined; existing ownership unchanged",
        terminal: false,
        reEntry:
          "a different proposed owner is a new assignment. Re-offering the same one changes nothing they have already answered",
      },
      {
        id: "a.lapsed",
        kind: "action",
        does: "Record the assignment as lapsed unanswered. Nothing was assigned, and this is not a decline - the proposed owner said nothing",
        writes: [{ field: "ownership_log", mode: "append" }],
        next: "x.lapsed",
      },
      {
        id: "x.lapsed",
        kind: "exit",
        state: "assignment lapsed unanswered; existing ownership unchanged",
        terminal: false,
        reEntry:
          "a renewed assignment to the same party is a new offer against the entity as it stands then",
      },
      {
        id: "a.assign",
        kind: "action",
        does: "Create the ownership relationship explicitly, recording who assigned it, on what authority, when, and what the owner is accountable for. Ownership is never inferred - it is a record somebody made, and that record is what any later dispute is resolved against",
        writes: [{ field: "ownership_log", mode: "append" }],
        next: "x.assigned",
      },
      {
        id: "x.assigned",
        kind: "exit",
        state: "ownership assigned and recorded with its authority",
        terminal: false,
        reEntry:
          "a change of owner runs through the transfer lifecycle rather than through a second assignment over the top of this one",
      },
    ],
    guardrails: [
      "Access permission is not ownership.",
      "An owner is never inferred from the highest access role.",
      "Ownership assignment is explicit and auditable.",
    ],
    reusableRule:
      "Ownership exists only after an authorized assignment establishes an eligible party as the accountable controller of the entity.",
  },

  /* ------------------------------------------------------------ CTL-232 */
  {
    id: "CTL-232",
    slug: "transfer-request",
    category: "control",
    name: "Ownership transfer request → validate → pending acceptance or reject",
    purpose:
      "Propose a future controller without disturbing the one the entity currently has.",
    entity: {
      scope: "the entity, its current owner, the proposed owner and the transfer request between them",
      note: "The request is a proposal. The current owner is unaffected by its existence, and remains the answer to who controls the entity.",
    },
    distinctFrom: [
      {
        journey: "CTL-233",
        because:
          "This validates that a transfer may be proposed at all. CTL-233 validates that it is still valid when somebody finally accepts it, which is a different question asked against a different state of the world.",
      },
    ],
    entry: "t.requested",
    nodes: [
      {
        id: "t.requested",
        kind: "trigger",
        event: "ownership_transfer_requested",
        evidence: {
          requires: ["a request to move ownership of an identified entity to an identified party"],
          source: "authoritative",
        },
        next: "a.capture",
      },
      {
        id: "a.capture",
        kind: "action",
        does: "Capture the entity, the current owner, the proposed owner, the requester, the request time, the transfer scope and any conditions attached to it",
        writes: [{ field: "ownership_log", mode: "append" }],
        next: "a.preserve",
      },
      {
        id: "a.preserve",
        kind: "action",
        does: "Record explicitly that the current owner remains authoritative. Nothing about their control changes because a request exists - revoking them on the invitation leaves the entity ownerless for the length of an unanswered email, and unanswered is the most common outcome",
        writes: [{ field: "ownership_log", mode: "append" }],
        next: "c.authority",
      },
      {
        id: "c.authority",
        kind: "condition",
        asks: "Does the requester hold the authority to transfer this entity?",
        branches: [
          {
            label: "They do",
            when: "the current owner, or a governance rule, permits them to initiate this",
            to: "c.eligible",
          },
          {
            label: "They do not",
            when: "nothing establishes their right to move this entity",
            to: "a.reject",
          },
        ],
      },
      {
        id: "c.eligible",
        kind: "condition",
        asks: "Is the proposed owner eligible to hold this entity?",
        branches: [
          {
            label: "Eligible",
            when: "they meet what the entity requires of an owner",
            to: "c.transferable",
          },
          {
            label: "Not eligible",
            when: "they cannot hold ownership of this entity",
            to: "a.reject",
          },
        ],
      },
      {
        id: "c.transferable",
        kind: "condition",
        asks: "Is the entity transferable, and are the transfer's conditions satisfiable?",
        branches: [
          {
            label: "Transferable",
            when: "nothing about the entity's state, obligations or governance prevents a transfer",
            to: "c.acceptance",
          },
          {
            label: "Not transferable",
            when: "an obligation, a hold or a rule prevents ownership moving now",
            to: "a.reject",
          },
        ],
      },
      {
        id: "a.reject",
        kind: "action",
        does: "Record TRANSFER_REJECTED with what failed - authority, eligibility or transferability. The current owner is unaffected in every case",
        writes: [{ field: "ownership_log", mode: "append" }],
        next: "x.rejected",
      },
      {
        id: "x.rejected",
        kind: "exit",
        state: "TRANSFER_REJECTED; the current owner remains the owner",
        terminal: false,
        reEntry:
          "a transfer becoming possible - a different recipient, a cleared obligation, a proper authority - is a new request",
      },
      {
        id: "c.acceptance",
        kind: "condition",
        asks: "Is acceptance by the proposed owner required?",
        branches: [
          {
            label: "It is required",
            when: "ownership carries obligations the recipient must take on knowingly",
            to: "a.pending",
          },
          {
            label: "It is not",
            when: "policy permits the transfer to proceed on the requester's authority alone",
            to: "h.execute",
          },
        ],
      },
      {
        id: "a.pending",
        kind: "action",
        does: "Record PENDING_ACCEPTANCE with the request version. The current owner is still the owner, still accountable, and still able to act - and the request can be withdrawn by them at any point before it completes",
        writes: [{ field: "ownership_log", mode: "append" }],
        next: "x.pending",
      },
      {
        id: "x.pending",
        kind: "exit",
        state: "PENDING_ACCEPTANCE; ownership unchanged and the request outstanding",
        terminal: false,
        reEntry:
          "acceptance runs through its own revalidation. A request pending for weeks is a claim about an entity as it was, and is checked against the entity as it is",
      },
      {
        id: "h.execute",
        kind: "handoff",
        to: "CTL-234",
        on: "a transfer authorized to proceed without recipient acceptance",
        carries: [
          "the entity, the current owner, the proposed owner and the transfer scope",
          "the explicit fact that ownership has not moved - the cutover establishes the new owner before touching the old one",
        ],
      },
    ],
    guardrails: [
      "A transfer requested is not a transfer completed.",
      "The current owner remains authoritative until the transfer is effective.",
      "The current owner is never revoked merely because a request or invitation exists.",
    ],
    reusableRule:
      "An ownership transfer request proposes a future controller while preserving existing ownership until all transfer conditions are satisfied.",
  },

  /* ------------------------------------------------------------ CTL-233 */
  {
    id: "CTL-233",
    slug: "transfer-acceptance",
    category: "control",
    name: "Ownership transfer acceptance → revalidate → execute or expire",
    purpose:
      "Check that a transfer accepted today is still the transfer that was proposed.",
    entity: {
      scope: "the transfer request and the acceptance made against its specific version",
      note: "Acceptance binds to a request version. The entity, the current owner and the recipient's eligibility can all have moved since the invitation went out.",
    },
    entry: "t.accepted",
    nodes: [
      {
        id: "t.accepted",
        kind: "trigger",
        event: "proposed_owner_accepts_transfer",
        evidence: {
          requires: ["an acceptance by the proposed owner against an identified transfer request"],
          source: "authoritative",
        },
        next: "c.deadline",
      },
      {
        id: "c.deadline",
        kind: "condition",
        asks: "Has the acceptance deadline passed?",
        branches: [
          {
            label: "Still open",
            when: "the acceptance arrived inside the window the request allowed",
            to: "a.revalidate",
          },
          {
            label: "Passed",
            when: "the window closed before this acceptance arrived",
            to: "a.expired",
          },
        ],
      },
      {
        id: "a.expired",
        kind: "action",
        does: "Record TRANSFER_EXPIRED. The acceptance arrived and the window had closed - nobody refused anything, and telling the recipient they were rejected misstates what happened",
        writes: [{ field: "ownership_log", mode: "append" }],
        next: "x.expired",
      },
      {
        id: "x.expired",
        kind: "exit",
        state: "TRANSFER_EXPIRED; the current owner remains the owner",
        terminal: false,
        reEntry:
          "a fresh transfer request against the entity as it now stands can be raised. This acceptance does not carry to it",
      },
      {
        id: "a.revalidate",
        kind: "action",
        does: "Re-read everything the request assumed - whether it is still active, whether the current owner is still the party it named, whether the recipient is still eligible, whether the entity is still transferable, whether its conditions still hold, and whether the request has been superseded",
        writes: [{ field: "ownership_log", mode: "append" }],
        next: "c.valid",
      },
      {
        id: "c.valid",
        kind: "condition",
        asks: "Does the transfer still hold against current state?",
        branches: [
          {
            label: "It holds",
            when: "the request is active, unsuperseded, and every assumption it made is still true",
            to: "a.authorize",
          },
          {
            label: "The request was superseded or the entity changed",
            when: "ownership already moved, the entity was restructured, or a later request replaced this one",
            to: "a.stale",
          },
          {
            label: "The recipient is no longer eligible",
            when: "the proposed owner no longer meets what the entity requires",
            to: "a.ineligible",
          },
        ],
      },
      {
        id: "a.stale",
        kind: "action",
        does: "Record the acceptance as made against a stale request. A transfer invitation sent in March and accepted in June transfers an entity that may since have been sold, renamed, restructured or transferred to somebody else entirely",
        writes: [{ field: "ownership_log", mode: "append" }],
        next: "x.stale",
      },
      {
        id: "a.ineligible",
        kind: "action",
        does: "Record the acceptance refused on the recipient's current eligibility. They were eligible when invited and are not now, which is a fact about them rather than about the invitation",
        writes: [{ field: "ownership_log", mode: "append" }],
        next: "x.stale",
      },
      {
        id: "x.stale",
        kind: "exit",
        state: "acceptance refused against current state; ownership unchanged",
        terminal: false,
        reEntry:
          "a new transfer request against the entity as it now is can be raised and accepted on its own terms",
      },
      {
        id: "a.authorize",
        kind: "action",
        does: "Record the acceptance bound to the exact request version, and authorize execution. Acceptance is not completion - nothing has moved, and the cutover is where control actually changes hands",
        writes: [{ field: "ownership_log", mode: "append" }],
        next: "h.execute",
      },
      {
        id: "h.execute",
        kind: "handoff",
        to: "CTL-234",
        on: "an acceptance revalidated against current state",
        carries: [
          "the transfer request version, the acceptance and the revalidation that supported it",
          "the explicit fact that the current owner is still the owner until the cutover establishes the new one",
        ],
      },
    ],
    guardrails: [
      "Acceptance is not transfer completion.",
      "A stale invitation never transfers an entity that has since changed.",
      "Acceptance binds to the exact transfer request version.",
    ],
    reusableRule:
      "Transfer acceptance authorizes ownership change only when the original transfer remains valid against the entity's current state.",
  },

  /* ------------------------------------------------------------ CTL-234 */
  {
    id: "CTL-234",
    slug: "ownership-cutover",
    category: "control",
    name: "Ownership cutover → assign new owner → reconcile old owner",
    purpose:
      "Move control from one party to another without the entity being uncontrolled in between.",
    entity: {
      scope: "the entity and both ownership relationships during the change",
      note: "Both relationships exist briefly and deliberately. The order in which they are created and reconciled is the safety property.",
    },
    distinctFrom: [
      {
        journey: "TRM-104",
        because:
          "TRM-104 transfers a primary relationship and its dependencies during account consolidation. This is the ownership control boundary specifically - establishing an accountable controller before removing the previous one, which is a sequencing requirement rather than a dependency migration.",
      },
    ],
    entry: "t.authorized",
    nodes: [
      {
        id: "t.authorized",
        kind: "trigger",
        event: "ownership_transfer_authorized_for_execution",
        evidence: {
          requires: ["a transfer revalidated and authorized against the entity's current state"],
          source: "authoritative",
        },
        next: "a.new-first",
      },
      {
        id: "a.new-first",
        kind: "action",
        does: "Establish the new owner relationship first, and only then touch the old one. The ordering is the whole point - removing the old owner before a valid new one exists leaves an entity nobody controls, and for entities requiring continuous ownership that gap is itself the failure",
        writes: [{ field: "ownership_log", mode: "append" }],
        next: "a.verify-new",
      },
      {
        id: "a.verify-new",
        kind: "action",
        does: "Verify the new ownership is actually authoritative - the relationship exists, it resolves, and the new owner can exercise control through it. Created is not effective, and a relationship written but not resolving leaves both parties unable to act on an entity they both believe somebody owns",
        next: "c.verified",
      },
      {
        id: "c.verified",
        kind: "condition",
        asks: "Is the new ownership authoritative?",
        branches: [
          {
            label: "It is",
            when: "the new owner resolves and can exercise control",
            to: "a.reconcile-old",
          },
          {
            label: "It is not",
            when: "the new relationship did not establish, or does not resolve",
            to: "a.abort",
          },
        ],
      },
      {
        id: "a.abort",
        kind: "action",
        does: "Abort the cutover, leaving the old owner in place entirely unchanged. A failed cutover that has already downgraded the old owner produces exactly the ownerless state this journey exists to prevent, and the recovery from that is far harder than a retried transfer",
        writes: [{ field: "ownership_log", mode: "append" }],
        next: "x.aborted",
      },
      {
        id: "x.aborted",
        kind: "exit",
        state: "cutover aborted; the previous owner remains in place unchanged",
        terminal: false,
        reEntry:
          "the transfer can be executed again once the new relationship can be established. Nothing about the current ownership was disturbed by the attempt",
      },
      {
        id: "a.reconcile-old",
        kind: "action",
        does: "Reconcile the previous owner's relationship according to policy - removed, converted to an administrator or member role, retained as a defined secondary relationship, or access removed entirely. Which one applies comes from policy rather than from a default of stripping them, and for a founder handing over a workspace the difference matters a great deal",
        writes: [{ field: "ownership_log", mode: "append" }],
        next: "a.references",
      },
      {
        id: "a.references",
        kind: "action",
        does: "Update the owner-dependent references and workflows to point at the current owner",
        writes: [{ field: "ownership_log", mode: "append" }],
        next: "a.history",
      },
      {
        id: "a.history",
        kind: "action",
        does: "Leave every historical action attributed to whoever performed it. The previous owner did what they did, and reattributing it to the new owner produces a record in which somebody appears to have taken actions before they had any relationship with the entity at all",
        writes: [{ field: "ownership_log", mode: "append" }],
        next: "h.reconcile",
      },
      {
        id: "h.reconcile",
        kind: "handoff",
        to: "OWN-54",
        on: "an ownership cutover completed",
        carries: [
          "the previous and current owner, the moment of change, and how the previous owner's relationship was reconciled",
          "the explicit fact that the transfer is already effective, so no further acceptance step applies",
          "the explicit instruction that historical attribution is already preserved and must not be revisited",
        ],
      },
    ],
    guardrails: [
      "The old owner is never removed before a valid new owner exists, where continuous ownership is required.",
      "Ownership transfer is atomic where the architecture permits it.",
      "The previous owner's historical actions remain attributed to them.",
    ],
    reusableRule:
      "Ownership cutover establishes the new accountable controller before removing or downgrading the previous owner's current control.",
  },

  /* ------------------------------------------------------------ CTL-235 */
  {
    id: "CTL-235",
    slug: "delegation-grant",
    category: "control",
    name: "Delegation request → define scope → grant or reject",
    purpose:
      "Let somebody act on an owner's behalf, inside a boundary, without moving anything.",
    entity: {
      scope: "the delegation, the delegator, the delegate and the target entity",
      note: "Ownership does not change. The delegate acts with borrowed authority that the delegator still holds and can withdraw.",
    },
    distinctFrom: [
      {
        journey: "CTL-232",
        because:
          "A transfer moves accountability permanently to somebody else. A delegation lends bounded authority while the owner stays the owner, stays accountable, and can revoke it. Treating one as the other moves control nobody moved.",
      },
    ],
    entry: "t.requested",
    nodes: [
      {
        id: "t.requested",
        kind: "trigger",
        event: "delegation_requested",
        evidence: {
          requires: ["a request to delegate defined authority over an identified entity to an identified party"],
          source: "authoritative",
        },
        next: "a.define",
      },
      {
        id: "a.define",
        kind: "action",
        does: "Define the delegated scope, the actions it permits, its duration, the target entity, the delegator's authority, the delegate's eligibility, and the redelegation semantics where any are defined",
        writes: [{ field: "delegation_log", mode: "append" }],
        next: "c.delegator",
      },
      {
        id: "c.delegator",
        kind: "condition",
        asks: "May the delegator delegate this scope?",
        branches: [
          {
            label: "They may",
            when: "the requested scope sits inside what the delegator holds and may pass on",
            to: "c.delegate",
          },
          {
            label: "They may not",
            when: "the requested scope exceeds what the delegator holds, or is not theirs to delegate",
            to: "a.reject-scope",
          },
        ],
      },
      {
        id: "a.reject-scope",
        kind: "action",
        does: "Reject the delegation, naming the part of the scope that exceeds the delegator's own. Delegated authority can never exceed the delegator's - a delegation broader than what they hold manufactures authority out of a form, and it will be exercised before anybody notices",
        writes: [{ field: "delegation_log", mode: "append" }],
        next: "x.rejected",
      },
      {
        id: "x.rejected",
        kind: "exit",
        state: "delegation rejected; no authority granted",
        terminal: false,
        reEntry:
          "a narrower delegation within the delegator's own authority, or one from a party who holds the scope, is assessed on its own terms",
      },
      {
        id: "c.delegate",
        kind: "condition",
        asks: "Is the delegate eligible to receive this?",
        branches: [
          {
            label: "Eligible",
            when: "the party may hold delegated authority of this kind over this entity",
            to: "c.redelegation",
          },
          {
            label: "Not eligible",
            when: "the party cannot hold this authority",
            to: "a.reject-eligibility",
          },
        ],
      },
      {
        id: "a.reject-eligibility",
        kind: "action",
        does: "Reject the delegation on the delegate's eligibility, recorded separately from a scope rejection because the two lead somewhere different",
        writes: [{ field: "delegation_log", mode: "append" }],
        next: "x.rejected",
      },
      {
        id: "c.redelegation",
        kind: "condition",
        asks: "Does the delegation include the right to redelegate?",
        branches: [
          {
            label: "Explicitly granted",
            when: "the delegator states that the delegate may pass this on",
            to: "a.with-redelegation",
          },
          {
            label: "Not stated",
            when: "the delegation says nothing about passing it on",
            to: "a.without-redelegation",
          },
        ],
      },
      {
        id: "a.with-redelegation",
        kind: "action",
        does: "Record the redelegation right as granted, with its own bound - a right to pass authority on that is itself unbounded produces a chain nobody can enumerate",
        writes: [{ field: "delegation_log", mode: "append" }],
        next: "a.grant",
      },
      {
        id: "a.without-redelegation",
        kind: "action",
        does: "Record that redelegation is not included. It is never assumed from silence - a delegate who may pass the authority on turns one bounded grant into a chain nobody can enumerate and nobody can revoke in one act",
        writes: [{ field: "delegation_log", mode: "append" }],
        next: "a.grant",
      },
      {
        id: "a.grant",
        kind: "action",
        does: "Record DELEGATED with the scope, the duration and the authority behind it. Delegation is not a transfer - the owner is still the owner, still accountable for the entity, and can revoke this at any point",
        writes: [{ field: "delegation_log", mode: "append" }],
        next: "a.capabilities",
      },
      {
        id: "a.capabilities",
        kind: "action",
        does: "Raise the actual capabilities through the access and entitlement mechanism, bounded to exactly the delegated scope. What the delegate can do is owned there; what they have been authorized to do is owned here, and implementing both in one place produces two sources of truth for one door",
        writes: [{ field: "delegation_log", mode: "append" }],
        next: "c.temporary",
      },
      {
        id: "c.temporary",
        kind: "condition",
        asks: "Is the delegation time-bounded?",
        branches: [
          {
            label: "It is",
            when: "the delegation carries a validity period or an ending condition",
            to: "h.temporary",
          },
          {
            label: "It is not",
            when: "the delegation stands until it is revoked",
            to: "x.granted",
          },
        ],
      },
      {
        id: "h.temporary",
        kind: "handoff",
        to: "CTL-236",
        on: "a time-bounded delegation",
        carries: [
          "the delegation, its boundary and the version this boundary applies to",
          "the explicit fact that the expiry must check the current delegation version rather than the one it was scheduled against",
        ],
      },
      {
        id: "x.granted",
        kind: "exit",
        state: "DELEGATED; bounded authority granted and ownership unchanged",
        terminal: false,
        reEntry:
          "revocation runs through its own lifecycle and removes only what this delegation gave. A wider scope is a new delegation rather than an edit to this one",
      },
    ],
    guardrails: [
      "Delegation is not ownership transfer.",
      "A delegate never gains broader authority than the delegated scope.",
      "Redelegation rights are never assumed from silence.",
    ],
    reusableRule:
      "Delegation grants bounded authority to act on behalf of an existing controller without changing the underlying ownership relationship.",
  },

  /* ------------------------------------------------------------ CTL-236 */
  {
    id: "CTL-236",
    slug: "temporary-delegation",
    category: "control",
    name: "Temporary delegation → expire → revoke, extend or restore",
    purpose:
      "End borrowed authority at its boundary, checking first that the boundary still belongs to a delegation that exists.",
    entity: {
      scope: "the time-bounded delegation and the version this expiry was scheduled against",
      note: "The scheduled expiry carries a version. A delegation extended, narrowed or replaced since is a different delegation, and expiring the old one ends the wrong thing.",
    },
    entry: "t.bounded",
    nodes: [
      {
        id: "t.bounded",
        kind: "trigger",
        event: "delegation_has_validity_boundary",
        evidence: {
          requires: ["a delegation with an explicit validity period or ending condition"],
          source: "authoritative",
        },
        next: "a.record",
      },
      {
        id: "a.record",
        kind: "action",
        does: "Record the boundary as the delegation defines it, together with the delegation version this expiry is scheduled against",
        writes: [{ field: "delegation_log", mode: "append" }],
        next: "w.boundary",
      },
      {
        id: "w.boundary",
        kind: "wait",
        until: [
          "the delegation is revoked early",
          "the delegation is replaced by a new authorization",
        ],
        onEvent: "c.event",
        timeout: {
          after: "the delegation's own boundary",
          reason:
            "reaching the boundary is what the wait exists for. It is the normal outcome, and the point at which the current delegation version is checked before anything is ended",
        },
        onTimeout: "a.revalidate",
        windowExtendsOnEngagement: false,
      },
      {
        id: "c.event",
        kind: "condition",
        asks: "What happened before the boundary?",
        branches: [
          {
            label: "Revoked early",
            when: "an authority withdrew the delegation before its boundary",
            to: "h.revoke",
          },
          {
            label: "Replaced by a new authorization",
            when: "a new delegation supersedes this one",
            to: "a.superseded",
          },
        ],
      },
      {
        id: "a.superseded",
        kind: "action",
        does: "Record this version as superseded and stand down its scheduled expiry. The new authorization carries its own boundary, and leaving this expiry live would end the successor at the predecessor's date",
        writes: [
          { field: "delegation_log", mode: "append" },
          { field: "suppressed_sends", mode: "append" },
        ],
        next: "x.superseded",
      },
      {
        id: "x.superseded",
        kind: "exit",
        state: "this delegation version superseded; its expiry stood down",
        terminal: false,
        reEntry:
          "the successor version carries its own boundary and its own expiry, scheduled against itself",
      },
      {
        id: "a.revalidate",
        kind: "action",
        does: "At the boundary, re-read the current delegation version before doing anything. The scheduled job carries the version it was created against, and the delegation may have been extended, narrowed or replaced since - expiring the version in the job's hand ends a delegation that no longer exists in that form",
        next: "c.current",
      },
      {
        id: "c.current",
        kind: "condition",
        asks: "Is this still the current delegation version?",
        branches: [
          {
            label: "Still current",
            when: "no newer version of this delegation exists",
            to: "c.extension",
          },
          {
            label: "A newer version supersedes it",
            when: "the delegation was extended, narrowed or replaced after this expiry was scheduled",
            to: "a.suppress",
          },
        ],
      },
      {
        id: "a.suppress",
        kind: "action",
        does: "Suppress the stale expiry. A job expiring last month's delegation cancels this month's, and the delegate loses authority they were explicitly granted days earlier",
        writes: [
          { field: "delegation_log", mode: "append" },
          { field: "suppressed_sends", mode: "append" },
        ],
        next: "x.suppressed",
      },
      {
        id: "x.suppressed",
        kind: "exit",
        state: "stale expiry suppressed; the current delegation version stands",
        terminal: false,
        reEntry:
          "the current version's own boundary has its own expiry, scheduled against it",
      },
      {
        id: "c.extension",
        kind: "condition",
        asks: "Has an authorized extension been granted?",
        branches: [
          {
            label: "It has",
            when: "an authority has extended the delegation before its boundary",
            to: "a.extend",
          },
          {
            label: "It has not",
            when: "the boundary arrives with no extension",
            to: "a.expire",
          },
        ],
      },
      {
        id: "a.extend",
        kind: "action",
        does: "Record the extension as a new authorization referencing the original, rather than editing the original's dates. Rewriting the original makes it look as though it always ran to the new date, and the record of who extended it, when and why disappears entirely",
        writes: [{ field: "delegation_log", mode: "append" }],
        next: "x.extended",
      },
      {
        id: "x.extended",
        kind: "exit",
        state: "extended by a new authorization; the original's history preserved",
        terminal: false,
        reEntry:
          "the extension carries its own boundary and its own expiry, scheduled against the extended version",
      },
      {
        id: "a.expire",
        kind: "action",
        does: "Record the delegation expired at its boundary. An expired delegation is not an ownership change - the owner never moved, and the delegate simply stops acting for them",
        writes: [{ field: "delegation_log", mode: "append" }],
        next: "h.reconcile",
      },
      {
        id: "h.reconcile",
        kind: "handoff",
        to: "CTL-237",
        on: "a delegation reaching its boundary without extension",
        carries: [
          "the delegation, its scope and the moment it ended",
          "the explicit instruction to remove only what this delegation granted, leaving anything the delegate holds in their own right",
        ],
      },
      {
        id: "h.revoke",
        kind: "handoff",
        to: "CTL-237",
        on: "a delegation revoked before its boundary",
        carries: [
          "the revoking authority and the moment it took effect",
          "the same instruction: only delegation-derived authority is removed",
        ],
      },
    ],
    guardrails: [
      "An expired delegation is not an ownership change.",
      "A scheduled expiry is version-aware.",
      "An extension never silently rewrites the original authorization's history.",
    ],
    reusableRule:
      "Temporary delegated authority ends automatically at its defined boundary unless a new authorized state explicitly extends it.",
  },

  /* ------------------------------------------------------------ CTL-237 */
  {
    id: "CTL-237",
    slug: "delegation-revocation",
    category: "control",
    name: "Delegation revoked → remove delegated authority → preserve independent access",
    purpose:
      "Take back exactly what was lent, and nothing the delegate had of their own.",
    entity: {
      scope: "the delegation and the capabilities that exist because of it",
      note: "The delegate may hold rights from several sources. Only the ones derived from this delegation are in scope.",
    },
    distinctFrom: [
      {
        journey: "ACC-74",
        because:
          "ACC-74 handles entitlement loss for a party losing rights. This decides which of a party's rights were borrowed and which were their own - and its whole difficulty is that removing the wrong set locks somebody out of an account they independently administer.",
      },
    ],
    entry: "t.revoked",
    nodes: [
      {
        id: "t.revoked",
        kind: "trigger",
        event: "delegation_revocation_authorized",
        evidence: {
          requires: [
            "an authorized revocation of a delegation, or a delegation reaching its boundary unextended",
          ],
          source: "authoritative",
        },
        next: "a.mark",
      },
      {
        id: "a.mark",
        kind: "action",
        does: "Mark the delegation REVOKED with the authority behind it and the moment it took effect",
        writes: [{ field: "delegation_log", mode: "append" }],
        next: "a.derive",
      },
      {
        id: "a.derive",
        kind: "action",
        does: "Determine which capabilities the delegate holds specifically because of this delegation, as against those they hold in their own right. This is the whole difficulty of the journey - a delegate who was already an administrator keeps being one, and removing everything is how a revocation locks somebody out of an account they independently run",
        writes: [{ field: "delegation_log", mode: "append" }],
        next: "a.recalculate",
      },
      {
        id: "a.recalculate",
        kind: "action",
        does: "Recalculate the delegate's authority from what remains, through the access mechanism, rather than by subtracting a remembered set. Subtraction from a snapshot taken at delegation time removes rights that were granted independently while the delegation was live",
        writes: [{ field: "delegation_log", mode: "append" }],
        next: "c.independent",
      },
      {
        id: "c.independent",
        kind: "condition",
        asks: "Does the delegate hold independent access or roles on this entity?",
        branches: [
          {
            label: "They do",
            when: "rights exist that were granted to them directly rather than through this delegation",
            to: "a.preserve",
          },
          {
            label: "They do not",
            when: "everything they held here came from this delegation",
            to: "c.work",
          },
        ],
      },
      {
        id: "a.preserve",
        kind: "action",
        does: "Preserve the independent rights explicitly, and record that they were preserved and why. An explicit record is what stops the next revocation, or the next audit, from concluding they were left behind by mistake",
        writes: [{ field: "delegation_log", mode: "append" }],
        next: "c.work",
      },
      {
        id: "c.work",
        kind: "condition",
        asks: "Is active work assigned to the delegate under this delegation?",
        branches: [
          {
            label: "There is",
            when: "tasks, approvals or responsibilities were assigned to them as delegate",
            to: "h.work",
          },
          {
            label: "There is not",
            when: "nothing is outstanding under the delegation",
            to: "a.audit",
          },
        ],
      },
      {
        id: "h.work",
        kind: "handoff",
        to: "OWN-54",
        on: "active work assigned under a revoked delegation",
        carries: [
          "the outstanding work and the authority it was assigned under",
          "the explicit fact that the work does not evaporate because the authority behind it did - it needs reassigning or resolving on its own terms",
        ],
      },
      {
        id: "a.audit",
        kind: "action",
        does: "Leave the delegated actions attributed as they were performed - by the delegate, on behalf of the delegator, under this delegation. Revocation ends future authority and rewrites no history, which is what makes the delegation record worth having at all",
        writes: [{ field: "delegation_log", mode: "append" }],
        next: "x.revoked",
      },
      {
        id: "x.revoked",
        kind: "exit",
        state: "delegation-derived authority removed; independent rights preserved and history intact",
        terminal: false,
        reEntry:
          "a fresh delegation to the same party is a new grant with its own scope. Nothing about this one is reactivated by it",
      },
    ],
    guardrails: [
      "Revoking a delegation is not removing all of a user's access.",
      "Independently granted roles are never removed.",
      "Historical delegated actions remain auditable and attributed as performed.",
    ],
    reusableRule:
      "Delegation revocation removes only authority derived from that delegation while preserving unrelated rights held by the same actor.",
  },

  /* ------------------------------------------------------------ CTL-238 */
  {
    id: "CTL-238",
    slug: "owner-unavailable",
    category: "control",
    name: "Owner unavailable or invalid → protect entity → recover ownership",
    purpose:
      "Hold an entity safely when its owner cannot act, without handing it to whoever is nearest.",
    entity: {
      scope: "the entity and its ownership state while the owner cannot exercise control",
      note: "The owner remains the owner throughout unless a defined governance process says otherwise. Unavailability is a condition, not a forfeiture.",
    },
    entry: "t.unavailable",
    nodes: [
      {
        id: "t.unavailable",
        kind: "trigger",
        event: "owner_becomes_unavailable_or_invalid",
        evidence: {
          requires: [
            "authoritative evidence that the current owner cannot exercise valid control - departure, invalidity, incapacity, or a governance determination",
          ],
          insufficientAlone: [
            "an owner not logging in, which is inactivity rather than invalidity - an owner who has not appeared for a year is still the owner",
            "somebody else asking for control on the grounds that the owner is gone",
          ],
          source: "authoritative",
        },
        next: "a.assess",
      },
      {
        id: "a.assess",
        kind: "action",
        does: "Determine whether the owner can still exercise valid control. Inactive is not invalid - a system that reassigns on inactivity takes an entity from somebody who never lost the right to it, and the first they hear of it is when they come back",
        writes: [{ field: "ownership_log", mode: "append" }],
        next: "c.nature",
      },
      {
        id: "c.nature",
        kind: "condition",
        asks: "What kind of condition is this?",
        branches: [
          {
            label: "Temporary",
            when: "the owner is locked out, unreachable or incapacitated in a way that can resolve",
            to: "a.protect",
          },
          {
            label: "The owner is permanently invalid or gone",
            when: "authoritative evidence establishes they cannot return to control",
            to: "c.succession",
          },
          {
            label: "Not determinable",
            when: "whether this is temporary or permanent cannot be established",
            to: "h.review",
          },
        ],
      },
      {
        id: "a.protect",
        kind: "action",
        does: "Protect the entity and preserve the ownership where the governing rules permit. What is needed is a recovery path back to the owner rather than a replacement for them, and the entity is held rather than reassigned meanwhile",
        writes: [{ field: "ownership_log", mode: "append" }],
        next: "h.recovery",
      },
      {
        id: "h.recovery",
        kind: "handoff",
        to: "IDN-88",
        on: "an owner temporarily unable to exercise control",
        carries: [
          "the entity, its protected state and what the owner must prove to resume control",
          "the explicit fact that ownership has not changed and no replacement has been selected",
        ],
      },
      {
        id: "c.succession",
        kind: "condition",
        asks: "What governance applies to replacing this owner?",
        branches: [
          {
            label: "A defined succession or transfer process",
            when: "a contract, policy or governance rule states who may become owner and how",
            to: "a.succession",
          },
          {
            label: "A defined emergency controller mechanism",
            when: "a governance mechanism exists for interim control, with its own scope and review point",
            to: "a.emergency",
          },
          {
            label: "Neither is defined",
            when: "nothing states who may replace this owner",
            to: "c.ownerless",
          },
        ],
      },
      {
        id: "a.succession",
        kind: "action",
        does: "Initiate the authorized succession or transfer process. No new owner is selected here - arbitrarily promoting the highest-privileged administrator gives an entity to whoever happened to have the most access, which is a security model standing in for a governance decision",
        writes: [{ field: "ownership_log", mode: "append" }],
        next: "h.transfer",
      },
      {
        id: "h.transfer",
        kind: "handoff",
        to: "CTL-232",
        on: "a succession process nominating a new owner",
        carries: [
          "the entity, the governance rule under which the succession proceeds and the nominated party",
          "the explicit fact that the transfer runs its own validation - succession nominates, it does not assign",
        ],
      },
      {
        id: "a.emergency",
        kind: "action",
        does: "Apply only the governance mechanism that is actually defined, with its own scope and its own review point. An emergency control that has no defined end becomes a permanent reassignment nobody decided, and it is discovered years later as an administrator who turns out to own everything",
        writes: [{ field: "ownership_log", mode: "append" }],
        next: "h.review",
      },
      {
        id: "c.ownerless",
        kind: "condition",
        asks: "May this entity remain ownerless?",
        branches: [
          {
            label: "It may",
            when: "the entity's model and its obligations tolerate having no accountable controller for a period",
            to: "a.ownerless",
          },
          {
            label: "It may not",
            when: "the entity requires continuous ownership and no process exists to supply one",
            to: "h.review",
          },
        ],
      },
      {
        id: "a.ownerless",
        kind: "action",
        does: "Record OWNERLESS_PENDING explicitly. A named ownerless state is something somebody can find and act on; an entity whose owner field still points at an invalid party is a bug that surfaces at the worst possible moment",
        writes: [{ field: "ownership_log", mode: "append" }],
        next: "x.ownerless",
      },
      {
        id: "x.ownerless",
        kind: "exit",
        state: "OWNERLESS_PENDING; the entity is protected and visibly without an owner",
        terminal: false,
        reEntry:
          "an authorized assignment or succession gives it an owner. The state is deliberately visible rather than papered over with a nominal one",
      },
      {
        id: "h.review",
        kind: "handoff",
        to: "DEC-181",
        on: "an entity whose ownership recovery has no defined governance path",
        carries: [
          "the entity, the owner's condition and what governance does and does not provide",
          "the explicit fact that no replacement owner was selected and no administrator was promoted by default",
        ],
      },
    ],
    guardrails: [
      "An inactive owner is not an automatically invalid owner.",
      "A new owner is never arbitrarily selected.",
      "Ownership recovery follows defined authority and governance rules.",
    ],
    reusableRule:
      "Loss of a valid owner should place the entity into a controlled ownership-recovery state rather than silently assigning control to another actor.",
  },

];
