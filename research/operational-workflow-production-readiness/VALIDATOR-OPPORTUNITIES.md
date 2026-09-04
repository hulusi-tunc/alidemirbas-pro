# Operational Workflows — validator opportunities

Candidate mechanical validators this audit's findings suggest.

> **POST-REPAIR UPDATE (2026-09-04):** Of the candidates below, the two judged mechanically
> buildable without inventing corpus-wide conventions were implemented this round in
> `scripts/validate-canonical.mjs`: **`durable_work_without_idempotency`** (WARN — an operational
> action that appends to a durable field with no declared `idempotencyKey`) and
> **`workflow_result_unconsumed`** (WARN — a workflow with zero corpus-wide handoff consumers and
> zero outbound handoffs of its own, i.e. fully isolated). See `VALIDATOR-COVERAGE.md` for their
> full spec, severity rationale, and current finding counts. The remaining candidates below were
> **not** implemented this round — none was judged mechanically buildable without either
> hardcoding company policy or producing an unacceptable false-positive rate against the corpus's
> current prose-only conventions.

## Prerequisite, stated before any of the eight below: the 124 predate the structural conventions the other three surfaces already have

None of the 124 declare `entity.instanceKey`/`entity.concurrency`, and only a small minority of
actions across the whole corpus declare `ActionNode.idempotencyKey`/`attemptBudget` — the
conventions both the customer-facing rounds and the Runtime Mechanism round already formalized and
now validate structurally. This means **most of the candidates below cannot be built as hard,
mechanically-provable rules against the corpus as it exists today** — they would either find
nothing (because the structural field they'd check is absent everywhere, not because the property
holds) or would have to fall back to a prose heuristic with a much higher false-positive rate than
the equivalent validator in the closed rounds. This is the round's own version of the Runtime
Mechanism round's "these 24 are not vNext-migrated" prerequisite, generalized: **before most of
these validators are safe to build as errors, the 124 need the same kind of structural-field
adoption pass the other three surfaces already received** — which is exactly the repair work this
audit's findings (idempotency, ownership, authority) already call for on separate grounds. Building
the validator and closing the underlying gap are, in this layer, close to the same piece of work.

## 1. `operational_owner_missing`

**Rule:** a consequential action (one with a non-empty `writes` and no `execution` flag naming it
automated, or explicitly requiring judgment per its own `does` text) has no named actor/role/queue
in the workflow's own prose or a structured field.

**Defect caught:** exactly `OWNERSHIP-AND-ASSIGNMENT-AUDIT.md`'s central finding (23 ownership
gaps, several P1/P0: `OWN-56`, `INC-251/255/260`, `DOC-211/212`, `REM-154/160`).

**Mechanical detectability:** low today. `execution: "human"` exists as a schema field but is
sparsely used in this corpus (per the Runtime Mechanism schema's own precedent); most of the actual
findings above were surfaced by reading `does`/`entity.note` prose, not a structured field. A naive
version checking only for a missing `execution` flag would have very high false-negative risk
(missing most real gaps) and moderate false-positive risk (flagging correctly-automated actions
that simply don't declare `execution`, since omission is the schema's own documented default for
"ordinary" internal actions).

**Recommended severity:** not buildable as a hard rule yet; recommend a **prose-heuristic warning**
scoped narrowly (a condition/action whose own `does`/`asks` text contains a judgment-verb — "decide"
"assess" "judge" "determine whether" — with no `execution` flag and no ownership noun nearby) as a
first pass, reviewed manually rather than trusted, the same caution the Runtime Mechanism round
applied to its own `freshness_before_execution` validator before shipping it.

## 2. `durable_work_without_idempotency`

**Rule:** an action with `writes` including a durable "create the work item" field and no
`idempotencyKey` and no prose dedupe-guard (a condition checking for an existing instance before
the write).

**Defect caught:** the round's largest single gap area (40 findings), including the two confirmed
duplicate-execution P0s (`RSK-192`, `RSK-198`) and `SUB-164`.

**Mechanical detectability:** moderate. Unlike candidate 1, this one has a real structural signal
to check even in this corpus: whether a `condition` node exists immediately upstream of the
work-creating action asking some form of "does one already exist" — most of the corpus's *safe*
workflows have exactly this shape (a dedupe condition before the create), and the true findings
above are precisely the cases where that shape is missing or the check-then-act gap between the
condition and the action is unguarded. A structural check for "work-creating action with no
preceding existence-check condition AND no `idempotencyKey`" would catch real findings with
moderate false-positive risk (a legitimately append-only, always-safe-to-repeat action might still
be flagged).

**Recommended severity:** warn, corpus-wide, as the first candidate worth actually building — it
has the best detectability-to-value ratio of the eight.

## 3. `approval_authority_missing`

**Rule:** an approval-shaped condition/action (matched on `does`/`asks` text containing "approv" or
"authoriz") exists with no `execution: "human"` flag and no authority-role noun in nearby prose.

**Defect caught:** 22 authority-approval findings, several P0 (`OWN-56`, `RLT-247`, `TRM-101`,
`DAT-229`).

**Mechanical detectability:** low, for the same reason as candidate 1 — this corpus's authority
statements are prose, not structured fields. A text-match on "approv"/"authoriz" would have real
value as a *discovery* tool (surfacing every candidate node for a human reviewer) but should not be
trusted as a pass/fail gate without a person confirming each hit, since "authorization" appears
routinely in this corpus as a description of an upstream fact being checked, not always a live gap.

**Recommended severity:** review-only (surfaces candidates, does not fail a build) until the corpus
adopts a structured authority field this validator could check instead.

## 4. `operational_completion_unprovenanced`

**Rule:** a workflow's own text claims business completion (a phrase matching "resolved"/"complete"
near a `does`/`state` field) with no corresponding evidence/proof reference nearby.

**Defect caught:** the round's completion findings — though genuinely few (`RSK-200`, `INT-116`,
`DAT-222`) — plus the underlying pattern behind two of the three `NEEDS_CANONICAL_CHANGE` verdicts
(`DAT-228`, `INC-258`), which are completion-adjacent defects at root.

**Mechanical detectability:** low — this is exactly the kind of judgment `OPS-130`'s own
technical-vs-business distinction requires a human reader to make; a text-match cannot reliably
tell "this exit correctly proves business completion" from "this exit merely closes a task." Not
recommended for mechanical implementation at all; the value here is in the audit document
(`COMPLETION-AND-FEEDBACK-AUDIT.md`), not a validator.

## 5. `handoff_receiver_unconstructible`

**Rule:** the existing provenance family from the two closed rounds (`handoff_identifier_unprovenanced`
-shaped), scoped to this surface: a handoff's `carries` does not textually cover the target's own
declared entry requirements.

**Defect caught:** 19 handoff-provenance findings, including the `DEC-181` P0 and the
`DEC-187`→`DEC-189` deadline-loss finding.

**Mechanical detectability:** the mechanical version of this check was actually run this round (see
`HANDOFF-AND-CHAIN-AUDIT.md`'s own method note) and found **zero** matches — not because the
corpus is clean, but because almost none of the 124 declare `contract.requiredFields`, the field
the existing validator family checks. This is the clearest instance in the round of "the validator
would work, but the structural field it depends on doesn't exist yet in this surface" — closing the
prerequisite above would make this the second candidate worth building, after candidate 2.

**Recommended severity:** not buildable today; highest priority to revisit once
`contract.requiredFields` adoption begins in this surface.

## 6. `escalation_ownership_undefined`

**Rule:** an escalation-shaped handoff/action exists with no stated effect on ownership (old owner
retained? new owner assigned? automation suppressed? SLA reset?).

**Defect caught:** the `DEC-189`/`DEC-190` ownership-at-escalation gap and the broader pattern in
`OWNERSHIP-AND-ASSIGNMENT-AUDIT.md`.

**Mechanical detectability:** low — "escalation" is a semantic category this corpus expresses many
different ways (a handoff to a review workflow, a priority-raising action, a new-reviewer
assignment), not a single node kind or field value a validator could pattern-match reliably.
Recommend documentation (already done, in `SLA-AND-ESCALATION-AUDIT.md`) over a validator.

## 7. `workflow_result_unconsumed`

**Rule:** warning only — a consequential workflow's terminal exit/handoff has no confirmed
downstream consumer anywhere in the 284-journey corpus.

**Defect caught:** the orphan-candidate and unconsumed-but-valid findings already fully catalogued
in `CONSUMER-COVERAGE.md` (2 orphan-candidates, 4 unconsumed-but-valid).

**Mechanical detectability:** high — this is exactly the consumer-scan technique this round's own
dump script already ran mechanically to produce `CONSUMER-COVERAGE.md`. It is genuinely buildable
today as a warn-only corpus-wide check with the same discipline the closed rounds already apply
(zero consumers is not automatically orphaned — the check should still require the same manual
"is there a plausible external trigger" read this round applied, so it surfaces candidates for
review rather than asserting a verdict).

**Recommended severity:** warn, buildable now, no prerequisite needed — the strongest candidate for
immediate implementation in the round.

## 8. `stale_work_no_revalidation`

**Rule:** open work performs a consequential action without a freshness/current-state check where
the underlying state can plausibly change while the case is open.

**Defect caught:** the freshness-before-decision dimension this audit checked throughout (mostly
found correctly implemented — `RLT-243`/`244`, `TIM-68`/`70` — with the `CTL-232` `NEEDS_CANONICAL_
CHANGE` verdict as the one confirmed structural failure).

**Mechanical detectability:** the Runtime Mechanism round's own `freshness_before_execution`
validator is the closest precedent, and it required real care to avoid false-positiving on
mechanisms that revalidate via a dedicated node rather than a literal `recheck` field — the same
caution applies here, compounded by this surface's greater structural variety (17 domains, many
different revalidation shapes). Not recommended for mechanical implementation without first
cataloguing every revalidation shape the 124 actually use, the same groundwork the Runtime
Mechanism round did before shipping its own version.

## Recommended build order, if a repair round picks these up

1. **`workflow_result_unconsumed`** (candidate 7) — buildable today, no prerequisite, clear value.
2. **`durable_work_without_idempotency`** (candidate 2) — buildable today with moderate false-
   positive risk, closes the round's single largest gap area.
3. **Everything else** — blocked on the corpus adopting `entity.instanceKey`/`ActionNode.
   idempotencyKey`/`contract.requiredFields` in this surface first, which is itself the natural
   first phase of any repair round this audit's findings justify.
