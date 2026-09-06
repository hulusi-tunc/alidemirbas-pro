## RET-31 — Predicted Need Replenishment (preset: Predicted Next Purchase)

- Canonical ID: `RET-31`
- Slug: `predicted-need-replenishment`
- Preset ID: `predicted-next-purchase`
- Display name: Predicted Need Replenishment
- Canonical name (chain form): Depletion predicted → replenishment prompted before it → replenished, dismissed or lapsed
- Source route: `/lab/customer-journeys/predicted-next-purchase`
- Category: Engagement, health, retention & churn prevention
- Goal: recovery-retry
- Channels: email, push, in-app
- Surface: customer (communicating)

**Purpose**: Prompt a person to replenish a consumable or recurring-use item shortly before its usable period is predicted to end, stating the prediction as an estimate, and stop the moment they buy, dismiss, or the cycle passes.

> Get the replenishment made before the need bites, with the prediction stated honestly as an estimate and a direct route to reorder; never prompt a need already met, dismissed, or covered by a subscription.

**Preset · Predicted Next Purchase**
- canonical rule: The need is predicted from the person's own purchase cadence in a category rather than from a single item's usable period; the machine is the same and the estimate is stated as one.
- sets: replenishment.lead_time = 5 days–10 days
- destination: the category reorder route

### Trigger
- Event: `expected_depletion_approaching`
- Meaning: the expected usable period of an acquired consumable is ending, inferred from acquisition history
- Not enough on its own: a category average with no purchase by this person behind it; a purchase covered by an active subscription or auto-replenishment; a need dismissed in this prediction cycle; a newer purchase of the need since the one the prediction rests on
- Requires: a prior purchase of the need by this person, with its date and quantity; a usable period for the item, from which the expected depletion date is computed; the computed expected depletion date and the prediction cycle it belongs to
- Source: inferred

### Entity
- Scope: the predicted need - one consumable or recurring-use item, or a category the person buys on a cadence, whose usable period is computed from their own purchase and the item's usable life
- instance: person_id + need_key · one-active-per-key
- canonical rule: A purchase of the need, by any channel, closes the instance as replenished; a newer prediction for the same need does not open a second instance while one is open.

### Who enters
- a prior purchase of the need by this person, with a usable period the company can compute for it
- no newer purchase of the need since the one the prediction is based on
- no active subscription or auto-replenishment covering the need
- no dismissal recorded for the need in this prediction cycle
- purpose-level permission for commercial communication is recorded, and hard gates (GLB-31) allow it

### Suppressed when
- [canonical rule] Exit the moment a purchase of the need is recorded by any channel; every touch re-reads purchases first.
- [canonical rule] A dismissal - not needed, already have it, stop reminding - mutes the need for this cycle and nothing further is sent; a dismissal that asks for no more prompts mutes the need key until the person changes it.
- [canonical rule] An active subscription or auto-replenishment for the need sends nothing; the prompt would ask for a purchase already arranged.
- [canonical rule] The prediction is stated as an estimate from their own purchase history, never as a fact about what they have left.
- [canonical rule] No touch without purpose-level permission for commercial communication; absent permission is a recorded no-action.
- [canonical rule] A process recovery or a selection recovery for the same person outranks this journey; an open complaint, payment recovery or retention-outreach journey suppresses it (GLB-06).
- [optional strategy] If the company enables an incentive (replenishment.incentive_policy), it appears only on the last enabled touch, once, and its issuance is recorded per person. The library recommends none by default.

### Recommended orchestration · deadline-countdown
1. **lead-prompt** (promotional, canonical rule)
   - Timing: The prompt is timed a lead period before the expected depletion - long enough for a reorder to arrive before the need bites, short enough that the estimate still means something. (example: 3 days–7 days; configure replenishment.lead_time) (relative to expected_depletion_at)
   - cancelled by an authoritative purchase for the person, on any subject; the person signals no replenishment is needed
   - re-read before sending: purchases, subscriptions and dismissals for the need re-read from the system of record; the expected depletion date recomputed from the latest purchase
   - checks: At the lead point, is the need still unmet? · May the lead prompt go out?
   - Channel roles: persistent -> low-friction
   - Purpose: The item, the estimated point at which it runs out - stated as an estimate from their own purchases - and the route to reorder. Nothing about stock or price that the system does not assert.
   - destination: `reorder` · bound to `need_key` · must not claim: how much they have left, stock is reserved, the price is held, a discount applies
2. **follow-up** (promotional, recommended default)
   - Timing: The follow-up waits until the expected depletion has passed by a margin, so that it is sent to a need that is by then plausibly real and not to one still ahead. (example: 3 days–7 days; configure replenishment.follow_margin) (relative to expected_depletion_at)
   - cancelled by an authoritative purchase for the person, on any subject; the person signals no replenishment is needed
   - re-read before sending: purchases, subscriptions and dismissals for the need re-read from the system of record
   - checks: After the estimated depletion, what happened? · May the follow-up go out?
   - Channel roles: persistent -> low-friction
   - Purpose: One follow-up after the estimated depletion has passed unmet, with the same reorder route and no invented urgency.
   - destination: `reorder` · bound to `need_key` · must not claim: how much they have left, stock is reserved, the price is held
   - after t1

**Channel roles** (recommended default)
- persistent (email) — the prompt should carry the item, the estimate and the reorder route and survive until the person can act - the default for a prompt sent days ahead of a need
- low-friction (push, in-app) — an app session or a valid push token exists and the reorder route is a single step from the notification
- delivery fallback: same-role-other-channel

### Stops when
- [success] replenished; a purchase of the need is recorded (re-entry: the next prediction cycle, computed from this purchase, opens the next instance)
- [suppression] dismissed by the person; the need is muted for this cycle (re-entry: the next prediction cycle opens a new instance unless the dismissal asked for no more prompts)
- [no-action] no prompt sent; the reason is recorded (re-entry: the next prediction cycle opens a new instance)
- [timeout] prompted, neither replenished nor dismissed; nothing further this cycle (re-entry: the next prediction cycle opens a new instance)

### Configure
- `replenishment.lead_time` [recommended default] (reminder-before-attribute): 5 days–10 days (preset override; canonical default: 3 days–7 days) — The prompt is timed a lead period before the expected depletion - long enough for a reorder to arrive before the need bites, short enough that the estimate still means something.
- `replenishment.follow_margin` [recommended default] (observation-window): 3 days–7 days — The follow-up waits until the expected depletion has passed by a margin, so that it is sent to a need that is by then plausibly real and not to one still ahead.
- `replenishment.lifetime` [recommended default] (observation-window): 14 days–30 days — After the follow-up the instance stays open only to observe a replenishment or a dismissal; then it lapses and the next prediction cycle is the next chance.
- `replenishment.touches` [recommended default]: 2 — Every touch runs against a budget fixed when the instance opened; the budget is the plan's own length, and no touch is repeated because nothing could tell whether it arrived.
- `replenishment.cooldown` [recommended default] (cooldown): until the next predicted depletion for the same need — A lapsed or dismissed instance is not re-prompted inside the same prediction cycle; the next predicted depletion for the need opens the next instance.
- `replenishment.holdout_share` [recommended default]: 10 — A persistent per-person holdout is required: people replenish consumables on their own cadence, and without a holdout the journey claims every reorder that followed a prompt.

### Required data
**Semantic events to map**
- `expected_depletion_approaching` (inferred) — the expected usable period of an acquired consumable is ending, inferred from acquisition history
- `purchase_completed` (authoritative) — an authoritative purchase for the person, on any subject
- `replenishment_need_dismissed` (declared) — the person signals no replenishment is needed
**Attributes**: person_id · need_key · last_purchase_at · last_purchase_quantity · usable_period · expected_depletion_at · prediction_cycle · reorder_destination
**optional**: subscription_status · dismissal_status · has_active_app_session · delivery_lead_time

### Collision & priority
- priority: promotional
- pressure class: promotional
- local cap: 2 (all)
- cooldown: until the next predicted depletion for the same need
- competition: commerce-recovery (person) - below process recovery and selection recovery for the same person; above interest recovery
- No action when s.replenished · s.dismissed · s.subscription · s.estimate · s.permission · s.contest — the suppressions above are recorded outcomes, never a fallback to another channel

### Measurement
- journey outcome: exit: x.replenished, x.dismissed, x.no-action, x.lapsed
- business outcome: purchase_completed — an authoritative purchase for the person, on any subject
- observed: in this journey
- attribution: touched-before-event · persistent-holdout
- guardrails: unsubscribe · complaint · message_after_success · prompt_after_dismissal · prediction_error_reported · incentive_issued

### Presets
- **Predicted Next Purchase** [canonical rule] — The need is predicted from the person's own purchase cadence in a category rather than from a single item's usable period; the machine is the same and the estimate is stated as one. (replenishment.lead_time = 5 days–10 days)

### Reusable rule
A predicted need is prompted once before its estimated point and at most once after it, against the person's own purchase record re-read before each touch, with the estimate stated as an estimate.

### Entity (notes)
- the predicted need - one consumable or recurring-use item, or a category the person buys on a cadence, whose usable period is computed from their own purchase and the item's usable life
- One instance per need and prediction cycle. The prediction is inferred from the person's own purchases and the item's usable period, never from a category average alone; a dismissal mutes the need for this cycle and the next prediction opens a new instance. An active subscription or auto-replenishment for the need means no instance at all.

### Distinct from
- ACQ-13 (Interest inferred → qualified → resolved into a selection or purchase, or left alone) — ACQ-13 works from observed attention. A predicted need rests on a purchase the person made and a usable period, with no attention observed at all.
- RET-32 (Paid relationship lapsed → outreach permitted → won back, declined or left alone) — RET-32 addresses a relationship that ended. A predicted need addresses an active buyer whose next purchase is due.

### Guardrails
1. The prediction is an estimate from the person's own purchases and is stated as one; nothing is claimed about what they have left.
2. A dismissal is honoured for the cycle, and a dismissal asking for no more prompts is honoured until the person changes it.
3. A subscription or auto-replenishment for the need means no prompt at all.
4. Opens and clicks change nothing; only purchase and dismissal events move the state.

### Technical logic (graph, 18 nodes)
- **t.predicted** [trigger] (entry, evidence: inferred)
  - Event id: `expected_depletion_approaching`
  - Expected depletion approaching
  - evidence: inferred
  - requires: a prior purchase of the need by this person, with its date and quantity
  - requires: a usable period for the item, from which the expected depletion date is computed
  - requires: the computed expected depletion date and the prediction cycle it belongs to
  - not enough on its own: a category average with no purchase by this person behind it
  - not enough on its own: a purchase covered by an active subscription or auto-replenishment
  - not enough on its own: a need dismissed in this prediction cycle
  - not enough on its own: a newer purchase of the need since the one the prediction rests on
  - -> c.eligible (node)
- **c.eligible** [condition] (3 branches)
  - Is there a need to prompt, and may we?
  - -> a.open [Eligible]: no newer purchase, no subscription, no dismissal this cycle, no open instance, and commercial permission recorded (node)
  - -> x.replenished [Already met]: a newer purchase of the need exists (node)
  - -> a.record-no-action [Not eligible]: a subscription covers it, it was dismissed this cycle, permission is absent, or an instance is open - the reason is recorded (node)
- **a.open** [action]
  - Open the instance against the need and the prediction cycle, recording the expected depletion date the prompt will be timed against
  - writes replenishment_log (append)
  - -> w.lead (node)
- **x.replenished** [exit]
  - replenished; a purchase of the need is recorded
  - Detail: the next prediction cycle, computed from this purchase, opens the next instance
- **a.record-no-action** [action]
  - Record why nothing was sent and against which need, so no-action is a measured outcome rather than a silent absence
  - writes suppressed_sends (append)
  - -> x.no-action (node)
- **w.lead** [wait]
  - until an authoritative purchase for the person, on any subject, or the person signals no replenishment is needed
  - Detail: timeout after The prompt is timed a lead period before the expected depletion - long enough for a reorder to arrive before the need bites, short enough that the estimate still means something. (example: 3 days–7 days; configure replenishment.lead_time)
  - a prompt long before the need is noise and a prompt after it is late; the lead period is the delivery lead time plus a margin
  - engagement does not extend the window
  - -> c.state [on event] (node)
  - -> c.state [on timeout] (node)
- **x.no-action** [exit]
  - no prompt sent; the reason is recorded
  - Detail: the next prediction cycle opens a new instance
- **c.state** [condition] (3 branches)
  - At the lead point, is the need still unmet?
  - -> c.sendable [Still unmet]: no purchase, no subscription and no dismissal since the instance opened (node)
  - -> x.replenished [Replenished]: a purchase of the need is recorded (node, back-edge)
  - -> x.dismissed [Dismissed]: the person dismissed the need (node)
- **c.sendable** [condition] (2 branches)
  - May the lead prompt go out?
  - -> a.touch1 [Sendable]: the send path passes: permission for commercial communication, a deliverable destination, the promotional pressure cap, no higher-precedence contest on the person, and no cooldown in force (node)
  - -> a.record-no-action [Suppressed]: a gate stops it; the gate is recorded as the reason (node, back-edge)
- **x.dismissed** [exit]
  - dismissed by the person; the need is muted for this cycle
  - Detail: the next prediction cycle opens a new instance unless the dismissal asked for no more prompts
- **a.touch1** [action] (execution: communication)
  - Name the item, say when it is estimated to run out and that this is an estimate from their own purchases, and give the route to reorder. Claim nothing about what they have left, no reserved stock, no held price, no discount
  - writes replenishment_log (append)
  - -> w.window (node)
- **w.window** [wait]
  - until an authoritative purchase for the person, on any subject, or the person signals no replenishment is needed
  - Detail: timeout after The follow-up waits until the expected depletion has passed by a margin, so that it is sent to a need that is by then plausibly real and not to one still ahead. (example: 3 days–7 days; configure replenishment.follow_margin)
  - a follow-up before the estimated depletion is a repeat of the first prompt; after it, the need is plausibly present
  - engagement does not extend the window
  - -> c.outcome [on event] (node)
  - -> c.outcome [on timeout] (node)
- **c.outcome** [condition] (3 branches)
  - After the estimated depletion, what happened?
  - -> x.replenished [Replenished]: a purchase of the need is recorded (node, back-edge)
  - -> x.dismissed [Dismissed]: the person dismissed the need (node, back-edge)
  - -> c.sendable2 [Still unmet]: nothing has changed (node)
- **c.sendable2** [condition] (2 branches)
  - May the follow-up go out?
  - -> a.touch2 [Sendable]: the send path passes and the touch budget is not spent (node)
  - -> a.record-no-action [Suppressed]: a gate stops it; the gate is recorded (node, back-edge)
- **a.touch2** [action] (execution: communication)
  - Say once that the estimated point has passed and give the same reorder route. No invented urgency, and no incentive unless policy enables one for the last touch
  - writes replenishment_log (append)
  - -> w.final (node)
- **w.final** [wait]
  - until an authoritative purchase for the person, on any subject, or the person signals no replenishment is needed
  - Detail: timeout after After the follow-up the instance stays open only to observe a replenishment or a dismissal; then it lapses and the next prediction cycle is the next chance. (example: 14 days–30 days; configure replenishment.lifetime)
  - there is no third prompt to time; the instance only observes
  - engagement does not extend the window
  - -> c.final [on event] (node)
  - -> x.lapsed [on timeout] (node)
- **c.final** [condition] (2 branches)
  - What ended the observation?
  - -> x.replenished [Replenished]: a purchase of the need is recorded (node, back-edge)
  - -> x.dismissed [Dismissed]: the person dismissed the need (node, back-edge)
- **x.lapsed** [exit]
  - prompted, neither replenished nor dismissed; nothing further this cycle
  - Detail: the next prediction cycle opens a new instance

---
