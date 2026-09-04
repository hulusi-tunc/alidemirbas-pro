# Runtime Mechanisms — production readiness audit (post-repair)

Scope: can a real company's journey engine execute each of these 24 mechanisms deterministically,
repeatably, and safely under production load - retries, duplicate events, concurrent journeys,
stale state, partial failure, and downstream outage - without creating contradictory lifecycle
state or duplicate side effects? This is the third production-readiness round on the canonical
corpus, after the communicating-journey round and the silent-lifecycle-state round. **This
document reflects the round's repair pass, not only its initial audit.** The initial audit (READY
4 / READY_WITH_MAPPING 13 / NEEDS_CONTRACT_WORK 6 / NEEDS_RUNTIME_CHANGE 1, P0 1 / P1 6 / P2 12)
found one genuine concurrency defect (`CMS-201`), a corpus-wide pattern of idempotency/attempt-
identity named in prose but never declared structurally, an ownership ambiguity between `CMS-208`
and `OPS-124`, and one confirmed architectural absence — no runtime primitive anywhere enforces
journey-declared `competition`/`exclusionGroup`/`precedence`. This repair round fixed the first
three directly in `src/canonical/*.ts` and 2 new validators in `scripts/vnext-rules.mjs`, and
resolved the fourth by investigation rather than by inventing a mechanism to close it — see
`COMPETITION-ARBITRATION-ARCHITECTURE.md`. Full before/after detail is in `FIXES-APPLIED.md`.

## Corpus confirmation — 24, re-derived from current (post-repair) source

`src/canonical/surface.ts`'s `MECHANISM_IDS` — the same list `surfaceOf()` itself checks first,
before any other surface rule, and the same list `production/surface-assignment.json` and the
site both read — still names exactly 24 ids: `CMS-201` through `CMS-208` plus `CMS-210` (9,
skipping `CMS-209`, which does not exist in the corpus), `CON-34`, `CON-35`, `CON-36`, `CON-39`,
`CON-40` (5), and `OPS-121` through `OPS-130` (10). Re-dumped from post-repair source; every one
of the 24's own node count is identical to the pre-repair audit dump (confirmed node-by-node) —
**this repair round changed zero canonical graph topology.** Every fix is a metadata addition
(`entity.instanceKey`, `entity.concurrency`, `ActionNode.idempotencyKey`, `ActionNode.
attemptBudget`) or a prose correction (`distinctFrom`, `does`, handoff `carries`/`contract`), never
a new/removed/rewired node.

**Leakage check, all zero, unchanged:** none of the 24 route to a human channel; exactly one
(`CMS-208`) declares message channels, correctly (its own job is resubmission); none appear in the
68 message-sending or 3 human-routing Customer Journey lists, none in the 64 Silent Lifecycle
State list, none in the 124 Operational Workflow domain files. `68 + 3 + 64 + 24 + 124 = 283`,
exact, unchanged.

**Idempotency/attempt-identity is now structural, not prose-only.** All 24 now declare `entity.
instanceKey` and `entity.concurrency: "one-active-per-key"`, and every writing `ActionNode` across
the 24 declares an `idempotencyKey` scoped to that identity (or to a documented coarser identity
where the fine-grained one is not yet resolved at that point in the pipeline — e.g. `CMS-206`'s
`a.correlate` keys on `raw_status_reference` before `attempt_id` is confirmed). Eight mechanisms
that named idempotency/attempt-identity only in prose in the audit round — `OPS-121`, `OPS-124`,
`CMS-206`, `CON-35`, `CON-40`, `OPS-125`, `OPS-127`, `OPS-128` — now carry it as a declared field,
with the three-identity distinction (invocation / side-effect idempotency / attempt) documented
explicitly in `entity.note` wherever it applies. None of the 24 carry `measurement` (the vNext
migration marker) or `implementation.attributes` — this is still the pre-vNext `entity: { scope,
note }` shape, deliberately: this round's brief scoped repair to idempotency/concurrency/retry-
ownership/conflict-arbitration, not to a vNext migration, which remains out of scope.

## Architecture findings

### Readiness distribution (post-repair)

| Verdict | Count | % | Audit-round count |
|---|---|---|---|
| READY | 4 | 17% | 4 |
| READY_WITH_MAPPING | 20 | 83% | 13 |
| NEEDS_CONTRACT_WORK | 0 | 0% | 6 |
| NEEDS_RUNTIME_CHANGE | 0 | 0% | 1 |

The same 4 mechanisms remain genuinely `READY` — `CMS-203`, `CMS-205`, `CMS-207`, `OPS-122` — each
side-effect-free-or-idempotent-by-construction with nothing a company mapping needs to supply
beyond wiring it in. Every mechanism the audit round marked `NEEDS_CONTRACT_WORK` (`CMS-204`,
`CMS-208`, `CON-34`, `OPS-121`, `OPS-124`, `OPS-126`) now carries the structural field it was
missing and is `READY_WITH_MAPPING`. The one `NEEDS_RUNTIME_CHANGE` (`CMS-201`) is fixed and is
also `READY_WITH_MAPPING` — see finding 1 below and `FIXES-APPLIED.md`'s `CMS-201` section for the
full before/race/after.

### Priority counts (post-repair, per-mechanism gaps only)

| Priority | Count | Audit-round count |
|---|---|---|
| P0 | 0 | 1 |
| P1 | 0 | 6 |
| P2 | 5 | 12 |
| **Total findings** | **5** | **19** |

(Generated directly from `runtime-mechanism-contracts.json`'s `gaps` arrays — see
`READINESS-MATRIX.md`'s own totals line, produced by the same script, which will not drift from
this document.) **This table intentionally excludes the conflict-arbitration finding.** Per this
round's own brief ("do not create a false clean bill of health merely to reach P0=0"), that finding
is real, is P0-severity, and is reported prominently below and in `FIXES-APPLIED.md` and
`COMPETITION-ARBITRATION-ARCHITECTURE.md` — it is simply not attached to any single mechanism's own
`gaps` array, because it belongs to none of the 24 individually: it is the corpus's collective
absence of a 25th primitive to arbitrate ownership, not a defect in one of the 24 that exist.
**Reading "P0 = 0" above as "nothing left to do" would be exactly the false clean bill of health
the brief warns against — see the architectural finding immediately below.**

The remaining 5 P2s are honest, low-risk, non-blocking findings left open rather than mechanically
closed: `CMS-201`'s and `CON-34`'s consumer-coverage notes (event-driven entry points with no
handoff-traceable emitter — a classification, not a defect), `CMS-206`'s late-callback edge case,
`CON-36`'s still-undeclared repair-attempt budget (no single action node to attach it to), and
`OPS-126`'s consumer-coverage reclassification (investigated this round, concluded unconsumed-but-
valid rather than orphaned).

### Top findings (post-repair)

1. **The architectural finding this round exists to conclusively resolve: no runtime primitive
   anywhere in this repository enforces journey-declared `competition`/`exclusionGroup`/
   `precedence`, confirmed by inspecting all 24 mechanisms, the remaining 259 journeys, and the
   site's own `src/lib/canonical-view.ts`/`practitioner-view.ts` rendering layer.** All three
   confirmed competition groups (`purchase-intent`, `relationship-continuity`,
   `account-restriction-authority`) describe scenarios where both sides can become eligible
   independently and simultaneously — this is not a theoretical gap. Classified as a **P0
   architectural blocker**, reported at the architecture level rather than folded into any single
   mechanism's gaps, and deliberately **not resolved by adding a 25th mechanism this round** — see
   `COMPETITION-ARBITRATION-ARCHITECTURE.md` for the full investigation, the candidate ownership
   analysis (leaning toward a mechanism parallel to `OPS-125`'s own precedent, without asserting
   it), and the required runtime contract if one is built.
2. **`CMS-201`'s check-then-act race is fixed.** `a.create` is now atomic create-if-absent on
   `(recipient_id, obligation_subject)`; a losing concurrent caller resolves to the existing
   obligation rather than creating a duplicate. `c.existing`'s prior read is now documented
   explicitly as a non-authoritative fast path, not the safety mechanism. Zero topology change —
   the fix is entity/action metadata plus a does-text correction on the existing node.
3. **Idempotency/attempt-identity is now structural corpus-wide, closing the single largest
   systemic gap the audit found.** All 24 mechanisms declare `entity.instanceKey` +
   `entity.concurrency`; every writing action declares `idempotencyKey`. The three-identity model
   (invocation / side-effect idempotency / attempt) is worked out concretely per mechanism:
   `logical_operation_key` (stable across retries, sent downstream) vs. `work_id`/`attempt_number`
   (internal bookkeeping, never sent downstream) in `OPS-121`/`OPS-124`; `message_id` (stable per
   obligation) vs. `attempt_id` (fresh per physical send, caller-minted before submission) in the
   `CMS-204→205→206` chain; `lease_id` (fresh per ownership transfer) in `OPS-128`; `replay_id`/
   `original_work_id` (parent-child attempt chain) in `OPS-127`.
4. **`CMS-208`/`OPS-124` retry-ownership ambiguity is resolved: `CMS-208` owns its own complete
   channel-aware retry loop end-to-end and does not delegate to `OPS-124`.** `CMS-208`'s own
   `distinctFrom` is corrected to state this explicitly, reasoned from the graph's own already-
   self-contained shape (`a.retry` → `c.budget` → `x.retrying`, no handoff into `OPS-124`) and from
   channel-specific failure classification being domain knowledge `OPS-124` deliberately does not
   carry. `a.retry` now declares a formal `attemptBudget` (`required: true`, no invented number)
   scoped to `(message_id, destination_id)` — a single durable budget, not two.
5. **Where duplicate/unknown-outcome handling exists, it remains uniformly correct — 8 of 8 —
   and is now backed by structural attempt-identity fields rather than prose alone.** Every
   mechanism naming an `UNKNOWN`/`DELIVERY_UNKNOWN`/`RECONCILIATION_REQUIRED`-shaped outcome
   (`CMS-206`, `CMS-207`, `OPS-121`, `OPS-123`, `OPS-124`, `OPS-127`, `OPS-128`, `OPS-130`) still
   routes it to explicit reconciliation before any retry — this round changed nothing about that
   logic, only formalized the identity fields it depends on.
6. **`CMS-207` remains the single best-designed idempotent-consumer pattern found across all three
   production-readiness rounds**, now with its own `idempotencyKey`s (scoped to `attempt_id`, or
   `raw_status_reference` pre-correlation) as a second, structural layer over the `c.idempotent`
   condition logic that already made it correct.
7. **`OPS-128`'s lease vocabulary is now the corpus's converged concurrency-primitive language.**
   `OPS-123`'s vaguer "coordinate ownership" phrasing is corrected to name the same lease concept
   explicitly (`entity.note` states it directly: this is the same lease OPS-128 uses, applied to a
   work item whose owner is still nominally alive), rather than leaving two levels of precision for
   the same underlying requirement.
8. **Freshness/revalidation strength (12 of 24) is preserved unchanged — this round added no new
   validator that would force revalidation onto mechanisms whose graph semantics don't need it**,
   per the brief's own explicit caution against a noisy freshness validator. The new
   `freshness_before_execution` validator (mechanism-scoped, warn-only) instead surfaced 7
   escalation-shaped handoffs with no explicit recheck — judged legitimate, low-risk findings left
   for human review rather than mechanically resolved (see `VALIDATOR-COVERAGE.md`).
9. **Two new mechanism-scoped validators close two of the eight validator opportunities the audit
   round identified**: `attempt_identity_unprovenanced` (warn) catches an attempt-shaped
   `idempotencyKey` with no documented provenance in `entity.note`; `freshness_before_execution`
   (warn) catches a wait that times out directly into a mutating handoff/action with no recheck and
   no nearby revalidation. A third, pre-existing validator (`state_write_without_idempotency`) had
   its severity widened from warn-only to error-on-mechanisms, confirmed safe only after the repair
   pass closed every one of the corpus-wide instances it would otherwise flag. Full detail,
   including why the other five candidates were deliberately left unimplemented, is in
   `VALIDATOR-COVERAGE.md`.
10. **`CON-34` and `OPS-126` are investigated and classified, not left as open questions.** `CON-34`
    is documented in its own `entity.note` as a legitimate event-driven entry point, the same shape
    as `CMS-201`/`CON-35`/`OPS-121`/`OPS-128` — not orphaned. `OPS-126` is classified
    unconsumed-but-valid: sound design, no confirmed real consumer in the current 283-journey
    corpus, its one cross-reference (`DAT-225`) explicitly declines to use it — not deleted, not
    flagged duplicate or obsolete, since no evidence supports either label. See
    `CONSUMER-COVERAGE.md`.
11. **`OPS-130`'s technical-completion-is-not-business-completion distinction remains the corpus's
    cleanest single architectural decision**, unchanged and re-confirmed this round as a principle
    worth searching the other 23 for — no second instance of the same confusion was found.
12. **3 P2s remain deliberately open, not force-closed**: `CMS-206`'s late-callback-after-timeout
    edge case (presumably handled by `CMS-207`'s own late-event classification, but not shown
    explicitly within `CMS-206`'s own graph); `CON-36`'s bounded-repair-attempt guardrail, which has
    no single action node to attach a formal `attemptBudget` to; `OPS-126`'s consumer-coverage
    status, now a settled classification rather than an open question, but still worth surfacing
    since the corpus contains no journey shaped to consume it today.
13. **Zero canonical graph topology changed anywhere in this repair round.** Every one of the 24
    mechanisms' node counts is identical before and after, confirmed by re-running the same
    text-eval dump used for the original audit. Every fix is `entity.instanceKey`/`entity.
    concurrency`/`ActionNode.idempotencyKey`/`ActionNode.attemptBudget` metadata, or a `does`/
    `distinctFrom`/handoff `carries`+`contract` prose correction — never a new, removed, or
    rewired node.

### Recurring patterns, resolved or reclassified this round

- **"The idempotency key" as an assumed-but-uncontracted primitive** — the audit round's single
  largest systemic finding — is now resolved corpus-wide, not fixed 8 times independently but
  converged on the existing `ActionNode.idempotencyKey`/`attemptBudget` schema primitives, exactly
  as the brief required (no parallel framework invented).
- **"Coordinate ownership" without naming the primitive** — resolved: `OPS-123` now names the same
  lease concept `OPS-128` already used concretely, rather than three levels of precision for one
  requirement.
- **Prose claims of delegation that the graph does not show** — the one confirmed instance
  (`CMS-208` → `OPS-124`) is resolved by correcting the prose to match the graph's own already-
  correct shape. A corpus-wide grep for the same `distinctFrom` pattern elsewhere found no second
  instance.
- **Zero conflict-arbitration coverage remains a single finding wearing 24 mechanism-shaped hats,
  now confirmed by direct investigation rather than by absence-of-reference alone** — see finding 1
  above and `COMPETITION-ARBITRATION-ARCHITECTURE.md`. This is the one finding this round did not
  and should not resolve by a code change, because doing so requires a product-architecture
  decision (candidate ownership) reserved for a dedicated decision, per the brief's own instruction.

### Architecture assessment

The 24 mechanisms remain a genuinely mature execution-infrastructure design — this round's repair
did not change that assessment, only closed the gap between what the mechanisms already reasoned
about correctly in prose and what a schema-checkable field could confirm. The one real concurrency
defect (`CMS-201`) is fixed at the metadata level with zero topology change. The one real
caller/callee ambiguity (`CMS-208`/`OPS-124`) is resolved by correcting prose to match an
already-correct graph. The one confirmed architectural absence (conflict arbitration) is
investigated conclusively and reported honestly rather than either silently ignored or papered over
with an unauthorized new mechanism. **Every mechanism this round could safely bring to
READY_WITH_MAPPING or better, it did; the one finding that cannot be closed by this round's own
mandate — because closing it requires a product decision, not a repair — is the one still open,
and is reported as such, prominently, rather than folded into a clean P0=0 headline.**

### Consumer coverage, summarized (post-repair)

Eight of the 24 mechanisms show zero handoff-traceable consumers, unchanged from the audit round.
Six of those eight remain correctly so — event-triggered entry points, the expected shape for
reusable infrastructure. `CON-34` is now documented explicitly as the same shape, not an anomaly.
`OPS-126` is now a settled classification (unconsumed-but-valid) rather than an open question. Full
detail, including every mechanism's representative consumer ids, is in `CONSUMER-COVERAGE.md`.


## All 24 mechanisms, individually

## CMS-201 — Communication Obligation Creation

READINESS: READY_WITH_MAPPING

WHY:
The suppress/reuse/create split and CMS-R2's discipline are sound; a.create is now atomically create-if-absent on (recipient_id, obligation_subject) with a declared idempotencyKey and instanceKey - a concurrent duplicate-event race resolves to one canonical obligation, never two. The one remaining P0 this round found is closed.

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
a.create is atomically create-if-absent on (recipient_id, obligation_subject); a losing concurrent caller resolves to the existing obligation rather than duplicating it - c.existing's own read is a fast-path optimization, not the safety mechanism
Attempt identity: none named (provenance: undeclared). Structurally declared as a field: yes.

CONCURRENCY:
Primitive: compare-and-set — two concurrent deliveries of the same authoritative_business_event both reaching a.create for the same (recipient_id, obligation_subject) - now resolved by making a.create itself atomic on that identity

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
Decision basis: Does a communication requirement exist for this event and this recipient?; Is an equivalent communication already outstanding for this recipient, as far as a non-atomic read can tell?
Side effect attempted: communication_log
Attempt identity: not recorded
Dependency response: recorded per-attempt where the mechanism crosses a provider/worker boundary (see delivery_log/work_log writes)
Current owner: transfers via its own handoff nodes; see handoffs

CONSUMERS:
entry point of the CMS pipeline; triggered by authoritative_business_event, presumably emitted by any of the 68 message-sending journeys' own execution:"communication" actions, but no canonical journey structurally hands off into CMS-201 - a legitimate event-driven entry-point shape, the same as CON-35/OPS-121/OPS-128

TEST CASES:
- concurrent-invocation: given two authoritative_business_event deliveries for the same recipient and subject arrive within milliseconds of each other — expect exactly one communication obligation exists afterward - a.create's own atomicity on (recipient_id, obligation_subject) resolves the race, not c.existing's earlier read
- duplicate-invocation: given the same business event is redelivered (at-least-once queue semantics) — expect c.existing folds it into the prior obligation via a.reuse, or - if the race window was hit - a.create itself resolves to the same existing obligation

GAPS:
- P2 [consumer-coverage] No canonical journey structurally hands off into CMS-201; it is reached only via its own named trigger event, which is not itself emitted by any of the 68 message-sending journeys' own nodes in a traceable way - documented as a legitimate event-driven entry point, not treated as a defect.

---

## CMS-202 — Recipient Resolution

READINESS: READY_WITH_MAPPING

WHY:
Clean two-step who-then-where resolution with an explicit role-vs-named-party distinction and a real verification wait/timeout. Every writing action now carries a declared idempotencyKey scoped to obligation_id, formalizing what was already low-risk by construction.

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
every writing action (a.identity, a.unresolved, a.role, a.destinations, a.no-route, a.hold, a.ready) now declares idempotencyKey scoped to obligation_id
Attempt identity: none named (provenance: undeclared). Structurally declared as a field: yes.

CONCURRENCY:
Primitive: none-required

FRESHNESS / REVALIDATION:
Revalidates before consequential execution. Checks: destination currently valid (not merely present in the record); role's current holder, not who held it when the record was written

TIMEOUT / CANCELLATION:
- w.authorization: onTimeout → a.no-route (recheck: the obligation's own relevance window and whether it still stands, before recording CONTACT_ROUTE_UNAVAILABLE)

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
none found

---

## CMS-203 — Channel Eligibility Resolution

READINESS: READY

WHY:
A pure read-and-evaluate decision mechanism with an explicit, well-enforced write/read boundary against CON-35, no side effects beyond its own routing log, and an honest escalation to DEC-181 rather than inventing a permission rule when none is defined. Every writing action now carries a declared idempotencyKey for completeness, though the mechanism's own low risk was never in question.

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
pure evaluation against current permission state; every writing action (a.purpose, a.alternate, a.candidates, a.undeliverable) now declares idempotencyKey scoped to obligation_id
Attempt identity: none named (provenance: undeclared). Structurally declared as a field: yes.

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

READINESS: READY_WITH_MAPPING

WHY:
The smallest-valid-set selection discipline and the explicit non-duplication guardrails are sound; a.prepare now mints message_id deterministically from obligation_id, declared as the entity's own instanceKey, closing the identity gap CMS-206's attempt tracking depends on.

RESPONSIBILITY:
Pick the smallest channel set that satisfies the obligation and prepare the message instance for it.

INPUT CONTRACT:
- one or more channels permitted for this obligation's purpose (required) — provenance: CMS-203's h.route handoff

OUTPUT CONTRACT:
Classes: decision, normalized-state
Distinguishable outcomes: h.send-ready (prepared message on a selected route)

SIDE EFFECTS:
Classes: decides-only, writes-internal-state

IDEMPOTENCY / ATTEMPT IDENTITY:
a.prepare mints message_id deterministically from obligation_id and declares idempotencyKey scoped to it - a redelivered t.permitted for the same obligation reuses message_id rather than minting a second prepared instance
Attempt identity: message_id (provenance: self-minted-on-entry). Structurally declared as a field: yes.

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
Attempt identity: message_id (named in prose, not a declared field)
Dependency response: recorded per-attempt where the mechanism crosses a provider/worker boundary (see delivery_log/work_log writes)
Current owner: transfers via its own handoff nodes; see handoffs

CONSUMERS:
1 handoff consumer: CMS-203

TEST CASES:
- duplicate-invocation: given channel selection is re-invoked for the same obligation after a lost response — expect a.prepare's own idempotencyKey (obligation_id) resolves to the same message_id rather than minting a second prepared instance

GAPS:
none found

---

## CMS-205 — Send Eligibility Check

READINESS: READY

WHY:
The single cleanest implementation of the corpus-wide revalidate-from-now house rule in this entire audit round. a.send now explicitly mints attempt_id (the identity CMS-206 persists), is idempotent on message_id since this mechanism runs at most once per message (CMS-208's own recovery loop retries independently downstream rather than looping back through here), and every writing action carries a declared idempotencyKey.

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
a.send is idempotent on message_id - this mechanism runs at most once per message, so a redelivered trigger reuses the attempt_id already minted rather than minting a second one and risking a duplicate provider submission
Attempt identity: attempt_id (provenance: self-minted-on-entry). Structurally declared as a field: yes.

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
Attempt identity: attempt_id (named in prose, not a declared field)
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
The strongest attempt-identity design in the round, now fully structural: entity.instanceKey is (message_id, attempt_id), both caller-supplied before submission per entity.note's own explicit provenance statement, and a.persist's idempotencyKey is exactly that composite key. The unknown-outcome path (timeout -> a.unknown -> c.duplicates -> h.reconcile) remains exemplary.

RESPONSIBILITY:
Record the handover to a provider - accepted, refused, or unknown - as a fact about the provider's queue, distinct from delivery.

INPUT CONTRACT:
- validated message submitted to a delivery mechanism or provider, carrying a message_id and an attempt_id already minted by the caller (required) — provenance: CMS-205's h.attempt handoff

OUTPUT CONTRACT:
Classes: execution-attempt, provider-status
Distinguishable outcomes: x.pending (SENT, DELIVERY_PENDING); h.recover (accepted-then-refused, or unknown-but-safe-to-resend); h.reconcile (unknown, duplicate would matter)

SIDE EFFECTS:
Classes: submits-to-provider, writes-internal-state

IDEMPOTENCY / ATTEMPT IDENTITY:
attempt_id is caller-supplied, minted by CMS-205's a.send before this mechanism ever runs - a.persist's idempotencyKey (message_id + attempt_id) means a redelivered t.submitted for the same already-minted attempt persists once, not twice
Attempt identity: message_id, attempt_id (provenance: caller-supplied). Structurally declared as a field: yes.

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
Attempt identity: message_id, attempt_id (named in prose, not a declared field)
Dependency response: recorded per-attempt where the mechanism crosses a provider/worker boundary (see delivery_log/work_log writes)
Retried/suppressed/superseded: suppressed_sends log
Current owner: transfers via its own handoff nodes; see handoffs

CONSUMERS:
1 handoff consumer: CMS-205

TEST CASES:
- unknown-outcome: given the submission connection drops before the provider accepts or refuses, and the message carries a payment link — expect a.unknown -> c.duplicates -> h.reconcile; no resend until the true state is established
- duplicate-invocation: given t.submitted is redelivered for the same (message_id, attempt_id) — expect a.persist's own idempotencyKey resolves it to a single persisted attempt record

GAPS:
- P2 [unknown-outcome] A late provider acceptance/refusal arriving after w.acceptance's own timeout already routed to a.unknown is not explicitly addressed within CMS-206 itself - it presumably lands on CMS-207 (which does handle late/duplicate outcomes correctly via c.idempotent), but CMS-206's own graph does not show that path explicitly.

---

## CMS-207 — Delivery Outcome Reconciliation

READINESS: READY

WHY:
The best-designed idempotent-consumer pattern in the entire round: an explicit c.idempotent condition classifying every inbound outcome as new/duplicate/late-and-weaker before acting on it, x.duplicate-event as a first-class no-op exit, and a.late's explicit non-overwrite-of-stronger-evidence rule. Every writing action now also carries a formal idempotencyKey scoped to attempt_id (or the raw provider reference, for the pre-correlation step), matching what the mechanism's own condition logic already enforced correctly.

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
explicit: c.idempotent classifies every inbound event as new-and-current / already-processed / late-and-weaker before any write; repeated webhook delivery is a named, handled case. Every writing action's own idempotencyKey (attempt_id-scoped, or raw_status_reference-scoped for a.correlate specifically, since attempt_id is not yet confirmed at that point) is a second, structural layer of the same protection
Attempt identity: attempt_id (provenance: correlated-to-prior-attempt). Structurally declared as a field: yes.

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
Attempt identity: attempt_id (named in prose, not a declared field)
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

READINESS: READY_WITH_MAPPING

WHY:
The failure-class taxonomy and destination-scoping discipline are exemplary. The retry-ownership ambiguity this round found is resolved: distinctFrom now states explicitly that this mechanism owns its own complete channel-aware retry loop end to end and does not invoke OPS-124, because channel failure classification is domain knowledge OPS-124 deliberately has no reason to carry. a.retry now carries a declared attemptBudget (required: true, no invented number) scoped to (message_id, destination_id).

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
"the retry budget is fixed at the first failure and does not renew" is now a declared attemptBudget Config (required: true), scoped to (message_id, destination_id); every writing action carries idempotencyKey on the same composite key
Attempt identity: message_id, destination_id (provenance: caller-supplied). Structurally declared as a field: yes.

CONCURRENCY:
Primitive: none-required

FRESHNESS / REVALIDATION:
Revalidates before consequential execution. Checks: whether the communication is still relevant before recovering (c.relevant)

RETRY / FAILURE SEMANTICS:
Owns its own retry loop: yes. Failure classes: retryable, non-retryable, unknown. Budget durable across restarts: yes. Revalidates before retry: yes.

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
Attempt identity: message_id, destination_id (named in prose, not a declared field)
Dependency response: recorded per-attempt where the mechanism crosses a provider/worker boundary (see delivery_log/work_log writes)
Retried/suppressed/superseded: suppressed_sends log
Current owner: transfers via its own handoff nodes; see handoffs

CONSUMERS:
3 handoff consumers: CMS-206, CMS-207, DOC-214 (DOC-214's own h.recover contract now declares message_id + destination_id explicitly)

TEST CASES:
- dependency-retryable-failure: given a TEMPORARY or RATE_LIMITED failure with retry budget remaining — expect a.retry mints a fresh attempt for this physical try, spends one unit of the (message_id, destination_id)-scoped budget, then c.budget re-evaluates
- partial-failure: given the same underlying communication also has an active OPS-124 retry instance for a non-communication side effect it triggered — expect the two budgets are independent by design - this mechanism's own distinctFrom now states explicitly it does not delegate to OPS-124

GAPS:
none found

---

## CMS-210 — Communication Obligation Closure

READINESS: READY_WITH_MAPPING

WHY:
The completion-semantics discipline is exemplary (attempt vs. delivery is never guessed, DEC-181 escalation when undefined), and the superseded-vs-unmet distinction is exactly the kind of output-class completeness this round asks every mechanism for. Every writing action now carries a declared idempotencyKey scoped to obligation_id.

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
a.superseded, a.complete, a.unreachable all carry idempotencyKey scoped to obligation_id
Attempt identity: none named (provenance: undeclared). Structurally declared as a field: yes.

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
3 handoff consumers: CMS-203 (escalated undeliverable), CMS-207 (confirmed delivery), CMS-208 (exhausted routes) - all three now declare obligation_id in their own contract.requiredFields

TEST CASES:
- happy-path: given delivery is confirmed and the obligation requires confirmed delivery — expect a.complete -> x.completed

GAPS:
none found

---

## CON-34 — Frequency Recalculation

READINESS: READY_WITH_MAPPING

WHY:
The default-optional-only scoping and the never-retroactive guardrail are sound. a.include and a.trim now carry declared idempotencyKeys scoped to person_id. The isolation this round's audit flagged is resolved by classification, not by a code change: entity.note now documents explicitly that this is a legitimate event-driven entry point, the same shape as CMS-201/CON-35/OPS-121/OPS-128, not an orphan.

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
a.recalculate writes with mode:"set" (naturally idempotent); a.include and a.trim now carry idempotencyKey scoped to person_id
Attempt identity: none named (provenance: undeclared). Structurally declared as a field: yes.

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
0 handoff consumers and 0 outbound handoffs - classified this round as a legitimate event-driven entry point (frequency_preference_changed, a declared first-party act), the same shape as the other zero-handoff-consumer mechanisms, not an orphan; documented explicitly in entity.note

TEST CASES:
- happy-path: given a person reduces marketing frequency from weekly to monthly — expect future cadence recalculated; already-delivered messages untouched

GAPS:
- P2 [consumer-coverage] Still no traceable structural consumer of any kind (handoff or otherwise) - this round's investigation concluded the mechanism is a legitimate event-driven entry point rather than an orphan, but that conclusion rests on the trigger event's own registered meaning, not on a confirmed real emitter in the current 283-journey corpus.

---

## CON-35 — Permission Change Enforcement

READINESS: READY_WITH_MAPPING

WHY:
The enforce-first-propagate-after asymmetry is exactly the right design, and origin/version-based propagation with an explicit CON-40 conflict escalation path is a genuine, well-reasoned optimistic-convergence pattern. change_origin and change_version (matching IDN-89's own naming convention from the silent-lifecycle-state round) are now declared instanceKey/idempotencyKey fields rather than prose-only.

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
a.record assigns change_version and change_origin explicitly; a.propagate carries both so a dependent system only applies a propagation newer than what it already holds - now a declared instanceKey (person_id, change_version), not prose alone
Attempt identity: change_version, change_origin (provenance: self-minted-on-entry). Structurally declared as a field: yes.

CONCURRENCY:
Primitive: optimistic-version-check — an out-of-order echo or a redelivered propagation event, explicitly guarded against by change_origin+change_version comparison

FRESHNESS / REVALIDATION:
Does not revalidate before execution (low or no consequential-action risk in this mechanism's own scope, or not applicable).

ORDERING:
Required: yes — change_origin and change_version, so a redelivered or out-of-order propagation event is discarded rather than reapplied

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
Attempt identity: change_version, change_origin (named in prose, not a declared field)
Retried/suppressed/superseded: suppressed_sends log
Current owner: transfers via its own handoff nodes; see handoffs

CONSUMERS:
0 handoff consumers - triggered by authoritative_permission_change, an authoritative system event, appropriately not journey-initiated. Hands off to CON-40 on convergence failure, now carrying disputed_permission_ref explicitly.

TEST CASES:
- late-callback: given a propagation confirmation for an older change_version arrives after a newer one already converged — expect discarded by version comparison rather than reverting the newer state

GAPS:
none found

---

## CON-36 — Contactability Recalculation

READINESS: READY_WITH_MAPPING

WHY:
The per-destination (not per-person, not per-channel) granularity is the single most important correctness property this mechanism has and it holds it without exception; contactability/permission separation is airtight. entity.instanceKey (contact_point_id) is now declared and every writing action carries a matching idempotencyKey.

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
a.state/a.add/a.resume/a.suppress all now carry idempotencyKey scoped to contact_point_id
Attempt identity: none named (provenance: undeclared). Structurally declared as a field: yes.

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
3 handoff consumers: ACC-261, FUL-276 (both outside this round's 24, referencing CON-36 as authoritative contactability - their own h.unreachable handoffs remain a documented, reviewed exception since they report all-routes-exhausted rather than a single contact_point_id), CMS-208 (permanent-destination evidence, now declaring contact_point_id explicitly)

TEST CASES:
- happy-path: given an email address hard-bounces — expect a.suppress records UNDELIVERABLE for that destination only; other destinations on the same person are untouched

GAPS:
- P2 [idempotency] "Repair attempts are bounded per cycle" is a stated guardrail with no attemptBudget Config declared - unlike CMS-208/OPS-124, this mechanism has no single dedicated repair-retry action node to attach the budget to, so this remains a documented, unresolved gap rather than a fix.

---

## CON-39 — Communication Cooldown

READINESS: READY_WITH_MAPPING

WHY:
Correctly bounded (expiry is the ordinary path, not an exception), correctly scoped (does not cover every channel by default), and the discard-not-replay guardrail on release matches CON-38's identical rule exactly. entity.instanceKey (person_id, cooldown_context) is now declared, every writing action carries idempotencyKey, and w.cooldown now carries an explicit recheck.

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
a.create (coarser, person_id-scoped, since it establishes cooldown_context itself), a.policy-scope and a.reevaluate (both cooldown_context-scoped) now all carry idempotencyKey
Attempt identity: none named (provenance: undeclared). Structurally declared as a field: yes.

CONCURRENCY:
Primitive: none-required

FRESHNESS / REVALIDATION:
Revalidates before consequential execution. Checks: current eligibility recalculated at release (w.cooldown's own recheck), backlog discarded rather than replayed

TIMEOUT / CANCELLATION:
- w.cooldown: onTimeout → a.reevaluate (recheck: current eligibility for the governed classes, re-read from authoritative state before re-evaluating - not the state as it stood when the cooldown began)

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
0 handoff consumers - triggered by cooldown_triggering_event, presumably emitted by business logic elsewhere, not traceable via handoff. Hands off to CON-38 when a cooldown's reason hardens, now declaring person_id + suppression_scope explicitly.

TEST CASES:
- happy-path: given the cooldown period elapses with no basis change — expect a.reevaluate recalculates current eligibility; backlog discarded

GAPS:
none found

---

## CON-40 — Permission Conflict Resolution

READINESS: READY_WITH_MAPPING

WHY:
The best-designed conflict-resolution mechanism in the round: fail-safe-first ordering, change_origin/change_version-based reconciliation, and explicit change-version-checked verification writes. entity.instanceKey (person_id, disputed_permission_ref) is now declared and every writing action carries a matching idempotencyKey.

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
a.failsafe, a.collect, a.scope, a.enter, a.apply, a.release all carry idempotencyKey scoped to (person_id, disputed_permission_ref); a.apply propagates a fresh change_version for the resolution; a.verify checks convergence against that same version
Attempt identity: change_origin, change_version (provenance: self-minted-on-entry). Structurally declared as a field: yes.

CONCURRENCY:
Primitive: optimistic-version-check — two systems each correcting the other in a synchronisation loop, explicitly named and guarded against

FRESHNESS / REVALIDATION:
Does not revalidate before execution (low or no consequential-action risk in this mechanism's own scope, or not applicable).

ORDERING:
Required: yes — provenance and change_version identify which record reflects the actual decision; a system timestamp alone is explicitly rejected as authority

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
Attempt identity: change_origin, change_version (named in prose, not a declared field)
Retried/suppressed/superseded: suppressed_sends log
Current owner: transfers via its own handoff nodes; see handoffs

CONSUMERS:
1 handoff consumer: CON-35 (on convergence failure, now carrying disputed_permission_ref explicitly)

TEST CASES:
- partial-failure: given reconciliation applies a corrected state but one required system does not converge — expect c.converged routes back to h.manual rather than declaring success

GAPS:
none found

---

## OPS-121 — Asynchronous Work Processing

READINESS: READY_WITH_MAPPING

WHY:
The foundational mechanism of the entire OPS domain; the accepted-is-not-completed discipline is exactly right, and the round's most consequential idempotency gap is now closed here: entity.instanceKey is (work_id, logical_operation_key), with the two identities' distinct roles documented explicitly in entity.note (logical_operation_key is the caller-supplied dedup identity; work_id is this mechanism's own record identity, minted at acceptance). Every writing action carries a matching idempotencyKey.

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
a.persist is idempotent on logical_operation_key - a second acceptance call for the same key returns the existing work_id rather than minting a new one. a.queued and a.processing (which also mints attempt_number for its own bookkeeping) are scoped to work_id, the narrower identity that already exists by that point
Attempt identity: logical_operation_key, work_id, attempt_number (provenance: caller-supplied). Structurally declared as a field: yes.

CONCURRENCY:
Primitive: compare-and-set — two acceptance calls for the same logical_operation_key racing to mint work_id

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
Attempt identity: logical_operation_key, work_id, attempt_number (named in prose, not a declared field)
Dependency response: recorded per-attempt where the mechanism crosses a provider/worker boundary (see delivery_log/work_log writes)
Current owner: transfers via its own handoff nodes; see handoffs

CONSUMERS:
0 handoff consumers within the canonical corpus - the root of the async-processing tree, entered by any asynchronous business action; 5 outbound handoffs (OPS-122, OPS-123, OPS-124, OPS-127, OPS-130) make it the domain's clear hub, now all declaring workload_class/work_id/logical_operation_key explicitly where the target requires it

TEST CASES:
- duplicate-invocation: given the same business action is accepted as work twice (a redelivered request) under the same logical_operation_key — expect a.persist's own idempotencyKey resolves both calls to the same work_id

GAPS:
none found

---

## OPS-122 — Queue Lag Management

READINESS: READY

WHY:
An aggregate measurement-and-response mechanism, not a per-item transactional one, which genuinely lowers its own idempotency/concurrency risk relative to the rest of the domain. entity.instanceKey (workload_class) is now declared and every writing action carries a matching idempotencyKey, formalizing what was already low-risk by construction.

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
a.measure, a.lagging, a.urgent, a.response all carry idempotencyKey scoped to workload_class
Attempt identity: none named (provenance: undeclared). Structurally declared as a field: yes.

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
1 handoff consumer: OPS-121 (queue SLA exceeded, now declaring workload_class explicitly). Hands off to OPS-129 (drain) and OWN-55 (escalate).

TEST CASES:
- happy-path: given a burst that current throughput will absorb within SLA — expect x.observe; no operational response applied, avoiding alert fatigue

GAPS:
none found

---

## OPS-123 — Stalled Work Recovery

READINESS: READY_WITH_MAPPING

WHY:
The long-running-is-not-stalled distinction and the side-effect-uncertainty gate before any reclaim are both exactly right. The vocabulary gap this round found (vaguer than OPS-128's own lease language) is closed: entity.note now explicitly names this as the same lease concept OPS-128 uses, applied to a work item whose owner is still nominally alive; a.reclaim's own text now says "transferring the work item's lease" rather than the earlier generic "coordinating ownership."

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
a.inspect, a.stalled, and a.reclaim all carry idempotencyKey scoped to work_id
Attempt identity: none named (provenance: undeclared). Structurally declared as a field: yes.

CONCURRENCY:
Primitive: lease — two workers concurrently recovering the same exclusive job - now named explicitly as the same lease concept OPS-128 uses

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
- concurrent-invocation: given two recovery attempts fire for the same stalled job near-simultaneously — expect the lease transfer in a.reclaim is the coordination point - now named consistently with OPS-128's own concept

GAPS:
none found

---

## OPS-124 — Retry Management

READINESS: READY_WITH_MAPPING

WHY:
The most complete retry contract in the corpus, now fully structural: entity.instanceKey (work_id, logical_operation_key) with the two identities' roles documented precisely (logical_operation_key is what a.attempt sends downstream unchanged across every retry, so a receiver that got attempt 1 can absorb attempt 2; attempt_number is this mechanism's own local bookkeeping, never sent downstream). a.attempt carries a declared attemptBudget (required: true). The caller/callee ambiguity with CMS-208 is resolved via CMS-208's own corrected distinctFrom.

RESPONSIBILITY:
Repeat a transient failure within a durable, bounded budget, only where repeating is safe and the work is still wanted.

INPUT CONTRACT:
- a failure classified as transient by an explicit classification (required) — provenance: OPS-121's h.retry, OPS-126's h.retry (now declaring work_id + logical_operation_key explicitly)

OUTPUT CONTRACT:
Classes: retry-schedule, execution-attempt
Distinguishable outcomes: x.cancelled; x.stale (CANCELLED_STALE); h.verify (retry succeeded); h.dead-letter (budget exhausted, or not safely repeatable)

SIDE EFFECTS:
Classes: decides-only, writes-internal-state, submits-to-provider

IDEMPOTENCY / ATTEMPT IDENTITY:
a.attempt executes under logical_operation_key - the same value on every physical try - so a downstream that received an earlier attempt can absorb this one; attempt_number still advances for this mechanism's own bookkeeping but is never itself part of the downstream dedup key
Attempt identity: logical_operation_key, work_id, attempt_number (provenance: caller-supplied). Structurally declared as a field: yes.

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
Attempt identity: logical_operation_key, work_id, attempt_number (named in prose, not a declared field)
Dependency response: recorded per-attempt where the mechanism crosses a provider/worker boundary (see delivery_log/work_log writes)
Current owner: transfers via its own handoff nodes; see handoffs

CONSUMERS:
2 handoff consumers: OPS-121, OPS-126 (now declaring work_id + logical_operation_key explicitly). CMS-208's own distinctFrom now explicitly states it does NOT delegate to this mechanism, resolving the prior round's caller/callee ambiguity.

TEST CASES:
- dependency-retryable-failure: given a transient failure with budget remaining and the work still required at revalidation — expect a.attempt executes idempotently under logical_operation_key
- stale-state: given the target entity moved during backoff and the work is no longer required — expect x.stale; the retry is cancelled with a reason rather than executed

GAPS:
none found

---

## OPS-125 — Work Deduplication

READINESS: READY_WITH_MAPPING

WHY:
The identity-is-the-business-operation-not-the-payload distinction (OPS-R7) is the correct answer to the single most common deduplication mistake. entity.instanceKey (logical_operation_key) is now declared, matching OPS-121/OPS-124's own field exactly, and every writing action carries a matching idempotencyKey.

RESPONSIBILITY:
Stop the same logical business operation from running twice, without collapsing two legitimate repeats of the same payload into one.

INPUT CONTRACT:
- two or more work instances that may represent the same logical business operation (required) — provenance: FIN-135's own handoff (now declaring logical_operation_key explicitly), or any duplicate-detection trigger

OUTPUT CONTRACT:
Classes: decision, normalized-state
Distinguishable outcomes: x.independent (not a duplicate); x.suppressed (canonical result reused); x.attached (waiting on in-flight canonical execution); h.reconcile (conflicting outcomes)

SIDE EFFECTS:
Classes: decides-only, writes-internal-state, suppresses-queued-work

IDEMPOTENCY / ATTEMPT IDENTITY:
a.compare, a.reuse, a.attach all carry idempotencyKey scoped to logical_operation_key - the same field OPS-121/OPS-124 mint and carry, not a second independently-invented identity
Attempt identity: logical_operation_key (provenance: caller-supplied). Structurally declared as a field: yes.

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
Attempt identity: logical_operation_key (named in prose, not a declared field)
Dependency response: recorded per-attempt where the mechanism crosses a provider/worker boundary (see delivery_log/work_log writes)
Current owner: transfers via its own handoff nodes; see handoffs

CONSUMERS:
1 handoff consumer: FIN-135 (now declaring logical_operation_key explicitly)

TEST CASES:
- duplicate-invocation: given the canonical execution completed and its result is still valid — expect a.reuse suppresses the duplicate and reuses the result
- concurrent-invocation: given the canonical execution is still running when the duplicate arrives — expect a.attach joins it rather than starting a second execution, where the architecture permits

GAPS:
none found

---

## OPS-126 — Partial Processing Recovery

READINESS: READY_WITH_MAPPING

WHY:
The design itself is sound (never replay successful children, honest escalation when no aggregation policy is defined, explicit compensation-only-when-transaction-semantics-require-it). entity.instanceKey (composite_job_id) is now declared and every writing action carries a matching idempotencyKey; the h.retry handoff into OPS-124 now declares each failed child's own work_id + logical_operation_key explicitly. This round's consumer-coverage investigation concludes: unconsumed-but-valid, not orphaned or duplicate.

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
a.classify and a.recompute both carry idempotencyKey scoped to composite_job_id; the parent state is always recomputed from authoritative child outcomes rather than incrementally applied
Attempt identity: none named (provenance: undeclared). Structurally declared as a field: yes.

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
0 handoff consumers; DAT-225's only reference to it is a distinctFrom explaining why DAT-225 does not use it. This round's investigation (Part 24) classifies this mechanism as unconsumed-but-valid: the design is sound and would correctly serve real composite/batch/fan-out work, but no confirmed consumer exists in the current 283-journey corpus. Not deleted, not flagged as duplicate or obsolete - no evidence supports either label.

TEST CASES:
- partial-failure: given a batch operation with some children succeeded and some failed retryably — expect a.classify marks each individually; h.retry carries only the failed scope, with each child's own work_id + logical_operation_key

GAPS:
- P2 [consumer-coverage] No canonical journey in the current 283-journey corpus is confirmed to produce composite/fan-out/batch work this mechanism would receive. This round's investigation concludes 'unconsumed-but-valid' rather than 'orphaned' or 'candidate-deprecated' - the design is sound for a shape of work the corpus does not yet contain, which is different from a defect. Downgraded from P1 (open question) to P2 (documented, non-blocking conclusion) now that the classification is settled.

---

## OPS-127 — Dead-Letter Recovery

READINESS: READY_WITH_MAPPING

WHY:
The review-horizon escalation prevents the dead-letter queue from becoming invisible storage, the replay-preserves-audit-chain rule is explicit, and the side-effect-uncertainty gate before any replay is consistent with the rest of the domain. entity.instanceKey (work_id) is now declared and every writing action carries a matching idempotencyKey; a.correct now explicitly mints replay_id linked via original_work_id.

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
a.preserve, a.correct, a.close all carry idempotencyKey scoped to work_id; a.correct's own replay_id (linked via original_work_id) is the corpus's clearest parent-child attempt-chain pattern, now named as fields rather than left as pure prose
Attempt identity: replay_id, original_work_id (provenance: self-minted-on-entry). Structurally declared as a field: yes.

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
Attempt identity: replay_id, original_work_id (named in prose, not a declared field)
Dependency response: recorded per-attempt where the mechanism crosses a provider/worker boundary (see delivery_log/work_log writes)
Current owner: transfers via its own handoff nodes; see handoffs

CONSUMERS:
2 handoff consumers: OPS-121, OPS-124

TEST CASES:
- happy-path: given the authoritative problem is diagnosable and fixable — expect a.correct replays under a new replay_id linked to the original via original_work_id, audit chain intact

GAPS:
none found

---

## OPS-128 — Worker Failure Recovery

READINESS: READY_WITH_MAPPING

WHY:
The single most concrete concurrency primitive in the entire round: an explicit lease with a wait-out-the-lease-before-reclaiming semantics, correctly distinguishing worker death from work failure, and gating any restart behind a confirmed-not-completed check. entity.instanceKey (work_id, lease_id) is now declared, formalizing the lease concept the mechanism's own prose already named precisely.

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
a.identify, a.checkpoint, a.restart all carry idempotencyKey; a.checkpoint/a.restart both mint a fresh lease_id for the new owner; c.confirmed gates on "an authoritative completion exists" before ever considering a restart, which is the correct order (check completion, then check lease, then resume)
Attempt identity: lease_id (provenance: self-minted-on-entry). Structurally declared as a field: yes.

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
Attempt identity: lease_id (named in prose, not a declared field)
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
The stale-work-is-cancelled-not-delivered rule and the priority-not-arrival-order drain strategy are both exactly the corpus's own OPS-R12/R13/R14 rules made concrete. entity.instanceKey (workload_class) is now declared and every writing action carries a matching idempotencyKey.

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
a.inventory, a.cancel, a.strategy, a.drain, a.throttle all carry idempotencyKey scoped to workload_class
Attempt identity: none named (provenance: undeclared). Structurally declared as a field: yes.

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
The technical-completion-is-not-business-completion distinction, stated once and applied as its own dedicated mechanism rather than folded into every producer, is the corpus's cleanest single architectural decision in the round. entity.instanceKey (work_id) is now declared and every writing action carries a matching idempotencyKey - a.verify's own idempotency was already true by construction; the key is now a consistent structural marker of that fact rather than the thing making it safe.

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
explicitly idempotent by design - "verification is idempotent, so checking twice costs nothing and proves the same thing each time" - now backed by a declared idempotencyKey on a.finalize, a.verify and a.business-complete, scoped to work_id
Attempt identity: none named (provenance: undeclared). Structurally declared as a field: yes.

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
