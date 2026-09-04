# Cross-Library Integration Audit — Time and Version Continuity

Scope: all 284 canonical items in `src/canonical/*.ts` (via `production/canonical-dump.json`)
and all 548 edges in `relationship-graph.json`. Governing brief Parts 28, 31. AUDIT ONLY —
nothing under `src/`, `production/`, `scripts/`, `seo/`, `search/` was changed. No duration,
SLA value or invented policy appears anywhere below — every finding is about which clock or
which version a chain binds to, never about how long or how much.

Method: every `WaitNode.onTimeout` target that crosses a journey boundary was traced to see
whether the timeout's own text describes it as a fresh clock, a preserved clock, or is silent;
every handoff whose target re-reads/revalidates state was compared against `CTL-232`/`CTL-233`'s
already-established reference pattern (`FIXES-APPLIED.md` item 7); a corpus-wide grep for
`revalidat`/`stale`/`version`/`supersede` (108 raw hits on `revalidat` alone) was used to select
additional candidates for full reads, on top of the SLA/escalation and queued-execution chains
the brief names directly.

## Part 28 — clock ownership across layers

Two clock-ownership models are both used correctly, in different circumstances, but the choice
between them is never declared as a corpus-wide rule the way `OPS-R17` declares the
staleness-check rule for Part 31.

**Model A — the receiving layer preserves the original clock explicitly.** `DEC-189` (Decision
Escalation, Operational Workflow) hands an escalated decision to a higher authority via `a.route`
into `w.decision`, whose own timeout is *"the case's original deadline, preserved rather than
restarted"* — the wait node's `reason` field states directly: *"the requester's deadline was
never about who happens to be holding the case. An escalation that resets it makes the delay
invisible to everyone except the person waiting."* `OWN-54` (Ownership Transfer) states the same
principle generically for every deadline an ownership change touches: *"Every deadline carries
across unchanged — a commitment made to someone outside the organisation does not move because
we moved who holds it internally."* `FBK-47` (Appeal Review) applies it to its own internal
sub-wait: `w.more-info`'s timeout explicitly does not extend the governing `w.review` deadline —
*"requesting more information does not extend the deadline it sits inside."*

**Model B — the receiving layer deliberately starts a new clock, because the old one has
already elapsed by definition.** `TIM-61` (Deadline Tracking, Customer Journey/Silent Lifecycle)
only reaches its `h.escalate` handoff to `OWN-55` (Ownership Escalation, Operational Workflow)
*after* `c.consequence` has already recorded that "the deadline passed with the obligation
open." `OWN-55`'s own `w.resolution` then times out against *"the escalation SLA at this
level"* — a wait interval that is not derived from, or a continuation of, `TIM-61`'s original
`deadline_tracking.tracking` clock. This is correct: the original deadline is spent, and the
escalation's own SLA governs a genuinely different question (how long is it acceptable for the
escalation itself to sit unanswered), not a restart of the missed deadline. `IDN-84`'s
`h.escalate` to `OWN-55` (a technical-failure escalation, not a deadline escalation) works the
same way — the retry/backoff budget that expired belongs to `IDN-84`; the escalation SLA that
starts on arrival belongs to `OWN-55`.

Both models are internally consistent and, in every instance traced, correctly matched to the
scenario (Model A where the original deadline is still live and must survive a handoff mid-flight;
Model B where the original clock has already run out and the handoff is itself the "what happens
next" branch). **No defect was found in any individual instance.**

**P2 — the choice between "preserve the original clock" and "the handoff starts a new clock"
is nowhere declared as an explicit corpus-wide rule**, unlike the staleness-check rule `OPS-R17`
states for version continuity (Part 31, below). Every journey gets it right in isolation because
each one's own prose reasons through its own case, but a reader auditing a *new* SLA-escalation
handoff has no global rule to check it against — only inference from precedent. This is the
same shape of gap `CONCURRENCY-AND-ORDERING-AUDIT.md` already names for version continuity
("every one of the 12 revalidating mechanisms is, in effect, choosing 're-evaluate-at-execution'
by construction, without saying so as a declared policy"); this audit found the identical
pattern applies to clock ownership at escalation boundaries and is not currently named anywhere
as its own rule. Recommend a future round add a `GLB` rule stating the two conditions (deadline
still live vs. deadline already elapsed) under which each model applies, mirroring how `GLB-06`/
`GLB-07`/`GLB-10` already state the analogous re-evaluation rules for competition arbitration.

No instance was found of a retry silently extending a deadline, or of a reopen creating an
ambiguous second timer alongside a live first one — `REM-160` (Remedy Recurrence Assessment)
explicitly reopens the *original* `issue_id` rather than minting a new one (`a.reopen`:
"Reopen the original issue, preserving every previous remedy attempt and its outcome"), and its
`h.remedy` handoff into `REM-157` opens a fresh remedy-selection instance for the reopened
issue — a new decision, correctly, rather than a resumed stale one.

## Part 31 — version continuity in queued-then-executed chains

**Reference pattern (already established): `CTL-232`/`CTL-233`.** Not re-audited in depth here
(covered fully in `research/operational-workflow-production-readiness/FIXES-APPLIED.md` and
`CANONICAL-CHANGES.md`); cited only as the baseline this Part's other chains are compared
against.

**New corroborating instance #1 — `RLT-243 → RLT-244` (Scheduled Change Revalidation → Change
Execution Verification, rollout domain).** This is the same revalidate-before-execute shape as
`CTL-232`/`CTL-233`, found independently in an unrelated domain, which is useful corroboration
that the pattern is a genuine corpus convention rather than a one-off fix. `RLT-243`'s
`entity.note`: *"The schedule stores assumptions. They are kept so the execution can see what
has moved, never so it can proceed on them."* Its `w.window` timeout leads to `a.revalidate`,
which explicitly re-checks "the target's eligibility, its version and state, its dependencies,
whether the change is still current, any required approval, and whether an incident or change
hold is in force" — and `c.preempt` separately, explicitly handles the case where a *newer
version* superseded the change before the window was even reached (`a.superseded`: "Applying the
old one after the new one is available installs a regression on purpose"). `RLT-244` then
carries the choice forward structurally: *"The operation carries a stable identity, so a retry
re-applies the same change rather than a second one."* The explicit choice (re-evaluate at
execution, cancel-and-regenerate if superseded first) is stated in the source at every step.

**New corroborating instance #2 — `DOC-215 → DOC-216 → DOC-220` (Signature Reminder →
Effectiveness Validation → Conflict Review, document domain).** The richest version-continuity
example found in this audit. `DOC-215`'s `entity.note` states the binding explicitly:
*"The process is bound to a version. Signatures do not carry to a successor — a changed document
is a new request."* Its `c.event` branch on the document version being superseded mid-signature
routes to `a.superseded`, which explicitly does not carry collected signatures forward: *"Signatures
already collected are not carried to the successor — the successor is a different document, and
signing it is a new request."* `DOC-216`'s `a.revalidate` re-reads "is this still the
authoritative version, has it been superseded or revoked" at the *effective moment*, separately
from signature time — an explicit two-clock version check (signed-against vs. effective-against).
`DOC-220` is a full conflict-resolution journey built entirely around version authority: its
`a.authoritative` action is explicitly a "deterministic resolver," never "a human judgment call,"
applying only lineage/issuance-authority/effective-semantics criteria, with `h.review` (to
`DEC-181`) as the sole escalation when those criteria cannot single out one version. Its
`c.signature` branch explicitly identifies signatures "bound to a version other than the
authoritative one" and routes them back to `DOC-215` for re-signature rather than silently
promoting or discarding them. Every choice this Part asks about — bind, revalidate, or
cancel-and-regenerate — is explicit, named, and routed to a distinct node in this cluster.

**P1 (reconfirmed, corpus-wide) — the choice of strategy is still never a declared field.**
Both new instances above are, like the 12 mechanisms `CONCURRENCY-AND-ORDERING-AUDIT.md` already
found, choosing "re-evaluate-at-execution" (or, for `DOC-215`, "cancel-and-regenerate," since a
superseded version starts an entirely new signature request rather than resuming the old one) —
correctly, in every traced case — but by construction in each journey's own prose, not as a
structural field naming the strategy. This audit's contribution is two additional, independently-
sourced confirmations (`RLT-243`/`244` and the `DOC-215`/`216`/`220` cluster) that the *pattern*
is corpus-wide and consistently correct, which strengthens rather than weakens the case for
making the choice an explicit field in a future round — the behavior is already uniform, so
naming it costs nothing and removes the need to re-derive it from prose every audit round.

**P1 (new) — `SUB-163 → SUB-164`: renewal execution binds to the terms decided earlier, with no
revalidation and no explicit statement that binding (not revalidating) is the intended choice.**
`SUB-163`'s `a.decided` records "the new term's dates and the terms that would apply" and hands
them to `SUB-164` via `h.execute`, carrying *"the decision, the new term's dates and its
terms... the explicit fact that the new term does not yet exist and its requirements have not
been tested."* `SUB-164`'s own `entity.note` is explicit about identity continuity for retries
(*"a redelivered `renewal_authorized_for_execution` event for the same `renewal_cycle_id` must
resolve to the same financial obligation and the same new term, never a second one"* — a Part 34
concern, correctly handled) but is silent on version continuity: `a.dependencies` determines
requirements "from the relationship's own terms" without saying whether that means the terms as
carried from `SUB-163`'s decision or the terms as currently governing at execution time, and
`a.new-term` creates the term using the dates/terms carried in the handoff, never re-read. Unlike
`RLT-243` (which has an explicit `c.preempt`/`a.superseded` branch for exactly this scenario) or
`DOC-215` (which has an explicit `document_version_superseded` branch), `SUB-164` has no
equivalent branch for "the governing terms changed between decision and execution" — no
`c.preempt`-shaped condition exists anywhere in its graph. Given `w.dependencies`' own timeout
reasoning acknowledges execution can be delayed ("a renewal that has not completed by its own
start date has left the relationship between terms"), a policy or pricing change landing inside
that window is a plausible real event this journey has no branch to detect. Not confirmed as an
active production bug (no evidence a genuine version conflict has occurred), and the window is
bounded rather than open-ended, but per the brief's own standard — "the choice must be explicit
somewhere in the source where correctness actually depends on it" — this chain leaves the choice
implicit where the corpus's own sibling patterns (`RLT-243`, `DOC-215`) show it knows how to make
it explicit. Graded P1 rather than P0: the risk window is bounded by `w.dependencies`' own
timeout rather than open-ended, and no confirmed instance of actual staleness was found.

No other material queued-then-executed chain checked (`DAT-224→DAT-225`, `RSK-273→SUB-166`,
`OWN-54`'s `a.revalidate-pending`, `FIN-135`'s `a.apply-once` reconciling "against the
obligation's current balance... the balance moved while this was in flight") showed an implicit
or undefined version-binding choice; each states its choice in the source (`OWN-54`: *"Hold it
and revalidate before execution"*; `FIN-135`: *"applied against what the obligation is now rather
than what it was when the attempt started"*).

## Findings summary

| # | Finding | Layer boundary | Severity |
|---|---|---|---|
| 1 | Clock-ownership choice at SLA-escalation handoffs (preserve original deadline vs. start a new escalation-specific clock) is correct in every traced instance but never stated as a corpus-wide rule, unlike the staleness-check rule `OPS-R17` states for version continuity | Customer/Operational → Operational (`TIM-61`/`DEC-189`/`IDN-84` → `OWN-55`) | P2 |
| 2 | `SUB-163 → SUB-164`: renewal execution binds to terms decided earlier with no revalidation branch and no explicit statement that binding is the intended choice, unlike sibling patterns (`RLT-243`, `DOC-215`) that have one | Operational Workflow ↔ Operational Workflow | P1 |
| 3 | The re-evaluate-at-execution / cancel-and-regenerate choice is still, corpus-wide, chosen by construction rather than declared as a field — reconfirmed with 2 new independent instances (`RLT-243`/`244`, `DOC-215`/`216`/`220`) beyond the original `CONCURRENCY-AND-ORDERING-AUDIT.md` finding | corpus-wide, cross-layer | P1 |
| — | `CTL-232`/`CTL-233`, `RLT-243`/`244`, `DOC-215`/`216`/`220`, `OWN-54` all confirmed as reference-quality explicit-choice examples; no version-binding defect found in any of them | cross-layer | — |
| — | No instance found of a reopen creating an ambiguous second timer, or a retry silently extending a deadline | cross-layer | — |

**Totals: P0 = 0, P1 = 2, P2 = 1.**
