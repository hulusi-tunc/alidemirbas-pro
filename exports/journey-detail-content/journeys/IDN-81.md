## IDN-81 — Identity Verification

- Canonical ID: `IDN-81`
- Slug: `identity-claim-verification`
- Display name: Identity Verification
- Canonical name (chain form): Identity claim → evidence → verified, rejected or more evidence
- Source route: `/lab/customer-journeys/identity-claim-verification`
- Category: Identity, verification, authentication & account integrity
- Goal: identity-verification
- Channels: in-app, email
- Surface: customer (communicating)

**Purpose**: Establish confidence in one specific identity claim, bound to the evidence that established it.

> Establish confidence in one specific identity claim, bound to the evidence that established it.

### Trigger
- Event: `identity_verification_required`
- Meaning: a specific identity claim that a process or policy requires to be verified, at a stated scope
- Not enough on its own: someone stating their name, which is a claim rather than a request to verify it; an account holding an attribute nobody has checked
- Requires: a specific identity claim that a process or policy requires to be verified, at a stated scope
- Source: authoritative

### Entity
- Scope: the individual identity claim - which attribute, at what assurance, for what purpose
- instance: claim_id · one-active-per-key

### Who enters
- a specific identity claim that a process or policy requires to be verified, at a stated scope
- no instance of this journey is already open for the the individual identity claim
- hard gates (GLB-31) allow communication for this purpose

### Suppressed when
- [canonical rule] An identity supplied is not an identity verified.
- [canonical rule] Verifying one attribute does not verify unrelated attributes.
- [canonical rule] Evidence is scoped to the claim being verified. Asking for more than the claim needs creates liability without confidence.
- [canonical rule] Evidence rounds are bounded by policy rather than repeated until something is accepted.

### Recommended orchestration · notice-then-confirm
1. **request** (security, mandatory, canonical rule)
   - sent on classification - no wait before it
   - checks: Is the required evidence already available?
   - Channel roles: in-session -> persistent
   - Purpose: Request the minimum evidence this claim requires, and record the state as EVIDENCE_REQUIRED.
   - destination: `evidence-submission` · bound to `claim_id` · must not claim: that unrelated attributes are verified
2. **request-more** (security, mandatory, canonical rule)
   - Timing: The verification timeout for this claim. (configure identity_claim.evidence) (after the previous touch)
   - cancelled by the requested evidence for the claim is received
   - re-read before sending: the the individual identity claim re-read from the system of record before acting on the timeout
   - checks: Is the required evidence already available? · What did validation conclude? · Does the policy allow another evidence round?
   - Channel roles: in-session -> persistent
   - Purpose: Request the specific additional evidence that would settle it, naming what is missing rather than repeating the original request
   - destination: `evidence-submission` · bound to `claim_id`
   - after t1

**Channel roles** (recommended default)
- in-session (in-app) — the person is active in the product and the action is taken there
- persistent (email) — the message has to be kept and survive until the person can act on it
- delivery fallback: same-role-other-channel

### Stops when
- [timeout] EXPIRED; the claim was never verified (re-entry: a new verification instance may be opened for the same claim. Expired is not rejected - nobody assessed the claim and found against it)
- [success] VERIFIED for this claim, at this scope and assurance (re-entry: a different claim is verified on its own evidence, and this one is re-verified when its own validity lapses)
- [handoff] Decision Request — a claim that automated validation cannot settle
- [handoff] Verification Recovery — verification failing against a claim

### Configure
- `identity_claim.evidence` [config required] (response-window): configure identity_claim.evidence — The verification timeout for this claim.
- `identity_claim.validate_budget` [config required]: configure identity_claim.validate_budget — This loop runs against a budget fixed when the instance opened; when it is spent the instance takes its timeout path (GLB-24).
- `identity_claim.touches` [recommended default]: 0 — Every touch in this plan is the verification itself and is mandatory; nothing discretionary exists to cap.
- `identity_claim.cooldown` [recommended default]: none — This journey is per the individual identity claim; a later instance concerns a different the individual identity claim and no cooldown applies between them.

### Required data
**Semantic events to map**
- `identity_verification_required` (authoritative) — a specific identity claim that a process or policy requires to be verified, at a stated scope
- `verification_evidence_received` (declared) — the requested evidence for the claim is received
**Attributes**: claim_id · identity_id · attribute · required_assurance · purpose · evidence_policy · round_limit · verification_log

### Collision & priority
- priority: security · mandatory touches: t1, t2
- pressure class: none
- local cap: 0 (non-mandatory)
- cooldown: none
- competition: none
- No action when s.g1 · s.g2 · s.g3 · s.g4 — the suppressions above are recorded outcomes, never a fallback to another channel

### Measurement
- journey outcome: exit-or-handoff: x.expired, x.verified, h.review, h.failure
- business outcome: verification_evidence_received — the requested evidence for the claim is received
- observed: in this journey
- attribution: touched-before-event · not-applicable
- guardrails: complaint · message_after_success · unsubscribe

### Reusable rule
Verification establishes confidence in a specific identity claim using defined evidence; it does not create universal trust.

### Entity (notes)
- the individual identity claim - which attribute, at what assurance, for what purpose
- Verification belongs to a claim, not to a person. Two claims about the same person are two verifications, and neither carries the other.

### Distinct from
- IDN-85 (Authentication challenge → authenticate, step up or deny) — Verification asks whether a claim is true. Authentication asks whether whoever is present right now controls it. A verified claim from last year says nothing about who is at the keyboard.

### Guardrails
1. An identity supplied is not an identity verified.
2. Verifying one attribute does not verify unrelated attributes.
3. Evidence is scoped to the claim being verified. Asking for more than the claim needs creates liability without confidence.
4. Evidence rounds are bounded by policy rather than repeated until something is accepted.

### Technical logic (graph, 14 nodes)
- **t.required** [trigger] (entry, evidence: authoritative)
  - Event id: `identity_verification_required`
  - Identity verification required
  - evidence: authoritative
  - requires: a specific identity claim that a process or policy requires to be verified, at a stated scope
  - not enough on its own: someone stating their name, which is a claim rather than a request to verify it
  - not enough on its own: an account holding an attribute nobody has checked
  - -> a.instance (node)
- **a.instance** [action]
  - Create the verification instance bound to the exact claim - which attribute, at what assurance level, for what purpose - and record it as PENDING. A verification that is not bound to a claim verifies nothing in particular, and is read later as having verified everything
  - writes verification_log (append)
  - -> c.evidence (node)
- **c.evidence** [condition] (2 branches)
  - Is the required evidence already available?
  - -> a.validate [Available]: evidence sufficient for this claim at this assurance is already held (node)
  - -> a.request [Not yet]: the claim cannot be assessed on what is held (node)
- **a.validate** [action]
  - Validate the evidence against this claim's acceptance rules, recording the state as UNDER_REVIEW while it runs
  - writes verification_log (append)
  - -> c.result (node)
- **a.request** [action] (execution: communication)
  - Request the minimum evidence this claim requires, and record the state as EVIDENCE_REQUIRED. Evidence is scoped to the claim - collecting more than it needs creates a liability without creating confidence, and asking for a passport to confirm a phone number tells the person we do not know what we are checking
  - writes verification_log (append)
  - -> w.evidence (node)
- **c.result** [condition] (4 branches)
  - What did validation conclude?
  - -> a.verified [Verified]: the evidence establishes the claim at the required assurance (node)
  - -> h.failure [Rejected]: the evidence does not establish the claim, and the reason is known (node)
  - -> c.rounds [Inconclusive, more evidence would help]: the claim is neither established nor refuted and further evidence could settle it (node)
  - -> h.review [Needs human judgement]: the evidence requires a person to weigh it (node)
- **w.evidence** [wait]
  - until the requested evidence for the claim is received
  - Detail: timeout after The verification timeout for this claim. (configure identity_claim.evidence)
  - an open verification is a process held up somewhere else, and leaving it pending indefinitely blocks that process without anyone deciding to
  - engagement does not extend the window
  - -> a.validate [on event] (node, back-edge)
  - -> x.expired [on timeout] (node)
- **a.verified** [action]
  - Mark this exact claim VERIFIED, at the assurance the evidence supports and for the scope it covers, together with the evidence that established it. Verifying one attribute verifies nothing else - a verified address says nothing about a verified identity, and the binding is what stops the second being read out of the first
  - writes verification_log (append)
  - -> x.verified (node)
- **h.failure** [handoff]
  - Verification failure → reason → retry, remediate, review or exit
  - Detail: verification failing against a claim
  - carries: the claim and the failure as observed, unclassified
  - carries: the process waiting on this verification, if any
  - -> IDN-84 (journey)
- **c.rounds** [condition] (2 branches)
  - Does the policy allow another evidence round?
  - -> a.request-more [Round available]: the number of evidence requests for this claim is within the policy limit (node)
  - -> h.review [Limit reached]: the claim has been through as many rounds as policy allows (node)
- **h.review** [handoff]
  - Decision request → validate → route, reject or hold
  - Detail: a claim that automated validation cannot settle
  - carries: the claim, the evidence gathered and what was inconclusive about it
  - carries: how many rounds have already run, so the person is not asked to repeat them
  - -> DEC-181 (journey)
- **x.expired** [exit]
  - EXPIRED; the claim was never verified
  - Detail: a new verification instance may be opened for the same claim. Expired is not rejected - nobody assessed the claim and found against it
- **x.verified** [exit]
  - VERIFIED for this claim, at this scope and assurance
  - Detail: a different claim is verified on its own evidence, and this one is re-verified when its own validity lapses
- **a.request-more** [action] (execution: communication)
  - Request the specific additional evidence that would settle it, naming what is missing rather than repeating the original request
  - writes verification_log (append)
  - -> w.evidence (node, back-edge)

---
