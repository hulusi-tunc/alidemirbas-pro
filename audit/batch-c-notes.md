# Batch C — CON-300, FUL-301, FIN-302

Three of the seventeen planned public journeys (`audit/new-journey-id-map.md`),
the communication-hygiene / transaction group. Public library **58 → 61**,
canonical corpus **292/3802 → 295/3849**. The 21-journey exclusion list is
untouched, and no existing journey's graph was changed — the eleven existing
journeys this batch edits are edited for **reciprocity only** (competition,
suppression and `distinctFrom` prose), which is why they show up in G4 and in
nothing else.

| id | slug | category | nodes | customer-facing touches |
|---|---|---|---:|---:|
| CON-300 Unengaged Subscriber Sunset | `unengaged-sunset` | consent | 21 | **3** |
| FUL-301 Order Confirmation | `order-confirmation` | fulfillment | 11 | **1** |
| FIN-302 Refund Notification | `refund-notification` | financial | 15 | **2 per instance** (4 declared, 3 of them exclusive) |

## Touch counts, stated honestly

**CON-300 — three, and the third only because the permission state changed.**
`a.ask` (the question, with a reduced cadence beside stopping), `a.final` (one
final notice naming the ending date and the single action that keeps contact),
`a.confirm-end` (the ending itself, what continues because it was never
marketing, and the route back). The first two are `mandatory: false` and run
against `unengaged_sunset.discretionary_touches` (default 2); the third is
`mandatory: true` because it is a notice about the business's own sending, not
a discretionary send, which is why `localCap.appliesTo` is `non-mandatory`.
A fourth message to somebody who has answered nothing is the volume the
journey exists to end, and `s.bounded` says so.

**FUL-301 — one.** `a.confirm`, `mandatory: true`, deduplicated by
`obligation_id` rather than rationed by pressure. `order_confirmation.discretionary_touches`
defaults to 0 because there is nothing discretionary in the plan. `s.once`
forbids a second: a repeat reads as a second order.

**FIN-302 — two in any one run.** `a.issued` (money is moving), then exactly
one of `a.settled` / `a.partial` / `a.unresolved`, which are the three
exclusive arms of `c.outcome`. Four touches are declared because every
communication action must be referenced by a touch; the validator's
`simultaneous_review` warning on t2/t3/t4 is recorded in
`production/vnext-warning-reviews.json` with that reasoning. All four are
`mandatory: true` — every one of them is a statement about money the person is
owed — so `refund_notification.discretionary_touches` is 0.

## Ownership boundaries, quoted from both sides

Standing rule: a claim that two journeys collide quotes the
`contact.competition` block of **both**, and a boundary stated from only one
side is a bug. What follows is the final state of the data, not a summary of it.

### 1. `contactability-question` — CON-300 · CON-272 · CON-283 (scope: person)

This group is **new in this batch**. CON-272 and CON-283 previously carried
`competition: "none"`, which was a true statement while nothing contested them;
CON-300 makes it false, so both were edited in the same change.

The hazard is specific and real: **a destination that has stopped working is
one of the commonest reasons nothing was engaged with.** A sunset that reads a
hard bounce as disinterest ends marketing contact for somebody who never got
the messages. And somebody who has just set a cadence for themselves has
already answered the question the sunset would otherwise ask.

> **CON-300** — `exclusionGroup: "contactability-question"`, `scope: "person"`,
> `onLoss: "suppressed"`
> *"lowest in the contactability-question group - a contact repair is fixing a
> route that broke and a frequency confirmation is answering a cadence the
> person themselves chose, and both are already answering the question this
> journey would otherwise ask over the top of; when either currently holds the
> person this journey is suppressed for them rather than queued behind it"*

> **CON-272 Contact Recovery** — `exclusionGroup: "contactability-question"`,
> `scope: "person"`, `onLoss: "paused"`
> *"highest in the contactability-question group - a route that has actually
> stopped working has to be repaired before any conclusion is drawn from the
> silence on it, so while this repair currently holds the person the unengaged
> sunset stands down rather than reading a dead destination as disinterest"*

> **CON-283 Frequency Preference Update** — `exclusionGroup: "contactability-question"`,
> `scope: "person"`, `onLoss: "paused"`
> *"above the unengaged sunset in the contactability-question group - somebody
> who has just chosen a cadence has answered the question the sunset would
> otherwise ask, so while this confirmation currently holds the person the
> sunset is suppressed for them; below a contact repair, which is fixing the
> route this confirmation would travel on"*

`onLoss: "paused"` on the two senior members rather than `suppressed`: both
hold a real obligation to the person (a repair the person is owed, a
confirmation of a change they made), so if they ever did lose the scope they
would wait, not disappear. They do not lose it to CON-300.

The live re-check the group needs is in CON-300's own graph, in both send
gates: *"...and no higher-precedence contactability journey currently holds
this person"* (`c.sendable`, `c.sendable2`). `validate-canonical`'s
`competition_member_unenforced` check is satisfied by it and reports nothing
for any of the three.

Stated in prose from both sides as well: CON-300 `s.contest` and its
`distinctFrom` entries for CON-272 and CON-283; CON-272 and CON-283 each gained
a `distinctFrom` entry naming CON-300.

### 2. `post-purchase-welcome` — FUL-301 · FUL-291 · RET-290 (scope: person)

The group already existed (Batch A). FUL-301 joins it at the top, and both
existing members were edited so the deference is stated from their side too.
RET-290 already deferred to "the order's confirmation" in `s.transactional`
before this batch — the journey it was deferring to simply did not exist yet.

> **FUL-301** — `exclusionGroup: "post-purchase-welcome"`, `scope: "person"`,
> `onLoss: "suppressed"`
> *"highest in the post-purchase-welcome group - the order's own confirmation
> answers the question the post-purchase follow-up and the first-purchase
> welcome both assume has been answered, so both of them wait behind it rather
> than beside it; being transactional it is never itself deferred, and the
> contest is declared here so the other two have a named side to defer to"*

> **FUL-291 Post-Purchase Follow-Up** (edited) —
> *"above the first-purchase welcome for the same person - what somebody is
> already holding comes before what they might buy next; **below the order's own
> confirmation (FUL-301), which answers what the business took on before this
> journey explains what to do with it**, and below every remedy journey on the
> same order, which ends this one rather than queueing it"*

> **RET-290 First Purchase Thank You & Bounceback** (edited) —
> *"**below the order's own confirmation (FUL-301)** and below the post-purchase
> follow-up on the same person's order - **the record has to open before anything
> is said about the relationship it opened**, and what somebody is already
> holding comes before what they might buy next; above every promotional journey
> addressed to a person whose relationship is this new"*

`onLoss: "suppressed"` on FUL-301 is a formality the schema requires: it is the
highest member and transactional, so it never loses. The contest is declared
here so the other two have a named side to defer to rather than deferring to a
description.

### 3. The seam FUL-301 · FUL-265 · FUL-146 — **no competition declared**

FUL-301 stops at the moment the record opens; FUL-265 begins at dispatch;
FUL-146 holds lateness against the commitment FUL-301 stated. They never
contest the same moment, so declaring a group would have been inventing a
contest. Stated in data from all three sides instead:

- FUL-301 `s.status` — *"This journey never reports progress. Where the order is
  and whether it is running late are the tracking journey's (FUL-265) and the
  delay journey's (FUL-146) own states, and both of them begin after this one
  has had its moment."* plus `distinctFrom` entries for FUL-265 and FUL-146.
- **FUL-265** gained a `distinctFrom` entry: *"FUL-301 confirms what the record
  accepted at the moment it opened, and stops there. This journey begins at
  dispatch, which is where the order first has a position to report - it never
  re-confirms the order, and the confirmation never reports a position."*
- **FUL-146** gained its first `distinctFrom` entry at all: *"FUL-301 states the
  original commitment once, at the moment the record opens, and then says
  nothing further. This journey is what happens when that commitment slips - it
  is measured against what the confirmation said, and it never restates the
  confirmation itself."*

FUL-301's one handoff, `h.cancelled → FUL-150`, is the only ownership move it
makes: an accepted obligation cancelled before it ever moved, with a
confirmation already in the recipient's hands.

### 4. Who announces a refund — **no competition declared, deliberately**

Quoted before claiming anything: **FIN-137 `contact.competition` is `"none"`;
REM-157 `contact.competition` is `"none"`; FIN-138 has no `contact` block at all
and `channels: []`.** FIN-302's is `"none"` too.

That is the correct answer here, and it is worth saying why rather than adding a
group for symmetry. The three are **sequential, not contending**: REM-157 hands
off to FIN-137 (`h.financial`), FIN-137 hands off to FIN-138 (`h.execute`), and
FIN-302 opens on FIN-138's own submission. A handoff is precisely the mechanism
that moves ownership; a competition group would have claimed a standing contest
that the graph already resolves. The boundary is a **who-says-what** boundary,
so it is stated where that belongs — in suppressions and `distinctFrom`, from
every side:

- FIN-302 `s.decision` — *"The decision to refund is not this journey's to
  announce. Whether a refund was approved, refused or is under review is said by
  the journey that decided it (FIN-137), and which remedy would resolve the
  obligation at all is said by the journey that chose it (REM-157). This one
  opens only once money is actually moving."*
- FIN-302 `s.approved` — *"Approved is not refunded and submitted is not settled."*
- **FIN-137** gained: *"This journey tells the requester the decision - approved,
  refused, or under review - and nothing about money moving. FIN-302 says that
  money is moving and whether it arrived, and it opens only once the refund has
  been submitted for settlement, so the two never speak about the same fact."*
- **FIN-138** gained its first `distinctFrom` entry: *"This journey moves the
  money and verifies it arrived, and it tells nobody - its channels are empty on
  purpose. FIN-302 is what the person is told about that movement, and every
  claim it makes is read from the record this journey writes rather than from
  the approval behind it."*
- **REM-157** gained: *"This journey says which remedy will resolve the
  obligation, and a refund is only one of the answers it can give. FIN-302 says
  that money is actually moving and whether it arrived, which is two decisions
  further down the chain - a remedy confirmed here is never money arrived, and
  this journey never announces the movement."*

### 5. Sunset is not a win-back — stated from both sides

- CON-300 `s.notwinback` — *"This journey is not trying to keep the customer and
  carries no offer, no incentive and no argument for the relationship... a
  message that argues for staying is the lapsed-customer win-back (RET-32)
  wearing this journey's name."*
- **RET-32** gained: *"CON-300 is not trying to keep anybody: it asks whether
  marketing contact should continue and takes the answer, offer-free. This
  journey is the argument for coming back, and it runs on a lapsed paid
  relationship rather than on unanswered contact - a person can be perfectly
  engaged with our messages and still lapsed, or still buying and entirely
  silent on everything we send."*

CON-300 also carries a `distinctFrom` entry for **RET-26** for the same reason
in the other direction: RET-26 reads engagement with the *product*, CON-300
reads engagement with our *messages*, and the two are routinely opposite.

### 6. The sunset's outcome is reachable from its data, not implied in prose

> **CORRECTED 2026-09-20 — this section was wrong, and it was the P0.** The
> `suppresses` array quoted below is a statement the *writing* journey makes
> about what ought to happen; no reading journey was obliged to have heard it.
> `marketing_suppression` was written by `CON-300.a.suppress` and read by
> **nothing** in 303 journeys, so the sunset suppressed nothing and every
> promotional and lifecycle journey kept sending. The scope was also stated two
> contradictory ways (`a.suppress.does` and `h.enforce.carries` said "commercial
> communication only"; `h.enforce.suppresses` said "promotional and lifecycle").
> Both are fixed — the broad reading was taken, GLB-31 now names the gate,
> CMS-203 performs it and all 29 promotional/lifecycle journeys read it from
> their own side. Full account and evidence: `audit/sunset-suppression-fix.md`.
> What follows is the original text.

The requirement was that a sunset which ends marketing contact must actually
suppress marketing sends. It does, structurally:

- `a.suppress` writes `marketing_suppression` (append, idempotent on
  `person_id + unengaged_window`) and explicitly **does not** touch the person's
  consent record.
- `h.enforce → CON-38` carries the suppression scope, reason, window and release
  condition, and its `suppresses` array names what has to stop: *"every
  promotional and lifecycle journey addressed to this person"*, *"their queued
  and in-flight commercial sends"*, *"re-entry into this journey while the
  suppression stands"*.
- The two answers that are **not** silence leave through their own handoffs
  rather than through a suppression: `h.frequency → CON-283` (a reduced cadence
  chosen instead of an ending) and `h.permission → CON-35` (the person withdrew
  permission themselves, which is a real consent change and belongs to the
  journey that enforces those).
- **CON-38** gained the matching statement from its side, tying the result to the
  two rules it already carried (`s.g4`/`s.g5`, sender-side hold ≠ unsubscribe;
  release by asking again, not by switching sending back on).

## Deliberately out of scope

- **Batches B and D.** Counts are set as if only these three landed: public
  58 → 61, source 79 → 82, canonical 292/3802 → 295/3849. RET-295 / SUB-296–299
  and SCH-303 / SCH-304 / REM-305 are not accounted for anywhere in this change.
- **The 21-journey exclusion list.** Untouched. No journey was removed, restored
  or re-evaluated.
- **No new `external:` handoff target** was created, so `EXTERNAL_TARGET_TR` is
  unchanged and the pending-external list is the same 30 it was.
- **No graph node was added to any existing journey.** Every reciprocal edit is
  competition / suppression / `distinctFrom` prose. This is why G4 names seven
  existing journeys (CON-272, FUL-265, RET-290, FUL-146, RET-32, FUL-291,
  REM-157 — the seven of the eleven that are inside the public library and
  therefore inside the baseline) and G1/G2/G3/G5/G6 name none.
- **A `money-returned` competition group** was considered for FIN-302 / FIN-137 /
  REM-157 and rejected — see §4. Adding it would have declared a contest the
  handoff chain already resolves.
- **CON-300 carries no `businessOutcome`.** Its own outcome is the contactability
  decision, which is what `journeyOutcome` records across its four exits and
  three handoffs; inventing a downstream business event for a journey whose
  success can be "we stopped sending" would have been a fabricated metric.
  FUL-301 likewise. FIN-302 does carry one (`refund_settlement_confirmed`) with
  `comparison: "not-applicable"`, because the journey does not cause settlement.
- **No numbers anywhere.** No benchmark, no percentage, no invented cadence. The
  only defaults are touch budgets that equal the plan's own shape, and every
  timing Config is `required: true` for the adopting company to supply.
- **Vendor-neutral throughout.** No vendor is named in any journey, event id,
  `commonMappings` entry, comment or in this document.

## New semantic events

Three curated entries in `scripts/event-curation.json`, plus three trigger
events harvested from the journeys themselves; `src/canonical/events.ts`
regenerated 464 → 470.

| id | origin | source |
|---|---|---|
| `marketing_contact_unanswered_across_window` | CON-300 trigger | behavioral |
| `fulfillment_obligation_accepted` | FUL-301 trigger | authoritative |
| `refund_submitted_for_settlement` | FIN-302 trigger | authoritative |
| `marketing_engagement_recorded` | curated wait event | behavioral |
| `refund_settlement_confirmed` | curated wait event | authoritative |
| `refund_settlement_failed` | curated wait event | authoritative |

## Gate results at the last full run

| gate | result |
|---|---|
| `npm run validate:canonical` | PASS — 295 journeys · 3849 nodes · 12 competition groups · 0 errors · 0 unreviewed vNext warnings |
| `node scripts/validate-public-scope.mjs` | PASS — 15 checks, 0 failures, 3 warnings · public 61 / excluded 21 / source 82 |
| `audit/guard-display.mjs 4512` | PASS — G4 no drift, G1/G2/G3/G5/G6 0 findings |
| `audit/canvas-hygiene.mjs 4512` | PASS — 1531 cards, 0 findings (H1/H2/H3/H4 all 0) |
| `audit/measure-display.mjs after 4512` | 0 render errors, **0 locale leaks** |
| `npm run validate:journey-production` | PASS — 30/30, baseline 295/3849 |
| `npm run validate:seo` | PASS — 0 errors |
| `npx tsc --noEmit` | clean |
| route parity | 61 × 200 EN+TR; the three new slugs 200 in both locales; gallery reads 61 in both |
