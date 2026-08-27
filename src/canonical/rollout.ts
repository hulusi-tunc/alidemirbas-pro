import type { CanonicalJourney, OrchestrationRule } from "./types";

/* CATEGORY 25 - DEPLOYMENT, ROLLOUT, CHANGE & VERSION TRANSITIONS

   A change exists and a population needs to receive it. The tempting model is
   one step: ship it. The reason that model fails is that "ship it" is actually
   six questions, and each of them has a different wrong answer.

   Can this target take it. Is it prepared. Is now still the right moment. Did
   the command land. Did the target actually end up where it was supposed to.
   Is the population that took it still healthy an hour later.

   Deployment tooling characteristically stops at the fourth. The command was
   accepted, so the change is out. But accepted is not applied, applied is not
   in the intended state, and in the intended state is not healthy - and the
   distance between those is where a fleet ends up on a version nobody can
   name.

   The chain:

     available      the change exists
     eligible       this target's state permits it
     ready          what it depends on is in place
     scheduled      a moment has been chosen
     applied        the target accepted it
     verified       the target is in the intended state
     stable         the population that took it is still healthy

   And three recoveries that are not the same thing. Pausing stops expansion
   and reverts nothing. Rolling back returns a population to a known-good
   state, which is only possible while the boundary behind it is still
   reversible. Rolling forward is what remains when it is not - and the
   decision between them is its own journey, because choosing wrong is
   irreversible in the other direction. */

export const ROLLOUT_RULES: readonly OrchestrationRule[] = [
  {
    id: "RLT-R1",
    scope: "rollout",
    rule: "Availability, eligibility, readiness, scheduling, application and verification are six separate states.",
    because:
      "Each is a different reason a target does not have the change yet, and a rollout that reports one number cannot say which of the six anything is stuck at.",
  },
  {
    id: "RLT-R2",
    scope: "rollout",
    rule: "Every delayed or scheduled change revalidates current target state before execution.",
    because:
      "The gap between scheduling and executing is where a target gets decommissioned, superseded or moved into an incident, and the job fires anyway.",
  },
  {
    id: "RLT-R3",
    scope: "rollout",
    rule: "Applied and verified are separate wherever the actual target state matters.",
    because:
      "A change can apply and leave the target in a state nobody designed. That is worse than a clean failure, because nothing reports it as one.",
  },
  {
    id: "RLT-R4",
    scope: "rollout",
    rule: "A timeout does not prove a change failed.",
    because:
      "The change may well have applied. Retrying on the assumption it did not applies it twice, which for firmware and schema changes is not idempotent however idempotent the command is.",
  },
  {
    id: "RLT-R5",
    scope: "rollout",
    rule: "Rollout health uses sufficient evidence rather than elapsed time.",
    because:
      "A cohort that produced no traffic produced no information. Expanding because nothing alerted is expanding on the absence of a signal rather than the presence of one.",
  },
  {
    id: "RLT-R6",
    scope: "rollout",
    rule: "Staged rollout expands through explicit health gates.",
    because:
      "A gate that is not written down is a judgment made under pressure by whoever is watching, and it will be different next time.",
  },
  {
    id: "RLT-R7",
    scope: "rollout",
    rule: "Paused is not failed.",
    because:
      "The targets already changed are mostly fine. Treating a pause as a failure reverts a population that had no problem, which is a second incident.",
  },
  {
    id: "RLT-R8",
    scope: "rollout",
    rule: "Failure does not automatically imply rollback.",
    because:
      "Rollback is one recovery strategy. Across an irreversible boundary it produces old code running against new data, which fails differently and worse.",
  },
  {
    id: "RLT-R9",
    scope: "rollout",
    rule: "Rollback safety accounts for irreversible effects and data compatibility.",
    because:
      "The schema moved, the external commitments were made, the records exist. Reverting the version does not revert any of that.",
  },
  {
    id: "RLT-R10",
    scope: "rollout",
    rule: "Rollback is verified rather than assumed from a successful command.",
    because:
      "Rollbacks fail on exactly the dependency and data-shape problems that made them necessary, and the command reports success either way.",
  },
  {
    id: "RLT-R11",
    scope: "rollout",
    rule: "Rollback preserves the failed change's history.",
    because:
      "The change ran and affected things. The record of it is what explains every anomaly anybody noticed during the window it was live.",
  },
  {
    id: "RLT-R12",
    scope: "rollout",
    rule: "Individual target failure and systemic rollout failure are separate states.",
    because:
      "One unreachable device is not a broken release, and forty targets failing the same way is not forty independent problems.",
  },
  {
    id: "RLT-R13",
    scope: "rollout",
    rule: "Exception targets remain observable and recoverable.",
    because:
      "A rollout reported complete while quietly leaving targets behind produces a version distribution nobody can account for, and those are the ones that break later.",
  },
  {
    id: "RLT-R14",
    scope: "rollout",
    rule: "Version and change operations are idempotent through stable operation identity.",
    because:
      "Retries are normal in this category, and a retry that applies the change a second time is how a target ends up double-migrated.",
  },
  {
    id: "RLT-R15",
    scope: "rollout",
    rule: "Superseded schedules and actions do not execute.",
    because:
      "Applying an old version after a newer one exists installs a regression deliberately, and the job that did it looks like it worked.",
  },
  {
    id: "RLT-R16",
    scope: "rollout",
    rule: "Post-change observation may be required before stable completion.",
    because:
      "The regressions that matter surface on a weekly cycle, at month-end, or the first time a rare path runs - all of them after the rollout dashboard turned green.",
  },
  {
    id: "RLT-R17",
    scope: "rollout",
    rule: "Previous versions are not destroyed merely because a rollout completed.",
    because:
      "Deleting the previous version removes the only thing a late rollback could restore from, and late is when rollbacks are actually needed.",
  },
  {
    id: "RLT-R18",
    scope: "rollout",
    rule: "Change execution reuses the async and external reliability primitives.",
    because:
      "Retry, backoff and unknown-outcome reconciliation already exist. A second implementation inside deployment behaves differently under exactly the conditions that produced the failure.",
  },
  {
    id: "RLT-R20",
    scope: "rollout",
    rule: "Change history and version lineage stay auditable.",
    because:
      "When something breaks, the first useful question is what changed and when, and a system that only knows its current version cannot answer it.",
  },
];

export const ROLLOUT_JOURNEYS: readonly CanonicalJourney[] = [
  /* ------------------------------------------------------------ RLT-241 */
  {
    id: "RLT-241",
    slug: "change-eligibility",
    category: "rollout",
    goal: "eligibility-qualification",
    channels: [],
    name: "Change candidate → eligibility → ready or blocked",
    purpose:
      "Decide which targets a change may reach at all, before anyone starts preparing any of them.",
    entity: {
      scope: "the change or version, and each target evaluated against it",
      note: "Eligibility is per target. A population is never uniform, and the targets that differ are the ones the rollout will break on.",
    },
    distinctFrom: [
      {
        journey: "RLT-242",
        because:
          "This asks whether a target may take the change. RLT-242 gets it into a state where it can. Ineligible and unprepared are different problems with different owners - one is a decision, the other is work.",
      },
    ],
    entry: "t.available",
    nodes: [
      {
        id: "t.available",
        kind: "trigger",
        event: "change_available_for_controlled_application",
        evidence: {
          requires: ["a change or version released for controlled application to an identified population"],
          insufficientAlone: [
            "a version being published, which makes it available and eligible for nothing",
          ],
          source: "authoritative",
        },
        next: "a.evaluate",
      },
      {
        id: "a.evaluate",
        kind: "action",
        does: "Evaluate each target's eligibility against what actually governs it - the supported version, device or resource compatibility, the account's configuration, dependencies, required prerequisites, policy eligibility, the environment, capacity, and any required previous state. Eligibility is evaluated per target: inferring it from the entity type assumes a population is uniform, and populations never are",
        writes: [{ field: "rollout_log", mode: "append" }],
        next: "c.eligible",
      },
      {
        id: "c.eligible",
        kind: "condition",
        asks: "Is this target eligible for the change?",
        branches: [
          {
            label: "Eligible",
            when: "its current state satisfies everything the change requires of a target",
            to: "c.prerequisites",
          },
          {
            label: "Not eligible",
            when: "a compatibility, configuration, environment or policy constraint rules it out",
            to: "a.excluded",
          },
        ],
      },
      {
        id: "a.excluded",
        kind: "action",
        does: "Record EXCLUDED with the specific reason. An excluded target is a known population rather than an absence - a rollout reporting ninety-four percent coverage without naming the other six percent cannot be finished, and nobody can tell an exclusion from an omission",
        writes: [{ field: "rollout_log", mode: "append" }],
        next: "x.excluded",
      },
      {
        id: "x.excluded",
        kind: "exit",
        state: "EXCLUDED with a stated reason; the target remains on its current version",
        terminal: false,
        reEntry:
          "the constraint that excluded it changing makes the target eligible again, and it is re-evaluated rather than assumed still excluded",
      },
      {
        id: "c.prerequisites",
        kind: "condition",
        asks: "Are the required prerequisites present on this target?",
        branches: [
          {
            label: "All present",
            when: "nothing the change depends on is missing",
            to: "a.ready",
          },
          {
            label: "Something missing",
            when: "a dependency, a prior version step or a required condition is absent",
            to: "a.pending",
          },
        ],
      },
      {
        id: "a.pending",
        kind: "action",
        does: "Record PENDING_REQUIREMENT naming exactly which prerequisite is missing. Eligible-but-unprepared is a real state, and it is the one that most often gets counted as failed",
        writes: [{ field: "rollout_log", mode: "append" }],
        next: "h.prepare",
      },
      {
        id: "a.ready",
        kind: "action",
        does: "Record READY_FOR_CHANGE. Eligible is not technically ready, and ready is not applied - what has been established is that this target may take the change, not that it can yet",
        writes: [{ field: "rollout_log", mode: "append" }],
        next: "h.prepare",
      },
      {
        id: "h.prepare",
        kind: "handoff",
        to: "RLT-242",
        on: "an eligible target, prepared or with named outstanding prerequisites",
        carries: [
          "the target, the change version and its eligibility basis",
          "any outstanding prerequisites by name, so preparation resolves specific blockers rather than running a generic checklist",
        ],
      },
    ],
    guardrails: [
      "Available is not eligible.",
      "Eligible is not technically ready.",
      "Compatibility is never inferred from the generic entity type alone.",
      "Excluded targets are named rather than absent from the count.",
    ],
    reusableRule:
      "A change should reach only targets whose current state satisfies the prerequisites required for safe application.",
  },

  /* ------------------------------------------------------------ RLT-242 */
  {
    id: "RLT-242",
    slug: "change-preparation",
    category: "rollout",
    goal: "readiness-revalidation",
    channels: [],
    name: "Change preparation → resolve dependencies → ready or hold",
    purpose:
      "Get an eligible target into a state where the change can actually be applied to it.",
    entity: {
      scope: "the target and the preparation the change requires of it",
      note: "What is required comes from the change and this target. A standard checklist applied to everything delays a rollout for reasons nobody can defend.",
    },
    entry: "t.eligible",
    nodes: [
      {
        id: "t.eligible",
        kind: "trigger",
        event: "target_eligible_for_planned_change",
        evidence: {
          requires: ["a target established as eligible for an identified change"],
          source: "authoritative",
        },
        next: "a.identify",
      },
      {
        id: "a.identify",
        kind: "action",
        does: "Identify the preparation this change actually requires for this target - a backup, resource capacity, a required configuration, a pre-download, a dependency upgrade, a maintenance window, user or administrator readiness, a required approval. What is required comes from the change and the target rather than from a standard checklist, and forcing unnecessary prerequisites stalls a rollout for reasons nobody can defend",
        writes: [{ field: "rollout_log", mode: "append" }],
        next: "c.critical",
      },
      {
        id: "c.critical",
        kind: "condition",
        asks: "Are all critical dependencies ready?",
        branches: [
          {
            label: "All ready",
            when: "everything the change requires is in place on this target",
            to: "a.ready",
          },
          {
            label: "Some outstanding",
            when: "at least one critical dependency is missing",
            to: "a.hold",
          },
        ],
      },
      {
        id: "a.hold",
        kind: "action",
        does: "Hold the target and record the named blockers. A hold with an unnamed blocker is a rollout that has stopped for a reason nobody can look up, and it stays stopped until somebody investigates by hand",
        writes: [{ field: "rollout_log", mode: "append" }],
        next: "w.dependencies",
      },
      {
        id: "w.dependencies",
        kind: "wait",
        until: [
          "the named blockers clear",
          "the change becomes obsolete or is superseded",
        ],
        onEvent: "c.outcome",
        timeout: {
          after: "the schedule window this change allows for preparation",
          reason:
            "a target held indefinitely against a change that has moved on is neither in the rollout nor excluded from it, and it will be counted as neither",
        },
        onTimeout: "a.window-expired",
        windowExtendsOnEngagement: false,
      },
      {
        id: "c.outcome",
        kind: "condition",
        asks: "How did the wait resolve?",
        branches: [
          {
            label: "Blockers cleared",
            when: "every critical dependency is now in place",
            to: "a.ready",
          },
          {
            label: "The change became obsolete",
            when: "a newer version supersedes the one this target was being prepared for",
            to: "a.obsolete",
          },
        ],
      },
      {
        id: "a.obsolete",
        kind: "action",
        does: "Record the preparation as abandoned because the change it prepared for was superseded. The target returns to eligibility evaluation for whatever the current change is, rather than proceeding with the old one",
        writes: [{ field: "rollout_log", mode: "append" }],
        next: "x.obsolete",
      },
      {
        id: "x.obsolete",
        kind: "exit",
        state: "preparation abandoned; the change it was for no longer applies",
        terminal: false,
        reEntry:
          "the current change evaluates this target's eligibility on its own terms. Preparation done for the superseded version may or may not still count, and that is the new evaluation's question",
      },
      {
        id: "a.window-expired",
        kind: "action",
        does: "Record the preparation window as expired with the blockers still outstanding. The target is not failed - it was never applied to - and it stays visible as an unprepared member of the population",
        writes: [{ field: "rollout_log", mode: "append" }],
        next: "x.not-ready",
      },
      {
        id: "x.not-ready",
        kind: "exit",
        state: "preparation window expired; target eligible and not ready",
        terminal: false,
        reEntry:
          "the blockers clearing makes the target preparable again for this change or the next one",
      },
      {
        id: "a.ready",
        kind: "action",
        does: "Record CHANGE_READY. Preparation complete is not the change applied - nothing about the target has changed yet, and this readiness will be revalidated before anything does",
        writes: [{ field: "rollout_log", mode: "append" }],
        next: "h.schedule",
      },
      {
        id: "h.schedule",
        kind: "handoff",
        to: "RLT-243",
        on: "a target prepared for the change",
        carries: [
          "the target, the change version and the dependency state as it stands now",
          "the explicit fact that this readiness is a snapshot, to be revalidated at the moment of execution",
        ],
      },
    ],
    guardrails: [
      "Preparation complete is not the change applied.",
      "Unnecessary prerequisites are not forced onto a target.",
      "Current state is revalidated before execution rather than assumed from readiness.",
    ],
    reusableRule:
      "Change preparation resolves the dependencies required for execution without confusing readiness with the change itself.",
  },

  /* ------------------------------------------------------------ RLT-243 */
  {
    id: "RLT-243",
    slug: "scheduled-change",
    category: "rollout",
    goal: "scheduling-commitment",
    channels: [],
    name: "Change scheduled → wait → revalidate → execute or cancel",
    purpose:
      "Check, at the moment of execution, that the change scheduled earlier is still the right one for this target.",
    entity: {
      scope: "the scheduled change and the target it is scheduled against",
      note: "The schedule stores assumptions. They are kept so the execution can see what has moved, never so it can proceed on them.",
    },
    entry: "t.scheduled",
    nodes: [
      {
        id: "t.scheduled",
        kind: "trigger",
        event: "change_receives_scheduled_execution_window",
        evidence: {
          requires: ["a prepared target with a scheduled execution time or window"],
          source: "authoritative",
        },
        next: "a.record",
      },
      {
        id: "a.record",
        kind: "action",
        does: "Record the target, the change version, the scheduled time or window, the expected current state and the dependency assumptions. What is stored is a set of assumptions, kept so the execution can see what has moved rather than so it can proceed on them",
        writes: [{ field: "rollout_log", mode: "append" }],
        next: "w.window",
      },
      {
        id: "w.window",
        kind: "wait",
        until: [
          "the change is cancelled for this target",
          "a newer version supersedes this change",
          "the target is removed or becomes ineligible",
        ],
        onEvent: "c.preempt",
        timeout: {
          after: "the scheduled execution window",
          reason:
            "reaching the window is what the wait exists for. It is the normal outcome and the point at which every assumption is checked again",
        },
        onTimeout: "a.revalidate",
        windowExtendsOnEngagement: false,
      },
      {
        id: "c.preempt",
        kind: "condition",
        asks: "What happened before the window?",
        branches: [
          {
            label: "Cancelled, removed or made ineligible",
            when: "the target should no longer receive this change",
            to: "a.cancel",
          },
          {
            label: "Superseded",
            when: "a newer version of the change now exists",
            to: "a.superseded",
          },
        ],
      },
      {
        id: "a.cancel",
        kind: "action",
        does: "Record the schedule cancelled and stand down the job. A cancelled target revived by a stale change job receives a change nobody authorized, and on a device fleet that is discovered by the devices",
        writes: [
          { field: "rollout_log", mode: "append" },
          { field: "suppressed_sends", mode: "append" },
        ],
        next: "x.cancelled",
      },
      {
        id: "x.cancelled",
        kind: "exit",
        state: "scheduled change cancelled; the target is untouched",
        terminal: false,
        reEntry:
          "the target re-entering eligibility for this or a later change is a new evaluation rather than a revival of this schedule",
      },
      {
        id: "a.superseded",
        kind: "action",
        does: "Stand down this schedule because a newer version exists. Applying the old one after the new one is available installs a regression on purpose, and the job that did it reports success",
        writes: [
          { field: "rollout_log", mode: "append" },
          { field: "suppressed_sends", mode: "append" },
        ],
        next: "x.superseded",
      },
      {
        id: "x.superseded",
        kind: "exit",
        state: "schedule stood down; a newer change version applies to this target",
        terminal: false,
        reEntry:
          "the current version evaluates this target's eligibility and schedules on its own terms",
      },
      {
        id: "a.revalidate",
        kind: "action",
        does: "At the execution moment, revalidate the target's eligibility, its version and state, its dependencies, whether the change is still current, any required approval, and whether an incident or change hold is in force. What is checked is now - the stored assumptions are used only to see what moved",
        next: "c.valid",
      },
      {
        id: "c.valid",
        kind: "condition",
        asks: "Is the change still valid for this target?",
        branches: [
          {
            label: "Still valid",
            when: "every assumption the schedule made still holds",
            to: "h.execute",
          },
          {
            label: "No longer valid",
            when: "eligibility, state, dependencies, currency or authorization has moved",
            to: "a.suppress",
          },
        ],
      },
      {
        id: "a.suppress",
        kind: "action",
        does: "Suppress the stale change, naming exactly what changed since it was scheduled. A scheduled change is an intention rather than a guarantee, and executing on assumptions that have expired is how a target under an incident hold receives a deployment",
        writes: [
          { field: "rollout_log", mode: "append" },
          { field: "suppressed_sends", mode: "append" },
        ],
        next: "x.suppressed",
      },
      {
        id: "x.suppressed",
        kind: "exit",
        state: "stale scheduled change suppressed; the target is untouched",
        terminal: false,
        reEntry:
          "the target is re-evaluated for the current change against its current state, which is a fresh eligibility question",
      },
      {
        id: "h.execute",
        kind: "handoff",
        to: "RLT-244",
        on: "a scheduled change revalidated at its execution moment",
        carries: [
          "the target, the change version and the state it was revalidated against",
          "the explicit fact that nothing has been applied - the revalidation authorizes the attempt rather than performing it",
        ],
      },
    ],
    guardrails: [
      "Scheduled is not guaranteed execution.",
      "A superseded version invalidates the old schedule.",
      "A cancelled target is never revived by a stale change job.",
    ],
    reusableRule:
      "Scheduled changes are execution intentions whose assumptions must be revalidated at the moment the change is applied.",
  },

  /* ------------------------------------------------------------ RLT-244 */
  {
    id: "RLT-244",
    slug: "change-execution",
    category: "rollout",
    goal: "delivery-confirmation",
    channels: [],
    name: "Change execution → apply → verify, fail or unknown",
    purpose:
      "Establish that the target actually ended up in the state the change intended, rather than that a command was accepted.",
    entity: {
      scope: "the change execution against one target",
      note: "The operation carries a stable identity, so a retry re-applies the same change rather than a second one.",
    },
    distinctFrom: [
      {
        journey: "RLT-243",
        because:
          "RLT-243 decides whether to proceed. This performs the change and establishes what state the target actually reached, which is where the accepted-applied-verified distinction lives.",
      },
    ],
    entry: "t.begins",
    nodes: [
      {
        id: "t.begins",
        kind: "trigger",
        event: "authorized_change_execution_begins",
        evidence: {
          requires: ["a revalidated target authorized to receive an identified change version"],
          source: "authoritative",
        },
        next: "a.applying",
      },
      {
        id: "a.applying",
        kind: "action",
        does: "Record APPLYING with the change version and a stable operation identity for this target, so a retry re-applies the same change rather than performing a second one. Retries are normal here, and a second application is how a target ends up double-migrated",
        writes: [{ field: "rollout_log", mode: "append" }],
        next: "a.execute",
      },
      {
        id: "a.execute",
        kind: "action",
        does: "Execute the change idempotently against the target, through the canonical async and reliability primitives rather than a bespoke retry loop",
        writes: [{ field: "rollout_log", mode: "append" }],
        next: "w.result",
      },
      {
        id: "w.result",
        kind: "wait",
        until: [
          "the target reports the change applied",
          "the target reports an authoritative failure",
        ],
        onEvent: "c.applied",
        timeout: {
          after: "the execution timeout for this change and target class",
          reason:
            "a target that reports nothing is unknown rather than failed, and the difference decides whether retrying is safe",
        },
        onTimeout: "a.unknown",
        windowExtendsOnEngagement: false,
      },
      {
        id: "a.unknown",
        kind: "action",
        does: "Record CHANGE_OUTCOME_UNKNOWN and hold any retry. A timeout is not a failure - the change may well have applied, and retrying blindly applies it twice, which for firmware and schema changes is not idempotent in practice however idempotent the command is",
        writes: [
          { field: "rollout_log", mode: "append" },
          { field: "suppressed_sends", mode: "append" },
        ],
        next: "h.reconcile",
      },
      {
        id: "h.reconcile",
        kind: "handoff",
        to: "external:external-status-reconciliation",
        on: "a change whose outcome could not be established",
        carries: [
          "the target, the change version, the operation identity and everything last known",
          "the explicit instruction that no retry is attempted until the target's actual state is established",
        ],
        suppresses: ["any retry of this change against this target while its outcome is unknown"],
      },
      {
        id: "c.applied",
        kind: "condition",
        asks: "What did the target report?",
        branches: [
          {
            label: "Applied",
            when: "the target accepted and completed the change",
            to: "a.verifying",
          },
          {
            label: "Confirmed failure",
            when: "the target authoritatively rejected or failed the change",
            to: "a.failed",
          },
        ],
      },
      {
        id: "a.failed",
        kind: "action",
        does: "Record CHANGE_FAILED with exactly what the target reported. The target is on its previous version and functioning - a failed application is not a broken target",
        writes: [{ field: "rollout_log", mode: "append" }],
        next: "h.target-failure",
      },
      {
        id: "h.target-failure",
        kind: "handoff",
        to: "RLT-249",
        on: "a change that failed or left the target in an unintended state",
        carries: [
          "the target, what it reported and the state it is actually in",
          "the explicit fact that this is one target's outcome - whether it is systemic is a separate question with separate evidence",
        ],
      },
      {
        id: "a.verifying",
        kind: "action",
        does: "Record VERIFYING. The command being accepted is not the change being applied, and the change being applied is not the target being in the intended state - three states, and the middle one is where most deployment tooling stops looking",
        writes: [{ field: "rollout_log", mode: "append" }],
        next: "a.verify",
      },
      {
        id: "a.verify",
        kind: "action",
        does: "Verify the target actually reached the intended new state - the version it now reports, the configuration it now holds, the behaviour it now exhibits. What is checked is the target's state rather than the command's return code",
        writes: [{ field: "rollout_log", mode: "append" }],
        next: "c.verified",
      },
      {
        id: "c.verified",
        kind: "condition",
        asks: "Is the target in the intended state?",
        branches: [
          {
            label: "Verified",
            when: "the target reports the intended version, configuration and behaviour",
            to: "a.verified",
          },
          {
            label: "Applied, but not in the intended state",
            when: "the change went through and the target is somewhere else",
            to: "a.mismatch",
          },
          {
            label: "Cannot be verified",
            when: "the verification could not run against this target",
            to: "a.unverifiable",
          },
        ],
      },
      {
        id: "a.mismatch",
        kind: "action",
        does: "Record that the change applied and the target is not where it should be. This is worse than a clean failure, because the target is now in a state nobody designed and nothing reports it as broken",
        writes: [{ field: "rollout_log", mode: "append" }],
        next: "h.target-failure",
      },
      {
        id: "a.unverifiable",
        kind: "action",
        does: "Record that verification could not run. Unverifiable is not verified, and counting it as success is how a rollout reports a population it has never actually observed",
        writes: [{ field: "rollout_log", mode: "append" }],
        next: "h.reconcile",
      },
      {
        id: "a.verified",
        kind: "action",
        does: "Record CHANGE_APPLIED_VERIFIED with the state the target now reports. Applied and verified is still not healthy - whether the population running this change is well is a rollout-level question observed over time",
        writes: [{ field: "rollout_log", mode: "append" }],
        next: "x.verified",
      },
      {
        id: "x.verified",
        kind: "exit",
        state: "CHANGE_APPLIED_VERIFIED; the target is in the intended state",
        terminal: false,
        reEntry:
          "the target's health under the change is observed at rollout scope. A later regression on this target is a health signal rather than an execution failure",
      },
    ],
    guardrails: [
      "A command accepted is not a change applied.",
      "Applied is not healthy.",
      "A timeout is not a failure.",
      "A retry never applies the same change twice.",
    ],
    reusableRule:
      "A change is complete only after the target's intended new state has been authoritatively verified.",
  },

  /* ------------------------------------------------------------ RLT-245 */
  {
    id: "RLT-245",
    slug: "staged-rollout",
    category: "rollout",
    goal: "change-versioning",
    channels: [],
    name: "Staged rollout → pilot cohort → health gate → expand or hold",
    purpose:
      "Widen a change only when the targets that already took it show it is safe to widen.",
    entity: {
      scope: "the rollout, its target population and the cohorts it progresses through",
      note: "The cohort list is finite and explicit. Progression is bounded by it, and each step through it needs its own evidence.",
    },
    distinctFrom: [
      {
        journey: "RLT-249",
        because:
          "This is population progression - whether the next cohort may begin. RLT-249 is one target that could not take the change while the rollout is otherwise fine. Merging them turns every unreachable device into a reason to stop, or every real regression into a target exception.",
      },
    ],
    entry: "t.approved",
    nodes: [
      {
        id: "t.approved",
        kind: "trigger",
        event: "change_approved_for_staged_rollout",
        evidence: {
          requires: ["a change approved for progressive application to a defined population"],
          source: "authoritative",
        },
        next: "c.cohorts",
      },
      {
        id: "c.cohorts",
        kind: "condition",
        asks: "Are the cohort rules explicit?",
        branches: [
          {
            label: "Explicit",
            when: "the cohorts, their order and the gate each must pass are defined",
            to: "a.define",
          },
          {
            label: "Not explicit",
            when: "who is in which cohort, or what a gate requires, is not written down",
            to: "h.review",
          },
        ],
      },
      {
        id: "h.review",
        kind: "handoff",
        to: "DEC-181",
        on: "a staged rollout with implicit cohort or gate rules",
        carries: [
          "the change, the population and what is and is not defined about progression",
          "the explicit fact that implicit cohorts mean nobody can say who is next or why, and an implicit gate is a judgment made under pressure by whoever is watching",
        ],
      },
      {
        id: "a.define",
        kind: "action",
        does: "Define the cohorts and the rollout order according to policy, and the health gate each cohort must pass before the next begins. The gate is written before the first cohort deploys, because a gate written afterwards is written knowing the result",
        writes: [{ field: "rollout_log", mode: "append" }],
        next: "a.deploy",
      },
      {
        id: "a.deploy",
        kind: "action",
        does: "Deploy the current cohort. Progression is bounded by the finite cohort list - each pass through this step consumes one, so the rollout terminates rather than cycling",
        writes: [{ field: "rollout_log", mode: "append" }],
        next: "w.evidence",
      },
      {
        id: "w.evidence",
        kind: "wait",
        until: [
          "sufficient health evidence accumulates for this cohort",
          "a critical regression appears in the changed population",
        ],
        onEvent: "c.gate",
        timeout: {
          after: "the maximum observation window for this cohort",
          reason:
            "the window bounds how long a cohort may be watched, and reaching it raises the real question - whether enough was actually observed rather than merely enough time",
        },
        onTimeout: "c.sufficient",
        windowExtendsOnEngagement: false,
      },
      {
        id: "c.sufficient",
        kind: "condition",
        asks: "Was there enough evidence by the end of the window?",
        branches: [
          {
            label: "Enough",
            when: "the changed cohort produced the volume and variety of activity the gate needs to judge",
            to: "c.gate",
          },
          {
            label: "Not enough",
            when: "the cohort was quiet, or the relevant paths never ran",
            to: "a.hold",
          },
        ],
      },
      {
        id: "a.hold",
        kind: "action",
        does: "Record HOLD. Elapsed time is not evidence - a cohort that produced no traffic produced no information, and expanding because nothing alerted is expanding on the absence of a signal rather than the presence of one",
        writes: [{ field: "rollout_log", mode: "append" }],
        next: "x.holding",
      },
      {
        id: "x.holding",
        kind: "exit",
        state: "HOLD; the cohort did not produce enough evidence to judge the gate",
        terminal: false,
        reEntry:
          "evidence accumulating, or the gate being redefined for a low-traffic population, resumes progression. Nothing was reverted and nothing expanded",
      },
      {
        id: "c.gate",
        kind: "condition",
        asks: "Does the health gate pass for this cohort?",
        branches: [
          {
            label: "It passes",
            when: "failure rate, regressions, performance and business outcome are all within the gate",
            to: "c.remaining",
          },
          {
            label: "It fails",
            when: "the changed population shows a problem the gate is there to catch",
            to: "h.pause",
          },
        ],
      },
      {
        id: "h.pause",
        kind: "handoff",
        to: "RLT-246",
        on: "a health gate failing for a deployed cohort",
        carries: [
          "which gate dimension failed, on what evidence, and across which cohort",
          "the changed and unchanged populations as they currently stand",
        ],
      },
      {
        id: "c.remaining",
        kind: "condition",
        asks: "Are there cohorts left?",
        branches: [
          {
            label: "More remain",
            when: "the cohort list has entries that have not deployed",
            to: "a.deploy",
          },
          {
            label: "None",
            when: "every cohort in the list has deployed and passed its gate",
            to: "a.complete",
          },
        ],
      },
      {
        id: "a.complete",
        kind: "action",
        does: "Record the planned population as having reached the intended changed state, with the exception population named alongside it",
        writes: [{ field: "rollout_log", mode: "append" }],
        next: "h.complete",
      },
      {
        id: "h.complete",
        kind: "handoff",
        to: "RLT-250",
        on: "a rollout reaching its planned population",
        carries: [
          "the changed population, the exception targets and the gates each cohort passed",
          "the explicit fact that reaching the population is not stability - the regressions that matter tend to surface later",
        ],
      },
    ],
    guardrails: [
      "Elapsed time alone is not sufficient rollout evidence.",
      "A rollout never expands merely because no alert fired.",
      "Cohort rules and health gates are explicit and written before deployment.",
    ],
    reusableRule:
      "A staged rollout expands only when previously changed targets provide sufficient evidence that the change is safe to broaden.",
  },

  /* ------------------------------------------------------------ RLT-246 */
  {
    id: "RLT-246",
    slug: "rollout-pause",
    category: "rollout",
    goal: "recovery-retry",
    channels: [],
    name: "Rollout pause → freeze expansion → diagnose → resume, roll back or end",
    purpose:
      "Stop the change spreading while the question of what to do about it is still open.",
    entity: {
      scope: "the rollout, and the changed and unchanged populations at the moment it paused",
      note: "Both populations are preserved exactly. A pause that loses track of who has the change can neither resume nor roll back.",
    },
    entry: "t.pause",
    nodes: [
      {
        id: "t.pause",
        kind: "trigger",
        event: "rollout_pause_triggered",
        evidence: {
          requires: ["a pause threshold reached, or an authorized pause of an active rollout"],
          source: "authoritative",
        },
        next: "a.freeze",
      },
      {
        id: "a.freeze",
        kind: "action",
        does: "Record PAUSED and stop new cohort expansion. Paused is not failed - the targets already changed are still running, most of them fine, and treating a pause as a failure reverts a population that had no problem at all",
        writes: [{ field: "rollout_log", mode: "append" }],
        next: "a.preserve",
      },
      {
        id: "a.preserve",
        kind: "action",
        does: "Preserve the current changed and unchanged populations exactly as they are, and record which is which. A pause that loses track of who has the change can neither resume from where it stopped nor roll back what it applied",
        writes: [{ field: "rollout_log", mode: "append" }],
        next: "a.diagnose",
      },
      {
        id: "a.diagnose",
        kind: "action",
        does: "Diagnose the issue against the changed population rather than against the change in the abstract. What matters is whether the targets holding this change are safe, which is a different question from whether the change is good",
        writes: [{ field: "rollout_log", mode: "append" }],
        next: "c.outcome",
      },
      {
        id: "c.outcome",
        kind: "condition",
        asks: "What does the diagnosis support?",
        branches: [
          {
            label: "Resolved without rollback",
            when: "the cause was external, transient or fixed forward, and the changed targets are fine",
            to: "a.revalidate-health",
          },
          {
            label: "The already-changed targets are unsafe",
            when: "the population holding the change is at risk where it stands",
            to: "h.rollback",
          },
          {
            label: "The rollout is abandoned",
            when: "the change will not proceed, whether or not what is applied stays",
            to: "a.abandon",
          },
        ],
      },
      {
        id: "a.revalidate-health",
        kind: "action",
        does: "Revalidate health against current state before resuming. The population has moved during the pause, and resuming on the health reading that preceded it expands on evidence that is now old",
        next: "c.healthy",
      },
      {
        id: "c.healthy",
        kind: "condition",
        asks: "Is the changed population healthy now?",
        branches: [
          {
            label: "Healthy",
            when: "current evidence clears the gate the pause was raised against",
            to: "h.resume",
          },
          {
            label: "Still not healthy",
            when: "the problem persists in the current population",
            to: "h.rollback",
          },
        ],
      },
      {
        id: "h.resume",
        kind: "handoff",
        to: "RLT-245",
        on: "a pause resolved with the changed population healthy",
        carries: [
          "the current health evidence and the cohort the rollout stopped at",
          "the explicit fact that progression resumes from the preserved position rather than restarting",
        ],
      },
      {
        id: "h.rollback",
        kind: "handoff",
        to: "RLT-247",
        on: "a paused rollout whose changed population is unsafe",
        carries: [
          "the affected scope, the failure evidence and the changed population as preserved",
          "the explicit fact that a rollback decision has not been made - whether reverting is the right recovery is the next question",
        ],
      },
      {
        id: "a.abandon",
        kind: "action",
        does: "Terminate future expansion and preserve the already-applied state according to policy. Abandoning a rollout is not reverting it - a population that took the change successfully may well stay on it, and forcing everyone back costs more than the change did",
        writes: [{ field: "rollout_log", mode: "append" }],
        next: "x.abandoned",
      },
      {
        id: "x.abandoned",
        kind: "exit",
        state: "rollout abandoned; the changed population preserved as policy defines",
        terminal: false,
        reEntry:
          "the population is now split across versions deliberately, and that split is visible. A later change evaluates each target's eligibility from where it actually is",
      },
    ],
    guardrails: [
      "Paused is not failed.",
      "A pause never automatically reverts healthy targets.",
      "Resumption requires current-state revalidation rather than the reading that preceded the pause.",
    ],
    reusableRule:
      "Rollout pause freezes future expansion while leaving room to determine whether the valid next step is resume, remediation or rollback.",
  },

  /* ------------------------------------------------------------ RLT-247 */
  {
    id: "RLT-247",
    slug: "rollback-decision",
    category: "rollout",
    goal: "recovery-retry",
    channels: [],
    name: "Change failure threshold → rollback decision → execute or forward recover",
    purpose:
      "Decide whether going back is actually safer than going on, before anyone starts going back.",
    entity: {
      scope: "the failing rollout or change and the targets it affects",
      note: "Rollback is one strategy among several. Whether it is available at all depends on what the change has already made irreversible.",
    },
    distinctFrom: [
      {
        journey: "RLT-248",
        because:
          "This chooses the recovery. RLT-248 performs a rollback and verifies it. Choosing wrong here is irreversible in the other direction - a rollback across a migrated schema cannot be undone by rolling forward again.",
      },
    ],
    entry: "t.threshold",
    nodes: [
      {
        id: "t.threshold",
        kind: "trigger",
        event: "change_failure_threshold_reached",
        evidence: {
          requires: ["a defined failure threshold reached across the changed population"],
          insufficientAlone: [
            "a single target failing, which is a target-scope problem until the evidence says otherwise",
          ],
          source: "authoritative",
        },
        next: "a.stop",
      },
      {
        id: "a.stop",
        kind: "action",
        does: "Stop further rollout where the threshold requires it, before deciding anything about what is already applied",
        writes: [{ field: "rollout_log", mode: "append" }],
        next: "a.determine",
      },
      {
        id: "a.determine",
        kind: "action",
        does: "Determine the known-good prior state, the rollback capability, the irreversible side effects, the data and schema compatibility, the forward-recovery option and the affected scope",
        writes: [{ field: "rollout_log", mode: "append" }],
        next: "c.irreversible",
      },
      {
        id: "c.irreversible",
        kind: "condition",
        asks: "Has the change crossed an irreversible boundary?",
        branches: [
          {
            label: "It has not",
            when: "the previous state is genuinely reachable from where the targets are",
            to: "c.capability",
          },
          {
            label: "It has",
            when: "a schema migration, a data transformation or an external commitment has made the previous state unreachable",
            to: "a.forward-only",
          },
        ],
      },
      {
        id: "a.forward-only",
        kind: "action",
        does: "Record that rollback is not available, naming the boundary that was crossed. Rolling back across an irreversible boundary produces old code running against new data, which fails differently and worse - and the second failure is harder to diagnose because it looks like the first one returning",
        writes: [{ field: "rollout_log", mode: "append" }],
        next: "h.forward",
      },
      {
        id: "c.capability",
        kind: "condition",
        asks: "Is rollback safe and supported for the affected scope?",
        branches: [
          {
            label: "Safe for everything affected",
            when: "the whole affected population can return to the known-good state",
            to: "h.rollback",
          },
          {
            label: "Safe for a subset only",
            when: "part of the affected scope can revert and part cannot, or the failure is confined",
            to: "a.scoped",
          },
          {
            label: "Not safe or not possible",
            when: "reverting would break dependencies, data or commitments",
            to: "h.forward",
          },
        ],
      },
      {
        id: "a.scoped",
        kind: "action",
        does: "Scope the rollback to the affected subset where scoped rollback is supported. Reverting a whole population for a failure confined to one cohort takes a working change away from everybody who had no problem, and each of those reverts can fail on its own",
        writes: [{ field: "rollout_log", mode: "append" }],
        next: "h.rollback",
      },
      {
        id: "h.rollback",
        kind: "handoff",
        to: "RLT-248",
        on: "a rollback chosen as the safer recovery",
        carries: [
          "the known-good state, the exact scope to revert and the boundary the rollback must not cross",
          "the explicit fact that the rollback must be verified - a successful command is not a restored system",
        ],
      },
      {
        id: "h.forward",
        kind: "handoff",
        to: "external:operational-resolution",
        on: "a failure where rolling back is unsafe, impossible or worse than going on",
        carries: [
          "the failure, the affected scope and the boundary that makes rollback unavailable",
          "the explicit fact that the failed change stays in place and its history is preserved, so forward remediation works from a known position",
        ],
      },
    ],
    guardrails: [
      "Failure does not automatically imply rollback.",
      "A rollback is never taken across an irreversible boundary blindly.",
      "Rollback policy accounts for changed data, schema and state.",
    ],
    reusableRule:
      "Rollback is one recovery strategy and should be chosen only when returning to the previous state is safer and technically valid.",
  },

  /* ------------------------------------------------------------ RLT-248 */
  {
    id: "RLT-248",
    slug: "rollback-execution",
    category: "rollout",
    goal: "recovery-retry",
    channels: [],
    name: "Rollback execution → restore → verify stability",
    purpose:
      "Return the affected targets to a known-good state and prove that they actually work there.",
    entity: {
      scope: "the rollback operation and the targets it is reverting",
      note: "The failed change stays in the record throughout. A rollback restores state and does not erase that the change happened.",
    },
    entry: "t.authorized",
    nodes: [
      {
        id: "t.authorized",
        kind: "trigger",
        event: "rollback_authorized",
        evidence: {
          requires: ["an authorized rollback with a known-good state and a defined scope"],
          source: "authoritative",
        },
        next: "a.apply",
      },
      {
        id: "a.apply",
        kind: "action",
        does: "Apply the known-good state or version to the targets in scope, with stable operation identity so a retried rollback reverts once rather than twice",
        writes: [{ field: "rollout_log", mode: "append" }],
        next: "w.rollback",
      },
      {
        id: "w.rollback",
        kind: "wait",
        until: [
          "the targets report the rollback applied",
          "the rollback reports an authoritative failure",
        ],
        onEvent: "c.applied",
        timeout: {
          after: "the rollback window",
          reason:
            "a rollback whose outcome is unknown leaves a population that may be on either version, and every subsequent decision depends on knowing which",
        },
        onTimeout: "a.unknown",
        windowExtendsOnEngagement: false,
      },
      {
        id: "a.unknown",
        kind: "action",
        does: "Record the rollback outcome as unknown and hold further action. A population split across two versions with nobody able to say which is where is worse than either version alone",
        writes: [
          { field: "rollout_log", mode: "append" },
          { field: "suppressed_sends", mode: "append" },
        ],
        next: "h.reconcile",
      },
      {
        id: "h.reconcile",
        kind: "handoff",
        to: "external:external-status-reconciliation",
        on: "a rollback whose outcome could not be established",
        carries: [
          "the scope, the known-good state and what each target last reported",
          "the explicit instruction that nothing further is applied until the population's actual version distribution is known",
        ],
      },
      {
        id: "c.applied",
        kind: "condition",
        asks: "Did the rollback apply?",
        branches: [
          {
            label: "Applied",
            when: "the targets in scope report the known-good state",
            to: "a.verify",
          },
          {
            label: "Failed",
            when: "the rollback itself did not complete",
            to: "a.failed",
          },
        ],
      },
      {
        id: "a.failed",
        kind: "action",
        does: "Record the rollback as failed, with the population left where it is. A failed rollback is a worse position than the failure that prompted it, and it needs a person rather than another automated attempt",
        writes: [{ field: "rollout_log", mode: "append" }],
        next: "h.manual",
      },
      {
        id: "a.verify",
        kind: "action",
        does: "Verify the target state, the service or functionality, dependency compatibility, the critical health metrics, and any artifacts the change left behind that the rollback did not remove. A rollback command succeeding says the old version is installed and nothing about whether the system works - and rollbacks fail on exactly the dependency and data-shape problems that made them necessary",
        writes: [{ field: "rollout_log", mode: "append" }],
        next: "c.stable",
      },
      {
        id: "c.stable",
        kind: "condition",
        asks: "Is the rolled-back population stable?",
        branches: [
          {
            label: "Stable",
            when: "the targets are on the known-good state and functioning",
            to: "a.verified",
          },
          {
            label: "Partially rolled back",
            when: "some targets reverted and some did not",
            to: "a.partial",
          },
          {
            label: "The previous state is no longer fully recoverable",
            when: "data, commitments or side effects created under the change cannot coexist with the old version",
            to: "a.unrecoverable",
          },
        ],
      },
      {
        id: "a.partial",
        kind: "action",
        does: "Record which targets reverted and which did not. A partially rolled-back population is a split fleet, and it needs to be visible as one rather than reported as a rollback that completed",
        writes: [{ field: "rollout_log", mode: "append" }],
        next: "h.manual",
      },
      {
        id: "a.unrecoverable",
        kind: "action",
        does: "Record that some part of the prior state cannot be restored - data created under the new version, external commitments made, irreversible side effects. Restoring the old version over legitimate new data destroys it, and that is a larger loss than the failure being recovered from",
        writes: [{ field: "rollout_log", mode: "append" }],
        next: "h.forward",
      },
      {
        id: "h.forward",
        kind: "handoff",
        to: "external:operational-resolution",
        on: "a rollback that cannot fully restore the prior state",
        carries: [
          "what was restored, what cannot be, and the legitimate data or commitments that must not be overwritten",
          "the explicit fact that forward remediation is now the path and the failed change remains in the history",
        ],
      },
      {
        id: "h.manual",
        kind: "handoff",
        to: "external:human-in-the-loop-lifecycle",
        on: "a rollback that failed or completed only in part",
        carries: [
          "the exact version distribution across the affected population",
          "the explicit fact that no further automated attempt is being made against a population in an unknown or split state",
        ],
      },
      {
        id: "a.verified",
        kind: "action",
        does: "Record ROLLED_BACK_VERIFIED, preserving the failed change in the history. Rollback complete is not the deployment never having happened - the change ran, it affected things, and its record is what explains everything anybody noticed while it was live",
        writes: [{ field: "rollout_log", mode: "append" }],
        next: "x.verified",
      },
      {
        id: "x.verified",
        kind: "exit",
        state: "ROLLED_BACK_VERIFIED; population restored and the failed change preserved as history",
        terminal: false,
        reEntry:
          "a corrected change is a new rollout with its own eligibility, and this failure is part of what its gates are set against",
      },
    ],
    guardrails: [
      "Rollback complete is not the original deployment never having occurred.",
      "The failed change's history is preserved.",
      "Restoring an old version never overwrites legitimate irreversible data created after the change.",
      "A rollback is verified rather than assumed from a successful command.",
    ],
    reusableRule:
      "Rollback restores current operational state while preserving the failed change as historical truth and requiring post-rollback verification.",
  },

  /* ------------------------------------------------------------ RLT-249 */
  {
    id: "RLT-249",
    slug: "target-change-failure",
    category: "rollout",
    goal: "recovery-retry",
    channels: [],
    name: "Individual target change failure → retry, isolate or remediate",
    purpose:
      "Recover one target that could not take the change, and notice when it stops being one target.",
    entity: {
      scope: "the individual target and its failed change attempt",
      note: "Target scope by default. Promotion to rollout scope happens on evidence of a pattern rather than on the count of failures.",
    },
    distinctFrom: [
      {
        journey: "RLT-245",
        because:
          "RLT-245 governs whether the population progresses. This governs one target that fell out of it. One unreachable device is not a broken release, and treating it as one stops a rollout that was working.",
      },
    ],
    entry: "t.failed",
    nodes: [
      {
        id: "t.failed",
        kind: "trigger",
        event: "individual_target_change_failed",
        evidence: {
          requires: ["a specific target failing to take the change, or ending in an unintended state"],
          source: "authoritative",
        },
        next: "a.diagnose",
      },
      {
        id: "a.diagnose",
        kind: "action",
        does: "Diagnose the target-specific cause - compatibility, being offline or unreachable, local configuration, a resource shortage, corrupt state, a dependency mismatch. What is being established is whether this target is unusual or whether the change is",
        writes: [{ field: "rollout_log", mode: "append" }],
        next: "c.systemic",
      },
      {
        id: "c.systemic",
        kind: "condition",
        asks: "Does this failure match a pattern across other targets?",
        branches: [
          {
            label: "It matches a pattern",
            when: "the same signature, cause or class appears across targets that should have differed",
            to: "a.promote",
          },
          {
            label: "It looks target-specific",
            when: "the cause is local to this target's state or environment",
            to: "c.retry",
          },
        ],
      },
      {
        id: "a.promote",
        kind: "action",
        does: "Promote it from a target problem to a rollout problem. A failure signature appearing on forty targets is not forty individual problems, and handling them one at a time means nobody ever sees the shape of it",
        writes: [{ field: "rollout_log", mode: "append" }],
        next: "h.rollout",
      },
      {
        id: "h.rollout",
        kind: "handoff",
        to: "RLT-246",
        on: "a target failure whose pattern makes it systemic",
        carries: [
          "the shared failure signature and the targets exhibiting it",
          "the explicit fact that this reached rollout scope through evidence of a pattern rather than through a count of failures",
        ],
      },
      {
        id: "c.retry",
        kind: "condition",
        asks: "Is a retry safe and likely to help?",
        branches: [
          {
            label: "It is",
            when: "the cause was transient - unreachable, momentarily short of resource, a temporary lock",
            to: "a.retry",
          },
          {
            label: "It is not",
            when: "the cause is structural to this target and retrying will reproduce it",
            to: "c.previous",
          },
        ],
      },
      {
        id: "a.retry",
        kind: "action",
        does: "Retry against this target only, within a bounded budget and using the same operation identity so a change that actually applied is not applied twice",
        writes: [{ field: "rollout_log", mode: "append" }],
        next: "c.budget",
      },
      {
        id: "c.budget",
        kind: "condition",
        asks: "Does retry budget remain?",
        branches: [
          {
            label: "Budget remains",
            when: "this target has attempts left",
            to: "x.retrying",
          },
          {
            label: "Exhausted",
            when: "the attempts this target allows have been used",
            to: "c.previous",
          },
        ],
      },
      {
        id: "x.retrying",
        kind: "exit",
        state: "retrying against this target only; the rollout is unaffected",
        terminal: false,
        reEntry:
          "each attempt reports its own outcome and returns here with the budget one lower. Retrying is bounded rather than continuous",
      },
      {
        id: "c.previous",
        kind: "condition",
        asks: "Can this target safely remain on the previous version?",
        branches: [
          {
            label: "It can",
            when: "the previous version is supported, secure and compatible for this target",
            to: "a.exception",
          },
          {
            label: "It cannot",
            when: "staying behind leaves the target unsupported, insecure or incompatible",
            to: "a.must-upgrade",
          },
        ],
      },
      {
        id: "a.exception",
        kind: "action",
        does: "Record TARGET_EXCEPTION. The exception population stays explicitly visible - a rollout reporting complete while quietly leaving targets behind produces a version distribution nobody can account for, and the forgotten targets are the ones that break in six months with nobody remembering why they are different",
        writes: [{ field: "rollout_log", mode: "append" }],
        next: "x.exception",
      },
      {
        id: "x.exception",
        kind: "exit",
        state: "TARGET_EXCEPTION; on the previous version, visible and countable",
        terminal: false,
        reEntry:
          "the blocking cause clearing makes the target eligible again, and it is picked up by this change or the next one rather than staying behind permanently",
      },
      {
        id: "a.must-upgrade",
        kind: "action",
        does: "Record that this target cannot stay behind and cannot proceed unattended, with what is blocking it. Leaving it as an exception when it cannot safely be one is how a target ends up unsupported without anybody deciding that it should be",
        writes: [{ field: "rollout_log", mode: "append" }],
        next: "h.remediate",
      },
      {
        id: "h.remediate",
        kind: "handoff",
        to: "external:human-in-the-loop-lifecycle",
        on: "a target that must take the change and cannot",
        carries: [
          "the target, its diagnosis and why remaining on the previous version is not acceptable",
          "the explicit fact that automated attempts are exhausted and the rollout itself is unaffected",
        ],
      },
    ],
    guardrails: [
      "One target failure is not a rollout failure.",
      "Retries are bounded rather than indefinite.",
      "The exception population remains observable and countable.",
      "Promotion to systemic happens on pattern evidence rather than on failure count.",
    ],
    reusableRule:
      "Individual change failures should be recovered at target scope until evidence shows that the problem is systemic.",
  },

  /* ------------------------------------------------------------ RLT-250 */
  {
    id: "RLT-250",
    slug: "change-completion",
    category: "rollout",
    goal: "progression-milestone",
    channels: [],
    name: "Change completed → observe → close, reopen or deprecate previous version",
    purpose:
      "Wait long enough to know the change held, and keep what a recovery would need until it clearly does not.",
    entity: {
      scope: "the completed rollout, the changed population and the exception targets",
      note: "Completion and stability are different claims. The previous version stays available until both the recovery and the audit requirements are satisfied.",
    },
    entry: "t.reached",
    nodes: [
      {
        id: "t.reached",
        kind: "trigger",
        event: "planned_population_reached_changed_state",
        evidence: {
          requires: ["the planned target population having reached the intended changed state"],
          insufficientAlone: [
            "a rollout dashboard reporting complete, which reports coverage rather than health",
          ],
          source: "authoritative",
        },
        next: "c.observation",
      },
      {
        id: "c.observation",
        kind: "condition",
        asks: "Does this change require post-change observation?",
        branches: [
          {
            label: "It does",
            when: "the change touches behaviour, data or paths whose problems surface over time",
            to: "a.observe",
          },
          {
            label: "It does not",
            when: "the change is fully exercised at application and nothing further can emerge",
            to: "a.stable",
          },
        ],
      },
      {
        id: "a.observe",
        kind: "action",
        does: "Record the change as applied and under observation. Deployment completion is not long-term stability - the regressions that matter most surface on a weekly cycle, at month-end, or the first time a rare path runs, all of them after the rollout dashboard turned green",
        writes: [{ field: "rollout_log", mode: "append" }],
        next: "w.observe",
      },
      {
        id: "w.observe",
        kind: "wait",
        until: [
          "a regression appears in the changed population",
          "a critical failure appears",
        ],
        onEvent: "c.regression",
        timeout: {
          after: "the post-change observation window",
          reason:
            "the window is the point of the wait - reaching it without a material regression is what makes the change stable rather than merely deployed",
        },
        onTimeout: "a.stable",
        windowExtendsOnEngagement: false,
      },
      {
        id: "c.regression",
        kind: "condition",
        asks: "Is the regression material?",
        branches: [
          {
            label: "Material",
            when: "it affects correctness, availability or a business outcome the gate was protecting",
            to: "h.reopen",
          },
          {
            label: "Not material",
            when: "it is noise, or a known issue already accounted for",
            to: "w.observe",
          },
        ],
      },
      {
        id: "h.reopen",
        kind: "handoff",
        to: "RLT-246",
        on: "a late material regression in a completed change",
        carries: [
          "the regression, when it appeared and across which part of the changed population",
          "the explicit fact that the rollout is complete, so pausing expansion is not the remedy - the question is what to do with a population that already has it",
        ],
      },
      {
        id: "a.stable",
        kind: "action",
        does: "Record CHANGE_STABLE, and record the exception population explicitly alongside it. A change reported stable while its exceptions are invisible produces a version distribution nobody can account for, and every later change inherits that ambiguity",
        writes: [{ field: "rollout_log", mode: "append" }],
        next: "c.deprecate",
      },
      {
        id: "c.deprecate",
        kind: "condition",
        asks: "Can the previous version now be deprecated?",
        branches: [
          {
            label: "It can",
            when: "no target remains on it, and the recovery and audit retention it was held for is satisfied",
            to: "h.deprecate",
          },
          {
            label: "Not yet",
            when: "recovery or audit still depends on it, or exception targets are still running it",
            to: "a.retain",
          },
        ],
      },
      {
        id: "a.retain",
        kind: "action",
        does: "Retain the previous version and the state a recovery would need, with the condition that would release it. Deleting it because the rollout completed removes the only thing a late rollback could restore from, and late is exactly when rollbacks are actually needed",
        writes: [{ field: "rollout_log", mode: "append" }],
        next: "x.stable",
      },
      {
        id: "x.stable",
        kind: "exit",
        state: "CHANGE_STABLE; previous version retained and exception targets named",
        terminal: false,
        reEntry:
          "the retention condition being satisfied allows the previous version to be retired on its own terms. A later regression reopens recovery against a population that still has somewhere to go back to",
      },
      {
        id: "h.deprecate",
        kind: "handoff",
        to: "external:termination-lifecycle",
        on: "a previous version nothing depends on any longer",
        carries: [
          "the version, the confirmation that no target runs it and that retention is satisfied",
          "the change lineage, which stays auditable regardless of whether the artifact is retired",
        ],
      },
    ],
    guardrails: [
      "Deployment completion is not long-term stability.",
      "A previous version or state required for recovery or audit is not deleted immediately.",
      "Exception targets remain explicit in the completion record.",
    ],
    reusableRule:
      "Change lifecycle closes only after the applied population demonstrates sufficient stability and remaining version dependencies are resolved.",
  },
];
