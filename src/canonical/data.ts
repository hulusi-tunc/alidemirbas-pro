import type { CanonicalJourney, OrchestrationRule } from "./types";

/* CATEGORY 23 - DATA CHANGE, IMPORT, MIGRATION & STATE TRANSFORMATION

   The integration category asks whether two systems agree. This one asks a
   different question: is a specific dataset being changed or moved safely,
   once, on purpose.

   What makes it hard is that every stage here looks like the next one. A file
   arrived, so the data is in. It parsed, so it is valid. The import ran, so
   the data is right. The rows were copied, so the migration worked. The
   migration worked, so we can cut over. Each of those is a real, common and
   expensive substitution, and each is a place where the failure is invisible
   until somebody downstream acts on data nobody actually checked.

   The stages, kept apart:

     received       something arrived
     parsed         its structure made sense
     validated      its contents make sense for the target
     previewed      what it would change is visible
     applied        production state moved
     verified       the result preserves what it was supposed to

   And the three recoveries that are routinely conflated with destruction:
   a partial import recovers the failed scope rather than re-running the whole
   dataset, a backfill fills a gap without replaying the actions the original
   events would have caused, and a rollback undoes one operation rather than
   deleting everything that has happened since. */

export const DATA_RULES: readonly OrchestrationRule[] = [
  {
    id: "DAT-R1",
    scope: "data",
    rule: "Intake, parsing, validation and mutation are four separate stages.",
    because:
      "Each looks like the next from outside. A file that arrived, parsed and validated has still changed nothing, and reporting any of those as an import misstates what happened.",
  },
  {
    id: "DAT-R2",
    scope: "data",
    rule: "Parsing success does not establish business validity.",
    because:
      "A well-formed row can reference an entity that does not exist, duplicate a unique identifier, or carry a value the target has no meaning for.",
  },
  {
    id: "DAT-R3",
    scope: "data",
    rule: "Imports stage and validate before mutating production where the architecture permits.",
    because:
      "A parse that writes as it reads cannot promise to leave nothing behind when it fails halfway, and half a dataset applied is harder to recover than none.",
  },
  {
    id: "DAT-R4",
    scope: "data",
    rule: "Partial acceptance has explicit semantics.",
    because:
      "Whether half a dataset may be applied is a property of the data. Guessing produces a partly-loaded catalogue nobody chose and nobody can identify.",
  },
  {
    id: "DAT-R5",
    scope: "data",
    rule: "High-impact change sets expose their proposed mutation before execution where approval is required.",
    because:
      "Somebody approving an import is approving a mutation. If they cannot see what it does, the approval is a formality attached to an unknown.",
  },
  {
    id: "DAT-R6",
    scope: "data",
    rule: "Confirmation binds to the exact change-set version.",
    because:
      "A confirmation attached to the intake rather than the version approves whatever the change set later becomes, including a regenerated one nobody looked at.",
  },
  {
    id: "DAT-R7",
    scope: "data",
    rule: "Import execution is idempotent through stable per-record operation identity.",
    because:
      "Without it, the second run of a partly-failed import creates duplicates of everything that succeeded the first time, and the duplicates look like real data.",
  },
  {
    id: "DAT-R8",
    scope: "data",
    rule: "Partial import recovery preserves the confirmed successful scope.",
    because:
      "Re-running an entire dataset to fix forty rows re-touches thousands that were already correct, and any of those re-touches can go wrong.",
  },
  {
    id: "DAT-R9",
    scope: "data",
    rule: "Unknown record outcomes are reconciled before any replay.",
    because:
      "Replaying a record that may have been created produces two of it, and in an import the duplicate is indistinguishable from a legitimate row.",
  },
  {
    id: "DAT-R10",
    scope: "data",
    rule: "Migration mapping preserves semantics rather than merely fields.",
    because:
      "Two systems can both store a status string and disagree entirely about what it obliges anyone to do. Accepting the field is not carrying the meaning.",
  },
  {
    id: "DAT-R11",
    scope: "data",
    rule: "Migration correctness requires business invariant verification.",
    because:
      "Count equality is the weakest possible check. The same number of records can arrive with every status, relationship and total wrong.",
  },
  {
    id: "DAT-R12",
    scope: "data",
    rule: "Migration and cutover are separate stages.",
    because:
      "Copying the data and changing which system answers are different acts with different risks, and the second one is where live traffic starts depending on the first.",
  },
  {
    id: "DAT-R13",
    scope: "data",
    rule: "Authority during migration and cutover is explicit.",
    because:
      "Uncontrolled dual authority produces divergence no reconciliation can resolve, because both systems are correct about what they were told.",
  },
  {
    id: "DAT-R14",
    scope: "data",
    rule: "Backfill and live-event replay are different mechanisms.",
    because:
      "One repairs a record of what happened; the other re-enacts it. Confusing them sends a customer a reminder about an appointment from March.",
  },
  {
    id: "DAT-R15",
    scope: "data",
    rule: "Historical backfill suppresses obsolete real-time side effects.",
    because:
      "The notifications, grants and follow-ups those events would have triggered were appropriate at the time and are not appropriate now.",
  },
  {
    id: "DAT-R16",
    scope: "data",
    rule: "Transformation correction preserves the erroneous operation's history.",
    because:
      "A record showing only the corrected state cannot explain why anything downstream acted on the wrong one, and something always did.",
  },
  {
    id: "DAT-R17",
    scope: "data",
    rule: "Rollback never overwrites legitimate changes made after the erroneous operation.",
    because:
      "Restoring an old snapshot discards real work that happened afterwards and was entirely correct, which is a second incident on top of the first.",
  },
  {
    id: "DAT-R18",
    scope: "data",
    rule: "Bulk changes retain their source and change-set lineage.",
    because:
      "When a wrong value surfaces months later, the only useful question is which operation put it there, and lineage is the only thing that answers it.",
  },
  {
    id: "DAT-R19",
    scope: "data",
    rule: "Decision and policy mechanisms are reused for high-risk mutations.",
    because:
      "Approving a destructive bulk change is a decision with authority, scope and an audit trail, and an import flow that implements its own will diverge from the canonical one.",
  },
];

export const DATA_JOURNEYS: readonly CanonicalJourney[] = [
  /* ------------------------------------------------------------ DAT-221 */
  {
    id: "DAT-221",
    slug: "data-intake",
    category: "data",
    goal: "data-integrity",
    channels: [],
    name: "Data intake → identify format → parse or reject",
    purpose:
      "Get an incoming dataset into a stable readable form, without touching anything real while doing it.",
    entity: {
      scope: "the intake and the source artifact or dataset it carries",
      note: "The intake is the submission. Nothing about it is in the system until a later stage puts it there.",
    },
    entry: "t.submitted",
    nodes: [
      {
        id: "t.submitted",
        kind: "trigger",
        event: "dataset_submitted_for_intake",
        evidence: {
          requires: ["a dataset, file or import payload submitted or made available for a target context"],
          insufficientAlone: [
            "a file appearing in a location, which may be a partial upload still being written",
          ],
          source: "authoritative",
        },
        next: "a.capture",
      },
      {
        id: "a.capture",
        kind: "action",
        does: "Capture the intake id, the source, the submitting actor or system, the receipt time, the declared data type, the expected schema or version where it is known, and the target context this is intended for",
        writes: [{ field: "intake_log", mode: "append" }],
        next: "c.supported",
      },
      {
        id: "c.supported",
        kind: "condition",
        asks: "Is the representation readable and supported?",
        branches: [
          {
            label: "Supported",
            when: "the format is one the target can read, at a version it understands",
            to: "a.parse",
          },
          {
            label: "Not supported",
            when: "the format, encoding or version cannot be read",
            to: "a.reject-format",
          },
        ],
      },
      {
        id: "a.reject-format",
        kind: "action",
        does: "Record PARSE_REJECTED with what was expected and what actually arrived. Nothing has been read into the system, so nothing needs undoing - which is exactly why this check comes before anything else",
        writes: [{ field: "intake_log", mode: "append" }],
        next: "x.rejected",
      },
      {
        id: "x.rejected",
        kind: "exit",
        state: "PARSE_REJECTED; nothing was read and no state was touched",
        terminal: false,
        reEntry:
          "a resubmission in a supported format is a new intake, assessed on its own terms",
      },
      {
        id: "a.parse",
        kind: "action",
        does: "Parse into a staging representation held apart from production. Parsing never partially mutates production state - a parse that fails halfway must leave nothing behind, and one that writes as it reads cannot make that promise",
        writes: [{ field: "intake_log", mode: "append" }],
        next: "c.parsed",
      },
      {
        id: "c.parsed",
        kind: "condition",
        asks: "Did structural parsing succeed?",
        branches: [
          {
            label: "Parsed",
            when: "the whole payload resolved into the staging representation",
            to: "a.parsed",
          },
          {
            label: "Failed",
            when: "the structure broke down at some point in the payload",
            to: "a.parse-failed",
          },
        ],
      },
      {
        id: "a.parse-failed",
        kind: "action",
        does: "Record PARSE_FAILED with actionable diagnostics - which row, which field, what was expected and what was found. A parse error reported as an invalid file makes the submitter guess, and they will guess wrong several times before asking",
        writes: [{ field: "intake_log", mode: "append" }],
        next: "x.parse-failed",
      },
      {
        id: "x.parse-failed",
        kind: "exit",
        state: "PARSE_FAILED; staging discarded and production untouched",
        terminal: false,
        reEntry:
          "a corrected payload is a new intake. The diagnostics from this one are what make correcting it possible",
      },
      {
        id: "a.parsed",
        kind: "action",
        does: "Record PARSED against the staging representation. Structural parsing succeeding says the bytes made sense and says nothing whatever about whether the data does",
        writes: [{ field: "intake_log", mode: "append" }],
        next: "h.validate",
      },
      {
        id: "h.validate",
        kind: "handoff",
        to: "DAT-222",
        on: "a payload parsed into a stable staging representation",
        carries: [
          "the staging representation, the declared type and the target context",
          "the explicit fact that nothing has been validated and no production state has been touched",
        ],
      },
    ],
    guardrails: [
      "A file received is not valid data.",
      "Successful parsing is not semantic validity.",
      "Production state is never partially mutated during parsing.",
    ],
    reusableRule:
      "Data intake should first establish a stable parsed representation before any business validation or production mutation occurs.",
  },

  /* ------------------------------------------------------------ DAT-222 */
  {
    id: "DAT-222",
    slug: "data-validation",
    category: "data",
    goal: "data-integrity",
    channels: [],
    name: "Parsed data → validate schema and semantics → accept, reject or quarantine",
    purpose:
      "Establish that the data is valid for the target it is going into, record by record where that is meaningful.",
    entity: {
      scope: "the parsed dataset and the target's schema and business rules",
      note: "Validation produces a scope that will be applied, which is not necessarily the whole dataset. What is excluded is held rather than dropped.",
    },
    entry: "t.parsed",
    nodes: [
      {
        id: "t.parsed",
        kind: "trigger",
        event: "input_successfully_parsed",
        evidence: {
          requires: ["a parsed staging representation against an identified target"],
          source: "authoritative",
        },
        next: "a.validate",
      },
      {
        id: "a.validate",
        kind: "action",
        does: "Validate the required fields, the types, the identifiers, the references, the allowed values, the business invariants, the scope, the version compatibility and the duplicate semantics. Schema-valid is not business-valid - a well-formed row can reference an entity that does not exist, duplicate an identifier that must be unique, or carry a value the target has no meaning for",
        writes: [{ field: "intake_log", mode: "append" }],
        next: "a.classify",
      },
      {
        id: "a.classify",
        kind: "action",
        does: "Classify each record VALID, INVALID or AMBIGUOUS where per-record classification is meaningful. Ambiguous is a real third answer rather than a soft invalid - it means the data could be read two ways, and the parser should not be the thing that chooses",
        writes: [{ field: "intake_log", mode: "append" }],
        next: "c.ambiguous",
      },
      {
        id: "c.ambiguous",
        kind: "condition",
        asks: "Does any record carry an ambiguous mapping or value?",
        branches: [
          {
            label: "Some are ambiguous",
            when: "a value, identifier or mapping could resolve more than one way",
            to: "a.ambiguous",
          },
          {
            label: "None",
            when: "every record resolves unambiguously as valid or invalid",
            to: "c.semantics",
          },
        ],
      },
      {
        id: "a.ambiguous",
        kind: "action",
        does: "Halt on the ambiguous scope rather than coercing it. A value that could mean two things silently becomes whichever one the parser prefers, and the wrong one is discovered by whoever relies on it, months later, with no record of a choice having been made",
        writes: [{ field: "intake_log", mode: "append" }],
        next: "h.resolve",
      },
      {
        id: "h.resolve",
        kind: "handoff",
        to: "DEC-181",
        on: "ambiguous records requiring resolution before any mutation",
        carries: [
          "the ambiguous records, and for each the readings it could take",
          "the explicit fact that nothing was coerced and no mutation has occurred",
        ],
      },
      {
        id: "c.semantics",
        kind: "condition",
        asks: "What are this import's acceptance semantics?",
        branches: [
          {
            label: "Atomic",
            when: "the dataset is defined as all-or-nothing",
            to: "c.any-invalid",
          },
          {
            label: "Partial acceptance is explicitly supported",
            when: "the import is defined to apply its valid scope and hold the rest",
            to: "c.partial",
          },
          {
            label: "Not defined",
            when: "nothing states whether part of this dataset may be applied",
            to: "h.review",
          },
        ],
      },
      {
        id: "h.review",
        kind: "handoff",
        to: "DEC-181",
        on: "a dataset with undefined partial-acceptance semantics",
        carries: [
          "the valid and invalid scope as classified",
          "the explicit fact that no acceptance semantics were assumed - guessing produces a partly-loaded target nobody chose and nobody can identify afterwards",
        ],
      },
      {
        id: "c.any-invalid",
        kind: "condition",
        asks: "Under atomic semantics, is every record valid?",
        branches: [
          {
            label: "All valid",
            when: "no record fails validation",
            to: "a.accept",
          },
          {
            label: "At least one invalid",
            when: "any record fails",
            to: "a.reject-all",
          },
        ],
      },
      {
        id: "a.reject-all",
        kind: "action",
        does: "Reject the whole dataset under its atomic semantics, naming every record that failed and why. The submitter needs the full list rather than the first failure, because they will otherwise fix one and resubmit into the second",
        writes: [{ field: "intake_log", mode: "append" }],
        next: "x.rejected",
      },
      {
        id: "x.rejected",
        kind: "exit",
        state: "dataset rejected at validation; nothing applied",
        terminal: false,
        reEntry:
          "a corrected dataset is a new intake and validates fresh against the target as it is then",
      },
      {
        id: "c.partial",
        kind: "condition",
        asks: "Is any record valid?",
        branches: [
          {
            label: "Some are valid",
            when: "at least one record passes and can be applied on its own",
            to: "a.quarantine",
          },
          {
            label: "None",
            when: "every record fails validation",
            to: "a.reject-all",
          },
        ],
      },
      {
        id: "a.quarantine",
        kind: "action",
        does: "Quarantine the invalid records with their individual reasons, and carry forward only the valid scope. The quarantined records are held rather than dropped - they are the submitter's data, they need to come back, and a dropped row is indistinguishable from one that was never sent",
        writes: [{ field: "intake_log", mode: "append" }],
        next: "a.accept",
      },
      {
        id: "a.accept",
        kind: "action",
        does: "Record the validated change scope, bound to this intake and this validation as a versioned change set. What follows applies this version and not whatever the staging area holds later",
        writes: [{ field: "intake_log", mode: "append" }],
        next: "h.preview",
      },
      {
        id: "h.preview",
        kind: "handoff",
        to: "DAT-223",
        on: "a validated change set ready to be assessed for impact",
        carries: [
          "the validated scope as a versioned change set, and the quarantined scope separately",
          "the explicit fact that validity is not authorization - nothing has been approved to mutate anything",
        ],
      },
    ],
    guardrails: [
      "Schema-valid is not business-valid.",
      "Ambiguous values are never silently coerced.",
      "Partial acceptance semantics are explicit rather than assumed.",
      "Quarantined records are held with reasons rather than dropped.",
    ],
    reusableRule:
      "Parsed data becomes importable only after both structural and business-level validity have been established for the scope that will be applied.",
  },

  /* ------------------------------------------------------------ DAT-223 */
  {
    id: "DAT-223",
    slug: "change-impact-preview",
    category: "data",
    goal: "decision-approval",
    channels: ["task"],
    name: "Valid data → preview and impact analysis → confirm or hold",
    purpose:
      "Show what the mutation would actually do, so an approval attaches to that rather than to a filename.",
    entity: {
      scope: "the validated change set and the target state it would mutate",
      note: "The preview is computed against the target as it is now. Target state moves while somebody reads a summary, and the confirmation binds to the version that was shown.",
    },
    entry: "t.ready",
    nodes: [
      {
        id: "t.ready",
        kind: "trigger",
        event: "validated_change_set_ready_to_mutate",
        evidence: {
          requires: ["a validated change set with an identified target scope"],
          source: "authoritative",
        },
        next: "a.delta",
      },
      {
        id: "a.delta",
        kind: "action",
        does: "Calculate the proposed delta - the creates, the updates, the deletes or deactivations, the conflicts, the records that would not change at all, the relationship changes, and the downstream entities affected",
        writes: [{ field: "intake_log", mode: "append" }],
        next: "a.surface",
      },
      {
        id: "a.surface",
        kind: "action",
        does: "Surface the destructive changes explicitly rather than inside an aggregate count. Four thousand records processed hides the three hundred deactivations inside it, and the person confirming reads the total and approves the deletion without ever seeing it",
        writes: [{ field: "intake_log", mode: "append" }],
        next: "c.confirmation",
      },
      {
        id: "c.confirmation",
        kind: "condition",
        asks: "Does this change set require confirmation or approval?",
        branches: [
          {
            label: "It does not",
            when: "the change is routine and within what the import is authorized to do unattended",
            to: "h.execute",
          },
          {
            label: "It does",
            when: "the scope, the destructiveness or the policy calls for somebody to confirm",
            to: "c.threshold",
          },
        ],
      },
      {
        id: "c.threshold",
        kind: "condition",
        asks: "Does the impact cross a risk or approval threshold?",
        branches: [
          {
            label: "It crosses",
            when: "the delta's size, destructiveness or reach exceeds what a simple confirmation covers",
            to: "h.decide",
          },
          {
            label: "Within threshold",
            when: "a confirmation from the requesting party is sufficient",
            to: "a.present",
          },
        ],
      },
      {
        id: "h.decide",
        kind: "handoff",
        to: "DEC-181",
        on: "a change set crossing a risk or approval threshold",
        carries: [
          "the delta as it would actually apply, with the destructive scope named separately from the total",
          "the change-set version, so the decision binds to this mutation rather than to the import in general",
        ],
      },
      {
        id: "a.present",
        kind: "action",
        does: "Present the impact summary bound to this exact change-set version. A confirmation that binds to the intake rather than the version approves whatever the change set later becomes, including a regenerated one nobody looked at",
        writes: [{ field: "intake_log", mode: "append" }],
        next: "w.confirm",
        execution: "human",
      },
      {
        id: "w.confirm",
        kind: "wait",
        until: ["the change set is confirmed", "the change set is rejected"],
        onEvent: "c.outcome",
        timeout: {
          after: "the window this change set remains valid against the target",
          reason:
            "a delta computed against a target that has since moved describes a mutation that no longer exists, and confirming it applies edits nobody previewed",
        },
        onTimeout: "a.expired",
        windowExtendsOnEngagement: false,
      },
      {
        id: "c.outcome",
        kind: "condition",
        asks: "What was decided?",
        branches: [
          {
            label: "Confirmed",
            when: "somebody with the authority approved the presented delta",
            to: "a.recheck",
          },
          {
            label: "Rejected",
            when: "the change set was refused",
            to: "a.rejected",
          },
        ],
      },
      {
        id: "a.rejected",
        kind: "action",
        does: "Record the change set as rejected with the reason, and apply nothing",
        writes: [{ field: "intake_log", mode: "append" }],
        next: "x.rejected",
      },
      {
        id: "x.rejected",
        kind: "exit",
        state: "change set rejected; nothing applied",
        terminal: false,
        reEntry:
          "a revised change set is a new validation and a new preview rather than a resubmission of this one",
      },
      {
        id: "a.recheck",
        kind: "action",
        does: "Check the change set still describes the same mutation against the target as it now is. Target state moves while somebody reads a summary, and applying a delta computed against a state that has since changed applies edits nobody previewed",
        next: "c.still",
      },
      {
        id: "c.still",
        kind: "condition",
        asks: "Does the delta still describe the same mutation?",
        branches: [
          {
            label: "Unchanged",
            when: "the target has not moved in any way the delta depends on",
            to: "h.execute",
          },
          {
            label: "Changed",
            when: "the target has moved and the delta would now do something different",
            to: "a.regenerate",
          },
        ],
      },
      {
        id: "a.regenerate",
        kind: "action",
        does: "Regenerate the delta against current state and present it again. The previous confirmation was for a different mutation and does not carry - a confirmation reused across a regenerated delta is an approval of something nobody saw",
        writes: [{ field: "intake_log", mode: "append" }],
        next: "w.confirm",
      },
      {
        id: "a.expired",
        kind: "action",
        does: "Record the change set as expired unconfirmed. Nothing was applied, and the validated data is still held - what lapsed is the authorization window rather than the data",
        writes: [{ field: "intake_log", mode: "append" }],
        next: "x.expired",
      },
      {
        id: "x.expired",
        kind: "exit",
        state: "change set expired unconfirmed; nothing applied",
        terminal: false,
        reEntry:
          "the same data can be re-previewed against the target as it is then, which is a new delta and a new confirmation",
      },
      {
        id: "h.execute",
        kind: "handoff",
        to: "DAT-224",
        on: "a change set authorized to mutate the target",
        carries: [
          "the exact change-set version that was previewed and confirmed",
          "the authorization, bound to that version, so execution can refuse to apply anything else",
        ],
      },
    ],
    guardrails: [
      "The preview represents the mutation that would actually occur.",
      "Destructive changes are never hidden inside aggregate counts.",
      "Confirmation binds to the specific change-set version.",
    ],
    reusableRule:
      "High-impact data changes should expose their proposed delta before execution so authorization applies to the mutation that will actually occur.",
  },

  /* ------------------------------------------------------------ DAT-224 */
  {
    id: "DAT-224",
    slug: "import-execution",
    category: "data",
    goal: "data-integrity",
    channels: [],
    name: "Import execution → apply idempotently → complete, partial or fail",
    purpose:
      "Apply a fixed validated change set to production state, keeping every record's outcome.",
    entity: {
      scope: "the import job and the frozen change set it applies",
      note: "Each record operation carries a stable identity derived from the change set and the record. That identity is what makes a retry safe.",
    },
    distinctFrom: [
      {
        journey: "OPS-121",
        because:
          "OPS-121 runs a unit of async work and reports whether it finished. This mutates production data from a validated set, so its outcomes are per-record rather than per-job and its defining requirement is that re-running it does not create a second copy of everything that already worked.",
      },
    ],
    entry: "t.authorized",
    nodes: [
      {
        id: "t.authorized",
        kind: "trigger",
        event: "import_authorized_for_execution",
        evidence: {
          requires: ["a confirmed change set with authorization bound to its version"],
          source: "authoritative",
        },
        next: "a.freeze",
      },
      {
        id: "a.freeze",
        kind: "action",
        does: "Freeze and reference the exact input and change-set version being applied. What is applied is a fixed set - a change set still reading from a moving source applies something other than what was approved, and nobody can say afterwards what that was",
        writes: [{ field: "import_log", mode: "append" }],
        next: "a.identity",
      },
      {
        id: "a.identity",
        kind: "action",
        does: "Give each record operation a stable identity derived from the change set and the record, so a retry re-applies the same operation rather than performing a second one. Without it, the second run of a partly-failed import creates duplicates of everything that succeeded the first time, and those duplicates look exactly like real data",
        writes: [{ field: "import_log", mode: "append" }],
        next: "a.apply",
      },
      {
        id: "a.apply",
        kind: "action",
        does: "Apply the changes, recording each record's outcome - created, updated, unchanged, skipped, failed or unknown. Unchanged and skipped are distinct and both worth keeping: one means the data already matched, the other means we chose not to touch it, and only the second needs explaining",
        writes: [{ field: "import_log", mode: "append" }],
        next: "c.outcome",
      },
      {
        id: "c.outcome",
        kind: "condition",
        asks: "How did the execution end?",
        branches: [
          {
            label: "All required scope applied",
            when: "every record the change set required reached a successful outcome",
            to: "a.applied",
          },
          {
            label: "Mixed, and partial semantics are supported",
            when: "some records succeeded and some did not, and the import is defined to allow that",
            to: "a.partial",
          },
          {
            label: "Atomic semantics and a required mutation failed",
            when: "the import is all-or-nothing and something required did not apply",
            to: "a.rollback",
          },
        ],
      },
      {
        id: "a.applied",
        kind: "action",
        does: "Record IMPORT_APPLIED with the change-set version and the per-record execution history. The history identifies which records changed - an import that reports a count and not a list cannot be audited, corrected or partially undone",
        writes: [{ field: "import_log", mode: "append" }],
        next: "x.applied",
      },
      {
        id: "x.applied",
        kind: "exit",
        state: "IMPORT_APPLIED; every record outcome recorded against the change-set version",
        terminal: false,
        reEntry:
          "an error discovered in what was applied is a transformation error with its own correction path rather than a re-run of this import",
      },
      {
        id: "a.partial",
        kind: "action",
        does: "Record PARTIALLY_APPLIED with the per-record outcomes intact. The successful scope is a real result and stays that way - classifying the whole import as failed because part of it was discards work that is already correct in production",
        writes: [{ field: "import_log", mode: "append" }],
        next: "h.recover",
      },
      {
        id: "h.recover",
        kind: "handoff",
        to: "DAT-225",
        on: "an import completing with mixed outcomes",
        carries: [
          "the per-record outcomes, and which of them are confirmed successful",
          "the frozen change-set version and the stable operation identities, so any retry targets the same operations",
        ],
      },
      {
        id: "a.rollback",
        kind: "action",
        does: "Roll back or compensate to the boundary the atomic semantics define. What is undone is this operation's own mutations and nothing else - anything that happened to those records from another source in the meantime is not this import's to revert",
        writes: [{ field: "import_log", mode: "append" }],
        next: "c.rolled",
      },
      {
        id: "c.rolled",
        kind: "condition",
        asks: "Did the rollback complete cleanly?",
        branches: [
          {
            label: "Clean",
            when: "every mutation this import made has been reverted",
            to: "x.rolled-back",
          },
          {
            label: "Incomplete or uncertain",
            when: "some mutations could not be reverted, or their state is unknown",
            to: "h.reconcile",
          },
        ],
      },
      {
        id: "x.rolled-back",
        kind: "exit",
        state: "atomic import failed and fully reverted; target state as it was",
        terminal: false,
        reEntry:
          "a corrected dataset is a new import. The failed attempt stays in the record because it explains any transient effect anybody observed",
      },
      {
        id: "h.reconcile",
        kind: "handoff",
        to: "external:external-status-reconciliation",
        on: "a rollback that could not be completed or verified",
        carries: [
          "which mutations were reverted, which were not, and which are unknown",
          "the explicit instruction that the import is not re-run until the target's actual state is established",
        ],
        suppresses: ["any re-execution of this import while its rollback state is unknown"],
      },
    ],
    guardrails: [
      "A retry never duplicates created records.",
      "An import with confirmed successful scope is not classified as wholly failed.",
      "Execution history identifies which records changed.",
    ],
    reusableRule:
      "Import execution should apply a fixed validated change set idempotently while preserving the exact outcome of each affected scope.",
  },

  /* ------------------------------------------------------------ DAT-225 */
  {
    id: "DAT-225",
    slug: "partial-import-recovery",
    category: "data",
    goal: "reconciliation-correction",
    channels: [],
    name: "Partial import → isolate failed scope → correct → resume",
    purpose:
      "Fix only what did not land, without touching the records that already did.",
    entity: {
      scope: "the partially applied import and the per-record outcomes it produced",
      note: "The successful records are protected from the recovery. They are already correct in production, and every re-touch is a fresh chance to break one.",
    },
    distinctFrom: [
      {
        journey: "OPS-126",
        because:
          "OPS-126 preserves completed work in a composite processing job and retries the failed part. This works at record grain against production data, where a retry can create a duplicate row, a correction can silently alter a record that was already right, and the unresolved scope has to stay linked to the original import.",
      },
    ],
    entry: "t.mixed",
    nodes: [
      {
        id: "t.mixed",
        kind: "trigger",
        event: "import_completed_with_mixed_outcomes",
        evidence: {
          requires: ["an import with per-record outcomes including at least one unresolved record"],
          source: "authoritative",
        },
        next: "a.partition",
      },
      {
        id: "a.partition",
        kind: "action",
        does: "Partition the outcomes into successful, retryable failures, data failures, unknowns and skipped. Each needs a different response, and treating them as one bucket either re-runs what already worked or abandons what could still be fixed",
        writes: [{ field: "import_log", mode: "append" }],
        next: "a.protect",
      },
      {
        id: "a.protect",
        kind: "action",
        does: "Mark the confirmed successful records as not to be re-applied. A partial import is not a total failure - re-running the whole dataset to fix forty rows re-touches thousands that were already right, and any of those re-touches is a fresh opportunity to break something that worked",
        writes: [{ field: "import_log", mode: "append" }],
        next: "c.unknown",
      },
      {
        id: "c.unknown",
        kind: "condition",
        asks: "Are any record outcomes unknown?",
        branches: [
          {
            label: "Some are unknown",
            when: "records whose application neither succeeded nor failed observably",
            to: "a.hold-unknown",
          },
          {
            label: "None",
            when: "every record has a definite outcome",
            to: "c.route",
          },
        ],
      },
      {
        id: "a.hold-unknown",
        kind: "action",
        does: "Hold the unknown scope out of any replay until it is reconciled. Replaying a record that may have been created produces two of it, and in an import that duplicate is indistinguishable from a legitimate row and will be found by whoever runs a report",
        writes: [
          { field: "import_log", mode: "append" },
          { field: "suppressed_sends", mode: "append" },
        ],
        next: "h.reconcile",
      },
      {
        id: "h.reconcile",
        kind: "handoff",
        to: "external:external-status-reconciliation",
        on: "records whose import outcome could not be established",
        carries: [
          "the unknown records, their stable operation identities and everything last known about them",
          "the explicit instruction that no replay touches this scope until each record's actual state is known",
        ],
        suppresses: ["any retry of the unknown scope"],
      },
      {
        id: "c.route",
        kind: "condition",
        asks: "What do the unresolved records need?",
        branches: [
          {
            label: "A technical retry",
            when: "the failures were transient and the same operation is safely repeatable",
            to: "a.retry",
          },
          {
            label: "Correction of the data itself",
            when: "the records failed on their contents rather than on the attempt",
            to: "a.correct",
          },
          {
            label: "Nothing recoverable",
            when: "neither a retry nor a correction can resolve them",
            to: "a.close",
          },
        ],
      },
      {
        id: "a.retry",
        kind: "action",
        does: "Retry only the unresolved scope, using the same stable operation identity so a record that actually succeeded is not created a second time. The successful scope is not part of the retry at all - it is not re-read, re-validated or re-applied",
        writes: [{ field: "import_log", mode: "append" }],
        next: "c.budget",
      },
      {
        id: "c.budget",
        kind: "condition",
        asks: "Does retry budget remain?",
        branches: [
          {
            label: "Budget remains",
            when: "the attempts allowed for this import have not been used",
            to: "x.retrying",
          },
          {
            label: "Exhausted",
            when: "the retries this import allows have been used",
            to: "a.close",
          },
        ],
      },
      {
        id: "x.retrying",
        kind: "exit",
        state: "retrying the unresolved scope only; successful records untouched",
        terminal: false,
        reEntry:
          "each retry reports its own per-record outcomes and returns here with the unresolved set smaller and the budget one lower",
      },
      {
        id: "a.correct",
        kind: "action",
        does: "Create a corrected change set covering only the unresolved records, linked to the original import. The correction does not touch the already-successful records - silently changing them turns a fix into a second incident, and one nobody is looking for",
        writes: [{ field: "import_log", mode: "append" }],
        next: "h.revalidate",
      },
      {
        id: "h.revalidate",
        kind: "handoff",
        to: "DAT-222",
        on: "a corrected change set covering the unresolved scope",
        carries: [
          "the corrected records only, and the link to the import they are correcting",
          "the explicit fact that the successful scope is excluded and must not be revalidated or reapplied",
        ],
      },
      {
        id: "a.close",
        kind: "action",
        does: "Record the unresolved scope as unrecovered, with the reason for each record. The submitter needs to know exactly what did not land - an import reported as done with a silent shortfall is worse than one reported as failed",
        writes: [{ field: "import_log", mode: "append" }],
        next: "x.unrecovered",
      },
      {
        id: "x.unrecovered",
        kind: "exit",
        state: "successful scope applied and preserved; unresolved scope recorded as unrecovered",
        terminal: false,
        reEntry:
          "a fresh submission covering the unrecovered records is a new intake, linked to this one so the shortfall is traceable",
      },
    ],
    guardrails: [
      "A partial import is not a total failure.",
      "A correction never silently changes records that already succeeded.",
      "The original import and its correction attempts remain linked.",
      "Unknown outcomes are reconciled before any replay.",
    ],
    reusableRule:
      "Partial imports recover by isolating unresolved records while preserving confirmed successful mutations.",
  },

  /* ------------------------------------------------------------ DAT-226 */
  {
    id: "DAT-226",
    slug: "migration-readiness",
    category: "data",
    goal: "data-integrity",
    channels: [],
    name: "Migration plan → map source to target → validate readiness",
    purpose:
      "Prove the target can carry the source's meaning before anything is moved.",
    entity: {
      scope: "the migration, the source population and the target model",
      note: "Readiness is a property of the mapping against the whole source population, not against a sample of it.",
    },
    distinctFrom: [
      {
        journey: "DAT-227",
        because:
          "This proves the mapping can work. DAT-227 runs it and checks what actually arrived. A mapping that passes design review can still lose relationships at volume, and a mapping that never existed cannot be discovered mid-run.",
      },
    ],
    entry: "t.planned",
    nodes: [
      {
        id: "t.planned",
        kind: "trigger",
        event: "migration_planned",
        evidence: {
          requires: ["a defined migration with an identified source population and target model"],
          source: "authoritative",
        },
        next: "a.define",
      },
      {
        id: "a.define",
        kind: "action",
        does: "Define the migration scope, the source of truth, the target representation, the field and state mappings, the identifier strategy, the relationship mappings, the unsupported states, the transformation rules and the cutover model",
        writes: [{ field: "migration_log", mode: "append" }],
        next: "a.test",
      },
      {
        id: "a.test",
        kind: "action",
        does: "Test the mapping against the cases that actually occur in the source population rather than against representative examples. The states that break a migration are the rare ones, and a sample chosen for being typical excludes them by construction",
        writes: [{ field: "migration_log", mode: "append" }],
        next: "c.unmapped",
      },
      {
        id: "c.unmapped",
        kind: "condition",
        asks: "Does any source state have no mapping?",
        branches: [
          {
            label: "Everything maps",
            when: "every state present in the source population has a target representation",
            to: "c.semantics",
          },
          {
            label: "Some do not",
            when: "at least one occurring source state has nowhere to go",
            to: "a.blocked",
          },
        ],
      },
      {
        id: "a.blocked",
        kind: "action",
        does: "Record BLOCKED_MAPPING, naming each unmapped state and how many records hold it. Unsupported source states are never dropped silently - a state with no target is a set of records that will arrive meaning something else, and nobody will notice until one of them behaves wrongly",
        writes: [{ field: "migration_log", mode: "append" }],
        next: "h.design",
      },
      {
        id: "h.design",
        kind: "handoff",
        to: "DEC-181",
        on: "a migration blocked on mapping, semantics or transitional authority",
        carries: [
          "the specific gap - the unmapped states with their record counts, the semantics the target cannot carry, or the undefined authority model",
          "the explicit fact that nothing has been migrated and no mapping was assumed to fill the gap",
        ],
      },
      {
        id: "c.semantics",
        kind: "condition",
        asks: "Can the target represent the business meaning of every mapped state?",
        branches: [
          {
            label: "It can",
            when: "each mapped state means the same thing on the other side",
            to: "c.authority",
          },
          {
            label: "It cannot",
            when: "the target accepts the value and does not carry what it obliges anyone to do",
            to: "a.semantic-gap",
          },
        ],
      },
      {
        id: "a.semantic-gap",
        kind: "action",
        does: "Record that the target accepts the fields and loses the meaning. Field mapping is not semantic equivalence - two systems can both store a status called pending and disagree completely about what it obliges anyone to do, and the disagreement surfaces as behaviour rather than as a data error",
        writes: [{ field: "migration_log", mode: "append" }],
        next: "h.design",
      },
      {
        id: "c.authority",
        kind: "condition",
        asks: "Does the migration design define which system is authoritative during the transition?",
        branches: [
          {
            label: "It defines it",
            when: "the design states which side answers, for which scope, at each phase",
            to: "a.ready",
          },
          {
            label: "It does not",
            when: "nothing states who is authoritative while the migration runs",
            to: "a.no-authority",
          },
        ],
      },
      {
        id: "a.no-authority",
        kind: "action",
        does: "Record that transitional authority is undefined, and stop. Undefined authority during a migration produces two systems both accepting writes and neither able to say which is right, and the divergence cannot be reconciled afterwards because both sides are correct about what they were told",
        writes: [{ field: "migration_log", mode: "append" }],
        next: "h.design",
      },
      {
        id: "a.ready",
        kind: "action",
        does: "Record MIGRATION_READY with the mapping, the cases tested and the authority model that will govern the transition",
        writes: [{ field: "migration_log", mode: "append" }],
        next: "h.execute",
      },
      {
        id: "h.execute",
        kind: "handoff",
        to: "DAT-227",
        on: "a migration whose mapping and authority model are proven ready",
        carries: [
          "the mapping, the transformation rules and the identifier strategy",
          "the explicit fact that a proven mapping is not a verified population - what arrives still has to be checked",
        ],
      },
    ],
    guardrails: [
      "Field mapping is not semantic equivalence.",
      "Unsupported source states are never discarded silently.",
      "The migration design defines authority during the transition.",
    ],
    reusableRule:
      "Migration readiness requires proof that the target can preserve the business meaning of the source population, not merely accept its fields.",
  },

  /* ------------------------------------------------------------ DAT-227 */
  {
    id: "DAT-227",
    slug: "migration-execution",
    category: "data",
    goal: "data-integrity",
    channels: [],
    name: "Migration execute → copy and transform → verify population",
    purpose:
      "Move the population and then prove the result still means what the source meant.",
    entity: {
      scope: "the migration run, the frozen source scope and the target population it produced",
      note: "The source scope is frozen so that what is verified is what was actually taken, rather than the source as it has become since.",
    },
    distinctFrom: [
      {
        journey: "DAT-228",
        because:
          "This produces a verified target population. DAT-228 changes which system answers - a separate act, with live traffic depending on it, and its own recovery path.",
      },
    ],
    entry: "t.authorized",
    nodes: [
      {
        id: "t.authorized",
        kind: "trigger",
        event: "migration_execution_authorized",
        evidence: {
          requires: ["a migration recorded ready, with an authority model and an authorized run"],
          source: "authoritative",
        },
        next: "a.freeze",
      },
      {
        id: "a.freeze",
        kind: "action",
        does: "Freeze and identify the exact source scope being migrated, so what is verified afterwards is what was actually taken rather than the source as it has become since",
        writes: [{ field: "migration_log", mode: "append" }],
        next: "a.copy",
      },
      {
        id: "a.copy",
        kind: "action",
        does: "Copy and transform into the target, tracking the source count and scope, the target outcomes, the transform failures, the relationship failures and the unknown outcomes. Relationship failures are tracked separately because a record that arrives detached looks perfectly healthy on its own",
        writes: [{ field: "migration_log", mode: "append" }],
        next: "a.verify",
      },
      {
        id: "a.verify",
        kind: "action",
        does: "Verify the invariants that carry business meaning - entity counts where they are meaningful, identity continuity, relationship integrity, the distribution of critical states, financial totals where applicable, entitlement consistency and referential integrity. Rows copied is not migration correct, and count equality is the weakest possible check: the same number of records can arrive with every status wrong",
        writes: [{ field: "migration_log", mode: "append" }],
        next: "c.verified",
      },
      {
        id: "c.verified",
        kind: "condition",
        asks: "What did verification establish?",
        branches: [
          {
            label: "Every invariant holds",
            when: "each check ran and passed against the migrated population",
            to: "a.verified",
          },
          {
            label: "An invariant fails",
            when: "a check ran and the target does not match what it should",
            to: "a.discrepancy",
          },
          {
            label: "An invariant could not be evaluated",
            when: "a check could not run at all against this population",
            to: "a.unverifiable",
          },
        ],
      },
      {
        id: "a.discrepancy",
        kind: "action",
        does: "Record which invariant failed, by how much, and against which scope. A discrepancy stated as a total tells nobody where to look; stated as a scope it is a correction somebody can make",
        writes: [{ field: "migration_log", mode: "append" }],
        next: "h.reconcile",
      },
      {
        id: "a.unverifiable",
        kind: "action",
        does: "Record that the check could not be run. Unverifiable is not passed, and treating it as passed is how a migration gets declared correct on the strength of the checks that happened to work",
        writes: [{ field: "migration_log", mode: "append" }],
        next: "h.reconcile",
      },
      {
        id: "h.reconcile",
        kind: "handoff",
        to: "DAT-230",
        on: "a migrated population that failed or could not complete verification",
        carries: [
          "the failing or unevaluable invariant, its scope and the frozen source it was checked against",
          "the explicit fact that no cutover has occurred, so the source is still authoritative",
        ],
      },
      {
        id: "a.verified",
        kind: "action",
        does: "Record MIGRATED_VERIFIED, and keep the source available for the rollback and audit window the plan defines. A source discarded the moment the copy finishes removes the only thing a rollback could restore from, and the need for one is usually discovered later than that",
        writes: [{ field: "migration_log", mode: "append" }],
        next: "h.cutover",
      },
      {
        id: "h.cutover",
        kind: "handoff",
        to: "DAT-228",
        on: "a verified target population",
        carries: [
          "the verified population, the invariants that were checked and the source still held",
          "the explicit fact that a verified copy is not a cutover - the source is still the system that answers",
        ],
      },
    ],
    guardrails: [
      "Rows copied is not migration correct.",
      "Count equality alone is not semantic correctness.",
      "An unevaluable invariant is not a passed one.",
      "The source remains available for the defined rollback and audit window.",
    ],
    reusableRule:
      "Migration is successful only when the target population preserves the required business invariants of the source scope.",
  },

  /* ------------------------------------------------------------ DAT-228 */
  {
    id: "DAT-228",
    slug: "cutover",
    category: "data",
    goal: "change-versioning",
    channels: [],
    name: "Cutover → switch authority → observe → stabilize or roll back",
    purpose:
      "Change which system is authoritative, once, with a way back that was defined before it was needed.",
    entity: {
      scope: "the migration, the source system or state, and the target that would replace it",
      note: "Exactly one side is authoritative at any moment. Dual authority is the failure this journey exists to prevent, not a transitional convenience.",
    },
    entry: "t.ready",
    nodes: [
      {
        id: "t.ready",
        kind: "trigger",
        event: "verified_target_ready_for_cutover",
        evidence: {
          requires: ["a verified migrated population with its invariants checked"],
          insufficientAlone: [
            "a migration copy completing, which produces data and changes nothing about which system answers",
          ],
          source: "authoritative",
        },
        next: "c.rollback-defined",
      },
      {
        id: "c.rollback-defined",
        kind: "condition",
        asks: "Are the rollback semantics defined before cutover?",
        branches: [
          {
            label: "Defined",
            when: "the plan states what rollback means, how far it reaches and until when it is possible",
            to: "a.boundary",
          },
          {
            label: "Not defined",
            when: "no rollback path has been specified",
            to: "h.decide",
          },
        ],
      },
      {
        id: "h.decide",
        kind: "handoff",
        to: "DEC-181",
        on: "a cutover proposed without defined rollback semantics",
        carries: [
          "the verified target and what is known about reversibility",
          "the explicit fact that relying on an undefined rollback means discovering during an incident that there is no way back",
        ],
      },
      {
        id: "a.boundary",
        kind: "action",
        does: "Define the cutover boundary - which scope, from which moment, with which writes controlled how",
        writes: [{ field: "migration_log", mode: "append" }],
        next: "a.control-writes",
      },
      {
        id: "a.control-writes",
        kind: "action",
        does: "Control writes according to the migration strategy, so exactly one system is authoritative at a time. Uncontrolled dual authority produces divergence no reconciliation can resolve, because each side is correct about what it was told and neither is wrong",
        writes: [{ field: "migration_log", mode: "append" }],
        next: "a.switch",
      },
      {
        id: "a.switch",
        kind: "action",
        does: "Switch authoritative reads and writes to the target, and record CUTOVER_IN_PROGRESS. This is the point at which the migration stops being a copy and starts being the system",
        writes: [{ field: "migration_log", mode: "append" }],
        next: "w.observe",
      },
      {
        id: "w.observe",
        kind: "wait",
        until: ["a critical failure is detected in the target"],
        onEvent: "c.recovery",
        timeout: {
          after: "the observation window the plan defines",
          reason:
            "the observation window is the point of the wait. Passing it without a critical failure is the intended outcome and is what makes the cutover stable rather than merely underway",
        },
        onTimeout: "a.stable",
        windowExtendsOnEngagement: false,
      },
      {
        id: "c.recovery",
        kind: "condition",
        asks: "Which recovery is safer?",
        branches: [
          {
            label: "Rollback, within the plan's capability",
            when: "the rollback window is still open and the target has taken little or no irreplaceable work",
            to: "a.rollback",
          },
          {
            label: "Forward correction is safer",
            when: "the target has taken live writes that a rollback would discard",
            to: "a.forward",
          },
          {
            label: "Rollback capability has lapsed",
            when: "the plan's rollback window has closed",
            to: "a.forward",
          },
        ],
      },
      {
        id: "a.rollback",
        kind: "action",
        does: "Revert authority to the source under the defined plan, recording everything the target accepted during the cutover window so nothing written there is simply lost. A rollback that discards live work quietly is a second incident inside the first",
        writes: [{ field: "migration_log", mode: "append" }],
        next: "x.rolled-back",
      },
      {
        id: "x.rolled-back",
        kind: "exit",
        state: "authority returned to the source; the target's cutover-window writes recorded for reconciliation",
        terminal: false,
        reEntry:
          "a further cutover attempt starts from a fresh verification. What the target accepted during this window is reconciled on its own terms rather than assumed lost",
      },
      {
        id: "a.forward",
        kind: "action",
        does: "Correct forward under control rather than reverting. Once the target has taken live writes, a rollback discards them - and a rollback that discards real work is a second incident on top of the first, with the added difficulty that nobody can list what was lost",
        writes: [{ field: "migration_log", mode: "append" }],
        next: "h.correct",
      },
      {
        id: "h.correct",
        kind: "handoff",
        to: "DAT-230",
        on: "a cutover failure being corrected forward",
        carries: [
          "what failed, what the target has accepted since the switch, and which invariants are currently violated",
          "the explicit fact that the target is authoritative, so the correction runs against live state rather than against a staging copy",
        ],
      },
      {
        id: "a.stable",
        kind: "action",
        does: "Record TARGET_AUTHORITATIVE with what was observed and for how long. Migration copy complete was never cutover complete - this is the point at which the old system stops being the answer to anything",
        writes: [{ field: "migration_log", mode: "append" }],
        next: "x.authoritative",
      },
      {
        id: "x.authoritative",
        kind: "exit",
        state: "TARGET_AUTHORITATIVE; the cutover is complete and observed stable",
        terminal: false,
        reEntry:
          "problems found afterwards are corrected forward against the target. The source is retained for the audit window rather than as a system that could be switched back to",
      },
    ],
    guardrails: [
      "A migration copy completing is not a cutover completing.",
      "Uncontrolled dual authority is never permitted.",
      "Rollback semantics are defined before rollback is relied on.",
    ],
    reusableRule:
      "Cutover changes the authoritative operating state only after the migrated target has been verified and while a controlled recovery path remains available.",
  },

  /* ------------------------------------------------------------ DAT-229 */
  {
    id: "DAT-229",
    slug: "historical-backfill",
    category: "data",
    goal: "data-integrity",
    channels: [],
    name: "Historical backfill → scope window → apply without replaying stale actions",
    purpose:
      "Repair a gap in the record without re-enacting the things those events would have caused.",
    entity: {
      scope: "the backfill, its defined window, and the target records inside it",
      note: "The window is exact. A backfill without a bounded scope is an unbounded rewrite that nobody can verify closed anything.",
    },
    distinctFrom: [
      {
        journey: "INT-118",
        because:
          "INT-118 backfills what an integration missed while it was disconnected, and reconciles against a partner system. This repairs a historical gap from any source, and its defining problem is suppressing the real-time side effects those events would have triggered - a question a reconnect backfill answers differently.",
      },
    ],
    entry: "t.gap",
    nodes: [
      {
        id: "t.gap",
        kind: "trigger",
        event: "historical_gap_identified",
        evidence: {
          requires: ["an identified missing window or scope in a historical dataset"],
          source: "authoritative",
        },
        next: "a.define",
      },
      {
        id: "a.define",
        kind: "action",
        does: "Define the exact missing window and scope, the source, the target records, the business purpose, and specifically which side effects are to be suppressed and which preserved",
        writes: [{ field: "backfill_log", mode: "append" }],
        next: "c.side-effects",
      },
      {
        id: "c.side-effects",
        kind: "condition",
        asks: "Is the suppression list defined?",
        branches: [
          {
            label: "Defined",
            when: "the backfill states which real-time effects it must not fire and which it must",
            to: "a.suppress",
          },
          {
            label: "Not defined",
            when: "nothing states which side effects this load may trigger",
            to: "h.review",
          },
        ],
      },
      {
        id: "h.review",
        kind: "handoff",
        to: "DEC-181",
        on: "a backfill with no defined side-effect policy",
        carries: [
          "the window, the scope and the effects the historical events would originally have triggered",
          "the explicit fact that nothing was inferred from the data - getting this wrong sends real messages to real people about things that happened months ago",
        ],
      },
      {
        id: "a.suppress",
        kind: "action",
        does: "Suppress the real-time side effects the historical events would have triggered - the notifications, the entitlement grants, the scheduled follow-ups, the scoring updates that assume recency. A backfill is not a live event replay, and replaying one sends somebody a reminder about an appointment from March",
        writes: [
          { field: "backfill_log", mode: "append" },
          { field: "suppressed_sends", mode: "append" },
        ],
        next: "a.load",
      },
      {
        id: "a.load",
        kind: "action",
        does: "Load the historical data idempotently, keyed so that re-running the backfill fills the same gap rather than doubling it. Historical timestamps stay historical - restamping them to now makes the gap look filled and every subsequent report wrong",
        writes: [{ field: "backfill_log", mode: "append" }],
        next: "c.current-state",
      },
      {
        id: "c.current-state",
        kind: "condition",
        asks: "Does any backfilled event bear on current authoritative state?",
        branches: [
          {
            label: "It does",
            when: "a balance, a status, an entitlement or a count should have been different all along",
            to: "a.reconcile-current",
          },
          {
            label: "It does not",
            when: "the gap was in the record only and nothing current derives from it",
            to: "a.verify",
          },
        ],
      },
      {
        id: "a.reconcile-current",
        kind: "action",
        does: "Reconcile the current state deliberately, decision by decision, rather than letting the load recompute it. A balance that should have been different for six months is a deliberate correction with consequences somebody has to own - not a side effect of a data load nobody reviewed",
        writes: [{ field: "backfill_log", mode: "append" }],
        next: "a.verify",
      },
      {
        id: "a.verify",
        kind: "action",
        does: "Verify the gap is closed with no duplicate records, and that the counts and boundaries match the window that was defined. A backfill that overshoots its window is a rewrite of data that was already correct",
        writes: [{ field: "backfill_log", mode: "append" }],
        next: "c.verified",
      },
      {
        id: "c.verified",
        kind: "condition",
        asks: "Did the backfill close the gap cleanly?",
        branches: [
          {
            label: "Cleanly",
            when: "the window is filled, the boundaries match and no duplicates were created",
            to: "x.backfilled",
          },
          {
            label: "Duplicates or gaps remain",
            when: "the result does not match the defined window",
            to: "h.reconcile",
          },
        ],
      },
      {
        id: "x.backfilled",
        kind: "exit",
        state: "gap closed; historical timestamps preserved and obsolete side effects suppressed",
        terminal: false,
        reEntry:
          "a further gap is its own backfill with its own window. Re-running this one fills the same gap rather than doubling it",
      },
      {
        id: "h.reconcile",
        kind: "handoff",
        to: "DAT-230",
        on: "a backfill that did not close its window cleanly",
        carries: [
          "the intended window, what was actually written and where the duplicates or gaps are",
          "the explicit fact that the load was idempotent by key, so the discrepancy is in the scope rather than in repeated application",
        ],
      },
    ],
    guardrails: [
      "A backfill is not a live event replay.",
      "Historical timestamps remain historical.",
      "Obsolete customer-facing actions are never triggered by a backfill.",
    ],
    reusableRule:
      "Historical backfill repairs missing data and derived state while separating historical truth from actions that would only have been appropriate in real time.",
  },

  /* ------------------------------------------------------------ DAT-230 */
  {
    id: "DAT-230",
    slug: "transformation-error-recovery",
    category: "data",
    goal: "reconciliation-correction",
    channels: [],
    name: "Data transformation error → reconcile → correct, roll forward or roll back",
    purpose:
      "Undo the wrong mutation without undoing the right things that happened after it.",
    entity: {
      scope: "the erroneous data change operation and the records it affected",
      note: "The affected records have usually moved on since. What happened to them afterwards is not this operation's to revert.",
    },
    entry: "t.discovered",
    nodes: [
      {
        id: "t.discovered",
        kind: "trigger",
        event: "material_transformation_error_discovered",
        evidence: {
          requires: ["evidence that an import, migration or bulk transformation produced wrong data"],
          source: "authoritative",
        },
        next: "a.identify",
      },
      {
        id: "a.identify",
        kind: "action",
        does: "Identify the operation and its version, the affected scope, the original values, the current values, the downstream side effects, and - critically - the legitimate changes that have happened to those records since. That last one decides everything that follows",
        writes: [{ field: "correction_log", mode: "append" }],
        next: "c.subsequent",
      },
      {
        id: "c.subsequent",
        kind: "condition",
        asks: "Have legitimate changes occurred to the affected records since the erroneous operation?",
        branches: [
          {
            label: "None since",
            when: "the affected records carry only what the erroneous operation put there",
            to: "c.route",
          },
          {
            label: "Yes, there have been later changes",
            when: "customers, staff or other processes have since modified the affected records",
            to: "c.forward",
          },
        ],
      },
      {
        id: "c.route",
        kind: "condition",
        asks: "What correction is available?",
        branches: [
          {
            label: "A deterministic corrective transformation",
            when: "the right values can be derived from the source and the error",
            to: "a.correct",
          },
          {
            label: "A safe rollback of this operation's scope",
            when: "reverting this operation's own mutations restores the prior correct state",
            to: "a.rollback",
          },
          {
            label: "Neither is determinable",
            when: "the correct values cannot be established from what is available",
            to: "h.decide",
          },
        ],
      },
      {
        id: "c.forward",
        kind: "condition",
        asks: "Given the later changes, what is safe?",
        branches: [
          {
            label: "Roll forward with reconciliation",
            when: "later legitimate changes overlap the erroneous scope and must be kept",
            to: "a.roll-forward",
          },
          {
            label: "The later changes do not touch the erroneous scope",
            when: "the two sets of records are disjoint and rollback remains safe",
            to: "a.rollback",
          },
          {
            label: "The authority to choose is unclear",
            when: "correcting or reverting would each override somebody's legitimate work",
            to: "h.decide",
          },
        ],
      },
      {
        id: "h.decide",
        kind: "handoff",
        to: "DEC-181",
        on: "a transformation error whose safe correction cannot be determined",
        carries: [
          "the erroneous operation, the affected scope, what has legitimately changed since and the options considered",
          "the explicit fact that no snapshot was restored and nothing was overwritten while this is decided",
        ],
      },
      {
        id: "a.correct",
        kind: "action",
        does: "Create an explicit correction operation with its own identity and lineage, rather than editing the affected records in place. The correction is a second operation on the record's history and not an erasure of the first",
        writes: [{ field: "correction_log", mode: "append" }],
        next: "a.preserve",
      },
      {
        id: "a.rollback",
        kind: "action",
        does: "Roll back only this operation's own scope. A rollback is not deleting everything created since the migration - it is undoing one operation's mutations, and confusing the two destroys every piece of legitimate work in between",
        writes: [{ field: "correction_log", mode: "append" }],
        next: "a.preserve",
      },
      {
        id: "a.roll-forward",
        kind: "action",
        does: "Correct forward, reconciling the erroneous values against the legitimate later ones record by record. Restoring an old snapshot over them discards real work that happened after the error and was entirely correct, and nobody will be able to list what was lost",
        writes: [{ field: "correction_log", mode: "append" }],
        next: "a.preserve",
      },
      {
        id: "a.preserve",
        kind: "action",
        does: "Preserve the erroneous operation in the history alongside its correction. The wrong transformation happened, and a record showing only the corrected state cannot explain why anything downstream acted on the wrong one - and something always did",
        writes: [{ field: "correction_log", mode: "append" }],
        next: "c.downstream",
      },
      {
        id: "c.downstream",
        kind: "condition",
        asks: "Did the erroneous data produce downstream side effects?",
        branches: [
          {
            label: "It did",
            when: "messages went out, decisions were made, or obligations were created on the wrong values",
            to: "h.remedy",
          },
          {
            label: "It did not",
            when: "the error was contained to the data before anything acted on it",
            to: "x.corrected",
          },
        ],
      },
      {
        id: "h.remedy",
        kind: "handoff",
        to: "REM-157",
        on: "downstream consequences of wrong transformed data",
        carries: [
          "what acted on the wrong values, when, and what the corrected values are",
          "the explicit fact that the data is corrected and the consequences are not - those are their own obligation",
        ],
      },
      {
        id: "x.corrected",
        kind: "exit",
        state: "transformation corrected; erroneous operation and legitimate later changes both preserved",
        terminal: false,
        reEntry:
          "a further error in the same lineage is assessed with this correction as part of its history, which is why none of it was removed",
      },
    ],
    guardrails: [
      "An old snapshot is never restored over legitimate newer changes.",
      "The erroneous operation's history is preserved alongside the correction.",
      "A rollback is not deletion of everything created since the migration.",
    ],
    reusableRule:
      "Data transformation recovery should reverse or correct only the erroneous mutation while preserving legitimate changes that occurred afterward.",
  },
];
