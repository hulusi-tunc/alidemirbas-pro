# Runtime Mechanisms — readiness matrix

Generated mechanically from `runtime-mechanism-contracts.json` (source of truth for the counts
below); see `RUNTIME-MECHANISMS-AUDIT.md` for the full per-mechanism narrative and
`build/build-matrix.mjs` in the scratch build directory for how this table is derived. This is an
AUDIT-ONLY round — no `src/canonical/*.ts` file, validator, or production file was touched to
produce this table; "Runtime change?" records what the mechanism's own graph would need in a
future repair round, not anything already done.

Totals: 24 mechanisms — READY 4, READY_WITH_MAPPING 13,
NEEDS_CONTRACT_WORK 6, NEEDS_RUNTIME_CHANGE 1. P0 1, P1 6, P2
12, total findings 19.

| Mechanism | Responsibility | Readiness | P0 | P1 | Side-effect class | Main gap | Runtime change? |
|---|---|---|---|---|---|---|---|
| CMS-201 (Communication Obligation Creation) | Decide whether a business event actually creates a communication obligation, and deduplic… | NEEDS_RUNTIME_CHANGE | 1 | 0 | writes-internal-state | [concurrency] The obligation entity created by a.create has no declared identity (no idempotencyKey/attemptBudget, no insta… | Yes |
| CMS-202 (Recipient Resolution) | Resolve who an obligation is actually owed to and which of their destinations currently w… | READY_WITH_MAPPING | 0 | 0 | writes-internal-state | [idempotency] w.authorization's onTimeout path (a.no-route) and the verification wait itself have no declared attempt/idemp… | No |
| CMS-203 (Channel Eligibility Resolution) | Decide whether a working destination may carry this specific message, given its purpose -… | READY | 0 | 0 | decides-only | none found | No |
| CMS-204 (Channel Routing) | Pick the smallest channel set that satisfies the obligation and prepare the message insta… | NEEDS_CONTRACT_WORK | 0 | 1 | writes-internal-state | [idempotency] a.prepare creates "a channel-compatible message instance" with no declared identity for it. CMS-206 later per… | No |
| CMS-205 (Send Eligibility Check) | Re-check the message is still true immediately before it is submitted, and stop or regene… | READY | 0 | 0 | writes-internal-state | none found | No |
| CMS-206 (Send Attempt Status) | Record the handover to a provider - accepted, refused, or unknown - as a fact about the p… | READY_WITH_MAPPING | 0 | 0 | submits-to-provider | [idempotency] attempt_id/message_id are named explicitly in prose as the correlation identity but are never declared as an … | No |
| CMS-207 (Delivery Outcome Reconciliation) | Derive real delivery state from what the channel reports, correlated to the exact attempt… | READY | 0 | 0 | writes-internal-state | none found | No |
| CMS-208 (Message Delivery Recovery) | Classify a delivery failure by its real cause and respond with the smallest correct actio… | NEEDS_CONTRACT_WORK | 0 | 1 | submits-to-provider | [caller-callee-contract] distinctFrom OPS-124 states this mechanism "uses that retry machinery rather than being it," but the graph sh… | No |
| CMS-210 (Communication Obligation Closure) | Close a communication obligation against the completion standard it actually requires - a… | READY_WITH_MAPPING | 0 | 0 | writes-internal-state | [idempotency] No declared identity guards against re-processing the same obligation-closure decision twice; low risk given … | No |
| CON-34 (Frequency Recalculation) | Recalculate optional-communication cadence when a frequency preference changes, prospecti… | NEEDS_CONTRACT_WORK | 0 | 1 | suppresses-queued-work | [consumer-coverage] No canonical journey hands off into CON-34 and CON-34 hands off to nothing - it is the only mechanism in the … | No |
| CON-35 (Permission Change Enforcement) | Stop affected communication the moment permission changes, and propagate the change to de… | READY_WITH_MAPPING | 0 | 0 | suppresses-queued-work | [idempotency] origin and version are named explicitly as the mechanism that prevents an out-of-order echo from reverting st… | No |
| CON-36 (Contactability Recalculation) | Track whether a specific destination can technically be reached, entirely separate from w… | READY_WITH_MAPPING | 0 | 0 | suppresses-queued-work | [idempotency] "Repair attempts are bounded per cycle" is a stated guardrail with no attemptBudget Config declared anywhere … | No |
| CON-39 (Communication Cooldown) | Hold optional communication for a bounded window without touching permission, scoped to o… | READY_WITH_MAPPING | 0 | 0 | writes-internal-state | none found | No |
| CON-40 (Permission Conflict Resolution) | Hold optional communication closed while distributed systems disagree about permission, a… | READY_WITH_MAPPING | 0 | 0 | suppresses-queued-work | [idempotency] origin/version, load-bearing for the entire reconciliation's correctness, are never declared fields - same sy… | No |
| OPS-121 (Asynchronous Work Processing) | Give asynchronous work explicit accepted/queued/processing/terminal states so infrastruct… | NEEDS_CONTRACT_WORK | 0 | 1 | writes-internal-state | [idempotency] a.persist explicitly states it records "the idempotency and correlation keys," naming the concept by its exac… | No |
| OPS-122 (Queue Lag Management) | Measure whether a queue can keep up, by the age of its oldest unfinished item rather than… | READY | 0 | 0 | writes-internal-state | none found | No |
| OPS-123 (Stalled Work Recovery) | Distinguish work that is merely slow from work that has actually stopped, and recover onl… | READY_WITH_MAPPING | 0 | 0 | transfers-ownership | [concurrency] "Coordinating ownership" during reclaim is stated as a guardrail but never named as a concrete primitive (a l… | No |
| OPS-124 (Retry Management) | Repeat a transient failure within a durable, bounded budget, only where repeating is safe… | NEEDS_CONTRACT_WORK | 0 | 1 | submits-to-provider | [idempotency] "The same idempotency key" the retry executes under is never declared as a field on this mechanism - the seco… | No |
| OPS-125 (Work Deduplication) | Stop the same logical business operation from running twice, without collapsing two legit… | READY_WITH_MAPPING | 0 | 0 | suppresses-queued-work | [idempotency] the idempotency key this mechanism compares against is never defined here or anywhere upstream - same systemi… | No |
| OPS-126 (Partial Processing Recovery) | Recover the failed part of a composite/batch operation without re-running the part that a… | NEEDS_CONTRACT_WORK | 0 | 1 | writes-internal-state | [consumer-coverage] No canonical journey in the current 283-journey corpus is confirmed to produce composite/fan-out/batch work t… | No |
| OPS-127 (Dead-Letter Recovery) | Turn work automation could not finish into an explicit, owned remediation obligation rath… | READY_WITH_MAPPING | 0 | 0 | creates-task-or-obligation | none found | No |
| OPS-128 (Worker Failure Recovery) | Transfer execution responsibility off a failed worker without assuming the work itself fa… | READY_WITH_MAPPING | 0 | 0 | transfers-ownership | none found | No |
| OPS-129 (Backlog Recovery) | Deliberately drain an accumulated backlog - discarding what has gone stale, pacing what h… | READY_WITH_MAPPING | 0 | 0 | writes-internal-state | none found | No |
| OPS-130 (Business Outcome Verification) | Check that the business state a job existed to create actually exists, wherever the job's… | READY_WITH_MAPPING | 0 | 0 | writes-internal-state | none found | No |
