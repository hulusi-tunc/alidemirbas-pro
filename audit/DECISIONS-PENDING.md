# Decisions pending — everything blocked on a product call

Compiled from `51-journey-design-matrix.md` (15 open rows),
`collision-review.md` (8 P0 + 13 P1), `journey-blueprints.md` (F1–F5) and
`visual-review.md` (7 P1). Nothing here is resolved; each item states the
conflict, the evidence, the options and a recommendation.

**None of these blocks the work already shipped.** The 51-journey scope, the
channel taxonomy, the canvas hygiene fixes and all validators are live and
green. These block **Phase 21** — the batch-by-batch canonical redesign —
because each one changes what a journey should say.

Severity: **P0** = two journeys will message the same person about the same
thing, or a journey cannot do its stated job. **P1** = ambiguous but no
double-send. **P2** = cosmetic.

---

## A · Journey ownership — who owns the customer, and when

### A1 · ACQ-287/ACQ-288 have no ownership contract at all · **P0**

The only two of the 51 with **no** `eligibility`, `suppressions`,
`measurement`, `contact`, `channelStrategy`, `orchestration`, an **empty**
`entity.instanceKey` and no `concurrency`. Every other 49 has all of them.
They are therefore outside the `commerce-recovery` exclusion group whose other
members (ACQ-11 › ACQ-12 ≈ SCH-282 › RET-31 › ACQ-13) form a complete
precedence order.

Consequence: nothing suppresses them and they suppress nothing.

- **(a) Migrate both to the vNext contract before shipping** — minimum:
  `entity.instanceKey` + `concurrency`, a `contact` block joining
  `commerce-recovery`, and `measurement`.
- **(b)** Ship as the two least-enforced rows in the library and record why.

**Recommendation: (a).** This is the root cause of A2 and A3 below; fixing it
once removes three P0s.

### A2 · Cart vs Checkout vs the generic pair — four journeys, two moments · **P0**

`ACQ-11`'s entity scope names "the basket-and-checkout" and `checkout_started`
satisfies its trigger exactly. `ACQ-12`'s trigger is items placed in a
selection; `item_added_to_cart` satisfies it exactly. The only separation is a
`distinctFrom` describing *authoring* intent — which is documentation, not
runtime enforcement.

**One cart-then-checkout session opens four instances and up to ten messages.**

- **(a) Specialisation** — put ACQ-288/287 into `commerce-recovery` with
  precedence **above** ACQ-12/ACQ-11, and `onLoss: suppressed` on the generic
  pair.
- **(b) Presets** — demote ACQ-288/287 to `discovery.presets` of ACQ-12/ACQ-11.
  Out of bounds unless the 51-journey scope is reopened.

**Recommendation: (a).** (b) contradicts the fixed scope.

### A3 · ACQ-287 keeps sending while FIN-134 owns the payment · **P0**

ACQ-11 blocks a payment failure three ways (eligibility, `s.payment`, and an
`h.payment` handoff reachable from all four state nodes). ACQ-287's three waits
listen for `["process_completed"]` only and it has **zero** handoff nodes.

A declined card therefore gets FIN-134's dunning **and** ACQ-287's high-value
WhatsApp/SMS reminder about the same money — and FIN-134 is pressure-cap
exempt.

- **(a)** Add `payment_failed` to ACQ-287's waits plus an `h.payment` handoff,
  mirroring ACQ-11.
- **(b)** A one-sided suppression on ACQ-287 naming FIN-134's open state.

**Recommendation: (a)** — it copies a pattern already proven in ACQ-11.

### A4 · TIM-268 is a universal collider · **P0**

TIM-268's eligibility ("an authoritative record that a defined action is owed
by a named person" + "a due date recorded against it") is a strict **superset**
of **nine** other public journeys that each send their own reminder about a
customer-owed action with a date: TIM-61, TIM-63, DOC-215, REL-284, ACC-263,
RLT-279, SCH-266, ACT-13, FBK-49.

Each caps itself; none caps TIM-268; all are `pressureClass: "service"`.
TIM-268's `distinctFrom` names only FIN-131 and REM-153.

Worse, **TIM-268 and TIM-61 share an identical `instanceKey: ["obligation_id"]`**,
both `one-active-per-key`, both sending a pre-deadline reminder about the same
obligation, both `competition: "none"`, and neither names the other.

- **(a)** Make TIM-268 the explicit **fallback**: it owns an obligation only
  where no type-scoped journey already owns its reminder. One one-sided
  eligibility clause + one suppression.
- **(b)** A shared exclusion group on `obligation_id` ordering TIM-61 (owns the
  deadline's *state*) above TIM-268 (owns the *sending*).
- **(c)** Make TIM-61's `a.remind` defer to TIM-268 outright.

**Recommendation: (a)** — it fixes all nine collisions with one rule, and
matches TIM-268's own stated principle ("This is the sending, and it reads that
state rather than defining it"), which it currently applies to 1 of 10 cases.

### A5 · RET-30 does not stop when the customer cancels · **P0**

`RET-30.w.outcome.until` lists four events and **`cancellation_confirmed` is
not among them**. A customer who ignores the retention offer and completes the
cancellation triggers none of the four, so the wait times out into
`a.followup` — a retention follow-up landing while SUB-262 sends the wind-down
notice. That is exactly the re-litigation `SUB-262.s.g1` forbids.

RET-28 watches for that event in both its waits; RET-30 did not inherit it.

- **(a)** Add `cancellation_confirmed` + `cancellation_flow_abandoned` to
  `w.outcome.until`, plus a "decided meanwhile" branch routing to the existing
  `h.proceed`.
- **(b)** A suppression on RET-30 alone.
- **(c)** Put SUB-262 into `retention-outreach` so the group orders them.

**Recommendation: (a)** — smallest change, uses a handoff that already exists.

### A6 · New Lead Welcome vs Lead Nurture · **P0**

`ACQ-285.a.nurture` and `ACQ-09.a.educate` are the **same action**: a bounded
education window on the declared subject, email, `observation-window`,
`x.sunset`. One form fill satisfies both triggers. Different keys (`capture_id`
vs `lead_id`), both `competition: "none"`, neither `distinctFrom` names the
other — so neither's "no instance already open" clause can even see the other.

- **(a)** Reciprocal `distinctFrom` + a shared exclusion group with explicit
  precedence and `onLoss`.
- **(b)** A one-sided eligibility clause naming the other's open state — the
  pattern FUL-146/FUL-265 and FBK-41/FBK-42 already use successfully.

**Recommendation: (b)** — cheaper, and the repo already has two working
examples.

### A7 · Onboarding Personalization vs Onboarding Nurture · **P0**

`onboarding_active_without_activation` stays true for the whole of ACT-19's
`w.answer`, so ACT-12's `a.surface` fires beside ACT-19's `a.ask` on the same
channels — ACT-12 may push the very step the answer was about to re-route.

ACT-12 has a purpose-built eligibility clause and `s.assisted` suppression for
**ACT-14** — a structural twin of this case — and nothing for ACT-19.

**Recommendation:** copy the ACT-14 clause for ACT-19. The pattern is already
in the same journey.

### A8 · Grace Period vs Expired Access · **P0**

During grace the primary validity *has* ended and an expiry *is* recorded, so a
holder hitting the reduced function satisfies TIM-281's trigger while TIM-274
is mid-window — and that is the **normal** way grace is discovered. Both then
name a recovery route, and they may name *different* ones, since TIM-281
re-derives from current rules at `a.establish`.

TIM-281's `distinctFrom` reaches past grace to TIM-63 and skips the journey
running right now.

**Recommendation:** one-sided eligibility on TIM-281 — "no grace window open
for this entity".

### A9 · Two more P0 pairs outside the assigned clusters

- **SUB-163 vs TIM-63.** `TIM-63.entity.scope` literally begins "a
  subscription". A term end fires both; `SUB-163.a.notice` is a contractual
  notice **exempt from pressure caps**, so nothing deduplicates them. TIM-63 is
  outside SUB-163's `relationship-continuity` group.
- **TIM-274 vs ACC-261 (+ FIN-134).** One unpaid obligation makes FIN-134 fire
  *both* `h.grace → TIM-65` and `h.restrict → ACC-78`, whose narrator journeys
  then send near-verbatim the same message (what stopped, what still works, the
  deadline, the one condition that restores it) — plus FIN-134's own `a.remind`
  as a third.

**Recommendation:** group membership for the first; for the second, decide
which of the three owns the "what stopped and how to fix it" message.

---

## B · Touch counts and caps — five rows where graph, cap and prose disagree

| # | Journey | Graph | Cap | Prose | Options |
|---|---|---|---|---|---|
| B1 | **ACT-17** | 5 | 4 | map claims ≤3 | raise cap to 5 · lower nudge budget to 2 · correct the map |
| B2 | **ACT-12** | 5 | 5 *(example-only)* | map claims ≤3 | accept 5 and correct the map · lower the budget |
| B3 | **ACQ-09** | 1 | required, no default | "a window of useful education" | fix prose to one touch · add education nodes |
| B4 | **ACQ-285** | 2 per path | 3 | — | correct cap to 2 · record that the cap counts nodes not paths |
| B5 | **ACT-13, FBK-49** | 1 customer | 2 (counts the internal `task`) | — | redefine caps as customer-touch caps → 1 · document that they include work items |

**Recommendation:** B1 (b) lower the nudge budget — 5 touches for an adoption
nudge is over the brief's own 1–3 guidance. B2 (a) accept, correct the map.
B3 (a) fix the prose — the blueprint argues one touch is the better design.
B4 (a). B5 (a) — a cap that counts internal work items is not a contact cap.

---

## C · Data hygiene — small, mechanical, no product judgement

| # | Item | Options | Recommendation |
|---|---|---|---|
| C1 | **ACQ-287/288 prose promises "a fixed three-touch cascade", graphs contain two** | correct the prose · add a third node | correct the prose — two touches is right for a cart |
| C2 | **FUL-146, FUL-148 have zero exit nodes** — every ending is a handoff to a non-public journey, so a reader sees no ending | detail page states "ends by handing off to …" · add terminal exits | the page treatment — exits would duplicate state the receiver owns |
| C3 | **FUL-265's `x.unresolved` is a handoff wearing an exit's id** | rename to `h.unresolved` · require consumers to read `kind` | rename |
| C4 | **RSK-273's `a.reset` recipient is unstated** on the held-elsewhere path | state the party · split into two notices | state the party |
| C5 | **INC-254 has no wait node**; the orchestration map counts it under Event-or-timeout | correct the map · add a wait | correct the map — "an incident update that waits is not an incident update" |

---

## D · Canvas — open visual items

| # | Item | Evidence | Options | Recommendation |
|---|---|---|---|---|
| D1 | **Exit capsule sizing** | slot is 68; worst Turkish exit needs 103 in a 200px slot | widen the exit slot · per-node content-aware sizing · tighter exit text budget | widen to ~240 and re-measure; it is the cheapest of the three |
| D2 | **Card text budget is characters, the card is pixels** | `CARD_BODY_BUDGET = 120` vs ~70 chars on the widest card; 29 conditions and 33 exits overflow and get cut mid-word | fit the budget per card kind · make it a pixel estimate like `estimatedLabelWidth` | pixel estimate — the repo already has the fitting method |
| D3 | **Branch labels: two files disagree on width** | ELK reserves 360px, the chip is a 200px `whitespace-nowrap` foreignObject; 58 EN + 75 TR labels over 24 chars | one constant, one budget | one constant |
| D4 | **Branch labels sit mid-connector, not near the split** | `elk.edgeLabels.placement` is unset (defaults CENTER) | set `TAIL` | set it — one option, no coordinates, and the brief asks for labels near the split |
| D5 | **Figure captions count nodes the canvas does not draw** | 34 of 51 captions state the canonical count, not the drawn one (ACQ-288 says "22 nodes" over 16 cards) | count the `CanvasLayout` · keep canonical and relabel | count the layout |
| D6 | **Trigger does not read "When someone X"** and carries a provenance pill | the brief's target language | reword · leave | reword |
| D7 | **Archived handoff is a link that isn't**, with no reason on the card | signal already computed | say why on the card · leave | say why |

---

## What I would do, in order

1. **A1** (ACQ-287/288 contract) — removes A2 and A3 with it.
2. **A4** (TIM-268 fallback rule) — one rule, nine collisions.
3. **A5, A6, A7, A8, A9** — each is one clause, all copy patterns already in
   the repo.
4. **B1–B5, C1–C5** — mechanical once the ownership rules are settled.
5. **D4, D3, D1** — cheap canvas wins, in that order.
6. Then Phase 21 batches, which at that point are mostly writing.
