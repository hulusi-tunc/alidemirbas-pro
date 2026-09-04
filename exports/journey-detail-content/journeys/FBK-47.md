## FBK-47 — Appeal Review

- Canonical ID: `FBK-47`
- Slug: `appeal-and-dispute-review`
- Display name: Appeal Review
- Canonical name (chain form): Appeal or dispute → evidence review → uphold, reverse or modify
- Source route: `/lab/customer-journeys/appeal-and-dispute-review`
- Category: Feedback, advocacy, referral & relationship signals
- Goal: decision-approval
- Channels: email
- Surface: customer (communicating)

**Purpose**: Review a decision that has already been made, without erasing it while the review is running.

> Review a decision that has already been made, without erasing it while the review is running.

### Trigger
- Event: `appeal_or_dispute_submitted`
- Meaning: a submission contesting an identifiable prior decision
- Not enough on its own: dissatisfaction with an outcome that names no decision; a complaint about how a decision was communicated rather than about the decision
- Requires: a submission contesting an identifiable prior decision
- Source: declared

### Entity
- Scope: the appeal, linked to the original decision it disputes
- instance: appeal_id · one-active-per-key

### Who enters
- a submission contesting an identifiable prior decision
- no instance of this journey is already open for the the appeal
- hard gates (GLB-31) allow communication for this purpose

### Suppressed when
- [canonical rule] The original decision is never deleted or edited in place. It is the subject of the review.
- [canonical rule] An open appeal does not reverse anything by itself. Only an explicit policy hold suspends the decision, and a hold is not a reversal.
- [canonical rule] Who may review, and their independence from the original decision, is defined by policy rather than by this journey.

### Recommended orchestration · offer-decide-remind
1. **reject** (service, canonical rule)
   - sent on classification - no wait before it
   - checks: Is the appeal eligible for review?
   - Channel roles: persistent
   - Purpose: Decline the appeal with the actual reason and whatever process does apply.
   - destination: `applicable-process` · bound to `appeal_id`
2. **request-more-info** (service, canonical rule)
   - Timing: The review deadline. (configure appeal_and.review) (relative to appeal_deadline_at)
   - cancelled by the review reaches a conclusion
   - re-read before sending: the the appeal re-read from the system of record before acting on the timeout
   - checks: What did the review conclude?
   - Channel roles: persistent
   - Purpose: Ask the appellant for the specific evidence the review is missing, naming only what is missing and leaving the appeal deadline where it was.
   - destination: `evidence-submission` · bound to `appeal_id` · must not claim: a moved deadline
3. **communicate-outcome** (service, canonical rule)
   - Timing: The review deadline. (configure appeal_and.review) (relative to appeal_deadline_at)
   - cancelled by the review reaches a conclusion
   - re-read before sending: the the appeal re-read from the system of record before acting on the timeout
   - checks: What did the review conclude?
   - Channel roles: persistent
   - Purpose: State the review's conclusion, which effective state now applies as a result, and what remains available procedurally.
   - destination: `appeal-outcome` · bound to `appeal_id`

**Channel roles** (recommended default)
- persistent (email) — the message has to be kept and survive until the person can act on it
- delivery fallback: same-role-other-channel

### Stops when
- [invalid-state] appeal not eligible; original decision unchanged (re-entry: a differently grounded appeal, or new evidence, is assessed on its own terms)
- [success] review concluded; original decision and outcome both preserved (re-entry: a further appeal, where the process allows one, contests this outcome rather than the original decision)
- [handoff] Decision Request — a review deadline passing without a conclusion

### Configure
- `appeal_and.review` [config required] (attribute-bound): configure appeal_and.review — The review deadline.
- `appeal_and.more_info` [config required] (attribute-bound): configure appeal_and.more_info — Requested information is waited for only until the appeal's own deadline; the deadline is never moved by the request.
- `appeal_and.request_more_info_budget` [config required]: configure appeal_and.request_more_info_budget — This loop runs against a budget fixed when the instance opened; when it is spent the instance takes its timeout path (GLB-24).
- `appeal_and.touches` [recommended default]: 3 — Every touch runs against a budget fixed when the instance opened; the budget is the plan's own length, and no touch is repeated because nothing could tell whether it arrived.
- `appeal_and.cooldown` [recommended default]: none — Review is per appeal; a further appeal against a different decision is its own instance and no cooldown applies.

### Required data
**Semantic events to map**
- `appeal_or_dispute_submitted` (declared) — a submission contesting an identifiable prior decision
- `review_concluded` (authoritative) — the review reaches a conclusion
- `requested_information_received` (declared) — the requested information is received
**Attributes**: appeal_id · original_decision_id · appellant_id · appeal_deadline_at · hold_policy · reviewer_independence · appeal_log

### Collision & priority
- priority: service
- pressure class: service
- local cap: 3 (all)
- cooldown: none
- competition: none
- No action when s.g1 · s.g2 · s.g3 — the suppressions above are recorded outcomes, never a fallback to another channel

### Measurement
- journey outcome: exit-or-handoff: x.rejected, x.concluded, h.deadline
- business outcome: review_concluded — the review reaches a conclusion
- observed: in this journey
- attribution: entered-before-event · not-applicable
- guardrails: complaint · message_after_success · unsubscribe

### Reusable rule
An appeal creates a review of an existing decision; it does not erase the original decision before the review concludes.

### Entity (notes)
- the appeal, linked to the original decision it disputes
- Two entities throughout: the decision and the appeal against it. Both survive whatever the review concludes.

### Distinct from
- FBK-46 (Complaint or issue created → ownership → resolution → confirmation) — An issue is something that went wrong. An appeal contests something we did on purpose, which means the subject under review is our own decision and it has to remain intact to be reviewable.

### Guardrails
1. The original decision is never deleted or edited in place. It is the subject of the review.
2. An open appeal does not reverse anything by itself. Only an explicit policy hold suspends the decision, and a hold is not a reversal.
3. Who may review, and their independence from the original decision, is defined by policy rather than by this journey.

### Technical logic (graph, 15 nodes)
- **t.appeal** [trigger] (entry, evidence: declared)
  - Event id: `appeal_or_dispute_submitted`
  - Appeal or dispute submitted
  - evidence: declared
  - requires: a submission contesting an identifiable prior decision
  - not enough on its own: dissatisfaction with an outcome that names no decision
  - not enough on its own: a complaint about how a decision was communicated rather than about the decision
  - -> a.link (node)
- **a.link** [action]
  - Link the appeal to the original decision and capture the reason, the evidence submitted, when it arrived and any deadline. The original decision is not modified by an appeal existing against it
  - writes appeal_log (append)
  - -> c.eligible (node)
- **c.eligible** [condition] (2 branches)
  - Is the appeal eligible for review?
  - -> c.hold [Eligible]: it contests a reviewable decision, within any applicable window, from someone entitled to contest it (node)
  - -> a.reject [Not eligible]: out of time, not a reviewable decision, or brought by someone with no standing (node)
- **c.hold** [condition] (2 branches)
  - Does policy require the original decision to be held while the review runs?
  - -> a.hold [Hold required]: policy suspends the effect of the decision pending review (node)
  - -> w.review [No hold]: the decision remains in effect during review, which is the default (node)
- **a.reject** [action] (execution: communication)
  - Decline the appeal with the actual reason and whatever process does apply. A rejection that does not say why is the thing that produces the next complaint
  - writes appeal_log (append)
  - -> x.rejected (node)
- **a.hold** [action]
  - Suspend the effect of the decision, recorded as a hold rather than as a reversal. Suspended and overturned are different states, and writing one as the other pre-decides the review
  - writes appeal_log (append)
  - -> w.review (node)
- **w.review** [wait]
  - until the review reaches a conclusion
  - Detail: timeout after The review deadline. (configure appeal_and.review)
  - a deadline passing is not a decision, and letting an appeal expire unheard is the outcome most likely to be challenged elsewhere
  - engagement does not extend the window
  - -> c.outcome [on event] (node)
  - -> h.deadline [on timeout] (node)
- **x.rejected** [exit]
  - appeal not eligible; original decision unchanged
  - Detail: a differently grounded appeal, or new evidence, is assessed on its own terms
- **c.outcome** [condition] (4 branches)
  - What did the review conclude?
  - -> a.apply [UPHELD]: the original decision stands (node)
  - -> a.apply [REVERSED]: the original decision was wrong (node)
  - -> a.apply [MODIFIED]: the decision stands in part (node)
  - -> a.request-more-info [MORE_INFORMATION_REQUIRED]: the review cannot conclude on what it has (node)
- **h.deadline** [handoff]
  - Decision request → validate → route, reject or hold
  - Detail: a review deadline passing without a conclusion
  - carries: the appeal, the original decision and everything gathered
  - carries: the fact that no outcome has been reached, so nothing downstream records one
  - -> DEC-181 (journey)
- **a.apply** [action]
  - Update the effective business state to match the conclusion - upheld leaves the decision standing, reversed replaces its effect, modified supersedes it in part. In every case the original decision, the appeal and the review outcome all remain readable; nothing is edited in place, because the record of what was decided and then changed is the point of having an appeal process at all
  - writes appeal_log (append)
  - -> a.communicate-outcome (node)
- **a.request-more-info** [action] (execution: communication)
  - Ask the appellant for the specific evidence the review is missing, naming only what is missing and leaving the appeal deadline where it was. Suspending a review for information nobody requested makes the appellant responsible for a gap they were never told about
  - -> w.more-info (node)
- **a.communicate-outcome** [action] (execution: communication)
  - State the review's conclusion, which effective state now applies as a result, and what remains available procedurally. An appeal that concludes in silence leaves the appellant holding the original decision and no way to know it was reconsidered
  - -> x.concluded (node)
- **w.more-info** [wait]
  - until the requested information is received
  - Detail: timeout after Requested information is waited for only until the appeal's own deadline; the deadline is never moved by the request. (configure appeal_and.more_info)
  - requesting more information does not extend the deadline it sits inside
  - engagement does not extend the window
  - -> w.review [on event] (node, back-edge)
  - -> h.deadline [on timeout] (node, back-edge)
- **x.concluded** [exit]
  - review concluded; original decision and outcome both preserved
  - Detail: a further appeal, where the process allows one, contests this outcome rather than the original decision

---
