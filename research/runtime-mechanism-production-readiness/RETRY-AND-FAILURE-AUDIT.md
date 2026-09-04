# Runtime Mechanisms — retry and failure audit

What happens after a failure is classified: retryable, terminal, unknown, timeout, cancellation,
late callback, attempt budgets, and the double-retry-ownership risk this round's brief names
explicitly. Companion to `SIDE-EFFECT-AND-IDEMPOTENCY-AUDIT.md`.

## POST-REPAIR UPDATE

**The CMS-208/OPS-124 retry-ownership ambiguity below is resolved: CMS-208 owns its own complete
channel-aware retry loop end-to-end and does not delegate to OPS-124.** `CMS-208`'s own
`distinctFrom` is corrected to state this explicitly (reading 1 in the section below is now the
settled architecture, not an open question), reasoned from the graph's own already-self-contained
shape and from channel-specific failure classification being domain knowledge OPS-124 deliberately
does not carry (Option B of the three architectures the repair brief offered — the smallest change
consistent with existing corpus semantics). `a.retry` now declares a formal `attemptBudget`
(`required: true`, no invented number) scoped to `(message_id, destination_id)` — one durable
budget, not two. `OPS-124`'s own `a.attempt` now separately declares its own `attemptBudget`
scoped to `(work_id, logical_operation_key)` for the generic-work case it actually owns; the two
budgets are for genuinely different operations, not a shared one split in two.

Both mechanisms' attempt budgets are now structural (`ActionNode.attemptBudget`), not prose-only —
see `SIDE-EFFECT-AND-IDEMPOTENCY-AUDIT.md`'s post-repair update. The unknown-outcome table below
(8 of 8 correct) is unchanged by this round: the logic was already correct, only the identity
fields it depends on were formalized. **The rest of this document is the original audit-round
text, kept for reference — where it frames CMS-208/OPS-124 as an unresolved question, that
question is now answered as described above.**

## The retry contract, corpus-wide (audit-round record)

Five mechanisms own an actual retry loop or a retry-adjacent budget: `CMS-208`, `OPS-121` (via its
own `h.retry` handoff, though the loop itself lives downstream), `OPS-124` (the generic engine),
`OPS-126` (delegates failed children to `OPS-124`), `OPS-127` (a controlled, one-shot replay after
correction, not a loop). Every one of them gets the following right, without exception:

- **Failure is classified before anything is retried.** `CMS-208`'s explicit
  `TEMPORARY`/`PROVIDER_FAILURE`/`RATE_LIMITED`/`PERMANENT`/`INVALID_DESTINATION`/
  `CHANNEL_RESTRICTED`/`UNKNOWN` taxonomy; `OPS-121`/`OPS-124`/`OPS-126`'s generic
  `FAILED_RETRYABLE`/`FAILED_TERMINAL`/`UNKNOWN` classes. No mechanism anywhere in the round
  retries on the strength of "it failed" alone.
- **Retry is gated on safety, not just transience.** `OPS-124`'s `c.safe` explicitly separates "is
  the failure transient" from "is repeating this operation safe" — the exact distinction
  OPS-R4 states as its own rule ("retry eligibility requires both a transient failure and a safely
  repeatable operation"). A failure classified retryable with an uncertain side-effect state routes
  to reconciliation, never to backoff.
- **Budgets are bounded and, where declared durable, explicitly not worker-scoped.** `OPS-124`:
  "the attempt count lives with the work, not with the worker. A counter that resets on restart is
  a budget that renews itself." `CMS-208`: "the retry budget is fixed at the first failure and does
  not renew." Neither invents a specific count or duration — both correctly defer to "the policy"
  or "the budget," honoring the DO-NOT list's ban on invented timing values.
- **Revalidation precedes every retry attempt.** `OPS-124`'s `a.revalidate` re-checks the target
  entity against current state after every backoff, before deciding whether the work is even still
  required (`c.required` → `x.stale` if not) — this is the retry-specific instance of the
  freshness house rule, and it is structurally present as its own node, not a convention.
- **The retry itself executes idempotently.** `OPS-124`'s `a.attempt`: "under the same idempotency
  key, so that a downstream that did receive the first attempt can absorb this one." (The key
  itself being undeclared is `SIDE-EFFECT-AND-IDEMPOTENCY-AUDIT.md`'s finding, not repeated here.)

## The one real gap: CMS-208 vs. OPS-124, who owns the retry budget

`CMS-208`'s own `distinctFrom` block says: *"OPS-124 is the generic retryable-failure and backoff
mechanism. This decides what a communication failure means... It uses that retry machinery rather
than being it."* Read `CMS-208`'s graph and no handoff into `OPS-124` exists anywhere — `a.retry`
leads directly to `c.budget`, a self-contained loop with its own budget check (`x.retrying` →
back to itself on failure, `c.fallback`/`h.contactability` on exhaustion), never touching `OPS-124`.

Two readings are both defensible from the text alone, and this audit does not resolve which is
intended — that is exactly what a repair round needs to settle:

1. **The prose is describing an implementation detail invisible at the canonical-graph level** — a
   real implementation of CMS-208's `a.retry` node might literally call into an OPS-124-shaped
   execution primitive under the hood, and the canonical graph is silent about implementation
   plumbing by design (the same way it never names a database). If so, this is a documentation
   clarity issue only.
2. **CMS-208 genuinely reimplements a second, independent retry-budget tracker** for the same
   class of failure OPS-124 already owns for generic work. If a communication delivery failure is
   *also* wrapped in `OPS-121`'s own work lifecycle (plausible — a send is asynchronous work), it
   could be tracked by both CMS-208's own budget and OPS-124's, with no shared attempt identity
   between them — the brief's own named anti-pattern: *"caller retries AND mechanism retries...
   without shared attempt identity."*

This is `CMS-208`'s one P1 finding. The fix, whichever reading turns out correct, is a contract
clarification (does CMS-208 own its own budget, full stop, or does it delegate) rather than a
canonical graph change — no node needs to move, only the relationship needs to be stated
unambiguously.

## Unknown outcome, corpus-wide: the round's strongest guardrail

Eight mechanisms name an explicit unknown/indeterminate outcome and every one of them handles it
correctly — routed to reconciliation, never resent blindly:

| Mechanism | Vocabulary | Reconciliation target |
|---|---|---|
| CMS-206 | DELIVERY_UNKNOWN (send-attempt timeout) | h.reconcile → external:external-status-reconciliation, or h.recover → CMS-208 only when a duplicate would be harmless |
| CMS-207 | DELIVERY_UNKNOWN (ambiguous channel report) | h.reconcile → external:external-status-reconciliation |
| OPS-121 | UNKNOWN (execution outcome) | h.reconcile → external:side-effect-reconciliation, with an explicit suppress on retry |
| OPS-123 | side-effect state unknown after a stall | h.reconcile → external:side-effect-reconciliation |
| OPS-124 | side effects uncertain before backoff | h.reconcile → external:side-effect-reconciliation |
| OPS-127 | side-effect state uncertain in a dead-lettered item | h.reconcile → external:side-effect-reconciliation |
| OPS-128 | side-effect status unknown after worker failure | h.reconcile → external:side-effect-reconciliation |
| OPS-130 | RECONCILIATION_REQUIRED (job succeeded, business state missing) | surfaced directly - the exit IS the signal |

`CMS-206`'s branch is the one genuine nuance worth naming explicitly: an unknown submission outcome
is *not* automatically routed to reconciliation - `c.duplicates` asks "would a duplicate matter for
this communication?" first, and only routes to reconciliation when it would (a payment link, a
code, anything ambiguous doubled). Where a duplicate is harmless, it resends via `h.recover`
directly. This is a more nuanced, and more defensible, policy than a blanket "always reconcile,
never resend" rule - it correctly treats "safe to duplicate" as a real, distinct case rather than
collapsing it into the unsafe one.

## Timeout and cancellation

Every wait node among the 24 that times out into a consequential action was checked for whether
timeout means "operation failed" or "we stopped waiting" - and every one of them means the latter,
correctly:

- `OPS-121`'s `w.start`/`w.execution` timeouts hand off to `OPS-122`/`OPS-123` respectively -
  explicitly not a failure verdict, just "old enough to look at" (queue lag) or "no progress
  detected" (possible stall). Neither timeout closes the work.
- `OPS-124`'s `w.retry` (the backoff wait) has `x.cancelled` as its own event branch, distinct from
  the timeout path - a cancellation arriving during backoff is handled as a first-class outcome,
  not conflated with the backoff simply elapsing.
- `OPS-128`'s `w.lease` explicitly waits out a possibly-still-live lease before reclaiming, and its
  own reEntry text states the reasoning precisely: "a missed heartbeat is not a dead process."
- `CON-38`/`CON-39` (the latter one of the 24) both discard backlog rather than replay it on
  release - "expiry does not restart a stale campaign queue."
- `CMS-206`'s `w.acceptance` onTimeout leads to `a.unknown`, not to a failure verdict - the
  submission may well have succeeded; the timeout only means the provider's answer did not arrive
  in time.

No instance was found anywhere in the 24 of a timeout being silently treated as "the operation did
not happen" when the graph's own text does not support that conclusion. The one open question
(CMS-206's late-callback handling, noted in `RUNTIME-MECHANISMS-AUDIT.md`'s CMS-206 section) is a
P2, not a pattern.

## Attempt budgets: durable where it matters, unenforced structurally everywhere

`OPS-124` and `CMS-208` are the only two mechanisms whose retry budget is explicitly reasoned about
as durable/non-renewing. Neither declares an `attemptBudget` `Config` (the field exists on
`ActionNode` and goes unused across all 24, same as `idempotencyKey`). This is recorded once here,
not as a separate P1/P2 on each - it is the identical fact as `SIDE-EFFECT-AND-IDEMPOTENCY-AUDIT.md`'s
central finding, viewed from the retry angle rather than the idempotency angle.
