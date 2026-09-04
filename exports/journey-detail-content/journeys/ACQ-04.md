## ACQ-04 — High-Intent Lead Routing

- Canonical ID: `ACQ-04`
- Slug: `high-intent-human-or-automated-route`
- Display name: High-Intent Lead Routing
- Canonical name (chain form): High-intent action → qualification → human or automated route
- Source route: `/lab/customer-journeys/high-intent-human-or-automated-route`
- Category: Acquisition, intent & qualification
- Goal: escalation-exception
- Channels: sales, task
- Surface: customer

**Purpose**: Decide, after a commercially serious act, whether the next step needs a person's judgement or can continue automatically - and resolve what already exists before creating anything.

> Decide, after a commercially serious act, whether the next step needs a person's judgement or can continue automatically - and resolve what already exists before creating anything.

### Trigger
- Event: `high_intent_commercial_action`
- Meaning: a pricing request, an enterprise contact request, a completed quote, a sales-qualified submission, or a high-value application
- Not enough on its own: viewing a pricing page without requesting anything; opening a sales email
- Requires: a pricing request, an enterprise contact request, a completed quote, a sales-qualified submission, or a high-value application
- Source: declared

### Entity
- Scope: lead, opportunity or account
- instance: lead_id · one-active-per-key

### Who enters
- a pricing request, an enterprise contact request, a completed quote, a sales-qualified submission, or a high-value application
- no instance of this journey is already open for the lead
- hard gates (GLB-31) allow communication for this purpose

### Suppressed when
- [canonical rule] High intent is not an automatic sales call. The human route is a decision with a real alternative, not the default dressed as one.
- [canonical rule] An open opportunity is updated, never duplicated. Two records for one pursuit produce two people contacting the same account.
- [canonical rule] An already-converted account does not receive acquisition communication, whatever the intent signal says.
- [canonical rule] Destination reached for this entity while the journey is in flight: ACQ-08 takes ownership and this journey's remaining steps are suppressed

### Recommended orchestration · single-notice
1. **assign** (service, canonical rule)
   - sent on classification - no wait before it
   - checks: Has this account already reached the destination this action would pursue? · Does this action need human judgement?
   - Channel roles: human
   - Purpose: Create or update the internal commercial entity, assign an owner, and raise a task carrying the evidence that justified it - ownership changes are appended so the trail of who held it survives

**Channel roles** (recommended default)
- human (sales, task) — the next step needs a person's judgement - an owner is assigned and a task raised with the evidence
- delivery fallback: same-role-other-channel

### Stops when
- [handoff] Acquisition Exit Handoff — a high-intent action arriving after the destination was already reached
- [handoff] external:human-in-the-loop-lifecycle — an assigned owner now holding the next step
- [handoff] external:automated-continuation — a self-serve request that needs no human judgement

### Configure
- `high_intent.touches` [recommended default]: 1 — Every touch runs against a budget fixed when the instance opened; the budget is the plan's own length, and no touch is repeated because nothing could tell whether it arrived.
- `high_intent.cooldown` [recommended default]: none — Routing is per high-intent action; an open opportunity is updated, never duplicated, and no cooldown applies between actions.

### Required data
**Semantic events to map**
- `high_intent_commercial_action` (declared) — a pricing request, an enterprise contact request, a completed quote, a sales-qualified submission, or a high-value application
**Attributes**: lead_id · account_id · commercial_entity_link · opportunity · ownership_history · destination_reached

### Collision & priority
- priority: service
- pressure class: none
- local cap: 1 (all)
- cooldown: none
- competition: purchase-intent (product) - above browse and decay, below a reached commercial destination
- No action when s.g1 · s.g2 · s.g3 · s.p1 — the suppressions above are recorded outcomes, never a fallback to another channel

### Measurement
- journey outcome: handoff: h.reached, h.human, h.automated
- guardrails: complaint · message_after_success · unsubscribe

### Reusable rule
High intent should change orchestration according to the amount of human judgment required.

### Entity (notes)
- lead, opportunity or account
- The dedup step is the entity work: a second request against an open opportunity updates that opportunity rather than opening a rival one.

### Distinct from
- ACQ-05 (Qualification state change → route, re-route or exit) — ACQ-05 reacts to a qualification state that has already changed. This one runs at the moment of the act, before any state has been decided, and its output is a routing decision rather than a state.

### Guardrails
1. High intent is not an automatic sales call. The human route is a decision with a real alternative, not the default dressed as one.
2. An open opportunity is updated, never duplicated. Two records for one pursuit produce two people contacting the same account.
3. An already-converted account does not receive acquisition communication, whatever the intent signal says.

### Pre-empted by
- destination reached for this entity while the journey is in flight — ACQ-08 takes ownership and this journey's remaining steps are suppressed

### Technical logic (graph, 8 nodes)
- **t.high-intent** [trigger] (entry, evidence: declared)
  - Event id: `high_intent_commercial_action`
  - High intent commercial action
  - evidence: declared
  - requires: a pricing request, an enterprise contact request, a completed quote, a sales-qualified submission, or a high-value application
  - not enough on its own: viewing a pricing page without requesting anything
  - not enough on its own: opening a sales email
  - -> a.resolve (node)
- **a.resolve** [action]
  - Resolve the existing account and any open opportunity before creating anything, so a repeated or duplicated request updates what exists instead of opening a second record against the same person
  - writes commercial_entity_link (set)
  - -> c.converted (node)
- **c.converted** [condition] (2 branches)
  - Has this account already reached the destination this action would pursue?
  - -> h.reached [Already there]: the system of record shows the destination state already reached for this entity scope (node)
  - -> c.human [Not yet]: no destination state exists for this scope (node)
- **h.reached** [handoff]
  - Commercial destination reached → acquisition suppression → lifecycle handoff
  - Detail: a high-intent action arriving after the destination was already reached
  - carries: the destination entity that already exists
  - carries: the action that arrived late, which is worth keeping as a signal even though it changes nothing
  - -> ACQ-08 (journey)
- **c.human** [condition] (2 branches)
  - Does this action need human judgement?
  - -> a.assign [Human judgement required]: value, complexity, contract terms, or the request itself asks for a person (node)
  - -> h.automated [Automated continuation is sufficient]: the request is self-serve and unambiguous, and a person would add latency without adding judgement (node)
- **a.assign** [action] (execution: human)
  - Create or update the internal commercial entity, assign an owner, and raise a task carrying the evidence that justified it - ownership changes are appended so the trail of who held it survives
  - writes opportunity (set)
  - writes ownership_history (append)
  - -> h.human (node)
- **h.automated** [handoff] (external)
  - external:automated-continuation
  - Detail: a self-serve request that needs no human judgement
  - carries: the request and its context
  - carries: the resolved account link
  - -> external:automated-continuation (external)
- **h.human** [handoff] (external)
  - external:human-in-the-loop-lifecycle
  - Detail: an assigned owner now holding the next step
  - carries: the opportunity and its assigned owner
  - carries: the evidence of intent, so the first human contact is not a discovery call about what they already told us
  - carries: an SLA for the first human response, which the receiving lifecycle enforces
  - suppresses: automated commercial follow-up on this entity while a person holds it
  - -> external:human-in-the-loop-lifecycle (external)

---
