# Cross-library integration — end-to-end test matrix

16 real end-to-end chains traced directly against `production/canonical-dump.json` source (no
invented canonical ids), covering the governing brief's 8 required scenario shapes plus 8
additional domain chains (acquisition, commerce, subscription, financial, identity, consent,
fulfillment, incident, document, risk, retention, terminal/closure — the brief's explicit domain
list). Each entry below is a **test scenario specification**: what a real integration test (manual
or automated, once this program moves to implementation) would exercise, the actual node path it
walks, and the pass/fail condition derived from source. This is the audit's primary deliverable for
future test-writing, not a claim that these tests currently exist anywhere.

Full node-by-node traces (all 16, with source quotes for every transition) are preserved for
reference at the end of this file's companion research; the table below is the actionable
specification.

## The 8 required scenarios

### 1. Competition scenario

**Chain:** `ACQ-04` / `ACQ-07` / `ACQ-08` (purchase-intent group, scope `product`) → `OPS-131` →
loser suppressed, winner proceeds; genuine ties escalate to `DEC-181` → `DEC-182`.

**Setup:** two of the three journeys become eligible for the same product/person scope
simultaneously.

**Pass condition:** `OPS-131` selects exactly one active owner per its declared precedence;
`ACQ-04`'s `c.converted` check (immediately before its human-task `a.assign`) reroutes to `ACQ-08`
if the destination was already reached by a winning contender — this is a genuinely enforced,
structural check, not merely declarative. `ACQ-07`/`ACQ-08` have no consequential send of their own
to protect against a stale-loser race (confirmed in `OWNERSHIP-AND-COMPETITION-INTEGRATION.md`
Part 10).

**Fail condition:** a losing contender's `a.assign` fires after a winner has already reached the
destination.

**Current status: PROTECTED**, per source. Reference implementation for this scenario shape.

### 2. Human ownership scenario

**Chain:** `RLT-246` (automated pause, active orchestration) → `RLT-247` (`a.determine`,
`execution: "human"`, just repaired this program to require an "authorized recovery-decision
role") → `RLT-248` (automated execution resumes on the human's decision).

**Setup:** an active rollout pauses; a human recovery-decision role determines rollback vs.
forward-recovery; automation resumes execution of whichever path was chosen.

**Pass condition:** `RLT-246`'s automated pause state persists until `RLT-247`'s human decision is
recorded; `RLT-248` only proceeds once `RLT-247` has produced a decision, never on a stale/default
assumption.

**Fail condition:** `RLT-248` executes before `RLT-247`'s decision exists, or `RLT-246`'s own
automation resumes independently of the human decision.

**Current status: intact** per source trace; no defect found on this specific chain.

### 3. Operational completion scenario (+ Unknown external effect, combined)

**Chain:** `FIN-137` (financial obligation raised) → `FIN-138` (`a.unknown`, provider outcome
UNKNOWN) → `FIN-140` (reconciliation, no blind duplicate).

**Setup:** a payment/financial provider returns UNKNOWN (not success, not failure) for an
obligation.

**Pass condition:** `FIN-138`'s `a.unknown` path suppresses any replacement payment/refund action
until reconciliation confirms the true outcome; `FIN-140` reconciles against the obligation's
*current* balance, not a stale snapshot captured at attempt time.

**Fail condition:** a second payment/refund is issued blindly while the first attempt's outcome is
still UNKNOWN, or reconciliation uses stale balance data.

**Current status: PROTECTED.** This is the financial domain's own reference pattern
(`FIN-132`/`133`/`135`→`FIN-136`, cited independently in `RESULT-AND-FEEDBACK-INTEGRATION.md` as
"a single, consistently-gated payment source of truth with no competing trigger anywhere in the
corpus").

### 4. Correction scenario

**Chain:** `DAT-228` (`a.rollback` → `a.reconcile-preserved` → `c.reconciled`, this program's own
just-repaired canonical graph change) → on genuine conflict, `h.decide-conflict` → `DEC-181`.

**Setup:** a rollback occurs after other writes were made to the same target; preserved
cutover-window data must be reconciled, not silently discarded or silently kept.

**Pass condition:** `c.reconciled`'s "Cleanly" branch rejoins `x.rolled-back` (now reached only
post-reconciliation, per this program's own repair); the "Genuine conflict" branch hands off to
`DEC-181` carrying the rollback snapshot id, the preserved writes, and the source's independent
changes since — append-only history preserved throughout, original migration record never
overwritten.

**Fail condition:** rollback data is captured but never consumed (the pre-repair defect this
program already fixed), or the original record is overwritten as though the prior operation never
happened.

**Current status: FIXED this program**, confirmed intact by direct re-trace this round.

### 5. Duplicate handoff scenario

**Chain (a), sender retry:** `SUB-163` → `SUB-164`, guarded by `renewal_cycle_id` (`instanceKey`,
`concurrency: "one-active-per-key"`, `idempotencyKey`s on `a.financial`/`a.new-term` — this
program's own just-repaired P0).

**Chain (b), concurrent invocation (not a sender/receiver pair — one workflow entered twice
concurrently):** `RSK-198`'s check-then-act race, closed via `entity.concurrency:
"one-active-per-key"` on `exception_id` (this program's own just-repaired P0); `RSK-192`'s
create-if-absent case creation on `risk_subject_id` (same program, same round).

**Pass condition:** a redelivered `renewal_authorized_for_execution` event for the same
`renewal_cycle_id` resolves to the same financial obligation and the same new term, never a second
one (chain a); concurrent invocations of `RSK-198`'s override-then-consume sequence for the same
`exception_id` cannot both pass validity and both apply the override (chain b).

**Fail condition:** a retried/duplicate event creates a second obligation, term, or override
consumption.

**Current status: FIXED this program**, both chains, confirmed intact.

### 6. Unknown external effect scenario

Covered under scenario 3 above (`FIN-138`) and independently confirmed a second time at `FUL-147`
(fulfillment domain, `a.unknown` dispatch/delivery outcome tracking → external-status-reconciliation).
Both PROTECTED.

### 7. Reopen scenario

**Chain (a):** `DEC-190`'s `c.authority` branch distinguishes a same-scope reopen from a genuinely
new case.

**Chain (b):** `TRM-101` (entity merge, conflict path) → `TRM-102` (conflict resolution) — **a
confirmed gap**: `TRM-102`'s `x.resolved` exit has no handoff back into `TRM-101` to resume
consolidation, and `TRM-101` has no unmerge/reversal path for a merge later found wrong.

**Pass condition:** closed work reopening on valid new evidence correctly resolves to the same
instance (not a spurious new episode) when the evidence pertains to the same underlying case;
correction chains complete (the workflow that paused for conflict resolution actually resumes).

**Fail condition:** `TRM-102` resolves a merge conflict and nothing in the corpus ever resumes
`TRM-101`'s consolidation — the one operation gated by this program's own newly-added
`execution: "human"` + authorized-role requirement has no way to finish after a conflict, and no
way back if the merge turns out wrong.

**Current status: chain (a) intact. Chain (b) FAILS — P1** (see Findings below; not P0 because no
confirmed active occurrence, and the merge's own pre-condition gating via `c.reversible`/`c.evidence`
reduces likelihood, but the structural gap is real).

### 8. Supersession scenario

**Chain (primary):** `CTL-232`/`CTL-233` (`a.revalidate`) → `CTL-234`, this program's own
just-repaired P0 (both paths into `CTL-234` now revalidate before consequential execution).

**Chain (second instance, found this round):** `RLT-243` → `RLT-244`, an independent confirmation
of the same revalidate-before-execute pattern in the rollout domain.

**Pass condition:** queued/consequential work checks current authoritative state immediately before
executing; a newer entity/version winning after the work was queued causes the queued work to
revalidate and, where it no longer holds, reject rather than execute on stale state.

**Fail condition:** queued work executes using state read at entry time, ignoring changes made
while it waited (the exact pre-repair `CTL-232` defect).

**Current status: FIXED this program** (primary chain); **reference pattern confirmed intact
elsewhere** (`RLT-243`/`244`, and `DOC-215`/`216`/`220` for document versioning).

## 8 additional domain chains (not required scenario shapes, traced for corpus breadth)

| # | Domain | Chain | Notable finding |
|---|---|---|---|
| 9 | Identity + access (2nd competition group) | `IDN-90` vs. `ACC-78` (`account-restriction-authority`, `onLoss: "paused"`) | **P0** — neither member re-checks the other's live state before lifting/extending a restriction; see `OWNERSHIP-AND-COMPETITION-INTEGRATION.md` |
| 10 | Commerce | `ACQ-11` → `FIN-134` (payment-failure handoff) | Clean; reference pattern |
| 11 | Retention (3rd competition group) | `FBK-46`/`RET-28`/`RET-24`/`RET-30`/`RET-32`/`ACT-18` (`retention-outreach`) | **P0 — the round's single most important finding**: 5 of 6 members have zero structural enforcement of declared precedence; `RET-24` is a human-routing journey, so human ownership does not visibly suppress the other 4 |
| 12 | Consent | `CON-35` (`change_version` guard) → `CON-40` | Clean; version-guarded propagation confirmed |
| 13 | Fulfillment | `FUL-147` (`a.unknown`) → external-status-reconciliation | Clean; second UNKNOWN-handling reference instance |
| 14 | Incident | `INC-259` (`a.reopen-action` loop) → `INC-260` | Clean at the pattern level; corrective-work reopen loop is evidence-gated |
| 15 | Document | `DOC-217` (`a.supersede`, prospective) → `DEC-181` | P2/informational — supersede step doesn't itself invalidate queued consumers of the old version, relies on each consumer's own freshness check; not exhaustively verified across all consumers |

## Findings surfaced specifically by end-to-end tracing (not duplicated elsewhere)

| Finding | Location | Severity |
|---|---|---|
| `TRM-102.x.resolved` has no handoff back into `TRM-101` to resume consolidation after conflict resolution | `src/canonical/terminal.ts` (TRM-101/TRM-102) | **P1** |
| `TRM-101` has no unmerge/reversal path for a merge later found wrong | `src/canonical/terminal.ts` (TRM-101) | **P1** (independently confirms `COMPLETION-AND-FEEDBACK-AUDIT.md`'s existing finding via source trace, not merely cited) |
| `RET-31`/`SCH-282` tie in the `commerce-recovery` competition group has no named GLB-02 discriminator | acquisition/scheduling + `OPS-131` | P2 |
| `OPS-131`'s contender granularity (journey-level vs. step-level) is ambiguous against `RET-28`'s step-scoped competition declaration | `src/canonical/processing.ts` (OPS-131) / `retention.ts` (RET-28) | P2 |
| `onLoss: "paused"` resume semantics are stated only at the generic OPS-131/GLB-10 level, not concretely modeled inside `ACC-78`/`IDN-90` themselves | access/identity | P2, informational |
| `DOC-217`'s supersede step doesn't itself invalidate queued consumers of the old version (relies on each consumer's own check) | `src/canonical/document.ts` (DOC-217) | P2, informational, not exhaustively verified corpus-wide |

All 16 full traces (every node id visited, every source quote relied on) are preserved in this
round's working notes and available on request; this document carries the actionable
specification and pass/fail conditions derived from them.
