# Collision review — ownership boundaries across the 52 public journeys

**Scope.** The 52 public journeys of `audit/public-journey-scope.md` are fixed. Nothing below
proposes merging, deleting or restoring a journey. Every finding is about **which of two
co-existing journeys owns a customer at a given moment, and the event that transfers that
ownership.**

**Source.** `production/canonical-dump.json` only. Every quoted string is a verbatim field
value from that file. Field paths used: `entity.instanceKey`, `entity.concurrency`,
`eligibility[]`, `suppressions[].text`, `distinctFrom[].because`,
`contact.competition.{exclusionGroup,precedence,onLoss}`, `contact.cooldown`,
`contact.localCap`, and the `nodes[]` graph (`trigger.event`, `wait.until[]`,
`condition.branches[]`, `handoff.{to,on,carries,suppresses}`).

**What counts as enforcement.** A boundary is *enforced* only if one of these exists:

1. a **handoff node** whose `on` names the transfer event, ideally with `suppresses`;
2. an **eligibility clause or suppression** that names the other journey or its state;
3. a **`contact.competition` exclusion group** that both journeys belong to, with a
   `precedence` that orders them and an `onLoss` that says what the loser does.

A `distinctFrom.because` is **not** enforcement. It tells a library reader how two journeys
differ in concept; it does not tell a runtime which one owns the person. Several boundaries
below rest on a `distinctFrom` alone, and those are called out as such.

**Severity.**

| | |
|---|---|
| **P0** | Two journeys will send the same person a message about the same thing. |
| **P1** | Ownership is ambiguous, or assigned to a journey that cannot hold it, but no double-send. |
| **P2** | Naming, documentation or symmetry only. |

One scope note that suppresses severity throughout: **RET-24 has no customer-facing
communication node** (`channels: ["task"]`, its only touch is `a.owner-task`, an
`execution: "human"` action). RET-24 therefore cannot participate in a double-send, and every
RET-24 finding is capped at P1.

---

## Findings index

| # | Cluster | Journeys | Severity | Enforced today? |
|---|---|---|---|---|
| S1 | systemic | ACQ-288, ACQ-287 | **P0** | No — no contract at all |
| S2 | systemic | TIM-268 vs 9 others | **P0** | No |
| C1.1 | abandonment | ACQ-288 vs ACQ-12 | **P0** | `distinctFrom` only |
| C1.2 | abandonment | ACQ-287 vs ACQ-11 | **P0** | `distinctFrom` only |
| C1.3 | abandonment | ACQ-287 vs FIN-134 | **P0** | No |
| C1.4 | abandonment | ACQ-288 late checkout | P1 | Partial — gap in `w.third` |
| C1.5 | abandonment | ACQ-288 → ACQ-287 touch budget | P1 | Half — `carries` has no receiver |
| C1.6 | abandonment | ACQ-288 → ACQ-287, ACQ-12 → ACQ-11 | — | **Yes** |
| C2.1 | lead | ACQ-285 vs ACQ-09 | **P0** | No |
| C2.2 | lead | ACQ-09 vs ACT-20 | P1 | One-sided |
| C2.3 | lead | ACQ-13 vs ACQ-12 vs RET-31 vs SCH-282 | — | **Yes** |
| C3.1 | onboarding | ACT-19 vs ACT-12 | **P0** | No |
| C3.2 | onboarding | ACT-12 vs ACT-13 vs ACT-14 | — | **Yes** (model case) |
| C3.3 | onboarding | FBK-49 vs ACT-13 | P1 | `distinctFrom` only |
| C3.4 | onboarding | ACT-12 `distinctFrom` absent | P2 | n/a |
| C4.1 | adoption | ACT-17 vs ACT-18 forward edge | — | **Yes** |
| C4.2 | adoption | ACT-18 → ACT-17 return edge | P1 | Contradicted by ACT-17 eligibility |
| C4.3 | adoption | ACT-17 outside `retention-outreach` | P2 | No |
| C5.1 | retention | RET-30 vs SUB-262 | **P0** | No |
| C5.2 | retention | RET-24 / RET-28 / RET-30 / RET-32 / ACT-20 | — | **Yes** |
| C5.3 | retention | SUB-262 outside `retention-outreach` | P2 | Indirect |
| C6.1 | delivery | FUL-146 vs FUL-265 | — | **Yes** (model case) |
| C6.2 | delivery | FUL-265 has no delay state | P1 | Owner cannot hold it |
| C6.3 | delivery | FUL-265 → FUL-148 → REM-151 → REM-157 | — | **Yes** |
| C7.1 | feedback | FBK-41 vs FBK-42 | — | **Yes** (model case) |
| C7.2 | feedback | FBK-42 via FBK-43 skips the ask budget | P1 | One-sided |
| C7.3 | feedback | FBK-43 `distinctFrom` absent | P2 | n/a |
| C8.1 | time | TIM-268 vs TIM-61 | **P0** | No |
| C8.2 | time | TIM-274 vs TIM-281 | **P0** | No |
| C8.3 | time | TIM-61 vs TIM-63 | P1 | `distinctFrom` only |
| C8.4 | time | TIM-63 → TIM-64 → TIM-274; TIM-281 vs TIM-63 | — | **Yes** |
| A1 | additional | SUB-163 vs TIM-63 | **P0** | No |
| A2 | additional | TIM-274 vs ACC-261 (+ FIN-134) | **P0** | No |
| A3 | additional | ACC-263 vs ACT-12 | P1 | No |
| A4 | additional | INC-254 vs FUL-146 / RET-26 | P1 | One-sided |
| A5 | additional | DOC-215 vs TIM-268 | P1 | No (instance of S2) |
| A6 | additional | SCH-266 vs SCH-277 | — | **Yes** (model case) |
| A7 | additional | SUB-163 vs FIN-134 | — | **Yes** |

**8 P0, 13 P1, 5 P2, 10 boundaries already sufficient.**

---

# Systemic findings

## S1 — ACQ-288 and ACQ-287 carry no ownership contract at all — **P0**

These two are the only journeys of the 52 with **zero** `eligibility`, **zero**
`suppressions`, no `measurement`, no `discovery`, no `orchestration`, no `contact` block,
an **empty `entity.instanceKey`** and **no `entity.concurrency`**. Every one of the other 50
has all of them. Verifiable in one pass over the dump:

```
id      | elig | suppr | measurement | contact | competition.exclusionGroup
ACQ-288 |  0   |   0   |   false     |  false  | -
ACQ-287 |  0   |   0   |   false     |  false  | -
(all other 50: elig >= 3, suppr >= 3, measurement true, contact true)
```

Three distinct consequences, each of which produces a finding below:

- **No `contact.competition`** means neither is a member of the `commerce-recovery`
  exclusion group. That group is otherwise a complete, consistent total order over the
  same customer:

  | journey | `competition.precedence` |
  |---|---|
  | ACQ-11 | "highest in the group - a process in motion outranks a held selection…" |
  | ACQ-12 | "below process recovery…; above interest recovery and predicted-need replenishment" |
  | RET-31 | "below process recovery and selection recovery…; above interest recovery" |
  | SCH-282 | "below process recovery and selection recovery; alongside interest recovery…" |
  | ACQ-13 | "lowest in the group - a process in motion, a held selection and a predicted need all outrank an inferred interest" |

  The two journeys that most obviously belong in that order — the cart and the checkout —
  sit outside it and are ranked against nothing. (→ C1.1, C1.2)
- **No `eligibility`** means no "no instance is already open" clause and no
  "no payment failure is recorded" clause. (→ C1.3)
- **Empty `instanceKey` / no `concurrency`** means there is no statement that two
  instances cannot run for one person. Every other journey carries
  `concurrency: "one-active-per-key"`. The `entity.note` on both does gesture at it
  ("Cleared or emptied then refilled is a new instance, not a reopened one") but a note is
  prose, not a key.

**PROPOSAL S1.** Bring ACQ-288 and ACQ-287 up to the contract the other 50 carry, at minimum:

- `ACQ-288.entity.instanceKey = ["person_id", "cart_id"]`,
  `ACQ-287.entity.instanceKey = ["person_id", "checkout_id"]`, both
  `concurrency: "one-active-per-key"`. Both ids already appear in
  `ACQ-288.h.checkout.contract.requiredFields: ["cart_id", "person_id", "checkout_id"]`,
  so the keys are already load-bearing — they are simply not declared.
- `ACQ-288.contact.competition`: `exclusionGroup: "commerce-recovery"`, `scope: "person"`,
  `precedence: "at selection-recovery rank - equal to ACQ-12, below process and checkout
  recovery, above predicted need and inferred interest"`, `onLoss: "suppressed"`.
- `ACQ-287.contact.competition`: `exclusionGroup: "commerce-recovery"`, `scope: "person"`,
  `precedence: "at process-recovery rank - equal to ACQ-11, highest in the group"`,
  `onLoss: "suppressed"`.

## S2 — TIM-268 is a universal collider for deadline reminders — **P0**

TIM-268 Action Required Reminder is the only journey in the 52 whose entry condition is
*generic*. Its `eligibility` is:

> "an authoritative record that a defined action is owed by a named person"
> "a due date recorded against it"

and its `entity.instanceKey` is `["obligation_id"]` — the obligation, unqualified. Its
`suppressions[s.g3]` bounds it to "One reminder before the deadline and one notice after it."

Nine other public journeys send their own reminder about a customer-owed action with a fixed
date, each scoped to its own entity type and each self-capped at one or two touches:

| journey | what is owed | its own cap |
|---|---|---|
| TIM-61 Deadline Tracking | any obligation with a deadline | "One reminder per pre-deadline threshold the governing policy defines" |
| TIM-63 Expiry Reminder | a validity about to lapse | "One pre-expiry message per validity" |
| DOC-215 Signature Reminder | a signature on a version | "One reminder per signer" |
| REL-284 Invitation Reminder | acceptance of an invitation | "One reminder, never two. The expiry is the pressure" |
| ACC-263 Activation Reminder | first use of an entitlement | "One reminder, never two" |
| RLT-279 Upgrade Blocker Reminder | a change prerequisite | "Two prompts at most" |
| SCH-266 Appointment Reminder | booking prerequisites | "One reminder per occurrence" |
| ACT-13 Onboarding Blocker Reminder | an activation requirement | `activation_blocker.touches` = 2 |
| FBK-49 Missing Information Reminder | a blocking data item | `missing_critical.touches` = 2 |

Every one of these is a subset of TIM-268's eligibility. TIM-268 names **none** of them:
`distinctFrom` lists only FIN-131 and REM-153, and `contact.competition` is `"none"`. Each of
the nine caps itself and none of them caps TIM-268, so the customer receives the specific
reminder *and* the generic one. Both are `pressureClass: "service"`, so no pressure cap
separates them.

TIM-268's own `distinctFrom[FIN-131].because` already states the correct principle —

> "FIN-131 holds what is owed as its own state, independent of anything sent about it. This is
> the sending, and it reads that state rather than defining it"

— but it is applied to exactly one journey out of the ten that hold their own state.

**PROPOSAL S2.** TIM-268 is the **fallback** reminder: it owns an obligation only where no
journey scoped to that obligation's type already owns the reminder. Add to
`TIM-268.eligibility`:

> "no journey scoped to this obligation's own type already owns its reminder — a deadline
> tracked by TIM-61, an expiry by TIM-63, a signature by DOC-215, an invitation by REL-284,
> an entitlement activation by ACC-263, a change prerequisite by RLT-279, a booking
> prerequisite by SCH-266, an activation requirement by ACT-13, or a blocking data item by
> FBK-49. The type-scoped journey owns the reminder; this journey is what reminds a person of
> an obligation nothing else owns."

and a matching `suppressions` entry labelled `CANONICAL_RULE`. This is a one-sided rule and
needs no change to the other nine, because each already asserts ownership of its own type.

---

# Cluster 1 — Abandonment: ACQ-12 / ACQ-11 / ACQ-288 / ACQ-287

## The state

One shopper, two nested lifecycle states:

```
items held, no process       →  process in motion (checkout/application/quote)
ACQ-12 Abandoned Selection       ACQ-11 Abandoned Process
ACQ-288 Cart Abandonment         ACQ-287 Checkout Abandonment
```

The **vertical** boundary (selection → process) is correct on both rows. The **horizontal**
one (generic pattern vs concrete implementation) is not a boundary at all.

## C1.6 — The vertical boundary is enforced, both times — sufficient

`ACQ-12.h.process`:

> `to: "ACQ-11"`, `on: "a process started from the selection - the process owns recovery from
> that moment"`, `suppresses: ["every queued recovery touch for this selection"]`

`ACQ-288.h.checkout`:

> `to: "ACQ-287"`, `on: "checkout started from this cart - Checkout Abandonment owns recovery
> from that moment"`, `suppresses: ["every queued cart reminder for this cart"]`

Both are reachable from every state-check node (`c.state`, `c.state2`, `c.state3` /
`c.checkout1`, `c.checkout2`), both `carries` the already-sent touch count forward, and
ACQ-12's `suppressions[s.process]` states the rule in words: *"A process started from the
selection hands the instance to Abandoned Process Recovery (ACQ-11); the two never message the
same person about the same items."* Nothing to fix. This is the shape every other finding in
this review is measured against.

## C1.1 — ACQ-288 Cart Abandonment vs ACQ-12 Abandoned Selection — **P0**

**Overlapping state.** A shopper holding items and not yet in checkout.

**Who owns it.** Currently: both. `ACQ-12.t.selected` fires on `selection_recorded`, whose
entity scope is *"the recorded selection - the set of items a person put in a cart, basket or
saved list"*. `ACQ-288.t.added` fires on `item_added_to_cart`. A cart add satisfies both. Both
then run their own reminder plan on the same items: ACQ-12 sends two touches on
`[email, push, in-app]`, ACQ-288 sends three on `[push, email, whatsapp, sms]`.

**Current data.** `ACQ-288.distinctFrom[ACQ-12].because` is a long and accurate description:

> "ACQ-12 is the general-purpose pattern for any held selection (a cart, a saved list) and
> stays deliberately generic … This journey is the concrete cart implementation: a fixed
> three-touch cascade with an explicit channel priority and fallback per touch, a high-value
> branch …"

That distinguishes the two as **library artefacts**. It says nothing about which one owns a
live shopper, and ACQ-12 does not reciprocate — its `distinctFrom` lists ACQ-11 and ACQ-13
only. **MISSING**: no suppression, no eligibility clause, no shared exclusion group (see S1).

**Transfer event.** There is none, because these are not sequential states — they are two
implementations of one state. Ownership is decided **at adoption time**, not at runtime, and
the canonical data has no way to say so.

**PROPOSAL C1.1.** Make the mutual exclusivity a hard rule rather than an observation.

1. Add to `ACQ-12.suppressions`, label `CANONICAL_RULE`:
   > "ACQ-288 is this pattern's concrete cart implementation. A company that has adopted
   > ACQ-288 for a selection type runs ACQ-288 for it and not this journey; a selection of that
   > type never opens an instance here. The two are one plan in two shapes, never two plans."
2. Add the reciprocal to `ACQ-288.suppressions` (new field — see S1), label `CANONICAL_RULE`:
   > "Exactly one of ACQ-288 and ACQ-12 owns a given selection type. Where this journey is
   > adopted for carts, a cart never opens an ACQ-12 instance; ACQ-12 continues to own saved
   > lists and any other held selection this journey does not cover."
3. Add to `ACQ-288.eligibility`: *"no ACQ-12 selection-recovery instance is open for the same
   items"*, mirroring ACQ-12's own *"no recovery instance is already open for this selection"*.

## C1.2 — ACQ-287 Checkout Abandonment vs ACQ-11 Abandoned Process — **P0**

Identical in shape to C1.1, one level down. `ACQ-11.entity.scope` is *"the logical process -
the basket-and-checkout, application, quote or registration the person is trying to complete"*
— a checkout is named first. `ACQ-287.t.started` fires on `checkout_started`;
`ACQ-11.t.started` fires on `process_started`. Both send a three-touch cascade about the same
unfinished checkout.

`ACQ-287.distinctFrom[ACQ-11].because` again describes the pattern/implementation split and
again is not reciprocated. **MISSING**, same as C1.1.

**PROPOSAL C1.2.** The same three edits with ACQ-11/ACQ-287 substituted. ACQ-11's
`contact.competition.precedence` already reads *"highest in the group - a process in motion
outranks a held selection"*; ACQ-287 must inherit that rank verbatim (S1), or a cart reminder
and a checkout reminder will contend on equal footing.

## C1.3 — ACQ-287 keeps sending while FIN-134 owns the payment — **P0**

**Overlapping state.** A checkout whose payment attempt failed.

**Who owns it.** FIN-134 Payment Failure Recovery, unambiguously. ACQ-11 says so three times:

- `eligibility`: *"no payment failure is recorded on the process - a failed payment is
  FIN-134's, not abandonment"*
- `suppressions[s.payment]`: *"A payment failure on the process hands the instance to payment
  failure recovery (FIN-134). The two never message the same person about the same process."*
- `h.payment` is reachable from **all four** of ACQ-11's state-check nodes (`c.state`,
  `c.state2`, `c.state3`, `c.close`), with
  `suppresses: ["every queued recovery touch for this process"]`.

**Current data on ACQ-287.** Nothing. Its three waits listen for one event each:

```
w.first  until: ["process_completed"]
w.second until: ["process_completed"]
w.third  until: ["process_completed"]
```

No `payment_failed`, no eligibility clause, no suppression, no handoff — ACQ-287 has **zero**
handoff nodes. A shopper whose card declines therefore receives FIN-134's `a.corrective`
("Request the exact corrective action - update the method, complete the authentication…") and
ACQ-287's `a.reminder2-hv` ("Send the second checkout reminder … using the more direct register
a high-value checkout warrants", on WhatsApp or SMS) about the same money. FIN-134 is
explicitly exempt from pressure caps — *"Pressure caps do not: this is transactional
communication about an obligation the person already holds"* — so nothing downstream deduplicates
them either.

**PROPOSAL C1.3.** Port ACQ-11's payment boundary onto ACQ-287 verbatim:

1. `ACQ-287.eligibility` += *"no payment failure is recorded against this checkout - a failed
   payment is FIN-134's, not abandonment"*.
2. `ACQ-287.suppressions` += `CANONICAL_RULE`: *"A payment failure on the checkout hands the
   instance to payment failure recovery (FIN-134). The two never message the same person about
   the same checkout."*
3. Add `payment_failed` to all three `w.*.until` lists, and add a handoff node
   `h.payment → FIN-134`, `on: "a payment failure recorded against this checkout - a failed
   payment is not abandonment"`, `suppresses: ["every queued checkout reminder for this
   checkout"]`, reachable from each `c.completed*` node via a new branch.

Apply the same three edits to ACQ-288 for a payment failure taken at the cart (some platforms
authorise there).

## C1.4 — ACQ-288 stops watching for checkout at its third wait — P1

```
w.first  until: [selection_cleared, process_completed, checkout_started]   ✓
w.second until: [process_completed, checkout_started]                      ✓
w.third  until: [process_completed, selection_cleared]                     ← checkout_started dropped
```

After the second reminder, `w.third` runs for 48 hours (`cart_abandonment.final_check`) and
does not listen for `checkout_started`. Its timeout path is `c.purchased3 → c.active2 →
x.abandoned`, with no checkout condition anywhere on it — there is no `c.checkout3` to match
`c.checkout1` and `c.checkout2`.

No double-send results, because nothing is sent after `w.third`. What is lost is the handoff
itself: ACQ-287 never receives the `carries` payload, its plan does not count the two cart
touches already spent against the person, and ACQ-288 closes at `x.abandoned` — *"a new
`item_added_to_cart` for this person opens a new instance"* — for a shopper who actually
reached checkout. That is a mis-recorded outcome on a journey that has no `measurement` block
to catch it (S1).

**PROPOSAL C1.4.** Add `checkout_started` to `w.third.until`, and a `c.checkout3` node between
`c.purchased3` and `c.active2` with the same two branches as `c.checkout2`, the "Started" branch
routing to the existing `h.checkout`.

## C1.5 — the carried touch count has no receiver — P1

`ACQ-288.h.checkout.carries` includes:

> "the cart reminder touches already sent, so the checkout journey's plan counts them against
> the person"

ACQ-287 has no `contact` block, therefore no `localCap`, therefore nothing to count them
against. Compare the working pair: `ACQ-12.h.process.carries` says the same thing, and ACQ-11
*does* have `contact.localCap.value.key: "recovery.touches"` with the rule *"Every touch runs
against a budget fixed when the instance opened"* to receive it. The handoff makes a promise the
receiving journey cannot keep, so a shopper can take 2 cart touches + 3 checkout touches = 5.

**PROPOSAL C1.5.** Resolved by S1: give ACQ-287 a `contact.localCap`
(`key: "checkout_abandonment.touches"`, default 3) and ACQ-288 the same
(`key: "cart_abandonment.touches"`, default 3), and add to ACQ-287's cap rule the sentence
ACQ-11's carries relies on: *"touches carried in from a cart instance count against this
budget"*.

---

# Cluster 2 — Lead: ACQ-09 / ACQ-285 / ACQ-13

## C2.1 — ACQ-285 New Lead Welcome vs ACQ-09 Lead Nurture — **P0**

**Overlapping state.** A person who filled in a form, gave permission, and is not yet ready
for a destination.

**Who owns it.** Both, and both send a bounded educational email sequence on the subject the
person declared. The two actions are the same action:

| | ACQ-285 `a.nurture` | ACQ-09 `a.educate` |
|---|---|---|
| `does` | "Open a bounded sequence on the subject they declared, and state where it ends when it opens." | "Send education matched to the reason the person actually entered - not a generic sequence, and not sales pressure repeated at intervals" |
| wait | `w.nurture`, `captured_interest.nurture`, `class: observation-window` | `w.window`, `bounded_education.window`, `class: observation-window` |
| end | `x.sunset` on timeout | `x.sunset` on timeout |
| channel | `email` | `email`, `in-app` |

**Triggers both fire on one form fill.** `ACQ-285.t.captured` on
`first_party_interest_captured`, eligibility *"a first-party capture recorded with the context
the person declared"*. `ACQ-09.t.not-ready` on `valid_lead_not_destination_ready`, eligibility
*"a captured lead with a recorded entry reason and no destination it is ready for"*. A capture
that asks for material and carries permission produces exactly that state.

**Current data. MISSING entirely.** Neither journey's `distinctFrom` names the other
(ACQ-285 → ACQ-02; ACQ-09 → ACQ-07). Both have `contact.competition: "none"` — the literal
string, not an object — so neither is in any exclusion group. Their keys are different
(`[capture_id]` vs `[lead_id]`), so the per-journey "no instance is already open" clauses
cannot see each other. Both are `pressureClass: "promotional"`, which is the only thing
standing between the lead and two nurture sequences, and a pressure cap rations frequency, it
does not assign ownership.

**Transfer event.** ACQ-285 is per-capture and terminates; ACQ-09 is per-lead and bounded. The
honest split is: **ACQ-285 owns everything the capture itself asked for, including the bounded
sequence that capture's permission bought. ACQ-09 owns a lead whose capture has been fulfilled
and closed and who still has no destination.** The transfer event is ACQ-285 reaching
`x.delivered` or `x.sunset`.

**PROPOSAL C2.1.**

1. `ACQ-09.eligibility` += *"no ACQ-285 capture-fulfilment instance is open for this lead — the
   capture's own bounded sequence belongs to the capture that earned the permission, and this
   journey opens only once that instance has closed at `x.delivered` or `x.sunset`"*.
2. `ACQ-09.suppressions` += `CANONICAL_RULE`: *"One bounded education window at a time. A
   capture-fulfilment sequence already running for this person owns the education it promised;
   opening a second window here sends two sequences on one permission."*
3. `ACQ-285.h.person` already carries *"what was already sent to them and when"*. Add the same
   line to a new statement on `x.sunset.reEntry` so ACQ-09, opening afterwards, does not restate
   what the capture sequence already sent — ACQ-09's `h.progressed.carries` already asks for
   exactly this: *"the entry reason and what education was already sent, so the next journey does
   not restate it"*.
4. Put both in one exclusion group: `exclusionGroup: "lead-education"`, `scope: "person"`,
   ACQ-285 `precedence: "above bounded nurture - the capture's own permission bought this
   sequence"`, ACQ-09 `precedence: "below capture fulfilment"`, both `onLoss: "suppressed"`.

## C2.2 — ACQ-09 vs ACT-20 Dormant Lead Reactivation — P1

ACT-20 declares `contact.competition`:

> `exclusionGroup: "lifecycle-stage"`, `precedence: "lowest in the group - any current
> lifecycle on the same person outranks reactivation"`, `onLoss: "exit"`

That is the right rule and it is stated well. But **ACQ-09 is not in the `lifecycle-stage`
group** (`competition: "none"`), so "any current lifecycle on the same person" cannot see an
open nurture window. ACQ-09's own `suppressions[s.g1]` — *"Nurture does not run forever. The
window is bounded at entry and it closes on time"* — means a lead can sit inside a long bounded
window and cross the dormancy threshold inside it, at which point ACT-20's `a.attempt`
("Make one bounded attempt built on the recorded reason") lands on top of ACQ-09's education.

Only `lifecycle-stage` members are ACT-12 and ACT-20. ACT-12 is inside the group and protected;
ACQ-09 is not.

**PROPOSAL C2.2.** Give ACQ-09 `contact.competition`:
`exclusionGroup: "lifecycle-stage"`, `scope: "person"`,
`precedence: "above reactivation - a bounded education window that has not closed is a current
lifecycle"`, `onLoss: "suppressed"`. ACT-20 needs no change; its `onLoss: "exit"` already does
the right thing from the other side.

## C2.3 — ACQ-13 vs ACQ-12 vs RET-31 vs SCH-282 — sufficient

The `commerce-recovery` total order (quoted in full under S1) is complete and internally
consistent across these four, and each pair also carries a reciprocal `distinctFrom`:

- `ACQ-12.distinctFrom[ACQ-13]`: *"ACQ-13 works from inferred attention. A selection is a
  recorded fact the person created…"* ↔ `ACQ-13.distinctFrom[ACQ-12]`: *"ACQ-12 works from a
  selection the person recorded. Interest is inferred from attention…"*
- `RET-31.distinctFrom[ACQ-13]`: *"ACQ-13 works from observed attention. A predicted need rests
  on a purchase the person made and a usable period, with no attention observed at all."*

and `ACQ-13.suppressions[s.contest]` restates its own rank in words: *"This journey is lowest in
the commerce-recovery group…"*. Nothing to fix. The only defect is that ACQ-288 and ACQ-287 are
absent from this order (S1), and that SCH-282's `distinctFrom` does not reciprocate ACQ-12's
and ACQ-13's references to it — cosmetic, P2.

---

# Cluster 3 — Onboarding: ACT-12 / ACT-14 / ACT-13 / ACT-19

## C3.2 — ACT-12 vs ACT-13 vs ACT-14 is the best-enforced triangle in the corpus — sufficient

Worth stating in full, because it is the standard the rest of this cluster fails.

**ACT-12 → ACT-13 (named blocker takes over).** Three independent mechanisms:

- `ACT-12.suppressions[s.blocker]`: *"When one named mandatory prerequisite is established as
  the thing preventing activation, the blocker journey (ACT-13) owns the account; nurture steps
  stop."*
- `ACT-12.h.blocker`: `to: "ACT-13"`, `on: "one named mandatory prerequisite established as the
  thing preventing activation, rather than a general lack of progress"`,
  `suppresses: ["the generic next-step prompt for this prerequisite while the blocker journey
  owns it"]`
- the return edge `ACT-13.h.resume → ACT-12`, `on: "the blocker cleared and activation reachable
  again"`, carrying *"the setup state as it now stands, so onboarding resumes rather than
  restarts"*.

**ACT-12 → ACT-14 (assisted session takes over).** Enforced at the level of a named node:

- `ACT-12.eligibility`: *"no ACT-14 assisted-help session is open (booked and not yet resolved)
  for this account"*
- `ACT-12.suppressions[s.assisted]`: *"An open ACT-14 assisted-help session (booked at
  `a.confirm`, not yet resolved) on the same account takes ownership from this journey's generic
  next-step prompts; nurture steps pause until ACT-14's `w.session` resolves
  (`assisted_session_outcome_recorded` or `booking_cancelled`) or exits, and resume against the
  milestone record as it then stands."*

  That suppression names the other journey's action node, its wait node and both of its
  resolution events. It is the most precise ownership rule in the 52.

**ACT-14 → ACT-13.** `ACT-14.c.duplicate` branch "Already handled":

> "an open support case or an assigned human owner covers the same issue, **or ACT-13 already
> owns a named requirement on this instance** - the struggle is almost always that requirement,
> and a help offer beside a blocker reminder is two voices on one problem"

→ `x.defer`, whose `reEntry` states the re-open condition. Plus reciprocal `distinctFrom` on
both sides. Nothing to fix.

## C3.1 — ACT-19 Onboarding Personalization vs ACT-12 Onboarding Nurture — **P0**

**Overlapping state.** An open onboarding instance without activation, while ACT-19's one
question is outstanding.

**Who owns it.** ACT-19 asks, ACT-12 then advances the adapted path — that is clearly the
intent, and `ACT-19.h.progress → ACT-12` carries *"which adaptations were applied, so they are
not applied twice"*. But nothing enforces the ordering.

`ACT-12.t.active` fires on `onboarding_active_without_activation`. That state is **true for the
entire duration of ACT-19's `w.answer` wait**. ACT-19 sends `a.ask` ("Ask one lightweight
question…") on `[email, in-app]` and waits; ACT-12 concurrently sends `a.surface` ("Surface the
single most useful next action") on `[email, in-app]`. Two onboarding messages, same person,
same instance, same channels, same window — and ACT-12's `a.surface` may well push the very
step ACT-19's answer was about to re-route.

**Current data. MISSING.** ACT-12's eligibility carefully excludes an open ACT-14 session but
says nothing about ACT-19. `ACT-12.distinctFrom` is **absent entirely** (C3.4).
`ACT-19.distinctFrom` is absent too. `ACT-19.contact.competition: "none"`;
`ACT-12.contact.competition.exclusionGroup: "lifecycle-stage"` — so they are not in a common
group either. The asymmetry is telling: ACT-12 has a purpose-built clause for ACT-14, an exact
structural twin of the ACT-19 case, and none for ACT-19.

**Transfer event.** ACT-19's `h.progress`, which fires from `a.adapt` (answer given) **or**
`a.default` (`w.answer` timed out onto the documented default path). Both routes reach it, so
the handoff is guaranteed — it is only the *interim* that is unowned.

**PROPOSAL C3.1.** Mirror the ACT-14 treatment exactly:

1. `ACT-12.eligibility` += *"no ACT-19 personalization question is outstanding (asked at
   `a.ask`, not yet resolved) for this onboarding instance"*.
2. `ACT-12.suppressions` += `CANONICAL_RULE`, `id: s.personalization`:
   > "An outstanding ACT-19 personalization question (asked at `a.ask`, not yet answered or
   > defaulted) owns this onboarding instance's next prompt; nurture steps pause until ACT-19
   > resolves through `a.persist` or `a.default` and hands back at `h.progress`, and resume
   > against the adapted path rather than the generic one. A generic next step sent beside an
   > open question is two voices on one setup, and it may push the step the answer was about to
   > change."
3. `ACT-19.distinctFrom` += `{ journey: "ACT-12", because: "ACT-12 advances onboarding along a
   path. This decides which path, and it holds the instance for exactly one question before
   handing it back." }`.

## C3.3 — FBK-49 Missing Information Reminder vs ACT-13 Onboarding Blocker Reminder — P1

**Overlapping state.** Activation blocked because a required field or document is missing.

Both trigger on it. `ACT-13.eligibility`: *"a specific unmet requirement: an integration not
connected, **a required configuration absent**, a verification incomplete…"*.
`FBK-49.eligibility`: *"a named business process that cannot safely proceed, and the specific
field, document or value it is waiting on"*. Both key on `[<entity>, requirement_id]`, both run
`[email, in-app, task]`, both cap at 2 touches, both ask the account holder for the same item.

**Current data — `distinctFrom` only, one-sided.** `FBK-49.distinctFrom[ACT-13].because`:

> "ACT-13 is scoped to activation specifically and owns resuming onboarding. This applies to any
> named process, most of which have nothing to do with onboarding."

That *does* allocate — ACT-13 owns when the blocked process is activation — which is why this is
P1 and not P0. But it is a definition, not a gate: no eligibility clause, no suppression, and
ACT-13 does not reciprocate (its `distinctFrom` names ACT-14 only). Both have
`contact.competition: "none"`.

**PROPOSAL C3.3.** Promote the existing `distinctFrom` sentence into a gate.
`FBK-49.eligibility` += *"the blocked process is not activation — a data gap that blocks
activation is ACT-13's named requirement, and ACT-13 owns both the request and the resume"*, and
the matching `suppressions` entry. Add `ACT-13.distinctFrom[FBK-49]` as the reciprocal.

## C3.4 — ACT-12 has no `distinctFrom` at all — P2

`ACT-12.distinctFrom` is `undefined`. ACT-12 is the hub of the onboarding cluster: ACT-13,
ACT-14, ACT-17 and ACT-20 all reference it, and ACT-19 hands into it. It references nobody.
Four journeys point at it and it points at none of them, which is why C3.1 was easy to miss.
Add entries for ACT-13, ACT-14, ACT-19 and ACT-17. Documentation only — no runtime effect.

---

# Cluster 4 — Adoption: ACT-17 / ACT-18

## C4.1 — the forward edge is enforced — sufficient

`ACT-17.suppressions[s.stall]`: *"When the observation window closes without repeated value the
instance hands to adoption recovery; a nurture nudge is never sent into a stall."*
`ACT-17.h.stall → ACT-18`, `on: "the early-adoption window passing without repeated value"`,
carrying *"the expected pattern it was measured against, so the stall is diagnosed rather than
assumed"*. Reciprocal `distinctFrom` on both sides (ACT-17 → ACT-12; ACT-18 → ACT-14). Clean.

## C4.2 — the return edge lands on a journey that will not accept it — P1

`ACT-18.h.adoption → ACT-17`, `on: "value produced again after recovery"`.

But ACT-17's own entry conditions contradict the handoff:

- `ACT-17.entry` is `t.activated`, `event: core_activation_completed` — not "value produced
  again". A handoff arriving after recovery does not match ACT-17's trigger.
- `ACT-17.eligibility`: *"an activation or first value-producing event is recorded for this
  account in a named use-case"* and *"no adoption instance is already open for this account and
  use-case"*.
- `ACT-17.contact.cooldown`: *"A second activation in the same use-case is the same
  relationship; a new instance opens only after the previous one has closed and the cooldown has
  passed"*, default 30–90 days. `ACT-18.contact.cooldown` is the same 30–90 days, and its
  recovery window (`adoption_recovery.window`) is drawn from "the product's own intended usage
  rhythm" — typically far shorter. So the return handoff almost always arrives **inside** ACT-17's
  own cooldown.

Two outcomes, neither intended: the handoff is refused by the cooldown and the recovered account
falls out of adoption entirely; or it is honoured and ACT-17 re-enters at `a.recognize`
("Acknowledge what was actually produced") — sending a first-value recognition message to
someone who was recognised weeks earlier and has just been recovered. No simultaneous
double-send, hence P1, but the ownership returns to a journey whose contract says it cannot
take it.

**PROPOSAL C4.2.** Say explicitly that a handoff re-entry is not a new instance.

1. `ACT-17.eligibility` += *"or a return from ACT-18 at `h.adoption` — a recovered stall resumes
   the existing adoption instance rather than opening a new one, and the cooldown does not apply
   to a resume"*.
2. `ACT-17.contact.cooldown.rule` += *"A resume handed back by ACT-18 is not a second
   activation and is not subject to this cooldown."*
3. `ACT-18.h.adoption.carries` += *"that recognition was already sent for this use-case, so
   adoption resumes at the behaviour nudge rather than restating first value"* — so ACT-17
   re-enters at `a.measure`/`c.stable`, not at `a.recognize`.

## C4.3 — ACT-17 is outside the group its own suppression describes — P2

`ACT-17.suppressions[s.contest]` names the exact members of the `retention-outreach` group:

> "An open complaint under human ownership, a live risk case or a declared cancellation intent on
> the same account outranks lifecycle nurture; the touch is deferred and re-evaluated against
> current state (GLB-06)."

Yet `ACT-17.contact.competition` is `"none"`. ACT-18, whose `s.contest` says the same thing,
*is* in the group with `precedence: "lowest in the group"`. The rule is stated in prose on one
and in structure on the other. No behavioural gap as long as the prose is read, hence P2.

**PROPOSAL C4.3.** `ACT-17.contact.competition = { exclusionGroup: "retention-outreach", scope:
"account", precedence: "lowest in the group - alongside adoption recovery", onLoss: "suppressed" }`.

---

# Cluster 5 — Retention: RET-24 / RET-28 / RET-32 / RET-30

## C5.2 — the risk→intent→offer chain is enforced — sufficient

- **RET-24 → RET-28.** `c.intent` is RET-24's *first* node after the trigger, before any
  evidence is assembled: branch "Already cancelling" → `h.cancellation`, `to: "RET-28"`,
  `suppresses: ["any separate retention track for this relationship while the cancellation
  decision is live"]`. Reciprocated by `RET-28.contact.competition.precedence`: *"above
  risk-driven escalation and offer follow-up on the same account - a declared intent to leave
  outranks an inferred risk"*, and by `RET-24`'s own *"below an open issue under human ownership
  and below a declared cancellation intent"*. Both directions, consistent ranks.
- **RET-24 → RET-30.** `h.intervention` carries an unusually careful note about identity:
  *"a `retention_episode_id` minted at this handoff, deterministically derived from `account_id`
  + `risk_episode_id`, since this journey's own episode concept (a churn-risk evaluation) is not
  itself a retention episode"*. This is the right way to bridge two different `instanceKey`s and
  should be the template for every cross-key handoff.
- **RET-24 vs FBK-46.** `c.priority-clear` refuses to raise a second owner-task when a
  human-owned issue already claims the account — a precedence rule implemented as a graph node.
- **RET-32 vs RET-28.** Timing boundary, stated on both: `RET-32.eligibility` *"the
  cancellation's own save window and cooldown have passed"*;
  `RET-32.suppressions[s.recent]` *"A cancellation still inside its own save window or the
  cooldown after it is Cancellation Save's territory (RET-28); nothing is sent here."*;
  `RET-32.distinctFrom[RET-28]` restating it.
- **RET-32 vs ACT-20.** Enforced *in both graphs*: `ACT-20.c.never-monetized` branch "Was a
  paying customer" → `x.winback`, whose `reEntry` reads *"none here - restoring a relationship
  that was once paid for is a different problem with different economics and a different
  message"*; and `RET-32.eligibility` *"the relationship was paid - at least one completed paid
  term or purchase on it"*. A mutually exclusive predicate checked on both sides. Model case.

## C5.1 — RET-30 Retention Offer Follow-Up vs SUB-262 Cancellation Confirmation — **P0**

**Overlapping state.** A customer who was offered a retention alternative, did not answer it,
and then confirmed the cancellation anyway.

**Who owns it.** SUB-262, from `cancellation_confirmed` onward. `SUB-262.suppressions[s.g1]` is
unambiguous:

> "The cancellation is never re-litigated. A save attempt after the decision is a different
> journey and belongs before this one."

**What actually happens.** `RET-30.w.outcome` listens for four events:

```
until: ["retention_offer_accepted", "retention_offer_declined",
        "relationship_recovered", "intervention_failed"]
```

`cancellation_confirmed` is **not among them**. A customer who ignores the offer and simply
completes the cancellation flow triggers none of the four. `w.outcome` therefore runs to its
`retention_intervention.outcome` timeout, which routes `onTimeout: "c.followup"` → branch
"Justified" → `a.followup`: *"Send one follow-up and stop."* — a retention follow-up delivered
to someone SUB-262 is concurrently sending *"Confirm the cancellation, the exact date access ends,
and what remains available until then"* about.

This is precisely the re-litigation `SUB-262.s.g1` forbids, arriving from a journey SUB-262
cannot see: `SUB-262.contact.competition` is `"none"` (C5.3), and `RET-30`'s own competition is
`retention-outreach`, a group SUB-262 does not belong to. `SUB-262.distinctFrom` names RET-28 and
SUB-167 — not RET-30. RET-30's `distinctFrom` names RET-27 only.

Note the contrast with RET-28, which *does* watch for it: `RET-28.w.answer.until` includes
`cancellation_confirmed`, and `w.decision.until` is `["cancellation_confirmed",
"cancellation_flow_abandoned"]`. RET-28 got this right; RET-30 did not inherit it.

**PROPOSAL C5.1.**

1. Add `cancellation_confirmed` (and `cancellation_flow_abandoned`) to `RET-30.w.outcome.until`.
2. Add a branch to `RET-30.c.outcome`:
   > "Decided meanwhile {the cancellation was confirmed while the offer was still open — the
   > wind-down owns the customer from that moment and nothing further is sent here}" →
   > `a.record-decline`, so the unanswered offer is still recorded against the episode, then
   > `c.proceed` → `h.proceed` (which already exists, `to: "SUB-167"`).
3. `RET-30.suppressions` += `CANONICAL_RULE`: *"A confirmed cancellation ends this journey
   wherever it sits: the follow-up is not sent, the queued follow-up is invalidated, and the
   wind-down (SUB-262) owns everything said to the person from that point. A retention follow-up
   delivered after the decision is the re-litigation the wind-down exists to prevent."*
4. `SUB-262.distinctFrom` += `{ journey: "RET-30", because: "RET-30 closes a retention attempt
   made before the decision. This starts at the decision and never carries an offer across it." }`.

## C5.3 — SUB-262 sits outside `retention-outreach` — P2

`SUB-262.contact.competition: "none"`, so the four members of `retention-outreach` (RET-28,
RET-24, RET-30, RET-32, plus ACT-18) cannot rank themselves against an active wind-down. In
practice RET-32 is covered by its own eligibility (*"no active obligation, subscription, open
complaint, payment recovery or process exists on the relationship"* — the subscription is still
active through the wind-down), and RET-28 is covered by the decision boundary. RET-30 is not
(C5.1).

**PROPOSAL C5.3.** `SUB-262.contact.competition = { exclusionGroup: "retention-outreach", scope:
"account", precedence: "above every retention journey - a confirmed cancellation is a decision,
and nothing in the group outranks a decision already taken", onLoss: "suppressed" }`.

---

# Cluster 6 — Delivery: FUL-265 / FUL-146 / FUL-148

## C6.1 — FUL-146 vs FUL-265 is the model reciprocal suppression — sufficient

Two suppressions, one on each journey, naming the same boundary event (dispatch) from each side:

`FUL-146.suppressions[s.g5]`:
> "Once the obligation is handed to a delivery executor, an in-transit slip on the same
> obligation is FUL-265's delay-or-tracking state to hold and report; this journey does not open
> a second, competing delay narrative about a slip FUL-265 is already tracking under its own
> wait."

`FUL-265.suppressions[s.g6]`:
> "A pre-dispatch slip against the original commitment is FUL-146's delay narrative, not this
> journey's; this journey's own tracking begins at dispatch and reports what the executor
> authoritatively confirms from there."

The transfer event is `obligation_handed_to_delivery_executor` — FUL-265's own trigger — so the
boundary is observable, atomic and keyed the same way on both sides (`obligation_id`). This is
what C1.1, C2.1, C3.1, C5.1, C8.1, C8.2, A1 and A2 are all missing.

## C6.2 — FUL-265 has nowhere to put the state FUL-146 hands it — P1

The boundary is agreed; the owner cannot hold it. `FUL-265.w.delivery` listens for
`delivery_delay_reported`:

```
w.delivery until: ["delivery_confirmed", "delivery_failed", "delivery_delay_reported"]
           onEvent: c.delivery
```

but `c.delivery` has exactly two branches:

```
Delivered    {a final delivery confirmation exists, not an intermediate tracking movement}  → a.arrived
Not delivered {a confirmed failure, or a window that has passed with no final outcome}      → a.no-arrival
```

A `delivery_delay_reported` — an in-transit slip, the very thing `FUL-146.s.g5` assigns to
FUL-265 — matches neither description and falls to "Not delivered". That sends `a.no-arrival`
(*"Tell them it has not arrived and say which of the two it is - a confirmed failure, or an
executor we have lost sight of"*) and then `x.unresolved`, a **handoff to FUL-148 Failed Delivery
Recovery**, which classifies the "failure" and may send `a.correct` asking for a corrected
address — for a parcel that is merely running late. Meanwhile FUL-146, the journey that knows how
to say "the original commitment was X, the estimate is now Y", is suppressed by its own `s.g5`.

This also contradicts `FUL-265.suppressions[s.g4]`: *"An executor gone quiet is reported as
unknown, not as failure"* — a reported delay is neither, and the graph has no third option.

**PROPOSAL C6.2.** Give FUL-265 the delay state its own boundary rule promises:

1. Add a branch to `c.delivery`:
   > "Delayed in transit {the executor authoritatively reported a slip against the expected
   > window and has not reported a final outcome}" → a new `a.delay-report`.
2. `a.delay-report` (`execution: "communication"`): *"Report the executor's own revised window
   and that the obligation is still in transit, appending it to the tracking history. The
   original committed window is preserved — what was promised and what it became are two facts.
   Nothing is said about a failure the executor has not reported."* → back to `w.delivery`,
   re-armed against the revised window.
3. `FUL-265.contact.localCap` is currently 3 (*"a dispatch notice, an arrival or non-arrival
   notice, and an acceptance request"*). Raise it and amend the rule to account for at most one
   in-transit delay report, so the new touch is budgeted rather than free.

## C6.3 — the failure chain is enforced — sufficient

`FUL-265.x.unresolved → FUL-148 → (h.return) → REM-151 → (h.remedy) → REM-157`. Each hop mints
the next journey's key deterministically and says why:

- to FUL-148: *"a fresh `delivery_attempt_id`, minted at this handoff and deterministically
  derived from `obligation_id` and the dispatch record - FUL-265 tracks by obligation and person,
  not by attempt"*
- to REM-151: *"a fresh `issue_id`, minted at this handoff and deterministically derived from
  `delivery_attempt_id` - FUL-148 has no issue concept of its own"*

and REM-151 guards against a second lifecycle at `c.duplicate` → `a.attach`: *"No second recovery
lifecycle is opened - two remedies running against one obligation produce two replacements or two
refunds"*. Nothing to fix.

---

# Cluster 7 — Feedback: FBK-41 / FBK-43 / FBK-42

## C7.1 — FBK-41 vs FBK-42 is the best-specified competition rule in the 52 — sufficient

Both declare `exclusionGroup: "outbound-ask"`, `scope: "communication-purpose"`, and each states
the *same* outcome from its own side — including what the loser does afterwards, which almost no
other precedence string does:

`FBK-42.precedence`:
> "This journey wins when both this journey and FBK-41 (satisfaction) are eligible for the same
> person at the same moment: advocacy is the rarer, higher-value ask built on accumulated
> relationship evidence rather than one experience, so it takes the one ask slot. FBK-41 is
> recorded as not-now and remains free to re-open independently at its next moment."

`FBK-41.precedence`:
> "FBK-42 (advocacy) wins when both are eligible for the same person at the same moment: advocacy
> already presupposes satisfaction … This journey's ask is recorded as not-now and remains free
> to re-open independently at its next moment."

Backed by `FBK-41.suppressions[s.frequency]` and the `x.not-now` exit whose `reEntry` forbids
queueing (*"the request is not queued to fire the moment the budget clears"*). Nothing to fix.

## C7.2 — FBK-42 reached via FBK-43 never checks the shared ask budget — P1

The shared budget lives on **FBK-41 only**:

`FBK-41.contact.cooldown`, key `feedback_request.ask_frequency`:
> "The bound on how often this person is asked anything - satisfaction or advocacy - across all
> contexts; an eligible moment inside it is recorded as not-now."

`FBK-42.contact.cooldown`, key `advocacy_eligibility.cooldown`, is boilerplate per-instance text
that does not reference the cross-context bound at all. The `outbound-ask` group resolves
*simultaneous* eligibility but says nothing about *recency*.

So: a customer answers a satisfaction survey (FBK-41 → `x.received`). The response routes into
FBK-43, which reaches `c.eligible` → `h.advocacy → FBK-42`, *"positive evidence reaching the
advocacy threshold"*. FBK-42 opens, checks `c.negative` and `c.sufficient` — neither of which is
a frequency check — and sends `a.ask-heavy`. The person is asked for a testimonial days after
being asked for feedback, which is exactly the *"farming it twice"* that FBK-41's own precedence
string says the group exists to prevent.

**PROPOSAL C7.2.** Give FBK-42 the same bound FBK-41 carries.

1. `FBK-42.contact.cooldown.rule` += *"and the bound on how often this person is asked anything —
   satisfaction or advocacy — across all contexts (`feedback_request.ask_frequency`), which this
   journey shares with FBK-41 rather than holding its own."*
2. `FBK-42.suppressions` += `CANONICAL_RULE`: *"An ask inside the shared cross-context ask bound
   is recorded as not-now and not sent, including one arriving by handoff from FBK-43. Winning the
   one ask slot at a moment is not permission to ask again soon after."*
3. Add a `c.frequency` condition between `c.sufficient` and `c.type`, with a `x.not-now` exit
   mirroring FBK-41's.

## C7.3 — FBK-43 has no `distinctFrom` — P2

`FBK-43.distinctFrom` is `undefined`, yet three journeys distinguish themselves *from* it:
`FBK-41` (*"FBK-43 begins only if something actually comes back"*), `FBK-42` (*"FBK-43 reacts to
one positive signal arriving"*), and `REM-151` (*"FBK-43 starts from someone's account of an
experience and asks whether any operational issue exists"*). Same shape as ACT-12 (C3.4): a hub
everyone points at that points at nobody. Documentation only.

Worth noting what FBK-43 *does* get right: `h.issue → FBK-46` carries
`suppresses: ["any automated satisfaction or retention outreach about the same experience while
the issue is open"]`, which is the single broadest and most useful suppression string in the
corpus — it protects FBK-41, RET-26 and RET-30 in one clause without naming any of them.

---

# Cluster 8 — Time: TIM-63 / TIM-61 / TIM-274 / TIM-281

## The intended timeline

```
        still valid              the moment             lapsed, bounded        holder comes back
                                 it stops                 window                after the fact
   ┌──────────────────┐   ┌──────────────┐   ┌────────────────────┐   ┌────────────────────┐
   │ TIM-63 Expiry    │ → │ TIM-64       │ → │ TIM-65 grants      │ → │ TIM-281 Expired    │
   │ Reminder         │   │ (not public) │   │ TIM-274 tells      │   │ Access Recovery    │
   └──────────────────┘   └──────────────┘   └────────────────────┘   └────────────────────┘
```

## C8.4 — the forward hops are enforced — sufficient

`TIM-63.h.expiry → TIM-64`, `on: "the window closing without resolution"`, and
`TIM-63.distinctFrom[TIM-64]`: *"This runs while the outcome can still change. TIM-64 runs at the
moment it stops being able to. Keeping them apart is what makes expiring and expired different
states rather than the same one announced twice."* `TIM-63.w.resolution` is `class:
"attribute-bound"` on `expires_at`, so the boundary is the expiry instant itself.
`TIM-274.suppressions[s.g1]` guards the next hop: *"Grace is never announced before it is
authoritatively recorded. A warning about a lapse that has not happened is a different journey
and belongs before this one."* And `TIM-281.distinctFrom[TIM-63]`: *"TIM-63 runs before expiry,
while the thing is still valid and can simply be kept. This runs after, where a gap exists on the
record."* Good.

## C8.2 — TIM-274 Grace Period Recovery vs TIM-281 Expired Access Recovery — **P0**

**Overlapping state.** An entity whose primary validity has ended, inside its grace window, whose
holder then tries to use it.

This is not an edge case — it is the *normal* way a holder discovers grace. `TIM-274.c.restricted`
branch "Function reduced" exists precisely because *"the capabilities recorded for grace are
narrower than the active state **in a way the holder uses**"*. The holder uses it, hits the
reduction, and acts.

**Both triggers fire.** `TIM-274.t.grace` on `grace_period_started` (already running).
`TIM-281.t.touched` on `holder_acted_on_expired_entity`, eligibility:

> "an authoritative expiry recorded against the entity"
> "an attempt by the holder to use, renew or ask about it after that expiry"

During grace, the primary validity *has* ended and an expiry *is* recorded — TIM-274's own
eligibility says so: *"an authoritative grace state recorded against the entity **after its
primary validity ended**"*. Both conditions hold simultaneously.

**Both then send the same message.** Same holder, same entity, same `[email]` channel:

| TIM-274 | TIM-281 |
|---|---|
| `a.notify-restricted`: "Name what has stopped working, what still works, the date the window ends and **the single condition that restores the active state**" | `a.renew` / `a.requalify` / `a.replace`: "Name renewal as the route, what it costs, and what carries across the gap" |
| `a.last-call`: "one message naming the exact end date, what stops at it, and **the same single recovery route**" | `c.route`: "Which mechanism restores validity here?" |
| `a.confirm`: "Confirm the active state is back" | `a.confirm`: "Confirm what is valid now" |

Two journeys telling one holder how to restore one entity, each with its own recovery route,
each with its own confirmation, potentially naming *different* routes — TIM-274 names the grace
recovery condition, TIM-281 re-derives the route from current rules at `a.establish`.

**Current data. MISSING.** `TIM-274.distinctFrom` names TIM-65 only. `TIM-281.distinctFrom` names
TIM-69 and TIM-63 — it reaches *past* grace to the pre-expiry journey and skips the one running
right now. Both have `contact.competition: "none"`. Different keys
(`[entity_ref, grace_period_id]` vs `[entity_ref, attempt_id]`) so neither "no instance already
open" clause sees the other. `TIM-274.suppressions[s.g3]` (*"One message before the window
closes, never two"*) is self-scoped and does not constrain TIM-281.

**Ownership rule that should hold.** Grace is a *communicated state with a fixed end*; TIM-274
owns everything said to the holder for its duration, including the recovery route, because
TIM-274 knows the window's end date and TIM-281 does not. TIM-281 owns the holder's attempt only
**after** grace has closed at `x.lost`, or where no grace period was ever granted.

**PROPOSAL C8.2.**

1. `TIM-281.eligibility` += *"no grace period is open on the entity — while an authoritative
   grace state stands, TIM-274 owns the window, its end date and the route back, and a holder
   acting inside it is answered by that journey rather than by a second one"*.
2. `TIM-281.suppressions` += `CANONICAL_RULE`: *"An open grace period owns the holder. This
   journey starts only once grace has closed at its recorded end (TIM-274's `x.lost`), or where
   no grace period was granted at all. Two routes back to one entity, named by two journeys from
   two different reads of the rules, is how a holder is told to renew something that can only be
   replaced."*
3. `TIM-281.distinctFrom` += `{ journey: "TIM-274", because: "TIM-274 runs inside a bounded grace
   window with a fixed end it can name, and it holds the route back for that window's duration.
   This runs where no window is open — after grace has closed, or where none was granted — and
   re-derives the route from current rules." }`, with the reciprocal on TIM-274.
4. `TIM-274.a.lost` (*"Say plainly that the window has closed, what is no longer available, and
   whether a route back still exists on different terms"*) is the transfer point. Its exit
   `x.lost.reEntry` should name TIM-281 as the owner of any subsequent holder attempt.

## C8.1 — TIM-268 Action Required Reminder vs TIM-61 Deadline Tracking — **P0**

The sharpest instance of S2, because these two share an **identical `instanceKey`**:

| | TIM-268 | TIM-61 |
|---|---|---|
| `instanceKey` | `["obligation_id"]` | `["obligation_id"]` |
| `entity.scope` | "the outstanding obligation, its owner and its due date" | "the obligation the deadline is attached to - a task, request, case or application" |
| trigger | `customer_owed_obligation_outstanding` | `authoritative_deadline_assigned` |
| pre-deadline touch | `a.remind`: "Name the obligation, what remains outstanding, the deadline and the single way to discharge it" | `a.remind`: "Send the reminder defined for this threshold" |
| channels | `[email, sms]` | `[email, push, sms, whatsapp]` |
| `pressureClass` | `service` | `service` |
| `competition` | `"none"` | `"none"` |
| `distinctFrom` | FIN-131, REM-153 | TIM-63 |

A customer-owed obligation with an assigned deadline satisfies both triggers, opens two instances
under the same key in two different journeys, and sends two pre-deadline reminders about one
obligation on overlapping channels. Neither names the other anywhere.

**The intended split already exists in TIM-268's own words** — applied to the wrong journey.
`TIM-268.distinctFrom[FIN-131].because`:

> "FIN-131 holds what is owed as its own state, independent of anything sent about it. **This is
> the sending, and it reads that state rather than defining it** - nothing here changes what is
> owed."

That sentence describes TIM-61 exactly: `TIM-61.purpose` is *"Let a deadline govern the state of
one obligation, rather than schedule messages around a date"*, and its five-outcome
`c.consequence` node (OVERDUE / ESCALATED / EXPIRED / FAILED / STILL_VALID) is state-holding, not
sending. The problem is that TIM-61 **also sends** — `a.remind` carries
`execution: "communication"` and four channels.

**PROPOSAL C8.1.** Pick the state-holder/sender split the two journeys already imply and make it
structural. Preferred direction, because it preserves TIM-61's policy-defined multi-threshold
schedule, which TIM-268's two-touch plan cannot express:

1. `TIM-268.eligibility` += *"no TIM-61 deadline-tracking instance is open for this obligation —
   where a deadline has been authoritatively assigned, TIM-61 governs the obligation's state and
   owns its pre-deadline reminders; this journey reminds of an obligation whose due date carries
   no governing deadline rule"*, plus the matching `suppressions` entry.
2. `TIM-61.distinctFrom` += `{ journey: "TIM-268", because: "TIM-268 sends one reminder and one
   overdue notice about an obligation whose due date governs nothing beyond the sending. Here the
   deadline governs the obligation's own state, and the reminder is one of five things the
   governing rule can produce." }`.
3. Put both in `exclusionGroup: "obligation-reminder"`, `scope: "obligation"`, TIM-61
   `precedence: "above generic obligation reminding - a governing deadline outranks a due date"`,
   TIM-268 `precedence: "below any type-scoped reminder owner"` (this is the same group S2 asks
   for, so the two proposals compose).

## C8.3 — TIM-61 vs TIM-63 for a renewal-shaped boundary — P1

`TIM-61.distinctFrom[TIM-63].because` is the crispest conceptual test in the corpus:

> "A deadline is a moment by which something must be done. An expiry is a moment at which
> something stops being valid. The first can pass with the obligation intact; the second cannot."

It is a genuine ownership rule — but it is a rule the *adopting company* applies when modelling
its data, not one a runtime can evaluate, and it is one-sided (TIM-63's `distinctFrom` names
TIM-64 only). For a renewal date, both readings are defensible: something must be done by it
(TIM-61) and something stops being valid at it (TIM-63). Both would then send a pre-boundary
reminder, both `pressureClass: "service"`, both `competition: "none"`.

**PROPOSAL C8.3.** Add the reciprocal `TIM-63.distinctFrom[TIM-61]` and, on both, an eligibility
clause making the test a gate rather than a description: `TIM-63.eligibility` +=
*"the moment is an expiry, not a deadline — the entity stops being valid at it. A moment the
obligation survives is TIM-61's deadline"*; `TIM-61.eligibility` += the converse. Also include
both in the `obligation-reminder` group from C8.1/S2 so a modelling mistake degrades to a
suppression rather than a double-send.

---

# Additional clusters found outside the assigned set

## A1 — SUB-163 Renewal Reminder vs TIM-63 Expiry Reminder — **P0**

**Overlapping state.** A subscription approaching the end of its current term.

`TIM-63.entity.scope` names the collision itself:

> "the time-bound entity approaching expiry - **a subscription**, document, entitlement,
> credential, approval, reservation, benefit or agreement"

`SUB-163.entity.scope` is *"the continuing relationship and the renewal cycle currently open on
it"*. A subscription term ending fires `pre_expiry_window_entered` (TIM-63) and
`renewal_decision_window_opens` (SUB-163) at the same point in the calendar. Both then send a
pre-boundary message on email:

- `TIM-63.a.prompt-action`: *"Tell the responsible actor what is expiring, the specific action
  that would change the outcome, and the point after which that action stops being available."*
- `SUB-163.a.notice`: *"Give the notice the terms require: the renewal model that will apply, the
  terms it renews on, and what happens"* — and `a.request`: *"Put the renewal decision to whoever
  holds it, with the terms that would apply."*

Two pre-renewal notices about one subscription, one of which (`a.notice`) is a contractual
notice: `SUB-163.suppressions` states *"Hard gates (GLB-31) apply; pressure caps do not to the
required notice, which is an obligation of the terms rather than outreach"*. So the pressure cap
will not deduplicate them.

**Current data. MISSING.** `SUB-163.distinctFrom` names SUB-164 only. `TIM-63.distinctFrom` names
TIM-64 only. `SUB-163.contact.competition.exclusionGroup` is `"relationship-continuity"`;
`TIM-63.contact.competition` is `"none"`, so TIM-63 is outside that group and its
`precedence: "below a cancellation in motion, below an active risk state, and below an open
payment recovery process on the same relationship"* cannot rank it.

**Ownership rule that should hold.** A subscription term end is a **renewal decision**, and
SUB-163 owns it — it is the only one of the two that knows the renewal terms, the required notice
period and the decision holder. TIM-63 owns every *other* expiring entity in its scope list
(document, credential, approval, reservation, benefit, agreement) where no renewal cycle exists.

**PROPOSAL A1.**

1. `TIM-63.eligibility` += *"no renewal decision window is open on the entity — a continuing
   relationship with defined renewal terms is SUB-163's renewal cycle, and the required notice is
   an obligation of those terms rather than a pre-expiry reminder"*.
2. `TIM-63.suppressions` += `CANONICAL_RULE`: *"An entity whose expiry is the end of a renewal
   cycle is owned by the renewal journey (SUB-163) for the whole of that cycle's decision window.
   This journey owns expiring entities that have no renewal cycle — a document, a credential, an
   approval, a reservation, a benefit, an agreement without renewing terms."*
3. `TIM-63.entity.scope`: remove "a subscription" from the list, or qualify it as *"a
   subscription with no defined renewal cycle"*.
4. Reciprocal `distinctFrom` on both, and add TIM-63 to `relationship-continuity` with
   `precedence: "below the renewal decision"` for any entity that has one.

## A2 — TIM-274 vs ACC-261 (and FIN-134) on one unpaid obligation — **P0**

**Overlapping state.** An unpaid obligation that has both put the account into grace *and*
restricted its capability.

FIN-134 produces both states from one instance — it has three handoffs and two of them fire on
the same obligation:

```
FIN-134 h.grace    → TIM-65  "an unpaid obligation entering a grace period"   → TIM-274 tells the holder
FIN-134 h.restrict → ACC-78  "policy restricting capability while an obligation is unpaid" → ACC-261 tells the holder
```

The two resulting messages are near-verbatim the same message:

| `TIM-274.a.notify-restricted` | `ACC-261.a.notify` |
|---|---|
| "Name what has stopped working, what still works, the date the window ends and the single condition that restores the active state." | "State exactly what is restricted, what still works, the deadline, and the single condition that lifts it." |

and both end with a near-identical confirmation (`TIM-274.a.confirm` "Confirm the active state is
back and name which reduced capabilities returned" / `ACC-261.a.confirm` "Confirm that access is
back and name what was restored"). Both run `[email, ...]`, both `pressureClass: "service"`, both
`competition: "none"`, and neither `distinctFrom` names the other — TIM-274 → TIM-65,
ACC-261 → ACC-78 and ACC-74, i.e. each names only its own upstream decision journey.

FIN-134 itself adds a third: `a.remind`, *"Say once that the consequence is approaching and when,
and repeat the same corrective action"*, and FIN-134 is exempt from pressure caps
(*"Pressure caps do not: this is transactional communication about an obligation the person
already holds"*). Three service messages, one unpaid bill, nothing deduplicating them.

**Ownership rule that should hold.** Both journeys are downstream *narrators* of an upstream
decision, and both say so cleanly (`ACC-261.distinctFrom[ACC-78]`: *"ACC-78 decides and records
the restriction and its release condition. This journey is what the account holder is told about
it"*; `TIM-274.distinctFrom[TIM-65]`: same shape). When one event produces both upstream
decisions, exactly one narrator should speak — and it should be the one that can name a **fixed
end date**, i.e. TIM-274, because grace has one by definition (`eligibility`: *"a fixed end date
for that grace period"*) and a restriction may not.

**PROPOSAL A2.**

1. `ACC-261.eligibility` += *"the restriction is not the capability reduction of an open grace
   period — where a grace period is running on the same obligation, TIM-274 names what stopped,
   what still works, the window's end and the route back, and this journey sends nothing"*.
2. `ACC-261.suppressions` += `CANONICAL_RULE`: *"One narrator per state. A restriction recorded
   as part of an open grace period is told by the grace journey (TIM-274), which can name the
   fixed end date this journey cannot. This journey owns restrictions that stand on their own."*
3. `TIM-274.a.notify-restricted.does` += a clause requiring it to name the restriction as ACC-78
   recorded it, so nothing is lost by ACC-261 staying silent.
4. Reciprocal `distinctFrom` between TIM-274 and ACC-261.
5. Separately, `FIN-134.h.grace.suppresses` and `h.restrict.suppresses` are both empty. Give
   `h.grace` `suppresses: ["further payment-failure reminders about this obligation while the
   grace window runs — the grace journey names the same deadline and the same corrective route"]`,
   matching the pattern FIN-134's own `s.*` rules use elsewhere.

## A3 — ACC-263 Activation Reminder vs ACT-12 Onboarding Nurture — P1

`ACC-263` owns *"whether the holder ever uses"* a granted entitlement: `a.ready` — *"Say what is
now available, what it lets them do, and the single first action that uses it"* — plus one
reminder. `ACT-12` owns *"the single most useful next action"* for an open onboarding instance.
Where a company models a seat grant as an onboarding start (a common shape), one grant satisfies
both: `entitlement_provisioned_and_reachable` and `onboarding_active_without_activation`. Both
then send "here is the first thing to do" on `[email, in-app]`.

Neither references the other: `ACC-263.distinctFrom` → ACC-72, ACC-76; `ACT-12.distinctFrom` is
absent (C3.4). `ACC-263.competition: "none"`; ACT-12 is in `lifecycle-stage`.

P1 rather than P0 because the overlap is conditional on how the adopting company models grants.

**PROPOSAL A3.** `ACC-263.eligibility` += *"no onboarding instance is open for the holder against
this entitlement — where activation is governed by an onboarding instance, ACT-12 owns the first
action and this journey's window is observed rather than messaged"*; add ACC-263 to
`lifecycle-stage` with `precedence: "below an open onboarding instance"`; and the reciprocal
`ACT-12.distinctFrom[ACC-263]`.

## A4 — INC-254 Incident Update vs FUL-146 / RET-26 — P1

`INC-254` is cohort-scoped (`instanceKey: ["incident_id", "recipient_cohort_id",
"state_change_id"]`) and tells everyone affected by an incident what changed. A person in that
cohort who also has a delayed obligation receives `INC-254.a.communicate` *and*
`FUL-146.a.delay-update` (*"State the original commitment, the current estimate…"*) about the
same underlying cause.

The boundary is half-enforced. RET-26 protects itself: `c.duplicate` → `x.defer` on *"an open
case, an assigned owner or **another recovery journey** covers the same incident"*, and
`h.operational` suppresses *"apology and compensation messaging until the thing being apologised
for has stopped happening"*. FUL-146 does not — its `s.g5` covers only FUL-265, and
`INC-254.distinctFrom` is **absent entirely**, with `competition: "none"`.

**PROPOSAL A4.** `INC-254.suppressions` += `CANONICAL_RULE`: *"Where a journey scoped to a
person's own obligation is already telling them what this incident did to it — a delay, a failed
delivery, a restricted capability — the cohort update is not additionally sent to that person for
the same state change. A cohort message and a per-obligation message about one cause are two
accounts of one event, and the one bound to their obligation is the useful one."* Add
`INC-254.distinctFrom` entries for FUL-146 and RET-26.

## A5 — DOC-215 Signature Reminder vs TIM-268 — P1

A named instance of S2, listed separately because DOC-215 is unusually well-guarded in every
*other* direction — `eligibility` includes *"no DOC-220 conflict review is open for this
document's lineage - a version under active conflict review is not simultaneously collecting
signatures against it as though it were already settled"*, which is a model cross-journey gate —
yet it has no defence against the generic reminder. Covered by PROPOSAL S2; no separate edit
needed on DOC-215.

## A6 — SCH-266 vs SCH-277 / SCH-180 is enforced by explicit deduplication — sufficient

`SCH-266.suppressions` contains the only **named-journey deduplication** clause in the 52:

> "Deduplicated by booking and occurrence against the confirmation (SCH-277) and any reschedule
> notice (SCH-180) about the same booking."

plus a second clause handling the degenerate timing case — *"Where the confirmation already falls
inside the pre-start window, no prerequisite prompt is sent; the journey goes straight to
revalidation and the reminder"* — and an eligibility clause *"no reminder has been sent for this
occurrence"*. This is the pattern that would close A1, A2, C1.1 and C8.1, already written and
shipped in one journey. Nothing to fix.

## A7 — SUB-163 vs FIN-134 is enforced — sufficient

One-sided but decisive, stated three times on SUB-163:

- `eligibility`: *"no open payment recovery process exists on the relationship - payment recovery
  owns the relationship until it resolves"*
- `suppressions`: *"An open payment recovery process on the relationship suppresses the renewal
  decision request entirely; a routine renewal ask is not put to someone whose current term is
  already in question over an unresolved payment failure."*
- `competition.precedence`: *"below … an open payment recovery process on the same relationship"*

FIN-134 needs no reciprocal because it is unconditionally the owner. Nothing to fix.

---

# Cross-cutting observations

**1. `distinctFrom` is doing work it cannot do.** Seven of the eight P0s (C1.1, C1.2, C2.1,
C3.1, C5.1, C8.1, C8.2, A1) involve a pair whose relationship is either described in a
`distinctFrom` that no runtime can act on, or not described at all. The corpus has no field that
says *"these two are alternatives, never concurrent"* — `distinctFrom` describes a contrast,
`suppressions` describes a stop, and nothing describes mutual exclusivity. Every proposal above
therefore expresses exclusivity as an `eligibility` clause plus a `suppressions` entry, which is
the pattern ACT-12 already uses for ACT-14 and SCH-266 uses for SCH-277.

**2. `contact.competition: "none"` is over-used.** 36 of the 52 carry the literal string
`"none"`, including SUB-262, TIM-268, TIM-61, TIM-63, TIM-274, TIM-281, ACC-261, ACC-263, INC-254,
FUL-146, FUL-265, DOC-215, REL-284 and RSK-273. Several of them then describe a precedence
relationship in prose inside `suppressions` (ACT-17's `s.contest` and RET-26's `s.duplicate` are
the clearest cases). Where a journey's own suppression names other journeys' states, that is a
group membership written in the wrong field. Four groups exist today —
`commerce-recovery` (5 members), `retention-outreach` (5), `lifecycle-stage` (2),
`outbound-ask` (2), `relationship-continuity` (1). This review proposes three more:
`lead-education` (C2.1), `obligation-reminder` (S2/C8.1/C8.3) and additions to the existing four.

**3. Reciprocity is the strongest predictor of a sound boundary.** Every boundary this review
found sufficient is stated from *both* sides — FUL-146/FUL-265 (two suppressions),
FBK-41/FBK-42 (two precedence strings), ACT-20/RET-32 (two eligibility predicates),
ACT-12/ACT-13 (handoff plus return handoff). Every P0 is one-sided or silent. Two journeys —
**ACT-12 and FBK-43** — have no `distinctFrom` at all, and both are hubs that four other journeys
point at; both turned out to sit on an unguarded collision (C3.1, C7.2).

**4. A cross-key handoff needs a minted id, and two journeys already know it.**
`RET-24.h.intervention` and `FUL-265.x.unresolved` / `FUL-148.h.return` each explain that the
receiving journey's `instanceKey` does not exist upstream and mint it deterministically. Any new
handoff proposed above that crosses a key boundary (ACQ-288→ACQ-287 already carries
`contract.requiredFields`; RET-30→SUB-167 does not) should follow that pattern.
