# Runtime Mechanisms — production readiness audit

Scope: can a real company's journey engine execute each of these 24 mechanisms deterministically,
repeatably, and safely under production load - retries, duplicate events, concurrent journeys,
stale state, partial failure, and downstream outage - without creating contradictory lifecycle
state or duplicate side effects? This is the third production-readiness round on the canonical
corpus, after the communicating-journey round and the silent-lifecycle-state round, and the first
whose question is execution correctness rather than customer-state correctness. **This round is
audit only.** Nothing in `src/`, `production/`, `search/`, or `seo/` is touched.

## Corpus confirmation — 24, derived from current source

`src/canonical/surface.ts`'s `MECHANISM_IDS` — the same list `surfaceOf()` itself checks first,
before any other surface rule, and the same list `production/surface-assignment.json` and the
site both read — names exactly 24 ids: `CMS-201` through `CMS-208` plus `CMS-210` (9, skipping
`CMS-209`, which does not exist in the corpus), `CON-34`, `CON-35`, `CON-36`, `CON-39`, `CON-40`
(5), and `OPS-121` through `OPS-130` (10). All 24 were located and read in full from
`src/canonical/communication.ts` (the 9 CMS mechanisms), `src/canonical/consent.ts` (the 5 CON
mechanisms, interleaved with — and structurally distinct from — the CON-3x Silent Lifecycle
States CON-31/32/33/38 the prior round already audited), and `src/canonical/processing.ts` (all
10 OPS mechanisms, alone in that file).

**Leakage check, all zero:** none of the 24 route to a human channel (`sales`/`task` — 0 of 24);
exactly one (`CMS-208`) declares a message channel (all five: `email`/`push`/`sms`/`in-app`/
`whatsapp`), which is correct rather than leakage — `surfaceOf()` checks `MECHANISM_IDS` before
the `sends` rule, and CMS-208 is literally the delivery-recovery mechanism whose own job is
resubmitting through a channel, so declaring every channel it can resubmit through is the right
shape, not an escape from the mechanism surface. None of the 24 appear in the 68 message-sending
or 3 human-routing Customer Journey lists, none in the 64 Silent Lifecycle State list (re-checked
against the prior round's own dump), and none in the 124 Operational Workflow domain files.
Cross-checked against `283 canonical journeys` total (`validate:canonical`'s own summary line):
68 + 3 + 64 + 24 + 124 = 283, exact.

**One structural difference worth stating up front, because it shapes this entire audit's method:
none of the 24 declare `entity.instanceKey`, `entity.concurrency`, `implementation.attributes`, or
`measurement` (the vNext migration marker).** All 24 use the shorter, pre-vNext `entity: { scope,
note }` shape the corpus's earliest-authored journeys use. This means `scripts/vnext-rules.mjs`'s
`vnext` flag is `false` for every one of the 24, so every existing validator that checks
idempotency, handoffs, or conflict declarations treats all 24 as warning-only background noise —
confirmed directly: re-running `validate:canonical` shows 688 corpus-wide `state_write_without_
idempotency` warnings, a large share of which are these 24's own 90-plus writing actions, none of
them elevated to an error anywhere. **The two customer-facing rounds' entire method — check an
action's `idempotencyKey` string against the journey's own declared `instanceKey` — literally does
not apply here, because none of the 24 declare either field.** This is not itself scored as a
finding (the brief explicitly separates the customer-state layer's questions from this one's), but
every "is this idempotent" judgment below had to be made by reading the mechanism's own prose
reasoning about retries and duplicates, not by checking a field against a schema.

## Architecture findings

### Readiness distribution

| Verdict | Count | % |
|---|---|---|
| READY | 4 | 17% |
| READY_WITH_MAPPING | 13 | 54% |
| NEEDS_CONTRACT_WORK | 6 | 25% |
| NEEDS_RUNTIME_CHANGE | 1 | 4% |

Four mechanisms reach the corpus's first `READY` verdicts across all three production-readiness
rounds — `CMS-203` (Channel Eligibility Resolution), `CMS-205` (Send Eligibility Check), `CMS-207`
(Delivery Outcome Reconciliation), and `OPS-122` (Queue Lag Management) — genuinely READY, not
READY_WITH_MAPPING, because each is a side-effect-free-or-idempotent-by-construction decision/
measurement mechanism whose own graph already resolves every question this round asks, with
nothing left for a company mapping to supply beyond wiring it in.

### Priority counts

| Priority | Count |
|---|---|
| P0 | 1 |
| P1 | 6 |
| P2 | 12 |
| **Total findings** | **19** |

(Generated directly from `runtime-mechanism-contracts.json`'s `gaps` arrays — see
`READINESS-MATRIX.md`'s own totals line, produced by the same script, which will not drift from
this document.) One P0, not the double-digit count the customer-facing rounds found — not because
this corpus is safer in some general sense, but because most of its 24 mechanisms are read-decide-
recompute pipelines with low intrinsic duplication risk (17 of 24 need no concurrency primitive
at all), and where genuine side effects exist (submission to a provider, worker ownership
transfer), the mechanisms in question — `CMS-206`, `CMS-207`, `OPS-124`, `OPS-128` — already
reason about duplicate-safety correctly in prose, even without a structural field to check it
against. The one P0 (`CMS-201`) is exactly the case where that prose reasoning is genuinely
absent, on the one mechanism whose entire stated purpose is preventing the failure mode it turns
out not to prevent.

### Top 15 findings

1. **Every one of the 24 mechanisms lacks a structural idempotency/attempt-identity field, and 8
   of them name the concept explicitly in prose without ever declaring it** — `OPS-121`'s
   `a.persist` literally records "the idempotency and correlation keys" by that exact name;
   `OPS-124`'s `a.attempt` executes "under the same idempotency key"; `OPS-125` compares "the
   idempotency key" as its primary deduplication input; `CMS-206` mints and persists an
   `attempt_id` specifically so a later outcome has something to correlate against; `CON-35` and
   `CON-40` both propagate "origin and version" to prevent an out-of-order echo from reverting
   state. The concept is fully worked out, corpus-wide, in every case except one (`CMS-201`) — the
   field it should live in (`idempotencyKey`/`attemptBudget` on `ActionNode`) already exists in
   the schema and is simply never used across all 24.
2. **The one P0: `CMS-201`'s own stated purpose is the one thing its graph does not structurally
   prevent.** CMS-R1/R2 exist specifically to stop duplicate business events from creating
   duplicate communication obligations, and `c.existing`'s dedup check is a prose evaluation with
   no described atomic guard against `a.create` — a genuine check-then-act race under concurrent
   delivery of the same event, which a real message-queue at-least-once delivery guarantee makes
   a live scenario, not a theoretical one.
3. **No runtime primitive among the 24 enforces journey-declared `competition`/`exclusionGroup`/
   `precedence`.** Zero of 24 reference any of those three field names. The customer-facing corpus
   declares 7 competition groups (confirmed via `validate:canonical`'s own summary line) that some
   mechanism has to arbitrate deterministically at runtime, and none of the 24 claims that job —
   this is an absence finding, not a broken-mechanism finding, and per this round's own
   instruction it is not resolved by inventing a 25th mechanism inside this audit.
4. **Where duplicate/unknown-outcome handling exists, it is uniformly correct — 8 of 8.** Every
   mechanism that names an `UNKNOWN`/`DELIVERY_UNKNOWN`/`RECONCILIATION_REQUIRED`-shaped outcome
   (`CMS-206`, `CMS-207`, `OPS-121`, `OPS-123`, `OPS-124`, `OPS-127`, `OPS-128`, `OPS-130`) routes
   it to explicit reconciliation before any retry, never to a blind resend. This is the strongest,
   most consistent guardrail in the entire round.
5. **`CMS-207` (Delivery Outcome Reconciliation) is the single best-designed idempotent-consumer
   pattern found across all three production-readiness rounds** — an explicit `c.idempotent`
   condition classifying every inbound event as new/duplicate/late-and-weaker *before* any write,
   a first-class no-op exit for the duplicate case, and an explicit non-overwrite-of-stronger-
   evidence rule for late events. This is what "solved" looks like for the exact defect class the
   two earlier rounds spent entire repair passes fixing at the field level.
6. **`OPS-128` (Worker Failure Recovery) is the single most concrete concurrency primitive in the
   round** — an explicit lease with wait-out-the-lease-before-reclaiming semantics, correctly
   ordering "is completion already confirmed" ahead of any restart decision. Every other
   mechanism's vaguer "coordinate ownership" language (`OPS-123`) should converge on this
   vocabulary rather than reinventing it.
7. **`CMS-208`'s own `distinctFrom` claims it delegates retry execution to `OPS-124` ("uses that
   retry machinery rather than being it"); its graph shows a fully self-contained retry loop
   (`a.retry` → `c.budget` → `x.retrying`) with no handoff into `OPS-124` anywhere.** Read
   literally, the graph is internally consistent and safe (one owner: CMS-208 itself); the risk is
   an implementer trusting the prose and routing communication-channel retries through both,
   producing exactly the "caller retries AND mechanism retries without shared attempt identity"
   anti-pattern this round's brief names by name.
8. **Freshness/revalidation is genuinely strong: 12 of 24 mechanisms explicitly re-check
   authoritative current state before a consequential action**, and — notably — several of them
   are not conventions applied elsewhere but dedicated pipeline stages built for exactly this:
   `CMS-205` exists solely to revalidate a message immediately before send; `OPS-124`'s
   `a.revalidate` exists solely to revalidate a retry target before re-attempting; `OPS-129`'s
   `c.relevant` exists solely to revalidate a drained backlog item before releasing it. This is the
   silent-state round's "revalidate from now" house rule, implemented here as first-class
   architecture rather than a convention needing a validator to enforce.
9. **The retry contract, where it exists, is unusually mature**: durable budget that does not
   reset on worker restart (`OPS-124`, explicit), revalidation before every retry, side-effect-
   uncertainty gated before any repeat, and bounded-not-unbounded budgets throughout, all stated
   without inventing a single numeric retry count or backoff duration — every timing value is
   correctly deferred to "policy" or "the class's own SLA," honoring the DO-NOT list.
10. **`OPS-121` (Asynchronous Work Processing) is the domain's structural hub** (0 handoff
    consumers, 5 outbound handoffs — to `OPS-122`, `OPS-123`, `OPS-124`, `OPS-127`, `OPS-130`) and
    is also the single most consequential instance of finding 1: it is the very first action of
    the very first mechanism the whole OPS domain builds on, and it names "the idempotency and
    correlation keys" without ever specifying them.
11. **`OPS-126` (Partial Processing Recovery) has no confirmed real consumer in the current
    283-journey corpus** — the design (never replay successful children, honest escalation when no
    aggregation policy exists) is sound, but its one cross-reference (`DAT-225`) is a `distinctFrom`
    explicitly declining to use it, not an invocation. This may be infrastructure built ahead of
    demonstrated need rather than a defect — see `CONSUMER-COVERAGE.md`.
12. **`CON-34` (Frequency Recalculation) is the one mechanism in the round fully isolated from the
    rest of the canonical corpus by structural reference** — zero inbound handoffs, zero outbound
    handoffs, reachable only via its own named trigger event with no traceable emitter.
13. **The technical-completion-is-not-business-completion distinction (`OPS-130`) is the corpus's
    cleanest single architectural decision in this round** — named once, built as its own dedicated
    mechanism rather than folded into every producer, and explicitly idempotent by construction
    ("checking twice costs nothing and proves the same thing each time").
14. **Failure-taxonomy vocabulary is domain-appropriate, not accidentally duplicated**: `CMS-208`'s
    channel-specific classes (`TEMPORARY`/`PROVIDER_FAILURE`/`RATE_LIMITED`/`PERMANENT`/
    `INVALID_DESTINATION`/`CHANNEL_RESTRICTED`) and `OPS-121`/`OPS-124`/`OPS-126`'s generic
    infrastructure classes (`FAILED_RETRYABLE`/`FAILED_TERMINAL`/`UNKNOWN`/`PENDING`) genuinely
    answer different questions at different layers — this is Part 21's own stated exception
    ("unless domain meaning genuinely differs"), correctly applied, not an unreconciled duplication.
15. **Observability inside the mechanism layer is structurally weaker than either customer-facing
    layer's**, for a specific, corpus-wide reason: none of the 24 declare `implementation.
    attributes`, so there is no declared list of what a company's own mapping must persist to
    answer "what attempt/idempotency key was used" in production — every mechanism's own append-
    only log (`work_log`, `delivery_log`, `communication_log`, `dead_letter_log`, ...) names the
    right *concept* to persist, but not the field shape a company's schema must actually have.

### Recurring failure patterns worth naming once, not per-mechanism

- **"The idempotency key" as an assumed-but-uncontracted primitive.** Eight separate mechanisms
  across all three domains (CMS, CON, OPS) refer to an idempotency/attempt/correlation key or an
  origin+version pair as though it is a settled, existing concept in the system, and not one of
  them defines its shape, its provenance, or where a caller gets one. This reads less like 24
  independent oversights and more like a single undocumented assumption the entire mechanism layer
  was authored against — worth writing down explicitly as a house convention (see
  `SIDE-EFFECT-AND-IDEMPOTENCY-AUDIT.md`) rather than fixed 8 times independently in a repair round.
- **"Coordinate ownership" without naming the primitive.** `OPS-123` says two workers must not
  concurrently recover the same job; `CMS-201`'s dedup implicitly needs the same discipline;
  neither names a lease, lock, or compare-and-set the way `OPS-128` does concretely. Worth
  converging vocabulary on OPS-128's lease pattern rather than three different levels of precision
  for the same underlying requirement.
- **Prose claims of delegation that the graph does not show.** `CMS-208` → `OPS-124` is the one
  confirmed instance; worth a one-time corpus-wide grep for other `distinctFrom` text using "uses
  X's machinery rather than being it"-shaped language, to confirm it is not systemic (see
  `CONSUMER-COVERAGE.md`).
- **Zero conflict-arbitration coverage is a single finding wearing 24 mechanism-shaped hats, not
  24 findings.** Recorded once at the architecture level (finding 3 above); every mechanism's own
  `conflictArbitration.enforcesJourneyCompetition: false` is the same fact restated 24 times, not
  24 independent gaps, and is not counted as a per-mechanism P1/P2 for that reason — only as a
  cross-cutting architectural finding.

### Architecture assessment

The 24 mechanisms read as a genuinely mature execution-infrastructure design — considerably more
mature, in fact, than the customer-facing layers were before their own repair rounds. The
CMS-201→210 pipeline is close to a textbook implementation of the exact distinctions this round's
brief asks every mechanism to make (prepared/validated/submitted/accepted/delivered/read, kept
apart with zero collapsing found anywhere); the OPS-121→130 domain is a comparably careful model
of accepted-vs-completed, retryable-vs-terminal-vs-unknown, and worker-death-vs-work-failure. The
weaknesses this round found cluster tightly: one real concurrency gap (`CMS-201`), one real
caller/callee ambiguity (`CMS-208`/`OPS-124`), one confirmed architectural absence (conflict
arbitration), and a single systemic documentation gap (the assumed-but-uncontracted idempotency
key) that shows up as a P1 or P2 on roughly a third of the corpus without ever being a different
defect each time. **None of the 24 requires a canonical graph change to close what this round
found** except `CMS-201`, whose fix — an atomic check-and-create — is itself an implementation
detail of `a.create`, not a new node or a rewired edge; whether that counts as "the graph itself"
or "how a.create is safely implemented" is exactly the judgment call `NEEDS_RUNTIME_CHANGE` exists
to flag rather than pre-decide.

### Consumer coverage, summarized

Eight of the 24 mechanisms show zero handoff-traceable consumers. Six of those eight are correctly
so — `CMS-201`, `CMS-207`, `CON-35`, `CON-39`, `OPS-121`, `OPS-128` are event-triggered entry
points (an authoritative business/permission/worker-health event, not a journey handoff), which is
the expected shape for reusable infrastructure rather than a gap. Two are genuinely worth
flagging: `CON-34` has zero consumers *and* zero outbound handoffs (the only fully isolated
mechanism in the round), and `OPS-126` has zero confirmed consumers with its one cross-reference
explicitly declining to use it. Full detail, including every mechanism's representative
consumer ids, is in `CONSUMER-COVERAGE.md`.


## All 24 mechanisms, individually

## CMS-201 — Communication Obligation Creation

READINESS: NEEDS_RUNTIME_CHANGE

WHY:
The suppress/reuse/create split and CMS-R2's discipline are sound, but the graph itself, taken literally, has no way to handle duplicate execution: c.existing is evaluated and a.create commits with no described atomic guard between them, on the one mechanism the corpus explicitly built to prevent duplicate obligations (CMS-R1/R2, its own stated purpose). This is not a missing downstream contract - it is the check-then-act sequence itself, as authored, that is unsafe under concurrent delivery of the same authoritative_business_event.

RESPONSIBILITY:
Decide whether a business event actually creates a communication obligation, and deduplicate against an already-outstanding one for the same recipient.

INPUT CONTRACT:
- authoritative business event with an identified recipient (required) — provenance: an upstream business system (order, subscription, security, etc.) - not itself one of the 24

OUTPUT CONTRACT:
Classes: decision, persisted-mutation
Distinguishable outcomes: x.none (no obligation); x.reused (folded into existing); h.recipient (new obligation created)

SIDE EFFECTS:
Classes: decides-only, writes-internal-state

IDEMPOTENCY / ATTEMPT IDENTITY:
undeclared - two concurrent authoritative_business_event deliveries for the same recipient/subject both evaluate c.existing before either commits a.create, and nothing described stops both from creating separate obligations
Attempt identity: none named (provenance: undeclared). Structurally declared as a field: no.

CONCURRENCY:
Primitive: compare-and-set — not addressed - the audit surfaces this as the mechanism's own genuine gap, not a scenario it already reasons about

FRESHNESS / REVALIDATION:
Does not revalidate before execution (low or no consequential-action risk in this mechanism's own scope, or not applicable).

TIMEOUT / CANCELLATION:
no wait node in this mechanism

CONFLICT ARBITRATION:
Enforces journey-declared competition/exclusionGroup/precedence: no

OWNERSHIP:
Transfers ownership on: h.recipient → CMS-202

OBSERVABILITY:
What ran: CMS-201's own graph, via communication_log
Decision basis: Does a communication requirement exist for this event and this recipient?; Is an equivalent communication already outstanding for this recipient?
Side effect attempted: communication_log
Attempt identity: not recorded
Dependency response: recorded per-attempt where the mechanism crosses a provider/worker boundary (see delivery_log/work_log writes)
Current owner: transfers via its own handoff nodes; see handoffs

CONSUMERS:
entry point of the CMS pipeline; triggered by authoritative_business_event, presumably emitted by any of the 68 message-sending journeys' own execution:"communication" actions, but no canonical journey structurally hands off into CMS-201

TEST CASES:
- concurrent-invocation: given two authoritative_business_event deliveries for the same recipient and subject arrive within milliseconds of each other — expect exactly one communication obligation exists afterward, not two - UNVERIFIED, see gaps
- duplicate-invocation: given the same business event is redelivered (at-least-once queue semantics) — expect c.existing folds it into the prior obligation via a.reuse

GAPS:
- P0 [concurrency] The obligation entity created by a.create has no declared identity (no idempotencyKey/attemptBudget, no instanceKey-equivalent). c.existing's dedup check ("is an equivalent communication already outstanding") is evaluated before a.create commits, so two concurrent deliveries of the same authoritative_business_event can both pass c.existing and both create a separate obligation - each of which then independently flows through CMS-202 through CMS-206 and can result in the recipient receiving the same message twice. A compare-and-set or a keyed insert on (recipient, subject, purpose) is needed at a.create and is not described anywhere in the graph.
- P2 [consumer-coverage] No canonical journey structurally hands off into CMS-201; it is reached only via its own named trigger event, which is not itself emitted by any of the 68 message-sending journeys' own nodes in a traceable way.

---

## CMS-202 — Recipient Resolution

READINESS: READY_WITH_MAPPING

WHY:
Clean two-step who-then-where resolution with an explicit role-vs-named-party distinction and a real verification wait/timeout; every action is a pure resolve-and-record with no irreversible side effect, so retry risk is low even without a declared idempotencyKey.

RESPONSIBILITY:
Resolve who an obligation is actually owed to and which of their destinations currently work, before permission is evaluated.

INPUT CONTRACT:
- obligation with a stated purpose and required outcome (required) — provenance: CMS-201's h.recipient handoff

OUTPUT CONTRACT:
Classes: decision, route
Distinguishable outcomes: x.unresolved (RECIPIENT_UNRESOLVED); x.no-route (CONTACT_ROUTE_UNAVAILABLE); h.permission (ready, with destinations)

SIDE EFFECTS:
Classes: reads-only, decides-only, writes-internal-state

IDEMPOTENCY / ATTEMPT IDENTITY:
each action recomputes from current data (identity/role/destination resolution); re-running is naturally safe since nothing here mutates business state, only the mechanism's own routing log
Attempt identity: none named (provenance: undeclared). Structurally declared as a field: no.

CONCURRENCY:
Primitive: none-required

FRESHNESS / REVALIDATION:
Revalidates before consequential execution. Checks: destination currently valid (not merely present in the record); role's current holder, not who held it when the record was written

TIMEOUT / CANCELLATION:
- w.authorization: onTimeout → a.no-route

CONFLICT ARBITRATION:
Enforces journey-declared competition/exclusionGroup/precedence: no

OWNERSHIP:
Transfers ownership on: h.permission → CMS-203

OBSERVABILITY:
What ran: CMS-202's own graph, via communication_log
Decision basis: Is the intended recipient resolvable?; Does this recipient resolve through a role rather than a named person?; Is at least one valid destination available?; Does reaching this recipient at these destinations require further verification or authorization?; How did the authorization resolve?
Side effect attempted: communication_log
Attempt identity: not recorded
Dependency response: recorded per-attempt where the mechanism crosses a provider/worker boundary (see delivery_log/work_log writes)
Current owner: transfers via its own handoff nodes; see handoffs

CONSUMERS:
3 handoff consumers: CON-36 (contact-point restored, reroute), CMS-201 (new obligation), CMS-205 (destination invalidated mid-flight, reroute)

TEST CASES:
- stale-state: given a destination that was valid when the obligation was created has since hard-bounced — expect a.destinations excludes it; the obligation routes around it or reaches x.no-route if none remain

GAPS:
- P2 [idempotency] w.authorization's onTimeout path (a.no-route) and the verification wait itself have no declared attempt/idempotency field, though the low side-effect risk of this mechanism makes this a documentation gap rather than a correctness one.

---

## CMS-203 — Channel Eligibility Resolution

READINESS: READY

WHY:
One of the two READY verdicts in this round: a pure read-and-evaluate decision mechanism with an explicit, well-enforced write/read boundary against CON-35 (own distinctFrom names it precisely), no side effects beyond its own routing log, and an honest escalation to DEC-181 rather than inventing a permission rule when none is defined.

RESPONSIBILITY:
Decide whether a working destination may carry this specific message, given its purpose - reading permission state, never writing it.

INPUT CONTRACT:
- resolved recipient with candidate destinations (required) — provenance: CMS-202's h.permission handoff
- obligation's purpose (required) — provenance: carried from CMS-201 through CMS-202

OUTPUT CONTRACT:
Classes: decision
Distinguishable outcomes: h.route (channels permitted); x.undeliverable (UNDELIVERABLE_BY_POLICY); h.escalate (mandatory, no route); h.review (rules undefined)

SIDE EFFECTS:
Classes: reads-only, decides-only

IDEMPOTENCY / ATTEMPT IDENTITY:
pure evaluation against current permission state; re-running produces the same answer given the same state, no durable mutation to duplicate
Attempt identity: none named (provenance: undeclared). Structurally declared as a field: no.

CONCURRENCY:
Primitive: none-required

FRESHNESS / REVALIDATION:
Revalidates before consequential execution. Checks: current permission/consent/preference/suppression state at evaluation time, not a cached view

TIMEOUT / CANCELLATION:
no wait node in this mechanism

CONFLICT ARBITRATION:
Enforces journey-declared competition/exclusionGroup/precedence: no

OWNERSHIP:
Transfers ownership on: h.review → DEC-181; h.route → CMS-204; h.escalate → CMS-210

OBSERVABILITY:
What ran: CMS-203's own graph, via communication_log
Decision basis: Are the permission rules for this purpose and these channels defined?; What does the evaluation leave available?; Does a permitted alternate exist?; Does this obligation require escalation when no route is permitted?
Side effect attempted: communication_log
Attempt identity: not recorded
Dependency response: recorded per-attempt where the mechanism crosses a provider/worker boundary (see delivery_log/work_log writes)
Current owner: transfers via its own handoff nodes; see handoffs

CONSUMERS:
2 handoff consumers: CMS-202 (recipient/destinations resolved), CMS-208 (fallback channel needs its own purpose/permission check)

TEST CASES:
- happy-path: given a permission rule is defined and permits at least one channel for this purpose — expect h.route carries the permitted channels and the rule permitting each

GAPS:
none found

---

## CMS-204 — Channel Routing

READINESS: NEEDS_CONTRACT_WORK

WHY:
The smallest-valid-set selection discipline and the explicit non-duplication guardrails are sound, but a.prepare mints the prepared message instance with no declared identity - the identity CMS-206's attempt tracking later depends on is never explicitly established here.

RESPONSIBILITY:
Pick the smallest channel set that satisfies the obligation and prepare the message instance for it.

INPUT CONTRACT:
- one or more channels permitted for this obligation's purpose (required) — provenance: CMS-203's h.route handoff

OUTPUT CONTRACT:
Classes: decision, normalized-state
Distinguishable outcomes: h.send-ready (prepared message on a selected route)

SIDE EFFECTS:
Classes: decides-only, writes-internal-state
Naming vs. semantic truth: a.prepare "builds" the message but explicitly has not validated it - the node's own text is careful about this, but a caller relying on the node name alone could mistake preparation for something send-ready in the stronger sense CMS-205 alone actually guarantees

IDEMPOTENCY / ATTEMPT IDENTITY:
undeclared - a.prepare's own message-instance identity is never named, so whether re-invoking channel selection after a lost response reuses or duplicates the prepared instance is unaddressed
Attempt identity: none named (provenance: undeclared). Structurally declared as a field: no.

CONCURRENCY:
Primitive: none-required

FRESHNESS / REVALIDATION:
Does not revalidate before execution (low or no consequential-action risk in this mechanism's own scope, or not applicable).

TIMEOUT / CANCELLATION:
no wait node in this mechanism

CONFLICT ARBITRATION:
Enforces journey-declared competition/exclusionGroup/precedence: no

OWNERSHIP:
Transfers ownership on: h.send-ready → CMS-205

OBSERVABILITY:
What ran: CMS-204's own graph, via communication_log
Decision basis: Does the obligation genuinely require more than one channel?
Side effect attempted: communication_log
Attempt identity: not recorded
Dependency response: recorded per-attempt where the mechanism crosses a provider/worker boundary (see delivery_log/work_log writes)
Current owner: transfers via its own handoff nodes; see handoffs

CONSUMERS:
1 handoff consumer: CMS-203

TEST CASES:
- duplicate-invocation: given channel selection is re-invoked for the same obligation after a lost response — expect UNVERIFIED whether a second prepared message instance is created - see gaps

GAPS:
- P1 [idempotency] a.prepare creates "a channel-compatible message instance" with no declared identity for it. CMS-206 later persists "the message id, the attempt id" as though the message id already exists by then, but nothing in CMS-204 (or CMS-205) shows where a message id is minted or whether re-preparing after a retry reuses it.

---

## CMS-205 — Send Eligibility Check

READINESS: READY

WHY:
The single cleanest implementation of the corpus-wide revalidate-from-now house rule in this entire audit round - a dedicated mechanism whose only job is exactly what the silent-state round had to formalize as a convention (WaitNode.recheck) elsewhere. Explicit stale-content regeneration, explicit stale-destination reroute, explicit never-mutate-history guardrail.

RESPONSIBILITY:
Re-check the message is still true immediately before it is submitted, and stop or regenerate it if the world has moved.

INPUT CONTRACT:
- prepared message instance about to be submitted for delivery (required) — provenance: CMS-204's h.send-ready handoff

OUTPUT CONTRACT:
Classes: decision, normalized-state
Distinguishable outcomes: x.suppressed (stale, superseded); h.reroute (destination invalid); h.attempt (validated, ready to submit)

SIDE EFFECTS:
Classes: reads-only, decides-only, writes-internal-state

IDEMPOTENCY / ATTEMPT IDENTITY:
a.reread + a.regenerate recompute from current authoritative state on every invocation, which is naturally idempotent in effect even though no idempotencyKey is declared; the downstream CMS-206 attempt-correlation step is the actual duplicate-submission guard
Attempt identity: none named (provenance: undeclared). Structurally declared as a field: no.

CONCURRENCY:
Primitive: none-required

FRESHNESS / REVALIDATION:
Revalidates before consequential execution. Checks: the reason for the message and its subject both still stand; the recipient/channel is still valid; content that depends on data (amount, date, status, name) is still current

TIMEOUT / CANCELLATION:
no wait node in this mechanism

CONFLICT ARBITRATION:
Enforces journey-declared competition/exclusionGroup/precedence: no

OWNERSHIP:
Transfers ownership on: h.reroute → CMS-202; h.attempt → CMS-206

OBSERVABILITY:
What ran: CMS-205's own graph, via communication_log
Decision basis: Is the communication still valid?; Does the content depend on data that has changed since preparation?
Side effect attempted: communication_log, suppressed_sends
Attempt identity: not recorded
Dependency response: recorded per-attempt where the mechanism crosses a provider/worker boundary (see delivery_log/work_log writes)
Retried/suppressed/superseded: suppressed_sends log
Current owner: transfers via its own handoff nodes; see handoffs

CONSUMERS:
1 handoff consumer: CMS-204

TEST CASES:
- stale-state: given the appointment a reminder concerns was cancelled after preparation but before send — expect a.suppress fires; nothing is sent

GAPS:
none found

---

## CMS-206 — Send Attempt Status

READINESS: READY_WITH_MAPPING

WHY:
The strongest attempt-identity design in the round: attempt_id and message_id are explicitly persisted before the outcome is known specifically so a later-arriving outcome has something to correlate against, and the unknown-outcome path (timeout -> a.unknown -> c.duplicates -> h.reconcile) is exactly the corpus-wide UNKNOWN handling this round's brief asks every mechanism to have. The gap is purely structural: this attempt identity is never declared as an idempotencyKey field.

RESPONSIBILITY:
Record the handover to a provider - accepted, refused, or unknown - as a fact about the provider's queue, distinct from delivery.

INPUT CONTRACT:
- validated message submitted to a delivery mechanism or provider (required) — provenance: CMS-205's h.attempt handoff

OUTPUT CONTRACT:
Classes: execution-attempt, provider-status
Distinguishable outcomes: x.pending (SENT, DELIVERY_PENDING); h.recover (accepted-then-refused, or unknown-but-safe-to-resend); h.reconcile (unknown, duplicate would matter)

SIDE EFFECTS:
Classes: submits-to-provider, writes-internal-state

IDEMPOTENCY / ATTEMPT IDENTITY:
attempt_id is minted and persisted before the provider outcome is known; a later-arriving acceptance/refusal correlates against it. An unknown timeout does not trigger a blind resend - it branches on whether a duplicate would matter (c.duplicates)
Attempt identity: message id, attempt id (provenance: self-minted-on-entry). Structurally declared as a field: no.

CONCURRENCY:
Primitive: none-required

FRESHNESS / REVALIDATION:
Does not revalidate before execution (low or no consequential-action risk in this mechanism's own scope, or not applicable).

RETRY / FAILURE SEMANTICS:
Owns its own retry loop: no. Failure classes: retryable, non-retryable, unknown. Budget durable across restarts: undeclared. Revalidates before retry: no.

UNKNOWN OUTCOME:
Handled: yes — vocabulary: DELIVERY_UNKNOWN; reconciles via external:external-status-reconciliation (via h.reconcile) or CMS-208 (via h.recover, when a duplicate is harmless)

TIMEOUT / CANCELLATION:
- w.acceptance: onTimeout → a.unknown

CONFLICT ARBITRATION:
Enforces journey-declared competition/exclusionGroup/precedence: no

OWNERSHIP:
Transfers ownership on: h.recover → CMS-208; h.reconcile → external:external-status-reconciliation

OBSERVABILITY:
What ran: CMS-206's own graph, via delivery_log
Decision basis: What did the provider do with it?; Would a duplicate matter for this communication?
Side effect attempted: delivery_log, suppressed_sends
Attempt identity: message id, attempt id (named in prose, not a declared field)
Dependency response: recorded per-attempt where the mechanism crosses a provider/worker boundary (see delivery_log/work_log writes)
Retried/suppressed/superseded: suppressed_sends log
Current owner: transfers via its own handoff nodes; see handoffs

CONSUMERS:
1 handoff consumer: CMS-205

TEST CASES:
- unknown-outcome: given the submission connection drops before the provider accepts or refuses, and the message carries a payment link — expect a.unknown -> c.duplicates -> h.reconcile; no resend until the true state is established
- late-callback: given a provider acceptance arrives after the submission timeout already fired a.unknown — expect UNVERIFIED - the graph shows w.acceptance's onEvent path (c.outcome) and onTimeout path (a.unknown) as mutually exclusive branches with no described reconciliation if both eventually fire; see CMS-207 for the mechanism that does handle this for delivery outcomes specifically

GAPS:
- P2 [idempotency] attempt_id/message_id are named explicitly in prose as the correlation identity but are never declared as an idempotencyKey field or listed as required inputs elsewhere in the pipeline - the systemic gap named in SIDE-EFFECT-AND-IDEMPOTENCY-AUDIT.md, present here in its clearest form since the concept is otherwise fully worked out.
- P2 [unknown-outcome] A late provider acceptance/refusal arriving after w.acceptance's own timeout already routed to a.unknown is not explicitly addressed within CMS-206 itself - it presumably lands on CMS-207 (which does handle late/duplicate outcomes correctly), but CMS-206's own graph does not show that path.

---

## CMS-207 — Delivery Outcome Reconciliation

READINESS: READY

WHY:
The best-designed idempotent-consumer pattern in the entire round: an explicit c.idempotent condition classifying every inbound outcome as new/duplicate/late-and-weaker before acting on it, x.duplicate-event as a first-class no-op exit, and a.late's explicit non-overwrite-of-stronger-evidence rule. This is what the corpus-wide idempotency gap looks like when fully solved at the mechanism level.

RESPONSIBILITY:
Derive real delivery state from what the channel reports, correlated to the exact attempt and ordered correctly against what is already known.

INPUT CONTRACT:
- delivery event or status reported by the channel (required) — provenance: an external provider webhook/callback - not one of the 24

OUTPUT CONTRACT:
Classes: normalized-state, provider-status
Distinguishable outcomes: x.duplicate-event (no-op); x.late (recorded, not authoritative); h.obligation (DELIVERED); h.recover (DELIVERY_FAILED); h.reconcile (uncorrelated or ambiguous)

SIDE EFFECTS:
Classes: writes-internal-state

IDEMPOTENCY / ATTEMPT IDENTITY:
explicit: c.idempotent classifies every inbound event as new-and-current / already-processed / late-and-weaker before any write; repeated webhook delivery is a named, handled case ("channels repeat webhooks, and repeating the state change with them double-counts every delivery")
Attempt identity: the attempt it correlates to (provenance: correlated-to-prior-attempt). Structurally declared as a field: no.

CONCURRENCY:
Primitive: none-required

FRESHNESS / REVALIDATION:
Does not revalidate before execution (low or no consequential-action risk in this mechanism's own scope, or not applicable).

UNKNOWN OUTCOME:
Handled: yes — vocabulary: DELIVERY_UNKNOWN; reconciles via external:external-status-reconciliation (via h.reconcile)

ORDERING:
Required: yes — explicit new/duplicate/late classification against what is already recorded; a late failure never overwrites a confirmed delivery unless channel semantics explicitly say it does

TIMEOUT / CANCELLATION:
no wait node in this mechanism

CONFLICT ARBITRATION:
Enforces journey-declared competition/exclusionGroup/precedence: no

OWNERSHIP:
Transfers ownership on: h.reconcile → external:external-status-reconciliation; h.obligation → CMS-210; h.recover → CMS-208

OBSERVABILITY:
What ran: CMS-207's own graph, via delivery_log
Decision basis: Did it correlate to a known attempt?; Is this outcome new, repeated, or older than what is already recorded?; What does the channel report?
Side effect attempted: delivery_log
Attempt identity: the attempt it correlates to (named in prose, not a declared field)
Dependency response: recorded per-attempt where the mechanism crosses a provider/worker boundary (see delivery_log/work_log writes)
Current owner: transfers via its own handoff nodes; see handoffs

CONSUMERS:
0 handoff consumers within the canonical corpus - triggered externally by delivery_status_received (a provider webhook), correctly not journey-initiated

TEST CASES:
- duplicate-invocation: given the same delivery webhook fires twice — expect x.duplicate-event; recorded state unchanged
- late-callback: given a bounce notification arrives after a confirmed-delivery event for the same attempt — expect a.late records it without overwriting the stronger DELIVERED evidence, unless channel semantics say otherwise

GAPS:
none found

---

## CMS-208 — Message Delivery Recovery

READINESS: NEEDS_CONTRACT_WORK

WHY:
The failure-class taxonomy and destination-scoping discipline are exemplary, but this mechanism's own distinctFrom text claims it "uses OPS-124's retry machinery rather than being it" while its graph implements a fully self-contained retry loop (a.retry/c.budget/x.retrying) with no handoff to OPS-124 anywhere - a real caller/callee ambiguity about which mechanism owns the retry budget for a communication-channel failure.

RESPONSIBILITY:
Classify a delivery failure by its real cause and respond with the smallest correct action - retry, fallback, or stop - scoped to the destination, never the person.

INPUT CONTRACT:
- delivery failure reported authoritatively by the channel or provider (required) — provenance: CMS-206's h.recover or CMS-207's h.recover handoff

OUTPUT CONTRACT:
Classes: failure-classification, retry-schedule
Distinguishable outcomes: x.abandoned (superseded); x.retrying (within budget); h.contactability (permanent, raise CON-36); h.fallback (alternate channel); h.obligation (exhausted)

SIDE EFFECTS:
Classes: decides-only, submits-to-provider, writes-internal-state

IDEMPOTENCY / ATTEMPT IDENTITY:
"the retry budget is fixed at the first failure and does not renew" is stated as a rule, but no field declares where that budget lives or under what identity it is tracked
Attempt identity: none named (provenance: undeclared). Structurally declared as a field: no.

CONCURRENCY:
Primitive: none-required

FRESHNESS / REVALIDATION:
Revalidates before consequential execution. Checks: whether the communication is still relevant before recovering (c.relevant)

RETRY / FAILURE SEMANTICS:
Owns its own retry loop: yes (delegates to OPS-124 (per this mechanism's own distinctFrom text, not shown structurally)). Failure classes: retryable, non-retryable, unknown. Budget durable across restarts: undeclared. Revalidates before retry: yes.

TIMEOUT / CANCELLATION:
no wait node in this mechanism

CONFLICT ARBITRATION:
Enforces journey-declared competition/exclusionGroup/precedence: no

OWNERSHIP:
Transfers ownership on: h.contactability → CON-36; h.fallback → CMS-203; h.obligation → CMS-210

OBSERVABILITY:
What ran: CMS-208's own graph, via delivery_log
Decision basis: Is the communication still relevant?; What does the failure class call for?; Does retry budget remain?; Is an alternate channel available?
Side effect attempted: delivery_log, suppressed_sends
Attempt identity: not recorded
Dependency response: recorded per-attempt where the mechanism crosses a provider/worker boundary (see delivery_log/work_log writes)
Retried/suppressed/superseded: suppressed_sends log
Current owner: transfers via its own handoff nodes; see handoffs

CONSUMERS:
3 handoff consumers: CMS-206, CMS-207, DOC-214

TEST CASES:
- dependency-retryable-failure: given a TEMPORARY or RATE_LIMITED failure with retry budget remaining — expect a.retry, then c.budget re-evaluates
- partial-failure: given the same underlying communication also has an active OPS-124 retry instance for a non-communication side effect it triggered — expect UNVERIFIED whether the two retry budgets (CMS-208's own, and OPS-124's) are coordinated or independent - see gaps

GAPS:
- P1 [caller-callee-contract] distinctFrom OPS-124 states this mechanism "uses that retry machinery rather than being it," but the graph shows a.retry -> c.budget -> x.retrying as a fully self-contained loop with its own budget check and no handoff into OPS-124. Either the prose is describing an implementation detail invisible at the graph level (in which case it should say so), or this is a genuine duplicated retry-budget implementation - Part 23's exact double-ownership anti-pattern ("caller retries AND mechanism retries... without shared attempt identity").

---

## CMS-210 — Communication Obligation Closure

READINESS: READY_WITH_MAPPING

WHY:
The completion-semantics discipline is exemplary (attempt vs. delivery is never guessed, DEC-181 escalation when undefined), and the superseded-vs-unmet distinction is exactly the kind of output-class completeness the audit brief asks every mechanism for. Minor gap: no declared identity for re-invocation safety on a.complete/a.unreachable.

RESPONSIBILITY:
Close a communication obligation against the completion standard it actually requires - attempt or confirmed delivery - and escalate what could never be met.

INPUT CONTRACT:
- obligation whose deliveries have reached a state that could close it (required) — provenance: CMS-207's h.obligation or CMS-208's h.obligation handoff

OUTPUT CONTRACT:
Classes: decision, normalized-state
Distinguishable outcomes: x.superseded; x.completed (COMMUNICATION_COMPLETED); x.in-progress; x.unreachable (UNREACHABLE_FOR_PURPOSE); h.escalate (mandatory, unreachable); h.review (completion standard undefined)

SIDE EFFECTS:
Classes: decides-only, writes-internal-state

IDEMPOTENCY / ATTEMPT IDENTITY:
undeclared - a.complete/a.unreachable are terminal-writing actions with no idempotencyKey; re-evaluating a closure decision twice for the same obligation is not explicitly guarded, though the condition-driven recomputation shape makes accidental double-closure unlikely rather than structurally prevented
Attempt identity: none named (provenance: undeclared). Structurally declared as a field: no.

CONCURRENCY:
Primitive: none-required

FRESHNESS / REVALIDATION:
Revalidates before consequential execution. Checks: whether the communication became obsolete before delivery (c.obsolete)

TIMEOUT / CANCELLATION:
no wait node in this mechanism

CONFLICT ARBITRATION:
Enforces journey-declared competition/exclusionGroup/precedence: no

OWNERSHIP:
Transfers ownership on: h.review → DEC-181; h.escalate → DEC-181

OBSERVABILITY:
What ran: CMS-210's own graph, via communication_log
Decision basis: Did the communication become obsolete before it was delivered?; What does this obligation require to be satisfied?; Is delivery confirmed?; Is a documented send attempt on record?; Are all permissible delivery routes exhausted?; Is this communication mandatory or critical?
Side effect attempted: communication_log
Attempt identity: not recorded
Dependency response: recorded per-attempt where the mechanism crosses a provider/worker boundary (see delivery_log/work_log writes)
Current owner: transfers via its own handoff nodes; see handoffs

CONSUMERS:
3 handoff consumers: CMS-203 (escalated undeliverable), CMS-207 (confirmed delivery), CMS-208 (exhausted routes)

TEST CASES:
- happy-path: given delivery is confirmed and the obligation requires confirmed delivery — expect a.complete -> x.completed

GAPS:
- P2 [idempotency] No declared identity guards against re-processing the same obligation-closure decision twice; low risk given the condition-recomputation shape, but undocumented.

---

## CON-34 — Frequency Recalculation

READINESS: NEEDS_CONTRACT_WORK

WHY:
The default-optional-only scoping and the never-retroactive guardrail are sound, but this is the one mechanism in the round with zero structural connection to the rest of the corpus in either direction - no handoff targets it and it makes no handoffs of its own, and its own idempotency story for a.trim's suppression write is undeclared.

RESPONSIBILITY:
Recalculate optional-communication cadence when a frequency preference changes, prospectively only.

INPUT CONTRACT:
- deliberate change to how often communication should arrive (required) — provenance: a declared, first-party preference change - not modeled elsewhere in the 24

OUTPUT CONTRACT:
Classes: normalized-state, suppression-result
Distinguishable outcomes: x.applied

SIDE EFFECTS:
Classes: decides-only, writes-internal-state, suppresses-queued-work

IDEMPOTENCY / ATTEMPT IDENTITY:
a.recalculate writes with mode:"set" (naturally idempotent); a.trim appends to suppressed_sends with no idempotencyKey - a retried trim after a lost response could double-record the same suppression event, though the suppression effect itself (not sending) is idempotent in outcome even if the log duplicates
Attempt identity: none named (provenance: undeclared). Structurally declared as a field: no.

CONCURRENCY:
Primitive: none-required

FRESHNESS / REVALIDATION:
Does not revalidate before execution (low or no consequential-action risk in this mechanism's own scope, or not applicable).

TIMEOUT / CANCELLATION:
no wait node in this mechanism

CONFLICT ARBITRATION:
Enforces journey-declared competition/exclusionGroup/precedence: no

OWNERSHIP:
Does not transfer ownership via a handoff (closes locally or is itself a terminal step in its own chain).

OBSERVABILITY:
What ran: CON-34's own graph, via cadence_policy_applied
Decision basis: Does the governing policy extend this preference to required or transactional communication?; Does what is already queued exceed the new cadence?
Side effect attempted: cadence_policy_applied, cadence_state, suppressed_sends
Attempt identity: not recorded
Retried/suppressed/superseded: suppressed_sends log

CONSUMERS:
0 handoff consumers and 0 outbound handoffs - the only mechanism in the round fully isolated from the rest of the canonical corpus by structural reference

TEST CASES:
- happy-path: given a person reduces marketing frequency from weekly to monthly — expect future cadence recalculated; already-delivered messages untouched

GAPS:
- P1 [consumer-coverage] No canonical journey hands off into CON-34 and CON-34 hands off to nothing - it is the only mechanism in the round with zero structural connections in either direction. Its trigger event (frequency_preference_changed) is registered but not traceably emitted by any of the 283 journeys' own nodes.
- P2 [idempotency] a.trim's suppressed_sends write has no idempotencyKey.

---

## CON-35 — Permission Change Enforcement

READINESS: READY_WITH_MAPPING

WHY:
The enforce-first-propagate-after asymmetry is exactly the right design ("a grant applied late costs a message that could have been sent, a withdrawal applied late costs one that should not have been"), and origin/version-based propagation with an explicit CON-40 conflict escalation path is a genuine, well-reasoned optimistic-convergence pattern. Gap is purely structural: origin/version is never a declared field.

RESPONSIBILITY:
Stop affected communication the moment permission changes, and propagate the change to dependent systems asynchronously.

INPUT CONTRACT:
- recorded transition on an existing permission (required) — provenance: an authoritative permission system - not one of the 24

OUTPUT CONTRACT:
Classes: decision, suppression-result, persisted-mutation
Distinguishable outcomes: x.consistent; h.conflict (systems diverge)

SIDE EFFECTS:
Classes: writes-internal-state, suppresses-queued-work

IDEMPOTENCY / ATTEMPT IDENTITY:
a.propagate "carries origin and version so that an out-of-order echo cannot revert it and a redelivery cannot restart the exchange" - explicit ordering/idempotency reasoning, entirely in prose
Attempt identity: origin, version (provenance: undeclared). Structurally declared as a field: no.

CONCURRENCY:
Primitive: optimistic-version-check — an out-of-order echo or a redelivered propagation event, explicitly guarded against by origin+version comparison

FRESHNESS / REVALIDATION:
Does not revalidate before execution (low or no consequential-action risk in this mechanism's own scope, or not applicable).

ORDERING:
Required: yes — origin and version, so a redelivered or out-of-order propagation event is discarded rather than reapplied

TIMEOUT / CANCELLATION:
- w.converge: onTimeout → h.conflict

CONFLICT ARBITRATION:
Enforces journey-declared competition/exclusionGroup/precedence: no

OWNERSHIP:
Transfers ownership on: h.conflict → CON-40

OBSERVABILITY:
What ran: CON-35's own graph, via permission_log
Decision basis: Does this reduce permission or extend it?; Do the dependent systems now agree?
Side effect attempted: permission_log, suppressed_sends
Attempt identity: origin, version (named in prose, not a declared field)
Retried/suppressed/superseded: suppressed_sends log
Current owner: transfers via its own handoff nodes; see handoffs

CONSUMERS:
0 handoff consumers - triggered by authoritative_permission_change, an authoritative system event, appropriately not journey-initiated. Hands off to CON-40 on convergence failure.

TEST CASES:
- late-callback: given a propagation confirmation for an older version arrives after a newer one already converged — expect discarded by version comparison rather than reverting the newer state - per guardrail, UNVERIFIED against a declared field, see gaps

GAPS:
- P2 [idempotency] origin and version are named explicitly as the mechanism that prevents an out-of-order echo from reverting state, but neither is a declared field anywhere in this mechanism or its consumers.

---

## CON-36 — Contactability Recalculation

READINESS: READY_WITH_MAPPING

WHY:
The per-destination (not per-person, not per-channel) granularity is the single most important correctness property this mechanism has and it holds it without exception; contactability/permission separation is airtight. Bounded repair-cycle attempts are named in the guardrails but not structurally declared as an attemptBudget.

RESPONSIBILITY:
Track whether a specific destination can technically be reached, entirely separate from whether it may be used - per-destination, never per-person.

INPUT CONTRACT:
- a change in whether a contact point can technically be reached (required) — provenance: an authoritative channel/provider signal - not one of the 24

OUTPUT CONTRACT:
Classes: normalized-state, route
Distinguishable outcomes: x.resumed; x.alternative; x.unreachable; h.reroute (pending work affected); h.human (important, no route)

SIDE EFFECTS:
Classes: writes-internal-state, suppresses-queued-work

IDEMPOTENCY / ATTEMPT IDENTITY:
a.state/a.add/a.resume/a.suppress all append with no idempotencyKey; a repeated identical contactability signal (a provider re-reporting the same bounce) would append a duplicate log entry, though the resulting routing state itself is naturally recomputed and thus eventually consistent
Attempt identity: none named (provenance: undeclared). Structurally declared as a field: no.

CONCURRENCY:
Primitive: none-required

FRESHNESS / REVALIDATION:
Does not revalidate before execution (low or no consequential-action risk in this mechanism's own scope, or not applicable).

RETRY / FAILURE SEMANTICS:
Owns its own retry loop: no. Failure classes: retryable, non-retryable. Budget durable across restarts: undeclared. Revalidates before retry: no.

TIMEOUT / CANCELLATION:
- w.restore: onTimeout → x.unreachable

CONFLICT ARBITRATION:
Enforces journey-declared competition/exclusionGroup/precedence: no

OWNERSHIP:
Transfers ownership on: h.reroute → CMS-202; h.human → external:human-in-the-loop-lifecycle

OBSERVABILITY:
What ran: CON-36's own graph, via contactability_log
Decision basis: What does the evidence establish about this contact point?; Is any pending communication waiting on this contact point?; Is any pending communication aimed at this contact point?; What can reach this person instead?
Side effect attempted: contactability_log, suppressed_sends
Attempt identity: not recorded
Retried/suppressed/superseded: suppressed_sends log
Current owner: transfers via its own handoff nodes; see handoffs

CONSUMERS:
3 handoff consumers: ACC-261, FUL-276 (both outside this round's 24, referencing CON-36 as authoritative contactability), CMS-208 (permanent-destination evidence)

TEST CASES:
- happy-path: given an email address hard-bounces — expect a.suppress records UNDELIVERABLE for that destination only; other destinations on the same person are untouched

GAPS:
- P2 [idempotency] "Repair attempts are bounded per cycle" is a stated guardrail with no attemptBudget Config declared anywhere to enforce it structurally.

---

## CON-39 — Communication Cooldown

READINESS: READY_WITH_MAPPING

WHY:
Correctly bounded (expiry is the ordinary path, not an exception), correctly scoped (does not cover every channel by default), and the discard-not-replay guardrail on release matches CON-38's identical rule exactly. Low side-effect risk overall.

RESPONSIBILITY:
Hold optional communication for a bounded window without touching permission, scoped to only what the reason justifies.

INPUT CONTRACT:
- an event that justifies a quiet period (required) — provenance: not modeled elsewhere in the 24 - a business-rule trigger

OUTPUT CONTRACT:
Classes: suppression-result
Distinguishable outcomes: x.released; h.suppression (reason hardened into CON-38)

SIDE EFFECTS:
Classes: decides-only, writes-internal-state

IDEMPOTENCY / ATTEMPT IDENTITY:
a.create/a.policy-scope/a.reevaluate append with no idempotencyKey; low risk since a cooldown is scoped and the worst case of a duplicate trigger is a redundant cooldown record rather than a contradictory one
Attempt identity: none named (provenance: undeclared). Structurally declared as a field: no.

CONCURRENCY:
Primitive: none-required

FRESHNESS / REVALIDATION:
Revalidates before consequential execution. Checks: current eligibility recalculated at release, backlog discarded rather than replayed

TIMEOUT / CANCELLATION:
- w.cooldown: onTimeout → a.reevaluate

CONFLICT ARBITRATION:
Enforces journey-declared competition/exclusionGroup/precedence: no

OWNERSHIP:
Transfers ownership on: h.suppression → CON-38

OBSERVABILITY:
What ran: CON-39's own graph, via cooldown_log
Decision basis: Does this reason justify holding required or safety communication as well?; How did the underlying condition change?
Side effect attempted: cooldown_log
Attempt identity: not recorded
Current owner: transfers via its own handoff nodes; see handoffs

CONSUMERS:
0 handoff consumers - triggered by cooldown_triggering_event, presumably emitted by business logic elsewhere, not traceable via handoff. Hands off to CON-38 when a cooldown's reason hardens.

TEST CASES:
- happy-path: given the cooldown period elapses with no basis change — expect a.reevaluate recalculates current eligibility; backlog discarded

GAPS:
none found

---

## CON-40 — Permission Conflict Resolution

READINESS: READY_WITH_MAPPING

WHY:
The best-designed conflict-resolution mechanism in the round: fail-safe-first ordering ("investigating while still sending resolves the uncertainty in favour of sending, which is the one outcome the journey exists to prevent"), origin/version-based reconciliation, and explicit idempotent-verification language. The permissive-value-is-never-evidence guardrail is exactly right. Gap is the same systemic field-declaration one as CON-35.

RESPONSIBILITY:
Hold optional communication closed while distributed systems disagree about permission, and reconcile on evidence rather than on whichever value is more permissive.

INPUT CONTRACT:
- two or more systems reporting different permission states for the same person/type/channel/purpose (required) — provenance: detected by comparing authoritative systems - not one of the 24

OUTPUT CONTRACT:
Classes: decision, suppression-result, persisted-mutation
Distinguishable outcomes: x.resolved; h.manual (automated reconciliation exhausted)

SIDE EFFECTS:
Classes: writes-internal-state, suppresses-queued-work

IDEMPOTENCY / ATTEMPT IDENTITY:
a.apply "propagates the correction with origin and version, so a redelivered or out-of-order echo is discarded"; a.verify explicitly "uses idempotent versioned writes so verification cannot itself become another round of the exchange" - the clearest statement of idempotent-by-design verification in the round, entirely in prose
Attempt identity: origin, version (provenance: undeclared). Structurally declared as a field: no.

CONCURRENCY:
Primitive: optimistic-version-check — two systems each correcting the other in a synchronisation loop, explicitly named and guarded against

FRESHNESS / REVALIDATION:
Does not revalidate before execution (low or no consequential-action risk in this mechanism's own scope, or not applicable).

ORDERING:
Required: yes — provenance and version identify which record reflects the actual decision; a system timestamp alone is explicitly rejected as authority

TIMEOUT / CANCELLATION:
- w.reconcile: onTimeout → h.manual

CONFLICT ARBITRATION:
Enforces journey-declared competition/exclusionGroup/precedence: no

OWNERSHIP:
Transfers ownership on: h.manual → DEC-181

OBSERVABILITY:
What ran: CON-40's own graph, via suppressed_sends
Decision basis: Is a safe authoritative state immediately determinable from the evidence?; Do all required systems now hold the resolved state?
Side effect attempted: suppressed_sends, permission_conflict_log, permission_log
Attempt identity: origin, version (named in prose, not a declared field)
Retried/suppressed/superseded: suppressed_sends log
Current owner: transfers via its own handoff nodes; see handoffs

CONSUMERS:
1 handoff consumer: CON-35 (on convergence failure)

TEST CASES:
- partial-failure: given reconciliation applies a corrected state but one required system does not converge — expect c.converged routes back to h.manual rather than declaring success

GAPS:
- P2 [idempotency] origin/version, load-bearing for the entire reconciliation's correctness, are never declared fields - same systemic gap as CON-35.

---

## OPS-121 — Asynchronous Work Processing

READINESS: NEEDS_CONTRACT_WORK

WHY:
The foundational mechanism of the entire OPS domain, and the accepted-is-not-completed discipline it establishes is exactly right - but it is also the single most consequential instance of the round's central gap: a.persist explicitly names "the idempotency and correlation keys" as something it persists, on the very first action of the very first mechanism everything else in the domain builds on, and that field is never declared.

RESPONSIBILITY:
Give asynchronous work explicit accepted/queued/processing/terminal states so infrastructure acknowledgement is never mistaken for business completion.

INPUT CONTRACT:
- the system accepting a unit of asynchronous work on behalf of a business action (required) — provenance: any caller with work to run asynchronously - not itself modeled

OUTPUT CONTRACT:
Classes: normalized-state, execution-attempt
Distinguishable outcomes: x.cancelled; h.verify (technical completion); h.retry (retryable failure); h.dead-letter (terminal failure); h.reconcile (unknown); h.lag (queue SLA exceeded); h.stalled (execution window exceeded)

SIDE EFFECTS:
Classes: writes-internal-state

IDEMPOTENCY / ATTEMPT IDENTITY:
"the idempotency and correlation keys" are explicitly named as persisted at a.persist, before anything else happens - the concept is fully present, the field is not
Attempt identity: work id, idempotency key (named, undeclared), correlation key (named, undeclared) (provenance: caller-supplied). Structurally declared as a field: no.

CONCURRENCY:
Primitive: none-required

FRESHNESS / REVALIDATION:
Does not revalidate before execution (low or no consequential-action risk in this mechanism's own scope, or not applicable).

UNKNOWN OUTCOME:
Handled: yes — vocabulary: UNKNOWN; reconciles via external:side-effect-reconciliation (via h.reconcile)

TIMEOUT / CANCELLATION:
- w.start: onTimeout → h.lag
- w.execution: onTimeout → h.stalled

CONFLICT ARBITRATION:
Enforces journey-declared competition/exclusionGroup/precedence: no

OWNERSHIP:
Transfers ownership on: h.lag → OPS-122; h.stalled → OPS-123; h.verify → OPS-130; h.retry → OPS-124; h.dead-letter → OPS-127; h.reconcile → external:side-effect-reconciliation

OBSERVABILITY:
What ran: OPS-121's own graph, via work_log
Decision basis: Is capacity available to start now?; Which happened?; What outcome did the work report?
Side effect attempted: work_log
Attempt identity: work id, idempotency key (named, undeclared), correlation key (named, undeclared) (named in prose, not a declared field)
Dependency response: recorded per-attempt where the mechanism crosses a provider/worker boundary (see delivery_log/work_log writes)
Current owner: transfers via its own handoff nodes; see handoffs

CONSUMERS:
0 handoff consumers within the canonical corpus - the root of the async-processing tree, entered by any asynchronous business action; 5 outbound handoffs (OPS-122, OPS-123, OPS-124, OPS-127, OPS-130) make it the domain's clear hub

TEST CASES:
- duplicate-invocation: given the same business action is accepted as work twice (a redelivered request) — expect UNVERIFIED - the idempotency key referenced in a.persist's own text is exactly what should prevent this, but no field or mechanism enforces it

GAPS:
- P1 [idempotency] a.persist explicitly states it records "the idempotency and correlation keys," naming the concept by its exact schema-field name (idempotencyKey exists on ActionNode and is unused here), without ever declaring what those keys actually are for this mechanism or where they come from. This is the single clearest instance of the round's systemic gap, on the mechanism every other OPS journey depends on.

---

## OPS-122 — Queue Lag Management

READINESS: READY

WHY:
An aggregate measurement-and-response mechanism, not a per-item transactional one, which genuinely lowers its own idempotency/concurrency risk relative to the rest of the domain - re-measuring queue health twice produces the same class of decision, not a duplicated side effect. Age-not-depth as the severity signal and the never-silently-drop-work guardrail are both exactly right.

RESPONSIBILITY:
Measure whether a queue can keep up, by the age of its oldest unfinished item rather than its depth, and respond per workload class.

INPUT CONTRACT:
- queue latency or depth crossing a meaningful threshold for a workload class (required) — provenance: the queue's own monitoring, not one of the 24

OUTPUT CONTRACT:
Classes: decision, normalized-state
Distinguishable outcomes: x.observe (burst, no response); h.drain (recovered, backlog to drain); h.escalate (SLA threatened or response window exhausted)

SIDE EFFECTS:
Classes: decides-only, writes-internal-state

IDEMPOTENCY / ATTEMPT IDENTITY:
a measurement-and-response loop; re-evaluating the same threshold crossing twice recomputes the same class of response rather than duplicating an irreversible effect
Attempt identity: none named (provenance: undeclared). Structurally declared as a field: no.

CONCURRENCY:
Primitive: none-required

FRESHNESS / REVALIDATION:
Revalidates before consequential execution. Checks: throughput and oldest-item age re-measured at every threshold crossing and again at w.recovery's resolution

TIMEOUT / CANCELLATION:
- w.recovery: onTimeout → h.escalate

CONFLICT ARBITRATION:
Enforces journey-declared competition/exclusionGroup/precedence: no

OWNERSHIP:
Transfers ownership on: h.drain → OPS-129; h.escalate → OWN-55

OBSERVABILITY:
What ran: OPS-122's own graph, via queue_health_log
Decision basis: Is this a temporary burst the current throughput will absorb?; Is a customer or business SLA threatened?; Which way did it move?
Side effect attempted: queue_health_log
Attempt identity: not recorded
Dependency response: recorded per-attempt where the mechanism crosses a provider/worker boundary (see delivery_log/work_log writes)
Current owner: transfers via its own handoff nodes; see handoffs

CONSUMERS:
1 handoff consumer: OPS-121 (queue SLA exceeded). Hands off to OPS-129 (drain) and OWN-55 (escalate).

TEST CASES:
- happy-path: given a burst that current throughput will absorb within SLA — expect x.observe; no operational response applied, avoiding alert fatigue

GAPS:
none found

---

## OPS-123 — Stalled Work Recovery

READINESS: READY_WITH_MAPPING

WHY:
The long-running-is-not-stalled distinction and the side-effect-uncertainty gate before any reclaim are both exactly right, and "two workers must not concurrently recover the same exclusive job" is stated as an explicit guardrail. The one gap: the coordination primitive itself ("coordinating ownership") is never named as concretely as OPS-128's own lease concept.

RESPONSIBILITY:
Distinguish work that is merely slow from work that has actually stopped, and recover only where side effects are known.

INPUT CONTRACT:
- work exceeding its expected progress threshold without an authoritative completion (required) — provenance: OPS-121's h.stalled handoff

OUTPUT CONTRACT:
Classes: decision, ownership-transfer
Distinguishable outcomes: x.observe (progressing); x.recovered (reclaimed); h.reconcile (side effects unknown); h.escalate (not safely recoverable)

SIDE EFFECTS:
Classes: decides-only, writes-internal-state, transfers-ownership

IDEMPOTENCY / ATTEMPT IDENTITY:
a.reclaim is explicit about coordination ("the coordination is the point - an uncoordinated reclaim turns one stalled job into two running ones") but names no concrete primitive for it, unlike OPS-128's lease
Attempt identity: none named (provenance: undeclared). Structurally declared as a field: no.

CONCURRENCY:
Primitive: lock — two workers concurrently recovering the same exclusive job - named explicitly as a guardrail, not structurally mechanized

FRESHNESS / REVALIDATION:
Does not revalidate before execution (low or no consequential-action risk in this mechanism's own scope, or not applicable).

UNKNOWN OUTCOME:
Handled: yes — vocabulary: handled via h.reconcile before any reclaim; reconciles via external:side-effect-reconciliation

TIMEOUT / CANCELLATION:
no wait node in this mechanism

CONFLICT ARBITRATION:
Enforces journey-declared competition/exclusionGroup/precedence: no

OWNERSHIP:
Transfers ownership on: h.reconcile → external:side-effect-reconciliation; h.escalate → OWN-55

OBSERVABILITY:
What ran: OPS-123's own graph, via work_log
Decision basis: Is the work actually still making progress?; Is the side-effect state established?; Can this be recovered safely under its execution semantics?
Side effect attempted: work_log
Attempt identity: not recorded
Dependency response: recorded per-attempt where the mechanism crosses a provider/worker boundary (see delivery_log/work_log writes)
Current owner: transfers via its own handoff nodes; see handoffs

CONSUMERS:
1 handoff consumer: OPS-121

TEST CASES:
- concurrent-invocation: given two recovery attempts fire for the same stalled job near-simultaneously — expect UNVERIFIED which coordination mechanism actually prevents both from reclaiming - see gaps

GAPS:
- P2 [concurrency] "Coordinating ownership" during reclaim is stated as a guardrail but never named as a concrete primitive (a lease, a lock, a compare-and-set) the way OPS-128 names its lease explicitly - worth harmonizing vocabulary across the two mechanisms.

---

## OPS-124 — Retry Management

READINESS: NEEDS_CONTRACT_WORK

WHY:
The most complete retry contract in the corpus - durable budget across worker restarts, revalidation before every retry, side-effect-uncertainty gate before repeating, idempotent re-attempt "under the same idempotency key." Every one of Part 10's requirements is met in substance. The gap is that the durable budget and the idempotency key it retries under are both named only in prose, on the mechanism the whole retry story depends on.

RESPONSIBILITY:
Repeat a transient failure within a durable, bounded budget, only where repeating is safe and the work is still wanted.

INPUT CONTRACT:
- a failure classified as transient by an explicit classification (required) — provenance: OPS-121's h.retry, OPS-126's h.retry, or CMS-208 (per its own claimed delegation)

OUTPUT CONTRACT:
Classes: retry-schedule, execution-attempt
Distinguishable outcomes: x.cancelled; x.stale (CANCELLED_STALE); h.verify (retry succeeded); h.dead-letter (budget exhausted, or not safely repeatable)

SIDE EFFECTS:
Classes: decides-only, writes-internal-state, submits-to-provider

IDEMPOTENCY / ATTEMPT IDENTITY:
"Execute the retry idempotently, under the same idempotency key, so that a downstream that did receive the first attempt can absorb this one" - the clearest single sentence describing correct idempotent-retry semantics anywhere in the corpus, entirely in prose
Attempt identity: attempt count (durable, work-scoped, not worker-scoped), the idempotency key (named, undeclared) (provenance: caller-supplied). Structurally declared as a field: no.

CONCURRENCY:
Primitive: none-required

FRESHNESS / REVALIDATION:
Revalidates before consequential execution. Checks: work and target entity revalidated against current state before every attempt, after backoff

RETRY / FAILURE SEMANTICS:
Owns its own retry loop: yes. Failure classes: retryable, non-retryable, unknown. Budget durable across restarts: yes. Revalidates before retry: yes.

UNKNOWN OUTCOME:
Handled: yes — vocabulary: handled via h.reconcile before backoff is even calculated; reconciles via external:side-effect-reconciliation

TIMEOUT / CANCELLATION:
- w.retry: onTimeout → a.revalidate

CONFLICT ARBITRATION:
Enforces journey-declared competition/exclusionGroup/precedence: no

OWNERSHIP:
Transfers ownership on: h.reconcile → external:side-effect-reconciliation; h.verify → OPS-130; h.dead-letter → OPS-127

OBSERVABILITY:
What ran: OPS-124's own graph, via work_log
Decision basis: Is retrying actually safe?; Is the work still required?; What did the retry produce?
Side effect attempted: work_log
Attempt identity: attempt count (durable, work-scoped, not worker-scoped), the idempotency key (named, undeclared) (named in prose, not a declared field)
Dependency response: recorded per-attempt where the mechanism crosses a provider/worker boundary (see delivery_log/work_log writes)
Current owner: transfers via its own handoff nodes; see handoffs

CONSUMERS:
2 handoff consumers: OPS-121, OPS-126. CMS-208 claims delegation to this mechanism in prose without a structural handoff - see CMS-208's own gaps.

TEST CASES:
- dependency-retryable-failure: given a transient failure with budget remaining and the work still required at revalidation — expect a.attempt executes idempotently under the same key
- stale-state: given the target entity moved during backoff and the work is no longer required — expect x.stale; the retry is cancelled with a reason rather than executed

GAPS:
- P1 [idempotency] "The same idempotency key" the retry executes under is never declared as a field on this mechanism - the second most consequential instance of the round's systemic gap, since every mechanism in the corpus that retries (CMS-208, OPS-121, OPS-126, OPS-127, OPS-128) either delegates here or reimplements the identical unstated concept.
- P2 [caller-callee-contract] CMS-208's distinctFrom claims delegation to this mechanism for retry execution, but no handoff node here or in CMS-208 shows that relationship structurally.

---

## OPS-125 — Work Deduplication

READINESS: READY_WITH_MAPPING

WHY:
The identity-is-the-business-operation-not-the-payload distinction (OPS-R7) is the correct answer to the single most common deduplication mistake, stated and enforced explicitly (x.independent is a first-class exit for "same payload, different operation"). a.attach's honest architecture-dependent branch ("where the architecture permits it - where it does not, the duplicate is suppressed instead") is good practice, not a gap.

RESPONSIBILITY:
Stop the same logical business operation from running twice, without collapsing two legitimate repeats of the same payload into one.

INPUT CONTRACT:
- two or more work instances that may represent the same logical business operation (required) — provenance: FIN-135's own handoff, or any duplicate-detection trigger

OUTPUT CONTRACT:
Classes: decision, normalized-state
Distinguishable outcomes: x.independent (not a duplicate); x.suppressed (canonical result reused); x.attached (waiting on in-flight canonical execution); h.reconcile (conflicting outcomes)

SIDE EFFECTS:
Classes: decides-only, writes-internal-state, suppresses-queued-work

IDEMPOTENCY / ATTEMPT IDENTITY:
a.compare reads "the idempotency key, the business operation identity, the target entity, the relevant version" as its comparison inputs - again the concept is named explicitly without ever being declared as a field this mechanism itself owns or defines the format of
Attempt identity: the idempotency key (named, undeclared) (provenance: caller-supplied). Structurally declared as a field: no.

CONCURRENCY:
Primitive: instance-affinity — an in-flight canonical execution vs. a newly arriving duplicate - a.attach's join-in-progress pattern

FRESHNESS / REVALIDATION:
Does not revalidate before execution (low or no consequential-action risk in this mechanism's own scope, or not applicable).

TIMEOUT / CANCELLATION:
no wait node in this mechanism

CONFLICT ARBITRATION:
Enforces journey-declared competition/exclusionGroup/precedence: no

OWNERSHIP:
Transfers ownership on: h.reconcile → external:side-effect-reconciliation

OBSERVABILITY:
What ran: OPS-125's own graph, via dedup_log
Decision basis: Is this the same logical operation?; What state is the canonical execution in?
Side effect attempted: dedup_log
Attempt identity: the idempotency key (named, undeclared) (named in prose, not a declared field)
Dependency response: recorded per-attempt where the mechanism crosses a provider/worker boundary (see delivery_log/work_log writes)
Current owner: transfers via its own handoff nodes; see handoffs

CONSUMERS:
1 handoff consumer: FIN-135

TEST CASES:
- duplicate-invocation: given the canonical execution completed and its result is still valid — expect a.reuse suppresses the duplicate and reuses the result
- concurrent-invocation: given the canonical execution is still running when the duplicate arrives — expect a.attach joins it rather than starting a second execution, where the architecture permits

GAPS:
- P2 [idempotency] the idempotency key this mechanism compares against is never defined here or anywhere upstream - same systemic gap, present on the mechanism whose entire job is comparing it.

---

## OPS-126 — Partial Processing Recovery

READINESS: NEEDS_CONTRACT_WORK

WHY:
The design itself is sound (never replay successful children, honest escalation when no aggregation policy is defined, explicit compensation-only-when-transaction-semantics-require-it), but this round's corpus scan found no confirmed real consumer - the one cross-reference (DAT-225) is a distinctFrom explicitly declining to use it, not an invocation.

RESPONSIBILITY:
Recover the failed part of a composite/batch operation without re-running the part that already succeeded.

INPUT CONTRACT:
- a composite, batch or fan-out operation ending with children in different states (required) — provenance: not traceably emitted by any of the 283 journeys

OUTPUT CONTRACT:
Classes: decision, normalized-state
Distinguishable outcomes: x.recomputed (parent state recalculated); h.retry (independently retryable children); h.compensate (unwind required); h.reconcile (unknown children); h.undefined (no aggregation policy)

SIDE EFFECTS:
Classes: decides-only, writes-internal-state

IDEMPOTENCY / ATTEMPT IDENTITY:
a.classify/a.recompute are read-then-recompute actions with no idempotencyKey; low intrinsic risk since the parent state is always recomputed from authoritative child outcomes rather than incrementally applied
Attempt identity: none named (provenance: undeclared). Structurally declared as a field: no.

CONCURRENCY:
Primitive: none-required

FRESHNESS / REVALIDATION:
Revalidates before consequential execution. Checks: parent state recomputed from authoritative child outcomes on every re-entry, never from the events that reported them

TIMEOUT / CANCELLATION:
no wait node in this mechanism

CONFLICT ARBITRATION:
Enforces journey-declared competition/exclusionGroup/precedence: no

OWNERSHIP:
Transfers ownership on: h.undefined → DEC-181; h.retry → OPS-124; h.compensate → external:correction-or-compensation; h.reconcile → external:side-effect-reconciliation

OBSERVABILITY:
What ran: OPS-126's own graph, via composite_work_log
Decision basis: Is an aggregation policy defined for this parent?; What do the unresolved children need?
Side effect attempted: composite_work_log
Attempt identity: not recorded
Dependency response: recorded per-attempt where the mechanism crosses a provider/worker boundary (see delivery_log/work_log writes)
Current owner: transfers via its own handoff nodes; see handoffs

CONSUMERS:
0 handoff consumers; DAT-225's only reference to it is a distinctFrom explaining why DAT-225 does not use it - the strongest zero-real-demand candidate in the round

TEST CASES:
- partial-failure: given a batch operation with some children succeeded and some failed retryably — expect a.classify marks each individually; h.retry carries only the failed scope

GAPS:
- P1 [consumer-coverage] No canonical journey in the current 283-journey corpus is confirmed to produce composite/fan-out/batch work this mechanism would receive - its one cross-reference (DAT-225) explicitly declines to use it via distinctFrom. The design may be entirely sound for a shape of work the corpus does not yet contain, which is different from a defect; see CONSUMER-COVERAGE.md.

---

## OPS-127 — Dead-Letter Recovery

READINESS: READY_WITH_MAPPING

WHY:
The review-horizon escalation prevents the dead-letter queue from becoming invisible storage, the replay-preserves-audit-chain rule is explicit, and the side-effect-uncertainty gate before any replay is consistent with the rest of the domain. No P0/P1 found.

RESPONSIBILITY:
Turn work automation could not finish into an explicit, owned remediation obligation rather than an invisible queue.

INPUT CONTRACT:
- work that has exhausted its automated retry policy, or reached a state automation cannot process (required) — provenance: OPS-121's h.dead-letter or OPS-124's h.dead-letter handoff

OUTPUT CONTRACT:
Classes: failure-classification, handoff-context
Distinguishable outcomes: x.replayed (corrected); x.obsolete (closed with reason); h.manual (needs a person); h.escalate (undiagnosed past review horizon); h.reconcile (side effects uncertain)

SIDE EFFECTS:
Classes: writes-internal-state, creates-task-or-obligation

IDEMPOTENCY / ATTEMPT IDENTITY:
a.correct creates "a controlled replay linked to the original work... a new attempt with its own record" - an explicit, correct parent-child attempt-chain pattern, though the identity linking mechanism is never declared as a field
Attempt identity: none named (provenance: correlated-to-prior-attempt). Structurally declared as a field: no.

CONCURRENCY:
Primitive: none-required

FRESHNESS / REVALIDATION:
Does not revalidate before execution (low or no consequential-action risk in this mechanism's own scope, or not applicable).

UNKNOWN OUTCOME:
Handled: yes — vocabulary: handled via h.reconcile before any remediation is chosen; reconciles via external:side-effect-reconciliation

TIMEOUT / CANCELLATION:
- w.review: onTimeout → h.escalate

CONFLICT ARBITRATION:
Enforces journey-declared competition/exclusionGroup/precedence: no

OWNERSHIP:
Transfers ownership on: h.reconcile → external:side-effect-reconciliation; h.manual → DEC-181; h.escalate → OWN-55

OBSERVABILITY:
What ran: OPS-127's own graph, via dead_letter_log
Decision basis: Is the side-effect state uncertain?; What would resolve this?
Side effect attempted: dead_letter_log
Attempt identity: not recorded
Dependency response: recorded per-attempt where the mechanism crosses a provider/worker boundary (see delivery_log/work_log writes)
Current owner: transfers via its own handoff nodes; see handoffs

CONSUMERS:
2 handoff consumers: OPS-121, OPS-124

TEST CASES:
- happy-path: given the authoritative problem is diagnosable and fixable — expect a.correct replays under a new attempt linked to the original, audit chain intact

GAPS:
none found

---

## OPS-128 — Worker Failure Recovery

READINESS: READY_WITH_MAPPING

WHY:
The single most concrete concurrency primitive in the entire round: an explicit lease with a wait-out-the-lease-before-reclaiming semantics, correctly distinguishing worker death from work failure, and gating any restart behind a confirmed-not-completed check. Genuinely exemplary; the corpus's clearest model for the other mechanisms' vaguer 'coordinate ownership' language to converge on.

RESPONSIBILITY:
Transfer execution responsibility off a failed worker without assuming the work itself failed, and without letting two workers hold the same job.

INPUT CONTRACT:
- a worker becoming unavailable while holding in-flight work (required) — provenance: infrastructure heartbeat/health monitoring - not one of the 24

OUTPUT CONTRACT:
Classes: ownership-transfer, execution-attempt
Distinguishable outcomes: x.original (original worker finished); x.no-replay (already completed); x.resumed (checkpoint or restart); h.reconcile (side effects unknown)

SIDE EFFECTS:
Classes: decides-only, transfers-ownership

IDEMPOTENCY / ATTEMPT IDENTITY:
a.checkpoint/a.restart both explicit about not repeating completed work; c.confirmed gates on "an authoritative completion exists" before ever considering a restart, which is the correct order (check completion, then check lease, then resume)
Attempt identity: lease, checkpoint (provenance: self-minted-on-entry). Structurally declared as a field: no.

CONCURRENCY:
Primitive: lease — two workers holding the same job - explicitly, concretely handled via wait-out-the-lease before reclaiming

FRESHNESS / REVALIDATION:
Revalidates before consequential execution. Checks: completion status re-confirmed before any resume/restart decision

UNKNOWN OUTCOME:
Handled: yes — vocabulary: handled via h.reconcile; reconciles via external:side-effect-reconciliation

TIMEOUT / CANCELLATION:
- w.lease: onTimeout → c.confirmed

CONFLICT ARBITRATION:
Enforces journey-declared competition/exclusionGroup/precedence: no

OWNERSHIP:
Transfers ownership on: h.reconcile → external:side-effect-reconciliation

OBSERVABILITY:
What ran: OPS-128's own graph, via work_log
Decision basis: Could the previous lease still be live?; Is the work's completion already confirmed?; How can execution be resumed?
Side effect attempted: work_log
Attempt identity: lease, checkpoint (named in prose, not a declared field)
Dependency response: recorded per-attempt where the mechanism crosses a provider/worker boundary (see delivery_log/work_log writes)
Current owner: transfers via its own handoff nodes; see handoffs

CONSUMERS:
0 handoff consumers - triggered by infrastructure heartbeat loss, appropriately not journey-initiated

TEST CASES:
- cancellation-race: given the original worker completes the work just as its heartbeat is judged lost — expect c.lease's wait-out-the-lease path (w.lease -> x.original) prevents the reclaim from racing the legitimate completion

GAPS:
none found

---

## OPS-129 — Backlog Recovery

READINESS: READY_WITH_MAPPING

WHY:
The stale-work-is-cancelled-not-delivered rule and the priority-not-arrival-order drain strategy are both exactly the corpus's own OPS-R12/R13/R14 rules made concrete, and the throttle-to-a-floor-then-escalate loop correctly avoids a recovery that causes a second outage. No P0/P1 found.

RESPONSIBILITY:
Deliberately drain an accumulated backlog - discarding what has gone stale, pacing what has not, never flushing everything at once.

INPUT CONTRACT:
- processing capacity recovering with a material backlog accumulated behind it (required) — provenance: OPS-122's h.drain handoff

OUTPUT CONTRACT:
Classes: normalized-state, decision
Distinguishable outcomes: x.normal (drained, stable); h.escalate (cannot drain at any safe rate)

SIDE EFFECTS:
Classes: decides-only, writes-internal-state

IDEMPOTENCY / ATTEMPT IDENTITY:
a.cancel/a.strategy/a.drain/a.throttle all append with no idempotencyKey; re-inventorying the same backlog recomputes the drain plan rather than duplicating an executed action, keeping intrinsic risk low
Attempt identity: none named (provenance: undeclared). Structurally declared as a field: no.

CONCURRENCY:
Primitive: none-required

FRESHNESS / REVALIDATION:
Revalidates before consequential execution. Checks: backlog validity re-assessed at inventory time (c.relevant); stale items cancelled rather than delivered because they were once queued

TIMEOUT / CANCELLATION:
- w.monitor: onTimeout → x.normal

CONFLICT ARBITRATION:
Enforces journey-declared competition/exclusionGroup/precedence: no

OWNERSHIP:
Transfers ownership on: h.escalate → OWN-55

OBSERVABILITY:
What ran: OPS-129's own graph, via backlog_log
Decision basis: Is all the accumulated work still relevant?; Can the rate be reduced further and still make progress?
Side effect attempted: backlog_log
Attempt identity: not recorded
Dependency response: recorded per-attempt where the mechanism crosses a provider/worker boundary (see delivery_log/work_log writes)
Current owner: transfers via its own handoff nodes; see handoffs

CONSUMERS:
1 handoff consumer: OPS-122

TEST CASES:
- stale-state: given part of the backlog describes a customer-facing action no longer appropriate — expect a.cancel suppresses it with a reason rather than delivering it because it was once queued

GAPS:
none found

---

## OPS-130 — Business Outcome Verification

READINESS: READY_WITH_MAPPING

WHY:
The technical-completion-is-not-business-completion distinction, stated once and applied as its own dedicated mechanism rather than folded into every producer, is the corpus's cleanest single architectural decision in the round - a.verify is explicitly, correctly idempotent by design ("checking twice costs nothing and proves the same thing"). No P0/P1 found.

RESPONSIBILITY:
Check that the business state a job existed to create actually exists, wherever the job's own technical success is not proof of it.

INPUT CONTRACT:
- a technical job reporting completion (required) — provenance: OPS-121's h.verify or OPS-124's h.verify handoff

OUTPUT CONTRACT:
Classes: decision, normalized-state
Distinguishable outcomes: x.complete (technical success was the business fact); x.business-complete (BUSINESS_COMPLETED); x.reconciliation (RECONCILIATION_REQUIRED)

SIDE EFFECTS:
Classes: reads-only, decides-only, writes-internal-state

IDEMPOTENCY / ATTEMPT IDENTITY:
explicitly idempotent by design - "verification is idempotent, so checking twice costs nothing and proves the same thing each time" - the strongest, most direct statement of idempotency-by-construction in the entire round
Attempt identity: none named (provenance: undeclared). Structurally declared as a field: no.

CONCURRENCY:
Primitive: none-required

FRESHNESS / REVALIDATION:
Revalidates before consequential execution. Checks: the actual business state - record exists, state transitioned, balance updated, entitlement applied - re-read every time rather than trusted from the job's own report

UNKNOWN OUTCOME:
Handled: yes — vocabulary: RECONCILIATION_REQUIRED; reconciles via not further delegated - this exit IS the reconciliation signal, surfaced rather than auto-resolved

TIMEOUT / CANCELLATION:
- w.pending: onTimeout → x.reconciliation

CONFLICT ARBITRATION:
Enforces journey-declared competition/exclusionGroup/precedence: no

OWNERSHIP:
Does not transfer ownership via a handoff (closes locally or is itself a terminal step in its own chain).

OBSERVABILITY:
What ran: OPS-130's own graph, via work_log
Decision basis: Is technical completion itself authoritative for business completion here?; What does verification show?
Side effect attempted: work_log
Attempt identity: not recorded
Dependency response: recorded per-attempt where the mechanism crosses a provider/worker boundary (see delivery_log/work_log writes)

CONSUMERS:
2 handoff consumers: OPS-121, OPS-124

TEST CASES:
- partial-failure: given the job reports success but the record it was supposed to write is missing — expect x.reconciliation surfaces the gap rather than closing the obligation as done

GAPS:
none found

---
