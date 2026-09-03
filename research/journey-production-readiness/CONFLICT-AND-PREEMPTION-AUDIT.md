# Conflict & preemption audit — 71 orchestration-bearing Customer Journeys

Scope: the same 71 journeys as `COMMUNICATING-CUSTOMER-JOURNEYS-AUDIT.md`. This document asks one
question per plausible pair or cluster: **if both states are true on the same person/account at
once, does the corpus already say who owns the next action — and if it does, is that rule
enforced in the graph itself or only stated in prose?**

Entries are only recorded where a real conflict is plausible. A pair that cannot overlap by
construction (different entities, strictly sequential lifecycle stages) is noted as resolved and
not carried into the matrix as an open question.

## Fully resolved, graph-enforced

| Journey A | Journey B | Can overlap? | Who owns it | Suppressed | Metadata sufficient? |
|---|---|---|---|---|---|
| ACT-13 (blocker) | ACT-12 (nurture) | yes | ACT-13 | ACT-12's own `s.blocker`→`h.blocker` | yes |
| ACT-13 (blocker) | ACT-14 (help) | yes | ACT-13 | ACT-14's `c.duplicate`→`x.defer` | yes |
| RET-24 (risk) | RET-28 (cancel intent) | yes | RET-28 | RET-24 hands off; RET-28's `s.contest`; shared `retention-outreach` group | yes |
| RET-32 (win-back) | FIN-134 / any retention-risk-complaint | yes | the live journey | RET-32's `contact.competition` precedence names "any live retention, complaint, risk **or payment** journey" explicitly | yes — strongest-worded resolution in the corpus |
| SCH-280 (no-show) | SCH-180 (provider cancel) | yes | SCH-180 | SCH-280's `c.provider`→`h.provider`, sends nothing itself | yes |
| SCH-266 (reminder) | SCH-280 / SCH-277 | no (sequential) | n/a | SCH-266 always exits via handoff before the window that SCH-280/277 open in | yes |
| REM-157 (remedy) | REM-152 (return) | yes (one direction) | REM-152 first when a return is required | REM-157's `h.return`→REM-152 | partial — see Open questions |
| ACQ-11 → ACQ-12 → ACQ-13 (commerce-recovery) | — | yes, by design | highest-scoped subject wins | each states its own `contact.competition.precedence`; each hands off to the next when its subject graduates | yes — the corpus's cleanest template |
| IDN-270 (recovery) | IDN-90 (incident) | yes | IDN-90 | IDN-270's `c.incident`→`h.security` diverts recovery entirely | yes |
| CON-264 (contact verify) | IDN-270 (account recovery) | yes, non-conflicting | both run independently | IDN-270's `s.g1` restricts recovery to an *already-held* destination, so an unconfirmed CON-264 change is never eligible | mostly — see Open questions (data dependency not stated positively) |
| RET-28 (cancel) | FIN-134 (payment failure) | yes, non-conflicting | both — different decisions | FIN-134 collects on an incurred obligation regardless of the relationship's future; RET-28 decides the relationship's future regardless of the debt | yes |
| TIM-268 / TIM-274 / TIM-281 (deadline→grace→expiry) | — | no (sequential by construction) | n/a | each stage's trigger evidence gates on the previous stage having closed | yes, though not verified *inside* each journey (see Open questions) |

## Open questions — real, currently unresolved by the corpus

| Journey A | Journey B | Can overlap? | Who should own it | What should be suppressed | Metadata sufficient? |
|---|---|---|---|---|---|
| FBK-41 (satisfaction ask) | FBK-42 (advocacy ask) | yes | **undefined** | one of the two, for the ask slot | **no — P0.** Both declare `contact.competition.exclusionGroup: "outbound-ask"` with the rule text "neither is assumed to outrank the other," and no default tie-break exists anywhere in the corpus. |
| FBK-46 (open issue) | FBK-41 / FBK-42 | yes | FBK-46 | both, while the issue is open | yes — FBK-46's `s.human-owner` names both explicitly |
| FBK-47 (appeal) | FBK-41 / FBK-42 | yes | **undefined** | unclear whether intended | **no — P2.** FBK-47 shares no exclusionGroup or suppression rule with the FBK-41/42/46 cluster; not stated whether an open appeal should pause satisfaction/advocacy asks about the same account. |
| ACT-12 (nurture) | ACT-14 (assisted-help session booked) | yes | ACT-14, per ACT-12's own `preemptedBy` prose | ACT-12's generic next-step prompt | **no — P1.** Stated only in ACT-12's documentation; ACT-14 exposes no signal (event, flag) for ACT-12 or an orchestration layer to check, and the suppression is not in `orchestration.noAction` on either side. |
| SUB-163 (renewal reminder) | FIN-134 (open payment recovery) | yes | FIN-134 (implied by the sibling group's pattern, not stated) | SUB-163's decision-request touch | **no — P1.** SUB-163 explicitly defers to RET-28 (cancellation) and RET-24 (active risk) by name in both prose and `contact.competition`, but never names FIN-134 the same way — the one relationship in this family missing the exclusion its siblings (RET-24, RET-32) already have. |
| RET-24 (risk, operational-cause branch) | FIN-134 (open payment recovery) | yes | FIN-134, if the "known operational problem" *is* the payment failure | RET-24's `c.operational`→RET-23 hand-off | **no — P1.** RET-24 always routes a recognized operational cause to RET-23 without checking whether that cause is already an open FIN-134 instance; low send-risk (RET-24 is internal-task-only) but a real double-ownership risk at the ops level. |
| CON-264 (contact change) | CON-272 (contact repair) | yes | **undefined** | whichever is not the origin | **no — P1, both journeys.** Both can fire from the same real-world action (supplying a new destination after a bounce); neither's `distinctFrom` addresses the other. |
| IDN-271 (security incident) | IDN-81 (verification) / IDN-85 (auth challenge) | yes | IDN-271, arguably | ordinary verification/challenge sends during an open incident | **no.** IDN-271 does not reciprocally suppress either; flagged P1 on IDN-81 (evidence requests are the more sensitive case), P2 on IDN-85 (a routine MFA challenge continuing is plausibly fine, just undocumented). |
| FUL-146 (delay, pre/post dispatch) | FUL-265 (post-dispatch tracking) | yes | **undefined split** | pre-dispatch: FUL-146 only; post-dispatch: FUL-265/FUL-148 | **no — P0, the most significant finding in this audit.** Both can be open on the same `obligation_id` with nothing in eligibility, suppressions, or `distinctFrom` preventing it; FUL-265's own condition treats an in-transit delay as a binary delivered/not-delivered question and can independently send a "not arrived" message while FUL-146 sends a proper delay/new-ETA message about the same slip. |
| FUL-265 (`x.unresolved`) | FUL-148 (failed-delivery recovery) | should, but doesn't | FUL-148 | n/a (missing handoff, not a suppression problem) | **no — P0.** No handoff connects "we told the customer it didn't arrive" (FUL-265) to "here is how we recover it" (FUL-148); an implementer has no wiring instruction. |
| SCH-180 / FUL-148 / REM-152 (`h.return`/`h.alternative`) | REM-151 / REM-157 (`issue_id`-keyed remedy chain) | n/a — data gap, not a live-conflict question | REM-151/REM-157, but with no `issue_id` to key on | n/a | **no — P0, recurs 3×.** Three separate upstream journeys hand off directly into the remedy chain without ever minting or carrying an `issue_id`, which REM-151/REM-157 both require as their instance key. Not a which-journey-owns-it question — a whether-the-required-identifier-exists-at-all question. |
| REM-157 | REM-152 (bounce-back via `h.alternative`) | yes, cyclically | REM-157, but no cycle-guard exists | a repeated "return" selection on the bounce-back | **no — P1.** If REM-152 rejects the return, `h.alternative` sends it back to REM-157, and neither journey states a rule against REM-157 re-selecting "return" again — a potential ping-pong, not just a one-way dependency. |
| DOC-215 (signatures) | DOC-220 (conflict review) | yes, by design | resolved at the connection points | DOC-220's `h.resign` re-raises DOC-215 scoped to missing signatures only | mostly — but neither journey checks whether the *other* is concurrently open on the same `document_lineage_id`; flagged P1 (suppression) on DOC-220. |
| DOC-220 (conflict review) | DOC-286 (effective/active) | yes | DOC-220 (a later conflict finding can retroactively make DOC-286's version non-authoritative) | n/a | **no — P1.** Same missing cross-instance check as above; DOC-286 does not verify no open DOC-220 review exists for its `document_lineage_id`. |
| TIM-268 / TIM-274 / TIM-281 | — (each other) | should not, by sequence | the currently-open stage | the other two | **P2 — defensive gap only.** Mutual exclusion is asserted by surrounding lifecycle machinery (TIM-65/TIM-69's `distinctFrom`), not verified *inside* these three journeys; recommend an explicit "no sibling stage-journey open for this `entity_ref`" suppression on all three even though upstream design should already prevent it. |

## Cluster notes not reducible to a single pair

- **Retention-outreach exclusion group** (RET-24, RET-28, RET-30, RET-32, and by reference
  RET-23/RET-27/RET-29) has fully worked-out precedence in every member's own `contact.competition`
  field. This is the corpus's best template for what a conflict resolution *should* look like and
  is the standard the other groups below are measured against.
- **relationship-continuity group** (SUB-163 and siblings) is thinner than its retention-outreach
  counterpart: it names two exclusions (cancellation-in-motion, active risk) where the sibling
  group has three (adding payment-recovery). See the SUB-163/FIN-134 row above.
- **FIN-134 declares `contact.competition: "none"`** — a deliberate, defensible design (a debt
  doesn't stop existing because something else is happening on the account), but it means every
  journey that might collide with it must name FIN-134 explicitly in its own suppression logic
  rather than inheriting protection from a shared group. RET-24 and RET-32 do this; SUB-163 does
  not (see above). This asymmetry is worth checking against the ~60 orchestration-bearing journeys
  outside this batch that were not part of this specific audit round wherever a payment-recovery
  collision is plausible.
- **Router-journey pattern** (ACQ-04, ACT-11, ACT-17 — reviewed corpus pattern, code
  `router_journey` in `production/vnext-warning-reviews.json`): these own no outcome of their own,
  both terminal branches are handoffs. Correct as designed; listed here only so a future
  conflict-matrix pass does not mistake "no primary outcome" for a missing-outcome gap.
- **`*_lineage_id`/`*_version_id` families** (the DOC trio is the one instance in this batch): any
  group of journeys sharing a lineage/version-scoped entity should get an explicit cross-instance
  suppression check as a matter of pattern, not just a downstream handoff that assumes the others
  behave — this is the single most generalizable structural recommendation to come out of this
  audit round.

## What this audit does not do

No suppression/competition metadata was added to any journey in this round — every row above
describes a finding to hand to the canonical-journey owners, not a change already made. Silent
lifecycle states, runtime mechanisms and operational workflows outside the 71 audited journeys
were read only where a communicating journey handed off to one; their own conflict surface is out
of this round's scope.
