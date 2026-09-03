# Communicating Customer Journeys — production readiness audit

Research artifact. Nothing in `src/canonical/`, `production/`, `search/`, `seo/` or any other
production path was changed by this round. Scope: implementation readiness of the corpus's
orchestration-bearing Customer Journeys — could a CRM/lifecycle/CX team take one of these and
build it on their own stack (Braze, Insider, Salesforce, Adobe, a CDP, or their own orchestration
layer) without inventing missing pieces?

## Corpus confirmation — the count is 71, not 68

This round's brief states the corpus as 68 communicating Customer Journeys. Deriving the count
fresh from `src/canonical/surface.ts`'s own `surfaceOf()` classification (the same function
`scripts/surface-assignment.mjs` and the site both read) gives **71**, not 68. The discrepancy is
real and explained, not a miscount:

- `surfaceOf().communicating` is `sends || routesToHuman` — true for any journey that either sends
  a customer message on a channel or routes work to a person via `task`/`sales`.
- The **site's own UI** narrows this further for its "Customer journeys" tab: `communicating` there
  means `sends` alone (a design decision made in the site-restructuring round immediately before
  this audit, so that a journey with no customer-facing message shows under "Lifecycle states"
  instead). That narrower definition is what produces 68.
- The three journeys the narrower definition excludes — **ACQ-04, ACT-11, RET-24** — all send no
  customer message (`channels: ["sales","task"]`, `["task"]`, `["task"]` respectively) but all
  three are full vNext-migrated journeys carrying `contact`, `channelStrategy` and
  `orchestration.touches`, exactly like the 68 that do send a message. They have an instance
  identity, a trigger contract, a touch plan (human-executed), suppression logic, and a
  measurement contract — every implementation-readiness question this audit asks applies to them
  identically.

Given the audit's own stated purpose — could an implementation team build this? — excluding three
journeys that carry a full orchestration contract because their one channel routes to a person
rather than sends a message would be the wrong scope cut. **This audit covers all 71.** If the
strict 68 (message-only) figure is what a downstream process needs, it is the 71 minus
{ACQ-04, ACT-11, RET-24}, all three fully documented below with a `READY_WITH_MAPPING` verdict.

**Mechanism-leakage check (explicitly requested in the brief): clean.** The three
communication-layer mechanisms referenced by name in the migration brief — `CMS-208`, `CON-36`,
`OPS-124` — all resolve to `surface: "mechanism"` in `production/surface-assignment.json`. None
appear on the customer surface. Zero mechanism ids were found among the 71.

## Architecture findings

The three-layer split the brief specifies (Canonical Journey → Implementation Contract → Company
Mapping → Platform Implementation) holds up against all 71 journeys without needing a fourth layer
or a vendor-specific escape hatch anywhere. `implementation-contract.schema.ts` is the resulting
model; it was audited into shape by filling it against all 71 journeys' actual graphs, not
designed from a theoretical taxonomy first. No field in the schema went unused across the corpus,
and no journey needed a field the schema didn't have — the schema and the 71-journey read
converged, which is itself evidence the layer is drawn in the right place.

The single largest pattern this audit found is **not** inside any one journey's graph — every one
of the 71 graphs is internally sound (every condition has ≥2 real branches, every wait has a
timeout, every exit is classed, no engagement signal was found masquerading as a business
outcome). The gaps are almost entirely **between** journeys and **between** a sound graph and the
company data it assumes exists: undefined instance-identity boundaries, unenforced or undeclared
suppression edges between sibling journeys, one systemic copy-paste defect in idempotency keys,
and channel-selection rules that reference a signal the journey's own attribute list doesn't
carry. This is a good outcome for the canonical layer and a real, itemized punch list for the
implementation-contract layer — exactly the finding this audit round was scoped to produce.

## Readiness distribution

| Verdict | Count |
|---|--:|
| READY | 1 |
| READY WITH MAPPING | 50 |
| NEEDS CONTRACT WORK | 20 |
| NEEDS CANONICAL CHANGE | 0 |
| **Total** | **71** |

## Gap counts

| Priority | Count |
|---|--:|
| P0 — implementation blocker | 20 |
| P1 — high-value improvement | 58 |
| P2 — documentation/UX | 26 |
| **Total** | **104** |

No journey required a `NEEDS_CANONICAL_CHANGE` verdict. Every gap found is resolvable at the
implementation-contract layer — an undefined precedence rule, a missing cross-instance suppression
check, a wrong field in an idempotency key, a channel-selection condition that can't be evaluated
as written, or a missing identifier derivation — without adding a branch, a communication action,
or otherwise rewriting a canonical graph. See "Top 15 gaps" below and each journey's own `GAPS`
section for the complete, itemized list.

## Top 15 most important gaps

Ranked by reach and severity, not by journey order:

1. **Systemic idempotencyKey defect, 7 journeys** (FBK-47, IDN-81, IDN-84, ACC-263, FBK-49,
   ACC-261, IDN-270) — P0. Each journey's `idempotencyKey` references an entity-id field that
   journey's own `implementation.attributes.required` never declares, evidently copy-pasted from a
   shared template. Idempotency is a real dedup mechanism, not documentation — as written, none of
   the seven can be correctly wired. A one-line correction per key; a cheap, corpus-wide,
   greppable lint (compare every `idempotencyKey` string against its own journey's required
   attributes) would have caught this mechanically.
2. **FUL-146 / FUL-265 delay-vs-tracking overlap with no suppression** — P0. Both can be open on
   the same obligation with nothing preventing it; FUL-265 can independently send a "not arrived"
   message about the same slip FUL-146 is already messaging as a delay with a new ETA.
3. **FUL-265 → FUL-148 missing handoff** — P0. No wiring from "we told the customer it didn't
   arrive" (FUL-265's `x.unresolved`) to "here is how we recover it" (FUL-148).
4. **`issue_id` minting gap, recurs 3×** (SCH-180→REM-151, FUL-148→REM-151, REM-152→REM-157) — P0.
   Three upstream journeys hand off into the `issue_id`-keyed remedy chain without ever generating
   or carrying an `issue_id`. Not a mapping question — a whether-the-identifier-exists-at-all
   question.
5. **FBK-41 vs. FBK-42 outbound-ask tie-break undefined** — P0. Both declare the same
   `contact.competition.exclusionGroup` with the explicit rule "neither is assumed to outrank the
   other," and no default exists anywhere in the corpus — two eligible instances for one person
   race non-deterministically for one ask slot.
6. **FBK-43's declared `task` channel is unmapped** — P0. `channelStrategy.roles` covers email and
   in-app only; the journey's own escalation and support-work-item actions (`execution: "human"`)
   have no destination or role at all.
7. **DOC-220's authority for "which version is authoritative" is unnamed** — P0, the sole P0 in the
   time/document/structure/integration/decision/terminal batch. Criteria are named
   (deterministic-identifiability rules); no system, role or algorithm is assigned to apply them.
8. **ACT-12 / ACT-14 suppression edge is prose-only** — P1. ACT-12's own documentation says it
   should pause when ACT-14 books an assisted-help session; nothing enforces this in either
   journey's graph or `orchestration.noAction`.
9. **SUB-163 is missing the FIN-134 exclusion its sibling group already has** — P1. RET-24 and
   RET-32 both name an open payment-recovery instance explicitly in their competition precedence;
   SUB-163 names cancellation-in-motion and active-risk but not payment recovery, so a relationship
   with an open FIN-134 instance can still receive a routine renewal decision-request.
10. **CON-264 / CON-272 trigger overlap** — P1, both journeys. A contact-repair-originated change
    also matches CON-264's own trigger event; neither journey's `distinctFrom` addresses the other.
11. **DOC-215 / DOC-220 / DOC-286 share a lineage with no cross-instance suppression check** — P1.
    All three can legitimately be open on the same `document_lineage_id`; the connection points
    (DOC-220's `h.resign`) are sound, but none of the three verifies the others aren't concurrently
    open — the most generalizable structural finding in this audit (any `*_lineage_id`/
    `*_version_id` family needs this pattern).
12. **TIM-61 / TIM-63 / TIM-268 / TIM-274 name an "urgent horizon" with no config key** — P1, all
    four. Every other timing dependency in these journeys is attribute-bound or carries a named
    `ConfigRef`; this one threshold exists only as prose inside a channel role's `when` condition.
13. **ACT-14 / ACQ-09 channel-role selection has no stated precedence** — P1. ACT-14's four touches
    each list all three eligible roles with no per-touch narrowing; ACQ-09's two roles are not
    mutually exclusive conditions.
14. **RET-24's operational-cause branch doesn't check for an open FIN-134 instance** — P1. Low
    send-risk (RET-24 is internal-task-only) but a real double-ownership risk at the ops level.
15. **REM-157 ↔ REM-152 potential ping-pong with no cycle-guard** — P1. If REM-152 rejects a
    return, `h.alternative` sends it back to REM-157 with no rule against re-selecting "return"
    again.

## Cross-library patterns

- **The corpus's own "engagement is never progress" guardrail holds everywhere it was checked.**
  Every `engagementIsEvidenceOnly` flag across all 71 contracts is `true` and is enforced
  structurally (a dedicated re-read-from-system-of-record step), not just declared in prose. Zero
  violations found.
- **Fully-worked conflict resolution exists as a corpus pattern, unevenly applied.** The
  commerce-recovery trio (ACQ-11→ACQ-12→ACQ-13) and the retention-outreach group (RET-24/28/30/32)
  are the two cleanest templates in the corpus — explicit `contact.competition.precedence` text on
  every member, enforced handoffs at the graduation points. The gaps found (SUB-163, FBK-41/42,
  the DOC trio) are all cases of a group that has *some* of this pattern but not all of it, not
  cases where the pattern is absent entirely.
- **Router journeys are a recognized, correct pattern, not a defect.** ACQ-04, ACT-11 and ACT-17
  (all three among the 3-journey 68-vs-71 delta plus ACT-17) own no outcome of their own by design
  — both terminal branches are handoffs. This is already reviewed in
  `production/vnext-warning-reviews.json` (`router_journey`) and should not be re-flagged as a
  missing-outcome gap in any future pass.
- **Config keys with `required: true` and no numeric default are the deliberate majority, not an
  omission.** Recovery windows, response windows, resolution horizons — genuinely variable per
  company/product — correctly carry no invented number. Only one instance across all 71 journeys
  (ACQ-13's `interest.qualification_rule`) was found lacking even the *structural* ConfigRef shape
  its siblings get, and that is a P2 documentation gap, not a missing decision.
- **A recurring identifier-provenance gap.** The `issue_id` pattern (finding #4 above) and the
  idempotencyKey defect (finding #1) are the same underlying failure mode at two different
  layers: an entity-id field assumed present that a specific journey's own data model never
  declares. Worth a corpus-wide automated check beyond this round's 71.

## Recommended implementation-contract architecture

Confirmed as fit for purpose by the full 71-journey read: `implementation-contract.schema.ts`
(this directory). Nine typed sections — trigger, instance, required data, source of truth,
config refs, channel policy, suppression, handoffs, outcomes, test scenarios — each populated from
a specific canonical field the journey already carries (trigger evidence, entity.instanceKey,
implementation.attributes, contact/channelStrategy/orchestration, measurement, discovery), never
from an invented taxonomy. The schema typechecks standalone
(`npx tsc --noEmit --strict --skipLibCheck`) and every one of the 71 generated contracts in
`implementation-contracts.json` validates against it structurally and by enum (zero violations on
both checks). It is deliberately *not* wired into `src/canonical/` — see "What this round did not
do" below.

## What this round did not do

Per the brief's explicit scope: no silent lifecycle state, runtime mechanism or operational
workflow was modified or newly audited; no Gate 5 work; no site changes; no preset added; no new
canonical journey added (no genuine canonical gap was found that would justify one — see the
`NEEDS_CANONICAL_CHANGE` count of zero); no vendor-specific object was named anywhere in the
output; no numeric value was invented anywhere (the only numbers appearing in any contract are
direct citations of a canonical journey's own pre-existing `example-only` Config default, flagged
as needing a real business value — verified by a text scan of the merged JSON, see the audit
process notes below); no production file under `src/`, `production/`, `search/`, or `seo/` was
touched.

## Full per-journey audit

The remainder of this document is the 71 individual entries, alphabetical by journey id, one per
the brief's required template (READINESS / WHY / INSTANCE / EVENTS / DATA / SOURCE OF TRUTH /
CONFIG / CHANNEL POLICY / SUPPRESSION-PREEMPTION / HANDOFF / OUTCOMES / TEST CASES / GAPS).

---

## ACC-261 — Access Recovery

READINESS: NEEDS_CONTRACT_WORK

WHY:
The three-way branch (nothing they can do vs. resolvable by them vs. already owned by a security response) is exactly the right shape, and x.security-owned cleanly resolves what would otherwise be a duplicate notice alongside IDN-271. Two implementation issues remain: the idempotencyKeys reference "person_id", a field this journey never declares (account_id + restriction_id are the actual key), and h.unreachable is the only exit in the whole journey with no reEntry note, leaving it undefined whether a route CON-36 later repairs re-triggers the notice.

INSTANCE:
Scope: person or account plus the specific restriction or end date placed on it
Key: account_id + restriction_id
Dedupe policy: reject-duplicate
Concurrency note: A second, unrelated restriction on the same account is its own instance with its own notice.

EVENTS:
Canonical event: access_restriction_or_end_recorded (source: authoritative)
Required evidence: an authoritative restriction, suspension or end date recorded against the account; a stated condition or deadline that would resolve it
Insufficient alone: a risk signal that has not yet produced a restriction; an internal review that has not concluded

DATA:
- account_id — instance key (idempotencyKeys incorrectly reference person_id instead — see gaps)
- restriction_id — instance key
- restricted_capabilities — a.notify / a.inform-only messaging
- still_working — a.notify — naming what still works
- resolution_condition — a.notify destination binding
- resolution_deadline_at — w.resolve timeout binding

SOURCE OF TRUTH:
- whether the holder can resolve the condition themselves vs. it being internal/third-party/security-owned -> restriction/policy system that recorded the restriction and its release condition (ACC-78) [engagement is evidence-only]
- whether the release condition was met -> same restriction/policy system [engagement is evidence-only]

CONFIG:
- access_restriction.touches — touch budget for the plan (2: one notice, one confirmation) (basis: business policy, required: false)
- access_restriction.cooldown — cooldown between instances (none — per restriction) (basis: business policy, required: false)
- access_restriction.resolve — the stated deadline or review point for the restriction (basis: business policy, timingClass: attribute-bound, required: true)

CHANNEL POLICY:
- a.inform-only: eligible [email, in-app] — preferredWhen: used when the condition is not the holder's to resolve; carries no call to action by design; fallback: [same-role-other-channel]; urgency: normal; requiresPermission: false; requiresContactability: true
- a.notify: eligible [email, in-app] — preferredWhen: used when the holder can resolve the condition and a permitted route exists (gated by c.reachable); fallback: [same-role-other-channel]; urgency: normal; requiresPermission: false; requiresContactability: true
- a.confirm: eligible [email, in-app] — preferredWhen: sent on restoration, naming what was restored; carries no route by design (touch_no_destination, per migration review); fallback: [same-role-other-channel]; urgency: normal; requiresPermission: false; requiresContactability: true

SUPPRESSION / PREEMPTION:
- c.actionable's 'placed by a security response' branch (x.security-owned) explicitly defers to IDN-271, which is already telling the owner what happened and what is restricted; ACC-261 sends nothing in that case to avoid duplicating or contradicting the security alert. (conflicts with: IDN-271)

HANDOFF:
- h.unreachable -> CON-36; requiredContext: the restriction, its deadline and its release condition; which routes were tried and why each was closed; ownershipTransfer: true; suppressSource: true

OUTCOMES:
Primary: x.restored — restored and confirmed
Neutral: x.informed — informed, resolution not theirs to control; x.security-owned — restriction already announced by IDN-271; no separate notice sent
Failure: x.stands — restriction stands past its deadline; h.unreachable — notice undeliverable on any permitted route

TEST CASES:
- happy-path: the condition is resolvable by the holder and a permitted route exists -> a.notify -> condition met -> a.confirm -> x.restored
- alternate-branch: the condition depends on an internal review or a fixed period elapsing -> c.actionable routes to a.inform-only; no call to action attached
- alternate-branch: the restriction was placed by an IDN-271 security response -> c.actionable routes to x.security-owned; no separate notice sent
- timeout: the resolution deadline passes with the condition unmet -> w.resolve times out into c.outcome, resolving to x.stands
- contactability-loss: no permitted route survives the purpose and permission checks -> c.reachable routes to h.unreachable (CON-36)
- idempotency: a.notify is retried for the same account_id + restriction_id -> as documented, the idempotencyKey references person_id, a field absent from required attributes — must be corrected to account_id + restriction_id

GAPS:
- P0 [instance] a.inform-only/a.notify/a.confirm idempotencyKeys all include "person_id", a field absent from this journey's required attributes (account_id + restriction_id are the actual key).
- P1 [handoff] h.unreachable is the only exit node in this journey with no reEntry note (every other exit states what re-opens it); it is undefined whether a route CON-36 later repairs re-triggers a.notify for the same restriction_id or the notice is simply lost.

---

---

## ACC-263 — Activation Reminder

READINESS: NEEDS_CONTRACT_WORK

WHY:
The graph correctly distinguishes a first-time grant from a repeat/renewal (no re-onboarding a familiar holder) and keeps lapsed-unclaimed distinct from revoked-before-use as different facts. The blocker is that a.ready/a.brief/a.remind idempotencyKeys reference "issue_id" and "identity_id", neither of which this journey declares — the actual key is entitlement_id + holder_id.

INSTANCE:
Scope: the issued entitlement or credential and its activation window
Key: entitlement_id + holder_id
Dedupe policy: reject-duplicate
Concurrency note: One issuance, one window; a reissued credential is a new instance and does not inherit the old window.

EVENTS:
Canonical event: entitlement_provisioned_and_reachable (source: authoritative)
Required evidence: an entitlement or credential authoritatively granted to a named holder; confirmation that it is provisioned and reachable by that holder; an activation window or expiry
Insufficient alone: an eligibility decision with no provisioning behind it; a grant whose resource is not yet reachable

DATA:
- entitlement_id — instance key (idempotencyKeys incorrectly reference issue_id/identity_id instead — see gaps)
- holder_id — instance key
- provisioned_at — audit trail
- activation_window_ends_at — w.first-use / w.last-chance timeout binding
- first_action — a.ready / a.remind — the single named action
- prior_familiarity — c.first-time

SOURCE OF TRUTH:
- whether the holder has used this capability before -> capability usage history log [engagement is evidence-only]
- whether first use was recorded inside the window -> product usage/telemetry system recording an authoritative first-use event (capability_first_used) [engagement is evidence-only]

CONFIG:
- entitlement_activation.touches — touch budget for the plan (2: one notice, one reminder) (basis: business policy, required: false)
- entitlement_activation.cooldown — cooldown between instances (none — per issuance) (basis: business policy, required: false)
- entitlement_activation.first_use — the point before the window closes at which the single reminder is placed (basis: expected user rhythm, timingClass: reminder-before-attribute, required: true)
- entitlement_activation.last_chance — after the reminder, the wait runs to the window's own end with no second reminder (basis: expected user rhythm, timingClass: attribute-bound, required: true)

CHANNEL POLICY:
- a.ready: eligible [email, in-app] — preferredWhen: used for a holder's first entitlement of this kind; names one action; fallback: [same-role-other-channel]; urgency: low; requiresPermission: false; requiresContactability: true
- a.brief: eligible [email, in-app] — preferredWhen: used when the holder has used this capability before; names only what changed; fallback: [same-role-other-channel]; urgency: low; requiresPermission: false; requiresContactability: true
- a.remind: eligible [email, in-app] — preferredWhen: the single reminder, naming the deadline and the same first action; fallback: [same-role-other-channel]; urgency: normal; requiresPermission: false; requiresContactability: true

SUPPRESSION / PREEMPTION:
none identified

HANDOFF:
none

OUTCOMES:
Primary: x.activated — capability first used inside the window
Neutral: x.moot — entitlement withdrawn or replaced before any use
Failure: x.lapsed — window closed unclaimed

TEST CASES:
- happy-path: a first-time entitlement is granted and used inside the window -> a.ready -> w.first-use -> capability_first_used -> x.activated
- alternate-branch: the holder has used this capability before (renewal/additional seat) -> c.first-time routes to a.brief instead of a.ready
- timeout: no use is recorded before the reminder point -> c.remind fires a.remind if time remains, else routes straight to x.lapsed
- timeout: no use is recorded after the single reminder -> w.last-chance times out to x.lapsed; there is no second reminder
- idempotency: a.ready is retried for the same entitlement_id + holder_id -> as documented, the idempotencyKey references issue_id + identity_id, neither of which this journey declares — must be corrected to entitlement_id + holder_id

GAPS:
- P0 [instance] a.ready/a.brief/a.remind idempotencyKeys all reference "issue_id + identity_id", neither of which appears in this journey's required attributes; entitlement_id + holder_id is the actual instance key.

---

## ACQ-04 — High-Intent Lead Routing

READINESS: READY_WITH_MAPPING

WHY:
A pure router: dedup an existing opportunity, decide human-judgement-required vs automated continuation, and hand off either way. Both exits are handoffs to unnamed internal systems (`external:human-in-the-loop-lifecycle`, `external:automated-continuation`), which is by design (reviewed, Gate 4) — the journey owns no outcome of its own. The only real implementation work is mapping the trigger event, the "needs human judgement" heuristic, and the two external handoff targets to real systems.

INSTANCE:
scope: lead, opportunity or account. key: [lead_id]. dedupe: supersede-open (a second high-intent action against an open opportunity updates it rather than opening a rival one — the `a.resolve` node is the entity work). concurrency: one-active-per-key.

EVENTS:
- canonicalEvent: high_intent_commercial_action, sourceType: declared. requiredEvidence: a pricing request, an enterprise contact request, a completed quote, a sales-qualified submission, or a high-value application. insufficientEvidence: viewing a pricing page without requesting anything; opening a sales email.

DATA:
- lead_id — required, usedBy: instance key / dedup
- account_id — required, usedBy: dedup, ownership
- commercial_entity_link — required, usedBy: a.resolve (dedup write)
- opportunity — required, usedBy: a.assign (create/update commercial entity)
- ownership_history — required, usedBy: a.assign (append trail of who held it)
- destination_reached — required, usedBy: c.converted (already-there check)

SOURCE OF TRUTH:
- "has this account already reached the destination" -> the system of record for the destination entity (opportunity/customer state), engagementIsEvidenceOnly: true (an open/click never counts; only a recorded destination state does — the graph checks "the system of record shows the destination state already reached")
- "does this need human judgement" -> internal policy read at a.context-equivalent (value, complexity, contract terms, or the request itself), not a system of record per se — a business rule, not an authoritative event

CONFIG:
- key: high_intent.touches, meaning: touch budget per instance, basis: business policy, required: false (default 1)
- key: high_intent.cooldown, meaning: cooldown between high-intent actions, basis: business policy, required: false (default: none)

CHANNEL POLICY:
- a.assign: eligible [sales, task], preferredWhen: "next step needs a person's judgement", fallback: same-role-other-channel, urgency: normal, requiresPermission: false (internal/human action, not customer communication), requiresContactability: false. Both channels sit under one "human" role and are used together (assign owner + raise task) rather than selected between — no customer-facing channel ambiguity exists here.

SUPPRESSION / PREEMPTION:
- Destination reached for this entity while the journey is in flight: ACQ-08 takes ownership and remaining steps are suppressed (s.p1 / preemptedBy).
- An already-converted account never receives acquisition communication regardless of intent signal (s.g3).

HANDOFF:
- h.reached -> ACQ-08. requiredContext: the existing destination entity; the late-arriving action (kept as signal). ownershipTransfer: true. suppressSource: true (this journey's remaining steps stop).
- h.human -> external:human-in-the-loop-lifecycle. requiredContext: account_id, lead_id, handed_at, reason, the opportunity + assigned owner, the evidence of intent, an SLA for first response. ownershipTransfer: true. suppressSource: true (automated commercial follow-up on this entity is suppressed while a person holds it).
- h.automated -> external:automated-continuation. requiredContext: account_id, lead_id, handed_at, reason, the request and its context, the resolved account link. ownershipTransfer: true. suppressSource: false (not stated).

OUTCOMES:
primary: none (journey owns no business outcome — measured only as handoff distribution, per reviewed router_journey pattern)
secondary: none
neutral: none
failure: none
diagnostic: none (no engagement signals appear anywhere in this graph)

TEST CASES:
- happy-path: given a completed quote submission with no open opportunity -> expect a.resolve creates the entity, c.human routes to a.assign or h.automated depending on judgement need.
- duplicate-trigger: given a second high-intent action against an already-open opportunity -> expect a.resolve updates the existing opportunity, no second opportunity created.
- late-event: given the high-intent action arrives after the destination state was already reached -> expect c.converted routes to h.reached (ACQ-08), no new commercial entity created.
- human-ownership: given c.human resolves to "human judgement required" -> expect a.assign runs, ownership_history appended, h.human carries an SLA the receiving lifecycle must enforce.
- idempotency: given a.assign fires twice for the same account_id+lead_id -> expect the idempotencyKey `account_id + lead_id + a.assign` prevents a duplicate task/owner assignment.

GAPS:
- P1 (data): "does this need human judgement" (c.human) is a business-rule condition with no config key attached (value/complexity/contract-terms thresholds are named in prose only) — a team must define this rule but no ConfigRef anchors it, unlike the touch/cooldown keys which are explicit.
- P2 (handoff): h.automated does not state `suppressSource` the way h.human does — worth an explicit statement that automated continuation also suppresses further ACQ-04 activity on the entity, even though it is likely implied.

---

---

## ACQ-09 — Lead Nurture

READINESS: READY_WITH_MAPPING

WHY:
Graph is a clean bounded-window nurture with an honest guardrail against engagement-as-progress (s.g2, windowExtendsOnEngagement: false). The one implementation ambiguity is that the single action node `a.educate` is declared usable under two channel roles (persistent/email and in-session/in-app) whose "when" conditions can both be true at once, with no rule for which one wins on a given send.

INSTANCE:
scope: lead or person, held against the entry reason. key: [lead_id]. dedupe: reject-duplicate (eligibility requires "no instance of this journey is already open for the lead or person"). concurrency: one-active-per-key.

EVENTS:
- canonicalEvent: valid_lead_not_destination_ready, sourceType: declared. requiredEvidence: a captured lead with a recorded entry reason and no destination it is ready for. insufficientEvidence: a lead that is ready for a destination and simply not yet routed (ACQ-04's case); a submission with no permission for ongoing contact recorded against it.

DATA:
- lead_id — required, usedBy: instance key
- person_id — required, usedBy: identity resolution
- entry_reason — required, usedBy: a.educate (matches education to the reason they entered)
- permission_position — required, usedBy: c.basis (lawful-basis gate)
- window_ends_at — required, usedBy: w.window timeout
- nurture_history — required, usedBy: a.sunset (append record of window closing)

SOURCE OF TRUTH:
- "is there explicit permission and a lawful basis" -> the permission/consent record, engagementIsEvidenceOnly: true (capture/submission is explicitly NOT treated as consent — s.g4, "the capture is not the consent")
- "did they progress" -> nurture_progression_signal, engagementIsEvidenceOnly: true (s.g2: "opening the emails is not progress toward the destination" — the guardrail is already enforced in the graph: the wait's `until` list is progression/permission-withdrawn/contactability-lost, never an open or click)

CONFIG:
- key: bounded_education.touches, meaning: number of educational touches inside the window, basis: business policy, required: true
- key: bounded_education.cooldown, meaning: cooldown between instances for the same lead, basis: business policy, required: true, timingClass: cooldown
- key: bounded_education.window, meaning: length of the bounded nurture window, basis: business policy, required: true, timingClass: observation-window

CHANNEL POLICY:
- a.educate: eligible [email, in-app], preferredWhen: ambiguous — "email" is described as for when "the message has to be kept and survive until the person can act on it" and "in-app" for "the person is active in the product and the action is taken there"; both conditions can hold simultaneously for the same send, urgency: low, requiresPermission: true, requiresContactability: true, fallback: same-role-other-channel.

SUPPRESSION / PREEMPTION:
- none identified beyond the journey's own permission/contactability exits (no named cross-journey conflict; ACQ-07 is explicitly distinguished, not suppressed).

HANDOFF:
- h.progressed -> ACQ-03. requiredContext: the entry reason and what education was already sent, the progression signal itself. ownershipTransfer: true. suppressSource: not stated explicitly (implied by exit-or-handoff journeyOutcome shape).

OUTCOMES:
primary: [nurture_progression_signal] (businessOutcome, comparison: pre-post)
secondary: none declared
neutral: [x.no-basis — held pending permission]
failure: [x.permission-ended, x.unreachable]
diagnostic: none named, but any open/click telemetry on a.educate belongs only here, never in primary/secondary — the graph does not violate this.

TEST CASES:
- happy-path: given a lead with a recorded entry reason and valid permission -> expect a.educate sends once, w.window observes for progression within the fixed window.
- timeout: given no progression signal before window close -> expect a.sunset fires, x.sunset records "closed without progression" as a fact, not a judgement.
- late-event: given permission is withdrawn mid-window -> expect a.stop-permission invalidates queued nurture and appends the reason before x.permission-ended.
- contactability-loss: given the only permitted destination becomes undeliverable mid-window -> expect a.stop-contactability exits to x.unreachable without recording it as disengagement.
- permission-loss: given no basis exists at entry (c.basis "No basis") -> expect x.no-basis (held, not started) and re-entry only on a later, real permission grant.

GAPS:
- P1 (channel): a.educate's channelRoles list two roles (persistent, in-session) whose "when" conditions are not mutually exclusive and no precedence is stated — an implementer must invent which channel wins when both apply, which the corpus's own contract format is meant to prevent.
- P2 (config): bounded_education.touches has no numeric default (required:true, no example value) unlike most other journeys' touch budgets — reasonable given "required", but worth flagging since it's the only touch-count config in this batch with zero guidance, not even a low-confidence example.

---

---

## ACQ-11 — Abandoned Process Recovery

READINESS: READY_WITH_MAPPING

WHY:
The most fully specified journey in this batch: explicit per-touch channel roles with concrete "when" conditions, a persistent per-person holdout requirement for measurement, four ready-made presets (checkout/quote/application/registration) with their own config overrides, and an explicit payment-failure handoff boundary against FIN-134. Implementation is almost entirely mapping company events/config; no structural ambiguity was found.

INSTANCE:
scope: the logical process (basket-and-checkout, application, quote, registration) — not the platform's own process id. key: [person_id, logical_process_id]. dedupe: supersede-open (a new logical process for the same person supersedes the open instance, per s.supersession) — concurrencyNote: a company whose processes are genuinely independent (marketplace, multi-buyer B2B account) may instead set concurrency to allow-concurrent and rely on the person-level pressure cap.

EVENTS:
- canonicalEvent: process_started, sourceType: authoritative. requiredEvidence: an authoritative record that a resumable process opened for this person, at least one item, a resumable state and resume destination, the time of last activity. insufficientEvidence: a cart page view; an item added without entering the process (ACQ-12's subject); a process with no items; a process already completed/cancelled/expired.

DATA:
- logical_process_id — required, usedBy: instance key, idempotency
- person_id — required, usedBy: instance key, identity resolution
- items — required, usedBy: a.touch1/a.touch2 content
- started_at — required, usedBy: process metadata
- last_activity_at — required, usedBy: w.abandon / w.resumed timeout anchor
- resume_destination — required, usedBy: every touch's destination link
- expires_at — optional, usedBy: w.close timeout, c.final-enabled
- value/currency/category — optional, usedBy: personalization
- has_active_app_session — optional, usedBy: low-friction channel eligibility
- hold_expires_at / delivery_cutoff_at — optional, usedBy: urgent-channel eligibility (t3 "asserted time-bound element")

SOURCE OF TRUTH:
- "what is the process now" (c.state/c.state2/c.state3) -> the process system of record, engagementIsEvidenceOnly: true — every touch re-reads the process before acting (s.completed: "every touch re-reads the process first"); opens/clicks never move c.state.
- payment failure -> FIN-134's system of record for the obligation, engagementIsEvidenceOnly: n/a (authoritative event, not engagement)

CONFIG:
- recovery.first_check (recovery-window, example only, min 30m/max 60m, basis: expected user rhythm) — required: false
- recovery.second_check (recovery-window, example only, min 20h/max 28h) — required: false
- recovery.lifetime (recovery-window, example only, min 3d/max 7d) — required: false
- recovery.process_expiry (attribute-bound to platform's own expires_at, high confidence) — required: false
- recovery.resume_rearms (attemptBudget, corpus-rule default 1) — required: false
- recovery.touches (local cap, corpus-rule default 3) — required: false
- recovery.cooldown (cooldown, example-only, 7-30 days) — required: false
- recovery.holdout_share (measurement holdout, example-only, 10%) — required: false
- recovery.incentive_policy (optional strategy — off by default) — required: false

CHANNEL POLICY:
- a.touch1 (t1): eligible [push, in-app, email], preferredWhen: "an app session or valid push token exists — intent is minutes old", fallback: [email persistent] when no low-friction route exists or the touch must carry items and survive, urgency: normal, requiresPermission: true, requiresContactability: true.
- a.touch2 (t2): eligible [email, push, in-app], preferredWhen: same low-friction-first logic, urgency: normal, requiresPermission: true, requiresContactability: true.
- a.touch3 (t3): eligible [email, sms], preferredWhen: "explicit commercial SMS permission exists AND the process carries an asserted time-bound element (expiry/hold/delivery cutoff)" — otherwise falls back to email-only, urgency: high (final notice, real expiry), requiresPermission: true (SMS specifically requires explicit commercial SMS permission, stricter than the base permission), requiresContactability: true.

SUPPRESSION / PREEMPTION:
- s.payment: a payment failure hands the instance to FIN-134; the two never message the same person about the same process (real, named conflict).
- s.contest: an open retention-outreach journey, complaint, or payment recovery on the same account outranks this journey (GLB-06) — its touch is deferred and re-evaluated, not queued blindly.
- s.superseded / entity supersession: a newer logical process for the same person supersedes this instance.
- competition group "commerce-recovery": this journey is highest precedence in the group (above ACQ-12, ACQ-13) — a process in motion outranks a held selection or inferred interest for the same person.

HANDOFF:
- h.payment -> FIN-134. requiredContext: logical_process_id, person_id, obligation_id, failed_at, the logical process and its items, the obligation the failed attempt was against. ownershipTransfer: true. suppressSource: true (every queued recovery touch for this process is suppressed).

OUTCOMES:
primary: [process_completed] (businessOutcome, persistent-holdout comparison — explicitly required because people complete abandoned processes on their own often enough that treated-only measurement is misleading)
secondary: [process_resumed]
neutral: [x.invalid, x.no-action]
failure: [x.lapsed]
diagnostic: none named as such, but opens/clicks are explicitly excluded from moving any state ("Opens and clicks are engagement evidence and change nothing").

TEST CASES:
- happy-path: given a checkout with items abandoned for the first-check interval -> expect a.touch1 fires on the preferred channel per app-session/token availability, then w.second observes.
- alternate-branch: given the person resumes and leaves again between t1 and t2 -> expect a.note-return re-arms the wait once (bounded attemptBudget) before falling through to c.sendable2.
- timeout: given the process is still open and unresumed at the second-check timeout -> expect c.sendable2 evaluates and a.touch2 fires if sendable.
- late-event: given a payment failure is recorded on the process after t1 sent -> expect c.state routes to h.payment, all queued touches suppressed, FIN-134 owns the person for this process.
- superseding-state: given a second logical process opens for the same person while the first instance is still active -> expect s.supersession closes the first instance as x.superseded and the newer process opens its own instance.
- idempotency: given a.touch1 is triggered twice due to a retry -> expect idempotencyKey `logical_process_id + touch id` prevents a duplicate send.

GAPS:
- P2 (config): recovery.first_check example values differ meaningfully by preset (30-60min default vs 1-4h for registration, 4-24h for quote/application) — already handled via preset overrides, so this is documentation-clean, not a real gap; noted only because a company skipping the presets and using the base journey directly must remember to re-derive the interval per process type.

---

---

## ACQ-12 — Abandoned Selection Recovery

READINESS: READY_WITH_MAPPING

WHY:
Structurally a near-twin of ACQ-11 with the same rigor: explicit channel roles per touch, a persistent holdout requirement, and an explicit handoff boundary the moment a selection becomes a process (to ACQ-11). No structural ambiguity found; the only difference from ACQ-11 is the deliberate absence of a final/expiry touch, which is itself a documented design choice ("no honest deadline to name").

INSTANCE:
scope: the recorded selection (cart, basket, saved list) — has no process state and no expiry of its own. key: [person_id, selection_id]. dedupe: supersede-open — concurrencyNote: a process started from the selection supersedes this instance outright (hands to ACQ-11), which is a handoff-driven supersession rather than a simple newer-instance rule.

EVENTS:
- canonicalEvent: selection_recorded, sourceType: authoritative. requiredEvidence: an authoritative record that items were placed in a selection, current availability/price as the platform asserts them, time of last activity. insufficientEvidence: a product view (ACQ-13's subject); an item added and removed inside the same session; a selection already carried into a process (ACQ-11's subject); a selection whose every item is unavailable.

DATA:
- selection_id — required, usedBy: instance key, idempotency
- person_id — required, usedBy: instance key
- items — required, usedBy: touch content
- last_selection_activity_at — required, usedBy: w.settle timeout anchor
- resume_destination — required, usedBy: touch links
- value/currency/category — optional, usedBy: personalization
- has_active_app_session — optional, usedBy: low-friction eligibility
- item_availability / item_prices — optional, usedBy: c.availability, touch content ("any genuine change")

SOURCE OF TRUTH:
- "what is the selection now" (c.state/c.state2/c.state3) -> the selection/order/process system of record, engagementIsEvidenceOnly: true (re-read before every touch; "only selection, order and process events move the state").
- item availability/price -> the platform's own availability assertion (c.availability), never inferred.

CONFIG:
- selection.first_check (recovery-window, example, 1-4h default; overridden to 3-7d for saved-item-reminder preset) — required: false
- selection.second_check (recovery-window, example, 2-4d) — required: false
- selection.lifetime (recovery-window, example, 7-14d; overridden to 14-30d for saved-item-reminder) — required: false
- selection.change_rearms (attemptBudget, corpus-rule default 2) — required: false
- selection.touches (local cap, corpus-rule default 2) — required: false
- selection.cooldown (cooldown, example, 14-30d) — required: false
- selection.holdout_share (measurement holdout, example, 10%) — required: false
- selection.incentive_policy (optional strategy, off by default) — required: false

CHANNEL POLICY:
- a.touch1 (t1): eligible [push, in-app, email], preferredWhen: "an app session or valid push token exists — selection is recent", fallback: email when no low-friction route exists or items must be carried and survive, urgency: normal, requiresPermission: true, requiresContactability: true.
- a.touch2 (t2): eligible [email, push, in-app], same low-friction-first logic, urgency: normal, requiresPermission: true, requiresContactability: true.

SUPPRESSION / PREEMPTION:
- s.process / entity supersession: a process started from the selection hands the instance to ACQ-11 immediately, suppressing every queued touch here (real, named, and the highest-priority conflict in this journey).
- s.contest: a process recovery, open complaint, open payment recovery, or retention-outreach journey on the same person outranks this journey (GLB-06).
- competition group "commerce-recovery": below process recovery (ACQ-11), above interest recovery (ACQ-13) and predicted-need replenishment, for the same person.

HANDOFF:
- h.process -> ACQ-11. requiredContext: selection_id, person_id, logical_process_id, touches_sent, the selection and its items, the recovery touches already sent (so the process plan counts them against the person). ownershipTransfer: true. suppressSource: true (every queued recovery touch for this selection is suppressed).

OUTCOMES:
primary: [selection_converted] (businessOutcome, persistent-holdout comparison, same rationale as ACQ-11)
secondary: [process_started]
neutral: [x.invalid, x.no-action]
failure: [x.unavailable, x.lapsed]
diagnostic: none named; opens/clicks explicitly excluded from state.

TEST CASES:
- happy-path: given a cart with available items abandoned past the first-check interval -> expect a.touch1 fires on the preferred channel, w.second observes.
- alternate-branch: given the person adds/removes an item mid-wait (still ≥1 item held) -> expect a.rearm re-arms w.settle from the new activity, bounded by selection.change_rearms.
- contactability-loss / permission-loss: given no commercial recovery permission is recorded at c.eligible -> expect a.record-no-action records the gate and x.no-action closes without a send.
- late-event: given every selected item becomes unavailable between t1 and t2 -> expect c.state2 routes to x.unavailable rather than sending a touch about items that cannot be acted on.
- superseding-state: given the person starts a checkout from the selection -> expect c.state or c.state2 routes to h.process, ownership transfers to ACQ-11, this instance's queued touches suppressed.
- idempotency: given a.touch1 fires twice for the same selection due to a retry -> expect idempotencyKey `selection_id + touch id` prevents a duplicate send.

GAPS:
- P2 (documentation): no explicit final/expiry touch exists by design (unlike ACQ-11's t3) — this is a deliberate, well-justified omission ("there is no honest deadline to name"), noted here only so an implementer does not mistake it for a missed touch when comparing against ACQ-11's three-touch plan.

---

---

## ACQ-13 — Unresolved Interest Recovery

READINESS: READY_WITH_MAPPING

WHY:
Lowest-pressure, lowest-priority member of the commerce-recovery trio (ACQ-11 > ACQ-12 > ACQ-13), with a qualification gate standing between every behavioral signal and any instance, and no-action explicitly named as the most common outcome. The graph is fully specified; the qualification rule itself (`interest.qualification_rule`) is company policy to define, which is expected and already surfaced as a config reference.

INSTANCE:
scope: an inferred interest — a person's repeated, recent, attributed attention to one item, category or search that ended in neither a selection nor a process. key: [person_id, interest_key]. dedupe: reject-duplicate (one instance per person+interest key; a new key is a new interest) — concurrencyNote: a selection or process for the same items supersedes the interest instance (hands ownership implicitly to the selection/process's own journey, closing this one as resolved — though note this is stated in the entity supersession note, not wired to an explicit handoff node; see gaps).

EVENTS:
- canonicalEvent: interest_signal_recorded, sourceType: behavioral. requiredEvidence: attributed attention to one item/category/search with timestamps; the qualification rule's inputs (how often, how recently, whether a selection/process followed); the subject's current availability. insufficientEvidence: a single page view; attention inside a session that ended in a selection or process (owned elsewhere); an unattributed/automated session; attention to something already held.

DATA:
- person_id — required, usedBy: instance key
- interest_key — required, usedBy: instance key
- subject_type / subject_ref — required, usedBy: touch content, destination
- last_interest_at — required, usedBy: w.settle timeout anchor
- attention_count — required, usedBy: qualification rule input
- resume_destination — required, usedBy: touch link
- category — optional, usedBy: personalization
- has_active_app_session — optional, usedBy: low-friction eligibility
- subject_availability — optional, usedBy: c.state
- query_text — optional, usedBy: search-abandonment preset content

SOURCE OF TRUTH:
- "does this attention qualify" -> the company's qualification_rule evaluated against attention history, engagementIsEvidenceOnly: n/a (this is the behavioral signal itself, gated before any instance opens — not conflated with a business outcome).
- "is it still unresolved" -> selection/order/process records, engagementIsEvidenceOnly: true (a resolved state is only ever a real selection/order/process, never an open of the recovery touch).

CONFIG:
- interest.qualification_rule (no explicit ConfigRef block in the journey object beyond the eligibility-list mention — see gaps) — basis: business policy, required: true (implied)
- interest.settle_window (recovery-window, example, 12-48h; overridden per preset) — required: false
- interest.lifetime (observation-window, example, 3-7d) — required: false
- interest.touches (local cap, corpus-rule default 1) — required: false
- interest.cooldown (cooldown, example, 14-30d) — required: false
- interest.holdout_share (measurement holdout, example, 10%) — required: false

CHANNEL POLICY:
- a.touch1 (t1): eligible [push, in-app, email], preferredWhen: "an app session or valid push token exists — attention is recent", fallback: email when no low-friction route exists or the thing looked at must survive, urgency: low, requiresPermission: true, requiresContactability: true.

SUPPRESSION / PREEMPTION:
- s.contest: this journey is lowest-precedence in the commerce-recovery group — a process recovery, held selection, or predicted-need replenishment on the same person outranks it, as does any open complaint, payment recovery or retention-outreach journey (GLB-06).
- entity supersession: a selection or process for the same items supersedes the interest instance.

HANDOFF:
none. (journeyOutcome.type is "exit", not "exit-or-handoff" — this journey resolves entirely through exits, and the "resolved" state is read as a fact, not routed as a handoff to another journey's ownership. This absence is structural, not a gap.)

OUTCOMES:
primary: [purchase_completed] (businessOutcome, persistent-holdout comparison — explicitly required because people who browse buy on their own far more often than a touch changes)
secondary: [selection_recorded, process_started]
neutral: [x.no-action]
failure: [x.unavailable, x.lapsed]
diagnostic: none named; opens/clicks are never state-moving anywhere in this graph.

TEST CASES:
- happy-path: given attention that meets the qualification rule and no prior resolution -> expect a.open starts the clock, w.settle observes, a.touch1 fires once if still unresolved and sendable.
- alternate-branch: given the qualification rule is not met -> expect a.record-no-action records the reason and x.no-action closes without ever opening an instance's clock beyond the record.
- late-event: given a selection is recorded for the subject during w.settle -> expect immediate exit to x.resolved via the onEvent path, no touch sent.
- contactability-loss / permission-loss: given permission for commercial recovery is absent at c.qualify -> expect routing to a.record-no-action / x.no-action.
- timeout: given the one touch fires and nothing resolves within interest.lifetime -> expect w.after times out to x.lapsed.
- idempotency: given a.touch1 fires twice due to retry -> expect idempotencyKey `person_id + interest_key + touch id` prevents duplicate sends.

GAPS:
- P1 (config): `interest.qualification_rule` is referenced by name in the eligibility list and suppression text but carries no explicit config block in `implementation.attributes` or a dedicated wait/timeout structure the way other keys do — a company must define "repeated, recent, and on something the person could act on" with real thresholds, and the journey gives no structural anchor (no required field, no ConfigRef-shaped entry) for where that rule lives, unlike e.g. `bounded_education.touches` which is explicitly required with a rule string. This is the single most consequential judgment call in the journey (it gates whether any instance opens at all) and deserves the same explicit config treatment the touch/cooldown/window keys get.
- P2 (canonical-graph): the entity supersession note ("a selection or process for the same items supersedes the interest") is not wired to a handoff node the way ACQ-12's process supersession is (h.process); it resolves only via the c.state/c.state2/c.state3 "Resolved meanwhile" branch reaching x.resolved, which is a plain exit, not a handoff. This is consistent with the journey's own no-handoff design (see HANDOFF above) so it is not a defect, but worth noting since ACQ-11/ACQ-12 model the analogous transition as a handoff and ACQ-13 models it as an exit.

---

---

## ACQ-285 — New Lead Welcome

READINESS: READY_WITH_MAPPING

WHY:
A clean notice-then-confirm graph separating "what was declared" (a person vs material) from "what permission covers" (fulfilment-only vs continuing nurture), with the corpus's own guardrail against silently mixing the two (s.g2). The single-channel design (email only) removes channel-selection ambiguity entirely. Implementation is mapping the declared-request classification and the bounded-sequence length.

INSTANCE:
scope: the individual capture and what it asked for, resolved onto a person. key: [capture_id]. dedupe: reject-duplicate (one capture, one destination; a second different request is its own instance). concurrency: one-active-per-key.

EVENTS:
- canonicalEvent: first_party_interest_captured, sourceType: declared. requiredEvidence: a first-party capture with the declared context, a contact point given in that capture, the permission position recorded as its own fact separate from the submission. insufficientEvidence: a session or page view with no declaration; a contact point obtained from a third party; a submitted form read as permission because it was submitted.

DATA:
- capture_id — required, usedBy: instance key
- person_id — required, usedBy: identity
- declared_request — required, usedBy: c.declared classification (person vs material)
- contact_point — required, usedBy: c.email-route
- permission_position — required, usedBy: c.permission (continuation gate)
- sequence_length — required, usedBy: w.nurture timeout ("captured_interest.nurture")

SOURCE OF TRUTH:
- "is the destination usable" -> deliverability/permission check on the supplied contact point (c.email-route), authoritative.
- "is there permission to continue past fulfilment" -> the permission record, engagementIsEvidenceOnly: true — s.g2 explicitly separates "the submission and the permission" as two facts, only one of which may have happened; fulfilment travels on the request, everything past it travels on permission, and the two "must not be posted together."

CONFIG:
- captured_interest.touches (local cap, corpus-rule default 3, high confidence) — required: false
- captured_interest.cooldown (default: none, high confidence — fulfilment is per capture) — required: false
- captured_interest.nurture (observation-window, "the stated length of the bounded sequence") — required: true, no default given (must be set at open time per s.g4: "a bounded sequence states its end when it opens")

CHANNEL POLICY:
single channel, no policy needed — all three touches (t1 first-touch, t2 deliver, t3 nurture) use only the "persistent" role mapped to email; no selection logic is required since there is exactly one eligible channel throughout.

SUPPRESSION / PREEMPTION:
none identified — contact.competition is explicitly "none," and no cross-journey conflict is named beyond the general distinction from ACQ-02 (which decides the destination, not fulfills it).

HANDOFF:
- h.person -> external:sales-assignment. requiredContext: person_id, handed_at, reason, what the person declared and asked for in their own terms, what was already sent and when, the permission facts recorded and what they do/don't cover. ownershipTransfer: true. suppressSource: not stated explicitly (implied — no further automated touches make sense once a person owns the request).

OUTCOMES:
primary: none named as businessOutcome.primary in the schema sense — the declared businessOutcome event is destination_declared (pre-post comparison), which is the appropriate primary.
secondary: none declared
neutral: [x.delivered — fulfilled, no continuing contact permitted]
failure: [x.no-delivery-route]
diagnostic: none named.

TEST CASES:
- happy-path: given a capture asking for material with a valid deliverable destination -> expect a.deliver sends once, then c.permission gates whether a.nurture opens.
- alternate-branch: given a capture asking for a person (not material) -> expect a.first-touch sends and names a follow-up time, then hands directly to h.person.
- permission-loss: given fulfilment-only permission (no continuation) -> expect x.delivered exit, no nurture sequence opened.
- contactability-loss: given no valid deliverable destination and the request was for material -> expect x.no-delivery-route (failure), re-entry only when a valid destination is supplied later.
- timeout: given a.nurture opens and captured_interest.nurture elapses with no destination declared -> expect x.sunset (sequence ended, no destination).
- idempotency: given a.deliver is triggered twice for the same person_id -> expect idempotencyKey `person_id + a.deliver` prevents a duplicate send.

GAPS:
- P2 (documentation): entity.note contains a grammatical artifact ("the the individual capture and what it asked for") propagated into eligibility and w.nurture's `recheck` text — cosmetic, does not affect implementation, but worth a corpus cleanup pass since it appears twice.

---

---

## ACT-11 — Onboarding Route Assignment

READINESS: READY_WITH_MAPPING

WHY:
Reviewed and confirmed as a pure human-only router (Gate 4): both terminal branches are handoffs (to ACT-13 when blocked, to ACT-12 when clear), and it owns no outcome of its own — consistent with the corpus's router_journey pattern used elsewhere in this batch (ACQ-04, ACT-17). The only judgment call is "does reaching value here require assisted onboarding," which is a business rule read from context rather than a fixed threshold.

INSTANCE:
scope: person, account, subscription or trial — the thing that was entered. key: [account_id, onboarding_instance_id]. dedupe: reject-duplicate (one entry, one route; a second subscription on the same account is a second instance with its own route). concurrency: one-active-per-key.

EVENTS:
- canonicalEvent: authoritative_lifecycle_entry, sourceType: authoritative. requiredEvidence: a recorded entry — account created, trial started, subscription started, or customer onboarding started. insufficientEvidence: a signup form submitted but not completed; an invitation sent but not accepted.

DATA:
- account_id — required, usedBy: instance key
- onboarding_instance_id — required, usedBy: instance key
- onboarding_context — required, usedBy: c.assisted decision (declared goal, role, product/use-case, setup complexity, account type, implementation requirement, stated need for assistance)
- onboarding_route — required, usedBy: h.progress/h.requirement carry (route is "a property of the onboarding, carried into every step that follows")
- setup_required — required, usedBy: c.prerequisite gate

SOURCE OF TRUTH:
- "does reaching value require assisted onboarding" -> internal onboarding_context read (a.context), engagementIsEvidenceOnly: n/a — explicitly NOT plan tier or account value (s.g1, s.g2: "plan tier is not onboarding complexity," "a high-value account does not automatically get human assistance").
- "is a critical prerequisite missing" -> the setup/prerequisite record (c.prerequisite), authoritative — "something named and mandatory," never "incomplete optional fields."

CONFIG:
- onboarding_route.touches (local cap, corpus-rule default 1) — required: false
- onboarding_route.cooldown (default: none, high confidence — per onboarding instance) — required: false

CHANNEL POLICY:
- a.assisted: eligible [task], role "human" — "the step is carried out by a person... and recorded as done by them." This is the only action node in the graph with `channelRoles`; a.self-service and the two conditions are internal state writes, not customer communication, so no further channel selection logic is needed. Single channel, minimal policy.

SUPPRESSION / PREEMPTION:
none identified (contact.competition: none; no named cross-journey conflict beyond the two downstream handoffs, which are routing, not suppression).

HANDOFF:
- h.requirement -> ACT-13. requiredContext: the named requirement (not a general sense setup is unfinished), the chosen route, the onboarding context already gathered. ownershipTransfer: true. suppressSource: not explicit but implied (ACT-13 becomes the owner of the blocker).
- h.progress -> ACT-12. requiredContext: the chosen route and why, the onboarding context (so the first step doesn't re-ask what's known). ownershipTransfer: true. suppressSource: not explicit but implied.

OUTCOMES:
primary: none (pure router — journeyOutcome.type is "handoff," reviewed and confirmed as owning no outcome of its own)
secondary: none
neutral: none
failure: none
diagnostic: none

TEST CASES:
- happy-path: given a new trial start with self-serve-complete setup -> expect a.self-service records the route, c.prerequisite finds nothing blocking, h.progress hands to ACT-12.
- alternate-branch: given setup genuinely needs a person (implementation/migration) -> expect a.assisted records the route and raises the internal task with a human owner, then c.prerequisite is still evaluated afterward.
- human-ownership: given a.assisted fires -> expect the raised task carries a human owner of record before any handoff occurs.
- late-event: given a mandatory prerequisite (verification, access grant) is missing regardless of chosen route -> expect c.prerequisite routes to h.requirement (ACT-13), not h.progress, even on the self-service route.
- idempotency: given a.assisted or a.self-service fires twice for the same subscription_id+account_id -> expect the idempotencyKey prevents a duplicate route write.

GAPS:
- none

---

---

## ACT-12 — Onboarding Nurture

READINESS: NEEDS_CONTRACT_WORK

WHY:
The graph itself (progress -> next step -> activation-or-blocker-or-window-close) is sound and the guardrail against re-suggesting completed steps is real (s.done-step, re-reads the milestone record every touch). The contract gap is coordination: the journey's own `preemptedBy` documents that ACT-14 booking an assisted session should pause ACT-12's generic prompts, but nothing in `orchestration.noAction` or the graph's suppression nodes actually implements that pause — it exists only as prose, leaving "does a booked ACT-14 session suppress ACT-12" to be inferred by an implementer rather than stated as an enforceable rule.

INSTANCE:
scope: person or account plus the onboarding instance. key: [account_id, onboarding_instance_id]. dedupe: reject-duplicate (no nurture instance already open for this onboarding instance). concurrency: one-active-per-key.

EVENTS:
- canonicalEvent: onboarding_active_without_activation, sourceType: authoritative. requiredEvidence: an onboarding instance that is open and an activation event that has not been recorded. insufficientEvidence: a completed sign-up with no onboarding instance opened; activity inside a different product's onboarding.

DATA:
- account_id — required, usedBy: instance key
- onboarding_instance_id — required, usedBy: instance key
- milestones — required, usedBy: a.read (setup milestone record)
- critical_steps — required, usedBy: c.next-step
- window_ends_at — required, usedBy: c.window
- has_active_session — optional, usedBy: in-session channel eligibility
- blocker_candidate — optional, usedBy: c.stalled-step

SOURCE OF TRUTH:
- "which steps are complete" -> the product's own setup milestone record (a.read), engagementIsEvidenceOnly: true — explicitly "read from the product's own record of what was done rather than from what was sent or opened."
- "has activation actually been achieved" -> the authoritative activation event, engagementIsEvidenceOnly: true (c.ready distinguishes "setup complete" from "value not yet produced" — a finished checklist is explicitly not activation).
- "is the same prerequisite actually blocking" -> authoritative state on the prerequisite (c.stalled-step), not merely a quiet interval.

CONFIG:
- onboarding.step_prompts (local cap + attemptBudget, example-only default 5, low confidence, "an onboarding with a handful of critical steps") — required: false
- onboarding.cooldown (cooldown, example, 14-30d) — required: false
- onboarding.step_interval (observation-window, "the interval appropriate to the remaining work — a step that takes minutes and a step that needs an administrator cannot share it") — required: true, no numeric default (deliberately, since it varies per step)
- onboarding.holdout_share (measurement holdout, example, 10%) — required: false

CHANNEL POLICY:
- a.surface: eligible [in-app, email], preferredWhen: "the person is inside the product — the next step is best pointed at where it is taken" (in-session/in-app), fallback: email "no active session, or the step needs an explanation that survives until the person returns" (persistent). This is a clean either/or on session state, not an ambiguous overlap — usable as written.

SUPPRESSION / PREEMPTION:
- s.activated: the authoritative activation event supersedes this journey wherever it sits (real, enforced via h.activated/c.ready/c.what-happened).
- s.blocker: when one named mandatory prerequisite is established as the blocker, ACT-13 owns the account and nurture steps stop (real, enforced via h.blocker).
- s.contest: below the activation event and below any open issue under human ownership on the same account (GLB-06).
- documented-but-unwired: `preemptedBy` states an assisted setup session scheduled through ACT-14 pauses generic next-step prompts, but this is not represented as a suppression id in `orchestration.noAction`, nor as a graph node/condition — see GAPS.

HANDOFF:
- h.blocker -> ACT-13. requiredContext: the exact outstanding prerequisite and how long it has stayed unchanged, the onboarding route and milestones already completed. ownershipTransfer: true. suppressSource: true (generic next-step prompt for this prerequisite suppressed while ACT-13 owns it).
- h.activated -> ACT-16. requiredContext: which event satisfied activation, what onboarding still had outstanding (so the right things get invalidated). ownershipTransfer: true. suppressSource: implied (nurture stops on activation).

OUTCOMES:
primary: [activation_recorded] (businessOutcome, persistent-holdout comparison — accounts activate on their own often enough that treated-only measurement is misleading)
secondary: [setup_milestone_completed]
neutral: [x.window-closed]
failure: none named (window closing is a timeout/no-outcome state, not a hard failure — re-entry is normal)
diagnostic: none named; the guardrail list explicitly flags `completed_step_suggested` as a thing to watch for, which is itself diagnostic of a bug, not a success signal.

TEST CASES:
- happy-path: given an open onboarding instance with one incomplete critical milestone -> expect a.surface prompts it once, w.progress observes for completion or activation.
- alternate-branch: given every milestone is done but no activation event exists -> expect c.ready routes to w.progress (not a false activation), waiting on the real activation_recorded event.
- late-event: given a named mandatory prerequisite is established as blocking, unchanged over several intervals -> expect c.stalled-step routes to h.blocker (ACT-13), not another generic a.read/a.surface cycle.
- timeout: given the onboarding window expires with no activation -> expect c.window routes to x.window-closed, milestones preserved for a later re-entry.
- human-ownership: given ACT-14 has booked an assisted session for this same onboarding instance -> expect (per preemptedBy) generic next-step prompts to pause; this is a live gap since no suppression node currently enforces it (see GAPS).
- idempotency: given a.surface fires twice for the same onboarding_instance_id + step id -> expect the idempotencyKey prevents a duplicate step prompt.

GAPS:
- P1 (suppression): `preemptedBy` documents that an ACT-14 assisted-session booking should pause ACT-12's generic prompts, but no suppression id, graph node, or explicit config exists to enforce it — an implementer has no structural signal (only a human-readable footnote) telling them to check ACT-14 session state before firing a.surface. This is a real cross-journey coordination gap, not merely documentation, because two automated systems (ACT-12 and ACT-14) can otherwise message the same account about the same onboarding at once.
- P2 (config): onboarding.step_prompts default of 5 is explicitly low-confidence/example-only with no stated relationship to critical_steps count — a company with more than 5 critical steps could exhaust the budget before covering every step; worth noting the budget should probably scale with (or be validated against) critical_steps length.

---

---

## ACT-13 — Onboarding Blocker Reminder

READINESS: READY_WITH_MAPPING

WHY:
A precisely scoped, single-requirement journey with a real branch for self-resolvable vs. dependency-on-someone-else (reviewed, Gate 4: t1/t2 are the exclusive arms of c.self-resolvable, never both). Exit and handoff coverage is complete: resolved-and-clear, resolved-with-a-new-blocker, escalate, reroute, or genuinely stuck. Implementation is mapping the "self-resolvable" heuristic and the resolution-horizon config per requirement type.

INSTANCE:
scope: the blocking requirement, held against the account or onboarding instance. key: [account_id, requirement_id]. dedupe: reject-duplicate (one instance per requirement; two blockers are two instances since they may be resolved by different people at different times). concurrency: one-active-per-key.

EVENTS:
- canonicalEvent: activation_blocked_by_named_requirement, sourceType: authoritative. requiredEvidence: a specific unmet requirement — integration not connected, required configuration absent, verification incomplete, required person not yet present, mandatory setup step unfinished. insufficientEvidence: an incomplete optional field; a profile not filled in; a general sense that setup is unfinished.

DATA:
- account_id — required, usedBy: instance key
- requirement_id — required, usedBy: instance key
- blocking_requirement — required, usedBy: a.identify write, downstream messaging content
- resolution_horizon — required, usedBy: w.resolve timeout
- dependency_owner — required, usedBy: a.route-dependency (t2 destination)

SOURCE OF TRUTH:
- "does this requirement actually block activation" -> the activation/setup system of record (c.blocking), authoritative — distinguishes a real blocker from an incomplete-but-non-blocking field (x.not-blocking).
- "can the account resolve this directly" -> access/permission state on the account (c.self-resolvable), determines t1 (self-resolvable, communication to the account) vs t2 (route to dependency owner, human execution).
- "is the requirement now satisfied" -> named_requirement_satisfied event, engagementIsEvidenceOnly: n/a (a genuinely authoritative resolution event, re-read from the system of record before acting even on a timeout).

CONFIG:
- activation_blocker.touches (local cap, corpus-rule default 2) — required: false
- activation_blocker.cooldown (default: none, high confidence — per requirement) — required: false
- activation_blocker.resolve (observation-window, "the resolution horizon appropriate to this requirement — third-party vs settings-screen requirements do not deserve the same patience") — required: true, no numeric default (deliberately requirement-dependent)

CHANNEL POLICY:
- a.specific-action (t1, self-resolvable branch): eligible [email, in-app], preferredWhen: persistent "message has to be kept and survive," in-session "person active in the product and the action is taken there" — same either/or pattern as ACT-12, not ambiguous. urgency: normal, requiresPermission: true, requiresContactability: true.
- a.route-dependency (t2, not-self-resolvable branch): eligible [task], role "human" — "raised with whoever can actually resolve it." urgency: normal, requiresPermission: false (internal task, not customer communication), requiresContactability: false.
- Confirmed by reviewed note: t1 and t2 are the exclusive arms of c.self-resolvable, never both — no ambiguity about which fires.

SUPPRESSION / PREEMPTION:
- s.g3 / a.stop-reminders: the moment the requirement is met, every reminder stops including any already scheduled — enforced in-graph (w.resolve onEvent -> a.stop-reminders before any further branching).
- Named distinction (not suppression) from ACT-14: ACT-13 is for a named requirement; ACT-14 is for effort-without-progress with nothing specific to point at — the two are mutually exclusive by construction (see cross-journey notes).

HANDOFF:
- h.resume -> ACT-12. requiredContext: which requirement was resolved and how long it took, the setup state as it now stands (so onboarding resumes, not restarts). ownershipTransfer: true. suppressSource: implied.
- h.escalate -> external:human-in-the-loop-lifecycle. requiredContext: account_id, handed_at, reason, the requirement/who was asked/what was tried, what activation is waiting on. ownershipTransfer: true. suppressSource: true (automated reminders suppressed while a person holds it).
- h.reroute -> ACT-11. requiredContext: the requirement that could not be met, the setup state already reached. ownershipTransfer: true. suppressSource: implied (a fresh route decision supersedes the blocked path).

OUTCOMES:
primary: [named_requirement_satisfied] (businessOutcome, pre-post comparison)
secondary: none declared
neutral: [x.not-blocking]
failure: [x.blocked]
diagnostic: none named.

TEST CASES:
- happy-path: given a self-resolvable requirement (account holds access/info/permission) -> expect a.specific-action fires the named step, w.resolve observes.
- alternate-branch: given the requirement depends on someone else -> expect a.route-dependency raises it as a human task while ownership of the resume stays with this journey ("the account is not handed away and forgotten").
- late-event: given the requirement is satisfied mid-wait -> expect a.stop-reminders fires immediately, cancelling any already-queued reminder, before c.next-blocker evaluates.
- timeout: given w.resolve's resolution_horizon elapses unmet -> expect c.unresolved routes to escalate, reroute, or x.blocked depending on severity/alternate-path availability.
- superseding-state: given clearing this requirement reveals a second mandatory requirement -> expect x.next-blocker exits this instance and the next requirement opens its own separately-named instance ("stacking them into one message... turns a specific blocker back into generic setup pressure").
- idempotency: given a.identify or a.specific-action fires twice for the same account_id -> expect their idempotencyKeys prevent duplicate writes/sends.

GAPS:
- none

---

---

## ACT-14 — Onboarding Help

READINESS: NEEDS_CONTRACT_WORK

WHY:
The graph is well-formed (offer -> decide -> confirm/decline/no-outcome -> bounded follow-up -> stop), and the ACT-13 duplicate check (c.duplicate) is explicit and real. The contract gap: three of the four channelRoles arrays list all three roles (persistent, in-session, low-friction) on every touch with no per-touch "when" narrowing beyond the generic role definitions, so a company must invent, per touch, which of email/in-app/push actually fires for a given account state — more so than in ACT-12/ACT-13 where the two-role pattern reads as a clean session-present/absent split.

INSTANCE:
scope: person or account plus the open onboarding or trial instance. key: [account_id, person_id]. dedupe: reject-duplicate. concurrency: one-active-per-key. concurrencyNote: the struggle is scoped to "this attempt at value" — a previous trial that went badly does not qualify anyone here, so the instance key must be tied to the specific open onboarding/trial attempt, not the person's history.

EVENTS:
- canonicalEvent: help_seeking_without_activation_progress, sourceType: behavioral. requiredEvidence: repeated help-centre visits, repeated returns to the same setup page, repeated failed integration/setup attempts, or repeated errors, AND no activation progress behind it. insufficientEvidence: a high session count alone; a single help-centre visit; heavy usage that is making real progress.

DATA:
- account_id — required, usedBy: instance key
- person_id — required, usedBy: instance key
- onboarding_instance_id — required, usedBy: c.hard-entry (open + unactivated check)
- stuck_step — required, usedBy: a.offer content, a.confirm content
- open_support_case_ref — required, usedBy: c.duplicate
- decline_cooldown_until — required, usedBy: re-entry gate after x.declined

SOURCE OF TRUTH:
- "is the onboarding/trial still open and unactivated" -> the onboarding system of record (c.hard-entry), authoritative.
- "is a person already working this blocker" -> open support case ref or ACT-13 ownership on the same requirement (c.duplicate), authoritative — explicitly treats an ACT-13-owned named requirement as "almost always" the actual struggle, so a help offer beside a blocker reminder is "two voices on one problem."
- "did activation follow" -> the activation event (c.outcome), engagementIsEvidenceOnly: true — distinguishes "activated" from "session happened, value still not produced."

CONFIG:
- struggling_user.touches (local cap, corpus-rule default 4) — required: false
- struggling_user.cooldown (cooldown, "the cooldown between instances... so a re-qualifying instance is tracked but not messaged again inside it") — required: true, no numeric default
- struggling_user.response (response-window, "a bounded response window") — required: true, no numeric default
- struggling_user.session (observation-window, "the scheduled session time plus a short grace period") — required: true, no numeric default

CHANNEL POLICY:
- a.offer (t1): eligible [email, in-app, push], preferredWhen: not narrowed beyond the generic role definitions (persistent/in-session/low-friction all listed) — no per-touch selection rule stated for which channel actually fires; urgency: normal, requiresPermission: true, requiresContactability: true.
- a.confirm (t2): same three-role listing, same lack of touch-specific narrowing, urgency: normal (booking confirmation), requiresPermission: true, requiresContactability: true.
- a.followup (t3): same three-role listing, urgency: low, requiresPermission: true, requiresContactability: true.
- a.final (t4): same three-role listing, urgency: low ("one final self-service option"), requiresPermission: true, requiresContactability: true.
- fallback: same-role-other-channel (journey-level default), but with three roles always simultaneously eligible per touch, "same-role-other-channel" does not resolve which role is primary in the first place.

SUPPRESSION / PREEMPTION:
- c.duplicate / x.defer: an open support case, assigned human owner, or ACT-13 ownership of a named requirement on this instance suppresses ACT-14 entirely (real, named conflict, explicitly resolved in favor of ACT-13/human ownership — "two channels chasing one problem is worse than one slow channel").
- s.g3 / x.declined: a decline is respected and cooled down; asking again is explicitly the behavior this journey exists to replace.
- Named distinction (not suppression) from ACT-13: ACT-13 is for a named requirement; ACT-14 is for effort-without-progress with no single thing to point at.
- Cross-journey (documented on ACT-12's side, not ACT-14's): per ACT-12's preemptedBy, an ACT-14 session booking should pause ACT-12's generic prompts — but ACT-14 has no corresponding suppression check for "is ACT-12 currently prompting this account" since ACT-14 is the higher-priority journey in this pairing; the gap is one-directional and lives entirely in ACT-12 (see ACT-12's GAPS).

HANDOFF:
- h.activated -> ACT-16. requiredContext: whether assistance was involved, the struggle that preceded it. ownershipTransfer: true. suppressSource: implied.

OUTCOMES:
primary: [activation_recorded] (businessOutcome, pre-post comparison)
secondary: none declared
neutral: [x.not-eligible, x.defer, x.no-outcome, x.normal]
failure: [x.declined]
diagnostic: none named; the wait explicitly distinguishes "booked" / "solved it themselves" / "declined" as real state, never counting an open as any of these.

TEST CASES:
- happy-path: given repeated returns to the same setup step with no progress and nobody else on it -> expect a.offer fires, w.response observes for booking/activation/decline.
- alternate-branch: given the person books an assisted session -> expect a.confirm fires with session details, w.session observes for outcome.
- human-ownership: given an open support case or ACT-13 ownership already covers the same issue -> expect c.duplicate routes to x.defer without ever sending a.offer.
- timeout: given w.response elapses with no reply -> expect c.final-option evaluates whether a specific guide exists before sending a.final or exiting to x.normal directly.
- permission-loss: given the offer was explicitly declined -> expect x.declined with decline_cooldown_until set, and re-entry suppressed until that cooldown passes.
- idempotency: given a.offer fires twice for the same account_id+person_id -> expect the idempotencyKey prevents a duplicate offer.

GAPS:
- P1 (channel): every touch (t1-t4) lists all three channelRoles (persistent, in-session, low-friction) without a per-touch "when" narrowing the way ACT-12/ACT-13 do (session-present vs session-absent) — an implementer has no stated rule for choosing among email/in-app/push on a given send beyond the roles' generic journey-level definitions, which is a real channel-selection gap repeated across four separate touches.
- P1 (suppression, cross-referenced from ACT-12): ACT-12's preemptedBy states an ACT-14 session pauses ACT-12's prompts, but neither journey's own graph enforces it — flagged in full under ACT-12's GAPS; recorded here because ACT-14 is the journey whose state (a booked session) the pause depends on, so its own contract should also expose "session booked" as a signal ACT-12 (or an orchestration layer) can read.

---

---

## ACT-17 — Adoption Nurture

READINESS: READY_WITH_MAPPING

WHY:
A clean two-outcome router (stable -> external lifecycle owner, stall -> ACT-18) with an honest guardrail against inflating adoption from raw activity (logins/opened dashboards excluded by construction). Reviewed and confirmed (Gate 3) as owning no outcome of its own beyond the handoff distribution. Implementation work is mapping the value-producing usage signal and the per-use-case observation window.

INSTANCE:
scope: person or account plus the product or use-case value comes from. key: [account_id, use_case_id]. dedupe: reject-duplicate (adoption measured against the use-case that produced first value, not the product's full surface — a second use-case is a separate instance). concurrency: one-active-per-key.

EVENTS:
- canonicalEvent: core_activation_completed, sourceType: authoritative. requiredEvidence: a recorded activation with the use-case that produced it, or the first value-producing event itself (completed workflow/transaction/published project/generated report) with the artifact/result named. insufficientEvidence: a login, page view, or completed onboarding checklist with nothing produced; onboarding steps completed without the activation event itself; an opened or clicked message.

DATA:
- account_id — required, usedBy: instance key
- use_case_id — required, usedBy: instance key
- activation_event_id — required, usedBy: entry evidence
- activated_at — required, usedBy: window anchor
- produced_artifact — required, usedBy: a.recognize content, c.next
- has_active_session — optional, usedBy: in-session channel eligibility
- expected_usage_rhythm — optional, usedBy: c.stable, w.observe timeout basis
- next_behaviour_candidate — optional, usedBy: a.next-behavior content

SOURCE OF TRUTH:
- "has adoption become stable" -> value-producing usage re-read from the product's own record (c.stable/a.measure), engagementIsEvidenceOnly: true — explicit guardrail: "vanity activity does not inflate the adoption state. Logins, opened dashboards and idle sessions are excluded by construction, not filtered out afterwards."
- "does a natural next action follow" -> the produced_artifact and the use-case's own next step (c.next), not a generic feature-list heuristic.

CONFIG:
- adoption.touches (local cap, example-only default 4, low confidence, "one recognition and a small number of behaviour nudges") — required: false
- adoption.cooldown (cooldown, example, 30-90d) — required: false
- adoption.nudge_budget (attemptBudget, example-only default 3) — required: false
- adoption.observation_window (observation-window, "the product's own intended usage rhythm for this use-case; a weekly product and a twice-a-year product cannot share one") — required: true, no numeric default (deliberately per-product)

CHANNEL POLICY:
- a.recognize (t0): eligible [in-app, email], preferredWhen: in-session "person is active in the product," fallback persistent "no active session, or the message has to survive until the person returns" — clean either/or, not ambiguous.
- a.surface (t1): same two-role either/or pattern, tied to whether a natural next action exists (c.next).
- a.next-behavior (t2): same two-role either/or pattern.
All three touches share one consistent, well-narrowed channel rule.

SUPPRESSION / PREEMPTION:
- s.stable: the moment value is produced at the rhythm the use-case implies, adoption is stable and the lifecycle owner takes the account (real, enforced via h.normal).
- s.stall: when the observation window closes without repeated value, the instance hands to ACT-18; a nurture nudge is never sent into a stall (real, enforced via h.stall).
- s.contest: an open complaint under human ownership, a live risk case, or a declared cancellation intent on the same account outranks lifecycle nurture (GLB-06).

HANDOFF:
- h.normal -> external:customer-lifecycle. requiredContext: account_id, use_case_id, settled_rhythm, stabilised_at, the use-case adoption settled around, the rhythm it settled at. ownershipTransfer: true. suppressSource: implied.
- h.stall -> ACT-18. requiredContext: what was produced and when it stopped, the expected pattern it was measured against (so the stall is diagnosed rather than assumed). ownershipTransfer: true. suppressSource: implied.

OUTCOMES:
primary: none (pure router, per reviewed router_journey classification — journeyOutcome.type is exit-or-handoff but both refs are handoffs)
secondary: none
neutral: none
failure: none
diagnostic: none

TEST CASES:
- happy-path: given a first activation event with a named artifact -> expect a.recognize fires, c.next checks whether a natural next action exists.
- alternate-branch: given nothing genuinely follows from what was produced -> expect c.next routes straight to a.measure without inventing a next-action pitch.
- late-event: given value is produced repeatedly at the expected rhythm -> expect c.stable routes to h.normal (external lifecycle ownership), no further nudges sent.
- timeout: given w.observe's per-use-case window elapses without repeated value -> expect h.stall hands to ACT-18 with the expected pattern attached for diagnosis.
- idempotency: given a.recognize or a.surface fires twice for the same account_id+use_case_id+touch id -> expect the idempotencyKey prevents a duplicate send.

GAPS:
- none

---

---

## ACT-18 — Adoption Recovery

READINESS: READY_WITH_MAPPING

WHY:
A diagnose-first journey with four clearly separated outcomes (need genuinely met / no evidence of a problem / recoverable blocker / needs a person) and an explicit guardrail against manufacturing an intervention to fill a dashboard gap. The diagnosis step itself (a.diagnose) is necessarily company-specific judgment, which the journey correctly leaves as a config/business-rule surface rather than pretending to resolve structurally.

INSTANCE:
scope: person or account plus the product or use-case that stalled. key: [account_id, use_case_id]. dedupe: reject-duplicate (a stall in one use-case is not a stall in the account; others the account holds may be healthy). concurrency: one-active-per-key.

EVENTS:
- canonicalEvent: expected_adoption_pattern_not_met, sourceType: behavioral. requiredEvidence: an activated account failing to progress against the usage pattern this product actually intends. insufficientEvidence: a gap that is normal for an episodic/seasonal product; a drop in logins with value still being produced.

DATA:
- account_id — required, usedBy: instance key
- use_case_id — required, usedBy: instance key
- expected_pattern — required, usedBy: t.stall eligibility, a.diagnose
- last_value_at — required, usedBy: a.diagnose
- diagnosed_blocker — required, usedBy: a.recover content, h.monitor/h.assistance carry
- has_push_token — optional, usedBy: low-friction channel eligibility
- setup_completion — optional, usedBy: a.diagnose input
- integration_status — optional, usedBy: a.diagnose input

SOURCE OF TRUTH:
- "what does the evidence show" -> a.diagnose reads setup completion, integration status, collaborator presence, and usage history from the product's own record; this is explicitly a business-rule synthesis, not a single authoritative flag, and the journey names four distinct outcomes rather than collapsing them.
- "did value return after recovery" -> value_produced re-read from the product's own record (w.recover), engagementIsEvidenceOnly: true.

CONFIG:
- adoption_recovery.touches (local cap, corpus-rule default 1, "a second touch on the same diagnosis is pressure, not help") — required: false
- adoption_recovery.cooldown (cooldown, example, 30-90d) — required: false
- adoption_recovery.window (recovery-window, "drawn from the product's own intended usage rhythm... bounded so a stall is either recovered or handed to monitoring — never nudged indefinitely") — required: true, no numeric default
- adoption_recovery.holdout_share (measurement holdout, example, 10%) — required: false

CHANNEL POLICY:
- a.recover: eligible [email, push], preferredWhen: persistent "the blocker needs an explanation that survives until the person can act on it," low-friction "a valid token exists and the blocker is a single step the person can take from the notification" — clean either/or on token availability plus blocker complexity, not ambiguous.

SUPPRESSION / PREEMPTION:
- s.human: a blocker needing a person is handed to a person; no automated touch is sent alongside a human intervention (real, enforced via h.assistance).
- s.contest: lowest in the retention-outreach group — an open issue under human ownership, a live risk case, or a declared cancellation intent on the same account suppresses it (GLB-06).
- Named distinction (not suppression) from ACT-14: ACT-14 is pre-activation and help-seeking-triggered; ACT-18 is post-activation and silence-triggered, with "nothing is wrong" as the most common correct diagnosis.

HANDOFF:
- h.adoption -> ACT-17. requiredContext: what the blocker was and what cleared it, the recovered usage pattern. ownershipTransfer: true. suppressSource: implied.
- h.monitor -> external:health-monitoring. requiredContext: account_id, use_case_id, diagnosed_blocker, recovery_window_closed_at, the diagnosis and what was tried, the fact that this is reduced usage not a churn decision. ownershipTransfer: true. suppressSource: true (adoption-frequency messaging for this use-case suppressed).
- h.assistance -> external:human-in-the-loop-lifecycle. requiredContext: account_id, use_case_id, diagnosed_blocker, evidence, what the account was trying to do when it stopped. ownershipTransfer: true. suppressSource: implied (s.human).

OUTCOMES:
primary: [value_produced] (businessOutcome, persistent-holdout comparison — stalled accounts resume on their own often enough that treated-only measurement is misleading)
secondary: none declared
neutral: [x.satisfied, x.no-intervention]
failure: none named explicitly as a class, though x.no-intervention functions as a "diagnosis found nothing" state rather than a true failure
diagnostic: none named.

TEST CASES:
- happy-path: given a stall diagnosed as a recoverable blocker (unfinished setup) -> expect a.recover fires with the specific blocker named, w.recover observes.
- alternate-branch: given the use-case was actually completed (need genuinely met) -> expect x.satisfied, no send, re-entry treated as normal future adoption rather than a repeat failure.
- late-event: given value resumes during w.recover -> expect h.adoption hands back to ACT-17 with what cleared the blocker.
- timeout: given w.recover's window elapses with no value returning -> expect h.monitor hands to external health-monitoring, explicitly not framed as a churn signal.
- human-ownership: given the diagnosis is a technical blocker no message can fix -> expect h.assistance fires with no automated touch sent alongside it.
- idempotency: given a.recover fires twice for the same account_id+use_case_id -> expect the idempotencyKey prevents a duplicate send.

GAPS:
- none

---

---

## ACT-19 — Onboarding Personalization

READINESS: READY_WITH_MAPPING

WHY:
A tightly scoped one-question journey with a real materiality gate (c.material: "would the answer materially change the path") before anything is ever asked, and an explicit field-separation guardrail between declared answers and behavioral inference (s.g1). Implementation is mapping "would this materially change the path" to real onboarding-path logic and defining the one question's form.

INSTANCE:
scope: person or account plus the onboarding context being decided. key: [account_id, person_id]. dedupe: reject-duplicate (one question per onboarding instance; nothing is re-asked). concurrency: one-active-per-key.

EVENTS:
- canonicalEvent: onboarding_needs_named_role_or_use_case, sourceType: authoritative. requiredEvidence: an onboarding decision that depends on a named role or use-case, with no reliable value available for it. insufficientEvidence: a role/use-case readable from the account itself (which ACT-11 uses without asking); an optional profile field being empty.

DATA:
- account_id — required, usedBy: instance key
- person_id — required, usedBy: instance key
- declared_context — required, usedBy: c.declared (existing-value check), a.persist write

SOURCE OF TRUTH:
- "does a reliable declared value already exist" -> the declared_context field, authoritative, explicitly distinct from behavioral inference (s.g1: "behavioural inference is never stored as a declared preference... merging them cannot be undone").
- "would the answer materially change the path" -> onboarding path logic (c.material), a business-rule judgment the implementation must define per product.

CONFIG:
- role_use.touches (local cap, corpus-rule default 1) — required: false
- role_use.cooldown (default: none, high confidence — one question per instance) — required: false
- role_use.answer (response-window, "a short window — this is a question in the middle of someone's setup, not a survey") — required: true, no numeric default

CHANNEL POLICY:
- a.ask: eligible [email, in-app], preferredWhen: persistent "message has to be kept and survive," in-session "person active in the product and the action is taken there" — clean either/or pattern, consistent with ACT-12/ACT-13/ACT-17's usage of the same two roles.

SUPPRESSION / PREEMPTION:
none identified — contact.competition: none, no named cross-journey conflict.

HANDOFF:
- h.progress -> ACT-12. requiredContext: the declared value with its source (or the explicit fact there is none), which adaptations were applied (so they are not applied twice). ownershipTransfer: true. suppressSource: not stated explicitly, implied by the "adapted or defaulted" framing.

OUTCOMES:
primary: [question_answered] (businessOutcome, comparison: none — appropriately, since this is a one-shot informational capture, not a lift-measurement journey)
secondary: none
neutral: [x.dont-ask]
failure: none
diagnostic: none

TEST CASES:
- happy-path: given onboarding needs a role/use-case with no reliable declared value and the answer would change the path -> expect a.ask fires once, w.answer observes.
- alternate-branch: given a reliable declared value already exists -> expect a.reuse applies it directly (a.adapt) without ever asking again.
- late-event: given the answer would NOT materially change the path -> expect c.material routes straight to x.dont-ask, the question never sent.
- timeout: given w.answer's response window elapses unanswered -> expect a.default continues on a documented default path, explicitly not writing the default into the declared_context field as though chosen.
- idempotency: given a.ask or a.persist fires twice for the same account_id+person_id -> expect their idempotencyKeys prevent duplicate writes/sends.

GAPS:
- none

---

---

## ACT-20 — Dormant Lead Reactivation

READINESS: READY_WITH_MAPPING

WHY:
Reviewed and confirmed (Gate 4) as correctly guarding against engagement-as-progression: `a.inspect` explicitly checks what state was actually returned to before the wait's outcome is declared anything, and c.state's "Signal did not survive inspection" branch exists precisely to catch a false positive (message engagement mistaken for a real return). The journey correctly excludes former paying customers (win-back is a different journey) and requires a specific, recorded reason before any attempt is made.

INSTANCE:
scope: person, lead or inactive non-customer account, in the context that went dormant. key: [lead_id, context_id]. dedupe: reject-duplicate. concurrency: one-active-per-key. concurrencyNote: dormancy is per context — someone inactive in one product may be active in another, and this journey is not about them; the context_id in the instance key enforces that scoping.

EVENTS:
- canonicalEvent: engaged_non_customer_became_dormant, sourceType: behavioral. requiredEvidence: a previously engaged relationship that has passed the inactivity threshold defined for this context. insufficientEvidence: a gap that is normal for how often this product is used; quiet in one channel while the person is active elsewhere.

DATA:
- lead_id — required, usedBy: instance key
- context_id — required, usedBy: instance key
- last_engaged_at — required, usedBy: t.dormant eligibility
- inactivity_threshold — required, usedBy: t.dormant eligibility
- recorded_reason — required, usedBy: a.attempt content, destination binding
- monetisation_history — required, usedBy: c.never-monetized (win-back exclusion gate)

SOURCE OF TRUTH:
- "has this relationship ever been monetised" -> monetisation_history / the customer/paid-relationship system of record (c.never-monetized), authoritative — a real conflict boundary against win-back (x.winback exit, distinctFrom ACQ-07).
- "is there a credible reason to come back" -> a.reason reads setup/interest/relevance signals from the account record, business-rule synthesis.
- "what state did they actually return into" -> a.inspect, engagementIsEvidenceOnly: true — this is the guardrail explicitly reviewed and accepted (vnext-warning-reviews: "success is a meaningful return... the event is inspected before anything advances"). c.state's "Signal did not survive inspection" branch (x.engagement-only) is the graph-level enforcement of that guardrail.

CONFIG:
- dormant_non.touches (local cap, corpus-rule default 1) — required: false
- dormant_non.cooldown (cooldown, "the cooldown between instances... so a re-qualifying person is tracked but not messaged again inside it") — required: true, no numeric default
- dormant_non.return (response-window, "the reactivation window... stops repeated dormancy from turning into a permanent campaign") — required: true, no numeric default

CHANNEL POLICY:
- a.attempt: eligible [email, push], preferredWhen: persistent "message has to be kept and survive," low-friction "a valid token or app session exists and the message is a single step from the notification" — clean either/or, urgency: normal, requiresPermission: true, requiresContactability: true.

SUPPRESSION / PREEMPTION:
- s.g2 / c.never-monetized: former paying customers are explicitly out of scope; win-back is a separate journey with different economics (real, named conflict boundary, enforced via x.winback).
- s.g3: repeated inactivity does not create repeated campaigns — each attempt needs its own reason (enforced via c.worth-it requiring a credible reason before any send).
- competition group "lifecycle-stage": lowest precedence — any current lifecycle on the same person outranks reactivation, onLoss: exit (not merely suppressed — the instance exits outright if a current lifecycle claims the person).

HANDOFF:
- h.onboarding -> ACT-12. requiredContext: milestones already completed (resume, not restart), the reason they were re-engaged. ownershipTransfer: true. suppressSource: implied.
- h.intent -> ACQ-03. requiredContext: the new signal, the dormancy context (so it is not read as first-time interest). ownershipTransfer: true. suppressSource: implied.
- h.qualify -> ACQ-05. requiredContext: earlier history and why it lapsed, what brought them back. ownershipTransfer: true. suppressSource: implied.

OUTCOMES:
primary: [meaningful_return] (businessOutcome, pre-post comparison) — explicitly never an open or a click, per the reviewed guardrail.
secondary: none declared
neutral: [x.no-reason]
failure: [x.sunset, x.engagement-only]
diagnostic: message opens/clicks implicitly — they are the exact signal the journey guards against counting as meaningful_return; the graph itself provides no named diagnostic metric for them, which is consistent (they are excluded, not tracked as a lesser success).

TEST CASES:
- happy-path: given a never-monetized dormant lead with a credible recorded reason -> expect a.attempt fires once, w.return observes.
- alternate-branch: given the person was previously a paying customer -> expect immediate exit to x.winback, out of scope entirely, no attempt made.
- timeout: given w.return elapses with no return -> expect x.sunset, cooldown in force, re-entry only on a new reason.
- late-event / permission-loss: given no credible reason exists or permission/eligibility has lapsed at c.worth-it -> expect x.no-reason, no attempt made.
- alternate-branch (engagement guard): given the person opens or clicks the reactivation message but takes no real action -> expect a.inspect + c.state route to x.engagement-only, NOT to any of the three success handoffs — this is the explicit test of the reviewed engagement-as-progression guardrail.
- idempotency: given a.attempt fires twice for the same account_id+lead_id -> expect the idempotencyKey prevents a duplicate send.

GAPS:
- none

---

## CON-264 — Contact Verification

READINESS: READY_WITH_MAPPING

WHY:
The two-party confirmation graph (alert the old destination, confirm the new one, one bounded reminder, activate or lapse) is complete and internally consistent, and channel selection is deterministic — the channel is simply the destination's own kind (email vs sms), not a real choice, so there is no channel-selection ambiguity to resolve. What remains is company mapping: wiring the confirmation_window config, the dispute route into IDN-89, and the destination-kind branch. One real cross-journey gap survives migration review: neither CON-264 nor CON-272 (Contact Recovery) declares whether a bounced-and-replaced destination should also run CON-264's two-party confirmation, since both journeys can trigger from the same real-world action of supplying a new contact point.

INSTANCE:
Scope: the specific contact point being added or changed, plus the identity it is claimed for
Key: contact_point_id
Dedupe policy: supersede-open
Concurrency note: A further change to the same contact point before confirmation supersedes the open instance (wait event contact_point_changed_again -> x.superseded); a second, different contact point on the same identity is its own instance and confirms independently.

EVENTS:
Canonical event: contact_point_added_or_changed (source: authoritative)
Required evidence: a new or changed contact point recorded against a known identity; a destination in a form that can actually be sent to
Insufficient alone: a destination typed into a form and not yet submitted; a live session on the account, which proves control of the account rather than of the destination

DATA:
- contact_point_id — instance key; every idempotencyKey
- identity_id — binding the destination to the identity it is claimed for
- destination_kind — c.replacement / channel selection (email vs sms)
- new_destination — a.confirm-new destination
- replaced_destination — a.alert-old destination
- confirmation_window_ends_at — w.confirm and w.last timeouts
- change_source (optional) — context on how the change was submitted
- session_ref (optional) — explicitly insufficient alone as proof of destination control; retained for audit context only

SOURCE OF TRUTH:
- whether the new destination confirms from that destination itself -> contact-point verification/token-exchange system [engagement is evidence-only]
- whether the replaced destination disputes the change -> old-destination reply/dispute channel [engagement is evidence-only]

CONFIG:
- contact_verification.reminders — number of reminders sent to an unconfirmed new destination (basis: business policy, required: false)
- contact_verification.cooldown — cooldown between instances for the same contact point (basis: business policy, required: false)
- contact_verification.confirmation_window — how long the new destination has to confirm before the reminder fires (basis: operational SLA, timingClass: response-window, required: true)
- contact_verification.window_remainder — remaining time after the reminder, counted from the first request, before the destination lapses (basis: operational SLA, timingClass: attribute-bound, required: false)

CHANNEL POLICY:
- a.alert-old: eligible [email, sms] — preferredWhen: channel equals the replaced destination's own kind (email -> persistent role, phone -> urgent role) — not a discretionary choice; urgency: high; requiresPermission: false; requiresContactability: true
- a.confirm-new: eligible [email, sms] — preferredWhen: channel equals the new destination's own kind; urgency: high; requiresPermission: false; requiresContactability: true
- a.remind: eligible [email, sms] — preferredWhen: same destination and channel as a.confirm-new; urgency: high; requiresPermission: false; requiresContactability: true

SUPPRESSION / PREEMPTION:
none identified

HANDOFF:
- h.disputed -> IDN-89; requiredContext: the old and the new destination and when the change was recorded; the dispute and the route it arrived on; ownershipTransfer: true; suppressSource: true

OUTCOMES:
Primary: x.permitted — destination confirmed and permitted
Secondary: h.disputed — destination_change_disputed, handed to IDN-89
Neutral: x.superseded — contact point changed again before confirmation
Failure: x.lapsed — unconfirmed within the confirmation window

TEST CASES:
- happy-path: a new destination confirms from that destination itself within the window -> a.activate runs, x.permitted reached, permission recorded solely against the new destination
- alternate-branch: the contact point is the first of its kind for this identity (nothing to replace) -> c.replacement skips a.alert-old and goes straight to a.confirm-new
- timeout: the confirmation window elapses with no response -> a.remind fires once (the only discretionary touch), then w.last elapses to x.lapsed
- duplicate-trigger: the same contact point is changed again while confirmation is still pending -> the open instance resolves to x.superseded; the new change opens its own instance
- contactability-loss: the destination being replaced has itself already gone undeliverable before the alert can be sent -> CON-264 still attempts a.alert-old on record; repairing the old destination's own deliverability is CON-272's job, not this journey's, and is not modeled as a wait condition here
- idempotency: the destination_confirmed event is delivered twice for the same contact_point_id -> idempotencyKey contact_point_id + confirmation dedupes; a.activate runs exactly once

GAPS:
- P1 [events] No documented rule for a destination_confirmed event arriving after x.lapsed has already been recorded (a late confirmation); the graph does not say whether it reopens the instance or is discarded.
- P1 [suppression] CON-264 (contact_point_added_or_changed) and CON-272 (a replacement destination supplied after a bounce) can both be triggered by the same real-world action of a person supplying a new contact point, and neither journey's distinctFrom section resolves which one owns the two-party confirmation in that case.
- P2 [channel] channelStrategy.fallback is declared as same-role-other-channel even though the channel is fully determined by destination_kind and there is no real fallback path available (an email destination cannot fail over to sms and remain 'the same destination').

---

---

## CON-272 — Contact Recovery

READINESS: READY_WITH_MAPPING

WHY:
The offer-decide-remind graph (ask in-product, else ask on the surviving permitted route, confirm on whichever route worked) is complete, and t3's three declared channelRoles are resolved by its own purpose text ('confirm on the working route') rather than left ambiguous. The one open question, shared with CON-264, is whether a corrected destination supplied here should also run CON-264's own two-party added-or-changed confirmation — the two journeys are not declared distinct from each other despite triggering on adjacent real-world events.

INSTANCE:
Scope: the person plus the one contact point that failed
Key: contact_point_id + person_id
Dedupe policy: reject-duplicate
Concurrency note: One repair cycle per destination (s.g4); a different contact point failing for the same person is its own instance.

EVENTS:
Canonical event: contact_point_recorded_undeliverable (source: authoritative)
Required evidence: a permanent delivery failure or invalid-destination result recorded against one specific contact point; a failure class that marks the destination unusable rather than temporarily unavailable
Insufficient alone: a single soft failure or a full mailbox; a message that went unopened; an opt-out, which is a permission fact and says nothing about the route

DATA:
- contact_point_id — instance key; idempotencyKeys
- person_id — instance key; idempotencyKeys
- failure_class — eligibility gate (permanent vs temporary failure)
- failed_at — audit trail / repair-cycle window start
- surviving_routes — c.route branch selection
- held_messages — a.prompt-* messaging ('what is being held because of it')

SOURCE OF TRUTH:
- whether a corrected destination verifies as reachable -> delivery verification / bounce-detection system [engagement is evidence-only]
- whether the original destination recovered on its own -> deliverability monitoring system [engagement is evidence-only]

CONFIG:
- contactability_repair.discretionary_touches — discretionary touch budget (0 — every touch here is mandatory) (basis: business policy, required: false)
- contactability_repair.cooldown — cooldown between instances for the same person+contact point (basis: business policy, required: false)
- contactability_repair.corrected — the single repair cycle window allowed for this destination (basis: operational SLA, timingClass: observation-window, required: true)

CHANNEL POLICY:
- a.prompt-in-app: eligible [in-app] — preferredWhen: the person has an active in-product session; urgency: normal; requiresPermission: false; requiresContactability: false
- a.prompt-alt: eligible [sms, email] — preferredWhen: sms when an asserted time bound is inside the urgent horizon and sms permission is recorded; otherwise email; fallback: [same-role-other-channel]; urgency: normal; requiresPermission: true; requiresContactability: true
- a.confirm: eligible [in-app, email, sms] — preferredWhen: whichever route the correction was verified on (in-app, or the alternate channel that succeeded); fallback: [same-role-other-channel]; urgency: normal; requiresPermission: true; requiresContactability: true

SUPPRESSION / PREEMPTION:
none identified

HANDOFF:
none

OUTCOMES:
Primary: x.repaired — replacement destination verified and confirmed; x.recovered — original destination deliverable again
Failure: x.dark — no working permitted route; x.suppressed — no correction within the repair cycle

TEST CASES:
- happy-path: the person is active in-product and supplies a corrected destination there -> a.prompt-in-app -> verified -> a.confirm on the working route -> x.repaired
- alternate-branch: no session is expected soon but a separate permitted destination exists -> a.prompt-alt fires on the surviving route instead of in-app
- timeout: the repair cycle elapses with nothing corrected and no recovery -> w.corrected times out to x.suppressed
- contactability-loss: no other destination is both working and permitted -> c.route routes directly to x.dark with no message sent anywhere
- duplicate-trigger: a second, different contact point for the same person also goes undeliverable -> a separate instance opens keyed on the new contact_point_id; the first instance is untouched
- idempotency: the bounce webhook for the same failure is redelivered -> idempotencyKey contact_point_id + person_id + action dedupes each touch

GAPS:
- P1 [suppression] Shares the same open question as CON-264: a destination corrected here may also trigger CON-264's contact_point_added_or_changed flow, and no rule states whether CON-264's two-party (alert-old) confirmation should also run for a repair-originated change.
- P2 [channel] t3 (a.confirm) declares three channelRoles without a channelStrategy entry that names 'the route that worked' as a formal selection rule — it is resolved correctly in the action's own prose but not in the structured channelStrategy.roles block.

---

---

## CON-283 — Frequency Preference Update

READINESS: READY_WITH_MAPPING

WHY:
The graph is small and clean: recalculate the cadence for optional classes only, trim any backlog that now exceeds it, confirm once, and watch one cycle for a further change. Channel is single (email), so there is no selection ambiguity. The one real implementation subtlety is that the wait duration ("one full cycle at the new cadence") is derived from the new_cadence value itself rather than being a fixed policy constant, which needs a formula, not a single config number.

INSTANCE:
Scope: the person and the optional communication classes the reduced frequency actually governs
Key: person_id
Dedupe policy: merge-into-open
Concurrency note: w.cycle's own wait listens for frequency_preference_changed as one of its ending events (routed to x.reduced-again via c.settled) — a further reduction recorded while the confirmation cycle is still open is absorbed as an outcome of the SAME instance rather than opening a concurrent one, consistent with the eligibility gate that forbids a second open instance for this person.

EVENTS:
Canonical event: frequency_preference_reduced (source: declared)
Required evidence: an authoritative frequency preference recorded against the person; the new cadence expressed as something that can actually be applied; the classes it governs
Insufficient alone: a complaint about volume with no preference recorded; a period of no engagement

DATA:
- person_id — instance key; idempotencyKey
- new_cadence — a.recalculate; w.cycle duration
- governed_classes — a.recalculate scope (optional classes only)
- queued_optional_sends — c.queued / a.trim

SOURCE OF TRUTH:
- which classes the reduced frequency governs and the recalculated cadence -> preference/consent management system (CON-34) [engagement is evidence-only]
- whether the preference held through a full cycle (x.holding) or changed again -> preference audit log [engagement is evidence-only]

CONFIG:
- frequency_reduction.touches — touch budget for the plan (fixed at 1: the single confirmation) (basis: business policy, required: false)
- frequency_reduction.cooldown — cooldown between instances for the same person+classes (basis: business policy, required: false)
- frequency_reduction.cycle — one full cycle at the new cadence, watched before the instance settles — a duration DERIVED from new_cadence rather than a fixed constant (basis: expected user rhythm, timingClass: observation-window, required: true)

CHANNEL POLICY:
- a.confirm: eligible [email] — preferredWhen: single channel, no policy needed; urgency: low; requiresPermission: false; requiresContactability: true

SUPPRESSION / PREEMPTION:
none identified

HANDOFF:
none

OUTCOMES:
Primary: x.holding — reduced cadence held through a full cycle; x.reduced-again — reduced further before the cycle completed
Neutral: x.opted-out — full withdrawal chosen instead of a reduction; nothing sent

TEST CASES:
- happy-path: a reduced cadence is recorded, nothing queued exceeds it, and it holds through one cycle -> a.confirm sends once, w.cycle elapses to x.holding
- alternate-branch: the preference is a full withdrawal rather than a reduction -> c.less-or-none routes straight to x.opted-out; this journey sends nothing
- alternate-branch: queued optional sends exceed the new cadence -> a.trim suppresses or reschedules the backlog before a.confirm fires
- timeout: no further change is recorded before the cycle window ends -> w.cycle times out to x.holding
- superseding-state: a second reduction is recorded before the first cycle completes -> the same open instance's wait catches frequency_preference_changed and resolves to x.reduced-again rather than opening a second instance
- idempotency: the frequency_preference_reduced event is redelivered for the same person -> idempotencyKey person_id + a.confirm dedupes the single confirmation

GAPS:
- P1 [config] frequency_reduction.cycle is a duration derived from new_cadence ("one full cycle at the new cadence"), not a fixed policy value — implementers need a formula keyed off the cadence attribute, not a single constant.
- P2 [events] The relationship between the specific trigger event (frequency_preference_reduced) and the more general event the same open instance's wait listens for (frequency_preference_changed) is not documented — it is unclear whether upstream systems emit both for the same action or only one.

---

---

## DEC-184 — More Information Request

READINESS: READY_WITH_MAPPING

WHY:
The graph's central discipline is preserving review state: a.state explicitly records that the case is paused rather than reset, and h.resume carries the full prior review history so a reviewer continues rather than restarts. The internal-vs-external routing (c.source-type) correctly sends an internal evidence gap to an owned task rather than down a customer channel. Deadline behaviour is deliberately left to policy (c.timeout has no invented default), which is the correct move but leaves that policy itself as company work.

INSTANCE:
- scope: the decision case and the specific information requirement blocking it
- key: [decision_case_id, requirement_id]
- dedupePolicy: reject-duplicate
- concurrency: Scoped by the decision rather than by the record — a renewed need for the same judgment is a new request that can reference this case's evidence.

EVENTS:
- canonicalEvent: information_requirement_identified
- sourceType: authoritative
- requiredEvidence: a reviewer identifying a specific fact the decision turns on and which is not available
- insufficientEvidence: a reviewer's curiosity about something the decision does not turn on; information missing before the case was opened, which DEC-181 holds as pending information

DATA:
- decision_case_id (required) — used by: instance key
- requirement_id (required) — used by: instance key
- holder (required) — used by: c.source-type — who actually holds the outstanding information
- information_deadline_at (required) — used by: w.info timeout basis
- request_budget (required) — used by: c.further — whether another round is permitted
- decision_log (required) — used by: every action's audit trail, preserved across the pause

SOURCE OF TRUTH:
- requested_information_received / request_withdrawn -> the intake channel appropriate to the holder (external portal/email, or internal task system) [engagementIsEvidenceOnly: true]
- whether what arrived satisfies the requirement (a.validate) -> the named reviewer, per this journey's own reviewer-driven trigger

CONFIG:
- information_requirement.touches: a request is repeated only for what is still outstanding, within the request budget policy allows — never re-requesting the whole requirement (basis: business policy, required: true)
- information_requirement.request_budget: attempt budget for the external request loop (basis: operational SLA, required: true)
- information_requirement.request_internal_budget: attempt budget for the internal request loop (basis: operational SLA, required: true)
- information_requirement.info: wait bound to information_deadline_at, defined by policy (basis: business policy, timingClass: attribute-bound, required: true)

CHANNEL POLICY:
- a.request: eligible [email]; preferredWhen: persistent(email) — the requester or another external party holds the information; fallback: same-role-other-channel; urgency: normal; requiresPermission: false; requiresContactability: true
- a.request-internal: eligible [task]; preferredWhen: human(task) — an internal owner, team or system holds it; raised as owned work rather than a customer message; fallback: same-role-other-channel; urgency: normal; requiresPermission: false; requiresContactability: false

SUPPRESSION / PREEMPTION:
none identified

HANDOFF:
- h.escalate -> DEC-189; requiredContext: the requirement, what was and was not supplied, and the review already done; the explicit fact that no closure or rejection was invented to end the case; ownershipTransfer: true; suppressSource: false
- h.resume -> DEC-183; requiredContext: what was supplied and what remains missing, stated as a gap rather than smoothed over; the full prior review history, so the reviewer continues rather than restarts; ownershipTransfer: true; suppressSource: false

OUTCOMES:
- primary: requested_information_received
- secondary: none
- neutral: no longer requiring a decision (x.moot)
- failure: closed for want of information; no decision made on the merits (x.closed-noinfo)
- diagnostic: complaint; message_after_success; unsubscribe

TEST CASES:
- happy-path: the outstanding fact is held externally and supplied in full before the deadline -> a.request fires, c.received catches requested_information_received, a.validate confirms completeness and h.resume carries the full review history back to DEC-183
- alternate-branch: the information is held by an internal team -> c.source-type routes to a.request-internal, raised as owned work rather than sent down a customer channel
- human-ownership: what arrived is only partly complete and policy still permits another round -> c.further loops back to c.source-type for the remainder rather than re-requesting everything already given
- timeout: information_deadline_at passes with nothing supplied -> a.deadline applies whatever policy actually defines — decide on available evidence, close, or escalate — and invents no default when policy is silent, routing to h.escalate instead
- idempotency: a.request retried for the same requirement -> idempotencyKey (issue_id + a.request) combined with the request_budget attemptBudget prevents unbounded re-requests

GAPS:
- P1 config: c.timeout's three-way branch (decide on available evidence / close / escalate) depends entirely on company policy that is not defined anywhere in the canonical data — a company implementing this with no explicit deadline policy set will fall through to h.escalate by the graph's own default ('or policy does not define it'), which is correct behavior but means the escalation path is the effective default until policy is authored.

---

## DEC-267 — Adverse Decision Recovery

READINESS: READY_WITH_MAPPING

WHY:
The three-way path (correctable / reapplicable / final) is exhaustive and each arm is explicitly bound to what policy actually defines, never invented to soften the message — the guardrails directly call out that a false path costs more than a refusal. The remediation wait is attribute-bound to correction_deadline_at, and a resolved decision is always explicitly confirmed (s.g5) rather than left to silence. Implementation work is mapping path_semantics and the remediation/reapplication conditions to real policy per decision reason.

INSTANCE:
- scope: the adverse decision and the subject it was issued against
- key: [decision_id]
- dedupePolicy: reject-duplicate
- concurrency: A second adverse decision on the same person is its own instance with its own path, however similar the reason looks.

EVENTS:
- canonicalEvent: adverse_decision_recorded
- sourceType: authoritative
- requiredEvidence: an authorised rejection, or a violation confirmed against the applicable rule version; the recorded reason and the scope it affects; the remediation, reapplication or finality semantics policy defines for that reason
- insufficientEvidence: a detection that has not been assessed; a review still in progress; a score or a flag with no decision behind it

DATA:
- decision_id (required) — used by: instance key
- subject_id (required) — used by: message destination
- reason (required) — used by: a.correctable content
- affected_scope (required) — used by: a.cleared content
- path_semantics (required) — used by: c.path — correctable/reapplicable/final selection
- correction_deadline_at (required) — used by: w.remediate timeout basis

SOURCE OF TRUTH:
- adverse_decision_recorded (the decision itself, and why) -> DEC-186 (records the rejection/violation and its remediation semantics), per distinctFrom — never re-argued here
- correction_recorded_complete / correction_failed / decision_withdrawn -> the system that owns the corrective action [engagementIsEvidenceOnly: true]

CONFIG:
- adverse_decision.touches: touch budget — one outcome statement, one follow-up (basis: operational SLA, required: false)
- adverse_decision.remediate: remediation deadline defined by policy (basis: legal requirement, timingClass: attribute-bound, required: true)

CHANNEL POLICY:
- a.correctable: eligible [email, in-app]; preferredWhen: persistent(email) default; in-session(in-app) when active in product; fallback: same-role-other-channel; urgency: normal; requiresPermission: false; requiresContactability: true
- a.cleared: eligible [email, in-app]; preferredWhen: same role logic as a.correctable; fallback: same-role-other-channel; urgency: low; requiresPermission: false; requiresContactability: true
- a.expired: eligible [email, in-app]; preferredWhen: same role logic; fallback: same-role-other-channel; urgency: normal; requiresPermission: false; requiresContactability: true
- a.reapply: eligible [email, in-app]; preferredWhen: same role logic; fallback: same-role-other-channel; urgency: low; requiresPermission: false; requiresContactability: true
- a.final: eligible [email, in-app]; preferredWhen: same role logic; no call to action attached by design; fallback: same-role-other-channel; urgency: low; requiresPermission: false; requiresContactability: true

SUPPRESSION / PREEMPTION:
none identified

HANDOFF:
none — this journey has no handoffs; every path resolves to an exit within its own graph.

OUTCOMES:
- primary: correction_recorded_complete
- secondary: none
- neutral: decision withdrawn before remediation (x.withdrawn)
- failure: decided against, with a stated route to a fresh request (x.reapply); final; no path onward is defined (x.final)
- diagnostic: complaint; message_after_success; unsubscribe

TEST CASES:
- happy-path: the decision reason is correctable and the subject corrects it inside the window -> a.correctable states what must change and by when; c.corrected catches correction_recorded_complete, a.cleared confirms, and x.corrected closes
- alternate-branch: policy defines no correction or reapplication for this reason -> c.path routes straight to a.final, with no call to action attached to soften a decision that has none
- timeout: the remediation window elapses uncorrected -> w.remediate times out to a.expired, which states plainly that the window closed before c.residual decides between a.reapply and a.final
- human-ownership: the decision itself is withdrawn before anything is corrected -> c.corrected routes to x.withdrawn rather than crediting a correction that never happened
- idempotency: a.cleared retried by delivery infrastructure -> idempotencyKey (issue_id + a.cleared) prevents a duplicate clearance confirmation

GAPS:
- none

---

## DOC-214 — Document Delivery

READINESS: READY_WITH_MAPPING

WHY:
This is a thin, disciplined wrapper: it deliberately does not build its own delivery path, instead raising a.distribute through 'the canonical communication mechanism' and keeping the document's validity strictly separate from its delivery state (DELIVERED/AVAILABLE vs unknown). The only real implementation task is wiring that canonical mechanism and the two recovery handoffs (reconciliation, CMS-208) to the company's actual document and comms systems.

INSTANCE:
- scope: the issued version, the intended recipient, and the distribution of one to the other
- key: [document_version_id, recipient_id]
- dedupePolicy: reject-duplicate
- concurrency: Distribution state describes the distribution and never the document; a superseding version requires its own distribution instance.

EVENTS:
- canonicalEvent: issued_document_requires_distribution
- sourceType: authoritative
- requiredEvidence: an issued document version with a party who is to receive it
- insufficientEvidence: a document drafted but not issued; a document already viewed or downloaded by its recipient, which is delivery having happened

DATA:
- document_version_id (required) — used by: instance key, version binding at a.version
- recipient_id (required) — used by: instance key, a.recipient
- issued_at (required) — used by: eligibility check (issued vs drafted)
- distribution_ref (required) — used by: a.distribute — the canonical communication mechanism's own record
- document_log (required) — used by: every action node's append-only audit trail

SOURCE OF TRUTH:
- distribution_confirmed vs distribution_failed -> the canonical communication mechanism's own delivery evidence (email/etc. provider) [engagementIsEvidenceOnly: true]
- the document's validity (unaffected by distribution outcome) -> the document management system — explicitly not this journey's authority

CONFIG:
- document_distribution.touches: touch budget fixed at instance open (basis: operational SLA, required: false)
- document_distribution.distribution: wait bounded by the canonical communication mechanism's own delivery window (basis: platform constraint, timingClass: external-window, required: true)

CHANNEL POLICY:
single channel, no policy needed

SUPPRESSION / PREEMPTION:
none identified

HANDOFF:
- h.reconcile -> external:external-status-reconciliation; requiredContext: the version, the recipient and everything last known about the delivery; the explicit fact that the document remains valid and issued regardless of how this resolves; ownershipTransfer: true; suppressSource: false
- h.recover -> CMS-208; requiredContext: the failure as the channel reported it, and the exact version that was being sent; the explicit requirement that any fallback route carries the same version; ownershipTransfer: true; suppressSource: false

OUTCOMES:
- primary: distribution_confirmed
- secondary: none
- neutral: none
- failure: distribution_failed (routed to h.recover)
- diagnostic: complaint; message_after_success; unsubscribe; distribution outcome unknown (a.unknown → h.reconcile)

TEST CASES:
- happy-path: an issued version with a resolved recipient and route -> a.distribute fires, delivery confirms inside the canonical mechanism's window, a.confirmed records DELIVERED and x.distributed closes the instance
- alternate-branch: the channel authoritatively reports failure -> c.outcome routes straight to h.recover, carrying the exact version so no fallback route ever sends a different one
- timeout: the canonical mechanism's delivery window elapses with no confirmed or failed outcome -> w.distribution times out to a.unknown, which records the outcome as unknown rather than assuming delivery, then hands off to h.reconcile
- idempotency: a.distribute is retried by an upstream retry mechanism -> idempotencyKey (document_version_id + issue_id + a.distribute) prevents a duplicate distribution raise
- duplicate-trigger: issued_document_requires_distribution fires twice for the same version/recipient pair -> the second trigger is rejected per eligibility (no instance already open for the issued version)

GAPS:
- none

---

## DOC-215 — Signature Reminder

READINESS: READY_WITH_MAPPING

WHY:
The graph correctly separates 'a signature requested' from 'a signature made', binds every request and reminder to an exact document version, and refuses to invent a signature deadline where the request's own terms are silent (a.unbounded explicitly records this rather than defaulting). Completion (c.complete) correctly loops back to w.signatures rather than proceeding on a partial set. Implementation work is mapping required_signers/signing_authority/signing_order to the company's e-signature/legal workflow and the two recovery handoffs (h.declined, DOC-216).

INSTANCE:
- scope: the document version, the signature process against it, and each required signer
- key: [document_version_id]
- dedupePolicy: reject-duplicate
- concurrency: The process is bound to a version; signatures do not carry to a successor version, which raises its own new process.

EVENTS:
- canonicalEvent: document_requires_signature
- sourceType: authoritative
- requiredEvidence: an issued or prepared document version requiring signature by identified parties
- insufficientEvidence: a document that requires acknowledgement rather than an authorised mark; a signature request already sent, which is the state this journey creates and not the one that starts it

DATA:
- document_version_id (required) — used by: instance key, all bindings
- document_id (required) — used by: lineage reference
- required_signers (required) — used by: a.define, attemptBudget on the signature loop
- signing_authority (required) — used by: c.event — validating a signature is by a signer with required authority
- signing_order (required) — used by: a.define — sequencing where it applies
- validity_ends_at (optional) — used by: w.signatures / w.expiry timeout basis when a window is defined
- review_point_at (optional) — used by: reminder timing when no validity window exists
- signer_destinations (optional) — used by: a.request / a.remind destination resolution

SOURCE OF TRUTH:
- signer_signed / signer_declined / document_version_superseded -> the e-signature or legal workflow system of record [engagementIsEvidenceOnly: true]
- whether a signature validity window is defined at all -> the document/process's own terms — explicitly not invented if silent

CONFIG:
- signature.reminders: only the reminder counts against the cap; the request itself is never rationed (basis: business policy, required: false)
- signature.reminder_point: reminder placed at the last point it could still change the outcome — from the request's validity or the process's review point (basis: business policy, timingClass: reminder-before-attribute, required: false)
- signature.validity_window: process end bound to validity_ends_at where defined, else the process's own review point — never invented (basis: legal requirement, timingClass: attribute-bound, required: false)
- signature.required_signers: attempt budget for the signature loop, fixed to the signer list at process open (basis: operational SLA, required: true)

CHANNEL POLICY:
- a.request: eligible [email]; preferredWhen: single channel — persistent(email), bound to the exact document version; fallback: same-role-other-channel; urgency: normal; requiresPermission: false; requiresContactability: true
- a.remind: eligible [email]; preferredWhen: single channel — same as a.request, sent only to outstanding signers; fallback: same-role-other-channel; urgency: normal; requiresPermission: false; requiresContactability: true

SUPPRESSION / PREEMPTION:
- A signature process bound to a document version is ended and its outstanding reminders suppressed the moment that version is superseded, so DOC-215 and DOC-220 (document conflict / resignature) can be open on the same lineage without contradicting each other — DOC-220's h.resign explicitly re-raises DOC-215 only for the signatures missing against the newly-authoritative version. (conflicts with: DOC-220)

HANDOFF:
- h.effective -> DOC-216; requiredContext: every signature, with its signer, authority, time and the version it binds to; the explicit fact that signed is not effective; ownershipTransfer: true; suppressSource: false
- h.declined -> external:operational-resolution; requiredContext: who declined, when and on what grounds where stated; the explicit fact that the document remains validly issued; ownershipTransfer: true; suppressSource: false

OUTCOMES:
- primary: signer_signed (all required signers, tracked to FULLY_SIGNED)
- secondary: signer_declined; document_version_superseded
- neutral: none
- failure: none
- diagnostic: complaint; reminder_to_signed_signer; invented_deadline_named; wrong_version_signed

TEST CASES:
- happy-path: all required signers sign the governed version before any reminder is needed -> c.complete resolves to a.fully-signed and h.effective hands off to DOC-216
- alternate-branch: a required signer declines -> a.declined records DECLINED with reason and hands off via h.declined without ending the document's validity
- superseding-state: the document version is superseded mid-process -> a.superseded ends the process, suppresses outstanding reminders, and x.superseded explicitly does not carry existing signatures to the successor
- timeout: the validity window (or review point) closes with signatures still outstanding -> w.expiry times out to a.expired, recording SIGNATURE_EXPIRED rather than misreporting it as a decline
- idempotency: a.request retried for the same signer -> idempotencyKey (document_version_id + signer_id + touch id) prevents a duplicate request/reminder

GAPS:
- P1 config: signature.reminder_point's default example ({min: 3 days, max: 5 days}) is explicitly marked confidence: low / basis: example-only in the canonical data — a company must replace it with a real policy value rather than treating the example as a default.

---

## DOC-220 — Document Conflict Review

READINESS: NEEDS_CONTRACT_WORK

WHY:
The graph's state machine is sound — it never deletes conflicting evidence, never treats 'newest' as 'authoritative', and correctly separates 'signature bound to wrong version' from 'business action taken on wrong version'. But the central judgment at c.identifiable — 'is the authoritative version deterministically identifiable' from lineage, issuance authority and effective semantics — names the criteria without naming who or what system executes that judgment. Every other journey in this batch resolves its authoritative facts by reading a single named system; this one requires synthesizing conflicting records across (at minimum) a document management system and an e-signature system with no stated algorithm or role, which is a real source-of-truth ambiguity rather than a plain company-mapping task.

INSTANCE:
- scope: the document lineage and every conflicting record claiming to be part of it
- key: [document_lineage_id, conflict_id]
- dedupePolicy: reject-duplicate
- concurrency: Every conflicting record is retained as evidence; a further inconsistency in the same lineage is assessed with this reconciliation as part of its evidence, so a resolved instance's history feeds the next one rather than being erased.

EVENTS:
- canonicalEvent: document_version_inconsistency_detected
- sourceType: authoritative
- requiredEvidence: a material inconsistency — different content under one identifier, an incorrect version distributed, a signature attached to the wrong version, a local copy differing from the authoritative record, several versions claiming current status, or a missing amendment link
- insufficientEvidence: two versions that differ by design, such as a draft alongside its issued form; a formatting difference between two renderings of the same version

DATA:
- document_lineage_id (required) — used by: instance key
- conflict_id (required) — used by: instance key
- conflicting_records (required) — used by: a.collect / a.authoritative — the full evidence set, never deleted
- signature_bindings (required) — used by: c.signature — which version each signature actually binds to
- distribution_history (required) — used by: c.acted — whether a non-authoritative version was ever sent
- document_log (required) — used by: every action's audit trail

SOURCE OF TRUTH:
- which version is authoritative (lineage + issuance authority + effective semantics) -> UNSPECIFIED — no named system or role executes this judgment; this is the core gap
- whether a signature binds to the authoritative version -> the e-signature/signature record system (shared with DOC-215)

CONFIG:
- document_conflict.touches: touch budget fixed at instance open (basis: operational SLA, required: false)

CHANNEL POLICY:
single channel, no policy needed

SUPPRESSION / PREEMPTION:
- DOC-220 (which version governs), DOC-215 (collecting signatures against a version) and DOC-286 (an effective version's entitlement) can all be open against the same document lineage at once: a signature process can be running while a conflict review is underway on an earlier version, and an already-effective version can later be found non-authoritative by DOC-220. The journeys stay compatible because DOC-220's h.resign re-raises DOC-215 scoped only to the signatures missing against the newly-authoritative version, and DOC-220 never itself alters effectiveness — but nothing in any of the three journeys checks whether the other two are concurrently open on the same lineage_id, so an implementation must add that cross-check itself. (conflicts with: DOC-215, DOC-286)

HANDOFF:
- h.review -> DEC-181; requiredContext: every conflicting record with its hash, issuance, signatures, effective dates and lineage; the explicit fact that nothing was deleted, corrected or promoted; ownershipTransfer: true; suppressSource: false
- h.resign -> DOC-215; requiredContext: the authoritative version and which signatures are missing against it; the explicit fact that existing signatures stand as evidence about their own versions and are not transferred; ownershipTransfer: true; suppressSource: false
- h.remedy -> REM-157; requiredContext: what was done, under which version, and what the authoritative version says instead; the explicit fact that the history is preserved intact; ownershipTransfer: true; suppressSource: false

OUTCOMES:
- primary: none
- secondary: none
- neutral: authoritative version established; conflicting records preserved and explained (x.reconciled)
- failure: none
- diagnostic: complaint; message_after_success; unsubscribe

TEST CASES:
- happy-path: a material inconsistency is detected and the authoritative version is deterministically identifiable with no downstream signature or distribution issue -> a.authoritative records the decision, c.signature and c.acted both clear, and x.reconciled closes with all conflicting records preserved
- alternate-branch: two versions have equal claim to authority -> a.cannot records DOCUMENT_RECONCILIATION_REQUIRED with nothing deleted or promoted, and h.review hands the intact conflict to DEC-181
- human-ownership: a signature was made against a version that turns out not to be authoritative -> a.sig-invalid preserves the signature as evidence for its own version and h.resign asks DOC-215 to collect only the missing signature against the authoritative version
- alternate-branch: a non-authoritative version was already used for a business action (payment, grant, decision) -> a.preserve-history keeps the record of what happened under which version and h.remedy hands the consequence — not the record — to REM-157
- idempotency: a.correct-distribution is retried -> idempotencyKey (document_version_id + issue_id + a.correct-distribution) prevents re-sending the correction

GAPS:
- P0 source-of-truth: c.identifiable's determination of 'the authoritative version' has no named system, role or algorithm — lineage, issuance authority and effective semantics are named as criteria, not as a procedure. A company cannot safely automate this branch without first defining who or what makes this call, and an incorrect automated determination here is the exact failure guardrail s.g1 warns against (treating the newest file as authoritative).
- P1 suppression: No cross-check exists between this journey, DOC-215 and DOC-286 for concurrently-open instances on the same document_lineage_id, despite all three being able to legitimately run in parallel on the same lineage (see SUPPRESSION note).

---

## DOC-286 — Document Activation

READINESS: READY_WITH_MAPPING

WHY:
The graph correctly separates 'signed' from 'effective' (only entering on document_recorded_effective, never on a signature set), and separates 'exercised' entitlements (which get a first-use wait and dormancy tracking) from 'held' standing entitlements (which don't get chased for use at all, per s.g3). Dormancy and no-longer-in-force are correctly recorded as distinct outcomes. Implementation work is mapping entitlement/first_action to real product capability checks and the two waits (first-use, dormancy) to real observation windows.

INSTANCE:
- scope: the effective document version and the entitlement it confers on its holder
- key: [document_version_id, person_id]
- dedupePolicy: reject-duplicate
- concurrency: A renewal or superseding version taking effect is its own instance and inherits nothing from this one.

EVENTS:
- canonicalEvent: document_recorded_effective
- sourceType: authoritative
- requiredEvidence: an authoritative record that this version is in force, revalidated at its effective moment; the entitlement it confers, expressed as something the holder can act on; a named holder with a permitted route to them
- insufficientEvidence: a complete set of signatures; a scheduled effective date that has not been revalidated; a condition that has not yet resolved

DATA:
- document_version_id (required) — used by: instance key
- person_id (required) — used by: instance key
- effective_at (required) — used by: a.in-force-actionable / a.in-force-standing content
- effective_period_ends_at (required) — used by: w.dormancy timeout basis
- entitlement (required) — used by: c.usable — exercised vs held
- first_action (required) — used by: a.in-force-actionable / a.reminder destination

SOURCE OF TRUTH:
- the document version is in force, revalidated at its effective moment -> DOC-216 (the journey that establishes and revalidates effectiveness), per distinctFrom
- capability_first_used -> the product system recording the holder's first exercise of the entitlement [engagementIsEvidenceOnly: true]

CONFIG:
- document_effective.touches: touch budget fixed at instance open (basis: operational SLA, required: false)
- document_effective.first_use: the period within which a holder would ordinarily have used the entitlement (basis: expected user rhythm, timingClass: observation-window, required: true)
- document_effective.dormancy: after the one reminder, observe until effective_period_ends_at (basis: business policy, timingClass: attribute-bound, required: true)

CHANNEL POLICY:
- a.in-force-actionable: eligible [email, in-app]; preferredWhen: persistent(email) default; in-session(in-app) when the holder is active in-product; fallback: same-role-other-channel; urgency: normal; requiresPermission: false; requiresContactability: true
- a.in-force-standing: eligible [email, in-app]; preferredWhen: same role logic as a.in-force-actionable; fallback: same-role-other-channel; urgency: low; requiresPermission: false; requiresContactability: true
- a.reminder: eligible [email, in-app]; preferredWhen: same role logic; single discretionary reminder naming the same first action; fallback: same-role-other-channel; urgency: low; requiresPermission: false; requiresContactability: true

SUPPRESSION / PREEMPTION:
- DOC-286 (an already-effective version's entitlement) can be running while DOC-220 (document conflict review) later determines that same version was not actually authoritative. DOC-286 has no mechanism to detect or unwind an in-progress entitlement communication if DOC-220 later reverses effectiveness, since DOC-286's own eligibility only checks that the record was effective at entry, not that it stays authoritative for the life of this instance. (conflicts with: DOC-220)

HANDOFF:
none — this journey has no handoffs; every path resolves to an exit within its own graph.

OUTCOMES:
- primary: capability_first_used
- secondary: none
- neutral: in force, nothing for the holder to exercise (x.standing)
- failure: none
- diagnostic: complaint; message_after_success; unsubscribe

TEST CASES:
- happy-path: an entitlement is exercisable and the holder uses it inside the first-use window -> a.in-force-actionable fires, w.first-use catches capability_first_used via c.what-happened, and x.used closes the instance
- alternate-branch: the entitlement is a standing protection with nothing to exercise -> c.usable routes to a.in-force-standing and x.standing closes immediately — never chased for use
- timeout: the first-use window elapses with the document still in force and unused -> c.still-in-force routes to a.reminder (the single discretionary reminder), then w.dormancy observes until effective_period_ends_at
- superseding-state: the document is superseded or revoked before ever being used -> c.what-happened routes to x.moot rather than x.dormant, correctly distinguishing 'ended first' from 'exercised'
- idempotency: a.reminder retried by delivery infrastructure -> idempotencyKey (document_version_id + person_id + a.reminder) prevents a duplicate reminder, honoring the 'one reminder, never two' guardrail

GAPS:
- P1 suppression: No mechanism revalidates this instance's effectiveness assumption mid-flight if DOC-220 later determines the version was not authoritative — see SUPPRESSION.

---

## FBK-41 — Feedback Request

READINESS: NEEDS_CONTRACT_WORK

WHY:
The eligibility gauntlet (complete, no open issue, not recently asked, within the ask budget) is thorough and well-guarded against reading a closed ticket or a login as consent. But FBK-41 and FBK-42 (Advocacy Request) explicitly share one exclusionGroup ("outbound-ask") with a precedence rule that states plainly that policy must order them and that "neither is assumed to outrank the other" — with no default given. When both are eligible for the same person in the same budget window, nothing in either graph decides who sends. That is a genuine P0 authority gap, not a graph defect.

INSTANCE:
Scope: person or account plus the specific experience being asked about
Key: person_id + experience_ref
Dedupe policy: reject-duplicate
Concurrency note: A different experience for the same person is its own instance; c.recent additionally suppresses a near-duplicate ask about the same context.

EVENTS:
Canonical event: potential_feedback_moment (source: authoritative)
Required evidence: an experience reaching a point worth asking about: a transaction completed, a service interaction finished, an onboarding milestone reached, a support case resolved, a meaningful usage milestone
Insufficient alone: a transaction started; a ticket closed by an agent while the customer is still describing the problem; an elapsed interval with no experience behind it

DATA:
- person_id — instance key
- experience_ref — instance key; destination binding
- experience_type — c.complete / c.moment timing
- completed_at — c.complete
- open_issue_ref — c.open-issue
- last_asked_at — c.recent / c.moment ask-frequency check
- has_active_session (optional) — in-session channel eligibility
- has_push_token (optional) — low-friction (push) channel eligibility
- completion_horizon (optional) — w.completion timeout basis

SOURCE OF TRUTH:
- whether the experience is actually complete from the person's side -> operational system of record for the experience (order/service/ticket system) [engagement is evidence-only]
- whether an issue is open in the same context -> issue/complaint system (FBK-46) [engagement is evidence-only]
- whether feedback was already collected recently for this context -> feedback log [engagement is evidence-only]
- whether this ask sits inside the person's cross-context ask-frequency budget -> contact-frequency / pressure ledger [engagement is evidence-only]

CONFIG:
- feedback_request.touches — one ask per experience; an unanswered ask is never repeated (basis: business policy, required: false)
- feedback_request.ask_frequency — the bound on how often a person is asked anything (satisfaction or advocacy) across all contexts (basis: business policy, timingClass: cooldown, required: false)
- feedback_request.completion_horizon — the horizon by which this kind of experience should have completed; past it, never ask (basis: operational SLA, timingClass: external-window, required: true)
- feedback_request.response_window — how long the ask stays open for a response before it is recorded as no-response (basis: expected user rhythm, timingClass: response-window, required: false)

CHANNEL POLICY:
- a.request: eligible [in-app, email, push] — preferredWhen: in-app when the experience ended in-product and the person is still there; email when it ended elsewhere or they've left; push when a valid token exists and the question is answerable in one step; fallback: [same-role-other-channel]; urgency: low; requiresPermission: true; requiresContactability: true

SUPPRESSION / PREEMPTION:
- s.open-issue defers any ask entirely while an issue is open in the same context — resolution owns the person before satisfaction does, and that issue is FBK-46's. (conflicts with: FBK-46)
- Shares the outbound-ask exclusionGroup with FBK-42 (Advocacy Request); policy is required to order satisfaction vs advocacy asks against each other but no default precedence is given anywhere in either journey. (conflicts with: FBK-42)

HANDOFF:
none

OUTCOMES:
Primary: x.received — feedback received; ownership of what it means passes to FBK-43 via the feedback_submitted event
Neutral: x.not-now — eligible in principle but outside the ask-frequency budget; x.duplicate — suppressed as a duplicate ask
Failure: x.no-response — asked, no response (never read as a negative signal); x.never-completed — the experience never completed inside its horizon; x.deferred — deferred while an issue is open

TEST CASES:
- happy-path: a completed experience with no open issue, not recently asked, inside the ask budget -> a.request fires on the appropriate channel; a response yields x.received
- alternate-branch: the experience has not yet completed -> w.completion waits for experience_completed before re-checking eligibility
- timeout: the experience never completes inside its horizon -> w.completion times out to x.never-completed
- timeout: the ask goes unanswered inside the response window -> w.response times out to x.no-response, never treated as a negative signal
- duplicate-trigger: a context already asked about recently receives another potential_feedback_moment -> c.recent routes to x.duplicate
- contactability-loss: no push token exists and the person is not in-session -> channel selection falls back to the persistent (email) role
- idempotency: the request touch is retried for the same person_id + experience_ref -> idempotencyKey person_id + experience_ref + touch id dedupes it

GAPS:
- P0 [config] No default precedence exists between FBK-41 (satisfaction ask) and FBK-42 (advocacy ask) when both are eligible in the same outbound-ask budget window; the corpus explicitly states policy must decide and that neither outranks the other by default, so an implementer must supply a tie-break rule or the two journeys will race non-deterministically for the same ask slot.
- P2 [handoff] x.received hands conceptual ownership of the incoming feedback to FBK-43, but this is an event-driven connection (feedback_submitted -> FBK-43's own trigger), not a modeled handoff node with requiredContext — worth documenting explicitly even though it is architecturally sound.

---

---

## FBK-42 — Advocacy Request

READINESS: NEEDS_CONTRACT_WORK

WHY:
The eligibility evaluation (accumulated evidence, not a single signal; open negative issue suppresses entirely; ask size matched to commitment level) is careful and well-guarded. Two implementation-blocking issues survive migration: it shares FBK-41's undefined outbound-ask precedence, and a.ask-heavy declares push (a low-friction, interruptive channel) as an eligible channelRole even though its own purpose text explicitly argues against an interruptive route for a high-commitment ask ("not an interruption to be tapped past; it needs somewhere they can read it twice") — the channel declaration contradicts the action's own documented intent.

INSTANCE:
Scope: person or account plus the relationship context the advocacy would be about
Key: account_id + relationship_id
Dedupe policy: reject-duplicate
Concurrency note: The cooldown between instances for the same account+relationship is required (not optional, per contact.cooldown.required=true) — a re-qualifying relationship is tracked but not re-messaged inside it.

EVENTS:
Canonical event: potential_advocacy_opportunity (source: behavioral)
Required evidence: a moment where an advocacy request would be contextually sensible, against a relationship with positive evidence behind it
Insufficient alone: a single login; a completed purchase; one high survey score; a positive reply to a support agent

DATA:
- account_id — instance key
- relationship_id — instance key; destination binding
- advocacy_evidence — a.evaluate / c.sufficient
- open_negative_issues — c.negative
- decline_cooldown_until — cooldown gating after a decline

SOURCE OF TRUTH:
- whether the accumulated relationship evidence is sufficient to ask -> relationship/customer-health evidence store (aggregated CSAT, tenure, recoveries, unsolicited contributions) [engagement is evidence-only]
- whether an open negative issue exists anywhere in the relationship -> issue/complaint system (FBK-46) [engagement is evidence-only]
- what came back — contributed, contributed-for-reuse, or declined -> advocacy contribution/response record [engagement is evidence-only]

CONFIG:
- advocacy_eligibility.touches — touch budget for the plan (2: light or heavy ask, no follow-up sequence) (basis: business policy, required: false)
- advocacy_eligibility.cooldown — mandatory cooldown between instances for the same account+relationship after a decline or no-response (basis: business policy, required: true)
- advocacy_eligibility.response — the bounded response window for an ask before it is recorded as no-response (basis: expected user rhythm, timingClass: response-window, required: true)

CHANNEL POLICY:
- a.ask-light: eligible [email, in-app, push] — preferredWhen: email to keep it, in-app when active in product, push (low-friction, single-step) when a valid token exists; fallback: [same-role-other-channel]; urgency: low; requiresPermission: true; requiresContactability: true
- a.ask-heavy: eligible [email, in-app, push] — preferredWhen: a durable, reviewable route the person can read twice — the action's own text argues against an interruptive route, which contradicts push's inclusion here; fallback: [same-role-other-channel]; urgency: low; requiresPermission: true; requiresContactability: true

SUPPRESSION / PREEMPTION:
- s.g6 — an open negative issue anywhere in the relationship suppresses this entirely, regardless of positive evidence. (conflicts with: FBK-46, FBK-43)
- Shares the outbound-ask exclusionGroup with FBK-41 (satisfaction ask); same undefined precedence gap. (conflicts with: FBK-41)

HANDOFF:
- h.permission -> CON-31; requiredContext: what would be used, where, and for how long — the permission scope; the contribution itself, held unpublished until that permission exists; ownershipTransfer: true; suppressSource: true

OUTCOMES:
Primary: x.contributed — contributed for internal use; h.permission — contributed with intended public reuse, handed to CON-31
Neutral: x.delay — not yet eligible; evidence may accumulate; x.suppressed — suppressed while an open negative issue exists
Failure: x.declined — declined, cooldown in force; x.no-response — no response; nothing inferred about the relationship

TEST CASES:
- happy-path: sufficient positive evidence and a low-commitment moment -> a.ask-light fires once; a rating comes back as x.contributed
- alternate-branch: evidence supports a high-commitment ask (testimonial/case study) -> a.ask-heavy fires on a durable route instead of a.ask-light
- timeout: the ask goes unanswered inside the response window -> w.response times out to x.no-response; the relationship is not re-asked immediately
- permission-loss: the contribution is intended for public reuse -> h.permission hands to CON-31 before anything is published; contributing itself is never treated as publish permission
- idempotency: the ask-heavy touch is retried for the same account_id+relationship_id -> idempotencyKey account_id + relationship_id + a.ask-heavy dedupes it

GAPS:
- P0 [config] Same outbound-ask precedence gap as FBK-41: no default ordering between advocacy and satisfaction asks sharing the exclusionGroup.
- P1 [channel] a.ask-heavy declares low-friction (push) as an eligible channelRole even though its own purpose text explicitly rules out an interruptive route for a high-commitment ask; the declared eligible-channel set contradicts the action's documented intent.

---

---

## FBK-43 — Feedback Follow-Up

READINESS: NEEDS_CONTRACT_WORK

WHY:
This is the corpus's central feedback router (it absorbed the former FBK-44/FBK-45) and the branching itself — PRAISE/SERVICE_ISSUE/COMPLAINT/SUPPORT_NEED/PRODUCT_FEEDBACK/GENERAL_COMMENT/UNKNOWN, each to its own owner — is complete and well-guarded (no manufactured fault, no generic thank-you, feedback and the issue it produces kept as separate entities). The blocker is that the journey declares three channels (email, in-app, task) but channelStrategy.roles only maps email and in-app; "task" has no role, no destination, and is not even represented among the three modeled touches, even though a.obligation and a.escalate are execution:"human" actions that plainly need internal work-item routing. That is a P0 channel gap by the audit's own standard: three declared channels, only two explained.

INSTANCE:
Scope: the feedback record, linked to the person and the experience it is about
Key: feedback_id
Dedupe policy: reject-duplicate
Concurrency note: Each new feedback submission is its own record and instance; further feedback about the same experience opens its own separate record rather than reopening this one.

EVENTS:
Canonical event: feedback_received (source: declared)
Required evidence: feedback submitted through any channel, attributable to a person and an experience; enough substance to say what it is about - a description, a referent, or a score with words behind it
Insufficient alone: a survey opened but never submitted; an internal note about the person that the person did not write; a bare score with nothing written, which is stored as a score and not routed

DATA:
- feedback_id — instance key; most idempotencyKeys
- person_id — acknowledgement destination binding
- experience_ref — c.existing case matching
- submitted_at — audit trail
- content — a.classify; c.recognition / c.acknowledge observes
- classification — c.route
- score (optional) — classification input
- open_issue_ref (optional) — c.existing
- promised_followup_at (optional) — w.followup timeout
- escalation_policy_id (optional) — c.severity

SOURCE OF TRUTH:
- the operational classification (PRAISE/COMPLAINT/etc.) -> feedback classification engine/rules (a.classify) [engagement is evidence-only]
- whether an open issue already covers this feedback -> issue/case system (FBK-46) [engagement is evidence-only]
- whether the relationship now meets advocacy eligibility -> relationship evidence store (shared with FBK-42) [engagement is evidence-only]
- whether escalation criteria apply -> escalation policy engine [engagement is evidence-only]
- whether the work item's operational outcome was recorded -> the owning operational process's own work-item tracker [engagement is evidence-only]

CONFIG:
- feedback.touches — one acknowledgement per feedback record, on whichever route it took (basis: business policy, required: false)
- feedback.cooldown — cooldown between records (none — each record is its own instance) (basis: business policy, required: false)
- feedback.obligation_sla — the wait for a SUPPORT_NEED work item is the OWNING process's own SLA; this journey deliberately never invents one (basis: operational SLA, timingClass: decision-sla, required: true)
- feedback.promise_window — how long a promised follow-up is waited for before it is escalated as broken (never simply expires) (basis: business policy, timingClass: response-window, required: false)

CHANNEL POLICY:
- a.acknowledge: eligible [email, in-app] — preferredWhen: email to keep it; in-app when the feedback was given in-product and the person is still there; fallback: [same-role-other-channel]; urgency: low; requiresPermission: false; requiresContactability: true
- a.acknowledge-positive: eligible [email, in-app] — preferredWhen: same as a.acknowledge; must name the specific thing praised; fallback: [same-role-other-channel]; urgency: low; requiresPermission: false; requiresContactability: true
- a.acknowledge-negative: eligible [email, in-app] — preferredWhen: same as a.acknowledge; used only when nothing operational is actionable; fallback: [same-role-other-channel]; urgency: low; requiresPermission: false; requiresContactability: true
- a.obligation: eligible [task] — preferredWhen: UNMAPPED — declared as the journey's third channel but given no channelStrategy role, no destination, and no touch entry; execution is human/internal work-item creation; urgency: normal; requiresPermission: false; requiresContactability: false
- a.escalate: eligible [task] — preferredWhen: UNMAPPED — same gap as a.obligation; severity-driven internal escalation with no modeled channel binding; urgency: high; requiresPermission: false; requiresContactability: false

SUPPRESSION / PREEMPTION:
- h.issue explicitly suppresses any automated satisfaction or retention outreach about the same experience while the issue is open in FBK-46 — this covers FBK-41 asks and any retention journeys on the same account. (conflicts with: FBK-41, FBK-46)
- s.existing-case — negative feedback matching an already-open FBK-46 case is attached to it (a.attach); no second case and no parallel recovery is opened. (conflicts with: FBK-46)
- Praise reaching the advocacy threshold hands to FBK-42 via h.advocacy rather than FBK-43 asking directly, avoiding a duplicate advocacy ask. (conflicts with: FBK-42)

HANDOFF:
- h.triage -> DEC-181; requiredContext: the record, unclassified, so a person reads what was written rather than a guess; ownershipTransfer: true; suppressSource: true
- h.contribution -> external:advocacy-contribution; requiredContext: the contribution as given; the explicit fact that offering it is not permission to publish it; feedback_id, person_id, contribution, offered_at (contract.requiredFields); ownershipTransfer: true; suppressSource: true
- h.advocacy -> FBK-42; requiredContext: the evidence set, not only the latest item; the context the positive experience was in; ownershipTransfer: true; suppressSource: true
- h.issue -> FBK-46; requiredContext: the person's own account of it, unedited; the severity and whether policy escalation was applied; the link back to the feedback record, which stays open independently; ownershipTransfer: true; suppressSource: false
- h.promise -> DEC-181; requiredContext: what was promised, when, and what has happened operationally since; ownershipTransfer: true; suppressSource: true

OUTCOMES:
Primary: x.closed — loop closed (nothing promised, or a promise honored); x.acknowledged — heard, nothing to fix
Secondary: promised_followup_delivered
Neutral: x.stored — stored, nothing owed; x.attached — attached to an existing FBK-46 case; x.evidence — recorded as relationship evidence, no advocate state created
Failure: x.open — obligation outstanding past the owning process's SLA, loop not closed

TEST CASES:
- happy-path: praise with substance behind it, not yet advocacy-eligible -> a.persist-positive -> a.acknowledge-positive -> c.contribution (nothing volunteered) -> c.eligible (not yet) -> x.evidence
- alternate-branch: a complaint matching an already-open FBK-46 case -> c.existing routes to a.attach -> x.attached; no second case opens
- timeout: a SUPPORT_NEED work item's owning process misses its own SLA -> w.outcome times out to x.open; the record stays open rather than closing silently
- late-event: work_item_outcome_recorded arrives after x.open was already recorded -> per the exit's own reEntry note, the late outcome reopens the record to close the loop
- human-ownership: a SERVICE_ISSUE meets the escalation policy's severity criteria -> a.escalate (execution: human) applies the escalation before h.issue hands to FBK-46
- duplicate-trigger: the same feedback_id is redelivered -> idempotencyKey feedback_id on a.persist dedupes it

GAPS:
- P0 [channel] "task" is declared as one of three journey-level channels but has zero channelStrategy role, zero destination binding, and zero orchestration.touches entry; the two execution:"human" actions that would use it (a.obligation, a.escalate) are entirely unmodeled at the orchestration layer.
- P1 [handoff] The h.contribution branch (someone volunteers a reusable contribution) bypasses FBK-43's own advocacy-eligibility check (c.eligible) entirely, handing straight to external:advocacy-contribution — it is undocumented whether that external consumer re-applies FBK-42's eligibility rules or duplicates the ask.

---

---

## FBK-46 — Complaint Resolution

READINESS: READY_WITH_MAPPING

WHY:
The human-escalation-ladder graph (assign, wait against SLA, escalate internally when missed, confirm with the person only when required and reachable, close confirmed vs unconfirmed as distinct facts) is thorough and its idempotencyKeys correctly use this journey's own issue_id throughout — unlike several other journeys in this batch. The one real gap is that "task" is a declared channel with no channelStrategy role, though the risk is lower here since a.assign/a.escalate are purely internal ticket-assignment actions with an obvious real-world mapping.

INSTANCE:
Scope: the issue or complaint itself
Key: issue_id
Dedupe policy: merge-into-open
Concurrency note: Duplicates of the same underlying problem are reconciled and merged at a.capture (s.duplicate-case) rather than creating a second issue; a genuinely different problem is its own instance.

EVENTS:
Canonical event: actionable_issue_created (source: authoritative)
Required evidence: a formally created issue with a type, a severity and a related entity
Insufficient alone: a negative sentiment score with no operational failure identified behind it; a support conversation that has not yet concluded anything is actually wrong

DATA:
- issue_id — instance key; all idempotencyKeys
- person_id — a.request-confirmation destination
- issue_type — c.owner routing
- severity — w.resolution SLA; c.severity in FBK-43's escalation, mirrored here
- related_entity — c.owner routing; duplicate reconciliation
- sla_threshold — w.resolution timeout
- source — audit trail
- owner_id — a.assign
- escalation_level (optional) — a.escalate / c.levels
- fix_performed (optional) — c.confirmation
- confirmation_required (optional) — c.confirmation
- permitted_routes (optional) — c.confirm-route

SOURCE OF TRUTH:
- whether the fix was actually performed -> operational fix-tracking / ticketing system (human-owned) [engagement is evidence-only]
- whether the person confirms the fix resolved their issue -> issue confirmation record (explicit reply, not a status flag) [engagement is evidence-only]
- who owns the issue when not immediately determinable -> ownership/routing rules engine (OWN-51 for orphans) [engagement is evidence-only]

CONFIG:
- complaint.confirmation_asks — how many times the confirmation question may be asked against a performed fix, bounded by the reopen budget (basis: operational SLA, required: false)
- complaint.cooldown — cooldown between instances (none — each issue is its own instance) (basis: business policy, required: false)
- complaint.sla_threshold — the SLA threshold this issue's severity is held against (basis: operational SLA, timingClass: decision-sla, required: true)
- complaint.escalation_levels — the escalation ladder's length (notify, involve team/manager, reassign to priority queue) (basis: business policy, required: false)
- complaint.reopen_budget — how many times a disputed resolution reopens the fix before going up the ladder instead (basis: business policy, required: false)
- complaint.closure_window — how long the person is given to confirm before the issue closes unconfirmed (basis: operational SLA, timingClass: response-window, required: false)

CHANNEL POLICY:
- a.request-confirmation: eligible [email, in-app] — preferredWhen: email to keep the record of what was fixed; in-app when the issue was raised in-product and the person is active there; fallback: [same-role-other-channel]; urgency: normal; requiresPermission: true; requiresContactability: true
- a.assign: eligible [task] — preferredWhen: UNMAPPED at the orchestration layer — internal ticket assignment; declared channel with no channelStrategy role, lower risk since it is purely internal; urgency: normal; requiresPermission: false; requiresContactability: false
- a.escalate: eligible [task] — preferredWhen: UNMAPPED — internal escalation up the ladder; same gap as a.assign; urgency: high; requiresPermission: false; requiresContactability: false

SUPPRESSION / PREEMPTION:
- s.human-owner — while a human owns the issue, automated satisfaction and retention outreach on the same account is paused (exclusionGroup retention-outreach, onLoss: paused); the issue outranks it. (conflicts with: FBK-41, FBK-42)

HANDOFF:
- h.orphan -> OWN-51; requiredContext: the issue and everything known about it; the fact that its SLA is already running, so assignment is not the start of the clock; ownershipTransfer: true; suppressSource: true
- h.escalate -> external:human-in-the-loop-lifecycle; requiredContext: the full history: owners, escalations, elapsed time; what is still unresolved; issue_id, person_id, severity, escalation_history, fix_status (contract.requiredFields); ownershipTransfer: true; suppressSource: true

OUTCOMES:
Primary: x.closed — resolved and confirmed by the person
Secondary: x.closed-unconfirmed — fixed operationally, closure not confirmed by the person
Failure: h.escalate — issue outlived the entire escalation ladder

TEST CASES:
- happy-path: an issue is assigned, fixed inside its SLA, and the person confirms it -> a.assign -> w.resolution (met) -> c.confirmation (required) -> a.request-confirmation -> confirmed -> a.close -> x.closed
- alternate-branch: the fix is verifiable operationally and policy does not require confirmation -> c.confirmation routes directly to a.close, skipping the confirmation ask entirely
- timeout: the SLA threshold is missed -> a.escalate runs (internal only, nothing customer-facing) and the ladder continues via c.levels
- human-ownership: the escalation ladder is exhausted with the issue still open -> h.escalate hands to external human-in-the-loop lifecycle
- contactability-loss: confirmation is required but no permitted route to the reporter exists -> c.confirm-route routes to a.close-unconfirmed, recorded as a distinct fact from a confirmed closure
- duplicate-trigger: a second report of the same underlying problem arrives -> a.capture reconciles it into the existing issue rather than opening a second one

GAPS:
- P1 [channel] "task" is a declared journey channel with no channelStrategy role, mirroring FBK-43's gap though at lower risk since a.assign/a.escalate are purely internal ticket-management actions with an obvious real-world mapping.
- P2 [config] complaint.reopen_budget and complaint.confirmation_asks both bound how many times the confirmation/reopen loop can run, without a stated relationship between the two — an implementer needs to reconcile which one actually governs.

---

---

## FBK-47 — Appeal Review

READINESS: NEEDS_CONTRACT_WORK

WHY:
The graph itself is sound: the original decision is never edited in place, a hold is recorded distinctly from a reversal, and both waits (review, more-info) are correctly bound to the same appeal_deadline_at so requesting more information never silently extends the deadline. But every idempotencyKey in this journey (a.link, a.reject, a.hold, a.apply, a.request-more-info, a.communicate-outcome) references "issue_id" — a field that does not exist anywhere in this journey's own required attributes, which use appeal_id as the instance key. This looks like copy-paste residue from FBK-46's template and blocks correct exactly-once implementation as written.

INSTANCE:
Scope: the appeal, linked to the original decision it disputes
Key: appeal_id
Dedupe policy: reject-duplicate
Concurrency note: Review is per appeal; a further appeal against a different decision is its own instance with no cooldown between them.

EVENTS:
Canonical event: appeal_or_dispute_submitted (source: declared)
Required evidence: a submission contesting an identifiable prior decision
Insufficient alone: dissatisfaction with an outcome that names no decision; a complaint about how a decision was communicated rather than about the decision

DATA:
- appeal_id — instance key (idempotencyKeys incorrectly reference issue_id instead — see gaps)
- original_decision_id — a.link
- appellant_id — standing check in c.eligible
- appeal_deadline_at — w.review and w.more-info timeout binding
- hold_policy — c.hold
- reviewer_independence — review assignment (per policy, outside this journey)
- appeal_log — every writes:append action

SOURCE OF TRUTH:
- eligibility for review (in time, standing, reviewable decision) -> appeals policy engine [engagement is evidence-only]
- the review's conclusion (UPHELD/REVERSED/MODIFIED/MORE_INFORMATION_REQUIRED) -> independent human review process, per policy-defined reviewer_independence [engagement is evidence-only]

CONFIG:
- appeal_and.touches — touch budget for the plan (3) (basis: business policy, required: false)
- appeal_and.cooldown — cooldown between instances (none — per-appeal) (basis: business policy, required: false)
- appeal_and.review — the review deadline, bound to appeal_deadline_at (basis: legal requirement, timingClass: attribute-bound, required: true)
- appeal_and.more_info — requested information is waited for only until the same appeal_deadline_at — never extended by the request (basis: legal requirement, timingClass: attribute-bound, required: true)
- appeal_and.request_more_info_budget — the bounded number of more-info request rounds before the instance takes its timeout path (basis: business policy, required: true)

CHANNEL POLICY:
- a.reject: eligible [email] — preferredWhen: single channel, no policy needed; urgency: normal; requiresPermission: true; requiresContactability: true
- a.request-more-info: eligible [email] — preferredWhen: single channel, no policy needed; urgency: normal; requiresPermission: true; requiresContactability: true
- a.communicate-outcome: eligible [email] — preferredWhen: single channel, no policy needed; urgency: normal; requiresPermission: true; requiresContactability: true

SUPPRESSION / PREEMPTION:
none identified

HANDOFF:
- h.deadline -> DEC-181; requiredContext: the appeal, original decision and everything gathered; the fact that no outcome has been reached, so nothing downstream records one; ownershipTransfer: true; suppressSource: true

OUTCOMES:
Primary: x.concluded — review concluded (UPHELD, REVERSED or MODIFIED); original decision and outcome both preserved
Neutral: x.rejected — appeal not eligible; original decision unchanged
Failure: h.deadline — review deadline passed without a conclusion

TEST CASES:
- happy-path: an eligible appeal with no hold required -> w.review -> a conclusion -> a.apply -> a.communicate-outcome -> x.concluded
- alternate-branch: policy requires the original decision held pending review -> c.hold routes to a.hold (a suspension, distinct from a reversal) before w.review
- timeout: the appeal_deadline_at passes with no conclusion (either during w.review or w.more-info) -> both timeout paths converge on h.deadline; nothing downstream records an outcome
- late-event: the requested additional information arrives after appeal_deadline_at has already passed -> not handled — w.more-info's own timeout already routed to h.deadline before the information could be used
- idempotency: a.apply is retried for the same appeal -> as documented, the idempotencyKey references issue_id, a field this journey never collects — idempotency cannot be correctly implemented until it is corrected to appeal_id

GAPS:
- P0 [instance] Every idempotencyKey in this journey (a.link, a.reject, a.hold, a.apply, a.request-more-info, a.communicate-outcome) references "issue_id" — a field absent from this journey's own required attributes (appeal_id is the actual instance key). This looks like unedited residue from FBK-46's template and must be corrected before idempotent side effects can be implemented.

---

---

## FBK-49 — Missing Information Reminder

READINESS: NEEDS_CONTRACT_WORK

WHY:
The graph correctly refuses to ask for anything an authoritative system already holds, names the blocked process in every request, and routes to the actual holder of the item (customer vs internal party) rather than always asking the customer. But every idempotencyKey (a.identify, a.request, a.request-internal, a.persist) references "person_id" — a field this journey never declares in its required attributes, which use blocked_entity_id + requirement_id as the instance key. Correcting that is a prerequisite for safe implementation.

INSTANCE:
Scope: the business entity that is blocked plus the specific missing requirement
Key: blocked_entity_id + requirement_id
Dedupe policy: reject-duplicate
Concurrency note: One instance per missing requirement per blocked process; two gaps on the same entity are two independent instances, resolvable by different people at different times.

EVENTS:
Canonical event: required_data_missing_and_blocking (source: authoritative)
Required evidence: a named business process that cannot safely proceed, and the specific field, document or value it is waiting on
Insufficient alone: a profile field that would be useful to have; data that would improve a future decision while blocking nothing today

DATA:
- blocked_entity_id — instance key (idempotencyKeys incorrectly reference person_id instead — see gaps)
- requirement_id — instance key; destination binding
- blocked_process — naming what the request unblocks (s.g3)
- provider — c.provider routing
- deadline_at — w.received / a.request-internal running deadline
- blocking_requirement_log — a.identify / a.persist writes

SOURCE OF TRUTH:
- whether an authoritative system already holds the item -> system(s) of record for the blocked process's own domain [engagement is evidence-only]
- whether what arrived satisfies the requirement -> the requirement's own validation rule (c.valid) [engagement is evidence-only]

CONFIG:
- missing_critical.touches — touch budget for the plan (2) (basis: business policy, required: false)
- missing_critical.cooldown — cooldown between instances (none — per requirement) (basis: business policy, required: false)
- missing_critical.received — how long the request is waited on, sized to what the blocked process can afford (not a fixed value across processes) (basis: operational SLA, timingClass: response-window, required: true)

CHANNEL POLICY:
- a.request: eligible [email, in-app] — preferredWhen: sent to the customer/account holder when only they hold the item or policy requires it directly from them; fallback: [same-role-other-channel]; urgency: normal; requiresPermission: true; requiresContactability: true
- a.request-internal: eligible [task] — preferredWhen: raised as owned work against the internal party who holds the item; never routed down a customer channel; urgency: normal; requiresPermission: false; requiresContactability: false

SUPPRESSION / PREEMPTION:
none identified

HANDOFF:
- h.escalate -> external:human-in-the-loop-lifecycle; requiredContext: the missing item, who was asked, and what is blocked; what has already been tried, so the person does not repeat a failed request; person_id, handed_at, reason (contract.requiredFields); ownershipTransfer: true; suppressSource: true

OUTCOMES:
Primary: x.resumed — requirement satisfied; the blocked process is free to continue
Neutral: x.alternate — the blocked process proceeds by a route that does not need this item
Failure: x.abandoned — requirement unmet; the blocked process stays blocked and says so

TEST CASES:
- happy-path: an authoritative system already holds the item -> c.authoritative routes to a.retrieve, skipping any request to a person
- alternate-branch: only the customer holds the item -> c.provider routes to a.request (customer channel) rather than a.request-internal
- alternate-branch: only an internal party holds the item -> c.provider routes to a.request-internal (task channel), never down a customer route
- timeout: nothing arrives inside the process-specific wait window and the process is critical enough to own -> c.criticality routes to h.escalate rather than x.abandoned
- duplicate-trigger: a second, distinct missing requirement is identified on the same blocked entity -> a separate instance opens keyed on the new requirement_id
- idempotency: a.request is retried for the same blocked_entity_id + requirement_id -> as documented, the idempotencyKey references person_id, a field absent from this journey's required data — must be corrected to blocked_entity_id + requirement_id

GAPS:
- P0 [instance] Every idempotencyKey (a.identify, a.request, a.request-internal, a.persist) references "person_id", a field this journey never declares in required attributes; the real instance key is blocked_entity_id + requirement_id.

---

---

## FIN-134 — Payment Failure Recovery

READINESS: READY_WITH_MAPPING

WHY:
The most thoroughly specified journey in this batch: an explicit provider-failure taxonomy (temporary, insufficient funds, invalid/expired method, authentication required, provider failure, policy decline, unknown reason) drives every branch, decline reasons are never invented beyond what the provider actually said, retries are idempotency-keyed against the original attempt, and — notably — charging a customer-selected alternate method is explicitly gated behind either standing authority or an explicit customer choice, so no internal action ever picks a payment method on the customer's behalf. Every touch's channel selection is fully specified (session presence, urgent-horizon plus permission). What remains is mapping the provider's real decline codes onto the seven-way taxonomy and the company's own grace/overdue/restriction policy.

INSTANCE:
scope: the failed attempt, the obligation behind it and the customer relationship it belongs to
key: [obligation_id]
dedupe policy: merge-into-open
concurrency note: Per GLB-19: a second failure on the same obligation is an event inside the already-open instance, not a new instance. An attempt whose outcome is unknown is reconciled first (FIN-135, GLB-20) before this journey's eligibility is even evaluated.

EVENTS:
canonical event: `authoritative_payment_failure`
source type: authoritative
required evidence:
- a payment system stating that the attempt failed, with whatever reason it gave
insufficient evidence:
- a timeout, which establishes nothing about whether money moved

DATA:
- `obligation_id` — used by instance key
- `person_id` — used by all communication
- `amount_outstanding` — used by all touches
- `currency` — used by all touches
- `failure_class` — used by c.class routing
- `failed_at` — used by a.classify
- `method_id` — used by a.corrective destination
- `alternate_methods` — used by c.alternate
- `consequence_date` — used by w.recovery / w.alternate-choice timing; a.remind content
- `provider_reason_code` (optional) — used by a.classify (never exposed to customer)
- `grace_policy_id` (optional) — used by c.next
- `has_active_session` (optional) — used by channel selection

SOURCE OF TRUTH:
- the failure class (a.classify) → payment provider's own reported reason
- whether an alternate route may be charged without asking (c.alternate) → standing payment authority on file, else explicit customer selection
- recovery outcome (c.recovered) → payment system of record (engagement is evidence-only, never the outcome)

CONFIG:
- `payment.discretionary_touches` — only the reminder counts against the cap; the corrective request and discharge confirmation are obligations, not touches (corpus default 1) (basis: business policy; has a default)
- `payment.alternate_choice_window` — how long the customer's method choice is waited for (basis: expected user rhythm, timing class: response-window; has a default)
- `payment.reminder_point` — when the single reminder fires relative to the consequence date (basis: operational SLA, timing class: reminder-before-attribute; has a default)
- `payment.recovery_window` — the obligation class's own grace/consequence policy end point (basis: operational SLA, timing class: recovery-window; required)

CHANNEL POLICY:
- **a.corrective**: eligible [in-app, email]; preferred when in-app when an active session exists (the corrective action is a form, shortest route is in-product); email otherwise; fallback [email]; urgency normal; requires permission: false; requires contactability: true
- **a.offer-alternate**: eligible [in-app, email]; preferred when same rule as a.corrective; fallback [email]; urgency normal; requires permission: false; requires contactability: true
- **a.remind**: eligible [email, sms, push]; preferred when email by default; sms/push only when a consequence date exists inside the urgent horizon and permission for service messages on that channel is recorded; fallback [email]; urgency high; requires permission: true; requires contactability: true
- **a.confirmed**: eligible [email, in-app]; preferred when persistent by default; in-app when active in the product; fallback [email]; urgency normal; requires permission: false; requires contactability: true

SUPPRESSION / PREEMPTION:
- No exclusion group is declared (contact.competition: none) — payment recovery is orthogonal to relationship-level journeys and runs regardless of what else is open on the account, because the underlying debt exists independent of any relationship decision. Other retention-outreach journeys (RET-24, RET-32) explicitly defer to an open FIN-134 instance; FIN-134 itself defers to nothing.

HANDOFF:
- **h.grace** → TIM-65 — carries: obligation_id; amount_outstanding; failure_class; attempts; consequence_policy; ownership transfer: true; suppresses source: false
- **h.overdue** → TIM-62 — carries: obligation_id; amount_outstanding; failure_class; attempts; consequence_policy; ownership transfer: true; suppresses source: false
- **h.restrict** → ACC-78 — carries: obligation_id; amount_outstanding; failure_class; attempts; consequence_policy; restriction_scope; ownership transfer: true; suppresses source: false

OUTCOMES:
- **Primary**: x.recovered (obligation_satisfied businessOutcome, observed through the TIM-65 handoff chain until grace_period_ended)
- **Secondary**: payment_method_updated; alternate_method_selected
- **Failure**: h.grace / h.overdue / h.restrict (obligation unpaid after the recovery window)
- **Diagnostic (never primary/secondary)**: complaint; support_contact_within_24h; duplicate_charge; message_after_success

TEST CASES:
- **happy-path**: given a customer-fixable failure (expired method); the customer updates it before the recovery window closes → expect a.corrective is sent naming the exact fix; discharge is verified and a.confirmed sends
- **alternate-branch**: given a transient/provider-side failure with the same idempotency key still valid → expect a.retry runs silently first with no customer message
- **alternate-branch**: given a policy decline with an alternate method available but no standing authority to charge it → expect a.offer-alternate asks the customer to choose; a.use-alternate only charges after that choice or standing authority exists
- **duplicate-trigger**: given a second payment failure occurs on the same obligation while an instance is already open → expect it is treated as an event inside the open instance, not a new one (GLB-19)
- **idempotency**: given a.retry is re-triggered after a delivery retry → expect the same idempotency key absorbs a first attempt that did land rather than double-charging
- **timeout**: given the alternate-choice window passes with no selection → expect treated as an unanswered choice, not a refusal to pay — the obligation proceeds to its unpaid consequence rather than being marked declined

GAPS:
- P1 (data): failure_class mapping from the real payment provider's decline/response codes to the seven-way taxonomy is required before a.classify can run correctly, and getting it wrong risks the 'checkable falsehood' the guardrail explicitly warns against (e.g. telling someone insufficient funds when the provider only said 'do not honour').
- P2 (config): payment.recovery_window is marked required with no example value; alternate_choice_window and reminder_point are example-only.

---

---

## FIN-137 — Refund Request

READINESS: READY_WITH_MAPPING

WHY:
A clean decision-process journey with well-formed exclusive branches (reviewed at Gate 4: rejection, review and approval are c.eligible's exclusive arms). Money never moves in this journey — approval only authorises movement via handoff to FIN-138. The one implementation-relevant gap is that approval has no acknowledgment touch of its own before the handoff; the requester's only confirmation of the decision is whatever FIN-138 sends when the money actually moves, so a slow or failed execution leaves a genuine silence between 'approved' and 'refunded.'

INSTANCE:
scope: the refund request and the original transaction it is made against
key: [refund_request_id]
dedupe policy: reject-duplicate
concurrency note: The request creates a decision process alongside the original transaction and never modifies the original payment history.

EVENTS:
canonical event: `refund_requested`
source type: declared
required evidence:
- a refund requested against an identified original transaction
insufficient evidence:
- dissatisfaction expressed about a purchase, which is feedback until it is made as a request

DATA:
- `refund_request_id` — used by instance key
- `original_transaction_id` — used by c.scope validity check
- `requester_id` — used by c.scope standing check
- `eligibility_policy` — used by c.policy / c.eligible
- `decision_sla` — used by w.decision timeout
- `refund_log` — used by every action write

SOURCE OF TRUTH:
- the request is valid and within process scope (c.scope) → transaction and entitlement system of record
- what the eligibility policy determines (c.eligible) → refund eligibility policy engine, deterministic where policy exists
- the human reviewer's decision (w.decision / c.decision) → case management / reviewer decision record

CONFIG:
- `refund_request.decision` — the decision SLA the human review must complete within before escalation (basis: operational SLA, timing class: decision-sla; required)
- `refund_request.eligibility_policy` — the deterministic rules (or explicit 'requires judgement' cases) that decide eligibility (basis: business policy; required)

CHANNEL POLICY:
- **a.reject-scope**: eligible [email]; urgency normal; requires permission: false; requires contactability: true
- **a.notify-rejection**: eligible [email]; urgency normal; requires permission: false; requires contactability: true
- **a.acknowledge-review**: eligible [email]; urgency normal; requires permission: false; requires contactability: true
- **a.review**: eligible [task]; urgency normal; requires permission: false; requires contactability: false
- **a.approve**: eligible [task]; urgency normal; requires permission: false; requires contactability: false

SUPPRESSION / PREEMPTION:
none identified

HANDOFF:
- **h.undefined** → DEC-181 — carries: the request and the original transaction; the explicit fact that no eligibility rule was invented; ownership transfer: true; suppresses source: false
- **h.escalate** → OWN-55 — carries: the request, its age and what is holding the decision; ownership transfer: true; suppresses source: false
- **h.execute** → FIN-138 — carries: the approved amount, its currency and the original transaction; the explicit fact that nothing has moved yet; ownership transfer: true; suppresses source: false

OUTCOMES:
- **Primary**: h.execute (approved and handed to FIN-138 for execution)
- **Failure**: x.rejected (REJECTED, no money moves)
- **Diagnostic (never primary/secondary)**: complaint; message_after_success; unsubscribe

TEST CASES:
- **happy-path**: given a valid request, defined policy, deterministically eligible → expect APPROVED is recorded with the authorised amount and authority, and handoff to FIN-138 carries the explicit fact that nothing has moved yet
- **alternate-branch**: given a valid request that policy deterministically rules ineligible → expect REJECTED is recorded with the policy reason, and the requester is notified why
- **alternate-branch**: given the request is out of scope (no valid transaction, no standing, or outside the process) → expect a.reject-scope sends the actual reason; x.rejected exit
- **alternate-branch**: given policy leaves the case to judgement → expect UNDER_REVIEW is recorded, the requester is acknowledged without implying an outcome, and a human review begins
- **timeout**: given the decision SLA elapses with no reviewer decision → expect escalation to OWN-55 carrying the request's age and what is holding it
- **duplicate-trigger**: given a second refund request against the same original transaction while one is open → expect governed by refund_request_id as the instance key — a distinct request id opens its own instance; the same request id does not duplicate

GAPS:
- P1 (outcome): Approval (a.approve) has no acknowledgment touch before handoff to FIN-138 — the requester has no confirmation between the decision being made and the money actually arriving, which is a real silence if FIN-138's execution has any latency.
- P1 (config): eligibility_policy is required data but its actual rule set (what is deterministic vs. requires judgement) is not defined by this journey and must be supplied per transaction type.

---

---

## FUL-146 — Delivery Delay Alert

READINESS: NEEDS_CONTRACT_WORK

WHY:
Confirmed by the migration review as a pure router (every path ends in a handoff, never a bare exit), and the delayed-is-not-failed / no-repeated-broken-dates guardrails are well enforced. It is held out of READY_WITH_MAPPING by a real cross-journey ambiguity: nothing prevents this journey and FUL-265 from both being open on the same obligation and independently messaging the recipient with contradictory framing about the same delay.

INSTANCE:
Scope: the obligation and its timing commitment, with the history of what was promised. Key: `obligation_id`. Dedupe: reject-duplicate.

EVENTS:
`expected_fulfillment_timing_slipped`, authoritative. Required evidence: a material slip against the committed timing. Insufficient alone: a slip within the tolerance the commitment already allows.

DATA:
- `obligation_id` — instance key
- `original_commitment` — a.update, a.delay-update
- `current_estimate` — c.estimate, a.update, a.delay-update
- `tolerance` — c.threshold
- `available_choices` — c.choice, a.offer
- `fulfillment_log` — a.assess, a.update, a.no-estimate, a.offer, a.reschedule (append)

SOURCE OF TRUTH:
- The slip is material and the current estimate (if any) -> fulfillment/logistics system of record
- Within or beyond the acceptable threshold -> fulfillment policy engine (tolerance rules)
- What real choices exist -> operations/fulfillment options system

CONFIG:
- `fulfillment_delay.decision` — how long the counterparty's choice is waited for; basis: business policy; required
- `fulfillment_delay.resume` — revised horizon past which an unresolved delay escalates; basis: operational SLA; required
- `fulfillment_delay.touches` — cap of one delay update and one offer/no-choice update; basis: business policy

CHANNEL POLICY:
- `a.delay-update` — eligible [email, sms]; urgency normal
- `a.no-choice-update` — eligible [email, sms]; urgency high
- `a.offer` — eligible [email, sms]; urgency high

SUPPRESSION / PREEMPTION:
- No suppression or ownership rule exists between this journey and FUL-265: FUL-146 is keyed by `obligation_id` alone, FUL-265 by (`obligation_id`, `person_id`), and both can legitimately be open on the same obligation at once. A shipment already dispatched (FUL-265 running) that then slips in transit can independently fire both journeys' triggers, each sending its own message about the same delay with different framing (a stated new ETA vs. an unresolved non-arrival warning).

HANDOFF:
- `h.resume` -> FUL-144. Carries: the current commitment and history; the scope already completed. Ownership transfer: yes. Suppresses source: yes.
- `h.exception` -> FUL-145. Carries: the alternative chosen; the obligation as it stands. Ownership transfer: yes. Suppresses source: yes.
- `h.cancel` -> FUL-150. Carries: completed/remaining scope separately; the delay history. Ownership transfer: yes. Suppresses source: yes.
- `h.escalate` -> OWN-55. Carries: the original commitment, every revision and the cause; the fact communicating hasn't resolved it. Ownership transfer: yes. Suppresses source: yes.

OUTCOMES:
- Primary: `h.resume` (fulfillment resuming)
- Secondary: `h.exception` (chose an alternative); `h.cancel` (chose to cancel)
- Failure: `h.escalate` (beyond tolerance with nothing to offer, or outlived its horizon)
- Diagnostic: complaint, message_after_success, unsubscribe

TEST CASES:
- happy-path: slip within tolerance after estimate update -> a.delay-update, w.resume, h.resume
- alternate-branch: beyond tolerance with real choices -> a.offer, counterparty reschedules, h.resume
- alternate-branch: beyond tolerance, nothing to offer -> a.no-choice-update, h.escalate
- timeout: w.decision unanswered -> silence read as continue-waiting, routes to w.resume
- timeout: w.resume outlives the revised horizon -> h.escalate
- late-event: decision arrives at the edge of w.decision's window -> recheck re-reads the obligation before acting

GAPS:
- P0 suppression: no ownership rule resolves which journey (this one or FUL-265) messages the recipient when an obligation slips after dispatch — both can independently trigger with contradictory framing. Needs an explicit rule, e.g. FUL-146 owns pre-dispatch slips and suppresses once dispatch has occurred, with FUL-265/FUL-148 owning everything post-dispatch.
- P1 config: `tolerance` is a raw required data field with no named Config anywhere defining how it is set per obligation type.

---

## FUL-148 — Failed Delivery Recovery

READINESS: NEEDS_CONTRACT_WORK

WHY:
Confirmed as a pure router by the migration review; the failure-class taxonomy (correctable/reattempt-safe/refused/damaged/unusable) and the bounded, never-reset attempt budget are well specified. Held to NEEDS_CONTRACT_WORK by two real ownership gaps: `h.return` hands off to REM-151, which requires an `issue_id` this journey never mints, and whose own trigger is declared (customer-reported) rather than authoritative (operationally detected) — a genuine entry-criteria mismatch, not just a mapping task.

INSTANCE:
Scope: the individual delivery attempt and the obligation it was serving. Key: `delivery_attempt_id`. Dedupe: reject-duplicate. Concurrency note: each attempt gets its own `delivery_attempt_id` from the executor, so a reattempt naturally opens a fresh instance; the obligation persists across attempts only via the shared `obligation_id` and the non-resetting `attempt_budget`.

EVENTS:
`authoritative_delivery_attempt_failure`, authoritative. Required evidence: a delivery executor confirming an attempt was made and delivery did not occur. Insufficient alone: a tracking status that has not advanced (silence, not a failure).

DATA:
- `delivery_attempt_id` — instance key
- `obligation_id` — all logging, handoffs
- `failure_reason` — a.classify, c.class
- `attempt_budget` — c.budget
- `alternative_routes` — c.alternate, a.offer-route
- `delivery_log` — a.classify, a.correct, a.alternate, a.reattempt (append)

SOURCE OF TRUTH:
- Why delivery failed -> delivery executor system (the reason is acted on exactly as reported, never invented)
- Whether a reattempt remains within the bounded policy -> delivery/fulfillment policy engine
- Whether an alternative route needs the recipient's consent or is policy-authorised -> logistics routing policy

CONFIG:
- `delivery_attempt.correction` — how long a requested correction is waited for before returning; basis: business policy; required
- `delivery_attempt.route_choice` — how long the recipient's route choice is waited for; basis: business policy; required
- `delivery_attempt.touches` — cap of messages per instance; basis: business policy

CHANNEL POLICY:
- `a.correct` — eligible [email, sms]; urgency high
- `a.offer-route` — eligible [email, sms]; urgency high

SUPPRESSION / PREEMPTION:
- `h.exception` explicitly routes damaged-on-arrival to FUL-145 ("this is a fulfillment problem rather than a delivery one"), and `h.return` explicitly routes unresolvable deliveries to REM-151 — both resolved ownership boundaries in the graph.
- No suppression rule addresses FUL-265: both journeys can react to the same underlying delivery-failure signal, and FUL-265's `x.unresolved` exit carries no handoff into this journey — an implementer must decide whether this journey is triggered by FUL-265's failure detection or an independent feed, and whether FUL-265's generic non-arrival notice should be suppressed once this journey's more specific recovery messaging starts.

HANDOFF:
- `h.retry` -> FUL-147. Carries: attempt history and remaining budget; correction/route change applied. Ownership transfer: yes. Suppresses source: yes.
- `h.return` -> REM-151. Carries: failure classification and full attempt history; obligation unresolved, financial consequence separate. Ownership transfer: yes. Suppresses source: yes.
- `h.exception` -> FUL-145. Carries: what was damaged and the scope; the fact delivery itself worked. Ownership transfer: yes. Suppresses source: yes.

OUTCOMES:
- Primary: `h.retry` (a further attempt dispatched)
- Secondary: `h.exception` (damaged, routed elsewhere)
- Failure: `h.return` (delivery cannot be completed)
- Diagnostic: complaint, message_after_success, unsubscribe

TEST CASES:
- happy-path: wrong destination, correction supplied in time -> w.correction resolves, h.retry
- alternate-branch: recipient unavailable, attempts remain, original route best -> a.reattempt directly, h.retry
- alternate-branch: recipient explicitly refused -> h.return directly, no reattempt offered
- alternate-branch: item damaged -> h.exception to FUL-145
- timeout: w.correction times out with no correction -> h.return
- timeout: w.route-choice times out unanswered -> a.reattempt on the original route
- duplicate-trigger: two failure reports for the same delivery_attempt_id -> no second instance

GAPS:
- P0 handoff: `h.return` hands off to REM-151, which requires `issue_id`; FUL-148 has no `issue_id` anywhere in its required attributes and mints none in the handoff — the same gap found on SCH-180 and REM-152.
- P0 events: REM-151's own trigger is sourceType "declared" (customer-initiated) while this handoff represents an operationally-detected, authoritative undeliverable parcel with no customer report yet. Either REM-151 needs a system-initiated variant of its entry criteria, or FUL-148's `h.return` needs to synthesize an equivalent declared-style record.
- P1 suppression: no rule prevents this journey and FUL-265 both messaging the recipient about the same failed attempt with different framing.

---

## FUL-265 — Delivery Tracking

READINESS: NEEDS_CONTRACT_WORK

WHY:
Exceptionally well-guarded against the classic delivery-communication failure modes — dispatched is not delivered, an intermediate movement is never reported as an outcome, an executor gone quiet is "unknown" not "failed," and acceptance-by-agreement and acceptance-by-expiry stay distinguishable forever. Held to NEEDS_CONTRACT_WORK because `x.unresolved` (the non-arrival state) has no handoff to FUL-148, the journey that actually recovers a failed delivery, and because the same delay-ownership ambiguity flagged in FUL-146 applies here symmetrically.

INSTANCE:
Scope: the dispatched obligation, its recipient, and the acceptance window running against it. Key: `obligation_id` + `person_id`. Dedupe: reject-duplicate. Concurrency note: a re-dispatch after a failure is a new instance with its own acceptance window; it never inherits the prior instance's state.

EVENTS:
`obligation_handed_to_delivery_executor`, authoritative. Required evidence: an authoritative dispatch record naming the executor and destination; a recipient with a permitted route. Insufficient alone: a preparation/packing status; a label created with nothing handed over.

DATA:
- `obligation_id`, `person_id` — instance key, all messaging/handoffs
- `executor` — a.dispatch, w.delivery
- `expected_window` — w.delivery timeout
- `tracking_reference` — a.dispatch
- `acceptance_window_ends_at` — w.acceptance timeout

SOURCE OF TRUTH:
- Delivered vs. not delivered -> delivery executor/carrier tracking system (a final confirmation only, never an intermediate movement)
- Acceptance of the delivered item -> the recipient's own explicit declared response, kept distinguishable from silent expiry (no engagement-as-evidence violation: acceptance-by-agreement and acceptance-by-expiry are explicitly kept separable)

CONFIG:
- `dispatch_to.delivery` — the executor's own expected delivery window; basis: platform constraint; required
- `dispatch_to.acceptance` — acceptance window policy defines, bound to acceptance_window_ends_at; basis: business policy; required
- `dispatch_to.touches` — cap of a dispatch notice, an arrival/non-arrival notice, and an acceptance request; basis: business policy

CHANNEL POLICY:
- `a.dispatch` — eligible [email, sms]; urgency normal
- `a.no-arrival` — eligible [email, sms]; urgency high
- `a.arrived` — eligible [email, sms]; urgency normal
- `a.accept-request` — eligible [email, sms]; urgency normal

SUPPRESSION / PREEMPTION:
- `x.unresolved` has no handoff to FUL-148 — the natural recovery journey for exactly this state. Either `x.unresolved` is meant to itself trigger FUL-148 downstream, or FUL-148 fires from a separate operational signal that happens to correlate; the relationship is unstated in either journey.
- No suppression rule resolves which of this journey or FUL-146 messages the recipient when a dispatched obligation slips in transit — both can independently fire and frame the same event differently.

HANDOFF:
- `h.issue` -> FUL-149. Carries: delivery evidence and when acceptance was requested; what the recipient says is wrong and when. Ownership transfer: yes. Suppresses source: yes.

OUTCOMES:
- Primary: `x.delivered` (no acceptance required); `x.accepted` (accepted by recipient)
- Secondary: `h.issue` (recipient raised an issue)
- Neutral: `x.finalized` (finalised on expiry, no explicit acceptance)
- Failure: `x.unresolved` (not delivered — failed or unaccounted for)
- Diagnostic: complaint, message_after_success, unsubscribe

TEST CASES:
- happy-path: dispatch, confirmed delivery, acceptance window matters -> a.dispatch, a.arrived, a.accept-request, accepted, x.accepted
- alternate-branch: delivered, no acceptance window defined by policy -> x.delivered terminal immediately, no accept-request
- timeout: w.delivery's executor window passes with no report -> a.no-arrival states honestly it has lost sight of the executor
- late-event: a `delivery_delay_reported` event arrives mid-wait rather than a final report -> ambiguous under the current graph (see gap)
- timeout: w.acceptance expires unanswered -> a.finalize records acceptance-by-expiry, x.finalized
- idempotency: a.finalize retried after a redelivered timeout event -> finalised exactly once

GAPS:
- P0 handoff: `x.unresolved` is non-terminal with a reEntry note implying downstream action, but no handoff names what — without deciding whether this state triggers FUL-148, a customer told "we don't know where it is" has no guaranteed recovery path wired at the implementation layer.
- P0 suppression: no ownership rule resolves the same-obligation dual-fire risk with FUL-146 described above.
- P1 events: `w.delivery`'s until-list includes `delivery_delay_reported` alongside delivered/failed, but `c.delivery` only asks a binary delivered/not-delivered question — a genuine delay report would fall into "not delivered" and trigger `a.no-arrival`'s failure/lost-sight framing, misrepresenting a known, reported delay.

---

## FUL-276 — Substitution Approval

READINESS: READY_WITH_MAPPING

WHY:
The cleanest of the fulfillment journeys in this batch: explicit accept/decline parity, silence never treated as acceptance, exactly one reminder, and a decline explicitly distinguished from a cancellation. The three confirmation/lapse touches deliberately carry no destination (confirmed by the migration review). Implementation is mostly config mapping — the decision-window and reachability-latency assumptions.

INSTANCE:
Scope: the affected scope of the obligation and the single alternative offered against it. Key: `obligation_id` + `substitution_offer_id`. Dedupe: reject-duplicate. Concurrency note: the offer covers only the affected scope; a second exception on the same obligation is its own instance with its own offer.

EVENTS:
`substitution_required_with_defined_alternative`, authoritative. Required evidence: an authoritative exception against a named scope; a specific alternative identified and actually available; the difference between what was promised and what would be supplied. Insufficient alone: a delay with no alternative identified; a supply warning not yet touching this obligation.

DATA:
- `obligation_id`, `substitution_offer_id` — instance key
- `affected_scope` — a.offer, a.confirm-decline
- `alternative` — a.offer, a.remind, a.confirm-accept
- `difference_statement` — a.offer, a.remind
- `offer_closes_at` — w.decision, w.final timeouts; c.reachable

SOURCE OF TRUTH:
- Reachability inside the decision window -> contact-permission/routing system
- Accept vs. decline -> the recipient's own explicit declared response — silence is never read as acceptance

CONFIG:
- `substitution_offer.decision` — the point at which one reminder can still be acted on; basis: business policy; required
- `substitution_offer.final` — after the reminder, open until offer_closes_at and no longer; basis: business policy; required
- `substitution_offer.touches` — cap of an offer, one reminder, one closing message; basis: business policy

CHANNEL POLICY:
- `a.offer` — eligible [email, sms]; urgency high
- `a.remind` — eligible [email, sms]; urgency normal
- `a.confirm-accept` / `a.confirm-decline` — eligible [email, sms]; urgency normal (no destination by design)
- `a.lapse` — eligible [email, sms]; urgency low (no destination by design)

SUPPRESSION / PREEMPTION:
None identified — item/service substitution consent is a distinct domain from the delivery/scheduling failure family in this batch (SCH-180, FUL-146, FUL-148, FUL-265); no plausible overlap found.

HANDOFF:
- `h.unreachable` -> CON-36. Carries: affected scope, alternative, decision window; routes tried and why closed. Ownership transfer: yes. Suppresses source: yes.

OUTCOMES:
- Primary: `x.accepted` (alternative accepted and confirmed)
- Neutral: `x.lapsed` (offer lapsed undecided, scope still open)
- Failure: `x.declined` (alternative declined, scope still owed)
- Diagnostic: complaint, message_after_success, unsubscribe

TEST CASES:
- happy-path: reachable recipient accepts -> a.confirm-accept states the new promise, x.accepted
- alternate-branch: recipient explicitly declines -> a.confirm-decline, scope remains open and owed, x.declined (never a cancellation)
- timeout: w.decision passes unanswered -> a.remind sends once
- timeout: w.final passes after the reminder with still no answer -> a.lapse releases the alternative, x.lapsed
- contactability-loss: no permitted route reaches the recipient before the window would close -> h.unreachable to CON-36
- duplicate-trigger: a second substitution event for the same obligation but a different substitution_offer_id -> a new, independent instance

GAPS:
- P2 config: `c.reachable`'s "arrives inside the decision window" criterion assumes a channel-latency figure never modeled anywhere in the journey or its configs.

---

## IDN-81 — Identity Verification

READINESS: NEEDS_CONTRACT_WORK

WHY:
The evidence-round graph is well-guarded: evidence is scoped to exactly the claim in question, rounds are policy-bounded rather than repeated until something is accepted, and verifying one attribute is never read as verifying another. Two things block clean implementation: every idempotencyKey includes "issue_id", a field this journey never declares (claim_id is the real key; identity_id is legitimately present alongside it), and there is no check anywhere in this graph for an open IDN-271 compromise incident before requesting or accepting evidence.

INSTANCE:
Scope: the individual identity claim - which attribute, at what assurance, for what purpose
Key: claim_id
Dedupe policy: reject-duplicate
Concurrency note: Verification belongs to a claim, not a person; two claims about the same person are two independent instances and neither carries the other.

EVENTS:
Canonical event: identity_verification_required (source: authoritative)
Required evidence: a specific identity claim that a process or policy requires to be verified, at a stated scope
Insufficient alone: someone stating their name, which is a claim rather than a request to verify it; an account holding an attribute nobody has checked

DATA:
- claim_id — instance key (idempotencyKeys additionally reference issue_id, which is undeclared here — see gaps)
- identity_id — idempotencyKeys (correctly present)
- attribute — a.instance / evidence scoping
- required_assurance — a.verified scope
- purpose — a.instance binding
- evidence_policy — c.evidence / a.request
- round_limit — c.rounds
- verification_log — every writes:append action

SOURCE OF TRUTH:
- whether the evidence establishes the claim at the required assurance -> evidence validation/verification engine, escalating to human review (DEC-181) when inconclusive [engagement is evidence-only]

CONFIG:
- identity_claim.touches — discretionary touch budget (0 — every touch is the verification itself and mandatory) (basis: business policy, required: false)
- identity_claim.cooldown — cooldown between instances (none — per claim) (basis: business policy, required: false)
- identity_claim.evidence — the verification timeout for this claim before it is recorded expired (basis: operational SLA, timingClass: response-window, required: true)
- identity_claim.validate_budget — the bounded budget for the automated validation loop before it takes its timeout path (basis: platform constraint, required: true)

CHANNEL POLICY:
- a.request: eligible [in-app, email] — preferredWhen: in-app when active in product, email otherwise; fallback: [same-role-other-channel]; urgency: normal; requiresPermission: false; requiresContactability: true
- a.request-more: eligible [in-app, email] — preferredWhen: same as a.request; names only the specific missing evidence; fallback: [same-role-other-channel]; urgency: normal; requiresPermission: false; requiresContactability: true

SUPPRESSION / PREEMPTION:
- No documented check for an open IDN-271 compromise incident before requesting or accepting identity evidence; an evidence request could be sent to (or evidence accepted from) a destination the incident has flagged implicated. (conflicts with: IDN-271)

HANDOFF:
- h.review -> DEC-181; requiredContext: the claim, the evidence gathered and what was inconclusive about it; how many rounds have already run, so the person is not asked to repeat them; ownershipTransfer: true; suppressSource: true
- h.failure -> IDN-84; requiredContext: the claim and the failure as observed, unclassified; the process waiting on this verification, if any; ownershipTransfer: true; suppressSource: true

OUTCOMES:
Primary: x.verified — VERIFIED for this claim, at this scope and assurance
Failure: x.expired — EXPIRED; the claim was never verified (a timeout, not a rejection); h.failure — verification failed, routed to IDN-84; h.review — inconclusive, needs human judgement, or the round limit was reached

TEST CASES:
- happy-path: evidence sufficient for the claim is already held -> c.evidence routes to a.validate directly; a.verified -> x.verified
- alternate-branch: evidence is not yet available -> a.request fires and w.evidence waits for verification_evidence_received
- timeout: no evidence arrives inside the verification timeout -> w.evidence times out to x.expired — explicitly not the same as a rejection
- human-ownership: validation is inconclusive and no evidence rounds remain -> c.rounds routes to h.review rather than looping indefinitely
- idempotency: a.verified is retried for the same claim_id -> as documented, the idempotencyKey includes issue_id, a field this journey never declares — must be corrected to claim_id + identity_id

GAPS:
- P0 [instance] Every idempotencyKey (a.instance, a.request, a.validate, a.request-more, a.verified) includes "issue_id", a field absent from this journey's required attributes; claim_id is the actual instance key (identity_id is legitimately present).
- P1 [suppression] No check for an open IDN-271 compromise incident before this journey requests or accepts evidence on a claim tied to the same identity/account.

---

---

## IDN-84 — Verification Recovery

READINESS: NEEDS_CONTRACT_WORK

WHY:
The failure-classification routing is careful and does exactly what it promises: a technical failure is never recorded as an identity rejection, retries do not bypass security controls, and the retry budget tightens for security-sensitive claims. It is a pure synchronous router with no wait nodes at all. The blocker is that every idempotencyKey (a.classify, a.explain, a.backoff, a.explain-terminal) references "identity_id", a field this journey never declares — the real key is verification_instance_id.

INSTANCE:
Scope: the verification instance that failed
Key: verification_instance_id
Dedupe policy: reject-duplicate
Concurrency note: The failure belongs to the attempt; x.retry explicitly hands control back to the SAME still-open verification instance (in IDN-81) against the same budget rather than opening a fresh one, so a retry never resets the count.

EVENTS:
Canonical event: verification_attempt_failed (source: authoritative)
Required evidence: a verification attempt that did not establish its claim
Insufficient alone: a verification that expired with no attempt made, which is IDN-81's expiry; a policy change invalidating an existing verification without anyone having attempted one

DATA:
- verification_instance_id — instance key (idempotencyKeys incorrectly reference identity_id instead — see gaps)
- claim_id — h.review context
- failure_class — a.classify / c.class routing
- retry_budget — c.retry-budget
- backoff_budget — c.technical-budget
- verification_log — every writes:append action

SOURCE OF TRUTH:
- the failure classification (INSUFFICIENT_EVIDENCE / MISMATCH / TECHNICAL_FAILURE / etc.) -> verification failure classifier (a.classify) [engagement is evidence-only]

CONFIG:
- verification_failure.touches — touch budget for the plan (1) (basis: business policy, required: false)
- verification_failure.cooldown — cooldown between instances (none — per failed attempt) (basis: business policy, required: false)
- verification_failure.retry_budget — policy-defined retry bound, tighter for security-sensitive claims (surfaced via the retry_budget attribute) (basis: platform constraint, required: true)
- verification_failure.backoff_budget — safe technical-retry bound before a persistent failure escalates operationally (basis: platform constraint, required: true)

CHANNEL POLICY:
- a.explain: eligible [in-app, email] — preferredWhen: in-app when active in product, email otherwise; explains exactly what to correct; fallback: [same-role-other-channel]; urgency: normal; requiresPermission: false; requiresContactability: true
- a.explain-terminal: eligible [in-app, email] — preferredWhen: same as a.explain; states the claim cannot be verified on this basis; fallback: [same-role-other-channel]; urgency: normal; requiresPermission: false; requiresContactability: true

SUPPRESSION / PREEMPTION:
none identified

HANDOFF:
- h.escalate -> OWN-55; requiredContext: the failure class and how often it has recurred; the people currently unable to verify because of it; ownershipTransfer: true; suppressSource: true
- h.review -> DEC-181; requiredContext: the failure class and every attempt made; the claim being verified, so the reviewer assesses the claim rather than the attempts; ownershipTransfer: true; suppressSource: true

OUTCOMES:
Primary: x.retry — bounded retry offered; the originating IDN-81 verification instance continues on the same budget
Failure: x.terminal — verification not possible on this basis; h.review — needs human judgement, or the retry budget is spent; h.escalate — a persistent technical failure that is not clearing

TEST CASES:
- happy-path: insufficient evidence, and the retry budget has room -> c.retry-budget -> a.explain -> x.retry, feeding back into the open IDN-81 instance
- alternate-branch: a technical failure on our side, transient -> c.technical-budget -> a.backoff -> x.retry, recording nothing against the person's verification history
- human-ownership: a mismatch or explicit review requirement -> c.class routes directly to h.review rather than offering a retry
- human-ownership: a technical failure is not clearing inside the backoff budget -> c.technical-budget routes to h.escalate (OWN-55)
- idempotency: a.explain is retried for the same verification_instance_id -> as documented, the idempotencyKey references identity_id, a field this journey never declares — must be corrected to verification_instance_id

GAPS:
- P0 [instance] All four idempotencyKeys (a.classify, a.explain, a.backoff, a.explain-terminal) reference "identity_id", a field absent from this journey's required attributes; verification_instance_id is the actual key.
- P1 [config] retry_budget and backoff_budget are modeled purely as instance attributes with no stated policy source for their values by claim sensitivity — an implementer needs a lookup table (claim type -> retry bound), not a single constant.

---

---

## IDN-85 — Login Verification

READINESS: READY_WITH_MAPPING

WHY:
This is the cleanest journey in the batch: a single mandatory challenge action, assurance determined by what the context requires rather than by the user, an unanswered challenge explicitly never recorded as a failed authentication, and idempotencyKeys that correctly use identity_id + account_id (both declared required attributes). Implementation work is mapping assurance levels and challenge mechanics to a real MFA/OTP provider.

INSTANCE:
Scope: the authentication session, bound to an actor and an account
Key: session_id
Dedupe policy: reject-duplicate
Concurrency note: A context requiring higher assurance re-opens this as its own instance rather than reusing the satisfied one; being authenticated says who the actor is and nothing about what they may do.

EVENTS:
Canonical event: authentication_required (source: authoritative)
Required evidence: a context requiring the actor's control of an identity to be established
Insufficient alone: a session that already holds the required assurance; an authorization question about what an authenticated actor may do

DATA:
- session_id — instance key
- identity_id — idempotencyKeys
- account_id — idempotencyKeys
- required_assurance — c.sufficient / a.challenge
- existing_assurance — c.sufficient
- authentication_log — writes:append actions

SOURCE OF TRUTH:
- what assurance level the current context requires -> context/policy engine determining required assurance per action, not per user [engagement is evidence-only]
- whether the challenge succeeded at the required assurance -> authentication/MFA challenge provider [engagement is evidence-only]

CONFIG:
- authentication_challenge.touches — discretionary touch budget (0 — the challenge itself is mandatory) (basis: business policy, required: false)
- authentication_challenge.cooldown — cooldown between instances (none — per session) (basis: business policy, required: false)
- authentication_challenge.auth — the challenge window; an unanswered challenge simply ends and is never recorded as a failure (basis: operational SLA, timingClass: response-window, required: true)

CHANNEL POLICY:
- a.challenge: eligible [sms, push, email] — preferredWhen: sms when an asserted time bound is inside the urgent horizon and sms permission is recorded; push when a valid token/app session exists; email as the persistent fallback; fallback: [same-role-other-channel]; urgency: high; requiresPermission: false; requiresContactability: true

SUPPRESSION / PREEMPTION:
- No documented check for an open IDN-271 compromise incident before issuing a challenge on the affected account (see IDN-271's own gap). (conflicts with: IDN-271)

HANDOFF:
- h.stepup -> IDN-86; requiredContext: the session and the assurance it currently holds; the level the context requires; ownershipTransfer: true; suppressSource: true
- h.failure -> IDN-87; requiredContext: the attempt and its context; the explicit fact that one failure is a signal rather than a finding; ownershipTransfer: true; suppressSource: true

OUTCOMES:
Primary: x.authenticated — authenticated at a stated assurance and for a stated validity
Neutral: x.satisfied — already authenticated at the required level; no challenge issued
Failure: x.timeout — challenge unanswered; nothing authenticated and nothing recorded against the actor; h.stepup — control established below the required assurance; h.failure — the challenge was not satisfied

TEST CASES:
- happy-path: no sufficient existing session for the required assurance -> a.challenge -> w.auth -> authenticated at the required level -> a.session -> x.authenticated
- alternate-branch: a current session already holds the required assurance -> c.sufficient routes directly to x.satisfied; no challenge issued
- timeout: the challenge goes unanswered inside the challenge window -> w.auth times out to x.timeout, explicitly not recorded as a failed authentication
- permission-loss: control is established but only at a lower assurance than the context requires -> c.result routes to h.stepup (IDN-86) rather than treating it as success
- idempotency: a.session is retried for the same identity_id + account_id -> idempotencyKey identity_id + account_id + a.session correctly dedupes it

GAPS:
- P2 [suppression] No documented check for an open IDN-271 compromise incident before issuing a routine challenge on the same account — likely low-risk since MFA challenges remain appropriate during an investigation, but undocumented either way.

---

---

## IDN-270 — Account Recovery

READINESS: NEEDS_CONTRACT_WORK

WHY:
The security discipline here is real: the recovery route only ever goes to a destination the account already held, the window never restarts on repeated attempts or extends on engagement, and exactly one reminder is allowed. c.incident correctly diverts to IDN-90 when an incident is already open, resolving the audit's IDN-270/IDN-271 overlap question cleanly. What blocks clean implementation is that a.issue/a.restored/a.remind's idempotencyKeys include "issue_id", a field absent from this journey's own required attributes (recovery_case_id is the real key), and held_destinations' provenance — which contact points count as "already held" — is not tied anywhere to CON-264's own confirmation state.

INSTANCE:
Scope: one existing account plus this recovery case and its window
Key: recovery_case_id
Dedupe policy: allow-concurrent
Concurrency note: A second recovery request on the same account opens its own case (its own recovery_case_id) and does not extend or restart an existing one; within one recovery_case_id only one instance is ever active.

EVENTS:
Canonical event: account_recovery_case_opened (source: authoritative)
Required evidence: a recovery case authoritatively opened against one existing account; the recovery basis and the evidence that basis requires; a recovery window with a stated end
Insufficient alone: a failed authentication attempt; a support conversation about being locked out; a destination supplied inside the request itself

DATA:
- recovery_case_id — instance key (idempotencyKeys incorrectly reference issue_id instead — see gaps)
- account_id — idempotencyKeys; c.incident lookup
- recovery_basis — the evidence policy this case requires
- required_evidence — a.issue messaging; c.proof
- recovery_window_ends_at — w.proof / w.final timeout binding
- held_destinations — a.issue / a.remind destination — must never be a destination supplied with the request

SOURCE OF TRUTH:
- whether the evidence the basis requires was provided and sufficient -> identity/recovery evidence review (per recovery_basis) [engagement is evidence-only]
- whether an open security incident already exists on the account -> security incident system (IDN-90 / IDN-271) [engagement is evidence-only]

CONFIG:
- account_recovery.touches — touch budget (1 — only the reminder is discretionary) (basis: business policy, required: false)
- account_recovery.cooldown — cooldown between instances (none — each recovery_case_id is independent) (basis: business policy, required: false)
- account_recovery.proof — the point inside the recovery window at which a reminder still leaves time to act (basis: operational SLA, timingClass: reminder-before-attribute, required: true)
- account_recovery.final — after the reminder, the wait runs to the window's own end and is never restarted (basis: platform constraint, timingClass: attribute-bound, required: true)

CHANNEL POLICY:
- a.issue: eligible [email, sms] — preferredWhen: channel equals the already-held destination's own kind (persistent for email, urgent for sms); fallback: [same-role-other-channel]; urgency: high; requiresPermission: false; requiresContactability: true
- a.restored: eligible [email, sms] — preferredWhen: same already-held destination and channel as a.issue; fallback: [same-role-other-channel]; urgency: high; requiresPermission: false; requiresContactability: true
- a.remind: eligible [email, sms] — preferredWhen: same already-held destination; sent exactly once; fallback: [same-role-other-channel]; urgency: high; requiresPermission: false; requiresContactability: true

SUPPRESSION / PREEMPTION:
- c.incident diverts a recovery request entirely to IDN-90 (h.security) when an incident is already open on the account, rather than running the ordinary recovery flow alongside it. (conflicts with: IDN-271, IDN-90)

HANDOFF:
- h.security -> IDN-90; requiredContext: the recovery case and the basis claimed; which destinations the request arrived from, and which were already on the account; ownershipTransfer: true; suppressSource: true

OUTCOMES:
Primary: x.restored — control restored and confirmed
Neutral: x.moot — recovery closed without being used (resolved elsewhere, or withdrawn)
Failure: x.closed — recovery window closed without sufficient proof

TEST CASES:
- happy-path: the required evidence is provided and judged sufficient inside the window -> a.issue -> w.proof -> c.proof (control proven) -> a.restored -> x.restored
- alternate-branch: the account already has an open compromise incident -> c.incident routes straight to h.security -> IDN-90; the ordinary recovery flow never runs
- timeout: the reminder point in the window arrives with no evidence yet -> c.remind fires a.remind if time remains, else routes to x.closed
- duplicate-trigger: a second recovery request is opened for the same account while one is already in progress -> a separate recovery_case_id opens its own independent instance; neither extends the other
- idempotency: a.issue is retried for the same recovery_case_id -> as documented, the idempotencyKey references issue_id, a field absent from required attributes here — must be corrected to recovery_case_id

GAPS:
- P0 [instance] a.issue/a.restored/a.remind idempotencyKeys all include "issue_id", a field absent from this journey's required attributes (recovery_case_id is the actual key; account_id is present and correct).
- P1 [data] held_destinations must be sourced only from contact points CON-264 has actually confirmed (its x.permitted outcome) — an in-flight, unconfirmed CON-264 change must never count as a held/recoverable destination — but this data-lineage requirement is undocumented in either journey.

---

---

## IDN-271 — Account Security Alert

READINESS: READY_WITH_MAPPING

WHY:
Channel policy here is a model for the rest of the batch: every verified, unimplicated destination is alerted simultaneously and by design (channelStrategy.simultaneous), the alert never claims a restriction that was not applied, and the review-point timeout explicitly never reads owner silence as confirmation. idempotencyKeys correctly use incident_id throughout. The one real gap is corpus-wide rather than local to this journey: neither IDN-81 (identity verification) nor IDN-85 (authentication challenge) checks for an open IDN-271 incident before sending evidence requests or challenges, so an ordinary verification nudge could still reach a destination this journey has itself flagged implicated.

INSTANCE:
Scope: the account plus this security incident and the scope it affects
Key: account_id + incident_id
Dedupe policy: allow-concurrent
Concurrency note: A later signal on the same account opens its own incident_id and its own instance; within one incident_id only one instance is active.

EVENTS:
Canonical event: compromise_incident_opened_with_scope_determined (source: authoritative)
Required evidence: a security incident authoritatively opened against the account; the affected scope determined - which sessions, credentials and capabilities; a record of whether containment was applied and how wide
Insufficient alone: a single failed authentication; a risk score with no incident behind it; an unusual location with no other signal

DATA:
- account_id — instance key; idempotencyKeys
- incident_id — instance key; idempotencyKeys
- scope — a.alert-contained / a.alert-watch messaging
- implicated_destinations — c.route — never alerted
- verified_destinations — c.route — alerted simultaneously
- containment_applied — c.contained branch
- review_point_at — w.verify timeout
- restrictions_applied (optional) — a.alert-contained / a.cleared wording
- signal_summary (optional) — internal context

SOURCE OF TRUTH:
- the affected scope and whether containment was applied -> security/fraud detection & containment system (IDN-90) [engagement is evidence-only]
- whether the owner confirms the activity was theirs -> owner reply via a verified, unimplicated destination [engagement is evidence-only]

CONFIG:
- security_alert.discretionary_touches — discretionary touch budget (0 — every touch here is mandatory) (basis: business policy, required: false)
- security_alert.cooldown — cooldown between instances (none — per incident) (basis: business policy, required: false)
- security_alert.review_point — the review point set by the security process; an owner still silent at this point is told the incident stands open (basis: operational SLA, timingClass: decision-sla, required: true)

CHANNEL POLICY:
- a.alert-contained: eligible [email, sms] — preferredWhen: sent simultaneously to every verified, unimplicated destination at once (channelStrategy.simultaneous); urgency: high; requiresPermission: false; requiresContactability: true
- a.alert-watch: eligible [email, sms] — preferredWhen: same simultaneous multi-destination rule as a.alert-contained; urgency: high; requiresPermission: false; requiresContactability: true
- a.cleared: eligible [email, sms] — preferredWhen: same simultaneous rule; urgency: high; requiresPermission: false; requiresContactability: true
- a.standing: eligible [email, sms] — preferredWhen: same simultaneous rule, at the review point; urgency: normal; requiresPermission: false; requiresContactability: true

SUPPRESSION / PREEMPTION:
- s.hard-gates-only — security alerts are exempt from pressure caps and marketing permission entirely; a fraud hold does not stop this alert reaching an unimplicated destination.
- An open IDN-271 incident diverts a concurrent IDN-270 (account recovery) request to IDN-90 via IDN-270's own c.incident check. IDN-271 itself does not separately suppress IDN-81 (identity verification) or IDN-85 (authentication challenge); neither of those journeys checks for an open compromise incident before sending evidence requests or challenges. (conflicts with: IDN-270, IDN-81, IDN-85)

HANDOFF:
- h.recovery -> IDN-88; requiredContext: the incident, its affected scope and what was contained; which destinations were treated as implicated and which carried the alert; ownershipTransfer: true; suppressSource: true

OUTCOMES:
Primary: x.cleared — signal cleared, restrictions lifted and the owner told
Secondary: security_review_concluded; h.recovery — confirmed compromise, handed to IDN-88 for secure recovery
Neutral: x.open — incident open past its review point, owner told the current status
Failure: x.withheld — no unimplicated destination existed; alert withheld entirely

TEST CASES:
- happy-path: something was restricted and a clean destination exists -> a.alert-contained fires simultaneously to every verified unimplicated destination; owner confirms -> a.cleared -> x.cleared
- alternate-branch: nothing was restricted (evidence did not justify it) -> a.alert-watch fires instead of a.alert-contained, stating plainly that nothing is restricted
- timeout: the owner is silent past the review point -> w.verify times out to a.standing -> x.open; silence is never read as confirmation
- contactability-loss: every destination on the account was changed inside the suspicious window or sits behind the access in question -> c.route routes to x.withheld; no alert is sent anywhere
- duplicate-trigger: a second compromise signal fires on the same account -> a new incident_id opens its own independent instance
- idempotency: a.alert-contained is retried for the same incident_id -> idempotencyKey incident_id + touch id correctly dedupes it (consistent, unlike several other journeys in this batch)

GAPS:
- P1 [suppression] Neither IDN-81 (identity verification) nor IDN-85 (authentication challenge) checks for an open IDN-271 incident before requesting evidence or issuing a challenge; an evidence request could be sent to (or evidence accepted from) a destination this journey has itself flagged implicated.

---

---

## INC-254 — Incident Update

READINESS: READY_WITH_MAPPING

WHY:
The graph's discipline directly targets the two ways incident comms usually go wrong: it never claims root cause or resolution before confirmation (a.hold-claim explicitly states what is known vs not), and it suppresses updates that are not material unless a stated commitment (status-page cadence, contract, regulation) requires one regardless — avoiding both silence and noise. It deliberately delegates channel/permission/delivery mechanics to 'the canonical communication mechanism', which is architecturally correct, not a gap. Implementation work is wiring cohort resolution (a.determine, a.scoped/a.broad) to the company's real incident and customer-segmentation systems.

INSTANCE:
- scope: the incident, the affected recipient cohort and the communication obligation it creates
- key: [incident_id, recipient_cohort_id, state_change_id]
- dedupePolicy: reject-duplicate
- concurrency: state_change_id disambiguates successive updates on the same incident/cohort — each material state change opens its own instance rather than reopening the last one.

EVENTS:
- canonicalEvent: incident_reaches_communication_relevant_state
- sourceType: authoritative
- requiredEvidence: an incident state change that could change what an affected party should do or expect
- insufficientEvidence: time having passed since the last update, which is not itself information

DATA:
- incident_id (required) — used by: instance key
- recipient_cohort_id (required) — used by: instance key, a.scoped / a.broad
- state_change_id (required) — used by: instance key
- confirmed_facts (required) — used by: c.verified — what is established vs hypothesis
- prior_guidance (required) — used by: c.material — whether guidance has actually changed
- incident_log (required) — used by: every action's audit trail

SOURCE OF TRUTH:
- the affected cohort and what is confirmed vs unconfirmed -> the incident management system's own state and evidence
- channels, permissions, delivery and retries -> the canonical communication mechanism — explicitly delegated, not this journey's concern [engagementIsEvidenceOnly: true]

CONFIG:
- incident_communication.touches: touch budget fixed at instance open (basis: operational SLA, required: false)

CHANNEL POLICY:
- a.communicate: eligible [email, in-app]; preferredWhen: delegated entirely to the canonical communication mechanism, which owns recipient resolution, channel selection, permissions and delivery evidence — not decided within this journey; fallback: same-role-other-channel; urgency: high; requiresPermission: true; requiresContactability: true

SUPPRESSION / PREEMPTION:
none identified

HANDOFF:
none — this journey has no handoffs; every path resolves to an exit within its own graph.

OUTCOMES:
- primary: none
- secondary: none
- neutral: no update sent; nothing material had changed (x.no-send)
- failure: none
- diagnostic: complaint; message_after_success; unsubscribe

TEST CASES:
- happy-path: an incident state change materially changes what an affected cohort should do -> c.material routes to a.communicate, and c.final decides whether this is the resolution notice (x.closed-comms) or a continuing update (x.updated)
- alternate-branch: nothing has changed since the last message and no commitment requires an update -> c.material routes to a.no-send, which records why rather than sending on a clock
- contactability-loss: cause, fix or timing is still a hypothesis -> c.verified routes to a.hold-claim, which states what is known and what is not rather than asserting an unconfirmed root cause
- alternate-branch: the impact boundary is genuinely unclear -> c.cohort routes to a.broad, which broadens only as necessary and says explicitly the scope is still being established
- idempotency: a.communicate retried for the same state_change_id -> idempotencyKey (obligation_id + incident_id + a.communicate) prevents duplicate delivery of the same update

GAPS:
- none

---

## INT-269 — Integration Recovery

READINESS: READY_WITH_MAPPING

WHY:
The graph's central discipline is refusing to attach a reconnection step where none would work (c.fixable routes provider-side/internal-defect causes straight to a.inform-only) and scoping partial vs total breakage so a holder isn't told everything is broken when most of it works. The relationship-signal branch (c.relationship-signal) correctly treats an unreconnected integration as one contributing signal rather than a standalone churn conclusion. Implementation work is mapping failure_cause classification and dependent_capabilities to the company's actual integration monitoring.

INSTANCE:
- scope: one connection to one external provider, plus the failure recorded against it
- key: [connection_id, failure_id]
- dedupePolicy: reject-duplicate
- concurrency: A second provider failing at the same time is its own instance; a capability that never depended on this connection is untouched.

EVENTS:
- canonicalEvent: integration_connection_failed_or_deauthorized
- sourceType: authoritative
- requiredEvidence: an authoritative failed or disconnected state recorded against a named connection; a diagnosed failure cause; the list of capabilities that depended on it
- insufficientEvidence: a single failed call that has not been classified; a provider rate limit that clears itself; a scheduled provider maintenance window

DATA:
- connection_id (required) — used by: instance key
- failure_id (required) — used by: instance key
- provider (required) — used by: message content
- holder_id (required) — used by: message destination
- failure_cause (required) — used by: c.fixable — holder-fixable vs not-theirs
- dependent_capabilities (required) — used by: c.scope, a.partial / a.total content
- reauthorisation_step (required) — used by: a.partial / a.total destination

SOURCE OF TRUTH:
- the connection's failed/disconnected state and its diagnosed cause -> INT-112 (revalidates capabilities against a changed authorization and sets connection state), per distinctFrom
- connection_revalidated / connection_removed / cause_reclassified_not_holders -> the integration platform's own revalidation check [engagementIsEvidenceOnly: true]
- independent evidence that the relationship is at risk (c.relationship-signal) -> UNNAMED external risk/retention signal source

CONFIG:
- integration_reconnect.touches: touch budget — one notice, one confirmation (basis: operational SLA, required: false)
- integration_reconnect.revalidate: bounded response window from the notice, after which the break is judged only against independent relationship evidence (basis: operational SLA, timingClass: response-window, required: true)

CHANNEL POLICY:
- a.inform-only: eligible [email, in-app]; preferredWhen: persistent(email) default; in-session(in-app) when active in product; fallback: same-role-other-channel; urgency: low; requiresPermission: false; requiresContactability: true
- a.partial: eligible [email, in-app]; preferredWhen: same role logic as a.inform-only; fallback: same-role-other-channel; urgency: normal; requiresPermission: false; requiresContactability: true
- a.total: eligible [email, in-app]; preferredWhen: same role logic; higher stakes than a.partial since nothing works; fallback: same-role-other-channel; urgency: high; requiresPermission: false; requiresContactability: true
- a.restored: eligible [email, in-app]; preferredWhen: same role logic; fallback: same-role-other-channel; urgency: low; requiresPermission: false; requiresContactability: true

SUPPRESSION / PREEMPTION:
none identified

HANDOFF:
- h.abandoned -> RET-24; requiredContext: which capabilities have been unavailable and for how long; what was already said about the break and on which routes; that this is one contributing signal alongside evidence that already existed, not a churn conclusion drawn from a broken connection alone; ownershipTransfer: true; suppressSource: false

OUTCOMES:
- primary: connection_revalidated
- secondary: none
- neutral: informed, recovery not the holder's to perform (x.informed); recovery window closed, connection still broken, relationship not labelled at risk (x.unreconnected)
- failure: none
- diagnostic: complaint; message_after_success; unsubscribe

TEST CASES:
- happy-path: a holder-fixable break affecting some capabilities -> a.partial names what stopped, what still runs and the re-authorisation step; on revalidation a.restored confirms and x.restored closes
- alternate-branch: the cause is a provider outage the holder cannot fix -> c.fixable routes straight to a.inform-only with no reconnection step attached
- timeout: the response window elapses with the connection still broken -> w.revalidate times out to a.unreconnected, which records the fact without drawing a churn conclusion, then c.relationship-signal checks for independent corroborating evidence before deciding between h.abandoned and x.unreconnected
- human-ownership: the holder deliberately disconnects rather than re-authorising -> c.outcome routes to x.removed, a terminal exit distinct from an unreconnected timeout
- idempotency: a.restored retried by delivery infrastructure -> idempotencyKey (person_id + a.restored) prevents a duplicate restoration confirmation

GAPS:
- P1 source-of-truth: c.relationship-signal's 'independent evidence that the relationship itself is at risk' names no system — the company must identify which retention/risk signal source corroborates an unreconnected integration before h.abandoned can fire correctly.

---

## INT-278 — Integration Setup

READINESS: READY_WITH_MAPPING

WHY:
The stage-specific diagnosis (credential / permission / capability) is exactly the pattern that prevents the failure mode named in the objective — a generic error sent to a capable person. The graph also honestly admits when it cannot identify a stage (a.generic, handed to INT-111) rather than guessing, and 'a fix already given is not repeated on the next attempt' is enforced by c.retry's explicit 'failed at a stage already named' branch to x.unresolved. Implementation work is mapping stage_outcomes/validated_capabilities to the company's real OAuth/API validation flow.

INSTANCE:
- scope: the single connection attempt and the integration it configures
- key: [connection_attempt_id]
- dedupePolicy: reject-duplicate
- concurrency: A second connection to the same provider has its own credentials, scopes and outcome, and inherits nothing from this one.

EVENTS:
- canonicalEvent: integration_connection_attempt_resolved
- sourceType: authoritative
- requiredEvidence: a connection attempt recorded against a named integration by a named configurer; a recorded outcome from the authentication, scope and capability checks
- insufficientEvidence: an integration browsed or selected; a credential entered but never submitted

DATA:
- connection_attempt_id (required) — used by: instance key
- integration_id (required) — used by: message content
- configurer_id (required) — used by: message destination
- stage_outcomes (required) — used by: c.outcome / c.stage branch selection
- validated_capabilities (required) — used by: a.active — names what was validated, never what was configured
- retry_budget (required) — used by: w.retry — the abandonment threshold

SOURCE OF TRUTH:
- how far the attempt got (active / failed at a named stage / failed unidentified) -> INT-111 (authenticates, checks scope, probes capability), per distinctFrom
- connection_attempt_recorded / connection_removed on retry -> the integration platform's connection configuration store [engagementIsEvidenceOnly: true]

CONFIG:
- integration_setup.touches: stage messages repeat only as retries recur, against a total budget fixed at the first attempt — the retry budget itself (basis: operational SLA, required: true)
- integration_setup.fix_auth_budget: attempt budget for the credential-fix loop before its timeout path (basis: operational SLA, required: true)
- integration_setup.fix_scope_budget: attempt budget for the permission-fix loop (basis: operational SLA, required: true)
- integration_setup.fix_capability_budget: attempt budget for the capability-fix loop (basis: operational SLA, required: true)
- integration_setup.retry: the period beyond which an unfinished connection is treated as abandoned (basis: operational SLA, timingClass: observation-window, required: true)

CHANNEL POLICY:
- a.active: eligible [email, in-app]; preferredWhen: persistent(email) default; in-session(in-app) when active in product; fallback: same-role-other-channel; urgency: low; requiresPermission: false; requiresContactability: true
- a.fix-auth: eligible [email, in-app]; preferredWhen: same role logic as a.active; fallback: same-role-other-channel; urgency: normal; requiresPermission: false; requiresContactability: true
- a.fix-scope: eligible [email, in-app]; preferredWhen: same role logic; fallback: same-role-other-channel; urgency: normal; requiresPermission: false; requiresContactability: true
- a.fix-capability: eligible [email, in-app]; preferredWhen: same role logic; fallback: same-role-other-channel; urgency: normal; requiresPermission: false; requiresContactability: true
- a.generic: eligible [email, in-app]; preferredWhen: same role logic; explicitly admits the stage is unidentified; fallback: same-role-other-channel; urgency: low; requiresPermission: false; requiresContactability: true

SUPPRESSION / PREEMPTION:
none identified

HANDOFF:
- h.diagnose -> INT-111; requiredContext: the attempt, its provider and what the configurer has already been told; which stages did pass before the failure; ownershipTransfer: true; suppressSource: false

OUTCOMES:
- primary: none
- secondary: none
- neutral: none
- failure: still not connected after the named fix (x.unresolved); abandoned before the connection was ever made (x.abandoned)
- diagnostic: complaint; message_after_success; unsubscribe; active with validated capabilities stated (x.active — engagement-adjacent milestone, not a business KPI in itself)

TEST CASES:
- happy-path: authentication, scope and capability probe all pass -> a.active fires naming validated (not configured) capabilities and x.active closes the instance
- alternate-branch: the credential was refused -> c.stage routes to a.fix-auth, which gives the one step the configurer can usually fix unaided
- late-event: a retry clears the previously-failed stage but fails at a new, not-yet-named stage -> c.retry routes back to c.stage rather than to x.unresolved, since a different stage failing is new information
- timeout: the retry window elapses with no further attempt -> w.retry times out to x.abandoned, correctly not counted as work in progress
- idempotency: a.fix-scope retried for the same configurer/attempt -> idempotencyKey (person_id + a.fix-scope) plus s.g5 (one message per named failure) prevents re-sending a fix already given

GAPS:
- none

---

## REL-284 — Invitation Reminder

READINESS: READY_WITH_MAPPING

WHY:
The graph enforces its identity guardrail structurally, not just declaratively: nothing is shown as linked to either party until c.response confirms acceptance, and a.confirm only fires after that authoritative event. The two invitation variants (existing holder vs new-to-us) are mutually exclusive and each states plainly that accepting is a link, not a transfer — directly preventing the corpus's named failure mode. Implementation work is mapping counterparty_known resolution and the acceptance destination to the company's actual account system.

INSTANCE:
- scope: the invitation, plus the two parties and the scope of the link it proposes, in the direction it was issued
- key: [invitation_id]
- dedupePolicy: reject-duplicate
- concurrency: A second invitation between the same two parties, for a different scope or the other direction, is its own instance.

EVENTS:
- canonicalEvent: relationship_invitation_issued
- sourceType: authoritative
- requiredEvidence: an invitation recorded by a party holding the authority to extend it; a named counterparty, the scope of the proposed link and its direction; an expiry on the invitation
- insufficientEvidence: a shared attribute between two records — an address, a name, a device; an intention to invite that has not been recorded as an invitation

DATA:
- invitation_id (required) — used by: instance key
- inviting_party (required) — used by: a.invite-known / a.invite-new content
- counterparty (required) — used by: message destination
- scope (required) — used by: a.confirm — naming the link's scope
- direction (required) — used by: a.confirm — naming the link's direction
- expires_at (required) — used by: w.response / w.final timeout basis
- counterparty_known (required) — used by: c.known — existing holder vs new-to-us

SOURCE OF TRUTH:
- invitation_accepted / invitation_declined / invitation_withdrawn -> the account/relationship system of record [engagementIsEvidenceOnly: true]
- whether the counterparty already holds a record here (counterparty_known) -> the account system's identity resolution

CONFIG:
- relationship_invitation.touches: touch budget — invitation, one reminder, confirmation (basis: operational SLA, required: false)
- relationship_invitation.response: reminder point that would still leave time to act before expiry (basis: business policy, timingClass: reminder-before-attribute, required: true)
- relationship_invitation.final: wait from reminder to expires_at itself (basis: business policy, timingClass: attribute-bound, required: true)

CHANNEL POLICY:
- a.invite-known: eligible [email, in-app]; preferredWhen: persistent(email) default; in-session(in-app) when active in product; fallback: same-role-other-channel; urgency: normal; requiresPermission: false; requiresContactability: true
- a.invite-new: eligible [email, in-app]; preferredWhen: same role logic as a.invite-known; fallback: same-role-other-channel; urgency: normal; requiresPermission: false; requiresContactability: true
- a.confirm: eligible [email, in-app]; preferredWhen: same role logic, sent to both parties; fallback: same-role-other-channel; urgency: low; requiresPermission: false; requiresContactability: true
- a.remind: eligible [email, in-app]; preferredWhen: same role logic; the single allowed reminder; fallback: same-role-other-channel; urgency: normal; requiresPermission: false; requiresContactability: true

SUPPRESSION / PREEMPTION:
none identified

HANDOFF:
none — this journey has no handoffs; every path resolves to an exit within its own graph.

OUTCOMES:
- primary: invitation_accepted
- secondary: none
- neutral: none
- failure: invitation declined or withdrawn (x.closed); expired unanswered (x.expired)
- diagnostic: complaint; message_after_success; unsubscribe

TEST CASES:
- happy-path: an invitation is issued to an existing holder and accepted before expiry -> a.invite-known fires, c.response catches invitation_accepted, a.confirm fires and x.active closes with both identities intact
- alternate-branch: the counterparty is new to the product -> c.known routes to a.invite-new, which explicitly states accepting creates a link rather than a transfer
- timeout: no response by the reminder point -> w.response times out to c.remind, which sends the single allowed reminder (a.remind) if time remains, or routes straight to x.expired if not
- alternate-branch: the counterparty declines, or the inviting party withdraws before an answer -> c.response routes to x.closed, a terminal exit that is never revived — a fresh invitation is a new instance
- idempotency: a.confirm retried by delivery infrastructure -> idempotencyKey (issue_id + a.confirm) prevents a duplicate confirmation to either party

GAPS:
- none

---

## REM-151 — Post-Purchase Issue Recovery

READINESS: READY

WHY:
The smallest and cleanest journey in the batch: a single touch on a single channel, an explicit duplicate-case suppression, and a firm guardrail against manufacturing a defect or defaulting to refund. Implementation is close to pure company-value mapping (what counts as an existing case, what counts as actionable).

INSTANCE:
Scope: the completed fulfillment or service, and the specific problem reported against it. Key: `issue_id`. Dedupe: reject-duplicate. Concurrency note: a second problem on the same order is a new `issue_id` unless it is the same defect re-described, in which case `c.duplicate` attaches it to the existing case instead of opening a new instance.

EVENTS:
`post_completion_issue_reported`, declared. Required evidence: a concrete problem with a completed fulfillment or service (wrong item/result, damaged output, missing component, quality problem, service defect, incorrect configuration, incomplete outcome). Insufficient alone: negative feedback about the experience (a feeling, not a named problem); a low satisfaction score.

DATA:
- `issue_id` — instance key
- `order_id` — a.capture, idempotency keys
- `reported_problem` — a.capture, a.assess
- `existing_case_ref` — c.duplicate
- `assessment` — c.actionable
- `issue_log` — a.capture, a.attach, a.acknowledge, a.classify (append)

SOURCE OF TRUTH:
- An existing recovery case already covers this problem -> case/ticketing system of record
- The report describes an actionable unresolved obligation vs. a shortfall with nothing wrong -> order/fulfillment records compared against what was owed

CONFIG:
- `post_completion.touches` — cap of one message per instance; basis: business policy

CHANNEL POLICY:
`a.acknowledge` — single channel (email), no policy needed.

SUPPRESSION / PREEMPTION:
An existing case covering the same obligation suppresses a second recovery lifecycle (s.g4) — enforced in-graph via c.duplicate/a.attach.

HANDOFF:
- `h.remedy` -> REM-157. Carries: the unresolved obligation, stated as what is owed; the routes the classification suggests and the evidence. Ownership transfer: yes. Suppresses source: yes.

OUTCOMES:
- Primary: `h.remedy` (confirmed unresolved obligation routed to remedy selection)
- Neutral: `x.no-defect` (heard, no remedy owed); `x.attached` (attached to an existing case)
- Diagnostic: complaint, message_after_success, unsubscribe

TEST CASES:
- happy-path: concrete, actionable defect, nothing already open -> a.classify picks a route, h.remedy to REM-157
- alternate-branch: delivery matched what was owed, experience still disappointed -> a.acknowledge, x.no-defect, no defect manufactured
- duplicate-trigger: a second report on the same open case -> a.attach adds evidence, x.attached, no second lifecycle
- human-ownership: `a.assess` must decide actionable vs. not-actionable — the journey does not declare this node's execution type

GAPS:
- P1 source-of-truth: `a.assess`'s judgment is nuanced enough to plausibly require human triage, but unlike REM-152's `a.review`, it carries no `execution: human` marker — ownership of this call is left implicit.

---

## REM-152 — Return Request

READINESS: NEEDS_CONTRACT_WORK

WHY:
The applicable/policy/eligible branching cleanly separates return eligibility from refund eligibility, the human-review path is explicitly marked (execution: human, task channel), and the no-invented-eligibility-rule guardrail is enforced via an explicit handoff (`h.undefined`) rather than a silent default. Held to NEEDS_CONTRACT_WORK because `h.alternative` hands off to REM-157 without an `issue_id` — the same gap found on SCH-180 and FUL-148 — and because REM-157 can hand a rejected return straight back here with no cycle-prevention rule.

INSTANCE:
Scope: the return request and the original fulfillment it concerns. Key: `return_request_id`. Dedupe: reject-duplicate.

EVENTS:
`return_requested`, declared. Required evidence: a request to send back an identified item, resource or deliverable. Insufficient alone: an expression of dissatisfaction (a report, not a return request).

DATA:
- `return_request_id` — instance key
- `original_fulfillment_id` — c.applicable
- `requester_id` — all messaging
- `eligibility_policy` — c.policy, c.eligible
- `decision_sla` — w.decision timeout
- `return_log` — a.capture, a.reject, a.review, a.authorize (append)

SOURCE OF TRUTH:
- A return process applies at all -> product/catalog system (physical vs. service vs. consumed resource)
- An eligibility policy is defined and what it determines -> returns policy engine
- The review outcome when policy leaves it to a decision -> human reviewer/case-review system (execution: human)

CONFIG:
- `return_authorization.decision` — the decision SLA for a human review; basis: operational SLA; required
- `return_authorization.touches` — cap of a review record and one decision notice; basis: business policy

CHANNEL POLICY:
- `a.notify-rejection` — eligible [email]; urgency normal
- `a.notify-authorization` — eligible [email]; urgency normal
- `a.review` — eligible [task]; execution human; urgency normal; internal only, not customer-facing

SUPPRESSION / PREEMPTION:
- `h.alternative` (nothing returnable) and `h.undefined` (no eligibility policy) are both deliberate escapes rather than invented rules — no gap in the graph itself.
- REM-157 can hand a remedy back to this journey via its own `h.return` when a return is needed before a remedy can be settled; if this journey then rejects that return, its own `h.alternative` sends the case back to REM-157. Nothing in either journey prevents REM-157 from re-selecting "return" on the bounce-back, risking a ping-pong between the two for the same obligation.

HANDOFF:
- `h.alternative` -> REM-157. Carries: the request and unresolved obligation; the fact no return route exists. Ownership transfer: yes. Suppresses source: yes.
- `h.undefined` -> DEC-181. Carries: the request and original fulfillment; the fact no eligibility rule was invented. Ownership transfer: yes. Suppresses source: yes.
- `h.escalate` -> OWN-55. Carries: the request, its age, what is holding the decision. Ownership transfer: yes. Suppresses source: yes.
- `h.transit` -> REM-153. Carries: authorised scope, method, validity; the fact nothing has moved and no remedy is decided. Ownership transfer: yes. Suppresses source: yes.

OUTCOMES:
- Primary: `h.transit` (return authorised, moving to transit tracking)
- Secondary: `h.alternative` (redirected to a remedy not requiring a return)
- Failure: `x.rejected`; `h.undefined` (no governing policy); `h.escalate` (SLA breached)
- Diagnostic: complaint, message_after_success, unsubscribe

TEST CASES:
- happy-path: returnable, policy defined, deterministically eligible -> a.authorize, a.notify-authorization (no refund implied), h.transit
- alternate-branch: policy deterministically ineligible -> a.reject, a.notify-rejection, x.rejected
- alternate-branch: policy leaves it to review -> a.review (human), nothing authorised until decided
- alternate-branch: nothing to return -> h.alternative to REM-157 directly
- alternate-branch: no eligibility policy defined -> h.undefined to DEC-181
- timeout: w.decision breaches decision_sla -> h.escalate to OWN-55
- human-ownership: a.review is reached -> a human task is created and awaited rather than auto-decided

GAPS:
- P0 handoff: `h.alternative` hands off to REM-157, which requires `issue_id`; this journey (keyed on `return_request_id`) has no `issue_id` in its required attributes and mints none in the handoff — the same gap found on SCH-180 and FUL-148.
- P1 handoff: no cycle-prevention rule exists between this journey's `h.alternative` and REM-157's own `h.return` — a rejected return can bounce the same obligation back and forth.
- P1 config: `decision_sla` is a required data field with no named policy value or basis beyond self-reference.

---

## REM-157 — Remedy Confirmation

READINESS: NEEDS_CONTRACT_WORK

WHY:
The obligation-first framing (choosing a remedy to satisfy the obligation rather than the complaint), the explicit default-is-not-a-choice distinction on timeout, and the "refund is one route among several" guardrail are all soundly built. Held to NEEDS_CONTRACT_WORK because this journey is the shared remedy hub for the whole batch — SCH-180, REM-151 and REM-152 all hand off into it — yet is keyed and required on `issue_id` alone, an identifier only REM-151 actually produces; SCH-180 and REM-152 cannot open an instance here without a defined derivation rule.

INSTANCE:
Scope: the confirmed issue and the unresolved obligation behind it. Key: `issue_id`. Dedupe: reject-duplicate. Concurrency note: `issue_id` is the sole instance key; three upstream journeys in this batch alone (SCH-180, REM-151, REM-152) hand off here, and only REM-151 already carries an issue_id of its own.

EVENTS:
`remedy_decision_required`, authoritative. Required evidence: a confirmed issue with an unresolved obligation and no remedy yet selected. Insufficient alone: a complaint not yet established as an operational fault (FBK-43's question); a refund request presuming a remedy not yet decided.

DATA:
- `issue_id` — instance key
- `obligation_id` — a.obligation, all handoffs
- `available_remedies` — a.evaluate, c.choice, a.present, c.route
- `counterparty_chooses` — c.choice, w.selection
- `remedy_log` — a.obligation, a.present, a.default, a.no-remedy (append)

SOURCE OF TRUTH:
- What is precisely owed and unresolved -> order/fulfillment system of record
- Which remedies are genuinely available -> remedy/policy engine (never offering one that cannot be delivered)
- The counterparty's actual selection vs. the policy default on timeout -> the recipient's own explicit response; a timeout default is explicitly recorded as no-selection-made, never presented as their choice

CONFIG:
- `remedy_selection.selection` — how long the remedy choice is waited for before the policy default applies; basis: business policy; required
- `remedy_selection.touches` — cap of messages per instance; basis: business policy

CHANNEL POLICY:
- `a.present` — eligible [email, in-app]; urgency normal
- `a.no-remedy` — eligible [email, in-app]; urgency normal

SUPPRESSION / PREEMPTION:
- This journey is the shared destination for SCH-180's `h.remedy`, REM-151's `h.remedy`, and REM-152's `h.alternative` in this batch alone — each hands off a different obligation shape into the same issue_id-keyed instance space.
- `h.return` can send an obligation to REM-152 for return-before-remedy; if REM-152 rejects the return it bounces back here via `h.alternative` with no stated rule against re-selecting return, risking a ping-pong.

HANDOFF:
- `h.correction` -> REM-156. Carries: the defect and corrected outcome required; the affected scope. Ownership transfer: yes. Suppresses source: yes.
- `h.replacement` -> REM-155. Carries: the original fulfillment and defect; replacement scope required. Ownership transfer: yes. Suppresses source: yes.
- `h.return` -> REM-152. Carries: the resource to be returned and why; the remedy waiting on it. Ownership transfer: yes. Suppresses source: yes.
- `h.financial` -> FIN-137. Carries: the original transaction and unresolved scope; the fact this journey selected the remedy, not the refund-owed decision. Ownership transfer: yes. Suppresses source: yes.

OUTCOMES:
- Primary: `h.correction`, `h.replacement`, `h.financial`, `x.no-remedy` (obligation satisfied or none applies)
- Secondary: `h.return` (conditional, pending a further return decision)
- Diagnostic: complaint, message_after_success, unsubscribe

TEST CASES:
- happy-path: exactly one remedy applies -> c.choice routes straight to c.route with no message
- alternate-branch: multiple remedies, counterparty's choice -> a.present shows only genuinely available options, routed accordingly
- alternate-branch: obligation already satisfied or no remedy applies -> a.no-remedy states this, names a separate appeal route only if one exists, x.no-remedy
- timeout: w.selection unanswered -> a.default applies the policy default, explicitly recorded as no-selection-made
- idempotency: a.obligation/a.evaluate retried after a redelivered event -> idempotencyKey prevents duplicate log entries or a re-triggered remedy

GAPS:
- P0 instance: keyed and required on `issue_id` alone, but of the three feeder journeys in this batch, only REM-151 actually produces an `issue_id` — SCH-180 (booking_id/provider_failure_id) and REM-152 (return_request_id) hand off with no issue_id minted. A deterministic derivation rule (or a broader accepted-key contract) is needed before this journey can safely serve as a shared hub.
- P1 handoff: no rule prevents a ping-pong between this journey's `h.return` and REM-152's `h.alternative` for the same obligation if REM-152 rejects the return.

---

## RET-24 — Churn Risk Escalation

READINESS: NEEDS_CONTRACT_WORK

WHY:
The graph itself is clean and canonically valid: multi-signal evidence assembly, a single human-channel action (an owner task, never a customer message), and well-formed handoffs to Cancellation Save (RET-28), operational recovery (RET-23), human-in-the-loop and Retention Offer Follow-Up (RET-30), or a no-action monitor exit. But the instance identity itself — 'risk_episode_id' — has no defined boundary anywhere in the graph or metadata: nothing says what opens a new episode versus appends to an open one, or when an episode is considered closed for dedupe purposes, unlike sibling journeys whose keys derive from a discrete declared act (a cancel click, a refund request). That is implementation-blocking ambiguity around instance identity, not a value to map, so this is NEEDS_CONTRACT_WORK rather than READY_WITH_MAPPING.

INSTANCE:
scope: customer, account or subscription relationship
key: [account_id, risk_episode_id]
dedupe policy: reject-duplicate
concurrency note: one-active-per-key per the canon, but no rule anywhere defines what opens a new risk_episode_id versus what appends evidence to an already-open one, or what closes an episode short of x.monitor's reEntry language ('stronger or fresher evidence re-opens this at a higher level'). This is the P0 instance-identity gap.

EVENTS:
canonical event: `churn_risk_threshold_crossed`
source type: authoritative
required evidence:
- several independent churn-relevant signals crossing a defined threshold together: sustained meaningful usage decline, a failed renewal or payment, a negative support experience, repeated unresolved blockers, explicit dissatisfaction, exploration of cancellation, a key stakeholder leaving, falling account-wide adoption
insufficient evidence:
- a single weak signal
- high account value alone, which describes what is at stake rather than the likelihood of losing it
- a risk score with no decomposable evidence behind it

DATA:
- `account_id` — used by instance key; all handoffs
- `risk_episode_id` — used by instance key; dedupe; carried on every handoff
- `risk_evidence` — used by a.evidence assembly; carried to h.human and h.intervention
- `cancellation_intent_ref` — used by c.intent branch to h.cancellation
- `operational_cause_ref` — used by c.operational branch to h.resolve-first
- `retention_ownership` — used by a.owner-task write, suppresses automated retention

SOURCE OF TRUTH:
- cancellation intent already on record (c.intent) → subscription/cancellation system of record
- risk driven by a known operational problem (c.operational) → support/ops case system
- evidence justifies a person (c.human) → internal risk-evidence assembly, evaluated against a business-defined bar

CONFIG:
- `churn_risk.threshold_definition` — the specific combination/count of corroborating signals that constitutes 'crossing the threshold together' (basis: business policy; required)
- `churn_risk.episode_boundary` — the rule for when a risk episode opens, accepts new evidence, and closes so the instance key is well-defined (basis: business policy; required)
- `churn_risk.human_threshold` — the evidentiary bar distinguishing 'justified' (send a person) from 'not justified' (thin evidence, try automated or monitor) (basis: business policy; has a default)
- `churn_risk.touches` — touch budget for the episode (corpus default 1, the owner task) (basis: business policy; has a default)

CHANNEL POLICY:
- **a.owner-task**: eligible [task]; urgency normal; requires permission: false; requires contactability: false

SUPPRESSION / PREEMPTION:
- Cancellation intent already on record suppresses a separate retention track for the relationship; the instance hands off to RET-28 instead of running independent churn messaging. (conflicts with: RET-28)
- A known operational cause suppresses promotional retention offers on the relationship until it is resolved; hands off to RET-23. (conflicts with: RET-23)
- contact.competition places this journey in the 'retention-outreach' exclusion group at account scope: precedence below an open issue under human ownership and below a declared cancellation intent (RET-28), above generic retention intervention (RET-30, RET-32); on loss the instance is suppressed. (conflicts with: RET-28, RET-30, RET-32)

HANDOFF:
- **h.cancellation** → RET-28 — carries: risk_evidence as context for the conversation; ownership transfer: true; suppresses source: true
- **h.resolve-first** → RET-23 — carries: risk_evidence; which part names the operational problem; the fact this is already at risk level; ownership transfer: true; suppresses source: true
- **h.human** → external:human-in-the-loop-lifecycle — carries: subscription_id; account_id; handed_at; reason; assembled evidence; what has already been sent; ownership transfer: true; suppresses source: false
- **h.intervention** → RET-30 — carries: the evidence it was chosen against; the risk state at the time it was sent; ownership transfer: true; suppresses source: false

OUTCOMES:
- **Neutral**: x.monitor (risk recorded, nothing proportionate to do)
- **Diagnostic (never primary/secondary)**: complaint; message_after_success; unsubscribe

TEST CASES:
- **happy-path**: given multiple corroborating signals cross the threshold together and evidence is strong enough to justify a person → expect a task is raised for the account owner carrying the assembled evidence, and automated retention on the relationship is suppressed
- **alternate-branch**: given cancellation intent is already declared on the account when the threshold crosses → expect the instance hands off directly to RET-28 carrying the evidence as context; no separate retention track opens
- **alternate-branch**: given the risk traces to a known, named operational problem → expect handoff to RET-23 with promotional retention offers suppressed on the relationship until the problem resolves
- **duplicate-trigger**: given a second combination of signals crosses the threshold for the same account while an instance is already open → expect no second instance opens; new evidence appends to the existing episode (subject to the unresolved episode-boundary rule)
- **idempotency**: given the evidence-assembly step (a.evidence) is retried after a delivery retry → expect the risk_evidence append happens exactly once (idempotencyKey subscription_id+account_id+a.evidence)
- **late-event**: given a stronger or fresher signal arrives after the instance already exited at x.monitor → expect the episode reopens at a higher evidence level per the exit's reEntry rule

GAPS:
- P0 (instance): risk_episode_id has no defined open/append/close boundary anywhere in the graph or metadata; the dedupe key cannot be implemented correctly without a business rule for what constitutes 'the same episode.'
- P1 (config): The multi-signal threshold ('several independent signals crossing a defined threshold together') is described qualitatively but never quantified — which combinations, and how many, must be defined as company policy before the trigger can fire consistently.
- P1 (suppression): c.operational's 'known problem' branch always routes to RET-23 regardless of what the operational cause is; when the cause is itself an open payment failure already owned by FIN-134 (payment recovery), the graph does not distinguish that case from a generic operational issue, risking two systems both believing they own the customer relationship.

---

---

## RET-26 — Service Recovery

READINESS: READY_WITH_MAPPING

WHY:
The graph is complete and well-guarded: duplicate-process deferral, unresolved-issue deferral to operational ownership, a usefulness gate that keeps silent fixes silent, and a compensation gate that routes real remedies to REM-159 rather than substituting a discount for an explanation. The one action node (a.acknowledge) has clearly described channel selection logic (persistent by default, low-friction push only when the failure happened in-app and the person is active there). What remains is company mapping: impact/severity classification, the compensation policy itself, and precisely which systems count as 'another recovery process already handling it.'

INSTANCE:
scope: person or account plus the experience or service entity that failed
key: [person_id, failure_ref]
dedupe policy: reject-duplicate
concurrency note: A second, unrelated failure on the same person is a second instance; one acknowledgement does not cover two incidents.

EVENTS:
canonical event: `authoritative_negative_experience`
source type: authoritative
required evidence:
- a recorded failure: a service failure, a failed fulfilment, a confirmed disruption, a failed critical action, or severe support dissatisfaction
insufficient evidence:
- negative feedback on its own, which reports an experience rather than confirming a failure
- a low survey score with no incident behind it

DATA:
- `person_id` — used by instance key
- `failure_ref` — used by instance key; idempotency
- `experience_ref` — used by a.assess; h.operational contract
- `failed_at` — used by a.assess; h.operational contract
- `impact` — used by c.compensation; h.operational contract
- `resolution_status` — used by c.resolved
- `resolved_at` — used by c.resolved
- `open_recovery_process_ref` (optional) — used by c.duplicate
- `compensation_policy_id` (optional) — used by c.compensation
- `has_active_app_session` (optional) — used by channel selection for a.acknowledge

SOURCE OF TRUTH:
- another recovery process already handling this failure (c.duplicate) → case management / other recovery-journey instance table
- the underlying issue is still unresolved (c.resolved) → operational system of record for the failure
- policy and impact support compensation (c.compensation) → compensation policy engine

CONFIG:
- `service_recovery.duplicate_process_scope` — which systems/journeys count as 'another recovery process already handling it' for c.duplicate (basis: business policy; required)
- `service_recovery.compensation_policy` — what impact/failure combinations justify a remedy (routed to REM-159) (basis: business policy; required)
- `service_recovery.touches` — one acknowledgement per failure (corpus default 1) (basis: business policy; has a default)

CHANNEL POLICY:
- **a.acknowledge**: eligible [email, push]; preferred when email is the default (persistent, keepable record); push only when the failure happened inside the app, the person has an active app session, and the acknowledgement is short; fallback [email]; urgency normal; requires permission: true; requires contactability: true

SUPPRESSION / PREEMPTION:
- An existing support case or other recovery process already handling the same failure suppresses this journey entirely (c.duplicate → x.defer); worth naming explicitly against a hypothetical open-complaint mechanism, which is outside this batch but is exactly the kind of process this journey must check for before sending.
- A remedy that policy and impact both support is owned by REM-159; this journey never substitutes a discount for an explanation. (conflicts with: REM-159)

HANDOFF:
- **h.operational** → external:operational-resolution — carries: failure_ref; experience_ref; person_id; impact; detected_at; ownership transfer: true; suppresses source: true
- **h.compensation** → REM-159 — carries: the failure and its assessed impact; what has already been said to the customer; ownership transfer: true; suppresses source: false

OUTCOMES:
- **Primary**: x.acknowledged (failure acknowledged, no remedy owed); h.compensation (remedy handed to REM-159)
- **Neutral**: x.silent (resolved without contact); x.defer (deferred to the process already handling it)
- **Diagnostic (never primary/secondary)**: complaint; support_contact_within_24h; message_before_resolution; discount_offered_here

TEST CASES:
- **happy-path**: given a confirmed, resolved failure with no compensation owed → expect a.acknowledge sends once, naming what failed, what was done, and what prevents recurrence
- **alternate-branch**: given policy and impact both support a remedy → expect handoff to REM-159 carrying the failure and what has already been said; no discount sent from this journey
- **alternate-branch**: given the failure is still unresolved → expect handoff to operational resolution; no recovery message sent until the fix lands
- **superseding-state**: given another recovery process already owns the same failure → expect instance exits as deferred (x.defer) with nothing sent
- **late-event**: given x.defer's owning process later closes with the customer still affected → expect this instance reopens per its reEntry rule
- **idempotency**: given a.acknowledge is retried after a delivery retry → expect at most one acknowledgement is sent (idempotencyKey person_id+failure_ref+touch id)

GAPS:
- P1 (config): The rule for what counts as 'another recovery process already handling it' spans multiple external systems (case management, other recovery journeys) and is not enumerated — teams could under- or over-suppress depending on how broadly this is implemented.
- P1 (config): The compensation policy that routes to REM-159 is referenced (compensation_policy_id) but not defined in this journey; without it, c.compensation cannot be evaluated consistently.
- P2 (data): has_active_app_session is optional and used only for channel selection; if it is not reliably available, the journey should default to the persistent (email) channel rather than fail open.

---

---

## RET-28 — Cancellation Save

READINESS: READY_WITH_MAPPING

WHY:
This is one of the strongest-specified journeys in the batch: an explicit, enumerated reason taxonomy (PRICE, LOW_USAGE, MISSING_VALUE, TECHNICAL_PROBLEM, SERVICE_ISSUE, TEMPORARY_NEED, SWITCHING, OTHER), a session-bound answer window, an explicit intent-lapse window, and channel selection that is fully determined by where the intent was declared (in-app vs. outside the product). It never obstructs the cancellation path and never asks or offers twice. What remains is mapping the reason taxonomy to the company's actual retention-alternatives catalogue and filling in the two example-only timing windows.

INSTANCE:
scope: the subscription, membership or service relationship being cancelled
key: [person_id, relationship_id, intent_id]
dedupe policy: reject-duplicate
concurrency note: Cancelling one subscription says nothing about others on the same account; distinctFrom RET-29 by design — the two journeys must never share an event (this runs while reversible, RET-29 after the decision is made).

EVENTS:
canonical event: `explicit_cancellation_intent`
source type: declared
required evidence:
- an explicit act: a cancel flow entered, a cancellation requested while still reversible, or a cancellation asked for through a person
insufficient evidence:
- viewing the billing page
- a pricing question to support
- declining usage, which is a signal about risk and not a statement of intent

DATA:
- `person_id` — used by instance key
- `relationship_id` — used by instance key; a.context
- `intent_id` — used by instance key; idempotency
- `declared_at` — used by w.decision timing
- `declared_via` — used by channel selection (in-session vs persistent)
- `holdings` — used by a.context
- `effective_date_if_cancelled` — used by a.context; h.execute
- `declared_reason` (optional) — used by c.resolution alternative matching
- `alternatives_catalogue` (optional) — used by c.resolution
- `has_active_session` (optional) — used by channel selection

SOURCE OF TRUTH:
- a legitimate resolution exists for the stated reason (c.resolution) → company retention-alternatives catalogue mapped to the reason taxonomy
- what the customer ultimately decided (c.decision) → cancellation flow / subscription system of record

CONFIG:
- `cancellation_save.answer_window` — how long the reason question stays open (bound to the session/conversation it was asked in) (basis: expected user rhythm, timing class: attribute-bound; has a default)
- `cancellation_save.intent_window` — how long an unconfirmed intent stays meaningful before it lapses (basis: business policy, timing class: observation-window; has a default)
- `cancellation_save.cooldown` — how long before the reason question is asked again after a lapsed intent (basis: business policy; has a default)
- `cancellation_save.touches` — at most one ask and one offer per intent (basis: business policy; has a default)

CHANNEL POLICY:
- **a.ask**: eligible [in-app, email]; preferred when in-app when the intent was declared inside the product (beside the cancel step); email when declared outside the product (message or phone); fallback [email]; urgency normal; requires permission: true; requires contactability: true
- **a.offer**: eligible [in-app, email]; preferred when same rule as a.ask, bound to intent_id; fallback [email]; urgency normal; requires permission: true; requires contactability: true

SUPPRESSION / PREEMPTION:
- A declared cancellation intent outranks inferred churn risk on the same account (contact.competition, retention-outreach group); only the offer step ever yields, and only to an open issue under human ownership — the cancellation path itself is never obstructed by any contest. (conflicts with: RET-24)
- RET-32 (Lapsed Customer Win-Back) explicitly starts only after this journey's own save window and cooldown have passed on the same relationship — the two never run concurrently by design. (conflicts with: RET-32)

HANDOFF:
- **h.intervention** → RET-30 — carries: the declared reason and the alternative chosen against it; the cancellation episode this belongs to; ownership transfer: true; suppresses source: false
- **h.execute** → SUB-167 — carries: the declared reason; what was offered, if anything, and what was declined; ownership transfer: true; suppresses source: false

OUTCOMES:
- **Primary**: cancellation_flow_abandoned (businessOutcome — the save's measured success)
- **Secondary**: cancellation_reason_given
- **Neutral**: x.lapsed (intent expressed, not carried through)
- **Diagnostic (never primary/secondary)**: complaint; cancel_path_obstructed; second_offer_sent; support_contact_within_24h

TEST CASES:
- **happy-path**: given intent declared in-app with no stated reason, and a genuine alternative exists once asked → expect the reason is asked once beside the cancel step, an alternative is offered once, and handoff goes to RET-30 with the reason and chosen alternative
- **alternate-branch**: given no reason is worth asking for (would change nothing, or asking would be friction) → expect proceeds straight to c.resolution without asking
- **timeout**: given the reason question goes unanswered through the end of the session it was asked in → expect a.no-reason runs and the flow proceeds without a declared reason
- **timeout**: given no decision is confirmed or abandoned within the intent window → expect x.lapsed exit; the relationship stands unchanged
- **duplicate-trigger**: given a second cancellation intent is declared while one is already open for the same relationship → expect no second instance opens; the existing intent_id instance continues
- **human-ownership**: given an open issue under human ownership exists on the account → expect the offer step yields to human ownership; the cancellation path itself is still never obstructed

GAPS:
- P1 (config): c.resolution's mapping from a declared reason to 'a legitimate resolution' depends on a company-defined alternatives_catalogue that is optional and undefined here — without it, teams will draw the reason→alternative mapping inconsistently.
- P2 (config): Both timing windows (answer_window, intent_window) are given only as low-confidence, example-only ranges and must be set from real business policy.

---

---

## RET-30 — Retention Offer Follow-Up

READINESS: READY_WITH_MAPPING

WHY:
A clean, well-guarded outcome-closing journey: acceptance is verified against the system of record rather than trusted from the customer's answer (so an accepted-but-unapplied offer routes to h.fix, never recorded as a win), a decline is remembered for the whole cancellation episode, and the follow-up is capped at exactly one message. The one real gap is that two of its timing configs (the outcome wait and the cooldown) are marked required with no example value at all, unlike almost every other journey in the corpus, which at least offers a low-confidence starting range.

INSTANCE:
scope: the customer, account or subscription plus the retention episode the intervention belongs to
key: [account_id, retention_episode_id]
dedupe policy: reject-duplicate
concurrency note: The episode is the unit; a declined offer is declined for the whole episode, not just the message that carried it. retention_episode_id is typically inherited via handoff from the journey that delivered the intervention (RET-24 or RET-28), so its origin is defined upstream even though this journey does not itself define episode boundaries.

EVENTS:
canonical event: `retention_intervention_delivered`
source type: authoritative
required evidence:
- a defined intervention actually delivered: a plan alternative, a pause option, a support resolution, human outreach, or an approved save offer
insufficient evidence:
- an intervention scheduled but not yet delivered

DATA:
- `account_id` — used by instance key
- `retention_episode_id` — used by instance key; a.record-decline scoping
- `intervention_delivered` — used by trigger evidence
- `offer_status` — used by c.outcome
- `retention_episode_history` — used by a.record-decline write; prevents re-offering a declined offer

SOURCE OF TRUTH:
- whether the relationship actually changed after an accepted offer (a.verify / c.applied) → system of record for the plan/pause/subscription state (engagement is evidence-only, never the outcome)

CONFIG:
- `retention_intervention.outcome` — the bounded decision window to wait for an outcome before treating silence as a result (basis: operational SLA, timing class: response-window; required)
- `retention_intervention.cooldown` — cooldown between instances of this journey for the same customer (basis: business policy, timing class: cooldown; required)
- `retention_intervention.touches` — one follow-up at most (corpus default 1) (basis: business policy; has a default)

CHANNEL POLICY:
- **a.followup**: eligible [email, in-app]; preferred when email (persistent) by default; in-app when the person is active in the product and the action is taken there; fallback [email]; urgency normal; requires permission: true; requires contactability: true

SUPPRESSION / PREEMPTION:
- contact.competition places this journey lowest in the retention-outreach exclusion group at account scope — any live risk case (RET-24) or open issue on the same account outranks it and suppresses it. (conflicts with: RET-24)

HANDOFF:
- **h.observe** → RET-27 — carries: what was accepted and what actually changed; the fact this is one positive event, not yet a recovered state; ownership transfer: true; suppresses source: false
- **h.fix** → external:operational-resolution — carries: what was agreed and what failed to happen; the explicit fact that retention has not succeeded; ownership transfer: true; suppresses source: true
- **h.proceed** → SUB-167 — carries: what was offered and declined; the declared reason it was chosen against; ownership transfer: true; suppresses source: false

OUTCOMES:
- **Primary**: relationship_recovered (businessOutcome, via h.observe → RET-27)
- **Neutral**: x.declined (intervention declined, relationship intact); x.cooldown (no response; episode closed)
- **Diagnostic (never primary/secondary)**: complaint; message_after_success; unsubscribe

TEST CASES:
- **happy-path**: given the customer accepts the offer and the system of record confirms the state actually changed → expect handoff to RET-27 for durability observation
- **alternate-branch**: given the customer accepts but the change never applies (execution failure) → expect handoff to external operational resolution; this is never recorded as a retention success even though the customer said yes
- **alternate-branch**: given the customer explicitly declines and cancellation is still in progress → expect the decline is recorded against the whole episode, then handoff to SUB-167 to proceed with cancellation
- **timeout**: given no response within the outcome window, and the offer is time-limited or plausibly misunderstood → expect exactly one follow-up is sent, then the episode closes with a cooldown in force
- **duplicate-trigger**: given the same offer would otherwise be re-sent inside an episode where it was already declined → expect the decline record prevents a second offer in the same episode

GAPS:
- P1 (config): retention_intervention.outcome (the wait-for-outcome window) is marked required with no example value anywhere in the graph — every other timed journey in this batch gives at least a low-confidence range.
- P1 (config): retention_intervention.cooldown is likewise required with no example value; teams have no starting point for either config and must derive both entirely from business policy.

---

---

## RET-31 — Predicted Need Replenishment

READINESS: READY_WITH_MAPPING

WHY:
A tightly bounded, well-guarded journey: every wait re-reads purchases/subscriptions/dismissals from the system of record before acting, a purchase or dismissal always wins over a scheduled send, and the journey states explicitly that opens and clicks never move state — only purchase and dismissal events do, which is the corpus's own explicit engagementIsEvidenceOnly guardrail satisfied in the text. Channel selection between email and push/in-app is clearly conditioned on lead time and session/token presence. What remains is company mapping: the prediction methodology itself (usable_period, expected_depletion_at) is inferred and its computation is not specified by the canon, plus the usual example-only timing windows and holdout share.

INSTANCE:
scope: the predicted need — one consumable or recurring-use item, or a category the person buys on a cadence
key: [person_id, need_key]
dedupe policy: supersede-open
concurrency note: A purchase of the need, by any channel, closes the open instance as replenished (s.supersession); a newer prediction for the same need never opens a second instance while one is open.

EVENTS:
canonical event: `expected_depletion_approaching`
source type: inferred
required evidence:
- a prior purchase of the need by this person, with its date and quantity
- a usable period for the item, from which the expected depletion date is computed
- the computed expected depletion date and the prediction cycle it belongs to
insufficient evidence:
- a category average with no purchase by this person behind it
- a purchase covered by an active subscription or auto-replenishment
- a need dismissed in this prediction cycle
- a newer purchase of the need since the one the prediction rests on

DATA:
- `person_id` — used by instance key
- `need_key` — used by instance key
- `last_purchase_at` — used by prediction basis
- `last_purchase_quantity` — used by prediction basis
- `usable_period` — used by expected_depletion_at computation
- `expected_depletion_at` — used by all wait timing
- `prediction_cycle` — used by idempotency; instance scoping
- `reorder_destination` — used by a.touch1 / a.touch2 destination
- `subscription_status` (optional) — used by c.eligible
- `dismissal_status` (optional) — used by c.eligible
- `has_active_app_session` (optional) — used by channel selection
- `delivery_lead_time` (optional) — used by lead_time config applicability

SOURCE OF TRUTH:
- the need is still unmet at each check (c.state, c.outcome, c.final) → purchase/subscription/dismissal system of record, re-read fresh at every touch (engagement is evidence-only, never the outcome)

CONFIG:
- `replenishment.lead_time` — how far ahead of predicted depletion the first prompt fires (basis: expected user rhythm, timing class: reminder-before-attribute; has a default)
- `replenishment.follow_margin` — how long after predicted depletion the follow-up waits (basis: expected user rhythm, timing class: observation-window; has a default)
- `replenishment.lifetime` — how long the instance stays open purely to observe after the follow-up (basis: business policy, timing class: observation-window; has a default)
- `replenishment.holdout_share` — persistent per-person holdout for honest measurement of the business outcome (basis: business policy; has a default)
- `replenishment.incentive_policy` — optional incentive appearing only on the last enabled touch (basis: business policy; has a default)
- `replenishment.touches` — lead prompt plus one follow-up (corpus default 2) (basis: business policy; has a default)

CHANNEL POLICY:
- **a.touch1**: eligible [email, push, in-app]; preferred when email by default, sent days ahead; push/in-app when an app session or valid push token exists and reorder is one step away; fallback [email]; urgency low; requires permission: true; requires contactability: true
- **a.touch2**: eligible [email, push, in-app]; preferred when same rule as a.touch1; fallback [email]; urgency low; requires permission: true; requires contactability: true

SUPPRESSION / PREEMPTION:
- contact.competition places this journey in the commerce-recovery exclusion group at person scope, below process recovery and selection recovery for the same person, above interest recovery.
- s.contest: an open complaint, payment recovery, or retention-outreach journey for the same person suppresses this journey. (conflicts with: FIN-134)

HANDOFF:
none

OUTCOMES:
- **Primary**: x.replenished (purchase_completed businessOutcome)
- **Secondary**: replenishment_need_dismissed
- **Neutral**: x.no-action (no prompt sent, reason recorded); x.lapsed (prompted, neither replenished nor dismissed)
- **Diagnostic (never primary/secondary)**: unsubscribe; complaint; message_after_success; prompt_after_dismissal; prediction_error_reported; incentive_issued

TEST CASES:
- **happy-path**: given no purchase, subscription or dismissal by the lead point, and the send path is clear → expect the lead prompt is sent naming the item, the estimate, and the reorder route
- **alternate-branch**: given a purchase of the need is recorded at any point after the instance opens → expect immediate exit to x.replenished, superseding any pending touch
- **alternate-branch**: given the person dismisses the need → expect exit to x.dismissed; nothing further sent this cycle
- **timeout**: given the lead prompt goes unanswered and depletion has passed by the follow margin → expect the follow-up sends once, with no invented urgency
- **contactability-loss**: given commercial permission is absent at eligibility check → expect a.record-no-action records the reason; x.no-action exit; nothing is sent on any channel
- **superseding-state**: given an active subscription or auto-replenishment covers the need → expect no instance is meaningfully opened for messaging purposes; recorded as no-action

GAPS:
- P1 (data): usable_period / expected_depletion_at computation methodology is not specified by the canonical graph (the trigger is explicitly 'inferred') — this must be built and owned as a prediction capability outside this contract, with its own accuracy monitoring (prediction_error_distribution is already an operational metric, which helps).
- P2 (config): All three timing windows and the holdout share are example-only, low-confidence values and must be set from real business/delivery data.

---

---

## RET-32 — Lapsed Customer Win-Back

READINESS: READY_WITH_MAPPING

WHY:
A carefully bounded win-back journey: eligibility explicitly excludes reasons and refund/dispute histories policy lists as excluding outreach, the invitation is required to be honest (no invented change), and the exclusion group explicitly names 'any live retention, complaint, risk or payment journey on the account' as disqualifying — which directly resolves this journey's relationship to FIN-134 and the rest of the retention-outreach group. What remains is company mapping of the exclusion policy lists themselves and the long cooldown window.

INSTANCE:
scope: a formerly paying relationship that ended or went dormant, with no active obligation, subscription, open complaint or process
key: [person_id, relationship_id]
dedupe policy: reject-duplicate
concurrency note: A repaid relationship (new paid term, purchase, reactivated subscription) closes the instance as won; a new lapse after that is a new instance, subject to the long cooldown counted from this lapse.

EVENTS:
canonical event: `lapsed_customer_detected`
source type: authoritative
required evidence:
- a relationship record showing at least one completed paid term or purchase
- the relationship ended or went dormant under the company's lapse rule, with the date
- the recorded cancellation reason where one exists, and the refund and dispute history
- that the cancellation's own save window and cooldown have passed
insufficient evidence:
- low usage on an active relationship — that is usage-drop territory, not a lapse
- a cancellation still inside its save window — RET-28 owns it
- a lapse caused by an unpaid obligation that is still open — payment recovery owns it
- a trial or free relationship that never paid — ACT-20 owns it

DATA:
- `person_id` — used by instance key
- `relationship_id` — used by instance key
- `paid_terms_or_purchases` — used by eligibility
- `lapsed_at` — used by eligibility; cooldown basis
- `lapse_rule` — used by eligibility
- `cancellation_reason` — used by c.eligible exclusion check; c.basis
- `refund_dispute_history` — used by c.eligible exclusion check
- `return_destination` — used by a.touch1 / a.touch2 destination
- `change_record_since_lapse` (optional) — used by c.basis honest-content check
- `has_push_token` (optional) — used by channel selection
- `previous_plan` (optional) — used by c.basis
- `winback_incentive_eligibility` (optional) — used by c.second

SOURCE OF TRUTH:
- the relationship is eligible to be written to about coming back (c.eligible) → relationship/billing system of record plus a policy-defined exclusion list
- what the invitation can honestly say changed (c.basis) → change/release record keyed to the recorded cancellation reason

CONFIG:
- `winback.cooldown` — how long a relationship that did not come back is left alone before another win-back instance (basis: business policy, timing class: cooldown; has a default)
- `winback.response_window` — how long the invitation is given to be acted on before a follow-up is considered (basis: expected user rhythm, timing class: response-window; has a default)
- `winback.lifetime` — how long the instance observes after the follow-up before lapsing (basis: business policy, timing class: observation-window; has a default)
- `winback.holdout_share` — persistent holdout required for honest measurement of the business outcome (basis: business policy; has a default)
- `winback.incentive_policy` — optional win-back incentive on the last enabled touch, issuance tracked per person (basis: business policy; has a default)
- `winback.follow_up_enabled` — whether the company enables a second touch at all (basis: business policy; has a default)
- `winback.touches` — one invitation, one optional follow-up (corpus default 2) (basis: business policy; has a default)

CHANNEL POLICY:
- **a.touch1**: eligible [email, push]; preferred when email (persistent) by default; push when a valid push token exists and the return route is one step away; fallback [email]; urgency low; requires permission: true; requires contactability: true
- **a.touch2**: eligible [email, push]; preferred when same as a.touch1; fallback [email]; urgency low; requires permission: true; requires contactability: true

SUPPRESSION / PREEMPTION:
- distinctFrom RET-28: this journey starts only after RET-28's own save window and cooldown have passed on the same relationship — the two never run concurrently by design. (conflicts with: RET-28)
- contact.competition places this journey lowest in the retention-outreach exclusion group at account scope: any live retention, complaint, risk or payment journey on the account (including an open FIN-134 payment recovery) means the relationship is not lapsed, and this journey does not run. (conflicts with: RET-24, RET-28, RET-30, FIN-134)

HANDOFF:
none

OUTCOMES:
- **Primary**: x.won (relationship_repaid businessOutcome)
- **Secondary**: purchase_completed
- **Neutral**: x.no-action (excluded reason or gate recorded); x.lapsed (invited, not returned)
- **Diagnostic (never primary/secondary)**: unsubscribe; complaint; message_after_success; outreach_on_excluded_reason; incentive_issued; incentive_reissued_same_person

TEST CASES:
- **happy-path**: given an eligible lapsed relationship with no excluding reason or history, send path clear → expect a plain or reason-specific invitation is sent once with the return route
- **contactability-loss**: given the recorded cancellation reason is one policy lists as excluding outreach (e.g. bereavement, closed business) → expect a.record-no-action records the exclusion; x.no-action exit; nothing is sent
- **permission-loss**: given commercial permission was withdrawn at or after cancellation → expect recorded as no-action; never falls back to another channel
- **timeout**: given no response within the response window and the company has not enabled a follow-up → expect x.lapsed exit directly; no second touch
- **alternate-branch**: given the follow-up is enabled and an incentive policy or further change gives something honest to add → expect one follow-up is sent, incentive issuance recorded per person
- **superseding-state**: given an open FIN-134 payment recovery exists on the relationship → expect the relationship is not treated as lapsed; this journey does not run

GAPS:
- P1 (config): The policy lists of excluding cancellation reasons and excluding refund/dispute histories are referenced but not enumerated — required before c.eligible can be implemented consistently.
- P2 (config): cooldown, response_window, and lifetime are all example-only, low-confidence ranges (180-365 days, 14-30 days, 30-60 days respectively) and must be set from real business policy.

---

---

## RLT-279 — Upgrade Blocker Reminder

READINESS: READY_WITH_MAPPING

WHY:
The graph's discipline is exactly matched to its own name: it never prompts a holder to act on a blocker that is not theirs to clear (c.resolvable routes provider/approval/elapsed-time causes to a.inform-hold with nothing asked), and 'not ready' is explicitly recorded as unprepared rather than failed (s.g4). Both waits are attribute-bound to preparation_window_ends_at, and the two-prompts-maximum rule is enforced by the graph shape itself (a.name-blocker then at most one a.last-call). Implementation work is mapping blocking_prerequisite classification (theirs vs not) to the company's real rollout/readiness system.

INSTANCE:
- scope: the target, the change waiting on it, and the named prerequisite that is blocking it
- key: [target_id, change_id]
- dedupePolicy: reject-duplicate
- concurrency: A second blocker on the same target is named in the same prompt or not at all — two prompts about one target read as two problems, so this is a single instance per target+change even with multiple prerequisites.

EVENTS:
- canonicalEvent: target_held_on_named_prerequisite
- sourceType: authoritative
- requiredEvidence: a target authoritatively held for a planned change; the specific prerequisite that is blocking it, named rather than described; a preparation window with time still in it
- insufficientEvidence: a change that is available but not yet scoped to this target; a hold whose cause has not been identified

DATA:
- target_id (required) — used by: instance key
- change_id (required) — used by: instance key
- holder_id (required) — used by: message destination
- blocking_prerequisite (required) — used by: c.resolvable, a.name-blocker content
- preparation_window_ends_at (required) — used by: w.clear / w.final timeout basis

SOURCE OF TRUTH:
- the target is held for the change and the prerequisite blocking it -> RLT-242 (works out preparation requirements and records blockers), per distinctFrom
- named_requirement_satisfied -> the system that tracks the prerequisite's clearance (version, capacity, dependency, confirmation) [engagementIsEvidenceOnly: true]

CONFIG:
- upgrade_blocker.touches: touch budget — two prompts at most, both naming the same blocker and date (basis: business policy, required: false)
- upgrade_blocker.clear: the point in the preparation window past which a still-blocked target cannot be made ready in time (basis: operational SLA, timingClass: attribute-bound, required: true)
- upgrade_blocker.final: after the last call, wait until the preparation window itself closes — no third prompt (basis: business policy, timingClass: attribute-bound, required: true)

CHANNEL POLICY:
- a.inform-hold: eligible [in-app, email]; preferredWhen: in-session(in-app) when active in product; persistent(email) default; nothing asked since the holder cannot clear it; fallback: same-role-other-channel; urgency: low; requiresPermission: false; requiresContactability: true
- a.name-blocker: eligible [in-app, email]; preferredWhen: same role logic as a.inform-hold; fallback: same-role-other-channel; urgency: normal; requiresPermission: false; requiresContactability: true
- a.last-call: eligible [in-app, email]; preferredWhen: same role logic; the single further prompt allowed; fallback: same-role-other-channel; urgency: high; requiresPermission: false; requiresContactability: true

SUPPRESSION / PREEMPTION:
none identified

HANDOFF:
- h.resume -> RLT-242; requiredContext: which blocker cleared and when; what the holder was told, so readiness is not announced to them twice; ownershipTransfer: true; suppressSource: false

OUTCOMES:
- primary: named_requirement_satisfied
- secondary: none
- neutral: held on a blocker the holder cannot clear (x.held); change withdrawn before the blocker was cleared (x.moot)
- failure: preparation window closed with the blocker outstanding (x.unprepared)
- diagnostic: complaint; message_after_success; unsubscribe

TEST CASES:
- happy-path: the blocker is theirs to clear and they clear it inside the preparation window -> a.name-blocker fires, w.clear catches named_requirement_satisfied via c.cleared, and h.resume hands off to RLT-242 with what the holder was already told
- alternate-branch: the prerequisite depends on a supplier or fixed period elapsing -> c.resolvable routes to a.inform-hold, with nothing asked of the holder
- timeout: the blocker is still outstanding at the first timeout point but time remains in the window -> c.last-call routes to a.last-call, the second and final prompt naming the same blocker and date
- superseding-state: the change is withdrawn or superseded before the blocker clears -> c.cleared routes to x.moot, correctly distinct from a failed or unprepared outcome
- idempotency: a.name-blocker retried by delivery infrastructure -> idempotencyKey (person_id + a.name-blocker) prevents a duplicate first prompt

GAPS:
- none

---

## RSK-273 — Usage Limit Alert

READINESS: READY_WITH_MAPPING

WHY:
A well-scoped notification journey (deliberately separate from RSK-199, which holds the actual count and enforces the block): it names the limit, states the reset honestly with no invented dates, names the free path even in the message selling the paid one, and — when the capacity decision belongs to someone else — sends two distinct, separately-tracked messages to both the blocked party and the decider rather than assuming one covers the other. What remains is company mapping of who counts as the capacity_decider and what capacity paths actually exist per limit type.

INSTANCE:
scope: the entity and the one limit constraining it, in one measurement window
key: [entity_ref, limit_id, window_id]
dedupe policy: reject-duplicate
concurrency note: One limit, one window, one authoritative count; reaching it again in a later window re-enters as a new instance.

EVENTS:
canonical event: `limit_reached_and_action_blocked`
source type: authoritative
required evidence:
- an authoritative usage figure against a defined limit and measurement window
- an action actually blocked or held by that limit
insufficient evidence:
- a figure from a lagging or non-authoritative counter
- approaching a threshold with nothing yet stopped

DATA:
- `entity_ref` — used by instance key
- `limit_id` — used by instance key
- `window_id` — used by instance key
- `usage` — used by a.at-the-wall content
- `limit_value` — used by a.at-the-wall content
- `window_resets_at` — used by w.capacity timing; a.reset content
- `capacity_decider` — used by c.decider routing

SOURCE OF TRUTH:
- what path exists from here (c.path) → commercial/plan system defining whether capacity is purchasable and whether a reset point is authoritatively known
- who holds the capacity decision (c.decider) → account/role system of record for commercial authority
- what changed at wait's end (c.outcome) → usage/limit system of record (RSK-199), never a locally guessed clock (engagement is evidence-only, never the outcome)

CONFIG:
- `usage_limit.touches` — the wall notice and reset notice are mandatory; discretionary offers run against a plan-length budget (corpus default 2) (basis: business policy; has a default)
- `usage_limit.capacity` — the wait for the authoritative reset or an authorised capacity increase — never an invented reset point (basis: platform constraint, timing class: attribute-bound; required)

CHANNEL POLICY:
- **a.at-the-wall**: eligible [in-app, email]; preferred when in-app when the person is active in the product at the moment of the block; email otherwise; fallback [email]; urgency normal; requires permission: false; requires contactability: true
- **a.offer-self**: eligible [in-app, email]; preferred when same rule as a.at-the-wall; fallback [email]; urgency normal; requires permission: false; requires contactability: true
- **a.offer-holder**: eligible [in-app, email]; preferred when sent to the party who holds the capacity decision, on whichever channel reaches them; fallback [email]; urgency normal; requires permission: false; requires contactability: true
- **a.notify-blocked-party**: eligible [in-app, email]; preferred when sent to the blocked person, separately from and regardless of whether a.offer-holder succeeds; fallback [email]; urgency normal; requires permission: false; requires contactability: true
- **a.reset**: eligible [in-app, email]; preferred when same rule as a.at-the-wall, taken from the authoritative reset; fallback [email]; urgency normal; requires permission: false; requires contactability: true

SUPPRESSION / PREEMPTION:
- distinctFrom RSK-199: RSK-199 holds the count and enforces the block; this journey adds nothing operational and sends only figures RSK-199 already treats as authoritative.
- distinctFrom RSK-193: a limit reached is not risk-driven restriction, and this message must never borrow the vocabulary of a risk/abuse message.

HANDOFF:
- **h.capacity** → SUB-166 — carries: the limit, the window and the usage that triggered this; which action is held and who is waiting on it; ownership transfer: true; suppresses source: false

OUTCOMES:
- **Primary**: x.reset (window reset; capacity available again); capacity_authorised (businessOutcome, via h.capacity → SUB-166)
- **Neutral**: x.blocked (at the limit with no route to more capacity in this window)
- **Diagnostic (never primary/secondary)**: complaint; message_after_success; unsubscribe

TEST CASES:
- **happy-path**: given the person hitting the limit also holds the capacity decision, and capacity is purchasable → expect a.at-the-wall then a.offer-self, naming both the paid capacity and the free reset
- **alternate-branch**: given the capacity decision sits with someone else on the relationship → expect a.offer-holder and a.notify-blocked-party are sent as two separate sends on separate routes; either can fail without the other
- **alternate-branch**: given no purchasable capacity exists and no reset point is authoritatively defined → expect x.blocked exit with no route to more capacity in this window
- **timeout**: given the authoritative window reset occurs before any capacity is authorised → expect a.reset sends taken from the authoritative reset, never an assumed clock; x.reset exit
- **human-ownership**: given the capacity decision belongs to another party who authorises more capacity → expect handoff to SUB-166 to execute the plan/terms change
- **late-event**: given the limit is reached again in a later measurement window → expect a fresh instance opens under a new window_id; no collision with the prior, closed instance

GAPS:
- P1 (config): capacity_decider resolution logic (which party, under what account/role structure, holds the commercial authority to authorise more capacity) is required data with no resolution rule given.
- P2 (data): usage_limit.capacity is marked required with no example wait value; teams must derive it entirely from the authoritative reset semantics of each limit type.

---

---

## SCH-180 — Booking Reschedule

READINESS: NEEDS_CONTRACT_WORK

WHY:
The graph itself is complete and internally consistent: reallocate/reschedule/cancel branches are logical, the provider-cancellation-is-not-customer-cancellation guardrails are enforced at the write level (a.protect), and financial/remedy consequences are correctly kept as separate downstream decisions. Two implementation-blocking ambiguities keep this out of READY_WITH_MAPPING: the instance key pairs `booking_id` with `provider_failure_id` while node `a.scope`'s own text implies one failure should be handled as a single fan-out unit across every affected booking, and the `h.remedy` handoff into REM-157 supplies no `issue_id` even though REM-157 is keyed and required on `issue_id` alone.

INSTANCE:
Scope: the affected reservations and the provider or resource failure behind them. Key: `booking_id` + `provider_failure_id`. Dedupe: reject-duplicate. Concurrency note: `a.scope`'s own text ("a closed location is not one cancellation... every reservation the failure affects") implies one failure should be handled as a single unit spanning every affected booking, but the instance key reads as one instance per affected booking. An implementer must pick explicitly: fan out one instance per booking, or one instance per `provider_failure_id` that internally loops the affected bookings.

EVENTS:
`provider_or_resource_cannot_fulfil`, authoritative. Required evidence: a confirmed reservation that can no longer be fulfilled by its assigned provider or resource (unavailability, resource failure, location closure, withdrawn capacity, operational incident). Insufficient alone: a customer asking to move the booking (their reschedule, not our failure); a provider's tentative doubt that has not become an inability.

DATA:
- `booking_id` — instance key; every action
- `provider_failure_id` — instance key; a.scope, a.protect
- `affected_reservations` — a.scope
- `replacement_candidates` — c.replacement, a.reallocate
- `reschedule_rules` — c.reschedule
- `reservation_log` — a.reallocate, a.release-old, a.cancel, a.release-cancel (append)

SOURCE OF TRUTH:
- A confirmed reservation can no longer be fulfilled -> scheduling / reservation system of record
- A replacement satisfies the service's actual requirements (not merely availability) -> service/provider capability catalog
- The applicable rules permit rescheduling -> scheduling policy engine
(engagementIsEvidenceOnly is false throughout — no decision here is based on message engagement.)

CONFIG:
- `provider_cancellation.touches` — max messages per instance against the plan's own length; basis: business policy; not required (has a corpus default)

CHANNEL POLICY:
- `a.inform` — eligible [email, sms]; preferred when the message has to be kept and survive until the person can act (persistent/email default); fallback same-role-other-channel; urgency normal; requires sms permission; requires contactability
- `a.notify-provider-cancel` — eligible [email, sms]; preferred when an asserted time bound lies inside the urgent horizon and sms permission is recorded; urgency high; requires sms permission; requires contactability

SUPPRESSION / PREEMPTION:
- s.g1/s.g2: a provider cancellation is never a customer cancellation and the customer is never a no-show — this journey is the sole authority on provider-side attribution for the booking.
- SCH-280 explicitly defers to this journey via its own `h.provider` handoff whenever a miss turns out to be provider-side, resolving that specific mutual-ownership question in-graph.

HANDOFF:
- `h.reschedule` -> SCH-175. Carries: the original commitment and the requirements a replacement slot has to satisfy; the explicit fact the move originates on our side. Ownership transfer: yes. Suppresses source: yes.
- `h.remedy` -> REM-157. Carries: the obligation as it stands and the fact the customer did nothing wrong; the fact compensation is a separate question. Ownership transfer: yes. Suppresses source: yes.
- `h.financial` -> FIN-137. Carries: what was paid and the fact the cancellation was ours; no cancellation fee applies. Ownership transfer: yes. Suppresses source: yes.

OUTCOMES:
- Primary: `x.reallocated` (time and commitment both preserved); `h.reschedule` (recovered at another time)
- Secondary: `h.remedy` (unresolved obligation routed onward); `h.financial` (paid booking routed to refund decision)
- Failure: `x.cancelled-provider` (cancelled on our side, nothing attributed to the customer)
- Diagnostic: complaint, message_after_success, unsubscribe

TEST CASES:
- happy-path: an equivalent replacement exists and nothing customer-visible changes -> reallocate silently, x.reallocated
- alternate-branch: no replacement exists but reschedule is permitted -> h.reschedule to SCH-175
- alternate-branch: reschedule not permitted, nothing paid or owed -> x.cancelled-provider directly, no remedy/financial handoff
- duplicate-trigger: a second failure event for the same booking_id + provider_failure_id while open -> no second instance opens
- idempotency: a.release-old retried after a redelivery -> resource released exactly once
- contactability-loss: no sms permission recorded -> a.notify-provider-cancel falls back to email

GAPS:
- P0 handoff: `h.remedy` hands off to REM-157, which is keyed and required on `issue_id` alone; SCH-180 carries no `issue_id` anywhere and the handoff mints none — REM-157 cannot open an instance from this handoff until an issue_id derivation rule is defined.
- P1 instance: instance-key fan-out ambiguity between per-booking and per-failure instancing (detailed above).
- P1 channel: `a.inform`'s "urgent" role criterion ("an asserted time bound lies inside the urgent horizon") does not clearly apply to a pure change notice where the booking time did not move — implementers need a rule for whether a.inform ever uses sms.

---

## SCH-266 — Appointment Reminder

READINESS: READY_WITH_MAPPING

WHY:
The graph is thoroughly guarded — revalidate-at-send-time, one-reminder-per-occurrence, and explicit statements that engagement with a reminder is never treated as preparation or attendance. The dual-wait design (prerequisite window then pre-start window) is sound. Implementation mainly needs the pre-start window's real value per service type (the corpus default is explicitly example-only/low-confidence) and a fix to one internally inconsistent channel-role reference.

INSTANCE:
Scope: the confirmed booking occurrence plus the prerequisites its customer owes against it. Key: `booking_id` + `occurrence_id`. Dedupe: supersede-open (the entity explicitly declares a supersession rule). Concurrency note: a rescheduled occurrence is the same instance re-timed; a cancellation or material change supersedes it and the replacement booking runs its own readiness from its own confirmation.

EVENTS:
`confirmed_booking_with_customer_owed_prerequisites`, authoritative. Required evidence: a confirmed booking with a scheduled time; at least one outstanding customer-owned prerequisite. Insufficient alone: an unconfirmed request; a provider-owned prerequisite.

DATA:
- `booking_id`, `occurrence_id` (required) — instance key; every action; one-reminder-per-occurrence dedupe
- `person_id` (required) — all messaging
- `scheduled_at` (required) — c.time, both waits' pre-start timing
- `timezone` (required) — pre-start window computation
- `location_or_joining_route` (required) — a.remind
- `prerequisites` (required) — a.prompt, c.critical, h.at-risk
- `provider_id` (required) — a.revalidate re-read
- `service_type`, `travel_required`, `has_active_session` (optional) — window sizing, in-session channel eligibility

SOURCE OF TRUTH:
- Booking still confirmed/at the recorded time/deliverable -> booking system of record, re-read at send time, never a stored copy
- Prerequisites outstanding right now -> prerequisite/checklist tracking system
- A critical prerequisite blocks the service -> service-definition/prerequisite policy
(No engagement-as-evidence violation — the guardrails explicitly forbid treating a reminder having been sent, or interaction with it, as preparation or attendance.)

CONFIG:
- `scheduling.pre_start_window` — the point before the scheduled time at which the booking is re-read and the reminder/at-risk notice is built; basis: expected user rhythm; not required (low-confidence, example-only default)
- `scheduling.reminder_touches` — cap of a prerequisite prompt plus one reminder; the at-risk notice sits outside the cap; basis: business policy

CHANNEL POLICY:
- `a.prompt` — eligible [email, in-app]; preferred when the message lists things to do over time or the person is in-product; urgency normal
- `a.at-risk` — eligible [sms, email]; preferred when same-day or a critical prerequisite is outstanding and sms permission is recorded (priority: service-critical, mandatory); urgency high
- `a.remind` — eligible [sms, email, in-app]; urgency normal

SUPPRESSION / PREEMPTION:
- Deduplicated by booking and occurrence against SCH-277 (confirmation) and SCH-180 (reschedule notice) for pressure-budget purposes only; the service pressure class never rations a reminder the person is owed.
- Sequential, not concurrent, with SCH-280: this journey always exits via a handoff before the appointment window even closes, and a no-show can only be recorded after that window closes by SCH-177 — by the time SCH-280 could open, this instance's handoff has already closed it.

HANDOFF:
- `h.at-risk` -> SCH-174. Carries: booking_id, occurrence_id, scheduled_at, missing_prerequisite, last_point_to_complete (explicit contract fields). Ownership transfer: yes. Suppresses source: yes.
- `h.prestart` -> SCH-177. Carries: booking_id, occurrence_id, scheduled_at, reminded_at, outstanding_prerequisites (explicit contract fields). Ownership transfer: yes. Suppresses source: yes (explicitly suppresses any further reminder for the occurrence).

OUTCOMES:
- Primary: `h.prestart` (reminded against a revalidated booking); `h.at-risk` (critical prerequisite named while still fixable)
- Secondary: prerequisites_completed
- Neutral: `x.superseded` (booking changed before the reminder was due)
- Diagnostic: complaint, reminder_sent_for_cancelled_booking, duplicate_reminder_per_occurrence

TEST CASES:
- happy-path: all prerequisites complete before pre-start -> a.revalidate, c.critical clean, a.remind, h.prestart
- alternate-branch: critical prerequisite still outstanding at pre-start -> a.at-risk (mandatory), h.at-risk to SCH-174
- timeout: w.prereq times out with prerequisites still open -> a.revalidate re-reads before acting
- late-event: booking cancelled moments before send -> a.revalidate's re-read catches it, x.superseded
- superseding-state: booking rescheduled mid-flow -> this instance superseded, the new occurrence starts its own
- duplicate-trigger: a second reminder attempt for an already-reminded occurrence -> suppressed by s.once

GAPS:
- P1 channel: `a.remind`'s "urgent" role reuses the corpus-wide criterion ("same-day OR a critical prerequisite outstanding"), but `a.remind` is only reached once `c.critical` has already ruled nothing critical is outstanding — the second half of that shared criterion can never be true for this specific action.
- P1 outcome: the true business outcome (`attendance_recorded`) is only observable through the handoff chain into SCH-177 — unless SCH-177 is instrumented to report attendance back, this journey's own success measurement will never resolve.
- P2 config: `scheduling.pre_start_window` reuses the same generic 24-72h example-only default for both the prerequisite-completion window and the reminder-send point, despite potentially needing different values per prerequisite/service type.

---

## SCH-277 — Booking Confirmation

READINESS: READY_WITH_MAPPING

WHY:
The confirm/re-offer/decline/lapse branching is complete and every guardrail (acknowledged is not confirmed, offered availability is re-evaluated fresh, nothing is described as "held" unless it actually is) is enforced in the graph. The main implementation gap is that `choice_deadline_at` is a required attribute the wait reads, but no node defines the policy that sets it.

INSTANCE:
Scope: the reservation request, the requester, and the resource and slot it names. Key: `booking_id`. Dedupe: reject-duplicate. Concurrency note: a retried submission is meant to be the same request, not a second claim on capacity — this only holds if the company's request-intake layer resolves an identical resubmission to the same `booking_id` rather than minting a new one; that idempotency is upstream of this journey.

EVENTS:
`reservation_request_recorded`, authoritative. Required evidence: a reservation request recorded against a named requester, resource and slot; a permitted contact point. Insufficient alone: availability being searched/displayed; a slot held inside a session never submitted.

DATA:
- `booking_id` — instance key; every action
- `requester_id` — a.received, a.confirm, a.reoffer, a.decline, a.lapse
- `resource_ref` — c.outcome revalidation
- `slot_ref` — a.confirm, a.reoffer
- `contact_point` — all messaging
- `choice_deadline_at` — w.choice timeout

SOURCE OF TRUTH:
- Capacity committed and a confirmed reservation exists -> booking/reservation system of record (owned by SCH-173's revalidation)
- What is currently available to re-offer -> booking/reservation system of record

CONFIG:
- `reservation_outcome.outcome` — the period the booking semantics allow a request to stay unresolved; basis: business policy; required
- `reservation_outcome.choice` — the deadline for choosing among re-offered slots; basis: business policy; required (attribute-bound to choice_deadline_at)
- `reservation_outcome.touches` — cap of an acknowledgement plus one outcome message; basis: business policy

CHANNEL POLICY:
- `a.received` — eligible [email, sms]; urgency normal
- `a.confirm` — eligible [email, sms]; urgency normal
- `a.reoffer` — eligible [email, sms]; preferred when the stated choice deadline lies inside the urgent horizon; urgency normal
- `a.decline` — eligible [email, sms]; urgency low
- `a.lapse` — eligible [email, sms]; urgency low

SUPPRESSION / PREEMPTION:
- Owned exclusively pre-commitment; once `x.confirmed` is reached this journey's job is done, and any later provider-side failure of that commitment belongs to SCH-180 — they never overlap on the same booking_id at the same time.

HANDOFF:
- `h.rebook` -> SCH-173. Carries: the original request and why it could not be met; the slot chosen and when offered. Ownership transfer: yes. Suppresses source: yes.

OUTCOMES:
- Primary: `x.confirmed` (committed and stated); `h.rebook` (requester chose a re-offered slot)
- Neutral: `x.declined` (no commitment made, requester informed); `x.lapsed` (request lapsed unresolved, nothing held)
- Diagnostic: complaint, message_after_success, unsubscribe

TEST CASES:
- happy-path: revalidation commits the capacity -> a.confirm restates the concrete slot, x.confirmed
- alternate-branch: requested slot gone, something near is bookable -> a.reoffer names current availability with a deadline, never the originally-shown set
- alternate-branch: requester declines every re-offered alternative -> x.declined
- timeout: w.outcome unresolved past its window -> a.lapse, x.lapsed
- timeout: w.choice passes its stated deadline unanswered -> x.lapsed
- duplicate-trigger: identical resubmission -> resolves to the same booking_id rather than opening a second instance

GAPS:
- P1 config: `choice_deadline_at` is a required attribute the wait reads, but no node or config defines the policy for how `a.reoffer` computes it — must be defined as its own named config before build.
- P2 instance: the reject-duplicate guarantee for a retried submission depends entirely on an upstream intake layer, which this journey has no mechanism of its own to verify.

---

## SCH-280 — No-Show Follow-Up

READINESS: READY_WITH_MAPPING

WHY:
The re-read-before-sending discipline, the explicit deferral of provider-side misses to SCH-180, and the single-offer-never-pursued policy are all fully specified and internally consistent. The main gap is that the retrospective judgment behind `c.provider` (could the provider have delivered, after the fact) has no system of record named distinct from the live provider-failure detection SCH-180 uses.

INSTANCE:
Scope: the single booking occurrence that did not take place. Key: `booking_id` + `occurrence_id`. Dedupe: reject-duplicate. Concurrency note: this says nothing about the person's history — a second miss on a recurring commitment is its own instance; there is no cross-occurrence penalty tracking here (that's the commitment's own policy, referenced but not owned).

EVENTS:
`no_show_recorded_against_booking`, authoritative. Required evidence: a no-show authoritatively recorded; the semantics it was judged under and the window that closed; policy naming rebooking rather than a fee. Insufficient alone: a window passed with no attendance event yet; a provider running late; a booking with no arrival semantics defined.

DATA:
- `booking_id`, `occurrence_id` (required) — instance key
- `person_id` (required) — messaging
- `scheduled_at`, `no_show_recorded_at` (required) — a.reread lag check
- `attendance_source` (required) — c.superseded
- `provider_status` (required) — c.provider
- `rebooking_availability` (required) — c.rebookable
- `rebooking_window`, `urgent_channel_permission`, `commitment_terms_ref` (optional)

SOURCE OF TRUTH:
- The booking genuinely did not happen -> booking/attendance system of record, re-read after recording lag
- Whether the provider/resource could have delivered -> a retrospective deliverability assessment (system not named)
- Whether anything can be rebooked -> capacity/inventory system

CONFIG:
- `no_show.rebooking_window` — how long the offer stands before closing; basis: business policy; not required (example-only default)
- `no_show.touches` — one follow-up per missed occurrence, an offer or an acknowledgement, never both; basis: business policy

CHANNEL POLICY:
- `a.offer` — eligible [email, sms]; preferred when the offer carries the rebooking route and should be kept; urgency normal
- `a.acknowledge` — single channel (email), no policy needed; urgency low

SUPPRESSION / PREEMPTION:
- `c.provider` explicitly defers a provider-side miss to `h.provider` -> SCH-180; SCH-280 never sends a follow-up in that case, resolving mutual ownership in the graph itself.
- Sequential with SCH-266: the no-show can only be recorded after SCH-177's start-window revalidation closes, which itself only runs after SCH-266 has handed off — SCH-266's instance is always closed before SCH-280 can open on the same occurrence, so the two are never concurrently live.

HANDOFF:
- `h.provider` -> SCH-180. Carries: the window that closed and what was already said; evidence delivery was not possible on our side. Ownership transfer: yes. Suppresses source: yes.

OUTCOMES:
- Primary: `x.rebooked`
- Secondary: rebooking_declined
- Neutral: `x.closed` (closed with no rebooking); `x.suppressed` (booking moved/cancelled/attended after all)
- Diagnostic: complaint, message_on_superseded_booking, penalty_language_used, support_contact_within_24h

TEST CASES:
- happy-path: genuine miss, provider ready, capacity exists -> a.offer, customer rebooks, x.rebooked
- alternate-branch: provider/resource could not have delivered -> h.provider to SCH-180
- alternate-branch: nothing to rebook onto -> a.acknowledge, x.closed
- late-event: cancellation/reschedule lands after no-show recorded but before send -> x.suppressed
- timeout: offer window passes unanswered -> x.closed, never repeated
- idempotency: a.reread executes twice on retry -> no duplicate side effects

GAPS:
- P1 source-of-truth: `c.provider`'s retrospective deliverability judgment has no system of record named distinct from SCH-180's live detection — if it's the same system this is fine, if a separate retrospective process its timing relative to `a.reread` is unspecified.
- P2 config: `no_show.rebooking_window`'s 7-14 day range is explicitly example-only.

---

## SCH-282 — Availability Search Abandonment

READINESS: READY_WITH_MAPPING

WHY:
The re-evaluate-before-offering discipline is strong — the behavioral trigger only opens the window, and the actual offer content is re-derived from authoritative inventory at send time. The explicit commerce-recovery exclusion group correctly resolves precedence against other promotional-recovery journeys. The journey is structurally self-contained (no handoffs — every exit is deliberately terminal, since the booking or waitlist mechanism is owned elsewhere). The main gap is that push-channel eligibility depends on data this journey's own attribute list never captures.

INSTANCE:
Scope: the availability question, the resource and window it asked about, and the absence of any reservation from it. Key: `person_id` + `availability_query_id`. Dedupe: reject-duplicate. Concurrency note: a second question about a different window is its own instance and never inherits the first one's offer.

EVENTS:
`availability_query_closed_without_reservation`, behavioral. Required evidence: an availability query recorded for a named person against a specific resource and window; no reservation or hold since. Insufficient alone: a query by somebody who already holds a booking for that window; a browse with no resource/window attached.

DATA:
- `person_id` — c.permitted, all messaging
- `availability_query_id` — instance key
- `resource_ref` — a.recheck, c.options
- `requested_window` — a.offer labelling
- `last_query_at` — w.settle timing
- `permission_position` — c.permitted

SOURCE OF TRUTH:
- Identified and reachable for an unprompted offer -> identity/consent management system
- What is genuinely bookable right now -> capacity/inventory system, re-read fresh at offer time (the behavioral trigger only opens the window; it never supplies offer content directly — no engagement-as-evidence violation)

CONFIG:
- `availability_searched.settle` — how long after the query an unprompted booking gets its own chance before an offer is sent; basis: business policy; required
- `availability_searched.waitlist` — validity of a waitlist offer; basis: business policy; required
- `availability_searched.respond` — validity of the offered window; basis: business policy; required
- `availability_searched.touches` — cap of messages per instance; basis: business policy

CHANNEL POLICY:
- `a.offer` — eligible [email, push]; urgency low (promotional)
- `a.waitlist` — eligible [email, push]; preferred when a valid token/app session exists; urgency low

SUPPRESSION / PREEMPTION:
- Competition group commerce-recovery: this journey ranks below process recovery and selection recovery, and alongside interest recovery, for the same person's promotional send slot; on loss it is suppressed entirely.

HANDOFF:
None. Every exit is deliberately terminal — `x.booked`/`x.waitlisted` represent success achieved through mechanisms owned elsewhere (an unprompted booking, or the waitlist mechanism itself), so no downstream ownership transfer is needed.

OUTCOMES:
- Primary: `x.booked` (booked unprompted); `x.waitlisted` (nothing reserved)
- Neutral: `x.no-route` (unreachable), `x.nothing` (nothing to offer), `x.lapsed` (offer not taken)
- Diagnostic: complaint, message_after_success, unsubscribe

TEST CASES:
- happy-path: a near window is genuinely bookable when re-checked -> a.offer labels it plainly, person books within w.respond
- alternate-branch: nothing fits but a waitlist exists -> a.waitlist, states it reserves nothing
- alternate-branch: nothing fits and no waitlist -> x.nothing, no message sent
- timeout: w.settle expires, window still open and unbooked -> a.recheck re-evaluates from scratch
- permission-loss: query cannot be attributed to a permitted contact point -> x.no-route
- duplicate-trigger: a second query with the same availability_query_id while open -> no second instance

GAPS:
- P1 data: the "low-friction" push role is only eligible with "a valid token or app session," but no field capturing token/session validity appears anywhere in this journey's attributes — push-channel selection has no data hook defined.

---

## SUB-163 — Renewal Reminder

READINESS: READY_WITH_MAPPING

WHY:
A well-formed router journey by design — reviewed at Gate 3 as ending only in handoffs (SUB-164 to execute, SUB-168 to schedule an end, DEC-181 for undefined terms, OWN-55 for an overrun review) so that every outcome has an explicit owner. It cleanly separates the required notice (a transactional obligation, never rationed) from the discretionary decision request. Its guardrail explicitly defers to RET-28 (cancellation in motion) and RET-24 (active risk state) so it never talks past an ongoing save or escalation — but it never names FIN-134 (payment recovery) the same way, which is the one real ambiguity worth resolving before build.

INSTANCE:
scope: the continuing relationship and the renewal cycle currently open on it
key: [relationship_id, renewal_cycle_id]
dedupe policy: reject-duplicate
concurrency note: One renewal cycle per term boundary; a relationship renewed eight times has eight cycles, each its own instance.

EVENTS:
canonical event: `renewal_decision_window_opens`
source type: authoritative
required evidence:
- a relationship whose term end is inside the renewal decision window its governing terms define
insufficient evidence:
- a renewal reminder having been sent, which is a communication and not a decision window opening

DATA:
- `relationship_id` — used by instance key
- `renewal_cycle_id` — used by instance key
- `term_end_at` — used by w.decision, w.review deadline computation
- `renewal_model` — used by c.model branch
- `notice_period` — used by c.notice; w.decision deadline
- `renewing_terms` — used by a.notice content
- `decision_holder` — used by a.request destination
- `blockers` (optional) — used by c.blockers
- `has_active_session` (optional) — used by channel selection
- `urgent_channel_permission` (optional) — used by urgent channel eligibility

SOURCE OF TRUTH:
- renewal terms and required notice period are defined (c.notice) → governing contract/terms system of record
- what the renewal model requires (c.model) → contract/subscription terms system of record
- the recorded decision itself (w.decision / c.decision) → authorised decision record, never assumed from a non-response (engagement is evidence-only, never the outcome)

CONFIG:
- `renewal.discretionary_touches` — only the decision request counts against the cap; the required notice does not (corpus default 1) (basis: business policy; has a default)
- `renewal.decision_deadline` — wait-for-decision window, bound to term_end_at minus the required notice period (basis: legal requirement, timing class: attribute-bound; has a default)
- `renewal.notice_deadline` — review-overrun escalation point, same attribute-bound calculation (basis: legal requirement, timing class: attribute-bound; has a default)

CHANNEL POLICY:
- **a.notice**: eligible [email, in-app]; preferred when email (persistent, kept) by default; in-app when the decision holder is active there; fallback [email]; urgency normal; requires permission: false; requires contactability: true
- **a.request**: eligible [email, in-app, sms, push]; preferred when persistent/in-session by default; sms/push only when the notice deadline is inside the urgent horizon and permission for service messages on that channel is recorded; fallback [email]; urgency high; requires permission: true; requires contactability: true

SUPPRESSION / PREEMPTION:
- A relationship with a cancellation already in motion, or with an active risk state, is not sent a routine renewal message — the lifecycle already owning the person takes precedence. (conflicts with: RET-28, RET-24)
- contact.competition places this journey in the relationship-continuity exclusion group at subscription scope, below a cancellation in motion and below an active risk state. (conflicts with: RET-28, RET-24)

HANDOFF:
- **h.undefined** → DEC-181 — carries: the relationship, its term end and what the terms do say; the explicit fact that nothing was invented; ownership transfer: true; suppresses source: false
- **h.escalate** → OWN-55 — carries: the relationship, its term end and what the review is waiting on; ownership transfer: true; suppresses source: false
- **h.execute** → SUB-164 — carries: the decision, the new term's dates and its terms; the fact the new term does not yet exist; ownership transfer: true; suppresses source: false
- **h.scheduled-end** → SUB-168 — carries: the effective end date and the relationship version decided against; that a later renewal/resubscription/plan change supersedes and must suppress this; ownership transfer: true; suppresses source: false

OUTCOMES:
- **Primary**: renewal_decision_recorded (businessOutcome)
- **Diagnostic (never primary/secondary)**: complaint; notice_missed; decision_assumed; support_contact_within_24h

TEST CASES:
- **happy-path**: given notice is required, terms are defined, no blockers, and the model requires an explicit decision → expect notice is sent, the decision is requested once, and a recorded decision routes to SUB-164 or SUB-168
- **alternate-branch**: given the notice period or renewing terms are not defined anywhere authoritative → expect handoff to DEC-181 with no notice period or price invented
- **alternate-branch**: given an outstanding blocker exists → expect the relationship stays active on its current term; RENEWAL_REVIEW is recorded and no decision is requested until it clears
- **timeout**: given no decision is recorded by term_end_at minus the notice period → expect the governing terms' own default outcome is applied and recorded as a default, never as an agreed decision
- **timeout**: given a review outlives the notice deadline → expect escalation to OWN-55 while the relationship stays on its current term
- **superseding-state**: given a cancellation is already in motion (RET-28) or an active risk state exists (RET-24) on the relationship → expect the routine renewal message is suppressed

GAPS:
- P1 (suppression): The guardrail explicitly excludes firing during a cancellation-in-motion (RET-28) or an active risk state (RET-24), but never names an open FIN-134 payment recovery the same way — a relationship with an unresolved payment failure can still receive a routine renewal notice/request, which risks the exact 'system not paying attention' failure mode the existing guardrail was written to prevent for the other two journeys.
- P1 (config): decision_holder resolution logic (who actually holds the decision — the individual, or an account admin/procurement role in a B2B relationship) is required data but its resolution rule is not specified.
- P2 (config): Notice period and renewing terms undefined-policy handling is already gracefully routed to DEC-181, which reduces this from a blocker to routine per-relationship-type mapping work.

---

---

## SUB-262 — Cancellation Confirmation

READINESS: READY_WITH_MAPPING

WHY:
A deliberately minimal, single-purpose journey: confirm the cancellation and its end date once, optionally remind before access ends, and hand off anything that outlives the relationship. It correctly has no business outcome of its own by design (reviewed at Gate 4 — 'the journey exists to make the end date unsurprising, not to win anyone back') and both touches carry no destination on purpose. The one real gap is that the threshold for 'a meaningful window before access ends' (c.window) that decides whether the second touch is even scheduled has no config key or definition anywhere in the graph.

INSTANCE:
scope: the cancelled relationship plus its effective end date
key: [relationship_id]
dedupe policy: reject-duplicate
concurrency note: The wind-down belongs to this cancellation; a second cancellation after a reactivation is a new instance with its own window, opened once the prior instance has closed (x.returned, x.ended or h.obligations).

EVENTS:
canonical event: `cancellation_confirmed`
source type: authoritative
required evidence:
- an authoritative cancellation recorded against the relationship
- an effective end date
insufficient evidence:
- a stated intention to cancel
- a failed payment
- a support conversation about leaving

DATA:
- `relationship_id` — used by instance key
- `cancellation_confirmed_at` — used by trigger evidence
- `effective_end_at` — used by w.window timing; a.confirm content, stated once and never moved
- `surviving_items` — used by a.ending content
- `outstanding_obligations` — used by c.obligations; h.obligations

SOURCE OF TRUTH:
- the cancellation was withdrawn before the end date (c.withdrawn) → subscription/relationship system of record (authoritative reactivation or withdrawal)
- anything outlives the relationship (c.obligations) → billing/fulfillment obligations system of record

CONFIG:
- `cancellation_wind.meaningful_window_threshold` — how far out the effective end date must be for a pre-end reminder (a.ending) to be worth scheduling at all (basis: business policy; required)
- `cancellation_wind.touches` — confirm plus one pre-end reminder (corpus default 2) (basis: business policy; has a default)

CHANNEL POLICY:
- **a.confirm**: eligible [email, in-app]; preferred when email (persistent) by default; in-app when the person is active in the product; fallback [email]; urgency normal; requires permission: false; requires contactability: true
- **a.ending**: eligible [email, in-app]; preferred when same rule as a.confirm; fallback [email]; urgency normal; requires permission: false; requires contactability: true

SUPPRESSION / PREEMPTION:
- distinctFrom RET-28: RET-28 runs before the decision and may offer an alternative; this starts once cancellation is confirmed and never re-litigates it. (conflicts with: RET-28)

HANDOFF:
- **h.obligations** → SUB-170 — carries: the end date and what was already communicated about it; which obligations survive and who owns each; ownership transfer: true; suppresses source: false

OUTCOMES:
- **Neutral**: x.ended (ended with nothing outstanding); x.returned (cancellation withdrawn, relationship continues)
- **Diagnostic (never primary/secondary)**: complaint; message_after_success; unsubscribe

TEST CASES:
- **happy-path**: given cancellation confirmed with a meaningful window before the effective end date and nothing outstanding → expect a.confirm sends immediately; a.ending sends near the end date; x.ended exit with nothing outstanding
- **alternate-branch**: given access ends immediately or too soon for a further message to arrive in time → expect a.confirm sends, then straight to c.obligations without waiting for a.ending
- **alternate-branch**: given the cancellation is withdrawn (reactivation) before the effective end date → expect immediate exit to x.returned; the a.ending reminder is never sent to someone who has just stayed
- **alternate-branch**: given obligations survive the end date (an outstanding balance, a return, a retention period) → expect handoff to SUB-170 naming which obligations survive and who owns each
- **idempotency**: given a.confirm or a.ending is retried after a delivery retry → expect each sends at most once per relationship_id (idempotencyKey relationship_id+a.confirm / a.ending)

GAPS:
- P1 (config): The threshold that decides whether the effective end date is 'far enough out that a reminder before it would still be useful' (c.window) has no config key, default, or example anywhere in the graph — teams must invent this from scratch.
- P2 (outcome): x.returned is classed 'invalid-state' in the graph despite being a legitimate, successful withdrawal outcome (the customer stayed) — the label reads as an error state to an implementer and is worth relabeling for clarity, though it does not change behavior.

---

---

## TIM-61 — Deadline Tracking

READINESS: READY_WITH_MAPPING

WHY:
The graph is a complete state machine: store the deadline with its completion condition, wait bound to due_at, branch on threshold vs completion, and a five-way consequence branch (overdue/escalate/expire/fail/still-valid) that correctly treats 'deadline passed' as a neutral event unless the governing rule says otherwise. Nothing is missing structurally; a CRM/lifecycle team mainly needs to map governing_rule, thresholds and consequence_on_miss to a real policy source and wire the three handoffs to their obligation-owning systems.

INSTANCE:
- scope: the obligation the deadline is attached to (task, request, case, or application)
- key: [obligation_id]
- dedupePolicy: reject-duplicate
- concurrency: Two obligations sharing a date are two separate deadline instances; one being met says nothing about the other.

EVENTS:
- canonicalEvent: authoritative_deadline_assigned
- sourceType: authoritative
- requiredEvidence: a deadline assigned to a specific obligation by a system or rule entitled to set one
- insufficientEvidence: a reminder date configured in a messaging tool, which schedules communication rather than governing an obligation; an internal target with no consequence attached to missing it

DATA:
- obligation_id (required) — used by: instance key, every write and idempotency key
- due_at (required) — used by: w.tracking timeout basis (attribute-bound)
- governing_rule (required) — used by: c.consequence — decides overdue/escalate/expire/fail/still-valid
- thresholds (required) — used by: c.what / c.useful — which pre-deadline points trigger a.remind
- consequence_on_miss (required) — used by: c.consequence branch selection
- deadline_log (required) — used by: a.store / a.satisfied — durable record of the obligation's deadline history

SOURCE OF TRUTH:
- the obligation is satisfied -> the system of record that owns the obligation (task/case/application system) [engagementIsEvidenceOnly: true]
- what the governing rule says happens at the deadline (overdue/escalate/expire/fail/still-valid) -> policy or rules engine that issued the deadline

CONFIG:
- deadline_tracking.touches: one reminder per pre-deadline threshold the governing policy defines (basis: business policy, required: true)
- deadline_tracking.remind_budget: attempt budget bounding the reminder loop before it takes the timeout path (basis: operational SLA, required: true)
- deadline_tracking.tracking: wait bound directly to due_at — not a discretionary interval (basis: business policy, timingClass: attribute-bound, required: true)

CHANNEL POLICY:
- a.remind: eligible [email, push, sms, whatsapp]; preferredWhen: persistent(email) as default; low-friction(push) when a valid session/token exists; urgent(sms/whatsapp) when the threshold falls inside an urgent horizon and channel permission is recorded; fallback: same-role-other-channel; urgency: normal; requiresPermission: true; requiresContactability: true

SUPPRESSION / PREEMPTION:
none identified

HANDOFF:
- h.overdue -> TIM-62; requiredContext: the obligation and its original deadline history; the owner it was assigned to; ownershipTransfer: true; suppressSource: false
- h.escalate -> OWN-55; requiredContext: the obligation, its deadline and how long it has been open; ownershipTransfer: true; suppressSource: false
- h.expired -> TIM-64; requiredContext: the obligation and the validity period now ending; ownershipTransfer: true; suppressSource: false

OUTCOMES:
- primary: obligation_satisfied
- secondary: none
- neutral: deadline passed, obligation unchanged (x.still-valid)
- failure: obligation failed at its deadline as the rule defines (x.failed)
- diagnostic: reminder sent (a.remind); complaint; message_after_success; unsubscribe

TEST CASES:
- happy-path: a deadline is stored with a completion condition and thresholds; the obligation is satisfied before due_at -> x.satisfied fires and all queued reminders/escalations are suppressed
- timeout: due_at passes with the obligation still open -> c.consequence runs against governing_rule and routes to exactly one of h.overdue / h.escalate / h.expired / x.failed / x.still-valid
- duplicate-trigger: a second authoritative_deadline_assigned event arrives for an obligation that already has an open instance -> the new trigger is rejected per eligibility; the existing instance is unaffected
- late-event: obligation_satisfied is recorded after the tracking wait has already timed out and consequence processing began -> the recheck re-reads the obligation from the system of record before acting, so a.satisfied wins over a stale consequence path
- idempotency: the same threshold reminder is retried due to a delivery-layer retry -> the idempotencyKey (obligation_id + issue_id + a.remind) prevents a duplicate reminder for the same threshold

GAPS:
- P1 channel: The 'urgent' channel role (sms/whatsapp) is gated by 'an asserted time bound lies inside the urgent horizon' but no config attribute names that horizon — implementers must invent this threshold with no canonical guidance beyond the role's existence.

---

## TIM-63 — Expiry Reminder

READINESS: READY_WITH_MAPPING

WHY:
The graph explicitly guards the two failure modes this pattern usually has in production: it re-reads state after the window opens (c.already) before ever prompting, and it distinguishes 'nothing can be done' (informational, no CTA) from 'an action would change the outcome' (prompt). Both waits are attribute-bound to expires_at, and windowExtendsOnEngagement is false everywhere, so opens/clicks cannot silently extend the deadline. Company work is mapping entity types to responsible_actor resolution and the renewal-lifecycle handoff contract.

INSTANCE:
- scope: the time-bound entity approaching expiry (subscription, document, entitlement, credential, approval, reservation, benefit, agreement)
- key: [entity_ref, validity_id]
- dedupePolicy: reject-duplicate
- concurrency: A person holding three expiring credentials has three windows; a renewal closes only its own validity_id.

EVENTS:
- canonicalEvent: pre_expiry_window_entered
- sourceType: authoritative
- requiredEvidence: a time-bound entity entering a pre-expiry window whose length reflects how long acting on it actually takes
- insufficientEvidence: a fixed interval applied to every entity type regardless of what renewal involves

DATA:
- entity_ref (required) — used by: instance key
- validity_id (required) — used by: instance key, idempotency keys, invalidation of stale queue on renewal
- expires_at (required) — used by: w.resolution timeout basis
- entity_type (required) — used by: c.action — whether renewal/completion/replacement is possible
- responsible_actor (required) — used by: a.actor / a.prompt-action destination
- available_action (required) — used by: a.prompt-action content
- has_active_session (optional) — used by: channel role selection (in-session)
- urgent_channel_permission (optional) — used by: channel role selection (urgent)

SOURCE OF TRUTH:
- the entity is still expiring (not renewed/replaced/completed) -> the system of record for the entity's lifecycle, re-read at a.reread [engagementIsEvidenceOnly: true]
- an action is available that would materially change the outcome -> the entity type's governing product/policy configuration

CONFIG:
- expiry.touches: one pre-expiry message per validity — a prompt or an informational notice, never both (basis: business policy, required: false)
- expiry.expiry_moment: wait bound directly to expires_at as the system of record asserts it (basis: business policy, timingClass: attribute-bound, required: false)

CHANNEL POLICY:
- a.prompt-action: eligible [email, in-app, sms, push]; preferredWhen: persistent(email) default; in-session(in-app) when the actor is active in-product; urgent(sms/push) when expiry is inside the urgent horizon and a single-step action exists with recorded permission; fallback: same-role-other-channel; urgency: high; requiresPermission: true; requiresContactability: true
- a.inform: eligible [email]; preferredWhen: always — informational notices carry no call to action so only the persistent role applies; fallback: same-role-other-channel; urgency: low; requiresPermission: false; requiresContactability: true

SUPPRESSION / PREEMPTION:
none identified

HANDOFF:
- h.resolved -> external:renewal-lifecycle; requiredContext: the entity and its new validity period; the old expiry, now invalidated; ownershipTransfer: true; suppressSource: true
- h.expiry -> TIM-64; requiredContext: the entity and what was attempted during the window; ownershipTransfer: true; suppressSource: false

OUTCOMES:
- primary: renewed
- secondary: completion_recorded; replaced
- neutral: expiring, nothing to do and nothing worth saying (x.silent); already resolved before the window mattered (x.suppressed)
- failure: none
- diagnostic: complaint; prompt_with_no_action; message_after_resolution; support_contact_within_24h

TEST CASES:
- happy-path: an entity enters its pre-expiry window still expiring, with an available action -> a.prompt-action fires naming the actor, the action and the boundary; resolution before expiry triggers h.resolved
- alternate-branch: nothing can be done but the holder needs to plan around the lapse -> c.informational routes to a.inform with no call to action attached
- late-event: the window opened on schedule but the entity was renewed the day before -> a.reread + c.already catches this and routes to x.suppressed instead of sending a stale prompt
- timeout: no resolution event arrives before expires_at -> w.resolution times out to h.expiry, handing off to TIM-64 rather than re-asserting the expiry itself
- idempotency: delivery-layer retry of the prompt -> idempotencyKey (validity_id + touch id) prevents a duplicate send

GAPS:
- P1 channel: The urgent role's activation threshold ('inside the urgent horizon') is referenced but has no named config attribute alongside expiry.touches / expiry.expiry_moment — a company must invent this without canonical guidance.
- P1 data: responsible_actor resolution (a.actor) has no defined algorithm — who is authorized to act on a given entity_type is left entirely to company mapping, and getting it wrong sends a call-to-action to someone who cannot act, which the guardrails explicitly warn against.

---

## TIM-268 — Action Required Reminder

READINESS: READY_WITH_MAPPING

WHY:
The graph enforces its own hardest rule mechanically: a.recheck re-reads the obligation from the system of record immediately before every send, so a settled obligation cannot receive a reminder built from stale state. The overdue path correctly treats 'no consequence defined' as a legitimate no-further-action exit rather than inventing one. Implementation work is mostly wiring discharge_route and consequence_policy to the company's real billing/task system and the external consequence-owner handoff.

INSTANCE:
- scope: the outstanding obligation, its owner and its due date
- key: [obligation_id]
- dedupePolicy: reject-duplicate
- concurrency: Two obligations owed by the same person are two instances; this journey never merges them.

EVENTS:
- canonicalEvent: customer_owed_obligation_outstanding
- sourceType: authoritative
- requiredEvidence: an authoritative record that a defined action is owed by a named person; a due date recorded against it
- insufficientEvidence: an internal expectation with no due date; a reminder schedule that fired before the obligation was confirmed outstanding

DATA:
- obligation_id (required) — used by: instance key, all idempotency keys
- person_id (required) — used by: a.remind / a.confirm / a.overdue destination
- due_at (required) — used by: w.due and w.deadline timeout basis
- what_is_owed (required) — used by: a.remind content — named as what remains, not what it started as
- discharge_route (required) — used by: a.remind destination
- consequence_policy (required) — used by: c.escalate — whether h.consequence applies

SOURCE OF TRUTH:
- what is still owed at the moment of sending -> the authoritative record that owns the obligation (per distinctFrom, FIN-131 holds this state independently) [engagementIsEvidenceOnly: true]
- whether a defined consequence applies past the deadline -> the consequence-owning policy/system

CONFIG:
- outstanding_obligation.touches: touch budget fixed at instance open; no touch repeats because nothing confirms arrival (basis: operational SLA, required: false)
- outstanding_obligation.due: reminder point before due_at (basis: business policy, timingClass: reminder-before-attribute, required: true)
- outstanding_obligation.deadline: wait from reminder to due_at itself (basis: business policy, timingClass: attribute-bound, required: true)

CHANNEL POLICY:
- a.remind: eligible [email, sms]; preferredWhen: persistent(email) default; urgent(sms) when the deadline is inside the urgent horizon and channel permission is recorded; fallback: same-role-other-channel; urgency: normal; requiresPermission: true; requiresContactability: true
- a.confirm: eligible [email, sms]; preferredWhen: same role logic as a.remind — persistent default, urgent when in-window and permitted; fallback: same-role-other-channel; urgency: low; requiresPermission: true; requiresContactability: true
- a.overdue: eligible [email, sms]; preferredWhen: same role logic as a.remind; fallback: same-role-other-channel; urgency: high; requiresPermission: true; requiresContactability: true

SUPPRESSION / PREEMPTION:
none identified

HANDOFF:
- h.consequence -> external:consequence-owner; requiredContext: what remains outstanding, its due date and its history; which reminders were sent, when, and what they stated; ownershipTransfer: true; suppressSource: false

OUTCOMES:
- primary: obligation_satisfied
- secondary: none
- neutral: no longer owed; nothing was sent (x.moot)
- failure: lapsed unmet with no further consequence defined (x.lapsed)
- diagnostic: complaint; message_after_success; unsubscribe

TEST CASES:
- happy-path: reminder sent while outstanding, deadline reached with the obligation satisfied -> c.settled routes to a.confirm and x.satisfied
- late-event: the obligation is settled between the reminder point and the actual due date -> w.deadline's onEvent path (c.settled) catches the satisfaction and routes to a.confirm rather than waiting for the timeout
- alternate-branch: the reminder point is reached but a.recheck finds nothing outstanding -> c.outstanding routes to x.moot with no message sent
- timeout: due_at passes with something still owed -> w.deadline times out to a.overdue, then c.escalate decides between h.consequence and x.lapsed based on whether policy defines a consequence
- idempotency: a.overdue is triggered twice due to a retry -> idempotencyKey (obligation_id + a.overdue) prevents a second overdue notice, honoring the 'one notice after the deadline' guardrail

GAPS:
- P1 channel: As with TIM-61/63, the 'urgent' sms role's activation threshold is undefined as a named config, leaving channel escalation timing to ad hoc implementation.

---

## TIM-274 — Grace Period Recovery

READINESS: READY_WITH_MAPPING

WHY:
The graph is internally disciplined about the one thing grace-period messaging usually gets wrong: it never announces grace before TIM-65 authoritatively records it, and the window never extends on engagement (guardrail s.g4 is enforced structurally, not just stated). Both waits are attribute-bound to grace_deadline_at. The company work is mapping recovery_condition/restricted_capabilities to real product state and wiring the two mutually-exclusive first notices (restricted vs quiet).

INSTANCE:
- scope: the entity whose primary validity ended, plus the fixed end of the grace period placed on it
- key: [entity_ref, grace_period_id]
- dedupePolicy: reject-duplicate
- concurrency: A second lapse after a recovery is its own instance with its own window; a window never inherits time from the one before it.

EVENTS:
- canonicalEvent: grace_period_started
- sourceType: authoritative
- requiredEvidence: an authoritative grace state recorded against the entity after its primary validity ended; a fixed end date for that grace period; a recorded condition that would recover the active state
- insufficientEvidence: a validity date that is merely approaching; a failed renewal attempt with no grace policy applied to it

DATA:
- entity_ref (required) — used by: instance key
- grace_period_id (required) — used by: instance key
- grace_deadline_at (required) — used by: w.grace and w.final timeout basis
- recovery_condition (required) — used by: c.outcome — what counts as recovered
- restricted_capabilities (required) — used by: c.restricted branch and a.notify-restricted content
- holder_id (required) — used by: message destination

SOURCE OF TRUTH:
- the grace state and its capabilities/deadline exist and are current -> TIM-65 (the journey that grants grace and decides what closes the window), per distinctFrom [engagementIsEvidenceOnly: true]
- recovery_condition_satisfied -> the entity's system of record [engagementIsEvidenceOnly: true]

CONFIG:
- grace_period.touches: touch budget fixed at instance open — notice, last call, confirmation/loss (basis: operational SLA, required: false)
- grace_period.grace: the last point inside the window at which one further message can still be acted on (basis: business policy, timingClass: reminder-before-attribute, required: true)
- grace_period.final: wait from last call to grace_deadline_at itself (basis: business policy, timingClass: attribute-bound, required: true)

CHANNEL POLICY:
- a.notify-restricted: eligible [email, sms]; preferredWhen: persistent default; urgent(sms) inside the urgent horizon with recorded permission; fallback: same-role-other-channel; urgency: normal; requiresPermission: true; requiresContactability: true
- a.notify-quiet: eligible [email, sms]; preferredWhen: same role logic as a.notify-restricted; fallback: same-role-other-channel; urgency: low; requiresPermission: true; requiresContactability: true
- a.confirm: eligible [email, sms]; preferredWhen: same role logic; fallback: same-role-other-channel; urgency: low; requiresPermission: true; requiresContactability: true
- a.last-call: eligible [email, sms]; preferredWhen: same role logic; this is the single reminder before the window closes; fallback: same-role-other-channel; urgency: high; requiresPermission: true; requiresContactability: true
- a.lost: eligible [email, sms]; preferredWhen: same role logic; fallback: same-role-other-channel; urgency: normal; requiresPermission: true; requiresContactability: true

SUPPRESSION / PREEMPTION:
none identified

HANDOFF:
none — this journey has no handoffs; every path resolves to an exit within its own graph.

OUTCOMES:
- primary: recovery_condition_satisfied
- secondary: none
- neutral: grace ended by termination before its window closed (x.moot)
- failure: window closed unrecovered (x.lost)
- diagnostic: complaint; message_after_success; unsubscribe

TEST CASES:
- happy-path: grace starts with restricted capabilities; holder recovers before grace_deadline_at -> c.outcome routes to a.confirm and x.recovered, naming which capabilities returned
- alternate-branch: grace restricts nothing the holder would notice -> c.restricted routes to a.notify-quiet instead of a.notify-restricted
- timeout: no recovery event by the grace.grace reminder point -> w.grace times out to a.last-call, the single pre-close reminder
- superseding-state: the entity is terminated or withdrawn while still inside the grace window -> c.outcome routes to x.moot rather than treating it as a loss
- idempotency: a.last-call retried by delivery infrastructure -> idempotencyKey (person_id + a.last-call) prevents sending the one allowed last call twice

GAPS:
- P1 channel: The urgent sms role again depends on an unformalized 'urgent horizon' threshold, consistent with the TIM-61/63/268 pattern in this corpus.

---

## TIM-281 — Expired Access Recovery

READINESS: READY_WITH_MAPPING

WHY:
The four-way route condition (renewal / requalification / replacement only / no route back) is exhaustive and each arm carries an explicit 'must not claim' constraint preventing the single most damaging mistake in this pattern — telling someone their expired thing can simply be renewed when it cannot. The response window (w.act) is correctly relative to the previous touch, not to expiry, since the route was just offered. Implementation work is mapping restoring_mechanism resolution (a.establish) to real product/policy logic.

INSTANCE:
- scope: the expired entity and the holder's attempt to act on it, kept distinct from any replacement issued
- key: [entity_ref, attempt_id]
- dedupePolicy: reject-duplicate
- concurrency: attempt_id disambiguates repeat attempts by the same holder on the same entity — a further attempt after x.still-expired or x.terminal starts a fresh instance rather than reopening the old one.

EVENTS:
- canonicalEvent: holder_acted_on_expired_entity
- sourceType: behavioral
- requiredEvidence: an authoritative expiry recorded against the entity; an attempt by the holder to use, renew or ask about it after that expiry; the holder being the party the entity belonged to
- insufficientEvidence: an expiry with no attempt against it; a scheduled win-back date with no action from the holder

DATA:
- entity_ref (required) — used by: instance key
- attempt_id (required) — used by: instance key
- holder_id (required) — used by: authority check (the holder being the party the entity belonged to)
- expired_at (required) — used by: a.establish — what the expiry actually did to the entity
- restoring_mechanism (required) — used by: c.route — renewal / requalification / replacement / no route
- replacement_ref (required) — used by: a.replace / a.confirm — keeping the replacement separately addressable from the expired original

SOURCE OF TRUTH:
- what the expiry did to this entity (suspended / invalidated / relationship ended) -> the entity's governing lifecycle system, per TIM-69's distinctFrom
- validity_restored -> the system of record for the entity or its replacement [engagementIsEvidenceOnly: true]

CONFIG:
- expired_entity.touches: touch budget — one route statement, one confirmation (basis: operational SLA, required: false)
- expired_entity.act: bounded response window from the moment the route was named, not from expiry (basis: business policy, timingClass: response-window, required: true)

CHANNEL POLICY:
- a.renew: eligible [email, in-app]; preferredWhen: persistent default; in-session when the holder is active in-product and the action is taken there; fallback: same-role-other-channel; urgency: normal; requiresPermission: false; requiresContactability: true
- a.requalify: eligible [email, in-app]; preferredWhen: same role logic as a.renew; fallback: same-role-other-channel; urgency: normal; requiresPermission: false; requiresContactability: true
- a.replace: eligible [email, in-app]; preferredWhen: same role logic; fallback: same-role-other-channel; urgency: normal; requiresPermission: false; requiresContactability: true
- a.no-route: eligible [email, in-app]; preferredWhen: same role logic; fallback: same-role-other-channel; urgency: low; requiresPermission: false; requiresContactability: true
- a.confirm: eligible [email, in-app]; preferredWhen: same role logic; fallback: same-role-other-channel; urgency: low; requiresPermission: false; requiresContactability: true

SUPPRESSION / PREEMPTION:
none identified

HANDOFF:
none — this journey has no handoffs; every path resolves to an exit within its own graph.

OUTCOMES:
- primary: validity_restored
- secondary: none
- neutral: none
- failure: still expired; route offered and not taken (x.still-expired); expired with no route back (x.terminal)
- diagnostic: complaint; message_after_success; unsubscribe

TEST CASES:
- happy-path: holder attempts to use an expired entity that can be renewed -> c.route selects a.renew; on completion within w.act, a.confirm fires and x.restored closes the instance
- alternate-branch: the entity's basis for validity has gone entirely -> c.route selects a.no-route, a terminal exit (x.terminal) with no further re-entry for this entity
- timeout: the named route is offered but the holder does not complete it inside the response window -> w.act times out to x.still-expired, and a later attempt starts a brand-new instance with the route re-evaluated
- human-ownership: requalification requires evidence review rather than a simple click -> a.requalify explicitly states this is not a renewal, avoiding the false expectation the guardrails call out
- idempotency: a.confirm retried by a delivery-layer resend -> idempotencyKey (issue_id + person_id + a.confirm) prevents a duplicate confirmation

GAPS:
- P2 handoff: No handoffs exist in this journey — every path terminates in an exit. This is structurally intentional (TIM-69 owns the restoration mechanism decision itself) but a company implementing this in a CRM should still wire x.terminal and a.replace's replacement_ref into whatever system tracks entitlement lineage, since nothing in this graph does that automatically.

---

## TRM-106 — Account Closure

READINESS: READY_WITH_MAPPING

WHY:
The graph rigorously enforces the three separations its guardrails promise: closure is checked for authority before anything happens, blockers are named specifically rather than left as an unexplained refusal, and execution (a.execute) explicitly touches nothing beyond the account relationship — no subscription cancellation, no data deletion, no audit erasure. a.verify confirming the closure actually took effect before a.confirm-closure fires is a real safeguard against a silent partial closure. Implementation work is mapping blocker detection (financial obligation, open transaction, security review, etc.) to the company's real account/billing systems.

INSTANCE:
- scope: the account and this closure request
- key: [account_id, closure_request_id]
- dedupePolicy: reject-duplicate
- concurrency: A request from an authorised party after an unauthorised one is assessed fresh on its own terms.

EVENTS:
- canonicalEvent: account_closure_requested
- sourceType: authoritative
- requiredEvidence: a closure request against an identified account
- insufficientEvidence: a cancelled subscription, which ends a commercial relationship rather than the account; a data deletion request, which is a different lifecycle with a different authority; a long period of inactivity

DATA:
- account_id (required) — used by: instance key
- closure_request_id (required) — used by: instance key
- requester (required) — used by: c.authority
- requester_authority (required) — used by: c.authority — owns the account or holds the closing role
- blockers (required) — used by: c.blockers branch selection
- closure_log (required) — used by: every action's audit trail

SOURCE OF TRUTH:
- the requester's authority to close the account -> the account/identity system's role and ownership records
- open blockers and dependent relationships -> the account, billing, and dependency systems collectively
- the account no longer permits prohibited operations (c.verified) -> post-execution verification against the account platform itself [engagementIsEvidenceOnly: true]

CONFIG:
- account_closure.touches: every touch in this plan is the closure process itself and mandatory; nothing discretionary exists to cap (basis: business policy, required: false)
- account_closure.blockers: the closure request's own validity window while a recoverable blocker is outstanding (basis: operational SLA, timingClass: observation-window, required: true)

CHANNEL POLICY:
- a.notify-unauthorized: eligible [email, in-app]; preferredWhen: persistent(email) default; in-session(in-app) when active in product; fallback: same-role-other-channel; urgency: normal; requiresPermission: false; requiresContactability: true
- a.notify-cannot-close: eligible [email, in-app]; preferredWhen: same role logic; fallback: same-role-other-channel; urgency: normal; requiresPermission: false; requiresContactability: true
- a.surface: eligible [email, in-app]; preferredWhen: same role logic; names the exact recoverable blocker; fallback: same-role-other-channel; urgency: normal; requiresPermission: false; requiresContactability: true
- a.confirm-closure: eligible [email, in-app]; preferredWhen: same role logic; sent only after closure is verified, never on the request; fallback: same-role-other-channel; urgency: low; requiresPermission: false; requiresContactability: true

SUPPRESSION / PREEMPTION:
none identified

HANDOFF:
- h.dependencies -> TRM-107; requiredContext: the closed account and the dependent relationships identified at request time; the explicit fact that no external or commercial dependency has been terminated by this; ownershipTransfer: true; suppressSource: false
- h.escalate -> OWN-55; requiredContext: where the account remains active; the closure request and its authority; ownershipTransfer: true; suppressSource: false

OUTCOMES:
- primary: none
- secondary: none
- neutral: closure request lapsed with blockers outstanding (x.lapsed)
- failure: closure not requested by an authorised party (x.unauthorized); one blocker cleared, others remain (x.still-blocked); closure not permitted (x.cannot-close)
- diagnostic: complaint; message_after_success; unsubscribe

TEST CASES:
- happy-path: an authorised requester with no blockers -> c.blockers routes to a.execute, a.verify confirms the account no longer permits prohibited operations, and a.confirm-closure fires stating what closure is not (subscription cancellation, data deletion)
- alternate-branch: a recoverable blocker (open transaction, required return) exists -> a.surface names it specifically and w.blockers waits for closure_blocker_resolved before rechecking for further blockers
- permission-loss: the requester does not hold closing authority -> c.authority routes to a.notify-unauthorized without disclosing account state they are not entitled to
- timeout: the closure request's validity window elapses with the blocker still outstanding -> w.blockers times out to x.lapsed rather than either closing or silently denying
- idempotency: a.execute retried after a partial platform failure -> idempotencyKey (account_id + a.execute) combined with the a.verify re-check (routing to h.escalate if not fully applied) prevents reporting a closure that did not actually take effect

GAPS:
- none

---

## TRM-275 — Data Deletion Confirmation

READINESS: READY_WITH_MAPPING

WHY:
This is a compliance-grade journey and reads like one: nothing is deleted on an unverified request, verification asks for exactly the proof of control the obligation requires and no more (directly preventing the standard anti-pattern of collecting extra PII to honour an erasure request), and the response window is explicitly the obligation's window, not the team's throughput. The closing message is deliberately built as a durable record (scope, outcome, obligation, date) rather than a pleasantry. Implementation work is mapping governing_obligation and control_established to the company's real legal/compliance framework.

INSTANCE:
- scope: the data subject and the single deletion request they raised, bounded by the scope that request names
- key: [deletion_request_id]
- dedupePolicy: reject-duplicate
- concurrency: A later request from the same person is a separate instance and inherits neither this one's verification nor its window.

EVENTS:
- canonicalEvent: data_deletion_requested_by_subject
- sourceType: declared
- requiredEvidence: a deletion request recorded against a named data subject; the scope the request itself names; the response window the governing obligation sets
- insufficientEvidence: a closure of the relationship; a request to stop receiving messages; a support conversation that mentions deletion

DATA:
- deletion_request_id (required) — used by: instance key
- data_subject_id (required) — used by: message destination
- requested_scope (required) — used by: a.closed-full / a.closed-partial content
- response_deadline_at (required) — used by: w.decision timeout basis
- governing_obligation (required) — used by: a.closed-partial — which obligation requires retention
- control_established (required) — used by: c.verified branch selection

SOURCE OF TRUTH:
- requester's control of the named scope (verification standard) -> the governing legal/compliance obligation's own evidentiary standard
- deletion_resolved (full or partial), executed by TRM-109 -> TRM-109 (decides what the request covers, what must be retained, and executes removal), per distinctFrom

CONFIG:
- deletion_request.touches: every touch in this plan is the request's own record and is mandatory; nothing discretionary exists to cap (basis: legal requirement, required: false)
- deletion_request.verify: verification period held inside the mandated response window (basis: legal requirement, timingClass: response-window, required: true)
- deletion_request.decision: resolution waited for until the obligation's response deadline; unanswered escalates (basis: legal requirement, timingClass: attribute-bound, required: true)

CHANNEL POLICY:
- a.acknowledge: eligible [email]; preferredWhen: single channel — persistent(email); fallback: same-role-other-channel; urgency: normal; requiresPermission: false; requiresContactability: true
- a.verify: eligible [email]; preferredWhen: single channel — same as a.acknowledge; asks for exactly the proof of control required; fallback: same-role-other-channel; urgency: normal; requiresPermission: false; requiresContactability: true
- a.unverified: eligible [email]; preferredWhen: single channel; fallback: same-role-other-channel; urgency: normal; requiresPermission: false; requiresContactability: true
- a.closed-full: eligible [email]; preferredWhen: single channel; the durable record of outcome; fallback: same-role-other-channel; urgency: normal; requiresPermission: false; requiresContactability: true
- a.closed-partial: eligible [email]; preferredWhen: single channel; names retention and its obligation; fallback: same-role-other-channel; urgency: normal; requiresPermission: false; requiresContactability: true

SUPPRESSION / PREEMPTION:
none identified

HANDOFF:
- h.overdue -> external:data-protection-escalation; requiredContext: the request, its scope, its window and what the requester has already been told; which part of the scope remains unresolved and who holds it; ownershipTransfer: true; suppressSource: false

OUTCOMES:
- primary: deletion_resolved
- secondary: none
- neutral: none
- failure: closed unverified, nothing deleted (x.unverified)
- diagnostic: complaint; message_after_success; unsubscribe

TEST CASES:
- happy-path: control is already established at intake and everything in the named scope is deletable -> c.verified skips straight to w.decision; c.outcome routes to a.closed-full, which records scope, outcome and date
- alternate-branch: part of the named scope is covered by a retention obligation -> c.outcome routes to a.closed-partial, naming what is retained, under which obligation, and when that obligation ends
- contactability-loss: control cannot be established inside the verification period -> w.verify times out to a.unverified, which closes plainly stating nothing was deleted and that a fresh request can be raised anytime
- timeout: the mandated response window elapses with no authoritative outcome to state -> w.decision times out to h.overdue, escalating to data-protection ownership rather than answering in silence
- idempotency: a.acknowledge retried by delivery infrastructure -> idempotencyKey (person_id + a.acknowledge) prevents a duplicate acknowledgement

GAPS:
- none