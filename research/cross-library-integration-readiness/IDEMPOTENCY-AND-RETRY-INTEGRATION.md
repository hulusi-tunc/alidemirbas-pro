# Cross-Library Integration Audit — Idempotency and Retry

Scope: all 284 canonical items in `src/canonical/*.ts` (via `production/canonical-dump.json`,
the direct structured export of that source) and all 548 edges in
`relationship-graph.json`. Governing brief Parts 11, 29, 30, 34. AUDIT ONLY — nothing under
`src/`, `production/`, `scripts/`, `seo/`, `search/` was changed.

Method: (1) a corpus-wide field census of every `ActionNode.attemptBudget` declaration (19
total) and every `retry`/`backoff`/`budget` mention in node prose (292 raw hits, narrowed by
reading the journeys that actually declare a budget or sit on a retry-shaped handoff edge);
(2) for every edge in `relationship-graph.json` whose target is a known retry-capable receiver
(`CMS-208`, `OPS-121/124/125/126/127/131`, and every Operational Workflow with its own
`attemptBudget`), the full source of both the caller and the receiver was read directly, not
inferred from the edge summary; (3) a structural heuristic scan of all 522 handoff edges
comparing each target journey's `entity.instanceKey` fields against the edge's `carries`/
`contractRequiredFields`, used only to *select* candidates for full reads, never as a citation
on its own.

## Part 29 — double-retry-budget search (corpus-wide)

The CMS-208/OPS-124 shape (a caller retries a handoff/action AND the receiver independently
retries the same logical effect, producing two budgets for one operation) was used as the
template. Every one of the 19 `attemptBudget`-declaring actions was traced to what it hands off
to on exhaustion, and every handoff edge into a retry-capable receiver was traced back to
whether the sender does its own retrying of the same effect first.

**Result: no new instance of the double-retry-budget pattern was found anywhere in the current
284-journey corpus.** Every budget-bearing journey traced falls into one of two safe shapes:

1. **Budget exhaustion hands off to a genuinely different operation**, not a re-retry of the same
   effect — `TIM-61`'s `remind_budget` (pre-deadline reminder cadence) hands off, once, to
   `OWN-55` only *after* `c.consequence` records the deadline as already passed; `OWN-55` then
   runs its own escalation-ladder walk (`a.next-level`/`w.resolution`), which is a different
   business action (escalating authority) than sending another reminder. `IDN-84`'s
   `c.retry-budget`/`c.technical-budget` both keep their retries local ("the retry runs as part
   of the same verification instance, against the same budget — a new instance would reset the
   count") and only hand off to `DEC-181`/`OWN-55` for human judgment once budget is spent, never
   for another automated retry of the same check. `DEC-184`'s `request_budget`/
   `request_internal_budget` round-trips stay inside `DEC-184` (`c.further` re-enters
   `c.source-type`, not a downstream mechanism); its only cross-journey exit on budget exhaustion
   is `h.resume` back to `DEC-183` (a decision resuming, not a request retrying) or `h.escalate`
   to `DEC-189` (bounded authority-level walking, a different operation).
2. **The budget is explicitly carried across the handoff, not reset** — `FUL-148`'s `h.retry`
   handoff back to `FUL-147` (which performs the actual re-dispatch) carries *"the attempt
   history and the remaining budget, which does not reset"* in prose; `FIN-134`'s `a.retry`
   (Operational Workflow, payment recovery) explicitly reuses *"the failed attempt's own
   idempotency key — the same key, so a first attempt that did land is absorbed rather than
   repeated"* rather than minting a new budget when it takes over from `ACQ-11` (Customer
   Journey), whose own `h.payment` handoff to `FIN-134` explicitly suppresses *"every queued
   recovery touch for this process"* first — the two journeys' budgets are sequential and
   mutually exclusive by construction, never simultaneous.

**P2 — `FUL-147`/`FUL-148`'s shared retry budget is carried by prose only, not a structural
field.** `FUL-148`'s `c.budget` condition ("Is a reattempt available within the bounded
policy?") is the actual budget check, but neither `FUL-147` nor `FUL-148` declares an
`ActionNode.attemptBudget`. This is the exact pre-fix shape `CMS-208`/`OPS-124` had before their
`attemptBudget` field was added — currently safe (only `FUL-148` ever evaluates the budget;
`FUL-147` only dispatches), but a future change that lets `FUL-147` independently decide to
re-dispatch (e.g. a delivery-executor-initiated retry) would reintroduce the exact double-budget
risk this Part exists to catch, with no structural field to catch it. Recommend declaring
`attemptBudget` on `FUL-148`'s reattempt path in a future repair round.

**P2 — `DOC-215`'s `a.record-sig` `attemptBudget` (`signature.required_signers`) models a fixed
signer roster, not a retry count.** Every other `attemptBudget` in the corpus answers "how many
times may this retry"; this one answers "how many signers are on the list," a different
question wearing the same field. Not a runtime risk (the loop is genuinely bounded by a list,
not by a retry ceiling), but a vocabulary inconsistency worth normalizing.

## Part 30 — attempt-identity confusion (representative chains, real source read)

Three representative external-effect chains were read end-to-end, chosen from
`relationship-graph.json`'s Operational→mechanism and Customer→mechanism edges:

- **`CMS-204→CMS-205→CMS-206→CMS-207→CMS-208`** (message prepare → send-eligibility recheck →
  submit → delivery-outcome → recovery). `CMS-205`'s `a.send` "mints `attempt_id` for the
  submission this hands off to... a redelivered `t.ready` reuses the `attempt_id` already minted
  rather than minting a second one." `CMS-206`'s own `entity.note` states the distinction
  explicitly: *"`attempt_id` is caller-supplied — minted by `CMS-205`'s `a.send`... specifically
  so a redelivered `t.submitted` for the same `attempt_id` can be told apart from a genuinely new
  attempt for the same `message_id` (a retry, minting its own fresh `attempt_id` upstream)."*
  `CMS-206`'s `h.recover` handoff to `CMS-208` carries *"`message_id` and `destination_id`, both
  established at `a.persist`, which is what `CMS-208`'s own recovery instance is keyed on"* —
  the business/recovery identity (`message_id`+`destination_id`) and the physical-attempt
  identity (`attempt_id`) are named and kept separate at every step. No confusion found.
- **`FIN-132→FIN-135→OPS-125`** (payment attempt → unknown-outcome reconciliation → generic
  dedup). `FIN-135`'s `h.dedupe` handoff to `OPS-125` carries *"`logical_operation_key` — this
  payment's own stable attempt identifier, the same value on both the first and second attempt —
  which is what `OPS-125` compares against, **not** either attempt's own payment-provider
  reference."* `OPS-125`'s own `entity.note` independently states the same rule from the
  receiving end: *"Identity is the business operation, not the payload... the same field
  `OPS-121`/`OPS-124` carry — deduplication here compares against it directly rather than
  against a second, independently-invented identity."* Sender and receiver agree on which field
  is authoritative for dedup, in both directions. No confusion found; this is a reference-quality
  example of Part 30's exact question being answered explicitly in the source.
- **`OPS-121`** (generic asynchronous work) on its own: `entity.note` names three separate ids
  and what each is for — `logical_operation_key` (caller-supplied business identity, dedups
  acceptance), `work_id` (this mechanism's own record identity, "the same way `CMS-206`'s
  `attempt_id` is distinct from `message_id`"), and `correlation_id` ("a separate concern from
  either — it exists purely to trace one logical operation... not to gate any write"). No
  confusion found.

No instance was found anywhere in the traced chains of an `idempotencyKey`/attempt id being
compared as if it were the business/instance id, or of a logical key resetting on a handoff when
the source says it should carry forward, or of a retry unintentionally minting a new logical
operation instead of reusing the existing one.

**P1 — `DEC-181`'s ~30-sender fan-in relies on a business-level condition, not its own
structural instance key, and that reliance is nowhere stated.** `DEC-181`'s `request_id` is
minted fresh by its own `a.capture` on *every* entry (documented and reviewed as
"self-minted-by-receiver" — see `production/vnext-warning-reviews.json`, referenced in
`FIXES-APPLIED.md` item 1). That means `entity.concurrency: "one-active-per-key"` on
`instanceKey: ["request_id"]` can never by itself catch a retried handoff from any of `DEC-181`'s
~30 senders (`FBK-47`, `IDN-81/83/84/88`, `OWN-55/58/60`, `RSK-191..200`, `OPS-126/127/131`,
`REL-95/96/97/99/100`, `DOC-212/216/217/218/220`, `DAT-222/223/226/228/229`, `CTL-231/238`,
`INC-255/260`, `SUB-163/165/166/169`, and more) — a second, independent `request_id` would be
minted every time, and the structural instance key would never see a collision. The *actual*
duplicate-suppression mechanism is `c.duplicate`'s business-level check ("Does an open decision
case already cover this scope?" — same target + same decision scope → `a.link`/`x.linked`,
*"no second decision was opened"*), which is correct in shape but is prose, not a declared field,
and is untested here against the symmetric false-positive risk: two senders opening a
legitimately distinct decision request over the same target and the same decision-scope
description would also link, silently discarding the second request. This was not observed to
happen in any of the ~30 sender journeys read (each names a distinct decision type in its own
`h.*` `on` text), so it is not a confirmed bug — but `DEC-181` is the single highest-leverage
identity-composition point in the whole corpus, and its actual duplicate-safety guarantee is
invisible to the vNext idempotency vocabulary (`instanceKey`/`concurrency`) that every reader of
`entity` would otherwise trust at face value. Recommend a documentation note (or a second,
explicit dedup-scope field) in a future round rather than leaving `c.duplicate`'s prose as the
only record of what actually prevents a duplicate decision case.

## Part 34 — global idempotency chains (named identities, real source)

Three chains, with the five identities the brief asks for named explicitly:

**Chain 1 — abandoned-checkout payment recovery (`ACQ-11 → FIN-134`).**
Business operation identity: the payment obligation (`obligation_id`). Journey instance id:
`ACQ-11`'s `logical_process_id` (scoped `[person_id, logical_process_id]`). Work-instance id:
`FIN-134`'s own recovery instance, scoped `[obligation_id]`. Runtime-operation id: the payment
provider attempt behind `a.retry`/`a.use-alternate`. Attempt id: *"the failed attempt's own
idempotency key."* **Composes correctly end to end.** `ACQ-11`'s `h.payment` handoff explicitly
stops its own communication ("that recovery communication about the process stops here") and
`suppresses: ["every queued recovery touch for this process"]` before handing to `FIN-134`, and
`FIN-134`'s `a.retry` explicitly reuses the original attempt's idempotency key rather than
minting a fresh one — no double budget, no identity drift, ownership transfer is total and
one-directional. Worth citing as a second reference chain alongside the fixed `CMS-208`/`OPS-124`
pair.

**Chain 2 — payment ambiguity to dedup (`FIN-132 → FIN-135 → OPS-125`).**
Business operation identity: `logical_operation_key`, explicitly the same field named
identically by both `FIN-135` (sender) and `OPS-125` (receiver). Journey/work-instance id:
`FIN-132`'s attempt record, `FIN-135`'s own `[obligation_id]`-adjacent reconciliation instance.
Runtime-operation id: the provider reference. Attempt id: the provider reference / attempt
identifier, explicitly named as **not** what `OPS-125` compares against. **Composes correctly**
— see Part 30 above for the full quotes.

**Chain 3 — the `DEC-181` fan-in (~30 senders → `DEC-181` → `DEC-182` → `DEC-183`/`184`/`189`).**
Business operation identity: each sender's own instance id (e.g. `RSK-192`'s `risk_subject_id`,
`IDN-84`'s `verification_instance_id`, `SUB-163`'s `renewal_cycle_id`). Journey instance id:
the sender journey's own instance. Work-instance id: `DEC-181`'s `request_id`, freshly minted
per entry, decoupled from every sender's own id. Runtime-operation id: not applicable (no
Runtime Mechanism sits in this chain for most senders; `OPS-126`/`OPS-127`/`OPS-131` are the
three that do, and each hands off through the same `request_id`-minting entry as every
Operational Workflow sender). Attempt id: not separately tracked; a retried sender-side handoff
is *only* caught by `c.duplicate`'s business-scope match, per the P1 above. **Does not
confirmedly duplicate** in any traced case (every sender's decision-scope text is distinct
enough that `c.duplicate` should discriminate correctly), but the compose-correctness of this
chain rests entirely on unverified prose rather than a structural field, which is why it is
flagged (see Part 30 P1) rather than closed out as clean like Chains 1 and 2.

## Part 11 — cross-layer framing on known intra-workflow idempotency gaps (light touch)

Per the brief, the ~40 already-catalogued intra-Operational-Workflow idempotency gaps and the
570 `durable_work_without_idempotency` warnings are not re-listed here. Two of the confirmed,
deliberately-unrepaired P1 clusters named in `FIXES-APPLIED.md` (`REM-153`/`REM-154`'s missing
`instanceKey`, and `TRM-103`/`TRM-104`/`TRM-109`'s missing `instanceKey`) were checked
specifically for a CROSS-layer exposure path — does any Runtime Mechanism or Customer Journey
retry into them — using `relationship-graph.json`'s full 548-edge set.

**Result: neither cluster has an inbound handoff from anywhere in the corpus.** `REM-154` has
exactly one inbound edge (`REM-153 → REM-154`, itself an Operational Workflow, entered once per
physical return receipt, not retried); `TRM-103`/`104`/`109` have zero inbound canonical
handoffs — each is entered only by its own locally-scoped authoritative trigger. So neither
gap currently has a demonstrated cross-layer duplicate-effect path; this confirms (rather than
overturns) `FIXES-APPLIED.md`'s judgment that they are "neither production-blocking nor directly
adjacent to a P0 root cause." No new cross-layer-specific idempotency finding beyond what is
already known and reviewed.

## Findings summary

| # | Finding | Layer boundary | Severity |
|---|---|---|---|
| 1 | `DEC-181`'s ~30-sender duplicate-request protection lives entirely in `c.duplicate`'s prose scope-match, not in its own `instanceKey`/`concurrency` (which can never fire, since `request_id` is freshly minted per entry) — not confirmed broken, but the highest-fan-in identity point in the corpus is undocumented at the structural level | Operational Workflow ↔ Operational Workflow (and Runtime Mechanism senders `OPS-126/127/131`) | P1 |
| 2 | `SUB-164`'s `a.new-term` binds to the terms `SUB-163` decided and carried in `h.execute`, with no revalidation against current policy at execution time and no explicit statement that bind-at-decision (rather than revalidate-at-execution) is the intended choice | Operational Workflow (see also TIME-AND-VERSION doc, Part 31, where this is graded) | (graded in TIME doc) |
| 3 | `FUL-147`/`FUL-148`'s shared retry budget is carried by prose ("the remaining budget, which does not reset") with no structural `attemptBudget` field — currently safe, one bad future change away from the pre-fix `CMS-208`/`OPS-124` shape | Operational Workflow ↔ Operational Workflow | P2 |
| 4 | `DOC-215`'s `attemptBudget` field models a fixed signer-list length, not a retry ceiling — vocabulary mismatch, not a runtime risk | Operational Workflow (intra) | P2 |
| — | Part 29 double-retry-budget search: **0 new instances** found corpus-wide beyond the already-fixed `CMS-208`/`OPS-124` pair | corpus-wide | — |
| — | Part 30 attempt-identity confusion: **0 confirmed instances** in the 3 representative chains read in full; all 3 are reference-quality | Operational ↔ Runtime, Customer ↔ Operational | — |
| — | Part 34 global chains: 2 of 3 named chains compose correctly end-to-end; the 3rd (`DEC-181` fan-in) is unconfirmed-but-unverified, tracked as finding #1 | cross-layer | — |
| — | Part 11: `REM-153`/`154`, `TRM-103`/`104`/`109` confirmed to have **zero** inbound cross-layer handoffs in `relationship-graph.json` — no new cross-layer exposure beyond what `FIXES-APPLIED.md` already recorded | verification only | — |

**Totals: P0 = 0, P1 = 1, P2 = 2** (this document's own findings; finding #2 is graded and
counted in `TIME-AND-VERSION-INTEGRATION.md` to avoid double-counting across documents).
