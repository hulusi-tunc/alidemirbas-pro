# Cross-Library Integration Audit — do all 284 canonical items work correctly together?

**AUDIT ONLY.** This round did not modify anything under `src/`, `production/`, `scripts/`, `seo/`,
`search/`, or any site UI. It is the fifth round in this production-readiness program and the first
to treat the unit of analysis as the *relationship* between canonical items rather than any single
item in isolation. The four prior rounds — Customer Journeys, Silent Lifecycle States, Runtime
Mechanisms, Operational Workflows — each closed with P0 = 0 within their own layer. This round asks
whether the 284 individually-correct pieces are also correct *together*, as one orchestration
system.

## Corpus confirmation

Re-derived directly from `src/canonical/surface.ts`'s classification rule applied to the current
`production/canonical-dump.json` (284 journeys, 3682 nodes — unchanged from the just-closed
Operational Workflow round; no canonical source was touched this round, so nothing to re-derive
differently):

| Surface | Count |
|---|---|
| Customer Journeys — message-sending (`customer-communicating`) | 68 |
| Customer Journeys — human-routing-only (`customer-human-routing`) | 3 (`ACQ-04`, `ACT-11`, `RET-24`) |
| Silent Lifecycle States (`customer-silent`) | 64 |
| Runtime Mechanisms (`mechanism`) | 25 |
| Operational Workflows (`operational`) | 124 |
| **Total** | **284** |

68 + 3 + 64 + 25 + 124 = 284, exact, zero leakage between buckets.

## Edge inventory

548 explicit, structured relationships extracted directly from canonical source (never inferred
from prose) — every `handoff` node, every `competition` declaration (`journey.competition` or
vNext `journey.contact.competition`, matching `scripts/validate-canonical.mjs`'s own group logic
exactly), and every `preemptedBy` reference. Full machine-readable form:
`relationship-graph.json`.

| Edge type | Count |
|---|---|
| `handoff` | 522 |
| `competition` | 22 (7 groups) |
| `preemption` | 4 |
| **Total explicit edges** | **548** |

Of the 522 handoffs, 81 target `external:*` sinks (documented, intentional out-of-corpus
destinations — a human-in-the-loop lifecycle, another system of record, etc.), not canonical items.
The remaining 441 target a real canonical id.

**Target existence: 0 dangling, confirmed by direct computation.** Every in-corpus handoff target
resolves to a real journey id; every external target is correctly non-canonical by design; zero
targets point at a retired/merged id without going through `mergedInto`.

### Surface-to-surface matrix (handoff edges; External broken out separately)

| Source ↓ / Target → | Customer (comm) | Customer (human-routing) | Silent | Runtime | Operational | External |
|---|---|---|---|---|---|---|
| **Customer** | 29 | 2 | 34 | 3 | 30 | 18 |
| **Silent** | 18 | 0 | 51 | 0 | 36 | 19 |
| **Runtime** | 0 | 0 | 1 | 24 | 11 | 11 |
| **Operational** | 20 | 0 | 11 | 1 | 172 | 33 |

Two combinations are structurally absent, confirmed by direct count: **Silent→Runtime (0 edges)**
and **Runtime→Customer (0 direct edges)**. Neither is inherently a defect — both are consistent
with each layer's documented role (Silent Lifecycle States are records, not orchestrators; Runtime
Mechanisms are infrastructure, not conversation-shaped, and route through Operational or Silent
first) — reported as structural facts, not asserted correct or incorrect without the semantic
passes that follow.

## Executive summary

The corpus's cross-layer *machinery* is sound. Zero dangling handoffs across 522 edges. Zero
unbounded side-effecting cycles across all 16 strongly-connected components found in the full
548-edge graph. `OPS-131` (competition arbitration) and `OPS-130` (technical-vs-business completion)
are both structurally well-built at the mechanism level — every one of the 7 declared competition
groups is enforceable through `OPS-131` as built, and `OPS-130` correctly distinguishes technical
success from business completion. The DEC-181-shaped defect this program repaired in the prior
round (an entry contract built for one kind of sender, receiving from many different kinds) does
**not** recur anywhere else in the 522-edge graph — every other hub receiver already uses
general-enough trigger evidence, several with an explicit reference-quality resolution
(`OWN-55`'s `c.transfers` branch).

The corpus's cross-layer *adoption* is where this round found real, production-relevant gaps, and
they cluster in one specific shape: **a mechanism built correctly is not consistently used by its
callers, and a signal built to catch a failure is not consistently consumed by anything.**
Concretely: `OPS-131` works, but 17 of 22 declared competition-group members have no caller-side
check of their own — 5 of the 7 groups have at least one confirmed-unprotected member, and 2 of
those 5 carry safety-relevant, P0-tier consequence (`account-restriction-authority` and
`retention-outreach`, the corpus's largest competition group). `OPS-130` works, but its own
exception exit — the signal specifically designed to make a lost business result visible — has zero
consumers anywhere in the 284-journey corpus, a P0 finding this round considers its single most
important discovery: the corpus's canonical arbiter for the technical/business distinction is
itself missing the propagation step its own guardrail promises.

Beyond the 3 confirmed P0s, this round found 21 P1s and 18 P2s (full register below), the large
majority being localized, single-edge or single-pair findings rather than systemic patterns —
consistent with a corpus that has already been through four closed repair rounds. No new canonical
graph defect was found requiring the scale of change the prior four rounds each made; every finding
this round is a caller-side adoption gap, a missing structural cross-check, or a documentation/
provenance completeness gap, not a topology defect in any single journey's own graph.

## P0 / P1 / P2 totals

| Priority | Count |
|---|---|
| P0 | 3 |
| P1 | 21 |
| P2 | 18 |
| **Total confirmed findings** | **42** |

(Plus roughly 25 explicitly-documented positive/reference-pattern citations across the 10 companion
documents — instances checked and found correct, recorded to prevent later re-litigation, not
counted as findings.) Dedup methodology: several findings were independently surfaced by two
parallel research passes covering adjacent Parts of the governing brief (e.g. the identity-continuity
agent's `EDGE-COMPATIBILITY-MATRIX.md` and `IDENTITY-AND-PROVENANCE-AUDIT.md` cross-reference the
same `RET-24`→`RET-30` and `SCH-17x`→`SCH-180` findings by design, and `RESULT-AND-FEEDBACK-
INTEGRATION.md`/`EVENT-AND-AUTHORITY-INTEGRATION.md` explicitly cross-reference the `OPS-130` and
`REM-157` findings). Each is counted exactly once above; the companion documents note the
cross-reference at each occurrence.

## Top 25 findings

1. **[P0] `retention-outreach` competition group (6 members: `ACT-18`, `FBK-46`, `RET-24`, `RET-28`,
   `RET-30`, `RET-32`) — 5 of 6 members have zero structural enforcement of their declared
   precedence.** The corpus's largest competition group, previously named by the Runtime Mechanism
   round's own test matrix as "the most realistic case for a genuinely queued consequential
   message." `RET-24` is one of the 3 confirmed human-routing journeys — a human being assigned
   ownership of a retention case does not visibly stop `ACT-18`, `FBK-46`, `RET-28`, or `RET-30`
   from independently messaging the same account. See `OWNERSHIP-AND-COMPETITION-INTEGRATION.md`
   Parts 8/9/10.
2. **[P0] `account-restriction-authority` group (`ACC-78`, `IDN-90`) — neither member re-checks the
   other's live state before a consequential action**, despite each declaring deference to the
   other in prose. `ACC-78`'s `c.review`/`c.outcome` can reach "Lift it" while an `IDN-90`
   compromise investigation is still open on the same account, restoring access mid-active
   investigation. Same document, Part 10.
3. **[P0] `OPS-130`'s own exception exit is a corpus-wide dead end.** `x.reconciliation`
   (`RECONCILIATION_REQUIRED`) exists, per its own `reEntry` text, "so that gap is visible rather
   than reported as done" — but no handoff node exists in `OPS-130`'s graph, and
   `RECONCILIATION_REQUIRED` appears as a `trigger`, `wait.until`, or `measurement` reference
   nowhere else in the 283 other journeys. A job can report SUCCESS, `OPS-130` can correctly detect
   the business state never appeared, record the gap — and nothing in the corpus is wired to
   notice. See `RESULT-AND-FEEDBACK-INTEGRATION.md` Finding 1 (= `EVENT-AND-AUTHORITY-
   INTEGRATION.md` EA-1).
4. **[P1] `ACT-17` (Adoption Nurture) declares a real conflict relationship in guardrail prose
   identical in shape to `retention-outreach`'s own language, but is not a registered `competition`
   member** — invisible to `OPS-131` entirely, a genuine prose-only conflict the brief specifically
   asked to hunt for.
5. **[P1] `DEC-189`/`DEC-190` hand off directly into `DEC-183`'s `t.begins` trigger**, which
   explicitly names "a case being assigned" as *insufficient* evidence for review to begin — yet
   neither escalation path has a `DEC-182`-style accept/claim step. A customer-facing journey
   (`DEC-184`) is one of `DEC-189`'s callers, giving this practical stakes.
6. **[P1] The rollout domain (`RLT-241`–`RLT-250`) never hands a result back to `RLT-279`**, its
   only customer-facing entry point — a customer who unblocks a rollout cannot learn whether the
   change succeeded, paused, or rolled back.
7. **[P1] `REM-157`'s `idempotencyKey` (`obligation_id + issue_id`) cannot be constructed by 3 of
   its senders (`TIM-68`, `DEC-190`, `DAT-230`)**, none of which has an issue concept in its own
   entity model — while a 12th sender, `DOC-220`, already proves the correct fix (mint a fresh
   `issue_id`, declare `contract.requiredFields`) and simply wasn't applied to the other three.
8. **[P1] Business closure (`TRM-106`–`108`) and entitlement/access termination (`ACC-74`/`ACC-80`)
   have no structural handoff between them** — reconciled only by `TRM-107`'s own audit-and-escalate
   safety net, not by design. Two separate authorities for the same underlying fact ("this account
   is closed, so its entitlements should end").
9. **[P1] `TRM-104`'s already-catalogued unnamed-authority transfer decision propagates into
   `REL-100` (a Silent Lifecycle State) with zero recoverable provenance** — nothing downstream of
   `TRM-104` was ever going to receive what `TRM-104` itself never captured.
10. **[P1] `DEC-181`'s ~30-sender duplicate-request protection lives entirely in `c.duplicate`'s
    prose scope-match, not in its own `instanceKey`/`concurrency`** (which can structurally never
    fire, since `request_id` is freshly minted per entry) — the highest-fan-in identity point in the
    corpus is undocumented at the structural level. Not confirmed broken in any traced case.
11. **[P1] `SUB-163`→`SUB-164`: renewal execution binds to terms decided earlier with no
    revalidation branch and no explicit statement that binding (not revalidating) is the intended
    choice** — unlike sibling patterns (`RLT-243`/`244`, `DOC-215`/`216`/`220`) that state their
    choice explicitly.
12. **[P1] The re-evaluate-at-execution vs. cancel-and-regenerate choice is still, corpus-wide,
    chosen by construction rather than declared as a field** — reconfirmed with 2 new independent
    instances this round (`RLT-243`/`244`, `DOC-215`/`216`/`220`) beyond the prior round's own
    original finding.
13. **[P1] `RET-24 h.intervention → RET-30`: episode-identity discontinuity.** `RET-30` has no
    self-mint fallback and no capture step at all; `RET-24`'s own identity concept
    (`risk_episode_id`) genuinely differs from what `RET-30` needs (`retention_episode_id`), unlike
    the sibling `RET-28`→`RET-30` handoff which explicitly carries the episode. The one case in the
    522-edge graph where a receiver truly cannot construct a documented-required identity component
    with no fallback.
14. **[P1] `SCH-176`/`177`/`178`/`179`/`280` → `SCH-180` (5 edges, one finding): no cross-sender
    duplicate/correlation mechanism for `provider_failure_id` across 5 independent detection
    paths** converging on one target — same shape as the already-documented `RSK-193` coordination
    gap.
15. **[P1] `TRM-102.x.resolved` has no handoff back into `TRM-101` to resume consolidation after
    conflict resolution, and `TRM-101` has no unmerge/reversal path for a merge later found
    wrong.** The one operation this program's own repair round gated most carefully with an
    authorized-role human decision and an elevated evidence bar is also the one with no way to
    finish after a conflict, and no way back if it turns out wrong. Found via end-to-end tracing;
    see `INTEGRATION-TEST-MATRIX.md` scenario 7(b).
16. **[P1] `REL-99` and `INT-120` are the corpus's only 2 true orphan candidates** — zero handoff
    and zero prose reference anywhere across all 284 items, no nameable plausible emitter. Carried
    forward unchanged from the prior round's own investigation, now corroborated by the complete
    cross-library graph rather than newly discovered.
17. **[P1] `ACT-20` never checks for a concurrently open `lifecycle-stage` sibling (`ACT-12`)
    before sending its reactivation touch**, despite declared "lowest in the group" deference — can
    send a "we miss you" message to someone mid-active-onboarding.
18. **[P1] `outbound-ask` (`FBK-41`/`FBK-42`) has a fully pairwise-resolved precedence rule with
    zero caller-side enforcement of it in either journey's graph** — lower-severity than the P0
    groups (a possible double-ask, reversible, non-safety-relevant).
19. **[P1] `onLoss`'s 4 declared values (`suppressed`/`paused`/`superseded`/`exit`) are never
    reified as a state in any of the 22 losing journeys' own exit nodes** — the distinction lives
    only in `OPS-131`'s own log, external to the losing instance.
20. **[P1] `SUB-163`'s `w.decision` recheck explicitly promises to re-read "a cancellation in
    motion" but `c.decision` has no branch to act on that finding differently; the sibling
    `w.review` omits the recheck entirely** — inconsistent within the same journey.
21. **[P1, pre-existing, re-confirmed unchanged] `DEC-187 h.undefined → DEC-189` still drops the
    case's original deadline** that `DEC-189`'s own preserve/timeout logic requires.
22. **[P1, pre-existing, re-confirmed unchanged] `DOC-212 h.issue → DOC-213` (and the parallel
    `DOC-217` case) still doesn't carry "authority to issue,"** which both targets' own trigger
    evidence separately requires.
23. **[P2] `kind: "handoff"` nodes have no `terminal`/closure-semantics field** the way `kind:
    "exit"` nodes do — a corpus-wide schema-level gap recorded once (matching the precedent the
    Operational Workflow round set for the `entity.instanceKey` gap) rather than as 522 individual
    findings.
24. **[P2] `commerce-recovery`'s second/final touch gates (`c.sendable2`, `c.final-enabled`) drop
    the explicit "no higher-precedence contest" language present at the first touch**, relying on an
    unstated reuse of "the send path" — plausible by corpus convention, not confirmed.
25. **[P2] Clock-ownership choice at SLA-escalation handoffs (preserve original deadline vs. start a
    new escalation-specific clock) is correct in every traced instance but never stated as a
    corpus-wide rule**, unlike the staleness-check rule `OPS-R17` states for version continuity.

Full findings registers, including the remaining P2s and ~25 positive/reference-pattern citations,
are in the 10 companion documents (`EDGE-COMPATIBILITY-MATRIX.md`, `IDENTITY-AND-PROVENANCE-
AUDIT.md`, `OWNERSHIP-AND-COMPETITION-INTEGRATION.md`, `RESULT-AND-FEEDBACK-INTEGRATION.md`,
`CYCLE-AND-DEAD-END-AUDIT.md`, `EVENT-AND-AUTHORITY-INTEGRATION.md`, `IDEMPOTENCY-AND-RETRY-
INTEGRATION.md`, `TIME-AND-VERSION-INTEGRATION.md`, `ORPHAN-AND-COVERAGE-AUDIT.md`,
`BOUNDARY-CLASSIFICATION-REVIEW.md`) and `INTEGRATION-TEST-MATRIX.md`.

## Global invariants

10 candidate invariants were validated against this round's actual findings (not assumed); all 10
survived as genuinely load-bearing, none rejected or revised. Three (Invariants 1, 4, 10 — single
active winner, technical-completion-implies-authority, stale-loser-cannot-execute) are where actual
enforcement materially lags the stated principle, and all three point at the same underlying gap
from different angles: detection/arbitration machinery is sound, propagation to and adoption by
callers is where defects concentrate. Full detail, per-invariant enforcement status, and validator
opportunities: `SYSTEM-INVARIANTS.md`.

## Architecture assessment

The four-layer separation (Customer Journeys / Silent Lifecycle States / Runtime Mechanisms /
Operational Workflows) holds up structurally at cross-library scale: the surface matrix's two
structurally-absent combinations (Silent→Runtime, Runtime→Customer) are consistent with each
layer's documented role rather than accidental gaps, and the boundary-classification review found
no case strong enough to warrant reclassifying any of the 7 previously-flagged candidates this
round (though `IDN-86`/`ACC-75`'s confidence strengthened and `ACC-76`'s weakened further — see
`BOUNDARY-CLASSIFICATION-REVIEW.md`).

The corpus's shared hubs (`DEC-181`, `OWN-55`, the `DEC-182`→`183`→`189`→`190` chain, `OPS-131`,
`OPS-130`) are, with the two exceptions above, well-designed convergence points: `DEC-181`'s own
prior-round repair (supporting ~30 senders across all four layers with one reusable structural
distinction rather than per-sender branches) is confirmed this round to be the *only* instance of
its own defect shape in the entire graph — every other hub already uses general-enough trigger
evidence. `OWN-55` (39 inbound edges, an "honorary hub" this round discovered while checking the
named ones) resolves sender-side ownership ambiguity on its own receiving side via a dedicated
branch, a genuinely reference-quality pattern.

The corpus's weakest point is not a design defect but an adoption gap: `OPS-131` and `OPS-130` are
both well-built, general-purpose primitives that most of their potential callers do not fully use.
This is architecturally the easiest class of defect to fix — the mechanism does not need to change,
the callers need to call it — but it is also the class of defect most likely to be invisible to a
per-layer audit, since each caller in isolation looks locally reasonable (its own eligibility rules
are correct; it simply never checks its sibling's state). This is precisely the kind of defect this
round's relationship-first methodology was designed to surface, and did.

## Integration readiness conclusion

**Not yet ready for a "the 284 pieces work correctly together" claim, but close, and the gap is
narrow and specific rather than diffuse.** Zero dangling handoffs, zero unbounded cycles, zero
recurrence of the DEC-181-shaped entry-contract defect, and a well-built arbitration/completion
architecture are strong positive findings — this is not a corpus with systemic cross-layer
confusion. The 3 confirmed P0s are all real, all fixable at a scope comparable to this program's
prior single-P0 repairs (competition-group caller-side checks and one Runtime Mechanism
consumer-wiring fix), not a redesign. The governing brief's own next step — a dedicated
integration-repair round closing these 3 P0s and the highest-value P1s (items 4–14 above, roughly)
— would plausibly bring this corpus to the "v1 production-ready baseline" the program has been
building toward across all five rounds.

## Final validation status

| Check | Result |
|---|---|
| `npm run validate:canonical` | 0 errors, 0 unreviewed vNext warnings, 284 journeys / 3682 nodes / operational 124 (unchanged — no canonical source touched this round) |
| `npm run validate:journey-production` | PASS (30/30, unchanged) |
| `npx tsc --noEmit` | clean |
| `git diff` scope | `research/cross-library-integration-readiness/` only — confirmed, see below |

Relationship graph generated (548 edges); all explicit cross-item edges accounted for (0 dangling);
all 16 SCCs reviewed (0 unsafe); all 7 competition groups reviewed (2 confirmed unprotected at
P0 severity); all four surfaces represented in the edge inventory and the surface matrix.
