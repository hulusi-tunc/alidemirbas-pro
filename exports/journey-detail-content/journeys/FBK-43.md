## FBK-43 — Feedback Follow-Up

- Canonical ID: `FBK-43`
- Slug: `feedback-routing-and-loop-closure`
- Display name: Feedback Follow-Up
- Canonical name (chain form): Feedback received → classify → route → close the loop
- Source route: `/lab/customer-journeys/feedback-routing-and-loop-closure`
- Category: Feedback, advocacy, referral & relationship signals
- Goal: escalation-exception
- Channels: email, in-app, task
- Surface: customer (communicating)

**Purpose**: Get feedback to the process that can act on it, and keep the record open until anything promised in return has actually happened.

> Route one piece of feedback to what it operationally means - praise, a problem, a need, product evidence or a comment - and close the loop with the person only where something is owed.

### Trigger
- Event: `feedback_received`
- Meaning: feedback submitted through any channel, attributable to a person and an experience; enough substance to say what it is about - a description, a referent, or a score with words behind it
- Not enough on its own: a survey opened but never submitted; an internal note about the person that the person did not write; a bare score with nothing written, which is stored as a score and not routed
- Requires: feedback submitted through any channel, attributable to a person and an experience; enough substance to say what it is about - a description, a referent, or a score with words behind it
- Source: declared

### Entity
- Scope: the feedback record, linked to the person and the experience it is about
- instance: feedback_id · one-active-per-key

### Who enters
- feedback submitted through any channel, attributable to a person and an experience
- the record has enough substance to classify; a bare score is stored as a score and not routed
- no follow-up instance is already open for this feedback record

### Suppressed when
- [canonical rule] Negative feedback describing a problem an open issue already covers is attached to that case; no second case and no parallel recovery is opened.
- [canonical rule] No fault is manufactured to have somewhere to route to, and no compensation is offered as a substitute for having nothing to fix.
- [canonical rule] Recognition names the specific thing said or is not sent; a generic thank-you in response to praise proves nobody read it.
- [canonical rule] Positive feedback is not consent to publish and creates no advocate state; a volunteered contribution is handed on with the explicit fact that offering it is not permission to use it.
- [canonical rule] A general comment is acknowledged only when the person addressed us directly and would expect a response; otherwise it is stored and nothing is sent.

### Recommended orchestration · single-notice
1. **acknowledgement** (service, canonical rule)
   - sent on classification - no wait before it
   - checks: What does this mean operationally? · Is an acknowledgement appropriate?
   - Channel roles: persistent -> in-session
   - Purpose: Acknowledge a general comment specifically enough that it is clear a person could have read it.
2. **recognition** (service, canonical rule)
   - sent on classification - no wait before it
   - checks: What does this mean operationally? · Is recognition appropriate?
   - Channel roles: persistent -> in-session
   - Purpose: Acknowledge the specific thing they praised. Nothing generic, nothing that reads as a template.
3. **acknowledgement** (service, canonical rule)
   - sent on classification - no wait before it
   - checks: What does this mean operationally? · Does an open issue or case already cover this? · Is there an actionable operational issue?
   - Channel roles: persistent -> in-session
   - Purpose: Acknowledge what they said about an experience we did not meet, without manufacturing a fault and without offering compensation in place of a fix.
4. **routing** (service, canonical rule)
   - sent on classification - no wait before it
   - checks: What does this mean operationally?
   - Channel roles: human
   - Purpose: Create the support-need work item in the owning process's queue - internal routing, not a message to the person.
   - destination: `owning-process-queue` · bound to `feedback_id`
5. **routing** (service, canonical rule)
   - sent on classification - no wait before it
   - checks: Do the escalation criteria apply?
   - Channel roles: human
   - Purpose: Mark the issue's severity ahead of handoff so the receiving owner and SLA are the escalated ones, not the default - internal routing, not a message to the person.
   - destination: `owning-process-queue` · bound to `feedback_id`

**Channel roles** (recommended default)
- persistent (email) — the acknowledgement should reach the person where they can keep it, which is the default for something they wrote to us
- in-session (in-app) — the feedback was given inside the product and the person is still there
- human (task) — the feedback creates internal work rather than a message to the person - a support-need work item, or marking an issue's severity before handoff
- delivery fallback: same-role-other-channel

### Stops when
- [success] recorded as evidence; no advocate state created (re-entry: further positive feedback opens its own record and re-weighs the evidence)
- [suppression] attached to the existing case (re-entry: the case's own lifecycle owns the outcome; the feedback record stays as evidence)
- [success] heard, nothing to fix (re-entry: further feedback about the same experience opens its own record)
- [failure] obligation outstanding; loop not closed (re-entry: the outcome arriving later re-opens this to close the loop; the issue's own journey owns the escalation, and nothing here pretends the record is finished)
- [success] stored; nothing owed (re-entry: the record contributes to relationship evidence and needs nothing further)
- [success] loop closed (re-entry: further feedback about the same experience opens its own record)
- [handoff] external:advocacy-contribution — a reusable contribution offered voluntarily
- [handoff] Advocacy Request — positive evidence reaching the advocacy threshold
- [handoff] Complaint Resolution — an actionable issue arising from feedback
- [handoff] Decision Request — feedback that cannot be classified reliably
- [handoff] Decision Request — a promised follow-up that did not happen

### Configure
- `feedback.obligation_sla` [config required] (decision-sla): configure feedback.obligation_sla — The wait is the owning process's own SLA for the work item; this journey never invents a deadline for work it does not own.
- `feedback.promise_window` [recommended default] (response-window): 7 days–14 days — A promised follow-up is waited for only as long as the promise still means anything to the person; past that it is a broken promise and is escalated as one.
- `feedback.touches` [recommended default]: 1 — One acknowledgement per feedback record, on whichever route it took; the record is never acknowledged twice.
- `feedback.cooldown` [recommended default]: none — Follow-up is per record; further feedback about the same experience opens its own record and no cooldown applies between records.

### Required data
**Semantic events to map**
- `feedback_received` (declared) — feedback submitted through any channel, attributable to a person and an experience; enough substance to say what it is about - a description, a referent, or a score with words behind it
- `work_item_outcome_recorded` (authoritative) — the operational outcome is recorded against the work item
- `promised_followup_delivered` (authoritative) — the follow-up that was promised is delivered
**Attributes**: feedback_id · person_id · experience_ref · submitted_at · content · classification
**optional**: score · open_issue_ref · promised_followup_at · escalation_policy_id

### Collision & priority
- priority: service
- pressure class: service
- local cap: 1 (all)
- cooldown: none
- competition: none
- No action when s.existing-case · s.no-fault · s.generic-thanks · s.not-consent · s.noise — the suppressions above are recorded outcomes, never a fallback to another channel

### Measurement
- journey outcome: exit-or-handoff: x.closed, x.stored, x.attached, x.acknowledged, x.evidence, x.open, h.issue, h.advocacy, h.contribution, h.triage, h.promise
- business outcome: work_item_outcome_recorded — the operational outcome is recorded against the work item
- observed: in this journey
- attribution: entered-before-event · not-applicable
- guardrails: complaint · duplicate_case_opened · generic_acknowledgement_sent

### Reusable rule
Feedback becomes operationally useful only when its meaning is routed to the process capable of acting on it.

### Entity (notes)
- the feedback record, linked to the person and the experience it is about
- The feedback record and any issue it produces are separate entities with separate lifecycles. One can close while the other is still open, and conflating them loses the loop.

### Guardrails
1. Negative sentiment is not a confirmed root cause. The classification routes the feedback; it does not diagnose anything.
2. The classification never overwrites what the person wrote. Their words and our interpretation are stored side by side.
3. The feedback record and the issue it produced remain separate entities. Closing the issue does not close the loop with the person.

### Technical logic (graph, 34 nodes)
- **t.received** [trigger] (entry, evidence: declared)
  - Event id: `feedback_received`
  - Feedback received
  - evidence: declared
  - requires: feedback submitted through any channel, attributable to a person and an experience
  - requires: enough substance to say what it is about - a description, a referent, or a score with words behind it
  - not enough on its own: a survey opened but never submitted
  - not enough on its own: an internal note about the person that the person did not write
  - not enough on its own: a bare score with nothing written, which is stored as a score and not routed
  - -> a.persist (node)
- **a.persist** [action]
  - Persist the record with its id, source, related entity, timestamp and any sentiment or category the person themselves selected - together with what they actually wrote, kept verbatim. Everything after this is our interpretation and is stored beside their words, never over them
  - writes feedback_log (append)
  - -> a.classify (node)
- **a.classify** [action]
  - Classify the operational meaning as PRAISE, PRODUCT_FEEDBACK, SERVICE_ISSUE, SUPPORT_NEED, COMPLAINT, GENERAL_COMMENT or UNKNOWN, in its own field. A classification is a routing decision, not a finding about what went wrong
  - writes feedback_log (append)
  - -> c.route (node)
- **c.route** [condition] (6 branches)
  - What does this mean operationally?
  - -> a.persist-positive [PRAISE]: positive, with substance behind it (node)
  - -> c.existing [SERVICE_ISSUE or COMPLAINT]: something went wrong, or is alleged to have (node)
  - -> a.obligation [SUPPORT_NEED]: they need help with something rather than reporting a fault (node)
  - -> a.product [PRODUCT_FEEDBACK]: an observation about the product that creates no obligation to this individual (node)
  - -> c.acknowledge [GENERAL_COMMENT]: worth keeping, nothing to do (node)
  - -> h.triage [UNKNOWN]: the meaning cannot be established reliably enough to route (node)
- **a.persist-positive** [action]
  - Store it as one dated, scoped piece of positive relationship evidence. Not a label, not a state, not an advocate flag - a fact about a moment
  - writes relationship_evidence (append)
  - -> c.recognition (node)
- **c.existing** [condition] (2 branches)
  - Does an open issue or case already cover this?
  - -> a.attach [Already open]: an open issue on the same experience or entity matches what they described (node)
  - -> a.assess [Nothing open]: no open issue matches (node)
- **a.obligation** [action] (execution: human)
  - Create the work item in the owning process. From here the issue has its own lifecycle and its own owner; this record stays open independently, because the issue closing and the person hearing back are two different events
  - writes feedback_log (append)
  - -> w.outcome (node)
- **a.product** [action]
  - Pass it to product intake as evidence. Nothing is owed to this individual in return, and nothing is promised to them
  - -> c.promise (node)
- **c.acknowledge** [condition] (2 branches)
  - Is an acknowledgement appropriate?
  - -> a.acknowledge [Worth acknowledging]: they addressed us directly and would expect some response (node)
  - -> x.stored [Not needed]: an acknowledgement would be noise (node)
- **h.triage** [handoff]
  - Decision request → validate → route, reject or hold
  - Detail: feedback that cannot be classified reliably
  - carries: the record, unclassified, so a person reads what was written rather than a guess about it
  - -> DEC-181 (journey)
- **c.recognition** [condition] (2 branches)
  - Is recognition appropriate?
  - -> a.acknowledge-positive [Worth acknowledging]: they said something specific that a person could respond to (node)
  - -> c.contribution [Not needed]: an acknowledgement would be noise (node)
- **a.attach** [action]
  - Attach the feedback to the existing case as further context. No second case is created and no parallel recovery is opened
  - writes issue_context_log (append)
  - -> x.attached (node)
- **a.assess** [action]
  - Establish whether what they described is an actionable operational issue, or an experience we did not meet. Both are real; only one creates an obligation, and inventing the obligation to have somewhere to route to is the failure this step exists to prevent
  - -> c.actionable (node)
- **w.outcome** [wait]
  - until the operational outcome is recorded against the work item
  - Detail: timeout after The wait is the owning process's own SLA for the work item; this journey never invents a deadline for work it does not own. (configure feedback.obligation_sla)
  - the feedback record does not close because the work took too long - it stays open and says so
  - engagement does not extend the window
  - -> c.promise [on event] (node)
  - -> x.open [on timeout] (node)
- **c.promise** [condition] (2 branches)
  - Was a follow-up promised to the person?
  - -> w.followup [Promised]: they were told they would hear back (node)
  - -> x.closed [Nothing promised]: no commitment was made to them (node)
- **a.acknowledge** [action] (execution: communication)
  - Acknowledge specifically enough that it is clear a person could have read it
  - -> x.stored (node)
- **x.stored** [exit]
  - stored; nothing owed
  - Detail: the record contributes to relationship evidence and needs nothing further
- **a.acknowledge-positive** [action] (execution: communication)
  - Acknowledge the specific thing they said. A generic thank-you sent in response to praise is worse than silence, because it proves nobody read it
  - writes feedback_log (append)
  - -> c.contribution (node)
- **c.contribution** [condition] (2 branches)
  - Did they volunteer something reusable - a written review, a quote, a story?
  - -> h.contribution [Volunteered something]: they provided content beyond an answer to our question (node)
  - -> c.eligible [Just feedback]: they answered and nothing more (node)
- **x.attached** [exit]
  - attached to the existing case
  - Detail: the case's own lifecycle owns the outcome; the feedback record stays as evidence
- **c.actionable** [condition] (2 branches)
  - Is there an actionable operational issue?
  - -> c.severity [Actionable]: something specific can be fixed, and fixing it is ours to do (node)
  - -> a.acknowledge-negative [Not actionable]: an experience we did not meet, with nothing operational to fix (node)
- **x.open** [exit]
  - obligation outstanding; loop not closed
  - Detail: the outcome arriving later re-opens this to close the loop; the issue's own journey owns the escalation, and nothing here pretends the record is finished
- **w.followup** [wait]
  - until the follow-up that was promised is delivered
  - Detail: timeout after A promised follow-up is waited for only as long as the promise still means anything to the person; past that it is a broken promise and is escalated as one. (example: 7 days–14 days; configure feedback.promise_window)
  - an unkept promise to someone who took the time to tell us something is worse than never having asked, so it escalates rather than expiring
  - engagement does not extend the window
  - -> x.closed [on event] (node)
  - -> h.promise [on timeout] (node)
- **x.closed** [exit]
  - loop closed
  - Detail: further feedback about the same experience opens its own record
- **h.contribution** [handoff] (external)
  - external:advocacy-contribution
  - Detail: a reusable contribution offered voluntarily
  - carries: the contribution as given
  - carries: the explicit fact that offering it is not permission to publish it, which has to be captured separately before anything is used
  - -> external:advocacy-contribution (external)
- **c.eligible** [condition] (2 branches)
  - Does the relationship now meet advocacy eligibility?
  - -> h.advocacy [Eligible]: this evidence, together with what already existed, is enough to justify asking for something (node)
  - -> x.evidence [Not eligible]: this is one good signal and the relationship has not accumulated more (node)
- **c.severity** [condition] (2 branches)
  - Do the escalation criteria apply?
  - -> a.escalate [Severe]: policy defines this as requiring escalation on severity, harm, or the parties involved (node)
  - -> h.issue [Ordinary]: actionable, at the normal level (node)
- **a.acknowledge-negative** [action] (execution: communication)
  - Acknowledge what they said and record it as relationship evidence. No fault is manufactured, no compensation is offered as a substitute for having nothing to fix
  - writes feedback_log (append)
  - -> x.acknowledged (node)
- **h.promise** [handoff]
  - Decision request → validate → route, reject or hold
  - Detail: a promised follow-up that did not happen
  - carries: what was promised, when, and what has happened operationally since
  - -> DEC-181 (journey)
- **h.advocacy** [handoff]
  - Advocacy eligibility → ask, delay or suppress
  - Detail: positive evidence reaching the advocacy threshold
  - carries: the evidence set, not only the latest item
  - carries: the context the positive experience was in
  - -> FBK-42 (journey)
- **x.evidence** [exit]
  - recorded as evidence; no advocate state created
  - Detail: further positive feedback opens its own record and re-weighs the evidence
- **a.escalate** [action] (execution: human)
  - Apply the policy escalation and mark the severity on the issue, so that the ownership and SLA it inherits are the escalated ones rather than the default
  - writes issue_context_log (append)
  - -> h.issue (node)
- **h.issue** [handoff]
  - Complaint or issue created → ownership → resolution → confirmation
  - Detail: an actionable issue arising from feedback
  - carries: the person's own account of it, unedited
  - carries: the severity and whether policy escalation was applied
  - carries: the link back to the feedback record, which stays open independently
  - suppresses: any automated satisfaction or retention outreach about the same experience while the issue is open
  - -> FBK-46 (journey)
- **x.acknowledged** [exit]
  - heard, nothing to fix
  - Detail: further feedback about the same experience opens its own record

---
