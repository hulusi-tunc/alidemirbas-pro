## FBK-42 — Advocacy Request

- Canonical ID: `FBK-42`
- Slug: `advocacy-eligibility`
- Display name: Advocacy Request
- Canonical name (chain form): Advocacy eligibility → ask, delay or suppress
- Source route: `/lab/customer-journeys/advocacy-eligibility`
- Category: Feedback, advocacy, referral & relationship signals
- Goal: eligibility-qualification
- Channels: email, in-app, push
- Surface: customer (communicating)

**Purpose**: Ask someone to vouch for us only where the relationship has actually earned it, and keep public reuse a separate permission.

> Ask someone to vouch for us only where the relationship has actually earned it, and keep public reuse a separate permission.

### Trigger
- Event: `potential_advocacy_opportunity`
- Meaning: a moment where an advocacy request would be contextually sensible, against a relationship with positive evidence behind it
- Not enough on its own: a single login; a completed purchase; one high survey score; a positive reply to a support agent
- Requires: a moment where an advocacy request would be contextually sensible, against a relationship with positive evidence behind it
- Source: behavioral

### Entity
- Scope: person or account plus the relationship context the advocacy would be about
- instance: account_id + relationship_id · one-active-per-key

### Who enters
- a moment where an advocacy request would be contextually sensible, against a relationship with positive evidence behind it
- no instance of this journey is already open for the person or account plus the relationship context the advocacy would be about
- hard gates (GLB-31) allow communication for this purpose

### Suppressed when
- [canonical rule] A single login is not advocacy eligibility, and neither is a completed purchase.
- [canonical rule] A high score does not create a permanent advocate state. It is one piece of evidence with a date on it.
- [canonical rule] An advocacy reward is granted only after the referral clears whatever integrity check governs it. A reward paid before that check funds exactly the behaviour the check exists to catch.
- [canonical rule] The ask is placed at a moment the person is succeeding, never inside a failure or error state. Asking somebody to recommend us while something is visibly broken for them produces the wrong answer and remembers it.
- [canonical rule] Contributing is not permission to publish. The second is captured as its own permission record with its own scope.
- [canonical rule] An open negative issue suppresses this entirely, whatever the positive evidence says.

### Recommended orchestration · single-notice
1. **ask-light** (lifecycle, canonical rule)
   - sent on classification - no wait before it
   - checks: Is there an open negative issue anywhere in this relationship? · Is the evidence sufficient to justify asking? · What size of request does this evidence support?
   - Channel roles: persistent -> in-session -> low-friction
   - Purpose: Make the small ask, once, with no follow-up sequence behind it.
2. **ask-heavy** (lifecycle, canonical rule)
   - sent on classification - no wait before it
   - checks: Is there an open negative issue anywhere in this relationship? · Is the evidence sufficient to justify asking? · What size of request does this evidence support?
   - Channel roles: persistent -> in-session
   - Purpose: Make the substantial ask on a durable, reviewable route, stating plainly what would be used, where, and that agreeing to contribute is separate from agreeing to publication - because it is, and discovering that later is how a supporter becomes a complaint.
   - destination: `advocacy-contribution-form` · bound to `relationship_id` · must not claim: that contributing is permission to publish

**Channel roles** (recommended default)
- persistent (email) — the message has to be kept and survive until the person can act on it
- in-session (in-app) — the person is active in the product and the action is taken there
- low-friction (push) — a valid token or app session exists and the message is a single step from the notification
- delivery fallback: same-role-other-channel

### Stops when
- [suppression] suppressed while something is unresolved (re-entry: resolution makes this eligible again - and a recovery that then held is itself strong evidence, so the wait is not lost)
- [no-action] not yet eligible; evidence may accumulate (re-entry: further positive evidence re-opens this without anything having to be undone)
- [success] contributed for internal use (re-entry: any later intention to publish it is a new permission question, not an extension of this one)
- [no-action] declined; cooldown in force (re-entry: materially stronger evidence after the cooldown may justify a different request; the same one is not repeated)
- [timeout] no response; nothing inferred (re-entry: silence on a favour is not a decline and not a signal about the relationship - it is simply not an answer)
- [handoff] Permission Validation — an intention to publicly reuse something someone contributed

### Configure
- `advocacy_eligibility.response` [config required] (response-window): configure advocacy_eligibility.response — A bounded response window.
- `advocacy_eligibility.touches` [recommended default]: 2 — Every touch runs against a budget fixed when the instance opened; the budget is the plan's own length, and no touch is repeated because nothing could tell whether it arrived.
- `advocacy_eligibility.cooldown` [config required] (cooldown): configure advocacy_eligibility.cooldown — The cooldown between instances of this journey for the same person or account plus the relationship context the advocacy would be about, so that a re-qualifying person or account plus the relationship context the advocacy would be about is tracked but not messaged again inside it.

### Required data
**Semantic events to map**
- `potential_advocacy_opportunity` (behavioral) — a moment where an advocacy request would be contextually sensible, against a relationship with positive evidence behind it
- `advocacy_action_taken` (authoritative) — the requested advocacy action is recorded as done
- `request_declined` (declared) — the person declines the request
**Attributes**: account_id · relationship_id · advocacy_evidence · open_negative_issues · decline_cooldown_until

### Collision & priority
- priority: lifecycle
- pressure class: lifecycle
- local cap: 2 (all)
- cooldown: configure advocacy_eligibility.cooldown
- competition: outbound-ask (communication-purpose) - This journey wins when both this journey and FBK-41 (satisfaction) are eligible for the same person at the same moment: advocacy is the rarer, higher-value ask built on accumulated relationship evidence rather than one experience, so it takes the one ask slot. FBK-41 is recorded as not-now and remains free to re-open independently at its next moment.
- No action when s.g1 · s.g2 · s.g3 · s.g4 · s.g5 · s.g6 — the suppressions above are recorded outcomes, never a fallback to another channel

### Measurement
- journey outcome: exit-or-handoff: x.suppressed, x.delay, x.contributed, x.declined, x.no-response, h.permission
- business outcome: advocacy_action_taken — the requested advocacy action is recorded as done
- observed: in this journey
- attribution: touched-before-event · none
- guardrails: complaint · message_after_success · unsubscribe

### Reusable rule
Advocacy requests should follow demonstrated relationship value rather than arbitrary lifecycle timing.

### Entity (notes)
- person or account plus the relationship context the advocacy would be about
- Advocacy is about a relationship, not a transaction. What is being asked for is their reputation attached to ours.

### Distinct from
- FBK-43 (Feedback received → classify → route → close the loop) — FBK-43 reacts to one positive signal arriving. This weighs the accumulated relationship and decides whether it can carry a request - most positive signals do not reach it.

### Guardrails
1. A single login is not advocacy eligibility, and neither is a completed purchase.
2. A high score does not create a permanent advocate state. It is one piece of evidence with a date on it.
3. An advocacy reward is granted only after the referral clears whatever integrity check governs it. A reward paid before that check funds exactly the behaviour the check exists to catch.
4. The ask is placed at a moment the person is succeeding, never inside a failure or error state. Asking somebody to recommend us while something is visibly broken for them produces the wrong answer and remembers it.
5. Contributing is not permission to publish. The second is captured as its own permission record with its own scope.
6. An open negative issue suppresses this entirely, whatever the positive evidence says.

### Technical logic (graph, 15 nodes)
- **t.opportunity** [trigger] (entry, evidence: behavioral)
  - Event id: `potential_advocacy_opportunity`
  - Potential advocacy opportunity
  - evidence: behavioral
  - requires: a moment where an advocacy request would be contextually sensible, against a relationship with positive evidence behind it
  - not enough on its own: a single login
  - not enough on its own: a completed purchase
  - not enough on its own: one high survey score
  - not enough on its own: a positive reply to a support agent
  - -> c.negative (node)
- **c.negative** [condition] (2 branches)
  - Is there an open negative issue anywhere in this relationship?
  - -> x.suppressed [Something open]: an unresolved complaint, issue or dispute exists (node)
  - -> a.evaluate [Nothing open]: no outstanding negative state (node)
- **x.suppressed** [exit]
  - suppressed while something is unresolved
  - Detail: resolution makes this eligible again - and a recovery that then held is itself strong evidence, so the wait is not lost
- **a.evaluate** [action]
  - Weigh the accumulated positive evidence: outcomes actually achieved, value realised repeatedly, positive feedback, meaningful tenure, a recovery that afterwards held, contributions offered without being asked. The set is what matters, not the most recent item in it
  - -> c.sufficient (node)
- **c.sufficient** [condition] (2 branches)
  - Is the evidence sufficient to justify asking?
  - -> c.type [Sufficient]: the relationship carries enough independent positive evidence to bear a request (node)
  - -> x.delay [Not yet]: the evidence is real but thin - a good experience is not yet a relationship (node)
- **c.type** [condition] (2 branches)
  - What size of request does this evidence support?
  - -> a.ask-light [Low commitment]: a rating or a review - a few minutes, their words, their choice of where (node)
  - -> a.ask-heavy [High commitment]: a testimonial, a case study, a reference call - their name and reputation attached to ours, and usually reusable (node)
- **x.delay** [exit]
  - not yet eligible; evidence may accumulate
  - Detail: further positive evidence re-opens this without anything having to be undone
- **a.ask-light** [action] (execution: communication)
  - Make the small ask, once, with no follow-up sequence behind it. A rating or a one-tap response can go wherever the person already is, including an interruptive route where permission for one exists
  - -> w.response (node)
- **a.ask-heavy** [action] (execution: communication)
  - Make the substantial ask on a durable, reviewable route, stating plainly what would be used, where, and that agreeing to contribute is separate from agreeing to publication - because it is, and discovering that later is how a supporter becomes a complaint. A request that attaches somebody's name and reputation to the organisation is not an interruption to be tapped past; it needs somewhere they can read it twice
  - -> w.response (node)
- **w.response** [wait]
  - until the requested advocacy action is recorded as done, or the person declines the request
  - Detail: timeout after A bounded response window. (configure advocacy_eligibility.response)
  - an unanswered favour is not asked again; the relationship is worth more than the review
  - engagement does not extend the window
  - -> c.outcome [on event] (node)
  - -> x.no-response [on timeout] (node)
- **c.outcome** [condition] (3 branches)
  - What came back?
  - -> h.permission [Contributed, for public reuse]: they provided something we intend to publish, quote or reference (node)
  - -> x.contributed [Contributed, no public reuse]: they provided something that stays internal (node)
  - -> x.declined [Declined]: they said no (node)
- **x.no-response** [exit]
  - no response; nothing inferred
  - Detail: silence on a favour is not a decline and not a signal about the relationship - it is simply not an answer
- **h.permission** [handoff]
  - Permission capture → validate scope → activate or reject
  - Detail: an intention to publicly reuse something someone contributed
  - carries: what would be used, where, and for how long - which is the scope the permission has to cover
  - carries: the contribution itself, held unpublished until that permission exists
  - -> CON-31 (journey)
- **x.contributed** [exit]
  - contributed for internal use
  - Detail: any later intention to publish it is a new permission question, not an extension of this one
- **x.declined** [exit]
  - declined; cooldown in force
  - Detail: materially stronger evidence after the cooldown may justify a different request; the same one is not repeated

---
