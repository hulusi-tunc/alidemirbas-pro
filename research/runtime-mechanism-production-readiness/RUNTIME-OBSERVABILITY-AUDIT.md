# Runtime Mechanisms — observability audit

A production operator needs stronger technical observability from a runtime mechanism than from a
customer lifecycle state, because nobody is asking "why is this customer in this state" — they are
asking "why did the engine do what it did, and can I trust its next retry." This document checks
the 13 questions `RUNTIME-MECHANISMS-AUDIT.md`'s Part 20 names against each mechanism's own data
model and reports what is answerable today versus what a company's own mapping must still supply.

## POST-REPAIR UPDATE (round 2 — competition arbitration observability)

**Question 13 ("who owns it now") gains its first cross-journey answer.** Every mechanism in this
document's original table answers ownership only within its own single graph — `OPS-131`'s own
contract (`conflictArbitration.contract.observabilityFields` in `runtime-mechanism-contracts.json`)
is the corpus's first observability model that spans multiple, independently-eligible journeys: it
names `exclusion_group`, `scope_instance_id`, `contenders_considered`, `precedence_rule_applied`,
`winner`, `losers_and_onLoss_applied`, `escalated_to_DEC-181`, and `re-evaluation_trigger` as the
minimum a production operator needs to explain a contested decision after the fact — which
contenders existed, which rule decided, who won, why each loser lost, whether it escalated. This is
new content this document's original 13 questions did not anticipate (they were scoped to one
mechanism's own single-journey lifecycle), not a revision of an existing answer.

## POST-REPAIR UPDATE (round 1)

**Question 7 ("what idempotency/attempt key was used"), this document's weakest answer, is now
substantially strengthened.** All 24 mechanisms declare `entity.instanceKey`, and every writing
action declares `idempotencyKey` — an operator's log can now name the actual field a company's
schema should persist per mechanism, rather than only the concept. `CMS-208`'s and `OPS-124`'s
attempt budgets (question 10, "was it retried") are now declared `attemptBudget` `Config`s rather
than asserted-only prose, so "how much budget remains" is at least declarable per mechanism, though
still not a structurally required per-log-entry field — recommendation 4 below is not fully closed,
only unblocked. Question 4 (origin/version) is improved for `CON-35`/`CON-40` specifically, whose
`change_origin`/`change_version` fields are now declared rather than prose-only — recommendation 3
below is closed for those two mechanisms.

Recommendations 1 and 3 (below) are effectively implemented via the repair round's `idempotencyKey`
additions. Recommendations 2 and 4 (structured `supersededBy`/`retriedFrom` pointers; a per-attempt
budget-remaining field distinct from the budget's own existence) remain open — this round scoped
its schema changes to what the repair brief's own Parts 2–9 required, not to every observability
recommendation this document made; they were judged non-blocking enhancements, not production-
safety gaps. **The rest of this document is the original audit-round text, kept for reference.**

## The 13 questions, answered corpus-wide (audit-round record)

1. **What mechanism ran?** Answerable everywhere — every mechanism writes to its own named log
   field (`work_log`, `delivery_log`, `communication_log`, `dead_letter_log`, `backlog_log`,
   `composite_work_log`, `queue_health_log`, `dedup_log`, `permission_log`, `permission_conflict_log`,
   `contactability_log`, `suppression_log`, `cooldown_log`, `cadence_state`/`cadence_policy_applied`),
   and the log field's own name identifies the mechanism to a reader familiar with the domain.
2. **For which journey instance?** Answerable in substance (`entity.scope` names the subject every
   mechanism operates against), but not in a structurally uniform way — none of the 24 declares an
   `instanceKey`, so "which instance" is answered by whatever fields a company's mapping chooses to
   persist, not by a field this audit can point to.
3. **Why?** Strong. Every condition node's own `asks` text is the "why" a company's log should
   capture at decision time (`c.class` asks "what does the failure class call for," `c.recoverable`
   asks "can this be recovered safely under its execution semantics") — these read directly as the
   audit trail's own decision-basis field.
4. **Using which input/version?** Weak, corpus-wide. This is where the missing `origin`/`version`
   fields (`CON-35`, `CON-40`) and the missing `implementation.attributes` declaration (all 24)
   converge into the same gap: nothing states which version of an input a decision was made
   against, only that a version-aware decision was made.
5. **What decision did it make?** Strong — every condition's own branches are named outcomes
   (`RECIPIENT_UNRESOLVED`, `CONTACT_ROUTE_UNAVAILABLE`, `DELIVERY_FAILED`, `STALLED`, `PARTIALLY_
   COMPLETED`, ...), which is exactly the vocabulary a structured log should use verbatim.
6. **What side effect was attempted?** Strong for provider-crossing mechanisms (`CMS-206`
   explicitly persists "the provider and its reference"), present but generic elsewhere (an append
   to a named log field, without always naming what specifically was attempted inside it).
7. **What idempotency/attempt key was used?** The round's weakest answer. Named in prose on 8
   mechanisms (see `SIDE-EFFECT-AND-IDEMPOTENCY-AUDIT.md`), never declared as a field anywhere.
   A company implementing this corpus today has no schema-level guidance on what to log here.
8. **What dependency responded?** Strong where a provider/worker boundary exists — `CMS-206`/
   `CMS-207` persist the provider's own reported reason "exactly as the channel reported it,
   unclassified," specifically so downstream classification is not lossy.
9. **What was the normalized result?** Strong — see question 5; the corpus is unusually careful
   about naming normalized states rather than leaving them as raw provider/job output.
10. **Was it retried?** Answerable for the mechanisms with an explicit retry loop (`CMS-208`,
    `OPS-124`'s own `work_log` entries per attempt), not centrally queryable across mechanisms
    since attempt counting is not a declared, shared field.
11. **Was it suppressed?** Strong — `suppressed_sends` is a shared, consistently-used append log
    across `CMS-205`, `CMS-208`, `CON-34`, `CON-35`, `CON-40`, the one genuinely cross-mechanism
    shared observability field found in the round.
12. **Was it superseded?** Present as a named outcome (`CMS-210`'s `x.superseded`, `CMS-205`'s
    `a.suppress` for staleness) but, per `RUNTIME-MECHANISMS-AUDIT.md`'s finding, never a
    structured pointer to *what* superseded it — free text inside the log entry only, the same
    gap the silent-state round's own `OBSERVABILITY-AUDIT.md` named for that layer.
13. **Who owns it now?** Strong for explicit ownership-transfer mechanisms (`OPS-123`'s worker/
    lease ownership, `OPS-128`'s lease-based transfer, every mechanism's own `handoffs` naming the
    next owner), silent for mechanisms with no ownership concept at all (most of the CON-3x
    domain, appropriately — they do not transfer ownership of anything).

## Mechanism-by-mechanism gaps

Only mechanisms with a genuine observability shortfall beyond the corpus-wide pattern above are
listed; the rest are adequately covered by their own append-only log field for what they actually
need to explain.

- **CMS-201, CMS-204, CMS-206** (and by extension every mechanism in `SIDE-EFFECT-AND-
  IDEMPOTENCY-AUDIT.md`'s table): no declared attempt-identity field to log against — the
  observability question here is not "is there a log," it is "does the log have a field to
  correlate on," and the answer is no.
- **CMS-208**: budget state ("fixed at the first failure and does not renew") is asserted but not
  shown as a field a log entry would carry per attempt — an operator reading `delivery_log` cannot
  tell how much budget remains without recomputing it from the full attempt history.
- **OPS-125**: `a.compare`'s own comparison inputs ("the idempotency key, the business operation
  identity, the target entity, the relevant version") are exactly what an observability log should
  record per deduplication decision, and the mechanism's own text names them precisely — but,
  again, none is a declared field.
- **CON-35 / CON-40**: origin/version, load-bearing for the entire correctness argument in both
  mechanisms, absent as loggable fields.

## What already works well and should not be redesigned

- **The append-only, per-attempt log-field convention** is consistent across all 24 and matches
  the corpus-wide correction discipline both earlier rounds established for the customer-facing
  layers (`mode: "append"`, never overwritten). No mechanism was found silently overwriting its own
  history.
- **`suppressed_sends` as a genuinely shared field** across five mechanisms in three different
  domains (CMS, CON) is the single best example of cross-mechanism observability consistency in
  the round — a company's dashboard built against this one field already answers "was this
  suppressed and by which mechanism" for the majority of the suppression-capable mechanisms without
  per-mechanism special-casing.

## Recommended minimum runtime observability contract

Derived from what this audit found actually missing, not from the brief's checklist verbatim:

1. **A named attempt/idempotency-key field, declared per mechanism**, populated before the side
   effect it guards, for every mechanism this round found naming the concept in prose (8 of 24) —
   the single highest-leverage fix, since it closes the idempotency gap and the observability gap
   in the same field.
2. **A structured `supersededBy`/`retriedFrom` pointer**, not free text, wherever a mechanism's own
   vocabulary already distinguishes "superseded" or "retried" as a named outcome (`CMS-210`,
   `CMS-208`, `OPS-124`, `OPS-127`) — the same recommendation the silent-state round made for its
   own layer, restated here because the underlying gap is identical.
3. **A declared `origin`/`version` field wherever a mechanism's own correctness argument depends on
   comparing them** (`CON-35`, `CON-40`, and by extension anything with an ordering requirement per
   `CONCURRENCY-AND-ORDERING-AUDIT.md`).
4. **A per-attempt budget-remaining field** wherever a mechanism's own retry loop claims a fixed,
   non-renewing budget (`CMS-208`, `OPS-124`) — today only reconstructable by replaying the full
   attempt history, which is adequate for audit but not for a fast operational query.

None of these four requires a canonical graph change — each is a declared-attribute or a
handoff-contract addition, the same shape of fix both earlier rounds already applied at scale to
the customer-facing corpus.
