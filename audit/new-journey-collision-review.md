# Collision review — the seventeen new journeys

**Scope.** The seventeen journeys added by phases 25–33 (`audit/new-journey-id-map.md`), reviewed
against their nearest neighbours: existing journeys, and **each other**. The public library is
69 journeys / 21 excluded / 90 in the library surface, and nothing below proposes changing that
number, adding a journey or removing one. Every finding is about **which of two co-existing
journeys owns a person at a given moment, and what the data says about it.**

**Why this document exists.** Batch A landed first and was visible to everything after it.
**Batches B, C and D were authored in parallel and could not see one another.** Each resolved its
collisions against the corpus as it stood *before* the other two landed. Every ownership boundary
between a Batch B journey and a Batch C or D journey — and between C and D — was therefore
resolved by nobody. That set is §3, and it is the reason this file was written.

The state of the corpus confirms the blindness precisely. Scanning all 303 journeys for any
mention of a new id, **no Batch B journey names a Batch C or D journey anywhere, in any field, and
no Batch C journey names a Batch D journey.** Every inbound reference to a Batch B/C/D journey
comes from inside its own batch, from Batch A, or from a pre-existing journey that batch edited.
There are twenty-three blind cross-batch pairs and zero cross-batch statements.

**Source.** `production/canonical-dump.json` only. Every quoted string is a verbatim field value
from that file. Field paths used: `contact.competition.{exclusionGroup,scope,precedence,onLoss}`,
`contact.{defaultPriority,pressureClass,localCap}`, `entity.{scope,note,instanceKey,concurrency}`,
`eligibility[]`, `suppressions[].text`, `distinctFrom[].{journey,because}`, and the `nodes[]`
graph (`trigger.event`, `condition.branches[].when`, `action.does`,
`handoff.{to,on,carries,suppresses}`, `exit.{class,state}`). Two corpus-level structures are also
read verbatim: `globalRules[]` and `sendPathOrder[]`.

**What counts as enforcement.** Unchanged from `audit/collision-review.md`:

1. a **handoff node** whose `on` names the transfer event, ideally with `suppresses`;
2. an **eligibility clause or suppression** that names the other journey or its state;
3. a **`contact.competition` exclusion group** both journeys belong to, with a `precedence` that
   orders them and an `onLoss` that says what the loser does.

A `distinctFrom.because` is **not** enforcement. It tells a library reader how two journeys differ
in concept; it does not tell a runtime which one owns the person.

One addition this round, because the corpus gained it after the last review. **CMS-205 Send
Eligibility Check** now enforces competition generically for every message, in `a.reread`:

> "Where the message's own originating journey declares a competition `exclusionGroup` and `scope`
> (GLB-01), this re-read includes OPS-131's current established owner for that
> (exclusion_group, scope_instance_id) — the send path's own step 3, 'journey competition and
> precedence', is enforced here rather than left as a stage no concrete node ever performs"

That closes the "does a declared group actually do anything" question for every group below, and
it is why the absence of a graph-level re-check inside FUL-291, RET-292, SUB-298, FUL-301 and
REM-305 is **not** a finding. It also bounds what a group can do: CMS-205 checks the originating
journey's **own** declared group and nothing else. Two journeys in different groups are not
arbitrated by it, which is the mechanism behind the largest finding in §3.

**Severity.**

| | |
|---|---|
| **P0** | Two journeys will send the same person a message about the same thing — **or** a journey will send where another journey's own recorded outcome says nothing may be sent. |
| **P1** | Ownership is ambiguous, or assigned to a journey that cannot hold it, but no double-send. |
| **P2** | Naming, documentation or symmetry only. |

The second half of P0 is an extension of the last review's scale, stated here rather than assumed.
It is needed because the seventeen introduced the corpus's first journey whose **success outcome is
that other journeys stop** (CON-300), and a scale defined only by double-sends cannot rate a
failure of that.

**Verdict codes**, used in every table below:

| code | meaning |
|---|---|
| **R** | already resolved in authored data — both sides quoted |
| **1S** | resolved, but one-sided — the silent side is named |
| **X** | a real unstated collision |
| **N** | not a collision — the entities or scope instances differ (GLB-01/GLB-08) |

**90 pairs reviewed. 41 R · 29 1S · 10 X · 10 N.**

Of the 90, **31 are in §3**: 23 are genuinely blind (a Batch B journey against a Batch C or D one,
or C against D) and 8 cross Batch A, which the later batches *could* have seen and did not. The
other 59 are in §4 — inside a batch, or a new journey against an existing one.

---

# 1. Findings index

| # | Pair or group | Severity | Verdict | Enforced today? |
|---|---|---|---|---|
| **N1** | CON-300 vs RET-290 · RET-292 · RET-295 · SUB-296 · SUB-299 (lifecycle class) | **P0** | X | No — CON-300 contradicts itself on scope, and all five read the one field it guarantees stays true |
| **N2** | REM-305 vs FIN-302 | **P0** | X | No — no group, no suppression, no `distinctFrom` in either direction |
| **N3** | ACQ-289 vs ACQ-13 in `commerce-recovery` | P1 | X | No — both declare themselves lowest; no member names ACQ-289 |
| **N4** | FUL-301 vs SCH-277 / `booking-lifecycle` | P1 | X | No — neither says whether a reservation is a fulfillment obligation |
| **N5** | FIN-134 vs FIN-302 and SCH-303 | P1 | 1S | Half — both new journeys defer to it; it names neither |
| **N6** | CON-300 vs ACQ-289 · RET-293 · RET-294 · SUB-297 (promotional class) | P1 | 1S | CON-300's side only |
| **N7** | `post-purchase-welcome` scope is `person`, its members are per-order | P2 | X | Over-suppression risk against GLB-08 |
| **N8** | REM-305's "transactional outranks marketing" claim | P2 | 1S | **Correctly declared one-sided by Batch D** — the claimed direction is enforced |
| **N9** | CON-283 is a `contactability-question` member and is excluded from the public library | P2 | — | n/a — rendering, not ownership |
| **N10** | Twenty-two one-sided `distinctFrom` rows out of the seventeen | P2 | 1S | n/a |
| **G1–G8** | The eight exclusion groups the seventeen created or joined | — | R | **Yes** — seven of the eight are internally consistent total orders; `commerce-recovery` is the exception (N3) |

**2 P0 · 4 P1 · 4 P2.** Seven groups were created by the seventeen and one was joined; seven of the
eight are internally consistent and the eighth (`commerce-recovery`) is not. The fix list in §5 is
F1–F9, keyed to these findings; N9 needs no edit.

---

# 2. The exclusion groups the seventeen created or joined

Before Batch A the corpus carried **8** competition groups. It now carries **15**. The seventeen
created seven of them and joined one. Verified against the dump at `41d07bb` (pre-Batch-A, 286
journeys, 8 groups) and at HEAD (303 journeys, 15 groups).

| group | scope | members | created by | verdict |
|---|---|---|---|---|
| `commerce-recovery` | `person` | 8 | pre-existing; **joined** by ACQ-289 (A) | **defect — N3** |
| `post-purchase-welcome` | `person` | 3 | RET-290 + FUL-291 (A); **joined** by FUL-301 (C) | consistent; scope note N7 |
| `recommendation-offer` | `person` | 2 | RET-293 + RET-294 (A) | consistent |
| `date-recognition` | `person` | 2 | RET-295 (B), pulling in RET-292 (A) | consistent |
| `membership-standing` | `subscription` | 4 | SUB-296/297/298/299 (B) | consistent |
| `contactability-question` | `person` | 3 | CON-300 (C), pulling in CON-272 + CON-283 | consistent; note N9 |
| `booking-lifecycle` | `reservation` | 4 | SCH-303 + SCH-304 (D), pulling in SCH-266 + SCH-277 | consistent |
| `service-request` | `topic` | 3 | REM-305 (D), pulling in REM-151 + REM-157 | consistent |

## G1 — `commerce-recovery` (scope `person`, 8 members) — **inconsistent**

The only group of the eight that does not agree with itself. Full membership, in the order the
members themselves declare, with `onLoss` for each:

| rank claimed | journey | `onLoss` | `precedence`, verbatim (opening clause) |
|---|---|---|---|
| highest | ACQ-287 Checkout Abandonment Recovery | `suppressed` | *"highest in the group - the concrete checkout implementation owns a checkout in motion, and outranks the generic process-recovery pattern (ACQ-11) it specialises as well as every held cart, held selection, inferred interest and predicted need for the same person"* |
| 2 | ACQ-11 Abandoned Process Recovery | `suppressed` | *"below Checkout Abandonment Recovery (ACQ-287), the concrete checkout implementation this generic pattern is specialised by … above every held selection, inferred interest and predicted need for the same person"* |
| 3 | ACQ-288 Cart Abandonment Recovery | `suppressed` | *"below checkout recovery and the generic process-recovery pattern - a checkout in motion outranks a held cart - and above the generic held-selection pattern (ACQ-12) it specialises"* |
| 4 | ACQ-12 Abandoned Selection Recovery | `suppressed` | *"below process recovery … and below Cart Abandonment Recovery (ACQ-288) … above interest recovery and predicted-need replenishment for the same person"* |
| 5 | RET-31 Predicted Need Replenishment | `suppressed` | *"below process recovery and selection recovery for the same person; above interest recovery"* |
| 6= | SCH-282 Availability Search Abandonment | `suppressed` | *"below process recovery and selection recovery; alongside interest recovery"* |
| **lowest** | ACQ-13 Unresolved Interest Recovery | `suppressed` | *"**lowest in the group** - a process in motion, a held selection and a predicted need all outrank an inferred interest for the same person"* |
| **lowest** | **ACQ-289 Back-in-Stock Alert** | `suppressed` | *"**lowest in the commerce-recovery group** - a checkout in motion, a held cart and a held selection all outrank an interest that could never convert at all; when any of them holds the person this alert is suppressed for them rather than queued behind it"* |

**Two members claim the bottom of the same total order.** ACQ-13 says *"lowest in the group"*, which
places ACQ-289 above it; ACQ-289 says *"lowest in the commerce-recovery group"*, which places ACQ-13
above it. Both carry `onLoss: "suppressed"`. Where both are eligible for the same person — an
interest recorded against an unavailable item, and an unresolved interest in something else — each
defers to the other and neither sends. That is not a tie CMS-205 can break: GLB-02 forbids it
explicitly —

> "The winner is selected from explicit policy precedence. Where policy leaves two candidates at
> equal standing, **no local tie-break is invented** and the contest is escalated rather than
> resolved by ordering."

— and neither journey escalates. Compounding it, ACQ-289 is the only one of the seventeen
that **no other journey in the corpus references at all**, in any field. It names ACQ-13, ACQ-12
and RET-31 in `distinctFrom`; none of the three names it back, and neither does ACQ-287, ACQ-288,
ACQ-11 or SCH-282. It joined an eight-member group as a stranger.

SCH-282's *"alongside interest recovery"* is a second, pre-existing instance of the same GLB-02
problem and is recorded here for completeness; it is not a Batch A regression.

→ **N3, P1.**

## G2 — `post-purchase-welcome` (scope `person`, 3 members) — consistent

A clean, fully reciprocal total order, and the model case among the eight. Each member names the
others **by id**:

| rank | journey | class | `onLoss` | `precedence`, verbatim |
|---|---|---|---|---|
| highest | **FUL-301** Order Confirmation (C) | `transactional` / `none` | `suppressed` | *"highest in the post-purchase-welcome group - the order's own confirmation answers the question the post-purchase follow-up and the first-purchase welcome both assume has been answered, so both of them wait behind it rather than beside it; being transactional it is never itself deferred, and the contest is declared here so the other two have a named side to defer to"* |
| 2 | FUL-291 Post-Purchase Follow-Up (A) | `service` / `service` | `suppressed` | *"above the first-purchase welcome for the same person … below the order's own confirmation (FUL-301), which answers what the business took on before this journey explains what to do with it, and below every remedy journey on the same order, which ends this one rather than queueing it"* |
| lowest | RET-290 First Purchase Thank You & Bounceback (A) | `lifecycle` / `lifecycle` | `suppressed` | *"below the order's own confirmation (FUL-301) and below the post-purchase follow-up on the same person's order - the record has to open before anything is said about the relationship it opened … above every promotional journey addressed to a person whose relationship is this new"* |

Both juniors also state it a second and third time. RET-290 `s.transactional`: *"This journey never
carries the order's confirmation and never competes with it. The confirmation (FUL-301) answers
what the business took on; this answers what happens now that somebody is a customer, and it waits
until that first question has been answered."* FUL-291 `s.confirmation`: *"This journey never
confirms the order. What the business took on is answered at the opening of the fulfillment record
by the order confirmation (FUL-301), long before this instance exists."* RET-290's `eligibility`
carries it as a fourth statement: *"the order's own transactional confirmation is owned and sent by
the journey whose job that is, not by this one"*.

One structural note. The group's `scope` is `person`, but FUL-301's `entity.instanceKey` is
`["obligation_id"]` and FUL-291's is `["person_id","fulfillment_id"]`. Under GLB-08 a contest is
resolved per scope **instance**, and here the instance is the person — so a confirmation of order B
suppresses the follow-up on the completion of order A. That is correct for RET-290 (whose entity
genuinely is the person, `instanceKey: ["person_id"]`, *"One instance per person, ever"*) and
questionable for FUL-291. → **N7, P2.**

## G3 — `recommendation-offer` (scope `person`, 2 members) — consistent

| rank | journey | `onLoss` | `precedence`, verbatim |
|---|---|---|---|
| higher | RET-294 Cross-Sell / Next Best Offer | `suppressed` | *"above the generic recommendation for the same person - a next step that follows from something they already own outranks a set that merely resembles what they liked; while this journey holds the person, that one is suppressed for them rather than queued behind it"* |
| lower | RET-293 Personalized Recommendations | `suppressed` | *"below the complementary next offer for the same person … while that journey holds the person, this one is suppressed for them"* |

Reciprocal in `suppressions` too — RET-293 `s.contest` and RET-294 `s.contest` each state the same
ordering from their own side. Nothing to fix.

## G4 — `date-recognition` (scope `person`, 2 members) — consistent

Created by Batch B, which changed RET-292's `contact.competition` from `"none"` in the same edit.
Both sides quoted in full, since this is the group the earlier RET-24 failure is a warning about:

> **RET-295 Birthday & Milestone** — `exclusionGroup: "date-recognition"`, `scope: "person"`,
> `onLoss: "suppressed"`
> *"above the first-purchase anniversary for the same person - a date the person would call their
> own comes before the company's own count of how long the relationship has lasted; while this
> journey holds the person's window, that one is suppressed for it rather than queued behind it"*

> **RET-292 First Purchase Anniversary** — `exclusionGroup: "date-recognition"`, `scope: "person"`,
> `onLoss: "suppressed"`
> *"below the personal milestone recognition for the same person - the company's own count of how
> long the relationship has lasted yields to a date the person would call their own; where both
> fall in the same window this one is suppressed and its interval closes unsent, exactly as an
> interval that passes unsent always does here"*

Stated a second time on both sides: RET-292 `s.contest` (*"A personal milestone recognition
addressed to the same person outranks this one in the date-recognition group; while it holds the
person's window this interval is suppressed and closes unsent rather than being queued to arrive
after the date it was about"*) and RET-295 `s.contest`. And a third time, in reciprocal
`distinctFrom` rows on both. Correct, and correctly costed — the loser's interval closes rather
than queueing, which matches RET-292's own pre-existing `s.interval`.

## G5 — `membership-standing` (scope `subscription`, 4 members) — consistent

| rank | journey | class | `onLoss` | `precedence`, verbatim (opening clause) |
|---|---|---|---|---|
| highest | SUB-298 Reward Confirmation | `transactional` / `none` | **`superseded`** | *"highest in the group - a state the membership has actually reached outranks every marketing-shaped message about it, so the welcome, the tier announcement and the nurture are all suppressed for a membership this journey is holding; it yields to nothing in this group and loses only to a newer authoritative state for the same reward"* |
| 2 | SUB-299 Loyalty Tier Upgrade | `lifecycle` / `lifecycle` | `suppressed` | *"below the reward confirmation on the same membership … above the membership welcome and the membership nurture, both of which are suppressed while this journey holds the membership because a standing that has just moved is the more current thing to say"* |
| 3 | SUB-296 Loyalty Program Welcome | `lifecycle` / `lifecycle` | `suppressed` | *"below the reward confirmation and below the tier change on the same membership - a state the membership has actually reached outranks an introduction to it; above the membership nurture, which is suppressed for a membership this new because a member who has not yet been welcomed cannot be nurtured"* |
| lowest | SUB-297 Loyalty Program Nurture | `promotional` / `promotional` | `suppressed` | *"lowest in the group - a reward the membership has earned, a change in its standing and the welcome that opens it all outrank a reminder that something already held has gone unused; while any of them holds the membership, this journey is suppressed for it"* |

All six ordered pairs agree, and every member states its position relative to every other member —
by id in `distinctFrom`, and in prose in `precedence` and `s.contest`. `onLoss: "superseded"` on
SUB-298 alone is correct and deliberate: it never loses to a group member, only to *"a newer
authoritative state for the same reward"*, which is supersession rather than suppression, exactly
as GLB-05 distinguishes them.

## G6 — `contactability-question` (scope `person`, 3 members) — consistent

| rank | journey | `onLoss` | `precedence`, verbatim |
|---|---|---|---|
| highest | CON-272 Contact Recovery | **`paused`** | *"highest in the contactability-question group - a route that has actually stopped working has to be repaired before any conclusion is drawn from the silence on it, so while this repair currently holds the person the unengaged sunset stands down rather than reading a dead destination as disinterest"* |
| 2 | CON-283 Frequency Preference Update | **`paused`** | *"above the unengaged sunset in the contactability-question group - somebody who has just chosen a cadence has answered the question the sunset would otherwise ask, so while this confirmation currently holds the person the sunset is suppressed for them; below a contact repair, which is fixing the route this confirmation would travel on"* |
| lowest | CON-300 Unengaged Subscriber Sunset | `suppressed` | *"lowest in the contactability-question group - a contact repair is fixing a route that broke and a frequency confirmation is answering a cadence the person themselves chose, and both are already answering the question this journey would otherwise ask over the top of; when either currently holds the person this journey is suppressed for them rather than queued behind it"* |

Consistent, and `paused` on the two seniors is right under GLB-05: both hold an obligation to the
person that survives a loss. CON-300 also carries the live re-check the group needs inside its own
graph, in **both** send gates: `c.sendable` — *"the send path passes: permission for this purpose,
a deliverable destination, the service pressure cap, no cooldown in force, and **no
higher-precedence contactability journey currently holds this person**"* — and `c.sendable2`.

One member, **CON-283, is in `EXCLUDED_FROM_PUBLIC`** (`src/lib/public-corpus.ts`). CON-300's public
detail page therefore states a precedence against a journey the site does not route to, which
renders as the target's name in text. Same shape as `retention-outreach`'s FBK-46 and
`purchase-intent`'s ACQ-04 — a pre-existing and accepted pattern, not a new defect. → **N9, P2.**

## G7 — `booking-lifecycle` (scope `reservation`, 4 members) — consistent

| rank | journey | `onLoss` | `precedence`, verbatim (opening clause) |
|---|---|---|---|
| highest | SCH-277 Booking Confirmation | `suppressed` | *"highest in the booking-lifecycle group: while the requested time has not yet become a commitment, nothing else may speak to the requester about this booking - the reservation payment reminder (SCH-303), the readiness reminder (SCH-266) and the pre-arrival notice (SCH-304) are all suppressed for it"* |
| 2 | SCH-303 Reservation Payment Reminder | `suppressed` | *"second in the booking-lifecycle group: below the booking outcome notice (SCH-277) … and above the readiness reminder (SCH-266) and the pre-arrival notice (SCH-304) - a reservation that may be released outranks anything about preparing for it or turning up to it"* |
| 3 | SCH-266 Appointment Reminder | `suppressed` | *"third in the booking-lifecycle group: below the booking outcome notice (SCH-277) … and below the reservation payment reminder (SCH-303) … and above the pre-arrival notice (SCH-304)"* |
| lowest | SCH-304 Pre-Arrival Preparation | `suppressed` | *"lowest in the booking-lifecycle group: the booking outcome notice (SCH-277), the reservation payment reminder (SCH-303) and the readiness reminder (SCH-266) all outrank it"* |

All twelve ordered claims agree, every member names every other **by id**, and all four declare
`onLoss: "suppressed"` rather than `paused` — correct, because a held booking message released
later describes a state that has moved, which is what GLB-06 and GLB-07 exist to stop. This is the
most completely stated group of the eight.

## G8 — `service-request` (scope `topic`, 3 members) — consistent

| rank | journey | `onLoss` | `precedence`, verbatim (opening clause) |
|---|---|---|---|
| highest | REM-305 Support Request Acknowledgement | `suppressed` | *"highest in the service-request group while the request is still only a request: until ownership moves at the handoff, neither the issue assessment (REM-151) nor remedy selection (REM-157) speaks to the requester about the same problem"* |
| 2 | REM-151 Post-Purchase Issue Recovery | `suppressed` | *"second in the service-request group: below the support request acknowledgement (REM-305), which owns what the requester hears first and hands the case over only once the acknowledgement window has closed with the request still open; above remedy selection (REM-157)"* |
| lowest | REM-157 Remedy Confirmation | `suppressed` | *"lowest in the service-request group: it speaks only once the issue assessment (REM-151) has established the unresolved obligation and handed the case over, and while either the support request acknowledgement (REM-305) or that assessment holds the case this journey is suppressed for it"* |

Consistent and reciprocal, and backed by a real edge: REM-305's `h.owner → REM-151` `on` is *"a
request still open when the acknowledgement window closes, where the problem itself now has to be
established"*, with `suppresses: ["every further message from this journey about this request"]`.
That is enforcement class 1 and class 3 together.

**The group's ceiling is the finding in N2.** REM-305's precedence binds exactly two journeys by
name. It makes no general claim, and FIN-302 — which will speak to the same requester about the
same request's outcome — is not a member.

---

# 3. The cross-batch pairs nobody reviewed

Thirty-one pairs. **Twenty-three** are the blind set — one side Batch B and the other Batch C or D,
or one side C and the other D — and none of the twenty-three appears in the data in either
direction, or in any of the three batch notes. The remaining **eight** cross Batch A (CON-300 ×
RET-290, RET-292, ACQ-289, RET-293, RET-294; REM-305 × RET-293, RET-294; RET-294 × FUL-301). Those
eight were not blind — Batch A landed first and every later batch could read it — but none of them
is stated either, and five of them carry the same defect as the blind CON-300 pairs, so they are
reviewed here rather than split across §4.

## 3.1 CON-300 (C) vs the loyalty family and the milestone (B) — **P0, N1**

The question is the one the brief poses: **if someone is sunset for marketing contact, what happens
to loyalty sends?** Nothing in either batch could have stated it. Here is what the data actually
says, from both sides.

### CON-300's side: two statements that disagree with each other

CON-300's success path ends by recording a suppression and handing it to the mechanism that holds
suppression states. Two nodes describe what that suppression covers, and they do not describe the
same thing.

`a.suppress`, verbatim:

> "Record a sender-side suppression of marketing contact for this person, **scoped to commercial
> communication and to nothing else**, with the reason, the window it was read from and the
> condition that would release it. The person's own permission record is left exactly as it was:
> silence is not an opt-out, and writing one here would put a decision on their record that they
> never made."
> — `writes: [{ field: "marketing_suppression", mode: "append" }]`

`h.enforce → CON-38`, verbatim:

> `carries`: *"the suppression scope - **commercial communication only**, and nothing the person
> holds, owes or is owed"*
> `suppresses`: *"**every promotional and lifecycle journey** addressed to this person"*, *"their
> queued and in-flight commercial sends"*, *"re-entry into this journey while the suppression
> stands"*

And `a.confirm-end`, the message the person actually receives:

> "Confirm that marketing contact has ended, **name what continues because it was never marketing -
> anything the person holds, owes or is owed** - and leave the route back for whenever they want
> it."

`commercial communication only` and `every promotional and lifecycle journey` are not the same
scope. `promotional` and `lifecycle` are values of `PressureClass` / `PriorityClass`
(`src/canonical/types.ts`: `PressureClass = "none" | "service" | "lifecycle" | "promotional"`).
"Commercial communication" is not one of them; the nearest thing in the corpus's purpose
vocabulary is CMS-203's `a.purpose` — *"Classify the communication's purpose - transactional,
security, service, a mandatory notice, operational, **marketing**, or another defined purpose"* —
which has no `lifecycle` member at all.

This matters because CON-38 keys its record on the scope: `instanceKey: ["person_id",
"suppression_scope"]`, and `s.g3` — *"Different reasons carry different scopes, and a suppression
without its scope cannot be released correctly."* CON-300 writes one scope and instructs another.
The person is told a third thing: that *anything they hold* continues — and a membership is
something they hold.

### The other side: five lifecycle-class journeys, all silent

| journey | batch | `defaultPriority` / `pressureClass` | what it checks before sending |
|---|---|---|---|
| SUB-296 Loyalty Program Welcome | B | `lifecycle` / `lifecycle` | *"purpose-level permission for lifecycle communication is recorded, and hard gates (GLB-31) allow it"* |
| SUB-299 Loyalty Tier Upgrade | B | `lifecycle` / `lifecycle` | same clause, verbatim |
| RET-295 Birthday & Milestone | B | `lifecycle` / `lifecycle` | same clause, verbatim |
| RET-290 First Purchase Thank You | A | `lifecycle` / `lifecycle` | same clause, verbatim |
| RET-292 First Purchase Anniversary | A | `lifecycle` / `lifecycle` | same clause, verbatim |

All five carry an `s.permission` suppression of the same shape. SUB-296's, verbatim: *"No touch
without purpose-level permission for lifecycle communication and a deliverable destination; absent
either, the touch is recorded as a no-action rather than forced onto another route."*

**Permission is the one field CON-300 guarantees will still say yes.** Its `s.notconsent`:

> "Silence is not an opt-out. What this journey reaches is a sender-side suppression recorded
> against our own sending, never a withdrawal recorded against the person's consent, and it is
> released by asking for permission again rather than by switching sending back on (CON-38)."

So each of the five reads exactly the gate CON-300 deliberately leaves open, and none of them reads
the field CON-300 actually writes. `marketing_suppression` is written by CON-300 and **read by
nothing** — scanning all 303 journeys, the string appears in one journey only.

### Is any mechanism catching it?

Three candidates, each checked:

- **CMS-205** re-checks the originating journey's **own** declared group only. SUB-299 is in
  `membership-standing`; CON-300 is in `contactability-question`. Different groups, no arbitration.
- **CMS-203 `a.evaluate`** does read it — *"Evaluate the applicable permission, consent, channel
  preference, mandatory-delivery rules **and suppression state** against that purpose"* — and it is
  step 6 of `sendPathOrder` ("purpose and permission"). This is the real mechanism, and it is why
  this is a P0 in the *data* rather than a certain double-send at runtime. But it evaluates the
  suppression **against the purpose**, and the whole question is whether a `lifecycle`-class
  membership message falls inside a suppression scoped to "commercial communication". Nothing in
  the corpus says.
- **GLB-30** and **GLB-31** both handle the *consent* case and neither covers this one. GLB-30:
  *"Marketing consent withdrawn ends the optional communication that permission covered and leaves
  security, transactional, required operational and legally required communication to be evaluated
  on their own terms."* CON-300 produces no consent withdrawal. GLB-31 enumerates the conditions it
  evaluates — *"absent permission, a closed account, legal ineligibility, a fraud or security hold,
  an open critical issue and a service-recovery pause"* — and a sender-side marketing suppression is
  not among them.

**Verdict: X — a real unstated collision, and the only P0-by-the-second-clause in the corpus.** A
person the business has decided to stop marketing to keeps receiving a birthday message, a loyalty
tier announcement, a membership welcome and a first-purchase anniversary, because every one of them
asks the permission record — which CON-300 has taken care not to change — and the record says yes.
That is the exact volume the sunset exists to end, arriving from five journeys authored three
weeks apart by people who could not see each other.

| pair | verdict |
|---|---|
| CON-300 × SUB-296 | **X** |
| CON-300 × SUB-299 | **X** |
| CON-300 × RET-295 | **X** |
| CON-300 × RET-290 | **X** |
| CON-300 × RET-292 | **X** |

## 3.2 CON-300 (C) vs SUB-297 (B), and the promotional class — P1, N6

Same shape, weaker. SUB-297 is `defaultPriority: "promotional"`, `pressureClass: "promotional"`, and
"commercial communication" unambiguously covers it. CON-300's side is therefore not in doubt: its
`h.enforce.suppresses` names *"every promotional and lifecycle journey addressed to this person"*,
and a promotional loyalty nurture is squarely inside it.

But SUB-297's own eligibility reads *"purpose-level permission for **lifecycle** communication is
recorded"* — note the class mismatch inside SUB-297 itself, a `promotional` journey gating on
lifecycle permission — and its `s.permission` repeats it. It never mentions a sender-side
suppression. Same for ACQ-289, RET-293 and RET-294, all `promotional`/`promotional`, all gating on
*"purpose-level permission for commercial communication is recorded"*.

**Verdict: 1S — resolved but one-sided.** CON-300 states it. The four promotional journeys are
silent. Under this repo's own rule that is a bug, and the fix is one sentence each (§5).

| pair | verdict |
|---|---|
| CON-300 × SUB-297 | **1S** |
| CON-300 × ACQ-289 | **1S** |
| CON-300 × RET-293 | **1S** |
| CON-300 × RET-294 | **1S** |

## 3.3 CON-300 (C) vs SUB-298 (B) — **R, and this is the one the brief asks about**

*"Is a reward confirmation transactional enough to continue?"* **Yes, and the data already says so
from both sides.** This is a finding, not a non-finding.

SUB-298 `contact.defaultPriority: "transactional"`, `pressureClass: "none"`,
`localCap.appliesTo: "non-mandatory"`, and its `cooldown.default` reads *"No cooldown applies
between confirmations: each one is about a different reward record, and a member who earns several
in quick succession is owed each of them"* with `basis: "corpus-rule"` and `applicableWhen: "GLB-24;
a transactional confirmation is never withheld to protect a contact budget"`.

CON-300 `s.transactional`, verbatim:

> "A sunset ends marketing contact and nothing else. What the person holds, owes or is owed stays
> governed by its own rules, and an implementation that stops those messages too has made an opt-out
> out of something nobody chose."

And `a.confirm-end` promises the person exactly that: *"name what continues because it was never
marketing - anything the person holds, owes or is owed"*. A credited reward is something they hold.
GLB-30 states the same from the mechanism side.

**Verdict: R.** Nothing to fix. Note the contrast with §3.1: the class boundary that works here is
`transactional` / `none` — an unambiguous value — while the one that fails is the `lifecycle`
value, which CON-300's own scope prose does not cover.

## 3.4 CON-300 (C) vs SCH-303 · SCH-304 · REM-305 (D) — R

All three are outside the marketing classes: SCH-303 and SCH-304 are `service`/`service`, REM-305 is
`transactional`/`none`. CON-300's `h.enforce.suppresses` reaches *"every promotional and lifecycle
journey"* and stops there; its `s.transactional` and `a.confirm-end` both say the rest continues.
SCH-303's `s.hard-gates` states the reciprocal from its own side — *"The service pressure class
deduplicates this against other service messages about the same reservation; it does not ration a
notice the holder is owed before the terms release their place"* — as does SCH-304's. REM-305's
`s.transactional` is the strongest form of it (§3.9).

**Verdict: R** for all three. A sunset does not stop a reservation being released, an arrival being
explained or a support request being acknowledged, and each pair says so from both sides without
either batch having seen the other. Three correct answers by construction rather than by agreement
— worth naming because the construction is what made them safe.

| pair | verdict |
|---|---|
| CON-300 × SCH-303 | **R** |
| CON-300 × SCH-304 | **R** |
| CON-300 × REM-305 | **R** |

## 3.5 FUL-301 (C) vs SCH-277 and the booking-lifecycle group (D) — P1, N4

*A booking that is also an order.* FUL-301 triggers on `fulfillment_obligation_accepted`;
SCH-277 triggers on `reservation_request_recorded` and confirms at `a.confirm` — *"State the
committed slot, the resource and the terms concretely - the date, the time, the place, what is
needed on arrival."* FUL-301 confirms *"what the record accepted, what it declined"*.

The corpus does not say whether a reservation is a fulfillment obligation. FUL-301's `entity.note`
narrows itself in exactly one direction and names exactly two journeys:

> "The entity is the order record at the moment it opens, not the order's whole life. Where it is,
> whether it is running late and whether it arrived are states other journeys narrate, and this one
> states none of them."

`s.status` names FUL-265 and FUL-146. Its five `distinctFrom` rows name FUL-265, FUL-146, FUL-291,
RET-290 and FIN-131. **No scheduling journey appears anywhere in FUL-301**, and FUL-301 appears
nowhere in SCH-277, whose single `distinctFrom` row names SCH-173 only.

Where a paid reservation is sold as an order, both triggers fire and the person receives two
confirmations of one transaction — against FUL-301's own `s.once`: *"One confirmation per accepted
obligation. A second is not reassurance; it reads as a second order, and it is the duplicate that
generates the support contact this message exists to prevent."*

**Verdict: X — a real unstated collision.** P1 rather than P0 because no double-send is
*established*: whether the two fire together depends on a mapping neither journey states. The
defect is that the mapping is unstated, in a corpus whose whole method is to state it. The two
journeys' entities are different records (`obligation_id` vs `booking_id`) and a shared group would
be the wrong instrument — this is a who-says-what boundary, and Batch C's own §4 reasoning for
FIN-302/FIN-137/FIN-138 gives the right shape: reciprocal `distinctFrom` plus a suppression, not a
competition group.

FUL-301 × SCH-303 and FUL-301 × SCH-304 are the same question one step downstream and carry the
same verdict; once the order/reservation boundary is stated, both fall out of it.

| pair | verdict |
|---|---|
| FUL-301 × SCH-277 | **X** |
| FUL-301 × SCH-303 | **X** (dependent) |
| FUL-301 × SCH-304 | **X** (dependent) |

## 3.6 FIN-302 (C) vs REM-305 (D) — **P0, N2**

The sharpest cross-batch defect after N1, and the cleanest to fix.

**FIN-302's side.** `contact.competition: "none"` — under GLB-01's own notes, *"Journeys that carry
no competition field are declaring that they compete with nothing."* FIN-302 declares it competes
with nothing, including REM-305. Its guardrails against overclaiming are precise and are the reason
the journey exists:

> `s.approved` — *"Approved is not refunded and submitted is not settled. Every message says which
> of the three is true at the moment it is sent, and an arrival is claimed only from the financial
> record that confirms it (FIN-138)."*
> `s.timing` — *"Nothing is promised about when the money will appear. The settlement route's own
> timing is not the sender's to assert, and a date the business cannot enforce turns an arrival into
> a broken promise."*
> `s.partial` — *"A partial refund is named as partial, with the amount returned and the amount still
> refundable stated separately."*
> `s.decision` — *"The decision to refund is not this journey's to announce. Whether a refund was
> approved, refused or is under review is said by the journey that decided it (FIN-137), and which
> remedy would resolve the obligation at all is said by the journey that chose it (REM-157). This
> one opens only once money is actually moving."*

`s.decision` names FIN-137 and REM-157. **REM-305 did not exist when it was written.**

**REM-305's side.** Two of its three communication actions state what closed a request:

> `a.resolved-now` — *"Say that the thing they raised is already done, **and what was done**. An
> acknowledgement here would promise attention to a problem that no longer exists, and the requester
> would then wait for it"*
> `a.resolution` — *"Say that the request is closed **and what closed it**. This is sent because the
> request's own state changed, which is the only reason a second message exists at all"*

and `c.sendable2` gates the second on *"the record actually carries what closed the request"*.

REM-305's one guardrail against stating an outcome is `s.no-outcome`, and it binds **only the
acknowledgement**:

> "**The acknowledgement** states that the request exists and who owns it. It never states a remedy,
> an eligibility or a fault, because none of those has been decided at the moment it is sent."

`a.resolved-now` and `a.resolution` are outside it by their own wording. So: a requester who raises
"where is my refund" against a request already resolved at intake gets REM-305 saying what was done;
a requester whose request is closed by a refund inside the acknowledgement window gets REM-305 saying
a refund closed it. In both cases REM-305 makes a claim about money that FIN-302 owns and guards
with three suppressions REM-305 does not carry — including the one that separates *submitted* from
*settled*, which is the single distinction the whole of FIN-302 is built around.

The `service-request` group does not cover it: its scope is `topic`, its members are REM-305,
REM-151 and REM-157, and REM-305's precedence claims authority over exactly those two by name.
FIN-302 is not a member and makes no counterclaim.

**Verdict: X — a real unstated collision, P0.** Two journeys will tell the same person about the
same refund, and the one with no guardrails may speak first.

## 3.7 FIN-302 (C) vs SCH-303 (D) — N

SCH-303's release action, `a.lapse`, verbatim: *"Say that the reservation was released, that nothing
is being held, and what the record now shows. A place that quietly disappears is discovered on the
day by somebody who still believes they have it."* It makes no claim about money — consistent with
`s.failure-not-ours` (*"An attempted payment that actually failed is not a reminder problem.
Ownership of the money moves to payment recovery (FIN-134), and this journey stops talking about the
payment rather than running alongside it"*) and with Batch D's own statement that SCH-303 *"never
names an amount overdue as a debt"*.

FIN-302's entity is `refund_id` — *"one refund in motion"*, `instanceKey: ["refund_id"]`. SCH-303's
is `booking_id`. Different entities, no shared scope instance, no shared claim.

**Verdict: N — not a collision.** Where a released reservation returns a deposit, the two are
sequential and speak about different facts. The seam is un-named on both sides and is harmless;
it is not worth a row.

## 3.8 FUL-301 / FIN-302 (C) vs SUB-296 / SUB-298 (B) — N

- **FUL-301 × SUB-296.** A person who enrols at the moment they first buy fires
  `fulfillment_obligation_accepted` and `loyalty_membership_enrolled` together. Different entities
  (`obligation_id` vs `membership_id`), so under GLB-01 — *"two journeys are in competition only
  when they share that scope and the same instance of it"* — they are not competing, and a shared
  group would be the category error the brief warns about. Both sides also state the subject
  boundary, transitively and without ever naming each other: SUB-296 `s.purchase` — *"Where somebody
  enrols at the moment they first buy, the purchase moment belongs to the journey that owns the
  customer relationship and this one speaks only about the membership"* — defers to RET-290, and
  RET-290 defers to FUL-301 in four places. **Verdict: N.**
- **FUL-301 × SUB-298**, **FIN-302 × SUB-298**, **FUL-301 × SUB-297**: different entities, no shared
  claim, both transactional or differently-subjected. **Verdict: N.**

## 3.9 REM-305 (D) vs SUB-297 · RET-293 · RET-294 (B, A) — **1S, and correctly so**

The claim Batch D wrote and deliberately did not reciprocate. REM-305 `s.transactional`, verbatim:

> "An acknowledgement is transactional. It is deduplicated against other messages about the same
> request rather than rationed against a promotional budget, and a marketing or lifecycle journey
> holding the person never delays it or takes its place. Hard gates (GLB-31) still apply, and
> nothing else does."

**The direction REM-305 claims is enforced by its own fields, not by prose.**
`contact.pressureClass: "none"` takes it out of `sendPathOrder` step 5 ("contact pressure and
frequency policy"), and its `c.sendable` branch says so in the graph: *"hard gates permit
communication for this purpose and the contact point is deliverable; **no pressure cap applies,
because this message is owed rather than rationed**"*. GLB-24 bounds budgets; a journey with no
pressure class is not inside one. No promotional journey needs to agree for this to hold.

**The reverse direction is genuinely unstated, and Batch D said so.** Nothing suppresses SUB-297,
RET-293 or RET-294 while a support request is open. GLB-31's notes reach only part of it — *"An open
critical issue suppresses promotional asks, advocacy and upsell and leaves resolution and support
communication"* — and a support request is not by itself a critical issue. Batch D's notes state
the omission and the reason: the stronger claim *"is a product decision this batch was not given and
could not state honestly: an open request about one subject says nothing about whether a message
about a different subject is welcome."*

**Verdict: 1S, P2.** That reasoning is correct and the omission is correctly declared. No data edit
is proposed; this belongs in `audit/DECISIONS-PENDING.md` as a product question, not in a journey.
It is listed here because a declared one-sidedness still has to be visible to the next reader.

| pair | verdict |
|---|---|
| REM-305 × SUB-297 | **1S** (declared) |
| REM-305 × RET-293 | **1S** (declared) |
| REM-305 × RET-294 | **1S** (declared) |
| REM-305 × SUB-296 | **N** — different entity, no promotional claim at stake |
| REM-305 × SUB-298 | **N** — both transactional, different entities |
| REM-305 × RET-295 | **N** — different entity |
| SCH-303 × SUB-297 | **N** — reservation vs membership |
| SCH-304 × RET-295 | **N** — occurrence vs milestone cycle |

## 3.10 Cross-batch summary

| block | blind? | pairs | R | 1S | X | N |
|---|---|--:|--:|--:|--:|--:|
| CON-300 (C) × SUB-296 · SUB-297 · SUB-298 · SUB-299 · RET-295 (B) | yes | 5 | 1 | 1 | 3 | 0 |
| CON-300 (C) × SCH-303 · SCH-304 · REM-305 (D) | yes | 3 | 3 | 0 | 0 | 0 |
| FUL-301 · FIN-302 (C) × SCH-277 · SCH-303 · SCH-304 · REM-305 (D) | yes | 5 | 0 | 0 | 4 | 1 |
| FUL-301 · FIN-302 (C) × SUB-296 · SUB-297 · SUB-298 (B) | yes | 4 | 0 | 0 | 0 | 4 |
| REM-305 · SCH-303 · SCH-304 (D) × SUB-296 · SUB-297 · SUB-298 · RET-295 (B) | yes | 6 | 0 | 1 | 0 | 5 |
| CON-300 (C) × RET-290 · RET-292 · ACQ-289 · RET-293 · RET-294 (A) | no | 5 | 0 | 3 | 2 | 0 |
| REM-305 (D) × RET-293 · RET-294 (A); RET-294 (A) × FUL-301 (C) | no | 3 | 1 | 2 | 0 | 0 |
| **total** | | **31** | **5** | **7** | **9** | **10** |

Read the first five rows on their own — the blind set — and it is **23 pairs, 4 R, 2 1S, 7 X,
10 N**. Seven of the ten X verdicts in this whole review are in a set nobody was in a position to
check.

---

# 4. The pairs inside a batch, and against existing journeys

Reviewed for completeness and for the reciprocity rule. **Fifty-nine pairs — 36 R · 22 1S · 1 X ·
0 N.** Every verdict is checkable against the field named. Nothing in this section is a
double-send; the single X is the `commerce-recovery` ordering defect, and every 1S is a
`distinctFrom` asymmetry.

## 4.1 Batch A (21 pairs)

| pair | verdict | basis |
|---|---|---|
| ACQ-289 × ACQ-13 | **X** | both claim lowest in `commerce-recovery` — **N3** |
| ACQ-289 × ACQ-287 | R | ACQ-287 precedence covers *"every … inferred interest"*; ACQ-289 `s.contest` defers |
| ACQ-289 × ACQ-288 | R | same, both directions in `precedence` |
| ACQ-289 × ACQ-12 | 1S | ACQ-289 `distinctFrom`; ACQ-12 silent on ACQ-289 |
| ACQ-289 × ACQ-11 | 1S | ACQ-289 precedence implies it; ACQ-11 enumerates without it |
| ACQ-289 × RET-31 | 1S | ACQ-289 `distinctFrom`; RET-31 silent |
| ACQ-289 × SCH-282 | 1S | neither orders the other; SCH-282's *"alongside"* is pre-existing |
| RET-290 × FUL-291 | R | both `precedence` + RET-290 `s.contest` + both `distinctFrom` |
| RET-290 × ACQ-285 | 1S | RET-290 `distinctFrom`; ACQ-285 silent |
| RET-290 × RET-31 | 1S | RET-290 `distinctFrom`; RET-31 silent |
| FUL-291 × FUL-265 | 1S | FUL-291 `distinctFrom` + `s.status`; FUL-265's row names FUL-301, not FUL-291 |
| FUL-291 × FUL-146 | R | FUL-291 `s.status`; FUL-146 gained its row in Batch C |
| FUL-291 × FBK-41 | 1S | FUL-291 `distinctFrom` + `s.rating`; FBK-41 silent |
| FUL-291 × REM-151 | 1S | FUL-291 `s.issue` + `distinctFrom` + precedence; REM-151 silent |
| RET-292 × RET-290 | 1S | RET-292 `distinctFrom`; RET-290 silent |
| RET-292 × SUB-163 | 1S | RET-292 `distinctFrom`; SUB-163 silent |
| RET-293 × RET-294 | R | see G3 |
| RET-293 × RET-31 | 1S | RET-293 `distinctFrom`; RET-31 silent |
| RET-293 × ACQ-13 | 1S | RET-293 `distinctFrom`; ACQ-13 silent |
| RET-294 × ACQ-288 | 1S | RET-294 `distinctFrom`; ACQ-288 silent |
| RET-294 × RET-31 | 1S | RET-294 `distinctFrom`; RET-31 silent |

(RET-292 × RET-295 is counted in §4.2 and RET-294 × FUL-301 in §3; neither is double-counted here.)
**1 X · 5 R · 15 1S.**

**RET-31 is named by four of the seventeen (ACQ-289, RET-290, RET-293, RET-294) and names none of
them.** ACQ-13 is named by two and names neither. Both are hubs of the kind the last review
flagged (*"Two journeys — ACT-12 and FBK-43 — have no `distinctFrom` at all, and both are hubs"*),
and both sit on the one group defect in §2.

## 4.2 Batch B (14 pairs)

| pair | verdict | basis |
|---|---|---|
| SUB-296 × SUB-297 | R | precedence both ways + reciprocal `distinctFrom` + SUB-297 `s.transactional` |
| SUB-296 × SUB-298 | R | precedence both ways + SUB-296 `s.contest` |
| SUB-296 × SUB-299 | R | precedence both ways ("below the tier change" / "above the membership welcome") |
| SUB-297 × SUB-298 | R | precedence, `s.transactional`, and reciprocal `distinctFrom` on both |
| SUB-297 × SUB-299 | R | precedence both ways + SUB-299 `s.contest` |
| SUB-298 × SUB-299 | R | precedence both ways + reciprocal `distinctFrom` |
| SUB-296 × RET-290 | R | reciprocal `distinctFrom` (both added in Batch B) + SUB-296 `s.purchase` |
| SUB-296 × ACT-12 | R | reciprocal `distinctFrom` + SUB-296 `s.onboarding` |
| SUB-297 × RET-293 | R | reciprocal `distinctFrom` + SUB-297 `s.recommendation` + RET-293's own row |
| SUB-297 × RET-294 | R | reciprocal `distinctFrom`, both sides explicitly forbidding the borrow |
| SUB-298 × REM-157 | 1S | SUB-298 `distinctFrom`; REM-157 silent on SUB-298 although Batches C and D both edited it |
| RET-295 × RET-292 | R | see G4 |
| RET-295 × SUB-299 | R | reciprocal `distinctFrom` on both |
| RET-295 × RET-294 | 1S | RET-295 `distinctFrom` + `s.claim`; RET-294 silent |

**12 R · 2 1S.** Batch B is the most completely reciprocated of the four: **twelve of fourteen are R**, and the two
1S rows are `distinctFrom` asymmetries with no ownership consequence. SUB-297 × RET-293/RET-294 is
the model answer to the category question — different entities, stated as reciprocal `distinctFrom`
plus a suppression rather than as a group.

## 4.3 Batch C (15 pairs)

| pair | verdict | basis |
|---|---|---|
| CON-300 × CON-272 | R | see G6 — precedence both ways + CON-300 `s.contest` + reciprocal `distinctFrom` |
| CON-300 × CON-283 | R | precedence both ways + reciprocal `distinctFrom` + `h.frequency → CON-283` |
| CON-300 × CON-38 | R | `h.enforce` with `carries`/`suppresses`; CON-38 gained a reciprocal `distinctFrom` naming CON-300 and the sender-side distinction |
| CON-300 × RET-32 | R | CON-300 `s.notwinback` + `distinctFrom`; RET-32 gained the reciprocal row |
| CON-300 × RET-26 | 1S | CON-300 `distinctFrom`; RET-26 silent |
| FUL-301 × FUL-291 | R | see G2 |
| FUL-301 × RET-290 | R | see G2 |
| FUL-301 × FUL-265 | R | FUL-301 `s.status` + `distinctFrom`; FUL-265 gained the reciprocal row |
| FUL-301 × FUL-146 | R | FUL-301 `s.status` + `distinctFrom`; FUL-146 gained its first `distinctFrom` row ever |
| FUL-301 × FUL-150 | R | `h.cancelled → FUL-150`, `suppresses: ["every further message from this journey about this obligation"]` |
| FUL-301 × FIN-131 | 1S | FUL-301 `distinctFrom`; FIN-131 silent |
| FIN-302 × FIN-137 | R | FIN-302 `s.decision` + `distinctFrom`; FIN-137 gained the reciprocal row |
| FIN-302 × FIN-138 | R | FIN-302 `s.approved` + `distinctFrom`; FIN-138 gained its first `distinctFrom` row |
| FIN-302 × REM-157 | R | FIN-302 `s.decision` + `distinctFrom`; REM-157 gained the reciprocal row |
| FIN-302 × FIN-134 | 1S | FIN-302 `distinctFrom`; FIN-134 silent — **N5** |

**13 R · 2 1S.** Batch C's §4 decision — *not* to declare a `money-returned` competition group for
FIN-302/FIN-137/REM-157 — is **correct**, and it is worth stating plainly because it is the
decision this repo has got wrong in the other direction before. The three are sequential, joined by
handoffs (REM-157 → FIN-137 → FIN-138 → FIN-302's own trigger), and a handoff is the mechanism that
moves ownership. A group would have declared a standing contest the graph already resolves, and
GLB-03's own note warns against exactly that: *"adding a group to make a suppression convenient is
how unrelated lifecycles start blocking each other."*

## 4.4 Batch D (9 pairs)

| pair | verdict | basis |
|---|---|---|
| SCH-303 × SCH-277 | R | see G7 + SCH-303 `s.contest` + `distinctFrom` |
| SCH-303 × SCH-266 | R | precedence both ways + reciprocal reasoning in `distinctFrom` |
| SCH-303 × SCH-304 | R | precedence both ways + SCH-304 `s.contest` + SCH-304 `distinctFrom` |
| SCH-304 × SCH-277 | R | precedence both ways + `distinctFrom` |
| SCH-304 × SCH-266 | R | precedence both ways + `distinctFrom` on both |
| SCH-303 × FIN-134 | 1S | SCH-303 `s.failure-not-ours` + `h.payment-failure → FIN-134` + `distinctFrom`; FIN-134 silent — **N5** |
| REM-305 × REM-151 | R | see G8 + `h.owner → REM-151` with `suppresses` |
| REM-305 × REM-157 | R | see G8, precedence both ways |
| REM-305 × FBK-43 | 1S | REM-305 `distinctFrom`; FBK-43 silent |

**6 R · 3 1S.** Batch D's decision **not** to give FIN-134 a `contact.competition` block is right, and its stated
reason is right: *"Adding a competition block to FIN-134 would have put it in the
`booking-lifecycle` group, which is false — FIN-134 is not a booking journey and most of its
instances have no reservation behind them at all."* But that reasoning covers `competition` only.
It does not cover `distinctFrom`, which costs nothing and states the boundary from FIN-134's side.
See N5.

---

# 5. What is still one-sided or unstated — the fix list

Severity-ordered. Each item names the journey, the field and the sentence.

## F1 — CON-300's suppression scope, and the five lifecycle journeys that cannot see it — **P0**

**Two edits, both required; the second is worthless without the first.**

**F1a. Make CON-300 say one thing.** The contradiction is between `a.suppress` / `h.enforce.carries`
("commercial communication only") and `h.enforce.suppresses` ("every promotional and lifecycle
journey"). Resolve it toward the broader reading, because that is what `a.confirm-end` promises the
person and what the journey's own purpose requires.

- `CON-300.nodes[a.suppress].does` — replace *"scoped to commercial communication and to nothing
  else"* with: *"scoped to non-mandatory commercial contact — every promotional and lifecycle send —
  and to nothing else"*.
- `CON-300.nodes[h.enforce].carries[1]` — replace *"the suppression scope - commercial communication
  only, and nothing the person holds, owes or is owed"* with: *"the suppression scope - every
  promotional and lifecycle send, and nothing transactional, service, security or mandatory; nothing
  the person holds, owes or is owed"*.
- `CON-300.suppressions` += `CANONICAL_RULE`, id `s.scope`: *"The suppression this journey records
  covers the promotional and lifecycle pressure classes and nothing else. A transactional
  confirmation, a service notice about something the person holds and a mandatory notice are each
  outside it by class, not by exception — which is why the ending message can honestly say they
  continue."*

**F1b. Give the five a field they actually read.** Each of RET-290, RET-292, RET-295, SUB-296 and
SUB-299 currently gates on permission alone, which CON-300 guarantees is unchanged. Add to each
journey's `eligibility`, after its existing permission clause:

> "no sender-side marketing suppression stands against this person (CON-38) — a suppression the
> business recorded against its own sending is not a permission the person withdrew, and this
> journey reads both."

and to each journey's `suppressions`, as `CANONICAL_RULE` id `s.suppressed`:

> "A sender-side suppression of promotional and lifecycle contact stands down this journey for as
> long as it holds. Silence is not an opt-out and the person's permission record still says yes,
> which is exactly why this journey has to read the suppression rather than the permission —
> CON-300 decided the contact should stop and left the consent record alone on purpose."

Apply the same two edits to **SUB-297, ACQ-289, RET-293 and RET-294** (F2), which need only the
second half of the argument.

## F2 — the four promotional journeys are silent on the same suppression — **P1**

SUB-297, ACQ-289, RET-293, RET-294. CON-300's side is already unambiguous for these four, so only
the reciprocal is missing. Same `eligibility` clause and same `s.suppressed` suppression as F1b,
with "promotional and lifecycle" reading correctly for all four as written.

Also fix the class mismatch inside SUB-297 while editing it: it is
`defaultPriority: "promotional"`, `pressureClass: "promotional"`, and both its `eligibility` and
its `s.permission` gate on *"purpose-level permission for **lifecycle** communication"*. Every
other promotional journey in the seventeen (ACQ-289, RET-293, RET-294) gates on *"commercial
communication"*. Change SUB-297's two occurrences to match.

## F3 — REM-305 states what FIN-302 owns — **P0**

**Three edits, one per side plus a reciprocal row.**

- `REM-305.suppressions` += `CANONICAL_RULE`, id `s.money`: *"Where what closed the request was
  money going back, this journey says the request is closed and stops there. Whether a refund has
  been submitted, has settled or is being reconciled is the refund notification's (FIN-302) to
  state, and a request closed 'because we refunded you' tells a requester the money has arrived
  when the record says only that it was sent."*
- `FIN-302.suppressions[s.decision].text` — extend with: *"…and that a request has been closed is
  said by the journey that acknowledged it (REM-305). This one opens only once money is actually
  moving, and it is the only journey that says whether it arrived."*
- Reciprocal `distinctFrom` rows: `REM-305 → FIN-302` (*"FIN-302 states that money is moving against
  a refund and whether it arrived. This states that a request is closed; where the two are the same
  event, this journey says the request ended and never says where the money is."*) and
  `FIN-302 → REM-305` (*"REM-305 owns what a requester hears about the request itself - that it
  arrived, who has it, and that it closed. This owns the movement of money, which is a different
  record with a different state, and a closed request is never a settled refund."*)

No competition group. Batch C's §4 reasoning applies exactly: this is a who-says-what boundary
downstream of a handoff chain, and the corpus states those in suppressions and `distinctFrom`.

## F4 — `commerce-recovery` has two bottoms and one stranger — **P1**

- `ACQ-289.contact.competition.precedence` — replace *"lowest in the commerce-recovery group"* with
  an ordering that names the members it did not: *"below the checkout (ACQ-287), the generic process
  pattern (ACQ-11), the held cart (ACQ-288) and the held selection (ACQ-12) for the same person - an
  interest that could never convert at all is the weakest claim of the five; **above the inferred
  interest (ACQ-13), the predicted need (RET-31) and the availability enquiry (SCH-282)**, because
  this journey knows why nothing was selected and each of those is inferring it. When a
  higher-precedence member holds the person this alert is suppressed for them rather than queued
  behind it."*
- `ACQ-13.contact.competition.precedence` — replace *"lowest in the group"* with *"below every other
  member of the commerce-recovery group, the back-in-stock alert (ACQ-289) included - a process in
  motion, a held selection, a predicted need and a known unavailability all outrank an inferred
  interest for the same person."*
- `ACQ-289.suppressions[s.contest].text` — extend the enumeration past checkout and cart to the
  members its precedence now names.
- `ACQ-13.distinctFrom` += ACQ-289; `ACQ-12.distinctFrom` += ACQ-289; `RET-31.distinctFrom` +=
  ACQ-289. Three rows, so the group's only unreferenced member stops being one.

Which of ACQ-289 / ACQ-13 goes on top is a product call. The ordering above is the one the two
journeys' own reasoning implies — ACQ-289 *"knows the reason - the item was not purchasable"*
(`distinctFrom[ACQ-13]`) while ACQ-13 acts on attention *"for reasons the library does not claim to
know"* — but any explicit ordering is better than two bottoms, and GLB-02 forbids leaving it to a
tie-break.

## F5 — order and reservation are not distinguished — **P1**

- `FUL-301.distinctFrom` += `{ journey: "SCH-277", because: "SCH-277 confirms that a requested time
  became a commitment, against the booking record. This confirms what a fulfillment obligation
  accepted, against the order record. Where a business sells a reservation as an order both records
  exist and both are confirmed once: this journey states the scope and the terms it took on, and it
  never states the slot, the resource or what to bring." }`
- `SCH-277.distinctFrom` += `{ journey: "FUL-301", because: "FUL-301 confirms what a fulfillment
  obligation accepted at the moment its record opened. This confirms the slot, the resource and the
  terms of a booking. A reservation is not a fulfillment obligation and this journey never confirms
  an order; where both records exist for one transaction, each confirms its own and neither restates
  the other's." }`
- `FUL-301.suppressions[s.status].text` — extend with: *"Nor does it confirm a booking. A committed
  slot, its resource and what is needed on arrival are the booking confirmation's (SCH-277) own
  state, and an order confirmation that restates them is a second confirmation of one transaction."*

## F6 — FIN-134 is deferred to by two of the seventeen and names neither — **P1**

- `FIN-134.distinctFrom` += `{ journey: "SCH-303", because: "SCH-303's subject is a reservation that
  is still standing and whether it survives; the payment is a condition on it. This journey's
  subject is the obligation itself, from the moment an attempt actually failed. SCH-303 hands the
  money here and stops speaking about it - this journey never speaks about the reservation, and the
  release point it is handed is a consequence to work inside rather than a deadline to restate." }`
- `FIN-134.distinctFrom` += `{ journey: "FIN-302", because: "This journey is money that failed to
  come in and an obligation that stays open. FIN-302 is money going back out against an obligation
  already discharged. The two share a payment record and nothing else, and neither ever announces
  the other's movement." }`

No `contact.competition` on FIN-134 — Batch D's reasoning for leaving it at `"none"` stands.

## F7 — `post-purchase-welcome` suppresses across orders — **P2**

The group's `scope` is `person` while FUL-301 (`obligation_id`) and FUL-291
(`person_id + fulfillment_id`) are per-order. A repeat customer whose order B is confirmed has the
follow-up on order A's completion suppressed, against GLB-08's *"A contest resolved on one scope
instance constrains only that instance. Winning ownership of one order does not suppress a journey
about another."*

The group cannot simply move to an order scope, because RET-290 genuinely is per-person
(`instanceKey: ["person_id"]`, *"One instance per person, ever"*). The minimum honest fix is to say
what the person scope is doing:

- `FUL-301.contact.competition.precedence` — append: *"The group's scope is the person rather than
  the order deliberately: two post-purchase messages arriving together are noise to the person
  whichever orders they belong to. It is a contact-pressure judgment, not an ownership claim over
  another order."*
- `FUL-291.suppressions` += `CANONICAL_RULE`, id `s.scope`: *"This journey defers to a confirmation
  for the same person even where that confirmation belongs to a different order. Two post-purchase
  messages in one moment are one too many, and the transactional one is the one that cannot wait."*

If that is not the intended behaviour, the group scope is wrong and the fix is a product call rather
than a wording change; it is recorded here as a finding, not acted on.

## F8 — twenty-two one-sided `distinctFrom` rows out of the seventeen — **P2**

Documentation symmetry only; none carries an ownership consequence. Each is one row on the silent
side, mirroring the row that already exists:

| add to | naming | already stated on |
|---|---|---|
| ACQ-12, ACQ-13, RET-31 | ACQ-289 | ACQ-289 (also F4) |
| ACQ-285, RET-31 | RET-290 | RET-290 |
| FUL-265, FBK-41, REM-151 | FUL-291 | FUL-291 |
| RET-290, SUB-163 | RET-292 | RET-292 |
| RET-31, ACQ-13 | RET-293 | RET-293 |
| RET-31, ACQ-288, RET-295 | RET-294 | RET-294 / RET-295 |
| SUB-296 | SUB-299 | SUB-299 |
| REM-157 | SUB-298 | SUB-298 |
| RET-26 | CON-300 | CON-300 |
| FIN-131 | FUL-301 | FUL-301 |
| FIN-134 | FIN-302, SCH-303 | both (also F6) |
| FBK-43 | REM-305 | REM-305 |

**RET-31 appears four times in that table.** It is named by ACQ-289, RET-290, RET-293 and RET-294 —
four of the seventeen — and names none of them. It is the corpus's current worst instance of the
hub pattern the last review identified, and it is the one row-set worth doing first.

## F9 — the product question Batch D declined, recorded rather than fixed — **P2**

Whether an open support request should suppress unrelated promotional sends to the same person.
REM-305's `s.transactional` claims only the direction that its own `pressureClass: "none"` already
enforces; the reverse is unstated and Batch D was right that it cannot be written honestly without a
product decision. Belongs in `audit/DECISIONS-PENDING.md`. **No journey edit is proposed.**

---

# 6. Checked and found correct

Listed because a review that names only problems cannot be told apart from a review that stopped
early. Each of these looked like a collision and is not one, or is one the authored data already
resolves.

1. **CON-300 vs SUB-298 — a reward confirmation continues, and both sides say so.** SUB-298 is
   `transactional`/`none`; CON-300's `s.transactional`, `a.confirm-end` and GLB-30 all say the
   transactional class survives a sunset. The brief's own question, answered in the data.
2. **CON-300 vs SCH-303, SCH-304 and REM-305 — a sunset does not touch service or transactional
   work**, stated from both sides (CON-300 `s.transactional`; SCH-303/SCH-304 `s.hard-gates`;
   REM-305 `s.transactional`) without either batch having seen the other.
3. **`booking-lifecycle` is the best-stated group in the corpus.** Four members, twelve ordered
   claims, all agreeing, every member naming every other by id, all four `onLoss: "suppressed"` with
   the reason given (a held booking message describes a state that has moved).
4. **`membership-standing` is internally complete.** All six ordered pairs agree; `onLoss:
   "superseded"` on SUB-298 alone is the correct GLB-05 distinction, not an inconsistency.
5. **`date-recognition` is stated three times from each side** — precedence, `s.contest` and
   reciprocal `distinctFrom` — and the loser's cost is named (the interval closes unsent) rather
   than left to a queue.
6. **`post-purchase-welcome` is a model reciprocal order.** FUL-301 declares the contest explicitly
   *"so the other two have a named side to defer to"*, and both juniors state the deference three
   and four times over.
7. **`service-request` is backed by a real edge**, not only by precedence: `h.owner → REM-151`
   carries the acknowledgement and suppresses every further message from REM-305.
8. **`contactability-question`'s two senior members are `paused`, not `suppressed`** — correct under
   GLB-05, because both hold an obligation to the person that survives a loss.
9. **CON-300 carries the group's live re-check in its own graph**, in both send gates, which is what
   `validate-canonical`'s `competition_member_unenforced` looks for.
10. **The absence of a graph-level re-check in FUL-291, RET-292, SUB-298, FUL-301, FIN-302 and
    REM-305 is correct**, not an omission. CMS-205 `a.reread` performs the competition re-check
    generically for every `execution: "communication"` action, and the validator deliberately
    exempts them (*"re-litigating CMS-205's own architectural fix one journey at a time would be
    exactly the caller-side duplication the repair round's own brief said not to do"*).
11. **Batch C was right not to declare a `money-returned` group** for FIN-302 / FIN-137 / REM-157.
    The three are joined by handoffs, and a handoff moves ownership; GLB-03's own note warns against
    groups added for convenience.
12. **Batch D was right not to give FIN-134 a competition block.** It would have forced FIN-134 into
    `booking-lifecycle`, which is false for most of its instances. Only its `distinctFrom` rows are
    missing (F6).
13. **SUB-297 vs RET-293 / RET-294 is the correct answer to the category question.** Different
    entities (a membership benefit; a product proposal), stated as reciprocal `distinctFrom` on all
    four sides plus SUB-297 `s.recommendation`, with no group — exactly the shape GLB-01 prescribes.
14. **SUB-296 vs RET-290 and SUB-296 vs ACT-12** are likewise entity boundaries, reciprocated on
    both sides and backed by SUB-296's own `s.purchase` and `s.onboarding`.
15. **RET-294 vs FUL-301 needs no statement.** A purchase fires both, and RET-294's own
    `s.premature` holds the offer back until the thing it completes *"has plausibly been received
    and used"*. It resolves itself.
16. **SUB-299's downgrade refusal is in the graph, not in a comment.** `c.direction` reads the
    programme's own ordering and a downward movement exits at `x.out-of-scope`, class `no-action`,
    without a message. A journey that declines a case in prose and sends anyway is a failure mode
    this corpus does not have here.
17. **SCH-303 does not talk about money after its handoff.** `a.lapse` states the reservation and
    the record, nothing else — consistent with `s.failure-not-ours` and with
    `h.payment-failure → FIN-134`'s `suppresses` clause.
18. **REM-305's own transactional claim is enforced by its fields, not by its prose** —
    `pressureClass: "none"` plus the `c.sendable` branch *"no pressure cap applies, because this
    message is owed rather than rationed"*. It needs no reciprocal to hold.
19. **The 69 / 21 / 90 scope is untouched by everything above.** No proposal adds, removes or moves
    a journey across the public line. The one scope-adjacent observation — CON-283's exclusion —
    is a rendering fact, not an ownership one.

---

# 7. Cross-cutting observations

**1. Parallel authoring produced exactly the failure mode it should be expected to.** Twenty-three
blind cross-batch pairs, zero cross-batch statements in the data, and **both P0s in this document
are cross-batch**. Nine of the ten X verdicts are in §3; the tenth (N3) is Batch A joining an
existing group without editing it. Inside a batch the discipline held: Batch B is 12 R of 14,
Batch C 13 of 15, Batch D 6 of 9, and every non-R row in those three is a `distinctFrom` asymmetry
with no ownership consequence — not one of them is a double-send. The method works; running three
instances of it blind does not compose.

**2. The class vocabulary is where the corpus leaks.** N1 exists because `PressureClass` has a
`lifecycle` member, CMS-203's purpose vocabulary does not, and CON-300 wrote its scope in a third
vocabulary ("commercial communication") that belongs to neither. Every boundary in this corpus that
is stated in *class* terms rather than in *journey* terms is only as good as the class names
agreeing across the three places they are written. This is the first time they have not.

**3. A journey whose success is that other journeys stop needs a field other journeys read.**
CON-300 is the corpus's first. It writes `marketing_suppression`, and nothing reads it — not one of
the 303 journeys names the field. CON-38 holds the record; CMS-203 evaluates *a* suppression state
against *a* purpose; no journey states that it is subject to one. Compare the `distinctFrom`
problem the last review named: *"the corpus has no field that says these two are alternatives"*.
This is the same gap one layer down — there is no field that says *"this journey stands down for a
suppression somebody else recorded."* F1b invents one out of `eligibility` and `suppressions`,
which is what every other cross-journey gate in this corpus is made of.

**4. `competition: "none"` is still over-used, and it is now load-bearing.** FIN-302 carries it,
and under GLB-01 that is a positive declaration — *"Journeys that carry no competition field are
declaring that they compete with nothing"* — which is exactly the claim N2 shows to be false. The
last review counted 36 of 52 at `"none"`; the seventeen added one more (FIN-302) and converted six
existing journeys away from it (CON-272, CON-283, SCH-266, SCH-277, REM-151, REM-157), plus RET-292.
The direction of travel is right. FIN-302 is the one that went the wrong way.

**5. Reciprocity remains the strongest predictor.** All 41 R verdicts are stated from both sides —
usually two or three times per side, across `precedence`, a `s.contest`-shaped suppression, and a
`distinctFrom` row. All 10 X verdicts are one-sided or silent. Of the 29 1S verdicts, 22 are
`distinctFrom` asymmetries with no ownership consequence and three (§3.9) are a declared product
question; the remaining **four are the ones that matter** — §3.2's CON-300 vs SUB-297, ACQ-289,
RET-293 and RET-294, where the silence is on the side that will actually send.

**6. Two hubs are now unguarded.** RET-31 is named by four of the seventeen and names none; FIN-134
is named by two and names neither. Both are the shape the last review found under its P0s (*"both
are hubs that four other journeys point at; both turned out to sit on an unguarded collision"*).
F6 and F8 close them before they become the next review's findings.
