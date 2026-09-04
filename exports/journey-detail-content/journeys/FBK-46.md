## FBK-46 — Complaint Resolution

- Canonical ID: `FBK-46`
- Slug: `issue-ownership-and-closure`
- Display name: Complaint Resolution
- Canonical name (chain form): Complaint or issue created → ownership → resolution → confirmation
- Source route: `/lab/customer-journeys/issue-ownership-and-closure`
- Category: Feedback, advocacy, referral & relationship signals
- Goal: escalation-exception
- Channels: task, email, in-app
- Surface: customer (communicating)

**Purpose**: Hold an actionable issue as an open obligation with a named owner until both the fix and the closure condition are satisfied.

> Own an actionable issue from creation to closure: assign it, escalate it up a bounded ladder when its SLA is missed, and close it only against the fix that was actually performed - confirmed by the person where a permitted route exists.

### Trigger
- Event: `actionable_issue_created`
- Meaning: a formally created issue with a type, a severity and a related entity
- Not enough on its own: a negative sentiment score with no operational failure identified behind it; a support conversation that has not yet concluded anything is actually wrong
- Requires: a formally created issue with a type, a severity and a related entity
- Source: authoritative

### Entity
- Scope: the issue or complaint itself
- instance: issue_id · one-active-per-key

### Who enters
- an actionable issue is created with type, severity, related entity, SLA and source
- the issue is not a duplicate of an open issue on the same underlying problem
- an owner is known or determinable; an orphan goes to ownership resolution first

### Suppressed when
- [canonical rule] A duplicate of an open issue on the same underlying problem is attached to it; no second issue is created.
- [canonical rule] Where no permitted route exists to ask the person, the issue closes under the bounded closure rule, recorded as unconfirmed; nothing is sent by a route that is not permitted.
- [canonical rule] While a human owns the issue, automated satisfaction and retention outreach on the same account is suppressed; the issue outranks it.
- [canonical rule] Escalation is internal - notify, involve the team, reassign to a priority queue; nothing customer-facing happens because an SLA was missed.
- [canonical rule] Hard gates (GLB-31) apply to the confirmation question; pressure caps do not, because it concerns an issue the person raised.

### Recommended orchestration · human-escalation-ladder
1. **confirmation-ask** (service, canonical rule)
   - Timing: The wait is the SLA threshold for this severity; a miss escalates one level, never to the customer. (configure complaint.sla_threshold) (after the trigger)
   - cancelled by the operational fix for the issue is recorded complete
   - re-read before sending: the issue re-read: fix completed or still open, and the current escalation level
   - checks: Does closure require the person to confirm? · Is there a permitted route to ask them?
   - Channel roles: persistent -> in-session
   - Purpose: Ask whether the specific issue they raised is now resolved, against the fix that was actually performed.
   - destination: `issue-confirmation` · bound to `issue_id` · must not claim: a fix that was not performed

**Channel roles** (recommended default)
- persistent (email) — the confirmation question should reach the person where they can answer in their own time and keep the record of what was fixed
- in-session (in-app) — the issue was raised in the product and the person is active there
- delivery fallback: same-role-other-channel

### Stops when
- [success] resolved and confirmed (re-entry: the same problem recurring is a new issue, linked to this one rather than reopening it)
- [success] fixed operationally, never confirmed (re-entry: any later contact about the same problem enters knowing this was never verified, which is why the distinction is recorded)
- [handoff] Task Assignment — an issue with no determinable owner
- [handoff] external:human-in-the-loop-lifecycle — an issue outliving its escalation ladder

### Configure
- `complaint.sla_threshold` [config required] (decision-sla): configure complaint.sla_threshold — The wait is the SLA threshold for this severity; a miss escalates one level, never to the customer.
- `complaint.escalation_levels` [recommended default]: 3 — The ladder has the levels the corpus names - notify, involve the team or manager, reassign into a priority queue - and is exhausted after them.
- `complaint.reopen_budget` [recommended default]: 2 — A disputed resolution reopens the fix a bounded number of times; past the budget the issue goes up the ladder rather than round the loop.
- `complaint.closure_window` [recommended default] (response-window): 5 days–10 days — The person is given a bounded window to confirm; past it the issue closes under the bounded closure rule, recorded as never confirmed rather than as resolved.
- `complaint.confirmation_asks` [recommended default]: 2 — The confirmation question is asked against each performed fix, bounded by the reopen budget; it is never repeated for the same fix.
- `complaint.cooldown` [recommended default]: none — Resolution is per issue; a new issue is its own instance and no cooldown applies between issues.

### Required data
**Semantic events to map**
- `actionable_issue_created` (authoritative) — a formally created issue with a type, a severity and a related entity
- `operational_fix_completed` (authoritative) — the operational fix for the issue is recorded complete
- `resolution_confirmed` (declared) — the person confirms the issue is resolved
- `resolution_disputed` (declared) — the person says the issue is not resolved
**Attributes**: issue_id · person_id · issue_type · severity · related_entity · sla_threshold · source · owner_id
**optional**: escalation_level · fix_performed · confirmation_required · permitted_routes

### Collision & priority
- priority: service
- pressure class: service
- local cap: 2 (all)
- cooldown: none
- competition: retention-outreach (account) - an open issue under human ownership outranks automated retention and satisfaction outreach on the same account
- No action when s.duplicate-case · s.no-route · s.human-owner · s.internal-escalation · s.hard-gates — the suppressions above are recorded outcomes, never a fallback to another channel

### Measurement
- journey outcome: exit-or-handoff: x.closed, x.closed-unconfirmed, h.orphan, h.escalate
- business outcome: resolution_confirmed — the person confirms the issue is resolved
- observed: in this journey
- attribution: entered-before-event · not-applicable
- guardrails: complaint · duplicate_issue_created · customer_facing_escalation · closed_without_fix

### Reusable rule
An actionable complaint remains an open obligation until its required resolution and closure conditions are satisfied.

### Entity (notes)
- the issue or complaint itself
- The issue is its own entity. The feedback that produced it, the person it affects and the case are three separate records, and the issue closing does not close the other two.

### Guardrails
1. An internal task completed does not mean the person's issue is resolved. Where confirmation is required, the two are separate events.
2. Severity decides whether anything else is suppressed. A critical or safety issue silences other messaging to this person; a standard one does not, and suppressing everything for every complaint costs more than it protects.
3. An unresolved issue may pause optional contact pressure for a defined period, and the period has a stated end rather than lasting until somebody notices. Its length comes from policy; recovery and support communication continues throughout.
4. Closing preserves the resolution history rather than replacing the issue with a status.
5. Duplicate complaints about one underlying problem are reconciled rather than worked in parallel.
6. An SLA breach escalates internally and produces nothing customer-facing.

### Technical logic (graph, 18 nodes)
- **t.created** [trigger] (entry, evidence: authoritative)
  - Event id: `actionable_issue_created`
  - Actionable issue created
  - evidence: authoritative
  - requires: a formally created issue with a type, a severity and a related entity
  - not enough on its own: a negative sentiment score with no operational failure identified behind it
  - not enough on its own: a support conversation that has not yet concluded anything is actually wrong
  - -> a.capture (node)
- **a.capture** [action]
  - Capture the issue type, severity, related entity, SLA and source. Duplicates against the same underlying problem are reconciled here rather than worked twice
  - writes issue_log (append)
  - -> c.owner (node)
- **c.owner** [condition] (2 branches)
  - Is the correct owner known?
  - -> a.assign [Known]: the issue type and entity identify who owns it (node)
  - -> h.orphan [Unknown]: no owner can be determined from the issue itself (node)
- **a.assign** [action] (execution: human)
  - Assign the owner and record the assignment, appended - who held an issue and when is part of its resolution history
  - writes issue_log (append)
  - -> w.resolution (node)
- **h.orphan** [handoff]
  - Work created → routing → assignment
  - Detail: an issue with no determinable owner
  - carries: the issue and everything known about it
  - carries: the fact that its SLA is already running, so assignment is not the start of the clock
  - -> OWN-51 (journey)
- **w.resolution** [wait]
  - until the operational fix for the issue is recorded complete
  - Detail: timeout after The wait is the SLA threshold for this severity; a miss escalates one level, never to the customer. (configure complaint.sla_threshold)
  - the SLA passing is an event to act on rather than a reason to stop - the obligation does not expire because we were slow
  - engagement does not extend the window
  - -> c.confirmation [on event] (node)
  - -> a.escalate [on timeout] (node)
- **c.confirmation** [condition] (2 branches)
  - Does closure require the person to confirm?
  - -> c.confirm-route [Confirmation required]: the fix is only verifiable from their side, or policy requires their agreement (node)
  - -> a.close [Not required]: the fix is verifiable operationally and policy allows closure on it (node)
- **a.escalate** [action] (execution: human)
  - Escalate one level: notify, then involve the team or manager, then reassign into a priority queue. Nothing customer-facing is sent because of this - an internal delay is our problem, not new information for them
  - writes issue_log (append)
  - -> c.levels (node)
- **c.confirm-route** [condition] (2 branches)
  - Is there a permitted route to ask them?
  - -> a.request-confirmation [A route exists]: a permitted, deliverable destination for this person is available for issue correspondence (node)
  - -> a.close-unconfirmed [No route]: no permitted destination is available, or the reporter cannot be reached on any of them (node)
- **a.close** [action]
  - Close the issue, preserving the full resolution history: what was wrong, who owned it, what was done, when, and that the person confirmed it
  - writes issue_log (append)
  - -> x.closed (node)
- **c.levels** [condition] (2 branches)
  - Are the escalation levels exhausted?
  - -> w.resolution [Levels remain]: a further level of escalation exists (node, back-edge)
  - -> h.escalate [Exhausted]: the ladder has been walked and the issue is still open (node)
- **a.request-confirmation** [action] (execution: communication)
  - Ask whether the specific issue they raised is now resolved, against the fix that was actually performed. Waiting for a confirmation nobody was asked for is not a confirmation state, it is a timeout dressed as one
  - -> w.confirm (node)
- **a.close-unconfirmed** [action]
  - Close under the bounded closure rule, recording explicitly that the fix completed and the person never confirmed. Confirmed and unconfirmed closures are different facts and are never written the same way - and, where closure was unconfirmed because no permitted route to the reporter existed, that reason is recorded as itself rather than as silence
  - writes issue_log (append)
  - -> x.closed-unconfirmed (node)
- **x.closed** [exit]
  - resolved and confirmed
  - Detail: the same problem recurring is a new issue, linked to this one rather than reopening it
- **h.escalate** [handoff] (external)
  - external:human-in-the-loop-lifecycle
  - Detail: an issue outliving its escalation ladder
  - carries: the full history: owners, escalations, elapsed time
  - carries: what is still unresolved
  - -> external:human-in-the-loop-lifecycle (external)
- **w.confirm** [wait]
  - until the person confirms the issue is resolved, or the person says the issue is not resolved
  - Detail: timeout after The person is given a bounded window to confirm; past it the issue closes under the bounded closure rule, recorded as never confirmed rather than as resolved. (example: 5 days–10 days; configure complaint.closure_window)
  - an issue cannot stay open indefinitely waiting for someone who has moved on, but closing it silently would record something that was never verified
  - engagement does not extend the window
  - -> c.confirmed [on event] (node)
  - -> a.close-unconfirmed [on timeout] (node, back-edge)
- **x.closed-unconfirmed** [exit]
  - fixed operationally, never confirmed
  - Detail: any later contact about the same problem enters knowing this was never verified, which is why the distinction is recorded
- **c.confirmed** [condition] (2 branches)
  - What did they say?
  - -> a.close [Resolved]: they confirmed the fix worked (node, back-edge)
  - -> w.resolution [Still not right]: they say the problem persists - the internal task completed and their issue did not (node, back-edge)

---
