import type { CanonicalJourney, OrchestrationRule } from "./types";

/* CATEGORY 9 - IDENTITY, VERIFICATION, AUTHENTICATION & ACCOUNT INTEGRITY

   Four mechanisms that are routinely described as one, and are not:

     identified     we hold an identity claim about this person
     verified       a specific claim has been checked against evidence
     authenticated  whoever is here right now controls that identity
     authorized     they may take this particular action on this resource

   Each is a different question with a different failure. Someone can be
   identified and unverified, verified and not currently authenticated,
   authenticated and unauthorized. The chain runs one way only: none of them
   implies the one after it, and every system that stores them as one field
   discovers this during an incident rather than during design.

   Two further separations do most of the work in this category. Verification
   is bound to a claim - a verified address is not a verified person, and
   IDN-81 exists to keep the binding attached to the result. And a security
   signal is not a finding: IDN-87 and IDN-90 both open with evidence that
   looks alarming and both are built so that the most common correct outcome
   is a cleared suspicion, recorded rather than erased.

   The category's sharpest constraint is that recovery must not be a weaker
   route to the same access. IDN-88 is the journey most likely to be attacked,
   precisely because it exists for the case where normal authentication has
   already failed. */

export const IDENTITY_RULES: readonly OrchestrationRule[] = [
  {
    id: "IDN-R1",
    scope: "identity",
    rule: "Identification, verification, authentication and authorization are four separate mechanisms and none implies the next.",
    because:
      "They arrive together in a login flow and diverge everywhere else. A system that stores them as one state cannot answer the only question an incident asks: which of the four actually held.",
  },
  {
    id: "IDN-R2",
    scope: "identity",
    rule: "Verification applies to a defined claim and scope. One verified attribute does not verify the person.",
    because:
      "A verified email address proves control of an inbox. Read as a verified identity, it becomes the basis for decisions the evidence never supported.",
  },
  {
    id: "IDN-R3",
    scope: "identity",
    rule: "Document submission and document validation are separate states.",
    because:
      "Uploading is a transfer and validating is a judgement, and the gap between them is where a process appears to be waiting on the customer while it is waiting on us.",
  },
  {
    id: "IDN-R4",
    scope: "identity",
    rule: "Verification failure preserves its reason, and a technical failure is never recorded as an identity rejection.",
    because:
      "Without the reason every failure becomes the same retry, and recording our own outage against someone's verification history marks them as having failed something they never attempted.",
  },
  {
    id: "IDN-R5",
    scope: "identity",
    rule: "Required authentication assurance follows the sensitivity of the action, not the identity of the actor.",
    because:
      "Assurance is a property of what is being done. Setting it per user produces both an over-challenged ordinary session and an under-challenged sensitive one.",
  },
  {
    id: "IDN-R6",
    scope: "identity",
    rule: "Completing a step-up revalidates the original action before executing it.",
    because:
      "The challenge takes time, and the entitlement, the resource or the policy can move while it runs. Resuming on the state that requested the step-up executes a decision made before the check.",
  },
  {
    id: "IDN-R7",
    scope: "identity",
    rule: "Authentication failures are signals, not proof of compromise.",
    because:
      "Forgetting a password is the most common event in this category, and a system that treats it as an attack locks out mostly legitimate people.",
  },
  {
    id: "IDN-R8",
    scope: "identity",
    rule: "Account recovery never becomes a weaker bypass around normal security controls.",
    because:
      "It exists for the case where normal authentication has already failed, which makes it the route an attacker reaches for first.",
  },
  {
    id: "IDN-R9",
    scope: "identity",
    rule: "An identity attribute change reconciles dependent credentials, contactability and permissions independently.",
    because:
      "A new email address inherits neither the old one's deliverability nor its consent. Carrying either across turns a profile edit into a permission grant nobody made.",
  },
  {
    id: "IDN-R10",
    scope: "identity",
    rule: "A security restriction uses the smallest scope that addresses its evidence.",
    because:
      "Most security signals are false positives, and for those the containment is the entire customer-visible incident.",
  },
  {
    id: "IDN-R11",
    scope: "identity",
    rule: "Suspected compromise and confirmed compromise remain separate states.",
    because:
      "Containment is designed to be reversible and confirmation is not. Recording the first as the second makes every false positive permanent.",
  },
  {
    id: "IDN-R12",
    scope: "identity",
    rule: "Security restoration rebuilds valid access from current state rather than restoring a historical snapshot.",
    because:
      "The same rule as ACC-R10, and it matters most here: a snapshot taken before an incident restores exactly the credentials and sessions the incident was about.",
  },
  {
    id: "IDN-R13",
    scope: "identity",
    rule: "Verification and authentication retries are bounded wherever abuse or security risk exists.",
    because:
      "An unbounded retry is a brute-force channel with a friendly interface, and it is indistinguishable from a persistent legitimate user until it is counted.",
  },
  {
    id: "IDN-R14",
    scope: "identity",
    rule: "A stale verification, recovery or identity-update action never overrides newer authoritative state.",
    because:
      "These operations are slow and human-paced, so the world routinely moves while they run - and the late-arriving result carries the confidence of a decision made against facts that have gone.",
  },
  {
    id: "IDN-R15",
    scope: "identity",
    rule: "Security and identity histories remain auditable. Nothing in either is erased, including cleared suspicions.",
    because:
      "A cleared signal is still a fact about what was seen. Deleting it makes a recurrence look like a first occurrence, which is the pattern most worth catching.",
  },
];

export const IDENTITY_JOURNEYS: readonly CanonicalJourney[] = [
  /* ------------------------------------------------------------ IDN-81 */
  {
    id: "IDN-81",
    slug: "identity-claim-verification",
    category: "identity",
    goal: "identity-verification",
    channels: ["in-app", "email"],
    name: "Identity claim → evidence → verified, rejected or more evidence",
    shortName: "Identity Verification",
    purpose:
      "Establish confidence in one specific identity claim, bound to the evidence that established it.",
    entity: {
      scope: "the individual identity claim - which attribute, at what assurance, for what purpose",
      note: "Verification belongs to a claim, not to a person. Two claims about the same person are two verifications, and neither carries the other.",
      instanceKey: [
        "claim_id"
      ],
      concurrency: "one-active-per-key"
    },
    distinctFrom: [
      {
        journey: "IDN-85",
        because:
          "Verification asks whether a claim is true. Authentication asks whether whoever is present right now controls it. A verified claim from last year says nothing about who is at the keyboard.",
      },
    ],
    objective: "Establish confidence in one specific identity claim, bound to the evidence that established it.",
    eligibility: [
      "a specific identity claim that a process or policy requires to be verified, at a stated scope",
      "no instance of this journey is already open for the the individual identity claim",
      "hard gates (GLB-31) allow communication for this purpose"
    ],
    suppressions: [
      {
        "id": "s.g1",
        "label": "CANONICAL_RULE",
        "text": "An identity supplied is not an identity verified."
      },
      {
        "id": "s.g2",
        "label": "CANONICAL_RULE",
        "text": "Verifying one attribute does not verify unrelated attributes."
      },
      {
        "id": "s.g3",
        "label": "CANONICAL_RULE",
        "text": "Evidence is scoped to the claim being verified. Asking for more than the claim needs creates liability without confidence."
      },
      {
        "id": "s.g4",
        "label": "CANONICAL_RULE",
        "text": "Evidence rounds are bounded by policy rather than repeated until something is accepted."
      }
    ],
    contact: {
      "defaultPriority": "security",
      "pressureClass": "none",
      "localCap": {
        "value": {
          "key": "identity_claim.touches",
          "rule": "Every touch in this plan is the verification itself and is mandatory; nothing discretionary exists to cap.",
          "default": {
            "value": 0,
            "confidence": "high",
            "basis": "corpus-rule",
            "applicableWhen": "GLB-24; the graph's own touch count"
          },
          "required": false
        },
        "appliesTo": "non-mandatory"
      },
      "cooldown": {
        "key": "identity_claim.cooldown",
        "rule": "This journey is per the individual identity claim; a later instance concerns a different the individual identity claim and no cooldown applies between them.",
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
          "role": "in-session",
          "channels": [
            "in-app"
          ],
          "when": "the person is active in the product and the action is taken there"
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
          "stage": "request",
          "action": "a.request",
          "prerequisites": [
            "c.evidence"
          ],
          "purpose": "Request the minimum evidence this claim requires, and record the state as EVIDENCE_REQUIRED.",
          "channelRoles": [
            "in-session",
            "persistent"
          ],
          "mandatory": true,
          "label": "CANONICAL_RULE",
          "destination": {
            "target": "evidence-submission",
            "boundTo": "claim_id",
            "mustNotClaim": [
              "that unrelated attributes are verified"
            ]
          }
        },
        {
          "id": "t2",
          "stage": "request-more",
          "action": "a.request-more",
          "prerequisites": [
            "c.evidence",
            "c.result",
            "c.rounds"
          ],
          "purpose": "Request the specific additional evidence that would settle it, naming what is missing rather than repeating the original request",
          "channelRoles": [
            "in-session",
            "persistent"
          ],
          "mandatory": true,
          "label": "CANONICAL_RULE",
          "after": "t1",
          "gatedBy": "w.evidence",
          "destination": {
            "target": "evidence-submission",
            "boundTo": "claim_id"
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
          "claim_id",
          "identity_id",
          "attribute",
          "required_assurance",
          "purpose",
          "evidence_policy",
          "round_limit",
          "verification_log"
        ],
        "optional": []
      }
    },
    measurement: {
      "journeyOutcome": {
        "type": "exit-or-handoff",
        "refs": [
          "x.expired",
          "x.verified",
          "h.review",
          "h.failure"
        ]
      },
      "businessOutcome": {
        "event": "verification_evidence_received",
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
        "identity verification",
        "KYC verification",
        "ID check",
        "identity proofing",
        "document verification"
      ],
      "useCases": [
        "a claim a process requires to be verified at a stated assurance",
        "an inconclusive check that asks for the specific missing evidence, within the round limit"
      ]
    },
    entry: "t.required",
    nodes: [
      {
        id: "t.required",
        kind: "trigger",
        event: "identity_verification_required",
        evidence: {
          requires: [
            "a specific identity claim that a process or policy requires to be verified, at a stated scope",
          ],
          insufficientAlone: [
            "someone stating their name, which is a claim rather than a request to verify it",
            "an account holding an attribute nobody has checked",
          ],
          source: "authoritative",
        },
        next: "a.instance",
      },
      {
        id: "a.instance",
        kind: "action",
        does: "Create the verification instance bound to the exact claim - which attribute, at what assurance level, for what purpose - and record it as PENDING. A verification that is not bound to a claim verifies nothing in particular, and is read later as having verified everything",
        writes: [{ field: "verification_log", mode: "append" }],
        next: "c.evidence",
        idempotencyKey: "claim_id + identity_id + a.instance",
      },
      {
        id: "c.evidence",
        kind: "condition",
        asks: "Is the required evidence already available?",
        branches: [
          {
            label: "Available",
            when: "evidence sufficient for this claim at this assurance is already held",
            to: "a.validate",
          },
          {
            label: "Not yet",
            when: "the claim cannot be assessed on what is held",
            to: "a.request",
          },
        ],
      },
      {
        id: "a.request",
        kind: "action",
        does: "Request the minimum evidence this claim requires, and record the state as EVIDENCE_REQUIRED. Evidence is scoped to the claim - collecting more than it needs creates a liability without creating confidence, and asking for a passport to confirm a phone number tells the person we do not know what we are checking",
        writes: [{ field: "verification_log", mode: "append" }],
        next: "w.evidence",
        execution: "communication",
        idempotencyKey: "claim_id + identity_id + a.request",
      },
      {
        id: "w.evidence",
        kind: "wait",
        until: [
          "verification_evidence_received"
        ],
        onEvent: "a.validate",
        timeout: {
          "after": {
            "key": "identity_claim.evidence",
            "rule": "The verification timeout for this claim.",
            "class": "response-window",
            "required": true
          },
          "reason": "an open verification is a process held up somewhere else, and leaving it pending indefinitely blocks that process without anyone deciding to",
          "relativeTo": "previous-touch"
        },
        onTimeout: "x.expired",
        windowExtendsOnEngagement: false,
        recheck: "the the individual identity claim re-read from the system of record before acting on the timeout",
      },
      {
        id: "x.expired",
        kind: "exit",
        state: "EXPIRED; the claim was never verified",
        terminal: false,
        reEntry:
          "a new verification instance may be opened for the same claim. Expired is not rejected - nobody assessed the claim and found against it",
        class: "timeout",
      },
      {
        id: "a.validate",
        kind: "action",
        does: "Validate the evidence against this claim's acceptance rules, recording the state as UNDER_REVIEW while it runs",
        writes: [{ field: "verification_log", mode: "append" }],
        next: "c.result",
        idempotencyKey: "claim_id + identity_id + a.validate",
        attemptBudget: {
          "key": "identity_claim.validate_budget",
          "rule": "This loop runs against a budget fixed when the instance opened; when it is spent the instance takes its timeout path (GLB-24).",
          "required": true
        },
      },
      {
        id: "c.result",
        kind: "condition",
        asks: "What did validation conclude?",
        branches: [
          {
            label: "Verified",
            when: "the evidence establishes the claim at the required assurance",
            to: "a.verified",
          },
          {
            label: "Rejected",
            when: "the evidence does not establish the claim, and the reason is known",
            to: "h.failure",
          },
          {
            label: "Inconclusive, more evidence would help",
            when: "the claim is neither established nor refuted and further evidence could settle it",
            to: "c.rounds",
          },
          {
            label: "Needs human judgement",
            when: "the evidence requires a person to weigh it",
            to: "h.review",
          },
        ],
      },
      {
        id: "c.rounds",
        kind: "condition",
        asks: "Does the policy allow another evidence round?",
        branches: [
          {
            label: "Round available",
            when: "the number of evidence requests for this claim is within the policy limit",
            to: "a.request-more",
          },
          {
            label: "Limit reached",
            when: "the claim has been through as many rounds as policy allows",
            to: "h.review",
          },
        ],
      },
      {
        id: "a.request-more",
        kind: "action",
        does: "Request the specific additional evidence that would settle it, naming what is missing rather than repeating the original request",
        writes: [{ field: "verification_log", mode: "append" }],
        next: "w.evidence",
        execution: "communication",
        idempotencyKey: "claim_id + identity_id + a.request-more",
      },
      {
        id: "h.review",
        kind: "handoff",
        to: "DEC-181",
        on: "a claim that automated validation cannot settle",
        carries: [
          "the claim, the evidence gathered and what was inconclusive about it",
          "how many rounds have already run, so the person is not asked to repeat them",
        ],
      },
      {
        id: "h.failure",
        kind: "handoff",
        to: "IDN-84",
        on: "verification failing against a claim",
        carries: [
          "the claim and the failure as observed, unclassified",
          "the process waiting on this verification, if any",
        ],
      },
      {
        id: "a.verified",
        kind: "action",
        does: "Mark this exact claim VERIFIED, at the assurance the evidence supports and for the scope it covers, together with the evidence that established it. Verifying one attribute verifies nothing else - a verified address says nothing about a verified identity, and the binding is what stops the second being read out of the first",
        writes: [{ field: "verification_log", mode: "append" }],
        next: "x.verified",
        idempotencyKey: "claim_id + identity_id + a.verified",
      },
      {
        id: "x.verified",
        kind: "exit",
        state: "VERIFIED for this claim, at this scope and assurance",
        terminal: false,
        reEntry:
          "a different claim is verified on its own evidence, and this one is re-verified when its own validity lapses",
        class: "success",
      },
    ],
    guardrails: [
      "An identity supplied is not an identity verified.",
      "Verifying one attribute does not verify unrelated attributes.",
      "Evidence is scoped to the claim being verified. Asking for more than the claim needs creates liability without confidence.",
      "Evidence rounds are bounded by policy rather than repeated until something is accepted.",
    ],
    reusableRule:
      "Verification establishes confidence in a specific identity claim using defined evidence; it does not create universal trust.",
  },

  /* ------------------------------------------------------------ IDN-82 */
  {
    id: "IDN-82",
    slug: "verification-dependency",
    category: "identity",
    goal: "identity-verification",
    channels: [],
    name: "Verification requirement → collect evidence → resume blocked process",
    shortName: "Verification Dependency Resolution",
    purpose:
      "Hold a verification dependency as its own state, blocking only the process that needs it and releasing it only after everything else is rechecked.",
    entity: {
      scope: "the blocked process plus the verification requirement holding it",
      note: "One instance per requirement per blocked process. The same verification can unblock two processes and is not requested twice for them.",
    },
    distinctFrom: [
      {
        journey: "FBK-49",
        because:
          "FBK-49 is missing data - a value we do not hold. This is missing confidence - we may hold the value and have not established that it is true. The routes to resolving them share nothing.",
      },
    ],
    entry: "t.blocked",
    nodes: [
      {
        id: "t.blocked",
        kind: "trigger",
        event: "process_requires_verification",
        evidence: {
          requires: [
            "a named process that cannot proceed, and the specific verification it requires at a stated scope",
          ],
          insufficientAlone: [
            "a general wish for higher identity confidence with no process waiting on it",
          ],
          source: "authoritative",
        },
        next: "a.record",
      },
      {
        id: "a.record",
        kind: "action",
        does: "Record which process is blocked, which verification it needs at what scope and assurance, why, and any deadline. Naming the blocked process is what stops this becoming a standing request for identity documents",
        writes: [{ field: "verification_dependency_log", mode: "append" }],
        next: "c.existing",
      },
      {
        id: "c.existing",
        kind: "condition",
        asks: "Does an existing valid verification already satisfy this requirement at this scope?",
        branches: [
          {
            label: "Already satisfied",
            when: "a current verification covers the same claim at the required assurance",
            to: "a.reuse",
          },
          {
            label: "Not satisfied",
            when: "no current verification covers it, or the existing one is at a lower assurance",
            to: "a.initiate",
          },
        ],
      },
      {
        id: "a.reuse",
        kind: "action",
        does: "Reuse the existing verification and record that it was reused rather than re-requested. Asking someone to verify again what they verified last week for the same scope is the fastest way to make verification feel arbitrary rather than protective",
        writes: [{ field: "verification_dependency_log", mode: "append" }],
        next: "c.other",
      },
      {
        id: "a.initiate",
        kind: "action",
        does: "Initiate the required verification. The verification itself runs as its own instance; this journey owns only the dependency and the resumption",
        writes: [{ field: "verification_dependency_log", mode: "append" }],
        next: "w.verification",
      },
      {
        id: "w.verification",
        kind: "wait",
        until: ["the verification succeeds", "the verification fails"],
        onEvent: "c.result",
        timeout: {
          after: "the deadline of the blocked process, or its SLA",
          reason:
            "how long to wait belongs to what is blocked rather than to the verification - a blocked payment and a blocked profile update do not deserve the same patience",
        },
        onTimeout: "c.timeout",
        windowExtendsOnEngagement: false,
      },
      {
        id: "c.result",
        kind: "condition",
        asks: "How did the verification end?",
        branches: [
          { label: "Succeeded", when: "the claim was verified at the required scope", to: "c.other" },
          { label: "Failed", when: "verification did not establish the claim", to: "h.failure" },
        ],
      },
      {
        id: "h.failure",
        kind: "handoff",
        to: "IDN-84",
        on: "a verification failing while a process waits on it",
        carries: [
          "the failure and the blocked process behind it",
          "the deadline the process is running against, which the failure handling does not reset",
        ],
      },
      {
        id: "c.other",
        kind: "condition",
        asks: "Do the blocked process's other requirements still hold?",
        branches: [
          {
            label: "All still valid",
            when: "nothing else the process needs has lapsed while this ran",
            to: "x.resumed",
          },
          {
            label: "Something else is now missing",
            when: "another requirement expired or changed during the verification",
            to: "x.still-blocked",
          },
        ],
      },
      {
        id: "x.resumed",
        kind: "exit",
        state: "verification satisfied; the blocked process is free to continue",
        terminal: false,
        reEntry: "a further verification requirement is its own dependency with its own instance",
      },
      {
        id: "x.still-blocked",
        kind: "exit",
        state: "verification satisfied, process still blocked on something else",
        terminal: false,
        reEntry:
          "verification succeeding does not guarantee the process will - the other requirement is resolved on its own terms, and pretending this unblocked everything is how a customer is told twice that they are done",
      },
      {
        id: "c.timeout",
        kind: "condition",
        asks: "The verification did not complete in time - what does the blocked process do?",
        branches: [
          {
            label: "Expire",
            when: "the process cannot wait and lapses",
            to: "x.expired",
          },
          {
            label: "Escalate",
            when: "the process matters enough that someone should own getting it moving",
            to: "h.escalate",
          },
          {
            label: "Hold",
            when: "the process waits indefinitely by design, visibly held rather than failed",
            to: "x.held",
          },
        ],
      },
      {
        id: "x.expired",
        kind: "exit",
        state: "blocked process expired awaiting verification",
        terminal: false,
        reEntry: "a new attempt at the process opens its own dependency",
      },
      {
        id: "h.escalate",
        kind: "handoff",
        to: "OWN-55",
        on: "a verification dependency outliving the blocked process's deadline",
        carries: ["the blocked process, the requirement and what has been attempted"],
      },
      {
        id: "x.held",
        kind: "exit",
        state: "held, visibly, awaiting verification",
        terminal: false,
        reEntry:
          "the verification arriving later resumes this. Held is recorded as held rather than left looking like an unnoticed stall",
      },
    ],
    guardrails: [
      "A verification already valid for the required scope is reused rather than re-requested.",
      "The dependency blocks only the process that requires it.",
      "Verification succeeding does not guarantee the blocked process will succeed. Its other requirements are rechecked.",
    ],
    reusableRule:
      "Verification dependencies should block only the process that requires them and release it only after current requirements are revalidated.",
  },

  /* ------------------------------------------------------------ IDN-83 */
  {
    id: "IDN-83",
    slug: "document-validation",
    category: "identity",
    goal: "eligibility-qualification",
    channels: [],
    name: "Document submitted → validate → accept, reject or replace",
    shortName: "Document Verification",
    purpose:
      "Keep uploading a document and satisfying a requirement as separate facts, and keep an acceptance bound to the requirement it was assessed against.",
    entity: {
      scope: "the submitted document, the requirement it is offered against, and its owner",
      note: "Acceptance is per requirement. The same document may satisfy one requirement and fail another with different acceptance rules, and both results are true at once.",
    },
    entry: "t.submitted",
    nodes: [
      {
        id: "t.submitted",
        kind: "trigger",
        event: "document_submitted",
        evidence: {
          requires: ["a document submitted against an identified requirement"],
          insufficientAlone: [
            "a file uploaded, which is a transfer rather than a submission against anything",
          ],
          source: "authoritative",
        },
        next: "a.record",
      },
      {
        id: "a.record",
        kind: "action",
        does: "Record the document as SUBMITTED against the specific requirement it is offered for. Uploaded is not validated, and nothing may treat the submission as satisfying the requirement while it sits here",
        writes: [{ field: "document_log", mode: "append" }],
        next: "a.validate",
      },
      {
        id: "a.validate",
        kind: "action",
        does: "Validate the properties this requirement actually cares about: the document type, whether it belongs to the person offering it, readability, completeness, validity dates, the required fields, and integrity or authenticity where the requirement demands them",
        writes: [{ field: "document_log", mode: "append" }],
        next: "c.outcome",
      },
      {
        id: "c.outcome",
        kind: "condition",
        asks: "What did validation find?",
        branches: [
          {
            label: "Valid",
            when: "the document satisfies this requirement's acceptance rules",
            to: "a.accept",
          },
          {
            label: "Correctable",
            when: "something specific is wrong that a better submission would fix - unreadable, cropped, an expired copy of a current document",
            to: "a.correction",
          },
          {
            label: "Invalid",
            when: "the document cannot satisfy this requirement whatever is resubmitted",
            to: "a.reject",
          },
        ],
      },
      {
        id: "a.accept",
        kind: "action",
        does: "Record ACCEPTED for this specific requirement, with what was checked. Accepted here is not universally valid - the same document offered against a different requirement is assessed again on that requirement's rules",
        writes: [{ field: "document_log", mode: "append" }],
        next: "x.accepted",
      },
      {
        id: "x.accepted",
        kind: "exit",
        state: "ACCEPTED for the stated requirement",
        terminal: false,
        reEntry:
          "the same document offered against another requirement enters as a new submission, because acceptance travels with the requirement rather than with the file",
      },
      {
        id: "a.reject",
        kind: "action",
        does: "Record REJECTED with the reason. A rejection that does not say what was wrong produces the same submission again",
        writes: [{ field: "document_log", mode: "append" }],
        next: "x.rejected",
      },
      {
        id: "x.rejected",
        kind: "exit",
        state: "REJECTED for this requirement, with a recorded reason",
        terminal: false,
        reEntry: "a different document may be submitted; this one is not reassessed unchanged",
      },
      {
        id: "a.correction",
        kind: "action",
        does: "Record CORRECTION_REQUIRED, stating specifically what is wrong and what would fix it",
        writes: [{ field: "document_log", mode: "append" }],
        next: "w.replacement",
      },
      {
        id: "w.replacement",
        kind: "wait",
        until: ["a replacement is submitted"],
        onEvent: "a.supersede",
        timeout: {
          after: "the requirement's deadline, or this document's own validity end",
          reason:
            "a correction request with no end leaves the requirement permanently half-satisfied, and the process behind it permanently waiting",
        },
        onTimeout: "x.expired",
        windowExtendsOnEngagement: false,
      },
      {
        id: "x.expired",
        kind: "exit",
        state: "correction window closed; the requirement remains unsatisfied",
        terminal: false,
        reEntry: "a new submission opens its own instance with the full history attached",
      },
      {
        id: "a.supersede",
        kind: "action",
        does: "Link the replacement to the original and keep the original submission and its validation result readable. A replaced document is superseded rather than deleted - what was offered and why it was not accepted is part of the record",
        writes: [{ field: "document_log", mode: "append" }],
        next: "c.rounds",
      },
      {
        id: "c.rounds",
        kind: "condition",
        asks: "Is another correction round allowed?",
        branches: [
          {
            label: "Round available",
            when: "the number of attempts against this requirement is within the policy limit",
            to: "a.validate",
          },
          {
            label: "Limit reached",
            when: "repeated corrections have not produced an acceptable document",
            to: "h.review",
          },
        ],
      },
      {
        id: "h.review",
        kind: "handoff",
        to: "DEC-181",
        on: "repeated corrections failing to satisfy a requirement",
        carries: [
          "every submission and why each was not accepted",
          "the requirement itself, which may be the thing that is wrong rather than the documents",
        ],
      },
    ],
    guardrails: [
      "Uploaded is not validated.",
      "Accepted for one requirement is not universally valid.",
      "The original submission and its validation history stay auditable after a replacement.",
      "Correction rounds are bounded, and the limit routes to a person rather than to a rejection.",
    ],
    reusableRule:
      "A submitted document satisfies a requirement only after validation against that requirement's current acceptance rules.",
  },

  /* ------------------------------------------------------------ IDN-84 */
  {
    id: "IDN-84",
    slug: "verification-failure-routing",
    category: "identity",
    goal: "identity-verification",
    channels: ["in-app", "email"],
    name: "Verification failure → reason → retry, remediate, review or exit",
    shortName: "Verification Recovery",
    purpose:
      "Route a failed verification by why it failed, and keep our own failures out of the customer's verification record.",
    entity: {
      scope: "the verification instance that failed",
      note: "The failure belongs to the attempt. A technical failure and a mismatch are different facts about different things, and only one of them is about the person.",
      instanceKey: [
        "verification_instance_id"
      ],
      concurrency: "one-active-per-key"
    },
    objective: "Route a failed verification by why it failed, and keep our own failures out of the customer's verification record.",
    eligibility: [
      "a verification attempt that did not establish its claim",
      "no instance of this journey is already open for the the verification instance that failed",
      "hard gates (GLB-31) allow communication for this purpose"
    ],
    suppressions: [
      {
        "id": "s.g1",
        "label": "CANONICAL_RULE",
        "text": "Retry limits are policy-defined and bounded, and the bound is tighter where the claim is security-sensitive."
      },
      {
        "id": "s.g2",
        "label": "CANONICAL_RULE",
        "text": "A technical failure is never recorded as an identity rejection."
      },
      {
        "id": "s.g3",
        "label": "CANONICAL_RULE",
        "text": "Repeated retries do not bypass security controls. Exhausting the budget routes to a person, not to an acceptance."
      },
      {
        "id": "s.g4",
        "label": "CANONICAL_RULE",
        "text": "The failure reason is preserved, because the route out depends on it."
      }
    ],
    contact: {
      "defaultPriority": "security",
      "pressureClass": "none",
      "localCap": {
        "value": {
          "key": "verification_failure.touches",
          "rule": "Every touch runs against a budget fixed when the instance opened; the budget is the plan's own length, and no touch is repeated because nothing could tell whether it arrived.",
          "default": {
            "value": 1,
            "confidence": "high",
            "basis": "corpus-rule",
            "applicableWhen": "GLB-24; the graph's own touch count"
          },
          "required": false
        },
        "appliesTo": "non-mandatory"
      },
      "cooldown": {
        "key": "verification_failure.cooldown",
        "rule": "This journey is per the verification instance that failed; a later instance concerns a different the verification instance that failed and no cooldown applies between them.",
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
          "role": "in-session",
          "channels": [
            "in-app"
          ],
          "when": "the person is active in the product and the action is taken there"
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
          "stage": "explain",
          "action": "a.explain",
          "prerequisites": [
            "c.class",
            "c.retry-budget"
          ],
          "purpose": "Explain exactly what needs correcting and offer the bounded retry.",
          "channelRoles": [
            "in-session",
            "persistent"
          ],
          "mandatory": true,
          "label": "CANONICAL_RULE",
          "destination": {
            "target": "retry-verification",
            "boundTo": "verification_instance_id"
          }
        },
        {
          "id": "t2",
          "stage": "explain-terminal",
          "action": "a.explain-terminal",
          "prerequisites": [
            "c.class"
          ],
          "purpose": "Say that this claim cannot be verified on this basis, and name what basis would be accepted if any is.",
          "channelRoles": [
            "in-session",
            "persistent"
          ],
          "mandatory": true,
          "label": "CANONICAL_RULE",
          "destination": {
            "target": "alternative-verification-basis",
            "boundTo": "verification_instance_id"
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
          "verification_instance_id",
          "claim_id",
          "failure_class",
          "retry_budget",
          "backoff_budget",
          "verification_log"
        ],
        "optional": []
      }
    },
    measurement: {
      "journeyOutcome": {
        "type": "exit-or-handoff",
        "refs": [
          "x.retry",
          "x.terminal",
          "h.escalate",
          "h.review"
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
        "verification recovery",
        "failed verification",
        "ID check failed",
        "verification retry"
      ],
      "useCases": [
        "a failed check explained with exactly what to correct and a bounded retry",
        "our own technical failure kept out of the person's verification record"
      ]
    },
    entry: "t.failed",
    nodes: [
      {
        id: "t.failed",
        kind: "trigger",
        event: "verification_attempt_failed",
        evidence: {
          requires: ["a verification attempt that did not establish its claim"],
          insufficientAlone: [
            "a verification that expired with no attempt made, which is IDN-81's expiry",
            "a policy change invalidating an existing verification without anyone having attempted one",
          ],
          source: "authoritative",
        },
        next: "a.classify",
      },
      {
        id: "a.classify",
        kind: "action",
        does: "Classify the failure as INSUFFICIENT_EVIDENCE, MISMATCH, UNREADABLE, EXPIRED_EVIDENCE, TECHNICAL_FAILURE, POLICY_FAILURE, REVIEW_REQUIRED or UNKNOWN. The class decides the route, and it decides something else: recording our own outage as an identity rejection marks someone as having failed a check they never got to attempt",
        writes: [{ field: "verification_log", mode: "append" }],
        next: "c.class",
        idempotencyKey: "verification_instance_id + a.classify",
      },
      {
        id: "c.class",
        kind: "condition",
        asks: "What kind of failure was it?",
        branches: [
          {
            label: "The person can correct it",
            when: "insufficient evidence, unreadable evidence, or evidence that has expired",
            to: "c.retry-budget",
          },
          {
            label: "Ours, and transient",
            when: "a technical failure on our side or a provider's",
            to: "c.technical-budget",
          },
          {
            label: "Needs a person",
            when: "a mismatch, an explicit review requirement, or a failure nobody could classify",
            to: "h.review",
          },
          {
            label: "Terminal by policy",
            when: "policy forbids verifying this claim on this basis at all",
            to: "a.explain-terminal",
          },
        ],
      },
      {
        id: "c.retry-budget",
        kind: "condition",
        asks: "Does the retry budget for this claim have room?",
        branches: [
          {
            label: "Room to retry",
            when: "attempts against this claim are within the policy limit for its security sensitivity",
            to: "a.explain",
          },
          {
            label: "Budget spent",
            when: "the limit is reached - and repeated failure is also what a genuine person struggling looks like",
            to: "h.review",
          },
        ],
      },
      {
        id: "a.explain",
        kind: "action",
        does: "Explain exactly what needs correcting and offer the bounded retry. A retry offered without an explanation produces the same attempt again, which spends the budget without improving anything",
        writes: [{ field: "verification_log", mode: "append" }],
        next: "x.retry",
        execution: "communication",
        idempotencyKey: "verification_instance_id + a.explain",
      },
      {
        id: "c.technical-budget",
        kind: "condition",
        asks: "Is a safe retry available within the backoff budget?",
        branches: [
          {
            label: "Retry",
            when: "the failure is transient and the budget has room",
            to: "a.backoff",
          },
          {
            label: "Persistent",
            when: "the technical failure is not clearing",
            to: "h.escalate",
          },
        ],
      },
      {
        id: "a.backoff",
        kind: "action",
        does: "Retry with backoff, recording nothing against the person's verification history. Our failure is not their rejection, and the distinction has to survive into whatever reads that history later",
        writes: [{ field: "verification_log", mode: "append" }],
        next: "x.retry",
        idempotencyKey: "verification_instance_id + a.backoff",
      },
      {
        id: "a.explain-terminal",
        kind: "action",
        does: "Say that this claim cannot be verified on this basis, and name what basis would be accepted if any is. Somebody who attempted verification and hears nothing will attempt it again, and each attempt writes a failure against a person who was never going to be able to pass",
        execution: "communication",
        next: "x.terminal",
        idempotencyKey: "verification_instance_id + a.explain-terminal",
      },
      {
        id: "x.retry",
        kind: "exit",
        state: "bounded retry available; the verification instance stays open",
        terminal: false,
        reEntry:
          "the retry runs as part of the same verification instance, against the same budget - a new instance would reset the count, which is how a bounded retry becomes an unbounded one",
        class: "success",
      },
      {
        id: "h.escalate",
        kind: "handoff",
        to: "OWN-55",
        on: "a technical failure that is not clearing",
        carries: [
          "the failure class and how often it has recurred",
          "the people currently unable to verify because of it, which is what makes this operational rather than administrative",
        ],
      },
      {
        id: "h.review",
        kind: "handoff",
        to: "DEC-181",
        on: "a failure requiring human judgement, or a budget reached",
        carries: [
          "the failure class and every attempt made",
          "the claim being verified, so the reviewer assesses the claim rather than the attempts",
        ],
      },
      {
        id: "x.terminal",
        kind: "exit",
        state: "verification not possible on this basis",
        terminal: false,
        reEntry:
          "a different basis or a different claim is assessed on its own terms; what would have to change here is the policy rather than the evidence",
        class: "failure",
      },
    ],
    guardrails: [
      "Retry limits are policy-defined and bounded, and the bound is tighter where the claim is security-sensitive.",
      "A technical failure is never recorded as an identity rejection.",
      "Repeated retries do not bypass security controls. Exhausting the budget routes to a person, not to an acceptance.",
      "The failure reason is preserved, because the route out depends on it.",
    ],
    reusableRule:
      "Verification recovery should follow the reason verification failed rather than treating every failure as equivalent.",
  },

  /* ------------------------------------------------------------ IDN-85 */
  {
    id: "IDN-85",
    slug: "authentication-challenge",
    category: "identity",
    goal: "identity-verification",
    channels: ["sms", "push", "email"],
    name: "Authentication challenge → authenticate, step up or deny",
    shortName: "Login Verification",
    purpose:
      "Establish that whoever is present controls the required identity, at the assurance the context demands.",
    entity: {
      scope: "the authentication session, bound to an actor and an account",
      note: "An authenticated session carries an explicit validity. A session with no stated lifetime is one that nothing can decide has expired.",
      instanceKey: [
        "session_id"
      ],
      concurrency: "one-active-per-key"
    },
    distinctFrom: [
      {
        journey: "ACC-75",
        because:
          "This establishes who is present. ACC-75 decides what they may do. A successful authentication is an input to that decision and never a substitute for it.",
      },
    ],
    objective: "Establish that whoever is present controls the required identity, at the assurance the context demands.",
    eligibility: [
      "a context requiring the actor's control of an identity to be established",
      "no instance of this journey is already open for the the authentication session",
      "hard gates (GLB-31) allow communication for this purpose"
    ],
    suppressions: [
      {
        "id": "s.g1",
        "label": "CANONICAL_RULE",
        "text": "Authentication is not authorization."
      },
      {
        "id": "s.g2",
        "label": "CANONICAL_RULE",
        "text": "A successful login does not prove entitlement to any particular resource."
      },
      {
        "id": "s.g3",
        "label": "CANONICAL_RULE",
        "text": "An authenticated session carries an explicit assurance level and an explicit validity."
      },
      {
        "id": "s.g4",
        "label": "CANONICAL_RULE",
        "text": "An unanswered challenge is not recorded as a failed authentication."
      }
    ],
    contact: {
      "defaultPriority": "security",
      "pressureClass": "none",
      "localCap": {
        "value": {
          "key": "authentication_challenge.touches",
          "rule": "The challenge is the authentication itself and is mandatory; nothing discretionary exists to cap.",
          "default": {
            "value": 0,
            "confidence": "high",
            "basis": "corpus-rule",
            "applicableWhen": "GLB-24; the graph's own touch count"
          },
          "required": false
        },
        "appliesTo": "non-mandatory"
      },
      "cooldown": {
        "key": "authentication_challenge.cooldown",
        "rule": "This journey is per the authentication session; a later instance concerns a different the authentication session and no cooldown applies between them.",
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
          "role": "urgent",
          "channels": [
            "sms"
          ],
          "when": "an asserted time bound lies inside the urgent horizon and permission for messages on this channel is recorded"
        },
        {
          "role": "low-friction",
          "channels": [
            "push"
          ],
          "when": "a valid token or app session exists and the message is a single step from the notification"
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
      "strategy": "single-notice",
      "touches": [
        {
          "id": "t1",
          "stage": "challenge",
          "action": "a.challenge",
          "prerequisites": [
            "c.sufficient"
          ],
          "purpose": "Issue the challenge appropriate to the required assurance level",
          "channelRoles": [
            "urgent",
            "low-friction",
            "persistent"
          ],
          "mandatory": true,
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
          "session_id",
          "identity_id",
          "account_id",
          "required_assurance",
          "existing_assurance",
          "authentication_log"
        ],
        "optional": []
      }
    },
    measurement: {
      "journeyOutcome": {
        "type": "exit-or-handoff",
        "refs": [
          "x.satisfied",
          "x.timeout",
          "x.authenticated",
          "h.stepup",
          "h.failure"
        ]
      },
      "businessOutcome": {
        "event": "authentication_succeeded",
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
        "login verification",
        "OTP",
        "2FA",
        "MFA challenge",
        "one-time code",
        "login code"
      ],
      "useCases": [
        "a challenge issued at the assurance the context demands",
        "a session already at the required level, challenged for nothing"
      ]
    },
    entry: "t.required",
    nodes: [
      {
        id: "t.required",
        kind: "trigger",
        event: "authentication_required",
        evidence: {
          requires: ["a context requiring the actor's control of an identity to be established"],
          insufficientAlone: [
            "a session that already holds the required assurance",
            "an authorization question about what an authenticated actor may do",
          ],
          source: "authoritative",
        },
        next: "a.assurance",
      },
      {
        id: "a.assurance",
        kind: "action",
        does: "Determine the assurance level this context requires. Assurance is a property of what is being done rather than of who is doing it - setting it per user produces an over-challenged ordinary session and an under-challenged sensitive one at the same time",
        next: "c.sufficient",
      },
      {
        id: "c.sufficient",
        kind: "condition",
        asks: "Does the existing authentication already meet the required level?",
        branches: [
          {
            label: "Sufficient",
            when: "a current session holds the required assurance and has not expired",
            to: "x.satisfied",
          },
          {
            label: "Not sufficient",
            when: "no session, an expired one, or one at a lower assurance than this context needs",
            to: "a.challenge",
          },
        ],
      },
      {
        id: "x.satisfied",
        kind: "exit",
        state: "already authenticated at the required level",
        terminal: false,
        reEntry:
          "a context requiring higher assurance re-opens this. Being authenticated says who the actor is and nothing about what they may do",
        class: "success",
      },
      {
        id: "a.challenge",
        kind: "action",
        does: "Issue the challenge appropriate to the required assurance level",
        writes: [{ field: "authentication_log", mode: "append" }],
        next: "w.auth",
        execution: "communication",
        idempotencyKey: "identity_id + account_id + a.challenge",
      },
      {
        id: "w.auth",
        kind: "wait",
        until: [
          "authentication_succeeded",
          "authentication_failed"
        ],
        onEvent: "c.result",
        timeout: {
          "after": {
            "key": "authentication_challenge.auth",
            "rule": "The challenge window.",
            "class": "response-window",
            "required": true
          },
          "reason": "an unanswered challenge is not a failure to authenticate and is not recorded as one; the attempt simply ends",
          "relativeTo": "previous-touch"
        },
        onTimeout: "x.timeout",
        windowExtendsOnEngagement: false,
        recheck: "the the authentication session re-read from the system of record before acting on the timeout",
      },
      {
        id: "x.timeout",
        kind: "exit",
        state: "challenge unanswered; nothing authenticated and nothing recorded against the actor",
        terminal: false,
        reEntry: "a new attempt issues a new challenge",
        class: "timeout",
      },
      {
        id: "c.result",
        kind: "condition",
        asks: "What was established?",
        branches: [
          {
            label: "Authenticated at the required level",
            when: "the challenge succeeded at the assurance this context needs",
            to: "a.session",
          },
          {
            label: "Authenticated below the required level",
            when: "control was established, at a lower assurance than the context requires",
            to: "h.stepup",
          },
          {
            label: "Failed",
            when: "the challenge was not satisfied",
            to: "h.failure",
          },
        ],
      },
      {
        id: "a.session",
        kind: "action",
        does: "Issue or update the authenticated session with an explicit assurance level and an explicit validity. Both are needed downstream: without the level nothing can require a step-up, and without the validity nothing can decide the session has aged out",
        writes: [{ field: "authentication_log", mode: "append" }],
        next: "x.authenticated",
        idempotencyKey: "identity_id + account_id + a.session",
      },
      {
        id: "x.authenticated",
        kind: "exit",
        state: "authenticated, at a stated assurance and for a stated validity",
        terminal: false,
        reEntry:
          "authorization for any particular action is decided separately, every time - a successful login proves control of an account and entitlement to nothing",
        class: "success",
      },
      {
        id: "h.stepup",
        kind: "handoff",
        to: "IDN-86",
        on: "control established below the assurance the context requires",
        carries: ["the session and the assurance it currently holds", "the level the context requires"],
      },
      {
        id: "h.failure",
        kind: "handoff",
        to: "IDN-87",
        on: "an authentication failure",
        carries: [
          "the attempt and its context",
          "the explicit fact that one failure is a signal rather than a finding",
        ],
      },
    ],
    guardrails: [
      "Authentication is not authorization.",
      "A successful login does not prove entitlement to any particular resource.",
      "An authenticated session carries an explicit assurance level and an explicit validity.",
      "An unanswered challenge is not recorded as a failed authentication.",
    ],
    reusableRule:
      "Authentication establishes that an actor currently controls the required identity/account at a defined assurance level.",
  },

  /* ------------------------------------------------------------ IDN-86 */
  {
    id: "IDN-86",
    slug: "step-up-authentication",
    category: "identity",
    goal: "identity-verification",
    channels: [],
    name: "Step-up requirement → stronger authentication → resume or deny",
    shortName: "Step-Up Authentication",
    purpose:
      "Raise identity assurance for a sensitive action, then check the action is still authorised before it runs.",
    entity: {
      scope: "the actor, the specific protected action and the authentication context around it",
      note: "The step-up is scoped to the action that required it. Raising assurance once does not open every sensitive action for the rest of the session.",
    },
    entry: "t.stepup",
    nodes: [
      {
        id: "t.stepup",
        kind: "trigger",
        event: "action_requires_higher_assurance",
        evidence: {
          requires: [
            "a protected action whose required assurance exceeds what the current session holds - a sensitive account change, a high-risk transaction, a credential change, a privileged action, or an unusual security context",
          ],
          source: "authoritative",
        },
        next: "a.preserve",
      },
      {
        id: "a.preserve",
        kind: "action",
        does: "Preserve the requested action's full context, so it can resume rather than be reconstructed by the person from memory",
        writes: [{ field: "authentication_log", mode: "append" }],
        next: "a.initiate",
      },
      {
        id: "a.initiate",
        kind: "action",
        does: "Initiate the stronger authentication or verification this action requires, scoped to it rather than to the session as a whole",
        next: "w.stepup",
      },
      {
        id: "w.stepup",
        kind: "wait",
        until: ["the step-up succeeds", "the step-up fails"],
        onEvent: "c.result",
        timeout: {
          after: "the step-up window",
          reason:
            "a step-up that is not completed leaves the action blocked, which is the safe outcome and needs no further decision",
        },
        onTimeout: "x.blocked",
        windowExtendsOnEngagement: false,
      },
      {
        id: "c.result",
        kind: "condition",
        asks: "Was the higher assurance established?",
        branches: [
          { label: "Established", when: "the step-up succeeded", to: "a.revalidate" },
          { label: "Not established", when: "the step-up failed", to: "x.blocked" },
        ],
      },
      {
        id: "x.blocked",
        kind: "exit",
        state: "protected action remains blocked; assurance not established",
        terminal: false,
        reEntry:
          "a fresh attempt at the action issues a fresh step-up. Nothing is queued to execute if assurance is established later",
      },
      {
        id: "a.revalidate",
        kind: "action",
        does: "Revalidate the requested action against current authorization before anything runs. Passing a challenge raises identity assurance and authorises nothing - the entitlement, the resource or the policy can all have moved while the challenge was in front of the person",
        next: "c.still",
      },
      {
        id: "c.still",
        kind: "condition",
        asks: "Is the requested action still authorised?",
        branches: [
          {
            label: "Still authorised",
            when: "the action's authorization conditions hold at the raised assurance",
            to: "h.resume",
          },
          {
            label: "No longer authorised",
            when: "something the action depended on changed during the challenge",
            to: "x.no-longer",
          },
        ],
      },
      {
        id: "h.resume",
        kind: "handoff",
        to: "ACC-75",
        on: "a step-up completed with the action still authorised",
        carries: [
          "the preserved action context and the raised assurance level",
          "the fact that authorization is being decided now rather than inherited from before the challenge",
        ],
      },
      {
        id: "x.no-longer",
        kind: "exit",
        state: "assurance raised; the action is no longer authorised and does not run",
        terminal: false,
        reEntry:
          "the raised assurance stands for its own window; the action is attempted again on its own terms and decided again",
      },
    ],
    guardrails: [
      "Step-up success does not automatically execute the stale action.",
      "The requested action is revalidated after the challenge, not before it.",
      "The step-up is scoped to an appropriate assurance window and to the action that required it.",
    ],
    reusableRule:
      "Step-up authentication raises identity assurance for a sensitive action without replacing the need to revalidate that action's authorization.",
  },

  /* ------------------------------------------------------------ IDN-87 */
  {
    id: "IDN-87",
    slug: "authentication-failure-pattern",
    category: "identity",
    goal: "risk-compliance",
    channels: [],
    name: "Authentication failure pattern → security check → recover or restrict",
    shortName: "Authentication Risk Assessment",
    purpose:
      "Tell an ordinary forgotten password apart from an account under attack, without converting the first into the second.",
    entity: {
      scope: "the account plus the authentication activity observed against it",
      note: "The pattern belongs to the account. A shared IP producing failures across many accounts is a different signal, assessed at a different scope.",
      instanceKey: [
        "account_id"
      ],
      concurrency: "one-active-per-key"
    },
    distinctFrom: [
      {
        journey: "IDN-90",
        because:
          "This weighs whether failures mean anything. IDN-90 starts from a material compromise signal and contains first. The route between them exists, and it is deliberately a decision rather than a default.",
      },
    ],
    objective: "Tell an ordinary forgotten password apart from an account under attack, without converting the first into the second.",
    eligibility: [
      "authentication failures crossing a meaningful threshold, or matching a pattern the detection considers notable",
      "no instance of this journey is already open for the the account plus the authentication activity observed against it",
      "hard gates (GLB-31) allow communication for this purpose"
    ],
    suppressions: [
      {
        "id": "s.g1",
        "label": "CANONICAL_RULE",
        "text": "One failed password attempt is not a compromise."
      },
      {
        "id": "s.g2",
        "label": "CANONICAL_RULE",
        "text": "A risk model's output is not a confirmed attacker. It orders investigation and concludes nothing."
      },
      {
        "id": "s.g3",
        "label": "CANONICAL_RULE",
        "text": "Any security response uses the smallest necessary scope."
      }
    ],
    implementation: {
      "attributes": {
        "required": [
          "account_id",
          "security_signal_log"
        ],
        "optional": []
      }
    },
    measurement: {
      "journeyOutcome": {
        "type": "exit-or-handoff",
        "refs": [
          "x.normal",
          "h.recovery",
          "h.security"
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
        "authentication risk assessment",
        "failed login pattern",
        "brute force detection",
        "login anomaly"
      ],
      "useCases": [
        "repeated failed logins told apart from an attack",
        "a legitimate-looking actor with no way through, routed to recovery"
      ]
    },
    entry: "t.pattern",
    nodes: [
      {
        id: "t.pattern",
        kind: "trigger",
        event: "authentication_failure_pattern",
        evidence: {
          requires: [
            "authentication failures crossing a meaningful threshold, or matching a pattern the detection considers notable",
          ],
          insufficientAlone: [
            "one failed password attempt, which is the most common event in this category",
            "a single failure from an unfamiliar device",
          ],
          source: "inferred",
        },
        next: "a.evaluate",
      },
      {
        id: "a.evaluate",
        kind: "action",
        does: "Evaluate the context around the failures: how fast they arrived, from what device and context, whether a credential reset is in play, whether the shape matches a known attack, and whether any session succeeded. A model's score orders the work and concludes nothing - what it produces is a case to look at, not an attacker",
        writes: [{ field: "security_signal_log", mode: "append" }],
        next: "c.assessment",
        idempotencyKey: "account_id + a.evaluate",
      },
      {
        id: "c.assessment",
        kind: "condition",
        asks: "What does the evidence actually support?",
        branches: [
          {
            label: "Ordinary user error",
            when: "the pattern looks like someone who has forgotten a password - human pacing, a familiar device, no other signal",
            to: "x.normal",
          },
          {
            label: "The person cannot get in and needs a route back",
            when: "repeated legitimate-looking failures with no way forward through normal authentication",
            to: "h.recovery",
          },
          {
            label: "Material security risk",
            when: "velocity, context change or attack-shaped behaviour that ordinary error does not explain",
            to: "a.restrict",
          },
        ],
      },
      {
        id: "x.normal",
        kind: "exit",
        state: "ordinary failure pattern; nothing security-specific applied",
        terminal: false,
        reEntry:
          "the usual recovery routes remain open to them, unchanged. Treating this as an attack would lock out mostly legitimate people, which is the failure mode this branch exists to hold open",
        class: "no-action",
      },
      {
        id: "h.recovery",
        kind: "handoff",
        to: "IDN-88",
        on: "a legitimate-looking actor with no way through normal authentication",
        carries: [
          "the failure history, which is context for the recovery rather than evidence against the requester",
          "the fact that no compromise has been established",
        ],
      },
      {
        id: "a.restrict",
        kind: "action",
        does: "Apply the smallest restriction the evidence justifies, and record what justified it. Most signals in this category are false positives, and for those the restriction is the entire customer-visible incident",
        writes: [{ field: "security_signal_log", mode: "append" }],
        next: "h.security",
        idempotencyKey: "account_id + a.restrict",
      },
      {
        id: "h.security",
        kind: "handoff",
        to: "IDN-90",
        on: "a failure pattern that ordinary error does not explain",
        carries: [
          "the evidence and the restriction already applied",
          "the explicit fact that nothing is confirmed - this is a suspicion with a scope, not a finding",
        ],
      },
    ],
    guardrails: [
      "One failed password attempt is not a compromise.",
      "A risk model's output is not a confirmed attacker. It orders investigation and concludes nothing.",
      "Any security response uses the smallest necessary scope.",
    ],
    reusableRule:
      "Authentication failure patterns should trigger proportionate security evaluation rather than converting ordinary mistakes into confirmed compromise.",
  },

  /* ------------------------------------------------------------ IDN-88 */
  {
    id: "IDN-88",
    slug: "account-recovery",
    category: "identity",
    goal: "suspension-restoration",
    channels: [],
    name: "Account recovery request → prove control → restore secure access",
    shortName: "Account Recovery Verification",
    purpose:
      "Give someone a way back into an account they can no longer authenticate to, without that route being weaker than the one it replaces.",
    entity: {
      scope: "the account plus this recovery case",
      note: "Recovery restores control of one existing account. It never merges identities, and it never creates a second account for the same person as a shortcut.",
      instanceKey: [
        "recovery_case_id"
      ],
      concurrency: "one-active-per-key"
    },
    distinctFrom: [
      {
        journey: "IDN-81",
        because:
          "Verification establishes that a claim is true. Recovery establishes that this requester is entitled to regain control of a specific account, which a true claim about their identity does not by itself demonstrate.",
      },
    ],
    objective: "Give someone a way back into an account they can no longer authenticate to, without that route being weaker than the one it replaces.",
    eligibility: [
      "a valid recovery request against an identified account",
      "no instance of this journey is already open for the the account plus this recovery case",
      "hard gates (GLB-31) allow communication for this purpose"
    ],
    suppressions: [
      {
        "id": "s.g1",
        "label": "CANONICAL_RULE",
        "text": "Recovery does not weaken normal security controls. It is a different route to the same assurance, not a lower one."
      },
      {
        "id": "s.g2",
        "label": "CANONICAL_RULE",
        "text": "Unsafe credentials and sessions are invalidated before replacement access is established, not after."
      },
      {
        "id": "s.g3",
        "label": "CANONICAL_RULE",
        "text": "Account recovery is not identity merge."
      },
      {
        "id": "s.g4",
        "label": "CANONICAL_RULE",
        "text": "The recovery window is not restarted by repeated attempts."
      }
    ],
    implementation: {
      "attributes": {
        "required": [
          "recovery_case_id",
          "account_id",
          "required_assurance",
          "recovery_window_ends_at",
          "recovery_log"
        ],
        "optional": []
      }
    },
    measurement: {
      "journeyOutcome": {
        "type": "exit-or-handoff",
        "refs": [
          "x.expired",
          "x.recovered",
          "x.more",
          "x.denied",
          "h.security",
          "h.review"
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
        "account recovery verification",
        "prove control",
        "recovery proof",
        "locked-out recovery"
      ],
      "useCases": [
        "a recovery route no weaker than the login it replaces",
        "insufficient proof routed to more evidence, a person, or denial"
      ]
    },
    entry: "t.recovery",
    nodes: [
      {
        id: "t.recovery",
        kind: "trigger",
        event: "account_recovery_initiated",
        evidence: {
          requires: ["a valid recovery request against an identified account"],
          insufficientAlone: [
            "a failed authentication with no recovery request behind it",
            "a support conversation about being locked out that names no identified account",
            "a destination supplied inside the request itself"
          ],
          source: "authoritative",
        },
        next: "a.basis",
      },
      {
        id: "a.basis",
        kind: "action",
        does: "Determine the recovery basis available and read the account's current security state. What is happening on the account changes what recovery is allowed to do",
        writes: [{ field: "recovery_log", mode: "append" }],
        next: "c.incident",
        idempotencyKey: "recovery_case_id + a.basis",
      },
      {
        id: "c.incident",
        kind: "condition",
        asks: "Is there an active compromise or security incident on this account?",
        branches: [
          {
            label: "Incident open",
            when: "a compromise is suspected or confirmed and containment is in force",
            to: "h.security",
          },
          {
            label: "No incident",
            when: "the account is simply unreachable by its owner",
            to: "a.evidence",
          },
        ],
      },
      {
        id: "h.security",
        kind: "handoff",
        to: "IDN-90",
        on: "a recovery request arriving during an open security incident",
        carries: [
          "the recovery request and what the requester has offered",
          "the fact that recovery is coordinated by the incident rather than run alongside it - a parallel recovery is exactly the path an attacker would take",
          "the incident_id of the account's already-open IDN-90 instance, resolved via account_id - this handoff joins that existing incident rather than opening a new one",
        ],
        contract: { requiredFields: ["incident_id"] },
      },
      {
        id: "a.evidence",
        kind: "action",
        does: "Collect only the evidence this recovery basis requires. Recovery is not an opportunity to gather more than normal authentication would, and it must not be an easier route to the same access than the one it replaces - it exists for the case where normal authentication has already failed, which makes it the door an attacker reaches for first",
        writes: [{ field: "recovery_log", mode: "append" }],
        next: "w.proof",
        idempotencyKey: "recovery_case_id + a.evidence",
      },
      {
        id: "w.proof",
        kind: "wait",
        until: [
          "proof_of_control_provided",
          "recovery_attempt_failed"
        ],
        onEvent: "c.proof",
        timeout: {
          "after": {
            "key": "account_recovery.proof",
            "rule": "Proof is waited for until the recovery window closes; the window is never restarted by repeated attempts.",
            "class": "attribute-bound",
            "required": true
          },
          "reason": "an open recovery case is a standing invitation to keep trying, and closing it is part of not being a weaker route",
          "relativeTo": "attribute",
          "attribute": "recovery_window_ends_at"
        },
        onTimeout: "x.expired",
        windowExtendsOnEngagement: false,
        recheck: "the the account plus this recovery case re-read from the system of record before acting on the timeout",
      },
      {
        id: "x.expired",
        kind: "exit",
        state: "recovery window closed without sufficient proof",
        terminal: false,
        reEntry: "a new recovery request opens its own case, with this one in the history",
        class: "timeout",
      },
      {
        id: "c.proof",
        kind: "condition",
        asks: "Is the proof sufficient for the assurance this account requires?",
        branches: [
          {
            label: "Sufficient",
            when: "the requester has demonstrated control or entitlement at the required level",
            to: "a.invalidate",
          },
          {
            label: "Insufficient",
            when: "the evidence does not reach the required level",
            to: "c.next",
          },
        ],
      },
      {
        id: "a.invalidate",
        kind: "action",
        does: "Invalidate the credentials and sessions that are no longer safe, before establishing anything new. An old credential left active after a recovery is precisely the thing the recovery existed to remove, and the order matters - new access first would leave both live at once",
        writes: [
          { field: "recovery_log", mode: "append" },
          { field: "suppressed_sends", mode: "append" },
        ],
        next: "a.replace",
        idempotencyKey: "recovery_case_id + a.invalidate",
      },
      {
        id: "a.replace",
        kind: "action",
        does: "Establish secure replacement access at the assurance this account requires",
        writes: [{ field: "recovery_log", mode: "append" }],
        next: "a.verify",
        idempotencyKey: "recovery_case_id + a.replace",
      },
      {
        id: "a.verify",
        kind: "action",
        does: "Verify the recovered state: that the intended access works, and that the invalidated credentials genuinely no longer do. The second half is the one that gets skipped",
        writes: [{ field: "recovery_log", mode: "append" }],
        next: "x.recovered",
        idempotencyKey: "recovery_case_id + a.verify",
      },
      {
        id: "x.recovered",
        kind: "exit",
        state: "secure control of the existing account restored",
        terminal: false,
        reEntry:
          "this recovered one account and merged nothing. Two identities that turn out to be one person is a different problem with different evidence",
        class: "success",
      },
      {
        id: "c.next",
        kind: "condition",
        asks: "With insufficient proof, what does policy allow?",
        branches: [
          {
            label: "Further evidence",
            when: "the recovery basis allows another route to proof within the window",
            to: "x.more",
          },
          {
            label: "Manual review",
            when: "a person should weigh what has been offered",
            to: "h.review",
          },
          {
            label: "Deny",
            when: "no route to sufficient proof remains",
            to: "x.denied",
          },
        ],
      },
      {
        id: "x.more",
        kind: "exit",
        state: "further evidence may be provided within the recovery window",
        terminal: false,
        reEntry: "the same case continues; the window is not restarted by another attempt",
        class: "no-action",
      },
      {
        id: "h.review",
        kind: "handoff",
        to: "DEC-181",
        on: "recovery evidence that needs a person to weigh it",
        carries: [
          "everything offered and the assurance level required",
          "the account's current security state, so the reviewer knows what is at stake",
        ],
      },
      {
        id: "x.denied",
        kind: "exit",
        state: "recovery denied; account access unchanged",
        terminal: false,
        reEntry:
          "a new request with genuinely new evidence may be assessed; repeating the same evidence is not new evidence",
        class: "failure",
      },
    ],
    guardrails: [
      "Recovery does not weaken normal security controls. It is a different route to the same assurance, not a lower one.",
      "Unsafe credentials and sessions are invalidated before replacement access is established, not after.",
      "Account recovery is not identity merge.",
      "The recovery window is not restarted by repeated attempts.",
    ],
    reusableRule:
      "Account recovery restores secure control of an existing account only after sufficient evidence that the requester is entitled to regain control.",
  },

  /* ------------------------------------------------------------ IDN-89 */
  {
    id: "IDN-89",
    slug: "identity-attribute-change",
    category: "identity",
    goal: "change-versioning",
    channels: [],
    name: "Identity attribute change → verify if required → update → propagate",
    shortName: "Identity Attribute Update",
    purpose:
      "Change an identity attribute safely, and reconcile everything that depended on the old value independently rather than by inheritance.",
    entity: {
      scope: "the person or account plus the specific attribute changing",
      note: "Each dependent - a credential, a contact point, a permission - is reconciled on its own terms. None of them travels with the attribute automatically.",
      instanceKey: [
        "account_id",
        "attribute_id"
      ],
      concurrency: "one-active-per-key"
    },
    objective: "Change an identity attribute safely, and reconcile everything that depended on the old value independently rather than by inheritance.",
    eligibility: [
      "a change to an identity attribute, requested by the holder or received from an authoritative source",
      "no instance of this journey is already open for the the person or account plus the specific attribute changing",
      "hard gates (GLB-31) allow communication for this purpose"
    ],
    suppressions: [
      {
        "id": "s.g1",
        "label": "CANONICAL_RULE",
        "text": "Changing an email does not transfer the old address's contactability or its consent to the new one."
      },
      {
        "id": "s.g2",
        "label": "CANONICAL_RULE",
        "text": "Identity history is not silently overwritten where auditability is required."
      },
      {
        "id": "s.g3",
        "label": "CANONICAL_RULE",
        "text": "A stale update never restores a previous value - propagation carries origin and version so a late arrival is discarded."
      },
      {
        "id": "s.g4",
        "label": "CANONICAL_RULE",
        "text": "A sensitive change is not applied on the strength of an existing session alone."
      }
    ],
    implementation: {
      "attributes": {
        "required": [
          "account_id",
          "attribute_id",
          "previous_value",
          "requested_value",
          "verification_policy",
          "dependents",
          "change_origin",
          "change_version",
          "identity_change_log"
        ],
        "optional": []
      }
    },
    measurement: {
      "journeyOutcome": {
        "type": "exit",
        "refs": [
          "x.not-applied",
          "x.rejected",
          "x.reconciled",
          "x.updated"
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
        "identity attribute update",
        "change of name",
        "identity data change",
        "profile identity update"
      ],
      "useCases": [
        "an identity attribute changed with verification where policy requires it",
        "credentials, contactability and permissions re-evaluated independently after the change"
      ]
    },
    entry: "t.change",
    nodes: [
      {
        id: "t.change",
        kind: "trigger",
        event: "identity_attribute_change",
        evidence: {
          requires: [
            "a change to an identity attribute, requested by the holder or received from an authoritative source",
          ],
          insufficientAlone: [
            "a contact point change, which contact verification (CON-264) owns",
            "a display-name edit with nothing depending on it",
            "a propagation of an old value arriving after a newer change"
          ],
          source: "authoritative",
        },
        next: "a.sensitivity",
      },
      {
        id: "a.sensitivity",
        kind: "action",
        does: "Determine the attribute's sensitivity and what verification the change requires. Changing a display name and changing a legal name are not the same operation, and neither is changing a recovery address",
        writes: [{ field: "identity_change_log", mode: "append" }],
        next: "c.verification",
        idempotencyKey: "account_id + attribute_id + a.sensitivity",
      },
      {
        id: "c.verification",
        kind: "condition",
        asks: "Does this change require additional verification?",
        branches: [
          {
            label: "Verification required",
            when: "the attribute is sensitive, or is itself a route back into the account",
            to: "a.verify",
          },
          {
            label: "Not required",
            when: "the attribute carries no security or legal weight",
            to: "c.valid",
          },
        ],
      },
      {
        id: "a.verify",
        kind: "action",
        does: "Verify current control of the account and, where policy requires it, the new attribute itself. An attacker holding a live session must not be able to move the recovery address on the strength of that session alone",
        next: "w.verification",
      },
      {
        id: "w.verification",
        kind: "wait",
        until: [
          "verification_succeeded",
          "verification_failed"
        ],
        onEvent: "c.verified",
        timeout: {
          "after": {
            "key": "identity_attribute.verification",
            "rule": "The verification window for this change.",
            "class": "response-window",
            "required": true
          },
          "reason": "an unverified sensitive change is not applied by default, so an unanswered verification simply leaves the attribute as it was",
          "relativeTo": "trigger"
        },
        onTimeout: "x.not-applied",
        windowExtendsOnEngagement: false,
        recheck: "the the person or account plus the specific attribute changing re-read from the system of record before acting on the timeout",
      },
      {
        id: "c.verified",
        kind: "condition",
        asks: "Was the required control established?",
        branches: [
          { label: "Verified", when: "control and, where required, the new attribute are established", to: "c.valid" },
          { label: "Not verified", when: "verification did not succeed", to: "x.not-applied" },
        ],
      },
      {
        id: "x.not-applied",
        kind: "exit",
        state: "change not applied; the attribute stands as it was",
        terminal: false,
        reEntry:
          "a new request is verified on its own terms. Nothing partial was written, so no downstream system holds a value that was never confirmed",
        class: "invalid-state",
      },
      {
        id: "c.valid",
        kind: "condition",
        asks: "Is the change itself valid?",
        branches: [
          {
            label: "Valid",
            when: "the new value is well-formed, permitted and not in conflict with another record",
            to: "a.update",
          },
          {
            label: "Invalid",
            when: "the value cannot be accepted - malformed, prohibited, or already held elsewhere",
            to: "x.rejected",
          },
        ],
      },
      {
        id: "x.rejected",
        kind: "exit",
        state: "change rejected as invalid",
        terminal: false,
        reEntry: "a corrected value may be submitted",
        class: "invalid-state",
      },
      {
        id: "a.update",
        kind: "action",
        does: "Update the authoritative identity record, preserving the previous value where policy permits, the new value, when it took effect, the source, and the verification evidence and status. Identity history is not silently overwritten where auditability is required - what someone was called, and when that changed, is often the whole question later",
        writes: [{ field: "identity_change_log", mode: "append" }],
        next: "a.propagate",
        idempotencyKey: "account_id + attribute_id + a.update",
      },
      {
        id: "a.propagate",
        kind: "action",
        does: "Propagate to dependent systems carrying change_origin and change_version, so a stale update arriving late cannot restore the previous value",
        writes: [{ field: "identity_change_log", mode: "append" }],
        next: "c.dependents",
        idempotencyKey: "account_id + attribute_id + a.propagate",
      },
      {
        id: "c.dependents",
        kind: "condition",
        asks: "Does this change affect credentials, contactability or permissions?",
        branches: [
          {
            label: "Dependents affected",
            when: "the attribute is used as a credential, as a contact point, or as the basis of a permission",
            to: "a.reconcile",
          },
          {
            label: "Nothing depends on it",
            when: "the attribute is descriptive only",
            to: "x.updated",
          },
        ],
      },
      {
        id: "a.reconcile",
        kind: "action",
        does: "Re-evaluate each dependent independently. A new email address inherits neither the old one's deliverability nor its consent - the new address starts with its own contactability state and its own permission, both empty unless policy explicitly says otherwise. Credentials tied to the old value are assessed on their own terms, and so are permissions that rested on it",
        writes: [{ field: "identity_change_log", mode: "append" }],
        next: "x.reconciled",
        idempotencyKey: "account_id + attribute_id + a.reconcile",
      },
      {
        id: "x.reconciled",
        kind: "exit",
        state: "identity updated; each dependent re-evaluated on its own terms",
        terminal: false,
        reEntry:
          "each dependent's own journey owns what happens next - contactability, permission and credential lifecycles are separately triggered, because they have different owners and different rules",
        class: "success",
      },
      {
        id: "x.updated",
        kind: "exit",
        state: "identity updated; nothing depended on the previous value",
        terminal: false,
        reEntry: "a further change to the same attribute is assessed on its own sensitivity",
        class: "success",
      },
    ],
    guardrails: [
      "Changing an email does not transfer the old address's contactability or its consent to the new one.",
      "Identity history is not silently overwritten where auditability is required.",
      "A stale update never restores a previous value - propagation carries origin and version so a late arrival is discarded.",
      "A sensitive change is not applied on the strength of an existing session alone.",
    ],
    reusableRule:
      "Identity attribute changes should update the authoritative identity while independently reconciling any permissions, credentials or contact points that depend on that attribute.",
  },

  /* ------------------------------------------------------------ IDN-90 */
  {
    id: "IDN-90",
    slug: "suspected-account-compromise",
    category: "identity",
    goal: "escalation-exception",
    channels: [],
    name: "Suspected account compromise → contain → verify → recover or clear",
    shortName: "Account Compromise Recovery",
    purpose:
      "Limit the damage a possible compromise could do while the question is still open, and reach a conclusion that can go either way.",
    entity: {
      scope: "the account plus this security incident and the scope it affects",
      note: "The incident is its own record with its own history. Containment attaches to it, and both survive whichever way the investigation concludes.",
      instanceKey: [
        "incident_id"
      ],
      concurrency: "one-active-per-key"
    },
    distinctFrom: [
      {
        journey: "ACC-78",
        because:
          "Suspension restricts for a stated business reason and expects to be resolved by that reason going away. This restricts on incomplete evidence about an adversary, which is why it opens an investigation rather than a review.",
      },
    ],
    competition: {
      scope: "account",
      exclusionGroup: "account-restriction-authority",
      precedence:
        "highest in the group - a suspected compromise is the more urgent, safety-critical question, and a concurrent business-reason suspension (ACC-78) on the same account pauses rather than resolving independently while this investigation is open",
      onLoss: "paused",
    },
    objective: "Limit the damage a possible compromise could do while the question is still open, and reach a conclusion that can go either way.",
    eligibility: [
      "a material signal: a credential-theft indication, an unauthorised sensitive change, a credible report from the owner, a high-confidence detection, or a suspicious session combined with a consequential action",
      "no instance of this journey is already open for the the account plus this security incident and the scope it affects",
      "hard gates (GLB-31) allow communication for this purpose"
    ],
    suppressions: [
      {
        "id": "s.g1",
        "label": "CANONICAL_RULE",
        "text": "Suspected is not confirmed. The two are separate states and containment belongs to the first."
      },
      {
        "id": "s.g2",
        "label": "CANONICAL_RULE",
        "text": "Containment does not erase forensic or audit history."
      },
      {
        "id": "s.g3",
        "label": "CANONICAL_RULE",
        "text": "Restoration never blindly reactivates old credentials, sessions or permissions - it rebuilds from current valid state."
      },
      {
        "id": "s.g4",
        "label": "CANONICAL_RULE",
        "text": "Unauthorised financial or business actions are corrected through their own dispute lifecycles, not from inside the incident."
      },
      {
        "id": "s.g5",
        "label": "CANONICAL_RULE",
        "text": "Containment uses the smallest scope the evidence justifies, because most signals here are false positives."
      }
    ],
    implementation: {
      "attributes": {
        "required": [
          "incident_id",
          "account_id",
          "signal",
          "scope",
          "containment_applied",
          "review_sla",
          "security_incident_log"
        ],
        "optional": []
      }
    },
    measurement: {
      "journeyOutcome": {
        "type": "exit-or-handoff",
        "refs": [
          "x.continued",
          "h.recover",
          "h.lift",
          "h.review"
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
        "account compromise recovery",
        "account takeover response",
        "compromise containment",
        "security incident (account)"
      ],
      "useCases": [
        "precautionary containment in the smallest scope while the question is open",
        "a conclusion that can go either way: confirmed and restored securely, or cleared and lifted"
      ]
    },
    entry: "t.signal",
    nodes: [
      {
        id: "t.signal",
        kind: "trigger",
        event: "material_compromise_signal",
        evidence: {
          requires: [
            "a material signal: a credential-theft indication, an unauthorised sensitive change, a credible report from the owner, a high-confidence detection, or a suspicious session combined with a consequential action",
          ],
          insufficientAlone: [
            "a single failed login",
            "a login from an unfamiliar location with no consequential action behind it",
          ],
          source: "inferred",
        },
        next: "a.scope",
      },
      {
        id: "a.scope",
        kind: "action",
        does: "Determine the affected scope - which sessions, which credentials, which sensitive capabilities. Scope is the whole question here, because most signals in this category turn out to be false positives, and for those the containment is the entire customer-visible incident",
        writes: [{ field: "security_incident_log", mode: "append" }],
        next: "c.containment",
        idempotencyKey: "incident_id + account_id + a.scope",
      },
      {
        id: "c.containment",
        kind: "condition",
        asks: "Is precautionary containment justified by the evidence?",
        branches: [
          {
            label: "Contain now",
            when: "what could happen while the question is open outweighs the cost of restricting someone who turns out to be legitimate",
            to: "a.contain",
          },
          {
            label: "Investigate without restricting",
            when: "the signal warrants investigation and nothing needs preventing in the meantime",
            to: "a.open",
          },
        ],
      },
      {
        id: "a.contain",
        kind: "action",
        does: "Invalidate or restrict the affected sessions, credentials and sensitive capabilities, at the smallest scope the evidence justifies. Containment is reversible by design and does not erase forensic or audit history - the record of what happened is the only thing the investigation has to work with",
        writes: [
          { field: "security_incident_log", mode: "append" },
          { field: "suppressed_sends", mode: "append" },
        ],
        next: "w.resolution",
        idempotencyKey: "incident_id + account_id + a.contain",
      },
      {
        id: "a.open",
        kind: "action",
        does: "Open the security recovery state without restricting anything, recording that containment was considered and judged unnecessary. Suspected is not confirmed, and the record says which one this is",
        writes: [{ field: "security_incident_log", mode: "append" }],
        next: "w.resolution",
        idempotencyKey: "incident_id + account_id + a.open",
      },
      {
        id: "w.resolution",
        kind: "wait",
        until: [
          "owner_verified",
          "security_review_concluded"
        ],
        onEvent: "c.outcome",
        timeout: {
          "after": {
            "key": "suspected_account.resolution",
            "rule": "The resolution SLA for this incident class.",
            "class": "decision-sla",
            "required": true
          },
          "reason": "an open incident with containment in force is costing a possibly-innocent person their access every day it continues, so an undecided one escalates rather than settles",
          "relativeTo": "trigger"
        },
        onTimeout: "c.inconclusive",
        windowExtendsOnEngagement: false,
        recheck: "the the account plus this security incident and the scope it affects re-read from the system of record before acting on the timeout",
      },
      {
        id: "c.outcome",
        kind: "condition",
        asks: "What did the investigation establish?",
        branches: [
          {
            label: "Compromise confirmed",
            when: "the evidence establishes unauthorised access",
            to: "a.confirmed",
          },
          {
            label: "Cleared",
            when: "the owner is verified and the activity is explained",
            to: "a.cleared",
          },
        ],
      },
      {
        id: "a.confirmed",
        kind: "action",
        does: "Revoke the affected credentials and sessions, and correct the unauthorised changes where correction is valid. Unauthorised financial or business actions are not corrected here - each carries its own dispute or correction lifecycle with its own evidence rules and its own authority, and reversing them from a security incident would bypass both",
        writes: [{ field: "security_incident_log", mode: "append" }],
        next: "h.recover",
        idempotencyKey: "incident_id + account_id + a.confirmed",
      },
      {
        id: "h.recover",
        kind: "handoff",
        to: "ACC-79",
        on: "a confirmed compromise moving to secure restoration",
        carries: [
          "what was revoked and what was corrected",
          "the explicit instruction that access is rebuilt from current valid state - a snapshot taken before the incident would restore exactly the credentials the incident was about",
          "a restoration_case_id minted at this handoff, deterministically derived from incident_id and the confirmed-compromise outcome, so ACC-79 can construct its own instance without inventing one",
        ],
        contract: { requiredFields: ["account_id", "restoration_case_id"] },
      },
      {
        id: "a.cleared",
        kind: "action",
        does: "Record the signal as cleared, keeping it in the security history. A cleared suspicion is still a fact about what was seen, and erasing it makes a recurrence look like a first occurrence - which is the pattern most worth catching",
        writes: [{ field: "security_incident_log", mode: "append" }],
        next: "h.lift",
        idempotencyKey: "incident_id + account_id + a.cleared",
      },
      {
        id: "h.lift",
        kind: "handoff",
        to: "ACC-79",
        on: "a cleared incident whose restrictions should be lifted",
        carries: [
          "which capabilities were restricted and for how long",
          "the instruction to revalidate rather than replay - the previous capability set is history even when nothing was actually wrong",
          "a restoration_case_id minted at this handoff, deterministically derived from incident_id and the cleared outcome, so ACC-79 can construct its own instance without inventing one",
        ],
        contract: { requiredFields: ["account_id", "restoration_case_id"] },
      },
      {
        id: "c.inconclusive",
        kind: "condition",
        asks: "The SLA passed without a conclusion - what now?",
        branches: [
          {
            label: "Continue scoped restriction",
            when: "the evidence still supports restricting at the current scope while work continues",
            to: "x.continued",
          },
          {
            label: "Manual review",
            when: "a person should decide, because the automated path has produced nothing",
            to: "h.review",
          },
        ],
      },
      {
        id: "x.continued",
        kind: "exit",
        state: "incident open; scoped restriction continues",
        terminal: false,
        reEntry:
          "the investigation continues and reaches its conclusion on its own. Suspected remains suspected - it does not become confirmed by lasting longer",
        class: "timeout",
      },
      {
        id: "h.review",
        kind: "handoff",
        to: "DEC-181",
        on: "an incident the automated path could not resolve within its SLA",
        carries: [
          "the evidence, the containment applied and how long it has been in force",
          "the fact that nothing is confirmed, so the reviewer is deciding rather than ratifying",
        ],
      },
    ],
    guardrails: [
      "Suspected is not confirmed. The two are separate states and containment belongs to the first.",
      "Containment does not erase forensic or audit history.",
      "Restoration never blindly reactivates old credentials, sessions or permissions - it rebuilds from current valid state.",
      "Unauthorised financial or business actions are corrected through their own dispute lifecycles, not from inside the incident.",
      "Containment uses the smallest scope the evidence justifies, because most signals here are false positives.",
    ],
    reusableRule:
      "Suspected compromise requires reversible containment and evidence-based recovery before normal account control is restored.",
  },
  {
    id: "IDN-270",
    slug: "account-recovery-guidance",
    category: "identity",
    goal: "suspension-restoration",
    channels: ["email", "sms"],
    name: "Account recovery started → proof of control → access restored or window closed",
    shortName: "Account Recovery",
    purpose:
      "Carry somebody who cannot authenticate through the evidence their recovery actually requires, inside a stated window, on a route that is no weaker than the login it is standing in for.",
    entity: {
      scope: "one existing account plus this recovery case and its window",
      note: "One case, one window. A second recovery request on the same account opens its own case; it does not extend or restart this one.",
      instanceKey: [
        "recovery_case_id"
      ],
      concurrency: "one-active-per-key"
    },
    distinctFrom: [
      {
        journey: "IDN-88",
        because:
          "IDN-88 decides the recovery basis, judges the evidence and rebuilds secure access. This journey sends nothing that IDN-88 has not already established, and it decides nothing - it is the requester's side of that case.",
      },
      {
        journey: "IDN-90",
        because:
          "IDN-90 governs a suspected compromise. Here the account is not under suspicion; somebody simply cannot get in, and treating the two the same makes every locked-out person a suspect.",
      },
    ],
    objective: "Carry somebody who cannot authenticate through the evidence their recovery actually requires, inside a stated window, on a route that is no weaker than the login it is standing in for.",
    eligibility: [
      "a recovery case authoritatively opened against one existing account",
      "the recovery basis and the evidence that basis requires",
      "a recovery window with a stated end",
      "no instance of this journey is already open for the one existing account plus this recovery case and its window",
      "hard gates (GLB-31) allow communication for this purpose"
    ],
    suppressions: [
      {
        "id": "s.g1",
        "label": "CANONICAL_RULE",
        "text": "The recovery route goes to a destination the account already held, never to one supplied with the request."
      },
      {
        "id": "s.g2",
        "label": "CANONICAL_RULE",
        "text": "Recovery is a different route to the same assurance, not a lower one. Nothing here is easier than the authentication it stands in for."
      },
      {
        "id": "s.g3",
        "label": "CANONICAL_RULE",
        "text": "The window is never restarted by repeated attempts, and never extended by engagement."
      },
      {
        "id": "s.g4",
        "label": "CANONICAL_RULE",
        "text": "One reminder, never two. On a security route, repetition is indistinguishable from pressure."
      },
      {
        "id": "s.g5",
        "label": "CANONICAL_RULE",
        "text": "What was invalidated is named in the confirmation, or the next refused credential reads as a fresh attack."
      }
    ],
    contact: {
      "defaultPriority": "security",
      "pressureClass": "none",
      "localCap": {
        "value": {
          "key": "account_recovery.touches",
          "rule": "Every touch runs against a budget fixed when the instance opened; the budget is the plan's own length, and no touch is repeated because nothing could tell whether it arrived.",
          "default": {
            "value": 1,
            "confidence": "high",
            "basis": "corpus-rule",
            "applicableWhen": "GLB-24; the graph's own touch count"
          },
          "required": false
        },
        "appliesTo": "non-mandatory"
      },
      "cooldown": {
        "key": "account_recovery.cooldown",
        "rule": "This journey is per one existing account plus this recovery case and its window; a later instance concerns a different one existing account plus this recovery case and its window and no cooldown applies between them.",
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
          "stage": "issue",
          "action": "a.issue",
          "prerequisites": [
            "c.incident"
          ],
          "purpose": "Send the recovery route to a destination the account already held, and state exactly what evidence is required and when the window closes.",
          "channelRoles": [
            "persistent",
            "urgent"
          ],
          "mandatory": true,
          "label": "CANONICAL_RULE",
          "destination": {
            "target": "recovery-route",
            "boundTo": "recovery_case_id",
            "mustNotClaim": [
              "a destination supplied inside the request"
            ]
          }
        },
        {
          "id": "t2",
          "stage": "restored",
          "action": "a.restored",
          "after": "t1",
          "gatedBy": "w.proof",
          "prerequisites": [
            "c.proof"
          ],
          "purpose": "Confirm that control is back and name what was invalidated on the way - the sessions and credentials that will no longer work.",
          "channelRoles": [
            "persistent",
            "urgent"
          ],
          "mandatory": true,
          "label": "CANONICAL_RULE"
        },
        {
          "id": "t3",
          "stage": "remind",
          "action": "a.remind",
          "gatedBy": "w.proof",
          "prerequisites": [
            "c.remind"
          ],
          "purpose": "Send one reminder on the same already-held destination, naming the deadline and the evidence still outstanding.",
          "channelRoles": [
            "persistent",
            "urgent"
          ],
          "mandatory": false,
          "label": "RECOMMENDED_DEFAULT",
          "after": "t1",
          "destination": {
            "target": "recovery-route",
            "boundTo": "recovery_case_id",
            "mustNotClaim": [
              "a restarted window"
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
          "recovery_case_id",
          "account_id",
          "recovery_basis",
          "required_evidence",
          "recovery_window_ends_at",
          "held_destinations"
        ],
        "optional": []
      }
    },
    measurement: {
      "journeyOutcome": {
        "type": "exit-or-handoff",
        "refs": [
          "x.restored",
          "x.moot",
          "x.closed",
          "h.security"
        ]
      },
      "businessOutcome": {
        "event": "proof_of_control_provided",
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
        "account recovery",
        "forgot password recovery",
        "locked-out recovery",
        "recovery link",
        "regain access"
      ],
      "useCases": [
        "a recovery route sent only to a destination the account already held",
        "one reminder inside a stated window that repeated attempts never restart"
      ]
    },
    entry: "t.recovery",
    nodes: [
      {
        id: "t.recovery",
        kind: "trigger",
        event: "account_recovery_case_opened",
        evidence: {
          requires: [
            "a recovery case authoritatively opened against one existing account",
            "the recovery basis and the evidence that basis requires",
            "a recovery window with a stated end",
          ],
          insufficientAlone: [
            "a failed authentication attempt",
            "a support conversation about being locked out",
            "a destination supplied inside the request itself",
          ],
          source: "authoritative",
        },
        next: "c.incident",
      },
      {
        id: "c.incident",
        kind: "condition",
        asks: "Is this account already under an open security incident?",
        branches: [
          {
            label: "Incident open",
            when: "a compromise signal or security incident is live on this account",
            to: "h.security",
          },
          {
            label: "Clear",
            when: "the account has no open incident and this is an ordinary loss of access",
            to: "a.issue",
          },
        ],
      },
      {
        id: "h.security",
        kind: "handoff",
        to: "IDN-90",
        on: "a recovery attempt on an account that is already under an open compromise signal",
        carries: [
          "the recovery case and the basis claimed",
          "which destinations the request arrived from, and which were already on the account",
        ],
      },
      {
        id: "a.issue",
        kind: "action",
        does: "Send the recovery route to a destination the account already held, and state exactly what evidence is required and when the window closes. A route sent to whichever destination asked for it is not recovery, it is the thing recovery exists to prevent",
        next: "w.proof",
        execution: "communication",
        idempotencyKey: "recovery_case_id + account_id + a.issue",
      },
      {
        id: "w.proof",
        kind: "wait",
        until: [
          "proof_of_control_provided",
          "access_regained",
          "request_withdrawn"
        ],
        onEvent: "c.proof",
        timeout: {
          "after": {
            "key": "account_recovery.proof",
            "rule": "The point in the window at which a reminder would still leave time to act.",
            "class": "reminder-before-attribute",
            "required": true
          },
          "reason": "a reminder that lands after the window tells somebody they have lost something instead of helping them keep it",
          "relativeTo": "attribute",
          "attribute": "recovery_window_ends_at"
        },
        onTimeout: "c.remind",
        windowExtendsOnEngagement: false,
        recheck: "the one existing account plus this recovery case and its window re-read from the system of record before acting on the timeout",
      },
      {
        id: "c.proof",
        kind: "condition",
        asks: "What ended the wait?",
        branches: [
          {
            label: "Control proven",
            when: "the evidence the basis required was provided and judged sufficient",
            to: "a.restored",
          },
          {
            label: "Resolved elsewhere",
            when: "the requester got back in by ordinary means, or withdrew the case",
            to: "x.moot",
          },
        ],
      },
      {
        id: "a.restored",
        kind: "action",
        does: "Confirm that control is back and name what was invalidated on the way - the sessions and credentials that will no longer work. Somebody who is not told what was cut off reads the next refusal as a second compromise",
        next: "x.restored",
        execution: "communication",
        idempotencyKey: "recovery_case_id + account_id + a.restored",
      },
      {
        id: "x.restored",
        kind: "exit",
        state: "control restored and confirmed",
        terminal: false,
        reEntry: "a later recovery case on the same account is a new instance with its own window",
        class: "success",
      },
      {
        id: "x.moot",
        kind: "exit",
        state: "recovery closed without being used",
        terminal: false,
        reEntry: "a new request opens a new case; this one is not resumed",
        class: "success",
      },
      {
        id: "c.remind",
        kind: "condition",
        asks: "Is one reminder still worth sending?",
        branches: [
          {
            label: "Time remains",
            when: "enough of the window is left for the outstanding evidence to be produced, and no reminder has been sent for this case",
            to: "a.remind",
          },
          {
            label: "Effectively closed",
            when: "too little of the window remains for the evidence to arrive in time",
            to: "x.closed",
          },
        ],
      },
      {
        id: "a.remind",
        kind: "action",
        does: "Send one reminder on the same already-held destination, naming the deadline and the evidence still outstanding. There is no second reminder - a recovery nobody is pursuing has usually been abandoned rather than forgotten, and repetition on a security route is itself a pressure tactic",
        next: "w.final",
        execution: "communication",
        idempotencyKey: "recovery_case_id + account_id + a.remind",
      },
      {
        id: "w.final",
        kind: "wait",
        until: [
          "proof_of_control_provided"
        ],
        onEvent: "c.proof",
        timeout: {
          "after": {
            "key": "account_recovery.final",
            "rule": "After the reminder the instance waits until the recovery window itself closes; the window is never restarted.",
            "class": "attribute-bound",
            "required": true
          },
          "reason": "the window is a security control rather than a courtesy, and a route left open indefinitely is weaker than the login it replaced",
          "relativeTo": "attribute",
          "attribute": "recovery_window_ends_at"
        },
        onTimeout: "x.closed",
        windowExtendsOnEngagement: false,
        recheck: "the one existing account plus this recovery case and its window re-read from the system of record before acting on the timeout",
      },
      {
        id: "x.closed",
        kind: "exit",
        state: "recovery window closed without sufficient proof",
        terminal: false,
        reEntry: "a fresh request opens a new case and a new window; the closed one is never extended",
        class: "timeout",
      },
    ],
    guardrails: [
      "The recovery route goes to a destination the account already held, never to one supplied with the request.",
      "Recovery is a different route to the same assurance, not a lower one. Nothing here is easier than the authentication it stands in for.",
      "The window is never restarted by repeated attempts, and never extended by engagement.",
      "One reminder, never two. On a security route, repetition is indistinguishable from pressure.",
      "What was invalidated is named in the confirmation, or the next refused credential reads as a fresh attack.",
    ],
    reusableRule:
      "A way back into an account is only worth offering if it is no easier to walk than the door it replaces.",
  },
  {
    id: "IDN-271",
    slug: "compromise-alert-verification",
    category: "identity",
    goal: "escalation-exception",
    channels: ["email", "sms"],
    name: "Compromise signal → scoped containment → owner verification → recover or clear",
    shortName: "Account Security Alert",
    purpose:
      "Ask the owner the one question that resolves a suspected compromise, on a route the suspicion does not touch, while saying plainly whether anything has actually been restricted.",
    entity: {
      scope: "the account plus this security incident and the scope it affects",
      note: "The incident is the subject and it has its own record. A later signal on the same account is a separate incident and gets its own question.",
      instanceKey: [
        "account_id",
        "incident_id"
      ],
      concurrency: "one-active-per-key"
    },
    distinctFrom: [
      {
        journey: "IDN-90",
        because:
          "IDN-90 determines scope, applies reversible containment and concludes the investigation. This journey does none of that; it is the owner's side of the same incident and it starts only once the scope is known.",
      },
      {
        journey: "IDN-88",
        because:
          "IDN-88 restores control to somebody who cannot get in. Here the owner still has access, and the open question is whether somebody else does too.",
      },
    ],
    objective: "Tell the account owner, at every verified destination the signal does not implicate, what was seen and what was restricted - and let their answer resolve it: cleared, or into secure recovery.",
    eligibility: [
      "a compromise incident is opened for the account with its scope determined",
      "at least one verified destination exists that the signal does not implicate",
      "the incident has a review point set"
    ],
    suppressions: [
      {
        "id": "s.implicated-route",
        "label": "CANONICAL_RULE",
        "text": "No alert goes to a destination the signal implicates; where every route is implicated the alert is withheld and the incident proceeds on the security side alone."
      },
      {
        "id": "s.no-claim",
        "label": "CANONICAL_RULE",
        "text": "Suspected is not confirmed: the alert says what was restricted only where something was, and says plainly that nothing was restricted where nothing was."
      },
      {
        "id": "s.multi-destination",
        "label": "CANONICAL_RULE",
        "text": "The alert goes to every verified, unimplicated destination at once; a single destination that may itself be compromised is never the only one told."
      },
      {
        "id": "s.owner-informed-past-review",
        "label": "CANONICAL_RULE",
        "text": "An incident open past its review point is stated to the owner as open, with what remains restricted; it is not silently left in place."
      },
      {
        "id": "s.hard-gates-only",
        "label": "CANONICAL_RULE",
        "text": "Security alerts are exempt from pressure caps and marketing permission; only hard gates (GLB-31) apply, and a fraud hold does not stop an alert to the owner at an unimplicated destination."
      }
    ],
    contact: {
      "defaultPriority": "security",
      "pressureClass": "none",
      "localCap": {
        "value": {
          "key": "security_alert.discretionary_touches",
          "rule": "Every touch in this plan is mandatory; nothing is rationed and nothing discretionary exists to cap.",
          "default": {
            "value": 0,
            "confidence": "high",
            "basis": "corpus-rule",
            "applicableWhen": "every touch in the plan is marked mandatory"
          },
          "required": false
        },
        "appliesTo": "non-mandatory"
      },
      "cooldown": {
        "key": "security_alert.cooldown",
        "rule": "Alerts are per incident; a new incident is its own instance and no cooldown applies between incidents.",
        "default": {
          "value": "none",
          "confidence": "high",
          "basis": "corpus-rule"
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
          "when": "a verified address the signal does not implicate exists; the alert must be kept and re-read"
        },
        {
          "role": "urgent",
          "channels": [
            "sms"
          ],
          "when": "a verified number the signal does not implicate exists; the shortest route to the confirmation question"
        }
      ],
      "fallback": "same-role-other-channel",
      "simultaneous": { "allowed": true, "reason": "every verified destination the signal does not implicate is told at once, because a single destination may itself be the compromised one" },
      "label": "CANONICAL_RULE"
    },
    orchestration: {
      "strategy": "notice-then-confirm",
      "touches": [
        {
          "id": "t-contained",
          "stage": "alert",
          "action": "a.alert-contained",
          "prerequisites": [
            "c.route",
            "c.contained"
          ],
          "purpose": "Say what was restricted, why, and that confirming whether the recent activity was theirs is what resolves it.",
          "channelRoles": [
            "persistent",
            "urgent"
          ],
          "destination": {
            "target": "activity-confirmation",
            "boundTo": "incident_id",
            "mustNotClaim": [
              "that the account is confirmed compromised",
              "a restriction that was not applied"
            ]
          },
          "mandatory": true,
          "label": "CANONICAL_RULE"
        },
        {
          "id": "t-watch",
          "stage": "alert",
          "action": "a.alert-watch",
          "prerequisites": [
            "c.route",
            "c.contained"
          ],
          "purpose": "Ask whether the recent activity was theirs and say plainly that nothing has been restricted.",
          "channelRoles": [
            "persistent",
            "urgent"
          ],
          "destination": {
            "target": "activity-confirmation",
            "boundTo": "incident_id",
            "mustNotClaim": [
              "that anything was restricted",
              "that the account is confirmed compromised"
            ]
          },
          "mandatory": true,
          "label": "CANONICAL_RULE"
        },
        {
          "id": "t-cleared",
          "stage": "resolution",
          "action": "a.cleared",
          "gatedBy": "w.verify",
          "prerequisites": [
            "c.outcome"
          ],
          "purpose": "Say the signal is cleared and name anything that has been lifted, so a restriction met yesterday is not still assumed today.",
          "channelRoles": [
            "persistent",
            "urgent"
          ],
          "mandatory": true,
          "label": "CANONICAL_RULE"
        },
        {
          "id": "t-standing",
          "stage": "resolution",
          "action": "a.standing",
          "gatedBy": "w.verify",
          "prerequisites": [],
          "purpose": "Tell the owner the incident is still open past its review point, what remains restricted, and that nothing further is assumed from their silence.",
          "destination": { "target": "incident-status", "boundTo": "incident_id", "mustNotClaim": ["that the incident is resolved"] },
          "channelRoles": [
            "persistent",
            "urgent"
          ],
          "mandatory": true,
          "label": "CANONICAL_RULE"
        }
      ],
      "noAction": [
        "s.implicated-route",
        "s.no-claim",
        "s.multi-destination",
        "s.owner-informed-past-review",
        "s.hard-gates-only"
      ]
    },
    implementation: {
      "attributes": {
        "required": [
          "account_id",
          "incident_id",
          "scope",
          "implicated_destinations",
          "verified_destinations",
          "containment_applied",
          "review_point_at"
        ],
        "optional": [
          "restrictions_applied",
          "signal_summary"
        ]
      }
    },
    measurement: {
      "journeyOutcome": {
        "type": "exit-or-handoff",
        "refs": [
          "x.cleared",
          "x.open",
          "x.withheld",
          "h.recovery"
        ]
      },
      "businessOutcome": {
        "event": "activity_confirmed_own",
        "unit": "instance",
        "observationScope": {
          "type": "self"
        },
        "window": {
          "type": "until-exit"
        },
        "attribution": "entered-before-event",
        "comparison": "not-applicable"
      },
      "secondary": [
        "activity_reported_not_own",
        "security_review_concluded"
      ],
      "guardrails": [
        "alert_to_implicated_destination",
        "restriction_claimed_not_applied",
        "complaint",
        "support_contact_within_24h"
      ],
      "operational": [
        "incident_volume",
        "withheld_rate",
        "contained_vs_watch",
        "owner_response_rate",
        "time_to_resolution",
        "recovery_handoff_rate"
      ]
    },
    discovery: {
      "aliases": [
        "account security alert",
        "suspicious login alert",
        "unusual activity alert",
        "compromise notification",
        "security notification",
        "new device alert"
      ],
      "useCases": [
        "a sign-in from an unrecognised context that restricted part of the account",
        "suspicious activity seen but nothing restricted, and the owner asked whether it was theirs"
      ]
    },
    entry: "t.signal",
    nodes: [
      {
        id: "t.signal",
        kind: "trigger",
        event: "compromise_incident_opened_with_scope_determined",
        evidence: {
          requires: [
            "a security incident authoritatively opened against the account",
            "the affected scope determined - which sessions, credentials and capabilities",
            "a record of whether containment was applied and how wide",
          ],
          insufficientAlone: [
            "a single failed authentication",
            "a risk score with no incident behind it",
            "an unusual location with no other signal",
          ],
          source: "authoritative",
        },
        next: "c.route",
      },
      {
        id: "c.route",
        kind: "condition",
        asks: "Is there a destination the signal does not implicate?",
        branches: [
          {
            label: "Clean route",
            when: "a contact point sits outside the affected scope and was not itself added or changed inside the window under suspicion",
            to: "c.contained",
          },
          {
            label: "Every route implicated",
            when: "the only destinations were changed in the suspicious window or sit behind the same access under question",
            to: "x.withheld",
          },
        ],
      },
      {
        id: "x.withheld",
        kind: "exit",
        state: "no destination outside the suspicion; no alert sent",
        terminal: false,
        reEntry: "if a destination outside the affected scope is established, the verification question runs from there",
        class: "no-action",
      },
      {
        id: "c.contained",
        kind: "condition",
        asks: "Has anything actually been restricted?",
        branches: [
          {
            label: "Containment applied",
            when: "sessions, credentials or capabilities were restricted, so the owner will meet the restriction whether or not we say so first",
            to: "a.alert-contained",
          },
          {
            label: "Nothing restricted",
            when: "the evidence did not justify restriction and the account is operating normally",
            to: "a.alert-watch",
          },
        ],
      },
      {
        id: "a.alert-contained",
        kind: "action",
        does: "Say what was restricted, why, and that confirming whether the recent activity was theirs is what resolves it. A restriction somebody walks into unwarned is indistinguishable from the compromise it was meant to contain",
        next: "w.verify",
        execution: "communication",
        idempotencyKey: "incident_id + touch id",
      },
      {
        id: "a.alert-watch",
        kind: "action",
        does: "Ask whether the recent activity was theirs and say plainly that nothing has been restricted. Suspected is not confirmed, and most of these signals are not - a message that implies otherwise converts a false positive into a frightened person",
        next: "w.verify",
        execution: "communication",
        idempotencyKey: "incident_id + touch id",
      },
      {
        id: "w.verify",
        kind: "wait",
        until: [
          "activity_confirmed_own",
          "activity_reported_not_own",
          "security_review_concluded"
        ],
        onEvent: "c.outcome",
        timeout: {
          "after": {
            "key": "security_alert.review_point",
            "rule": "The wait is the review point set for this incident by the security process; an owner still silent at the review point is told the incident stands open, and silence is never read as confirmation.",
            "class": "decision-sla",
            "required": true
          },
          "reason": "an open suspicion with no stated conclusion is a restriction with no end date, and the owner is the one living inside it",
          "relativeTo": "trigger"
        },
        onTimeout: "a.standing",
        windowExtendsOnEngagement: false,
        recheck: "the incident re-read: the owner's answer if any, the security review's state, and what remains restricted",
      },
      {
        id: "c.outcome",
        kind: "condition",
        asks: "What did the answer establish?",
        branches: [
          {
            label: "Theirs",
            when: "the owner confirms the activity, or the review clears the signal without them",
            to: "a.cleared",
          },
          {
            label: "Not theirs",
            when: "the owner reports the activity was not theirs, or the review confirms the compromise",
            to: "h.recovery",
          },
        ],
      },
      {
        id: "a.cleared",
        kind: "action",
        does: "Say the signal is cleared and name anything that has been lifted, so a restriction met yesterday is not still assumed today. The record of the signal stays; only the restriction goes",
        next: "x.cleared",
        execution: "communication",
        idempotencyKey: "incident_id + touch id",
      },
      {
        id: "x.cleared",
        kind: "exit",
        state: "cleared; restrictions lifted and the owner told",
        terminal: false,
        reEntry: "a further signal on the same account is a new incident and a new instance",
        class: "success",
      },
      {
        id: "h.recovery",
        kind: "handoff",
        to: "IDN-88",
        on: "a confirmed compromise where the owner needs secure control of the account rebuilt",
        carries: [
          "the incident, its affected scope and what was contained",
          "which destinations were treated as implicated and which carried the alert",
        ],
      },
      {
        id: "a.standing",
        kind: "action",
        does: "Tell the owner the incident is still open past its review point, what remains restricted, and that nothing further is required from them. A restriction with no stated owner and no stated date is where duplicate cases come from",
        next: "x.open",
        execution: "communication",
        idempotencyKey: "incident_id + touch id",
      },
      {
        id: "x.open",
        kind: "exit",
        state: "incident open past its review point; the owner knows where it sits",
        terminal: false,
        reEntry: "the conclusion, whenever it lands, re-enters on the cleared or the recovery path",
        class: "timeout",
      },
    ],
    guardrails: [
      "The alert goes only to destinations outside the affected scope. A notice delivered to the compromised route warns the wrong person.",
      "Suspected is not confirmed, and the message says which one this is.",
      "Where nothing was restricted, the message says so. Implying a lockout that did not happen is its own harm.",
      "The all-clear is sent as deliberately as the alert was, because most signals in this category clear.",
      "A cleared signal stays in the security history; erasing it makes a recurrence look like a first occurrence.",
    ],
    reusableRule:
      "A security question can only be asked on a route the suspicion does not reach, and it has to be as easy to answer no as yes.",
  },
];
