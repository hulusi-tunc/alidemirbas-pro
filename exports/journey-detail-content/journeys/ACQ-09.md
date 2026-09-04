## ACQ-09 — Lead Nurture

- Canonical ID: `ACQ-09`
- Slug: `bounded-education-progress-or-sunset`
- Display name: Lead Nurture
- Canonical name (chain form): Researching lead → bounded education → progress or sunset
- Source route: `/lab/customer-journeys/bounded-education-progress-or-sunset`
- Category: Acquisition, intent & qualification
- Goal: progression-milestone
- Channels: email, in-app
- Surface: customer (communicating)

**Purpose**: Give a legitimate but not-yet-ready lead a window of useful education that ends whether or not it worked.

> Give a legitimate but not-yet-ready lead a window of useful education that ends whether or not it worked.

### Trigger
- Event: `valid_lead_not_destination_ready`
- Meaning: a captured lead with a recorded entry reason and no destination it is ready for
- Not enough on its own: a lead that is ready for a destination and simply has not been routed yet, which is ACQ-04's case; a submission with no permission for ongoing contact recorded against it
- Requires: a captured lead with a recorded entry reason and no destination it is ready for
- Source: declared

### Entity
- Scope: lead or person, held against the reason they entered
- instance: lead_id · one-active-per-key

### Who enters
- a captured lead with a recorded entry reason and no destination it is ready for
- no instance of this journey is already open for the lead or person
- hard gates (GLB-31) allow communication for this purpose

### Suppressed when
- [canonical rule] Nurture does not run forever. The window is bounded at entry and it closes on time.
- [canonical rule] Engagement inside the window does not extend it. Opening the emails is not progress toward the destination.
- [canonical rule] Education answers the reason the person entered. A generic sequence sent to everyone is the thing this journey exists instead of.
- [canonical rule] No permission, no nurture. The capture is not the consent.

### Recommended orchestration · single-notice
1. **educate** (promotional, canonical rule)
   - sent on classification - no wait before it
   - checks: Is there explicit permission and a lawful basis for this kind of communication?
   - Channel roles: in-session -> persistent
   - Purpose: Send education matched to the reason the person actually entered - not a generic sequence, and not sales pressure repeated at intervals

**Channel roles** (recommended default)
- in-session (in-app) — the person is active in the product and the action is taken there
- persistent (email) — no active session - the message has to be kept and survive until the person returns to act on it
- delivery fallback: same-role-other-channel

### Stops when
- [no-action] held, no nurture started (re-entry: permission given later re-opens this normally; the capture itself never counted as consent and nothing was sent in the meantime)
- [suppression] nurture stopped; permission no longer covers it (re-entry: a new valid permission plus a new qualifying reason starts a new window)
- [suppression] nurture stopped; no permitted route is deliverable (re-entry: a repaired or newly permitted route, while the entry reason is still live, resumes nurture)
- [timeout] nurture window closed without progression (re-entry: a new inbound signal or a newly declared request can open a new window; immediate re-entry into the same education is suppressed)
- [handoff] Intent Escalation Handoff — a progression signal strong enough to change what this person needs

### Configure
- `bounded_education.window` [config required] (observation-window): configure bounded_education.window — The bounded nurture window is fixed when the lead enters and ends whether or not the education worked; engagement inside it does not extend it.
- `bounded_education.touches` [config required]: configure bounded_education.touches — The number of educational touches inside the bounded window is fixed when the lead enters and is never extended by engagement inside it.
- `bounded_education.cooldown` [config required] (cooldown): configure bounded_education.cooldown — The cooldown between instances of this journey for the same lead or person, so that a re-qualifying lead or person is tracked but not messaged again inside it.

### Required data
**Semantic events to map**
- `valid_lead_not_destination_ready` (declared) — a captured lead with a recorded entry reason and no destination it is ready for
- `nurture_progression_signal` (behavioral) — the lead does something that moves them along the declared subject - a reply, a request, a purchase step
- `permission_withdrawn` (declared) — the person withdraws the permission this communication runs on
- `contactability_lost` (authoritative) — no permitted destination for this person is deliverable any more
**Attributes**: lead_id · person_id · entry_reason · permission_position · window_ends_at · nurture_history

### Collision & priority
- priority: promotional
- pressure class: promotional
- local cap: configure bounded_education.touches (all)
- cooldown: configure bounded_education.cooldown
- competition: none
- No action when s.g1 · s.g2 · s.g3 · s.g4 — the suppressions above are recorded outcomes, never a fallback to another channel

### Measurement
- journey outcome: exit-or-handoff: x.no-basis, x.permission-ended, x.unreachable, x.sunset, h.progressed
- business outcome: nurture_progression_signal — the lead does something that moves them along the declared subject - a reply, a request, a purchase step
- observed: in this journey
- attribution: touched-before-event · pre-post
- guardrails: complaint · message_after_success · unsubscribe

### Reusable rule
Nurture should bridge a temporary readiness gap, not become a permanent messaging state.

### Entity (notes)
- lead or person, held against the reason they entered
- The entry reason is the subject: education answers the question they arrived with, and when the window closes it closes for that reason rather than for the person forever.

### Distinct from
- ACQ-07 (Intent decay → de-prioritise → cooldown or exit) — Decay retires an intent state that has gone stale. This spends a deliberately fixed window trying to advance one, and only then closes it.

### Guardrails
1. Nurture does not run forever. The window is bounded at entry and it closes on time.
2. Engagement inside the window does not extend it. Opening the emails is not progress toward the destination.
3. Education answers the reason the person entered. A generic sequence sent to everyone is the thing this journey exists instead of.
4. No permission, no nurture. The capture is not the consent.

### Technical logic (graph, 13 nodes)
- **t.not-ready** [trigger] (entry, evidence: declared)
  - Event id: `valid_lead_not_destination_ready`
  - Valid lead not destination ready
  - evidence: declared
  - requires: a captured lead with a recorded entry reason and no destination it is ready for
  - not enough on its own: a lead that is ready for a destination and simply has not been routed yet, which is ACQ-04's case
  - not enough on its own: a submission with no permission for ongoing contact recorded against it
  - -> c.basis (node)
- **c.basis** [condition] (2 branches)
  - Is there explicit permission and a lawful basis for this kind of communication?
  - -> a.educate [Basis exists]: permission was given and covers education of this kind (node)
  - -> x.no-basis [No basis]: the capture carried no permission, or the basis does not cover this - the ordinary case, since submitting a form is not consent (node)
- **a.educate** [action] (execution: communication)
  - Send education matched to the reason the person actually entered - not a generic sequence, and not sales pressure repeated at intervals
  - -> w.window (node)
- **x.no-basis** [exit]
  - held, no nurture started
  - Detail: permission given later re-opens this normally; the capture itself never counted as consent and nothing was sent in the meantime
- **w.window** [wait]
  - until the lead does something that moves them along the declared subject - a reply, a request, a purchase step, or the person withdraws the permission this communication runs on, or no permitted destination for this person is deliverable any more
  - Detail: timeout after The bounded nurture window is fixed when the lead enters and ends whether or not the education worked; engagement inside it does not extend it. (configure bounded_education.window)
  - the window is what makes this nurture rather than a permanent messaging state, and it is set once at entry
  - engagement does not extend the window
  - -> c.window-event [on event] (node)
  - -> a.sunset [on timeout] (node)
- **c.window-event** [condition] (3 branches)
  - What ended the wait?
  - -> h.progressed [They progressed]: a meaningful progression signal arrived (node)
  - -> a.stop-permission [Permission withdrawn]: the lawful basis or permission this nurture relied on no longer covers it (node)
  - -> a.stop-contactability [Route lost]: no permitted destination for this person is deliverable any more (node)
- **a.sunset** [action]
  - Close the window and record that it ended without progression, which is a fact about this attempt rather than a judgement about the person
  - writes nurture_history (append)
  - -> x.sunset (node)
- **h.progressed** [handoff]
  - Intent escalation → higher-intent journey handoff
  - Detail: a progression signal strong enough to change what this person needs
  - carries: the entry reason and what education was already sent, so the next journey does not restate it
  - carries: the progression signal itself
  - -> ACQ-03 (journey)
- **a.stop-permission** [action]
  - Invalidate the nurture already queued against this instance and append the reason. A window that only ends on progression or its own clock keeps sending after the permission it depended on has gone
  - -> x.permission-ended (node)
- **a.stop-contactability** [action]
  - Stop this nurture route without recording it as disengagement. A destination that stopped working says nothing about whether the person is still interested, and filing route failure as a lack of interest loses a lead twice
  - -> x.unreachable (node)
- **x.sunset** [exit]
  - nurture window closed without progression
  - Detail: a new inbound signal or a newly declared request can open a new window; immediate re-entry into the same education is suppressed
- **x.permission-ended** [exit]
  - nurture stopped; permission no longer covers it
  - Detail: a new valid permission plus a new qualifying reason starts a new window
- **x.unreachable** [exit]
  - nurture stopped; no permitted route is deliverable
  - Detail: a repaired or newly permitted route, while the entry reason is still live, resumes nurture

---
