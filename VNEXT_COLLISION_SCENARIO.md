# vNext collision scenario — executed on paper (Gate 3)

The architecture's §K names one scenario: within one hour, one person qualifies for
payment failure recovery, abandoned checkout recovery, cancellation save, a feedback
request and a generic promotion. This document runs that scenario against the
journeys as they now stand in `src/canonical/`, reading each journey's own `contact`,
`orchestration.noAction`, suppressions and send path, and records the outcome per
journey. Nothing here is a number; every outcome is a state the graph defines.

## The person, at T+0

| Fact | Source of the fact |
|---|---|
| A renewal charge on obligation O failed at T+0 | provider response, authoritative |
| A checkout C with items was opened at T−40 min, last activity T−35 min; the failed payment is **not** on C | checkout system of record |
| The person declared cancellation intent on subscription S at T+10 min, inside the product | declared |
| A support case on S completed at T−2 h and produced a feedback moment | experience record |
| A generic promotion (outside this library) is scheduled for the promotional class at T+30 min | company campaign calendar |

## Journey by journey

| Journey | Priority / class | What its own rules do at T+0..T+60 | Recorded outcome |
|---|---|---|---|
| **FIN-134** Payment Failure Recovery | `transactional` · pressure class `none` · touch `t1` **mandatory** | Failure class established from the provider response (`c.class`). The corrective request `t1` is mandatory: it bypasses pressure caps and competition, never hard gates. No hard gate applies (the account is open, no fraud hold). | **`t1` sends** on `in-session` (the person is in the product) — `a.corrective` |
| **ACQ-11** Abandoned Process Recovery (checkout C) | `promotional` · pressure class `promotional` · `commerce-recovery`, highest in group | `w.abandon` runs from `last_activity_at` (T−35) with `recovery.first_check` (example 30–60 min): it fires between T−5 and T+25. At `c.state` the process is still resumable. At `c.sendable` the send path reads suppression `s.contest`: an open payment recovery **on the same account** outranks this journey. The touch is deferred and re-evaluated against current state, not queued. | **`a.record-no-action` → `x.no-action`** with reason `s.contest` (GLB-06). If FIN-134 closes and C is still open inside `recovery.lifetime`, a re-evaluation would send `t1`; if C converted meanwhile, the deferred touch is a `no-action` — the recheck sees it. |
| **RET-28** Cancellation Save (subscription S) | `retention` · pressure class `lifecycle` · `retention-outreach`, above inferred risk; the cancel path is never obstructed | The intent is declared in-product, so `t-ask` goes `in-session` beside the cancellation step. Suppression `s.contest`: only the **offer step** yields to an open issue under human ownership; FIN-134 is automated, not human-owned, so nothing yields. `s.path`: the cancellation itself is never delayed by any contest. | **`t-ask` sends** in-session; if a reason is given and a genuine alternative matches, **`t-offer` sends** once; the person decides. |
| **FBK-41** Feedback Request (the completed case) | `lifecycle` · `outbound-ask` group | Eligibility reads "no unresolved issue exists in the same context". Suppression `s.open-issue`: an unresolved issue — an open payment recovery or complaint on the relationship counts — defers the ask entirely. FIN-134 is open on the relationship. | **`x.deferred`** (class `suppression`), recorded as the no-action reason `s.open-issue`. Resolution owns the person before satisfaction does. |
| Generic promotion (outside the library) | `promotional` class | Shares the promotional pressure class with ACQ-11. ACQ-11 is already `no-action` on `s.contest`, so the class cap is not contested by it. The promotion is governed by the company's own promotional cap and by GLB-04 ("more current state"): a recovery bound to an open checkout would outrank it if both were sendable. | Outside this library's graphs; **not sent by any journey here**. If the company's cap allows one promotional send, ACQ-11's deferral leaves the slot to it — and ACQ-11's `no_action_rate_by_reason` records why. |

## What the model guarantees, read off the outcomes

- Exactly one automated commercial-recovery touch was withheld, and the reason is a recorded `no-action` state (`s.contest`), which is what `no_action_rate_by_reason` measures.
- The mandatory transactional touch went out regardless of caps, and would still have gone out with every promotional and lifecycle journey suppressed.
- Nothing was queued blindly: ACQ-11 re-reads process state at every re-evaluation (`recheck` on every wait), so a deferred touch cannot fire against a converted checkout.
- The cancellation path was never obstructed; the only thing that can yield in RET-28 is the offer, and only to a human-owned issue.
- The satisfaction ask deferred on its own rule, not on a global ranking — `outbound-ask` ordering is policy, and FBK-41's `x.deferred` is its own exit.

## Not covered by this scenario

Backoff timing (operational side, OPS-124) and the `human-escalation-ladder` strategy (FBK-46) do not interact here: no issue in this scenario is human-owned. Both are exercised elsewhere in the Gate 3 set (see `VNEXT_MIGRATION_REPORT.md`).
