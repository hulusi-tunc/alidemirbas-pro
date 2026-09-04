## ACT-17 — Adoption Nurture

- Canonical ID: `ACT-17`
- Slug: `early-adoption-to-stable-use`
- Display name: Adoption Nurture
- Canonical name (chain form): Early adoption → usage depth → habit or stable use
- Source route: `/lab/customer-journeys/early-adoption-to-stable-use`
- Category: Activation, onboarding & early value
- Goal: progression-milestone
- Channels: email, in-app
- Surface: customer (communicating)

**Purpose**: Carry an account from having produced value once to producing it repeatedly, measured against its own use-case.

> Turn a first activation into repeated value in the same use-case: recognise what was actually produced, point at the one behaviour that would produce more, and stop the moment adoption is stable or stalls.

### Trigger
- Event: `core_activation_completed`
- Meaning: a recorded activation, with the use-case that produced it - or, where the product defines activation as first value, the first value-producing event itself: a completed workflow, a completed transaction, a published project, a generated report; the artifact or result that was produced, so recognition can name it
- Not enough on its own: a login, a page view or a completed onboarding checklist - nothing was produced; onboarding steps completed without the activation event itself; an opened or clicked message
- Requires: a recorded activation, with the use-case that produced it - or, where the product defines activation as first value, the first value-producing event itself: a completed workflow, a completed transaction, a published project, a generated report; the artifact or result that was produced, so recognition can name it
- Source: authoritative

### Entity
- Scope: person or account plus the product or use-case value comes from
- instance: account_id + use_case_id · one-active-per-key

### Who enters
- an activation or first value-producing event is recorded for this account in a named use-case
- no adoption instance is already open for this account and use-case
- the account is not in a terminated or restricted state
- hard gates (GLB-31) permit lifecycle communication to the people on the account

### Suppressed when
- [canonical rule] The moment value is produced repeatedly at the rhythm the use-case implies, adoption is stable and nothing further is sent; the lifecycle owner takes the account.
- [canonical rule] When the observation window closes without repeated value the instance hands to adoption recovery; a nurture nudge is never sent into a stall.
- [canonical rule] Recognition names the real thing produced or is not sent; a next action is surfaced only when one genuinely follows from what they did.
- [canonical rule] An open complaint under human ownership, a live risk case or a declared cancellation intent on the same account outranks lifecycle nurture; the touch is deferred and re-evaluated against current state (GLB-06).
- [canonical rule] No touch without permission for lifecycle communication; absent permission is a recorded no-action, never a fallback to another channel.

### Recommended orchestration · single-notice
1. **recognition** (lifecycle, canonical rule)
   - sent on classification - no wait before it
   - Channel roles: in-session -> persistent
   - Purpose: Acknowledge the specific thing that was produced, in its own terms. Recognition that names nothing real is worse than silence.
2. **next-action** (lifecycle, canonical rule)
   - sent on classification - no wait before it
   - checks: Does a natural next action follow from what they just did?
   - Channel roles: in-session -> persistent
   - Purpose: Surface the one action that genuinely follows from what they produced - sharing it, repeating it, extending it - and nothing from the feature list.
   - destination: `next-action-in-context` · bound to `use_case_id`
   - after t0
3. **behaviour-nudge** (lifecycle, recommended default)
   - sent on classification - no wait before it
   - checks: Has adoption become stable?
   - Channel roles: in-session -> persistent
   - Purpose: Encourage only the next behaviour that would produce more value in this use-case; breadth is never pushed where the value is narrow.
   - destination: `next-behaviour-in-context` · bound to `use_case_id`
   - after t0

**Channel roles** (recommended default)
- in-session (in-app) — the person is active in the product - the next behaviour is one step away and is best pointed at from inside
- persistent (email) — no active session, or the recognition and the suggested behaviour have to survive until the person returns
- delivery fallback: same-role-other-channel

### Stops when
- [handoff] external:customer-lifecycle — adoption stabilising
- [handoff] Adoption Recovery — the early-adoption window passing without repeated value

### Configure
- `adoption.nudge_budget` [recommended default]: 3 — Behaviour nudges run against a budget fixed when the instance opened; when it is spent the instance waits out the observation window silently.
- `adoption.observation_window` [config required] (observation-window): configure adoption.observation_window — The early-adoption window is the product's own intended usage rhythm for this use-case; a weekly product and a twice-a-year product cannot share one, and a shared window reports every seasonal account as failing.
- `adoption.touches` [recommended default]: 4 — Recognition and the nudges that follow run against one budget fixed when the instance opened; a nudge is never repeated because nothing could tell whether it was seen.
- `adoption.cooldown` [recommended default] (cooldown): 30 days–90 days — A second activation in the same use-case is the same relationship; a new instance opens only after the previous one has closed and the cooldown has passed.

### Required data
**Semantic events to map**
- `core_activation_completed` (authoritative) — a recorded activation, with the use-case that produced it - or, where the product defines activation as first value, the first value-producing event itself: a completed workflow, a completed transaction, a published project, a generated report; the artifact or result that was produced, so recognition can name it
- `value_produced` (authoritative) — the product records the person producing value again in this use-case
**Attributes**: account_id · use_case_id · activation_event_id · activated_at · produced_artifact
**optional**: has_active_session · expected_usage_rhythm · next_behaviour_candidate

### Collision & priority
- priority: lifecycle
- pressure class: lifecycle
- local cap: 4 (all)
- cooldown: 30 days–90 days
- competition: none
- No action when s.stable · s.stall · s.nothing-real · s.contest · s.permission — the suppressions above are recorded outcomes, never a fallback to another channel

### Measurement
- journey outcome: exit-or-handoff: h.normal, h.stall
- business outcome: value_produced — the product records the person producing value again in this use-case
- observed: in this journey
- attribution: touched-before-event · pre-post
- guardrails: unsubscribe · complaint · message_after_success

### Reusable rule
Adoption should measure repeated value-producing behavior, not raw product activity.

### Entity (notes)
- person or account plus the product or use-case value comes from
- Adoption is measured against the use-case that produced first value, not against the product's full surface.

### Distinct from
- ACT-12 (Onboarding progress → next best setup step → activation) — Onboarding gets someone to value once. This is about the second, fifth and twentieth time, where the obstacle is habit rather than setup.

### Guardrails
1. More feature usage is not better adoption. The measure is repeated value, not surface covered.
2. Breadth is not forced where value is narrow. Pushing a satisfied single-workflow user toward features they do not need makes the product feel heavier, not stickier.
3. Vanity activity does not inflate the adoption state. Logins, opened dashboards and idle sessions are excluded by construction, not filtered out afterwards.

### Technical logic (graph, 10 nodes)
- **t.activated** [trigger] (entry, evidence: authoritative)
  - Event id: `core_activation_completed`
  - Core activation completed
  - evidence: authoritative
  - requires: a recorded activation, with the use-case that produced it - or, where the product defines activation as first value, the first value-producing event itself: a completed workflow, a completed transaction, a published project, a generated report
  - requires: the artifact or result that was produced, so recognition can name it
  - not enough on its own: a login, a page view or a completed onboarding checklist - nothing was produced
  - not enough on its own: onboarding steps completed without the activation event itself
  - not enough on its own: an opened or clicked message
  - -> a.recognize (node)
- **a.recognize** [action] (execution: communication)
  - Acknowledge what was actually produced, in the terms of the thing itself. Recognition that names nothing real reads as manufactured and devalues the milestones that follow
  - writes adoption_log (append)
  - -> c.next (node)
- **c.next** [condition] (2 branches)
  - Does a natural next action follow from what they just did?
  - -> a.surface [Yes]: something specific follows from the thing they produced - sharing it, repeating it, extending it (node)
  - -> a.measure [No]: nothing genuinely follows, and inventing a next step would turn recognition into a pitch (node)
- **a.surface** [action] (execution: communication)
  - Surface one relevant next action, drawn from what they produced rather than from the product's feature list
  - writes adoption_log (append)
  - -> a.measure (node)
- **a.measure** [action]
  - Read adoption from value-producing usage - how often, how deep, whether success repeats, whether others are involved where the use-case needs them. Activity that produces nothing does not count toward it, however much of it there is
  - -> c.stable (node)
- **c.stable** [condition] (2 branches)
  - Has adoption become stable?
  - -> h.normal [Stable]: value is being produced repeatedly at the rhythm this use-case implies, without prompting (node)
  - -> a.next-behavior [Not yet]: value has been produced but not reliably repeated (node)
- **h.normal** [handoff] (external)
  - external:customer-lifecycle
  - Detail: adoption stabilising
  - carries: the use-case that adoption settled around, which is what any later health or expansion judgement should read
  - carries: the rhythm it settled at, so a change in it later means something
  - -> external:customer-lifecycle (external)
- **a.next-behavior** [action] (execution: communication)
  - Identify the next behaviour that would actually produce more value for this use-case, and encourage only that. Breadth is not pursued where the value is narrow - a person who gets everything they need from one workflow is adopted, not under-adopted
  - -> w.observe (node)
- **w.observe** [wait]
  - until the product records the person producing value again in this use-case
  - Detail: timeout after The early-adoption window is the product's own intended usage rhythm for this use-case; a weekly product and a twice-a-year product cannot share one, and a shared window reports every seasonal account as failing. (configure adoption.observation_window)
  - a weekly product and a twice-a-year product cannot share a window, and a shared one would report every seasonal account as failing
  - engagement does not extend the window
  - -> a.measure [on event] (node, back-edge)
  - -> h.stall [on timeout] (node)
- **h.stall** [handoff]
  - Adoption stall → diagnose missing value → recover or re-route
  - Detail: the early-adoption window passing without repeated value
  - carries: what was produced and when it stopped
  - carries: the expected pattern it was measured against, so the stall is diagnosed rather than assumed
  - -> ACT-18 (journey)

---
