# Cross-library integration audit — event vocabulary and source-of-truth authority

Governing brief Parts 15–18. Audit only. Companion to `RESULT-AND-FEEDBACK-INTEGRATION.md`, which
this document cross-references rather than duplicates where a finding (`OPS-130`'s orphaned
`RECONCILIATION_REQUIRED`, `REM-157`'s `issue_id` gap) is both an event-inventory finding and a
result-propagation finding.

## POST-REPAIR UPDATE (2026-09-04)

Repair round following this audit. Grounded in `FIXES-APPLIED.md`, `INTEGRATION-CANONICAL-CHANGES.md`,
and a direct re-read of current `src/canonical/processing.ts` (`OPS-130`) and `decision.ts`
(`DEC-181`) source. Cross-referenced with `RESULT-AND-FEEDBACK-INTEGRATION.md`'s own POST-REPAIR
UPDATE, which carries the full fix detail for the same finding (there, `RF-1`; here, `EA-1`).
Everything below this section and above `## Part 15` is the original audit, unmodified.

**Finding EA-1 (P0) is FIXED — full detail in the companion document, not duplicated here.**
`OPS-130.x.reconciliation` (`RECONCILIATION_REQUIRED`) previously had no producer/consumer pairing
anywhere in the 456-event registry's usage. `c.confirmed`'s "Missing or conflicting" branch and
`w.pending`'s `onTimeout` now route to a new `a.reconcile` action → new `h.escalate` handoff into
`DEC-181`. Per `FIXES-APPLIED.md`'s own "OPS-130 RECONCILIATION_REQUIRED" section, the chosen
receiver's reasoning ("Why") and the "Result loop" reasoning are quoted in full in
`RESULT-AND-FEEDBACK-INTEGRATION.md`'s own POST-REPAIR UPDATE — summarized here: `DEC-181` was
chosen over `FIN-140`/`DOC-220` (real but domain-specific reconciliation workflows) and `DAT-222`/
`OWN-55` (checked and rejected — wrong problem shape) because its own entry evidence generically
covers exactly this case, and no special return handoff was added from `DEC-181` back into `OPS-130`
— the case resolves through `DEC-181`'s own already-working ~30-referrer resolution path instead,
consistent with how every other referral through it already works.

**The new `runtime_arbiter_result_unconsumed` validator (ERROR severity) now exists and confirms 0
findings corpus-wide.** It checks for exactly this event-inventory shape — a Runtime Mechanism exit
whose own `reEntry` text states a propagation intent with zero outbound handoffs anywhere in that
journey to structurally carry it out (`scripts/validate-canonical.mjs`, `runtime_arbiter_result_unconsumed`,
declared ERROR not WARN, since an outcome a mechanism's own text says must be seen and structurally
cannot be is a corpus defect rather than a judgment call). `node scripts/validate-canonical.mjs`
reports **0 errors** overall.

**DEC-181-side verification: no change was needed, and this is worth stating as a confirmation, not
a new finding.** `OPS-130` is a Runtime Mechanism, not a human or customer requester. Read directly
against current `decision.ts` source, `DEC-181`'s own `entity.note` (unchanged by this round) already
generically covers this shape: *"The referring party behind a request takes one of two shapes, both
first-class rather than one assumed and the other bolted on: a human or customer requester, whose
own standing to ask is what `c.valid` checks; or an internal referral from a Runtime Mechanism or
another Operational Workflow, which carries its own id as the referring party and arrives already
authorized to escalate by the referring party's own canonical rules — `c.valid` does not re-litigate
that authorization, only confirms the referral itself is well-formed."* This generic two-shape
contract was established by the *prior* repair round (referenced directly in `FIXES-APPLIED.md`'s
own "Why" reasoning: *"`DEC-181` was itself just repaired [the prior repair round] specifically to
accept non-human/customer-originated referrals from Runtime Mechanisms and Operational Workflows
without per-sender branching"*) — `OPS-130`'s new `h.escalate` is simply the ~31st referrer to use an
already-generic intake path, not a case requiring its own accommodation. `a.capture`'s own does-text
(*"Capture the request id, the decision type, the target entity, the referring party - a human
requester, or the referring mechanism/workflow's own id for an internal referral..."*) confirms the
same genericity at the implementation node, not only in the entity note.

**Findings summary — updated row:**

| ID | Finding | Cluster / boundary | Prior severity | **Status** |
|---|---|---|---|---|
| EA-1 | `OPS-130.x.reconciliation` (`RECONCILIATION_REQUIRED`) had no producer/consumer pairing anywhere in the 456-event registry's usage | Event inventory (Part 15) | **P0** (counted once, in the companion document) | **FIXED** — new `a.reconcile`→`h.escalate`→`DEC-181` path; full detail in `RESULT-AND-FEEDBACK-INTEGRATION.md`'s POST-REPAIR UPDATE (`RF-1`). `DEC-181`'s own entry contract required no change — confirmed above. New `runtime_arbiter_result_unconsumed` (ERROR) validator: 0 findings corpus-wide. |

EA-2 (business closure vs. entitlement/access fragmentation), EA-3 (`TRM-104`→`REL-100` provenance
gap), EA-4 (`RSK-200`→`ACC-79` provenance), EA-5 (`REM-157` `issue_id` gap, counted in the companion
document), EA-6 (`DEC-183`→`DEC-184` reviewer identity) and the reference-pattern rows EA-7–EA-13 are
**unchanged** — none was in this round's scope.

## Part 15 — event inventory

**Method.** Extracted every `trigger.event` (284, one per journey), every `wait.until` entry (434
across 226 wait nodes), and every `measurement.businessOutcome.event` / `.window.until` /
`.secondary` / `.journeyOutcome.refs` reference (86) from `production/canonical-dump.json`, then
cross-checked all of them against the 456-entry generated registry in `src/canonical/events.ts`.

**Registry hygiene is real, not just documented.** `events.ts`'s own header states trigger entries
are generated *from* the journeys and wait/measurement entries from a human-curated file
(`scripts/event-curation.json`) — so a naive "does the registry match the source" check on the
trigger half was never going to find anything, and it didn't: **0/284** trigger nodes have a local
`evidence.source` disagreeing with the registry's `source` for the same event id. The more useful
check is the human-curated half: **86/86 (100%)** of `measurement`-layer event references (the
vNext contract migrated journeys carry) resolve exactly against the registry — no drift on the
migration marker itself. `wait.until` is more mixed by design (documented in `WaitNode`'s own type
comment): **274/434 (63%)** resolve as exact registry ids ("migrated" journeys); the remaining 160
are prose on journeys not yet migrated — a known, bounded, self-declared gap, not a new finding.

**Producer/consumer sweep.** Built full producer sets (trigger events) and consumer sets
(`wait.until` + measurement refs) and diffed them. 167 registry ids are consumed somewhere but
never appear as any journey's `trigger.event`. Manually sampled ~20 of these
(`purchase_completed`, `booking_confirmed`, `signer_signed`, `activation_recorded`,
`obligation_satisfied`, `renewed`/`replaced`/`completion_recorded`) against the registry's own
`source` field and the consuming journey's own `recheck` clause: every one of them is either
(a) an external/behavioral/declared fact no canonical journey is meant to "produce" as an entry
trigger (a payment provider's webhook, a signer's own action, a platform's own order record), or
(b) an internally-produced outcome recorded by an `action`/`exit` node rather than a fresh
journey's `trigger` — e.g. `SUB-164.x.renewed` records `renewed` as an exit state, and `TIM-63`'s
own `w.resolution` node explicitly does not treat this as an event subscription at all: its
`recheck` clause reads *"the entity re-read at the expiry moment: renewed, replaced, completed, or
still expiring"* — a poll against the system of record, not a wait for a specific producer's
signal. **This is the correct, deliberate design for this class of event** — it is why the "167
unproduced" number is not itself a finding. Two events among the 167 are exceptions and *are*
findings, because in both cases the corpus's own text says the event should be actionable and
nothing takes the action:

- `RECONCILIATION_REQUIRED` (`OPS-130.x.reconciliation`) — no trigger, no `wait.until` reference,
  no measurement reference anywhere in the other 283 journeys, despite the exit's own `reEntry`
  text stating the gap it represents should be *"visible rather than reported as done."* Full
  detail, and rated **P0**, in `RESULT-AND-FEEDBACK-INTEGRATION.md` Part 13 Finding 1 — counted
  once, not duplicated here.
- The `REM-157` `issue_id` construction gap (`TIM-68`/`DEC-190`/`DAT-230` senders) is a payload-
  contract gap, not strictly a missing-producer gap, but is the same "does the consumer's stated
  requirement actually get supplied" question Part 15 asks about required payloads. Full detail,
  rated **P1**, in the companion document's Finding RF-3.

**No genuine "same name, different meaning" instance found**, and the corpus's own design choice
explains why: registry entities are deliberately generic (`obligation_satisfied`'s entity is just
"the obligation," reused by a payment obligation, a subscription-recovery obligation, and a
deadline obligation across `TIM-61`/`TIM-268`/`FIN-131`/`FIN-134`/`SUB-165`), and every consumer
re-grounds the generic name against its own system of record via `recheck` rather than trusting a
shared payload shape. Detailed in the companion document's Part 12; restated here because it is
also the direct answer to Part 15's "same event name, different meaning" question — the pattern
that would create that failure mode (a generic shared name) is present, but the mitigation
(mandatory per-consumer `recheck`) is applied everywhere the pattern occurs, with no exception
found in the sample checked.

## Part 16 — source-of-truth consistency

Seven clusters, as specified. Each finding below is grounded in a direct read of both ends; each
"no conflict" verdict reflects an actual check, not an assumption of health.

**Payment completion — single source, correctly gated.** Detailed in the companion document
(Finding RF-5): only `FIN-132`–`135` (and `SUB-165`, chained off `FIN-134`) ever declare a
payment-outcome trigger; all three successful paths funnel into `FIN-136` (Balance Reconciliation)
only on a settled/authoritative outcome, and `FIN-136`'s own entry evidence explicitly excludes
"authorised but not settled." No competing authority found anywhere in the corpus.

**Consent state — single canonical rule, widely reused.** `GLB-31` (the hard-gate consent rule) is
referenced **135 times** across `production/canonical-dump.json` — e.g. `ACQ-01`'s own eligibility
list ends with *"hard gates (GLB-31) allow communication for this purpose"* rather than each
journey re-deriving its own consent check. `CON-31`/`CON-35`/`CON-40` are the only journeys that
trigger on `consent`/`permission`-named events directly, keeping the domain single-owned. No
fragmentation found in the sample checked; a full 135-reference re-derivation was not performed
(light touch, per the brief's own guidance to prioritize depth on the clusters that show real
conflict).

**Identity verification — three legitimately distinct authorities, correctly scoped, not
conflicting.** `IDN-81` (Identity Verification — *"establish confidence in one specific identity
claim, bound to the evidence that established it"*), `IDN-85` (Login Verification — session
authentication, *"establish that whoever is present controls the required identity"*), and `IDN-83`
(Document Verification — satisfying a stated requirement via an uploaded artifact) answer three
different questions (who is this / is this session that person / does this document satisfy a
requirement) and none references or overrides the others' conclusions. `IDN-89` (Identity
Attribute Update) explicitly names the risk this cluster could otherwise create — its own purpose
states it will *"reconcile everything that depended on the old value independently rather than
b[y]…"* — i.e., it does not let a changed identity attribute silently invalidate other domains'
own verifications; each dependent reconciles on its own terms. Checked as a plausible conflict
candidate; cleared.

**Document authority — single arbitration point, explicitly modeled.** `DOC-213` (Document
Issuance) is the freeze point ("frozen at a version that can be identified, referenced and never
quietly changed"); `DOC-220` (Document Conflict Review) is the corpus's own explicit arbiter for
disagreement, and its first action, `a.collect`, is written to gather *"the authority or source
behind each record"* before resolving — the cluster names its own authority question directly
rather than leaving it implicit. No other domain independently declares a competing "which version
governs" answer.

**Ownership — a plausible naming collision, checked and cleared.** `OWN-54` ("Ownership Transfer")
and `CTL-231`–`CTL-234` ("Ownership Assignment/Transfer Validation/Transfer Execution/Cutover")
share enough vocabulary to look like two domains modeling the same authority independently — worth
flagging as a candidate given Part 16's own warning that this is "a major finding class." Checked
directly: they are not competing. `CTL-231`–`234` model the mechanical control-transfer process
(propose → validate → accept → cutover); `CTL-234.h.reconcile` hands its completed result
("an ownership cutover completed," carrying *"the explicit instruction that historical attribution
is already preserved and must not be revisited"*) into `OWN-54`, which is where the *consequences*
(active obligations, clock continuity, historical attribution) are actually handled. A genuine
producer→consumer chain, not two sources of truth for the same fact — cleared, though `OWN-54`
declares no `distinctFrom` entry against the `CTL-23x` cluster despite the vocabulary overlap,
worth a documentation nicety fix, not a finding.

**Business closure vs. entitlement/access — the one real conflict found (P1).** `TRM-106` →
`TRM-107` → `TRM-108` (Account Closure → Reconciliation → Wind-Down) is the corpus's own business-
closure authority, and `TRM-107`'s own job is explicit: *"Make sure nothing that lives outside the
account is assumed to have ended because the account did"* — its `a.inventory` step names *"active
entitlements"* as one of the dependency classes it checks. Separately, `ACC-74` (Entitlement
Revocation) fires on its own trigger, `entitlement_no_longer_valid`, whose evidence lists causes
generically — *"a plan downgrade, a contract termination, a role removal, a benefit expiry, an
eligibility-linked revocation, or a policy decision"* — **without naming account closure as one of
them**, and `ACC-80` (Deprovisioning Reconciliation) similarly names *"an account closed"* only as
one clause of a longer disjunction. Checked the relationship graph directly: **there is no handoff
edge anywhere from `TRM-106`/`107`/`108` into `ACC-74` or `ACC-80`.** The two domains never
literally share the "this account is closed" fact through a structural connection — each has its
own authoritative trigger, and nothing guarantees `TRM-106`'s closure decision is what actually
fires `ACC-74`'s revocation.

This is a genuine cross-domain source-of-truth fragmentation for a single conceptual fact ("this
account is closed, so its entitlements should end"), but it is **partially, not fully, mitigated**
by design: `TRM-107` exists specifically as a verify-and-escalate safety net for exactly this
failure mode — its own actions include `a.verify-termination` (*"verify the termination actually
happened rather than assuming it. A provider reporting success is a statement about their API...
not the same as a coupling implemented in a system"*) and, if a dependency never actually
terminates, `a.record-unresolved` (*"a failure to end one dependency is never hidden behind an
account marked CLOSED — that is exactly how someone keeps being charged by a provider they believe
they have left"*) followed by `h.escalate` to `OWN-55`. So the corpus does not silently lose this
result — but it reconciles it by **audit-and-escalate**, not by a guaranteed structural trigger, the
same shape already repaired for `INC-258`/`DAT-228` this round via an added reconciliation path.
**P1** — a real fragmentation between two domains' authority for the same underlying fact, caught
by a safety net rather than by design, consistent with why the corpus's own repair round chose the
add-a-reconciliation-path fix for structurally similar gaps rather than treating them as P0.

**Eligibility and business closure recur through `GLB` rules generally** — a fuller eligibility-
specific audit (whether every domain's own eligibility text defers to a named `GLB` rule versus
inventing its own) was not performed exhaustively; the pattern observed in the acquisition and
consent domains (a shared, named, widely-reused rule id) is the corpus's evident intent, and no
counter-example surfaced in the course of the other six clusters' review.

## Part 17 — authority continuity across layers

Checked whether a decision crossing `Operational Workflow → event/handoff → Silent State →
Customer Journey` carries who made it, under what authority, for which instance — not a name, a
role/policy/instance reference.

**Works well: `DEC-190` → `REM-157`.** `DEC-190` (Decision Re-Review) hands its `h.correct` result
into `REM-157` carrying *"what was executed, on whose authority and when"* explicitly as a named
payload element — the review domain's own reference instance for exactly this requirement, and the
one case checked in this round where authority provenance is carried as a first-class fact across
an Operational→Customer-communicating boundary rather than left implicit in prose.

**Gap (P1): `TRM-104` → `REL-100` propagates an already-known unnamed-authority decision into a
customer-silent lifecycle state with zero provenance.** `AUTHORITY-AND-APPROVAL-AUDIT.md` already
flags `TRM-104` (Primary Relationship Transfer) as one of the "generic authority" gaps — it "says
authorized by without ever naming who," confirmed P1 (not P0) by the round's own POST-REPAIR
re-derivation. This round's addition is the cross-layer consequence: `TRM-104.h.orphan` hands off
into `REL-100` (customer-silent — Relationship Restoration/orphan handling) *"on: a dependent left
without exactly one valid required primary,"* carrying *"the dependent, what was transferred and
what it now lacks"* and *"its inherited obligations and their unchanged deadlines"* — no authority
reference at all, because `TRM-104` never captured one to carry. The within-layer gap
(`TRM-104` itself) was already catalogued and deliberately left unrepaired this round per the
brief's own "don't force every P1 to zero" instruction; what had not been checked before is that
the same missing fact now reaches a Silent Lifecycle State that has no way to backfill it — a
customer's account can land in `REL-100` missing a required primary relationship with literally no
record, anywhere in the corpus, of what authorized the transfer that caused it. Reported as a
**distinct cross-layer finding** per Part 18's instruction, not a restatement of the existing
within-layer entry. **P1**, matching the existing severity judgment on `TRM-104` itself.

**Gap (P2): `RSK-200` → `ACC-79`, provenance captured locally but not carried forward.** `RSK-200`
(Risk State Recalculation) itself does capture authority correctly — its own actions append to
`policy_log`, and its trigger evidence requires *"a policy version, a cleared risk case, a moved
restriction threshold, a changed compliance requirement, a revoked exception, or a new
authoritative classification."* But its `h.restore` handoff into `ACC-79` (customer-silent,
Capability Restoration — a consequential action, since it restores previously-blocked access)
carries only *"the restriction being lifted and the change that removed its basis"* — no explicit
policy id, case id, or classification reference travels with it. `ACC-79`'s own entry contract
doesn't require one either, so this is not a broken handoff by either side's own stated terms — but
it means the customer-silent state that actually re-enables a capability has no traceable link back
to the specific risk-case decision that authorized it, only a prose description. **P2** — the
underlying provenance exists and is captured (in `RSK-200`'s own `policy_log`), it simply isn't
threaded through the handoff as a structured reference the way `DEC-190`'s does.

**Soft observation (P2): `DEC-183` → `DEC-184`, reviewer identity not named explicitly.**
`DEC-183.h.info` hands off to `DEC-184` (More Information Request, customer-communicating) carrying
*"the exact requirement the decision turns on, and why"* and *"everything the review has already
established, which is preserved rather than discarded"* — the second clause is broad enough to
plausibly include the reviewer's own identity as part of "the review," but it is not named as
its own field the way `DEC-190`'s "on whose authority" is. Lower confidence than the `TRM-104`/
`RSK-200` findings above since the prose may already cover it; recorded as a P2 for completeness
rather than asserted as a confirmed gap.

## Part 18 — cross-layer authority/approval findings (light touch)

Per instruction, not attempting to close these — reporting only the findings from Part 17 that are
specifically cross-layer (a decision's authority becoming unrecoverable *after* crossing into
another surface), as distinct from the 22 within-layer findings `AUTHORITY-AND-APPROVAL-AUDIT.md`
already catalogs:

- **`TRM-104` → `REL-100`** (P1, above) — the clearest instance: an already-known unnamed-authority
  decision propagates into a Silent Lifecycle State with no way to reconstruct provenance after the
  fact, because nothing downstream of `TRM-104` was ever going to receive what `TRM-104` itself
  never captured.
- **`RSK-200` → `ACC-79`** (P2, above) — narrower: the authority is captured at the source but not
  threaded through the handoff, so it is *recoverable in principle* (an operator could go back to
  `RSK-200`'s own `policy_log`) but not *carried* the way the corpus's own better examples
  (`DEC-190`) do it.

No new P0-tier cross-layer authority finding was found — the two above are consequential but
neither is irreversible in the way `RLT-247` (rollback vs. forward-recovery) or `TRM-101`
(entity merge) already are, and both of those are already correctly rated and repaired/reviewed at
the within-layer level this round.

## Findings summary

| ID | Finding | Cluster / boundary | Severity |
|---|---|---|---|
| EA-1 | `OPS-130.x.reconciliation` (`RECONCILIATION_REQUIRED`) has no producer/consumer pairing anywhere in the 456-event registry's usage — full detail in the companion document. | Event inventory (Part 15) | **P0** (counted once, in the companion document) |
| EA-2 | Business closure (`TRM-106`–`108`) and entitlement/access termination (`ACC-74`/`ACC-80`) have no structural handoff between them — reconciled only by `TRM-107`'s own audit-and-escalate safety net, not by design. | Source-of-truth: business closure vs. access | **P1** |
| EA-3 | `TRM-104`'s already-catalogued unnamed-authority transfer decision propagates into `REL-100` (customer-silent) with zero recoverable provenance. | Authority continuity: Operational → Customer (silent) | **P1** |
| EA-4 | `RSK-200`'s policy/case authority is captured locally (`policy_log`) but not threaded through its `h.restore` handoff into `ACC-79`. | Authority continuity: Operational → Customer (silent) | **P2** |
| EA-5 | `REM-157`'s `issue_id` payload-construction gap — full detail in the companion document (Finding RF-3). | Event inventory / required payload (Part 15) | **P1** (counted once, in the companion document) |
| EA-6 | `DEC-183` → `DEC-184` does not explicitly name the reviewer's identity in its handoff payload (lower-confidence, prose may already cover it). | Authority continuity: Operational → Customer (communicating) | **P2** |
| EA-7 (works well) | Payment completion has a single, consistently-gated source of truth (`FIN-132`–`136`). | Source-of-truth: payment | reference pattern |
| EA-8 (works well) | Consent gating defers corpus-wide to one named rule, `GLB-31` (135 references). | Source-of-truth: consent | reference pattern |
| EA-9 (works well) | Identity verification's three sub-domains (`IDN-81`/`IDN-83`/`IDN-85`) are correctly scoped to different questions, with `IDN-89` explicitly managing cross-dependency reconciliation. | Source-of-truth: identity | reference pattern |
| EA-10 (works well) | Document authority has one explicit arbiter (`DOC-220`), which names "the authority or source behind each record" as the first thing it collects. | Source-of-truth: document authority | reference pattern |
| EA-11 (works well) | `OWN-54`/`CTL-231`–`234` naming overlap checked and cleared — a genuine producer→consumer chain (`CTL-234.h.reconcile → OWN-54`), not competing authorities. | Source-of-truth: ownership | reference pattern |
| EA-12 (works well) | `DEC-190 → REM-157` carries "on whose authority" as an explicit payload field — the round's cleanest authority-continuity instance. | Authority continuity | reference pattern |
| EA-13 (works well) | Generic event names shared across obligation types are safely re-grounded per consumer via `recheck` rather than a trusted shared payload. | Event inventory (Part 15) | reference pattern |

**Totals: 0 new P0 (1 P0 cross-referenced from the companion document), 3 P1 (1 cross-referenced),
3 P2, 7 reference-pattern citations. Event inventory: 456 registry events, ~40 traced in depth
across the payment/obligation/booking/identity/closure sample; 2 confirmed gap instances (the
`OPS-130` sink and the `REM-157` payload gap), 0 same-name/different-meaning instances found.
Source-of-truth clusters: 7 examined per the brief's list; 1 confirmed fragmentation (business
closure vs. entitlement/access), 6 checked and cleared (including one plausible-looking `OWN`/`CTL`
naming collision that was directly verified rather than assumed safe). Authority-provenance
findings: 3 (1 P1, 2 P2), plus 1 positive reference instance.**
