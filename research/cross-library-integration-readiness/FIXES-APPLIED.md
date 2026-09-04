# Cross-Library Integration Fixes Applied

Repair round following the Cross-Library Integration Audit (`CROSS-LIBRARY-INTEGRATION-AUDIT.md`).
Closes all 3 confirmed integration P0s, repairs 4 adjacent P1s, adds 2 new cross-library
validators, regenerates the relationship graph and all downstream artifacts, and re-runs the full
audit from current source.

## Corpus

Before (the state the Cross-Library Integration Audit measured):
284 items
3682 nodes
548 edges (522 handoff, 22 competition, 4 preemption)

After:
284 items
3690 nodes (+8, all deliberate — see `INTEGRATION-CANONICAL-CHANGES.md`)
550 edges (524 handoff, 22 competition, 4 preemption — +2 handoffs: `TRM-102→TRM-101`,
`OPS-130→DEC-181`)

No canonical item was added or removed. All 22 competition members, 7 groups, 4 preemption edges,
and the 2 confirmed orphans (`REL-99`, `INT-120`) are unchanged in identity.

## P0 Repairs

### account-restriction-authority (`ACC-78` / `IDN-90`)

Before:
`ACC-78`'s `c.review`/`c.outcome` branches that release a suspension (`h.restore`) never
referenced `IDN-90`'s live state, despite `ACC-78`'s own declared precedence text ("a concurrent
business-reason suspension... pauses rather than resolving independently while this investigation
is open") and `onLoss: "paused"`. A suspension review reaching "Lift it" could restore access
mid-active-compromise-investigation with no structural check.

Root cause:
`OPS-131`'s own arbitration is correct and does suppress/pause the loser at the moment of contest,
but nothing in `ACC-78`'s own graph re-checks *live* competitor state immediately before its own
consequential release action fires later — the same caller-adoption gap the audit found across 5
of 7 competition groups, here at P0 severity because the consequence (restoring access during an
active compromise investigation) is safety-relevant.

After:
`c.outcome`'s "Reason resolved" branch and `c.review`'s "Lift it" branch both now route to a new
`a.check-authority` action (re-reads whether a higher-precedence contender, `IDN-90`, is still open
for the same account) → new `c.authority-clear` condition: "Clear" → `h.restore` (existing,
reused); "Still contested" → `a.extend` (existing, reused — deferring is functionally the same
outcome as extending). `IDN-90` itself was **not modified**: it is the group's own highest-precedence
member and structurally never defers, so it has nothing to check.

Enforcement owner:
`ACC-78` itself (local revalidation gate, 2 new nodes) — not `OPS-131`, which stays the single
source of precedence policy.

Tests:
See `INTEGRATION-TEST-MATRIX.md` §"account-restriction-authority" scenario; regression case:
`ACC-78` reaches "Lift it" while `IDN-90` is open on the same account → routes to `a.extend`, not
`h.restore`.

Validator:
`competition_member_unenforced` (new) would have flagged `ACC-78`'s pre-fix shape; post-fix it
does not (the new nodes' text matches the validator's own enforcement markers).

### retention-outreach (`ACT-18` / `FBK-46` / `RET-24` / `RET-28` / `RET-30` / `RET-32`)

Before:
5 of the group's 6 members had no caller-side check of declared precedence before a consequential
send/task. `RET-24` (one of the 3 confirmed human-routing-only Customer Journeys) winning the group
did not visibly stop `ACT-18`, `FBK-46`, `RET-28`, or `RET-30` from independently acting on the same
account — the audit's single most important finding.

Root cause:
Two distinct root causes, requiring two distinct fixes:
1. `ACT-18`, `FBK-46`, `RET-28`, `RET-30` all reach their consequential action via `execution:
   "communication"` — i.e. every one of them is a message send that passes through the corpus's
   own `CMS-202→...→CMS-206` send-path pipeline. That pipeline's own documented step 3 ("journey
   competition and precedence", per `production/canonical-dump.json`'s `sendPathOrder`) was
   **declared but never implemented anywhere** — no concrete node in the whole corpus performed it,
   which is why the many journeys whose own `c.sendable`-style text says "the send path passes"
   were, until this fix, describing a check that did not structurally exist.
2. `RET-24`'s own consequential action (`a.owner-task`, raising a human task) is `execution:
   "human"`, not `"communication"` — it does not pass through the message send path at all, so
   fixing the send path alone would not have protected it.

After:
- **Generic fix (protects `ACT-18`, `FBK-46`, `RET-28`, `RET-30`, and reinforces `RET-32`'s own
  already-correct claim, without touching any of their individual graphs):** `CMS-205`
  ("Send Eligibility Check", the corpus's own execution-time revalidation stage) — `a.reread`'s
  does-text and `c.valid`'s branches extended: where the message's originating journey declares a
  competition `exclusionGroup`/`scope`, the re-read now includes OPS-131's current established
  owner for that scope, and losing current ownership since the message was queued routes to the
  existing `a.suppress`/`x.suppressed` path (GLB-07: a losing contender's queued message does not
  get to run merely because it was queued before it lost). Zero new nodes — this makes the send
  path's own declared step 3 real, generically, for every competition-bound message in the corpus.
- **Local fix (`RET-24` only, `execution: "human"`, not covered by the CMS-205 fix):** `c.human`'s
  "Justified" branch now routes to a new `c.priority-clear` condition (re-checks whether an open
  issue under human ownership, `FBK-46`, already claims the account) before `a.owner-task` — "Clear"
  → `a.owner-task` (existing, reused); "Contended" → `x.monitor` (existing, reused, reworded to
  cover this reason too). `c.intent`'s existing cancellation-intent check already covered the
  group's other higher-precedence member (`RET-28`), so only the `FBK-46` leg needed a new check.

Human/automation ownership semantics:
`RET-24` winning the group (a human being assigned an at-risk relationship) now structurally
suppresses `ACT-18`/`FBK-46`/`RET-28`/`RET-30`'s own sends via the CMS-205 fix (OPS-131 having
already applied `onLoss: "suppressed"` at arbitration time is now actually enforced at send time
too), and `RET-24` itself will not raise a competing owner-task while `FBK-46` already owns an open
issue on the same account. Neither direction was previously enforced; both are now.

Tests:
See `INTEGRATION-TEST-MATRIX.md` §"retention-outreach" scenario (human ownership + stale-loser
combined).

Validator:
`competition_member_unenforced` no longer flags `RET-24` (its new `c.priority-clear` text matches
the validator's enforcement markers); `ACT-18`/`FBK-46`/`RET-28`/`RET-30`/`RET-32` were never
flagged by this validator in the first place (it is deliberately scoped to non-`"communication"`
actions, since `"communication"` ones are the CMS-205 fix's own scope).

### `OPS-130` `RECONCILIATION_REQUIRED` has no consumer

Before:
`x.reconciliation` (`RECONCILIATION_REQUIRED`) was a terminal exit with no outbound handoff and no
corpus-wide consumer of its event name — the corpus's own canonical technical-vs-business
completion arbiter had a signal, designed explicitly "so that gap is visible rather than reported
as done," that nothing in the other 283 journeys was wired to notice.

Chosen receiver:
`DEC-181` (Decision Request) — an **existing** canonical item, not a new one.

Why:
Searched the corpus for an existing generic (non-domain-specific) reconciliation/investigation
responsibility — none exists; `FIN-140` and `DOC-220` are real, working reconciliation workflows
but both are domain-specific, and `OPS-130` is domain-agnostic infrastructure with no way to
dispatch to the right one at a graph level. `DAT-222` (Data Validation) was checked and rejected —
it validates *incoming import data*, a different problem entirely. `OWN-55` (Responsibility
Escalation) was checked and rejected — its own model is authority-limit escalation of an existing
work item's ownership chain, not resolution of a technical/business-state discrepancy. `DEC-181`
fits: its own entry evidence ("an action or state that cannot proceed without an authorized
judgment being made about it") matches once verification has *already* run and definitively found
a gap — what remains (confirm the state is actually present and verification was wrong, authorize
remediation, or formally accept the loss) is a genuine authorized-judgment decision, not further
diagnosis, and `DEC-181` was itself just repaired (the prior repair round) specifically to accept
non-human/customer-originated referrals from Runtime Mechanisms and Operational Workflows without
per-sender branching — `OPS-131`'s own `h.escalate` already uses it for exactly this shape of
"this mechanism cannot itself resolve this" case, and roughly 30 other referrers already work
through it.

Instance identity:
`a.reconcile`'s `idempotencyKey: "work_id + a.reconcile"` — a redelivered technical-completion
report or a repeated timeout on the same `work_id` resolves to the same reconciliation record
rather than opening a second one. `h.escalate`'s `contract.requiredFields: ["work_id"]` and its
`carries` explicitly preserve `work_id`, `logical_operation_key` and `correlation_id` (carried
from `OPS-121` through the pipeline), so the case traces back to the originating technical
operation.

Result loop:
No special return handoff from `DEC-181` back into `OPS-130` was added. `DEC-181`'s own resolution
path (`a.decide` → `c.outcome` → `h.approved`/`h.partial`/`h.rejected` → ... → `DEC-185`'s own
`h.execute` → `external:operational-resolution`) is the **same, already-working path** every other
one of `DEC-181`'s ~30 referrers already resolves through — inventing a special-case callback for
this one caller would have been inconsistent with how the other ~30 work, and DEC-185's own text is
explicit that "execution is not complete until that [domain] lifecycle says it is." A remediation
applied through that path produces its own new technical job, which is verified through this same
`OPS-130` mechanism on its own fresh `work_id` — the loop closes through the business record and a
fresh verification pass, not through a direct software callback.

Idempotency:
Preserved above (`a.reconcile`'s `idempotencyKey`). `OPS-130` itself is already idempotent by
design ("Verification is idempotent, so checking twice costs nothing") — this was not weakened.

Tests:
See `INTEGRATION-TEST-MATRIX.md` §"OPS-130 reconciliation" and §"duplicate reconciliation handoff".

Validator:
`runtime_arbiter_result_unconsumed` (new, ERROR severity) — confirmed 0 findings post-fix; its
design was verified against the exact pre-fix text (`x.reconciliation`'s `reEntry`: "this exit
exists so that gap is visible rather than reported as done") to confirm it would have caught this
shape before the fix existed.

## Adjacent P1 Repairs

### `RET-24` → `RET-30`

Classification: **P1 CONTRACT GAP — FIXED.**

`RET-24`'s `h.intervention` handoff carried only evidence and risk-state text, no episode
identifier, while `RET-30`'s own `instanceKey` includes `retention_episode_id` and has no self-mint
fallback. `RET-24`'s own episode concept (`risk_episode_id`, a churn-risk evaluation) is genuinely
different from a retention episode — not a rename, a real dual-concept split. Fixed by minting
`retention_episode_id` at the `h.intervention` handoff itself, deterministically derived from
`account_id + risk_episode_id` (the same deterministic-derivation pattern already established by
`IDN-90 → ACC-79`), and declaring `contract.requiredFields: ["account_id", "retention_episode_id"]`.
Zero new nodes — text and contract only.

### `SUB-163` → `SUB-164`

Classification: **P1 CONTRACT GAP — FIXED** (two related issues, both in the `SUB-163`/`SUB-164`
pair, repaired together):

1. `SUB-163`'s own `relationship-continuity` competition awareness was incomplete: `w.decision`'s
   `recheck` promised to re-read "a cancellation in motion," but `c.decision` had no branch to act
   on that finding, and the sibling `w.review`'s `recheck` omitted the check entirely. Fixed:
   `c.decision` gains a "Cancellation in motion" branch → new `x.superseded` exit (reused nowhere
   else, a genuinely distinct terminal state); `w.review`'s `recheck` text now matches `w.decision`'s.
2. Version binding: `SUB-164`'s `a.new-term` created the new term from terms carried at `SUB-163`'s
   decision time, with no revalidation against the relationship's *current* governing terms and no
   explicit statement that binding (not revalidating) was the intended choice — unlike sibling
   patterns (`RLT-243`/`244`, `DOC-215`/`216`/`220`) which state their choice explicitly. Fixed:
   `c.resolved`'s "All satisfied" branch now routes through a new `c.terms-current` condition
   ("Unchanged" → `a.new-term`, existing, reused; "Materially changed" → new `a.reconcile-terms`,
   which re-derives dates/pricing/scope from current governing terms before proceeding to
   `a.new-term`). The decision to renew itself is never re-litigated — only what it renews on is
   re-checked. This stayed entirely self-contained within `SUB-164` (no new cross-journey edge, no
   new cycle), deliberately avoiding a return handoff to `SUB-163` that would have introduced a
   receiver-entry-compatibility risk of its own (`SUB-163`'s own trigger evidence is narrowly scoped
   to "a renewal decision window has opened," which a mid-execution terms change does not match).

### `TRM-101` → `TRM-102`

Classification: **CANONICAL DEFECT — FIXED** (a genuine graph topology change, not a documentation
gap).

`TRM-102`'s own `x.resolved` exit stated "RESOLVED; the merge may complete" but had no outbound
handoff — `TRM-101`'s merge operation, sent to `TRM-102` for conflict resolution, had no way to
actually resume and finish. This is a confirmed dead end per Part 22 of the governing brief: an
explicit continuation is stated in the source text and no path back exists.

Fixed: `TRM-102`'s `c.outcome`'s "Resolved" branch now routes to a new `h.resume` handoff (to
`TRM-101`, carrying `merge_operation_id`, the resolution and its basis) in place of the old
`x.resolved` exit (removed — it is superseded by the handoff, which is where this instance's own
path now ends, per the corpus's established handoff-ends-the-path convention). `TRM-101`'s own
`t.authorized` trigger evidence was broadened (matching the DEC-181 precedent: one reusable
structural distinction, not per-caller branching) to accept a second origin shape — "an existing
`merge_operation_id` whose `TRM-102` conflict has just been resolved" — and a new `c.origin`
condition immediately after entry branches "Fresh authorization" → `a.operation` (existing,
unchanged) vs. "Resuming after conflict resolution" → `a.consolidate` (existing, reused — skips
re-authorization and resumes exactly where the merge operation had paused).

**No unmerge feature was invented.** `x.merged`'s own reEntry text ("a further duplicate candidate
involving this entity is assessed on its own evidence") already correctly implies a wrong merge is
corrected via a fresh assessment elsewhere, not a structural unmerge capability — the source
provides no unmerge semantics to build from, and none was added. This remains a documented,
legitimate gap (see Remaining P1/P2 below), independently reconfirmed by this round's own
end-to-end tracing as matching the prior round's own finding.

This creates one new 2-node SCC (`TRM-101` ↔ `TRM-102`) in the relationship graph — see
`INTEGRATION-CANONICAL-CHANGES.md` for its safety classification (bounded: each pass requires an
actual conflict-resolution event with real evidence, matching every other evidence-gated cycle
already found safe in the corpus).

### Identity / authority provenance

Reviewed the remaining identity/provenance P1s the audit catalogued (`DEC-187 → DEC-189` deadline
loss, `DOC-212 → DOC-213` missing issue-authority, `SCH-176/177/178/179/280 → SCH-180` no
cross-sender duplicate/correlation check for `provider_failure_id`, `TRM-104 → REL-100` zero
provenance, `RSK-200 → ACC-79` provenance not threaded through). **None repaired this round** —
each is a pre-existing, already-catalogued finding from a prior closed round, none is adjacent to
this round's 3 P0 repairs (different domains, different root causes), and repairing them would not
be "mechanically provable... adjacent to the P0 repair" per the governing brief's own bar for which
P1s to take on. Left as documented P1s, unchanged.

## Remaining P1/P2

Deliberately not driven to zero, per the governing brief's own instruction. Full register in
`CROSS-LIBRARY-INTEGRATION-AUDIT.md`'s Top 25 findings and the 10 companion documents. Notably
still open: `ACT-17`'s unregistered prose-only conflict (P1); `DEC-189`/`DEC-190` → `DEC-183`'s
missing accept/claim step (P1); the rollout domain's missing result-return to `RLT-279` (P1);
`REM-157`'s 3-sender idempotencyKey construction gap (P1); business closure vs. entitlement/access
termination structural gap (P1); `TRM-101`'s absent unmerge capability (documented, not invented);
the 4 identity/provenance P1s listed above; and the full set of P2s (corpus-wide documentation
gaps, positive-reference findings, and lower-confidence candidates) — none forced to zero.
