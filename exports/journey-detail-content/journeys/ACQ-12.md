## ACQ-12 — Abandoned Selection Recovery

- Canonical ID: `ACQ-12`
- Slug: `abandoned-selection-recovery`
- Display name: Abandoned Selection Recovery
- Canonical name (chain form): Selection recorded → held without a process → recovered, carried into a process, cleared or lapsed
- Source route: `/lab/customer-journeys/abandoned-selection-recovery`
- Category: Acquisition, intent & qualification
- Goal: recovery-retry
- Channels: email, push, in-app
- Surface: customer (communicating)

**Purpose**: Return a person to items they selected - a cart, a basket, a saved list - and did not carry into a process, while the selection still stands and the items are still available, without asserting a state the system does not hold.

> Bring the person back to the selection as it currently stands and let them act on it; never claim reserved stock, a held price or a discount the system does not assert, and never present an item the platform says is unavailable.

### Trigger
- Event: `selection_recorded`
- Meaning: a selection is recorded against the person in the system of record without a process being started
- Not enough on its own: a product view - that is Unresolved Interest Recovery's subject; an item added and removed inside the same session; a selection already carried into a process - that is Abandoned Process Recovery's subject; a selection whose every item the platform asserts as unavailable
- Requires: an authoritative record that one or more items were placed in a selection for this person; the items, their current availability and current price as the platform asserts them; the time of the last activity on the selection
- Source: authoritative

### Entity
- Scope: the recorded selection - the set of items a person put in a cart, basket or saved list - which has no process state and no expiry of its own
- instance: person_id + selection_id · one-active-per-key
- canonical rule: A process started from the selection supersedes this instance: Abandoned Process Recovery owns the person from that moment, and every queued touch here is suppressed.

### Who enters
- the identity behind the selection resolves to a person we may contact
- the selection holds at least one item the platform currently asserts as available
- the selection has not been carried into a process, and no process is open for its items
- no recovery instance is already open for this selection
- purpose-level permission for commercial recovery communication is recorded, and hard gates (GLB-31) allow it

### Suppressed when
- [canonical rule] Exit the moment an order including any item from the selection is recorded by any channel; every touch re-reads the selection first.
- [canonical rule] A process started from the selection hands the instance to Abandoned Process Recovery (ACQ-11); the two never message the same person about the same items.
- [canonical rule] Exit when the person clears the selection or every item becomes unavailable; nothing is sent about items the person cannot act on.
- [canonical rule] An item the platform asserts as unavailable is never shown in a touch; a touch about a selection shows only what can still be acted on.
- [canonical rule] No touch without purpose-level permission for commercial recovery communication; absent permission is a recorded no-action, never a fallback to another channel.
- [canonical rule] A process recovery, an open complaint, an open payment recovery or a retention-outreach journey on the same person outranks this journey; its touch is deferred and re-evaluated against current state (GLB-06).
- [recommended default] A new selection made inside the cooldown after a lapsed or suppressed instance enters, is tracked, and sends nothing.
- [optional strategy] If the company enables an incentive (selection.incentive_policy), it appears only on the last enabled touch, once, and its issuance is recorded per person. The library recommends none by default.

### Recommended orchestration · progressive-recovery
1. **initial-recovery** (promotional, canonical rule)
   - Timing: The first check waits long enough after the last selection activity that the person has actually left rather than paused, and no longer than the selection is likely to be remembered. (example: 1 hour–4 hours; configure selection.first_check) (relative to last_selection_activity_at)
   - cancelled by an order or completion is recorded that includes at least one item from the selection; every item was removed from the selection by the person, or the selection was deleted; an authoritative record that a resumable process (checkout, application, quote, registration) opened for a person with at least one item and a resumable state; an item was added to or removed from the selection while at least one item remains
   - re-read before sending: the selection re-read from the system of record: items present, each item's availability and price as the platform asserts them, no order placed, no process opened
   - checks: What is the selection now? · Can any of it still be acted on? · May the first touch go out?
   - Channel roles: low-friction -> persistent
   - Purpose: The selection as it currently stands - only the items still available - and the link that reopens it. Nothing the system does not assert.
   - destination: `selection-resume` · bound to `selection_id` · must not claim: stock is reserved, the price is held, a discount applies, an expiry
2. **follow-up** (promotional, recommended default)
   - Timing: The second check comes after the person has had time to act on the first touch in their own time, and before the selection stops being something they remember. (example: 2 days–4 days; configure selection.second_check) (after the previous touch)
   - cancelled by an order or completion is recorded that includes at least one item from the selection; every item was removed from the selection by the person, or the selection was deleted; an authoritative record that a resumable process (checkout, application, quote, registration) opened for a person with at least one item and a resumable state; the platform asserts that an item in the selection is no longer available for purchase; the platform asserts a price change on an item in the selection
   - re-read before sending: the selection re-read from the system of record, plus whether any held item changed in availability or price since the first touch
   - checks: What is the selection now, and did anything about it change? · May the second touch go out?
   - Channel roles: persistent -> low-friction
   - Purpose: The selection again, with any genuine change the platform asserts on an item still held - a restored availability, a changed price - and the same link. No urgency the system does not assert.
   - destination: `selection-resume` · bound to `selection_id` · must not claim: stock is reserved, the price is held, a discount applies, an expiry
   - after t1

**Channel roles** (recommended default)
- low-friction (push, in-app) — an app session or a valid push token exists for this person - the selection is recent and a nudge back beats content
- persistent (email) — no low-friction route exists, or the touch has to carry the items as they stand and survive until the person can act
- delivery fallback: same-role-other-channel

### Stops when
- [success] converted; an order including a selected item is recorded (re-entry: a new selection is a new instance; this one is closed as converted)
- [invalid-state] cleared by the person; nothing further is sent (re-entry: a new selection is a new instance)
- [invalid-state] every selected item unavailable; nothing is sent about items that cannot be acted on (re-entry: availability restored is an authoritative event for a later availability journey, not a re-entry here)
- [no-action] no touch sent; the gate that stopped it is recorded (re-entry: a new selection is a new instance, subject to the cooldown when this one lapsed or was suppressed)
- [timeout] recovery lifetime passed with the selection still held; nothing further is sent (re-entry: a new selection is a new instance, and enters silently while the cooldown runs)
- [handoff] Abandoned Process Recovery — a process started from the selection - the process owns recovery from that moment

### Configure
- `selection.first_check` [recommended default] (recovery-window): 1 hour–4 hours — The first check waits long enough after the last selection activity that the person has actually left rather than paused, and no longer than the selection is likely to be remembered.
- `selection.change_rearms` [recommended default]: 2 — A change re-arms the wait a bounded number of times; the budget is fixed when the instance opens and does not renew on activity.
- `selection.second_check` [recommended default] (recovery-window): 2 days–4 days — The second check comes after the person has had time to act on the first touch in their own time, and before the selection stops being something they remember.
- `selection.lifetime` [recommended default] (recovery-window): 7 days–14 days — The recovery lifetime is the period in which a held selection is still an intent rather than a record; past it nothing further is sent.
- `selection.touches` [recommended default]: 2 — Every touch runs against a budget fixed when the instance opened; the budget is the plan's own length, and no touch is repeated because nothing could tell whether it arrived.
- `selection.cooldown` [recommended default] (cooldown): 14 days–30 days — After a lapsed or suppressed instance, a new selection by the same person is tracked but not messaged until the cooldown has passed. A converted selection carries no cooldown.
- `selection.holdout_share` [recommended default]: 10 — A persistent per-person holdout is required: people who leave a selection return to it on their own often enough that a treated-only measurement cannot tell the journey's effect from theirs.

### Required data
**Semantic events to map**
- `selection_recorded` (authoritative) — a selection is recorded against the person in the system of record without a process being started
- `selection_converted` (authoritative) — an order or completion is recorded that includes at least one item from the selection
- `selection_cleared` (declared) — every item was removed from the selection by the person, or the selection was deleted
- `process_started` (authoritative) — an authoritative record that a resumable process (checkout, application, quote, registration) opened for a person with at least one item and a resumable state
- `selection_changed` (declared) — an item was added to or removed from the selection while at least one item remains
- `item_unavailable` (authoritative) — the platform asserts that an item in the selection is no longer available for purchase
- `price_changed` (authoritative) — the platform asserts a price change on an item in the selection
**Attributes**: selection_id · person_id · items · last_selection_activity_at · resume_destination
**optional**: value · currency · category · has_active_app_session · item_availability · item_prices

### Collision & priority
- priority: promotional
- pressure class: promotional
- local cap: 2 (all)
- cooldown: 14 days–30 days
- competition: commerce-recovery (person) - below process recovery - a process in motion outranks a held selection; above interest recovery and predicted-need replenishment for the same person
- No action when s.converted · s.process · s.cleared · s.unavailable-shown · s.permission · s.contest · s.cooldown — the suppressions above are recorded outcomes, never a fallback to another channel

### Measurement
- journey outcome: exit-or-handoff: x.converted, x.invalid, x.unavailable, x.no-action, x.lapsed, h.process
- business outcome: selection_converted — an order or completion is recorded that includes at least one item from the selection
- observed: in this journey
- attribution: touched-before-event · persistent-holdout
- guardrails: unsubscribe · complaint · message_after_success · unavailable_item_shown · incentive_issued

### Presets
- **Cart Abandonment** [canonical rule] — The selection is a shopping cart or basket the person filled without starting checkout; the platform asserts item availability and price.
- **Saved Item Reminder** [canonical rule] — The selection is a saved list or wishlist: a declared interest with no purchase intent asserted, so the first check is much later and a change on a saved item is the honest reason to write. (selection.first_check = 3 days–7 days · selection.lifetime = 14 days–30 days)

### Reusable rule
A held selection is recovered against its own current state - items, availability, price - re-read before every touch, with no deadline invented for something that has none.

### Entity (notes)
- the recorded selection - the set of items a person put in a cart, basket or saved list - which has no process state and no expiry of its own
- A selection is not a process: nothing is in motion, nothing expires, and the person can return to it or not. That is why this journey has no final notice - there is no honest deadline to name. When the person carries the selection into a process, the process owns recovery from that moment.

### Distinct from
- ACQ-11 (Process started → abandonment confirmed → recovered, superseded or lapsed) — ACQ-11 pursues a process with state, an expiry and a resume destination. A selection has no process state and no expiry, which is why this journey never names a deadline and hands over the moment a process starts.
- ACQ-13 (Interest inferred → qualified → resolved into a selection or purchase, or left alone) — ACQ-13 works from inferred attention. A selection is a recorded fact the person created, and the touch can show it back to them.

### Guardrails
1. Nothing is claimed that the system does not assert: no reserved stock, no held price, no discount, no expiry.
2. An unavailable item is never shown; a selection with nothing available exits silently.
3. Opens and clicks are engagement evidence and change nothing; only selection, order and process events move the state.
4. A process started from the selection hands over immediately; two recoveries never run against the same items.

### Presets available
- Cart Abandonment (`cart-abandonment`)
- Saved Item Reminder (`saved-item-reminder`)

### Technical logic (graph, 22 nodes)
- **t.selected** [trigger] (entry, evidence: authoritative)
  - Event id: `selection_recorded`
  - Selection recorded
  - evidence: authoritative
  - requires: an authoritative record that one or more items were placed in a selection for this person
  - requires: the items, their current availability and current price as the platform asserts them
  - requires: the time of the last activity on the selection
  - not enough on its own: a product view - that is Unresolved Interest Recovery's subject
  - not enough on its own: an item added and removed inside the same session
  - not enough on its own: a selection already carried into a process - that is Abandoned Process Recovery's subject
  - not enough on its own: a selection whose every item the platform asserts as unavailable
  - -> c.eligible (node)
- **c.eligible** [condition] (2 branches)
  - Can this selection be recovered for this person at all?
  - -> a.open [Eligible]: the identity resolves to a contactable person, at least one item is available, no process is open for the items, no instance is open for this selection, and commercial recovery permission is recorded (node)
  - -> x.no-action [Not eligible]: any of those fails - the reason is recorded as the no-action reason (node)
- **a.open** [action]
  - Open the recovery instance against the selection and start the clock from the last activity on it. Activity before the first touch moves the clock; nothing after the first touch extends any window
  - writes recovery_log (append)
  - -> w.settle (node)
- **x.no-action** [exit]
  - no touch sent; the gate that stopped it is recorded
  - Detail: a new selection is a new instance, subject to the cooldown when this one lapsed or was suppressed
- **w.settle** [wait]
  - until an order or completion is recorded that includes at least one item from the selection, or every item was removed from the selection by the person, or the selection was deleted, or an authoritative record that a resumable process (checkout, application, quote, registration) opened for a person with at least one item and a resumable state, or an item was added to or removed from the selection while at least one item remains
  - Detail: timeout after The first check waits long enough after the last selection activity that the person has actually left rather than paused, and no longer than the selection is likely to be remembered. (example: 1 hour–4 hours; configure selection.first_check)
  - a person still adding to a selection is not abandoning it; the clock runs from their last activity
  - engagement does not extend the window
  - -> c.state [on event] (node)
  - -> c.state [on timeout] (node)
- **c.state** [condition] (5 branches)
  - What is the selection now?
  - -> x.converted [Converted]: an order including any item from the selection is recorded (node)
  - -> x.invalid [Cleared]: the person removed every item or deleted the selection (node)
  - -> h.process [Carried into a process]: a process was started from the selection (node)
  - -> a.rearm [Changed, still held]: an item was added or removed and at least one remains - the person is still deciding (node)
  - -> c.availability [Still held]: the selection stands as it was (node)
- **x.converted** [exit]
  - converted; an order including a selected item is recorded
  - Detail: a new selection is a new instance; this one is closed as converted
- **x.invalid** [exit]
  - cleared by the person; nothing further is sent
  - Detail: a new selection is a new instance
- **h.process** [handoff]
  - Process started → abandonment confirmed → recovered, superseded or lapsed
  - Detail: a process started from the selection - the process owns recovery from that moment
  - carries: the selection and its items
  - carries: the recovery touches already sent for the selection, so the process plan counts them against the person
  - suppresses: every queued recovery touch for this selection
  - -> ACQ-11 (journey)
- **a.rearm** [action]
  - Record the change and re-arm the first wait from the new last activity, a bounded number of times. A person still editing a selection is deciding, not forgetting
  - writes recovery_log (append)
  - -> w.settle (node, back-edge)
- **c.availability** [condition] (2 branches)
  - Can any of it still be acted on?
  - -> c.sendable [At least one item available]: the platform asserts at least one selected item as available (node)
  - -> x.unavailable [Nothing available]: the platform asserts every selected item as unavailable (node)
- **c.sendable** [condition] (2 branches)
  - May the first touch go out?
  - -> a.touch1 [Sendable]: the send path passes: permission for commercial recovery, a deliverable destination, the promotional pressure cap, no higher-precedence contest on the person, and no cooldown in force (node)
  - -> a.record-no-action [Suppressed]: a gate stops it; the gate is recorded as the reason (node)
- **x.unavailable** [exit]
  - every selected item unavailable; nothing is sent about items that cannot be acted on
  - Detail: availability restored is an authoritative event for a later availability journey, not a re-entry here
- **a.touch1** [action] (execution: communication)
  - Show the selection as it stands now - only the items the platform asserts as available - and give the link that reopens it. Claim nothing the system does not assert: no reserved stock, no held price, no discount, no expiry
  - writes recovery_log (append)
  - -> w.second (node)
- **a.record-no-action** [action]
  - Record which gate stopped the touch and against which selection, so no-action is a measured outcome rather than a silent absence
  - writes suppressed_sends (append)
  - -> x.no-action (node, back-edge)
- **w.second** [wait]
  - until an order or completion is recorded that includes at least one item from the selection, or every item was removed from the selection by the person, or the selection was deleted, or an authoritative record that a resumable process (checkout, application, quote, registration) opened for a person with at least one item and a resumable state, or the platform asserts that an item in the selection is no longer available for purchase, or the platform asserts a price change on an item in the selection
  - Detail: timeout after The second check comes after the person has had time to act on the first touch in their own time, and before the selection stops being something they remember. (example: 2 days–4 days; configure selection.second_check)
  - a second touch inside the same day is pressure, not help
  - engagement does not extend the window
  - -> c.state2 [on event] (node)
  - -> c.state2 [on timeout] (node)
- **c.state2** [condition] (5 branches)
  - What is the selection now, and did anything about it change?
  - -> x.converted [Converted]: an order including any item from the selection is recorded (node, back-edge)
  - -> x.invalid [Cleared]: the person removed every item or deleted the selection (node, back-edge)
  - -> h.process [Carried into a process]: a process was started from the selection (node, back-edge)
  - -> x.unavailable [Nothing available]: the platform now asserts every selected item as unavailable (node, back-edge)
  - -> c.sendable2 [Still held]: at least one item is still held and available, changed or not (node)
- **c.sendable2** [condition] (2 branches)
  - May the second touch go out?
  - -> a.touch2 [Sendable]: the send path passes and the touch budget is not spent (node)
  - -> a.record-no-action [Suppressed]: a gate stops it; the gate is recorded (node, back-edge)
- **a.touch2** [action] (execution: communication)
  - Show the selection again with any genuine change the platform asserts on a held item - availability restored, price changed - and the same link. No urgency the system does not assert, and no incentive unless policy enables one for the last touch
  - writes recovery_log (append)
  - -> w.final (node)
- **w.final** [wait]
  - until an order or completion is recorded that includes at least one item from the selection, or every item was removed from the selection by the person, or the selection was deleted, or an authoritative record that a resumable process (checkout, application, quote, registration) opened for a person with at least one item and a resumable state
  - Detail: timeout after The recovery lifetime is the period in which a held selection is still an intent rather than a record; past it nothing further is sent. (example: 7 days–14 days; configure selection.lifetime)
  - a selection nobody returns to stops being an intent; pursuing it past that point is pressure
  - engagement does not extend the window
  - -> c.state3 [on event] (node)
  - -> c.state3 [on timeout] (node)
- **c.state3** [condition] (4 branches)
  - At the end of the recovery lifetime, what is the selection?
  - -> x.converted [Converted]: an order including any item from the selection is recorded (node, back-edge)
  - -> x.invalid [Cleared]: the person removed every item or deleted the selection (node, back-edge)
  - -> h.process [Carried into a process]: a process was started from the selection (node, back-edge)
  - -> x.lapsed [Still held]: the selection stands; nothing further is sent (node)
- **x.lapsed** [exit]
  - recovery lifetime passed with the selection still held; nothing further is sent
  - Detail: a new selection is a new instance, and enters silently while the cooldown runs

---
