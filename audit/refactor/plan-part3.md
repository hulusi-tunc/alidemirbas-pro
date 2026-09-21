# Phase 1b plan — part 3

`TIM-61` `TIM-63` `TIM-268` `TIM-274` `TIM-281` · `ACC-261` `ACC-263` `IDN-84` `IDN-271`
`FIN-134` `FIN-302` · `DOC-214` `DOC-215` `INC-254` `REL-284` `RLT-279` `RSK-273`

Consolidated from `feedback-time.md` (TIM sections only), `access-finance.md` and
`system-events.md` for business flow, waits, touch counts, state re-checks and canonical edits;
from `orchestration-matrix.md` for every orchestration pattern and every final channel; from
`ownership.md` for ownership, precedence, handoffs and `distinctFrom`; from `canvas.md` for every
display and renderer change. **What I arbitrated:** the channel column was the whole of the
disagreement — J is markedly more austere than the three domain audits, and I applied J
everywhere, which drops WhatsApp and push from TIM-61 entirely, drops push from FIN-134's
reminder, drops in-app from ACC-261, REL-284, FIN-302 and FIN-134's two prompts, turns TIM-63's
four-channel prompt and TIM-268's two-channel reminder into email, turns TIM-274's last call and
FIN-134's reminder into genuine parallel sends, and makes ACC-263's `a.brief`, RLT-279's
`a.inform-hold` and RSK-273's `a.at-the-wall` in-app-only. On ownership I applied I over the TIM
domain audit's proposal to enrol six journeys in the `obligation-reminder` exclusion group: I
rules that out under GLB-01/GLB-03 and prescribes a reciprocal `s.generic-reminder` suppression
plus a `distinctFrom` row instead, which is what TIM-63, ACC-263, DOC-215, REL-284 and RLT-279
carry below. On the canvas I applied K's G9 rule over the INC-254 domain section's claim that all
its drawn decisions are business logic — `c.cohort` and `c.verified` each draw one edge and are
absorbed. **One section is marked `CONFLICT — ESCALATED`: INC-254**, where J's "single, delegated,
email" and the domain audit's "parallel, email and in-app" are answers to the same question and
the domain audit holds evidence J does not cite. Everything else in the three domain audits'
canonical columns is carried through unchanged, including the five refusals to add work: DOC-214
stays one touch, DOC-215 stays email, INC-254 gains no wait, RSK-273 gains no second parallel
pair, and `none` appears in the last three fields wherever it is the truth.

---

## TIM-61 — Deadline Tracking

**Purpose:** Let a governing deadline control the *state* of one obligation rather than schedule
messages around a date: hold the deadline, its policy thresholds and what would satisfy it, and
send at most one reminder per threshold the policy actually defines.

**Current flow:**
```
authoritative_deadline_assigned
 → [store the deadline, its timezone, its owner, what counts as completion]   (absorbed)
 → Wait until obligation_satisfied | pre_deadline_threshold_reached
       (timeout: the deadline itself — attribute-bound, required)
     event → Which happened?
                Completed  → [mark satisfied, invalidate every queued reminder] (absorbed)
                             → Exit: satisfied before its deadline
                Threshold  → Is a reminder useful here, and does policy define one?
                                No  → back to the wait
                                Yes → Reminder  [email · push · sms · whatsapp]  → back to the wait
     timeout → The deadline passed with the obligation open — what does the rule say?
                OVERDUE → Handoff TIM-62 · ESCALATED → Handoff OWN-55 · EXPIRED → Handoff TIM-64
                FAILED → Exit: failed at its deadline · STILL_VALID → Exit: deadline passed, unchanged
```

**Problems found:**
- Four channels on one message card with no node anywhere that picks between them — the corpus's
  worst single case (J, matrix row; K §1 inventory).
- SMS and WhatsApp carry an identical `when`; nothing in this journey tests WhatsApp eligibility,
  so asserting it is the "high value ⇒ WhatsApp" rule the brief forbids (J).
- Push is asserted with no push audience established anywhere — an obligation holder may not be a
  product user at all (J).
- The loop has no visible bound: a reader sees `Reminder → Wait → Reminder` and cannot tell whether
  that is two messages or ten (D).
- Three of the five endings hand off to non-public journeys and render as grey text with no stated
  reason (D; K Family D open item).
- `STILL_VALID` reaches the canvas as a raw SCREAMING_SNAKE token on the `c.consequence → x.still-valid`
  edge (K P1-6).

**Final orchestration:** **event-or-timeout (looping)**, with a visible **conditional routing**
branch on *which threshold fired*. Event-or-timeout because one wait, bounded by a real attribute
(`due_at`), listens for both "it is done" and "a threshold arrived" and its timeout arm reaches
five genuinely different endings — this is the reference instance of the shape in the corpus and
nothing about it changes. Conditional routing inside it because the signal that changes the
channel already exists on the waking event: `pre_deadline_threshold_reached` carries which
threshold it is, and an early threshold is information while the last one before the deadline is a
deadline with a consequence `c.consequence` will actually enforce.

**Final customer channels:** `email` at every threshold except the last; `sms` at the final
pre-deadline threshold, where SMS permission is recorded. **WhatsApp and push are dropped.**

**Customer touch count:** **1 per policy-defined threshold.** The corpus is right that it cannot
state a number — the thresholds belong to the customer's governing policy — and
`deadline_tracking.touches` must stay `required: true` with no invented default.

**Final flow:**
```
Authoritative deadline assigned
 → [store the deadline and what would satisfy it]
 → Wait until obligation_satisfied | pre_deadline_threshold_reached   (bounded by the deadline)
     event → Which happened?
               Completed → Invalidate every queued reminder → Exit: satisfied before its deadline
               Threshold → Does policy define a reminder here, and can they still act on it?
                              No  → back to the wait
                              Yes ↓
                          → Which threshold fired?
                               The final pre-deadline threshold, SMS permission recorded
                                                              → Reminder (SMS)
                               Any earlier threshold          → Reminder (Email)
                          → back to the wait   [bounded by deadline_tracking.touches — policy]
     timeout → What does the governing rule say?
                OVERDUE / ESCALATED / EXPIRED / FAILED / STILL_VALID
```

**State re-checks:** The wait is the re-check. `obligation_satisfied` routes to `a.satisfied`,
which invalidates every queued reminder through its `suppressed_sends` write — the best
stop-condition implementation in the TIM cluster and the one TIM-274 is told to copy.

**Stop conditions:** `obligation_satisfied` at any point, taking every queued reminder and
escalation with it. The deadline itself, absolutely.

**Ownership / handoff:** Holds `obligation_reminder` **above** TIM-268 — a governing deadline
outranks a bare due date — stated from both sides, in both precedences, in TIM-61 `s.g5` and
TIM-268 `s.g7`, and in reciprocal `distinctFrom`. I records this pair as resolved five-fold; do
not reopen. Three handoffs out (TIM-62 OVERDUE, OWN-55 ESCALATED, TIM-64 EXPIRED), all non-public.
This journey must not speak about what happens *after* the deadline: the consequence belongs to
whichever of the three the rule names.

**Canonical changes needed:**
1. `src/canonical/time.ts` — split `a.remind` on the threshold. Add a condition after `c.useful`:
   *"Which threshold fired?"*, with `a.remind-final` (`channelRoles: ["urgent"]` → sms, `when`
   keeping the existing recorded-permission clause) and `a.remind` (`channelRoles: ["persistent"]`
   → email). Both edges return to `w.tracking`.
2. Remove `whatsapp` from `channelStrategy.roles[urgent]` for this journey, and remove
   `low-friction` from every touch's `channelRoles`. Nothing in the graph reads a WhatsApp
   eligibility or a push token.
3. Reverse the absorption of `a.satisfied` by declaring what it produces
   (`writes: [{ field: "suppressed_sends", mode: "set" }]` as the journey's declared suppression,
   not as a journal row) — invalidating every queued reminder is a visible consequence.
   `a.store` stays absorbed and is correct.
4. Keep `deadline_tracking.touches` `required: true` with no default.

**Display-only changes needed:** The loop edge back to `w.tracking` carries the cap key
`deadline_tracking.touches`, so a bounded loop does not read as an unbounded one. The
`c.consequence → x.still-valid` edge label renders the humanised outcome, not `STILL_VALID`.

**Renderer changes needed:** K §4.1 — a single-role plan renders its channel pill with no rank
label, and a multi-group plan never prints "Fallback" where `channelStrategy.fallback` is
`same-role-other-channel`. K's H1 widening (bare SCREAMING_SNAKE tokens, run over
`data-canvas-edge-label` as well as card bodies). A handoff card whose destination is not a public
route states why it is not a link (K Family D, P-HANDOFF-02).

---

## TIM-63 — Expiry Reminder

**Purpose:** Use the window before an expiry only where acting inside it could actually change the
outcome — and where it cannot, either say plainly what will happen or say nothing at all.

**Current flow:**
```
pre_expiry_window_entered
 → [re-read the entity's current state]  (absorbed)
 → Has it already been renewed, replaced or completed?   Already → Exit: nothing is expiring
 → Is an action available that would materially change the outcome?
      Yes → [establish who must act and what the action is] (absorbed)
             → Action prompt  [email · in-app · sms · push]
      No  → Is telling anyone useful even so?
                Worth saying → Informational notice  [EMAIL ONLY]
                Not worth it → Exit: nothing to do, nothing worth saying
 → Wait until renewed | completion_recorded | replaced   (timeout: expires_at)
      event   → [invalidate the old validity's queued actions] (absorbed)
                 → Handoff: external renewal-lifecycle
      timeout → Handoff: TIM-64 Expiry Validation
```

**Problems found:**
- The journey's best idea is invisible: `a.prompt-action` declares four channels and `a.inform`
  declares one *deliberately* (*"a prompt to act where acting is impossible is worse than
  silence"*), and on the canvas both are just "Message" cards (D).
- The four channels on the prompt are unresolved — no node reads a signal that picks between them,
  and the journey caps at one message, so there is no escalation for a second channel to be part of
  (J).
- No success exit: both endings are handoffs and the only exits are suppressions, so a reader sees
  a journey that never finishes (D).
- `a.actor` — the step that establishes *who is responsible for acting*, which may be an
  administrator or a third party with no product session at all — is absorbed although it is the
  fact that decides the whole message (D).
- TIM-63 is one of the eight public journeys TIM-268 defers to that say nothing back (I, P1-4).
- `w.resolution` renders `expires_at` as a raw attribute identifier (K P1-6).

**Final orchestration:** **conditional routing.** The decision the journey exists to make is *is
there an action, and if not is it worth saying anything* — three genuinely different outcomes from
one read. The single send and the event-or-timeout tail are subordinate: the message goes out
*before* the wait, and the wait carries no touch at all, existing only to decide which ending. That
unusual shape is correct — entering the window **is** the timing decision — and must not be
normalised into "wait then send".

**Final customer channels:** Prompt: **`email`**. Notice: **`email`**. Nothing else. `a.actor` may
establish a responsible party with no product session, which is exactly why in-app cannot be
asserted; and SMS would be justified only for an imminent one-tap action, which this journey never
establishes.

**Customer touch count:** **1** — a prompt to act *or* an informational notice, never both.

**Final flow:**
```
Pre-expiry window entered
 → Re-read: has it already been renewed, replaced or completed?
      Already resolved → Exit: nothing is expiring
 → Is an action available that would materially change the outcome?
      Yes → Who is responsible, and what is the action?
             → Prompt to act (Email): the action, the route to it, and the date
      No  → Is telling anyone useful even though nothing can be done?
             Worth saying → Informational notice (Email): what will happen, no call to action
             Not worth it → Exit: nothing to do, nothing worth saying
 → Wait until renewed | completion_recorded | replaced   (bounded by expires_at)
      event   → Invalidate the old validity's queued actions → Handoff: renewal lifecycle
      timeout → Handoff: TIM-64 Expiry Validation
```

**State re-checks:** `a.reread` + `c.already` at entry, and they are necessary — the window opened
on a schedule and the state may have moved since. `a.invalidate` on the success arm stops a renewal
granted today being undone by an expiry scheduled yesterday. One touch, so nothing further.

**Stop conditions:** `renewed`, `completion_recorded`, `replaced`; an entity already resolved when
the window is re-read; SUB-163 holding the renewal cycle.

**Ownership / handoff:** Below SUB-163 in `relationship-continuity` wherever the expiring entity is
a relationship with renewal terms (settled from both sides — do not reopen); owns every expiring
entity with no renewal cycle outright. Above TIM-268 by TIM-268's own declaration, currently
unreciprocated. Both endings are handoffs — this journey must not state what the renewal lifecycle
or TIM-64 will decide; it states only that the window opened and what could be done inside it.

**Canonical changes needed:**
1. `src/canonical/time.ts` — `a.prompt-action.channelRoles` → `["persistent"]`; drop `in-session`,
   `urgent` and `low-friction`. `a.inform` already correct.
2. `a.actor` declares the state it produces (`writes: [{ field: "responsible_actor", mode: "set" }]`)
   so the step that establishes who must act keeps its card. `a.reread` and `a.invalidate` stay
   absorbed — the question card and the handoff carry them.
3. **Reciprocity with TIM-268, per I's P1-4 mechanism** (not by joining `obligation-reminder` —
   TIM-63's `competition` block is spent on `relationship-continuity`, and I rules the group route
   out for all eight regardless):
   - `suppressions +=` `CANONICAL_RULE` id `s.generic-reminder`: *"This journey owns the reminder
     for the expiring entity it holds. The generic outstanding-obligation reminder (TIM-268) is
     suppressed for that entity while this instance holds it: one obligation is reminded of once,
     by whoever owns its type, and a generic reminder arriving after the specific one is not a
     later touch but a second sender."*
   - `distinctFrom +=` a row naming TIM-268, mirroring the row TIM-268 already carries, and
     recording that the reciprocity is `distinctFrom`-and-suppression only because a journey
     declares exactly one `competition` block.

**Display-only changes needed:** Both terminal handoff cards state "ends by handing off to …", so
a journey with no success exit does not read as a journey that never finishes (decision C2's
treatment). The `w.resolution` wait card shows its events and its bound in prose, not `expires_at`.

**Renderer changes needed:** K §4.1 (one role → no rank label). K's H1 widening for bare
snake_case identifiers on wait capsules and edge labels.

---

## TIM-268 — Action Required Reminder

**Purpose:** Remind somebody of what they owe while there is still time to do it, **from the state
the obligation is in at the moment of sending** — and only where no journey scoped to the
obligation's own type already owns that reminder.

**Current flow:**
```
customer_owed_obligation_outstanding
 → Is there a gap before the deadline worth waiting through?
      Due now or past → ↓
      Time remains    → Wait until obligation_no_longer_owed | obligation_changed_still_owed
                          (timeout: the reminder point — required)   BOTH ARMS → ↓
 → [Re-read the obligation from authoritative current state immediately before sending]
 → Is anything still owed at the moment of sending?
      Nothing outstanding → Exit: no longer owed; nothing was sent
      Still outstanding ↓
 → Reminder  [email · sms]
 → Wait until obligation_satisfied | obligation_no_longer_owed | deadline_passed_unmet
      (timeout: due_at — required)
      event   → How did it resolve?
                  Satisfied → Confirmation [email · sms] → Exit: satisfied and confirmed
                  Cancelled/adjusted away → Exit: moot
                  Still owed at the deadline → ↓
      timeout → Overdue notice [email · sms]
                → Does a defined consequence own this now?
                     Yes → Handoff: external consequence-owner
                     No  → Exit: lapsed unmet
```

**Problems found:**
- **`w.due` is not an event-or-timeout wait.** Both arms converge on `a.recheck`; the `until[]`
  events only wake it early and nothing about the route depends on which fired. It is a **timed
  wait with an early wake followed by a state re-read** — a good design that is being mis-named.
  *(Already arbitrated; applied.)*
- `deadline_passed_unmet` in `w.deadline.until` **is** the timeout at `due_at` by a second route,
  and both reach `a.overdue`; keeping it makes `c.settled`'s third branch reachable only
  redundantly (D).
- All three touches carry `["persistent","urgent"]`. A confirmation that an obligation is
  discharged is never urgent, and the overdue notice is sent *before* `c.escalate` establishes
  whether a consequence exists at all. The clearest case of SMS-as-generic-escalation in the TIM
  cluster (D), and J removes SMS from the reminder too: this is the lowest-precedence *generic*
  obligation reminder, addressed to somebody whose obligation type we do not know.
- `localCap` is 3, basis "the plan's own length"; the longest path is 2 — `c.settled` cannot reach
  both `a.confirm` and `a.overdue`, and `x.moot` sends nothing (D).
- **The generic-fallback rule is complete on TIM-268's side and has no counterparty.** Eligibility
  clause 3 names nine type-scoped owners; `s.g6`/`s.g7` state the rule; `distinctFrom` names ten
  journeys — and only TIM-61 is in its exclusion group (I, P1-4).
- **TIM-268 and FIN-134 share `obligation_id` and neither names the other** (I, P1-6). An unpaid
  amount past its due date with no attempt yet made is TIM-268's; the same obligation after a
  declined attempt is FIN-134's. The boundary is real, obvious and written nowhere.
- The trigger renders as "Customer owed obligation outstanding" (K P2-9).

**Final orchestration:** **event-or-timeout**, at `w.deadline` — the arms reach genuinely different
places (a confirmation, a moot exit, an overdue notice). Explicitly **not sequential**: the
reminder and the confirmation/overdue notice are two different facts about one obligation, and
`s.g3` forbids repetition. The `w.due` leg ahead of it is a timed wait with a state re-read, which
is its own shape and is named as such.

**Final customer channels:** `email` on all three touches. **No SMS anywhere.** By its own ownership
rule every obligation with a real type is owned by a journey that can justify a sharper channel
(TIM-61 for a governed deadline, SCH-303 for a reservation, FIN-134 for money); what is left here
is "you still owe X by Y, here is the one way to do it" to somebody whose obligation type is
unknown.

**Customer touch count:** **2** — the reminder, then the confirmation *or* the overdue notice.
`x.moot` is a zero-touch ending and stays one.

**Final flow:**
```
Customer owes a defined action, with a due date, that nothing more specific owns
 → Is there a gap before the reminder point worth waiting through?
      Due now or past → ↓
      Time remains    → Wait until the reminder point (waking early on any change to the obligation)
 → Re-read the obligation: what is owed NOW, what has been received, what the deadline is now
 → Is anything still owed?
      No  → Exit: no longer owed; nothing was sent
      Yes → Reminder (Email): what REMAINS outstanding, the deadline, the one way to discharge it
 → Wait until obligation_satisfied | obligation_no_longer_owed   (bounded by due_at)
      event   → Satisfied → Confirmation (Email) → Exit: satisfied and confirmed
                 Cancelled or adjusted away → Exit: moot
      timeout → Overdue notice (Email): what stands now, and what policy actually attaches
                → Does a defined consequence own this now?
                     Yes → Handoff: consequence owner (carries what remains, and every reminder sent)
                     No  → Exit: lapsed unmet
```

**State re-checks:** `a.recheck`, immediately before the send, every time — the journey's entire
thesis and the reason it is safe for it to be generic. It survives Family A on two in-edges and
must stay drawn. It is also the pattern TIM-274 is missing and is told to copy.

**Stop conditions:** `obligation_satisfied` and `obligation_no_longer_owed`, at both waits. Plus any
type-scoped journey taking ownership of the obligation, which is what the eligibility clause and
`s.g6`/`s.g7` enforce — and which, after the reciprocity fix, the other side finally enforces too.

**Ownership / handoff:** Lowest in `obligation-reminder`; `onLoss: suppressed` rather than queued,
because a reminder arriving after the specific one is not a later touch but a second sender. Hands
to `external:consequence-owner` carrying what remains outstanding **and which reminders were
sent** — the right thing to carry; do not trim it. This journey must not name the consequence
itself: `c.escalate` establishes only whether one is owned elsewhere.

**Canonical changes needed:**
1. `outstanding_obligation.touches` default **3 → 2**, rule: *"one reminder before the deadline and
   one notice after it; the two post-deadline notices are mutually exclusive."* Rewrite the
   `applicableWhen` to name the longest path, copying TIM-274's wording.
2. `t1 remind`, `t2 confirm`, `t3 overdue` → `channelRoles: ["persistent"]`. Remove `urgent` from
   all three.
3. Remove `deadline_passed_unmet` from `w.deadline.until`, and remove `c.settled`'s now-redundant
   "Still owed at the deadline" branch. The timeout at `due_at` is that event.
4. Reclassify `w.due` in the orchestration record as a **timed wait with a state re-read**, not
   event-or-timeout.
5. **Reciprocity, per I's P1-4 — the mechanism is a suppression plus a `distinctFrom` row on each
   of the eight, NOT enrolment in `obligation-reminder`.** *(Arbitration: the TIM domain audit
   proposed adding DOC-215, REL-284, ACC-263, RLT-279, ACT-13 and FBK-49 to the group at scope
   `communication-purpose`. I is binding on competition groups and rules that out under
   GLB-01/GLB-03 — their lifecycles are unrelated, and a group added to make a suppression
   convenient is how unrelated lifecycles start blocking each other. The domain audit's reading
   that six of them "can" join is correct on the schema and wrong on the rule.)* The five in this
   part carry their clause in their own sections (TIM-63, ACC-263, DOC-215, REL-284, RLT-279);
   SCH-266, ACT-13 and FBK-49 belong to other parts.
6. **P1-6 · the FIN-134 boundary.** `distinctFrom +=` `{ journey: "FIN-134", because: "FIN-134 opens
   only where a payment system states that an attempt against the obligation actually failed, and
   it owns what is said about the obligation from that moment. This journey is the sending for an
   obligation that is merely outstanding — owed, due, and not yet attempted. Where a recorded
   failure exists, that journey holds the obligation and this one is suppressed for it." }`, and
   name FIN-134 among the type-specific owners in `s.g6`.

**Display-only changes needed:** `w.due` + `a.recheck` read as one unit — *"Wait until the reminder
point, then re-read what is owed"* — the same treatment Family B gives a wait and its follower
condition. Today they are two cards joined by a one-hop connector. The trigger card reads as an
event, not as "Customer owed obligation outstanding".

**Renderer changes needed:** K §4.1. K P2-9 — the trigger card drops the `SignalSource` provenance
row and humanises the event into something that reads as a thing that happened. Not proposed: a
Family B extension that would fold a wait into a *sole-successor action*; `a.recheck` writes
nothing and has two in-edges, so the existing detector cannot see it, and inventing a rule for a
single site would fail the generic-only constraint.

---

## TIM-274 — Grace Period Recovery

**Purpose:** Make grace a state the holder is in **knowingly** — what stopped, what still works,
when the window ends, and the one route back.

**Current flow:**
```
grace_period_started
 → Does grace restrict anything the holder will actually notice?
      Function reduced     → Grace notice: what stopped, what still works, the end date, the route back
      Continuity unchanged → Quiet notice: validity lapsed, nothing has changed yet, and the date it will
 → Wait until recovery_condition_satisfied | entity_terminated
      (timeout: grace_period.grace — the last point at which one more message can still be acted on)
      event   → What ended the wait?
                  Recovered   → Confirmation → Exit: recovered inside the window
                  Ended early → Exit: grace ended by termination
      timeout → Last call: the exact end date, what stops at it, the same single route
 → Wait until recovery_condition_satisfied   (timeout: grace_deadline_at)
      event   → (back to "What ended the wait?")
      timeout → Loss notice → Exit: window closed unrecovered
```

**Problems found:**
- **`w.final.until` lists only `recovery_condition_satisfied`.** `w.grace` listens for
  `recovery_condition_satisfied` **and** `entity_terminated`; `w.final` dropped the second. An
  entity terminated during the last leg therefore times out and receives `a.lost` — *"your window
  has closed, here is what you have lost"* — about a thing that was already cancelled. **The
  sharpest bug in the TIM cluster**, and the same class as the RET-30 `cancellation_confirmed`
  defect that was fixed as a P0.
- **Consequently `c.outcome`'s "Ended early → x.moot" branch is unreachable from `w.final`.** It
  exists only for `w.grace` today and becomes reachable the moment the fix above lands.
- **No state re-read before `a.last-call` or `a.lost`.** Both fire on a timeout and both are sent
  blind — the two most consequential messages in the cluster.
- All five touches carry `["persistent","urgent"]`, including `a.notify-quiet`, whose entire
  content is *"nothing has changed yet"*, and the recovery confirmation. That devalues the one
  message here that genuinely earns SMS.
- The corpus's touch counter reads `orchestration.touches.length` and reports **5**; the longest
  path is **3**. `a.notify-restricted`/`a.notify-quiet` are exclusive arms, as are
  `a.confirm`/`a.lost`.
- `c.restricted` forks into two message cards carrying an identical channel block, so the canvas
  repeats the channel pair twice and clamps the only thing that differs — what the message says
  (K P2-10).

**Final orchestration:** **combination** — conditional (does grace actually bite?) → sequential
across a fixed window → event-or-timeout at both bounds. This is a genuine composite and J's own
justification stands: the three touches are three different facts about one window — it has opened,
it is about to close, it closed or was recovered — not one message repeated. Inside it,
**`a.last-call` is a parallel send**: the email carries what stops, what survives and the recovery
route; the SMS carries the date and that this is the last chance. Neither substitutes for the
other.

**Final customer channels:** `a.notify-restricted` → `email`. `a.notify-quiet` → `email`.
`a.confirm` → `email`. **`a.last-call` → `email` and `sms`, once, together.** `a.lost` → `email`.
The grace notice keeps email alone because `s.g2` makes *"what still works"* mandatory and that is
the part that will not fit in an SMS.

**Customer touch count:** **3** on the longest path — two asks and one statement of the outcome.
Of the three only two are asks; `s.g5` is right that both the confirmation and the loss notice must
be sent (*"silence after a recovery and silence after an expiry are indistinguishable to the person
living in the window"*). No touch is removed and the 4th-touch justification does not arise.

**Final flow:**
```
Grace period started (authoritatively recorded, fixed end, recorded recovery condition)
 → Does grace restrict anything the holder will actually notice?
      Function reduced     → Grace notice (Email): what stopped, what still works, the end date, the route back
      Continuity unchanged → Quiet notice (Email): validity lapsed, nothing has changed yet, and when it will
 → Wait until recovery_condition_satisfied | entity_terminated   (to the last actionable point)
      event   → What ended the wait?
                  Recovered   → Confirmation (Email): which reduced capabilities came back
                                 → Exit: recovered inside the window
                  Ended early → Exit: grace ended by termination
      timeout → Re-read: is the window still open, is the entity still in grace, has the end moved?
                  Still in grace → Last call (Email AND SMS, together): the exact end date,
                                    what stops at it, the one route back
                  Otherwise      → (join "What ended the wait?")
 → Wait until recovery_condition_satisfied | entity_terminated   (to grace_deadline_at)
      event   → (join "What ended the wait?")
      timeout → Re-read, then Loss notice (Email): what is gone, and whether a route exists on
                 other terms → Exit: window closed unrecovered
```

**State re-checks:** Two new ones — `a.recheck-grace` before the last call, and the same node reused
before the loss notice. Both must write real state (the re-read grace record) so Family A does not
absorb them. The waits already re-read on their event arms.

**Stop conditions:** `recovery_condition_satisfied` and `entity_terminated`, **at both waits**;
ACC-261 recording a restriction, which supersedes this journey outright.

**Ownership / handoff:** `access-consequence-narration` with ACC-261, `onLoss: superseded` — below
the restriction notice, above FIN-134, *whose messaging ends where the grace state begins*. TIM-281
is excluded by eligibility on both sides. `distinctFrom` names TIM-65, FIN-134, ACC-261 and
TIM-281; I records this as the corpus's cleanest statement of a narration chain and TIM-274 `s.g6`
(*"One narrator per state, in order"*) as the only honest statement of the whole FIN-134 → grace →
restriction ordering. **Zero handoff nodes, and that is correct**: this journey narrates a state
TIM-65 owns and hands nothing on. It must not restate the payment obligation FIN-134 handed over,
and it must not speak once ACC-261 stands. Do not reopen.

**Canonical changes needed:**
1. **P0-equivalent.** Add `entity_terminated` to `w.final.until`. One event id; it removes a message
   sent to somebody whose entity was already cancelled and makes `c.outcome`'s second branch
   reachable from both waits.
2. Add `a.recheck-grace` between `w.grace`'s timeout arm and `a.last-call`, and reuse it between
   `w.final`'s timeout arm and `a.lost`. Same shape as `TIM-268.a.recheck`, with a real `writes`
   entry.
3. Channel roles: `t1 notify-restricted` → `["persistent"]`; `t2 notify-quiet` → `["persistent"]`;
   `t3 confirm` → `["persistent"]`; `t4 last-call` → `["persistent","urgent"]` with
   `channelStrategy.simultaneous: { allowed: true, reason: "the email carries what stops, what
   survives and the route back; the SMS carries the date and that this is the last chance. Neither
   substitutes for the other and the window closes once." }`; `t5 lost` → `["persistent"]`.
4. Keep `grace_period.touches` at 3 and keep its `applicableWhen` wording verbatim — it is the only
   cap in the cluster that names the longest path rather than the plan's length, and TIM-268's is
   being rewritten to match it.

**Display-only changes needed:** none. 13 canonical, 13 drawn, nothing absorbed, nothing shared —
this journey renders exactly as authored, which is why its bugs are legible.

**Renderer changes needed:** K §4.1, including the `simultaneous` case — two channels on one row as
a parallel send, never a ranked ladder. K P2-10 — where a decision forks into two message cards
with an identical channel block, the card gives its prominent space to what differs (the message)
rather than to what is the same (the channel).

---

## TIM-281 — Expired Access Recovery

**Purpose:** Give somebody who has come back to something that expired the **one** route that
actually restores it, at the moment they are asking — because naming the wrong route spends the
only intent this ever gets.

**Current flow:**
```
holder_acted_on_expired_entity
 → [establish what the expiry actually did: suspended, invalidated, ended the relationship] (absorbed)
 → Which mechanism restores validity here?
      Renewal         → "Here is the renewal, what it costs, and what carries across the gap"
      Requalification → "This is not a renewal; these conditions have to be met again"
      Replacement only→ "The old one stays expired; a new one is issued, and here is what differs"
      No route back   → "There is no way back to this one; here is what exists instead" → Exit: terminal
 → Wait until validity_restored | recovery_attempt_abandoned   (response window, required)
      timeout → Exit: still expired; the route was offered and not taken
      event   → Did validity come back?
                  Valid again → Confirmation: what is valid now, and that a replacement is a NEW object
                                 → Exit: valid again by the route that was named
                  Abandoned   → Exit: still expired
```

**Problems found:**
- **`a.establish` is absorbed** although `s.g1` makes it the journey's thesis: *"the route is worked
  out before anything is said. One wrong route spends an intent that arrived willing."* It writes
  nothing, so Family A hides it.
- The four route statements each declare `email + in_app` with no node reading anything that picks
  between them — yet the signal is already in the instance key. `attempt_id` is half of
  `entity_ref + attempt_id`, so the surface the attempt arrived on is already held.
- `competition: "none"` reads as "there is no contest" while TIM-274 names TIM-281 in
  `distinctFrom` and both carry eligibility clauses excluding each other.
- Nothing else. The cap, the wait, the bypass on the dead-end branch and both endings are right as
  authored.

**Final orchestration:** **conditional routing (four-way).** Four messages that differ in substance,
not in tone, and choosing among them is the whole job — the reference case in this part for "the
split genuinely changes what is said". The route decision *also* now picks the channel, from the
same read. The single send and the event-or-timeout tail sit beneath it; `a.no-route` correctly
bypasses the wait entirely because there is nothing to wait for.

**Final customer channels:** **the surface the attempt was made on** — `in_app` where the holder
acted in the product, `email` otherwise; the confirmation is `email`. **No SMS, no push:** the
holder is already in front of us, at a moment of their own choosing, having just acted. There is no
deadline being raced and no consequence they have not already met.

**Customer touch count:** **2** — one route statement, one confirmation. Five communication nodes,
longest path two; the cap is already 2.

**Final flow:**
```
Holder acted on an expired entity
 → Establish what the expiry actually did (suspended · invalidated · relationship ended)
 → Which mechanism restores validity here?   [answer delivered on the surface the attempt arrived on]
      Renewal          → Renewal route: what it costs, what carries across the gap
      Requalification  → Not a renewal: the conditions that must be met again, listed
      Replacement only → The old one stays expired; a new one is issued, and what differs
      No route back    → There is no way back to this one; here is what exists instead
                          → Exit: no route back (terminal)
 → Wait until validity_restored | recovery_attempt_abandoned   (response window)
      timeout → Exit: still expired; the route was offered and not taken
      event   → Did validity come back?
                  Valid again → Confirmation (Email): what is valid now, and whether it is a new
                                 object or the old one revived → Exit: valid again
                  Abandoned   → Exit: still expired
```

**State re-checks:** `a.establish` reads what the expiry actually did before any route is named —
this *is* the re-check, and it should be visible. `c.outcome` re-reads whether validity actually
came back before confirming.

**Stop conditions:** `validity_restored`; `recovery_attempt_abandoned`; an open grace period on the
entity, which hands the holder to TIM-274 for the length of the window.

**Ownership / handoff:** No handoffs, correctly — TIM-69 decides the mechanism and issues any
replacement; this journey carries the holder along whichever route that decision names, and must
not promise a decision it does not own. **I records `competition: "none"` as right**: TIM-281 is
gated by state, not by contest, and `s.g5` says so (*"An open grace period owns the holder. This
journey starts only once grace has closed at its recorded end, or where no grace period was granted
at all"*), with TIM-274 stating it back in `distinctFrom`. *(Arbitration: the domain audit proposed
replacing `"none"` with a statement of the contest, or failing that joining
`access-consequence-narration` below TIM-274. I is binding on competition and explicitly lists
TIM-281 under "checked and found correct". `"none"` stays; the eligibility clauses on both sides
are the enforcement.)*

**Canonical changes needed:**
1. `a.establish` declares the state it produces (`writes: [{ field: "expiry_effect", mode: "set" }]`)
   so the step the journey exists to insist on keeps its card.
2. Per-route channel selection read from the attempt: `a.renew`, `a.requalify`, `a.replace` and
   `a.no-route` each `channelRoles: ["in-session","persistent"]` with the `in-session` role's
   `when` naming the attempt surface (*"the attempt recorded on `attempt_id` arrived in the
   product"*) and `persistent` carrying every other case. `a.confirm` → `["persistent"]`.
3. `competition: "none"` stays. No change.

**Display-only changes needed:** none.

**Renderer changes needed:** K §4.1 — with a real routing signal declared on the role's `when`, the
card must render a *choice* ("whichever applies"), never a Primary/Fallback hierarchy.

---

## ACC-261 — Access Restriction Notice

**Purpose:** Tell the account holder what access is going away, when, and the one condition that
brings it back, so a restriction is a decision they can act on rather than a discovery they make.

**Current flow:**
```
Access restriction or end recorded
 → Can the holder do anything about this?
      Resolvable by them → Is there a permitted route to them?
                               Reachable   → Notify (Email/In-app)
                               Unreachable → Handoff: Contactability Recalculation (CON-36)
      Not theirs to resolve → Inform only (Email/In-app) → Exit: informed     [DEAD-ENDS]
      Placed by a security response → Exit: announced by the security response
 → Notify → Wait: release_condition_met | restriction_lifted | restriction_made_permanent,
            timeout at resolution_deadline_at   (both arms → one condition)
 → Where did it land?
      Restored         → Confirm (Email/In-app) → Exit: restored and confirmed
      Still restricted → Exit: restriction stands past its deadline
```

**Problems found:**
- **The journey breaks its own guardrail on one of its two arms.** `s.g4`: *"Restoration is
  confirmed explicitly. Silence after a resolved restriction reads as the restriction
  continuing."* The `Not theirs to resolve` arm runs `a.inform-only → x.informed` and stops. A
  person told *"your access is restricted, there is nothing you can do"* is never told when it is
  lifted — the one case where they have no way of finding out for themselves. **The substantive
  defect in the journey.**
- **`restriction_made_permanent` is waited for and has no arm.** `c.outcome` has two branches, both
  false for it; routed to `x.stands` anyway, the holder is told their deadline passed and
  `x.stands`'s own `reEntry` becomes a promise that cannot be kept.
- **The reachability gate is on one arm only.** `c.reachable` guards `a.notify` and not
  `a.inform-only`, though both send.
- The wait card prints `release_condition_met`'s registry meaning, which is written for a
  *suppression*, so the card reads *"Until the condition recorded to release the suppression is
  met."* It also drops two of the three `until` arms.
- **Declared vs actual mismatch.** `localCap { value: 2, appliesTo: "all" }` and all three touches
  `mandatory: false`, while `s.g4` makes the restoration confirmation an obligation and `s.g2`
  makes the notice one. The journey behaves as though two touches cannot be withheld and declares
  that both can be rationed.
- In-app is declared on both sends. You cannot reliably deliver a notice about restricted access
  *inside the thing being restricted*.

**Final orchestration:** **conditional routing**, resolved by an event-or-timeout wait. Two routing
decisions genuinely change what the person receives — does the security response already own this
message, and can the holder act — and then one wait ends on the restriction's own resolution *or*
its stated deadline. Not a sequence, not a fallback, no escalation: a restriction is one statement
and one outcome.

**Final customer channels:** **`email` only, on all three touches.** Email is the only surface a
restriction does not touch; somebody locked out of the product will not see an in-app notice, and
this is load-bearing precisely on the arm where the message names what still works, the deadline
and the single condition that lifts it. No SMS: the urgency is a deadline measured in days that is
written *in* the message, not a one-bit action, and the message has to be kept.

**Customer touch count:** **2** — the notice, and the outcome. Both arms of the actionable split
carry the same budget.

**Final flow:**
```
Access restriction or end recorded
 → Is there a permitted route to them?
      Unreachable → Handoff: Contactability Recalculation (CON-36)
 → Can the holder do anything about this?
      Placed by a security response → Exit: announced by the security response (IDN-271 owns it)
      Resolvable by them   → Notice (Email): what is restricted · what still works · the deadline ·
                              the one condition that lifts it
      Not theirs to resolve→ Notice (Email): what is restricted · what still works · who is
                              deciding · no call to action
 → Wait: until released, lifted or made permanent — or the stated deadline
 → Where did it land?
      Restored       → Confirmation (Email): what was restored → Exit: restored and confirmed
      Made permanent → Exit: restriction is now permanent; the holder was told
      Deadline passed→ Exit: restriction stands past its deadline
```

**State re-checks:** One, already authored and correct: `w.resolve.recheck` re-reads the account and
the restriction from the system of record before acting on the timeout. Nothing is sent against a
stale restriction.

**Stop conditions:** `restriction_lifted` ends the wait and routes to the confirmation, never to
silence. `restriction_made_permanent` ends it at its own exit. `x.security-owned` stops the journey
before any send where IDN-271 already owns the message.

**Ownership / handoff:** Highest in `access-consequence-narration` (scope `account`): from the
moment the restriction stands, this journey owns what the holder is told and the recovery journeys
that ran ahead of it — TIM-274 among them — stop. Stated from both sides; do not reopen. ACC-78
decides and records the restriction; this journey only narrates it. One handoff out, to CON-36
(non-public). **This is the public tail of the FIN-134 chain** (FIN-134 → `h.restrict` → ACC-78 →
the restriction narrated here) and neither end says so on the page. This journey must not restate
the payment obligation or the release deadline that produced the restriction — those belong to
FIN-134 and to TIM-274 respectively. *(I also records that ACC-261 defers to IDN-271 by name while
IDN-271 does not name it back; the reciprocal row is written in IDN-271's section.)*

**Canonical changes needed:**
1. **P0.** Route `a.inform-only` into `w.resolve` instead of `x.informed`; delete `x.informed`. Both
   message arms converge on the same wait and the same outcome condition, so the
   not-theirs-to-resolve case now ends at `x.restored` / `x.permanent` / `x.stands` like the other.
   This is what `s.g4` already requires.
2. **P1.** Move `c.reachable` to sit directly after `t.restricted`, ahead of `c.actionable`, so one
   gate covers both sends. Net node count unchanged.
3. **P1.** Add a third branch to `c.outcome` — *"the restriction was made permanent; the release
   condition no longer applies"* → new exit `x.permanent`, class `failure`, `reEntry`: *"a later
   review that converts the restriction back into a bounded one is a new instance"*.
4. **P1.** Mark `t2` (`a.notify`) and `t3` (`a.confirm`) `mandatory: true`, set
   `localCap.appliesTo: "non-mandatory"` and `localCap.default.value: 0` with the corpus's own
   honest basis (*"every touch in the plan is marked mandatory"*). Leave `defaultPriority` and
   `pressureClass` at `service`.
5. **P1.** `channelRoles` on all three touches → `["persistent"]`. Drop `in-session`.
6. **P2.** Add a journey-appropriate wait event — `restriction_release_condition_met`, via
   `scripts/event-curation.json` then `node scripts/build-event-registry.mjs` — rather than
   rewording `release_condition_met`'s registry meaning, which is consumed elsewhere.

Node count: 13 → 13 canonical (one exit removed, one added, one condition reordered, one branch
added).

**Display-only changes needed:** The `Not theirs to resolve` arm must show its message and then the
shared wait, so a reader can see that both arms end in a stated outcome. `x.security-owned` must
stay drawn — it is the visible IDN-271 boundary and the only place a reader learns why some
restrictions produce no notice. `c.reachable` must stay drawn: K §2.3 lists it as one of exactly
two permission gates in the corpus that genuinely change the visible route, because its short arm
moves ownership to another journey.

**Renderer changes needed:** K §4.1. K's wait-card rule — a wait renders its events **and** its
bound (`Until released, lifted or made permanent · or the stated deadline`), never one arm of
three, and never the registry `meaning` where the wait carries its own `duration.rule`.

---

## ACC-263 — Activation Reminder

**Purpose:** Get somebody to use what they have been granted before the window to claim it closes,
because an unredeemed entitlement is indistinguishable from one that was never granted.

**Current flow:**
```
Entitlement provisioned and reachable
 → Is this the holder's first entitlement of this kind?
      First time       → Ready  (Email/In-app)
      Already familiar → Brief  (Email/In-app)
 → Wait: capability_first_used | entitlement_revoked_or_replaced,
         timeout at activation_window_ends_at
      event   → What ended the wait?  Used → Exit activated · Withdrawn → Exit moot
      timeout → Is there still time to claim it?
                   Time remains  → Remind (Email/In-app)
                                   → Wait: capability_first_used, timeout at activation_window_ends_at
                                     → Exit activated / Exit lapsed
                   Window closed → Exit lapsed
```

**Problems found:**
- **The reminder can never fire.** `w.first-use.timeout` is attribute-bound to
  `activation_window_ends_at` — it fires *at the end of the window* — while `c.remind`'s "Time
  remains" branch requires *"the window has a meaningful period left"*, which is false by
  construction at that instant. The wait's own `duration.rule` says the opposite of what the
  timeout does. `w.last-chance` is bound to the **same** attribute, so the second wait has zero
  length. As authored, this journey sends one message and lapses; **the entire reminder half is
  dead.**
- **The second wait violates `s.g3`** (*"Lapsed-unclaimed and revoked-before-use are recorded as
  different outcomes"*): `w.last-chance` waits only on `capability_first_used`, so an entitlement
  revoked after the reminder lands on `x.lapsed` — the holder recorded as having failed to claim
  something we withdrew.
- `c.first-time` forks into two message cards with an identical channel block, so the canvas repeats
  the channel pair and clamps the only difference (K P2-10) — and the split should in fact change
  the channel.
- ACC-263 is one of the eight public journeys TIM-268 defers to that say nothing back (I, P1-4).

**Final orchestration:** **segment-based**, resolved by an event-or-timeout wait with one gated
reminder. The segment is real and its signal is authored — `c.first-time` reads the holder's prior
use of this capability class, which `s.g2` already asserts is knowable — and it is the rare case
where a segment legitimately changes the **channel** as well as the copy. No orchestration is
added; everything else here is repair.

**Final customer channels:** `a.ready` (first grant) → **`email`**: a first grant needs explaining,
and the holder has no habit of looking for it in the product yet, so it has to be brought to them.
`a.brief` (already familiar) → **`in_app`**: a holder who already uses this capability is a product
user and needs only the delta, which belongs where the capability lives. `a.remind` → **`email`**:
the reminder exists *because* the holder did not come back on their own, so the in-product surface
has already failed to reach them. No SMS, no push — an activation window is measured in days or
weeks and the message names one action.

**Customer touch count:** **2** — the grant notice (one of two variants), and at most one reminder.
`s.g1` (*"One reminder, never two. The window is the pressure; repetition is not."*) is correct and
kept.

**Final flow:**
```
Entitlement provisioned and reachable
 → Has the holder used this capability before?
      No  → Ready (Email): what this is, what it lets you do, the one first action
      Yes → Brief (In-app): what changed from what you already had
 → Wait: until first use or withdrawal — or the REMINDER POINT (a lead before the window closes)
      first use / withdrawn → What ended the wait?
              Used      → Exit: activated
              Withdrawn → Exit: entitlement withdrawn before use
      reminder point → Is there still time to claim it?
              Time remains  → Reminder (Email): the deadline and the same one action
              Window closed → Exit: lapsed unclaimed
 → Wait: until first use or withdrawal — or the window closes
      → What ended the wait?   (the same condition, reused)
              Used      → Exit: activated
              Withdrawn → Exit: entitlement withdrawn before use
      window closed → Exit: lapsed unclaimed
```

**State re-checks:** Both waits already carry a `recheck` re-reading the entitlement and its window
from the system of record before acting on the timeout. That is what stops a reminder reaching
somebody who has already activated. Correct as authored; keep verbatim.

**Stop conditions:** `capability_first_used` at any point. `entitlement_revoked_or_replaced` at any
point — currently honoured only on the first wait, which is the C7 fix below.

**Ownership / handoff:** `competition: "none"`, no handoffs, and that is right: ACC-72 provisions
the capability, ACC-76 owns the credential lifecycle, and both are named in `distinctFrom`. Nothing
else speaks about this entitlement. The one addition is the TIM-268 reciprocity below. This journey
must not speak about the credential or the provisioning decision — only about claiming what is
already granted, which is also why it is not promotional.

**Canonical changes needed:**
1. **P0.** Give `w.first-use` its own timeout `Config` — `entitlement_activation.reminder_lead`,
   `required: true`, `class: "attribute-bound"`, relative to `activation_window_ends_at` with a
   lead, and a `rule` stating it is the reminder point rather than the window end. The window end
   stays on `w.last-chance`. Without this the journey's second half is unreachable.
2. **P1.** Add `entitlement_revoked_or_replaced` to `w.last-chance.untilEvent` and point
   `w.last-chance.onEvent` at the existing `c.used` instead of straight at `x.activated`. No new
   nodes — `c.used` already asks exactly the right question and already has both arms.
3. **P2.** Reword `c.remind` branch 0's `when` to *"the reminder point falls inside the window and
   no reminder has been sent for this issuance"* — it survives fix 1 as a genuine guard for an
   issued window shorter than the reminder lead.
4. `channelRoles`: `t1 ready` → `["persistent"]`, `t2 brief` → `["in-session"]`,
   `t3 remind` → `["persistent"]`.
5. **Reciprocity with TIM-268 (I, P1-4):** `suppressions +=` `CANONICAL_RULE` id
   `s.generic-reminder` with the standard text (*"This journey owns the reminder for the obligation
   it holds. The generic outstanding-obligation reminder (TIM-268) is suppressed for that
   obligation while this instance holds it…"*), plus a `distinctFrom` row naming TIM-268 mirroring
   the row TIM-268 already carries.
6. **No change to the declaration.** `service` / `service`, cap 2, `appliesTo: "all"`, all three
   touches `mandatory: false` is honest here and is affirmed as a reference: an entitlement nobody
   claimed is a loss, not a broken promise, and both touches can be withheld under pressure without
   the journey lying to anyone.

**Display-only changes needed:** Once fix 1 lands, the two waits must render with distinct bounds
(reminder point vs window close) rather than the identical string they produce today.

**Renderer changes needed:** K §4.1 and the wait-card rule (events plus bound, all arms). K P2-10 —
the two variant message cards now differ in channel as well as content, which is exactly the case
the card should be making visible.

---

## IDN-84 — Verification Recovery

**Purpose:** Route a failed verification by *why* it failed, and keep our own failures out of the
customer's verification record.

**Current flow:**
```
Verification attempt failed
 → (internal: classify the failure — absorbed)
 → What kind of failure was it?
      The person can correct it → Does the retry budget have room?
                                     Room  → Explain what to correct (In-app/Email)
                                             → Exit: bounded retry available
                                     Spent → Handoff: Decision Request (DEC-181)
      Ours, and transient       → Safe retry within the backoff budget?
                                     Retry      → (internal: retry with backoff — absorbed)
                                                  → Exit: bounded retry available     [SILENT]
                                     Persistent → Handoff: Ownership Escalation (OWN-55)
      Needs a person            → Handoff: Decision Request (DEC-181)
      Terminal by policy        → Cannot be verified on this basis (In-app/Email)
                                  → Exit: verification not possible on this basis
```

**Problems found:**
- **The "ours, and transient" arm sends the customer nothing, ever.** A person who just watched
  their verification fail because of *our* outage gets silence while we retry, and will resubmit
  perfectly good evidence. `s.g2` protects our record; nothing protects their experience.
- **`h.review` hands over with the customer told nothing.** Both `h.review` edges carry
  `suppresses: null` and a `carries` that does not say whether the holder has been contacted. It
  matters most on the `Budget spent` arm, where the person has been explained to once and now hits
  a wall with no further word.
- **`a.backoff` is hidden by the bookkeeping collapse and should not be.** It re-attempts a
  verification against a provider, but writes nothing, so `absorbableBookkeeping()` hides it and the
  reader sees `Safe retry available? --Retry--> Bounded retry available` with the retry invisible.
  Same false positive as FIN-134's `a.retry` — two journeys, so it is generic (K §3.2, §4.3).
- **The two touches declare identical roles and are not the same message**: one belongs in the flow
  the person is standing in, the other is a decision about their identity claim that they will need
  weeks later.
- `defaultPriority: "security"` over-claims a word IDN-271 uses correctly for a compromise incident;
  one of the four failure classes here is *our provider falling over*.
- `localCap { value: 1, appliesTo: "non-mandatory" }` with basis *"the graph's own touch count"* is
  vacuous — both touches are `mandatory: true`, and the graph's two communication actions are
  exclusive arms rather than a count.
- **No wait, and that is correct.** The brief flags IDN-84 as an event-or-timeout candidate; it is
  not. `insufficientAlone` names *"a verification that expired with no attempt made, which is
  IDN-81's expiry"*. A wait here would own the retry loop, which `s.g3` exists to prevent, and
  would duplicate IDN-81's timeout. The entity is `verification_instance_id` — **one failed
  attempt** — and a second failure fires the trigger again. Leave it synchronous.

**Final orchestration:** **conditional routing**, one touch per route. Four failure classes, four
different business responses, one message on each route that speaks to the customer; no sequence,
no wait, no fallback. This is one of the few journeys where `Trigger → Decision → Message → Exit`
per arm is genuinely the right answer.

**Final customer channels:** `a.explain` (correctable, retry available) → **`in_app`**: the person
just failed an attempt and the bounded retry is one screen away; explaining anywhere else guarantees
the retry happens later or not at all. `a.ours` (new, transient our-fault statement) → **`in_app`**,
same reason. `a.explain-terminal` → **`email`**: a terminal decision about an identity claim, plus
what basis *would* be accepted, which the person will refer back to when they go and get it. No
SMS — a verification failure gives the person something to *do* with evidence attached, not a
one-bit action.

**Customer touch count:** **1.** Exactly one of `a.explain` / `a.ours` / `a.explain-terminal` fires
per instance; the two handoff routes send nothing and pass ownership.

**Final flow:**
```
Verification attempt failed
 → What kind of failure was it?
      The person can correct it → Does the retry budget have room?
              Room  → Explain (In-app): exactly what to correct, and the bounded retry
                      → Exit: bounded retry available
              Spent → Handoff: Decision Request — carrying that the holder was explained to once
                      and has not been told the budget is spent
      Ours, and transient       → Safe retry within the backoff budget?
              Retry      → Internal: retry with backoff  (DRAWN)
                           → Statement (In-app): this failed on our side, nothing you sent was
                             rejected, we are retrying
                           → Exit: bounded retry available
              Persistent → Handoff: Ownership Escalation
      Needs a person            → Handoff: Decision Request — carrying that nothing has been said
                                  to the holder about this attempt
      Terminal by policy        → Decision (Email): this claim cannot be verified on this basis,
                                  and what basis would be accepted
                                  → Exit: verification not possible on this basis
```

**State re-checks:** none needed and none present — the journey resolves synchronously from the
failure record.

**Stop conditions:** none to add; there is no wait to stop. The journey's stop condition is its own
exit, and a subsequent attempt on the same claim opens a new instance.

**Ownership / handoff:** `competition: "none"` and, today, the only empty `distinctFrom` in the
access/identity/finance set. IDN-81 owns verification expiry; DEC-181 and OWN-55 own the two
escalations. This journey must not state what the human reviewer or the escalation owner will
decide — it states only what failed and what the holder may do next. Both handoffs must additionally
state what the holder has and has not been told, so the receiver knows whether it owes them a first
word.

**Canonical changes needed:**
1. **P1.** Add `a.ours` on the `c.technical-budget → Retry` arm: a single-channel in-app statement
   that the failure was ours, that nothing they submitted was rejected, and that it is being
   retried. Register it as touch `t3`, stage `explain`, `channelRoles: ["in-session"]`,
   `mandatory: true`. No new wait, no new decision.
2. **P1.** Extend both `h.review` handoffs' `carries`. On `c.retry-budget → Budget spent`: *"that
   the holder was explained to once and has not been told the budget is spent."* On
   `c.class → Needs a person`: *"that nothing has been said to the holder about this attempt."*
3. **P2.** `distinctFrom +=` IDN-81: *"IDN-81 owns a verification that expired with no attempt made.
   This journey owns one attempt that was made and failed; it never waits to see whether the holder
   retries, because the window is IDN-81's."* This is the sentence that makes the no-wait decision
   legible instead of looking like an omission.
4. **P2.** Per-touch channels: `a.explain` → `["in-session"]`, `a.ours` → `["in-session"]`,
   `a.explain-terminal` → `["persistent"]`. *(Arbitration: the domain audit proposed
   `["persistent","in-session"]` with `simultaneous` on the terminal touch. J is binding on final
   channels and gives it email alone — the retryable arm is in-flow, the terminal arm is a record,
   and that contrast is the whole of the split. No `simultaneous` here.)*
5. **P2.** `defaultPriority` `security` → `transactional`, keeping `pressureClass: "none"`; set
   `localCap.default.value: 0` with the honest basis *"every touch in the plan is marked
   mandatory"*.

**Display-only changes needed:** `a.backoff` must be drawn. The two DEC-181 handoff instances are
correctly drawn once per parent; keep.

**Renderer changes needed:** K §4.1. **K §4.3 — `absorbableBookkeeping` must read structure, not a
field name**: an internal action that writes *nothing* is not thereby bookkeeping, and an action may
only be absorbed if the card absorbing it can carry its meaning. `a.backoff` (here) and `a.retry`
(FIN-134) are the two sites that prove the rule; the `writes: []` case needs its own test. K §4.5's
**G8_ACTION_HIDDEN** gate is what stops this regressing.

---

## IDN-271 — Account Security Alert

**Purpose:** Ask the owner the one question that resolves a suspected compromise, on a route the
suspicion does not touch, while saying plainly whether anything has actually been restricted.

**Current flow:**
```
Compromise incident opened with scope determined
 → Is there a destination the signal does not implicate?
      Every route implicated → Exit: no destination outside the suspicion; no alert sent
      Clean route → Has anything actually been restricted?
            Containment applied → Alert: what was restricted, why, and that confirming the
                                   activity resolves it   (Email + SMS, simultaneous)
            Nothing restricted  → Alert: was this you? nothing has been restricted
                                   (Email + SMS, simultaneous)
 → Wait: activity_confirmed_own | activity_reported_not_own | security_review_concluded,
         timeout at the incident's review point
      event   → What did the answer establish?
            Theirs     → Cleared, and what was lifted → Exit: cleared
            Not theirs → Handoff: Account Recovery Verification (IDN-88)
      timeout → The incident is open past its review point, and what remains restricted
                → Exit: incident open past its review point
```

**Problems found:** *(all of them display, declaration, or one clause of copy — the canonical graph
is right)*
- **The page contradicts the journey's own safety rule.** `s.multi-destination`: *"The alert goes to
  every verified, unimplicated destination at once; a single destination that may itself be
  compromised is never the only one told."* The card says `Primary Email / Fallback SMS` — SMS only
  if email fails, which is exactly the single-destination behaviour the rule forbids. This is the
  most damaging instance of the corpus-wide fallback artifact, because here the wrong reading is a
  security claim.
- **`simultaneous` is declared, typed and read by nothing.** It exists in `types.ts`, is set in
  exactly one place in the corpus — this journey — and `grep -rn simultaneous src/lib src/components`
  returns nothing. The library's only genuine parallel send renders as a fallback ladder.
- **The wait card drops the arm that matters**, rendering *"Until the owner confirms the activity was
  theirs"* and losing `activity_reported_not_own` and the review point.
- **`c.route` is one refactor away from being erased.** It is structurally identical to a generic
  deliverability gate — a binary condition whose short arm is a `no-action` exit — and survives
  `collapsibleGates()` today only because the rule additionally requires the short arm to pass
  through a bookkeeping hop. It must never be collapsed: *"is this destination implicated by the
  suspicion?"* is the single most important business decision in the corpus.
- **Copy divergence between the touch and the node.** `t-standing`'s purpose ends *"nothing further
  is assumed from their silence"*; `a.standing` says *"nothing further is required from them"*. The
  touch's version matches the wait's own rule that silence is never read as confirmation; the
  node's is weaker and, on a still-open incident, arguably untrue.
- `c.contained` forks into two message cards with an identical channel block (K P2-10) — correctly,
  here: the fan-out is the same and only the content differs, which is exactly what the card should
  be showing.

**Final orchestration:** **parallel**, then event-or-timeout. Both halves are already authored
correctly. The parallel is justified by `simultaneous.reason` and `s.multi-destination`; the
event-or-timeout is justified by `s.owner-informed-past-review`, which turns the timeout arm into a
real message rather than a silent expiry. **This is the reference implementation of both shapes in
the corpus.**

**Final customer channels:** **`email` and `sms` together**, to every verified destination the
signal does not implicate — on the alert, on the all-clear and on the still-open notice. Not a
ladder. Three things are true at once and all three are needed: the question is **one bit** ("was
this you?"), the account **may be compromised right now**, and **email itself may be the compromised
destination**. That last one is what makes this parallel rather than a choice — the point is not to
reach the fastest channel but to make sure at least one destination the attacker does not hold is
told. An all-clear has to reach everywhere the alarm did.

**Customer touch count:** **2** — the alert, and the resolution (cleared, or still standing). Both
mandatory; `localCap.default.value: 0` with the basis *"every touch in the plan is marked
mandatory"*. Exemplary and unchanged.

**Final flow:** As authored. The only differences are on the page: the alert cards show a parallel
send, and the wait card shows all three events plus the review point.

**State re-checks:** `w.verify.recheck` re-reads the incident — the owner's answer if any, the
security review's state, and what remains restricted — before acting on the timeout. That is why
`a.standing` can name what is *still* restricted rather than repeating the original alert.

**Stop conditions:** any of `activity_confirmed_own`, `activity_reported_not_own`,
`security_review_concluded`. `x.withheld` stops before any send where every route is implicated —
the alert is withheld rather than sent to the attacker.

**Ownership / handoff:** `competition: "none"` and that is right — a compromise incident contests
with nothing, and `s.hard-gates-only` states the exemption explicitly. One handoff, to IDN-88 on a
confirmed compromise; IDN-90 owns scope and containment, IDN-88 owns rebuilding control, both named
in `distinctFrom`. Correctly no handoff on `x.withheld`: the journey that would be told is the one
that started this. **ACC-261 defers to this journey by name and IDN-271 does not name it back** (I,
one-sided row) — the reciprocal row is added below. This journey must not state what containment
IDN-90 applied beyond what is already recorded, and must not promise a restoration IDN-88 owns.

**Canonical changes needed:**
1. **P2, copy only.** Align `a.standing`'s text with its touch: *"…and that nothing further is
   assumed from their silence"*.
2. **P3.** `distinctFrom +=` ACC-261, mirroring the deference ACC-261 already states from its side
   (its `c.actionable` branch *"Placed by a security response"*): the restriction notice narrates a
   restriction that stands on its own terms, while this journey narrates a suspected compromise and
   the containment applied to it, and where a security response placed the restriction this journey
   is the one that tells the holder.
3. Nothing else. `security` / `pressureClass: none` is **correct and is the reference** for what
   `security` should mean in this corpus — an authoritatively opened incident with a determined
   scope, not any message about identity.

**Display-only changes needed:** `c.route` must stay drawn, permanently.

**Renderer changes needed:** **K §4.1, `simultaneous` branch — render the channels on one row as a
parallel send ("Sent together"), never a Primary/Fallback ladder.** The wait card renders all `until`
events plus the bound. **K §4.5 — add a guard** asserting that a condition whose short arm reaches a
`no-action` exit *without* a bookkeeping hop is never collapsed, so a future widening of the gate
rule fails mechanically rather than being caught by reading. All three are generic rules over
`channelStrategy.simultaneous`, `untilEvent` and `exitClass`; none names a journey.

---

## FIN-134 — Payment Failure Recovery

**Purpose:** Respond to the reason a payment actually failed, and keep the obligation alive while
doing it — without ever speaking about the thing the money was for.

**Current flow:**
```
Authoritative payment failure
 → (internal: classify into the class the provider reported — absorbed)
 → What kind of failure was it?
      Transient, safe to retry    → (internal: retry on the same idempotency key — absorbed)
                                    → Wait: recovery
      The customer can fix it     → Corrective action  (In-app/Email) → Wait: recovery
      Declined / no usable reason → Is an alternative route available, and whose decision is it?
            A defined fallback the system may use → Internal: charge it → Wait: recovery   [SILENT]
            The customer must choose or authorise → Offer the alternatives (In-app/Email)
                                                     → Wait: alternate choice
                                                        selected → Internal: charge it → Wait: recovery
                                                        timeout  → policy decision
            Nothing further to offer              → Wait: recovery
 → Wait: obligation_satisfied | recovery_attempt_abandoned, timeout at the consequence date
      event   → Satisfied → Discharged (Email/In-app) → Exit: recovered
                 Abandoned → policy decision
      timeout → Is a reminder still useful, and is there a consequence to name?
            Consequence ahead → The consequence and its date (Email/SMS/Push) → Wait: final
            Nothing to add    → policy decision
 → Wait: final  →  (same outcome condition / policy decision)
 → The obligation is unpaid after the recovery window — what does policy apply?
      Grace period → Handoff TIM-65 · Overdue → Handoff TIM-62 · Restriction → Handoff ACC-78
```

**Problems found:**
- **FIN-134 is the corpus's largest unreciprocated ownership sink** (I, §2.2 and **P0-1**, the
  ownership audit's top defect). Counted across all 69, **five public journeys hand it ownership or
  declare they stop where it begins** — ACQ-11 (`h.payment`), ACQ-287 (`h.payment`), SCH-303
  (`h.payment-failure`, plus `s.failure-not-ours`, plus a `distinctFrom` row, plus its trigger's
  `insufficientAlone`), TIM-274 (precedence + `s.g6`), FIN-302 (`distinctFrom`). FIN-134's own
  `distinctFrom` names **OPS-124 and TIM-274** and nothing else; three of the five handoffs into it
  are unacknowledged. It declares `competition: "none"`, and `s.hard-gates` removes pressure caps in
  its own words (*"Hard gates (GLB-31) apply. **Pressure caps do not**…"*). So the journey that
  receives ownership of the money is uncapped, declares no contest, and carries no rule stopping it
  from restating the release deadline, the checkout or the process that handed it the money. Every
  other journey in that chain gave something up in writing; this one took it and wrote nothing down.
- **TIM-268 and FIN-134 share `obligation_id` and neither names the other** (I, P1-6). An unpaid
  amount past its due date with no attempt made is TIM-268's; the same obligation after a declined
  attempt is FIN-134's.
- **A method can be charged without the customer being told.** `c.alternate` branch 1 — *"another
  stored method exists and standing authority already covers charging it"* — routes to
  `a.use-alternate` and then straight to `w.recovery`. The customer learns it from their statement.
  In a journey whose own `s.hard-gates` calls itself *"transactional communication about an
  obligation the person already holds"*, that is the one silent arm.
- **The canvas hides the journey's first rule and prints an example-only number instead.**
  `w.recovery` renders `2 days–3 days` and `w.alternate-choice` renders `3 days–7 days`; neither
  says what it is waiting **for**. Both Configs carry `confidence: "low", basis: "example-only"`,
  and `w.recovery`'s carries `avoidWhen: "no consequence date"`. `s.resolved` — *"Exit the moment
  the obligation is satisfied, cancelled or waived by any means"* — is the most important sentence
  in the journey and is invisible. A public page printing `2 days–3 days` unqualified is the
  fabricated-number failure `AGENTS.md` names.
- **`a.retry` is hidden by the bookkeeping collapse** (K §3.2): a real payment retry, writing only a
  journal row, absorbed into a wait capsule that has room for a duration and nothing else. The arm
  that explains why no message is sent for a transient failure looks like an arm that does nothing.
- **The reminder's urgent channels are declared as a fallback and are actually a parallel send.**
  As drawn, a person about to lose access gets an SMS only if their email bounces. Push is asserted
  with no push eligibility tested anywhere in the journey.
- **The approved chain is real in the data and unreadable on the page.** All three handoffs target
  non-public journeys and render as grey text; the **public** continuations are TIM-274 and ACC-261,
  both of which name FIN-134 or ACC-78 from their side.
- 20 canonical nodes is the top of what is defensible and **it is earned here** — three failure
  classes, an authority question, three downstream consequences. Do not simplify this journey to
  match the others.

**Final orchestration:** **combination**, and each part is earned by a different question:
conditional routing **by failure class** (which changes what we ask for), event-or-timeout **on the
obligation** (paid, versus the consequence date arriving — the only honest bound, since the
obligation does not expire), and conditional escalation **by policy** (which is not this journey's
decision, hence three handoffs rather than three endings). Inside it, `a.remind` is a **parallel**
send. `w.final` is not a duplicate of `w.recovery`: the bounds differ (consequence date vs recovery
window) and the reminder lives between them.

**Final customer channels:** `a.corrective` → **`email`**. `a.offer-alternate` → **`email`**. The
payment failed while the person was somewhere else; an in-product billing banner is the product's
own state display, not a send, and it cannot reach the population this stage addresses.
`a.remind` → **`email` and `sms`, once, together** — the email restates the corrective action and
the amount, the SMS carries the date and what happens on it; two jobs, one moment, no substitution.
**Push is dropped.** `a.confirmed` → **`email`**: a receipt, checked in an inbox. SMS appears here
for *deadline* reasons — access is about to be restricted, the action is short, the person may not
open email in time — and nowhere else in the journey.

**Customer touch count:** **3** worst case — corrective request (or alternate offer), one reminder,
one confirmation. `a.remind`'s own text holds the line: *"One notice — a second one is a recovery
sequence, not a reminder."*

**Final flow:**
```
Authoritative payment failure
 → What kind of failure was it?
      Transient, safe to retry    → Internal: retry on the same idempotency key  (DRAWN)
      The customer can fix it     → Corrective request (Email): the exact action and what is owed
      Declined / no usable reason → Is an alternative route available, and whose decision is it?
            Standing authority covers it → Internal: charge it  (DRAWN)
            The customer must choose     → Offer (Email): the alternatives, and that the obligation
                                            stands either way
                                            → Wait: until a method is selected — or the consequence
                                              date, whichever is sooner
            Nothing further to offer     → (straight to the recovery wait)
 → Wait: until the obligation is satisfied or abandoned — or the consequence date
      satisfied → Discharged (Email): nothing further expected, AND WHICH METHOD DISCHARGED IT
                   → Exit: recovered
      abandoned → (to the policy decision)
      consequence date → Is a reminder still useful, and is there a consequence to name?
            Consequence ahead → Reminder (Email AND SMS, together): the consequence, its date,
                                 the same corrective action
            Nothing to add    → (to the policy decision)
 → Wait: the rest of the recovery window — until satisfied or abandoned
 → The obligation is unpaid after the recovery window — what does policy apply?
      Grace period       → Handoff: Grace Period Management
                           (TIM-274 Grace Period Recovery is what the holder hears next)
      Overdue tracking   → Handoff: Overdue State Recalculation
      Access restriction → Handoff: Access Suspension
                           (ACC-261 Access Restriction Notice is what the holder hears next)
```

**State re-checks:** Three, all authored, all correct, and this journey is the corpus's best example
of why the brief asks for them. `w.recovery.recheck`: *"the obligation is still outstanding and the
method is still invalid, read from the system of record immediately before the reminder."*
`w.alternate-choice.recheck` and `w.final.recheck` likewise. No reminder can reach somebody who has
paid. Keep all three verbatim.

**Stop conditions:** `obligation_satisfied` at any point routes to the confirmation, never to
silence. `recovery_attempt_abandoned` routes to the policy decision. `s.retry-in-progress` blocks the
corrective request while a system retry may still succeed — which prevents the "your payment
failed" / "your payment succeeded" pair two minutes apart. `s.unknown-outcome` blocks everything on
an unreconciled attempt. All correct; no change.

**Ownership / handoff:** Three handoffs, all to non-public lifecycle mechanisms. `h.grace` carries a
`suppresses` clause that correctly stops every further payment-failure message while the grace
window runs — the model the other two should follow. It **takes ownership from checkout recovery**
(a settled decision) and is deferred to by five public journeys while naming two.

**What this journey must not say — the bound that is missing today.** It speaks about the
obligation and the corrective action, and about **nothing the obligation was for**. A reservation
that may be released (SCH-303), a checkout that was abandoned (ACQ-287), a process that was left
open (ACQ-11), a refund moving the other way (FIN-302), a grace window that has opened (TIM-274) —
each belongs to the journey that handed the money here or that takes it on, and each of those stops
speaking about the money for the same reason. **A release point or a resume destination received at
a handoff is a consequence to work inside, never a deadline for this journey to restate.**

**Canonical changes needed:**
1. **P0-1 · the five reciprocal rows and the suppression that bounds them** (I, verbatim):
   - `distinctFrom +=` `{ journey: "SCH-303", because: "SCH-303's subject is a reservation that is
     still standing and whether it survives; the payment is a condition on it. This journey's
     subject is the obligation itself, from the moment an attempt actually failed. SCH-303 hands the
     money here and stops speaking about it - this journey never speaks about the reservation, and
     the release point it is handed is a consequence to work inside rather than a deadline to
     restate." }`
   - `distinctFrom +=` `{ journey: "FIN-302", because: "This journey is money that failed to come in
     and an obligation that stays open. FIN-302 is money going back out against an obligation
     already discharged. The two share a payment record and nothing else, and neither ever announces
     the other's movement." }`
   - `distinctFrom +=` `{ journey: "ACQ-287", because: "ACQ-287 recovers a checkout nobody finished.
     This opens only where a checkout was finished and the payment against it failed - its own
     handoff is what ends that journey, and this one never returns to the cart or the items." }`
   - `distinctFrom +=` the same row for **ACQ-11**, reading *"a resumable process"* for *"a
     checkout"*.
   - `distinctFrom +=` the reciprocal **TIM-268** row (I, P1-6), naming the attempted/not-yet-
     attempted line.
   - `suppressions +=` `CANONICAL_RULE`, id `s.subject`: *"This journey speaks about the obligation
     and the corrective action, and about nothing the obligation was for. A reservation that may be
     released, a checkout that was abandoned, a process that was left open - each belongs to the
     journey that handed the money here, and each of those stops speaking about the money for the
     same reason. A release point or a resume destination received at a handoff is a consequence to
     work inside, never a deadline for this journey to restate."*
   - `contact.competition` stays `"none"`. I is explicit that the fix is the stated bound, not a
     competition group; the contest is resolved by handoff, and `s.subject` is what makes the
     uncapped side safe.
2. **P1 · close the silent alternate arm without adding a node.** Extend `a.confirmed` to name which
   method discharged the obligation, and add `s.authorised-method`: *"Where a stored method was
   charged under standing authority after another failed, the confirmation names the method used. A
   charge the person did not choose is disclosed at the moment the obligation closes, not discovered
   on a statement."*
3. **P1 · channels.** `t.corrective` → `["persistent"]`; `t.offer-alternate` → `["persistent"]`;
   `t.remind` → `["persistent","urgent"]` with `urgent` narrowed to `sms` only (drop `push` from the
   role for this journey) and `channelStrategy.simultaneous: { allowed: true, reason: "the email
   restates the corrective action and the amount; the SMS carries the date and what happens on it.
   Sent once, together, before a consequence the company will actually apply." }`;
   `t.confirmed` → `["persistent"]`.
4. **P2 · the wait Configs.** Keep the `example-only` ranges in the detail panel; the card must show
   the event and the bound. **If the renderer change below lands, no canonical change is needed
   here at all** — this item exists only as the fallback if the renderer is not changed.
5. **No change to the declaration.** `transactional` / `pressureClass: none` /
   `localCap.appliesTo: "non-mandatory"` with `value: 1`, one discretionary touch against three
   mandatory ones, and `s.hard-gates` stating the reasoning in the journey's own words. This is the
   reference declaration for the domain.

**Display-only changes needed:**
- `a.retry` must be drawn; `a.use-alternate` already is.
- The handoff cards for `h.grace` and `h.restrict` name the **public journey the holder hears next**
  (TIM-274, ACC-261) alongside the non-public target. This is derivable rather than a per-journey
  lookup — both of those journeys name the target in `distinctFrom` — so it is a rule.

**Renderer changes needed:** K §4.1, including the `simultaneous` parallel case — this reminder is
the case that proves it. The wait card shows its events and its bound, and **a `Config.default`
carrying `basis: "example-only"` or `confidence: "low"` is never rendered as a bare duration**: the
card shows the `until` sentence, or the number explicitly marked as an example. K §4.3 — the
`absorbableBookkeeping` structure fix (`a.retry` and IDN-84's `a.backoff` are the two proving
sites), plus the rule that an action may only be absorbed into a card that can carry its meaning,
never into a `wait` capsule.

---

## FIN-302 — Refund Notification

**Purpose:** Tell the person money is going back, and then whether it actually arrived — keeping the
decision to refund, the movement of the money and its arrival as three facts stated at the moment
each becomes true.

**Current flow:**
```
Refund submitted for settlement
 → What is actually moving, and against what?
      The whole transaction → (send gate)
      Part of it            → (send gate)
      Nothing is moving     → Exit: nothing to announce
 → (send gate: may the notice go out? — hidden, correctly)
      No route → (internal: record why) → Exit: no notice sent
 → Notice: money is going back — the amount, whole or part, and that it has not arrived (Email/In-app)
 → Wait: refund_settlement_confirmed | refund_settlement_failed, timeout at the settlement window
 → What does the financial record say happened to the money?
      Returned in full → Returned, and how much → Exit: returned and confirmed
      Returned in part → What came back, what did not, what happens to the rest → Exit: partly returned
      Not confirmed    → Not confirmed back, being reconciled, nothing needed from you
                          → Exit: not confirmed back
```

**Problems found:**
- **A withdrawal mid-window is told as a reconciliation.** `x.void` catches a submission withdrawn
  *before* anything was said. After `a.issued` has gone out, `w.outcome` waits on
  `[refund_settlement_confirmed, refund_settlement_failed]` only — so a submission reversed or
  withdrawn during the window falls to the timeout and the person is told *"the money has not been
  confirmed back, the movement is being reconciled."* That is false, and `s.approved`'s own standard
  (*"Every message says which of the three is true at the moment it is sent"*) is broken. **There is
  no withdrawal event in the registry**, so this needs a registry addition, not just a branch.
- **`c.scope`'s whole-vs-part split does not change the route.** Both branches go to the same node
  and the twin-route edge merge draws them as one edge labelled *"The whole transaction · Part of
  it"* — a decision whose two visible labels lead to the same box (K P1-5 partial case). What the
  split is actually doing is asserting a content requirement, and that requirement already lives in
  `s.partial` and in `a.issued`'s own prose. The same message goes out on the same channel to the
  same person either way; only the numbers inside it differ, and the numbers come from the record.
- **The wait card drops the failure arm**, rendering only *"Until the financial record confirms that
  funds were returned…"*. On a refund journey the dropped arm is the one the person is afraid of.
- In-app is declared on all four sends; a balance display is not a statement about money.

**Final orchestration:** **event-or-timeout** — one notice, then a wait resolving to one of several
mutually exclusive outcome statements. Not a sequence and not a fallback: `a.settled`, `a.partial`
and `a.unresolved` are exclusive arms of one condition, exactly as the journey's own `localCap`
basis says. It is the right shape because the second message exists only when a *state* became true,
never because time passed — `s.once`.

**Final customer channels:** **`email`** for every touch. A statement about money is the thing
people go back and look for, forward to someone, and check against a bank statement. **No in-app, no
SMS, no push, and this is the clearest case in the domain**: there is nothing for the person to do,
no deadline to beat, and the entire value of the message is that it can be re-read. An SMS saying
money is on its way, with no amount retained and no record kept, generates the support contact the
journey exists to prevent.

**Customer touch count:** **2** — the movement, then the outcome. Both mandatory. `s.once` forbids a
third and is right.

**Final flow:**
```
Refund submitted for settlement
 → Is money actually moving?
      Nothing is moving → Exit: nothing to announce
 → Notice (Email): the amount submitted, whole or part with the remainder named separately,
   and that it has not arrived yet
 → Wait: until the record confirms the money was returned, failed, or the submission was
   withdrawn — or the settlement window closes
 → What does the financial record say happened to the money?
      Returned in full → Returned, and how much → Exit: returned and confirmed
      Returned in part → What came back, what did not, what happens to the rest
                          → Exit: partly returned
      Withdrawn        → The refund was withdrawn before it settled, and what the record now shows
                          → Exit: withdrawn after notice
      Not confirmed    → Not confirmed back, being reconciled rather than re-attempted, nothing
                          needed from you → Exit: not confirmed back
```

**State re-checks:** One, authored and correct: `w.outcome.recheck` re-reads *"the refund record,
the original transaction and the remaining refundable amount, re-read from the financial systems
that own them"*. That is what makes the partial arm honest — the remaining refundable amount is read
at the moment of the second message, not carried from the first. Keep verbatim.

**Stop conditions:** `refund_settlement_confirmed` / `_failed` end the wait; the settlement window
bounds it; `x.void` stops before any send; the hidden send gate stops with a recorded reason where
no route exists. After the outcome message the journey ends — `s.once` forbids a reminder, and a
further refund against the same transaction is a new instance with its own `refund_id`.

**Ownership / handoff:** No handoffs, `competition: "none"`, and five `distinctFrom` rows — FIN-137
(who decided), FIN-138 (who moved the money and tells nobody), REM-157 (which remedy), FIN-134
(money in versus money out), REM-305 (the case versus the money). The most completely stated
boundary set in the domain. **The REM-305 boundary is intact from both sides** (I confirms F3
closed) and is three claims REM-305 does not carry and must not make: the **amount** (`s.partial`),
the **timing** (`s.timing` — no date is promised, because the settlement route's timing is not the
sender's to assert) and the **settlement state** (`s.approved` — submitted is not settled). Keep it
exactly as it is and do not let a later edit soften `s.approved`, which is the load-bearing one.
FIN-134 does not name FIN-302 back; the reciprocal row is written in FIN-134's section.

**Canonical changes needed:**
1. **P1.** Add `refund_submission_withdrawn` to the event registry via `scripts/event-curation.json`
   + `node scripts/build-event-registry.mjs`; add it to `w.outcome.untilEvent`; add a fourth branch
   to `c.outcome` (*"the submission was withdrawn or reversed after the notice went out"*) → new
   message `a.withdrawn` → new exit `x.withdrawn`, class `invalid-state`. This is the one place the
   journey currently makes a claim its own `s.approved` forbids.
2. **P2.** Reduce `c.scope` to two branches — *Money is moving* → send gate, *Nothing is moving* →
   `x.void` — and rely on `s.partial` and `a.issued`'s existing content requirement for the
   whole/part distinction, which is where it already lives.
3. **P2.** `channelRoles` on all touches → `["persistent"]`. Drop `in-session`.
4. Nothing else. The declaration is exemplary — `transactional` / `pressureClass: none` /
   `localCap.value: 0` with the basis *"every touch in the plan is marked mandatory"* — and the
   entity note (*"a further refund against the same transaction is its own movement with its own
   instance, which is what keeps a partial refund from being announced twice as a whole one"*) does
   real work.

**Display-only changes needed:** none. Confirm the send-gate collapse stays: `c.sendable` →
`a.record-no-action` → `x.no-action` is a textbook implementation gate through a bookkeeping hop and
`collapsibleGates()` is right to hide it. It is also the useful contrast with IDN-271's `c.route`,
which looks identical and must never be hidden — one records why nothing was sent, the other decides
who is safe to tell.

**Renderer changes needed:** K §4.1 (one role → no rank label). The wait card renders every `until`
arm plus the bound.

---

## DOC-214 — Document Delivery

**Purpose:** Get one specific *issued* version to the party who should have it, and know honestly
whether it arrived — without delivery state ever being confused with document validity.

**Current flow:**
```
issued_document_requires_distribution
  → [resolve recipient and permitted route]        (absorbed)
  → [bind distribution to the exact issued version] (absorbed)
  → Distribute  EMAIL
  → Wait until distribution_confirmed | distribution_failed
       event   → How did the distribution resolve?
                   Confirmed → [record] → Exit: distributed
                   Failed    → Handoff: CMS-208
       timeout → [record UNKNOWN, never DELIVERED] → Handoff: external status reconciliation
```

**Problems found:**
- **The card says `Primary: Email` over a one-channel plan.** `channelStrategy.roles` has a single
  role and `fallback: "same-role-other-channel"` — a fallback declaration with nothing to fall back
  to. Display noise on the corpus's cleanest journey.
- `a.version` is absorbed although its headline is *"Bind the distribution to the exact issued
  version"* and `s.g2` makes version binding one of the journey's three stated guarantees. **No
  change is proposed:** the absorption rule is data-driven and correct as a rule, and the node is
  one click away under *Represented canonical steps*. Recorded because it is a real cost of an
  otherwise good rule.
- The trigger reads *"Trigger Issued document requires distribution Authoritative"* (K P2-9,
  corpus-wide).

**Final orchestration:** **single.** One message, one recipient, one version. There is no second
business moment — the document has either arrived or it has not, and "has not" is somebody else's
journey. The wait that follows resolves the *outcome* and sends nothing; **a second touch would be a
second copy of a document, which is exactly the failure `s.g1` and the
`document_distribution.touches` budget of 1 name.** The temptation to add orchestration here because
a 7-card journey "looks thin" is the temptation this plan is refusing on purpose: the burden of
proof is on adding, and there is none.

**Final customer channels:** `email`. Only.

**Customer touch count:** **1.**

**Final flow:** identical to the current flow. No graph change.

**State re-checks:** one, and it is enough — `w.distribution.recheck` re-reads the issued version
from the system of record before acting on the timeout, so a version superseded during the delivery
window is not reconciled as though it were still current.

**Stop conditions:** `distribution_confirmed` → the success exit; `distribution_failed` → the
recovery handoff; the window elapsing with neither → the reconciliation handoff. **There is no path
on which this journey sends again.**

**Ownership / handoff:** `h.recover → CMS-208` (non-public) carrying `message_id` +
`destination_id` and *"the explicit requirement that any fallback route carries the same version"*.
`h.reconcile → external:external-status-reconciliation` carrying *"the document remains valid and
issued regardless of how this resolves"*. Both correct, both stay. This journey must never state
that the document is *valid* on the strength of a delivery outcome, or *delivered* on the strength
of a timeout — the timeout records UNKNOWN and hands off, which is the whole point.

**Canonical changes needed:** **none to the graph.** One optional low-priority field: drop
`channelStrategy.fallback` or set it to a value meaning "no fallback", since a one-role strategy
cannot fall back to anything and the populated field is what feeds the false label. The renderer fix
below makes even that cosmetic.

**Display-only changes needed:** no role label row where the plan has exactly one role — render the
`Email` pill alone.

**Renderer changes needed:** K §4.1 — a single-channel action states its channel and does not rank
it; `ChannelPriorityRow` must stop labelling row 0 `Primary` unconditionally. K's
**H5_FAKE_PRIMARY** hygiene check is the gate. K P2-9 — the trigger card drops the `SignalSource`
provenance row.

---

## DOC-215 — Signature Reminder

**Purpose:** Collect every required signature against **one exact version** — request once per
signer, remind outstanding signers once, and end honestly: expired is not declined, and a deadline
nobody set is never invented.

**Current flow:**
```
document_requires_signature
  → [define signers, authority, order, scope, window]      (absorbed)
  → Is a signature validity window defined?
       Defined     → [bind to it]   (absorbed) ┐
       Not defined → [record unset] (absorbed) ┴→ Request
  → Request  EMAIL  (AWAITING_SIGNATURE, bound to the version)
  → Wait until signer_signed | signer_declined | document_version_superseded
       timeout = signature.reminder_point (3–5 days, example-only, confidence LOW)
       event   → What happened?
              signed     → [record] → All required signatures complete?
                                         All  → [record] → Handoff: DOC-216
                                         Some → back to the wait
              declined   → [record] → Handoff: external operational resolution
              superseded → [record] → Exit: signature process ended
       timeout → Would a reminder still change anything?
              It would     → Reminder  EMAIL  → Wait to the validity boundary
              It would not → Wait to the validity boundary
  → Wait to the validity boundary → (same three answers) / Exit: SIGNATURE_EXPIRED
```

**Problems found:**
- **The one-reminder gate is per-process while the stated rule is per-signer.** `s.one-reminder`
  reads *"One reminder per signer; a second is a re-request the process does not make"*, and
  `t-remind`'s purpose is *"Remind only the signers still outstanding"* — but
  `c.reminder-useful`'s send arm fires only when *"no reminder has been sent **on it** yet"*, on the
  process. Under a signing **order**, which `a.define` explicitly captures, signer 2 becomes
  actionable only after signer 1 signs; if the single process-level reminder was spent on signer 1,
  **signer 2 is never reminded at all.**
- **`c.window` is a no-op diamond on the canvas** (K P1-5, G9): both branches converge on
  `a.request`, both branch actions are themselves absorbed, and the twin-edge merge leaves a violet
  Decision card with exactly one outgoing edge. The split is real *data* — it decides what the
  message may claim and what `w.expiry` binds to — but it is not a **route**.
- **The wait card renders `3 days–5 days` as if it were authoritative.** That Config carries
  `confidence: "low"`, `basis: "example-only"`, and `avoidWhen: "no validity window — the review
  point is the bound"`. On the *Not defined* branch the number is explicitly wrong by its own
  `avoidWhen`, and `s.no-invented-deadline` is the journey's own guardrail against exactly that.
- `Primary: Email` over a one-channel plan; `AWAITING_SIGNATURE`, `SIGNATURE_EXPIRED` and
  `validity_ends_at` reach the canvas as raw tokens (K P1-6).
- Title vs scope: the card says *Signature Reminder* while the journey owns request, collection,
  completion, decline, supersession and expiry. The slug (`signature-process`) is right. Cosmetic,
  recorded, not proposed.
- DOC-215 is one of the eight public journeys TIM-268 defers to that say nothing back (I, P1-4).

**Final orchestration:** **event-or-timeout**, with one sequential gated reminder inside it. This is
the pattern the rest of the corpus should be copying and the reason is the `until` set: the wait
ends on *signed*, *declined* or *superseded* — three ways the reminder stops being useful — and only
the fourth outcome (nothing happened) reaches a send, and then only after a re-check. No segment
split, no channel choice, no urgency ladder. **Do not touch the shape.**

**Final customer channels:** `email`. Only, on both touches. Resisted and recorded: SMS (cannot
carry the document, and there is no urgency the request's own terms set), push (no persistence for a
legal artifact), in-app (a required signer frequently has no product session at all).

**Customer touch count:** **2 per signer** — the request, and one reminder, and only if that signer
is still outstanding at the reminder point. Note the request is a **recipient** fan-out (each
required signer), not a channel fan-out.

**Final flow:**
```
Document requires signature
  → [define signers, authority, order, scope and window — and whether a window exists at all]
  → Signature request · Email   (bound to the exact version, to each required signer)
  → Wait (until signed, declined or superseded — reminder point before the validity boundary)
       → What happened?
              signed     → Are all required signatures complete?
                              All complete → Handoff: Document Effectiveness Validation
                              Some remain  → back to the wait
              declined   → Handoff: operational resolution
              superseded → Exit: signature process ended
       → Would a reminder still change anything, FOR A SIGNER NOT YET REMINDED?
              It would     → Reminder · Email (outstanding signers only) → Wait to the boundary
              It would not → Wait to the validity boundary
  → Wait to the validity boundary → (same three answers) / Exit: signature expired
```

**State re-checks:** both, and both are genuine — `w.signatures.recheck` and `w.expiry.recheck` each
re-read the version and every signer before the timeout is acted on. **The corpus's best instance of
"never send a reminder after success"**: a signer who signed is dropped from the outstanding set by
the re-read, not by a suppression rule.

**Stop conditions:** `signer_signed` (per signer, feeding the completeness check); `signer_declined`;
`document_version_superseded`, which additionally **suppresses outstanding requests**, stated in
`s.version` and enacted at `a.superseded`; the validity window elapsing, recorded as *expired*, never
as refused.

**Ownership / handoff:** `h.effective → DOC-216` carrying *"signed is not effective"* explicitly, and
`h.declined → external:operational-resolution` carrying *"the document remains validly issued — what
is absent is agreement rather than the artifact"*. Both correct, both stay. This journey must not
state that a signed document is *effective* — that is DOC-216's — and must not state a deadline the
issuing terms did not set. Plus the TIM-268 reciprocity below: a signature request is scoped to a
document version and outranks a bare due-date reminder.

**Canonical changes needed:**
1. `c.reminder-useful` branch 0 `when`: replace *"no reminder has been sent on it yet"* with *"this
   signer has not been reminded yet"*, and align `s.one-reminder` to the same scope. No node added,
   no touch added to any signer — it changes **which signers** the single reminder addresses.
2. **Reciprocity with TIM-268 (I, P1-4):** `suppressions +=` `CANONICAL_RULE` id
   `s.generic-reminder` with the standard text, plus a `distinctFrom` row naming TIM-268 mirroring
   the row TIM-268 already carries.
3. Nothing else. Shape, channels, cap and stop conditions are correct as authored.

**Display-only changes needed:**
1. **Absorb `c.window` into the `Signature request` card**, listing it under *Represented canonical
   steps*. The generic rule: *a condition whose branches all converge on the same successor, and
   every branch's action is itself absorbable, is not a route.*
2. **Mark an example-only duration on the wait card**: where `Config.default.basis ===
   "example-only"` or `confidence === "low"`, render the `until` sentence instead of the number, or
   the number with an explicit "example" qualifier.
3. One-role plan → no `Primary` row.

**Renderer changes needed:** K §4.1. K §4.4 — after `buildDisplayGraph`, any `condition` DisplayNode
with `outDegree < 2` is absorbed into its target or re-kinded; today it is drawn as a fork with one
line out, which is the worst of both. K §4.5's **G9_DEGENERATE_DECISION** is the gate. The
example-only wait treatment above, expressed over two fields every `Config` already carries. K's H1
widening for `AWAITING_SIGNATURE`, `SIGNATURE_EXPIRED` and `validity_ends_at`.

---

## INC-254 — Incident Update

**CONFLICT — ESCALATED.** J classifies `a.communicate` as **single (delegated)**, final channel
`email`, on the ground that the action's own text hands the channel to the canonical communication
mechanism, so asserting any channel pair on the card contradicts the stage. The domain audit
classifies it as **parallel, `email` + `in_app`**, citing evidence J does not: both
`audit/51-journey-design-matrix.md` and `audit/channel-orchestration-map.md` record INC-254 as
Parallel with an authored justification — *"Email carries the record to people who are not in the
product; the in-app surface reaches whoever is hitting the fault right now. Neither is interruptive,
so this is not two alarms"* — and the instance key makes each send a single, non-repeating message
to a cohort that is split between those two situations by definition. **I applied the domain
audit's answer (parallel, email + in-app).** J's dissent is recorded and is not without force: the
card must also name the **cohort and the state change**, and must not present the mechanism's
delivery plumbing as this journey's channel decision. Both audits agree on the only thing that
matters operationally — **the card must not say "Fallback"**, in either locale.

**Purpose:** Tell the people actually affected something **true and useful**, through the mechanism
that already owns delivery — and say nothing when nothing has changed.

**Current flow:**
```
incident_reaches_communication_relevant_state
  → [determine what is known, what is not, what action, what the next-update condition is] (absorbed)
  → Can the affected cohort be identified with reasonable precision?
       It can        → [scope it]  (absorbed) ┐
       It cannot yet → [go broad]  (absorbed) ┴→ next
  → Is what would be said actually confirmed?
       Confirmed     → ─────────────────────┐
       Not confirmed → [hold the claim] (abs)┴→ next
  → Does this materially change the guidance the recipient already has?
       It does                                 → Communicate
       It does not, and no commitment requires → [record] → Exit: nothing was sent, and why
       It does not, but a commitment requires  → Communicate
  → Communicate   EMAIL + IN-APP (one send, two surfaces)
  → Is this the resolution notice for this recipient scope?
       It is     → Exit: communications closed
       It is not → Exit: update issued
```

**Problems found:**
- **`Primary Email / Fallback In-app` inverts the authored design.** The card says "try email, fall
  back to in-app" about a send the design records as two surfaces doing different jobs at the same
  moment. **The worst instance of the fallback artifact in the corpus** after IDN-271.
- **`orchestration.touches[t1].mandatory: false`.** An incident notice — including the resolution
  notice, which is the same node — is a service obligation to a cohort that was already told
  something. Marking it discretionary lets a pressure cap suppress the message that closes a loop we
  opened. `pressureClass` is already `"service"`; `mandatory` should agree.
- **`measurement` has no `businessOutcome` and `goal.event` is `null`.** The outcome is coverage —
  did the resolution notice reach the scope that was told — and nothing measures it. Flagged; the
  fix is measurement plumbing and does not belong in a display refactor.
- **`c.cohort` and `c.verified` each draw exactly one outgoing edge** (K P1-5, G9): real decisions
  that select message *content*, drawn as forks with both answers stacked in one compound edge chip.
  They read as bugs. *(Arbitration: the domain audit states that "the three decisions drawn are all
  business logic". K is binding on what the canvas draws, and its rule is structural — a drawn
  condition must have ≥ 2 outgoing display edges. Applied to `c.cohort` and `c.verified` only;
  `c.material` and `c.final` both have real forks and stay.)*
- The trigger reads *"Incident reaches communication relevant state"* (K P2-9).

**The missing wait is the design, and it is right.** Three independent pieces of evidence: the
trigger's own `insufficientAlone` is *"time having passed since the last update, which is not itself
information"*; `x.updated`'s state string is *"update issued; the next update is bound to a stated
condition rather than to a clock"*; and **the instance key is
`["incident_id", "recipient_cohort_id", "state_change_id"]`**. That last is load-bearing and answers
the touch-count question outright: because `state_change_id` is part of the key, **each material
state change is its own instance, and each instance sends exactly one message.** The multi-touch
incident narrative — first notice, scope corrected, workaround, fix in progress, resolved — is
**five instances of a one-touch journey**, not one instance of a five-touch journey. That is why
INC-254 legitimately exceeds three touches across an incident while carrying a `localCap` of **1**
and a single `orchestration.touches` entry: a touch exists only if a new `state_change_id` exists,
and that exists only if the incident's authoritative state changed. **Time passing creates no key,
so it creates no touch.** Adding the "stated-condition wait" some notes offer as an option would
turn a journey whose whole point is *no clock* into one with a clock, and would make the instance
key incoherent — a wait inside an instance keyed on `state_change_id` would be waiting for a state
change that, by definition, starts a different instance. **Do not add a wait, under any reading.**

**Final orchestration:** **parallel** — one send, two surfaces, simultaneously. It qualifies on the
brief's own terms: the two channels serve **different purposes for different people** (a durable
record for those outside the product; a live surface for whoever is hitting the fault now), not one
purpose with a substitute, and neither interrupts. This is one of only two genuine parallel journeys
in the public corpus.

**Final customer channels:** `email` **and** `in_app`, together, labelled as two roles doing two
jobs — never as a priority chain. The card additionally names the **cohort** and the **state
change**, which is J's requirement and is what a reader of an incident canvas actually needs.

**Customer touch count:** **1 per instance** — that is, 1 per material state change. Unbounded across
an incident by construction, and bounded by the incident's own state machine rather than by a touch
budget. This is a better mechanism than a cap, and it is why the journey does not need one to
behave.

**Final flow:** graph unchanged apart from the two degenerate decisions being absorbed; only the
send card's channel presentation and the trigger's wording change.

**State re-checks:** `a.determine` is the re-read, and it runs before anything is scoped — what is
known, what is not, what action is needed, and the condition under which the next update happens.
There is no later touch inside an instance, so there is nothing to re-check before.

**Stop conditions:** `x.no-send` where nothing material changed and no commitment requires an update
— **recorded with a reason, not silently skipped**, which is a rare and valuable ending and must be
protected. `x.closed-comms` where the resolution notice reached the scope that was told, whose
`reEntry` is the best line in the set: *"a relapse is communicated as a relapse rather than as a new
incident, because the recipients were told it was over."*

**Ownership / handoff:** none, correctly. `a.communicate` explicitly raises the send through the
canonical communication mechanism rather than building a delivery path — that is a **dependency, not
a handoff**, and it must not be drawn as a channel. This journey owns what is said to an affected
cohort about one state change and nothing else: it does not own the incident, its containment or its
resolution, and it must not claim a fix it has not been told is authoritative (`c.verified` exists
for exactly that).

**Canonical changes needed:**
1. `orchestration.touches[t1].mandatory: false → true`.
2. Declare the send as parallel: `channelStrategy.simultaneous: { allowed: true, reason: "the email
   carries the record to recipients who are not in the product; the in-product surface reaches
   whoever is hitting the fault now. Neither substitutes for the other and neither interrupts." }`,
   with `channelRoles` left as the two roles they are.
3. Correct `audit/channel-orchestration-map.md`'s event-or-timeout roster to **exclude** INC-254
   (documentation, not canonical — but it is the item the design matrix is waiting on).
4. **Not** a wait node. Under any reading.
5. Flagged, out of scope here: give `measurement.businessOutcome` an event.

**Display-only changes needed:** absorb `c.cohort` and `c.verified` into the card they converge on,
listing them under *Represented canonical steps*. Keep `c.material` drawn — one of its arms sends
nothing at all. **Keep `c.final` drawn**: the message has already gone and both arms are exits, but
*"this is over for you"* versus *"there is more coming"* is the single most reader-relevant fact on
an incident canvas, and endings are never collapsed.

**Renderer changes needed:** K §4.1, `simultaneous` branch. **INC-254 is the regression test for it:
after the change this card must read as two roles doing two jobs and must not contain the word
*Fallback* / *Yedek* in either locale** — K's **H6_FALSE_FALLBACK** hygiene check, run on both
locales. K §4.4 / G9 for the two degenerate decisions. K P2-9 for the trigger card.

---

## REL-284 — Invitation Reminder

**Purpose:** Put a proposed link in front of the party who has to accept it, **on terms they can see
before they answer**, and close the question one way or the other before the invitation goes stale.
The subject is the *invitation*, not either party.

**Current flow:**
```
relationship_invitation_issued  (named counterparty, scope, direction, expiry)
  → Does the counterparty already exist here in their own right?
       Existing holder → Invitation  EMAIL + IN-APP
       New to us       → Invitation  EMAIL + IN-APP
  → Wait until invitation_accepted | invitation_declined | invitation_withdrawn
       timeout = the point at which one reminder would still leave time to act, measured back
                 from expiry (required, no default)
       event   → How was the invitation answered?
              Accepted           → Confirmation  EMAIL + IN-APP, TO BOTH SIDES → Exit: link active
              Declined/withdrawn → Exit: closed  (terminal: never revived)
       timeout → Is a reminder still worth sending?
              Time remains  → Reminder  EMAIL + IN-APP → Wait to expiry
              Window closed → Exit: expired unanswered
  → Wait to the invitation's own expiry
       event   → (the same answer condition)
       timeout → Exit: expired unanswered
```

**Problems found:**
- **The segment split is real, but the channel does not follow it — and it cannot.** `c.known`'s
  second branch is defined as *"the counterparty **has no record here** and knows the inviting party
  but not us"*. Someone with no record here **has no in-app surface.** Yet `a.invite-new` declares
  the identical roles as `a.invite-known`, and the card advertises an in-app route to a person who
  cannot be reached in the app. **A hard data error, not a judgement call**, and the signal that
  fixes it is in the branch's own `when` string.
- **`a.confirm` is `mandatory: false`.** `s.g3` (*"Scope and direction are stated in the invitation
  itself, not discovered after acceptance"*) and the action's own headline (*"An unstated scope is
  assumed to be total by whoever has less to gain from it"*) together make the confirmation the
  message that prevents the journey's worst failure. A discretionary budget must not be able to drop
  it.
- **`c.remind`'s "and no reminder has been sent for it" clause is dead.** `c.remind` is reachable
  only from `w.response`'s timeout, which fires once, and there is no edge back to it. Harmless;
  noted so an implementer does not build state for a guard that cannot fire.
- `c.known` forks into two message cards with an identical channel block (K P2-10) — which, after
  the fix, it will not.
- **Title vs scope.** *Invitation Reminder* names the third-most-important of four touches; the slug
  (`relationship-invitation`), the purpose, the entity note and the category all describe an
  invitation lifecycle.
- REL-284 is one of the eight public journeys TIM-268 defers to that say nothing back (I, P1-4).

**Final orchestration:** **segment-based**, opening a wait that is event-or-timeout, one single
reminder, and a dual-recipient confirmation. The segment earns its place three times over —
different *content* (an existing holder asks what accepting **costs** them; a stranger reads an
unexplained invitation as a claim already made), different *reachability* (only one of them has a
product session), and different *framing risk* — and it is currently doing only the first of the
three. **Making it also drive the channel is the change.**

**Final customer channels:** `a.invite-known` → **`email`**. `a.invite-new` → **`email`** (in-app is
impossible on this branch by the branch's own definition). `a.remind` → **`email`** — one reminder on
the route that already reached them, not a new channel and not an escalation. `a.confirm` →
**`email`, to both parties**. The invitation states scope, direction and what accepting would and
would not change, against an expiry: that is *terms*, and terms need a copy the recipient keeps. An
in-product inbox entry is a product surface, not a second send.

**Customer touch count:** **3 to the counterparty** (invitation, one reminder, confirmation) and **1
to the inviting party** (the confirmation). Matches `relationship_invitation.touches` = 3. Note the
confirmation is a **recipient** fan-out, not a channel fan-out — one message sent to each side.

**Final flow:**
```
Relationship invitation issued
  → Does the counterparty already exist here in their own right?
       Existing holder → Invitation · Email  (what accepting costs them, scope, direction, expiry)
       New to us       → Invitation · Email  (who is inviting, what this is, what it does and does
                          not claim — no in-app surface exists on this branch)
  → Wait (until accepted, declined or withdrawn — reminder point, measured back from expiry)
       → How was the invitation answered?
              Accepted           → Confirmation · Email · TO BOTH SIDES: the scope and direction
                                    both parties will be held to → Exit: link active
              Declined/withdrawn → Exit: invitation declined or withdrawn  (terminal)
       → Is a reminder still worth sending?
              Time remains  → Reminder · Email: who is waiting, and the date → Wait to expiry
              Window closed → Exit: expired unanswered
  → Wait to the invitation's own expiry
       → (the same answer condition)  /  Exit: expired unanswered
```

**State re-checks:** both waits re-read the invitation from the system of record before acting on the
timeout, which is what stops a reminder going out on an invitation the inviting party withdrew during
the response window. Correct and already there.

**Stop conditions:** `invitation_accepted`, `invitation_declined`, `invitation_withdrawn` — all three
in **both** waits' `until` sets, which is the right answer and is what RLT-279 gets wrong. Plus the
invitation's own expiry. `x.closed` is `terminal: true`: *a declined one is never revived.*

**Ownership / handoff:** none, and none needed. `distinctFrom` correctly separates REL-91 (which
decides whether a link has an authoritative basis) and SUB-161 (which owns an agreement with a term).
This journey must not state what the link *entitles* either party to beyond the scope written in the
invitation — that is the agreement's, not the invitation's. Plus the TIM-268 reciprocity below.

**Canonical changes needed:**
1. `orchestration.touches[t2].channelRoles` (`a.invite-new`): `["persistent","in-session"]` →
   `["persistent"]`. The counterparty has no in-app surface by the branch's own definition.
2. `orchestration.touches[t1].channelRoles` (`a.invite-known`) → `["persistent"]` and
   `[t4]` (`a.remind`) → `["persistent"]`: the reminder follows the invitation's route, and the route
   that is always available is the persistent one.
3. `orchestration.touches[t3].mandatory: false → true` (`a.confirm`), and `[t3].channelRoles` →
   `["persistent"]`.
4. **Reciprocity with TIM-268 (I, P1-4):** `suppressions +=` `CANONICAL_RULE` id
   `s.generic-reminder` with the standard text, plus a `distinctFrom` row naming TIM-268.
5. Cosmetic, recommended: `title.en` → *"Relationship Invitation"*, `title.tr` → *"İlişki Daveti"*.
   REL-284 is **not** one of the five ids `src/lib/journey-marketing.ts` hard-references, so nothing
   throws.
6. Optional cleanup: drop the dead *"and no reminder has been sent for it"* clause from `c.remind`
   branch 0's `when`.

**Display-only changes needed:** none. 13 canonical → 14 drawn, with two `x.expired` instances, is
per-parent instancing working correctly: each branch keeps its own ending beside it.

**Renderer changes needed:** K §4.1 — after fix 1 and 2 every card here has exactly one role and must
render its channel pill with no rank label at all.

---

## RLT-279 — Upgrade Blocker Reminder

**Purpose:** Tell the holder of a blocked target **the one specific thing** standing between it and
the change, while there is still enough preparation window left to clear it — and ask nothing of a
holder who cannot clear it.

**Current flow:**
```
target_held_on_named_prerequisite  (the blocker NAMED, not described; window time left)
  → Can the holder clear this blocker themselves?
       Theirs to clear → Name the blocker   IN-APP + EMAIL → Wait
       Not theirs      → Hold notice        IN-APP + EMAIL → Exit: held   [classed "success"]
  → Wait until named_requirement_satisfied | change_withdrawn
       timeout = the point past which the target cannot be made ready in time (required, no default)
       event   → What ended the wait?
              Blocker cleared  → Handoff: RLT-242
              Change withdrawn → Exit: moot
       timeout → Is a second prompt still worth sending?
              Time remains  → Last call  IN-APP + EMAIL → Wait to the window close
              Window closed → Exit: unprepared
  → Wait until named_requirement_satisfied        ←── change_withdrawn IS MISSING
       event   → Handoff: RLT-242  (direct, no condition)
       timeout → Exit: unprepared
```

**Problems found:**
- **`w.final.until` is `["named_requirement_satisfied"]` — `change_withdrawn` is missing.** `w.clear`
  listens for both; `w.final` listens for one. A change withdrawn *after* the last call cannot end
  the instance: it runs to the window close and exits `x.unprepared` — *"preparation window closed
  with the blocker outstanding"* — recording a target as unprepared for a change that no longer
  exists. `s.g4` says *"Not ready is not failed"*; this fails in the other direction. Structurally
  the same bug as the RET-30 `cancellation_confirmed` defect, which was fixed as a **P0**.
  `change_withdrawn` already exists in `src/canonical/events.ts` — no registry change needed.
- **`x.held` is classed `success`.** The state is *"held on a blocker the holder cannot clear"*, and
  the journey's `businessOutcome.event` is `named_requirement_satisfied`, which on this path is
  **structurally unreachable** — nothing is asked, nothing can be cleared, the instance ends.
  Classing it `success` puts every not-theirs-to-clear target into the success numerator.
- **`w.final.onEvent → h.resume` directly, with no condition.** Correct only while the wait listens
  for exactly one event; the moment `change_withdrawn` is added it would hand a withdrawn change to
  RLT-242 as "ready".
- **All three touches are `mandatory: false`.** `a.name-blocker` is the entire reason the journey
  exists — suppress it and the holder is never told why the target is held, the failure `s.g1` names
  — and `a.inform-hold` carries a fact nobody else will deliver. Only the last call is legitimately
  discretionary.
- **`Primary In-app / Fallback Email` on all three sends, and here the order is specifically wrong:**
  `a.name-blocker` and `a.last-call` both name *a date after which the change can no longer be
  applied* and ask for work done outside the product. An admin who does not log in during the
  preparation window never sees a console banner.
- The trigger reads *"Target held on named prerequisite"* (K P2-9).
- RLT-279 is one of the eight public journeys TIM-268 defers to that say nothing back (I, P1-4).

**Final orchestration:** **conditional routing** on who can act, then event-or-timeout with one gated
last call — and it stays in the TIM-268 / ACC-263 family of simple obligation reminders. `c.resolvable`
is a real business decision by every test: it changes the message, the number of touches (2 versus
1), **the channel**, whether anything is asked at all, and the ending. It is not an implementation
gate, its short arm records no suppression reason, and it must stay drawn.

**Final customer channels:** `a.inform-hold` (not theirs to clear) → **`in_app`**: nothing is asked
because there is nothing they can do (`s.g2`), and a statement with no action belongs where the
target is managed — the console where they would otherwise wonder why the change is held.
`a.name-blocker` → **`email`**: one prerequisite, real work to do, and a date after which the change
can no longer be applied in this window. `a.last-call` → **`email`**, same reason, one window later.
Resisted: SMS (this is an infrastructure change window, not a payment deadline), push, and any
escalation between the two prompts — `s.g3` requires both to name **the same blocker and the same
date**, so escalating the channel between them would contradict the content rule.

**Customer touch count:** **2** on the actionable path (name the blocker, then one last call) and
**1** on the not-theirs path (inform, ask nothing). There is no third: *a blocker nobody has cleared
twice is a decision, not an oversight.*

**Final flow:**
```
Target held on a named prerequisite
  → Can the holder clear this blocker themselves?
       Theirs to clear → Name the blocker · Email  (the one prerequisite, what clearing it
       │                  involves, and the date it stops mattering)
       Not theirs      → Hold notice · In-app  (held, and why — nothing asked)
                          → Exit: held on a blocker the holder cannot clear   [class: no-action]
  → Wait (until the prerequisite is satisfied OR the change is withdrawn — to the point past which
          the target cannot be made ready in time)
       → What ended the wait?
              Blocker cleared  → Handoff: Change Readiness (RLT-242)
              Change withdrawn → Exit: change withdrawn before the blocker was cleared
       → Is a second prompt still worth sending?
              Time remains  → Last call · Email (same blocker, same date) → Wait
              Window closed → Exit: preparation window closed with the blocker outstanding
  → Wait to the window's close (until satisfied OR withdrawn)
       → What ended the wait?   ← now SHARED with the first wait, instead of a bare handoff
       → Exit: preparation window closed with the blocker outstanding
```

**State re-checks:** both waits re-read the target before acting on the timeout, so the last call is
not sent against a blocker that cleared during the window. With the `c.cleared` re-route below, the
post-last-call path also re-reads *why* the wait ended instead of assuming.

**Stop conditions:** `named_requirement_satisfied` → the handoff; `change_withdrawn` → the moot exit,
**on both waits after the fix**; the preparation window closing → the unprepared exit.

**Ownership / handoff:** `h.resume → RLT-242 Change Readiness` (non-public; renders as a name, not a
link) carrying *"what the holder was told, so readiness is not announced to them twice"* — exactly
the kind of carry the corpus should be copying. `distinctFrom` correctly separates RLT-242 (which
owns the blockers) and RLT-241 (which owns scope). **This journey must not announce readiness or the
change itself** — it names one blocker and one date, and hands over the moment the blocker clears.
Plus the TIM-268 reciprocity below.

**Canonical changes needed:**
1. **P0-equivalent.** `w.final.until`: `["named_requirement_satisfied"]` →
   `["named_requirement_satisfied", "change_withdrawn"]`.
2. `w.final.onEvent`: `h.resume` → the **existing** `c.cleared`, whose question (*"What ended the
   wait?"*) and two branches are already exactly right. Two edges, no new node; the display node
   count drops by one because `h.resume@w.final` merges into `h.resume@c.cleared`.
3. `x.held.class`: `"success"` → `"no-action"` — nothing was asked and nothing could be done.
   (`invalid-state` is the defensible alternative; `no-action` is the recommendation.)
4. `orchestration.touches[t1].mandatory` (`a.inform-hold`) and `[t2].mandatory` (`a.name-blocker`):
   `false → true`. Leave `t3` (`a.last-call`) discretionary.
5. `channelRoles`: `t1 inform-hold` → `["in-session"]`; `t2 name-blocker` → `["persistent"]`;
   `t3 last-call` → `["persistent"]`.
6. **Reciprocity with TIM-268 (I, P1-4):** `suppressions +=` `CANONICAL_RULE` id
   `s.generic-reminder` with the standard text, plus a `distinctFrom` row naming TIM-268.

**Display-only changes needed:** none. After canonical fix 2 the display drops from 15 to 14 nodes
because the second `h.resume` instance merges — that is a consequence, not a display rule.

**Renderer changes needed:** K §4.1 — after fix 5 every card here has one role and renders its
channel pill with no rank label. K P2-9 for the trigger card.

---

## RSK-273 — Usage Limit Alert

**Purpose:** Meet somebody at the moment a limit stops them with the three facts that decide what
happens next — what the limit is, when it resets, and whether more capacity can be bought —
**without any of it reading as an accusation**.

**Current flow:**
```
limit_reached_and_action_blocked  (an AUTHORITATIVE usage figure AND an action actually blocked)
  → At the wall   IN-APP + EMAIL   (which limit, the usage against it, when the window resets)
  → What path exists from here?
       Capacity is purchasable → next
       Resets on its own       → Wait
       Neither                 → Exit: blocked
  → Does the person who hit the limit hold the capacity decision?
       Theirs to decide → Capacity offer         IN-APP + EMAIL → Wait
       Held elsewhere   → Offer to the holder    IN-APP + EMAIL  (DECISION HOLDER)
                           → Notice to the blocked party  IN-APP + EMAIL  (BLOCKED PARTY)
                              → Wait
  → Wait until capacity_authorised | limit_reset | held_action_abandoned
       timeout = attribute-bound to the AUTHORITATIVE window_resets_at; "No reset point is ever invented."
       → What changed?
              Capacity authorised → Handoff: SUB-166
              Window reset        → Reset notice  IN-APP + EMAIL → Exit: reset
              Still blocked       → Exit: blocked
```

**Problems found:**
- **`a.at-the-wall` and `a.offer-self` are two customer messages sent at the same instant, to the
  same person, on the same screen, with nothing between them but two internal reads.** *"You have
  hit X, it resets on Y, and here is the capacity that would release it now — which the reset would
  release for nothing anyway (`s.g3`)"* is **one** message.
- **`a.reset`'s recipient is unstated**, and it is the only one of the five sends that omits it, on
  the only path where it is ambiguous. The schema has no recipient field; the corpus expresses
  recipient in prose, and the other four do.
- **All five sends declare the identical `["in-session","persistent"]` roles** and render
  `Primary In-app / Fallback Email`, on the journey where the recipients are provably in different
  places: the blocked party is in-session by definition, the decision holder is a different party on
  the commercial side who was not in the product when the block happened, and the reset fires days
  later at somebody who left *because they were blocked*.
- **`a.notify-blocked-party` is `mandatory: false`.** It is not an offer — it is the fact that the
  decision now sits with a named person, which `s.g4` makes a rule.
- **`a.offer-holder → a.notify-blocked-party` is drawn as a sequential chain, which reads as
  "then".** They are a parallel pair to two different people, and the action's own headline says so:
  *"separate sends to separate people on separate routes, and either one can fail without the
  other."* The canvas cannot show it.

**Final orchestration:** **conditional routing** — on the path, and on who decides — containing one
justified **parallel pair**, resolved by event-or-timeout. Both conditions earn their place:
`c.path` changes the ending (purchasable / resets / neither), and `c.decider` changes **who is
written to**, which is the strongest form of a split. The parallel pair qualifies on the brief's
exact terms: two people, two different needs, neither interruptive. **Deliberately not done:**
splitting the reset notice into two would give the corpus its only *second* parallel pair and would
spend a touch telling somebody a wait they were not in has ended. And no urgency, no SMS: being at a
usage limit is not time-critical — the reset is a known future date and nothing is lost by waiting —
and `s.g1` forbids the vocabulary of urgency here outright.

**Final customer channels:**

| touch | recipient | channel |
|---|---|---|
| `a.at-the-wall` (now carrying the self-serve offer) | the blocked person | **`in_app`** — the trigger *is* an action being blocked in the product; they are in-session by definition |
| `a.offer-holder` | the decision holder | **`email`** — a different party, on the commercial side, making a spend decision that needs a record |
| `a.notify-blocked-party` | the blocked person | **`in_app`** — still at the wall |
| `a.reset` | **the blocked person** | **`email`** — fires at the authoritative reset, potentially days later, to somebody who left because they were blocked; the brief's own rule forbids relying on in-app alone to recover them |

**Customer touch count:** **3 per recipient, maximum.** Blocked person: wall notice → blocked-party
notice → reset notice on the held-elsewhere path; wall notice (carrying the offer) → reset notice on
the theirs-to-decide path. Decision holder: **1** — one offer.

**Final flow:**
```
Limit reached and action blocked
  → What path exists from here?
       Capacity is purchasable → Does the person who hit the limit hold the decision?
       │       ├─ Theirs to decide → At the wall · In-app: which limit, the usage against it,
       │       │                      when the window resets, AND the capacity that would release
       │       │                      it now — noting the reset would release it for nothing
       │       └─ Held elsewhere   → Offer to the decision holder · Email   ┐ two sends,
       │                             (what is blocked, for whom, what would  │ two people,
       │                              release it, the reset alternative, and │ together
       │                              that the ask lapses at the reset date) │
       │                             At the wall · In-app: the three facts,  ┘
       │                             and that the decision now sits with a named someone else
       ├─ Resets on its own → At the wall · In-app: the three facts, and that it resets on its own
       └─ Neither           → At the wall · In-app: the three facts
                              → Exit: at the limit with no route to more capacity in this window
  → Wait (until capacity is authorised, the window resets, or the held action is abandoned —
          to the AUTHORITATIVE window reset; no reset point is ever invented)
  → What changed?
       Capacity authorised → Handoff: Plan Change Validation (SUB-166)
       Window reset        → Reset notice · Email · TO THE PARTY WHOSE ACTION WAS HELD
                              → Exit: window reset, capacity available again
       Still blocked       → Exit: at the limit with no route to more capacity in this window
```

**State re-checks:** `w.capacity.recheck` re-reads the entity and its limit from the system of record
before the timeout is acted on, and `a.reset`'s own headline requires the reset to be *"taken from
the authoritative reset rather than an assumed clock"* — a re-check written into the message content
itself, which is the strongest form in the corpus. Nothing is sent on a guessed date.

**Stop conditions:** `capacity_authorised` → the handoff; `limit_reset` → the reset notice;
`held_action_abandoned`, which is in the `until` set, so an abandoned action stops the journey before
the reset notice — correct, because there is no held action left to release; neither, at the window's
close → the blocked exit.

**Ownership / handoff:** `h.capacity → SUB-166 Plan Change Validation` (non-public). `distinctFrom`
is unusually good and should be left alone: RSK-199 owns the block, the count and the reset — this
journey *"adds nothing operational"* — and RSK-193 restricts in response to risk, where routing a
limit through it *"is how ordinary usage gets treated as suspicion"*. **This journey must not price
or authorise capacity** (SUB-166's), **must not assert a reset date of its own** (RSK-199's), and
**must not tell the decision holder about a reset they were not waiting on** — on a reset the
holder's ask has simply lapsed, and `measurement.guardrails` already includes `message_after_success`.

**Canonical changes needed:**
1. **Merge `a.offer-self` into `a.at-the-wall`, and move the send to sit after `c.path` and
   `c.decider`** so the single wall message carries whichever of the four shapes applies (self-serve
   offer · decision held elsewhere · resets on its own · no route). `c.path` and `c.decider` stay
   drawn as the gates that decide what the merged message carries; `a.offer-self` is removed as a
   node and as touch `t2`. *(Arbitration: this is J's "required merge" and the domain audit did not
   address it. J is binding on whether two cards are one customer message, and its reasoning —
   two sends at the same instant to the same person on the same screen — is decisive. The touch
   counts above are stated with the merge applied.)*
2. **State the recipient of `a.reset`** in the node's `does` prose and in `touches[t5].purpose`:
   *"Tell the person whose action was held that the window has reset and the action can proceed…"*
   The content only makes sense to that person — the decision holder has no held action to resume —
   the instance is keyed on the entity and its limit, and `s.g4`'s "both parties are told" is
   already satisfied at the moment of the block by the offer/notice pair. A reset is not the
   capacity decision; it is the wait ending **without** one.
3. Add a suppression making that rule explicit and checkable: *"The reset notice goes to the party
   whose action was held. The capacity decision holder is not notified of a reset they were not
   waiting on."*
4. Extend `a.offer-holder`'s purpose so the offer states that **the ask lapses at the reset date** —
   one sentence, no node, no touch — so a holder does not authorise capacity for a wait that has
   already ended.
5. `orchestration.touches[t4].mandatory: false → true` (`a.notify-blocked-party`).
6. `channelRoles`: `a.at-the-wall` → `["in-session"]`; `a.offer-holder` → `["persistent"]`;
   `a.notify-blocked-party` → `["in-session"]`; `a.reset` → `["persistent"]`.

**Display-only changes needed:** none structural. The Family B collapse of `w.capacity` into
`c.outcome` (*"Until additional capacity is authorised / What changed?"*) is one of the
provably-safe merges and reads well; keep it.

**Renderer changes needed:** K §4.1 — after fix 6 every card here has exactly one role and renders
its channel pill with no rank label. Plus a **generic two-recipient treatment**: where two
communication actions are joined by a single edge and their `Touch.purpose` names different
recipients, the pair renders as one moment with two destinations rather than as a "then" chain. No
new node type, and the rule reads only fields the whole corpus carries — never a journey id.

---

## Summary table

| ID | before pattern | after pattern | channels | touches | biggest change |
|---|---|---|---|---|---|
| TIM-61 | event-or-timeout, 4 unresolved channels | **event-or-timeout (looping) + conditional routing** | email · sms (final threshold) | 1 per policy threshold | WhatsApp and push dropped; the threshold becomes a visible routing branch |
| TIM-63 | conditional + single + event-or-timeout | **conditional routing** | email | 1 | the 4-channel prompt becomes email; `a.actor` keeps its card |
| TIM-268 | single + event-or-timeout + conditional | **event-or-timeout** | email | 2 | SMS off all three touches; cap 3→2; `w.due` renamed a timed wait with a re-read |
| TIM-274 | conditional + sequential + event-or-timeout | **combination** (with one parallel touch) | email · **email+sms on the last call** | 3 | `entity_terminated` added to `w.final.until`; two new re-reads |
| TIM-281 | 4-way conditional + single + event-or-timeout | **conditional routing (4-way)** | attempt surface: in_app else email | 2 | the answer is delivered where the question was asked; `a.establish` keeps its card |
| ACC-261 | conditional + event-or-timeout | **conditional routing** | email | 2 | the "nothing you can do" arm stops dead-ending; a permanent-restriction ending added |
| ACC-263 | segment + event-or-timeout | **segment-based** | email · **in_app on the familiar arm** | 2 | the reminder half is made reachable at all (own reminder-point Config) |
| IDN-84 | conditional routing | **conditional routing** | in_app · email (terminal) | 1 | a customer-facing statement added to the our-fault arm; `a.backoff` drawn |
| IDN-271 | parallel + event-or-timeout | **parallel** | email + sms together | 2 | `simultaneous` finally read; one copy clause; `c.route` protected by a gate |
| FIN-134 | conditional + event-or-timeout + conditional | **combination** (with one parallel touch) | email · **email+sms on the reminder** | 3 | five reciprocal rows and `s.subject` — the bound on what it may say about what the money was for |
| FIN-302 | single + event-or-timeout | **event-or-timeout** | email | 2 | a withdrawal mid-window stops being told as a reconciliation |
| DOC-214 | single | **single** | email | 1 | **none** — it stays one touch, and the `Primary` label over one channel goes |
| DOC-215 | event-or-timeout + gated reminder | **event-or-timeout** | email | 2 per signer | the one reminder becomes per-signer, so a later signer under an order can be reminded |
| INC-254 | "Primary email / fallback in-app" | **parallel** | email + in_app together | 1 per instance | the card stops asserting the opposite of the journey's design; no wait added |
| REL-284 | segment + event-or-timeout | **segment-based** | email | 3 counterparty / 1 inviter | in-app removed from a branch where the recipient has no in-app surface |
| RLT-279 | conditional + event-or-timeout | **conditional routing** | in_app (hold) · email (prompts) | 2 / 1 | `change_withdrawn` added to `w.final.until`; `x.held` reclassed off `success` |
| RSK-273 | conditional + parallel pair + event-or-timeout | **conditional routing** | in_app · email (holder, reset) | 3 per recipient | two same-instant sends merged into one wall message; the reset's recipient stated |

**Pattern distribution (17):** conditional routing **6** · event-or-timeout **4** · parallel **2** ·
segment-based **2** · combination **2** · single **1**. **Fallback: 0** — no stage in this part is a
genuine fallback, and every "Primary/Fallback" card here is a renderer artifact over data that does
not say it.

**Sections whose `Canonical changes needed` is legitimately `none` or `none to the graph`: 1** —
DOC-214 (one optional cosmetic field that the renderer fix makes moot). Two more are close and are
not padded to look busier: IDN-271 is one copy clause plus one documentation row, and TIM-281 is one
`writes` declaration plus a per-route channel statement, with `competition: "none"` explicitly left
alone.

**Sections whose `Display-only changes needed` is `none`: 6** — TIM-274, TIM-281, FIN-302, REL-284,
RLT-279, RSK-273.
**Sections whose `Renderer changes needed` is `none`: 0.** Every journey here is touched by the same
two generic rules (`ChannelPriorityRow` and the wait card), which is the finding, not an oversight.
