# Cross-library integration — ownership continuity and competition arbitration

Ownership handoff, human-vs-automated ownership, `OPS-131` enforcement coverage, stale-loser
execution, and suppression semantics, across all 284 canonical items and the 548 machine-extracted
edges in `relationship-graph.json` (522 handoff, 22 competition, 4 preemption). Companion to
`research/runtime-mechanism-production-readiness/COMPETITION-ARBITRATION-ARCHITECTURE.md`,
`COMPETITION-ARBITRATION-TEST-MATRIX.md`, `CONCURRENCY-AND-ORDERING-AUDIT.md`, and
`research/operational-workflow-production-readiness/OWNERSHIP-AND-ASSIGNMENT-AUDIT.md`, which this
round grounds against the full 284-item graph rather than re-deriving from scratch.

## POST-REPAIR UPDATE (2026-09-04)

Repair round following this audit. Grounded in `FIXES-APPLIED.md`, `INTEGRATION-CANONICAL-CHANGES.md`,
the regenerated `relationship-graph.json` (550 edges — 524 handoff, 22 competition, 4 preemption;
+2 handoffs, `TRM-102→TRM-101` and `OPS-130→DEC-181`, neither touching this document's own
competition-group findings), and a direct re-read of current `src/canonical/access.ts`,
`retention.ts`, `communication.ts` and `processing.ts` source. Everything below this section and
above `## Method` is the original audit, unmodified.

### Both P0s fixed

**`account-restriction-authority` (`ACC-78`/`IDN-90`), finding #1.** `ACC-78`'s `c.outcome`
("Reason resolved") and `c.review` ("Lift it") branches, which previously routed straight to
`h.restore`, now both route to a new **`a.check-authority`** node — *"Re-read current
account-restriction-authority standing before releasing this suspension: is a higher-precedence
contender on the same exclusionGroup and account (a suspected-compromise investigation, IDN-90)
still open?"* — feeding a new **`c.authority-clear`** condition: "Clear" (no `IDN-90` instance, or
any higher-precedence exclusionGroup member, currently open for the account) → `h.restore`
(existing, reused); "Still contested" → `a.extend` (existing, reused — deferring is functionally
the same outcome as extending). Both are local to `ACC-78`'s own graph (2 new nodes); `IDN-90`
itself is unmodified — it is the group's own highest-precedence member and structurally never
defers, so it has nothing to check. Enforcement owner is `ACC-78` itself, not `OPS-131` (which
remains the single source of precedence *policy*, not caller-side enforcement).

**`retention-outreach` (`ACT-18`/`FBK-46`/`RET-24`/`RET-28`/`RET-30`/`RET-32`), finding #2 — "the
round's most consequential finding."** Two distinct root causes required two distinct fixes:

- **Generic fix, zero new nodes, protects 4 of the group's 6 members plus reinforces the 5th:**
  `CMS-205` ("Send Eligibility Check" — the corpus's own execution-time revalidation stage every
  outbound message passes through immediately before delivery) had its `a.reread` does-text and
  `c.valid` branches extended so that, where a message's originating journey declares a competition
  `exclusionGroup`/`scope`, the re-read now includes `OPS-131`'s current established owner for that
  scope; losing current ownership since the message was queued routes to the existing
  `a.suppress`/`x.suppressed` path (`GLB-07`: *"a losing contender's queued message does not get to
  run merely because it was queued before it lost"*). This makes the send path's own long-declared
  step 3 ("journey competition and precedence," per `production/canonical-dump.json`'s
  `sendPathOrder`) real for the first time, generically, for **every** competition-bound message in
  the corpus — not just this group. It structurally protects `ACT-18` (`a.recover`), `FBK-46`
  (`a.request-confirmation`), `RET-28` (`a.ask`/`a.offer`), `RET-30` (`a.followup`) — all confirmed
  `execution: "communication"` by direct read — and reinforces `RET-32`'s own pre-existing explicit
  `c.sendable` gate ("no higher-precedence contest on the account"), which was previously true in
  text only; the send path's own step 3 was undeclared-but-relied-upon until this fix, so `RET-32`'s
  claim is now actually backed.
- **Local fix, 1 new node, `RET-24` only** (its consequential action, `a.owner-task`, is
  `execution: "human"` — not covered by the CMS-205 fix, since that fix is scoped to
  `execution: "communication"`): `c.human`'s "Justified" branch now routes to a new
  **`c.priority-clear`** condition — *"Does a higher-precedence retention-outreach contender
  already claim this account?"* — "Clear" (no open `FBK-46` issue under human ownership claims the
  account) → `a.owner-task` (existing, reused); "Contended" → `x.monitor` (existing, reused, its
  text broadened to cover this reason). `c.intent`'s pre-existing cancellation-intent check already
  covered the group's other higher-precedence member (`RET-28`), so only the `FBK-46` leg needed a
  new check.

Read against Part 8's finding: a human being assigned ownership of an at-risk relationship
(`RET-24` winning the group) now structurally suppresses `ACT-18`/`FBK-46`/`RET-28`/`RET-30`'s own
sends via the CMS-205 fix, and `RET-24` itself will not raise a competing owner-task while `FBK-46`
already owns an open issue on the same account. Neither direction was enforced before this round;
both are now.

### Global competition adoption reclassification

Reclassifying all 22 members using PROTECTED / PARTIALLY_PROTECTED / UNPROTECTED / NOT_APPLICABLE,
against the original Part 10 table as baseline. "Consequential action" execution types were
re-confirmed by direct source read this round, not assumed from the prior round's prose.

| Group | Member | Consequential action(s) | Execution | Prior classification | **Updated classification** | Why |
|---|---|---|---|---|---|---|
| account-restriction-authority | `ACC-78` | `h.restore`/`a.extend` | (state action, not a message) | Unprotected (P0) | **PROTECTED** | Own local fix: `a.check-authority`→`c.authority-clear`, above. |
| account-restriction-authority | `IDN-90` | `a.scope`, `a.contain`, `a.confirmed`, `a.cleared` | (state actions) | (not separately rated) | **NOT_APPLICABLE** | Group's own highest-precedence member; never defers to `ACC-78`, so nothing to check. Confirmed by `production/vnext-warning-reviews.json`'s own review note for this id (below). |
| purchase-intent | `ACQ-04` | `a.assign` | `human` | Protected (structural) | **PROTECTED** | Unchanged reason: `c.converted` runs before `a.assign` and reroutes to `ACQ-08` when the destination is already reached — `execution: "human"`, so the CMS-205 fix does not apply here and none was needed. |
| purchase-intent | `ACQ-07` | `a.downgrade`, `a.suppress` | (state actions; no `execution: "communication"` action of its own) | Protected/N-A | **NOT_APPLICABLE** | Both act only on this journey's own queued follow-up (reclassify/suppress-own), not a consequential external effect a stale-loser race could produce. |
| purchase-intent | `ACQ-08` | (suppresses others' queued sends) | — | Protected/N-A | **NOT_APPLICABLE** | No consequential send of its own to protect. |
| commerce-recovery | `ACQ-11` | `a.touch1`/`a.touch2` | `communication` | Protected (touch 1) / ambiguous (touch 2+) | **PROTECTED** | CMS-205's generic send-path fix enforces at every send regardless of which touch — resolves the prior touch-2 ambiguity (finding #6) as a side effect. |
| commerce-recovery | `ACQ-12` | `a.touch1`/`a.touch2` | `communication` | Protected (touch 1) / ambiguous (touch 2+) | **PROTECTED** | Same as `ACQ-11`. `a.rearm` (its own remaining `competition_member_unenforced` flag) is non-consequential — see validator note below. |
| commerce-recovery | `ACQ-13` | `a.touch1`/`a.touch2` | `communication` | Protected (touch 1) / ambiguous (touch 2+) | **PROTECTED** | Same as `ACQ-11`. |
| commerce-recovery | `RET-31` | `a.touch1`/`a.touch2` | `communication` | Protected (touch 1) / ambiguous (touch 2+) | **PROTECTED** | Same as `ACQ-11`. |
| commerce-recovery | `SCH-282` | `a.touch1`/`a.touch2` | `communication` | Protected (touch 1) / ambiguous (touch 2+) | **PROTECTED** | Same as `ACQ-11`. |
| lifecycle-stage | `ACT-12` | (nurture step) | `communication` | (group described "unprotected" via `ACT-20`) | **NOT_APPLICABLE** | Always outranks `ACT-20` within this group (never needs to defer) — separately, already protected against its own real preemption risk via its own `preemptedBy`/`ACT-14` gate (Part 8), a different mechanism than competition-group enforcement. |
| lifecycle-stage | `ACT-20` | `a.attempt` | `communication` | Unprotected (P1) | **PROTECTED** | `a.attempt` is `execution: "communication"` (confirmed by direct read) — now covered by the generic CMS-205 fix even though nothing in `ACT-20`'s own graph changed. |
| retention-outreach | `ACT-18` | `a.recover` | `communication` | Unprotected (P0, part of finding #2) | **PROTECTED** | CMS-205 generic fix, above. |
| retention-outreach | `FBK-46` | `a.request-confirmation` | `communication` | Unprotected (P0, part of finding #2) | **PROTECTED** | CMS-205 generic fix, above. |
| retention-outreach | `RET-24` | `a.owner-task` | `human` | Unprotected (P0, part of finding #2) | **PROTECTED** | Own local fix: `c.priority-clear`, above (not covered by CMS-205 — `execution: "human"`). |
| retention-outreach | `RET-28` | `a.ask`/`a.offer` | `communication` | Unprotected (P0, part of finding #2) | **PROTECTED** | CMS-205 generic fix, above. |
| retention-outreach | `RET-30` | `a.followup` | `communication` | Unprotected (P0, part of finding #2) | **PROTECTED** | CMS-205 generic fix, above. |
| retention-outreach | `RET-32` | `a.touch1`/`a.touch2` | `communication` | Protected (touch 1) | **PROTECTED** | Unchanged classification, but its own pre-existing `c.sendable` claim ("no higher-precedence contest on the account") is now actually backed by real enforcement, since CMS-205 makes the send path's own step 3 real for the first time. |
| outbound-ask | `FBK-41` | `a.request` | `communication` | Unprotected (P1) | **PROTECTED** | `a.request` is `execution: "communication"` (confirmed by direct read) — now covered by the generic CMS-205 fix; nothing in `FBK-41`'s own graph changed. |
| outbound-ask | `FBK-42` | `a.ask-light`/`a.ask-heavy` | `communication` | Unprotected (P1) | **PROTECTED** | Same as `FBK-41`. |
| relationship-continuity | `SUB-163` | `a.decided`→`h.execute`, `a.non-renew`→`h.scheduled-end` | (no `execution` field — internal handoffs, not covered by CMS-205) | Partially protected/inconsistent (P1) | **PROTECTED** | Own local fix, this round (finding #7): `c.decision` gains a "Cancellation in motion" branch → new `x.superseded` exit (class `suppression`); sibling `w.review`'s `recheck` text now matches `w.decision`'s (both read "...still open, or a cancellation now in motion on the relationship"). Confirmed by direct read of current `subscription.ts` source. |
| relationship-continuity | `SUB-167` | (cancellation effective-date resolution; `channels: []`) | — | (not separately rated) | **NOT_APPLICABLE** | Its own declared precedence — *"a cancellation in motion outranks a renewal decision on the same relationship"* — means it always outranks `SUB-163`, the group's only other member; it never defers, so it has nothing to check. |

**Count across all 22 members: 17 PROTECTED, 5 NOT_APPLICABLE, 0 PARTIALLY_PROTECTED, 0 UNPROTECTED.**
Every member of every one of the 7 groups is now either structurally protected against stale-loser
execution or structurally exempt from the question (it never defers within its own group).

### Validator confirmation

`node scripts/validate-canonical.mjs` (unmodified this round): **0 errors**, 2474 warnings, of which
exactly **3** are the new `competition_member_unenforced` code (added this round specifically to
catch this class of gap going forward — see its own header comment in `scripts/validate-canonical.mjs`
line 504). Run with `SHOW_WARNINGS=1` to see them individually:

```
[competition_member_unenforced] ACQ-07: declares competition group "purchase-intent" and has a
consequential action reachable after a wait (a.downgrade, a.suppress), but no node re-checks
current competition/ownership state before it fires
[competition_member_unenforced] ACQ-12: declares competition group "commerce-recovery" and has a
consequential action reachable after a wait (a.rearm), but no node re-checks current
competition/ownership state before it fires
[competition_member_unenforced] IDN-90: declares competition group "account-restriction-authority"
and has a consequential action reachable after a wait (a.scope, a.contain, a.confirmed, a.cleared),
but no node re-checks current competition/ownership state before it fires
```

All three are reviewed as correct non-findings in `production/vnext-warning-reviews.json`: `ACQ-07`
and `ACQ-12`'s flagged actions are non-consequential bookkeeping (own-queued-follow-up
reclassification/suppression for `ACQ-07`; wait-timer re-arming for `ACQ-12` — its actual send,
`a.touch1`/`a.touch2`, is `execution: "communication"` and is deliberately excluded from this
validator's scope, since it is already covered by CMS-205's own generic re-check), and `IDN-90`
never defers to `ACC-78` so has nothing to check — matching this table's own reasoning above. The
validator's own design (`ENFORCEMENT_MARKERS` regexes, `NON_CONSEQUENTIAL_ACTION_ID` exclusion,
`execution: "communication"` actions deliberately excluded from its scope "to avoid re-litigating
CMS-205's own architectural fix one journey at a time") is a WARN, not an ERROR, specifically so a
future member phrasing its own check differently is not falsely flagged — consistent with this
document's own Part 9 caution about judgment-based text matching.

### Findings summary table — updated rows

| # | Finding | Prior severity | **Status** |
|---|---|---|---|
| 1 | `ACC-78`/`IDN-90` review/outcome branches never re-check the other member's live state | **P0** | **FIXED** — `ACC-78`'s own `a.check-authority`→`c.authority-clear` (2 new nodes); `IDN-90` unmodified, confirmed never needing to defer. |
| 2 | 5 of 6 `retention-outreach` members unprotected; `RET-24`'s human ownership did not visibly suppress the other 4 | **P0** | **FIXED** — generic `CMS-205` send-path fix (`ACT-18`/`FBK-46`/`RET-28`/`RET-30`, 0 new nodes) + `RET-24`'s own local `c.priority-clear` (1 new node); `RET-32` reinforced. |
| 5 | `ACT-20` never checks for a concurrently open `ACT-12` before its reactivation touch | **P1** | **FIXED** — `a.attempt` is `execution: "communication"`; covered by the generic `CMS-205` fix even though `ACT-20`'s own graph is unchanged. |
| 6 | `commerce-recovery` second/final touch gates drop the explicit "no higher-precedence contest" language | **P2** | **FIXED** — `CMS-205`'s re-check runs at every send regardless of touch number, so the textual ambiguity in `c.sendable2`/`c.final-enabled` no longer matters at the enforcement level (though the wording itself was not edited — a residual documentation nicety, not a re-opened defect). |
| 7 | `SUB-163`'s `w.decision` recheck names "a cancellation in motion" but `c.decision` had no branch for it; `w.review` omitted the recheck | **P1** | **FIXED** — `c.decision` gains a "Cancellation in motion" branch → new `x.superseded` exit; `w.review`'s `recheck` text now matches `w.decision`'s. |
| 8 | `outbound-ask` (`FBK-41`/`FBK-42`) has a fully pairwise-resolved rule with zero caller-side enforcement | **P1** | **FIXED** — both journeys' send actions (`a.request`; `a.ask-light`/`a.ask-heavy`) are `execution: "communication"`; covered by the generic `CMS-205` fix even though neither journey's own graph changed. |

Rows 3 (`ACT-17`, undeclared 23rd conflict — outside the declared 22, not addressed this round), 4
(`DEC-189`/`DEC-190`→`DEC-183` accept/claim gap), 9 (`onLoss`'s 4 values still not reified in any
losing journey's own exit nodes — the CMS-205/`ACC-78`/`RET-24` fixes make the *check* real but do
not give the losing instance its own observable "I lost" state), 10 (handoff closure-semantics
schema gap), 11 and 12 (positive references) are **unchanged** — none was in this round's scope.

## Method and what "reviewed" means

`relationship-graph.json`'s 522 handoff edges were classified in aggregate (source/target surface,
`isExternal`, `isMergedTarget`, `suppresses`, `on`-text pattern match for notification-only
language) and then read in full source (`production/canonical-dump.json` node graphs, not just the
edge summary) wherever the aggregate pass flagged a real ownership question: the `DEC-181` intake
hub (77 inbound edges — every one read), the `DEC-182→183→189→190` and `CTL-231→232→233→234`
chains, the three confirmed human-routing journeys (`ACQ-04`, `ACT-11`, `RET-24`) and everything
they hand off to or receive from, all 22 competition-group members' full node graphs, `OPS-131`
and `OPS-130` in full, and a targeted grep for conflict language outside the declared 22. Every
claim below cites the specific node id and quotes or closely paraphrases the actual source text
read for it, per the brief's requirement — nothing here is inferred from the edge list alone.

## Part 7 — Ownership continuity

**Structural fact, checked first rather than assumed:** a regex sweep of all 522 handoffs' `on`
text for notification/read-only language (`notif`, `for visibility`, `read-only`, `no action`,
`informational`, `awareness only`, `for reference`) returned **zero matches**. In this corpus,
`kind: "handoff"` is structurally a control-passing transition — it has no `next` field the way
`action`/`condition` nodes do, so the node itself is the end of that execution path for the source
journey. There is no undeclared "notify but keep going" handoff to filter out; all 522 are
ownership-changing edges in the sense the brief asks about. 81 of the 522 target `external:*` —
genuinely outside the corpus's own scope (a receiving lifecycle this repository does not model),
so what happens to ownership after those specifically is not verifiable from source and is recorded
as an audit boundary, not a defect: the source journey's own path still ends cleanly at the handoff
node either way.

**What the schema does *not* declare:** `kind: "handoff"` has no `terminal` field the way `kind:
"exit"` does. An exit node states `terminal: true|false` and a `reEntry` string explicitly; a
handoff node states only `to`/`on`/`carries`/`contract`. This means the corpus's own graph format
has no explicit place to say "the source instance formally closes here" versus "the source instance
stays nominally open, redirected." In every journey read for this round, the *practical* answer was
consistent — a handoff node is the last node on its path, so nothing in that journey's own graph
can act again on that instance — but the *closure semantic* (does the record read CLOSED, or does
it sit unreferenced) is never stated. This is a corpus-wide documentation gap, not a per-journey
defect, and is recorded once here rather than as 522 findings, matching the precedent
`OWNERSHIP-AND-ASSIGNMENT-AUDIT.md` set for the `entity.instanceKey`/`concurrency` gap. **P2.**

**Reference pattern, re-confirmed at full-graph scale.** `DEC-181` (77 inbound handoffs — the
single largest ownership-continuity hub in the corpus, receiving from Runtime Mechanisms
`CON-40`/`OPS-126`/`OPS-127`/`OPS-131`, dozens of Operational Workflows, and several Customer
Journeys) deliberately claims nothing on intake: its own `h.assign` (feeding `DEC-182`) is on "a
valid decision case needing ownership" — intake and scoping, explicitly not a claim. `DEC-182`
performs the actual claim (`a.assign` → `w.accept`/`c.accept`, with an SLA branch to `c.reassign`
if the assignee never accepts). `DEC-183` is where review ownership becomes active, and its own
trigger (`t.begins`, event `authorized_review_begins`) states directly in `evidence.insufficientAlone`:
**"a case being assigned, which puts it in front of someone and starts nothing."** This is the
clearest positive reference pattern in the whole graph, re-confirmed unchanged at 77-edge scale.

**The escalation/reopen gap, re-tested cross-layer — contained, not worsened, but now sharper.**
`DEC-189`'s `h.decide` hands directly to `DEC-183` on "an escalated case an eligible authority will
review" — no `w.accept`/`c.accept` step of `DEC-182`'s own kind exists anywhere in `DEC-189`'s graph
between `w.decision`/`c.outcome` and that handoff. Read against `DEC-183`'s own trigger evidence
above, this is now a **sharper, source-grounded contradiction**, not only an absence: `DEC-183`
explicitly names "a case being assigned" as *insufficient* for `authorized_review_begins`, and
`DEC-189` supplies nothing beyond routing — no acceptance record, no claim. `DEC-190`'s `h.review`
into `DEC-183` (on "a reopened case ready to be decided again") has the identical gap.
Cross-layer widening was checked specifically per this round's brief: `DEC-189`'s 4 callers are
`DEC-182`, `DEC-183`, `DEC-187` (all Operational) and **`DEC-184`** (Customer /
customer-communicating, `h.escalate` on "an information deadline expiring with escalation or with
no defined closure semantics"). `DEC-190`'s 2 callers (`DEC-185`, `DEC-188`) are both Operational.
`CTL-231` has **zero** inbound handoffs anywhere in `src/canonical/` (confirmed by direct grep, not
only the extracted graph) — it is reachable only by its own external trigger event, so cross-layer
widening does not apply to it at all; it is the most contained of the three. **Verdict: the gap's
own shape is caller-agnostic — `DEC-189`/`DEC-190` behave identically regardless of which layer
escalates into them — so cross-layer callers do not create a *new* mechanism of ambiguity. But
`DEC-184` being one of `DEC-189`'s callers means a live customer-facing information deadline can
now sit in this exact ownership gap, raising the practical stakes of a pattern the corpus's own
`DEC-182`/`DEC-183` sibling chain, `CTL-232`/`CTL-233`/`CTL-234`, already shows how to close.** **P1**
(unchanged tier from the prior round; upgraded grounding, not upgraded severity, since no concrete
double-decision was found — see Part 10 methodology note on why "ambiguous" and "confirmed
unprotected consequential execution" are kept as different severities).

**The reference-quality contrast, re-confirmed.** `CTL-232`'s repaired "acceptance not required"
path now runs `a.revalidate`→`c.revalidated` before `h.execute`, mirroring `CTL-233`'s own
`a.revalidate`→`c.valid` gate (`t.accepted`'s handler: **"Re-read everything the request assumed —
whether it is still active, whether the current owner is still who the request assumed"**) before
either reaches `CTL-234`'s `t.authorized` trigger, which itself requires "a transfer revalidated and
authorized against the entity's current state." Both paths into `CTL-234` now revalidate; `CTL-234`
has only 2 callers, both already disciplined. This remains the round's cleanest ownership-transfer
reference implementation, now confirmed to hold at the level `CTL-234`'s own trigger evidence
demands, not merely at the level of prose describing it.

**Double ownership / unclaimed handoff spot-check.** No instance was found, across the DEC-181 hub,
the DEC-182–190 chain, or the 22 competition-group journeys, of two different canonical journeys
simultaneously believing they held decision authority over the identical work item with no
resolving mechanism. Where multiple callers converge on one target (`DEC-183` has 4: `DEC-182`,
`DEC-184`, `DEC-189`, `DEC-190`), each caller is a different *state transition* on the same case
(assigned, resumed after an info-wait, escalated-and-decided, reopened) rather than concurrent
duplicate claims — consistent with `DEC-181`'s own case-id-scoped intake design.

## Part 8 — Human ownership vs. automated/journey ownership

The three confirmed human-routing-only journeys were traced against every operational,
mechanism-level, and competition-group interaction reachable from them.

**`ACQ-04` (purchase-intent, human-routing) — policy-dependent, cleanly modeled.** `ACQ-04`'s
`c.converted` condition ("Has this account already reached the destination this action would
pursue?") runs *before* `a.assign` (the human-ownership action) and hands off to `ACQ-08` itself
when the destination is already reached — so for this group, the human-routing journey's own win
condition *is* the competition-group win condition; there is no separate "automation continues after
a human is assigned" question to ask, because `ACQ-04` assigning a human is itself what suppresses
`ACQ-07` (decay) via declared precedence (`ACQ-04` "above browse and decay, below a reached
commercial destination"). **Classification: coexist-by-design / policy-resolved, no defect.**

**`ACT-11` × `ACT-12` — coexist, confirmed genuinely, not merely assumed.** `ACT-11` (Onboarding
Route Assignment) branches to `a.assisted` (`execution: "human"`, "raise the internal task that
gives this onboarding a human owner") *or* `a.self-service`, then in **both** cases fires
`h.progress` → `ACT-12` on "a route chosen and nothing blocking the start" — automated nurture
starts regardless of which route was chosen. `ACT-12`'s own eligibility and `preemptedBy` list only
gate on **`ACT-14`** (a *booked, unresolved* assisted-help session) — "s.assisted: An open ACT-14
assisted-help session... takes ownership from this journey's generic next-step prompts... nurture
steps pause" — never on `ACT-11`'s own `a.assisted` route decision. So a human being *assigned*
ownership of an onboarding (via `ACT-11`) does **not by itself** suppress `ACT-12`'s automated
nurture; only a subsequently *booked ACT-14 session* does. Read against `GLB-09`'s own principle
(quoted in `COMPETITION-ARBITRATION-ARCHITECTURE.md`: human ownership suppresses automation only
"where policy names the contest... not from the mere existence of a human owner") this is **correct,
intentional behavior**, not a defect — but it is worth stating as a confirmed, source-grounded
instance of "coexist," not an assumption, since a naive reading of "a human now owns this account"
would expect automation to pause immediately. **Classification: coexist until a concrete event
(ACT-14 booking) supersedes — correctly non-defective, but the two-step nature (assignment alone is
not enough; a booking is required) is easy to misread as a gap and is recorded here to close that
reading.**

**`RET-24` (retention-outreach, human-routing) — the round's most consequential finding, shared
with Part 10.** `RET-24`'s `c.human` branch raises `a.owner-task` (`execution: "human"`) and hands to
`external:human-in-the-loop-lifecycle`. Per the group's own declared precedence (`FBK-46`: "an open
issue under human ownership outranks automated retention and satisfaction outreach"; `RET-24` itself:
"below an open issue under human ownership... above generic retention intervention"), this human
ownership is supposed to outrank and suppress the group's other automated members — `ACT-18`
(Adoption Recovery), `RET-28` (Cancellation Save), `RET-30` (Retention Offer Follow-Up), `RET-32`
(Lapsed Customer Win-Back). **None of those four's own node graphs, eligibility lists, or wait-node
`recheck` text contain any check for "is there an open issue under human ownership / a live risk
case / a declared cancellation intent on this account" before firing their own `execution:
"communication"` actions** (`a.recover`, `a.ask`/`a.offer`, `a.followup`, `a.touch1`/`a.touch2`) —
confirmed by direct read of every condition node in each journey, not only by absence of the word
"precedence." The precedence is declared only in each journey's own `competition` field (read by
nothing) and, for `ACT-18`/`FBK-46`/`RET-28`, restated in `suppressions` guardrail prose (also read
by nothing structurally). **Classification: automation is *not* suppressed by `RET-24`'s human
ownership at the caller-graph level for 4 of the group's other 5 members** — this is the same defect
traced in depth in Part 10 below, restated here because it is squarely the interaction Part 8 asks
about: human operational ownership beginning does not visibly change what the still-running
automated journeys on the same account do next. **P0 — see Part 10.**

**Operational Workflows with `execution: "human"` actions, more broadly.** `DEC-182`'s
`a.assign`→`w.accept`/`c.accept` and `CTL-233`'s `a.revalidate` are the two clearest examples of an
operational workflow correctly gating a consequential action on a live human-acceptance state before
proceeding; both were already covered in Part 7. No new interaction between operational
human-execution actions and `OPS-131` itself was found beyond the retention-outreach case above and
`account-restriction-authority` (Part 10) — `OPS-131`'s own text explicitly declines to special-case
"is a human involved" (`GLB-09`), relying entirely on each contender's own eligibility already
incorporating human-ownership gates. That reliance is sound in principle and **unproven in practice**
for the 4 unprotected retention-outreach members, since their eligibility lists do not incorporate
the gate `OPS-131` is counting on them to have.

## Part 9 — OPS-131 enforcement coverage

`COMPETITION_ARBITRATION_MECHANISM_ID = "OPS-131"` confirmed directly in `src/canonical/surface.ts`
(line 38), inside `MECHANISM_IDS` (line 28), backed by a full node graph in
`src/canonical/processing.ts` (`entry: "t.contended"`, 10 nodes: `t.contended → a.load-contenders →
c.still-contested → c.precedence → a.claim → a.suppress-losers → w.ownership → a.reevaluate`, plus
`x.no-contest` and `h.escalate` → `DEC-181`).

**All 8 semantic requirements exist structurally in `OPS-131`'s own graph, re-verified by direct
read, not by trusting the prior round's prose:**

| Requirement | Node | Confirms |
|---|---|---|
| Eligibility re-read | `a.load-contenders` | "re-reading each one's own current eligibility from authoritative state rather than trusting whatever was true at the moment this trigger fired" |
| Scope | `entity.instanceKey: ["exclusion_group", "scope_instance_id"]` | `GLB-01` made structural |
| Precedence, no invented tie-break | `c.precedence` | "each remaining contender's own declared precedence text... no invented discriminator"; genuine ties → `h.escalate` → `DEC-181`, never arrival order |
| Atomic claim | `a.claim` | "atomically claim... if a concurrent evaluation already established an owner... return that existing owner rather than establishing a second one" |
| Loser handling | `a.suppress-losers` | "apply every non-winning contender's own declared onLoss... never invented or defaulted" |
| Re-evaluation | `w.ownership`/`a.reevaluate` | re-runs "from current authoritative state rather than from the standing anyone held when they last won or lost" |
| Preemption | `w.ownership`'s `recheck` + re-fired `t.contended` | a stronger contender becoming eligible mid-ownership re-arbitrates the same `scope_instance_id` |
| Idempotency | every action node | `idempotencyKey` scoped to `(exclusion_group, scope_instance_id)` |

All 7 real groups (`account-restriction-authority`, `purchase-intent`, `commerce-recovery`,
`lifecycle-stage`, `retention-outreach`, `outbound-ask`, `relationship-continuity` — 22 members, all
re-confirmed against `production/canonical-dump.json` directly) are structurally arbitrable by
`OPS-131`'s own contract, and `scripts/validate-canonical.mjs`'s `competition_runtime_unenforced`
error (line 434) fails the build if the mechanism ever stops resolving — **the P0 the mechanism
itself was built to close remains closed.**

**But "structurally arbitrable" is not "actually wired," and the gap is now measured, not just
named.** The prior round already disclosed as a P2 that "none of the 22 current competition-group
members are yet wired to call this mechanism." This round's node-by-node read of every one of the
22 confirms the practical shape of that gap precisely: **5 of the 22** (`ACQ-11`, `ACQ-12`, `ACQ-13`,
`RET-31`, `RET-32` — the entire `commerce-recovery` group plus one `retention-outreach` member) have
an explicit caller-side gate in their own `c.sendable` condition — *"the send path passes:
permission..., a deliverable destination, the promotional pressure cap, **no higher-precedence
contest on the account/person**, and no cooldown in force"* — that is the closest thing in the
corpus to a journey actually consulting competition state before acting, even though it does not
name `OPS-131` explicitly (it could be satisfied by any equivalent freshness check). The other
**17 of 22** have no such text anywhere in their own graph — see Part 10 for the group-by-group
breakdown.

**Prose-only conflict search (Part 9's explicit ask), outside the declared 22.** A targeted grep of
every journey's `guardrails`/`suppressions`/`entity.note`/`preemptedBy`/`distinctFrom` text for
precedence/conflict vocabulary (`outrank`, `takes precedence`, `takes ownership from`, `mutually
exclusive`, `wins/loses`, `competes with`) found **two clean candidates that declare a real
conflict relationship and are *not* registered in any `competition`/`contact.competition` field, and
therefore cannot be arbitrated by `OPS-131` even in principle**:

- **`ACT-17` (Adoption Nurture)** — *"An open complaint under human ownership, a live risk case or a
  declared cancellation intent on the same account outranks lifecycle nurture; the touch is deferred
  and re-evaluated against current state (GLB-06)."* This is the identical precedence relationship
  the `retention-outreach` group already declares structurally for `FBK-46`/`RET-24`/`RET-28` — but
  `ACT-17` is not a member of that group, has no `competition` field at all, and — read against its
  full node graph (`a.recognize`, `a.surface`, `a.next-behavior`, all `execution: "communication"`) —
  has no condition node checking for a complaint, risk case, or cancellation intent anywhere before
  firing any of them. The guardrail is a promise the graph does not keep. **P1** (same shape and
  severity as the `retention-outreach` gap in Part 10, reported separately here because it sits
  entirely outside `OPS-131`'s declared scope, which is itself the Part 9 finding).
- **`ACC-77` (Credential Revocation)** — *"Security revocation takes precedence over queued access
  actions, including refresh and activation already in flight."* Read in full, this one is **not** a
  gap: `a.invalidate` is `ACC-77`'s own action, immediately after `a.revoke`, that proactively
  *"Invalidate[s] the refresh and activation operations tied to the revoked credentials, so nothing
  in flight can [complete]"* — a push-model invalidation the winning side performs on the loser's
  queued work, rather than relying on the loser to poll back. Reported here as the corpus's clearest
  example that a prose-declared, `OPS-131`-invisible conflict is **not automatically unsafe** when
  the winning side owns invalidation directly — a legitimate alternative to `OPS-131`'s
  suppress-losers pattern, and the reference pattern the `retention-outreach` group's winners
  (`RET-24`, `FBK-46`) do **not** currently implement (they raise a human task; nothing in their own
  graph reaches into `ACT-18`/`RET-28`/`RET-30`/`RET-32` to invalidate anything).

**Coverage verdict: all 7 declared groups are enforceable through `OPS-131` as built; the mechanism
is not the gap. The gap is in the callers — both inside the declared 22 (17 of 22 unwired) and
outside it (`ACT-17` is a real, undeclared 23rd conflict relationship).**

## Part 10 — Stale loser execution (critical)

Per-group trace of whether a losing journey's own graph can execute a consequential action from
stale ownership after `OPS-131` would have re-arbitrated the scope in its favor of someone else.
Classification requires an actual node in the *losing journey's own graph* — not "OPS-131 would
suppress it," which nothing currently calls.

| Group | Members checked | Vulnerable send action(s) | Caller-side check found | Classification |
|---|---|---|---|---|
| `account-restriction-authority` | `ACC-78`, `IDN-90` | `ACC-78`'s `a.extend`/`h.restore` (lift/extend a suspension) at `c.review`/`c.outcome` | **None.** `c.review`'s branches ("Extend with a new end", "Lift it", "Nobody decided") never reference `IDN-90`'s state, despite `ACC-78`'s own declared precedence: *"a concurrent business-reason suspension (ACC-78)... pauses rather than resolving independently while this investigation is open."* `IDN-90`'s own `c.outcome`/`c.inconclusive` likewise never reference `ACC-78`. | **Unprotected.** A suspension review reaching "Lift it" while an `IDN-90` compromise investigation is still open on the same account can restore access with no structural check against the still-open investigation. **P0** — the consequence (restoring account access mid-active-compromise-investigation) is safety-relevant and not easily reversible once misuse occurs in the interim. |
| `purchase-intent` | `ACQ-04`, `ACQ-07`, `ACQ-08` | `ACQ-04`'s `a.assign` (raise human task) | **Protected**, structurally: `c.converted` ("Has this account already reached the destination this action would pursue?") runs immediately before `a.assign` and reroutes to `ACQ-08` if so. `ACQ-07`/`ACQ-08` have no `execution: "communication"` actions of their own (`ACQ-07`'s actions reclassify intent and suppress *its own* queued follow-up; `ACQ-08` suppresses *others'*) — no consequential send of their own to protect. | **Protected / not applicable.** No async wait separates the check from the action for `ACQ-04`; `ACQ-07`/`ACQ-08` have nothing to protect. |
| `commerce-recovery` | `ACQ-11`, `ACQ-12`, `ACQ-13`, `RET-31`, `SCH-282` | `a.touch1` (first send) is gated by `c.sendable`: *"...no higher-precedence contest on the account/person..."* — explicit. `a.touch2` (second send, after an async wait) is gated by `c.sendable2`: *"the send path passes and the touch budget is not spent"* — reuses the term "the send path" rather than re-listing the 5 conditions. | **Protected for touch 1** (explicit). **Ambiguous for touch 2 / final notice**: "the send path" is plausibly the same defined 5-part check referenced tersely, consistent with this corpus's own writing convention of defining a term once and reusing it, but it is never re-stated, so a reader cannot confirm competition re-checking survives into the second touch without assuming the convention holds. | **Protected (touch 1) / P2 — reword `c.sendable2`/`c.final-enabled` to restate "no higher-precedence contest" explicitly rather than relying on an implicit reuse of "the send path," for the same auditability reason `CTL-232`'s repair made revalidation an explicit node rather than an assumption.** |
| `lifecycle-stage` | `ACT-12`, `ACT-20` | `ACT-20`'s `a.attempt` (reactivation send) | **None found.** `ACT-20`'s own eligibility list — *"a previously engaged relationship that has passed the inactivity threshold... no instance of this journey is already open for the person"* — never checks "no current lifecycle journey (e.g. `ACT-12` onboarding) is open for this person," despite `ACT-20`'s own declared precedence: *"lowest in the group - any current lifecycle on the same person outranks reactivation."* `ACT-12` itself never needs to defer (it always outranks `ACT-20`) and has its own, separate, well-enforced `preemptedBy` gating (see Part 9). | **Unprotected.** `ACT-20` can send a "we miss you" reactivation message to someone mid-active-onboarding on `ACT-12`. Lower stakes than the account-restriction case (a duplicate/contradictory marketing touch, not a safety action) — **P1**, not P0. |
| `retention-outreach` | `ACT-18`, `FBK-46`, `RET-24`, `RET-28`, `RET-30`, `RET-32` | `ACT-18`'s `a.recover`, `FBK-46`'s `a.request-confirmation`, `RET-24`'s `a.owner-task`, `RET-28`'s `a.ask`/`a.offer`, `RET-30`'s `a.followup` — all `execution: "communication"` or `"human"`, all reachable only after an async wait (`w.recover`, `w.resolution`, `w.answer`/`w.decision`, `w.outcome`) | **None in 4 of 6.** `ACT-18` and `FBK-46` restate the precedence in `suppressions` guardrail prose (*"This journey is lowest in the retention-outreach group: an open issue under human ownership, a live risk case or a declared cancellation intent on the same account suppresses it (GLB-06)"*; *"While a human owns the issue, automated satisfaction and retention outreach on the same account is suppressed"*) but **neither has a condition node or eligibility check enforcing it** — confirmed by reading every condition branch in both journeys. `RET-24` and `RET-30` do not even restate the rule in prose. `RET-28` restates it (*"A declared intent outranks inferred risk on the same account"*) but likewise has no enforcing node. `RET-32` alone has the `commerce-recovery`-style explicit `c.sendable` gate (*"no higher-precedence contest on the account"*). | **Unprotected: `ACT-18`, `FBK-46`, `RET-24`, `RET-28`, `RET-30` (5 of 6). Protected (touch 1): `RET-32`.** This is the largest group (6 members), explicitly chosen by the prior round's own test matrix as *"the corpus's largest, most realistic case for a genuinely queued consequential message"* — and it is the group with the weakest actual caller-side implementation of any of the 7. It directly overlaps Part 8's `RET-24` human-routing finding: a human being assigned ownership of a risk case does not visibly stop `ACT-18`/`RET-28`/`RET-30` from independently messaging the same account. **P0 — the single most important finding of this round** (see below). |
| `outbound-ask` | `FBK-41`, `FBK-42` | `a.request` (FBK-41), `a.ask-light`/`a.ask-heavy` (FBK-42) | **None.** Neither journey's graph references the other anywhere outside its own `competition` field, despite both declaring a fully-resolved pairwise rule ("`FBK-42` wins... `FBK-41` is recorded as not-now"). Both fire immediately after their own eligibility gate, with no async wait *before* the send (the wait nodes are for the response, after sending). | **Unprotected, but lower severity** — the possible failure mode is a double-ask (survey + advocacy request landing close together for the same person), reversible and non-safety-relevant, not an irreversible consequential action. **P1.** |
| `relationship-continuity` | `SUB-163`, `SUB-167` | `SUB-163`'s `a.decided`→`h.execute`(`SUB-164`) / `a.non-renew`→`h.scheduled-end`(`SUB-168`), reached after `w.decision` and (on the review path) `w.review` | **Partial and inconsistent.** `w.decision`'s own `recheck` text explicitly says *"the cycle re-read: a decision recorded elsewhere, **a cancellation in motion**, the terms unchanged"* — a genuine, named freshness check for exactly the `SUB-167` relationship. But the condition it feeds, `c.decision`, has only two branches ("Renew" / "Do not renew"), with no branch that routes a fresh cancellation-in-motion finding anywhere different — the recheck is promised but not wired to a distinguishable outcome. The sibling wait, `w.review` (recheck: *"the review re-read: concluded with an authorised decision, or still open"*), does **not** mention cancellation-in-motion at all — inconsistent with `w.decision` in the same journey. `SUB-163`'s own eligibility does separately enforce the *other* leg of its precedence text ("no open payment recovery process exists on the relationship"), so the journey is not uniformly unprotected — only the `SUB-167`-specific leg is incomplete. | **Partially protected / inconsistent.** `w.decision` names the right check but has nowhere to route a positive finding to; `w.review` omits the check entirely. **P1** — closer to done than any unprotected group, but not confirmed closed. |

**Coverage summary across the 7 groups:** account-restriction-authority — **unprotected**;
purchase-intent — **protected/N-A**; commerce-recovery — **protected (touch 1) / ambiguous (touch
2+)**; lifecycle-stage — **unprotected**; retention-outreach — **unprotected (5 of 6 members) /
protected (1 of 6, touch 1 only)**; outbound-ask — **unprotected (lower severity)**;
relationship-continuity — **partial/inconsistent**. Of the 7 groups, **1 is cleanly protected, 1 is
partial/inconsistent, and 5 have at least one confirmed unprotected member** — of those 5,
**account-restriction-authority and retention-outreach carry P0 consequence** (safety-relevant
access restoration; contradiction of live human ownership at the group's own largest, most
realistic scale).

## Part 16/32 — Suppression semantics

`onLoss` values across the 7 groups, confirmed directly from each journey's own `competition` field
(not inferred): `paused` (`ACC-78`, `IDN-90`, `FBK-46`, `SUB-167`), `superseded` (`ACQ-04`, `ACT-12`),
`exit` (`ACQ-07`, `ACQ-08`, `ACT-20`), `suppressed` (all 12 remaining members). All four enum values
the validator permits (`competition_onloss`, `scripts/validate-canonical.mjs` line 327-328) are
genuinely used, not collapsed to one value in the declarations themselves.

**The sharper finding: the distinction exists in the declaration but is not reified anywhere in the
losing journey's own instance lifecycle.** Every one of the 22 journeys' own exit nodes (`x.*`) was
read for this round — `ACQ-11`'s `x.converted`/`x.invalid`/`x.superseded`/`x.no-action`/`x.lapsed`,
`ACT-20`'s `x.winback`(terminal)/`x.no-reason`/`x.engagement-only`/`x.sunset`, and so on across all
22 — and **none of them is the journey's own representation of "I lost the `OPS-131` competition."**
Every exit state a losing journey can reach describes that journey's *own* natural terminal
condition (converted, lapsed, no-action, window-closed), entirely orthogonal to whether it ever
contended for and lost a shared scope. `OPS-131`'s `a.suppress-losers` applies the declared `onLoss`
value in its **own** `competition_log`, external to the losing journey's instance record — so today,
whether a suppressed `ACQ-13` instance and an exited `ACQ-07` instance look any different from each
other *from inside their own journeys* is undecidable from source, because neither journey has a
node for either state. This directly compounds the Part 9 finding (17 of 22 members unwired): it is
not merely that nothing calls `OPS-131`, it is that even if something did, the losing journey's own
graph has nowhere for the distinct `onLoss` outcome to land. **P1** — the four meanings genuinely
differ in the schema and in `OPS-131`'s own prose (`GLB-05`: *"suppressed, paused, superseded and
exit are different outcomes for different reasons, and collapsing them loses that difference"*), but
in the losing journeys' own observable state today, they collapse to nothing observable at all,
rather than to one wrong generic value.

**Within `OPS-131`'s own re-evaluation, the four values do not need separate re-entry logic — this
self-heals via each journey's own eligibility, correctly.** `a.reevaluate`'s text says a previously
losing contender "re-enters exactly as a new contender would, evaluated against current eligibility"
— generic language that does not branch on the specific `onLoss` value. This is not a defect: each
journey's own eligibility rules (e.g. `ACQ-07`'s "no instance of this journey is already open") would
independently prevent an `exit`-onLoss journey like `ACQ-07` from resuming mid-stream the way a
`suppressed`-onLoss journey like `ACQ-11` legitimately can — `ACQ-07`'s own `x.cooled` re-entry text
confirms this directly: *"a new strong signal establishes a new intent state from scratch,"* i.e., a
fresh instance, not a resumption. So `OPS-131`'s generic re-evaluation wording is compatible with the
four distinct meanings by construction, deferring correctly to each journey's own instance rules
rather than needing its own onLoss-specific branch. **Not a finding on its own — recorded to show the
Part 16/32 collapse concern was checked and not found here.**

**Cross-check: does `onLoss`'s declared meaning match its group's own re-entry text?** Spot-checked
against the two clearest cases — `SUB-167` (`onLoss: paused`, relationship-continuity's winner)
declares in its own `x.blocked` exit: *"the request proceeds once the blocker clears. Nothing about
the relationship changed in the meantime"* — consistent with "paused" meaning genuinely resumable,
unchanged. `ACT-20` (`onLoss: exit`, lifecycle-stage's loser) has one **terminal: true** exit
(`x.winback`, explicitly never re-entered — "a different problem with different economics") and three
non-terminal exits whose own re-entry text requires "a new reason," "a genuine change," never mere
elapsed time — consistent with "exit" meaning the *instance* ends even though the underlying
relationship can still generate a fresh one later. Both checked cases are internally consistent with
their declared `onLoss` meaning. **No mismatch found in the cases checked; not exhaustively verified
across all 22.**

## Findings summary table

| # | Finding | Part | Severity | Where |
|---|---|---|---|---|
| 1 | `ACC-78`/`IDN-90` review/outcome branches never re-check the other member's live state before lifting/extending a restriction, despite explicit declared deference | 8, 10 | **P0** | `ACC-78` `c.review`/`c.outcome`; `IDN-90` `c.outcome`/`c.inconclusive` |
| 2 | 5 of 6 `retention-outreach` members (`ACT-18`, `FBK-46`, `RET-24`, `RET-28`, `RET-30`) have no caller-side check for higher-precedence group members before firing consequential sends; human ownership via `RET-24` does not visibly suppress the other 4 | 8, 9, 10 | **P0** | listed journeys' condition nodes and eligibility lists |
| 3 | `ACT-17` (Adoption Nurture) declares a real conflict relationship in guardrail prose identical in shape to `retention-outreach`'s, but is not a registered `competition` member and has no enforcing node — invisible to `OPS-131` entirely | 9 | **P1** | `ACT-17` suppressions text vs. its full node graph |
| 4 | `DEC-189`/`DEC-190` hand off directly into `DEC-183`'s `t.begins` trigger, which explicitly names "a case being assigned" as insufficient for `authorized_review_begins` — no `DEC-182`-style accept/claim step exists on either escalation path; a customer-facing journey (`DEC-184`) is one of `DEC-189`'s callers, raising practical stakes without changing the structural gap | 7 | **P1** | `DEC-189`, `DEC-190`, `DEC-183` `t.begins` |
| 5 | `ACT-20` never checks for a concurrently open `lifecycle-stage` sibling (`ACT-12`) before sending its reactivation touch, despite declared "lowest in the group" deference | 10 | **P1** | `ACT-20` eligibility, `a.attempt` |
| 6 | `commerce-recovery` group's second/final touch gates (`c.sendable2`, `c.final-enabled`) drop the explicit "no higher-precedence contest" language present at the first touch, relying on an unstated reuse of "the send path" | 10 | **P2** | `ACQ-11`/`ACQ-12`/`ACQ-13`/`RET-31` `c.sendable2` |
| 7 | `SUB-163`'s `w.decision` recheck explicitly re-reads "a cancellation in motion" but `c.decision` has no branch to act on that finding differently; sibling `w.review` omits the recheck entirely | 10 | **P1** | `SUB-163` `w.decision`, `c.decision`, `w.review` |
| 8 | `outbound-ask` (`FBK-41`/`FBK-42`) has a fully pairwise-resolved precedence rule with zero caller-side enforcement of it in either journey's graph | 10 | **P1** | `FBK-41`, `FBK-42` |
| 9 | `onLoss`'s 4 declared values (`suppressed`/`paused`/`superseded`/`exit`) are never reified as a state in any of the 22 losing journeys' own exit nodes — the distinction lives only in `OPS-131`'s own `competition_log`, external to the losing instance | 16/32 | **P1** | all 22 members' `x.*` nodes vs. `OPS-131` `a.suppress-losers` |
| 10 | `kind: "handoff"` nodes have no `terminal`/closure-semantics field the way `kind: "exit"` does — corpus-wide, not per-edge | 7 | **P2** | schema-level, all 522 handoffs |
| 11 | `ACC-77`'s push-model invalidation (`a.invalidate`, reaching into the loser's in-flight operations directly) is a working, `OPS-131`-independent alternative pattern the retention-outreach winners do not use | 9 | — (positive reference, not a defect) | `ACC-77` |
| 12 | `ACT-11`→`ACT-12`: a human being assigned an onboarding route does not by itself suppress automated nurture; only a subsequently booked `ACT-14` session does — confirmed correct per `GLB-09`, recorded to prevent misreading as a gap | 8 | — (confirmed non-defective) | `ACT-11`, `ACT-12` |
