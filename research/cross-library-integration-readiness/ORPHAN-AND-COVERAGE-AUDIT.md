# Orphan and coverage audit

Governing brief Part 23 (plus the Part 25 duplicate-responsibility appendix and the Part 33
customer-silence appendix). Audit only.

## Method

Re-evaluated all 284 canonical items against the complete 548-edge cross-library graph (522
handoff + 22 competition + 4 preemption), not the single-layer views the four closed rounds each
worked from. An item is **referenced** if it has a real inbound handoff or is a member of a
competition `exclusionGroup` (arbitrated at runtime by `OPS-131`, so competition membership is a
real form of being known to and consumed by the system, not merely descriptive prose). An item
with zero inbound handoff and no competition membership is **event-entry** if its own trigger node
declares `evidence.source` of `authoritative`, `declared`, `behavioral`, or `inferred` *and* that
source maps to a plausible, nameable real-world or system emitter (a payment processor, an admin
console, page-view instrumentation, a detection/fraud engine, a card network, a GDPR request, a
calendar/scheduler). Only where neither condition holds — no inbound edge, no competition
membership, and no nameable plausible emitter, corroborated by zero prose mention anywhere in the
other 283 items' full text — is an item carried as a genuine **orphan candidate**.

## Corpus-wide distribution

| Inbound handoffs | Outbound handoffs | Count | What it means |
|---|---|---|---|
| ≥1 | ≥1 | 155 | ordinary interior nodes — both referenced and continuing |
| ≥1 | 0 | 11 | **referenced, terminal sink** — real consumer, correctly ends its own task |
| 0 | ≥1 | 96 | **root journeys** — event-entry, feed the graph but nothing feeds them |
| 0 | 0 | 17 | isolated in the handoff layer — see below, all resolved |
| **Total** | | **284** | matches the corpus |

Of the 113 zero-inbound items (96 + 17), **every single one** carries a trigger with a stated,
non-empty `evidence.source` (87 `authoritative`, 11 `declared`, 10 `behavioral`, 5 `inferred`) —
there is no zero-inbound item anywhere in the corpus with an unexplained or missing trigger. This
is the strongest structural evidence that the corpus was built root-first and deliberately: nothing
is silently waiting on a handoff that was simply never wired.

## The 17 zero-inbound-and-zero-outbound items, individually resolved

`ACQ-13, RET-31, RET-32, CON-34, CON-272, CON-283, FBK-41, FBK-48, FBK-50, TIM-274, TIM-281,
ACC-263, REL-284, SCH-172, SCH-282, DEC-267, DOC-286`

**Competition membership (5 of 17) — referenced, not orphaned.** Cross-checking every one of these
17 against `relationship-graph.json`'s 22 competition edges finds **five**, not the four the
grounding data's own note called out: `ACQ-13` (`commerce-recovery`, lowest precedence),
`RET-31` (`commerce-recovery`), `SCH-282` (`commerce-recovery`, "alongside interest recovery"),
`FBK-41` (`outbound-ask`, loses to `FBK-42`) — **and `RET-32`** (`retention-outreach`, lowest
precedence: *"any live retention, complaint, risk or payment journey on the account means the
relationship is not lapsed and this journey does not run"*), which the grounding data's own
enumeration missed. All five are arbitrated at runtime by `OPS-131` and are real participants in
the system, not silent unknowns — **referenced**.

**Event-entry roots (12 of 17) — legitimately zero-inbound and zero-outbound, not orphaned.** Every
remaining member is a genuine terminal-shaped root: it is entered directly by its own authoritative/
declared/behavioral trigger and its own work concludes without needing to hand off elsewhere
(none of its own guardrail/exit text implies a missing continuation):

| id | trigger event | source | why it correctly ends here |
|---|---|---|---|
| `CON-272` | `contact_point_recorded_undeliverable` | authoritative | repairs one dead destination in place; nothing downstream needs to know |
| `CON-283` | `frequency_preference_reduced` | declared | confirms a cadence reduction; prospective-only by design (mirrors `CON-34`) |
| `CON-34` | `frequency_preference_changed` | declared | prospective cadence recalculation — see its own entry below, carried forward from the Runtime Mechanism round |
| `FBK-48` | `relevant_context_explicitly_declared` | declared | persists a declared attribute; the recalculation is the whole job |
| `FBK-50` | `meaningful_relationship_signal` | behavioral | accumulates evidence toward a label; no further handoff implied |
| `TIM-274` | `grace_period_started` | authoritative | informs the holder of a bounded grace window; self-contained |
| `TIM-281` | `holder_acted_on_expired_entity` | behavioral | routes a re-entry attempt to requalify/replace/stay-expired; terminal by nature (has a `terminal: true` exit, `x.terminal`) |
| `ACC-263` | `entitlement_provisioned_and_reachable` | authoritative | activation-window nudge; ends at activated/lapsed |
| `REL-284` | `relationship_invitation_issued` | authoritative | accept/expire an invitation; has its own `terminal: true` exit (`x.closed`) |
| `SCH-172` | `temporary_hold_granted` | authoritative | a bounded capacity hold; consumed/expired/released, self-contained |
| `DEC-267` | `adverse_decision_recorded` | authoritative | tells the subject which of three things is true about an adverse decision; has its own `terminal: true` exit (`x.final`) |
| `DOC-286` | `document_recorded_effective` | authoritative | tells the holder an entitlement is active; self-contained |

None of these 12 shows any sign of a missing continuation — several (`TIM-281`, `REL-284`,
`DEC-267`) explicitly declare their own `terminal: true` exit, which is the corpus's own way of
marking "this is meant to end here."

**`CON-34` carried forward, not re-litigated.** The Runtime Mechanism round already investigated
this exact item (its own zero-consumer/zero-outbound isolation) and concluded it is a legitimate
event-driven entry point whose job (prospective cadence recalculation) is a terminal step rather
than a pipeline stage, carrying its own P2 consumer-coverage note since no confirmed real emitter
is traceable in the current corpus. The complete cross-library graph adds no new edges for it
(inbound: none; outbound: none, confirmed) — **the prior classification holds unchanged.**

## Orphan candidates carried forward from prior rounds, reassessed against the complete graph

The Operational Workflow round flagged exactly two genuine orphan candidates: `REL-99` and
`INT-120`. Both have **nonzero outbound** handoffs (`REL-99:h.review→DEC-181`,
`INT-120:h.escalate→OWN-55`), so neither appears in the 17 zero-both list above — they were only
visible as zero-*inbound* items, and the operational-only view could not rule out that a Customer
Journey or Mechanism elsewhere in the corpus referenced them.

**With the complete 284-item corpus text searched, both remain totally unreferenced anywhere** —
zero handoff, zero `distinctFrom` or other prose mention, by any of the other 283 items. This is a
stronger result than the prior round could produce (it could only confirm silence within the
124-workflow batch). Unlike the 12 event-entry roots above and the other 35 zero-inbound items also
checked for total silence (see next section), neither `REL-99`'s trigger
(`entity_split_required`) nor `INT-120`'s (`critical_external_dependency_unavailable`) maps to an
externally-obvious emitter class the way e.g. `FIN-139`'s dispute trigger obviously comes from a
card network, or `ACQ-01`'s comes from page-view instrumentation — an entity split is a business
decision that should be authorized by *something*, and a dependency-unavailable signal should come
from *some* monitoring system, but nothing in this corpus names either. **Both remain orphan
candidates. Confidence: unchanged from the prior round (medium) — the complete graph corroborates
rather than resolves the uncertainty. P1** (not P0: both workflows are internally sound, cause no
side effects on their own, and being unreferenced is a documentation/wiring gap, not a runtime
defect).

## No new orphan candidates found

Beyond the 17 zero-both and the 96 zero-inbound-nonzero-outbound items, a further check was run:
of the 96, **37 are "totally silent"** (zero inbound handoff *and* zero prose mention anywhere in
the other 283 items' text, the same bar `REL-99`/`INT-120` are held to). All 37 were read
individually. Two (`REL-99`, `INT-120`) are the confirmed candidates above. `REL-95`, `RSK-196`,
`RSK-200`, `TIM-66`, `TIM-70`, `REL-97`, `INC-260` were already individually investigated by prior
rounds and concluded legitimately event-driven (plausible emitters: known account/contract
lifecycle events, an internal risk/policy engine common to many risk workflows, an
exception-granting authority, other scheduled-transition workflows independently reimplementing the
same shape, and inferred-source detection mechanisms respectively) — this round's complete graph
adds no new edges for any of them and finds no reason to disturb those conclusions. The remaining
28 (`ACC-261`, `ACQ-01`, `ACQ-285`, `CTL-231`, `CTL-235`, `CTL-238`, `DAT-221`, `DAT-226`,
`DAT-229`, `DOC-214`, `DOC-218`, `FIN-139`, `FUL-276`, `IDN-270`, `IDN-271`, `IDN-83`, `INT-278`,
`OPS-131`, `REM-160`, `RLT-279`, `RSK-273`, `SCH-280`, `SUB-169`, `SUB-262`, `TIM-268`, `TRM-105`,
`TRM-108`, `TRM-275`) each map cleanly to a nameable external or system emitter (page-view/behavioral
instrumentation, a declared customer/agent action, an admin/API call, a card network or dispute
authority, a GDPR-style subject request, a scheduler/calendar boundary, a security/fraud detection
system, or — for `OPS-131` specifically, the competition-arbitration mechanism itself — the
runtime's own eligibility computation, which is definitionally first-mover and has no predecessor
by design). **Zero new orphan candidates.**

## Terminal sinks (11 items, referenced, correctly zero-outbound)

`ACC-79, CON-31, CON-33, CON-38, IDN-89, INC-254, INT-111, OPS-130, REL-98, RSK-198, SCH-171` — each
has at least one real inbound handoff and completes a bounded task (a consent value recalculated, a
connection activated, an incident update sent, a slot offered or waitlisted) without needing to
hand off further. None declares a formal `terminal: true` exit, but each journey's own exit set is
a closed, self-consistent set of endings for its own scope (accept/reject/partial/etc.) — this is
the ordinary shape of a leaf workflow, not a gap.

## Duplicate-responsibility pass (Part 25 appendix)

Checked for pairs/clusters sharing `goal` + near-identical `entity.scope` + the same trigger event,
across all 284 — the tightest, least-conservative bar available, since sharing only `(category,
goal)` produces dozens of expected domain-taxonomy siblings (e.g. all eight `access /
access-entitlement-change` workflows, all six `decision / decision-approval` workflows) that are
plainly different responsibilities and not worth listing.

**Exactly one pair shares an identical trigger event**: `ACQ-02` and `ACQ-285`, both entered by
`first_party_interest_captured`. Read in full, they are a deliberately reciprocal split, not a
duplicate: `ACQ-02`'s own `distinctFrom` names `ACQ-285` as the destination it hands off to, and
`ACQ-285`'s own `distinctFrom` names `ACQ-02` as the decision it never re-makes (*"ACQ-02 decides
which destination a capture justifies... This journey is what the person receives once that
decision exists, and it invents no destination of its own"*). Same entry event, disjoint
responsibility (decide-the-destination vs. deliver-the-first-touch), explicit mutual
cross-reference. **Not a duplicate.**

No other pair in the corpus shares both goal and trigger event. **No high-confidence
duplicate-responsibility candidates found.** This is consistent with the conservative prior
(most apparent overlaps in a 284-item taxonomy are valid domain variants) and with the corpus's own
evident discipline of writing an explicit `distinctFrom` wherever two journeys sit close enough in
shape to need one.

## Customer silence check (Part 33 appendix)

Recomputed the surface classification from `src/canonical/surface.ts`'s actual `surfaceOf()` logic
(not merely re-reading the grounding data's counts) against `production/canonical-dump.json`'s
`category`/`channels`/`entity.scope` for all 284 items: **68 customer-communicating, 64
customer-silent, 3 customer-human-routing (`ACQ-04`, `ACT-11`, `RET-24` — confirmed, matching the
grounding data's own guess exactly), 25 mechanism, 124 operational** — an exact match to the
brief's stated totals, confirming the mechanical classification is reproducible from source, not
just asserted.

- **Every one of the 64 customer-silent journeys has `channels: []`** by construction of the
  `surfaceOf()` rule itself (a non-empty message-channel list would flip `sends` to `true`, which
  moves the item to `customer-communicating` before the silent-lifecycle branch is even reached) —
  verified directly against the dump rather than assumed: zero customer-silent items carry a
  non-empty `channels` array.
- **No operational workflow (of the 124) carries a message channel** (`email`/`sms`/`push`/`in-app`/
  `whatsapp`) — verified directly: zero hits. The only channel value any operational workflow
  carries is `task` (18 of the 124, all internal work-routing — `OWN-51/54/55/56/58/60`, `TRM-101`,
  `DEC-181/182/183/189/190`, `DAT-223/229`, `RLT-247`, `INC-252/259`), never `sales` (the
  customer-facing routing channel, reserved for exactly `ACQ-04`/`ACT-11`/`RET-24`). Zero
  operational workflows route to a customer.
- **No operational workflow's text embeds a channel-strategy or campaign-orchestration vocabulary**
  — searched the full corpus text of all 124 operational workflows for "channel strategy",
  "marketing campaign", "lifecycle campaign", "send cadence", "messaging cadence", "contact
  strategy": zero hits. The specific case the brief flags as acceptable —
  `REM-154`'s physical inspection and similar `execution: "human"` work-content actions elsewhere
  (e.g. `REM-153`'s return-transit tracking, `DOC-215`'s signature collection) — is exactly that:
  work content, not a channel/cadence decision. No Operational Workflow was found orchestrating a
  customer communication campaign or channel strategy.

**Result: the 64 customer-silent journeys remain genuinely silent, and no Operational Workflow
embeds customer-channel orchestration. No findings.**

---

## Findings summary

| # | Item(s) | Classification | Confidence | Severity | Basis |
|---|---|---|---|---|---|
| 1 | 5 of the 17 zero-both (`ACQ-13`, `RET-31`, `RET-32`, `FBK-41`, `SCH-282`) | referenced (competition) | high | — | real `exclusionGroup` membership, arbitrated by `OPS-131` |
| 2 | 12 of the 17 zero-both | event-entry root, correctly terminal | high | — | authoritative/declared/behavioral trigger; several with explicit `terminal: true` exits |
| 3 | `CON-34` | event-entry, terminal step | high | P2 (carried, no confirmed emitter) | prior round's conclusion corroborated, no new edges |
| 4 | `REL-99` | **orphan candidate** | medium (unchanged) | P1 | zero inbound/outbound-referencing anywhere in 284 items; no nameable emitter |
| 5 | `INT-120` | **orphan candidate** | medium (unchanged) | P1 | same |
| 6 | 35 other zero-inbound items checked for total silence | event-entry root | high | — | each maps to a nameable external/system emitter, or was previously individually investigated |
| 7 | 11 terminal sinks | referenced, terminal sink | high | — | real inbound handoff, bounded own-task completion |
| 8 | `ACQ-02` / `ACQ-285` | not a duplicate | high | — | identical trigger, disjoint responsibility, explicit mutual `distinctFrom` |
| 9 | Duplicate-responsibility pass, corpus-wide | none found | — | — | no other pair shares goal + trigger |
| 10 | Customer silence (64 customer-silent) | confirmed genuinely silent | high | — | zero non-empty `channels` arrays |
| 11 | Operational-workflow channel leakage (124) | none found | high | — | zero message/sales channels, zero campaign-strategy text |

**Bottom line: exactly 2 true orphan candidates in the entire 284-item corpus (`REL-99`, `INT-120`),
both carried forward unchanged from the prior round and now corroborated by the complete
cross-library graph rather than newly discovered. Zero new orphans, zero high-confidence
duplicates, zero customer-silence or channel-leakage findings.**
