# Journey Filter Taxonomy Audit

Audits the 255-journey canonical library (`src/canonical/`) for a
3-filter architecture: Lifecycle Stage, Goal/Use Case, Category/Domain.
`src/canonical/` was read-only throughout - never modified. No UI was
built. Journey Type (Communication/Orchestration/Handoff-System) was
investigated in a prior turn and rejected on evidence (see below) before
this audit began; this file picks up from that rejection.

## Why Journey Type was dropped (context, not re-litigated here)

The 255-journey library is, by its own design (`types.ts`: *"there is no
message copy in here... what a person is told is a downstream concern
of whatever renders these"*), a channel- and content-agnostic
orchestration/state-machine layer. Grepping the full corpus found 0
mentions of SMS, push, WhatsApp, IVR, call center or popup, and only 8
of email. Even the 9-journey `communication` category is itself about
deciding *whether/how/where* to communicate (obligation → recipient →
permission → channel → send → delivery outcome), never the message
itself. A "Communication" journey type as originally specified has no
real population in this corpus - confirmed, not assumed, and the user
accepted this finding and redirected scope to this audit.

## Methodology

Executed `src/canonical/` directly (Node's native TypeScript execution
- no build step, no ts-node/tsx dependency) rather than reading 46,936
lines by hand. `production/generate-journey-filter-taxonomy.mjs` makes a
throwaway temp copy with import extensions patched (the only reason a
copy is needed at all - the real files use bundler-style extensionless
imports Node's raw loader can't resolve), executes it, and deletes the
copy. `src/canonical/` is never written to.

## Filter 1: Category / Domain

**Finding: the existing `category` field is already the right filter,
unchanged.** 26 values, 8-10 journeys each - the most evenly distributed
of the three by a wide margin. Each category's `purpose` text describes
a genuinely distinct problem domain (identity vs. access vs. ownership
vs. financial vs. fulfillment vs. risk, etc.) with no observed overlap
in the journeys sampled. This was not invented - it is literally what
`CATEGORIES` already contains.

**Verdict: KEEP, no changes.**

## Filter 2: Lifecycle Stage

**Finding: does not exist as a field, and does not hold as a universal
dimension.** Only 4 of 26 categories (`acquisition`, `activation`,
`retention`, `terminal`) are inherently anchored to a point in a
customer relationship. The other 22 explicitly describe themselves as
**domain-neutral** in their own purpose text (the literal phrase
"Domain-neutral state machines for..." appears in 13 of them) - a
payment-recovery state machine, a document-signature state machine, or
a scheduling-conflict state machine runs identically whether the
customer is new, established, or leaving.

Derived stage values, category-anchored where real, `cross-lifecycle`
everywhere else:

| Stage | Count | Basis |
|---|---|---|
| `acquisition-qualification` | 10 | = `acquisition` category |
| `activation-onboarding` | 10 | = `activation` category |
| `engagement-retention` | 9 | = `retention` category |
| `ending-closure` | 10 | = `terminal` category |
| `cross-lifecycle` | **216 (85%)** | everything else |

This is a real, evidenced filter - not a cop-out value. But it is
**lopsided by design**: it meaningfully differentiates only 39/255
journeys (15%). No multi-stage journey needed a
`lifecycleStageReviewRequired` flag - the category-anchoring is
unambiguous in both directions (a journey is either in one of the 4
anchored categories or it isn't).

**Verdict: KEEP as a real filter, but flag its limited discriminating
power explicitly in the UI** (e.g. it should not be the first filter a
user reaches for, since selecting anything other than the 4 anchored
stages does nothing).

## Filter 3: Goal / Use Case

**Finding: no existing field; genuinely derivable from cross-category
patterns.** Word-frequency analysis across all 255 journey names +
purposes (not pre-imagined marketing goals like "onboarding"/"upsell")
surfaced 20 recurring functional patterns that repeat across 3+
categories each - evidence the taxonomy describes real cross-cutting
mechanisms, not category in disguise.

| Goal | Count | Categories | Goal | Count | Categories |
|---|---|---|---|---|---|
| cancellation-termination | 28 | 16 | delivery-confirmation | 10 | 7 |
| recovery-retry | 27 | 13 | progression-milestone | 10 | 6 |
| identity-verification | 24 | 11 | change-versioning | 8 | 6 |
| eligibility-qualification | 20 | 12 | merge-consolidation | 7 | 3 |
| ownership-transfer | 17 | 8 | suspension-restoration | 6 | 6 |
| expiry-renewal | 16 | 10 | revocation-access-change | 6 | 4 |
| reconciliation-correction | 15 | 8 | risk-compliance | 5 | 5 |
| decision-approval | 9 | 5 | data-integrity | 5 | 2 |
| escalation-exception | 8 | 7 | scheduling-commitment | 5 | 2 |
| consent-permission | 8 | 3 | compensation-remedy | 3 | 2 |

**18/255 (7%) flagged `review-required`** rather than force-fit - real
examples: `CMS-201..205` (communication-obligation orchestration, too
narrow at 4-5 journeys to justify its own bucket and not a clean fit for
any of the 20), `RET-21/22` (engagement re-classification), `REL-92/95`
(relationship/ownership recalculation), `INC-253` (incident
containment). These are genuinely ambiguous, not a ruleset gap covered
up.

One explicit normalization decision: `FIN-131` ("Financial obligation
created → due → satisfied or outstanding") was the only journey
matching finance-specific vocabulary and nothing else - rather than
create a 1-journey `financial-transaction` bucket, it folds into
`reconciliation-correction`, which is what the journey is actually
doing (tracking an obligation to a resolved state). This is the kind of
consolidation instruction 6 asks for: real financial *journeys* are
covered by their actual functional pattern (mostly recovery/reconciliation),
not by a domain label that would just restate `category=financial`.

**Cardinality check**: 20 values (19 substantive + review-required) is
well under the 40-50 threshold that would make this unusable, and no
value repeats what Category or Lifecycle Stage already say (verified:
none of the 20 goal ids match a category id or a stage id).

**Verdict: KEEP, cardinality is healthy.** `compensation-remedy` (3
journeys, 2 categories) is the thinnest value - kept distinct rather
than merged because appeal/dispute-remedy is a genuinely different
question from generic correction (a remedy resolves an obligation to
someone; a reconciliation resolves a data mismatch), not because 3 is a
target count.

## Handoff-as-primitive hypothesis: CONFIRMED

Tested directly against the graph structure, not asserted:

- **500 handoff nodes across 239/255 journeys (94%)**, spread evenly
  across all 26 categories (17/26 categories have handoff in ≥90% of
  their journeys; none has 0%).
- **209/239 handoff-using journeys (87%) also have `exit` nodes** -
  handoff is one branch outcome alongside exit, the normal shape of a
  condition's two arms, not a journey's defining feature.
- Only **30/255 (12%)** are "handoff-only" (no exit node at all), and
  those are spread thin across categories too, not concentrated in a
  detectable "handoff journey" cluster.

This is the signature of a **reusable graph-grammar primitive** (the
same conclusion `trigger`/`condition`/`exit` would produce if tested the
same way), not a journey type. The hypothesis is confirmed: Handoff
correctly stays out of the filter taxonomy as a node kind, not a
filterable dimension.

## Combination reality (§8-10 of the brief)

**147 real Category × Stage × Goal combinations exist**, against a
2,600-cell theoretical Cartesian product (26 × 5 × 20) - only ~5.7% of
the grid has any journeys in it. This confirms the brief's own
expectation: **filter options must be built from the actual result set,
never the full Cartesian product.** A static "all combinations" UI would
be 94% empty cells.

Real examples (not invented):
```
acquisition | acquisition-qualification | eligibility-qualification → ACQ-01, ACQ-02, ACQ-04
acquisition | acquisition-qualification | ownership-transfer        → ACQ-03, ACQ-08
activation  | activation-onboarding     | progression-milestone     → ACT-11, ACT-12, ACT-16
activation  | activation-onboarding     | recovery-retry            → ACT-13, ACT-14, ACT-18
retention   | engagement-retention      | recovery-retry            → RET-23, RET-27
```

## Ambiguous records

18 journeys flagged `goalReviewRequired: true` (7% of corpus) - see
`journey-filter-classification.json` for the full, exact list with ids.
0 journeys flagged `lifecycleStageReviewRequired` - the 4-category
anchoring rule is unambiguous by construction (a journey's category
either is or isn't one of the 4 stage-anchored ones).

## Data integrity

`src/canonical/` has zero git diff after this audit (verified via `git
status --short src/canonical/` returning empty). Journey count
unchanged at 255 throughout every stage of the analysis. No canonical
id, slug, node, or graph was read into a mutable copy at any point -
the generator script only ever reads and aggregates.

## Filter recommendation

**Two of the three requested filters are strong (Category/Domain, Goal/
Use Case); the third (Lifecycle Stage) is real but should be positioned
as secondary, not equal.** Recommended default filter order for a future
UI phase (not built this turn): **Category/Domain first** (26 balanced
values, the strongest single differentiator), **Goal/Use Case second**
(20 values, genuinely cross-cutting), **Lifecycle Stage third or as a
toggle** (only useful for the 15% of the corpus it actually
discriminates - a user filtering by stage on a `financial`/`access`/
`document` journey would get zero signal from it, since those are all
`cross-lifecycle`).
