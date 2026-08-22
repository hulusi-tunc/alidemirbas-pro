import type { CanonicalJourney, OrchestrationRule } from "./types";

/* CATEGORY 10 - ACCOUNT STRUCTURE, IDENTITY RELATIONSHIPS & ENTITY RECONCILIATION

   How entities relate to each other, and what that is allowed to imply.

   The failures here are quieter than anywhere else in the library because
   they are failures of shape rather than of timing. Nothing arrives late and
   nothing is sent to the wrong person; instead two records that were never
   the same thing become one, or a parent going quiet takes eleven healthy
   children with it, or an entity loses the relationship it needs and carries
   on as a null field while its deadlines keep running.

   Four separations do most of the work:

     linked        two entities share defined context and stay two entities
     merged        two records become one, which is a different decision
     parent state  a fact about the parent
     child state   a fact about the child, sometimes derived, never copied

   Two journeys here refuse rather than decide. REL-95 will not propagate a
   parent's state without a defined dependency model, and REL-96 will not
   aggregate children into a parent state without an explicit aggregation
   policy - no ANY, no ALL, no majority, no threshold that nobody wrote down.
   They join OWN-57 and OWN-58 in the small set of journeys whose correct
   output is sometimes "this cannot be decided here".

   REL-97 detects duplicates and assesses them. It does not merge anything;
   consolidating two records is a separate mechanism with its own evidence
   requirements, and the handoff out of REL-97 is deliberately to a journey
   this category does not contain. */

export const STRUCTURE_RULES: readonly OrchestrationRule[] = [
  {
    id: "REL-R1",
    scope: "structure",
    rule: "Person, account, organization, relationship and role are separate entities and separate concepts.",
    because:
      "One person can hold several accounts, one account can carry several people, and a role is a property of the link rather than of either end. Collapsing any pair produces a data model that cannot express ordinary situations.",
  },
  {
    id: "REL-R2",
    scope: "structure",
    rule: "A relationship change recalculates only the rights and obligations that actually depend on that relationship.",
    because:
      "Rebuilding everything on every change reprovisions what already worked and revokes what should have survived, and the person experiences both as a fault.",
  },
  {
    id: "REL-R3",
    scope: "structure",
    rule: "Ending a relationship erases neither the historical relationship nor commitments validly created while it existed.",
    because:
      "The relationship having existed is what made those commitments valid. Removing the record retroactively makes them look unauthorised.",
  },
  {
    id: "REL-R4",
    scope: "structure",
    rule: "A role change applies an authority and capability delta. It does not rebuild identity.",
    because:
      "Rebuilding treats the person as new, which loses their history and reprovisions what a delta would have left alone.",
  },
  {
    id: "REL-R5",
    scope: "structure",
    rule: "Parent and child state are never copied blindly in either direction.",
    because:
      "Downward it deletes children that stood on their own; upward it lets one child's failure become the parent's state. Both look like correct propagation until someone checks what was actually dependent.",
  },
  {
    id: "REL-R6",
    scope: "structure",
    rule: "Deriving a parent state from children requires an explicit aggregation policy. ANY, ALL, majority and thresholds are never inferred.",
    because:
      "The same rule as OWN-R8, arriving from the structural side. An invented aggregation rule is indistinguishable from a real one until the first case where they disagree.",
  },
  {
    id: "REL-R7",
    scope: "structure",
    rule: "Duplicate detection and entity merge are separate decisions with separate evidence.",
    because:
      "Detection asks whether two records might be the same. Merge asks whether consolidating them is safe and reversible. The first is cheap and often wrong; the second is expensive and usually permanent.",
  },
  {
    id: "REL-R8",
    scope: "structure",
    rule: "Linking preserves independent identities. Merging consolidates them. They are not degrees of the same operation.",
    because:
      "A link that quietly behaves as a merge shares consent and entitlement across two people who never agreed to be treated as one.",
  },
  {
    id: "REL-R9",
    scope: "structure",
    rule: "An entity split preserves the historical fact that the records were previously represented together.",
    because:
      "Rewriting history as though they had always been separate makes every past event unattributable, and the split itself becomes invisible to anyone investigating later.",
  },
  {
    id: "REL-R10",
    scope: "structure",
    rule: "Consent, entitlements, financial obligations and credentials are never blindly duplicated during a split, nor propagated during a link.",
    because:
      "These four do not divide by being copied. Duplicating an obligation creates one that nobody incurred; duplicating a consent creates one that nobody gave.",
  },
  {
    id: "REL-R11",
    scope: "structure",
    rule: "A required relationship that disappears creates an explicit orphan state, never a null field.",
    because:
      "Null is unqueryable and unescalatable. Work with no owner has to be findable as work with no owner, or it is simply lost while appearing normal.",
  },
  {
    id: "REL-R12",
    scope: "structure",
    rule: "Orphan resolution does not reset inherited deadlines or obligations.",
    because:
      "The obligation was made to someone outside the organisation. Losing track of who owns it internally is our problem and not a reason for their clock to restart.",
  },
  {
    id: "REL-R13",
    scope: "structure",
    rule: "Relationship and entity operations invalidate the stale actions that depended on the superseded structure.",
    because:
      "An action queued against a relationship that has since ended executes on behalf of a structure that no longer exists, and neither end of it will recognise the result.",
  },
  {
    id: "REL-R14",
    scope: "structure",
    rule: "Cross-entity propagation always follows an explicit dependency rule.",
    because:
      "Inheritance is the default assumption in every hierarchy and it is wrong often enough that assuming it is how a suspended organisation deletes an unrelated subsidiary's data.",
  },
  {
    id: "REL-R15",
    scope: "structure",
    rule: "Entity history stays reconstructable after any relationship change, link, split or reconciliation.",
    because:
      "These operations are the ones most likely to be questioned afterwards, and they are also the ones most likely to destroy the evidence needed to answer.",
  },
];

export const STRUCTURE_JOURNEYS: readonly CanonicalJourney[] = [
  /* ------------------------------------------------------------ REL-91 */
  {
    id: "REL-91",
    slug: "relationship-creation",
    category: "structure",
    name: "Entity relationship created → validate → activate or reject",
    purpose:
      "Create a link between two entities only where the relationship itself has an authoritative basis, and keep it a link rather than a consolidation.",
    entity: {
      scope: "the relationship, plus the two entities it connects, in the direction it was created",
      note: "Direction is part of the relationship where the semantics are directional. A dependent of a primary member is not the same relationship read the other way, and storing it as symmetric loses which is which. This category owns structural and entity relationships. It does not own a term-bearing continuing agreement whose lifecycle includes effective dates, renewal, cancellation or lapse - that is SUB-161, and a link created here may be the thing such an agreement is later attached to.",
    },
    distinctFrom: [
      {
        journey: "REL-98",
        because:
          "This establishes that a relationship exists. REL-98 defines what a link between two entities is allowed to share, which is a separate decision that many relationships answer with nothing.",
      },
      {
        journey: "SUB-161",
        because:
          "SUB-161 creates a relationship that carries a term - an effective date, a renewal model and terms that can lapse. This creates a structural link between two entities, which can exist indefinitely without any of those. An employee belongs to an organisation here; the organisation's contract is created there, and the two end for different reasons on different days.",
      },
    ],
    entry: "t.requested",
    nodes: [
      {
        id: "t.requested",
        kind: "trigger",
        event: "relationship_creation_requested_or_detected",
        evidence: {
          requires: [
            "a request to create a relationship, or an authoritative detection of one, naming both entities and the relationship type",
          ],
          insufficientAlone: [
            "a shared email address or phone number",
            "a shared surname or address",
            "a shared device or network",
            "an agreement being entered that carries a term, an effective period or a renewal model, which is a continuing relationship rather than a structural link",
          ],
          source: "authoritative",
        },
        next: "a.define",
      },
      {
        id: "a.define",
        kind: "action",
        does: "Determine the relationship type, its source, when it takes effect, its scope, and what authority or evidence establishing it requires. Where the semantics are directional the direction is part of the type, not a property to be inferred later",
        writes: [{ field: "relationship_log", mode: "append" }],
        next: "c.authority",
      },
      {
        id: "c.authority",
        kind: "condition",
        asks: "Does establishing this relationship require verification or acceptance by either party?",
        branches: [
          {
            label: "Verification or acceptance required",
            when: "the relationship confers rights, responsibility or visibility that one side has to agree to",
            to: "h.verify",
          },
          {
            label: "Neither required",
            when: "the relationship is administrative and confers nothing that needs consent",
            to: "c.valid",
          },
        ],
      },
      {
        id: "h.verify",
        kind: "handoff",
        to: "IDN-82",
        on: "a relationship whose creation depends on verification or acceptance",
        carries: [
          "the proposed relationship and what has to be established before it activates",
          "the fact that nothing is active yet, so no right flows from it in the meantime",
        ],
      },
      {
        id: "c.valid",
        kind: "condition",
        asks: "Is the relationship valid on the evidence available?",
        branches: [
          {
            label: "Valid",
            when: "the basis is sufficient and the relationship is permitted between these entity types",
            to: "a.activate",
          },
          {
            label: "Evidence outstanding",
            when: "the relationship is plausible and the basis is not yet sufficient",
            to: "x.pending",
          },
          {
            label: "Not valid",
            when: "the relationship is not permitted, or the basis contradicts it",
            to: "x.rejected",
          },
        ],
      },
      {
        id: "x.pending",
        kind: "exit",
        state: "PENDING_EVIDENCE; the relationship is not active",
        terminal: false,
        reEntry:
          "sufficient basis arriving later activates it. Nothing flows from a pending relationship, which is the difference between pending and active",
      },
      {
        id: "x.rejected",
        kind: "exit",
        state: "REJECTED; no relationship created",
        terminal: false,
        reEntry: "a different basis is assessed on its own terms",
      },
      {
        id: "a.activate",
        kind: "action",
        does: "Record ACTIVE_RELATIONSHIP with its type, direction, scope and effective time. Creating a relationship links two entities and consolidates nothing - both keep their own identity, their own lifecycle and their own history",
        writes: [{ field: "relationship_log", mode: "append" }],
        next: "x.active",
      },
      {
        id: "x.active",
        kind: "exit",
        state: "ACTIVE_RELATIONSHIP",
        terminal: false,
        reEntry: "changes to it are REL-92's, and its ending is REL-93's",
      },
    ],
    guardrails: [
      "A shared attribute is not proof of a relationship. Two people can share an address, a surname and a device and be unrelated.",
      "Creating a relationship is not an identity merge.",
      "A long-lived link is not an agreement. Where the relationship carries a term, an effective period, a renewal model or lapse semantics, it belongs to the continuing-relationship lifecycle and not here.",
      "Direction is preserved where the relationship's semantics are directional.",
    ],
    reusableRule:
      "Entity relationships should be created only when the relationship itself has sufficient authoritative basis.",
  },

  /* ------------------------------------------------------------ REL-92 */
  {
    id: "REL-92",
    slug: "relationship-change",
    category: "structure",
    name: "Relationship change → recalculate rights and obligations → continue",
    purpose:
      "Recalculate exactly what depended on a relationship when it changes, and nothing else.",
    entity: {
      scope: "the relationship that changed and the entities connected by it",
      note: "Historical relationship periods are preserved. Who was related to whom, and when, is usually what a later question is actually about. What changes here is what the structural relationship between the entities means. It does not own a change to the commercial or contractual terms a continuing relationship runs under - that is SUB-166, and the same two entities can be party to both.",
    },
    distinctFrom: [
      {
        journey: "SUB-166",
        because:
          "This changes what the entities' structural relationship means - the type of membership, the direction of a parent-child link, the basis on which a representative acts. SUB-166 changes the authorized terms a continuing relationship runs under - the plan, the tier, the scope, the price. Someone can become a contractor instead of an employee with their subscription untouched, and move from Basic to Pro without their relationship to the organisation changing at all.",
      },
    ],
    entry: "t.changed",
    nodes: [
      {
        id: "t.changed",
        kind: "trigger",
        event: "relationship_state_or_type_changed",
        evidence: {
          requires: [
            "an authoritative change to an existing structural relationship's state or type between two entities",
          ],
          insufficientAlone: [
            "a change to the plan, tier, scope or contractual terms of a continuing relationship, which changes what was agreed rather than how the entities are related",
            "a pricing or renewal-term modification, which belongs to the agreement rather than to the link",
          ],
          source: "authoritative",
        },
        next: "a.record",
      },
      {
        id: "a.record",
        kind: "action",
        does: "Record the previous relationship, the new one, when the change takes effect and why, appended rather than overwritten. The period the old relationship covered stays readable",
        writes: [{ field: "relationship_log", mode: "append" }],
        next: "a.identify",
      },
      {
        id: "a.identify",
        kind: "action",
        does: "Identify what genuinely depends on this relationship: rights, responsibilities, entitlements, routing, permissions and any active obligations. Anything not on that list is not touched",
        next: "a.invalidate",
      },
      {
        id: "a.invalidate",
        kind: "action",
        does: "Invalidate the queued actions that depended on the superseded relationship. An action scheduled under a relationship that has changed executes on behalf of a structure that no longer exists",
        writes: [{ field: "suppressed_sends", mode: "append" }],
        next: "c.affected",
      },
      {
        id: "c.affected",
        kind: "condition",
        asks: "Is any dependent state genuinely affected?",
        branches: [
          {
            label: "Something depends on it",
            when: "at least one right, obligation or permission changes because of this",
            to: "c.responsibility",
          },
          {
            label: "Nothing depends on it",
            when: "the change is descriptive and nothing downstream reads it",
            to: "x.recorded",
          },
        ],
      },
      {
        id: "x.recorded",
        kind: "exit",
        state: "relationship updated; nothing else recalculated",
        terminal: false,
        reEntry: "the next change is assessed against the new relationship",
      },
      {
        id: "c.responsibility",
        kind: "condition",
        asks: "Does responsibility for anything actually move?",
        branches: [
          {
            label: "Responsibility moves",
            when: "someone else becomes answerable for an open obligation because of this change",
            to: "h.ownership",
          },
          {
            label: "Responsibility stays",
            when: "rights or permissions change while the same party remains answerable",
            to: "a.recalculate",
          },
        ],
      },
      {
        id: "h.ownership",
        kind: "handoff",
        to: "OWN-54",
        on: "a relationship change that moves responsibility for an open obligation",
        carries: [
          "the relationship change and its effective time",
          "the open obligations, whose deadlines the transfer does not reset",
        ],
      },
      {
        id: "a.recalculate",
        kind: "action",
        does: "Recalculate only the affected rights and obligations, as a scoped delta rather than a rebuild",
        writes: [{ field: "relationship_log", mode: "append" }],
        next: "c.entitlement",
      },
      {
        id: "c.entitlement",
        kind: "condition",
        asks: "Does the change alter entitlement scope?",
        branches: [
          {
            label: "Entitlement affected",
            when: "the relationship is part of the basis on which an entitlement rests",
            to: "h.entitlement",
          },
          {
            label: "Entitlement unaffected",
            when: "what changed sits outside any entitlement basis",
            to: "x.recalculated",
          },
        ],
      },
      {
        id: "h.entitlement",
        kind: "handoff",
        to: "ACC-73",
        on: "a relationship change that alters an entitlement basis",
        carries: ["the previous and new relationship", "which entitlements rest on it"],
      },
      {
        id: "x.recalculated",
        kind: "exit",
        state: "dependent rights and obligations recalculated; nothing else touched",
        terminal: false,
        reEntry: "a further change recalculates from the new state",
      },
    ],
    guardrails: [
      "A relationship change is not an identity change.",
      "A relationship change is not an ownership transfer unless responsibility actually moves.",
      "A structural relationship change is not a change to the commercial or contractual terms of a continuing relationship.",
      "Historical relationship periods are preserved.",
      "Actions queued under the superseded relationship do not execute.",
    ],
    reusableRule:
      "A relationship change should recalculate only the rights and obligations that actually depend on that relationship.",
  },

  /* ------------------------------------------------------------ REL-93 */
  {
    id: "REL-93",
    slug: "relationship-end",
    category: "structure",
    name: "Relationship end → remove future dependency → reconcile existing obligations",
    purpose:
      "Stop what a relationship was carrying forward without cancelling what it validly produced.",
    entity: {
      scope: "the relationship that ended and the entities it connected",
      note: "Only this relationship ends. Other relationships between the same two entities are untouched, and so is the record that this one existed. What ends here is a structural link. It does not own a term-bearing continuing agreement whose lifecycle includes effective dates, renewal, cancellation or lapse - an agreement that existed through this link reaches its own end on its own terms, in SUB-170.",
    },
    distinctFrom: [
      {
        journey: "SUB-170",
        because:
          "SUB-170 ends a term: a subscription, contract, policy or membership reaches cancellation, non-renewal, expiry, termination or lapse, and what stops is what the term was granting. This ends a structural link between two entities, and what stops is what depended on the link. An employee leaving an organisation ends the link and not the organisation's contract; a contract expiring ends the term and leaves the employee where they were.",
      },
    ],
    entry: "t.ended",
    nodes: [
      {
        id: "t.ended",
        kind: "trigger",
        event: "relationship_ended",
        evidence: {
          requires: [
            "an authoritative end to an active structural relationship between two entities, with an effective time",
          ],
          insufficientAlone: [
            "a subscription, contract, policy or membership reaching its end, which ends a term rather than a structural link",
            "a party's rights under an agreement stopping, which the agreement's own lifecycle owns",
          ],
          source: "authoritative",
        },
        next: "a.record-end",
      },
      {
        id: "a.record-end",
        kind: "action",
        does: "Record when it ended and why, appended to the relationship's history. The relationship having existed is not undone by its ending, and the period it covered stays readable - commitments made under it depended on it being real at the time",
        writes: [{ field: "relationship_log", mode: "append" }],
        next: "a.future",
      },
      {
        id: "a.future",
        kind: "action",
        does: "Identify the future rights and capabilities that depended on this relationship and remove or recalculate them from the effective end. Unrelated relationships between the same entities are untouched, and so is anything resting on a different basis",
        writes: [{ field: "suppressed_sends", mode: "append" }],
        next: "c.obligations",
      },
      {
        id: "c.obligations",
        kind: "condition",
        asks: "Were obligations created while the relationship was valid?",
        branches: [
          {
            label: "Obligations outstanding",
            when: "an open case, a confirmed reservation, an approved request, an existing entitlement or a financial obligation was created under it",
            to: "h.reconcile",
          },
          {
            label: "Nothing outstanding",
            when: "the relationship carried only future behaviour",
            to: "c.retention",
          },
        ],
      },
      {
        id: "h.reconcile",
        kind: "handoff",
        to: "external:commitment-reconciliation",
        on: "a relationship ending with obligations created under it still live",
        carries: [
          "each obligation and when it was created relative to the end",
          "the explicit fact that nothing has been cancelled - the relationship ending does not decide that",
        ],
      },
      {
        id: "c.retention",
        kind: "condition",
        asks: "Must data or history be retained beyond the relationship?",
        branches: [
          {
            label: "Retention applies",
            when: "policy or law requires the record to survive the relationship",
            to: "a.retain",
          },
          {
            label: "No retention requirement",
            when: "nothing beyond the relationship record itself has to be kept",
            to: "x.ended",
          },
        ],
      },
      {
        id: "a.retain",
        kind: "action",
        does: "Retain according to the applicable policy, marked as retained under an ended relationship rather than left looking like a live one",
        writes: [{ field: "relationship_log", mode: "append" }],
        next: "x.ended",
      },
      {
        id: "x.ended",
        kind: "exit",
        state: "relationship ended; history intact, obligations reconciled separately",
        terminal: false,
        reEntry:
          "a new relationship between the same entities is created on its own basis, and is a different relationship rather than a revival of this one",
      },
    ],
    guardrails: [
      "Ending a relationship does not delete the historical relationship.",
      "Ending a relationship does not automatically cancel commitments created while it existed.",
      "Unrelated relationships between the same entities remain unaffected.",
      "Ending a structural link does not terminate an agreement that ran through it. A contract, subscription, policy or membership reaches its own end on its own terms, and inferring one from the other cancels things nobody cancelled.",
    ],
    reusableRule:
      "Ending a relationship removes future relationship-dependent behavior without erasing obligations legitimately created while the relationship existed.",
  },

  /* ------------------------------------------------------------ REL-94 */
  {
    id: "REL-94",
    slug: "role-change-delta",
    category: "structure",
    name: "Role change → authority and capability delta → apply",
    purpose:
      "Move what someone may do next, by the difference between two roles, without disturbing what they did under the old one.",
    entity: {
      scope: "the person or member, the role, and the account or organisation the role is held in",
      note: "A role belongs to a link between a person and an organisation. The same person holds different roles in different places, and changing one changes nothing about the others.",
    },
    distinctFrom: [
      {
        journey: "IDN-89",
        because:
          "A role change alters what someone may do. An identity attribute change alters who they are on record. Treating a role change as an identity change rebuilds the person and loses their history.",
      },
    ],
    entry: "t.role",
    nodes: [
      {
        id: "t.role",
        kind: "trigger",
        event: "role_changed",
        evidence: {
          requires: ["an authoritative role change with an effective time"],
          source: "authoritative",
        },
        next: "a.delta",
      },
      {
        id: "a.delta",
        kind: "action",
        does: "Compare the previous and new role and calculate the capability and authority delta. What gets applied is the difference - a capability present in both roles is not revoked and re-granted, which the holder would experience as an outage in the middle of an administrative change",
        writes: [{ field: "role_change_log", mode: "append" }],
        next: "c.pending",
      },
      {
        id: "c.pending",
        kind: "condition",
        asks: "Does pending work or an open approval rest on the authority the previous role carried?",
        branches: [
          {
            label: "Pending decisions under the old authority",
            when: "an approval, a decision or an assignment is open and was valid under the role being replaced",
            to: "h.authority",
          },
          {
            label: "Nothing pending",
            when: "no open decision depends on the previous role",
            to: "c.direction",
          },
        ],
      },
      {
        id: "h.authority",
        kind: "handoff",
        to: "OWN-60",
        on: "a role change with decisions pending under the authority it replaces",
        carries: [
          "the capability and authority delta, which is applied once the pending decisions are settled",
          "the pending decisions themselves, whose original requests and deadlines the role change does not reset",
        ],
      },
      {
        id: "c.direction",
        kind: "condition",
        asks: "Which way does the delta move?",
        branches: [
          {
            label: "Grants only",
            when: "the new role adds capabilities and removes none",
            to: "h.entitlement",
          },
          {
            label: "Removes, or mixed",
            when: "at least one capability is no longer carried, whether or not others were added",
            to: "a.apply",
          },
        ],
      },
      {
        id: "h.entitlement",
        kind: "handoff",
        to: "ACC-73",
        on: "a role change that only adds capabilities",
        carries: ["the delta and its effective time", "the role as the new entitlement basis"],
      },
      {
        id: "a.apply",
        kind: "action",
        does: "Apply the delta: grant what the new role adds, and revoke or restrict what it removes, according to each capability's own dependency rules. Actions validly performed under the previous role are not invalidated - a downgrade changes what someone may do next, never what they already did",
        writes: [{ field: "role_change_log", mode: "append" }],
        next: "x.applied",
      },
      {
        id: "x.applied",
        kind: "exit",
        state: "authority and capability delta applied; prior actions intact",
        terminal: false,
        reEntry: "a further role change is compared against the current role",
      },
    ],
    guardrails: [
      "A role change is not an identity change.",
      "A role downgrade does not invalidate actions historically performed under the previous role.",
      "Pending decisions are revalidated against current authority before the delta is applied.",
      "The delta is scoped - capabilities common to both roles are left alone.",
    ],
    reusableRule:
      "Role changes should modify current authority through scoped deltas while preserving the history of actions validly performed under prior authority.",
  },

  /* ------------------------------------------------------------ REL-95 */
  {
    id: "REL-95",
    slug: "parent-state-propagation",
    category: "structure",
    name: "Parent state change → determine child impact → propagate selectively",
    purpose:
      "Let a parent's state reach only the children that genuinely depend on it, through a rule someone actually wrote.",
    entity: {
      scope: "the parent whose state changed, and each child evaluated individually against the dependency model",
      note: "Children are classified individually. A single verdict for the whole collection is the assumption this journey exists to prevent.",
    },
    distinctFrom: [
      {
        journey: "REL-96",
        because:
          "This propagates downward through defined dependencies. REL-96 derives upward through an aggregation policy. They are opposite directions with different rules, and neither is the inverse of the other.",
      },
    ],
    entry: "t.parent",
    nodes: [
      {
        id: "t.parent",
        kind: "trigger",
        event: "parent_state_materially_changed",
        evidence: {
          requires: [
            "a material state change on a parent entity - an organisation suspended, a master account closed, a contract state changed, a parent resource disabled",
          ],
          source: "authoritative",
        },
        next: "c.model",
      },
      {
        id: "c.model",
        kind: "condition",
        asks: "Is a dependency model defined for this parent-child relationship?",
        branches: [
          {
            label: "Defined",
            when: "a rule states which child states depend on which parent states, and how",
            to: "a.classify",
          },
          {
            label: "Not defined",
            when: "nothing states what this parent change should do to its children",
            to: "h.undefined",
          },
        ],
      },
      {
        id: "h.undefined",
        kind: "handoff",
        to: "DEC-181",
        on: "a parent state change with no defined dependency model",
        carries: [
          "the parent change and the children that would be affected under a naive inheritance",
          "the explicit fact that nothing was propagated, because inheritance was not assumed",
        ],
        suppresses: ["any automatic propagation to children while the model is undefined"],
      },
      {
        id: "a.classify",
        kind: "action",
        does: "Classify each child individually against the model: which are directly dependent on the parent's state, which are independently valid, and which carry open obligations. One verdict for the whole collection is the assumption that turns a suspended organisation into eleven deleted subsidiaries",
        writes: [{ field: "propagation_log", mode: "append" }],
        next: "c.dependent",
      },
      {
        id: "c.dependent",
        kind: "condition",
        asks: "How does each class resolve?",
        branches: [
          {
            label: "Directly dependent",
            when: "the model says this child's state follows the parent's",
            to: "c.obligations",
          },
          {
            label: "Independently valid",
            when: "the child stands on its own basis and the model does not make it follow",
            to: "x.preserved",
          },
        ],
      },
      {
        id: "x.preserved",
        kind: "exit",
        state: "child state preserved; the parent change does not reach it",
        terminal: false,
        reEntry:
          "a parent change that the model does make this child follow is evaluated when it happens. A parent going inactive does not delete a child that stands on its own",
      },
      {
        id: "c.obligations",
        kind: "condition",
        asks: "Do the dependent children carry open obligations?",
        branches: [
          {
            label: "Obligations open",
            when: "a dependent child holds a commitment that would be destroyed by propagation",
            to: "h.reconcile",
          },
          {
            label: "Nothing open",
            when: "the dependent children hold nothing that outlives the propagation",
            to: "a.propagate",
          },
        ],
      },
      {
        id: "h.reconcile",
        kind: "handoff",
        to: "external:commitment-reconciliation",
        on: "propagation that would reach a child holding an open obligation",
        carries: [
          "the obligation and the propagation being held for it",
          "the explicit fact that nothing destructive has been applied to that child yet",
        ],
      },
      {
        id: "a.propagate",
        kind: "action",
        does: "Apply the defined consequence to the dependent children only, recording what propagated, to which children, and under which rule. Propagation that cannot say which rule produced it cannot be reviewed, reversed or explained",
        writes: [{ field: "propagation_log", mode: "append" }],
        next: "x.propagated",
      },
      {
        id: "x.propagated",
        kind: "exit",
        state: "consequence applied to dependent children, scoped and recorded",
        terminal: false,
        reEntry: "a further parent change is classified again against the model",
      },
    ],
    guardrails: [
      "A parent going inactive does not delete every child.",
      "A parent restriction does not restrict every child globally unless the model defines it.",
      "Propagation stays scoped and auditable - what went where, under which rule.",
      "Where no dependency model exists, nothing propagates.",
    ],
    reusableRule:
      "Parent state changes should propagate only through explicitly defined dependencies rather than through assumed inheritance.",
  },

  /* ------------------------------------------------------------ REL-96 */
  {
    id: "REL-96",
    slug: "parent-state-aggregation",
    category: "structure",
    name: "Child state change → recalculate aggregate parent state",
    purpose:
      "Derive a parent's state from its children through an explicit aggregation policy, recomputed from source rather than nudged by whichever child reported last.",
    entity: {
      scope: "the parent and the full collection of children the policy reads",
      note: "The aggregate is recomputed from the authoritative children, not incremented from the event that arrived. That is what keeps it rebuildable and stops it drifting.",
    },
    entry: "t.child",
    nodes: [
      {
        id: "t.child",
        kind: "trigger",
        event: "child_state_changed",
        evidence: {
          requires: ["a change to a child state that the parent's aggregation policy reads"],
          insufficientAlone: [
            "any child change, where no policy makes the parent depend on it",
          ],
          source: "authoritative",
        },
        next: "c.policy",
      },
      {
        id: "c.policy",
        kind: "condition",
        asks: "Is an aggregation policy defined for this parent state?",
        branches: [
          {
            label: "Defined",
            when: "a policy states how child states combine into the parent's, and what transitions it",
            to: "a.recompute",
          },
          {
            label: "Not defined",
            when: "no policy states how these children combine",
            to: "h.undefined",
          },
        ],
      },
      {
        id: "h.undefined",
        kind: "handoff",
        to: "DEC-181",
        on: "a child change with no aggregation policy to combine it",
        carries: [
          "the parent, the children and the change that arrived",
          "the explicit fact that no ANY, ALL, majority or threshold rule was assumed in order to produce a parent state",
        ],
      },
      {
        id: "a.recompute",
        kind: "action",
        does: "Recompute the parent's derived state from the authoritative children using the defined policy, rather than adjusting it from the single child event that arrived. Recomputing from source means the aggregate can be rebuilt at any moment and cannot drift away from what the children actually say",
        writes: [{ field: "aggregation_log", mode: "append" }],
        next: "c.criteria",
      },
      {
        id: "c.criteria",
        kind: "condition",
        asks: "Does the recomputed aggregate meet the parent's transition criteria?",
        branches: [
          {
            label: "Criteria met",
            when: "the policy's condition for moving the parent's state is satisfied",
            to: "a.update",
          },
          {
            label: "Not met",
            when: "the aggregate moved and the parent's state does not",
            to: "x.retained",
          },
        ],
      },
      {
        id: "a.update",
        kind: "action",
        does: "Update the derived parent state, recording which children and which policy produced it, so the transition can be explained without recomputing it by hand",
        writes: [{ field: "aggregation_log", mode: "append" }],
        next: "x.updated",
      },
      {
        id: "x.updated",
        kind: "exit",
        state: "derived parent state updated from the aggregation policy",
        terminal: false,
        reEntry: "the next relevant child change recomputes it again from source",
      },
      {
        id: "x.retained",
        kind: "exit",
        state: "aggregate recomputed; parent state unchanged",
        terminal: false,
        reEntry:
          "this is the ordinary outcome. One child changing is not the parent changing, and most child events correctly end here",
      },
    ],
    guardrails: [
      "One child's state does not automatically become the parent's state.",
      "Aggregation semantics come from policy. ANY, ALL, majority and percentage thresholds are never inferred.",
      "The aggregate is recomputable from the authoritative children rather than accumulated from events.",
    ],
    reusableRule:
      "Parent state derived from children must follow an explicit aggregation policy rather than simple state copying.",
  },

  /* ------------------------------------------------------------ REL-97 */
  {
    id: "REL-97",
    slug: "duplicate-assessment",
    category: "structure",
    name: "Duplicate entity detected → assess → keep separate, link or merge",
    purpose:
      "Assess whether two records are the same entity, and route the answer - without consolidating anything.",
    entity: {
      scope: "the candidate set of records suspected of representing one entity",
      note: "The set is the unit. Three records suspected of being one person are assessed together, because a pairwise answer can be internally inconsistent.",
    },
    distinctFrom: [
      {
        journey: "REL-98",
        because:
          "Linking is one of the outcomes this assessment can reach. It is a separate journey because a link has its own semantics and its own sharing rules, which the assessment does not decide.",
      },
    ],
    entry: "t.detected",
    nodes: [
      {
        id: "t.detected",
        kind: "trigger",
        event: "potential_duplicate_detected",
        evidence: {
          requires: [
            "a match between records strong enough to be worth assessing",
          ],
          insufficientAlone: [
            "the same name",
            "the same postcode or address",
            "a similar spelling, which is what matching produces most of",
          ],
          source: "inferred",
        },
        next: "a.evidence",
      },
      {
        id: "a.evidence",
        kind: "action",
        does: "Collect the matching evidence and record its strength: verified identifiers, authoritative external IDs, declared ownership, verified contact points, business identifiers and relationship history. A match score is a reason to look and never a conclusion - the same email may be a shared family address, and the same phone number may be a workplace",
        writes: [{ field: "duplicate_assessment_log", mode: "append" }],
        next: "c.assessment",
      },
      {
        id: "c.assessment",
        kind: "condition",
        asks: "What does the evidence actually support?",
        branches: [
          {
            label: "Not the same entity",
            when: "the evidence is explained by something other than identity - a shared household, a shared workplace, a common name",
            to: "x.separate",
          },
          {
            label: "Related but distinct",
            when: "the records genuinely represent different entities that have a real relationship",
            to: "h.link",
          },
          {
            label: "Same entity, consolidation looks safe",
            when: "verified identifiers or authoritative external IDs establish it, and nothing about the records makes merging risky",
            to: "h.merge",
          },
          {
            label: "Ambiguous or high-risk",
            when: "the evidence is suggestive and incomplete, or the records carry state that would be dangerous to consolidate wrongly",
            to: "h.review",
          },
        ],
      },
      {
        id: "x.separate",
        kind: "exit",
        state: "KEEP_SEPARATE; the records represent different entities",
        terminal: false,
        reEntry:
          "stronger evidence later re-opens the assessment. Keeping two records apart is reversible; merging them usually is not, which is why this is the default when the evidence does not carry",
      },
      {
        id: "h.link",
        kind: "handoff",
        to: "REL-98",
        on: "records that are related and genuinely distinct",
        carries: [
          "both records and the evidence of the relationship between them",
          "the explicit finding that they are not the same entity, so the link does not drift toward being treated as one",
        ],
      },
      {
        id: "h.merge",
        kind: "handoff",
        to: "TRM-101",
        on: "a candidate set the evidence supports consolidating",
        carries: [
          "the full evidence set and the confidence it establishes",
          "the explicit fact that this journey has assessed and not authorised - detecting a duplicate is not permission to merge it, and the merge mechanism applies its own evidence requirements before consolidating anything",
        ],
      },
      {
        id: "h.review",
        kind: "handoff",
        to: "DEC-181",
        on: "an assessment the evidence cannot settle, or one whose consequences are too large to settle automatically",
        carries: [
          "the candidate set, the evidence and what specifically is ambiguous about it",
          "what each record currently holds, which is what makes a wrong merge expensive",
        ],
      },
    ],
    guardrails: [
      "The same name is not the same person.",
      "A shared email or phone number may not prove the same entity - it depends on the model, and households and workplaces share both routinely.",
      "Duplicate detection is not merge authorization. This journey assesses and routes; consolidating records is a separate mechanism with its own evidence requirements.",
    ],
    reusableRule:
      "Duplicate detection identifies a reconciliation candidate; merge requires separate evidence that consolidation is safe.",
  },

  /* ------------------------------------------------------------ REL-98 */
  {
    id: "REL-98",
    slug: "entity-link",
    category: "structure",
    name: "Entity link → shared context → preserve independent identity",
    purpose:
      "Record that two entities are related and let defined context cross between them, while both remain two entities.",
    entity: {
      scope: "the link itself, plus the two entities it connects",
      note: "Each entity keeps its own lifecycle state and history. The link is a third record about them, not a step toward becoming one.",
    },
    entry: "t.link",
    nodes: [
      {
        id: "t.link",
        kind: "trigger",
        event: "cross_entity_link_established",
        evidence: {
          requires: ["a valid relationship or link between two distinct entities"],
          insufficientAlone: [
            "a duplicate match, which is a question about whether they are one entity rather than evidence that they are two related ones",
          ],
          source: "authoritative",
        },
        next: "a.semantics",
      },
      {
        id: "a.semantics",
        kind: "action",
        does: "Define what this link actually means - the same household, related accounts, linked profiles, a business relationship, a cross-product connection. The semantics decide what may be shared, and a link whose semantics are undefined shares nothing at all",
        writes: [{ field: "link_log", mode: "append" }],
        next: "c.shared",
      },
      {
        id: "c.shared",
        kind: "condition",
        asks: "What context do these link semantics explicitly permit sharing?",
        branches: [
          {
            label: "Defined shared context",
            when: "the link's semantics name specific context that may cross between the entities",
            to: "a.share",
          },
          {
            label: "Nothing shared",
            when: "the link records a relationship and permits no context to cross - which is the common case",
            to: "a.independence",
          },
        ],
      },
      {
        id: "a.share",
        kind: "action",
        does: "Share only the context the semantics explicitly permit. Anything not named is not shared, including things that would obviously be convenient",
        writes: [{ field: "link_log", mode: "append" }],
        next: "a.independence",
      },
      {
        id: "a.independence",
        kind: "action",
        does: "Confirm each entity keeps its own lifecycle state and history. Consent does not cross the link, and neither does entitlement or access, unless the relationship rules explicitly permit it - a household link is not permission to email everyone in the household",
        next: "c.propagation",
      },
      {
        id: "c.propagation",
        kind: "condition",
        asks: "Is anything attempting to carry consent, entitlement, credentials or access across the link?",
        branches: [
          {
            label: "Something is propagating",
            when: "a downstream process is treating the link as though the entities were one",
            to: "a.block",
          },
          {
            label: "Nothing is",
            when: "only the permitted context crosses",
            to: "x.linked",
          },
        ],
      },
      {
        id: "a.block",
        kind: "action",
        does: "Block the propagation and record it. This is the specific failure a link becomes when it is quietly treated as a merge, and catching it here is cheaper than discovering it as a consent complaint",
        writes: [{ field: "link_log", mode: "append" }],
        next: "x.linked",
      },
      {
        id: "x.linked",
        kind: "exit",
        state: "linked; two entities, two lifecycles, defined shared context",
        terminal: false,
        reEntry:
          "the link's semantics may be changed, and the link may be ended, but neither turns it into a merge. Consolidating the records is a separate decision with separate evidence",
      },
    ],
    guardrails: [
      "Linked is not merged.",
      "Consent does not automatically propagate across linked identities.",
      "Entitlement and access do not propagate unless the relationship rules explicitly permit it.",
      "A link whose semantics are undefined shares nothing.",
    ],
    reusableRule:
      "Entity linking enables defined cross-entity context while preserving independent identity and lifecycle state.",
  },

  /* ------------------------------------------------------------ REL-99 */
  {
    id: "REL-99",
    slug: "entity-split",
    category: "structure",
    name: "Entity split required → create separate records → allocate history and state safely",
    purpose:
      "Separate what should never have been one record, or what must now be managed apart, without copying the things that do not divide.",
    entity: {
      scope: "the source entity and the entities that result from the split",
      note: "The source entity's history remains the source entity's history. The resulting records inherit allocations, not a rewritten past.",
    },
    distinctFrom: [
      {
        journey: "REL-98",
        because:
          "A link connects two records that already exist separately. A split creates that separation where it did not exist, which means deciding what each side gets - and what neither side may simply be given a copy of.",
      },
    ],
    entry: "t.split",
    nodes: [
      {
        id: "t.split",
        kind: "trigger",
        event: "entity_split_required",
        evidence: {
          requires: [
            "an authoritative requirement to separate state currently held under one entity",
          ],
          source: "authoritative",
        },
        next: "a.basis",
      },
      {
        id: "a.basis",
        kind: "action",
        does: "Determine the split basis - what actually distinguishes the resulting entities from one another. Without it, allocation becomes a series of individual guesses",
        writes: [{ field: "split_log", mode: "append" }],
        next: "a.classify",
      },
      {
        id: "a.classify",
        kind: "action",
        does: "Classify every piece of existing information as entity-specific, shared, ambiguous, historical or non-transferable. The last category is the one that gets missed: consent, entitlements, credentials and financial obligations do not divide by being copied, and duplicating one creates an obligation nobody incurred or a permission nobody gave",
        writes: [{ field: "split_log", mode: "append" }],
        next: "c.allocation",
      },
      {
        id: "c.allocation",
        kind: "condition",
        asks: "How does each classified item resolve?",
        branches: [
          {
            label: "Clearly one entity's",
            when: "the item belongs unambiguously to one of the resulting entities",
            to: "a.allocate",
          },
          {
            label: "Genuinely shared",
            when: "the item belongs to the relationship between them rather than to either",
            to: "a.reference",
          },
          {
            label: "Non-transferable",
            when: "consent, an entitlement, a credential or a financial obligation, none of which divides",
            to: "a.non-transferable",
          },
          {
            label: "Ambiguous",
            when: "the item cannot be attributed on the split basis",
            to: "h.review",
          },
        ],
      },
      {
        id: "a.allocate",
        kind: "action",
        does: "Allocate the item to the entity it belongs to",
        writes: [{ field: "split_log", mode: "append" }],
        next: "a.recalculate",
      },
      {
        id: "a.reference",
        kind: "action",
        does: "Preserve the item through a relationship or reference model rather than duplicating it into both records. Two copies of one shared history diverge the first time either is edited",
        writes: [{ field: "split_log", mode: "append" }],
        next: "a.recalculate",
      },
      {
        id: "a.non-transferable",
        kind: "action",
        does: "Leave it with the entity that holds it and record that it did not divide. A new record existing is not a reason for it to receive a copy of a consent, an entitlement or a debt",
        writes: [{ field: "split_log", mode: "append" }],
        next: "a.recalculate",
      },
      {
        id: "h.review",
        kind: "handoff",
        to: "DEC-181",
        on: "state that cannot be attributed to either resulting entity",
        carries: [
          "the item, the split basis, and why attribution failed",
          "the fact that it is held unresolved rather than assigned to whichever record was created first",
        ],
      },
      {
        id: "a.recalculate",
        kind: "action",
        does: "Recalculate each resulting entity's rights, permissions, entitlements, obligations and active journeys from what it now actually holds, rather than from what the source entity held",
        writes: [{ field: "split_log", mode: "append" }],
        next: "a.audit",
      },
      {
        id: "a.audit",
        kind: "action",
        does: "Record that the split occurred, when, and on what basis. History is not rewritten as though the records had always been separate - events that happened to the combined entity happened to the combined entity, and pretending otherwise makes every past event unattributable",
        writes: [{ field: "split_log", mode: "append" }],
        next: "x.split",
      },
      {
        id: "x.split",
        kind: "exit",
        state: "entities separated; current state reconstructed, prior history preserved as it happened",
        terminal: false,
        reEntry:
          "each resulting entity now has its own lifecycle. A further split is assessed against whichever of them requires it",
      },
    ],
    guardrails: [
      "Consent, entitlements, credentials and financial obligations are never blindly duplicated across a split.",
      "The audit trail preserves that a split occurred, when, and on what basis.",
      "History is not rewritten as though the records had always been separate.",
      "Ambiguous state is held unresolved rather than assigned by default.",
    ],
    reusableRule:
      "Entity splitting reconstructs independent current states while preserving the historical fact that the records were previously represented together.",
  },

  /* ------------------------------------------------------------ REL-100 */
  {
    id: "REL-100",
    slug: "orphaned-entity-resolution",
    category: "structure",
    name: "Required relationship missing → orphan state → resolve or reassign",
    purpose:
      "Make a missing required relationship an explicit, findable state rather than a null field that active work quietly runs against.",
    entity: {
      scope: "the entity missing its required relationship, and the relationship type that is absent",
      note: "One orphan state per missing relationship. An entity missing two required links is in two unresolved states, each resolvable independently.",
    },
    distinctFrom: [
      {
        journey: "OWN-51",
        because:
          "OWN-51 routes work that has never had an owner. This handles an entity that had a required relationship and lost it, which means inherited deadlines and obligations are already running against it.",
      },
    ],
    entry: "t.missing",
    nodes: [
      {
        id: "t.missing",
        kind: "trigger",
        event: "required_relationship_missing",
        evidence: {
          requires: [
            "a relationship the entity requires to function being absent, invalid or removed - a work item without a required owner, a resource without a valid parent, a case without an account link, a dependent without a primary",
          ],
          source: "authoritative",
        },
        next: "a.state",
      },
      {
        id: "a.state",
        kind: "action",
        does: "Record the entity as ORPHANED, naming which relationship is missing. This is an explicit state rather than a null field - null is unqueryable and unescalatable, and an entity with no owner has to be findable as an entity with no owner. Inherited deadlines and obligations keep running throughout; being orphaned is our problem and does not pause what was already owed",
        writes: [{ field: "orphan_log", mode: "append" }],
        next: "c.replacement",
      },
      {
        id: "c.replacement",
        kind: "condition",
        asks: "Is there a deterministic replacement relationship?",
        branches: [
          {
            label: "Exactly one valid replacement",
            when: "the rules resolve to a single valid counterpart",
            to: "a.reassign",
          },
          {
            label: "Several possible",
            when: "more than one counterpart could be valid and nothing decides between them",
            to: "h.manual",
          },
          {
            label: "None available",
            when: "no valid counterpart currently exists",
            to: "c.holding",
          },
        ],
      },
      {
        id: "h.manual",
        kind: "handoff",
        to: "DEC-181",
        on: "an orphan with several possible replacements and no rule between them",
        carries: [
          "the candidates and what each would imply",
          "the explicit fact that no guess was made - a wrong parent inferred from weak evidence is worse than an unresolved state, because it looks resolved",
        ],
      },
      {
        id: "c.holding",
        kind: "condition",
        asks: "Is there a safe temporary holding scope for this entity?",
        branches: [
          {
            label: "Holding scope exists",
            when: "an explicit unresolved queue or state can hold it without work proceeding against a missing relationship",
            to: "a.hold",
          },
          {
            label: "None",
            when: "nothing can safely hold it while active work continues against it",
            to: "h.escalate",
          },
        ],
      },
      {
        id: "a.hold",
        kind: "action",
        does: "Hold the entity in the explicit unresolved queue, with its inherited deadlines and obligations intact and visible. Held is a state someone can query and escalate; a null relationship is neither",
        writes: [{ field: "orphan_log", mode: "append" }],
        next: "w.restore",
      },
      {
        id: "w.restore",
        kind: "wait",
        until: ["a valid relationship is restored or established"],
        onEvent: "a.revalidate",
        timeout: {
          after: "the resolution SLA for this entity type",
          reason:
            "an orphan is carrying live obligations with nobody attached to them, so an unresolved one escalates rather than waiting quietly",
        },
        onTimeout: "c.terminal",
        windowExtendsOnEngagement: false,
      },
      {
        id: "a.reassign",
        kind: "action",
        does: "Establish the replacement relationship, preserving the entity's inherited deadlines and obligations exactly as they stood. Reassignment changes who is connected, never what is owed or by when",
        writes: [{ field: "orphan_log", mode: "append" }],
        next: "a.revalidate",
      },
      {
        id: "a.revalidate",
        kind: "action",
        does: "Revalidate the entity's current state against the restored relationship before resuming. The relationship changed, so what the entity is entitled to or responsible for under the new one may differ from what it held under the old",
        writes: [{ field: "orphan_log", mode: "append" }],
        next: "x.resumed",
      },
      {
        id: "x.resumed",
        kind: "exit",
        state: "relationship restored; entity revalidated and resumed",
        terminal: false,
        reEntry: "a further missing relationship opens its own orphan state",
      },
      {
        id: "c.terminal",
        kind: "condition",
        asks: "The resolution SLA passed with the entity still orphaned - what does policy do?",
        branches: [
          {
            label: "Escalate",
            when: "the entity carries obligations that make an owner necessary rather than desirable",
            to: "h.escalate",
          },
          {
            label: "Terminal handling",
            when: "policy defines an end state for entities that cannot be reconnected",
            to: "x.terminal",
          },
        ],
      },
      {
        id: "h.escalate",
        kind: "handoff",
        to: "OWN-55",
        on: "an orphaned entity that could not be reconnected",
        carries: [
          "the missing relationship and what has been tried",
          "the inherited obligations and their unchanged deadlines, which are the reason this is urgent",
        ],
      },
      {
        id: "x.terminal",
        kind: "exit",
        state: "orphaned entity handled under its policy end state",
        terminal: false,
        reEntry:
          "a valid relationship becoming available later re-opens this; the entity was never silently discarded",
      },
    ],
    guardrails: [
      "A missing relationship never silently becomes a null field while active work continues.",
      "A parent or owner is not guessed from weak evidence. Several candidates route to a person.",
      "Inherited deadlines and obligations stay intact while the entity is orphaned.",
    ],
    reusableRule:
      "When a required relationship disappears, the entity should enter an explicit unresolved state until a valid relationship is restored.",
  },
];
