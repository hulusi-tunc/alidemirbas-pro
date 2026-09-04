## ACQ-11 — Abandoned Process Recovery (preset: Incomplete Registration)

- Canonical ID: `ACQ-11`
- Slug: `abandoned-process-recovery`
- Preset ID: `incomplete-registration`
- Display name: Abandoned Process Recovery
- Canonical name (chain form): Process started → abandonment confirmed → recovered, superseded or lapsed
- Source route: `/lab/customer-journeys/incomplete-registration`
- Category: Acquisition, intent & qualification
- Goal: recovery-retry
- Channels: email, push, in-app, sms
- Surface: customer (communicating)

**Purpose**: Return a person to a resumable process they started and did not complete - a checkout, an application, a quote, a registration - while it is still resumable, without ever asserting a state the system does not hold.

> Bring the person back to the specific unfinished process and let them complete it; never claim reserved stock, a held price or a discount the system does not assert.

**Preset · Incomplete Registration**
- canonical rule: The resumable process is a registration or sign-up left part-way; identity verification, where required, is handed to verification (IDN-81) and never re-asked here.
- sets: recovery.first_check = 1 hour–4 hours
- destination: the registration step

### Trigger
- Event: `process_started`
- Meaning: an authoritative record that a resumable process (checkout, application, quote, registration) opened for a person with at least one item and a resumable state
- Not enough on its own: a cart page view; an item added without entering the process - that is a recorded selection, Abandoned Selection Recovery's subject; a process with no items; a process already completed, cancelled or expired
- Requires: an authoritative record that a resumable process opened for this person; at least one item in the process; a resumable state and a resume destination; the time of the last activity on the process
- Source: authoritative

### Entity
- Scope: the logical process - the basket-and-checkout, application, quote or registration the person is trying to complete - not the platform's identifier for it
- instance: person_id + logical_process_id · one-active-per-key
- recommended default: A new logical process for the same person supersedes an open instance - two recovery sequences to one person about two baskets is the duplicate-communication failure. A company whose processes are genuinely independent (a marketplace, a B2B account with separate buyers) sets concurrency to many and lets the person-level pressure cap protect the person.

### Who enters
- the identity behind the process resolves to a person we may contact
- the process is still resumable in the system of record, with at least one item and a resume destination
- no recovery instance is already open for this logical process
- no payment failure is recorded on the process - a failed payment is FIN-134's, not abandonment
- purpose-level permission for commercial recovery communication is recorded, and hard gates (GLB-31) allow it

### Suppressed when
- [canonical rule] Exit the moment the process completes by any channel - in the product, in a store, by phone. A recovery message about a completed process is the failure this journey exists to prevent, and every touch re-reads the process first.
- [canonical rule] Exit when the process is cancelled by the person, expired by the platform, or emptied. Nothing is sent about a process the person cannot return to.
- [canonical rule] A payment failure on the process hands the instance to payment failure recovery (FIN-134). The two never message the same person about the same process.
- [canonical rule] No touch without purpose-level permission for commercial recovery communication; absent permission is a recorded no-action, never a fallback to another channel.
- [canonical rule] An open retention-outreach journey, an open complaint or an open payment recovery on the same account outranks this journey; its touch is deferred and re-evaluated against current state, not queued blindly (GLB-06).
- [recommended default] A newer logical process for the same person supersedes this instance (see the entity's supersession statement).
- [recommended default] A new process opened inside the cooldown after a lapsed or suppressed instance enters, is tracked, and sends nothing.
- [optional strategy] If the company enables an incentive (recovery.incentive_policy), it appears only on the last enabled touch, once, and its issuance is recorded per person so it cannot be re-issued on the next process. The library recommends none by default: an incentive on the first touch teaches abandonment.

### Recommended orchestration · progressive-recovery
1. **initial-recovery** (promotional, canonical rule)
   - Timing: The first check waits long enough after the last activity that the person has actually left the process rather than paused inside it, and no longer than the intent stays fresh. (example: 30 minutes–60 minutes; configure recovery.first_check) (relative to last_activity_at)
   - cancelled by the logical process reached its completion in the system of record; the person cancelled the logical process; the platform expired the logical process; every item was removed from the process; an authoritative provider response classifies a payment attempt as failed
   - re-read before sending: the process re-read from the system of record: still resumable, items still present, no order placed, no payment failure
   - checks: What is the process now? · May the first touch go out?
   - Channel roles: low-friction -> persistent
   - Purpose: The process is still open; here are the items; here is the link that reopens this exact process with its state restored. Nothing the system does not assert.
   - destination: `process-resume` · bound to `logical_process_id` · must not claim: stock is reserved, the price is held, a discount applies
2. **follow-up** (promotional, canonical rule)
   - Timing: The second check comes after the person has had a chance to act on the first touch in their own time, and before the process stops being resumable. (example: 20 hours–28 hours; configure recovery.second_check) (after the previous touch)
   - cancelled by an authenticated session resumes the same logical process; the logical process reached its completion in the system of record; the person cancelled the logical process; the platform expired the logical process; every item was removed from the process; an authoritative provider response classifies a payment attempt as failed
   - re-read before sending: the process re-read from the system of record, plus whether the person resumed it since the first touch
   - checks: What is the process now, and did they come back? · May the second touch go out?
   - Channel roles: persistent -> low-friction
   - Purpose: Address the likely blocker - shipping, returns, trust, a route to ask a question - with the same link. Still nothing the system does not assert.
   - destination: `process-resume` · bound to `logical_process_id` · must not claim: stock is reserved, the price is held, a discount applies
   - after t1
3. **final-notice** (promotional, optional strategy)
   - Timing: The recovery lifetime ends before the platform's own resumable lifetime, so the last touch never points at a process that has already closed. (example: 3 days–7 days; configure recovery.lifetime) (after the trigger)
   - cancelled by the logical process reached its completion in the system of record; the person cancelled the logical process; the platform expired the logical process; every item was removed from the process; an authoritative provider response classifies a payment attempt as failed
   - re-read before sending: the process re-read from the system of record, and whether the platform asserts an expiry
   - checks: At the end of the recovery lifetime, what is the process? · Is a final notice enabled, and is there a real expiry to name?
   - Channel roles: persistent -> urgent
   - Purpose: The last honest statement: the process closes at its real expiry, and here is the link. No urgency the system does not assert.
   - destination: `process-resume` · bound to `logical_process_id` · must not claim: an expiry the platform does not enforce, stock is reserved, the price is held
   - after t2

**Channel roles** (recommended default)
- low-friction (push, in-app) — an app session or a valid push token exists for this person - the intent is minutes old and a nudge back beats content
- persistent (email) — no low-friction route exists, or the touch has to carry the items and survive until the person can act
- urgent (sms) — explicit commercial SMS permission exists and the process carries an asserted time-bound element - an expiry, a hold, a delivery cut-off
- delivery fallback: same-role-other-channel

### Stops when
- [success] completed; the process reached its end (re-entry: a new logical process is a new instance; this one is closed as converted)
- [invalid-state] closed unfinished - cancelled, expired or emptied; nothing further is sent (re-entry: a new logical process is a new instance)
- [suppression] superseded by a newer process for the same person (re-entry: none for this process; the newer process owns recovery)
- [no-action] no touch sent; the gate that stopped it is recorded (re-entry: a new logical process is a new instance, subject to the cooldown when this one lapsed or was suppressed)
- [timeout] recovery lifetime passed with the process still open; nothing further is sent (re-entry: a new logical process is a new instance, and enters silently while the cooldown runs)
- [handoff] Payment Failure Recovery — a payment failure recorded against the process - a failed payment is not abandonment

### Configure
- `recovery.first_check` [recommended default] (recovery-window): 1 hour–4 hours (preset override; canonical default: 30 minutes–60 minutes) — The first check waits long enough after the last activity that the person has actually left the process rather than paused inside it, and no longer than the intent stays fresh.
- `recovery.second_check` [recommended default] (recovery-window): 20 hours–28 hours — The second check comes after the person has had a chance to act on the first touch in their own time, and before the process stops being resumable.
- `recovery.resume_rearms` [recommended default]: 1 — A return re-arms the wait a bounded number of times; the budget is fixed when the instance opens and does not renew on activity.
- `recovery.lifetime` [recommended default] (recovery-window): 3 days–7 days — The recovery lifetime ends before the platform's own resumable lifetime, so the last touch never points at a process that has already closed.
- `recovery.process_expiry` [recommended default] (attribute-bound): expires_at as asserted by the platform — The final wait ends when the platform's own expiry does; nothing is sent after it.
- `recovery.touches` [recommended default]: 3 — Every touch runs against a budget fixed when the instance opened; the budget is the plan's own length, and no touch is repeated because nothing could tell whether it arrived.
- `recovery.cooldown` [recommended default] (cooldown): 7 days–30 days — After a lapsed or suppressed instance, a new process by the same person is tracked but not messaged until the cooldown has passed. A completed process carries no cooldown.
- `recovery.holdout_share` [recommended default]: 10 — A persistent per-person holdout is required: people who abandon a process complete it on their own often enough that a treated-only measurement cannot tell the journey's effect from theirs.

### Required data
**Semantic events to map**
- `process_started` (authoritative) — an authoritative record that a resumable process (checkout, application, quote, registration) opened for a person with at least one item and a resumable state
- `process_completed` (authoritative) — the logical process reached its completion in the system of record
- `process_cancelled` (declared) — the person cancelled the logical process
- `process_expired` (authoritative) — the platform expired the logical process
- `items_removed_all` (declared) — every item was removed from the process
- `payment_failed` (authoritative) — an authoritative provider response classifies a payment attempt as failed
- `process_resumed` (authoritative) — an authenticated session resumes the same logical process
**Attributes**: logical_process_id · person_id · items · started_at · last_activity_at · resume_destination
**optional**: expires_at · value · currency · category · has_active_app_session · hold_expires_at · delivery_cutoff_at

### Collision & priority
- priority: promotional
- pressure class: promotional
- local cap: 3 (all)
- cooldown: 7 days–30 days
- competition: commerce-recovery (person) - highest in the group - a process in motion outranks a held selection, an inferred interest or a predicted need for the same person
- No action when s.completed · s.invalid · s.payment · s.permission · s.contest · s.superseded · s.cooldown — the suppressions above are recorded outcomes, never a fallback to another channel

### Measurement
- journey outcome: exit-or-handoff: x.converted, x.invalid, x.superseded, x.no-action, x.lapsed, h.payment
- business outcome: process_completed — the logical process reached its completion in the system of record
- observed: in this journey
- attribution: touched-before-event · persistent-holdout
- guardrails: unsubscribe · complaint · message_after_success · incentive_issued · support_contact_within_24h

### Presets
- **Checkout Abandonment** [canonical rule] — The resumable process is a checkout with a basket: it has items, a resume destination and, usually, a platform-asserted expiry.
- **Quote Abandonment** [canonical rule] — The resumable process is a quote or proposal the person configured and did not accept; it has a resume destination and an expiry the quoting system asserts. (recovery.first_check = 4 hours–24 hours)
- **Application Abandonment** [canonical rule] — The resumable process is a multi-step application with saved state; a hard submission deadline, where one exists, is owned by deadline reminder (TIM-61) through handoff, not by this recovery. (recovery.first_check = 4 hours–24 hours)
- **Incomplete Registration** [canonical rule] — The resumable process is a registration or sign-up left part-way; identity verification, where required, is handed to verification (IDN-81) and never re-asked here. (recovery.first_check = 1 hour–4 hours)

### Reusable rule
An abandoned process is recovered against its own current state, re-read before every touch, with a bounded plan fixed at entry - never against a snapshot of what the person once had in it.

### Entity (notes)
- the logical process - the basket-and-checkout, application, quote or registration the person is trying to complete - not the platform's identifier for it
- One instance per logical process. A platform that rotates its process id when the same basket resumes still has one process, and the company's mapping resolves the new id to the open instance rather than opening a second. Two different baskets are two processes; whether they may both be pursued is the supersession statement below.

### Distinct from
- ACQ-08 (Commercial destination reached → acquisition suppression → lifecycle handoff) — ACQ-08 makes acquisition give up ownership the moment a destination is reached. This journey pursues one specific unfinished process and gives up when it completes, closes or is superseded.
- SCH-282 (Availability searched, no booking → nearest window or waitlist) — SCH-282 follows an availability enquiry that holds nothing. A process has state the person can return to, which is what makes recovery honest.

### Guardrails
1. Nothing is claimed that the system does not assert: no reserved stock, no held price, no discount, no expiry the platform does not enforce.
2. Opens and clicks are engagement evidence and change nothing; only process events move the state.
3. The clock runs from last activity before the first touch and from the previous touch after it; no window extends on engagement.
4. A link into an expired process resolves to the person's current basket or an honest closed-process page, never a dead end.
5. An incentive, where enabled, appears once and only on the last enabled touch.

### Technical logic (graph, 26 nodes)
- **t.started** [trigger] (entry, evidence: authoritative)
  - Event id: `process_started`
  - Process started
  - evidence: authoritative
  - requires: an authoritative record that a resumable process opened for this person
  - requires: at least one item in the process
  - requires: a resumable state and a resume destination
  - requires: the time of the last activity on the process
  - not enough on its own: a cart page view
  - not enough on its own: an item added without entering the process - that is a recorded selection, Abandoned Selection Recovery's subject
  - not enough on its own: a process with no items
  - not enough on its own: a process already completed, cancelled or expired
  - -> c.eligible (node)
- **c.eligible** [condition] (2 branches)
  - Can this process be recovered for this person at all?
  - -> a.open [Eligible]: the identity resolves to a contactable person, the process is resumable with items and a destination, no instance is open for it, no payment failure is recorded on it, and commercial recovery permission is recorded (node)
  - -> x.no-action [Not eligible]: any of those fails - the reason is recorded as the no-action reason (node)
- **a.open** [action]
  - Open the recovery instance against the logical process and start the abandonment clock from the last activity on it, not from when it opened. Activity before the first touch moves the clock; nothing after the first touch extends any window
  - writes recovery_log (append)
  - -> w.abandon (node)
- **x.no-action** [exit]
  - no touch sent; the gate that stopped it is recorded
  - Detail: a new logical process is a new instance, subject to the cooldown when this one lapsed or was suppressed
- **w.abandon** [wait]
  - until the logical process reached its completion in the system of record, or the person cancelled the logical process, or the platform expired the logical process, or every item was removed from the process, or an authoritative provider response classifies a payment attempt as failed
  - Detail: timeout after The first check waits long enough after the last activity that the person has actually left the process rather than paused inside it, and no longer than the intent stays fresh. (example: 30 minutes–60 minutes; configure recovery.first_check)
  - a person still inside the process is not abandoning it; the clock runs from their last activity so that pausing is not punished
  - engagement does not extend the window
  - -> c.state [on event] (node)
  - -> c.state [on timeout] (node)
- **c.state** [condition] (5 branches)
  - What is the process now?
  - -> c.sendable [Still resumable]: the process is open with items and a resume destination and no order has been placed against it (node)
  - -> x.converted [Completed]: an order or completion is recorded against the process by any channel (node)
  - -> x.invalid [Cancelled, expired or emptied]: the person cancelled it, the platform expired it, or every item was removed (node)
  - -> x.superseded [Superseded]: a newer logical process exists for the same person and the supersession rule applies (node)
  - -> h.payment [Payment failed]: a payment failure is recorded against this process (node)
- **c.sendable** [condition] (2 branches)
  - May the first touch go out?
  - -> a.touch1 [Sendable]: the send path passes: permission for commercial recovery, a deliverable destination, the promotional pressure cap, no higher-precedence contest on the account, and no cooldown in force (node)
  - -> a.record-no-action [Suppressed]: a gate stops it; the gate is recorded as the reason (node)
- **x.converted** [exit]
  - completed; the process reached its end
  - Detail: a new logical process is a new instance; this one is closed as converted
- **x.invalid** [exit]
  - closed unfinished - cancelled, expired or emptied; nothing further is sent
  - Detail: a new logical process is a new instance
- **x.superseded** [exit]
  - superseded by a newer process for the same person
  - Detail: none for this process; the newer process owns recovery
- **h.payment** [handoff]
  - Payment failure → classify → recover, alternate or exit
  - Detail: a payment failure recorded against the process - a failed payment is not abandonment
  - carries: the logical process and its items
  - carries: the obligation the failed attempt was against
  - carries: that recovery communication about the process stops here
  - suppresses: every queued recovery touch for this process
  - -> FIN-134 (journey)
- **a.touch1** [action] (execution: communication)
  - Say the process is still open, show the items as they are now, and give the link that reopens this exact process with its state restored. Claim nothing the system does not assert - no reserved stock, no held price, no discount
  - writes recovery_log (append)
  - -> w.second (node)
- **a.record-no-action** [action]
  - Record which gate stopped the touch and against which process, so no-action is a measured outcome rather than a silent absence
  - writes suppressed_sends (append)
  - -> x.no-action (node, back-edge)
- **w.second** [wait]
  - until an authenticated session resumes the same logical process, or the logical process reached its completion in the system of record, or the person cancelled the logical process, or the platform expired the logical process, or every item was removed from the process, or an authoritative provider response classifies a payment attempt as failed
  - Detail: timeout after The second check comes after the person has had a chance to act on the first touch in their own time, and before the process stops being resumable. (example: 20 hours–28 hours; configure recovery.second_check)
  - a second touch inside the same hour is pressure, not help; a second touch after the process has expired is noise
  - engagement does not extend the window
  - -> c.state2 [on event] (node)
  - -> c.state2 [on timeout] (node)
- **c.state2** [condition] (6 branches)
  - What is the process now, and did they come back?
  - -> x.converted [Completed]: an order or completion is recorded against the process (node, back-edge)
  - -> x.invalid [Cancelled, expired or emptied]: the process can no longer be returned to (node, back-edge)
  - -> x.superseded [Superseded]: a newer logical process exists for the same person and the supersession rule applies (node, back-edge)
  - -> h.payment [Payment failed]: a payment failure is recorded against this process (node, back-edge)
  - -> a.note-return [Resumed, still open]: an authenticated session touched the process since the first touch and it is still open - the person is deciding, not forgetting (node)
  - -> c.sendable2 [Still open, not resumed]: the process is open and untouched since the first touch (node)
- **a.note-return** [action]
  - Record the return and re-arm one further wait from the new last activity. A person who came back and left again is deciding; the second touch is held once, not skipped and not hurried
  - writes recovery_log (append)
  - -> w.resumed (node)
- **c.sendable2** [condition] (2 branches)
  - May the second touch go out?
  - -> a.touch2 [Sendable]: the send path passes and the touch budget is not spent (node)
  - -> a.record-no-action [Suppressed]: a gate stops it; the gate is recorded (node, back-edge)
- **w.resumed** [wait]
  - until the logical process reached its completion in the system of record, or the person cancelled the logical process, or the platform expired the logical process, or every item was removed from the process, or an authoritative provider response classifies a payment attempt as failed
  - Detail: timeout after After a return, the same first-check interval runs again from the new last activity. (example: 30 minutes–60 minutes; configure recovery.first_check)
  - the person is inside the process again; the same patience applies as before the first touch
  - engagement does not extend the window
  - -> c.state2 [on event] (node, back-edge)
  - -> c.state2 [on timeout] (node, back-edge)
- **a.touch2** [action] (execution: communication)
  - Address the likely blocker - shipping, returns, trust, a route to ask a question - with the same link back into the process. Still nothing the system does not assert
  - writes recovery_log (append)
  - -> w.final (node)
- **w.final** [wait]
  - until the logical process reached its completion in the system of record, or the person cancelled the logical process, or the platform expired the logical process, or every item was removed from the process, or an authoritative provider response classifies a payment attempt as failed
  - Detail: timeout after The recovery lifetime ends before the platform's own resumable lifetime, so the last touch never points at a process that has already closed. (example: 3 days–7 days; configure recovery.lifetime)
  - an unfinished process stops being an intent and becomes a record; pursuing it past that point is pressure
  - engagement does not extend the window
  - -> c.state3 [on event] (node)
  - -> c.state3 [on timeout] (node)
- **c.state3** [condition] (5 branches)
  - At the end of the recovery lifetime, what is the process?
  - -> x.converted [Completed]: an order or completion is recorded against the process (node, back-edge)
  - -> x.invalid [Cancelled, expired or emptied]: the process can no longer be returned to (node, back-edge)
  - -> x.superseded [Superseded]: a newer logical process exists for the same person and the supersession rule applies (node, back-edge)
  - -> h.payment [Payment failed]: a payment failure is recorded against this process (node, back-edge)
  - -> c.final-enabled [Still open]: the process is open and resumable (node)
- **c.final-enabled** [condition] (2 branches)
  - Is a final notice enabled, and is there a real expiry to name?
  - -> a.touch3 [Enabled, expiry asserted]: the company has enabled the final notice (recovery.final_notice_enabled), the platform asserts an expiry for this process, and the send path passes (node)
  - -> x.lapsed [Disabled, or no honest expiry]: the final notice is disabled, or no expiry is asserted that the notice could truthfully name (node)
- **a.touch3** [action] (execution: communication)
  - Say, once, that the process closes at its real expiry and give the link. No urgency the system does not assert, and no incentive unless policy enables one for the last touch
  - writes recovery_log (append)
  - -> w.close (node)
- **x.lapsed** [exit]
  - recovery lifetime passed with the process still open; nothing further is sent
  - Detail: a new logical process is a new instance, and enters silently while the cooldown runs
- **w.close** [wait]
  - until the logical process reached its completion in the system of record, or the person cancelled the logical process, or the platform expired the logical process, or every item was removed from the process, or an authoritative provider response classifies a payment attempt as failed
  - Detail: timeout after The final wait ends when the platform's own expiry does; nothing is sent after it. (recommended: expires_at as asserted by the platform; configure recovery.process_expiry)
  - after the final notice the only remaining question is whether the process completed before it closed
  - engagement does not extend the window
  - -> c.close [on event] (node)
  - -> x.lapsed [on timeout] (node, back-edge)
- **c.close** [condition] (3 branches)
  - What ended the final wait?
  - -> x.converted [Completed]: an order or completion is recorded against the process (node, back-edge)
  - -> h.payment [Payment failed]: a payment failure is recorded against this process (node, back-edge)
  - -> x.invalid [Closed unfinished]: the process was cancelled, expired or emptied (node, back-edge)

---
