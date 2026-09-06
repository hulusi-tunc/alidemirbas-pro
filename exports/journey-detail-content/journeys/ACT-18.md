## ACT-18 — Adoption Recovery

- Canonical ID: `ACT-18`
- Slug: `adoption-stall-diagnosis`
- Display name: Adoption Recovery
- Canonical name (chain form): Adoption stall → diagnose missing value → recover or re-route
- Source route: `/lab/customer-journeys/adoption-stall-diagnosis`
- Category: Activation, onboarding & early value
- Goal: relationship-recovery-intervention
- Channels: email, push
- Surface: customer (communicating)

**Purpose**: Work out why value stopped recurring before doing anything about it, including the case where nothing is wrong.

> Diagnose why value stopped in a use-case and address the specific blocker once - or record honestly that there is nothing to address.

### Trigger
- Event: `expected_adoption_pattern_not_met`
- Meaning: an activated account failing to progress against the usage pattern this product actually intends
- Not enough on its own: a gap that is normal for an episodic or seasonal product; a drop in logins with value still being produced
- Requires: an activated account failing to progress against the usage pattern this product actually intends
- Source: behavioral

### Entity
- Scope: person or account plus the product or use-case that stalled
- instance: account_id + use_case_id · one-active-per-key

### Who enters
- the expected adoption pattern for this use-case was not met, measured against the product's own rhythm
- the account is active and not terminated, restricted or in a live risk case
- no recovery instance is already open for this account and use-case
- hard gates (GLB-31) permit lifecycle communication

### Suppressed when
- [canonical rule] When the evidence shows the need was met - the use-case is complete, not abandoned - nothing is sent and the instance closes as satisfied.
- [canonical rule] When nothing in the evidence names a problem, nothing is sent; encouragement into silence is the failure this journey exists to avoid.
- [canonical rule] A blocker that needs a person is handed to a person; no automated touch is sent alongside a human intervention.
- [canonical rule] This journey is lowest in the retention-outreach group: an open issue under human ownership, a live risk case or a declared cancellation intent on the same account suppresses it (GLB-06).
- [canonical rule] No touch without permission for lifecycle communication; absent permission is a recorded no-action.

### Recommended orchestration · single-notice
1. **recovery** (lifecycle, canonical rule)
   - sent on classification - no wait before it
   - checks: What does the evidence show?
   - Channel roles: persistent -> low-friction
   - Purpose: Address the diagnosed blocker specifically - the unfinished setup, the missing integration, the misunderstanding. Not more encouragement and not a re-run of onboarding.
   - destination: `blocker-resolution-step` · bound to `use_case_id`

**Channel roles** (recommended default)
- persistent (email) — the blocker needs an explanation that survives until the person can act on it
- low-friction (push) — a valid token exists and the blocker is a single step the person can take from the notification
- delivery fallback: same-role-other-channel

### Stops when
- [invalid-state] use-case complete; the need was met, not abandoned (re-entry: a new use-case, or the same need arising again, opens adoption normally - this account did not fail, it finished)
- [no-action] no problem found; nothing sent (re-entry: real evidence of a stall later re-opens this - the absence of a finding is a finding, and manufacturing an intervention from it is the failure this branch exists to prevent)
- [handoff] Adoption Nurture — value produced again after recovery
- [handoff] external:health-monitoring — a recovery window closing without value returning
- [handoff] external:human-in-the-loop-lifecycle — a technical blocker that needs a person

### Configure
- `adoption_recovery.window` [config required] (recovery-window): configure adoption_recovery.window — The recovery window is drawn from the product's own intended usage rhythm for this use-case, bounded so that a stall is either recovered or handed to monitoring - never nudged indefinitely.
- `adoption_recovery.touches` [recommended default]: 1 — One recovery touch per diagnosed blocker; a second touch on the same diagnosis is pressure, not help.
- `adoption_recovery.cooldown` [recommended default] (cooldown): 30 days–90 days — A new stall in the same use-case opens a new instance only after the cooldown; a stall re-detected inside it is monitored, not messaged.
- `adoption_recovery.holdout_share` [recommended default]: 10 — A persistent holdout is required: stalled accounts resume on their own often enough that a treated-only measurement cannot tell the touch's effect from theirs.

### Required data
**Semantic events to map**
- `expected_adoption_pattern_not_met` (behavioral) — an activated account failing to progress against the usage pattern this product actually intends
- `value_produced` (authoritative) — the product records the person producing value again in this use-case
**Attributes**: account_id · use_case_id · expected_pattern · last_value_at · diagnosed_blocker
**optional**: has_push_token · setup_completion · integration_status

### Collision & priority
- priority: lifecycle
- pressure class: lifecycle
- local cap: 1 (all)
- cooldown: 30 days–90 days
- competition: retention-outreach (account) - lowest in the group - an open issue under human ownership, a live risk case or a declared cancellation intent all outrank a recovery nudge
- No action when s.need-met · s.no-evidence · s.human · s.contest · s.permission — the suppressions above are recorded outcomes, never a fallback to another channel

### Measurement
- journey outcome: exit-or-handoff: h.adoption, h.monitor, h.assistance, x.satisfied, x.no-intervention
- business outcome: value_produced — the product records the person producing value again in this use-case
- observed: in this journey
- attribution: touched-before-event · persistent-holdout
- guardrails: unsubscribe · complaint · message_after_success

### Reusable rule
Adoption recovery should diagnose why expected value stopped recurring before prescribing more engagement.

### Entity (notes)
- person or account plus the product or use-case that stalled
- A stall in one use-case is not a stall in the account. Others it holds may be perfectly healthy.

### Distinct from
- ACT-14 (Struggling user detection → proactive assistance → recovery or exit) — ACT-14 is pre-activation and triggered by help-seeking. This is post-activation and triggered by silence, where the most common correct answer is that nothing is wrong.

### Guardrails
1. Reduced usage is not churn risk. It is reduced usage, and the difference is a diagnosis nobody has made yet.
2. Seasonal and episodic products carry their own expectations. A gap that is normal for the product is not a stall.
3. Where no problem can be found, nothing is sent. An intervention invented to fill a dashboard gap is worse than the gap.

### Technical logic (graph, 10 nodes)
- **t.stall** [trigger] (entry, evidence: behavioral)
  - Event id: `expected_adoption_pattern_not_met`
  - Expected adoption pattern not met
  - evidence: behavioral
  - requires: an activated account failing to progress against the usage pattern this product actually intends
  - not enough on its own: a gap that is normal for an episodic or seasonal product
  - not enough on its own: a drop in logins with value still being produced
  - -> a.diagnose (node)
- **a.diagnose** [action]
  - Work out what the evidence actually shows: setup that was never finished, an integration that is missing, no clear next use-case, collaborators who never joined, value that simply never repeated, a technical blocker - or a use-case that is finished and needs nothing further
  - -> c.type (node)
- **c.type** [condition] (4 branches)
  - What does the evidence show?
  - -> a.recover [Recoverable blocker]: something specific is in the way: unfinished setup, a missing integration, an unclear next use-case, collaborators who never arrived (node)
  - -> h.assistance [Needs a person]: a technical problem that will not be solved by a message (node)
  - -> x.satisfied [Need genuinely met]: the use-case was completed and there is nothing further to do - the account got what it came for (node)
  - -> x.no-intervention [No evidence of a problem]: usage looks light against a generic expectation but nothing indicates anything is wrong (node)
- **a.recover** [action] (execution: communication)
  - Address the diagnosed blocker specifically. Not more encouragement, not a re-run of onboarding - the thing the diagnosis actually named
  - -> w.recover (node)
- **h.assistance** [handoff] (external)
  - external:human-in-the-loop-lifecycle
  - Detail: a technical blocker that needs a person
  - carries: the diagnosis
  - carries: what the account was trying to do when it stopped
  - -> external:human-in-the-loop-lifecycle (external)
- **x.satisfied** [exit]
  - use-case complete; the need was met, not abandoned
  - Detail: a new use-case, or the same need arising again, opens adoption normally - this account did not fail, it finished
- **x.no-intervention** [exit]
  - no problem found; nothing sent
  - Detail: real evidence of a stall later re-opens this - the absence of a finding is a finding, and manufacturing an intervention from it is the failure this branch exists to prevent
- **w.recover** [wait]
  - until the product records the person producing value again in this use-case
  - Detail: timeout after The recovery window is drawn from the product's own intended usage rhythm for this use-case, bounded so that a stall is either recovered or handed to monitoring - never nudged indefinitely. (configure adoption_recovery.window)
  - a recovery attempt that has not worked does not work better repeated
  - engagement does not extend the window
  - -> h.adoption [on event] (node)
  - -> h.monitor [on timeout] (node)
- **h.adoption** [handoff]
  - Early adoption → usage depth → habit or stable use
  - Detail: value produced again after recovery
  - carries: what the blocker was and what cleared it
  - carries: the recovered usage pattern
  - -> ACT-17 (journey)
- **h.monitor** [handoff] (external)
  - external:health-monitoring
  - Detail: a recovery window closing without value returning
  - carries: the diagnosis and what was tried
  - carries: the fact that this is reduced usage, not a churn decision - nobody has said anything
  - suppresses: adoption-frequency messaging for this use-case
  - -> external:health-monitoring (external)

---
