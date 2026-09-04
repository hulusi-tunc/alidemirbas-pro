## ACT-12 — Onboarding Nurture

- Canonical ID: `ACT-12`
- Slug: `onboarding-progress-next-step`
- Display name: Onboarding Nurture
- Canonical name (chain form): Onboarding progress → next best setup step → activation
- Source route: `/lab/customer-journeys/onboarding-progress-next-step`
- Category: Activation, onboarding & early value
- Goal: progression-milestone
- Channels: email, in-app
- Surface: customer (communicating)

**Purpose**: Advance onboarding from the state the setup record actually reports, one useful step at a time, until activation or the window ends.

> Get an onboarding account to activation by surfacing the single most useful next step, read from what is actually done, until activation happens, a named blocker takes over, or the window closes.

### Trigger
- Event: `onboarding_active_without_activation`
- Meaning: an onboarding instance that is open and an activation event that has not been recorded
- Not enough on its own: a completed sign-up with no onboarding instance opened; activity inside a different product's onboarding
- Requires: an onboarding instance that is open and an activation event that has not been recorded
- Source: authoritative

### Entity
- Scope: person or account plus the onboarding instance
- instance: account_id + onboarding_instance_id · one-active-per-key

### Who enters
- an onboarding instance is open for the account and activation is not yet recorded
- the product's own record of setup milestones is readable
- no nurture instance is already open for this onboarding instance
- no ACT-14 assisted-help session is open (booked and not yet resolved) for this account
- hard gates (GLB-31) permit lifecycle communication

### Suppressed when
- [canonical rule] The authoritative activation event supersedes this journey wherever it sits: the instance hands to completion and nothing further is sent.
- [canonical rule] When one named mandatory prerequisite is established as the thing preventing activation, the blocker journey (ACT-13) owns the account; nurture steps stop.
- [canonical rule] A completed step is never suggested again; every touch re-reads the milestone record first.
- [canonical rule] When the onboarding window closes without activation the instance exits; onboarding prompts are not sent into a closed window.
- [canonical rule] This journey sits below the activation event and below any open issue under human ownership on the same account (GLB-06).
- [canonical rule] An open ACT-14 assisted-help session (booked at a.confirm, not yet resolved) on the same account takes ownership from this journey's generic next-step prompts; nurture steps pause until ACT-14's w.session resolves (assisted_session_outcome_recorded or booking_cancelled) or exits, and resume against the milestone record as it then stands.
- [canonical rule] No touch without permission for lifecycle communication; absent permission is a recorded no-action.

### Recommended orchestration · progressive-recovery
1. **next-step** (lifecycle, canonical rule)
   - sent on classification - no wait before it
   - checks: Is there a critical next step still outstanding?
   - Channel roles: in-session -> persistent
   - Purpose: Surface the single most useful next action, read from the product's own record of what is done. Never a completed step, never the whole checklist.
   - destination: `next-setup-step` · bound to `onboarding_instance_id`

**Channel roles** (recommended default)
- in-session (in-app) — the person is inside the product - the next step is best pointed at where it is taken
- persistent (email) — no active session, or the step needs an explanation that survives until the person returns
- delivery fallback: same-role-other-channel

### Stops when
- [timeout] onboarding window closed without activation (re-entry: a later setup or activation event re-opens this normally; the completed milestones are kept, so a return does not start from the beginning)
- [handoff] Onboarding Blocker Reminder — one named mandatory prerequisite established as the thing preventing activation, rather than a general lack of progress
- [handoff] Onboarding Completion Handoff — the authoritative activation event

### Configure
- `onboarding.step_prompts` [recommended default]: 5 — The same budget as the local cap: every prompt spends it, and a spent budget waits out the window silently.
- `onboarding.step_interval` [config required] (observation-window): configure onboarding.step_interval — The interval between step prompts is the one appropriate to the remaining work - a step that takes minutes and a step that needs an administrator cannot share it.
- `onboarding.cooldown` [recommended default] (cooldown): 14 days–30 days — Onboarding is per instance; a re-opened onboarding after the window closed is a new instance and enters silently until the cooldown has passed.
- `onboarding.holdout_share` [recommended default]: 10 — A persistent holdout is required: accounts activate on their own often enough that a treated-only measurement cannot tell the prompts' effect from theirs.

### Required data
**Semantic events to map**
- `onboarding_active_without_activation` (authoritative) — an onboarding instance that is open and an activation event that has not been recorded
- `setup_milestone_completed` (authoritative) — the product's own record marks a setup milestone complete
- `activation_recorded` (authoritative) — the authoritative activation event for this onboarding is recorded
**Attributes**: account_id · onboarding_instance_id · milestones · critical_steps · window_ends_at
**optional**: has_active_session · blocker_candidate · assisted_session_open

### Collision & priority
- priority: lifecycle
- pressure class: lifecycle
- local cap: 5 (all)
- cooldown: 14 days–30 days
- competition: lifecycle-stage (person) - below the authoritative activation event, which supersedes it wherever it sits
- No action when s.activated · s.blocker · s.done-step · s.window · s.contest · s.assisted · s.permission — the suppressions above are recorded outcomes, never a fallback to another channel

### Measurement
- journey outcome: exit-or-handoff: h.activated, h.blocker, x.window-closed
- business outcome: activation_recorded — the authoritative activation event for this onboarding is recorded
- observed: in this journey
- attribution: touched-before-event · persistent-holdout
- guardrails: unsubscribe · complaint · message_after_success · completed_step_suggested

### Reusable rule
Onboarding communication should respond to actual progress rather than elapsed time alone.

### Entity (notes)
- person or account plus the onboarding instance
- Progress is held against the instance. A second onboarding for a different product does not inherit the first one's completed steps.

### Guardrails
1. A completed step is never suggested again. Reading the setup record rather than the send history is what makes that true.
2. Step order is enforced only where a real dependency exists. Imposed sequence turns optional work into a blocker.
3. A finished checklist is not activation. Setup being complete and the product having produced value are two different facts, and this journey can reach the first without the second.

### Pre-empted by
- the authoritative activation event, from anywhere — ACT-16 takes ownership and invalidates whatever this journey still had pending
- a named requirement blocking activation — ACT-13 owns the blocker; generic next-step messaging stops until it is resolved
- an assisted setup session scheduled through ACT-14 — ACT-14 owns setup communication until the session outcome is recorded; generic next-step prompts pause rather than compete with a booked call

### Technical logic (graph, 12 nodes)
- **t.active** [trigger] (entry, evidence: authoritative)
  - Event id: `onboarding_active_without_activation`
  - Onboarding active without activation
  - evidence: authoritative
  - requires: an onboarding instance that is open and an activation event that has not been recorded
  - not enough on its own: a completed sign-up with no onboarding instance opened
  - not enough on its own: activity inside a different product's onboarding
  - -> a.read (node)
- **a.read** [action]
  - Read which setup milestones are complete and which remain, from the product's own record of what was done rather than from what was sent or opened
  - -> c.next-step (node)
- **c.next-step** [condition] (2 branches)
  - Is there a critical next step still outstanding?
  - -> a.surface [A step remains]: at least one incomplete milestone stands between this account and value (node)
  - -> c.ready [Nothing critical left]: the setup work is done and what remains is whether value has actually been produced (node)
- **a.surface** [action] (execution: communication)
  - Surface the single most useful next action. A completed step is never suggested again, and an order is imposed only where one step genuinely depends on another - elsewhere the person picks
  - -> w.progress (node)
- **c.ready** [condition] (2 branches)
  - Has activation actually been achieved?
  - -> h.activated [Activated]: the authoritative activation event has been recorded (node)
  - -> w.progress [Setup complete, value not yet produced]: every milestone is done and no activation event exists - the checklist finished and the product has still not done anything for them (node)
- **w.progress** [wait]
  - until the product's own record marks a setup milestone complete, or the authoritative activation event for this onboarding is recorded
  - Detail: timeout after The interval between step prompts is the one appropriate to the remaining work - a step that takes minutes and a step that needs an administrator cannot share it. (configure onboarding.step_interval)
  - the wait is for the person to act; when nothing happens the state is re-read rather than the same message being repeated
  - engagement does not extend the window
  - -> c.what-happened [on event] (node)
  - -> c.window [on timeout] (node)
- **h.activated** [handoff]
  - Activation achieved → stop onboarding → adoption handoff
  - Detail: the authoritative activation event
  - carries: which event satisfied activation
  - carries: what onboarding still had outstanding, so the right things get invalidated rather than all of them
  - -> ACT-16 (journey)
- **c.what-happened** [condition] (2 branches)
  - Which event arrived?
  - -> h.activated [Activation]: the authoritative activation event was recorded (node, back-edge)
  - -> a.read [A setup milestone]: progress was made but value has not been produced yet (node, back-edge)
- **c.window** [condition] (2 branches)
  - Is the onboarding window still open?
  - -> c.stalled-step [Still open]: the window fixed at entry has not expired (node)
  - -> x.window-closed [Closed]: the window has expired without activation (node)
- **c.stalled-step** [condition] (2 branches)
  - Is the same prerequisite actually blocking activation?
  - -> h.blocker [A named blocker is holding it]: authoritative state shows one mandatory prerequisite unchanged and preventing activation, not merely a quiet interval (node)
  - -> a.read [No blocker; simply incomplete]: setup has not advanced but nothing identifiable is preventing it (node, back-edge)
- **x.window-closed** [exit]
  - onboarding window closed without activation
  - Detail: a later setup or activation event re-opens this normally; the completed milestones are kept, so a return does not start from the beginning
- **h.blocker** [handoff]
  - Missing activation requirement → resolve blocker → resume
  - Detail: one named mandatory prerequisite established as the thing preventing activation, rather than a general lack of progress
  - carries: the exact outstanding prerequisite and how long it has stayed unchanged
  - carries: the onboarding route and the milestones already completed
  - suppresses: the generic next-step prompt for this prerequisite while the blocker journey owns it
  - -> ACT-13 (journey)

---
