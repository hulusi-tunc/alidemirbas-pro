# Runtime Mechanisms — concurrency and ordering audit

Duplicate workers, simultaneous journeys, stale queued work, race conditions, conflict arbitration,
ownership races, version changes, and causal ordering, across the 24. Companion to
`RETRY-AND-FAILURE-AUDIT.md` and `RUNTIME-MECHANISMS-AUDIT.md`'s Part 14 finding.

## Concurrency primitives named or needed, by mechanism

| Primitive | Count | Mechanisms |
|---|---|---|
| none-required | 18 | every mechanism whose own actions are pure decisions or recomputations with no durable entity to race over |
| lease | 1 | OPS-128 |
| lock | 1 | OPS-123 |
| compare-and-set | 1 | CMS-201 (needed, not present - the P0) |
| optimistic-version-check | 2 | CON-35, CON-40 |
| instance-affinity | 1 | OPS-125 |

The 18 "none-required" mechanisms are not a gap - they are genuinely low-risk by construction:
pure evaluation/measurement pipelines (`CMS-202`, `CMS-203`, `CMS-204`, `CMS-205`, `OPS-122`,
`OPS-126`, `OPS-129`, `OPS-130`) or scoped-suppression writers whose worst-case duplicate is a
redundant log entry rather than a contradictory state (`CON-34`, `CON-36`, `CON-39`, `CMS-210`).
Re-running any of them twice with the same input produces the same conclusion, not a duplicated
side effect.

## The one confirmed race: CMS-201

Covered in full in `RUNTIME-MECHANISMS-AUDIT.md`'s CMS-201 section and `SIDE-EFFECT-AND-
IDEMPOTENCY-AUDIT.md`. Restated here for completeness of this document's own scenario coverage:
two concurrent deliveries of the same `authoritative_business_event` both evaluate `c.existing`
("is an equivalent communication already outstanding") before either commits `a.create`, and
nothing in the graph prevents both from creating a separate obligation. The fix is a
compare-and-set or a uniquely-keyed insert on (recipient, subject, purpose) at `a.create` -
described here as the concurrency-primitive requirement a repair round's contract needs to state
explicitly, not as a canonical-graph change.

## Two workers, one job: the corpus's best and vaguest examples side by side

- **OPS-128 (best)**: an explicit lease with an expiry. `c.lease` asks "could the previous lease
  still be live?" - if possibly yes, `w.lease` waits out the *remaining lease duration* before
  reclaiming, rather than reclaiming on suspicion. Only after the lease is confirmed expired or
  released does the mechanism even consider whether the work needs restarting, and even then it
  first checks `c.confirmed` ("is completion already confirmed?") before ever restarting -
  ordering the three questions (still owned? already done? how to resume?) in exactly the safe
  sequence.
- **OPS-123 (vaguer)**: "two workers must not concurrently recover the same exclusive job" is a
  guardrail, and `a.reclaim`'s own text says "the coordination is the point," but no concrete
  primitive is named the way OPS-128 names its lease. A repair round should have OPS-123 either
  explicitly reuse OPS-128's lease concept (if the two mechanisms are meant to share one
  coordination primitive across the domain) or state its own distinct one and why it differs.
- **CMS-201 (missing)**: no coordination primitive named at all, for the one mechanism that
  structurally needs one most.

## Journey-declared conflict/exclusivity: zero runtime enforcement found

This is `RUNTIME-MECHANISMS-AUDIT.md`'s finding 3, detailed here per Part 14's explicit ask.

**What exists on the journey side:** the customer-facing corpus declares 7 structured competition
groups as of the current source (`validate:canonical`'s own summary line: "7 competition groups"),
each with `scope`, `exclusionGroup`, `precedence`, and `onLoss`. Three confirmed working examples
from the two prior rounds: `purchase-intent` (ACQ-07/ACQ-08), `relationship-continuity` (SUB-167 +
counterpart), `account-restriction-authority` (ACC-78/IDN-90, added in the silent-state repair
round). `scripts/vnext-rules.mjs` already validates these groups are well-formed (`competition_
group_of_one`, `competition_scope_split`, `competition_incomplete`, `competition_onloss`) - but
that validator checks the *declaration*, not whether anything *enforces* it at runtime.

**What was searched for and not found:** a grep across `communication.ts`, `consent.ts`, and
`processing.ts` for `competition`, `exclusionGroup`, `precedence`, and `preemptedBy` returns zero
matches. None of the 24 mechanisms read a journey's `competition` block, decide a winner between
two journeys claiming the same `exclusionGroup`, or apply an `onLoss` transition (`paused`/
`suppressed`/`superseded`/`exit`) on the losing side. The suppression-adjacent mechanisms that
exist (`CON-38`'s customer-facing suppression-state journey, out of this round's 24; `CMS-204`'s
own-obligation multi-channel coordination, which is intra-obligation, not inter-journey) do not do
this either.

**Is this a defect or a scope boundary?** Genuinely ambiguous from the corpus alone, and this
audit does not resolve it - flagging the ambiguity is the correct output per this round's own
instruction ("do NOT create a new journey... this belongs at runtime"). Two readings:

1. **A real architectural gap.** Every customer journey that declares `competition` is making a
   promise ("when both are open, the losing one pauses/exits") that nothing in the reusable
   execution layer actually keeps - it would have to be reimplemented per company, inconsistently,
   at the orchestration-engine layer outside the canonical corpus entirely.
2. **Intentionally out of the 24's scope**, because conflict arbitration might belong to the
   orchestration engine itself (the thing that reads `contact.competition` when deciding what to
   send next), which is infrastructure this corpus does not model as a canonical journey at all -
   the same way the corpus never models "the database" or "the message queue."

Recorded as the round's clearest "no mechanism exists for this responsibility" finding either way,
worth a direct question to the person who owns this repository's runtime architecture before a
repair round invents an answer.

## Ordering guarantees found

Two mechanisms have explicit, well-reasoned ordering logic:

- **CMS-207**: new-vs-duplicate-vs-late classification against what is already recorded, with an
  explicit non-overwrite rule for late-and-weaker evidence unless "channel semantics explicitly
  say [a late failure invalidates a delivery]." This is the corpus's clearest statement of
  "ordering is arbitrated by evidence strength, not arrival order" - and it is stated as the
  default *rule*, with channel-specific overrides applied explicitly rather than assumed.
- **CON-35 / CON-40**: origin+version propagation specifically so "an out-of-order echo cannot
  revert it and a redelivery cannot restart the exchange." `CON-40`'s guardrail states the
  principle generally: "a system timestamp alone is not authority. Provenance and version are what
  identify the record that reflects a real decision" - correctly rejecting wall-clock-arrival-order
  as an ordering signal in favor of a versioned, provenance-tagged one.

Neither declares the `origin`/`version` fields structurally (see `SIDE-EFFECT-AND-IDEMPOTENCY-
AUDIT.md`), which is this document's only ordering-related gap - the *rule* is right in both cases,
only the *field* is missing.

## Versioning: queued work outliving its own decision version

`OPS-R17` states the corpus-wide rule directly: "a stale job never overwrites a newer entity
version... jobs execute in the order workers pick them up, not the order decisions were made, so
without a version check the most recent decision is the one most likely to be undone." This rule
is honored in substance by every mechanism whose own freshness check re-reads current state before
acting (12 of 24, per `RUNTIME-MECHANISMS-AUDIT.md`'s finding 8), but none of the 24 structurally
declares which of the three named strategies (bind-at-scheduling / re-evaluate-at-execution /
cancel-and-regenerate) applies to it - every one of the 12 revalidating mechanisms is, in effect,
choosing "re-evaluate-at-execution" by construction, without saying so as a declared policy. This
is consistent, correct behavior stated inconsistently as documentation - a repair round's contract
should make the choice explicit per mechanism rather than leave it implicit in each one's own
prose.
