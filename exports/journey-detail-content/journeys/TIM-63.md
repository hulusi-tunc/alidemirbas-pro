## TIM-63 — Expiry Reminder

- Canonical ID: `TIM-63`
- Slug: `pre-expiry-window`
- Display name: Expiry Reminder
- Canonical name (chain form): Expiry approaching → eligibility check → renew, complete or let expire
- Source route: `/lab/customer-journeys/pre-expiry-window`
- Category: Time, deadlines, expiry & temporary states
- Goal: expiry-renewal
- Channels: email, in-app, push, sms
- Surface: customer (communicating)

**Purpose**: Use the window before an expiry only where acting inside it could actually change what happens.

> Before something expires, tell the person who can actually act what is expiring, the one action that would change the outcome and the point by which it must be taken - or, where nothing can be done, say plainly what will happen; and say nothing where nothing is worth saying.

### Trigger
- Event: `pre_expiry_window_entered`
- Meaning: a time-bound entity entering a pre-expiry window whose length reflects how long acting on it actually takes
- Not enough on its own: a fixed interval applied to every entity type regardless of what renewal involves
- Requires: a time-bound entity entering a pre-expiry window whose length reflects how long acting on it actually takes
- Source: authoritative

### Entity
- Scope: the time-bound entity approaching expiry - a subscription, document, entitlement, credential, approval, reservation, benefit or agreement
- instance: entity_ref + validity_id · one-active-per-key

### Who enters
- a pre-expiry window has been entered for a time-bound entity with an asserted expiry
- the entity is still expiring - not already renewed, replaced or completed - when re-read
- hard gates (GLB-31) permit service communication to the responsible actor

### Suppressed when
- [canonical rule] An entity already renewed, replaced or completed when the window is re-read sends nothing; the window opened on a schedule and the state may have moved.
- [canonical rule] A pre-expiry message addressed to someone who cannot act is noise; the responsible actor and the action are established before anything is sent.
- [canonical rule] Where nothing can be done and telling anyone changes nothing, nothing is sent.
- [canonical rule] An informational notice carries no prompt to act, because there is no action; a prompt to act with nothing to do is a false one.
- [canonical rule] A renewal granted before expiry invalidates the expiry actions queued against the old validity; nothing sent later refers to the old one.

### Recommended orchestration · deadline-countdown
1. **action-prompt** (service, canonical rule)
   - sent on classification - no wait before it
   - checks: Has it already been renewed, replaced or completed? · Is an action available that would materially change the outcome?
   - Channel roles: persistent -> in-session -> urgent
   - Purpose: Tell the responsible actor what is expiring, the specific action that would change the outcome, and the point by which it must be taken.
   - destination: `expiry-action` · bound to `validity_id` · must not claim: an expiry the system of record does not assert, that the action has been taken
2. **informational-notice** (service, canonical rule)
   - sent on classification - no wait before it
   - checks: Has it already been renewed, replaced or completed? · Is an action available that would materially change the outcome? · Is telling anyone useful even though nothing can be done?
   - Channel roles: persistent
   - Purpose: Say what will happen and when, with no prompt to act attached, because there is no action.

**Channel roles** (recommended default)
- persistent (email) — the message names an action and a boundary and must survive until the responsible actor can act - the default
- in-session (in-app) — the responsible actor is in the product and the action is taken there
- urgent (sms, push) — expires_at falls inside the urgent_horizon attribute, the action is a single step, and permission for service messages on the channel is recorded
- delivery fallback: same-role-other-channel

### Stops when
- [suppression] pre-expiry journey suppressed; nothing is expiring (re-entry: the replacement entity has its own expiry and its own window)
- [no-action] expiring, nothing to do and nothing worth saying (re-entry: the expiry itself is handled at the moment it arrives)
- [handoff] external:renewal-lifecycle — an entity resolved before its expiry
- [handoff] Expiry Validation — the window closing without resolution

### Configure
- `expiry.expiry_moment` [recommended default] (attribute-bound): expires_at as the system of record asserts it — The wait ends at the expiry the system of record asserts; the expiry itself is validated and handled by the next journey, never re-asserted here.
- `expiry.touches` [recommended default]: 1 — One pre-expiry message per validity - a prompt to act or an informational notice, never both; the expiry itself is handled by expiry validation.
- `expiry.cooldown` [recommended default]: none — Reminders are per validity; a renewed entity's next validity is its own instance and no cooldown applies between validities.

### Required data
**Semantic events to map**
- `pre_expiry_window_entered` (authoritative) — a time-bound entity entering a pre-expiry window whose length reflects how long acting on it actually takes
- `renewed` (authoritative) — the expiring item is renewed
- `completion_recorded` (authoritative) — the required action is completed before expiry
- `replaced` (authoritative) — the expiring item is replaced
**Attributes**: entity_ref · validity_id · expires_at · entity_type · responsible_actor · available_action
**optional**: has_active_session · urgent_channel_permission · action_destination · urgent_horizon

### Collision & priority
- priority: service
- pressure class: service
- local cap: 1 (all)
- cooldown: none
- competition: none
- No action when s.already-resolved · s.no-actor · s.nothing-to-say · s.no-call-where-no-action · s.stale-queue — the suppressions above are recorded outcomes, never a fallback to another channel

### Measurement
- journey outcome: exit-or-handoff: h.resolved, h.expiry, x.suppressed, x.silent
- business outcome: renewed — the expiring item is renewed
- observed: in this journey
- attribution: touched-before-event · pre-post
- guardrails: complaint · prompt_with_no_action · message_after_resolution · support_contact_within_24h

### Reusable rule
Pre-expiry orchestration should exist only when action before expiry can materially change the outcome.

### Entity (notes)
- the time-bound entity approaching expiry - a subscription, document, entitlement, credential, approval, reservation, benefit or agreement
- One window per entity. A person holding three expiring credentials has three windows, and renewing one closes only its own.

### Distinct from
- TIM-64 (Expiry reached → validate current state → expire, extend or replace) — This runs while the outcome can still change. TIM-64 runs at the moment it stops being able to. Keeping them apart is what makes expiring and expired different states rather than the same one announced twice.

### Guardrails
1. Expiring is not expired. Nothing in this journey applies an expiry consequence.
2. No expiry reminder is sent where no action is possible or useful. A prompt to act on something nobody can act on teaches people to ignore the ones that matter.
3. The pre-expiry window reflects how long the action genuinely takes, not a shared default.

### Technical logic (graph, 14 nodes)
- **t.window** [trigger] (entry, evidence: authoritative)
  - Event id: `pre_expiry_window_entered`
  - Pre expiry window entered
  - evidence: authoritative
  - requires: a time-bound entity entering a pre-expiry window whose length reflects how long acting on it actually takes
  - not enough on its own: a fixed interval applied to every entity type regardless of what renewal involves
  - -> a.reread (node)
- **a.reread** [action]
  - Re-read the entity's current state. The window opened on a schedule, and the entity may have been renewed, replaced or completed since that schedule was written
  - -> c.already (node)
- **c.already** [condition] (2 branches)
  - Has it already been renewed, replaced or completed?
  - -> x.suppressed [Already resolved]: the entity is no longer heading toward this expiry (node)
  - -> c.action [Still expiring]: the expiry still applies (node)
- **x.suppressed** [exit]
  - pre-expiry journey suppressed; nothing is expiring
  - Detail: the replacement entity has its own expiry and its own window
- **c.action** [condition] (2 branches)
  - Is an action available that would materially change the outcome?
  - -> a.actor [Action available]: renewal, completion or replacement is possible and someone can carry it out (node)
  - -> c.informational [Nothing can be done]: the expiry will happen regardless - no renewal exists, or the decision is not the holder's to make (node)
- **a.actor** [action]
  - Establish who is responsible for acting and what the action actually is. A pre-expiry message addressed to someone who cannot perform the renewal is a notification pretending to be a call to action
  - -> a.prompt-action (node)
- **c.informational** [condition] (2 branches)
  - Is telling anyone useful even though nothing can be done?
  - -> a.inform [Worth saying]: the holder needs to plan around it, or would otherwise be surprised (node)
  - -> x.silent [Not worth saying]: nobody gains anything from knowing earlier (node)
- **a.prompt-action** [action] (execution: communication)
  - Tell the responsible actor what is expiring, the specific action that would change the outcome, and the point after which that action stops being available. Establishing who must act and then waiting for them to act, without ever telling them, is a call to action nobody received
  - -> w.resolution (node)
- **a.inform** [action] (execution: communication)
  - Say what will happen and when, with no call to action attached - because there is no action. A prompt to act where acting is impossible is worse than silence
  - -> w.resolution (node)
- **x.silent** [exit]
  - expiring, nothing to do and nothing worth saying
  - Detail: the expiry itself is handled at the moment it arrives
- **w.resolution** [wait]
  - until the expiring item is renewed, or the required action is completed before expiry, or the expiring item is replaced
  - Detail: timeout after The wait ends at the expiry the system of record asserts; the expiry itself is validated and handled by the next journey, never re-asserted here. (recommended: expires_at as the system of record asserts it; configure expiry.expiry_moment)
  - the window closes at the expiry by definition; what happens then belongs to the expiry journey rather than to this one
  - engagement does not extend the window
  - -> a.invalidate [on event] (node)
  - -> h.expiry [on timeout] (node)
- **a.invalidate** [action]
  - Invalidate the expiry actions queued against the old validity, so a renewal granted today is not undone by an expiry scheduled yesterday
  - writes suppressed_sends (append)
  - -> h.resolved (node)
- **h.expiry** [handoff]
  - Expiry reached → validate current state → expire, extend or replace
  - Detail: the window closing without resolution
  - carries: the entity and what was attempted during the window
  - -> TIM-64 (journey)
- **h.resolved** [handoff] (external)
  - external:renewal-lifecycle
  - Detail: an entity resolved before its expiry
  - carries: the entity and its new validity period
  - carries: the old expiry, now invalidated, so nothing downstream still holds it
  - suppresses: every expiry action scheduled under the previous validity
  - -> external:renewal-lifecycle (external)

---
