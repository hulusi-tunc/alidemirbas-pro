## ACT-11 — Onboarding Route Assignment

- Canonical ID: `ACT-11`
- Slug: `onboarding-route-selection`
- Display name: Onboarding Route Assignment
- Canonical name (chain form): New entry → onboarding route → appropriate path
- Source route: `/lab/customer-journeys/onboarding-route-selection`
- Category: Activation, onboarding & early value
- Goal: routing-assignment
- Channels: task
- Surface: customer

**Purpose**: Choose the onboarding path from the work actually required to reach value, before any of that work starts.

> Choose the onboarding path from the work actually required to reach value, before any of that work starts.

### Trigger
- Event: `authoritative_lifecycle_entry`
- Meaning: a recorded entry: account created, trial started, subscription started, or customer onboarding started
- Not enough on its own: a signup form submitted but not completed; an invitation sent but not accepted
- Requires: a recorded entry: account created, trial started, subscription started, or customer onboarding started
- Source: authoritative

### Entity
- Scope: person, account, subscription or trial - the thing that was entered
- instance: account_id + onboarding_instance_id · one-active-per-key

### Who enters
- a recorded entry: account created, trial started, subscription started, or customer onboarding started
- no instance of this journey is already open for the person
- hard gates (GLB-31) allow communication for this purpose

### Suppressed when
- [canonical rule] Plan tier is not onboarding complexity. A large customer with simple setup does not need an implementation, and a small one with an integration does.
- [canonical rule] A high-value account does not automatically get human assistance. Value decides how much the outcome matters, not how much work reaching it takes.
- [canonical rule] The route follows the setup and use-case actually in front of us, not who the account is.

### Recommended orchestration · single-notice
1. **assisted** (lifecycle, canonical rule)
   - sent on classification - no wait before it
   - checks: Does reaching value here require assisted onboarding?
   - Channel roles: human
   - Purpose: Record the assisted route and raise the internal task that gives this onboarding a human owner - the route is a property of the onboarding, carried into every step that follows

**Channel roles** (recommended default)
- human (task) — the step is carried out by a person - a call, a task, a visit - and recorded as done by them
- delivery fallback: same-role-other-channel

### Stops when
- [handoff] Onboarding Blocker Reminder — a mandatory prerequisite missing before onboarding can begin
- [handoff] Onboarding Nurture — a route chosen and nothing blocking the start

### Configure
- `onboarding_route.touches` [recommended default]: 1 — Every touch runs against a budget fixed when the instance opened; the budget is the plan's own length, and no touch is repeated because nothing could tell whether it arrived.
- `onboarding_route.cooldown` [recommended default]: none — Route assignment is per onboarding instance; a later entry is its own instance and no cooldown applies.

### Required data
**Semantic events to map**
- `authoritative_lifecycle_entry` (authoritative) — a recorded entry: account created, trial started, subscription started, or customer onboarding started
**Attributes**: account_id · onboarding_instance_id · onboarding_context · onboarding_route · setup_required

### Collision & priority
- priority: lifecycle
- pressure class: lifecycle
- local cap: 1 (all)
- cooldown: none
- competition: none
- No action when s.g1 · s.g2 · s.g3 — the suppressions above are recorded outcomes, never a fallback to another channel

### Measurement
- journey outcome: handoff: h.requirement, h.progress
- guardrails: complaint · message_after_success · unsubscribe

### Reusable rule
Onboarding should be routed according to the work required to reach value, not merely according to who entered.

### Entity (notes)
- person, account, subscription or trial - the thing that was entered
- One entry, one route. A second subscription on the same account is a second instance with its own route, because its setup work is its own.

### Distinct from
- ACT-19 (Role or use-case discovery → relevant onboarding adaptation) — This routes on the work required, which is usually readable from the account itself. ACT-19 fires only where a named role or use-case is missing and the answer would change the path.

### Guardrails
1. Plan tier is not onboarding complexity. A large customer with simple setup does not need an implementation, and a small one with an integration does.
2. A high-value account does not automatically get human assistance. Value decides how much the outcome matters, not how much work reaching it takes.
3. The route follows the setup and use-case actually in front of us, not who the account is.

### Technical logic (graph, 8 nodes)
- **t.entry** [trigger] (entry, evidence: authoritative)
  - Event id: `authoritative_lifecycle_entry`
  - Authoritative lifecycle entry
  - evidence: authoritative
  - requires: a recorded entry: account created, trial started, subscription started, or customer onboarding started
  - not enough on its own: a signup form submitted but not completed
  - not enough on its own: an invitation sent but not accepted
  - -> a.context (node)
- **a.context** [action]
  - Read the onboarding context: the declared goal, the role, the product or use-case, the setup complexity, the account or organisation type, any implementation requirement, and any stated need for assistance. Plan tier is not read as a proxy for any of these
  - writes onboarding_context (set)
  - -> c.assisted (node)
- **c.assisted** [condition] (2 branches)
  - Does reaching value here require assisted onboarding?
  - -> a.assisted [Assisted]: the setup work genuinely needs a person: an implementation, a migration, a configuration the account cannot complete alone, or an explicit request for help (node)
  - -> a.self-service [Self-service]: the setup work is within what the account can complete on its own, whatever its value or plan (node)
- **a.assisted** [action] (execution: human)
  - Record the assisted route and raise the internal task that gives this onboarding a human owner - the route is a property of the onboarding, carried into every step that follows
  - writes onboarding_route (set)
  - -> c.prerequisite (node)
- **a.self-service** [action]
  - Record the self-service route, which stays revisable: discovering later that a person is needed is a re-route, not a failure
  - writes onboarding_route (set)
  - -> c.prerequisite (node)
- **c.prerequisite** [condition] (2 branches)
  - Is a critical prerequisite missing before onboarding can start at all?
  - -> h.requirement [Blocked at the start]: something named and mandatory is absent - a verification, an access grant, a required party - and nothing meaningful can proceed without it (node)
  - -> h.progress [Clear to start]: no mandatory prerequisite is outstanding; incomplete optional fields do not count (node)
- **h.requirement** [handoff]
  - Missing activation requirement → resolve blocker → resume
  - Detail: a mandatory prerequisite missing before onboarding can begin
  - carries: the named requirement, not a general sense that setup is unfinished
  - carries: the chosen route, since who resolves the requirement depends on it
  - carries: the onboarding context already gathered
  - -> ACT-13 (journey)
- **h.progress** [handoff]
  - Onboarding progress → next best setup step → activation
  - Detail: a route chosen and nothing blocking the start
  - carries: the chosen route and why it was chosen
  - carries: the onboarding context, so the first step does not re-ask what was already known
  - -> ACT-12 (journey)

---
