# Cross-library integration — validator opportunities

Candidate mechanical validators this audit's findings suggest, at the cross-library integration
level specifically (distinct from the per-layer validators already implemented or proposed in each
closed round's own `VALIDATOR-OPPORTUNITIES.md`/`VALIDATOR-COVERAGE.md`). **None implemented this
round** — audit only, per the governing brief; a repair round decides which to build and in what
order.

All of these are buildable against `scripts/validate-canonical.mjs`'s existing text-eval approach
and the extraction technique this round's own `relationship-graph.json` demonstrates (parse
`.ts` source as text, evaluate the literal arrays, cross-reference against the corpus). None
requires inventing company policy.

## High-value, directly motivated by a confirmed finding this round

### 1. `competition_member_unenforced`

**Rule:** for every journey declaring a `competition` field (top-level or `contact.competition`),
check whether its own node graph contains at least one condition/eligibility check whose text
references the group's precedence (a scope/exclusionGroup mention, or language matching the
journey's own declared `precedence` string) gating its consequential `execution: "communication"`
or `execution: "human"` actions.

**Motivation:** this round found 17 of 22 declared competition-group members (`OWNERSHIP-AND-
COMPETITION-INTEGRATION.md` Part 10) have no such caller-side check — `OPS-131` itself is sound,
but adoption at the caller is where the corpus is weak. This is the single highest-value validator
this round's findings motivate.

**Severity:** WARNING at first (the corpus is not ready for ERROR — 5 of 7 groups would fail
today), narrowing to ERROR per-group as each is repaired, matching the phased pattern the
Operational Workflow round used for `durable_work_without_idempotency`.

**False-positive risk:** low if scoped correctly — a member whose own actions have no consequential
`execution` (like `ACQ-07`/`ACQ-08` in this round's own trace) should be exempted, since it has
nothing to protect.

### 2. `competing_member_no_live_state_check` (the mutual-staleness shape)

**Rule:** narrower and more specific than #1 — for a competition group whose `onLoss` is `paused`
(meaning both members are expected to remain live and mutually aware, not one-suppresses-the-other),
check that each member's own condition nodes reference the *other declared member's* live state,
not merely the abstract precedence text.

**Motivation:** `ACC-78`/`IDN-90` (`account-restriction-authority`, `onLoss: "paused"`) is this
round's confirmed P0 — both members declare deference to each other in prose but neither actually
re-reads the other's live state before a consequential action (lifting/extending a restriction).
This is a distinct, narrower failure mode from #1 (a `suppressed`/`exit`-onLoss member merely needs
to check "am I still eligible," while a `paused`-onLoss pair needs to check "is my counterpart still
active" — a mutual, not unilateral, condition).

**Severity:** ERROR-eligible immediately — this shape is rare (currently 1 group) and safety-
relevant by construction (an `onLoss: "paused"` declaration is itself an assertion that both sides
matter to each other).

### 3. `runtime_arbiter_result_unconsumed`

**Rule:** for every Runtime Mechanism whose own exit/outcome text explicitly states a signal exists
"so [X] is visible" or similar (a stated propagation intent, not merely a terminal record), check
that at least one other journey in the corpus references that exact outcome/event as a `trigger`,
`wait.until`, or `measurement` entry.

**Motivation:** `OPS-130`'s `x.reconciliation` (`RECONCILIATION_REQUIRED`) is this round's other
confirmed P0 — the corpus's own canonical technical-vs-business-completion arbiter has an exception
exit whose own `reEntry` text says it exists "so that gap is visible rather than reported as done,"
yet nothing in 283 other journeys consumes it. This is a narrower, intent-scoped sibling of the
already-implemented `workflow_result_unconsumed` (Operational Workflow round) — that one flags
*fully isolated* workflows (zero in AND zero out); this one flags a *specific declared-important
outcome* with zero consumers even when the mechanism as a whole has plenty of other traffic (`OPS-
130` has in-degree 2, so the existing validator would never catch this).

**Severity:** WARNING (review, not build-breaking) — requires a human judgment call on which exits
carry a stated propagation intent (matching the `workflow_result_unconsumed` validator's own
narrow-scoping precedent) versus which are correctly terminal.

## Medium-value, corroborated by multiple findings but not yet a single confirmed P0

### 4. `handoff_no_closure_semantics` (schema-level, corpus-wide gap, not a per-edge defect)

**Rule:** none buildable as-is — this is a schema observation, not a mechanical check. `kind:
"handoff"` nodes have no `terminal`/closure-semantics field the way `kind: "exit"` nodes do
(`terminal: true|false` + `reEntry`). `OWNERSHIP-AND-COMPETITION-INTEGRATION.md` records this once
as a P2 corpus-wide gap rather than 522 individual findings. A future validator here would first
require a schema addition (adding an optional `closureSemantics` field to `HandoffNode`), which is
out of scope for a validator-opportunities note — flagged for `operational-workflow-contract.
schema.ts`-style consideration in a future canonical-schema review, not for this list.

### 5. `queued_execution_no_version_binding_statement`

**Rule:** for an action reached only after an async `wait` node whose own text implies a delay
window material to correctness (a deadline/SLA/observation-window timeout), check whether the
action's own `does` text, or a sibling condition node, states explicitly whether it binds to the
carried-forward version/terms or revalidates current state before acting.

**Motivation:** this round found the pattern is followed correctly almost everywhere it matters
(`CTL-232`/`233`, `RLT-243`/`244`, `DOC-215`/`216`/`220`, `OWN-54`, `FIN-135` all state their choice
explicitly) but is silent in at least one place it should be stated (`SUB-163`→`SUB-164`'s
`a.new-term`, which binds to terms decided earlier with no revalidation branch and no explicit
statement that binding is the intended choice — `TIME-AND-VERSION-INTEGRATION.md` finding #2).

**Severity:** WARNING — this is a documentation-completeness signal, not a proven runtime defect in
any traced case; false positives are likely for actions where "bind to carried value" is so
obviously correct it doesn't need restating (most of the corpus).

**False-positive risk:** medium-high without careful scoping — would need to exclude actions
executed synchronously right after their own condition (no real staleness window) and actions whose
carried value is explicitly immutable by domain (e.g. historical facts). Recommend piloting on a
hand-picked subset before corpus-wide rollout.

### 6. `duplicate_registered_conflict_missing`

**Rule:** grep guardrail/suppression prose corpus-wide for conflict-declaring language ("mutually
exclusive", "outranks", "suppress... while", "lowest in the group", "wins/loses") in journeys that
do NOT declare a `competition` field, and flag for manual review.

**Motivation:** this round found exactly one such case — `ACT-17` (Adoption Nurture), which declares
a real conflict relationship in guardrail prose identical in shape to the registered
`retention-outreach` group's own language, but is not a registered `competition` member and has no
enforcing node, making it invisible to `OPS-131` entirely.

**Severity:** REVIEW only (never auto-registers a competition group — matching the governing brief's
explicit "do not automatically convert prose relationships into competition groups" instruction).
Low false-positive risk expected given only 1 hit in the full corpus this round, but the pattern
list would need tuning against a larger prose sample before trusting precision.

### 7. `cross_layer_idempotency_key_orphaned` (the DEC-181 fan-in shape)

**Rule:** for a receiver whose `entity.instanceKey` includes a field self-minted at entry (per the
already-documented self-minted-by-receiver pattern), check whether the receiver's own
duplicate-detection logic (a `c.duplicate`-shaped condition, or equivalent) is backed by a
*separate*, pre-existing identity the corpus can verify is actually carried by senders — as opposed
to relying entirely on unstructured prose matching.

**Motivation:** `DEC-181`'s ~30-sender duplicate-request protection lives entirely in `c.duplicate`'s
prose scope-match, not in its own `instanceKey`/`concurrency` (which can structurally never fire,
since `request_id` is freshly minted per entry) — `IDEMPOTENCY-AND-RETRY-INTEGRATION.md` finding
#1, the highest-fan-in identity point in the corpus, flagged as undocumented-at-the-structural-level
rather than confirmed broken.

**Severity:** WARNING, single-instance today (only `DEC-181` has both a self-minted instanceKey AND
a fan-in this large) — likely not worth building until a second real instance appears; recorded for
completeness per the brief's own "possible boundary mismatch/possible missing freshness rule"
WARNING-tier guidance.

## Lower-value / recorded for completeness, not recommended to build soon

### 8. `event_registry_zero_consumer`

A corpus-wide sweep for every `src/canonical/events.ts` registry event with zero `trigger`/
`wait.until`/`measurement` references anywhere. `EVENT-AND-AUTHORITY-INTEGRATION.md`'s Part 15 pass
already did a targeted ~40-event sample this round and found exactly the one confirmed gap
(`OPS-130`'s exception exit, covered by validator #3 above) plus the `REM-157` payload gap (covered
by #9 below) — a full exhaustive sweep across all 456 registry events was out of this round's scope
and would need its own pass before a validator could be scoped with confidence; recorded as a
candidate for a dedicated future pass, not a ready-to-build validator today.

### 9. `handoff_payload_construction_impossible_for_some_senders`

**Rule:** for a receiver whose `idempotencyKey` or `contract.requiredFields` includes a field, check
whether **every** structurally-connected sender's own entity model can plausibly supply it — not
just whether at least one can (the current `handoff_identifier_unprovenanced` validator's
per-sender granularity already mostly covers this, but doesn't specifically flag "N of M senders
fail while the receiver's own fix pattern is already proven by a different sender").

**Motivation:** `REM-157`'s `idempotencyKey` (`obligation_id + issue_id`) cannot be constructed from
3 of its senders (`TIM-68`, `DEC-190`, `DAT-230` — none has an issue concept in their own entity
model), while a 12th sender, `DOC-220`, already proves the correct fix (mint a fresh `issue_id`,
declare `contract.requiredFields`) and simply wasn't applied to the other three.

**Severity:** likely subsumed by the existing `handoff_identifier_unprovenanced` validator once its
reviewed-warnings list is refreshed for this specific case — recorded here mainly because the
*proven-fix-not-applied-to-siblings* shape (one sender shows the pattern, others don't follow it) is
a slightly different, more actionable signal than a bare unprovenanced warning, and might be worth
a small enhancement to the existing rule rather than a wholly new validator.

## Explicitly not recommended

Per the governing brief's Part 39, broad within-layer warning debt (`durable_work_without_
idempotency`'s 570 corpus-wide instances, the ~40 catalogued Operational Workflow idempotency gaps)
is deliberately not re-proposed here as a cross-library validator target — it is already tracked at
the correct layer, and converting warning volume into cross-library severity would violate the
brief's own explicit instruction not to let broad warnings dominate this round's conclusions.
