## RET-26 — Service Recovery

- Canonical ID: `RET-26`
- Slug: `negative-experience-recovery`
- Display name: Service Recovery
- Canonical name (chain form): Negative experience → recovery eligibility → appropriate response
- Source route: `/lab/customer-journeys/negative-experience-recovery`
- Category: Engagement, health, retention & churn prevention
- Goal: compensation-remedy
- Channels: email, push
- Surface: customer (communicating)

**Purpose**: Match the response to what actually failed, whether it is fixed, and whether a remedy is genuinely owed.

> After an authoritative service failure, say what failed, what was done and what prevents it recurring - once, only when it is useful, only after the failure is resolved, and only where no other process already owns it; route anything owed to remedy.

### Trigger
- Event: `authoritative_negative_experience`
- Meaning: a recorded failure: a service failure, a failed fulfilment, a confirmed disruption, a failed critical action, or severe support dissatisfaction
- Not enough on its own: negative feedback on its own, which reports an experience rather than confirming a failure; a low survey score with no incident behind it
- Requires: a recorded failure: a service failure, a failed fulfilment, a confirmed disruption, a failed critical action, or severe support dissatisfaction
- Source: authoritative

### Entity
- Scope: person or account plus the experience or service entity that failed
- instance: person_id + failure_ref · one-active-per-key

### Who enters
- an authoritative record of a negative experience or service failure attributable to this person and an experience entity
- no other recovery process is already handling the same failure
- the underlying issue is resolved - nothing is said about a failure that is still ongoing
- hard gates (GLB-31) permit service communication

### Suppressed when
- [canonical rule] Another recovery process already handling this failure owns it; this instance defers and nothing is sent.
- [canonical rule] While the underlying issue is still broken the operational owner has it; a recovery message before the fix is a promise the journey cannot keep.
- [canonical rule] A recovery communication is sent only where it is useful to the person - a failure they noticed or were affected by; a silent fix of something they never saw stays silent.
- [canonical rule] Where policy and impact support compensation the remedy journey (REM-159) owns it; no discount is offered here standing in for an explanation.
- [canonical rule] Hard gates apply; pressure caps do not, because this is service communication about something that happened to the person.

### Recommended orchestration · single-notice
1. **acknowledgement** (service, canonical rule)
   - sent on classification - no wait before it
   - checks: Is another recovery process already handling this failure? · Is the underlying issue still unresolved? · Is a recovery communication actually useful here? · Does policy and the actual impact support compensation?
   - Channel roles: persistent -> low-friction
   - Purpose: Say what failed, what was done about it, and what stops it happening again. No discount standing in for an explanation.

**Channel roles** (recommended default)
- persistent (email) — the acknowledgement should be something the person can keep - what failed, what was done, what prevents it - which is the default
- low-friction (push) — the failure happened inside the app, the person is active there, and the acknowledgement is short
- delivery fallback: same-role-other-channel

### Stops when
- [suppression] deferred to the process already handling it (re-entry: if that process closes with the customer still affected, this re-opens - two apologies from two systems is worse than one, because it proves neither knew about the other)
- [no-action] resolved without contact (re-entry: a recurrence, or any sign they did notice, re-opens this)
- [success] failure acknowledged, no remedy owed (re-entry: a recurrence changes the assessment, and repetition is itself part of the impact)
- [handoff] external:operational-resolution — a failure that is still ongoing
- [handoff] Compensation Eligibility — a remedy that policy and impact both support

### Configure
- `service_recovery.touches` [recommended default]: 1 — One acknowledgement per failure; a second message about the same failure is a second failure.
- `service_recovery.cooldown` [recommended default]: none — Recovery is per failure; a later failure is its own instance and no cooldown applies between failures, though repeated failures are themselves evidence for the relationship's health.

### Required data
**Semantic events to map**
- `authoritative_negative_experience` (authoritative) — a recorded failure: a service failure, a failed fulfilment, a confirmed disruption, a failed critical action, or severe support dissatisfaction
**Attributes**: person_id · failure_ref · experience_ref · failed_at · impact · resolution_status · resolved_at
**optional**: open_recovery_process_ref · compensation_policy_id · has_active_app_session

### Collision & priority
- priority: service
- pressure class: service
- local cap: 1 (all)
- cooldown: none
- competition: none
- No action when s.duplicate · s.unresolved · s.not-useful · s.compensation · s.permission — the suppressions above are recorded outcomes, never a fallback to another channel

### Measurement
- journey outcome: exit-or-handoff: x.acknowledged, x.silent, x.defer, h.operational, h.compensation
- guardrails: complaint · support_contact_within_24h · message_before_resolution · discount_offered_here

### Reusable rule
Service recovery should reflect the actual failure, current resolution state and justified remedy rather than use compensation as a default response.

### Entity (notes)
- person or account plus the experience or service entity that failed
- The recovery belongs to the failure. A second unrelated failure is a second instance, and one apology does not cover both.

### Guardrails
1. Negative feedback is not a confirmed service failure. One is a report of an experience, the other is a record of something going wrong.
2. A discount is not a default apology. Compensation follows impact and policy, not the awkwardness of the conversation.
3. An existing support case suppresses this entirely. A parallel recovery journey contradicts the person already handling it.

### Technical logic (graph, 12 nodes)
- **t.negative** [trigger] (entry, evidence: authoritative)
  - Event id: `authoritative_negative_experience`
  - Authoritative negative experience
  - evidence: authoritative
  - requires: a recorded failure: a service failure, a failed fulfilment, a confirmed disruption, a failed critical action, or severe support dissatisfaction
  - not enough on its own: negative feedback on its own, which reports an experience rather than confirming a failure
  - not enough on its own: a low survey score with no incident behind it
  - -> a.assess (node)
- **a.assess** [action]
  - Establish what failed, what it cost the customer, whether it has been resolved, whether they are still affected, and whether some other process is already handling it
  - writes failure_record (append)
  - -> c.duplicate (node)
- **c.duplicate** [condition] (2 branches)
  - Is another recovery process already handling this failure?
  - -> x.defer [Already handled]: an open case, an assigned owner or another recovery journey covers the same incident (node)
  - -> c.resolved [Nobody on it]: no existing process covers it (node)
- **x.defer** [exit]
  - deferred to the process already handling it
  - Detail: if that process closes with the customer still affected, this re-opens - two apologies from two systems is worse than one, because it proves neither knew about the other
- **c.resolved** [condition] (2 branches)
  - Is the underlying issue still unresolved?
  - -> h.operational [Still broken]: the customer remains affected (node)
  - -> c.useful [Resolved]: the failure is over and the customer is no longer affected (node)
- **h.operational** [handoff] (external)
  - external:operational-resolution
  - Detail: a failure that is still ongoing
  - carries: what failed and who is affected
  - carries: the fact that no recovery message has been sent yet
  - suppresses: apology and compensation messaging until the thing being apologised for has stopped happening
  - -> external:operational-resolution (external)
- **c.useful** [condition] (2 branches)
  - Is a recovery communication actually useful here?
  - -> c.compensation [Useful]: the customer noticed, or would want to know it was handled (node)
  - -> x.silent [Not useful]: the failure was resolved before it reached them - raising it now creates the concern it would be apologising for (node)
- **c.compensation** [condition] (2 branches)
  - Does policy and the actual impact support compensation?
  - -> h.compensation [Owed]: the impact and the policy both support a remedy (node)
  - -> a.acknowledge [Not owed]: the failure was real but no remedy is justified - which is most failures (node)
- **x.silent** [exit]
  - resolved without contact
  - Detail: a recurrence, or any sign they did notice, re-opens this
- **h.compensation** [handoff]
  - Compensation decision → eligibility → grant or reject → deliver
  - Detail: a remedy that policy and impact both support
  - carries: the failure and its assessed impact
  - carries: what has already been said to the customer
  - -> REM-159 (journey)
- **a.acknowledge** [action] (execution: communication)
  - Say what failed, what was done about it, and what stops it happening again. No discount standing in for an explanation - a remedy offered instead of an account of what went wrong reads as buying silence
  - -> x.acknowledged (node)
- **x.acknowledged** [exit]
  - failure acknowledged, no remedy owed
  - Detail: a recurrence changes the assessment, and repetition is itself part of the impact

---
