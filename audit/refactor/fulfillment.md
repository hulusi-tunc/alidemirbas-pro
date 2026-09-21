# Phase 1 audit — Fulfilment & Remedy

**Scope:** the 8 public journeys in the fulfilment / remedy arc —
`FUL-301` `FUL-265` `FUL-146` `FUL-148` `FUL-291` `REM-305` `REM-151` `REM-157`.

**Source:** `audit/public-journeys-current-state.json` (canonical + rendered display state,
read-only), cross-read against `audit/51-journey-design-matrix.md`, `audit/patterns.md`,
`audit/glossary.md` and `src/components/ui/JourneyCanvasNodes.tsx` for the render facts.
Nothing here was authored from the matrix alone; every canonical claim below was re-read
out of the export.

This file is the only thing this audit writes. No source file, canonical journey or
component was modified.

---

## 0 · What the eight journeys actually are

They are not eight variations on "tell someone about their order". They are the **states of
one obligation**, told by four different subjects:

| Subject | Journey | The fact it owns |
|---|---|---|
| the record | **FUL-301** | what the business took on, and what it did not |
| the movement | **FUL-265** | it left, it moved, it arrived — or it did not |
| the timing | **FUL-146** | the commitment slipped, and the original commitment is still visible behind the new estimate |
| the attempt | **FUL-148** | an attempt was made and failed, and why |
| the thing itself | **FUL-291** | it is here; this is what to do with it |
| the request | **REM-305** | it arrived, it is owned, it is not lost |
| the problem | **REM-151** | is an obligation actually unresolved? |
| the obligation | **REM-157** | which remedy satisfies it |

That is the diversity requirement satisfied by business fact rather than by quota, and it is
why the eight land on six different patterns below and on touch counts of 1, 1, 1, 2, 2, 2, 2, 3.

---

## 1 · The finding that spans all eight

**Every customer-facing card in this domain renders as `Primary X / Fallback Y`. Not one of
them is a fallback.** 14 of 14 communication actions across the eight journeys.

The cause is in the renderer, not the data. `ChannelPriorityRow`
(`src/components/ui/JourneyCanvasNodes.tsx:251-280`) labels row index 0 `Primary` and
**every other row `Fallback`, by position**:

```
{i === 0 ? w.primary : w.fallback}
```

It is handed `FlowNode.channelPlan`, which is `{ role, channels }[]` joined from
`Touch.channelRoles` × `channelStrategy.roles` (`src/lib/canonical-view.ts:282-292`) — so the
**role name is already in scope and is thrown away**. What the corpus authors is a set of
*selection conditions*, one per role:

| role | the condition the data actually states |
|---|---|
| `persistent` (email) | "the message has to be kept and survive until the person can act on it" |
| `urgent` (sms) | "an asserted time bound lies inside the urgent horizon **and** permission for messages on this channel is recorded" |
| `in-session` (in-app) | "the person is active in the product and the action is taken there" |
| `low-friction` (push) | "a current device registration exists and the permission covering it still stands" |

None of those is "email failed, try SMS". Email is never unavailable. The genuine fallback in
this corpus lives *inside* a role and is named by a different field —
`channelStrategy.fallback: "same-role-other-channel"` (7 of my 8) or `"next-eligible-role"`
(FUL-291) — and it is the field the card never reads.

**Renderer fix (generic, corpus-wide, no journey ids):** label each row with its own role,
from a bilingual `ROLE_LABEL` table alongside `CHANNEL_LABEL`, and reserve *Fallback / Yedek*
for the second channel **within** one role, shown only where `channelStrategy.fallback` is
`same-role-other-channel` and that role carries more than one channel. Suggested labels:

| role | EN | TR |
|---|---|---|
| persistent | Kept | Kalıcı |
| urgent | Time-critical | Zaman kritik |
| in-session | In product | Ürün içinde |
| low-friction | Nudge | Hafif bildirim |

So FUL-301's confirmation card stops reading *"Primary Email · Fallback SMS · Fallback In-app"*
and starts reading *"Kept — Email · Time-critical — SMS · In product — In-app"*, which is what
its data says. Both `audit/glossary.md` rows (`Primary/Öncelikli`, `Fallback/Yedek`) need the
same-commit update, and the role condition prose belongs in the detail panel, one line per row.

This is the single highest-value change in my scope and it is one component edit.

---

## 2 · The three known data defects — verified

### 2.1 FUL-146 and FUL-148 have zero exit nodes — **confirmed**

`terminalStates` is an **empty array** on both. Every ending in both graphs is `kind: "handoff"`.

- **FUL-146** — 4 handoffs: `h.resume`→FUL-144, `h.exception`→FUL-145, `h.cancel`→FUL-150,
  `h.escalate`→OWN-55. `isPublicDestination: false` on **all four**, so per
  `src/lib/public-corpus.ts` every one of them renders as plain text and never as a link.
  `measurement.journeyOutcome.type` is `"handoff"`, refs are the four handoffs.
- **FUL-148** — 3 handoffs: `h.retry`→FUL-147 (private), `h.return`→REM-151 (**public**),
  `h.exception`→FUL-145 (private). `measurement.journeyOutcome.type` is `"handoff"`.

A reader opening FUL-146 therefore sees a journey with **no ending and no continuation** —
four dead cards naming journeys they cannot open. FUL-148 has one openable card out of three.

**What the terminal state should be.** The design matrix's option (b) — "add terminal exits" —
is right in principle and wrong in bulk: three of FUL-146's four handoffs and two of FUL-148's
three are genuine transfers of ownership and must stay handoffs. But **one ending in each is
not a transfer at all**, and that one is the journey's most common and most successful path:

- **FUL-146 · `h.resume` → `x.resumed`** (class `success`).
  *"The delay closed. The obligation resumed and was carried to completion by the execution
  that never stopped owning it."* FUL-144 Fulfillment Execution did not *take over* — it was
  running the whole time; FUL-146 is a narrative that ran beside it and has now ended. Handing
  back to something that never handed over is not a handoff. Carry the commitment history to
  the execution record as a write, not as an ownership transfer.
- **FUL-148 · `h.retry` → `x.reattempt-scheduled`** (class `success`).
  *"The failed attempt was recovered: a further attempt is scheduled against the remaining
  budget, and delivery tracking carries it from here."* FUL-148's entity key is
  `delivery_attempt_id` — one attempt. When a new attempt is scheduled, **this instance's
  subject has ceased to exist**; a new attempt is a new entity and, if it fails, a new
  instance. That is an exit, not a transfer.

Leave `h.exception` (FUL-145), `h.cancel` (FUL-150), `h.escalate` (OWN-55) and `h.return`
(REM-151) as handoffs — each moves the obligation to a different owner with a different
subject, and duplicating their state as exits would be the error the matrix warns about.

Result: FUL-146 goes 0 exits → 1 exit + 3 handoffs; FUL-148 goes 0 → 1 exit + 2 handoffs,
`measurement.journeyOutcome.type` becomes `"exit-or-handoff"` on both, and every journey in
this domain visibly terminates.

### 2.2 FUL-265 `x.unresolved` is a handoff wearing an exit's id — **confirmed**

```
x.unresolved  kind: "handoff"  to: "FUL-148"  (isPublicDestination: true)
measurement.journeyOutcome.refs = ["x.unresolved","x.delivered","x.accepted","x.finalized","h.issue"]
```

The id sits in the `x.` namespace beside three real exits inside one refs array, and the
handoff's own `carries` block mints a fresh `delivery_attempt_id`. Any consumer keying off the
prefix reads the Stop cell and the Handoff cell as the same thing.

**Take option (a): rename to `h.no-arrival`.** Not `h.unresolved` — the node is reached from
two different places (`c.delivery` "Not delivered", and `w.delivery` timeout via `a.no-arrival`)
and both mean *it did not arrive*, which is also what the card should say. Update the one
`measurement.journeyOutcome.refs` entry in the same edit. No display or renderer change
follows; the card already renders correctly as a Handoff because the layout reads `kind`.

### 2.3 A defect nobody has recorded: FUL-265 turns a delay into a failed delivery

`w.delivery.until` is `["delivery_confirmed","delivery_failed","delivery_delay_reported"]` —
**three** events. `c.delivery`, the condition the wait feeds, has **two** branches:
*Delivered* and *Not delivered*. There is no branch for `delivery_delay_reported`, so an
in-transit slip falls into *Not delivered* → `a.no-arrival` → handoff to **FUL-148 Failed
Delivery Recovery**.

This collides head-on with FUL-146's `s.g5`, which deliberately refuses to open a delay
narrative for an in-transit slip *because FUL-265 is said to be tracking it*:

> "Once the obligation is handed to a delivery executor, an in-transit slip on the same
> obligation is FUL-265's delay-or-tracking state to hold and report."

FUL-265 holds no such state. So a parcel that is simply running a day late is told "it has not
arrived — this is a confirmed failure or an executor we have lost sight of" and is opened as a
failed-delivery recovery case. The one-sided eligibility clause the design matrix praises
(item 15, option (b)) is pointing at a state that does not exist.

**Fix — a documented bounded loop, which is the shape this genuinely is:**

add a third branch to `c.delivery`, *"A revised window was reported"* → new communication
action `a.revised` → back to `w.delivery`, re-armed against the executor's revised window.
Bound it with a new required `Config`, `dispatch_to.revisions`, default **1**: one revision
notice per dispatch. A **second** revision is treated as an executor who cannot hold a window
and takes the existing `h.no-arrival` route to FUL-148. That satisfies "every journey
terminates or has a documented bounded loop", gives FUL-146's `s.g5` a real counterparty, and
stops a late parcel becoming a recovery case.

Cost: it takes FUL-265's worst-case path to **4 touches** (dispatch · revised window · arrived ·
acceptance request). That is the brief's documented exception — an entity whose state genuinely
changed over time, where each message states a different authoritative fact and none repeats
another. Capping revisions at one is what keeps it from becoming a drip.

---

## 3 · Per-journey sections

### FUL-301 · Order Confirmation
`/lab/journeys/order-confirmation` · 11 canonical / 9 display nodes

**Purpose.** State once, at the moment the fulfilment record opens, exactly what the business
has taken on and what it has not — the question every later message about this order assumes
has already been answered.

**Current flow.**
```
Trigger fulfillment_obligation_accepted
  → Decision: does the accepted obligation still stand, and what does it cover?
      ├ Accepted in full ─┐
      ├ Accepted in part ─┴→ [hidden gate: may the confirmation go out?]
      │                         ├ Sendable → Confirmation (email · sms · in-app)
      │                         └ No route → [record reason] → x.no-action (not drawn)
      └ Nothing stands → Exit: nothing to confirm
  Confirmation → Wait (order_confirmation.record_window; until handed-to-executor OR cancellation-effective)
      ├ on timeout → Exit: confirmed
      └ on event → Decision: what became of the order?
            ├ It started moving → Exit: confirmed
            └ Cancelled before it moved → Handoff FUL-150
```

**Problems found.**
1. The `Primary / Fallback` chips (§1). Here they are actively misleading: SMS on a
   transactional confirmation is conditioned on *"the accepted obligation carries a time-bound
   action the person has to take"* — a collection slot, a confirmation the person owes back.
   Calling that a fallback for email invites an implementer to fire SMS whenever email bounces.
2. **The EN wait card reads `"Until a prepared item"`.** Nonsense — the TR card on the same
   node reads correctly (*"Sipariş harekete geçene ya da iptal edilene kadar"*). The EN label
   derivation is producing a phrase from something other than the wait's own `Config` rule.
   This is the one EN-side counterpart of the TR truncations in §4 and the locale sweep cannot
   see it, because English prose on an English route is not a leak.
3. Nothing else. This journey is the reference implementation of the domain.

**Final orchestration — Single, with conditional channel selection, and one event-or-timeout
observation window.** Why that one: there is exactly one thing to say and exactly one moment at
which it is true. There is no sequence because a second message would read as a second order
(`s.once`); there is no fallback because no channel is unavailable; the three channels are three
*situations*, selected conditionally, not three attempts. The trailing wait sends nothing — it
exists only to decide which of two endings the record reached, which is why it is an observation
window and not a send cadence.

**Final customer channels.** Email (`persistent`, the default and the record they keep) ·
SMS (`urgent`, **only** where the accepted obligation carries a time-bound action the person has
to take and permission on that route is recorded) · In-app (`in-session`, where the order was
placed inside the product).

**Customer touch count — 1.** `mandatory: true`, `pressureClass: "none"`,
`order_confirmation.discretionary_touches` = **0**. Unchanged.

**Final flow.** As above, with the chip labels and the EN wait label corrected. **No node is
added, removed or re-routed.**

**How FUL-301 was kept simple — the explicit do-not list.**
- No second touch, no reminder, no "your order is being prepared", no post-purchase marketing,
  no cross-sell, no review request. Six authored suppressions already forbid all of it
  (`s.accepted` `s.record` `s.partial` `s.once` `s.status` `s.marketing`) and none is relaxed.
- No exclusion-group change. It is and stays **highest in `post-purchase-welcome`**, with
  `onLoss: "suppressed"`, so FUL-291 and RET-290 wait behind it. Verified in its own
  `contact.competition.precedence` and reciprocally in FUL-291's.
- The `Accepted in full` / `Accepted in part` branches are **not** split into two message cards.
  They already merge onto one display edge (*"Accepted in full · Accepted in part"*) because
  both go to the same node. The split changes what the message *says* — a declined scope must be
  stated in the same message (`s.partial`) — and not where the customer goes. Content, not path.
  Keep the merge.
- `c.sendable` stays hidden. It is the textbook Family-C implementation gate: its short arm
  passes through a bookkeeping hop (`a.record-no-action`) before exiting, which is the corpus's
  own signal for "may the touch go out?" rather than a business question.

**State re-checks.** One, and it is enough: `w.stands.recheck` re-reads the fulfilment record and
any cancellation against it from the systems that own them, before the timeout is acted on.

**Stop conditions.** `fulfillment_cancellation_effective` at any point → `x.void` before the send,
`h.cancelled` after it. `fulfillment_handed_to_delivery_executor` → `x.confirmed`; from that
instant FUL-265 owns the narration and this journey is silent forever.

**Ownership / handoff.** Highest in `post-purchase-welcome`; never itself deferred (transactional).
One handoff, `h.cancelled` → FUL-150 (private). `distinctFrom` FUL-265, FUL-146, FUL-291, RET-290,
FIN-131 — all five present and all five correct.

**Canonical changes needed — none.**
**Display-only changes needed — none.**
**Renderer changes needed.** §1 role labels; fix the EN wait-label derivation (§4.1).

---

### FUL-265 · Delivery Tracking
`/lab/journeys/dispatch-to-acceptance` · 16 canonical / 15 display nodes

**Purpose.** Carry the recipient from "it left our hands" to "they agree it was discharged
correctly" — because arriving and being agreed to have arrived correctly are two different facts,
and only one of them has a recipient as its source.

**Current flow.**
```
Trigger obligation_handed_to_delivery_executor
  → Dispatch notice (email · sms)
  → Wait (dispatch_to.delivery; until delivery_confirmed | delivery_failed | delivery_delay_reported)
      ├ on timeout → No-arrival notice (email · sms) → x.unresolved [HANDOFF FUL-148]
      └ on event → Decision: what did the executor authoritatively report?
            ├ Delivered → Arrived notice (email · sms)
            │     → Decision: does acceptance carry any consequence here?
            │         ├ Acceptance is meaningful → Acceptance request (email · sms)
            │         │     → Wait (dispatch_to.acceptance; until accepted | issue_raised)
            │         │         ├ on event → Decision: what did the recipient say?
            │         │         │     ├ Accepted → Exit: accepted by the recipient
            │         │         │     └ Issue raised → Handoff FUL-149
            │         │         └ on timeout → [record] → Exit: finalised on expiry
            │         └ Delivery is the end of it → Exit: delivered
            └ Not delivered → No-arrival notice → x.unresolved [HANDOFF FUL-148]
```

**Problems found.**
1. **The delay hole (§2.3).** `delivery_delay_reported` wakes the wait and has nowhere to go.
2. **`x.unresolved` is a handoff with an exit's id (§2.2).**
3. **All four touches carry the identical `persistent + urgent` pair.** This is the domain's
   clearest instance of the brief's core failure: four messages about four different facts, each
   given the same channel treatment, because the treatment was set once on the journey and not
   per moment. A dispatch notice is not urgent. A non-arrival is.
4. TR truncation on `w.delivery`: *"Teslimat yürütücü"* (§4.1).

**Final orchestration — Sequential, with a conditional routing point at the executor's report,
a bounded revision loop, and two event-or-timeout windows.** Justified at 3 touches (4 with a
revision) because each states a **different authoritative fact about a different moment**: it
left, the window moved, it arrived (or did not), and silence from this date counts as acceptance.
None repeats another, and the acceptance request is sent only where acceptance carries a
consequence. Not fallback: no channel here substitutes for another.

**Final customer channels — decided per touch, which is the whole point.**

| touch | channels | why |
|---|---|---|
| t1 dispatch notice | **Email only** | A status update is not urgent. Nothing is asked of the person, the tracking reference has to be keepable, and an SMS here is the message that teaches people to ignore this sender. **SMS removed.** |
| t1b revised-window notice *(new)* | Email + **SMS** where the revised window is inside the urgent horizon and permission is recorded | The customer's day has changed. This is the brief's real SMS case. |
| t2a arrived notice | **Email only** | Good news with evidence attached, to be kept and contradicted if wrong. Not urgent. **SMS removed.** |
| t2b no-arrival notice | Email + **SMS** | The thing that was promised for today is not coming. Consequence for the day, and the person may need to act. **SMS earns its place.** |
| t3 acceptance request | Email + **SMS** where the acceptance deadline falls inside the urgent horizon | A deadline with a real consequence: silence becomes acceptance. Email carries what "accepted" means; SMS carries the date. |

**Customer touch count — 3 normally, 4 on a revised window** (`dispatch_to.revisions` = 1).
Raise `contact.localCap` 3 → 4 with the revision as its stated reason.

**Final flow.**
```
Trigger obligation_handed_to_delivery_executor
  → Dispatch notice (Kept: email)
  → Wait (dispatch_to.delivery; until confirmed | failed | delay_reported)
      ├ on timeout ─────────────────────────────┐
      └ on event → Decision: what did the executor authoritatively report?
            ├ A revised window was reported → Revised-window notice (email · sms if urgent)
            │      → back to Wait, re-armed on the revised window   [bounded: dispatch_to.revisions = 1]
            ├ Delivered → Arrived notice (email) → Decision: does acceptance carry a consequence?
            │        ├ Acceptance is meaningful → Acceptance request (email · sms if the deadline is near)
            │        │      → Wait (dispatch_to.acceptance) → Accepted / Issue raised→FUL-149 / Finalised on expiry
            │        └ Delivery is the end of it → Exit: delivered
            └ Not delivered ──────────────────────┤
                                                  └→ No-arrival notice (email · sms)
                                                        → Handoff h.no-arrival → FUL-148
```

**State re-checks.** Both waits already re-read the dispatched obligation from the system of
record before acting on a timeout. The re-armed wait must re-read on **each** re-arm, and the
revision counter must be read from the instance and not from the event.

**Stop conditions.** `delivery_accepted` → `x.accepted`. `delivery_issue_raised` → FUL-149.
Acceptance window expiry → `x.finalized`, kept forever distinguishable from `x.accepted`
(`s.g5`). A second revision or a confirmed non-arrival → FUL-148.

**Ownership / handoff.** No exclusion group, and it does not need one: its boundary with FUL-146
is a one-sided eligibility clause on each side (FUL-146 `s.g5` cedes in-transit slips here;
FUL-265 `s.g6` cedes pre-dispatch slips there), which is the pattern the design matrix records as
working. §2.3 is what makes that clause true rather than aspirational. Handoffs: `h.no-arrival`
→ FUL-148 (public, links), `h.issue` → FUL-149 (private, text).

**Canonical changes needed.**
- Rename `x.unresolved` → `h.no-arrival`; update `measurement.journeyOutcome.refs`.
- `c.delivery`: add branch *"A revised window was reported"*, `observes: "delivery_delay_reported"`.
- New action `a.revised`, `execution: "communication"`, target `w.delivery`.
- New `Config` `dispatch_to.revisions` (`required: true`), and the revision-count read on
  `w.delivery`'s re-arm.
- `orchestration.touches`: add `t1b` (stage `revised-window`) with
  `destination.mustNotClaim: ["a window the executor has not actually committed to"]`; drop the
  `urgent` role from `t1` (dispatch) and `t3` (arrived); keep it on `t2` (no-arrival) and
  `t4` (accept-request).
- `contact.localCap` 3 → 4, reason stated.
- New suppression: *"A revised window is stated once. A second revision is not a third
  narrative — it is an executor who cannot hold a window, and the obligation moves to recovery."*

**Display-only changes needed.** None. The bounded loop must be **drawn** — a back edge to the
wait is a real path, and hiding it would erase the journey's only loop.

**Renderer changes needed.** §1 role labels; the `w.delivery` TR truncation (§4.1).

---

### FUL-146 · Delivery Delay Alert
`/lab/journeys/fulfillment-delay` · 19 canonical / 16 display nodes

**Purpose.** Hold lateness as its own state, with the original commitment intact behind whatever
the new estimate is.

**Current flow.**
```
Trigger expected_fulfillment_timing_slipped
  → [assess: original commitment, current estimate, cause, scope, impact; record DELAYED]
  → Decision: is there a reliable new completion estimate?
        ├ A reliable estimate → [update timing, append to commitment history]
        └ No reliable estimate → [record that none exists rather than issuing one]
  → Decision: does the changed timing alter what the recipient should plan around?
        ├ It changes their plans → Delay update (email · sms)
        └ No material change for them ─────────────┐
  Delay update → Decision: does the delay exceed the acceptable threshold?
        ├ Within tolerance → Wait (fulfillment_delay.resume)
        └ Beyond tolerance → Decision: does the counterparty have a decision to make?
              ├ They choose → Offer (email · sms) → Wait (fulfillment_delay.decision)
              │     ├ on event → Decision: what did they choose?
              │     │     ├ Wait → Wait(resume) · Reschedule → [record] → Wait(resume)
              │     │     ├ An alternative → Handoff FUL-145 · Cancel → Handoff FUL-150
              │     └ on timeout → Wait(resume)
              └ Nothing to offer → No-choice update (email · sms) → Handoff OWN-55
  Wait(resume): on event → Handoff FUL-144 · on timeout → Handoff OWN-55
```

**Problems found.**
1. **Zero exits (§2.1).** Four handoffs, all private, none of them a link.
2. **A customer can be offered a decision about a delay they were never told about.**
   `c.recipient-impact` "No material change for them" routes to `c.threshold`, which can go
   *Beyond tolerance* → `c.choice` → **Offer**. The first thing that person hears about the
   delay is *"would you like to wait, reschedule, take an alternative, or cancel?"* — a question
   with no stated subject. This is a live logic defect, not a presentation one.
3. **All three touches carry the identical `persistent + urgent` pair**, including the
   no-choice/escalation update — a message that tells the person there is nothing they can do.
   An SMS that raises the alarm and offers no action is the worst use of the channel in this
   whole domain.
4. `observes` is empty on all four conditions (this journey predates the field).
5. TR: `h.escalate` renders the target's **full title** *"Sorumluluk yükseltme → üst merci →
   çözüm veya iade"* where EN renders the short name *"Ownership Escalation"* (§4.2).

**Final orchestration — Conditional routing, with one event-or-timeout decision window and a
bounded resume watch.** The routing point is real and must stay drawn: *does the counterparty
have a decision to make?* changes whether the second message is an offer or a statement, and
those are different messages to different people. Not sequential — the second touch is not a
follow-up to the first, it is a different branch. Not fallback.

**Final customer channels — per touch.**

| touch | channels | why |
|---|---|---|
| t1 delay update | Email + **SMS** where the original commitment was a date or window the person planned around and the new bound is inside the urgent horizon | This is the brief's genuine SMS case: a delay with a real consequence for the customer's day. |
| t3 offer (wait / reschedule / alternative / cancel) | **Email**, with SMS as a pointer only where `fulfillment_delay.decision` is itself inside the urgent horizon | Four options with consequences have to be read and compared. SMS cannot carry them; it can only say "you have a choice to make, by Friday". |
| t2 no-choice / escalation update | **Email only.** **SMS removed.** | Nothing is being asked. The message's content is "there is no option and we are escalating rather than dropping it". An urgent-channel alarm with no action attached spends trust and returns nothing. |

**Customer touch count — 2** on any one path (delay update, then offer *or* no-choice update).
`localCap` stays 2.

**Final flow.**
```
Trigger expected_fulfillment_timing_slipped
  → [assess · absorbed]
  → Decision: is there a reliable new completion estimate?   (both arms → same next step)
  → Decision: does the changed timing alter what the recipient should plan around?
        ├ It changes their plans → Delay update (Kept: email · Time-critical: sms)
        │      → Decision: does the delay exceed the acceptable threshold?
        │            ├ Within tolerance → Watch for resumption
        │            └ Beyond tolerance → Decision: does the counterparty have a decision to make?
        │                  ├ They choose → Offer (email; sms pointer if the window is short)
        │                  │     → Wait (fulfillment_delay.decision)
        │                  │        ├ Wait / Reschedule → Watch for resumption
        │                  │        ├ An alternative → Handoff FUL-145
        │                  │        ├ Cancel → Handoff FUL-150
        │                  │        └ on timeout → Watch for resumption
        │                  └ Nothing to offer → No-choice update (email) → Handoff OWN-55
        └ No material change for them → Watch for resumption          ← CHANGED
  Watch for resumption  (Wait, fulfillment_delay.resume)
        ├ fulfillment_resumed_or_completed → EXIT x.resumed           ← NEW
        └ on timeout → Handoff OWN-55
```

**State re-checks.** Both waits re-read the obligation and its timing commitment from the system
of record before acting on a timeout. Add one before the offer: the offer must not present
*cancel* or *reschedule* on an obligation that resumed while `c.choice` was being evaluated.

**Stop conditions.** `fulfillment_resumed_or_completed` → `x.resumed`, immediately, from anywhere
in the resume watch. A counterparty choosing an alternative or a cancellation moves ownership on
the choice itself. The revised horizon expiring escalates rather than looping.

**Ownership / handoff.** No group; the boundary that matters is with FUL-265 and it is carried by
`s.g5` + FUL-265's `s.g6`. **After §2.3 that clause finally points at something real.**
Handoffs after the change: FUL-145, FUL-150, OWN-55 (all private, all text). One exit.

**Canonical changes needed.**
- `h.resume` → **exit `x.resumed`**, class `success`, with `reEntry` ("a later slip against the
  revised commitment opens its own instance") — §2.1. `measurement.journeyOutcome.type` →
  `exit-or-handoff`.
- `c.recipient-impact` branch *"No material change for them"*: retarget `c.threshold` → `w.resume`.
  What it was doing: routing a customer who was told nothing into a branch that could offer them a
  decision. Why it does not change treatment: if the slip does not alter what the recipient plans
  around, there is nothing to offer them either — watch for resumption and escalate on the horizon.
- Drop the `urgent` role from touch `t2` (no-choice-update).
- Populate `observes` on the four conditions (`c.estimate`, `c.recipient-impact`, `c.threshold`,
  `c.choice`) — the vNext contract expects it and its absence is why the Family-B looser reading
  could not be shipped.

**Display-only changes needed.** None. `c.estimate`'s two arms converge on the same next step and
**should not** be collapsed — "we have a new date" and "we honestly do not have one" is the
journey's own thesis (`s.g2`) and changes the message's content entirely.

**Renderer changes needed.** §1 role labels; the TR handoff-name leak (§4.2).

---

### FUL-148 · Failed Delivery Recovery
`/lab/journeys/delivery-attempt-failure` · 15 canonical / **18** display nodes

**Purpose.** Recover a failed delivery according to why it failed, within a bounded number of
attempts.

**Current flow.**
```
Trigger authoritative_delivery_attempt_failure
  → [classify into the class the executor actually reported]
  → Decision: what kind of failure was it?
        ├ Correctable information needed → Correction request (email · sms)
        │     → Wait (delivery_attempt.correction)
        │         ├ on event → Decision: is a reattempt available within the bounded policy?
        │         └ on timeout → Handoff REM-151
        ├ A reattempt is safe ─────┐
        ├ No usable reason given ──┴→ Decision: is a reattempt available?
        │         ├ Attempts remain → Decision: would an alternative route serve better?
        │         │     ├ Policy authorises it → [use alternative route] → Handoff FUL-147
        │         │     ├ The recipient's to choose → Route offer (email · sms)
        │         │     │      → Wait (delivery_attempt.route_choice)
        │         │     │          ├ Selected → [alternative route] → Handoff FUL-147
        │         │     │          ├ Declined all → Handoff REM-151
        │         │     │          └ on timeout → [reattempt] → Handoff FUL-147
        │         │     └ Reattempt the same route → [reattempt] → Handoff FUL-147
        │         └ Exhausted → Handoff REM-151
        ├ The recipient refused it → Handoff REM-151
        └ Damaged → Handoff FUL-145
```

**Problems found.**
1. **Zero exits (§2.1).**
2. **18 display cards for a 2-touch journey** — `h.return` is instanced 4× and `h.retry` 2×
   (6 shared-terminal instances). The per-parent instancing rule is working exactly as designed
   (it keeps each branch's ending beside the branch), but the *effect* here is a canvas where a
   third of the cards are the same handoff repeated. Converting `h.retry` to `x.reattempt-scheduled`
   fixes half of it and the rest should be left alone rather than special-cased.
3. `c.class` has **five** branches, two of which (*A reattempt is safe*, *No usable reason given*)
   go to the same node. That is honest authoring — `s.g4` forbids inventing a reason — and the
   display already merges the edge. Keep.
4. `distinctFrom` is **empty**. FUL-148 is handed cases by FUL-265 and hands them to REM-151, and
   it states its boundary with neither.
5. TR: `w.route-choice` reads *"Alıcı bir alternatif güzergâh seçene"* — missing *"kadar"*, so the
   Turkish sentence stops mid-clause (§4.1).

**Final orchestration — Conditional routing on the failure class, with two event-or-timeout
windows.** The routing point is the journey's entire reason to exist: *refused* is a decision by
the recipient and *unavailable* is an absence, and `s.g3` exists because treating the first as the
second keeps redelivering to someone who has already said no. It must stay drawn, all five
branches. Not sequential: the correction request and the route offer are alternatives on different
failure classes, never a cadence.

**Final customer channels — per touch.**

| touch | channels | why |
|---|---|---|
| t1 correction request | Email + **SMS** | The clearest SMS case in the domain. A reattempt window is running, the person must supply one concrete thing (a door code, an access instruction, a corrected address), and the message is short by nature. Email carries *what* is missing; SMS carries *that it is* and by when. |
| t2 route offer | **Email**, SMS as a pointer where `delivery_attempt.route_choice` is short | Concrete alternatives — a collection point, a different window, another executor — have to be compared, and the message must also state that the attempt budget does not reset either way. That is an email. |

**Customer touch count — 2.** `localCap` stays 2.

**Final flow.** As current, with `h.retry` → **`x.reattempt-scheduled`** at both instancing sites
and the channel changes above.

**State re-checks.** Both waits re-read the attempt and its obligation before acting on a timeout.
One more is needed and is currently missing: **`c.budget` must be re-read after `w.correction`
returns**, because the bounded budget may have been spent by a parallel attempt while the
correction was outstanding. The edge already routes `w.correction` on-event into `c.budget`, so
the re-check is a `recheck` string on the wait rather than a new node.

**Stop conditions.** The policy attempt limit being reached ends recovery at REM-151, not at a
further attempt (`s.g2` — the budget does not reset). A recipient declining every alternative ends
it the same way. `delivery_correction_provided` moves it forward rather than stopping it.

**Ownership / handoff.** After the change: one exit (`x.reattempt-scheduled`), two handoffs —
REM-151 (public, links, mints a fresh `issue_id` because FUL-148 has no issue concept) and
FUL-145 (private, text).

**Canonical changes needed.**
- `h.retry` → **exit `x.reattempt-scheduled`**, class `success` (§2.1), with `reEntry` ("a further
  attempt that also fails opens its own instance against its own `delivery_attempt_id`"). The
  `carries` block currently on the handoff (attempt history, remaining budget, correction or route
  change applied) becomes a `writes` on `a.alternate` / `a.reattempt`.
  `measurement.journeyOutcome.type` → `exit-or-handoff`.
- Drop the `urgent` role from touch `t2` (offer-route), or condition it explicitly on the
  route-choice window being inside the urgent horizon.
- Add `recheck` to `w.correction` naming the attempt budget.
- Add `distinctFrom` rows: **FUL-265** ("FUL-265 reports what the executor says about an obligation
  in motion; this opens on a single attempt that is already known to have failed, and its subject
  is the attempt, not the obligation") and **REM-151** ("REM-151 asks whether an obligation is
  unresolved after something was delivered; this runs while nothing has been delivered at all and
  a further attempt is still possible").
- Populate `observes` on `c.class`, `c.budget`, `c.alternate`, `c.route-answer`.

**Display-only changes needed.** None.
**Renderer changes needed.** §1 role labels; the `w.route-choice` TR truncation (§4.1).

---

### FUL-291 · Post-Purchase Follow-Up
`/lab/journeys/post-purchase-follow-up` · 10 canonical / 6 display nodes

**Purpose.** Once what was owed has actually arrived, send the one thing that makes it useful —
how to start with it, how to look after it, what sensibly follows — and nothing else.

**Current flow.**
```
Trigger authoritative_delivery_completion
  → Wait (post_purchase_followup.settle; abort on post_completion_issue_reported | permission_withdrawn)
  → Decision: is a follow-up still the right thing to send?
        ├ Follow-up due → [hidden gate: may it go out?]
        │      ├ Sendable → Useful next step (email · in-app · push) → Exit: followed up
        │      └ Nothing to say, or suppressed → [record] → x.no-action (not drawn)
        ├ A problem is open → Exit: superseded by a problem
        └ No longer reachable → Exit: closed without a follow-up
```

**Problems found.**
1. **Push does not belong here.** The message's entire value is that it is *keepable and
   returnable-to* — setup instructions, care guidance, what sensibly follows. Push is transient by
   construction and cannot carry any of it; the `in-session` role already covers "the next step is
   taken inside the product". Push is present because the role existed, which is the brief's named
   failure mode. Three roles and `fallback: "next-eligible-role"` also make this the one journey
   in my scope whose chips read as a three-step ladder.
2. **A display defect on the collapsed wait.** `c.state`'s EN card reads
   *"Until a concrete problem with a completed fulfillment · Decision: is a follow-up still the
   right thing to send?"*. The Family-B duration strip is rendering the description of one of the
   wait's **abort** events (`post_completion_issue_reported`) as if it were the wait's duration.
   The wait is *"until the delivery has settled"* (`post_purchase_followup.settle`). The card
   currently tells the reader the journey waits for a problem to be reported — the exact opposite
   of `s.issue`. The TR card has the same shape with the correct text, so this is EN-side.
3. Nothing else. The rest of this journey is excellent: `s.substance` ("where nothing useful is
   recorded against what was delivered, nothing is sent") is the best-authored suppression in the
   domain, and `s.rating` keeps FBK-41 out.

**Final orchestration — Single.** One touch, one moment, one decision before it. There is no
sequence, no fallback, no conditional routing between channels that changes the path. A journey
may legitimately be `Trigger → Wait → Decision → Email → Exit`, and this is one of them.

**Final customer channels.** Email (`persistent`, the default — guidance has to be kept and
returned to) · In-app (`in-session`, where the next step is taken inside the product).
**Push removed.**

**Customer touch count — 1.** `localCap` stays 1; the required `post_purchase_followup.cooldown`
stays (completions landing close together produce one follow-up, not one each).

**Final flow.** As current, minus push, with the wait card corrected.

**State re-checks.** `w.settle.recheck` re-reads the fulfilment record, any problem raised against
it, and the person's permission, from the systems that own them — before the one and only send.
That is the model re-check in this corpus and nothing needs adding.

**Stop conditions.** `post_completion_issue_reported` ends the instance at `x.superseded` the
instant it arrives — the remedy lifecycle owns the completion and this journey does not queue
beside it. `permission_withdrawn` → `x.closed`. Nothing useful recorded against what was
delivered → nothing sent (`s.substance`).

**Ownership / handoff — and the boundary with RET-290, stated from my side.**

FUL-291 sits **below FUL-301 and above RET-290** in `post-purchase-welcome`, `scope: person`,
`onLoss: suppressed`. All three sides are declared in the data and agree.

The boundary with RET-290 First Purchase Thank You, from FUL-291's side:

- **Different subject.** FUL-291's subject is *the thing that arrived*. RET-290's subject is
  *the person having become a customer*. FUL-291 never says welcome, never offers a bounceback,
  never mentions the relationship; RET-290 never explains the product.
- **Different trigger and different entity.** FUL-291 opens on `authoritative_delivery_completion`,
  keyed `person_id + fulfillment_id`, and fires on **every** completion. RET-290 opens on
  `first_purchase_completed` and fires **once per person, ever**. On a physical order these are
  naturally days apart, so the group precedence rarely bites at all; it bites on a service or
  digital completion that settles at the moment of purchase, and there FUL-291 goes first because
  what somebody is already holding comes before what they might buy next.
- **Different failure mode.** FUL-291's failure is guidance landing before the thing does, which is
  why it waits for settlement. RET-290's failure is a bounceback spent on somebody who was about to
  buy anyway, which is why it re-checks for a second purchase.
- **They are not variants and must not be merged.** A completion that is also a first purchase
  produces two messages about two different things, ordered, not one message about both.

No handoffs. A problem ends this journey rather than being passed on — the remedy lifecycle opens
from its own event.

**Canonical changes needed.** Remove the `low-friction` role from touch `t1`; drop `push` from
`channelsDeclared`; `channelStrategy.fallback` becomes `same-role-other-channel` (two roles, no
ladder).

**Display-only changes needed.** None.
**Renderer changes needed.** §1 role labels; the collapsed-wait duration strip must read the
timeout `Config`'s own rule and never an `until` event's description — abort events belong in the
detail panel (§4.1). This is generic and affects every Family-B-collapsed wait in the corpus.

---

### REM-305 · Support Request Acknowledgement
`/lab/journeys/support-request-acknowledgement` · 20 canonical / 14 display nodes

**Purpose.** Tell somebody who raised a problem that it exists, is owned and is not lost — once,
transactionally, and without promising an outcome nobody has decided yet.

**Current flow.**
```
Trigger support_request_received
  → [capture under a quotable reference, with a named owner]
  → Decision: is an open request already covering this problem?
        ├ Already covered → [attach] → Exit: attached, acknowledged once
        └ Nothing open → Decision: was this request already resolved when it was received?
              ├ Resolved on receipt → [gate] → Resolved-on-receipt message (email · in-app) → Exit: resolved
              └ Still open → [gate] → Acknowledgement (email · in-app)   [mandatory: true]
                    → Wait (support_ack.window; until support_request_resolved | request_withdrawn)
                        ├ on event → Decision: what resolved the window?
                        │     ├ Resolved → [gate] → Resolution notice (email · in-app) → Exit: resolved
                        │     └ Withdrawn → Exit: withdrawn, nothing further sent
                        └ on timeout → Decision: is the request still open now the window has closed?
                              ├ Still open → Handoff REM-151   [and NOTHING is sent]
                              └ Closed while the window ran → Resolution notice → Exit: resolved
```

**The constraint, verified intact.** Both state-change touches carry the refund prohibition in
`destination.mustNotClaim`, verbatim: *"a refund: not the amount, not when it will appear, not
whether it has settled"* — on **t2** (`a.resolved-now`) and **t3** (`a.resolution`). It is
restated in the actions' own prose and again as the suppression `s.money`, which names FIN-137 as
the decider and FIN-302 as the announcer. `a.resolution`'s `does` sentence says a resolution was
reached *"named in the terms the requester raised it in rather than in the terms of any money that
moved"*. **Preserved exactly. Nothing in this section relaxes any of it, and no channel or
orchestration change below touches those three fields.**

**The group order, verified intact.** `service-request` = **REM-305 ▸ REM-151 ▸ REM-157**, declared
from all three sides:
- REM-305: *"highest in the service-request group while the request is still only a request"*,
  with `s.contest` silencing REM-151 and REM-157 until ownership moves at the handoff.
- REM-151: *"second in the service-request group: below the support request acknowledgement
  (REM-305) … above remedy selection (REM-157)"*.
- REM-157: *"lowest in the service-request group … while either REM-305 or that assessment holds
  the case this journey is suppressed for it"*.

And the two rules the brief names are both in the data and both stay:
- **Resolved on receipt gets a resolution message and never an acknowledgement** — `c.immediate`
  routes it to `a.resolved-now`, and `s.already-resolved` says why: *"promising attention to
  something already done is the clearest way to make a solved problem feel unsolved."*
- **Still open at the window's close is handed to REM-151 and gets nothing** — `c.open` →
  `h.owner`, no send node on that edge, enforced by `s.no-drip`: *"nothing is sent because a
  period elapsed."*

**Problems found.**
1. The `Primary / Fallback` chips (§1) — here they suggest in-app is a retry of email.
2. TR/EN both truncate `w.window`: EN *"Until the team"*, TR *"Talep sahibi ekip"* (§4.1). This is
   the journey's only wait and it is the anti-drip window — the one card a reader most needs to
   understand — and neither locale renders a complete phrase.
3. **`h.owner` → REM-151 is a category assumption.** REM-151's stated eligibility is *"a concrete
   problem with a completed fulfilment or service"*. REM-305 opens on **any** service request —
   a billing question, an account question, a how-do-I. Every still-open request is handed to a
   journey whose subject is a completed fulfilment, with a minted `issue_id`. Flagged, not
   resolved — see §5.
4. One-sided `distinctFrom`: REM-305 names REM-151, REM-151 does not name REM-305.

**Final orchestration — Conditional routing, with one event-or-timeout window.** The routing point
is `c.immediate` (*was this already resolved when it arrived?*) and it changes which message the
requester gets, which is as material as a split gets. The window is an observation window, not a
cadence: it sends on the request's own state change and never on elapsed time. Not sequential —
the acknowledgement and the resolution notice are one state change apart, not one interval apart.
Not fallback.

**Final customer channels.** Email (`persistent` — it carries the reference the requester can
quote back and survives until somebody answers) · In-app (`in-session` — where they raised it in
the product and are still there). **No SMS, and this should be said out loud:** an acknowledgement
is not urgent by construction (its content is "nothing has happened yet"), and a quotable
reference number is exactly the thing SMS loses.

**Customer touch count — 2 maximum on any one instance**, and only one of two shapes: either the
resolved-on-receipt message alone, or the acknowledgement followed by one resolution notice. Three
communication actions are declared; the first two are mutually exclusive. The acknowledgement is
`mandatory: true` and sits outside `support_ack.touches`, whose discretionary budget is 1.
Unchanged.

**Final flow.** As current. **No structural change proposed.**

**State re-checks.** `w.window.recheck` re-reads the request from the system that owns it —
whether it is still open, who owns it now, and whether anything has been recorded against it —
before the timeout is acted on. `c.open` then asks the question again against that fresh read.
This is the correct double-read for a journey whose second message is conditional on the first
not having been overtaken.

**Stop conditions.** `support_request_resolved` → resolution notice → `x.resolved`.
`request_withdrawn` → `x.withdrawn` with nothing further sent (`s.withdrawn`: "a withdrawn request
is not a quiet one"). An open request already covering the same problem → `x.attached`,
acknowledged once. The window closing on a still-open request → handoff, silence.

**Ownership / handoff.** Highest in `service-request` while the request is only a request; once
ownership moves at `h.owner`, this journey sends nothing further ever (GLB-06). One handoff →
REM-151, public, renders as a link.

**Canonical changes needed — none required.** One optional: add a reciprocal `distinctFrom` on
REM-151 naming REM-305. (The `h.owner` question in §5 is raised, not decided.)

**Display-only changes needed — none.**
**Renderer changes needed.** §1 role labels; the `w.window` truncation in both locales (§4.1).

---

### REM-151 · Post-Purchase Issue Recovery
`/lab/journeys/post-completion-issue` · 11 canonical / 7 display nodes

**Purpose.** Establish whether something delivered has left an obligation unresolved, and which
recovery mechanism could satisfy it.

**Current flow.**
```
Trigger post_completion_issue_reported
  → [capture: issue id, what it concerns, the problem as reported, scope, when, evidence]
  → Decision: does an existing recovery case already cover this problem?
        ├ Already covered → [attach evidence to the open case] → Exit: attached
        └ Nothing open → [assess: unresolved obligation, or an experience that fell short?]
              → Decision: is there an actionable unresolved obligation?
                    ├ Actionable → [classify the remedy route] → Handoff REM-157
                    └ Not actionable → Acknowledge (email) → Exit: heard
```

**Problems found.**
1. **It looks like the only customer message is on the branch where nothing happened** — and that
   reading is wrong, but nothing on the page says so. On the *actionable* branch the person hears
   nothing from REM-151 because **REM-157 speaks immediately**: REM-157 has no entry wait, so
   `h.remedy` → `a.present` is one hop and the remedy options are the next thing that arrives. An
   acknowledgement here followed a second later by an options message would be two senders on one
   problem — exactly what REM-305's `s.contest` exists to prevent. **The current design is right.
   Do not add a touch.** What is missing is the *statement* of it.
2. `x.no-defect` renders as **"Heard"** in EN and **"dinlendi"** in TR. The canonical state is
   *"heard; no unresolved obligation and no remedy owed"*; `splitExitState` cut at the semicolon
   and left a one-word card on the branch that most needs explaining — the branch where the answer
   is no. A one- or two-word cut should take the next clause.
3. No `distinctFrom` for REM-305 or FUL-148, both of which hand it cases.

**Final orchestration — Single. No wait anywhere in the graph, deliberately.** A reported issue is
answered now, not after a window; one assessment pass, one answer. This is one of only seven
journeys in the 69 with no wait node, and it should stay that way — a delay between "you told us
something is wrong" and "here is what we found" is the thing this journey is for removing.

**Final customer channels — Email only.** The assessment outcome has to be kept, may be disputed,
and contains the reason. No in-app (the person did not necessarily report it in the product), no
SMS (nothing is time-bound and nothing is asked).

**Customer touch count — 1**, on the not-actionable branch. `localCap` stays 1.

**Final flow.** Unchanged.

**State re-checks.** None needed — there is no interval to re-check across. `c.duplicate` reads the
open-case state at entry, which is the only read that matters.

**Stop conditions.** An existing case covering the same obligation absorbs the report at
`x.attached` (`s.g4` — two remedies on one obligation produce two refunds and the second is found
by accounting). An assessment finding no unresolved obligation ends it at `x.no-defect`, with the
acknowledgement sent. `s.g3` — not every issue defaults to a refund — governs the classify step.

**Ownership / handoff.** Second in `service-request`. One handoff → REM-157 (public, links),
carrying the problem stated as *what is owed* rather than as what was complained about. Entered
from three places: a direct report, FUL-148's `h.return` (which mints a fresh `issue_id` because
FUL-148 has no issue concept), and REM-305's `h.owner`.

**Canonical changes needed.**
- Add a sentence to the journey's own `reusableRule` / entity note making the silence on the
  actionable branch explicit: *"On the actionable branch this journey says nothing, because remedy
  selection speaks on the same hop. Acknowledging an issue and then presenting remedy options a
  moment later is two senders on one problem."* This is the finding that most needs to be visible
  to a reader, and it is a prose change, not a graph change.
- Add `distinctFrom` rows for **REM-305** and **FUL-148**.
- Populate `observes` on `c.duplicate` and `c.actionable`.

**Display-only changes needed — none.** The four absorbed internal actions (`a.capture`,
`a.attach`, `a.assess`, `a.classify`) are correctly absorbed; 11 → 7 is the right read.

**Renderer changes needed.** The `splitExitState` minimum-length rule (§4.3).

---

### REM-157 · Remedy Confirmation
`/lab/journeys/remedy-selection` · 14 canonical / 11 display nodes

**Purpose.** Choose the remedy that would actually satisfy the unresolved obligation, from the ones
that genuinely exist.

**Current flow.**
```
Trigger remedy_decision_required
  → [identify the unresolved obligation precisely]
  → [evaluate the remedies policy actually makes available]
  → Decision: does the counterparty choose between remedies?
        ├ They choose → Present options (email · in-app)
        │      → Wait (remedy_selection.selection; until remedy_selected)
        │          ├ on event → Decision: which remedy resolves the obligation?
        │          └ on timeout → [apply the policy default, recorded as "no selection made"]
        │                             → Decision: which remedy resolves the obligation?
        └ No choice to make → Decision: which remedy resolves the obligation?
  Decision: which remedy resolves the obligation?
        ├ Correction or reperformance → Handoff REM-156
        ├ Replacement → Handoff REM-155
        ├ Return, before anything else → Handoff REM-152
        ├ Refund or credit → Handoff FIN-137
        └ No remedy is owed → No-remedy statement (email · in-app) → Exit: no remedy owed
```

**Problems found.**
1. **The journey called Remedy Confirmation does not confirm the remedy.** Four of `c.route`'s
   five branches — every branch on which a remedy is actually applied — send **nothing**. The only
   message on the outcome side is *"no remedy is owed"*. Two specific people get nothing:
   - the person for whom there was **no choice to make** (`c.choice` → `c.route` directly), who
     hears nothing at all from this journey; and
   - the person who was **offered a choice and did not answer**, for whom `a.default` applies the
     policy default and records *"no selection made"* — and never tells them which remedy they now
     have. That is the worst of the two: a person who was asked to choose, did not, and is never
     told what was chosen for them.
   All four receiving journeys (REM-156, REM-155, REM-152, FIN-137) are non-public, so a library
   reader sees four unopenable cards and one message.
2. **A TR collision on the canvas.** `h.return` (Return Request) and `h.financial` (Refund Request)
   both render as **"Devir İade Talebi"** — two different handoff cards, identical Turkish label,
   on the same canvas. "İade" carries both *return* and *refund*. The EN canvas distinguishes them;
   the TR canvas cannot (§4.2).
3. TR: `h.replacement` renders the target's full title *"Değişim kararı → tahsis etme → teslim etme
   → onaylama"* where EN renders *"Replacement Fulfillment"* (§4.2, same bug as FUL-146).
4. `observes` empty on all three conditions.

**Final orchestration — Conditional routing, with one event-or-timeout selection window.** The
routing point is *does the counterparty genuinely choose between remedies at all?* and it decides
whether a message is sent and a window opened, or whether the route is taken directly. Not
sequential; the two messages are a presentation and its answer, one state change apart.

**Final customer channels.** Email (`persistent` — options with consequences have to be read,
compared and returned to) · In-app (`in-session` — where they are in the product and the selection
is made there). **No SMS.** Choosing between a correction, a replacement, a return and a refund is
not an SMS decision, and the brief's rule that SMS is for time-sensitive *concise* action rules it
out even though `remedy_selection.selection` has a deadline.

**Customer touch count — 2 on any path.** Either (present options → confirm the remedy), or
(no choice → confirm the remedy) at 1, or (present options → no remedy owed). `localCap` stays 2.

**Final flow.**
```
Trigger remedy_decision_required
  → [identify the obligation · evaluate available remedies — absorbed]
  → Decision: does the counterparty choose between remedies?
        ├ They choose → Present options (Kept: email · In product: in-app)
        │      → Wait (remedy_selection.selection)
        │          ├ remedy_selected → Decision: which remedy resolves the obligation?
        │          └ on timeout → [policy default, recorded as "no selection made"] → same Decision
        └ No choice to make → same Decision
  Decision: which remedy resolves the obligation?
        ├ Correction or reperformance ─┐
        ├ Replacement ─────────────────┤
        ├ Return, before anything else ┼→ Remedy confirmed (email · in-app)   ← NEW
        ├ Refund or credit ────────────┘        → Handoff REM-156 / REM-155 / REM-152 / FIN-137
        └ No remedy is owed → No-remedy statement (email · in-app) → Exit: no remedy owed
```

**The new touch, and the line it must not cross.** `a.confirm-remedy` states **which remedy will
resolve the obligation and what happens next** — and, where the selection timed out, that the
policy default was applied because no selection was made. It carries
`destination.mustNotClaim`, written to the same standard as REM-305's:

- *"a refund: not the amount, not when it will appear, not whether it has settled"* — a refund
  selected as the **remedy** is a decision about what satisfies the obligation. That money is owed
  is FIN-137's decision and that money has moved is FIN-302's announcement, each read from the
  financial record. This journey names the remedy and stops.
- *"a date the receiving journey has not committed to"*
- *"that the remedy is complete"* — it has been selected, not performed.

This is the same constraint REM-305 already carries, applied to the journey one rank below it, and
it is exactly what keeps REM-157 from drifting into announcing money. The existing
`distinctFrom: FIN-302` sentence (*"a remedy confirmed here is never money arrived, and this
journey never announces the movement"*) is already the rule; the new touch is the first place it
has to be enforced rather than asserted.

**State re-checks.** `w.selection.recheck` re-reads the confirmed issue and its obligation before
the timeout is acted on. Add one before `a.confirm-remedy`: a remedy the receiving journey has
already begun, or an obligation satisfied meanwhile, must not produce a confirmation of a decision
that has been overtaken.

**Stop conditions.** `remedy_selected` closes the window. The selection window expiring applies the
policy default rather than reopening the question (`s.g3` — a remedy that cannot be delivered is
never offered, so the default is always deliverable). A confirmed issue reaching *no remedy owed*
is **always** said out loud — `a.no-remedy`'s own prose is explicit that *"reaching no remedy and
saying nothing leaves the person believing the question is still open"*, and the same reasoning is
what justifies the new confirmation on the other four branches.

**Ownership / handoff.** Lowest in `service-request`; suppressed for a case while REM-305 or
REM-151 holds it. Four handoffs, all private: REM-156, REM-155, REM-152, FIN-137. The FIN-137
handoff already carries the explicit fact that this journey selected the remedy and did **not**
decide the refund is owed. Keep that sentence; the new touch must not contradict it.

**Canonical changes needed.**
- New action `a.confirm-remedy`, `execution: "communication"`, reached from `c.route`'s four remedy
  branches, target = the corresponding handoff. (Per-parent instancing will draw it once per
  branch; that is correct — the sentence differs per remedy.)
- New `orchestration.touches` entry, stage `remedy-confirmed`, roles `["persistent","in-session"]`,
  `mandatory: false`, with the three `mustNotClaim` clauses above.
- New suppression `s.money`, modelled on REM-305's: *"No message from this journey states the
  money. That a refund is owed is FIN-137's decision and that it has moved is FIN-302's
  announcement; this journey names the remedy and nothing about the payment."*
- Add `recheck` before `a.confirm-remedy`.
- Populate `observes` on `c.choice`, `c.route`, and on `w.selection`'s arms.

**Display-only changes needed — none.**
**Renderer changes needed.** §1 role labels; the TR handoff-name bugs (§4.2) — and the İade / İade
collision needs a *content* fix in the TR short names, not a renderer one.

---

## 4 · Cross-journey display and renderer findings

Everything here is generic — no fix below branches on a journey id.

### 4.1 Derived wait and condition labels are unreliable in both locales

| journey · node | EN card | TR card | what it should say |
|---|---|---|---|
| FUL-301 `w.stands` | **"Until a prepared item"** | correct | until the order moves or is cancelled |
| FUL-265 `w.delivery` | correct | **"Teslimat yürütücü"** (truncated) | until the executor reports |
| REM-305 `w.window` | **"Until the team"** | **"Talep sahibi ekip"** | the acknowledgement window, both truncated |
| FUL-148 `w.route-choice` | correct | **"Alıcı bir alternatif güzergâh seçene"** (missing *kadar*) | until the recipient selects a route |
| FUL-291 `c.state` | **"Until a concrete problem with a completed fulfillment · Decision: …"** | correct | until the delivery has settled |

Two distinct bugs. The **FUL-291 one is the serious one**: the Family-B collapsed-wait duration
strip is rendering an `until` event's description in place of the timeout `Config`'s rule, and on
that journey the `until` list holds *abort* events — so the card tells the reader the journey waits
for a problem to be reported, which is the opposite of what it does. The strip must read
`timeout.after`'s `rule`; `until` events belong in the detail panel.

The other four are a **phrase-cut rule that takes the first clause without checking it is a
clause**. The same budget logic as `cardSummary()` applies: never cut below a minimum, and never
cut a Turkish phrase before its postposition. `audit/measure-display.mjs` cannot catch these —
"Until the team" is not a locale leak, and "Teslimat yürütücü" is not English.

### 4.2 Turkish handoff cards leak the target's full title, and two collide

- FUL-146 `h.escalate` — TR *"Sorumluluk yükseltme → üst merci → çözüm veya iade"* vs EN
  *"Ownership Escalation"*.
- REM-157 `h.replacement` — TR *"Değişim kararı → tahsis etme → teslim etme → onaylama"* vs EN
  *"Replacement Fulfillment"*.

The handoff headline reads the target's short name on EN and falls through to `fullTr` on TR where
no short TR name exists. Generic fix: fall back to the short **EN** name rather than the full TR
arrow-string, and treat a missing short TR name as a data gap to be closed — the same closed-in-
both-directions shape `audit/preset-locale.mjs` already enforces for presets.

Separately, and a **content** bug rather than a renderer one: REM-157 draws `h.return`
(REM-152 Return Request) and `h.financial` (FIN-137 Refund Request) as two cards with the
**identical** TR label *"İade Talebi"*. Turkish uses *iade* for both. They need distinguishing
short names — e.g. *Ürün İadesi Talebi* and *Para İadesi Talebi*.

### 4.3 `splitExitState` can cut an exit card down to one word

REM-151 `x.no-defect` → **"Heard" / "dinlendi"**, from *"heard; no unresolved obligation and no
remedy owed"*. The branch where the answer is no is the branch that most needs its reason on the
card. Same shape as Family E's fix: take the **longest** cut that fits the budget, never the
shortest, and never below a floor.

### 4.4 What is correctly hidden — verified, leave alone

Every `c.sendable` in this domain (FUL-301, FUL-291, REM-305 ×3) is a genuine Family-C
implementation gate: its short arm passes through a bookkeeping hop that records the reason before
exiting. All correctly absorbed. No business decision is hidden anywhere in these eight journeys —
I checked every `canonicalNodesNotDrawn` entry against its canonical node.

### 4.5 Two journeys draw a handoff many times over

FUL-148 draws `h.return` 4× and `h.retry` 2×; FUL-146 draws `h.escalate` 2×; FUL-301 draws
`x.confirmed` 2×. This is per-parent instancing working as designed — it keeps each branch's ending
beside the branch instead of dragging a connector across the canvas. FUL-148's 18-card canvas is
uncomfortable, but the answer is §2.1 (two of those six instances become a *different*, better
ending) and not a special case in the layout.

---

## 5 · One question raised and deliberately not decided

**REM-305 `h.owner` → REM-151 assumes every still-open support request is a post-completion
issue.** REM-151's eligibility is explicitly *"a concrete problem with a completed fulfilment or
service"*; REM-305 opens on **any** service request. A billing question that is still open when
the acknowledgement window closes is handed to Post-Purchase Issue Recovery with a minted
`issue_id`.

I am not resolving this, because the brief fixes the group order REM-305 ▸ REM-151 ▸ REM-157 and
the anti-drip handoff, and both are right. The two honest ways forward:

- **(a)** Condition `c.open`'s *"Still open"* arm: where the request concerns a completed
  fulfilment or service → `h.owner` → REM-151 (unchanged); otherwise a new exit `x.owned`
  (class `success`) — *"the request is with the team that owns the work, and this journey says
  nothing further about it"*. Keeps the anti-drip rule exactly, adds one honest ending, and keeps
  REM-151's stated eligibility true.
- **(b)** Widen REM-151's eligibility to "any service request with a concrete problem behind it",
  making it the generic assessment entry its position in the group already implies, and accept that
  its *name* then understates it.

(a) is the smaller change; (b) is the more truthful one if REM-151 really is meant to be the
group's assessment stage. It needs a decision from whoever owns the remedy arc, not from me.

---

## 6 · Summary table

| ID | before pattern | after pattern | channels | touches | biggest change |
|---|---|---|---|---|---|
| **FUL-301** Order Confirmation | Single + event-or-timeout, rendered as a 3-step fallback ladder | **Single**, conditional channel selection, one observation window | email · sms *(time-bound action only)* · in-app | **1** (mandatory, 0 discretionary) | **Nothing structural.** Kept deliberately simple: no second touch, no marketing, no group change. Only the fallback chips and the broken EN wait label are fixed |
| **FUL-265** Delivery Tracking | Sequential + conditional + event-or-timeout; one channel pair on all 4 touches | **Sequential + conditional routing + a bounded revision loop** | email on dispatch & arrival · **+sms on non-arrival and near acceptance deadlines** | **3** (4 with one revision) | `delivery_delay_reported` had no branch, so a late parcel became a failed-delivery case — added a bounded, capped revised-window notice; `x.unresolved` renamed `h.no-arrival`; SMS taken off the two status touches |
| **FUL-146** Delivery Delay Alert | Conditional + event-or-timeout; **no exit nodes**; one channel pair on all 3 touches | **Conditional routing + event-or-timeout**, bounded resume watch | email · **+sms on the delay update**; email-only on the escalation | **2** | `h.resume` → **exit `x.resumed`** (its first visible ending); closed the path that could offer a decision to someone never told there was a delay; SMS removed from the no-action escalation |
| **FUL-148** Failed Delivery Recovery | Conditional + event-or-timeout; **no exit nodes**; 18 display cards | **Conditional routing on the failure class + event-or-timeout** | email · **+sms on the correction request** | **2** | `h.retry` → **exit `x.reattempt-scheduled`** (its most common ending, previously invisible); budget re-check after the correction wait; two missing `distinctFrom` rows |
| **FUL-291** Post-Purchase Follow-Up | Single, 3 channel roles as a ladder | **Single** | email · in-app | **1** | **Push removed** — transient channel on a message whose value is being keepable; and the collapsed wait card was announcing an abort event as its duration |
| **REM-305** Support Request Acknowledgement | Conditional + event-or-timeout | **Conditional routing + event-or-timeout** — unchanged | email · in-app, **no SMS** | **2** max | **Nothing structural. The refund constraint and the anti-drip handoff are verified intact and preserved**; chips and a two-locale wait truncation fixed; the REM-151 category question raised in §5 |
| **REM-151** Post-Purchase Issue Recovery | Single, no waits | **Single, no waits** — unchanged | email only | **1** | Structure confirmed correct: the silence on the actionable branch is deliberate because REM-157 speaks on the same hop — made explicit in prose rather than fixed with a touch |
| **REM-157** Remedy Confirmation | Conditional + event-or-timeout; 4 of 5 outcome branches silent | **Conditional routing + event-or-timeout** | email · in-app, **no SMS** | **2** | **Added the confirmation the journey is named for** — which remedy resolves the obligation, on the four branches that had none, carrying REM-305's refund prohibition so it names the remedy and never the money |

**Pattern distribution after (8 journeys):** Single **3** · Conditional routing **4** ·
Sequential **1** · Event-or-timeout **7** (all but REM-151) · bounded loop **1** (FUL-265) ·
**Fallback 0** · Parallel 0 · Segment-based 0.

**Channel distribution after:** email 8/8 · SMS 4/8, every instance on a named urgency condition ·
in-app 4/8 · push **0** · WhatsApp **0**.

**Touch counts after:** 1, 1, 1, 2, 2, 2, 2, 3 (4 only on FUL-265's capped revision path). Total 14
across 8 journeys.

**Net canonical node change:** +2 (FUL-265 `a.revised`, REM-157 `a.confirm-remedy`), 2 handoffs
converted to exits, 1 handoff renamed, 1 edge retargeted, 1 condition branch added.
