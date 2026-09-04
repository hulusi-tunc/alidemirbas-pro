## RET-30 — Retention Offer Follow-Up

- Canonical ID: `RET-30`
- Slug: `retention-intervention-outcome`
- Display name: Retention Offer Follow-Up
- Canonical name (chain form): Retention intervention → outcome → suppress, escalate or exit
- Source route: `/lab/customer-journeys/retention-intervention-outcome`
- Category: Engagement, health, retention & churn prevention
- Goal: reconciliation-correction
- Channels: email, in-app
- Surface: customer (communicating)

**Purpose**: Close a retention attempt on what actually happened to the relationship, and stop the same offer being made twice.

> Close a retention attempt on what actually happened to the relationship, and stop the same offer being made twice.

### Trigger
- Event: `retention_intervention_delivered`
- Meaning: a defined intervention actually delivered: a plan alternative, a pause option, a support resolution, human outreach, or an approved save offer
- Not enough on its own: an intervention scheduled but not yet delivered
- Requires: a defined intervention actually delivered: a plan alternative, a pause option, a support resolution, human outreach, or an approved save offer
- Source: authoritative

### Entity
- Scope: the customer, account or subscription plus the retention episode the intervention belongs to
- instance: account_id + retention_episode_id · one-active-per-key

### Who enters
- a defined intervention actually delivered: a plan alternative, a pause option, a support resolution, human outreach, or an approved save offer
- no instance of this journey is already open for the the customer
- hard gates (GLB-31) allow communication for this purpose

### Suppressed when
- [canonical rule] An accepted offer is not an applied one. Retention is recorded from the relationship state, never from the customer's answer.
- [canonical rule] A declined offer is remembered for the whole cancellation episode, not just for the message that carried it.
- [canonical rule] The attempt is bounded: the intervention, and at most one follow-up.
- [canonical rule] An operational failure to apply an accepted offer is never recorded as a retention success.

### Recommended orchestration · single-notice
1. **followup** (lifecycle, canonical rule)
   - Timing: A bounded decision window. (configure retention_intervention.outcome) (after the trigger)
   - cancelled by the person accepts the retention alternative offered; the person explicitly declines the retention alternative; the relationship's own state recovers without the person answering the offer; the intervention could not be executed
   - re-read before sending: the the customer re-read from the system of record before acting on the timeout
   - checks: With no response, is one bounded follow-up justified?
   - Channel roles: persistent -> in-session
   - Purpose: Send one follow-up and stop.

**Channel roles** (recommended default)
- persistent (email) — the message has to be kept and survive until the person can act on it
- in-session (in-app) — the person is active in the product and the action is taken there
- delivery fallback: same-role-other-channel

### Stops when
- [no-action] intervention declined, relationship intact (re-entry: a new episode with new evidence may justify a different intervention; the declined one is not re-sent inside this episode)
- [timeout] no response; episode closed, cooldown in force (re-entry: a new episode may open on new evidence, and this intervention is not repeated within the cooldown)
- [handoff] Recovery Stability Check — a retention outcome that looks positive
- [handoff] external:operational-resolution — an intervention that did not apply
- [handoff] Cancellation Effective-Date Resolution — a declined save offer with cancellation continuing

### Configure
- `retention_intervention.outcome` [config required] (response-window): configure retention_intervention.outcome — A bounded decision window.
- `retention_intervention.touches` [recommended default]: 1 — Every touch runs against a budget fixed when the instance opened; the budget is the plan's own length, and no touch is repeated because nothing could tell whether it arrived.
- `retention_intervention.cooldown` [config required] (cooldown): configure retention_intervention.cooldown — The cooldown between instances of this journey for the same the customer, so that a re-qualifying the customer is tracked but not messaged again inside it.

### Required data
**Semantic events to map**
- `retention_intervention_delivered` (authoritative) — a defined intervention actually delivered: a plan alternative, a pause option, a support resolution, human outreach, or an approved save offer
- `retention_offer_accepted` (declared) — the person accepts the retention alternative offered
- `retention_offer_declined` (declared) — the person explicitly declines the retention alternative
- `relationship_recovered` (authoritative) — the relationship's own state recovers without the person answering the offer
- `intervention_failed` (authoritative) — the intervention could not be executed
**Attributes**: account_id · retention_episode_id · intervention_delivered · offer_status · retention_episode_history

### Collision & priority
- priority: lifecycle
- pressure class: lifecycle
- local cap: 1 (all)
- cooldown: configure retention_intervention.cooldown
- competition: retention-outreach (account) - lowest in the group - any live risk case or open issue on the same account outranks it
- No action when s.g1 · s.g2 · s.g3 · s.g4 — the suppressions above are recorded outcomes, never a fallback to another channel

### Measurement
- journey outcome: exit-or-handoff: x.declined, x.cooldown, h.observe, h.fix, h.proceed
- business outcome: relationship_recovered — the relationship's own state recovers without the person answering the offer
- observed: in this journey
- attribution: touched-before-event · pre-post
- guardrails: complaint · message_after_success · unsubscribe

### Reusable rule
Retention intervention is complete only when its business outcome is known, and unsuccessful interventions should not loop indefinitely.

### Entity (notes)
- the customer, account or subscription plus the retention episode the intervention belongs to
- The episode is the unit. A declined offer is declined for this episode, which is what makes remembering it possible.

### Distinct from
- RET-27 (Recovery signal → observation buffer → stable or relapse) — This asks whether the intervention worked. RET-27 asks whether the improvement lasts, and takes over once this one has a positive answer.

### Guardrails
1. An accepted offer is not an applied one. Retention is recorded from the relationship state, never from the customer's answer.
2. A declined offer is remembered for the whole cancellation episode, not just for the message that carried it.
3. The attempt is bounded: the intervention, and at most one follow-up.
4. An operational failure to apply an accepted offer is never recorded as a retention success.

### Technical logic (graph, 14 nodes)
- **t.delivered** [trigger] (entry, evidence: authoritative)
  - Event id: `retention_intervention_delivered`
  - Retention intervention delivered
  - evidence: authoritative
  - requires: a defined intervention actually delivered: a plan alternative, a pause option, a support resolution, human outreach, or an approved save offer
  - not enough on its own: an intervention scheduled but not yet delivered
  - -> w.outcome (node)
- **w.outcome** [wait]
  - until the person accepts the retention alternative offered, or the person explicitly declines the retention alternative, or the relationship's own state recovers without the person answering the offer, or the intervention could not be executed
  - Detail: timeout after A bounded decision window. (configure retention_intervention.outcome)
  - an unanswered offer is a result, and the alternative to accepting that is asking again until someone leaves
  - engagement does not extend the window
  - -> c.outcome [on event] (node)
  - -> c.followup [on timeout] (node)
- **c.outcome** [condition] (4 branches)
  - What happened to the intervention?
  - -> a.verify [Accepted]: the customer took what was offered (node)
  - -> a.record-decline [Declined]: the customer explicitly turned it down (node)
  - -> h.observe [Recovered without answering]: the relationship improved but nobody responded to the offer itself (node)
  - -> h.fix [Failed to execute]: the intervention was accepted or attempted and did not actually apply (node)
- **c.followup** [condition] (2 branches)
  - With no response, is one bounded follow-up justified?
  - -> a.followup [Justified]: the offer is time-limited or its terms were plausibly not understood (node)
  - -> x.cooldown [Not justified]: silence is a clear enough answer and repeating it adds only pressure (node)
- **a.verify** [action]
  - Verify against the system of record that the relationship actually changed - the plan changed, the pause is active, the issue is closed, the subscription is retained. Acceptance is a customer saying yes; application is the state having moved, and the gap between them is where retention numbers go wrong
  - -> c.applied (node)
- **a.record-decline** [action]
  - Record the decline against this cancellation episode, so the same offer is not made again inside it. Repeating a declined offer is the behaviour that makes a save attempt read as an obstacle
  - writes retention_episode_history (append)
  - -> c.proceed (node)
- **h.observe** [handoff]
  - Recovery signal → observation buffer → stable or relapse
  - Detail: a retention outcome that looks positive
  - carries: what was accepted and what actually changed
  - carries: the fact that this is one positive event, which is why it goes to observation rather than to a recovered state
  - -> RET-27 (journey)
- **h.fix** [handoff] (external)
  - external:operational-resolution
  - Detail: an intervention that did not apply
  - carries: what was agreed and what failed to happen
  - carries: the explicit fact that retention has not succeeded, however the customer answered
  - suppresses: any recording of this as a retained relationship until the change actually applies
  - -> external:operational-resolution (external)
- **a.followup** [action] (execution: communication)
  - Send one follow-up and stop. There is no second, whatever the value of the relationship
  - -> x.cooldown (node)
- **x.cooldown** [exit]
  - no response; episode closed, cooldown in force
  - Detail: a new episode may open on new evidence, and this intervention is not repeated within the cooldown
- **c.applied** [condition] (2 branches)
  - Did the state actually change?
  - -> h.observe [Applied]: the authoritative record shows the change (node, back-edge)
  - -> h.fix [Accepted but not applied]: the customer agreed and the change did not take effect (node, back-edge)
- **c.proceed** [condition] (2 branches)
  - Is a cancellation still in progress?
  - -> h.proceed [Still cancelling]: the customer declined and is continuing to leave (node)
  - -> x.declined [No cancellation underway]: the offer was declined but nothing is being cancelled (node)
- **h.proceed** [handoff]
  - Cancellation request → determine effective end → schedule or cancel now
  - Detail: a declined save offer with cancellation continuing
  - carries: what was offered and declined
  - carries: the declared reason it was chosen against
  - -> SUB-167 (journey)
- **x.declined** [exit]
  - intervention declined, relationship intact
  - Detail: a new episode with new evidence may justify a different intervention; the declined one is not re-sent inside this episode

---
