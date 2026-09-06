# Journey Library — vNext Architecture Decision Record

Date: 2026-09-01 · Corpus at `1297468` · Second-pass review of `JOURNEY_IMPLEMENTATION_AUDIT.md` · No corpus file changed in this pass

**What this document decides.** What the library is a library *of*, how it is organised as a product, the final vNext schema with one source of truth per concern, the orchestration/timing/channel/collision/measurement/discovery models, coverage and merge decisions tested by behavioural equivalence, three fully specified reference journeys, a portability test, a recalculated migration impact and a gated plan. It ends with explicit answers to the eight decision questions.

**Evidence base.** The 281-journey canonical dump, the first-pass scorer (`scores.json`), a surface-assignment pass over every journey (`surfaces.json`), a clustering of all 209 wait timeouts, a dependency walk from communicating journeys into the rest of the corpus, and full reads of the merge candidates (DEC-182, DEC-189, OWN-55, FBK-43/44/45, ACT-15/17, FUL-146), the payment and scheduling neighbourhoods (FIN-134, SUB-165, TIM-65, ACC-78, SCH-266/277/280/174/177), the collision mechanisms (GLB-24/27/28/31, CON-34/36/39, CMS-203/204/205/210) and the 28-journey commercial archive's abandonment family. Numbers are computed; estimates are labelled as estimates.

---

## A. Final verdict on the previous audit

| Previous conclusion | Verdict | Rationale |
|---|---|---|
| The 281 graphs are structurally sound | **KEEP** | Re-verified: every wait two-armed, no engagement-extended window, no open/click branching, 517/517 exits carry re-entry, 34 cycles all exit on timeout. Nothing found in this pass changes it. |
| "The corpus needs a layer, not a rewrite" | **MODIFY** | True of the *graph* and the *specification*; false of the *product* and *coverage*. Four separate verdicts are given in §B: graph = sound; specification = missing layer; product organisation = restructure; coverage = 5 new canonical journeys plus presets. Collapsing these into "a layer" was the audit's main error. |
| Type split: 49 communication / 18 hybrid / 214 operational | **MODIFY** | The split was correct as a *structural* classification and wrong as a *product* classification. 67 of the 214 "operational" journeys are silent customer-lifecycle states (ACQ-07 Intent Decay, ACQ-08 Acquisition Exit, TIM-65 Grace Period, SUB-165 Renewal Payment Recovery, SCH-174 Reservation Readiness …) that a customer journey depends on and a practitioner must see beside it; 24 are runtime mechanisms (the CMS send path, contactability, cooldown, retry) that are not journeys at all. Final: 133 customer / 24 mechanism / 124 operational (§B). |
| P0: timing has no values or defaults (0/209) | **KEEP** | Re-measured, unchanged. The proposed fix (a flat `Config` with one default) is **MODIFIED**: defaults become ranges with confidence and basis, classes are reduced from 12 to 9 and typed by what they are relative to (§I). |
| P0: channel strategy is a set, not a policy (51/56) | **KEEP** finding, **REJECT** fix | `ActionNode.channelPolicy` would put channel logic on the executable node with no journey-level strategy above it and no way to state "low-friction first, urgent only near a real deadline". Replaced by a journey-level `channelStrategy` of *roles* and a per-touch `channelRole` (§J). Actions carry no channel fields. |
| P0: no measurement layer | **KEEP** finding, **MODIFY** fix | `primary` as a bare event does not define attribution; two companies would measure different things. `outcome` becomes event + unit + window + attribution + comparison (§L). |
| vNext schema (fields on journey/wait/action/exit/handoff) | **MODIFY** | Kept: eligibility, suppressions, priority, frequency, implementation, measurement, `Config` on timeouts, exit class, idempotency key. Rejected: `ActionNode.channelPolicy`, `ActionNode.destination`, free-text `requiredEvents`, authored `requiredCapabilities`. Added: `orchestration` (journey-level touch plan referencing graph nodes), `channelStrategy`, semantic-event registry, `discovery` (aliases/use cases/presets), `contact` block. Duplication removed by reference and derivation (§F, §G). |
| Begin Checkout gold standard | **MODIFY heavily** | It promoted strategy to canonical rule ("never below 10 minutes", "no incentive in message 1", "one message per day", "7-day cooldown") and contradicted itself on instance identity (per-`checkout_id` *and* newer-supersedes-older). Rewritten in §Q with the four-way taxonomy and a business-object identity model. |
| Twelve timing classes | **MODIFY** | Clustering all 209 timeouts (§I) shows 12 named classes cover 139 and leave 70 unclassified because the list mixed *what a wait is relative to* with *what business context it serves*. Final: 9 classes on the first axis; business context is carried by `applicableWhen`, not by more classes. |
| Merge candidates: DEC-182/DEC-189/OWN-55 | **REJECT** | Read in full. Different entities (decision-case ownership / decision authority / work blocker with ownership retained), different outcomes (accepted-or-reassigned / decided-or-returned-with-direction / unblocked-or-closed), different re-entry. Their `distinctFrom` text is accurate. Keep all three. |
| Merge candidates: FBK-43/44/45/REM-151 | **MODIFY** | FBK-44 and FBK-45 pass the equivalence test against FBK-43 (same entity, same trigger family, one acknowledgement, same suppression, same re-entry; only the handoff target differs by valence) → fold both into FBK-43 as valence branches. REM-151 fails it (entity is a fulfilment with a reported problem; outcome is a remedy decision) → keep. |
| Merge candidate: ACT-15 → ACT-17 | **KEEP** | Passes: same entity, ACT-15 always hands to ACT-17, no timing of its own, no independent exit. ACT-17 gains first-value as a second entry evidence. |
| Split candidate: FUL-146 | **REJECT** | One obligation, one entity lifecycle; the 19 nodes are two *touches* (delay update; choice offer) in one orchestration, which the touch plan makes legible without a split. |
| 7 true coverage gaps + win-back | **MODIFY** | Re-tested by behavioural equivalence against the archive's abandonment family (§N): 5 new canonical journeys, 10 practitioner presets, 12 aliases. Browse/product-view/search/quote/application/registration are presets, not canonical journeys. |
| Migration plan (8 phases, no gates) | **REJECT** | Replaced by 6 gated phases with acceptance criteria (§S). The previous plan would have migrated 57 communication journeys before proving the schema on three. |
| Lint rules | **MODIFY** | Extended with drift, touch, taxonomy and duplication checks (§T). |
| Scorer / readiness classes | **MODIFY** | One readiness standard for customer journeys and a different one for operational workflows (§C, §D); dimensions 6/7/16 are not applied to workflows at all. |

---

## B. Product architecture decision

### The four verdicts, kept separate

| Question | Verdict | Evidence |
|---|---|---|
| **Graph architecture** — are the state machines sound? | **Sound.** No rewrite. | §A row 1 |
| **Journey specification** — is implementation metadata missing? | **Missing.** Timing values, channel policy, touch plan, suppressions, measurement, aliases. | Audit B1–B7, re-verified |
| **Product architecture** — are the right things first-class journeys? | **No.** 281 undifferentiated "journeys" hide a 133-journey customer library inside a 281-item state-machine catalogue, and present the send path (CMS-201…210) as nine "journeys" nobody will run. | surfaces.json: 66 communicating + 67 silent customer states + 24 mechanisms + 124 operational |
| **Coverage architecture** — does it contain what a lifecycle marketer searches for? | **Not yet.** The five highest-volume lifecycle patterns (checkout, cart, interest, replenishment, win-back) are absent; twelve present patterns are unfindable by their practitioner names. | §N |

### Options evaluated

**Option A — one unified library.** Practitioner argument: every customer journey hands off into operational machinery (28 of the 67 silent states and 15 operational workflows are direct handoff targets of communicating journeys; the transitive closure is 85 journeys), so a single graph of everything is the honest model. Verdict: honest for *engineers*, wrong for *discovery*. A lifecycle manager opening a 281-item list in which "Retry Management", "Data Parsing" and "Cart Abandonment" are peers will not find the 66 things they came for. The dependency argument is answered by cross-surface links, not by one list.

**Option B — one repository, two explicit libraries sharing primitives.** Customer Journeys and Operational Workflows, same graph schema, different quality standards, different discovery, different UI. Verdict: **adopted, with one refinement** — a third, non-product layer.

**Option C — communication library as the primary product; operational workflows demoted to supporting patterns.** Verdict: half right. The *send path* and *retry/reconciliation* mechanisms genuinely are supporting infrastructure and should stop being presented as journeys. But the 124 operational workflows (approval routing, ownership transfer, deprovisioning, incident processing, data migration) have real users — operations and engineering teams — and are not "supporting patterns" of a marketing library. Demoting them would discard a product to flatter another.

**Option D (adopted) — Option B plus a Runtime Mechanisms layer.**

| Surface | Count | What it holds | Presented as |
|---|---|---|---|
| **Customer Journeys** | **133** | 66 communicating journeys (49 communication + 17 hybrid) and 67 silent customer-lifecycle states whose entity is a person, account, relationship, obligation, booking or order (ACQ-01…08/10, ACT-11/16, RET-21…24/27/29, CON-31/32/33/38, TIM-62/65, ACC-71/78/79, IDN-87…90, REL-91…94/100, TRM-105/107/108, FIN-131/136, FUL-141…150, REM-156, SUB-161…170, SCH-172…179, FBK-48/50) | The primary product. Cards lead with the practitioner view (§M, §19 of the brief); silent states render as "lifecycle states" with no touch plan, linked from the journeys that depend on them. |
| **Runtime Mechanisms** | **24** | CMS-201…208/210 (the send path), CON-34/35/36/39/40 (frequency, permission sync, contactability, cooldown, reconciliation), OPS-121…130 (execution, retry, dead-letter, backlog, outcome verification) | Not journeys. Rendered as the *contract* every customer journey runs on — one page per mechanism, referenced from the touch plan ("delivery failure → CMS-208"). Migrated to a contract format, never given a touch plan or aliases. |
| **Operational Workflows** | **124** | ownership (10), decision (9), data (10), document (7), control (8), rollout (10), incident (9), integration (10), risk (10), structure (5), terminal (6), access (7), time (6), financial (6), remedy (6), identity (3), subscription (1), scheduling (1) | The second product, for operations and engineering. Same graph, its own readiness standard (§D), its own list, no channel/touch/uplift dimensions. |

The assignment rule is mechanical and re-runnable: mechanism ⇐ explicit list; customer ⇐ has a message channel, **or** is in a customer-lifecycle category *and* names a person/account/relationship/obligation/booking/order as its entity; operational ⇐ the rest. **Surface is always derived by this rule and never authored** (Gate 0.5G): there is no override field; a journey that lands on the wrong surface is fixed by correcting its category or its entity scope, which are the facts the rule reads. The mechanism list is a constant in `index.ts`, versioned with the corpus. Fifteen operational workflows are direct handoff targets of customer journeys (OWN-51/55, DEC-181/183/189, TIM-64, IDN-86, INT-111, FIN-138, REM-153/155/159, SUB-164, DOC-216, RLT-242); these render as cross-surface links with the receiving workflow's contract, not as customer journeys.

**Why this and not fewer surfaces.** The website already split the corpus into "communication" (84) and "internal" (197) by the presence of a channel. That split is wrong in both directions: it files Payment Failure Recovery's *relationship-state* twin (SUB-165) and Grace Period (TIM-65) as "internal" beside Data Parsing, and it files the send path's own delivery-recovery step (CMS-208) as a "communication journey". The three-way assignment fixes both errors with one rule.

---

## C. Definition of a canonical Customer Journey

> A **canonical Customer Journey** is a portable state machine whose entity is a person, account or relationship (or an obligation, booking, order or process *belonging to one*), whose purpose is to move that relationship's state — by communicating with the person, routing work to a human on their behalf, or silently recording a lifecycle state that other journeys act on — and which is specified completely enough that an adopting company maps events, attributes, consent and channels and sets configuration values **without designing the trigger semantics, instance model, eligibility, suppressions, touch sequence, recheck points, cancellation events, channel roles, fallbacks, destinations, exits, re-entry, collision behaviour or success definition itself.**

Two sub-kinds, same schema: **communicating** (≥1 communication or human action; carries `orchestration`, `channelStrategy`, `contact`, uplift `measurement`) and **silent** (no communication; carries the same eligibility/suppression/implementation/measurement blocks, no orchestration; measurement is state-based, not uplift).

**Production-ready (customer, communicating)** = every item in the bold clause above is present *in the file*, every wait carries a `Config` with a class, every touch has a channel role and a destination, every exit has a class, `measurement.outcome` is fully defined, `discovery.aliases` is non-empty, and the validator reports zero errors and zero drift between orchestration and graph. What the company configures: event and attribute mappings, channel availability and permission model, timing values where `Config.required` or where it chooses to override a default, message copy and tone, incentive policy, thresholds, business SLAs.

---

## D. Definition of an Operational Workflow

> An **Operational Workflow** is a portable state machine whose entity is a system-side object — a work item, decision case, document, record, change set, integration, rollout, incident, risk case — whose purpose is to bring that object to a defined resolution through system actions, human tasks, approvals, routing, reconciliation or retry, and which is specified completely enough that an engineering or operations team maps events, attributes and queues and sets SLAs **without designing the trigger semantics, the state model, the observable branch conditions, the timeout rules, the escalation ladder, the idempotency model, the failure paths, the exits or the handoff contracts itself.**

**Production-ready (operational)** = trigger with negative evidence; `entity.instanceKey`; every branch observable; every wait carries a `Config` (class + rule; defaults are usually `required: true` here — SLAs are the company's); `idempotencyKey` on every action with an external side effect; every loop carries `attemptBudget`; every exit classed; every handoff with a `contract`; `implementation.attributes` listed; `measurement` is operational (time-to-resolution, exhaustion rate, escalation rate) — **no** channel, touch, uplift or holdout dimension is applied. What the team configures: SLAs, attempt budgets, queues and authority levels, escalation destinations, attribute names.

---

## E. Relationship between the two products

**Shared:** the node kinds, the graph validator, `Config`, the semantic-event registry, `eligibility`/`suppressions`, `implementation`, `measurement` shape, exit classes, handoff contracts, the global rules (GLB-01…31), the Runtime Mechanisms layer (both products hand off into CMS-208, OPS-124, CON-36).

**Different:** quality standard (§C vs §D), readiness scorer (16 vs 11 dimensions), discovery model (aliases and presets are customer-only), the `orchestration`/`channelStrategy`/`contact` blocks (customer communicating only), UI (practitioner view vs graph-first view), and the migration order (customer first, §S).

**Cross-surface links** are handoffs with a `contract`; the receiving side's surface is rendered, never hidden. A customer journey that hands to DEC-181 shows "→ Decision Request (operational workflow): requires request id, decision type, target entity …".

---

## F. Final vNext schema (Gate 0.5 corrected)

Complete types, as implemented in `src/canonical/types.ts`. Every vNext field is optional during migration so the un-migrated corpus keeps compiling; the validator turns the same fields into errors the moment a journey declares `measurement` (the migration marker). Fields marked `// derived` are computed by the build and never authored; `// existing` fields are unchanged from the pre-vNext schema.

```ts
// ─────────────────────────── shared primitives ───────────────────────────

/** How a statement is to be read. Nothing numeric may sit inside a CANONICAL_RULE. */
export type Label = "CANONICAL_RULE" | "RECOMMENDED_DEFAULT" | "CONFIG_REQUIRED" | "OPTIONAL_STRATEGY";

/** A sentence whose classification matters to the validator or the reader:
    suppressions, and any strategy statement that a company may switch off. */
export interface RuleStatement { id: string; label: Label; text: string; }

/** Where a recommended value comes from. `published-benchmark` requires a
    citation and is unused until one exists in the repository. `example-only`
    renders as an example, never as a recommendation. */
export type DefaultBasis = "corpus-rule" | "attribute-bound" | "example-only" | "published-benchmark";

/** A value the adopting company supplies, with what the library can say
    about it. `required: true` is CONFIG_REQUIRED; a `default` is a
    RECOMMENDED_DEFAULT; `rule` is the CANONICAL_RULE the value serves. */
export interface Config<T = string> {
  key: string;                       // stable config key, e.g. "recovery.first_check"
  rule: string;                      // the semantic rule this value serves - never a number
  class?: TimingClass;               // timing configs only
  default?: {
    value: T | { min: T; max: T };   // a range is the normal form for timing
    confidence: "high" | "medium" | "low";
    basis: DefaultBasis;
    citation?: string;               // required when basis is published-benchmark
    applicableWhen?: string;
    avoidWhen?: string;
  };
  required: boolean;
}

export type TimingClass =
  | "attribute-bound" | "reminder-before-attribute" | "response-window" | "recovery-window"
  | "decision-sla" | "observation-window" | "cooldown" | "backoff" | "external-window";

export interface SemanticEvent {
  id: string; meaning: string; source: SignalSource; entity: string; commonMappings?: readonly string[];
}
export type SemanticEventRef = string;

export type PriorityClass = "security" | "transactional" | "service-critical" | "service" | "retention" | "lifecycle" | "promotional";
export type PressureClass = "none" | "service" | "lifecycle" | "promotional";
export type ChannelRole = "in-session" | "low-friction" | "persistent" | "urgent" | "human";
export type ExitClass = "success" | "invalid-state" | "suppression" | "timeout" | "failure" | "no-action";
export type Capability = "delayed-execution" | "event-cancellation" | "attribute-date-wait" | "consent-lookup" | "contactability-lookup" | "frequency-counter" | "deep-link-binding" | "human-task-queue" | "holdout-assignment" | "idempotent-send";
export type Surface = "customer" | "mechanism" | "operational"; // derived only - never authored (0.5G, Option 1)

// ─────────────────────────── nodes ───────────────────────────

export interface TriggerNode {                       // existing; insufficientAlone becomes required by the validator
  id: NodeId; kind: "trigger"; event: SemanticEventRef;
  evidence: { requires: readonly string[]; insufficientAlone?: readonly string[]; source: SignalSource };
  next: NodeId;
}
export interface ActionNode {                        // existing; NO channel or destination fields
  id: NodeId; kind: "action"; does: string;
  writes?: readonly { field: string; mode: "append" | "set" }[];
  execution?: "communication" | "human";
  idempotencyKey?: string;                           // required by the validator on external side effects
  attemptBudget?: Config<number>;                    // required on the action that re-enters a loop
  next: NodeId;
}
export interface ConditionNode { id: NodeId; kind: "condition"; asks: string; branches: readonly { label: string; when: string; observes?: string; to: NodeId }[]; }
export interface WaitNode {
  id: NodeId; kind: "wait";
  until: readonly string[];                          // registry refs on migrated journeys - these ARE the cancellation events
  onEvent: NodeId;
  timeout: { after: string | Config; reason: string; relativeTo?: "trigger" | "previous-touch" | "attribute"; attribute?: string };
  onTimeout: NodeId;
  recheck?: string;                                  // authoritative state re-read before acting on timeout
  windowExtendsOnEngagement: boolean;                // validator: must be false
}
export interface OutcomeNode { id: NodeId; kind: "outcome"; state: string; means: string; next: NodeId; }
export interface ExitNode { id: NodeId; kind: "exit"; state: string; class?: ExitClass; terminal: boolean; reEntry: string; }
export interface HandoffNode { id: NodeId; kind: "handoff"; to: string; on: string; carries: readonly string[]; suppresses?: readonly string[]; contract?: { requiredFields: readonly string[] }; }

// ─────────────────────────── orchestration (customer, communicating) ───────────────────────────

export interface Touch {
  id: string; stage: string;
  action: NodeId;                    // the communication or human action node
  gatedBy?: NodeId;                  // the wait whose timeout/event precedes this touch; timing lives there. Absent = sent on classification
  prerequisites: readonly NodeId[];  // conditions/rechecks before the send
  purpose: string;
  channelRoles: readonly ChannelRole[]; // ORDERED: first role whose strategy `when` holds wins (0.5B) - channel selection inside one touch
  destination?: { target: string; boundTo: string; mustNotClaim?: readonly string[] };
  mandatory: boolean;                // exempt from pressure caps and from a non-mandatory local cap; never from hard gates, dedup, recheck, idempotency
  priority?: PriorityClass;          // overrides contact.defaultPriority (0.5C)
  priorityReason?: string;           // required when priority is set
  label: Label;                      // CANONICAL_RULE (always sent when reached) | OPTIONAL_STRATEGY (company may disable)
}
export interface ChannelStrategy {
  roles: readonly { role: ChannelRole; channels: readonly ChannelId[]; when: string }[]; // ordered; channels ⊆ journey.channels
  fallback: "next-eligible-role" | "same-role-other-channel" | "none";   // DELIVERY recovery for the same touch - not touch progression
  simultaneous?: { allowed: true; reason: string };
  label: Label;
}
export interface Orchestration {
  strategy: "single-notice" | "notice-then-confirm" | "progressive-recovery" | "deadline-countdown" | "offer-decide-remind" | "two-party-confirmation" | "human-escalation-ladder";
  touches: readonly Touch[];
  noAction: readonly string[];       // ids of suppressions/eligibility items under which this journey legitimately sends nothing
}

// ─────────────────────────── journey ───────────────────────────

export interface CanonicalJourney {
  id: string; slug: string; category: CategoryId; goal: GoalId;              // existing
  name: string; shortName: string; purpose: string;                          // existing
  objective?: string;                                                        // the business behaviour to cause/protect
  channels: readonly ChannelId[];                                            // existing: the permitted set
  entity: { scope: string; note: string; instanceKey?: readonly string[]; concurrency?: "one-active-per-key" | "many"; supersession?: RuleStatement };
  eligibility?: readonly string[];                                           // what must be true at entry; may cite global gates ("GLB-31")
  suppressions?: readonly RuleStatement[];                                   // typed (0.5F) - each has an id the orchestration's noAction references
  contact?: {                                                                // customer communicating only
    defaultPriority: PriorityClass;                                          // (0.5C)
    pressureClass: PressureClass;
    localCap: { value: Config<number>; appliesTo: "non-mandatory" | "all" }; // (0.5D)
    cooldown: Config;
    competition: JourneyCompetition | "none";
  };
  channelStrategy?: ChannelStrategy;
  orchestration?: Orchestration;
  entry: NodeId; nodes: readonly CanonicalNode[];                           // existing
  preemptedBy?: readonly { event: SemanticEventRef; then: string }[];       // existing
  competition?: JourneyCompetition;                                         // existing; superseded by contact.competition on migrated journeys
  implementation?: {
    attributes: { required: readonly string[]; optional?: readonly string[] };
    capabilities?: readonly Capability[];                                    // authored additions; the base set is derived
    // events: derived = trigger.event ∪ every wait.until ∪ measurement events
  };
  measurement?: Measurement;                                                 // the migration marker
  discovery?: { aliases: readonly string[]; useCases: readonly string[]; presets?: readonly Preset[] };
  distinctFrom?: readonly { journey: string; because: string }[];            // existing
  guardrails: readonly string[]; reusableRule: string;                       // existing
}

export interface Measurement {                                               // (0.5E)
  journeyOutcome: { type: "exit" | "handoff" | "event"; refs: readonly string[] };   // did THIS journey do its job
  businessOutcome?: {                                                        // the customer/business event we ultimately care about
    event: SemanticEventRef;
    unit: "instance" | "person";
    observationScope: { type: "self" } | { type: "handoff-chain"; journeys: readonly string[] };
    window: { type: "until-exit" } | { type: "through-handoff"; until: SemanticEventRef } | Config;
    attribution: "entered-before-event" | "touched-before-event";
    comparison: "persistent-holdout" | "pre-post" | "none" | "not-applicable";
    holdout?: Config<number>;
  };
  secondary?: readonly SemanticEventRef[];
  guardrails: readonly string[];
  operational: readonly string[];
}

export interface Preset {
  id: string; name: string; applicableWhen: RuleStatement;
  overrides: Readonly<Record<string, unknown>>;   // Config keys and channelStrategy.roles only - never nodes, touches or exits
  destination?: string; aliases: readonly string[];
}
```

**Removed from the first draft:** `ActionNode.channelPolicy`, `ActionNode.destination` (→ `Touch`), `WaitNode.cancelOn` (redundant with `until` as refs), authored `requiredEvents`/`requiredCapabilities` (derived), `Touch.channelRole` singular (→ ordered `channelRoles`), `contact.priority` (→ `defaultPriority` + touch override), bare `localCap: Config` (→ value + `appliesTo`), flat `measurement.outcome` (→ `journeyOutcome` + `businessOutcome`), `surface` field and any authored override (derived only), untyped `suppressions: string[]` (→ `RuleStatement[]`).

**Three concepts the schema keeps apart (0.5B):** *touch progression* (`orchestration.touches` in order, gated by waits), *channel selection inside a touch* (`Touch.channelRoles` resolved against `channelStrategy.roles[*].when`), *delivery fallback* (`channelStrategy.fallback`, exercised by CMS-208 for the same touch after a delivery failure). A rule that mixes them is a validator error.

## G. Field ownership table

| Concern | Single source of truth | Consumers (read-only) |
|---|---|---|
| State transitions, forks, waits, exits, handoffs | **graph nodes** | orchestration (by reference), practitioner view, validator |
| Wait timing value, class, rule, default | **`WaitNode.timeout.after: Config`** | touch (`gatedBy` reads it), practitioner view, company config UI |
| Cancellation events of a wait | **`WaitNode.until` (registry refs)** | `implementation.events` (derived), touch view |
| Meaning of an event; common vendor names | **semantic-event registry (`global.ts`)** | triggers, waits, measurement, preset docs |
| Touch sequence, purpose, prerequisites | **`orchestration.touches`** (references nodes) | practitioner view; validator proves path consistency |
| Channel roles, eligibility conditions and delivery fallback | **`channelStrategy`** (journey) | touches (`channelRoles`, ordered), CMS-204 at runtime |
| Which channels are permitted at all | **`channels`** (journey) | `channelStrategy` (validated ⊆) |
| CTA target and must-not-claim | **`Touch.destination`** | message brief, validator |
| Priority, pressure class, local cap, cooldown, mandatory | **`contact`** + `Touch.mandatory` | send path stages 3–5 (GLB-01…05, GLB-28) |
| Global quiet hours, delivery windows, hard gates | **global policy** (GLB-27, GLB-31) + merchant config | send path stages 1, 8; never restated in a journey |
| Merchant-specific timing values, thresholds, SLAs, incentive policy | **company config**, keyed by `Config.key` | runtime; presets may pre-fill |
| Eligibility at entry; who is suppressed | **`eligibility` / `suppressions`** | measurement `no_action_rate_by_reason`, validator |
| Success definition and attribution | **`measurement.outcome`** | analytics; validator checks the event exists in the graph |
| Required events | **derived** from graph + measurement | never authored |
| Required attributes | **`implementation.attributes`** | company mapping checklist |
| Idempotency key | **`ActionNode.idempotencyKey`** | runtime |
| Instance identity, concurrency, supersession | **`entity`** | re-entry semantics, measurement unit |
| Practitioner names, use cases, presets | **`discovery`** | search, cards, SEO (derived, never the reverse) |
| Product surface | **derived** by the assignment rule from `category`, `entity.scope`, `channels` and the mechanism constant; never authored | site lists, readiness scorer |

**Drift prevention.** Three mechanisms: (1) *reference, not restatement* — a touch names a node id and reads timing from it; (2) *derivation* — events, capabilities and surface are computed; (3) *validator rules* `orch_touch_not_in_graph`, `orch_path_broken`, `timing_stated_twice`, `duplicate_source_of_truth` (§T) fail the build when the same fact appears in two places.

---

## H. Canonical / Default / Config / Optional taxonomy

| Label | Definition | Test | Examples |
|---|---|---|---|
| **CANONICAL_RULE** | True in every implementation because removing it changes what the journey *means* or makes it unsafe. | "If a company omits this, is the journey still the same journey, and still correct?" If no → canonical. | Re-read authoritative checkout state before any abandonment send. A payment retry uses the same idempotency key. A reminder is built at send time from the booking as it is then. Business events, not opens, advance the state. NO_ACTION is a recorded outcome. |
| **RECOMMENDED_DEFAULT** | A responsible starting value or shape for most implementations; carries confidence, basis, applicability. | "Would two competent teams disagree about this value and both be right?" If yes → default, never rule. | First abandonment check 30–60 min after last activity (medium confidence, applicable to considered purchases; avoid for impulse baskets). One recovery message per person per day across instances. Cooldown 7–30 days after lapse. |
| **CONFIG_REQUIRED** | No responsible library-level value exists; the company must decide. | "Does the right answer depend on law, contract, margin, risk appetite or operations the library cannot see?" | Incentive eligibility and amount. Decision SLAs. Grace period length. Which channels exist and their permission model. Escalation destinations. |
| **OPTIONAL_STRATEGY** | A legitimate tactic some companies enable; the journey is complete without it. | "Is the journey correct and complete if this is switched off?" If yes → optional. | A third, expiry-aware recovery touch. An incentive at the final touch. An SMS escalation near a real deadline. A waitlist offer when nothing fits. |

Rules of use: a number never appears inside a CANONICAL_RULE; an OPTIONAL_STRATEGY is a `Touch` with `label: "OPTIONAL_STRATEGY"` or a preset override, never a branch condition; CONFIG_REQUIRED is `Config.required: true` with the `rule` still stated; a RECOMMENDED_DEFAULT with `confidence: "low"` renders as "example" in the practitioner view. The validator enforces the first rule mechanically (§T `canonical_rule_contains_number`).

---

## I. Timing pattern system

### What the corpus's 209 waits actually are

Clustering every `timeout.after` by what it is relative to (not by business context):

| Class | Waits | Relative to | Library-level default possible? | Typical form |
|---|--:|---|---|---|
| attribute-bound | 37 | a stored moment (deadline, expiry, effective date, session time, offer close) | **No default needed** — the attribute *is* the value | "the deadline itself", "the effective end date" |
| decision-sla | 29 | an internal actor's obligation to decide/accept/review | **CONFIG_REQUIRED** with a shape hint (business days) | "the decision SLA", "the assignment SLA" |
| recovery-window | 12 + ~30 unclassified | the trigger or the previous touch | **RECOMMENDED_DEFAULT as a range**, vertical-dependent | "a bounded recovery window", "the resolution horizon" |
| hold/validity → attribute-bound | 16 | a recorded validity end | no default needed | "the credential's validity end" |
| response-window | 8 + ~15 unclassified | the previous touch | **RECOMMENDED_DEFAULT as a range**, medium confidence | "a bounded response window", "the selection window" |
| observation-window | 8 + 5 nurture | the trigger | mixed: nurture = default range; investigation/stability = CONFIG_REQUIRED | "a bounded diagnostic window", "the early-adoption window" |
| cooldown | 6 | an exit | **RECOMMENDED_DEFAULT as a range** | "the cooldown period" |
| external-window | 6 + 4 sync | an external party's promise plus tolerance | attribute + tolerance default | "the expected delivery window plus its tolerance" |
| backoff | 4 | the previous attempt | **RECOMMENDED_DEFAULT** (exponential, capped) with `attemptBudget` CONFIG | "the calculated backoff interval" |
| reminder-before-attribute | 3 + ~5 unclassified | a point before an attribute-bound moment | **RECOMMENDED_DEFAULT** as a fraction/offset | "the reminder point defined for this kind of obligation" |
| confirmation/verification → response-window | 5 | the previous touch | default range, **high** confidence for OTP-class | "the confirmation window defined for this kind of destination" |

Findings: (1) the first draft's twelve classes mixed axis and context ("abandonment first check" and "correction window" are both *recovery-window*; "grace" is *attribute-bound* once policy records the grace end); (2) 70 waits were unclassifiable under the twelve because their text names a business context, not a reference point — under the nine classes every one classifies; (3) **nine is enough**, and business context moves into `default.applicableWhen`.

### Defaults: ranges, confidence, basis

A default is never one number. Its shape is `{ value: {min,max} | value, confidence, basis, applicableWhen, avoidWhen }`. Basis is one of: `"corpus-rule"` (a global rule implies it, e.g. GLB-24 bounds a ladder to one reminder), `"attribute-bound"` (the value is a stored attribute; no number is recommended), `"published-benchmark"` (a citable source with a `citation` — none exist in the repository today, so this basis may not be used until one is added), `"example-only"` (an illustrative range; confidence low or medium; renders as an example, never as a recommendation). There is no `"platform-convention"` basis: nothing in this repository evidences one, and labelling a guess as convention is exactly the false precision §H forbids. This is what stops a number copied across dozens of journeys: the validator rejects a default without a basis, and `example-only` never renders as a recommendation.

Which defaults may be **global** (set once in `global.ts` per class and inherited): response-window for confirmations (minutes for OTP-class, 24–72h for email-class), cooldown (7–30 days), backoff (exponential 1 min → 1 h, budget CONFIG), reminder-before-attribute (24 h and 25 % of remaining time, whichever is later). Which need **journey-specific** ranges: recovery-window (abandonment 30–60 min first check for considered purchases; 10–20 min for impulse; 24 h second; 3–7 days lifetime), observation/nurture windows. Which are **CONFIG_REQUIRED** always: decision-sla, grace, investigation, anything a contract or law sets.

### Schema

Already in §F: `WaitNode.timeout.after: Config` with `class`, plus `relativeTo` and `attribute`. No separate timing table per journey; a journey's timing is the set of its waits' configs, rendered in the practitioner view as the "Configure" list.

---

## J. Channel strategy system

Three levels were considered; **two** are adopted.

1. **Journey-level `channelStrategy`** — an ordered list of *roles* each mapped to the channels that may play it in this journey, a fallback rule, and whether simultaneous sends are ever allowed. Roles: `in-session` (the person is in the product now), `low-friction` (push/in-app: a nudge while intent is fresh), `persistent` (email: carries content and survives), `urgent` (SMS/WhatsApp: only against a real, asserted deadline and explicit permission), `human` (sales/task). Example: *low-friction while an app session or valid token exists → persistent otherwise → urgent only for the deadline touch*.
2. **Touch-level `channelRoles`** — an *ordered set* of roles this touch may use, e.g. `["in-session", "persistent"]` or `["urgent", "persistent"]`. Resolution at send time: take the first role in the touch's list whose `channelStrategy.roles[*].when` condition holds, then resolve that role to an eligible concrete channel through CMS-204. This is **channel selection inside one touch**, and it is distinct from the two things it is easy to confuse it with: *touch progression* (`t1 → wait → t2`, which is orchestration) and *delivery fallback* (an invalid token or a bounce → another eligible route for the same touch, which is delivery recovery under CMS-208). The validator keeps the three apart (`touch_channel_role_ambiguous`, `fallback_as_touch`, `role_no_eligible_channel`).
3. **Action-level** — nothing. The action node is behaviour text; giving it a channel would duplicate the touch.

Rules: `channelStrategy.roles[*].channels ⊆ journey.channels` (validator); a journey with one message channel still declares one role (so the practitioner view is uniform); simultaneous sends require `simultaneous.reason` (e.g. a security alert to every verified destination, CON-264's two-recipient case); fallback is a *delivery* concept (bounce, invalid token → next eligible role for the *same* touch, once) and is never a "next touch" — the validator flags a touch whose only prerequisite is a delivery failure of the previous touch (`fallback_as_touch`).

Engagement is not a channel-switch signal. "Not opened → SMS" is representable only as a touch whose prerequisite condition observes an engagement event, and the validator warns on it (`engagement_as_prerequisite`); the human review question is whether the use case genuinely turns on whether a person *saw* something (a security alert might; a promotion never does).

---

## K. Frequency and collision model

### Priority classes (derived from the corpus's own gates and groups, not from the brief's list)

GLB-31 evaluates hard gates first; GLB-04/30 let a more authoritative lifecycle state preempt; the send path orders competition before contact-pressure. The classes that fall out, top to bottom:

| Priority | Meaning | Examples in corpus | Cap behaviour |
|---|---|---|---|
| **security** | protects the account or identity; must reach the person | IDN-271 Security Alert, IDN-85 challenge, CON-264 destination alert | mandatory; exempt from pressure caps; subject only to hard gates and dedup |
| **transactional** | states a fact about an obligation, order, booking or payment the person already has | FIN-134 corrective request, SUB-262 confirmation, SCH-277 confirmation, FUL-146 delay update, TRM-275 deletion closure | mandatory; exempt from pressure caps |
| **service-critical** | the service fails or the person loses something without action | SCH-266 at-risk, TIM-63 expiry, DEC-267 remediation deadline, ACC-261 restriction | exempt from *soft* caps; counts toward hard caps |
| **service** | helps with a service the person is using | ACT-13 blocker, ACT-14 help, INT-278 setup fix, FUL-276 substitution | service pressure class |
| **retention** | protects the relationship | RET-28 save, RET-26 recovery, FBK-46 confirmation ask | lifecycle pressure class; retention-outreach exclusion group |
| **lifecycle** | advances the relationship | ACT-12 nurture, ACT-17 adoption, ACQ-285 welcome, SUB-163 renewal notice | lifecycle pressure class |
| **promotional** | invites a purchase or an ask with no obligation behind it | abandonment recovery, interest recovery, replenishment, win-back, FBK-41/42 asks | promotional pressure class; lowest precedence |

### The five mechanisms and their owners

| Mechanism | Owner | Journey-level field | Default |
|---|---|---|---|
| **Hard gates** (closed account, fraud hold, legal, absent permission for the purpose, service-recovery pause) | GLB-31 + CMS-205 | referenced in `suppressions` | evaluated globally, applied by purpose |
| **Priority precedence** within one hour for one person | send path stage 3 (GLB-01/02/05) | `contact.defaultPriority`, overridable per touch (`Touch.priority` + `priorityReason`) | higher class sends; lower classes in the same pressure class are deferred, not dropped, and re-evaluated (GLB-06/10) |
| **Exclusion / competition** on the same scope instance | GLB-03/08 | `contact.competition` | extended from 14 to every customer communicating journey (66): each names a group or `none` explicitly |
| **Pressure caps** across journeys | GLB-28 + CON-34/39 | `contact.pressureClass` | RECOMMENDED_DEFAULT per class: promotional ≤1/day and ≤3/week per person; lifecycle ≤1/day; service uncapped but deduplicated; transactional/security none. CONFIG. |
| **Local cap** within an instance | `contact.localCap` = `{ value: Config<number>, appliesTo: "non-mandatory" \| "all" }` | discretionary touches per instance | `appliesTo: "non-mandatory"` is the normal case: a security, transactional or required-service confirmation never disappears because a discretionary-touch cap was spent. Mandatory touches still pass dedup, authoritative recheck, hard gates and idempotency. **Local-touch-cap exemption** (this row) and **pressure-cap exemption** (the row above, `Touch.mandatory` against `contact.pressureClass`) are two mechanisms: the first bounds *this instance*, the second bounds *this person across journeys*. |
| **Cooldown** after exit | `contact.cooldown` | per exit class | RECOMMENDED_DEFAULT: after `timeout`/`suppression` 7–30 days; after `success` none; after `invalid-state` none |
| **Dedup** | GLB-17/19 + `Touch` key | `idempotencyKey` = instance key + touch id | always |

### The brief's scenario, resolved

Person qualifies within one hour for payment failure (transactional), abandoned checkout (promotional), churn prevention (retention), feedback request (promotional ask, `outbound-ask` group), generic promotion (promotional). Result under the model: FIN-134's corrective request sends (transactional, mandatory). RET-28/24 hold the `retention-outreach` group; a retention touch may send but FBK-41's own rule defers a satisfaction ask while a service or retention journey is open (`x.deferred`). Checkout recovery and the generic promotion share the promotional pressure class with a default of one per day: the send path takes the higher-precedence *purpose* (a recovery bound to an open checkout outranks a generic promotion by GLB-04's "more current state"); the other is deferred and re-evaluated against current state when the cap frees — by which time the checkout may be converted and the deferred touch becomes `no-action`. Every deferral and suppression is a recorded `no-action` reason, which is how measurement sees it.

### Touch-level priority

A journey carries `contact.defaultPriority`; a touch inherits it unless it sets `priority`, and an override must carry `priorityReason` naming the changed obligation (SCH-266: prompt and reminder are *service*, the critical-prerequisite notice is *service-critical* because the service fails without it). The validator rejects an override with no reason (`invalid_priority_override`), a transactional or security touch inside a promotional journey with no documented handoff (`mandatory_promotional_conflict`), and any touch that does not resolve to exactly one class (`touch_priority_unresolved`). No numeric rank exists in any file; the ordering of classes is global policy.

### Mandatory communication exception

`Touch.mandatory: true` (security, transactional, legally required notices) bypasses pressure caps and competition but never hard gates (a closed account still gets its closure confirmation — GLB-31 leaves wind-down obligations — but never a marketing recovery) and never dedup.

---

## L. Measurement model

Two things are measured separately, because a journey's responsibility and the business result are not the same thing (Gate 0.5E). SCH-266 has executed correctly when the right reminder was sent against a revalidated booking; whether the person *attended* is recorded by SCH-178, downstream. FIN-134 has executed correctly when the corrective request went out and the obligation reached a resolution or a handoff; whether the obligation was *satisfied* may happen inside TIM-65's grace period, downstream.

- **`journeyOutcome`** — did this journey complete its own responsibility? `{ type: "exit" | "handoff" | "event", refs }` naming the exit classes, handoff ids or events that count as the journey having done its job. Always self-scoped; always present.
- **`businessOutcome`** (optional — silent states and routers may have none) — the customer/business event we ultimately care about: `event` (registry ref), `unit` (instance | person), `observationScope` (`self`, or `handoff-chain` naming the journeys the event is reached through), `window` (`until-exit`; `through-handoff` until a named event; or a `Config`), `attribution` (`entered-before-event` | `touched-before-event`), `comparison` (`persistent-holdout` | `pre-post` | `none` | `not-applicable`), `holdout` share as a `Config` when applicable.

Validation: a **self**-scoped business event must appear in this journey's graph (`until`, exit or handoff condition); a **handoff-chain** event must be reachable through handoffs this journey actually declares, in order, and the event must appear in the last journey of the chain (`downstream_measurement_unreachable`); an event that is neither is invalid. A journey never restates another journey's measurement — it *references* the chain.

`guardrails` and `operational` are names, never targets: `unsubscribe`, `complaint`, `duplicate_send`, `message_after_success` (must be zero — it measures the recheck), `no_action_rate_by_reason` (how NO_ACTION becomes visible). Nothing in the file is a number, a target or a query.

## M. Discoverability model

`discovery: { aliases, useCases, presets }` on every customer journey (aliases optional on operational ones).

- **aliases** — practitioner names the journey answers to: for FIN-134 `["dunning", "failed payment recovery", "card decline recovery", "payment retry"]`; for IDN-85 `["OTP", "2FA", "login verification", "MFA challenge"]`; for FBK-41 `["NPS", "CSAT request", "survey request", "review request"]`; for ACT-20 `["reactivation", "dormant lead"]`; for RET-28 `["cancellation save", "churn prevention", "save flow"]`. Search indexes them; cards show up to two as a muted line; they never replace `shortName`.
- **useCases** — the situations, in practitioner words, this journey is for (the archive's "input subjects" are the model: "a shipment entering its final delivery leg").
- **presets** — a named specialisation of a *generic* canonical journey whose only differences are config values, a destination target and vocabulary. A preset may override `Config` keys and `channelStrategy.roles`; it may **not** add or remove nodes, touches or exits — if it needs to, it is a separate canonical journey (§17 test). Presets render as their own cards ("Checkout Abandonment") that open the parent's practitioner view with the preset applied; the URL is the preset's.

Specialisation rule: a preset exists only when a practitioner would search for it by name *and* the behaviour is identical. Twelve aliases and ten presets come out of §N; the corpus does not grow to hit keywords.

---

## N. Coverage decisions

Tested against the archive's abandonment family (ACQ-901/902/903/904, RET-904/906, SCH-902), whose graphs all share one orchestration shape — trigger → eligibility → one touch → bounded recovery wait cancelled by purchase/withdrawal/invalidation → outcome fork → exits — and differ on the equivalence axes as shown.

| Candidate | Decision | Form | Reason |
|---|---|---|---|
| Begin-checkout / checkout recovery | **TRUE GAP** | new canonical **Abandoned Process Recovery** + preset *Checkout Abandonment* | authoritative resumable process with its own expiry and a resume destination; `payment_failed` handoff; no existing journey has this entity |
| Quote abandonment | SPECIALIZATION | preset of Abandoned Process Recovery | same entity lifecycle (a resumable process with expiry), same checks, same outcome (commitment); destination = the quote |
| Application abandonment | SPECIALIZATION | preset of Abandoned Process Recovery | same; destination = the application; TIM-61 owns any hard deadline via handoff |
| Incomplete registration | SPECIALIZATION | preset of Abandoned Process Recovery | resumable process; identity verification is a handoff to IDN-81, not a different machine |
| Add-to-cart abandonment | **TRUE GAP** | new canonical **Abandoned Selection Recovery** + preset *Cart Abandonment* | entity is a recorded selection with no process state and no expiry; trigger source authoritative *record*, not process; checks differ (availability, price change) — fails equivalence with process recovery on entity lifecycle and state checks |
| Saved item / wishlist reminder | SPECIALIZATION | preset of Abandoned Selection Recovery | declared selection; same machine (archive ACQ-904 is shape-identical to ACQ-901) |
| Browse abandonment | **TRUE GAP** | new canonical **Unresolved Interest Recovery** + preset *Browse Abandonment* | trigger source is *inferred/behavioural*; eligibility needs an interest-qualification step and a lower priority; outcome is a recorded selection or purchase — fails equivalence with selection recovery on trigger semantics and required checks |
| Product-view abandonment | SPECIALIZATION | preset of Unresolved Interest Recovery | archive ACQ-903 folds item, search and category interest into one machine by design |
| Search abandonment (commerce) | SPECIALIZATION | preset of Unresolved Interest Recovery | same; SCH-282 remains the *availability*-search journey (different entity: an enquiry with restorable availability) |
| Replenishment | **TRUE GAP** | new canonical **Predicted Need Replenishment** | trigger is an inferred schedule from a consumable's usable period, not observed interest; eligibility = no newer purchase; fails equivalence with interest recovery on trigger semantics |
| Predicted next-purchase (RET-906) | SPECIALIZATION | preset of Predicted Need Replenishment | same machine; the prediction basis differs, not the behaviour |
| Win-back | **TRUE GAP** | new canonical **Lapsed Customer Win-Back** | ACT-20 explicitly excludes previously-paid relationships and names the missing journey; different eligibility (was paid), different economics, different suppression (recent cancellation reason, refund history) |
| Back-in-stock / availability restored (ACQ-905) | NOT NOW | none | not in the brief's list; a legitimate candidate (authoritative availability event) for a later pass, not this one |
| Onboarding inactivity | ALIAS GAP | alias on ACT-18 and ACT-12 | covered |
| Churn prevention | ALIAS GAP | alias on RET-24/RET-28 | covered |
| Dunning | ALIAS GAP | alias on FIN-134 (+SUB-165) | covered |
| OTP / 2FA | ALIAS GAP | alias on IDN-85 | covered |
| NPS / CSAT / review request | ALIAS GAP | alias on FBK-41 | covered |
| Reactivation | ALIAS GAP | alias on ACT-20 | covered |
| Nurture, welcome, reminder, confirmation, escalation | ALIAS GAP | aliases on ACQ-09/285, TIM-63/268/SCH-266, SCH-277/SUB-262, OWN-55/DEC-189 | covered |
| Service recovery, no-show, appointment, referral, post-purchase, delivery, renewal, expiry, cancellation, payment failure, first value, feature adoption, usage drop, lead follow-up, verification | covered | aliases where names differ | audit §I table stands |

Net: **5 new canonical journeys**, **10 presets**, **12 alias sets**. The archive's other 21 journeys (loyalty, commission, anniversaries, recurring supply, pre-payment holds) are out of scope for this pass and are not imported; they carry the same deferred-timing defect and would be authored against vNext if ever added.

---

## O. Merge / split decisions (behavioural equivalence)

Two journeys merge only if they share entity lifecycle, trigger semantics, required state checks, timing archetype, outcome, suppression model, orchestration strategy and re-entry semantics.

| Candidate | Entity | Trigger | Checks | Timing | Outcome | Suppression | Orchestration | Re-entry | Decision |
|---|---|---|---|---|---|---|---|---|---|
| DEC-182 vs DEC-189 | case *ownership* vs decision *authority* | needs-owner vs escalation criterion | availability/eligibility vs higher-authority-exists | assignment SLA vs original deadline preserved | accepted/reassigned/withdrawn vs decided/info/returned/no-authority | same | ladder vs route-and-wait | same | **keep separate** |
| DEC-189 vs OWN-55 | decision authority vs work blocker (ownership retained) | criterion vs escalation condition | authority exists vs path defined & transfers? | deadline vs SLA per level | decided vs unblocked/closed | same | route vs ladder | same | **keep separate** |
| FBK-44 ↔ FBK-43 | feedback record | negative feedback ⊂ feedback received | already-handled, valence | none | acknowledge → issue handoff | same | single notice | same | **merge into FBK-43** (valence branch) |
| FBK-45 ↔ FBK-43 | feedback record | positive ⊂ received | contribution? | none | acknowledge → advocacy handoff | same | single notice | same | **merge into FBK-43** |
| REM-151 vs FBK-44 | fulfilment with a reported problem vs feedback | issue reported vs feedback | defect exists? | none | remedy decision vs acknowledgement | same | single notice | new issue vs new feedback | **keep separate** |
| ACT-15 → ACT-17 | person × product context (same) | first value vs activation | next-action exists? | none vs early-adoption window | hands to ACT-17 vs stall/normal | same | ACT-15 is ACT-17's opening touch | same | **merge** (ACT-17 accepts first-value evidence) |
| FUL-146 split | one obligation | one slip event | threshold, choice | decision window, revised horizon | resume/exception/cancel/escalate | same | delay update + choice offer = two touches | same | **no split** |
| SCH-282 vs archive SCH-902 | availability enquiry (same) | same | same | same | same | same | 1 vs 2 touches | same | **keep SCH-282**, do not import |
| Abandoned Process vs Abandoned Selection vs Unresolved Interest (new) | process with expiry / recorded selection / inferred interest | authoritative process / authoritative record / behavioural | resumable? / available & priced? / interest still unresolved? | recovery window (values differ) | purchase | same | progressive recovery | per instance | **three canonical** (differ on entity, trigger source and checks) |
| CON-264 vs IDN-270 (both contact/account changes) | contact point vs account control | change vs recovery request | — | confirmation window | permitted vs restored | same | two-party vs single | same | keep separate (not previously proposed; checked because of shape similarity) |

Result: 2 merge decisions retiring **3** canonical records (FBK-44, FBK-45, ACT-15), 0 splits, 5 new; corpus 281 → **283**, customer surface 133 → **135**, communicating 66 → **68**, silent 67 unchanged. Recomputed from `surfaces.json`: all three retired ids are communicating customer journeys.

---

## P. Reference journey set (gold standards)

Fifteen, chosen for pattern coverage; each names the architecture feature it stress-tests. Three (★) are fully specified in §Q.

| # | Journey | Stresses |
|---|---|---|
| 1 | ★ **Abandoned Process Recovery** / preset Checkout Abandonment (new) | progressive multichannel recovery; relative-to-previous-touch timing; supersession and instance identity; holdout; presets |
| 2 | Abandoned Selection Recovery / preset Cart (new) | same strategy, different entity lifecycle — proves presets do not leak across canonical journeys |
| 3 | Unresolved Interest Recovery / preset Browse (new) | inferred trigger with qualification step; lowest priority; no-action as the common outcome |
| 4 | ★ **FIN-134 Payment Failure Recovery** | transactional priority and mandatory touch; idempotent retry; failure-class routing; service channel roles; handoffs to grace/overdue/restriction |
| 5 | ACT-18 Adoption Recovery + ACT-12 window | observation-window timing; competition with retention-outreach; silence-triggered |
| 6 | ACT-17 (+ACT-15 merged) Adoption Nurture | merge; second entry evidence; nurture window default |
| 7 | SUB-163 Renewal Reminder | attribute-bound timing to term end; notice-required fork; blocker path to SUB-165 |
| 8 | TIM-63 Expiry Reminder | reminder-before-attribute; actor resolution before send; four declared channels needing roles |
| 9 | RET-28 Cancellation Save | retention priority; offer-decide with question-then-answer wait; competition group; never obstructs the cancel path |
| 10 | Lapsed Customer Win-Back (new) | eligibility on past paid relationship; suppression by cancellation reason; long cooldown; holdout |
| 11 | FBK-41 Feedback Request | outbound-ask group; deferral by open issue; `x.deferred`/`x.duplicate`/`x.not-now` as no-action exits |
| 12 | FBK-46 Complaint Resolution + RET-26 Service Recovery | human escalation ladder; route check before confirmation ask; suppression of automated outreach while a human owns the problem |
| 13 | ★ **SCH-266 Appointment Reminder** + SCH-280 No-Show Follow-Up | deadline-relative timing; revalidate-before-send; prerequisite prompt; superseded exit; no-show handoff |
| 14 | DOC-215 Signature Reminder | offer-decide-remind with expiry wait; document destination; multi-party |
| 15 | IDN-271 Account Security Alert + CON-264 Contact Verification | security priority, mandatory, simultaneous multi-destination send; two-party confirmation; OTP-class response window |

What the set deliberately covers: every `Orchestration.strategy` value, every `TimingClass` except backoff (covered by OPS-124 on the operational side), every priority class, holdout-required and holdout-not-applicable, presets, merges, silent-state dependencies (TIM-65, SUB-165, SCH-174).

---

## Q. Three full reference specifications

Notation: **[C]** CANONICAL_RULE · **[D]** RECOMMENDED_DEFAULT (with confidence) · **[R]** CONFIG_REQUIRED · **[O]** OPTIONAL_STRATEGY. Semantic events are registry ids. Node ids follow the corpus convention (`t.` `a.` `c.` `w.` `x.` `h.`).

### Q1 · Abandoned Process Recovery — preset "Checkout Abandonment"

**Identity.** id ACQ-11 (next free in acquisition) · shortName *Abandoned Process Recovery* · surface customer · priority **promotional** · pressure class promotional · goal recovery-retry · channels `email, push, in-app, sms` (permitted set; roles below decide use).

**Objective.** Return a person to a resumable process they started and did not complete, while it is still resumable, without ever asserting a state the system does not hold.

**Entity [C].** The **logical process** — for the checkout preset, the basket-and-checkout the person is trying to complete, *not* the platform's `checkout_id`. `instanceKey: ["person_id", "logical_process_id"]`, `concurrency: "one-active-per-key"`. The company maps `logical_process_id` to its own identifier model **[R]**: if the platform rotates `checkout_id` when the same basket resumes (common), the mapping must resolve the new id to the open instance rather than opening a second. Cross-device resumption is the same logical process if the basket is the same. **Supersession [D, high confidence]:** a new logical process for the same person supersedes an open instance (`x.superseded`), because two abandonment sequences to one person about two baskets is the duplicate-communication failure; `concurrency: "many"` is a documented override for marketplaces or B2B accounts where distinct baskets are genuinely independent — then the person-level pressure cap is what protects the person.

**Trigger [C].** `process_started` — semantic event: an authoritative record that a resumable process opened for a person with ≥1 item and a resumable state. Requires `logical_process_id`, `person_id` (or resolvable identity), `items[]`, `started_at`, `last_activity_at`, `resume_destination`; `expires_at` if the platform expires processes. Insufficient alone: a cart page view; an add-to-item without entering the process (that is Abandoned Selection Recovery); a process with zero items; a process already `process_completed`, `process_cancelled` or `process_expired`. Source: authoritative.

**Eligibility [C].** Identity resolvable to a contactable person; the process still resumable per authoritative state; no open instance for this key; no `payment_failed` on this process (FIN-134 owns it); no hard gate (GLB-31 by reference).

**Suppressions.** [C] exit on `process_completed` by any channel, `process_cancelled`, `process_expired`, `items_removed_all`; [C] never enter without purpose-level permission for *commercial recovery* messages; [C] `payment_failed` on the process → `h.payment` (FIN-134); [C] promotional pressure cap and competition (retention-outreach outranks; a `payment_failed` or open FBK-46 on the account suppresses); [D, medium] a newer process supersedes (see entity); [C] every suppression is recorded as a `no-action` reason.

**Channel strategy [D, medium].** `low-friction` ← push, in-app when an app session or valid token exists ("intent is minutes old; a low-friction return beats content") → `persistent` ← email otherwise or for the second touch ("carries the items and survives") → `urgent` ← sms **only** with explicit commercial SMS permission *and* an asserted time-bound element (`expires_at`, a hold, a delivery cut-off) [O]. Fallback: `same-role-other-channel`, once, on delivery failure only. Simultaneous: never.

**Orchestration — strategy `progressive-recovery`.**

| Touch | Gated by (wait) | Timing (on the wait) | Prerequisites (graph) | Channel roles (ordered) | Purpose | Destination | Label |
|---|---|---|---|---|---|---|---|
| t1 initial-recovery | `w.abandon` until `process_resumed`, `process_completed`, `process_cancelled`, `process_expired`; timeout `recovery.first_check` **[D 30–60 min after `last_activity_at`, medium; basis platform-convention; applicableWhen considered purchases; avoidWhen impulse baskets → 10–20 min]**; relativeTo attribute `last_activity_at`; recheck: process still resumable | `c.state` (authoritative re-read) [C] · `c.sendable` (send path) [C] | low-friction | the process is still open; the current items; a link that reopens *this* process with state restored | `resume_destination` boundTo `logical_process_id`; mustNotClaim: stock reserved, price held, discount applies — unless the system asserts it [C] | CANONICAL_RULE |
| t2 follow-up | `w.second` until same events + `process_resumed` handled specially; timeout `recovery.second_check` **[D 20–28 h after t1, medium; basis platform-convention; avoidWhen perishable/time-boxed processes → resumable window minus margin]**; relativeTo previous-touch; recheck same | `c.state` · `c.resumed-since` (if resumed but not completed since t1 → wait `recovery.first_check` again, once, then re-evaluate — a person who came back is deciding, not forgetting [C]) · `c.sendable` | persistent | address the likely blocker (shipping, returns, trust, questions); still no unasserted claims | same | CANONICAL_RULE |
| t3 final-notice | `w.final` until same; timeout `recovery.lifetime` **[D 3–7 days after trigger, medium; basis platform-convention; cap at the platform's resumable lifetime]**; relativeTo trigger | `c.state` · `c.expiry-real` (only if `expires_at` is asserted) · `c.sendable` | persistent, or urgent per [O] | the last honest statement: the process closes at the real expiry; here is the link | same | OPTIONAL_STRATEGY |
| incentive | — | — | `c.incentive-policy` **[R]** | — | if the company enables an incentive [O], it appears at the *last enabled* touch, once, and issuance is recorded per person with key `person_id + incentive_type` for the cooldown [C when enabled] | — | OPTIONAL_STRATEGY |

**Response handling [C].** Only business events move state: `process_resumed` (an authenticated session on the process), `process_completed`, `process_cancelled`, `items_removed_all`, `process_expired`, `payment_failed`. Opens and clicks are recorded as engagement evidence and change nothing. A click on an expired `resume_destination` must resolve to the person's current basket or an honest "this checkout closed" page — never a dead link (destination contract).

**Failure paths [C].** Delivery failure → CMS-208 with the touch id; a bounce on t1 makes the same-role alternative eligible for t1 once. Contactability loss → CON-36. Expired destination → `x.invalid-state` with reason.

**Exits.** `x.converted` success (`process_completed`; re-entry: a new logical process) · `x.invalid` invalid-state (cancelled/expired/emptied; new process) · `x.superseded` suppression (newer process; none for this id) · `x.no-action` no-action (every gate that stopped every touch, with reason; new process) · `x.lapsed` timeout (lifetime passed; new process subject to cooldown) · `h.payment` → FIN-134.

**Contact.** defaultPriority promotional · pressureClass promotional · localCap `{ value: [D 3, medium; basis corpus-rule GLB-24], appliesTo: "all" }` (no touch is mandatory here; 2 when t3 is disabled) · cooldown after lapse/no-action **[D 7–30 days, medium; basis platform-convention]** — a new process inside the cooldown enters, is tracked, and sends nothing (records `no-action: cooldown`) · competition: group `commerce-recovery` with Abandoned Selection and Unresolved Interest on scope `person`; precedence: process > selection > interest (the more authoritative state wins, GLB-04) · person-level pressure: promotional class default one per day.

**Idempotency [C].** Touch key `logical_process_id + touch.id`.

**Implementation.** events (derived): `process_started, process_resumed, process_completed, process_cancelled, process_expired, items_removed_all, payment_failed` · attributes required: `logical_process_id, person_id, items[], started_at, last_activity_at, resume_destination`; optional: `expires_at, value, currency, category, has_active_app_session, hold_expires_at, delivery_cutoff_at` · capabilities (derived): delayed-execution, event-cancellation, attribute-date-wait, consent-lookup, contactability-lookup, frequency-counter, deep-link-binding, holdout-assignment, idempotent-send.

**Measurement.** journeyOutcome: exits `success | timeout | no-action | suppression` (the journey did its job whichever of these it reached) · businessOutcome `process_completed`, unit instance, observationScope self, window until-exit, attribution touched-before-event, comparison **persistent-holdout required** [C for the *method*; share **[D 10 %, medium]**] · secondary `process_resumed` · guardrails `unsubscribe, complaint, message_after_success, incentive_issued, support_contact_within_24h` · operational `entry_volume, no_action_rate_by_reason, role_used_t1, branch_distribution`.

**Discovery.** aliases `checkout abandonment, abandoned checkout, checkout recovery, begin checkout, cart recovery (checkout stage)`; useCases: a started checkout with items that has gone quiet; presets: *Checkout Abandonment* (overrides none beyond destination = checkout session), *Quote Abandonment* (destination = the quote; `recovery.first_check` **[D 4–24 h]** because quotes are considered), *Application Abandonment* (destination = the application; hard deadline via TIM-61 handoff), *Incomplete Registration* (destination = the registration step; `recovery.first_check` **[D 1–4 h]**; identity verification via IDN-81 handoff).

**Node count in the current schema:** trigger, 4 conditions (`c.state` reused via the graph, `c.sendable`, `c.resumed-since`, `c.expiry-real`), 3 waits, 3 communication actions, 1 internal action (record/no-action), 5 exits, 1 handoff — **18 nodes**, of which the touch plan shows 3 rows.

---

### Q2 · Payment Failure Recovery — FIN-134 upgraded

The current FIN-134 graph is kept (failure-class routing, idempotent retry, alternate-route authority, `w.alternate-choice`, `w.recovery`, handoffs to TIM-65/TIM-62/ACC-78). What vNext adds is below; nothing in the graph changes except the two waits gaining `Config` and `until` becoming registry refs.

**Identity.** FIN-134 · surface customer · priority **transactional** · pressure class none · channels `email, in-app, push, sms`.

**Objective.** Get the obligation paid by responding to the failure that actually happened, while the obligation stays alive and the relationship's state is decided elsewhere (SUB-165, TIM-65).

**Entity [C].** The **payment obligation** (`obligation_id`) and the failed attempt against it: `instanceKey: ["obligation_id"]`, concurrency one-active-per-key (a second failure on the same obligation while recovery is open is an event inside this instance, not a new one — GLB-19). A person with two obligations has two instances, each transactional and therefore not capped against each other.

**Trigger [C].** `payment_failed` — an authoritative provider response classifying an attempt as failed. Insufficient alone: a timeout or unknown outcome (that is FIN-135 Unknown Payment Reconciliation); a declined *authorisation hold* with no obligation behind it.

**Eligibility [C].** Obligation still outstanding; failure class established (temporary / customer-fixable / declined-or-unknown-reason); no open instance for the obligation; the relationship not already terminated (TRM-*).

**Suppressions [C].** Exit on `obligation_satisfied` by any means; on `obligation_cancelled_or_waived` (FIN-139/SUB-165); a corrective request is never sent while a *system-side* retry is scheduled and may still succeed (the class decides: temporary → retry first, no message); never send a corrective request for a decline whose reason cannot be turned into an instruction (the graph's `c.alternate` path). Hard gates apply; **pressure caps do not** (transactional). Recorded no-action reasons: retry-in-progress, no-instruction-possible, obligation-resolved-meanwhile.

**Channel strategy [D, high].** `in-session` ← in-app when the person is in the product (the corrective action is a form) → `persistent` ← email (the instruction and the link survive) → `urgent` ← sms, push only when the obligation has an asserted consequence date (grace end, service restriction date) **and** permission exists for service messages [O]. Fallback same-role-other-channel once. Simultaneous never.

**Orchestration — strategy `notice-then-confirm` with an embedded decision.**

| Touch | Gated by | Timing | Prerequisites | Channel roles (ordered) | Purpose | Destination | Label |
|---|---|---|---|---|---|---|---|
| t1 corrective-request (`a.corrective`) | none (sent on classification) | — | `c.class` = customer-fixable [C]; send path | in-session → persistent | the exact corrective action (update method, complete authentication, choose another method); what is owed; no provider risk detail, no internal codes [C] | payment-method update flow, boundTo `obligation_id` [C] | CANONICAL_RULE |
| t1′ offer-alternate (`a.offer-alternate`) | none | — | `c.class` = declined/no reason · `c.alternate` = customer must choose [C] | in-session → persistent | the available alternatives and that the obligation stands either way | payment-method choice flow | CANONICAL_RULE |
| t2 reminder | `w.recovery` (existing) until `obligation_satisfied`, `recovery_abandoned`; timeout `payment.recovery_window` class recovery-window, relativeTo trigger, **[R — the obligation class's grace/consequence policy sets it; shape hint: the grace end recorded by TIM-65 when one exists]**; recheck: obligation still outstanding and method still invalid [C] | `c.recovered` ≠ satisfied · consequence date exists [C] | persistent; urgent only if a consequence date is within `payment.urgent_horizon` **[D 48 h, medium]** [O] | one reminder naming the consequence and its date; the same corrective action | same | OPTIONAL_STRATEGY (many companies rely on the consequence handoffs instead) |
| confirmation (`a.confirmed`, new) | — | — | `c.recovered` = satisfied | persistent | confirm the obligation is discharged and nothing further is expected (TIM-268's rule) | receipt/obligation view | CANONICAL_RULE |

**Response handling [C].** Business events only: `payment_method_updated`, `authentication_completed`, `alternate_method_selected`, `obligation_satisfied`, `recovery_abandoned`. A system retry (`a.retry`) runs under the **same idempotency key as the failed attempt** [C]; a customer-triggered retry after a method update is a **new attempt with its own key** [C]; `a.use-alternate` is a new attempt. `w.alternate-choice` timing class response-window **[D 3–7 days, medium; avoidWhen consequence date sooner → consequence date minus margin]**.

**Failure paths [C].** Provider unavailable → OPS-124 backoff under the same key; unknown outcome → FIN-135 before any retry (GLB-20); delivery failure of t1 → CMS-208 *and* the obligation still proceeds to `c.next` on timeout (a message failure never extends the obligation); contactability loss → CON-36 with the obligation unchanged.

**Exits.** `x.recovered` success (`obligation_satisfied`; re-entry: a future failure on a future obligation) · `x.no-action` (retry-in-progress or no-instruction; instance continues internally — recorded, not exited, until `c.next`) · `h.grace` → TIM-65 · `h.overdue` → TIM-62 · `h.restrict` → ACC-78 (handoff exits carry `contract.requiredFields: obligation_id, amount_outstanding, failure_class, attempts, consequence_policy`).

**Contact.** defaultPriority transactional · pressureClass none · `Touch.mandatory: true` on t1/t1′/confirmation · localCap `{ value: [D 1 discretionary message before the consequence handoff, medium; basis corpus-rule GLB-24], appliesTo: "non-mandatory" }` — the corrective request and the confirmation are mandatory and do not count; only the optional reminder does · cooldown not-applicable (per obligation) · competition: none declared (transactional outranks by class); SUB-163 already treats an open FIN-134 as a renewal blocker; RET-28's offer step yields to an open FIN-134 on the same account (added to `retention-outreach` precedence text).

**Idempotency [C].** Attempt key = provider idempotency key per attempt; message key = `obligation_id + touch.id`.

**Implementation.** events (derived): `payment_failed, payment_method_updated, authentication_completed, alternate_method_selected, obligation_satisfied, recovery_abandoned, obligation_cancelled_or_waived` · attributes required: `obligation_id, person_id, amount_outstanding, currency, failure_class, failed_at, method_id, alternate_methods[], consequence_date (nullable)`; optional: `provider_reason_code (never shown), grace_policy_id` · capabilities: delayed-execution, event-cancellation, attribute-date-wait, consent-lookup, contactability-lookup, deep-link-binding, idempotent-send.

**Measurement.** journeyOutcome: exit `x.recovered` or handoffs `h.grace | h.overdue | h.restrict` (the journey has done its job once the obligation is recovered or its consequence is owned elsewhere) · businessOutcome `obligation_satisfied`, unit instance, observationScope handoff-chain `[TIM-65]`, window through-handoff until `grace_period_ended`, attribution entered-before-event, comparison **pre-post** (a holdout that withholds a corrective instruction is not acceptable) · secondary `payment_method_updated` · guardrails `complaint, support_contact_within_24h, duplicate_charge (must be 0), message_after_success` · operational `failure_class_distribution, retry_success_rate, time_to_recovery, no_action_rate_by_reason, handoff_distribution`.

**Discovery.** aliases `dunning, failed payment, card decline recovery, involuntary churn, payment retry`; useCases: a subscription renewal or order payment declined; presets: none (SUB-165 is the relationship-state twin, linked, not a preset).

---

### Q3 · Appointment / Scheduled Event Reminder — SCH-266 upgraded

The current SCH-266 graph (time check → prerequisite prompt → wait → revalidate → valid? → critical? → at-risk or remind) is kept; SCH-280 No-Show Follow-Up remains the post-event journey it hands to via SCH-178/179.

**Identity.** SCH-266 · surface customer · `contact.defaultPriority` **service**; the at-risk touch overrides to **service-critical** with `priorityReason` "the service cannot be delivered without this prerequisite" · pressure class service · channels `email, sms, in-app`.

**Objective.** Get the customer's side of a confirmed commitment done before it arrives, and remind them from what the booking *is* at send time.

**Entity [C].** The **occurrence** of a commitment: `instanceKey: ["booking_id", "occurrence_id"]`, concurrency one-active-per-key; a recurring commitment is one instance per occurrence (the corpus already says so); a rescheduled occurrence is the *same* instance re-timed (`x.superseded` is for cancellation or material change, not for a moved time — moved time re-arms the waits from the new `scheduled_at` [C]).

**Trigger [C].** `booking_confirmed_with_customer_prerequisites` — authoritative confirmation of a scheduled commitment, with ≥0 customer-owed prerequisites recorded. Insufficient alone: an unconfirmed request (SCH-277); a prerequisite owned by the provider (SCH-174).

**Eligibility [C].** Booking confirmed and in the future; contactable for service messages; not already reminded for this occurrence.

**Suppressions [C].** Exit on `booking_cancelled`, `booking_materially_changed` (superseded); never send from a stale copy (every touch revalidates from authoritative state — the graph's `a.revalidate`) ; one reminder per occurrence; hard gates apply; service pressure class deduplicates against other service messages about the same booking (SCH-277 confirmation, SCH-180 reschedule). No-action reasons: cancelled-meanwhile, already-reminded, too-close-to-prompt, nothing-outstanding-and-reminder-disabled.

**Channel strategy [D, high].** `urgent` ← sms for the at-risk touch and, near the start time, the reminder (a same-day appointment is exactly the asserted deadline SMS exists for) → `persistent` ← email for the prerequisite prompt (it lists things to do) → `in-session` ← in-app when present. Fallback same-role-other-channel once. Simultaneous: never (the corpus's own rule: "one message rather than one message per requirement").

**Orchestration — strategy `deadline-countdown`.**

| Touch | Gated by | Timing | Prerequisites | Channel roles (ordered) | Purpose | Destination | Label |
|---|---|---|---|---|---|---|---|
| t1 prerequisite-prompt (`a.prompt`) | none; sent if `c.time` = time remains | — (the *decision* to send depends on `reminder.prompt_min_lead` **[D 48 h before `scheduled_at`, medium; applicableWhen prerequisites take a day to complete; avoidWhen same-day bookings → skip to t3]**) | `c.time` [C] | persistent | every outstanding prerequisite, whose it is, and the point by which each must be done — in one message [C] | booking detail / prerequisite completion, boundTo `booking_id` | CANONICAL_RULE when prerequisites exist |
| — | `w.prereq` until `prerequisites_completed`, `booking_cancelled`, `booking_materially_changed`; timeout `reminder.pre_start_window` class reminder-before-attribute, relativeTo attribute `scheduled_at`, **[D 24 h before, high; basis platform-convention; applicableWhen appointments; avoidWhen events with travel → 72 h]** | | | | | | |
| — | `w.prestart` (same timeout, re-armed after prerequisites complete) | | | | | | |
| revalidate (`a.revalidate`) | on timeout of either wait | — | — | — | re-read the booking from authoritative state: still confirmed, same time, same provider, which prerequisites outstanding [C] | — | CANONICAL_RULE |
| t2 at-risk (`a.at-risk`) | — | at `reminder.pre_start_window` | `c.valid` = still valid · `c.critical` = critical prerequisite missing [C] | urgent | the reminder plus the one thing that will stop this going ahead and the last point it can still be done; the time is **not** moved [C] | prerequisite completion | CANONICAL_RULE |
| t3 reminder (`a.remind`) | — | at `reminder.pre_start_window` | `c.valid` · `c.critical` = nothing critical [C] | urgent near start / persistent otherwise **[D: sms if `scheduled_at` − now ≤ 24 h, else email]** | time, place or joining route, anything outstanding that does not block | booking detail with joining route | CANONICAL_RULE |
| t4 day-of nudge | new `w.dayof` timeout `reminder.day_of_lead` **[D 2 h before, medium]** | | `c.valid` again [C] · `reminder.day_of_enabled` **[R]** | urgent | time and place only | joining route | OPTIONAL_STRATEGY |

**Response handling [C].** Business events: `prerequisites_completed`, `booking_cancelled`, `booking_rescheduled` (re-times the instance), `booking_materially_changed` (supersedes), `attendance_recorded` / `no_show_recorded` (SCH-178/179 own these after the start time). Engagement changes nothing; a "confirm you're coming" reply is `attendance_intent_declared` and is recorded as declared evidence, never as attendance.

**Failure paths [C].** Delivery failure → CMS-208; if t3 cannot be delivered on any role before `scheduled_at`, the instance records `no-action: undeliverable` and hands to SCH-174 so the provider side knows the customer was not reached [C — new handoff, small node change]. Time-zone: every `scheduled_at` comparison is in the booking's local time; delivery windows (GLB-27) are the recipient's.

**Exits.** `x.reminded` success-of-journey (the reminder was sent against a revalidated booking; the *outcome* is measured on attendance via SCH-178) · `x.superseded` invalid-state · `x.no-action` no-action with reason · `h.at-risk` → SCH-174 (critical prerequisite outstanding at pre-start) · `h.undeliverable` → SCH-174.

**Contact.** defaultPriority service; t2 overrides to service-critical · pressureClass service · localCap `{ value: [D 3, medium; basis example-only], appliesTo: "non-mandatory" }` (prompt, one reminder, optional day-of; the at-risk notice is mandatory and outside the cap) · cooldown not-applicable (per occurrence) · competition: none; dedup against SCH-277/SCH-180 on the same `booking_id` by key.

**Idempotency [C].** `booking_id + occurrence_id + touch.id`.

**Implementation.** events (derived): `booking_confirmed_with_customer_prerequisites, prerequisites_completed, booking_cancelled, booking_rescheduled, booking_materially_changed, attendance_recorded, no_show_recorded` · attributes required: `booking_id, occurrence_id, person_id, scheduled_at (with timezone), location_or_joining_route, prerequisites[] {id, owner, due_by, status}, provider_id`; optional: `service_type, travel_required` · capabilities: attribute-date-wait, event-cancellation, delayed-execution, consent-lookup, contactability-lookup, deep-link-binding, idempotent-send.

**Measurement.** journeyOutcome: exit `x.reminded` or handoff `h.at-risk` (a correct reminder was sent, or the provider side was told the customer is not ready) · businessOutcome `attendance_recorded`, unit instance, observationScope handoff-chain `[SCH-178]`, window through-handoff until `service_completion_recorded`, attribution entered-before-event, comparison **pre-post** (withholding reminders from a holdout is defensible for low-stakes bookings and is offered as `persistent-holdout` **[O]**; default pre-post) · secondary `prerequisites_completed` · guardrails `complaint, reminder_sent_for_cancelled_booking (must be 0 — measures revalidation), duplicate_reminder_per_occurrence (must be 0)` · operational `prompt_sent_rate, at_risk_rate, no_action_rate_by_reason, channel_role_used, time_between_reminder_and_start`.

**Discovery.** aliases `appointment reminder, booking reminder, pre-appointment prep, reservation reminder, event reminder`; useCases: a confirmed appointment, class, delivery slot, reservation or event with things the customer must do first; presets: *Appointment Reminder* (24 h / 2 h), *Event Reminder* (`reminder.pre_start_window` 72 h; `prompt_min_lead` 7 days), *Delivery Slot Reminder* (prerequisite = access instructions; roles sms-first).

### What the three specifications proved about the schema

- The same `Orchestration` shape held for progressive recovery, a decision embedded in a notice, and a deadline countdown **without special cases** — but only after two changes made during authoring: `Touch.gatedBy` had to be optional (t1 of payment failure and the appointment prompt are sent on classification, not after a wait), and `WaitNode.timeout.relativeTo` needed `attribute` with an `attribute` name (both the appointment waits and abandonment's first check are relative to a stored timestamp, not to the trigger).
- `Touch.label` is what keeps optional touches (abandonment t3, payment reminder, day-of nudge) out of CANONICAL_RULE without hiding them.
- The measurement model needed `attribution: touched-before-event` for recovery and `entered-before-event` for reminders; one attribution rule would have been wrong for one of them.
- Nothing in any of the three is stated in two places: timing only on waits, channels only in the strategy + role, destinations only on touches, suppressions only in `suppressions` with the graph's exits referencing them by class.

---

### Q.4 · Portability stress test

For each of the three, could it map onto typical orchestration primitives? Conceptual only — this repository has no connected orchestration platform, and no deployment is claimed. Gate 2 replaces this table with generated lowering fixtures and written mapping notes.

| Concept | Braze (Canvas) | Insider (Architect) | SFMC (Journey Builder) | Iterable / Customer.io | Verdict |
|---|---|---|---|---|---|
| Event-triggered entry with attribute filters | entry event + audience filter | event trigger + condition | entry event (data extension/API event) + decision split | event trigger + filter | clean |
| Wait relative to a *stored timestamp* (`relativeTo: attribute`) | delay until custom attribute date | wait until date attribute | wait by attribute (date) | wait until date property | clean |
| Wait cancelled by business events (`until`) | action paths / exit on event | wait-until-event branch | journey exit criteria + re-entry; wait-until-event limited | wait-until-event / goal exit | **SFMC partial**: multi-event cancellation needs exit criteria + re-entry, which resets touch state; document as a known mapping cost |
| Re-read authoritative state before send (`recheck`) | audience path/filter step before message | condition step | decision split before send | filter step | clean **if the attribute is synced** — the recheck depends on the company's sync latency (implementation.attributes must note freshness) |
| Channel *roles* resolved at send time | message step per channel with audience conditions | channel step per condition | engagement/decision splits per channel | channel step per condition | clean; roles become one branch per role — 2–3 branches, not 15 |
| Same-role fallback on delivery failure, once | bounce/token-invalid triggers a follow-up action path | delivery failure branch | send log + re-entry | delivery event triggers | clean; SFMC via re-entry |
| Pressure caps by class across journeys | frequency capping by tag | global caps | contact frequency (Einstein) | frequency capping | **partial on SFMC/Customer.io** (class-level caps are coarse); the journey's own `localCap` and dedup key still hold |
| Persistent holdout | control group on Canvas | control group | random split with persistent segment | holdout groups | clean |
| Idempotent touch key | dedup by external id / custom event property | dedup key | send log dedup | idempotency key on API events | clean |
| Two-recipient send (CON-264) | two message steps to two profiles | two steps | two contacts | two calls | clean but unusual; the spec must say "two sends, two destinations" (it does) |
| Semantic events mapped to company events | custom events | events | API/data-extension events | events | clean; `commonMappings` is the checklist |

Too theoretical to implement anywhere: none of the schema's concepts. Two concepts are *expensive* on some platforms — multi-event wait cancellation on SFMC and class-level pressure caps on SFMC/Customer.io — and the `implementation.capabilities` list is exactly where a company sees that before starting.

---

## R. Revised migration impact

| Work item | Count | Basis |
|---|---|---|
| Journeys that change product surface (leave the current "communication vs internal" site split) | **91** — 67 silent customer states move to the customer surface; 24 mechanisms leave both lists | surfaces.json |
| Customer journeys (surface) | **133** today → **135** after 3 retired records (2 merge decisions) and 5 additions | §N, §O |
| …of which communicating (get `orchestration`, `channelStrategy`, `contact`) | **66** today → **68** (−FBK-44, −FBK-45, −ACT-15; +5 new) | |
| …of which silent lifecycle states (no orchestration) | 67 | |
| Runtime mechanisms (converted to contract format, no touch plan) | 24 | |
| Operational workflows (operational readiness standard) | 124 | |
| New canonical journeys | **5** | §N |
| Presets | **10** (checkout, quote, application, registration; cart, saved item; browse, product-view, search; predicted next purchase) | §N |
| Alias sets authored | 135 customer journeys (12 named in §N; every customer journey gets ≥2) | §M |
| Semantic-event registry entries | *estimate* 180–240 after normalising 281 trigger events and the `until` vocabulary (exact count is a Gate 1 deliverable) | |
| Waits gaining `Config` | 209 (141 need class + default or `required`; 33 need a default; 35 need `relativeTo: attribute` only) | audit B1 |
| Touches authored | *estimate* 159 communication actions → ~150 touches after merges, +12 for new journeys | actions.communication = 159 |
| Node changes in existing customer journeys | ~40 (entry guard, post-send response condition, recheck-before-timeout-send) + 1 (SCH-266 `h.undeliverable`) + 1 (FIN-134 `a.confirmed`) | audit §I |
| Merges / splits | 2 / 0 | §O |
| `insufficientAlone` to author | 94 (now required by schema) | |
| `idempotencyKey` to author | 51 journeys with external side effects | |
| `attemptBudget` to author | 3 loops + every retry/reminder ladder (OWN-55, DEC-184, CMS-208, FUL-276, CON-264 …) — *estimate* 25 | |
| `external:*` contracts to write | 30 | audit B8 |
| Structural rewrites | **0** | |

---

## S. Revised migration plan (gated)

**Gate 0 — Architecture approved.** This document. Acceptance: §B surface rule, §F schema, §H taxonomy and §K collision model accepted or amended in writing. Nothing below starts before this.

**Gate 1 — Schema, registry, validator, scorer.** Add §F types as optional fields; seed the semantic-event registry from the 281 trigger events and the `until` vocabulary; implement §T's machine rules as *warnings*; implement the two readiness scorers (customer 16 dims, operational 11); regenerate the surface assignment. Acceptance: `tsc` clean; validator: 0 errors, warnings on every un-migrated journey; scorer report reproduces the audit's numbers; registry has no duplicate meanings; no corpus content changed.

**Gate 2 — Three reference journeys.** Author Q1 (new), Q2 (FIN-134 upgraded), Q3 (SCH-266 upgraded) in the schema. Acceptance: zero validator errors and zero unreviewed warnings on the three; the practitioner view (§19 of the brief) renders from data alone for each; a platform-neutral **lowering fixture** per journey (`production/lowering/<id>.json`) proves every vNext concept reduces to ordinary orchestration primitives — entry, condition, wait, event cancellation, state recheck, channel-role resolution, message, frequency gate, holdout, handoff, exit — plus mapping notes for Braze, Insider, SFMC and Iterable/Customer.io-style systems that mark unsupported or expensive constructs; no deployment is claimed, because this repository has no connected orchestration platform; a second author can read the touch plan and reproduce the graph's send order without seeing the graph.

**Gate 3 — Fifteen gold standards.** The §P set. Acceptance: zero warnings; every `TimingClass`, `Orchestration.strategy`, `PriorityClass` and both attribution modes exercised at least once; the collision scenario in §K executed against the set on paper with recorded outcomes; the two merges done.

**Gate 4 — Customer surface.** The remaining 120 customer journeys (135 minus the 15 gold standards): silent states get `eligibility`/`suppressions`/`implementation`/`measurement`/`discovery` and wait configs; communicating ones additionally `orchestration`, `channelStrategy`, `contact`, node changes; presets and aliases; site split to the three surfaces. Acceptance: validator errors enabled for the customer surface; median customer readiness ≥ 80 %, no journey < 65 %; every communicating journey has ≥1 `no-action` reason and a holdout decision; all 5 new canonical journeys (Abandoned Process Recovery, Abandoned Selection Recovery, Unresolved Interest Recovery, Predicted Need Replenishment, Lapsed Customer Win-Back) exist and validate; all 10 presets (Checkout, Quote, Application, Incomplete Registration; Cart, Saved Item; Browse, Product View, Search; Predicted Next Purchase) render as cards that open their parent with the preset applied; the 3 retired ids resolve to their survivors; the Customer Journey total equals 135.

**Gate 5 — Mechanisms and operational workflows.** Mechanisms rewritten as contracts (inputs, outputs, what they guarantee — no touch plan); operational workflows get the §D fields. Acceptance: validator errors enabled corpus-wide; `external:*` contracts written or replaced; operational median ≥ 75 % on the operational scorer.

**Gate 6 — Regenerate derived artefacts.** Recipes, search index, SEO metadata, production model — all rebuilt from vNext, none hand-edited. Acceptance: the recipe document is byte-identical on two consecutive builds; the old "communication/internal" lists are gone.

---

## T. Automated validator specification (revised)

### Machine-checkable (extend `validate-canonical.mjs`)

| Rule | Detects | Severity |
|---|---|---|
| `orch_touch_not_in_graph` | a touch's `action`, `gatedBy` or `prerequisites` name a node that does not exist or is not the right kind | error |
| `orch_path_broken` | consecutive touches are not connected by a graph path through the named gate and prerequisites (**drift**) | error |
| `orch_missing` | customer communicating journey without `orchestration` | error |
| `orch_action_untouched` | a communication action not referenced by any touch | error |
| `touch_no_recheck` | a touch gated by a wait timeout whose wait has no `recheck` and no condition prerequisite reading authoritative state | error |
| `touch_no_destination` | a touch whose action text contains a CTA verb and no `destination` | warning |
| `touch_optional_as_canonical` | `label: CANONICAL_RULE` on a touch that a `Config` can disable, or that only follows an OPTIONAL_STRATEGY touch | error |
| `timing_unclassified` | `timeout.after` without `class`, or a `Config` with neither `default` nor `required: true` | error |
| `timing_stated_twice` | a duration or window appears in a touch, purpose, `does` or `suppressions` text while the wait carries it (**duplicate source of truth**) | error |
| `default_without_basis` | `default` without `basis` or `confidence`; `basis: published-benchmark` without a citation | error |
| `canonical_rule_contains_number` | a digit followed by a time/currency/percent unit inside any string labelled CANONICAL_RULE, a `rule`, `eligibility`, `suppressions` or `guardrails` | error (detection limited to explicit units; see human review) |
| `duplicate_source_of_truth` | the same registry event id listed in `implementation.events` by hand; channel names inside `Touch` or `ActionNode`; a destination inside `does` | error |
| `until_not_registry` | `wait.until` or `trigger.event` not in the semantic-event registry | error |
| `measurement_event_not_in_graph` | `measurement.outcome.event` not present in any `until`/exit/handoff of the journey | error |
| `message_after_success` | a communication action reachable from a branch whose `observes` is the outcome event | error |
| `engagement_as_prerequisite` | a touch prerequisite or `until` naming an engagement-class registry event (open/click/read) | warning → human review |
| `fallback_as_touch` | a touch whose only prerequisite is a delivery-failure event of the previous touch | error |
| `simultaneous_without_reason` | two touches gated by the same wait with no `channelStrategy.simultaneous.reason` | error |
| `channel_role_undeclared` | a role in `Touch.channelRoles` not in `channelStrategy.roles`, or role channels ⊄ `journey.channels` | error |
| `touch_channel_role_ambiguous` | `Touch.channelRoles` empty, duplicated, or listing two roles whose `when` conditions are identical (nothing decides between them) | error |
| `role_no_eligible_channel` | a declared role maps to no channel in `journey.channels` | error |
| `contact_missing` / `pressure_class_conflict` | communicating journey without `contact`; `priority` transactional/security with `pressureClass` ≠ none; `mandatory` touch in a promotional journey | error |
| `competition_undeclared` | communicating customer journey with neither `competition` nor explicit `none` | error |
| `no_action_missing` | `orchestration.noAction` empty, or a suppression with no corresponding `no-action` reason | error |
| `exit_unclassed` / `no_success_or_handoff` | exit without `class`; journey with neither a `success` exit nor a handoff | error |
| `instance_key_missing` | `entity.instanceKey` empty | error |
| `loop_uncapped` | cycle containing a wait with no `attemptBudget` on the loop and no attribute-bound wait | error |
| `tx_no_idempotency` | action with an external side-effect verb and no `idempotencyKey` | error |
| `alias_missing` | customer journey with `discovery.aliases` empty; preset without ≥1 alias | error |
| `preset_changes_graph` | a preset override key that is not a `Config.key` or `channelStrategy.roles` | error |
| `surface_rule_mismatch` | authored `surface` differs from the derived one with no reason | warning |
| `trigger_no_negative_evidence` | `insufficientAlone` empty | error |
| `orch_timing_duplicate` | a duration, offset or window stated in a touch, purpose or strategy text while the referenced wait already carries it | error |
| `downstream_measurement_unreachable` | `businessOutcome.observationScope: handoff-chain` names journeys this journey does not hand off to, in order, or the event is absent from the chain's last journey | error |
| `mandatory_cap_conflict` | `localCap.appliesTo: "all"` on a journey with a mandatory touch, or a mandatory touch in a journey whose `defaultPriority` is promotional/lifecycle with no `priorityReason` | error |
| `surface_count_drift` | the derived surface counts differ from the totals recorded in the migration report | error |
| `invalid_priority_override` / `touch_priority_unresolved` / `mandatory_promotional_conflict` | see §K | error |
| `suppression_unlabelled` | a suppression without a `label`, or a strategy statement (`channelStrategy`, `Preset.applicableWhen`, `contact.cooldown.rule`) without one where classification matters | error |
| `external_target_uncontracted` | `external:*` handoff without a contract entry | error |

### Human review (cannot be linted)

- Is a CANONICAL_RULE actually semantic, or a preference in disguise? The machine catches numbers with units; it cannot catch "never in the first message".
- Is each default's `basis` honest, and is `applicableWhen` the real boundary?
- Does a `channelStrategy` role order reflect this message's urgency or a copied template?
- Is `attribution` right for this journey's mechanism (recovery vs reminder vs silent state)?
- Is the instance key the business object, or the platform's identifier?
- Would a practitioner delete a touch or a branch on implementation day — and if so, why is it canonical?
- Does a preset's `applicableWhen` describe a real specialisation, or a keyword?
- Is the `engagement_as_prerequisite` warning justified by the use case (security: maybe; promotion: never)?

---

## U. Final decision questions

**Q1 — Are the existing state-machine graphs fundamentally reusable?** Yes. Re-verified in this pass; the three reference specifications reuse FIN-134 and SCH-266 unchanged apart from two small node additions, and the new journeys use the same seven node kinds. No structural rewrite anywhere.

**Q2 — Should all 281 remain first-class public "journeys"?** No. 133 are customer journeys (66 communicating, 67 silent lifecycle states shown as states, not campaigns); 24 are runtime mechanisms that stop being presented as journeys and become contracts; 124 are operational workflows with their own surface and standard.

**Q3 — Should Customer Journeys and Operational Workflows have separate product surfaces?** Yes — two products in one repository over one schema, plus the mechanism layer both depend on. Cross-surface handoffs render as links with contracts.

**Q4 — Does the revised schema let a company implement a communication journey without designing its cadence?** Yes, once migrated: the touch plan names every touch, its gate, its prerequisites, its role and its destination; every wait carries a class and a default or an explicit CONFIG_REQUIRED; the company supplies values, mappings and copy. Today it does not — that is what Gates 2–4 change.

**Q5 — Does the schema distinguish universal semantics from defaults and configuration strongly enough?** Yes: four labels, `Config` with rule/default/required, defaults that must carry confidence and basis, and a validator that rejects a number inside a canonical rule. The residual risk is prose rules with no unit ("never in the first message"), which is left to human review and named as such.

**Q6 — Can the schema represent Checkout Abandonment, Payment Failure and Appointment Reminder cleanly without special cases?** Yes, after two amendments made while authoring them (optional `gatedBy`; `relativeTo: attribute` with an attribute name). No prose blocks stand in for structure in any of the three.

**Q7 — What is the smallest migration that achieves the product goal?** Gates 1–4 on the customer surface only: schema + registry + validator; 3 reference journeys; 15 gold standards; then the remaining 120 customer journeys with orchestration on the 66 communicating ones, wait configs, aliases, presets and the site split. Operational workflows and mechanisms (Gate 5) can follow later without blocking the product goal, because nothing a lifecycle manager needs lives there except the mechanism contracts, which Gate 2 already writes for CMS-208, CON-36 and OPS-124.

**Q8 — What should we NOT migrate?** The 28-journey commercial archive as-is (it carries the same deferred-timing defect and would be re-authored against vNext journey by journey, five of them now). The 21 archive journeys outside this pass's coverage decisions. The previous Implementation Recipes (regenerated, never migrated). The `writes` ledger vocabulary (kept as-is; it is not the data contract). Message copy, thresholds, SLAs, incentive policy — never in the corpus. And the graphs themselves: they are the part that is already right.

---

*Artefacts produced by this pass (scratch, not committed): `surfaces.json` (per-journey surface assignment), timing-class clustering output, merge-candidate reads. No canonical, schema, generated or website file was modified.*
