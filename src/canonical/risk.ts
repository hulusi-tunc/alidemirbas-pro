import type { CanonicalJourney, OrchestrationRule } from "./types";

/* CATEGORY 20 - RISK, POLICY, COMPLIANCE & EXCEPTION MANAGEMENT

   This is the category that stops things. Which makes it the one where being
   wrong is most expensive in both directions: a control that does not fire
   lets through what it existed to catch, and a control that fires wrongly
   lands on someone who did nothing, usually with no way to say so.

   Almost every failure here is the same move - a piece of evidence promoted
   into a fact. A signal read as misconduct. A limit read as abuse. A rule
   breached read as intent. A block read as a verdict. Each promotion feels
   like caution and is actually a claim the evidence does not support, and the
   person it lands on has no visible route back because nothing in the record
   says what would clear it.

   So the discipline is: name what you actually have, restrict no wider than
   what you have justifies, and always write down what would release it.

     signal         something was measured
     correlated     it was read against context
     material       the combined evidence crossed a defined threshold
     restricted     the smallest sufficient thing was stopped
     resolved       evidence or judgment released it

     rule applies   a policy governs this action
     evaluated      against the version effective at the time
     blocked        a requirement was not met
     violated       a rule was broken, which is still not intent

   And two mechanisms that exist to keep policy honest rather than absolute:
   an exception, which overrides one decision inside a stated scope without
   disabling the rule, and effective-time semantics, which stop a policy
   released today from making everybody retroactively non-compliant.

   Judgment itself is not reimplemented here. Where a rule runs out, this
   category hands to the decision engine - the mechanism the previous category
   built for exactly that. */

export const RISK_RULES: readonly OrchestrationRule[] = [
  {
    id: "RSK-R1",
    scope: "risk",
    rule: "Policy evaluation, risk assessment and compliance verification are three separate mechanisms.",
    because:
      "A rule applying, a probability being high and an obligation being unmet are different claims with different evidence and different remedies. Merging them produces blocks nobody can explain.",
  },
  {
    id: "RSK-R2",
    scope: "risk",
    rule: "Risk signals are evidence rather than confirmed facts.",
    because:
      "A signal is a measurement of something correlated with a problem. Promoting it to the problem itself is the single most common failure in this category.",
  },
  {
    id: "RSK-R3",
    scope: "risk",
    rule: "A policy violation and malicious intent are never treated as synonyms.",
    because:
      "Most violations are configuration, misunderstanding, or a rule nobody read. Applying a misconduct consequence to them costs a relationship the evidence never justified losing.",
  },
  {
    id: "RSK-R4",
    scope: "risk",
    rule: "Restrictions use the smallest sufficient scope.",
    because:
      "An anomaly on one payment method is not a reason to freeze an account. Over-broad restriction is indistinguishable from an outage to the person it lands on.",
  },
  {
    id: "RSK-R5",
    scope: "risk",
    rule: "Temporary holds and restrictions are separate states from terminal decisions.",
    because:
      "A system that cannot tell them apart never releases anything - every precaution becomes permanent by nobody's decision.",
  },
  {
    id: "RSK-R6",
    scope: "risk",
    rule: "Compliance requirements block only the processes that depend on them.",
    because:
      "One unmet requirement stopping everything an entity can do turns a specific obligation into a general suspension, which nobody authorized and nobody can lift.",
  },
  {
    id: "RSK-R7",
    scope: "risk",
    rule: "Existing valid evidence is reused where it satisfies the required compliance scope.",
    because:
      "Asking again for what is already held and still valid is the most common reason people abandon a process at the compliance step.",
  },
  {
    id: "RSK-R8",
    scope: "risk",
    rule: "Policy exceptions require explicit authority.",
    because:
      "A rule that can be excepted by asking is not a rule, and some of them exist precisely because they cannot be set aside by the person they inconvenience.",
  },
  {
    id: "RSK-R9",
    scope: "risk",
    rule: "Exception request, approval and application are three separate stages.",
    because:
      "An approved exception applied to the wrong action, the wrong entity or the wrong moment is a deviation nobody authorized wearing the paperwork of one that was.",
  },
  {
    id: "RSK-R10",
    scope: "risk",
    rule: "Exceptions modify a policy outcome within a defined scope and never disable the underlying policy.",
    because:
      "The rule still governs everything the exception does not name. An exception that disables the rule turns one approved deviation into a general practice.",
  },
  {
    id: "RSK-R11",
    scope: "risk",
    rule: "Exception expiry and revocation prevent stale future use.",
    because:
      "A queued job holding an exception id will apply it long after the authority lapsed, and the override looks identical to a valid one.",
  },
  {
    id: "RSK-R12",
    scope: "risk",
    rule: "Limits and quotas are operational constraints and do not by themselves prove abuse.",
    because:
      "Reaching a limit is the limit working. Routing it into a risk queue puts ordinary heavy users in front of a fraud analyst.",
  },
  {
    id: "RSK-R13",
    scope: "risk",
    rule: "Limit increases use explicit change, approval or exception mechanisms.",
    because:
      "A silently raised limit is a control that was removed without a decision, and nobody can say when or on whose authority.",
  },
  {
    id: "RSK-R14",
    scope: "risk",
    rule: "Human judgment reuses the decision mechanisms of DEC-181 to DEC-190 rather than duplicating approval machinery.",
    because:
      "A second approval engine inside risk will drift from the first - different SLAs, different escalation, different audit trail - and the drift is discovered during an audit of both.",
  },
  {
    id: "RSK-R15",
    scope: "risk",
    rule: "Identity verification reuses IDN-81 to IDN-90 rather than creating compliance-specific duplicates.",
    because:
      "A parallel identity check will disagree with the canonical one, and there is no principled way to decide which of two verified states is the real one.",
  },
  {
    id: "RSK-R16",
    scope: "risk",
    rule: "Capability restriction and restoration reuse ACC-71 to ACC-80.",
    because:
      "What is switched off and how is owned by the access lifecycle. Risk owns why and until when, and implementing the other half here produces two sources of truth for one door.",
  },
  {
    id: "RSK-R17",
    scope: "risk",
    rule: "Policy changes carry explicit effective-time semantics.",
    because:
      "Whether a new rule reaches work already in flight is a decision, and defaulting either way is wrong for about half of all changes.",
  },
  {
    id: "RSK-R18",
    scope: "risk",
    rule: "New rules never silently rewrite historical decisions.",
    because:
      "An action validly completed under the policy that governed it stays valid. Rewriting the record on a policy release destroys the evidence that anything ever complied.",
  },
  {
    id: "RSK-R19",
    scope: "risk",
    rule: "Risk and policy state changes trigger only the affected re-evaluation.",
    because:
      "A policy update that restarts every journey is indistinguishable from an outage, and it buries the cases the change was genuinely about.",
  },
  {
    id: "RSK-R20",
    scope: "risk",
    rule: "Evidence, policy version, decision authority and restriction history stay auditable.",
    because:
      "A risk state whose basis cannot be shown cannot be appealed, explained or corrected - and this is the category most likely to be asked to show its working.",
  },
];

export const RISK_JOURNEYS: readonly CanonicalJourney[] = [
  /* ------------------------------------------------------------ RSK-191 */
  {
    id: "RSK-191",
    slug: "policy-evaluation",
    category: "risk",
    name: "Policy check → evaluate → pass, block or review",
    purpose:
      "Decide whether a specific action is permitted under the rules that actually govern it, at the version that actually applies.",
    entity: {
      scope: "the policy evaluation, the actor or entity it concerns, and the proposed action",
      note: "One evaluation per action per decision point. It is a question about this action rather than a standing judgment about the entity.",
    },
    distinctFrom: [
      {
        journey: "DEC-181",
        because:
          "This applies rules. DEC-181 opens a workflow for judgment where no rule produces the answer - which is why this journey's third outcome is to hand over rather than to guess.",
      },
    ],
    entry: "t.point",
    nodes: [
      {
        id: "t.point",
        kind: "trigger",
        event: "protected_action_reaches_policy_decision_point",
        evidence: {
          requires: ["a proposed action that policy governs, arriving at the point where it is decided"],
          insufficientAlone: [
            "a risk score, which estimates likelihood rather than establishing whether a rule permits something",
          ],
          source: "authoritative",
        },
        next: "a.applicable",
      },
      {
        id: "a.applicable",
        kind: "action",
        does: "Determine the applicable policy set from the action, the entity, the context, the effective time, the jurisdiction or domain where one is defined, and the current authoritative state. Which rules apply is a fact about this action rather than a global list run against everything",
        writes: [{ field: "policy_log", mode: "append" }],
        next: "c.version",
      },
      {
        id: "c.version",
        kind: "condition",
        asks: "Is the policy version effective for this action and time determinable?",
        branches: [
          {
            label: "Determinable",
            when: "the applicable version and its effective period are authoritatively known",
            to: "a.evaluate",
          },
          {
            label: "Not determinable",
            when: "which version governs this action cannot be established",
            to: "a.undetermined",
          },
        ],
      },
      {
        id: "a.undetermined",
        kind: "action",
        does: "Record that the governing policy version could not be established, and evaluate nothing. Picking the current version because it is the one to hand judges an action by a rule that may not have existed when it was taken",
        writes: [{ field: "policy_log", mode: "append" }],
        next: "h.review",
      },
      {
        id: "a.evaluate",
        kind: "action",
        does: "Evaluate the requirements of that version against the facts. What is evaluated is a rule against a fact - a risk score is not a policy check, and substituting one produces a block whose reason nobody can state to the person it lands on",
        writes: [{ field: "policy_log", mode: "append" }],
        next: "c.outcome",
      },
      {
        id: "c.outcome",
        kind: "condition",
        asks: "What did the rules determine?",
        branches: [
          {
            label: "Every requirement satisfied",
            when: "the applicable rules permit the action",
            to: "a.pass",
          },
          {
            label: "An explicit blocking condition applies",
            when: "a requirement is unmet or a prohibition applies",
            to: "a.block",
          },
          {
            label: "The rules do not determine it",
            when: "no deterministic outcome follows from the applicable policy",
            to: "a.review-required",
          },
        ],
      },
      {
        id: "a.pass",
        kind: "action",
        does: "Record POLICY_PASS with the version evaluated and what was checked. The record is what makes the pass auditable later - a permitted action with no evaluation behind it cannot be defended",
        writes: [{ field: "policy_log", mode: "append" }],
        next: "x.pass",
      },
      {
        id: "x.pass",
        kind: "exit",
        state: "POLICY_PASS for this action under the version evaluated",
        terminal: false,
        reEntry:
          "a later action is evaluated on its own terms. This pass is not a standing clearance and does not carry to anything else",
      },
      {
        id: "a.block",
        kind: "action",
        does: "Record POLICY_BLOCK with the rule, its version and the requirement that failed. A block is a rule applying and says nothing about intent - recording it as suspicion attaches a reputation to somebody who hit a threshold",
        writes: [{ field: "policy_log", mode: "append" }],
        next: "x.block",
      },
      {
        id: "x.block",
        kind: "exit",
        state: "POLICY_BLOCK; this action is not permitted under the applicable rule",
        terminal: false,
        reEntry:
          "the requirement being satisfied, or an authorized exception being granted for it, makes the same action evaluable again. The block concerns this attempt under this version and nothing wider",
      },
      {
        id: "a.review-required",
        kind: "action",
        does: "Record REVIEW_REQUIRED. This is the rules running out rather than a violation being found: nothing has been decided, nothing has been refused, and reporting it to the requester as a rejection is untrue",
        writes: [{ field: "policy_log", mode: "append" }],
        next: "h.review",
      },
      {
        id: "h.review",
        kind: "handoff",
        to: "DEC-181",
        on: "an action policy cannot determine, or whose governing version cannot be established",
        carries: [
          "the action, the policy set considered and exactly where the rules stopped",
          "the explicit fact that no outcome was invented and nothing has been refused",
        ],
      },
    ],
    guardrails: [
      "A policy check is not a risk score.",
      "A policy block is not evidence of malicious behaviour.",
      "Policy requirements are never invented.",
      "Evaluation uses the policy version effective for the relevant action and time.",
    ],
    reusableRule:
      "Policy evaluation determines whether a specific action is permitted under the rules applicable to that action's current context.",
  },

  /* ------------------------------------------------------------ RSK-192 */
  {
    id: "RSK-192",
    slug: "risk-signal",
    category: "risk",
    name: "Risk signal → correlate evidence → clear, monitor, restrict or review",
    purpose:
      "Turn a measurement into a state change no larger than the evidence behind it supports.",
    entity: {
      scope: "the risk case and the actor, account, transaction or resource it concerns",
      note: "One case per correlated risk, accumulating signals. A case that opens per signal produces a queue of fragments nobody can assess together.",
    },
    distinctFrom: [
      {
        journey: "IDN-90",
        because:
          "IDN-90 handles a specific suspicion - that an account is in someone else's hands - and runs a containment and recovery path for it. This is the general evidence lifecycle: most of what it sees clears, and its main job is not over-reacting.",
      },
    ],
    entry: "t.signal",
    nodes: [
      {
        id: "t.signal",
        kind: "trigger",
        event: "risk_signal_received",
        evidence: {
          requires: [
            "a meaningful risk signal - a behaviour or velocity anomaly, an identity inconsistency, a transaction anomaly, a device or context signal, an external risk signal, or repeated unusual activity",
          ],
          insufficientAlone: [
            "unusual behaviour, which is unusual and not therefore wrong",
            "a single threshold crossing, which is a reading rather than a finding",
          ],
          source: "inferred",
        },
        next: "a.correlate",
      },
      {
        id: "a.correlate",
        kind: "action",
        does: "Correlate the signal with the authoritative context that bears on it - the actor's history, the state of the thing it concerns, other live signals, and what this signal is actually measuring. A model output is an estimate about a person and never a fact about them",
        writes: [{ field: "risk_log", mode: "append" }],
        next: "c.benign",
      },
      {
        id: "c.benign",
        kind: "condition",
        asks: "Is the signal clearly benign in context?",
        branches: [
          {
            label: "Benign or a known false positive",
            when: "the context explains it entirely",
            to: "a.clear",
          },
          {
            label: "Not explained away",
            when: "the context does not account for it",
            to: "c.evidence",
          },
        ],
      },
      {
        id: "a.clear",
        kind: "action",
        does: "Record CLEAR with the reason. Clearing is a fact worth keeping - the same signal will fire again on the same behaviour, and a system that never records the clear re-investigates it every time and eventually acts on the repetition",
        writes: [{ field: "risk_log", mode: "append" }],
        next: "x.cleared",
      },
      {
        id: "x.cleared",
        kind: "exit",
        state: "CLEAR; no risk state was created and nothing was restricted",
        terminal: false,
        reEntry:
          "a materially different signal opens its own assessment. The recorded clear is context for it rather than an exemption from it",
      },
      {
        id: "c.evidence",
        kind: "condition",
        asks: "What does the combined evidence support?",
        branches: [
          {
            label: "Below any defined threshold",
            when: "the evidence is real and does not reach what policy requires for action",
            to: "a.monitor",
          },
          {
            label: "A deterministic rule requires blocking",
            when: "a governing rule, rather than an assessment, produces the outcome",
            to: "a.rule-block",
          },
          {
            label: "A material threshold is reached",
            when: "the combined evidence crosses a defined threshold requiring intervention",
            to: "a.case",
          },
        ],
      },
      {
        id: "a.monitor",
        kind: "action",
        does: "Record MONITOR and take no restrictive action. Watching is a state in its own right; restricting on one weak signal is a decision the evidence does not support, and the person it lands on did nothing to earn it",
        writes: [{ field: "risk_log", mode: "append" }],
        next: "x.monitoring",
      },
      {
        id: "x.monitoring",
        kind: "exit",
        state: "MONITOR; evidence accumulating, nothing restricted",
        terminal: false,
        reEntry:
          "further signals accumulate onto this case and are assessed together, which is the point of holding it open rather than closing and reopening",
      },
      {
        id: "a.rule-block",
        kind: "action",
        does: "Record the rule that applies and its outcome. This is a rule applying rather than an assessment being made, and the two are recorded differently because only one of them can be argued with",
        writes: [{ field: "risk_log", mode: "append" }],
        next: "h.restrict",
      },
      {
        id: "a.case",
        kind: "action",
        does: "Record the risk case with its evidence and the provenance of each piece. A risk state whose basis cannot be shown cannot be appealed, explained or corrected - and this is exactly the state someone will eventually ask us to justify",
        writes: [{ field: "risk_log", mode: "append" }],
        next: "c.route",
      },
      {
        id: "c.route",
        kind: "condition",
        asks: "What does the evidence call for?",
        branches: [
          {
            label: "A scoped precautionary restriction",
            when: "the risk is material enough that acting now is proportionate to the evidence",
            to: "h.restrict",
          },
          {
            label: "Judgment before any restriction",
            when: "the evidence is material and the right response is not something a rule determines",
            to: "h.review",
          },
        ],
      },
      {
        id: "h.restrict",
        kind: "handoff",
        to: "RSK-193",
        on: "risk evidence warranting a scoped restriction",
        carries: [
          "the correlated evidence, its provenance and the specific scope the risk touches",
          "the explicit fact that this is evidence rather than confirmed misconduct, which bounds how wide the restriction may be",
        ],
      },
      {
        id: "h.review",
        kind: "handoff",
        to: "DEC-181",
        on: "material risk evidence needing authorized judgment",
        carries: [
          "the full evidence and its provenance, so the reviewer sees what the model saw",
          "the explicit fact that nothing has been restricted and no conclusion has been drawn about the actor",
        ],
      },
    ],
    guardrails: [
      "A signal is not confirmed misconduct.",
      "A risk score is not a factual identity.",
      "One weak signal never triggers maximum restriction.",
      "Evidence and its provenance are preserved so the reasoning can be shown.",
    ],
    reusableRule:
      "Risk signals should change state only in proportion to the combined evidence and the policy-defined consequence of that evidence.",
  },

  /* ------------------------------------------------------------ RSK-193 */
  {
    id: "RSK-193",
    slug: "risk-restriction",
    category: "risk",
    name: "Risk threshold crossed → apply scoped restriction → review or release",
    purpose:
      "Stop the smallest thing that manages the risk, and keep a stated route back.",
    entity: {
      scope: "the risk case and the specific capability or action being restricted",
      note: "The restriction is scoped to the risk. Risk owns why and until when; the access lifecycle owns what is actually switched off.",
    },
    distinctFrom: [
      {
        journey: "ACC-78",
        because:
          "This determines what restriction the risk justifies and holds the release condition. ACC-78 applies and restores the access state. One is the reason, the other is the door.",
      },
    ],
    entry: "t.threshold",
    nodes: [
      {
        id: "t.threshold",
        kind: "trigger",
        event: "risk_threshold_requiring_intervention_reached",
        evidence: {
          requires: ["a defined risk threshold reached, with the correlated evidence behind it"],
          source: "authoritative",
        },
        next: "a.scope",
      },
      {
        id: "a.scope",
        kind: "action",
        does: "Determine the risk's scope, the specific action or capability implicated, the authority for restricting it, and the duration or review condition where one is defined. A restriction with no stated release condition has no way out and becomes permanent by nobody's decision",
        writes: [{ field: "risk_log", mode: "append" }],
        next: "c.authority",
      },
      {
        id: "c.authority",
        kind: "condition",
        asks: "Is there authority to apply this restriction?",
        branches: [
          {
            label: "Authorized",
            when: "a policy or a granted authority permits restricting this scope on this evidence",
            to: "a.minimum",
          },
          {
            label: "Not established",
            when: "no policy or authority covers restricting this",
            to: "h.review",
          },
        ],
      },
      {
        id: "a.minimum",
        kind: "action",
        does: "Choose the smallest restriction sufficient for the identified risk - a hold on the specific transaction, a block on the specific capability, an additional verification, a manual approval requirement, or a bounded access restriction. The restriction's scope matches the risk's scope: an anomaly on one payment method is not a reason to close an account",
        writes: [{ field: "risk_log", mode: "append" }],
        next: "c.type",
      },
      {
        id: "c.type",
        kind: "condition",
        asks: "Could additional verification resolve this on its own?",
        branches: [
          {
            label: "Verification would resolve it",
            when: "the risk is about who is acting, and proving it would answer the question",
            to: "a.step-up",
          },
          {
            label: "A restriction is needed regardless",
            when: "the risk is not one a challenge answers",
            to: "a.apply",
          },
        ],
      },
      {
        id: "a.step-up",
        kind: "action",
        does: "Raise the step-up requirement through the authentication lifecycle, which owns the challenge. This journey keeps the restriction and the release condition, because a passed challenge has to release something and the challenge itself cannot know what",
        writes: [{ field: "risk_log", mode: "append" }],
        next: "a.apply",
      },
      {
        id: "a.apply",
        kind: "action",
        does: "Raise the restriction through the access and capability lifecycle, which owns what is switched off and how. Record it as temporary and reviewable - a temporary restriction is not a final adverse decision, and a system that cannot tell the two apart never releases anything it has stopped",
        writes: [{ field: "risk_log", mode: "append" }],
        next: "w.resolution",
      },
      {
        id: "w.resolution",
        kind: "wait",
        until: [
          "the risk clears or the required evidence arrives",
          "a review concludes",
          "a terminal decision is taken",
        ],
        onEvent: "c.outcome",
        timeout: {
          after: "the review condition or maximum restriction duration policy defines",
          reason:
            "a restriction nobody revisits becomes a termination without a decision, and the person under it has no way to tell the difference",
        },
        onTimeout: "h.review",
        windowExtendsOnEngagement: false,
      },
      {
        id: "c.outcome",
        kind: "condition",
        asks: "How did the restriction resolve?",
        branches: [
          {
            label: "Cleared",
            when: "the risk cleared, or the evidence required to release it arrived",
            to: "a.release",
          },
          {
            label: "A terminal decision was taken",
            when: "an authorized decision ends the relationship or the capability permanently",
            to: "h.terminal",
          },
          {
            label: "Judgment is needed on what happens next",
            when: "the evidence has not cleared and the next step is not one a rule determines",
            to: "h.review",
          },
        ],
      },
      {
        id: "a.release",
        kind: "action",
        does: "Release the restriction and raise the capability restoration through the access lifecycle, rebuilt from current entitlements rather than from a snapshot taken when the restriction went on. A restriction that outlasted a term or an entitlement does not restore what expired underneath it",
        writes: [{ field: "risk_log", mode: "append" }],
        next: "x.released",
      },
      {
        id: "x.released",
        kind: "exit",
        state: "restriction released; the risk case closes with what cleared it recorded",
        terminal: false,
        reEntry:
          "new evidence opens a new assessment. The record of what cleared this one is what stops the same evidence being re-litigated",
      },
      {
        id: "h.review",
        kind: "handoff",
        to: "DEC-181",
        on: "a restriction needing authorized judgment - to apply, to continue or to lift",
        carries: [
          "the evidence, its provenance and the restriction currently in force",
          "the explicit fact that this is a temporary state rather than an adverse finding, and that no conclusion about the actor has been reached",
        ],
      },
      {
        id: "h.terminal",
        kind: "handoff",
        to: "external:termination-lifecycle",
        on: "an authorized terminal decision on a risk case",
        carries: [
          "the decision, its authority and the evidence it was made on",
          "the explicit fact that the restriction history and its basis are preserved rather than replaced by the outcome",
        ],
      },
    ],
    guardrails: [
      "Restriction scope matches risk scope.",
      "Unrelated capabilities are never terminated without a policy basis.",
      "A temporary restriction is not a final adverse decision.",
      "Every restriction states the condition that would release it.",
    ],
    reusableRule:
      "Risk controls should constrain only the activity necessary to manage the identified risk while preserving a path to evidence-based resolution.",
  },

  /* ------------------------------------------------------------ RSK-194 */
  {
    id: "RSK-194",
    slug: "policy-violation",
    category: "risk",
    name: "Policy violation detected → validate → correct, restrict or escalate",
    purpose:
      "Establish that a rule was actually broken, against the version that governed it, before anything follows from that.",
    entity: {
      scope: "the violation case, the entity or action it concerns, and the policy version it is judged under",
      note: "The version is part of the entity. A case that does not carry which rule it is about cannot be assessed and cannot be defended.",
    },
    distinctFrom: [
      {
        journey: "DEC-186",
        because:
          "DEC-186 handles what follows an authorized rejection. This determines whether a violation occurred at all and which consequence the policy defines - it may never reach a decision case, and most of its outcomes are corrections rather than refusals.",
      },
    ],
    entry: "t.detected",
    nodes: [
      {
        id: "t.detected",
        kind: "trigger",
        event: "potential_policy_violation_detected",
        evidence: {
          requires: ["an action or state that appears to breach an identifiable policy"],
          insufficientAlone: [
            "a risk signal, which is evidence about likelihood rather than about a rule having been broken",
            "an unusual pattern, which is not a rule",
          ],
          source: "inferred",
        },
        next: "a.identify",
      },
      {
        id: "a.identify",
        kind: "action",
        does: "Identify the policy, the version effective at the time of the suspected action, the action itself, the evidence and the affected scope",
        writes: [{ field: "policy_log", mode: "append" }],
        next: "c.version",
      },
      {
        id: "c.version",
        kind: "condition",
        asks: "Which policy version governs the suspected action?",
        branches: [
          {
            label: "The version effective when it occurred",
            when: "the action falls under a determinable historical version",
            to: "a.evaluate",
          },
          {
            label: "A later version, where governing rules explicitly say so",
            when: "a rule expressly applies a newer version to past actions",
            to: "a.evaluate-retro",
          },
          {
            label: "Not determinable",
            when: "which version governs cannot be established",
            to: "h.review",
          },
        ],
      },
      {
        id: "a.evaluate-retro",
        kind: "action",
        does: "Record that a later version is being applied retroactively, and the rule that permits it. Judging a past action by a rule that did not exist then is something a governing rule has to say explicitly - doing it by default makes everybody historically non-compliant on the day a policy changes",
        writes: [{ field: "policy_log", mode: "append" }],
        next: "a.evaluate",
      },
      {
        id: "a.evaluate",
        kind: "action",
        does: "Evaluate the evidence against the applicable version's requirements",
        writes: [{ field: "policy_log", mode: "append" }],
        next: "c.confirmed",
      },
      {
        id: "c.confirmed",
        kind: "condition",
        asks: "Is the violation confirmed under the applicable version?",
        branches: [
          {
            label: "Confirmed",
            when: "the evidence establishes the rule was breached",
            to: "a.classify",
          },
          {
            label: "Not confirmed",
            when: "the evidence does not establish a breach of the applicable version",
            to: "a.clear",
          },
        ],
      },
      {
        id: "a.clear",
        kind: "action",
        does: "Record no violation, with the version evaluated. Detection is not confirmation, and a cleared case is worth keeping because the same detection will fire on the same behaviour again",
        writes: [{ field: "policy_log", mode: "append" }],
        next: "x.cleared",
      },
      {
        id: "x.cleared",
        kind: "exit",
        state: "no violation under the applicable policy version",
        terminal: false,
        reEntry:
          "a different action, or a policy change with explicit retroactive reach, is assessed on its own terms rather than by re-running this one",
      },
      {
        id: "a.classify",
        kind: "action",
        does: "Classify the severity and the correctable scope. A violation is not intent - most are configuration, misunderstanding or a rule nobody read, and applying a misconduct consequence to them costs a relationship the evidence never justified losing",
        writes: [{ field: "policy_log", mode: "append" }],
        next: "c.consequence",
      },
      {
        id: "c.consequence",
        kind: "condition",
        asks: "What consequence does the governing policy define?",
        branches: [
          {
            label: "A remediation requirement",
            when: "the policy defines what would bring this back into compliance",
            to: "a.remediate",
          },
          {
            label: "An immediate scoped restriction",
            when: "the policy requires stopping something while this is resolved",
            to: "h.restrict",
          },
          {
            label: "A terminal consequence the policy explicitly requires",
            when: "the policy states that this violation ends the relationship or the capability",
            to: "h.terminal",
          },
          {
            label: "Authorized judgment, or the policy defines no consequence",
            when: "the consequence turns on judgment, or nothing in the policy says what follows",
            to: "h.review",
          },
        ],
      },
      {
        id: "a.remediate",
        kind: "action",
        does: "State exactly what would bring the entity back into compliance, and by when. A violation notice that does not say what to do about it is a reprimand, and it produces an escalation rather than a correction",
        writes: [{ field: "policy_log", mode: "append" }],
        next: "w.remediation",
      },
      {
        id: "w.remediation",
        kind: "wait",
        until: ["the remediation is completed", "the remediation authoritatively fails"],
        onEvent: "c.remediated",
        timeout: {
          after: "the remediation deadline the policy defines",
          reason:
            "an open violation with an expired remediation window is neither resolved nor acted on, and it stays that way until something else surfaces it",
        },
        onTimeout: "h.review",
        windowExtendsOnEngagement: false,
      },
      {
        id: "c.remediated",
        kind: "condition",
        asks: "Did the remediation resolve the violation?",
        branches: [
          {
            label: "Resolved",
            when: "the entity is back within the applicable rule",
            to: "a.resolved",
          },
          {
            label: "Failed",
            when: "the remediation did not bring it back into compliance",
            to: "h.restrict",
          },
        ],
      },
      {
        id: "a.resolved",
        kind: "action",
        does: "Record the violation as remediated, preserving what happened and what corrected it. The history stays because a pattern of the same violation is worth seeing, and a record that only shows the current state cannot show one",
        writes: [{ field: "policy_log", mode: "append" }],
        next: "x.resolved",
      },
      {
        id: "x.resolved",
        kind: "exit",
        state: "violation confirmed and remediated; history preserved",
        terminal: false,
        reEntry:
          "a recurrence is a new case linked to this one, which is what makes repetition visible without rewriting the first",
      },
      {
        id: "h.restrict",
        kind: "handoff",
        to: "RSK-193",
        on: "a confirmed violation requiring a scoped restriction",
        carries: [
          "the rule, its version, the evidence and the scope actually affected",
          "the explicit fact that this is a rule breached rather than misconduct established, which bounds the restriction",
        ],
      },
      {
        id: "h.review",
        kind: "handoff",
        to: "DEC-181",
        on: "a violation whose consequence, version or remediation outcome needs authorized judgment",
        carries: [
          "the policy, the evidence and exactly where the rules stopped short of a consequence",
          "the explicit fact that no consequence was invented from outside the policy",
        ],
      },
      {
        id: "h.terminal",
        kind: "handoff",
        to: "external:termination-lifecycle",
        on: "a violation the policy explicitly attaches a terminal consequence to",
        carries: [
          "the rule, its version, the evidence and the specific provision requiring termination",
          "the full violation history, preserved rather than replaced by the outcome",
        ],
      },
    ],
    guardrails: [
      "Detection is not a confirmed violation.",
      "A violation is not malicious intent.",
      "The consequence comes from the governing policy rather than from severity felt.",
      "A historical action is evaluated against the policy applicable when it occurred, unless governing rules explicitly say otherwise.",
    ],
    reusableRule:
      "A policy violation should be established against the applicable rule and evidence before the system applies the consequence defined for that violation.",
  },

  /* ------------------------------------------------------------ RSK-195 */
  {
    id: "RSK-195",
    slug: "compliance-requirement",
    category: "risk",
    name: "Compliance requirement → collect and verify → satisfied or blocked",
    purpose:
      "Hold one mandatory requirement as its own state, blocking only what genuinely depends on it.",
    entity: {
      scope: "the compliance requirement and the specific process depending on it",
      note: "Satisfied is scoped to the requirement's purpose and validity. The same evidence does not satisfy a different requirement.",
    },
    distinctFrom: [
      {
        journey: "IDN-82",
        because:
          "IDN-82 orchestrates collecting a verification and resuming what it blocked. This owns the compliance requirement as a business state - which requirement applies, whether existing evidence already satisfies it, and what happens when it cannot be met. It uses that collection mechanism rather than reimplementing one.",
      },
    ],
    entry: "t.necessary",
    nodes: [
      {
        id: "t.necessary",
        kind: "trigger",
        event: "compliance_requirement_becomes_necessary",
        evidence: {
          requires: [
            "an applicable compliance requirement that a specific process cannot proceed without",
          ],
          insufficientAlone: [
            "a general onboarding step, which collects what a product needs rather than what a rule mandates",
          ],
          source: "authoritative",
        },
        next: "a.define",
      },
      {
        id: "a.define",
        kind: "action",
        does: "Define the exact requirement and which process depends on it. The requirement is scoped to its purpose - a compliance step that collects everything available is not a requirement but a data grab, and everything extra becomes a retention obligation nobody planned",
        writes: [{ field: "compliance_log", mode: "append" }],
        next: "c.existing",
      },
      {
        id: "c.existing",
        kind: "condition",
        asks: "Does existing authoritative evidence already satisfy this requirement, within its validity?",
        branches: [
          {
            label: "It does",
            when: "held evidence covers the requirement's scope and is still valid",
            to: "a.reuse",
          },
          {
            label: "It does not",
            when: "nothing held covers it, or what is held has lapsed or was scoped to something else",
            to: "a.initiate",
          },
        ],
      },
      {
        id: "a.reuse",
        kind: "action",
        does: "Record the requirement SATISFIED from the existing evidence, and do not re-collect. Asking again for what is already held and still valid is the most common reason people abandon a process at the compliance step, and it produces a duplicate of something we already have to retain",
        writes: [{ field: "compliance_log", mode: "append" }],
        next: "h.resume",
      },
      {
        id: "a.initiate",
        kind: "action",
        does: "Raise the evidence or verification the requirement actually needs through the mechanism that owns it. Compliance does not build its own verification - a parallel identity check will disagree with the canonical one, and there is no principled way to say which of two verified states is real",
        writes: [{ field: "compliance_log", mode: "append" }],
        next: "w.requirement",
      },
      {
        id: "w.requirement",
        kind: "wait",
        until: [
          "the requirement is authoritatively satisfied",
          "the requirement authoritatively fails",
        ],
        onEvent: "c.satisfied",
        timeout: {
          after: "the deadline the requirement defines, where one exists",
          reason:
            "a dependent process blocked on a requirement nobody is completing is stopped without anyone having decided to stop it",
        },
        onTimeout: "c.deadline",
        windowExtendsOnEngagement: false,
      },
      {
        id: "c.satisfied",
        kind: "condition",
        asks: "How did the requirement resolve?",
        branches: [
          {
            label: "Satisfied",
            when: "the required evidence was obtained and verified",
            to: "a.satisfied",
          },
          {
            label: "Failed",
            when: "the requirement cannot be met with what is available",
            to: "a.cannot",
          },
        ],
      },
      {
        id: "c.deadline",
        kind: "condition",
        asks: "What does policy define for an expired requirement deadline?",
        branches: [
          {
            label: "It defines an outcome",
            when: "policy states what happens to the dependent process when the deadline passes",
            to: "a.cannot",
          },
          {
            label: "It does not",
            when: "no rule states what an expired compliance deadline does",
            to: "h.review",
          },
        ],
      },
      {
        id: "a.satisfied",
        kind: "action",
        does: "Record the requirement SATISFIED with its scope and its validity. Satisfied is scoped - the same evidence does not satisfy a different requirement, and reusing it beyond its purpose is how one verification silently becomes a general clearance nobody granted",
        writes: [{ field: "compliance_log", mode: "append" }],
        next: "h.resume",
      },
      {
        id: "h.resume",
        kind: "handoff",
        to: "external:operational-resolution",
        on: "a compliance requirement satisfied, releasing the process that depended on it",
        carries: [
          "the requirement, its scope and its validity period",
          "the explicit instruction that the dependent process revalidates on its own terms - this requirement clearing does not make it otherwise valid",
        ],
      },
      {
        id: "a.cannot",
        kind: "action",
        does: "Record the requirement as unsatisfiable, with why. This is a specific requirement failing rather than the entity being non-compliant in general, and the difference decides how much stops",
        writes: [{ field: "compliance_log", mode: "append" }],
        next: "c.dependent",
      },
      {
        id: "c.dependent",
        kind: "condition",
        asks: "What do the governing rules say happens to the dependent process?",
        branches: [
          {
            label: "Block it",
            when: "the rules stop the dependent process while the requirement is unmet",
            to: "a.block",
          },
          {
            label: "Close it",
            when: "the rules end the dependent process where the requirement cannot be met",
            to: "a.close",
          },
          {
            label: "The rules do not say",
            when: "nothing authoritative states the consequence for the dependent process",
            to: "h.review",
          },
        ],
      },
      {
        id: "a.block",
        kind: "action",
        does: "Block only the dependent process, naming the requirement that blocks it and what would satisfy it. Everything not depending on this requirement stays available - one unmet obligation stopping everything an entity can do is a general suspension nobody authorized",
        writes: [{ field: "compliance_log", mode: "append" }],
        next: "x.blocked",
      },
      {
        id: "x.blocked",
        kind: "exit",
        state: "dependent process blocked; the requirement is named and unmet",
        terminal: false,
        reEntry:
          "the requirement being satisfied later releases the block, and the dependent process revalidates rather than simply resuming",
      },
      {
        id: "a.close",
        kind: "action",
        does: "Close the dependent process under the rule that requires it, recording that it closed for an unmet compliance requirement rather than on its merits",
        writes: [{ field: "compliance_log", mode: "append" }],
        next: "x.closed",
      },
      {
        id: "x.closed",
        kind: "exit",
        state: "dependent process closed for an unmet compliance requirement",
        terminal: false,
        reEntry:
          "a new attempt with the requirement satisfiable is assessed fresh, and this closure does not stand against it",
      },
      {
        id: "h.review",
        kind: "handoff",
        to: "DEC-181",
        on: "a compliance requirement whose failure or deadline consequence the rules do not define",
        carries: [
          "the requirement, what was attempted and the process depending on it",
          "the explicit fact that no blocking or closure consequence was invented",
        ],
      },
    ],
    guardrails: [
      "A compliance requirement never requests unrelated evidence.",
      "A satisfied requirement is scoped to its defined purpose and validity.",
      "A compliance requirement is not generic customer onboarding.",
      "Only the processes depending on the requirement are blocked.",
    ],
    reusableRule:
      "Compliance requirements should block only the processes that depend on them and release those processes only when the defined requirement is authoritatively satisfied.",
  },

  /* ------------------------------------------------------------ RSK-196 */
  {
    id: "RSK-196",
    slug: "compliance-hold",
    category: "risk",
    name: "Compliance or policy hold → preserve state → resolve → resume or terminate",
    purpose:
      "Pause what a policy question makes unsafe, and leave everything else running.",
    entity: {
      scope: "the entity or process on hold, and the hold acting on it",
      note: "The hold pauses future incompatible actions. The entity, its obligations and its deadlines all continue existing underneath it.",
    },
    distinctFrom: [
      {
        journey: "RSK-193",
        because:
          "RSK-193 restricts because evidence of risk warrants it, and releases on evidence. A hold pauses because a policy or compliance question is open, and releases when that question is answered - the trigger, the authority and the release condition are all different.",
      },
    ],
    entry: "t.applied",
    nodes: [
      {
        id: "t.applied",
        kind: "trigger",
        event: "policy_or_compliance_hold_applied",
        evidence: {
          requires: ["an authoritative policy or compliance hold, with an authority behind it"],
          source: "authoritative",
        },
        next: "a.record",
      },
      {
        id: "a.record",
        kind: "action",
        does: "Record the hold reason, its scope, the authority for it, the effective time, which operations it affects, which remain allowed, and what would resolve it. A hold with no stated resolution condition has no way out and becomes a termination nobody decided",
        writes: [{ field: "compliance_log", mode: "append" }],
        next: "a.pause",
      },
      {
        id: "a.pause",
        kind: "action",
        does: "Record ON_HOLD and pause only the future actions the hold is incompatible with. Unrelated capabilities stay available where policy permits - a hold on outbound payments is not a reason to stop someone reading their own records",
        writes: [{ field: "compliance_log", mode: "append" }],
        next: "c.commitments",
      },
      {
        id: "c.commitments",
        kind: "condition",
        asks: "Do existing commitments require continued handling?",
        branches: [
          {
            label: "They do",
            when: "orders, refunds, reports or obligations created before the hold are still live",
            to: "a.preserve",
          },
          {
            label: "None outstanding",
            when: "nothing created before the hold is still owed in either direction",
            to: "a.deadlines",
          },
        ],
      },
      {
        id: "a.preserve",
        kind: "action",
        does: "Preserve those commitments and route them according to the governing rules. An order already placed, a refund already due and a regulatory report already owed do not stop existing because the entity is on hold - and some of them the hold specifically requires us to keep doing",
        writes: [{ field: "compliance_log", mode: "append" }],
        next: "a.deadlines",
      },
      {
        id: "a.deadlines",
        kind: "action",
        does: "Leave existing deadlines where they are unless the governing policy explicitly moves them. A hold that silently resets clocks extends obligations nobody agreed to extend, and it shortens none of them",
        writes: [{ field: "compliance_log", mode: "append" }],
        next: "w.hold",
      },
      {
        id: "w.hold",
        kind: "wait",
        until: [
          "the stated resolution requirement is met",
          "a review decision changes the hold",
          "a terminal policy outcome is reached",
        ],
        onEvent: "c.outcome",
        timeout: {
          after: "the maximum hold duration policy defines",
          reason:
            "an indefinite hold is a termination without a decision, and the entity under it cannot tell which one it is in",
        },
        onTimeout: "h.review",
        windowExtendsOnEngagement: false,
      },
      {
        id: "c.outcome",
        kind: "condition",
        asks: "How did the hold resolve?",
        branches: [
          {
            label: "The requirement was met",
            when: "the stated resolution condition is authoritatively satisfied",
            to: "a.revalidate",
          },
          {
            label: "A terminal policy outcome",
            when: "the policy question resolved against the entity in a way that ends something",
            to: "h.terminal",
          },
          {
            label: "A review decision is needed",
            when: "resolving it turns on judgment rather than on the stated condition",
            to: "h.review",
          },
        ],
      },
      {
        id: "a.revalidate",
        kind: "action",
        does: "Re-read the entity's current state before resuming. What resumes is what is valid now - the hold may have outlasted an entitlement, a term or an eligibility, and lifting it does not restore things that expired underneath it",
        next: "a.resume",
      },
      {
        id: "a.resume",
        kind: "action",
        does: "Record the hold lifted and resume the operations that are currently valid, rebuilt from current state rather than from what was paused",
        writes: [{ field: "compliance_log", mode: "append" }],
        next: "x.resumed",
      },
      {
        id: "x.resumed",
        kind: "exit",
        state: "hold lifted; operations resumed at what is currently valid",
        terminal: false,
        reEntry:
          "a further policy question is a new hold with its own scope and its own resolution condition. This one stays in the record as something that was applied and answered",
      },
      {
        id: "h.review",
        kind: "handoff",
        to: "DEC-181",
        on: "a hold whose resolution or continuation needs authorized judgment",
        carries: [
          "the hold, its reason, its age and what has and has not been resolved",
          "the explicit fact that a hold is not a rejection and nothing adverse has been decided",
        ],
      },
      {
        id: "h.terminal",
        kind: "handoff",
        to: "external:termination-lifecycle",
        on: "a hold resolving into a terminal policy outcome",
        carries: [
          "the outcome, its authority and the hold record that preceded it",
          "the commitments preserved during the hold, which the termination resolves rather than erases",
        ],
      },
    ],
    guardrails: [
      "A hold is not a rejection.",
      "A hold never resets deadlines unless governing policy explicitly does so.",
      "Unrelated capabilities remain available where permitted.",
      "Every hold states the condition that would resolve it.",
    ],
    reusableRule:
      "A policy or compliance hold temporarily prevents defined actions while preserving the underlying entity and its unresolved obligations.",
  },

  /* ------------------------------------------------------------ RSK-197 */
  {
    id: "RSK-197",
    slug: "exception-request",
    category: "risk",
    name: "Exception request → validate authority → approve, reject or review",
    purpose:
      "Ask for a controlled deviation from a named rule, over a stated scope, from someone entitled to ask.",
    entity: {
      scope: "the exception request and the specific policy, action or entity it concerns",
      note: "An exception names a rule and a scope. One that names neither is a general permission, which is what nobody meant to grant.",
    },
    distinctFrom: [
      {
        journey: "DEC-181",
        because:
          "This defines what a policy exception is and whether one may even be sought - which rule, what scope, whose authority. Where the answer needs judgment it uses the decision engine rather than being one.",
      },
    ],
    entry: "t.requested",
    nodes: [
      {
        id: "t.requested",
        kind: "trigger",
        event: "policy_exception_requested",
        evidence: {
          requires: ["a request to deviate from an identified policy or rule, for an identified scope"],
          insufficientAlone: [
            "a policy block having occurred, which is a rule applying rather than a request to set it aside",
          ],
          source: "declared",
        },
        next: "a.capture",
      },
      {
        id: "a.capture",
        kind: "action",
        does: "Capture the policy or rule concerned, the exception requested, its scope, the reason, the requester, any proposed duration or effective window, and the supporting evidence",
        writes: [{ field: "exception_log", mode: "append" }],
        next: "c.exceptions-allowed",
      },
      {
        id: "c.exceptions-allowed",
        kind: "condition",
        asks: "Does the policy permit exceptions to this rule?",
        branches: [
          {
            label: "It permits them",
            when: "the policy defines an exception path for this rule",
            to: "c.requester",
          },
          {
            label: "It forbids them",
            when: "the policy explicitly admits no exceptions to this rule",
            to: "a.no-path",
          },
          {
            label: "It is silent",
            when: "nothing states whether this rule can be excepted or by whom",
            to: "h.review",
          },
        ],
      },
      {
        id: "h.review",
        kind: "handoff",
        to: "DEC-181",
        on: "an exception sought against a rule whose policy says nothing about exceptions",
        carries: [
          "the rule, the deviation proposed and the fact that the policy is silent on whether it admits exceptions",
          "the explicit fact that no exception authority was inferred from that silence - an authority nobody wrote down is not one this journey can find",
        ],
      },
      {
        id: "a.no-path",
        kind: "action",
        does: "Record that this rule admits no exceptions, and close the path. A rule that can be excepted by asking is not a rule, and some of them exist precisely because they cannot be set aside by the person they inconvenience",
        writes: [{ field: "exception_log", mode: "append" }],
        next: "x.no-exception-path",
      },
      {
        id: "x.no-exception-path",
        kind: "exit",
        state: "no exception path exists for this rule; the rule stands",
        terminal: false,
        reEntry:
          "the policy itself changing is a policy change rather than an exception, and it runs through its own lifecycle with its own effective-time semantics",
      },
      {
        id: "c.requester",
        kind: "condition",
        asks: "May this requester ask for an exception to this rule?",
        branches: [
          {
            label: "They may",
            when: "the policy's exception path admits requests from this party",
            to: "c.rule",
          },
          {
            label: "They may not",
            when: "the requester is not among those the exception path admits",
            to: "a.invalid",
          },
        ],
      },
      {
        id: "a.invalid",
        kind: "action",
        does: "Record the request as invalid on standing, naming who may ask. This is not a refusal of the exception on its merits - nobody assessed it - and reporting it as one is untrue",
        writes: [{ field: "exception_log", mode: "append" }],
        next: "x.invalid",
      },
      {
        id: "x.invalid",
        kind: "exit",
        state: "request invalid on standing; the exception itself was not assessed",
        terminal: false,
        reEntry:
          "the same exception sought by someone the policy admits is assessed on its merits",
      },
      {
        id: "c.rule",
        kind: "condition",
        asks: "Does a deterministic exception rule cover this case?",
        branches: [
          {
            label: "It does",
            when: "the policy defines when this exception is granted without judgment",
            to: "a.evaluate",
          },
          {
            label: "It does not",
            when: "granting it turns on an authorized judgment",
            to: "a.judgment",
          },
        ],
      },
      {
        id: "a.judgment",
        kind: "action",
        does: "Record PENDING_REVIEW. The exception needs an authorized judgment and this journey does not make it - it establishes what is being asked for, over what scope, and hands the decision to the mechanism that owns decisions",
        writes: [{ field: "exception_log", mode: "append" }],
        next: "h.decide",
      },
      {
        id: "h.decide",
        kind: "handoff",
        to: "DEC-181",
        on: "an exception requiring authorized judgment",
        carries: [
          "the rule concerned, the exact scope proposed, the reason and the supporting evidence",
          "the explicit fact that an exception overrides one decision within a scope and does not disable the rule, so the decision is about that scope rather than about the rule",
        ],
      },
      {
        id: "a.evaluate",
        kind: "action",
        does: "Evaluate the request against the deterministic exception rule that covers it",
        writes: [{ field: "exception_log", mode: "append" }],
        next: "c.determined",
      },
      {
        id: "c.determined",
        kind: "condition",
        asks: "What did the exception rule determine?",
        branches: [
          {
            label: "Granted",
            when: "the rule's conditions for granting are met",
            to: "a.granted",
          },
          {
            label: "Refused",
            when: "the rule's conditions are not met",
            to: "a.rejected",
          },
        ],
      },
      {
        id: "a.rejected",
        kind: "action",
        does: "Record the exception REJECTED, naming the condition that was not met. The underlying policy continues to apply exactly as it did",
        writes: [{ field: "exception_log", mode: "append" }],
        next: "x.rejected",
      },
      {
        id: "x.rejected",
        kind: "exit",
        state: "exception rejected; the policy applies unchanged",
        terminal: false,
        reEntry:
          "the unmet condition being satisfied makes a fresh request assessable. This rejection concerns the request rather than the requester",
      },
      {
        id: "a.granted",
        kind: "action",
        does: "Record the exception APPROVED with exactly which rule it displaces, over what scope, for how long and under what conditions. An exception that names no rule and no scope is a general permission, which is what nobody meant to grant and what will be discovered being used somewhere else",
        writes: [{ field: "exception_log", mode: "append" }],
        next: "h.apply",
      },
      {
        id: "h.apply",
        kind: "handoff",
        to: "RSK-198",
        on: "an authorized exception ready to be applied",
        carries: [
          "the rule displaced, the scope, the validity and the usage semantics",
          "the explicit fact that being granted is not being applied - the override happens per action, within scope, and only while the exception is live",
        ],
      },
    ],
    guardrails: [
      "An exception requested is not an exception granted.",
      "Exception authority is never invented.",
      "An exception identifies exactly which rule and which scope it affects.",
      "An exception is a controlled deviation rather than removal of the rule.",
    ],
    reusableRule:
      "A policy exception is a controlled authorization to deviate from a defined rule within an explicit scope; it is not removal of the rule itself.",
  },

  /* ------------------------------------------------------------ RSK-198 */
  {
    id: "RSK-198",
    slug: "exception-application",
    category: "risk",
    name: "Exception granted → apply scoped override → expire or revoke",
    purpose:
      "Let an authorized deviation apply exactly where it was authorized, and stop applying the moment it should.",
    entity: {
      scope: "the granted exception and each action it is invoked against",
      note: "The exception is one record; each use is an event on it. Validity is asked at each use rather than set once when it was granted.",
    },
    distinctFrom: [
      {
        journey: "RSK-197",
        because:
          "RSK-197 establishes that a deviation is authorized. This is the runtime question - is it valid for this action, this entity, right now, and has it already been used up. An exception granted correctly and applied wrongly is still an unauthorized deviation.",
      },
    ],
    entry: "t.authorized",
    nodes: [
      {
        id: "t.authorized",
        kind: "trigger",
        event: "exception_becomes_authorized",
        evidence: {
          requires: ["an authorized exception naming a rule, a scope and its usage semantics"],
          source: "authoritative",
        },
        next: "a.record",
      },
      {
        id: "a.record",
        kind: "action",
        does: "Record the exception id, the policy or rule it displaces, its scope, who authorized it, its valid-from, its valid-until where one applies, its conditions and its usage semantics",
        writes: [{ field: "exception_log", mode: "append" }],
        next: "c.expiry",
      },
      {
        id: "c.expiry",
        kind: "condition",
        asks: "Does the exception define an expiry?",
        branches: [
          {
            label: "It defines one",
            when: "a valid-until, a period or a use limit was set when it was granted",
            to: "a.bounded",
          },
          {
            label: "It does not",
            when: "no time limit was set",
            to: "a.unbounded",
          },
        ],
      },
      {
        id: "a.bounded",
        kind: "action",
        does: "Record the boundary as granted, so the exception's own terms decide when it stops rather than any assumption made here",
        next: "w.use",
      },
      {
        id: "a.unbounded",
        kind: "action",
        does: "Record that no expiry was set, rather than assigning one. Inventing an expiry revokes an authorization nobody revoked; the absence is itself worth surfacing, because an unbounded exception to a live rule is usually something someone should look at again",
        writes: [{ field: "exception_log", mode: "append" }],
        next: "w.use",
      },
      {
        id: "w.use",
        kind: "wait",
        until: [
          "the exception is invoked for an action",
          "the exception is revoked",
        ],
        onEvent: "c.event",
        timeout: {
          after: "the exception's valid-until, or the review point set for an unbounded exception",
          reason:
            "an exception that outlives its authority is a rule quietly disabled, and the disabling is invisible because every use looks like a valid one",
        },
        onTimeout: "a.expire",
        windowExtendsOnEngagement: false,
      },
      {
        id: "c.event",
        kind: "condition",
        asks: "What happened to the exception?",
        branches: [
          {
            label: "Invoked",
            when: "an action reached a policy decision point carrying this exception",
            to: "c.applicable",
          },
          {
            label: "Revoked",
            when: "an authority withdrew it before it expired",
            to: "a.revoke",
          },
        ],
      },
      {
        id: "c.applicable",
        kind: "condition",
        asks: "Is the exception currently valid for this specific action?",
        branches: [
          {
            label: "Valid",
            when: "the same rule, inside the granted scope, inside its validity, and not consumed",
            to: "a.override",
          },
          {
            label: "Out of scope",
            when: "a different rule, a different entity or an action the grant did not name",
            to: "a.no-override",
          },
          {
            label: "Already consumed",
            when: "a single-use exception that has been used",
            to: "a.consumed",
          },
        ],
      },
      {
        id: "a.no-override",
        kind: "action",
        does: "Apply normal policy and record the attempt. An exception granted for one action or one entity does not travel to another - leakage here is how a single approved deviation becomes a general practice nobody authorized and nobody can date",
        writes: [{ field: "exception_log", mode: "append" }],
        next: "w.use",
      },
      {
        id: "a.consumed",
        kind: "action",
        does: "Refuse the reuse and record the attempt. A single-use exception used twice authorizes one deviation and performs two",
        writes: [{ field: "exception_log", mode: "append" }],
        next: "x.consumed",
      },
      {
        id: "a.override",
        kind: "action",
        does: "Apply the override for this action only, and record the use. The underlying policy is untouched - an exception overrides a decision rather than disabling a rule, and the next action it does not cover gets the normal answer",
        writes: [{ field: "exception_log", mode: "append" }],
        next: "c.single",
      },
      {
        id: "c.single",
        kind: "condition",
        asks: "Is this a single-use exception?",
        branches: [
          {
            label: "Single-use",
            when: "the grant authorized one deviation",
            to: "a.consume",
          },
          {
            label: "Reusable within its validity",
            when: "the grant authorized deviations for a period or a scope rather than a count",
            to: "w.use",
          },
        ],
      },
      {
        id: "a.consume",
        kind: "action",
        does: "Mark the exception consumed. Its authority is spent, and any later invocation is refused rather than quietly honoured",
        writes: [{ field: "exception_log", mode: "append" }],
        next: "x.consumed",
      },
      {
        id: "x.consumed",
        kind: "exit",
        state: "consumed; the exception can authorize nothing further",
        terminal: false,
        reEntry:
          "a further deviation needs a further exception, which is a new request rather than a re-reading of this grant",
      },
      {
        id: "a.expire",
        kind: "action",
        does: "Record the exception EXPIRED and stop all future override, including in work already queued carrying its id. Stale work holding an expired exception is the failure this state exists to prevent - the override arrives long after the authority lapsed and looks identical to a valid one",
        writes: [
          { field: "exception_log", mode: "append" },
          { field: "suppressed_sends", mode: "append" },
        ],
        next: "x.expired",
      },
      {
        id: "x.expired",
        kind: "exit",
        state: "EXPIRED; the rule applies normally again and the overrides already made stand",
        terminal: false,
        reEntry:
          "a renewed exception is a new grant with its own scope and validity, assessed on current circumstances rather than extended from this one",
      },
      {
        id: "a.revoke",
        kind: "action",
        does: "Record the exception REVOKED with its authority and its effective moment, and stop future override immediately. Revocation does not undo the overrides already validly applied - those happened under an authorization that existed at the time, and rewriting them removes the record of a decision that was correct when it was made",
        writes: [
          { field: "exception_log", mode: "append" },
          { field: "suppressed_sends", mode: "append" },
        ],
        next: "x.revoked",
      },
      {
        id: "x.revoked",
        kind: "exit",
        state: "REVOKED; future override stopped, prior valid uses preserved",
        terminal: false,
        reEntry:
          "whether the prior uses need correcting is a separate question with its own lifecycle, and revoking the exception does not answer it",
      },
    ],
    guardrails: [
      "An exception is not a policy disabled.",
      "An exception for one action or entity never leaks to another.",
      "An expired or revoked exception is never reused by stale work.",
      "An expiration is never invented where none exists.",
    ],
    reusableRule:
      "Granted exceptions override only the policy decision explicitly authorized for their defined scope and validity.",
  },

  /* ------------------------------------------------------------ RSK-199 */
  {
    id: "RSK-199",
    slug: "limit-quota",
    category: "risk",
    name: "Limit or quota reached → block, wait, increase or reset",
    purpose:
      "Treat a limit being reached as the limit working, and give the constrained action a real path forward.",
    entity: {
      scope: "the entity and the specific limit or quota constraining it",
      note: "One limit, one measurement window, one authoritative count. Reaching it is an operational fact about usage and nothing about the user.",
    },
    distinctFrom: [
      {
        journey: "RSK-192",
        because:
          "A limit is a constraint the entity was told about and is entitled to consume. Routing it into risk assessment puts ordinary heavy users in front of a fraud analyst, and produces a risk history for behaviour that was permitted.",
      },
    ],
    entry: "t.threshold",
    nodes: [
      {
        id: "t.threshold",
        kind: "trigger",
        event: "limit_threshold_reached_or_would_be_exceeded",
        evidence: {
          requires: ["a proposed action measured against a defined limit or quota"],
          source: "authoritative",
        },
        next: "a.determine",
      },
      {
        id: "a.determine",
        kind: "action",
        does: "Determine the limit type, the current usage, the limit amount, the measurement window, the reset semantics, the scope, and the authoritative source of the count",
        writes: [{ field: "limit_log", mode: "append" }],
        next: "c.source",
      },
      {
        id: "c.source",
        kind: "condition",
        asks: "Is the usage figure authoritative?",
        branches: [
          {
            label: "Authoritative",
            when: "the count comes from the source that owns it and is current",
            to: "c.exceeds",
          },
          {
            label: "Derived, stale or possibly incorrect",
            when: "the count is inferred, cached, or disagrees with the owning source",
            to: "h.reconcile",
          },
        ],
      },
      {
        id: "h.reconcile",
        kind: "handoff",
        to: "external:external-status-reconciliation",
        on: "a limit decision resting on a usage figure that may be wrong",
        carries: [
          "the limit, the figure held and where it came from",
          "the explicit instruction that no block is applied on a count that has not been established - refusing someone on a wrong number is worse than a late decision",
        ],
      },
      {
        id: "c.exceeds",
        kind: "condition",
        asks: "Would the proposed action exceed the limit?",
        branches: [
          {
            label: "Within the limit",
            when: "the action fits inside the remaining allowance",
            to: "a.allow",
          },
          {
            label: "Exceeds it",
            when: "the action would take usage past the limit",
            to: "a.block",
          },
        ],
      },
      {
        id: "a.allow",
        kind: "action",
        does: "Record the usage against the limit atomically with the allowance, so two concurrent actions cannot each see room only one of them has. Checking and then applying separately is how a limit of ten becomes twelve under load, and the overage is discovered afterwards",
        writes: [{ field: "limit_log", mode: "append" }],
        next: "x.within",
      },
      {
        id: "x.within",
        kind: "exit",
        state: "within the limit; usage recorded atomically",
        terminal: false,
        reEntry:
          "the next action is measured against the updated usage, which is why the record and the allowance happen together",
      },
      {
        id: "a.block",
        kind: "action",
        does: "Block or hold the affected action only, and record LIMIT_REACHED with the limit, the window and the current usage. Reaching a limit is the limit working - it is not abuse, and a message that implies otherwise is read as an accusation by someone who did exactly what they were permitted to do",
        writes: [{ field: "limit_log", mode: "append" }],
        next: "c.path",
      },
      {
        id: "c.path",
        kind: "condition",
        asks: "What path exists from here?",
        branches: [
          {
            label: "The limit resets on its own",
            when: "the measurement window rolls and capacity returns",
            to: "c.reset-defined",
          },
          {
            label: "An increase or override is permitted",
            when: "policy provides a route to more capacity",
            to: "h.increase",
          },
          {
            label: "Neither",
            when: "the limit is fixed for this entity and this window",
            to: "x.blocked",
          },
        ],
      },
      {
        id: "c.reset-defined",
        kind: "condition",
        asks: "Is the reset point authoritatively defined?",
        branches: [
          {
            label: "Defined",
            when: "the window's reset is stated and comes from the source that owns the count",
            to: "w.reset",
          },
          {
            label: "Not defined",
            when: "no authoritative reset point exists for this window",
            to: "h.review",
          },
        ],
      },
      {
        id: "w.reset",
        kind: "wait",
        until: ["the authoritative reset occurs"],
        onEvent: "a.reset",
        timeout: {
          after: "the expected reset point plus its tolerance",
          reason:
            "a reset that does not arrive when it should means the count or the window is wrong, and waiting longer on a broken clock blocks an entity indefinitely",
        },
        onTimeout: "h.reconcile",
        windowExtendsOnEngagement: false,
      },
      {
        id: "a.reset",
        kind: "action",
        does: "Record the window reset from its authoritative source rather than from an assumed clock. A locally assumed reset grants capacity the authority has not granted, and the two drift apart quietly",
        writes: [{ field: "limit_log", mode: "append" }],
        next: "x.reset",
      },
      {
        id: "x.reset",
        kind: "exit",
        state: "window reset; capacity available again under the same limit",
        terminal: false,
        reEntry:
          "the blocked action is re-attempted and measured against the new window like any other",
      },
      {
        id: "x.blocked",
        kind: "exit",
        state: "LIMIT_REACHED with no route to more capacity in this window",
        terminal: false,
        reEntry:
          "an authorized change to the limit, or a new window, makes the same action possible. Nothing about this state is a finding against the entity",
      },
      {
        id: "h.increase",
        kind: "handoff",
        to: "DEC-181",
        on: "a limit increase or override policy permits to be sought",
        carries: [
          "the limit, the current usage, the window and what is being asked for",
          "the explicit fact that a limit is never silently raised - an unrecorded increase is a control removed with no decision and no authority behind it",
        ],
      },
      {
        id: "h.review",
        kind: "handoff",
        to: "DEC-181",
        on: "a limit with no authoritatively defined reset",
        carries: [
          "the limit, the window and the usage held against it",
          "the explicit fact that no reset period was invented - telling someone to try again tomorrow when nothing resets tomorrow is worse than telling them nothing",
        ],
      },
    ],
    guardrails: [
      "A limit reached is not abuse.",
      "A reset period is never invented.",
      "A limit is never silently increased.",
      "Concurrent usage updates cannot permit unintended over-consumption.",
    ],
    reusableRule:
      "A limit should constrain only the measured activity governed by that limit until usage, time or authorized policy changes make additional capacity valid.",
  },

  /* ------------------------------------------------------------ RSK-200 */
  {
    id: "RSK-200",
    slug: "policy-change-propagation",
    category: "risk",
    name: "Policy or risk state changed → re-evaluate affected work → resume, restrict or preserve",
    purpose:
      "Apply a change where the new authority actually reaches, and leave the past alone.",
    entity: {
      scope: "the policy or risk state change and the work it actually touches",
      note: "Completed actions are outside its reach by construction. What it re-evaluates is pending and future work, item by item.",
    },
    distinctFrom: [
      {
        journey: "RSK-191",
        because:
          "RSK-191 evaluates one action at its decision point. This propagates a change across work already in flight, where the hard question is not what the rule says but which states the new rule is entitled to reach.",
      },
    ],
    entry: "t.changed",
    nodes: [
      {
        id: "t.changed",
        kind: "trigger",
        event: "policy_or_risk_state_changed",
        evidence: {
          requires: [
            "a material authoritative change - a policy version, a cleared risk case, a moved restriction threshold, a changed compliance requirement, a revoked exception, or a new authoritative classification",
          ],
          source: "authoritative",
        },
        next: "a.identify",
      },
      {
        id: "a.identify",
        kind: "action",
        does: "Identify the active and future work the change actually touches. A policy update that restarts every journey in the system is indistinguishable from an outage, and it buries the handful of cases the change was genuinely about",
        writes: [{ field: "policy_log", mode: "append" }],
        next: "a.preserve",
      },
      {
        id: "a.preserve",
        kind: "action",
        does: "Preserve completed actions exactly as they are. An action validly completed under the policy that governed it stays valid - a new rule does not make everybody retroactively non-compliant, and rewriting the record on a policy release destroys the evidence that anything ever complied",
        writes: [{ field: "policy_log", mode: "append" }],
        next: "c.temporal",
      },
      {
        id: "c.temporal",
        kind: "condition",
        asks: "What are the change's effective-time semantics?",
        branches: [
          {
            label: "Prospective only",
            when: "the change governs actions from its effective time onward",
            to: "a.future",
          },
          {
            label: "It reaches work already in flight",
            when: "the change explicitly applies to pending work started under the previous version",
            to: "c.newer",
          },
          {
            label: "The semantics are not defined",
            when: "nothing states whether the change reaches work in flight",
            to: "h.review",
          },
        ],
      },
      {
        id: "a.future",
        kind: "action",
        does: "Apply the change to future relevant actions and leave pending work on the version that governed it when it started. Work in flight under an older version is not non-compliant - it is mid-process under the rule it began under",
        writes: [{ field: "policy_log", mode: "append" }],
        next: "c.consequence",
      },
      {
        id: "c.newer",
        kind: "condition",
        asks: "Has a newer evaluation already been applied to this work?",
        branches: [
          {
            label: "Nothing newer",
            when: "this is the most recent authority applied to it",
            to: "a.pending",
          },
          {
            label: "A newer version already governs it",
            when: "the work has already been evaluated under a later policy version than this job carries",
            to: "a.suppress",
          },
        ],
      },
      {
        id: "a.suppress",
        kind: "action",
        does: "Suppress this evaluation. A queued policy job carrying an older version will otherwise overwrite a decision made under a newer one, and the regression is silent - the record shows a valid evaluation against a rule that has already been superseded",
        writes: [
          { field: "policy_log", mode: "append" },
          { field: "suppressed_sends", mode: "append" },
        ],
        next: "x.suppressed",
      },
      {
        id: "x.suppressed",
        kind: "exit",
        state: "stale policy evaluation suppressed; the newer version's decision stands",
        terminal: false,
        reEntry:
          "the newest authority governs. A further change is propagated on its own terms rather than by replaying this one",
      },
      {
        id: "a.pending",
        kind: "action",
        does: "Re-evaluate the pending work against the governing effective-time semantics, item by item. What is re-evaluated is the pending decision rather than the completed action behind it",
        writes: [{ field: "policy_log", mode: "append" }],
        next: "c.consequence",
      },
      {
        id: "c.consequence",
        kind: "condition",
        asks: "What does the re-evaluation require now?",
        branches: [
          {
            label: "A current restriction is no longer justified",
            when: "the change removes the basis for something currently restricted",
            to: "h.restore",
          },
          {
            label: "A new restriction now applies",
            when: "the change creates a basis for restricting something currently permitted",
            to: "h.restrict",
          },
          {
            label: "Nothing changes for existing work",
            when: "the change reaches this work and requires nothing different of it",
            to: "a.no-change",
          },
        ],
      },
      {
        id: "a.no-change",
        kind: "action",
        does: "Record that the change was evaluated against this work and required nothing. Recording the non-change is what stops the same evaluation running again on the next release, and it is the evidence that the change was considered rather than missed",
        writes: [{ field: "policy_log", mode: "append" }],
        next: "x.unchanged",
      },
      {
        id: "x.unchanged",
        kind: "exit",
        state: "evaluated against the change and unchanged by it",
        terminal: false,
        reEntry:
          "a later change is evaluated on its own terms. This record is what makes it cheap to see this one was already handled",
      },
      {
        id: "h.restore",
        kind: "handoff",
        to: "ACC-79",
        on: "a restriction the change no longer justifies",
        carries: [
          "the restriction being lifted and the change that removed its basis",
          "the explicit instruction that restoration is rebuilt from current entitlements - a cleared risk does not restore an entitlement that expired independently while the restriction was in force",
        ],
      },
      {
        id: "h.restrict",
        kind: "handoff",
        to: "RSK-193",
        on: "work the change now requires restricting",
        carries: [
          "the new authority, its effective time and the specific scope it reaches",
          "the explicit fact that this is a current-state consequence and says nothing about actions completed under the previous rule",
        ],
      },
      {
        id: "h.review",
        kind: "handoff",
        to: "DEC-181",
        on: "a change with undefined effective-time semantics",
        carries: [
          "the change, the work it would touch and what is not stated about its reach",
          "the explicit fact that no default was chosen - whether a change reaches work in flight is a decision, and defaulting either way is wrong for about half of all changes",
        ],
      },
    ],
    guardrails: [
      "A new policy does not mean a historical action was always invalid.",
      "A cleared risk does not automatically restore an unrelated expired entitlement.",
      "A policy update does not indiscriminately restart every existing journey.",
      "A stale policy-evaluation job never overwrites a decision made under a newer version.",
    ],
    reusableRule:
      "Policy and risk changes should alter only the current or future states to which the new authority applies while preserving the historical context under which prior actions occurred.",
  },
];
