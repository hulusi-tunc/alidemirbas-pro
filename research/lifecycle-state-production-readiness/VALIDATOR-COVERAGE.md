# Validator Coverage

Three new mechanical validators, plus one severity change to a pre-existing one, added to
`scripts/vnext-rules.mjs` (called from `scripts/validate-canonical.mjs` — `npm run
validate:canonical`) in the Silent Lifecycle States gap-closure round. Mirrors the format of
`research/journey-production-readiness/VALIDATOR-COVERAGE.md` (the communication round's own
file) — read that one first for Validators A and B's original design; this file documents what
changed about them and what was added.

## Validator A — idempotency key field provenance (severity widened)

**Unchanged:** failure class and mechanism are exactly as the communication round built them —
for every `action` node with an `idempotencyKey`, each `+`-separated token that looks like a
plausible field name (not a bare node-id reference like `a.remind`, not a multi-word phrase like
`touch id`) is checked against the journey's own `implementation.attributes.required ∪ optional`
plus every field any node in the journey's own graph `writes`. See that round's own
`VALIDATOR-COVERAGE.md` for the full mechanism and its stated limitation (multi-word phrases are
never checked).

**Changed: severity now follows `isCustomer && vnext`, not `orchestrated && vnext`.** The
communication round scoped this to `orchestrated` (`sends || routesToHuman`) because the silent
side of the corpus had not been audited yet, and erroring on undiagnosed debt would have broken
the build on work outside that round's scope. This round audited and fixed all 64 silent states,
so the distinction no longer needs to exist — every customer-surface vNext journey (68
message-sending, 3 human-routing, 64 silent) is now held to the same error-level bar. Only
mechanism/operational journeys (which are not vNext-migrated and remain a separate, later round's
scope per this round's own DO-NOT list) stay warning-only.

**Test fixture:** the live corpus, re-checked on every `validate:canonical` run. Before this
round: 37 of 64 silent states in violation (41 P0 findings — some states had more than one
violating action). After: 0 among the 64; the widened severity also means any *future* regression
in the 68/3 message-sending/human-routing journeys (previously covered) and any new silent-state
authoring error are now caught at error level immediately, not just at the next full audit.

**Production command:** `npm run validate:canonical`.

## Validator C — state-write idempotency (new)

**Failure class caught:** a state-changing action — one that appends to a history/log field, the
replay-unsafe write shape this whole corpus uses for durable state (`writes` with `mode:
"append"`, per `CLAUDE.md`'s canonical-journey section) — with no `idempotencyKey` at all. This is
a total-absence check, distinct from Validator A (which only catches a *wrong* field reference,
never a *missing* key) and distinct from the pre-existing prose heuristic `tx_no_idempotency`
(which flags actions whose `does` text matches an external-side-effect pattern — a fuzzy guess
from prose, not a structural check against `writes`).

**How it works:** for every `action` node with no `idempotencyKey`, check whether any of its
`writes` entries has `mode: "append"`. A `mode: "set"` write is not flagged — setting a field to
the same value twice is naturally idempotent, unlike appending the same log entry twice.

**Severity: error scoped to `isCustomer && !orchestrated` (the 64 silent states) — not the full
customer surface.** Re-running the raw check corpus-wide also found the same defect shape in a
dozen of the 68 message-sending journeys (ACQ-11/12/13, RET-26/28/31/32, FBK-43/46, FIN-134,
SUB-163, DOC-215) — real, newly-discovered debt, but fixing it would mean re-touching journeys
this round's own brief explicitly forbids ("do NOT work on the 68 message-sending journeys
again"). Those stay warnings, individually reviewed in `production/vnext-warning-reviews.json`,
left as visible backlog for whichever future round covers that domain — not silenced, not fixed
out of scope.

**Test fixture:** the live corpus. Before this round: SCH-174, SCH-177, TIM-65 — every writing
action on all three had no idempotencyKey at all. After: 0 in-scope violations among the 64.

**Production command:** `npm run validate:canonical`.

**False-positive risk: effectively none.** Unlike Validator B (below), this is a purely
structural check against the node's own `writes` array, not a heuristic against prose — an append
write with genuinely no idempotencyKey is never an intentional design choice in this corpus (no
state anywhere argues that duplicate log entries on retry are acceptable).

## Validator D — composite instance-key component coverage (new, review-only)

**Failure class caught:** where `entity.instanceKey` has more than one field, an action's
`idempotencyKey` that omits one of those fields — the shape found in SCH-175 (dropping
`reschedule_request_id`) and TRM-107 (dropping `closure_id`), both genuine defects.

**How it works:** for every journey with a composite (`length > 1`) `entity.instanceKey`, and
every action with an `idempotencyKey`, check whether every component of the composite key appears
as a `+`-separated token in the key string. Report the missing components by name.

**Severity: always a warning, corpus-wide, by design — never an error.** A narrower key is not
automatically wrong: a state can legitimately dedupe at a coarser grain than its own full instance
identity where that is the intended concurrency behavior (e.g. an action meant to run once per
one half of a composite key, deliberately ignoring the other half). Distinguishing that
legitimate case from a genuine dropped-component defect requires either a schema addition letting
a journey declare which components an action intentionally narrows across (which does not exist
today) or the same kind of by-hand domain judgment this round applied to confirm SCH-175 and
TRM-107 were real defects, not intentional narrowing. Promoting this to an error without that
schema addition would risk a false-positive build break on a legitimate narrowing this round did
not happen to encounter.

**Test fixture:** the live corpus. Before this round: SCH-175 (5 actions), TRM-107 (6 actions).
After: 0 in either journey; other composite-key journeys corpus-wide (ACQ-06, IDN-89, REL-94,
RET-23, SUB-165, TIM-65, TRM-105, TRM-108 among them) surface as new warnings the first time this
validator runs against them — each individually reviewed in
`production/vnext-warning-reviews.json` and confirmed as intentional full-key usage (all of
these were fixed to use their full composite key in this same round, so the warning fires zero
times against them, but the review entry documents the confirmation for the ones that do
legitimately narrow, should any exist elsewhere in the corpus).

**Production command:** `npm run validate:canonical`.

## Validator E — revalidate-before-mutation (new)

**Failure class caught:** a `wait` node whose `onTimeout` fires directly into a state-mutating
action (a `writes` step) or a `handoff` (an ownership transfer) with no `recheck` field — the gap
behind the "revalidate from now, never from the scheduling-time snapshot" house rule this round's
audit found independently, correctly, and repeatedly across the corpus (SCH-177, SUB-162,
SUB-168, SUB-169, SUB-166, TRM-105, TIM-62 and others) but which existed only as an unenforced
convention, never a checked invariant.

**How it works:** built on `WaitNode.recheck`, a pre-existing free-text field already used
throughout the corpus to name what gets re-read from authoritative state before acting on a fired
timer — deliberately not a new schema field, per the brief's instruction to use "the smallest
shared abstraction already present in the corpus." For every `wait`, resolve its `onTimeout`
target; if that target is a `handoff` or an `action` with at least one `writes` entry, the wait
must declare a non-empty `recheck` string.

**Severity:** the generic `sev` function — error for any vNext journey, warning otherwise — same
pattern as the corpus-wide checks that predate this round (`exit_unclassed`,
`instance_key_missing`), since this is a structural invariant that should hold everywhere a wait
fires into a mutation, not a defect class scoped to the 64 silent states specifically (several of
the exemplar journeys naming this pattern, e.g. SUB-162/166/168/169, are message-sending
journeys, not silent states).

**Test fixture:** the live corpus. Every wait firing into a mutation or handoff across the
corpus was checked on the first run; the exemplar journeys named above already carried the
convention correctly (their own `recheck` text is what let this round formalize the rule rather
than invent one), so this validator's first run found 0 violations rather than surfacing new
debt — it exists to hold the corpus at the standard it already met, not to fix anything.

**Production command:** `npm run validate:canonical`.

**Known limitation, stated plainly:** `recheck` is free text, not a structured pointer to what
gets re-read — this validator confirms *something* is named, not that the named thing is
actually the correct authoritative source. Tightening that would need a structured `recheck`
shape (e.g. a reference to a specific attribute or external system), which does not exist in the
schema today and was not added this round per the brief's "update the schema only if justified"
instruction — the free-text field already carries enough signal to make the invariant checkable
without a schema change.

## Validator B — handoff identifier provenance (unchanged, reaffirmed)

No change. Stays exactly as the communication round built it: always a warning, corpus-wide,
never promoted to an error — a purely structural check cannot reliably distinguish a target that
legitimately mints its own instance key on entry from a genuine provenance gap, and this round's
brief explicitly reaffirmed the instruction not to blindly promote it globally. This round applied
the same by-hand domain judgment the communication round used to find and fix its four instances,
to seven silent-state instances instead (the ACC-79 four-sender cluster, FUL-145, FUL-149, plus
ACQ-05 and ACT-17 single-sender cases — see `FIXES-APPLIED.md`). The one deliberately unfixed
instance this round found (IDN-87 → IDN-90) stays a warning, individually reviewed, exactly like
every other unfixed finding this validator raises corpus-wide.

## Regression test scenarios

Not implemented as an automated test suite — this repository has no test framework (`CLAUDE.md`:
"There is no test framework. Correctness is enforced by validator scripts"). Regression coverage
takes the same form the communication round established: `testScenarios` entries, one array per
state, mechanically generated per state in `lifecycle-state-contracts.json` by
`build/build-contracts.mjs`'s `buildTestScenarios` (entry, insufficient-evidence, timeout, and
handoff cases derived directly from each state's own `trigger`/`waits`/`handoffs`). Where this
round's fixes map onto a specific scenario class:

- **Wrong-field idempotency** (a retried trigger must not duplicate a write) — every state in
  Shape 1 of `FIXES-APPLIED.md` now has a correctly-keyed `idempotencyKey`; each state's own
  `testScenarios` `handoff`/`entry` cases exercise the corrected node.
- **Total absence of idempotency** (SCH-174, SCH-177, TIM-65, CON-33) — Validator C is this
  scenario's own regression coverage: it structurally re-checks every append-write action on
  every `validate:canonical` run, not just at fix time.
- **Malformed pseudo-keys** (SUB-165) — Validator A's field-provenance check now rejects any
  future non-field prose fragment the same way it rejected `"renewal_cycle_id + grace state"`.
- **Premature identifier** (REL-100, SCH-173) — the fixed keys (`entity_ref + relationship_type`,
  `reservation_request_id`) reference fields present from `t.captured`/entry onward for their
  respective journeys, verified against each journey's own `implementation.attributes` and
  `entity.instanceKey`, not just against the audit's prose description of the defect.
- **Dropped composite-key component** (SCH-175, TRM-107) — Validator D is this scenario's
  regression coverage, structurally re-checked every run.
- **Handoff identifier provenance / "fix the sink"** (the ACC-79 four-sender cluster, FUL-145,
  FUL-149, ACQ-05, ACT-17) — each fixed handoff's `contract.requiredFields` now names the minted
  identifier explicitly; each affected state's own `testScenarios` `handoff` case names what
  the handoff carries, reflecting the fix.
- **Fresh-state revalidation** (the wait-then-mutate family) — Validator E is this scenario's
  regression coverage, structurally re-checked every run against every wait in the corpus, not
  only the seven exemplar journeys that motivated it.
- **Conflict/exclusivity** (ACC-78/IDN-90) — the corpus-wide `competition_group_of_one` /
  `competition_scope_split` / `competition_incomplete` / `competition_onloss` checks in
  `scripts/vnext-rules.mjs` (pre-existing, unmodified) now also validate this pair on every run,
  the same way they already validated `purchase-intent` and `relationship-continuity`.
