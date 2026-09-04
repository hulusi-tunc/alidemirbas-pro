# Cross-library integration repair — canonical topology changes

Every change to `src/canonical/*.ts` graph *topology* (nodes/edges, not just metadata) made while
closing the 3 confirmed cross-library integration P0s and the `TRM-101`/`TRM-102` adjacent P1.
Node count moved from 3682 to **3690** (net +8); edge count from 548 to **550** (net +2 handoffs).
No canonical item was added or removed; no rule was added or removed.

## `ACC-78` (Access Suspension) — 2 new nodes

**Before:** `c.outcome`'s "Reason resolved" branch and `c.review`'s "Lift it" branch both routed
directly to `h.restore`, with no check of the competing `IDN-90` investigation's live state.

**Why metadata was insufficient:** the missing check is a real decision point (should this release
proceed right now, given a possibly-still-open higher-precedence contender) — a metadata note
cannot make a graph edge actually re-read live state before proceeding.

**After:** both branches now route to new **`a.check-authority`** (re-reads whether a
higher-precedence account-restriction-authority contender is still open) → new
**`c.authority-clear`** ("Clear" → `h.restore`, reused; "Still contested" → `a.extend`, reused).

## `RET-24` (Churn Risk Escalation) — 1 new node

**Before:** `c.human`'s "Justified" branch routed directly to `a.owner-task`, with no check of
whether `FBK-46` (an open issue under human ownership, the group's other higher-precedence member
besides `RET-28`, already separately checked via `c.intent`) already claims the account.

**Why metadata was insufficient:** same shape as `ACC-78` — a real decision point requiring a live
re-check, not a documentation change.

**After:** `c.human`'s "Justified" branch now routes to new **`c.priority-clear`** ("Clear" →
`a.owner-task`, reused; "Contended" → `x.monitor`, reused, its text broadened to cover this reason).

## `SUB-163` (Renewal Decision) — 1 new node

**Before:** `c.decision` had only "Renew"/"Do not renew" branches; `w.decision`'s own `recheck`
text promised to surface "a cancellation in motion" but nothing consumed that finding.

**Why metadata was insufficient:** a third real outcome (cancellation supersedes the renewal
decision) needs a third branch and a genuine destination for it, not a label.

**After:** `c.decision` gains a "Cancellation in motion" branch → new **`x.superseded`** exit
(class: `suppression`). `w.review`'s `recheck` text was also broadened to match `w.decision`'s, a
metadata-only fix on that specific inconsistency.

## `SUB-164` (Renewal Execution) — 2 new nodes

**Before:** `c.resolved`'s "All satisfied" branch routed directly to `a.new-term`, which created
the new term from terms carried at `SUB-163`'s decision time with no revalidation against what
currently governs the relationship.

**Why metadata was insufficient:** detecting "terms changed since decision" and routing to a
reconciliation step is a decision + an action, not documentation.

**After:** `c.resolved`'s "All satisfied" branch now routes to new **`c.terms-current`**
("Unchanged" → `a.new-term`, reused; "Materially changed" → new **`a.reconcile-terms`**, which
re-derives the term's dates/pricing/scope from current governing terms before proceeding to
`a.new-term`). Stayed entirely within `SUB-164` — no new cross-journey edge, no new cycle.

## `TRM-101`/`TRM-102` (Entity Merge / Merge Conflict Resolution) — net +2 nodes, 1 new edge, 1 new cycle

**Before:** `TRM-102`'s `x.resolved` exit ("RESOLVED; the merge may complete") had no outbound
handoff. `TRM-101`'s merge operation, once handed to `TRM-102` for conflict resolution, had no way
to resume and actually finish — a confirmed dead end (the source explicitly states a continuation
that the graph could not perform).

**Why metadata was insufficient:** resuming a paused operation from a specific point (`a.consolidate`,
not the beginning) is a real control-flow edge; no amount of text on the existing terminal exit
could create a path back into `TRM-101`.

**After:**
- `TRM-102`: `c.outcome`'s "Resolved" branch now routes to new **`h.resume`** (handoff to `TRM-101`,
  carrying `merge_operation_id`, the resolution and its basis) in place of the removed `x.resolved`
  exit.
- `TRM-101`: `t.authorized`'s evidence broadened to accept a second origin shape (resuming after
  `TRM-102` conflict resolution, vs. a fresh authorization); `next` changed from `a.operation`
  directly to new **`c.origin`** ("Fresh authorization" → `a.operation`, reused; "Resuming after
  conflict resolution" → `a.consolidate`, reused).
- Net: `TRM-102` loses 1 node (`x.resolved`, removed) and gains 1 (`h.resume`) — net 0 for that
  file. `TRM-101` gains 1 node (`c.origin`) — net +1. Combined net for the pair: **+1 node**.
- **New edge:** `TRM-102 h.resume → TRM-101` (Operational→Operational).
- **New cycle:** `TRM-101 ↔ TRM-102` (a new 2-node SCC). Classified **SAFE, bounded**: re-entry
  into `TRM-101` requires an actual `TRM-102` conflict-resolution event with a real, recorded basis
  — the same evidence-gated re-entry pattern already found safe throughout the corpus's other 16
  SCCs (e.g. `DEC-181`'s own hub, the `CMS-20x` retry chain). No side effect repeats on a bare
  timer or unconditioned loop; each pass consumes a genuine new fact (the conflict's resolution).

## `OPS-130` (Business Outcome Verification) — net +1 node, 1 new edge

**Before:** `c.confirmed`'s "Missing or conflicting" branch and `w.pending`'s `onTimeout` both
routed to `x.reconciliation`, a terminal exit with zero outbound handoffs and zero corpus-wide
consumers of its `RECONCILIATION_REQUIRED` state — the signal existed "so that gap is visible" but
nothing was wired to see it.

**Why metadata was insufficient:** propagating a genuine, already-detected discrepancy to an
authority that can decide what to do about it requires a real handoff edge; the exit node itself
has no `to` field and cannot become one without a topology change.

**After:** both predecessors now route to new **`a.reconcile`** (records `RECONCILIATION_REQUIRED`,
`idempotencyKey: "work_id + a.reconcile"`) → new **`h.escalate`** (handoff to `DEC-181`, carrying
`work_id`, `logical_operation_key`, `correlation_id`, the business entity, the technical result and
verification evidence; `contract.requiredFields: ["work_id"]`). The old `x.reconciliation` exit was
removed (superseded — `h.escalate` is now where this instance's own path ends, per the corpus's
established handoff-ends-the-path convention). No return handoff was added from `DEC-181` back into
`OPS-130` — see `FIXES-APPLIED.md`'s "Result loop" note for why that would have been inconsistent
with how `DEC-181`'s other ~30 referrers already work.

**New edge:** `OPS-130 h.escalate → DEC-181` (Runtime→Operational). No new cycle — `DEC-181`'s own
resolution path does not loop back into `OPS-130`.

## Node count reconciliation

| Journey | Nodes added | Names | Nodes removed | Net |
|---|---|---|---|---|
| `ACC-78` | 2 | `a.check-authority`, `c.authority-clear` | — | +2 |
| `RET-24` | 1 | `c.priority-clear` | — | +1 |
| `SUB-163` | 1 | `x.superseded` | — | +1 |
| `SUB-164` | 2 | `c.terms-current`, `a.reconcile-terms` | — | +2 |
| `TRM-101` | 1 | `c.origin` | — | +1 |
| `TRM-102` | 1 | `h.resume` | `x.resolved` | 0 |
| `OPS-130` | 2 | `a.reconcile`, `h.escalate` | `x.reconciliation` | +1 |
| **Total** | **10 added** | | **2 removed** | **net +8 (3682 → 3690)** |

New edges: `TRM-102 h.resume → TRM-101`, `OPS-130 h.escalate → DEC-181` (+2, 522→524 handoffs;
550 total edges including the unchanged 22 competition + 4 preemption).

No node was removed other than the two explicitly named above (each superseded by an equivalent
or better-connected replacement, not deleted without a functional successor), and no existing edge
was rewired other than the ones described (each change redirects exactly the branches/timeouts
named, then rejoins the existing graph at the named reused targets).
