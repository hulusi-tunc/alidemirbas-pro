# Canonical Journey Library — Production Readiness & Implementation Audit

Audit date: 2026-09-01 · Corpus at commit `2410fb3` · Auditor: Claude (this session) · Scope: the canonical source, not the website

**Standard applied.** Could a CRM/lifecycle team take one journey, map its own events, attributes, consent and channels into it, supply a small number of configuration values, and implement it in Braze / Iterable / Customer.io / SFMC / AJO / HubSpot — *without inventing the journey itself?*

**Method in one paragraph.** The corpus is 281 hand-authored TypeScript journeys in `src/canonical/*.ts` (there are no journey `.md` files; every "production/journey-*.json" artefact is a derived render/SEO model with, by its own docstring, "no new semantic content"). Every journey was scored 0–5 on the 18 requested dimensions by a rule-based scorer (`score.mjs`, reproducible) that reads the graph itself — wait timeouts, branch tests, channel declarations, exits, handoffs, `writes`, competition — and was calibrated against 24 journeys read in full during this and the previous audit passes. Everything numeric below is computed from the corpus; nothing is estimated. Where a number depends on a heuristic (for example "timing is vague"), the heuristic is stated so it can be disputed.

---

## A. Executive verdict

| Fact | Value |
|---|---|
| Canonical journeys | **281** (3,572 nodes; 26 categories; 5 retired ids kept as redirects, not counted) |
| Communication journeys (≥2 message actions, or messaging is the majority of the work) | **49** |
| Hybrid journeys (message channel declared, communication is a minority step) | **18** |
| Operational / internal workflows (no message channel) | **214** — of which 17 route work to a human (`sales`/`task`) and 28 are pure bookkeeping state machines that touch nothing outside the system |
| Average implementation-readiness score | **66.6%** overall · communication+hybrid **66.1%** (59.5 / 90) · operational 66.7% |
| READY | **0** |
| READY WITH CONFIG | **8** communication/hybrid (+ 52 operational workflows at the same bar) |
| NEEDS ENRICHMENT | **59** communication/hybrid (+ 162 operational) |
| STRUCTURAL REWORK | **0** — no journey's graph model prevents implementation |
| MERGE / SPLIT candidates | 9 (listed in §E and §I) |
| Journeys carrying a hard fail | **56 of 67** communication/hybrid (51 channel-order, 23 cadence, 18 both) |

**The plain conclusion.** A lifecycle manager who downloads this repository today gets an unusually good *state model* and almost no *orchestration values*. Not one of the 209 wait nodes in the library carries a duration or a recommended default — 35 are bound to a real attribute (a deadline, an expiry, a booking start) and are deployable as they stand; 33 name a configuration rule without a value; 141 (67%) say only "a bounded window", "the reminder point defined for this kind of obligation", "a short window". Of the 56 journeys that declare more than one message channel, 51 say nothing about which channel goes first, what falls back, or when a channel is switched. No journey has a measurement block. The practitioner therefore still has to invent the cadence, the channel order and the success metric for essentially every communication journey — which is the definition of "not implementation-ready" in the brief.

What they do **not** have to invent is the hard part: the states, the forks, the timeout arms, the exits, the re-entry rules and the cross-journey handoffs. That is why the library is not "structural rework" anywhere. The gap is a missing layer, not a broken model, and §J's plan is sized accordingly.

**Major systemic weaknesses** (ranked in §B): (1) no timing values or defaults, anywhere; (2) channel strategy declared as a set, never as a policy; (3) no measurement layer; (4) collision handling exists as 31 global principles and 14 declared contests, not as per-journey caps or priorities; (5) the data contract is semantic (event names, 135 `*_log` fields) with no attribute-level contract; (6) CTA destinations are named in 3 of 67 message-carrying journeys.

**Major systemic strengths** (with evidence): triggers are authoritative in 234/281 and carry negative evidence (`insufficientAlone`) in 187/281 and in all 67 communication/hybrid journeys; every wait has both arms and **none** of the 209 extends its window on engagement; **no** branch anywhere is decided by an email open or click (the 36 "open" matches in branch text are all "open case", "open issue" — verified); every one of 517 exits names its re-entry condition; every journey names its entity scope; 519 handoffs carry payload and 39 explicitly suppress the sender's queued work; the global rule set already states idempotency (GLB-12/19/20), re-read-before-send (GLB-18), retry budgets (GLB-24), delivery windows in local time (GLB-27), contact-pressure caps (GLB-28) and hard-gate ordering (GLB-31, the 11-stage send path); message nodes are specific (communication `does` text averages well over 150 characters and reads as content brief, not "send reminder"); portability is near-perfect (no vertical vocabulary anywhere).

---

## B. Systemic findings

Severity: P0 blocks implementation of the affected class; P1 forces the implementer to design something the library should have supplied; P2 is a safety or clarity gap with a global rule partly covering it; P3 is quality or discoverability.

### B1 · P0 — Timing has no values and no defaults

| Measure | Count |
|---|---|
| Wait nodes in the library | 209 (in 172 journeys) |
| Timeout stated as a concrete duration | **0** |
| Timeout bound to a real attribute/event (deadline, expiry, start time, offer validity) — deployable as-is | 35 |
| Timeout naming a configuration rule but no value ("the recovery window defined for this obligation class") | 33 |
| Timeout naming neither ("a bounded response window", "a short window", "the reactivation window") | **141 (67%)** |
| Communication/hybrid journeys whose *every* wait is in the last class | **31 of 67** |
| Communication/hybrid journeys with no wait at all after a send | 10 of 67 |

Representative: ACT-14 `w.response` "a bounded response window"; ACT-20 `w.return` "the reactivation window"; FBK-41 `w.response` "a bounded response window"; RET-28 `w.decision` "the period in which the intent remains meaningful"; ACQ-09 "the bounded nurture window fixed when the lead entered". Contrast the deployable form: TIM-61 "the deadline itself", SUB-262 "the effective end date", FUL-276 "the point in the window at which one reminder can still be acted on".

Why it matters: the brief's §5 standard is *recommended default + configuration rule*. The library's authoring rule ("never invent a number") produced a corpus that hides behind "depends" for 141 of 209 waits. The prior implementation-recipe document inherited the same gap — its "Configure" sections are one-line restatements ("Ownership / assignment rules and human escalation policy").

Fix: `wait.timeout` becomes `{ rule, default, configKey }` (§H). Defaults are set per *pattern class*, not per journey: e.g. abandonment-recovery first check, reminder-before-deadline, confirmation-window, decision-SLA, correction-window. ~12 classes cover the 141 vague waits.

### B2 · P0 — Channel strategy is a set, not a policy

| Measure | Count |
|---|---|
| Communication/hybrid journeys | 67 |
| Declaring more than one message channel | 56 |
| …of those, with any primary/fallback/switch/in-session rule in the journey text | 5 |
| Hard fail HF-CHANNEL-ORDER | **51** |

Examples: TIM-61 and TIM-63 declare `email, push, sms, whatsapp` on one and two communication actions respectively; FIN-134 declares four channels for "request the exact corrective action" with no order; SUB-163 four channels for a renewal notice; IDN-85 declares `sms, push, email` for an authentication challenge — a case where channel *is* the mechanism and must be specified. The library's answer is architectural: channel routing is stage 9 of the send path, owned by CMS-204 ("select the smallest valid set capable of satisfying the obligation"). That rule is correct and generic, and it means no journey file tells its implementer what "smallest valid set" is *for this message*.

Fix: `channelPolicy` on each communication action: `{ primary, reason, fallback[], escalation?, simultaneous?, inSessionOnly?, urgency }` (§H). This is not a per-node channel pick; it is the rule CMS-204 needs as input.

### B3 · P0 — No measurement layer

0 of 281 journeys carry a primary outcome, guardrail or operational metric field. 89 journeys have at least one exit whose state names a success ("recovered", "confirmed", "renewed"); the remaining 192 leave success to be inferred from which exit fired. No journey names a holdout/control recommendation. Dimension 16 averages **1.32 / 5** with 100% of journeys below 3 — the weakest dimension in the corpus by a wide margin.

Fix: `measurement: { primary, secondary[], guardrails[], operational[], holdout }` where every entry is an *event name* already present in the graph (exit id or `until` event), never a number.

### B4 · P1 — Collision and frequency are principles, not fields

14 journeys declare `competition` (5 exclusion groups); 2 declare `preemptedBy`; 39 handoffs carry `suppresses`. GLB-28 defines contact-pressure cap classes and GLB-31 the hard gates, but no journey carries a priority, a local frequency cap, a cooldown or a transactional/promotional class. Dimension 11 averages **2.04**, 84% of journeys below 3. The brief's four-journeys-in-ten-minutes scenario (payment failure + cancellation save + feedback request + reactivation) is only partially prevented: RET-28/RET-24/RET-30/ACT-18/FBK-46 now share `retention-outreach`; FIN-134 is in no group; FBK-41/42 are in `outbound-ask`; ACT-20 sits alone in `lifecycle-stage` with ACT-12.

Fix: journey-level `priority` (transactional / service / lifecycle / promotional), `frequency: { localCap, cooldown }`, and membership in a contact-pressure class; extend `competition` to the 67 communication/hybrid journeys where at least the class is declared.

### B5 · P1 — The data contract is semantic, not attribute-level

Every trigger is a snake_case semantic event with `requires[]` (100%), which is the right portability move. But: 1,012 of 1,256 actions carry `writes`, and 966 of those write to one of 135 `*_log` ledger fields (`suppressed_sends` 68, `incident_log` 57, `decision_log` 54…); only 46 actions name a non-log field. No journey lists required entity attributes (`checkout_id`, `cart_value`, `due_date`), optional attributes, or required platform capabilities (delayed execution, event cancellation, consent lookup). Dimension 12 averages 3.12.

Fix: `implementation.requiredEvents[]`, `requiredAttributes[]`, `optionalAttributes[]`, `requiredCapabilities[]` (§H). The 30 undefined `external:*` handoff targets (B8) need the same contract.

### B6 · P1 — Eligibility and suppression are delegated to the send path, so a journey read alone under-specifies them

Only 19 of 67 communication/hybrid journeys contain an explicit permission/contactability condition or hand off to CON-36/CMS-2xx; the rest rely on GLB-31 and CMS-205 evaluating "absent permission, closed account, legal ineligibility, fraud hold, open critical issue, service-recovery pause" before any send. 30% of journeys score below 3 on eligibility. The architecture is sound; the *file* is not self-describing. Representative: ACT-15 (5 nodes) sends two messages with no guard of any kind; FBK-45 acknowledges positive feedback with no duplicate-ask or cooldown check; SUB-262 sends a cancellation confirmation with no suppression check.

Fix: `eligibility[]` and `suppressions[]` arrays on every journey, populated with the global gates by default plus the journey's own (§H), so a file states what the send path will enforce.

### B7 · P1 — CTA destinations are almost never named

3 of 67 message-carrying journeys say where the action goes (FUL-276 "explicit accept and decline paths", ACT-14 "the primary route books assisted setup; the secondary opens the specific guide", CON-264 "sent to the old destination itself"); 12 mention a link at all. The rest say *what* to say with real precision and nothing about the destination — the brief's "a CTA that opens the homepage" failure is not prevented anywhere.

Fix: `destination` on each communication action: `{ target: "checkout-session" | "payment-method-update" | …, binding: "entity-id", mustNotClaim[] }`.

### B8 · P1 — Failure paths and undefined destinations

Delivery failure is handed to CMS-208/CON-36 in only 4 of 67 communication journeys; the other 63 assume the send path's recovery. Dimension 13 (failure handling) has 35% of journeys below 3. Separately, 81 handoffs go to 30 `external:*` lifecycles that do not exist in the library (`external:payment-recovery`, `external:consequence-owner`, `external:requesting-process`, `external:health-monitoring` …). For an implementer these are dead ends with a name.

Fix: (a) default delivery-failure and contactability-loss handoffs are declared in the send-path contract once and referenced, not re-drawn; (b) every `external:*` target gets a one-paragraph contract in `global.ts` (what it must do, what it receives) or is replaced by a real journey.

### B9 · P1 — Behavioral branching after a send is thin

Dimension 8 averages 2.73 (49% below 3). 9 of 67 communication journeys send and exit with nothing observed; 43 are multi-touch; 22 have a timeout→reminder ladder. Where a wait exists it almost always waits on the *business* outcome (payment satisfied, booking confirmed, correction provided) — the right signal — but the "what happened" condition after the wait is present in only part of the corpus, and a response that is neither success nor silence (a reply asking a question, a partial action) is rarely modelled.

### B10 · P2 — Negative trigger evidence missing on 94 internal journeys

All 67 communication/hybrid triggers carry `insufficientAlone`; 94 of the 214 operational triggers do not. For internal workflows this matters less, but "what looks like this event and is not" is exactly the field that stops a data-quality false positive from opening a workflow.

### B11 · P2 — Idempotency is global, not local

GLB-12/19/20 cover idempotency keys, replayed events and unknown outcomes library-wide; 7 journeys state a key explicitly (FIN-134 "the same idempotency key", OPS-124, CMS-208 …). No schema field carries the key. For money, tasks, approvals and account changes the implementer must derive it (§H proposes `idempotencyKey` on actions with side effects; the natural key is `entity instance id + node id`).

### B12 · P2 — Instance identity is prose in most files

Every journey names an entity scope; 22 state the instance rule explicitly ("one instance per requirement", "each renewal cycle is its own instance"). The remaining 259 describe scope in a sentence a machine cannot read. Re-entry is otherwise the corpus's strongest area (517/517 exits carry `reEntry`, 14 terminal).

### B13 · P2 — Loops are bounded by state, not by count

34 journeys contain a true cycle. All 34 exit on a wait timeout, so none is a zombie. Three (OPS-127 dead-letter review, INC-251 candidate investigation, TRM-110 newly discovered copies) re-enter their loop from a condition with no iteration cap or absolute deadline stated — bounded in practice by the business, unbounded on paper.

### B14 · P2 — UNKNOWN is a branch in 18 journeys

18 journeys carry an explicit unknown/undeterminable branch (CMS-208 "unclassifiable", IDN-84 "failure nobody could classify"). GLB-20 states the rule globally. Conditions elsewhere are binary or ternary on observable state (only 37 of 1,795 branch tests use judgement words, and most of those are policy decisions a human legitimately makes — "is asking useful here").

### B15 · P3 — Over-engineering is moderate and local

Node count: min 5, median 13, p75 15, max 23; 22 journeys at 18+. 57 conditions in 46 journeys are linear guards whose both arms reconverge within one internal action (FUL-150 ×3, CON-34 ×2, OWN-54 ×2). These implement as `if` clauses inside one step and are not wrong, but they are why a 19-node FUL-146 will be built as an 8-step flow. No branch was found that changes nothing downstream. The bigger practitioner cost is the opposite: 30 handoffs to undefined lifecycles (B8) and internal state-recording actions (28 pure-bookkeeping journeys) that a platform would collapse into attribute updates.

### B16 · P3 — Discoverability vs coverage

Practitioner vocabulary ("checkout abandonment", "win-back", "replenishment") maps onto canonical names only partly; §I's coverage table separates true gaps (7) from naming gaps (12).

### B17 · P3 — The previous Implementation Recipes add no orchestration

The 2026-09 recipe document restates each graph's trigger, handoffs and channels and adds one-line "Configure" items. It contains no default, no cadence, no channel order, no destination and no metric — the same gaps as the corpus, because it was generated from it. It should be regenerated from the vNext schema, not maintained.

---

## C. Journey-by-journey audit table

Type: Communication = messaging is the work; Hybrid = a message channel is declared but communication is a minority step; Operational = no message channel (marked *conceptual* where every action is bookkeeping). Score is over 18 dimensions (90) for communication/hybrid and 16 (80) for operational, where sequencing and channel strategy do not apply; % normalises the two. Hard fail codes: **HF-CADENCE** = multi-touch journey whose waits name neither a value, an attribute nor a configuration rule; **HF-CHANNEL-ORDER** = more than one message channel with no primary/fallback/switch rule.

| ID | Journey | Type | Score | % | Readiness | Hard fail | Main missing pieces | Recommended action |
|---|---|---|--:|--:|---|---|---|---|
| ACC-71 | Entitlement Qualification | Operational (conceptual) | 58/80 | 73 | NON-COMMUNICATION WORKFLOW (ready with config) | — | success/guardrail metrics | Add implementation contract (events, attributes, timing rule); keep as workflow |
| ACC-72 | Entitlement Provisioning | Operational | 52/80 | 65 | NON-COMMUNICATION WORKFLOW (needs enrichment) | — | deployable wait values | Implementation contract + timing rule/default + failure paths |
| ACC-73 | Entitlement Recalculation | Operational | 52/80 | 65 | NON-COMMUNICATION WORKFLOW (needs enrichment) | — | failure paths; success/guardrail metrics | Implementation contract + timing rule/default + failure paths |
| ACC-74 | Entitlement Revocation | Operational | 52/80 | 65 | NON-COMMUNICATION WORKFLOW (needs enrichment) | — | failure paths; success/guardrail metrics | Implementation contract + timing rule/default + failure paths |
| ACC-75 | Access Authorization | Operational (conceptual) | 57/80 | 71 | NON-COMMUNICATION WORKFLOW (ready with config) | — | success/guardrail metrics | Add implementation contract (events, attributes, timing rule); keep as workflow |
| ACC-76 | Credential Lifecycle | Operational | 53/80 | 66 | NON-COMMUNICATION WORKFLOW (needs enrichment) | — | deployable wait values; failure paths | Implementation contract + timing rule/default + failure paths |
| ACC-77 | Credential Revocation | Operational | 48/80 | 60 | NON-COMMUNICATION WORKFLOW (needs enrichment) | — | entry guard / suppression; failure paths; success/guardrail metrics; idempotency key | Implementation contract + timing rule/default + failure paths |
| ACC-78 | Access Suspension | Operational (conceptual) | 56/80 | 70 | NON-COMMUNICATION WORKFLOW (ready with config) | — | success/guardrail metrics; idempotency key | Add implementation contract (events, attributes, timing rule); keep as workflow |
| ACC-79 | Capability Restoration | Operational | 54/80 | 68 | NON-COMMUNICATION WORKFLOW (needs enrichment) | — | attribute-level data contract; failure paths | Implementation contract + timing rule/default + failure paths |
| ACC-80 | Deprovisioning Reconciliation | Operational | 54/80 | 68 | NON-COMMUNICATION WORKFLOW (needs enrichment) | — | deployable wait values; success/guardrail metrics | Implementation contract + timing rule/default + failure paths |
| ACC-261 | Access Recovery | Communication | 72/90 | 80 | NEEDS ENRICHMENT | HF-CHANNEL-ORDER | collision/frequency rules; CTA destination | declare channel policy (primary/fallback/switch); name the CTA destination |
| ACC-263 | Activation Reminder | Communication | 58/90 | 64 | NEEDS ENRICHMENT | HF-CADENCE, HF-CHANNEL-ORDER | deployable wait values; channel order/fallback; entry guard / suppression; failure paths; CTA destination | write the cadence (waits with default + config rule); declare channel policy (primary/fallback/switch); name the CTA destination; add eligibility/suppression guards |
| ACQ-01 | Anonymous Identity Resolution | Operational (conceptual) | 54/80 | 68 | NON-COMMUNICATION WORKFLOW (needs enrichment) | — | deployable wait values; success/guardrail metrics | Add implementation contract (events, attributes, timing rule); keep as workflow |
| ACQ-02 | Interest Qualification Routing | Operational | 50/80 | 63 | NON-COMMUNICATION WORKFLOW (needs enrichment) | — | success/guardrail metrics; idempotency key | Implementation contract + timing rule/default + failure paths |
| ACQ-03 | Intent Escalation Handoff | Operational | 53/80 | 66 | NON-COMMUNICATION WORKFLOW (needs enrichment) | — | failure paths; success/guardrail metrics | Implementation contract + timing rule/default + failure paths |
| ACQ-04 | High-Intent Lead Routing | Operational | 57/80 | 71 | NON-COMMUNICATION WORKFLOW (ready with config) | — | success/guardrail metrics | Implementation contract only |
| ACQ-05 | Qualification State Routing | Operational | 60/80 | 75 | NON-COMMUNICATION WORKFLOW (ready with config) | — | failure paths; success/guardrail metrics | Implementation contract only |
| ACQ-06 | Eligibility Recalculation | Operational | 55/80 | 69 | NON-COMMUNICATION WORKFLOW (needs enrichment) | — | success/guardrail metrics; idempotency key | Implementation contract + timing rule/default + failure paths |
| ACQ-07 | Intent Decay | Operational | 57/80 | 71 | NON-COMMUNICATION WORKFLOW (ready with config) | — | failure paths; success/guardrail metrics | Implementation contract only |
| ACQ-08 | Acquisition Exit Handoff | Operational | 56/80 | 70 | NON-COMMUNICATION WORKFLOW (ready with config) | — | failure paths; success/guardrail metrics | Implementation contract only |
| ACQ-09 | Lead Nurture | Hybrid | 58/90 | 64 | NEEDS ENRICHMENT | HF-CHANNEL-ORDER | channel order/fallback; collision/frequency rules; failure paths; CTA destination | declare channel policy (primary/fallback/switch); name the CTA destination |
| ACQ-10 | Commercial Decline Routing | Operational (conceptual) | 59/80 | 74 | NON-COMMUNICATION WORKFLOW (ready with config) | — | success/guardrail metrics; idempotency key | Add implementation contract (events, attributes, timing rule); keep as workflow |
| ACQ-285 | New Lead Welcome | Communication | 64/90 | 71 | READY WITH CONFIG | — | collision/frequency rules; failure paths; success/guardrail metrics; CTA destination | name the CTA destination; add measurement block |
| ACT-11 | Onboarding Route Assignment | Operational | 51/80 | 64 | NON-COMMUNICATION WORKFLOW (needs enrichment) | — | success/guardrail metrics | Implementation contract + timing rule/default + failure paths |
| ACT-12 | Onboarding Nurture | Communication | 58/90 | 64 | NEEDS ENRICHMENT | HF-CHANNEL-ORDER | deployable wait values; channel order/fallback; failure paths; CTA destination | declare channel policy (primary/fallback/switch); name the CTA destination |
| ACT-13 | Onboarding Blocker Reminder | Hybrid | 64/90 | 71 | NEEDS ENRICHMENT | HF-CHANNEL-ORDER | deployable wait values; CTA destination | declare channel policy (primary/fallback/switch); name the CTA destination |
| ACT-14 | Onboarding Help | Communication | 64/90 | 71 | READY WITH CONFIG | — | failure paths; CTA destination | name the CTA destination |
| ACT-15 | First Value Milestone | Communication | 49/90 | 54 | NEEDS ENRICHMENT | HF-CHANNEL-ORDER | deployable wait values; channel order/fallback; entry guard / suppression; collision/frequency rules; failure paths; success/guardrail metrics; CTA destination | declare channel policy (primary/fallback/switch); name the CTA destination; add measurement block; add eligibility/suppression guards |
| ACT-16 | Onboarding Completion Handoff | Operational | 56/80 | 70 | NON-COMMUNICATION WORKFLOW (ready with config) | — | failure paths; success/guardrail metrics | Implementation contract only |
| ACT-17 | Adoption Nurture | Communication | 51/90 | 57 | NEEDS ENRICHMENT | HF-CHANNEL-ORDER | channel order/fallback; entry guard / suppression; collision/frequency rules; failure paths; success/guardrail metrics; CTA destination | declare channel policy (primary/fallback/switch); name the CTA destination; add measurement block; add eligibility/suppression guards |
| ACT-18 | Adoption Recovery | Communication | 59/90 | 66 | NEEDS ENRICHMENT | HF-CHANNEL-ORDER | channel order/fallback; success/guardrail metrics; CTA destination | declare channel policy (primary/fallback/switch); name the CTA destination; add measurement block |
| ACT-19 | Onboarding Personalization | Hybrid | 53/90 | 59 | NEEDS ENRICHMENT | HF-CHANNEL-ORDER | deployable wait values; channel order/fallback; collision/frequency rules; failure paths; success/guardrail metrics; CTA destination | declare channel policy (primary/fallback/switch); name the CTA destination; add measurement block |
| ACT-20 | Dormant Lead Reactivation | Hybrid | 57/90 | 63 | NEEDS ENRICHMENT | HF-CHANNEL-ORDER | deployable wait values; channel order/fallback; failure paths; CTA destination | declare channel policy (primary/fallback/switch); name the CTA destination |
| CMS-201 | Communication Obligation Creation | Operational | 57/80 | 71 | NON-COMMUNICATION WORKFLOW (ready with config) | — | success/guardrail metrics | Implementation contract only |
| CMS-202 | Recipient Resolution | Operational (conceptual) | 55/80 | 69 | NON-COMMUNICATION WORKFLOW (needs enrichment) | — | deployable wait values; success/guardrail metrics | Add implementation contract (events, attributes, timing rule); keep as workflow |
| CMS-203 | Channel Eligibility Resolution | Operational (conceptual) | 54/80 | 68 | NON-COMMUNICATION WORKFLOW (needs enrichment) | — | entry guard / suppression; success/guardrail metrics | Add implementation contract (events, attributes, timing rule); keep as workflow |
| CMS-204 | Channel Routing | Operational | 49/80 | 61 | NON-COMMUNICATION WORKFLOW (needs enrichment) | — | entry guard / suppression; failure paths; success/guardrail metrics | Implementation contract + timing rule/default + failure paths |
| CMS-205 | Send Eligibility Check | Operational | 51/80 | 64 | NON-COMMUNICATION WORKFLOW (needs enrichment) | — | success/guardrail metrics; idempotency key | Implementation contract + timing rule/default + failure paths |
| CMS-206 | Send Attempt Status | Operational | 51/80 | 64 | NON-COMMUNICATION WORKFLOW (needs enrichment) | — | deployable wait values | Implementation contract + timing rule/default + failure paths |
| CMS-207 | Delivery Outcome Reconciliation | Operational | 58/80 | 73 | NON-COMMUNICATION WORKFLOW (ready with config) | — | success/guardrail metrics | Implementation contract only |
| CMS-208 | Message Delivery Recovery | Hybrid | 61/90 | 68 | READY WITH CONFIG | — | deployable wait values; send→wait→recheck sequence; collision/frequency rules; success/guardrail metrics; CTA destination | name the CTA destination; add measurement block |
| CMS-210 | Communication Obligation Closure | Operational | 55/80 | 69 | NON-COMMUNICATION WORKFLOW (needs enrichment) | — | — | Implementation contract + timing rule/default + failure paths |
| CON-31 | Permission Validation | Operational | 52/80 | 65 | NON-COMMUNICATION WORKFLOW (needs enrichment) | — | attribute-level data contract; failure paths; idempotency key | Implementation contract + timing rule/default + failure paths |
| CON-32 | Preference Capture | Operational | 54/80 | 68 | NON-COMMUNICATION WORKFLOW (needs enrichment) | — | failure paths; success/guardrail metrics | Implementation contract + timing rule/default + failure paths |
| CON-33 | Preference Recalculation | Operational | 50/80 | 63 | NON-COMMUNICATION WORKFLOW (needs enrichment) | — | entry guard / suppression; failure paths; success/guardrail metrics | Implementation contract + timing rule/default + failure paths |
| CON-34 | Frequency Recalculation | Operational | 52/80 | 65 | NON-COMMUNICATION WORKFLOW (needs enrichment) | — | failure paths; success/guardrail metrics | Implementation contract + timing rule/default + failure paths |
| CON-35 | Permission Change Enforcement | Operational | 51/80 | 64 | NON-COMMUNICATION WORKFLOW (needs enrichment) | — | failure paths; success/guardrail metrics | Implementation contract + timing rule/default + failure paths |
| CON-36 | Contactability Recalculation | Operational | 53/80 | 66 | NON-COMMUNICATION WORKFLOW (needs enrichment) | — | deployable wait values; success/guardrail metrics | Implementation contract + timing rule/default + failure paths |
| CON-38 | Communication Suppression | Operational | 51/80 | 64 | NON-COMMUNICATION WORKFLOW (needs enrichment) | — | deployable wait values; attribute-level data contract; success/guardrail metrics | Implementation contract + timing rule/default + failure paths |
| CON-39 | Communication Cooldown | Operational | 53/80 | 66 | NON-COMMUNICATION WORKFLOW (needs enrichment) | — | failure paths; success/guardrail metrics | Implementation contract + timing rule/default + failure paths |
| CON-40 | Permission Conflict Resolution | Operational | 53/80 | 66 | NON-COMMUNICATION WORKFLOW (needs enrichment) | — | entry guard / suppression | Implementation contract + timing rule/default + failure paths |
| CON-264 | Contact Verification | Communication | 68/90 | 76 | NEEDS ENRICHMENT | HF-CADENCE | deployable wait values; collision/frequency rules; failure paths; CTA destination | write the cadence (waits with default + config rule); name the CTA destination |
| CON-272 | Contact Recovery | Communication | 63/90 | 70 | READY WITH CONFIG | — | collision/frequency rules; failure paths; success/guardrail metrics; CTA destination | name the CTA destination; add measurement block |
| CON-283 | Frequency Preference Update | Hybrid | 59/90 | 66 | READY WITH CONFIG | — | deployable wait values; failure paths; success/guardrail metrics; CTA destination | name the CTA destination; add measurement block |
| CTL-231 | Ownership Assignment | Operational | 57/80 | 71 | NON-COMMUNICATION WORKFLOW (ready with config) | — | deployable wait values | Implementation contract only |
| CTL-232 | Ownership Transfer Validation | Operational (conceptual) | 52/80 | 65 | NON-COMMUNICATION WORKFLOW (needs enrichment) | — | entry guard / suppression; success/guardrail metrics; idempotency key | Add implementation contract (events, attributes, timing rule); keep as workflow |
| CTL-233 | Ownership Transfer Execution | Operational (conceptual) | 56/80 | 70 | NON-COMMUNICATION WORKFLOW (ready with config) | — | failure paths; success/guardrail metrics | Add implementation contract (events, attributes, timing rule); keep as workflow |
| CTL-234 | Ownership Cutover | Operational | 51/80 | 64 | NON-COMMUNICATION WORKFLOW (needs enrichment) | — | entry guard / suppression; failure paths; success/guardrail metrics | Implementation contract + timing rule/default + failure paths |
| CTL-235 | Delegation Authorization | Operational | 55/80 | 69 | NON-COMMUNICATION WORKFLOW (needs enrichment) | — | success/guardrail metrics | Implementation contract + timing rule/default + failure paths |
| CTL-236 | Temporary Delegation Expiry | Operational | 50/80 | 63 | NON-COMMUNICATION WORKFLOW (needs enrichment) | — | deployable wait values; entry guard / suppression; failure paths; success/guardrail metrics | Implementation contract + timing rule/default + failure paths |
| CTL-237 | Delegation Revocation | Operational (conceptual) | 51/80 | 64 | NON-COMMUNICATION WORKFLOW (needs enrichment) | — | entry guard / suppression; failure paths; success/guardrail metrics | Add implementation contract (events, attributes, timing rule); keep as workflow |
| CTL-238 | Ownership Recovery | Operational | 57/80 | 71 | NON-COMMUNICATION WORKFLOW (ready with config) | — | success/guardrail metrics | Implementation contract only |
| DAT-221 | Data Parsing | Operational | 55/80 | 69 | NON-COMMUNICATION WORKFLOW (needs enrichment) | — | success/guardrail metrics; idempotency key | Implementation contract + timing rule/default + failure paths |
| DAT-222 | Data Validation | Operational | 53/80 | 66 | NON-COMMUNICATION WORKFLOW (needs enrichment) | — | entry guard / suppression; success/guardrail metrics | Implementation contract + timing rule/default + failure paths |
| DAT-223 | Data Change Approval | Operational | 56/80 | 70 | NON-COMMUNICATION WORKFLOW (ready with config) | — | entry guard / suppression; success/guardrail metrics | Implementation contract only |
| DAT-224 | Import Execution | Operational | 56/80 | 70 | NON-COMMUNICATION WORKFLOW (ready with config) | — | entry guard / suppression; success/guardrail metrics | Implementation contract only |
| DAT-225 | Partial Import Recovery | Operational | 56/80 | 70 | NON-COMMUNICATION WORKFLOW (ready with config) | — | entry guard / suppression; success/guardrail metrics | Implementation contract only |
| DAT-226 | Migration Readiness Validation | Operational | 51/80 | 64 | NON-COMMUNICATION WORKFLOW (needs enrichment) | — | entry guard / suppression; success/guardrail metrics | Implementation contract + timing rule/default + failure paths |
| DAT-227 | Migration Verification | Operational | 50/80 | 63 | NON-COMMUNICATION WORKFLOW (needs enrichment) | — | entry guard / suppression; success/guardrail metrics | Implementation contract + timing rule/default + failure paths |
| DAT-228 | Cutover Stabilization | Operational | 54/80 | 68 | NON-COMMUNICATION WORKFLOW (needs enrichment) | — | deployable wait values; success/guardrail metrics | Implementation contract + timing rule/default + failure paths |
| DAT-229 | Historical Backfill | Operational | 55/80 | 69 | NON-COMMUNICATION WORKFLOW (needs enrichment) | — | — | Implementation contract + timing rule/default + failure paths |
| DAT-230 | Transformation Error Recovery | Operational | 53/80 | 66 | NON-COMMUNICATION WORKFLOW (needs enrichment) | — | success/guardrail metrics | Implementation contract + timing rule/default + failure paths |
| DEC-181 | Decision Request | Operational | 58/80 | 73 | NON-COMMUNICATION WORKFLOW (ready with config) | — | idempotency key | Implementation contract only |
| DEC-182 | Review Assignment | Operational | 49/80 | 61 | NON-COMMUNICATION WORKFLOW (needs enrichment) | — | deployable wait values; success/guardrail metrics; idempotency key | Implementation contract + timing rule/default + failure paths |
| DEC-183 | Evidence Review | Operational | 51/80 | 64 | NON-COMMUNICATION WORKFLOW (needs enrichment) | — | entry guard / suppression; success/guardrail metrics | Implementation contract + timing rule/default + failure paths |
| DEC-184 | More Information Request | Hybrid | 61/90 | 68 | READY WITH CONFIG | — | collision/frequency rules; failure paths; CTA destination | name the CTA destination |
| DEC-185 | Approval Execution Validation | Operational | 54/80 | 68 | NON-COMMUNICATION WORKFLOW (needs enrichment) | — | failure paths; success/guardrail metrics | Implementation contract + timing rule/default + failure paths |
| DEC-186 | Rejection Resolution | Operational | 56/80 | 70 | NON-COMMUNICATION WORKFLOW (ready with config) | — | failure paths; success/guardrail metrics | Implementation contract only |
| DEC-187 | Partial Approval Resolution | Operational | 53/80 | 66 | NON-COMMUNICATION WORKFLOW (needs enrichment) | — | entry guard / suppression; failure paths | Implementation contract + timing rule/default + failure paths |
| DEC-188 | Approval Expiry Revalidation | Operational | 57/80 | 71 | NON-COMMUNICATION WORKFLOW (ready with config) | — | success/guardrail metrics | Implementation contract only |
| DEC-189 | Decision Escalation | Operational | 54/80 | 68 | NON-COMMUNICATION WORKFLOW (needs enrichment) | — | entry guard / suppression; success/guardrail metrics | Implementation contract + timing rule/default + failure paths |
| DEC-190 | Decision Re-Review | Operational | 57/80 | 71 | NON-COMMUNICATION WORKFLOW (ready with config) | — | success/guardrail metrics | Implementation contract only |
| DEC-267 | Adverse Decision Recovery | Communication | 65/90 | 72 | NEEDS ENRICHMENT | HF-CHANNEL-ORDER | entry guard / suppression; collision/frequency rules; success/guardrail metrics; CTA destination | declare channel policy (primary/fallback/switch); name the CTA destination; add measurement block; add eligibility/suppression guards |
| DOC-211 | Document Requirement Resolution | Operational | 58/80 | 73 | NON-COMMUNICATION WORKFLOW (ready with config) | — | failure paths | Implementation contract only |
| DOC-212 | Document Readiness Validation | Operational | 49/80 | 61 | NON-COMMUNICATION WORKFLOW (needs enrichment) | — | deployable wait values; entry guard / suppression; success/guardrail metrics | Implementation contract + timing rule/default + failure paths |
| DOC-213 | Document Issuance | Operational | 52/80 | 65 | NON-COMMUNICATION WORKFLOW (needs enrichment) | — | entry guard / suppression; failure paths; success/guardrail metrics | Implementation contract + timing rule/default + failure paths |
| DOC-214 | Document Delivery | Hybrid | 57/90 | 63 | NEEDS ENRICHMENT | — | deployable wait values; entry guard / suppression; collision/frequency rules; success/guardrail metrics; CTA destination | name the CTA destination; add measurement block; add eligibility/suppression guards |
| DOC-215 | Signature Reminder | Communication | 63/90 | 70 | READY WITH CONFIG | — | failure paths; success/guardrail metrics | add measurement block |
| DOC-216 | Document Effectiveness Validation | Operational | 56/80 | 70 | NON-COMMUNICATION WORKFLOW (ready with config) | — | deployable wait values | Implementation contract only |
| DOC-217 | Document Versioning | Operational | 56/80 | 70 | NON-COMMUNICATION WORKFLOW (ready with config) | — | success/guardrail metrics | Implementation contract only |
| DOC-218 | Document Expiry Resolution | Operational | 55/80 | 69 | NON-COMMUNICATION WORKFLOW (needs enrichment) | — | success/guardrail metrics | Implementation contract + timing rule/default + failure paths |
| DOC-219 | Document Revocation Reconciliation | Operational | 53/80 | 66 | NON-COMMUNICATION WORKFLOW (needs enrichment) | — | failure paths; success/guardrail metrics | Implementation contract + timing rule/default + failure paths |
| DOC-220 | Document Conflict Review | Hybrid | 54/90 | 60 | NEEDS ENRICHMENT | — | deployable wait values; send→wait→recheck sequence; entry guard / suppression; collision/frequency rules; success/guardrail metrics; CTA destination | name the CTA destination; add measurement block; add eligibility/suppression guards |
| DOC-286 | Document Activation | Communication | 62/90 | 69 | NEEDS ENRICHMENT | HF-CADENCE, HF-CHANNEL-ORDER | deployable wait values; channel order/fallback; failure paths; CTA destination | write the cadence (waits with default + config rule); declare channel policy (primary/fallback/switch); name the CTA destination |
| FBK-41 | Feedback Request | Communication | 56/90 | 62 | NEEDS ENRICHMENT | HF-CHANNEL-ORDER | deployable wait values; channel order/fallback; attribute-level data contract; failure paths; CTA destination | declare channel policy (primary/fallback/switch); name the CTA destination |
| FBK-42 | Advocacy Request | Communication | 61/90 | 68 | NEEDS ENRICHMENT | HF-CADENCE | deployable wait values; failure paths; CTA destination | write the cadence (waits with default + config rule); name the CTA destination |
| FBK-43 | Feedback Follow-Up | Hybrid | 53/90 | 59 | NEEDS ENRICHMENT | HF-CHANNEL-ORDER | deployable wait values; send→wait→recheck sequence; channel order/fallback; entry guard / suppression; collision/frequency rules; CTA destination | declare channel policy (primary/fallback/switch); name the CTA destination; add eligibility/suppression guards |
| FBK-44 | Negative Feedback Recovery | Hybrid | 55/90 | 61 | NEEDS ENRICHMENT | HF-CHANNEL-ORDER | deployable wait values; send→wait→recheck sequence; channel order/fallback; collision/frequency rules; success/guardrail metrics; CTA destination | declare channel policy (primary/fallback/switch); name the CTA destination; add measurement block |
| FBK-45 | Positive Feedback Follow-Up | Communication | 52/90 | 58 | NEEDS ENRICHMENT | HF-CHANNEL-ORDER | deployable wait values; send→wait→recheck sequence; channel order/fallback; collision/frequency rules; failure paths; success/guardrail metrics; CTA destination | declare channel policy (primary/fallback/switch); name the CTA destination; add measurement block |
| FBK-46 | Complaint Resolution | Hybrid | 65/90 | 72 | NEEDS ENRICHMENT | HF-CHANNEL-ORDER | deployable wait values; CTA destination; idempotency key | declare channel policy (primary/fallback/switch); name the CTA destination |
| FBK-47 | Appeal Review | Communication | 60/90 | 67 | READY WITH CONFIG | — | entry guard / suppression; collision/frequency rules; success/guardrail metrics; CTA destination; idempotency key | name the CTA destination; add measurement block; add eligibility/suppression guards |
| FBK-48 | Declared Context Recalculation | Operational | 53/80 | 66 | NON-COMMUNICATION WORKFLOW (needs enrichment) | — | failure paths; success/guardrail metrics | Implementation contract + timing rule/default + failure paths |
| FBK-49 | Missing Information Reminder | Hybrid | 60/90 | 67 | NEEDS ENRICHMENT | HF-CHANNEL-ORDER | deployable wait values; channel order/fallback; entry guard / suppression; collision/frequency rules; CTA destination | declare channel policy (primary/fallback/switch); name the CTA destination; add eligibility/suppression guards |
| FBK-50 | Relationship State Reassessment | Operational | 54/80 | 68 | NON-COMMUNICATION WORKFLOW (needs enrichment) | — | success/guardrail metrics | Implementation contract + timing rule/default + failure paths |
| FIN-131 | Financial Obligation Tracking | Operational | 55/80 | 69 | NON-COMMUNICATION WORKFLOW (needs enrichment) | — | deployable wait values; failure paths; success/guardrail metrics | Implementation contract + timing rule/default + failure paths |
| FIN-132 | Payment Outcome Resolution | Operational | 48/80 | 60 | NON-COMMUNICATION WORKFLOW (needs enrichment) | — | deployable wait values; entry guard / suppression; success/guardrail metrics | Implementation contract + timing rule/default + failure paths |
| FIN-133 | Payment Settlement Lifecycle | Operational (conceptual) | 50/80 | 63 | NON-COMMUNICATION WORKFLOW (needs enrichment) | — | deployable wait values; success/guardrail metrics; idempotency key | Add implementation contract (events, attributes, timing rule); keep as workflow |
| FIN-134 | Payment Failure Recovery | Communication | 60/90 | 67 | NEEDS ENRICHMENT | HF-CADENCE, HF-CHANNEL-ORDER | deployable wait values; collision/frequency rules; CTA destination | write the cadence (waits with default + config rule); declare channel policy (primary/fallback/switch); name the CTA destination |
| FIN-135 | Unknown Payment Reconciliation | Operational | 46/80 | 57 | NON-COMMUNICATION WORKFLOW (needs enrichment) | — | deployable wait values; entry guard / suppression; success/guardrail metrics | Implementation contract + timing rule/default + failure paths |
| FIN-136 | Balance Reconciliation | Operational | 55/80 | 69 | NON-COMMUNICATION WORKFLOW (needs enrichment) | — | failure paths | Implementation contract + timing rule/default + failure paths |
| FIN-137 | Refund Request | Communication | 55/90 | 61 | NEEDS ENRICHMENT | HF-CADENCE | deployable wait values; entry guard / suppression; collision/frequency rules; success/guardrail metrics; CTA destination | write the cadence (waits with default + config rule); name the CTA destination; add measurement block; add eligibility/suppression guards |
| FIN-138 | Refund Execution Verification | Operational | 53/80 | 66 | NON-COMMUNICATION WORKFLOW (needs enrichment) | — | deployable wait values | Implementation contract + timing rule/default + failure paths |
| FIN-139 | Financial Dispute Reconciliation | Operational | 52/80 | 65 | NON-COMMUNICATION WORKFLOW (needs enrichment) | — | deployable wait values; entry guard / suppression; failure paths; success/guardrail metrics | Implementation contract + timing rule/default + failure paths |
| FIN-140 | Financial Reconciliation | Operational | 49/80 | 61 | NON-COMMUNICATION WORKFLOW (needs enrichment) | — | deployable wait values; entry guard / suppression; success/guardrail metrics | Implementation contract + timing rule/default + failure paths |
| FUL-141 | Fulfillment Request Validation | Operational (conceptual) | 50/80 | 63 | NON-COMMUNICATION WORKFLOW (needs enrichment) | — | deployable wait values; entry guard / suppression; success/guardrail metrics; idempotency key | Add implementation contract (events, attributes, timing rule); keep as workflow |
| FUL-142 | Fulfillment Allocation | Operational (conceptual) | 46/80 | 57 | NON-COMMUNICATION WORKFLOW (needs enrichment) | — | deployable wait values; success/guardrail metrics | Add implementation contract (events, attributes, timing rule); keep as workflow |
| FUL-143 | Resource Reservation | Operational | 53/80 | 66 | NON-COMMUNICATION WORKFLOW (needs enrichment) | — | deployable wait values; success/guardrail metrics | Implementation contract + timing rule/default + failure paths |
| FUL-144 | Fulfillment Execution | Operational (conceptual) | 50/80 | 63 | NON-COMMUNICATION WORKFLOW (needs enrichment) | — | deployable wait values; entry guard / suppression | Add implementation contract (events, attributes, timing rule); keep as workflow |
| FUL-145 | Fulfillment Exception Recovery | Operational | 50/80 | 63 | NON-COMMUNICATION WORKFLOW (needs enrichment) | — | deployable wait values; success/guardrail metrics | Implementation contract + timing rule/default + failure paths |
| FUL-146 | Delivery Delay Alert | Communication | 48/90 | 53 | NEEDS ENRICHMENT | HF-CADENCE, HF-CHANNEL-ORDER | deployable wait values; channel order/fallback; collision/frequency rules; success/guardrail metrics; CTA destination; idempotency key | write the cadence (waits with default + config rule); declare channel policy (primary/fallback/switch); name the CTA destination; add measurement block |
| FUL-147 | Delivery Outcome Tracking | Operational | 49/80 | 61 | NON-COMMUNICATION WORKFLOW (needs enrichment) | — | deployable wait values; entry guard / suppression; success/guardrail metrics | Implementation contract + timing rule/default + failure paths |
| FUL-148 | Failed Delivery Recovery | Communication | 52/90 | 58 | NEEDS ENRICHMENT | HF-CADENCE, HF-CHANNEL-ORDER | deployable wait values; entry guard / suppression; collision/frequency rules; success/guardrail metrics; CTA destination | write the cadence (waits with default + config rule); declare channel policy (primary/fallback/switch); name the CTA destination; add measurement block; add eligibility/suppression guards |
| FUL-149 | Delivery Acceptance Finalization | Operational (conceptual) | 53/80 | 66 | NON-COMMUNICATION WORKFLOW (needs enrichment) | — | failure paths | Add implementation contract (events, attributes, timing rule); keep as workflow |
| FUL-150 | Fulfillment Cancellation Reconciliation | Operational | 54/80 | 68 | NON-COMMUNICATION WORKFLOW (needs enrichment) | — | failure paths | Implementation contract + timing rule/default + failure paths |
| FUL-265 | Delivery Tracking | Communication | 64/90 | 71 | NEEDS ENRICHMENT | HF-CADENCE, HF-CHANNEL-ORDER | deployable wait values; channel order/fallback; entry guard / suppression; collision/frequency rules | write the cadence (waits with default + config rule); declare channel policy (primary/fallback/switch); add eligibility/suppression guards |
| FUL-276 | Substitution Approval | Communication | 70/90 | 78 | NEEDS ENRICHMENT | HF-CADENCE, HF-CHANNEL-ORDER | deployable wait values; CTA destination | write the cadence (waits with default + config rule); declare channel policy (primary/fallback/switch); name the CTA destination |
| IDN-81 | Identity Verification | Communication | 58/90 | 64 | NEEDS ENRICHMENT | HF-CADENCE, HF-CHANNEL-ORDER | deployable wait values; channel order/fallback; collision/frequency rules; CTA destination | write the cadence (waits with default + config rule); declare channel policy (primary/fallback/switch); name the CTA destination |
| IDN-82 | Verification Dependency Resolution | Operational | 63/80 | 79 | NON-COMMUNICATION WORKFLOW (ready with config) | — | — | Implementation contract only |
| IDN-83 | Document Verification | Operational (conceptual) | 61/80 | 76 | NON-COMMUNICATION WORKFLOW (ready with config) | — | entry guard / suppression | Add implementation contract (events, attributes, timing rule); keep as workflow |
| IDN-84 | Verification Recovery | Communication | 59/90 | 66 | NEEDS ENRICHMENT | HF-CHANNEL-ORDER | deployable wait values; channel order/fallback; entry guard / suppression; collision/frequency rules; success/guardrail metrics; CTA destination | declare channel policy (primary/fallback/switch); name the CTA destination; add measurement block; add eligibility/suppression guards |
| IDN-85 | Login Verification | Hybrid | 53/90 | 59 | NEEDS ENRICHMENT | HF-CHANNEL-ORDER | deployable wait values; channel order/fallback; collision/frequency rules; success/guardrail metrics; CTA destination; idempotency key | declare channel policy (primary/fallback/switch); name the CTA destination; add measurement block |
| IDN-86 | Step-Up Authentication | Operational | 51/80 | 64 | NON-COMMUNICATION WORKFLOW (needs enrichment) | — | deployable wait values; entry guard / suppression; success/guardrail metrics | Implementation contract + timing rule/default + failure paths |
| IDN-87 | Authentication Risk Assessment | Operational | 50/80 | 63 | NON-COMMUNICATION WORKFLOW (needs enrichment) | — | success/guardrail metrics | Implementation contract + timing rule/default + failure paths |
| IDN-88 | Account Recovery Verification | Operational | 55/80 | 69 | NON-COMMUNICATION WORKFLOW (needs enrichment) | — | deployable wait values | Implementation contract + timing rule/default + failure paths |
| IDN-89 | Identity Attribute Update | Operational | 51/80 | 64 | NON-COMMUNICATION WORKFLOW (needs enrichment) | — | deployable wait values; attribute-level data contract; success/guardrail metrics | Implementation contract + timing rule/default + failure paths |
| IDN-90 | Account Compromise Recovery | Operational | 52/80 | 65 | NON-COMMUNICATION WORKFLOW (needs enrichment) | — | success/guardrail metrics | Implementation contract + timing rule/default + failure paths |
| IDN-270 | Account Recovery | Communication | 61/90 | 68 | NEEDS ENRICHMENT | HF-CADENCE, HF-CHANNEL-ORDER | deployable wait values; channel order/fallback; failure paths; CTA destination | write the cadence (waits with default + config rule); declare channel policy (primary/fallback/switch); name the CTA destination |
| IDN-271 | Account Security Alert | Communication | 64/90 | 71 | NEEDS ENRICHMENT | HF-CHANNEL-ORDER | channel order/fallback; collision/frequency rules; failure paths; success/guardrail metrics; CTA destination | declare channel policy (primary/fallback/switch); name the CTA destination; add measurement block |
| INC-251 | Incident Confirmation | Operational | 47/80 | 59 | NON-COMMUNICATION WORKFLOW (needs enrichment) | — | deployable wait values; entry guard / suppression; success/guardrail metrics | Implementation contract + timing rule/default + failure paths |
| INC-252 | Incident Escalation | Operational | 51/80 | 64 | NON-COMMUNICATION WORKFLOW (needs enrichment) | — | failure paths; success/guardrail metrics; idempotency key | Implementation contract + timing rule/default + failure paths |
| INC-253 | Incident Containment | Operational | 53/80 | 66 | NON-COMMUNICATION WORKFLOW (needs enrichment) | — | success/guardrail metrics | Implementation contract + timing rule/default + failure paths |
| INC-254 | Incident Update | Hybrid | 54/90 | 60 | NEEDS ENRICHMENT | HF-CHANNEL-ORDER | deployable wait values; send→wait→recheck sequence; channel order/fallback; collision/frequency rules; attribute-level data contract; success/guardrail metrics; CTA destination | declare channel policy (primary/fallback/switch); name the CTA destination; add measurement block |
| INC-255 | Root Cause Investigation | Operational | 52/80 | 65 | NON-COMMUNICATION WORKFLOW (needs enrichment) | — | entry guard / suppression; success/guardrail metrics | Implementation contract + timing rule/default + failure paths |
| INC-256 | Service Recovery Verification | Operational | 48/80 | 60 | NON-COMMUNICATION WORKFLOW (needs enrichment) | — | deployable wait values; entry guard / suppression; success/guardrail metrics | Implementation contract + timing rule/default + failure paths |
| INC-257 | Recovery Stability Monitoring | Operational | 50/80 | 63 | NON-COMMUNICATION WORKFLOW (needs enrichment) | — | deployable wait values; entry guard / suppression; success/guardrail metrics | Implementation contract + timing rule/default + failure paths |
| INC-258 | Incident Closure Reconciliation | Operational | 53/80 | 66 | NON-COMMUNICATION WORKFLOW (needs enrichment) | — | entry guard / suppression; failure paths | Implementation contract + timing rule/default + failure paths |
| INC-259 | Post-Incident Review | Operational | 53/80 | 66 | NON-COMMUNICATION WORKFLOW (needs enrichment) | — | deployable wait values; entry guard / suppression | Implementation contract + timing rule/default + failure paths |
| INC-260 | Recurring Incident Prevention | Operational | 54/80 | 68 | NON-COMMUNICATION WORKFLOW (needs enrichment) | — | success/guardrail metrics | Implementation contract + timing rule/default + failure paths |
| INT-111 | Integration Activation | Operational | 53/80 | 66 | NON-COMMUNICATION WORKFLOW (needs enrichment) | — | attribute-level data contract; idempotency key | Implementation contract + timing rule/default + failure paths |
| INT-112 | Integration Authorization Revalidation | Operational | 54/80 | 68 | NON-COMMUNICATION WORKFLOW (needs enrichment) | — | entry guard / suppression; failure paths | Implementation contract + timing rule/default + failure paths |
| INT-113 | Integration Health Recovery | Operational | 53/80 | 66 | NON-COMMUNICATION WORKFLOW (needs enrichment) | — | — | Implementation contract + timing rule/default + failure paths |
| INT-114 | External Request Reconciliation | Operational | 46/80 | 57 | NON-COMMUNICATION WORKFLOW (needs enrichment) | — | deployable wait values; failure paths; success/guardrail metrics | Implementation contract + timing rule/default + failure paths |
| INT-115 | External Outcome Reconciliation | Operational | 57/80 | 71 | NON-COMMUNICATION WORKFLOW (ready with config) | — | success/guardrail metrics | Implementation contract only |
| INT-116 | Integration Failure Recovery | Operational | 48/80 | 60 | NON-COMMUNICATION WORKFLOW (needs enrichment) | — | deployable wait values; success/guardrail metrics | Implementation contract + timing rule/default + failure paths |
| INT-117 | Integration Work Hold | Operational | 55/80 | 69 | NON-COMMUNICATION WORKFLOW (needs enrichment) | — | deployable wait values; success/guardrail metrics | Implementation contract + timing rule/default + failure paths |
| INT-118 | Integration Backfill Reconciliation | Operational | 53/80 | 66 | NON-COMMUNICATION WORKFLOW (needs enrichment) | — | entry guard / suppression; success/guardrail metrics | Implementation contract + timing rule/default + failure paths |
| INT-119 | Synchronization Conflict Resolution | Operational | 54/80 | 68 | NON-COMMUNICATION WORKFLOW (needs enrichment) | — | deployable wait values | Implementation contract + timing rule/default + failure paths |
| INT-120 | Dependency Degradation Recovery | Operational | 56/80 | 70 | NON-COMMUNICATION WORKFLOW (ready with config) | — | deployable wait values | Implementation contract only |
| INT-269 | Integration Recovery | Communication | 61/90 | 68 | NEEDS ENRICHMENT | HF-CADENCE, HF-CHANNEL-ORDER | deployable wait values; channel order/fallback; collision/frequency rules; failure paths; CTA destination | write the cadence (waits with default + config rule); declare channel policy (primary/fallback/switch); name the CTA destination |
| INT-278 | Integration Setup | Communication | 64/90 | 71 | NEEDS ENRICHMENT | HF-CADENCE, HF-CHANNEL-ORDER | deployable wait values; channel order/fallback; collision/frequency rules; CTA destination | write the cadence (waits with default + config rule); declare channel policy (primary/fallback/switch); name the CTA destination |
| OPS-121 | Asynchronous Work Processing | Operational | 53/80 | 66 | NON-COMMUNICATION WORKFLOW (needs enrichment) | — | deployable wait values; success/guardrail metrics | Implementation contract + timing rule/default + failure paths |
| OPS-122 | Queue Lag Management | Operational | 49/80 | 61 | NON-COMMUNICATION WORKFLOW (needs enrichment) | — | deployable wait values; success/guardrail metrics | Implementation contract + timing rule/default + failure paths |
| OPS-123 | Stalled Work Recovery | Operational | 59/80 | 74 | NON-COMMUNICATION WORKFLOW (ready with config) | — | success/guardrail metrics | Implementation contract only |
| OPS-124 | Retry Management | Operational | 55/80 | 69 | NON-COMMUNICATION WORKFLOW (needs enrichment) | — | deployable wait values; success/guardrail metrics | Implementation contract + timing rule/default + failure paths |
| OPS-125 | Work Deduplication | Operational | 55/80 | 69 | NON-COMMUNICATION WORKFLOW (needs enrichment) | — | failure paths; success/guardrail metrics | Implementation contract + timing rule/default + failure paths |
| OPS-126 | Partial Processing Recovery | Operational | 55/80 | 69 | NON-COMMUNICATION WORKFLOW (needs enrichment) | — | success/guardrail metrics | Implementation contract + timing rule/default + failure paths |
| OPS-127 | Dead-Letter Recovery | Operational | 56/80 | 70 | NON-COMMUNICATION WORKFLOW (ready with config) | — | deployable wait values | Implementation contract only |
| OPS-128 | Worker Failure Recovery | Operational | 55/80 | 69 | NON-COMMUNICATION WORKFLOW (needs enrichment) | — | deployable wait values; failure paths | Implementation contract + timing rule/default + failure paths |
| OPS-129 | Backlog Recovery | Operational | 51/80 | 64 | NON-COMMUNICATION WORKFLOW (needs enrichment) | — | deployable wait values; success/guardrail metrics | Implementation contract + timing rule/default + failure paths |
| OPS-130 | Business Outcome Verification | Operational | 50/80 | 63 | NON-COMMUNICATION WORKFLOW (needs enrichment) | — | deployable wait values; attribute-level data contract; success/guardrail metrics | Implementation contract + timing rule/default + failure paths |
| OWN-51 | Task Assignment | Operational | 58/80 | 73 | NON-COMMUNICATION WORKFLOW (ready with config) | — | success/guardrail metrics | Implementation contract only |
| OWN-52 | Assignment Acceptance | Operational | 49/80 | 61 | NON-COMMUNICATION WORKFLOW (needs enrichment) | — | success/guardrail metrics; idempotency key | Implementation contract + timing rule/default + failure paths |
| OWN-53 | Ownership Context Transfer | Operational | 50/80 | 63 | NON-COMMUNICATION WORKFLOW (needs enrichment) | — | deployable wait values; success/guardrail metrics | Implementation contract + timing rule/default + failure paths |
| OWN-54 | Ownership Transfer | Operational | 50/80 | 63 | NON-COMMUNICATION WORKFLOW (needs enrichment) | — | deployable wait values; success/guardrail metrics; idempotency key | Implementation contract + timing rule/default + failure paths |
| OWN-55 | Ownership Escalation | Operational | 53/80 | 66 | NON-COMMUNICATION WORKFLOW (needs enrichment) | — | deployable wait values; idempotency key | Implementation contract + timing rule/default + failure paths |
| OWN-56 | Approval Request | Operational | 54/80 | 68 | NON-COMMUNICATION WORKFLOW (needs enrichment) | — | deployable wait values; entry guard / suppression | Implementation contract + timing rule/default + failure paths |
| OWN-57 | Multi-Party Approval | Operational | 57/80 | 71 | NON-COMMUNICATION WORKFLOW (ready with config) | — | success/guardrail metrics | Implementation contract only |
| OWN-58 | Re-Approval Request | Operational | 53/80 | 66 | NON-COMMUNICATION WORKFLOW (needs enrichment) | — | deployable wait values | Implementation contract + timing rule/default + failure paths |
| OWN-59 | Approval Re-Entry | Operational | 50/80 | 63 | NON-COMMUNICATION WORKFLOW (needs enrichment) | — | deployable wait values; entry guard / suppression; failure paths; idempotency key | Implementation contract + timing rule/default + failure paths |
| OWN-60 | Approval Owner Update | Operational | 56/80 | 70 | NON-COMMUNICATION WORKFLOW (ready with config) | — | idempotency key | Implementation contract only |
| REL-91 | Relationship Validation | Operational (conceptual) | 57/80 | 71 | NON-COMMUNICATION WORKFLOW (ready with config) | — | failure paths | Add implementation contract (events, attributes, timing rule); keep as workflow |
| REL-92 | Relationship Impact Recalculation | Operational | 54/80 | 68 | NON-COMMUNICATION WORKFLOW (needs enrichment) | — | entry guard / suppression; failure paths; success/guardrail metrics | Implementation contract + timing rule/default + failure paths |
| REL-93 | Entity Relationship End Reconciliation | Operational | 53/80 | 66 | NON-COMMUNICATION WORKFLOW (needs enrichment) | — | failure paths; success/guardrail metrics | Implementation contract + timing rule/default + failure paths |
| REL-94 | Role Authority Update | Operational | 52/80 | 65 | NON-COMMUNICATION WORKFLOW (needs enrichment) | — | failure paths; success/guardrail metrics | Implementation contract + timing rule/default + failure paths |
| REL-95 | Parent State Propagation | Operational | 56/80 | 70 | NON-COMMUNICATION WORKFLOW (ready with config) | — | success/guardrail metrics | Implementation contract only |
| REL-96 | Parent State Aggregation | Operational | 57/80 | 71 | NON-COMMUNICATION WORKFLOW (ready with config) | — | success/guardrail metrics | Implementation contract only |
| REL-97 | Duplicate Entity Assessment | Operational | 51/80 | 64 | NON-COMMUNICATION WORKFLOW (needs enrichment) | — | success/guardrail metrics | Implementation contract + timing rule/default + failure paths |
| REL-98 | Entity Linking | Operational | 52/80 | 65 | NON-COMMUNICATION WORKFLOW (needs enrichment) | — | attribute-level data contract; failure paths | Implementation contract + timing rule/default + failure paths |
| REL-99 | Entity Split | Operational | 53/80 | 66 | NON-COMMUNICATION WORKFLOW (needs enrichment) | — | entry guard / suppression; success/guardrail metrics | Implementation contract + timing rule/default + failure paths |
| REL-100 | Orphan Relationship Recovery | Operational (conceptual) | 56/80 | 70 | NON-COMMUNICATION WORKFLOW (ready with config) | — | — | Add implementation contract (events, attributes, timing rule); keep as workflow |
| REL-284 | Invitation Reminder | Communication | 64/90 | 71 | NEEDS ENRICHMENT | HF-CHANNEL-ORDER | channel order/fallback; failure paths | declare channel policy (primary/fallback/switch) |
| REM-151 | Post-Purchase Issue Recovery | Hybrid | 54/90 | 60 | NEEDS ENRICHMENT | — | deployable wait values; send→wait→recheck sequence; collision/frequency rules; failure paths; success/guardrail metrics; CTA destination; idempotency key | name the CTA destination; add measurement block |
| REM-152 | Return Request | Communication | 54/90 | 60 | NEEDS ENRICHMENT | HF-CADENCE | deployable wait values; collision/frequency rules; success/guardrail metrics; CTA destination; idempotency key | write the cadence (waits with default + config rule); name the CTA destination; add measurement block |
| REM-153 | Return Transit Resolution | Operational | 50/80 | 63 | NON-COMMUNICATION WORKFLOW (needs enrichment) | — | deployable wait values; entry guard / suppression; failure paths; success/guardrail metrics | Implementation contract + timing rule/default + failure paths |
| REM-154 | Return Inspection | Operational (conceptual) | 51/80 | 64 | NON-COMMUNICATION WORKFLOW (needs enrichment) | — | success/guardrail metrics | Add implementation contract (events, attributes, timing rule); keep as workflow |
| REM-155 | Replacement Fulfillment | Operational | 47/80 | 59 | NON-COMMUNICATION WORKFLOW (needs enrichment) | — | entry guard / suppression; success/guardrail metrics; idempotency key | Implementation contract + timing rule/default + failure paths |
| REM-156 | Corrective Reperformance | Operational | 51/80 | 64 | NON-COMMUNICATION WORKFLOW (needs enrichment) | — | entry guard / suppression; success/guardrail metrics | Implementation contract + timing rule/default + failure paths |
| REM-157 | Remedy Confirmation | Communication | 53/90 | 59 | NEEDS ENRICHMENT | HF-CADENCE, HF-CHANNEL-ORDER | deployable wait values; channel order/fallback; entry guard / suppression; collision/frequency rules; failure paths; CTA destination | write the cadence (waits with default + config rule); declare channel policy (primary/fallback/switch); name the CTA destination; add eligibility/suppression guards |
| REM-158 | Remedy Outcome Verification | Operational | 50/80 | 63 | NON-COMMUNICATION WORKFLOW (needs enrichment) | — | deployable wait values; entry guard / suppression; idempotency key | Implementation contract + timing rule/default + failure paths |
| REM-159 | Compensation Eligibility | Operational | 52/80 | 65 | NON-COMMUNICATION WORKFLOW (needs enrichment) | — | deployable wait values; idempotency key | Implementation contract + timing rule/default + failure paths |
| REM-160 | Remedy Recurrence Assessment | Operational | 51/80 | 64 | NON-COMMUNICATION WORKFLOW (needs enrichment) | — | success/guardrail metrics | Implementation contract + timing rule/default + failure paths |
| RET-21 | Engagement Reclassification | Operational (conceptual) | 54/80 | 68 | NON-COMMUNICATION WORKFLOW (needs enrichment) | — | failure paths; success/guardrail metrics | Add implementation contract (events, attributes, timing rule); keep as workflow |
| RET-22 | Usage Gap Assessment | Operational | 52/80 | 65 | NON-COMMUNICATION WORKFLOW (needs enrichment) | — | failure paths; success/guardrail metrics | Implementation contract + timing rule/default + failure paths |
| RET-23 | Health Deterioration Diagnosis | Operational | 58/80 | 73 | NON-COMMUNICATION WORKFLOW (ready with config) | — | deployable wait values; success/guardrail metrics | Implementation contract only |
| RET-24 | Churn Risk Escalation | Operational | 61/80 | 76 | NON-COMMUNICATION WORKFLOW (ready with config) | — | success/guardrail metrics | Implementation contract only |
| RET-26 | Service Recovery | Communication | 60/90 | 67 | NEEDS ENRICHMENT | HF-CHANNEL-ORDER | deployable wait values; send→wait→recheck sequence; channel order/fallback; CTA destination | declare channel policy (primary/fallback/switch); name the CTA destination |
| RET-27 | Recovery Stability Check | Operational | 44/80 | 55 | NON-COMMUNICATION WORKFLOW (needs enrichment) | — | deployable wait values; entry guard / suppression; failure paths; success/guardrail metrics | Implementation contract + timing rule/default + failure paths |
| RET-28 | Cancellation Save | Communication | 63/90 | 70 | NEEDS ENRICHMENT | HF-CHANNEL-ORDER | channel order/fallback; success/guardrail metrics; CTA destination | declare channel policy (primary/fallback/switch); name the CTA destination; add measurement block |
| RET-29 | Cancellation Wind-Down | Operational | 56/80 | 70 | NON-COMMUNICATION WORKFLOW (ready with config) | — | entry guard / suppression; failure paths; success/guardrail metrics | Implementation contract only |
| RET-30 | Retention Offer Follow-Up | Hybrid | 60/90 | 67 | NEEDS ENRICHMENT | HF-CHANNEL-ORDER | deployable wait values; send→wait→recheck sequence; channel order/fallback; entry guard / suppression; CTA destination | declare channel policy (primary/fallback/switch); name the CTA destination; add eligibility/suppression guards |
| RLT-241 | Change Eligibility | Operational (conceptual) | 53/80 | 66 | NON-COMMUNICATION WORKFLOW (needs enrichment) | — | failure paths; success/guardrail metrics | Add implementation contract (events, attributes, timing rule); keep as workflow |
| RLT-242 | Change Readiness | Operational (conceptual) | 52/80 | 65 | NON-COMMUNICATION WORKFLOW (needs enrichment) | — | deployable wait values; failure paths; success/guardrail metrics | Add implementation contract (events, attributes, timing rule); keep as workflow |
| RLT-243 | Scheduled Change Revalidation | Operational | 50/80 | 63 | NON-COMMUNICATION WORKFLOW (needs enrichment) | — | deployable wait values; entry guard / suppression; failure paths; success/guardrail metrics | Implementation contract + timing rule/default + failure paths |
| RLT-244 | Change Execution Verification | Operational | 50/80 | 63 | NON-COMMUNICATION WORKFLOW (needs enrichment) | — | deployable wait values; entry guard / suppression; success/guardrail metrics | Implementation contract + timing rule/default + failure paths |
| RLT-245 | Staged Rollout Expansion | Operational | 52/80 | 65 | NON-COMMUNICATION WORKFLOW (needs enrichment) | — | deployable wait values; success/guardrail metrics | Implementation contract + timing rule/default + failure paths |
| RLT-246 | Rollout Pause Resolution | Operational | 51/80 | 64 | NON-COMMUNICATION WORKFLOW (needs enrichment) | — | entry guard / suppression; failure paths; success/guardrail metrics | Implementation contract + timing rule/default + failure paths |
| RLT-247 | Rollback Decision | Operational | 51/80 | 64 | NON-COMMUNICATION WORKFLOW (needs enrichment) | — | entry guard / suppression; success/guardrail metrics | Implementation contract + timing rule/default + failure paths |
| RLT-248 | Rollback Verification | Operational | 51/80 | 64 | NON-COMMUNICATION WORKFLOW (needs enrichment) | — | deployable wait values; entry guard / suppression | Implementation contract + timing rule/default + failure paths |
| RLT-249 | Target Change Recovery | Operational | 55/80 | 69 | NON-COMMUNICATION WORKFLOW (needs enrichment) | — | success/guardrail metrics | Implementation contract + timing rule/default + failure paths |
| RLT-250 | Change Stability Review | Operational | 51/80 | 64 | NON-COMMUNICATION WORKFLOW (needs enrichment) | — | deployable wait values; failure paths; success/guardrail metrics | Implementation contract + timing rule/default + failure paths |
| RLT-279 | Upgrade Blocker Reminder | Communication | 58/90 | 64 | NEEDS ENRICHMENT | HF-CADENCE, HF-CHANNEL-ORDER | deployable wait values; channel order/fallback; entry guard / suppression; collision/frequency rules; failure paths; CTA destination | write the cadence (waits with default + config rule); declare channel policy (primary/fallback/switch); name the CTA destination; add eligibility/suppression guards |
| RSK-191 | Policy Evaluation | Operational (conceptual) | 59/80 | 74 | NON-COMMUNICATION WORKFLOW (ready with config) | — | success/guardrail metrics | Add implementation contract (events, attributes, timing rule); keep as workflow |
| RSK-192 | Risk Evidence Assessment | Operational | 53/80 | 66 | NON-COMMUNICATION WORKFLOW (needs enrichment) | — | success/guardrail metrics | Implementation contract + timing rule/default + failure paths |
| RSK-193 | Risk Restriction Management | Operational | 52/80 | 65 | NON-COMMUNICATION WORKFLOW (needs enrichment) | — | success/guardrail metrics; idempotency key | Implementation contract + timing rule/default + failure paths |
| RSK-194 | Policy Violation Validation | Operational | 58/80 | 73 | NON-COMMUNICATION WORKFLOW (ready with config) | — | — | Implementation contract only |
| RSK-195 | Compliance Requirement Verification | Operational | 62/80 | 78 | NON-COMMUNICATION WORKFLOW (ready with config) | — | — | Implementation contract only |
| RSK-196 | Compliance Hold Resolution | Operational | 50/80 | 63 | NON-COMMUNICATION WORKFLOW (needs enrichment) | — | success/guardrail metrics; idempotency key | Implementation contract + timing rule/default + failure paths |
| RSK-197 | Policy Exception Review | Operational (conceptual) | 53/80 | 66 | NON-COMMUNICATION WORKFLOW (needs enrichment) | — | success/guardrail metrics; idempotency key | Add implementation contract (events, attributes, timing rule); keep as workflow |
| RSK-198 | Policy Exception Lifecycle | Operational | 54/80 | 68 | NON-COMMUNICATION WORKFLOW (needs enrichment) | — | attribute-level data contract; failure paths; success/guardrail metrics | Implementation contract + timing rule/default + failure paths |
| RSK-199 | Limit Enforcement | Operational | 51/80 | 64 | NON-COMMUNICATION WORKFLOW (needs enrichment) | — | deployable wait values; success/guardrail metrics | Implementation contract + timing rule/default + failure paths |
| RSK-200 | Risk State Recalculation | Operational | 54/80 | 68 | NON-COMMUNICATION WORKFLOW (needs enrichment) | — | success/guardrail metrics | Implementation contract + timing rule/default + failure paths |
| RSK-273 | Usage Limit Alert | Communication | 58/90 | 64 | NEEDS ENRICHMENT | HF-CADENCE, HF-CHANNEL-ORDER | deployable wait values; channel order/fallback; entry guard / suppression; collision/frequency rules; failure paths; success/guardrail metrics; CTA destination | write the cadence (waits with default + config rule); declare channel policy (primary/fallback/switch); name the CTA destination; add measurement block; add eligibility/suppression guards |
| SCH-171 | Availability Evaluation | Operational | 50/80 | 63 | NON-COMMUNICATION WORKFLOW (needs enrichment) | — | attribute-level data contract; failure paths; success/guardrail metrics | Implementation contract + timing rule/default + failure paths |
| SCH-172 | Temporary Slot Hold | Operational | 59/80 | 74 | NON-COMMUNICATION WORKFLOW (ready with config) | — | attribute-level data contract; failure paths | Implementation contract only |
| SCH-173 | Reservation Validation | Operational | 53/80 | 66 | NON-COMMUNICATION WORKFLOW (needs enrichment) | — | deployable wait values; idempotency key | Implementation contract + timing rule/default + failure paths |
| SCH-174 | Reservation Readiness | Operational | 60/80 | 75 | NON-COMMUNICATION WORKFLOW (ready with config) | — | success/guardrail metrics | Implementation contract only |
| SCH-175 | Reschedule Validation | Operational | 54/80 | 68 | NON-COMMUNICATION WORKFLOW (needs enrichment) | — | failure paths; success/guardrail metrics | Implementation contract + timing rule/default + failure paths |
| SCH-176 | Reservation Cancellation Reconciliation | Operational | 54/80 | 68 | NON-COMMUNICATION WORKFLOW (needs enrichment) | — | success/guardrail metrics | Implementation contract + timing rule/default + failure paths |
| SCH-177 | Pre-Service Revalidation | Operational (conceptual) | 53/80 | 66 | NON-COMMUNICATION WORKFLOW (needs enrichment) | — | success/guardrail metrics | Add implementation contract (events, attributes, timing rule); keep as workflow |
| SCH-178 | Service Completion | Operational | 51/80 | 64 | NON-COMMUNICATION WORKFLOW (needs enrichment) | — | deployable wait values; entry guard / suppression | Implementation contract + timing rule/default + failure paths |
| SCH-179 | No-Show Validation | Operational | 58/80 | 73 | NON-COMMUNICATION WORKFLOW (ready with config) | — | success/guardrail metrics | Implementation contract only |
| SCH-180 | Booking Reschedule | Communication | 56/90 | 62 | NEEDS ENRICHMENT | HF-CHANNEL-ORDER | deployable wait values; channel order/fallback; entry guard / suppression; collision/frequency rules; failure paths; success/guardrail metrics; CTA destination | declare channel policy (primary/fallback/switch); name the CTA destination; add measurement block; add eligibility/suppression guards |
| SCH-266 | Appointment Reminder | Communication | 69/90 | 77 | NEEDS ENRICHMENT | HF-CHANNEL-ORDER | channel order/fallback; success/guardrail metrics; CTA destination | declare channel policy (primary/fallback/switch); name the CTA destination; add measurement block |
| SCH-277 | Booking Confirmation | Communication | 61/90 | 68 | NEEDS ENRICHMENT | HF-CHANNEL-ORDER | channel order/fallback; entry guard / suppression; collision/frequency rules; failure paths; success/guardrail metrics; CTA destination | declare channel policy (primary/fallback/switch); name the CTA destination; add measurement block; add eligibility/suppression guards |
| SCH-280 | No-Show Follow-Up | Communication | 62/90 | 69 | NEEDS ENRICHMENT | HF-CADENCE, HF-CHANNEL-ORDER | deployable wait values; channel order/fallback; entry guard / suppression; collision/frequency rules; CTA destination | write the cadence (waits with default + config rule); declare channel policy (primary/fallback/switch); name the CTA destination; add eligibility/suppression guards |
| SCH-282 | Availability Search Abandonment | Communication | 64/90 | 71 | NEEDS ENRICHMENT | HF-CHANNEL-ORDER | channel order/fallback; collision/frequency rules; CTA destination | declare channel policy (primary/fallback/switch); name the CTA destination |
| SUB-161 | Relationship Activation | Operational | 55/80 | 69 | NON-COMMUNICATION WORKFLOW (needs enrichment) | — | failure paths; idempotency key | Implementation contract + timing rule/default + failure paths |
| SUB-162 | Future Activation Revalidation | Operational (conceptual) | 52/80 | 65 | NON-COMMUNICATION WORKFLOW (needs enrichment) | — | deployable wait values; entry guard / suppression; idempotency key | Add implementation contract (events, attributes, timing rule); keep as workflow |
| SUB-163 | Renewal Reminder | Communication | 58/90 | 64 | NEEDS ENRICHMENT | HF-CHANNEL-ORDER | channel order/fallback; success/guardrail metrics; CTA destination | declare channel policy (primary/fallback/switch); name the CTA destination; add measurement block |
| SUB-164 | Renewal Execution | Operational | 50/80 | 63 | NON-COMMUNICATION WORKFLOW (needs enrichment) | — | deployable wait values; success/guardrail metrics; idempotency key | Implementation contract + timing rule/default + failure paths |
| SUB-165 | Renewal Payment Recovery | Operational | 52/80 | 65 | NON-COMMUNICATION WORKFLOW (needs enrichment) | — | success/guardrail metrics; idempotency key | Implementation contract + timing rule/default + failure paths |
| SUB-166 | Plan Change Validation | Operational | 51/80 | 64 | NON-COMMUNICATION WORKFLOW (needs enrichment) | — | deployable wait values; idempotency key | Implementation contract + timing rule/default + failure paths |
| SUB-167 | Cancellation Effective-Date Resolution | Operational (conceptual) | 56/80 | 70 | NON-COMMUNICATION WORKFLOW (ready with config) | — | success/guardrail metrics; idempotency key | Add implementation contract (events, attributes, timing rule); keep as workflow |
| SUB-168 | Scheduled Cancellation Revalidation | Operational (conceptual) | 52/80 | 65 | NON-COMMUNICATION WORKFLOW (needs enrichment) | — | failure paths; success/guardrail metrics | Add implementation contract (events, attributes, timing rule); keep as workflow |
| SUB-169 | Relationship Suspension | Operational | 53/80 | 66 | NON-COMMUNICATION WORKFLOW (needs enrichment) | — | idempotency key | Implementation contract + timing rule/default + failure paths |
| SUB-170 | Continuing Relationship End Reconciliation | Operational | 47/80 | 59 | NON-COMMUNICATION WORKFLOW (needs enrichment) | — | deployable wait values; attribute-level data contract; success/guardrail metrics; idempotency key | Implementation contract + timing rule/default + failure paths |
| SUB-262 | Cancellation Confirmation | Communication | 56/90 | 62 | NEEDS ENRICHMENT | HF-CADENCE, HF-CHANNEL-ORDER | deployable wait values; channel order/fallback; entry guard / suppression; collision/frequency rules; failure paths; success/guardrail metrics; CTA destination | write the cadence (waits with default + config rule); declare channel policy (primary/fallback/switch); name the CTA destination; add measurement block; add eligibility/suppression guards |
| TIM-61 | Deadline Tracking | Hybrid | 62/90 | 69 | NEEDS ENRICHMENT | HF-CHANNEL-ORDER | channel order/fallback; entry guard / suppression; collision/frequency rules; CTA destination | declare channel policy (primary/fallback/switch); name the CTA destination; add eligibility/suppression guards |
| TIM-62 | Overdue State Recalculation | Operational | 57/80 | 71 | NON-COMMUNICATION WORKFLOW (ready with config) | — | success/guardrail metrics | Implementation contract only |
| TIM-63 | Expiry Reminder | Communication | 61/90 | 68 | NEEDS ENRICHMENT | HF-CHANNEL-ORDER | channel order/fallback; failure paths; success/guardrail metrics; CTA destination | declare channel policy (primary/fallback/switch); name the CTA destination; add measurement block |
| TIM-64 | Expiry Validation | Operational | 54/80 | 68 | NON-COMMUNICATION WORKFLOW (needs enrichment) | — | failure paths; success/guardrail metrics | Implementation contract + timing rule/default + failure paths |
| TIM-65 | Grace Period Management | Operational | 51/80 | 64 | NON-COMMUNICATION WORKFLOW (needs enrichment) | — | deployable wait values; entry guard / suppression; failure paths | Implementation contract + timing rule/default + failure paths |
| TIM-66 | Temporary Exception Expiry | Operational | 59/80 | 74 | NON-COMMUNICATION WORKFLOW (ready with config) | — | entry guard / suppression; failure paths | Implementation contract only |
| TIM-67 | Temporary State Expiry | Operational | 54/80 | 68 | NON-COMMUNICATION WORKFLOW (needs enrichment) | — | — | Implementation contract + timing rule/default + failure paths |
| TIM-68 | State Reversal | Operational | 60/80 | 75 | NON-COMMUNICATION WORKFLOW (ready with config) | — | — | Implementation contract only |
| TIM-69 | Expired State Re-Entry | Operational | 55/80 | 69 | NON-COMMUNICATION WORKFLOW (needs enrichment) | — | success/guardrail metrics | Implementation contract + timing rule/default + failure paths |
| TIM-70 | Scheduled Transition Validation | Operational | 51/80 | 64 | NON-COMMUNICATION WORKFLOW (needs enrichment) | — | deployable wait values; failure paths; success/guardrail metrics | Implementation contract + timing rule/default + failure paths |
| TIM-268 | Action Required Reminder | Communication | 65/90 | 72 | NEEDS ENRICHMENT | HF-CHANNEL-ORDER | channel order/fallback; entry guard / suppression; collision/frequency rules; failure paths; CTA destination | declare channel policy (primary/fallback/switch); name the CTA destination; add eligibility/suppression guards |
| TIM-274 | Grace Period Recovery | Communication | 62/90 | 69 | NEEDS ENRICHMENT | HF-CADENCE, HF-CHANNEL-ORDER | deployable wait values; channel order/fallback; entry guard / suppression; collision/frequency rules; failure paths; CTA destination | write the cadence (waits with default + config rule); declare channel policy (primary/fallback/switch); name the CTA destination; add eligibility/suppression guards |
| TIM-281 | Expired Access Recovery | Communication | 61/90 | 68 | NEEDS ENRICHMENT | HF-CHANNEL-ORDER | channel order/fallback; entry guard / suppression; collision/frequency rules; CTA destination | declare channel policy (primary/fallback/switch); name the CTA destination; add eligibility/suppression guards |
| TRM-101 | Entity Merge | Operational | 57/80 | 71 | NON-COMMUNICATION WORKFLOW (ready with config) | — | success/guardrail metrics | Implementation contract only |
| TRM-102 | Merge Conflict Resolution | Operational | 54/80 | 68 | NON-COMMUNICATION WORKFLOW (needs enrichment) | — | deployable wait values | Implementation contract + timing rule/default + failure paths |
| TRM-103 | Account Consolidation | Operational | 58/80 | 73 | NON-COMMUNICATION WORKFLOW (ready with config) | — | success/guardrail metrics | Implementation contract only |
| TRM-104 | Primary Relationship Transfer | Operational | 54/80 | 68 | NON-COMMUNICATION WORKFLOW (needs enrichment) | — | failure paths; success/guardrail metrics | Implementation contract + timing rule/default + failure paths |
| TRM-105 | Responsibility Handover | Operational | 51/80 | 64 | NON-COMMUNICATION WORKFLOW (needs enrichment) | — | deployable wait values; entry guard / suppression; success/guardrail metrics | Implementation contract + timing rule/default + failure paths |
| TRM-106 | Account Closure | Communication | 59/90 | 66 | NEEDS ENRICHMENT | HF-CADENCE, HF-CHANNEL-ORDER | deployable wait values; channel order/fallback; collision/frequency rules; success/guardrail metrics; CTA destination | write the cadence (waits with default + config rule); declare channel policy (primary/fallback/switch); name the CTA destination; add measurement block |
| TRM-107 | Account Closure Reconciliation | Operational | 52/80 | 65 | NON-COMMUNICATION WORKFLOW (needs enrichment) | — | deployable wait values; success/guardrail metrics | Implementation contract + timing rule/default + failure paths |
| TRM-108 | Account Closure Wind-Down | Operational | 48/80 | 60 | NON-COMMUNICATION WORKFLOW (needs enrichment) | — | deployable wait values; entry guard / suppression; success/guardrail metrics | Implementation contract + timing rule/default + failure paths |
| TRM-109 | Data Deletion Validation | Operational | 52/80 | 65 | NON-COMMUNICATION WORKFLOW (needs enrichment) | — | deployable wait values; success/guardrail metrics | Implementation contract + timing rule/default + failure paths |
| TRM-110 | Data Deletion Reconciliation | Operational | 51/80 | 64 | NON-COMMUNICATION WORKFLOW (needs enrichment) | — | deployable wait values; entry guard / suppression; success/guardrail metrics | Implementation contract + timing rule/default + failure paths |
| TRM-275 | Data Deletion Confirmation | Communication | 60/90 | 67 | NEEDS ENRICHMENT | HF-CADENCE | deployable wait values; collision/frequency rules; failure paths; CTA destination | write the cadence (waits with default + config rule); name the CTA destination |

---

## D. Dimension scores

Corpus-level averages over all 281 journeys and over the 67 communication/hybrid journeys; "% below 3" is the share of journeys scoring 0–2 on that dimension (all journeys).

| # | Dimension | Avg (all) | Avg (comm+hybrid) | % below 3 | n |
|--:|---|--:|--:|--:|--:|
| 1 | Trigger precision | 4.39 | 4.64 | 3% | 281 |
| 2 | Eligibility & suppression | 2.88 | 2.70 | 30% | 281 |
| 3 | State model | 3.65 | 4.06 | 0% | 281 |
| 4 | Decision observability | 3.91 | 3.72 | 1% | 281 |
| 5 | Timing & cadence | 2.69 | 2.13 | 44% | 281 |
| 6 | Communication sequencing | 3.39 | 3.39 | 13% | 67 |
| 7 | Channel strategy | 2.37 | 2.37 | 66% | 67 |
| 8 | Behavioral branching | 2.73 | 3.36 | 49% | 281 |
| 9 | Exit completeness | 4.10 | 4.31 | 6% | 281 |
| 10 | Re-entry | 3.96 | 4.18 | 0% | 281 |
| 11 | Frequency/collision safety | 2.04 | 1.45 | 84% | 281 |
| 12 | Data contract | 3.12 | 3.34 | 5% | 281 |
| 13 | Failure handling | 2.88 | 2.70 | 35% | 281 |
| 14 | Idempotency/deduplication | 3.78 | 4.10 | 15% | 281 |
| 15 | Message/action specificity | 3.85 | 3.51 | 1% | 281 |
| 16 | Measurement | 1.32 | 1.51 | 100% | 281 |
| 17 | Portability | 4.96 | 5.00 | 0% | 281 |
| 18 | Production implementability | 3.11 | 3.00 | 5% | 281 |

Weakest dimensions, in order: **16 Measurement (1.32)**, **11 Frequency/collision (2.04)**, **7 Channel strategy (2.37)**, **5 Timing & cadence (2.69)**, **8 Behavioral branching (2.73)**, then 2 Eligibility and 13 Failure handling (2.88). The systemic problem is therefore measurement + collision + channel + timing — all four are missing *fields*, not broken graphs. Strongest: 17 Portability (4.96), 1 Trigger precision (4.39), 9 Exit completeness (4.10), 10 Re-entry (3.96), 4 Decision observability (3.91).

Reading the table: dimensions 5 (timing), 7 (channel), 11 (collision) and 16 (measurement) are the corpus-wide problem — they are low almost everywhere, and they are exactly the four things §H's schema adds. Dimensions 1, 9, 10, 15 and 17 are the corpus-wide strength and need no migration work. Dimension 8 and 13 vary by journey and are where hand review is still needed after the schema lands.

---

## E. Top 20 least implementation-ready journeys

Communication and hybrid journeys, ascending by score. For each: what a practitioner would still have to invent today.

1. **FUL-146 Delivery Delay Alert — 53%, HF-CADENCE + HF-CHANNEL-ORDER.** 19 nodes, three message actions (`a.delay-update`, `a.offer`, `a.no-choice-update`) on `email, sms` with no order; `w.decision` "the decision window" and `w.resume` "the revised horizon" carry no value or rule; the choice message offers "wait, reschedule, an alternative, or cancel" with no destination for any of the four. The practitioner invents: when the first update goes out after the slip, the decision window, which of email/SMS carries a time-sensitive delay, and where the four choices link. The state logic (threshold → choice → resume/escalate) is complete and should be kept.
2. **ACT-15 First Value Milestone — 54%.** 5 nodes, two sends (`a.recognize` then `a.surface`) back-to-back with no wait, no guard, no suppression, no frequency check, three channels, no order. As written it can fire two messages within seconds of an activation event and again on the next first-value event in a different context. Merge candidate into ACT-17 (one message, one wait).
3. **ACT-17 Adoption Nurture — 57%.** One send then `w.observe` "the early-adoption window, set from this product's own intended usage rhythm" — a configuration rule with no default; `email, in-app` unordered; nothing names the next-behaviour destination.
4. **FUL-148 Failed Delivery Recovery — 58%, both HFs.** Good graph (correction → budget → alternatives → route choice) but `w.correction` "the correction window" and `w.route-choice` "the window in which the alternatives are still available" are unvalued; `email, sms` unordered for a same-day operational problem where SMS is obviously primary; the correction message has no destination.
5. **FBK-45 Positive Feedback Follow-Up — 58%.** Single acknowledgement, no wait, no duplicate-ask guard, no cooldown, two channels. Merge candidate with FBK-43's acknowledgement path.
6. **REM-157 Remedy Confirmation — 59%, both HFs.** `w.selection` "the selection window" unvalued; `a.present` presents options with no destination; `email, in-app` unordered.
7. **ACT-19 Onboarding Personalization — 59%.** One question with `w.answer` "a short window" — the one case in the corpus where the wait text argues against its own vagueness ("this is a question in the middle of someone's setup, not a survey") and still gives no value. In-app is obviously primary; not stated.
8. **FBK-43 Feedback Follow-Up — 59%.** 18 nodes; the acknowledgement send has no wait; `w.outcome` "the obligation's own SLA" and `w.followup` "the window in which the promise still means anything" are unvalued; three channels unordered.
9. **IDN-85 Login Verification — 59%.** `a.challenge` on `sms, push, email` with no order — for an OTP/authentication challenge the channel is the mechanism; `w.auth` "the challenge window" unvalued (a default of minutes is uncontroversial here); no attempt budget on the challenge itself (IDN-87 owns failures, but the journey does not say how many challenges).
10. **REM-152 Return Request — 60%, HF-CADENCE.** `w.decision` "the decision SLA" unvalued; authorisation message names "what method" but no return-label/portal destination.
11. **INC-254 Incident Update — 60%.** Correctly delegates the send to the communication mechanism, so the journey file itself has no cadence for "next update bound to a stated condition"; two channels unordered; no measurement of whether affected users were reached.
12. **REM-151 Post-Purchase Issue Recovery — 60%.** Single acknowledgement then exit; no wait on whether the person accepts the explanation; email only (fine) but no destination for "where to escalate".
13. **DOC-220 Document Conflict Review — 60%.** Redistribution message has no destination (which document version link) and no read/acknowledge wait.
14. **FBK-44 Negative Feedback Recovery — 61%.** Acknowledgement then exit or handoff to FBK-46; no wait; three channels unordered.
15. **FIN-137 Refund Request — 61%, HF-CADENCE.** `w.decision` "the decision SLA" unvalued; three sends with no order (email, task) — acceptable pair, but the under-review acknowledgement has no expected-time statement the message could carry.
16. **SUB-262 Cancellation Confirmation — 62%, both HFs.** `w.window` is bound to "the effective end date" (deployable) but `a.ending` "access ends shortly" has no offset ("shortly" = how long before?); two channels unordered; no suppression check against a reactivation already in flight.
17. **FBK-41 Feedback Request — 62%.** `w.completion` "the horizon by which this kind of experience should have completed" and `w.response` "a bounded response window" unvalued; three channels unordered; the request names no survey/form destination.
18. **SCH-180 Booking Reschedule — 62%.** Two sends, two channels unordered; `a.notify-provider-cancel` has no wait on the customer's remedy choice inside this journey (REM-157 owns it, but the handoff is where a practitioner loses the thread).
19. **ACT-20 Dormant Lead Reactivation — 63%.** Conceptually one of the best (one attempt, inspects real state, refuses to count a click as a return) but `w.return` "the reactivation window" is unvalued and `email, push` unordered.
20. **DOC-214 Document Delivery — 63%.** Delegates delivery to the communication mechanism; `w.distribution` "the distribution window the requirement allows" unvalued; no destination for the document itself.

Operational journeys scoring lowest (55–57%): RET-27, INT-114, FIN-132, FIN-135, FUL-142 — all "conceptual state machine" cases whose waits are policy-deferred and whose exits do not name a success. They are valid workflows and are not campaign material.

---

## F. Top 10 strongest journeys

These are the templates. Each already shows the shape the rest should migrate to.

1. **ACC-261 Access Recovery — 80%.** Actionable-vs-inform-only fork; explicit contactability check with handoff to CON-36; `w.resolve` bound to "the stated deadline or review point"; distinct restored/stands/informed exits; single-purpose message text ("what is restricted, what still works, the deadline, and the single condition that lifts it"). Missing only channel order and a measurement block.
2. **FUL-276 Substitution Approval — 78%.** The corpus's best cadence: offer → wait "until one reminder can still be acted on" → one reminder → wait "the remainder of the decision window" → confirm-accept / confirm-decline / lapse, each a message. Explicit "no second reminder". Unreachable handoff to CON-36. Needs values for the two windows and an email/SMS order.
3. **SCH-266 Appointment Reminder — 77%.** Revalidates the booking from authoritative state before sending; prompts prerequisites once; reminder once per occurrence; superseded exit when the booking changes. Model for "re-read before send".
4. **CON-264 Contact Verification — 76%.** Two recipients modelled correctly (old destination alerted, new destination asked); one repeat and no more; dispute path to IDN-89; "the confirmation window defined for this kind of destination" is a configuration rule (needs a default).
5. **FBK-46 Complaint Resolution — 72%.** SLA-timed escalation ladder with "levels remain / exhausted"; explicit route check before asking for confirmation; confirmed vs unconfirmed closure recorded as different facts; competition declared.
6. **TIM-268 Action Required Reminder — 72%.** Recheck before the reminder, deadline-bound wait, one overdue notice, confirmation on discharge; `w.due` is a configuration rule ("the reminder point defined for this kind of obligation").
7. **DEC-267 Adverse Decision Recovery — 72%.** Remediation deadline from policy; cleared / expired / reapply / final all distinct and each a message; explicitly refuses a false path.
8. **ACQ-285 New Lead Welcome — 71%.** Route check before either fulfilment path (added in this pass); permission split; bounded sequence with a stated end; readiness handoff to sales.
9. **ACT-13 Onboarding Blocker Reminder — 71%.** One instance per requirement; self-resolvable vs routed-dependency fork; stop-reminders-immediately on resolution; escalation handoff that suppresses automated reminders.
10. **ACT-14 Onboarding Help — 71%.** Hard entry conditions; already-handled check (now including ACT-13); one offer, one follow-up, one final self-service option, then stop; the primary and secondary CTA destinations are named.

Strongest operational workflows (templates for the implementation contract of internal journeys): IDN-82 (79%), RSK-195 (78%), RET-24 (76%), IDN-83 (76%), ACQ-05 (75%), OPS-124 Retry Management (69% but the reference for idempotency and attempt budgets), FIN-134 Payment Failure Recovery (67% but the reference for failure-class routing and idempotent retry).

---

## G. Begin Checkout — gold-standard canonical specification

**Coverage today:** the live library has no checkout-abandonment journey. The nearest are ACQ-08 (acquisition exit on a reached commercial destination), ACQ-07 (intent decay) and SCH-282 (availability search abandonment — the only "abandonment" journey, in scheduling). The uploaded `canonical-commercial-journeys` archive (28 journeys, not in the repo) proposes ACQ-901 "Recorded intent → abandonment detected" and ACQ-902 "Purchase process started → completion missing → recovery or expiry" on `email, push`, with the same deferred timing ("configured process recovery window"). ACQ-902 is the right seed; below is what it must become.

Three labels are used throughout: **CANONICAL RULE** (stable across implementations), **RECOMMENDED DEFAULT** (a starting value, configurable), **CONFIG_REQUIRED** (no sensible universal default exists).

### Identity

- id: ACQ-2xx (next free) · shortName: **Checkout Abandonment Recovery** · category: acquisition · goal: recovery-retry
- objective: return a person to the *specific* checkout they started, while it is still resumable, without ever claiming a state (reserved stock, held price) the system does not hold.

### Entity — CANONICAL RULE

The **checkout session** (`checkout_id`), not the person. One active instance per `checkout_id`. A person with two open checkouts has two instances; a new `checkout_id` after this one closes is a new instance. Instances for the same person are subject to the frequency rule below, not to mutual suppression.

### Trigger — CANONICAL RULE

`checkout_started` (authoritative: the commerce system recorded a checkout session with ≥1 line item and a resumable state). Requires: `checkout_id`, `person_id` (or a resolvable identity), `cart_value`, `currency`, `line_items[]`, `started_at`, `last_activity_at`, `resume_url`. Insufficient alone: a cart page view; an add-to-cart without entering checkout; a checkout with zero items; a checkout already marked completed, cancelled or expired.

### Eligibility — CANONICAL RULE

All of: identity is resolvable to a person we may contact; the checkout is still resumable in the commerce system; the person is not already inside an active instance for this `checkout_id`; no order has been placed against this checkout; the person is not in a hard-gate state (GLB-31: closed account, fraud/security hold, legal ineligibility, service-recovery pause).

### Suppressions — CANONICAL RULE

Exit or never enter when: `checkout_completed` (any channel, including in-store/phone); `checkout_cancelled` by the person; `checkout_expired` by the system; the cart is emptied; a **newer** `checkout_started` for the same person supersedes this one (the newer instance owns recovery — GLB-30 scope rule); global unsubscribe or purpose-level permission absent for *commercial recovery* messages; a `payment_failed` on this checkout (FIN-134 owns it — a failed payment is not abandonment); an open FBK-46 issue or RET-28 cancellation on the same account (retention-outreach group outranks); contact-pressure cap for the promotional class exhausted (GLB-28). **No action is a valid outcome and is recorded as such.**

### Sequence (timeline)

**T+0 — trigger** `checkout_started`. Record instance; start the abandonment clock from `last_activity_at`, not `started_at` (CANONICAL RULE: activity resets the abandonment clock *before* the first message; nothing extends the window after it).

**T+ first check — RECOMMENDED DEFAULT 30 minutes after last activity**; CONFIG: set from the merchant's median checkout duration (p50 start-to-order), rounded up; never below 10 minutes.
- Re-read authoritative checkout state (GLB-18). Completed → exit `x.converted`. Cancelled/expired/emptied → exit `x.invalid`. Newer checkout for the person → exit `x.superseded`.
- Still resumable → evaluate the send path (permission for commercial recovery, contactability, frequency, delivery window in local time, quiet hours).
- Not sendable → exit `x.suppressed` (recorded with the gate that stopped it).
- **Message 1** — purpose: resume. Content: the checkout is still open; the items in it (real, current); a deep link that reopens *this* `checkout_id` with its state restored; **must not** claim stock is reserved, price is held, or a discount applies unless the commerce system asserts it. No incentive in message 1 (CANONICAL RULE — incentive on first touch trains abandonment).

**Channel policy for message 1** — primary **push or in-app** if the person has an active app session or a valid push token (reason: the intent is minutes old; a low-friction return beats content); fallback **email** (reason: persistent, carries the items); **SMS only if** the person has explicit SMS permission for commercial messages *and* the checkout has a time-bound element the system asserts (a hold expiry, a delivery cut-off). Never more than one channel for message 1. CONFIG_REQUIRED: which channels the merchant has and the permission model each carries.

**T+ second check — RECOMMENDED DEFAULT 24 hours after message 1**; CONFIG: shorten for perishable/time-boxed carts (e.g. events, travel) to the resumable window minus a margin.
- Re-read state exactly as above; the same four exits.
- Still resumable and no `checkout_resumed` session since message 1 → **Message 2** on the *next eligible channel not used for message 1* (email if push was used; if email was used, email again only if no other channel is eligible). Purpose: address the likely blocker — shipping/returns/trust information or a question channel. Still no claim about stock. Incentive: CONFIG_REQUIRED (policy decides whether, for whom and how much; the canonical rule is only that an incentive, if any, appears at the *last* touch, once, and is recorded against the person so it cannot be re-issued on the next checkout).
- `checkout_resumed` since message 1 but not completed → do **not** send message 2 yet; wait one further period (RECOMMENDED DEFAULT: the first-check interval) then re-evaluate — a person who came back and left again is deciding, not forgetting.

**T+ final check — RECOMMENDED DEFAULT 72 hours after trigger** (CONFIG: the merchant's resumable-checkout lifetime, or 7 days, whichever is shorter).
- Re-read state. Completed → `x.converted`. Otherwise **Message 3 is optional** (CONFIG: on/off): the last honest statement — the checkout closes at `<real expiry>`, here is the link. Sent only if the expiry is real.
- Then exit `x.lapsed`.

**Response handling — CANONICAL RULE.** The only signals that change state are business events: `checkout_completed`, `checkout_resumed` (an authenticated session on the checkout), `checkout_cancelled`, `cart_emptied`, `checkout_expired`, `payment_failed`. Message opens and clicks are recorded as engagement evidence and change nothing about the cadence. A click that lands on an expired `resume_url` is a **failure path**: the link target must resolve to the person's current cart (or an empty-cart page that says the checkout closed), never a 404.

**Delivery failure — CANONICAL RULE.** Hand off to CMS-208 with the message stage; a bounced or invalid destination for message 1 makes the fallback channel eligible for message 1 (not message 2), once. Contactability loss → CON-36.

### Exits

| Exit | Class | Re-entry |
|---|---|---|
| `x.converted` — order placed against this checkout | success | a new `checkout_id` |
| `x.invalid` — cancelled, emptied or expired by the system | invalid-state | a new `checkout_id` |
| `x.superseded` — a newer checkout for the same person | handoff to the newer instance | none for this id |
| `x.suppressed` — a send gate stopped every message | suppression | the gate clearing does not resume; a new `checkout_id` |
| `x.lapsed` — final window passed | timeout | a new `checkout_id`, subject to cooldown |
| `h.payment` — `payment_failed` on this checkout | handoff to FIN-134 | — |

### Re-entry and frequency — CANONICAL RULE + defaults

One active instance per `checkout_id`; instances per person unlimited but the *person* receives at most one abandonment recovery message per day across instances (RECOMMENDED DEFAULT; CONFIG). Cooldown after `x.lapsed` or `x.suppressed`: a new checkout by the same person within the cooldown enters silently (state tracked, no message) — RECOMMENDED DEFAULT 7 days; CONFIG. Priority class: *promotional-recovery* (below transactional, service and retention-outreach; above generic promotion).

### Idempotency — CANONICAL RULE

Message key: `checkout_id + stage`. A retry of any stage with the same key is absorbed. Incentive issuance key: `person_id + incentive_type` for the cooldown period.

### Implementation contract

- Required events: `checkout_started`, `checkout_resumed`, `checkout_completed`, `checkout_cancelled`, `checkout_expired`, `cart_emptied`, `payment_failed`
- Required attributes: `checkout_id`, `person_id`, `cart_value`, `currency`, `line_items[]`, `started_at`, `last_activity_at`, `resume_url`, `expires_at` (nullable)
- Optional attributes: `product_category`, `customer_segment`, `has_active_app_session`, `preferred_channel`, `hold_expires_at`, `delivery_cutoff_at`
- Required capabilities: delayed execution with cancellation on event; event-driven exit; consent lookup by purpose; contactability lookup; frequency counter per person per class; deep link generation bound to `checkout_id`
- Success event: `checkout_completed` (attributed only if it occurs after entry and before `x.lapsed`)

### Measurement

- Primary: `checkout_completed` rate of entered instances, versus holdout
- Secondary: `checkout_resumed` within the window; time from message 1 to completion
- Guardrails: unsubscribe and complaint rate on the recovery purpose; incentive issuance rate; messages sent to already-completed checkouts (must be 0 — it measures the recheck)
- Operational: entry volume; suppression rate by gate; channel used for message 1; branch distribution at each check
- Holdout: **required** — abandonment recovery is the classic case where the treated group converts anyway; RECOMMENDED DEFAULT 10% persistent holdout per person, CONFIG.

This specification has 4 rechecks, 3 messages, 6 exits, 1 handoff and ~14 nodes in the current schema; with §H's fields most of the text above becomes data rather than prose.

---

## H. Proposed canonical schema vNext

Principle: add only fields that close an observed gap; keep the graph the source of truth; keep numbers out of the graph and inside `recommendedDefault`/`config` where they are labelled as such.

```ts
interface CanonicalJourney {
  // existing: id, slug, category, goal, channels, name, shortName, purpose,
  //           entity, distinctFrom, entry, nodes, preemptedBy, competition,
  //           guardrails, reusableRule
  objective: string;                       // B3 – the business behaviour to cause/protect, one sentence
  entity: { scope: string; note: string;
            instanceKey: string[];         // B12 – e.g. ["person_id","checkout_id"]
            concurrency: "one-active-per-key" | "many" };
  eligibility: string[];                   // B6 – what must be true at entry, incl. global gates by reference
  suppressions: string[];                  // B6 – who must never enter / must exit
  priority: "transactional" | "service" | "retention" | "lifecycle" | "promotional"; // B4
  frequency?: { localCap?: Config; cooldown?: Config; pressureClass: ContactPressureCapClass }; // B4
  implementation: {                        // B5
    requiredEvents: string[]; requiredAttributes: string[]; optionalAttributes?: string[];
    requiredCapabilities: Capability[];    // "delayed-execution" | "event-cancellation" | "consent-lookup" | ...
  };
  measurement: {                           // B3 – event names only, never targets
    primary: string; secondary?: string[]; guardrails: string[]; operational?: string[];
    holdout: "required" | "recommended" | "not-applicable";
  };
}

type Config = { rule: string; recommendedDefault?: string; configKey: string }; // B1 – "CONFIG_REQUIRED" when no default

interface WaitNode {
  // existing: id, until, onEvent, onTimeout, windowExtendsOnEngagement
  timeout: { after: Config; reason: string; relativeTo: "trigger" | "previous-action" | "attribute" };
  recheck?: string;                        // B9 – the authoritative state re-read before acting on timeout
  cancelOn?: string[];                     // B9 – events that cancel the timer (mirrors `until`, machine-readable)
}

interface ActionNode {
  // existing: id, does, writes, next, execution
  channelPolicy?: {                        // B2 – only on execution: "communication"
    primary: ChannelId; reason: string; fallback: ChannelId[]; escalation?: { channel: ChannelId; onlyIf: string };
    simultaneous: boolean; inSessionOnly?: boolean; urgency: "immediate" | "same-day" | "durable";
  };
  destination?: { target: string; boundTo: string; mustNotClaim?: string[] }; // B7
  idempotencyKey?: string;                 // B11 – on any action with external side effects
  attemptBudget?: Config;                  // B13 – on retries/reminders (GLB-24 made local)
}

interface ExitNode {
  // existing: id, state, terminal, reEntry
  class: "success" | "invalid-state" | "suppression" | "timeout" | "failure"; // §12 – handoffs are their own kind
}

interface HandoffNode {
  // existing: id, to, on, carries, suppresses
  contract?: { requiredFields: string[] }; // B5/B8 – what the receiver needs, machine-readable
}
```

Fields deliberately **not** added: per-node `channel` (routing stays CMS-204's; the policy is its input), numeric ranks for competition (GLB-02 forbids invented tie-breaks), message copy, monetary thresholds, vendor names. `external:*` targets get a contract entry in `global.ts` rather than a new node kind.

Validator additions are in §L.

---

## I. Migration impact

| Work | Journeys | Basis |
|---|---|---|
| Metadata-only enrichment (`objective`, `eligibility`, `suppressions`, `priority`, `implementation`, `measurement`, `entity.instanceKey`, exit `class`) | **281** | every journey lacks all of these fields |
| Timing changes (a `Config` on each wait: rule + default or CONFIG_REQUIRED) | **172** journeys / 209 waits — 141 waits need rule *and* default, 33 need a default, 35 need only `relativeTo` | B1 |
| Channel orchestration (`channelPolicy` on communication actions) | **67** journeys / 159 communication actions; 51 of the journeys currently hard-fail on it | B2 |
| CTA destinations | 64 of 67 communication/hybrid journeys | B7 |
| Node changes (a recheck before a timeout-driven send; a response condition after a send; a suppression guard at entry) | ~40 communication/hybrid journeys — the 23 HF-CADENCE plus the 9 single-fire and the 8 with no entry guard | B6, B9 |
| Structural rewrite | **0** | no graph-model defect found |
| Merge / split candidates | 9: ACT-15→ACT-17 (merge); FBK-43/FBK-44/FBK-45/REM-151 acknowledgement paths (one "acknowledge feedback" journey with a type fork); DEC-182/DEC-189/OWN-55 (three escalation journeys whose `distinctFrom` text is the only thing separating them); FUL-146 (split "delay alert" from "delay choice"); SCH-282 + archived SCH-902 (same subject) | hand review |
| `external:*` contracts to write | 30 targets / 81 handoffs | B8 |
| New journeys genuinely missing | **7** — see coverage table | §26 |

### Coverage of the brief's high-value use cases

| Use case | Status | Canonical coverage |
|---|---|---|
| Browse abandonment | **gap** | none (archive ACQ-903 "unresolved interest pattern" is a candidate) |
| Product view abandonment | **gap** | none (archive ACQ-903) |
| Search abandonment | partial | SCH-282 covers *availability* search only |
| Add-to-cart abandonment | **gap** | none (archive ACQ-901 "recorded intent → abandonment") |
| Begin-checkout abandonment / checkout recovery | **gap** | none — §G; archive ACQ-902 is the seed |
| Lead follow-up | covered | ACQ-02/04/05/09/10/285 |
| Quote abandonment | **gap** | none |
| Application abandonment | naming | TIM-61 + DEC-181 cover the deadline/decision halves; no application-specific entry |
| Incomplete registration | **gap** | none (IDN-81 verifies; nothing recovers a half-finished sign-up) |
| Verification abandonment | covered | IDN-81/84, CON-264 |
| Onboarding progression / inactivity | covered | ACT-11/12/13/14/19, ACT-18 |
| First-value activation, feature adoption | covered | ACT-15/16/17 |
| Usage drop | covered | RET-21/22, ACT-18 |
| Payment failure | covered | FIN-134 (+FIN-132/135, SUB-165) |
| Renewal, expiry | covered | SUB-163, TIM-63/64/69 |
| Cancellation, churn prevention | covered | RET-28/29, RET-24 |
| Win-back | naming | ACT-20 explicitly *excludes* previously-paid relationships (`x.winback: out of scope; belongs to win-back`) — the win-back journey it points at does not exist: **gap** |
| Replenishment | **gap** | none (archive RET-904 is a candidate) |
| Post-purchase, delivery | covered | FUL-141…150, FUL-265/146/148 |
| Review request, referral | covered | FBK-41/42/45 |
| Appointment, no-show | covered | SCH-17x, SCH-266/277/280 |
| Service recovery | covered | RET-26, INC-256 |

True gaps: 7 (browse, product-view, add-to-cart, begin-checkout, quote, incomplete registration, replenishment) plus win-back, which the corpus itself names as missing. Naming/discoverability gaps: 12 (a practitioner searching "dunning", "abandonment", "OTP", "NPS", "win-back", "churn", "reactivation", "nurture", "welcome", "reminder", "confirmation", "escalation" finds the journey only some of the time; `shortName` fixed part of this, an alias field would fix the rest).

---

## J. Recommended remediation plan

Derived from the findings: the corpus needs a *layer*, not a rewrite, and the layer must be validated by machine or it will drift exactly as the recipes did.

**Phase 1 — Schema vNext and validator (blocks everything else).** Add the fields in §H to `types.ts` as optional; extend `validate-canonical.mjs` with the machine rules in §L as *warnings* first; add a readiness report (`scores.json` from this audit, regenerated by the validator) so migration progress is a number. Deliverable: schema, validator, baseline report. No journey content changes.

**Phase 2 — Timing defaults by pattern class.** Define ~12 wait classes (abandonment first check, reminder-before-deadline, confirmation window, decision SLA, correction window, response window, cooldown, grace, investigation window, review horizon, retry backoff, distribution window) with a rule, a recommended default and a config key each, in `global.ts`. Re-author the 141 vague waits to reference a class; give the 33 config-rule waits a default. This single phase moves dimension 5 from 2.69 to ≥4 for the whole corpus.

**Phase 3 — Reference journeys (the gold standard, in the repo).** Write §G's Checkout Abandonment Recovery as the first vNext-complete journey, then upgrade the ten strongest (§F) to full vNext. These are the templates; nothing else is migrated until they pass the validator with zero warnings and have been implemented once, for real, in one orchestration platform, to prove the contract is sufficient.

**Phase 4 — Communication journeys.** Migrate the remaining 57 communication/hybrid journeys: `channelPolicy` and `destination` on 159 communication actions; `eligibility`/`suppressions`; the ~40 node changes (entry guard, post-send response condition, recheck-before-timeout-send); `measurement`. Merge ACT-15 into ACT-17 and consolidate the four acknowledgement journeys here.

**Phase 5 — Collision framework.** Assign `priority` and pressure class to all 281; extend `competition` to every communication/hybrid journey (today 14); write the frequency defaults per class; write the 30 `external:*` contracts or replace them. Add FIN-134 to a contest group.

**Phase 6 — Operational journeys.** `implementation` and `measurement` blocks on the 214 workflows; `insufficientAlone` on the 94 triggers that lack it; `idempotencyKey` on the 51 journeys with transactional actions; `attemptBudget` on the 3 uncapped loops. These are metadata passes and can be batched by category.

**Phase 7 — New journeys.** The 7 true gaps, using the archive's 28 candidates as raw material (they carry the same deferred-timing defect and must be authored against vNext, not imported).

**Phase 8 — Promote validator warnings to errors; regenerate recipes from the schema.** The implementation-recipe document becomes a build artefact of the vNext fields, never hand-maintained.

Sequencing rationale: Phase 2 before Phase 4 because timing defaults are shared across journeys and authoring them per journey would invent 141 numbers; Phase 3 before 4 because an unproven contract migrated 57 times is the recipes mistake repeated.

---

## K. Readiness-class rationale and scoring notes

- **Type** is structural: message channel present + (≥2 communication actions or communication ≥40% of actions) → Communication; message channel present otherwise → Hybrid; no message channel → Operational (marked *conceptual* when every action is bookkeeping, no human action, no external system).
- **Hard fails** are machine-detected and were hand-verified: HF-CADENCE (23) and HF-CHANNEL-ORDER (51). Two candidate hard-fail classes were withdrawn after reading the evidence: "unbounded loop" (all 34 cycles exit on a timeout; the remaining concern is the missing iteration cap, B13) and "duplicate transactional action" (GLB-12/19/20 apply library-wide; the detector's remaining hits were `capture` used as "record").
- **Classes**: READY ≥80% with no hard fail (none reached it); READY WITH CONFIG 65–79% with no hard fail; NEEDS ENRICHMENT any hard fail or 50–64%; STRUCTURAL REWORK reserved for graph-model defects (none) or <50% (none); operational journeys carry their own sub-class in parentheses and are not evaluated as campaigns.
- **Known limits of the scorer**: dimension 15 (message specificity) rewards length and directive verbs, which the corpus has uniformly, so it does not discriminate; dimension 8 undercounts journeys that model responses through a condition rather than a wait; dimension 12 gives +1 for a non-log `writes` field, which only 46 actions have. None of these limits changes the ranking of the four weakest dimensions.

---

## L. Automated journey linting (proposed)

### Machine-checkable rules (add to `validate-canonical.mjs`)

| Rule | Detects | Severity |
|---|---|---|
| `wait_timeout_unvalued` | `timeout.after` has no `Config` (no rule, no default/config key) | error after Phase 2 |
| `wait_no_recheck` | a wait whose `onTimeout` reaches a communication action with no `recheck` | error |
| `wait_no_cancel` | `cancelOn` empty while `until` names a business outcome | warning |
| `comm_no_channel_policy` | `execution: "communication"` on a journey with >1 message channel and no `channelPolicy` | error |
| `comm_channel_not_declared` | `channelPolicy.primary`/`fallback` not in `journey.channels` | error |
| `comm_no_destination` | communication action with a CTA verb (open, resume, update, confirm, choose) and no `destination` | warning |
| `comm_after_success` | a communication action reachable from a branch whose `when` matches the journey's `measurement.primary` event | error |
| `send_no_wait` | ≥2 communication actions with no wait between them and `simultaneous` not set | error |
| `entry_no_guard` | communication journey whose first two nodes after the trigger contain no condition and `eligibility` is empty | warning |
| `no_suppressions` | communication journey with empty `suppressions` | error |
| `exit_unclassified` | exit without `class`; journey with no `success` exit and no handoff | error |
| `reentry_no_instance_key` | `entity.instanceKey` empty | error |
| `loop_uncapped` | cycle containing a wait with no `attemptBudget` on the loop and no absolute-deadline `relativeTo: "attribute"` | error |
| `tx_no_idempotency` | action whose `does` matches refund/charge/create-task/approve/delete and no `idempotencyKey` | error |
| `no_measurement` | `measurement.primary` absent, or not an event present in the graph | error |
| `no_priority` / `no_pressure_class` | journey without `priority` / frequency class | error |
| `external_target_uncontracted` | `external:*` handoff with no contract entry in `global.ts` | error |
| `trigger_no_negative_evidence` | `insufficientAlone` empty | warning (error for communication journeys) |
| `engagement_as_outcome` | `until`/`when` text matching open/click/read without `recorded as engagement` | error |
| `vague_condition` | branch `when` matching judgement vocabulary and no observable-state vocabulary | warning |
| `default_without_config_key` | `recommendedDefault` present, `configKey` absent | error |

### Human-review rules (cannot be linted)

- Is the recommended default sensible for this pattern class, and is the configuration rule the one a merchant can actually measure?
- Does the channel policy's `reason` justify the primary channel for *this* message's urgency, or was it copied?
- Does the message brief state what must **not** be claimed?
- Is the entity the right unit (session vs person vs account), and would two concurrent instances be correct or a duplicate?
- Is the loop's bound a real business bound or a hope?
- Is this journey distinct from its `distinctFrom` neighbours in *behaviour*, not only in prose (the DEC-182/189/OWN-55 test)?
- Would a practitioner delete this branch during implementation? If yes, why is it canonical?

---

## M. Answer to the final question

*If a CRM/lifecycle manager downloads this repository today, how much work remains?* For any of the 67 communication/hybrid journeys: map the trigger and the entity (an hour), then **design** the cadence, the channel order, the destinations, the suppressions and the success metric themselves — typically a day per journey, and it will differ between two teams implementing the same journey. For the 214 operational workflows: the state logic is implementable as written; the implementer supplies attribute names, SLAs and an idempotency key. After Phases 1–5 the same manager maps events, attributes, consent and channels, sets roughly a dozen configuration values against stated defaults, and does not design the journey. That is the bar, and the corpus is one layer away from it.

---

*Artefacts produced by this audit (scratch, not committed): `score.mjs` (scorer), `scores.json` (281 rows × 18 dimensions), `stats.json`, `frag-*.md`. No corpus file, schema or generated artefact was modified.*
