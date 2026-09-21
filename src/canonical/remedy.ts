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
    channels: ["email"],
    name: "Post-completion issue → validate → remedy route",
    shortName: "Post-Purchase Issue Recovery",
    purpose:
      "Establish whether something delivered has left an obligation unresolved, and which recovery mechanism could satisfy it.",
    entity: {
      scope: "the completed fulfillment or service, and the specific problem reported against it",
      note: "The issue is scoped to the fulfillment it concerns. A second problem with the same order is a second issue unless it is the same defect described again.",
      instanceKey: [
        "issue_id"
      ],
      concurrency: "one-active-per-key"
    },
    distinctFrom: [
      {
        journey: "FBK-43",
        because:
          "FBK-43 starts from someone's account of an experience and asks whether any operational issue exists. This starts from a concrete problem with something already delivered and asks which recovery route would fix it - the obligation is known to exist and the question is what satisfies it.",
      },
    ],
    objective: "Establish whether something delivered has left an obligation unresolved, and which recovery mechanism could satisfy it.",
    eligibility: [
      "a concrete problem with a completed fulfillment or service: a wrong item or result, damaged output, a missing component, a quality problem, a service defect, an incorrect configuration or an incomplete outcome",
      "no instance of this journey is already open for the the completed fulfillment or service",
      "hard gates (GLB-31) allow communication for this purpose"
    ],
    suppressions: [
      {
        "id": "s.g1",
        "label": "CANONICAL_RULE",
        "text": "An issue reported is not a confirmed defect."
      },
      {
        "id": "s.g2",
        "label": "CANONICAL_RULE",
        "text": "Negative feedback alone does not establish remedy eligibility."
      },
      {
        "id": "s.g3",
        "label": "CANONICAL_RULE",
        "text": "Not every issue defaults to a refund."
      },
      {
        "id": "s.g4",
        "label": "CANONICAL_RULE",
        "text": "An existing case covering the same obligation suppresses a second recovery lifecycle."
      }
    ],
    contact: {
      "defaultPriority": "service",
      "pressureClass": "service",
      "localCap": {
        "value": {
          "key": "post_completion.touches",
          "rule": "Every touch runs against a budget fixed when the instance opened; the budget is the plan's own length, and no touch is repeated because nothing could tell whether it arrived.",
          "default": {
            "value": 1,
            "confidence": "high",
            "basis": "corpus-rule",
            "applicableWhen": "GLB-24; the graph's own touch count"
          },
          "required": false
        },
        "appliesTo": "all"
      },
      "cooldown": {
        "key": "post_completion.cooldown",
        "rule": "This journey is per the completed fulfillment or service; a later instance concerns a different the completed fulfillment or service and no cooldown applies between them.",
        "default": {
          "value": "none",
          "confidence": "high",
          "basis": "corpus-rule",
          "applicableWhen": "the entity note: one instance per entity"
        },
        "required": false
      },
      "competition": {
        "exclusionGroup": "service-request",
        "scope": "topic",
        "precedence": "second in the service-request group: below the support request acknowledgement (REM-305), which owns what the requester hears first and hands the case over only once the acknowledgement window has closed with the request still open; above remedy selection (REM-157), which speaks only after this journey has established that an obligation exists",
        "onLoss": "suppressed"
      }
    },
    channelStrategy: {
      "roles": [
        {
          "role": "persistent",
          "channels": [
            "email"
          ],
          "when": "the message has to be kept and survive until the person can act on it"
        }
      ],
      "fallback": "same-role-other-channel",
      "label": "RECOMMENDED_DEFAULT"
    },
    orchestration: {
      "strategy": "single-notice",
      "touches": [
        {
          "id": "t1",
          "stage": "acknowledge",
          "action": "a.acknowledge",
          "prerequisites": [
            "c.duplicate",
            "c.actionable"
          ],
          "purpose": "Acknowledge and explain, closing according to policy.",
          "channelRoles": [
            "persistent"
          ],
          "mandatory": false,
          "label": "CANONICAL_RULE"
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
          "issue_id",
          "order_id",
          "reported_problem",
          "existing_case_ref",
          "assessment",
          "issue_log"
        ],
        "optional": []
      }
    },
    measurement: {
      "journeyOutcome": {
        "type": "exit-or-handoff",
        "refs": [
          "x.attached",
          "x.no-defect",
          "h.remedy"
        ]
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
        "post-purchase issue recovery",
        "order problem report",
        "wrong item received",
        "damaged on arrival",
        "post-delivery complaint"
      ],
      "useCases": [
        "a concrete problem with something delivered, checked for an unresolved obligation",
        "a report that establishes no obligation, acknowledged without manufacturing a defect"
      ]
    },
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
        idempotencyKey: "order_id + a.capture",
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
        idempotencyKey: "order_id + a.attach",
      },
      {
        id: "x.attached",
        kind: "exit",
        state: "attached to the existing recovery case",
        terminal: false,
        reEntry:
          "if that case closes with the problem still present, the recurrence is assessed on its own terms rather than as a fresh report",
        class: "suppression",
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
        execution: "communication",
        idempotencyKey: "order_id + a.acknowledge",
      },
      {
        id: "x.no-defect",
        kind: "exit",
        state: "heard; no unresolved obligation and no remedy owed",
        terminal: false,
        reEntry:
          "new evidence of an actual defect re-opens this. Repetition of the same report is itself worth reading, without becoming a defect by repetition",
        class: "no-action",
      },
      {
        id: "a.classify",
        kind: "action",
        does: "Classify the remedy route the problem actually implies - a correction, a reperformance, a replacement, a return, a refund review, a service recovery, or another policy-defined remedy. Refund is one route among several rather than the default, and choosing it because it is the easiest to execute leaves the customer without the thing they wanted",
        writes: [{ field: "issue_log", mode: "append" }],
        next: "h.remedy",
        idempotencyKey: "order_id + a.classify",
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
    channels: ["task", "email"],
    name: "Return request → eligibility → authorize, reject or review",
    shortName: "Return Request",
    purpose:
      "Decide whether something may enter a return process, as a decision separate from whether money is owed.",
    entity: {
      scope: "the return request and the original fulfillment it concerns",
      note: "Return eligibility and refund eligibility are different questions with different rules. Authorising a return decides only the first.",
      instanceKey: [
        "return_request_id"
      ],
      concurrency: "one-active-per-key"
    },
    distinctFrom: [
      {
        journey: "REM-153",
        because:
          "This grants permission for a resource to come back. REM-153 tracks whether it actually does, which fails independently and often.",
      },
    ],
    objective: "Decide whether something may enter a return process, as a decision separate from whether money is owed.",
    eligibility: [
      "a request to send back an identified item, resource or deliverable",
      "no instance of this journey is already open for the the return request and the original fulfillment it concerns",
      "hard gates (GLB-31) allow communication for this purpose"
    ],
    suppressions: [
      {
        "id": "s.g1",
        "label": "CANONICAL_RULE",
        "text": "A return requested is not a return authorized."
      },
      {
        "id": "s.g2",
        "label": "CANONICAL_RULE",
        "text": "Return eligibility rules are never invented."
      },
      {
        "id": "s.g3",
        "label": "CANONICAL_RULE",
        "text": "Refund eligibility and return eligibility may be different decisions with different answers."
      }
    ],
    contact: {
      "defaultPriority": "service",
      "pressureClass": "service",
      "localCap": {
        "value": {
          "key": "return_authorization.touches",
          "rule": "Every touch runs against a budget fixed when the instance opened; the budget is the plan's own length, and no touch is repeated because nothing could tell whether it arrived.",
          "default": {
            "value": 2,
            "confidence": "high",
            "basis": "corpus-rule",
            "applicableWhen": "GLB-24; a review record and one decision notice"
          },
          "required": false
        },
        "appliesTo": "all"
      },
      "cooldown": {
        "key": "return_authorization.cooldown",
        "rule": "This journey is per the return request and the original fulfillment it concerns; a later instance concerns a different the return request and the original fulfillment it concerns and no cooldown applies between them.",
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
          "role": "human",
          "channels": [
            "task"
          ],
          "when": "the step is carried out by a person - a call, a task, a visit - and recorded as done by them"
        },
        {
          "role": "persistent",
          "channels": [
            "email"
          ],
          "when": "the message has to be kept and survive until the person can act on it"
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
          "stage": "notify-rejection",
          "action": "a.notify-rejection",
          "prerequisites": [
            "c.applicable",
            "c.policy",
            "c.eligible"
          ],
          "purpose": "Tell the requester the return was refused and the governing reason, whether policy ruled it out directly or a reviewer did.",
          "channelRoles": [
            "persistent"
          ],
          "mandatory": false,
          "label": "CANONICAL_RULE"
        },
        {
          "id": "t2",
          "stage": "notify-authorization",
          "action": "a.notify-authorization",
          "prerequisites": [
            "c.applicable",
            "c.policy",
            "c.eligible"
          ],
          "purpose": "Tell the requester the return is authorised, within what scope and by what method, and that authorisation permits the resource to come back without deciding that money is owed.",
          "channelRoles": [
            "persistent"
          ],
          "mandatory": false,
          "label": "CANONICAL_RULE",
          "destination": {
            "target": "return-instructions",
            "boundTo": "return_request_id",
            "mustNotClaim": [
              "that a refund is owed"
            ]
          }
        },
        {
          "id": "t3",
          "stage": "review",
          "action": "a.review",
          "prerequisites": [
            "c.applicable",
            "c.policy",
            "c.eligible"
          ],
          "purpose": "Record RETURN_UNDER_REVIEW and gather what the decision requires.",
          "channelRoles": [
            "human"
          ],
          "mandatory": false,
          "label": "CANONICAL_RULE"
        }
      ],
      "noAction": [
        "s.g1",
        "s.g2",
        "s.g3"
      ]
    },
    implementation: {
      "attributes": {
        "required": [
          "return_request_id",
          "original_fulfillment_id",
          "requester_id",
          "eligibility_policy",
          "decision_sla",
          "return_log"
        ],
        "optional": []
      }
    },
    measurement: {
      "journeyOutcome": {
        "type": "exit-or-handoff",
        "refs": [
          "x.rejected",
          "h.alternative",
          "h.undefined",
          "h.escalate",
          "h.transit"
        ]
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
        "return request",
        "return authorisation",
        "RMA",
        "return eligibility",
        "send it back"
      ],
      "useCases": [
        "whether something may enter a return process, decided separately from money",
        "a return needing review, held without authorising anything"
      ]
    },
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
        idempotencyKey: "return_request_id + a.capture",
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
          "the request and the unresolved obligation behind it - original_fulfillment_id becomes REM-157's obligation_id",
          "the fact that no return route exists, so the remedy is something else rather than nothing",
          "a fresh issue_id, minted at this handoff and deterministically derived from return_request_id - REM-152 has no issue concept of its own, so REM-157's instance is opened here rather than carried",
        ],
        contract: { requiredFields: ["issue_id", "obligation_id"] },
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
        next: "a.notify-rejection",
        idempotencyKey: "return_request_id + a.reject",
      },
      {
        id: "a.notify-rejection",
        kind: "action",
        does: "Tell the requester the return was refused and the governing reason, whether policy ruled it out directly or a reviewer did. Someone holding an item they were told nothing about goes on believing a return is still coming",
        execution: "communication",
        next: "x.rejected",
        idempotencyKey: "return_request_id + a.notify-rejection",
      },
      {
        id: "x.rejected",
        kind: "exit",
        state: "RETURN_REJECTED; the original fulfillment is unchanged",
        terminal: false,
        reEntry:
          "a return refused does not settle whether another remedy is owed - that question is separate and is asked separately",
        class: "failure",
      },
      {
        id: "a.review",
        kind: "action",
        does: "Record RETURN_UNDER_REVIEW and gather what the decision requires. Nothing is authorised while it is under review",
        writes: [{ field: "return_log", mode: "append" }],
        next: "w.decision",
        execution: "human",
        idempotencyKey: "return_request_id + a.review",
      },
      {
        id: "w.decision",
        kind: "wait",
        until: [
          "decision_recorded"
        ],
        onEvent: "c.decision",
        timeout: {
          "after": {
            "key": "return_authorization.decision",
            "rule": "The decision SLA.",
            "class": "decision-sla",
            "required": true
          },
          "reason": "a return request left undecided leaves someone holding something they were told they might send back, with no way to know whether they may",
          "relativeTo": "trigger"
        },
        onTimeout: "h.escalate",
        windowExtendsOnEngagement: false,
        recheck: "the the return request and the original fulfillment it concerns re-read from the system of record before acting on the timeout",
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
        next: "a.notify-authorization",
        idempotencyKey: "return_request_id + a.authorize",
      },
      {
        id: "a.notify-authorization",
        kind: "action",
        does: "Tell the requester the return is authorised, within what scope and by what method, and that authorisation permits the resource to come back without deciding that money is owed. Leaving them to discover the answer from the transit lifecycle makes the next step arrive before the decision does",
        execution: "communication",
        next: "h.transit",
        idempotencyKey: "return_request_id + a.notify-authorization",
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
    channels: [],
    name: "Return authorized → in transit, received, lost or expired",
    shortName: "Return Transit Resolution",
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
    channels: [],
    name: "Returned item or deliverable → inspect → accept, reject or partial",
    shortName: "Return Inspection",
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
    channels: [],
    name: "Replacement decision → allocate → fulfill → confirm",
    shortName: "Replacement Fulfillment",
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
    channels: [],
    name: "Reperformance or correction → execute → verify corrected outcome",
    shortName: "Corrective Reperformance",
    purpose:
      "Produce the outcome that should have been produced, while the record still shows that the first one was wrong.",
    entity: {
      scope: "the original fulfillment or service, and the corrective obligation created against it",
      note: "Two records throughout. The original stays incorrect in the history, and the correction stands beside it rather than replacing it.",
      instanceKey: [
        "correction_id"
      ],
      concurrency: "one-active-per-key"
    },
    distinctFrom: [
      {
        journey: "REM-155",
        because:
          "A replacement sends a different instance of the thing. A correction fixes the instance that exists, or performs the service again - which is why it has no allocation question and does have an original outcome that must not be overwritten.",
      },
    ],
    objective: "Produce the outcome that should have been produced, while the record still shows that the first one was wrong.",
    eligibility: [
      "a correction or reperformance authorised as the remedy for an identified defect",
      "no instance of this journey is already open for the the original fulfillment or service",
      "hard gates (GLB-31) allow communication for this purpose"
    ],
    suppressions: [
      {
        "id": "s.g1",
        "label": "CANONICAL_RULE",
        "text": "The original fulfillment is not rewritten as though it had always been correct."
      },
      {
        "id": "s.g2",
        "label": "CANONICAL_RULE",
        "text": "The original error history is preserved alongside the correction."
      },
      {
        "id": "s.g3",
        "label": "CANONICAL_RULE",
        "text": "An internal task completing is not a corrected business outcome."
      }
    ],
    implementation: {
      "attributes": {
        "required": [
          "correction_id",
          "original_fulfillment_id",
          "required_outcome",
          "correction_deadline_at",
          "remedy_log"
        ],
        "optional": []
      }
    },
    measurement: {
      "journeyOutcome": {
        "type": "handoff",
        "refs": [
          "h.verify",
          "h.alternative",
          "h.escalate"
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
        "corrective reperformance",
        "redo the service",
        "correction of a wrong outcome",
        "re-performance"
      ],
      "useCases": [
        "the outcome that should have been produced, produced while the record shows the first was wrong",
        "a correction that cannot produce the outcome, sent back for another remedy"
      ]
    },
    entry: "t.authorized",
    nodes: [
      {
        id: "t.authorized",
        kind: "trigger",
        event: "correction_or_reperformance_authorized",
        evidence: {
          requires: ["a correction or reperformance authorised as the remedy for an identified defect"],
          insufficientAlone: [
            "a complaint with no remedy decision behind it",
            "a refund, which is a different remedy",
            "an internal task created without an authorised correction"
          ],
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
        idempotencyKey: "correction_id + a.define",
      },
      {
        id: "a.preserve",
        kind: "action",
        does: "Preserve the original incorrect outcome as history. The correction is a new corrective action rather than an edit - rewriting the original as though it had always been right removes the evidence anything needed fixing, and with it the ability to see the same fault recur across other work",
        writes: [{ field: "remedy_log", mode: "append" }],
        next: "a.execute",
        idempotencyKey: "correction_id + a.preserve",
      },
      {
        id: "a.execute",
        kind: "action",
        does: "Execute the correction or reperformance against the defined corrected outcome",
        writes: [{ field: "remedy_log", mode: "append" }],
        next: "w.correction",
        idempotencyKey: "correction_id + a.execute",
      },
      {
        id: "w.correction",
        kind: "wait",
        until: [
          "correction_produced",
          "correction_failed"
        ],
        onEvent: "c.outcome",
        timeout: {
          "after": {
            "key": "correction_reperformance.correction",
            "rule": "The correction deadline.",
            "class": "attribute-bound",
            "required": true
          },
          "reason": "a correction that outlives its deadline leaves the customer with the original defect and a promise, which is worse than the defect alone",
          "relativeTo": "attribute",
          "attribute": "correction_deadline_at"
        },
        onTimeout: "h.escalate",
        windowExtendsOnEngagement: false,
        recheck: "the the original fulfillment or service re-read from the system of record before acting on the timeout",
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
        idempotencyKey: "correction_id + a.partial",
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
    channels: ["email", "in-app"],
    name: "Remedy selection → resolve obligation → financial handoff if needed",
    shortName: "Remedy Confirmation",
    purpose:
      "Choose the remedy that would actually satisfy the unresolved obligation, from the ones that genuinely exist.",
    entity: {
      scope: "the confirmed issue and the unresolved obligation behind it",
      note: "The obligation is the input, not the complaint. What is owed and what someone is upset about are related and not the same, and only the first can be satisfied.",
      instanceKey: [
        "issue_id"
      ],
      concurrency: "one-active-per-key"
    },
    distinctFrom: [
      {
        journey: "FIN-137",
        because:
          "This decides which remedy applies. FIN-137 runs only if that decision is a refund, and then decides whether the refund is owed - a separate eligibility with separate rules.",
      },
      {
        journey: "FIN-302",
        because:
          "This journey says which remedy will resolve the obligation, and a refund is only one of the answers it can give. FIN-302 says that money is actually moving and whether it arrived, which is two decisions further down the chain - a remedy confirmed here is never money arrived, and this journey never announces the movement.",
      },
    ],
    objective: "Choose the remedy that would actually satisfy the unresolved obligation, from the ones that genuinely exist.",
    eligibility: [
      "a confirmed issue with an unresolved obligation and no remedy yet selected",
      "no instance of this journey is already open for the the confirmed issue and the unresolved obligation behind it",
      "hard gates (GLB-31) allow communication for this purpose"
    ],
    suppressions: [
      {
        "id": "s.g1",
        "label": "CANONICAL_RULE",
        "text": "A refund is not the universal remedy."
      },
      {
        "id": "s.g2",
        "label": "CANONICAL_RULE",
        "text": "Compensation and resolution may be separate, and resolving the obligation does not require compensating for it."
      },
      {
        "id": "s.g3",
        "label": "CANONICAL_RULE",
        "text": "Remedies that are not actually available are not offered."
      },
      {
        "id": "s.g4",
        "label": "CANONICAL_RULE",
        "text": "The selection starts from the unresolved obligation rather than from the complaint."
      }
    ],
    contact: {
      "defaultPriority": "service",
      "pressureClass": "service",
      "localCap": {
        "value": {
          "key": "remedy_selection.touches",
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
        "key": "remedy_selection.cooldown",
        "rule": "This journey is per the confirmed issue and the unresolved obligation behind it; a later instance concerns a different the confirmed issue and the unresolved obligation behind it and no cooldown applies between them.",
        "default": {
          "value": "none",
          "confidence": "high",
          "basis": "corpus-rule",
          "applicableWhen": "the entity note: one instance per entity"
        },
        "required": false
      },
      "competition": {
        "exclusionGroup": "service-request",
        "scope": "topic",
        "precedence": "lowest in the service-request group: it speaks only once the issue assessment (REM-151) has established the unresolved obligation and handed the case over, and while either the support request acknowledgement (REM-305) or that assessment holds the case this journey is suppressed for it - a remedy offered before anybody has said the problem is real is an admission nobody made",
        "onLoss": "suppressed"
      }
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
          "role": "in-session",
          "channels": [
            "in-app"
          ],
          "when": "the person is active in the product and the action is taken there"
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
          "stage": "present",
          "action": "a.present",
          "prerequisites": [
            "c.choice"
          ],
          "purpose": "Present only the options that are genuinely available, with what each would mean",
          "channelRoles": [
            "persistent",
            "in-session"
          ],
          "mandatory": false,
          "label": "CANONICAL_RULE",
          "destination": {
            "target": "remedy-options",
            "boundTo": "issue_id",
            "mustNotClaim": [
              "a remedy that is not actually available"
            ]
          }
        },
        {
          "id": "t2",
          "stage": "no-remedy",
          "action": "a.no-remedy",
          "prerequisites": [
            "c.choice",
            "c.route"
          ],
          "purpose": "State that the obligation is considered satisfied, or that policy provides no remedy for the facts as confirmed, and name a separate appeal or escalation route only where one actually exists.",
          "channelRoles": [
            "persistent",
            "in-session"
          ],
          "mandatory": false,
          "label": "CANONICAL_RULE",
          "destination": {
            "target": "appeal-or-escalation-route",
            "boundTo": "issue_id"
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
          "issue_id",
          "obligation_id",
          "available_remedies",
          "counterparty_chooses",
          "remedy_log"
        ],
        "optional": []
      }
    },
    measurement: {
      "journeyOutcome": {
        "type": "exit-or-handoff",
        "refs": [
          "x.no-remedy",
          "h.correction",
          "h.replacement",
          "h.return",
          "h.financial"
        ]
      },
      "businessOutcome": {
        "event": "remedy_selected",
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
        "remedy confirmation",
        "remedy selection",
        "choose a remedy",
        "resolution options",
        "refund or replacement choice"
      ],
      "useCases": [
        "the remedy that would actually satisfy the obligation, chosen from the ones that exist",
        "no remedy owed, stated with a separate appeal route"
      ]
    },
    entry: "t.decision",
    nodes: [
      {
        id: "t.decision",
        kind: "trigger",
        event: "remedy_decision_required",
        evidence: {
          requires: ["a confirmed issue with an unresolved obligation and no remedy yet selected"],
          insufficientAlone: [
            "a complaint received but not yet established as an operational fault, which is FBK-43's question",
            "a refund request, which presumes the remedy this journey has not yet decided",
          ],
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
        idempotencyKey: "obligation_id + issue_id + a.obligation",
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
        execution: "communication",
        idempotencyKey: "obligation_id + issue_id + a.present",
      },
      {
        id: "w.selection",
        kind: "wait",
        until: [
          "remedy_selected"
        ],
        onEvent: "c.route",
        timeout: {
          "after": {
            "key": "remedy_selection.selection",
            "rule": "The choice of remedy is waited for a bounded period from the options being presented; an unanswered choice takes the policy default.",
            "class": "response-window",
            "required": true
          },
          "reason": "an unanswered choice leaves the obligation unresolved, and a default that policy defines is better than an open case waiting on someone who has moved on",
          "relativeTo": "previous-touch"
        },
        onTimeout: "a.default",
        windowExtendsOnEngagement: false,
        recheck: "the the confirmed issue and the unresolved obligation behind it re-read from the system of record before acting on the timeout",
      },
      {
        id: "a.default",
        kind: "action",
        does: "Apply the remedy policy defines as the default where one exists, recording that no selection was made rather than presenting the default as a choice",
        writes: [{ field: "remedy_log", mode: "append" }],
        next: "c.route",
        idempotencyKey: "obligation_id + issue_id + a.default",
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
            when: "the resource has to come back before a further remedy can be settled, and a return was not already rejected for this issue - a rejected return does not get re-selected when REM-152's own h.alternative routes back here; that path already arrives at c.route with the rejection recorded, and this branch's condition is false the second time",
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
            to: "a.no-remedy",
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
        id: "a.no-remedy",
        kind: "action",
        does: "State that the obligation is considered satisfied, or that policy provides no remedy for the facts as confirmed, and name a separate appeal or escalation route only where one actually exists. This journey opens from a confirmed issue - reaching no remedy and saying nothing leaves the person believing the question is still open",
        execution: "communication",
        next: "x.no-remedy",
        idempotencyKey: "obligation_id + issue_id + a.no-remedy",
      },
      {
        id: "x.no-remedy",
        kind: "exit",
        state: "no remedy owed; the obligation is satisfied or none applies",
        terminal: false,
        reEntry:
          "new evidence about the obligation re-opens this. Compensation for impact, if any is appropriate, is a separate decision that this outcome does not settle either way",
        class: "success",
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
    channels: [],
    name: "Remedy execution → verify outcome → close or continue recovery",
    shortName: "Remedy Outcome Verification",
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
    channels: [],
    name: "Compensation decision → eligibility → grant or reject → deliver",
    shortName: "Compensation Eligibility",
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
    channels: [],
    name: "Post-remedy reopen → validate recurrence → continue or new issue",
    shortName: "Remedy Recurrence Assessment",
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
  {
    "id": "REM-305",
    "slug": "support-request-acknowledgement",
    "category": "remedy",
    "goal": "routing-assignment",
    "channels": ["email", "in-app"],
    "name": "Service request received → acknowledged or already resolved → closed or handed to the work",
    "shortName": "Support Request Acknowledgement",
    "purpose": "Tell somebody who raised a problem that it exists, is owned and is not lost - once, transactionally, and without promising an outcome nobody has decided yet.",
    "objective": "Remove the requester's doubt that the request arrived, and pass a request that stays open to the journey that owns the work rather than filling the silence with updates.",
    "entity": {
      "scope": "one service request as it was raised, and the problem it names",
      "note": "The request is the subject, not the problem behind it: an established problem becomes an issue owned elsewhere. One instance per request; a second description of the same problem while a request is open is attached to it rather than acknowledged again.",
      "instanceKey": [
        "request_id"
      ],
      "concurrency": "one-active-per-key",
      "supersession": {
        "id": "s.supersession",
        "label": "CANONICAL_RULE",
        "text": "Ownership passes at the handoff and does not come back. Once the request is handed to the journey that owns the work, this instance is closed rather than kept open beside it."
      }
    },
    "eligibility": [
      "a service request recorded against a named requester, with the problem as they described it",
      "a contact point that can carry a message about this request",
      "no instance is already open for this request",
      "hard gates (GLB-31) allow communication for this purpose"
    ],
    "suppressions": [
      {
        "id": "s.transactional",
        "label": "CANONICAL_RULE",
        "text": "An acknowledgement is transactional. It is deduplicated against other messages about the same request rather than rationed against a promotional budget, and a marketing or lifecycle journey holding the person never delays it or takes its place. Hard gates (GLB-31) still apply, and nothing else does."
      },
      {
        "id": "s.no-drip",
        "label": "CANONICAL_RULE",
        "text": "Nothing is sent because a period elapsed. A second message exists only where the request's own state changed - resolved or withdrawn - and a request still open when the acknowledgement window closes is handed to the journey that owns the work instead of being given a status update."
      },
      {
        "id": "s.duplicate",
        "label": "CANONICAL_RULE",
        "text": "A request already covered by an open one is attached to it and acknowledged once. Two acknowledgements for one problem tell the requester there are now two of them, and the second is the one nobody is working on."
      },
      {
        "id": "s.already-resolved",
        "label": "CANONICAL_RULE",
        "text": "A request that was already resolved when it arrived is told so, and never acknowledged as though it were still open. Promising attention to something already done is the clearest way to make a solved problem feel unsolved."
      },
      {
        "id": "s.withdrawn",
        "label": "CANONICAL_RULE",
        "text": "A request the requester withdrew ends the instance and is never followed up. A withdrawn request is not a quiet one."
      },
      {
        "id": "s.contest",
        "label": "CANONICAL_RULE",
        "text": "While this journey holds the request in the service-request group, the issue assessment (REM-151) and remedy selection (REM-157) say nothing to the requester about the same problem; once ownership moves at the handoff, this journey sends nothing further (GLB-06). A requester hearing from two places before the first answer reads it as two teams who have not spoken."
      },
      {
        "id": "s.no-outcome",
        "label": "CANONICAL_RULE",
        "text": "The acknowledgement states that the request exists and who owns it. It never states a remedy, an eligibility or a fault, because none of those has been decided at the moment it is sent."
      },
      {
        "id": "s.money",
        "label": "CANONICAL_RULE",
        "text": "No message from this journey states a refund. That a refund was decided is the deciding journey's to say (FIN-137), and that money has moved and whether it arrived is the refund notification's (FIN-302), which reads it from the financial record. This journey says that the case is closed and that a resolution was reached, and never the amount, never when it will appear and never whether it has settled. Two senders describing the same money leave the person holding the earlier and less reliable one."
      }
    ],
    "contact": {
      "defaultPriority": "transactional",
      "pressureClass": "none",
      "localCap": {
        "value": {
          "key": "support_ack.touches",
          "rule": "Only a message that is not owed counts against the budget. The acknowledgement itself is owed to somebody who has just told us about a problem, and it is deduplicated by request rather than rationed.",
          "default": {
            "value": 1,
            "confidence": "high",
            "basis": "corpus-rule",
            "applicableWhen": "GLB-24; the graph's own discretionary touch count - the acknowledgement is owed and sits outside the budget, and the two state-change messages are alternative paths, so an instance can only ever spend one"
          },
          "required": false
        },
        "appliesTo": "non-mandatory"
      },
      "cooldown": {
        "key": "support_ack.cooldown",
        "rule": "Per request. A later request from the same person is its own instance and no cooldown applies between requests; a cooldown here would silence the acknowledgement of a real problem because of an earlier one.",
        "default": {
          "value": "none",
          "confidence": "high",
          "basis": "corpus-rule",
          "applicableWhen": "the entity note read with GLB-19: one instance per request, and a repeated event within one changes nothing"
        },
        "required": false
      },
      "competition": {
        "exclusionGroup": "service-request",
        "scope": "topic",
        "precedence": "highest in the service-request group while the request is still only a request: until ownership moves at the handoff, neither the issue assessment (REM-151) nor remedy selection (REM-157) speaks to the requester about the same problem, because the first thing somebody hears after raising a problem has to be that it arrived and who has it",
        "onLoss": "suppressed"
      }
    },
    "channelStrategy": {
      "roles": [
        {
          "role": "persistent",
          "channels": [
            "email"
          ],
          "when": "the message has to be kept, carry a reference the requester can quote back, and survive until somebody answers"
        },
        {
          "role": "in-session",
          "channels": [
            "in-app"
          ],
          "when": "the requester raised it inside the product and is still there, where the request and its own state already are"
        }
      ],
      "fallback": "same-role-other-channel",
      "label": "RECOMMENDED_DEFAULT"
    },
    "orchestration": {
      "strategy": "notice-then-confirm",
      "touches": [
        {
          "id": "t1",
          "stage": "acknowledge",
          "action": "a.acknowledge",
          "prerequisites": [
            "c.covered",
            "c.immediate",
            "c.sendable"
          ],
          "purpose": "That the request exists, the reference it can be quoted under, who owns it now and what happens next - said once, with no outcome attached to it.",
          "channelRoles": [
            "persistent",
            "in-session"
          ],
          "destination": {
            "target": "support-request",
            "boundTo": "request_id",
            "mustNotClaim": [
              "that the problem is solved",
              "a remedy, an eligibility or a fault that has not been decided",
              "a response commitment the owning team does not actually hold"
            ]
          },
          "mandatory": true,
          "label": "CANONICAL_RULE"
        },
        {
          "id": "t2",
          "stage": "resolved-on-receipt",
          "action": "a.resolved-now",
          "prerequisites": [
            "c.immediate",
            "c.sendable-now"
          ],
          "purpose": "That the thing raised is already done and which resolution closed it - instead of an acknowledgement promising attention to something that needs none.",
          "channelRoles": [
            "persistent",
            "in-session"
          ],
          "destination": {
            "target": "support-request",
            "boundTo": "request_id",
            "mustNotClaim": [
              "that anything about this request remains open",
              "that a further answer is coming",
              "a refund: not the amount, not when it will appear, not whether it has settled"
            ]
          },
          "mandatory": false,
          "label": "CANONICAL_RULE"
        },
        {
          "id": "t3",
          "stage": "resolution-notice",
          "action": "a.resolution",
          "after": "t1",
          "gatedBy": "w.window",
          "prerequisites": [
            "c.sendable2"
          ],
          "purpose": "That the request is closed and that a resolution was reached, sent because its own state changed rather than because a period elapsed.",
          "channelRoles": [
            "persistent",
            "in-session"
          ],
          "destination": {
            "target": "support-request",
            "boundTo": "request_id",
            "mustNotClaim": [
              "that a problem still present was resolved",
              "that the requester agreed the outcome, unless they said so",
              "a refund: not the amount, not when it will appear, not whether it has settled"
            ]
          },
          "mandatory": false,
          "label": "CANONICAL_RULE"
        }
      ],
      "noAction": [
        "s.transactional",
        "s.no-drip",
        "s.duplicate",
        "s.already-resolved",
        "s.withdrawn",
        "s.contest",
        "s.no-outcome",
        "s.money"
      ]
    },
    "implementation": {
      "attributes": {
        "required": [
          "request_id",
          "person_id",
          "reported_problem",
          "received_at",
          "owner_ref"
        ],
        "optional": [
          "issue_id",
          "order_id",
          "existing_request_ref",
          "has_active_session"
        ]
      }
    },
    "measurement": {
      "journeyOutcome": {
        "type": "exit-or-handoff",
        "refs": [
          "x.resolved",
          "x.attached",
          "x.withdrawn",
          "x.no-action",
          "h.owner"
        ]
      },
      "businessOutcome": {
        "event": "support_request_resolved",
        "unit": "instance",
        "observationScope": {
          "type": "handoff-chain",
          "journeys": [
            "REM-151"
          ]
        },
        "window": {
          "type": "through-handoff",
          "until": "resolution_confirmed"
        },
        "attribution": "entered-before-event",
        "comparison": "pre-post"
      },
      "secondary": [
        "request_withdrawn"
      ],
      "guardrails": [
        "complaint",
        "unsubscribe",
        "message_after_success",
        "acknowledgement_without_an_owner",
        "second_acknowledgement_for_one_problem"
      ],
      "operational": [
        "entry_volume",
        "resolved_on_receipt_rate",
        "handoff_rate_at_window_close",
        "no_action_rate_by_reason",
        "time_to_acknowledgement"
      ]
    },
    "discovery": {
      "aliases": [
        "support request acknowledgement",
        "ticket received confirmation",
        "we got your message",
        "service request intake",
        "case opened notification"
      ],
      "useCases": [
        "a problem reported through any intake route, acknowledged once with the reference and the owner",
        "a request that turns out to be already resolved when it arrives, told as that rather than acknowledged",
        "a request still open when the acknowledgement window closes, handed to the journey that owns the work"
      ]
    },
    "distinctFrom": [
      {
        "journey": "REM-151",
        "because": "REM-151 starts from a concrete problem with something already delivered and establishes whether an obligation exists. This runs before that question is asked: its subject is the request, not the problem, and its whole job is that the requester knows it arrived and who has it."
      },
      {
        "journey": "REM-157",
        "because": "REM-157 chooses the remedy that would satisfy an obligation already established. This states no outcome at all, because at the moment it sends there is nothing established to state."
      },
      {
        "journey": "FBK-43",
        "because": "FBK-43 starts from somebody's account of an experience and asks whether any operational issue exists behind it. This starts from a request made of us and answers only whether it arrived and who owns it."
      },
      {
        "journey": "FIN-302",
        "because": "FIN-302 announces the money: that a refund has been submitted and then whether it arrived, each read from the financial record. This says only that the case is closed and that a resolution was reached - never the amount, never when it will appear and never whether it has settled. The two are not in contest and share no group: this one speaks about the request, that one about the payment, and where a refund closed the case both may send about their own subject."
      }
    ],
    "entry": "t.received",
    "nodes": [
      {
        "id": "t.received",
        "kind": "trigger",
        "event": "support_request_received",
        "evidence": {
          "requires": [
            "a service request recorded against a named requester, with the problem as they described it",
            "the intake route it arrived on and the moment it was received",
            "a contact point that can carry a message about this request"
          ],
          "insufficientAlone": [
            "negative feedback about an experience, which reports a feeling rather than asking for something",
            "a page view of a help article, which asks nobody for anything",
            "an internal note opened about a customer, which is not a request the customer made",
            "a request whose requester has not resolved to a person we can answer"
          ],
          "source": "declared"
        },
        "next": "a.capture"
      },
      {
        "id": "a.capture",
        "kind": "action",
        "does": "Record the request under a reference the requester can quote and the team can find: who raised it, the problem as they described it, the route it arrived on, when it arrived and who owns it now. A request whose owner is a queue rather than a name is a request nobody has taken",
        "writes": [
          {
            "field": "request_log",
            "mode": "append"
          }
        ],
        "idempotencyKey": "request_id + a.capture",
        "next": "c.covered"
      },
      {
        "id": "c.covered",
        "kind": "condition",
        "asks": "Is an open request already covering this problem?",
        "branches": [
          {
            "label": "Already covered",
            "when": "an open request from the same requester concerns the same problem",
            "to": "a.attach"
          },
          {
            "label": "Nothing open",
            "when": "no open request from this requester concerns this problem",
            "to": "c.immediate"
          }
        ]
      },
      {
        "id": "a.attach",
        "kind": "action",
        "does": "Attach what was just described to the request already open on it, and leave that request's own acknowledgement standing. Opening a second request produces two owners, two answers and a requester deciding which one to believe",
        "writes": [
          {
            "field": "request_log",
            "mode": "append"
          }
        ],
        "idempotencyKey": "request_id + a.attach",
        "next": "x.attached"
      },
      {
        "id": "c.immediate",
        "kind": "condition",
        "asks": "Was this request already resolved at the moment it was received?",
        "branches": [
          {
            "label": "Resolved on receipt",
            "when": "the record shows the request closed as resolved at intake, with what resolved it",
            "observes": "support_request_resolved",
            "to": "c.sendable-now"
          },
          {
            "label": "Still open",
            "when": "the request is recorded open with an owner and no resolution against it",
            "to": "c.sendable"
          }
        ]
      },
      {
        "id": "c.sendable-now",
        "kind": "condition",
        "asks": "May the resolved-on-receipt message go out?",
        "branches": [
          {
            "label": "Sendable",
            "when": "hard gates permit communication for this purpose and the contact point is deliverable",
            "observes": "send path stages 1-8",
            "to": "a.resolved-now"
          },
          {
            "label": "Suppressed",
            "when": "a hard gate stops it; the gate is recorded as the reason rather than another route being forced",
            "observes": "send path stages 1-8",
            "to": "a.record-no-action"
          }
        ]
      },
      {
        "id": "a.resolved-now",
        "kind": "action",
        "does": "Say that the thing they raised is already done, and which resolution closed it, described as what happened to the request. Where that resolution was money going back, the money itself is not named here - the amount, the timing and whether it has settled are the financial record's to announce (FIN-302). An acknowledgement here would promise attention to a problem that no longer exists, and the requester would then wait for it",
        "execution": "communication",
        "idempotencyKey": "request_id + a.resolved-now",
        "next": "x.resolved"
      },
      {
        "id": "c.sendable",
        "kind": "condition",
        "asks": "May the acknowledgement go out?",
        "branches": [
          {
            "label": "Sendable",
            "when": "hard gates permit communication for this purpose and the contact point is deliverable; no pressure cap applies, because this message is owed rather than rationed",
            "observes": "send path stages 1-8",
            "to": "a.acknowledge"
          },
          {
            "label": "Suppressed",
            "when": "a hard gate stops it; the gate is recorded as the reason and the request still goes to its owner",
            "observes": "send path stages 1-8",
            "to": "a.record-no-action"
          }
        ]
      },
      {
        "id": "a.acknowledge",
        "kind": "action",
        "does": "Say that the request exists, under what reference, who owns it now and what happens next. No remedy, no eligibility and no fault - none of them has been decided, and a guess made here is the thing the requester will hold everyone to afterwards",
        "execution": "communication",
        "idempotencyKey": "request_id + a.acknowledge",
        "next": "w.window"
      },
      {
        "id": "w.window",
        "kind": "wait",
        "until": [
          "support_request_resolved",
          "request_withdrawn"
        ],
        "onEvent": "c.outcome",
        "timeout": {
          "after": {
            "key": "support_ack.window",
            "rule": "The period the acknowledgement covers: how long it is honest to say nothing more because nothing more has happened. Past it the request is not silent, it is simply owned by somebody else.",
            "class": "decision-sla",
            "required": true
          },
          "reason": "an acknowledgement only holds for as long as the requester can reasonably assume it is still the latest thing that happened",
          "relativeTo": "previous-touch"
        },
        "onTimeout": "c.open",
        "recheck": "the request re-read from the system that owns it: whether it is still open, who owns it now, and whether anything has been recorded against it",
        "windowExtendsOnEngagement": false
      },
      {
        "id": "c.outcome",
        "kind": "condition",
        "asks": "What resolved the acknowledgement window?",
        "branches": [
          {
            "label": "Resolved",
            "when": "the request is recorded resolved by whoever owns it",
            "observes": "support_request_resolved",
            "to": "c.sendable2"
          },
          {
            "label": "Withdrawn",
            "when": "the requester withdrew the request",
            "observes": "request_withdrawn",
            "to": "x.withdrawn"
          }
        ]
      },
      {
        "id": "c.open",
        "kind": "condition",
        "asks": "Is the request still open now the acknowledgement window has closed?",
        "branches": [
          {
            "label": "Still open",
            "when": "the request is recorded open against an owner, with no resolution and no withdrawal",
            "to": "h.owner"
          },
          {
            "label": "Closed while the window ran",
            "when": "the request was recorded resolved before the window closed and the event has been reconciled",
            "observes": "support_request_resolved",
            "to": "c.sendable2"
          }
        ]
      },
      {
        "id": "c.sendable2",
        "kind": "condition",
        "asks": "May the resolution notice go out?",
        "branches": [
          {
            "label": "Sendable",
            "when": "hard gates permit communication for this purpose, the contact point is deliverable, and the record actually carries what closed the request",
            "observes": "send path stages 1-8",
            "to": "a.resolution"
          },
          {
            "label": "Suppressed",
            "when": "a hard gate stops it, or the record shows the request closed with nothing that can be told to the requester; the reason is recorded",
            "observes": "send path stages 1-8",
            "to": "a.record-no-action"
          }
        ]
      },
      {
        "id": "a.resolution",
        "kind": "action",
        "does": "Say that the request is closed and that a resolution was reached, named in the terms the requester raised it in rather than in the terms of any money that moved - that belongs to FIN-302. This is sent because the request's own state changed, which is the only reason a second message exists at all",
        "execution": "communication",
        "idempotencyKey": "request_id + a.resolution",
        "writes": [
          {
            "field": "request_log",
            "mode": "append"
          }
        ],
        "next": "x.resolved"
      },
      {
        "id": "a.record-no-action",
        "kind": "action",
        "does": "Record which gate stopped the message and at which stage, so a requester who heard nothing is a measured outcome rather than a silent absence - and so nobody reads the silence as the request not having arrived",
        "writes": [
          {
            "field": "request_log",
            "mode": "append"
          }
        ],
        "idempotencyKey": "request_id + a.record-no-action",
        "next": "x.no-action"
      },
      {
        "id": "h.owner",
        "kind": "handoff",
        "to": "REM-151",
        "on": "a request still open when the acknowledgement window closes, where the problem itself now has to be established",
        "carries": [
          "the request, the problem as the requester described it, and the reference they were given",
          "that the requester has been acknowledged, what they were told and when",
          "the intake route and everything recorded against the request so far"
        ],
        "suppresses": [
          "every further message from this journey about this request"
        ],
        "contract": {
          "requiredFields": [
            "request_id",
            "issue_id",
            "person_id",
            "reported_problem",
            "acknowledged_at"
          ]
        }
      },
      {
        "id": "x.resolved",
        "kind": "exit",
        "state": "resolved; the requester was told what closed it",
        "class": "success",
        "terminal": false,
        "reEntry": "a further request from the same person is its own instance; the same problem described again while nothing is open enters as a new request"
      },
      {
        "id": "x.attached",
        "kind": "exit",
        "state": "attached to the request already open on this problem; acknowledged once",
        "class": "suppression",
        "terminal": false,
        "reEntry": "if that request closes with the problem still present, the next description of it enters as a new request on its own evidence"
      },
      {
        "id": "x.withdrawn",
        "kind": "exit",
        "state": "withdrawn by the requester; nothing further is sent",
        "class": "suppression",
        "terminal": false,
        "reEntry": "a fresh request about the same problem is a new instance, unless the requester asked for no further contact about it"
      },
      {
        "id": "x.no-action",
        "kind": "exit",
        "state": "no message sent; the gate that stopped it is recorded and the request still has its owner",
        "class": "no-action",
        "terminal": false,
        "reEntry": "a later request from the same person is evaluated on its own gates"
      }
    ],
    "guardrails": [
      "The acknowledgement states that the request exists and who owns it, and nothing about an outcome nobody has decided.",
      "One acknowledgement per problem. A second description of the same problem is attached to the open request rather than acknowledged again.",
      "A request already resolved on arrival is told so, never acknowledged as though it were still open.",
      "Nothing is sent because a period elapsed; a second message exists only where the request's own state changed.",
      "A request still open when the window closes is handed to whoever owns the work, and this journey stops rather than narrating it.",
      "A hard gate that blocks the message never blocks the request: it still reaches its owner, and the gate is recorded."
    ],
    "reusableRule": "Intake owes the requester exactly two things - that it arrived and who has it - and a journey that keeps talking after that is filling a silence that belongs to whoever is doing the work."
  },
];
