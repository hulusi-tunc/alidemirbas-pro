import type { CanonicalJourney, OrchestrationRule } from "./types";

/* CATEGORY 13 - PROCESSING, QUEUES, ASYNC WORK & OPERATIONAL RELIABILITY

   Whether our own system reliably finishes the work it agreed to do.

   Category 12 asked whether the other side is working. This one asks a
   question that is harder to answer honestly, because every signal available
   comes from us: the queue reports its own depth, the job reports its own
   success, the worker reports its own health. A system grading its own
   homework will pass, and the failures here are all versions of that.

     202 Accepted            so the work is done
     the job returned true   so the business outcome exists
     the queue is deep       so something is wrong
     it has run for an hour  so it is stuck
     the worker died         so the work failed
     capacity is back        so we are recovered

   None of those inferences holds, and each has a cost measured in work that
   quietly did not happen. So the category is built on one distinction that
   runs through every journey in it - technical completion is not business
   completion - and on one refusal: where a side effect may already have
   happened and we cannot tell, nothing is retried until we find out.

   That refusal appears in six of the ten journeys, which is why establishing
   what actually ran is named once as its own mechanism rather than reinvented
   in each of them. */

export const PROCESSING_RULES: readonly OrchestrationRule[] = [
  {
    id: "OPS-R1",
    scope: "processing",
    rule: "Accepted, queued, processing, stalled and completed are five distinct operational states.",
    because:
      "Collapsing them lets infrastructure acknowledgement stand in for business completion, which is the failure that produces a customer waiting on something a dashboard says is finished.",
  },
  {
    id: "OPS-R2",
    scope: "processing",
    rule: "Queue lag and external integration failure are separate problems with separate responses.",
    because:
      "One means we cannot keep up; the other means we cannot proceed. Queueing more work against a lagging system adds to the backlog that is already the problem.",
  },
  {
    id: "OPS-R3",
    scope: "processing",
    rule: "Long-running work is not automatically classified as stalled.",
    because:
      "Duration describes the work; loss of progress describes its health. Killing legitimate long jobs on a duration threshold produces exactly the failures the threshold was meant to catch.",
  },
  {
    id: "OPS-R4",
    scope: "processing",
    rule: "Retry eligibility requires both a transient failure and a safely repeatable operation.",
    because:
      "Transience alone justifies trying again; repeatability alone justifies it being harmless. Retrying on the first without the second is how one operation becomes two.",
  },
  {
    id: "OPS-R5",
    scope: "processing",
    rule: "Retry budgets are bounded and durable across worker restarts.",
    because:
      "A counter held in process memory renews itself every time a worker cycles, which turns a bounded policy into an unbounded loop that looks bounded in the code.",
  },
  {
    id: "OPS-R6",
    scope: "processing",
    rule: "An unknown side-effect state is reconciled before any replay.",
    because:
      "The whole risk of asynchronous work is that something may already have happened where we cannot see it, and replaying into that uncertainty is the one action that makes it worse.",
  },
  {
    id: "OPS-R7",
    scope: "processing",
    rule: "Deduplication operates on logical business-operation identity, not payload similarity.",
    because:
      "A customer buying the same item twice produces two identical payloads and two legitimate operations. Collapsing them is a worse failure than executing a duplicate, because they asked for both.",
  },
  {
    id: "OPS-R9",
    scope: "processing",
    rule: "A composite parent outcome requires an explicit aggregation policy. ALL, ANY and majority are never invented.",
    because:
      "The same rule as OWN-R8 and REL-R6, arriving from the processing side. A guessed aggregation rule is right for the cases it was imagined against and silently wrong for the rest.",
  },
  {
    id: "OPS-R10",
    scope: "processing",
    rule: "Dead-letter state creates a remediation obligation. It is not disposal.",
    because:
      "A queue nobody reviews is indistinguishable from deletion, except that it produces a reassuring metric while the work quietly does not happen.",
  },
  {
    id: "OPS-R11",
    scope: "processing",
    rule: "Worker failure and work failure are separate states.",
    because:
      "A worker dying says where the process was, not what the work did. The operation may have completed a moment before, and replaying it on that assumption repeats it.",
  },
  {
    id: "OPS-R12",
    scope: "processing",
    rule: "Backlog recovery revalidates delayed work before executing it.",
    because:
      "The world moved while the queue was stuck, and an instruction written against the old world is not automatically still correct just because it was once queued.",
  },
  {
    id: "OPS-R13",
    scope: "processing",
    rule: "A stale customer-facing action is not replayed merely because it was queued.",
    because:
      "Appropriateness has a shelf life. A message that was right on Tuesday arriving on Friday describes a state that has moved and reads as a system talking to itself.",
  },
  {
    id: "OPS-R14",
    scope: "processing",
    rule: "A recovery backlog is drained according to downstream capacity and current priority, not arrival order.",
    because:
      "Strict arrival order makes new urgent work wait behind old obsolete work, and an unthrottled drain takes down the capacity that has just come back.",
  },
  {
    id: "OPS-R15",
    scope: "processing",
    rule: "Technical job success and business outcome success are separate wherever the architecture requires additional confirmation.",
    because:
      "A job returning true reports that the code ran without raising. Whether the state it was supposed to create exists is a different question, and only one of them is what anyone actually wanted.",
  },
  {
    id: "OPS-R16",
    scope: "processing",
    rule: "Queue, job and work transitions and retries are idempotent and auditable.",
    because:
      "Every layer here retries by design, so a transition that is not idempotent is not at risk of double-applying - it is scheduled to.",
  },
  {
    id: "OPS-R17",
    scope: "processing",
    rule: "A stale job never overwrites a newer entity version.",
    because:
      "Jobs execute in the order workers pick them up, not the order decisions were made, so without a version check the most recent decision is the one most likely to be undone.",
  },
  {
    id: "OPS-R18",
    scope: "processing",
    rule: "Operational recovery preserves original deadlines and business context unless a governing policy explicitly changes them.",
    because:
      "The commitment was made to someone who is not waiting on our queue. Our backlog is our problem, and restarting their clock to accommodate it moves the cost onto them.",
  },
];

export const PROCESSING_JOURNEYS: readonly CanonicalJourney[] = [
  /* ------------------------------------------------------------ OPS-121 */
  {
    id: "OPS-121",
    slug: "async-work-lifecycle",
    category: "processing",
    goal: "progression-milestone",
    name: "Work accepted → queue → process → complete or fail",
    purpose:
      "Give asynchronous work explicit states so that acknowledging it, holding it, running it and finishing it are never read as the same event.",
    entity: {
      scope: "the individual work item, keyed by its own idempotency and correlation identifiers",
      note: "The record exists from acceptance. Work acknowledged to a caller but not recorded anywhere is work that will be lost without anyone knowing it existed.",
    },
    distinctFrom: [
      {
        journey: "OPS-130",
        because:
          "This ends when the job reports an outcome. OPS-130 begins there and asks whether the business state the job existed to create actually appeared, which is a separate question with its own answer.",
      },
    ],
    entry: "t.accepted",
    nodes: [
      {
        id: "t.accepted",
        kind: "trigger",
        event: "asynchronous_work_accepted",
        evidence: {
          requires: ["the system accepting a unit of asynchronous work on behalf of a business action"],
          insufficientAlone: [
            "a 202 returned to a caller, which acknowledges receipt and creates no durable record",
            "a message published with no work record behind it",
          ],
          source: "authoritative",
        },
        next: "a.persist",
      },
      {
        id: "a.persist",
        kind: "action",
        does: "Persist the work id, its type, the target entity, the request time, the request version and context, the priority where one is defined, and the idempotency and correlation keys. Record ACCEPTED - which acknowledges that we hold the work, not that anything has happened to it",
        writes: [{ field: "work_log", mode: "append" }],
        next: "c.immediate",
      },
      {
        id: "c.immediate",
        kind: "condition",
        asks: "Is capacity available to start now?",
        branches: [
          { label: "Start now", when: "a worker can pick it up immediately", to: "a.processing" },
          { label: "Must wait", when: "no capacity is currently free", to: "a.queued" },
        ],
      },
      {
        id: "a.queued",
        kind: "action",
        does: "Record QUEUED. Queued is a healthy state and not a failure - work waiting its turn is the normal condition of an asynchronous system",
        writes: [{ field: "work_log", mode: "append" }],
        next: "w.start",
      },
      {
        id: "w.start",
        kind: "wait",
        until: ["a worker starts the work", "the work is cancelled or invalidated"],
        onEvent: "c.started",
        timeout: {
          after: "the queue SLA threshold for this work class",
          reason:
            "work sitting past its SLA is a lag signal about the queue rather than a verdict about the item, and it belongs to the journey that measures lag",
        },
        onTimeout: "h.lag",
        windowExtendsOnEngagement: false,
      },
      {
        id: "h.lag",
        kind: "handoff",
        to: "OPS-122",
        on: "work exceeding its queue SLA without starting",
        carries: [
          "the work class, the item's age and its deadline",
          "the fact that the item has not failed - it has not been started",
        ],
      },
      {
        id: "c.started",
        kind: "condition",
        asks: "Which happened?",
        branches: [
          { label: "A worker took it", when: "execution began", to: "a.processing" },
          {
            label: "Cancelled or invalidated",
            when: "the work is no longer wanted or its target has gone",
            to: "x.cancelled",
          },
        ],
      },
      {
        id: "x.cancelled",
        kind: "exit",
        state: "cancelled before execution; nothing ran",
        terminal: false,
        reEntry: "the same business action requested again is a new work item with its own identifiers",
      },
      {
        id: "a.processing",
        kind: "action",
        does: "Record PROCESSING with the execution attempt - which worker, which attempt number, when it started. The attempt record is what makes a later stall or worker failure diagnosable rather than merely visible",
        writes: [{ field: "work_log", mode: "append" }],
        next: "w.execution",
      },
      {
        id: "w.execution",
        kind: "wait",
        until: ["the work reports an outcome"],
        onEvent: "c.outcome",
        timeout: {
          after: "the expected execution window for this work type",
          reason:
            "exceeding the window is a reason to go and look for progress, not a conclusion that there is none",
        },
        onTimeout: "h.stalled",
        windowExtendsOnEngagement: false,
      },
      {
        id: "h.stalled",
        kind: "handoff",
        to: "OPS-123",
        on: "work exceeding its execution window without an outcome",
        carries: [
          "the attempt record, the worker ownership and the lease",
          "which side effects the work is known to have produced so far",
        ],
      },
      {
        id: "c.outcome",
        kind: "condition",
        asks: "What outcome did the work report?",
        branches: [
          {
            label: "COMPLETED",
            when: "execution finished without error",
            to: "h.verify",
          },
          {
            label: "FAILED_RETRYABLE",
            when: "the failure is transient by classification",
            to: "h.retry",
          },
          {
            label: "FAILED_TERMINAL",
            when: "the failure cannot be resolved by repeating the work",
            to: "h.dead-letter",
          },
          {
            label: "UNKNOWN",
            when: "execution ended without establishing whether it did anything",
            to: "h.reconcile",
          },
        ],
      },
      {
        id: "h.verify",
        kind: "handoff",
        to: "OPS-130",
        on: "technical completion being reported",
        carries: [
          "the work item and the business state it was intended to create",
          "the explicit fact that the job reporting success is not yet the outcome existing",
        ],
      },
      {
        id: "h.retry",
        kind: "handoff",
        to: "OPS-124",
        on: "a failure classified as retryable",
        carries: ["the failure class, the attempt history and the side-effect certainty"],
      },
      {
        id: "h.dead-letter",
        kind: "handoff",
        to: "OPS-127",
        on: "a failure that repeating the work cannot resolve",
        carries: ["the failure reason and the full attempt history"],
      },
      {
        id: "h.reconcile",
        kind: "handoff",
        to: "external:side-effect-reconciliation",
        on: "an execution whose side-effect state is unknown",
        carries: [
          "the work, its idempotency key and everything known about how far it got",
          "the explicit fact that this is unknown rather than failed",
        ],
        suppresses: ["any retry of this work until its true state is established"],
      },
    ],
    guardrails: [
      "Accepted is not completed.",
      "Queued is not failed.",
      "Technical job completion does not imply the business outcome where additional authoritative confirmation is required.",
      "An unknown outcome is not retried until it has been reconciled.",
    ],
    reusableRule:
      "Asynchronous work requires explicit accepted, queued, processing and terminal states so infrastructure acknowledgement is not mistaken for business completion.",
  },

  /* ------------------------------------------------------------ OPS-122 */
  {
    id: "OPS-122",
    slug: "queue-lag",
    category: "processing",
    goal: "recovery-retry",
    name: "Queue lag → measure → prioritise, scale or degrade",
    purpose:
      "Respond to a queue that cannot keep up, measured by how old the unfinished work is rather than by how much of it there is.",
    entity: {
      scope: "the queue or workload class that is lagging, assessed per class",
      note: "Different work classes carry different SLAs. A single queue-wide verdict either over-reacts for the tolerant classes or under-reacts for the urgent ones.",
    },
    distinctFrom: [
      {
        journey: "INT-117",
        because:
          "INT-117 holds work because an integration has failed and cannot accept it. Here the dependency may be perfectly healthy and our own capacity is behind - queueing more against it makes the backlog worse rather than protecting anything.",
      },
    ],
    entry: "t.threshold",
    nodes: [
      {
        id: "t.threshold",
        kind: "trigger",
        event: "queue_latency_or_depth_threshold_crossed",
        evidence: {
          requires: ["queue latency or depth crossing a meaningful threshold for a workload class"],
          insufficientAlone: [
            "queue depth on its own, which says how much is waiting and nothing about whether anything is late",
            "a burst the current throughput will absorb",
          ],
          source: "behavioral",
        },
        next: "a.measure",
      },
      {
        id: "a.measure",
        kind: "action",
        does: "Measure depth, the age of the oldest unfinished item, throughput, arrival rate, which workload classes are affected and what SLA exposure that creates. Age is the signal that matters - a deep queue draining fast is healthy, and a shallow one that has not moved in an hour is not",
        writes: [{ field: "queue_health_log", mode: "append" }],
        next: "c.burst",
      },
      {
        id: "c.burst",
        kind: "condition",
        asks: "Is this a temporary burst the current throughput will absorb?",
        branches: [
          {
            label: "A burst",
            when: "arrival rate spiked and throughput will clear it within the SLA",
            to: "x.observe",
          },
          {
            label: "Material lag",
            when: "the oldest work is aging against its SLA and throughput is not closing the gap",
            to: "a.lagging",
          },
        ],
      },
      {
        id: "x.observe",
        kind: "exit",
        state: "observed; no operational response applied",
        terminal: false,
        reEntry:
          "most threshold crossings resolve here. Treating each one as an incident produces alert fatigue rather than reliability, and the alerts that matter arrive into a channel nobody reads",
      },
      {
        id: "a.lagging",
        kind: "action",
        does: "Record LAGGING for the affected workload classes, scoped to them rather than to the whole queue",
        writes: [{ field: "queue_health_log", mode: "append" }],
        next: "c.sla",
      },
      {
        id: "c.sla",
        kind: "condition",
        asks: "Is a customer or business SLA threatened?",
        branches: [
          {
            label: "Threatened",
            when: "work will miss a commitment made outside the system if the lag continues",
            to: "a.urgent",
          },
          {
            label: "Internal only",
            when: "the lag is real and no external commitment is at risk yet",
            to: "a.response",
          },
        ],
      },
      {
        id: "a.urgent",
        kind: "action",
        does: "Apply the operational response and degrade or escalate the affected capability. An external commitment at risk is what makes this urgent rather than merely untidy, and it is the difference between an engineering task and an incident",
        writes: [{ field: "queue_health_log", mode: "append" }],
        next: "h.escalate",
      },
      {
        id: "a.response",
        kind: "action",
        does: "Apply the defined operational response - capacity scaling, priority adjustment, delaying non-critical classes, rate control. Work is never silently dropped to make the metric look healthy, because that converts a visible backlog into an invisible loss",
        writes: [{ field: "queue_health_log", mode: "append" }],
        next: "w.recovery",
      },
      {
        id: "w.recovery",
        kind: "wait",
        until: ["throughput recovers and the oldest work returns to a normal age", "the lag worsens past the SLA threshold"],
        onEvent: "c.direction",
        timeout: {
          after: "the operational response window",
          reason:
            "a lag that neither clears nor worsens within its window is a steady state nobody chose, and steady states get escalated rather than watched",
        },
        onTimeout: "h.escalate",
        windowExtendsOnEngagement: false,
      },
      {
        id: "c.direction",
        kind: "condition",
        asks: "Which way did it move?",
        branches: [
          {
            label: "Recovered",
            when: "throughput is ahead of arrivals and the oldest work is aging down",
            to: "h.drain",
          },
          {
            label: "Worsened",
            when: "the lag crossed the SLA threshold",
            to: "h.escalate",
          },
        ],
      },
      {
        id: "h.drain",
        kind: "handoff",
        to: "OPS-129",
        on: "capacity recovering with a material backlog accumulated behind it",
        carries: [
          "the backlog inventory and the age distribution within it",
          "which classes were delayed and by how much",
        ],
      },
      {
        id: "h.escalate",
        kind: "handoff",
        to: "OWN-55",
        on: "lag threatening an external commitment or outliving its response window",
        carries: [
          "the affected classes, the oldest work age and the SLA exposure",
          "what operational response has already been applied",
        ],
      },
    ],
    guardrails: [
      "Queue depth alone is not severity.",
      "Different work classes carry different SLAs and are assessed separately.",
      "Work is never silently dropped to make queue metrics look healthy.",
      "This is not integration-failure queueing. The dependency may be entirely healthy.",
    ],
    reusableRule:
      "Queue health should be measured by the age and business importance of unfinished work, not merely by the number of queued items.",
  },

  /* ------------------------------------------------------------ OPS-123 */
  {
    id: "OPS-123",
    slug: "stalled-work-detection",
    category: "processing",
    goal: "recovery-retry",
    name: "Work stalled → detect lack of progress → recover, fail or escalate",
    purpose:
      "Distinguish work that is taking a long time from work that has stopped, and recover only where the side effects are known.",
    entity: {
      scope: "the individual in-flight work item and the worker that holds it",
      note: "Recovery has to coordinate ownership. Two workers reclaiming the same exclusive job is a worse outcome than the stall that prompted it.",
    },
    entry: "t.threshold",
    nodes: [
      {
        id: "t.threshold",
        kind: "trigger",
        event: "progress_threshold_exceeded_without_completion",
        evidence: {
          requires: [
            "work exceeding its expected progress threshold without an authoritative completion",
          ],
          insufficientAlone: [
            "a long execution duration, which describes the work rather than its health - some work legitimately takes hours",
          ],
          source: "behavioral",
        },
        next: "a.inspect",
      },
      {
        id: "a.inspect",
        kind: "action",
        does: "Inspect the last recorded progress, who owns it, whether the lease or lock is still live, whether it is blocked on an external dependency, the attempt state, and which side effects have already been produced. The last of those decides everything that follows",
        writes: [{ field: "work_log", mode: "append" }],
        next: "c.progressing",
      },
      {
        id: "c.progressing",
        kind: "condition",
        asks: "Is the work actually still making progress?",
        branches: [
          {
            label: "Still progressing",
            when: "checkpoints are advancing, or it is legitimately blocked on something that will return",
            to: "x.observe",
          },
          {
            label: "No progress",
            when: "nothing has advanced and nothing is legitimately blocking it",
            to: "a.stalled",
          },
        ],
      },
      {
        id: "x.observe",
        kind: "exit",
        state: "long-running, not stalled; observation continues",
        terminal: false,
        reEntry:
          "the threshold measured duration and found health. Killing legitimate long jobs on a duration rule produces exactly the failures the rule was written to catch",
      },
      {
        id: "a.stalled",
        kind: "action",
        does: "Record STALLED against this attempt, with what the inspection found",
        writes: [{ field: "work_log", mode: "append" }],
        next: "c.side-effects",
      },
      {
        id: "c.side-effects",
        kind: "condition",
        asks: "Is the side-effect state established?",
        branches: [
          {
            label: "Established",
            when: "we know what the attempt did and did not do",
            to: "c.recoverable",
          },
          {
            label: "Unknown",
            when: "the attempt may have produced effects we cannot see - a timeout proves nothing about what already ran",
            to: "h.reconcile",
          },
        ],
      },
      {
        id: "h.reconcile",
        kind: "handoff",
        to: "external:side-effect-reconciliation",
        on: "a stalled attempt whose side effects cannot be established",
        carries: [
          "the work, its idempotency key and the last known progress",
          "the explicit instruction that nothing is retried until the true state is known",
        ],
        suppresses: ["any reclaim or restart of this work while its effects are unknown"],
      },
      {
        id: "c.recoverable",
        kind: "condition",
        asks: "Can this be recovered safely under its execution semantics?",
        branches: [
          {
            label: "Safe to reclaim",
            when: "the operation is restartable or resumable and ownership can be transferred cleanly",
            to: "a.reclaim",
          },
          {
            label: "Not safely recoverable",
            when: "the operation cannot be repeated and no resume point exists",
            to: "h.escalate",
          },
        ],
      },
      {
        id: "a.reclaim",
        kind: "action",
        does: "Reclaim and restart according to the execution semantics, coordinating ownership so that two workers cannot recover the same exclusive job concurrently. The coordination is the point - an uncoordinated reclaim turns one stalled job into two running ones",
        writes: [{ field: "work_log", mode: "append" }],
        next: "x.recovered",
      },
      {
        id: "x.recovered",
        kind: "exit",
        state: "reclaimed and restarted under coordinated ownership",
        terminal: false,
        reEntry: "a further stall on the new attempt is assessed on its own evidence",
      },
      {
        id: "h.escalate",
        kind: "handoff",
        to: "OWN-55",
        on: "stalled work that cannot be safely recovered",
        carries: [
          "what the work was doing and how far it got",
          "the side effects it is known to have produced, which constrain what a person can safely do next",
        ],
      },
    ],
    guardrails: [
      "Long-running is not stalled.",
      "A timeout does not prove that no side effect occurred.",
      "Two workers must not concurrently recover the same exclusive job.",
      "An unknown side-effect state is reconciled before any reclaim.",
    ],
    reusableRule:
      "Stalled work is defined by loss of meaningful progress, not simply by exceeding an arbitrary execution duration.",
  },

  /* ------------------------------------------------------------ OPS-124 */
  {
    id: "OPS-124",
    slug: "retryable-failure-recovery",
    category: "processing",
    goal: "recovery-retry",
    name: "Retryable failure → backoff → retry → resolve or exhaust",
    purpose:
      "Repeat a transient failure within a bounded budget, only where repeating is safe and the work is still wanted.",
    entity: {
      scope: "the work item together with its durable attempt history",
      note: "The attempt count lives with the work, not with the worker. A counter that resets on restart is a budget that renews itself.",
    },
    distinctFrom: [
      {
        journey: "OPS-127",
        because:
          "Retry is automated recovery while it can still work. Dead-lettering is what happens once it has run out, and it produces a human obligation rather than another attempt.",
      },
    ],
    entry: "t.retryable",
    nodes: [
      {
        id: "t.retryable",
        kind: "trigger",
        event: "failure_classified_retryable",
        evidence: {
          requires: ["a failure classified as transient by an explicit classification"],
          insufficientAlone: [
            "any failure, on the assumption that retrying is free",
          ],
          source: "authoritative",
        },
        next: "a.record",
      },
      {
        id: "a.record",
        kind: "action",
        does: "Record the failure class, the attempt number, when it last failed, how certain we are about side effects, and retry eligibility. The attempt count is durable and does not reset because a worker restarted - a counter held in process memory is a retry budget that renews itself every deploy",
        writes: [{ field: "work_log", mode: "append" }],
        next: "c.safe",
      },
      {
        id: "c.safe",
        kind: "condition",
        asks: "Is retrying actually safe?",
        branches: [
          {
            label: "Safe to repeat",
            when: "the operation is idempotent, or its side effects are known not to have occurred",
            to: "a.backoff",
          },
          {
            label: "Side effects uncertain",
            when: "the failed attempt may already have produced effects we cannot see",
            to: "h.reconcile",
          },
          {
            label: "Not safely repeatable",
            when: "the operation cannot be repeated at all, whatever the failure class says",
            to: "h.dead-letter",
          },
        ],
      },
      {
        id: "h.reconcile",
        kind: "handoff",
        to: "external:side-effect-reconciliation",
        on: "a retryable failure with an uncertain side-effect state",
        carries: [
          "the work, its idempotency key and the attempt history",
          "the fact that transience alone does not make a replay safe",
        ],
        suppresses: ["the scheduled retry until the true state is established"],
      },
      {
        id: "a.backoff",
        kind: "action",
        does: "Calculate the policy-defined backoff for this attempt number",
        writes: [{ field: "work_log", mode: "append" }],
        next: "w.retry",
      },
      {
        id: "w.retry",
        kind: "wait",
        until: ["the work is cancelled or becomes obsolete"],
        onEvent: "x.cancelled",
        timeout: {
          after: "the calculated backoff interval",
          reason:
            "reaching the retry time is the ordinary path; the wait watches for the work stopping being wanted before it gets there",
        },
        onTimeout: "a.revalidate",
        windowExtendsOnEngagement: false,
      },
      {
        id: "x.cancelled",
        kind: "exit",
        state: "cancelled during backoff; no further attempt",
        terminal: false,
        reEntry: "the same business action requested again is a new work item",
      },
      {
        id: "a.revalidate",
        kind: "action",
        does: "Revalidate the work and its target entity against current state before attempting anything. Time passed during the backoff, and a retry that executes an instruction written against a state that has since moved is worse than not retrying at all",
        writes: [{ field: "work_log", mode: "append" }],
        next: "c.required",
      },
      {
        id: "c.required",
        kind: "condition",
        asks: "Is the work still required?",
        branches: [
          { label: "Still required", when: "the target state still needs what this work would do", to: "a.attempt" },
          {
            label: "No longer required",
            when: "the entity moved, the request was superseded, or the outcome arrived another way",
            to: "x.stale",
          },
        ],
      },
      {
        id: "x.stale",
        kind: "exit",
        state: "CANCELLED_STALE; the work is no longer required",
        terminal: false,
        reEntry:
          "cancelled rather than executed, with the reason recorded. A retry that runs stale work is a retry that succeeds at the wrong thing",
      },
      {
        id: "a.attempt",
        kind: "action",
        does: "Execute the retry idempotently, under the same idempotency key, so that a downstream that did receive the first attempt can absorb this one",
        writes: [{ field: "work_log", mode: "append" }],
        next: "c.result",
      },
      {
        id: "c.result",
        kind: "condition",
        asks: "What did the retry produce?",
        branches: [
          { label: "Succeeded", when: "the attempt completed", to: "h.verify" },
          {
            label: "Failed, budget remains",
            when: "another attempt is available within the bounded budget",
            to: "a.backoff",
          },
          {
            label: "Budget exhausted",
            when: "the policy's attempt limit has been reached",
            to: "h.dead-letter",
          },
        ],
      },
      {
        id: "h.verify",
        kind: "handoff",
        to: "OPS-130",
        on: "a retry reporting technical success",
        carries: ["the work and the business state it was meant to create", "the attempt history"],
      },
      {
        id: "h.dead-letter",
        kind: "handoff",
        to: "OPS-127",
        on: "automated recovery being exhausted or unavailable",
        carries: [
          "the full attempt history and every failure reason",
          "the last known side-effect state, which constrains what a controlled replay may do",
        ],
      },
    ],
    guardrails: [
      "Retry is bounded, and the bound is durable across worker restarts.",
      "A retry never executes stale work - the target is revalidated first.",
      "Side-effect uncertainty requires reconciliation before any replay.",
      "A transient failure classification alone does not make an operation safe to repeat.",
    ],
    reusableRule:
      "Retries should occur only when the failure is transient, the work remains valid and repeating the operation is known to be safe.",
  },

  /* ------------------------------------------------------------ OPS-125 */
  {
    id: "OPS-125",
    slug: "work-deduplication",
    category: "processing",
    goal: "reconciliation-correction",
    name: "Duplicate work detected → deduplicate → reuse, suppress or reconcile",
    purpose:
      "Stop the same logical operation running twice, without collapsing two legitimate repeats into one.",
    entity: {
      scope: "the logical business operation, and the work instances claiming to be it",
      note: "Identity is the business operation, not the payload. Two identical payloads can be two things someone genuinely asked for.",
    },
    entry: "t.duplicate",
    nodes: [
      {
        id: "t.duplicate",
        kind: "trigger",
        event: "potential_duplicate_work_detected",
        evidence: {
          requires: [
            "two or more work instances that may represent the same logical business operation",
          ],
          insufficientAlone: [
            "an identical payload, which can be a legitimate repeat - someone buying the same item twice produces the same payload and asked for both",
          ],
          source: "authoritative",
        },
        next: "a.compare",
      },
      {
        id: "a.compare",
        kind: "action",
        does: "Compare the stable identifiers: the idempotency key, the business operation identity, the target entity, the relevant version and the execution history. The deduplication window and scope follow the business semantics rather than a convenient interval",
        writes: [{ field: "dedup_log", mode: "append" }],
        next: "c.same",
      },
      {
        id: "c.same",
        kind: "condition",
        asks: "Is this the same logical operation?",
        branches: [
          {
            label: "Same operation",
            when: "the stable identifiers establish it as one operation delivered more than once",
            to: "c.canonical",
          },
          {
            label: "Different operations",
            when: "the payloads match and the business identity does not",
            to: "x.independent",
          },
        ],
      },
      {
        id: "x.independent",
        kind: "exit",
        state: "processed independently; not a duplicate",
        terminal: false,
        reEntry:
          "collapsing two legitimate repeats is a worse failure than executing a duplicate, because the customer asked for both and only one arrives",
      },
      {
        id: "c.canonical",
        kind: "condition",
        asks: "What state is the canonical execution in?",
        branches: [
          {
            label: "Completed",
            when: "the canonical work finished and its result is still valid",
            to: "a.reuse",
          },
          {
            label: "In progress",
            when: "the canonical work is running",
            to: "a.attach",
          },
          {
            label: "Completed with a conflicting outcome",
            when: "the instances disagree about what happened",
            to: "h.reconcile",
          },
        ],
      },
      {
        id: "a.reuse",
        kind: "action",
        does: "Reuse the existing result where it remains valid, and suppress the duplicate execution rather than running it and discarding the output",
        writes: [{ field: "dedup_log", mode: "append" }],
        next: "x.suppressed",
      },
      {
        id: "x.suppressed",
        kind: "exit",
        state: "duplicate suppressed; canonical result reused",
        terminal: false,
        reEntry: "a genuinely new operation on the same entity is a new instance with its own key",
      },
      {
        id: "a.attach",
        kind: "action",
        does: "Attach to the in-flight execution and wait for its outcome rather than starting a second one, where the architecture permits it. Where it does not, the duplicate is suppressed instead",
        writes: [{ field: "dedup_log", mode: "append" }],
        next: "x.attached",
      },
      {
        id: "x.attached",
        kind: "exit",
        state: "attached to the canonical execution",
        terminal: false,
        reEntry: "the canonical execution's outcome resolves both",
      },
      {
        id: "h.reconcile",
        kind: "handoff",
        to: "external:side-effect-reconciliation",
        on: "duplicate instances reporting conflicting outcomes",
        carries: [
          "each instance, its identifiers and what it reports",
          "the target entity's current state, which is the only thing that can settle it",
        ],
      },
    ],
    guardrails: [
      "An identical payload is not necessarily the same logical operation.",
      "Legitimate repeated business actions are never collapsed accidentally.",
      "The deduplication window and scope match the business semantics rather than an implementation convenience.",
    ],
    reusableRule:
      "Deduplication prevents repeated execution of the same logical operation without suppressing legitimate repeated business actions.",
  },

  /* ------------------------------------------------------------ OPS-126 */
  {
    id: "OPS-126",
    slug: "partial-processing-recovery",
    category: "processing",
    goal: "recovery-retry",
    name: "Partial processing → preserve completed work → retry only the failed scope",
    purpose:
      "Recover the part of a composite operation that failed, without re-running the part that worked.",
    entity: {
      scope: "the composite job and each child operation individually",
      note: "Children are classified individually and the parent state is recomputed from them. A single verdict across the batch either replays successes or abandons recoverable failures.",
    },
    entry: "t.mixed",
    nodes: [
      {
        id: "t.mixed",
        kind: "trigger",
        event: "composite_processing_mixed_outcomes",
        evidence: {
          requires: ["a composite, batch or fan-out operation ending with children in different states"],
          source: "authoritative",
        },
        next: "a.classify",
      },
      {
        id: "a.classify",
        kind: "action",
        does: "Classify each child as COMPLETED, FAILED_RETRYABLE, FAILED_TERMINAL, PENDING or UNKNOWN, and record PARTIALLY_COMPLETED for the parent. Successful children are never replayed - in a batch with side effects, re-running the successes is a larger incident than the original failure",
        writes: [{ field: "composite_work_log", mode: "append" }],
        next: "c.policy",
      },
      {
        id: "c.policy",
        kind: "condition",
        asks: "Is an aggregation policy defined for this parent?",
        branches: [
          {
            label: "Defined",
            when: "a policy states what child outcomes the parent requires and what it tolerates",
            to: "c.children",
          },
          {
            label: "Not defined",
            when: "nothing states how the children combine into a parent outcome",
            to: "h.undefined",
          },
        ],
      },
      {
        id: "h.undefined",
        kind: "handoff",
        to: "DEC-181",
        on: "a composite outcome with no aggregation policy to combine it",
        carries: [
          "each child and its outcome",
          "the explicit fact that no ALL, ANY or majority rule was invented in order to produce a parent state",
        ],
      },
      {
        id: "c.children",
        kind: "condition",
        asks: "What do the unresolved children need?",
        branches: [
          {
            label: "Independently retryable",
            when: "the failed children can be retried on their own without touching the successes",
            to: "h.retry",
          },
          {
            label: "Terminal, and the policy tolerates it",
            when: "the parent's policy permits completion with these children failed",
            to: "a.recompute",
          },
          {
            label: "Terminal, and completed children must be compensated",
            when: "the governing transaction semantics require unwinding what succeeded",
            to: "h.compensate",
          },
          {
            label: "Unknown children",
            when: "some children ended without establishing what they did",
            to: "h.reconcile",
          },
        ],
      },
      {
        id: "h.retry",
        kind: "handoff",
        to: "OPS-124",
        on: "failed children that can be retried independently",
        carries: [
          "only the failed child scope",
          "the explicit boundary that the completed children are not part of this retry",
        ],
      },
      {
        id: "h.compensate",
        kind: "handoff",
        to: "external:correction-or-compensation",
        on: "transaction semantics requiring completed children to be unwound",
        carries: [
          "the children that completed and what each of them did",
          "the failure that made compensation necessary",
        ],
      },
      {
        id: "h.reconcile",
        kind: "handoff",
        to: "external:side-effect-reconciliation",
        on: "children whose side-effect state cannot be established",
        carries: ["each unknown child, its identifiers and how far it got"],
      },
      {
        id: "a.recompute",
        kind: "action",
        does: "Recalculate the parent state from the authoritative child outcomes using the aggregation policy, rather than from the events that reported them. Partial completion is not total failure, and the parent's state has to be able to say which of the two it is",
        writes: [{ field: "composite_work_log", mode: "append" }],
        next: "x.recomputed",
      },
      {
        id: "x.recomputed",
        kind: "exit",
        state: "parent state recomputed from authoritative child outcomes",
        terminal: false,
        reEntry: "a further child outcome recomputes the parent again from source",
      },
    ],
    guardrails: [
      "Successful child operations are never replayed.",
      "Partial completion is not total failure.",
      "ALL, ANY and majority aggregation semantics are never invented.",
      "Compensation happens only where the governing transaction semantics require it.",
    ],
    reusableRule:
      "Partial processing should preserve confirmed successful work and recover only the unresolved scope unless transaction semantics require compensation.",
  },

  /* ------------------------------------------------------------ OPS-127 */
  {
    id: "OPS-127",
    slug: "dead-letter-remediation",
    category: "processing",
    goal: "escalation-exception",
    name: "Dead-letter entry → diagnose → replay, correct or close",
    purpose:
      "Turn work that automation could not finish into an obligation someone owns, rather than a queue nobody reads.",
    entity: {
      scope: "the dead-lettered item, linked to the original work it came from",
      note: "The link back is what makes a later replay attributable. A corrected payload with no relationship to the original is a new job that hides a failure.",
    },
    distinctFrom: [
      {
        journey: "OPS-124",
        because:
          "Retry is the automated stage and ends when its budget does. This begins there, and what it produces is a diagnosis and an owner rather than another attempt.",
      },
    ],
    entry: "t.exhausted",
    nodes: [
      {
        id: "t.exhausted",
        kind: "trigger",
        event: "work_exhausted_automated_recovery",
        evidence: {
          requires: [
            "work that has exhausted its automated retry policy, or has reached a state automation cannot process",
          ],
          source: "authoritative",
        },
        next: "a.preserve",
      },
      {
        id: "a.preserve",
        kind: "action",
        does: "Preserve the original payload or a reference to it, the target entity, the full attempt history, the failure reasons, the last known side-effect state, and the created and dead-lettered timestamps. Dead-lettered is not deleted - it is work automation could not finish, and someone now owns it",
        writes: [{ field: "dead_letter_log", mode: "append" }],
        next: "c.uncertain",
      },
      {
        id: "c.uncertain",
        kind: "condition",
        asks: "Is the side-effect state uncertain?",
        branches: [
          {
            label: "Uncertain",
            when: "the failed attempts may have produced effects we cannot see",
            to: "h.reconcile",
          },
          {
            label: "Established",
            when: "we know what did and did not happen",
            to: "c.remediation",
          },
        ],
      },
      {
        id: "h.reconcile",
        kind: "handoff",
        to: "external:side-effect-reconciliation",
        on: "a dead-lettered item whose side effects cannot be established",
        carries: [
          "the work, its identifiers and the full attempt history",
          "the explicit instruction that no replay happens until the true state is known",
        ],
        suppresses: ["any controlled replay of this item while its effects are unknown"],
      },
      {
        id: "c.remediation",
        kind: "condition",
        asks: "What would resolve this?",
        branches: [
          {
            label: "A data or configuration correction",
            when: "the authoritative problem is fixable and the work would then succeed",
            to: "a.correct",
          },
          {
            label: "The work is now obsolete",
            when: "what it would have done no longer needs doing",
            to: "a.close",
          },
          {
            label: "Manual execution is required",
            when: "a person has to do what automation could not",
            to: "h.manual",
          },
          {
            label: "Not yet diagnosable",
            when: "the failure cannot be classified from what is recorded",
            to: "w.review",
          },
        ],
      },
      {
        id: "a.correct",
        kind: "action",
        does: "Correct the authoritative problem, then create a controlled replay linked to the original work. The replay is a new attempt with its own record and does not reset the original's audit history - correcting a payload preserves the relationship to what first failed",
        writes: [{ field: "dead_letter_log", mode: "append" }],
        next: "x.replayed",
      },
      {
        id: "x.replayed",
        kind: "exit",
        state: "corrected and replayed under a new attempt linked to the original",
        terminal: false,
        reEntry: "a replay that fails again dead-letters on its own record, with the chain intact",
      },
      {
        id: "a.close",
        kind: "action",
        does: "Close the item as obsolete with the reason recorded. Closing with a reason and abandoning silently produce the same queue depth and entirely different accountability",
        writes: [{ field: "dead_letter_log", mode: "append" }],
        next: "x.obsolete",
      },
      {
        id: "x.obsolete",
        kind: "exit",
        state: "closed as obsolete, with a recorded reason",
        terminal: false,
        reEntry: "the same business need arising again is new work rather than this item revived",
      },
      {
        id: "h.manual",
        kind: "handoff",
        to: "DEC-181",
        on: "work that only a person can complete",
        carries: [
          "the original work, its context and everything automation tried",
          "operational ownership, so the item has a name against it rather than a queue position",
        ],
      },
      {
        id: "w.review",
        kind: "wait",
        until: ["the failure is diagnosed and a remediation is chosen"],
        onEvent: "c.remediation",
        timeout: {
          after: "the dead-letter review horizon",
          reason:
            "an item nobody has looked at past its horizon is the queue becoming invisible storage, which is the state this journey exists to prevent",
        },
        onTimeout: "h.escalate",
        windowExtendsOnEngagement: false,
      },
      {
        id: "h.escalate",
        kind: "handoff",
        to: "OWN-55",
        on: "dead-lettered work aging past its review horizon undiagnosed",
        carries: [
          "the item, its age and what it was for",
          "the fact that a dead-letter queue nobody reviews is indistinguishable from deletion, except that it produces a reassuring metric",
        ],
      },
    ],
    guardrails: [
      "Dead-lettered is not deleted work.",
      "A manual replay does not reset the audit history.",
      "Correcting a payload preserves the relationship to the original work.",
      "The dead-letter queue does not become permanent invisible storage - items age against a review horizon.",
    ],
    reusableRule:
      "Dead-letter handling converts exhausted automated work into an explicit remediation obligation rather than silently abandoning it.",
  },

  /* ------------------------------------------------------------ OPS-128 */
  {
    id: "OPS-128",
    slug: "worker-failure-reclaim",
    category: "processing",
    goal: "recovery-retry",
    name: "Worker or processor failure → reclaim work → resume safely",
    purpose:
      "Move execution responsibility off a failed worker without assuming the work failed and without letting two workers hold it.",
    entity: {
      scope: "the failed worker and each in-flight work item it owned",
      note: "The lease is the coordination mechanism. Replaying while the previous lease may still be live is how one job becomes two running copies.",
    },
    entry: "t.worker-down",
    nodes: [
      {
        id: "t.worker-down",
        kind: "trigger",
        event: "worker_unavailable_while_owning_work",
        evidence: {
          requires: ["a worker becoming unavailable while holding in-flight work"],
          insufficientAlone: [
            "a missed heartbeat, which can be a network partition rather than a dead process - and a partitioned worker is still working",
          ],
          source: "authoritative",
        },
        next: "a.identify",
      },
      {
        id: "a.identify",
        kind: "action",
        does: "Identify the affected work using the lease, the heartbeat, the execution record, any checkpoint and the ownership metadata",
        writes: [{ field: "work_log", mode: "append" }],
        next: "c.lease",
      },
      {
        id: "c.lease",
        kind: "condition",
        asks: "Could the previous lease still be live?",
        branches: [
          {
            label: "Possibly live",
            when: "the lease has not expired and the worker may be partitioned rather than dead",
            to: "w.lease",
          },
          {
            label: "Expired or released",
            when: "the lease has definitively ended",
            to: "c.confirmed",
          },
        ],
      },
      {
        id: "w.lease",
        kind: "wait",
        until: ["the original worker completes or releases the work"],
        onEvent: "x.original",
        timeout: {
          after: "the remaining lease duration",
          reason:
            "waiting out the lease is what prevents two workers running the same job, and it costs a delay rather than a duplicate",
        },
        onTimeout: "c.confirmed",
        windowExtendsOnEngagement: false,
      },
      {
        id: "x.original",
        kind: "exit",
        state: "the original worker finished it; no reclaim needed",
        terminal: false,
        reEntry:
          "a missed heartbeat is not a dead process, and this is the outcome that justifies waiting rather than reclaiming immediately",
      },
      {
        id: "c.confirmed",
        kind: "condition",
        asks: "Is the work's completion already confirmed?",
        branches: [
          {
            label: "Already completed",
            when: "an authoritative completion exists for this work",
            to: "x.no-replay",
          },
          {
            label: "Not completed",
            when: "no completion is recorded",
            to: "c.resume",
          },
        ],
      },
      {
        id: "x.no-replay",
        kind: "exit",
        state: "already completed; nothing replayed",
        terminal: false,
        reEntry:
          "worker death is not work failure. The operation may have finished a moment before the process went, and replaying on that assumption repeats it",
      },
      {
        id: "c.resume",
        kind: "condition",
        asks: "How can execution be resumed?",
        branches: [
          {
            label: "From a valid checkpoint",
            when: "a checkpoint records how far the work got and is safe to resume from",
            to: "a.checkpoint",
          },
          {
            label: "Safely restartable from the start",
            when: "the operation is idempotent, or nothing it did needs undoing",
            to: "a.restart",
          },
          {
            label: "Side-effect status unknown",
            when: "the work may have produced effects that a restart would repeat",
            to: "h.reconcile",
          },
        ],
      },
      {
        id: "a.checkpoint",
        kind: "action",
        does: "Resume from the checkpoint under new ownership, so the completed portion is not repeated",
        writes: [{ field: "work_log", mode: "append" }],
        next: "x.resumed",
      },
      {
        id: "a.restart",
        kind: "action",
        does: "Reclaim and restart idempotently, with ownership coordinated so no second worker can take it concurrently",
        writes: [{ field: "work_log", mode: "append" }],
        next: "x.resumed",
      },
      {
        id: "x.resumed",
        kind: "exit",
        state: "execution responsibility transferred; work resumed under new ownership",
        terminal: false,
        reEntry: "a further worker failure on the new owner is assessed on its own lease",
      },
      {
        id: "h.reconcile",
        kind: "handoff",
        to: "external:side-effect-reconciliation",
        on: "in-flight work whose side-effect state cannot be established after a worker failure",
        carries: [
          "the work, its idempotency key and its last checkpoint",
          "the explicit instruction that nothing is restarted until the true state is known",
        ],
        suppresses: ["any reclaim of this work while its effects are unknown"],
      },
    ],
    guardrails: [
      "Worker death is not work failure.",
      "Work is not replayed while the previous lease may still be valid.",
      "Recovery coordinates ownership so two workers cannot hold the same job.",
      "An unknown side-effect state is reconciled before any restart.",
    ],
    reusableRule:
      "Worker failure should transfer execution responsibility without assuming that the underlying business operation failed or never ran.",
  },

  /* ------------------------------------------------------------ OPS-129 */
  {
    id: "OPS-129",
    slug: "backlog-recovery-drain",
    category: "processing",
    goal: "recovery-retry",
    name: "Backlog recovery → revalidate → controlled drain → normal state",
    purpose:
      "Work through an accumulated backlog deliberately, discarding what has gone stale and pacing what has not.",
    entity: {
      scope: "the accumulated backlog, inventoried by workload class",
      note: "Arrival order is not the drain order. New urgent work should not wait behind old obsolete work simply because the old work arrived first.",
    },
    distinctFrom: [
      {
        journey: "INT-118",
        because:
          "INT-118 repairs a gap in what we received from outside during an outage. This drains work we already hold and could not process. One is missing information; the other is unfinished work.",
      },
    ],
    entry: "t.capacity",
    nodes: [
      {
        id: "t.capacity",
        kind: "trigger",
        event: "processing_capacity_recovered_with_backlog",
        evidence: {
          requires: ["processing capacity recovering with a material backlog accumulated behind it"],
          insufficientAlone: [
            "capacity recovering with nothing accumulated, which needs no recovery journey",
          ],
          source: "authoritative",
        },
        next: "a.inventory",
      },
      {
        id: "a.inventory",
        kind: "action",
        does: "Inventory the backlog by age, priority, business validity, deadline, dependency and customer impact. The inventory is what turns the drain into a decision rather than a flush",
        writes: [{ field: "backlog_log", mode: "append" }],
        next: "c.relevant",
      },
      {
        id: "c.relevant",
        kind: "condition",
        asks: "Is all the accumulated work still relevant?",
        branches: [
          {
            label: "Some is stale",
            when: "part of the backlog describes states that have moved, or actions no longer appropriate",
            to: "a.cancel",
          },
          {
            label: "All still relevant",
            when: "everything held still needs doing",
            to: "a.strategy",
          },
        ],
      },
      {
        id: "a.cancel",
        kind: "action",
        does: "Cancel or suppress the stale work with its reason recorded. A customer-facing action that was right when it was queued may be wrong now, and delivering it because it was once queued is the specific failure this step prevents",
        writes: [{ field: "backlog_log", mode: "append" }],
        next: "a.strategy",
      },
      {
        id: "a.strategy",
        kind: "action",
        does: "Determine the drain strategy - priority-based, rate-limited, dependency-aware, oldest-valid-first, or whatever the policy defines. New high-priority work does not necessarily wait behind older obsolete backlog, and a strict arrival order would make it",
        writes: [{ field: "backlog_log", mode: "append" }],
        next: "a.drain",
      },
      {
        id: "a.drain",
        kind: "action",
        does: "Drain gradually, within downstream capacity, preserving each item's original deadline and business context",
        writes: [{ field: "backlog_log", mode: "append" }],
        next: "w.monitor",
      },
      {
        id: "w.monitor",
        kind: "wait",
        until: [
          "latency for new work rises, the failure rate climbs, or downstream capacity is exceeded",
        ],
        onEvent: "a.throttle",
        timeout: {
          after: "the backlog returning to a normal range",
          reason:
            "the ordinary end of a drain is the backlog clearing; the wait watches for the drain itself becoming the problem",
        },
        onTimeout: "x.normal",
        windowExtendsOnEngagement: false,
      },
      {
        id: "a.throttle",
        kind: "action",
        does: "Reduce the drain rate. A recovery that takes the system down again is not a recovery, and the second outage looks like a new fault rather than our own doing",
        writes: [{ field: "backlog_log", mode: "append" }],
        next: "c.floor",
      },
      {
        id: "c.floor",
        kind: "condition",
        asks: "Can the rate be reduced further and still make progress?",
        branches: [
          {
            label: "Room to slow down",
            when: "a lower rate is available above the floor at which the backlog stops shrinking",
            to: "a.drain",
          },
          {
            label: "At the floor",
            when: "the backlog cannot be drained even at the minimum rate the system tolerates",
            to: "h.escalate",
          },
        ],
      },
      {
        id: "x.normal",
        kind: "exit",
        state: "NORMAL; backlog drained and the system stable",
        terminal: false,
        reEntry: "a further incident accumulates its own backlog with its own inventory",
      },
      {
        id: "h.escalate",
        kind: "handoff",
        to: "OWN-55",
        on: "a backlog that cannot be drained at any safe rate",
        carries: [
          "the remaining backlog, its age distribution and its deadline exposure",
          "the fact that capacity has recovered and is still not sufficient, which is a capacity decision rather than an incident",
        ],
      },
    ],
    guardrails: [
      "Recovery does not release everything at once.",
      "An old communication or action may no longer be appropriate, and is cancelled with a reason rather than delivered.",
      "New high-priority work does not necessarily wait behind obsolete backlog.",
      "Original deadlines and business context are preserved through the drain.",
    ],
    reusableRule:
      "Backlog recovery should revalidate and deliberately drain accumulated work rather than replaying every delayed action in original arrival order.",
  },

  /* ------------------------------------------------------------ OPS-130 */
  {
    id: "OPS-130",
    slug: "business-outcome-verification",
    category: "processing",
    goal: "delivery-confirmation",
    name: "Technical completion → verify business outcome → finalize or reconcile",
    purpose:
      "Check that the state a job existed to create actually exists, wherever the job's own success is not proof of it.",
    entity: {
      scope: "the completed technical job and the business entity it was meant to change",
      note: "Verification is idempotent, so checking twice costs nothing and proves the same thing. That is what makes it safe to run on every completion.",
    },
    entry: "t.technical",
    nodes: [
      {
        id: "t.technical",
        kind: "trigger",
        event: "technical_processing_reported_success",
        evidence: {
          requires: ["a technical job reporting completion"],
          insufficientAlone: [
            "no exception being thrown, which is the absence of a reported error rather than the presence of a result",
          ],
          source: "authoritative",
        },
        next: "c.authoritative",
      },
      {
        id: "c.authoritative",
        kind: "condition",
        asks: "Is technical completion itself authoritative for business completion here?",
        branches: [
          {
            label: "Authoritative",
            when: "the job's own success is the business fact - it wrote the record it reports having written",
            to: "a.finalize",
          },
          {
            label: "Not authoritative",
            when: "the business state lives somewhere the job cannot confirm from inside itself",
            to: "a.verify",
          },
        ],
      },
      {
        id: "a.finalize",
        kind: "action",
        does: "Finalize the work as complete, recording that technical completion was authoritative for this work type",
        writes: [{ field: "work_log", mode: "append" }],
        next: "x.complete",
      },
      {
        id: "x.complete",
        kind: "exit",
        state: "complete; technical success was the business fact",
        terminal: false,
        reEntry: "further work on the same entity is its own item",
      },
      {
        id: "a.verify",
        kind: "action",
        does: "Verify the business state the work was meant to create - the record exists, the state transitioned, the resource is available, the balance updated, the entitlement applied, the downstream system acknowledged. The verification is idempotent, so running it on every completion costs nothing and proves the same thing each time",
        writes: [{ field: "work_log", mode: "append" }],
        next: "c.confirmed",
      },
      {
        id: "c.confirmed",
        kind: "condition",
        asks: "What does verification show?",
        branches: [
          {
            label: "Confirmed",
            when: "the expected business state exists",
            to: "a.business-complete",
          },
          {
            label: "Missing or conflicting",
            when: "the job reported success and the state it was supposed to produce is not there",
            to: "x.reconciliation",
          },
          {
            label: "Still pending asynchronously",
            when: "the state is expected to appear and has not yet",
            to: "w.pending",
          },
        ],
      },
      {
        id: "a.business-complete",
        kind: "action",
        does: "Record BUSINESS_COMPLETED, which is the state that closes the obligation the work existed to serve",
        writes: [{ field: "work_log", mode: "append" }],
        next: "x.business-complete",
      },
      {
        id: "x.business-complete",
        kind: "exit",
        state: "BUSINESS_COMPLETED; the intended state exists and was checked",
        terminal: false,
        reEntry: "further work on the same entity is its own item",
      },
      {
        id: "w.pending",
        kind: "wait",
        until: ["the expected business state appears"],
        onEvent: "a.business-complete",
        timeout: {
          after: "the outcome window for this state",
          reason:
            "a state that has not appeared within its window is a discrepancy rather than a delay, and it needs reconciling rather than more patience",
        },
        onTimeout: "x.reconciliation",
        windowExtendsOnEngagement: false,
      },
      {
        id: "x.reconciliation",
        kind: "exit",
        state: "RECONCILIATION_REQUIRED; technical success without the business state it implies",
        terminal: false,
        reEntry:
          "the job's SUCCESS does not close the user's or the business's obligation when the state it was supposed to produce is not there - this exit exists so that gap is visible rather than reported as done",
      },
    ],
    guardrails: [
      "No exception thrown is not business success.",
      "A job reporting SUCCESS does not close a user or business obligation when the required state was not produced.",
      "Verification is idempotent.",
      "An outcome still pending asynchronously stays pending - completion is not claimed early.",
    ],
    reusableRule:
      "Technical processing is complete only at the infrastructure layer; business completion requires confirmation of the state the work was intended to create.",
  },
];
