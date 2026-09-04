# Identity and Provenance Audit — cross-library handoff audit

Covers instance identity continuity, entity granularity, attempt identity, authority provenance and
evidence provenance across the 522 handoff edges in `relationship-graph.json`, grounded in
`entity`/`entry`/node text read from `production/canonical-dump.json` for every edge discussed
below (not assumed from field-name similarity). Companion to `EDGE-COMPATIBILITY-MATRIX.md`, which
carries the full 522-row identity/entry/ownership/result classification this document draws its
findings from; this document goes deeper on the identity- and provenance-specific dimensions and
adds the business-entity-continuity and authority/evidence-provenance checks the matrix doesn't
itemize row-by-row.

## Method note, read before the findings below

The same two mechanical passes described in `EDGE-COMPATIBILITY-MATRIX.md`'s Method section were
run first (literal `entity.instanceKey` token matching against `carries`/`context` text: 35 of 522
flagged; literal `contractRequiredFields` token matching against the sender's own carries text: 48
of 85 declaring edges flagged). Both were verified by hand against the actual node graphs before
being reported. The overwhelming majority of both flag sets turned out to be the corpus's own valid,
consistently-applied conventions — trigger-anchored ambient identity, reference-carries-full-
object-state, and explicit self-mint/derive-on-entry — not defects. What follows is the residue
after that verification: real findings, plus the exemplary patterns worth citing as reference
designs, plus the business-entity-continuity and authority-provenance checks run separately.

## Instance identity continuity — genuine findings

**IDN-01 (P1) — `RET-24 h.intervention -> RET-30`: episode-identity discontinuity, no self-mint
fallback.** `RET-30`'s `entity.instanceKey` is `[account_id, retention_episode_id]`; its entry runs
`t.delivered -> w.outcome` directly, with no capture/mint action between trigger and wait — unlike
every other receiver in this audit that turned out to need a component the sender didn't literally
carry (`DEC-181`, `ACT-17`, `CON-40`, `ACC-79`, `REM-157` all mint or derive the missing component on
entry). `RET-24`'s own instance identity is `[account_id, risk_episode_id]` — a **different episode
concept** (risk episode, not retention episode) — and its `h.intervention` handoff carries only "the
evidence it was chosen against" and "the risk state at the time it was sent," neither of which names
or derives a retention episode. Its sibling handoff, `RET-28 h.intervention -> RET-30`, gets this
right by explicitly carrying "the cancellation episode this belongs to, so a decline is remembered
inside it." This is the pattern the governing brief asked this audit to hunt for by analogy to the
already-fixed `SUB-163`/`SUB-164` `renewal_id`/`renewal_cycle_id` case: a receiver whose identity
needs a component neither carried by one specific sender nor derivable from what that sender does
carry, sitting right next to a sibling sender that gets it right. Unlike `SUB-163`/`SUB-164`, this
is not a renamed identifier (same concept, different name) — it's two genuinely different episode
boundaries (a risk episode is not always a retention episode), so the fix isn't a rename; it's either
teaching `RET-24` to carry (or `RET-30` to derive) a retention-episode identity for interventions
that arrive via the proactive-risk path rather than the explicit-cancellation-intent path.

**IDN-02 (P1) — `SCH-176/177/178/179/280 -> SCH-180`: no cross-sender correlation for
`provider_failure_id`.** Individually, every one of these 5 edges is identity-compatible: `booking_id`
is shared with the sender's own instanceKey in each case, and `provider_failure_id` (the other half
of `SCH-180`'s `[booking_id, provider_failure_id]` instanceKey) is plausibly `SCH-180`'s own concept,
first-assigned when `a.scope` ("identify every reservation the failure affects") runs. The gap is
across the 5 edges, not within any one of them: `SCH-180` has no `c.duplicate`-style branch anywhere
in its 20-node graph, unlike `DEC-181`'s own explicit `c.duplicate -> a.link` or `RSK-192`'s stated
"`a.case` is the atomic authority for that identity: two signals correlating to the same subject at
the same time settle on one case between them, never two." A single real provider-side event (a
closed location, say) can plausibly be reported into `SCH-180` by more than one of its 5 distinct
sender paths — a cancellation report, a pre-service-block report, a mid-service-failure report, a
missed-occurrence report — with nothing in `SCH-180`'s own graph saying the second report should join
the first `provider_failure_id` rather than mint a second, independent one covering an overlapping
set of bookings. This is the same shape as the already-documented `RSK-193` finding in
`HANDOFF-AND-CHAIN-AUDIT.md` ("three separate risk-detection paths can converge on one entity with
no coordination between them") — a coordination gap between independently-valid parallel senders,
not a single-edge receiver-construction defect.

**IDN-03 (P2) — `ACQ-04 h.reached -> ACQ-08`: `person_id` construction assumes prior lead
resolution.** `ACQ-08`'s instanceKey is `[person_id, destination_entity_id]`; `ACQ-04`'s own scope is
still "lead, opportunity or account" (pre-conversion). The carried "destination entity that already
exists" plausibly supplies `destination_entity_id` by reference (the destination is described as
already reached, so it must already exist with a resolved owner), but this edge's own carried text
never states that the lead behind this late high-intent action has itself resolved to the same
`person_id` `ACQ-08` needs — true in the ordinary case, not a stated guarantee of this specific edge.
Mapping-time gap, not a functional break.

**IDN-04 (P2) — `ACQ-07`/`ACQ-09`/`ACT-20 -> ACQ-03`: `intent_context_id`/`intent_entity_id`
vocabulary divergence.** `ACQ-03`'s instanceKey requires `intent_entity_id`; its three senders here
use `intent_context_id` (`ACQ-07`) or carry no formal intent-entity concept at all (`ACQ-09`,
`ACT-20` — both still lead-scoped). Functionally bridged: `ACQ-03`'s own first action, `a.resolve`,
explicitly states "Resolve which journey currently owns this person for this entity, **and which
lifecycle the new intent belongs to**" — i.e. `ACQ-03` derives its own `intent_entity_id` from the
signal rather than requiring senders to pre-name it, the same self-resolving-on-entry pattern already
verified valid for `RSK-192`'s `risk_subject_id`. Recorded as a naming-clarity finding, not a
receiver-construction defect: `intent_context_id` and `intent_entity_id` read as two names for
overlapping concepts within one journey family (ACQ/ACT) and are worth reconciling on documentation
grounds even though nothing breaks functionally.

## Instance identity continuity — a corpus-wide fact, recorded once

**72 of the 171 distinct non-external handoff targets in this graph (42%) declare no
`entity.instanceKey` at all.** This parallels `OWNERSHIP-AND-ASSIGNMENT-AUDIT.md`'s already-recorded
corpus fact that none of the 124 Operational Workflows declared `instanceKey`/`concurrency` before
this round's repair narrowed that to 113 — extended here across the whole graph, all four layers.
Identity for these 72 targets is carried entirely by the trigger-anchored-ambient-identity convention
(the entry trigger's own evidence names "an authoritative event pertaining to an existing record,"
and that record is the identity). This is not scored as 72 separate findings; it is the corpus's
chosen documentation convention (prose over schema), applied consistently, and the 4 genuine findings
above are the real exceptions to it, not representative of it.

## Instance identity — reference patterns worth citing

Three self-mint/derive-on-entry instances beyond the already-verified `DEC-181` `request_id` pattern
were found and confirmed valid, one of them the clearest-documented derivation formula in the round:

- **`ACT-16 h.adoption -> ACT-17`**: `use_case_id` is "minted at this handoff since no use-case
  concept exists prior to activation" — stated explicitly in the handoff's own `carries` text, not
  merely inferred.
- **`CON-35 h.conflict -> CON-40`**: `disputed_permission_ref` is "derived from this change's own
  (purpose, channel, scope), which `CON-40`'s own conflict instance is keyed on" — a stated
  derivation formula, not a bare mint.
- **`IDN-90 h.recover`/`h.lift -> ACC-79`**: `restoration_case_id` is "minted at this handoff,
  **deterministically derived from `incident_id`** and the confirmed-compromise (or cleared) outcome,
  so `ACC-79` can construct its own instance without inventing one" — the most explicit derivation
  formula found anywhere in the graph: two different `IDN-90` handoffs (`h.recover`, `h.lift`)
  deterministically produce the *same* derived id for the *same* incident, which is exactly the
  property that makes a derived key safe to use instead of a carried one.

These three are cited positively, not flagged, and are recommended as the reference examples for any
future receiver that needs to accept a referrer-shape it doesn't yet have a field for.

## Business entity continuity

Checked every internal `SUB-*`, `DOC-*`, `ACC-*`, `RSK-*` and `INC-*` handoff (32 edges) for whether
sender and receiver are provably talking about the same logical business object across the specific
conceptual boundaries the brief named, reading `entity.scope` on both sides of each edge, not just
matching field names:

- **Subscription vs. renewal-episode** (`SUB-163 -> SUB-164`): already the round's repaired reference
  case — `renewal_id` renamed to `renewal_cycle_id` to match `SUB-163`'s own pre-existing vocabulary,
  per `CANONICAL-CHANGES.md`. Re-confirmed present and correct; no regression.
- **Case vs. case-restriction** (`RSK-192/194/200 -> RSK-193`): `RSK-192`'s scope is "the risk case
  and the actor, account, transaction or resource it concerns"; `RSK-193`'s is narrower — "the risk
  case **and the specific capability or action being restricted**." Every one of the 3 incoming edges
  explicitly carries both the correlated evidence *and* an explicit statement of its own evidentiary
  strength that bounds the restriction's scope — `RSK-192`: "this is evidence rather than confirmed
  misconduct, which bounds how wide the restriction may be"; `RSK-194`: "this is a rule breached
  rather than misconduct established, which bounds the restriction"; `RSK-200`: "this is a
  current-state consequence and says nothing about actions completed under the previous rule." The
  case→restriction granularity narrowing is handled correctly and consistently on every edge, with
  the evidentiary basis for the narrower scope carried explicitly each time — no continuity gap.
- **Account/entitlement vs. entitlement-end** (`ACC-73 -> ACC-74`): `ACC-73`'s scope is "the
  entitlement whose basis changed, and the delta between its previous and new scope"; `ACC-74`'s is
  "the entitlement that ended, plus the resources and commitments that depended on it." The edge
  carries "the capabilities being removed and their effective time" plus an explicit statement that
  "commitments that depend on them...are reconciled separately rather than cancelled by the scope
  change" — the boundary between "changed" and "ended" is drawn explicitly, not left to inference.
- **Document-version vs. effective-document** (`DOC-213`/`DOC-215 -> DOC-216`): both edges explicitly
  separate "issued"/"signed" from "effective" in their own carried text ("effectiveness is still
  validated rather than assumed from issuance"; "signed is not effective — what makes it take effect
  is a separate question with its own conditions") — the version→effective-instrument boundary is
  never silently collapsed.
- **Incident vs. incident-review** (`INC-258 -> INC-259`): carries "the timeline, the mitigations,
  the decisions and the root cause where one was confirmed" plus "the detached cases and surviving
  obligations, which are part of the incident's real cost" — the review receives the full evidentiary
  trail, not a summary conclusion.

No business-entity-continuity defect was found across any of these 5 boundary types. All are
explicit and well-scoped; none silently treats a narrower/derived entity as identical to its broader
source object.

## Authority and evidence provenance

Checked the full `DEC-181`→`182`→`183`→(`184`-`190`) decision chain (23 internal edges) and the
document/risk/incident domains' outbound evidence-bearing handoffs, for whether authority (who
decided, under what grant) and evidence (what basis, how strong) survive each hop or get silently
dropped:

- **The `DEC-18x` chain is the round's best-provenanced cluster.** Every single edge in the 9-node
  chain explicitly carries "the maker," "the authority [level/grant]," "the evidence," or an explicit
  statement of what was *not* invented — e.g. `DEC-183 -> DEC-185`: "the decision, its maker, its
  scope, its conditions and its validity"; `DEC-189 -> DEC-183`: "every piece of evidence and every
  prior assessment, preserved" plus "the specific authority now holding it, **which still acts only
  within what it was granted**"; `DEC-190 -> DEC-183`: "the original decision, preserved, and
  everything that has changed since" plus "whether the original was executed." No edge in this chain
  drops authority or evidence silently.
- **IDN-05 (P1, pre-existing, re-confirmed unchanged) — `DEC-187 h.undefined -> DEC-189` drops the
  case's original deadline.** First documented in `HANDOFF-AND-CHAIN-AUDIT.md` this round
  ("`DEC-187`/`DEC-189`: h.undefined→DEC-189 does not carry the case's original deadline, but
  `DEC-189`'s own `a.preserve`/`w.decision` logic explicitly depends on receiving one to honor it").
  This audit re-read the same edge directly and confirms it is still present and still the one gap in
  an otherwise exemplary chain: the carried context is "the partitions and the action they would
  apply to" plus "the explicit fact that no atomicity was assumed" — no deadline anywhere, while
  every *other* edge into `DEC-189` (`DEC-182 -> DEC-189`, `DEC-183 -> DEC-189`,
  `DEC-184 -> DEC-189`) explicitly preserves it. This is a partial-provenance loss (one field, not
  the whole authority/evidence basis), consistent with the P1 rating already assigned in the prior
  round rather than the P0 tier reserved for outright authority/evidence loss on a decision.
- **IDN-06 (P1, pre-existing, re-confirmed unchanged) — `DOC-212 h.issue -> DOC-213` doesn't carry
  "authority to issue."** First documented in `AUTHORITY-AND-APPROVAL-AUDIT.md` this round as a
  paired finding with `DOC-217`: both targets' own trigger evidence requires "authority to
  issue/change established," but nothing in the document domain cluster — including `DOC-212`'s own
  handoff — actually supplies or names that authorization. Re-confirmed present at the same edge.
- **Evidence-bearing sources checked outbound** (`RSK-*`, `INC-*`, `DOC-*` handing off *out* of their
  own domains): `RSK-192/194/200 -> RSK-193` (above, under Business entity continuity) and
  `INC-258 -> INC-259` (above) both carry full evidentiary trails outward with no loss. No additional
  outbound-provenance defect found beyond the two pre-existing ones re-confirmed above.

## Attempt identity

`OPS-121 -> OPS-124`'s retry handoff is the graph's clearest attempt-identity design and was checked
directly: `OPS-124`'s own `entity.note` states the corpus deliberately keeps two identities
separate — `logical_operation_key` ("carried unchanged from `OPS-121`, the same value on every
retry"), the side-effect-idempotency identity actually sent downstream, versus `attempt_number`, "a
separate, incrementing counter scoped to this mechanism's own bookkeeping only... never itself sent
downstream as a dedup key — encoding it into the downstream key would turn every retry into a fresh,
undeduped operation, exactly the failure this design avoids." `OPS-121 -> OPS-124`'s own instanceKey
is `[work_id, logical_operation_key]`, identical to `OPS-124`'s — the same-instanceKey continuity
pattern found throughout the corpus. No attempt-identity defect found; this is a reference design,
consistent with the closed Runtime Mechanism round's own conclusions on the domain.

## Findings summary

| id | severity | one-line |
|---|---|---|
| IDN-01 | P1 | `RET-24 h.intervention -> RET-30`: episode-identity discontinuity (risk_episode vs. retention_episode), no self-mint fallback on the receiver — breaks `RET-30`'s own documented per-episode decline memory for the automated-risk-path caller specifically. |
| IDN-02 | P1 | `SCH-176/177/178/179/280 -> SCH-180` (5 edges, one finding): no cross-sender duplicate/correlation mechanism for `provider_failure_id` across 5 independent detection paths — same shape as the already-documented `RSK-193` gap. |
| IDN-03 | P2 | `ACQ-04 h.reached -> ACQ-08`: `person_id` construction assumes the lead already resolved to a person; not a stated guarantee of this specific edge. |
| IDN-04 | P2 | `ACQ-07/ACQ-09/ACT-20 -> ACQ-03` (3 edges, one finding): `intent_context_id`/`intent_entity_id` naming divergence across the ACQ/ACT family, functionally bridged by the receiver's own self-resolution but worth reconciling as vocabulary. |
| IDN-05 | P1 (pre-existing, re-confirmed) | `DEC-187 h.undefined -> DEC-189` still drops the case's original deadline that `DEC-189`'s own preserve/timeout logic requires. |
| IDN-06 | P1 (pre-existing, re-confirmed) | `DOC-212 h.issue -> DOC-213` still doesn't carry "authority to issue" that both `DOC-213` and the parallel `DOC-217` require. |
| IDN-07 | N/A (corpus fact) | 72 of 171 distinct non-external handoff targets (42%) declare no `entity.instanceKey` — identity carried entirely via trigger-anchored ambient identity; not a defect, recorded once. |
| IDN-08 | P2 (positive) | `ACT-16`, `CON-35`, `IDN-90 -> ACC-79` are three more valid self-mint/derive-on-entry instances beyond `DEC-181`; `IDN-90 -> ACC-79`'s deterministic-derivation-from-`incident_id` formula is the clearest in the round and is recommended as the reference pattern. |
| IDN-09 | P2 (positive) | Business-entity-continuity checks across 5 conceptual boundary types (case→restriction, entitlement→entitlement-end, subscription→renewal, document-version→effective, incident→review) found zero continuity defects — every boundary crossing carries explicit evidentiary/scope-bounding text. |
| IDN-10 | P2 (positive) | The `DEC-18x` chain (23 internal edges) and `OPS-121 -> OPS-124`'s attempt-identity design are both reference-quality for authority/evidence provenance and attempt-identity discipline respectively. |

**Totals**: 4 new genuine identity findings (IDN-01 through IDN-04, covering 9 of the 522 edges: 1 +
5 + 1 + 3 — note IDN-02 and IDN-04 each group multiple edges under one finding), 2 pre-existing
findings re-confirmed unchanged from prior rounds (IDN-05, IDN-06), 1 corpus-wide documentation-
convention fact recorded once (IDN-07), 3 positive/reference findings (IDN-08 through IDN-10). P0: 0.
P1: 4 (IDN-01, IDN-02, IDN-05, IDN-06 — the latter two pre-existing and unchanged, not newly
introduced by this round's repairs). P2: 4 (IDN-03, IDN-04 real; IDN-08, IDN-09 positive — IDN-10
also P2-positive). No P0 was found: no case of a receiver structurally unable to construct required
identity from what a sender carries with no self-minting or ambient-identity path available, and no
case of full authority/evidence loss (as opposed to the one-field deadline loss at IDN-05) on a
consequential decision.
