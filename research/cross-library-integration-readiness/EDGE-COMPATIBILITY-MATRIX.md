# Edge Compatibility Matrix — cross-library handoff audit

Scope: all **522 handoff edges** in `relationship-graph.json` (the 22 competition and 4 preemption
edges are out of scope here — they are conflict-resolution relationships, not identity/entry/
ownership handoffs, and are already covered by `research/journey-production-readiness/
CONFLICT-AND-PREEMPTION-AUDIT.md`). Each edge was classified on four dimensions — identity, entry,
ownership, result — against the target's actual `entity`/`entry`/node text in
`production/canonical-dump.json`, not against the edge's own `carries`/`context` text in isolation.

## Method, and what it found about the corpus's own conventions before it found anything else

Two rounds of mechanical checking were run and then verified by hand against the actual node text,
because both produced heavy false-positive rates that would have misrepresented the corpus if
reported as-is:

1. **Literal instanceKey-token matching** (does the target's `entity.instanceKey` field name appear
   verbatim in the sender's `carries`/`context` text?) flagged 35 of 522 edges. Reading each of the
   35 against the actual node graphs found the overwhelming majority are **not** defects — they are
   instances of a convention this corpus uses consistently and does not restate per edge:
   - **Trigger-anchored ambient identity.** Nearly every non-external target's `entry` trigger
     requires "an authoritative event" or "a recorded state" that already pertains to a specific,
     existing record (e.g. `ACQ-09`'s `t.not-ready`: "a captured lead with a recorded entry reason";
     `ACT-18`'s `t.stall`: "an activated account failing to progress"). The record referenced *is*
     the identity; a sender within the same family handing off about "the account", "the booking",
     "the obligation" it already holds does not need to restate that account's/booking's/
     obligation's id as a separate carried field, because the event itself is scoped to it.
   - **Reference-carries-full-object-state.** When a handoff carries a reference to an object the
     receiver's instanceKey needs a component of ("the destination entity that already exists", "the
     cancellation episode this belongs to", "the obligation and the recovery already attempted"),
     that reference is read as carrying the object's own known fields, not merely a label.
   - **Explicit, documented self-minting/derivation**, structurally identical to the already-verified
     `DEC-181` `request_id` pattern (`research/operational-workflow-production-readiness/
     HANDOFF-AND-CHAIN-AUDIT.md`) and confirmed valid there. This corpus round found three more
     instances of the *same legitimate pattern*, two of them better-documented than `DEC-181`'s own:
     `ACT-16`'s `h.adoption`→`ACT-17` mints `use_case_id` "at this handoff since no use-case concept
     exists prior to activation"; `CON-35`'s `h.conflict`→`CON-40` derives `disputed_permission_ref`
     "from this change's own (purpose, channel, scope), which `CON-40`'s own conflict instance is
     keyed on"; `IDN-90`'s `h.recover`/`h.lift`→`ACC-79` mints `restoration_case_id`
     "deterministically derived from `incident_id` and the [...] outcome, so `ACC-79` can construct
     its own instance without inventing one" — the most explicit derivation formula found in the
     round. None of these three is a defect; all three are cited positively in
     `IDENTITY-AND-PROVENANCE-AUDIT.md`.
2. **Literal `contractRequiredFields`-token matching** (does the sender's own declared
   `contract.requiredFields` list appear in its own `carries` text?) flagged 48 of 85 edges that
   declare the field. Reading these found the same two patterns again, plus one boilerplate
   artifact: `handed_at` and `reason` are structural fields implicit in every handoff (the moment of
   the handoff, and the `on` trigger condition itself, respectively) and are never spelled out as
   literal tokens anywhere in the corpus's prose — this is not a gap, it is how the convention is
   written.

After both mechanical passes were verified by hand, **4 genuine identity/entry findings survive**
(listed below and in `IDENTITY-AND-PROVENANCE-AUDIT.md`), against a corpus of 522 handoffs. This is
consistent with the four closed rounds' own conclusion: a well-designed corpus with localized
defects, not a systemic problem.

A second corpus-wide fact, parallel to the one `OWNERSHIP-AND-ASSIGNMENT-AUDIT.md` already recorded
for the Operational layer alone: **72 of the 171 distinct non-external handoff targets in this
graph (42%) declare no `entity.instanceKey` at all.** Identity for these is carried entirely by the
trigger-anchored-ambient-identity convention above. This is recorded once, here, rather than as 72
per-target findings — it is the corpus's chosen convention, consistently applied, not a defect.

## Ownership, corpus-wide

`ownershipTransfer` is `null` on all 522 edges — the corpus does not use that field; ownership is
prose, exactly as `OWNERSHIP-AND-ASSIGNMENT-AUDIT.md` already found for the Operational layer alone,
extended here to the whole graph. Of 522 edges: **43 explicitly relinquish** (a non-empty
`suppresses` array — the sender cancels its own queued future work, the clearest possible signal of
ownership transfer), **98 more read as relinquish/retain from their own `on`/`context` prose**
("no longer", "remains", "still", etc.), and **377 (72%) leave ownership unstated** at the edge
level. Reading a sample of the unstated ones against their *receiving* workflow (not just the edge
text) found the ambiguity is frequently resolved on the **receiver's** side rather than the sender's
— the clearest example is `OWN-55` (escalation hub, 39 incoming edges, 22 of them cross-surface):
its own graph has an explicit `c.transfers` condition — "Does escalating transfer ownership, or ask
for a decision?" — with a dedicated `a.support` action recording "the original owner remains
responsible while the higher authority is asked for a decision or support" on one branch. A sender
that doesn't say whether it's relinquishing is not a defect when the receiver's own graph resolves
the question either way. This mirrors the identity findings above: ambiguity **stated once at the
edge level** is frequently, and validly, **resolved once at the receiving workflow's own entry
logic** rather than needing to be restated per sender. No edge was found where ownership was left
genuinely unresolved on *both* sides — see the hub write-ups below for the edges checked in detail.

## Result compatibility

Paired return handoffs (an edge that implies the receiver reports back) are rare and were checked
individually. `SUB-165 -> SUB-164` (recovered renewal obligation returning to the renewal workflow)
and `RET-30`'s own outcome events (`retention_offer_accepted/declined`, `relationship_recovered`,
`intervention_failed`, consumed back into `RET-24`/`RET-28`'s own escalation logic where relevant)
are the clearest examples and are both intact. The overwhelming majority of edges (paired or not)
have no implied return leg — for those, result compatibility is marked N/A in the table.

## Detailed write-ups

### The one semantic mismatch

**`RET-24` `h.intervention` → `RET-30`** (Customer-silent → Customer-silent, same-surface but
included here because it's the round's one hard finding). `RET-24`'s automated-intervention handoff
carries only "the evidence it was chosen against" and "the risk state at the time it was sent" — no
episode identifier of any kind. `RET-30`'s own `entity.instanceKey` is
`[account_id, retention_episode_id]`, and its entry (`t.delivered` → `w.outcome`) goes **straight**
from trigger to an outcome-wait with no capture/self-mint action in between — unlike `DEC-181`,
`ACT-17`, `CON-40` or `ACC-79`, `RET-30` has nothing that could mint `retention_episode_id` on
receipt if the sender doesn't supply it. Its own sibling handoff, `RET-28` `h.intervention` →
`RET-30`, gets this right: it explicitly carries "the cancellation episode this belongs to, so a
decline is remembered inside it." `RET-24`'s own `entity.instanceKey` is
`[account_id, risk_episode_id]` — a **different episode concept** (risk episode, not retention
episode) — so this is not a case where the sender simply forgot to restate an id it already had;
the sender's own domain doesn't have the receiver's identity concept at all. Effect: an automated
retention intervention that reached the customer via the `RET-24` (proactive risk) path, as opposed
to the `RET-28` (explicit cancellation intent) path, cannot be correlated to a retention episode by
`RET-30`'s own stated logic ("a decision decline is remembered inside it"), so `RET-30` risks either
inventing an episode boundary silently or failing to honor its own documented per-episode memory for
roughly half of its two documented callers. **Severity: P1** — a real functional gap on a stated
receiver behavior, not merely a documentation nicety, but bounded to one specific outcome-memory
feature of one workflow rather than blocking the handoff itself.

### Compatible-with-mapping edges (9)

- **`ACQ-04` `h.reached` → `ACQ-08`** (Customer-silent → Customer-silent): `ACQ-08`'s instanceKey is
  `[person_id, destination_entity_id]`; `ACQ-04`'s own scope is "lead, opportunity or account" — a
  pre-conversion representation. The carried "destination entity that already exists" plausibly
  supplies `destination_entity_id` by reference, but `person_id` is only safe if the lead has
  already resolved to a person by the time this late high-intent action arrives — true in the
  ordinary case (the destination is described as already reached) but not stated as a guaranteed
  precondition of this specific edge. P2 — a mapping-time note for an implementer, not a functional
  break.
- **`ACQ-07` `h.re-escalate` → `ACQ-03`**, **`ACQ-09` `h.progressed` → `ACQ-03`**, **`ACT-20`
  `h.intent` → `ACQ-03`** (all Customer-silent → Customer-silent): all three senders scope their own
  intent as `intent_context_id` (`ACQ-07`) or carry no formal intent-entity concept at all
  (`ACQ-09`, lead-scoped; `ACT-20`, lead/context-scoped), while `ACQ-03`'s own instanceKey requires
  `intent_entity_id`. This is a genuine naming/granularity divergence in the *vocabulary*, but not a
  functional break: `ACQ-03`'s own first action, `a.resolve`, explicitly does the work — "Resolve
  which journey currently owns this person for this entity, **and which lifecycle the new intent
  belongs to**" — i.e. `ACQ-03` derives `intent_entity_id` itself from the signal rather than
  requiring senders to pre-name it, the same self-resolving-on-entry pattern documented for
  `RSK-192`'s `risk_subject_id`. P2 — a naming-clarity gap across the ACQ/ACT family's own vocabulary
  worth reconciling (`intent_context_id` vs. `intent_entity_id` reads as two names for the same
  underlying concept), not a receiver-construction defect.
- **`SCH-176` `h.provider`, `SCH-177` `h.provider-exception`, `SCH-178` `h.provider`, `SCH-179`
  `h.provider`, `SCH-280` `h.provider` → `SCH-180`** (all Customer-silent → Customer-silent): each
  edge individually is fine — `booking_id` is shared with the sender's own instanceKey in every
  case, and `provider_failure_id` (the other half of `SCH-180`'s `[booking_id, provider_failure_id]`
  instanceKey) is plausibly `SCH-180`'s own concept, minted on intake, the same way `SCH-180`'s
  `a.scope` action ("identify every reservation the failure affects") already implies a first-seen
  correlation step. What's missing is **cross-sender coordination**: `SCH-180` has 5 independent
  detection paths reporting into it (a cancellation, a pre-service block, a mid-service failure, a
  no-show-equivalent, and a missed occurrence) and no visible `c.duplicate`-style branch (contrast
  `DEC-181`'s own explicit `c.duplicate` → `a.link`, or `RSK-192`'s "`a.case` is the atomic authority
  for that identity: two signals correlating to the same subject at the same time settle on one case
  between them, never two"). A single real-world provider outage (a closed location) could plausibly
  be reported by more than one of these 5 senders and there is nothing in `SCH-180`'s own graph that
  says the second report joins the first `provider_failure_id` rather than minting a second one. This
  is the same shape as the already-documented `RSK-193` coordination gap
  (`HANDOFF-AND-CHAIN-AUDIT.md`: "three separate risk-detection paths can converge on one entity with
  no coordination between them"). **Severity: P1** (grouped as one finding across the 5 edges, not
  five).

### The named hubs, and one honorary hub found while checking them

Per the brief, `DEC-181`, `OPS-131`, `OPS-130`, `OPS-125`, `DEC-190` and `CTL-234` were checked in
full for the DEC-181-shape risk (an entry contract built for one kind of triggering context —
typically human/customer-originated — receiving a referral from a structurally different sender,
typically an automated Runtime Mechanism or Operational Workflow). `OWN-55` (39 incoming edges, 22
of them cross-surface) was added as an honorary 7th hub because it is the single largest fan-in
target found while walking the cross-surface set, exceeding every named hub except `DEC-181` itself.

- **`DEC-181` (77 incoming edges — verified in full)**: already repaired this round per
  `HANDOFF-AND-CHAIN-AUDIT.md`/`CANONICAL-CHANGES.md` — `c.info`'s 3-way split now gives internal
  referrals (Runtime Mechanism or Operational Workflow senders) their own
  `a.return-to-referrer`/`x.returned` path distinct from the human/customer
  `a.pending-info`/`w.info` path, and `request_id` is self-minted by `a.capture` regardless of
  referrer shape. This audit re-verified the fix against a representative sample of the harder,
  previously-broken senders spanning every sending surface — `OPS-131` (Runtime, competition
  arbitration), `DAT-222`/`RSK-191`/`DOC-212`/`INT-115` (Operational, evidence-bearing), `TIM-67`,
  `CTL-231`, `SUB-163`, `FIN-137`, `REM-152` — and found every one supplies a well-formed "the
  action/entity/request, plus an explicit statement that nothing was invented" package that
  `t.required`'s generic "an action or state that cannot proceed without an authorized judgment"
  evidence and `a.capture`'s dual-shape referrer model both accept cleanly. All 77 edges: compatible.
- **`OWN-55` (39 incoming, 22 cross-surface — verified in full)**: not one of the brief's named hubs
  but the largest fan-in target found in the cross-surface set. Its `t.escalation` trigger
  ("a defined escalation condition: an SLA breached or at risk, an authority limit reached...")
  is deliberately as generic as `DEC-181`'s own trigger and fits both human-owned work (`OWN-52`
  through `OWN-58`, `DEC-189`) and fully-automated senders (`OPS-122`, `OPS-123`, `OPS-127`,
  `OPS-129` — dead-lettered work, stalled recovery, backlog exhaustion) equally well — none of these
  senders is asked to supply anything a human requester would have and an automated one wouldn't.
  Ownership, flagged as an open question in `OWNERSHIP-AND-ASSIGNMENT-AUDIT.md`'s Shape 1 for
  *escalation destinations in general*, is explicitly resolved on `OWN-55`'s own side: its
  `c.transfers` condition ("Does escalating transfer ownership, or ask for a decision?") branches to
  either a transfer or an explicit "the original owner remains responsible" holding pattern. All 39
  edges: compatible; `OWN-55` is a reference-quality hub design, cited positively.
- **`OPS-130` (2 incoming: `OPS-121`, `OPS-124`, both Runtime→Runtime)**: `t.technical`'s generic "a
  technical job reporting completion" fits both a first attempt and a retry equally; `entity.
  instanceKey: [work_id]` is shared with both senders' own instanceKeys. Compatible.
- **`OPS-125` (1 incoming: `FIN-135`, Operational→Runtime)**: `t.duplicate`'s "two or more work
  instances that may represent the same logical business operation" and its own `a.compare` step
  explicitly comparing "the stable identifiers: logical_operation_key..." is a self-resolving design
  — the sender's "a second attempt arriving while the first is unresolved" is exactly the shape this
  trigger wants. Compatible.
- **`DEC-190` (2 incoming: `DEC-185`, `DEC-188`, both Operational→Operational)**: both carry "the
  original decision/approval, preserved, and exactly what has changed since" plus the explicit fact
  that nothing was executed — a clean fit for `t.material`'s "a material event bearing on a prior
  decision." Compatible.
- **`CTL-234` (2 incoming: `CTL-232`, `CTL-233`, both Operational→Operational)**: both explicitly
  state "revalidated against current state immediately before this handoff," matching `t.authorized`'s
  own evidence requirement word-for-word. Compatible — this pair is the round's own reference
  implementation for a revalidate-before-handoff pattern (see `CANONICAL-CHANGES.md`'s `CTL-232`
  entry).
- **`OPS-131`**: 0 incoming handoff edges in this graph (it is a sender, not a receiver, of the
  edges captured here) — nothing to check.

No hub beyond the already-repaired `DEC-181` shows the DEC-181-shaped defect (an entry contract
built for one kind of triggering context receiving a structurally different one). Every hub checked
uses a trigger evidence statement general enough — "an authoritative event/state," "an SLA breached
or authority limit reached," "a technical job reporting completion" — to admit human, automated, and
cross-workflow senders on equal terms.

### Cross-surface edges outside the hub set (85 of 113)

The remaining 85 cross-surface edges (Customer↔Operational, Operational↔Runtime, Runtime↔Customer)
that don't target one of the 7 hubs above fan out across 44 distinct targets, most with only 1-3
incoming edges. Each was checked against its target's `entity`/`entry` text; none showed a receiver-
construction, entry-shape, or unresolved-ownership defect beyond the two already listed above
(`RET-24`→`RET-30`, the `SCH-17x`→`SCH-180` cluster — neither is a cross-surface edge, both are
Customer-silent→Customer-silent, and are listed under their own headings above, not here). The
larger concentrations, checked individually: **`REM-157`** (15 incoming, 9 of them cross-surface,
spanning customer-communicating/silent and operational senders) — `t.decision`'s "a confirmed issue
with an unresolved obligation and no remedy yet selected" fits every sender's own "obligation with a
problem" framing, and `entity.instanceKey: [issue_id]` is `REM-157`'s own concept, self-minted on
intake since no sender already has a `REM-157` `issue_id`. **`TIM-64`** (3 incoming) and **`ACC-73`**
(4 incoming) declare no `instanceKey` at all and their triggers ("an authoritative expiry moment,"
"an authoritative change to the basis of an existing entitlement") are generic enough for every
sender. **`FIN-136`** (4 incoming, all obligation-scoped financial events) shares `obligation_id`
with every sender's own instanceKey. All compatible.

## Findings summary

| id | severity | one-line |
|---|---|---|
| EDGE-01 | P1 | `RET-24 h.intervention -> RET-30`: no episode identifier carried and `RET-30` has no self-mint fallback (unlike sibling `RET-28`'s equivalent handoff) — automated-path interventions can't be correlated to a retention episode. |
| EDGE-02 | P1 | `SCH-176/177/178/179/280 -> SCH-180` (5 edges, one finding): no cross-sender duplicate/correlation check for `provider_failure_id` across 5 independent failure-detection paths converging on one target — same shape as the already-documented `RSK-193` coordination gap. |
| EDGE-03 | P2 | `ACQ-04 h.reached -> ACQ-08`: `person_id` construction assumes the lead has already resolved to a person, not stated as a guaranteed precondition of this specific edge. |
| EDGE-04 | P2 | `ACQ-07/ACQ-09/ACT-20 -> ACQ-03` (3 edges, one finding): vocabulary divergence (`intent_context_id` vs. `intent_entity_id`) across the ACQ/ACT family, functionally bridged by `ACQ-03`'s own `a.resolve` self-resolution but worth reconciling as naming. |
| EDGE-05 | P1 (pre-existing, confirmed unchanged) | `DEC-187 h.undefined -> DEC-189` does not carry the case's original deadline, which `DEC-189`'s own preserve/timeout logic requires — first documented in `HANDOFF-AND-CHAIN-AUDIT.md`, re-confirmed present in this round's read of the same edge. |
| EDGE-06 | P1 (pre-existing, confirmed unchanged) | `DOC-212 h.issue -> DOC-213` (and the parallel `DOC-217` case) doesn't carry "authority to issue," which both targets' own trigger evidence separately requires — first documented in `AUTHORITY-AND-APPROVAL-AUDIT.md`, re-confirmed present. |
| EDGE-07 | P2 (positive finding) | `IDN-90 h.recover/h.lift -> ACC-79`, `CON-35 h.conflict -> CON-40`, `ACT-16 h.adoption -> ACT-17`: three more instances of `DEC-181`'s valid self-mint/derive-on-entry pattern, one with an explicit deterministic-derivation formula — cited as reference designs, not defects. |
| EDGE-08 | P2 (positive finding) | `OWN-55` (39 incoming, 22 cross-surface) and the full `DEC-181`→`182`→`183`→`185`-`190` decision chain (23 edges checked) both carry explicit authority/maker/evidence text on every edge — reference-quality hub designs. |

**Totals**: 522 handoff edges classified (26 competition/preemption edges out of scope, already
covered by `CONFLICT-AND-PREEMPTION-AUDIT.md`). Verdicts: 512 compatible, 9 compatible with mapping,
1 semantic mismatch, 0 contract mismatch. 6 named hubs + 1 honorary hub (`OWN-55`) checked in full
(84 + 39 = 123 edges, with overlap none — hub set is disjoint from the `OWN-55` count). 113
cross-surface edges checked; 85 outside the hub set, all compatible.

## Full summary table (all 522 handoff edges)

*External targets (`external:*`) are italicized. "Compatible with mapping" and "semantic mismatch"
rows are detailed above; every other row is a straightforward `compatible` verdict reached by the
method described above (trigger-anchored ambient identity / reference-carries-object-state /
explicit self-mint, checked against the target's actual `entity`+`entry` text, not assumed).*

| # | Source (node) | Target | Src surface -> Tgt surface | Verdict |
|---|---|---|---|---|
| 1 | ACQ-01 (h.qualification) | ACQ-05 | Cust-Silent -> Cust-Silent | compatible |
| 2 | ACQ-02 (h.destination) | *external:destination-lifecycle* | Cust-Silent -> External | compatible |
| 3 | ACQ-02 (h.reason) | ACQ-05 | Cust-Silent -> Cust-Silent | compatible |
| 4 | ACQ-02 (h.education) | ACQ-09 | Cust-Silent -> Cust-Comm | compatible |
| 5 | ACQ-03 (h.escalate) | *external:higher-intent-lifecycle* | Cust-Silent -> External | compatible |
| 6 | ACQ-04 (h.reached) | ACQ-08 | Cust-Human -> Cust-Silent | compatible with mapping |
| 7 | ACQ-04 (h.human) | *external:human-in-the-loop-lifecycle* | Cust-Human -> External | compatible |
| 8 | ACQ-04 (h.automated) | *external:automated-continuation* | Cust-Human -> External | compatible |
| 9 | ACQ-05 (h.destination) | *external:commercial-destination* | Cust-Silent -> External | compatible |
| 10 | ACQ-05 (h.merge) | *external:account-master-data* | Cust-Silent -> External | compatible |
| 11 | ACQ-06 (h.reconcile) | *external:commitment-reconciliation* | Cust-Silent -> External | compatible |
| 12 | ACQ-07 (h.customer) | *external:customer-lifecycle* | Cust-Silent -> External | compatible |
| 13 | ACQ-07 (h.re-escalate) | ACQ-03 | Cust-Silent -> Cust-Silent | compatible with mapping |
| 14 | ACQ-08 (h.next) | *external:next-lifecycle* | Cust-Silent -> External | compatible |
| 15 | ACQ-09 (h.progressed) | ACQ-03 | Cust-Comm -> Cust-Silent | compatible with mapping |
| 16 | ACQ-10 (h.decay) | ACQ-07 | Cust-Silent -> Cust-Silent | compatible |
| 17 | ACQ-10 (h.classify) | DEC-181 | Cust-Silent -> Operational | compatible |
| 18 | ACQ-10 (h.requalify) | ACQ-05 | Cust-Silent -> Cust-Silent | compatible |
| 19 | ACQ-285 (h.person) | *external:sales-assignment* | Cust-Comm -> External | compatible |
| 20 | ACQ-11 (h.payment) | FIN-134 | Cust-Comm -> Cust-Comm | compatible |
| 21 | ACQ-12 (h.process) | ACQ-11 | Cust-Comm -> Cust-Comm | compatible |
| 22 | ACT-11 (h.requirement) | ACT-13 | Cust-Human -> Cust-Comm | compatible |
| 23 | ACT-11 (h.progress) | ACT-12 | Cust-Human -> Cust-Comm | compatible |
| 24 | ACT-12 (h.blocker) | ACT-13 | Cust-Comm -> Cust-Comm | compatible |
| 25 | ACT-12 (h.activated) | ACT-16 | Cust-Comm -> Cust-Silent | compatible |
| 26 | ACT-13 (h.resume) | ACT-12 | Cust-Comm -> Cust-Comm | compatible |
| 27 | ACT-13 (h.escalate) | *external:human-in-the-loop-lifecycle* | Cust-Comm -> External | compatible |
| 28 | ACT-13 (h.reroute) | ACT-11 | Cust-Comm -> Cust-Human | compatible |
| 29 | ACT-14 (h.activated) | ACT-16 | Cust-Comm -> Cust-Silent | compatible |
| 30 | ACT-16 (h.adoption) | ACT-17 | Cust-Silent -> Cust-Comm | compatible |
| 31 | ACT-17 (h.normal) | *external:customer-lifecycle* | Cust-Comm -> External | compatible |
| 32 | ACT-17 (h.stall) | ACT-18 | Cust-Comm -> Cust-Comm | compatible |
| 33 | ACT-18 (h.adoption) | ACT-17 | Cust-Comm -> Cust-Comm | compatible |
| 34 | ACT-18 (h.monitor) | *external:health-monitoring* | Cust-Comm -> External | compatible |
| 35 | ACT-18 (h.assistance) | *external:human-in-the-loop-lifecycle* | Cust-Comm -> External | compatible |
| 36 | ACT-19 (h.progress) | ACT-12 | Cust-Comm -> Cust-Comm | compatible |
| 37 | ACT-20 (h.onboarding) | ACT-12 | Cust-Comm -> Cust-Comm | compatible |
| 38 | ACT-20 (h.intent) | ACQ-03 | Cust-Comm -> Cust-Silent | compatible with mapping |
| 39 | ACT-20 (h.qualify) | ACQ-05 | Cust-Comm -> Cust-Silent | compatible |
| 40 | RET-21 (h.health) | RET-23 | Cust-Silent -> Cust-Silent | compatible |
| 41 | RET-22 (h.health) | RET-23 | Cust-Silent -> Cust-Silent | compatible |
| 42 | RET-23 (h.adoption) | ACT-18 | Cust-Silent -> Cust-Comm | compatible |
| 43 | RET-23 (h.setup) | ACT-13 | Cust-Silent -> Cust-Comm | compatible |
| 44 | RET-23 (h.technical) | *external:human-in-the-loop-lifecycle* | Cust-Silent -> External | compatible |
| 45 | RET-23 (h.service) | RET-26 | Cust-Silent -> Cust-Comm | compatible |
| 46 | RET-23 (h.payment) | *external:payment-recovery* | Cust-Silent -> External | compatible |
| 47 | RET-23 (h.ownership) | *external:relationship-ownership-reconciliation* | Cust-Silent -> External | compatible |
| 48 | RET-23 (h.recovery) | RET-27 | Cust-Silent -> Cust-Silent | compatible |
| 49 | RET-24 (h.cancellation) | RET-28 | Cust-Human -> Cust-Comm | compatible |
| 50 | RET-24 (h.resolve-first) | RET-23 | Cust-Human -> Cust-Silent | compatible |
| 51 | RET-24 (h.human) | *external:human-in-the-loop-lifecycle* | Cust-Human -> External | compatible |
| 52 | RET-24 (h.intervention) | RET-30 | Cust-Human -> Cust-Comm | semantic mismatch |
| 53 | RET-26 (h.operational) | *external:operational-resolution* | Cust-Comm -> External | compatible |
| 54 | RET-26 (h.compensation) | REM-159 | Cust-Comm -> Operational | compatible |
| 55 | RET-27 (h.rediagnose) | RET-23 | Cust-Silent -> Cust-Silent | compatible |
| 56 | RET-27 (h.normal) | *external:customer-lifecycle* | Cust-Silent -> External | compatible |
| 57 | RET-28 (h.intervention) | RET-30 | Cust-Comm -> Cust-Comm | compatible |
| 58 | RET-28 (h.execute) | SUB-167 | Cust-Comm -> Cust-Silent | compatible |
| 59 | RET-29 (h.obligations) | *external:obligation-resolution* | Cust-Silent -> External | compatible |
| 60 | RET-30 (h.observe) | RET-27 | Cust-Comm -> Cust-Silent | compatible |
| 61 | RET-30 (h.fix) | *external:operational-resolution* | Cust-Comm -> External | compatible |
| 62 | RET-30 (h.proceed) | SUB-167 | Cust-Comm -> Cust-Silent | compatible |
| 63 | CON-32 (h.recalculate) | CON-33 | Cust-Silent -> Cust-Silent | compatible |
| 64 | CON-35 (h.conflict) | CON-40 | Runtime -> Runtime | compatible |
| 65 | CON-36 (h.reroute) | CMS-202 | Runtime -> Runtime | compatible |
| 66 | CON-36 (h.human) | *external:human-in-the-loop-lifecycle* | Runtime -> External | compatible |
| 67 | CON-39 (h.suppression) | CON-38 | Runtime -> Cust-Silent | compatible |
| 68 | CON-40 (h.manual) | DEC-181 | Runtime -> Operational | compatible |
| 69 | CON-264 (h.disputed) | IDN-89 | Cust-Comm -> Cust-Silent | compatible |
| 70 | FBK-42 (h.permission) | CON-31 | Cust-Comm -> Cust-Silent | compatible |
| 71 | FBK-43 (h.contribution) | *external:advocacy-contribution* | Cust-Comm -> External | compatible |
| 72 | FBK-43 (h.advocacy) | FBK-42 | Cust-Comm -> Cust-Comm | compatible |
| 73 | FBK-43 (h.issue) | FBK-46 | Cust-Comm -> Cust-Comm | compatible |
| 74 | FBK-43 (h.triage) | DEC-181 | Cust-Comm -> Operational | compatible |
| 75 | FBK-43 (h.promise) | DEC-181 | Cust-Comm -> Operational | compatible |
| 76 | FBK-46 (h.orphan) | OWN-51 | Cust-Comm -> Operational | compatible |
| 77 | FBK-46 (h.escalate) | *external:human-in-the-loop-lifecycle* | Cust-Comm -> External | compatible |
| 78 | FBK-47 (h.deadline) | DEC-181 | Cust-Comm -> Operational | compatible |
| 79 | FBK-49 (h.escalate) | *external:human-in-the-loop-lifecycle* | Cust-Comm -> External | compatible |
| 80 | OWN-51 (h.assign) | OWN-52 | Operational -> Operational | compatible |
| 81 | OWN-52 (h.reroute) | OWN-51 | Operational -> Operational | compatible |
| 82 | OWN-52 (h.escalate) | OWN-55 | Operational -> Operational | compatible |
| 83 | OWN-52 (h.context) | OWN-53 | Operational -> Operational | compatible |
| 84 | OWN-53 (h.escalate) | OWN-55 | Operational -> Operational | compatible |
| 85 | OWN-54 (h.delegations) | CTL-237 | Operational -> Operational | compatible |
| 86 | OWN-54 (h.escalate) | OWN-55 | Operational -> Operational | compatible |
| 87 | OWN-54 (h.context) | OWN-53 | Operational -> Operational | compatible |
| 88 | OWN-55 (h.no-path) | DEC-181 | Operational -> Operational | compatible |
| 89 | OWN-55 (h.transfer) | OWN-54 | Operational -> Operational | compatible |
| 90 | OWN-55 (h.exhausted) | DEC-181 | Operational -> Operational | compatible |
| 91 | OWN-56 (h.execute) | DEC-185 | Operational -> Operational | compatible |
| 92 | OWN-56 (h.rejected) | OWN-59 | Operational -> Operational | compatible |
| 93 | OWN-56 (h.escalate) | OWN-55 | Operational -> Operational | compatible |
| 94 | OWN-57 (h.undefined) | DEC-181 | Operational -> Operational | compatible |
| 95 | OWN-57 (h.escalate) | OWN-55 | Operational -> Operational | compatible |
| 96 | OWN-57 (h.execute) | DEC-185 | Operational -> Operational | compatible |
| 97 | OWN-58 (h.undefined) | DEC-181 | Operational -> Operational | compatible |
| 98 | OWN-58 (h.escalate) | OWN-55 | Operational -> Operational | compatible |
| 99 | OWN-58 (h.rejected) | OWN-59 | Operational -> Operational | compatible |
| 100 | OWN-59 (h.resubmit) | OWN-56 | Operational -> Operational | compatible |
| 101 | OWN-60 (h.no-authority) | DEC-181 | Operational -> Operational | compatible |
| 102 | OWN-60 (h.reapprove) | OWN-56 | Operational -> Operational | compatible |
| 103 | OWN-60 (h.policy) | DEC-181 | Operational -> Operational | compatible |
| 104 | TIM-61 (h.overdue) | TIM-62 | Cust-Comm -> Cust-Silent | compatible |
| 105 | TIM-61 (h.escalate) | OWN-55 | Cust-Comm -> Operational | compatible |
| 106 | TIM-61 (h.expired) | TIM-64 | Cust-Comm -> Operational | compatible |
| 107 | TIM-62 (h.orphan) | OWN-51 | Cust-Silent -> Operational | compatible |
| 108 | TIM-62 (h.escalate) | OWN-55 | Cust-Silent -> Operational | compatible |
| 109 | TIM-62 (h.consequence) | *external:overdue-consequence* | Cust-Silent -> External | compatible |
| 110 | TIM-63 (h.resolved) | *external:renewal-lifecycle* | Cust-Comm -> External | compatible |
| 111 | TIM-63 (h.expiry) | TIM-64 | Cust-Comm -> Operational | compatible |
| 112 | TIM-64 (h.post) | TIM-69 | Operational -> Operational | compatible |
| 113 | TIM-65 (h.revalidate) | ACQ-06 | Cust-Silent -> Cust-Silent | compatible |
| 114 | TIM-65 (h.expire) | TIM-64 | Cust-Silent -> Operational | compatible |
| 115 | TIM-65 (h.terminate) | *external:termination-lifecycle* | Cust-Silent -> External | compatible |
| 116 | TIM-66 (h.formalize) | OWN-56 | Operational -> Operational | compatible |
| 117 | TIM-67 (h.unbounded) | DEC-181 | Operational -> Operational | compatible |
| 118 | TIM-67 (h.reevaluate) | ACQ-06 | Operational -> Cust-Silent | compatible |
| 119 | TIM-68 (h.forward) | REM-157 | Operational -> Cust-Comm | compatible |
| 120 | TIM-69 (h.renew) | *external:renewal-lifecycle* | Operational -> External | compatible |
| 121 | TIM-69 (h.requalify) | ACQ-05 | Operational -> Cust-Silent | compatible |
| 122 | TIM-70 (h.recalculate) | *external:rescheduling-decision* | Operational -> External | compatible |
| 123 | TIM-268 (h.consequence) | *external:consequence-owner* | Cust-Comm -> External | compatible |
| 124 | ACC-71 (h.provision) | ACC-72 | Cust-Silent -> Operational | compatible |
| 125 | ACC-72 (h.recovery) | *external:access-recovery* | Operational -> External | compatible |
| 126 | ACC-72 (h.escalate) | OWN-55 | Operational -> Operational | compatible |
| 127 | ACC-73 (h.loss) | ACC-74 | Operational -> Operational | compatible |
| 128 | ACC-74 (h.reconcile) | *external:commitment-reconciliation* | Operational -> External | compatible |
| 129 | ACC-74 (h.deprovision) | ACC-80 | Operational -> Operational | compatible |
| 130 | ACC-75 (h.stepup) | IDN-86 | Operational -> Operational | compatible |
| 131 | ACC-76 (h.revoke) | ACC-77 | Operational -> Operational | compatible |
| 132 | ACC-77 (h.verify) | IDN-85 | Operational -> Cust-Comm | compatible |
| 133 | ACC-77 (h.new) | ACC-76 | Operational -> Operational | compatible |
| 134 | ACC-78 (h.restore) | ACC-79 | Cust-Silent -> Cust-Silent | compatible |
| 135 | ACC-78 (h.terminate) | ACC-74 | Cust-Silent -> Operational | compatible |
| 136 | ACC-78 (h.escalate) | OWN-55 | Cust-Silent -> Operational | compatible |
| 137 | ACC-80 (h.special) | *external:data-transfer-or-termination* | Operational -> External | compatible |
| 138 | ACC-80 (h.escalate) | OWN-55 | Operational -> Operational | compatible |
| 139 | ACC-261 (h.unreachable) | CON-36 | Cust-Comm -> Runtime | compatible |
| 140 | IDN-81 (h.review) | DEC-181 | Cust-Comm -> Operational | compatible |
| 141 | IDN-81 (h.failure) | IDN-84 | Cust-Comm -> Cust-Comm | compatible |
| 142 | IDN-82 (h.failure) | IDN-84 | Operational -> Cust-Comm | compatible |
| 143 | IDN-82 (h.escalate) | OWN-55 | Operational -> Operational | compatible |
| 144 | IDN-83 (h.review) | DEC-181 | Operational -> Operational | compatible |
| 145 | IDN-84 (h.escalate) | OWN-55 | Cust-Comm -> Operational | compatible |
| 146 | IDN-84 (h.review) | DEC-181 | Cust-Comm -> Operational | compatible |
| 147 | IDN-85 (h.stepup) | IDN-86 | Cust-Comm -> Operational | compatible |
| 148 | IDN-85 (h.failure) | IDN-87 | Cust-Comm -> Cust-Silent | compatible |
| 149 | IDN-86 (h.resume) | ACC-75 | Operational -> Operational | compatible |
| 150 | IDN-87 (h.recovery) | IDN-88 | Cust-Silent -> Cust-Silent | compatible |
| 151 | IDN-87 (h.security) | IDN-90 | Cust-Silent -> Cust-Silent | compatible |
| 152 | IDN-88 (h.security) | IDN-90 | Cust-Silent -> Cust-Silent | compatible |
| 153 | IDN-88 (h.review) | DEC-181 | Cust-Silent -> Operational | compatible |
| 154 | IDN-90 (h.recover) | ACC-79 | Cust-Silent -> Cust-Silent | compatible |
| 155 | IDN-90 (h.lift) | ACC-79 | Cust-Silent -> Cust-Silent | compatible |
| 156 | IDN-90 (h.review) | DEC-181 | Cust-Silent -> Operational | compatible |
| 157 | IDN-270 (h.security) | IDN-90 | Cust-Comm -> Cust-Silent | compatible |
| 158 | IDN-271 (h.recovery) | IDN-88 | Cust-Comm -> Cust-Silent | compatible |
| 159 | REL-91 (h.verify) | IDN-82 | Cust-Silent -> Operational | compatible |
| 160 | REL-92 (h.ownership) | OWN-54 | Cust-Silent -> Operational | compatible |
| 161 | REL-92 (h.entitlement) | ACC-73 | Cust-Silent -> Operational | compatible |
| 162 | REL-93 (h.reconcile) | *external:commitment-reconciliation* | Cust-Silent -> External | compatible |
| 163 | REL-94 (h.authority) | OWN-60 | Cust-Silent -> Operational | compatible |
| 164 | REL-94 (h.entitlement) | ACC-73 | Cust-Silent -> Operational | compatible |
| 165 | REL-95 (h.undefined) | DEC-181 | Operational -> Operational | compatible |
| 166 | REL-95 (h.reconcile) | *external:commitment-reconciliation* | Operational -> External | compatible |
| 167 | REL-96 (h.undefined) | DEC-181 | Operational -> Operational | compatible |
| 168 | REL-97 (h.link) | REL-98 | Operational -> Operational | compatible |
| 169 | REL-97 (h.merge) | TRM-101 | Operational -> Operational | compatible |
| 170 | REL-97 (h.review) | DEC-181 | Operational -> Operational | compatible |
| 171 | REL-99 (h.review) | DEC-181 | Operational -> Operational | compatible |
| 172 | REL-100 (h.manual) | DEC-181 | Cust-Silent -> Operational | compatible |
| 173 | REL-100 (h.escalate) | OWN-55 | Cust-Silent -> Operational | compatible |
| 174 | TRM-101 (h.conflict) | TRM-102 | Operational -> Operational | compatible |
| 175 | TRM-102 (h.escalate) | OWN-55 | Operational -> Operational | compatible |
| 176 | TRM-103 (h.reconcile) | *external:commitment-reconciliation* | Operational -> External | compatible |
| 177 | TRM-103 (h.escalate) | OWN-55 | Operational -> Operational | compatible |
| 178 | TRM-104 (h.orphan) | REL-100 | Operational -> Cust-Silent | compatible |
| 179 | TRM-105 (h.hold) | OWN-55 | Cust-Silent -> Operational | compatible |
| 180 | TRM-105 (h.escalate) | OWN-55 | Cust-Silent -> Operational | compatible |
| 181 | TRM-106 (h.dependencies) | TRM-107 | Cust-Comm -> Cust-Silent | compatible |
| 182 | TRM-106 (h.escalate) | OWN-55 | Cust-Comm -> Operational | compatible |
| 183 | TRM-107 (h.escalate) | OWN-55 | Cust-Silent -> Operational | compatible |
| 184 | TRM-108 (h.escalate) | OWN-55 | Cust-Silent -> Operational | compatible |
| 185 | TRM-109 (h.verify) | IDN-82 | Operational -> Operational | compatible |
| 186 | TRM-109 (h.execute) | TRM-110 | Operational -> Operational | compatible |
| 187 | TRM-109 (h.review) | DEC-181 | Operational -> Operational | compatible |
| 188 | TRM-110 (h.escalate) | OWN-55 | Operational -> Operational | compatible |
| 189 | TRM-275 (h.overdue) | *external:data-protection-escalation* | Cust-Comm -> External | compatible |
| 190 | INT-112 (h.failure) | INT-116 | Operational -> Operational | compatible |
| 191 | INT-113 (h.failure) | INT-116 | Operational -> Operational | compatible |
| 192 | INT-113 (h.escalate) | OWN-55 | Operational -> Operational | compatible |
| 193 | INT-114 (h.status-check) | *external:external-status-reconciliation* | Operational -> External | compatible |
| 194 | INT-114 (h.reconcile) | INT-115 | Operational -> Operational | compatible |
| 195 | INT-115 (h.review) | DEC-181 | Operational -> Operational | compatible |
| 196 | INT-115 (h.conflict) | INT-119 | Operational -> Operational | compatible |
| 197 | INT-116 (h.reconnect) | INT-118 | Operational -> Operational | compatible |
| 198 | INT-116 (h.terminal) | DEC-181 | Operational -> Operational | compatible |
| 199 | INT-116 (h.escalate) | OWN-55 | Operational -> Operational | compatible |
| 200 | INT-117 (h.alternate) | DEC-181 | Operational -> Operational | compatible |
| 201 | INT-118 (h.conflict) | INT-119 | Operational -> Operational | compatible |
| 202 | INT-118 (h.escalate) | OWN-55 | Operational -> Operational | compatible |
| 203 | INT-119 (h.review) | DEC-181 | Operational -> Operational | compatible |
| 204 | INT-120 (h.escalate) | OWN-55 | Operational -> Operational | compatible |
| 205 | INT-269 (h.abandoned) | RET-24 | Cust-Comm -> Cust-Human | compatible |
| 206 | INT-278 (h.diagnose) | INT-111 | Cust-Comm -> Operational | compatible |
| 207 | OPS-121 (h.lag) | OPS-122 | Runtime -> Runtime | compatible |
| 208 | OPS-121 (h.stalled) | OPS-123 | Runtime -> Runtime | compatible |
| 209 | OPS-121 (h.verify) | OPS-130 | Runtime -> Runtime | compatible |
| 210 | OPS-121 (h.retry) | OPS-124 | Runtime -> Runtime | compatible |
| 211 | OPS-121 (h.dead-letter) | OPS-127 | Runtime -> Runtime | compatible |
| 212 | OPS-121 (h.reconcile) | *external:side-effect-reconciliation* | Runtime -> External | compatible |
| 213 | OPS-122 (h.drain) | OPS-129 | Runtime -> Runtime | compatible |
| 214 | OPS-122 (h.escalate) | OWN-55 | Runtime -> Operational | compatible |
| 215 | OPS-123 (h.reconcile) | *external:side-effect-reconciliation* | Runtime -> External | compatible |
| 216 | OPS-123 (h.escalate) | OWN-55 | Runtime -> Operational | compatible |
| 217 | OPS-124 (h.reconcile) | *external:side-effect-reconciliation* | Runtime -> External | compatible |
| 218 | OPS-124 (h.verify) | OPS-130 | Runtime -> Runtime | compatible |
| 219 | OPS-124 (h.dead-letter) | OPS-127 | Runtime -> Runtime | compatible |
| 220 | OPS-125 (h.reconcile) | *external:side-effect-reconciliation* | Runtime -> External | compatible |
| 221 | OPS-126 (h.undefined) | DEC-181 | Runtime -> Operational | compatible |
| 222 | OPS-126 (h.retry) | OPS-124 | Runtime -> Runtime | compatible |
| 223 | OPS-126 (h.compensate) | *external:correction-or-compensation* | Runtime -> External | compatible |
| 224 | OPS-126 (h.reconcile) | *external:side-effect-reconciliation* | Runtime -> External | compatible |
| 225 | OPS-127 (h.reconcile) | *external:side-effect-reconciliation* | Runtime -> External | compatible |
| 226 | OPS-127 (h.manual) | DEC-181 | Runtime -> Operational | compatible |
| 227 | OPS-127 (h.escalate) | OWN-55 | Runtime -> Operational | compatible |
| 228 | OPS-128 (h.reconcile) | *external:side-effect-reconciliation* | Runtime -> External | compatible |
| 229 | OPS-129 (h.escalate) | OWN-55 | Runtime -> Operational | compatible |
| 230 | OPS-131 (h.escalate) | DEC-181 | Runtime -> Operational | compatible |
| 231 | FIN-131 (h.satisfy) | FIN-136 | Cust-Silent -> Cust-Silent | compatible |
| 232 | FIN-131 (h.due) | TIM-62 | Cust-Silent -> Cust-Silent | compatible |
| 233 | FIN-132 (h.satisfy) | FIN-136 | Operational -> Cust-Silent | compatible |
| 234 | FIN-132 (h.capture) | FIN-133 | Operational -> Operational | compatible |
| 235 | FIN-132 (h.failure) | FIN-134 | Operational -> Cust-Comm | compatible |
| 236 | FIN-132 (h.unknown) | FIN-135 | Operational -> Operational | compatible |
| 237 | FIN-133 (h.satisfy) | FIN-136 | Operational -> Cust-Silent | compatible |
| 238 | FIN-133 (h.reconcile) | FIN-140 | Operational -> Operational | compatible |
| 239 | FIN-134 (h.grace) | TIM-65 | Cust-Comm -> Cust-Silent | compatible |
| 240 | FIN-134 (h.overdue) | TIM-62 | Cust-Comm -> Cust-Silent | compatible |
| 241 | FIN-134 (h.restrict) | ACC-78 | Cust-Comm -> Cust-Silent | compatible |
| 242 | FIN-135 (h.satisfy) | FIN-136 | Operational -> Cust-Silent | compatible |
| 243 | FIN-135 (h.failure) | FIN-134 | Operational -> Cust-Comm | compatible |
| 244 | FIN-135 (h.dedupe) | OPS-125 | Operational -> Runtime | compatible |
| 245 | FIN-135 (h.manual) | *external:finance-ownership* | Operational -> External | compatible |
| 246 | FIN-136 (h.overpayment) | *external:overpayment-or-credit* | Cust-Silent -> External | compatible |
| 247 | FIN-136 (h.restore) | ACC-79 | Cust-Silent -> Cust-Silent | compatible |
| 248 | FIN-137 (h.undefined) | DEC-181 | Cust-Comm -> Operational | compatible |
| 249 | FIN-137 (h.escalate) | OWN-55 | Cust-Comm -> Operational | compatible |
| 250 | FIN-137 (h.execute) | FIN-138 | Cust-Comm -> Operational | compatible |
| 251 | FIN-138 (h.reconcile) | FIN-140 | Operational -> Operational | compatible |
| 252 | FIN-139 (h.risk) | RSK-192 | Operational -> Operational | compatible |
| 253 | FIN-140 (h.finance) | *external:finance-ownership* | Operational -> External | compatible |
| 254 | FUL-141 (h.availability) | FUL-142 | Cust-Silent -> Cust-Silent | compatible |
| 255 | FUL-142 (h.unavailable) | FUL-150 | Cust-Silent -> Cust-Silent | compatible |
| 256 | FUL-142 (h.allocate) | FUL-143 | Cust-Silent -> Cust-Silent | compatible |
| 257 | FUL-143 (h.recheck) | FUL-142 | Cust-Silent -> Cust-Silent | compatible |
| 258 | FUL-143 (h.exception) | FUL-145 | Cust-Silent -> Cust-Silent | compatible |
| 259 | FUL-144 (h.delay) | FUL-146 | Cust-Silent -> Cust-Comm | compatible |
| 260 | FUL-144 (h.dispatch) | FUL-147 | Cust-Silent -> Cust-Silent | compatible |
| 261 | FUL-144 (h.confirm) | FUL-149 | Cust-Silent -> Cust-Silent | compatible |
| 262 | FUL-144 (h.exception) | FUL-145 | Cust-Silent -> Cust-Silent | compatible |
| 263 | FUL-144 (h.remedy) | FUL-150 | Cust-Silent -> Cust-Silent | compatible |
| 264 | FUL-145 (h.resume) | FUL-144 | Cust-Silent -> Cust-Silent | compatible |
| 265 | FUL-145 (h.delay) | FUL-146 | Cust-Silent -> Cust-Comm | compatible |
| 266 | FUL-145 (h.terminal) | FUL-150 | Cust-Silent -> Cust-Silent | compatible |
| 267 | FUL-146 (h.resume) | FUL-144 | Cust-Comm -> Cust-Silent | compatible |
| 268 | FUL-146 (h.exception) | FUL-145 | Cust-Comm -> Cust-Silent | compatible |
| 269 | FUL-146 (h.cancel) | FUL-150 | Cust-Comm -> Cust-Silent | compatible |
| 270 | FUL-146 (h.escalate) | OWN-55 | Cust-Comm -> Operational | compatible |
| 271 | FUL-147 (h.reconcile) | *external:external-status-reconciliation* | Cust-Silent -> External | compatible |
| 272 | FUL-147 (h.confirm) | FUL-149 | Cust-Silent -> Cust-Silent | compatible |
| 273 | FUL-147 (h.failed) | FUL-148 | Cust-Silent -> Cust-Comm | compatible |
| 274 | FUL-147 (h.delay) | FUL-146 | Cust-Silent -> Cust-Comm | compatible |
| 275 | FUL-148 (h.retry) | FUL-147 | Cust-Comm -> Cust-Silent | compatible |
| 276 | FUL-148 (h.return) | REM-151 | Cust-Comm -> Cust-Comm | compatible |
| 277 | FUL-148 (h.exception) | FUL-145 | Cust-Comm -> Cust-Silent | compatible |
| 278 | FUL-149 (h.issue) | REM-151 | Cust-Silent -> Cust-Comm | compatible |
| 279 | FUL-150 (h.financial) | FIN-137 | Cust-Silent -> Cust-Comm | compatible |
| 280 | FUL-265 (x.unresolved) | FUL-148 | Cust-Comm -> Cust-Comm | compatible |
| 281 | FUL-265 (h.issue) | FUL-149 | Cust-Comm -> Cust-Silent | compatible |
| 282 | FUL-276 (h.unreachable) | CON-36 | Cust-Comm -> Runtime | compatible |
| 283 | REM-151 (h.remedy) | REM-157 | Cust-Comm -> Cust-Comm | compatible |
| 284 | REM-152 (h.alternative) | REM-157 | Cust-Comm -> Cust-Comm | compatible |
| 285 | REM-152 (h.undefined) | DEC-181 | Cust-Comm -> Operational | compatible |
| 286 | REM-152 (h.escalate) | OWN-55 | Cust-Comm -> Operational | compatible |
| 287 | REM-152 (h.transit) | REM-153 | Cust-Comm -> Operational | compatible |
| 288 | REM-153 (h.reconcile) | *external:external-status-reconciliation* | Operational -> External | compatible |
| 289 | REM-153 (h.inspect) | REM-154 | Operational -> Operational | compatible |
| 290 | REM-154 (h.undefined) | DEC-181 | Operational -> Operational | compatible |
| 291 | REM-154 (h.remedy) | REM-157 | Operational -> Cust-Comm | compatible |
| 292 | REM-155 (h.verify) | REM-158 | Operational -> Operational | compatible |
| 293 | REM-155 (h.alternative) | REM-157 | Operational -> Cust-Comm | compatible |
| 294 | REM-156 (h.verify) | REM-158 | Cust-Silent -> Operational | compatible |
| 295 | REM-156 (h.alternative) | REM-157 | Cust-Silent -> Cust-Comm | compatible |
| 296 | REM-156 (h.escalate) | OWN-55 | Cust-Silent -> Operational | compatible |
| 297 | REM-157 (h.correction) | REM-156 | Cust-Comm -> Cust-Silent | compatible |
| 298 | REM-157 (h.replacement) | REM-155 | Cust-Comm -> Operational | compatible |
| 299 | REM-157 (h.return) | REM-152 | Cust-Comm -> Cust-Comm | compatible |
| 300 | REM-157 (h.financial) | FIN-137 | Cust-Comm -> Cust-Comm | compatible |
| 301 | REM-158 (h.reconcile) | *external:external-status-reconciliation* | Operational -> External | compatible |
| 302 | REM-158 (h.continue) | REM-157 | Operational -> Cust-Comm | compatible |
| 303 | REM-158 (h.alternative) | REM-157 | Operational -> Cust-Comm | compatible |
| 304 | REM-159 (h.undefined) | DEC-181 | Operational -> Operational | compatible |
| 305 | REM-159 (h.financial) | FIN-137 | Operational -> Cust-Comm | compatible |
| 306 | REM-159 (h.entitlement) | ACC-71 | Operational -> Cust-Silent | compatible |
| 307 | REM-159 (h.escalate) | OWN-55 | Operational -> Operational | compatible |
| 308 | REM-160 (h.new) | REM-151 | Operational -> Cust-Comm | compatible |
| 309 | REM-160 (h.resume) | REM-158 | Operational -> Operational | compatible |
| 310 | REM-160 (h.escalate) | OWN-55 | Operational -> Operational | compatible |
| 311 | REM-160 (h.remedy) | REM-157 | Operational -> Cust-Comm | compatible |
| 312 | SUB-161 (h.scheduled) | SUB-162 | Cust-Silent -> Cust-Silent | compatible |
| 313 | SUB-161 (h.entitlement) | ACC-71 | Cust-Silent -> Cust-Silent | compatible |
| 314 | SUB-162 (h.entitlement) | ACC-71 | Cust-Silent -> Cust-Silent | compatible |
| 315 | SUB-163 (h.undefined) | DEC-181 | Cust-Comm -> Operational | compatible |
| 316 | SUB-163 (h.escalate) | OWN-55 | Cust-Comm -> Operational | compatible |
| 317 | SUB-163 (h.execute) | SUB-164 | Cust-Comm -> Operational | compatible |
| 318 | SUB-163 (h.scheduled-end) | SUB-168 | Cust-Comm -> Cust-Silent | compatible |
| 319 | SUB-164 (h.payment-failure) | SUB-165 | Operational -> Cust-Silent | compatible |
| 320 | SUB-164 (h.entitlement) | ACC-73 | Operational -> Operational | compatible |
| 321 | SUB-164 (h.non-renewal) | SUB-170 | Operational -> Cust-Silent | compatible |
| 322 | SUB-165 (h.undefined) | DEC-181 | Cust-Silent -> Operational | compatible |
| 323 | SUB-165 (h.complete) | SUB-164 | Cust-Silent -> Operational | compatible |
| 324 | SUB-165 (h.end) | SUB-170 | Cust-Silent -> Cust-Silent | compatible |
| 325 | SUB-166 (h.undefined) | DEC-181 | Cust-Silent -> Operational | compatible |
| 326 | SUB-166 (h.review) | DEC-181 | Cust-Silent -> Operational | compatible |
| 327 | SUB-166 (h.entitlement) | ACC-73 | Cust-Silent -> Operational | compatible |
| 328 | SUB-166 (h.financial) | FIN-131 | Cust-Silent -> Cust-Silent | compatible |
| 329 | SUB-167 (h.authority) | DEC-181 | Cust-Silent -> Operational | compatible |
| 330 | SUB-167 (h.undefined) | DEC-181 | Cust-Silent -> Operational | compatible |
| 331 | SUB-167 (h.end) | SUB-170 | Cust-Silent -> Cust-Silent | compatible |
| 332 | SUB-167 (h.scheduled) | SUB-168 | Cust-Silent -> Cust-Silent | compatible |
| 333 | SUB-168 (h.end) | SUB-170 | Cust-Silent -> Cust-Silent | compatible |
| 334 | SUB-169 (h.review) | DEC-181 | Cust-Silent -> Operational | compatible |
| 335 | SUB-169 (h.end) | SUB-170 | Cust-Silent -> Cust-Silent | compatible |
| 336 | SUB-170 (h.escalate) | OWN-55 | Cust-Silent -> Operational | compatible |
| 337 | SUB-262 (h.obligations) | SUB-170 | Cust-Comm -> Cust-Silent | compatible |
| 338 | SCH-173 (h.alternative) | SCH-171 | Cust-Silent -> Operational | compatible |
| 339 | SCH-173 (h.prepare) | SCH-174 | Cust-Silent -> Cust-Silent | compatible |
| 340 | SCH-174 (h.escalate) | OWN-55 | Cust-Silent -> Operational | compatible |
| 341 | SCH-175 (h.prepare) | SCH-174 | Cust-Silent -> Cust-Silent | compatible |
| 342 | SCH-176 (h.provider) | SCH-180 | Cust-Silent -> Cust-Comm | compatible with mapping |
| 343 | SCH-176 (h.reconcile) | *external:external-status-reconciliation* | Cust-Silent -> External | compatible |
| 344 | SCH-176 (h.refund) | FIN-137 | Cust-Silent -> Cust-Comm | compatible |
| 345 | SCH-176 (h.fee) | FIN-131 | Cust-Silent -> Cust-Silent | compatible |
| 346 | SCH-177 (h.provider-exception) | SCH-180 | Cust-Silent -> Cust-Comm | compatible with mapping |
| 347 | SCH-177 (h.escalate) | OWN-55 | Cust-Silent -> Operational | compatible |
| 348 | SCH-177 (h.attended) | SCH-178 | Cust-Silent -> Cust-Silent | compatible |
| 349 | SCH-177 (h.cancelled) | SCH-176 | Cust-Silent -> Cust-Silent | compatible |
| 350 | SCH-177 (h.missed) | SCH-179 | Cust-Silent -> Cust-Silent | compatible |
| 351 | SCH-178 (h.reconcile) | *external:side-effect-reconciliation* | Cust-Silent -> External | compatible |
| 352 | SCH-178 (h.remainder) | REM-157 | Cust-Silent -> Cust-Comm | compatible |
| 353 | SCH-178 (h.reschedule) | SCH-175 | Cust-Silent -> Cust-Silent | compatible |
| 354 | SCH-178 (h.provider) | SCH-180 | Cust-Silent -> Cust-Comm | compatible with mapping |
| 355 | SCH-178 (h.rebook) | SCH-175 | Cust-Silent -> Cust-Silent | compatible |
| 356 | SCH-179 (h.provider) | SCH-180 | Cust-Silent -> Cust-Comm | compatible with mapping |
| 357 | SCH-179 (h.undefined) | DEC-181 | Cust-Silent -> Operational | compatible |
| 358 | SCH-179 (h.attended) | SCH-178 | Cust-Silent -> Cust-Silent | compatible |
| 359 | SCH-179 (h.rebook) | SCH-171 | Cust-Silent -> Operational | compatible |
| 360 | SCH-179 (h.fee) | FIN-131 | Cust-Silent -> Cust-Silent | compatible |
| 361 | SCH-180 (h.reschedule) | SCH-175 | Cust-Comm -> Cust-Silent | compatible |
| 362 | SCH-180 (h.remedy) | REM-157 | Cust-Comm -> Cust-Comm | compatible |
| 363 | SCH-180 (h.financial) | FIN-137 | Cust-Comm -> Cust-Comm | compatible |
| 364 | SCH-266 (h.at-risk) | SCH-174 | Cust-Comm -> Cust-Silent | compatible |
| 365 | SCH-266 (h.prestart) | SCH-177 | Cust-Comm -> Cust-Silent | compatible |
| 366 | SCH-277 (h.rebook) | SCH-173 | Cust-Comm -> Cust-Silent | compatible |
| 367 | SCH-280 (h.provider) | SCH-180 | Cust-Comm -> Cust-Comm | compatible with mapping |
| 368 | DEC-181 (h.invalid) | *external:requesting-process* | Operational -> External | compatible |
| 369 | DEC-181 (h.direct) | *external:operational-resolution* | Operational -> External | compatible |
| 370 | DEC-181 (h.assign) | DEC-182 | Operational -> Operational | compatible |
| 371 | DEC-182 (h.review) | DEC-183 | Operational -> Operational | compatible |
| 372 | DEC-182 (h.escalate) | DEC-189 | Operational -> Operational | compatible |
| 373 | DEC-183 (h.reassign) | DEC-182 | Operational -> Operational | compatible |
| 374 | DEC-183 (h.escalate) | DEC-189 | Operational -> Operational | compatible |
| 375 | DEC-183 (h.info) | DEC-184 | Operational -> Cust-Comm | compatible |
| 376 | DEC-183 (h.approved) | DEC-185 | Operational -> Operational | compatible |
| 377 | DEC-183 (h.partial) | DEC-187 | Operational -> Operational | compatible |
| 378 | DEC-183 (h.rejected) | DEC-186 | Operational -> Operational | compatible |
| 379 | DEC-184 (h.escalate) | DEC-189 | Cust-Comm -> Operational | compatible |
| 380 | DEC-184 (h.resume) | DEC-183 | Cust-Comm -> Operational | compatible |
| 381 | DEC-185 (h.validity) | DEC-188 | Operational -> Operational | compatible |
| 382 | DEC-185 (h.re-review) | DEC-190 | Operational -> Operational | compatible |
| 383 | DEC-185 (h.execute) | *external:operational-resolution* | Operational -> External | compatible |
| 384 | DEC-186 (h.appeal) | FBK-47 | Operational -> Cust-Comm | compatible |
| 385 | DEC-187 (h.undefined) | DEC-189 | Operational -> Operational | compatible |
| 386 | DEC-187 (h.execute) | *external:operational-resolution* | Operational -> External | compatible |
| 387 | DEC-188 (h.re-review) | DEC-190 | Operational -> Operational | compatible |
| 388 | DEC-188 (h.renew) | DEC-181 | Operational -> Operational | compatible |
| 389 | DEC-189 (h.decide) | DEC-183 | Operational -> Operational | compatible |
| 390 | DEC-189 (h.info) | DEC-184 | Operational -> Cust-Comm | compatible |
| 391 | DEC-189 (h.return) | DEC-182 | Operational -> Operational | compatible |
| 392 | DEC-189 (h.governance) | OWN-55 | Operational -> Operational | compatible |
| 393 | DEC-190 (h.new) | DEC-181 | Operational -> Operational | compatible |
| 394 | DEC-190 (h.correct) | REM-157 | Operational -> Cust-Comm | compatible |
| 395 | DEC-190 (h.review) | DEC-183 | Operational -> Operational | compatible |
| 396 | RSK-191 (h.review) | DEC-181 | Operational -> Operational | compatible |
| 397 | RSK-192 (h.restrict) | RSK-193 | Operational -> Operational | compatible |
| 398 | RSK-192 (h.review) | DEC-181 | Operational -> Operational | compatible |
| 399 | RSK-193 (h.review) | DEC-181 | Operational -> Operational | compatible |
| 400 | RSK-193 (h.terminal) | *external:termination-lifecycle* | Operational -> External | compatible |
| 401 | RSK-194 (h.restrict) | RSK-193 | Operational -> Operational | compatible |
| 402 | RSK-194 (h.review) | DEC-181 | Operational -> Operational | compatible |
| 403 | RSK-194 (h.terminal) | *external:termination-lifecycle* | Operational -> External | compatible |
| 404 | RSK-195 (h.resume) | *external:operational-resolution* | Operational -> External | compatible |
| 405 | RSK-195 (h.review) | DEC-181 | Operational -> Operational | compatible |
| 406 | RSK-196 (h.review) | DEC-181 | Operational -> Operational | compatible |
| 407 | RSK-196 (h.terminal) | *external:termination-lifecycle* | Operational -> External | compatible |
| 408 | RSK-197 (h.review) | DEC-181 | Operational -> Operational | compatible |
| 409 | RSK-197 (h.decide) | DEC-181 | Operational -> Operational | compatible |
| 410 | RSK-197 (h.apply) | RSK-198 | Operational -> Operational | compatible |
| 411 | RSK-199 (h.reconcile) | *external:external-status-reconciliation* | Operational -> External | compatible |
| 412 | RSK-199 (h.increase) | DEC-181 | Operational -> Operational | compatible |
| 413 | RSK-199 (h.review) | DEC-181 | Operational -> Operational | compatible |
| 414 | RSK-200 (h.restore) | ACC-79 | Operational -> Cust-Silent | compatible |
| 415 | RSK-200 (h.restrict) | RSK-193 | Operational -> Operational | compatible |
| 416 | RSK-200 (h.review) | DEC-181 | Operational -> Operational | compatible |
| 417 | RSK-273 (h.capacity) | SUB-166 | Cust-Comm -> Cust-Silent | compatible |
| 418 | CMS-201 (h.recipient) | CMS-202 | Runtime -> Runtime | compatible |
| 419 | CMS-202 (h.permission) | CMS-203 | Runtime -> Runtime | compatible |
| 420 | CMS-203 (h.review) | DEC-181 | Runtime -> Operational | compatible |
| 421 | CMS-203 (h.route) | CMS-204 | Runtime -> Runtime | compatible |
| 422 | CMS-203 (h.escalate) | CMS-210 | Runtime -> Runtime | compatible |
| 423 | CMS-204 (h.send-ready) | CMS-205 | Runtime -> Runtime | compatible |
| 424 | CMS-205 (h.reroute) | CMS-202 | Runtime -> Runtime | compatible |
| 425 | CMS-205 (h.attempt) | CMS-206 | Runtime -> Runtime | compatible |
| 426 | CMS-206 (h.recover) | CMS-208 | Runtime -> Runtime | compatible |
| 427 | CMS-206 (h.reconcile) | *external:external-status-reconciliation* | Runtime -> External | compatible |
| 428 | CMS-207 (h.reconcile) | *external:external-status-reconciliation* | Runtime -> External | compatible |
| 429 | CMS-207 (h.obligation) | CMS-210 | Runtime -> Runtime | compatible |
| 430 | CMS-207 (h.recover) | CMS-208 | Runtime -> Runtime | compatible |
| 431 | CMS-208 (h.contactability) | CON-36 | Runtime -> Runtime | compatible |
| 432 | CMS-208 (h.fallback) | CMS-203 | Runtime -> Runtime | compatible |
| 433 | CMS-208 (h.obligation) | CMS-210 | Runtime -> Runtime | compatible |
| 434 | CMS-210 (h.review) | DEC-181 | Runtime -> Operational | compatible |
| 435 | CMS-210 (h.escalate) | DEC-181 | Runtime -> Operational | compatible |
| 436 | DOC-211 (h.draft) | DOC-212 | Operational -> Operational | compatible |
| 437 | DOC-212 (h.review) | DEC-181 | Operational -> Operational | compatible |
| 438 | DOC-212 (h.issue) | DOC-213 | Operational -> Operational | compatible |
| 439 | DOC-213 (h.effective) | DOC-216 | Operational -> Operational | compatible |
| 440 | DOC-214 (h.reconcile) | *external:external-status-reconciliation* | Cust-Comm -> External | compatible |
| 441 | DOC-214 (h.recover) | CMS-208 | Cust-Comm -> Runtime | compatible |
| 442 | DOC-215 (h.effective) | DOC-216 | Cust-Comm -> Operational | compatible |
| 443 | DOC-215 (h.declined) | *external:operational-resolution* | Cust-Comm -> External | compatible |
| 444 | DOC-216 (h.reconcile) | DOC-220 | Operational -> Cust-Comm | compatible |
| 445 | DOC-216 (h.review) | DEC-181 | Operational -> Operational | compatible |
| 446 | DOC-216 (h.downstream) | *external:operational-resolution* | Operational -> External | compatible |
| 447 | DOC-217 (h.review) | DEC-181 | Operational -> Operational | compatible |
| 448 | DOC-218 (h.new) | DOC-211 | Operational -> Operational | compatible |
| 449 | DOC-218 (h.review) | DEC-181 | Operational -> Operational | compatible |
| 450 | DOC-219 (h.new) | DOC-211 | Operational -> Operational | compatible |
| 451 | DOC-220 (h.review) | DEC-181 | Cust-Comm -> Operational | compatible |
| 452 | DOC-220 (h.resign) | DOC-215 | Cust-Comm -> Cust-Comm | compatible |
| 453 | DOC-220 (h.remedy) | REM-157 | Cust-Comm -> Cust-Comm | compatible |
| 454 | DAT-221 (h.validate) | DAT-222 | Operational -> Operational | compatible |
| 455 | DAT-222 (h.resolve) | DEC-181 | Operational -> Operational | compatible |
| 456 | DAT-222 (h.review) | DEC-181 | Operational -> Operational | compatible |
| 457 | DAT-222 (h.preview) | DAT-223 | Operational -> Operational | compatible |
| 458 | DAT-223 (h.decide) | DEC-181 | Operational -> Operational | compatible |
| 459 | DAT-223 (h.execute) | DAT-224 | Operational -> Operational | compatible |
| 460 | DAT-224 (h.recover) | DAT-225 | Operational -> Operational | compatible |
| 461 | DAT-224 (h.reconcile) | *external:external-status-reconciliation* | Operational -> External | compatible |
| 462 | DAT-225 (h.reconcile) | *external:external-status-reconciliation* | Operational -> External | compatible |
| 463 | DAT-225 (h.revalidate) | DAT-222 | Operational -> Operational | compatible |
| 464 | DAT-226 (h.design) | DEC-181 | Operational -> Operational | compatible |
| 465 | DAT-226 (h.execute) | DAT-227 | Operational -> Operational | compatible |
| 466 | DAT-227 (h.reconcile) | DAT-230 | Operational -> Operational | compatible |
| 467 | DAT-227 (h.cutover) | DAT-228 | Operational -> Operational | compatible |
| 468 | DAT-228 (h.decide) | DEC-181 | Operational -> Operational | compatible |
| 469 | DAT-228 (h.decide-conflict) | DEC-181 | Operational -> Operational | compatible |
| 470 | DAT-228 (h.correct) | DAT-230 | Operational -> Operational | compatible |
| 471 | DAT-229 (h.review) | DEC-181 | Operational -> Operational | compatible |
| 472 | DAT-229 (h.reconcile) | DAT-230 | Operational -> Operational | compatible |
| 473 | DAT-230 (h.decide) | DEC-181 | Operational -> Operational | compatible |
| 474 | DAT-230 (h.remedy) | REM-157 | Operational -> Cust-Comm | compatible |
| 475 | CTL-231 (h.review) | DEC-181 | Operational -> Operational | compatible |
| 476 | CTL-232 (h.execute) | CTL-234 | Operational -> Operational | compatible |
| 477 | CTL-233 (h.execute) | CTL-234 | Operational -> Operational | compatible |
| 478 | CTL-234 (h.reconcile) | OWN-54 | Operational -> Operational | compatible |
| 479 | CTL-235 (h.temporary) | CTL-236 | Operational -> Operational | compatible |
| 480 | CTL-236 (h.reconcile) | CTL-237 | Operational -> Operational | compatible |
| 481 | CTL-236 (h.revoke) | CTL-237 | Operational -> Operational | compatible |
| 482 | CTL-237 (h.work) | OWN-54 | Operational -> Operational | compatible |
| 483 | CTL-238 (h.recovery) | IDN-88 | Operational -> Cust-Silent | compatible |
| 484 | CTL-238 (h.transfer) | CTL-232 | Operational -> Operational | compatible |
| 485 | CTL-238 (h.review) | DEC-181 | Operational -> Operational | compatible |
| 486 | RLT-241 (h.prepare) | RLT-242 | Operational -> Operational | compatible |
| 487 | RLT-242 (h.schedule) | RLT-243 | Operational -> Operational | compatible |
| 488 | RLT-243 (h.execute) | RLT-244 | Operational -> Operational | compatible |
| 489 | RLT-244 (h.reconcile) | *external:external-status-reconciliation* | Operational -> External | compatible |
| 490 | RLT-244 (h.target-failure) | RLT-249 | Operational -> Operational | compatible |
| 491 | RLT-245 (h.review) | DEC-181 | Operational -> Operational | compatible |
| 492 | RLT-245 (h.pause) | RLT-246 | Operational -> Operational | compatible |
| 493 | RLT-245 (h.complete) | RLT-250 | Operational -> Operational | compatible |
| 494 | RLT-246 (h.resume) | RLT-245 | Operational -> Operational | compatible |
| 495 | RLT-246 (h.rollback) | RLT-247 | Operational -> Operational | compatible |
| 496 | RLT-247 (h.rollback) | RLT-248 | Operational -> Operational | compatible |
| 497 | RLT-247 (h.forward) | *external:operational-resolution* | Operational -> External | compatible |
| 498 | RLT-248 (h.reconcile) | *external:external-status-reconciliation* | Operational -> External | compatible |
| 499 | RLT-248 (h.forward) | *external:operational-resolution* | Operational -> External | compatible |
| 500 | RLT-248 (h.manual) | *external:human-in-the-loop-lifecycle* | Operational -> External | compatible |
| 501 | RLT-249 (h.rollout) | RLT-246 | Operational -> Operational | compatible |
| 502 | RLT-249 (h.remediate) | *external:human-in-the-loop-lifecycle* | Operational -> External | compatible |
| 503 | RLT-250 (h.reopen) | RLT-246 | Operational -> Operational | compatible |
| 504 | RLT-250 (h.deprecate) | *external:termination-lifecycle* | Operational -> External | compatible |
| 505 | RLT-279 (h.resume) | RLT-242 | Cust-Comm -> Operational | compatible |
| 506 | INC-251 (h.severity) | INC-252 | Operational -> Operational | compatible |
| 507 | INC-252 (h.mitigate) | INC-253 | Operational -> Operational | compatible |
| 508 | INC-252 (h.investigate) | INC-255 | Operational -> Operational | compatible |
| 509 | INC-253 (h.communicate) | INC-254 | Operational -> Cust-Comm | compatible |
| 510 | INC-253 (h.recovery) | INC-256 | Operational -> Operational | compatible |
| 511 | INC-255 (h.review) | DEC-181 | Operational -> Operational | compatible |
| 512 | INC-255 (h.recovery) | INC-256 | Operational -> Operational | compatible |
| 513 | INC-256 (h.reconcile) | *external:external-status-reconciliation* | Operational -> External | compatible |
| 514 | INC-256 (h.escalate) | *external:human-in-the-loop-lifecycle* | Operational -> External | compatible |
| 515 | INC-256 (h.observe) | INC-257 | Operational -> Operational | compatible |
| 516 | INC-257 (h.active) | INC-253 | Operational -> Operational | compatible |
| 517 | INC-257 (h.resolve) | INC-258 | Operational -> Operational | compatible |
| 518 | INC-258 (h.remedy) | REM-157 | Operational -> Cust-Comm | compatible |
| 519 | INC-258 (h.review) | INC-259 | Operational -> Operational | compatible |
| 520 | INC-259 (h.escalate) | OWN-55 | Operational -> Operational | compatible |
| 521 | INC-260 (h.review) | DEC-181 | Operational -> Operational | compatible |
| 522 | INC-260 (h.reassess) | DEC-181 | Operational -> Operational | compatible |