## IDN-85 — Login Verification

- Canonical ID: `IDN-85`
- Slug: `authentication-challenge`
- Display name: Login Verification
- Canonical name (chain form): Authentication challenge → authenticate, step up or deny
- Source route: `/lab/customer-journeys/authentication-challenge`
- Category: Identity, verification, authentication & account integrity
- Goal: identity-verification
- Channels: sms, push, email
- Surface: customer (communicating)

**Purpose**: Establish that whoever is present controls the required identity, at the assurance the context demands.

> Establish that whoever is present controls the required identity, at the assurance the context demands.

### Trigger
- Event: `authentication_required`
- Meaning: a context requiring the actor's control of an identity to be established
- Not enough on its own: a session that already holds the required assurance; an authorization question about what an authenticated actor may do
- Requires: a context requiring the actor's control of an identity to be established
- Source: authoritative

### Entity
- Scope: the authentication session, bound to an actor and an account
- instance: session_id · one-active-per-key

### Who enters
- a context requiring the actor's control of an identity to be established
- no instance of this journey is already open for the the authentication session
- hard gates (GLB-31) allow communication for this purpose

### Suppressed when
- [canonical rule] Authentication is not authorization.
- [canonical rule] A successful login does not prove entitlement to any particular resource.
- [canonical rule] An authenticated session carries an explicit assurance level and an explicit validity.
- [canonical rule] An unanswered challenge is not recorded as a failed authentication.

### Recommended orchestration · single-notice
1. **challenge** (security, mandatory, canonical rule)
   - sent on classification - no wait before it
   - checks: Does the existing authentication already meet the required level?
   - Channel roles: urgent -> low-friction -> persistent
   - Purpose: Issue the challenge appropriate to the required assurance level

**Channel roles** (recommended default)
- urgent (sms) — an asserted time bound lies inside the urgent horizon and permission for messages on this channel is recorded
- low-friction (push) — a valid token or app session exists and the message is a single step from the notification
- persistent (email) — the message has to be kept and survive until the person can act on it
- delivery fallback: same-role-other-channel

### Stops when
- [success] already authenticated at the required level (re-entry: a context requiring higher assurance re-opens this. Being authenticated says who the actor is and nothing about what they may do)
- [timeout] challenge unanswered; nothing authenticated and nothing recorded against the actor (re-entry: a new attempt issues a new challenge)
- [success] authenticated, at a stated assurance and for a stated validity (re-entry: authorization for any particular action is decided separately, every time - a successful login proves control of an account and entitlement to nothing)
- [handoff] Step-Up Authentication — control established below the assurance the context requires
- [handoff] Authentication Risk Assessment — an authentication failure

### Configure
- `authentication_challenge.auth` [config required] (response-window): configure authentication_challenge.auth — The challenge window.
- `authentication_challenge.touches` [recommended default]: 0 — The challenge is the authentication itself and is mandatory; nothing discretionary exists to cap.
- `authentication_challenge.cooldown` [recommended default]: none — This journey is per the authentication session; a later instance concerns a different the authentication session and no cooldown applies between them.

### Required data
**Semantic events to map**
- `authentication_required` (authoritative) — a context requiring the actor's control of an identity to be established
- `authentication_succeeded` (authoritative) — the authentication challenge succeeds
- `authentication_failed` (authoritative) — the authentication challenge fails
**Attributes**: session_id · identity_id · account_id · required_assurance · existing_assurance · authentication_log

### Collision & priority
- priority: security · mandatory touches: t1
- pressure class: none
- local cap: 0 (non-mandatory)
- cooldown: none
- competition: none
- No action when s.g1 · s.g2 · s.g3 · s.g4 — the suppressions above are recorded outcomes, never a fallback to another channel

### Measurement
- journey outcome: exit-or-handoff: x.satisfied, x.timeout, x.authenticated, h.stepup, h.failure
- business outcome: authentication_succeeded — the authentication challenge succeeds
- observed: in this journey
- attribution: touched-before-event · not-applicable
- guardrails: complaint · message_after_success · unsubscribe

### Reusable rule
Authentication establishes that an actor currently controls the required identity/account at a defined assurance level.

### Entity (notes)
- the authentication session, bound to an actor and an account
- An authenticated session carries an explicit validity. A session with no stated lifetime is one that nothing can decide has expired.

### Distinct from
- ACC-75 (Access request → authorization check → allow, deny or step up) — This establishes who is present. ACC-75 decides what they may do. A successful authentication is an input to that decision and never a substitute for it.

### Guardrails
1. Authentication is not authorization.
2. A successful login does not prove entitlement to any particular resource.
3. An authenticated session carries an explicit assurance level and an explicit validity.
4. An unanswered challenge is not recorded as a failed authentication.

### Technical logic (graph, 12 nodes)
- **t.required** [trigger] (entry, evidence: authoritative)
  - Event id: `authentication_required`
  - Authentication required
  - evidence: authoritative
  - requires: a context requiring the actor's control of an identity to be established
  - not enough on its own: a session that already holds the required assurance
  - not enough on its own: an authorization question about what an authenticated actor may do
  - -> a.assurance (node)
- **a.assurance** [action]
  - Determine the assurance level this context requires. Assurance is a property of what is being done rather than of who is doing it - setting it per user produces an over-challenged ordinary session and an under-challenged sensitive one at the same time
  - -> c.sufficient (node)
- **c.sufficient** [condition] (2 branches)
  - Does the existing authentication already meet the required level?
  - -> x.satisfied [Sufficient]: a current session holds the required assurance and has not expired (node)
  - -> a.challenge [Not sufficient]: no session, an expired one, or one at a lower assurance than this context needs (node)
- **x.satisfied** [exit]
  - already authenticated at the required level
  - Detail: a context requiring higher assurance re-opens this. Being authenticated says who the actor is and nothing about what they may do
- **a.challenge** [action] (execution: communication)
  - Issue the challenge appropriate to the required assurance level
  - writes authentication_log (append)
  - -> w.auth (node)
- **w.auth** [wait]
  - until the authentication challenge succeeds, or the authentication challenge fails
  - Detail: timeout after The challenge window. (configure authentication_challenge.auth)
  - an unanswered challenge is not a failure to authenticate and is not recorded as one; the attempt simply ends
  - engagement does not extend the window
  - -> c.result [on event] (node)
  - -> x.timeout [on timeout] (node)
- **c.result** [condition] (3 branches)
  - What was established?
  - -> a.session [Authenticated at the required level]: the challenge succeeded at the assurance this context needs (node)
  - -> h.stepup [Authenticated below the required level]: control was established, at a lower assurance than the context requires (node)
  - -> h.failure [Failed]: the challenge was not satisfied (node)
- **x.timeout** [exit]
  - challenge unanswered; nothing authenticated and nothing recorded against the actor
  - Detail: a new attempt issues a new challenge
- **a.session** [action]
  - Issue or update the authenticated session with an explicit assurance level and an explicit validity. Both are needed downstream: without the level nothing can require a step-up, and without the validity nothing can decide the session has aged out
  - writes authentication_log (append)
  - -> x.authenticated (node)
- **h.stepup** [handoff]
  - Step-up requirement → stronger authentication → resume or deny
  - Detail: control established below the assurance the context requires
  - carries: the session and the assurance it currently holds
  - carries: the level the context requires
  - -> IDN-86 (journey)
- **h.failure** [handoff]
  - Authentication failure pattern → security check → recover or restrict
  - Detail: an authentication failure
  - carries: the attempt and its context
  - carries: the explicit fact that one failure is a signal rather than a finding
  - -> IDN-87 (journey)
- **x.authenticated** [exit]
  - authenticated, at a stated assurance and for a stated validity
  - Detail: authorization for any particular action is decided separately, every time - a successful login proves control of an account and entitlement to nothing

---
