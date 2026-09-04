## ACT-20 — Dormant Lead Reactivation

- Canonical ID: `ACT-20`
- Slug: `dormant-non-customer-reactivation`
- Display name: Dormant Lead Reactivation
- Canonical name (chain form): Dormant non-customer reactivation → return → re-qualification or exit
- Source route: `/lab/customer-journeys/dormant-non-customer-reactivation`
- Category: Activation, onboarding & early value
- Goal: relationship-recovery-intervention
- Channels: email, push
- Surface: customer (communicating)

**Purpose**: Make one bounded attempt to restart a relationship that never became a paying one, and judge the result on what the person actually did.

> Make one bounded attempt to restart a relationship that never became a paying one, and judge the result on what the person actually did.

### Trigger
- Event: `engaged_non_customer_became_dormant`
- Meaning: a previously engaged relationship that has passed the inactivity threshold defined for this context
- Not enough on its own: a gap that is normal for how often this product is used; quiet in one channel while the person is active elsewhere
- Requires: a previously engaged relationship that has passed the inactivity threshold defined for this context
- Source: behavioral

### Entity
- Scope: person, lead or inactive non-customer account, in the context that went dormant
- instance: lead_id + context_id · one-active-per-key

### Who enters
- a previously engaged relationship that has passed the inactivity threshold defined for this context
- no instance of this journey is already open for the person
- hard gates (GLB-31) allow communication for this purpose

### Suppressed when
- [canonical rule] Success is a meaningful return, never an open or a click. The message is not the outcome.
- [canonical rule] Former paying customers are out of scope. Win-back is a different journey with different economics.
- [canonical rule] Repeated inactivity does not create repeated campaigns. Each attempt needs its own reason.

### Recommended orchestration · single-notice
1. **attempt** (promotional, canonical rule)
   - sent on classification - no wait before it
   - checks: Has this relationship ever been monetised in this context? · Is there a credible reason, and is this person still eligible and contactable?
   - Channel roles: persistent -> low-friction
   - Purpose: Make one bounded attempt built on the recorded reason.
   - destination: `return-route-for-reason` · bound to `context_id` · must not claim: that they have been missed, an offer policy does not enable

**Channel roles** (recommended default)
- persistent (email) — the message has to be kept and survive until the person can act on it
- low-friction (push) — a valid token or app session exists and the message is a single step from the notification
- delivery fallback: same-role-other-channel

### Stops when
- [invalid-state] out of scope; belongs to win-back (re-entry: none here - restoring a relationship that was once paid for is a different problem with different economics and a different message, and treating it as reactivation gets both wrong)
- [no-action] dormant, no credible reason to re-engage (re-entry: a genuine change - in the product, in their circumstances, in what they asked for - can create a reason later; dormancy alone never becomes one by lasting longer)
- [invalid-state] engagement only; nothing reactivated (re-entry: the window continues to its end if it has not expired; a click is not recorded as a return, because doing so would make this journey report its own message as a result)
- [timeout] reactivation window closed, cooldown in force (re-entry: only a new reason, not a longer silence; repeated dormancy does not entitle anyone to repeated campaigns)
- [handoff] Onboarding Nurture — a return into unfinished setup
- [handoff] Intent Escalation Handoff — a return carrying stronger intent than the record holds
- [handoff] Qualification State Routing — a return with no current qualification on record

### Configure
- `dormant_non.return` [config required] (response-window): configure dormant_non.return — The reactivation window.
- `dormant_non.touches` [recommended default]: 1 — Every touch runs against a budget fixed when the instance opened; the budget is the plan's own length, and no touch is repeated because nothing could tell whether it arrived.
- `dormant_non.cooldown` [config required] (cooldown): configure dormant_non.cooldown — The cooldown between instances of this journey for the same person, so that a re-qualifying person is tracked but not messaged again inside it.

### Required data
**Semantic events to map**
- `engaged_non_customer_became_dormant` (behavioral) — a previously engaged relationship that has passed the inactivity threshold defined for this context
- `meaningful_return` (behavioral) — real activity in the product or movement in the funnel - not a message open
**Attributes**: lead_id · context_id · last_engaged_at · inactivity_threshold · recorded_reason · monetisation_history

### Collision & priority
- priority: promotional
- pressure class: promotional
- local cap: 1 (all)
- cooldown: configure dormant_non.cooldown
- competition: lifecycle-stage (person) - lowest in the group - any current lifecycle on the same person outranks reactivation
- No action when s.g1 · s.g2 · s.g3 — the suppressions above are recorded outcomes, never a fallback to another channel

### Measurement
- journey outcome: exit-or-handoff: x.winback, x.no-reason, x.engagement-only, x.sunset, h.onboarding, h.intent, h.qualify
- business outcome: meaningful_return — real activity in the product or movement in the funnel - not a message open
- observed: in this journey
- attribution: touched-before-event · pre-post
- guardrails: complaint · message_after_success · unsubscribe

### Reusable rule
Reactivation restores meaningful activity in a dormant non-customer relationship; it does not restore a previously monetized relationship.

### Entity (notes)
- person, lead or inactive non-customer account, in the context that went dormant
- Dormancy is per context. Someone inactive in one product may be perfectly active in another, and this journey is not about them.

### Distinct from
- ACQ-07 (Intent decay → de-prioritise → cooldown or exit) — Decay retires an intent state that is no longer credible. This tries to restart a relationship that had already started, and it only applies where money never changed hands.

### Guardrails
1. Success is a meaningful return, never an open or a click. The message is not the outcome.
2. Former paying customers are out of scope. Win-back is a different journey with different economics.
3. Repeated inactivity does not create repeated campaigns. Each attempt needs its own reason.

### Technical logic (graph, 15 nodes)
- **t.dormant** [trigger] (entry, evidence: behavioral)
  - Event id: `engaged_non_customer_became_dormant`
  - Engaged non customer became dormant
  - evidence: behavioral
  - requires: a previously engaged relationship that has passed the inactivity threshold defined for this context
  - not enough on its own: a gap that is normal for how often this product is used
  - not enough on its own: quiet in one channel while the person is active elsewhere
  - -> c.never-monetized (node)
- **c.never-monetized** [condition] (2 branches)
  - Has this relationship ever been monetised in this context?
  - -> a.reason [Never paid]: no customer or paid relationship exists or has existed for this context (node)
  - -> x.winback [Was a paying customer]: a monetised relationship exists or once existed (node)
- **a.reason** [action]
  - Establish whether there is a credible reason to come back: setup they never finished, an interest they expressed, something now relevant that was not before, a destination left incomplete, or a real change in the product
  - -> c.worth-it (node)
- **x.winback** [exit] (terminal)
  - out of scope; belongs to win-back
  - Detail: none here - restoring a relationship that was once paid for is a different problem with different economics and a different message, and treating it as reactivation gets both wrong
- **c.worth-it** [condition] (2 branches)
  - Is there a credible reason, and is this person still eligible and contactable?
  - -> a.attempt [Worth one attempt]: a specific reason exists and permission and eligibility both hold (node)
  - -> x.no-reason [Not worth it]: no specific reason exists, or permission or eligibility has lapsed (node)
- **a.attempt** [action] (execution: communication)
  - Make one bounded attempt built on the recorded reason. Not a general note that they have been missed, which says nothing and asks for nothing
  - -> w.return (node)
- **x.no-reason** [exit]
  - dormant, no credible reason to re-engage
  - Detail: a genuine change - in the product, in their circumstances, in what they asked for - can create a reason later; dormancy alone never becomes one by lasting longer
- **w.return** [wait]
  - until real activity in the product or movement in the funnel - not a message open
  - Detail: timeout after The reactivation window. (configure dormant_non.return)
  - the window is what stops repeated dormancy from turning into a permanent campaign aimed at people who have already stopped answering
  - engagement does not extend the window
  - -> a.inspect [on event] (node)
  - -> x.sunset [on timeout] (node)
- **a.inspect** [action]
  - Inspect what actually happened before declaring anything. Opening the message is not returning; the question is whether any real state moved
  - -> c.state (node)
- **x.sunset** [exit]
  - reactivation window closed, cooldown in force
  - Detail: only a new reason, not a longer silence; repeated dormancy does not entitle anyone to repeated campaigns
- **c.state** [condition] (4 branches)
  - What state did they actually return into?
  - -> h.onboarding [Unfinished onboarding]: an onboarding instance is open and setup resumed (node)
  - -> h.intent [Renewed commercial intent]: behaviour shows intent stronger than what is currently recorded (node)
  - -> h.qualify [No current qualification]: they are back but nothing on record says whether they are qualified for anything now (node)
  - -> x.engagement-only [Signal did not survive inspection]: what looked like a return turns out to be engagement with the message and nothing more (node)
- **h.onboarding** [handoff]
  - Onboarding progress → next best setup step → activation
  - Detail: a return into unfinished setup
  - carries: the milestones already completed, so they resume rather than restart
  - carries: the reason they were re-engaged
  - -> ACT-12 (journey)
- **h.intent** [handoff]
  - Intent escalation → higher-intent journey handoff
  - Detail: a return carrying stronger intent than the record holds
  - carries: the new signal
  - carries: the dormancy, so this is not read as a first-time interest
  - -> ACQ-03 (journey)
- **h.qualify** [handoff]
  - Qualification state change → route, re-route or exit
  - Detail: a return with no current qualification on record
  - carries: the earlier history and why it lapsed
  - carries: what brought them back
  - -> ACQ-05 (journey)
- **x.engagement-only** [exit]
  - engagement only; nothing reactivated
  - Detail: the window continues to its end if it has not expired; a click is not recorded as a return, because doing so would make this journey report its own message as a result

---
