import type { CanonicalJourney, OrchestrationRule } from "./types";

/* CATEGORY 8 - ACCESS, ENTITLEMENT, CREDENTIALS & CAPABILITY

   Whether someone can actually use a thing, which turns out to be six
   questions rather than one:

     eligible      the rules would permit them to have it
     entitled      they have been granted the right to it
     provisioned   the resource behind that right actually exists
     available     it can genuinely be reached
     authorized    this actor may take this action on it right now
     credentialed  the artifact they present is itself still valid

   Every pair of adjacent states here fails independently, and each failure
   looks identical from a dashboard that stores one boolean. A customer who
   paid and cannot log in has passed the first two and failed the third. One
   who can log in and gets a permission error has passed five and failed the
   sixth. Support cannot tell those apart unless the states are apart.

   Two asymmetries shape most of the journeys. Granting a right is not the
   same as making it work, so ACC-72 exists entirely to hold the distance
   between them. And losing a right stops future use without erasing what was
   done while it was held, so ACC-74 splits revocation from reconciliation
   rather than treating removal as a single act.

   Three more separations the category refuses to collapse: expired is not
   revoked, suspended is not terminated, and deprovisioning is not deletion.
   The last one is the most expensive to get wrong, because it is the only one
   that cannot be undone. */

export const ACCESS_RULES: readonly OrchestrationRule[] = [
  {
    id: "ACC-R1",
    scope: "access",
    rule: "Eligibility, entitlement, provisioning, authorization, access and credentials are six separate states.",
    because:
      "They are usually stored as one flag because they usually agree. The cases where they disagree are exactly the incidents nobody can diagnose.",
  },
  {
    id: "ACC-R2",
    scope: "access",
    rule: "Granting an entitlement does not prove the resource behind it was provisioned.",
    because:
      "The grant is a business record and the provisioning is a distributed operation, so the first can succeed while the second silently does not - and the customer discovers it before we do.",
  },
  {
    id: "ACC-R3",
    scope: "access",
    rule: "Provisioning success is verified against actual availability wherever the difference matters.",
    because:
      "A provisioning API returning 200 is a statement about the API. Whether the holder can reach the thing is a different question with a different answer.",
  },
  {
    id: "ACC-R4",
    scope: "access",
    rule: "Losing an entitlement stops future use. It does not automatically invalidate commitments created while the right was held.",
    because:
      "The commitment was valid when it was made, and cancelling it because a plan changed takes something away that was already paid for or already promised.",
  },
  {
    id: "ACC-R5",
    scope: "access",
    rule: "Authorization evaluates the actor, the action, the resource and the current state together.",
    because:
      "Any of the four alone produces a decision that is right most of the time, and the times it is wrong are the ones that matter.",
  },
  {
    id: "ACC-R6",
    scope: "access",
    rule: "Authentication and authorization stay separate. Knowing who someone is says nothing about what they may do.",
    because:
      "They are adjacent in every login flow and the conflation is invisible until an authenticated user reaches something they should never have seen.",
  },
  {
    id: "ACC-R7",
    scope: "access",
    rule: "A credential has its own validity lifecycle, independent of the entitlement it represents.",
    because:
      "A valid credential for a lapsed entitlement and a revoked credential for a live one are both real, and treating either as one fact loses the other.",
  },
  {
    id: "ACC-R8",
    scope: "access",
    rule: "Security revocation supersedes queued and in-flight access operations, including refresh and activation.",
    because:
      "A token invalidated at ten o'clock must not still authorise a request that was queued at one minute to, which is precisely the window an attacker is operating in.",
  },
  {
    id: "ACC-R9",
    scope: "access",
    rule: "Suspension and termination are separate states.",
    because:
      "Suspension is designed to be reversible and termination is not. Recording one as the other either destroys a recoverable relationship or leaves a terminated one looking recoverable.",
  },
  {
    id: "ACC-R10",
    scope: "access",
    rule: "Capability restoration is rebuilt from current valid state, never replayed from a historical snapshot.",
    because:
      "A snapshot restores expired credentials, withdrawn permissions and roles that no longer exist, each of which ended for a reason that restoration never addressed.",
  },
  {
    id: "ACC-R11",
    scope: "access",
    rule: "Entitlement changes apply as a scoped delta between the old and new rights.",
    because:
      "Re-applying the whole new scope reprovisions what already worked and revokes what should have survived, and both are visible to the holder as an outage.",
  },
  {
    id: "ACC-R12",
    scope: "access",
    rule: "Deprovisioning checks active dependencies before any destructive action.",
    because:
      "Shared resources do not belong to the entitlement that happened to end, and removing one takes it from everyone else still entitled to it.",
  },
  {
    id: "ACC-R13",
    scope: "access",
    rule: "Deprovisioning and data deletion are separate lifecycle mechanisms with separate authorisation.",
    because:
      "Removing a capability is reversible and removing the record of it is not. A deprovision that deletes history has performed an action nobody asked for and nobody can undo.",
  },
  {
    id: "ACC-R14",
    scope: "access",
    rule: "An access restriction uses the smallest scope that addresses its reason.",
    because:
      "A payment problem does not justify blocking a security setting, and over-broad restriction makes the restriction itself the incident.",
  },
  {
    id: "ACC-R15",
    scope: "access",
    rule: "Grant, revoke, provision and deprovision side effects are idempotent.",
    because:
      "All four are triggered by distributed events that retry, so an operation that is not idempotent is not at risk of double-applying - it is waiting to.",
  },
];

export const ACCESS_JOURNEYS: readonly CanonicalJourney[] = [
  /* ------------------------------------------------------------ ACC-71 */
  {
    id: "ACC-71",
    slug: "entitlement-qualification",
    category: "access",
    goal: "access-entitlement-change",
    name: "Entitlement qualification → grant, deny or pending",
    purpose:
      "Establish whether a right actually exists, as a state distinct from being eligible for one or having paid toward one.",
    entity: {
      scope: "the person or account plus the specific entitlement, at its own scope and validity",
      note: "One entitlement per right per scope. A second grant for the same right produces two expiries and two revocations, which is why an existing one is reconciled rather than duplicated.",
    },
    distinctFrom: [
      {
        journey: "ACQ-06",
        because:
          "Eligibility asks whether the rules would permit this. Entitlement asks whether it has been granted. ACQ-06's own guardrail names the difference; this journey is the state on the other side of it.",
      },
    ],
    entry: "t.basis",
    nodes: [
      {
        id: "t.basis",
        kind: "trigger",
        event: "entitlement_basis_evaluated_or_changed",
        evidence: {
          requires: [
            "an authoritative basis for a right: a completed purchase, an activated plan, an assigned role, an earned benefit, an effective contract, or a satisfied policy condition",
          ],
          insufficientAlone: [
            "a payment authorised but not settled",
            "eligibility for a plan nobody has bought",
            "a marketing promise, which describes what we offer rather than what has been granted",
          ],
          source: "authoritative",
        },
        next: "a.evaluate",
      },
      {
        id: "a.evaluate",
        kind: "action",
        does: "Evaluate the authoritative basis - the record that establishes the right, not the process that led toward it. What matters is whether the business state confirms the grant, not how close it came",
        writes: [{ field: "entitlement_log", mode: "append" }],
        next: "c.existing",
      },
      {
        id: "c.existing",
        kind: "condition",
        asks: "Does an entitlement already exist for this right at this scope?",
        branches: [
          {
            label: "Already held",
            when: "a prior grant covers the same right and scope",
            to: "a.reconcile",
          },
          {
            label: "New",
            when: "no existing grant covers it",
            to: "c.satisfied",
          },
        ],
      },
      {
        id: "a.reconcile",
        kind: "action",
        does: "Reconcile scope and validity against the existing grant rather than issuing a second one. Two grants for one right produce two expiries, two revocations and a state nobody can read",
        writes: [{ field: "entitlement_log", mode: "append" }],
        next: "x.reconciled",
      },
      {
        id: "x.reconciled",
        kind: "exit",
        state: "existing entitlement reconciled; no duplicate grant issued",
        terminal: false,
        reEntry: "a further change to the basis re-opens this against the reconciled grant",
      },
      {
        id: "c.satisfied",
        kind: "condition",
        asks: "Are the requirements for this right satisfied?",
        branches: [
          {
            label: "Satisfied",
            when: "the authoritative basis establishes the right",
            to: "a.grant",
          },
          {
            label: "A named requirement is outstanding",
            when: "the right is available in principle and something specific has not been met yet",
            to: "x.pending",
          },
          {
            label: "Not available",
            when: "the requirements cannot be met for this account - a structural exclusion rather than a missing step",
            to: "x.denied",
          },
        ],
      },
      {
        id: "x.pending",
        kind: "exit",
        state: "PENDING_REQUIREMENT; the right is reachable and not yet held",
        terminal: false,
        reEntry:
          "satisfying the named requirement re-opens this. Pending and denied are kept apart because the route back differs - one needs a step completed, the other needs the rules to change",
      },
      {
        id: "x.denied",
        kind: "exit",
        state: "DENIED; the right is not available on this basis",
        terminal: false,
        reEntry: "a different basis - a purchase, a role, a contract - is evaluated on its own terms",
      },
      {
        id: "a.grant",
        kind: "action",
        does: "Record GRANTED with the basis that established it, the scope it covers and its validity. Granting is idempotent - the same basis arriving twice grants once",
        writes: [{ field: "entitlement_log", mode: "append" }],
        next: "h.provision",
      },
      {
        id: "h.provision",
        kind: "handoff",
        to: "ACC-72",
        on: "a right being established",
        carries: [
          "the entitlement, its scope and its validity",
          "the explicit fact that nothing has been provisioned yet, so nothing downstream reads the grant as working access",
        ],
      },
    ],
    guardrails: [
      "Eligibility is not entitlement. Being permitted to have something is not having it.",
      "A payment attempt is not an entitlement. Authorised is not settled, and settled is what establishes the right.",
      "A marketing promise is not a granted right unless an authoritative business state confirms it.",
      "An existing entitlement is reconciled, never duplicated.",
      "Qualified but capacity-blocked is pending rather than denied. Somebody who met every requirement and arrived when the allocation was full has not been refused, and recording it as a denial closes a case that policy may reopen with a waitlist or a later grant."
    ],
    reusableRule:
      "Entitlement represents an established right to a defined capability or benefit, not merely eligibility to receive it.",
  },

  /* ------------------------------------------------------------ ACC-72 */
  {
    id: "ACC-72",
    slug: "entitlement-provisioning",
    category: "access",
    goal: "access-entitlement-change",
    name: "Entitlement grant → provision → verify availability",
    purpose:
      "Hold the distance between a right being granted and the thing behind it actually working.",
    entity: {
      scope: "the entitlement plus the resource or capability being provisioned for it",
      note: "One provisioning run per entitlement, keyed idempotently. Retries and redeliveries are expected, and none of them may provision a second copy.",
    },
    entry: "t.granted",
    nodes: [
      {
        id: "t.granted",
        kind: "trigger",
        event: "entitlement_granted",
        evidence: {
          requires: ["an entitlement recorded as GRANTED with a scope that implies a resource"],
          source: "authoritative",
        },
        next: "a.provision",
      },
      {
        id: "a.provision",
        kind: "action",
        does: "Create the provisioning action and record the state as PROVISIONING, keyed so that a redelivered event provisions once. A granted entitlement in PROVISIONING is not yet usable, and nothing downstream may present it as though it were",
        writes: [{ field: "provisioning_log", mode: "append" }],
        next: "w.provision",
      },
      {
        id: "w.provision",
        kind: "wait",
        until: ["provisioning succeeds", "provisioning fails"],
        onEvent: "c.result",
        timeout: {
          after: "the provisioning SLA",
          reason:
            "a provisioning run that has neither succeeded nor failed within its SLA is a failure that has not reported itself, and treating silence as success is how a customer finds the gap first",
        },
        onTimeout: "c.failure-class",
        windowExtendsOnEngagement: false,
      },
      {
        id: "c.result",
        kind: "condition",
        asks: "How did provisioning end?",
        branches: [
          { label: "Succeeded", when: "the provisioning system reports success", to: "c.verify-needed" },
          { label: "Failed", when: "the provisioning system reports failure", to: "c.failure-class" },
        ],
      },
      {
        id: "c.verify-needed",
        kind: "condition",
        asks: "Does actual availability need to be verified?",
        branches: [
          {
            label: "Verification matters",
            when: "the holder's ability to reach the capability is what the entitlement is for, and a reported success is not proof of it",
            to: "a.verify",
          },
          {
            label: "The provisioning record is authoritative",
            when: "the provisioning system is itself the source of truth for availability",
            to: "x.active",
          },
        ],
      },
      {
        id: "a.verify",
        kind: "action",
        does: "Check that the capability is genuinely reachable by its holder. A provisioning API returning success is a statement about the API - whether anyone can use the thing is a separate question with its own answer",
        writes: [{ field: "provisioning_log", mode: "append" }],
        next: "c.available",
      },
      {
        id: "c.available",
        kind: "condition",
        asks: "Is it actually available?",
        branches: [
          { label: "Available", when: "the capability is reachable", to: "x.active" },
          {
            label: "Provisioned but unreachable",
            when: "the resource exists and the holder still cannot use it",
            to: "h.recovery",
          },
        ],
      },
      {
        id: "x.active",
        kind: "exit",
        state: "ACTIVE; the right is granted, provisioned and usable",
        terminal: false,
        reEntry: "a scope change re-opens provisioning for the delta rather than for the whole entitlement",
      },
      {
        id: "h.recovery",
        kind: "handoff",
        to: "external:access-recovery",
        on: "a provisioned resource the holder cannot reach",
        carries: [
          "the entitlement, the provisioning result and what verification actually found",
          "the fact that the grant is valid, so this is an access fault rather than an entitlement question",
        ],
      },
      {
        id: "c.failure-class",
        kind: "condition",
        asks: "What class of failure is this?",
        branches: [
          {
            label: "Transient and retry-safe",
            when: "the failure is expected to clear and the retry budget has room",
            to: "a.retry",
          },
          {
            label: "Permanent, or the budget is spent",
            when: "retrying will not help, or has already been tried as often as the budget allows",
            to: "h.escalate",
          },
        ],
      },
      {
        id: "a.retry",
        kind: "action",
        does: "Retry against a budget fixed at the first failure. The budget does not renew - that is the difference between a retry policy and a loop that provisions forever",
        writes: [{ field: "provisioning_log", mode: "append" }],
        next: "w.provision",
      },
      {
        id: "h.escalate",
        kind: "handoff",
        to: "OWN-55",
        on: "provisioning that cannot be completed automatically",
        carries: [
          "the entitlement and what has been attempted",
          "the fact that the customer holds a valid right they currently cannot use",
        ],
      },
    ],
    guardrails: [
      "A granted entitlement is not a provisioned one. The grant is a business record; provisioning is a distributed operation that can fail on its own.",
      "Provisioning success is not availability. Where the difference matters, availability is checked rather than assumed.",
      "Provisioning is idempotent. Redelivery provisions once.",
      "Retries are bounded by a budget fixed at the first failure.",
    ],
    reusableRule:
      "A granted right becomes usable only after the required resource or capability is successfully provisioned and available.",
  },

  /* ------------------------------------------------------------ ACC-73 */
  {
    id: "ACC-73",
    slug: "entitlement-scope-change",
    category: "access",
    goal: "access-entitlement-change",
    name: "Entitlement change → recalculate scope → expand, reduce or preserve",
    purpose:
      "Apply only the difference between the old and new rights, rather than re-applying a whole scope over a working one.",
    entity: {
      scope: "the entitlement whose basis changed, and the delta between its previous and new scope",
      note: "The delta is the unit of work. Re-applying the full new scope reprovisions what already worked and revokes what should have survived, and the holder sees both as an outage.",
    },
    entry: "t.changed",
    nodes: [
      {
        id: "t.changed",
        kind: "trigger",
        event: "entitlement_basis_changed",
        evidence: {
          requires: [
            "an authoritative change to the basis of an existing entitlement: a plan change, a role change, a contract amendment, a benefit or quantity or coverage change",
          ],
          source: "authoritative",
        },
        next: "a.compare",
      },
      {
        id: "a.compare",
        kind: "action",
        does: "Compare the previous scope, the new scope and the effective time, and derive the delta. What gets applied is the difference - a capability present in both scopes is not touched at all",
        writes: [{ field: "entitlement_log", mode: "append" }],
        next: "c.direction",
      },
      {
        id: "c.direction",
        kind: "condition",
        asks: "Which way did the scope move?",
        branches: [
          {
            label: "Expanded only",
            when: "capabilities were added and none removed",
            to: "a.expand",
          },
          {
            label: "Reduced, or mixed",
            when: "at least one capability is no longer covered, whether or not others were added",
            to: "a.delta",
          },
        ],
      },
      {
        id: "a.expand",
        kind: "action",
        does: "Provision the newly granted capabilities, idempotently, and leave everything already working untouched",
        writes: [{ field: "entitlement_log", mode: "append" }],
        next: "x.applied",
      },
      {
        id: "a.delta",
        kind: "action",
        does: "Apply any expansion, and identify precisely which capabilities are no longer covered. Historical data and resources created under the previous scope are not destroyed by a scope change - a reduction removes a right, not a record",
        writes: [{ field: "entitlement_log", mode: "append" }],
        next: "c.commitments",
      },
      {
        id: "c.commitments",
        kind: "condition",
        asks: "Do existing commitments or in-flight usage depend on what is being removed?",
        branches: [
          {
            label: "Something depends on it",
            when: "a confirmed reservation, an in-progress service, a purchased benefit or an open transaction rests on the capability being removed",
            to: "h.loss",
          },
          {
            label: "Nothing depends on it",
            when: "the reduction affects only future use",
            to: "a.reduce",
          },
        ],
      },
      {
        id: "h.loss",
        kind: "handoff",
        to: "ACC-74",
        on: "a scope reduction with live commitments underneath it",
        carries: [
          "the capabilities being removed and their effective time",
          "the commitments that depend on them, which are reconciled separately rather than cancelled by the scope change",
        ],
      },
      {
        id: "a.reduce",
        kind: "action",
        does: "Apply the reduction to future access only, idempotently. Future access loss and cancelling an existing obligation are two different decisions, and this one makes only the first",
        writes: [{ field: "entitlement_log", mode: "append" }],
        next: "x.applied",
      },
      {
        id: "x.applied",
        kind: "exit",
        state: "delta applied; unchanged capabilities untouched",
        terminal: false,
        reEntry: "a further basis change is compared against the new scope",
      },
    ],
    guardrails: [
      "A reduction in entitlement does not destroy historical data or resources created while the right was held.",
      "Future access loss and cancelling an existing obligation are separate decisions made by separate journeys.",
      "The delta is applied idempotently, so a redelivered change does not reprovision or re-revoke.",
    ],
    reusableRule:
      "Entitlement changes should apply the difference between old and new rights without rewriting the history of what was previously valid.",
  },

  /* ------------------------------------------------------------ ACC-74 */
  {
    id: "ACC-74",
    slug: "entitlement-loss",
    category: "access",
    goal: "access-entitlement-change",
    name: "Entitlement loss → revoke future capability → reconcile existing obligations",
    purpose:
      "Stop future use of a right that has ended without cancelling what was validly created while it was held.",
    entity: {
      scope: "the entitlement that ended, plus the resources and commitments that depended on it",
      note: "Revocation stays scoped to this entitlement. A right held on another basis is untouched, and the record that this one existed remains.",
    },
    distinctFrom: [
      {
        journey: "ACC-78",
        because:
          "Suspension restricts a right that still exists and is designed to come back. This is the right ending, which is why it reconciles obligations rather than holding them.",
      },
    ],
    entry: "t.loss",
    nodes: [
      {
        id: "t.loss",
        kind: "trigger",
        event: "entitlement_no_longer_valid",
        evidence: {
          requires: [
            "an authoritative end to a right: a plan downgrade, a contract termination, a role removal, a benefit expiry, an eligibility-linked revocation, or a policy decision",
          ],
          source: "authoritative",
        },
        next: "a.effective",
      },
      {
        id: "a.effective",
        kind: "action",
        does: "Determine when the loss actually takes effect - immediately, at period end, or on a future date. Assuming immediate is how someone loses what they have already paid for, and everything downstream depends on getting this right",
        writes: [{ field: "entitlement_log", mode: "append" }],
        next: "a.identify",
      },
      {
        id: "a.identify",
        kind: "action",
        does: "Identify the capabilities affected, scoped to this entitlement alone. A lost role does not revoke rights the same person holds on a different basis",
        next: "a.stop-future",
      },
      {
        id: "a.stop-future",
        kind: "action",
        does: "Prevent future use of the affected capabilities from the effective time, idempotently. The record that the entitlement existed and what was done under it is untouched - losing a right does not mean it was never held",
        writes: [{ field: "entitlement_log", mode: "append" }],
        next: "c.commitments",
      },
      {
        id: "c.commitments",
        kind: "condition",
        asks: "Do valid commitments exist that were created while the right was held?",
        branches: [
          {
            label: "Commitments outstanding",
            when: "a confirmed reservation, an in-progress service, an already purchased benefit or an open transaction exists",
            to: "h.reconcile",
          },
          {
            label: "Nothing outstanding",
            when: "the right governed only future use",
            to: "c.deprovision",
          },
        ],
      },
      {
        id: "h.reconcile",
        kind: "handoff",
        to: "external:commitment-reconciliation",
        on: "an entitlement ending with commitments still live under it",
        carries: [
          "each commitment and when it was created relative to the loss",
          "the explicit fact that nothing has been cancelled - the reconciliation decides that on its own terms",
        ],
      },
      {
        id: "c.deprovision",
        kind: "condition",
        asks: "Does a provisioned resource need removing?",
        branches: [
          {
            label: "Resource provisioned",
            when: "something was provisioned for this entitlement and is no longer authorised",
            to: "h.deprovision",
          },
          {
            label: "Nothing provisioned",
            when: "the right had no provisioned resource behind it",
            to: "x.revoked",
          },
        ],
      },
      {
        id: "h.deprovision",
        kind: "handoff",
        to: "ACC-80",
        on: "a provisioned resource whose entitlement has ended",
        carries: [
          "the resource and the effective loss time",
          "the fact that removal is a capability question and not a data-deletion authorisation",
        ],
      },
      {
        id: "x.revoked",
        kind: "exit",
        state: "future use revoked; history and commitments intact",
        terminal: false,
        reEntry:
          "the right may be granted again on a new basis, which is a new entitlement rather than a revival of this one",
      },
    ],
    guardrails: [
      "Losing an entitlement does not mean the entitlement never existed. The historical record stands.",
      "Existing commitments are reconciled separately and are never cancelled automatically by the loss.",
      "Revocation stays scoped to the affected entitlement.",
      "Stopping future use is idempotent.",
    ],
    reusableRule:
      "Losing a right prevents future unauthorized use but does not automatically erase commitments created while the right was valid.",
  },

  /* ------------------------------------------------------------ ACC-75 */
  {
    id: "ACC-75",
    slug: "access-authorization-decision",
    category: "access",
    goal: "access-entitlement-change",
    name: "Access request → authorization check → allow, deny or step up",
    purpose:
      "Decide at the moment of the attempt whether this actor may take this action on this resource.",
    entity: {
      scope: "the individual access request - one actor, one action, one resource",
      note: "The decision belongs to the request. Allowing one action says nothing about the next, and a cached decision is re-checked against critical state that may have moved since.",
    },
    distinctFrom: [
      {
        journey: "OWN-56",
        because:
          "Approval is a business decision taken in advance about a subject. Authorization is a runtime decision taken at the moment of the attempt, and being approved for something does not authorise every action within it.",
      },
    ],
    entry: "t.attempt",
    nodes: [
      {
        id: "t.attempt",
        kind: "trigger",
        event: "protected_action_attempted",
        evidence: {
          requires: ["an actor attempting a protected action on an identified resource"],
          insufficientAlone: [
            "a successful authentication, which establishes who is asking and nothing about what they may do",
            "holding an entitlement to the product the resource belongs to",
          ],
          source: "authoritative",
        },
        next: "a.evaluate",
      },
      {
        id: "a.evaluate",
        kind: "action",
        does: "Evaluate at execution time: the identity, the entitlement, the role and permission, the resource's own scope, the current security state, and the policy requirements for this specific action. A cached decision is re-checked against critical state, because the states that matter most are the ones that change fastest",
        next: "c.decision",
      },
      {
        id: "c.decision",
        kind: "condition",
        asks: "What does the current state permit?",
        branches: [
          {
            label: "Fully authorized",
            when: "every required condition is satisfied for this actor, action and resource",
            to: "x.allow",
          },
          {
            label: "Authorized subject to stronger verification",
            when: "the conditions are met except for an assurance level this action requires",
            to: "h.stepup",
          },
          {
            label: "Not authorized",
            when: "at least one required condition fails",
            to: "a.deny",
          },
        ],
      },
      {
        id: "x.allow",
        kind: "exit",
        state: "ALLOW; this action on this resource, now",
        terminal: false,
        reEntry:
          "the next attempt is decided again. Allowing one action never authorises the following one, however similar it looks",
      },
      {
        id: "h.stepup",
        kind: "handoff",
        to: "IDN-86",
        on: "an action requiring an assurance level the current session does not hold",
        carries: [
          "the pending request, so it can resume rather than be retyped",
          "the assurance level required and why this action requires it",
        ],
      },
      {
        id: "a.deny",
        kind: "action",
        does: "Record the denial with its reason category - entitlement missing, permission missing, resource out of scope, security state blocking, or policy prohibition. A bare denial cannot be appealed, debugged, or distinguished from an outage",
        writes: [{ field: "authorization_log", mode: "append" }],
        next: "x.deny",
      },
      {
        id: "x.deny",
        kind: "exit",
        state: "DENY, with a recorded reason category",
        terminal: false,
        reEntry: "a change to any of the evaluated states makes the next attempt a new decision",
      },
    ],
    guardrails: [
      "Entitlement to a product is not permission for every action within it.",
      "Authentication success is not authorization. The two answer different questions.",
      "A cached authorization respects current critical state changes rather than the state at the time it was cached.",
      "Every denial carries a reason category.",
    ],
    reusableRule:
      "Access should be granted only when the current actor, resource and action satisfy the required authorization conditions at execution time.",
  },

  /* ------------------------------------------------------------ ACC-76 */
  {
    id: "ACC-76",
    slug: "credential-lifecycle",
    category: "access",
    goal: "access-entitlement-change",
    name: "Credential issued → activate → use, expire or revoke",
    purpose:
      "Run an access artifact through its own validity lifecycle, separately from the right it represents.",
    entity: {
      scope: "the individual credential - its id, owner, scope and validity",
      note: "A credential's validity is its own. It can be valid while the entitlement behind it has lapsed, and revoked while that entitlement is perfectly live.",
    },
    distinctFrom: [
      {
        journey: "ACC-71",
        because:
          "The entitlement is the right. The credential is an artifact that presents it. Treating the artifact as the right means revoking a token looks like removing a benefit.",
      },
    ],
    entry: "t.issued",
    nodes: [
      {
        id: "t.issued",
        kind: "trigger",
        event: "credential_issued",
        evidence: {
          requires: ["a credential issued with an owner, a scope and a validity"],
          source: "authoritative",
        },
        next: "a.store",
      },
      {
        id: "a.store",
        kind: "action",
        does: "Store the credential id, owner, scope, issue time, validity, whether activation is required, and its status as ISSUED. Issued is not active, and nothing may present it as usable until it is",
        writes: [{ field: "credential_log", mode: "append" }],
        next: "c.activation",
      },
      {
        id: "c.activation",
        kind: "condition",
        asks: "Does this credential require activation before use?",
        branches: [
          {
            label: "Activation required",
            when: "policy requires the holder to activate it",
            to: "w.activation",
          },
          {
            label: "Active on issue",
            when: "policy makes it usable as issued",
            to: "a.active",
          },
        ],
      },
      {
        id: "w.activation",
        kind: "wait",
        until: ["the credential is activated", "the credential is revoked before activation"],
        onEvent: "c.activation-result",
        timeout: {
          after: "the activation window",
          reason:
            "an unactivated credential does not become active by waiting, and leaving it ISSUED indefinitely keeps a usable artifact alive that nobody ever claimed",
        },
        onTimeout: "a.lapse",
        windowExtendsOnEngagement: false,
      },
      {
        id: "c.activation-result",
        kind: "condition",
        asks: "What happened during the activation window?",
        branches: [
          { label: "Activated", when: "the holder activated it", to: "a.active" },
          {
            label: "Revoked first",
            when: "a revocation arrived before activation",
            to: "h.revoke",
          },
        ],
      },
      {
        id: "a.lapse",
        kind: "action",
        does: "Expire the credential unactivated, recording that it was never claimed. An expired-unactivated credential and an expired-active one are different facts about how the artifact was used",
        writes: [{ field: "credential_log", mode: "append" }],
        next: "x.unactivated",
      },
      {
        id: "x.unactivated",
        kind: "exit",
        state: "EXPIRED, never activated",
        terminal: false,
        reEntry: "a replacement credential is issued as a new artifact with its own id and lifecycle",
      },
      {
        id: "a.active",
        kind: "action",
        does: "Record the credential as ACTIVE for its scope and validity",
        writes: [{ field: "credential_log", mode: "append" }],
        next: "w.life",
      },
      {
        id: "w.life",
        kind: "wait",
        until: ["a revocation event", "a replacement credential is issued"],
        onEvent: "c.life",
        timeout: {
          after: "the credential's validity end",
          reason:
            "validity ending is the ordinary path; the wait is watching for the two things that can end it sooner",
        },
        onTimeout: "a.revalidate",
        windowExtendsOnEngagement: false,
      },
      {
        id: "c.life",
        kind: "condition",
        asks: "What ended the credential's active life?",
        branches: [
          { label: "Revoked", when: "an authoritative revocation arrived", to: "h.revoke" },
          {
            label: "Replaced",
            when: "a replacement credential was issued for the same purpose",
            to: "x.replaced",
          },
        ],
      },
      {
        id: "x.replaced",
        kind: "exit",
        state: "REPLACED; this artifact is no longer usable",
        terminal: false,
        reEntry:
          "the replacement runs its own lifecycle. This one is never reactivated, whatever happens to the replacement",
      },
      {
        id: "h.revoke",
        kind: "handoff",
        to: "ACC-77",
        on: "a credential being revoked",
        carries: ["the credential, its scope and its owner", "the revocation reason"],
      },
      {
        id: "a.revalidate",
        kind: "action",
        does: "Re-read the credential's current version before expiring it. An extension or a replacement may have moved its validity since this timer was written, and expiring on the remembered value would undo a later decision",
        next: "c.still",
      },
      {
        id: "c.still",
        kind: "condition",
        asks: "Does the current version still expire now?",
        branches: [
          {
            label: "Still expiring",
            when: "the current validity ends at this moment",
            to: "a.expire",
          },
          {
            label: "Validity moved",
            when: "an extension or replacement changed it",
            to: "x.superseded",
          },
        ],
      },
      {
        id: "a.expire",
        kind: "action",
        does: "Record the credential as EXPIRED. Expired is not revoked - the artifact reached the end of its validity rather than being withdrawn, and the two mean different things to anyone investigating later",
        writes: [{ field: "credential_log", mode: "append" }],
        next: "x.expired",
      },
      {
        id: "x.expired",
        kind: "exit",
        state: "EXPIRED after active use",
        terminal: false,
        reEntry:
          "the entitlement behind it may still be perfectly valid; a new credential is issued for it rather than this one being revived",
      },
      {
        id: "x.superseded",
        kind: "exit",
        state: "expiry superseded by an extension or replacement",
        terminal: false,
        reEntry: "the current validity governs, and its own end executes when it arrives",
      },
    ],
    guardrails: [
      "A credential issued is not a credential active.",
      "Credential validity is not entitlement validity. Either can end while the other holds.",
      "A revoked credential is never restored by a stale activation or refresh event.",
      "Expiry re-reads the current version before applying, so an extension is not undone by an older timer.",
    ],
    reusableRule:
      "Credentials are access artifacts with their own validity lifecycle and should not be treated as the entitlement they represent.",
  },

  /* ------------------------------------------------------------ ACC-77 */
  {
    id: "ACC-77",
    slug: "credential-revocation",
    category: "access",
    goal: "access-entitlement-change",
    name: "Credential compromise or revocation → disable → replace or re-authenticate",
    purpose:
      "Take a credential out of use immediately, and let any replacement come through its own authorised path.",
    entity: {
      scope: "the specific credentials affected, and their owner",
      note: "Scope is the whole question. One compromised artifact does not implicate unrelated ones unless policy says the compromise reaches them.",
    },
    entry: "t.revocation",
    nodes: [
      {
        id: "t.revocation",
        kind: "trigger",
        event: "authoritative_revocation_requirement",
        evidence: {
          requires: [
            "a requirement to revoke: suspected or confirmed compromise, a manual revoke, a password or security reset, a device removed, access terminated, or a token invalidation",
          ],
          source: "authoritative",
        },
        next: "a.scope",
      },
      {
        id: "a.scope",
        kind: "action",
        does: "Determine which credentials are actually affected. One compromised artifact does not revoke unrelated ones unless policy says the compromise implies them - over-revoking on a suspicion locks people out of things that were never at risk, and the lockout becomes the incident",
        writes: [{ field: "credential_log", mode: "append" }],
        next: "a.revoke",
      },
      {
        id: "a.revoke",
        kind: "action",
        does: "Revoke the affected credentials immediately, ahead of everything else in this journey. Security revocation takes precedence over queued access actions - an artifact invalidated at ten o'clock must not still authorise a request queued at one minute to",
        writes: [
          { field: "credential_log", mode: "append" },
          { field: "suppressed_sends", mode: "append" },
        ],
        next: "a.invalidate",
      },
      {
        id: "a.invalidate",
        kind: "action",
        does: "Invalidate the refresh and activation operations tied to the revoked credentials, so nothing in flight can bring one back after it has been withdrawn",
        writes: [{ field: "suppressed_sends", mode: "append" }],
        next: "c.replacement",
      },
      {
        id: "c.replacement",
        kind: "condition",
        asks: "Is a replacement allowed?",
        branches: [
          {
            label: "Replacement permitted",
            when: "the owner remains entitled and policy allows re-issuing",
            to: "c.verification",
          },
          {
            label: "No replacement",
            when: "access is being removed, or the owner is no longer entitled",
            to: "x.no-access",
          },
        ],
      },
      {
        id: "x.no-access",
        kind: "exit",
        state: "revoked; no replacement issued",
        terminal: false,
        reEntry:
          "a new credential requires the entitlement and the authorisation to be established again, which is a different journey and not a continuation of this one",
      },
      {
        id: "c.verification",
        kind: "condition",
        asks: "Does issuing a replacement require verification first?",
        branches: [
          {
            label: "Verification required",
            when: "the revocation reason means the requester's identity or control has to be re-established",
            to: "h.verify",
          },
          {
            label: "No verification needed",
            when: "the revocation was routine and the owner's identity is not in question",
            to: "a.issue",
          },
        ],
      },
      {
        id: "h.verify",
        kind: "handoff",
        to: "IDN-85",
        on: "a replacement requiring identity or control to be re-established",
        carries: [
          "the revocation reason, which sets how strong the verification has to be",
          "the fact that the old credential is already revoked and stays revoked whatever the verification concludes",
        ],
      },
      {
        id: "a.issue",
        kind: "action",
        does: "Issue a replacement as a new credential with its own id and its own lifecycle. The revoked artifact is never reactivated - a replacement replaces, and reusing the old identifier would make the revocation unverifiable",
        writes: [{ field: "credential_log", mode: "append" }],
        next: "h.new",
      },
      {
        id: "h.new",
        kind: "handoff",
        to: "ACC-76",
        on: "a replacement credential being issued",
        carries: [
          "the new credential and the credential it replaces",
          "the revocation reason, which is part of the new artifact's history",
        ],
      },
    ],
    guardrails: [
      "One credential compromise does not automatically revoke unrelated credentials unless policy requires it.",
      "A replacement never reactivates the revoked credential. It is a new artifact.",
      "Security revocation takes precedence over queued access actions, including refresh and activation already in flight.",
    ],
    reusableRule:
      "Credential revocation should immediately invalidate the affected access artifact while replacement follows an independently authorized path.",
  },

  /* ------------------------------------------------------------ ACC-78 */
  {
    id: "ACC-78",
    slug: "access-suspension",
    category: "access",
    goal: "suspension-restoration",
    name: "Access suspension → restricted state → restore or terminate",
    purpose:
      "Restrict defined capabilities for a reason, in the smallest scope that addresses it, while keeping restoration genuinely possible.",
    entity: {
      scope: "the account or person plus the specific capability scope being restricted",
      note: "The scope is recorded rather than implied. Anything reading the account has to be able to tell which capabilities are blocked and which still work.",
    },
    distinctFrom: [
      {
        journey: "TIM-65",
        because:
          "Grace continues a right whose validity has ended. Suspension restricts a right that is still valid. One is continuity after an ending; the other is a hold before one.",
      },
    ],
    entry: "t.suspension",
    nodes: [
      {
        id: "t.suspension",
        kind: "trigger",
        event: "authoritative_suspension_decision",
        evidence: {
          requires: [
            "a decision to suspend for a stated reason: a payment state, a security review, a policy review, a temporary operational restriction, or an administrative hold",
          ],
          insufficientAlone: [
            "an outage, which removes access without anyone deciding to",
          ],
          source: "authoritative",
        },
        next: "a.scope",
      },
      {
        id: "a.scope",
        kind: "action",
        does: "Record the reason, the scope, when it takes effect, which capabilities are blocked, which continue, and what would end it. The scope is the smallest that addresses the reason - a payment problem does not justify blocking a security setting, and over-broad restriction makes the restriction itself the incident",
        writes: [{ field: "suspension_log", mode: "append" }],
        next: "c.partial",
      },
      {
        id: "c.partial",
        kind: "condition",
        asks: "Does anything remain accessible?",
        branches: [
          {
            label: "Partial",
            when: "capabilities outside the reason's scope are unaffected",
            to: "a.preserve",
          },
          {
            label: "Full",
            when: "the reason justifies blocking everything in scope",
            to: "a.full",
          },
        ],
      },
      {
        id: "a.preserve",
        kind: "action",
        does: "Leave the unaffected capabilities working, so the state is legible as a suspension rather than as an outage - and so the holder can still do the thing that would resolve it",
        writes: [{ field: "suspension_log", mode: "append" }],
        next: "w.suspension",
      },
      {
        id: "a.full",
        kind: "action",
        does: "Record a full suspension within the affected scope, with the same review condition. Full is still not terminal, and the record says so",
        writes: [{ field: "suspension_log", mode: "append" }],
        next: "w.suspension",
      },
      {
        id: "w.suspension",
        kind: "wait",
        until: ["the suspension reason is resolved", "a terminal decision is made"],
        onEvent: "c.outcome",
        timeout: {
          after: "the review point or the recorded expiry",
          reason:
            "a suspension with no review is a termination that nobody had to authorise, and the review is what keeps the two apart",
        },
        onTimeout: "c.review",
        windowExtendsOnEngagement: false,
      },
      {
        id: "c.outcome",
        kind: "condition",
        asks: "How was it resolved?",
        branches: [
          {
            label: "Reason resolved",
            when: "what justified the suspension has been dealt with",
            to: "h.restore",
          },
          {
            label: "Terminal decision",
            when: "the review concluded that the right should end rather than resume",
            to: "h.terminate",
          },
        ],
      },
      {
        id: "c.review",
        kind: "condition",
        asks: "At the review point with nothing resolved, what now?",
        branches: [
          {
            label: "Extend with a new end",
            when: "the reason still holds and policy allows a further period",
            to: "a.extend",
          },
          {
            label: "Lift it",
            when: "the reason has lapsed even though nothing formally resolved it",
            to: "h.restore",
          },
          {
            label: "Nobody decided",
            when: "the review point arrived with no decision made at all",
            to: "h.escalate",
          },
        ],
      },
      {
        id: "a.extend",
        kind: "action",
        does: "Record the extension as its own suspension instance with a new review point, so the number of times someone has been suspended without a decision stays countable rather than hidden inside one long record",
        writes: [{ field: "suspension_log", mode: "append" }],
        next: "x.extended",
      },
      {
        id: "x.extended",
        kind: "exit",
        state: "suspension extended; a new instance carries the new review point",
        terminal: false,
        reEntry: "the extension runs as its own instance with its own end",
      },
      {
        id: "h.restore",
        kind: "handoff",
        to: "ACC-79",
        on: "a suspension ending without a terminal decision",
        carries: [
          "which capabilities were blocked and why",
          "the explicit instruction that restoration revalidates rather than replays - the previous capability set is history, not a target",
        ],
      },
      {
        id: "h.terminate",
        kind: "handoff",
        to: "ACC-74",
        on: "a review concluding that the right should end",
        carries: ["the suspension history and the terminal decision", "the entitlement now ending"],
      },
      {
        id: "h.escalate",
        kind: "handoff",
        to: "OWN-55",
        on: "a suspension review point reached with no decision",
        carries: [
          "how long access has been restricted and on what reason",
          "the fact that an undecided suspension is costing the holder access every day it continues",
        ],
      },
    ],
    guardrails: [
      "Suspended is not terminated. Suspension is designed to be reversible and its record says so.",
      "The suspension uses the smallest scope that addresses its reason.",
      "Restoration does not blindly return every previous capability - it hands to a journey whose job is revalidating first.",
      "A suspension without a review point is a termination nobody authorised.",
    ],
    reusableRule:
      "Suspension temporarily restricts defined capabilities while preserving the possibility of restoration after current eligibility and authority are revalidated.",
  },

  /* ------------------------------------------------------------ ACC-79 */
  {
    id: "ACC-79",
    slug: "capability-restoration",
    category: "access",
    goal: "suspension-restoration",
    name: "Capability restoration → revalidate → restore safely",
    purpose:
      "Rebuild access from what is currently valid, rather than replaying the capability set someone used to have.",
    entity: {
      scope: "the person or account plus each capability being considered for restoration",
      note: "Each capability is judged on its own current requirements. Restoration is not one decision but as many as there are capabilities.",
    },
    distinctFrom: [
      {
        journey: "TIM-68",
        because:
          "TIM-68 reverses a transition within a window and asks what side effects can be undone. This rebuilds a capability set from scratch against current conditions, with no assumption that the previous set is the target.",
      },
    ],
    entry: "t.condition",
    nodes: [
      {
        id: "t.condition",
        kind: "trigger",
        event: "restoration_condition_satisfied",
        evidence: {
          requires: [
            "the condition that removed or restricted access appearing to be resolved",
          ],
          insufficientAlone: [
            "time passing on a restriction whose reason was never addressed",
          ],
          source: "authoritative",
        },
        next: "a.reevaluate",
      },
      {
        id: "a.reevaluate",
        kind: "action",
        does: "Re-evaluate every current requirement independently: the entitlement, the authorization, the security state, the policy state, the credential's own validity, and whether the resource still exists. Each is read now rather than taken from the snapshot captured when access was removed",
        writes: [{ field: "restoration_log", mode: "append" }],
        next: "c.requirements",
      },
      {
        id: "c.requirements",
        kind: "condition",
        asks: "How much of the previous capability set is currently valid?",
        branches: [
          {
            label: "All of it",
            when: "every requirement for every affected capability is satisfied now",
            to: "a.restore-full",
          },
          {
            label: "Some of it",
            when: "part of the set is currently valid and part is not",
            to: "a.restore-subset",
          },
          {
            label: "None of it",
            when: "no affected capability meets its current requirements",
            to: "x.remains",
          },
        ],
      },
      {
        id: "a.restore-full",
        kind: "action",
        does: "Restore the affected capabilities and invalidate the restriction actions that are now obsolete",
        writes: [{ field: "restoration_log", mode: "append" }],
        next: "x.restored",
      },
      {
        id: "a.restore-subset",
        kind: "action",
        does: "Restore only the subset that is currently valid, and invalidate the obsolete restriction actions for it. Expired credentials, withdrawn permissions, lapsed entitlements, deleted resources and roles that no longer exist are not resurrected - each ended for its own reason, and restoring access never addressed any of them. What is not restored is named, so the holder can ask about it rather than discover it",
        writes: [{ field: "restoration_log", mode: "append" }],
        next: "x.partial",
      },
      {
        id: "x.restored",
        kind: "exit",
        state: "capabilities restored against current valid state",
        terminal: false,
        reEntry: "a further restriction and restoration is its own cycle",
      },
      {
        id: "x.partial",
        kind: "exit",
        state: "partially restored; what did not return is named",
        terminal: false,
        reEntry:
          "each capability not restored re-enters when its own requirement is met - the subset that is missing is a list rather than a vague sense that something is wrong",
      },
      {
        id: "x.remains",
        kind: "exit",
        state: "still restricted; nothing currently qualifies for restoration",
        terminal: false,
        reEntry:
          "previous access is not a current access right, and regaining it means meeting the requirements now rather than having met them before",
      },
    ],
    guardrails: [
      "Previous access is not a current access right.",
      "Restoration never resurrects expired credentials, withdrawn permissions, expired entitlements, deleted resources or obsolete roles.",
      "Obsolete restriction actions are invalidated as part of restoring, not left to fire afterwards.",
      "A partial restoration names what did not come back.",
    ],
    reusableRule:
      "Capability restoration should reconstruct access from current valid state rather than rewind the system to a historical snapshot.",
  },

  /* ------------------------------------------------------------ ACC-80 */
  {
    id: "ACC-80",
    slug: "deprovision-with-dependency-check",
    category: "access",
    goal: "access-entitlement-change",
    name: "Deprovision request → dependency check → remove, retain or escalate",
    purpose:
      "Remove a capability that is no longer authorised, after establishing that nothing still depends on the thing being removed.",
    entity: {
      scope: "the provisioned resource or capability, and the entitlement whose end triggered its removal",
      note: "The resource is the entity, not the entitlement. A shared resource outlives any single right to it, which is why dependency is checked before anything is removed.",
    },
    distinctFrom: [
      {
        journey: "ACC-74",
        because:
          "ACC-74 ends a right and stops future use. This removes the technical resource behind it, which is a separate operation with its own failure modes and its own reasons to wait.",
      },
    ],
    entry: "t.requirement",
    nodes: [
      {
        id: "t.requirement",
        kind: "trigger",
        event: "deprovisioning_requirement",
        evidence: {
          requires: [
            "a valid requirement to deprovision: an entitlement ended, an account closed, a role removed, a contract terminated, or a resource explicitly removed",
          ],
          insufficientAlone: [
            "a period of non-use, which is not an authorisation to remove anything",
          ],
          source: "authoritative",
        },
        next: "a.identify",
      },
      {
        id: "a.identify",
        kind: "action",
        does: "Identify the provisioned resources affected, and which of them are shared with anything still entitled",
        writes: [{ field: "deprovisioning_log", mode: "append" }],
        next: "c.dependency",
      },
      {
        id: "c.dependency",
        kind: "condition",
        asks: "What still depends on these resources?",
        branches: [
          {
            label: "Shared with a live entitlement",
            when: "another holder is still entitled to the same resource",
            to: "x.retain",
          },
          {
            label: "A commitment must complete first",
            when: "an in-progress service or open transaction needs the resource until it finishes",
            to: "w.dependency",
          },
          {
            label: "Data transfer or a special process applies",
            when: "an export, a handover or a defined termination process has to run before removal",
            to: "h.special",
          },
          {
            label: "Nothing depends on it",
            when: "the resource serves only the entitlement that ended",
            to: "a.deprovision",
          },
        ],
      },
      {
        id: "x.retain",
        kind: "exit",
        state: "retained; another entitlement still depends on it",
        terminal: false,
        reEntry:
          "when the last entitlement to the shared resource ends, removal is evaluated again. Removing it now would take it from everyone else who is still entitled",
      },
      {
        id: "w.dependency",
        kind: "wait",
        until: ["the dependent commitment completes"],
        onEvent: "a.deprovision",
        timeout: {
          after: "the horizon appropriate to the dependent commitment",
          reason:
            "a dependency that never clears leaves an unauthorised capability alive indefinitely, which is the failure deprovisioning exists to prevent",
        },
        onTimeout: "h.escalate",
        windowExtendsOnEngagement: false,
      },
      {
        id: "h.special",
        kind: "handoff",
        to: "external:data-transfer-or-termination",
        on: "removal requiring an export, handover or defined termination process first",
        carries: [
          "the resource and what has to happen before it can go",
          "the fact that the capability is already unauthorised even though the resource remains",
        ],
      },
      {
        id: "a.deprovision",
        kind: "action",
        does: "Deprovision idempotently. This removes the capability, not the record of it - historical and audit data is governed by its own retention and deletion lifecycle, and a deprovision that deletes it has performed an irreversible action nobody authorised",
        writes: [{ field: "deprovisioning_log", mode: "append" }],
        next: "w.deprovision",
      },
      {
        id: "w.deprovision",
        kind: "wait",
        until: ["deprovisioning succeeds", "deprovisioning fails"],
        onEvent: "c.result",
        timeout: {
          after: "the deprovisioning SLA",
          reason:
            "silence is not success, and an unauthorised capability that may still be live is worth escalating rather than assuming away",
        },
        onTimeout: "h.escalate",
        windowExtendsOnEngagement: false,
      },
      {
        id: "c.result",
        kind: "condition",
        asks: "How did it end?",
        branches: [
          { label: "Succeeded", when: "the system reports the resource removed", to: "c.verify" },
          { label: "Failed", when: "the system reports a failure", to: "c.retry" },
        ],
      },
      {
        id: "c.verify",
        kind: "condition",
        asks: "Does the access consequence matter enough to verify?",
        branches: [
          {
            label: "Verify it",
            when: "continued access would be a real problem, which is the usual case for anything security-relevant",
            to: "a.verify",
          },
          {
            label: "The removal record is sufficient",
            when: "the deprovisioning system is authoritative for whether the capability exists",
            to: "x.removed",
          },
        ],
      },
      {
        id: "a.verify",
        kind: "action",
        does: "Confirm the capability is genuinely no longer available. A deprovisioning API returning success is a statement about the API, and the question here is whether anyone can still get in",
        writes: [{ field: "deprovisioning_log", mode: "append" }],
        next: "x.removed",
      },
      {
        id: "x.removed",
        kind: "exit",
        state: "capability removed; records and audit data untouched",
        terminal: false,
        reEntry:
          "re-provisioning follows a new entitlement rather than an undo. Deleting the retained data is a separate lifecycle with its own authorisation",
      },
      {
        id: "c.retry",
        kind: "condition",
        asks: "Is this failure retry-safe within the budget?",
        branches: [
          {
            label: "Retry",
            when: "the failure is transient and the budget fixed at the first attempt has room",
            to: "a.retry",
          },
          {
            label: "Escalate",
            when: "the failure is permanent, or the budget is spent",
            to: "h.escalate",
          },
        ],
      },
      {
        id: "a.retry",
        kind: "action",
        does: "Retry against the budget fixed at the first failure, idempotently, so a partially completed removal is completed rather than restarted",
        writes: [{ field: "deprovisioning_log", mode: "append" }],
        next: "w.deprovision",
      },
      {
        id: "h.escalate",
        kind: "handoff",
        to: "OWN-55",
        on: "a capability that could not be removed",
        carries: [
          "the resource, what was attempted, and how long it has been unauthorised",
          "whether the capability is believed to still be reachable, which is what makes this urgent rather than administrative",
        ],
      },
    ],
    guardrails: [
      "An entitlement ending is not an authorisation for destructive deletion.",
      "Deprovisioning does not delete historical or audit data. That is a separate lifecycle with separate authorisation.",
      "Shared resource dependencies are checked before removal.",
      "Where the access consequence matters, technical success is verified rather than assumed.",
      "Deprovisioning is idempotent, so a retry completes a partial removal rather than restarting it.",
    ],
    reusableRule:
      "Deprovisioning removes no-longer-authorized capability only after active dependencies and retention obligations have been reconciled.",
  },
];
