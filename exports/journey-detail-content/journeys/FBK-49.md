## FBK-49 — Missing Information Reminder

- Canonical ID: `FBK-49`
- Slug: `missing-critical-data`
- Display name: Missing Information Reminder
- Canonical name (chain form): Missing critical data → request or resolve → resume
- Source route: `/lab/customer-journeys/missing-critical-data`
- Category: Feedback, advocacy, referral & relationship signals
- Goal: recovery-retry
- Channels: email, in-app, task
- Surface: customer (communicating)

**Purpose**: Treat a genuinely blocking data gap as a named dependency, and keep it distinct from wanting to know more about someone.

> Treat a genuinely blocking data gap as a named dependency, and keep it distinct from wanting to know more about someone.

### Trigger
- Event: `required_data_missing_and_blocking`
- Meaning: a named business process that cannot safely proceed, and the specific field, document or value it is waiting on
- Not enough on its own: a profile field that would be useful to have; data that would improve a future decision while blocking nothing today
- Requires: a named business process that cannot safely proceed, and the specific field, document or value it is waiting on
- Source: authoritative

### Entity
- Scope: the business entity that is blocked plus the specific missing requirement
- instance: blocked_entity_id + requirement_id · one-active-per-key

### Who enters
- a named business process that cannot safely proceed, and the specific field, document or value it is waiting on
- no instance of this journey is already open for the the business entity that is blocked plus the specific missing requirement
- hard gates (GLB-31) allow communication for this purpose

### Suppressed when
- [canonical rule] Nice-to-have profile data is not a critical requirement, and asking for it as though it were teaches people that our requests are negotiable.
- [canonical rule] Nothing is requested that an authoritative system already holds.
- [canonical rule] Every request names the process it unblocks. A request that cannot is progressive profiling and belongs elsewhere.

### Recommended orchestration · notice-then-confirm
1. **request** (service, canonical rule)
   - sent on classification - no wait before it
   - checks: Can an authoritative source supply this without asking anyone? · Who can actually supply the missing item?
   - Channel roles: persistent -> in-session
   - Purpose: Request it from the person the record is about, stating what it unblocks, so the request is answerable rather than merely received
   - destination: `provide-missing-item` · bound to `requirement_id` · must not claim: that nice-to-have data is required
2. **request-internal** (service, canonical rule)
   - sent on classification - no wait before it
   - checks: Can an authoritative source supply this without asking anyone? · Who can actually supply the missing item?
   - Channel roles: human
   - Purpose: Raise the request as owned work against the internal party who holds the item, carrying the blocked process and the running deadline.

**Channel roles** (recommended default)
- persistent (email) — the message has to be kept and survive until the person can act on it
- in-session (in-app) — the person is active in the product and the action is taken there
- human (task) — the step is carried out by a person - a call, a task, a visit - and recorded as done by them
- delivery fallback: same-role-other-channel

### Stops when
- [success] requirement satisfied; the blocked process is free to continue (re-entry: a further missing requirement is its own dependency with its own instance)
- [invalid-state] blocked process proceeding by a route that does not need this (re-entry: if the alternate route later requires it after all, that is a new dependency)
- [failure] requirement unmet; the blocked process stays blocked and says so (re-entry: the item arriving later re-opens this normally; it is not re-requested repeatedly in the meantime)
- [handoff] external:human-in-the-loop-lifecycle — a critical dependency that requesting did not resolve

### Configure
- `missing_critical.received` [config required] (response-window): configure missing_critical.received — The request is waited on for as long as the blocked process can afford; then criticality decides between a person, an alternate route and abandonment.
- `missing_critical.touches` [recommended default]: 2 — Every touch runs against a budget fixed when the instance opened; the budget is the plan's own length, and no touch is repeated because nothing could tell whether it arrived.
- `missing_critical.cooldown` [recommended default]: none — Requests are per requirement; a further requirement is its own instance and no cooldown applies.

### Required data
**Semantic events to map**
- `required_data_missing_and_blocking` (authoritative) — a named business process that cannot safely proceed, and the specific field, document or value it is waiting on
- `requested_information_received` (declared) — the requested information is received
**Attributes**: blocked_entity_id · requirement_id · blocked_process · provider · deadline_at · blocking_requirement_log

### Collision & priority
- priority: service
- pressure class: service
- local cap: 2 (all)
- cooldown: none
- competition: none
- No action when s.g1 · s.g2 · s.g3 — the suppressions above are recorded outcomes, never a fallback to another channel

### Measurement
- journey outcome: exit-or-handoff: x.resumed, x.alternate, x.abandoned, h.escalate
- business outcome: requested_information_received — the requested information is received
- observed: in this journey
- attribution: touched-before-event · pre-post
- guardrails: complaint · message_after_success · unsubscribe

### Reusable rule
Critical data should be requested only when a named process cannot safely proceed without it.

### Entity (notes)
- the business entity that is blocked plus the specific missing requirement
- One instance per missing requirement per blocked process. Two gaps are two dependencies, resolvable by different people at different times.

### Distinct from
- ACT-13 (Missing activation requirement → resolve blocker → resume) — ACT-13 is scoped to activation specifically and owns resuming onboarding. This applies to any named process, most of which have nothing to do with onboarding.

### Guardrails
1. Nice-to-have profile data is not a critical requirement, and asking for it as though it were teaches people that our requests are negotiable.
2. Nothing is requested that an authoritative system already holds.
3. Every request names the process it unblocks. A request that cannot is progressive profiling and belongs elsewhere.

### Technical logic (graph, 15 nodes)
- **t.blocked** [trigger] (entry, evidence: authoritative)
  - Event id: `required_data_missing_and_blocking`
  - Required data missing and blocking
  - evidence: authoritative
  - requires: a named business process that cannot safely proceed, and the specific field, document or value it is waiting on
  - not enough on its own: a profile field that would be useful to have
  - not enough on its own: data that would improve a future decision while blocking nothing today
  - -> a.identify (node)
- **a.identify** [action]
  - Identify the exact missing item and the named process it blocks. A request that cannot name what it unblocks is progressive profiling wearing a blocker's clothes, and the two must not be confusable
  - writes blocking_requirement_log (append)
  - -> c.authoritative (node)
- **c.authoritative** [condition] (2 branches)
  - Can an authoritative source supply this without asking anyone?
  - -> a.retrieve [We already have it]: an authoritative system holds it, or it can be derived or reconciled from what we hold (node)
  - -> c.provider [It has to be provided]: no system holds it and someone has to supply it (node)
- **a.retrieve** [action]
  - Retrieve and reconcile it. Asking someone for what we already hold authoritatively is the fastest way to demonstrate that we do not know our own records
  - -> c.valid (node)
- **c.provider** [condition] (2 branches)
  - Who can actually supply the missing item?
  - -> a.request [The customer or account holder]: only the person the record is about holds it, or policy requires it from them directly (node)
  - -> a.request-internal [Someone inside the organisation]: an internal owner, team or operator holds it, or is the one authorised to produce it (node)
- **c.valid** [condition] (2 branches)
  - Is what we now have valid?
  - -> a.persist [Valid]: it satisfies the requirement (node)
  - -> c.criticality [Invalid or incomplete]: what arrived does not satisfy the requirement (node)
- **a.request** [action] (execution: communication)
  - Request it from the person the record is about, stating what it unblocks, so the request is answerable rather than merely received
  - -> w.received (node)
- **a.request-internal** [action] (execution: human)
  - Raise the request as owned work against the internal party who holds the item, carrying the blocked process and the running deadline. Routing an internal dependency down a customer channel asks the wrong person on a route they never agreed to
  - -> w.received (node)
- **a.persist** [action]
  - Persist it and re-evaluate the blocked process, which resumes because its dependency is satisfied rather than because it was told to
  - writes blocking_requirement_log (append)
  - -> x.resumed (node)
- **c.criticality** [condition] (3 branches)
  - Given how critical the blocked process is, what now?
  - -> h.escalate [Critical enough for a person]: the process matters enough that someone should own getting this resolved (node)
  - -> x.alternate [An alternate route exists]: the process can proceed by a path that does not require this item (node)
  - -> x.abandoned [Not worth pursuing further]: the blocked process can wait or be abandoned without harm (node)
- **w.received** [wait]
  - until the requested information is received
  - Detail: timeout after The request is waited on for as long as the blocked process can afford; then criticality decides between a person, an alternate route and abandonment. (configure missing_critical.received)
  - how long to wait is a property of what is blocked, not of the request - a blocked payment and a blocked report do not deserve the same patience
  - engagement does not extend the window
  - -> c.valid [on event] (node, back-edge)
  - -> c.criticality [on timeout] (node, back-edge)
- **x.resumed** [exit]
  - requirement satisfied; the blocked process is free to continue
  - Detail: a further missing requirement is its own dependency with its own instance
- **h.escalate** [handoff] (external)
  - external:human-in-the-loop-lifecycle
  - Detail: a critical dependency that requesting did not resolve
  - carries: the missing item, who was asked, and what is blocked
  - carries: what has already been tried, so the person does not repeat the request that failed
  - -> external:human-in-the-loop-lifecycle (external)
- **x.alternate** [exit]
  - blocked process proceeding by a route that does not need this
  - Detail: if the alternate route later requires it after all, that is a new dependency
- **x.abandoned** [exit]
  - requirement unmet; the blocked process stays blocked and says so
  - Detail: the item arriving later re-opens this normally; it is not re-requested repeatedly in the meantime

---
