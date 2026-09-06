## RET-28 — Cancellation Save

- Canonical ID: `RET-28`
- Slug: `cancellation-intent-decision-point`
- Display name: Cancellation Save
- Canonical name (chain form): Cancellation intent → understand state → save or proceed
- Source route: `/lab/customer-journeys/cancellation-intent-decision-point`
- Category: Engagement, health, retention & churn prevention
- Goal: cancellation-termination
- Channels: email, in-app
- Surface: customer (communicating)

**Purpose**: Treat stated intent to leave as a decision point where a genuinely relevant alternative may be offered, and never as an obstacle course.

> At the moment a person declares they want to cancel, learn why if that is useful, offer one genuine alternative if one matches the reason, and let them decide - with the cancellation path fully open at every step.

### Trigger
- Event: `explicit_cancellation_intent`
- Meaning: an explicit act: a cancel flow entered, a cancellation requested while still reversible, or a cancellation asked for through a person
- Not enough on its own: viewing the billing page; a pricing question to support; declining usage, which is a signal about risk and not a statement of intent
- Requires: an explicit act: a cancel flow entered, a cancellation requested while still reversible, or a cancellation asked for through a person
- Source: declared

### Entity
- Scope: the subscription, membership or service relationship being cancelled
- instance: person_id + relationship_id + intent_id · one-active-per-key

### Who enters
- an explicit cancellation intent is declared by the person - in the product, by message or by phone
- the relationship is active and cancellable by this person
- no save instance is already open for this intent
- hard gates (GLB-31) permit service communication

### Suppressed when
- [canonical rule] The cancellation path is never obstructed: the question and the offer sit beside it, never in front of it, and no contest with another journey delays the cancellation itself.
- [canonical rule] The reason is asked once and the alternative is offered once; a second ask or a second offer is pressure on a decision already being made.
- [canonical rule] No offer is made where nothing genuinely matches the reason; the person proceeds to decide without one.
- [canonical rule] A confirmed cancellation goes to execution and nothing further is sent by this journey; an abandoned flow leaves the relationship unchanged and silent.
- [canonical rule] A declared intent outranks inferred risk on the same account; only the offer step yields to an open issue under human ownership (GLB-06).

### Recommended orchestration · offer-decide-remind
1. **reason-ask** (retention, canonical rule)
   - sent on classification - no wait before it
   - checks: Is a declared reason available? · Is asking for a reason useful and appropriate here?
   - Channel roles: in-session -> persistent
   - Purpose: Ask once why, with the cancellation path fully open beside the question. The question is never a step that has to be passed.
   - destination: `reason-question-beside-cancel-step` · bound to `intent_id` · must not claim: that answering is required to cancel
2. **alternative-offer** (retention, canonical rule)
   - sent on classification - no wait before it
   - checks: Does a legitimate resolution exist for this reason?
   - Channel roles: in-session -> persistent
   - Purpose: Offer the one alternative that matches the reason, once, alongside an unobstructed route to continue cancelling.
   - destination: `alternative-with-cancel-route` · bound to `intent_id` · must not claim: that cancelling is harder than it is, an alternative that does not match the reason

**Channel roles** (recommended default)
- in-session (in-app) — the intent was declared inside the product - the question and the offer are put beside the cancellation step the person is on
- persistent (email) — the intent was declared outside the product, by message or by phone, and the question or offer has to reach the person where they are
- delivery fallback: same-role-other-channel

### Stops when
- [timeout] intent expressed, not carried through; relationship unchanged (re-entry: a fresh expression of intent opens a new episode, and the earlier one is context - repeatedly approaching cancellation is itself evidence RET-24 should be reading)
- [handoff] Retention Offer Follow-Up — a retention alternative offered at the decision point
- [handoff] Cancellation Effective-Date Resolution — cancellation confirmed by the customer

### Configure
- `cancellation_save.answer_window` [recommended default] (attribute-bound): the end of the session or conversation in which the question was put — The question is open only while the person is at the point where it was put; when they leave that point, unanswered is the answer.
- `cancellation_save.intent_window` [recommended default] (observation-window): 7 days–14 days — An intent stays meaningful for a bounded period; past it, an unconfirmed cancellation is a lapsed intent and the relationship stands unchanged.
- `cancellation_save.touches` [recommended default]: 2 — One question and one offer at most, both at the decision point; the plan has nothing after the decision.
- `cancellation_save.cooldown` [recommended default] (cooldown): 30 days–90 days — The same intent re-expressed inside the intent window is the same instance; a new intent after a lapsed one is a new instance and the question is not repeated inside the cooldown.

### Required data
**Semantic events to map**
- `explicit_cancellation_intent` (declared) — an explicit act: a cancel flow entered, a cancellation requested while still reversible, or a cancellation asked for through a person
- `cancellation_reason_given` (declared) — the person states a reason for cancelling
- `cancellation_confirmed` (authoritative) — an authoritative cancellation recorded against the relationship; an effective end date
- `cancellation_flow_abandoned` (behavioral) — the person leaves the cancellation flow without confirming
**Attributes**: person_id · relationship_id · intent_id · declared_at · declared_via · holdings · effective_date_if_cancelled
**optional**: declared_reason · alternatives_catalogue · has_active_session

### Collision & priority
- priority: retention
- pressure class: lifecycle
- local cap: 2 (all)
- cooldown: 30 days–90 days
- competition: retention-outreach (account) - above risk-driven escalation and offer follow-up on the same account - a declared intent to leave outranks an inferred risk. Only the offer step ever yields; the cancellation path itself is never obstructed by any contest
- No action when s.path · s.once · s.no-genuine · s.decided · s.contest — the suppressions above are recorded outcomes, never a fallback to another channel

### Measurement
- journey outcome: exit-or-handoff: h.intervention, h.execute, x.lapsed
- business outcome: cancellation_flow_abandoned — the person leaves the cancellation flow without confirming
- observed: in this journey
- attribution: touched-before-event · pre-post
- guardrails: complaint · cancel_path_obstructed · second_offer_sent · support_contact_within_24h

### Reusable rule
Cancellation intent is a decision point where relevant alternatives may be offered without obstructing the user's ability to leave.

### Entity (notes)
- the subscription, membership or service relationship being cancelled
- Intent is against one relationship. Cancelling one subscription says nothing about the others an account holds.

### Distinct from
- RET-29 (Cancellation completed → stop retention → resolve remaining relationship) — This runs while the decision is still reversible and the person is still deciding. RET-29 runs after it is made, and the two must never share an event.

### Guardrails
1. Cancellation intent is not cancellation. Nothing downstream may treat this journey's trigger as an ending.
2. No dark patterns. Every alternative is offered beside an unobstructed path to leave, never in front of one.
3. A save attempt is bounded by the authoritative renewal or cancellation timing it is competing with, and never contradicts it. An offer that runs past the date it was trying to protect arrives after the decision it was for.
4. The cancellation path is never made longer to create room for a save attempt.
5. A discount only where the declared reason and policy both support it. Elsewhere it is an answer to a question nobody asked.
6. A reason is asked for at most once, and never as a condition of leaving.

### Technical logic (graph, 16 nodes)
- **t.intent** [trigger] (entry, evidence: declared)
  - Event id: `explicit_cancellation_intent`
  - Explicit cancellation intent
  - evidence: declared
  - requires: an explicit act: a cancel flow entered, a cancellation requested while still reversible, or a cancellation asked for through a person
  - not enough on its own: viewing the billing page
  - not enough on its own: a pricing question to support
  - not enough on its own: declining usage, which is a signal about risk and not a statement of intent
  - -> a.context (node)
- **a.context** [action]
  - Read what they currently hold, what cancelling would end, and when it would take effect - so anything said next is about their actual relationship rather than a generic one
  - -> c.reason (node)
- **c.reason** [condition] (2 branches)
  - Is a declared reason available?
  - -> a.record-reason [Declared]: the person has stated a reason (node)
  - -> c.ask [Not declared]: no reason has been given (node)
- **a.record-reason** [action]
  - Record the reason with its source among PRICE, LOW_USAGE, MISSING_VALUE, TECHNICAL_PROBLEM, SERVICE_ISSUE, TEMPORARY_NEED, SWITCHING or OTHER. A reason inferred later never overwrites one that was declared
  - writes cancellation_reason_history (append)
  - -> c.resolution (node)
- **c.ask** [condition] (2 branches)
  - Is asking for a reason useful and appropriate here?
  - -> a.ask [Worth asking]: the answer would change what is offered, and asking does not delay the cancellation (node)
  - -> a.no-reason [Not worth asking]: the answer would change nothing, or asking would function as friction (node)
- **c.resolution** [condition] (2 branches)
  - Does a legitimate resolution exist for this reason?
  - -> a.offer [A real alternative]: something genuinely addresses the stated reason - technical help for a technical problem, a plan change or pause for cost or temporary need, education for unrealised value, service recovery for a service failure (node)
  - -> w.decision [Nothing genuine]: no alternative actually answers the reason, or no reason was given to answer (node)
- **a.ask** [action] (execution: communication)
  - Ask once, with the cancellation path fully open beside the question. The question is never a step that has to be passed to leave - a reason obtained that way is not information, it is a toll
  - -> w.answer (node)
- **a.no-reason** [action]
  - Proceed without a reason and record that none was given. An inferred reason may be stored, but never in the field that holds declared ones
  - writes cancellation_reason_history (append)
  - -> c.resolution (node, back-edge)
- **a.offer** [action] (execution: communication)
  - Offer the alternative that matches the reason, once, alongside an unobstructed path to continue cancelling. A discount appears only where the reason is price and policy supports it - offering one for a technical fault answers the wrong question and reveals that nobody read the reason
  - -> h.intervention (node)
- **w.decision** [wait]
  - until an authoritative cancellation recorded against the relationship; an effective end date, or the person leaves the cancellation flow without confirming
  - Detail: timeout after An intent stays meaningful for a bounded period; past it, an unconfirmed cancellation is a lapsed intent and the relationship stands unchanged. (example: 7 days–14 days; configure cancellation_save.intent_window)
  - an intent neither confirmed nor withdrawn is not a standing invitation to keep raising it
  - engagement does not extend the window
  - -> c.decision [on event] (node)
  - -> x.lapsed [on timeout] (node)
- **w.answer** [wait]
  - until the person states a reason for cancelling, or an authoritative cancellation recorded against the relationship; an effective end date, or the person leaves the cancellation flow without confirming
  - Detail: timeout after The question is open only while the person is at the point where it was put; when they leave that point, unanswered is the answer. (recommended: the end of the session or conversation in which the question was put; configure cancellation_save.answer_window)
  - a reason is useful only while the choice it informs is still open - an unanswered question is itself an answer, and chasing it is what turns a question into a toll
  - engagement does not extend the window
  - -> c.answered [on event] (node)
  - -> a.no-reason [on timeout] (node, back-edge)
- **h.intervention** [handoff]
  - Retention intervention → outcome → suppress, escalate or exit
  - Detail: a retention alternative offered at the decision point
  - carries: the declared reason and the alternative chosen against it
  - carries: the cancellation episode this belongs to, so a decline is remembered inside it
  - -> RET-30 (journey)
- **c.decision** [condition] (2 branches)
  - What did they decide?
  - -> h.execute [Confirmed]: the cancellation was carried through (node)
  - -> x.lapsed [Abandoned]: they left the flow with the relationship intact (node)
- **x.lapsed** [exit]
  - intent expressed, not carried through; relationship unchanged
  - Detail: a fresh expression of intent opens a new episode, and the earlier one is context - repeatedly approaching cancellation is itself evidence RET-24 should be reading
- **c.answered** [condition] (2 branches)
  - What came back?
  - -> a.record-reason [A reason]: the person stated a reason (node, back-edge)
  - -> c.decision [They decided meanwhile]: the cancellation was confirmed or abandoned while the question was still open (node, back-edge)
- **h.execute** [handoff]
  - Cancellation request → determine effective end → schedule or cancel now
  - Detail: cancellation confirmed by the customer
  - carries: the declared reason, which belongs to the record of why this relationship ended
  - carries: what was offered, if anything, and what was declined
  - -> SUB-167 (journey)

---
