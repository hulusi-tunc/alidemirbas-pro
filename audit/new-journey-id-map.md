# New journey id allocation — 17 additions

Phase 25. Id allocation is a mechanical repository concern, recorded here so it
is reviewable and so nothing is renumbered later.

## The allocation rule this repo actually uses

Two numbering schemes are visible in the corpus and only one of them is live.
Older journeys number **per prefix** (ACT-11…ACT-20, FBK-41…FBK-50, RET-24…RET-32).
Everything added since the 260s numbers from a **single global counter**, with
the prefix chosen for subject: ACC-263, SUB-262, DEC-267, IDN-271, RSK-273,
TRM-275, FUL-276, INT-278, RLT-279, TIM-281, SCH-282, CON-283, REL-284,
DOC-286, ACQ-287, ACQ-288.

The highest number in the corpus is **288**, so these 17 take **289–305**, in
batch order. No existing id is reused, renumbered or changed, and no new prefix
is created.

## The map

| # | Journey | Category | Id | Slug | Why this category |
|---|---|---|---|---|---|
| **Batch A — commerce / post-purchase** |
| 1 | Back-in-Stock Alert | acquisition | **ACQ-289** | `back-in-stock-alert` | An interest that could not convert because the thing was unavailable. Sits beside ACQ-13 Unresolved Interest Recovery: same unmet intent, different reason it went unmet. |
| 2 | First Purchase Thank You & Bounceback | retention | **RET-290** | `first-purchase-welcome` | Its job is the second purchase, not the first — turning a buyer into a returning customer is retention's question, not acquisition's. |
| 3 | Post-Purchase Follow-Up | fulfillment | **FUL-291** | `post-purchase-follow-up` | Triggers on completion/delivery, which is fulfillment's own terminal state, and its entity is the fulfilled order. |
| 4 | First Purchase Anniversary | retention | **RET-292** | `first-purchase-anniversary` | Relationship longevity measured from the first purchase. |
| 5 | Personalized Recommendations | retention | **RET-293** | `personalized-recommendations` | Needs an existing behavioural history, so it acts on a relationship that already exists — the same footing as RET-31 Predicted Need Replenishment. |
| 6 | Cross-Sell / Next Best Offer | retention | **RET-294** | `complementary-next-offer` | A complementary next step for something already owned; RET-31's immediate neighbour. |
| **Batch B — relationship / loyalty** |
| 7 | Birthday & Milestone | retention | **RET-295** | `milestone-recognition` | Recognising a date the relationship itself accumulated. |
| 8 | Loyalty Program Welcome | subscription | **SUB-296** | `loyalty-welcome` | A loyalty membership is an ongoing enrolled relationship with its own join, state and exit — which is what the subscription prefix holds (SUB-163 renewal, SUB-262 wind-down). Not `retention`: these journeys act on the membership, not on the risk of losing it. |
| 9 | Loyalty Program Nurture | subscription | **SUB-297** | `loyalty-nurture` | Same entity as SUB-296. |
| 10 | Reward Confirmation | subscription | **SUB-298** | `reward-confirmation` | The membership's own earned state changing. |
| 11 | Loyalty Tier Upgrade | subscription | **SUB-299** | `loyalty-tier-change` | The membership's own standing changing. |
| **Batch C — communication hygiene / transaction** |
| 12 | Unengaged Subscriber Sunset | consent | **CON-300** | `unengaged-sunset` | It decides whether marketing contact should continue at all, which is a contactability and permission question — CON-272 Contact Recovery and CON-283 Frequency Preference Update are the same family. Deliberately not `retention`: it is not trying to keep the customer, it is deciding whether to keep talking. |
| 13 | Order Confirmation | fulfillment | **FUL-301** | `order-confirmation` | The opening state of the fulfillment record, whose later states FUL-265 and FUL-146 already narrate. |
| 14 | Refund Notification | financial | **FIN-302** | `refund-notification` | A money movement confirmed by the authoritative financial record. |
| **Batch D — scheduling / service** |
| 15 | Reservation Payment Reminder | scheduling | **SCH-303** | `reservation-payment-reminder` | The entity is the reservation and its recoverability; the payment is a condition on it, not the subject. Hands to FIN-134 if the payment actually fails. |
| 16 | Pre-Arrival / Check-In | scheduling | **SCH-304** | `pre-arrival-preparation` | The same booking entity SCH-266 and SCH-277 hold, at a later point in it. |
| 17 | Support Request Acknowledgement | remedy | **REM-305** | `support-request-acknowledgement` | Intake of a service request, upstream of REM-151 Post-Purchase Issue Recovery and REM-157 Remedy Confirmation. |

## Counts this produces

| | before | after |
|---|---:|---:|
| public journeys | 52 | **69** |
| excluded legacy journeys | 21 | **21** |
| source corpus (library surface) | 73 | **90** |

The wider canonical corpus goes 286 → 303 journeys.

## Placement notes worth keeping

- **Loyalty went to `subscription`, not `retention`.** Retention in this corpus
  is about a relationship at risk (RET-24 risk escalation, RET-28 cancellation
  save, RET-32 win-back). A loyalty membership is an ordinary enrolled
  relationship with a join, a state and an exit, which is what SUB holds. Filing
  loyalty under retention would have implied every loyalty message is a save.
- **Sunset went to `consent`, not `retention`.** It is not trying to recover the
  customer — it is deciding whether continued marketing contact is still
  warranted. That is the question CON-272 and CON-283 already own.
- **Order Confirmation went to `fulfillment`, not `financial`.** It confirms the
  order record opened, which is the state FUL-265 and FUL-146 go on to narrate.
  The money side of the same moment belongs to FIN.
- **No new prefix was created**, and no journey concept was renamed to make a
  prefix fit.

## Batch status

| Batch | Ids | Landed | Public library |
|---|---|---|---:|
| A — commerce / post-purchase | ACQ-289, RET-290, FUL-291, RET-292, RET-293, RET-294 | yes | 52 → 58 |
| B — relationship / loyalty | RET-295, SUB-296, SUB-297, SUB-298, SUB-299 | yes | 58 → **63** |
| C — communication hygiene / transaction | CON-300, FUL-301, FIN-302 | yes | → **69** |
| D — scheduling / service | SCH-303, SCH-304, REM-305 | yes | → **69** |

All seventeen have landed. **B, C and D were authored in PARALLEL against the
same base**, so the per-batch "public library" arithmetic above is each batch's
own view in isolation and does not chain: B saw 58 → 63, C saw 58 → 61 and D
saw 58 → 61. The merge reconciled them to 58 + 5 + 3 + 3 = **69**, and the
canonical corpus to 292/3802 + 5/52 + 3/47 + 3/58 = **303/3959**. Read each
batch's notes file the same way — its counts are true for that batch alone.

Batch B's ownership boundaries (the reciprocal `date-recognition` pair between
RET-295 and RET-292, and the four-member `membership-standing` group), its
per-journey touch counts and what it deliberately left out of scope are recorded
in `audit/batch-b-notes.md`. The canonical corpus after Batch B is 297 journeys /
3854 nodes.
