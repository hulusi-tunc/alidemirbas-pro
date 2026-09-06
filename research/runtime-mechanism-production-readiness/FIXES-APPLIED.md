# Runtime Mechanism Fixes Applied

This document records what changed across **two** repair rounds that followed
`RUNTIME-MECHANISMS-AUDIT.md`'s initial audit (READY 4 / READY_WITH_MAPPING 13 /
NEEDS_CONTRACT_WORK 6 / NEEDS_RUNTIME_CHANGE 1, P0 1 / P1 6 / P2 12). **Round 1** (`## P0` through
`## Remaining non-blocking gaps` below, corpus at 24 mechanisms / 283 journeys) fixed the per-
mechanism P0 (`CMS-201`), made idempotency/attempt-identity structural corpus-wide, resolved the
`CMS-208`/`OPS-124` retry-ownership ambiguity, and investigated but deliberately did not resolve
one confirmed architectural absence — no runtime primitive enforced journey-declared `competition`/
`exclusionGroup`/`precedence` — reporting it as a P0 architectural blocker rather than inventing a
mechanism without a dedicated decision. **Round 2** (`## Round 2 — Competition Arbitration` below,
corpus now at 25 mechanisms / 284 journeys) makes that decision: `OPS-131` (Journey Competition
Arbitration) closes the architectural P0. Every fix below is verified against current source, not
against either round's own prior wording — several open questions were resolved by re-reading the
mechanism after the fact, not by assuming an earlier framing was final.

## Corpus

**Round 1**: 24 Runtime Mechanisms, re-derived from `src/canonical/surface.ts`'s `MECHANISM_IDS`
against post-repair source: unchanged — `CMS-201`–`CMS-208` + `CMS-210` (9), `CON-34`/`35`/`36`/
`39`/`40` (5), `OPS-121`–`OPS-130` (10). Every mechanism's own node count was identical to the
pre-repair audit dump. **Zero canonical graph topology changed in round 1.** Total canonical
journeys: 283, unchanged (68 + 3 + 64 + 24 + 124).

**Round 2**: 25 Runtime Mechanisms — the same 24 plus `OPS-131`, added to
`src/canonical/processing.ts` and `MECHANISM_IDS`. All 24 pre-existing mechanisms' node counts
remain identical to round 1's own dump — **zero topology change to anything that existed before
round 2**; `OPS-131` is new, additive content (10 nodes: 1 trigger, 4 actions, 2 conditions, 1
wait, 1 exit, 1 handoff). Total canonical journeys: 283 → **284** (68 + 3 + 64 + 25 + 124); total
nodes: 3664 → **3674**. See `## Round 2 — Competition Arbitration` for the full accounting of every
hardcoded-count assertion this changed.

## P0 (round 1)

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

## Systemic contract repairs (round 1)

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

## Round 2 — Competition Arbitration

### The architectural P0 round 1 left open is now closed

Round 1's own top architectural finding — **no runtime primitive anywhere in this repository
enforced journey-declared `competition`/`exclusionGroup`/`precedence`** — was investigated
conclusively but deliberately not resolved, per the brief's own instruction reserving that decision.
Round 2's brief made the decision explicitly: resolve it before starting any Operational Workflow
work, choosing among three architecture outcomes with evidence rather than by default.

### Corrected re-derivation: 7 groups / 22 members, not 3 / 7

Re-deriving every structured competition group from current source — not trusting round 1's own
count — found **7 exclusion groups, 22 member journeys**, not the 3 groups / 7 members round 1
reported. Round 1's grep matched only the plain, top-level `competition` field; `JourneyCompetition`
is also declared as `contact.competition` on vNext communicating journeys specifically (the nested
form of the identical field), and round 1's investigation missed every instance of it. The corrected
groups: `account-restriction-authority` (`ACC-78`, `IDN-90`), `purchase-intent` (`ACQ-04`, `ACQ-07`,
`ACQ-08`), `commerce-recovery` (`ACQ-11`, `ACQ-12`, `ACQ-13`, `RET-31`, `SCH-282`), `lifecycle-stage`
(`ACT-12`, `ACT-20`), `retention-outreach` (`ACT-18`, `FBK-46`, `RET-24`, `RET-28`, `RET-30`,
`RET-32`), `outbound-ask` (`FBK-41`, `FBK-42`), `relationship-continuity` (`SUB-163`, `SUB-167`).
Cross-checked against `validate:canonical`'s own "7 competition groups" summary line, which was
reporting the correct number all along.

### Architecture decision: Option B, a 25th Runtime Mechanism

**Option A (extend an existing mechanism) — rejected.** `OPS-125` (Work Deduplication) is the only
structurally similar candidate, but its identity model is claims to the *same* logical operation,
never claims from *different* journeys to a shared business scope — extending it would require it
to reason about `exclusionGroup`/`precedence`/`onLoss`, concepts foreign to deduplication, creating
exactly the god-object the brief warned against. `OPS-123`/`OPS-128` transfer *worker* ownership of
a *job*, the wrong entity type for arbitrating between *journeys* by *business* precedence.

**Option C (a non-canonical owner named with evidence) — rejected.** No concrete owner could be
named: this repository contains no runtime execution engine at all (the corpus is a specification
for a runtime that lives outside it), and the only candidate read path
(`src/lib/canonical-view.ts`/`practitioner-view.ts`) is confirmed pure rendering. A vague
"the orchestration platform handles this" — explicitly insufficient per the brief — was the only
alternative available, so Option C was not selected.

**Option B (a new Runtime Mechanism) — selected.** `OPS-131` (Journey Competition Arbitration),
added to `src/canonical/processing.ts`. Named from the corpus's own existing vocabulary — `GLB-01`'s
own file header in `global.ts` already calls this problem "journey competition and ownership
resolution"; `OPS-131`'s `reusableRule` states directly that it makes `GLB-01` through `GLB-10`
executable. `OPS-125` is the corpus's own precedent that "resolve a contest between two claims to
one identity" is a genuine, previously-recognized mechanism shape — `OPS-131` is a second instance
of that shape for a different kind of claim (ownership, not operation-correctness), not a foreign
addition.

### What `OPS-131` does, against the brief's own required semantics

- **Eligibility**: `a.load-contenders` re-reads every contender's current eligibility from
  authoritative state, never trusting the trigger's own snapshot.
- **Scope**: `entity.instanceKey: ["exclusion_group", "scope_instance_id"]` is `GLB-01`'s own key
  made structural.
- **Precedence**: `c.precedence` implements `GLB-02` literally — explicit policy only; a genuine tie
  escalates to `DEC-181` rather than an invented tie-break.
- **Atomic winner establishment**: `a.claim` is atomic create-if-absent on `(exclusion_group,
  scope_instance_id)` — `CMS-201`'s own repaired invariant, applied to ownership of a contested
  scope instead of a communication obligation. Exactly one claim succeeds; a losing concurrent
  evaluator receives the authoritative winner, never an error, never a duplicate.
- **Loser handling**: `a.suppress-losers` applies each loser's own declared `onLoss` — never
  invented — and invalidates its queued work before it can fire (`GLB-05`/`GLB-07`).
- **Re-evaluation**: `w.ownership` → `a.reevaluate` re-runs arbitration from current state on the
  winner's release or a bounded check-in; a suppressed contender never simply resumes (`GLB-06`/
  `GLB-10`).
- **Human ownership (`GLB-09`)**: deliberately not special-cased inside `OPS-131` — each contender's
  own declared precedence text already encodes it where policy states it (`FBK-46`, `RET-24`,
  `RET-28`), and `OPS-131`'s own re-read of current eligibility honors it automatically. No
  universal "human always wins" rule was invented.

Full design and the rejected-option evidence are in `COMPETITION-ARBITRATION-ARCHITECTURE.md`; the
complete required-coverage test matrix (simultaneous eligibility, concurrent workers, duplicate
arbitration, preemption, winner-resolves re-entry, stale queued work, scope isolation, equal
precedence, genuine-tie escalation) is in `COMPETITION-ARBITRATION-TEST-MATRIX.md`.

### Validators added this round

`competition_duplicate_precedence` (warn, `scripts/validate-canonical.mjs`) — two group members
sharing verbatim-identical precedence text. `competition_runtime_unenforced` (error,
`scripts/validate-canonical.mjs`) — fails the build if `surface.ts`'s own
`COMPETITION_ARBITRATION_MECHANISM_ID` is ever removed or stops resolving to a real mechanism while
structured competition groups still exist, so this P0 cannot silently reopen. Full detail in
`VALIDATOR-COVERAGE.md`.

### Corpus-count changes, made honestly rather than avoided

Runtime Mechanisms 24 → **25**; total canonical corpus 283 → **284**; total nodes 3664 → **3674**;
mechanism surface count 24 → 25 everywhere it is derived (`production/surface-assignment.json`,
the search index, `src/canonical/events.ts`'s registry gains one new trigger event,
`competing_journeys_became_simultaneously_eligible`). Every hand-authored file asserting the old
counts as a literal check was updated in lockstep: `production/validate-seo-metadata.mjs`,
`production/validate-journey-production.mjs`, `seo/seo-validator.mjs`, and `CLAUDE.md`'s own stated
corpus size. Every generated artifact was regenerated from source rather than hand-edited
(`npm run dump:canonical`, `node scripts/surface-assignment.mjs`, `node scripts/build-event-
registry.mjs`, `node search/build-search-index.mjs`, the production Python pipeline).

### Not implemented, and why

**No changes were made to the 22 competition-group member journeys themselves.** Wiring each one's
own consequential actions to consult `OPS-131` before executing is genuine adoption work, correctly
scoped to a company's own mapping rather than to this canonical repair round — see `OPS-131`'s own
P2 gaps in `runtime-mechanism-contracts.json`, disclosed rather than hidden.

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
- **`OPS-131`'s adoption gap (P2, round 2)**: this mechanism's own contract is complete, but none of
  the 22 current competition-group members are yet wired to call it — a company adopting it must
  fire its trigger event from its own eligibility layer and have each competing journey's own
  consequential actions consult current ownership before firing. Mapping work no canonical
  specification can perform on a company's behalf, not a defect in the mechanism's own contract.
- **`OPS-131`'s conditional timeout (P2, round 2)**: `w.ownership`'s bounded check-in applies only
  where the winning contender's own governing policy states a maximum ownership duration; absent
  that, staleness detection depends on the release event firing reliably — consistent with, not
  worse than, the corpus's general reliance on authoritative events elsewhere, but worth naming
  since this mechanism's entire purpose is preventing exactly the race a lost release event would
  reopen.
