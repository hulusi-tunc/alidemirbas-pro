# Journey blueprints — the 52 public journeys

Business-design review of every journey in `audit/public-journey-scope.md`, worked from
`production/canonical-dump.json`. Facts stated without a marker are **in the canonical data
today**. Anything I am recommending is marked **PROPOSAL** and says what the current data gets
wrong.

Counts below are *touches reachable on one path for one recipient*, not the number of
communication nodes in the graph — several journeys hold mutually exclusive branch messages that
can never both fire.

---

## Flagged issues

### F1 — RET-24 has no customer-facing communication stage at all

Confirmed against the data. `channels: ["task"]`, zero `execution: "communication"` nodes, one
`execution: "human"` node (`a.owner-task`). Every exit from the journey is either an internal
record or a handoff.

Evidence, exactly as the graph has it:

| Path | Where it ends | Who ever hears anything |
|---|---|---|
| Cancellation intent already on record | `h.cancellation` → **RET-28** | RET-28's ask/offer |
| Risk has a named operational cause | `h.resolve-first` → RET-23 *(not public)* | RET-23 |
| Evidence strong, no higher-precedence claim | `a.owner-task` → `h.human` → `external:human-in-the-loop-lifecycle` | a person, off-journey |
| Evidence thin, proportionate automation exists | `h.intervention` → **RET-30** (mints a fresh `retention_episode_id`) | RET-30's follow-up |
| Nothing proportionate, or FBK-46 already claims the account | `x.monitor` | nobody |

So RET-24 is a **routing and proportionality decision**, not a conversation. It is correctly
designed as one: its whole guardrail set ("a risk score is not the outcome", "the size of the
intervention tracks the strength of the evidence") is about *not* messaging on thin evidence.
The collision the scope file records is real and it is with the channel rule, not with the design.

**The options, not a decision:**

1. **Keep it public and exempt it from the channel rule**, on the stated ground that its product
   value is the decision, and re-label the surface as "task / internal routing" rather than
   showing a `task` channel badge. Costs: the rule stops being universal, and the library shows a
   journey a reader cannot receive.
2. **Keep it public and give it a customer-facing branch.** The only honest candidate is the
   `c.automated` → `h.intervention` path, where an automated intervention is already judged
   proportionate. Costs: RET-30 *already owns* delivering and closing that intervention; adding a
   touch here would put two journeys on one retention episode, which is exactly what RET-24's own
   `c.priority-clear` exists to prevent. I do not recommend this.
3. **Keep it public and render it with no channel badge**, stating on the page that this journey
   decides and hands off rather than sends. Costs: none to the graph; it needs the display layer
   to tolerate an empty channel set, and the channel rule restated as "a public journey declares
   only real customer channels" rather than "must declare at least one".

Option 3 is the only one that changes nothing about the canonical design and breaks no other
rule. It is a product/display call, not mine to take.

### F2 — ACQ-287 and ACQ-288 are not vNext journeys and sit below the other 50

Of the 52, exactly these two have **no** `eligibility`, `suppressions`, `implementation`,
`measurement`, `discovery`, `contact`, `channelStrategy` or `orchestration`. They carry only
`entity` (with **no `instanceKey` and no `concurrency`**), `guardrails`, `reusableRule` and
`distinctFrom`.

Consequences that are not cosmetic:

- No `contact.competition`, so they are **absent from the `commerce-recovery` exclusion group**
  that ACQ-11, ACQ-12, ACQ-13, RET-31 and SCH-282 all use to decide who wins when several fire on
  one person. Nothing suppresses them and they suppress nothing.
- No `cooldown`, so a repeat abandoner can be re-entered indefinitely.
- No `instanceKey`, so "one cart instance" is prose in `entity.note` rather than a key.
- No `measurement`, so by the repo's own vNext rule the validator treats their warnings as
  warnings rather than errors — they are the two least-enforced journeys in the public set.

**PROPOSAL:** migrate both to the vNext contract before they ship, at minimum
`entity.instanceKey` + `concurrency`, a `contact` block joining `commerce-recovery` beneath their
generic parents, and `measurement`.

### F3 — ACQ-287/ACQ-288 promise a three-touch cascade and deliver two

`ACQ-287.reusableRule` and both journeys' `distinctFrom` describe "a fixed three-touch cascade".
The graphs contain **two** reminders each (`a.reminder1`, then `a.reminder2-hv`/`a.reminder2-std`).
`w.third` runs out and goes straight to `c.completed3`/`c.purchased3` → `x.abandoned`. There is no
third touch anywhere in either graph.

Either the prose is wrong or a touch is missing. Given the surrounding design (ACQ-11 tops out at
three including an *optional* final notice, ACQ-12 at two), **PROPOSAL: fix the prose to "two
reminders then an abandonment check"**, not the graph. Two touches is the right answer for a cart;
a third is the thing ACQ-11 makes conditional on the platform asserting a real expiry.

### F4 — Four pairs of journeys own the same lifecycle state

**F4a — ACQ-11 vs ACQ-287 (abandoned checkout), and ACQ-12 vs ACQ-288 (held cart).** Materially
wrong as it stands.

ACQ-11's own entity scope names "the basket-and-checkout" as its subject and its trigger is "an
authoritative record that a resumable process opened". A `checkout_started` event satisfies that
exactly. ACQ-12's trigger is "one or more items placed in a selection" and its `entity.note` names
"a cart". `item_added_to_cart` satisfies that exactly. Both concrete journeys would fire on the
same event as their generic parent, on the same person, about the same items.

`distinctFrom` explains the difference as *authoring* intent ("the general-purpose pattern" vs
"the concrete implementation"). That is a statement about the library, not a runtime rule, and
there is no suppression on either side — the concrete pair has no `contact` block at all (F2), and
the generic pair's `commerce-recovery` precedence ladder does not name them.

Worse, the two chains mirror each other: ACQ-12 → ACQ-11 on process start; ACQ-288 → ACQ-287 on
checkout start. A single cart-then-checkout session runs **four** instances and up to **ten**
messages.

**PROPOSAL (two viable shapes, pick one):**
- *Specialisation:* make ACQ-288/ACQ-287 explicit specialisations — add them to
  `commerce-recovery` with precedence **above** ACQ-12/ACQ-11 respectively and `onLoss: suppressed`
  on the generic pair, so a company that adopts the cart/checkout pair automatically mutes the
  generic ones for commerce entities. ACQ-11/ACQ-12 keep covering applications, quotes,
  registrations and saved lists, which is what they are actually for.
- *Presets:* demote ACQ-288/ACQ-287 to `discovery.presets` of ACQ-12/ACQ-11. Cleanest
  conceptually, but the scope file fixes all four as journeys, so this is out of bounds unless the
  scope decision is reopened. Noted for completeness only.

**F4b — TIM-268 vs TIM-61 (a customer-owed obligation with a due date).** Both keyed on
`["obligation_id"]`, both `one-active-per-key`, both send a pre-deadline reminder about the same
obligation and both branch on what the deadline's passing means. Both declare
`competition: "none"`. Neither `distinctFrom` mentions the other — TIM-268 distinguishes itself
from FIN-131 and REM-153, TIM-61 from TIM-63.

They *are* different: TIM-61 is the deadline's **state machine** (five named outcomes, routes to
TIM-62/OWN-55/TIM-64, reminder is optional and policy-defined), TIM-268 is the **customer-facing
reminder plan** (reminder → confirmation-or-overdue-notice → consequence owner). That is a clean
split. It is simply nowhere in the data, and with an identical instance key both will open on one
obligation.

**PROPOSAL:** add reciprocal `distinctFrom` entries and a shared exclusion group on
`obligation_id` — TIM-61 owns the state, TIM-268 owns the sending, and TIM-61's `a.remind` should
either defer to TIM-268 or TIM-268 should be suppressed where TIM-61 governs the same obligation.
One of the two has to be the sender.

**F4c — FUL-146 vs FUL-265 (a late obligation), already resolved.** Both keyed on
`obligation_id`. Resolved explicitly and well: FUL-146's fifth suppression cedes in-transit slips
to FUL-265, and FUL-265's sixth cedes pre-dispatch slips to FUL-146. Listed here only as the
pattern F4a and F4b should follow.

**F4d — FBK-41 vs FBK-42, and the retention family, already resolved.** FBK-41/FBK-42 share an
`outbound-ask` exclusion group scoped to `communication-purpose`, with advocacy winning and
satisfaction recorded as not-now. RET-28 > RET-24 > RET-30 > ACT-18/RET-32 is a declared
precedence ladder in `retention-outreach`. ACT-12 carries `preemptedBy` naming ACT-16, ACT-13 and
ACT-14. These are the models.

### F5 — Smaller things that look wrong in the data

| # | Journey | What |
|---|---|---|
| F5a | **ACT-17** | `t.activated` goes **straight to `a.recognize`**, a communication, with no eligibility or send-gate node between them — while its own suppression says "no touch without permission for lifecycle communication". Every comparable journey has a `c.sendable`/`c.eligible` node first. **PROPOSAL: insert one.** |
| F5b | **ACT-17** | Touch budget cannot hold: `localCap` default is 4, but the reachable maximum is recognition (1) + next-action (1) + `adoption.nudge_budget` (default 3) = **5**. **PROPOSAL: raise the cap to 5 or lower the nudge budget to 2.** |
| F5c | **ACQ-09** | `contact.localCap` is described as "the number of educational touches inside the bounded window", and the objective promises "a window of useful education" — but the graph sends **one** email and then waits out the whole window. Orchestration agrees with the graph (one touch, `single-notice`). **PROPOSAL: fix the objective and cap prose to say one touch**, which is also the better design: a bounded window with one honest, reason-matched message beats a drip. |
| F5d | **FUL-146, FUL-148** | Zero exits. Every ending is a handoff, and **every target is outside the public 52** (FUL-144/145/150/147, OWN-55, plus REM-151 for FUL-148). A public reader of FUL-146 sees a journey with no visible ending at all. Not wrong canonically — it is wrong for a library page. **PROPOSAL: no graph change; the detail page needs a stated "ends by handing off to …" treatment.** Same applies to SUB-163, whose four handoffs are all non-public. |
| F5e | **FUL-265** | `x.unresolved` is a **handoff node with an exit-style id**, and `measurement.journeyOutcome.refs` lists it beside real exits. Cosmetic but it will read as an exit on any page that keys off the id prefix. **PROPOSAL: rename to `h.unresolved`.** |
| F5f | **RSK-273** | The only journey whose longest path reaches **four** touches — but two of them (`a.offer-holder`, `a.notify-blocked-party`) go to *different people*. Per recipient it is at most three. The recipient of `a.reset` is not stated where the decision was held elsewhere. **PROPOSAL: state which party the reset notice goes to.** |
| F5g | **ACT-13, FBK-43, FBK-49** | Declare `task` in `channels` alongside `email`/`in-app`. In all three the `task` node is `execution: "human"` internal routing, never a customer message. Exactly the badge problem the scope file already records; the graphs are correct. |

---

## 1 · Acquisition, intent & qualification — 7

**ACQ-11 · Abandoned Process Recovery** — `abandoned-process-recovery` · email, push, in-app, sms
- **Trigger** `process_started` (authoritative) — a resumable process opened with ≥1 item, a resume destination and a last-activity time. A cart page view is not enough.
- **Entity / state** the *logical* process (basket-and-checkout, application, quote, registration), `person_id + logical_process_id`, one active per key. A rotated platform id still resolves to the one open instance.
- **Objective** bring them back to *this* process and let them finish it, claiming nothing the system does not assert.
- **Success** `x.converted` — an order or completion recorded against the process, by any channel.
- **Terminal** converted · invalid (cancelled/expired/emptied) · superseded by a newer process · no-action (gate recorded) · lapsed (lifetime passed, still open) · handoff to FIN-134.
- **First wait** 30–60 min from `last_activity_at` — long enough that they have left the process rather than paused inside it, short enough that the intent is still fresh.
- **Later waits** ~20–28 h from the previous touch → touch 2; one re-armed 30–60 min wait if they return and leave again (budget 1); recovery lifetime 3–7 days from trigger → final notice; then until the platform's own `expires_at`.
- **Decisions that matter** is it recoverable at all · what is the process *now* (5 outcomes) · did they come back and leave again · is there a real expiry to name for a final notice.
- **State re-checks** every wait re-reads the process from the system of record; `c.state`, `c.state2`, `c.state3`, `c.close` each re-ask before any send.
- **Customer touches** up to **3** — items + resume link; likely blocker (shipping, returns, trust); optional final notice, only where the platform asserts an expiry.
- **Max duration** the recovery lifetime (3–7 days), hard-capped at the platform's own expiry.
- **Stops when** completed, cancelled, emptied, superseded, payment fails, permission absent, cooldown in force, or a higher-precedence journey contests.
- **Handoff** → **FIN-134** on `payment_failed`, suppressing every queued recovery touch. Carries the process, its items and the obligation.

**ACQ-12 · Abandoned Selection Recovery** — `abandoned-selection-recovery` · email, push, in-app
- **Trigger** `selection_recorded` — items placed in a cart or saved list, with their current availability and price.
- **Entity / state** the recorded selection, `person_id + selection_id`, one per key. A selection has *no process state and no expiry* — that is the whole distinction.
- **Objective** show the selection as it currently stands and let them act; never show an unavailable item.
- **Success** `x.converted` — an order including any selected item.
- **Terminal** converted · invalid (cleared) · unavailable (every item gone) · no-action · lapsed · handoff to ACQ-11.
- **First wait** 1–4 h from last selection activity (a *saved list* wants far longer — noted as a preset).
- **Later waits** 2–4 days → touch 2; lifetime 7–14 days → lapse. Edits re-arm the first wait up to twice.
- **Decisions that matter** what is the selection now (converted / cleared / carried into a process / changed / unchanged) · can any of it still be acted on · may the touch go out.
- **State re-checks** every wait re-reads items, availability and price, plus whether a process opened.
- **Customer touches** **2** — the selection as it stands; then the same with any genuine availability or price change the platform asserts.
- **Max duration** 7–14 days. **Correctly has no final notice** — there is no honest deadline to name.
- **Stops when** an order is recorded, the selection is cleared, every item goes unavailable, or a process starts.
- **Handoff** → **ACQ-11** the moment a process starts from the selection; carries touches already sent so the process plan counts them.

**ACQ-288 · Cart Abandonment Recovery** — `cart-abandonment` · push, email, whatsapp, sms
- **Trigger** `item_added_to_cart` (authoritative).
- **Entity / state** one cart instance. ⚠ **no `instanceKey`, no `concurrency`** (F2). Refilled after clearing = a new instance, per prose only.
- **Objective** return a person who added to cart but did not start checkout; reach for a more direct channel on high-value carts; hand off the instant checkout starts.
- **Success** `x.purchased`.
- **Terminal** purchased · cleared/expired · abandoned (cascade ran out) · handoff to ACQ-287.
- **First wait** 2 h from the trigger — past a still-browsing session, while the cart is warm.
- **Later waits** 20–24 h → touch 2; 48 h → abandonment check.
- **Decisions that matter** is the cart still active · is the purchase already done · has checkout started · **is this a high-value cart** (the only genuinely business-driven split — a configured threshold, never a number the journey asserts).
- **State re-checks** purchase and checkout-start re-checked immediately before every touch (`c.purchased1/2/3`, `c.checkout1/2`).
- **Customer touches** **2** (⚠ prose claims three — F3): push→email; then WhatsApp→SMS for high-value, push→email otherwise.
- **Max duration** ~3 days.
- **Stops when** purchased, cart cleared or expired, or checkout starts.
- **Handoff** → **ACQ-287** on checkout start, suppressing every queued cart reminder.
- ⚠ **Owns the same state as ACQ-12 with nothing arbitrating** (F4a).

**ACQ-287 · Checkout Abandonment Recovery** — `checkout-abandonment` · push, email, whatsapp, sms
- **Trigger** `checkout_started` — a checkout record with ≥1 item and a resume destination.
- **Entity / state** one checkout instance. ⚠ no `instanceKey`/`concurrency` (F2). A restart is a new instance.
- **Objective** return a person who started checkout and did not finish.
- **Success** `x.purchased`.
- **Terminal** purchased · abandoned.
- **First wait** 45 min — past someone mid-payment or mid-form, while the checkout is warm. Correctly shorter than ACQ-288's 2 h: checkout intent decays faster than cart intent.
- **Later waits** 6 h → touch 2; 24 h → abandonment.
- **Decisions that matter** is it completed (asked before *every* touch) · is this a high-value checkout.
- **State re-checks** `c.completed1/2/3`, each immediately before the next step.
- **Customer touches** **2** (⚠ prose claims three — F3).
- **Max duration** ~31 h.
- **Stops when** completed.
- **Handoff** none. ⚠ **Owns the same state as ACQ-11 with nothing arbitrating** (F4a).

**ACQ-09 · Lead Nurture** — `bounded-education-progress-or-sunset` · email, in-app
- **Trigger** `valid_lead_not_destination_ready` (declared) — a captured lead with a recorded entry reason and no destination it is ready for.
- **Entity / state** the lead held *against the reason they entered*, `lead_id`, one per key.
- **Objective** spend one bounded window trying to advance a not-yet-ready lead, and close it whether or not it worked.
- **Success** a progression signal → `h.progressed`.
- **Terminal** no-basis (no permission — the ordinary case) · permission-ended · unreachable · sunset · handoff to ACQ-03.
- **First wait** the bounded education window itself, fixed at entry, `required: true`, measured from the trigger.
- **Later waits** none. One window, one end.
- **Decisions that matter** **is there explicit permission and a lawful basis** — the single load-bearing gate; submitting a form is not consent · what ended the wait (progressed / permission withdrawn / route lost).
- **State re-checks** the lead is re-read before the timeout is acted on.
- **Customer touches** **1** — education matched to the recorded entry reason. ⚠ prose implies more (F5c).
- **Max duration** the window, and engagement inside it never extends it.
- **Stops when** the window closes, permission stops covering it, or no permitted route is deliverable.
- **Handoff** → ACQ-03 *(not public)* carrying the entry reason and what was already sent.

**ACQ-285 · New Lead Welcome** — `captured-interest-first-touch` · email
- **Trigger** `first_party_interest_captured` (declared) — a capture with the context the person stated, a contact point they gave, and the permission position recorded **as its own fact**.
- **Entity / state** the individual capture and what it asked for, `capture_id`, one per key. A second request is its own instance.
- **Objective** answer a declared interest with the thing that interest actually asked for, and carry it no further than what they said justifies.
- **Success** `x.delivered` (fulfilled) or `h.person` (a request only a person can answer) or a declared destination inside the nurture.
- **Terminal** no-delivery-route · stopped (terminal, at the person's request) · sunset · delivered · handoff to sales assignment.
- **First wait** none before the first touch — fulfilment travels on the request itself, which is correct.
- **Later waits** the stated length of the bounded sequence, `required: true`, from the previous touch.
- **Decisions that matter** is the destination they supplied usable · **what did they actually declare** (a person, or the material) · **is there permission to continue past fulfilment** — the separation of submission from consent is the whole journey.
- **State re-checks** the capture is re-read before the sequence timeout is acted on.
- **Customer touches** max **2** on a path — fulfilment, then a bounded sequence *only* where permission exists. (A third node exists on the person-request branch and is mutually exclusive.)
- **Max duration** the stated sequence length, named when it opens.
- **Stops when** the person withdraws permission, the sequence's stated end arrives, or the request is fulfilled with no ongoing permission.
- **Handoff** → `external:sales-assignment` carrying what they declared in their own terms, what was already sent, and what the permission does and does not cover.

**ACQ-13 · Unresolved Interest Recovery** — `unresolved-interest-recovery` · email, push, in-app
- **Trigger** `interest_signal_recorded` (**behavioural**) — attributed, repeated, recent attention that ended in neither a selection nor a process.
- **Entity / state** an inferred interest, `person_id + interest_key`, one per key.
- **Objective** bring someone back to the thing they looked at, **once**, and leave everyone else alone.
- **Success** `x.resolved` — a selection, process or purchase for the subject; its own journey then owns it.
- **Terminal** resolved · unavailable · **no-action (the common outcome by design)** · lapsed.
- **First wait** 12–48 h from `last_interest_at` — attention that is still going on is not unresolved.
- **Later waits** an observation-only window of 3–7 days after the touch. No second touch to time.
- **Decisions that matter** **does this attention qualify as interest at all** (a stated rule stands between every signal and every instance) · is it still unresolved and is the subject still available · may the touch go out.
- **State re-checks** `c.qualify`, then `c.state` before the touch, then the post-touch wait re-reads selection/order/process records.
- **Customer touches** **1**. Correctly none after: "nothing the person did asked for a second."
- **Max duration** ~2 days to the touch + 3–7 days observing.
- **Stops when** a selection, process or purchase is recorded; the subject goes unavailable; the person already holds it; permission is absent; or anything higher in `commerce-recovery` contests.
- **Handoff** none — resolution is an exit, because the owning journey picks it up on its own trigger.

---

## 2 · Activation, onboarding & early value — 7

**ACT-17 · Adoption Nurture** — `early-adoption-to-stable-use` · email, in-app
- **Trigger** `core_activation_completed` — an activation *with the artifact or result produced*, so recognition can name it. A login or a finished checklist is explicitly not enough.
- **Entity / state** account + use-case, `account_id + use_case_id`, one per key. Adoption is measured against the use-case that produced first value, never the product's full surface.
- **Objective** turn one activation into repeated value in the same use-case.
- **Success** `h.normal` — value produced repeatedly at the rhythm the use-case implies.
- **Terminal** **no exits at all**: `h.normal` → `external:customer-lifecycle`, or `h.stall` → ACT-18.
- **First wait** none before the first message (⚠ F5a — and no permission gate either); the first wait is `w.observe`, set to *the product's own intended usage rhythm*, `required: true`. A weekly and a twice-a-year product cannot share it.
- **Later waits** the same observation window, re-armed per nudge against a fixed budget (default 3).
- **Decisions that matter** does a natural next action genuinely follow from what they produced · **has adoption become stable** (the only exit condition that matters).
- **State re-checks** `w.observe` re-reads *value-producing usage from the product's own record — not activity, not logins*.
- **Customer touches** recognition + one next-action + up to 3 nudges = **up to 5** ⚠ against a declared cap of 4 (F5b).
- **Max duration** one observation window per nudge, bounded by the nudge budget.
- **Stops when** value repeats at the expected rhythm (stable), or the window closes without it (stall).
- **Handoff** → `external:customer-lifecycle` on stabilising (carries the settled rhythm) · → **ACT-18** on stall (carries what was produced, when it stopped, and the pattern it was measured against).

**ACT-18 · Adoption Recovery** — `adoption-stall-diagnosis` · email, push
- **Trigger** `expected_adoption_pattern_not_met` (behavioural) — against *this product's* intended rhythm. A normal gap for a seasonal product is not a stall.
- **Entity / state** account + the use-case that stalled. A stall in one use-case is not a stall in the account.
- **Objective** diagnose why value stopped and address that specific blocker **once**, or record honestly that there is nothing to address.
- **Success** `h.adoption` — value produced again, back to ACT-17.
- **Terminal** satisfied (the need was genuinely met — "this account did not fail, it finished") · no-intervention · handoffs to ACT-17, health monitoring, human assistance.
- **First wait** none — diagnosis happens first, which is the point. `w.recover` follows the touch, drawn from the product's own rhythm, `required: true`.
- **Later waits** none.
- **Decisions that matter** **what does the evidence actually show** — recoverable blocker / needs a person / need genuinely met / **no evidence of a problem**. The last two are the ones most journeys of this type omit.
- **State re-checks** `w.recover` re-reads value-producing usage from the product's own record.
- **Customer touches** **1**, addressing the named blocker. "A second touch on the same diagnosis is pressure, not help."
- **Max duration** one recovery window.
- **Stops when** the need is met, nothing names a problem, a person takes it, or the recovery window closes.
- **Handoff** → ACT-17 (recovered) · → `external:health-monitoring` (window closed; explicitly carries "this is reduced usage, not a churn decision") · → `external:human-in-the-loop-lifecycle` (technical blocker).

**ACT-20 · Dormant Lead Reactivation** — `dormant-non-customer-reactivation` · email, push
- **Trigger** `engaged_non_customer_became_dormant` (behavioural) — past the inactivity threshold defined *for this context*.
- **Entity / state** lead + context, `lead_id + context_id`. Dormancy is per context.
- **Objective** one bounded attempt to restart a relationship that never became a paying one, judged on what they actually did.
- **Success** `meaningful_return` → routed by what they returned into.
- **Terminal** win-back (terminal — out of scope, belongs to RET-32) · no-reason · engagement-only · sunset · handoffs to ACT-12 / ACQ-03 / ACQ-05.
- **First wait** none before the attempt; `w.return` is the reactivation window, `required: true`, from the touch.
- **Later waits** none.
- **Decisions that matter** **has this ever been monetised** (the hard scope boundary against RET-32) · **is there a credible reason to come back** — a specific one, not "we miss you" · **what state did they actually return into**.
- **State re-checks** `a.inspect` runs before anything is declared: opening the message is not returning.
- **Customer touches** **1**, built on the recorded reason.
- **Max duration** the reactivation window, then a required cooldown.
- **Stops when** no credible reason exists, permission lapses, the window closes, or any current lifecycle outranks it (`lifecycle-stage`, `onLoss: exit`).
- **Handoff** → ACT-12 (returned into unfinished setup) · → ACQ-03 (stronger intent) · → ACQ-05 (no current qualification). Only ACT-12 is public.

**ACT-13 · Onboarding Blocker Reminder** — `activation-blocker-resolution` · email, in-app, ~~task~~
- **Trigger** `activation_blocked_by_named_requirement` — a *specific* unmet requirement. An empty optional field is not one.
- **Entity / state** the blocking requirement against the account, `account_id + requirement_id`. Two blockers are two instances, "because they may be resolved by different people at different times."
- **Objective** aim the whole journey at one named missing thing and resume onboarding once it exists.
- **Success** `h.resume` → ACT-12, or `x.next-blocker` (success class: this one cleared, another now blocks).
- **Terminal** not-blocking · next-blocker · blocked (no route) · handoffs to ACT-12 / human lifecycle / ACT-11.
- **First wait** `w.resolve`, the resolution horizon appropriate to *this* requirement, from the trigger, `required: true`. A settings-screen requirement and a third-party one "do not deserve the same patience."
- **Later waits** none.
- **Decisions that matter** **does this actually block activation** · **can the account resolve it directly, or does it depend on someone else** · what does an unresolved requirement warrant (escalate / reroute / no route).
- **State re-checks** `w.resolve` re-reads the requirement; `a.stop-reminders` kills queued sends the instant it is satisfied.
- **Customer touches** **1** — the one specific action that clears it. The second "touch" in the plan is an internal task (F5g), not a message.
- **Max duration** the resolution horizon.
- **Stops when** the requirement is met (reminders stop immediately, including queued ones), or the horizon passes.
- **Handoff** → **ACT-12** on resume · → human lifecycle on escalation (suppresses automated reminders while a person holds it) · → ACT-11 *(not public)* on reroute.

**ACT-14 · Onboarding Help** — `struggling-user-assistance` · email, in-app, push
- **Trigger** `help_seeking_without_activation_progress` (behavioural) — repeated help-centre visits / returns to the same page / failed attempts, **and** no activation progress behind it.
- **Entity / state** the open onboarding or trial instance, `account_id + person_id`. A previous bad trial qualifies nobody.
- **Objective** offer help to someone visibly trying and getting nowhere, and stop asking once they have answered.
- **Success** `h.activated` → ACT-16, or `x.normal`.
- **Terminal** not-eligible · deferred · declined · no-outcome · normal · handoff to ACT-16.
- **First wait** `w.response`, a bounded response window from the offer, `required: true` — "no answer is an answer, and it does not license asking again in the same terms."
- **Later waits** `w.session` = the scheduled session time plus a short grace.
- **Decisions that matter** are the hard entry conditions met · **is a person already working this same blocker** (explicitly names ACT-13's named requirement — "a help offer beside a blocker reminder is two voices on one problem") · what did they do · is there one genuinely useful follow-up left.
- **State re-checks** both waits re-read the instance before acting on the timeout.
- **Customer touches** **3** on the booked path (offer → confirm → one follow-up); **2** on the silent path (offer → one final self-service option). Guardrail caps it: "the offer is made at most twice."
- **Max duration** response window + session + grace.
- **Stops when** they book, activate, decline (cooldown), or the session produces no outcome.
- **Handoff** → ACT-16 *(not public)* on activation, carrying whether assistance was involved.

**ACT-12 · Onboarding Nurture** — `onboarding-progress-next-step` · email, in-app
- **Trigger** `onboarding_active_without_activation` — an open onboarding instance with no activation recorded.
- **Entity / state** account + onboarding instance. A second product's onboarding inherits nothing.
- **Objective** surface the single most useful next step, read from what is actually done, until activation, a named blocker, or the window closes.
- **Success** `h.activated` → ACT-16.
- **Terminal** window-closed · handoffs to ACT-16 / ACT-13.
- **First wait** `w.progress` — the interval appropriate to the *remaining work*, `required: true`. "A step that takes minutes and a step that needs an administrator cannot share it."
- **Later waits** the same interval, re-armed per prompt against a budget (default 5).
- **Decisions that matter** is there a critical next step outstanding · has activation actually been achieved (setup complete ≠ value produced) · **is the same prerequisite actually blocking, or is this just a quiet interval** · is the window still open.
- **State re-checks** `a.read` re-reads the *milestone record*, not the send history; `w.progress` re-reads which steps are complete, whether activation is recorded, whether the window is open.
- **Customer touches** **1 per prompt**, up to the 5-prompt budget, never repeating a completed step.
- **Max duration** the onboarding window fixed at entry.
- **Stops when** activation is recorded (supersedes it wherever it sits), a named blocker takes over, an ACT-14 session is booked, or the window closes.
- **Handoff** → ACT-16 *(not public)* on activation · → **ACT-13** on a named blocker, suppressing the generic prompt for that prerequisite.
- **Ownership is properly declared:** `preemptedBy` names all three competitors explicitly. This is the model F4a and F4b should copy.

**ACT-19 · Onboarding Personalization** — `role-use-case-discovery` · email, in-app
- **Trigger** `onboarding_needs_named_role_or_use_case` — a decision that *depends* on it, with no reliable value available.
- **Entity / state** account + person, for this onboarding context. The answer belongs to the context it was given for.
- **Objective** get the one piece of context onboarding needs — only where not having it would change the path.
- **Success** `question_answered` → persisted → `h.progress`.
- **Terminal** don't-ask · handoff to ACT-12.
- **First wait** `w.answer`, short, `required: true` — "this is a question in the middle of someone's setup, not a survey", and "an unanswered question must not hold up the path to value."
- **Later waits** none.
- **Decisions that matter** **does a reliable declared value already exist** (reuse, do not re-ask) · **would the answer materially change the path** — if not, do not ask.
- **State re-checks** the context is re-read before the timeout; the timeout applies a *documented default* and explicitly does **not** write it into the declared field.
- **Customer touches** **1** lightweight question, covering only what the implementation will consume.
- **Max duration** one short response window.
- **Stops when** answered, already declared, or the answer would change nothing.
- **Handoff** → **ACT-12** carrying the declared value with its source *or the explicit fact that there is none*, plus which adaptations were applied.
- A textbook Trigger → ask → wait → route journey. No splits that are not earned.

---

## 3 · Engagement, retention & contactability — 7

**RET-28 · Cancellation Save** — `cancellation-intent-decision-point` · email, in-app
- **Trigger** `explicit_cancellation_intent` (**declared**) — a cancel flow entered, a cancellation requested while reversible, or asked for through a person. Viewing the billing page is not it.
- **Entity / state** the one relationship being cancelled, `person_id + relationship_id + intent_id`. Cancelling one subscription says nothing about the others.
- **Objective** at the moment of declared intent: learn why if useful, offer one genuine alternative if one matches, let them decide — **with the cancellation path fully open at every step**.
- **Success** the *journey's* outcome is a decision, not a save: `cancellation_flow_abandoned` is the measured business outcome.
- **Terminal** lapsed (intent not carried through) · handoffs to RET-30 (offer made) / SUB-167 (confirmed).
- **First wait** `w.answer` — bounded by *the session or conversation in which the question was put*. "When they leave that point, unanswered is the answer."
- **Later waits** `w.decision` — the intent window, 7–14 days from the trigger.
- **Decisions that matter** is a reason already declared · **is asking even useful and appropriate here** (would the answer change what is offered, and does asking delay the cancellation) · **does a legitimate resolution exist for this reason** — explicitly no offer where nothing genuinely matches.
- **State re-checks** `w.answer` re-reads the intent (still open, not confirmed, not abandoned); `w.decision` re-reads the relationship for a cancellation executed elsewhere.
- **Customer touches** **2** max — one reason ask, one alternative offer. Both sit *beside* the cancel path, never in front of it.
- **Max duration** the 7–14-day intent window.
- **Stops when** cancellation is confirmed, the flow is abandoned, or the intent window lapses. The cancellation path itself is never delayed by any contest.
- **Handoff** → **RET-30** when an alternative is offered (carries the declared reason and the cancellation episode, so a decline is remembered inside it) · → SUB-167 *(not public)* on confirmation.
- Top of the `retention-outreach` precedence ladder: a declared intent outranks inferred risk.

**RET-24 · Churn Risk Escalation** — `churn-risk-escalation` · ~~task~~ — **see F1**
- **Trigger** `churn_risk_threshold_crossed` — **several independent** signals crossing a threshold *together*. A single weak signal, a high account value, or a score with no decomposable evidence are all explicitly insufficient.
- **Entity / state** account + risk episode. "A risky subscription inside a healthy account is a risky subscription."
- **Objective** decide how hard to push back, in proportion to how much independent evidence there actually is.
- **Success** not a send — a proportionate route chosen, or a justified decision to do nothing.
- **Terminal** `x.monitor` (no-action) · handoffs to RET-28, RET-23, human lifecycle, RET-30.
- **First wait** **none.** Correct: evidence is assembled and routed synchronously; waiting would let the risk deepen.
- **Later waits** none.
- **Decisions that matter** has explicit cancellation intent already been expressed (defer to RET-28) · is the cause a known operational problem (defer to RET-23, unless it is a payment failure payment-recovery already owns) · **does the evidence justify a person** · **does a higher-precedence contender already claim this account** (`c.priority-clear` re-reads FBK-46's live claim rather than trusting declared precedence text) · is a *proportionate* automated recovery available.
- **State re-checks** `c.priority-clear` immediately before `a.owner-task` — a live re-read, not a static rule.
- **Customer touches** **0**.
- **Max duration** a single evaluation pass.
- **Stops when** a route is chosen, or nothing proportionate exists (`x.monitor` is a legitimate outcome, not a gap).
- **Handoff** → RET-28 · RET-23 *(not public)* · human lifecycle · **RET-30**, minting a fresh `retention_episode_id` deterministically from `account_id + risk_episode_id` rather than reusing its own — a correct and unusually careful piece of contract design.

**RET-32 · Lapsed Customer Win-Back** — `lapsed-customer-win-back` · email, push
- **Trigger** `lapsed_customer_detected` — ≥1 completed paid term, lapsed under the company's rule, **and the cancellation's own save window and cooldown have passed**.
- **Entity / state** the formerly paying relationship, `person_id + relationship_id`. One instance per lapse, separated by a long cooldown.
- **Objective** invite them back plainly, speaking to why they left where that is known; never write to someone whose recorded reason or history says not to.
- **Success** `x.won` — the relationship is repaid.
- **Terminal** won · no-action (excluding reason/history/gate recorded) · lapsed (long cooldown starts).
- **First wait** none before the invitation; `w.response` is 14–30 days after it — "someone who left is not in a hurry to return; the window is weeks, not days."
- **Later waits** `w.final`, 30–60 days of pure observation after an optional follow-up.
- **Decisions that matter** **is this relationship one we may write to at all** — reason, refund/dispute history, nothing open, permission not withdrawn at cancellation · **what can the invitation honestly say** (something changed, or plain — no change is invented) · is a follow-up enabled *and* is there something honest to add.
- **State re-checks** both waits re-read: still lapsed, nothing opened on it, permission still recorded.
- **Customer touches** **2** max, the second only where the company enables it and something honest exists to add.
- **Max duration** ~90 days, then a **180–365-day cooldown**.
- **Stops when** repaid, any journey opens on the relationship, an excluding reason applies, or the window passes.
- **Handoff** none. Lowest in `retention-outreach`: any live retention, complaint, risk or payment journey means the relationship is not lapsed.

**RET-31 · Predicted Need Replenishment** — `predicted-need-replenishment` · email, push, in-app
- **Trigger** `expected_depletion_approaching` (**inferred**) — from *this person's own* prior purchase and the item's usable period. A category average with no purchase behind it is explicitly insufficient.
- **Entity / state** the predicted need, `person_id + need_key`, one per prediction cycle.
- **Objective** get the replenishment made before the need bites, with the prediction stated honestly as an estimate.
- **Success** `x.replenished`.
- **Terminal** replenished · dismissed · no-action · lapsed.
- **First wait** `w.lead` — 3–7 days **before** `expected_depletion_at` (a `reminder-before-attribute` wait). The lead period is the delivery lead time plus a margin: "a prompt long before the need is noise and a prompt after it is late."
- **Later waits** `w.window` — 3–7 days *after* the estimated depletion → follow-up; `w.final` — 14–30 days observing only.
- **Decisions that matter** is the need still unmet at the lead point · what happened after the estimated depletion (replenished / dismissed / still unmet) · may each touch go out.
- **State re-checks** every wait re-reads purchases, subscriptions and dismissals, **and recomputes the expected depletion date from the latest purchase**.
- **Customer touches** **2** — lead prompt, then one follow-up once the estimated point has passed unmet.
- **Max duration** lead + margin + 14–30 days observing; cooldown runs to the next predicted depletion.
- **Stops when** a purchase is recorded by any channel, the person dismisses (muted for the cycle, or indefinitely if they asked for no more), or a subscription covers the need.
- **Handoff** none.

**RET-30 · Retention Offer Follow-Up** — `retention-intervention-outcome` · email, in-app
- **Trigger** `retention_intervention_delivered` — a defined intervention **actually delivered**. Scheduled-but-not-delivered is insufficient.
- **Entity / state** account + **retention episode**. "A declined offer is declined for this episode, which is what makes remembering it possible."
- **Objective** close a retention attempt on what actually happened to the relationship, and stop the same offer being made twice.
- **Success** `h.observe` → RET-27, once the state has genuinely moved.
- **Terminal** declined · cooldown (no response) · handoffs to RET-27, operational resolution, SUB-167.
- **First wait** `w.outcome` — a bounded decision window from the trigger, `required: true`. "An unanswered offer is a result, and the alternative to accepting that is asking again until someone leaves."
- **Later waits** none.
- **Decisions that matter** what happened to the intervention (accepted / declined / recovered without answering / failed to execute) · **did the state actually change** — the accepted-but-not-applied branch is the whole point · is a cancellation still in progress · is one bounded follow-up justified.
- **State re-checks** `a.verify` reads the system of record: "acceptance is a customer saying yes; application is the state having moved, and the gap between them is where retention numbers go wrong."
- **Customer touches** **1** — a single follow-up, and only where the offer is time-limited or its terms were plausibly misunderstood. "There is no second, whatever the value of the relationship."
- **Max duration** one decision window.
- **Stops when** the outcome is known, or silence closes the episode.
- **Handoff** → RET-27 *(not public)* on a positive outcome · → operational resolution on a failure to apply, suppressing any recording of this as retained · → SUB-167 on a declined offer with cancellation continuing.

**RET-26 · Service Recovery** — `negative-experience-recovery` · email, push
- **Trigger** `authoritative_negative_experience` — a *recorded failure*. Negative feedback on its own is explicitly not one (that is FBK-43's).
- **Entity / state** person + the failure, `person_id + failure_ref`. "One apology does not cover two failures."
- **Objective** say what failed, what was done and what prevents it recurring — once, only when useful, **only after the failure is resolved**, and only where nothing else owns it.
- **Success** `x.acknowledged` — failure acknowledged, no remedy owed ("which is most failures").
- **Terminal** acknowledged · silent (resolved before it reached them) · deferred · handoffs to operational resolution / REM-159.
- **First wait** **none.** Correct: the entire journey is a sequence of eligibility questions, and every wait would be a delay in an apology.
- **Later waits** none.
- **Decisions that matter** is another process already handling this failure · **is the underlying issue still unresolved** (nothing is said about something still broken) · **is a recovery communication actually useful** — a silent fix of something they never saw stays silent · does policy *and impact* support compensation.
- **State re-checks** `a.assess` establishes current resolution state before anything is decided.
- **Customer touches** **1**. "A second message about the same failure is a second failure."
- **Max duration** a single evaluation pass.
- **Stops when** another process owns it, the issue is still live, the person never noticed, or a remedy is owed elsewhere.
- **Handoff** → operational resolution while still broken (suppresses apology and compensation messaging) · → REM-159 *(not public)* where a remedy is owed.

**CON-272 · Contact Recovery** — `contactability-repair` · in-app, sms, email
- **Trigger** `contact_point_recorded_undeliverable` — a *permanent* failure class against **one specific** contact point. A soft bounce or a full mailbox is not it.
- **Entity / state** person + the one destination that failed, `contact_point_id + person_id`. "The failure belongs to the destination, not to the person and not to the channel class."
- **Objective** get a dead destination replaced by asking on a route that still works.
- **Success** `x.repaired` (replacement verified) or `x.recovered` (original deliverable again on its own evidence).
- **Terminal** dark (no working permitted route) · repaired · recovered · suppressed (one cycle spent).
- **First wait** none before the ask; `w.corrected` is **the single repair cycle allowed for this destination**, `required: true`.
- **Later waits** none. One cycle, by design.
- **Decisions that matter** **what can carry the repair request without using the broken destination** — in-product / an alternative permitted route / nothing · what ended the wait.
- **State re-checks** `w.corrected` re-reads the contact point; the replacement is verified before the destination is treated as usable, and nothing held is replayed on it.
- **Customer touches** **2** — the ask (in-app or alternate route), then a confirmation on the working route.
- **Max duration** one repair cycle.
- **Stops when** a verified replacement arrives, the original recovers, or the cycle ends. "A dead route asked twice is still dead and the second ask is paid for in delivery reputation."
- **Handoff** none.
- The confirmation explicitly says "this changed where things go and not what may be sent" — the one design decision that keeps a technical fix from becoming a consent claim.

---

## 4 · Feedback, advocacy & relationship signals — 4

**FBK-42 · Advocacy Request** — `advocacy-eligibility` · email, in-app, push
- **Trigger** `potential_advocacy_opportunity` (behavioural) — a moment where the ask would be contextually sensible, against a relationship with positive evidence behind it. A login, a purchase, one high score and a nice reply to an agent are each explicitly insufficient.
- **Entity / state** account + relationship context. "What is being asked for is their reputation attached to ours."
- **Objective** ask only where the relationship has earned it, and keep public reuse a separate permission.
- **Success** `advocacy_action_taken`.
- **Terminal** suppressed (something unresolved) · delay (evidence thin) · contributed (internal) · declined · no-response · handoff to CON-31.
- **First wait** none before the ask; `w.response` is a bounded response window, `required: true` — "an unanswered favour is not asked again; the relationship is worth more than the review."
- **Later waits** none.
- **Decisions that matter** **is there an open negative issue anywhere in this relationship** (suppresses entirely, whatever the positive evidence says) · **is the accumulated evidence sufficient** · **what size of request does this evidence support** — a rating vs a testimonial are genuinely different asks on genuinely different routes.
- **State re-checks** the relationship is re-read before the timeout.
- **Customer touches** **1** — either the light ask or the heavy one, never both.
- **Max duration** one response window, then a required cooldown.
- **Stops when** they contribute, decline (cooldown), or the window closes. Silence is explicitly *not* recorded as a signal.
- **Handoff** → CON-31 *(not public)* where public reuse is intended, holding the contribution unpublished until a separate permission exists.
- Wins the `outbound-ask` slot against FBK-41 when both are eligible.

**FBK-43 · Feedback Follow-Up** — `feedback-routing-and-loop-closure` · email, in-app, ~~task~~
- **Trigger** `feedback_received` — with enough substance to classify. A bare score is stored as a score and not routed.
- **Entity / state** the feedback record, `feedback_id`. **The record and any issue it produces are separate entities with separate lifecycles** — "one can close while the other is still open, and conflating them loses the loop."
- **Objective** route one piece of feedback to what it operationally means, and close the loop only where something is owed.
- **Success** `x.closed` (loop closed) / `x.stored` / `x.acknowledged` / `x.evidence`.
- **Terminal** closed · stored · attached · acknowledged · evidence · **open (failure class — obligation outstanding, loop not closed)** · handoffs to advocacy contribution, FBK-42, FBK-46, DEC-181 ×2.
- **First wait** `w.outcome` — **the owning process's own SLA**, `required: true`. "This journey never invents a deadline for work it does not own."
- **Later waits** `w.followup` — 7–14 days against `promised_followup_at`; an unkept promise **escalates rather than expiring**.
- **Decisions that matter** **what does this mean operationally** (7-way classification) · does an open issue already cover it (attach, never open a second case) · is there an actionable operational issue, or an experience we did not meet · do escalation criteria apply · **was a follow-up promised to the person**.
- **State re-checks** `w.outcome` re-reads the work item from the owning process; `w.followup` re-reads whether the promise was delivered.
- **Customer touches** **1** — exactly one acknowledgement per record, on whichever route it took, naming the specific thing they said. The `task` nodes are internal routing (F5g).
- **Max duration** the owning process's SLA plus the promise window.
- **Stops when** the loop is closed, nothing was owed, or an existing case absorbs it.
- **Handoff** → FBK-46 *(not public)* on an actionable issue, **suppressing automated satisfaction or retention outreach about the same experience** · → FBK-42 on advocacy threshold · → DEC-181 on unclassifiable feedback and on a broken promise.

**FBK-41 · Feedback Request** — `feedback-eligibility` · email, in-app, push
- **Trigger** `potential_feedback_moment` — an experience reaching a point worth asking about. "A ticket closed by an agent while the customer is still describing the problem" is explicitly insufficient.
- **Entity / state** person + the specific experience, `person_id + experience_ref`. Eligibility is per experience.
- **Objective** ask about one completed experience, once, at an appropriate moment — and not at all in four named circumstances.
- **Success** `x.received`.
- **Terminal** received · no-response · never-completed · deferred · duplicate · not-now.
- **First wait** `w.completion` — only on the incomplete branch, bounded by the completion horizon for this kind of experience, `required: true`. An experience that never completes inside it is **never asked about**.
- **Later waits** `w.response` — 3–7 days, then closed and never repeated.
- **Decisions that matter** **is the experience complete from the person's side, not ours** · **is there an unresolved issue in this context** — judged on the evidence, not on whether a ticket is marked closed · has this context been asked about recently · **is this within the bound on how often this person is asked anything, across every context**.
- **State re-checks** `w.completion` re-reads completion; `w.response` re-reads whether feedback arrived *by any route*.
- **Customer touches** **1**. "One ask about one experience is the whole budget."
- **Max duration** the completion horizon + 3–7 days.
- **Stops when** feedback arrives, the window closes, an issue is open, or the ask budget has no room.
- **Handoff** none — what came back is FBK-43's.
- Cedes the `outbound-ask` slot to FBK-42 and is recorded as not-now, free to re-open at its next moment.

**FBK-49 · Missing Information Reminder** — `missing-critical-data` · email, in-app, ~~task~~
- **Trigger** `required_data_missing_and_blocking` — a *named business process* that cannot safely proceed, and the specific item it waits on. "Data that would improve a future decision while blocking nothing today" is explicitly insufficient.
- **Entity / state** the blocked entity + the requirement, `blocked_entity_id + requirement_id`. Two gaps are two dependencies.
- **Objective** treat a genuinely blocking data gap as a named dependency, and keep it distinct from wanting to know more about someone.
- **Success** `x.resumed` — the requirement satisfied and the blocked process free to continue.
- **Terminal** resumed · alternate route · abandoned (failure class — "the blocked process stays blocked and says so") · handoff to human lifecycle.
- **First wait** `w.received`, `required: true`, sized to **what is blocked, not to the request** — "a blocked payment and a blocked report do not deserve the same patience."
- **Later waits** none.
- **Decisions that matter** **can an authoritative source supply this without asking anyone** (asking for what we already hold "is the fastest way to demonstrate that we do not know our own records") · **who can actually supply it** — the customer, or someone internal · is what arrived valid · given how critical the blocked process is, what now.
- **State re-checks** `w.received` re-reads the blocked entity; `c.valid` checks what arrived actually satisfies the requirement.
- **Customer touches** **1** — the request, naming what it unblocks. The internal-owner path is a task, not a message (F5g).
- **Max duration** one response window sized to the blocked process.
- **Stops when** the item arrives and validates, an alternate route exists, or it is not worth pursuing.
- **Handoff** → human lifecycle, carrying what has already been tried "so the person does not repeat the request that failed."

---

## 5 · Time, deadlines, expiry & temporary states — 5

**TIM-268 · Action Required Reminder** — `outstanding-obligation-reminder` · email, sms
- **Trigger** `customer_owed_obligation_outstanding` — an authoritative record that a defined action is owed by a named person, **with a due date**.
- **Entity / state** the obligation, `obligation_id`, one per key. ⚠ **Same key and same subject as TIM-61 with nothing arbitrating** (F4b).
- **Objective** remind somebody of what they owe while there is still time to do it, built from the obligation's state *at the moment of sending*.
- **Success** `x.satisfied` (terminal) — discharged and confirmed.
- **Terminal** moot (no longer owed) · satisfied · lapsed · handoff to the consequence owner.
- **First wait** `w.due` — the reminder point defined for this kind of obligation, measured back from `due_at`, `required: true`. Skipped entirely where the reminder point is already past at qualification.
- **Later waits** `w.deadline` — runs to `due_at` itself. "The deadline is what the reminder said would matter."
- **Decisions that matter** is there a gap before the deadline worth waiting through · **is anything still owed at the moment of sending** · how did it resolve · does a defined consequence own it now.
- **State re-checks** `a.recheck` re-reads authoritative current state *immediately before sending* — "a message built from the state an hour ago is how somebody who has already settled is asked to settle again." Also names **what is still owed, not what was originally owed**.
- **Customer touches** **2** on a path — one reminder before the deadline, then either a confirmation or one overdue notice.
- **Max duration** to `due_at`, plus one notice.
- **Stops when** satisfied, cancelled, adjusted to nothing, or handed to the consequence owner. "Repetition past that is a recovery process and belongs elsewhere."
- **Handoff** → `external:consequence-owner` carrying what remains outstanding and exactly which reminders were sent and what they stated.

**TIM-61 · Deadline Tracking** — `deadline-tracking` · email, push, sms, whatsapp
- **Trigger** `authoritative_deadline_assigned` — by a system or rule *entitled to set one*. "A reminder date configured in a messaging tool" is explicitly insufficient.
- **Entity / state** the obligation the deadline governs, `obligation_id`. ⚠ **See F4b.**
- **Objective** let a deadline govern the **state** of one obligation, rather than schedule messages around a date.
- **Success** `x.satisfied` — satisfied before the deadline, with every queued reminder invalidated.
- **Terminal** satisfied · failed · still-valid ("the ordinary case and not an omission") · handoffs to TIM-62 (overdue), OWN-55 (escalated), TIM-64 (expired).
- **First wait** `w.tracking` — bounded by `due_at` itself, `required: true`, however many policy thresholds sit inside it.
- **Later waits** the same wait, re-armed per threshold against a fixed budget.
- **Decisions that matter** which happened (completed / a pre-deadline threshold) · **is a reminder useful here, and does policy define one** — "nothing to send when nobody can do anything differently on hearing it" · **what does the governing rule say the deadline's passing means** — five outcomes, only one of them failure.
- **State re-checks** `a.store` records the *completion condition* up front ("the load-bearing part"); `w.tracking` re-reads the obligation before acting on the timeout; `a.satisfied` invalidates queued reminders so a stale job cannot reopen a finished obligation.
- **Customer touches** **1 per policy-defined threshold** — the thresholds are policy, "and none is added to make a schedule."
- **Max duration** to `due_at`.
- **Stops when** the completion condition is satisfied, or the deadline passes and the governing rule decides.
- **Handoff** → TIM-62 / OWN-55 / TIM-64, none public.

**TIM-281 · Expired Access Recovery** — `expired-entity-re-entry` · email, in-app
- **Trigger** `holder_acted_on_expired_entity` (**behavioural**) — an authoritative expiry *plus an attempt by the holder* after it. An expiry with no attempt is not this journey.
- **Entity / state** the expired entity + this attempt, `entity_ref + attempt_id`. "The expired entity and its replacement are two objects."
- **Objective** give somebody who has come back the **one route that actually restores it**, at the moment they are asking.
- **Success** `x.restored`.
- **Terminal** restored · still-expired (route offered, not taken) · **terminal (no route back — a genuine dead end, marked `terminal: true`)**.
- **First wait** `w.act` — a bounded response window from the moment the route was named, `required: true`.
- **Later waits** none.
- **Decisions that matter** **which mechanism restores validity here** — renewal / requalification / replacement-only / no route. This is the whole journey: "one wrong route spends an intent that arrived willing."
- **State re-checks** `a.establish` reads what the expiry actually did *before naming any route*; `w.act` re-reads before the timeout.
- **Customer touches** **2** — one route statement (four mutually exclusive variants) and one confirmation.
- **Max duration** one response window.
- **Stops when** validity returns, the route is abandoned, or there is no route (said once, clearly, with whatever alternative exists).
- **Handoff** none.
- The confirmation explicitly states that a replacement is a *new* object, "because the gap during which nothing was valid is a fact the holder will need later."

**TIM-63 · Expiry Reminder** — `pre-expiry-window` · email, in-app, push, sms
- **Trigger** `pre_expiry_window_entered` — a window "whose length reflects how long acting on it actually takes", not a fixed interval applied to every entity type.
- **Entity / state** the time-bound entity, `entity_ref + validity_id`. Three expiring credentials are three windows.
- **Objective** before expiry, tell whoever can actually act what is expiring, the one action that changes the outcome, and the point by which it must be taken — or say plainly what will happen, or say nothing.
- **Success** `h.resolved` — renewed, replaced or completed before expiry.
- **Terminal** suppressed (already resolved) · silent (nothing to do, nothing worth saying) · handoffs to renewal lifecycle / TIM-64.
- **First wait** `w.resolution` — runs to `expires_at` as the system of record asserts it. There is no wait *before* the message, correctly: the window entry is itself the timing decision.
- **Later waits** none.
- **Decisions that matter** **has it already been renewed, replaced or completed** (the window opened on a schedule; state moves) · **is an action available that would materially change the outcome** · where nothing can be done, **is telling anyone even useful**.
- **State re-checks** `a.reread` before anything; the wait re-reads at the expiry moment; `a.invalidate` kills expiry actions queued under the old validity.
- **Customer touches** **1** — either an action prompt or an informational notice, never both. "A prompt to act with nothing to do is a false one."
- **Max duration** to `expires_at`.
- **Stops when** resolved, or the expiry arrives — and **the expiry itself is never handled here**.
- **Handoff** → renewal lifecycle on resolution, suppressing every expiry action under the previous validity · → TIM-64 *(not public)* when the window closes unresolved.

**TIM-274 · Grace Period Recovery** — `grace-period-recovery` · email, sms
- **Trigger** `grace_period_started` — an **authoritative grace state already recorded**, with a fixed end date and a recorded recovery condition. "A validity date that is merely approaching" is insufficient: grace is never announced before it exists.
- **Entity / state** the entity + this grace period, `entity_ref + grace_period_id`. "A window never inherits time from the one before it."
- **Objective** make grace a state the holder is in *knowingly* — what stopped, what still works, when it ends, and the one route back.
- **Success** `x.recovered`.
- **Terminal** recovered · moot (terminated before the window closed) · lost (window closed unrecovered).
- **First wait** none before the notice; `w.grace` runs to the last point inside the window at which one further message can still be acted on (`reminder-before-attribute` on `grace_deadline_at`).
- **Later waits** `w.final` — runs to `grace_deadline_at` itself.
- **Decisions that matter** **does grace restrict anything the holder will actually notice** — the only split, and it earns its place: dramatising a restriction they cannot feel "teaches them to discount the message that arrives when they can."
- **State re-checks** both waits re-read the entity before acting on the timeout.
- **Customer touches** **3** — the grace notice (restricted or quiet), one last call, and then a confirmation *or* a loss notice. Both endings are stated: "silence after a recovery and silence after an expiry are indistinguishable to the person living in the window."
- **Max duration** the grace window's fixed end. It never extends.
- **Stops when** the recovery condition is satisfied, the entity is terminated, or the window closes.
- **Handoff** none.

---

## 6 · Access, identity & relationship — 5

**ACC-261 · Access Restriction Notice** — `access-restriction-route-back` · email, in-app
- **Trigger** `access_restriction_or_end_recorded` — authoritative, **with a stated condition or deadline that would resolve it**. A risk signal that has not produced a restriction is insufficient.
- **Entity / state** account + the specific restriction, `account_id + restriction_id`.
- **Objective** make a restriction "a decision they can act on rather than a discovery they make later".
- **Success** `x.restored` (condition met, access back, confirmed) or `x.informed` (told, resolution not theirs).
- **Terminal** informed · security-owned · restored · stands (deadline passed unmet) · handoff to CON-36.
- **First wait** none before the notice; `w.resolve` runs to `resolution_deadline_at`, `required: true` — "passing it silently would make the notice false."
- **Later waits** none.
- **Decisions that matter** **can the holder do anything about this** — resolvable by them / not theirs / **placed by a security response that is already telling the owner** (a clean, explicit dedupe against IDN-271) · is there a permitted route to them.
- **State re-checks** `w.resolve` re-reads the restriction before the timeout.
- **Customer touches** **2** — the notice (naming what still works, not only what stopped), then an explicit restoration confirmation.
- **Max duration** to the stated deadline.
- **Stops when** restored, the deadline passes, the security response owns it, or no permitted route survives.
- **Handoff** → CON-36 *(not public)* when the notice cannot be delivered on any permitted route, carrying which routes were tried and why each was closed.

**ACC-263 · Activation Reminder** — `entitlement-activation-window` · email, in-app
- **Trigger** `entitlement_provisioned_and_reachable` — granted **and confirmed reachable**, with an activation window. "A grant whose resource is not yet reachable" is insufficient.
- **Entity / state** the issuance + its window, `entitlement_id + holder_id`. "A reissued credential is a new instance."
- **Objective** get them to actually use what they were granted before the claim window closes.
- **Success** `x.activated` — `capability_first_used`.
- **Terminal** activated · moot (revoked or replaced before use) · lapsed unclaimed. The last two are deliberately kept as **different outcomes — "one is about the holder, the other is not."**
- **First wait** `w.first-use` — placed before the window closes, late enough that the first notice has had its chance (`reminder-before-attribute` on `activation_window_ends_at`).
- **Later waits** `w.last-chance` — to the window's close. No second reminder.
- **Decisions that matter** **is this the holder's first entitlement of this kind** — "a holder who has used this capability before is not re-onboarded onto it" · is there still time to claim it.
- **State re-checks** both waits re-read the entitlement before the timeout.
- **Customer touches** **2** — one notice (full or brief), one reminder. "A capability nobody wanted is not made wanted by asking twice."
- **Max duration** the activation window.
- **Stops when** first used, revoked/replaced, or the window closes.
- **Handoff** none.

**IDN-271 · Account Security Alert** — `compromise-alert-verification` · email, sms
- **Trigger** `compromise_incident_opened_with_scope_determined` — the incident, the affected scope, and whether containment was applied. A single failed auth or an unusual location is insufficient.
- **Entity / state** account + incident, `account_id + incident_id`. A later signal is a separate incident.
- **Objective** tell the owner, at **every** verified destination the signal does not implicate, what was seen and what was restricted — and let their answer resolve it.
- **Success** `x.cleared` — signal cleared, restrictions lifted, owner told.
- **Terminal** cleared · open past its review point · withheld (no unimplicated destination) · handoff to IDN-88.
- **First wait** `w.verify` — the **review point set by the security process**, `required: true`. "An open suspicion with no stated conclusion is a restriction with no end date, and the owner is the one living inside it."
- **Later waits** none.
- **Decisions that matter** **is there a destination the signal does not implicate** · **has anything actually been restricted** — the contained vs watch split; "suspected is not confirmed, and most of these signals are not."
- **State re-checks** `w.verify` re-reads the owner's answer, the security review's state, **and what remains restricted**.
- **Customer touches** **2** — one alert (contained or watch), then either the all-clear or a standing-open notice. The channel strategy uniquely sets `simultaneous.allowed: true` — every verified unimplicated destination is told **at once**, "because a single destination may itself be the compromised one."
- **Max duration** to the incident's review point, then a standing notice rather than silence.
- **Stops when** the owner confirms, the review clears it, or the compromise is confirmed.
- **Handoff** → IDN-88 *(not public)* on a confirmed compromise, carrying which destinations were treated as implicated.
- Exempt from pressure caps and marketing permission by design; only hard gates apply.

**IDN-84 · Verification Recovery** — `verification-failure-routing` · in-app, email
- **Trigger** `verification_attempt_failed` — an attempt that did not establish its claim.
- **Entity / state** the verification instance, `verification_instance_id`. "A technical failure and a mismatch are different facts about different things, and only one of them is about the person."
- **Objective** route a failed verification **by why it failed**, and keep our own failures out of the customer's verification record.
- **Success** `x.retry` — a bounded retry available, the instance stays open *against the same budget*.
- **Terminal** retry · terminal (not possible on this basis) · handoffs to OWN-55, DEC-181.
- **First wait** **none**, correctly — a person mid-verification is waiting on an answer now.
- **Later waits** none.
- **Decisions that matter** **what kind of failure was it** (8-way classify → 4 routes) · does the retry budget have room · is a safe technical retry available within backoff.
- **State re-checks** `a.classify` writes the class before anything routes; `a.backoff` records **nothing against the person's verification history**.
- **Customer touches** **1** — an explanation with the bounded retry, or a terminal explanation naming what basis *would* be accepted.
- **Max duration** the policy retry budget for this claim's security sensitivity.
- **Stops when** the budget is spent (→ a person, never an acceptance), a person is needed, or policy forbids this basis.
- **Handoff** → OWN-55 on a technical failure that is not clearing (carries "the people currently unable to verify because of it") · → DEC-181 on human judgement or a spent budget. Neither is public.

**REL-284 · Invitation Reminder** — `relationship-invitation` · email, in-app
- **Trigger** `relationship_invitation_issued` — by a party with the authority, naming the counterparty, the scope, the direction **and an expiry**.
- **Entity / state** the invitation, `invitation_id`. "The invitation is the subject, not the parties."
- **Objective** put a proposed link in front of the party who has to accept it, on terms they can see before answering, and close the question before it goes stale.
- **Success** `x.active` — link active, **both identities intact**.
- **Terminal** active · closed (declined or withdrawn — `terminal: true`, "a declined one is never revived") · expired unanswered.
- **First wait** `w.response` — the point at which one reminder would still leave time to act (`reminder-before-attribute` on `expires_at`), `required: true`.
- **Later waits** `w.final` — to `expires_at` itself. No second reminder.
- **Decisions that matter** **does the counterparty already exist here in their own right** — an existing holder's first question is what accepting *costs* them; someone new reads an unexplained invitation as a claim already made on them · is a reminder still worth sending.
- **State re-checks** both waits re-read the invitation before the timeout.
- **Customer touches** **3** — invitation, one reminder, one confirmation (to **both sides**, naming scope and direction).
- **Max duration** to the invitation's own expiry. "Every invitation expires. A pending claim on somebody who never agreed to it does not sit open indefinitely."
- **Stops when** accepted, declined, withdrawn, or expired.
- **Handoff** none.

---

## 7 · Transactions, fulfillment & remedies — 6

**FIN-134 · Payment Failure Recovery** — `payment-failure-recovery` · email, in-app, push, sms
- **Trigger** `authoritative_payment_failure` — the payment system stating the attempt failed, with whatever reason it gave. **A timeout is explicitly insufficient**, because it establishes nothing about whether money moved.
- **Entity / state** the failed attempt, the obligation behind it, and the relationship — `obligation_id`. "Three things, and the failure touches only the first."
- **Objective** get the obligation paid by responding to the failure that actually happened, while the obligation stays alive and the relationship's state is decided elsewhere.
- **Success** `x.recovered` — the obligation satisfied and the discharge confirmed.
- **Terminal** recovered · handoffs to TIM-65 (grace), TIM-62 (overdue), ACC-78 (restriction).
- **First wait** `w.recovery` — the reminder point, 2–3 days before an asserted `consequence_date`. Skipped where no consequence date exists.
- **Later waits** `w.alternate-choice` 3–7 days on the choose-a-method branch; `w.final` to the obligation class's own grace or consequence policy, `required: true`.
- **Decisions that matter** **what kind of failure was it** — transient (retry silently, same idempotency key) / customer-fixable / declined-with-no-usable-reason · **is an alternative route available, and whose decision is it** — standing authority vs asking, because "an internal action that quietly picks one is a charge they did not authorise" · is a reminder still useful and is there a real consequence to name · what does policy apply when it stays unpaid.
- **State re-checks** `w.recovery` re-reads that the obligation is still outstanding and the method still invalid **immediately before the reminder**; `w.final` re-reads before the consequence.
- **Customer touches** **3** max — one corrective request (or an alternate-method choice), one reminder naming the consequence and its date, one discharge confirmation. Only the reminder is discretionary; the other two are obligations and are not rationed.
- **Max duration** the obligation class's recovery window.
- **Stops when** the obligation is satisfied, cancelled or waived by any means; while a system-side retry may still succeed; or when the outcome is unknown and must be reconciled first.
- **Handoff** → TIM-65 / TIM-62 / ACC-78, none public. Notably the only journey with a **`handoff-chain` measurement scope**: its business outcome is observed *through* TIM-65 until `grace_period_ended`.

**FUL-146 · Delivery Delay Alert** — `fulfillment-delay` · email, sms
- **Trigger** `expected_fulfillment_timing_slipped` — a **material** slip. A slip inside the commitment's own tolerance is insufficient.
- **Entity / state** the obligation and its timing commitment, `obligation_id`. **Each revised estimate is appended**, never overwritten: "overwriting the original hides a repeated slip, which is the pattern that matters more than any single date."
- **Objective** hold lateness as its own state, with the original commitment intact behind whatever the new estimate is.
- **Success** `h.resume` — fulfilment resumed or completed.
- **Terminal** ⚠ **no exits** — every ending is a handoff (F5d): FUL-144 resume, FUL-145 alternative, FUL-150 cancel, OWN-55 escalate.
- **First wait** none before the update, correctly — a delay the person does not know about is the failure the journey exists to prevent.
- **Later waits** `w.decision` (the decision window, `required: true`) and `w.resume` (the revised horizon, from the trigger).
- **Decisions that matter** **is there a reliable new completion estimate** — where there is not, *that* is what is said · **does the changed timing alter what the recipient should plan around** (tolerance "is ours, not theirs") · does the delay exceed the acceptable threshold · **does the counterparty have a real decision to make**.
- **State re-checks** both waits re-read the obligation before acting on the timeout.
- **Customer touches** **2** — one delay update, then either a choice offer or a no-choice/escalation update. "Escalating in silence tells the recipient nothing is happening at the exact moment most is."
- **Max duration** the revised horizon; outliving it escalates.
- **Stops when** fulfilment resumes, they choose an alternative or cancel, or it escalates.
- **Handoff** → FUL-144 / FUL-145 / FUL-150 / OWN-55, none public. **Cedes in-transit slips to FUL-265** by explicit suppression (F4c).

**FUL-265 · Delivery Tracking** — `dispatch-to-acceptance` · email, sms
- **Trigger** `obligation_handed_to_delivery_executor` — a dispatch record naming the executor and the destination. A packing status or a bare label is insufficient.
- **Entity / state** the dispatched obligation + recipient + acceptance window, `obligation_id + person_id`. A re-dispatch is a new instance and inherits no window.
- **Objective** carry the recipient from "it left our hands" to "they agree it was discharged correctly" — "arriving and being agreed to have arrived correctly are two different facts, and only one of them has a recipient as its source."
- **Success** `x.accepted` (terminal) — explicit acceptance; or `x.delivered` where no acceptance window is defined.
- **Terminal** delivered · accepted · finalised on expiry · handoffs to FUL-148 (non-arrival) and FUL-149 (issue raised).
- **First wait** `w.delivery` — **the executor's own expected window** (`external-window`, `required: true`). Its passing without an authoritative report is a non-arrival to be reconciled, **never assumed delivered**.
- **Later waits** `w.acceptance` — the acceptance window policy defines, to `acceptance_window_ends_at`.
- **Decisions that matter** **what did the executor authoritatively report** — a final confirmation, not an intermediate tracking movement · **does acceptance carry any consequence here** — where policy defines no window, nothing is asked · what did the recipient say.
- **State re-checks** both waits re-read the obligation before the timeout.
- **Customer touches** **3** — dispatch notice, arrival-or-non-arrival notice, acceptance request naming the date after which silence counts as acceptance.
- **Max duration** the executor's window + the acceptance window.
- **Stops when** accepted, an issue is raised, or the acceptance window expires (recorded as **acceptance by expiry, permanently distinguishable from acceptance by agreement**).
- **Handoff** → **FUL-148** on non-arrival, **minting a fresh `delivery_attempt_id`** deterministically because FUL-265 tracks by obligation and FUL-148 by attempt · → FUL-149 on an issue. ⚠ The non-arrival node is `x.unresolved` but is a handoff (F5e).

**FUL-148 · Failed Delivery Recovery** — `delivery-attempt-failure` · email, sms
- **Trigger** `authoritative_delivery_attempt_failure` — the executor confirming an attempt was made and delivery did not occur. "A tracking status that has not advanced" is silence, not a failure.
- **Entity / state** the individual attempt, `delivery_attempt_id`. "The obligation survives every failed attempt."
- **Objective** recover a failed delivery according to why it failed, within a **bounded** number of attempts.
- **Success** `h.retry` — a further attempt dispatched with the correction or route change applied.
- **Terminal** ⚠ **no exits** (F5d) — handoffs to FUL-147 (retry), REM-151 (return), FUL-145 (damaged).
- **First wait** `w.correction` — waited on only as long as a reattempt inside the bounded policy is still possible, `required: true`.
- **Later waits** `w.route-choice` on the same bound; an unanswered choice reattempts the original route.
- **Decisions that matter** **what kind of failure was it** — 5-way, and specifically **refused vs unavailable**: "one is a decision by the recipient and the other is an absence, and treating the first as the second keeps redelivering to someone who has already said no" · is a reattempt available within the bounded policy · **would an alternative serve better, and is it ours or theirs to choose**.
- **State re-checks** both waits re-read the attempt and obligation before the timeout.
- **Customer touches** **2** — a correction request naming exactly what is missing, or an offer of concrete alternatives stating that **the attempt budget does not reset either way**.
- **Max duration** bounded by the policy attempt limit; the budget does not reset.
- **Stops when** the attempt limit is reached, the recipient refuses, or all alternatives are declined.
- **Handoff** → FUL-147 (retry) · → **REM-151** on return, minting a fresh `issue_id` because FUL-148 has no issue concept · → FUL-145 (damaged).

**REM-151 · Post-Purchase Issue Recovery** — `post-completion-issue` · email
- **Trigger** `post_completion_issue_reported` (declared) — a **concrete** problem with something delivered. "Negative feedback about the experience, which reports a feeling rather than naming a problem with what was delivered" is explicitly insufficient.
- **Entity / state** the completed fulfilment + the specific problem, `issue_id`. "A second problem with the same order is a second issue unless it is the same defect described again."
- **Objective** establish whether something delivered has left an obligation unresolved, and which mechanism could satisfy it.
- **Success** `h.remedy` → REM-157.
- **Terminal** attached (to an existing case) · no-defect · handoff to REM-157.
- **First wait** **none.** Correct: a reported issue is answered now, not after a window.
- **Later waits** none.
- **Decisions that matter** does an existing recovery case already cover this ("two remedies running against one obligation produce two replacements or two refunds") · **is there an actionable unresolved obligation, or an experience that fell short with nothing having gone wrong**.
- **State re-checks** `a.capture` records the reported problem, scope and evidence; `a.assess` establishes the obligation before classifying.
- **Customer touches** **1** — an acknowledgement and explanation, only on the no-defect branch. "No refund is issued as a way of ending the conversation."
- **Max duration** a single evaluation pass.
- **Stops when** an existing case absorbs it, or no unresolved obligation exists.
- **Handoff** → **REM-157**, carrying the unresolved obligation "stated as what is owed rather than as what was complained about".

**REM-157 · Remedy Confirmation** — `remedy-selection` · email, in-app
- **Trigger** `remedy_decision_required` — a confirmed issue with an unresolved obligation and no remedy selected. A refund *request* is insufficient: it "presumes the remedy this journey has not yet decided".
- **Entity / state** the confirmed issue + the unresolved obligation, `issue_id`. "What is owed and what someone is upset about are related and not the same, and only the first can be satisfied."
- **Objective** choose the remedy that would actually satisfy the obligation, from the ones that genuinely exist.
- **Success** a remedy selected and routed.
- **Terminal** no-remedy · handoffs to REM-156 (correction), REM-155 (replacement), REM-152 (return), FIN-137 (refund).
- **First wait** `w.selection` — bounded from the options being presented, `required: true`; an unanswered choice takes the **policy default**, recorded as no selection rather than as a choice.
- **Later waits** none.
- **Decisions that matter** **does the counterparty choose between remedies at all** · **which remedy resolves the obligation** — and specifically the guard that a return already rejected for this issue is not re-selected when REM-152 routes back here.
- **State re-checks** `w.selection` re-reads the issue and obligation before the timeout.
- **Customer touches** **2** max on a path — presenting genuinely available options, or stating that no remedy is owed **and naming an appeal route only where one actually exists** ("reaching no remedy and saying nothing leaves the person believing the question is still open").
- **Max duration** one selection window.
- **Stops when** a remedy is selected or the policy default applies.
- **Handoff** → four remedy journeys, none public. The refund handoff carries "the explicit fact that this journey selected the remedy and did not decide the refund is owed."

---

## 8 · Subscriptions & scheduling — 6

**SUB-262 · Cancellation Confirmation** — `cancellation-wind-down-notice` · email, in-app
- **Trigger** `cancellation_confirmed` — authoritative, **with an effective end date**. A stated intention, a failed payment and a support conversation about leaving are each explicitly insufficient.
- **Entity / state** the cancelled relationship + its effective end date, `relationship_id`.
- **Objective** carry somebody through the period between deciding to leave and losing access, so the end date is never a surprise and returning stays possible right up to it.
- **Success** `x.ended` — ended cleanly, with nothing outstanding; or `x.returned` if they withdraw.
- **Terminal** returned (withdrawn) · ended · handoff to SUB-170.
- **First wait** none before the confirmation; `w.window` runs to `effective_end_at`, `required: true` — "the window closing is the event this journey exists to mark."
- **Later waits** none.
- **Decisions that matter** **is there a meaningful window before access ends** (skip the second touch if not) · did they withdraw · **does anything outlive the relationship**.
- **State re-checks** `w.window` re-reads the relationship before the timeout.
- **Customer touches** **2** — confirmation (the exact end date and what remains available until then), then an ending notice ("what will and will not survive it — exports, history, outstanding obligations").
- **Max duration** to the effective end date. **The date never moves silently, and paid-for access is never cut short.**
- **Stops when** the cancellation is withdrawn (exits immediately — "a reminder that access is ending, sent to somebody who has just stayed, is worse than sending nothing").
- **Handoff** → SUB-170 *(not public)* where obligations survive the end date.
- **The cancellation is never re-litigated here.** Save attempts belong to RET-28, before this journey.

**SUB-163 · Renewal Reminder** — `renewal-decision` · email, in-app, push, sms
- **Trigger** `renewal_decision_window_opens` — a term end inside the window the *governing terms* define. "A renewal reminder having been sent" is a communication, not a window opening.
- **Entity / state** the relationship + the open renewal cycle, `relationship_id + renewal_cycle_id`. "A relationship renewed eight times has eight cycles in its history."
- **Objective** bring a renewal cycle to a **recorded decision** before the notice deadline.
- **Success** `renewal_decision_recorded` → `h.execute` → SUB-164.
- **Terminal** ⚠ one exit, `x.superseded`; the four real endings are handoffs to non-public journeys (F5d): SUB-164, SUB-168, OWN-55, DEC-181.
- **First wait** `w.decision` — runs to `term_end_at` **minus the notice period the terms require**. "Past it, the terms themselves determine what happens, and pretending the decision is still open misrepresents the relationship."
- **Later waits** `w.review` on the same boundary for the blocked path.
- **Decisions that matter** **are the terms and required notice actually defined** (if not, nothing is invented — it goes to decision resolution) · **do the terms require notice to be given** · does a blocker prevent a decision · **what does the renewal model require** — auto / explicit / internal review · what is the outcome, **including deferring to a cancellation that started in motion after the request was sent**.
- **State re-checks** both waits re-read: a decision recorded elsewhere, **a cancellation now in motion**, the terms unchanged.
- **Customer touches** **2** — the notice the terms oblige (mandatory, transactional, never rationed) and one decision request (discretionary). "Asking is not deciding — treating the send as the answer renews relationships nobody agreed to."
- **Max duration** to the notice deadline.
- **Stops when** an authorised decision is recorded, a cancellation is in motion, or an open payment recovery owns the relationship.
- **Handoff** → SUB-164 (decided, carrying "the new term does not yet exist") · SUB-168 (non-renewal) · OWN-55 (review outlived the notice period) · DEC-181 (undefined terms).

**SCH-266 · Appointment Reminder** — `appointment-readiness-reminder` · email, sms, in-app
- **Trigger** `confirmed_booking_with_customer_owed_prerequisites` — confirmed, future, with ≥1 outstanding prerequisite **owned by the customer**.
- **Entity / state** the booking occurrence + the prerequisites its customer owes, `booking_id + occurrence_id`. Each occurrence of a recurring commitment revalidates on its own.
- **Objective** get the customer's side done before the commitment arrives, and remind them from what the booking **is at the moment of sending**.
- **Success** `h.prestart` → SCH-177 with attendance in scope.
- **Terminal** superseded (the booking changed) · handoffs to SCH-174 (at-risk) and SCH-177 (reminded).
- **First wait** `w.prereq` — to the pre-start point, 24–72 h before `scheduled_at`, **set from how long the customer's own preparation takes, not from how long ago the booking was made**.
- **Later waits** `w.prestart`, the same point for the already-ready path.
- **Decisions that matter** **is there enough time left for a prompt to be worth sending** (skip straight to revalidation inside the pre-start window) · does the booking still stand as just read · **is anything outstanding that would stop the service happening** — the at-risk vs ordinary-reminder split.
- **State re-checks** `a.revalidate` re-reads the booking from authoritative state **before anything is built**: "a reminder generated from the booking as it was is how somebody who cancelled correctly gets told to turn up."
- **Customer touches** **2** — one prerequisite prompt naming everything outstanding **in one message**, then either the at-risk notice or the reminder. Never both.
- **Max duration** to the pre-start point.
- **Stops when** the booking is cancelled, moved or materially changed.
- **Handoff** → SCH-174 on a critical prerequisite still outstanding · → SCH-177, **suppressing any further reminder for this occurrence**. Neither is public.
- **Preparation never moves the confirmed time.** A failing condition escalates; it does not reschedule.

**SCH-282 · Availability Search Abandonment** — `availability-searched-no-booking` · email, push
- **Trigger** `availability_query_closed_without_reservation` (behavioural) — a query for a named person against a specific resource and window, with no reservation since.
- **Entity / state** the availability question, `person_id + availability_query_id`. "The question is not a claim on anything."
- **Objective** follow up with something **genuinely bookable now**, or a waitlist place — "because what was shown was never held and is probably already gone."
- **Success** `x.booked` (unprompted or after the offer) or `x.waitlisted`.
- **Terminal** no-route · booked · waitlisted · nothing (no message sent) · lapsed.
- **First wait** `w.settle`, `required: true` — long enough that an unprompted booking has had its chance, "and no longer than the question stays live."
- **Later waits** `w.respond` (the validity of the offered window) and `w.waitlist` (the validity of the waitlist offer).
- **Decisions that matter** may an unprompted offer be sent to this person at all · **what is actually available now** — a near window / a waitlist / nothing.
- **State re-checks** `a.recheck` **re-evaluates from scratch** rather than reusing what the query returned.
- **Customer touches** **1** — the nearest bookable window, **labelled as a different window**, or a waitlist place stated as reserving nothing.
- **Max duration** the settle window + the validity of whatever was offered.
- **Stops when** they book, nothing fits, or the offered window's validity passes. "One offer per query. A second offer for the same request is pressure rather than help."
- **Handoff** none.

**SCH-277 · Booking Confirmation** — `reservation-outcome-notice` · email, sms
- **Trigger** `reservation_request_recorded` — against a named requester, resource and slot, with a permitted contact point. Availability being *displayed* is insufficient.
- **Entity / state** the reservation request, `booking_id`. "A retried submission is the same request rather than a second claim on the same capacity."
- **Objective** tell the requester whether the time they asked for is now a commitment — "because the availability they were shown earlier was a picture and never a hold."
- **Success** `x.confirmed`.
- **Terminal** confirmed · declined (informed, nothing held) · lapsed · handoff to SCH-173.
- **First wait** `w.outcome` — the period the booking semantics allow a request to stay unresolved, `required: true`.
- **Later waits** `w.choice` — the stated deadline for choosing an alternative.
- **Decisions that matter** **what did revalidation decide** — committed / gone but something near / gone with nothing near · did they take one of the alternatives.
- **State re-checks** both waits re-read the request; the re-offer uses **current availability, never the set they were originally shown** ("which by definition contains one slot that no longer exists").
- **Customer touches** **2** on a path — an acknowledgement saying explicitly it is *not yet* a commitment, then one outcome message (confirm / re-offer / decline / lapse — mutually exclusive).
- **Max duration** the unresolved-request period + the choice deadline.
- **Stops when** committed, declined, or lapsed — **and a lapse is always stated**: "requesters read silence as confirmation, which is the most expensive assumption in scheduling."
- **Handoff** → SCH-173 *(not public)* when they pick an offered slot.

**SCH-280 · No-Show Follow-Up** — `no-show-rebooking` · email, sms
- **Trigger** `no_show_recorded_against_booking` — authoritative, with the semantics it was judged under, **and policy naming rebooking rather than a fee**. A passed window with no attendance event yet, and a provider running late, are both insufficient.
- **Entity / state** the single missed occurrence, `booking_id + occurrence_id`. "This says nothing about the person's history or standing."
- **Objective** state the fact without penalty language and give the single route to a new booking where one exists.
- **Success** `x.rebooked`.
- **Terminal** rebooked · closed · suppressed · handoff to SCH-180.
- **First wait** none before the message; `w.rebook` is the stated rebooking window, 7–14 days.
- **Later waits** none.
- **Decisions that matter** **did the booking genuinely not happen** (attendance and cancellation events lag) · **could the provider or resource actually have delivered** — "before telling somebody they missed something, prove it was not us who missed it" · is there anything to offer.
- **State re-checks** `a.reread` re-reads the booking's latest events **before anything leaves the building**: "the gap between the record being written and the message being sent is exactly where a correct cancellation gets treated as a miss."
- **Customer touches** **1** — a rebooking offer or an acknowledgement, never both. "One offer, not a sequence. Somebody who missed once is not pursued."
- **Max duration** the stated rebooking window.
- **Stops when** rebooked, declined, or the stated window passes — "letting it pass silently makes what was said untrue."
- **Handoff** → SCH-180 *(not public)* where our side could not have delivered. **No penalty is applied here**; the commitment's own terms own consequences.

---

## 9 · Risk, documents, rollout & incidents — 5

**RSK-273 · Usage Limit Alert** — `usage-limit-capacity-path` · in-app, email
- **Trigger** `limit_reached_and_action_blocked` — an authoritative usage figure **and an action actually blocked**. A lagging counter, or approaching a threshold with nothing stopped, are insufficient.
- **Entity / state** entity + the one limit + the measurement window, `entity_ref + limit_id + window_id`. "Reaching it is an operational fact about usage and says nothing about the person."
- **Objective** meet somebody at the moment a limit stops them with the three facts that decide what happens next — what the limit is, when it resets, whether more capacity can be bought.
- **Success** `x.reset` (the window reset and the held action can proceed) or `h.capacity` (capacity authorised).
- **Terminal** reset · blocked (no route to more capacity in this window) · handoff to SUB-166.
- **First wait** none before the wall notice, correctly — the person is standing at the block.
- **Later waits** `w.capacity` — to the **authoritative** `window_resets_at`, `required: true`. "No reset point is ever invented."
- **Decisions that matter** **what path exists from here** — purchasable / resets on its own / neither · **does the person who hit the limit hold the capacity decision**, which is the split that earns its place: where it sits elsewhere, both parties are told.
- **State re-checks** `w.capacity` re-reads the entity and limit before the timeout; the reset notice is taken from the authoritative reset, "rather than an assumed clock".
- **Customer touches** **3 per recipient** at most — the wall notice, the offer (or the blocked-party notice), and the reset notice. ⚠ Four nodes fire on the held-elsewhere path but two go to different people (F5f).
- **Max duration** to the window reset.
- **Stops when** capacity is authorised, the window resets, or the held action is abandoned.
- **Handoff** → SUB-166 *(not public)* where capacity needs a plan or terms change.
- **The free path is named wherever it exists, even in the message that offers the paid one.**

**DOC-214 · Document Delivery** — `document-distribution` · email
- **Trigger** `issued_document_requires_distribution` — an **issued** version with a party to receive it. A draft, or a document already viewed, is insufficient.
- **Entity / state** the issued version + the intended recipient, `document_version_id + recipient_id`. "Delivery state describes the distribution and never the document."
- **Objective** get a specific issued version to the party who should have it, without either fact touching the other.
- **Success** `x.distributed`.
- **Terminal** distributed · handoffs to external status reconciliation (unknown outcome) and CMS-208 (failed).
- **First wait** `w.distribution` — the communication mechanism's own delivery window (`external-window`, `required: true`). "Past it the outcome is reconciled, never assumed."
- **Later waits** none.
- **Decisions that matter** how did the distribution resolve — confirmed / failed / (on timeout) **unknown, explicitly recorded as unknown rather than delivered**.
- **State re-checks** `a.recipient` resolves the permitted route; `a.version` **binds the distribution to the exact issued version** before it goes.
- **Customer touches** **1** — raised through the canonical communication mechanism rather than a parallel delivery path of its own.
- **Max duration** the delivery window.
- **Stops when** delivery is confirmed, fails, or cannot be established.
- **Handoff** → CMS-208 on failure, **requiring that any fallback route carries the same version** · → reconciliation on unknown, carrying "the document remains valid and issued regardless of how this resolves".

**DOC-215 · Signature Reminder** — `signature-process` · email
- **Trigger** `document_requires_signature` — a version requiring signature by identified parties. A document requiring mere acknowledgement is insufficient.
- **Entity / state** the version + the signature process + each required signer, `document_version_id`. "Signatures do not carry to a successor."
- **Objective** collect every required signature on one exact version: request once per signer, remind outstanding signers once, end honestly.
- **Success** `h.effective` — fully signed, handed to DOC-216 with "signed is not effective" stated explicitly.
- **Terminal** superseded · expired · handoffs to DOC-216 and operational resolution (declined).
- **First wait** `w.signatures` — the reminder point, 3–5 days before `validity_ends_at` where one is defined, or the process's review point where none is. "The useful reminder point comes before expiry, not at it."
- **Later waits** `w.expiry` — to `validity_ends_at`, or the recorded review point. Signature collection loops through `w.signatures` once per signer against a fixed signer list.
- **Decisions that matter** **is a signature validity window even defined** — where none is, **none is invented** ("an invented signature deadline voids a request nobody withdrew") · would a reminder still change anything · what happened (signed / declined / superseded) · **are all required signatures now complete** ("one signature is not a signed document when several are required").
- **State re-checks** both waits re-read the version and each signer: who signed the **correct** version, who declined, whether the version still stands.
- **Customer touches** **2 per signer** — one request, one reminder to outstanding signers only. "A signer who signed is never reminded."
- **Max duration** the validity window, or the recorded review point.
- **Stops when** fully signed, a required signer declines, the version is superseded (outstanding requests suppressed), or the window lapses — recorded as **expired, not refused**.
- **Handoff** → DOC-216 *(not public)* · → operational resolution on a decline, carrying "the document remains validly issued — what is absent is agreement rather than the artifact".

**RLT-279 · Upgrade Blocker Reminder** — `upgrade-blocker-prompt` · in-app, email
- **Trigger** `target_held_on_named_prerequisite` — a held target, the **specific** blocker named rather than described, and a preparation window with time still in it. "A hold whose cause has not been identified" is insufficient.
- **Entity / state** target + change + the blocking prerequisite, `target_id + change_id`. "A second blocker on the same target is named in the same prompt or not at all — two prompts about one target read as two problems."
- **Objective** tell the holder the one thing standing between the target and the change, while there is still enough window left to clear it.
- **Success** `h.resume` → RLT-242.
- **Terminal** held (not theirs to clear — success class) · moot (change withdrawn) · unprepared (window closed) · handoff to RLT-242.
- **First wait** `w.clear` — to the point in the preparation window past which the target cannot be made ready in time, `required: true`. "A prompt that arrives with no time left to act on it is worse than no prompt."
- **Later waits** `w.final` — to `preparation_window_ends_at`. No third prompt.
- **Decisions that matter** **can the holder clear this blocker themselves** — if not, nothing is asked of them · is a second prompt still worth sending (is there time left in which clearing it would still make the target ready).
- **State re-checks** both waits re-read the target before the timeout.
- **Customer touches** **2** — name the blocker with the date it stops mattering, then one last call naming **the same blocker and the same date**. "A blocker nobody has cleared twice is a decision, not an oversight."
- **Max duration** the preparation window.
- **Stops when** the prerequisite is satisfied, the change is withdrawn, or the window closes.
- **Handoff** → RLT-242 *(not public)*, carrying "what the holder was told, so readiness is not announced to them twice".
- **Not ready is not failed.** An untouched target is recorded as unprepared.

**INC-254 · Incident Update** — `incident-communication` · email, in-app
- **Trigger** `incident_reaches_communication_relevant_state` — a state change that **could change what an affected party should do or expect**. "Time having passed since the last update" is explicitly insufficient.
- **Entity / state** incident + affected cohort + **state change**, `incident_id + recipient_cohort_id + state_change_id`. Each material change is its own instance, which is why one message per instance is correct.
- **Objective** tell the people actually affected something true and useful, through the mechanism that already owns delivery.
- **Success** `x.updated` or `x.closed-comms` (resolution communicated to this recipient scope).
- **Terminal** no-send (nothing material had changed) · updated · closed-comms.
- **First wait** **none.** Correct and important: an incident update that waits is not an incident update.
- **Later waits** none. "The next update is bound to a stated condition rather than to a clock."
- **Decisions that matter** **can the affected cohort be identified with reasonable precision** — broadening only as far as necessary and saying so · **is what would be said actually confirmed** — where it is not, say what is known and what is not · **does this materially change the guidance the recipient already has**, with an explicit third branch for a contractual or regulatory cadence that requires an update regardless.
- **State re-checks** `a.determine` establishes what is known, what is not, what action is needed and the condition for the next update, before anything is scoped.
- **Customer touches** **1** per material state change.
- **Max duration** a single evaluation pass per state change.
- **Stops when** nothing material has changed and no commitment requires an update (recorded, not silent), or the resolution notice goes out.
- **Handoff** none.
- A correct Trigger → decide → one message → exit journey. No waits, no splits that are not load-bearing, and a real `x.no-send` branch — the discipline most incident tooling lacks.
