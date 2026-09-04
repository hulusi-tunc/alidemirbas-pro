## ACT-14 — Onboarding Help

- Canonical ID: `ACT-14`
- Slug: `struggling-user-assistance`
- Display name: Onboarding Help
- Canonical name (chain form): Struggling user detection → proactive assistance → recovery or exit
- Source route: `/lab/customer-journeys/struggling-user-assistance`
- Category: Activation, onboarding & early value
- Goal: relationship-recovery-intervention
- Channels: email, in-app, push
- Surface: customer (communicating)

**Purpose**: Offer help to someone who is visibly trying and not getting anywhere, and stop asking once they have answered.

> Offer help to someone who is visibly trying and not getting anywhere, and stop asking once they have answered.

### Trigger
- Event: `help_seeking_without_activation_progress`
- Meaning: help-seeking behaviour: repeated help-centre visits, repeated returns to the same setup page, repeated failed integration or setup attempts, or repeated errors; and no activation progress behind it
- Not enough on its own: a high session count on its own; a single help-centre visit; heavy usage that is making real progress
- Requires: help-seeking behaviour: repeated help-centre visits, repeated returns to the same setup page, repeated failed integration or setup attempts, or repeated errors; and no activation progress behind it
- Source: behavioral

### Entity
- Scope: person or account plus the open onboarding or trial instance
- instance: account_id + person_id · one-active-per-key

### Who enters
- help-seeking behaviour: repeated help-centre visits, repeated returns to the same setup page, repeated failed integration or setup attempts, or repeated errors
- and no activation progress behind it
- no instance of this journey is already open for the person or account plus the open onboarding or trial instance
- hard gates (GLB-31) allow communication for this purpose

### Suppressed when
- [canonical rule] High activity is not struggling. Someone doing a lot and getting somewhere is the last person to interrupt.
- [canonical rule] An open support case for the same issue suppresses this entirely. The automated offer is always the one that does not know the current state.
- [canonical rule] A decline is respected and cooled down. Asking again after being told no is the behaviour this journey is supposed to replace.
- [canonical rule] The offer is made at most twice: the offer itself, and one final self-service alternative.

### Recommended orchestration · offer-decide-remind
1. **offer** (lifecycle, canonical rule)
   - sent on classification - no wait before it
   - checks: Are the hard entry conditions met? · Is a person already working this same blocker?
   - Channel roles: in-session -> low-friction -> persistent
   - Purpose: Offer help named against the step they keep returning to.
   - destination: `book-assisted-setup` · bound to `account_id`
2. **confirm** (lifecycle, canonical rule)
   - Timing: A bounded response window. (configure struggling_user.response) (after the previous touch)
   - cancelled by an assisted session is booked; the authoritative activation event for this onboarding is recorded; the person explicitly turns the help offer down
   - re-read before sending: the person or account plus the open onboarding or trial instance re-read from the system of record before acting on the timeout
   - checks: What did they do?
   - Channel roles: in-session -> low-friction -> persistent
   - Purpose: Confirm the time, how to join, and the specific problem the session will open with, taken from the step they were stuck on
   - destination: `assisted-session-details` · bound to `session_id`
   - after t1
3. **followup** (lifecycle, canonical rule)
   - Timing: The scheduled session time plus a short grace period. (configure struggling_user.session) (after the previous touch)
   - cancelled by the outcome of the assisted session is recorded; the booking is cancelled in the system of record
   - re-read before sending: the person or account plus the open onboarding or trial instance re-read from the system of record before acting on the timeout
   - checks: Did activation follow the assistance? · Is there one genuinely useful follow-up left?
   - Channel roles: in-session -> low-friction -> persistent
   - Purpose: Send one follow-up tied to what the session actually covered.
   - after t2
4. **final** (lifecycle, canonical rule)
   - Timing: A bounded response window. (configure struggling_user.response) (after the previous touch)
   - cancelled by an assisted session is booked; the authoritative activation event for this onboarding is recorded; the person explicitly turns the help offer down
   - re-read before sending: the person or account plus the open onboarding or trial instance re-read from the system of record before acting on the timeout
   - checks: With no response, is one final self-service option worth sending?
   - Channel roles: in-session -> low-friction -> persistent
   - Purpose: Send one final self-service option and stop.
   - after t1

**Channel roles** (recommended default)
- in-session (in-app) — the person is active in the product and the action is taken there
- low-friction (push) — no active session, a valid token exists, and the message is a single step from the notification
- persistent (email) — no active session and no valid push token - the message has to be kept and survive until the person returns to act on it
- delivery fallback: same-role-other-channel

### Stops when
- [no-action] not in scope for rescue (re-entry: a later struggle inside an open, unactivated instance qualifies normally)
- [suppression] deferred to the person already handling it (re-entry: if that case closes with the struggle unresolved, this qualifies again - two channels chasing one problem is worse than one slow channel)
- [no-action] assistance declined, cooldown in force (re-entry: a new struggle after the cooldown may qualify again; the same offer is not re-sent to someone who has already said no to it)
- [timeout] no session outcome recorded (re-entry: the assistance offer is not repeated on this instance; a fresh struggle after the cooldown is a new question)
- [success] rescue attempt closed, ordinary lifecycle resumes (re-entry: a new struggle in an open, unactivated instance after the cooldown)
- [handoff] Onboarding Completion Handoff — activation reached, with or without the session

### Configure
- `struggling_user.response` [config required] (response-window): configure struggling_user.response — A bounded response window.
- `struggling_user.session` [config required] (observation-window): configure struggling_user.session — The scheduled session time plus a short grace period.
- `struggling_user.touches` [recommended default]: 4 — Every touch runs against a budget fixed when the instance opened; the budget is the plan's own length, and no touch is repeated because nothing could tell whether it arrived.
- `struggling_user.cooldown` [config required] (cooldown): configure struggling_user.cooldown — The cooldown between instances of this journey for the same person or account plus the open onboarding or trial instance, so that a re-qualifying person or account plus the open onboarding or trial instance is tracked but not messaged again inside it.

### Required data
**Semantic events to map**
- `help_seeking_without_activation_progress` (behavioral) — help-seeking behaviour: repeated help-centre visits, repeated returns to the same setup page, repeated failed integration or setup attempts, or repeated errors; and no activation progress behind it
- `assisted_session_scheduled` (authoritative) — an assisted session is booked
- `activation_recorded` (authoritative) — the authoritative activation event for this onboarding is recorded
- `assistance_declined` (declared) — the person explicitly turns the help offer down
- `assisted_session_outcome_recorded` (authoritative) — the outcome of the assisted session is recorded
- `booking_cancelled` (authoritative) — the booking is cancelled in the system of record
**Attributes**: account_id · person_id · onboarding_instance_id · stuck_step · open_support_case_ref · decline_cooldown_until

### Collision & priority
- priority: lifecycle
- pressure class: lifecycle
- local cap: 4 (all)
- cooldown: configure struggling_user.cooldown
- competition: none
- No action when s.g1 · s.g2 · s.g3 · s.g4 — the suppressions above are recorded outcomes, never a fallback to another channel

### Measurement
- journey outcome: exit-or-handoff: x.not-eligible, x.defer, x.declined, x.no-outcome, x.normal, h.activated
- business outcome: activation_recorded — the authoritative activation event for this onboarding is recorded
- observed: in this journey
- attribution: touched-before-event · pre-post
- guardrails: complaint · message_after_success · unsubscribe

### Reusable rule
Proactive assistance should require evidence of effort without progress, not activity alone.

### Entity (notes)
- person or account plus the open onboarding or trial instance
- The struggle is against this attempt at value. A previous trial that went badly does not qualify anyone here.

### Distinct from
- ACT-13 (Missing activation requirement → resolve blocker → resume) — ACT-13 has a named requirement to clear. Here the evidence is effort without progress and no single thing to point at, which is why the offer is help rather than an instruction.

### Guardrails
1. High activity is not struggling. Someone doing a lot and getting somewhere is the last person to interrupt.
2. An open support case for the same issue suppresses this entirely. The automated offer is always the one that does not know the current state.
3. A decline is respected and cooled down. Asking again after being told no is the behaviour this journey is supposed to replace.
4. The offer is made at most twice: the offer itself, and one final self-service alternative.

### Technical logic (graph, 19 nodes)
- **t.struggling** [trigger] (entry, evidence: behavioral)
  - Event id: `help_seeking_without_activation_progress`
  - Help seeking without activation progress
  - evidence: behavioral
  - requires: help-seeking behaviour: repeated help-centre visits, repeated returns to the same setup page, repeated failed integration or setup attempts, or repeated errors
  - requires: and no activation progress behind it
  - not enough on its own: a high session count on its own
  - not enough on its own: a single help-centre visit
  - not enough on its own: heavy usage that is making real progress
  - -> c.hard-entry (node)
- **c.hard-entry** [condition] (2 branches)
  - Are the hard entry conditions met?
  - -> c.duplicate [Eligible]: the onboarding or trial is still open and core activation has not been recorded (node)
  - -> x.not-eligible [Not eligible]: the instance has closed, or activation already happened - in which case the help-seeking is about something else (node)
- **c.duplicate** [condition] (2 branches)
  - Is a person already working this same blocker?
  - -> x.defer [Already handled]: an open support case or an assigned human owner covers the same issue, or ACT-13 already owns a named requirement on this instance - the struggle is almost always that requirement, and a help offer beside a blocker reminder is two voices on one problem (node)
  - -> a.offer [Nobody on it]: no open case or owner covers it (node)
- **x.not-eligible** [exit]
  - not in scope for rescue
  - Detail: a later struggle inside an open, unactivated instance qualifies normally
- **x.defer** [exit]
  - deferred to the person already handling it
  - Detail: if that case closes with the struggle unresolved, this qualifies again - two channels chasing one problem is worse than one slow channel
- **a.offer** [action] (execution: communication)
  - Offer help named against the step they keep returning to. The primary route books assisted setup; the secondary opens the specific guide for that step, for people who would rather not talk to anyone
  - -> w.response (node)
- **w.response** [wait]
  - until an assisted session is booked, or the authoritative activation event for this onboarding is recorded, or the person explicitly turns the help offer down
  - Detail: timeout after A bounded response window. (configure struggling_user.response)
  - no answer is an answer, and it does not license asking again in the same terms
  - engagement does not extend the window
  - -> c.what-happened [on event] (node)
  - -> c.final-option [on timeout] (node)
- **c.what-happened** [condition] (3 branches)
  - What did they do?
  - -> a.confirm [Booked]: an assisted session was scheduled (node)
  - -> h.activated [Solved it themselves]: the activation event was recorded without any session (node)
  - -> x.declined [Declined]: the offer was explicitly turned down (node)
- **c.final-option** [condition] (2 branches)
  - With no response, is one final self-service option worth sending?
  - -> a.final [Worth one]: a specific guide exists for the step they were stuck on (node)
  - -> x.normal [Not worth it]: nothing specific exists to point at, and a general nudge would just repeat the offer (node)
- **a.confirm** [action] (execution: communication)
  - Confirm the time, how to join, and the specific problem the session will open with, taken from the step they were stuck on
  - -> w.session (node)
- **h.activated** [handoff]
  - Activation achieved → stop onboarding → adoption handoff
  - Detail: activation reached, with or without the session
  - carries: whether assistance was involved, which is worth knowing about this account later
  - carries: the struggle that preceded it
  - -> ACT-16 (journey)
- **x.declined** [exit]
  - assistance declined, cooldown in force
  - Detail: a new struggle after the cooldown may qualify again; the same offer is not re-sent to someone who has already said no to it
- **a.final** [action] (execution: communication)
  - Send one final self-service option and stop. The call is not asked for a third time
  - -> x.normal (node)
- **x.normal** [exit]
  - rescue attempt closed, ordinary lifecycle resumes
  - Detail: a new struggle in an open, unactivated instance after the cooldown
- **w.session** [wait]
  - until the outcome of the assisted session is recorded, or the booking is cancelled in the system of record
  - Detail: timeout after The scheduled session time plus a short grace period. (configure struggling_user.session)
  - a booking with no recorded outcome is not evidence of anything, and waiting longer will not produce one
  - engagement does not extend the window
  - -> c.outcome [on event] (node)
  - -> x.no-outcome [on timeout] (node)
- **c.outcome** [condition] (2 branches)
  - Did activation follow the assistance?
  - -> h.activated [Activated]: the authoritative activation event was recorded after the session (node, back-edge)
  - -> c.followup [Still not activated]: the session happened and value still has not been produced (node)
- **x.no-outcome** [exit]
  - no session outcome recorded
  - Detail: the assistance offer is not repeated on this instance; a fresh struggle after the cooldown is a new question
- **c.followup** [condition] (2 branches)
  - Is there one genuinely useful follow-up left?
  - -> a.followup [Yes]: the session surfaced a specific remaining action worth naming (node)
  - -> x.normal [No]: nothing specific came out of it, and a follow-up would only restate the offer (node, back-edge)
- **a.followup** [action] (execution: communication)
  - Send one follow-up tied to what the session actually covered. There is no second one, and no further request for a call
  - -> x.normal (node, back-edge)

---
