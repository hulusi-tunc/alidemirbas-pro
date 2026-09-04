## FBK-41 — Feedback Request

- Canonical ID: `FBK-41`
- Slug: `feedback-eligibility`
- Display name: Feedback Request
- Canonical name (chain form): Feedback eligibility → ask, suppress or delay
- Source route: `/lab/customer-journeys/feedback-eligibility`
- Category: Feedback, advocacy, referral & relationship signals
- Goal: eligibility-qualification
- Channels: email, in-app, push
- Surface: customer (communicating)

**Purpose**: Decide whether asking is appropriate at all, and hold the gap between asking and hearing back as a real state.

> Ask a person about one specific completed experience, once, at an appropriate moment - and not at all when the experience is incomplete, an issue is open, it was asked already, or the person has been asked enough.

### Trigger
- Event: `potential_feedback_moment`
- Meaning: an experience reaching a point worth asking about: a transaction completed, a service interaction finished, an onboarding milestone reached, a support case resolved, a meaningful usage milestone
- Not enough on its own: a transaction started; a ticket closed by an agent while the customer is still describing the problem; an elapsed interval with no experience behind it
- Requires: an experience reaching a point worth asking about: a transaction completed, a service interaction finished, an onboarding milestone reached, a support case resolved, a meaningful usage milestone
- Source: authoritative

### Entity
- Scope: person or account plus the specific experience being asked about
- instance: person_id + experience_ref · one-active-per-key

### Who enters
- a potential feedback moment is recorded against a person and a specific experience
- the experience is complete from the person's side, or completes inside its own horizon
- no unresolved issue exists in the same context
- feedback has not already been collected for this context recently
- the ask stays within the bound on how often this person is asked anything, and hard gates (GLB-31) allow it

### Suppressed when
- [canonical rule] Nothing is asked about an experience that has not completed; an experience that never completes inside its horizon is never asked about.
- [canonical rule] An unresolved issue in the context - an open complaint, an open payment recovery, a service failure still being put right - defers the ask entirely; resolution owns the person before satisfaction does.
- [canonical rule] A context already asked about recently is not asked about again.
- [canonical rule] An eligible ask outside the bound on how often this person is asked anything is recorded as not-now and not sent; policy orders satisfaction and advocacy asks against each other.
- [canonical rule] No ask without permission for feedback communication; absent permission is a recorded no-action.

### Recommended orchestration · single-notice
1. **request** (lifecycle, canonical rule)
   - sent on classification - no wait before it
   - checks: Is the experience actually complete from the person's side? · Is there an unresolved issue in this context? · Has feedback already been collected for this context recently? · Is this an appropriate moment, within the bound on how often this person is asked anything?
   - Channel roles: in-session -> persistent -> low-friction
   - Purpose: Ask about this specific experience, in terms the person would recognise as being about the thing they did, with a route to answer.
   - destination: `feedback-form-for-experience` · bound to `experience_ref`

**Channel roles** (recommended default)
- in-session (in-app) — the experience ended inside the product and the person is still there - the shortest route to the question
- persistent (email) — the experience ended elsewhere, or the person has left the product
- low-friction (push) — a valid token exists and the question can be answered in a single step from the notification
- delivery fallback: same-role-other-channel

### Stops when
- [invalid-state] experience never completed; nothing asked (re-entry: a later completion opens a new instance)
- [suppression] deferred; resolution owns this before satisfaction does (re-entry: once the issue is genuinely resolved this becomes eligible again - asking how we did while it is still broken measures our own latency and reads as indifference)
- [suppression] suppressed as a duplicate ask (re-entry: a genuinely different experience is a different context and is asked about on its own terms)
- [no-action] eligible in principle, not asked (re-entry: the next moment for this experience, if one exists - the request is not queued to fire the moment the budget clears)
- [success] feedback received; FBK-43 owns what it means (re-entry: this journey's job ended at the ask; what came back has its own lifecycle)
- [timeout] asked, no response (re-entry: a future experience may be asked about; nothing here is recorded as a signal, because silence is not dissatisfaction and nothing downstream may read it as one)

### Configure
- `feedback_request.completion_horizon` [config required] (external-window): configure feedback_request.completion_horizon — The horizon by which this kind of experience should have completed; an experience still incomplete past it is never asked about.
- `feedback_request.response_window` [recommended default] (response-window): 3 days–7 days — The ask stays open long enough for an answer in the person's own time and then closes; it is never repeated.
- `feedback_request.touches` [recommended default]: 1 — One ask per experience; an unanswered ask is not repeated.
- `feedback_request.ask_frequency` [recommended default] (cooldown): 30 days–90 days — The bound on how often this person is asked anything - satisfaction or advocacy - across all contexts; an eligible moment inside it is recorded as not-now.

### Required data
**Semantic events to map**
- `potential_feedback_moment` (authoritative) — an experience reaching a point worth asking about: a transaction completed, a service interaction finished, an onboarding milestone reached, a support case resolved, a meaningful usage milestone
- `experience_completed` (authoritative) — the experience the feedback would be about completes
- `feedback_submitted` (declared) — the person submits feedback
**Attributes**: person_id · experience_ref · experience_type · completed_at · open_issue_ref · last_asked_at
**optional**: has_active_session · has_push_token · completion_horizon

### Collision & priority
- priority: lifecycle
- pressure class: lifecycle
- local cap: 1 (all)
- cooldown: 30 days–90 days
- competition: outbound-ask (communication-purpose) - FBK-42 (advocacy) wins when both are eligible for the same person at the same moment: advocacy already presupposes satisfaction, its evidence is accumulated across the relationship rather than one experience, and asking both back-to-back for the same goodwill moment reads as farming it twice. This journey's ask is recorded as not-now and remains free to re-open independently at its next moment.
- No action when s.incomplete · s.open-issue · s.duplicate · s.frequency · s.permission — the suppressions above are recorded outcomes, never a fallback to another channel

### Measurement
- journey outcome: exit: x.received, x.no-response, x.never-completed, x.deferred, x.duplicate, x.not-now
- business outcome: feedback_submitted — the person submits feedback
- observed: in this journey
- attribution: touched-before-event · none
- guardrails: unsubscribe · complaint · ask_with_open_issue · ask_outside_frequency_bound

### Reusable rule
Feedback should be requested only when the underlying experience is sufficiently complete and no higher-priority unresolved state makes the request inappropriate.

### Entity (notes)
- person or account plus the specific experience being asked about
- Eligibility is per experience. Having answered about a delivery last week says nothing about whether to ask about a support case today.

### Distinct from
- FBK-43 (Feedback received → classify → route → close the loop) — This ends when a request has been made or refused. FBK-43 begins only if something actually comes back, and most requests do not produce one.

### Guardrails
1. A transaction started is not an experience completed. The thing being asked about has to have finished for the person, not for us.
2. A ticket marked closed does not prove the person's issue is resolved. Where the evidence disagrees with the ticket, the evidence decides.
3. Feedback pressure is bounded across all contexts, not per survey. Someone who has answered three times this month has answered enough.
4. No response is not a negative signal. It is no signal, and it is recorded as one.
5. An interaction that ended in escalation, in an unresolved failure, or in a lost commercial decision is excluded from being asked rather than merely deferred. Asking somebody to rate an experience that failed and was handed away compounds it, and the answer says more about the failure than about anything the survey is measuring.

### Technical logic (graph, 14 nodes)
- **t.moment** [trigger] (entry, evidence: authoritative)
  - Event id: `potential_feedback_moment`
  - Potential feedback moment
  - evidence: authoritative
  - requires: an experience reaching a point worth asking about: a transaction completed, a service interaction finished, an onboarding milestone reached, a support case resolved, a meaningful usage milestone
  - not enough on its own: a transaction started
  - not enough on its own: a ticket closed by an agent while the customer is still describing the problem
  - not enough on its own: an elapsed interval with no experience behind it
  - -> c.complete (node)
- **c.complete** [condition] (2 branches)
  - Is the experience actually complete from the person's side?
  - -> c.open-issue [Complete]: the thing being asked about has finished for them, not only for us (node)
  - -> w.completion [Not yet]: it is still in progress - the order has not arrived, the work is not finished (node)
- **c.open-issue** [condition] (2 branches)
  - Is there an unresolved issue in this context?
  - -> x.deferred [Unresolved]: the person still has an open problem here - judged on the evidence, not on whether a ticket is marked closed (node)
  - -> c.recent [Nothing open]: no outstanding problem in this context (node)
- **w.completion** [wait]
  - until the experience the feedback would be about completes
  - Detail: timeout after The horizon by which this kind of experience should have completed; an experience still incomplete past it is never asked about. (configure feedback_request.completion_horizon)
  - an experience that never completed is not one to ask about; the right response to it is elsewhere, not a survey
  - engagement does not extend the window
  - -> c.open-issue [on event] (node, back-edge)
  - -> x.never-completed [on timeout] (node)
- **x.deferred** [exit]
  - deferred; resolution owns this before satisfaction does
  - Detail: once the issue is genuinely resolved this becomes eligible again - asking how we did while it is still broken measures our own latency and reads as indifference
- **c.recent** [condition] (2 branches)
  - Has feedback already been collected for this context recently?
  - -> x.duplicate [Already asked]: a recent request or response covers the same experience (node)
  - -> c.moment [Not yet]: nothing recent covers it (node)
- **x.never-completed** [exit]
  - experience never completed; nothing asked
  - Detail: a later completion opens a new instance
- **x.duplicate** [exit]
  - suppressed as a duplicate ask
  - Detail: a genuinely different experience is a different context and is asked about on its own terms
- **c.moment** [condition] (2 branches)
  - Is this an appropriate moment, within the bound on how often this person is asked anything?
  - -> a.request [Appropriate]: the timing fits the experience and the overall ask budget has room (node)
  - -> x.not-now [Not now]: the timing is wrong, or this person has been asked enough recently across every context (node)
- **a.request** [action] (execution: communication)
  - Request feedback about this specific experience, in terms the person would recognise as being about the thing that just happened
  - writes feedback_request_log (append)
  - -> w.response (node)
- **x.not-now** [exit]
  - eligible in principle, not asked
  - Detail: the next moment for this experience, if one exists - the request is not queued to fire the moment the budget clears
- **w.response** [wait]
  - until the person submits feedback
  - Detail: timeout after The ask stays open long enough for an answer in the person's own time and then closes; it is never repeated. (example: 3 days–7 days; configure feedback_request.response_window)
  - the request is not repeated when it expires; one ask about one experience is the whole budget
  - engagement does not extend the window
  - -> x.received [on event] (node)
  - -> x.no-response [on timeout] (node)
- **x.received** [exit]
  - feedback received; FBK-43 owns what it means
  - Detail: this journey's job ended at the ask; what came back has its own lifecycle
- **x.no-response** [exit]
  - asked, no response
  - Detail: a future experience may be asked about; nothing here is recorded as a signal, because silence is not dissatisfaction and nothing downstream may read it as one

---
