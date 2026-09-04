## ACT-19 — Onboarding Personalization

- Canonical ID: `ACT-19`
- Slug: `role-use-case-discovery`
- Display name: Onboarding Personalization
- Canonical name (chain form): Role or use-case discovery → relevant onboarding adaptation
- Source route: `/lab/customer-journeys/role-use-case-discovery`
- Category: Activation, onboarding & early value
- Goal: routing-assignment
- Channels: email, in-app
- Surface: customer (communicating)

**Purpose**: Get the one piece of context onboarding needs to choose a path, only when not having it would actually change that path.

> Get the one piece of context onboarding needs to choose a path, only when not having it would actually change that path.

### Trigger
- Event: `onboarding_needs_named_role_or_use_case`
- Meaning: an onboarding decision that depends on a named role or use-case, with no reliable value available for it
- Not enough on its own: a role or use-case that can be read from the account itself, which ACT-11 uses without asking; an optional profile field being empty
- Requires: an onboarding decision that depends on a named role or use-case, with no reliable value available for it
- Source: authoritative

### Entity
- Scope: person or account plus the onboarding context being decided
- instance: account_id + person_id · one-active-per-key

### Who enters
- an onboarding decision that depends on a named role or use-case, with no reliable value available for it
- no instance of this journey is already open for the person or account plus the onboarding context being decided
- hard gates (GLB-31) allow communication for this purpose

### Suppressed when
- [canonical rule] Behavioural inference is never stored as a declared preference. They are different fields with different confidence, and merging them cannot be undone.
- [canonical rule] Nothing is asked that the implementation will not use. A question collected and ignored costs attention and returns nothing.
- [canonical rule] Onboarding does not become a questionnaire. One question, asked where the answer changes the path.

### Recommended orchestration · single-notice
1. **ask** (lifecycle, canonical rule)
   - sent on classification - no wait before it
   - checks: Does a reliable declared value already exist? · Would the answer materially change the path to value?
   - Channel roles: persistent -> in-session
   - Purpose: Ask one lightweight question covering only what the implementation will actually consume.
   - destination: `one-question-form` · bound to `onboarding_instance_id`

**Channel roles** (recommended default)
- persistent (email) — the message has to be kept and survive until the person can act on it
- in-session (in-app) — the person is active in the product and the action is taken there
- delivery fallback: same-role-other-channel

### Stops when
- [no-action] not asked; onboarding proceeds unchanged (re-entry: if a later decision genuinely turns on the answer, it is asked then - each question earns its place at the moment it is needed)
- [handoff] Onboarding Nurture — the onboarding path resolved, adapted or defaulted

### Configure
- `role_use.answer` [config required] (response-window): configure role_use.answer — A short window - this is a question in the middle of someone's setup, not a survey.
- `role_use.touches` [recommended default]: 1 — Every touch runs against a budget fixed when the instance opened; the budget is the plan's own length, and no touch is repeated because nothing could tell whether it arrived.
- `role_use.cooldown` [recommended default]: none — One question per onboarding instance; nothing is re-asked and no cooldown applies.

### Required data
**Semantic events to map**
- `onboarding_needs_named_role_or_use_case` (authoritative) — an onboarding decision that depends on a named role or use-case, with no reliable value available for it
- `question_answered` (declared) — the person answers the question that was put to them
**Attributes**: account_id · person_id · declared_context

### Collision & priority
- priority: lifecycle
- pressure class: lifecycle
- local cap: 1 (all)
- cooldown: none
- competition: none
- No action when s.g1 · s.g2 · s.g3 — the suppressions above are recorded outcomes, never a fallback to another channel

### Measurement
- journey outcome: exit-or-handoff: x.dont-ask, h.progress
- business outcome: question_answered — the person answers the question that was put to them
- observed: in this journey
- attribution: touched-before-event · none
- guardrails: complaint · message_after_success · unsubscribe

### Reusable rule
Ask for onboarding context only when the answer materially changes the path to value.

### Entity (notes)
- person or account plus the onboarding context being decided
- The declared value belongs to the context it was given for; a different product's onboarding asks its own question rather than reusing this answer.

### Guardrails
1. Behavioural inference is never stored as a declared preference. They are different fields with different confidence, and merging them cannot be undone.
2. Nothing is asked that the implementation will not use. A question collected and ignored costs attention and returns nothing.
3. Onboarding does not become a questionnaire. One question, asked where the answer changes the path.

### Technical logic (graph, 11 nodes)
- **t.needed** [trigger] (entry, evidence: authoritative)
  - Event id: `onboarding_needs_named_role_or_use_case`
  - Onboarding needs named role or use case
  - evidence: authoritative
  - requires: an onboarding decision that depends on a named role or use-case, with no reliable value available for it
  - not enough on its own: a role or use-case that can be read from the account itself, which ACT-11 uses without asking
  - not enough on its own: an optional profile field being empty
  - -> c.declared (node)
- **c.declared** [condition] (2 branches)
  - Does a reliable declared value already exist?
  - -> a.reuse [Already declared]: the person has stated it before and the answer is still current (node)
  - -> c.material [Not declared]: nothing declared exists - only behaviour, which is not the same thing and is not stored as if it were (node)
- **a.reuse** [action]
  - Use the existing declared value and record that it was reused rather than re-asked - asking again for something already given is its own small failure
  - -> a.adapt (node)
- **c.material** [condition] (2 branches)
  - Would the answer materially change the path to value?
  - -> a.ask [Yes]: different answers lead to genuinely different setup, examples or first actions (node)
  - -> x.dont-ask [No]: the path is the same whatever they answer - the question would be collected and never used (node)
- **a.adapt** [action]
  - Adapt the recommended setup, the examples, the next action and the education to the declared context - which is the only reason the question was worth asking
  - -> h.progress (node)
- **a.ask** [action] (execution: communication)
  - Ask one lightweight question covering only what the implementation will actually consume. Onboarding does not become a questionnaire on the way to the thing the person came for
  - -> w.answer (node)
- **x.dont-ask** [exit]
  - not asked; onboarding proceeds unchanged
  - Detail: if a later decision genuinely turns on the answer, it is asked then - each question earns its place at the moment it is needed
- **h.progress** [handoff]
  - Onboarding progress → next best setup step → activation
  - Detail: the onboarding path resolved, adapted or defaulted
  - carries: the declared value with its source, or the explicit fact that there is none
  - carries: which adaptations were applied, so they are not applied twice
  - -> ACT-12 (journey)
- **w.answer** [wait]
  - until the person answers the question that was put to them
  - Detail: timeout after A short window - this is a question in the middle of someone's setup, not a survey. (configure role_use.answer)
  - an unanswered question must not hold up the path to value
  - engagement does not extend the window
  - -> a.persist [on event] (node)
  - -> a.default [on timeout] (node)
- **a.persist** [action]
  - Persist the declared value with its source and the time it was given, in a field that only ever holds declared answers. Behavioural inference lives in its own field and is never written here - once the two are mixed, nothing downstream can tell what the person actually said
  - writes declared_context (append)
  - -> a.adapt (node, back-edge)
- **a.default** [action]
  - Continue on a documented default path and record that no declared value exists. The default is not written into the declared field as though someone had chosen it
  - -> h.progress (node, back-edge)

---
