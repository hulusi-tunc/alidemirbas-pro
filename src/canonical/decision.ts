import type { CanonicalJourney, OrchestrationRule } from "./types";

/* CATEGORY 19 - APPROVALS, DECISIONS, REVIEWS & HUMAN-IN-THE-LOOP WORK

   Every category before this one hands work here when a policy runs out. They
   named an `external:human-review` placeholder while this category did not yet
   exist; those forty-one edges now point at DEC-181, which is the mechanism the
   placeholder was standing in for.

   A decision case is an unusual entity. It is not a thing that happens to a
   customer; it is a piece of judgment held open until someone with the right
   authority closes it. That produces failure modes nothing else in the library
   has - the queue that fills with decisions a rule could have made, the
   approval that is used six months later against a target that has changed
   underneath it, the reviewer who decides something they were not authorized
   to decide and is never contradicted because the decision looks exactly like
   a valid one.

   So the chain here is longer than it looks, and each link is a real state:

     requested      someone needs an authorized judgment
     valid          it is a real case and a rule cannot already answer it
     assigned       an authority owns it
     under review   they are actually looking at it
     decided        they produced an outcome within their scope
     usable         the outcome is still valid, in time and in context
     executed       something in the world changed because of it

   Two of those gaps are where most implementations collapse. Assigned to under
   review is where SLA breaches actually live. Decided to executed is where a
   stale approval mutates state nobody authorized.

   And three outcomes that are not each other: rejected is a business result,
   more information required is a pause, and expired is an authorization that
   lapsed. Recording any of them as one of the others tells the requester
   something untrue about what happened to their request. */

export const DECISION_RULES: readonly OrchestrationRule[] = [
  {
    id: "DEC-R1",
    scope: "decision",
    rule: "Decision request, assignment, review, decision and execution are five separate states.",
    because:
      "Each is a different answer to 'where is my request'. A system that holds three of them under one label cannot tell a requester whether anyone has looked at it.",
  },
  {
    id: "DEC-R2",
    scope: "decision",
    rule: "Human review is for genuine judgment and authority, never as a substitute for a deterministic rule.",
    because:
      "A case opened because the system was uncertain puts a person in front of a rule that already had an answer, and the queue it builds is where the real decisions then wait.",
  },
  {
    id: "DEC-R3",
    scope: "decision",
    rule: "Reviewer assignment does not mean review has started.",
    because:
      "The gap between the two is where most SLA breaches actually live, and a status that reads as under review while nobody has opened it hides exactly that.",
  },
  {
    id: "DEC-R4",
    scope: "decision",
    rule: "Missing information pauses the review rather than implying rejection.",
    because:
      "The requester who is told no when the truth is not yet stops trying, and the case that could have been approved closes for a reason nobody decided.",
  },
  {
    id: "DEC-R5",
    scope: "decision",
    rule: "Approval, partial approval and rejection are three distinct outcomes.",
    because:
      "Partial approval collapsed into either of the others executes something unauthorized or refuses something that was allowed.",
  },
  {
    id: "DEC-R6",
    scope: "decision",
    rule: "An approval authorizes an action and is not evidence the action occurred.",
    because:
      "The same substitution OPS-R15 and REM-R16 forbid. Here the approved-but-never-executed case is invisible because the decision record looks complete.",
  },
  {
    id: "DEC-R7",
    scope: "decision",
    rule: "Approved actions are revalidated against the current target state before delayed execution.",
    because:
      "The approval was granted against the target as it was. Executing it against a target that has since changed applies an authorization to something nobody authorized.",
  },
  {
    id: "DEC-R8",
    scope: "decision",
    rule: "Decision scope stays explicit throughout.",
    because:
      "A decision whose reach is implicit gets stretched later, by people acting in good faith, to cover things the reviewer never considered.",
  },
  {
    id: "DEC-R9",
    scope: "decision",
    rule: "Partial approval executes only the approved scope.",
    because:
      "The rejected portion is a refusal a reviewer actually made. Executing it because it travelled in the same request overrides them silently.",
  },
  {
    id: "DEC-R10",
    scope: "decision",
    rule: "Approval validity can depend on time, target version, conditions or single-use semantics.",
    because:
      "Being inside the validity window is not enough when the approval was granted against a specific state, and a single-use approval used twice performs an action authorized once.",
  },
  {
    id: "DEC-R11",
    scope: "decision",
    rule: "An expired approval and a rejected request are different states.",
    because:
      "One was approved and lapsed; the other was refused. Telling the requester the wrong one changes whether they think reapplying is worth anything.",
  },
  {
    id: "DEC-R12",
    scope: "decision",
    rule: "Escalation changes decision authority and predetermines no outcome.",
    because:
      "Escalated reads as progress toward approval in most interfaces. It is a case still undecided, now in front of someone else.",
  },
  {
    id: "DEC-R13",
    scope: "decision",
    rule: "Reassignment and escalation preserve review history and the existing deadline.",
    because:
      "A reset clock rewards the delay, and a dropped history makes the next reviewer start from nothing while the requester waits through the same work twice.",
  },
  {
    id: "DEC-R14",
    scope: "decision",
    rule: "Rejection recovery, reapplication and appeal rights come from governing policy and are never invented.",
    because:
      "A right to appeal that does not exist becomes one people rely on the moment it is stated, and withdrawing it afterwards is worse than never offering it.",
  },
  {
    id: "DEC-R15",
    scope: "decision",
    rule: "Reopened decisions preserve previous decisions as historical facts.",
    because:
      "The only thing anyone ever needs from a decision record is what was decided, by whom, and on what basis. Editing it in place removes all three.",
  },
  {
    id: "DEC-R16",
    scope: "decision",
    rule: "An executed decision cannot be undone by changing the decision record; corrective side effects need their own lifecycle.",
    because:
      "The money moved, the access was granted, the thing was shipped. Reversing the record leaves those in place and removes the explanation for them.",
  },
  {
    id: "DEC-R17",
    scope: "decision",
    rule: "Decision execution reuses the existing canonical mechanisms for payments, access, fulfillment, entitlement and account changes.",
    because:
      "An approval flow that implements its own provisioning or its own payment will drift from the lifecycle that owns it, and the drift is discovered as an inconsistency nobody can date.",
  },
  {
    id: "DEC-R18",
    scope: "decision",
    rule: "Manual review never silently overrides a non-overridable policy constraint.",
    because:
      "Either the system refuses the approved action afterwards, which wastes the review, or it does not refuse it, which is worse.",
  },
  {
    id: "DEC-R19",
    scope: "decision",
    rule: "Duplicate decision cases over the same unresolved scope are suppressed or linked.",
    because:
      "Two cases over one scope produce two decisions, and if they differ nobody can say which one governs.",
  },
  {
    id: "DEC-R20",
    scope: "decision",
    rule: "Decision and review histories stay auditable.",
    because:
      "This is the category most likely to be questioned by a regulator, an auditor or a court, and each of them asks who decided, when, and on what they were looking at.",
  },
];

export const DECISION_JOURNEYS: readonly CanonicalJourney[] = [
  /* ------------------------------------------------------------ DEC-181 */
  {
    id: "DEC-181",
    slug: "decision-request",
    category: "decision",
    name: "Decision request → validate → route, reject or hold",
    purpose:
      "Establish that authorized judgment is genuinely required, and open a case whose scope is stated.",
    entity: {
      scope: "the decision request and the business entity it concerns",
      note: "One open case per unresolved decision scope. A second request over the same scope links to the first rather than opening a parallel judgment.",
    },
    distinctFrom: [
      {
        journey: "ACQ-02",
        because:
          "A submission journey qualifies something that arrived. This exists only where a deterministic rule cannot produce the answer and an authorized person must - which is why its first substantive check is whether policy could already decide it.",
      },
    ],
    entry: "t.required",
    nodes: [
      {
        id: "t.required",
        kind: "trigger",
        event: "authorized_decision_required",
        evidence: {
          requires: [
            "an action or state that cannot proceed without an authorized judgment being made about it",
          ],
          insufficientAlone: [
            "the system being unable to determine an outcome, which is often a missing rule rather than a decision",
            "a request being unusual, which is a reason to look at the rule rather than to convene a reviewer",
          ],
          source: "authoritative",
        },
        next: "a.capture",
      },
      {
        id: "a.capture",
        kind: "action",
        does: "Capture the request id, the decision type, the target entity, the requester, the requested action, the decision scope, the submission time, the authority the decision requires, and the supporting context",
        writes: [{ field: "decision_log", mode: "append" }],
        next: "c.duplicate",
      },
      {
        id: "c.duplicate",
        kind: "condition",
        asks: "Does an open decision case already cover this scope?",
        branches: [
          {
            label: "One is open",
            when: "an unresolved case covers the same target and the same decision scope",
            to: "a.link",
          },
          {
            label: "None",
            when: "no open case covers it",
            to: "c.valid",
          },
        ],
      },
      {
        id: "a.link",
        kind: "action",
        does: "Link this request to the existing case rather than opening a second. Two cases over one scope produce two decisions, and if they differ nobody can say which one governs - a state that is usually discovered when someone acts on the wrong one",
        writes: [{ field: "decision_log", mode: "append" }],
        next: "x.linked",
      },
      {
        id: "x.linked",
        kind: "exit",
        state: "linked to the open case; no second decision was opened",
        terminal: false,
        reEntry:
          "if that case closes with the scope still unresolved, a new request is assessed on its own terms rather than inheriting the closed one",
      },
      {
        id: "c.valid",
        kind: "condition",
        asks: "Is the request itself valid?",
        branches: [
          {
            label: "Valid",
            when: "the target exists, the requested action is real, and the requester may ask for it",
            to: "c.deterministic",
          },
          {
            label: "Invalid",
            when: "the target, the action or the requester's standing does not hold up",
            to: "a.invalid",
          },
        ],
      },
      {
        id: "a.invalid",
        kind: "action",
        does: "Record INVALID or REJECTED_FROM_PROCESS. This is a rejection by the process rather than by a reviewer, and the distinction is worth keeping because nobody exercised judgment - a requester told they were declined will ask who decided, and here the answer is nobody",
        writes: [{ field: "decision_log", mode: "append" }],
        next: "x.invalid",
      },
      {
        id: "x.invalid",
        kind: "exit",
        state: "rejected by the process; no judgment was exercised and no reviewer was involved",
        terminal: false,
        reEntry:
          "a corrected request is a new request rather than a continuation of this one",
      },
      {
        id: "c.deterministic",
        kind: "condition",
        asks: "Can deterministic policy already decide this?",
        branches: [
          {
            label: "Policy decides it",
            when: "a rule exists that produces the answer without judgment",
            to: "a.direct",
          },
          {
            label: "Judgment is genuinely required",
            when: "the outcome turns on authority, discretion or an assessment no rule encodes",
            to: "c.info",
          },
        ],
      },
      {
        id: "a.direct",
        kind: "action",
        does: "Record that no judgment is required and route to the canonical lifecycle that owns the action. A decision case created because the system was uncertain, rather than because judgment is genuinely needed, puts a person in front of a rule that already had an answer - and the queue it builds is exactly where the real decisions then wait",
        writes: [{ field: "decision_log", mode: "append" }],
        next: "h.direct",
      },
      {
        id: "h.direct",
        kind: "handoff",
        to: "external:operational-resolution",
        on: "an action a deterministic rule can decide without review",
        carries: [
          "the requested action and the rule that decides it",
          "the explicit fact that no decision case was opened, so nothing is waiting on a reviewer",
        ],
      },
      {
        id: "c.info",
        kind: "condition",
        asks: "Is required information missing before a case can be opened at all?",
        branches: [
          {
            label: "Complete",
            when: "everything needed to put a real question to a reviewer is present",
            to: "a.create",
          },
          {
            label: "Missing",
            when: "the request cannot yet be stated as a question anyone could answer",
            to: "a.pending-info",
          },
        ],
      },
      {
        id: "a.pending-info",
        kind: "action",
        does: "Record PENDING_INFORMATION, naming exactly what is missing. This happens before a case exists, so no reviewer has been handed something incomplete to look at and no review time is consumed by a request that was never askable",
        writes: [{ field: "decision_log", mode: "append" }],
        next: "w.info",
      },
      {
        id: "w.info",
        kind: "wait",
        until: ["the missing information arrives", "the request is withdrawn"],
        onEvent: "c.info-outcome",
        timeout: {
          after: "the window policy allows an unopened request to wait",
          reason:
            "a request that can never be stated is not a decision anyone can make, and holding it open indefinitely leaves the requester believing something is in progress",
        },
        onTimeout: "a.lapse",
        windowExtendsOnEngagement: false,
      },
      {
        id: "c.info-outcome",
        kind: "condition",
        asks: "How did the wait resolve?",
        branches: [
          {
            label: "Information arrived",
            when: "what was missing was supplied",
            to: "a.create",
          },
          {
            label: "Withdrawn",
            when: "the requester withdrew before supplying it",
            to: "a.lapse",
          },
        ],
      },
      {
        id: "a.lapse",
        kind: "action",
        does: "Record the request as lapsed before a case was opened. Nothing was decided, so this is not a rejection and should not be reported to the requester as one",
        writes: [{ field: "decision_log", mode: "append" }],
        next: "x.lapsed",
      },
      {
        id: "x.lapsed",
        kind: "exit",
        state: "lapsed before a case was opened; nothing was decided",
        terminal: false,
        reEntry:
          "the same request can be made again with the information present, and it is assessed fresh",
      },
      {
        id: "a.create",
        kind: "action",
        does: "Create the decision case with its scope stated explicitly - what is being decided, and what is not. A case whose scope is implicit produces a decision whose reach nobody can establish afterwards, and it will be stretched by people acting in good faith to cover things the reviewer never saw",
        writes: [{ field: "decision_log", mode: "append" }],
        next: "a.route",
      },
      {
        id: "a.route",
        kind: "action",
        does: "Determine the review route the decision type and the required authority imply, rather than the route that happens to be fastest",
        writes: [{ field: "decision_log", mode: "append" }],
        next: "h.assign",
      },
      {
        id: "h.assign",
        kind: "handoff",
        to: "DEC-182",
        on: "a valid decision case needing ownership",
        carries: [
          "the case, its explicit scope and the authority the decision requires",
          "the explicit fact that no review has started and no outcome is implied by the case existing",
        ],
      },
    ],
    guardrails: [
      "A request submitted is not a review started.",
      "No approval case is created merely because the system is uncertain, where deterministic policy can decide.",
      "The decision scope is explicit rather than inferred from the request.",
      "An open case over the same scope suppresses a second one.",
    ],
    reusableRule:
      "A decision workflow should exist only when an authorized judgment is genuinely required and the decision scope is clearly defined.",
  },

  /* ------------------------------------------------------------ DEC-182 */
  {
    id: "DEC-182",
    slug: "decision-assignment",
    category: "decision",
    name: "Decision case → assign reviewer → accept, reassign or escalate",
    purpose:
      "Put the case in front of someone who is actually authorized to decide it, and make that ownership explicit.",
    entity: {
      scope: "the decision case and the reviewer or authority holding it",
      note: "The deadline belongs to the case, not to the assignment. It survives every reassignment the case goes through.",
    },
    distinctFrom: [
      {
        journey: "DEC-189",
        because:
          "This moves ownership within the same authority level, because someone is unavailable, conflicted or too slow. Escalation moves it to a different or higher authority, because the current level cannot decide the question at all.",
      },
      {
        journey: "OWN-51",
        because:
          "OWN-51 routes work to whoever can do it. This routes a decision to whoever is authorized to make it - availability is not eligibility here, and a decision made by an unauthorized reviewer looks valid and is void.",
      },
    ],
    entry: "t.needs-owner",
    nodes: [
      {
        id: "t.needs-owner",
        kind: "trigger",
        event: "decision_case_requires_ownership",
        evidence: {
          requires: ["a valid decision case with a stated scope and a required authority level"],
          source: "authoritative",
        },
        next: "a.eligible",
      },
      {
        id: "a.eligible",
        kind: "action",
        does: "Determine the eligible reviewers or queue from the authority rules the decision type requires. Availability is not eligibility - routing to whoever is free produces a decision made by someone who was not authorized to make it, and it will look exactly like a valid one",
        next: "c.authority",
      },
      {
        id: "c.authority",
        kind: "condition",
        asks: "Does anyone with the required authority exist and is available?",
        branches: [
          {
            label: "Available",
            when: "an eligible reviewer at the required authority level can take it",
            to: "a.assign",
          },
          {
            label: "Nobody at that level",
            when: "the required authority is absent, exhausted or unavailable",
            to: "h.escalate",
          },
        ],
      },
      {
        id: "a.assign",
        kind: "action",
        does: "Record ASSIGNED with the reviewer, the authority basis for the assignment, and the case's deadline. Assigned is not reviewed - nothing has been looked at, and a status reading otherwise conceals the gap where most SLA breaches actually happen",
        writes: [{ field: "decision_log", mode: "append" }],
        next: "w.accept",
      },
      {
        id: "w.accept",
        kind: "wait",
        until: [
          "the reviewer accepts ownership",
          "the reviewer declines, is unavailable, is ineligible or is conflicted",
          "the decision case is withdrawn",
        ],
        onEvent: "c.accept",
        timeout: {
          after: "the assignment SLA",
          reason:
            "an assignment nobody accepted is a case nobody owns, and it will sit at the top of a queue looking assigned for as long as the SLA is not enforced",
        },
        onTimeout: "a.sla",
        windowExtendsOnEngagement: false,
      },
      {
        id: "c.accept",
        kind: "condition",
        asks: "What happened to the assignment?",
        branches: [
          {
            label: "Accepted",
            when: "the reviewer took ownership of the case",
            to: "a.ready",
          },
          {
            label: "Declined or ineligible",
            when: "the reviewer cannot or should not hold it",
            to: "c.reassign",
          },
          {
            label: "The case was withdrawn",
            when: "the decision is no longer required",
            to: "a.withdrawn",
          },
        ],
      },
      {
        id: "a.withdrawn",
        kind: "action",
        does: "Record the case as withdrawn before review, and release the assignment. Nothing was decided and no reviewer time was spent",
        writes: [{ field: "decision_log", mode: "append" }],
        next: "x.withdrawn",
      },
      {
        id: "x.withdrawn",
        kind: "exit",
        state: "withdrawn before review; no decision exists",
        terminal: false,
        reEntry:
          "a renewed need for the same judgment is a new request rather than a revival of this assignment",
      },
      {
        id: "a.sla",
        kind: "action",
        does: "Record the assignment SLA as exceeded, with how long it has sat unaccepted. The case's own deadline is untouched by this - what is late is the acceptance, and the decision was always due when it was due",
        writes: [{ field: "decision_log", mode: "append" }],
        next: "c.reassign",
      },
      {
        id: "c.reassign",
        kind: "condition",
        asks: "Is another reviewer with the required authority available?",
        branches: [
          {
            label: "Another eligible reviewer, within the reassignment budget",
            when: "someone else at the required authority level can take it and the case has not exhausted its reassignment rounds",
            to: "a.reassign",
          },
          {
            label: "None left, or the budget is exhausted",
            when: "no eligible reviewer remains, or the case has been passed around as many times as the model permits",
            to: "h.escalate",
          },
        ],
      },
      {
        id: "a.reassign",
        kind: "action",
        does: "Reassign, preserving the original deadline and everything already recorded on the case. A reassignment that resets the clock rewards the delay, and one that drops the history makes the next reviewer start from nothing while the requester waits through the same work a second time",
        writes: [{ field: "decision_log", mode: "append" }],
        next: "w.accept",
      },
      {
        id: "a.ready",
        kind: "action",
        does: "Record REVIEW_READY with the accepting reviewer. The case has an owner who has agreed to it, which is the first point at which anyone can be said to be responsible for the outcome",
        writes: [{ field: "decision_log", mode: "append" }],
        next: "h.review",
      },
      {
        id: "h.review",
        kind: "handoff",
        to: "DEC-183",
        on: "a decision case with an accepted owner",
        carries: [
          "the case, its scope, its evidence and the deadline that has travelled with it",
          "the explicit fact that ownership is not review - the state changes again when work actually starts",
        ],
      },
      {
        id: "h.escalate",
        kind: "handoff",
        to: "DEC-189",
        on: "a case the required authority level cannot take",
        carries: [
          "the case, every assignment attempted and why each failed",
          "the original deadline, which the escalation preserves rather than restarts",
        ],
      },
    ],
    guardrails: [
      "Assigned is not reviewed.",
      "Routing follows authority requirements rather than convenience.",
      "Reassignment preserves the original deadline and the review history.",
      "Reassignment is bounded rather than repeated until someone happens to accept.",
    ],
    reusableRule:
      "Review ownership should be assigned to an actor with the authority and context required to make the requested decision.",
  },

  /* ------------------------------------------------------------ DEC-183 */
  {
    id: "DEC-183",
    slug: "decision-review",
    category: "decision",
    name: "Review started → evaluate evidence → decide or request more information",
    purpose:
      "Turn sufficient evidence into an authorized decision, within the scope the reviewer actually holds.",
    entity: {
      scope: "the decision case and this instance of review against it",
      note: "A case can have several review instances across reassignments and reopenings. Each is recorded; none replaces the last.",
    },
    distinctFrom: [
      {
        journey: "IDN-84",
        because:
          "IDN-84 recovers from a verification that failed - a mechanical outcome with retry and remediation routes. This is a person exercising judgment against criteria, where the failure mode is deciding outside your authority rather than failing a check.",
      },
    ],
    entry: "t.begins",
    nodes: [
      {
        id: "t.begins",
        kind: "trigger",
        event: "authorized_review_begins",
        evidence: {
          requires: ["an authorized reviewer beginning work on an owned decision case"],
          insufficientAlone: [
            "a case being assigned, which puts it in front of someone and starts nothing",
            "a case being opened in an interface, where the booking of the state is what matters rather than the page view",
          ],
          source: "authoritative",
        },
        next: "a.state",
      },
      {
        id: "a.state",
        kind: "action",
        does: "Record UNDER_REVIEW with who is reviewing and when it started. Assigned and under review are different states, and the gap between them is where most SLA breaches actually live",
        writes: [{ field: "decision_log", mode: "append" }],
        next: "a.evaluate",
      },
      {
        id: "a.evaluate",
        kind: "action",
        does: "Evaluate the available authoritative evidence against the criteria that apply. What is evaluated is evidence - an absent document is absent, and a reviewer's sense of what it probably said is not a substitute for it",
        writes: [{ field: "decision_log", mode: "append" }],
        next: "c.conflict",
      },
      {
        id: "c.conflict",
        kind: "condition",
        asks: "Is this reviewer actually valid for this case?",
        branches: [
          {
            label: "Valid",
            when: "no conflict of interest and no eligibility problem",
            to: "c.authority",
          },
          {
            label: "Conflicted or ineligible",
            when: "a conflict or eligibility problem surfaces during the review itself",
            to: "a.step-back",
          },
        ],
      },
      {
        id: "a.step-back",
        kind: "action",
        does: "Record the conflict and step back without deciding. A decision made by a conflicted reviewer is worse than no decision, because it looks like one and will be relied on",
        writes: [{ field: "decision_log", mode: "append" }],
        next: "h.reassign",
      },
      {
        id: "h.reassign",
        kind: "handoff",
        to: "DEC-182",
        on: "a conflict or eligibility problem found mid-review",
        carries: [
          "the case, the evidence gathered so far and the reason this reviewer stepped back",
          "the original deadline, and the explicit fact that no decision was made",
        ],
      },
      {
        id: "c.authority",
        kind: "condition",
        asks: "Is this decision within the reviewer's authorized scope?",
        branches: [
          {
            label: "Within scope",
            when: "the reviewer holds the authority the decision requires",
            to: "c.hard-policy",
          },
          {
            label: "Beyond it",
            when: "the decision needs an authority level or a discretion this reviewer does not hold",
            to: "h.escalate",
          },
        ],
      },
      {
        id: "h.escalate",
        kind: "handoff",
        to: "DEC-189",
        on: "a decision requiring authority the current reviewer does not hold",
        carries: [
          "the evidence and the assessment reached so far, which the escalation preserves",
          "the specific authority the decision requires, so the escalation goes somewhere rather than upward in general",
        ],
      },
      {
        id: "c.hard-policy",
        kind: "condition",
        asks: "Does a non-overridable policy constraint bear on this decision?",
        branches: [
          {
            label: "It does, with no exception authority",
            when: "a hard constraint applies and this reviewer cannot set it aside",
            to: "a.constrained",
          },
          {
            label: "It does, and explicit exception authority exists",
            when: "the reviewer holds a defined authority to grant an exception to it",
            to: "a.exception",
          },
          {
            label: "No hard constraint applies",
            when: "the decision is a judgment within ordinary criteria",
            to: "c.evidence",
          },
        ],
      },
      {
        id: "a.constrained",
        kind: "action",
        does: "Record that the decision is constrained by a policy this reviewer cannot override, and decide within it. Manual review that silently overrides a hard constraint produces an approved action the system will later refuse - wasting the review - or will not refuse, which is worse",
        writes: [{ field: "decision_log", mode: "append" }],
        next: "c.evidence",
      },
      {
        id: "a.exception",
        kind: "action",
        does: "Record the exception being exercised, the authority for it and the constraint it displaces. An exception exercised without being named is indistinguishable from the constraint not existing, and the next person to look will conclude it never did",
        writes: [{ field: "decision_log", mode: "append" }],
        next: "c.evidence",
      },
      {
        id: "c.evidence",
        kind: "condition",
        asks: "Is the evidence sufficient to decide?",
        branches: [
          {
            label: "Sufficient",
            when: "everything the criteria require is present and assessable",
            to: "a.decide",
          },
          {
            label: "Something required is missing",
            when: "a fact the decision turns on is not available",
            to: "h.info",
          },
        ],
      },
      {
        id: "h.info",
        kind: "handoff",
        to: "DEC-184",
        on: "a review blocked by missing evidence",
        carries: [
          "the exact requirement the decision turns on, and why",
          "everything the review has already established, which is preserved rather than discarded",
        ],
      },
      {
        id: "a.decide",
        kind: "action",
        does: "Produce the authorized decision within the case's stated scope - approved, rejected, partially approved, or another explicitly defined outcome. The decision records what it covers, because a decision whose reach is implicit is stretched later by people who were not in the room",
        writes: [{ field: "decision_log", mode: "append" }],
        next: "c.outcome",
      },
      {
        id: "c.outcome",
        kind: "condition",
        asks: "What was decided?",
        branches: [
          {
            label: "Approved",
            when: "the whole requested scope was authorized",
            to: "h.approved",
          },
          {
            label: "Partially approved",
            when: "part of the requested scope was authorized and part was not",
            to: "h.partial",
          },
          {
            label: "Rejected",
            when: "the requested action was refused",
            to: "h.rejected",
          },
        ],
      },
      {
        id: "h.approved",
        kind: "handoff",
        to: "DEC-185",
        on: "an approved decision",
        carries: [
          "the decision, its maker, its scope, its conditions and its validity where one applies",
          "the explicit fact that approving authorizes an action and performs none of it",
        ],
      },
      {
        id: "h.partial",
        kind: "handoff",
        to: "DEC-187",
        on: "a partially approved decision",
        carries: [
          "which scope was approved and which was refused, separately and explicitly",
          "the basis for each, so the partition can be explained rather than reconstructed",
        ],
      },
      {
        id: "h.rejected",
        kind: "handoff",
        to: "DEC-186",
        on: "a rejected decision",
        carries: [
          "the reason and its category, the maker, the time and the affected scope",
          "the explicit fact that this is an authorized business outcome rather than a failure",
        ],
      },
    ],
    guardrails: [
      "A review started is not an approval.",
      "Missing evidence is never invented or assumed.",
      "A reviewer decides only within their authorized scope.",
      "Manual review never silently overrides a hard policy constraint without explicit exception authority.",
    ],
    reusableRule:
      "Human review converts sufficient evidence into an authorized decision while unresolved evidence remains an explicit information requirement.",
  },

  /* ------------------------------------------------------------ DEC-184 */
  {
    id: "DEC-184",
    slug: "information-requirement",
    category: "decision",
    name: "More information required → collect → revalidate → resume review",
    purpose:
      "Pause a decision for the fact it is actually missing, without losing the review already done.",
    entity: {
      scope: "the decision case and the specific information requirement blocking it",
      note: "The requirement is the evidence this decision turns on. It is not a general data-completeness exercise, and nothing unrelated is collected alongside it.",
    },
    distinctFrom: [
      {
        journey: "FBK-49",
        because:
          "FBK-49 resolves missing data blocking a process generally. This is evidence a named reviewer needs to answer a specific open question - it is scoped by the decision rather than by the record, and it ends by resuming a review rather than by unblocking a pipeline.",
      },
    ],
    entry: "t.identified",
    nodes: [
      {
        id: "t.identified",
        kind: "trigger",
        event: "information_requirement_identified",
        evidence: {
          requires: [
            "a reviewer identifying a specific fact the decision turns on and which is not available",
          ],
          source: "authoritative",
        },
        next: "a.specify",
      },
      {
        id: "a.specify",
        kind: "action",
        does: "Specify the exact requirement - which fact, which document, from whom, and why the decision needs it. A vague request produces a vague answer and a second round; and asking for unrelated things in case they help turns one gap into a questionnaire, which is how a two-day case becomes a three-week one",
        writes: [{ field: "decision_log", mode: "append" }],
        next: "a.state",
      },
      {
        id: "a.state",
        kind: "action",
        does: "Record AWAITING_INFORMATION and preserve everything the review has already established. The case is paused rather than reset - more information required is not a rejection, and a reviewer returning to it should not be starting again from the beginning",
        writes: [{ field: "decision_log", mode: "append" }],
        next: "a.request",
      },
      {
        id: "a.request",
        kind: "action",
        does: "Request the information from the source that actually holds it, which is not always the requester - asking a customer for something an internal system already has is the most common version of this failure",
        writes: [{ field: "decision_log", mode: "append" }],
        next: "w.info",
      },
      {
        id: "w.info",
        kind: "wait",
        until: [
          "the information is received",
          "the request is withdrawn or the decision is no longer required",
        ],
        onEvent: "c.received",
        timeout: {
          after: "the deadline policy defines for this requirement",
          reason:
            "a case awaiting information indefinitely is a decision nobody will ever make, and the requester is left believing it is progressing",
        },
        onTimeout: "a.deadline",
        windowExtendsOnEngagement: false,
      },
      {
        id: "c.received",
        kind: "condition",
        asks: "How did the wait resolve?",
        branches: [
          {
            label: "Information arrived",
            when: "something was supplied against the requirement",
            to: "a.validate",
          },
          {
            label: "The decision is no longer required",
            when: "the request was withdrawn or the thing it was about no longer exists",
            to: "a.moot",
          },
        ],
      },
      {
        id: "a.moot",
        kind: "action",
        does: "Record the case as no longer requiring a decision, with the reason. This is not a rejection and not an approval, and reporting it as either tells the requester something untrue about what happened",
        writes: [{ field: "decision_log", mode: "append" }],
        next: "x.moot",
      },
      {
        id: "x.moot",
        kind: "exit",
        state: "no longer requiring a decision; the review history stands unclosed rather than concluded",
        terminal: false,
        reEntry:
          "a renewed need for the same judgment is a new request, which can reference this case and its evidence",
      },
      {
        id: "a.validate",
        kind: "action",
        does: "Validate what arrived for relevance and completeness against the stated requirement. Something arriving is not the requirement being met - a document of the right type saying the wrong thing satisfies a checklist and not a decision",
        next: "c.complete",
      },
      {
        id: "c.complete",
        kind: "condition",
        asks: "Does what arrived satisfy the requirement?",
        branches: [
          {
            label: "It does",
            when: "the requirement is met, relevantly and completely",
            to: "h.resume",
          },
          {
            label: "Partly",
            when: "some of the requirement is met and some is not",
            to: "c.further",
          },
        ],
      },
      {
        id: "c.further",
        kind: "condition",
        asks: "Does policy allow requesting the remainder?",
        branches: [
          {
            label: "It does, within the request budget",
            when: "further rounds are permitted and the case has not used them all",
            to: "a.request-remaining",
          },
          {
            label: "It does not, or the budget is exhausted",
            when: "no further round is permitted, or the case has already been round-tripped as often as the model allows",
            to: "h.resume",
          },
        ],
      },
      {
        id: "a.request-remaining",
        kind: "action",
        does: "Request only the part that is still outstanding, naming it precisely. Re-requesting the whole requirement asks the requester for things they have already given, which reads as the first submission having been ignored",
        writes: [{ field: "decision_log", mode: "append" }],
        next: "w.info",
      },
      {
        id: "a.deadline",
        kind: "action",
        does: "Apply the timeout semantics policy defines - escalation, closure, or a decision on the evidence available. Which one applies comes from policy: a case that quietly closes because nobody answered is a rejection nobody made, and a case that quietly proceeds is a decision made on evidence somebody knew was incomplete",
        writes: [{ field: "decision_log", mode: "append" }],
        next: "c.timeout",
      },
      {
        id: "c.timeout",
        kind: "condition",
        asks: "What does policy define for an expired information deadline?",
        branches: [
          {
            label: "Decide on what is available",
            when: "policy permits deciding on the evidence in hand, with the gap recorded as a gap",
            to: "h.resume",
          },
          {
            label: "Close the case",
            when: "policy explicitly closes an unanswered case, with defined semantics for doing so",
            to: "a.close",
          },
          {
            label: "Escalate, or policy does not define it",
            when: "policy escalates - or says nothing, in which case no closure semantics are invented here",
            to: "h.escalate",
          },
        ],
      },
      {
        id: "a.close",
        kind: "action",
        does: "Close the case under the semantics policy actually states, recording that it closed for want of information rather than on its merits",
        writes: [{ field: "decision_log", mode: "append" }],
        next: "x.closed-noinfo",
      },
      {
        id: "x.closed-noinfo",
        kind: "exit",
        state: "closed for want of information; no decision was made on the merits",
        terminal: false,
        reEntry:
          "a new request with the information present is assessed fresh, and this closure does not count against it",
      },
      {
        id: "h.escalate",
        kind: "handoff",
        to: "DEC-189",
        on: "an information deadline expiring with escalation or with no defined closure semantics",
        carries: [
          "the requirement, what was and was not supplied, and the review already done",
          "the explicit fact that no closure or rejection was invented to end the case",
        ],
      },
      {
        id: "h.resume",
        kind: "handoff",
        to: "DEC-183",
        on: "an information requirement resolved, or exhausted under policy",
        carries: [
          "what was supplied and what remains missing, stated as a gap rather than smoothed over",
          "the full prior review history, so the reviewer continues rather than restarts",
        ],
      },
    ],
    guardrails: [
      "More information required is not rejected.",
      "The review history is never reset when information arrives.",
      "Unrelated information is not requested alongside the requirement.",
      "Deadline behaviour comes from policy rather than from a default closure.",
    ],
    reusableRule:
      "Missing information pauses the decision while preserving the existing case so review can resume when the defined evidence requirement is satisfied.",
  },

  /* ------------------------------------------------------------ DEC-185 */
  {
    id: "DEC-185",
    slug: "approval-execution",
    category: "decision",
    name: "Approval decision → revalidate target → execute, hold or invalidate",
    purpose:
      "Carry an authorization into execution, having checked it still applies to what it was granted against.",
    entity: {
      scope: "the approved decision and the target action it authorizes",
      note: "The approval and the action are two things. The approval is complete the moment it is made; the action has not started.",
    },
    distinctFrom: [
      {
        journey: "DEC-187",
        because:
          "This carries a whole authorized scope into execution. DEC-187 exists because a partitioned scope raises a separate problem - which parts may proceed, and whether the action can be half-done at all.",
      },
    ],
    entry: "t.approved",
    nodes: [
      {
        id: "t.approved",
        kind: "trigger",
        event: "decision_approved",
        evidence: {
          requires: ["an authorized approval decision covering a stated scope"],
          source: "authoritative",
        },
        next: "a.record",
      },
      {
        id: "a.record",
        kind: "action",
        does: "Record the decision, the decision maker, the scope, the time, any conditions attached, and the validity or effective period where one applies. Approved is an authorization - it is not an event that has happened to the target, and the two are recorded as different things",
        writes: [{ field: "decision_log", mode: "append" }],
        next: "c.timing",
      },
      {
        id: "c.timing",
        kind: "condition",
        asks: "Is the approved action being executed now?",
        branches: [
          {
            label: "Now",
            when: "execution follows the decision immediately",
            to: "a.revalidate",
          },
          {
            label: "Later",
            when: "the approval will be used at some later point, or carries a validity period",
            to: "h.validity",
          },
        ],
      },
      {
        id: "h.validity",
        kind: "handoff",
        to: "DEC-188",
        on: "an approval that will be used later than it was granted",
        carries: [
          "the approval, its scope, its conditions and the target version it was granted against",
          "the explicit fact that the gap between decision and use is where a stale approval mutates state nobody authorized",
        ],
      },
      {
        id: "a.revalidate",
        kind: "action",
        does: "Re-read the target's current state before executing. The approval was granted against the target as it was; executing it against a target that has since changed applies an authorization to something nobody authorized, and the reviewer will be named as having approved it",
        next: "c.target",
      },
      {
        id: "c.target",
        kind: "condition",
        asks: "Is the target still what was approved?",
        branches: [
          {
            label: "Unchanged in any material way",
            when: "nothing the approval turned on has moved",
            to: "c.conditions",
          },
          {
            label: "Materially changed",
            when: "something the decision depended on is different",
            to: "c.semantics",
          },
        ],
      },
      {
        id: "c.semantics",
        kind: "condition",
        asks: "What do the decision's own semantics require for a changed target?",
        branches: [
          {
            label: "Hold pending re-review",
            when: "the change is material and the semantics send it back rather than voiding it",
            to: "a.hold",
          },
          {
            label: "Invalidate",
            when: "the semantics void the approval once its basis moves",
            to: "a.invalidate",
          },
          {
            label: "The change is inside what was approved",
            when: "the approval's scope explicitly contemplated variation of this kind",
            to: "c.conditions",
          },
        ],
      },
      {
        id: "a.hold",
        kind: "action",
        does: "Hold execution and record what changed. Nothing is executed on an approval whose basis has moved, and nothing is voided either - which of the two applies is a judgment, and it goes back to one",
        writes: [{ field: "decision_log", mode: "append" }],
        next: "h.re-review",
      },
      {
        id: "h.re-review",
        kind: "handoff",
        to: "DEC-190",
        on: "an approval whose target changed materially before execution",
        carries: [
          "the original decision, preserved, and exactly what has changed since",
          "the explicit fact that nothing was executed and the original approval was not edited",
        ],
      },
      {
        id: "a.invalidate",
        kind: "action",
        does: "Record the approval as invalidated by the change in its basis, preserving the decision itself. It was validly made and its subject no longer exists in the form it was made about",
        writes: [{ field: "decision_log", mode: "append" }],
        next: "x.invalidated",
      },
      {
        id: "x.invalidated",
        kind: "exit",
        state: "approval invalidated by a changed target; the decision record stands unedited",
        terminal: false,
        reEntry:
          "the action, if still wanted, needs a new decision against the target as it now is. This is not the request having been rejected",
      },
      {
        id: "c.conditions",
        kind: "condition",
        asks: "Does the approval carry conditions that must be satisfied before execution?",
        branches: [
          {
            label: "Conditions apply",
            when: "the approval was granted subject to something happening first",
            to: "c.satisfied",
          },
          {
            label: "Unconditional",
            when: "nothing stands between the approval and the action",
            to: "h.execute",
          },
        ],
      },
      {
        id: "c.satisfied",
        kind: "condition",
        asks: "Are the conditions satisfied?",
        branches: [
          {
            label: "Satisfied",
            when: "every condition attached to the approval is authoritatively met",
            to: "h.execute",
          },
          {
            label: "Not yet",
            when: "at least one condition is outstanding",
            to: "a.await",
          },
        ],
      },
      {
        id: "a.await",
        kind: "action",
        does: "Record the approval as authorized and not yet executable, naming the outstanding condition. A conditional approval treated as an unconditional one executes an action the reviewer explicitly qualified",
        writes: [{ field: "decision_log", mode: "append" }],
        next: "w.conditions",
      },
      {
        id: "w.conditions",
        kind: "wait",
        until: ["every attached condition is satisfied"],
        onEvent: "h.execute",
        timeout: {
          after: "the approval's validity period, or the bounded window policy allows a conditional approval to stand",
          reason:
            "an approval waiting indefinitely on a condition that never arrives is an authorization with no expiry that nobody decided to grant",
        },
        onTimeout: "a.expire-unused",
        windowExtendsOnEngagement: false,
      },
      {
        id: "a.expire-unused",
        kind: "action",
        does: "Record the approval as expired before its conditions were met. This is not the request having been rejected - it was approved, and the window closed while it waited",
        writes: [{ field: "decision_log", mode: "append" }],
        next: "x.expired",
      },
      {
        id: "x.expired",
        kind: "exit",
        state: "APPROVAL_EXPIRED before execution; the approval stands in the record as having been granted",
        terminal: false,
        reEntry:
          "a fresh decision request can be made against the current target. The requester is told the approval lapsed rather than that they were refused",
      },
      {
        id: "h.execute",
        kind: "handoff",
        to: "external:operational-resolution",
        on: "an approval that is valid, in scope and unconditional or satisfied",
        carries: [
          "the exact authorized scope, and the canonical lifecycle that owns the action - the payment, the access grant, the fulfillment, the entitlement change or the account change",
          "the explicit instruction that the approval does not replace that lifecycle's own validation, and that execution is not complete until that lifecycle says it is",
        ],
      },
    ],
    guardrails: [
      "Approved is not executed.",
      "An approval never bypasses the execution lifecycle's own validation.",
      "An approval applies only to the scope it defined.",
      "A stale approval never mutates newer incompatible state.",
    ],
    reusableRule:
      "Approval authorizes a defined action but execution must still confirm that the approved action remains valid against current state.",
  },

  /* ------------------------------------------------------------ DEC-186 */
  {
    id: "DEC-186",
    slug: "rejection-outcome",
    category: "decision",
    name: "Rejection decision → record reason → remediate, close or reapply",
    purpose:
      "Treat a refusal as the business outcome it is, and say what if anything the requester can do next.",
    entity: {
      scope: "the decision case and the rejection issued against it",
      note: "A rejection closes a decision, not a relationship. What follows it comes from policy rather than from how final the word sounds.",
    },
    distinctFrom: [
      {
        journey: "FBK-47",
        because:
          "This is the first decision's rejection outcome. FBK-47 is the appeal or reconsideration lifecycle, which exists only where policy grants that right - and this journey hands to it rather than performing it.",
      },
      {
        journey: "OWN-59",
        because:
          "OWN-59 handles an approval rejected inside a work-ownership flow and asks whether a revision may be resubmitted. This is the decision-case rejection with its full reason taxonomy, and its three separate exits: correctable, reapplicable, and appealable.",
      },
    ],
    entry: "t.rejected",
    nodes: [
      {
        id: "t.rejected",
        kind: "trigger",
        event: "authorized_rejection_issued",
        evidence: {
          requires: ["an authorized rejection decision on a decision case, within the reviewer's scope"],
          insufficientAlone: [
            "a technical failure to process the request, which is an error rather than a decision and belongs in a different queue",
          ],
          source: "authoritative",
        },
        next: "a.record",
      },
      {
        id: "a.record",
        kind: "action",
        does: "Record the reason and its category, the decision maker, the time, the affected scope, and the reapplication or remediation semantics where they are defined. A rejection is an authorized business outcome rather than a technical failure - recording it as an error puts it in the wrong queue, where something will eventually retry it",
        writes: [{ field: "decision_log", mode: "append" }],
        next: "c.correctable",
      },
      {
        id: "c.correctable",
        kind: "condition",
        asks: "Is the reason something the requester can correct?",
        branches: [
          {
            label: "Correctable, with a defined remediation path",
            when: "policy states what would have to change and permits the case to proceed on that basis",
            to: "a.remediate",
          },
          {
            label: "Not correctable this way",
            when: "the reason is not something a correction addresses, or no remediation path is defined",
            to: "c.reapply",
          },
        ],
      },
      {
        id: "a.remediate",
        kind: "action",
        does: "State exactly what would have to change, drawn from the policy that defines the path. A rejection reason that is not actionable is a refusal, and telling someone their request was declined without saying what would change that is where most escalations come from",
        writes: [{ field: "decision_log", mode: "append" }],
        next: "x.remediable",
      },
      {
        id: "x.remediable",
        kind: "exit",
        state: "rejected, with a defined remediation path stated",
        terminal: false,
        reEntry:
          "the requester satisfying the stated condition opens a new decision request linked to this one, so the reviewer sees what was refused and why",
      },
      {
        id: "c.reapply",
        kind: "condition",
        asks: "Does policy permit a new request once the requirements are satisfied?",
        branches: [
          {
            label: "It does",
            when: "policy defines when and on what basis a new request may be made",
            to: "a.reapply-allowed",
          },
          {
            label: "It does not, or says nothing",
            when: "no reapplication right is defined",
            to: "c.appeal",
          },
        ],
      },
      {
        id: "a.reapply-allowed",
        kind: "action",
        does: "Record the reapplication conditions policy actually defines - after what period, on what basis, with what evidence. Nothing is invented here: a right to reapply that does not exist becomes one people rely on the moment it is stated, and withdrawing it later is worse than never offering it",
        writes: [{ field: "decision_log", mode: "append" }],
        next: "x.reapply",
      },
      {
        id: "x.reapply",
        kind: "exit",
        state: "rejected, with a defined reapplication right",
        terminal: false,
        reEntry:
          "a new request under those conditions is a new decision case, linked to this one. Nothing resubmits automatically - an automatic resubmission either loops or hides the rejection from whoever needed to see it",
      },
      {
        id: "c.appeal",
        kind: "condition",
        asks: "Does policy grant an appeal or reconsideration right?",
        branches: [
          {
            label: "It does",
            when: "a defined appeal or reconsideration mechanism covers this decision",
            to: "h.appeal",
          },
          {
            label: "It does not",
            when: "no appeal right is defined for this kind of decision",
            to: "a.close",
          },
        ],
      },
      {
        id: "h.appeal",
        kind: "handoff",
        to: "FBK-47",
        on: "a rejection policy grants an appeal right against",
        carries: [
          "the decision, its reason, its maker and the evidence it was made on",
          "the explicit fact that the appeal reviews the decision and does not re-run it as a fresh request",
        ],
      },
      {
        id: "a.close",
        kind: "action",
        does: "Record CLOSED_REJECTED with the full reason. The request is not resubmitted automatically and the rejection history stays readable - it is the answer to why this was refused, and it will be asked for",
        writes: [{ field: "decision_log", mode: "append" }],
        next: "x.closed",
      },
      {
        id: "x.closed",
        kind: "exit",
        state: "CLOSED_REJECTED; a terminal authorized outcome with no defined path onward",
        terminal: false,
        reEntry:
          "a materially different request is a different case. Repeating the same one changes nothing and is not treated as new",
      },
    ],
    guardrails: [
      "Rejected is not a system failure.",
      "Rejected requests are never automatically resubmitted.",
      "Appeal and reapplication rights are never invented.",
      "The rejection history remains auditable.",
    ],
    reusableRule:
      "A rejection is an authorized business outcome whose next path depends on whether policy permits correction, reapplication or appeal.",
  },

  /* ------------------------------------------------------------ DEC-187 */
  {
    id: "DEC-187",
    slug: "partial-approval",
    category: "decision",
    name: "Partial approval → split scope → execute approved, resolve remaining",
    purpose:
      "Make the authorized and unauthorized halves of one request explicit, so only the first can move.",
    entity: {
      scope: "the decision case and the partitions of its requested scope",
      note: "Every part of the original scope lands in exactly one partition. A part in none of them is a piece of the request nobody answered and nobody will notice.",
    },
    distinctFrom: [
      {
        journey: "DEC-185",
        because:
          "DEC-185 executes an authorization whose scope is whole. This has to partition a scope first, and then answer a question DEC-185 never faces: whether the action can be half-done at all.",
      },
    ],
    entry: "t.partial",
    nodes: [
      {
        id: "t.partial",
        kind: "trigger",
        event: "decision_partially_approved",
        evidence: {
          requires: ["an authorized decision approving part of a requested scope and not the rest"],
          source: "authoritative",
        },
        next: "a.partition",
      },
      {
        id: "a.partition",
        kind: "action",
        does: "Partition the originally requested scope into what is approved, what is rejected, and what remains pending or needs further review. Every part of the original lands in exactly one - a part in none of them is a piece of the request nobody answered, and the requester finds out by it silently not happening",
        writes: [{ field: "decision_log", mode: "append" }],
        next: "a.basis",
      },
      {
        id: "a.basis",
        kind: "action",
        does: "Persist the decision basis for each partition separately. Approved with exceptions, recorded as a single note, cannot tell anyone six months later which exception applied to what - and that is exactly the question an audit of a partial approval asks",
        writes: [{ field: "decision_log", mode: "append" }],
        next: "c.remaining",
      },
      {
        id: "c.remaining",
        kind: "condition",
        asks: "Is any scope still unresolved rather than decided either way?",
        branches: [
          {
            label: "Some remains open",
            when: "part of the scope needs further review or further evidence",
            to: "a.keep-active",
          },
          {
            label: "Everything is decided",
            when: "each part is either approved or rejected",
            to: "c.atomicity",
          },
        ],
      },
      {
        id: "a.keep-active",
        kind: "action",
        does: "Keep the unresolved scope active as a live decision case rather than closing it with the rest. Closing a partially approved request as decided leaves the unanswered portion invisible, and the requester assumes it was refused - which is a rejection nobody made and nobody can explain",
        writes: [{ field: "decision_log", mode: "append" }],
        next: "c.atomicity",
      },
      {
        id: "c.atomicity",
        kind: "condition",
        asks: "Do the governing semantics permit the approved scope to proceed on its own?",
        branches: [
          {
            label: "Separable",
            when: "the action's semantics explicitly allow partial execution",
            to: "c.shared",
          },
          {
            label: "Atomic",
            when: "the action's semantics require all of it or none",
            to: "a.hold-all",
          },
          {
            label: "Atomicity is not defined",
            when: "nothing authoritative says whether this action can be half-done",
            to: "h.undefined",
          },
        ],
      },
      {
        id: "h.undefined",
        kind: "handoff",
        to: "DEC-189",
        on: "a partial approval against an action with no defined atomicity",
        carries: [
          "the partitions and the action they would apply to",
          "the explicit fact that no atomicity was assumed - whether a thing can be half-done is a property of the thing, and guessing it is how half-provisioned accounts and partly fulfilled contracts appear",
        ],
      },
      {
        id: "a.hold-all",
        kind: "action",
        does: "Hold the entire action. Executing part of an atomic action produces a half-state the system has no name for, cannot report on, and cannot roll back cleanly",
        writes: [{ field: "decision_log", mode: "append" }],
        next: "x.held",
      },
      {
        id: "x.held",
        kind: "exit",
        state: "entire action held; the approved scope is authorized and unexecuted because the action cannot be split",
        terminal: false,
        reEntry:
          "when the remaining scope is decided, the whole action is re-evaluated as one rather than assembled from the parts that were approved at different times",
      },
      {
        id: "c.shared",
        kind: "condition",
        asks: "Does the approved scope share side effects with the rejected or pending scope?",
        branches: [
          {
            label: "It shares",
            when: "a charge, a provisioning step or a notification would otherwise run per partition",
            to: "a.dedupe",
          },
          {
            label: "Independent",
            when: "the approved scope's effects touch nothing the other partitions touch",
            to: "h.execute",
          },
        ],
      },
      {
        id: "a.dedupe",
        kind: "action",
        does: "Execute the shared side effect once, for the approved scope only. Splitting a request and running its shared effects per partition charges twice, provisions twice or notifies twice - and the duplicate is found by the recipient rather than by the split that caused it",
        writes: [{ field: "decision_log", mode: "append" }],
        next: "h.execute",
      },
      {
        id: "h.execute",
        kind: "handoff",
        to: "external:operational-resolution",
        on: "an approved partition that may proceed independently",
        carries: [
          "only the approved scope, stated explicitly, and the canonical lifecycle that owns the action",
          "the rejected scope, stated explicitly as something that must not be executed - a reviewer refused it, and it travelling in the same request is not authorization",
        ],
        suppresses: ["any execution touching the rejected or unresolved scope"],
      },
    ],
    guardrails: [
      "Partial approval is not full approval.",
      "The rejected scope is never executed.",
      "Shared side effects are not duplicated when the scope is split.",
      "Atomicity semantics are never invented.",
    ],
    reusableRule:
      "Partial approval should make the authorized and unauthorized portions explicit so only valid scope can proceed.",
  },

  /* ------------------------------------------------------------ DEC-188 */
  {
    id: "DEC-188",
    slug: "approval-validity",
    category: "decision",
    name: "Approval validity or expiry → revalidate → use, expire or renew review",
    purpose:
      "Answer, at the moment of use, whether an approval is still one - in time, in context and in count.",
    entity: {
      scope: "the approval decision and the boundaries it was granted within",
      note: "Validity is a question asked at each use rather than a flag set once. An approval valid this morning can be outside its context this afternoon without any clock having run out.",
    },
    entry: "t.validity",
    nodes: [
      {
        id: "t.validity",
        kind: "trigger",
        event: "approval_validity_evaluation_required",
        evidence: {
          requires: [
            "an approval carrying an explicit validity condition, or an approval being used later than it was granted",
          ],
          source: "authoritative",
        },
        next: "a.evaluate",
      },
      {
        id: "a.evaluate",
        kind: "action",
        does: "Evaluate the approval's scope, its valid-from and valid-until where those are defined, the target version or state it was granted against, its conditions, and whether a single-use approval has already been consumed",
        next: "c.expiry-defined",
      },
      {
        id: "c.expiry-defined",
        kind: "condition",
        asks: "Does this approval define an expiry?",
        branches: [
          {
            label: "It defines one",
            when: "a valid-until, a period or a use-by condition was set when it was granted",
            to: "c.time",
          },
          {
            label: "It does not",
            when: "the approval was granted without a time limit",
            to: "a.no-expiry",
          },
        ],
      },
      {
        id: "a.no-expiry",
        kind: "action",
        does: "Record that this approval carries no expiry, rather than assigning one. Inventing an expiry invalidates authorizations that were granted without limit, and the holder discovers it when the thing they were approved for stops working with no decision behind it",
        next: "c.consumed",
      },
      {
        id: "c.time",
        kind: "condition",
        asks: "Is it inside its validity window?",
        branches: [
          {
            label: "Inside",
            when: "the current time falls within valid-from and valid-until",
            to: "c.consumed",
          },
          {
            label: "Past valid-until",
            when: "the window has closed",
            to: "a.expired",
          },
        ],
      },
      {
        id: "c.consumed",
        kind: "condition",
        asks: "Is this a single-use approval that has already been consumed?",
        branches: [
          {
            label: "Already used",
            when: "the approval permits one use and one has been recorded",
            to: "a.reused",
          },
          {
            label: "Not consumed",
            when: "the approval is reusable, or its single use has not happened",
            to: "c.state",
          },
        ],
      },
      {
        id: "a.reused",
        kind: "action",
        does: "Refuse the reuse and record the attempt. A single-use approval used twice authorizes an action once and performs it twice, which is the same failure as a duplicate payment with a signature on it",
        writes: [{ field: "decision_log", mode: "append" }],
        next: "x.consumed",
      },
      {
        id: "x.consumed",
        kind: "exit",
        state: "already consumed; the approval cannot authorize a second execution",
        terminal: false,
        reEntry:
          "a further execution needs a further approval, which is a new decision rather than a re-reading of this one",
      },
      {
        id: "c.state",
        kind: "condition",
        asks: "Is the target still in the state the approval was granted against?",
        branches: [
          {
            label: "Same, or within what was approved",
            when: "the target's version or state matches what the reviewer was looking at, or the variation is inside the approved scope",
            to: "a.usable",
          },
          {
            label: "Changed beyond the approved context",
            when: "the target has moved in a way the approval did not contemplate",
            to: "a.needs-review",
          },
        ],
      },
      {
        id: "a.needs-review",
        kind: "action",
        does: "Record that valid time was not enough: the approval is inside its window and outside its context. A time-valid approval against a target that has changed is the most convincing kind of wrong authorization, because every visible check passes",
        writes: [{ field: "decision_log", mode: "append" }],
        next: "h.re-review",
      },
      {
        id: "h.re-review",
        kind: "handoff",
        to: "DEC-190",
        on: "an unexpired approval whose target has moved beyond its context",
        carries: [
          "the original approval, preserved, and what has changed in the target since",
          "the explicit fact that nothing was executed and the approval was not edited",
        ],
      },
      {
        id: "a.usable",
        kind: "action",
        does: "Record the approval as usable within its scope, and record this use where the approval is counted. Validity is established at the moment of use rather than carried as a flag someone set earlier",
        writes: [{ field: "decision_log", mode: "append" }],
        next: "x.usable",
      },
      {
        id: "x.usable",
        kind: "exit",
        state: "valid and usable within its stated scope",
        terminal: false,
        reEntry:
          "each further use re-evaluates from here, because time, target state and consumption can all have moved since the last one",
      },
      {
        id: "a.expired",
        kind: "action",
        does: "Record APPROVAL_EXPIRED. This is not the request having been rejected: it was approved, and the authorization lapsed before it was used - and telling the holder the wrong one of those changes whether they think asking again is worth anything",
        writes: [{ field: "decision_log", mode: "append" }],
        next: "c.renew",
      },
      {
        id: "c.renew",
        kind: "condition",
        asks: "Does policy allow a renewed review of a lapsed approval?",
        branches: [
          {
            label: "It does",
            when: "policy defines how a lapsed approval may be sought again",
            to: "h.renew",
          },
          {
            label: "It does not",
            when: "no renewal path is defined",
            to: "x.expired",
          },
        ],
      },
      {
        id: "h.renew",
        kind: "handoff",
        to: "DEC-181",
        on: "a lapsed approval policy allows to be sought again",
        carries: [
          "the expired approval and the decision it recorded, as context for the new one",
          "the explicit fact that this is a new decision request against the current target rather than an extension of the old approval",
        ],
      },
      {
        id: "x.expired",
        kind: "exit",
        state: "APPROVAL_EXPIRED; the approval stands in the record as having been granted and unused",
        terminal: false,
        reEntry:
          "a new decision request against the current target is assessed fresh, and this lapse is not held against it",
      },
    ],
    guardrails: [
      "An approval expiry is never invented where none exists.",
      "Valid time alone is not sufficient where an approval is state-specific or version-specific.",
      "An expired approval is not a rejected request.",
      "A single-use approval cannot authorize a second execution.",
    ],
    reusableRule:
      "An approval remains usable only within the time, state and scope boundaries under which it was authorized.",
  },

  /* ------------------------------------------------------------ DEC-189 */
  {
    id: "DEC-189",
    slug: "decision-escalation",
    category: "decision",
    name: "Decision escalation → higher authority → decide, return or reassign",
    purpose:
      "Move a case to an authority that can actually resolve it, carrying the work already done and predetermining nothing.",
    entity: {
      scope: "the decision case and the escalation acting on it",
      note: "The case is one case throughout. Escalation changes who holds it and changes neither the evidence nor the deadline.",
    },
    distinctFrom: [
      {
        journey: "DEC-182",
        because:
          "DEC-182 moves ownership at the same authority level because someone cannot take it. This moves the case to a different or higher authority because the current level cannot decide the question at all.",
      },
      {
        journey: "OWN-55",
        because:
          "OWN-55 escalates responsibility for work that is stuck. This escalates decision authority specifically - the case is not stuck, it is in front of someone who is not permitted to answer it.",
      },
    ],
    entry: "t.criterion",
    nodes: [
      {
        id: "t.criterion",
        kind: "trigger",
        event: "escalation_criterion_satisfied",
        evidence: {
          requires: [
            "a defined escalation criterion being met - an authority threshold, a policy exception, material risk, a reviewer conflict, complexity, SLA governance, or a disagreement requiring higher authority",
          ],
          insufficientAlone: [
            "a case being difficult, which is a reason to think rather than a reason to pass it upward",
          ],
          source: "authoritative",
        },
        next: "a.reason",
      },
      {
        id: "a.reason",
        kind: "action",
        does: "Record the escalation reason. Escalated is not approved - the case remains undecided and is now in front of someone else, and a status that reads as progress toward approval misleads everyone waiting on it",
        writes: [{ field: "decision_log", mode: "append" }],
        next: "a.preserve",
      },
      {
        id: "a.preserve",
        kind: "action",
        does: "Preserve the existing evidence, the review history, the original deadline and any non-final assessments already made. An escalation that starts the case from nothing throws away the work that identified why it needed escalating in the first place",
        writes: [{ field: "decision_log", mode: "append" }],
        next: "c.authority",
      },
      {
        id: "c.authority",
        kind: "condition",
        asks: "Does an eligible higher or different authority exist?",
        branches: [
          {
            label: "One exists",
            when: "a defined authority level above or beside this one can take the decision",
            to: "a.route",
          },
          {
            label: "None",
            when: "no eligible authority exists, or the escalation levels the model defines are exhausted",
            to: "a.no-authority",
          },
        ],
      },
      {
        id: "a.no-authority",
        kind: "action",
        does: "Record that no eligible authority exists for this decision, and stop. A case escalated into a level that does not exist becomes permanently owned by nobody, which is the failure mode that makes escalation chains dangerous rather than merely slow",
        writes: [{ field: "decision_log", mode: "append" }],
        next: "x.no-authority",
      },
      {
        id: "x.no-authority",
        kind: "exit",
        state: "no authority exists to decide this; the case is stopped and named rather than circulating",
        terminal: false,
        reEntry:
          "an authority being defined for this decision type reopens it. Until then it is visibly unresolvable rather than invisibly unassigned",
      },
      {
        id: "a.route",
        kind: "action",
        does: "Route to the eligible authority, within the escalation levels the model actually defines. Escalation is bounded - a case that can escalate indefinitely has no owner at any level, and each hop makes the next one easier to justify",
        writes: [{ field: "decision_log", mode: "append" }],
        next: "w.decision",
      },
      {
        id: "w.decision",
        kind: "wait",
        until: [
          "the escalated authority is able to decide",
          "the escalated authority requires more information",
          "the escalated authority returns the case with direction",
        ],
        onEvent: "c.outcome",
        timeout: {
          after: "the case's original deadline, preserved rather than restarted",
          reason:
            "the requester's deadline was never about who happens to be holding the case. An escalation that resets it makes the delay invisible to everyone except the person waiting",
        },
        onTimeout: "h.governance",
        windowExtendsOnEngagement: false,
      },
      {
        id: "c.outcome",
        kind: "condition",
        asks: "What did the escalated authority do?",
        branches: [
          {
            label: "They can decide",
            when: "the authority holds what the decision requires and is ready to review",
            to: "h.decide",
          },
          {
            label: "More information is required",
            when: "the escalated authority identifies evidence the decision turns on",
            to: "h.info",
          },
          {
            label: "Returned with direction",
            when: "the authority gives guidance and sends the case back to be decided at the original level",
            to: "a.return",
          },
        ],
      },
      {
        id: "h.decide",
        kind: "handoff",
        to: "DEC-183",
        on: "an escalated case an eligible authority will review",
        carries: [
          "every piece of evidence and every prior assessment, preserved",
          "the specific authority now holding it, which still acts only within what it was granted",
        ],
      },
      {
        id: "h.info",
        kind: "handoff",
        to: "DEC-184",
        on: "an escalated case blocked by missing evidence",
        carries: [
          "the requirement the escalated authority identified",
          "the review history from both levels, so nothing is asked for twice",
        ],
      },
      {
        id: "a.return",
        kind: "action",
        does: "Record the direction given and return the case to the original level, which decides within it. The higher authority acted only within its own granted authority - guidance is not a decision, and recording it as one attributes an outcome to someone who declined to make it",
        writes: [{ field: "decision_log", mode: "append" }],
        next: "h.return",
      },
      {
        id: "h.return",
        kind: "handoff",
        to: "DEC-182",
        on: "a case returned with direction rather than decided",
        carries: [
          "the direction given and the authority that gave it",
          "the original deadline, still unchanged, and the explicit fact that no decision was made at the escalated level",
        ],
      },
      {
        id: "h.governance",
        kind: "handoff",
        to: "OWN-55",
        on: "an escalated case outliving the deadline it preserved",
        carries: [
          "the case, every level it has passed through and how long each held it",
          "the explicit fact that this is now an ownership problem rather than a decision problem",
        ],
      },
    ],
    guardrails: [
      "Escalated is not approved.",
      "Escalation never erases previous review work.",
      "Escalation is bounded by defined levels rather than repeated indefinitely.",
      "A higher authority still acts only within the authority it was granted.",
    ],
    reusableRule:
      "Escalation changes who is authorized to resolve a decision without changing the underlying evidence or pretending a decision has already been made.",
  },

  /* ------------------------------------------------------------ DEC-190 */
  {
    id: "DEC-190",
    slug: "decision-reconsideration",
    category: "decision",
    name: "Decision superseded or reopened → revalidate → continue or new decision",
    purpose:
      "Let a decision be reconsidered without any part of the original being rewritten.",
    entity: {
      scope: "the existing decision and the event challenging it",
      note: "The original decision is immutable. A new decision supersedes it as a later record rather than replacing it in place.",
    },
    distinctFrom: [
      {
        journey: "OWN-58",
        because:
          "OWN-58 asks whether a material change after approval needs re-approval, inside a work-ownership flow. This owns the decision record's history: what supersedes what, what was already executed, and what a new decision does not undo.",
      },
    ],
    entry: "t.material",
    nodes: [
      {
        id: "t.material",
        kind: "trigger",
        event: "decision_challenged_or_superseded",
        evidence: {
          requires: [
            "a material event bearing on a prior decision - new evidence, a material target-state change, an authorized reconsideration, an error in the previous decision, or an upstream authoritative correction",
          ],
          insufficientAlone: [
            "the requester disagreeing with the outcome, which is an appeal and runs through the appeal mechanism",
            "new information arriving, most of which confirms what was already concluded",
          ],
          source: "authoritative",
        },
        next: "a.preserve",
      },
      {
        id: "a.preserve",
        kind: "action",
        does: "Preserve the original decision as a historical fact, exactly as recorded. Nothing about it is edited - a decision record changed in place removes the ability to say what was decided, by whom, and on what basis, which is the only thing anyone ever actually needs from it",
        writes: [{ field: "decision_log", mode: "append" }],
        next: "a.assess",
      },
      {
        id: "a.assess",
        kind: "action",
        does: "Assess whether the event genuinely bears on the decision. New evidence arriving is not the previous decision becoming wrong - most of it confirms what was already concluded, and reopening for each arriving fact produces a case that never closes",
        next: "c.still-valid",
      },
      {
        id: "c.still-valid",
        kind: "condition",
        asks: "Does the existing decision still hold?",
        branches: [
          {
            label: "It holds",
            when: "the event does not change what the decision turned on",
            to: "a.retain",
          },
          {
            label: "Genuinely challenged",
            when: "the event bears directly on the basis the decision was made on",
            to: "c.authority",
          },
        ],
      },
      {
        id: "a.retain",
        kind: "action",
        does: "Retain the decision and record that it was reconsidered and held. No duplicate review is opened, and the fact that it was looked at again is itself worth having in the record",
        writes: [{ field: "decision_log", mode: "append" }],
        next: "x.retained",
      },
      {
        id: "x.retained",
        kind: "exit",
        state: "original decision retained; reconsidered and unchanged",
        terminal: false,
        reEntry:
          "a further event is assessed on its own merits rather than accumulating into a reopening by weight of attempts",
      },
      {
        id: "c.authority",
        kind: "condition",
        asks: "Is reconsideration authorized, and is it the same decision scope?",
        branches: [
          {
            label: "Authorized, same scope",
            when: "someone with the authority to reconsider is doing so, over the same question",
            to: "a.reopen",
          },
          {
            label: "Authorized, but a different question",
            when: "what is now being asked is not what the original decision covered",
            to: "a.new-case",
          },
          {
            label: "Not authorized",
            when: "no reconsideration right or authority applies",
            to: "x.not-authorized",
          },
        ],
      },
      {
        id: "x.not-authorized",
        kind: "exit",
        state: "reconsideration not authorized; the original decision stands",
        terminal: false,
        reEntry:
          "where policy grants an appeal right, it is exercised through the appeal mechanism rather than by reopening the case here",
      },
      {
        id: "a.new-case",
        kind: "action",
        does: "Create a new decision case, linked to the previous one. A different question decided under an old case's scope produces a decision that reads as covering something it never considered, and it will be relied on that way",
        writes: [{ field: "decision_log", mode: "append" }],
        next: "h.new",
      },
      {
        id: "h.new",
        kind: "handoff",
        to: "DEC-181",
        on: "a materially different question raised against a decided case",
        carries: [
          "the prior decision and its evidence, as linked context rather than as the scope",
          "the explicit fact that the prior decision stands and is not superseded by this one being opened",
        ],
      },
      {
        id: "a.reopen",
        kind: "action",
        does: "Record the case REOPENED, carrying the original decision and all prior evidence forward. Reopened is not the original decision deleted - and the new decision, when it comes, supersedes the old one as a later authoritative record rather than replacing it",
        writes: [{ field: "decision_log", mode: "append" }],
        next: "c.executed",
      },
      {
        id: "c.executed",
        kind: "condition",
        asks: "Was the previous decision already executed?",
        branches: [
          {
            label: "Not executed",
            when: "the decision authorized something that never happened",
            to: "h.review",
          },
          {
            label: "Already executed",
            when: "the authorized action was carried out and its consequences are real",
            to: "a.executed-note",
          },
        ],
      },
      {
        id: "a.executed-note",
        kind: "action",
        does: "Record what was executed and when. The consequences happened - money moved, access was granted, something shipped - and pretending the execution never occurred leaves real effects in place with nothing in the record explaining them",
        writes: [{ field: "decision_log", mode: "append" }],
        next: "c.reversible",
      },
      {
        id: "c.reversible",
        kind: "condition",
        asks: "Do the executed consequences need correcting regardless of what the new decision concludes?",
        branches: [
          {
            label: "They need correcting now",
            when: "the execution was wrong on its own terms - an error, or an upstream correction that invalidates it",
            to: "h.correct",
          },
          {
            label: "They stand pending the new decision",
            when: "the execution was validly made and only the reconsidered decision can change what should follow",
            to: "h.review",
          },
        ],
      },
      {
        id: "h.correct",
        kind: "handoff",
        to: "REM-157",
        on: "executed consequences that need correcting independently of the reconsidered decision",
        carries: [
          "what was executed, on whose authority and when",
          "the explicit fact that changing the decision record does not undo any of it - the correction is its own lifecycle with its own outcome",
        ],
      },
      {
        id: "h.review",
        kind: "handoff",
        to: "DEC-183",
        on: "a reopened case ready to be decided again",
        carries: [
          "the original decision, preserved, and everything that has changed since",
          "whether the original was executed, so the new decision is made knowing what already exists in the world",
        ],
      },
    ],
    guardrails: [
      "Reopened is not the original decision deleted.",
      "New evidence does not automatically invalidate an old decision.",
      "Executed consequences may require a separate correction or reversal lifecycle.",
      "The historical decision record is never mutated in place.",
    ],
    reusableRule:
      "Decision reconsideration should preserve prior decisions as history while creating a new authoritative decision state only when current evidence and authority justify it.",
  },
];
