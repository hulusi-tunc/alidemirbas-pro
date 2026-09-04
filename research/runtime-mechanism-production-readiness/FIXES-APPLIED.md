# Runtime Mechanism Fixes Applied

This document records what changed in the repair round that followed
`RUNTIME-MECHANISMS-AUDIT.md`'s initial audit (READY 4 / READY_WITH_MAPPING 13 /
NEEDS_CONTRACT_WORK 6 / NEEDS_RUNTIME_CHANGE 1, P0 1 / P1 6 / P2 12). Every fix below is verified
against current source, not against the audit's own wording — several of the audit's open
questions were resolved by re-reading the mechanism after the fact, not by assuming the audit's
framing was final.

## Corpus

24 Runtime Mechanisms, re-derived from `src/canonical/surface.ts`'s `MECHANISM_IDS` against
post-repair source: unchanged — `CMS-201`–`CMS-208` + `CMS-210` (9), `CON-34`/`35`/`36`/`39`/`40`
(5), `OPS-121`–`OPS-130` (10). Every mechanism's own node count is identical to the pre-repair
audit dump, confirmed by re-running the same text-eval dump script (`dump.mjs`) and diffing node
counts one mechanism at a time. **Zero canonical graph topology changed anywhere in this round.**
Total canonical journeys: 283, unchanged (68 + 3 + 64 + 24 + 124).

## P0

### CMS-201: Communication Obligation Creation — the check-then-act race

**Before:** `c.existing` evaluates "is an equivalent communication obligation already outstanding
for this recipient" as a prose read; `a.create` then unconditionally creates a new obligation on
the `c.existing` → false branch. Neither node describes an atomic guard between the read and the
write.

**Race:** two concurrent deliveries of the same `authoritative_business_event` for the same
`(recipient_id, obligation_subject)` — realistic under any at-least-once message-queue delivery
guarantee, not a theoretical scenario — both evaluate `c.existing` before either commits `a.create`.
Both read "none exists." Both create. Two obligations now exist for one business event, directly
contradicting CMS-R1/R2's own stated purpose (stop duplicate business events from creating
duplicate communication obligations).

**After:** `a.create` is now atomically create-if-absent on the composite identity
`(recipient_id, obligation_subject)`. `entity.instanceKey: ["recipient_id", "obligation_subject"]`,
`entity.concurrency: "one-active-per-key"`; `entity.note` documents the invariant explicitly and
states that `a.create` — not `c.existing` — is the authority that actually settles the identity;
`c.existing`'s own asks/branch text is corrected to describe itself as a non-authoritative fast
path ("as far as a non-atomic read can tell... this branch only decides whether it is worth
trying"), not the safety mechanism. `a.create`'s `does` text is rewritten to state the atomic
create-if-absent behavior and that it mints `obligation_id` deterministically from
`(recipient_id, obligation_subject)`. `idempotencyKey: "recipient_id + obligation_subject +
a.create"`. A losing concurrent caller resolves to the existing obligation rather than creating a
duplicate — **return existing, never error, never a duplicate**, exactly as the repair brief's
Part 1 requires.

**Atomic invariant:** for one logical obligation identity `(recipient_id, obligation_subject)`,
concurrent execution produces at most one canonical obligation. Implementation-neutral —
create-if-absent / compare-and-set / atomic-upsert-with-uniqueness / idempotent-creation-by-
stable-natural-key are all valid realizations; none is named, no database technology is named, per
the brief's own instruction.

**Validator/test:** a `testScenarios` entry (`concurrent-invocation`) in the contract states the
race and the required resolution explicitly. No mechanical validator can prove atomicity of an
external implementation from the canonical graph alone — the guard here is the declared
`idempotencyKey` + `entity.concurrency` + the `does`-text invariant statement, which is the same
shape of fix both earlier production-readiness rounds used for equivalent races (there was no
narrower mechanical check available in either prior round either).

**Graph topology:** unchanged. No node added, removed, or rewired — `a.create` is the same node,
made atomic by contract rather than by adding a check-then-act guard node, per the brief's explicit
"no unnecessary graph nodes."

## Systemic contract repairs

### Idempotency

All 24 mechanisms now declare `entity.instanceKey` and `entity.concurrency:
"one-active-per-key"`. Every writing `ActionNode` across the 24 declares `idempotencyKey`, scoped
to the mechanism's own instance identity (or a documented coarser identity where the fine-grained
one is not yet resolved at that point in the pipeline — e.g. `CMS-206`'s `a.correlate` keys on
`raw_status_reference` before `attempt_id` is confirmed; `CMS-201`'s `a.evaluate` keys on
`recipient_id` alone before `obligation_subject` is known). This closes
`SIDE-EFFECT-AND-IDEMPOTENCY-AUDIT.md`'s central finding — the 8 mechanisms that named the concept
in prose without a field (`OPS-121`, `OPS-124`, `CMS-206`, `CON-35`, `CON-40`, `OPS-125`, `OPS-127`,
`OPS-128`) now carry it structurally, using the existing `ActionNode.idempotencyKey`/`attemptBudget`
schema primitives — no parallel framework was invented, per Part 2's explicit instruction.

Read-only decision nodes were deliberately **not** given idempotency keys mechanically — a
`decides-only`/`reads-only`-classed action with no durable write (e.g. `CMS-203`'s pure permission
evaluation) has nothing to deduplicate, and adding a key there would be noise, per Part 4's explicit
caution against mechanically adding keys to read-only nodes.

### Attempt identity

The three-identity model (Part 3) is realized concretely per mechanism, with the distinction
documented in `entity.note` wherever it applies:

- **`OPS-121` / `OPS-124`**: `logical_operation_key` is the caller-supplied invocation/dedup
  identity, unchanged across every retry and sent downstream so a receiver that got attempt 1 can
  absorb attempt 2; `work_id` is the mechanism's own record identity, minted at acceptance;
  `attempt_number` is a separate, mechanism-internal-only counter, never sent downstream. This is
  the corpus's clearest instance of Part 3's warning — "do not encode attempt number into a key
  meant to prevent duplicate logical side effects" — applied directly: `OPS-124`'s `a.attempt` keys
  on `logical_operation_key` alone, deliberately excluding `attempt_number`.
- **`CMS-204` → `CMS-205` → `CMS-206`**: `message_id` (minted deterministically from `obligation_id`
  at `CMS-204`'s `a.prepare`) is the stable per-obligation identity; `attempt_id` (minted by
  `CMS-205`'s `a.send`, before submission) is fresh per physical send attempt, caller-supplied into
  `CMS-206`. Attempt identity exists **before** external side-effect submission, never minted after,
  per Part 5 — `CMS-205` mints `attempt_id` as part of its own validated-and-ready decision, prior to
  `CMS-206` ever running.
- **`OPS-127`**: `replay_id` (fresh per replay attempt) linked to `original_work_id` (the identity of
  the dead-lettered item being replayed) — a parent-child attempt chain, minted at `a.correct`.
- **`OPS-128`**: `lease_id` (fresh per ownership transfer) minted at `a.checkpoint`/`a.restart`, kept
  distinct from `work_id` (the job's own stable identity).
- **`CON-35` / `CON-40`**: `change_version` (advances per change) and `change_origin` (identifies the
  authoritative system that made the change) together form an optimistic-concurrency ordering pair,
  minted at `CON-35`'s `a.record` and propagated/verified against at `CON-40`'s `a.apply`/`a.verify`.

**Provenance is established before submission everywhere it matters**, satisfying Part 5: no
mechanism mints an attempt identity after the side effect it correlates.

### Retry ownership

`CMS-208`/`OPS-124`'s ambiguity is resolved as **Option B** of the three architectures the brief
offered: CMS-208 owns its own complete channel-aware retry loop end-to-end; OPS-124 is not invoked.
`CMS-208`'s `distinctFrom` is rewritten to state this explicitly and to explain why — channel-
specific failure classification (`TEMPORARY`/`PROVIDER_FAILURE`/`RATE_LIMITED`/`PERMANENT`/
`INVALID_DESTINATION`/`CHANNEL_RESTRICTED`) is domain knowledge OPS-124 deliberately does not carry,
and passing it into a generic engine to delegate correctly would contradict OPS-124's own
deliberately-generic design. This was chosen over Option A (CMS-208 classifies, OPS-124 exclusively
retries) because CMS-208's graph was already fully self-contained (`a.retry` → `c.budget` →
`x.retrying`, no handoff into OPS-124 anywhere) — correcting the prose to match the already-correct
graph is the smaller change than rewiring the graph to match the prose, per the brief's own
"smallest architecture consistent with existing corpus semantics" instruction. Option C (a third,
higher-level orchestrating mechanism) was not pursued — nothing in the corpus's current shape calls
for a third mechanism where two already suffice once their relationship is stated correctly.

**Single retry budget**: `CMS-208`'s `a.retry` now declares `attemptBudget: {key:
"delivery_recovery.retry_budget", rule: "Fixed once at the first failure and does not renew...",
required: true}` — no invented numeric value, `required: true` rather than a fabricated default,
per Part 9. `OPS-124`'s `a.attempt` separately declares its own `attemptBudget` scoped to
`(work_id, logical_operation_key)`, for the generic-work case it actually governs. These are two
budgets for two genuinely different operations (a communication delivery vs. a generic async
work item), not one budget artificially split — consistent with Part 9's "a nested mechanism must
not create an independent budget unless governing a genuinely different operation."

### Unknown outcome

Unchanged in substance — the audit's 8/8-correct finding was already correct and is preserved
exactly as found, per Part 10's explicit instruction not to touch what already works. The repair
round's only change here is structural: the attempt-identity fields these unknown-outcome paths
correlate against (`attempt_id`, `logical_operation_key`, `work_id`) are now declared rather than
implicit, so the existing `h.reconcile`/`c.duplicates`-shaped logic has something concrete to key
its reconciliation record on. No mechanism was made to retry blindly after `UNKNOWN`; no mechanism's
`UNKNOWN` path was converted to `FAILED`.

### Freshness

Unchanged in substance — the audit's 12/24 finding (several as dedicated pipeline stages:
`CMS-205`, `OPS-124`'s `a.revalidate`, `OPS-129`'s `c.relevant`) was already correct and is
preserved exactly, per Part 17. `CON-39`'s `w.cooldown` gained an explicit `recheck` field
("current eligibility for the governed classes, re-read from authoritative state...") that was
previously implicit in `a.reevaluate`'s prose alone — a documentation strengthening, not a new
behavior. New Validator I (`freshness_before_execution`, see `VALIDATOR-COVERAGE.md`) surfaced 7
escalation-shaped handoffs with no explicit recheck; these are recorded as open, low-risk P2-shaped
observations rather than force-fixed, since escalation targets are a lower-risk shape than a direct
mutating action and the brief's own Part 18 explicitly cautions against a noisy freshness validator.

## Additional P1 repairs

- **`CMS-204`'s prepared-message identity** (the audit's one genuinely open question): `a.prepare`
  now mints `message_id` deterministically from `obligation_id`, declared as the mechanism's own
  `entity.instanceKey`. A redelivered `t.permitted` for the same obligation now resolves to the same
  `message_id` rather than risking a second prepared instance — closes the gap the audit found
  "likely contained but not structurally absent."
- **`OPS-121`'s domain-root idempotency** (the audit's most consequential instance of the systemic
  finding, being the first action of the first mechanism the whole OPS domain builds on):
  `a.persist` is now idempotent on `logical_operation_key`, returning the existing `work_id` on a
  repeat acceptance call rather than minting a second one.
- **`OPS-123`/`OPS-128` vocabulary convergence**: `OPS-123`'s "coordinate ownership" language is
  corrected to name the same lease concept `OPS-128` already used concretely, resolving the
  concurrency audit's own recommendation to converge rather than leave two levels of precision for
  one requirement.

## Architectural findings not implemented

### Conflict/exclusivity arbitration — confirmed genuine architectural gap, not implemented this round

The audit's top architectural finding is conclusively investigated, not resolved by adding a
mechanism. **No runtime primitive anywhere in this repository — none of the 24 mechanisms, none of
the remaining 259 canonical journeys, and neither of the two application-layer read paths
(`src/lib/canonical-view.ts`, `src/lib/practitioner-view.ts`, both confirmed pure rendering) —
enforces journey-declared `competition`/`exclusionGroup`/`precedence`.** Three competition groups
(`purchase-intent`, `relationship-continuity`, `account-restriction-authority`) are confirmed to
describe genuinely-simultaneous-eligibility scenarios, not mutually-exclusive-by-construction ones.

Classified as a **P0 architectural blocker**, per the brief's own explicit test (simultaneous
eligibility is genuinely possible; a naive first-worker-wins or last-write-wins implementation would
silently violate the corpus's own declared `precedence`). **Not resolved by adding a 25th Runtime
Mechanism this round**, per the brief's explicit instruction reserving that decision — see
`COMPETITION-ARBITRATION-ARCHITECTURE.md` for the full investigation, the two candidate-ownership
readings (leaning toward a mechanism parallel to `OPS-125`'s own precedent, without asserting it),
the required runtime contract if one is built, and the severity reasoning. This finding is carried
here and in `COMPETITION-ARBITRATION-ARCHITECTURE.md` rather than attached to any single
mechanism's own `gaps` array, because it belongs to none of the 24 individually.

## Remaining non-blocking gaps

- **`CMS-206`'s late-callback edge case (P2)**: a late provider acceptance/refusal arriving after
  `w.acceptance`'s own timeout already routed to `a.unknown` is not explicitly addressed within
  `CMS-206`'s own graph — presumably handled by `CMS-207`'s own late-event classification
  (`a.late`), but `CMS-206` does not show that path explicitly. Left open; not a safety gap, since
  `CMS-207`'s own idempotent-consumer pattern would absorb it correctly if it arrives there.
- **`CON-36`'s bounded-repair-attempt guardrail (P2)**: "repair attempts are bounded per cycle" is a
  stated guardrail with no `attemptBudget` `Config` declared — unlike `CMS-208`/`OPS-124`, `CON-36`
  has no single dedicated repair-retry action node to attach the budget to. Left open rather than
  forcing a budget onto a node that doesn't own the retry loop.
- **`OPS-126`'s consumer-coverage status (P2)**: reclassified this round from "open question" to
  "unconsumed-but-valid" (see `CONSUMER-COVERAGE.md`'s post-repair update) — the design is sound for
  a shape of work the current 283-journey corpus does not yet produce. Not deleted, not fixed,
  because there is nothing to fix — this is a settled classification, not a defect.
- **`CMS-201`'s and `CON-34`'s consumer-coverage notes (P2)**: both remain legitimate event-driven
  entry points with no handoff-traceable emitter in the current corpus, per this round's
  investigation. Documented, not treated as orphaned.
