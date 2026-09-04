# Runtime Mechanism Validator Coverage

Documents the validator changes made in this repair round: one existing validator's severity
widened, two new validators added — all in `scripts/vnext-rules.mjs`, all scoped to
`isMechanism = surf.surface === "mechanism"` (checked directly against `MECHANISM_IDS`, the same
way the corpus's customer-facing validators check `isCustomer`/`silentInScope` — not inferred from
`vnext`, since none of the 24 declare `measurement`). Selected from `VALIDATOR-OPPORTUNITIES.md`'s
8 candidates per Part 25's explicit instruction not to implement all eight — see that document's
post-repair update for why the other five were left as regression-guard proposals rather than built.

| Validator | Severity | Mechanism scope | Defect class | Example fixture | False-positive considerations | Production command |
|---|---|---|---|---|---|---|
| `state_write_without_idempotency` (widened) | **error** on mechanisms (was warn everywhere) | All 24, via `isMechanism` | A writing action (`writes` includes a `mode: "append"` entry) declares no `idempotencyKey` — a retried trigger can duplicate the write | Any of the ~90 writing actions across the 24 before this round's repair (e.g. `CMS-201`'s pre-repair `a.create`, `OPS-121`'s pre-repair `a.persist`) | Widened only after confirming, via repeated `SHOW_WARNINGS=1` sweeps, that zero instances remained across all 24 post-repair — widening before the repair was complete would have produced ~90 immediate errors on journeys this round was actively fixing. Read-only/`decides-only` actions are correctly exempt (the rule only fires on `mode: "append"` writes) | `npm run validate:canonical` (0 errors confirms no mechanism regresses) |
| `attempt_identity_unprovenanced` (new) | warn | 24, via `isMechanism` | A writing action's `idempotencyKey` references an attempt-shaped identity (a component token matching `/\b(attempt\|lease\|replay)\b/i`) but `entity.note` documents no provenance (no match on `/\b(before\|mint\|caller\|self-minted\|correlat\|durable\|fresh)/i`) | Deliberately regex-based rather than requiring a new structured field, per Part 7's "choose severity by false-positive risk" — kept at warn rather than error because provenance-in-prose is a real but weaker signal than a declared field | An initial regex bug (`/\battempt\|lease\|replay\b/i`, unparenthesized alternation) let `CON-40`'s `a.release` action false-match "lease" as a substring, since alternation without grouping only anchors `\b` to the first/last branches. Fixed to `/\b(attempt\|lease\|replay)\b/i` and reverified: 1 false-positive finding → 0 findings once the regex was corrected and every genuinely attempt-shaped key was confirmed to have real provenance documented | `SHOW_WARNINGS=1 node scripts/validate-canonical.mjs \| grep attempt_identity_unprovenanced` (0 lines confirms no mechanism regresses) |
| `freshness_before_execution` (new) | warn | 24, via `isMechanism` | A `wait` node's `onTimeout` leads directly into a mutating action or a handoff (ownership transfer), with no `recheck` field on the wait and no revalidation-shaped node/action (matched by name or `does` text against `/revalidat\|re-read\|reread\|recheck\|reevaluat/i`) within two hops of the timeout target | The 7 confirmed findings: `CON-35`'s `w.converge`→`h.conflict`, `CON-40`'s `w.reconcile`→`h.manual`, `OPS-121`'s `w.start`→`h.lag` and `w.execution`→`h.stalled`, `OPS-122`'s `w.recovery`→`h.escalate`, `OPS-127`'s `w.review`→`h.escalate`, `CMS-206`'s `w.acceptance`→`a.unknown` | Deliberately does **not** reuse the silent-lifecycle-state round's Validator E unmodified — that validator checks for a literal `recheck` field, which is that domain's own convention; the 24 mechanisms express revalidation as dedicated pipeline stages/actions instead (`CMS-205`, `OPS-124`'s `a.revalidate`, `OPS-129`'s `c.relevant`), so a literal-field reuse would have false-positived on all 24. This validator additionally accepts a nearby revalidation-shaped node as satisfying the rule. All 7 current findings are judged legitimate and low-risk (escalation-shaped handoffs, a lower-risk target than a direct mutating action) and are left open for human review rather than mechanically resolved, per Part 18's caution against a noisy freshness validator | `SHOW_WARNINGS=1 node scripts/validate-canonical.mjs \| grep freshness_before_execution` (7 lines is the current, reviewed baseline — a new line beyond these 7 is a real regression to investigate) |

## Candidates from `VALIDATOR-OPPORTUNITIES.md` not implemented this round

Per Part 26's severity guidance (ERROR for mechanically provable production-unsafety; WARNING for
architecture judgment) and Part 25's "implement only high-confidence rules" instruction:

- **Unknown-outcome safety, retry-classification completeness, provider-state normalization,
  runtime ownership uniqueness, output completeness** (candidates 2, 3, 5, 6, 7): all five are
  regression guards for behavior the audit already found correct in all 24 mechanisms (0 violations
  each). Building five validators with zero current findings adds maintenance surface — a schema
  change to any of these mechanisms in the future would need all five kept in sync — without closing
  a gap this round confirmed exists. Left as documented proposals in `VALIDATOR-OPPORTUNITIES.md`
  for a future round to build if and when the corpus grows in ways that make regression a live risk.

## Verification performed

- Regex correctness for `attempt_identity_unprovenanced`: before/after `SHOW_WARNINGS=1` diff
  (1 false-positive finding → 0 findings after the grouping-parens fix).
- `freshness_before_execution`: confirmed the 7 findings are stable across repeated runs (no
  nondeterminism from the two-hop `successors()` traversal) and manually read each of the 7 to
  confirm none is a mechanical false positive (all 7 are genuinely bare escalation handoffs with no
  recheck field and no nearby revalidation node).
- `state_write_without_idempotency` widening: `npm run validate:canonical` shows `0 errors` on
  current source — confirms no mechanism-scoped writing action lacks a declared `idempotencyKey`
  after the repair pass, and that the widening itself introduced no new error anywhere else in the
  283-journey corpus (the widening's `isMechanism` condition cannot fire outside the 24 by
  construction).
- Full-corpus regression: `npm run validate:canonical` reports `0 errors`, `1809 warnings (0
  unreviewed on vNext journeys)`, `283 canonical journeys · 3664 nodes · ... · mechanism 24`,
  confirming the two new validators and the widened one introduced no error anywhere in the corpus
  and that the corpus-wide counts (journeys, nodes, mechanisms) are unchanged by this round.
