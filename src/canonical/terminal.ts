import type { CanonicalJourney, OrchestrationRule } from "./types";

/* CATEGORY 11 - ENTITY MERGE, ACCOUNT CLOSURE, DATA LIFECYCLE & TERMINAL STATES

   The operations that cannot be taken back.

   Everywhere else in this library a wrong decision produces a message nobody
   wanted or an access someone had to ask for again. Here a wrong decision
   consolidates two people into one record, cancels an obligation that was
   owed, or deletes something that had to be kept. The library's usual
   asymmetry - it is cheaper to do too little than too much - is at its
   sharpest in this category, and every journey is shaped by it.

   Four things get treated as one offboarding and are four separate business
   states:

     subscription cancelled   the commercial relationship ended
     account closed           the account relationship ended
     data deleted             the records were removed
     terminal state           the relationship is over and the history remains

   Each has its own trigger, its own authority and its own blockers. Someone
   can close an account while still being billed by an external provider, or
   have their data deleted while their account stays open, or reach a terminal
   relationship state with every record intact. Collapsing them produces the
   two worst outcomes available: charging someone who thought they had left,
   and destroying something that had to be kept.

   TRM-101 is the execution half of REL-97. Detection produced a candidate;
   this consolidates it, but only after every dependent state has been
   reconciled under its own authority rule - because there is no rule that
   applies to consent and to contact points and to financial obligations at
   the same time. TRM-102 exists because the honest answer to a merge conflict
   is often that the merge should stop. */

export const TERMINAL_RULES: readonly OrchestrationRule[] = [
  {
    id: "TRM-R1",
    scope: "terminal",
    rule: "Duplicate detection, merge authorization and merge execution are three separate stages.",
    because:
      "Detection is cheap and frequently wrong, authorization is a judgement about consequences, and execution is usually permanent. Running them as one step means the cheapest evidence drives the least reversible action.",
  },
  {
    id: "TRM-R2",
    scope: "terminal",
    rule: "Merge is reconciliation, not field overwrite. Newest-value-wins is never applied across all state types.",
    because:
      "A newer contact point may supersede an older one while a newer consent does not supersede an older withdrawal. One rule across every field silently picks the wrong answer for whichever fields it was not designed for.",
  },
  {
    id: "TRM-R3",
    scope: "terminal",
    rule: "Each state type carries its own authority and conflict rule during consolidation.",
    because:
      "Consent, entitlement, credentials, obligations and attributes answer to different authorities, and a merge that reads them as one list applies one authority to all of them.",
  },
  {
    id: "TRM-R4",
    scope: "terminal",
    rule: "Identity merge and account consolidation are separate mechanisms.",
    because:
      "Consolidating business structure is routine; consolidating two people into one identity is not, and the second must never happen as a side effect of the first.",
  },
  {
    id: "TRM-R5",
    scope: "terminal",
    rule: "Account consolidation never collapses independent people into one identity.",
    because:
      "Members of a consolidated account remain distinct people with distinct consent and distinct history, and any consolidation that needs them not to be has exceeded what it was authorised to do.",
  },
  {
    id: "TRM-R6",
    scope: "terminal",
    rule: "Relationship and role transfer preserves historical responsibility and inherited obligations.",
    because:
      "Who was answerable at the time something happened is a fact about the past. Transferring the role forward does not move it, and inherited deadlines do not restart because the holder changed.",
  },
  {
    id: "TRM-R7",
    scope: "terminal",
    rule: "Account closure, subscription cancellation and data deletion are three independent state transitions.",
    because:
      "Coupling any pair produces one of the two worst outcomes available here: continuing to charge someone who thought they had left, or destroying records that had to be kept.",
  },
  {
    id: "TRM-R8",
    scope: "terminal",
    rule: "Closing an account inventories its external and commercial dependencies.",
    because:
      "A subscription billed by a third party does not end because our account record did, and the person discovers the difference on their next statement.",
  },
  {
    id: "TRM-R9",
    scope: "terminal",
    rule: "A closed account may require a scoped wind-down state, with its permitted capabilities enumerated.",
    because:
      "Final invoices, refunds, exports and open cases all outlive closure. Leaving that as a general exception rather than an enumerated scope is how a closed account keeps behaving like an open one.",
  },
  {
    id: "TRM-R10",
    scope: "terminal",
    rule: "A terminal relationship state does not mean the historical records never existed.",
    because:
      "Ending a relationship and erasing its history are different acts with different authority, and only one of them was requested.",
  },
  {
    id: "TRM-R11",
    scope: "terminal",
    rule: "Data deletion respects its explicit scope and its authoritative retention obligations. No retention rule is invented.",
    because:
      "Retaining on a guess keeps what should have gone; deleting on a guess destroys what had to stay. Both are unrecoverable and only one of them is visible.",
  },
  {
    id: "TRM-R12",
    scope: "terminal",
    rule: "Distributed deletion requires downstream verification.",
    because:
      "Deletion succeeding in the primary store says nothing about the caches, the warehouse, the backups and the third parties, and those are where the data is actually found later.",
  },
  {
    id: "TRM-R13",
    scope: "terminal",
    rule: "A partial deletion failure stays visible as an unresolved state.",
    because:
      "A deletion reported as complete while a downstream copy survives is the most consequential false report in this library - it ends the investigation that would have found the copy.",
  },
  {
    id: "TRM-R14",
    scope: "terminal",
    rule: "Merge, closure and deletion operations are idempotent wherever their side effects can repeat.",
    because:
      "These jobs are retried like any others, and a second application of a destructive operation is not a duplicate - it is a second destruction.",
  },
  {
    id: "TRM-R15",
    scope: "terminal",
    rule: "Stale jobs never recreate, reactivate or overwrite an entity after a merge, closure or deletion.",
    because:
      "Downstream synchronisation runs on its own schedule and will happily restore a profile that was deleted an hour earlier, which undoes the operation while reporting success.",
  },
  {
    id: "TRM-R16",
    scope: "terminal",
    rule: "Consent, credentials, entitlement and active journeys are explicitly reconciled during a merge.",
    because:
      "These four are the ones a naive consolidation gets wrong in the permissive direction, and an opt-out that disappears because another profile was opted in is not recoverable by noticing it later.",
  },
  {
    id: "TRM-R17",
    scope: "terminal",
    rule: "Destructive operations preserve enough auditability without unnecessarily preserving the personal data they removed.",
    because:
      "The audit has to show what was done and when. An audit that keeps a copy of the deleted record has recreated the thing the deletion was for.",
  },
];

export const TERMINAL_JOURNEYS: readonly CanonicalJourney[] = [
  /* ------------------------------------------------------------ TRM-101 */
  {
    id: "TRM-101",
    slug: "entity-merge-execution",
    category: "terminal",
    goal: "merge-consolidation",
    channels: [],
    name: "Identity or entity merge → reconcile → consolidate → verify",
    purpose:
      "Consolidate records that represent one entity, after every dependent state has been reconciled under its own authority rule.",
    entity: {
      scope: "the source entities, the canonical target, and the merge operation itself as an auditable record",
      note: "The merge operation is its own entity. Its record of conflict decisions and provenance is what makes the consolidated result reviewable, and often what makes it reversible.",
    },
    distinctFrom: [
      {
        journey: "TRM-103",
        because:
          "Account consolidation unifies business structure and leaves the people distinct. This consolidates the representations of one entity, which is a decision about identity and carries a far higher evidence bar.",
      },
    ],
    entry: "t.authorized",
    nodes: [
      {
        id: "t.authorized",
        kind: "trigger",
        event: "merge_explicitly_authorized",
        evidence: {
          requires: [
            "an explicit merge authorization following a duplicate assessment, naming the sources, the target and the authority that authorised it",
          ],
          insufficientAlone: [
            "a duplicate detection, which produces a candidate rather than a decision",
            "a high match score",
            "an assessment concluding the records are probably the same, without an authorisation to act on it",
          ],
          source: "authoritative",
        },
        next: "a.operation",
      },
      {
        id: "a.operation",
        kind: "action",
        does: "Create the auditable merge operation: source entity IDs, the canonical target, the basis, the authority that authorised it, the time, and every conflict decision as it is made. Provenance is what makes the result reviewable - without it the consolidated record cannot say where any part of itself came from",
        writes: [{ field: "merge_log", mode: "append" }],
        next: "a.inventory",
      },
      {
        id: "a.inventory",
        kind: "action",
        does: "Inventory the dependent state before anything is touched: identity attributes, consent, preferences, contact points, entitlements, purchases, subscriptions, support cases, opportunities, credentials, active journeys, open obligations and relationships. Each of these answers to a different authority, and a merge that reads them as one list applies one rule to all of them",
        writes: [{ field: "merge_log", mode: "append" }],
        next: "c.reversible",
      },
      {
        id: "c.reversible",
        kind: "condition",
        asks: "Is this merge reversible?",
        branches: [
          {
            label: "Reversible",
            when: "the architecture can separate the records again if the decision turns out to be wrong",
            to: "c.conflicts",
          },
          {
            label: "Irreversible",
            when: "consolidation cannot be undone once applied",
            to: "c.evidence",
          },
        ],
      },
      {
        id: "c.evidence",
        kind: "condition",
        asks: "Does the evidence and authority meet the higher bar an irreversible merge requires?",
        branches: [
          {
            label: "Sufficient",
            when: "verified identifiers or authoritative external IDs establish it, at the standard an unrecoverable decision demands",
            to: "c.conflicts",
          },
          {
            label: "Not sufficient",
            when: "the evidence would justify a reversible merge and not this one",
            to: "x.insufficient",
          },
        ],
      },
      {
        id: "x.insufficient",
        kind: "exit",
        state: "not merged; evidence sized for a reversible operation",
        terminal: false,
        reEntry:
          "stronger evidence, or an architecture that makes the merge reversible, re-opens this. Leaving two records separate is recoverable and this is not",
      },
      {
        id: "c.conflicts",
        kind: "condition",
        asks: "Does conflicting state exist across the sources?",
        branches: [
          {
            label: "Conflicts present",
            when: "two sources hold incompatible values for state that matters",
            to: "h.conflict",
          },
          {
            label: "No conflicts",
            when: "every state type reconciles without contradiction",
            to: "a.consolidate",
          },
        ],
      },
      {
        id: "h.conflict",
        kind: "handoff",
        to: "TRM-102",
        on: "conflicting state discovered during merge",
        carries: [
          "the merge operation, the inventory and exactly which state conflicts",
          "the fact that nothing has been consolidated yet, so the conflict is decided before rather than after",
        ],
      },
      {
        id: "a.consolidate",
        kind: "action",
        does: "Consolidate each state type under its own authority rule. There is no newest-value-wins applied across the board: a newer contact point may supersede an older one, a newer consent does not supersede an older withdrawal, an entitlement is reconciled rather than either kept or duplicated, and a financial obligation is never added to itself",
        writes: [{ field: "merge_log", mode: "append" }],
        next: "a.repoint",
      },
      {
        id: "a.repoint",
        kind: "action",
        does: "Repoint dependent relationships and active processes onto the canonical entity, so nothing continues to run against a representation that has been superseded",
        writes: [{ field: "merge_log", mode: "append" }],
        next: "a.invalidate",
      },
      {
        id: "a.invalidate",
        kind: "action",
        does: "Invalidate the actions still queued against the superseded representations. A downstream synchronisation running on its own schedule will otherwise restore what was just consolidated, which undoes the merge while reporting success",
        writes: [{ field: "suppressed_sends", mode: "append" }],
        next: "a.verify",
      },
      {
        id: "a.verify",
        kind: "action",
        does: "Verify the merge did what it was for and nothing more: no critical obligation lost, no permission more permissive than any source held, no entitlement duplicated, no duplicate active journey still running, and the source history still traceable",
        writes: [{ field: "merge_log", mode: "append" }],
        next: "c.verified",
      },
      {
        id: "c.verified",
        kind: "condition",
        asks: "Did verification pass?",
        branches: [
          {
            label: "Passed",
            when: "every check holds",
            to: "x.merged",
          },
          {
            label: "Failed",
            when: "a check found a lost obligation, a widened permission, a duplicated entitlement or a surviving duplicate journey",
            to: "h.conflict",
          },
        ],
      },
      {
        id: "x.merged",
        kind: "exit",
        state: "merged into the canonical entity, with provenance and source history intact",
        terminal: false,
        reEntry:
          "a further duplicate candidate involving this entity is assessed on its own evidence, with this merge in the record",
      },
    ],
    guardrails: [
      "A merge never duplicates a financial obligation.",
      "An opt-out never disappears because another profile was opted in.",
      "Provenance is preserved - the consolidated record can say where each part of it came from.",
      "An irreversible merge requires stronger evidence and authority than a reversible one.",
    ],
    reusableRule:
      "Entity merge consolidates representations only after dependent state has been reconciled according to the authority rules of each state type.",
  },

  /* ------------------------------------------------------------ TRM-102 */
  {
    id: "TRM-102",
    slug: "merge-conflict-resolution",
    category: "terminal",
    goal: "merge-consolidation",
    channels: [],
    name: "Merge conflict → safe state → resolve → continue or abort",
    purpose:
      "Fail safe wherever consolidating would require inventing an authority the system does not have.",
    entity: {
      scope: "the merge operation and the specific state in conflict",
      note: "The conflict attaches to particular state, not to the whole merge. Some conflicts stop everything and most do not, and telling them apart is the journey's main work.",
    },
    entry: "t.conflict",
    nodes: [
      {
        id: "t.conflict",
        kind: "trigger",
        event: "critical_merge_conflict_detected",
        evidence: {
          requires: [
            "state that two sources hold incompatibly: contradictory identity attributes, a permission conflict, different ownership claims, incompatible account states, duplicate active obligations, or a credential or security conflict",
          ],
          source: "authoritative",
        },
        next: "a.classify",
      },
      {
        id: "a.classify",
        kind: "action",
        does: "Classify the conflict by domain. The domain decides which authority rule applies, and there is no rule that applies across identity, permission, ownership, obligation and credentials at once",
        writes: [{ field: "merge_log", mode: "append" }],
        next: "c.rule",
      },
      {
        id: "c.rule",
        kind: "condition",
        asks: "Does a deterministic authority rule exist for this domain?",
        branches: [
          {
            label: "Rule exists",
            when: "policy states which source wins for this kind of state, and why",
            to: "a.resolve",
          },
          {
            label: "No rule",
            when: "nothing states how this conflict resolves",
            to: "a.conflict-state",
          },
        ],
      },
      {
        id: "a.resolve",
        kind: "action",
        does: "Apply the rule and record the basis. A conflict resolved in order to make the merge succeed is not resolved - it has been decided by the only party with an interest in the answer, which is whoever wanted the merge",
        writes: [{ field: "merge_log", mode: "append" }],
        next: "c.identity",
      },
      {
        id: "a.conflict-state",
        kind: "action",
        does: "Record the affected state as MERGE_CONFLICT. The most permissive consent or access value is never selected by default - defaulting that way resolves every ambiguity in the direction that cannot be undone, and it is the direction a merge is already biased toward",
        writes: [{ field: "merge_log", mode: "append" }],
        next: "c.identity",
      },
      {
        id: "c.identity",
        kind: "condition",
        asks: "Is this an ambiguous identity conflict?",
        branches: [
          {
            label: "Identity itself is in doubt",
            when: "the conflict suggests these may not be one entity at all",
            to: "a.hold",
          },
          {
            label: "Identity is established",
            when: "the conflict is about state held by an entity we are confident is one",
            to: "c.partial",
          },
        ],
      },
      {
        id: "c.partial",
        kind: "condition",
        asks: "Can the merge safely continue on the portions that carry no conflict?",
        branches: [
          {
            label: "Independent portions exist",
            when: "some state can be consolidated without depending on anything in conflict",
            to: "a.partial",
          },
          {
            label: "Everything is entangled",
            when: "the conflicted state is load-bearing for the rest",
            to: "a.hold",
          },
        ],
      },
      {
        id: "a.hold",
        kind: "action",
        does: "Hold the entire merge. Where identity itself is in doubt, consolidating anything assumes the thing the merge was supposed to establish",
        writes: [{ field: "merge_log", mode: "append" }],
        next: "w.resolution",
      },
      {
        id: "a.partial",
        kind: "action",
        does: "Consolidate only the portions carrying no conflict and no dependency on conflicted state, leaving the rest explicitly unmerged rather than quietly merged with a chosen value",
        writes: [{ field: "merge_log", mode: "append" }],
        next: "w.resolution",
      },
      {
        id: "w.resolution",
        kind: "wait",
        until: ["an authoritative or manual resolution is recorded", "the merge is aborted"],
        onEvent: "c.outcome",
        timeout: {
          after: "the conflict resolution SLA",
          reason:
            "a merge held in conflict leaves two records in a half-consolidated state, which is worse than either outcome and worth escalating rather than waiting out",
        },
        onTimeout: "h.escalate",
        windowExtendsOnEngagement: false,
      },
      {
        id: "h.escalate",
        kind: "handoff",
        to: "OWN-55",
        on: "a merge conflict outliving its resolution SLA",
        carries: [
          "the conflict, its domain and what has been consolidated so far",
          "the fact that the records are currently in a partially reconciled state, which is nobody's intended end state",
        ],
      },
      {
        id: "c.outcome",
        kind: "condition",
        asks: "How was it settled?",
        branches: [
          {
            label: "Resolved",
            when: "an authority determined the answer and the merge may complete",
            to: "x.resolved",
          },
          {
            label: "Aborted",
            when: "the merge should not proceed",
            to: "a.abort",
          },
          {
            label: "Partially reconciled, remainder unresolvable",
            when: "the independent portions consolidated and the conflicted state stays separate",
            to: "x.partial",
          },
        ],
      },
      {
        id: "x.resolved",
        kind: "exit",
        state: "RESOLVED; the merge may complete",
        terminal: false,
        reEntry: "a further conflict in the same merge opens its own instance",
      },
      {
        id: "a.abort",
        kind: "action",
        does: "Abort the merge, unwinding whatever was partially consolidated where that is possible, and recording precisely what could not be unwound. The sources remain separate and the attempt remains in the record",
        writes: [{ field: "merge_log", mode: "append" }],
        next: "x.aborted",
      },
      {
        id: "x.aborted",
        kind: "exit",
        state: "ABORTED; sources remain separate",
        terminal: false,
        reEntry:
          "a new merge requires new evidence. That an earlier attempt was aborted is part of what the next one is judged against",
      },
      {
        id: "x.partial",
        kind: "exit",
        state: "PARTIALLY_RECONCILED; conflicted state left separate and marked",
        terminal: false,
        reEntry:
          "what remains unmerged is named rather than left as a vague inconsistency, so it can be resolved later on its own evidence",
      },
    ],
    guardrails: [
      "A conflict is never resolved merely to make the merge succeed.",
      "The most permissive consent or access state is never chosen by default.",
      "An ambiguous identity conflict stops the entire merge rather than part of it.",
      "What could not be unwound after an abort is recorded rather than assumed away.",
    ],
    reusableRule:
      "Merge conflicts should fail safe whenever consolidation would require inventing authority that the system does not possess.",
  },

  /* ------------------------------------------------------------ TRM-103 */
  {
    id: "TRM-103",
    slug: "account-consolidation",
    category: "terminal",
    goal: "merge-consolidation",
    channels: [],
    name: "Account consolidation → dependency reconciliation → unified relationship",
    purpose:
      "Unify business structure across accounts while every person involved stays a separate person.",
    entity: {
      scope: "the accounts being consolidated and the canonical structure that results",
      note: "Accounts consolidate; people do not. The members of the consolidated account remain distinct identities with distinct consent and distinct history.",
    },
    entry: "t.authorized",
    nodes: [
      {
        id: "t.authorized",
        kind: "trigger",
        event: "account_consolidation_authorized",
        evidence: {
          requires: ["an authorized consolidation naming the accounts and the canonical target"],
          insufficientAlone: [
            "two accounts sharing a domain, a billing address or an administrator",
          ],
          source: "authoritative",
        },
        next: "a.canonical",
      },
      {
        id: "a.canonical",
        kind: "action",
        does: "Determine the canonical account structure - which account survives and what the consolidated shape actually is",
        writes: [{ field: "consolidation_log", mode: "append" }],
        next: "a.inventory",
      },
      {
        id: "a.inventory",
        kind: "action",
        does: "Inventory across every account being consolidated: members, roles, contracts, subscriptions, resources, entitlements, billing relationships, open cases, ownership and active obligations",
        writes: [{ field: "consolidation_log", mode: "append" }],
        next: "c.identities",
      },
      {
        id: "c.identities",
        kind: "condition",
        asks: "Does any part of this require treating two people as one?",
        branches: [
          {
            label: "It does",
            when: "the consolidation only works if two member records are the same person",
            to: "x.not-here",
          },
          {
            label: "It does not",
            when: "every member remains a distinct identity in the consolidated structure",
            to: "c.transferable",
          },
        ],
      },
      {
        id: "x.not-here",
        kind: "exit",
        state: "consolidation stopped; it requires an identity merge",
        terminal: false,
        reEntry:
          "consolidating two people into one identity is a different decision with a far higher evidence bar, assessed and authorised separately. A consolidation that needs it has exceeded what it was authorised to do",
      },
      {
        id: "c.transferable",
        kind: "condition",
        asks: "Are the resources transferable to the canonical account?",
        branches: [
          {
            label: "Transferable",
            when: "policy and the resource itself allow it to move",
            to: "a.transfer",
          },
          {
            label: "Not transferable",
            when: "a contract, a licence or the resource's own nature keeps it where it is",
            to: "a.reference",
          },
        ],
      },
      {
        id: "a.transfer",
        kind: "action",
        does: "Transfer the resources according to policy, keeping their history with them",
        writes: [{ field: "consolidation_log", mode: "append" }],
        next: "c.obligations",
      },
      {
        id: "a.reference",
        kind: "action",
        does: "Retain the resource under its original relationship, referenced from the canonical account rather than moved into it. A reference keeps it reachable without pretending it changed hands",
        writes: [{ field: "consolidation_log", mode: "append" }],
        next: "c.obligations",
      },
      {
        id: "c.obligations",
        kind: "condition",
        asks: "Do the accounts carry conflicting obligations?",
        branches: [
          {
            label: "Conflicting",
            when: "two accounts hold obligations that cannot both stand in one structure",
            to: "h.reconcile",
          },
          {
            label: "Compatible",
            when: "the obligations coexist in the consolidated structure",
            to: "a.recalculate",
          },
        ],
      },
      {
        id: "h.reconcile",
        kind: "handoff",
        to: "external:commitment-reconciliation",
        on: "obligations that cannot both survive the consolidated structure",
        carries: [
          "each obligation, its source account and what makes them incompatible",
          "the explicit fact that nothing has been cancelled by the consolidation",
        ],
      },
      {
        id: "a.recalculate",
        kind: "action",
        does: "Recalculate account-level roles, access, entitlements, routing and aggregate states from what the consolidated account actually holds. Permissions are recalculated rather than unioned - a union grants everyone the highest access anyone previously had, which turns a structural tidy-up into privilege escalation",
        writes: [{ field: "consolidation_log", mode: "append" }],
        next: "a.verify",
      },
      {
        id: "a.verify",
        kind: "action",
        does: "Verify that no entitlement was duplicated, no obligation lost, no access became broader than any source account granted, and no resource left orphaned",
        writes: [{ field: "consolidation_log", mode: "append" }],
        next: "c.verified",
      },
      {
        id: "c.verified",
        kind: "condition",
        asks: "Did verification pass?",
        branches: [
          { label: "Passed", when: "every check holds", to: "x.consolidated" },
          {
            label: "Failed",
            when: "a duplicated entitlement, a lost obligation, widened access or an orphaned resource was found",
            to: "h.escalate",
          },
        ],
      },
      {
        id: "x.consolidated",
        kind: "exit",
        state: "accounts consolidated; identities untouched",
        terminal: false,
        reEntry: "a further consolidation is assessed against the canonical structure this produced",
      },
      {
        id: "h.escalate",
        kind: "handoff",
        to: "OWN-55",
        on: "a consolidation whose verification failed",
        carries: [
          "which check failed and on what",
          "the consolidated structure as it currently stands, which is not the intended end state",
        ],
      },
    ],
    guardrails: [
      "Account consolidation is not person identity merge.",
      "Members of consolidated accounts do not become the same identity.",
      "Account-level permissions are recalculated rather than unioned.",
      "A resource that cannot transfer is referenced rather than moved.",
    ],
    reusableRule:
      "Account consolidation unifies business structure while preserving independent identities and reconciling account-level obligations explicitly.",
  },

  /* ------------------------------------------------------------ TRM-104 */
  {
    id: "TRM-104",
    slug: "primary-relationship-transfer",
    category: "terminal",
    goal: "ownership-transfer",
    channels: [],
    name: "Primary relationship transfer → validate new primary → transfer dependencies",
    purpose:
      "Move a dependent entity to a new primary, carrying only what the primary relationship actually governs.",
    entity: {
      scope: "the dependent entity, its outgoing primary and its incoming one",
      note: "The dependent's own permissions and consent are not part of the transfer. They belong to the dependent and stay with it.",
    },
    distinctFrom: [
      {
        journey: "TRM-101",
        because:
          "Changing which primary a dependent hangs from moves a relationship. It consolidates nothing and neither party's identity changes.",
      },
    ],
    entry: "t.transfer",
    nodes: [
      {
        id: "t.transfer",
        kind: "trigger",
        event: "primary_relationship_transfer_authorized",
        evidence: {
          requires: [
            "an authorized transfer naming the dependent entity, the outgoing primary and the incoming one",
          ],
          source: "authoritative",
        },
        next: "c.valid",
      },
      {
        id: "c.valid",
        kind: "condition",
        asks: "Is the proposed new primary relationship valid?",
        branches: [
          {
            label: "Valid",
            when: "the incoming primary can hold this relationship and is entitled to",
            to: "a.identify",
          },
          {
            label: "Not valid",
            when: "the incoming primary is ineligible, or the relationship is not permitted between these types",
            to: "x.rejected",
          },
        ],
      },
      {
        id: "x.rejected",
        kind: "exit",
        state: "transfer rejected; the existing primary relationship stands",
        terminal: false,
        reEntry:
          "a different incoming primary is validated on its own terms. The dependent is never left between two primaries while the question is open",
      },
      {
        id: "a.identify",
        kind: "action",
        does: "Identify what the primary relationship actually governs: rights, notifications, responsibilities, billing, access, ownership and open obligations. Anything the dependent holds on its own basis is deliberately not on this list",
        writes: [{ field: "primary_transfer_log", mode: "append" }],
        next: "a.transfer",
      },
      {
        id: "a.transfer",
        kind: "action",
        does: "Transfer only the dependencies the primary relationship governs, preserving the historical primary relationship and the period it covered. Existing obligations move with their deadlines unchanged rather than disappearing in the handover",
        writes: [{ field: "primary_transfer_log", mode: "append" }],
        next: "c.independent",
      },
      {
        id: "c.independent",
        kind: "condition",
        asks: "Does the dependent hold permission or consent on its own basis?",
        branches: [
          {
            label: "It does",
            when: "the dependent gave or withheld something itself, rather than inheriting it",
            to: "a.preserve",
          },
          {
            label: "It does not",
            when: "everything it held came through the primary relationship",
            to: "a.verify",
          },
        ],
      },
      {
        id: "a.preserve",
        kind: "action",
        does: "Preserve it independently. It does not transfer, and the incoming primary's state is not inherited over it - a dependent who opted out does not become opted in because their primary is",
        writes: [{ field: "primary_transfer_log", mode: "append" }],
        next: "a.verify",
      },
      {
        id: "a.verify",
        kind: "action",
        does: "Verify the dependent now holds exactly one valid required primary relationship - not zero, and not two",
        writes: [{ field: "primary_transfer_log", mode: "append" }],
        next: "c.verified",
      },
      {
        id: "c.verified",
        kind: "condition",
        asks: "Did verification pass?",
        branches: [
          { label: "Exactly one valid primary", when: "the transfer landed cleanly", to: "x.transferred" },
          {
            label: "None, or more than one",
            when: "the dependent is left without a required primary, or holding two",
            to: "h.orphan",
          },
        ],
      },
      {
        id: "x.transferred",
        kind: "exit",
        state: "primary relationship transferred; independent state preserved",
        terminal: false,
        reEntry: "a further transfer is validated against the current primary",
      },
      {
        id: "h.orphan",
        kind: "handoff",
        to: "REL-100",
        on: "a dependent left without exactly one valid required primary",
        carries: [
          "the dependent, what was transferred and what it now lacks",
          "its inherited obligations and their unchanged deadlines",
        ],
      },
    ],
    guardrails: [
      "A primary relationship transfer is not an identity merge.",
      "The historical primary relationship and its period are preserved.",
      "Existing obligations do not disappear during a transfer, and their deadlines do not reset.",
      "The dependent's own permission and consent are never overwritten by the incoming primary's.",
    ],
    reusableRule:
      "Changing a primary relationship transfers only the dependencies governed by that relationship, not every state associated with either party.",
  },

  /* ------------------------------------------------------------ TRM-105 */
  {
    id: "TRM-105",
    slug: "responsibility-handover",
    category: "terminal",
    goal: "ownership-transfer",
    channels: [],
    name: "Role or responsibility handover → effective-time transfer → continue",
    purpose:
      "Move a role between two people at a defined moment, without changing anything before it or rewriting anything behind it.",
    entity: {
      scope: "the role or responsibility, its outgoing holder and its incoming one",
      note: "A handover has an effective time, and that time is load-bearing. Authorising it today does not move authority today.",
    },
    distinctFrom: [
      {
        journey: "OWN-54",
        because:
          "OWN-54 moves ownership of one work item now. This moves a role and everything it carries at a future effective point, which is why both actors are revalidated when that point arrives rather than when it was scheduled.",
      },
      {
        journey: "REL-94",
        because:
          "REL-94 changes one person's role. This moves a role from one person to another, which means two actors to validate and a set of open work that has to travel intact.",
      },
    ],
    entry: "t.handover",
    nodes: [
      {
        id: "t.handover",
        kind: "trigger",
        event: "responsibility_handover_authorized",
        evidence: {
          requires: [
            "an authorized handover naming the outgoing actor, the incoming actor, the scope and the effective time",
          ],
          source: "authoritative",
        },
        next: "a.define",
      },
      {
        id: "a.define",
        kind: "action",
        does: "Define the outgoing actor, the incoming actor, the scope, the effective time and the reason. A handover scheduled for a future date is not an authority change now - until the effective time the outgoing actor still holds the role and everything in it",
        writes: [{ field: "handover_log", mode: "append" }],
        next: "a.inventory",
      },
      {
        id: "a.inventory",
        kind: "action",
        does: "Inventory what travels with the role: open work, deadlines, approvals, scheduled actions, commitments and the context needed to continue any of them",
        writes: [{ field: "handover_log", mode: "append" }],
        next: "c.eligible",
      },
      {
        id: "c.eligible",
        kind: "condition",
        asks: "Is the incoming actor eligible and authorized for this role?",
        branches: [
          {
            label: "Eligible",
            when: "they hold the authority the role requires and nothing disqualifies them",
            to: "a.prepare",
          },
          {
            label: "Not eligible",
            when: "they cannot hold the role, or their authority does not cover its scope",
            to: "h.hold",
          },
        ],
      },
      {
        id: "h.hold",
        kind: "handoff",
        to: "OWN-55",
        on: "a handover into an actor who cannot hold the role",
        carries: [
          "the role, both actors and what makes the incoming one ineligible",
          "the open work still with the outgoing actor, which has not moved",
        ],
      },
      {
        id: "a.prepare",
        kind: "action",
        does: "Prepare the transfer without activating it. Nothing about the outgoing actor's authority changes yet, and nothing about the incoming actor's does either",
        writes: [{ field: "handover_log", mode: "append" }],
        next: "w.effective",
      },
      {
        id: "w.effective",
        kind: "wait",
        until: ["the handover is cancelled", "the handover is superseded by another"],
        onEvent: "x.cancelled",
        timeout: {
          after: "the effective time",
          reason:
            "reaching the effective moment is the ordinary path; the wait watches for the handover being withdrawn before it gets there",
        },
        onTimeout: "a.revalidate",
        windowExtendsOnEngagement: false,
      },
      {
        id: "x.cancelled",
        kind: "exit",
        state: "handover cancelled or superseded before its effective time",
        terminal: false,
        reEntry:
          "the outgoing actor retained the role throughout, so nothing has to be undone - which is the point of not moving authority at the moment of authorisation",
      },
      {
        id: "a.revalidate",
        kind: "action",
        does: "At the effective time, revalidate both actors and the target entity. Weeks can pass between authorising a handover and it taking effect, and either actor may have left, changed role or lost the authority the handover assumed",
        writes: [{ field: "handover_log", mode: "append" }],
        next: "c.still-valid",
      },
      {
        id: "c.still-valid",
        kind: "condition",
        asks: "Are both actors and the target still valid at the effective time?",
        branches: [
          { label: "Still valid", when: "nothing that the handover assumed has changed", to: "a.activate" },
          {
            label: "Something moved",
            when: "an actor has left, lost authority, or the target no longer exists as scoped",
            to: "h.escalate",
          },
        ],
      },
      {
        id: "h.escalate",
        kind: "handoff",
        to: "OWN-55",
        on: "a handover whose assumptions did not survive to its effective time",
        carries: [
          "what changed between authorisation and the effective moment",
          "the open work, which is still with the outgoing actor and still running against its original deadlines",
        ],
      },
      {
        id: "a.activate",
        kind: "action",
        does: "Activate the new responsibility from the effective time, with the inherited deadlines and obligations exactly as they stood. The handover changes who is answerable, never what is owed or by when",
        writes: [{ field: "handover_log", mode: "append" }],
        next: "a.invalidate",
      },
      {
        id: "a.invalidate",
        kind: "action",
        does: "Invalidate the outgoing actor's future scheduled actions where their authority has now ended. Decisions they made while holding the role remain historical facts and are not touched - what changes is what they may do next",
        writes: [{ field: "suppressed_sends", mode: "append" }],
        next: "x.handed-over",
      },
      {
        id: "x.handed-over",
        kind: "exit",
        state: "responsibility handed over at its effective time",
        terminal: false,
        reEntry: "a further handover is scheduled and validated on its own terms",
      },
    ],
    guardrails: [
      "A future handover is not an immediate authority change.",
      "Historical decisions by the outgoing actor remain historical facts.",
      "Inherited deadlines do not reset at the handover.",
      "Both actors are revalidated at the effective time, not at the time of authorisation.",
    ],
    reusableRule:
      "Responsibility handover changes future authority at a defined effective point while preserving the history and obligations of the role.",
  },

  /* ------------------------------------------------------------ TRM-106 */
  {
    id: "TRM-106",
    slug: "account-closure-request",
    category: "terminal",
    goal: "cancellation-termination",
    channels: ["email", "in-app"],
    name: "Account closure request → validate → resolve blockers → close",
    purpose:
      "End an account relationship once the obligations that legitimately block it are resolved, and end nothing else.",
    entity: {
      scope: "the account and this closure request",
      note: "Closing the account ends the account relationship. It cancels no subscription and deletes no data, and neither of those happens as a side effect of it.",
    },
    distinctFrom: [
      {
        journey: "RET-29",
        because:
          "RET-29 completes a subscription cancellation - a commercial relationship ending. An account can be closed with subscriptions running, and a subscription can be cancelled with the account intact.",
      },
    ],
    entry: "t.requested",
    nodes: [
      {
        id: "t.requested",
        kind: "trigger",
        event: "account_closure_requested",
        evidence: {
          requires: ["a closure request against an identified account"],
          insufficientAlone: [
            "a cancelled subscription, which ends a commercial relationship rather than the account",
            "a data deletion request, which is a different lifecycle with a different authority",
            "a long period of inactivity",
          ],
          source: "authoritative",
        },
        next: "a.state",
      },
      {
        id: "a.state",
        kind: "action",
        does: "Record CLOSURE_REQUESTED, and determine who requested it, whether they hold the authority to, the account's current state, its open blockers and its dependent relationships",
        writes: [{ field: "closure_log", mode: "append" }],
        next: "c.authority",
      },
      {
        id: "c.authority",
        kind: "condition",
        asks: "Does the requester hold authority to close this account?",
        branches: [
          {
            label: "Authorised",
            when: "they own the account or hold the role that may close it",
            to: "c.blockers",
          },
          {
            label: "Not authorised",
            when: "the request comes from someone who cannot make it",
            to: "x.unauthorized",
          },
        ],
      },
      {
        id: "x.unauthorized",
        kind: "exit",
        state: "closure not requested by an authorised party; account unchanged",
        terminal: false,
        reEntry: "a request from an authorised party is assessed on its own terms",
      },
      {
        id: "c.blockers",
        kind: "condition",
        asks: "Is closure permitted now?",
        branches: [
          {
            label: "Permitted",
            when: "no blocker stands in the way",
            to: "a.execute",
          },
          {
            label: "Blocked, recoverable",
            when: "an active financial obligation, an open transaction, a required return, a security review, a dependent entity or an administrative process stands in the way and can be resolved",
            to: "a.surface",
          },
          {
            label: "Blocked, not recoverable",
            when: "something prevents closure that the account holder cannot resolve",
            to: "x.cannot-close",
          },
        ],
      },
      {
        id: "a.surface",
        kind: "action",
        does: "Surface the exact blocker. Telling someone they cannot close their account without saying why produces a support case rather than a closure, and it reads as an obstacle rather than a requirement",
        writes: [{ field: "closure_log", mode: "append" }],
        next: "w.blockers",
        execution: "communication",
      },
      {
        id: "w.blockers",
        kind: "wait",
        until: ["the surfaced blocker is resolved"],
        onEvent: "c.recheck",
        timeout: {
          after: "the closure request's validity window",
          reason:
            "a closure request held open indefinitely against an unresolved blocker is neither a closure nor a refusal, and the account holder cannot tell which they have",
        },
        onTimeout: "x.lapsed",
        windowExtendsOnEngagement: false,
      },
      {
        id: "c.recheck",
        kind: "condition",
        asks: "With that blocker resolved, is anything else in the way?",
        branches: [
          { label: "All clear", when: "no blocker remains", to: "a.execute" },
          {
            label: "Further blockers",
            when: "resolving one revealed or left others",
            to: "x.still-blocked",
          },
        ],
      },
      {
        id: "x.still-blocked",
        kind: "exit",
        state: "one blocker cleared, others remain and are surfaced",
        terminal: false,
        reEntry:
          "each remaining blocker is named and resolved on its own, and closure is requested again - stacking them into one message tells the account holder nothing they can act on",
      },
      {
        id: "x.lapsed",
        kind: "exit",
        state: "closure request lapsed with blockers outstanding",
        terminal: false,
        reEntry: "a fresh request re-enters against whatever blockers still stand",
      },
      {
        id: "x.cannot-close",
        kind: "exit",
        state: "closure not permitted",
        terminal: false,
        reEntry:
          "the preventing condition changing re-opens this. The account stays open and the reason is on record rather than left as an unexplained refusal",
      },
      {
        id: "a.execute",
        kind: "action",
        does: "Execute the account closure. This ends the account relationship and does nothing else - it cancels no subscription unless a contract explicitly couples them, and it deletes no data. The audit and history are untouched",
        writes: [{ field: "closure_log", mode: "append" }],
        next: "a.verify",
      },
      {
        id: "a.verify",
        kind: "action",
        does: "Verify the account is no longer active for the operations closure prohibits",
        writes: [{ field: "closure_log", mode: "append" }],
        next: "c.verified",
      },
      {
        id: "c.verified",
        kind: "condition",
        asks: "Did the closure take effect?",
        branches: [
          { label: "Closed", when: "the account no longer permits prohibited operations", to: "h.dependencies" },
          { label: "Not fully applied", when: "the account remains active somewhere", to: "h.escalate" },
        ],
      },
      {
        id: "h.dependencies",
        kind: "handoff",
        to: "TRM-107",
        on: "a closure that has taken effect on the account itself",
        carries: [
          "the closed account and the dependent relationships identified at request time",
          "the explicit fact that no external or commercial dependency has been terminated by this",
        ],
      },
      {
        id: "h.escalate",
        kind: "handoff",
        to: "OWN-55",
        on: "a closure that did not fully apply",
        carries: ["where the account remains active", "the closure request and its authority"],
      },
    ],
    guardrails: [
      "Account closure is not data deletion.",
      "Account closure is not subscription cancellation unless a contract explicitly couples them.",
      "Closure does not silently erase audit or history.",
      "A blocker is named specifically. An unexplained refusal is not a blocker, it is a support case.",
    ],
    reusableRule:
      "Account closure ends an account relationship only after obligations that legitimately block closure have been resolved.",
  },

  /* ------------------------------------------------------------ TRM-107 */
  {
    id: "TRM-107",
    slug: "closure-external-dependencies",
    category: "terminal",
    goal: "cancellation-termination",
    channels: [],
    name: "Account closure → reconcile external and commercial dependencies → finalize",
    purpose:
      "Make sure nothing that lives outside the account is assumed to have ended because the account did.",
    entity: {
      scope: "the closing account plus each external or commercial dependency, individually",
      note: "Each dependency is its own relationship with its own end state. None of them ends because our account record changed.",
    },
    entry: "t.closing",
    nodes: [
      {
        id: "t.closing",
        kind: "trigger",
        event: "account_closure_executing_or_finalizing",
        evidence: {
          requires: ["an account closure that has taken effect on the account itself"],
          source: "authoritative",
        },
        next: "a.inventory",
      },
      {
        id: "a.inventory",
        kind: "action",
        does: "Inventory the external and dependent state: subscriptions, external billing agreements, third-party services, active entitlements, pending invoices, external reservations and linked contracts. Each is a relationship in its own right, and closing an application account has never cancelled a subscription billed by someone else",
        writes: [{ field: "closure_log", mode: "append" }],
        next: "c.coupled",
      },
      {
        id: "c.coupled",
        kind: "condition",
        asks: "Does an authoritative contract or system state that this dependency terminates with the account?",
        branches: [
          {
            label: "Explicitly coupled",
            when: "a contract or the provider's own system says closing the account ends it",
            to: "a.verify-termination",
          },
          {
            label: "Independent",
            when: "nothing authoritative couples them - the ordinary case",
            to: "a.separate",
          },
        ],
      },
      {
        id: "a.verify-termination",
        kind: "action",
        does: "Verify the termination actually happened rather than assuming it. A provider reporting success is a statement about their API, and a coupling written into a contract is not the same as a coupling implemented in a system",
        writes: [{ field: "closure_log", mode: "append" }],
        next: "w.outcomes",
      },
      {
        id: "a.separate",
        kind: "action",
        does: "Record that this dependency requires its own termination and raise it as such. It does not end because our account did, and the person is told which relationships they still hold",
        writes: [{ field: "closure_log", mode: "append" }],
        next: "w.outcomes",
      },
      {
        id: "w.outcomes",
        kind: "wait",
        until: ["the required dependency outcomes are recorded"],
        onEvent: "c.all",
        timeout: {
          after: "the closure policy's window for dependency resolution",
          reason:
            "a dependency left unresolved is someone continuing to be charged or committed after they believed they had finished, and it does not become resolved by the account looking closed",
        },
        onTimeout: "c.policy",
        windowExtendsOnEngagement: false,
      },
      {
        id: "c.all",
        kind: "condition",
        asks: "Did every required dependency reach its terminal state?",
        branches: [
          { label: "All resolved", when: "each dependency reached a recorded end state", to: "a.record-final" },
          {
            label: "Some did not",
            when: "at least one dependency failed to terminate",
            to: "a.record-unresolved",
          },
        ],
      },
      {
        id: "a.record-final",
        kind: "action",
        does: "Record each dependency's final state independently of the account's. They are separate relationships and their endings are separate facts, recorded as such",
        writes: [{ field: "closure_log", mode: "append" }],
        next: "x.finalized",
      },
      {
        id: "a.record-unresolved",
        kind: "action",
        does: "Record which dependencies did not terminate, visibly and by name. A failure to end one dependency is never hidden behind an account marked CLOSED - that is exactly how someone keeps being charged by a provider they believe they have left",
        writes: [{ field: "closure_log", mode: "append" }],
        next: "h.escalate",
      },
      {
        id: "c.policy",
        kind: "condition",
        asks: "Does the closure policy permit the account to close while this dependency remains?",
        branches: [
          {
            label: "Permitted",
            when: "policy allows the account to close with the dependency tracked separately",
            to: "a.record-remaining",
          },
          {
            label: "Not permitted",
            when: "the dependency must resolve before closure finalises",
            to: "h.escalate",
          },
        ],
      },
      {
        id: "a.record-remaining",
        kind: "action",
        does: "Record the remaining dependency independently, with its own state and its own owner, so it stays visible and attributable after the account is gone",
        writes: [{ field: "closure_log", mode: "append" }],
        next: "x.finalized",
      },
      {
        id: "h.escalate",
        kind: "handoff",
        to: "OWN-55",
        on: "a dependency that did not terminate and cannot be left outstanding",
        carries: [
          "which dependency, with which provider, and what was attempted",
          "the fact that the account holder may still be committed or billed, which is what makes this urgent",
        ],
      },
      {
        id: "x.finalized",
        kind: "exit",
        state: "dependencies reconciled and recorded independently of the account",
        terminal: false,
        reEntry: "a dependency discovered later is reconciled on its own, against the closed account's record",
      },
    ],
    guardrails: [
      "Closing an application account is never assumed to cancel an externally billed subscription.",
      "An external provider's reported success is verified rather than trusted.",
      "A failure to terminate one dependency is not hidden behind an account marked CLOSED.",
      "Each dependency's final state is recorded independently of the account's.",
    ],
    reusableRule:
      "Account closure and commercial termination are independent state transitions unless an authoritative dependency explicitly couples them.",
  },

  /* ------------------------------------------------------------ TRM-108 */
  {
    id: "TRM-108",
    slug: "closure-wind-down",
    category: "terminal",
    goal: "cancellation-termination",
    channels: [],
    name: "Closure completed → wind-down → former or terminal account state",
    purpose:
      "Stop normal account activity while letting the obligations that outlive closure actually finish.",
    entity: {
      scope: "the closed account and the obligations still outstanding against it",
      note: "The wind-down capability is enumerated rather than left as a general exception, so a closed account cannot quietly keep behaving like an open one.",
    },
    entry: "t.closed",
    nodes: [
      {
        id: "t.closed",
        kind: "trigger",
        event: "account_closure_succeeded",
        evidence: {
          requires: ["a closure that has been executed and verified"],
          source: "authoritative",
        },
        next: "a.suppress",
      },
      {
        id: "a.suppress",
        kind: "action",
        does: "Suppress new acquisition, normal usage, engagement journeys that are now obsolete, and every account action incompatible with closure - including anything already queued. A closed account receiving an onboarding email is the clearest possible evidence that the closure did not reach everything",
        writes: [{ field: "suppressed_sends", mode: "append" }],
        next: "a.guard",
      },
      {
        id: "a.guard",
        kind: "action",
        does: "Guard against reactivation. A stale login, a queued onboarding step or a delayed synchronisation must not bring a closed account back - closure is a state that later events are checked against, never one they can silently overwrite",
        writes: [{ field: "closure_log", mode: "append" }],
        next: "c.remaining",
      },
      {
        id: "c.remaining",
        kind: "condition",
        asks: "Do obligations remain outstanding against this account?",
        branches: [
          {
            label: "Obligations remain",
            when: "a final invoice, a refund, a data export, a return, an open support case, a regulatory retention or an external dependency is still outstanding",
            to: "a.scope",
          },
          {
            label: "Nothing outstanding",
            when: "the account owes nothing and is owed nothing",
            to: "x.former",
          },
        ],
      },
      {
        id: "a.scope",
        kind: "action",
        does: "Allow only the scoped processes those obligations need, enumerated individually. A wind-down left as a general exception is an open account with a different label on it",
        writes: [{ field: "closure_log", mode: "append" }],
        next: "w.winddown",
      },
      {
        id: "w.winddown",
        kind: "wait",
        until: ["all outstanding operational obligations complete"],
        onEvent: "x.former",
        timeout: {
          after: "the wind-down horizon",
          reason:
            "an account held open in wind-down indefinitely is neither closed nor operating, and nobody is left watching which obligation is holding it there",
        },
        onTimeout: "h.escalate",
        windowExtendsOnEngagement: false,
      },
      {
        id: "h.escalate",
        kind: "handoff",
        to: "OWN-55",
        on: "a wind-down outliving its horizon",
        carries: [
          "which obligations are still outstanding and how long they have been",
          "the account's state, which is closed but not finished",
        ],
      },
      {
        id: "x.former",
        kind: "exit",
        state: "FORMER; the relationship is over and the historical record is intact",
        terminal: false,
        reEntry:
          "a returning customer opens a new relationship rather than reviving this one. A terminal relationship state does not mean the records never existed - deleting them is a separate lifecycle with its own request, its own scope and its own authority",
      },
    ],
    guardrails: [
      "A closed account does not reactivate through a stale login or a queued onboarding event.",
      "The wind-down capability is explicitly scoped and enumerated.",
      "A terminal relationship state does not mean the historical record is deleted.",
    ],
    reusableRule:
      "Closure ends normal account activity while allowing explicitly required wind-down obligations to finish.",
  },

  /* ------------------------------------------------------------ TRM-109 */
  {
    id: "TRM-109",
    slug: "data-deletion-request",
    category: "terminal",
    goal: "data-integrity",
    channels: [],
    name: "Data deletion request → validate scope → hold, delete or retain required data",
    purpose:
      "Decide what a deletion request actually covers, and keep only what an authoritative retention obligation genuinely requires.",
    entity: {
      scope: "the data subject, this deletion request, and the data scope it names",
      note: "The request is bounded by what it asks for and by what governing policy covers. It is not a licence to delete everything we hold, nor a reason to keep everything we would rather not lose.",
    },
    distinctFrom: [
      {
        journey: "TRM-106",
        because:
          "Closing an account ends a relationship and requests nothing about data. A deletion request concerns data and says nothing about whether the relationship continues. Either can happen without the other.",
      },
    ],
    entry: "t.request",
    nodes: [
      {
        id: "t.request",
        kind: "trigger",
        event: "data_deletion_requested",
        evidence: {
          requires: ["a deletion request naming a data subject and a scope"],
          insufficientAlone: [
            "an account closure, which ends a relationship and requests nothing about data",
            "a subscription cancellation",
            "an unsubscribe, which withdraws permission to contact rather than requesting removal",
          ],
          source: "authoritative",
        },
        next: "c.authority",
      },
      {
        id: "c.authority",
        kind: "condition",
        asks: "Is the requester's identity and authority established for this scope?",
        branches: [
          {
            label: "Established",
            when: "the requester is verified as the data subject or as authorised to act for them",
            to: "a.scope",
          },
          {
            label: "Not established",
            when: "identity or authority has not been verified to the level this request requires",
            to: "h.verify",
          },
        ],
      },
      {
        id: "h.verify",
        kind: "handoff",
        to: "IDN-82",
        on: "a deletion request whose requester is not yet verified",
        carries: [
          "the request and the verification it is blocked on",
          "the request's own deadline, which the verification does not reset",
        ],
      },
      {
        id: "a.scope",
        kind: "action",
        does: "Validate the scope, the jurisdiction and policy context, and which systems and data classes are actually in scope. A deletion request is bounded by what it asks for and by what the governing policy covers - not by everything we happen to hold about the person",
        writes: [{ field: "deletion_request_log", mode: "append" }],
        next: "a.inventory",
      },
      {
        id: "a.inventory",
        kind: "action",
        does: "Inventory the data in scope and classify each item as DELETABLE, RETAIN_REQUIRED, DEPENDENCY_BLOCKED, ALREADY_DELETED or MANUAL_REVIEW",
        writes: [{ field: "deletion_request_log", mode: "append" }],
        next: "c.retention",
      },
      {
        id: "c.retention",
        kind: "condition",
        asks: "Does an authoritative retention obligation cover any of it?",
        branches: [
          {
            label: "Retention required",
            when: "a legal or business obligation names data that must be kept",
            to: "a.retain",
          },
          {
            label: "Nothing retained",
            when: "no obligation covers anything in scope",
            to: "c.deletable",
          },
        ],
      },
      {
        id: "a.retain",
        kind: "action",
        does: "Retain only what an authoritative obligation actually requires, recording which obligation and why. No retention rule is invented - where policy is silent the data is not kept on a guess, because retaining on a guess keeps what should have gone just as surely as deleting on one destroys what had to stay",
        writes: [{ field: "deletion_request_log", mode: "append" }],
        next: "c.deletable",
      },
      {
        id: "c.deletable",
        kind: "condition",
        asks: "What remains, and can it be deleted?",
        branches: [
          {
            label: "Deletable and clear",
            when: "data remains in scope, is eligible, and no dependency blocks it",
            to: "h.execute",
          },
          {
            label: "Blocked by a dependency",
            when: "something in scope cannot be removed until a dependency clears",
            to: "w.dependency",
          },
          {
            label: "Needs manual review",
            when: "the classification could not be settled automatically",
            to: "h.review",
          },
          {
            label: "Nothing left",
            when: "everything in scope is already absent or retained under an obligation",
            to: "x.nothing",
          },
        ],
      },
      {
        id: "w.dependency",
        kind: "wait",
        until: ["the blocking dependency clears"],
        onEvent: "h.execute",
        timeout: {
          after: "the request's SLA",
          reason:
            "a deletion request usually carries a legal deadline, and a dependency that has not cleared inside it needs a person rather than more waiting",
        },
        onTimeout: "h.review",
        windowExtendsOnEngagement: false,
      },
      {
        id: "h.execute",
        kind: "handoff",
        to: "TRM-110",
        on: "data approved for deletion or anonymization",
        carries: [
          "the exact scope approved, per system and data class",
          "what is being retained and under which obligation, so execution does not remove it",
        ],
      },
      {
        id: "h.review",
        kind: "handoff",
        to: "DEC-181",
        on: "a classification or dependency the automated path could not settle",
        carries: [
          "the request, its deadline and what specifically is unresolved",
          "the retention obligations already identified",
        ],
      },
      {
        id: "x.nothing",
        kind: "exit",
        state: "nothing in scope to delete; retained items recorded with their obligations",
        terminal: false,
        reEntry:
          "this is recorded as what it is rather than reported as a deletion. Data arriving later within the same scope is assessed against this request where the policy allows",
      },
    ],
    guardrails: [
      "Account closure is not a deletion request.",
      "A deletion request is not immediate physical deletion of every record.",
      "No retention rule is invented. Where the governing policy is silent, data is not retained on a guess.",
      "Audit evidence may need retaining without retaining the operational data alongside it.",
    ],
    reusableRule:
      "Data deletion removes data according to defined scope while preserving only information that an authoritative retention obligation requires.",
  },

  /* ------------------------------------------------------------ TRM-110 */
  {
    id: "TRM-110",
    slug: "data-deletion-execution",
    category: "terminal",
    goal: "data-integrity",
    channels: [],
    name: "Data deletion execution → propagate → verify or reconcile failure",
    purpose:
      "Carry a deletion through every system it has to reach, and keep any part that did not arrive visible.",
    entity: {
      scope: "the deletion job and each affected system's operation individually",
      note: "Each system's operation has its own type and its own terminal state. A single overall status hides the one that failed, which is the only one that matters.",
    },
    entry: "t.approved",
    nodes: [
      {
        id: "t.approved",
        kind: "trigger",
        event: "data_approved_for_deletion",
        evidence: {
          requires: ["an approved deletion scope, per system and data class, from a validated request"],
          source: "authoritative",
        },
        next: "a.operations",
      },
      {
        id: "a.operations",
        kind: "action",
        does: "Generate the scoped operation for each affected system - delete, anonymize, detach, restrict or place under retention hold - according to what the governing requirement for that system actually is. One operation type applied everywhere either destroys what had to be kept or keeps what had to go",
        writes: [{ field: "deletion_job_log", mode: "append" }],
        next: "a.execute",
      },
      {
        id: "a.execute",
        kind: "action",
        does: "Execute idempotently, keyed so a redelivered job does not repeat an operation, and so that nothing propagates back through downstream synchronisation to recreate what was just removed. A sync job running on its own schedule will otherwise restore a profile deleted an hour earlier, undoing the work while reporting success",
        writes: [{ field: "deletion_job_log", mode: "append" }],
        next: "w.confirmations",
      },
      {
        id: "w.confirmations",
        kind: "wait",
        until: ["all system confirmations arrive", "a system reports failure"],
        onEvent: "c.result",
        timeout: {
          after: "the deletion SLA",
          reason:
            "silence from a system is not confirmation, and a deletion whose SLA passes with systems unheard from is a partial failure that has not reported itself",
        },
        onTimeout: "a.partial",
        windowExtendsOnEngagement: false,
      },
      {
        id: "c.result",
        kind: "condition",
        asks: "How did the operations end?",
        branches: [
          {
            label: "All confirmed",
            when: "every required system reported its operation complete",
            to: "c.new-copy",
          },
          {
            label: "Some failed",
            when: "at least one system reported failure or did not confirm",
            to: "a.partial",
          },
        ],
      },
      {
        id: "c.new-copy",
        kind: "condition",
        asks: "Was a further copy of the data discovered while the request was running?",
        branches: [
          {
            label: "In scope",
            when: "a copy was found that the approved scope covers",
            to: "a.additional",
          },
          {
            label: "Out of scope",
            when: "a copy was found that the approved scope does not cover",
            to: "a.out-of-scope",
          },
          {
            label: "Nothing further",
            when: "no new copy surfaced",
            to: "a.verify",
          },
        ],
      },
      {
        id: "a.additional",
        kind: "action",
        does: "Generate and execute the operation for the newly discovered copy, within the same job and the same scope",
        writes: [{ field: "deletion_job_log", mode: "append" }],
        next: "w.confirmations",
      },
      {
        id: "a.out-of-scope",
        kind: "action",
        does: "Record the discovered copy as out of scope, naming why. It is not deleted on this request and it is not left unrecorded either - an unrecorded copy is one nobody knows to assess against the next request",
        writes: [{ field: "deletion_job_log", mode: "append" }],
        next: "a.verify",
      },
      {
        id: "a.verify",
        kind: "action",
        does: "Verify that no required target remains unintentionally active or searchable, to whatever guarantee each system actually offers. The deletion audit records what was removed and when, without keeping a copy of the personal data it removed - an audit that preserves the record has recreated the thing the deletion was for",
        writes: [{ field: "deletion_job_log", mode: "append" }],
        next: "c.verified",
      },
      {
        id: "c.verified",
        kind: "condition",
        asks: "Did verification confirm every required terminal state?",
        branches: [
          { label: "Verified", when: "every in-scope target reached its required state", to: "x.complete" },
          {
            label: "Something remains",
            when: "a target is still present where it should not be",
            to: "a.partial",
          },
        ],
      },
      {
        id: "x.complete",
        kind: "exit",
        state: "VERIFIED_COMPLETE; every in-scope obligation reached its terminal state",
        terminal: false,
        reEntry:
          "a later request covering different scope is its own job. Deletion succeeding in the primary store was never the same as deletion everywhere, and this state records that everywhere was checked",
      },
      {
        id: "a.partial",
        kind: "action",
        does: "Record PARTIAL_DELETION_FAILURE, naming which systems did not reach their required terminal state. This is never represented as complete - a deletion reported as done while a downstream copy survives is the most consequential false report in this library, because it ends the investigation that would have found the copy",
        writes: [{ field: "deletion_job_log", mode: "append" }],
        next: "c.retry",
      },
      {
        id: "c.retry",
        kind: "condition",
        asks: "Is a retry available within the policy budget?",
        branches: [
          {
            label: "Retry",
            when: "the failure is transient and the budget fixed at the first failure has room",
            to: "a.retry",
          },
          {
            label: "Escalate",
            when: "the failure is not clearing, or the budget is spent",
            to: "h.escalate",
          },
        ],
      },
      {
        id: "a.retry",
        kind: "action",
        does: "Retry the outstanding operations only, idempotently, so a partially completed deletion is completed rather than restarted",
        writes: [{ field: "deletion_job_log", mode: "append" }],
        next: "w.confirmations",
      },
      {
        id: "h.escalate",
        kind: "handoff",
        to: "OWN-55",
        on: "a deletion that could not reach its required terminal state everywhere",
        carries: [
          "which systems remain outstanding and what was attempted",
          "the request's deadline, which is often a legal one and does not move because a system did not respond",
        ],
        suppresses: ["any representation of this deletion as complete while a target remains"],
      },
    ],
    guardrails: [
      "Deletion succeeding in the primary store is not deletion everywhere.",
      "A failed downstream deletion is never represented as fully complete.",
      "Deletion jobs do not recreate profiles through downstream synchronisation.",
      "The deletion audit does not itself preserve the personal data that was deleted.",
    ],
    reusableRule:
      "Distributed deletion is complete only when all in-scope deletion obligations have reached their required terminal state or an explicit retained exception is recorded.",
  },
];
