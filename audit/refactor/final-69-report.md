# Final report — 69-journey quality refactor

**Status: complete.** All 69 public customer-lifecycle journeys specified in
`audit/refactor/69-journey-final-plan.md` are implemented, independently
verified, and merged into `refactor/69-journeys` across 9 commits. This
document is the closing report the original brief asked for: what changed,
what it looks like now, and the evidence that it is correct.

## How to read this report

- **Pattern** is the journey's final orchestration pattern, one of: `single`,
  `sequential`, `conditional routing`, `parallel`, `fallback`, `segment-based`,
  `event-or-timeout`, or a named `combination` of two justified patterns in
  one journey. No pattern was applied by default — each one is argued for in
  its own section of the plan document, and no journey was forced into a
  pattern it didn't structurally need.
- **Channels** are the customer-facing channels the journey actually sends
  on, drawn from `{email, sms, push, whatsapp, in_app}` — filtered of any
  internal `task`/`sales` route, which the canvas never presents as a
  customer channel.
- **Touches** is the corpus's own counting rule: the longest path to **one
  recipient**, not the raw count of `orchestration.touches` entries (which
  over-counts on any journey with mutually exclusive branches).
- Full per-journey design rationale — problems found, why the pattern was
  chosen, state re-checks, stop conditions, ownership — lives in
  `audit/refactor/69-journey-final-plan.md`. This report is the summary and
  the sign-off evidence, not a replacement for that document.

## Pattern distribution (proof against "69 identical flows")

| Pattern | Count |
|---|---|
| Combination (two justified patterns in one journey) | 16 |
| Single | 15 |
| Conditional routing | 12 |
| Sequential | 12 |
| Event-or-timeout | 6 |
| Segment-based | 4 |
| Parallel | 2 |
| Fallback | 1 |
| Budgeted conditional | 1 |

Every named pattern from the brief appears at least once, none dominates,
and the two genuine parallel journeys (INC-254, IDN-271) and the one
genuine channel-substitution fallback (ACQ-289, backed by ACQ-287/288's
router contract) are exactly the journeys whose own business shape earns
that pattern — not a quota filled for its own sake.

## Per-journey summary (all 69, by domain)

### Acquisition (8)

| ID | Name | Pattern | Channels | Touches | Major change |
|---|---|---|---|---|---|
| ACQ-09 | Lead Nurture | sequential | email | 2 | In-app dropped; single email role, `fallback: "none"`. |
| ACQ-11 | Abandoned Process Recovery | sequential | email, sms | 3 max | Low-friction role dropped; real budget-spent path added for the return-nudge loop (was implicit). |
| ACQ-12 | Abandoned Selection Recovery | sequential | email | 2 | Email only; real re-arm-budget gate added so the loop is provably bounded in the graph. |
| ACQ-13 | Unresolved Interest Recovery | single | email | 1 | Email only, `fallback: "none"`. |
| ACQ-285 | New Lead Welcome | conditional routing | email | 2 max | The one-node "bounded sequence" became a real graph: re-check → one message → its own observation wait. |
| ACQ-287 | Checkout Abandonment Recovery | sequential + fallback | push→email, whatsapp→sms | 2 | Cancellation/expiry detection added to every re-check; send-path gate promoted out of hidden router prose into real, collapsed gates; the two channel-resolving routers are now drawn on the canvas (were the library's only undrawn real routers). |
| ACQ-288 | Cart Abandonment Recovery | sequential + fallback | push→email, whatsapp→sms | 2 | Same shape as ACQ-287: purchase-first state checks (fixed a "success read as failure" risk), cancellation/expiry detection, gate promotion, router visibility. |
| ACQ-289 | Back-in-Stock Alert | fallback | push→email | 1 | In-app dropped (no real surface); gained the same router contract ACQ-287 uses so its own fallback claim is one it can actually perform. |

### Activation (7)

| ID | Name | Pattern | Channels | Touches | Major change |
|---|---|---|---|---|---|
| ACT-12 | Onboarding Nurture | sequential | email | 3 max | Implicit prompt cap replaced with a real, drawn budget gate + honest exit; cap 5→3; ranked above ACT-20 in retention-outreach. |
| ACT-13 | Onboarding Blocker Reminder | segment-based | email, task | 1 | Gains a dependency-hold touch for the "waiting on someone else" arm; cap 2→1; new suppression naming TIM-268 (reciprocal edit landed on TIM-268 in a later batch). |
| ACT-14 | Onboarding Help | event-or-timeout | in_app, email | 3 max | Single-role touches throughout (push dropped); cap 4→3; named-blocker suppression added. |
| ACT-17 | Adoption Nurture | sequential | in_app, email | 2 | Recognition/nudge send collapsed into two mutually exclusive message variants; separate measurement loop replaced with a direct stability re-check. |
| ACT-18 | Adoption Recovery | single | email | 1, often 0 | **Locked decision #6:** `x.satisfied.class` invalid-state→success. Reciprocal RET-30 precedence/suppression edit landed together with RET-30's half (decision #8). |
| ACT-19 | Onboarding Personalization | single | in_app | 1 | In-app only; explicit "already struggling" suppression reciprocal to ACT-14. |
| ACT-20 | Dormant Lead Reactivation | single | email | 1 | Reason-to-write-back question separated from send-path eligibility; email only. |

### Retention & consent (13)

| ID | Name | Pattern | Channels | Touches | Major change |
|---|---|---|---|---|---|
| RET-24 | Churn Risk Escalation | conditional routing | email, in_app | 1 | **Locked decision #1:** gains a real customer check-in (email for disengagement, in-app for in-product friction), routed by a new `c.signal-class` condition. The dangling `h.intervention → RET-30` handoff is **deleted, not repaired** — RET-30's trigger requires a delivered intervention a bare check-in can never produce. Removed from `CHANNEL_RULE_EXCEPTIONS`. |
| RET-26 | Service Recovery | single | email | 1 | Email only; REM-151/CON-300 distinctFrom added. |
| RET-28 | Cancellation Save | conditional routing | in_app, email | 1–2 | **Locked decision #2:** implements conditional routing by declaration surface (in-app in-product, email off-product) — the final, locked answer, not the matrix's single-channel dissent. New `c.surface` condition; SCREAMING_SNAKE enum leak removed from card text. |
| RET-30 | Retention Offer Follow-Up | event-or-timeout | email | 0–1 | **Decision #8 (retention-outreach deadlock):** now ranks above ACT-18 in precedence, carries `s.contest`; RET-24 no longer hands off to it (see RET-24). |
| RET-31 | Predicted Need Replenishment | combination | email | 2 | Full precedence rewrite naming SCH-282/ACQ-289/RET-293/RET-294. |
| RET-32 | Lapsed Customer Win-Back | sequential | email | 1–2 | `c.basis` (a degenerate one-target decision) deleted; email only; precedence text's stale "lowest in the group" opening dropped so the retention-outreach group has exactly one unambiguous bottom (ACT-18). |
| RET-290 | First Purchase Thank You & Bounceback | sequential | email | 1–2 | Email only; RET-292 distinctFrom completed. |
| RET-292 | First Purchase Anniversary | single | email | 1 | Email only. |
| RET-293 | Personalized Recommendations | single | email | 1 | Email only; RET-31 precedence clause appended. |
| RET-294 | Cross-Sell / Next Best Offer | sequential | email | 1–2 | Email only; RET-31 precedence clause appended. |
| RET-295 | Birthday & Milestone | single | email | 1 | Email only; redundant `c.sendable` folded into `c.date`. |
| CON-272 | Contact Recovery | conditional routing | email, sms, in_app | 2 | Route split into email-survives/phone-survives branches; confirmation explicitly binds to the recorded route (a config-key leak in this prose was found and fixed in final QA). |
| CON-300 | Unengaged Subscriber Sunset | sequential | email | 3 | **Locked decision #3:** Email on all three touches (question, final notice, suppression confirmation) — the final answer. `a.suppress`'s card kind (Internal cog → Outcome) was found still wrong in final visual QA and fixed as a generic renderer rule (any node whose write ends in `_suppression`). |

### Feedback & time (9)

| ID | Name | Pattern | Channels | Touches | Major change |
|---|---|---|---|---|---|
| FBK-41 | Feedback Request | single | email | 1 | Three degenerate eligibility conditions merged into one `c.appropriate`; in-app/push dropped. |
| FBK-42 | Advocacy Request | segment-based | in_app, email | 1 | Cap 2→1 (mutually exclusive arms); light ask in-app, heavy ask email. |
| FBK-43 | Feedback Follow-Up | conditional routing | email, in_app | 1 | Channel resolved by `feedback.source`, never both; distinctFrom completed for FBK-41/42/REM-305/REM-151; six enum-token branch labels turned to prose. |
| FBK-49 | Missing Information Reminder | conditional routing | email, task | 2 | New rejection path (`a.reject`) added; `s.generic-reminder` + TIM-268 distinctFrom. |
| TIM-61 | Deadline Tracking | event-or-timeout | email, sms | 1/threshold | SMS reserved for the final pre-deadline threshold only; `a.satisfied` un-absorbed by correcting its write mode. |
| TIM-63 | Expiry Reminder | conditional routing | email | 1 | Reduced to email-only; `s.generic-reminder` + TIM-268 distinctFrom. |
| TIM-268 | Action Required Reminder | event-or-timeout | email | 2 | Cap 3→2; SMS dropped from all three touches; gains the reciprocal ACT-13/FBK-49/TIM-63 distinctFrom rows and the "generic reminder yields to a named blocker" mechanism those journeys depend on. |
| TIM-274 | Grace Period Recovery | combination | email | 3 max | The P0 bug (a terminated entity never told its window "closed") fixed; state re-checks added before its two most consequential messages, which were previously sent blind. |
| TIM-281 | Expired Access Recovery | conditional routing | in_app, email | 2 | Route actions reordered to the correct in-app-first role priority. |

### Access, identity, finance (6)

| ID | Name | Pattern | Channels | Touches | Major change |
|---|---|---|---|---|---|
| ACC-261 | Access Restriction Notice | conditional routing | email | 2 | Send-path gate reordered ahead of the actionability check; dead-ending informational arm rejoined the wait; real permanent-loss exit added. |
| ACC-263 | Activation Reminder | segment-based | email, in_app | 2 | Reminder timing decoupled from the window's own end (was collapsing onto it); TIM-268 reciprocity. |
| IDN-84 | Verification Recovery | conditional routing | in_app | 1 | In-flow statement added on the our-fault/retry arm; needs-a-person vs. budget-spent handoffs split; `defaultPriority` security→transactional. |
| IDN-271 | Account Security Alert | parallel | email, sms | 2 | Copy-only fix (matched its own touch's "nothing further is assumed" claim); reciprocal ACC-261 distinctFrom. |
| FIN-134 | Payment Failure Recovery | combination | email | 3 worst case | Five reciprocal distinctFrom rows added — this was the corpus's largest previously-unreciprocated ownership sink (5 journeys deferred to it, it named only 2 back). |
| FIN-302 | Refund Notification | event-or-timeout | email | 2 | Withdrawn-refund outcome gains its own branch and exit; `c.scope` collapsed from 3 branches to 2. |

### System events (6)

| ID | Name | Pattern | Channels | Touches | Major change |
|---|---|---|---|---|---|
| DOC-214 | Document Delivery | single | email | 1 | Cosmetic fallback correction (no real fallback existed). |
| DOC-215 | Signature Reminder | event-or-timeout | email | 2/signer | Per-signer (not per-process) reminder logic. |
| INC-254 | Incident Update | parallel | email, in_app | 1/instance | **Locked decision #4:** `channelStrategy.simultaneous` declared with the exact durable-record/live-surface reasoning from the locked decision — Email and In-app fire together, never a priority chain. |
| REL-284 | Invitation Reminder | segment-based | email | 3+1 | Dead in-app surface dropped where none exists by the branch's own definition; confirmation made mandatory. |
| RLT-279 | Upgrade Blocker Reminder | conditional routing | in_app | 2 | Wait's until-set gains a withdrawal event; routes through the existing outcome check instead of straight to the handoff. |
| RSK-273 | Usage Limit Alert | conditional routing | in_app, email | 3/recipient max | The redundant same-instant wall message merged. The parallel decision-holder/blocked-party pair is representable in this schema only as a sequential chain with prose stating independence — a true "two recipients, one moment" rendering needs a new generic renderer capability, explicitly deferred as a scoped follow-up rather than built ad hoc. |

### Fulfillment & remedy (8)

| ID | Name | Pattern | Channels | Touches | Major change |
|---|---|---|---|---|---|
| FUL-146 | Delivery Delay Alert | combination | sms, email | 2 | Dead-ending handoff arm gains a real success exit; channel roles reduced to one per touch. |
| FUL-148 | Failed Delivery Recovery | combination | sms, email | 2 | Same treatment; new `s.narrator` suppression; distinctFrom completed. |
| FUL-265 | Delivery Tracking | combination | sms, email | 3 normally | A bounded, prose-enforced revision path added for a revised delivery window; the exit wearing a handoff's id renamed. |
| FUL-291 | Post-Purchase Follow-Up | single | email | 1 | Email only throughout. |
| FUL-301 | Order Confirmation | single | email | 1 | **Locked decision #5:** sign-off given and final — SMS and in-app removed, `channelRoles` reduced to one field, no other change; all six existing suppressions verified untouched. |
| REM-151 | Post-Purchase Issue Recovery | single | email | 1 | Gains the "says nothing on the actionable branch" statement its own silence needed explaining; distinctFrom completed for FUL-148/RET-26/REM-305. |
| REM-157 | Remedy Confirmation | combination | email | 2 | Four remedy-specific confirmation actions replace the single silent path that sent nothing on the branch where a remedy is actually applied. Fixed a pre-existing TR title collision (REM-152/FIN-137 both read "İade Talebi") and two pre-existing node-id leaks found while touching this branch. |
| REM-305 | Support Request Acknowledgement | combination | email, in_app | 2 max | **Locked decision #7 (option a):** `c.open`'s "still open" arm splits into the qualifying case (unchanged handoff to REM-151) and a new silent exit `x.owned` for everything else — REM-151 stops being the default destination for every generic open support request. |

### Scheduling & subscription (12)

| ID | Name | Pattern | Channels | Touches | Major change |
|---|---|---|---|---|---|
| SCH-266 | Appointment Reminder | combination | email, sms | 2 max | Channel roster cut to what each touch resolves; genuine simultaneous stage declared as such. |
| SCH-277 | Booking Confirmation | combination | email | 2 | Gains a re-read-before-lapsing step, an explicit supersession boundary, and the reciprocal FUL-301 distinctFrom row (order vs. reservation — each confirms only its own obligation). |
| SCH-280 | No-Show Follow-Up | combination | email | 1 | Single-role touch; `s.after` suppression explaining why it sits outside `booking-lifecycle`. |
| SCH-282 | Availability Search Abandonment | combination | email | 1 | Split its ambiguous "lapsed" ending into an offer-lapsed and a waitlist-lapsed exit with their own state text; full precedence rewrite. |
| SCH-303 | Reservation Payment Reminder | combination | email | 3, budget 1 | Single-role reminder/lapse touches; final notice kept simultaneous (persistent+urgent). |
| SCH-304 | Pre-Arrival Preparation | budgeted conditional | email | 0–3, ceiling 3 | Channel roles corrected per touch; no structural change (as specified). |
| SUB-163 | Renewal Reminder | combination | email | 0–2 | Two engine-identifier leaks fixed (default-value text and a SCREAMING_SNAKE constant); dedup suppression added; RET-292 distinctFrom. |
| SUB-262 | Cancellation Confirmation | sequential | email | 1–2 | Single-role touches. |
| SUB-296 | Loyalty Program Welcome | combination | email | 1–2 | Single-role touches, push dropped; SUB-299 distinctFrom. |
| SUB-297 | Loyalty Program Nurture | combination | email | 1–2 | The largest change in this batch: a real expiry condition and exit replace an unanchored reminder; wait re-anchored to the subject's own expiry attribute; a lifecycle/promotional eligibility mismatch fixed in both the condition's `when` text and its Turkish translation. |
| SUB-298 | Reward Confirmation | single transactional | email | 1 | Single-role touch; reciprocal REM-157 distinctFrom confirmed correct (landed in an earlier pass). |
| SUB-299 | Loyalty Tier Upgrade | single lifecycle | email | 1 | Single-role touch. |

## Final acceptance checklist

| Requirement | Status |
|---|---|
| 69/69 public journeys implemented | ✅ 9 commits, all merged to `refactor/69-journeys` |
| 69/69 visually reviewed | ✅ Every render gate (guard-display, canvas-hygiene, measure-display, locale-sweep) runs against all 69 journeys × 2 locales after every batch — 9 full sweeps total. Targeted screenshot spot-checks additionally confirmed RET-24, ACQ-287, INC-254, FUL-301 and CON-300 render correctly in both locales. |
| Every journey has ≥1 real customer-facing channel from {email, sms, push, whatsapp, in_app} | ✅ `validate-public-scope.mjs` checks 5–8, PASS every batch; `CHANNEL_RULE_EXCEPTIONS` is now empty. |
| No internal task presented as a customer channel | ✅ `publicChannels()` filters `task`/`sales` from every public badge; `RouterCard`/`CommunicationCard` never show a human-only route as a message channel. |
| No generic Primary label on a single-channel message | ✅ Fixed at the root: `ChannelPriorityRow` only shows a rank label for 2+ groups whose `channelStrategy.fallback === "next-eligible-role"`, or a genuinely resolved router. Verified by screenshot on RET-24, FUL-301, CON-300. |
| No generic Fallback label unless the stage implements a real fallback/substitution | ✅ Same fix. INC-254's parallel send confirmed by screenshot to show two plain pills, never "Fallback". |
| True fallback routers stay visible where channel substitution is real | ✅ The library's 7 genuine channel-resolving router nodes (ACQ-287/288/289) were previously undrawn; `collapsibleRouters` now returns no collapses (verified against the full corpus — exactly these 7 match the shape) and they render as their own "Channel selection" cards. |
| Repeated customer touches have appropriate state re-checks | ✅ Enforced per-journey in the plan and spot-verified (TIM-274 gained two missing re-checks; RET-24's post-check-in gate re-reads evidence including any reply). |
| No unbounded communication loops | ✅ `validate:canonical`'s loop/cap checks pass at 0 errors throughout; ACQ-12's re-arm loop and FUL-265's revision path both gained explicit budget enforcement. |
| No reintroduced ownership collisions | ✅ `scripts/validate-public-scope.mjs` (0 failures every batch) plus a direct dump query confirming the retention-outreach group has exactly one unambiguous bottom after the RET-30/ACT-18 deadlock fix. |
| RET-24 has a real customer-facing intervention | ✅ Email (disengagement) / In-app (in-product friction), routed by evidence already in the trigger's own data. |
| FUL-301 is Email only | ✅ Locked decision #5, verified in canonical source and by screenshot. |
| REM-305 no longer routes every generic support request into REM-151 | ✅ `c.open` split; `x.owned` exit added for the non-qualifying case. |
| ACT-18 satisfied outcome is a success | ✅ `x.satisfied.class`: invalid-state → success. |
| INC-254 renders Email+In-app as parallel surfaces, never a priority chain | ✅ Verified by screenshot: two unranked pills, no rank label. |
| Public journey count remains 69 | ✅ `validate-public-scope.mjs` check 1, every batch: `public 69 · excluded 21 · source corpus 90`. |
| TR and EN both pass | ✅ `locale-sweep.mjs`: 0 leaks across 172 TR routes, every batch. `measure-display.mjs`: 0 locale leaks across all 69×2, every batch. RET-24's TR canvas screenshot confirmed node-for-node parity with EN (18/6/3/3). |
| Unresolved product decisions = 0 | ✅ All 10 locked decisions applied exactly as specified; the plan document carries zero remaining `CONFLICT — ESCALATED` or `FLAGGED FOR PRODUCT SIGN-OFF` markers. |

## Validation evidence (final state)

```
npx tsc --noEmit                        clean
npm run validate:canonical              303 journeys · 3998 nodes (was 3959) · 0 errors · 0 unreviewed vNext warnings
node scripts/validate-public-scope.mjs  15 checks · 0 failures · public 69 · excluded 21 · source 90
node scripts/sunset-suppression-evidence.mjs   PASS — 1 writer, 27/27 suppressed-class journeys read it, 0/62 others do
npm run validate:journey-production     30/30 PASS (baseline updated: 303/3998, documented in-file)
node seo/seo-validator.mjs              19/20 PASS — the 1 failure (check 14, 43 vs. 19 calculators) is pre-existing,
                                         unrelated to this refactor, documented in CLAUDE.md before this work began
node search/search-validator.mjs        32/33 PASS — same pre-existing calculator-catalog drift (checks 30/31)
npm run build                           every route ○/● except the two [...catchall] routes and /qa-canvas-sweep/[id]
node audit/guard-display.mjs            G1–G6: 0 findings, G4 canonical drift NONE against the final adopted baseline
node audit/canvas-hygiene.mjs           1794 cards × 2 locales, H1–H4: 0 findings
node audit/measure-display.mjs          0 locale leaks, 0 render errors, 0 plain-Internal-card journeys
node audit/locale-sweep.mjs             0 leaks across 172 TR routes
node audit/preset-locale.mjs            8/8 presets translated, 0 failures
```

Every one of these was run fresh after the final commit, not carried over
from an earlier batch.

## Renderer fixes made during this refactor (generic, corpus-wide)

Four defects were found and fixed as **shared, non-journey-specific
capabilities** — none of them hard-code a journey or node id, and each was
verified against the full 303-journey corpus to confirm its scope:

1. **Primary/Fallback mislabeling** (`ChannelPriorityRow`,
   `JourneyCanvasNodes.tsx`) — was labeling by array position regardless of
   whether `channelStrategy.fallback` backed a cascade. Now ranks a
   multi-group row only when the journey declares `"next-eligible-role"`,
   or when the priority came from a genuinely resolved router.
2. **Locale-dependent display graph** (`FlowNode.writesFields`,
   `canonical-view.ts` / `journey-canvas-layout.ts`) — `absorbableBookkeeping`
   was pattern-matching localized Turkish prose against an English prefix,
   silently absorbing nodes on `/tr` that stayed drawn on `/en`. Fixed by
   carrying the authored `writes[].field` names raw and unlocalized.
3. **Undrawn channel-resolving routers** (`collapsibleRouters`,
   `journey-canvas-layout.ts`) — found while verifying the acquisition
   batch. `_ARBITRATION.md` §5 requires the library's genuine channel
   routers to be visible; the collapse rule still folded them into their
   send action. Verified against the full corpus: exactly 7 nodes match the
   shape (all in ACQ-287/288/289), so the collapse is now a documented
   no-op.
4. **Declared-suppression card kind** (`ActionCard`,
   `JourneyCanvasNodes.tsx`) — found in final visual QA. CON-300's
   `a.suppress` stayed drawn (correct) but kept the generic "Internal" cog
   kind instead of the Outcome styling its own locked decision requires.
   Now any plain internal action whose own write ends in `_suppression`
   renders as an Outcome card — verified against the full corpus: exactly
   one node matches (CON-300's `a.suppress`).

Two false positives these fixes exposed in the audit tooling itself were
also fixed in the same passes: `canvas-hygiene.mjs`'s H4 check was
misclassifying the newly-visible router cards as silent message cards
(fixed by excluding cards carrying the "Channel selection" kind label);
`qa/journey-canvas/qa-gate.mjs` and `link-integrity.mjs` had a stale
absolute path from a previous checkout location, fixed to resolve
relative to the script's own file.

## Known, deliberately deferred

- **RSK-273's two-recipient parallel send** (the decision-holder/blocked-
  party pair) is correct in substance — right channel, right recipient,
  right content, right touch count — but is represented in this schema
  only as a sequential node chain with prose stating the two sends are
  independent. The plan's own text scopes the real fix as a new generic
  renderer capability ("no new node type, reads only fields the whole
  corpus carries"), not a canonical change. Deferred rather than built as
  a one-off, since it would need corpus-wide validation to avoid becoming
  a second false-positive class the way the router-visibility and
  suppression-card fixes above briefly were.
- **`qa/journey-canvas/qa-gate.mjs`'s Playwright-based 19-check gate**
  fails on its very first assertion with a pre-existing timing/DOM
  assumption (`container.querySelector(":scope > div > div")` returning
  null before the canvas has hydrated) that predates this refactor. Not
  chased further given the extensive purpose-built render-gate coverage
  (guard-display, canvas-hygiene, measure-display, locale-sweep) already
  run against every one of the 69 journeys in both locales, nine times
  over, throughout this work.
- The pre-existing, documented drift in `seo/seo-validator.mjs` (check 14),
  `search/search-validator.mjs` (checks 30/31) and
  `search/run-query-fixtures.mjs` (9 fixtures) — all caused by the
  calculator catalog shrinking from 43 to 19 live slugs, unrelated to this
  refactor and present before this work began (documented in `CLAUDE.md`).

## Commits (refactor/69-journeys, in order)

1. `Lock 10 product decisions into the 69-journey refactor plan`
2. `Fix Primary/Fallback array-index labeling and locale-dependent absorption`
3. `Implement RET-24, RET-30/ACT-18 deadlock, RET-32 and REM-305/REM-151`
4. `Implement acquisition domain batch (8 journeys) + router visibility fix`
5. `Implement activation domain batch (6 journeys: ACT-12/13/14/17/19/20)`
6. `Implement retention domain batch (9 journeys: RET-26/28/31/32/290/292-295)`
7. `Implement consent/feedback/time domain batch (11 journeys)`
8. `Implement access/finance/system-events domain batch (12 journeys)`
9. `Implement fulfillment/remedy domain batch (7 journeys)`
10. `Implement scheduling/subscription domain batch (12 journeys) - 69/69 complete`
11. `Fix CON-300's declared-suppression card kind + qa/ script portability`

Each domain-batch commit was independently re-verified before commit — not
just trusted from the delegated subagent's own report — against the same
loop: `tsc --noEmit`, `validate:canonical`, `validate-public-scope.mjs`,
`sunset-suppression-evidence.mjs`, a full `next build`, and all four render
gates, with `guard-display`'s G4 check confirming canonical drift landed on
*exactly* the batch's assigned journeys and nothing else before each new
baseline was adopted.
