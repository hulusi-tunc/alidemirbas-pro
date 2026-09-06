## ACT-13 — Onboarding Blocker Reminder

- Canonical ID: `ACT-13`
- Slug: `activation-blocker-resolution`
- Display name: Onboarding Blocker Reminder
- Canonical name (chain form): Missing activation requirement → resolve blocker → resume
- Source route: `/lab/customer-journeys/activation-blocker-resolution`
- Category: Activation, onboarding & early value
- Goal: relationship-recovery-intervention
- Channels: email, in-app, task
- Surface: customer (communicating)

**Purpose**: Aim the whole journey at one named missing thing, and resume onboarding once it exists.

> Aim the whole journey at one named missing thing, and resume onboarding once it exists.

### Trigger
- Event: `activation_blocked_by_named_requirement`
- Meaning: a specific unmet requirement: an integration not connected, a required configuration absent, a verification incomplete, a required person not yet present, a mandatory setup step unfinished
- Not enough on its own: an incomplete optional field; a profile that is not filled in; a general sense that setup is unfinished
- Requires: a specific unmet requirement: an integration not connected, a required configuration absent, a verification incomplete, a required person not yet present, a mandatory setup step unfinished
- Source: authoritative

### Entity
- Scope: the blocking requirement, held against the account or onboarding instance
- instance: account_id + requirement_id · one-active-per-key

### Who enters
- a specific unmet requirement: an integration not connected, a required configuration absent, a verification incomplete, a required person not yet present, a mandatory setup step unfinished
- no instance of this journey is already open for the the blocking requirement
- hard gates (GLB-31) allow communication for this purpose

### Suppressed when
- [canonical rule] No generic finish-your-setup messaging. The requirement is named, or this journey has nothing to say.
- [canonical rule] A missing field that does not block activation is not presented as a blocker. Doing so trains people to discount the real ones.
- [canonical rule] The moment the requirement is met, its reminders stop, including any already scheduled.

### Recommended orchestration · single-notice
1. **specific-action** (lifecycle, canonical rule)
   - sent on classification - no wait before it
   - checks: Does this requirement actually block activation? · Can this account resolve the requirement directly?
   - Channel roles: persistent -> in-session
   - Purpose: Give the one specific action that clears this requirement, named as the thing it is - never a general prompt to finish setup, which tells someone who is already blocked nothing they did not know
   - destination: `requirement-resolution-step` · bound to `requirement_id` · must not claim: that setup in general is unfinished
2. **route-dependency** (lifecycle, canonical rule)
   - sent on classification - no wait before it
   - checks: Does this requirement actually block activation? · Can this account resolve the requirement directly?
   - Channel roles: human
   - Purpose: Raise the requirement with whoever can actually resolve it, carrying what is blocked and why.

**Channel roles** (recommended default)
- persistent (email) — the message has to be kept and survive until the person can act on it
- in-session (in-app) — the person is active in the product and the action is taken there
- human (task) — the step is carried out by a person - a call, a task, a visit - and recorded as done by them
- delivery fallback: same-role-other-channel

### Stops when
- [invalid-state] not a blocker; ordinary onboarding continues (re-entry: if the same requirement later becomes mandatory, it enters as a real blocker; presenting it as one now would teach people to ignore the ones that matter)
- [success] resolved; a further requirement now blocks (re-entry: the next requirement opens its own instance, named on its own terms - stacking them into one message is how a specific blocker turns back into generic setup pressure)
- [failure] activation blocked, no route available (re-entry: the requirement becoming satisfiable later re-opens this; nothing is repeatedly asked for in the meantime)
- [handoff] Onboarding Nurture — the blocker cleared and activation reachable again
- [handoff] external:human-in-the-loop-lifecycle — a blocker outliving its resolution horizon
- [handoff] Onboarding Route Assignment — an alternate path to value that does not require the blocked thing

### Configure
- `activation_blocker.resolve` [config required] (observation-window): configure activation_blocker.resolve — The resolution horizon appropriate to this requirement.
- `activation_blocker.touches` [recommended default]: 2 — Every touch runs against a budget fixed when the instance opened; the budget is the plan's own length, and no touch is repeated because nothing could tell whether it arrived.
- `activation_blocker.cooldown` [recommended default]: none — Reminders are per requirement; a further requirement is its own instance and no cooldown applies between requirements.

### Required data
**Semantic events to map**
- `activation_blocked_by_named_requirement` (authoritative) — a specific unmet requirement: an integration not connected, a required configuration absent, a verification incomplete, a required person not yet present, a mandatory setup step unfinished
- `named_requirement_satisfied` (authoritative) — the specific named requirement that blocked progress is recorded as satisfied
**Attributes**: account_id · requirement_id · blocking_requirement · resolution_horizon · dependency_owner

### Collision & priority
- priority: lifecycle
- pressure class: lifecycle
- local cap: 2 (all)
- cooldown: none
- competition: none
- No action when s.g1 · s.g2 · s.g3 — the suppressions above are recorded outcomes, never a fallback to another channel

### Measurement
- journey outcome: exit-or-handoff: x.not-blocking, x.next-blocker, x.blocked, h.resume, h.escalate, h.reroute
- business outcome: named_requirement_satisfied — the specific named requirement that blocked progress is recorded as satisfied
- observed: in this journey
- attribution: touched-before-event · pre-post
- guardrails: complaint · message_after_success · unsubscribe

### Reusable rule
When activation is blocked, orchestration should target the actual dependency rather than increase generic onboarding pressure.

### Entity (notes)
- the blocking requirement, held against the account or onboarding instance
- One instance per requirement. Two blockers are two instances, because they may be resolved by different people at different times.

### Distinct from
- ACT-14 (Struggling user detection → proactive assistance → recovery or exit) — Here the obstacle has a name and resolving it is the whole job. ACT-14 is for the case where nothing specific is missing and the person is still not getting anywhere.

### Guardrails
1. No generic finish-your-setup messaging. The requirement is named, or this journey has nothing to say.
2. A missing field that does not block activation is not presented as a blocker. Doing so trains people to discount the real ones.
3. The moment the requirement is met, its reminders stop, including any already scheduled.

### Technical logic (graph, 16 nodes)
- **t.blocked** [trigger] (entry, evidence: authoritative)
  - Event id: `activation_blocked_by_named_requirement`
  - Activation blocked by named requirement
  - evidence: authoritative
  - requires: a specific unmet requirement: an integration not connected, a required configuration absent, a verification incomplete, a required person not yet present, a mandatory setup step unfinished
  - not enough on its own: an incomplete optional field
  - not enough on its own: a profile that is not filled in
  - not enough on its own: a general sense that setup is unfinished
  - -> a.identify (node)
- **a.identify** [action]
  - Identify the exact requirement and what it is blocking, so everything downstream can name it rather than describe setup in general
  - writes blocking_requirement (set)
  - -> c.blocking (node)
- **c.blocking** [condition] (2 branches)
  - Does this requirement actually block activation?
  - -> c.self-resolvable [Genuinely blocking]: activation cannot occur while it is unmet (node)
  - -> x.not-blocking [Incomplete but not blocking]: the field or step is missing and value can still be produced without it (node)
- **c.self-resolvable** [condition] (2 branches)
  - Can this account resolve the requirement directly?
  - -> a.specific-action [Yes, directly]: the account holds the access, the information and the permission needed (node)
  - -> a.route-dependency [No, it depends on someone else]: it needs another team, an internal process, a third party, or a person who has not joined yet (node)
- **x.not-blocking** [exit]
  - not a blocker; ordinary onboarding continues
  - Detail: if the same requirement later becomes mandatory, it enters as a real blocker; presenting it as one now would teach people to ignore the ones that matter
- **a.specific-action** [action] (execution: communication)
  - Give the one specific action that clears this requirement, named as the thing it is - never a general prompt to finish setup, which tells someone who is already blocked nothing they did not know
  - -> w.resolve (node)
- **a.route-dependency** [action] (execution: human)
  - Raise the requirement with whoever can actually resolve it, carrying what is blocked and why. Ownership of the resume stays here, so the account is not handed away and forgotten
  - writes dependency_requests (append)
  - -> w.resolve (node)
- **w.resolve** [wait]
  - until the specific named requirement that blocked progress is recorded as satisfied
  - Detail: timeout after The resolution horizon appropriate to this requirement. (configure activation_blocker.resolve)
  - requirements resolved by third parties and requirements resolved in a settings screen do not deserve the same patience
  - engagement does not extend the window
  - -> a.stop-reminders [on event] (node)
  - -> c.unresolved [on timeout] (node)
- **a.stop-reminders** [action]
  - Stop every reminder about this requirement immediately, including any already queued - a nudge about something the person has just finished is the clearest possible signal that nothing was watching
  - writes suppressed_sends (append)
  - -> c.next-blocker (node)
- **c.unresolved** [condition] (3 branches)
  - What does this unresolved requirement warrant?
  - -> h.escalate [Escalate to a person]: the requirement matters enough to the outcome that a human should now own it (node)
  - -> h.reroute [An alternate route exists]: value can be reached by a different path that does not need this requirement (node)
  - -> x.blocked [No route]: the requirement is mandatory and neither resolvable nor avoidable (node)
- **c.next-blocker** [condition] (2 branches)
  - With this requirement met, is activation now reachable?
  - -> h.resume [Reachable]: no other mandatory requirement is outstanding (node)
  - -> x.next-blocker [Another requirement is blocking]: clearing this one revealed a second mandatory requirement (node)
- **h.escalate** [handoff] (external)
  - external:human-in-the-loop-lifecycle
  - Detail: a blocker outliving its resolution horizon
  - carries: the requirement, who was asked, and what has already been tried
  - carries: what activation is waiting on, so the person picking it up starts informed
  - suppresses: automated reminders about this requirement while a person holds it
  - -> external:human-in-the-loop-lifecycle (external)
- **h.reroute** [handoff]
  - New entry → onboarding route → appropriate path
  - Detail: an alternate path to value that does not require the blocked thing
  - carries: the requirement that could not be met
  - carries: the setup state already reached
  - -> ACT-11 (journey)
- **x.blocked** [exit]
  - activation blocked, no route available
  - Detail: the requirement becoming satisfiable later re-opens this; nothing is repeatedly asked for in the meantime
- **h.resume** [handoff]
  - Onboarding progress → next best setup step → activation
  - Detail: the blocker cleared and activation reachable again
  - carries: which requirement was resolved and how long it took
  - carries: the setup state as it now stands, so onboarding resumes rather than restarts
  - -> ACT-12 (journey)
- **x.next-blocker** [exit]
  - resolved; a further requirement now blocks
  - Detail: the next requirement opens its own instance, named on its own terms - stacking them into one message is how a specific blocker turns back into generic setup pressure

---
