## ACQ-13 — Unresolved Interest Recovery (preset: Product View Abandonment)

- Canonical ID: `ACQ-13`
- Slug: `unresolved-interest-recovery`
- Preset ID: `product-view-abandonment`
- Display name: Unresolved Interest Recovery
- Canonical name (chain form): Interest inferred → qualified → resolved into a selection or purchase, or left alone
- Source route: `/lab/customer-journeys/product-view-abandonment`
- Category: Acquisition, intent & qualification
- Goal: recovery-retry
- Channels: email, push, in-app
- Surface: customer (communicating)

**Purpose**: Follow up qualified, unresolved attention to an item, category or search - browsing that ended in neither a selection nor a process - with at most one touch, and record no-action as the normal outcome whenever the attention does not qualify.

> Bring a person whose attention qualified as interest back to the thing they looked at, once, without asserting stock, price or intent the system does not hold; and leave alone everyone whose attention did not qualify.

**Preset · Product View Abandonment**
- canonical rule: The subject is one item viewed repeatedly; the touch shows that item as it stands and its current availability as the platform asserts it.
- sets: interest.settle_window = 6 hours–24 hours
- destination: the item

### Trigger
- Event: `interest_signal_recorded`
- Meaning: attributed attention to an item, category or search that meets the company's qualification rule for interest - repeated, recent, and not followed by a selection or a process
- Not enough on its own: a single page view; attention inside a session that ended in a selection or a process - those journeys own it; an unattributed or automated session; attention to something the person already holds
- Requires: attributed attention to one item, category or search, with its timestamps; the qualification rule's inputs: how often, how recently, and whether a selection or process followed; the subject's current availability as the platform asserts it
- Source: behavioral

### Entity
- Scope: an inferred interest - a person's repeated, recent, attributed attention to one item, category or search that ended in neither a selection nor a process
- instance: person_id + interest_key · one-active-per-key
- canonical rule: A selection or a process for the same items supersedes the interest: the selection or process journey owns the person from that moment, and the interest instance closes as resolved.

### Who enters
- the attention is attributed to a person we may contact - not a bot, not an unattributed session
- the attention meets the company's qualification rule (interest.qualification_rule): repeated, recent, and on something the person could act on
- no selection, order or process exists for the item or category since the attention
- the item or category is currently available as the platform asserts it
- no interest instance is already open for this person and interest key
- purpose-level permission for commercial recovery communication is recorded, and hard gates (GLB-31) allow it

### Suppressed when
- [canonical rule] Attention that does not meet the qualification rule is recorded as no-action and nothing is sent; a single view is never a reason to write.
- [canonical rule] Exit the moment the person records a selection, starts a process or completes a purchase for the item or category; every touch re-reads this first.
- [canonical rule] Attention to something the person already holds - an item already bought, a plan already on - is not interest and sends nothing.
- [canonical rule] No touch without purpose-level permission for commercial recovery communication; absent permission is a recorded no-action.
- [canonical rule] This journey is lowest in the commerce-recovery group: a process recovery, a selection recovery or a predicted-need replenishment for the same person suppresses it, as does any open complaint, payment recovery or retention-outreach journey (GLB-06).
- [recommended default] A new interest inside the cooldown after a lapsed or suppressed instance is tracked and sends nothing; the same interest key re-qualifying inside the cooldown is the same interest.

### Recommended orchestration · single-notice
1. **recovery** (promotional, recommended default)
   - Timing: The touch waits long enough after the last attention that the person has actually left the subject rather than paused on it, and no longer than the attention stays fresh. (example: 12 hours–48 hours; configure interest.settle_window) (relative to last_interest_at)
   - cancelled by a selection is recorded against the person in the system of record without a process being started; an authoritative record that a resumable process (checkout, application, quote, registration) opened for a person with at least one item and a resumable state; an authoritative purchase for the person, on any subject
   - re-read before sending: the interest re-read: still no selection, order or process for the subject; the subject still available; the person still contactable
   - checks: Is the interest still unresolved, and is its subject still there? · May the touch go out?
   - Channel roles: low-friction -> persistent
   - Purpose: The thing they looked at, as it stands now, and a route back to it. Nothing about stock, price or intent that the system does not assert.
   - destination: `interest-subject` · bound to `interest_key` · must not claim: stock is reserved, the price is held, a discount applies, that they meant to buy it

**Channel roles** (recommended default)
- low-friction (push, in-app) — an app session or a valid push token exists for this person - the attention is recent and a route back beats content
- persistent (email) — no low-friction route exists, or the touch has to carry the thing looked at and survive until the person can act
- delivery fallback: same-role-other-channel

### Stops when
- [success] resolved; a selection, process or purchase for the subject is recorded and its own journey owns it (re-entry: a new interest key is a new interest)
- [invalid-state] the subject became unavailable; nothing is sent about something the person cannot act on (re-entry: a new interest key is a new interest)
- [no-action] no touch sent; the reason is recorded - the common outcome of this journey (re-entry: the same interest key re-qualifying inside the cooldown is the same interest; a new key is a new interest)
- [timeout] touched once, not resolved; nothing further is sent (re-entry: a new interest key is a new interest, and enters silently while the cooldown runs)

### Configure
- `interest.settle_window` [recommended default] (recovery-window): 6 hours–24 hours (preset override; canonical default: 12 hours–48 hours) — The touch waits long enough after the last attention that the person has actually left the subject rather than paused on it, and no longer than the attention stays fresh.
- `interest.lifetime` [recommended default] (observation-window): 3 days–7 days — After the one touch the instance stays open only long enough to observe a resolution; then it lapses and nothing further is sent.
- `interest.touches` [recommended default]: 1 — One touch per qualified interest; the plan has no second touch because nothing the person did asked for one.
- `interest.cooldown` [recommended default] (cooldown): 14 days–30 days — After a lapsed or suppressed instance, a new interest by the same person is tracked but not messaged until the cooldown has passed. A resolved interest carries no cooldown.
- `interest.holdout_share` [recommended default]: 10 — A persistent per-person holdout is required: people who browse buy on their own far more often than a touch changes, and without a holdout the journey claims every purchase that followed a view.

### Required data
**Semantic events to map**
- `interest_signal_recorded` (behavioral) — attributed attention to an item, category or search that meets the company's qualification rule for interest - repeated, recent, and not followed by a selection or a process
- `selection_recorded` (authoritative) — a selection is recorded against the person in the system of record without a process being started
- `process_started` (authoritative) — an authoritative record that a resumable process (checkout, application, quote, registration) opened for a person with at least one item and a resumable state
- `purchase_completed` (authoritative) — an authoritative purchase for the person, on any subject
**Attributes**: person_id · interest_key · subject_type · subject_ref · last_interest_at · attention_count · resume_destination
**optional**: category · has_active_app_session · subject_availability · query_text

### Collision & priority
- priority: promotional
- pressure class: promotional
- local cap: 1 (all)
- cooldown: 14 days–30 days
- competition: commerce-recovery (person) - lowest in the group - a process in motion, a held selection and a predicted need all outrank an inferred interest for the same person
- No action when s.not-qualified · s.resolved · s.already-held · s.permission · s.contest · s.cooldown — the suppressions above are recorded outcomes, never a fallback to another channel

### Measurement
- journey outcome: exit: x.resolved, x.unavailable, x.no-action, x.lapsed
- business outcome: purchase_completed — an authoritative purchase for the person, on any subject
- observed: in this journey
- attribution: touched-before-event · persistent-holdout
- guardrails: unsubscribe · complaint · message_after_success · touch_on_unqualified_interest

### Presets
- **Browse Abandonment** [canonical rule] — The subject is a category or listing the person browsed repeatedly; the touch points back at the category, never at an item the person did not single out.
- **Product View Abandonment** [canonical rule] — The subject is one item viewed repeatedly; the touch shows that item as it stands and its current availability as the platform asserts it. (interest.settle_window = 6 hours–24 hours)
- **Search Abandonment** [canonical rule] — The subject is a repeated search that led to no selection; the touch points back at the results as they stand. An availability enquiry that holds something is SCH-282's, not this.

### Reusable rule
Inferred interest is acted on only after it qualifies against a stated rule and is re-read as still unresolved; the touch shows the subject as it stands and nothing more, and no-action is the outcome that is measured most.

### Entity (notes)
- an inferred interest - a person's repeated, recent, attributed attention to one item, category or search that ended in neither a selection nor a process
- The trigger is behavioural, not authoritative: nothing was recorded by the person, so a qualification step stands between the signal and any instance. Most signals do not qualify, and no-action is the common outcome by design. One instance per person and interest key; a new key is a new interest.

### Distinct from
- ACQ-12 (Selection recorded → held without a process → recovered, carried into a process, cleared or lapsed) — ACQ-12 works from a selection the person recorded. Interest is inferred from attention, which is why a qualification step stands before any instance and no-action is the common outcome.
- SCH-282 (Availability searched, no booking → nearest window or waitlist) — SCH-282 follows an availability enquiry with restorable state. A search here holds nothing; it is attention, not an enquiry.

### Guardrails
1. A single view is never a reason to write; the qualification rule stands between every signal and every instance.
2. Nothing is asserted about stock, price or what the person meant.
3. One touch, then observation; there is no second touch because nothing the person did asked for one.
4. A selection or process for the subject hands ownership to its own journey immediately.

### Technical logic (graph, 13 nodes)
- **t.interest** [trigger] (entry, evidence: behavioral)
  - Event id: `interest_signal_recorded`
  - Interest signal recorded
  - evidence: behavioral
  - requires: attributed attention to one item, category or search, with its timestamps
  - requires: the qualification rule's inputs: how often, how recently, and whether a selection or process followed
  - requires: the subject's current availability as the platform asserts it
  - not enough on its own: a single page view
  - not enough on its own: attention inside a session that ended in a selection or a process - those journeys own it
  - not enough on its own: an unattributed or automated session
  - not enough on its own: attention to something the person already holds
  - -> c.qualify (node)
- **c.qualify** [condition] (3 branches)
  - Does this attention qualify as interest, and is it still unresolved?
  - -> a.open [Qualified and unresolved]: the qualification rule is met, no selection, order or process followed, the subject is available, permission is recorded and no instance is open (node)
  - -> x.resolved [Already resolved]: a selection, order or process for the subject exists since the attention (node)
  - -> a.record-no-action [Does not qualify]: the rule is not met, the subject is unavailable or already held, or permission is absent - the reason is recorded (node)
- **a.open** [action]
  - Open the interest instance against the person and interest key and start the clock from the last attention. Further attention before the touch moves the clock; nothing after it extends any window
  - writes recovery_log (append)
  - -> w.settle (node)
- **x.resolved** [exit]
  - resolved; a selection, process or purchase for the subject is recorded and its own journey owns it
  - Detail: a new interest key is a new interest
- **a.record-no-action** [action]
  - Record why nothing was sent - not qualified, unavailable, already held, no permission, or a gate on the send path - so that no-action, the common outcome here, is a measured one
  - writes suppressed_sends (append)
  - -> x.no-action (node)
- **w.settle** [wait]
  - until a selection is recorded against the person in the system of record without a process being started, or an authoritative record that a resumable process (checkout, application, quote, registration) opened for a person with at least one item and a resumable state, or an authoritative purchase for the person, on any subject
  - Detail: timeout after The touch waits long enough after the last attention that the person has actually left the subject rather than paused on it, and no longer than the attention stays fresh. (example: 12 hours–48 hours; configure interest.settle_window)
  - attention that is still going on is not unresolved; the clock runs from the last of it
  - engagement does not extend the window
  - -> x.resolved [on event] (node, back-edge)
  - -> c.state [on timeout] (node)
- **x.no-action** [exit]
  - no touch sent; the reason is recorded - the common outcome of this journey
  - Detail: the same interest key re-qualifying inside the cooldown is the same interest; a new key is a new interest
- **c.state** [condition] (3 branches)
  - Is the interest still unresolved, and is its subject still there?
  - -> c.sendable [Unresolved, subject available]: no selection, order or process followed and the platform asserts the subject as available (node)
  - -> x.resolved [Resolved meanwhile]: a selection, order or process for the subject was recorded (node, back-edge)
  - -> x.unavailable [Subject gone]: the platform now asserts the subject as unavailable (node)
- **c.sendable** [condition] (2 branches)
  - May the touch go out?
  - -> a.touch1 [Sendable]: the send path passes: permission for commercial recovery, a deliverable destination, the promotional pressure cap, no higher-precedence contest on the person, and no cooldown in force (node)
  - -> a.record-no-action [Suppressed]: a gate stops it; the gate is recorded as the reason (node, back-edge)
- **x.unavailable** [exit]
  - the subject became unavailable; nothing is sent about something the person cannot act on
  - Detail: a new interest key is a new interest
- **a.touch1** [action] (execution: communication)
  - Show the thing they looked at as it stands now and give a route back to it. Claim nothing the system does not assert: no reserved stock, no held price, no discount, and no assumption about what they meant
  - writes recovery_log (append)
  - -> w.after (node)
- **w.after** [wait]
  - until a selection is recorded against the person in the system of record without a process being started, or an authoritative record that a resumable process (checkout, application, quote, registration) opened for a person with at least one item and a resumable state, or an authoritative purchase for the person, on any subject
  - Detail: timeout after After the one touch the instance stays open only long enough to observe a resolution; then it lapses and nothing further is sent. (example: 3 days–7 days; configure interest.lifetime)
  - the only remaining question is whether the interest resolved; there is no second touch to time
  - engagement does not extend the window
  - -> x.resolved [on event] (node, back-edge)
  - -> x.lapsed [on timeout] (node)
- **x.lapsed** [exit]
  - touched once, not resolved; nothing further is sent
  - Detail: a new interest key is a new interest, and enters silently while the cooldown runs

---
