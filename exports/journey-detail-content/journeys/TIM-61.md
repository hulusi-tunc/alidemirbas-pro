## TIM-61 — Deadline Tracking

- Canonical ID: `TIM-61`
- Slug: `deadline-tracking`
- Display name: Deadline Tracking
- Canonical name (chain form): Deadline created → track → complete, escalate or expire
- Source route: `/lab/customer-journeys/deadline-tracking`
- Category: Time, deadlines, expiry & temporary states
- Goal: escalation-exception
- Channels: email, push, sms, whatsapp
- Surface: customer (communicating)

**Purpose**: Let a deadline govern the state of one obligation, rather than schedule messages around a date.

> Let a deadline govern the state of one obligation, rather than schedule messages around a date.

### Trigger
- Event: `authoritative_deadline_assigned`
- Meaning: a deadline assigned to a specific obligation by a system or rule entitled to set one
- Not enough on its own: a reminder date configured in a messaging tool, which schedules communication rather than governing an obligation; an internal target with no consequence attached to missing it
- Requires: a deadline assigned to a specific obligation by a system or rule entitled to set one
- Source: authoritative

### Entity
- Scope: the obligation the deadline is attached to - a task, request, case or application
- instance: obligation_id · one-active-per-key

### Who enters
- a deadline assigned to a specific obligation by a system or rule entitled to set one
- no instance of this journey is already open for the the obligation the deadline is attached to
- hard gates (GLB-31) allow communication for this purpose

### Suppressed when
- [canonical rule] A deadline being reached is not failure unless the governing rule says so. Five different outcomes are available and only one of them is failure.
- [canonical rule] The reminder schedule is not the deadline. Moving a reminder does not move the obligation.
- [canonical rule] A completed obligation is not reopened by a stale deadline job.
- [canonical rule] Timezone is recorded wherever it changes which day the deadline falls on.

### Recommended orchestration · single-notice
1. **remind** (service, canonical rule)
   - Timing: The deadline itself. (configure deadline_tracking.tracking) (relative to due_at)
   - cancelled by the obligation is satisfied in the system of record; a defined point before the deadline is reached
   - re-read before sending: the the obligation the deadline is attached to re-read from the system of record before acting on the timeout
   - checks: Which happened? · Is a pre-deadline reminder useful here, and does policy define one?
   - Channel roles: persistent -> low-friction -> urgent
   - Purpose: Send the reminder defined for this threshold.
   - destination: `discharge-the-obligation` · bound to `obligation_id` · must not claim: a moved deadline

**Channel roles** (recommended default)
- persistent (email) — the message has to be kept and survive until the person can act on it
- low-friction (push) — a valid token or app session exists and the message is a single step from the notification
- urgent (sms, whatsapp) — due_at falls inside the urgent_horizon attribute and permission for messages on this channel is recorded
- delivery fallback: same-role-other-channel

### Stops when
- [success] obligation satisfied before its deadline (re-entry: a new obligation carries its own deadline; this one is closed)
- [failure] obligation failed at its deadline, as the rule defines (re-entry: a new attempt is a new obligation with its own deadline; this one records that it was not met)
- [no-action] deadline passed, obligation unchanged (re-entry: the obligation continues under whatever governs it - time passing did not decide anything here, which is the ordinary case and not an omission)
- [handoff] Overdue State Recalculation — an obligation surviving its deadline
- [handoff] Ownership Escalation — a deadline whose governing rule escalates rather than changing the obligation
- [handoff] Expiry Validation — a deadline at which the obligation itself ceases to be valid

### Configure
- `deadline_tracking.tracking` [config required] (attribute-bound): configure deadline_tracking.tracking — The deadline itself.
- `deadline_tracking.remind_budget` [config required]: configure deadline_tracking.remind_budget — This loop runs against a budget fixed when the instance opened; when it is spent the instance takes its timeout path (GLB-24).
- `deadline_tracking.touches` [config required]: configure deadline_tracking.touches — One reminder per pre-deadline threshold the governing policy defines; the thresholds are policy, and none is added to make a schedule.
- `deadline_tracking.cooldown` [recommended default]: none — This journey is per the obligation the deadline is attached to; a later instance concerns a different the obligation the deadline is attached to and no cooldown applies between them.

### Required data
**Semantic events to map**
- `authoritative_deadline_assigned` (authoritative) — a deadline assigned to a specific obligation by a system or rule entitled to set one
- `obligation_satisfied` (authoritative) — the obligation is satisfied in the system of record
- `pre_deadline_threshold_reached` (authoritative) — a defined point before the deadline is reached
**Attributes**: obligation_id · due_at · governing_rule · thresholds · consequence_on_miss · deadline_log
**optional**: urgent_horizon

### Collision & priority
- priority: service
- pressure class: service
- local cap: configure deadline_tracking.touches (all)
- cooldown: none
- competition: none
- No action when s.g1 · s.g2 · s.g3 · s.g4 — the suppressions above are recorded outcomes, never a fallback to another channel

### Measurement
- journey outcome: exit-or-handoff: x.satisfied, x.failed, x.still-valid, h.overdue, h.escalate, h.expired
- business outcome: obligation_satisfied — the obligation is satisfied in the system of record
- observed: in this journey
- attribution: touched-before-event · pre-post
- guardrails: complaint · message_after_success · unsubscribe

### Reusable rule
A deadline should govern the state of a specific obligation rather than merely schedule communication around a date.

### Entity (notes)
- the obligation the deadline is attached to - a task, request, case or application
- The deadline belongs to the obligation. Two obligations sharing a date are two deadlines, and one being met says nothing about the other.

### Distinct from
- TIM-63 (Expiry approaching → eligibility check → renew, complete or let expire) — A deadline is a moment by which something must be done. An expiry is a moment at which something stops being valid. The first can pass with the obligation intact; the second cannot.

### Guardrails
1. A deadline being reached is not failure unless the governing rule says so. Five different outcomes are available and only one of them is failure.
2. The reminder schedule is not the deadline. Moving a reminder does not move the obligation.
3. A completed obligation is not reopened by a stale deadline job.
4. Timezone is recorded wherever it changes which day the deadline falls on.

### Technical logic (graph, 14 nodes)
- **t.deadline** [trigger] (entry, evidence: authoritative)
  - Event id: `authoritative_deadline_assigned`
  - Authoritative deadline assigned
  - evidence: authoritative
  - requires: a deadline assigned to a specific obligation by a system or rule entitled to set one
  - not enough on its own: a reminder date configured in a messaging tool, which schedules communication rather than governing an obligation
  - not enough on its own: an internal target with no consequence attached to missing it
  - -> a.store (node)
- **a.store** [action]
  - Store the deadline with its timezone where that changes the answer, its source, the obligation it governs, its owner, and what would count as completion. The completion condition is the load-bearing part - a deadline that cannot say what would satisfy it can only ever measure elapsed time
  - writes deadline_log (append)
  - -> w.tracking (node)
- **w.tracking** [wait]
  - until the obligation is satisfied in the system of record, or a defined point before the deadline is reached
  - Detail: timeout after The deadline itself. (configure deadline_tracking.tracking)
  - the deadline is an absolute point, so this wait is bounded by it however many thresholds sit inside
  - engagement does not extend the window
  - -> c.what [on event] (node)
  - -> c.consequence [on timeout] (node)
- **c.what** [condition] (2 branches)
  - Which happened?
  - -> a.satisfied [Completed]: the completion condition recorded with the deadline is satisfied (node)
  - -> c.useful [Pre-deadline threshold]: a defined point before the deadline was reached with the obligation still open (node)
- **c.consequence** [condition] (5 branches)
  - The deadline passed with the obligation open - what does the governing rule say happens?
  - -> h.overdue [OVERDUE]: the obligation survives its deadline and changes operational state (node)
  - -> h.escalate [ESCALATED]: the rule raises it rather than changing the obligation itself (node)
  - -> h.expired [EXPIRED]: the obligation itself ceases to be valid at the deadline (node)
  - -> x.failed [FAILED]: the rule explicitly defines missing this deadline as failure (node)
  - -> x.still-valid [STILL_VALID]: the deadline was a target and passing it changes nothing about the obligation (node)
- **a.satisfied** [action]
  - Mark the obligation satisfied and invalidate every reminder and escalation still queued against it. A completed obligation is never reopened by a stale deadline job, which is the specific way a finished thing comes back to life
  - writes deadline_log (append)
  - writes suppressed_sends (append)
  - -> x.satisfied (node)
- **c.useful** [condition] (2 branches)
  - Is a pre-deadline reminder useful here, and does policy define one?
  - -> a.remind [Send it]: policy defines a reminder at this threshold and the recipient can still act on it (node)
  - -> w.tracking [Nothing to send]: no reminder is defined, or nobody can do anything differently on hearing it (node, back-edge)
- **h.overdue** [handoff]
  - Due-state change → recalculate priority → resolve or escalate
  - Detail: an obligation surviving its deadline
  - carries: the obligation and its original deadline history
  - carries: the owner it was assigned to
  - -> TIM-62 (journey)
- **h.escalate** [handoff]
  - Responsibility escalation → higher authority → resolution or return
  - Detail: a deadline whose governing rule escalates rather than changing the obligation
  - carries: the obligation, its deadline and how long it has been open
  - -> OWN-55 (journey)
- **h.expired** [handoff]
  - Expiry reached → validate current state → expire, extend or replace
  - Detail: a deadline at which the obligation itself ceases to be valid
  - carries: the obligation and the validity period now ending
  - -> TIM-64 (journey)
- **x.failed** [exit]
  - obligation failed at its deadline, as the rule defines
  - Detail: a new attempt is a new obligation with its own deadline; this one records that it was not met
- **x.still-valid** [exit]
  - deadline passed, obligation unchanged
  - Detail: the obligation continues under whatever governs it - time passing did not decide anything here, which is the ordinary case and not an omission
- **x.satisfied** [exit]
  - obligation satisfied before its deadline
  - Detail: a new obligation carries its own deadline; this one is closed
- **a.remind** [action] (execution: communication)
  - Send the reminder defined for this threshold. The reminder schedule is not the deadline and does not move it - a deadline nobody was reminded about is still the deadline
  - -> w.tracking (node, back-edge)

---
