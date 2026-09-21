# Phase 1 audit — Scheduling & Subscription (12 public journeys)

Scope: `SCH-266` `SCH-277` `SCH-280` `SCH-282` `SCH-303` `SCH-304` `SUB-163` `SUB-262`
`SUB-296` `SUB-297` `SUB-298` `SUB-299`.

Source: `audit/public-journeys-current-state.json` (canonical + rendered display state),
`audit/batch-b-notes.md`, `audit/batch-d-notes.md`, `audit/new-journey-collision-review.md`.
Method and rules: `audit/refactor/_AUDIT-BRIEF.md`.

---

## Three findings that cut across the whole domain

Read these first; the per-journey sections refer back to them rather than repeating them.

### F1 — The renderer asserts a fallback relationship eight of these journeys explicitly deny

`ChannelPriorityRow` in `src/components/ui/JourneyCanvasNodes.tsx` (line ~265) labels channel
rows **by ordinal position**:

```tsx
<span …>{i === 0 ? w.primary : w.fallback}</span>
```

Every row after the first is printed as **Fallback / Yedek**, whatever the journey said.

But each journey declares its own fallback semantics in `channelStrategy.fallback`, and in this
domain the two values split cleanly:

| `channelStrategy.fallback` | journeys | what it means |
|---|---|---|
| `same-role-other-channel` | SCH-266, SCH-277, SCH-280, SCH-282, SCH-303, SCH-304, SUB-163, SUB-262 | fallback happens **inside** a role. The roles themselves are **not** a fallback chain. |
| `next-eligible-role` | SUB-296, SUB-297, SUB-298, SUB-299 | the next role genuinely substitutes. |

So on **all eight scheduling-side journeys the word "Fallback" on the canvas is false**.
SCH-304's late-detail card currently reads `Primary: SMS · Fallback: In-app · Fallback: Email`
when the journey's own text says SMS is for a holder who is already travelling, in-app is for a
holder inside the product, and email is the thing they can reopen — three different situations,
not three attempts at one.

This is the brief's number-one rule, and it is **a renderer bug, not a canonical one**.
`FlowNode.channelPlan` already carries `{ role, channels }` (`src/lib/canonical-view.ts:292`)
and the renderer throws the role away. Fix in F1-R below; it is the single highest-leverage
change in this audit and it is generic across the corpus.

### F2 — One channel plan per journey, pasted onto every action

The corpus builds a message's channels as `orchestration.channelRoles × channelStrategy.roles`,
and most journeys here give nearly every touch the same role list. The clearest case is
**SCH-277, where all five messages carry the identical `email + sms` plan** — the
acknowledgement that says *"this is not yet a commitment"*, the confirmation, the re-offer, the
decline and the lapse notice. Those are five different business moments and at least three
different urgency profiles.

Counts as authored today:

| journey | messages | distinct channel plans |
|---|---|---|
| SCH-277 | 5 | **1** |
| SUB-297 | 2 | **1** |
| SUB-262 | 2 | 1 (correct — see its section) |
| SCH-266 | 3 | 3 |
| SCH-303 | 3 | 3 |
| SCH-304 | 3 | 3 (but two are 3-channel) |

The per-journey sections set channels per **touch**, not per journey.

### F3 — SMS in this domain: where it is earned and where it is reflex

This domain has the corpus's strongest genuine SMS case, and it is narrow. SMS is earned where
**a named point in time is close enough that the person is about to act or to travel, and
missing it costs them the thing itself**. It is not earned by a journey being "important".

| SMS is earned | why |
|---|---|
| SCH-266 `a.at-risk` | a critical prerequisite with a *last point to complete*, inside the pre-start window |
| SCH-266 `a.remind` — same-day only | the appointment is today; the person is about to travel |
| SCH-303 `a.final` — release point inside the urgent horizon | the place is taken back at a stated moment |
| SCH-304 `a.late-detail` | a changed door / access instruction while the holder is already on their way |
| SCH-277 `a.reoffer` — only when the choosing deadline is inside hours | offered slots stay visible to everyone else |

| SMS is reflex — remove | why |
|---|---|
| SCH-277 `a.received` | an acknowledgement that explicitly says *"not yet a commitment"*. An SMS about a booking teaches people the booking exists; this is the exact dispute the journey exists to prevent |
| SCH-277 `a.decline`, `a.lapse` | nothing to do within hours; email is the record |
| SCH-303 `a.lapse` | the place is already gone; owed, but not urgent |
| SCH-304 `a.checkin` | a check-in step lives in the product, not in a text |
| SCH-280 `a.offer` | see its section — the moment has already passed |
| SUB-163 `a.request` | a renewal notice period is measured in days or weeks |

Net effect: SMS goes from appearing on 12 of the 21 customer-facing actions in this domain to 5,
and every one of the 5 is conditional on an attribute the journey already reads.

---

## SCH-266 · Appointment Reminder
*(`appointment-readiness-reminder` · 14 canonical / 15 display · booking-lifecycle #3)*

**Purpose.** Get the customer's side of a confirmed commitment done before the commitment
arrives, and build the reminder from what the booking *is* at send time, not from what it was.

**Current flow.**
```
Confirmed booking w/ customer-owed prerequisites
  → Is there enough time for a prompt to be worth sending?
      Time remains        → Prompt (every outstanding prerequisite, one message) [email + in-app]
                            → Wait (pre-start window; until prerequisites_completed
                                    | booking_materially_changed)
                                → What resolved the wait?
                                     All complete   → Wait (pre-start) ─┐
                                     Booking changed → EXIT superseded  │
      Too close to prompt ──────────────────────────────────────────────┴→ Re-read booking
  → Does the booking still stand as just read?
      Cancelled/moved → EXIT superseded
      Still valid     → Is anything outstanding that would stop the service?
          Critical missing → At-risk notice [sms + email] → HANDOFF SCH-174 Reservation Readiness
          Nothing critical → Reminder [sms + email + in-app] → HANDOFF SCH-177 Pre-Service Revalidation
```

**Problems found.**
1. `a.remind` carries three channels with no differentiation (F2). **In-app is the wrong
   carrier for a reminder** — a reminder that only arrives if the person opens the product is
   not a reminder. It is the brief's *"do not rely on In-app alone to recover someone"* rule
   applied one step earlier.
2. `a.remind` gets SMS unconditionally. A reminder for an appointment eight weeks out does not
   need a text; one for an appointment today does. The `channelStrategy` role already states the
   right test (*"the scheduled time is within the same day"*) — the touch just ignores it.
3. `w.prestart` sends `onEvent` and `onTimeout` to the **same** node (`a.revalidate`). Both arms
   being identical makes the `untilEvent: ["booking_materially_changed"]` decorative on the
   canvas — the change is actually caught by the re-read that follows, not by the wait.
4. **Both success endings are handoffs into archived Operational Workflows journeys**
   (SCH-174, SCH-177, `isPublicDestination: false`), so they render as plain text with no link.
   The journey's only drawn exit is `x.superseded` — a reader follows the reminder going out and
   the canvas stops on an unexplained dead card. This is Family D's open `P-HANDOFF-02` item.

**Final orchestration — state-gated single reminder with a conditional escalation.**
Not a sequence and not a fallback chain. One optional prompt, then one mandatory revalidation,
then **exactly one of two mutually exclusive messages** chosen by `c.critical`. The choice is
between *warning* and *reminding*, which are different messages with different obligations — the
split earns its place because it changes what is said, who it escalates to, and whether the touch
is capped.

**Final customer channels.**
- `a.prompt` — **email** (a list of things to do over time, must be reopenable) **+ in-app**
  where the person is in the product and the prerequisite can be completed there. Parallel
  routes to one message, not a fallback.
- `a.at-risk` — **SMS** where service-SMS permission is recorded, **email** otherwise and as the
  record. The strongest SMS case in the corpus: a named last point, a consequence that costs the
  appointment.
- `a.remind` — **SMS when `scheduled_at` is inside the same day**, **email otherwise**.
  Conditional routing on an attribute the journey already holds. **Drop in-app.**

**Customer touch count.** 2 maximum (prompt + one of at-risk/reminder); frequently 1 when the
booking is confirmed inside the pre-start window (`s.too-close`).

**Final flow.** Unchanged in shape. Only `a.remind`'s channel plan changes.

**State re-checks.** `a.revalidate` before every send (re-reads confirmation, time, provider,
outstanding prerequisites); `c.valid` and `c.critical` immediately after. This is the strongest
re-check discipline in the domain and must not be simplified.

**Stop conditions.** `booking_materially_changed` / cancellation at any point → `x.superseded`
(`s.changed`). One reminder per occurrence, ever (`s.once`). Deduplicated against SCH-277 and
SCH-180 on the same booking (`s.dedup`).

**Ownership / handoff.** Third in `booking-lifecycle`, `onLoss: suppressed`. Do not reopen.
`h.at-risk` → SCH-174; `h.prestart` → SCH-177, carrying `suppresses: ["any further reminder for
this occurrence"]`.

**Canonical changes needed.**
- `a.remind`: `channelRoles` `["urgent","persistent","in-session"]` → `["urgent","persistent"]`;
  add the same-day condition to the `urgent` role's `when` (it is already written there — the
  touch needs to inherit it).
- Optional: give `w.prestart` a single successor, since both arms already converge. Low value;
  leave it if the display collapse (Family B) is doing the job.

**Display-only changes needed.**
- Render both handoff cards with the archived-target affordance (F3-D below).
- The at-risk / reminder pair should read as a two-way branch on one row, not as a ladder.

**Renderer changes needed.** F1-R (role labels), F2-R (trigger naming), F3-D (archived handoff
affordance).

---

## SCH-277 · Booking Confirmation
*(`reservation-outcome-notice` · 14 canonical / 16 display · booking-lifecycle #1)*

**Purpose.** Tell the requester whether the time they asked for is now a commitment, and where it
is not, offer what actually exists — because the availability they were shown was a picture and
never a hold.

**Current flow.**
```
Reservation request recorded
  → Acknowledge ("this is not yet a commitment; the outcome comes at X") [email + sms]
  → Wait (booking semantics' own resolution period; until booking_confirmed
          | booking_request_rejected)
      timeout → Lapse notice [email + sms] → EXIT lapsed
      → What did revalidation decide?
           Committed             → Confirmation [email + sms] → EXIT confirmed
           Gone, something near  → Re-offer current availability + deadline [email + sms]
                                   → Wait (stated choosing deadline)
                                        timeout → EXIT lapsed
                                        → Did they take one?
                                             Took a slot  → HANDOFF SCH-173
                                             Declined all → EXIT declined
           Gone, nothing near    → Decline w/ next horizon [email + sms] → EXIT declined
```

**Problems found.**
1. **Five messages, one channel plan** (F2) — the worst instance in the domain.
2. **SMS on the acknowledgement is actively harmful.** The journey's own first guardrail is
   *"A request acknowledged is never worded as a request confirmed."* A text message about a
   booking is read as a booking. The channel choice contradicts the guardrail.
3. Its `suppressions` are its `guardrails` restated verbatim as `s.g1`…`s.g5`. It has no
   suppression that names a *stop condition with a reason* in the shape SCH-303/SCH-304 use.
   There is no `s.contest` even though it is the top of `booking-lifecycle`, and no statement of
   what happens when the request is superseded by a newer one from the same requester.
4. `a.lapse` is reached from `w.outcome`'s timeout without a state re-read. Every other journey
   in this cluster re-reads before sending; this one sends *"nothing was booked"* off the wait
   arm alone. If the confirmation landed late, the lapse notice contradicts it.

**Final orchestration — conditional routing on an authoritative outcome, with an
event-or-timeout second stage on the re-offer branch only.**
There is one acknowledgement and then exactly one outcome message, selected by what the booking
system decided. Nothing here is sequential and nothing is a fallback. The re-offer branch is the
only place a second window exists, and it exists because the requester now has a decision to
make against a stated deadline.

**Final customer channels.**
- `a.received` — **email only.** It is a record of a request and an explicit non-confirmation.
- `a.confirm` — **email** (must restate the concrete slot and survive a month) **+ SMS only
  where `scheduled_at` is inside the urgent horizon** (same-day / next-day booking, where the
  confirmation is also effectively the reminder).
- `a.reoffer` — **email + SMS**, because `choice_deadline_at` is stated in the message and the
  offered slots are not held. This is the journey's genuine SMS case.
- `a.decline` — **email only.**
- `a.lapse` — **email only.**

**Customer touch count.** 2 (acknowledgement + one outcome message). Unchanged; the cap of 2 is
correct.

**Final flow.** Shape unchanged. Add one state re-read before `a.lapse`:
```
  Wait (outcome) ─timeout→ Re-read the request  → Resolved after all? → c.outcome
                                                → Still unresolved?   → Lapse notice [email]
```

**State re-checks.** `c.outcome` reads the booking record's verdict, not the wait arm. Adding the
re-read before `a.lapse` closes the one gap.

**Stop conditions.** Currently none beyond the guardrails. Recommended additions, written as
real suppressions: exit where the requester cancels the request; exit where a newer request from
the same requester for the same resource supersedes this one; `s.contest` stating its own top
position from its own side (it is currently only stated in `contact.competition.precedence`).

**Ownership / handoff.** Highest in `booking-lifecycle`, `onLoss: suppressed`. Do not reopen.
`h.rebook` → SCH-173 (archived).

**Canonical changes needed.**
- Split `orchestration.touches[].channelRoles` per touch, as above.
- Add `a.reread-outcome` before `a.lapse` plus a two-branch condition.
- Replace `s.g1`…`s.g5` with named suppressions (`s.not-confirmed`, `s.current-availability`,
  `s.nothing-held`, `s.lapse-stated`, `s.concrete-slot`) and add `s.contest` + `s.superseded`.

**Display-only changes needed.** `x.lapsed` is reached from two branches and instanced twice
already (`sharedTerminalInstances: 4`) — correct, keep. No other change.

**Renderer changes needed.** F1-R, F2-R, F3-D.

---

## SCH-280 · No-Show Follow-Up
*(`no-show-rebooking` · 13 canonical / 14 display · no exclusion group)*

**Purpose.** Offer a way back to somebody whose booking did not happen, having first established
that the miss was theirs and not ours.

**Current flow.**
```
No-show recorded against booking
  → [Re-read latest events]  (absorbed as bookkeeping; not drawn)
  → Did the booking genuinely not happen?
       Superseded/reconciled → EXIT suppressed (nothing sent)
       Genuinely missed → Could the provider actually have delivered?
            Our side failed → HANDOFF SCH-180 Booking Reschedule
            Deliverable     → Is there anything to offer?
                 Nothing to rebook onto → Acknowledgement, no prompt [email] → EXIT closed
                 Rebooking available    → Offer + route + closing date [email + sms]
                                          → Wait 7–14d (until rebooked | rebooking_declined)
                                               timeout → EXIT closed
                                               → Rebooked → EXIT rebooked
                                                  Declined → EXIT closed
```

**Problems found.**
1. **SMS on `a.offer` is the weakest SMS case in the domain.** The moment has already passed.
   There is no deadline inside hours; the rebooking window is 7–14 days. A text about a missed
   appointment also reads as chasing, which is exactly what the journey's *"no blame, no penalty
   language"* guardrail is guarding against. The `channelStrategy` role hedges it (*"the
   rebooking window is short"*) but no condition in the graph reads that.
2. `a.reread` is absorbed by Family A because it declares no `writes` — yet the journey's first
   guardrail is *"The record is re-read immediately before sending. A message about a miss is the
   one thing that cannot be sent on stale state."* The re-read survives on the canvas only
   through the condition that follows it (`c.superseded`, which is drawn and carries the
   meaning). Acceptable as-is, but it is the closest this domain comes to a collapse hiding
   something load-bearing.
3. No exclusion group. It is the only scheduling journey here outside `booking-lifecycle`, and
   that is correct — the booking it speaks about no longer exists as a future commitment. Worth
   stating as a `distinctFrom` note rather than leaving `competition: null` unexplained.

**Final orchestration — single conditional message, then event-or-timeout.**
Three sequential screening decisions (did it happen · was it us · is there anything to offer)
that choose between *one* message and *no* message, followed by one bounded window that only
classifies the outcome. Deliberately not a sequence: *"one offer, not a sequence. Somebody who
missed once is not pursued."*

**Final customer channels.**
- `a.acknowledge` — **email only.** Already correct.
- `a.offer` — **email only** by default. Add SMS **only** as a conditional route where the
  rebooking route's own closing date is inside 48 hours *and* service-SMS permission is recorded.
  If that attribute is not populated for a given programme, the answer is email.

**Customer touch count.** 1. Correct and should stay 1.

**Final flow.** Unchanged.

**State re-checks.** `a.reread` + `c.superseded` before anything is sent. `c.outcome` after the
window. Sufficient.

**Stop conditions.** A cancellation, reschedule or late attendance landing after the no-show was
recorded → `x.suppressed` (`s.reread`). Provider-side failure → handoff, nothing sent
(`s.provider-fault`). Nothing to rebook onto → acknowledgement with no prompt
(`s.nothing-to-rebook`).

**Ownership / handoff.** `h.provider` → SCH-180 (archived). Yields nothing else.

**Canonical changes needed.** `a.offer`'s `urgent` role becomes conditional on the rebooking
route's closing date rather than declared unconditionally; or remove it. Prefer removal unless a
programme can evidence the short-window case — the brief's *"prefer the simpler pattern and say
so"* applies directly here.

**Display-only changes needed.** None.

**Renderer changes needed.** F1-R, F2-R, F3-D.

---

## SCH-282 · Availability Search Abandonment
*(`availability-searched-no-booking` · 15 canonical / 17 display · commerce-recovery)*

**Purpose.** Follow an availability question that produced no booking with something that is
genuinely bookable *now*, or with a waitlist place where nothing fits.

**Current flow.**
```
Availability query closed without reservation   [behavioral]
  → May an unprompted offer be sent to this person at all?
       Anonymous / not permitted → EXIT no-route
       Identified and permitted  → Wait (bounded settle period; until booking_confirmed
                                          | availability_lost; never extended by browsing)
            → What ended the delay?
                 Booked unprompted → EXIT booked
                 Window gone       → Re-evaluate what is bookable now
            timeout → Re-evaluate what is bookable now
  → What is actually available now?
       A near window is bookable   → Offer nearest window, labelled as different, not held
                                     [email + push] → Wait (until booking_confirmed)
                                        → EXIT booked / EXIT lapsed
       Nothing fits, waitlist      → Waitlist place, reserves nothing [email + push]
                                     → Wait (until waitlist_place_taken) → EXIT waitlisted / lapsed
       Nothing fits, no waitlist   → EXIT nothing (no message sent)
```

**Problems found.** Very few. This is the best-constructed journey in the scheduling half.
1. `c.permitted` reads on the canvas as a generic permission gate — the thing the brief says not
   to draw on every journey. Here it is **not** generic: an availability query genuinely can be
   anonymous, and identification changes the visible route. The problem is the *wording*, which
   leads with permission instead of with identification. Reword the display question.
2. The `x.lapsed` exit is shared by `w.respond` and `w.waitlist` — two different things
   (an offer not taken; a waitlist place not accepted). Per-parent instancing already draws it
   twice, but the exit **state text is the same on both** (*"offer made and not taken"*), which
   is wrong for the waitlist arm.
3. Its suppressions are `s.g1`…`s.g5` — guardrails restated — plus the real `s.sunset`. Same
   naming gap as SCH-277 and SUB-262.

**Final orchestration — bounded delay, re-evaluate from scratch, single offer, three-way
outcome split.** No second touch, ever. The delay is not a "nurture interval": it exists because
*"an offer that arrives while somebody is still choosing competes with the thing they are
choosing, and usually wins nothing."* That is an honest, non-generic reason for a wait and is
worth keeping verbatim.

**Final customer channels.** **email + push**, unchanged and correct. Push is right here for the
brief's stated reason — an active app audience, a timely nudge, one step from the notification
to the booking screen. Email carries the window details. No SMS: an availability *enquiry* is
inferred-adjacent interest, and the journey is `pressureClass: promotional`. Putting a
promotional offer on SMS in this domain would be the single clearest violation of F3.

**Customer touch count.** 1 (offer **or** waitlist, never both). The cap of 2 overstates it;
reduce the cap's default to 1 to match the graph.

**Final flow.** Unchanged.

**State re-checks.** `a.recheck` re-evaluates availability from scratch before the offer —
explicitly not reusing what the query returned. This is the correct pattern and the whole point
of the journey.

**Stop conditions.** The person books unprompted → `x.booked`, nothing sent. Nothing available
and no waitlist → `x.nothing`, nothing sent. `s.sunset` (CON-300's sender-side marketing
suppression) stops it — correct, and required by
`scripts/sunset-suppression-evidence.mjs` for any promotional journey.

**Ownership / handoff.** `commerce-recovery`, `onLoss: suppressed`, *"below process recovery and
selection recovery; alongside interest recovery — an availability enquiry that asked for a
specific window outranks inferred interest for the same person."* No handoffs.

**This is the corpus's clearest specific-beats-general precedent and the one to mirror.** Its
shape is: name the *general* journey, name the *specific* signal, and say which attribute of the
signal makes it specific (*a stated window*). `audit/collision-fixes.md` already records ACQ-289
citing it rather than ACQ-287/288. Any new precedence prose in this refactor should copy that
three-part shape rather than inventing another.

**Canonical changes needed.**
- Reword `c.permitted`'s `displayQuestion` to lead with attribution:
  *"Can this query be attributed to a person we may contact?"*
- Split `x.lapsed` into `x.offer-lapsed` and `x.waitlist-lapsed`, or give the waitlist arm its
  own state text.
- `availability_searched.touches` default 2 → 1.
- Rename `s.g1`…`s.g5`.

**Display-only changes needed.** None beyond the above.

**Renderer changes needed.** F1-R, F2-R.

---

## SCH-303 · Reservation Payment Reminder
*(`reservation-payment-reminder` · 18 canonical / 21 display · booking-lifecycle #2)*

**Purpose.** Keep a reservation that is standing only because a payment is still expected, by
telling the holder what the *booking terms* do about it — and getting out of the way the moment
the payment itself is what went wrong.

**Current flow.**
```
Reservation payment outstanding
  → Does the reservation still stand with the obligation still outstanding?
       Already settled   → EXIT kept
       No longer standing→ EXIT superseded
       Standing & outstanding → [May the outstanding notice go out?]  (gate, absorbed)
  → Outstanding notice: what is owed, the terms' due point, what the terms do [email + in-app]
  → Wait (until obligation_satisfied | authoritative_payment_failure
          | booking_materially_changed; timeout at the due point)
       → What resolved the wait?
            Kept      → EXIT kept
            Payment failed → HANDOFF FIN-134 Payment Failure Recovery
            Withdrawn → EXIT superseded
       timeout → Does it still stand as just re-read?
            Settled meanwhile  → EXIT kept
            Withdrawn meanwhile→ EXIT superseded
            Still at risk → [May the final notice go out?] (gate, absorbed)
  → Final notice: the reservation as it stands, the last point it can be kept, what the terms
    do afterwards [sms + email + in-app]   (mandatory)
  → Wait (same three events; timeout at the release point)
       → same three-way resolution (kept / FIN-134 / superseded)
       timeout → Release notice: released, nothing held, what the record shows
                 [email + sms]  (mandatory) → EXIT released
```

**Problems found.**
1. `a.final` carries **three** channels and `a.lapse` carries two, both unconditionally (F2/F3).
2. `a.lapse` on SMS is wrong. The place is already gone. It is *owed* — the guardrail *"a place
   that disappears in silence is discovered by the holder on the day"* is right and the message
   must be sent — but it is a record, not an urgent action, and there is nothing for the holder
   to do within hours.
3. The two `c.sendable` gates are absorbed by the display layer along with `a.record-no-action`
   and `x.no-action` (`canonicalNodesNotDrawn` confirms all four). That is correct — they are
   implementation gates that record a reason before exiting, which is exactly the Family C
   signal. Nothing to fix; noted so nobody "restores" them.

**Final orchestration — escalating two-window event-or-timeout, with a hard ownership exit.**
Two bounded windows anchored to two attributes the *booking terms* own (the due point, the
release point), each resolving three ways. It escalates in *consequence stated*, not in
frequency, and the escalation stops at a handoff rather than at a retry.

**How this is kept out of dunning territory — the four tests, all of which it passes today
and must keep passing:**

| test | SCH-303 today |
|---|---|
| **Subject** | The entity is `booking_id`, scoped *"one confirmed reservation whose continued standing depends on a payment its holder still owes."* The money has no instance key here. `a.remind`'s own text: *"The subject is the place they hold, not the money."* |
| **No retry, no decline classification** | There is no retry node, no attempt counter, no decline-code branch. The only thing done with a failure is `h.payment-failure`. |
| **No amount as a debt** | Every message states *what the terms do to the reservation*. The due point and release point are **read** from the booking terms (`s.superseded`: re-read before every touch) and the journey *"never asserts, moves or softens either."* |
| **Silence after handoff** | `h.payment-failure` carries a `suppresses` clause; there is no path from the handoff back into this graph. Three of the four arms that could see a failure route to it (`c.outcome`, `c.outcome2`, and the trigger's own `insufficientAlone`). |

My channel recommendation is set so as not to erode this: **the release notice loses SMS**
precisely because an SMS about money that has not been paid is the single change that would make
this read as collections. Keep it on email.

Also preserve the boundary being **stated from both sides asymmetrically** (batch D §3): SCH-303
declares the deference (`s.failure-not-ours`, `distinctFrom` FIN-134, the handoff contract) and
FIN-134 is deliberately *not* in `booking-lifecycle`. Do not "complete" that by adding a
competition block to FIN-134 — most FIN-134 instances have no reservation behind them.

**Final customer channels.**
- `a.remind` — **email + in-app.** Correct as authored. In-app is right here because the
  obligation can be settled without leaving the product.
- `a.final` — **SMS where the release point is inside the urgent horizon** (the condition the
  `urgent` role already states), **email otherwise and as the record**, **+ in-app** where the
  holder is in the product. Keep the three routes but make SMS conditional rather than first.
- `a.lapse` — **email only.** Drop SMS.

**Customer touch count.** 3; discretionary budget 1. Correct — `localCap.appliesTo:
"non-mandatory"` with both later touches `mandatory: true` is the right shape and is one of the
better-reasoned caps in the corpus.

**Final flow.** Shape unchanged.

**State re-checks.** `c.standing` at entry, `c.still` at the due point (re-reads the reservation
*and* the obligation), and the terms are re-read before every touch per `s.superseded`.
Comprehensive; do not reduce.

**Stop conditions.** Obligation satisfied / waived / cancelled by any route → `x.kept`
(`s.settled`). Reservation cancelled, moved or materially changed → `x.superseded`. Authoritative
payment failure → FIN-134 and silence (`s.failure-not-ours`). Unknown attempt outcome → reconcile
first, treat as neither (`s.unknown-outcome`, GLB-20). SCH-277 holding the reservation →
suppressed, not queued (`s.contest`).

**Ownership / handoff.** Second in `booking-lifecycle`, `onLoss: suppressed`. Do not reopen.
`h.payment-failure` → FIN-134 — **the only public handoff target in these 12**, so the only one
that renders as a link.

**Canonical changes needed.** `a.lapse`: drop the `urgent` role. `a.final`: reorder the roles so
`persistent` is the declared default and `urgent` is the attribute-conditioned route (the `when`
clause is already correct; only the ordering implies otherwise, and see F1 — the ordering is
currently what the canvas prints as Primary/Fallback).

**Display-only changes needed.** None. The four absorbed nodes are absorbed correctly.

**Renderer changes needed.** F1-R, F2-R.

---

## SCH-304 · Pre-Arrival Preparation
*(`pre-arrival-preparation` · 20 canonical / 19 display · booking-lifecycle #4)*

**Purpose.** Tell somebody what turning up actually requires — and say it only where it answers
something they could not already know.

**Current flow.**
```
Arrival window opened
  → Is this occurrence still something to arrive at?
       Cancelled/moved → EXIT superseded
       Already under way → EXIT overtaken
       Still ahead → [May the arrival details go out? incl. "does the booking hold arrival
                      facts worth carrying"]  (gate, absorbed)
  → Arrival details: place or joining route, what to have, the step that can be done first
    [email + in-app]
  → Wait (until check_in_completed | booking_materially_changed | attendance_recorded)
       → What resolved it?  Checked in → Wait(day-of) · Changed → superseded · Arrived → arrived
       timeout → Is a check-in step still owed?
            Nothing owed → Wait(day-of)
            Still owed   → [gate] → Check-in prompt: the one step + last point [in-app+email+sms]
                           → Wait(day-of)
  → Wait (day-of; until booking_materially_changed | attendance_recorded)
       → Changed → superseded · Arrived → arrived
       timeout → Is there anything that could not have been said earlier?
            Nothing new → EXIT ready            (the ordinary case)
            Something changed → [gate] → Late detail: only what is new, said as new
                                         [sms + in-app + email] → EXIT ready
```

**Problems found.**
1. `a.checkin` carries three channels including SMS, and `a.late-detail` carries all three with
   SMS declared first (F1/F2/F3). A check-in step lives in the product; texting somebody to go
   and do it in the app is a worse route to the same place.
2. Nothing else. This is the strongest-authored journey in the domain.

**Final orchestration — budgeted conditional touches, not a sequence.**
This is deliberately the odd one in the cluster and must stay that way. Three touches, **each
independently conditional on there being something to say**, against a ceiling of 3 with
`appliesTo: "all"`. An occurrence with nothing new reaches `x.ready` having spent nothing. The
two waits are not "delays between messages" — they are the windows in which a fact might become
knowable.

**The guardrail stays, verbatim:** *"A message whose content is how long remains is a countdown,
and this journey does not send one."* Every touch's gate exists to enforce it —
`c.owed` (does a check-in step exist, is it open, is it unfinished), `c.late` (does the booking
now hold an arrival fact this journey has not already sent), and `c.sendable`'s own *"the booking
holds arrival facts worth carrying"* clause. Do not merge those gates into a generic send check;
they are the journey.

**Final customer channels.**
- `a.details` — **email** (a route and a list, must be reopenable when the holder sets off)
  **+ in-app**. Correct as authored.
- `a.checkin` — **in-app** (the step is there) **+ email**. **Drop SMS.**
- `a.late-detail` — **SMS** where the scheduled time is close enough that the holder is likely
  travelling *and* service-SMS permission is recorded, **email otherwise**. The domain's second
  genuine SMS case: a changed door or access instruction reaches somebody who has already left.
  **Drop in-app** — somebody en route is not in the product.

**Customer touch count.** 0–3, ceiling 3. Correct and bounded; do not raise or lower.

**Final flow.** Shape unchanged.

**State re-checks.** Arrival facts re-read from the booking immediately before every touch
(`s.changed`); `c.owed` re-reads the check-in record; `c.late` compares the booking's current
arrival facts against what this journey has already sent. Best-in-domain.

**Stop conditions.** Cancellation or material change → `x.superseded`. Attendance or arrival
recorded → `x.arrived`, immediately, *"rather than finishing its plan"* (`s.overtaken`).
Nothing new to say → `x.ready`, the ordinary case and explicitly not a failure
(`s.nothing-new`). Any higher `booking-lifecycle` member holding the occurrence → suppressed
(`s.contest`).

**Ownership / handoff.** Lowest in `booking-lifecycle`, `onLoss: suppressed`. Do not reopen.
**No handoffs, deliberately** — batch D records that a second route into SCH-177 would mean two
journeys claiming the same attendance question. Keep it.

**Canonical changes needed.** `a.checkin`: drop `urgent`. `a.late-detail`: drop `in-session`,
and order `persistent` ahead of `urgent` so the canvas does not print SMS as the primary (F1).

**Display-only changes needed.** None. The three gates + bookkeeping + `x.no-action` are
absorbed correctly, which is why 20 canonical nodes draw as 19.

**Renderer changes needed.** F1-R, F2-R.

---

## SUB-163 · Renewal Reminder
*(`renewal-decision` · 20 canonical / 17 display · relationship-continuity)*

**Purpose.** Reach a decision about the next term, **as a decision** — separate from anything
that makes the next term real.

**Current flow.**
```
Renewal decision window opens
  → [Evaluate eligibility, model, state, notice, pricing, blockers]  (absorbed)
  → Are the renewal terms and required notice defined?
       Not defined → HANDOFF DEC-181 Decision Request
       Defined → Do the terms require notice to actually be given?
            Notice required → Notice: the model, the terms it renews on, what happens if they
                              do nothing [email + in-app]   (obligation, outside the cap)
            No obligation ──┐
  → Does an outstanding blocker prevent the decision?
       Blocked → Record RENEWAL_REVIEW → Wait (to notice deadline)
                    → c.decision   /   timeout → HANDOFF OWN-55 Ownership Escalation
       Clear → What does the renewal model require?
            Auto-renew, met   → [record decided] → HANDOFF SUB-164 Renewal Execution
            Review first      → Record RENEWAL_REVIEW → (as above)
            Explicit decision → Decision request [email + in-app + sms + push]
                                → Wait (term_end minus notice period; until
                                        renewal_decision_recorded)
                                     timeout → [apply the terms' own default] → c.decision
  → What is the outcome for the next term?
       Cancellation in motion → EXIT superseded
       Renew      → [record decided] → HANDOFF SUB-164
       Do not renew → [record NON_RENEWING] → HANDOFF SUB-168 Scheduled Cancellation Revalidation
```

**Problems found.**
1. **`a.request` carries `["sms","push"]` inside a single `urgent` role.** Two unrelated channels
   bundled as one bucket is the clearest artefact of the "fallback reflex" — it says *"if not
   SMS then push"*, which is not a substitution anybody designed. And the underlying premise is
   wrong for this journey: the deadline is `term_end_at minus the notice period the terms
   require`. That is days or weeks. F3 applies directly.
2. `a.notice` and `a.request` are different objects — a legal obligation and a question — and
   they can both fire on the same cycle. Nothing in the graph prevents the notice and the request
   arriving as two near-identical emails about the same renewal. There is no dedup between them.
3. The journey ends **only in handoffs** (`measurement.journeyOutcome.type: "handoff"`), and all
   four targets are archived (`DEC-181`, `OWN-55`, `SUB-164`, `SUB-168`). The canvas therefore
   terminates in four non-link text cards plus one suppression exit. Same reader problem as
   SCH-266, worse.
4. Three internal actions are absorbed (`a.evaluate`, `a.default`, `a.non-renew`) — correct, but
   `a.default` is doing something a reader would want to see: *"Apply what the governing terms
   define as the outcome when no decision is made."* It writes only a journal row, so Family A
   hides it, and the timeout edge now runs straight from the wait into `c.decision` with no sign
   that a default was applied. Flagged; see display changes.

**Final orchestration — conditional routing on the renewal model, with an event-or-timeout
decision window on one branch only.**
There is no sequence and no cadence. The model decides whether anybody is asked at all: an
auto-renew with its conditions met sends a notice and never asks; an explicit-decision model asks
once. A journey that is often **zero customer touches** (no notice obligation + auto-renew) and
never more than two.

**Final customer channels.**
- `a.notice` — **email** (the obligation must be producible later) **+ in-app** where the
  decision holder is in the product.
- `a.request` — **email + in-app.** **Drop SMS and push.** A renewal decision is addressed to
  whoever *holds* the decision, which on a contract relationship is frequently not the person
  whose phone is on file.

**Customer touch count.** 0–2. Correct. The cap (`1` discretionary, notice outside it) is right.

**Final flow.** Shape unchanged, plus a dedup condition: where the notice has already been sent
on this cycle and the model then requires an explicit decision, `a.request` restates the decision
and **does not restate the terms** the notice already carried.

**State re-checks.** `c.decision`'s first branch re-reads the relationship for a cancellation in
motion — the journey's own sixth guardrail covers exactly the case of a cancellation starting
after the request went out. `w.decision` and `w.review` both re-check. Good.

**Stop conditions.** Cancellation in motion → `x.superseded` (the relationship's own lifecycle
takes it). Open payment recovery → suppressed entirely at eligibility (`s.payment-recovery`).
Decision recorded → nothing further (`s.decided`). Undefined terms → DEC-181, nothing sent.

**Ownership / handoff.** *"Subscription Renewal outranks generic Expiry Reminder"* — already
stated from both sides, in SUB-163's `distinctFrom` TIM-63 and in its precedence prose. Do not
reopen. Below cancellation-in-motion, below an active risk state, below open payment recovery.

**Canonical changes needed.**
- `a.request`: `channelRoles` drop `urgent`; or at minimum split `["sms","push"]` so the plan
  never bundles two unrelated channels in one role.
- Add a dedup condition or a `s.notice-already-given` suppression covering the notice/request
  overlap.

**Display-only changes needed.**
- Either keep `a.default` drawn (it is the only place the *terms'* outcome is applied and it is
  what makes "no answer ≠ agreement" visible), or label the timeout edge with it. Absorbing it
  silently loses the journey's second guardrail. **Recommendation: exempt an absorbed action
  from Family A where the edge into it is a wait timeout and it is the only node on that arm.**
- Archived-handoff affordance on all four handoff cards (F3-D).

**Renderer changes needed.** F1-R, F2-R, F3-D.

---

## SUB-262 · Cancellation Confirmation
*(`cancellation-wind-down-notice` · 10 canonical / 10 display · no exclusion group)*

**Purpose.** Carry somebody through the period between deciding to leave and actually losing
access, so the end date is never a surprise and returning stays possible right up to it.

**Current flow.**
```
Cancellation confirmed
  → Confirm: the cancellation, the exact end date, what remains until then [email + in-app]
  → Is there a meaningful window before access ends?
       Ends immediately → c.obligations
       Window remains   → Wait (until cancellation_withdrawn | effective_end_reached)
            → Did they withdraw?
                 Withdrawn   → EXIT returned
                 Still ending→ Ending-shortly notice: what survives and what does not
                               [email + in-app]
            timeout → Ending-shortly notice
  → Does anything outlive the relationship?
       Obligations remain → HANDOFF SUB-170 Continuing Relationship End Reconciliation
       Nothing outstanding → EXIT ended
```

**Problems found.** Almost none. **This journey is already right, and the correct finding is to
leave it alone.** The brief asks explicitly that not every journey come out changed.
1. Its suppressions are its guardrails restated (`s.g1`…`s.g4`) — the same naming gap as SCH-277
   and SCH-282.
2. `measurement` has no `businessOutcome` block and `goal.event` is `null`. That is *honest* —
   a wind-down has no conversion event and inventing one would be worse — but it should be stated
   rather than absent, so a reader does not read it as an omission.

**Final orchestration — sequential, two touches, with a mandatory state re-check between them.**
The plainest shape in the domain and the right one: one immediate confirmation, one window, one
ending notice. The `c.window` condition is real — a cancellation effective immediately has
nowhere to put a second message — and the `c.withdrawn` re-check is the journey's whole point.

**Final customer channels.** **email + in-app** on both touches, unchanged. This is the one
journey in the domain where the *same* plan on both touches is correct: both messages carry
dates and what-survives-what lists that the person must be able to reopen, and both are read by
somebody who is still a customer and still in the product. Say so explicitly so the next reader
does not "fix" it for symmetry with F2.

No SMS: the end date is weeks away and the message is a record. No push: nothing here is a nudge.

**Customer touch count.** 1–2. Correct.

**Final flow.** Unchanged.

**State re-checks.** `c.withdrawn` before the ending notice — *"a reminder that access is ending,
sent to somebody who has just stayed, is worse than sending nothing."* Exactly the brief's
never-send-a-reminder-after-success rule, already implemented.

**Stop conditions.** Withdrawal or reactivation → `x.returned`, immediately. The cancellation is
never re-litigated (`s.g1` → rename `s.no-relitigation`); a save attempt belongs to RET-28,
before this journey.

**Ownership / handoff.** `distinctFrom` RET-28 (before the decision) and SUB-167 (establishes
whether and when it ends). `h.obligations` → SUB-170 (archived). No exclusion group, correctly —
nothing else speaks about a cancelled relationship's wind-down.

**Canonical changes needed.** Rename `s.g1`…`s.g4`. Add an explicit `businessOutcome: null` note
or the equivalent stating why there is no conversion event. **No channel or structural change.**

**Display-only changes needed.** None.

**Renderer changes needed.** F1-R (it declares `same-role-other-channel`, so its second row is
currently mislabelled Fallback), F2-R, F3-D.

---

## SUB-296 · Loyalty Program Welcome
*(`loyalty-welcome` · 13 canonical / 10 display · membership-standing #3)*

**Purpose.** Open an enrolled membership honestly: what it grants from today, where it lives,
how it is used — without borrowing product onboarding or the first-purchase welcome.

**Current flow.**
```
Loyalty membership enrolled
  → Is this membership ours to welcome?
       No longer stands → EXIT closed
       Already welcomed → [record no-action] → EXIT no-action
       Welcome due → [May it go out?] (gate, absorbed)
  → Welcome: what the membership grants from today, where it lives, how it is used [email+in-app]
  → Wait (until loyalty_benefit_used | loyalty_membership_ended)   (collapsed into c.used)
  → Has the membership been used yet?
       Already in use → EXIT settled
       Not yet → [gate] → Orientation: one thing it grants + the route to use it
                          [email + in-app + push] → EXIT oriented
```

**Problems found.**
1. **It is structurally identical to SUB-297.** 13 canonical nodes, 10 display nodes, the same
   `trigger → 3-branch state condition → gate → message → wait → 2-branch condition → gate →
   message → exit` skeleton, the same four exit classes, the same `channelStrategy` roles, the
   same `fallback: next-eligible-role`, the same required persistent holdout. Two of the four
   loyalty journeys are currently copies of each other. **This is the finding the brief warned
   about and it is real.** It is resolved on SUB-297's side, below — SUB-296's shape is the one
   that is *correct* for its moment.
2. Push on `a.orient` (F2). The orientation names *what the membership grants and the route to
   use it* — it needs somewhere to be reopened.
3. `a.record-no-action` and `x.no-action` **are drawn** here, unlike in SCH-303/SCH-304 where they
   are absorbed, because `c.state`'s "Already welcomed" branch reaches `a.record-no-action`
   directly and Family C requires every parent to have collapsed. So the canvas carries a bare
   Internal card. Fixable in the display layer (below).

**Final orchestration — single lifecycle confirmation, then one event-or-timeout orientation.**
The first touch is a *response to something the member just did* and is unconditional on the
membership standing. The second exists only because *"members use what they hold without being
told"* — the wait resolves on `loyalty_benefit_used` (→ nothing more to say, `x.settled`) or
times out (→ orient). The timeout arm is the touch; the event arm is the exit. That is a clean
event-or-timeout, and it is **not** the shape SUB-297 should have.

**Final customer channels.**
- `a.welcome` — **email + in-app.** Correct as authored. No push: this message carries the
  grant list.
- `a.orient` — **in-app** (the membership is visible there and can be used without leaving)
  **+ email**. **Drop push.**

**Customer touch count.** 1–2. Correct; cap 2 with `appliesTo: "all"` is right.

**Final flow.** Shape unchanged.

**State re-checks.** `c.used` re-reads the membership's own usage record immediately before the
orientation (`s.used`); `a.orient` re-reads the record again at send time (`s.grant`). Good.

**Stop conditions.** Enrolment reversed / membership cancelled / permission withdrawn →
`x.closed`. Benefit already used → `x.settled`, no orientation. Already welcomed → no-action
(runs once per membership, **ever**). `s.sunset` stops it. SUB-298 or SUB-299 holding the
membership → deferred and re-evaluated, not queued (`s.contest`).

**Ownership / handoff.** Third in `membership-standing`, `onLoss: suppressed`. Do not reopen.
Boundaries against RET-290 (first purchase) and ACT-12 (onboarding) are stated reciprocally and
as suppressions (`s.purchase`, `s.onboarding`) — this is the right shape for journeys on
*different entities*, and batch B's reasoning for not making them an exclusion group is correct.
No handoffs.

**Canonical changes needed.** `a.orient`: drop `low-friction`; order `in-session` ahead of
`persistent`.

**Display-only changes needed.** Absorb `a.record-no-action` even where a real branch reaches it,
by treating the *bookkeeping node plus its exit* as one absorbed unit when every non-collapsed
parent edge is itself a no-action branch. Narrower alternative: draw the "Already welcomed" arm
straight into `x.no-action`. Either removes a bare Internal card from SUB-296, SUB-297 and
SUB-298 at once.

**Renderer changes needed.** F1-R, F2-R.

---

## SUB-297 · Loyalty Program Nurture
*(`loyalty-nurture` · 13 canonical / 10 display · membership-standing #4 — lowest)*

**Purpose.** Tell a member what their membership is currently holding for them that they have
not used, in a bounded way that ends rather than a cadence that continues.

**Current flow.**
```
Loyalty membership holds unused value
  → Is there still something real to say?
       Membership no longer stands → EXIT closed
       Nothing left to say → [record no-action] → EXIT no-action
       Still unused → [gate, absorbed]
  → Explanation: what is held, what it may be used for, until when [email + in-app + push]
  → Wait (until loyalty_benefit_used | loyalty_membership_ended | permission_withdrawn)
  → Has the member used it?
       Used → EXIT used
       Still unused → [gate] → Reminder: "the same unused thing once more, adding nothing the
                                explanation did not already have" [email + in-app + push]
                               → EXIT nurtured
```

**Problems found — this is the journey this audit changes most.**
1. **It is a copy of SUB-296** (see that section). Same skeleton, same node count, same display
   count, same channel plan on both touches, same holdout.
2. **Its second touch adds nothing, by its own admission.** `a.remind`'s canonical text is
   *"Say the same unused thing once more, adding nothing the explanation did not already have."*
   Under the brief — *repeated communication normally needs a state re-check, and a fourth-or-
   later touch needs a documented business reason* — a second touch that is defined as carrying
   no new information is the exact thing to cut, and cutting it is also what breaks the
   convergence with SUB-296.
3. Both touches carry identical three-channel plans (F2), including push on the message that
   states *"what it may be used for and until when"* — a list, on the channel least able to
   carry one.
4. `contact.defaultPriority: "promotional"` and `pressureClass: "promotional"`, but its
   `eligibility` gates on *"purpose-level permission for **lifecycle** communication"*. The class
   mismatch is inside the journey itself and is already recorded in
   `audit/new-journey-collision-review.md` §3.2 as the CON-300 × SUB-297 `1S` finding. It should
   be resolved to `promotional` on both, which is what `s.sunset` and the pressure class imply.

**Final orchestration — single explanation, with one expiry-anchored reminder only where the
held subject actually expires.**

The second touch stops being *"the same thing again after a while"* and becomes *"this expires
on DATE"* — a different message, sent because a fact changed, timed against the subject's own
expiry rather than against the first message. Where the held subject has **no** expiry, there is
nothing new to say and the journey is one touch and closes.

**The signal already exists in the data and is not invented.** `c.valid`'s third branch reads
*"the subject has been used, **has expired**, or is no longer usable by this member"*, and
`a.explain` already states *"what it may be used for **and until when**"*. The subject's expiry
is read and stated today; the journey just does not branch on whether there is one.

This gives the loyalty cluster four genuinely different second-touch rules:
**SUB-298** has no second touch · **SUB-299** has none either · **SUB-296**'s is gated on
*non-use after a window* · **SUB-297**'s is gated on *the subject having an expiry* and timed to
it.

**Final customer channels.**
- `a.explain` — **email** (carries what is held, what it may be used for, until when)
  **+ in-app** where the member is in a session and can use it without leaving. **Drop push.**
- `a.remind` — **push** where a current device registration and its permission stand: the
  message is now short and one step (*"X expires on DATE"*), which is what the `low-friction`
  role's own `when` clause asks for. **Email otherwise.** Note that this **inverts** SUB-296:
  here the *short* message is the push one. That inversion is the point — the channel follows the
  message, not the journey.

**Customer touch count.** 1–2, and 1 wherever the subject does not expire.

**Final flow.**
```
Loyalty membership holds unused value
  → Is there still something real to say?
       Membership no longer stands → EXIT closed
       Nothing left to say → EXIT no-action
       Still unused → Explanation: what is held, what it may be used for, until when
                      [email + in-app]
  → Does this subject have an expiry the member can still act before?
       No expiry → EXIT explained        (new terminal: one touch, plan complete)
       Expires   → Wait (until the subject's own expiry approach point; resolving on
                         loyalty_benefit_used | loyalty_membership_ended
                         | permission_withdrawn)
            → Has the member used it?
                 Used → EXIT used
                 Still unused → Expiry notice: "this expires on DATE" [push | email]
                                → EXIT nurtured
```

**State re-checks.** `c.acted` before the second touch (unchanged, and now also re-reads the
expiry). `s.record` requires every claim re-read at send time. Keep both.

**Stop conditions.** Subject used, expired, or no longer usable → instance closes; a *different*
unused subject opens its own instance after the cooldown (`s.bounded` — the cooldown is what stops
a membership with several unused things becoming a standing campaign; keep it exactly as
written). Membership ended or permission withdrawn → `x.closed`. `s.sunset` stops it. Any higher
`membership-standing` member holding the membership → suppressed (`s.contest`, `s.transactional`).

**Ownership / handoff.** Lowest in `membership-standing`, `onLoss: suppressed`. Do not reopen.
`distinctFrom` RET-293 / RET-294 (things to *buy* vs one thing already *held*) is stated
reciprocally and must be preserved — with the expiry-anchored reminder it becomes more important,
not less, because "this expires soon" is the sentence most likely to drift into an offer.

**Canonical changes needed.**
- Add condition `c.expires` after `a.explain`, two branches, reading the subject's own expiry
  from the membership record.
- Add exit `x.explained` (class `success`, reEntry: *"a different unused subject opens its own
  instance once the cooldown has run"*).
- Rewrite `a.remind` → `a.expiry-notice`: content is the expiry, not a repetition.
- Re-anchor the wait: `relativeTo: "attribute"`, `attribute: "subject_expires_at"`, replacing the
  current unanchored `required: true` duration.
- Channel plans per above.
- Resolve the `lifecycle` / `promotional` mismatch in `eligibility` (see problem 4).
- `loyalty_nurture.touches` rule text: *"one explanation, and one expiry notice only where the
  subject expires"*.

**Display-only changes needed.** Same `a.record-no-action` absorption as SUB-296.

**Renderer changes needed.** F1-R, F2-R.

---

## SUB-298 · Reward Confirmation
*(`reward-confirmation` · 7 canonical / 6 display · membership-standing #1 — highest)*

**Purpose.** Confirm a state the membership actually reached — a reward earned, credited and
usable — as the record states it, and confirm nothing the record does not.

**Current flow.**
```
Loyalty reward earned
  → Is this reward a state the membership has actually reached, and still ours to confirm?
       Not a reached state → EXIT closed
       Nothing to send → [record no-action] → EXIT no-action
       Confirm → Confirmation: what was earned, what it may be used for, until when
                 [email + in-app + push] → EXIT confirmed
```

**Problems found.**
1. Push on `a.confirm`. The `low-friction` role's own `when` clause is *"the confirmation is
   short enough to carry the whole state"* — and the guardrail is *"The confirmation states the
   reward record's own terms."* Those two contradict. Terms are not short.
2. `a.record-no-action` is absorbed but `x.no-action` is drawn, leaving a 6-node canvas with an
   exit whose parent is invisible.
3. Nothing else. 7 canonical nodes for a one-touch transactional confirmation is the right size.

**Final orchestration — single transactional confirmation. No orchestration at all, and that is
the design.**
`Trigger → one three-way state decision → one message → exit.` There is no wait, no second touch,
no comparison, no holdout, and `measurement` has no `businessOutcome` block — because a
confirmation is owed, not optimised. **Do not add orchestration to this journey.** It is
`defaultPriority: "transactional"`, `pressureClass: "none"`, `localCap.appliesTo:
"non-mandatory"` with its one touch `mandatory: true`, so it is never traded against a marketing
contact budget, and `onLoss: "superseded"` rather than `suppressed` — it loses only to a newer
authoritative state for the same reward. All four of those are deliberate and correct.

**Final customer channels.** **email** (the confirmation must be producible again later) **+
in-app** where the reward belongs beside the membership. **Drop push.**

**Customer touch count.** 1. Fixed. One confirmation per reward record, and a redelivered event
produces no second copy (`s.duplicate`).

**Final flow.** Unchanged.

**State re-checks.** `c.state` is the only one and the only one needed — it establishes credited
(not projected), membership active, no confirmation already recorded, deliverable destination.

**Stop conditions.** Reversed or corrected before sending → `x.closed`, and *the correction is
what gets stated, under its own instance* (`s.reversed`). Not yet credited → not confirmed
(`s.credited`). No deliverable destination → no-action, never forced onto another route
(`s.deliverable`).

**Ownership / handoff.** Highest in `membership-standing`. It yields to nothing in the group.
`distinctFrom` SUB-297 (a fact about the record vs a claim about behaviour), SUB-299 (one reward
vs the standing itself), REM-157 (nothing has gone wrong here). Its
`CON-300 × SUB-298` boundary is recorded as **R** in the collision review — a transactional
confirmation is not suppressed by a marketing sunset. Preserve.

**Canonical changes needed.** `a.confirm`: drop `low-friction`. Nothing else.

**Display-only changes needed.** Absorb `x.no-action` with its parent (shared fix with SUB-296).

**Renderer changes needed.** F1-R, F2-R.

---

## SUB-299 · Loyalty Tier Upgrade
*(`loyalty-tier-change` · 11 canonical / 9 display · membership-standing #2)*

**Purpose.** Tell a member that their membership's standing has moved **up**, and say exactly
what that standing now grants that it did not before — and nothing else.

**Current flow.**
```
Loyalty tier changed
  → Which way did the standing move, and is it in effect?
       Moved down → EXIT out-of-scope        (no message, no handoff — deliberate)
       No material movement → [record no-action] → EXIT no-action
       Moved up and in effect → [gate, absorbed]
  → Announcement: the standing now held, and what it grants that the previous one did not
    [email + in-app + push]
  → Wait (until loyalty_benefit_used | loyalty_membership_ended)   (collapsed into c.used)
  → Has the new standing been used?
       Used → EXIT adopted
       Not used → EXIT announced
```

**Problems found.**
1. Push on `a.announce`, same contradiction as SUB-298: the message is a difference list.
2. `w.use → c.used → x.adopted | x.announced` sends nothing on either arm. It is an observation
   window, and the two exits differ only in what was measured. See the uncertain calls below —
   I am **not** recommending it be removed.
3. Nothing else. The downgrade refusal and the absence of a holdout are both right.

**Final orchestration — single lifecycle announcement, with an in-graph refusal and a
measurement-only observation window.**
One touch. The distinguishing feature against SUB-298 is not the number of messages but the
**refusal branch** and the **observation window**: this journey states in the graph that it does
not own the message a downgrade needs, and it holds the instance open afterwards to find out
whether the announcement meant anything.

**Preserve the refusal exactly as it is.** `loyalty_tier_changed` fires for downward movements
too; `c.direction` reads the programme's *own* ordering; a downward movement exits at
`x.out-of-scope` (class `no-action`) with **no message and no handoff**. There is no handoff
because no journey owns that message and `validate:canonical` forbids a handoff to a
non-existent target — the refusal is honest rather than a routing stub. `x.out-of-scope`'s
`reEntry` says so in plain words. Do not add a target, do not add a message, do not convert the
branch into a suppression that hides it from the canvas.

**Preserve `comparison: "none"` and the absence of a holdout.** *Withholding the news of a
standing somebody has actually earned is not an acceptable control.* SUB-296 and SUB-297 both
carry required persistent holdouts and this one deliberately does not — that asymmetry is the
design, not an omission, and it should be visible in the detail panel rather than looking like
missing configuration. **Do not add orchestration or a comparison to this journey.**

**Final customer channels.** **email + in-app.** **Drop push.** Where a programme's standings
are a single named thing and a live app audience exists, push would be defensible as a short
nudge *alongside* the email — but nothing in the data evidences either condition per member, so
per the brief the simpler plan wins and the reason is recorded here.

**Customer touch count.** 1. Fixed. One announcement per change record; two upward movements
close together produce one announcement of the standing actually held.

**Final flow.** Unchanged.

**State re-checks.** `c.direction` also checks *"no newer tier change exists"* — the supersession
check is inside the direction condition, which is economical and correct.

**Stop conditions.** Downward or lateral movement → `x.out-of-scope`. Not yet in effect →
no-action (`s.effective`). Superseded by a newer change → instance closes, the newer one speaks
(`s.superseded`). Permission withdrawn or no deliverable destination → no-action, never forced
onto another route (`s.permission`). `s.sunset` stops it. SUB-298 holding the membership →
deferred (`s.contest`).

**Ownership / handoff.** Second in `membership-standing`, `onLoss: suppressed`. Do not reopen.
No handoffs.

**Canonical changes needed.** `a.announce`: drop `low-friction`. Nothing else.

**Display-only changes needed.** None (but see uncertain call #3).

**Renderer changes needed.** F1-R, F2-R.

---

## Cross-cutting changes, stated once

### F1-R — label channel rows by role, not by position *(renderer, generic)*
`ChannelPriorityRow` should render each row's own role name from `channelPlan[i].role`
(`urgent` · `persistent` · `in-session` · `low-friction`), and use the words **Primary /
Fallback** only where the journey declares `channelStrategy.fallback === "next-eligible-role"`.
Where it declares `same-role-other-channel`, the rows are complementary routes and the label
belongs to the role, not to the ordinal. Needs `channelStrategy.fallback` plumbed onto the node
or passed as a journey-level prop; `channelPlan` already carries `role`. New role words go into
`CARD_TEXT` in both languages in the same commit (glossary rule 3) and into `audit/glossary.md`
second. Affects 8 of these 12 directly and most of the corpus.

### F2-R — trigger cards should read as names *(renderer, generic)*
Every trigger in this domain renders as `Trigger` + a humanized event id + a `SignalSource` pill:
*"Trigger / Confirmed booking with customer owed prerequisites / Authoritative."* The brief asks
for `Checkout Started`. Add a display-name table keyed by event id, in the same shape as
`TOUCH_STAGE_TR`, falling back to the humanized id — e.g. `reservation_request_recorded` →
*Booking Requested*, `loyalty_reward_earned` → *Reward Earned*, `arrival_window_opened` →
*Arrival Window Opens*. Keep the `SignalSource` pill; it carries real information and is a closed
4-value enum.

### F3-D — say why an archived handoff is not a link *(display, Family D's open item)*
**11 of the 12 handoff targets in this domain are archived Operational Workflows journeys**
(SCH-173, SCH-174, SCH-177, SCH-180, DEC-181, OWN-55, SUB-164, SUB-168, SUB-170). Only
SCH-303's FIN-134 is public. SCH-266 and SUB-163 end **only** in such handoffs, so their canvases
finish on cards that name a journey and go nowhere with no explanation. Add the affordance
`audit/patterns.md` already lists as the remaining Family D work.

### F4 — suppression naming
SCH-277, SCH-282 and SUB-262 express their stop conditions as `s.g1`…`s.g5` — their `guardrails`
array restated verbatim. SCH-266, SCH-280, SCH-303, SCH-304, SUB-163 and all four SUB-29x
journeys use named suppressions that state a rule *and its reason*. The `s.gN` form gives the
detail panel nothing the guardrail list did not already say. Rename them; the fix is mechanical
and the batch D / batch B journeys are the model.

---

## Summary table

| ID | before pattern | after pattern | channels | touches | biggest change |
|---|---|---|---|---|---|
| **SCH-266** Appointment Reminder | prompt → revalidate → 2-way branch, all touches multi-channel | **state-gated single reminder with conditional escalation** | prompt email+in-app · at-risk **SMS**/email · remind **SMS same-day**/email | 2 | reminder loses in-app; its SMS becomes conditional on the appointment being today |
| **SCH-277** Booking Confirmation | 5 messages, **one** `email+sms` plan for all | **conditional routing on an authoritative outcome** + event-or-timeout on the re-offer branch only | ack email · confirm email(+SMS if same-day) · **re-offer email+SMS** · decline/lapse email | 2 | SMS off the acknowledgement (it contradicts the journey's own first guardrail); re-read before the lapse notice |
| **SCH-280** No-Show Follow-Up | single conditional message + window; SMS on the offer | **single conditional message, then event-or-timeout** | acknowledge email · **offer email** (SMS only if the rebooking route closes inside 48h) | 1 | SMS removed as the domain's weakest case — the moment has passed |
| **SCH-282** Availability Search Abandonment | delay → re-evaluate → 3-way offer | **unchanged** — bounded delay, re-evaluate from scratch, single offer | email + push | 1 | almost none; reword the attribution gate, split the shared lapse exit, cap 2→1. **The specific-beats-general precedent to mirror** |
| **SCH-303** Reservation Payment Reminder | two-window escalation, 3 multi-channel touches | **escalating two-window event-or-timeout with a hard ownership exit** | remind email+in-app · final **SMS if release inside hours**/email+in-app · release **email** | 3 (1 discretionary) | SMS off the release notice — the one change that would have made it read as collections |
| **SCH-304** Pre-Arrival Preparation | 3 conditional touches, two of them 3-channel | **budgeted conditional touches** (0–3, each gated on having something to say) | details email+in-app · check-in **in-app**+email · late detail **SMS**/email | 0–3 | SMS off the check-in prompt, in-app off the late detail; the countdown guardrail kept verbatim |
| **SUB-163** Renewal Reminder | model-routed; decision request on email+in-app+**sms+push** | **conditional routing on the renewal model** + event-or-timeout on one branch | notice email+in-app · request **email+in-app** | 0–2 | `["sms","push"]` bundled in one role removed; dedup between the notice and the request |
| **SUB-262** Cancellation Confirmation | sequential 2 touches with a withdrawal re-check | **unchanged** — sequential, two touches, mandatory re-check between | email + in-app (both touches, and correctly so) | 1–2 | **none** — the correct finding is to leave it alone; rename `s.gN` only |
| **SUB-296** Loyalty Welcome | *copy of SUB-297* | **single confirmation, then event-or-timeout orientation** (timeout arm is the touch) | welcome email+in-app · orient **in-app+email** | 1–2 | push off the orientation; keeps its shape while SUB-297 changes |
| **SUB-297** Loyalty Nurture | *copy of SUB-296*; second touch admits it adds nothing | **single explanation + one expiry-anchored reminder, only where the subject expires** | explain **email+in-app** · expiry notice **push**/email | 1–2 (often 1) | the whole journey: new `c.expires` branch, new `x.explained`, wait re-anchored to the subject's expiry, push moved onto the short message. **This is what breaks the 296/297 convergence** |
| **SUB-298** Reward Confirmation | single transactional confirmation, 3 channels | **unchanged** — single transactional confirmation, no orchestration | **email + in-app** | 1 | push dropped (it contradicts the journey's own "states the record's terms" guardrail); nothing else touched |
| **SUB-299** Loyalty Tier Upgrade | single announcement + observation window, 3 channels | **unchanged** — single announcement, in-graph refusal, observation window | **email + in-app** | 1 | push dropped; refusal, `comparison: "none"` and the absent holdout all preserved deliberately |

**Pattern distribution — 10 distinct shapes across 12 journeys.**
state-gated single reminder w/ conditional escalation (1) · conditional routing on an
authoritative outcome (1) · single conditional message then event-or-timeout (1) · bounded delay
then single offer (1) · escalating two-window event-or-timeout w/ ownership exit (1) · budgeted
conditional touches (1) · conditional routing on a governing model (1) · sequential two-touch
w/ state re-check (1) · single confirmation then event-or-timeout (1) · single explanation +
attribute-conditioned second touch (1) · single transactional confirmation (2 — SUB-298 and
SUB-299, separated by SUB-299's refusal branch and observation window).

**Touch distribution:** 1 touch × 5 · 1–2 × 4 · 2 × 1 · 3 × 1 · 0–3 × 1. Nothing exceeds 3, and
the only 3 is SCH-303, where two of the three are `mandatory: true` and owed to the holder.

**Channel distribution after:** email on all 12 · in-app on 9 · SMS on 5 (SCH-266, SCH-277,
SCH-280 conditionally, SCH-303, SCH-304) · push on 2 (SCH-282, SUB-297). SMS drops from 12 of 21
customer-facing actions to 5, every one conditional on an attribute the journey already reads.

---

## The three calls I am least sure about

**1. Removing SMS and push from SUB-163's renewal decision request.**
I read SUB-163 as a governed-terms journey — notice periods, decision holders, review
escalations to OWN-55, handoff to SUB-164 for execution — and on that reading the deadline is
days or weeks away and the decision holder is often not the person whose phone number is on
file. But `relationship_id` covers consumer subscriptions too, and a consumer subscription
auto-renewing tomorrow at a higher price is a genuine urgent-horizon case. The conservative
alternative is to keep `urgent` but split `["sms","push"]` into two roles and gate it on
`term_end_at` being inside 72 hours. I chose removal because the journey itself has no attribute
distinguishing the two populations, and the brief says to prefer the simpler pattern and say so
rather than invent the signal.

**2. SUB-297's expiry-anchored second touch.**
This is the largest change in the audit and it is a product decision dressed as a refactor. It
breaks the SUB-296/SUB-297 convergence honestly — the second touch becomes a different message
rather than a repetition — and the expiry attribute is genuinely already read (`c.valid`'s third
branch, `a.explain`'s *"until when"*). But if most programmes' held benefits carry no expiry,
SUB-297 becomes a one-touch journey almost always, and someone will read that as the nurture
having been gutted. I think one touch is the correct answer in that case and the branch makes it
explicit rather than silent — but it is worth an explicit product sign-off rather than being
slipped in with the channel changes. The alternative that does *not* need sign-off is to cut
`a.remind` outright and leave SUB-297 at one touch, which breaks the convergence just as well
and changes less.

**3. Whether SUB-299's `w.use → c.used → x.adopted | x.announced` should stay on the canvas.**
Nothing is sent on either arm, so under the brief's canvas rule — expose a condition only where
it materially changes the *customer's* path — it is measurement and could be absorbed, which
would also make SUB-299 visibly leaner than SUB-296/297 and reinforce the cluster's divergence.
I did **not** recommend it, for two reasons. The same `wait → did they use it?` shape appears in
SUB-296 where it *does* change the path (orientation or not), so a generic rule would have to
distinguish them by "does a message follow", which is exactly the kind of structural predicate
that erased business logic in five journeys in Family C's first attempt. And `x.adopted` vs
`x.announced` is the journey's only measure of an announcement it is forbidden from A/B testing
(`comparison: "none"`) — hiding it would leave the canvas implying the announcement is never
evaluated at all. I have left it drawn and flagged it rather than deciding it.
