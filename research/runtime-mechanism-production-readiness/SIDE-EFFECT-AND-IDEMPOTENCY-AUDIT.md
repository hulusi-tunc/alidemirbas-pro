# Runtime Mechanisms — side-effect and idempotency audit

Every side-effecting mechanism among the 24, its attempt-identity story, and whether a retry can
duplicate what it did. Companion to `RETRY-AND-FAILURE-AUDIT.md` (which covers what happens once a
failure is classified) and `RUNTIME-MECHANISMS-AUDIT.md`'s per-mechanism `IDEMPOTENCY / ATTEMPT
IDENTITY` sections (the underlying data this document summarizes).

## The corpus-wide fact this document exists to explain

Zero of the 24 mechanisms declare `idempotencyKey` or `attemptBudget` on any action — both fields
already exist on `ActionNode` in `src/canonical/types.ts` and are used pervasively across the
customer-facing corpus (post-repair, all 64 Silent Lifecycle States and 71 message-sending/
human-routing journeys carry them). Their total absence here is not a schema gap; it is an
authoring gap specific to this domain. **Eight of the 24 name the underlying concept explicitly in
prose without ever declaring it as a field:**

| Mechanism | What it names | Structural field? |
|---|---|---|
| OPS-121 | "the idempotency and correlation keys" (a.persist) | No |
| OPS-124 | "the same idempotency key" (a.attempt) | No |
| OPS-125 | "the idempotency key, the business operation identity" (a.compare) | No |
| CMS-206 | "the message id, the attempt id" (a.persist, minted before outcome known) | No |
| CON-35 | "origin and version" (a.propagate) | No |
| CON-40 | "origin and version," "idempotent versioned writes" (a.apply, a.verify) | No |
| OPS-127 | attempt linked to original (a.correct: "a new attempt with its own record") | No |
| OPS-128 | lease, checkpoint | No |

This is the round's single most consequential finding, present as a P1 on the two mechanisms where
it is most load-bearing (`OPS-121`, the domain's structural root; `OPS-124`, the generic retry
engine every other retry-shaped mechanism either delegates to or duplicates) and a P2 elsewhere.
It is recorded once here rather than as 8 independent findings because it is the same fact in
every case: **the concept is fully reasoned through; the field is never declared.**

## Side-effect boundary, by class

| Class | Count | Mechanisms |
|---|---|---|
| writes-internal-state | 22 | all except CMS-203 (reads-only) and OPS-122 (decides-only, aggregate) |
| decides-only | 17 | every mechanism that has at least one pure evaluation step |
| reads-only | 4 | CMS-202, CMS-203, CMS-205 (partially), OPS-130 (partially) |
| submits-to-provider | 3 | CMS-206, CMS-208, OPS-124 (via its own a.attempt) |
| suppresses-queued-work | 5 | CMS-201 (indirectly via a.reuse), CON-34, CON-35, CON-36, CON-39, CON-40 |
| transfers-ownership | 2 | OPS-123, OPS-128 |
| creates-task-or-obligation | 1 | OPS-127 (dead-letter, becomes a human obligation) |

The three `submits-to-provider` mechanisms are exactly the three this audit scrutinized hardest for
duplicate-submission risk, and exactly the three with the round's best attempt-identity reasoning
(`CMS-206`'s pre-outcome attempt persistence, `CMS-208`'s budget-fixed-at-first-failure, `OPS-124`'s
durable-budget-plus-idempotent-reattempt). The correlation is not coincidental: the mechanisms whose
own designers clearly understood they were crossing an irreversible boundary reasoned about it
correctly; the one that does not cross such a boundary as visibly (`CMS-201`, which only writes an
internal obligation record) is exactly the one that got the concurrency guard wrong.

## Effectively-once vs. at-least-once vs. best-effort, by mechanism

Using the corpus's own vocabulary rather than inventing new terms, since none of the 24 name their
own execution semantics with a term from this exact list:

- **Effectively-once (idempotent consumer over an at-least-once channel):** `CMS-207` (explicit
  `c.idempotent` classification of every inbound delivery event), `OPS-130` (explicitly stated:
  "verification is idempotent, so checking twice costs nothing"), `CON-40`'s `a.verify`
  ("idempotent versioned writes so verification cannot itself become another round of the
  exchange").
- **At-least-once + idempotent-by-intent, not idempotent-by-construction:** `CMS-206` (attempt
  correlation exists, but nothing prevents a second, independently-minted attempt for the same
  logical send if `a.persist` is invoked twice from upstream), `OPS-121`/`OPS-124` (the "same
  idempotency key" language claims this, but the key itself is undeclared, so whether a caller
  can actually reuse it correctly on retry is unverified rather than false).
- **Best-effort, correctly labeled as such:** `CMS-201`'s obligation creation, which this audit
  found does not even reach at-least-once-safe status - see the P0 finding.
- **Not applicable (no external or durable side effect to duplicate):** `CMS-202`, `CMS-203`,
  `CMS-204` (partially - see below), `OPS-122`.

## The one genuinely open question this audit did not resolve: CMS-204's prepared-message identity

`CMS-204`'s `a.prepare` creates "a channel-compatible message instance," which `CMS-206` later
treats as already having "the message id" by the time it persists an attempt against it. Nowhere
between the two is a message id explicitly minted. This is flagged as a P1 on `CMS-204` rather than
elevated further because the downstream attempt-correlation machinery (`CMS-206`) would very likely
still prevent an actual duplicate provider submission even if `CMS-204` produced two prepared
instances for one obligation - the risk is contained by the next mechanism in the chain, not
structurally absent. Worth resolving explicitly in the repair round: where is the message id
minted, and is `a.prepare` safe to re-invoke.

## What "solved" looks like in this corpus: CMS-207 and OPS-130, worked examples

Two mechanisms are worth reading as reference implementations for a repair round, since they
already do, in full, what this document's own recommendation would otherwise have to specify from
scratch:

- **CMS-207's `c.idempotent`** classifies every inbound event into exactly three buckets before
  any write: new-and-current (act on it), already-processed (`x.duplicate-event`, a first-class
  no-op exit), late-and-weaker (`a.late`, recorded without overwriting stronger evidence). A
  repair round's `attemptIdentity` contract for any mechanism consuming an at-least-once external
  callback should look like this.
- **OPS-130's idempotent-by-construction verification** ("checking twice costs nothing and proves
  the same thing each time") is the correct shape for any read-only or pure-recompute
  confirmation step, and needs no attempt identity at all - the absence of one here is not a gap,
  because nothing about running it twice is unsafe.
