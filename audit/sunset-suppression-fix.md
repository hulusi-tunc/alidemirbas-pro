# The sunset suppressed nothing — CON-300's write side, and the read side it never had

A P0 from the collision review over the seventeen new journeys. CON-300
Unengaged Subscriber Sunset ended marketing contact for a person and **no
journey in the corpus stood down because of it**, so the person kept receiving
birthday messages, tier announcements, membership welcomes, purchase
anniversaries and product recommendations from a business that believed it had
stopped. This is the account of the defect as confirmed against the data, the
scope decision taken, the mechanism used, the full read-side list with a reason
for every journey in and out, and the before/after evidence.

Everything below is read from `production/canonical-dump.json`. Nothing here is
a summary of intent; where a claim is about the data it is quoted or produced by
`scripts/sunset-suppression-evidence.mjs`, which is checked in beside this file
and re-runnable.

---

## 1. The defect, as confirmed

### 1.1 A write nothing read

```
BEFORE (HEAD c35d479)
  nodes writing marketing_suppression : CON-300.a.suppress          (1)
  journeys reading it                 : NONE                        (0)
  promotional/lifecycle communicating journeys : 29 — reading it: 0
```

`CON-300.a.suppress` carried `writes: [{ field: "marketing_suppression", mode:
"append" }]`. That field appeared in exactly one journey out of 303 — the one
that wrote it. Every claim that the suppression was enforced lived in prose
inside CON-300 itself: the `suppresses` array on `h.enforce`, which is a
statement the *writing* journey makes about what ought to happen, and which no
reading journey is obliged to have heard. `audit/batch-c-notes.md` §6 ("The
sunset's outcome is reachable from its data, not implied in prose") rested on
exactly that array, and was wrong for exactly that reason. §6 is annotated in
place.

### 1.2 The consent record said yes, deliberately

CON-300 `s.notconsent`, unchanged by this fix and correct:

> "Silence is not an opt-out. What this journey reaches is a **sender-side
> suppression recorded against our own sending, never a withdrawal recorded
> against the person's consent**, and it is released by asking for permission
> again rather than by switching sending back on (CON-38)."

`a.suppress.does` says the same: *"The person's own permission record is left
exactly as it was."* That is the right call — writing an opt-out from silence
would put a decision on somebody's record that they never made. It is also
precisely what made the suppression invisible, because the nine journeys the
review named gate on the consent record and nothing else:

| journey | its permission clause, verbatim |
|---|---|
| RET-290, RET-292, RET-295, SUB-296, SUB-297, SUB-299 | "purpose-level permission for **lifecycle** communication is recorded, and hard gates (GLB-31) allow it" |
| ACQ-289, RET-293, RET-294 | "purpose-level permission for **commercial** communication is recorded, and hard gates (GLB-31) allow it" |

Both forms read the consent record. CON-300 takes deliberate care to leave that
record saying yes. So all nine passed.

The review's diagnosis is **confirmed in full**. Nothing in it was wrong. Two
things it left open are settled below: the correct read-side set is larger than
the nine (§4), and `CMS-205.a.reread` is *not* the hook (§3.1).

### 1.3 Two scopes in one journey

| where | what it said |
|---|---|
| `a.suppress.does` | "scoped to **commercial communication** and to nothing else" |
| `h.enforce.carries[1]` | "the suppression scope — **commercial communication only**" |
| `h.enforce.suppresses[0]` | "every **promotional and lifecycle** journey addressed to this person" |

Those are not the same claim, and the two readings differ on exactly the
journeys that caused the P0.

---

## 2. The scope decision: the broad reading

**Taken: marketing contact means every promotional- and lifecycle-class send
addressed to the person. Not promotions alone.**

The reasoning is recorded in the data, as CON-300's new `s.scope`:

> "Marketing contact means every promotional and lifecycle send addressed to
> this person, not promotions alone. The narrow reading — stop the offers, keep
> the birthday, the anniversary, the membership welcome and the tier
> announcement — defeats the journey and is worse than not having it, because
> the business believes it has stopped while the same person keeps hearing from
> us on the same evidence of disinterest. The line is drawn at the send's
> declared purpose class, which is the only thing a gate can read: promotional
> and lifecycle stop, service, transactional, security and mandatory do not."

Three supporting facts, not one argument:

1. **The journey's own purpose.** *"Decide whether continued marketing contact
   is still warranted."* A decision that leaves four relationship-class message
   families running has not decided anything.
2. **The handoff already enumerated both.** `h.enforce.suppresses` said
   "promotional and lifecycle" before this change. The narrow strings were
   `a.suppress.does` and `h.enforce.carries` — the two places that describe the
   record rather than its effect. The broad reading is the one the journey was
   already handing over.
3. **The class line is the only readable one.** GLB-30 and GLB-31 both scope a
   gate's consequences *by declared purpose*, never by journey identity. Drawing
   the line anywhere else would be the ordering-nobody-wrote-down GLB-02
   forbids.

### What the broad reading does NOT touch, verified after the change

Transactional and mandatory communication continues. This was already correct on
both sides and is untouched:

- CON-300 `s.transactional` — *"A sunset ends marketing contact and nothing
  else. What the person holds, owes or is owed stays governed by its own
  rules, and an implementation that stops those messages too has made an
  opt-out out of something nobody chose."*
- CON-300 `a.confirm-end` is `mandatory: true`, and `localCap.appliesTo` is
  `non-mandatory`, so the ending notice is not rationed against the
  discretionary budget.
- SUB-298 Reward Confirmation — `defaultPriority: "transactional"`,
  `pressureClass: "none"`. It is not on the read side, and the evidence script
  asserts that it cannot be.
- GLB-30 — *"a withdrawn marketing consent silences a security alert"* is the
  failure it exists to prevent; unchanged.

The evidence script fails in **both** directions: a promotional or lifecycle
journey that does not read the suppression is a failure, and a transactional,
service, security or mandatory journey that *does* read it is equally a failure.
After the change: 12 transactional, 39 service, 6 security, 1 retention and 1
no-contact-block communicating journey, **0 of them reading it**.

---

## 3. The mechanism, and why this one

Three layers, all of them vocabulary the corpus already had. No new field, no
new node, no new journey, no new competition group.

### 3.1 First: what it is *not*

**Not a competition group.** Quoting `contact.competition` from both sides
before asserting a contest, as the standing rule requires:

> **CON-300** — `exclusionGroup: "contactability-question"`, `scope: "person"`,
> `onLoss: "suppressed"`, precedence *"lowest in the contactability-question
> group — a contact repair is fixing a route that broke and a frequency
> confirmation is answering a cadence the person themselves chose…"*

> **RET-295 Birthday & Milestone** — `exclusionGroup: "date-recognition"`,
> `scope: "person"`. **SUB-299 Loyalty Tier Upgrade** —
> `exclusionGroup: "membership-standing"`. **RET-292** — `date-recognition`.
> **SUB-296/297** — `membership-standing`. **ACQ-289** — `commerce-recovery`.
> **RET-293/294** — `recommendation-offer`.

Different groups, different scopes; they are not contending for one window and
never were. A competition group settles **who speaks now**. The sunset settles
**whether we may speak at all, afterwards** — it is a standing state that
outlives every window any group could share, and `onLoss` has no meaning for it
because nothing is losing. Putting the loyalty journeys into
`contactability-question` would have declared a contest that does not exist, and
GLB-03 says membership is declared rather than invented "to make a suppression
convenient".

**Not `CMS-205.a.reread`.** The review asked whether the generic contest
re-check already gives a hook. It does not, and the reason is written into
CMS-205 itself: `a.reread` is keyed on *"OPS-131's current established owner for
that (exclusion_group, scope_instance_id)"*, and only *"where the message's own
originating journey declares a competition exclusionGroup and scope (GLB-01)"*.
A journey in no group, or in a different group, passes it untouched, and the
sunset is in neither. CMS-205 enforces send-path **step 3**. The sunset belongs
to steps **1** and **6**.

But CMS-205 does supply the *pattern*, stated in its own guardrail:

> "…this is checked here, generically, for every competition-bound message in
> the corpus, **rather than duplicated into each competing journey's own
> graph**."

That is the shape of the fix.

### 3.2 Layer 1 — GLB-31 names the gate (send path step 1)

GLB-31 "Safety gates are global; their consequences are scoped" is the corpus's
existing vocabulary for *a standing condition, evaluated for every candidate,
whose consequences are scoped by purpose*. Its enumerated list did not include a
sender-side suppression — and that omission is the root defect one level below
CON-300. Added to the rule and to the notes:

> rule: "Conditions such as absent permission, **a standing sender-side
> communication suppression**, a closed account, legal ineligibility, …"

> notes: "A standing sender-side marketing suppression — the sunset decision
> CON-300 records and CON-38 holds — suppresses promotional and lifecycle
> communication to that person and leaves service, transactional, security and
> mandatory communication to their own rules; **it is named here because it is
> the one gate a permission check cannot stand in for**, being recorded against
> our own sending while the person's own consent record still reads yes, so a
> journey that gates only on permission passes straight through it."

This matters structurally: **all 29 read-side journeys already carried
"hard gates (GLB-31) allow communication for this purpose" in their
`eligibility`** — verified over the corpus, and the four public journeys that
lack that clause (FBK-43, IDN-271, SUB-163, DOC-215) are none of them. So no
`eligibility` string needed editing anywhere. The clause was already there and
already load-bearing; it was pointing at a rule that had not yet listed this
gate.

### 3.3 Layer 2 — CMS-203 performs it (send path step 6)

`CMS-203.a.evaluate` already read "permission, consent, channel preference,
mandatory-delivery rules **and suppression state**". It now says which
suppression state and what it scopes to, so step 6 is a concrete node that does
the work rather than a stage nobody performs — the same correction CMS-205 made
for step 3:

> "Suppression state includes the sender-side kind, which is why it is read here
> as well as permission: a sunset suppression (CON-300, held by CON-38) is
> recorded against our own sending while the person's consent record still says
> yes, so it closes the promotional and lifecycle purposes and leaves service,
> transactional, security and mandatory ones open — a message whose purpose
> check reads only permission passes straight through it."

plus a guardrail: *"A sender-side suppression is not an absent permission, and a
purpose check that reads only the consent record will not see one."*

### 3.4 Layer 3 — the 29 journeys say it themselves

Layers 1 and 2 make the suppression *enforced*. They do not make it *visible*,
and a boundary you have to follow a rule id to discover is the silent boundary
this repo calls a bug. Each of the 29 therefore gains one `suppressions` entry,
id **`s.sunset`**, `CANONICAL_RULE`, identical text — the same discipline as the
"hard gates (GLB-31)" clause that is repeated verbatim across the corpus:

> "A standing sender-side marketing suppression stops this journey. CON-300 ends
> marketing contact for somebody who answered none of it, and records that
> decision as `marketing_suppression` against our own sending rather than as a
> withdrawal on the person's consent record — so a purpose-level permission
> check still reads yes and cannot see it. The suppression is a hard gate under
> GLB-31, held and released by CON-38, and it covers promotional and lifecycle
> communication alike: no instance of this journey opens against a suppressed
> person, and an open instance stands down rather than queueing behind it. Only
> permission given afresh releases it — not the passing of time, and not a
> purchase."

`suppressions` is the corpus's own field for "when this journey stands down"
(FBK-41 `s.open-issue`, ACQ-11 `s.contest`, RET-290 `s.transactional`), it names
another journey by id exactly as those do, and it is rendered to a reader under
"Suppressed when" in the practitioner view on both locale routes.

Deliberately **not** used: a `distinctFrom` entry on each of the 29. That field
means "these two are confusable"; a gate and its readers are not confusable, and
29 false confusion claims would be worse than none. CON-300 keeps its five
existing `distinctFrom` rows unchanged.

### 3.5 Reciprocity — CON-300 and CON-38 name the read side back

CON-300 gains `s.enforced`:

> "The suppression has to be read by the journeys it binds, or it has ended
> nothing. Every journey in the library whose sends are promotional or lifecycle
> class stands down while it stands — the recoveries, the nurtures, the offers,
> the recognitions and the membership announcements — and each says so from its
> own side. It is carried as a hard gate under GLB-31 and evaluated at the send
> path's purpose stage (CMS-203) rather than declared in this journey's
> contactability-question group, because it is a standing state and not a
> contest: it decides who may be sent to afterwards, where a competition group
> decides only who asks the question now, and it outlives every send window
> either of them could share."

plus two guardrails (the ending covers promotional and lifecycle alike; a
suppression only the sunset knows about has stopped nothing).

CON-38, which holds and releases it, gains `s.g6` and a matching guardrail:

> "A suppression is held here and read out there. The scope recorded at
> `a.record` is what the journeys it binds gate on, so a scope nothing reads is
> not a suppression at all — it is a log line. The sunset scope CON-300 hands
> over covers every promotional and lifecycle send addressed to the person, and
> each of those journeys names that state from its own side; what they hold, owe
> or are owed is outside it and keeps running."

CON-38's `distinctFrom` row for CON-300 is corrected from "scoped to commercial
communication" to the broad scope. Naming by **class on one side and state on
the other** is the corpus's existing reciprocity idiom for a one-to-many
boundary — it is exactly how FBK-46 `s.human-owner` ("automated satisfaction and
retention outreach") and FBK-41 `s.open-issue` ("an unresolved issue in the
context") state their two halves.

### 3.6 The three narrow strings, corrected

| node | after |
|---|---|
| `a.suppress.does` | "…for this person — **every promotional and lifecycle send addressed to them, and nothing beyond that** — with the reason, the window it was read from and the condition that would release it." |
| `h.enforce.carries[1]` | "the suppression scope — **every promotional and lifecycle send addressed to this person**, and nothing they hold, owe or are owed" |
| `h.enforce.suppresses[0]` | unchanged — it was already the broad reading |

`a.suppress` is the one changed node whose prose reaches a canvas card, so its
`src/lib/journey-tr-overrides.ts` entry is updated in the same change, as is
`CMS-203.a.evaluate`'s. No node id was added, removed or renamed anywhere, so no
edge override index moved.

---

## 4. The read side: every journey, in or out

The set was derived from the data, not from the review's list of nine. The rule
is `contact.defaultPriority ∈ {promotional, lifecycle}` **and** the journey has
an action with `execution: "communication"` — the declared purpose class, which
is the only thing a purpose-scoped gate can read.

88 of the 303 canonical journeys have a communication action. 29 of those are
promotional or lifecycle class, and **all 29 are public** — the single
non-public promotional/lifecycle journey in the whole corpus, ACT-11 Onboarding
Route Assignment, is a silent lifecycle state with no communication action at
all. So the 69-journey sweep the brief asked for turns out to be exhaustive over
all 303: there is no archived or excluded journey left marketing to a suppressed
person.

### In — 15 promotional

| id | journey | why in |
|---|---|---|
| ACQ-09 | Lead Nurture | a bounded education sequence we decided to send |
| ACQ-11 | Abandoned Process Recovery | commercial recovery outreach |
| ACQ-12 | Abandoned Selection Recovery | commercial recovery outreach |
| ACQ-13 | Unresolved Interest Recovery | commercial recovery outreach |
| ACQ-285 | New Lead Welcome | the first promotional sequence a capture earns |
| ACQ-287 | Checkout Abandonment Recovery | commercial recovery outreach |
| ACQ-288 | Cart Abandonment Recovery | commercial recovery outreach |
| ACQ-289 | Back-in-Stock Alert | an availability-triggered offer, one of the five the review named |
| ACT-20 | Dormant Lead Reactivation | reactivation outreach on silence — the same silence the sunset read |
| RET-31 | Predicted Need Replenishment | an inferred purchase prompt |
| RET-32 | Lapsed Customer Win-Back | the argument for coming back; CON-300 `s.notwinback` already keeps the two apart |
| RET-293 | Personalized Recommendations | product recommendation, named in the review |
| RET-294 | Cross-Sell / Next Best Offer | an offer, named in the review |
| SCH-282 | Availability Search Abandonment | commercial recovery outreach |
| SUB-297 | Loyalty Program Nurture | membership marketing |

### In — 14 lifecycle

| id | journey | why in |
|---|---|---|
| ACT-12 | Onboarding Nurture | relationship contact we initiate, not a reply to anything asked |
| ACT-13 | Onboarding Blocker Reminder | declared `lifecycle`; **flagged in §7** |
| ACT-14 | Onboarding Help | declared `lifecycle`; **flagged in §7** |
| ACT-17 | Adoption Nurture | relationship contact we initiate |
| ACT-18 | Adoption Recovery | outreach on an absence we inferred |
| ACT-19 | Onboarding Personalization | an unprompted ask for context |
| RET-30 | Retention Offer Follow-Up | follow-up on an offer the business made |
| RET-290 | First Purchase Thank You & Bounceback | relationship message with a bounceback attached; named in the review |
| RET-292 | First Purchase Anniversary | date recognition; named in the review |
| RET-295 | Birthday & Milestone | date recognition; named in the review |
| FBK-41 | Feedback Request | an optional outbound ask |
| FBK-42 | Advocacy Request | an optional outbound ask |
| SUB-296 | Loyalty Program Welcome | membership announcement; named in the review |
| SUB-299 | Loyalty Tier Upgrade | membership announcement; named in the review |

### Out — with the reason

| id / group | class | why out |
|---|---|---|
| **RET-28** Cancellation Save | `retention` / lifecycle pressure | Not a marketing send. It is triggered by `explicit_cancellation_intent` — the person declared a decision about something they hold, and this is the reply. CON-300 `s.transactional` protects exactly that, and RET-28's own `s.path` says the cancellation is never delayed by any contest. Suppressing a reply to a declared intent would make the sunset an obstacle in a path the person opened. |
| **RET-24** Churn Risk Escalation | `retention` / none | `channels: ["task"]`; its only `execution` is `human`. It never addresses the person — it routes work internally. A sunset scopes sends to a person, not internal work. |
| **12 transactional** — FIN-134, FIN-302, FUL-301, REM-305, SUB-298, DOC-214, DOC-215 and the rest | `transactional` | What the person holds, owes or is owed. CON-300 `s.transactional`, GLB-30 and GLB-31 all protect these explicitly, and SUB-298 Reward Confirmation is `pressureClass: "none"` on top. |
| **39 service** — TIM-61, TIM-268, ACC-261, ACC-263, FBK-49, RLT-279, SCH-266, SUB-163, FUL-146, INC-254, … | `service` | Messages about a thing the person is in the middle of or is owed an answer on. The corpus already classes "remind them of a thing they must do" as service (ACC-263 Activation Reminder, RLT-279 Upgrade Blocker Reminder, TIM-268 Action Required Reminder), which is the line the sunset respects. CON-300 itself is `service` class. |
| **6 security** — IDN-84, IDN-271, … | `security` | GLB-30's named failure is a withdrawn marketing consent silencing a security alert. |
| **CMS-208** Message Delivery Recovery | no `contact` block | A delivery mechanism, not an addressed campaign; it recovers a message another journey already had the right to send. |

---

## 5. Before / after

`node scripts/sunset-suppression-evidence.mjs` — reads the dump only, exits 1 on
a failure in either direction.

**Before** (against `git show HEAD:production/canonical-dump.json`):

```
writers : CON-300.a.suppress
readers : NONE
promotional/lifecycle communicating journeys: 29 — reading it: 0
```

**After**:

```
corpus: 303 journeys · 88 with a communication action

WRITE SIDE - nodes writing "marketing_suppression": 1
  CON-300  a.suppress  (append)

READ SIDE - journeys naming that state in their own data: 29

SUPPRESSED CLASSES (promotional, lifecycle) - must read: 29
  reads  ACT-12 ACT-13 ACT-14 ACT-17 ACT-18 ACT-19 FBK-41 FBK-42
         RET-290 RET-292 RET-295 RET-30 SUB-296 SUB-299            (lifecycle)
  reads  ACQ-09 ACQ-11 ACQ-12 ACQ-13 ACQ-285 ACQ-287 ACQ-288 ACQ-289
         ACT-20 RET-293 RET-294 RET-31 RET-32 SCH-282 SUB-297      (promotional)

EVERY OTHER CLASS - must NOT read: 59
  (no contact block)       1  0 reading (must be 0)
  retention                1  0 reading (must be 0)
  security                 6  0 reading (must be 0)
  service                 39  0 reading (must be 0)
  transactional           12  0 reading (must be 0)

PASS - 1 writer, 29/29 suppressed-class journeys read it, 0 of 59 others do.
```

The scenario the review described, replayed: a person with a standing
`marketing_suppression` now has the birthday message (RET-295), the tier
announcement (SUB-299), the membership welcome (SUB-296), the purchase
anniversary (RET-292) and the product recommendation (RET-293) all stood down —
each by its own `s.sunset`, each evaluated at send-path step 1 as a GLB-31 hard
gate and step 6 at `CMS-203.a.evaluate` — while their order confirmation
(FUL-301), refund notification (FIN-302), reward confirmation (SUB-298),
delivery alerts (FUL-146/148/265), renewal reminder (SUB-163) and security
alerts (IDN-271) are untouched.

---

## 6. Gates

Run in `audit/checkpoint.md`'s order, on port 4541.

| gate | result |
|---|---|
| `npm run validate:canonical` | PASS — **303 journeys · 3959 nodes** · 0 errors · 2475 warnings (**0 unreviewed** on vNext journeys) — identical to the pre-change baseline |
| `node audit/guard-display.mjs 4541` (before manifest) | G4 named **exactly 30** journeys — the 29 read side + CON-300 — and nothing else; G1/G2/G3/G5/G6 0 findings |
| `node audit/build-manifest.mjs` | 69 journeys (expected 69), issues: none |
| `node audit/guard-display.mjs 4541` (after) | PASS — G4 no drift |
| `node scripts/validate-public-scope.mjs` | PASS — **public 69 · excluded 21 · source 90** · 15 checks · 0 failures · 3 warnings (the pre-existing three) |
| `node audit/canvas-hygiene.mjs 4541` | PASS — 1699 cards, H1/H2/H3/H4 all 0 |
| `node audit/measure-display.mjs after 4541` | 0 render errors · **0 locale leaks** |
| `node audit/locale-sweep.mjs 4541` | 172/172 TR routes · **0 leaks** |
| `npm run validate:journey-production` | PASS — 30/30, frozen baseline 303/3959 unchanged |
| `npm run validate:seo` | PASS — 0 errors |
| `npx tsc --noEmit` | clean |
| `node seo/seo-validator.mjs` | 19/20 — check 14 only (the known 43-vs-19 calculator drift) |
| `node search/search-validator.mjs` | 32/34 — checks 30 and 31 only (the known calculator-document drift) |

Node count unchanged at 3959, so `production/validate-journey-production.mjs`'s
frozen baseline needed no bump. **No node was added.** The whole fix is
`suppressions`, `guardrails`, one `distinctFrom` row, three node prose strings
and one global rule.

G4's baseline covers the 69 library journeys only, so the CMS-203 and CON-38
edits are outside it by construction — they are covered by
`validate:canonical`, by `validate:journey-production` check 30 and by the
regenerated dump's diff.

---

## 7. What I would second-guess

Listed because they are judgement calls, not findings.

1. **ACT-13 Onboarding Blocker Reminder and ACT-14 Onboarding Help are
   suppressed, and they may not deserve to be.** Both are declared
   `defaultPriority: "lifecycle"`, so the class rule catches them. But the
   corpus classes three structurally identical journeys as `service` —
   ACC-263 Activation Reminder, RLT-279 Upgrade Blocker Reminder, TIM-268 Action
   Required Reminder — and ACT-14 fires on *live* help-seeking behaviour, which
   is about as close to "answering something the person raised" as a lifecycle
   journey gets. If they are misclassified, the fix is to change their declared
   class, which is a separate reviewable edit with its own reciprocity; I did
   **not** carve a per-journey exception here, because an exception that lives
   only in a suppression's prose is the ordering nobody wrote down that GLB-02
   forbids.
2. **Suppression is prose, and prose cannot be type-checked.** The read side is
   detectable three ways (the `s.sunset` id, the literal `marketing_suppression`
   token, the `CON-300` reference) and asserted by
   `scripts/sunset-suppression-evidence.mjs`, but that script is not wired into
   any npm gate. Adding it to `validate:canonical` as a hard check would make a
   30th promotional journey fail the build instead of silently shipping —
   worth doing, and deliberately not done in this change, which was scoped to
   the defect.
3. **A purchase does not release the suppression.** Follows from CON-300's own
   release condition ("permission given afresh, never the passing of time") and
   from its `distinctFrom` RET-26 row (engagement with the product and
   engagement with our messages are routinely opposite). It means a suppressed
   person who buys gets their order confirmation, refund notification and
   delivery alerts, and gets no thank-you, no bounceback and no anniversary.
   I believe that is right; it is also the most surprising consequence of the
   broad reading, so it is stated here rather than left to be discovered.
4. **`marketing_suppression` keeps its name** although its scope is now
   explicitly broader than promotions. Renaming it would have churned the only
   writer, the three prose sites and the `h.enforce` contract for no semantic
   gain — CON-300's own vocabulary calls the whole thing "marketing contact".
5. **The 29 share one verbatim sentence.** That is deliberate — it is the same
   rule, and the corpus already repeats "hard gates (GLB-31) allow communication
   for this purpose" verbatim across scores of journeys — but it does add ~29
   near-identical paragraphs to the Info tab, and somebody may prefer it stated
   once in GLB-31 and referenced. I judged a rule id alone too quiet for a
   boundary that had already gone silent once.

---

## 8. Files changed

| file | what |
|---|---|
| `src/canonical/global.ts` | GLB-31 rule + notes — the gate is named |
| `src/canonical/communication.ts` | CMS-203 `a.evaluate` + one guardrail — step 6 performs it |
| `src/canonical/consent.ts` | CON-300 `a.suppress.does`, `h.enforce.carries`, `s.scope`, `s.enforced`, 2 guardrails · CON-38 `s.g6`, 1 guardrail, `distinctFrom`(CON-300) |
| `src/canonical/acquisition.ts` | `s.sunset` × 8 |
| `src/canonical/activation.ts` | `s.sunset` × 7 |
| `src/canonical/retention.ts` | `s.sunset` × 8 |
| `src/canonical/feedback.ts` | `s.sunset` × 2 |
| `src/canonical/subscription.ts` | `s.sunset` × 3 |
| `src/canonical/scheduling.ts` | `s.sunset` × 1 |
| `src/lib/journey-tr-overrides.ts` | `CON-300.a.suppress`, `CMS-203.a.evaluate` |
| `scripts/sunset-suppression-evidence.mjs` | new — the write/read proof, re-runnable |
| `audit/batch-c-notes.md` | §6's over-claim annotated in place |
| generated | `production/canonical-dump.json`, `production/journey-view-model.json`, `production/journey-content-stats.json`, `production/public-scope-report.json`, `search/search-index*.json`, `search/search-manifest.json`, `audit/canonical-baseline.json`, `audit/manifest.json`, the report JSONs |
