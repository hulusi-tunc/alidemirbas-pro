# Cross-library integration — proposed system invariants

The governing brief proposed 10 candidate invariants and asked that they be validated against the
corpus, not blindly adopted. Each is evaluated below against this round's actual findings across
all 11 companion documents, with current enforcement status, affected surfaces, and a validator
opportunity where one exists (cross-referencing `VALIDATOR-OPPORTUNITIES.md`).

---

### Invariant 1 — One exclusive orchestration scope has at most one active winner.

**Why needed:** without this, two journeys competing for the same customer/account/product scope
can both act, producing contradictory or duplicated consequential effects.

**Current enforcement:** **Structurally true at the arbitration layer, not yet true end-to-end.**
`OPS-131` itself correctly implements single-winner selection for all 7 declared competition groups
(`OWNERSHIP-AND-COMPETITION-INTEGRATION.md` Part 9 — scope construction, contender identity,
precedence, atomic claim, loser suppression, re-evaluation, preemption all present structurally).
But "winner selected" and "loser cannot act" are different claims: this round confirmed 5 of 7
groups have at least one member with no caller-side check of its own, so **the invariant does not
hold end-to-end today** — it holds at the arbiter, not at every caller.

**Affected surfaces:** Customer Journeys (all 7 groups' members are customer-communicating or
customer-silent), Runtime Mechanisms (`OPS-131` itself).

**Validator opportunity:** `competition_member_unenforced` (#1) and
`competing_member_no_live_state_check` (#2) in `VALIDATOR-OPPORTUNITIES.md`.

**Known exceptions:** none legitimate found — every unprotected member is a gap, not a documented
exception.

**Verdict: KEEP, with the honest caveat that it currently describes the arbiter's design intent,
not the corpus's current caller-side reality.**

---

### Invariant 2 — A consequential durable effect has one logical idempotency identity.

**Why needed:** without a single logical identity, a retry or duplicate delivery can produce a
second real-world effect (a second charge, a second case, a second shipment).

**Current enforcement:** **Held in every chain this round traced end-to-end** — `OPS-121`→`OPS-124`
(`logical_operation_key` vs. `attempt_number`, explicitly kept separate per `IDENTITY-AND-
PROVENANCE-AUDIT.md`), `FIN-132`/`133`/`135`→`FIN-136`, `SUB-163`→`SUB-164` (this program's own
repair), `RSK-192`/`RSK-198` (this program's own repair). The one flagged instance
(`DEC-181`'s ~30-sender fan-in — `IDEMPOTENCY-AND-RETRY-INTEGRATION.md` finding #1) is not a
confirmed violation, only an undocumented-at-the-structural-level risk: the protection exists, in
prose, and no traced case actually produced a duplicate.

**Affected surfaces:** all four.

**Validator opportunity:** already substantially covered by the Operational Workflow round's
`durable_work_without_idempotency`; `cross_layer_idempotency_key_orphaned` (#7) covers the
specific DEC-181-shaped residual risk.

**Known exceptions:** read-only/evaluation nodes correctly carry no idempotency identity (not a
violation — nothing consequential happens twice because nothing happens).

**Verdict: KEEP. The strongest-held invariant in the corpus.**

---

### Invariant 3 — A receiver instance is constructible from sender context.

**Why needed:** without this, a handoff can arrive at a receiver that cannot actually process it —
the DEC-181-shaped defect this program already repaired once.

**Current enforcement:** **Held for 512 of 522 handoff edges (98%), with 9 requiring documented
mapping and exactly 1 semantic mismatch** (`EDGE-COMPATIBILITY-MATRIX.md`). The one confirmed
recurrence-of-shape finding, `RET-24`→`RET-30`, is a genuine dual-concept identity split (not the
same root cause as DEC-181's fixed defect, but the same failure category). Zero dangling handoffs
corpus-wide.

**Affected surfaces:** all four; the one confirmed gap is Customer(human-routing)→Customer(silent).

**Validator opportunity:** the existing `handoff_identifier_unprovenanced` rule already covers most
of this; no new validator needed beyond what's already implemented.

**Known exceptions:** the "self-minted-by-receiver" pattern (documented, valid — a receiver that
mints its own identity on entry is not a violation of this invariant, since nothing needs to be
constructed from sender context for that field).

**Verdict: KEEP. Confirmed materially true, not merely aspirational.**

---

### Invariant 4 — Technical completion cannot imply business completion without authority.

**Why needed:** OPS-130's own founding principle — a job reporting SUCCESS is not the same claim as
the business outcome it was meant to produce having actually occurred.

**Current enforcement:** **Held at the point of detection, broken at the point of propagation.**
`OPS-130` correctly distinguishes the two and correctly refuses to let technical SUCCESS alone close
an obligation (`x.complete`/`x.business-complete` require actual business-state proof). But this
round's single most consequential finding is that `OPS-130`'s own exception path
(`RECONCILIATION_REQUIRED`, `x.reconciliation`) — the signal that exists specifically to make a lost
business result visible — has zero consumers anywhere in the corpus
(`RESULT-AND-FEEDBACK-INTEGRATION.md` Finding 1, P0). The invariant is enforced as a *local check*
but not as a *guaranteed cross-layer consequence*.

**Affected surfaces:** Runtime Mechanisms (`OPS-130` itself, its callers `OPS-121`/`OPS-124`),
practically every layer downstream that should but currently cannot learn about a reconciliation gap.

**Validator opportunity:** `runtime_arbiter_result_unconsumed` (#3).

**Known exceptions:** `x.complete`/`x.business-complete` correctly having zero outbound consumers is
NOT a violation — a plain success signal legitimately needs no further propagation.

**Verdict: KEEP, but flag as the corpus's most urgent enforcement gap. This is the round's
headline finding.**

---

### Invariant 5 — Consequential queued work revalidates mutable authoritative state.

**Why needed:** without this, work queued under one set of conditions can execute under a different,
now-stale set, producing an effect nobody would have authorized at execution time.

**Current enforcement:** **Held everywhere this round found a queued-then-executed chain with actual
material staleness risk, except one.** `CTL-232`/`233`→`234` (this program's own repair),
`RLT-243`→`244`, `DOC-215`/`216`/`220`, `OWN-54`, `FIN-135` all state and enforce an explicit
revalidate-or-bind choice. `SUB-163`→`SUB-164` is the one confirmed gap: renewal execution binds to
terms decided earlier with no revalidation branch and no explicit statement that binding (not
revalidating) is the intended choice (`TIME-AND-VERSION-INTEGRATION.md` finding #2, P1 — bounded
risk window, not confirmed active staleness).

**Affected surfaces:** primarily Operational Workflows (queued execution is largely their shape).

**Validator opportunity:** `queued_execution_no_version_binding_statement` (#5).

**Known exceptions:** none found where the omission was deliberate and stated; every gap found was
an undocumented silence, not a documented choice to skip revalidation.

**Verdict: KEEP.**

---

### Invariant 6 — Corrections append/supersede; they do not rewrite history.

**Why needed:** an overwritten historical record destroys the ability to explain a past decision or
detect a pattern of correction.

**Current enforcement:** **Held in every case checked this round.** `DAT-228`'s repaired rollback
path explicitly reconciles against preserved data rather than discarding it; every SCC traced in
`CYCLE-AND-DEAD-END-AUDIT.md` that involves a correction/reopen loop (the DEC/OWN/REM/FIN hub,
DOC-215/216/220, DAT-222-225) is gated by genuinely new evidence per pass rather than silently
resetting state; the `RET-23`/`RET-27` and `IDN-86`/`ACC-75` cycles are explicitly re-decisions
against current evidence, not overwrites.

**Affected surfaces:** all four.

**Validator opportunity:** none proposed — this invariant is currently verified only by manual
source reading (guardrail prose), and no mechanical signature reliably distinguishes "append" from
"overwrite" without deeper semantic understanding than a text-eval validator can safely automate.

**Known exceptions:** none found.

**Verdict: KEEP. Well-held, no mechanical enforcement currently exists or is obviously buildable.**

---

### Invariant 7 — Ownership cannot disappear during a required handoff.

**Why needed:** a handoff that ends the sender's involvement without the receiver taking it up
leaves consequential work with nobody accountable.

**Current enforcement:** **Held structurally by the graph shape itself** (a `handoff` node has no
`next` field, so it is always the last node on the sender's path — verified corpus-wide, zero
exceptions, `OWNERSHIP-AND-COMPETITION-INTEGRATION.md` Part 7), **but the receiver's own acceptance
is not uniformly explicit.** The escalation/reopen gap already known from the Operational Workflow
round (`DEC-189`/`DEC-190`→`DEC-183`'s `t.begins`, which explicitly names "a case being assigned" as
*insufficient* for review to begin, yet neither escalation path has a `DEC-182`-style accept/claim
step) is confirmed present at full-corpus scale, not worsened, but now known to have a
customer-facing caller (`DEC-184`) raising practical stakes.

**Affected surfaces:** Operational Workflows primarily; the sharpest instance sits at an Operational
↔ Customer boundary (`DEC-184`→`DEC-189`).

**Validator opportunity:** none new proposed this round; this is the same gap the Operational
Workflow round's `OWNERSHIP-AND-ASSIGNMENT-AUDIT.md` already catalogued as a P1, re-confirmed here.

**Known exceptions:** none.

**Verdict: KEEP.**

---

### Invariant 8 — UNKNOWN is not silently coerced to success/failure.

**Why needed:** treating an ambiguous external outcome as if it were a definite one risks either a
false duplicate action (treated as failure, retried) or a false completion (treated as success,
never reconciled).

**Current enforcement:** **Held in every UNKNOWN-handling chain traced this round.** `FIN-138`'s
`a.unknown` and `FUL-147`'s equivalent both suppress replacement actions until reconciliation
confirms the true outcome — two independent, domain-separated confirmations
(`INTEGRATION-TEST-MATRIX.md` scenarios 3 and 6).

**Affected surfaces:** financial, fulfillment (the two traced); likely holds elsewhere but not
exhaustively checked corpus-wide this round.

**Validator opportunity:** none proposed — the pattern is well-held and a text-based validator risks
false positives against domains that legitimately have no UNKNOWN concept.

**Known exceptions:** none found.

**Verdict: KEEP.**

---

### Invariant 9 — A business decision retains authority/evidence provenance across layers.

**Why needed:** without provenance, a downstream layer acting on a decision cannot verify it was
properly authorized, and a later audit cannot reconstruct why something happened.

**Current enforcement:** **Held in the reference cases, broken in a small, specific set.**
`DEC-190`→`REM-157` explicitly carries "on whose authority" (the round's cleanest instance). But
`TRM-104`→`REL-100` propagates an already-known unnamed-authority decision into a Silent Lifecycle
State with zero recoverable provenance (P1), and `RSK-200`→`ACC-79` captures authority locally but
doesn't thread it through the handoff (P2, recoverable in principle but not carried).

**Affected surfaces:** Operational Workflows → Customer (silent) is where both confirmed gaps sit.

**Validator opportunity:** none proposed this round beyond the already-known within-layer authority
findings (`AUTHORITY-AND-APPROVAL-AUDIT.md`); a cross-layer provenance-carrying check would need a
structured `authority`/`decidedBy` field on handoffs to be mechanically checkable, which does not
currently exist in the schema.

**Known exceptions:** none found — every gap is a real omission, not a documented deliberate choice.

**Verdict: KEEP.**

---

### Invariant 10 — A stale loser cannot execute after competition ownership changes.

**Why needed:** the specific, sharpest instance of Invariant 1 — this is the runtime consequence
that actually matters, not just "a winner is selected."

**Current enforcement:** **The round's most significant negative finding.** Of the 7 declared
competition groups: 1 cleanly protected (`purchase-intent`), 1 protected at first touch with an
ambiguous second touch (`commerce-recovery`), 1 partial/inconsistent (`relationship-continuity`),
1 lower-severity-unprotected (`outbound-ask`), and 3 confirmed unprotected, of which 2 carry P0
consequence: `account-restriction-authority` (`ACC-78`/`IDN-90`, safety-relevant — access can be
restored mid-active-compromise-investigation) and `retention-outreach` (5 of 6 members, the
corpus's largest and — per the prior round's own test matrix — "most realistic case for a genuinely
queued consequential message"; a human being assigned ownership via `RET-24` does not visibly
suppress `ACT-18`/`FBK-46`/`RET-28`/`RET-30`).

**Affected surfaces:** Customer Journeys (every competing member is customer-facing), with the
sharpest instance directly overlapping Invariant 7 / Part 8 (human ownership via `RET-24` not
visibly suppressing automation).

**Validator opportunity:** `competition_member_unenforced` (#1), `competing_member_no_live_state_
check` (#2).

**Known exceptions:** none — `ACQ-04`/`ACQ-07`/`ACQ-08` (protected) and `ACC-77`'s own working
push-model invalidation (a valid, `OPS-131`-independent alternative pattern) are the corpus's
demonstrated *capability* to do this correctly; the gap is adoption, not feasibility.

**Verdict: KEEP. This is the invariant the corpus most needs a repair round for.**

---

## Summary

All 10 proposed invariants are validated as genuinely load-bearing principles this corpus already
tries to follow — none is rejected or revised. **Invariants 1, 4, and 10 are the three where actual
enforcement materially lags the stated principle**, and all three point at the same underlying
gap from different angles: the corpus's arbitration/detection machinery (`OPS-131`, `OPS-130`) is
sound, but propagation to and adoption by callers is where defects concentrate. Invariants 2, 3, 5,
6, 7, 8, and 9 are substantially held, each with a small number of localized, already-catalogued
gaps rather than systemic failure.

No invariant needed rejection or revision from what the governing brief proposed — this is itself
informative: the four-layer canonical corpus's implicit design philosophy, inferred bottom-up
across five audit rounds now, matches what a top-down statement of correct behavior would predict.
