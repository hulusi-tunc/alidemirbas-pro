# Cross-library integration — new validator coverage (repair round, 2026-09-04)

Two new validators were added to `scripts/validate-canonical.mjs` this round, per the governing
brief's own list of candidates. A third candidate (`competing_member_no_live_state_check`) was
evaluated and folded into the first rather than built separately — see below.

Run: `node scripts/validate-canonical.mjs` (wired into `npm run validate:canonical`).

---

## `competition_member_unenforced` (WARNING)

**Rule:** for every declared competition-group member (from the same `groups` structure the
existing `competition_incomplete`/`competition_group_of_one`/`competition_scope_split` checks
already build) that has at least one `wait` node (an async gap for ownership to go stale across)
and at least one consequential action reachable after it — an `action` node with `execution !==
"communication"` (i.e. `"human"` or undeclared, the shape *not* generically covered by this round's
own `CMS-205` fix) that writes durable state and is not itself pure bookkeeping (`a.record*`/`a.open*`
by id, which open/record an outcome rather than produce the consequential effect itself) — check
whether *any* node in the journey's own text (`does`, `asks`, or a branch's `when`) matches one of
a small set of live-recheck marker patterns (references to current/live/still-held ownership,
"already reached/resolved/won/claimed", a re-read explicitly scoped to current/live state, "now in
motion/open/active/claims", or a direct `OPS-131` reference). No match → warn.

**Severity: WARNING, not ERROR.** Recognising a real structural check from a node's own prose is
judgment, not mechanical certainty — the corpus's own genuinely-protected members phrase their
check differently from each other (`ACC-78`: "currently open"; `ACQ-04`: "already reached the
destination") and a future member may phrase a real check differently again without being
unprotected. The two confirmed-unsafe instances this round found were repaired directly in source,
not left for this validator to catch after the fact; this validator exists to catch regressions and
new competition members that skip the pattern going forward, and its 3 current hits are
already-reviewed correct non-findings (see below), not open work.

**Merged-in candidate — `competing_member_no_live_state_check`:** evaluated against the governing
brief's own instruction ("If both detect the same root issue: use one stronger validator"). Both
candidates check the same underlying fact (does a consequential competition-bound action re-verify
current state before firing); a `paused`-onLoss mutual-staleness case (the shape `ACC-78`/`IDN-90`
actually had) is simply the P0-severity instance of the same general pattern, not a structurally
different check. Building it separately would have meant re-deriving the same `groups`/enforcement-
marker logic twice for no analytical gain — folded into one validator instead.

**Current count: 3 warnings**, all reviewed and recorded in `production/vnext-warning-reviews.json`
as correct non-findings, not open gaps:
- `ACQ-07` — its flagged actions (`a.downgrade`, `a.suppress`) act only on its own queued
  follow-up; it has no consequential external effect a stale-loser race could produce.
- `ACQ-12` — its flagged action (`a.rearm`) only re-arms its own internal wait timer, bounded; the
  actual send (`a.touch1`/`a.touch2`) is `execution: "communication"` and already covered by the
  `CMS-205` fix.
- `IDN-90` — the group's own highest-precedence member; it never defers to `ACC-78` and
  structurally has nothing to check. The actual P0 (`ACC-78` not checking `IDN-90`'s live state)
  was fixed directly in `ACC-78`'s own graph.

**False-positive considerations:** the id-based bookkeeping exclusion (`a.record*`/`a.open*`) and
the `execution !== "communication"` scope were both tuned against the full 22-member corpus during
this round to bring the raw hit count down from an initial 8 (which included several instances of
opening/recording actions that are not themselves the consequential effect) to the 3 genuine
judgment calls above. Expect new false positives as new competition members are added with
differently-worded checks — resolve via the review-list, the same mechanism this whole validator
suite already uses for exactly this shape of disagreement.

**Example fixture:** before this round's fix, `ACC-78`'s `c.review`/`c.outcome` routed straight to
`h.restore`/`a.extend` with no intervening check — this validator would have fired on `ACC-78`. Its
new `a.check-authority`/`c.authority-clear` text ("is currently open", "is still open") matches the
first marker pattern, so it no longer does.

---

## `runtime_arbiter_result_unconsumed` (ERROR)

**Rule:** for every Runtime Mechanism (from `MECHANISM_IDS`) with **zero outbound handoffs
anywhere in the whole journey**, check every `exit` node's own `reEntry` text for an explicit
propagation-intent phrase (a "so that/so it [is] visible/acted on/resolved/reaches/notice" pattern
— the exact shape `OPS-130`'s own pre-fix `x.reconciliation` used: "this exit exists so that gap is
visible rather than reported as done"). A match → error.

**Severity: ERROR, not WARNING** — unlike the enforcement-marker check above, this is not a
judgment call about whether a check is phrased correctly; a Runtime Mechanism's own text
*explicitly stating* that an outcome must reach something else, in a journey with *structurally no
way* for it to reach anything else, is exactly the "business result lost across layers" shape the
governing brief rates P0. This is a narrower, intent-scoped sibling of the Operational Workflow
round's own `workflow_result_unconsumed` (WARNING) — that one flags a fully isolated *workflow*
(zero in AND zero out); this one flags a specific declared-important *outcome* even when the
mechanism as a whole has other traffic (`OPS-130` had in-degree 2 from `OPS-121`/`OPS-124` and two
other, correctly-terminal exits — `workflow_result_unconsumed`'s own zero-in-AND-zero-out gate would
never have caught this shape).

**Current count: 0 errors.** Confirmed by construction: `OPS-130` was the only Runtime Mechanism
with both a zero-outbound-handoff graph and a propagation-intent exit before this round's fix; its
fix (a new `a.reconcile` → `h.escalate` path replacing the old `x.reconciliation` exit) gives the
journey a real outbound handoff, so it no longer matches the rule's first condition. The rule's
design was verified against the exact pre-fix `x.reconciliation.reEntry` text to confirm it would
have caught that shape before the fix existed, rather than trusting a post-fix zero count alone.

**False-positive considerations:** deliberately conservative — a Runtime Mechanism with *any*
outbound handoff at all is exempted entirely, even if that handoff has nothing to do with the
flagged exit's own concern (refining that distinction further, e.g. checking whether the *specific*
exit's own execution path actually reaches a handoff rather than just "the journey has one
somewhere," is a possible future tightening, not required to make today's check safe). A Runtime
Mechanism whose exit text merely *describes* a state without an explicit propagation-intent phrase
(most exits, including `OPS-130`'s own `x.complete`/`x.business-complete`) is correctly never
flagged — those are legitimate synchronous return values by design, per the governing brief's own
explicit instruction not to require every runtime output to have a canonical handoff.

**Example fixture:** `OPS-130`'s pre-fix `x.reconciliation` node (`reEntry`: "...this exit exists so
that gap is visible rather than reported as done") in a journey with zero `kind: "handoff"` nodes —
this is the exact case the validator was designed against.

---

## Why only these two

Per the governing brief's own instruction not to add validators for validator-count vanity, the
remaining candidate list items were not built as separate validators: `handoff_entry_incompatible`
and `receiver_instance_unconstructible` are already substantially covered by the existing
`handoff_identifier_unprovenanced` rule (extended in scope, not duplicated, by this round's own
identity/provenance findings); `exclusive_ownership_unenforced` and
`competition_loser_no_execution_guard` are the same root issue as `competition_member_unenforced`
above, already merged in; `result_contract_unconsumed` is the same root issue as
`runtime_arbiter_result_unconsumed` above; `authority_provenance_lost` and
`cross_layer_retry_double_owner` would each require either a structured field the schema does not
yet declare (authority/decision provenance is currently narrative text, not a checkable field) or
was investigated this round and found to have zero corpus-wide instances (the double-retry-budget
search in `IDEMPOTENCY-AND-RETRY-INTEGRATION.md` found none beyond the already-fixed
`CMS-208`/`OPS-124` pair) — building a validator for a pattern with zero known instances and no
structural field to check against would be exactly the vanity-validator the brief warns against.
