## RET-24 — Churn Risk Escalation

- Canonical ID: `RET-24`
- Slug: `churn-risk-escalation`
- Display name: Churn Risk Escalation
- Canonical name (chain form): Churn risk escalation → evidence → intervention priority
- Source route: `/lab/customer-journeys/churn-risk-escalation`
- Category: Engagement, health, retention & churn prevention
- Goal: relationship-recovery-intervention
- Channels: task
- Surface: customer

**Purpose**: Decide how hard to push back on a relationship at risk, in proportion to how much independent evidence there actually is.

> Decide how hard to push back on a relationship at risk, in proportion to how much independent evidence there actually is.

### Trigger
- Event: `churn_risk_threshold_crossed`
- Meaning: several independent churn-relevant signals crossing a defined threshold together: sustained meaningful usage decline, a failed renewal or payment, a negative support experience, repeated unresolved blockers, explicit dissatisfaction, exploration of cancellation, a key stakeholder leaving, falling account-wide adoption
- Not enough on its own: a single weak signal; high account value, which describes what is at stake rather than the likelihood of losing it; a risk score with no decomposable evidence behind it
- Requires: several independent churn-relevant signals crossing a defined threshold together: sustained meaningful usage decline, a failed renewal or payment, a negative support experience, repeated unresolved blockers, explicit dissatisfaction, exploration of cancellation, a key stakeholder leaving, falling account-wide adoption
- Source: authoritative

### Entity
- Scope: customer, account or subscription relationship
- instance: account_id + risk_episode_id · one-active-per-key

### Who enters
- several independent churn-relevant signals crossing a defined threshold together: sustained meaningful usage decline, a failed renewal or payment, a negative support experience, repeated unresolved blockers, explicit dissatisfaction, exploration of cancellation, a key stakeholder leaving, falling account-wide adoption
- no instance of this journey is already open for the customer
- hard gates (GLB-31) allow communication for this purpose

### Suppressed when
- [canonical rule] A single weak signal never constitutes churn risk. Corroboration between independent signals is what the threshold is measuring.
- [canonical rule] A high-value customer is not automatically at high risk. Value is what is at stake, not the probability of losing it.
- [canonical rule] A risk score is not the outcome. It orders attention; it does not decide anything.
- [canonical rule] The size of the intervention tracks the strength of the evidence. An expensive save offer on thin evidence teaches customers what to do when they want one.

### Recommended orchestration · single-notice
1. **owner-task** (retention, canonical rule)
   - sent on classification - no wait before it
   - checks: Has explicit cancellation intent already been expressed? · Is the risk driven by a known operational problem, other than a payment failure already open in payment recovery? · Does the evidence justify a person?
   - Channel roles: human
   - Purpose: Raise a task for the account owner or customer success, carrying the evidence rather than the score, and suppress automated retention on this relationship so the person is not contradicted by a sequence while they work

**Channel roles** (recommended default)
- human (task) — the step is carried out by a person - a call, a task, a visit - and recorded as done by them
- delivery fallback: same-role-other-channel

### Stops when
- [no-action] risk recorded, nothing proportionate to do, or a higher-precedence contender already owns this account (re-entry: stronger or fresher evidence re-opens this at a higher level - doing nothing is a legitimate response to weak evidence, and doing something disproportionate is not; where the reason was a higher-precedence contender's active claim, that contender resolving re-opens this evaluation from current evidence rather than resuming a stale one)
- [handoff] Cancellation Save — cancellation intent already on record when risk escalates
- [handoff] Health Deterioration Diagnosis — risk with an identifiable operational cause
- [handoff] external:human-in-the-loop-lifecycle — risk strong enough to justify a person
- [handoff] Retention Offer Follow-Up — a proportionate automated retention intervention being delivered

### Configure
- `churn_risk.touches` [recommended default]: 1 — Every touch runs against a budget fixed when the instance opened; the budget is the plan's own length, and no touch is repeated because nothing could tell whether it arrived.
- `churn_risk.cooldown` [recommended default]: none — Escalation is per risk episode; the same episode re-crossing the threshold is the same instance and a later episode is its own.

### Required data
**Semantic events to map**
- `churn_risk_threshold_crossed` (authoritative) — several independent churn-relevant signals crossing a defined threshold together: sustained meaningful usage decline, a failed renewal or payment, a negative support experience, repeated unresolved blockers, explicit dissatisfaction, exploration of cancellation, a key stakeholder leaving, falling account-wide adoption
**Attributes**: account_id · risk_episode_id · risk_evidence · cancellation_intent_ref · operational_cause_ref · retention_ownership

### Collision & priority
- priority: retention
- pressure class: none
- local cap: 1 (all)
- cooldown: none
- competition: retention-outreach (account) - below an open issue under human ownership and below a declared cancellation intent on the same account, above generic retention intervention
- No action when s.g1 · s.g2 · s.g3 · s.g4 — the suppressions above are recorded outcomes, never a fallback to another channel

### Measurement
- journey outcome: exit-or-handoff: x.monitor, h.cancellation, h.resolve-first, h.human, h.intervention
- guardrails: complaint · message_after_success · unsubscribe

### Reusable rule
Churn intervention should increase only as independent evidence of relationship risk becomes stronger.

### Entity (notes)
- customer, account or subscription relationship
- Risk is held where the evidence was observed. A risky subscription inside a healthy account is a risky subscription.

### Guardrails
1. A single weak signal never constitutes churn risk. Corroboration between independent signals is what the threshold is measuring.
2. A high-value customer is not automatically at high risk. Value is what is at stake, not the probability of losing it.
3. A risk score is not the outcome. It orders attention; it does not decide anything.
4. The size of the intervention tracks the strength of the evidence. An expensive save offer on thin evidence teaches customers what to do when they want one.
5. This journey's own owner-task never fires while a higher-precedence retention-outreach contender (an open issue under human ownership, FBK-46) already claims the account - c.priority-clear re-reads that live claim immediately before a.owner-task rather than trusting declared precedence text alone. c.intent's own cancellation-intent check already covers the other higher-precedence contender (RET-28).
6. h.intervention mints a retention_episode_id at handoff rather than reusing risk_episode_id, since this journey's own episode is a churn-risk evaluation and RET-30's decline memory is scoped to a retention episode - a genuinely different, narrower concept that does not exist here until this specific intervention is chosen.

### Technical logic (graph, 13 nodes)
- **t.threshold** [trigger] (entry, evidence: authoritative)
  - Event id: `churn_risk_threshold_crossed`
  - Churn risk threshold crossed
  - evidence: authoritative
  - requires: several independent churn-relevant signals crossing a defined threshold together: sustained meaningful usage decline, a failed renewal or payment, a negative support experience, repeated unresolved blockers, explicit dissatisfaction, exploration of cancellation, a key stakeholder leaving, falling account-wide adoption
  - not enough on its own: a single weak signal
  - not enough on its own: high account value, which describes what is at stake rather than the likelihood of losing it
  - not enough on its own: a risk score with no decomposable evidence behind it
  - -> c.intent (node)
- **c.intent** [condition] (2 branches)
  - Has explicit cancellation intent already been expressed?
  - -> h.cancellation [Already cancelling]: a cancellation has been requested or a cancel flow entered (node)
  - -> a.evidence [No stated intent]: the risk is inferred from behaviour and events, and nobody has said anything (node)
- **h.cancellation** [handoff]
  - Cancellation intent → understand state → save or proceed
  - Detail: cancellation intent already on record when risk escalates
  - carries: the risk evidence, which is context for the conversation rather than a second conversation
  - suppresses: any separate retention track for this relationship while the cancellation decision is live
  - -> RET-28 (journey)
- **a.evidence** [action]
  - Assemble the signals with their sources and strengths. What matters is whether they corroborate each other, not how many there are - three readings of the same underlying event are one piece of evidence
  - writes risk_evidence (append)
  - -> c.operational (node)
- **c.operational** [condition] (2 branches)
  - Is the risk driven by a known operational problem, other than a payment failure already open in payment recovery?
  - -> h.resolve-first [Known problem]: the evidence points at something specific that is broken or unresolved, and it is not a payment failure with an open payment recovery instance on this relationship - that cause already has an owner (node)
  - -> c.human [No known problem]: the relationship is deteriorating and nothing identifiable is causing it, or the identifiable cause is a payment failure that payment recovery already owns (node)
- **h.resolve-first** [handoff]
  - Health deterioration → diagnose cause → recovery route
  - Detail: risk with an identifiable operational cause
  - carries: the risk evidence and which part of it names the problem
  - carries: the fact that this is already at risk level, so the cause-specific recovery knows what is at stake
  - suppresses: promotional retention offers on this relationship until the problem is resolved
  - -> RET-23 (journey)
- **c.human** [condition] (2 branches)
  - Does the evidence justify a person?
  - -> c.priority-clear [Justified]: the evidence is strong and corroborated, and the relationship warrants the cost of someone's attention (node)
  - -> c.automated [Not justified]: the evidence is real but thin, and putting a person on it would be a larger intervention than the signal supports (node)
- **c.priority-clear** [condition] (2 branches)
  - Does a higher-precedence retention-outreach contender already claim this account?
  - -> a.owner-task [Clear]: no open issue under human ownership (FBK-46) currently claims this account - this journey's own declared precedence is below that, above generic retention intervention (node)
  - -> x.monitor [Contended]: an open issue under human ownership already claims this account - raising a second, competing owner-task would contradict the person already working it rather than corroborate their evidence (node)
- **c.automated** [condition] (2 branches)
  - Is a proportionate automated recovery available?
  - -> h.intervention [Available]: something exists that matches the evidence at this strength (node)
  - -> x.monitor [Nothing proportionate]: the only available responses are larger than the evidence justifies (node)
- **a.owner-task** [action] (execution: human)
  - Raise a task for the account owner or customer success, carrying the evidence rather than the score, and suppress automated retention on this relationship so the person is not contradicted by a sequence while they work
  - writes retention_ownership (set)
  - writes suppressed_sends (append)
  - -> h.human (node)
- **x.monitor** [exit]
  - risk recorded, nothing proportionate to do, or a higher-precedence contender already owns this account
  - Detail: stronger or fresher evidence re-opens this at a higher level - doing nothing is a legitimate response to weak evidence, and doing something disproportionate is not; where the reason was a higher-precedence contender's active claim, that contender resolving re-opens this evaluation from current evidence rather than resuming a stale one
- **h.intervention** [handoff]
  - Retention intervention → outcome → suppress, escalate or exit
  - Detail: a proportionate automated retention intervention being delivered
  - carries: the evidence it was chosen against
  - carries: the risk state at the time it was sent
  - carries: a retention_episode_id minted at this handoff, deterministically derived from account_id + risk_episode_id, since this journey's own episode concept (a churn-risk evaluation) is not itself a retention episode - RET-30 remembers a decline against this identity the same way it does for RET-28's own cancellation-episode-scoped handoff
  - -> RET-30 (journey)
- **h.human** [handoff] (external)
  - external:human-in-the-loop-lifecycle
  - Detail: risk strong enough to justify a person
  - carries: the assembled evidence, so the first conversation is informed
  - carries: what has already been sent, so it is not repeated in person
  - -> external:human-in-the-loop-lifecycle (external)

---
