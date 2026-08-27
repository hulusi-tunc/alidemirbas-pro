import type { CanonicalJourney, OrchestrationRule } from "./types";

/* CATEGORY 22 - DOCUMENTS, RECORDS, SIGNATURES & VERSIONED ARTIFACTS

   A document is the only entity in this library whose whole value is that it
   does not change. Everything else here models a state moving; this models a
   thing that must be able to say exactly what it said on a particular day, to
   somebody who is asking because it now matters.

   That gives it one hard rule and a set of consequences. The rule is that an
   issued version is immutable. The consequences are that changes create
   successors rather than edits, that a signature binds to one version and not
   to a document, that superseding is prospective, and that conflicts are
   explained rather than tidied away.

   The stages, which are routinely collapsed and should not be:

     required       the process needs an artifact it does not have
     drafted        contents pulled from authoritative sources
     validated      complete, consistent, traceable to those sources
     issued         frozen, identified, auditable
     distributed    a specific version reached a specific recipient
     signed         the required parties signed that exact version
     effective      the conditions governing its effect are satisfied

   Two pairs at the end are the ones that cost most when merged. Issued and
   effective: a contract can exist in final form and bind nobody. Signed and
   effective: the signatures can all be present and the thing still not be in
   force, because a date or a condition governs that separately.

   And three ways a document stops being relied on, which are not the same
   thing: it expired, somebody revoked it, or a successor replaced it. Only the
   second is anybody's decision, and none of them makes the past invalid. */

export const DOCUMENT_RULES: readonly OrchestrationRule[] = [
  {
    id: "DOC-R1",
    scope: "document",
    rule: "Requirement, draft, issuance, distribution, signature and effectiveness are six separate stages.",
    because:
      "Each fails on its own. A document can be issued and undelivered, delivered and unsigned, signed and not in force - and each of those is a different thing to tell somebody.",
  },
  {
    id: "DOC-R2",
    scope: "document",
    rule: "Existing valid documents are reused where they satisfy the exact requirement.",
    because:
      "Regenerating an identical artifact produces two records claiming the same thing, and a later reader has to work out which one anybody actually acted on.",
  },
  {
    id: "DOC-R3",
    scope: "document",
    rule: "A generated file is not an authoritative issued document.",
    because:
      "Rendering succeeded says the template worked. Whether the contents are complete, current and sourced is a separate question, and only the second one makes it a document.",
  },
  {
    id: "DOC-R4",
    scope: "document",
    rule: "Issued versions are immutable.",
    because:
      "A document that can be edited after issue cannot answer what anybody was looking at when they agreed to it, which is the only question it will ever be asked.",
  },
  {
    id: "DOC-R5",
    scope: "document",
    rule: "Changes to issued artifacts create new versions or amendments.",
    because:
      "The successor carries its own approval and its own effective conditions. Editing in place gives the new terms the old document's authority and date.",
  },
  {
    id: "DOC-R6",
    scope: "document",
    rule: "Distribution state does not define document validity.",
    because:
      "An undelivered contract is a valid contract nobody has. Treating delivery as validity makes a mail failure into a legal one.",
  },
  {
    id: "DOC-R7",
    scope: "document",
    rule: "A signature binds to an exact document version.",
    because:
      "A signature is valid for what was in front of the signer and for nothing else, however similar the successor's content looks.",
  },
  {
    id: "DOC-R8",
    scope: "document",
    rule: "Signature requested and signature completed are separate states.",
    because:
      "Most signature requests are pending rather than done, and reporting a sent request as a signed document is how a process proceeds on an agreement nobody made.",
  },
  {
    id: "DOC-R9",
    scope: "document",
    rule: "Fully signed and effective can remain separate.",
    because:
      "A future date, a condition or an external dependency commonly governs when a signed document does anything, and acting on signature alone starts obligations early.",
  },
  {
    id: "DOC-R10",
    scope: "document",
    rule: "Future-effective documents are revalidated at their effective time.",
    because:
      "Between signature and effect the document can be superseded or revoked, and a scheduled activation firing on stored assumptions brings the wrong version into force.",
  },
  {
    id: "DOC-R11",
    scope: "document",
    rule: "Superseded documents remain valid historical records.",
    because:
      "The prior version governed everything that happened while it was current, and that stays true. Superseded describes future use rather than past validity.",
  },
  {
    id: "DOC-R12",
    scope: "document",
    rule: "Expiry, revocation and supersession are three distinct states.",
    because:
      "Time ran out, somebody withdrew it, or something replaced it. Only one of those is a decision, and they carry different consequences for what was done meanwhile.",
  },
  {
    id: "DOC-R13",
    scope: "document",
    rule: "Document expiry affects only processes that require current validity.",
    because:
      "One expired certificate stopping an entire relationship is a suspension nobody decided and nobody can find the authority for.",
  },
  {
    id: "DOC-R14",
    scope: "document",
    rule: "Revocation respects its own explicit effective scope.",
    because:
      "A revocation applied more broadly than its terms withdraws things the authority did not withdraw, and there is no record of who decided that.",
  },
  {
    id: "DOC-R15",
    scope: "document",
    rule: "New document versions never silently rewrite historical business actions.",
    because:
      "Actions taken under the version that governed them were correct. Restating them under a successor makes a compliant history retroactively non-compliant.",
  },
  {
    id: "DOC-R16",
    scope: "document",
    rule: "Document lineage stays auditable.",
    because:
      "Without it a chain of versions is a set of unrelated files with similar names, and nobody can say which one anybody signed.",
  },
  {
    id: "DOC-R17",
    scope: "document",
    rule: "Document distribution reuses the canonical communication mechanisms.",
    because:
      "Channels, permissions, retries and delivery evidence are already owned there. A parallel delivery path will disagree with the canonical delivery record about whether the contract was sent.",
  },
  {
    id: "DOC-R19",
    scope: "document",
    rule: "Policy and compliance requirements reuse RSK-191 to RSK-200 where applicable.",
    because:
      "Whether a document is required, and under which effective policy version, is a policy question. Answering it locally produces a second policy engine nobody maintains.",
  },
  {
    id: "DOC-R20",
    scope: "document",
    rule: "Document state and the business entity the document represents are never the same state.",
    because:
      "The contract is not the relationship and the invoice is not the debt. Reading one as the other means a filing error changes what somebody owes.",
  },
];

export const DOCUMENT_JOURNEYS: readonly CanonicalJourney[] = [
  /* ------------------------------------------------------------ DOC-211 */
  {
    id: "DOC-211",
    slug: "document-requirement",
    category: "document",
    goal: "eligibility-qualification",
    channels: [],
    name: "Document requirement → determine artifact → create, reuse or waive",
    purpose:
      "Decide whether a new artifact is genuinely needed, or whether one already exists that answers the requirement.",
    entity: {
      scope: "the business process and the artifact requirement it has reached",
      note: "The requirement names a type, a purpose, parties and validity conditions. Reuse is only possible against all four, not against the type alone.",
    },
    distinctFrom: [
      {
        journey: "RSK-195",
        because:
          "RSK-195 owns the compliance requirement itself - whether an obligation is met. This owns the artifact lifecycle a requirement may need: which document, generated how, issued when, signed by whom. A compliance requirement can be satisfied without any document, and most documents exist for reasons that are not compliance.",
      },
    ],
    entry: "t.requirement",
    nodes: [
      {
        id: "t.requirement",
        kind: "trigger",
        event: "process_reaches_document_requirement",
        evidence: {
          requires: ["a business process reaching a point where an artifact is required"],
          insufficientAlone: [
            "a process step occurring, which does not by itself mean a new document is needed",
          ],
          source: "authoritative",
        },
        next: "a.determine",
      },
      {
        id: "a.determine",
        kind: "action",
        does: "Determine the required artifact type, its purpose, the required parties, the required data, its validity requirements, and whether an existing artifact could satisfy all of them",
        writes: [{ field: "document_log", mode: "append" }],
        next: "c.existing",
      },
      {
        id: "c.existing",
        kind: "condition",
        asks: "Does an existing valid artifact satisfy this requirement?",
        branches: [
          {
            label: "One does",
            when: "an existing document matches the type, the scope, the parties and is still within its validity",
            to: "a.reuse",
          },
          {
            label: "None",
            when: "nothing held matches, or what is held has lapsed or was scoped to something else",
            to: "c.waiver",
          },
        ],
      },
      {
        id: "a.reuse",
        kind: "action",
        does: "Reference the existing artifact and its exact version rather than generating another. Regenerating an identical document produces two records claiming the same thing, and a later reader has to work out which one anybody actually acted on",
        writes: [{ field: "document_log", mode: "append" }],
        next: "x.reused",
      },
      {
        id: "x.reused",
        kind: "exit",
        state: "requirement satisfied by an existing valid artifact",
        terminal: false,
        reEntry:
          "that artifact expiring or being revoked reopens the requirement, which is then assessed fresh rather than assumed still met",
      },
      {
        id: "c.waiver",
        kind: "condition",
        asks: "Does an authorized rule waive this requirement?",
        branches: [
          {
            label: "It is waived",
            when: "a rule or an authority explicitly excuses the artifact for this case",
            to: "a.waive",
          },
          {
            label: "It stands",
            when: "no waiver applies",
            to: "a.create",
          },
        ],
      },
      {
        id: "a.waive",
        kind: "action",
        does: "Record the waiver with the rule and the authority behind it. A requirement quietly skipped is indistinguishable from one nobody noticed, and the difference matters entirely when somebody asks why the document is missing",
        writes: [{ field: "document_log", mode: "append" }],
        next: "x.waived",
      },
      {
        id: "x.waived",
        kind: "exit",
        state: "requirement waived, with the authority recorded",
        terminal: false,
        reEntry:
          "the waiver's own scope bounds it. A different instance of the same requirement is assessed on its own terms",
      },
      {
        id: "a.create",
        kind: "action",
        does: "Create the document obligation with its type, purpose, parties, required data and validity requirements",
        writes: [{ field: "document_log", mode: "append" }],
        next: "h.draft",
      },
      {
        id: "h.draft",
        kind: "handoff",
        to: "DOC-212",
        on: "an unmet artifact requirement",
        carries: [
          "the artifact type, its purpose, the parties and the data it needs",
          "the validity requirements, which decide what makes it complete rather than merely rendered",
        ],
      },
    ],
    guardrails: [
      "A process event does not always require a new document.",
      "An identical artifact is not regenerated unnecessarily.",
      "Reuse respects the existing document's version, scope and validity.",
    ],
    reusableRule:
      "A document should be created only when the process has an unmet artifact requirement that cannot be satisfied by an existing valid record.",
  },

  /* ------------------------------------------------------------ DOC-212 */
  {
    id: "DOC-212",
    slug: "document-draft",
    category: "document",
    goal: "data-integrity",
    channels: [],
    name: "Document draft → populate → validate → ready or blocked",
    purpose:
      "Build the contents from authoritative sources and prove they are complete before anything is issued.",
    entity: {
      scope: "the draft and the source entities its contents came from",
      note: "Each field carries which source and which version it came from. A document that cannot say where its contents originated cannot be defended when they are questioned.",
    },
    entry: "t.begins",
    nodes: [
      {
        id: "t.begins",
        kind: "trigger",
        event: "document_generation_begins",
        evidence: {
          requires: ["a document obligation with a defined type and required contents"],
          source: "authoritative",
        },
        next: "a.resolve",
      },
      {
        id: "a.resolve",
        kind: "action",
        does: "Resolve the required data from its authoritative sources, recording which source and which version each field came from. A document that cannot say where its contents came from cannot be defended when they are questioned, and they will be",
        writes: [{ field: "document_log", mode: "append" }],
        next: "a.populate",
      },
      {
        id: "a.populate",
        kind: "action",
        does: "Populate the draft from what was resolved, and from nothing else",
        writes: [{ field: "document_log", mode: "append" }],
        next: "a.validate",
      },
      {
        id: "a.validate",
        kind: "action",
        does: "Validate the required fields, the source versions, the party identities, the document type, the draft's internal consistency, and any required attachments or components",
        next: "c.complete",
      },
      {
        id: "c.complete",
        kind: "condition",
        asks: "Is the draft complete and valid?",
        branches: [
          {
            label: "Complete and valid",
            when: "every required element is present, sourced and consistent",
            to: "a.ready",
          },
          {
            label: "Something is missing or inconsistent",
            when: "a required field, source, party or component is absent or contradicts another",
            to: "a.blocked",
          },
        ],
      },
      {
        id: "a.blocked",
        kind: "action",
        does: "Record BLOCKED or MISSING_REQUIREMENT naming exactly what is absent. Missing data is never filled with a plausible value - a generated file carrying an invented field looks authoritative, reads as authoritative, and is not",
        writes: [{ field: "document_log", mode: "append" }],
        next: "w.data",
      },
      {
        id: "w.data",
        kind: "wait",
        until: [
          "the missing data becomes available",
          "the document requirement is withdrawn",
        ],
        onEvent: "c.data",
        timeout: {
          after: "the window the requiring process allows for the artifact",
          reason:
            "a draft waiting indefinitely on data nobody is supplying blocks the process that needed it, without anyone having decided to block it",
        },
        onTimeout: "h.review",
        windowExtendsOnEngagement: false,
      },
      {
        id: "c.data",
        kind: "condition",
        asks: "How did the wait resolve?",
        branches: [
          {
            label: "The data arrived",
            when: "what was missing is now available from an authoritative source",
            to: "a.populate",
          },
          {
            label: "Withdrawn",
            when: "the requirement no longer stands",
            to: "a.abandon",
          },
        ],
      },
      {
        id: "a.abandon",
        kind: "action",
        does: "Abandon the draft, preserving the record that it was started and why it stopped. Nothing was issued, so nothing about it is authoritative",
        writes: [{ field: "document_log", mode: "append" }],
        next: "x.abandoned",
      },
      {
        id: "x.abandoned",
        kind: "exit",
        state: "draft abandoned; nothing was issued",
        terminal: false,
        reEntry:
          "the requirement arising again starts its own draft. Repopulating this one would use the sources as they were rather than as they are",
      },
      {
        id: "h.review",
        kind: "handoff",
        to: "DEC-181",
        on: "a draft blocked past the window the process allows",
        carries: [
          "the document, the missing element and the source that should have supplied it",
          "the explicit fact that nothing was invented to complete it and nothing was issued",
        ],
      },
      {
        id: "a.ready",
        kind: "action",
        does: "Record READY_TO_ISSUE. A generated file is not a valid document - readiness is the validation having passed rather than the rendering having succeeded, and the two are routinely confused because both produce a file",
        writes: [{ field: "document_log", mode: "append" }],
        next: "h.issue",
      },
      {
        id: "h.issue",
        kind: "handoff",
        to: "DOC-213",
        on: "a validated draft ready for issuance",
        carries: [
          "the validated contents and the source version each field came from",
          "the explicit fact that the draft is still editable and nothing is yet authoritative",
        ],
      },
    ],
    guardrails: [
      "A generated file is not a valid document.",
      "Missing data is never silently invented.",
      "Source references and their versions remain traceable.",
    ],
    reusableRule:
      "A document becomes issuable only after its required contents have been populated from authoritative sources and validated for completeness.",
  },

  /* ------------------------------------------------------------ DOC-213 */
  {
    id: "DOC-213",
    slug: "document-issuance",
    category: "document",
    goal: "change-versioning",
    channels: [],
    name: "Ready document → issue → immutable issued version",
    purpose:
      "Freeze the artifact at a version that can be identified, referenced and never quietly changed.",
    entity: {
      scope: "the document and the specific version being issued",
      note: "This is the boundary between an editable draft and an authoritative record. After it, change means a successor.",
    },
    entry: "t.authorized",
    nodes: [
      {
        id: "t.authorized",
        kind: "trigger",
        event: "document_authorized_for_issuance",
        evidence: {
          requires: ["a validated draft with the authority to issue it established"],
          insufficientAlone: [
            "a draft being ready, which says the contents validate and nothing about whether anyone authorized issuing it",
          ],
          source: "authoritative",
        },
        next: "a.version",
      },
      {
        id: "a.version",
        kind: "action",
        does: "Create the issued version, capturing the document id, the version id, the issue time, the issuer, the parties, the content with its hash or reference, the source context it was built from, and the effective semantics where the document defines any",
        writes: [{ field: "document_log", mode: "append" }],
        next: "a.freeze",
      },
      {
        id: "a.freeze",
        kind: "action",
        does: "Freeze it. An issued version never changes - a document that can be edited after issue cannot answer what anybody was looking at when they agreed to it, and that is the only question it will ever be asked. Later changes create a successor rather than an edit",
        writes: [{ field: "document_log", mode: "append" }],
        next: "c.effective",
      },
      {
        id: "c.effective",
        kind: "condition",
        asks: "Do the document's own semantics make it effective on issue?",
        branches: [
          {
            label: "Not by itself",
            when: "effect depends on signature, a date, a condition or another dependency",
            to: "a.not-effective",
          },
          {
            label: "Effective on issue, by its own terms",
            when: "the document type takes effect at issuance without further conditions",
            to: "a.effective-note",
          },
        ],
      },
      {
        id: "a.not-effective",
        kind: "action",
        does: "Record ISSUED and nothing more. Issuance is the artifact existing in fixed, identifiable form - whether it has any effect is a separate question with its own conditions, and a contract can exist in final form and bind nobody",
        writes: [{ field: "document_log", mode: "append" }],
        next: "x.issued",
      },
      {
        id: "x.issued",
        kind: "exit",
        state: "ISSUED and immutable; effect not established",
        terminal: false,
        reEntry:
          "any later change creates a new version through the amendment lifecycle. This version is never reopened, edited or reissued under the same identifier",
      },
      {
        id: "a.effective-note",
        kind: "action",
        does: "Record the effective semantics exactly as the document states them, without inventing any. A document type that takes effect at issue says so; assuming it on behalf of one that does not brings terms into force early",
        writes: [{ field: "document_log", mode: "append" }],
        next: "h.effective",
      },
      {
        id: "h.effective",
        kind: "handoff",
        to: "DOC-216",
        on: "an issued document whose own terms make it effective without signature",
        carries: [
          "the issued version, its identifier and the semantics that make it effective",
          "the explicit fact that effectiveness is still validated rather than assumed from issuance",
        ],
      },
    ],
    guardrails: [
      "A draft is not an issued document.",
      "An issued document never silently changes.",
      "Issuance does not automatically make a document effective.",
    ],
    reusableRule:
      "Issuance freezes an auditable version of a document so later changes create new versions rather than rewriting what was previously issued.",
  },

  /* ------------------------------------------------------------ DOC-214 */
  {
    id: "DOC-214",
    slug: "document-distribution",
    category: "document",
    goal: "delivery-confirmation",
    channels: ["email"],
    name: "Document distribution → send or provide access → confirm or fail",
    purpose:
      "Get a specific issued version to the party who should have it, without either fact touching the other.",
    entity: {
      scope: "the issued version, the intended recipient, and the distribution of one to the other",
      note: "The distribution is bound to a version. Delivery state describes the distribution and never the document.",
    },
    entry: "t.requires",
    nodes: [
      {
        id: "t.requires",
        kind: "trigger",
        event: "issued_document_requires_distribution",
        evidence: {
          requires: ["an issued document version with a party who is to receive it"],
          source: "authoritative",
        },
        next: "a.recipient",
      },
      {
        id: "a.recipient",
        kind: "action",
        does: "Resolve the intended recipient and the route permitted for a document of this type. A document reaching the wrong party is worse than one not sent - the second can be retried and the first cannot be recalled",
        writes: [{ field: "document_log", mode: "append" }],
        next: "a.version",
      },
      {
        id: "a.version",
        kind: "action",
        does: "Bind the distribution to the exact issued version. Sending an outdated version is the failure this step exists to prevent: the recipient then holds, relies on, and may sign terms that nobody currently offers",
        writes: [{ field: "document_log", mode: "append" }],
        next: "a.distribute",
      },
      {
        id: "a.distribute",
        kind: "action",
        does: "Raise the actual delivery through the canonical communication mechanism, which owns channels, permissions, retries and delivery evidence. Document distribution does not build its own delivery path - a parallel one will disagree with the canonical delivery record about whether the contract was ever sent",
        writes: [{ field: "document_log", mode: "append" }],
        next: "w.distribution",
        execution: "communication",
      },
      {
        id: "w.distribution",
        kind: "wait",
        until: [
          "the distribution is confirmed to the level the requirement demands",
          "the distribution authoritatively fails",
        ],
        onEvent: "c.outcome",
        timeout: {
          after: "the distribution window the requirement allows",
          reason:
            "a distribution neither confirmed nor failed leaves nobody able to say whether the recipient has the document, which is the one thing distribution exists to establish",
        },
        onTimeout: "a.unknown",
        windowExtendsOnEngagement: false,
      },
      {
        id: "c.outcome",
        kind: "condition",
        asks: "How did the distribution resolve?",
        branches: [
          {
            label: "Confirmed",
            when: "delivery or availability is established to the level the requirement demands",
            to: "a.confirmed",
          },
          {
            label: "Failed",
            when: "the channel authoritatively reports it did not arrive",
            to: "h.recover",
          },
        ],
      },
      {
        id: "a.confirmed",
        kind: "action",
        does: "Record DELIVERED or AVAILABLE against the exact version distributed. Delivery state describes the distribution and never the document - an undelivered contract is a valid contract nobody has, and treating delivery as validity turns a mail failure into a legal one",
        writes: [{ field: "document_log", mode: "append" }],
        next: "x.distributed",
      },
      {
        id: "x.distributed",
        kind: "exit",
        state: "the identified version reached the intended recipient; the document's validity is unchanged by this",
        terminal: false,
        reEntry:
          "a superseding version requires its own distribution. Nothing about this one is retracted by that - the recipient was correctly given what was current then",
      },
      {
        id: "a.unknown",
        kind: "action",
        does: "Record the distribution outcome as unknown and do not treat it as delivered. The document's validity is untouched either way - what is unknown is whether anybody has it",
        writes: [{ field: "document_log", mode: "append" }],
        next: "h.reconcile",
      },
      {
        id: "h.reconcile",
        kind: "handoff",
        to: "external:external-status-reconciliation",
        on: "a distribution whose outcome could not be established",
        carries: [
          "the version, the recipient and everything last known about the delivery",
          "the explicit fact that the document remains valid and issued regardless of how this resolves",
        ],
      },
      {
        id: "h.recover",
        kind: "handoff",
        to: "CMS-208",
        on: "a failed document distribution",
        carries: [
          "the failure as the channel reported it, and the exact version that was being sent",
          "the explicit requirement that any fallback route carries the same version - a recovery that sends a different one is worse than the original failure",
        ],
      },
    ],
    guardrails: [
      "A document being issued is not the recipient having received it.",
      "Sending a wrong or outdated version is prevented by binding distribution to a version.",
      "Distribution reuses the canonical communication mechanics rather than duplicating them.",
    ],
    reusableRule:
      "Document distribution delivers a specific issued version to an intended recipient without changing the document's underlying validity or status.",
  },

  /* ------------------------------------------------------------ DOC-215 */
  {
    id: "DOC-215",
    slug: "signature-process",
    category: "document",
    goal: "eligibility-qualification",
    channels: ["email"],
    name: "Signature request → await signatures → signed, declined or expired",
    purpose:
      "Collect the required signatures against one exact version, and know when they are actually all there.",
    entity: {
      scope: "the document version, the signature process against it, and each required signer",
      note: "The process is bound to a version. Signatures do not carry to a successor - a changed document is a new request.",
    },
    distinctFrom: [
      {
        journey: "DEC-183",
        because:
          "DEC-183 is somebody exercising judgment against criteria. This is collecting authorized marks against a fixed artifact - nobody is deciding anything on the merits, and its failure modes are version binding, incomplete sets and expiry rather than authority to conclude.",
      },
    ],
    entry: "t.requires",
    nodes: [
      {
        id: "t.requires",
        kind: "trigger",
        event: "document_requires_signature",
        evidence: {
          requires: ["an issued or prepared document version requiring signature by identified parties"],
          source: "authoritative",
        },
        next: "a.define",
      },
      {
        id: "a.define",
        kind: "action",
        does: "Define the required signers, the signing authority each of them needs, the signing order where one applies, the scope of what is being signed, and the validity window where one is defined",
        writes: [{ field: "signature_log", mode: "append" }],
        next: "c.window",
      },
      {
        id: "c.window",
        kind: "condition",
        asks: "Is a signature validity window defined?",
        branches: [
          {
            label: "Defined",
            when: "the process or the document states how long the request stands",
            to: "a.bounded",
          },
          {
            label: "Not defined",
            when: "nothing states an expiry for the request",
            to: "a.unbounded",
          },
        ],
      },
      {
        id: "a.bounded",
        kind: "action",
        does: "Record the window as defined, so the request's own terms decide when it lapses",
        next: "a.request",
      },
      {
        id: "a.unbounded",
        kind: "action",
        does: "Record that no expiry was set rather than assigning one. An invented signature deadline voids a request nobody withdrew, and the signer discovers it at the moment their signature is refused",
        writes: [{ field: "signature_log", mode: "append" }],
        next: "a.request",
      },
      {
        id: "a.request",
        kind: "action",
        does: "Record AWAITING_SIGNATURE and issue the request to each required signer, bound to the exact document version. A signature request that does not name a version collects marks against nothing anybody can identify afterwards",
        writes: [{ field: "signature_log", mode: "append" }],
        next: "w.signatures",
        execution: "communication",
      },
      {
        id: "w.signatures",
        kind: "wait",
        until: [
          "a required signer signs",
          "a signer declines",
          "the document version is superseded",
        ],
        onEvent: "c.event",
        timeout: {
          after: "the validity window where one is defined, and the process's own review point where none is",
          reason:
            "a signature request open indefinitely leaves a process waiting on an agreement that will not arrive, with nobody having decided to abandon it",
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
            label: "A required signer signed the correct version",
            when: "the signature is against the version this process governs, by a signer with the required authority",
            to: "a.record-sig",
          },
          {
            label: "A signer declined",
            when: "a required signer refused",
            to: "a.declined",
          },
          {
            label: "The version was superseded",
            when: "the document this process is bound to is no longer the current one",
            to: "a.superseded",
          },
        ],
      },
      {
        id: "a.record-sig",
        kind: "action",
        does: "Record the signature evidence - who signed, when, which version, and under what authority. The version is part of the evidence rather than context around it",
        writes: [{ field: "signature_log", mode: "append" }],
        next: "c.complete",
      },
      {
        id: "c.complete",
        kind: "condition",
        asks: "Are all required signatures now complete?",
        branches: [
          {
            label: "All complete",
            when: "every required signer has signed the governed version",
            to: "a.fully-signed",
          },
          {
            label: "Some remain",
            when: "at least one required signature is outstanding",
            to: "w.signatures",
          },
        ],
      },
      {
        id: "a.fully-signed",
        kind: "action",
        does: "Record FULLY_SIGNED against this version. One signature is not a signed document when several are required, and a process that proceeds on the first one proceeds on an agreement that does not exist yet",
        writes: [{ field: "signature_log", mode: "append" }],
        next: "h.effective",
      },
      {
        id: "h.effective",
        kind: "handoff",
        to: "DOC-216",
        on: "a document with all required signatures complete",
        carries: [
          "every signature, with its signer, authority, time and the version it binds to",
          "the explicit fact that signed is not effective - what makes it take effect is a separate question with its own conditions",
        ],
      },
      {
        id: "a.declined",
        kind: "action",
        does: "Record DECLINED with the signer and the reason where one was given. A decline is a business outcome rather than a failure, and the process that required the document decides what follows from it",
        writes: [{ field: "signature_log", mode: "append" }],
        next: "h.declined",
      },
      {
        id: "h.declined",
        kind: "handoff",
        to: "external:operational-resolution",
        on: "a required signer declining",
        carries: [
          "who declined, when and on what grounds where stated",
          "the explicit fact that the document remains validly issued - what is absent is agreement rather than the artifact",
        ],
      },
      {
        id: "a.superseded",
        kind: "action",
        does: "End the signature process because the version it was against no longer stands, and suppress the outstanding requests. Signatures already collected are not carried to the successor - the successor is a different document, and signing it is a new request",
        writes: [
          { field: "signature_log", mode: "append" },
          { field: "suppressed_sends", mode: "append" },
        ],
        next: "x.superseded",
      },
      {
        id: "x.superseded",
        kind: "exit",
        state: "signature process ended; its version was superseded before completion",
        terminal: false,
        reEntry:
          "the successor version raises its own signature process. The signatures collected here remain evidence about the version they were made against",
      },
      {
        id: "a.expired",
        kind: "action",
        does: "Record SIGNATURE_EXPIRED. The request lapsed - nobody declined and nothing was decided, and reporting it as a refusal misstates what the signer did",
        writes: [{ field: "signature_log", mode: "append" }],
        next: "x.expired",
      },
      {
        id: "x.expired",
        kind: "exit",
        state: "SIGNATURE_EXPIRED; signatures collected so far remain evidence, the set is incomplete",
        terminal: false,
        reEntry:
          "a fresh request against the same version is a new process. Whether the partial signatures still count is governed by the document's own rules rather than assumed",
      },
    ],
    guardrails: [
      "A signature requested is not a signature made.",
      "One signature is not a fully signed document when several are required.",
      "A signature binds to the exact document version.",
      "A signature expiry is never invented.",
    ],
    reusableRule:
      "A signature process completes only when the required authorized parties have signed the exact document version governed by that process.",
  },

  /* ------------------------------------------------------------ DOC-216 */
  {
    id: "DOC-216",
    slug: "document-effectiveness",
    category: "document",
    goal: "progression-milestone",
    channels: [],
    name: "Signed document → validate completion → effective or pending condition",
    purpose:
      "Establish when a document actually starts doing something, which is not when it was signed.",
    entity: {
      scope: "the completed document version and the effect it is to have",
      note: "Effectiveness is the document's own state. What it then causes elsewhere is a different lifecycle with its own entity.",
    },
    distinctFrom: [
      {
        journey: "SUB-161",
        because:
          "SUB-161 makes a continuing relationship active. This makes a document effective, which may be what triggers that - but a document can be effective without creating a relationship, and a relationship can activate without any document.",
      },
    ],
    entry: "t.complete",
    nodes: [
      {
        id: "t.complete",
        kind: "trigger",
        event: "document_completion_established",
        evidence: {
          requires: [
            "all required signatures complete against one version, or an issued document whose own terms make it effective without signature",
          ],
          source: "authoritative",
        },
        next: "a.validate",
      },
      {
        id: "a.validate",
        kind: "action",
        does: "Validate that every required signature is present, that each is against the correct version, that each signer held the authority they signed under, which conditions apply, and what the effective date is",
        writes: [{ field: "document_log", mode: "append" }],
        next: "c.valid",
      },
      {
        id: "c.valid",
        kind: "condition",
        asks: "Does the completion hold up?",
        branches: [
          {
            label: "It holds",
            when: "signatures, versions and authorities all check out",
            to: "c.timing",
          },
          {
            label: "It does not",
            when: "a signature is against the wrong version, or a signer lacked the authority",
            to: "a.invalid",
          },
        ],
      },
      {
        id: "a.invalid",
        kind: "action",
        does: "Record the completion as not established, naming exactly what fails. A document that looks signed and is not is the most dangerous state in this category, because everything downstream will treat it as agreement",
        writes: [{ field: "document_log", mode: "append" }],
        next: "h.reconcile",
      },
      {
        id: "h.reconcile",
        kind: "handoff",
        to: "DOC-220",
        on: "signatures that do not bind to the version they are held against",
        carries: [
          "the signatures, the versions each was made against, and the version claimed as current",
          "the explicit fact that nothing has been made effective and nothing was corrected by overwriting",
        ],
      },
      {
        id: "c.timing",
        kind: "condition",
        asks: "What governs when this takes effect?",
        branches: [
          {
            label: "Effective on valid signature",
            when: "the document's terms make completion sufficient",
            to: "a.effective",
          },
          {
            label: "A future effective date",
            when: "the document names a date after completion",
            to: "a.pending-date",
          },
          {
            label: "A further dependency",
            when: "effect waits on a condition, an approval or an external event",
            to: "a.pending-condition",
          },
          {
            label: "The rules do not define effectiveness",
            when: "nothing states when or whether this document takes effect",
            to: "h.review",
          },
        ],
      },
      {
        id: "h.review",
        kind: "handoff",
        to: "DEC-181",
        on: "a completed document with no defined effectiveness rules",
        carries: [
          "the document, its signatures and what its terms do and do not say",
          "the explicit fact that no legal or business effectiveness was invented - assuming it starts obligations nobody agreed to start",
        ],
      },
      {
        id: "a.pending-date",
        kind: "action",
        does: "Record PENDING_EFFECTIVE_DATE. The document is complete and does nothing yet, which is a real state and not an incomplete one",
        writes: [{ field: "document_log", mode: "append" }],
        next: "w.effective",
      },
      {
        id: "w.effective",
        kind: "wait",
        until: ["the document is superseded or revoked before its date"],
        onEvent: "a.void",
        timeout: {
          after: "the effective date",
          reason:
            "reaching the effective date is what this wait exists for. It is the normal outcome, and the point at which the document's current standing is checked again",
        },
        onTimeout: "a.revalidate",
        windowExtendsOnEngagement: false,
      },
      {
        id: "a.pending-condition",
        kind: "action",
        does: "Record PENDING_CONDITION, naming the dependency. A document waiting on an unstated condition is indistinguishable from one that is simply stuck",
        writes: [{ field: "document_log", mode: "append" }],
        next: "w.condition",
      },
      {
        id: "w.condition",
        kind: "wait",
        until: [
          "the dependency is satisfied",
          "the dependency becomes unsatisfiable",
        ],
        onEvent: "c.condition",
        timeout: {
          after: "the window the document or its process allows for the condition",
          reason:
            "a signed document waiting forever on a condition that will not arrive is an agreement in limbo, and both parties are entitled to know which it is",
        },
        onTimeout: "a.lapsed",
        windowExtendsOnEngagement: false,
      },
      {
        id: "c.condition",
        kind: "condition",
        asks: "How did the dependency resolve?",
        branches: [
          {
            label: "Satisfied",
            when: "the condition governing effect is met",
            to: "a.revalidate",
          },
          {
            label: "Unsatisfiable",
            when: "the condition cannot now be met",
            to: "a.lapsed",
          },
        ],
      },
      {
        id: "a.revalidate",
        kind: "action",
        does: "Re-read the document's current standing at the effective moment - is this still the authoritative version, has it been superseded or revoked, do the parties still stand. A stale signed version activating a newer business state is exactly the failure the version binding exists to prevent",
        next: "c.still",
      },
      {
        id: "c.still",
        kind: "condition",
        asks: "Does the document still stand at its effective moment?",
        branches: [
          {
            label: "Still authoritative",
            when: "this version is current, unsuperseded and unrevoked",
            to: "a.effective",
          },
          {
            label: "Superseded or revoked",
            when: "something replaced or withdrew it before it took effect",
            to: "a.void",
          },
        ],
      },
      {
        id: "a.void",
        kind: "action",
        does: "Record that the document did not take effect, because it was superseded or revoked first. It remains a validly issued and validly signed record of what was agreed - it simply never became operative",
        writes: [{ field: "document_log", mode: "append" }],
        next: "x.not-effective",
      },
      {
        id: "a.lapsed",
        kind: "action",
        does: "Record the condition as unsatisfiable and the document as never effective, naming which dependency failed",
        writes: [{ field: "document_log", mode: "append" }],
        next: "x.not-effective",
      },
      {
        id: "x.not-effective",
        kind: "exit",
        state: "complete and never effective; the signed record stands as history",
        terminal: false,
        reEntry:
          "a successor document runs its own effectiveness. Nothing here is deleted - a signed agreement that never came into force is still evidence of what the parties agreed to",
      },
      {
        id: "a.effective",
        kind: "action",
        does: "Record EFFECTIVE with the version, the moment, and what made it so. This is the document's own state - what it then causes elsewhere is a different lifecycle and is not implied by this",
        writes: [{ field: "document_log", mode: "append" }],
        next: "c.downstream",
      },
      {
        id: "c.downstream",
        kind: "condition",
        asks: "Does this document taking effect create or change a business state elsewhere?",
        branches: [
          {
            label: "It does",
            when: "a relationship, an entitlement, an obligation or an authorization begins from it",
            to: "h.downstream",
          },
          {
            label: "It does not",
            when: "the document's effect is entirely a matter of the record itself",
            to: "x.effective",
          },
        ],
      },
      {
        id: "h.downstream",
        kind: "handoff",
        to: "external:operational-resolution",
        on: "an effective document that starts something elsewhere",
        carries: [
          "the effective version, its moment and its scope",
          "the explicit fact that the receiving lifecycle activates on its own conditions - the contract is not the relationship, and a document being effective is evidence rather than activation",
        ],
      },
      {
        id: "x.effective",
        kind: "exit",
        state: "EFFECTIVE; the document is in force from the recorded moment",
        terminal: false,
        reEntry:
          "expiry, revocation or supersession each end future reliance on it through their own lifecycles, and none of them changes that it was effective while it was",
      },
    ],
    guardrails: [
      "Signed is not automatically effective.",
      "Legal or business effectiveness rules are never invented.",
      "A stale or superseded signed version never activates newer business state.",
      "Effectiveness is revalidated at the effective moment rather than assumed from completion.",
    ],
    reusableRule:
      "Signing establishes documented agreement or authorization; effectiveness begins only when the conditions governing that document's effect are satisfied.",
  },

  /* ------------------------------------------------------------ DOC-217 */
  {
    id: "DOC-217",
    slug: "document-amendment",
    category: "document",
    goal: "change-versioning",
    channels: [],
    name: "Document change → new version or amendment → supersede prospectively",
    purpose:
      "Change an issued artifact by creating a successor, leaving what it replaces exactly as it was.",
    entity: {
      scope: "the document lineage and the successor version or amendment being created",
      note: "Lineage is the entity. A version without a recorded base and authority is an unrelated file that happens to share a name.",
    },
    entry: "t.change",
    nodes: [
      {
        id: "t.change",
        kind: "trigger",
        event: "authorized_document_change_required",
        evidence: {
          requires: ["an authorized need to change an issued document, with the authority established"],
          insufficientAlone: [
            "an error being noticed, which identifies a need rather than authorizing a change",
          ],
          source: "authoritative",
        },
        next: "a.identify",
      },
      {
        id: "a.identify",
        kind: "action",
        does: "Identify the base version, the changed scope, the authority for the change, its effective semantics and the parties it affects",
        writes: [{ field: "document_log", mode: "append" }],
        next: "c.form",
      },
      {
        id: "c.form",
        kind: "condition",
        asks: "What form does the successor take?",
        branches: [
          {
            label: "A new version",
            when: "the document is reissued in full with the change incorporated",
            to: "a.new-version",
          },
          {
            label: "An amendment",
            when: "a separate instrument modifies the base while leaving it standing",
            to: "a.amendment",
          },
        ],
      },
      {
        id: "a.new-version",
        kind: "action",
        does: "Create the successor as a new draft version, carrying the base forward with the change incorporated. The base version is not touched",
        writes: [{ field: "document_log", mode: "append" }],
        next: "a.lineage",
      },
      {
        id: "a.amendment",
        kind: "action",
        does: "Create an amendment that references the base version rather than restating it. What changed stays legible as a change, which a full reissue makes somebody diff two documents to discover",
        writes: [{ field: "document_log", mode: "append" }],
        next: "a.lineage",
      },
      {
        id: "a.lineage",
        kind: "action",
        does: "Record the lineage - this successor, its base, the authority and what changed. Lineage is what makes a document history readable; without it a chain of versions is a set of unrelated files with similar names and nobody can say which one anybody signed",
        writes: [{ field: "document_log", mode: "append" }],
        next: "w.approval",
      },
      {
        id: "w.approval",
        kind: "wait",
        until: [
          "the successor completes its own validation, approval and signature requirements",
          "the change is abandoned",
        ],
        onEvent: "c.outcome",
        timeout: {
          after: "the window the change process allows",
          reason:
            "a successor stuck in progress leaves two versions in play and no clear answer about which governs, which is the exact ambiguity the lineage exists to prevent",
        },
        onTimeout: "a.abandoned",
        windowExtendsOnEngagement: false,
      },
      {
        id: "c.outcome",
        kind: "condition",
        asks: "Did the successor become authoritative?",
        branches: [
          {
            label: "It did",
            when: "the successor completed validation, approval and any required signatures",
            to: "a.supersede",
          },
          {
            label: "Abandoned",
            when: "the change was withdrawn or could not complete",
            to: "a.abandoned",
          },
        ],
      },
      {
        id: "a.abandoned",
        kind: "action",
        does: "Record the change as abandoned. The base version stands unchanged and unmarked - a superseded flag set in anticipation of a successor that never arrived leaves the current document looking obsolete",
        writes: [{ field: "document_log", mode: "append" }],
        next: "x.unchanged",
      },
      {
        id: "x.unchanged",
        kind: "exit",
        state: "change abandoned; the base version remains current and unmarked",
        terminal: false,
        reEntry:
          "the change can be attempted again as a new successor against whatever version is current then",
      },
      {
        id: "a.supersede",
        kind: "action",
        does: "Mark the prior version SUPERSEDED for applicable future use. Superseded is not deleted and not historically invalid - the prior version governed everything that happened while it was current, and that stays true regardless of what replaced it",
        writes: [{ field: "document_log", mode: "append" }],
        next: "c.timing",
      },
      {
        id: "c.timing",
        kind: "condition",
        asks: "When do the successor's terms apply?",
        branches: [
          {
            label: "From its own effective conditions",
            when: "the successor states when it takes effect",
            to: "a.prospective",
          },
          {
            label: "The effective semantics are not defined",
            when: "nothing states when the new terms begin",
            to: "h.review",
          },
        ],
      },
      {
        id: "a.prospective",
        kind: "action",
        does: "Apply the new terms only from the successor's own effective conditions. Applying them before it is effective enforces terms nobody has agreed to yet, and applying them backwards makes a compliant history retroactively non-compliant",
        writes: [{ field: "document_log", mode: "append" }],
        next: "x.superseded",
      },
      {
        id: "x.superseded",
        kind: "exit",
        state: "successor authoritative going forward; the prior version preserved and superseded",
        terminal: false,
        reEntry:
          "a further change creates its own successor against this one, extending the lineage rather than replacing it",
      },
      {
        id: "h.review",
        kind: "handoff",
        to: "DEC-181",
        on: "a successor with undefined effective semantics",
        carries: [
          "the base, the successor and what the change does and does not state",
          "the explicit fact that no effective date was assumed, so neither version has been made to govern anything it may not",
        ],
      },
    ],
    guardrails: [
      "A new version does not delete the old version.",
      "Superseded is not historically invalid.",
      "New terms are never applied before the successor's required effective conditions.",
      "Lineage between base and successor is recorded rather than implied.",
    ],
    reusableRule:
      "Document changes create a traceable successor version whose authority begins according to its own approval and effective conditions.",
  },

  /* ------------------------------------------------------------ DOC-218 */
  {
    id: "DOC-218",
    slug: "document-expiry",
    category: "document",
    goal: "expiry-renewal",
    channels: [],
    name: "Document expiry → revalidate requirement → renew, replace or close",
    purpose:
      "End future reliance on a time-limited artifact, and stop only what genuinely needs it to be current.",
    entity: {
      scope: "the time-limited document and the processes depending on its current validity",
      note: "What expires is future reliance. Everything done while it was valid was done while it was valid.",
    },
    distinctFrom: [
      {
        journey: "DOC-219",
        because:
          "Expiry is time running out on terms the document itself set. Revocation is an authority withdrawing it. Nobody decided the first, somebody decided the second, and they carry different consequences for what was relied on meanwhile.",
      },
    ],
    entry: "t.expiry",
    nodes: [
      {
        id: "t.expiry",
        kind: "trigger",
        event: "document_validity_reaches_expiry",
        evidence: {
          requires: ["a time-limited document approaching or reaching its defined expiry"],
          source: "authoritative",
        },
        next: "c.defined",
      },
      {
        id: "c.defined",
        kind: "condition",
        asks: "Is the expiry defined by the document or its governing rules?",
        branches: [
          {
            label: "Defined",
            when: "the document or a rule states when its validity ends",
            to: "a.dependents",
          },
          {
            label: "Not defined",
            when: "no expiry was ever set for this artifact",
            to: "a.no-expiry",
          },
        ],
      },
      {
        id: "a.no-expiry",
        kind: "action",
        does: "Record that this document carries no expiry, rather than assigning one. Inventing an expiry invalidates something nobody invalidated, and dependent processes then start failing for a reason that does not exist anywhere in the rules",
        writes: [{ field: "document_log", mode: "append" }],
        next: "x.no-expiry",
      },
      {
        id: "x.no-expiry",
        kind: "exit",
        state: "no expiry defined; the document remains valid until something else ends it",
        terminal: false,
        reEntry:
          "an authority withdrawing it runs through revocation, and a successor replacing it runs through amendment. Neither is expiry",
      },
      {
        id: "a.dependents",
        kind: "action",
        does: "Determine the active and future processes that depend on this document's current validity. What expires is future reliance - nothing that happened while it was valid changes, and the list is of what needs it now rather than of what ever used it",
        writes: [{ field: "document_log", mode: "append" }],
        next: "a.expire",
      },
      {
        id: "a.expire",
        kind: "action",
        does: "Record EXPIRED. Expired is not revoked: nobody withdrew it, its time ran out, and everything it authorized while valid remains authorized",
        writes: [{ field: "document_log", mode: "append" }],
        next: "c.replacement",
      },
      {
        id: "c.replacement",
        kind: "condition",
        asks: "Do the governing rules require a replacement or renewal?",
        branches: [
          {
            label: "They require one",
            when: "a current artifact must exist for the process to continue",
            to: "a.require-new",
          },
          {
            label: "They do not",
            when: "no replacement is mandated by the rules",
            to: "c.continue",
          },
        ],
      },
      {
        id: "a.require-new",
        kind: "action",
        does: "Raise a new document requirement, linked to the expired artifact so the successor's purpose is traceable to what it replaces",
        writes: [{ field: "document_log", mode: "append" }],
        next: "h.new",
      },
      {
        id: "h.new",
        kind: "handoff",
        to: "DOC-211",
        on: "an expired document the rules require to be replaced",
        carries: [
          "the expired artifact, its type, scope and parties",
          "the explicit fact that the expired document remains a valid historical record of the period it covered",
        ],
      },
      {
        id: "c.continue",
        kind: "condition",
        asks: "May the dependent processes continue after expiry?",
        branches: [
          {
            label: "They may",
            when: "the governing rules permit them to run on without a current artifact",
            to: "a.continue",
          },
          {
            label: "Future actions require current validity",
            when: "specific future actions need a valid document and the rest do not",
            to: "a.block-future",
          },
          {
            label: "The rules do not say",
            when: "nothing states what the dependent processes do after expiry",
            to: "h.review",
          },
        ],
      },
      {
        id: "a.continue",
        kind: "action",
        does: "Leave the dependent processes running under the rules that permit it, recording that the artifact expired and that they continue by rule rather than by oversight",
        writes: [{ field: "document_log", mode: "append" }],
        next: "x.expired-continuing",
      },
      {
        id: "x.expired-continuing",
        kind: "exit",
        state: "EXPIRED; dependent processes continue under rules that permit it",
        terminal: false,
        reEntry:
          "a future action that does require current validity is blocked at its own point rather than by pre-emptively stopping everything",
      },
      {
        id: "a.block-future",
        kind: "action",
        does: "Block only the future actions that require a currently valid document. Everything not requiring current validity continues - one expired certificate stopping an entire relationship is a suspension nobody decided and nobody can find the authority for",
        writes: [{ field: "document_log", mode: "append" }],
        next: "x.expired-blocking",
      },
      {
        id: "x.expired-blocking",
        kind: "exit",
        state: "EXPIRED; only the actions requiring current validity are blocked",
        terminal: false,
        reEntry:
          "a replacement artifact releases the blocked actions. Actions performed while the document was valid remain historical facts",
      },
      {
        id: "h.review",
        kind: "handoff",
        to: "DEC-181",
        on: "an expired document whose effect on dependent processes the rules do not define",
        carries: [
          "the expired artifact and every process depending on it",
          "the explicit fact that no blocking or continuation was assumed - guessing either stops work nobody stopped or continues work nobody authorized",
        ],
      },
    ],
    guardrails: [
      "Expired is not revoked.",
      "Expiration dates are never invented.",
      "Actions performed while the document was valid remain historical facts.",
      "Only processes requiring current validity are affected.",
    ],
    reusableRule:
      "Document expiry ends future reliance on a time-limited artifact according to its governing rules without rewriting actions completed while it was valid.",
  },

  /* ------------------------------------------------------------ DOC-219 */
  {
    id: "DOC-219",
    slug: "document-revocation",
    category: "document",
    goal: "access-entitlement-change",
    channels: [],
    name: "Document revocation or withdrawal → stop future reliance → reconcile",
    purpose:
      "Withdraw an artifact by an authority's decision, exactly as far as that decision reaches.",
    entity: {
      scope: "the revoked document version and the revocation acting on it",
      note: "The revocation has its own effective scope. Applying it more widely withdraws things the authority did not withdraw.",
    },
    distinctFrom: [
      {
        journey: "DOC-217",
        because:
          "An amendment replaces a document with a successor that carries the same purpose forward. Revocation withdraws it with nothing behind it - there may be no successor, and the reason is a decision rather than a change of terms.",
      },
    ],
    entry: "t.revoked",
    nodes: [
      {
        id: "t.revoked",
        kind: "trigger",
        event: "authoritative_revocation_occurs",
        evidence: {
          requires: ["a revocation or withdrawal by an authority entitled to make it"],
          insufficientAlone: [
            "a document expiring, which is time rather than a decision",
            "a successor being issued, which supersedes rather than revokes",
          ],
          source: "authoritative",
        },
        next: "a.record",
      },
      {
        id: "a.record",
        kind: "action",
        does: "Record the revoked version, the authority, the reason and its category, the revocation time, and the revocation's own effective semantics",
        writes: [{ field: "document_log", mode: "append" }],
        next: "a.state",
      },
      {
        id: "a.state",
        kind: "action",
        does: "Record REVOKED, preserving the document and everything about it. A revoked document's history stays available - it is the evidence for everything done while it stood, and deleting it destroys the explanation for actions that were entirely correct at the time",
        writes: [{ field: "document_log", mode: "append" }],
        next: "a.dependents",
      },
      {
        id: "a.dependents",
        kind: "action",
        does: "Identify the pending and future processes relying on this document",
        writes: [{ field: "document_log", mode: "append" }],
        next: "c.future",
      },
      {
        id: "c.future",
        kind: "condition",
        asks: "What does the revocation's effective scope permit going forward?",
        branches: [
          {
            label: "No future reliance at all",
            when: "the revocation withdraws the document entirely from here on",
            to: "a.block",
          },
          {
            label: "Limited scope, some reliance continues",
            when: "the revocation names a scope narrower than the whole document",
            to: "a.scoped",
          },
        ],
      },
      {
        id: "a.block",
        kind: "action",
        does: "Block or revalidate the affected processes, which now have no valid artifact behind them",
        writes: [{ field: "document_log", mode: "append" }],
        next: "c.completed",
      },
      {
        id: "a.scoped",
        kind: "action",
        does: "Apply exactly the scope the revocation names, and nothing wider. A revocation applied more broadly than its own terms withdraws things the authority did not withdraw, and there is no record of who decided that because nobody did",
        writes: [{ field: "document_log", mode: "append" }],
        next: "c.completed",
      },
      {
        id: "c.completed",
        kind: "condition",
        asks: "What does the revocation say about actions already completed?",
        branches: [
          {
            label: "It explicitly reaches them",
            when: "the revocation states a retroactive consequence and the authority for it",
            to: "a.retro",
          },
          {
            label: "It says nothing about them",
            when: "the revocation addresses future reliance only",
            to: "a.no-retro",
          },
        ],
      },
      {
        id: "a.retro",
        kind: "action",
        does: "Apply the retroactive consequence the revocation actually states, recording the authority for it. What is applied is what was stated - a revocation that reaches backwards has to say so, and how far",
        writes: [{ field: "document_log", mode: "append" }],
        next: "c.replacement",
      },
      {
        id: "a.no-retro",
        kind: "action",
        does: "Leave completed actions as they stand. Retroactive invalidity is not inferred - assuming it turns every past action taken under a now-revoked certificate into a problem nobody has decided is a problem, and unwinding them is far harder than not unwinding them",
        writes: [{ field: "document_log", mode: "append" }],
        next: "c.replacement",
      },
      {
        id: "c.replacement",
        kind: "condition",
        asks: "Is a replacement artifact required?",
        branches: [
          {
            label: "One is required",
            when: "the processes that relied on this still need a valid artifact",
            to: "h.new",
          },
          {
            label: "None",
            when: "nothing further requires an artifact of this kind",
            to: "x.revoked",
          },
        ],
      },
      {
        id: "h.new",
        kind: "handoff",
        to: "DOC-211",
        on: "a revoked document that still needs replacing",
        carries: [
          "the revoked artifact, its scope and the reason it was withdrawn",
          "the explicit fact that the replacement is a new artifact rather than a reissue of the revoked one",
        ],
      },
      {
        id: "x.revoked",
        kind: "exit",
        state: "REVOKED; future reliance stopped within the revocation's scope, history preserved",
        terminal: false,
        reEntry:
          "the revocation being itself withdrawn or narrowed is a further authoritative act, recorded on top rather than by clearing this one",
      },
    ],
    guardrails: [
      "Revoked is not expired.",
      "A revoked document's history remains available and auditable.",
      "Retroactive consequences are never inferred without explicit authority.",
      "The revocation applies exactly its own stated scope.",
    ],
    reusableRule:
      "Revocation stops reliance on a document according to the revocation's effective scope while preserving the historical record of the artifact and prior actions.",
  },

  /* ------------------------------------------------------------ DOC-220 */
  {
    id: "DOC-220",
    slug: "document-conflict",
    category: "document",
    goal: "reconciliation-correction",
    channels: ["email"],
    name: "Document or record conflict → determine authoritative version → reconcile",
    purpose:
      "Work out which version actually governs, and explain the conflict rather than deleting it.",
    entity: {
      scope: "the document lineage and every conflicting record claiming to be part of it",
      note: "Every conflicting record is evidence. Deleting one to tidy the state removes the proof of what anybody relied on.",
    },
    distinctFrom: [
      {
        journey: "INT-118",
        because:
          "A generic sync conflict asks which record is newer. This asks which version is authoritative, which turns on issuance authority, lineage and effective semantics - and it must additionally establish which version each signature actually binds to, a question recency cannot answer.",
      },
    ],
    entry: "t.inconsistency",
    nodes: [
      {
        id: "t.inconsistency",
        kind: "trigger",
        event: "document_version_inconsistency_detected",
        evidence: {
          requires: [
            "a material inconsistency - different content under one identifier, an incorrect version distributed, a signature attached to the wrong version, a local copy differing from the authoritative record, several versions claiming current status, or a missing amendment link",
          ],
          source: "authoritative",
        },
        next: "a.collect",
      },
      {
        id: "a.collect",
        kind: "action",
        does: "Collect the document ids, the version ids, the content with its hashes or references, the issuance times, the signature evidence, the effective dates, the lineage, and the authority or source behind each record",
        writes: [{ field: "document_log", mode: "append" }],
        next: "c.identifiable",
      },
      {
        id: "c.identifiable",
        kind: "condition",
        asks: "Is the authoritative version deterministically identifiable?",
        branches: [
          {
            label: "It is",
            when: "lineage, issuance authority and effective semantics together single out one version",
            to: "a.authoritative",
          },
          {
            label: "It is not",
            when: "two or more versions have equal claim, or the lineage is broken",
            to: "a.cannot",
          },
        ],
      },
      {
        id: "a.cannot",
        kind: "action",
        does: "Record DOCUMENT_RECONCILIATION_REQUIRED and change nothing. The newest file is not automatically the authoritative version - recency is a property of a filesystem and authority is a property of an issuance, and picking the newer one is how a superseded draft becomes the contract",
        writes: [{ field: "document_log", mode: "append" }],
        next: "h.review",
      },
      {
        id: "h.review",
        kind: "handoff",
        to: "DEC-181",
        on: "a conflict where the authoritative version cannot be safely determined",
        carries: [
          "every conflicting record with its hash, issuance, signatures, effective dates and lineage",
          "the explicit fact that nothing was deleted, corrected or promoted - the conflict is preserved intact for the decision",
        ],
      },
      {
        id: "a.authoritative",
        kind: "action",
        does: "Record which version is authoritative and why, preserving every conflicting record alongside it. Conflicting evidence is not deleted to tidy the state - it is the only proof the conflict happened, and the only way to work out afterwards what anybody actually relied on",
        writes: [{ field: "document_log", mode: "append" }],
        next: "c.signature",
      },
      {
        id: "c.signature",
        kind: "condition",
        asks: "Is any signature bound to a version other than the authoritative one?",
        branches: [
          {
            label: "One or more are",
            when: "a signature was made against a version that is not authoritative",
            to: "a.sig-invalid",
          },
          {
            label: "All bind correctly",
            when: "every signature is against the authoritative version",
            to: "c.acted",
          },
        ],
      },
      {
        id: "a.sig-invalid",
        kind: "action",
        does: "Record that the signature does not bind to the authoritative version, without discarding the signature. It is valid evidence for the version it was made against and for no other, however similar the content of the two looks",
        writes: [{ field: "signature_log", mode: "append" }],
        next: "h.resign",
      },
      {
        id: "h.resign",
        kind: "handoff",
        to: "DOC-215",
        on: "signatures that bind to a version other than the authoritative one",
        carries: [
          "the authoritative version and which signatures are missing against it",
          "the explicit fact that the existing signatures stand as evidence about their own versions and are not transferred",
        ],
      },
      {
        id: "c.acted",
        kind: "condition",
        asks: "Was a non-authoritative version distributed or acted upon?",
        branches: [
          {
            label: "Distributed, not acted upon",
            when: "a recipient holds the wrong version and has done nothing on it",
            to: "a.correct-distribution",
          },
          {
            label: "Already used for a business action",
            when: "something was decided, paid, granted or performed on the wrong version",
            to: "a.preserve-history",
          },
          {
            label: "Neither",
            when: "the conflict was internal and nothing left the system",
            to: "x.reconciled",
          },
        ],
      },
      {
        id: "a.correct-distribution",
        kind: "action",
        does: "Redistribute the authoritative version, saying explicitly what changed and which version it replaces. A silent correction leaves the recipient holding two documents and no idea which one counts, which is worse than the original error",
        writes: [{ field: "document_log", mode: "append" }],
        next: "x.reconciled",
        execution: "communication",
      },
      {
        id: "a.preserve-history",
        kind: "action",
        does: "Preserve what was done and under which version it was done. The action happened - what to do about it is a separate question with its own authority, and rewriting the record to show the right version leaves an effect with no cause",
        writes: [{ field: "document_log", mode: "append" }],
        next: "h.remedy",
      },
      {
        id: "h.remedy",
        kind: "handoff",
        to: "REM-157",
        on: "a business action taken on a non-authoritative document version",
        carries: [
          "what was done, under which version, and what the authoritative version says instead",
          "the explicit fact that the history is preserved intact - the remedy addresses the consequence rather than the record",
        ],
      },
      {
        id: "x.reconciled",
        kind: "exit",
        state: "authoritative version established; conflicting records preserved and explained",
        terminal: false,
        reEntry:
          "a further inconsistency in this lineage is assessed with this reconciliation as part of its evidence, which is why none of it was deleted",
      },
    ],
    guardrails: [
      "The newest file is not automatically the authoritative version.",
      "Conflicting evidence is never deleted to fix the state.",
      "Signature validity is checked against the exact version.",
      "Reconciliation preserves lineage and prior use.",
    ],
    reusableRule:
      "Document reconciliation restores a single authoritative version lineage by explaining conflicts rather than overwriting or deleting inconvenient historical records.",
  },
  {
    id: "DOC-286",
    slug: "document-effective-notice",
    category: "document",
    goal: "progression-milestone",
    channels: ["email", "in-app"],
    name: "Document effective → entitlement active → first use or dormant",
    purpose:
      "Tell the holder that what they signed has actually started, and what it now lets them do, at the moment it becomes true rather than the moment they signed.",
    entity: {
      scope: "the effective document version and the entitlement it confers on its holder",
      note: "One effective version, one instance. A renewal or a superseding version taking effect is its own instance and inherits nothing from this one.",
    },
    distinctFrom: [
      {
        journey: "DOC-216",
        because:
          "DOC-216 establishes whether and when the document takes effect and revalidates it at that moment. This journey starts only once that record exists, and it decides nothing about effectiveness itself.",
      },
      {
        journey: "ACC-263",
        because:
          "ACC-263 runs a claim window on a granted capability that lapses if unused. Here nothing lapses for want of use - the document is in force either way, and dormancy is an observation rather than a loss.",
      },
    ],
    entry: "t.effective",
    nodes: [
      {
        id: "t.effective",
        kind: "trigger",
        event: "document_recorded_effective",
        evidence: {
          requires: [
            "an authoritative record that this version is in force, revalidated at its effective moment",
            "the entitlement it confers, expressed as something the holder can act on",
            "a named holder with a permitted route to them",
          ],
          insufficientAlone: [
            "a complete set of signatures",
            "a scheduled effective date that has not been revalidated",
            "a condition that has not yet resolved",
          ],
          source: "authoritative",
        },
        next: "c.usable",
      },
      {
        id: "c.usable",
        kind: "condition",
        asks: "Is this entitlement exercised, or held?",
        branches: [
          {
            label: "Exercised",
            when: "the entitlement is taken up by an action the holder performs - a claim, a booking, an access, a draw-down",
            to: "a.in-force-actionable",
          },
          {
            label: "Held",
            when: "the entitlement is a standing protection or permission with nothing to do unless something happens",
            to: "a.in-force-standing",
          },
        ],
      },
      {
        id: "a.in-force-actionable",
        kind: "action",
        does: "Say the document is in force, from when, and name the single first thing the entitlement now lets them do. The gap between signing and taking effect is where holders quietly conclude that nothing happened",
        next: "w.first-use",
        execution: "communication",
      },
      {
        id: "a.in-force-standing",
        kind: "action",
        does: "Say the document is in force and what it covers, and name the moment at which it would matter rather than an action to take now. An entitlement that only applies when something goes wrong is otherwise read as inactive until it is needed",
        next: "x.standing",
        execution: "communication",
      },
      {
        id: "x.standing",
        kind: "exit",
        state: "in force, nothing for the holder to exercise",
        terminal: false,
        reEntry: "a superseding version, or a change that gives the entitlement something to exercise, is a new instance",
      },
      {
        id: "w.first-use",
        kind: "wait",
        until: [
          "the entitlement is exercised for the first time",
          "the document is superseded or revoked",
          "the effective period ends",
        ],
        onEvent: "c.what-happened",
        timeout: {
          after: "the period within which a holder of this entitlement would ordinarily have used it",
          reason: "in force and never used is a different fact from in force and working, and reporting the two together hides the one that needs attention",
        },
        onTimeout: "c.still-in-force",
        windowExtendsOnEngagement: false,
      },
      {
        id: "c.what-happened",
        kind: "condition",
        asks: "What ended the wait?",
        branches: [
          {
            label: "Exercised",
            when: "an authoritative first exercise of the entitlement was recorded",
            to: "x.used",
          },
          {
            label: "Ended first",
            when: "the document was superseded, revoked or ran out before any use",
            to: "x.moot",
          },
        ],
      },
      {
        id: "x.used",
        kind: "exit",
        state: "entitlement exercised",
        terminal: false,
        reEntry: "a further document taking effect for the same holder is its own instance",
      },
      {
        id: "x.moot",
        kind: "exit",
        state: "in force and ended without ever being used",
        terminal: false,
        reEntry: "a superseding version taking effect starts its own instance",
      },
      {
        id: "c.still-in-force",
        kind: "condition",
        asks: "Does the document still stand?",
        branches: [
          {
            label: "Still in force",
            when: "this remains the authoritative version and its effective period has not ended",
            to: "a.reminder",
          },
          {
            label: "No longer in force",
            when: "the document has been superseded, revoked or has run out",
            to: "x.moot",
          },
        ],
      },
      {
        id: "a.reminder",
        kind: "action",
        does: "Send one reminder naming what is in force and the same single first action, not a second explanation of the document. There is no further reminder - the entitlement stands whether or not it is used, and chasing it turns a benefit into a demand",
        next: "w.dormancy",
        execution: "communication",
      },
      {
        id: "w.dormancy",
        kind: "wait",
        until: [
          "the entitlement is exercised for the first time",
        ],
        onEvent: "x.used",
        timeout: {
          after: "the remainder of the effective period",
          reason: "dormancy has to be recorded while the entitlement is still live, or it cannot be told apart from expiry",
        },
        onTimeout: "x.dormant",
        windowExtendsOnEngagement: false,
      },
      {
        id: "x.dormant",
        kind: "exit",
        state: "in force and dormant",
        terminal: false,
        reEntry: "a renewal or a superseding version taking effect starts a new instance",
      },
    ],
    guardrails: [
      "Signed is not effective, and only the effective record starts this.",
      "The entitlement is named as what the holder can do, never as what the document says.",
      "An entitlement with nothing to exercise is never chased for use.",
      "One reminder, never two. The entitlement stands whether or not anybody takes it up.",
      "Dormant and no-longer-in-force are recorded as different outcomes - one is about the holder, the other is about the document.",
    ],
    reusableRule:
      "A document takes effect on its own date, but it becomes real to its holder only when they are told what it now lets them do.",
  },
];
