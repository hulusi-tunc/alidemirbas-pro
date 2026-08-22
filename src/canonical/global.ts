import type {
  ContactPressureCapClass,
  DeliveryWindowOutcome,
  GlobalOrchestrationRule,
  SendPathStage,
} from "./types";

/* GLOBAL ORCHESTRATION RULES

   Everything in the twenty-six categories describes one entity moving through
   one lifecycle. These do not. They are the rules that hold between journeys,
   and they exist because two kinds of problem kept appearing in category after
   category with the same shape and a different noun.

   The first is contention. A person is not in one lifecycle at a time. A
   renewal window opens while a cancellation is in motion; a cart reminder is
   due while the same person is at checkout; a satisfaction survey comes up
   while a support agent is still working the complaint it would ask about.
   Each journey is individually correct and something has to decide which one
   speaks. GLB-01 to GLB-10 are that decision.

   The second is safety that no single journey can guarantee on its own -
   idempotency, revalidation before delayed execution, bounded loops, history
   that is appended rather than rewritten. Each was written into eight or ten
   categories separately. Stated once here, the category rules that added
   nothing were removed and the ones carrying real domain content stayed as
   specializations, named in the notes.

   A global rule is not a journey. It has no journey id, it is not in
   JOURNEYS, and it does not change the canonical journey count. */

export const GLOBAL_RULES: readonly GlobalOrchestrationRule[] = [
  /* ---------------------------------------------------------------------
     GLB-01 .. GLB-10  Journey competition and ownership resolution
     --------------------------------------------------------------------- */
  {
    id: "GLB-01",
    scope: "global",
    name: "Competition key",
    problem:
      "Two journeys are eligible for the same person and nobody can say whether they are actually in conflict, so either both send or a global mute is applied that silences things which were never competing.",
    rule: "A journey that competes declares the scope it competes on, and two journeys are in competition only when they share that scope and the same instance of it.",
    appliesTo: ["acquisition", "activation", "retention", "consent", "feedback", "subscription", "communication"],
    notes:
      "Scope instance, not scope type. Two order journeys on two different orders are not competing, and the whole point of the key is that they run in parallel. Journeys that carry no competition field are declaring that they compete with nothing, which is the normal case.",
  },
  {
    id: "GLB-02",
    scope: "global",
    name: "Explicit precedence only",
    problem:
      "A tie is broken by whichever journey happened to be evaluated first, or by a rank somebody invented at implementation time, and the ordering is then impossible to explain to the person it affected.",
    rule: "The winner is selected from explicit policy precedence. Where policy leaves two candidates at equal standing, no local tie-break is invented and the contest is escalated rather than resolved by ordering.",
    appliesTo: ["acquisition", "retention", "feedback", "subscription", "communication", "decision"],
    notes:
      "The same discipline OWN-57 applies to approval thresholds and RSK-197 applies to exceptions: an ordering nobody wrote down is not an ordering. Escalation runs through DEC-181. Two kinds of evidence may be named by policy as legitimate discriminators rather than invented tie-breaks: an authoritative fresh event may supersede a stale inferred state, and an active valid ownership may outrank a journey that is merely eligible. Neither overrides an explicit precedence policy - they resolve what the policy leaves equal.",
  },
  {
    id: "GLB-03",
    scope: "global",
    name: "Exclusion group",
    problem:
      "Journeys that must not run together are identified by resemblance, so a genuinely incompatible pair is missed and an unrelated pair is suppressed for looking similar.",
    rule: "Incompatible journeys declare a shared exclusion group by name, and within one group on one scope instance only the permitted winner holds ownership.",
    appliesTo: ["acquisition", "retention", "feedback", "subscription", "communication"],
    notes:
      "Membership is declared rather than inferred. A journey in no group competes with nothing, and adding a group to make a suppression convenient is how unrelated lifecycles start blocking each other.",
  },
  {
    id: "GLB-04",
    scope: "global",
    name: "Higher lifecycle authority",
    problem:
      "A journey started against a state that has since moved keeps its turn because it was there first, and a renewal reminder arrives in the middle of a cancellation.",
    rule: "A more authoritative or more current lifecycle state preempts a lower-priority stale one, where the dominance comes from stated policy or state semantics rather than from recency or from the ordering of the evaluation.",
    appliesTo: ["acquisition", "retention", "feedback", "subscription", "fulfillment", "scheduling"],
    notes:
      "The instances the library already carries: a cancellation in motion outranks a renewal reminder (SUB-163), a reached commercial destination outranks every intent journey on the same scope (ACQ-08), and an open issue under human ownership outranks automated retention and satisfaction outreach (FBK-46). Each of those is a policy statement, not an inference from timing. Two exceptions bound it: a journey that belongs to no stage is not suppressed by a stage transition - a payment failure and a support follow-up are right at any stage - and an unknown state preempts nothing, because uncertainty about where somebody is is not evidence that a journey has lost ownership.",
  },
  {
    id: "GLB-05",
    scope: "global",
    name: "Loser handling",
    problem:
      "Everything that loses is treated the same way, so a journey holding a real obligation is discarded alongside one that was merely no longer the right thing to say.",
    rule: "A losing journey is suppressed, paused, superseded or exited according to its own semantics, and which of the four applies is a property of that journey rather than of the contest.",
    appliesTo: ["acquisition", "activation", "retention", "feedback", "subscription", "communication"],
    notes:
      "Paused keeps an obligation alive and waiting. Superseded says another journey now owns the thing this one was about. Suppressed says this is not the right moment. Exit says the reason is gone. Collapsing them loses the difference between a message deferred and an obligation abandoned.",
  },
  {
    id: "GLB-06",
    scope: "global",
    name: "Re-evaluation on release",
    problem:
      "The winner finishes, the suppressed candidates resume from where they stopped, and a person receives a message written against a state that ended weeks ago.",
    rule: "When the winning journey's state changes, suppressed candidates are re-evaluated against current eligibility, intent, entity state, permission, cooldown and destination completion rather than resumed on the standing they had when they lost.",
    appliesTo: ["acquisition", "retention", "consent", "feedback", "subscription", "communication"],
    notes:
      "CON-38 already states the release half of this for suppression: what was held is discarded and current eligibility is recalculated. This extends it to every candidate that lost a contest rather than only to those held by an explicit suppression.",
  },
  {
    id: "GLB-07",
    scope: "global",
    name: "Stale action invalidation",
    problem:
      "The contest is resolved, the loser stops scheduling, and the work it queued before losing fires anyway - from a journey that no longer owns anything.",
    rule: "Communication and actions already queued by a journey that has since lost ownership are invalidated before execution rather than at the point of scheduling.",
    appliesTo: [
      "acquisition",
      "activation",
      "retention",
      "consent",
      "ownership",
      "subscription",
      "scheduling",
      "communication",
      "rollout",
    ],
    notes:
      "Local specializations remain where the invalidation has domain content: OWN-54 invalidates a previous owner's queued actions, SCH-177 suppresses a stale start job, SUB-168 suppresses a superseded termination, RLT-243 suppresses a superseded change. The general form is that losing ownership reaches work already in flight.",
  },
  {
    id: "GLB-08",
    scope: "global",
    name: "Entity-scoped isolation",
    problem:
      "A suppression written for one order, cart or subscription is applied at the person level, and a customer stops hearing about six things because one of them is contested.",
    rule: "A contest resolved on one scope instance constrains only that instance. Winning ownership of one order does not suppress a journey about another.",
    appliesTo: ["acquisition", "retention", "consent", "communication", "fulfillment", "scheduling", "subscription"],
    notes:
      "The mirror of GLB-01. It is stated separately because the failure is asymmetric: getting the key wrong at query time produces a missed conflict, and getting the instance wrong at suppression time produces a silence nobody can explain. There is deliberately no canonical default scope. Where suppressing across entities could cause harm the scope is declared explicitly, and an implementation that chooses a fallback is documenting configuration rather than inheriting a canonical semantic - a person-wide default would quietly contradict the entity-scope-first doctrine everything else here is built on.",
  },
  {
    id: "GLB-09",
    scope: "global",
    name: "Human ownership outranks automation",
    problem:
      "A person is working a customer's problem while an automated journey messages the same customer about the same thing, and the two contradict each other in front of them.",
    rule: "Where a person or team holds active ownership of the underlying problem, policy may suppress conflicting automated journeys on the same scope for as long as that ownership stands.",
    appliesTo: ["retention", "feedback", "ownership", "communication", "decision", "incident"],
    notes:
      "Permissive rather than automatic: the suppression comes from policy naming this contest, not from the mere existence of a human owner. FBK-46 holds the issue, OWN-51 and OWN-52 hold the assignment, and INC-252 keeps incident command separate from the individual case owners it does not absorb.",
  },
  {
    id: "GLB-10",
    scope: "global",
    name: "No automatic resume",
    problem:
      "A suppression lifts and a paused sequence continues from step four, sending the fifth message of an argument the person stopped having.",
    rule: "Suppression ending is not the losing sequence continuing. Re-entry is recomputed from current state, and a journey resumes at the point its current state implies rather than at the point it stopped.",
    appliesTo: ["acquisition", "activation", "retention", "consent", "communication", "subscription"],
    notes:
      "The strongest form of GLB-06. CON-38 states it for suppression release and ACQ-07 for intent cooldown; the general rule is that a stored position in a sequence is not a claim about what should happen next.",
  },

  /* ---------------------------------------------------------------------
     GLB-11 .. GLB-26  Promoted cross-category orchestration safety
     --------------------------------------------------------------------- */
  {
    id: "GLB-11",
    scope: "global",
    name: "Reuse the canonical reliability primitives",
    problem:
      "A category builds its own retry, backoff or reconciliation because the canonical one was inconvenient at the time, and the two behave differently under exactly the load that produced the failure.",
    rule: "Async execution, retry, backoff and unknown-outcome reconciliation are reused from the canonical mechanisms rather than reimplemented inside a category.",
    appliesTo: ["integration", "processing", "financial", "communication", "data", "rollout", "incident"],
    notes:
      "Promoted from CMS-R19 and DAT-R20, which were identical and have been removed. RLT-R18 and INC-R20 remain as specializations: one names change execution, the other names the specific primitive set an incident response pulls from.",
  },
  {
    id: "GLB-12",
    scope: "global",
    name: "Idempotency and correlation identifiers before submission",
    problem:
      "An operation fails, and the identifier that would have made the retry safe or the outcome attributable is generated afterwards, which is exactly too late to help with the failure that needed it.",
    rule: "An operation that leaves the system carries a stable idempotency and correlation identifier, recorded before it is submitted.",
    appliesTo: ["integration", "processing", "financial", "communication", "data", "rollout"],
    notes:
      "Promoted from INT-R5 and FIN-R5, which differed only in the noun and have been removed. The grain-specific forms remain: DAT-R7 gives every record in an import its own stable operation identity, and RLT-R14 gives every target in a rollout one.",
  },
  {
    id: "GLB-13",
    scope: "global",
    name: "Partial success preserves the confirmed successful scope",
    problem:
      "Part of a composite operation fails and the whole thing is replayed, re-executing everything that already worked - which in anything with side effects is a larger incident than the original failure.",
    rule: "Where an operation partly succeeds, the confirmed successful scope is preserved and only the unresolved scope is retried or corrected.",
    appliesTo: ["processing", "fulfillment", "remedy", "data", "rollout", "communication", "incident"],
    notes:
      "Promoted from OPS-R8, which stated the bare principle and has been removed. DAT-R8 remains as a specialization at record grain, where re-touching thousands of correct rows to fix forty is the concrete cost.",
  },
  {
    id: "GLB-14",
    scope: "global",
    name: "Authorization reuses the canonical decision mechanisms",
    problem:
      "A category implements its own approval path, and it drifts from the canonical one on SLA, escalation and audit trail - which is discovered during an audit of both.",
    rule: "Where an action requires authorization, judgment or policy exception, the canonical decision and policy mechanisms are used rather than a second approval path inside the category.",
    appliesTo: ["risk", "document", "data", "rollout", "control", "scheduling", "subscription"],
    notes:
      "Promoted from DOC-R18 and RLT-R19, which were generic and have been removed. RSK-R14 remains for the specific drift it names inside risk, and DAT-R19 for its scoping to high-risk mutations.",
  },
  {
    id: "GLB-15",
    scope: "global",
    name: "Cannot proceed and proceeding late are separate problems",
    problem:
      "A system that is merely behind is treated as broken, or a broken one is treated as slow, and work is queued against the thing that is already the bottleneck.",
    rule: "An inability to proceed and a delay in proceeding are separate conditions with separate responses, and neither is inferred from the other.",
    appliesTo: ["integration", "processing", "fulfillment", "scheduling", "communication", "incident"],
    notes:
      "Promoted as the shared principle behind INT-R8 and OPS-R2, which draw genuinely different distinctions and both remain: INT-R8 separates integration failure from integration lag, OPS-R2 separates queue lag from integration failure.",
  },
  {
    id: "GLB-16",
    scope: "global",
    name: "Ending an obligation and settling its money are separate lifecycles",
    problem:
      "A cancellation flow decides the refund as well, and gets one of them wrong quietly - refunding what was delivered, or ending a booking without the fee its terms created.",
    rule: "Ending, cancelling or reversing an obligation and the financial consequence of doing so are decided by different mechanisms with different authority.",
    appliesTo: ["fulfillment", "scheduling", "subscription", "remedy", "financial", "terminal"],
    notes:
      "Promoted from FUL-R14, which has been removed. SCH-R10 remains as a specialization because it also covers a fee created by the cancellation rather than only a refund reversed by it.",
  },
  {
    id: "GLB-17",
    scope: "global",
    name: "Stale queued work does not execute",
    problem:
      "A job scheduled weeks ago fires against assumptions that have since moved, and the record shows a successful execution of something nobody would have authorized today.",
    rule: "Queued or scheduled work carries the version of the state it was created against, and work whose basis has been superseded is suppressed rather than executed.",
    appliesTo: [
      "time",
      "structure",
      "integration",
      "processing",
      "subscription",
      "scheduling",
      "risk",
      "communication",
      "data",
      "rollout",
      "control",
    ],
    notes:
      "The most repeated principle in the library. Local specializations remain wherever the stale execution has a distinct cost: SUB-168 ends a relationship somebody has since chosen to keep, SCH-177 revives a cancelled booking, RLT-243 installs a superseded version, CTL-236 expires a delegation that has been extended, RSK-200 overwrites a decision made under a newer policy.",
  },
  {
    id: "GLB-18",
    scope: "global",
    name: "Delayed execution revalidates at the moment of execution",
    problem:
      "A decision made at scheduling time is executed at effective time on the state it assumed, and the gap between the two is where the target was decommissioned, the approval was revoked, or the message became untrue.",
    rule: "Anything scheduled, approved or prepared for later execution re-reads authoritative current state immediately before it acts, and proceeds from what is true then rather than from what was assumed.",
    appliesTo: [
      "time",
      "access",
      "subscription",
      "scheduling",
      "decision",
      "risk",
      "communication",
      "document",
      "data",
      "rollout",
    ],
    notes:
      "Distinct from GLB-17: that one suppresses work whose basis is gone, this one re-derives work whose basis may merely have moved. CMS-205 is the sharpest instance - a message is a claim about the world made when it was written.",
  },
  {
    id: "GLB-19",
    scope: "global",
    name: "Duplicate, late and out-of-order events are processed idempotently",
    problem:
      "A provider repeats a webhook, or a weaker outcome arrives after a stronger one, and the state moves twice or moves backwards.",
    rule: "An event that has already been applied changes nothing on a second arrival, and an event that reports less than what is already established does not overwrite it without explicit semantics saying it should.",
    appliesTo: ["integration", "processing", "financial", "communication", "structure", "data"],
    notes:
      "CMS-207 carries the fullest form, including the case where a channel's own semantics do make a late failure authoritative - in which case the rule is applied because it was written down, not because the event arrived last.",
  },
  {
    id: "GLB-20",
    scope: "global",
    name: "An unknown outcome is reconciled before any retry",
    problem:
      "A timeout is read as a failure and the operation is repeated, producing two payments, two shipments, two messages or two records - and the duplicate is found by whoever receives it.",
    rule: "An operation whose outcome could not be established is unknown rather than failed, and it is reconciled against the authoritative source before anything is retried where a duplicate would matter.",
    appliesTo: [
      "integration",
      "processing",
      "financial",
      "fulfillment",
      "remedy",
      "scheduling",
      "communication",
      "data",
      "rollout",
      "incident",
    ],
    notes:
      "Fourteen journeys route an unknown outcome to external reconciliation and suppress the retry while it runs. The qualifier matters: where a duplicate is genuinely harmless, retrying is the cheaper answer and CMS-206 says so explicitly.",
  },
  {
    id: "GLB-21",
    scope: "global",
    name: "Historical state is appended to, never overwritten",
    problem:
      "A correction, a new version or a new owner replaces what was there, and the record can no longer explain why anything downstream acted the way it did.",
    rule: "A correction, amendment, reversal, supersession or ownership change is recorded alongside what it replaces rather than in place of it, and historical actions stay attributed to whoever performed them.",
    appliesTo: [
      "structure",
      "terminal",
      "ownership",
      "financial",
      "remedy",
      "subscription",
      "decision",
      "risk",
      "document",
      "data",
      "control",
      "rollout",
    ],
    notes:
      "Thirty-three category rules state a form of this and all of them remain, because each names a different thing that becomes unexplainable: an invoice that matches no terms, an effect with no cause, a person who appears to have approved something before they existed in the account.",
  },
  {
    id: "GLB-22",
    scope: "global",
    name: "Restoration rebuilds from current state rather than replaying a snapshot",
    problem:
      "Access, capability or terms are restored from what they were when they were taken away, handing back a right that has independently expired since.",
    rule: "Restoring a suspended, held or paused state recomputes it from what is currently valid, never from a stored copy of what it was.",
    appliesTo: ["access", "identity", "subscription", "risk", "consent", "control"],
    notes:
      "ACC-79, IDN-90, SUB-169, RSK-193 and CTL-237 each carry a domain form. The shared failure is that the snapshot is usually older than the thing it is being applied to.",
  },
  {
    id: "GLB-23",
    scope: "global",
    name: "Declared, behavioral and inferred evidence do not substitute for authoritative",
    problem:
      "A click is recorded as a conversion, a model score as a fact about a person, or a self-reported state as a verified one, and a decision is then made on evidence that never carried it.",
    rule: "Business outcomes are established from authoritative events. Declared, behavioral and inferred evidence may prioritise work, request verification or open an investigation, and may not conclude one.",
    appliesTo: ["acquisition", "activation", "retention", "identity", "feedback", "risk", "communication", "incident"],
    notes:
      "Enforced structurally as well as stated: the validator rejects an inferred trigger that reaches an outcome or a handoff without passing a condition first. Communication telemetry deserves its own mention: an open or a read can be machine-generated by a privacy proxy or a scanner and may never correspond to a person at all, so engagement with a message is evidence about the message rather than authoritative evidence about intent or outcome.",
  },
  {
    id: "GLB-24",
    scope: "global",
    name: "Retry, reminder and escalation loops are bounded",
    problem:
      "A loop with no defined end looks like a working system from inside and like harassment, or an unowned case, from outside it.",
    rule: "Every retry, reminder, escalation and re-request runs against a budget, a ladder or a window fixed when it started, and the exhausted state is a defined outcome rather than the absence of one.",
    appliesTo: [
      "activation",
      "identity",
      "ownership",
      "feedback",
      "processing",
      "remedy",
      "communication",
      "decision",
      "rollout",
    ],
    notes:
      "The budget does not renew on engagement. CMS-208 fixes it at the first failure, OWN-55 bounds escalation by the ladder rather than by patience, and DEC-184 bounds information requests so a case cannot be round-tripped indefinitely.",
  },
  {
    id: "GLB-25",
    scope: "global",
    name: "Reconcile against the authoritative source before an irreversible act",
    problem:
      "A decision is taken on a derived, cached or locally computed value, and the irreversible thing that follows is wrong in a way that cannot be undone.",
    rule: "Where a state is held in more than one place, the authoritative source is established and reconciled before any action that cannot be reversed.",
    appliesTo: ["integration", "structure", "financial", "processing", "risk", "document", "data", "rollout"],
    notes:
      "INT-119 and DOC-220 both refuse rather than guess when authority cannot be determined, and RSK-199 refuses to block anybody on a usage figure that has not been established. Refusing is the point: the alternative is a confident wrong answer.",
  },
  {
    id: "GLB-26",
    scope: "global",
    name: "Suppression is scoped to what it concerns",
    problem:
      "A suppression created for one destination, one purpose or one order is applied at the person level, and somebody stops hearing about everything because one thing went wrong.",
    rule: "A suppression carries the scope it was created for, and is applied and released at that scope rather than at the widest one available.",
    appliesTo: ["consent", "communication", "risk", "access", "feedback", "fulfillment"],
    notes:
      "CON-38 states that a suppression without its scope cannot be released correctly. RSK-R4 states the same shape for restrictions - the smallest sufficient scope - and CON-36 holds contactability per destination precisely so that a dead address cannot become an unreachable person.",
  },
  {
    id: "GLB-27",
    scope: "global",
    name: "Channel delivery window",
    problem:
      "A message that is correct in every other respect arrives at three in the morning, and the channel it arrived on is the one the person then turns off.",
    rule: "A channel may carry a delivery window, evaluated in the recipient's local time where that applies. A send reaching the channel outside its window takes the outcome policy declares for that channel and purpose - queued until the window allows it, dropped if it would be stale by then, or bypassing the window where a governing rule explicitly exempts it.",
    appliesTo: ["communication", "consent", "scheduling", "incident", "document"],
    notes:
      "Being outside a window is not a delivery failure: it consumes no retry budget and produces no failure classification. A queued send revalidates its business state through CMS-205 when the window opens and is suppressed rather than delivered if it has gone stale. The window itself, the hours, and any weekday restriction are configuration - a channel, a purpose, a jurisdiction and a market may each carry different ones, and none of them is canonical. Mandatory, security and operational communication bypasses a window only where a governing rule says so, never because it feels urgent.",
  },
  {
    id: "GLB-28",
    scope: "global",
    name: "Priority does not imply cap bypass",
    problem:
      "A high-priority journey is blocked because a lower-priority one spent the allowance an hour ago, or - the opposite failure - priority is treated as a licence to ignore a limit that exists for a legal or safety reason.",
    rule: "A higher-priority journey is not exempt from a contact-pressure limit by virtue of winning a contest. It proceeds on capacity a lower-priority journey has consumed only where the cap's own policy permits it, and which caps permit it is a property of the cap rather than of the winner.",
    appliesTo: ["communication", "consent", "acquisition", "retention", "subscription", "feedback"],
    notes:
      "Three kinds of limit, distinguished by exactly this question. A hard cap comes from policy, regulation, safety or a channel constraint and priority never bypasses it unless the governing rule explicitly says so. A soft contact-pressure cap controls how much optional communication a person receives and a higher-authority journey may supersede it where policy allows. A journey or class cap is bounded frequency belonging to one lifecycle, and when a contest moves ownership the carry-over is stated rather than assumed. Any override window is configuration, not a canonical value.",
  },
  {
    id: "GLB-29",
    scope: "global",
    name: "Send-path evaluation order",
    problem:
      "The same rules, evaluated in a different sequence, produce a different answer - and neither ordering is written down, so nobody can say which result was correct.",
    rule: "The stages that decide whether a message may be sent are evaluated in a fixed order, and each stage answers a question the previous one has already settled. See SEND_PATH_ORDER for the sequence.",
    appliesTo: ["communication", "consent", "acquisition", "retention", "feedback", "subscription", "risk"],
    notes:
      "Ordering is the point: a stage that runs before another may narrow what that one sees, and reversing the two changes the outcome. Safety gates come first because nothing later can make an unsafe send acceptable; lifecycle supersession comes before competition because a journey that has lost ownership does not get to compete however urgent it thinks it is; and execution-time revalidation comes last because everything before it was decided against a state that may have moved since.",
  },
  {
    id: "GLB-30",
    scope: "global",
    name: "Exit conditions are scope-aware",
    problem:
      "One event is treated as a kill switch for everything, so a closed account stops the refund that closing it created, or a withdrawn marketing consent silences a security alert.",
    rule: "A lifecycle state change exits or suppresses only the journey instances it makes semantically incompatible. The name of an event never by itself means every journey ends.",
    appliesTo: ["consent", "terminal", "acquisition", "subscription", "financial", "remedy", "identity", "communication"],
    notes:
      "Deliberately narrower than the archive this library replaced, which terminated every journey on any of three events. Marketing consent withdrawn ends the optional communication that permission covered and leaves security, transactional, required operational and legally required communication to be evaluated on their own terms. An account closing ends normal activity, acquisition and adoption and leaves wind-down, final billing, refunds, disputes, data deletion, export and retention obligations running. Ineligibility blocks the newly prohibited action and does not destroy commitments already made, which reconcile through their own lifecycles.",
  },
  {
    id: "GLB-31",
    scope: "global",
    name: "Safety gates are global; their consequences are scoped",
    problem:
      "A suppression condition is evaluated globally and then applied globally, so an open complaint stops the message that would have resolved it.",
    rule: "Conditions such as absent permission, a closed account, legal ineligibility, a fraud or security hold, an open critical issue and a service-recovery pause are evaluated first, for every candidate. What each one then suppresses is decided by purpose, entity and journey scope rather than by the condition alone.",
    appliesTo: ["consent", "risk", "feedback", "identity", "terminal", "communication", "retention", "financial"],
    notes:
      "Evaluated globally, applied narrowly. Absent marketing permission suppresses optional marketing and leaves mandatory, security and transactional communication to its own rules. A closed account suppresses engagement and acquisition and leaves wind-down obligations. Legal ineligibility suppresses the prohibited action and leaves existing obligation reconciliation. A fraud or security hold suppresses the risky capability and leaves security and recovery communication, which is often the only way out of it. An open critical issue suppresses promotional asks, advocacy and upsell and leaves resolution and support communication. A service-recovery pause suppresses optional contact pressure and leaves recovery communication. The pause's duration is policy, not a canonical number.",
  },
];

/* The vocabularies GLB-27 and GLB-28 define. They are listed rather than
   described so that a policy layer has names to bind its configuration to,
   and so the validator can check the rules and the vocabulary have not
   drifted apart. */
export const DELIVERY_WINDOW_OUTCOMES: readonly DeliveryWindowOutcome[] = [
  "queue-until-allowed",
  "drop-if-stale",
  "bypass-if-exempt",
];

export const CONTACT_PRESSURE_CAP_CLASSES: readonly ContactPressureCapClass[] = [
  "hard",
  "soft-contact-pressure",
  "journey-or-class",
];

/* The order GLB-29 fixes. Every stage names the rules or journeys that own it,
   and the validator checks each of those still exists - so the sequence cannot
   quietly reference a mechanism that has been merged away. */
export const SEND_PATH_ORDER: readonly SendPathStage[] = [
  { step: 1, stage: "current state and hard safety gates", owner: ["GLB-31", "CON-35", "RSK-193"] },
  { step: 2, stage: "lifecycle ownership supersession", owner: ["GLB-04", "GLB-30", "ACQ-08"] },
  { step: 3, stage: "journey competition and precedence", owner: ["GLB-01", "GLB-02", "GLB-05"] },
  { step: 4, stage: "mutual exclusion", owner: ["GLB-03", "GLB-08"] },
  { step: 5, stage: "contact pressure and frequency policy", owner: ["GLB-28", "CON-34", "CON-39"] },
  { step: 6, stage: "purpose and permission", owner: ["CMS-203", "CON-35"] },
  { step: 7, stage: "contactability", owner: ["CMS-202", "CON-36"] },
  { step: 8, stage: "channel delivery window", owner: ["GLB-27"] },
  { step: 9, stage: "channel routing", owner: ["CMS-204"] },
  { step: 10, stage: "execution-time revalidation", owner: ["GLB-18", "CMS-205"] },
  { step: 11, stage: "send", owner: ["CMS-206"] },
];
