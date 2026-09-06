# Canonical graph changes — Operational Workflow repair round (2026-09-04)

This document lists every change to `src/canonical/*.ts` **topology** (nodes/edges, not just
metadata) made while closing the 11 confirmed P0s in the operational-workflow
production-readiness audit. Per the governing brief's Part 29, a graph change is listed here only
when metadata alone could not fix the defect — every entry below states explicitly why.

Baseline moved from 284 journeys / 3674 nodes to 284 journeys / **3682 nodes** (net +8), 8 merged
ids unchanged, 423 rules / 31 global rules unchanged (no rule was added or removed — only node
topology changed). `production/validate-journey-production.mjs` check 30 was updated to the new
baseline in this round.

4 workflows received topology changes (1 more than the audit's original 3 `NEEDS_CANONICAL_CHANGE`
items — DEC-181 is the additional one, justified below per Part 29's explicit allowance for
proven-necessary additions beyond the original 3).

---

## DAT-228 — rollback data preserved but never consumed

**Before:** `a.rollback`'s `next` pointed directly to the terminal exit `x.rolled-back`. The
action's own prose claimed the target's cutover-window writes were "recorded for reconciliation,"
but no node anywhere in the graph ever read or acted on that preserved data — the rollback
capability existed only descriptively.

**Why metadata was insufficient:** there was no existing node that could be annotated into a
"consumer" of the preserved data — reconciliation is itself a decision (clean vs. conflicting) with
two genuinely different outcomes, which requires a condition node, not a flag on the exit.

**After:**
- `a.rollback` → **`a.reconcile-preserved`** (new action; mints/uses `rollback_snapshot_id`,
  `idempotencyKey: "rollback_snapshot_id + a.reconcile-preserved"`) → **`c.reconciled`** (new
  condition, branches "Cleanly" → `x.rolled-back` (reused, now only reached once reconciliation
  actually ran) and "Genuine conflict" → **`h.decide-conflict`** (new handoff to DEC-181, carrying
  `rollback_snapshot_id` + the preserved writes + the source's independent changes since).
- `x.rolled-back`'s state text changed from "recorded for reconciliation" (aspirational) to
  "reconciled against it" (now literally true).
- 3 new nodes: `a.reconcile-preserved`, `c.reconciled`, `h.decide-conflict`.

**Regression test:** rollback data is captured with a snapshot id at the moment of rollback; a
rollback event invokes `a.reconcile-preserved`; `c.reconciled` branches to either a clean rejoin
at `x.rolled-back` or a conflict handoff to DEC-181; the original migration record is never
overwritten, only appended to / reconciled against (append-only history preserved).

---

## CTL-232 — one path revalidates, one doesn't

**Before:** `c.acceptance`'s "It is not [required]" branch routed straight to `h.execute`,
skipping the revalidation step that the "acceptance required" branch (via CTL-233) performs before
executing. This violated CTL-234's own `t.authorized` trigger, which requires "a transfer
revalidated and authorized against the entity's current state" — satisfied on one path, not the
other.

**Why metadata was insufficient:** revalidation is a check against live state, which needs an
action + condition pair, not a document annotation — a metadata note cannot make a graph edge
actually re-read current state before proceeding.

**After:** `c.acceptance`'s "It is not" branch now routes to **`a.revalidate`** (new action,
`idempotencyKey: "transfer_request_id + a.revalidate"`) → **`c.revalidated`** (new condition:
"It holds" → `h.execute` (rejoining the original flow), "It no longer holds" → the *existing*
`a.reject` node, reused rather than duplicated). Modeled on CTL-233's own established
revalidate → condition → branch pattern, scaled down to 2 new nodes by reusing the existing reject
target instead of building a parallel one.

**Regression test:** state changes after entry but before execution, on the "acceptance not
required" path — `a.revalidate`/`c.revalidated` catches the staleness and routes to the existing
`a.reject`, so neither path can act from stale state. The "acceptance required" path continues
unchanged via CTL-233.

---

## INC-258 — closure reachable with zero mitigation applied

**Before:** `c.mitigations` had 2 branches, both implicitly assuming at least one mitigation had
been applied. A third reachable state — no mitigation ever applied — fell through unnamed, so an
incident could reach a "successfully closed" state having never been mitigated at all, contradicting
the workflow's own purpose.

**Why metadata was insufficient:** the missing branch is a missing decision outcome, not a missing
label — there was no node to attach "no mitigation was applied" metadata to; the condition itself
needed a third branch and something for that branch to reach.

**After:** `c.mitigations` gains a 3rd branch, "None were ever applied" → **`a.no-mitigations`**
(new action, rejoins the existing flow at `c.cases` — no separate closure path). The existing 2
branches' `when` text was tightened to explicitly require "at least one temporary mitigation was
applied," making the 3-way split precise. 1 new node, added by rejoining `c.cases` rather than
building a parallel route, preserving every pre-existing valid branch (mitigated / cannot-mitigate
/ superseded / external-resolution).

**Regression test:** an incident with zero mitigations ever applied reaches `c.mitigations`, takes
the "None were ever applied" branch to `a.no-mitigations`, and is routed through the same
`c.cases` scrutiny as every other outcome — it cannot silently reach a "successfully resolved"
closure state without that scrutiny.

---

## DEC-181 — entry semantics didn't fit non-human/customer referrers (additional graph change)

DEC-181 was not one of the audit's original 3 `NEEDS_CANONICAL_CHANGE` items, but the Part 2 repair
proved a genuine topology gap while closing it: internally-referred requests (from a Runtime
Mechanism or an Operational Workflow, as opposed to a human/customer requester) with missing
information had no correct path. The prior 2-branch `c.info` model implicitly assumed a human who
could be prompted for more information; an internal referrer needs to be told to fix and re-refer,
not "pended" as if mid-conversation with a person.

**Why metadata was insufficient:** the missing-information branch's destination genuinely differs
by origin — a human/customer path can wait on a prompt-and-respond loop; an internal referral
cannot, since there is no conversational actor to prompt. That is a routing difference, which
needs a graph branch, not a data flag on the existing single branch.

**After:** `c.info` split from 2 branches to 3 — "Complete" → `a.create` (unchanged),
"Missing, human/customer-originated" → `a.pending-info` (renamed label, same target as before),
and a new third branch "Missing, internally referred" → **`a.return-to-referrer`** (new action,
`idempotencyKey: "request_id + a.return-to-referrer"`) → **`x.returned`** (new exit). 2 new nodes.
Alongside this, `entity.instanceKey: ["request_id"]` / `concurrency: "one-active-per-key"` was
added (request_id minted by `a.capture` on entry), and exactly one structural distinction —
human/customer-originated vs. internally-referred — was threaded through `a.capture`, `c.valid`,
and `c.info` to support DEC-181's ~30 real senders without per-sender branches.

**Cross-layer verification:** OPS-131 (Operational Workflow competition-arbitration mechanism, one
of DEC-181's senders) was read in full and confirmed to need no change — its existing `h.escalate`
carries (`exclusion_group`, `scope_instance_id`, `contenders`, precedence text) map cleanly onto
the generalized model without needing `request_id`, since `request_id` is self-minted downstream
by DEC-181's own `a.capture`. OPS-131 was **not modified**.

**Regression test:** human-originated request; customer-originated request; Runtime Mechanism
referral; Operational Workflow referral (including OPS-131); duplicate referral (idempotency);
invalid/unauthorized origin; receiver instance identity (request_id self-minted by `a.capture`);
missing-info-for-internal-referral routes to `a.return-to-referrer`/`x.returned`, distinct from the
missing-info-for-human/customer path routing to `a.pending-info`.

---

## Node count reconciliation

| Workflow | New nodes | Names |
|---|---|---|
| DAT-228 | 3 | `a.reconcile-preserved`, `c.reconciled`, `h.decide-conflict` |
| CTL-232 | 2 | `a.revalidate`, `c.revalidated` |
| INC-258 | 1 | `a.no-mitigations` |
| DEC-181 | 2 | `a.return-to-referrer`, `x.returned` |
| **Total** | **8** | 3674 → 3682 |

No node was removed and no existing edge was rewired other than the ones named above (each
described change rewires exactly one outgoing edge into the new node chain, then rejoins the
existing graph at a named point).
