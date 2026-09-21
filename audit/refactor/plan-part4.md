# Phase 1b — consolidated plan, part 4

**Scope (20 journeys, in order):** `FUL-146` `FUL-148` `FUL-265` `FUL-291` `FUL-301` `REM-151`
`REM-157` `REM-305` · `SCH-266` `SCH-277` `SCH-280` `SCH-282` `SCH-303` `SCH-304` `SUB-163`
`SUB-262` `SUB-296` `SUB-297` `SUB-298` `SUB-299`.

**Sources consolidated:** `fulfillment.md` and `scheduling-subscription.md` (domain — binding on
business flow, trigger, waits, touch count, state re-checks, stop conditions, canonical edits);
`orchestration-matrix.md` (**J** — binding on orchestration pattern and final channels per stage);
`ownership.md` (**I** — binding on ownership, precedence, handoffs, `distinctFrom`);
`canvas.md` (**K** — binding on what the canvas draws and on renderer changes). Canonical facts
re-verified against `audit/public-journeys-current-state.json` per journey.

## What I arbitrated

The two domain audits and the orchestration matrix disagree about channels on **fourteen of the
forty-three communication stages in this part**, and the disagreement is systematic rather than
incidental: the domain audits read each journey's `channelStrategy.roles[].when` sentences as
selection *conditions* and therefore kept two or three channels on most touches, while J's
`UNRESOLVED` finding is that **no node anywhere in these twenty graphs reads any of those
sentences** — the order is array order, so a multi-channel stage states a reach nothing resolves.
J is binding on that column, so on every contested stage I applied J's single final channel and
recorded the domain's dissent in the section rather than splitting the difference. The visible
consequences: `FUL-265 a.arrived` becomes **SMS** and `a.no-arrival` becomes **email**, which is
the exact inverse of the fulfilment audit's table; `FUL-291`, `SUB-262`, `SUB-296`, `SUB-298` and
`SUB-299` lose the in-app their domain audits defended; `SCH-282` and `SUB-297` lose push, because
J's corpus rule is that push survives only where a deliverability test exists in the graph and
neither has one; `SCH-304 a.checkin` becomes **SMS** against the scheduling audit's explicit "drop
SMS"; and `SCH-266 a.at-risk` and `SCH-303 a.final` become **parallel** sends rather than ranked
ladders. One stage is marked **CONFLICT — ESCALATED**: `FUL-301 a.confirm`, where the fulfilment
audit's finding is the categorical *"canonical changes needed — none"* and J's verdict on the same
stage requires a one-field `channelRoles` reduction. I applied J, recorded the dissent, and state
plainly that the change adds no touch, no node, no group change and no marketing.

Two further arbitrations were not channel questions. **FUL-146 `c.estimate`** is listed by K under
G9_DEGENERATE_DECISION (a drawn Decision with one outgoing edge) while the fulfilment audit says it
must not be collapsed because its two arms — *"we have a new date"* and *"we honestly do not have
one"* — are the journey's own thesis (`s.g2`). K itself offers a disjunction ("either the content
difference becomes visible, or the decision stops being drawn as a Decision"), so I took the arm the
domain's evidence selects and expressed it as a generic out-degree rule (**R4** below) that leaves
`FUL-301 c.stands` and `FUL-148 c.class` merged, which both domain audits asked for. And **SUB-297
`a.remind`**: J priced it as a repetition ("identical content by rule, so identical channel"), but
the scheduling audit's canonical edit abolishes that stage and replaces it with an expiry-anchored
notice built on a signal already read in `c.valid`'s third branch. The domain is binding on canonical
edits and cited evidence J did not have, so the edit stands and J's row no longer describes the
stage; the replacement's channel is set by J's own push rule, not by the domain's push proposal.

## Renderer rules referenced below (generic; no journey id appears in any of them)

- **R1 — label channel rows by the pattern the touch declares, never by array position.** Replace
  `i === 0 ? primary : fallback` in `ChannelPriorityRow`. `single` → channel pill, no rank label.
  `parallel` → one row, channels side by side, "at the same time". `conditional` → each row
  labelled with its own `when`. `fallback` → "then, if <reason>", and only where the data declares
  a true fallback. Needs K §5.2's `TouchPattern` discriminant on `Touch`; until it exists, the
  honest default is the role list with **no** rank label.
- **R2 — an action with `execution: "human"` or `customerFacing: false` never enters
  `ChannelPriorityRow`.** The string `Task` must never appear where a channel appears.
- **R3 — `absorbableBookkeeping` must read structure, not localised prose.** Add
  `FlowNode.writes?: { field, mode }[]` in `canonical-view.ts` and test it instead of `meta`; lay
  the canvas out once on unlocalised nodes; `suppressed_sends` is not a journal write when the node
  is the branch's only writer of it; never absorb an action into a `wait` capsule.
- **R4 — the twin-edge merge must never reduce a drawn `condition` below two outgoing display
  edges.** Merge compound labels only where ≥ 2 edges survive.
- **R5 — a branch arm whose only target is a pure no-action record is not drawn**, with the
  `hideable()` parent test unchanged.
- **R6 — wait and condition labels obey the same `cardSummary` budget as every other card body**,
  read the timeout `Config`'s own rule and never an `until`/abort event's description, and never
  cut a Turkish phrase before its postposition.
- **R7 — a handoff headline falls back to the target's short EN name, never the full TR
  arrow-string.** A missing short TR name is a data gap, closed in both directions.
- **R8 — `splitExitState` takes the longest cut that fits the budget, never the shortest, and never
  below a floor.**
- **R9 — trigger cards read as event names**, from a display-name table keyed by event id, with the
  `SignalSource` pill kept.
- **R10 — a handoff whose target is not public renders with an affordance stating why it is not a
  link**, instead of a dead card naming a journey.
- **R11 — gates.** `G7_LOCALE_STRUCTURE`, `G8_ACTION_HIDDEN`, `G9_DEGENERATE_DECISION`,
  `H5_FAKE_PRIMARY` / `H6_FALSE_FALLBACK` / `H7_HUMAN_AS_CHANNEL`, `H1` widened to bare snake_case
  and SCREAMING_SNAKE and run over `data-canvas-edge-label`, `H8_CARD_OVERFLOW`.

---

## FUL-146 — Delivery Delay Alert

**Purpose:** Hold lateness as its own state, with the original commitment still visible behind
whatever the new estimate is, and put a decision to the counterparty only where one genuinely
exists.

**Current flow:**
```
Trigger expected_fulfillment_timing_slipped
  → [assess: original commitment, current estimate, cause, scope, impact; record DELAYED]
  → c.estimate: is there a reliable new completion estimate?
        ├ A reliable estimate → [update timing, append to commitment history]
        └ No reliable estimate → [record that none exists rather than issuing one]
  → c.recipient-impact: does the changed timing alter what the recipient plans around?
        ├ It changes their plans → a.delay-update (email · sms)
        └ No material change for them ─────────────────────┐
  a.delay-update → c.threshold: does the delay exceed the acceptable threshold?
        ├ Within tolerance → w.resume                      │
        └ Beyond tolerance → c.choice: is there a decision to make?   ←─┘  (REACHABLE TODAY)
              ├ They choose → a.offer (email · sms) → w.decision
              │     ├ on event → Wait / Reschedule → w.resume · Alternative → h.exception FUL-145
              │     │                                Cancel → h.cancel FUL-150
              │     └ on timeout → w.resume
              └ Nothing to offer → a.no-choice-update (email · sms) → h.escalate OWN-55
  w.resume: on event → h.resume FUL-144 · on timeout → h.escalate OWN-55
```

**Problems found:**
- **Zero exit nodes.** `terminalStates` is empty; all four endings are handoffs (`h.resume`,
  `h.exception`, `h.cancel`, `h.escalate`) and **all four targets are non-public**, so the reader
  sees no ending and four dead cards. Verified in the export. (fulfillment §2.1)
- **A customer can be offered a decision about a delay they were never told about.**
  `c.recipient-impact`'s *"No material change for them"* arm routes to `c.threshold`, from which
  *Beyond tolerance* → `c.choice` → `a.offer` is reachable. The first thing that person hears is
  *"would you like to wait, reschedule, take an alternative, or cancel?"* with no stated subject.
  A live logic defect. (fulfillment)
- All three touches carry the identical `persistent + urgent` pair, including the escalation
  message that tells the person there is nothing they can do. (fulfillment; J `UNRESOLVED` ×3)
- `observes` is empty on all four conditions; the journey predates the field. (fulfillment)
- `c.estimate` draws as a Decision card with exactly one outgoing edge, both answers stacked in one
  compound chip. (canvas P1-5, G9)
- **FUL-146 can open a delay narrative over an open FUL-148 recovery.** `s.g5` excludes only slips
  FUL-265 is *"already tracking under its own wait"*, and FUL-265 exits when it hands to FUL-148 —
  from which moment the exclusion stops biting, while a failed attempt is by definition a material
  slip against the timing commitment. (ownership **P1-5**)
- TR: `h.escalate` renders the target's full title *"Sorumluluk yükseltme → üst merci → çözüm veya
  iade"* where EN renders *"Ownership Escalation"*. (fulfillment §4.2)

**Final orchestration:** combination — **conditional routing** (`c.recipient-impact` → `c.threshold`
→ `c.choice` decide whether the second message is an offer or a statement, and those are different
messages to different people) plus **event-or-timeout** on `w.decision` and a bounded resume watch
on `w.resume`. Per stage J settles all three as `single`: one channel each, chosen by what the
moment is. Not sequential — the second touch is not a follow-up to the first, it is the other arm
of a fork. Not fallback: no channel here substitutes for another.

**Final customer channels:** `a.delay-update` → **SMS**. `a.offer` → **email**.
`a.no-choice-update` → **email**. (J binding. J's `a.delay-update` reason is that this arm is
reached only when the recipient planned their day around the committed window, the one thing that
matters is that it moved, and `s.g3` keeps the commitment history on the order record rather than
in the message — so the message is one line. The fulfilment audit wanted email **and** SMS here and
an SMS pointer on the offer; both are superseded. Both audits agree the escalation message loses
SMS: nothing is being asked, and an urgent-channel alarm with no action attached spends trust and
returns nothing.)

**Customer touch count:** **2** — longest path to one recipient is `a.delay-update` then *either*
`a.offer` *or* `a.no-choice-update`, which are mutually exclusive. `localCap` stays 2.

**Final flow:**
```
Trigger expected_fulfillment_timing_slipped
  → [assess · absorbed]
  → c.estimate: is there a reliable new completion estimate?
        ├ A reliable estimate ─┐   (two labelled arms, one target — kept as a real fork, R4)
        └ No reliable estimate ┴→ c.recipient-impact
  → c.recipient-impact: does the changed timing alter what the recipient plans around?
        ├ It changes their plans → a.delay-update (SMS)
        │      → c.threshold: does the delay exceed the acceptable threshold?
        │            ├ Within tolerance → w.resume
        │            └ Beyond tolerance → c.choice: is there a decision to make?
        │                  ├ They choose → a.offer (email) → w.decision
        │                  │     ├ Wait / Reschedule → w.resume
        │                  │     ├ An alternative → h.exception → FUL-145
        │                  │     ├ Cancel → h.cancel → FUL-150
        │                  │     └ on timeout → w.resume
        │                  └ Nothing to offer → a.no-choice-update (email) → h.escalate → OWN-55
        └ No material change for them → w.resume                            ← CHANGED
  w.resume (fulfillment_delay.resume)
        ├ fulfillment_resumed_or_completed → EXIT x.resumed                 ← NEW
        └ on timeout → h.escalate → OWN-55
```

**State re-checks:** `w.decision` and `w.resume` both re-read the obligation and its timing
commitment from the system of record before a timeout is acted on — keep. **Add one before
`a.offer`:** the offer must not present *cancel* or *reschedule* on an obligation that resumed while
`c.choice` was being evaluated.

**Stop conditions:** `fulfillment_resumed_or_completed` → `x.resumed`, immediately, from anywhere in
the resume watch. A counterparty choosing an alternative or a cancellation moves ownership on the
choice itself. The revised horizon expiring escalates rather than looping. Once the obligation's
latest authoritative state is a failed attempt, FUL-148 is the narrator and this journey does not
open (new `s.g5` clause).

**Ownership / handoff:** No exclusion group, correctly — the boundary that matters is with FUL-265
and it is carried reciprocally by `s.g5` and FUL-265's `s.g6`, which ownership records as the proof
that reciprocity matters more than the mechanism. After the change: one exit (`x.resumed`) and three
handoffs — FUL-145, FUL-150, OWN-55, all non-public, all text with the R10 affordance. **Must not
say:** anything about a delivery attempt that has actually failed (that is FUL-148's), and anything
about position in transit (FUL-265's). Extend `s.g5` per ownership P1-5 to name FUL-148.

**Canonical changes needed:**
- `h.resume` → **exit `x.resumed`**, class `success`, `reEntry`: *"a later slip against the revised
  commitment opens its own instance"*. `measurement.journeyOutcome.type` → `exit-or-handoff`; refs
  updated. Handing back to an execution that never handed over is not a handoff.
- `c.recipient-impact` branch *"No material change for them"*: retarget `c.threshold` → `w.resume`.
  It was routing a customer who was told nothing into a branch that could offer them a decision; if
  the slip does not alter what they plan around there is nothing to offer them either.
- `orchestration.touches`: `t1` (delay-update) drops `persistent`, keeps `urgent`; `t2`
  (no-choice-update) and `t3` (offer) drop `urgent`, keep `persistent`.
- Populate `observes` on `c.estimate`, `c.recipient-impact`, `c.threshold`, `c.choice`.
- Add a `recheck` before `a.offer` naming the obligation's resumption state.
- `suppressions[s.g5].text` — extend with the FUL-148 clause (ownership P1-5, verbatim).

**Display-only changes needed:** none. `c.estimate`'s two arms must stay two labelled arms (R4);
they are not a collapse candidate.

**Renderer changes needed:** R1, R4, R6, R7, R9, R10, R11.

---

## FUL-148 — Failed Delivery Recovery

**Purpose:** Recover a failed delivery according to why it failed, within a bounded number of
attempts, and hand the obligation on when the budget or the recipient's answer ends it.

**Current flow:**
```
Trigger authoritative_delivery_attempt_failure
  → [classify into the class the executor actually reported]
  → c.class: what kind of failure was it?
        ├ Correctable information needed → a.correct (email · sms)
        │     → w.correction ├ on event → c.budget
        │                    └ on timeout → h.return REM-151
        ├ A reattempt is safe ─┐
        ├ No usable reason given ┴→ c.budget: is a reattempt available?
        │         ├ Attempts remain → c.alternate: would an alternative route serve better?
        │         │     ├ Policy authorises it → [alternative route] → h.retry FUL-147
        │         │     ├ The recipient's to choose → a.offer-route (email · sms)
        │         │     │      → w.route-choice ├ Selected → [alt route] → h.retry FUL-147
        │         │     │                       ├ Declined all → h.return REM-151
        │         │     │                       └ on timeout → [reattempt] → h.retry FUL-147
        │         │     └ Reattempt same route → [reattempt] → h.retry FUL-147
        │         └ Exhausted → h.return REM-151
        ├ The recipient refused it → h.return REM-151
        └ Damaged → h.exception FUL-145
```

**Problems found:**
- **Zero exit nodes.** All three endings are handoffs; `h.retry` → FUL-147 is non-public,
  `h.exception` → FUL-145 is non-public, only `h.return` → REM-151 is public. Verified.
  (fulfillment §2.1)
- **18 display cards for a 2-touch journey.** `h.return` is instanced 4× and `h.retry` 2×. The
  per-parent instancing rule is working as designed; the effect is that a third of the canvas is one
  handoff repeated. (fulfillment; canvas P2-7)
- Both touches carry the identical `persistent + urgent` pair with nothing selecting between them.
  (J `UNRESOLVED` ×2)
- **`distinctFrom` is empty.** FUL-148 is handed cases by FUL-265 and hands them to REM-151 and
  states its boundary with neither — and, per ownership, it is also the unstated counterparty of
  FUL-146. (fulfillment; ownership P1-5)
- `c.budget` is not re-read after `w.correction` returns; the bounded budget may have been spent by
  a parallel attempt while the correction was outstanding. (fulfillment)
- TR: `w.route-choice` reads *"Alıcı bir alternatif güzergâh seçene"* — the sentence stops before
  its postposition. (fulfillment §4.1)

**Final orchestration:** combination — **conditional routing** on the failure class (`c.class`, five
branches, which is the journey's entire reason to exist: *refused* is a decision by the recipient and
*unavailable* is an absence, and `s.g3` exists because treating the first as the second keeps
redelivering to someone who has already said no) plus **event-or-timeout** on `w.correction` and
`w.route-choice`. Per stage J settles both as `single`. Not sequential — the correction request and
the route offer are alternatives on different failure classes, never a cadence.

**Final customer channels:** `a.correct` → **SMS**. `a.offer-route` → **email**. (J binding, and J
names `a.correct` one of the corpus's seven surviving SMS stages: the courier is mid-round, the
parcel goes back if nobody answers, and the whole message is one missing fact with an imminent
consequence. `a.offer-route` is a collection point, a different window or a different executor, each
with addresses and times and a stated budget that does not reset — read side by side. The fulfilment
audit wanted email alongside SMS on the correction; superseded.)

**Customer touch count:** **2** — longest path to one recipient is `a.correct` then `a.offer-route`
(correction provided → budget remains → recipient's to choose). `localCap` stays 2.

**Final flow:** shape unchanged from Current flow, with `h.retry` becoming an exit:
```
        … c.alternate
              ├ Policy authorises it → a.alternate → EXIT x.reattempt-scheduled     ← NEW
              ├ The recipient's to choose → a.offer-route (email) → w.route-choice
              │        ├ Selected → a.alternate → EXIT x.reattempt-scheduled        ← NEW
              │        ├ Declined all → h.return → REM-151
              │        └ on timeout → a.reattempt → EXIT x.reattempt-scheduled      ← NEW
              └ Reattempt same route → a.reattempt → EXIT x.reattempt-scheduled     ← NEW
```

**State re-checks:** both waits already re-read the attempt and its obligation before a timeout is
acted on. **Add one:** `w.correction` gains a `recheck` naming the attempt budget, because the edge
already routes its on-event arm into `c.budget` and the budget may have moved.

**Stop conditions:** the policy attempt limit being reached ends recovery at REM-151, not at a
further attempt (`s.g2` — the budget does not reset). A recipient declining every alternative ends it
the same way. `delivery_correction_provided` moves it forward rather than stopping it. A damaged item
leaves for FUL-145 immediately.

**Ownership / handoff:** no exclusion group. After the change: one exit (`x.reattempt-scheduled`) and
two handoffs — REM-151 (public, links; mints a fresh `issue_id` because FUL-148 has no issue concept)
and FUL-145 (non-public, text with the R10 affordance). **While this journey holds a failed attempt
it is the one that tells the recipient about the obligation's timing** — FUL-146 must not narrate a
slip beside it and FUL-265 must not narrate position. **Must not say:** anything about a remedy being
owed; that is REM-151's assessment and REM-157's decision.

**Canonical changes needed:**
- `h.retry` → **exit `x.reattempt-scheduled`**, class `success`, `reEntry`: *"a further attempt that
  also fails opens its own instance against its own `delivery_attempt_id`"*. The entity key is one
  attempt; when a new attempt is scheduled this instance's subject has ceased to exist, which is an
  exit and not a transfer. The `carries` block on the old handoff (attempt history, remaining budget,
  correction or route change applied) becomes a `writes` on `a.alternate` / `a.reattempt`.
  `measurement.journeyOutcome.type` → `exit-or-handoff`; refs updated.
- `orchestration.touches`: `t1` (correct) drops `persistent`, keeps `urgent`; `t2` (offer-route)
  drops `urgent`, keeps `persistent`.
- Add `recheck` to `w.correction` naming the attempt budget.
- `distinctFrom` += **FUL-146**, **FUL-265**, **REM-151** (it has none at all today). FUL-265 —
  *"FUL-265 reports what the executor says about an obligation in motion; this opens on a single
  attempt already known to have failed, and its subject is the attempt, not the obligation."*
  REM-151 — *"REM-151 asks whether an obligation is unresolved after something was delivered; this
  runs while nothing has been delivered at all and a further attempt is still possible."* FUL-146 per
  ownership P1-5.
- `suppressions` += `CANONICAL_RULE` `s.narrator` (ownership P1-5, verbatim): while this journey
  holds a failed attempt it is the one that tells the recipient about the obligation's timing.
- Populate `observes` on `c.class`, `c.budget`, `c.alternate`, `c.route-answer`.

**Display-only changes needed:** none. The 18-card canvas is answered by the exit conversion (two of
the six shared-terminal instances become a different, better ending) and by R5, not by a special case
in the layout. `c.class`'s merged *"A reattempt is safe · No usable reason given"* edge stays merged —
it is honest authoring (`s.g4` forbids inventing a reason) and R4 leaves it alone because four edges
still survive.

**Renderer changes needed:** R1, R4, R6, R7, R10, R11.

---

## FUL-265 — Delivery Tracking

**Purpose:** Carry the recipient from "it left our hands" to "they agree it was discharged
correctly" — because arriving and being agreed to have arrived correctly are two different facts and
only one of them has a recipient as its source.

**Current flow:**
```
Trigger obligation_handed_to_delivery_executor
  → a.dispatch (email · sms)
  → w.delivery (dispatch_to.delivery; until delivery_confirmed | delivery_failed
                | delivery_delay_reported)
      ├ on timeout → a.no-arrival (email · sms) → x.unresolved [a HANDOFF to FUL-148]
      └ on event → c.delivery: what did the executor authoritatively report?
            ├ Delivered → a.arrived (email · sms)
            │     → c.acceptance: does acceptance carry any consequence here?
            │         ├ Acceptance is meaningful → a.accept-request (email · sms)
            │         │     → w.acceptance ├ on event → c.accepted
            │         │     │                    ├ Accepted → EXIT x.accepted
            │         │     │                    └ Issue raised → h.issue FUL-149
            │         │     └ on timeout → [record] → EXIT x.finalized
            │         └ Delivery is the end of it → EXIT x.delivered
            └ Not delivered → a.no-arrival → x.unresolved [HANDOFF FUL-148]
```

**Problems found:**
- **`delivery_delay_reported` wakes the wait and has nowhere to go.** `w.delivery.until` lists three
  events; `c.delivery` has two branches. An in-transit slip falls into *Not delivered* → handoff to
  **Failed Delivery Recovery**. A parcel running a day late is told it has not arrived and is opened
  as a failed-delivery case. (fulfillment §2.3)
- **That defect makes FUL-146's one-sided eligibility clause point at nothing.** `FUL-146 s.g5`
  declines to open a delay narrative *because FUL-265 is said to be tracking the slip under its own
  wait*; FUL-265 holds no such state. The praised clause is aspirational until the branch exists.
- **`x.unresolved` is a handoff wearing an exit's id.** `kind: "handoff"`, `to: "FUL-148"`, sitting in
  `measurement.journeyOutcome.refs` beside three real exits, with a `carries` block that mints a
  fresh `delivery_attempt_id`. Any consumer keying off the `x.` prefix reads the Stop cell and the
  Handoff cell as the same thing. Verified. (fulfillment §2.2)
- **All four touches carry the identical `persistent + urgent` pair** — four messages about four
  different facts given one treatment set once on the journey. (fulfillment; J `UNRESOLVED` ×4)
- `a.no-arrival`'s card body is the one non-wait card still at the 120-character budget boundary
  after `cardSummary`. (canvas P2-8)
- TR truncation on `w.delivery`: *"Teslimat yürütücü"*. (fulfillment §4.1)
- One-sided `distinctFrom`: FUL-291 names FUL-265, FUL-265 does not name back. (ownership D-15)

**Final orchestration:** combination — **sequential** (each touch is a later statement about the same
dispatched obligation, reached only through a state read) with a **conditional routing** point at the
executor's report (`c.delivery`), a **bounded loop** on the revision arm, and **event-or-timeout** on
`w.delivery` and `w.acceptance`. Justified at 3 touches (4 with a revision) because each states a
*different authoritative fact about a different moment* — it left, the window moved, it arrived or did
not, and silence from this date counts as acceptance. None repeats another, and the acceptance request
is sent only where acceptance carries a consequence.

**Final customer channels:** `a.dispatch` → **email**. `a.revised` *(new)* → **SMS**.
`a.arrived` → **SMS**. `a.no-arrival` → **email**. `a.accept-request` → **email**.
(J binding, and this is the sharpest reversal in this part: the fulfilment audit put email on
`a.arrived` and email+SMS on `a.no-arrival`; J puts SMS on `a.arrived` — *"the one moment in the
journey genuinely time-critical to the person: something is at their door now, and the consequence of
not knowing is theft or weather; the proof-of-delivery evidence lives on the order record"* — and
email on `a.no-arrival`, because that message has to distinguish a confirmed failure from an executor
we have lost sight of (`s.g4`) and say what happens next, which is content that needs room. J's list
of surviving SMS stages names `FUL-265 a.arrived` explicitly. `a.revised` has no J row because the
stage does not exist yet; it takes SMS on J's own reasoning — the customer's day has changed, one
fact, one line — which is also what the fulfilment audit proposed.)

**Customer touch count:** **3** normally (dispatch · arrived-or-not-arrived · acceptance request),
**4** on the one permitted revised window. Raise `contact.localCap` 3 → 4 with the revision as its
stated reason.

**Final flow:**
```
Trigger obligation_handed_to_delivery_executor
  → a.dispatch (email)
  → w.delivery (until delivery_confirmed | delivery_failed | delivery_delay_reported)
      ├ on timeout ──────────────────────────────────────┐
      └ on event → c.delivery: what did the executor authoritatively report?
            ├ A revised window was reported → a.revised (SMS)          ← NEW BRANCH + ACTION
            │      → back to w.delivery, re-armed on the revised window
            │        [bounded: dispatch_to.revisions = 1]
            ├ Delivered → a.arrived (SMS)
            │     → c.acceptance: does acceptance carry a consequence?
            │         ├ Acceptance is meaningful → a.accept-request (email) → w.acceptance
            │         │        ├ Accepted → EXIT x.accepted
            │         │        ├ Issue raised → h.issue → FUL-149
            │         │        └ on timeout → EXIT x.finalized
            │         └ Delivery is the end of it → EXIT x.delivered
            └ Not delivered ───────────────────────────────┤
                                                           └→ a.no-arrival (email)
                                                                 → h.no-arrival → FUL-148   ← RENAMED
```

**State re-checks:** both waits already re-read the dispatched obligation from the system of record
before a timeout is acted on. **The re-armed wait must re-read on each re-arm**, and the revision
counter must be read from the instance, never from the event.

**Stop conditions:** `delivery_accepted` → `x.accepted`. `delivery_issue_raised` → FUL-149.
Acceptance window expiry → `x.finalized`, kept forever distinguishable from `x.accepted` (`s.g5`).
A **second** revision, or a confirmed non-arrival, → FUL-148.

**Ownership / handoff:** no exclusion group and it does not need one. Its boundary with FUL-146 is a
one-sided eligibility clause on each side (`FUL-146 s.g5` cedes in-transit slips here, `FUL-265 s.g6`
cedes pre-dispatch slips there) — ownership records this pair as proof that reciprocity, not a
group, is the mechanism. The revision branch is what makes that clause true rather than aspirational.
Handoffs: `h.no-arrival` → FUL-148 (public, links), `h.issue` → FUL-149 (non-public, text + R10).
**Must not say:** it never re-confirms the order (FUL-301's), never explains what to do with the
thing (FUL-291's), and never claims a window the executor has not committed to.

**Canonical changes needed:**
- Rename `x.unresolved` → **`h.no-arrival`**; update the one `measurement.journeyOutcome.refs` entry.
  Not `h.unresolved`: the node is reached from `c.delivery`'s *Not delivered* arm and from
  `w.delivery`'s timeout, and both mean *it did not arrive*, which is what the card should say.
- `c.delivery`: add branch *"A revised window was reported"*, `observes: "delivery_delay_reported"`.
- New action **`a.revised`**, `execution: "communication"`, target `w.delivery`.
- New `Config` **`dispatch_to.revisions`** (`required: true`, default 1) and a revision-count read on
  `w.delivery`'s re-arm.
- `orchestration.touches`: add `t1b`, stage `revised-window`, roles `["urgent"]`, with
  `destination.mustNotClaim: ["a window the executor has not actually committed to"]`. Drop `urgent`
  from `t1` (dispatch) and from `t4` (accept-request); drop `persistent` from `t3` (arrived); drop
  `urgent` from `t2` (no-arrival).
- `contact.localCap` 3 → 4, reason stated.
- New suppression: *"A revised window is stated once. A second revision is not a third narrative — it
  is an executor who cannot hold a window, and the obligation moves to recovery."*
- `distinctFrom` += **FUL-291** (ownership D-15) and **FUL-148** (the reciprocal of FUL-148's new row).

**Display-only changes needed:** none. The bounded loop **must be drawn** — a back edge to the wait is
a real path and hiding it would erase the journey's only loop.

**Renderer changes needed:** R1, R6, R9, R10, R11 (H8 and the widened H1 both bear on this canvas).

---

## FUL-291 — Post-Purchase Follow-Up

**Purpose:** Once what was owed has actually arrived, send the one thing that makes it useful — how
to start with it, how to look after it, what sensibly follows — and nothing else.

**Current flow:**
```
Trigger authoritative_delivery_completion
  → w.settle (post_purchase_followup.settle; abort on post_completion_issue_reported
              | permission_withdrawn)
  → c.state: is a follow-up still the right thing to send?
        ├ Follow-up due → c.sendable [hidden gate]
        │      ├ Sendable → a.followup (email · in_app · push) → EXIT x.followed-up
        │      └ Nothing to say, or suppressed → [record] → x.no-action (not drawn)
        ├ A problem is open → EXIT x.superseded
        └ No longer reachable → EXIT x.closed
```

**Problems found:**
- **Three channel roles with `fallback: "next-eligible-role"`**, so the card reads as a three-step
  ladder — the only journey in the fulfilment set whose chips make that claim. (fulfillment; J
  `UNRESOLVED`)
- **Push cannot carry this message.** Its entire value is that it is keepable and returnable-to —
  setup instructions, care guidance, what sensibly follows. Push is transient by construction. It is
  present because the role existed. (both audits; J's corpus rule: push survives only where a
  deliverability test exists in the graph, and there is none here)
- **The collapsed wait card announces an abort event as the wait's duration.** `c.state`'s EN card
  reads *"Until a concrete problem with a completed fulfillment · Decision: is a follow-up still the
  right thing to send?"*. The Family-B duration strip is rendering `post_completion_issue_reported` —
  an **abort** event — where the timeout `Config`'s rule belongs. The card tells the reader the
  journey waits for a problem to be reported, the exact opposite of `s.issue`. TR is correct, so this
  is EN-side and the locale sweep cannot see it. (fulfillment §4.1 — the serious one)
- Nothing else. `s.substance` (*"where nothing useful is recorded against what was delivered, nothing
  is sent"*) is the best-authored suppression in the domain and `s.rating` correctly keeps FBK-41 out.

**Final orchestration:** **single.** One touch, one moment, one decision before it. No sequence, no
fallback, no conditional routing between channels that changes the path. A journey may legitimately
be `Trigger → Wait → Decision → Email → Exit`, and this is one of them.

**Final customer channels:** **email**, alone. (J binding: guidance content, sent once, to somebody
who has a physical or delivered thing in front of them and *no reason to be in the product*; `s.status`
and `s.rating` already strip out everything that would have made it a notification. The fulfilment
audit kept in-app alongside email and removed only push; J removes both. Recorded dissent: the
`in-session` role's own `when` says "the next step is taken inside the product", but nothing in the
graph reads it, so it is an assertion rather than a route.)

**Customer touch count:** **1.** `localCap` stays 1; the required `post_purchase_followup.cooldown`
stays (completions landing close together produce one follow-up, not one each).

**Final flow:** as current, on email alone, with the wait card corrected. No node is added, removed or
re-routed.

**State re-checks:** `w.settle.recheck` re-reads the fulfilment record, any problem raised against it,
and the person's permission, from the systems that own them, before the one and only send. This is the
model re-check in this corpus and nothing needs adding.

**Stop conditions:** `post_completion_issue_reported` ends the instance at `x.superseded` the instant
it arrives — the remedy lifecycle owns the completion and this journey does not queue beside it.
`permission_withdrawn` → `x.closed`. Nothing useful recorded against what was delivered → nothing sent
(`s.substance`).

**Ownership / handoff:** `post-purchase-welcome`, `scope: person`, `onLoss: suppressed`, **below
FUL-301 and above RET-290**; all three sides declared and agreeing. No handoffs — a problem *ends* this
journey rather than being passed on, because the remedy lifecycle opens from its own event. The
boundary with **RET-290 stays**, stated from this side: different subject (*the thing that arrived* vs
*the person having become a customer*), different trigger and entity (`authoritative_delivery_completion`
keyed `person_id + fulfillment_id`, every completion, vs `first_purchase_completed`, once per person
ever), different failure mode (guidance landing before the thing does, vs a bounceback spent on
somebody who was about to buy anyway). **They are not variants and must not be merged:** a completion
that is also a first purchase produces two ordered messages about two different things. **Must not
say:** welcome, a bounceback, anything about the relationship, and it never confirms the order
(`s.confirmation`).

**Canonical changes needed:** `orchestration.touches[t1].channelRoles` → `["persistent"]` (drop
`in-session` and `low-friction`); drop `push` and `in_app` from `channelsDeclared`;
`channelStrategy.fallback` becomes irrelevant at one role and should be stated as such rather than left
saying `next-eligible-role`.

**Display-only changes needed:** none.

**Renderer changes needed:** R1, **R6 — the collapsed-wait duration strip must read the timeout
`Config`'s own rule and never an `until` event's description; abort events belong in the detail panel.
This is generic and affects every Family-B-collapsed wait in the corpus**, R9, R11.

---

## FUL-301 — Order Confirmation

**CONFLICT — ESCALATED** (channels only; see the last paragraph of *Final customer channels*).

**Purpose:** State once, at the moment the fulfilment record opens, exactly what the business has
taken on and what it has not — the question every later message about this order assumes has already
been answered.

**Current flow:**
```
Trigger fulfillment_obligation_accepted
  → c.stands: does the accepted obligation still stand, and what does it cover?
      ├ Accepted in full ─┐
      ├ Accepted in part ─┴→ c.sendable [hidden gate]
      │                         ├ Sendable → a.confirm (email · sms · in_app)
      │                         └ No route → [record reason] → x.no-action (not drawn)
      └ Nothing stands → EXIT x.void
  a.confirm → w.stands (order_confirmation.record_window; until handed-to-executor
                        | cancellation-effective)
      ├ on timeout → EXIT x.confirmed
      └ on event → c.outcome: what became of the order?
            ├ It started moving → EXIT x.confirmed
            └ Cancelled before it moved → h.cancelled → FUL-150
```

**Problems found:**
- **Three channels on the one transactional record every other post-purchase journey defers to.**
  J ranks this fourth in its nine-to-do-first list: sending one transactional record on three
  channels turns it into three records, which is exactly the duplicate `s.once` exists to prevent,
  and `s.partial` requires the accepted scope, the declined scope and the reason to be in the **same
  message** while `s.record` requires the amount as the financial record holds it — none of which
  fits an SMS or survives an in-app session.
- **The EN wait card reads `"Until a prepared item"`** — nonsense. The TR card on the same node reads
  correctly (*"Sipariş harekete geçene ya da iptal edilene kadar"*). The EN label derivation is
  producing a phrase from something other than the wait's own `Config` rule, and the locale sweep
  cannot see it because English prose on an English route is not a leak. (fulfillment §4.1)
- **FUL-301 and SCH-277 do not distinguish an order from a reservation.** Neither names the other in
  any field; a business that sells a reservation as an order opens both records on one transaction and
  confirms both. (ownership **P1-7**, F5 re-verified)
- **`post-purchase-welcome` declares `scope: "person"` while this journey's own precedence says "the
  order's own"** — the difference between a contact-pressure judgment and an ownership claim over
  another order, and no field says which it is. (ownership **P2-1**)
- Nothing else. This journey is otherwise the reference implementation of its domain.

**Final orchestration:** **single**, with one trailing **event-or-timeout** observation window that
sends nothing. There is exactly one thing to say and exactly one moment at which it is true. No
sequence, because a second message would read as a second order (`s.once`). No fallback, because no
channel is unavailable. The trailing wait exists only to decide which of two endings the record
reached.

**Final customer channels:** **email**, alone. — **CONFLICT — ESCALATED.** J (binding column) settles
`a.confirm` as `single` / email on the evidence above. The fulfilment audit's verdict is *"canonical
changes needed — none"*, keeping email + SMS + in-app on the grounds that SMS is conditioned by its
role's `when` (*"the accepted obligation carries a time-bound action the person has to take"* — a
collection slot, a confirmation owed back) and in-app by *"where the order was placed inside the
product"*. **I applied J**, because J's `UNRESOLVED` finding is that no node in this graph reads either
`when`, and because J's reason is specific to this journey's own suppressions rather than to the role
vocabulary. **The dissent is recorded, and the product owner should confirm it**, because it is the one
place in this part where a horizontal verdict overturns a domain audit's categorical "change nothing".
What it costs: one field. `orchestration.touches[t1].channelRoles` goes from three roles to one. **It
adds no touch, no node, no edge, no marketing and no group change**, and every one of the six authored
suppressions is untouched.

**Customer touch count:** **1.** `mandatory: true`, `pressureClass: "none"`,
`order_confirmation.discretionary_touches` = 0. Unchanged.

**Final flow:** exactly as current, on email alone, with the EN wait label corrected. **No node is
added, removed or re-routed.**

**How FUL-301 is kept from acquiring work it does not need — the explicit do-not list:**
- No second touch, no reminder, no *"your order is being prepared"*, no post-purchase marketing, no
  cross-sell, no review request. Six authored suppressions already forbid all of it (`s.accepted`
  `s.record` `s.partial` `s.once` `s.status` `s.marketing`) and **none is relaxed**.
- No exclusion-group change. It is and stays **highest in `post-purchase-welcome`** with
  `onLoss: "suppressed"`, so FUL-291 and RET-290 wait behind it.
- The `Accepted in full` / `Accepted in part` branches are **not** split into two message cards. They
  merge onto one display edge because both go to the same node; the split changes what the message
  *says* (a declined scope must be stated in the same message, `s.partial`) and not where the customer
  goes. Content, not path. R4 leaves the merge alone because two edges still survive.
- `c.sendable` stays hidden. It is the textbook implementation gate: its short arm passes through a
  bookkeeping hop before exiting, which is the corpus's own signal for "may the touch go out?".
- **RET-290 First Purchase Thank You stays distinct.** Different entity, different trigger, different
  once-ness. Nothing from RET-290 moves here.

**State re-checks:** one, and it is enough — `w.stands.recheck` re-reads the fulfilment record and any
cancellation against it from the systems that own them, before the timeout is acted on.

**Stop conditions:** `fulfillment_cancellation_effective` → `x.void` before the send, `h.cancelled`
after it. `fulfillment_handed_to_delivery_executor` → `x.confirmed`; from that instant FUL-265 owns the
narration and this journey is silent forever.

**Ownership / handoff:** highest in `post-purchase-welcome`; never itself deferred (transactional); the
contest is declared from this side so the other two have a named side to defer to — ownership records
that clause as the house style. One handoff, `h.cancelled` → FUL-150 (non-public, text + R10).
`distinctFrom` FUL-265, FUL-146, FUL-291, RET-290, FIN-131, all five correct. **Must not say:**
anything about progress, position or lateness (`s.status` — FUL-265's and FUL-146's), and it never
confirms the obligation to *pay* that arises from the same event (FIN-131's).

**Canonical changes needed:**
- `orchestration.touches[t1].channelRoles` → `["persistent"]`; drop `sms` and `in_app` from
  `channelsDeclared`. **This is the escalated change and the only one that touches behaviour.**
- `distinctFrom` += **SCH-277**, and `suppressions[s.status]` extended, per ownership P1-7 / F5 (the
  reciprocal row is specified in SCH-277's section below, so the pair lands in one edit).
- `contact.competition.precedence` — append the ownership P2-1 sentence stating that the group's scope
  is the person rather than the order deliberately, as a contact-pressure judgment and not an ownership
  claim over another order.

**Display-only changes needed:** none.

**Renderer changes needed:** R1, **R6 — the EN wait-label derivation must read the wait's own `Config`
rule**, R9, R10, R11.

---

## REM-151 — Post-Purchase Issue Recovery

**Purpose:** Establish whether something delivered has left an obligation unresolved, and which
recovery mechanism could satisfy it.

**Current flow:**
```
Trigger post_completion_issue_reported
  → [capture: issue id, what it concerns, the problem as reported, scope, when, evidence]
  → c.duplicate: does an existing recovery case already cover this problem?
        ├ Already covered → [attach evidence to the open case] → EXIT x.attached
        └ Nothing open → [assess: unresolved obligation, or an experience that fell short?]
              → c.actionable: is there an actionable unresolved obligation?
                    ├ Actionable → [classify the remedy route] → h.remedy → REM-157
                    └ Not actionable → a.acknowledge (email) → EXIT x.no-defect
```

**Problems found:**
- **It looks like the only customer message is on the branch where nothing happened — and that reading
  is wrong, but nothing on the page says so.** On the actionable branch the person hears nothing from
  REM-151 because **REM-157 speaks immediately**: REM-157 has no entry wait, so `h.remedy` → `a.present`
  is one hop and the remedy options are the next thing that arrives. An acknowledgement here followed a
  second later by an options message would be two senders on one problem — exactly what REM-305's
  `s.contest` exists to prevent. **The current design is right; do not add a touch.** What is missing is
  the *statement* of it. (fulfillment)
- **`x.no-defect` renders as "Heard" / "dinlendi".** The canonical state is *"heard; no unresolved
  obligation and no remedy owed"*; `splitExitState` cut at the semicolon and left a one-word card on the
  branch that most needs explaining — the branch where the answer is no. (fulfillment §4.3)
- **No `distinctFrom` for REM-305 or FUL-148**, both of which hand it cases, nor for RET-26, the
  library's general service-recovery journey whose evidence explicitly includes a failed fulfilment.
  (fulfillment; ownership D-18, §2.7)
- `observes` empty on both conditions.
- **Raised, not decided:** `REM-305 h.owner` → REM-151 assumes every still-open support request is a
  post-completion issue. REM-151's stated eligibility is *"a concrete problem with a completed fulfilment
  or service"*; REM-305 opens on **any** service request. See REM-305's section — the decision belongs to
  whoever owns the remedy arc.

**Final orchestration:** **single.** No wait anywhere in the graph, deliberately — one of only seven
journeys in the 69 with none, and it should stay that way. A reported issue is answered now, not after a
window; one assessment pass, one answer. J agrees (`single`, and it is one of only two stages in this
part already declaring a single channel).

**Final customer channels:** **email**, alone, on the not-actionable branch. (J: already correct. Telling
somebody their report does not describe an unresolved obligation is a decision they may want to contest;
it needs a route they can reply to and keep. No in-app — the person did not necessarily report it in the
product. No SMS — nothing is time-bound and nothing is asked.) Both audits agree; no arbitration needed.

**Customer touch count:** **1.** `localCap` stays 1.

**Final flow:** unchanged.

**State re-checks:** none needed — there is no interval to re-check across. `c.duplicate` reads the
open-case state at entry, which is the only read that matters.

**Stop conditions:** an existing case covering the same obligation absorbs the report at `x.attached`
(`s.g4` — two remedies on one obligation produce two refunds and the second is found by accounting). An
assessment finding no unresolved obligation ends it at `x.no-defect`, with the acknowledgement sent.
`s.g3` — not every issue defaults to a refund — governs the classify step.

**Ownership / handoff:** **second in `service-request`: below REM-305, above REM-157** — the order is
declared from all three sides, and ownership records this group as one of the few backed by a real edge
(`REM-305 h.owner → REM-151`) rather than by precedence alone. One handoff → REM-157 (public, links),
carrying the problem stated as *what is owed* rather than as what was complained about. Entered from
three places: a direct report, `FUL-148 h.return` (which mints a fresh `issue_id` because FUL-148 has no
issue concept) and `REM-305 h.owner`. **Must not say:** anything about the money — `s.money` names
FIN-137 as the decider and FIN-302 as the announcer — and it never presents remedy options, which is
REM-157's first message.

**Canonical changes needed:**
- Add the silence statement to the journey's own `reusableRule` / entity note: *"On the actionable branch
  this journey says nothing, because remedy selection speaks on the same hop. Acknowledging an issue and
  then presenting remedy options a moment later is two senders on one problem."* This is the finding that
  most needs to be visible to a reader, and it is a prose change, not a graph change.
- `distinctFrom` += **REM-305**, **FUL-148**, **RET-26** (ownership D-18, both directions).
- Populate `observes` on `c.duplicate` and `c.actionable`.

**Display-only changes needed:** none. The four absorbed internal actions (`a.capture`, `a.attach`,
`a.assess`, `a.classify`) are correctly absorbed; 11 canonical → 7 display is the right read.

**Renderer changes needed:** R1, **R8 — `splitExitState` must take the longest cut that fits the budget,
never the shortest, and never below a floor**, R9, R11.

---

## REM-157 — Remedy Confirmation

**Purpose:** Choose the remedy that would actually satisfy the unresolved obligation, from the ones that
genuinely exist — and tell the person which one it is.

**Current flow:**
```
Trigger remedy_decision_required
  → [identify the unresolved obligation precisely]
  → [evaluate the remedies policy actually makes available]
  → c.choice: does the counterparty choose between remedies?
        ├ They choose → a.present (email · in_app)
        │      → w.selection (until remedy_selected)
        │          ├ on event → c.route
        │          └ on timeout → [apply the policy default, recorded as "no selection made"]
        │                             → c.route
        └ No choice to make → c.route
  c.route: which remedy resolves the obligation?
        ├ Correction or reperformance → h.correction → REM-156
        ├ Replacement → h.replacement → REM-155
        ├ Return, before anything else → h.return → REM-152
        ├ Refund or credit → h.financial → FIN-137
        └ No remedy is owed → a.no-remedy (email · in_app) → EXIT x.no-remedy
```

**Problems found:**
- **The journey called Remedy Confirmation does not confirm the remedy.** Four of `c.route`'s five
  branches — every branch on which a remedy is actually applied — send **nothing**. The only message on
  the outcome side is *"no remedy is owed"*. Two specific people get nothing: the person for whom there
  was no choice to make, who hears nothing at all from this journey; and the person who **was offered a
  choice and did not answer**, for whom `a.default` applies the policy default and records *"no selection
  made"* and who is never told what was chosen for them. All four receiving journeys are non-public, so a
  library reader sees four unopenable cards and one message. (fulfillment)
- **A TR collision on the canvas.** `h.return` (REM-152 Return Request) and `h.financial` (FIN-137 Refund
  Request) both render as *"İade Talebi"* — two different handoff cards with an identical Turkish label
  on one canvas. Turkish uses *iade* for both; the EN canvas distinguishes them and the TR canvas cannot.
  (fulfillment §4.2)
- **TR `h.replacement` leaks the target's full title** *"Değişim kararı → tahsis etme → teslim etme →
  onaylama"* where EN renders *"Replacement Fulfillment"*. (fulfillment §4.2)
- `observes` empty on all three conditions.
- One-sided `distinctFrom`: SUB-298 names REM-157, REM-157 does not name back. (ownership D-24)

**Final orchestration:** combination — **conditional routing** (`c.choice`: does the counterparty
genuinely choose between remedies at all? — it decides whether a message is sent and a window opened, or
whether the route is taken directly) plus **event-or-timeout** on `w.selection`. Per stage J settles
both existing stages as `single`. Not sequential: the two messages are a presentation and its answer, one
state change apart.

**Final customer channels:** `a.present` → **email**. `a.no-remedy` → **email**.
`a.confirm-remedy` *(new)* → **email**. (J binding on the two existing stages: options with consequences
have to be read, compared and referred back to, and the refusal is the one message somebody is most
likely to quote or escalate. In-app is dropped from both. **No SMS** — choosing between a correction, a
replacement, a return and a refund is not an SMS decision even though `remedy_selection.selection` has a
deadline. The new stage has no J row; it takes email for the same reasons as its two siblings, which is
also the consistent reading of J's verdict on this journey. The fulfilment audit proposed email + in-app
on all three; the in-app is superseded.)

**Customer touch count:** **2** on the longest path — `a.present` then `a.confirm-remedy`, or `a.present`
then `a.no-remedy`; **1** where there was no choice to make. `localCap` stays 2.

**Final flow:**
```
Trigger remedy_decision_required
  → [identify the obligation · evaluate available remedies — absorbed]
  → c.choice: does the counterparty choose between remedies?
        ├ They choose → a.present (email)
        │      → w.selection
        │          ├ remedy_selected → c.route
        │          └ on timeout → [policy default, recorded as "no selection made"] → c.route
        └ No choice to make → c.route
  c.route: which remedy resolves the obligation?
        ├ Correction or reperformance ─┐
        ├ Replacement ─────────────────┤
        ├ Return, before anything else ┼→ a.confirm-remedy (email)            ← NEW
        ├ Refund or credit ────────────┘        → h.correction / h.replacement / h.return / h.financial
        └ No remedy is owed → a.no-remedy (email) → EXIT x.no-remedy
```

**The new touch, and the line it must not cross.** `a.confirm-remedy` states **which remedy will resolve
the obligation and what happens next** — and, where the selection timed out, that the policy default was
applied because no selection was made. It carries `destination.mustNotClaim`, written to REM-305's
standard:
- *"a refund: not the amount, not when it will appear, not whether it has settled"* — a refund selected as
  the **remedy** is a decision about what satisfies the obligation. That money is owed is FIN-137's
  decision; that money has moved is FIN-302's announcement. This journey names the remedy and stops.
- *"a date the receiving journey has not committed to"*
- *"that the remedy is complete"* — it has been selected, not performed.

**State re-checks:** `w.selection.recheck` re-reads the confirmed issue and its obligation before the
timeout is acted on. **Add one before `a.confirm-remedy`:** a remedy the receiving journey has already
begun, or an obligation satisfied meanwhile, must not produce a confirmation of a decision that has been
overtaken.

**Stop conditions:** `remedy_selected` closes the window. The selection window expiring applies the
policy default rather than reopening the question (`s.g3` — a remedy that cannot be delivered is never
offered, so the default is always deliverable). A confirmed issue reaching *no remedy owed* is **always**
said out loud: `a.no-remedy`'s own prose is explicit that *"reaching no remedy and saying nothing leaves
the person believing the question is still open"* — which is the same reasoning that justifies the new
confirmation on the other four branches.

**Ownership / handoff:** **lowest in `service-request`**; suppressed for a case while REM-305 or REM-151
holds it. Four handoffs, all non-public: REM-156, REM-155, REM-152, FIN-137 (text + R10). The FIN-137
handoff already carries the explicit fact that this journey selected the remedy and did **not** decide the
refund is owed — keep that sentence; the new touch must not contradict it. **Must not say:** the money, on
any branch. The existing `distinctFrom: FIN-302` sentence (*"a remedy confirmed here is never money
arrived"*) is already the rule; the new touch is the first place it has to be enforced rather than asserted.

**Canonical changes needed:**
- New action **`a.confirm-remedy`**, `execution: "communication"`, reached from `c.route`'s four remedy
  branches, target = the corresponding handoff. Per-parent instancing will draw it once per branch, which
  is correct — the sentence differs per remedy.
- New `orchestration.touches` entry, stage `remedy-confirmed`, roles `["persistent"]`, `mandatory: false`,
  with the three `mustNotClaim` clauses above.
- New suppression `s.money`, modelled on REM-305's: *"No message from this journey states the money. That
  a refund is owed is FIN-137's decision and that it has moved is FIN-302's announcement; this journey
  names the remedy and nothing about the payment."*
- `orchestration.touches`: drop `in-session` from `t1` (present) and `t2` (no-remedy).
- Add `recheck` before `a.confirm-remedy`.
- `distinctFrom` += **SUB-298** (ownership D-24).
- Populate `observes` on `c.choice`, `c.route`, and on `w.selection`'s arms.
- **Content fix, not a renderer one:** give `h.return` and `h.financial` distinguishing short TR names —
  e.g. *Ürün İadesi Talebi* and *Para İadesi Talebi* — so two handoff cards on one canvas stop reading
  identically.

**Display-only changes needed:** none.

**Renderer changes needed:** R1, R7, R9, R10, R11.

---

## REM-305 — Support Request Acknowledgement

**Purpose:** Tell somebody who raised a problem that it exists, is owned and is not lost — once,
transactionally, and without promising an outcome nobody has decided yet.

**Current flow:**
```
Trigger support_request_received
  → a.capture [under a quotable reference, with a named owner; records the intake route
               and the moment it was received]
  → c.covered: is an open request already covering this problem?
        ├ Already covered → [attach] → EXIT x.attached
        └ Nothing open → c.immediate: was this already resolved when it was received?
              ├ Resolved on receipt → [gate] → a.resolved-now (email · in_app) → EXIT x.resolved
              └ Still open → [gate] → a.acknowledge (email · in_app)   [mandatory: true]
                    → w.window (support_ack.window; until support_request_resolved
                                | request_withdrawn)
                        ├ on event → c.outcome: what resolved the window?
                        │     ├ Resolved → [gate] → a.resolution (email · in_app) → EXIT x.resolved
                        │     └ Withdrawn → EXIT x.withdrawn, nothing further sent
                        └ on timeout → c.open: is the request still open now the window has closed?
                              ├ Still open → h.owner → REM-151   [and NOTHING is sent]
                              └ Closed while the window ran → a.resolution → EXIT x.resolved
```

**Problems found:**
- All three stages render a hierarchy that suggests in-app is a retry of email. (J `UNRESOLVED` ×3)
- **`w.window` is truncated in both locales** — EN *"Until the team"*, TR *"Talep sahibi ekip"*. This is
  the journey's only wait and it is the anti-drip window, the one card a reader most needs to understand,
  and neither locale renders a complete phrase. (fulfillment §4.1)
- **`h.owner` → REM-151 is a category assumption.** REM-151's stated eligibility is *"a concrete problem
  with a completed fulfilment or service"*; REM-305 opens on **any** service request — a billing question,
  an account question, a how-do-I. Every still-open request is handed to a journey whose subject is a
  completed fulfilment, with a minted `issue_id`. **Flagged, not resolved.** (fulfillment §5)
- One-sided `distinctFrom`: REM-305 names REM-151, REM-151 does not name back. (fulfillment; ownership)

**Verified intact and preserved exactly.** Both state-change touches carry the refund prohibition in
`destination.mustNotClaim`, verbatim — *"a refund: not the amount, not when it will appear, not whether it
has settled"* — on **t2** (`a.resolved-now`) and **t3** (`a.resolution`). It is restated in the actions'
own prose and again as the suppression `s.money`, which names FIN-137 as the decider and FIN-302 as the
announcer; `a.resolution`'s `does` sentence says a resolution was reached *"named in the terms the
requester raised it in rather than in the terms of any money that moved"*. **Nothing in this section
relaxes any of it, and the channel and pattern change below does not touch those three fields.** The two
rules the brief names are also both in the data and both stay: *resolved on receipt gets a resolution
message and never an acknowledgement* (`c.immediate` → `a.resolved-now`, `s.already-resolved`), and *still
open at the window's close is handed to REM-151 and gets nothing* (`c.open` → `h.owner`, no send node on
that edge, `s.no-drip`: *"nothing is sent because a period elapsed"*).

**Final orchestration:** combination — **conditional routing**, twice over, plus one **event-or-timeout**
window. The business routing point is `c.immediate` (*was this already resolved when it arrived?*), which
changes which message the requester gets. The **channel** routing point is the recorded intake route,
which J settles as this journey's pattern for all three stages: *answer where they asked*. The window is
an observation window, not a cadence — it sends on the request's own state change and never on elapsed
time. Not sequential; the acknowledgement and the resolution notice are one state change apart, not one
interval apart.

**Final customer channels:** **the intake route the request arrived on** — from `{email, in_app}` —
**with email wherever that route cannot carry a reference the requester can quote later.** (J binding, and
J ranks this ninth in its nine-to-do-first list as one of the two cheapest conditional routings to
implement, because **the signal is already captured at entry**: the trigger evidence requires *"the intake
route it arrived on and the moment it was received"* and `a.capture` records it. Somebody who raised a
problem in one place and is answered in another has to work out whether they are being answered at all.
The exception is a genuine routing rule, not a fallback — nothing failed. **No SMS, and it should be said
out loud:** an acknowledgement is not urgent by construction, its content being *"nothing has happened
yet"*, and a quotable reference number is exactly the thing SMS loses.)

J records this stage in its own *"could not settle"* list at one remove: whether the intake routes in use
can each carry a persistent reference. If some can and some cannot, the caveat becomes a second branch
rather than a clause. That is an implementation input, not a redesign.

**Customer touch count:** **2 maximum on any one instance**, in one of two shapes: either the
resolved-on-receipt message alone, or the acknowledgement followed by one resolution notice. Three
communication actions are declared; the first two are mutually exclusive. The acknowledgement is
`mandatory: true` and sits outside `support_ack.touches`, whose discretionary budget is 1. Unchanged.

**Final flow:** as current. **No structural change proposed**, and no send node is added on the `h.owner`
edge.

**State re-checks:** `w.window.recheck` re-reads the request from the system that owns it — whether it is
still open, who owns it now, and whether anything has been recorded against it — before the timeout is
acted on. `c.open` then asks the question again against that fresh read. This is the correct double-read
for a journey whose second message is conditional on the first not having been overtaken.

**Stop conditions:** `support_request_resolved` → resolution notice → `x.resolved`. `request_withdrawn` →
`x.withdrawn` with nothing further sent (`s.withdrawn`: *"a withdrawn request is not a quiet one"*). An
open request already covering the same problem → `x.attached`, acknowledged once. The window closing on a
still-open request → handoff, silence.

**Ownership / handoff:** **highest in `service-request` while the request is only a request**, with
`s.contest` silencing REM-151 and REM-157 until ownership moves at the handoff; once it moves at `h.owner`
this journey sends nothing further, ever (GLB-06). One handoff → REM-151, public, links. **Must not say:**
the refund — not the amount, not the timing, not whether it settled; that belongs to FIN-302, and
ownership records the FIN-302 ↔ REM-305 boundary as reciprocal and closed in `distinctFrom`, in REM-305's
`s.money` and in FIN-302's `s.decision`.

**Raised and deliberately not decided — `h.owner`'s category.** Two honest ways forward, neither taken
here: **(a)** condition `c.open`'s *"Still open"* arm — where the request concerns a completed fulfilment
or service → `h.owner` → REM-151 unchanged; otherwise a new exit `x.owned` (class `success`), *"the request
is with the team that owns the work, and this journey says nothing further about it"* — which keeps the
anti-drip rule exactly, adds one honest ending and keeps REM-151's stated eligibility true; **(b)** widen
REM-151's eligibility to *"any service request with a concrete problem behind it"*, making it the generic
assessment entry its position in the group already implies, and accept that its name then understates it.
(a) is the smaller change; (b) is the more truthful one. It needs the remedy arc's owner.

**Canonical changes needed:**
- `orchestration.touches[t1..t3]` gain the conditional channel rule keyed on the recorded intake route,
  with the quotable-reference exception written into it. The signal is already captured by `a.capture`;
  **nothing is invented.** (This supersedes the fulfilment audit's *"canonical changes needed — none
  required"* on the channel question only; no structural change follows.)
- Reciprocal `distinctFrom` on **REM-151** naming REM-305 (specified in REM-151's section).
- `observes` on `c.covered`, `c.immediate`, `c.outcome`, `c.open` where absent.

**Display-only changes needed:** none. Where the routing condition's `when` names a customer-visible
difference, R1 draws it on the card's rows rather than as a new Decision node — the intake route is not a
fork in the customer's path, it is which door the same message comes through.

**Renderer changes needed:** R1, **R6 — the `w.window` truncation in both locales**, R9, R11.

---

## SCH-266 — Appointment Reminder

**Purpose:** Get the customer's side of a confirmed commitment done before the commitment arrives, and
build the reminder from what the booking *is* at send time, not from what it was.

**Current flow:**
```
Trigger confirmed booking with customer-owed prerequisites
  → c.time: is there enough time for a prompt to be worth sending?
      ├ Time remains → a.prompt (every outstanding prerequisite, one message) [email + in_app]
      │       → w.prereq (pre-start window; until prerequisites_completed
      │                   | booking_materially_changed)
      │            ├ on event → c.prereq ├ All complete → w.prestart ─┐
      │            │                      └ Booking changed → EXIT x.superseded
      │            └ on timeout ──────────────────────────────────────┤
      └ Too close to prompt ───────────────────────────────────────────┴→ a.revalidate
  → a.revalidate [re-read booking from authoritative state]
  → c.valid: does the booking still stand as just read?
      ├ Cancelled/moved → EXIT x.superseded
      └ Still valid → c.critical: is anything outstanding that would stop the service?
          ├ Critical missing → a.at-risk [sms + email] → h.at-risk → SCH-174
          └ Nothing critical → a.remind [sms + email + in_app] → h.prestart → SCH-177
```

**Problems found:**
- **Both success endings are handoffs into archived Operational Workflows journeys** (SCH-174, SCH-177,
  `isPublicDestination: false`), so they render as plain text with no link. The journey's only drawn exit
  is `x.superseded` — a reader follows the reminder going out and the canvas stops on an unexplained dead
  card. Verified: one exit, two handoffs. (scheduling F3-D)
- **`a.remind` carries three channels with no differentiation, and in-app is the wrong carrier for a
  reminder.** A reminder that only arrives if the person opens the product is not a reminder.
  (scheduling; J `UNRESOLVED`)
- **`a.at-risk` reads as a ladder — `Primary: SMS · Fallback: Email` — on the one mandatory,
  last-chance message in the journey**, which makes the most consequential message look optional on one
  channel. (J §4.1 item 8; canvas P0-2)
- `w.prestart` sends `onEvent` and `onTimeout` to the **same** node, which makes its
  `untilEvent: ["booking_materially_changed"]` decorative on the canvas — the change is actually caught
  by the re-read that follows. (scheduling)
- **No `distinctFrom` row for any `booking-lifecycle` member**, and none for TIM-268.
  (ownership D-16, D-28)

**Final orchestration:** combination — a state-gated **single** prompt, then a mandatory revalidation,
then **conditional routing** at `c.critical` selecting **exactly one of two mutually exclusive messages**,
with the at-risk arm sent **parallel**. The choice is between *warning* and *reminding*, which are
different messages with different obligations, different escalation targets and different caps — the
split changes what is said, who it escalates to and whether the touch is capped. Two **event-or-timeout**
windows (`w.prereq`, `w.prestart`). Not a fallback chain anywhere.

**Final customer channels:**
- `a.prompt` → **email**. (J: every outstanding prerequisite, whose it is, and the point by which each
  must be done — deliberately one message rather than one per requirement, which makes it a list, and
  lists are read, not glanced at. In-app is dropped; the scheduling audit kept it as a parallel route.)
- `a.at-risk` → **SMS and email, once, as a parallel send.** (J binding, and this is one of the corpus's
  four real parallel moments: the SMS carries the last point at which the thing can still be done,
  because the person may be away from a desk; the email carries the time, the place and *how* to do the
  thing, **because the at-risk notice also has to restate the booking** — the SCH-304 precedence note
  depends on it doing so. Different jobs, one moment, mandatory, sent once. Not a hierarchy.)
- `a.remind` → **SMS**. (J binding: the time, the place or joining route, and anything outstanding that
  does not block it — short, one-shot, about a commitment in the next day or two, read on a phone, and
  `s.once` guarantees there is exactly one. Email and in-app are both dropped. The scheduling audit
  proposed SMS same-day / email otherwise; superseded, because the stage is reached only inside the
  pre-start window, which is what makes the text defensible in the first place.)

**Customer touch count:** **2 maximum** — the prompt, then exactly one of at-risk / reminder. Frequently
**1**, when the booking is confirmed inside the pre-start window (`s.too-close`).

**Final flow:** shape unchanged. Only the channel plans change, and the two handoff cards gain the
archived-target affordance.

**State re-checks:** `a.revalidate` before every send — it re-reads the confirmation, the time, the
provider and the outstanding prerequisites from authoritative state — then `c.valid` and `c.critical`
immediately after. **This is the strongest re-check discipline in the domain and must not be simplified.**
`s.changed` forbids building any touch from a stored copy.

**Stop conditions:** `booking_materially_changed` or a cancellation at any point → `x.superseded`
(`s.changed`). One reminder per occurrence, ever (`s.once`). Deduplicated against SCH-277 and SCH-180 on
the same booking (`s.dedup`).

**Ownership / handoff:** **third in `booking-lifecycle`** (SCH-277 > SCH-303 > SCH-266 > SCH-304),
`scope: reservation`, `onLoss: suppressed`. Ownership records this as the best-stated group in the corpus
— a total order with no ties, every member naming every other by id, and the loser's cost written down.
**Do not reopen the ordering.** `h.at-risk` → SCH-174 and `h.prestart` → SCH-177, both archived, both
carrying `suppresses: ["any further reminder for this occurrence"]`. **Must not say:** anything that
presumes a commitment SCH-277 has not yet established, and it is suppressed entirely while SCH-303 holds
the reservation.

**Canonical changes needed:**
- `a.remind`: `channelRoles` `["urgent","persistent","in-session"]` → `["urgent"]`.
- `a.prompt`: `channelRoles` → `["persistent"]`.
- `a.at-risk`: keep both roles and mark the touch **parallel** (`simultaneous`, or K §5.2's
  `pattern: { kind: "parallel", reason: … }` once it exists), so the canvas stops ranking them.
- `distinctFrom` += **SCH-277**, **SCH-303**, **SCH-304** (ownership D-16 — all three already name it)
  and **TIM-268** (ownership D-28).
- Optional, low value: give `w.prestart` a single successor, since both arms already converge. Leave it
  if the Family-B collapse is doing the job.

**Display-only changes needed:** the at-risk / reminder pair should read as a two-way branch on one row,
not as a ladder — which follows from R1 once `a.at-risk` is parallel and `a.remind` is single-channel.

**Renderer changes needed:** R1, R9, **R10 — both endings are archived handoffs, and this is one of the
two journeys in this part that end *only* in them**, R11.

---

## SCH-277 — Booking Confirmation

**Purpose:** Tell the requester whether the time they asked for is now a commitment, and where it is not,
offer what actually exists — because the availability they were shown was a picture and never a hold.

**Current flow:**
```
Trigger reservation_request_recorded
  → a.received ("this is not yet a commitment; the outcome comes at X") [email + sms]
  → w.outcome (booking semantics' own resolution period; until booking_confirmed
               | booking_request_rejected)
      ├ on timeout → a.lapse [email + sms] → EXIT x.lapsed
      └ on event → c.outcome: what did revalidation decide?
           ├ Committed → a.confirm [email + sms] → EXIT x.confirmed
           ├ Gone, something near → a.reoffer (current availability + deadline) [email + sms]
           │        → w.choice (stated choosing deadline)
           │             ├ on timeout → EXIT x.lapsed
           │             └ on event → c.choice ├ Took a slot → h.rebook → SCH-173
           │                                    └ Declined all → EXIT x.declined
           └ Gone, nothing near → a.decline (with next horizon) [email + sms] → EXIT x.declined
```

**Problems found:**
- **Five messages, one channel plan** — the worst instance in the domain, and J's count agrees: 5 of 5
  stages rendering Primary/Fallback. The acknowledgement that says *"this is not yet a commitment"*, the
  confirmation, the re-offer, the decline and the lapse notice are five different business moments with
  at least three different urgency profiles.
- **SMS on the acknowledgement is actively harmful.** The journey's own first guardrail is *"A request
  acknowledged is never worded as a request confirmed."* A text message about a booking is read as a
  booking. The channel choice contradicts the guardrail the journey exists to enforce. (scheduling F3)
- **`a.lapse` is reached from `w.outcome`'s timeout without a state re-read.** Every other journey in
  this cluster re-reads before sending; this one sends *"nothing was booked"* off the wait arm alone. If
  the confirmation landed late, the lapse notice contradicts it. (scheduling)
- **Its suppressions are its guardrails restated verbatim as `s.g1`…`s.g5`.** There is no `s.contest`
  even though it is the top of `booking-lifecycle`, and no statement of what happens when the request is
  superseded by a newer one from the same requester. (scheduling F4)
- **SCH-277 and FUL-301 do not distinguish a reservation from an order.** Neither names the other in any
  field. (ownership **P1-7**)

**Final orchestration:** combination — **conditional routing on an authoritative outcome** (`c.outcome`,
three exclusive arms, deciding which single outcome message is sent) plus **event-or-timeout** on
`w.outcome` and, on the re-offer branch only, on `w.choice`. There is one acknowledgement and then
exactly one outcome message, selected by what the booking system decided. Nothing here is sequential in
the cadence sense and nothing is a fallback. The second window exists only because the requester now has
a decision to make against a stated deadline.

**Final customer channels:** **email on all five stages.** (J binding, and it settles the whole journey
at one channel with a per-stage reason: `a.received` — every stage answers *does a commitment exist?* and
this one says explicitly that it does not yet, which is wording `s.g1` makes load-bearing and is an
argument for a channel with room in it; `a.confirm` — `s.g5` requires the concrete slot restated every
time, date, time, place, what is needed on arrival, which is the record the person brings with them, and
**the SMS in the day before is SCH-266's job, keeping the two separate being why the precedence rules
exist**; `a.reoffer` — a list of slots with a deadline for choosing; `a.decline` — it could not be
committed, nothing is being held, and when capacity of this kind is next expected; `a.lapse` — `s.g4` is
why the stage exists, because silence after a request is read as a commitment, and it is said once,
plainly, on the route the acknowledgement went out on. The scheduling audit made `a.reoffer` the
journey's genuine SMS case and kept a conditional SMS on `a.confirm`; both are superseded.)

**Customer touch count:** **2** — the acknowledgement plus exactly one outcome message. The cap of 2 is
correct and unchanged.

**Final flow:** shape unchanged, on email throughout, plus one state re-read before the lapse notice:
```
  w.outcome ─timeout→ a.reread-outcome → c.resolved-after-all?
                            ├ Resolved after all → c.outcome
                            └ Still unresolved   → a.lapse (email) → EXIT x.lapsed
```

**State re-checks:** `c.outcome` reads the booking record's verdict, not the wait arm — correct. Adding
the re-read before `a.lapse` closes the one gap.

**Stop conditions:** currently none beyond the guardrails. Required additions, written as real
suppressions rather than restated guardrails: exit where the requester cancels the request; exit where a
**newer request from the same requester for the same resource supersedes this one**; and an `s.contest`
stating its own top position from its own side (it is today only in `contact.competition.precedence`).

**Ownership / handoff:** **highest in `booking-lifecycle`**, `onLoss: suppressed`. Its precedence claims
that *"while the requested time has not yet become a commitment, nothing else may speak to the requester
about this booking"* — SCH-303, SCH-266 and SCH-304 are all suppressed for it. **Do not reopen.**
`h.rebook` → SCH-173 (archived, text + R10). **Must not say:** anything that reads as a confirmation
before one exists (`s.g1`), and nothing about the money — a reservation standing on an unpaid obligation
is SCH-303's subject and a failed payment is FIN-134's.

**Canonical changes needed:**
- Split `orchestration.touches[].channelRoles` per touch: all five → `["persistent"]`.
- Add `a.reread-outcome` before `a.lapse` plus the two-branch condition above.
- Replace `s.g1`…`s.g5` with named suppressions stating a rule *and its reason* — `s.not-confirmed`,
  `s.current-availability`, `s.nothing-held`, `s.lapse-stated`, `s.concrete-slot` — and add `s.contest`
  and `s.superseded`.
- `distinctFrom` += **FUL-301**, per ownership P1-7 / F5 as written — the reciprocal of the row specified
  in FUL-301's section, so the pair lands in one edit and neither side ships alone.

**Display-only changes needed:** none. `x.lapsed` is reached from two branches and already instanced
twice (`sharedTerminalInstances: 4`) — correct, keep.

**Renderer changes needed:** R1, R9, R10, R11.

---

## SCH-280 — No-Show Follow-Up

**Purpose:** Offer a way back to somebody whose booking did not happen, having first established that the
miss was theirs and not ours.

**Current flow:**
```
Trigger no_show_recorded against booking
  → a.reread [re-read latest events — absorbed as bookkeeping, not drawn]
  → c.superseded: did the booking genuinely not happen?
       ├ Superseded/reconciled → EXIT x.suppressed (nothing sent)
       └ Genuinely missed → c.provider: could the provider actually have delivered?
            ├ Our side failed → h.provider → SCH-180 Booking Reschedule
            └ Deliverable → c.rebookable: is there anything to offer?
                 ├ Nothing to rebook onto → a.acknowledge [email] → EXIT x.closed
                 └ Rebooking available → a.offer (+ route + closing date) [email + sms]
                                          → w.rebook (7–14d; until rebooked | rebooking_declined)
                                               ├ on timeout → EXIT x.closed
                                               └ on event → c.outcome
                                                    ├ Rebooked → EXIT x.rebooked
                                                    └ Declined → EXIT x.closed
```

**Problems found:**
- **SMS on `a.offer` is the weakest SMS case in the domain.** The moment has already passed; there is no
  deadline inside hours and the rebooking window is 7–14 days. A text about a missed appointment also
  reads as chasing, which is exactly what the *"no blame, no penalty language"* guardrail is guarding
  against. The `channelStrategy` role hedges it (*"the rebooking window is short"*) but **no condition in
  the graph reads that**. (scheduling F3; J `UNRESOLVED`)
- `a.reread` is absorbed by the bookkeeping rule because it declares no `writes` — yet the journey's
  first guardrail is *"The record is re-read immediately before sending. A message about a miss is the one
  thing that cannot be sent on stale state."* The re-read survives on the canvas only through
  `c.superseded`, which is drawn and carries the meaning. Acceptable, but it is the closest this domain
  comes to a collapse hiding something load-bearing. (scheduling)
- **It keys on `booking_id + occurrence_id` — the same instance key as SCH-266 and SCH-304 — messages the
  same holder about the same occurrence, and declares `contact.competition: "none"` with no group and no
  explanation.** SCH-277's precedence claims *"nothing else may speak to the requester about this
  booking"*, which by its own words binds SCH-280; SCH-280 never acknowledges it. In practice the pair
  cannot contest, so this is a stated-boundary gap and not a hazard. (ownership **P2-3**)

**Final orchestration:** combination — a **single** conditional message, then **event-or-timeout**. Three
sequential screening decisions (did it happen · was it us · is there anything to offer) that choose
between *one* message and *no* message, followed by one bounded window that only classifies the outcome.
Deliberately **not** a sequence: *"one offer, not a sequence. Somebody who missed once is not pursued."*

**Final customer channels:** `a.acknowledge` → **email** (already correct, and one of only two
single-channel stages in this part today). `a.offer` → **email**. (J binding, and both audits agree:
`s.no-penalty-language` sets the register — the miss is a fact, stated without penalty, with the single
route to a new booking inside a stated window — and an SMS about a missed appointment arrives as chasing.
The scheduling audit's conditional-SMS escape hatch, *"only where the rebooking route's own closing date
is inside 48 hours"*, is **not** carried: no node reads that attribute, and the brief's rule is to prefer
the simpler pattern and say so.)

**Customer touch count:** **1.** Correct and stays 1.

**Final flow:** unchanged.

**State re-checks:** `a.reread` plus `c.superseded` before anything is sent; `c.outcome` after the window.
Sufficient.

**Stop conditions:** a cancellation, reschedule or late attendance landing after the no-show was recorded
→ `x.suppressed` (`s.reread`). Provider-side failure → handoff, nothing sent (`s.provider-fault`).
Nothing to rebook onto → acknowledgement with no prompt (`s.nothing-to-rebook`).

**Ownership / handoff:** no exclusion group, and that is correct — the booking it speaks about no longer
exists as a future commitment, and it opens strictly after every `booking-lifecycle` member has finished.
But that must be **stated** rather than left as an unexplained `competition: null`. `h.provider` →
SCH-180 (archived, text + R10). Yields nothing else. **Must not say:** anything that re-litigates whose
fault the miss was once `c.provider` has routed it, and nothing about a provider-side failure, which goes
to SCH-180 in silence.

**Canonical changes needed:**
- `a.offer`: drop the `urgent` role. `channelRoles` → `["persistent"]`.
- `suppressions` += `CANONICAL_RULE` `s.after` (ownership P2-3, verbatim): *"This journey opens only once
  the occurrence has passed with nobody there, which is why it is outside the booking-lifecycle group
  rather than at the bottom of it: the booking outcome notice (SCH-277), the reservation payment reminder
  (SCH-303), the readiness reminder (SCH-266) and the pre-arrival notice (SCH-304) have all finished by
  then, and nothing they own can still be said."*
- `distinctFrom` += **SCH-266** and **SCH-304** (ownership P2-3).

**Display-only changes needed:** none.

**Renderer changes needed:** R1, R9, R10, R11.

---

## SCH-282 — Availability Search Abandonment

**Purpose:** Follow an availability question that produced no booking with something that is genuinely
bookable *now*, or with a waitlist place where nothing fits.

**Current flow:**
```
Trigger availability query closed without reservation   [behavioral]
  → c.permitted: may an unprompted offer be sent to this person at all?
       ├ Anonymous / not permitted → EXIT x.no-route
       └ Identified and permitted → w.settle (bounded settle period; until booking_confirmed
                                              | availability_lost; never extended by browsing)
            ├ on event → c.settled ├ Booked unprompted → EXIT x.booked
            │                       └ Window gone → a.recheck
            └ on timeout → a.recheck
  → a.recheck [re-evaluate what is bookable now, from scratch]
  → c.options: what is actually available now?
       ├ A near window is bookable → a.offer (nearest window, labelled as different, not held)
       │                             [email + push] → w.respond → EXIT x.booked / x.lapsed
       ├ Nothing fits, waitlist → a.waitlist (reserves nothing) [email + push]
       │                          → w.waitlist → EXIT x.waitlisted / x.lapsed
       └ Nothing fits, no waitlist → EXIT x.nothing (no message sent)
```

**Problems found:**
- **Push is asserted with nothing in the graph testing whether a push could be delivered.** J's
  corpus-wide rule: 29 journeys assert push, 2 contain a deliverability test, and push survives in 3 —
  ACQ-287, ACQ-288 and ACQ-289, all of which have or import a router. This journey has none.
- **The messages are made of caveats, and push cannot hold one.** `a.offer` must present a different
  window *labelled as a different window* (`s.g2`) and say it is not held (`s.g3`); `a.waitlist`'s entire
  content is the caveat that the place reserves nothing, because *"somebody who believes they hold a
  place they do not hold"* is the failure. (J)
- `c.permitted` reads on the canvas as a generic permission gate — the thing the brief says not to draw
  on every journey — and it escapes `collapsibleGates` on a technicality (its short arm goes straight to
  `x.no-route` without a bookkeeping hop). Here the split is **not** generic: an availability query
  genuinely can be anonymous and identification changes the visible route. The problem is the *wording*,
  which leads with permission instead of with identification. (scheduling; canvas §2.2 Tier A)
- **`x.lapsed` is shared by `w.respond` and `w.waitlist`** — an offer not taken and a waitlist place not
  accepted are two different things — and the exit **state text is the same on both** (*"offer made and
  not taken"*), which is wrong for the waitlist arm. (scheduling)
- **Its precedence contradicts itself in one sentence** — *"alongside interest recovery — an availability
  enquiry that asked for a specific window outranks inferred interest"* — and it is the only member of
  the eight-journey `commerce-recovery` group with **no contest suppression at all**, so its membership is
  stated in one field and enforced in none. It also ties with RET-31: both texts place themselves at the
  identical rank, neither names the other, and both are `onLoss: "suppressed"`, so on a contest each
  defers and **neither sends**. (ownership **P0-3**, **P2-5**)
- `s.g1`…`s.g5` are guardrails restated. (scheduling F4)

**Final orchestration:** combination — a **bounded delay** (`w.settle`, event-or-timeout), a re-evaluation
from scratch, a **single** offer, and a three-way outcome split. **No second touch, ever.** The delay is
not a nurture interval: it exists because *"an offer that arrives while somebody is still choosing
competes with the thing they are choosing, and usually wins nothing."* That is an honest, non-generic
reason for a wait and is worth keeping verbatim.

**Final customer channels:** `a.offer` → **email**. `a.waitlist` → **email**. (J binding. The scheduling
audit called email + push *"unchanged and correct"* and made the brief's push argument — active app
audience, timely nudge, one step from the notification to the booking screen. Superseded on two grounds J
holds and the domain did not weigh: nothing in this graph resolves push deliverability, and both messages
are carefully-worded caveats on an unprompted **promotional** send, which push cannot carry. Both audits
agree there is **no SMS**: an availability enquiry is inferred-adjacent interest and the journey is
`pressureClass: promotional`, so SMS here would be the single clearest violation of the channel rules.)

**Customer touch count:** **1** — offer **or** waitlist, never both. The cap of 2 overstates it; reduce
the `availability_searched.touches` default to **1** to match the graph.

**Final flow:** unchanged in shape.

**State re-checks:** `a.recheck` re-evaluates availability **from scratch** before the offer, explicitly
not reusing what the query returned. This is the correct pattern and the whole point of the journey.

**Stop conditions:** the person books unprompted → `x.booked`, nothing sent. Nothing available and no
waitlist → `x.nothing`, nothing sent. `s.sunset` — CON-300's sender-side marketing suppression — stops it,
which is correct and is required of any promotional journey by
`scripts/sunset-suppression-evidence.mjs`.

**Ownership / handoff:** `commerce-recovery`, `scope: person`, `onLoss: suppressed`. **The tie with RET-31
must be broken in SCH-282's favour**, on the group's own running rationale: an availability enquiry is a
question the person actually asked about a stated window, where a predicted need is computed from history
and confirmed by nobody — which is the same reasoning ACQ-289's repaired precedence already cites SCH-282
for. No handoffs. **Must not say:** that any window is held (`s.g3`), or that the availability shown
earlier still stands (`s.g2`).

This journey is also **the corpus's clearest specific-beats-general precedent and the one to mirror**: its
shape is *name the general journey, name the specific signal, say which attribute of the signal makes it
specific* (a stated window). Any new precedence prose in this refactor should copy that three-part shape.

**Canonical changes needed:**
- `a.offer` and `a.waitlist`: drop the `low-friction` role; `channelRoles` → `["persistent"]`; drop `push`
  from `channelsDeclared`.
- Reword `c.permitted`'s `displayQuestion` to lead with attribution:
  *"Can this query be attributed to a person we may contact?"*
- Split `x.lapsed` into `x.offer-lapsed` and `x.waitlist-lapsed`, or give the waitlist arm its own state
  text.
- `availability_searched.touches` default 2 → **1**.
- `contact.competition.precedence` — replace with the ownership **P0-3** wording verbatim (below checkout
  recovery, the generic process pattern, the held cart and the held selection; **above** predicted-need
  replenishment RET-31, the back-in-stock alert ACQ-289 and inferred-interest recovery ACQ-13, with the
  reason stated).
- `suppressions` += `CANONICAL_RULE` `s.contest` (ownership P0-3 verbatim).
- `distinctFrom` += **ACQ-289** (ownership D-27).
- Rename `s.g1`…`s.g5` to named suppressions stating a rule and its reason.
- *(RET-31's reciprocal half of P0-3 belongs to another consolidator; this side must not ship alone.)*

**Display-only changes needed:** none beyond the `c.permitted` rewording. `c.permitted` **stays drawn** —
it is one of the few permission-shaped gates that genuinely changes the visible route.

**Renderer changes needed:** R1, R9, R11.

---

## SCH-303 — Reservation Payment Reminder

**Purpose:** Keep a reservation that is standing only because a payment is still expected, by telling the
holder what the *booking terms* do about it — and getting out of the way the moment the payment itself is
what went wrong.

**Current flow:**
```
Trigger reservation payment outstanding
  → c.standing: does the reservation still stand with the obligation still outstanding?
       ├ Already settled → EXIT x.kept
       ├ No longer standing → EXIT x.superseded
       └ Standing & outstanding → c.sendable [gate, absorbed]
  → a.remind: what is owed, the terms' due point, what the terms do [email + in_app]
  → w.payment (until obligation_satisfied | authoritative_payment_failure
               | booking_materially_changed; timeout at the due point)
       ├ on event → c.outcome ├ Kept → EXIT x.kept
       │                       ├ Payment failed → h.payment-failure → FIN-134
       │                       └ Withdrawn → EXIT x.superseded
       └ on timeout → c.still: does it still stand as just re-read?
            ├ Settled meanwhile → EXIT x.kept
            ├ Withdrawn meanwhile → EXIT x.superseded
            └ Still at risk → c.sendable2 [gate, absorbed]
  → a.final: the reservation as it stands, the last point it can be kept, what the terms do
    afterwards [sms + email + in_app]   (mandatory)
  → w.release (same three events; timeout at the release point)
       ├ on event → the same three-way resolution (kept / FIN-134 / superseded)
       └ on timeout → a.lapse: released, nothing held, what the record shows [email + sms]
                      (mandatory) → EXIT x.released
```

**Problems found:**
- `a.final` carries three channels and `a.lapse` two, both unconditionally, and `a.final` renders as
  `Primary: SMS · Fallback: Email · Fallback: In-app` — a ladder on the one mandatory last-chance message,
  which makes the most consequential message in the journey look optional on one channel. (scheduling F2/F3;
  J §4.1 item 8)
- **`a.lapse` on SMS is wrong.** The place is already gone. The message is *owed* — the guardrail *"a place
  that disappears in silence is discovered by the holder on the day"* is right — but it is a record, not an
  urgent action, and there is nothing for the holder to do within hours.
- **21 display nodes from 14 distinct canonical nodes drawn** — 10 shared-terminal instances, third-largest
  in the library. Per-parent instancing working as designed on a three-way resolution repeated twice.
  (canvas P2-7)
- **`FIN-134` says nothing back.** SCH-303 states the boundary four times; FIN-134 declares
  `contact.competition: "none"`, disables pressure caps (*"this is transactional communication about an
  obligation the person already holds"*) and carries no rule stopping it from restating the release
  deadline SCH-303 handed it. **That is a defect on FIN-134's side, not this one's.** (ownership **P0-1**)
- No `distinctFrom` row for SCH-304. (ownership D-16)
- Nothing else: the two `c.sendable` gates and `a.record-no-action` / `x.no-action` are absorbed correctly,
  which is exactly the implementation-gate signal. **Noted so nobody "restores" them.**

**Final orchestration:** combination — an **escalating two-window event-or-timeout** with a hard ownership
exit, one stage of which is **parallel**. Two bounded windows anchored to two attributes the *booking terms*
own (the due point, the release point), each resolving three ways. It escalates in **consequence stated**,
not in frequency, and the escalation stops at a handoff rather than at a retry.

**How SCH-303 is kept out of dunning territory — the four tests, all passed today and all kept:**

| test | how it holds |
|---|---|
| **Subject** | The entity is `booking_id`, scoped *"one confirmed reservation whose continued standing depends on a payment its holder still owes."* The money has no instance key here. `a.remind`'s own text: *"The subject is the place they hold, not the money."* |
| **No retry, no decline classification** | There is no retry node, no attempt counter and no decline-code branch anywhere in the graph. The only thing done with a failure is `h.payment-failure`. |
| **No amount stated as a debt** | Every message states *what the terms do to the reservation*. The due point and release point are **read** from the booking terms (`s.superseded`: re-read before every touch) and the journey *"never asserts, moves or softens either."* |
| **Silence after handoff** | `h.payment-failure` carries a `suppresses` clause and there is no path from the handoff back into this graph. Three of the four arms that could see a failure route to it. |

**The channel decision is set so as not to erode this.** The release notice **loses SMS specifically**,
because an SMS about money that has not been paid is the one change that would make this read as
collections. It stays on email. Both audits agree; J agrees; it is not negotiable in implementation.

**Final customer channels:**
- `a.remind` → **email**. (J: what is outstanding, the point the booking terms expect it by, and what those
  terms do if it is not met — terms, quoted — and the reservation holder is not necessarily in the product.
  The scheduling audit kept in-app; superseded.)
- `a.final` → **SMS and email, once, as a parallel send.** (J binding, and one of the corpus's four real
  parallel moments: the SMS carries the deadline, the email carries the reservation as it stands and what
  the terms do after. One moment, mandatory, no second notice. In-app is dropped; the ranking is removed.)
- `a.lapse` → **email**. (The place is already gone; there is nothing to do in the next minutes. What is
  owed is what the record now shows and what exists instead.)

**Customer touch count:** **3**, discretionary budget 1. Correct and unchanged —
`localCap.appliesTo: "non-mandatory"` with both later touches `mandatory: true` is the right shape and is
one of the better-reasoned caps in the corpus. **SCH-303 acquires no fourth touch and no retry.**

**Final flow:** shape unchanged.

**State re-checks:** `c.standing` at entry; `c.still` at the due point, re-reading the reservation **and**
the obligation; and the terms re-read before every touch per `s.superseded`. Comprehensive — **do not
reduce.**

**Stop conditions:** the obligation satisfied, waived or cancelled by any route → `x.kept` (`s.settled`).
The reservation cancelled, moved or materially changed → `x.superseded`. An **authoritative payment
failure** → FIN-134 and silence (`s.failure-not-ours`). An unknown attempt outcome → reconcile first,
treat as neither (`s.unknown-outcome`, GLB-20). SCH-277 holding the reservation → suppressed, not queued
(`s.contest`).

**Ownership / handoff:** **second in `booking-lifecycle`**, below SCH-277 and above SCH-266 and SCH-304 —
*"a reservation that may be released outranks anything about preparing for it or turning up to it."*
`onLoss: suppressed`. **Do not reopen.** `h.payment-failure` → **FIN-134, the only public handoff target in
the twelve scheduling/subscription journeys**, so the only one that renders as a link.
**Must not say, from the handoff onward: anything about the payment.** Preserve the boundary as stated —
asymmetrically and deliberately: SCH-303 declares the deference (`s.failure-not-ours`, `distinctFrom`
FIN-134, the handoff contract) and FIN-134 is deliberately **not** in `booking-lifecycle`. **Do not
"complete" that by adding a competition block to FIN-134** — most FIN-134 instances have no reservation
behind them. The reciprocal work FIN-134 does owe (ownership P0-1) belongs to FIN-134's consolidator.

**Canonical changes needed:**
- `a.remind`: `channelRoles` → `["persistent"]`.
- `a.final`: keep `urgent` and `persistent`, drop `in-session`, and mark the touch **parallel** so the
  canvas stops printing SMS as the primary of a ladder.
- `a.lapse`: drop the `urgent` role; `channelRoles` → `["persistent"]`.
- `distinctFrom` += **SCH-304** (ownership D-16).
- **No other change.** No retry node, no attempt counter, no decline classification, no amount stated as a
  debt, no fourth touch, no group change.

**Display-only changes needed:** none. The four absorbed nodes are absorbed correctly.

**Renderer changes needed:** R1, R9, R11.

---

## SCH-304 — Pre-Arrival Preparation

**Purpose:** Tell somebody what turning up actually requires — and say it only where it answers something
they could not already know.

**Current flow:**
```
Trigger arrival_window_opened
  → c.standing: is this occurrence still something to arrive at?
       ├ Cancelled/moved → EXIT x.superseded
       ├ Already under way → EXIT x.overtaken
       └ Still ahead → c.sendable [gate incl. "does the booking hold arrival facts worth
                                    carrying" — absorbed]
  → a.details: place or joining route, what to have, the step that can be done first
    [email + in_app]
  → w.checkin (until check_in_completed | booking_materially_changed | attendance_recorded)
       ├ on event → Checked in → w.dayof · Changed → x.superseded · Arrived → x.arrived
       └ on timeout → c.owed: is a check-in step still owed?
            ├ Nothing owed → w.dayof
            └ Still owed → [gate] → a.checkin: the one step + last point
                           [in_app + email + sms] → w.dayof
  → w.dayof (until booking_materially_changed | attendance_recorded)
       ├ on event → Changed → x.superseded · Arrived → x.arrived
       └ on timeout → c.late: is there anything that could not have been said earlier?
            ├ Nothing new → EXIT x.ready            (the ordinary case)
            └ Something changed → [gate] → a.late-detail: only what is new, said as new
                                  [sms + in_app + email] → EXIT x.ready
```

**Problems found:**
- `a.checkin` carries three channels and `a.late-detail` all three with SMS declared first, all
  unconditional. (scheduling F1/F2/F3; J `UNRESOLVED` ×3)
- **`w.checkin` renders a 257-character label inside a wait capsule whose reserved slot is 240 × 56.**
  `waitLabel` → `firstClause` only cuts at a clause separator found at index ≤ 90 and otherwise returns the
  whole string; 11 wait labels in the library exceed 70 characters, and wait is the one card kind that never
  gets `cardSummary`'s budget treatment. (canvas P2-8, H8 — and K is explicit that this is a `firstClause`
  bug, **not** a licence for a journey-specific branch)
- 19 display nodes from 15 distinct canonical nodes drawn — 7 terminal instances. Per-parent instancing
  working as designed. (canvas P2-7)
- Nothing else. This is the strongest-authored journey in the domain.

**Final orchestration:** **budgeted conditional touches** — a combination of three independently gated
sends against a ceiling of 3 (`appliesTo: "all"`), with two **event-or-timeout** windows. This is
deliberately the odd shape in the cluster and must stay that way: an occurrence with nothing new reaches
`x.ready` having spent nothing. **The two waits are not delays between messages — they are the windows in
which a fact might become knowable.**

**The guardrail stays, verbatim:** *"A message whose content is how long remains is a countdown, and this
journey does not send one."* Every touch's gate exists to enforce it — `c.owed` (does a check-in step
exist, is it open, is it unfinished), `c.late` (does the booking now hold an arrival fact this journey has
not already sent), and `c.sendable`'s own *"the booking holds arrival facts worth carrying"* clause. **Do
not merge those gates into a generic send check; they are the journey.**

**Final customer channels:**
- `a.details` → **email**. (J: the place or joining route, what to have, and the step that can be done
  before setting off — people save this and open it on the day. In-app dropped.)
- `a.checkin` → **SMS**. (J binding, and J names this one of the corpus's seven surviving SMS stages: one
  step, one deadline, done on a phone shortly before travelling, and `s.nothing-new` means the stage is
  only reached when there is genuinely something owed, which is what makes a text defensible rather than a
  nag; `s.already-done` forbids prompting a completed step. **The scheduling audit said the opposite —
  "drop SMS", because a check-in step lives in the product and texting somebody to go and do it in the app
  is a worse route to the same place.** I applied J: its reason rests on two authored suppressions and the
  domain's rests on a general principle, and the domain's own in-app preference has the same defect as
  everywhere else in this part — nothing in the graph reads the `in-session` role's `when`.)
- `a.late-detail` → **SMS**. (Both audits agree this is genuine: the exact place within the location, the
  access instruction, the person to ask for, sent to somebody already travelling and only ever containing
  the new part. In-app dropped — somebody en route is not in the product — and email dropped with it.)

**Customer touch count:** **0–3**, ceiling 3. Correct and bounded; do not raise or lower.

**Final flow:** shape unchanged.

**State re-checks:** arrival facts re-read from the booking immediately before every touch (`s.changed`);
`c.owed` re-reads the check-in record; `c.late` compares the booking's **current** arrival facts against
what this journey has already sent. Best-in-domain — keep all three.

**Stop conditions:** cancellation or material change → `x.superseded`. Attendance or arrival recorded →
`x.arrived`, immediately, *"rather than finishing its plan"* (`s.overtaken`). Nothing new to say →
`x.ready`, the ordinary case and explicitly **not** a failure (`s.nothing-new`). Any higher
`booking-lifecycle` member holding the occurrence → suppressed (`s.contest`).

**Ownership / handoff:** **lowest in `booking-lifecycle`**, `onLoss: suppressed`. Its own precedence
carries the loser's-cost statement the corpus almost never supplies — *"each of those journeys restates the
time and the place itself, so a suppressed arrival message loses nothing the holder needed"* — and
SCH-266's at-risk notice restating the booking is what makes that true, which is why `a.at-risk` keeps
email in its parallel send. **No handoffs, deliberately** — a second route into SCH-177 would mean two
journeys claiming the same attendance question. **Keep it.** **Must not say:** how long remains.

**Canonical changes needed:**
- `a.details`: `channelRoles` → `["persistent"]`.
- `a.checkin`: `channelRoles` → `["urgent"]` (drop `in-session` and `persistent`).
- `a.late-detail`: `channelRoles` → `["urgent"]` (drop `in-session` and `persistent`).
- Nothing structural. The three gates, the countdown guardrail, the ceiling and the absence of handoffs all
  stay exactly as authored.

**Display-only changes needed:** none. The three gates plus bookkeeping plus `x.no-action` are absorbed
correctly, which is why 20 canonical nodes draw as 19.

**Renderer changes needed:** R1, **R6 — the wait label must pass the same `cardSummary` budget as every
other card body, as a generic `firstClause` fix and never a per-journey branch**, R9, R11.

---

## SUB-163 — Renewal Reminder

**Purpose:** Reach a decision about the next term, **as a decision** — separate from anything that makes
the next term real.

**Current flow:**
```
Trigger renewal decision window opens
  → a.evaluate [eligibility, model, state, notice, pricing, blockers — absorbed]
  → c.notice: are the renewal terms and required notice defined?
       ├ Not defined → h.undefined → DEC-181 Decision Request
       └ Defined → c.notice-required: do the terms require notice to be given?
            ├ Notice required → a.notice: the model, the terms it renews on, what happens if
            │                   they do nothing [email + in_app]  (obligation, outside the cap)
            └ No obligation ──┐
  → c.blockers: does an outstanding blocker prevent the decision?
       ├ Blocked → a.review [record RENEWAL_REVIEW] → w.review (to notice deadline)
       │                ├ on event → c.decision
       │                └ on timeout → h.escalate → OWN-55
       └ Clear → c.model: what does the renewal model require?
            ├ Auto-renew, met → [record decided] → h.execute → SUB-164
            ├ Review first → a.review → w.review (as above)
            └ Explicit decision → a.request [email + in_app + sms + push]
                                  → w.decision (term_end_at minus the notice period;
                                                until renewal_decision_recorded)
                                       ├ on event → c.decision
                                       └ on timeout → a.default [apply the terms' own default]
                                                       → c.decision
  → c.decision: what is the outcome for the next term?
       ├ Cancellation in motion → EXIT x.superseded
       ├ Renew → [record decided] → h.execute → SUB-164
       └ Do not renew → [record NON_RENEWING] → h.scheduled-end → SUB-168
```

**Problems found:**
- **`a.request` carries four channels, with `["sms","push"]` bundled inside a single `urgent` role.** Two
  unrelated channels in one bucket is the clearest artefact of the fallback reflex — it says *"if not SMS
  then push"*, which is not a substitution anybody designed. J ranks this and TIM-61 as the corpus's two
  worst asserted-reach cards and the clearest examples of role lists standing in for thinking.
- **The underlying premise is wrong for this journey.** The deadline is `term_end_at` minus the notice
  period the terms require — days or weeks — and the decision holder is *"whoever holds it"*, frequently a
  signatory or budget owner with no product session and often not the person whose phone is on file.
- **`a.notice` and `a.request` are different objects — a legal obligation and a question — and both can
  fire on the same cycle**, with nothing in the graph preventing two near-identical emails about one
  renewal. No dedup between them. (scheduling)
- **The journey ends only in handoffs** (`journeyOutcome.type: "handoff"`), and **all four targets are
  archived** (DEC-181, OWN-55, SUB-164, SUB-168). The canvas terminates in four non-link text cards plus
  one suppression exit. Verified: one exit (`x.superseded`), four handoffs. Same reader problem as SCH-266,
  worse. (scheduling F3-D)
- **`a.default` is absorbed and should not be.** *"Apply what the governing terms define as the outcome
  when no decision is made"* writes only a journal row, so the bookkeeping rule hides it — and the timeout
  edge now runs straight from the wait into `c.decision` with no sign that a default was applied. It is the
  only place the terms' own outcome is applied and the only thing that makes *"no answer ≠ agreement"*
  visible. (scheduling; canvas §3.2's pattern — a journal field name is the wrong signal for a step that is
  structurally significant)
- **Engine identifiers on the canvas:** `w.review` and `w.decision` render *"term_end_at minus the notice
  period the terms require"*, and `a.review` renders *"Record RENEWAL_REVIEW with what has to be settled"*.
  (canvas P1-6)
- No `distinctFrom` row for RET-292. (ownership D-21)

**Final orchestration:** combination — **conditional routing on the renewal model** (`c.model` decides
whether anybody is asked at all: an auto-renew with its conditions met sends a notice and never asks; an
explicit-decision model asks once) plus **event-or-timeout** on `w.decision` and `w.review`, on one branch
only. There is no sequence and no cadence. This is a journey that is often **zero customer touches** (no
notice obligation + auto-renew) and never more than two.

**Final customer channels:** `a.notice` → **email**. `a.request` → **email**. (J binding on both: the
notice is a contractual obligation — the renewal model that will apply, the terms it renews on, and what
happens if nobody decides — and *"it has to be provable that it was given, and it has to survive the
term"*; the request carries the terms that would apply and the point by which the notice period requires an
answer, addressed to a decision holder who frequently has no product session. **SMS and push are removed**,
and the `["sms","push"]` bundle goes with them. The scheduling audit kept in-app on both; superseded. The
scheduling audit also recorded this as one of the three calls it was least sure of, on the grounds that
`relationship_id` covers consumer subscriptions too and a consumer subscription auto-renewing tomorrow at a
higher price is a genuine urgent-horizon case — but **the journey holds no attribute distinguishing the two
populations**, and the brief's rule is to prefer the simpler pattern and say so rather than invent the
signal. J reaches the same answer independently.)

**Customer touch count:** **0–2.** Correct. The cap — 1 discretionary, the notice outside it — is right and
unchanged.

**Final flow:** shape unchanged, plus a dedup: where the notice has already been sent on this cycle and the
model then requires an explicit decision, `a.request` **restates the decision and does not restate the
terms** the notice already carried.

**State re-checks:** `c.decision`'s first branch re-reads the relationship for a cancellation in motion —
the journey's own sixth guardrail covers exactly the case of a cancellation starting after the request went
out. `w.decision` and `w.review` both re-check. Good; nothing to add.

**Stop conditions:** a cancellation in motion → `x.superseded` (the relationship's own lifecycle takes it).
An open payment recovery → suppressed entirely at eligibility (`s.payment-recovery`). A decision recorded →
nothing further (`s.decided`). Undefined terms → DEC-181, nothing sent.

**Ownership / handoff:** `relationship-continuity`. **Subscription Renewal outranks generic Expiry
Reminder** — already stated from both sides, in SUB-163's `distinctFrom` TIM-63 and in its precedence
prose. **Do not reopen.** Below cancellation-in-motion, below an active risk state, below open payment
recovery. Four handoffs, all archived: DEC-181, OWN-55, SUB-164, SUB-168 — all text, all needing R10.
**Must not say:** anything that makes the next term real; execution is SUB-164's, and a scheduled end is
SUB-168's.

**Canonical changes needed:**
- `a.request`: `channelRoles` → `["persistent"]`, dropping `urgent` (and with it the `["sms","push"]`
  bundle) and `in-session`.
- `a.notice`: `channelRoles` → `["persistent"]`.
- Add a dedup condition, or a suppression `s.notice-already-given`, covering the notice/request overlap on
  one cycle.
- `distinctFrom` += **RET-292** (ownership D-21).
- Move the engine identifiers out of authored card prose: `w.review` / `w.decision` should state *"the
  notice period the terms require, before the term ends"* and `a.review` should not name the constant.
  (The durable fix is canonical; the display half is R11's widened H1.)

**Display-only changes needed:** **keep `a.default` drawn**, or label the timeout edge with it. Absorbing
it silently loses the journey's second guardrail. Expressed generically: **an absorbed action is exempt
from the bookkeeping rule where the edge into it is a wait timeout and it is the only node on that arm**
— which is R3's structural reading of the same rule.

**Renderer changes needed:** R1, R3, R9, **R10 — this is one of the two journeys in this part whose
canvas ends *only* in archived handoffs**, R11.

---

## SUB-262 — Cancellation Confirmation

**Purpose:** Carry somebody through the period between deciding to leave and actually losing access, so
the end date is never a surprise and returning stays possible right up to it.

**Current flow:**
```
Trigger cancellation confirmed
  → a.confirm: the cancellation, the exact end date, what remains until then [email + in_app]
  → c.window: is there a meaningful window before access ends?
       ├ Ends immediately → c.obligations
       └ Window remains → w.window (until cancellation_withdrawn | effective_end_reached)
            ├ on event → c.withdrawn ├ Withdrawn → EXIT x.returned
            │                         └ Still ending → a.ending: what survives and what does
            │                                          not [email + in_app]
            └ on timeout → a.ending
  → c.obligations: does anything outlive the relationship?
       ├ Obligations remain → h.obligations → SUB-170
       └ Nothing outstanding → EXIT x.ended
```

**Problems found:** almost none. **This journey is already right, and the correct finding is largely to
leave it alone.**
- Both stages render a hierarchy that is not one — it declares `same-role-other-channel`, so its second row
  is mislabelled Fallback. (J `UNRESOLVED` ×2; canvas P0-2)
- Its suppressions are its guardrails restated as `s.g1`…`s.g4`. (scheduling F4)
- `measurement` has no `businessOutcome` block and `goal.event` is `null`. That is **honest** — a wind-down
  has no conversion event and inventing one would be worse — but it should be stated rather than absent, so
  a reader does not read it as an omission.

**Final orchestration:** **sequential** — two touches with a mandatory state re-check between them. The
plainest shape in the domain and the right one: one immediate confirmation, one window, one ending notice.
`c.window` is a real condition (a cancellation effective immediately has nowhere to put a second message)
and `c.withdrawn` is the journey's whole point.

**Final customer channels:** **email** on both touches. (J binding. `a.confirm` — `s.g3`: the end date is
stated in the first message and never moves silently, which makes this the reference for everything that
follows, including whether they can still export. `a.ending` — what will and will not survive the end date,
exports, history, outstanding obligations; *"it is the last chance to act on a list, so it needs to be a
list."* **The scheduling audit specifically defended in-app on both and asked that the next reader not
"fix" it for symmetry — I am overruling that, and it is worth naming.** Its argument is that both messages
are read by somebody who is still a customer and still in the product; J's is that both messages are lists
of dates and survivals that must be reopenable, which argues for email and does not argue for in-app, and
nothing in the graph resolves the `in-session` role. **Both audits agree: no SMS** — the end date is weeks
away and the message is a record — **and no push** — nothing here is a nudge.)

**Customer touch count:** **1–2.** Correct.

**Final flow:** unchanged.

**State re-checks:** `c.withdrawn` before the ending notice — *"a reminder that access is ending, sent to
somebody who has just stayed, is worse than sending nothing."* This is exactly the brief's
never-send-a-reminder-after-success rule, **already implemented**; nothing to add.

**Stop conditions:** withdrawal or reactivation → `x.returned`, immediately. **The cancellation is never
re-litigated** (`s.g1`); a save attempt belongs to RET-28, before this journey.

**Ownership / handoff:** no exclusion group, and correctly — nothing else speaks about a cancelled
relationship's wind-down. `distinctFrom` **RET-28** (before the decision) and **SUB-167** (establishes
whether and when it ends), both present and correct. `h.obligations` → SUB-170 (archived, text + R10).
**Must not say:** anything that reopens the decision, and nothing about obligations that outlive the
relationship beyond handing them on.

**Canonical changes needed:**
- `a.confirm` and `a.ending`: `channelRoles` → `["persistent"]`.
- Rename `s.g1`…`s.g4` to named suppressions stating a rule and its reason — `s.no-relitigation` for the
  first.
- Add an explicit `businessOutcome: null` note, or the equivalent, stating **why** there is no conversion
  event.
- **No structural change.**

**Display-only changes needed:** none.

**Renderer changes needed:** R1, R9, R10, R11.

---

## SUB-296 — Loyalty Program Welcome

**Purpose:** Open an enrolled membership honestly: what it grants from today, where it lives, how it is
used — without borrowing product onboarding or the first-purchase welcome.

**Current flow:**
```
Trigger loyalty_membership_enrolled
  → c.state: is this membership ours to welcome?
       ├ No longer stands → EXIT x.closed
       ├ Already welcomed → a.record-no-action → EXIT x.no-action
       └ Welcome due → c.sendable [gate, absorbed]
  → a.welcome: what the membership grants from today, where it lives, how it is used
    [email + in_app]
  → w.benefit (until loyalty_benefit_used | loyalty_membership_ended)  [collapsed into c.used]
  → c.used: has the membership been used yet?
       ├ Already in use → EXIT x.settled
       └ Not yet → [gate] → a.orient: one thing it grants + the route to use it
                            [email + in_app + push] → EXIT x.oriented
```

**Problems found:**
- **It is structurally identical to SUB-297.** 13 canonical / 10 display nodes on both, the same
  `trigger → 3-branch state condition → gate → message → wait → 2-branch condition → gate → message → exit`
  skeleton, the same four exit classes, the same `channelStrategy` roles, the same
  `fallback: next-eligible-role`, the same required persistent holdout. Verified: 13/10 on both. **Two of
  the four loyalty journeys are currently copies of each other.** This is resolved on SUB-297's side, below
  — **SUB-296's shape is the one that is correct for its moment** and must not be flattened toward SUB-297.
- Push on `a.orient`, with no deliverability test anywhere in the graph. (scheduling; J's corpus rule)
- `a.record-no-action` and `x.no-action` **are drawn** here (unlike SCH-303/SCH-304, where they are
  absorbed), because `c.state`'s *"Already welcomed"* branch reaches `a.record-no-action` directly, so the
  in-degree test declines it and the gate rule correctly refuses to hide a node a still-drawn parent points
  at. Both rules are individually right; the outcome is that the canvas carries a bare Internal card.
  (scheduling; canvas P1-4, §2.2 Tier B)
- No `distinctFrom` row for SUB-299, which names it. (ownership D-17)

**Final orchestration:** combination — a **single** lifecycle confirmation, then one **event-or-timeout**
orientation. The first touch is a *response to something the member just did* and is unconditional on the
membership standing. The second exists only because *"members use what they hold without being told"*: the
wait resolves on `loyalty_benefit_used` (→ nothing more to say, `x.settled`) or times out (→ orient).
**The timeout arm is the touch; the event arm is the exit.** That is a clean event-or-timeout, and it is
**not** the shape SUB-297 should have.

**Final customer channels:** `a.welcome` → **email**. `a.orient` → **email**. (J binding, and its reason
for `a.orient` is the sharpest in the loyalty cluster and inverts the domain audit's: the orientation is
reached **precisely because the member has not engaged with the membership**, so *the membership's own
surface has already failed to reach them* — which is an argument against in-app, not for it. The scheduling
audit proposed in-app ahead of email here. J's reason for `a.welcome` is equally specific: *"somebody who
just enrolled does not yet know where 'where it lives' is, which is the reason it cannot be delivered
there."* **Push is dropped** — both audits agree, and J's corpus rule settles it.)

**Customer touch count:** **1–2.** Correct; cap 2 with `appliesTo: "all"` is right.

**Final flow:** shape unchanged.

**State re-checks:** `c.used` re-reads the membership's own usage record immediately before the orientation
(`s.used`); `a.orient` re-reads the record again at send time (`s.grant`). Good; nothing to add.

**Stop conditions:** enrolment reversed, membership cancelled or permission withdrawn → `x.closed`. Benefit
already used → `x.settled`, no orientation. Already welcomed → no-action; **it runs once per membership,
ever**. `s.sunset` stops it. SUB-298 or SUB-299 holding the membership → deferred and re-evaluated, not
queued (`s.contest`).

**Ownership / handoff:** **third in `membership-standing`** (SUB-298 > SUB-299 > SUB-296 > SUB-297),
`scope: subscription`, `onLoss: suppressed`. Ownership finds all six ordered pairs in this group already
resolved and internally complete — **do not reopen.** No handoffs. The boundaries against **RET-290** (first
purchase) and **ACT-12** (onboarding) are stated reciprocally and as suppressions (`s.purchase`,
`s.onboarding`) — the right shape for journeys on *different entities*, and the reason these are correctly
**not** an exclusion group. Ownership singles out the RET-290 ↔ SUB-296 pair as the corpus's cleanest entity
separation: a first purchase and a membership enrolment can be one moment and are two entities.
**Must not say:** anything that explains the product (ACT-12's) or makes a first-purchase bounceback
(RET-290's).

**Canonical changes needed:**
- `a.welcome`: `channelRoles` → `["persistent"]`.
- `a.orient`: `channelRoles` → `["persistent"]` (drop `low-friction` and `in-session`); drop `push` from
  `channelsDeclared`.
- `distinctFrom` += **SUB-299** (ownership D-17).

**Display-only changes needed:** absorb `a.record-no-action` **even where a real branch reaches it**, by
treating the bookkeeping node plus its exit as one absorbed unit when every non-collapsed parent edge is
itself a no-action branch — the narrower alternative being to draw the *"Already welcomed"* arm straight
into `x.no-action`. Either removes a bare Internal card from SUB-296, SUB-297 and SUB-298 at once. This is
R5.

**Renderer changes needed:** R1, R5, R9, R11.

---

## SUB-297 — Loyalty Program Nurture

**Purpose:** Tell a member what their membership is currently holding for them that they have not used, in
a bounded way that ends rather than a cadence that continues.

**Current flow:**
```
Trigger loyalty membership holds unused value
  → c.valid: is there still something real to say?
       ├ Membership no longer stands → EXIT x.closed
       ├ Nothing left to say → a.record-no-action → EXIT x.no-action
       └ Still unused → c.sendable [gate, absorbed]
  → a.explain: what is held, what it may be used for, until when [email + in_app + push]
  → w.act (until loyalty_benefit_used | loyalty_membership_ended | permission_withdrawn)
  → c.acted: has the member used it?
       ├ Used → EXIT x.used
       └ Still unused → [gate] → a.remind: "the same unused thing once more, adding nothing
                                 the explanation did not already have"
                                 [email + in_app + push] → EXIT x.nurtured
```

**Problems found:** — and this is the journey this part changes most.
- **It is a copy of SUB-296.** Same skeleton, same 13 canonical / 10 display node counts, same channel plan
  on both touches, same exit classes, same holdout, same `fallback: next-eligible-role`. Verified.
- **Its second touch adds nothing, by its own admission.** `a.remind`'s canonical text is *"Say the same
  unused thing once more, adding nothing the explanation did not already have."* A second touch **defined**
  as carrying no new information is the exact thing to cut, and cutting it is also what breaks the
  convergence with SUB-296.
- Both touches carry identical three-channel plans, including push on the message that states *"what it may
  be used for and until when"* — a list, on the channel least able to carry one. (J: *"Push carries one
  fact."*)
- **A class mismatch inside the journey itself:** `contact.defaultPriority: "promotional"` and
  `pressureClass: "promotional"`, but its `eligibility` gates on *"purpose-level permission for
  **lifecycle** communication"*. Already recorded in `audit/new-journey-collision-review.md` §3.2 as the
  CON-300 × SUB-297 `1S` finding. It should resolve to `promotional` on both, which is what `s.sunset` and
  the pressure class imply.
- `a.record-no-action` drawn, same shape as SUB-296. (canvas P1-4)

**Final orchestration:** combination — a **single** explanation, then one **conditional** branch on whether
the held subject actually expires, and on the expiring arm one **event-or-timeout** expiry notice anchored
to the subject's own expiry.

The second touch stops being *"the same thing again after a while"* and becomes *"this expires on DATE"* —
a different message, sent because a fact changed, timed against the subject's own expiry rather than against
the first message. Where the held subject has **no** expiry, there is nothing new to say and the journey is
one touch and closes.

**The signal already exists in the data and is not invented.** `c.valid`'s third branch reads *"the subject
has been used, **has expired**, or is no longer usable by this member"*, and `a.explain` already states
*"what it may be used for **and until when**"*. The subject's expiry is read and stated today; the journey
simply does not branch on whether there is one.

This gives the loyalty cluster four genuinely different second-touch rules: **SUB-298** has no second touch ·
**SUB-299** has none either · **SUB-296**'s is gated on *non-use after a window* · **SUB-297**'s is gated on
*the subject having an expiry* and timed to it.

**Final customer channels:** `a.explain` → **email**. `a.expiry-notice` *(replacing `a.remind`)* →
**email**. (J is binding on `a.explain`: a balance or benefit, what it may be used for, and until when —
three facts read from the record at the moment of sending (`s.record`) — and push carries one fact. In-app
and push both dropped. For the replacement stage J's row priced a message the canonical edit abolishes, so
it does not bind; **the scheduling audit proposed push there**, on the reasoning that the message is now
short and one step and that this *inverts* SUB-296 deliberately, the channel following the message rather
than the journey. **I declined the push**, for J's corpus reason rather than against the domain's logic:
nothing in SUB-297's graph tests whether a push can be delivered, and the brief forbids inventing a
reachability signal to make a journey look sophisticated. If a router contract is ever imported into the
loyalty cluster the way J prescribes for ACQ-289, this is the stage that should get it first.)

**Customer touch count:** **1–2**, and **1 wherever the subject does not expire.**

**Final flow:**
```
Trigger loyalty membership holds unused value
  → c.valid: is there still something real to say?
       ├ Membership no longer stands → EXIT x.closed
       ├ Nothing left to say → EXIT x.no-action        (bookkeeping hop absorbed, R5)
       └ Still unused → a.explain: what is held, what it may be used for, until when [email]
  → c.expires: does this subject have an expiry the member can still act before?   ← NEW
       ├ No expiry → EXIT x.explained        ← NEW (one touch, plan complete)
       └ Expires → w.act, re-anchored to the subject's own expiry approach point
                   (resolving on loyalty_benefit_used | loyalty_membership_ended
                    | permission_withdrawn)
            → c.acted: has the member used it?
                 ├ Used → EXIT x.used
                 └ Still unused → a.expiry-notice: "this expires on DATE" [email]  ← REWRITTEN
                                  → EXIT x.nurtured
```

**State re-checks:** `c.acted` before the second touch, unchanged, and **now also re-reading the expiry**.
`s.record` requires every claim re-read at send time. Keep both.

**Stop conditions:** the subject used, expired, or no longer usable → the instance closes; a *different*
unused subject opens its own instance after the cooldown (`s.bounded` — **the cooldown is what stops a
membership with several unused things becoming a standing campaign; keep it exactly as written**).
Membership ended or permission withdrawn → `x.closed`. `s.sunset` stops it. Any higher
`membership-standing` member holding the membership → suppressed (`s.contest`, `s.transactional`).

**Ownership / handoff:** **lowest in `membership-standing`**, `onLoss: suppressed`. **Do not reopen.** No
handoffs. `distinctFrom` **RET-293 / RET-294** (things to *buy* vs one thing already *held*) is stated
reciprocally and **must be preserved — with the expiry-anchored notice it becomes more important, not less,
because "this expires soon" is the sentence most likely to drift into an offer.** **Must not say:** anything
purchasable, and nothing that reads as an offer rather than as a fact about what is already held.

**Canonical changes needed:**
- Add condition **`c.expires`** after `a.explain`, two branches, reading the subject's own expiry from the
  membership record.
- Add exit **`x.explained`** (class `success`, `reEntry`: *"a different unused subject opens its own
  instance once the cooldown has run"*).
- Rewrite `a.remind` → **`a.expiry-notice`**: the content is the expiry, not a repetition.
- Re-anchor `w.act`: `relativeTo: "attribute"`, `attribute: "subject_expires_at"`, replacing the current
  unanchored `required: true` duration.
- `a.explain` and `a.expiry-notice`: `channelRoles` → `["persistent"]`; drop `push` and `in_app` from
  `channelsDeclared`.
- Resolve the `lifecycle` / `promotional` mismatch in `eligibility` to **promotional**.
- `loyalty_nurture.touches` rule text: *"one explanation, and one expiry notice only where the subject
  expires."*
- Populate `observes` on `c.valid`, `c.expires`, `c.acted`.

**Noted, because the domain audit flagged it as a product decision rather than a refactor:** if most
programmes' held benefits carry no expiry, SUB-297 becomes a one-touch journey almost always, and somebody
will read that as the nurture having been gutted. One touch is the correct answer in that case and the
branch makes it explicit rather than silent — **but this warrants an explicit product sign-off rather than
being slipped in with the channel changes.** The alternative that needs no sign-off is to cut `a.remind`
outright and leave SUB-297 at one touch, which breaks the SUB-296 convergence just as well and changes less.
**Do not re-flatten the two journeys into one shape under either option.**

**Display-only changes needed:** the same `a.record-no-action` absorption as SUB-296 (R5).

**Renderer changes needed:** R1, R5, R9, R11.

---

## SUB-298 — Reward Confirmation

**Purpose:** Confirm a state the membership actually reached — a reward earned, credited and usable — as
the record states it, and confirm nothing the record does not.

**Current flow:**
```
Trigger loyalty_reward_earned
  → c.state: is this reward a state the membership has actually reached, and still ours to
             confirm?
       ├ Not a reached state → EXIT x.closed
       ├ Nothing to send → a.record-no-action → EXIT x.no-action
       └ Confirm → a.confirm: what was earned, what it may be used for, until when
                   [email + in_app + push] → EXIT x.confirmed
```

**Problems found:**
- **Push on `a.confirm` contradicts the journey's own guardrail.** The `low-friction` role's `when` is
  *"the confirmation is short enough to carry the whole state"*; the guardrail is *"The confirmation states
  the reward record's own terms."* Terms are not short. (scheduling; J: *"the expiry is the part the member
  will need to check later, which makes this a record rather than a notification"*)
- `a.record-no-action` is absorbed but `x.no-action` is drawn, leaving a 6-node canvas with an exit whose
  parent is invisible. (scheduling; canvas §2.2 Tier B)
- Nothing else. **7 canonical nodes for a one-touch transactional confirmation is the right size.**

**Final orchestration:** **single** transactional confirmation. `Trigger → one three-way state decision →
one message → exit.` There is no wait, no second touch, no comparison, no holdout, and `measurement` has no
`businessOutcome` block — **because a confirmation is owed, not optimised. Do not add orchestration to this
journey.** It is `defaultPriority: "transactional"`, `pressureClass: "none"`, `localCap.appliesTo:
"non-mandatory"` with its one touch `mandatory: true`, so it is never traded against a marketing contact
budget, and `onLoss: "superseded"` rather than `suppressed`, so it loses only to a newer authoritative state
for the same reward. **All four of those are deliberate and correct.**

**Final customer channels:** **email**, alone. (J binding: what was earned, what it may be used for, and
**until when** — the expiry being the part the member will need to check later, which makes this a record;
and *"the in-product balance is the product's own display, not a second send"*, which is J's reason for
dropping in-app as well as push. The scheduling audit dropped push and kept in-app; the in-app is
superseded. J also lists this stage among the ones deliberately **not** on its true-fallback list: the gate
in front of it is binary — deliverable, or the instance records a no-action — and never picks between two
channels.)

**Customer touch count:** **1.** Fixed. One confirmation per reward record, and a redelivered event produces
no second copy (`s.duplicate`).

**Final flow:** unchanged.

**State re-checks:** `c.state` is the only one and the only one needed — it establishes credited (not
projected), membership active, no confirmation already recorded, deliverable destination.

**Stop conditions:** reversed or corrected before sending → `x.closed`, and **the correction is what gets
stated, under its own instance** (`s.reversed`). Not yet credited → not confirmed (`s.credited`). No
deliverable destination → no-action, **never forced onto another route** (`s.deliverable`).

**Ownership / handoff:** **highest in `membership-standing`** — *"a state the membership has actually
reached outranks every marketing-shaped message about it"* — and it yields to nothing in the group. No
handoffs. `distinctFrom` **SUB-297** (a fact about the record vs a claim about behaviour), **SUB-299** (one
reward vs the standing itself), **REM-157** (nothing has gone wrong here); the REM-157 side of that last row
is added in REM-157's section. Its **CON-300 × SUB-298 boundary is recorded as R in the collision review — a
transactional confirmation is not suppressed by a marketing sunset. Preserve.** **Must not say:** anything
about a reward that is projected, pending or reversed.

**Canonical changes needed:** `a.confirm`: `channelRoles` → `["persistent"]` (drop `low-friction` and
`in-session`); drop `push` and `in_app` from `channelsDeclared`. **Nothing else.**

**Display-only changes needed:** absorb `x.no-action` with its parent — the shared fix with SUB-296 and
SUB-297 (R5).

**Renderer changes needed:** R1, R5, R9, R11.

---

## SUB-299 — Loyalty Tier Upgrade

**Purpose:** Tell a member that their membership's standing has moved **up**, and say exactly what that
standing now grants that it did not before — and nothing else.

**Current flow:**
```
Trigger loyalty_tier_changed
  → c.direction: which way did the standing move, and is it in effect?
       ├ Moved down → EXIT x.out-of-scope        (no message, no handoff — deliberate)
       ├ No material movement → a.record-no-action → EXIT x.no-action
       └ Moved up and in effect → c.sendable [gate, absorbed]
  → a.announce: the standing now held, and what it grants that the previous one did not
    [email + in_app + push]
  → w.use (until loyalty_benefit_used | loyalty_membership_ended)  [collapsed into c.used]
  → c.used: has the new standing been used?
       ├ Used → EXIT x.adopted
       └ Not used → EXIT x.announced
```

**Problems found:**
- **Push on `a.announce`, the same contradiction as SUB-298:** the message is a difference list, and *"the
  delta is the content, and a delta is a comparison."* (scheduling; J)
- `a.record-no-action` drawn, same shape as SUB-296/297. (canvas P1-4)
- `w.use → c.used → x.adopted | x.announced` sends nothing on either arm; it is an observation window and
  the two exits differ only in what was measured. **Flagged and deliberately not changed** — see below.
- Nothing else. The downgrade refusal and the absence of a holdout are both right.

**Final orchestration:** **single** lifecycle announcement, with an in-graph refusal and a
measurement-only observation window. One touch. What distinguishes it from SUB-298 is not the number of
messages but the **refusal branch** and the **observation window**: this journey states in the graph that it
does not own the message a downgrade needs, and it holds the instance open afterwards to find out whether
the announcement meant anything.

**Preserve the refusal exactly as it is.** `loyalty_tier_changed` fires for downward movements too;
`c.direction` reads the programme's **own** ordering; a downward movement exits at `x.out-of-scope` (class
`no-action`) with **no message and no handoff**. There is no handoff **because no journey owns that message
and `validate:canonical` forbids a handoff to a non-existent target** — the refusal is honest rather than a
routing stub, and `x.out-of-scope`'s `reEntry` says so in plain words. **Do not add a target, do not add a
message, do not convert the branch into a suppression that hides it from the canvas.**

**Preserve `comparison: "none"` and the absence of a holdout.** *Withholding the news of a standing somebody
has actually earned is not an acceptable control.* SUB-296 and SUB-297 both carry required persistent
holdouts and this one deliberately does not — **that asymmetry is the design, not an omission**, and it
should be visible in the detail panel rather than looking like missing configuration. **Do not add
orchestration or a comparison to this journey.**

**Final customer channels:** **email**, alone. (J binding: the standing now held and what it grants that the
previous one did not, read from the programme's terms — a delta is a comparison and needs room. Push dropped
by both audits and by J's corpus rule; in-app dropped by J. The scheduling audit kept in-app and noted that
push *would* be defensible as a short nudge alongside the email where a programme's standings are a single
named thing and a live app audience exists — **but nothing in the data evidences either condition per
member, so the simpler plan wins and the reason is recorded here.**)

**Customer touch count:** **1.** Fixed. One announcement per change record; two upward movements close
together produce one announcement of the standing actually held.

**Final flow:** unchanged.

**State re-checks:** `c.direction` also checks *"no newer tier change exists"* — the supersession check is
inside the direction condition, which is economical and correct.

**Stop conditions:** downward or lateral movement → `x.out-of-scope`. Not yet in effect → no-action
(`s.effective`). Superseded by a newer change → the instance closes and the newer one speaks
(`s.superseded`). Permission withdrawn or no deliverable destination → no-action, never forced onto another
route (`s.permission`). `s.sunset` stops it. SUB-298 holding the membership → deferred (`s.contest`).

**Ownership / handoff:** **second in `membership-standing`**, below SUB-298 and above SUB-296 and SUB-297,
`onLoss: suppressed`. **Do not reopen.** No handoffs. It already names SUB-296; the reciprocal row is added
on SUB-296's side (ownership D-17). **Must not say:** anything about a downward or lateral movement, and
nothing about a reward record, which is SUB-298's.

**Canonical changes needed:** `a.announce`: `channelRoles` → `["persistent"]` (drop `low-friction` and
`in-session`); drop `push` and `in_app` from `channelsDeclared`. **Nothing else.**

**Display-only changes needed:** the `a.record-no-action` absorption shared with SUB-296/297/298 (R5).
**`w.use → c.used → x.adopted | x.announced` stays drawn**, and this is a deliberate refusal rather than an
oversight: the same `wait → did they use it?` shape appears in SUB-296 where it *does* change the path
(orientation or not), so a generic rule to hide it here would have to distinguish the two by "does a message
follow" — exactly the kind of structural predicate that erased business logic in five journeys the last time
a collapse rule was tightened. And `x.adopted` vs `x.announced` is this journey's only measure of an
announcement it is **forbidden** from A/B testing (`comparison: "none"`); hiding it would leave the canvas
implying the announcement is never evaluated at all.

**Renderer changes needed:** R1, R5, R9, R11.
