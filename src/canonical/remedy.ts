import type { CanonicalJourney, OrchestrationRule } from "./types";

/* CATEGORY 16 - RETURNS, REMEDIES, CORRECTIONS & POST-COMPLETION RECOVERY

   What happens when something was delivered and it was wrong.

   The default shape of this problem in most systems is a single arrow:
   customer unhappy, therefore refund. That arrow is wrong in both directions.
   It refunds people who wanted the thing they ordered rather than their money
   back, and it treats the money as the resolution when the obligation - to
   deliver a working thing - is still outstanding.

   So this category starts somewhere else. It establishes what is actually
   unresolved, then picks the remedy that would satisfy it, then checks the
   remedy did. Three states where most implementations have one.

   The chains it keeps separate:

     reported       someone says something is wrong
     confirmed      there is an unresolved obligation
     remedy chosen  something exists that would satisfy it
     remedy done    that thing happened
     resolved       the obligation is now satisfied

     requested      they want to send it back
     authorized     they may
     in transit     it is on its way
     received       we have it
     accepted       it met the return conditions

   And one separation that is not a chain at all: compensation sits beside all
   of this rather than at the end of it. Fixing the problem and acknowledging
   the impact are different decisions with different eligibility, and a system
   that treats a credit as the fix leaves the customer with money and the same
   broken thing. */

export const REMEDY_RULES: readonly OrchestrationRule[] = [
  {
    id: "REM-R1",
    scope: "remedy",
    rule: "A post-completion issue, a confirmed defect and remedy eligibility are three separate states.",
    because:
      "Most reports are not defects and most defects do not entitle every remedy. Collapsing them produces either a manufactured fault or a refused customer with a real problem.",
  },
  {
    id: "REM-R2",
    scope: "remedy",
    rule: "Return requested, authorized, in transit, received and accepted are five separate states.",
    because:
      "Each fails independently. Authorising a return does not make it arrive, and receiving something does not mean it met the conditions it was authorised under.",
  },
  {
    id: "REM-R3",
    scope: "remedy",
    rule: "Return and refund are separate lifecycle mechanisms with separate eligibility.",
    because:
      "Someone can be entitled to send something back without being entitled to their money, and entitled to money without needing to return anything.",
  },
  {
    id: "REM-R4",
    scope: "remedy",
    rule: "A refund hands off to the financial lifecycle rather than being implemented as a generic return outcome.",
    because:
      "Deciding money is owed and moving it are financial acts with their own authority and their own confirmation. Bolting them onto a returns process skips both.",
  },
  {
    id: "REM-R5",
    scope: "remedy",
    rule: "A replacement creates a new fulfillment obligation tied to the original defect.",
    because:
      "It is a second delivery against the same promise, not a new sale and not an edit to the first one. Treating it as a new order bills for it; treating it as a correction loses that the first was wrong.",
  },
  {
    id: "REM-R6",
    scope: "remedy",
    rule: "Correction and reperformance preserve the original incorrect outcome as history.",
    because:
      "Rewriting the original as though it had always been right removes the evidence anything needed fixing, and with it the ability to see the same fault recur.",
  },
  {
    id: "REM-R7",
    scope: "remedy",
    rule: "Remedy selection starts from the unresolved obligation, not from the complaint.",
    because:
      "The complaint says how someone feels; the obligation says what is owed. A remedy chosen from the first satisfies nobody when what was actually missing is still missing.",
  },
  {
    id: "REM-R8",
    scope: "remedy",
    rule: "Remedy approval, remedy execution and verified resolution are three separate states.",
    because:
      "An approved refund that never arrived, a replacement dispatched to the wrong address and a correction that did not correct anything all look identical from an approval record.",
  },
  {
    id: "REM-R9",
    scope: "remedy",
    rule: "Partial return, correction and remedy outcomes preserve the remaining scope explicitly.",
    because:
      "Half a remedy recorded as a whole one closes an obligation that is still live, and the customer discovers the remainder rather than being told about it.",
  },
  {
    id: "REM-R10",
    scope: "remedy",
    rule: "Compensation and resolving the underlying problem are independent decisions.",
    because:
      "A credit acknowledges impact. It does not deliver the thing that was owed, and a system that treats it as the fix leaves someone holding money and the same broken outcome.",
  },
  {
    id: "REM-R11",
    scope: "remedy",
    rule: "Compensation that requires financial or entitlement execution reuses those canonical mechanisms.",
    because:
      "A service credit is an entitlement and a goodwill payment is a financial movement. Implementing either inside a remedy flow skips the confirmation each of them needs.",
  },
  {
    id: "REM-R12",
    scope: "remedy",
    rule: "Duplicate remedies and duplicate compensation are prevented.",
    because:
      "Two recovery cases against one obligation produce two replacements or two refunds, and the second one is found by accounting rather than by the process that issued it.",
  },
  {
    id: "REM-R13",
    scope: "remedy",
    rule: "An existing recovery case suppresses duplicate issue and remedy creation covering the same obligation.",
    because:
      "The same rule as ACT-R9, RET-R9 and FBK-R10, arriving here for the fourth time. Where several channels can each open a case, several of them will.",
  },
  {
    id: "REM-R14",
    scope: "remedy",
    rule: "Post-remedy recurrence preserves previous attempts and escalates diagnosis where appropriate.",
    because:
      "A remedy that did not hold usually means the diagnosis was wrong rather than the execution. Repeating it without that reassessment produces the same failure at greater cost.",
  },
  {
    id: "REM-R15",
    scope: "remedy",
    rule: "Historical fulfillment, issue and remedy records stay auditable.",
    because:
      "Recovery is the area most likely to be questioned afterwards, by a customer, a regulator or an accountant, and each of them asks what was delivered, what went wrong and what was done about it.",
  },
  {
    id: "REM-R16",
    scope: "remedy",
    rule: "A remedy is not marked successful because an internal task or external request completed technically.",
    because:
      "The same substitution OPS-R15 forbids for jobs, applied to recovery: a refund submitted is not a refund received, and a replacement dispatched is not one that arrived.",
  },
  {
    id: "REM-R17",
    scope: "remedy",
    rule: "An unknown return or remedy outcome is reconciled before any irreversible downstream action.",
    because:
      "Issuing a second remedy against an unknown produces two of it, and in this category the second one is usually money or goods that have already gone out.",
  },
  {
    id: "REM-R18",
    scope: "remedy",
    rule: "Every terminal recovery state says whether the original obligation is fully resolved, partially resolved, replaced, financially compensated or still outstanding.",
    because:
      "Recovery ends in five genuinely different places, and a state that does not say which one it reached leaves the remainder to be discovered by the person who was waiting for it.",
  },
];

export const REMEDY_JOURNEYS: readonly CanonicalJourney[] = [
  /* ------------------------------------------------------------ REM-151 */
  {
    id: "REM-151",
    slug: "post-completion-issue",
    category: "remedy",
    goal: "compensation-remedy",
    name: "Post-completion issue → validate → remedy route",
    purpose:
      "Establish whether something delivered has left an obligation unresolved, and which recovery mechanism could satisfy it.",
    entity: {
      scope: "the completed fulfillment or service, and the specific problem reported against it",
      note: "The issue is scoped to the fulfillment it concerns. A second problem with the same order is a second issue unless it is the same defect described again.",
    },
    distinctFrom: [
      {
        journey: "FBK-44",
        because:
          "FBK-44 starts from someone's account of an experience and asks whether any operational issue exists. This starts from a concrete problem with something already delivered and asks which recovery route would fix it - the obligation is known to exist and the question is what satisfies it.",
      },
    ],
    entry: "t.reported",
    nodes: [
      {
        id: "t.reported",
        kind: "trigger",
        event: "post_completion_issue_reported",
        evidence: {
          requires: [
            "a concrete problem with a completed fulfillment or service: a wrong item or result, damaged output, a missing component, a quality problem, a service defect, an incorrect configuration or an incomplete outcome",
          ],
          insufficientAlone: [
            "negative feedback about the experience, which reports a feeling rather than naming a problem with what was delivered",
            "a low satisfaction score",
          ],
          source: "declared",
        },
        next: "a.capture",
      },
      {
        id: "a.capture",
        kind: "action",
        does: "Capture the issue id, the fulfillment or service it concerns, the problem as reported, the affected scope, when it was reported and whatever evidence exists",
        writes: [{ field: "issue_log", mode: "append" }],
        next: "c.duplicate",
      },
      {
        id: "c.duplicate",
        kind: "condition",
        asks: "Does an existing recovery case already cover this problem?",
        branches: [
          {
            label: "Already covered",
            when: "an open case concerns the same defect on the same obligation",
            to: "a.attach",
          },
          {
            label: "Nothing open",
            when: "no existing case covers it",
            to: "a.assess",
          },
        ],
      },
      {
        id: "a.attach",
        kind: "action",
        does: "Attach the new evidence and context to the existing case. No second recovery lifecycle is opened - two remedies running against one obligation produce two replacements or two refunds, and the second is found by accounting rather than by the process that issued it",
        writes: [{ field: "issue_log", mode: "append" }],
        next: "x.attached",
      },
      {
        id: "x.attached",
        kind: "exit",
        state: "attached to the existing recovery case",
        terminal: false,
        reEntry:
          "if that case closes with the problem still present, the recurrence is assessed on its own terms rather than as a fresh report",
      },
      {
        id: "a.assess",
        kind: "action",
        does: "Establish whether the report describes an unresolved obligation a remedy could satisfy, or an experience that fell short without anything having gone wrong. Both are real; only the first creates something to fix",
        next: "c.actionable",
      },
      {
        id: "c.actionable",
        kind: "condition",
        asks: "Is there an actionable unresolved obligation?",
        branches: [
          {
            label: "Actionable",
            when: "something identifiable was owed and is not what was delivered",
            to: "a.classify",
          },
          {
            label: "Not actionable",
            when: "the delivery matched what was owed and the experience still disappointed",
            to: "a.acknowledge",
          },
        ],
      },
      {
        id: "a.acknowledge",
        kind: "action",
        does: "Acknowledge and explain, closing according to policy. No defect is manufactured to give the report somewhere to go, and no refund is issued as a way of ending the conversation",
        writes: [{ field: "issue_log", mode: "append" }],
        next: "x.no-defect",
      },
      {
        id: "x.no-defect",
        kind: "exit",
        state: "heard; no unresolved obligation and no remedy owed",
        terminal: false,
        reEntry:
          "new evidence of an actual defect re-opens this. Repetition of the same report is itself worth reading, without becoming a defect by repetition",
      },
      {
        id: "a.classify",
        kind: "action",
        does: "Classify the remedy route the problem actually implies - a correction, a reperformance, a replacement, a return, a refund review, a service recovery, or another policy-defined remedy. Refund is one route among several rather than the default, and choosing it because it is the easiest to execute leaves the customer without the thing they wanted",
        writes: [{ field: "issue_log", mode: "append" }],
        next: "h.remedy",
      },
      {
        id: "h.remedy",
        kind: "handoff",
        to: "REM-157",
        on: "a confirmed unresolved obligation needing a remedy decision",
        carries: [
          "the unresolved obligation, stated as what is owed rather than as what was complained about",
          "the routes the classification suggests, and the evidence behind them",
        ],
      },
    ],
    guardrails: [
      "An issue reported is not a confirmed defect.",
      "Negative feedback alone does not establish remedy eligibility.",
      "Not every issue defaults to a refund.",
      "An existing case covering the same obligation suppresses a second recovery lifecycle.",
    ],
    reusableRule:
      "Post-completion problems should first establish the unresolved obligation before selecting the remedy intended to satisfy it.",
  },

  /* ------------------------------------------------------------ REM-152 */
  {
    id: "REM-152",
    slug: "return-authorization",
    category: "remedy",
    goal: "eligibility-qualification",
    name: "Return request → eligibility → authorize, reject or review",
    purpose:
      "Decide whether something may enter a return process, as a decision separate from whether money is owed.",
    entity: {
      scope: "the return request and the original fulfillment it concerns",
      note: "Return eligibility and refund eligibility are different questions with different rules. Authorising a return decides only the first.",
    },
    distinctFrom: [
      {
        journey: "REM-153",
        because:
          "This grants permission for a resource to come back. REM-153 tracks whether it actually does, which fails independently and often.",
      },
    ],
    entry: "t.requested",
    nodes: [
      {
        id: "t.requested",
        kind: "trigger",
        event: "return_requested",
        evidence: {
          requires: ["a request to send back an identified item, resource or deliverable"],
          insufficientAlone: [
            "an expression of dissatisfaction, which is a report rather than a request to return anything",
          ],
          source: "declared",
        },
        next: "a.capture",
      },
      {
        id: "a.capture",
        kind: "action",
        does: "Capture the request id, the item or resource, the quantity or scope, the reason, the requester and the request time",
        writes: [{ field: "return_log", mode: "append" }],
        next: "c.applicable",
      },
      {
        id: "c.applicable",
        kind: "condition",
        asks: "Does a return process apply to this at all?",
        branches: [
          {
            label: "Returnable",
            when: "the thing exists physically or as a revocable deliverable and can be sent back",
            to: "c.policy",
          },
          {
            label: "Nothing to return",
            when: "the delivery was a service performed, a consumed resource, or something with no return path",
            to: "h.alternative",
          },
        ],
      },
      {
        id: "h.alternative",
        kind: "handoff",
        to: "REM-157",
        on: "a return requested against something that cannot be returned",
        carries: [
          "the request and the unresolved obligation behind it",
          "the fact that no return route exists, so the remedy is something else rather than nothing",
        ],
      },
      {
        id: "c.policy",
        kind: "condition",
        asks: "Is a return eligibility policy defined for this?",
        branches: [
          {
            label: "Defined",
            when: "policy states what may be returned, within what window and on what conditions",
            to: "c.eligible",
          },
          {
            label: "Not defined",
            when: "no policy covers returns of this kind",
            to: "h.undefined",
          },
        ],
      },
      {
        id: "h.undefined",
        kind: "handoff",
        to: "DEC-181",
        on: "a return request with no governing eligibility policy",
        carries: [
          "the request and the original fulfillment",
          "the explicit fact that no eligibility rule was invented in order to decide it",
        ],
      },
      {
        id: "c.eligible",
        kind: "condition",
        asks: "What does the policy determine?",
        branches: [
          {
            label: "Eligible",
            when: "the policy's conditions are met deterministically",
            to: "a.authorize",
          },
          {
            label: "Ineligible",
            when: "the policy rules it out deterministically",
            to: "a.reject",
          },
          {
            label: "Requires review or evidence",
            when: "the policy leaves this case to a decision rather than a rule",
            to: "a.review",
          },
        ],
      },
      {
        id: "a.reject",
        kind: "action",
        does: "Record RETURN_REJECTED with the reason drawn from the policy that ruled it out",
        writes: [{ field: "return_log", mode: "append" }],
        next: "x.rejected",
      },
      {
        id: "x.rejected",
        kind: "exit",
        state: "RETURN_REJECTED; the original fulfillment is unchanged",
        terminal: false,
        reEntry:
          "a return refused does not settle whether another remedy is owed - that question is separate and is asked separately",
      },
      {
        id: "a.review",
        kind: "action",
        does: "Record RETURN_UNDER_REVIEW and gather what the decision requires. Nothing is authorised while it is under review",
        writes: [{ field: "return_log", mode: "append" }],
        next: "w.decision",
      },
      {
        id: "w.decision",
        kind: "wait",
        until: ["a decision is recorded"],
        onEvent: "c.decision",
        timeout: {
          after: "the decision SLA",
          reason:
            "a return request left undecided leaves someone holding something they were told they might send back, with no way to know whether they may",
        },
        onTimeout: "h.escalate",
        windowExtendsOnEngagement: false,
      },
      {
        id: "c.decision",
        kind: "condition",
        asks: "What was decided?",
        branches: [
          { label: "Authorized", when: "the reviewer permitted the return", to: "a.authorize" },
          { label: "Rejected", when: "the reviewer refused it", to: "a.reject" },
        ],
      },
      {
        id: "h.escalate",
        kind: "handoff",
        to: "OWN-55",
        on: "a return decision outliving its SLA",
        carries: ["the request, its age and what is holding the decision"],
      },
      {
        id: "a.authorize",
        kind: "action",
        does: "Record RETURN_AUTHORIZED with the scope, the method and the validity. Authorising a return permits the resource to come back and decides nothing about whether money is owed - refund eligibility is a separate question with its own rules and its own answer",
        writes: [{ field: "return_log", mode: "append" }],
        next: "h.transit",
      },
      {
        id: "h.transit",
        kind: "handoff",
        to: "REM-153",
        on: "an authorised return",
        carries: [
          "the authorised scope, method and validity",
          "the explicit fact that nothing has moved and no remedy has been decided",
        ],
      },
    ],
    guardrails: [
      "A return requested is not a return authorized.",
      "Return eligibility rules are never invented.",
      "Refund eligibility and return eligibility may be different decisions with different answers.",
    ],
    reusableRule:
      "A return request creates a decision about whether the original fulfillment may enter a return process; it does not itself reverse the fulfillment.",
  },

  /* ------------------------------------------------------------ REM-153 */
  {
    id: "REM-153",
    slug: "return-transit",
    category: "remedy",
    goal: "delivery-confirmation",
    name: "Return authorized → in transit, received, lost or expired",
    purpose:
      "Track whether an authorised return actually comes back, and hold the states where it might not have.",
    entity: {
      scope: "the authorised return and the resource travelling under it",
      note: "A carrier accepting the parcel is a fact about the carrier. The return-dependent remedy waits for receipt by us, not for a tracking number existing.",
    },
    entry: "t.active",
    nodes: [
      {
        id: "t.active",
        kind: "trigger",
        event: "return_authorization_active",
        evidence: {
          requires: ["an active return authorisation with a scope and a validity"],
          source: "authoritative",
        },
        next: "a.define",
      },
      {
        id: "a.define",
        kind: "action",
        does: "Define the return method, the destination, the scope and quantity, the authorisation's validity and the tracking reference where one exists. Record AUTHORIZED - permission to return, with nothing yet moved",
        writes: [{ field: "return_log", mode: "append" }],
        next: "w.return",
      },
      {
        id: "w.return",
        kind: "wait",
        until: [
          "the return is dispatched by the requester",
          "the return is received by us",
          "a return exception is reported",
        ],
        onEvent: "c.event",
        timeout: {
          after: "the authorisation's validity",
          reason:
            "an authorisation that lapses unused releases whatever was being held against it, and the customer keeps the thing rather than being left in an open process",
        },
        onTimeout: "a.expired",
        windowExtendsOnEngagement: false,
      },
      {
        id: "c.event",
        kind: "condition",
        asks: "What happened?",
        branches: [
          {
            label: "Dispatched",
            when: "the requester handed it to a carrier or return channel",
            to: "a.transit",
          },
          {
            label: "Received",
            when: "it arrived with us",
            to: "h.inspect",
          },
          {
            label: "Exception",
            when: "the carrier or channel reports it lost, damaged in transit or undeliverable",
            to: "a.exception",
          },
        ],
      },
      {
        id: "a.transit",
        kind: "action",
        does: "Record IN_RETURN_TRANSIT. A carrier accepting the parcel is not the resource having returned to us - a return-dependent remedy waits for receipt, and issuing one on a tracking number means issuing it for something that may never arrive",
        writes: [{ field: "return_log", mode: "append" }],
        next: "w.receipt",
      },
      {
        id: "w.receipt",
        kind: "wait",
        until: ["the return is received", "a transit exception is reported"],
        onEvent: "c.receipt",
        timeout: {
          after: "the expected transit window plus its tolerance",
          reason:
            "a return that has neither arrived nor been reported lost is unknown, and treating our silence as its loss writes off something that may be two days away",
        },
        onTimeout: "a.unknown",
        windowExtendsOnEngagement: false,
      },
      {
        id: "c.receipt",
        kind: "condition",
        asks: "Which arrived first?",
        branches: [
          { label: "The return", when: "the resource reached us", to: "h.inspect" },
          { label: "An exception", when: "the carrier reported a problem", to: "a.exception" },
        ],
      },
      {
        id: "a.unknown",
        kind: "action",
        does: "Record RETURN_UNKNOWN and suppress any return-dependent outcome. A return we cannot locate is neither one that arrived nor one that was never sent, and acting as though it were either produces a remedy issued against nothing or a customer refused for something they did send",
        writes: [
          { field: "return_log", mode: "append" },
          { field: "suppressed_sends", mode: "append" },
        ],
        next: "h.reconcile",
      },
      {
        id: "a.exception",
        kind: "action",
        does: "Record LOST or EXCEPTION with what the carrier reported, and who bears the risk under the return method that was used",
        writes: [{ field: "return_log", mode: "append" }],
        next: "h.reconcile",
      },
      {
        id: "h.reconcile",
        kind: "handoff",
        to: "external:external-status-reconciliation",
        on: "a return whose whereabouts or outcome could not be established",
        carries: [
          "the authorisation, the tracking reference and everything the carrier last reported",
          "the explicit instruction that no return-dependent remedy is issued until this is settled",
        ],
        suppresses: ["any remedy that depends on the return having been received"],
      },
      {
        id: "a.expired",
        kind: "action",
        does: "Record EXPIRED_UNUSED - the authorisation lapsed and nothing came back. Whether another remedy remains available is a separate question and is asked separately",
        writes: [{ field: "return_log", mode: "append" }],
        next: "x.expired",
      },
      {
        id: "x.expired",
        kind: "exit",
        state: "EXPIRED_UNUSED; nothing returned and the authorisation has lapsed",
        terminal: false,
        reEntry:
          "a fresh return request is assessed on its own eligibility. The original obligation, if still unresolved, remains so",
      },
      {
        id: "h.inspect",
        kind: "handoff",
        to: "REM-154",
        on: "a returned resource arriving",
        carries: [
          "what was authorised and what physically arrived",
          "the explicit fact that received is not accepted - the conditions have not been checked",
        ],
      },
    ],
    guardrails: [
      "Authorized is not returned.",
      "Carrier acceptance is not the resource having returned to the business.",
      "No return-dependent outcome is issued from a tracking number alone unless policy explicitly permits it.",
    ],
    reusableRule:
      "Return authorization establishes permission to return; the return remains operationally unresolved until the resource's return outcome is known.",
  },

  /* ------------------------------------------------------------ REM-154 */
  {
    id: "REM-154",
    slug: "return-inspection",
    category: "remedy",
    goal: "eligibility-qualification",
    name: "Returned item or deliverable → inspect → accept, reject or partial",
    purpose:
      "Judge what came back against the conditions it was authorised under, keeping receipt and acceptance apart.",
    entity: {
      scope: "the returned resource as received, and the return case it arrived under",
      note: "Physical receipt is recorded regardless of the inspection's outcome. A rejected return is still an object we are holding.",
    },
    entry: "t.received",
    nodes: [
      {
        id: "t.received",
        kind: "trigger",
        event: "returned_resource_received",
        evidence: {
          requires: ["a returned resource physically or logically received against an authorisation"],
          source: "authoritative",
        },
        next: "a.record-receipt",
      },
      {
        id: "a.record-receipt",
        kind: "action",
        does: "Record that the resource was received, with what actually arrived. This fact stands whatever the inspection concludes - a rejected return is still something we are holding, and losing track of it because it failed inspection is how goods disappear into a warehouse nobody reconciles",
        writes: [{ field: "return_log", mode: "append" }],
        next: "c.criteria",
      },
      {
        id: "c.criteria",
        kind: "condition",
        asks: "Are the inspection criteria defined for this kind of return?",
        branches: [
          {
            label: "Defined",
            when: "policy states what condition, completeness and scope the return has to meet",
            to: "a.inspect",
          },
          {
            label: "Not defined",
            when: "no policy states what an acceptable return looks like here",
            to: "h.undefined",
          },
        ],
      },
      {
        id: "h.undefined",
        kind: "handoff",
        to: "DEC-181",
        on: "a returned resource with no defined acceptance criteria",
        carries: [
          "what arrived and what was authorised",
          "the explicit fact that no acceptance standard was invented in order to judge it",
        ],
      },
      {
        id: "a.inspect",
        kind: "action",
        does: "Inspect against the criteria that apply - identity, quantity, condition, completeness, included components, the authorised scope, and integrity where it matters",
        writes: [{ field: "return_log", mode: "append" }],
        next: "c.outcome",
      },
      {
        id: "c.outcome",
        kind: "condition",
        asks: "What did the inspection find?",
        branches: [
          {
            label: "Fully acceptable",
            when: "everything authorised arrived and meets the conditions",
            to: "a.accept",
          },
          {
            label: "Partially acceptable",
            when: "some of the returned scope meets the conditions and some does not",
            to: "a.partial",
          },
          {
            label: "Not acceptable",
            when: "what arrived does not meet the conditions it was authorised under",
            to: "a.reject",
          },
        ],
      },
      {
        id: "a.accept",
        kind: "action",
        does: "Record RETURN_ACCEPTED for the full authorised scope",
        writes: [{ field: "return_log", mode: "append" }],
        next: "h.remedy",
      },
      {
        id: "a.partial",
        kind: "action",
        does: "Record PARTIALLY_ACCEPTED, naming exactly which scope is accepted and which is not. The two are carried separately because whatever remedy follows applies to one of them and not the other",
        writes: [{ field: "return_log", mode: "append" }],
        next: "h.remedy",
      },
      {
        id: "a.reject",
        kind: "action",
        does: "Record RETURN_REJECTED_AFTER_RECEIPT with the reason. The receipt record stands - we still physically hold the thing, and what happens to it is part of what the remedy decision now has to cover",
        writes: [{ field: "return_log", mode: "append" }],
        next: "h.remedy",
      },
      {
        id: "h.remedy",
        kind: "handoff",
        to: "REM-157",
        on: "a return inspected and its accepted scope established",
        carries: [
          "the accepted and rejected scope, separately",
          "what we are physically holding and what has to happen to it, which the remedy decision now covers",
        ],
      },
    ],
    guardrails: [
      "Received is not accepted.",
      "Inspection criteria are policy-defined rather than judged case by case.",
      "A rejected return does not erase the fact that the resource was physically received.",
      "Partial outcomes preserve the exact accepted and rejected scope.",
    ],
    reusableRule:
      "A returned resource satisfies the return requirement only after the received scope has been evaluated against the applicable acceptance rules.",
  },

  /* ------------------------------------------------------------ REM-155 */
  {
    id: "REM-155",
    slug: "replacement-remedy",
    category: "remedy",
    goal: "compensation-remedy",
    name: "Replacement decision → allocate → fulfill → confirm",
    purpose:
      "Deliver a second time against the same promise, tied to the defect it exists to resolve.",
    entity: {
      scope: "the replacement case, linking the original fulfillment to the new one",
      note: "The link is what makes it a remedy rather than a new order. Without it, the replacement is billed for and the original's defect disappears from the record.",
    },
    distinctFrom: [
      {
        journey: "FUL-144",
        because:
          "FUL-144 executes an original fulfillment obligation. This creates a second one whose entire purpose is to resolve a specific defect in the first, which changes whether it is charged for and what it has to be verified against.",
      },
    ],
    entry: "t.authorized",
    nodes: [
      {
        id: "t.authorized",
        kind: "trigger",
        event: "replacement_remedy_authorized",
        evidence: {
          requires: ["a replacement authorised as the remedy for an identified defect"],
          source: "authoritative",
        },
        next: "a.link",
      },
      {
        id: "a.link",
        kind: "action",
        does: "Record the replacement's relationship to the original fulfillment and the specific defect it exists to resolve. The original's history stays intact - a replacement is a second fulfillment against the same obligation, not a correction of the first one's record",
        writes: [{ field: "remedy_log", mode: "append" }],
        next: "a.scope",
      },
      {
        id: "a.scope",
        kind: "action",
        does: "Determine the replacement scope - which part of the original is being replaced, which is not, and whether what is being sent is identical or an accepted equivalent",
        writes: [{ field: "remedy_log", mode: "append" }],
        next: "c.available",
      },
      {
        id: "c.available",
        kind: "condition",
        asks: "Is a replacement resource available?",
        branches: [
          {
            label: "Available",
            when: "the replacement scope can be resourced now",
            to: "a.no-charge",
          },
          {
            label: "Not available",
            when: "nothing can currently satisfy the replacement scope",
            to: "c.wait",
          },
        ],
      },
      {
        id: "c.wait",
        kind: "condition",
        asks: "Does policy permit waiting for availability?",
        branches: [
          {
            label: "Wait permitted",
            when: "the customer and policy both tolerate the replacement arriving later",
            to: "w.availability",
          },
          {
            label: "Cannot wait",
            when: "the delay would exceed what policy or the customer accepts",
            to: "h.alternative",
          },
        ],
      },
      {
        id: "w.availability",
        kind: "wait",
        until: ["a replacement resource becomes available"],
        onEvent: "a.no-charge",
        timeout: {
          after: "the tolerable wait for this remedy",
          reason:
            "a replacement that never becomes available is a remedy that is not happening, and saying so is better than an open case that quietly ages",
        },
        onTimeout: "h.alternative",
        windowExtendsOnEngagement: false,
      },
      {
        id: "a.no-charge",
        kind: "action",
        does: "Create the replacement fulfillment without a new commercial charge, unless policy explicitly requires one. A remedy that bills again for what was already paid for is not a remedy, and it converts a recoverable problem into a dispute",
        writes: [{ field: "remedy_log", mode: "append" }],
        next: "w.replacement",
      },
      {
        id: "w.replacement",
        kind: "wait",
        until: ["the replacement is fulfilled and delivered", "the replacement fails or is cancelled"],
        onEvent: "c.outcome",
        timeout: {
          after: "the remedy deadline",
          reason:
            "a replacement outliving its deadline has stopped being the remedy in progress and become another unresolved obligation on top of the first",
        },
        onTimeout: "h.alternative",
        windowExtendsOnEngagement: false,
      },
      {
        id: "c.outcome",
        kind: "condition",
        asks: "What happened to the replacement?",
        branches: [
          {
            label: "Delivered",
            when: "the replacement reached the recipient",
            to: "h.verify",
          },
          {
            label: "Failed or cancelled",
            when: "the replacement did not complete",
            to: "h.alternative",
          },
        ],
      },
      {
        id: "h.verify",
        kind: "handoff",
        to: "REM-158",
        on: "a replacement delivered",
        carries: [
          "the replacement and the original defect it was meant to resolve",
          "the explicit fact that delivered is not yet resolved - whether it satisfied the obligation is the next question",
        ],
      },
      {
        id: "h.alternative",
        kind: "handoff",
        to: "REM-157",
        on: "a replacement that cannot be delivered",
        carries: [
          "why the replacement could not be completed",
          "the unresolved obligation, unchanged, and whatever remedies remain available for it",
        ],
      },
    ],
    guardrails: [
      "A replacement approved is not a replacement delivered.",
      "A replacement does not create a duplicate commercial charge unless policy explicitly requires one.",
      "The original fulfillment history remains intact.",
    ],
    reusableRule:
      "Replacement creates a new fulfillment obligation whose purpose is to resolve a specific defect in the original fulfillment.",
  },

  /* ------------------------------------------------------------ REM-156 */
  {
    id: "REM-156",
    slug: "correction-reperformance",
    category: "remedy",
    goal: "compensation-remedy",
    name: "Reperformance or correction → execute → verify corrected outcome",
    purpose:
      "Produce the outcome that should have been produced, while the record still shows that the first one was wrong.",
    entity: {
      scope: "the original fulfillment or service, and the corrective obligation created against it",
      note: "Two records throughout. The original stays incorrect in the history, and the correction stands beside it rather than replacing it.",
    },
    distinctFrom: [
      {
        journey: "REM-155",
        because:
          "A replacement sends a different instance of the thing. A correction fixes the instance that exists, or performs the service again - which is why it has no allocation question and does have an original outcome that must not be overwritten.",
      },
    ],
    entry: "t.authorized",
    nodes: [
      {
        id: "t.authorized",
        kind: "trigger",
        event: "correction_or_reperformance_authorized",
        evidence: {
          requires: ["a correction or reperformance authorised as the remedy for an identified defect"],
          source: "authoritative",
        },
        next: "a.define",
      },
      {
        id: "a.define",
        kind: "action",
        does: "Define the defect, the affected scope, what a corrected outcome would actually look like, who owns it and any deadline. Record CORRECTION_REQUIRED",
        writes: [{ field: "remedy_log", mode: "append" }],
        next: "a.preserve",
      },
      {
        id: "a.preserve",
        kind: "action",
        does: "Preserve the original incorrect outcome as history. The correction is a new corrective action rather than an edit - rewriting the original as though it had always been right removes the evidence anything needed fixing, and with it the ability to see the same fault recur across other work",
        writes: [{ field: "remedy_log", mode: "append" }],
        next: "a.execute",
      },
      {
        id: "a.execute",
        kind: "action",
        does: "Execute the correction or reperformance against the defined corrected outcome",
        writes: [{ field: "remedy_log", mode: "append" }],
        next: "w.correction",
      },
      {
        id: "w.correction",
        kind: "wait",
        until: ["a corrected outcome is produced", "the correction fails"],
        onEvent: "c.outcome",
        timeout: {
          after: "the correction deadline",
          reason:
            "a correction that outlives its deadline leaves the customer with the original defect and a promise, which is worse than the defect alone",
        },
        onTimeout: "h.escalate",
        windowExtendsOnEngagement: false,
      },
      {
        id: "c.outcome",
        kind: "condition",
        asks: "What did the correction produce?",
        branches: [
          {
            label: "A corrected outcome",
            when: "the work was redone or the defect fixed across the affected scope",
            to: "h.verify",
          },
          {
            label: "Partially corrected",
            when: "part of the affected scope is now correct and part is not",
            to: "a.partial",
          },
          {
            label: "Failed",
            when: "the correction could not produce the required outcome",
            to: "h.alternative",
          },
        ],
      },
      {
        id: "a.partial",
        kind: "action",
        does: "Record what was corrected and what remains, explicitly. Half a correction recorded as a whole one closes an obligation that is still live",
        writes: [{ field: "remedy_log", mode: "append" }],
        next: "h.verify",
      },
      {
        id: "h.verify",
        kind: "handoff",
        to: "REM-158",
        on: "a correction producing an outcome",
        carries: [
          "the corrected outcome and the original defect it addressed",
          "any remaining uncorrected scope, stated explicitly",
        ],
      },
      {
        id: "h.alternative",
        kind: "handoff",
        to: "REM-157",
        on: "a correction that could not produce the required outcome",
        carries: [
          "what was attempted and why it failed",
          "the unresolved obligation and whatever remedies remain available for it",
        ],
      },
      {
        id: "h.escalate",
        kind: "handoff",
        to: "OWN-55",
        on: "a correction outliving its deadline",
        carries: ["the defect, the correction attempted and how long the customer has been waiting"],
      },
    ],
    guardrails: [
      "The original fulfillment is not rewritten as though it had always been correct.",
      "The original error history is preserved alongside the correction.",
      "An internal task completing is not a corrected business outcome.",
    ],
    reusableRule:
      "Correction resolves a defective outcome by creating a new corrective action while preserving the historical fact that the original outcome was incorrect.",
  },

  /* ------------------------------------------------------------ REM-157 */
  {
    id: "REM-157",
    slug: "remedy-selection",
    category: "remedy",
    goal: "compensation-remedy",
    name: "Remedy selection → resolve obligation → financial handoff if needed",
    purpose:
      "Choose the remedy that would actually satisfy the unresolved obligation, from the ones that genuinely exist.",
    entity: {
      scope: "the confirmed issue and the unresolved obligation behind it",
      note: "The obligation is the input, not the complaint. What is owed and what someone is upset about are related and not the same, and only the first can be satisfied.",
    },
    distinctFrom: [
      {
        journey: "FIN-137",
        because:
          "This decides which remedy applies. FIN-137 runs only if that decision is a refund, and then decides whether the refund is owed - a separate eligibility with separate rules.",
      },
    ],
    entry: "t.decision",
    nodes: [
      {
        id: "t.decision",
        kind: "trigger",
        event: "remedy_decision_required",
        evidence: {
          requires: ["a confirmed issue with an unresolved obligation and no remedy yet selected"],
          source: "authoritative",
        },
        next: "a.obligation",
      },
      {
        id: "a.obligation",
        kind: "action",
        does: "Identify the unresolved obligation precisely - what was owed that has not been delivered, or what was delivered that is not what was owed. The remedy is chosen to satisfy that rather than to satisfy the complaint, and compensation for the inconvenience is a separate question asked separately",
        writes: [{ field: "remedy_log", mode: "append" }],
        next: "a.evaluate",
      },
      {
        id: "a.evaluate",
        kind: "action",
        does: "Evaluate the remedies policy actually makes available for this obligation. A remedy that cannot be delivered is not offered - offering one converts a solvable problem into a broken second promise, and the second one costs more than the first",
        next: "c.choice",
      },
      {
        id: "c.choice",
        kind: "condition",
        asks: "Does the counterparty choose between remedies?",
        branches: [
          {
            label: "They choose",
            when: "more than one available remedy would satisfy the obligation and the preference is theirs",
            to: "a.present",
          },
          {
            label: "No choice to make",
            when: "one remedy applies, or policy determines it",
            to: "c.route",
          },
        ],
      },
      {
        id: "a.present",
        kind: "action",
        does: "Present only the options that are genuinely available, with what each would mean",
        writes: [{ field: "remedy_log", mode: "append" }],
        next: "w.selection",
      },
      {
        id: "w.selection",
        kind: "wait",
        until: ["a remedy is selected"],
        onEvent: "c.route",
        timeout: {
          after: "the selection window",
          reason:
            "an unanswered choice leaves the obligation unresolved, and a default that policy defines is better than an open case waiting on someone who has moved on",
        },
        onTimeout: "a.default",
        windowExtendsOnEngagement: false,
      },
      {
        id: "a.default",
        kind: "action",
        does: "Apply the remedy policy defines as the default where one exists, recording that no selection was made rather than presenting the default as a choice",
        writes: [{ field: "remedy_log", mode: "append" }],
        next: "c.route",
      },
      {
        id: "c.route",
        kind: "condition",
        asks: "Which remedy resolves the obligation?",
        branches: [
          {
            label: "Correction or reperformance",
            when: "what exists can be made right, or the service can be performed again",
            to: "h.correction",
          },
          {
            label: "Replacement",
            when: "a different instance of the thing is what satisfies the obligation",
            to: "h.replacement",
          },
          {
            label: "Return, before anything else",
            when: "the resource has to come back before a further remedy can be settled",
            to: "h.return",
          },
          {
            label: "Refund or credit",
            when: "money is the remedy the obligation calls for",
            to: "h.financial",
          },
          {
            label: "No remedy is owed",
            when: "the obligation turns out to be satisfied, or no remedy applies under policy",
            to: "x.no-remedy",
          },
        ],
      },
      {
        id: "h.correction",
        kind: "handoff",
        to: "REM-156",
        on: "correction or reperformance selected",
        carries: ["the defect and the corrected outcome required", "the affected scope"],
      },
      {
        id: "h.replacement",
        kind: "handoff",
        to: "REM-155",
        on: "replacement selected",
        carries: ["the original fulfillment and the defect", "the replacement scope required"],
      },
      {
        id: "h.return",
        kind: "handoff",
        to: "REM-152",
        on: "a return required before the remedy can be settled",
        carries: [
          "the resource to be returned and why",
          "the remedy that is waiting on it, so the return is not mistaken for the remedy itself",
        ],
      },
      {
        id: "h.financial",
        kind: "handoff",
        to: "FIN-137",
        on: "a refund or credit selected as the remedy",
        carries: [
          "the original transaction and the unresolved scope the refund would cover",
          "the explicit fact that this journey selected the remedy and did not decide the refund is owed",
        ],
      },
      {
        id: "x.no-remedy",
        kind: "exit",
        state: "no remedy owed; the obligation is satisfied or none applies",
        terminal: false,
        reEntry:
          "new evidence about the obligation re-opens this. Compensation for impact, if any is appropriate, is a separate decision that this outcome does not settle either way",
      },
    ],
    guardrails: [
      "A refund is not the universal remedy.",
      "Compensation and resolution may be separate, and resolving the obligation does not require compensating for it.",
      "Remedies that are not actually available are not offered.",
      "The selection starts from the unresolved obligation rather than from the complaint.",
    ],
    reusableRule:
      "Remedy selection should be driven by the unresolved obligation and available policy rather than by a default compensation mechanism.",
  },

  /* ------------------------------------------------------------ REM-158 */
  {
    id: "REM-158",
    slug: "remedy-outcome-verification",
    category: "remedy",
    goal: "compensation-remedy",
    name: "Remedy execution → verify outcome → close or continue recovery",
    purpose:
      "Check that the remedy actually satisfied the obligation, rather than that it was carried out.",
    entity: {
      scope: "the remedy and the issue it was chosen to resolve",
      note: "Two things, and completing the first does not close the second. A replacement can arrive and still be wrong.",
    },
    distinctFrom: [
      {
        journey: "FBK-46",
        because:
          "FBK-46 owns an issue's ownership and closure lifecycle. This verifies that a specific chosen remedy produced its intended business outcome - a narrower question, and one that can fail while the case is being managed perfectly well.",
      },
    ],
    entry: "t.started",
    nodes: [
      {
        id: "t.started",
        kind: "trigger",
        event: "remedy_execution_started",
        evidence: {
          requires: ["a selected remedy entering execution against an identified issue"],
          insufficientAlone: [
            "a remedy approved, which authorises it and performs none of it",
          ],
          source: "authoritative",
        },
        next: "a.track",
      },
      {
        id: "a.track",
        kind: "action",
        does: "Track the remedy's actual outcome - the replacement delivered, the correction verified, the refund confirmed, the service repeated successfully, the missing component received. What is tracked is the business outcome and never the internal task that was supposed to produce it",
        writes: [{ field: "remedy_log", mode: "append" }],
        next: "w.remedy",
      },
      {
        id: "w.remedy",
        kind: "wait",
        until: ["the remedy completes", "the remedy fails"],
        onEvent: "c.completed",
        timeout: {
          after: "the remedy window",
          reason:
            "a remedy whose outcome cannot be established is not a completed one, and issuing a second while the first may have landed produces two replacements or two refunds",
        },
        onTimeout: "a.unknown",
        windowExtendsOnEngagement: false,
      },
      {
        id: "a.unknown",
        kind: "action",
        does: "Record the remedy outcome as unknown and suppress any second remedy. In this category the second one is usually money or goods that have already gone out, and it is discovered by whoever receives two of them",
        writes: [
          { field: "remedy_log", mode: "append" },
          { field: "suppressed_sends", mode: "append" },
        ],
        next: "h.reconcile",
      },
      {
        id: "h.reconcile",
        kind: "handoff",
        to: "external:external-status-reconciliation",
        on: "a remedy whose outcome could not be established",
        carries: [
          "the remedy, its identifiers and everything last known about it",
          "the explicit instruction that no second remedy is issued until this is settled",
        ],
        suppresses: ["any further remedy against this obligation while the first is unresolved"],
      },
      {
        id: "c.completed",
        kind: "condition",
        asks: "Did the remedy complete?",
        branches: [
          { label: "Completed", when: "the remedy's own outcome was achieved", to: "c.resolved" },
          { label: "Failed", when: "the remedy did not complete", to: "h.alternative" },
        ],
      },
      {
        id: "c.resolved",
        kind: "condition",
        asks: "Does the completed remedy actually resolve the original issue?",
        branches: [
          {
            label: "Resolved",
            when: "the obligation the issue named is now satisfied",
            to: "a.resolve",
          },
          {
            label: "Partly resolved",
            when: "part of the obligation is satisfied and part remains",
            to: "a.remaining",
          },
          {
            label: "Not resolved",
            when: "the remedy completed and the obligation is still outstanding - the replacement arrived and is also wrong",
            to: "h.continue",
          },
        ],
      },
      {
        id: "a.resolve",
        kind: "action",
        does: "Record RESOLVED. The issue closes because the obligation it named is satisfied, not because an internal task is marked done",
        writes: [{ field: "remedy_log", mode: "append" }],
        next: "x.resolved",
      },
      {
        id: "x.resolved",
        kind: "exit",
        state: "RESOLVED; the original obligation is fully satisfied",
        terminal: false,
        reEntry:
          "a later report about the same thing is assessed for recurrence rather than treated as a fresh problem",
      },
      {
        id: "a.remaining",
        kind: "action",
        does: "Record the remaining obligation explicitly, so what is still owed is a stated scope rather than a vague sense that something is outstanding",
        writes: [{ field: "remedy_log", mode: "append" }],
        next: "h.continue",
      },
      {
        id: "h.continue",
        kind: "handoff",
        to: "REM-157",
        on: "an obligation still outstanding after a completed remedy",
        carries: [
          "what the remedy did achieve and what remains owed",
          "the fact that this remedy has already been tried, which usually changes which one is chosen next",
        ],
      },
      {
        id: "h.alternative",
        kind: "handoff",
        to: "REM-157",
        on: "a remedy that failed to complete",
        carries: ["why it failed", "the unresolved obligation and the remedies still available"],
      },
    ],
    guardrails: [
      "A remedy approved is not a remedy executed.",
      "A remedy executed is not necessarily the issue resolved.",
      "An issue is never closed solely because an internal remedy task is marked done.",
    ],
    reusableRule:
      "A remedy closes an issue only when the remedy's intended business outcome has actually satisfied the unresolved obligation.",
  },

  /* ------------------------------------------------------------ REM-159 */
  {
    id: "REM-159",
    slug: "compensation-decision",
    category: "remedy",
    goal: "compensation-remedy",
    name: "Compensation decision → eligibility → grant or reject → deliver",
    purpose:
      "Decide separately whether impact warrants something beyond fixing the problem, and confirm it actually arrived.",
    entity: {
      scope: "the compensation case and the experience or issue that prompted it",
      note: "Independent of the remedy. A resolved problem may warrant compensation and an unresolved one may not, and the two decisions answer different questions.",
    },
    distinctFrom: [
      {
        journey: "REM-157",
        because:
          "REM-157 chooses what satisfies the obligation. This decides whether the impact of the failure warrants something beyond that. A credit does not deliver the thing that was owed, and treating it as the remedy leaves someone holding money and the same broken outcome.",
      },
    ],
    entry: "t.considered",
    nodes: [
      {
        id: "t.considered",
        kind: "trigger",
        event: "compensation_consideration_appropriate",
        evidence: {
          requires: [
            "an impact or inconvenience that policy treats as potentially warranting compensation, beyond whatever remedy is fixing the problem",
          ],
          insufficientAlone: [
            "an issue existing, which is a problem to solve rather than an impact to compensate",
            "a customer asking for compensation",
          ],
          source: "authoritative",
        },
        next: "a.assess",
      },
      {
        id: "a.assess",
        kind: "action",
        does: "Determine the reason, the impact, what remedy already exists or is under way, the policy-defined eligibility and the compensation being considered. Compensation answers impact and inconvenience - it is not the thing that fixes the problem, and a resolved issue does not automatically require one",
        writes: [{ field: "compensation_log", mode: "append" }],
        next: "c.duplicate",
      },
      {
        id: "c.duplicate",
        kind: "condition",
        asks: "Has compensation already been granted for this impact?",
        branches: [
          {
            label: "Already compensated",
            when: "a grant covering the same impact exists",
            to: "x.already",
          },
          {
            label: "Nothing granted",
            when: "no compensation covers this impact",
            to: "c.policy",
          },
        ],
      },
      {
        id: "x.already",
        kind: "exit",
        state: "already compensated for this impact",
        terminal: false,
        reEntry:
          "a further, distinct impact is assessed on its own. A second grant for the same one is a duplicate rather than a gesture, and it is found by accounting",
      },
      {
        id: "c.policy",
        kind: "condition",
        asks: "Is compensation eligibility and form defined by policy?",
        branches: [
          {
            label: "Defined",
            when: "policy states what impact warrants what compensation, and in what form",
            to: "c.eligible",
          },
          {
            label: "Not defined",
            when: "no policy covers compensation for this kind of impact",
            to: "h.undefined",
          },
        ],
      },
      {
        id: "h.undefined",
        kind: "handoff",
        to: "DEC-181",
        on: "compensation considered with no governing policy",
        carries: [
          "the impact and what remedy is already under way",
          "the explicit fact that no amount or rule was invented in order to decide it",
        ],
      },
      {
        id: "c.eligible",
        kind: "condition",
        asks: "What does the policy determine?",
        branches: [
          { label: "Eligible", when: "the impact meets the policy's threshold", to: "a.authorize" },
          {
            label: "Not eligible",
            when: "the impact does not meet it - which is the ordinary case for a problem that was fixed promptly",
            to: "x.none",
          },
        ],
      },
      {
        id: "x.none",
        kind: "exit",
        state: "no compensation; the underlying remedy stands on its own",
        terminal: false,
        reEntry:
          "a worsening impact, or a remedy that fails, may change the assessment. Resolving a problem well is not an impact requiring compensation",
      },
      {
        id: "a.authorize",
        kind: "action",
        does: "Authorise the compensation the policy defines, in its defined form and amount",
        writes: [{ field: "compensation_log", mode: "append" }],
        next: "c.form",
      },
      {
        id: "c.form",
        kind: "condition",
        asks: "What form does the compensation take?",
        branches: [
          {
            label: "Money",
            when: "a refund, a credit or a goodwill payment",
            to: "h.financial",
          },
          {
            label: "An entitlement or benefit",
            when: "a service credit, an extension, an upgrade or another right",
            to: "h.entitlement",
          },
          {
            label: "Something delivered operationally",
            when: "goods, a service, or another thing that has to arrive",
            to: "w.delivery",
          },
        ],
      },
      {
        id: "h.financial",
        kind: "handoff",
        to: "FIN-137",
        on: "compensation taking a financial form",
        carries: [
          "the authorised amount and its basis",
          "the explicit fact that this is compensation for impact rather than a refund of what was paid, which are different things against the same transaction",
        ],
      },
      {
        id: "h.entitlement",
        kind: "handoff",
        to: "ACC-71",
        on: "compensation taking the form of an entitlement or benefit",
        carries: [
          "the entitlement being granted, its scope and its validity",
          "the compensation case, so the grant can be traced to what it was for",
        ],
      },
      {
        id: "w.delivery",
        kind: "wait",
        until: ["the compensation is delivered or applied"],
        onEvent: "a.verify",
        timeout: {
          after: "the delivery window",
          reason:
            "authorised is not delivered, and a compensation that was promised and never applied is worse than one that was never offered",
        },
        onTimeout: "h.escalate",
        windowExtendsOnEngagement: false,
      },
      {
        id: "a.verify",
        kind: "action",
        does: "Verify the compensation actually reached the recipient. A credit that was never applied is a promise the customer discovers was empty, usually while looking for it",
        writes: [{ field: "compensation_log", mode: "append" }],
        next: "x.delivered",
      },
      {
        id: "x.delivered",
        kind: "exit",
        state: "compensation delivered and verified; the underlying obligation is a separate matter",
        terminal: false,
        reEntry:
          "compensation is recorded against this impact and does not settle whether the original obligation was resolved",
      },
      {
        id: "h.escalate",
        kind: "handoff",
        to: "OWN-55",
        on: "authorised compensation that was not delivered",
        carries: ["what was authorised, when, and what has not arrived"],
      },
    ],
    guardrails: [
      "Compensation is not issue resolution.",
      "Resolving an issue does not automatically require compensation.",
      "Compensation amounts and rules are never invented.",
      "Duplicate compensation for the same impact is prevented.",
    ],
    reusableRule:
      "Compensation is an independently authorized response to impact or inconvenience and should not be confused with fixing the underlying problem.",
  },

  /* ------------------------------------------------------------ REM-160 */
  {
    id: "REM-160",
    slug: "post-remedy-recurrence",
    category: "remedy",
    goal: "compensation-remedy",
    name: "Post-remedy reopen → validate recurrence → continue or new issue",
    purpose:
      "Tell a recurrence of the same problem apart from a new one, and from a remedy that never actually finished.",
    entity: {
      scope: "the previously resolved issue and the new report made against it",
      note: "Three possible relationships and they lead to three different places. Assuming any one of them is how a case is duplicated, buried or reopened for the wrong reason.",
    },
    entry: "t.reported",
    nodes: [
      {
        id: "t.reported",
        kind: "trigger",
        event: "problem_reported_after_remedy",
        evidence: {
          requires: ["a problem reported against a fulfillment whose issue was previously remedied or closed"],
          source: "declared",
        },
        next: "a.compare",
      },
      {
        id: "a.compare",
        kind: "action",
        does: "Compare the new report against the original issue - the same fulfillment, the same scope, the same defect, or something adjacent that only sounds alike. A repeated complaint is not automatically the same issue, and a customer describing a second problem in the words they used for the first is common",
        writes: [{ field: "issue_log", mode: "append" }],
        next: "c.relationship",
      },
      {
        id: "c.relationship",
        kind: "condition",
        asks: "What is its relationship to the original?",
        branches: [
          {
            label: "The same problem, recurred or never resolved",
            when: "the same defect on the same scope is present again",
            to: "a.reopen",
          },
          {
            label: "A distinct new problem",
            when: "a different defect, a different scope, or a different fulfillment",
            to: "a.new",
          },
          {
            label: "The previous remedy never actually completed",
            when: "the remedy was recorded as done and its business outcome never arrived",
            to: "h.resume",
          },
        ],
      },
      {
        id: "a.new",
        kind: "action",
        does: "Create a new issue, linked to the prior context where that context is useful. Forcing a distinct problem into an existing case buries it behind a history that does not apply to it",
        writes: [{ field: "issue_log", mode: "append" }],
        next: "h.new",
      },
      {
        id: "h.new",
        kind: "handoff",
        to: "REM-151",
        on: "a distinct new problem after a previous remedy",
        carries: [
          "the new report and the prior context where it helps",
          "the explicit fact that this is not a recurrence, so the prior remedy history does not colour the assessment",
        ],
      },
      {
        id: "h.resume",
        kind: "handoff",
        to: "REM-158",
        on: "a remedy recorded as complete whose outcome never arrived",
        carries: [
          "the remedy and what was supposed to have happened",
          "the explicit fact that this is an unfinished remedy rather than a new issue, so no duplicate is created",
        ],
      },
      {
        id: "a.reopen",
        kind: "action",
        does: "Reopen the original issue, preserving every previous remedy attempt and its outcome. The reopen count is evidence worth having and does not by itself determine fault or entitle anyone to compensation - it is an input to diagnosis rather than a conclusion",
        writes: [{ field: "issue_log", mode: "append" }],
        next: "a.recalculate",
      },
      {
        id: "a.recalculate",
        kind: "action",
        does: "Recalculate the current obligation from what has actually been delivered across every remedy attempt, rather than from the original order",
        writes: [{ field: "issue_log", mode: "append" }],
        next: "c.diagnosis",
      },
      {
        id: "c.diagnosis",
        kind: "condition",
        asks: "Does the recurrence warrant reassessing the cause?",
        branches: [
          {
            label: "Reassess",
            when: "a remedy was applied correctly and the problem returned, which usually means the diagnosis was wrong rather than the execution",
            to: "h.escalate",
          },
          {
            label: "Retry the remedy path",
            when: "the previous attempt failed in execution rather than in diagnosis",
            to: "h.remedy",
          },
        ],
      },
      {
        id: "h.escalate",
        kind: "handoff",
        to: "OWN-55",
        on: "a remedy that was applied correctly and did not hold",
        carries: [
          "every remedy attempted and its outcome",
          "the fact that repeating the same remedy without reassessing the cause produces the same failure at greater cost",
        ],
      },
      {
        id: "h.remedy",
        kind: "handoff",
        to: "REM-157",
        on: "a reopened issue needing a remedy decision",
        carries: [
          "the recalculated obligation and every remedy already tried",
          "which of them failed in execution, which is what makes a repeat worth attempting",
        ],
      },
    ],
    guardrails: [
      "A repeated complaint is not automatically the same issue.",
      "Previous resolutions and remedy attempts are never erased.",
      "The reopen count is useful evidence and does not by itself determine fault or compensation.",
      "A remedy that never completed is resumed rather than duplicated.",
    ],
    reusableRule:
      "Post-remedy recurrence should reopen the original obligation only when the new evidence shows that the same problem remains unresolved or has genuinely recurred.",
  },
];
