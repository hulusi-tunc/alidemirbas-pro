## IDN-84 — Verification Recovery

- Canonical ID: `IDN-84`
- Slug: `verification-failure-routing`
- Display name: Verification Recovery
- Canonical name (chain form): Verification failure → reason → retry, remediate, review or exit
- Source route: `/lab/customer-journeys/verification-failure-routing`
- Category: Identity, verification, authentication & account integrity
- Goal: identity-verification
- Channels: in-app, email
- Surface: customer (communicating)

**Purpose**: Route a failed verification by why it failed, and keep our own failures out of the customer's verification record.

> Route a failed verification by why it failed, and keep our own failures out of the customer's verification record.

### Trigger
- Event: `verification_attempt_failed`
- Meaning: a verification attempt that did not establish its claim
- Not enough on its own: a verification that expired with no attempt made, which is IDN-81's expiry; a policy change invalidating an existing verification without anyone having attempted one
- Requires: a verification attempt that did not establish its claim
- Source: authoritative

### Entity
- Scope: the verification instance that failed
- instance: verification_instance_id · one-active-per-key

### Who enters
- a verification attempt that did not establish its claim
- no instance of this journey is already open for the the verification instance that failed
- hard gates (GLB-31) allow communication for this purpose

### Suppressed when
- [canonical rule] Retry limits are policy-defined and bounded, and the bound is tighter where the claim is security-sensitive.
- [canonical rule] A technical failure is never recorded as an identity rejection.
- [canonical rule] Repeated retries do not bypass security controls. Exhausting the budget routes to a person, not to an acceptance.
- [canonical rule] The failure reason is preserved, because the route out depends on it.

### Recommended orchestration · notice-then-confirm
1. **explain** (security, mandatory, canonical rule)
   - sent on classification - no wait before it
   - checks: What kind of failure was it? · Does the retry budget for this claim have room?
   - Channel roles: in-session -> persistent
   - Purpose: Explain exactly what needs correcting and offer the bounded retry.
   - destination: `retry-verification` · bound to `verification_instance_id`
2. **explain-terminal** (security, mandatory, canonical rule)
   - sent on classification - no wait before it
   - checks: What kind of failure was it?
   - Channel roles: in-session -> persistent
   - Purpose: Say that this claim cannot be verified on this basis, and name what basis would be accepted if any is.
   - destination: `alternative-verification-basis` · bound to `verification_instance_id`

**Channel roles** (recommended default)
- in-session (in-app) — the person is active in the product and the action is taken there
- persistent (email) — the message has to be kept and survive until the person can act on it
- delivery fallback: same-role-other-channel

### Stops when
- [success] bounded retry available; the verification instance stays open (re-entry: the retry runs as part of the same verification instance, against the same budget - a new instance would reset the count, which is how a bounded retry becomes an unbounded one)
- [failure] verification not possible on this basis (re-entry: a different basis or a different claim is assessed on its own terms; what would have to change here is the policy rather than the evidence)
- [handoff] Ownership Escalation — a technical failure that is not clearing
- [handoff] Decision Request — a failure requiring human judgement, or a budget reached

### Configure
- `verification_failure.touches` [recommended default]: 1 — Every touch runs against a budget fixed when the instance opened; the budget is the plan's own length, and no touch is repeated because nothing could tell whether it arrived.
- `verification_failure.cooldown` [recommended default]: none — This journey is per the verification instance that failed; a later instance concerns a different the verification instance that failed and no cooldown applies between them.

### Required data
**Semantic events to map**
- `verification_attempt_failed` (authoritative) — a verification attempt that did not establish its claim
**Attributes**: verification_instance_id · claim_id · failure_class · retry_budget · backoff_budget · verification_log

### Collision & priority
- priority: security · mandatory touches: t1, t2
- pressure class: none
- local cap: 1 (non-mandatory)
- cooldown: none
- competition: none
- No action when s.g1 · s.g2 · s.g3 · s.g4 — the suppressions above are recorded outcomes, never a fallback to another channel

### Measurement
- journey outcome: exit-or-handoff: x.retry, x.terminal, h.escalate, h.review
- guardrails: complaint · message_after_success · unsubscribe

### Reusable rule
Verification recovery should follow the reason verification failed rather than treating every failure as equivalent.

### Entity (notes)
- the verification instance that failed
- The failure belongs to the attempt. A technical failure and a mismatch are different facts about different things, and only one of them is about the person.

### Guardrails
1. Retry limits are policy-defined and bounded, and the bound is tighter where the claim is security-sensitive.
2. A technical failure is never recorded as an identity rejection.
3. Repeated retries do not bypass security controls. Exhausting the budget routes to a person, not to an acceptance.
4. The failure reason is preserved, because the route out depends on it.

### Technical logic (graph, 12 nodes)
- **t.failed** [trigger] (entry, evidence: authoritative)
  - Event id: `verification_attempt_failed`
  - Verification attempt failed
  - evidence: authoritative
  - requires: a verification attempt that did not establish its claim
  - not enough on its own: a verification that expired with no attempt made, which is IDN-81's expiry
  - not enough on its own: a policy change invalidating an existing verification without anyone having attempted one
  - -> a.classify (node)
- **a.classify** [action]
  - Classify the failure as INSUFFICIENT_EVIDENCE, MISMATCH, UNREADABLE, EXPIRED_EVIDENCE, TECHNICAL_FAILURE, POLICY_FAILURE, REVIEW_REQUIRED or UNKNOWN. The class decides the route, and it decides something else: recording our own outage as an identity rejection marks someone as having failed a check they never got to attempt
  - writes verification_log (append)
  - -> c.class (node)
- **c.class** [condition] (4 branches)
  - What kind of failure was it?
  - -> c.retry-budget [The person can correct it]: insufficient evidence, unreadable evidence, or evidence that has expired (node)
  - -> c.technical-budget [Ours, and transient]: a technical failure on our side or a provider's (node)
  - -> h.review [Needs a person]: a mismatch, an explicit review requirement, or a failure nobody could classify (node)
  - -> a.explain-terminal [Terminal by policy]: policy forbids verifying this claim on this basis at all (node)
- **c.retry-budget** [condition] (2 branches)
  - Does the retry budget for this claim have room?
  - -> a.explain [Room to retry]: attempts against this claim are within the policy limit for its security sensitivity (node)
  - -> h.review [Budget spent]: the limit is reached - and repeated failure is also what a genuine person struggling looks like (node)
- **c.technical-budget** [condition] (2 branches)
  - Is a safe retry available within the backoff budget?
  - -> a.backoff [Retry]: the failure is transient and the budget has room (node)
  - -> h.escalate [Persistent]: the technical failure is not clearing (node)
- **h.review** [handoff]
  - Decision request → validate → route, reject or hold
  - Detail: a failure requiring human judgement, or a budget reached
  - carries: the failure class and every attempt made
  - carries: the claim being verified, so the reviewer assesses the claim rather than the attempts
  - -> DEC-181 (journey)
- **a.explain-terminal** [action] (execution: communication)
  - Say that this claim cannot be verified on this basis, and name what basis would be accepted if any is. Somebody who attempted verification and hears nothing will attempt it again, and each attempt writes a failure against a person who was never going to be able to pass
  - -> x.terminal (node)
- **a.explain** [action] (execution: communication)
  - Explain exactly what needs correcting and offer the bounded retry. A retry offered without an explanation produces the same attempt again, which spends the budget without improving anything
  - writes verification_log (append)
  - -> x.retry (node)
- **a.backoff** [action]
  - Retry with backoff, recording nothing against the person's verification history. Our failure is not their rejection, and the distinction has to survive into whatever reads that history later
  - writes verification_log (append)
  - -> x.retry (node)
- **h.escalate** [handoff]
  - Responsibility escalation → higher authority → resolution or return
  - Detail: a technical failure that is not clearing
  - carries: the failure class and how often it has recurred
  - carries: the people currently unable to verify because of it, which is what makes this operational rather than administrative
  - -> OWN-55 (journey)
- **x.terminal** [exit]
  - verification not possible on this basis
  - Detail: a different basis or a different claim is assessed on its own terms; what would have to change here is the policy rather than the evidence
- **x.retry** [exit]
  - bounded retry available; the verification instance stays open
  - Detail: the retry runs as part of the same verification instance, against the same budget - a new instance would reset the count, which is how a bounded retry becomes an unbounded one

---
