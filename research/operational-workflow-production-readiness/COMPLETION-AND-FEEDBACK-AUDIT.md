# Operational Workflows — completion and feedback audit

The round's most important dimension. What proves a workflow is actually done, and how does the
lifecycle system that depended on it learn the result?

> **POST-REPAIR UPDATE (2026-09-04):** Two of this document's findings were genuine P0s and are now
> fixed via canonical graph changes: `INC-258` (closure previously reachable with zero mitigation
> ever applied — `c.mitigations` now names that state explicitly via a 3rd branch to a new
> `a.no-mitigations` node, routed through the same `c.cases` scrutiny as every other outcome) and
> `DAT-228` (rollback data preserved but never consumed — a new `a.reconcile-preserved` →
> `c.reconciled` path gives it a real consumer, escalating genuine conflicts to `DEC-181`). See
> `CANONICAL-CHANGES.md` for both. The `RSK-200`/`INT-116`/`DAT-222` completion gaps and
> `IDN-86`/`INT-118`/`RLT-244` result-propagation gaps this document also catalogs were confirmed
> non-P0 and left unrepaired this round, per the brief's instruction not to manufacture downstream
> consumers or force every adjacent P1 to zero.

## The reference principle: `OPS-130`, carried across the boundary correctly

`OPS-130` (Business Outcome Verification, Runtime Mechanism) established the corpus-wide
distinction: technical task closure is never assumed equal to business obligation resolution. This
round checked whether the operational layer honors it — and, unlike a mechanically forced
technical-vs-business split every workflow's own text doesn't actually make, the finding is that
most operational workflows already apply the principle correctly *in substance*, several citing it
by name:

- **`TIM-70`** cites the principle directly and applies it cleanly.
- **`TRM-110`**'s own completion statement for partial deletion failure — "never represented as
  complete... the most consequential false report in this library" — is arguably the single
  strongest completion-discipline statement found across all four production-readiness rounds.
- **`FIN-132`–`140`** (the round's strongest cluster on every dimension) apply it without exception:
  a provider/system accepting a submission is never conflated with the underlying obligation being
  resolved, and `UNKNOWN` is a first-class state that suppresses a duplicate corrective action
  rather than forcing a premature resolved/failed classification.
- **`RLT-244`**'s accepted/applied/verified split and **`RLT-248`**'s rollback-verified-not-just-
  commanded discipline are the rollout domain's own instances of the same pattern.
- **`REM-158`** directly implements the distinction for remedy verification — the remedy domain's
  own reference workflow for this dimension.

## Genuine completion gaps found — narrow and specific, not systemic

Unlike idempotency (a corpus-wide pattern, see `OWNERSHIP-AND-ASSIGNMENT-AUDIT.md`), completion
gaps are few and localized:

- **`RSK-200`**: no described mechanism confirms *exhaustive* completion of a fan-out — whether
  every item a prior action determined was affected actually finished re-evaluation, as distinct
  from the fan-out having merely been initiated.
- **`INT-116`**: no terminal exit node at all (`exits: []`) — whether a failure is actually resolved
  can only be answered by tracing the handoff chain into three other workflows, rather than reading
  this workflow's own completion state directly.
- **`DAT-222`**: quarantine has no distinct exit/state node — it rides inside a broader forward
  path's own success branch rather than being a separately auditable outcome, meaning "was this
  record quarantined" is not independently answerable from this workflow's own graph.

The round's three `NEEDS_CANONICAL_CHANGE` verdicts (`DAT-228`, `CTL-232`, `INC-258`, detailed in
`OPERATIONAL-WORKFLOWS-AUDIT.md`'s top findings) are also, at root, completion-adjacent defects: a
workflow reaching a state its own graph cannot resolve into a defined completion, or preserving
data toward a completion promise ("nothing is lost") that nothing downstream actually fulfills.

## Result / outcome propagation

Most workflows in the corpus already expose distinguishable, machine-readable outcomes rather than
operator prose a receiver would have to parse — the round did not need to force a specific outcome
vocabulary (`approved`/`rejected`/`resolved`/etc.) onto workflows whose own exits already
distinguish meaningful cases correctly. Where propagation genuinely breaks down:

- **`IDN-86`**: the sole resume handoff unconditionally targets `ACC-75`, but `IDN-85` is a
  confirmed second real sender into this workflow with no visible resumption path back to it — a
  second caller's own result has nowhere defined to go.
- **`INT-118`**: no structured consumer of its own completion signal is declared — `OPS-129`,
  `DAT-229`, and `DOC-220` reference it only in prose, not via a real handoff, meaning "backfill for
  this outage is done" is trapped inside this workflow's own queue rather than reaching anything
  authoritative that needs to know.
- **`RLT-244`**: no explicit handoff carries per-target verified outcomes forward to the cohort-
  health observation step in `RLT-245`/`RLT-250` — presumably read as aggregate telemetry rather
  than a structured handoff, worth a company's explicit confirmation.
- **`TRM-109`** and **`DOC-211`**: narrower gaps — no handoff notifies the requester on a specific
  "nothing to delete"/"requirement settled by reuse" outcome, so a satisfied case can go unreported
  to the process that was waiting on it.

## Correction and reopen

The corpus-wide principle (append correction / supersede / reverse / reconcile, never silently
rewritten history) holds throughout — no instance was found of a workflow silently overwriting a
consequential prior decision. What is genuinely missing, for a small set of workflows whose own
text implies correction is realistically possible:

- **`REL-99`**: no explicit path exists for correcting a completed split if an item was
  misclassified — a real gap given the workflow's own guardrails treat splits as effectively
  irreversible and history-sensitive, meaning a wrong split has nowhere defined to go.
- **`TRM-101`**: no unmerge/reversal workflow is referenced for a merge later found to be wrong,
  despite the workflow's own pre-merge reversibility check implying some merges are architecturally
  undoable — the correction path for the ones that turn out to be wrong isn't modeled.
- **`TRM-110`**: no stated policy for a copy of deleted data discovered *after* `VERIFIED_COMPLETE`
  was already recorded — only mid-execution discovery is handled; late discovery of the same
  problem after formal completion has no defined path.
- **`RLT-241`**: an excluded target's re-entry path exists in principle ("the constraint changing
  makes the target eligible again") but no triggering event or process is named for detecting that
  change — a correction path that exists conceptually but not mechanically.
- **`TRM-103`**: no un-consolidate/correction path for a consolidation later found wrong (P2 — a
  narrower, lower-confidence instance of `TRM-101`'s same shape).

## What already works well and should be the reference pattern

`FIN-132`–`140` and `TRM-110` are this round's clearest completion-and-feedback reference
implementations; a company building a real implementation contract for this dimension across other
domains should read those first before treating any localized gap above as representative of the
corpus as a whole.
