# Silent Lifecycle States — conflict and exclusivity audit

Per the brief, this is one of the most important parts of the round: for every pair of states
this audit found describing a genuinely related fact, can they coexist, can both own
orchestration at once, who wins if not, what gets suppressed, and is today's metadata sufficient
to answer those questions mechanically — or only in prose.

**Working, structured examples in this batch: 2.** Every other real relationship this audit found
between two silent states — 8 pairs/groups below — is documented only as a `distinctFrom` prose
boundary. Prose is not automatically a gap: several of these pairs are boundaries, not conflicts
(the two states describe non-overlapping facts and could never actually compete), and those are
marked "metadata sufficient: yes" below. The genuine gaps are the smaller number of pairs that
*can* plausibly coexist and compete for the same orchestration, with no declared precedence.

## The two working `contact.competition` examples

| Group | Members | Precedence | Suppression | Metadata sufficient? |
|---|---|---|---|---|
| `purchase-intent` | ACQ-07 (Intent Decay, lowest) / ACQ-08 (Acquisition Exit Handoff, highest) | A completed destination (ACQ-08) always outranks a decay judgment (ACQ-07) | ACQ-08's `h.next` explicitly suppresses every acquisition journey scoped to the entity, queued and in-flight | **Yes** — both sides declared, in this round's own scope, correctly ordered |
| `relationship-continuity` | SUB-167 (Cancellation Effective-Date Resolution, declared) / the renewal-decision journey it names (outside this round's scope) | A cancellation in motion outranks a renewal decision on the same relationship | `onLoss: "paused"` | **Partial** — SUB-167's own side is well-formed; the counterpart declaration was not independently verified this round (that journey is not one of the 64 silent states) |

Recommendation: verify the renewal-decision journey's own `contact.competition` block declares
`relationship-continuity` membership at lower precedence, in whatever round next covers it.

## Domain-family conflict tables

### Access & security (ACC-78, IDN-90, TIM-65)

| State A | State B | Can coexist? | Can both own orchestration? | Winner / precedence | Suppression | Metadata sufficient? |
|---|---|---|---|---|---|---|
| ACC-78 (Access Suspension) | TIM-65 (Grace Period) | No — mutually exclusive by definition: grace continues a right whose *validity has ended*; suspension restricts a right that is *still valid* | N/A — the two answer different states of the same underlying validity fact, never the same moment | N/A, not a real conflict | N/A | **Yes** — a genuine boundary, not a conflict; no `ConflictRef` needed |
| ACC-78 (Access Suspension) | IDN-90 (Suspected Account Compromise) | **Yes, plausibly concurrent** — a business-reason suspension and a security-incident containment can both be open on the same account for unrelated reasons | Yes — different instance-key granularities (`account_id + capability_scope` vs `incident_id`), so both can genuinely hold ownership of their own restriction simultaneously | **Undeclared** | **Undeclared** | **No — genuine gap (P2 on both states' own write-ups)**: nothing states whether a reviewer should see the pairing, or whether one restricting action should be aware of the other's scope |

### Retention & health (RET-23 / RET-24)

| State A | State B | Can coexist? | Can both own orchestration? | Winner / precedence | Suppression | Metadata sufficient? |
|---|---|---|---|---|---|---|
| RET-23 (Health Deterioration Diagnosis) | RET-24 (severity/pushback assessment — outside this round's 64) | **Yes, explicitly by design** — RET-23's own `distinctFrom` states RET-24 "can run on a relationship whose cause is already known and being fixed" | Yes — genuinely complementary questions (what's wrong vs. how much and how hard to push back), not competing for the same decision | N/A — not competing | N/A | **No — prose only (P2)**: the stated coexistence is real and intentional but not modeled as a `ConflictRef`, so nothing mechanically confirms the pairing is safe rather than merely undocumented |

### Structural relationship vs. continuing relationship (the corpus's most-repeated boundary)

| State A | State B | Can coexist? | Can both own orchestration? | Winner / precedence | Suppression | Metadata sufficient? |
|---|---|---|---|---|---|---|
| REL-91 / REL-92 / REL-93 (structural link: creation, change, end) | SUB-161 / SUB-166 / SUB-167 / SUB-168 / SUB-169 / SUB-170 (continuing agreement: activation, terms change, cancellation, suspension, end) | **Yes, always, by design** — these describe two permanently independent facts about the same two entities (an employee's membership in an org vs. the org's own contract) | Yes — each owns its own lifecycle completely independently; neither reads or writes the other's state | N/A — not competing, genuinely orthogonal | N/A | **Yes** — this is the single most consistently and repeatedly drawn boundary in the entire corpus (independently restated, in nearly identical language, across at least 8 of the 64 states' own `distinctFrom` fields: REL-91, REL-92, REL-93, SUB-161, SUB-166, SUB-169, SUB-170, ACC-71). It works entirely as documentation because the two families never actually compete for anything — closing this gap with a structured `ConflictRef` would add no safety a real implementation doesn't already have from the instance-key separation alone |

### Scheduling capacity (SCH-172, FUL-142, FUL-143)

| State A | State B | Can coexist? | Can both own orchestration? | Winner / precedence | Suppression | Metadata sufficient? |
|---|---|---|---|---|---|---|
| SCH-172 (Temporary Slot Hold) | FUL-143 (Resource Reservation) | No — sequential, not concurrent: a hold protects capacity for a commitment that *does not exist yet and may never*; FUL-143 allocates a resource to an obligation that *already exists* | N/A — different lifecycle stages of the same capacity, never the same moment | N/A | N/A | **Yes** — a genuine boundary via `distinctFrom`, correctly non-overlapping |
| FUL-142 (Fulfillment Allocation) | FUL-143 (Resource Reservation) | **Yes, transiently** — two concurrent allocation attempts can genuinely race for the same resource | Momentarily, yes — resolved deterministically | Whichever resolves first through the explicit `h.recheck` race-condition path | Implicit in the recheck resolving to a single winner | **Yes — this is the one working example of an *operational* concurrency conflict in the batch** (distinct in kind from a customer-communication-pressure conflict, which is what `contact.competition` actually models); it is real, structurally enforced, and does not need a `ConflictRef` because the resolution lives directly in the graph's own condition/handoff shape |

### Ownership and role transfer (TRM-105, REL-94, OWN-54 — outside this round's 64)

| State A | State B | Can coexist? | Can both own orchestration? | Winner / precedence | Suppression | Metadata sufficient? |
|---|---|---|---|---|---|---|
| TRM-105 (Responsibility Handover) | REL-94 (Role Authority Update) | Yes — different shapes: TRM-105 moves a role between two *people* at a future effective point; REL-94 changes *one* person's role in place | Yes, but on different instances — a handover and a role-change against the same role_id at the same moment would be a real edge case | Undeclared for the overlap case | Undeclared | **Mostly yes, one edge case undeclared**: the two are boundary-distinguished in prose, but neither state addresses what happens if a role change and a scheduled handover both target the same `role_id` at once (P2-level observation, not separately raised as a per-state gap since it did not surface as a concrete finding in either state's own graph) |
| TRM-105 (Responsibility Handover) | OWN-54 (single-item ownership move — outside this round's 64) | Yes — different scopes: TRM-105 moves an entire role and everything it carries at a future point; OWN-54 moves one work item now | Yes, non-competing | N/A | N/A | **Yes** — clean boundary via `distinctFrom` |

## Summary

- **2 of 10** identified relationships have a structured, mechanically-checkable
  `contact.competition` declaration (one fully verified both sides, one partially).
- **5 of 10** are genuine boundaries (the two states can never actually compete, by construction
  of their own instance keys or lifecycle stages) where prose is sufficient and a `ConflictRef`
  would add no real safety.
- **1 of 10** (FUL-142/FUL-143) is a working *operational* concurrency conflict, correctly
  resolved in-graph without needing the customer-communication-flavored `contact.competition`
  concept at all.
- **2 of 10** (ACC-78/IDN-90, RET-23/RET-24) are genuine gaps: real, plausible concurrent
  ownership with no declared precedence or suppression rule, currently P2-level findings on the
  states involved rather than blocking — a company would today have to invent an answer to "who
  wins if both are open" rather than read one from the canonical graph.

None of these findings require a canonical graph change; where a fix is warranted, it is a
`ConflictRef` addition at the implementation-contract layer (already modeled in
`lifecycle-state-contract.schema.ts`'s `ConflictRef` type), not a change to
`src/canonical/*.ts`.
