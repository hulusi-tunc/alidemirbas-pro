## RET-32 — Lapsed Customer Win-Back

- Canonical ID: `RET-32`
- Slug: `lapsed-customer-win-back`
- Display name: Lapsed Customer Win-Back
- Canonical name (chain form): Paid relationship lapsed → outreach permitted → won back, declined or left alone
- Source route: `/lab/customer-journeys/lapsed-customer-win-back`
- Category: Engagement, health, retention & churn prevention
- Goal: recovery-retry
- Channels: email, push
- Surface: customer (communicating)

**Purpose**: Invite a person whose paid relationship ended or went dormant to come back - once, honestly, with whatever has actually changed since they left - after the cancellation's own window has passed and only where the recorded reason and history do not rule it out.

> Win back a formerly paying relationship with a plain invitation that speaks to why they left where that is known, with a long cooldown afterwards; never write to someone whose recorded reason or history says not to.

### Trigger
- Event: `lapsed_customer_detected`
- Meaning: a previously paid relationship has been inactive and unpaid past its lapse threshold
- Not enough on its own: low usage on an active relationship - that is usage-drop territory, not a lapse; a cancellation still inside its save window - Cancellation Save (RET-28) owns it; a lapse caused by an unpaid obligation that is still open - payment recovery owns it; a trial or free relationship that never paid - reactivation (ACT-20) owns it
- Requires: a relationship record showing at least one completed paid term or purchase; the relationship ended or went dormant under the company's lapse rule, with the date; the recorded cancellation reason where one exists, and the refund and dispute history; that the cancellation's own save window and cooldown have passed
- Source: authoritative

### Entity
- Scope: a formerly paying relationship that ended or went dormant under the company's lapse rule and has no active obligation, subscription, open complaint or process
- instance: person_id + relationship_id · one-active-per-key
- canonical rule: A repaid relationship - a new paid term, a purchase, a reactivated subscription - closes the instance as won; a new lapse after that is a new instance, subject to the cooldown.

### Who enters
- the relationship was paid - at least one completed paid term or purchase on it
- it ended or went dormant under the company's lapse rule, and the cancellation's own save window and cooldown have passed
- no active obligation, subscription, open complaint, payment recovery or process exists on the relationship
- the recorded cancellation reason is not one policy lists as excluding outreach, and the refund and dispute history does not exclude it
- purpose-level permission for commercial communication is recorded and was not withdrawn at cancellation, and hard gates (GLB-31) allow it

### Suppressed when
- [canonical rule] A cancellation still inside its own save window or the cooldown after it is Cancellation Save's territory (RET-28); nothing is sent here.
- [canonical rule] A recorded cancellation reason that policy lists as excluding outreach - closed business, bereavement, relocation out of service, an unresolved complaint - sends nothing and is recorded as no-action.
- [canonical rule] A refund, dispute or chargeback history that policy lists as excluding commercial outreach sends nothing.
- [canonical rule] Any open obligation, complaint, payment recovery or active relationship means the relationship is not lapsed; the instance closes as no-action.
- [canonical rule] Permission withdrawn at or after cancellation is final for this journey; absent permission is a recorded no-action, never a fallback to another channel.
- [canonical rule] The invitation says what actually changed since they left where something did, and is a plain invitation where nothing did; no change is invented to have something to say.
- [optional strategy] If the company enables a win-back incentive (winback.incentive_policy), it appears only on the last enabled touch, once, and its issuance is recorded per person so it cannot be re-issued on the next lapse.

### Recommended orchestration · offer-decide-remind
1. **invitation** (promotional, canonical rule)
   - sent on classification - no wait before it
   - checks: Is this relationship one we may write to about coming back? · What can the invitation honestly say? · May the invitation go out?
   - Channel roles: persistent -> low-friction
   - Purpose: A plain invitation to come back: what actually changed since they left where something did, the route back, and nothing invented.
   - destination: `return-route` · bound to `relationship_id` · must not claim: a change that did not happen, that their previous terms are held, a discount policy does not enable
2. **follow-up** (promotional, optional strategy)
   - Timing: The invitation is given time to be acted on in the person's own time; a follow-up inside that time is pressure on someone who already left once. (example: 14 days–30 days; configure winback.response_window) (after the previous touch)
   - cancelled by the lapsed relationship pays again; an authoritative purchase for the person, on any subject
   - re-read before sending: the relationship re-read: still lapsed, nothing opened on it, permission still recorded
   - checks: Is a follow-up enabled, and is there something honest to add? · May the follow-up go out?
   - Channel roles: persistent -> low-friction
   - Purpose: One follow-up, only where the company enables it and there is something honest to add - an incentive policy enables, or a further change - with the same route back.
   - destination: `return-route` · bound to `relationship_id` · must not claim: a change that did not happen, that their previous terms are held
   - after t1

**Channel roles** (recommended default)
- persistent (email) — the invitation should say what changed and carry the route back, and survive until the person reads it - the default for someone who is not in the product
- low-friction (push) — a valid push token still exists on a device the person kept the app on, and the route back is a single step
- delivery fallback: same-role-other-channel

### Stops when
- [success] won back; the relationship is repaid (re-entry: a later lapse is a new instance, subject to the cooldown counted from this lapse)
- [no-action] no invitation sent; the excluding reason or gate is recorded (re-entry: an excluding reason or history is re-evaluated only when it changes; a gate on the send path is re-evaluated at the next lapse)
- [timeout] invited, not returned; left alone for the cooldown (re-entry: no further win-back instance until the cooldown has passed)

### Configure
- `winback.response_window` [recommended default] (response-window): 14 days–30 days — The invitation is given time to be acted on in the person's own time; a follow-up inside that time is pressure on someone who already left once.
- `winback.lifetime` [recommended default] (observation-window): 30 days–60 days — After the follow-up the instance stays open only to observe a return; then it lapses and the long cooldown starts.
- `winback.touches` [recommended default]: 2 — Every touch runs against a budget fixed when the instance opened; the budget is the plan's own length, and the second touch exists only where the company enables it.
- `winback.cooldown` [recommended default] (cooldown): 180 days–365 days — A relationship that did not come back is left alone for a long cooldown before any further win-back instance; a person who left and was asked once has answered.
- `winback.holdout_share` [recommended default]: 10 — A persistent holdout is required: lapsed customers return on their own, and without a holdout the journey claims every return that followed an invitation; the holdout is the only honest measure of an incentive's cost.

### Required data
**Semantic events to map**
- `lapsed_customer_detected` (authoritative) — a previously paid relationship has been inactive and unpaid past its lapse threshold
- `relationship_repaid` (authoritative) — the lapsed relationship pays again
- `purchase_completed` (authoritative) — an authoritative purchase for the person, on any subject
**Attributes**: person_id · relationship_id · paid_terms_or_purchases · lapsed_at · lapse_rule · cancellation_reason · refund_dispute_history · return_destination
**optional**: change_record_since_lapse · has_push_token · previous_plan · winback_incentive_eligibility

### Collision & priority
- priority: promotional
- pressure class: promotional
- local cap: 2 (all)
- cooldown: 180 days–365 days
- competition: retention-outreach (account) - lowest in the group - any live retention, complaint, risk or payment journey on the account means the relationship is not lapsed and this journey does not run
- No action when s.recent · s.reason · s.history · s.open · s.permission · s.honest — the suppressions above are recorded outcomes, never a fallback to another channel

### Measurement
- journey outcome: exit: x.won, x.no-action, x.lapsed
- business outcome: relationship_repaid — the lapsed relationship pays again
- observed: in this journey
- attribution: touched-before-event · persistent-holdout
- guardrails: unsubscribe · complaint · message_after_success · outreach_on_excluded_reason · incentive_issued · incentive_reissued_same_person

### Reusable rule
A lapsed paid relationship is invited back at most twice, only after its cancellation's own window has passed and only where reason, history and permission allow, with whatever honestly changed and a long cooldown afterwards.

### Entity (notes)
- a formerly paying relationship that ended or went dormant under the company's lapse rule and has no active obligation, subscription, open complaint or process
- Distinct from a never-paid reactivation (ACT-20) by eligibility - there was a paid relationship - and from a cancellation in motion (RET-28) by timing: this journey starts only after the cancellation's own save window and cooldown have passed. One instance per relationship and lapse; a long cooldown separates instances.

### Distinct from
- ACT-20 (Dormant non-customer reactivation → return → re-qualification or exit) — ACT-20 reactivates a relationship that never paid. This addresses one that did, which changes the eligibility, the economics and what the invitation may honestly say.
- RET-28 (Cancellation intent → understand state → save or proceed) — RET-28 acts at the moment of cancellation intent, inside the cancellation's own window. This starts only after that window and its cooldown have passed.

### Guardrails
1. A recorded reason or history that policy lists as excluding outreach is final for the instance.
2. The invitation says what actually changed or is plain; no change is invented.
3. One invitation, one optional follow-up, then a long cooldown; a person who left and was asked once has answered.
4. An incentive, where enabled, appears once on the last enabled touch and is recorded per person so it is never re-issued on the next lapse.

### Technical logic (graph, 15 nodes)
- **t.lapsed** [trigger] (entry, evidence: authoritative)
  - Event id: `lapsed_customer_detected`
  - Lapsed customer detected
  - evidence: authoritative
  - requires: a relationship record showing at least one completed paid term or purchase
  - requires: the relationship ended or went dormant under the company's lapse rule, with the date
  - requires: the recorded cancellation reason where one exists, and the refund and dispute history
  - requires: that the cancellation's own save window and cooldown have passed
  - not enough on its own: low usage on an active relationship - that is usage-drop territory, not a lapse
  - not enough on its own: a cancellation still inside its save window - Cancellation Save (RET-28) owns it
  - not enough on its own: a lapse caused by an unpaid obligation that is still open - payment recovery owns it
  - not enough on its own: a trial or free relationship that never paid - reactivation (ACT-20) owns it
  - -> c.eligible (node)
- **c.eligible** [condition] (2 branches)
  - Is this relationship one we may write to about coming back?
  - -> a.open [Eligible]: paid before, lapsed past the cancellation's own window, nothing open on it, a reason and history that do not exclude outreach, permission recorded and not withdrawn (node)
  - -> a.record-no-action [Excluded]: the reason, the history, something open, or absent permission rules it out - the reason is recorded (node)
- **a.open** [action]
  - Open the win-back instance against the relationship and this lapse, recording the cancellation reason it will speak to and the date the cooldown will be counted from
  - writes winback_log (append)
  - -> c.basis (node)
- **a.record-no-action** [action]
  - Record why nothing was sent - an excluding reason, history, something open, no permission, or a gate on the send path - so no-action is a measured outcome
  - writes suppressed_sends (append)
  - -> x.no-action (node)
- **c.basis** [condition] (2 branches)
  - What can the invitation honestly say?
  - -> c.sendable [Something changed that speaks to why they left]: a recorded change since the lapse addresses the recorded reason - a fixed problem, a changed plan, a restored feature (node)
  - -> c.sendable [Nothing specific]: no recorded change speaks to the reason, or no reason was recorded - the invitation is plain (node)
- **x.no-action** [exit]
  - no invitation sent; the excluding reason or gate is recorded
  - Detail: an excluding reason or history is re-evaluated only when it changes; a gate on the send path is re-evaluated at the next lapse
- **c.sendable** [condition] (2 branches)
  - May the invitation go out?
  - -> a.touch1 [Sendable]: the send path passes: permission for commercial communication, a deliverable destination, the promotional pressure cap, no higher-precedence contest on the account, and no win-back cooldown in force (node)
  - -> a.record-no-action [Suppressed]: a gate stops it; the gate is recorded as the reason (node, back-edge)
- **a.touch1** [action] (execution: communication)
  - Invite them back plainly: what actually changed since they left where something did, and the route back. Nothing invented, no terms held that are not held, no discount policy does not enable
  - writes winback_log (append)
  - -> w.response (node)
- **w.response** [wait]
  - until the lapsed relationship pays again, or an authoritative purchase for the person, on any subject
  - Detail: timeout after The invitation is given time to be acted on in the person's own time; a follow-up inside that time is pressure on someone who already left once. (example: 14 days–30 days; configure winback.response_window)
  - someone who left is not in a hurry to return; the window is weeks, not days
  - engagement does not extend the window
  - -> x.won [on event] (node)
  - -> c.second [on timeout] (node)
- **x.won** [exit]
  - won back; the relationship is repaid
  - Detail: a later lapse is a new instance, subject to the cooldown counted from this lapse
- **c.second** [condition] (2 branches)
  - Is a follow-up enabled, and is there something honest to add?
  - -> c.sendable2 [Enabled with something to add]: the company has enabled the follow-up (winback.follow_up_enabled) and either an incentive policy enables an offer for the last touch or a further change is recorded (node)
  - -> x.lapsed [Not enabled, or nothing to add]: the follow-up is disabled, or there is nothing honest to say beyond the invitation already sent (node)
- **c.sendable2** [condition] (2 branches)
  - May the follow-up go out?
  - -> a.touch2 [Sendable]: the send path passes and the touch budget is not spent (node)
  - -> a.record-no-action [Suppressed]: a gate stops it; the gate is recorded (node, back-edge)
- **x.lapsed** [exit]
  - invited, not returned; left alone for the cooldown
  - Detail: no further win-back instance until the cooldown has passed
- **a.touch2** [action] (execution: communication)
  - Say once what is being added - the enabled incentive, or the further change - with the same route back, and record the incentive's issuance per person where one is issued
  - writes winback_log (append)
  - writes incentive_issuance (append)
  - -> w.final (node)
- **w.final** [wait]
  - until the lapsed relationship pays again, or an authoritative purchase for the person, on any subject
  - Detail: timeout after After the follow-up the instance stays open only to observe a return; then it lapses and the long cooldown starts. (example: 30 days–60 days; configure winback.lifetime)
  - there is no third touch; the instance only observes
  - engagement does not extend the window
  - -> x.won [on event] (node, back-edge)
  - -> x.lapsed [on timeout] (node, back-edge)

---
