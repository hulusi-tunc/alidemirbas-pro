# Phase 1 audit — cross-journey ownership

Reviewer scope: all 69 public library journeys, no domain slice. Written against
`audit/public-journeys-current-state.json` (queried, never read whole), with
`audit/new-journey-collision-review.md` §5 and `audit/collision-fixes.md` read first so that
closed items are not re-reported.

**Method.** Every verdict below quotes `contact.competition` from **both** sides verbatim, or
the literal `"none"` where the journey declares no contest, before saying anything about
removal, suppression or a missing message. Where a boundary is carried by a field other than
`contact.competition` — a `suppressions` rule, a `handoff.suppresses`, a `distinctFrom` row —
that field is named, because in this corpus those are where most real boundaries actually live.
Entity and scope are stated for both sides: journeys only contest the **same scope instance**,
and a membership, an order, a booking and a payment obligation are different entities.

**The RET-24 rule, restated because it decided two prior reviews wrongly.** RET-24 Churn Risk
Escalation is the only public journey with **no customer-facing channel at all**
(`customerFacingChannelsActuallyUsed: []`). It competes for *ownership of the account*, not for
a send. Every "RET-24 collides with X" claim has to establish a message collision first, and
there is none to establish. Its own competition block already orders it under RET-28 and over
RET-30, and its `h.cancellation` handoff carries
`suppresses: ["any separate retention track for this relationship while the cancellation decision is live"]`.
Nothing here proposes changing it.

**Scope statement.** Nothing below proposes adding or removing a journey. The 69 / 21 / 90
partition is untouched. Two findings note a group-membership question (SCH-280, ACT-17); both
are proposals to *state* a boundary, not to move a journey across the public scope line.

---

# 1. The assigned pair sets

61 ordered pairs across 13 sets. Counts per set given at the head of each.

---

## 1.1 Abandoned Selection · Abandoned Process · Cart · Checkout — 6 pairs

All four are `exclusionGroup: "commerce-recovery"`, `scope: "person"`, `onLoss: "suppressed"`,
`priority: promotional`.

| journey | entity | instanceKey |
|---|---|---|
| ACQ-287 Checkout Abandonment | one checkout instance — a basket, its items and its resume destination | `person_id + checkout_id` |
| ACQ-11 Abandoned Process | the logical process — basket-and-checkout, application, quote, registration | `person_id + logical_process_id` |
| ACQ-288 Cart Abandonment | one cart instance — its items, availability and price | `person_id + cart_id` |
| ACQ-12 Abandoned Selection | the recorded selection — a cart, basket or saved list with no process state | `person_id + selection_id` |

**ACQ-287:** *"highest in the group - the concrete checkout implementation owns a checkout in
motion, and outranks the generic process-recovery pattern (ACQ-11) it specialises as well as
every held cart, held selection, inferred interest and predicted need for the same person; when
it holds the instance, the journey it outranks is suppressed for that instance rather than
queued behind it"*

**ACQ-11:** *"below Checkout Abandonment Recovery (ACQ-287), the concrete checkout
implementation this generic pattern is specialised by - where the process is a checkout and that
journey holds the instance, this one is suppressed for it; above every held selection, inferred
interest and predicted need for the same person, because a process in motion outranks all of
them"*

**ACQ-288:** *"below checkout recovery and the generic process-recovery pattern - a checkout in
motion outranks a held cart - and above the generic held-selection pattern (ACQ-12) it
specialises, which is suppressed for the same selection while this journey holds it; above
inferred interest and predicted-need replenishment for the same person"*

**ACQ-12:** *"below process recovery - a process in motion outranks a held selection - and below
Cart Abandonment Recovery (ACQ-288), the concrete cart implementation this generic pattern is
specialised by, which holds the instance whenever the selection is a cart; above interest
recovery and predicted-need replenishment for the same person"*

**Verdicts**

- **ACQ-287 ↔ ACQ-11 — already resolved.** Stated four times over: both precedences, ACQ-11's
  `s.specialised`, ACQ-287's `s.generic`, and reciprocal `distinctFrom`. The settled
  "checkout-specific > generic process recovery" decision holds.
- **ACQ-288 ↔ ACQ-12 — already resolved.** Same four-fold statement (`s.generic` / `s.specialised`
  / both precedences / reciprocal `distinctFrom`). "Cart-specific > generic selection recovery"
  holds.
- **ACQ-288 ↔ ACQ-287 — already resolved.** Reciprocal `distinctFrom`, plus a one-way handoff
  `ACQ-288 h.checkout → ACQ-287` carrying
  `suppresses: ["every queued cart reminder for this cart"]`. Correctly one-way: a checkout never
  hands back to a cart.
- **ACQ-287 ↔ ACQ-12, ACQ-288 ↔ ACQ-11 — already resolved** by the transitive ordering, each side
  stating its own rank.
- **ACQ-11 ↔ ACQ-12 — resolved but one-sided.** Both precedences agree and ACQ-12 carries
  `h.process → ACQ-11` with `suppresses: ["every queued recovery touch for this selection"]`.
  **Silent side: ACQ-11**, which has `distinctFrom` rows for ACQ-08, SCH-282 and ACQ-287 but none
  for ACQ-12. Documentation only; the sentence it needs is in §3, D-14.

**Instance vs person.** Note that all four precedence texts say *"holds the instance"* /
*"for that instance"* while the declared `scope` is `person`. Here that is harmless, because the
four entities are nested (a selection becomes a cart becomes a checkout becomes a process) and
the group's own rationale is person-level contact pressure. It is **not** harmless in
`post-purchase-welcome` — see §1.10.

---

## 1.2 New Lead Welcome · Lead Nurture · Unresolved Interest Recovery — 3 pairs

| journey | `contact.competition` | entity | instanceKey |
|---|---|---|---|
| ACQ-285 New Lead Welcome | `"none"` | the individual capture and what it asked for, resolved onto a person | `capture_id` |
| ACQ-09 Lead Nurture | `"none"` | lead or person, held against the reason they entered | `lead_id` |
| ACQ-13 Unresolved Interest Recovery | `commerce-recovery` / `person` / *"below every other member of the group…"* / `suppressed` | an inferred interest — repeated, recent, attributed attention | `person_id + interest_key` |

- **ACQ-285 ↔ ACQ-09 — already resolved, and a model for how to do it without a group.** Neither
  declares a competition block, and neither needs one: the boundary is a hard sequencing rule
  carried where it is enforceable. ACQ-09 `s.first-touch`: *"While New Lead Welcome (ACQ-285) is
  open on the capture this lead came from, that journey owns the initial contact and this one
  does not start. When its window closes, this one starts only if its own entry conditions are
  still true."* ACQ-285 states the same thing back in `distinctFrom → ACQ-09`: *"ACQ-09 is the
  same bounded education on the same declared subject, and one form fill satisfies both
  triggers. This journey owns the initial contact window the capture earned; ACQ-09 is
  ineligible while that window is open and may start only once it has closed."* The winner does
  not need a suppression; it needs a statement, and it has one. The settled "New Lead Welcome
  owns initial lead contact before Lead Nurture" decision holds.
- **ACQ-285 ↔ ACQ-13 — not a collision.** Different entities (`capture_id`, a declared
  first-party capture, vs `person_id + interest_key`, inferred attention) and mutually exclusive
  evidence: ACQ-13's `insufficientAlone` excludes *"attention inside a session that ended in a
  selection or a process"*, and a capture is a declaration, not attention. No boundary is owed.
- **ACQ-09 ↔ ACQ-13 — not a collision, with one residue.** Different entities and different
  subjects (the reason a lead arrived vs an unresolved item interest). The residue is contact
  pressure, not ownership: both are `promotional` to the same person and neither is in the
  other's group, so nothing but the global pressure cap prevents a bounded-education touch and
  an interest-recovery touch landing in the same window. That is what the cap is for; no
  journey-level boundary is owed. Recorded so a later reviewer does not re-open it.

---

## 1.3 Onboarding Nurture · Help · Blocker · Personalization — 6 pairs

| journey | `contact.competition` | priority | instanceKey |
|---|---|---|---|
| ACT-12 Onboarding Nurture | `lifecycle-stage` / `person` / *"below the authoritative activation event, which supersedes it wherever it sits"* / `superseded` | lifecycle | `account_id + onboarding_instance_id` |
| ACT-13 Onboarding Blocker Reminder | `"none"` | service | `account_id + requirement_id` |
| ACT-14 Onboarding Help | `"none"` | service | `account_id + person_id` |
| ACT-19 Onboarding Personalization | `"none"` | lifecycle | `account_id + person_id` |

- **ACT-12 ↔ ACT-19 — already resolved, and the best-stated non-group boundary in the corpus.**
  ACT-12 `s.personalizing` names ACT-19's own node ids (*"an outstanding ACT-19 personalization
  question (asked at a.ask, not yet answered) … Nurture steps pause until w.answer resolves
  (question_answered) or times out"*) and explains why the two are indistinguishable from the
  account's side. ACT-19 states it back in `distinctFrom → ACT-12` and carries
  `h.progress → ACT-12`. Both sides, in an enforceable field, with the mechanism named.
- **ACT-12 ↔ ACT-13 — resolved but one-sided.** ACT-12 carries `s.blocker` (*"When one named
  mandatory prerequisite is established as the thing preventing activation, the blocker journey
  (ACT-13) owns the account; nurture steps stop."*) and `h.blocker → ACT-13` with
  `suppresses: ["the generic next-step prompt for this prerequisite while the blocker journey owns it"]`.
  **Silent side: ACT-13**, whose only `distinctFrom` row is ACT-14 and whose three suppressions
  (`s.g1`–`s.g3`) never mention ACT-12. The winner of an ownership transfer states nothing about
  the transfer. Sentence in §3, D-9.
- **ACT-12 ↔ ACT-14 — resolved but one-sided.** ACT-12 `s.assisted` is as precise as
  `s.personalizing` (*"An open ACT-14 assisted-help session (booked at a.confirm, not yet
  resolved) … nurture steps pause until ACT-14's w.session resolves"*). **Silent side: ACT-14**,
  which names only ACT-13. Sentence in §3, D-10.
- **ACT-13 ↔ ACT-14 — real unstated collision.** Both `service`, both message the same account
  about the same failure to activate, both `competition: "none"`, and their evidence blocks do
  **not** exclude each other: ACT-13's `insufficientAlone` rules out *"a general sense that setup
  is unfinished"*, and ACT-14's rules out *"heavy usage that is making real progress"* — a person
  blocked on a named requirement who is repeatedly visiting the help centre satisfies both
  triggers simultaneously. ACT-14's `s.g2` defers to *"an open support case for the same issue"*,
  which is a support case, not ACT-13. The two `distinctFrom` rows describe the difference
  (*"Here the obstacle has a name…"* / *"ACT-13 has a named requirement to clear…"*) and say
  nothing about who wins when both are true. The corpus's own standard condemns this: ACT-12
  holds its prompts for **both** of them precisely because two setup messages in one moment is
  one too many. Boundary and field in §3, **P1-3**.
- **ACT-14 ↔ ACT-19 — real unstated collision, and the sharpest one in this set.** They share the
  **identical instance key** `account_id + person_id`. Both message the same person about the
  same onboarding, both declare `competition: "none"`, and neither names the other in any field.
  ACT-12 already documents that an outstanding ACT-19 question and an open ACT-14 session are
  *"indistinguishable from the account's side"* — that is a statement about ACT-14 and ACT-19
  being the same shape, made by a third journey, and neither of them repeats it. §3, **P1-2**.
- **ACT-13 ↔ ACT-19 — not a collision.** Different entities (`requirement_id` vs `person_id`) and
  different moments: ACT-19 runs before the route is chosen, ACT-13 only once a named mandatory
  prerequisite is blocking a route already in motion. ACT-19's evidence excludes anything
  readable from the account itself; a blocking requirement is readable. No boundary owed.

---

## 1.4 Adoption Nurture · Adoption Recovery — 1 pair

| journey | `contact.competition` | instanceKey |
|---|---|---|
| ACT-17 Adoption Nurture | `"none"` | `account_id + use_case_id` |
| ACT-18 Adoption Recovery | `retention-outreach` / `account` / *"lowest in the group - an open issue under human ownership, a live risk case or a declared cancellation intent all outrank a recovery nudge"* / `suppressed` | `account_id + use_case_id` |

**Already resolved — by handoff, which is the right mechanism here.** They share an instance key
and are mutually exclusive by state: ACT-17 `s.stable` closes on repeated value, `s.stall` hands
over (*"When the observation window closes without repeated value the instance hands to adoption
recovery; a nurture nudge is never sent into a stall."*), and ACT-18 hands back at
`h.adoption → ACT-17`. Two reciprocal handoffs on one instance key move ownership; a competition
group would add nothing. Neither carries a `distinctFrom` row for the other — a P3 documentation
gap only (§3, D-13).

**One real observation on ACT-17's side.** ACT-17 declares **no** exclusion group, yet its
`s.contest` recites the `retention-outreach` precedence verbatim: *"An open complaint under human
ownership, a live risk case or a declared cancellation intent on the same account outranks
lifecycle nurture."* Under GLB-01 membership is declared, not inferred, so ACT-17 is claiming a
contest nothing enforces. §3, **P2-4**.

---

## 1.5 Churn Risk · Cancellation Save · Retention Follow-Up · Win-Back · Sunset — 10 pairs

All of the first four are `exclusionGroup: "retention-outreach"`, `scope: "account"`,
`onLoss: "suppressed"`. CON-300 is in a different group entirely.

**RET-28 Cancellation Save** (`person_id + relationship_id + intent_id`): *"above risk-driven
escalation and offer follow-up on the same account - a declared intent to leave outranks an
inferred risk. Only the offer step ever yields; the cancellation path itself is never obstructed
by any contest"*

**RET-24 Churn Risk Escalation** (`account_id + risk_episode_id`, **no customer channel**):
*"below an open issue under human ownership and below a declared cancellation intent on the same
account, above generic retention intervention"*

**RET-30 Retention Offer Follow-Up** (`account_id + retention_episode_id`): *"lowest in the group
- any live risk case or open issue on the same account outranks it"*

**RET-32 Lapsed Customer Win-Back** (`person_id + relationship_id`): *"lowest in the group - any
live retention, complaint, risk or payment journey on the account means the relationship is not
lapsed and this journey does not run"*

**ACT-18 Adoption Recovery** (`account_id + use_case_id`): *"lowest in the group - an open issue
under human ownership, a live risk case or a declared cancellation intent all outrank a recovery
nudge"*

**CON-300 Unengaged Subscriber Sunset** (`person_id + unengaged_window`,
`exclusionGroup: "contactability-question"`, `scope: "person"`): *"lowest in the
contactability-question group - a contact repair is fixing a route that broke and a frequency
confirmation is answering a cadence the person themselves chose, and both are already answering
the question this journey would otherwise ask over the top of; when either currently holds the
person this journey is suppressed for them rather than queued behind it"*

**Verdicts**

- **RET-28 ↔ RET-24 — already resolved.** Reciprocal precedence, plus `RET-24 h.cancellation →
  RET-28` carrying `suppresses: ["any separate retention track for this relationship while the
  cancellation decision is live"]`. RET-28's `s.path` additionally guarantees the cancellation
  path itself is never obstructed, which is the right shape for a top-of-group journey.
- **RET-24 ↔ RET-30 — already resolved.** Reciprocal precedence, plus `RET-24 h.intervention →
  RET-30` which mints `retention_episode_id` deterministically from `account_id + risk_episode_id`
  — an unusually careful piece of instance-key plumbing, and the reason the two never contest the
  same episode.
- **RET-28 ↔ RET-30 — already resolved.** RET-28 is declared top, RET-30 declared bottom, and
  `RET-28 h.intervention → RET-30` carries the cancellation episode so a decline is remembered
  inside it.
- **RET-32 ↔ RET-28 — already resolved.** RET-32 `s.recent` (*"A cancellation still inside its own
  save window or the cooldown after it is Cancellation Save's territory (RET-28); nothing is sent
  here"*), a `distinctFrom → RET-28` row, and its entity note make the timing boundary explicit.
  RET-28 does not name RET-32 back, but it is the declared top of the group and does not need to —
  P3 only (§3, D-11).
- **RET-32 ↔ RET-24, RET-32 ↔ RET-30 — already resolved** by RET-32's blanket "any live
  retention, complaint, risk or payment journey" plus `s.open`. RET-32 is the genuine bottom.
- **RET-30 ↔ ACT-18 — real unstated collision, and a live GLB-02 deadlock.** Three members claim
  *"lowest in the group"*. RET-32's text happens to resolve its own position by enumerating what
  outranks it. RET-30 and ACT-18 do not: RET-30 yields to *"any live risk case or open issue"*,
  and ACT-18 is neither; ACT-18 yields to *"an open issue under human ownership, a live risk case
  or a declared cancellation intent"*, and RET-30 is none of those. Both are `onLoss: "suppressed"`.
  Both are account-scoped in the same person's account. A delivered retention intervention and a
  stalled use-case are routinely true together — that is what a struggling account looks like —
  and on that contest each defers to the other and neither sends. This is exactly the two-bottoms
  deadlock `audit/collision-fixes.md` Fix 2 repaired inside `commerce-recovery`; it was never
  checked for in `retention-outreach`. §3, **P0-2**.
- **CON-300 ↔ RET-32 — already resolved, three times from each side.** CON-300 `s.notwinback`
  (*"a message that argues for staying is the lapsed-customer win-back (RET-32) wearing this
  journey's name"*), CON-300 `distinctFrom → RET-32`, RET-32 `distinctFrom → CON-300`, and RET-32
  `s.sunset`. The settled "CON-300 Sunset ≠ Win-Back" decision holds, and the reason is written
  from both sides rather than asserted from one. CON-300's `s.enforced` additionally explains why
  the sunset is *not* modelled as a competition group — *"it is a standing state and not a
  contest: it decides who may be sent to afterwards, where a competition group decides only who
  asks the question now"* — which is the correct GLB-03 reasoning and should not be disturbed.
- **CON-300 ↔ RET-24 / RET-28 / RET-30 / ACT-18 — not a collision.** Different scope instance
  (a person's marketing contactability vs an account's retention state) and, decisively, a class
  boundary CON-300 states itself in `s.scope`: *"promotional and lifecycle stop, service,
  transactional, security and mandatory do not."* RET-24 sends nothing at all, RET-28 is
  `retention` on a declared intent, RET-30 and ACT-18 are `lifecycle` and **do** read the sunset
  (verified: both carry `s.sunset`). The one direction that matters is enforced.
- **F1/F2 of the previous review are CLOSED.** All nine journeys named there (RET-290, RET-292,
  RET-295, SUB-296, SUB-299, SUB-297, ACQ-289, RET-293, RET-294) now read the sender-side
  suppression; verified by querying their `eligibility` + `suppressions` for CON-38 / sunset.
  Not re-reported.

---

## 1.6 Replenishment · Personalized Recommendations · Cross-Sell — 3 pairs

| journey | `contact.competition` | entity | instanceKey |
|---|---|---|---|
| RET-31 Predicted Need Replenishment | `commerce-recovery` / `person` / *"below process recovery and selection recovery for the same person; above interest recovery"* / `suppressed` | the predicted need — one consumable or recurring-use item | `person_id + need_key` |
| RET-293 Personalized Recommendations | `recommendation-offer` / `person` / *"below the complementary next offer for the same person - a next step that follows from something they already own is a stronger claim on the moment than a set that merely resembles what they liked; while that journey holds the person, this one is suppressed for them"* / `suppressed` | one recommendation opportunity | `person_id + opportunity_id` |
| RET-294 Cross-Sell / Next Best Offer | `recommendation-offer` / `person` / *"above the generic recommendation for the same person … while this journey holds the person, that one is suppressed for them rather than queued behind it"* / `suppressed` | one complementary opportunity | `person_id + owned_subject_id` |

- **RET-293 ↔ RET-294 — already resolved, exemplary.** Reciprocal precedence, reciprocal
  `s.contest` on both sides, reciprocal `distinctFrom`. Two members, one ordering, stated six
  times. Nothing to do.
- **RET-31 ↔ RET-293 and RET-31 ↔ RET-294 — real unstated collision, across groups.** All three
  are `promotional`, all three are `scope: person`, all three propose a purchase to the same
  person — and RET-31 is in `commerce-recovery` while the other two are in `recommendation-offer`.
  Neither group's precedence mentions the other group. RET-31's precedence text orders it only
  against process recovery, selection recovery and interest recovery; `recommendation-offer`
  appears nowhere in it, and `commerce-recovery` appears nowhere in RET-293's or RET-294's. The
  documentation is one-sided in the same direction each time: **RET-293 and RET-294 each carry a
  `distinctFrom → RET-31` row and RET-31 names neither.** Those rows explain that the journeys
  are different (*"RET-31 predicts that a specific thing is running out and prompts the same
  purchase again"*) and say nothing about who wins.
  The group boundary is not a defence here. `recommendation-offer` exists precisely because two
  next-purchase proposals to one person in one moment is noise; a replenishment prompt is a
  next-purchase proposal, and it sits outside the group that was created to stop exactly that.
  §3, **P1-1**.

**RET-31 is the corpus's worst hub.** It is named by **ACQ-289, RET-290, RET-293 and RET-294** and
names **none of them** — the finding carried forward from F8, re-verified against current data and
still exactly as described.

---

## 1.7 Feedback Request · Feedback Follow-Up · Advocacy Request — 3 pairs

| journey | `contact.competition` | entity | instanceKey |
|---|---|---|---|
| FBK-41 Feedback Request | `outbound-ask` / `communication-purpose` / see below / `suppressed` | person or account plus the specific experience being asked about | `person_id + experience_ref` |
| FBK-42 Advocacy Request | `outbound-ask` / `communication-purpose` / see below / `suppressed` | person or account plus the relationship context | `account_id + relationship_id` |
| FBK-43 Feedback Follow-Up | `"none"` | the feedback record, linked to the person and the experience | `feedback_id` |

**FBK-41:** *"FBK-42 (advocacy) wins when both are eligible for the same person at the same
moment: advocacy already presupposes satisfaction, its evidence is accumulated across the
relationship rather than one experience, and asking both back-to-back for the same goodwill
moment reads as farming it twice. This journey's ask is recorded as not-now and remains free to
re-open independently at its next moment."*

**FBK-42:** *"This journey wins when both this journey and FBK-41 (satisfaction) are eligible for
the same person at the same moment: advocacy is the rarer, higher-value ask built on accumulated
relationship evidence rather than one experience, so it takes the one ask slot. FBK-41 is
recorded as not-now and remains free to re-open independently at its next moment."*

- **FBK-41 ↔ FBK-42 — already resolved.** The two texts are the same decision written from each
  side, including the loser's cost (*"recorded as not-now and remains free to re-open"*). The
  `communication-purpose` scope is unusual and is the right choice: the contest is over one ask
  slot, not over an entity. FBK-41's `s.frequency` carries the same rule into an enforceable
  field. Nothing to do.
- **FBK-41 ↔ FBK-43 and FBK-42 ↔ FBK-43 — not a collision, resolved but one-sided in
  documentation.** Different entities (`experience_ref` / `relationship_id` vs `feedback_id`) and
  strictly sequential: FBK-43 opens only once feedback has actually arrived. `FBK-43 h.advocacy →
  FBK-42` moves ownership, and FBK-43's `h.issue` carries
  `suppresses: ["any automated satisfaction or retention outreach about the same experience while the issue is open"]`,
  which FBK-41 mirrors in `s.open-issue`. **FBK-43 carries no `distinctFrom` rows at all** while
  being named by four journeys (FBK-41, FBK-42, REM-151, REM-305). Documentation only; §3, D-12.

---

## 1.8 Deadline Tracking · Action Required · Expiry Reminder · Grace Period · Expired Access — 10 pairs

| journey | `contact.competition` | entity | instanceKey |
|---|---|---|---|
| TIM-61 Deadline Tracking | `obligation-reminder` / `communication-purpose` / *"above the generic obligation reminder (TIM-268) - a governing deadline outranks a bare due date, because this journey holds the obligation's own state and its policy-defined thresholds, and that one only sends. Where a deadline has been assigned, this journey holds the obligation and the generic reminder is suppressed for it."* / `suppressed` | the obligation the deadline is attached to | `obligation_id` |
| TIM-268 Action Required | `obligation-reminder` / `communication-purpose` / *"lowest in the group - this is the generic fallback, and it ranks below every journey scoped to the obligation's own type, Deadline Tracking (TIM-61) among them. Where any of them holds the obligation this journey is suppressed for it rather than queued behind it, because a reminder that arrives after the specific one is not a later touch but a second sender."* / `suppressed` | the outstanding obligation, its owner and its due date | `obligation_id` |
| TIM-63 Expiry Reminder | `relationship-continuity` / `subscription` / *"below the renewal decision (SUB-163) wherever the expiring entity is a relationship with a renewal cycle … where no renewal cycle exists there is no contest and this journey owns the expiry outright."* / `suppressed` | the time-bound entity approaching expiry | `entity_ref + validity_id` |
| TIM-274 Grace Period Recovery | `access-consequence-narration` / `account` / *"below the restriction notice (ACC-261) … above payment failure recovery (FIN-134), whose messaging ends where the grace state begins"* / `superseded` | the entity whose primary validity ended, plus the fixed end of the grace period | `entity_ref + grace_period_id` |
| TIM-281 Expired Access Recovery | `"none"` | the expired entity and the holder's attempt to act on it | `entity_ref + attempt_id` |

- **TIM-61 ↔ TIM-268 — already resolved, five-fold.** Both precedences, TIM-61 `s.g5`, TIM-268
  `s.g7`, and reciprocal `distinctFrom`. The settled "specific deadline/expiry > generic Action
  Required" decision holds for this pair.
- **TIM-63 ↔ SUB-163 — already resolved.** TIM-63's precedence, its `s.renewal-cycle` (*"the
  required notice and a pre-expiry reminder about one subscription are the same message sent
  twice, and the notice is the one the terms oblige"*) and its `distinctFrom → SUB-163`, against
  SUB-163's *"above the generic pre-expiry reminder (TIM-63), which is suppressed for a term end
  that is a renewal decision"* and its own `distinctFrom → TIM-63`. The settled "Subscription
  Renewal > generic Expiry Reminder" decision holds, from both sides.
- **TIM-268 ↔ TIM-63 — resolved but one-sided.** TIM-268 defers in precedence and in a
  `distinctFrom` row. TIM-63 never mentions TIM-268. Safe direction (the loser speaks), but see
  the systemic finding below.
- **TIM-274 ↔ ACC-261 — already resolved.** Reciprocal precedence, TIM-274 `s.g6` (*"One narrator
  per state, in order"*), ACC-261 `distinctFrom → TIM-274`. The settled "Payment Failure → Grace
  Period → Access Restriction" ordering holds.
- **TIM-274 ↔ TIM-281 — already resolved, and unusually well.** TIM-281 declares
  `competition: "none"` and is right to: it is gated by state, not by contest. `s.g5`: *"An open
  grace period owns the holder. This journey starts only once grace has closed at its recorded
  end, or where no grace period was granted at all."* TIM-274 states it back in `distinctFrom →
  TIM-281`, including the reason the pair matters (*"they would name two routes back to one entity
  from two different reads of the rules"*).
- **TIM-281 ↔ TIM-63 — already resolved.** TIM-281 `distinctFrom → TIM-63` draws the before/after
  expiry line. One-sided in documentation, safe in effect.
- **TIM-61 ↔ TIM-63 — already resolved.** Reciprocal in substance via TIM-61's `distinctFrom →
  TIM-63` (*"A deadline is a moment by which something must be done. An expiry is a moment at
  which something stops being valid"*) and TIM-63's own scope. Different entity keys
  (`obligation_id` vs `entity_ref + validity_id`); not a contest.
- **TIM-61 ↔ TIM-274 / TIM-281, TIM-63 ↔ TIM-274 — not a collision.** Different entities and
  different states (pre-deadline, pre-expiry, in-grace, post-expiry). The chain is narrated
  state-by-state and TIM-274 `s.g6` names the narrator for each.

### The systemic finding in this set — TIM-268's generic eligibility

TIM-268's `s.g6` reads: *"A type-specific journey owns the obligation wherever one exists. This
journey starts only where no more specific public journey already owns the reminder for that
obligation's own type, and it is suppressed for any obligation one of them holds."* Its
`distinctFrom` names **eleven** journeys, of which eight are public: TIM-61, TIM-63, DOC-215,
REL-284, ACC-263, RLT-279, SCH-266, ACT-13, FBK-49.

**Only TIM-61 is in TIM-268's exclusion group.** For the other eight, nothing enforces the
deference: they are not in `obligation-reminder`, so the contest mechanism cannot see them, and
none of the eight names TIM-268 anywhere — verified by scanning every suppression, eligibility
clause and `distinctFrom` row in all 69 (TIM-268 is named in a suppression by exactly one
journey, TIM-61). TIM-268 is therefore the largest one-sided cluster in the corpus: **eight
public silent sides**, each of which could send a type-specific reminder while the generic one
sends its own about the same obligation. §3, **P1-4**.

---

## 1.9 Payment Failure · Reservation Payment Reminder · Grace · Access Restriction — 6 pairs

| journey | `contact.competition` | entity | instanceKey |
|---|---|---|---|
| FIN-134 Payment Failure Recovery | **`"none"`** | the failed attempt, the obligation behind it and the customer relationship | `obligation_id` |
| SCH-303 Reservation Payment Reminder | `booking-lifecycle` / `reservation` / *"second in the booking-lifecycle group: below the booking outcome notice (SCH-277) … and above the readiness reminder (SCH-266) and the pre-arrival notice (SCH-304) - a reservation that may be released outranks anything about preparing for it or turning up to it"* / `suppressed` | one confirmed reservation whose standing depends on a payment | `booking_id` |
| TIM-274 Grace Period Recovery | as quoted in §1.8 | the entity whose validity ended, plus the grace window | `entity_ref + grace_period_id` |
| ACC-261 Access Restriction Notice | `access-consequence-narration` / `account` / *"highest in the group … from the moment it stands this journey owns what the holder is told, and the recovery journeys that ran ahead of it, grace recovery (TIM-274) among them, stop"* / `suppressed` | person or account plus the specific restriction | `account_id + restriction_id` |

- **TIM-274 ↔ FIN-134 — already resolved.** The one pair FIN-134 does state. TIM-274's precedence
  and `s.g6` name FIN-134; FIN-134's `distinctFrom → TIM-274` names it back (*"Recovery messaging
  about the obligation stops at that handoff rather than running beside it"*).
- **TIM-274 ↔ ACC-261 — already resolved** (§1.8).
- **FIN-134 ↔ ACC-261 — not a collision, mediated.** Different entities (`obligation_id` vs
  `account_id + restriction_id`) and never simultaneous: FIN-134 hands to grace/restriction and
  stops. Neither names the other; the ordering is stated in full only by TIM-274, the journey
  that sits between them, and `TIM-274 s.g6` is an honest statement of the whole chain. P3
  documentation only.
- **SCH-303 ↔ FIN-134 — resolved but one-sided, and the one-sidedness has teeth.** SCH-303 states
  the boundary four times: `s.failure-not-ours` (*"An attempted payment that actually failed is
  not a reminder problem. Ownership of the money moves to payment recovery (FIN-134), and this
  journey stops talking about the payment rather than running alongside it."*), a `distinctFrom →
  FIN-134` row, its trigger's `insufficientAlone` (*"a payment that has already been attempted and
  declined, which is payment recovery's subject"*), and a handoff `h.payment-failure → FIN-134`
  carrying *"the release point the booking terms assert, which is the consequence recovery has to
  work inside"*.
  **FIN-134 says nothing back.** It declares `contact.competition: "none"`, has no rule about what
  it may say concerning a reservation, and — decisively — its `s.hard-gates` reads *"Hard gates
  (GLB-31) apply. **Pressure caps do not**: this is transactional communication about an
  obligation the person already holds, and it is deduplicated by obligation and touch rather than
  rationed."* So the journey that receives ownership of the money is uncapped, declares no
  contest, and carries no rule stopping it from restating the release deadline SCH-303 handed it.
  This is not a documentation gap; it is an unbounded sender at the end of a one-way transfer.
  §3, **P0-1**.
- **SCH-303 ↔ TIM-274, SCH-303 ↔ ACC-261 — not a collision.** Different entities (`booking_id` vs
  `entity_ref + grace_period_id` / `account_id + restriction_id`) and different scope instances: a
  reservation is not an account-level access state. Nothing is owed.

---

## 1.10 Order Confirmation · Delivery Tracking · Post-Purchase Follow-Up — 3 pairs

| journey | `contact.competition` | entity | instanceKey |
|---|---|---|---|
| FUL-301 Order Confirmation | `post-purchase-welcome` / **`person`** / *"highest in the post-purchase-welcome group - the order's own confirmation answers the question the post-purchase follow-up and the first-purchase welcome both assume has been answered, so both of them wait behind it rather than beside it; being transactional it is never itself deferred, and the contest is declared here so the other two have a named side to defer to"* / `suppressed` | one accepted fulfillment obligation | `obligation_id` |
| FUL-265 Delivery Tracking | `"none"` | the dispatched obligation, its recipient, and the acceptance window | `obligation_id + person_id` |
| FUL-291 Post-Purchase Follow-Up | `post-purchase-welcome` / **`person`** / *"above the first-purchase welcome for the same person … below the order's own confirmation (FUL-301), which answers what the business took on before this journey explains what to do with it, and below every remedy journey on the same order, which ends this one rather than queueing it"* / `suppressed` | one completed fulfillment | `person_id + fulfillment_id` |

- **FUL-301 ↔ FUL-291 — already resolved.** Reciprocal precedence, FUL-291 `s.confirmation`
  (*"This journey never confirms the order"*), FUL-301 `s.status` (*"This journey never reports
  progress"*), reciprocal `distinctFrom`. FUL-301's closing clause — *"the contest is declared
  here so the other two have a named side to defer to"* — is the clearest statement of reciprocity
  anywhere in the corpus and should be treated as the house style.
- **FUL-301 ↔ FUL-265 — already resolved, without a group.** FUL-301 `s.status` names FUL-265 and
  FUL-146 as the owners of position and lateness; FUL-265 `distinctFrom → FUL-301` (*"it never
  re-confirms the order, and the confirmation never reports a position"*); FUL-301 `distinctFrom →
  FUL-265`. Correctly out of the group: FUL-265 speaks during the fulfilment, the group contests
  the moment the record opens.
- **FUL-265 ↔ FUL-291 — resolved but one-sided.** FUL-291 states it twice (`s.status` and
  `distinctFrom → FUL-265`: *"This journey opens only once it has stopped moving, and never
  mentions where it was"*). **Silent side: FUL-265.** Safe direction; §3, D-15.

### The group-scope contradiction (F7, re-verified and sharpened)

`post-purchase-welcome` declares `scope: "person"`, but its three members key on `obligation_id`,
`person_id + fulfillment_id` and `person_id`. The prose disagrees with itself about which instance
the contest resolves on:

- FUL-291: *"below **the order's own confirmation** (FUL-301)"* — reads as instance-scoped.
- RET-290: *"below **the post-purchase follow-up on the same person's order**"* — reads as
  person-scoped, explicitly.

Under GLB-08 (*"Winning ownership of one order does not suppress a journey about another"*) the
`person` scope means a repeat customer whose order B is confirmed has the order-A follow-up
suppressed. That may be the intended contact-pressure judgment — FUL-301 is transactional and
cannot wait — but **no field says so**, and one member's own precedence text says the opposite.
Not a wording nicety: it is the difference between an ownership claim over another order and a
noise judgment. §3, **P2-1**.

---

## 1.11 Delivery Delay · Failed Delivery Recovery — 1 pair

| journey | `contact.competition` | entity | instanceKey |
|---|---|---|---|
| FUL-146 Delivery Delay Alert | `"none"` | the obligation and its timing commitment, with the history of what was promised | `obligation_id` |
| FUL-148 Failed Delivery Recovery | `"none"` | the individual delivery attempt and the obligation it was serving | `delivery_attempt_id` |

**Real unstated collision.** Both are `service`, both message the recipient (email, sms) about the
same physical obligation, and neither names the other in any field. FUL-148 carries **no
`distinctFrom` rows at all** and no suppression referring to any other journey.

The narrator-per-state discipline exists here but stops one journey short. FUL-146 `s.g5`: *"Once
the obligation is handed to a delivery executor, an in-transit slip on the same obligation is
FUL-265's delay-or-tracking state to hold and report; this journey does not open a second,
competing delay narrative about a slip FUL-265 is already tracking under its own wait."*
FUL-265 `s.g6` states the reciprocal. But FUL-265 hands to FUL-148 at `x.unresolved` and **exits**.
From that moment FUL-265 is no longer "tracking the slip under its own wait", so FUL-146's
exclusion no longer bites — and a failed delivery attempt is, by definition, a material slip
against the timing commitment that is FUL-146's trigger. The recipient can receive *"we attempted
delivery and could not complete it — here is what to correct"* from FUL-148 and *"your delivery is
running late"* from FUL-146 about one obligation on the same day, from two senders neither of
which knows the other exists. §3, **P1-5**.

---

## 1.12 Booking Confirmation · Appointment Reminder · Pre-Arrival — 3 pairs

All three are `exclusionGroup: "booking-lifecycle"`, `scope: "reservation"`,
`onLoss: "suppressed"`, `priority: service`.

**SCH-277 Booking Confirmation** (`booking_id`): *"highest in the booking-lifecycle group: while
the requested time has not yet become a commitment, nothing else may speak to the requester about
this booking - the reservation payment reminder (SCH-303), the readiness reminder (SCH-266) and
the pre-arrival notice (SCH-304) are all suppressed for it, because each of them presumes a
commitment this journey has not yet established"*

**SCH-266 Appointment Reminder** (`booking_id + occurrence_id`): *"third in the booking-lifecycle
group: below the booking outcome notice (SCH-277) … and below the reservation payment reminder
(SCH-303) … and above the pre-arrival notice (SCH-304), which is suppressed while a prerequisite
that could stop the service is still outstanding, since the at-risk notice restates the time and
the place itself"*

**SCH-304 Pre-Arrival Preparation** (`booking_id + occurrence_id`): *"lowest in the
booking-lifecycle group: the booking outcome notice (SCH-277), the reservation payment reminder
(SCH-303) and the readiness reminder (SCH-266) all outrank it … and each of those journeys
restates the time and the place itself, so a suppressed arrival message loses nothing the holder
needed"*

**All three pairs — already resolved.** The four-member group carries a total order with no ties:
SCH-277 > SCH-303 > SCH-266 > SCH-304, and every member states its own rank naming every other
member by id. SCH-304 additionally carries `s.contest`, and SCH-303 carries a `s.contest` naming
SCH-277. The clause *"a suppressed arrival message loses nothing the holder needed"* is the
loser's-cost statement GLB-05 wants and almost nothing else in the corpus supplies. The settled
`booking-lifecycle` ordering holds. Documentation asymmetries only (SCH-266 has no `distinctFrom`
row for any group member; SCH-303 has none for SCH-304) — §3, D-16.

### One journey stands beside the group without saying so

**SCH-280 No-Show Follow-Up** keys on `booking_id + occurrence_id` — the same instance key as
SCH-266 and SCH-304 — is `service`, messages the same holder about the same occurrence, and
declares `contact.competition: "none"` with no group. SCH-277's precedence claims *"nothing else
may speak to the requester about this booking"* while the commitment is unestablished, which by
its own words binds SCH-280; SCH-280 never acknowledges it. In practice the pair cannot contest —
SCH-280 opens only once the window has closed with nobody there, strictly after every
booking-lifecycle member has finished — so this is a stated-boundary gap, not a hazard. §3,
**P2-3**.

---

## 1.13 Loyalty Welcome · Nurture · Reward Confirmation · Tier Upgrade — 6 pairs

All four are `exclusionGroup: "membership-standing"`, `scope: "subscription"`.

**SUB-298 Reward Confirmation** (`reward_id`, `transactional`, `onLoss: "superseded"`): *"highest
in the group - a state the membership has actually reached outranks every marketing-shaped message
about it, so the welcome, the tier announcement and the nurture are all suppressed for a
membership this journey is holding; it yields to nothing in this group and loses only to a newer
authoritative state for the same reward"*

**SUB-299 Loyalty Tier Upgrade** (`tier_change_id`, `lifecycle`, `suppressed`): *"below the reward
confirmation on the same membership, which is a state the record reached and outranks an
announcement about standing; above the membership welcome and the membership nurture, both of
which are suppressed while this journey holds the membership because a standing that has just
moved is the more current thing to say"*

**SUB-296 Loyalty Program Welcome** (`membership_id`, `lifecycle`, `suppressed`): *"below the
reward confirmation and below the tier change on the same membership - a state the membership has
actually reached outranks an introduction to it; above the membership nurture, which is suppressed
for a membership this new because a member who has not yet been welcomed cannot be nurtured"*

**SUB-297 Loyalty Program Nurture** (`membership_id + unused_subject_id`, `promotional`,
`suppressed`): *"lowest in the group - a reward the membership has earned, a change in its
standing and the welcome that opens it all outrank a reminder that something already held has gone
unused; while any of them holds the membership, this journey is suppressed for it"*

**All six pairs — already resolved.** A complete, consistent total order
(SUB-298 > SUB-299 > SUB-296 > SUB-297) with every member stating its own rank and naming what it
ranks against. `onLoss: "superseded"` on SUB-298 alone is the correct GLB-05 distinction, not an
inconsistency: a reward that a newer authoritative state replaces is superseded, not merely
quietened. Reciprocal `distinctFrom` on SUB-296↔SUB-297, SUB-297↔SUB-298 and SUB-298↔SUB-299. One
documentation asymmetry: SUB-299 names SUB-296 and SUB-296 does not name SUB-299 (§3, D-17).

**RET-290 ↔ SUB-296 — checked and already resolved**, because it is the pair most likely to look
like a collision. Both open on a person's first commercial moment and both are `lifecycle`. Their
reciprocal `distinctFrom` rows are the corpus's cleanest entity separation: SUB-296 — *"Where
somebody enrols at the moment they first buy, both are true at once and neither carries the
other's message: this journey owns the first-purchase moment and never explains the membership,
and SUB-296 owns the membership and never makes the bounceback."* Different entities
(`person_id` vs `membership_id`), so not one contest. Correct.

---

# 2. Collisions found outside the assigned list

## 2.1 SCH-282 is a silent member of `commerce-recovery` — the group's remaining stranger

`contact.competition` for **SCH-282 Availability Search Abandonment** (`person_id +
availability_query_id`): `commerce-recovery` / `person` / *"below process recovery and selection
recovery; alongside interest recovery - an availability enquiry that asked for a specific window
outranks inferred interest for the same person"* / `suppressed`.

Against **RET-31** (`person_id + need_key`): `commerce-recovery` / `person` / *"below process
recovery and selection recovery for the same person; above interest recovery"* / `suppressed`.

Three separate defects, all live:

1. **RET-31 ↔ SCH-282 is a genuine tie.** Both texts place themselves at the identical rank —
   below process and selection recovery, above interest recovery — neither names the other, and
   both are `onLoss: "suppressed"`. On a contest each defers and neither sends. This is the
   two-bottoms deadlock Fix 2 repaired between ACQ-13 and ACQ-289, still present one rank higher
   in the same group.
2. **SCH-282 names no journey in its precedence and carries no contest suppression.** Its six
   suppressions are `s.g1`–`s.g5` and `s.sunset`; not one mentions `commerce-recovery` or any
   member of it. Every other member of the eight-member group carries an explicit `s.contest` (or
   `s.generic` / `s.specialised`) enumerating who suppresses it. SCH-282's group membership is
   stated in exactly one field and enforced in none.
3. **No graph-level re-check.** Its only gate is `c.permitted` — *"May an unprompted offer be sent
   to this person at all?"* — a permission question, not a competition re-read. ACQ-289 and RET-31
   both carry `c.sendable` gates.

ACQ-289's repaired precedence asserts it is *"below the rest of the commerce-recovery group"*,
which includes SCH-282; SCH-282 never says it outranks ACQ-289. And its own wording is internally
at odds — *"alongside interest recovery"* followed by *"outranks inferred interest"*. §3,
**P0-3** and **P2-5**.

## 2.2 FIN-134 is the corpus's largest unreciprocated ownership sink

`contact.competition: "none"`. Counted across all 69: **five public journeys hand FIN-134
ownership or declare they stop where it begins** — ACQ-11 (`h.payment`), ACQ-287 (`h.payment`),
SCH-303 (`h.payment-failure`), TIM-274 (precedence + `s.g6`), FIN-302 (`distinctFrom`). FIN-134's
own `distinctFrom` names **OPS-124 and TIM-274** and nothing else. Three of the five handoffs into
it are unacknowledged.

This is F6 of the previous review, re-verified and found **wider than reported**: F6 named SCH-303
and FIN-302; the handoff scan adds ACQ-11 and ACQ-287. Combined with §1.9's observation that
FIN-134 disables pressure caps and declares no contest, it is the single place where the most
ownership converges on the least-stated journey. §3, **P0-1**.

## 2.3 TIM-268 and FIN-134 share an instance key and neither knows it

Both key on **`obligation_id`**. TIM-268's trigger is *"an authoritative record that a defined
action is owed by a named person"* with *"a due date recorded against it"*; its `insufficientAlone`
does not exclude a payment. FIN-134's is *"a payment system stating that the attempt failed"*.
An unpaid amount past its due date with no attempt yet made is squarely TIM-268's; the same
obligation after a declined attempt is squarely FIN-134's. Neither names the other; they share no
group; TIM-268's `distinctFrom` names FIN-131 (the archived obligation-state journey) but not
FIN-134. The boundary is real, obvious and written nowhere. §3, **P1-6**.

Five public journeys key on `obligation_id`: TIM-61, TIM-268, FIN-134, FUL-146, FUL-301. The
other pairs among them are **not** collisions and it is worth saying why: FUL-301 and FUL-146's
obligation is the business's obligation to *deliver*; FIN-134's is the customer's obligation to
*pay*; TIM-61/TIM-268's is a customer-owed *action*. FUL-301 states the distinction itself in
`distinctFrom → FIN-131`: *"FIN-131 opens the obligation to pay that arises from the same event.
This opens the obligation to deliver. They fail independently, and confirming one has never
confirmed the other."* That sentence is the whole answer, and it exists on only one of the five.

## 2.4 Commerce-recovery defers to retention-outreach, and retention-outreach has never heard of it

Six journeys (ACQ-11, ACQ-12, ACQ-13, ACQ-287, ACQ-288, RET-31) carry an `s.contest` of the form
*"…or a retention-outreach journey on the same person/account outranks this journey"*. **No member
of `retention-outreach` states the reciprocal.** The two groups also disagree on scope:
`commerce-recovery` contests at `person`, `retention-outreach` at `account`, so the deference
crosses a scope boundary with nothing defining how a person maps to an account for this purpose.
Safe in direction — the loser speaks — but it is six one-sided rows all pointing the same way, and
the group they point at has three members claiming to be its bottom (§1.5). §3, **P2-2**.

## 2.5 Four precedence statements defer to phrases that name no journey

RET-24, RET-30, ACT-17 and ACT-18 each rank themselves below *"an open issue under human
ownership"* and/or *"a live risk case"*. Neither phrase is a journey id. *"A live risk case"* is
RET-24 and should say so. *"An open issue under human ownership"* is ambiguous between REM-151
(public, `service-request`) and FBK-46 Complaint Resolution (not public). Everywhere else in this
corpus a precedence names its counterpart by id; these four do not, and one of them (RET-30) has
no `s.contest` to fall back on. §3, **P2-6**.

## 2.6 `lifecycle-stage` is the least-stated group in the corpus

Two members. **ACT-12** (`account_id + onboarding_instance_id`, `lifecycle`): *"below the
authoritative activation event, which supersedes it wherever it sits"* — that names an **event**,
not a journey, so ACT-12's competition block contains no journey ordering at all. **ACT-20**
(`lead_id + context_id`, `promotional`, `onLoss: "exit"`): *"lowest in the group - any current
lifecycle on the same person outranks reactivation"*. Neither names the other, the entities are a
lead and an account, and the declared group scope is `person`. `ACT-20 h.onboarding → ACT-12`
exists and ACT-12 does not acknowledge it. The group as declared binds two journeys that never
contest and states no ordering between them. §3, **P2-7**.

## 2.7 RET-26 Service Recovery is named by one journey in the whole library

`contact.competition: "none"`, no group, no `distinctFrom` rows at all. It is named only by
CON-300. Its `s.duplicate` — *"Another recovery process already handling this failure owns it;
this instance defers and nothing is sent"* — names nobody; REM-151's `s.g4` — *"An existing case
covering the same obligation suppresses a second recovery lifecycle"* — also names nobody. RET-26's
evidence explicitly includes *"a failed fulfilment"*, which is also REM-151's subject once the
recipient reports it. The deferral direction happens to be safe (RET-26 always yields), so this is
P3 rather than P1, but it means the library's general-purpose service-recovery journey is
invisible to every journey that says it defers to "a recovery process already handling this". §3,
**P3, D-18**.

## 2.8 FUL-301 vs SCH-277 — F5, re-verified and still entirely unstated

FUL-301 `distinctFrom`: FUL-265, FUL-146, FUL-291, RET-290, FIN-131. SCH-277 `distinctFrom`:
SCH-173. Neither mentions the other; neither `contact.competition` mentions the other's group.
A business that sells a reservation as an order opens both records on one transaction and confirms
both, and nothing in either journey says whether a reservation is a fulfilment obligation. F5's
proposed wording is still the right fix; carried forward unchanged as §3, **P1-7**.

---

# 3. Prioritised defect list

Severity-ordered. Each names the journey, the field and the sentence.

## P0 — a contest that resolves to silence, or an uncapped sender with no boundary

### P0-1 · FIN-134 accepts ownership from four journeys and states nothing back
**Journeys:** FIN-134 (silent side), ACQ-11, ACQ-287, SCH-303, FIN-302 (all already speaking).
**Why P0, not documentation:** FIN-134 declares `contact.competition: "none"` and
`s.hard-gates` explicitly removes pressure caps. Every journey that hands it the money stops
speaking; nothing in FIN-134 says what it may not speak about in return.

- `FIN-134.distinctFrom` += `{ journey: "SCH-303", because: "SCH-303's subject is a reservation
  that is still standing and whether it survives; the payment is a condition on it. This journey's
  subject is the obligation itself, from the moment an attempt actually failed. SCH-303 hands the
  money here and stops speaking about it - this journey never speaks about the reservation, and
  the release point it is handed is a consequence to work inside rather than a deadline to
  restate." }`
- `FIN-134.distinctFrom` += `{ journey: "FIN-302", because: "This journey is money that failed to
  come in and an obligation that stays open. FIN-302 is money going back out against an obligation
  already discharged. The two share a payment record and nothing else, and neither ever announces
  the other's movement." }`
- `FIN-134.distinctFrom` += `{ journey: "ACQ-287", because: "ACQ-287 recovers a checkout nobody
  finished. This opens only where a checkout was finished and the payment against it failed - its
  own handoff is what ends that journey, and this one never returns to the cart or the items." }`
  (and the same row for **ACQ-11**, reading *"a resumable process"* for *"a checkout"*).
- `FIN-134.suppressions` += `CANONICAL_RULE`, id `s.subject`: *"This journey speaks about the
  obligation and the corrective action, and about nothing the obligation was for. A reservation
  that may be released, a checkout that was abandoned, a process that was left open - each belongs
  to the journey that handed the money here, and each of those stops speaking about the money for
  the same reason. A release point or a resume destination received at a handoff is a consequence
  to work inside, never a deadline for this journey to restate."*

### P0-2 · `retention-outreach` has three members claiming its bottom; RET-30 and ACT-18 deadlock
**Journeys:** RET-30 and ACT-18 (the unresolved pair); RET-32 (third bottom claim, resolves itself
in prose only).
**The defect:** RET-30 yields to *"any live risk case or open issue"* — ACT-18 is neither. ACT-18
yields to *"an open issue under human ownership, a live risk case or a declared cancellation
intent"* — RET-30 is none of those. Both `onLoss: "suppressed"`. Both account-scoped. GLB-02
forbids resolving this at runtime.

Which one wins is a product call, exactly as ACQ-289/ACQ-13 was. The ordering the two journeys'
own reasoning implies is **RET-30 above ACT-18**: RET-30 is following up an intervention the
business actually delivered against a declared retention episode, where ACT-18 is a nudge into an
inferred stall — and RET-30's `s.g2` requires a declined offer to be remembered for the whole
cancellation episode, which a suppressed follow-up would break.

- `RET-30.contact.competition.precedence` — replace *"lowest in the group - any live risk case or
  open issue on the same account outranks it"* with: *"below the declared cancellation intent
  (RET-28), any live risk case (RET-24) and any open issue under human ownership on the same
  account; above the adoption recovery nudge (ACT-18), because an intervention the business
  actually delivered has an outcome to establish where a stall has only an inference, and a
  follow-up suppressed here loses the record of what was declined."*
- `RET-30.suppressions` += `CANONICAL_RULE`, id `s.contest`: *"This journey ranks below the
  declared cancellation intent (RET-28) and the live risk case (RET-24) in the retention-outreach
  group and above the adoption recovery nudge (ACT-18); while either of the first two holds the
  account this journey's touch is deferred and re-evaluated against current state (GLB-06), and
  while this journey holds a retention episode ACT-18 is suppressed for the same account."*
  (RET-30 currently has **no** `s.contest` at all — it is the only member of its group in that
  position other than RET-24, which sends nothing.)
- `ACT-18.contact.competition.precedence` — replace *"lowest in the group"* with an ordering that
  names what it ranks below: *"lowest in the group - a declared cancellation intent (RET-28), a
  live risk case (RET-24), an open issue under human ownership and a retention intervention
  awaiting its outcome (RET-30) all outrank a recovery nudge; where any of them holds the account
  this journey is suppressed for it rather than queued behind it."*
- `ACT-18.suppressions[s.contest].text` — extend the enumeration past *"an open issue under human
  ownership, a live risk case or a declared cancellation intent"* to include RET-30 by id.
- `RET-32.contact.competition.precedence` — drop the bare *"lowest in the group"* opening in favour
  of the enumeration it already contains, so that exactly one member claims the bottom.

### P0-3 · `commerce-recovery`: RET-31 and SCH-282 claim the same rank and both yield
**Journeys:** RET-31, SCH-282. Both `onLoss: "suppressed"`, both *"below process recovery and
selection recovery"*, neither naming the other.

The ordering both texts imply is **SCH-282 above RET-31**, on the group's own running rationale:
an availability enquiry is a question the person actually asked about a stated window, where a
predicted need is computed from history and confirmed by nobody. That is the same reasoning
ACQ-289's repaired precedence already cites SCH-282 for.

- `SCH-282.contact.competition.precedence` — replace *"below process recovery and selection
  recovery; alongside interest recovery - an availability enquiry that asked for a specific window
  outranks inferred interest for the same person"* with: *"below checkout recovery (ACQ-287), the
  generic process pattern (ACQ-11), the held cart (ACQ-288) and the held selection (ACQ-12) for
  the same person; above predicted-need replenishment (RET-31), the back-in-stock alert (ACQ-289)
  and inferred-interest recovery (ACQ-13), because an availability enquiry for a stated window is a
  question the person actually asked, where a predicted need is computed from history and an
  inferred interest was never confirmed at all. Where a higher-precedence member holds the person
  this journey is suppressed for them rather than queued behind it."*
- `SCH-282.suppressions` += `CANONICAL_RULE`, id `s.contest`: *"A checkout recovery, a process
  recovery, a cart or selection recovery, an open complaint, an open payment recovery or a
  retention-outreach journey on the same person outranks this journey; its offer is deferred and
  re-evaluated against current state, not queued blindly (GLB-06). This journey in turn outranks
  predicted-need replenishment (RET-31), the back-in-stock alert (ACQ-289) and unresolved-interest
  recovery (ACQ-13), each of which is suppressed for a person this journey holds."*
  (SCH-282 is the only member of the eight with no contest suppression at all.)
- `RET-31.contact.competition.precedence` — replace *"below process recovery and selection recovery
  for the same person; above interest recovery"* with: *"below process recovery, selection
  recovery and the availability enquiry (SCH-282) for the same person - a question the person
  asked about a stated window outranks a need computed from their history; above the back-in-stock
  alert (ACQ-289) and inferred-interest recovery (ACQ-13)."*
- `RET-31.suppressions[s.contest].text` — add SCH-282 to the enumeration of journeys that outrank
  it.

## P1 — a real unstated collision between two sending journeys

### P1-1 · RET-31 vs RET-293 / RET-294: three purchase proposals, two groups, no ordering
`recommendation-offer` exists to stop two next-purchase proposals reaching one person at once.
RET-31 is a next-purchase proposal and sits outside it.

- `RET-31.contact.competition.precedence` — append (after the P0-3 rewrite): *"and above the
  recommendation-offer group (RET-293, RET-294) for the same person: a purchase the person's own
  history says is due is a stronger claim on the moment than a next step inferred from what they
  own or a set that resembles what they liked. While this journey holds a person, both of those
  are suppressed for them rather than queued behind them."*
- `RET-293.contact.competition.precedence` — append: *"and below predicted-need replenishment
  (RET-31), which is suppressed for nothing in this group but outranks both of its members: a
  purchase that is actually due outranks one that is merely plausible."*
- `RET-294.contact.competition.precedence` — append the same clause.
- `RET-293.suppressions[s.contest].text` and `RET-294.suppressions[s.contest].text` — add RET-31 by
  id to the enumeration.
- `RET-31.distinctFrom` += rows for **RET-293**, **RET-294**, **ACQ-289** and **RET-290**, each
  mirroring the row that already exists on the other side. RET-31 is named by four journeys and
  names none of them; this is the single largest hub asymmetry in the corpus and the one to do
  first.

### P1-2 · ACT-14 and ACT-19 share an instance key and say nothing about each other
`account_id + person_id`, both messaging the same person about the same onboarding, both
`competition: "none"`. ACT-12 already documents that the two are *"indistinguishable from the
account's side"*.

- `ACT-19.suppressions` += `CANONICAL_RULE`, id `s.struggling`: *"An open assisted-help session
  (ACT-14) for the same person suppresses this journey's question. Somebody who is visibly stuck
  and has asked for help is not also asked to describe their role; the question waits until that
  session resolves, and where the onboarding decision has already been defaulted by then, it is not
  asked at all."*
- `ACT-14.distinctFrom` += `{ journey: "ACT-19", because: "ACT-19 asks a question that decides the
  onboarding route, on an account that is progressing. This starts from help-seeking without
  progress. They key on the same person, and where both are true this journey holds the person:
  an offer of help and a profiling question in the same moment read as two senders, and the one
  that answers what the person is doing comes first." }`
- `ACT-19.distinctFrom` += the reciprocal row.

### P1-3 · ACT-13 and ACT-14 can both be true and neither yields
Both `service`, both messaging the same account about the same failure to activate, evidence
blocks that do not exclude each other.

- `ACT-14.suppressions` += `CANONICAL_RULE`, id `s.named-blocker`: *"Where a named mandatory
  requirement is established as the thing preventing activation, the blocker journey (ACT-13) owns
  the account and this journey does not open. An offer of help delivered beside an instruction to
  complete a named requirement is two senders answering one problem, and the one that can name the
  obstacle is the one worth hearing."*
- `ACT-13.distinctFrom[ACT-14].because` — extend the existing row with the consequence: *"…and
  where both are true - a named requirement outstanding and help being sought against it - this
  journey holds the account and the help offer is suppressed for it, because an obstacle with a
  name is answerable and a general offer of help is not."*
- `ACT-14.distinctFrom[ACT-13].because` — extend with the reciprocal sentence.

### P1-4 · TIM-268's deference is unenforced against eight public journeys
TIM-268 `s.g6` and `s.g7` defer to type-specific journeys; only TIM-61 is in its exclusion group,
and none of the other eight names it back.

For each of **TIM-63, DOC-215, REL-284, ACC-263, RLT-279, SCH-266, ACT-13, FBK-49**:

- `<journey>.suppressions` += `CANONICAL_RULE`, id `s.generic-reminder`: *"This journey owns the
  reminder for the obligation it holds. The generic outstanding-obligation reminder (TIM-268) is
  suppressed for that obligation while this instance holds it: one obligation is reminded of once,
  by whoever owns its type, and a generic reminder arriving after the specific one is not a later
  touch but a second sender."*
- `<journey>.distinctFrom` += a row naming TIM-268, mirroring the row TIM-268 already carries for
  it.

Declaring the eight into `obligation-reminder` would be the wrong fix and GLB-01/GLB-03 say why:
their lifecycles are unrelated, and a group added to make a suppression convenient is how unrelated
lifecycles start blocking each other.

### P1-5 · FUL-146 can open a delay narrative over an open FUL-148 recovery
FUL-146's `s.g5` excludes only slips FUL-265 is *"already tracking under its own wait"*, and
FUL-265 exits when it hands to FUL-148.

- `FUL-146.suppressions[s.g5].text` — extend: *"…and once the obligation is handed to failed
  delivery recovery (FUL-148) at that journey's own opening, the recipient is told about the timing
  from there: an attempt that actually failed is not a slip to narrate a second time, and this
  journey does not open against an obligation whose latest authoritative state is a failed
  attempt."*
- `FUL-148.suppressions` += `CANONICAL_RULE`, id `s.narrator`: *"While this journey holds a failed
  attempt, it is the one that tells the recipient about the obligation's timing. The delay alert
  (FUL-146) narrates a slip against the original commitment and the tracking journey (FUL-265)
  narrates position; neither runs beside this one on the same obligation, because what the
  recipient needs from here is the correction that would make the next attempt work."*
- `FUL-148.distinctFrom` += rows naming **FUL-146** and **FUL-265** (it currently has none at all).

### P1-6 · TIM-268 and FIN-134 share `obligation_id` and neither names the other
- `TIM-268.distinctFrom` += `{ journey: "FIN-134", because: "FIN-134 opens only where a payment
  system states that an attempt against the obligation actually failed, and it owns what is said
  about the obligation from that moment. This journey is the sending for an obligation that is
  merely outstanding - owed, due, and not yet attempted. Where a recorded failure exists, that
  journey holds the obligation and this one is suppressed for it." }`
- `TIM-268.suppressions[s.g6].text` — name FIN-134 among the type-specific owners.
- `FIN-134.distinctFrom` += the reciprocal row.

### P1-7 · FUL-301 and SCH-277 do not distinguish an order from a reservation (F5, unchanged)
Apply F5 of `audit/new-journey-collision-review.md` as written: the two reciprocal `distinctFrom`
rows and the extension to `FUL-301.suppressions[s.status]`. Re-verified against current data —
neither journey mentions the other in any field.

## P2 — a stated boundary that contradicts itself, or a group that binds what it does not order

### P2-1 · `post-purchase-welcome` declares `scope: "person"` while one member's precedence says "the order's own"
- `FUL-301.contact.competition.precedence` — append: *"The group's scope is the person rather than
  the order deliberately: two post-purchase messages arriving together are noise to the person
  whichever orders they belong to. It is a contact-pressure judgment, not an ownership claim over
  another order, and GLB-08 is not weakened by it - nothing here decides anything about the other
  order's own state."*
- `FUL-291.contact.competition.precedence` — replace *"the order's own confirmation (FUL-301)"*
  with *"a confirmation (FUL-301) for the same person, this order's or another's"*, so the prose
  and the declared scope agree.
- `FUL-291.suppressions` += `CANONICAL_RULE`, id `s.scope`: *"This journey defers to a confirmation
  for the same person even where that confirmation belongs to a different order. Two post-purchase
  messages in one moment are one too many, and the transactional one is the one that cannot wait."*

If person scope is **not** the intended behaviour, the group scope is wrong and this is a product
call rather than a wording change. Recorded as a finding either way.

### P2-2 · `commerce-recovery` → `retention-outreach` deference is stated only by the loser, across a scope boundary
Six `s.contest` rules defer to *"a retention-outreach journey"*; no member of that group
acknowledges it, and the two groups contest at different scopes (`person` vs `account`).
Minimum fix: add to **RET-24, RET-28, RET-30, RET-32 and ACT-18** a single shared clause in each
`s.contest` (RET-24 and RET-30 need the suppression created — see P0-2):
*"While this journey holds the account, every commerce-recovery journey addressed to a person on it
is suppressed for that person: a recovery prompt to buy again, sent to somebody the business is
currently trying to keep or is asking why they are leaving, is the wrong sender."*

### P2-3 · SCH-280 keys on a booking occurrence and stands outside `booking-lifecycle` silently
- `SCH-280.suppressions` += `CANONICAL_RULE`, id `s.after`: *"This journey opens only once the
  occurrence has passed with nobody there, which is why it is outside the booking-lifecycle group
  rather than at the bottom of it: the booking outcome notice (SCH-277), the reservation payment
  reminder (SCH-303), the readiness reminder (SCH-266) and the pre-arrival notice (SCH-304) have
  all finished by then, and nothing they own can still be said."*
- `SCH-280.distinctFrom` += rows naming **SCH-266** and **SCH-304**.

### P2-4 · ACT-17 recites the `retention-outreach` precedence without declaring the group
`ACT-17.suppressions[s.contest]` claims a contest nothing enforces. Either declare
`contact.competition` with `exclusionGroup: "retention-outreach"`, `scope: "account"` and a stated
rank (its handoff relationship with ACT-18 suggests directly above it), or rewrite `s.contest` so
it states a state gate rather than a group precedence: *"A live risk case, an open issue under
human ownership or a declared cancellation intent on the same account means adoption is not the
subject; the touch is deferred and re-evaluated against current state (GLB-06). This journey
declares no exclusion group: it hands the use-case to adoption recovery (ACT-18) rather than
contesting it."* The second is the smaller and more honest change.

### P2-5 · SCH-282's precedence contradicts itself in one sentence
*"alongside interest recovery - an availability enquiry that asked for a specific window outranks
inferred interest"*. Alongside and outranks cannot both be true. Resolved by the P0-3 rewrite.

### P2-6 · Four precedences defer to phrases that name no journey
`RET-24`, `RET-30`, `ACT-17`, `ACT-18` — replace *"a live risk case"* with *"a live risk case
(RET-24)"* and *"an open issue under human ownership"* with the journey id actually meant
(REM-151 where the issue is a reported problem with something delivered; otherwise state that the
referent is the human-owned complaint lifecycle rather than a library journey). Everywhere else in
this corpus a precedence names its counterpart by id.

### P2-7 · `lifecycle-stage` binds ACT-12 and ACT-20 and orders neither
- `ACT-12.contact.competition.precedence` — replace *"below the authoritative activation event,
  which supersedes it wherever it sits"* with a text that also states a journey ordering: *"below
  the authoritative activation event, which supersedes it wherever it sits; above dormant lead
  reactivation (ACT-20) for the same person, because an onboarding already in motion is a current
  lifecycle and reactivation is the attempt to start one."*
- `ACT-12.distinctFrom` += a row naming **ACT-20**, mirroring the `h.onboarding → ACT-12` handoff
  ACT-20 already carries.

## P3 — documentation symmetry with no ownership consequence

Each is one row on the silent side, mirroring a row that already exists. Listed so they can be
done in one pass.

| # | add to | naming | already stated on |
|---|---|---|---|
| D-9 | ACT-13 | ACT-12 | ACT-12 (`s.blocker`, `h.blocker`) |
| D-10 | ACT-14 | ACT-12 | ACT-12 (`s.assisted`) |
| D-11 | RET-28 | RET-32 | RET-32 (`s.recent`) |
| D-12 | FBK-43 | FBK-41, FBK-42, REM-151, REM-305 | all four |
| D-13 | ACT-17, ACT-18 | each other | neither |
| D-14 | ACQ-11 | ACQ-12 | ACQ-12 |
| D-15 | FUL-265 | FUL-291 | FUL-291 |
| D-16 | SCH-266 | SCH-277, SCH-303, SCH-304 | all three |
| D-17 | SUB-296 | SUB-299 | SUB-299 |
| D-18 | REM-151 | RET-26 (and RET-26 → REM-151) | neither |
| D-19 | ACQ-12, ACQ-13, RET-31 | ACQ-289 | ACQ-289 (F4 leftover) |
| D-20 | ACQ-285, RET-31 | RET-290 | RET-290 |
| D-21 | RET-290, SUB-163 | RET-292 | RET-292 |
| D-22 | RET-31, ACQ-13 | RET-293 | RET-293 |
| D-23 | RET-31, ACQ-288, RET-295 | RET-294 | RET-294 |
| D-24 | REM-157 | SUB-298 | SUB-298 |
| D-25 | RET-26 | CON-300 | CON-300 |
| D-26 | FIN-134 | FUL-301's obligation distinction | FUL-301 (`distinctFrom → FIN-131`) |
| D-27 | SCH-282 | ACQ-289 | ACQ-289 |
| D-28 | ACC-263, RLT-279, DOC-215, REL-284, SCH-266, ACT-13, FBK-49, TIM-63 | TIM-268 | TIM-268 (also P1-4) |

**Total one-sided `distinctFrom` rows between two public journeys, measured on current data: 52.**
The previous review counted 22 because it looked only at the seventeen Phase 25–33 additions. The
full-corpus count is the number to work against.

---

# 4. Checked and found correct

A review that names only problems cannot be told apart from one that stopped early.

1. **RET-24 should not be touched, for the third time.** No customer-facing channel at all; its
   `contact.competition` already orders it under RET-28 and over RET-30; `h.cancellation` carries
   an explicit `suppresses`. Every hazard a reader sees in its handoff nodes is already answered in
   its own competition block.
2. **`booking-lifecycle` is still the best-stated group in the corpus.** Four members, a total
   order with no ties, every member naming every other by id, and the loser's cost written down
   (*"a suppressed arrival message loses nothing the holder needed"*).
3. **`membership-standing` is internally complete.** All six ordered pairs agree;
   `onLoss: "superseded"` on SUB-298 alone is the correct GLB-05 distinction.
4. **`post-purchase-welcome` remains the model for declaring a contest from the winner's side** —
   *"the contest is declared here so the other two have a named side to defer to"*. The scope
   question (P2-1) does not weaken the ordering.
5. **`date-recognition` is stated three times from each side** — precedence, `s.contest` and
   reciprocal `distinctFrom` — and RET-292 names itself as the yielding side.
6. **`recommendation-offer`'s internal ordering is stated six times** and needs nothing.
7. **`service-request` is backed by a real edge**, `REM-305 h.owner → REM-151`, not only by
   precedence.
8. **`contactability-question`'s two senior members are `paused`, not `suppressed`** — correct
   under GLB-05, because both hold an obligation to the person that survives a loss.
9. **CON-300's `s.enforced` is right not to model the sunset as a competition group.** *"It is a
   standing state and not a contest: it decides who may be sent to afterwards, where a competition
   group decides only who asks the question now."* Do not "fix" this by grouping.
10. **F1 and F2 of the previous review are closed.** All nine journeys now read the sender-side
    suppression (verified against current `eligibility` + `suppressions`).
11. **F3 is closed.** FIN-302 ↔ REM-305 is reciprocal in `distinctFrom`, in `REM-305 s.money` and
    in `FIN-302 s.decision`. The settled "FIN-302 owns the refund message, REM-305 does not state
    it" decision holds, and REM-305's row is unusually good: it states that the two are *not* in
    contest and share no group, and why suppressing either would leave the person with half the
    story.
12. **F4's precedence half is closed.** ACQ-289 and ACQ-13 now state a single ordering from both
    sides. Only the three `distinctFrom` rows remain (D-19).
13. **The settled decisions all still hold**, each verified from both sides in §1: cart > generic
    selection, checkout > generic process, payment failure takes ownership from checkout recovery,
    ACQ-285 before ACQ-09, specific deadline > TIM-268, SUB-163 > TIM-63, FIN-134 → grace →
    ACC-261, ACQ-289 > ACQ-13, CON-300 ≠ RET-32, RET-290 ≠ FUL-301, FIN-302 owns the refund.
14. **RET-290 vs SUB-296 is not a collision**, and their reciprocal rows are the corpus's cleanest
    entity separation — a first purchase and a membership enrolment can be one moment and are two
    entities.
15. **FUL-146 ↔ FUL-265 is resolved without a group or a `distinctFrom` row**, by reciprocal
    suppressions (`s.g5` / `s.g6`) that name each other. Proof that the mechanism is not the point;
    the reciprocity is.
16. **TIM-281 is right to declare `competition: "none"`.** It is gated by state, not by contest,
    and `s.g5` says so.
17. **The five `obligation_id` journeys are not five collisions.** Delivery obligation, payment
    obligation and customer-owed action are three entities that happen to share a key name; only
    TIM-268 ↔ FIN-134 is a real overlap (P1-6).
18. **ACQ-285 ↔ ACQ-09 shows a boundary can be complete with no competition block on either side.**
    Both declare `"none"` and the ownership is total.

---

# 5. Summary

| set | pairs | already resolved | resolved but one-sided | real unstated collision | not a collision |
|---|---|---|---|---|---|
| Abandonment quartet | 6 | 5 | 1 | 0 | 0 |
| Lead welcome / nurture / interest | 3 | 1 | 0 | 0 | 2 |
| Onboarding quartet | 6 | 1 | 2 | 2 | 1 |
| Adoption pair | 1 | 1 | 0 | 0 | 0 |
| Retention + sunset | 10 | 8 | 0 | 1 | 1 |
| Replenishment / recs / cross-sell | 3 | 1 | 0 | 2 | 0 |
| Feedback trio | 3 | 1 | 2 | 0 | 0 |
| Deadline / expiry / grace | 10 | 7 | 1 | 0 | 2 |
| Payment / reservation / grace / restriction | 6 | 2 | 1 | 0 | 3 |
| Order / tracking / follow-up | 3 | 2 | 1 | 0 | 0 |
| Delay / failed delivery | 1 | 0 | 0 | 1 | 0 |
| Booking trio | 3 | 3 | 0 | 0 | 0 |
| Loyalty quartet | 6 | 6 | 0 | 0 | 0 |
| **assigned total** | **61** | **38** | **8** | **6** | **9** |
| found outside the list | 22 | 6 | 7 | 5 | 4 |
| **grand total** | **83** | **44** | **15** | **11** | **13** |

Defects by severity: **3 P0**, **7 P1**, **7 P2**, **20 P3 documentation rows** (52 one-sided
`distinctFrom` rows in total across the corpus).
